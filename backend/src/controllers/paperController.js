import QuestionPaper from '../models/QuestionPaper.js';
import User from '../models/User.js';
import { decryptApiKey } from './authController.js';
import mongoose from 'mongoose';

// Helper to find a paper for a given request (scoped to user or guest)
const findPaperForRequest = async (paperId, req) => {
  const query = { _id: paperId };
  if (req.user?.id) {
    // Authenticated users can access their own papers or public guest papers
    query.$or = [{ userId: req.user.id }, { userId: null }];
  } else {
    // Guests can only access guest papers
    query.userId = null;
  }
  return await QuestionPaper.findOne(query);
};

// Use stable model name instead of 'gemini-flash-latest' which may break
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Request timeout for Gemini API calls (ms)
const GEMINI_TIMEOUT_MS = 120000; // 2 minutes

// Helper to resolve the best API key: header > user stored > env default
const resolveApiKey = async (req) => {
  // Priority 1: Client-sent header override
  if (req.headers['x-api-key']) {
    return { key: req.headers['x-api-key'], source: 'header' };
  }

  // Priority 2: User's stored encrypted key in MongoDB
  if (req.user?.id) {
    try {
      const user = await User.findById(req.user.id);
      if (user?.apiKey) {
        const decrypted = decryptApiKey(user.apiKey);
        if (decrypted) {
          return { key: decrypted, source: 'stored' };
        }
      }
    } catch (e) {
      console.error('Error resolving stored API key:', e);
    }
  }

  // Priority 3: Server default env key
  if (process.env.GEMINI_API_KEY) {
    return { key: process.env.GEMINI_API_KEY, source: 'server' };
  }

  return { key: null, source: null };
};

// Helper to call Gemini API with rate limit detection, timeout, safety settings, and exponential backoff retry loop
const callGemini = async (prompt, apiKey) => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on server and no custom key provided.');
  }

  const cleanApiKey = apiKey.trim();

  // Enforce a max prompt length to prevent abuse (100K chars ~ many pages of text)
  if (prompt.length > 100000) {
    throw new Error('Prompt is too long. Please reduce the input size.');
  }

  const maxAttempts = 3;
  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

      const response = await fetch(`${GEMINI_API_URL}?key=${cleanApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Detect rate limit / quota exhaustion
      if (response.status === 429) {
        const errorBody = await response.text().catch(() => '');
        const error = new Error('API_KEY_QUOTA_EXHAUSTED: Your API key has exceeded its usage limit. Please check your Google AI Studio dashboard or wait for the quota to reset.');
        error.statusCode = 429;
        error.errorCode = 'API_KEY_QUOTA_EXHAUSTED';
        throw error;
      }

      // Handle invalid/revoked API key authentication failure
      if (response.status === 401) {
        const errorBody = await response.text().catch(() => '');
        const error = new Error('API_KEY_INVALID: The provided Gemini API key is invalid or has been revoked. Please check and update your API key in the Profile settings.');
        error.statusCode = 400; // Use 400 instead of 401 to prevent frontend JWT auto-logout
        error.errorCode = 'API_KEY_INVALID';
        throw error;
      }

      if (response.status === 403) {
        const errorBody = await response.text().catch(() => '');
        if (errorBody.includes('RESOURCE_EXHAUSTED') || errorBody.includes('quota') || errorBody.includes('rate limit')) {
          const error = new Error('API_KEY_QUOTA_EXHAUSTED: Your API key quota has been exhausted. Please upgrade your plan in Google AI Studio or wait for the quota to reset.');
          error.statusCode = 429;
          error.errorCode = 'API_KEY_QUOTA_EXHAUSTED';
          throw error;
        }
        if (errorBody.includes('API_KEY_INVALID') || errorBody.includes('invalid') || errorBody.includes('UNAUTHENTICATED')) {
          const error = new Error('API_KEY_INVALID: The provided API key is invalid. Please check your API key in your profile settings.');
          error.statusCode = 400; // Use 400 instead of 401 to prevent frontend JWT auto-logout
          error.errorCode = 'API_KEY_INVALID';
          throw error;
        }
        throw new Error(`Gemini API forbidden (403): ${errorBody}`);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        // Check response body for quota-related errors even on other status codes
        if (errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('quota')) {
          const error = new Error('API_KEY_QUOTA_EXHAUSTED: Your API key has exceeded its usage limit. Please check your Google AI Studio dashboard or wait for the quota to reset.');
          error.statusCode = 429;
          error.errorCode = 'API_KEY_QUOTA_EXHAUSTED';
          throw error;
        }
        if (errorText.includes('API_KEY_INVALID') || errorText.includes('invalid') || errorText.includes('UNAUTHENTICATED')) {
          const error = new Error('API_KEY_INVALID: The provided Gemini API key is invalid or has been revoked. Please check and update your API key in the Profile settings.');
          error.statusCode = 400; // Use 400 instead of 401 to prevent frontend JWT auto-logout
          error.errorCode = 'API_KEY_INVALID';
          throw error;
        }
        
        // Wrap 5xx server errors for retry triggers
        if (response.status >= 500) {
          const error = new Error(`Server error (${response.status}): ${errorText}`);
          error.isRetriable = true;
          throw error;
        }
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Failed to parse Gemini API response.');
      }

      if (!data.candidates || !data.candidates[0]) {
        throw new Error('Invalid response from Gemini API — no candidates returned.');
      }

      const candidate = data.candidates[0];
      if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
        if (candidate.finishReason === 'SAFETY') {
          throw new Error('Content generation was blocked by AI safety settings. Please try adjusting your parameters.');
        } else if (candidate.finishReason === 'RECITATION') {
          throw new Error('Content generation was blocked due to a citation/recitation check. Please try a different prompt.');
        } else {
          throw new Error(`Content generation failed: ${candidate.finishReason}`);
        }
      }

      if (!candidate.content) {
        throw new Error('No content returned from Gemini API candidates.');
      }

      const parts = candidate.content.parts;
      if (!parts || parts.length === 0) {
        throw new Error('No content parts returned from Gemini API.');
      }

      // Filter out thinking/reasoning parts (where part.thought === true) and join the text contents
      const textContent = parts
        .filter(part => !part.thought)
        .map(part => part.text || '')
        .join('')
        .trim();

      if (!textContent) {
        throw new Error('No text content returned after filtering thoughts.');
      }

      // Clean up response: Strip surrounding markdown code block wrapper backticks if Gemini wrapped it in ```markdown / ```
      let cleanText = textContent;
      if (cleanText.startsWith('```')) {
        const lines = cleanText.split('\n');
        if (lines[0].startsWith('```')) {
          lines.shift();
        }
        if (lines[lines.length - 1].startsWith('```')) {
          lines.pop();
        }
        cleanText = lines.join('\n').trim();
      }

      return cleanText;

    } catch (error) {
      lastError = error;

      if (error.name === 'AbortError') {
        lastError = new Error('Gemini API request timed out. Please try again.');
        lastError.isRetriable = true;
      }

      // Determine if error is non-retriable (API key invalidity or Safety block overrides)
      const isInvalidKey = error.errorCode === 'API_KEY_INVALID' || error.statusCode === 400;
      const isSafety = error.message.includes('safety') || error.message.includes('blocked');

      if (isInvalidKey || isSafety) {
        throw error;
      }

      // Stop retry checks once max limit exceeded
      if (attempt >= maxAttempts) {
        break;
      }

      // Wait with exponential backoff delay (1.5s, 3s)
      const delay = Math.pow(1.5, attempt) * 1000;
      console.warn(`Gemini API call failed (Attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms... Error: ${lastError.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Helper to call Gemini API with fallback retry and secondary API key attempts
const callGeminiWithFallback = async (prompt, req) => {
  const { key, source } = await resolveApiKey(req);
  
  if (!key) {
    throw new Error('Gemini API key is not configured on server and no custom key provided.');
  }

  try {
    return await callGemini(prompt, key);
  } catch (firstError) {
    // Fall back to server key if:
    // 1. The primary key was a custom key (either stored or from headers)
    // 2. We have a server-level default API key configured
    // 3. The server fallback key is different from the failed key
    if (source !== 'server' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== key.trim()) {
      console.warn(`Primary key (${source}) failed: ${firstError.message}. Trying server default fallback key...`);
      try {
        return await callGemini(prompt, process.env.GEMINI_API_KEY);
      } catch (fallbackError) {
        console.error('Server default fallback key also failed:', fallbackError.message);
        throw fallbackError;
      }
    }
    throw firstError;
  }
};

// Helper to send quota-aware error responses
const handleApiError = (error, res, defaultMessage) => {
  console.error(defaultMessage + ':', error.message || error);

  if (error.message?.startsWith('API_KEY_QUOTA_EXHAUSTED')) {
    return res.status(429).json({
      message: error.message.replace('API_KEY_QUOTA_EXHAUSTED: ', ''),
      errorCode: 'API_KEY_QUOTA_EXHAUSTED',
    });
  }

  if (error.message?.startsWith('API_KEY_INVALID')) {
    return res.status(400).json({
      message: error.message.replace('API_KEY_INVALID: ', ''),
      errorCode: 'API_KEY_INVALID',
    });
  }

  return res.status(500).json({ message: error.message || defaultMessage });
};

// @desc    Generate a new question paper and save to MongoDB
// @route   POST /api/papers
// @access  Private
export const generatePaper = async (req, res) => {
  try {
    const {
      subject,
      class: studentClass,
      totalMarks,
      difficulty,
      board,
      chapters,
      topics,
      instructions,
      pattern,
      customPatternDetails,
    } = req.body;

    if (!subject || !studentClass || !chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ message: 'Subject, class, and chapters (non-empty array) are required.' });
    }

    // Input length guards
    if (String(subject).length > 200) {
      return res.status(400).json({ message: 'Subject name is too long.' });
    }
    if (chapters.length > 50) {
      return res.status(400).json({ message: 'Too many chapters selected (max 50).' });
    }

    const cleanSubject = String(subject).trim().substring(0, 200);
    const cleanClass = String(studentClass).trim().substring(0, 50);
    const cleanChapters = chapters.map(c => String(c).trim().substring(0, 200));

    const requirements = [
      `- Total marks: ${totalMarks || 100}`,
      `- Difficulty level: ${difficulty || 'Medium'}`,
      `- Board/Book type: ${board || 'NCERT'}`,
      `- Pattern: ${pattern || 'Board-style'}`,
    ];

    if (pattern === 'Custom' && customPatternDetails) {
      requirements.push(`- Custom Pattern Details: ${String(customPatternDetails).substring(0, 2000)}`);
    }
    if (instructions) {
      requirements.push(`- Additional instructions: ${String(instructions).substring(0, 5000)}`);
    }

    const prompt = `Generate a ${cleanSubject} question paper for class ${cleanClass} based on chapters: ${cleanChapters.join(', ')}${topics ? ` with focus on: ${String(topics).substring(0, 2000)}` : ''}. 
  
Requirements:
${requirements.join('\n')}
  
Please format the question paper with:
1. Proper header with subject, class, time, and marks
2. Clear section divisions
3. Proper question numbering
4. Mark allocation for each question
5. Instructions for students
  
Important: Generate the FULL question paper with all necessary questions to meet the total marks. Do not use placeholders or summaries like "(...continue with more questions)". The paper must be complete and ready to use.
  
Make it look professional and exam-ready. Use proper markdown formatting for better readability.`;

    const content = await callGeminiWithFallback(prompt, req);

    // Save to MongoDB database
    const paperInstance = await QuestionPaper.create({
      subject: cleanSubject,
      class: cleanClass,
      totalMarks: Number(totalMarks) || 100,
      difficulty: difficulty || 'Medium',
      board: String(board || 'NCERT').trim().substring(0, 100),
      chapters: cleanChapters,
      topics: String(topics || '').substring(0, 2000),
      instructions: String(instructions || '').substring(0, 5000),
      pattern: String(pattern || 'Board-style').trim().substring(0, 200),
      questions: content,
      userId: req.user?.id || null,
    });

    res.status(201).json({
      id: paperInstance._id.toString(),
      subject: paperInstance.subject,
      class: paperInstance.class,
      totalMarks: paperInstance.totalMarks,
      difficulty: paperInstance.difficulty,
      board: paperInstance.board,
      chapters: paperInstance.chapters,
      topics: paperInstance.topics,
      instructions: paperInstance.instructions,
      pattern: paperInstance.pattern,
      questions: paperInstance.questions,
      solutions: paperInstance.solutions,
      evaluationResult: paperInstance.evaluationResult,
      createdAt: paperInstance.createdAt,
      updatedAt: paperInstance.updatedAt,
      userId: paperInstance.userId ? paperInstance.userId.toString() : null,
    });
  } catch (error) {
    // Handle Mongoose validation errors separately
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    handleApiError(error, res, 'Generate paper error');
  }
};

// @desc    Get all question papers for the authenticated user
// @route   GET /api/papers
// @access  Private
export const getPapers = async (req, res) => {
  try {
    if (!req.user) {
      return res.json([]);
    }
    const papers = await QuestionPaper.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const parsedPapers = papers.map(paper => ({
      id: paper._id.toString(),
      subject: paper.subject,
      class: paper.class,
      totalMarks: paper.totalMarks,
      difficulty: paper.difficulty,
      board: paper.board,
      chapters: paper.chapters,
      topics: paper.topics,
      instructions: paper.instructions,
      pattern: paper.pattern,
      questions: paper.questions,
      solutions: paper.solutions,
      evaluationResult: paper.evaluationResult,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
      userId: paper.userId ? paper.userId.toString() : null,
    }));

    res.json(parsedPapers);
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ message: 'Server error fetching papers.' });
  }
};

// @desc    Get details of a specific paper
// @route   GET /api/papers/:id
// @access  Private
export const getPaperById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid question paper identifier format.' });
    }

    const paper = await findPaperForRequest(req.params.id, req);

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found or access denied.' });
    }

    res.json({
      id: paper._id.toString(),
      subject: paper.subject,
      class: paper.class,
      totalMarks: paper.totalMarks,
      difficulty: paper.difficulty,
      board: paper.board,
      chapters: paper.chapters,
      topics: paper.topics,
      instructions: paper.instructions,
      pattern: paper.pattern,
      questions: paper.questions,
      solutions: paper.solutions,
      evaluationResult: paper.evaluationResult,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
      userId: paper.userId ? paper.userId.toString() : null,
    });
  } catch (error) {
    console.error('Get paper by ID error:', error);
    res.status(500).json({ message: 'Server error fetching paper.' });
  }
};

// @desc    Delete a specific paper
// @route   DELETE /api/papers/:id
// @access  Private
export const deletePaper = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid question paper identifier format.' });
    }

    const paper = await findPaperForRequest(req.params.id, req);

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found or access denied.' });
    }

    await QuestionPaper.deleteOne({ _id: req.params.id });

    res.json({ message: 'Question paper removed successfully.' });
  } catch (error) {
    console.error('Delete paper error:', error);
    res.status(500).json({ message: 'Server error deleting paper.' });
  }
};

// @desc    Generate solutions for a specific paper
// @route   POST /api/papers/:id/solutions
// @access  Private
export const generateSolutions = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid question paper identifier format.' });
    }

    const paper = await findPaperForRequest(req.params.id, req);

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found or access denied.' });
    }

    // If solutions already exist, just return them
    if (paper.solutions) {
      return res.json({ solutions: paper.solutions });
    }

    const prompt = `Generate detailed solutions for the following question paper. Provide step-by-step solutions with explanations:

${paper.questions}

Please format the solutions with:
1. Question number references
2. Step-by-step working
3. Clear explanations
4. Final answers highlighted
5. Alternative methods where applicable`;

    const solutionContent = await callGeminiWithFallback(prompt, req);

    // Update database
    paper.solutions = solutionContent;
    await paper.save();

    res.json({ solutions: paper.solutions });
  } catch (error) {
    handleApiError(error, res, 'Generate solutions error');
  }
};

// @desc    Evaluate submitted answers for a paper
// @route   POST /api/papers/:id/evaluate
// @access  Private
export const evaluateAnswers = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required.' });
    }

    if (answers.length > 200) {
      return res.status(400).json({ message: 'Too many answers submitted (max 200).' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid question paper identifier format.' });
    }

    const paper = await findPaperForRequest(req.params.id, req);

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found or access denied.' });
    }

    const prompt = `Evaluate the following answers for the given question paper and provide marks and detailed feedback. The answers are provided in a list where each element corresponds to a question.

Question Paper:
${paper.questions}

Answers:
${answers.map((ans, i) => `Answer for Q${i + 1}: ${String(ans).substring(0, 10000)}`).join('\n')}

Please provide:
1. A total score.
2. Question-by-question feedback.
3. An overall summary.
Make it structured and easy to read.`;

    const evaluationContent = await callGeminiWithFallback(prompt, req);

    // Update database
    paper.evaluationResult = evaluationContent;
    await paper.save();

    res.json({ evaluationResult: paper.evaluationResult });
  } catch (error) {
    handleApiError(error, res, 'Evaluate answers error');
  }
};

// @desc    Chatbot interaction with paper context
// @route   POST /api/chat
// @access  Private
export const chatbot = async (req, res) => {
  try {
    const { message, paperId, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    // Limit message length to prevent abuse
    const sanitizedMessage = message.trim().substring(0, 10000);

    let contextPrompt = '';

    if (paperId && mongoose.Types.ObjectId.isValid(paperId)) {
      try {
        const paper = await findPaperForRequest(paperId, req);

        if (paper) {
          contextPrompt = `Here's the context of the current question paper or study material:\n\nQuestion Paper:\n${paper.questions}${paper.solutions ? `\n\nSolutions:\n${paper.solutions}` : ''}\n\n`;
        }
      } catch (paperError) {
        console.error('Error loading paper context for chatbot:', paperError);
        // Continue without paper context
      }
    }

    let historyPrompt = '';
    if (history && Array.isArray(history) && history.length > 0) {
      // Format chat history, limiting to last 10 messages to keep context size controlled
      const recentHistory = history.slice(-10);
      historyPrompt = recentHistory.map(msg => 
        msg.isUser ? `Student: ${msg.text}` : `Tutor: ${msg.text}`
      ).join('\n') + '\n\n';
    }

    const prompt = `You are an AI educational assistant helping students with their studies. 
${contextPrompt}
Here is the previous conversation history:
${historyPrompt}Student's current question: ${sanitizedMessage}
 
Please provide a helpful, educational response that helps the student understand the concepts better. Be clear, concise, and encouraging.`;

    const chatResponse = await callGeminiWithFallback(prompt, req);

    res.json({ response: chatResponse });
  } catch (error) {
    handleApiError(error, res, 'Chatbot error');
  }
};
