import QuestionPaper from '../models/QuestionPaper.js';
import User from '../models/User.js';
import { decryptApiKey } from './authController.js';
import mongoose from 'mongoose';

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

// Helper to call Gemini API with rate limit detection and timeout
const callGemini = async (prompt, apiKey) => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on server and no custom key provided.');
  }

  // Enforce a max prompt length to prevent abuse (100K chars ~ many pages of text)
  if (prompt.length > 100000) {
    throw new Error('Prompt is too long. Please reduce the input size.');
  }

  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (fetchError) {
    if (fetchError.name === 'AbortError') {
      throw new Error('Gemini API request timed out. Please try again.');
    }
    throw new Error(`Failed to reach Gemini API: ${fetchError.message}`);
  }

  // Detect rate limit / quota exhaustion
  if (response.status === 429) {
    const errorBody = await response.text().catch(() => '');
    const error = new Error('API_KEY_QUOTA_EXHAUSTED: Your API key has exceeded its usage limit. Please check your Google AI Studio dashboard or wait for the quota to reset.');
    error.statusCode = 429;
    throw error;
  }

  if (response.status === 403) {
    const errorBody = await response.text().catch(() => '');
    if (errorBody.includes('RESOURCE_EXHAUSTED') || errorBody.includes('quota') || errorBody.includes('rate limit')) {
      const error = new Error('API_KEY_QUOTA_EXHAUSTED: Your API key quota has been exhausted. Please upgrade your plan in Google AI Studio or wait for the quota to reset.');
      error.statusCode = 429;
      throw error;
    }
    if (errorBody.includes('API_KEY_INVALID') || errorBody.includes('invalid')) {
      const error = new Error('API_KEY_INVALID: The provided API key is invalid. Please check your API key in your profile settings.');
      error.statusCode = 401;
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

  return textContent;
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
    return res.status(401).json({
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

    const prompt = `Generate a ${subject} question paper for class ${studentClass} based on chapters: ${chapters.join(', ')}${topics ? ` with focus on: ${String(topics).substring(0, 2000)}` : ''}. 
  
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

    // Resolve the best API key using smart priority
    const { key: apiKey, source: keySource } = await resolveApiKey(req);

    const content = await callGemini(prompt, apiKey);

    // Save to MongoDB database
    const paperInstance = await QuestionPaper.create({
      subject: String(subject).trim().substring(0, 200),
      class: String(studentClass).trim().substring(0, 50),
      totalMarks: Number(totalMarks) || 100,
      difficulty: difficulty || 'Medium',
      board: String(board || 'NCERT').trim().substring(0, 100),
      chapters: chapters.map(c => String(c).trim().substring(0, 200)),
      topics: String(topics || '').substring(0, 2000),
      instructions: String(instructions || '').substring(0, 5000),
      pattern: String(pattern || 'Board-style').trim().substring(0, 200),
      questions: content,
      userId: req.user.id,
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
      userId: paperInstance.userId.toString(),
      keySource,
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
      userId: paper.userId.toString(),
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

    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

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
      userId: paper.userId.toString(),
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

    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

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

    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

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

    const { key: apiKey } = await resolveApiKey(req);
    const solutionContent = await callGemini(prompt, apiKey);

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

    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

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

    const { key: apiKey } = await resolveApiKey(req);
    const evaluationContent = await callGemini(prompt, apiKey);

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
    const { message, paperId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    // Limit message length to prevent abuse
    const sanitizedMessage = message.trim().substring(0, 10000);

    let contextPrompt = '';

    if (paperId && mongoose.Types.ObjectId.isValid(paperId)) {
      try {
        const paper = await QuestionPaper.findOne({
          _id: paperId,
          userId: req.user.id,
        });

        if (paper) {
          contextPrompt = `Here's the context of the current question paper or study material:\n\nQuestion Paper:\n${paper.questions}${paper.solutions ? `\n\nSolutions:\n${paper.solutions}` : ''}\n\n`;
        }
      } catch (paperError) {
        console.error('Error loading paper context for chatbot:', paperError);
        // Continue without paper context
      }
    }

    const prompt = `You are an AI educational assistant helping students with their studies. 
${contextPrompt}
Student's question: ${sanitizedMessage}
 
Please provide a helpful, educational response that helps the student understand the concepts better. Be clear, concise, and encouraging.`;

    const { key: apiKey } = await resolveApiKey(req);
    const chatResponse = await callGemini(prompt, apiKey);

    res.json({ response: chatResponse });
  } catch (error) {
    handleApiError(error, res, 'Chatbot error');
  }
};
