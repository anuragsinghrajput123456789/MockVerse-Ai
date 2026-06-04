import QuestionPaper from '../models/QuestionPaper.js';
import mongoose from 'mongoose';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Helper to call Gemini API
const callGemini = async (prompt, customApiKey) => {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on server and no custom key provided');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.candidates || !data.candidates[0]) {
    throw new Error('Invalid response from Gemini API');
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
    throw new Error('No content returned from Gemini API candidates');
  }

  const parts = candidate.content.parts;
  if (!parts || parts.length === 0) {
    throw new Error('No content parts returned from Gemini API');
  }

  // Filter out thinking/reasoning parts (where part.thought === true) and join the text contents
  const textContent = parts
    .filter(part => !part.thought)
    .map(part => part.text || '')
    .join('')
    .trim();

  if (!textContent) {
    throw new Error('No text content returned after filtering thoughts');
  }

  return textContent;
};

// @desc    Generate a new question paper and save to MongoDB
// @route   POST /api/papers
// @access  Private
export const generatePaper = async (req, res) => {
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

  if (!subject || !studentClass || !chapters || !Array.isArray(chapters)) {
    return res.status(400).json({ message: 'Subject, class, and chapters (array) are required' });
  }

  try {
    const requirements = [
      `- Total marks: ${totalMarks || 100}`,
      `- Difficulty level: ${difficulty || 'Medium'}`,
      `- Board/Book type: ${board || 'NCERT'}`,
      `- Pattern: ${pattern || 'Board-style'}`,
    ];

    if (pattern === 'Custom' && customPatternDetails) {
      requirements.push(`- Custom Pattern Details: ${customPatternDetails}`);
    }
    if (instructions) {
      requirements.push(`- Additional instructions: ${instructions}`);
    }

    const prompt = `Generate a ${subject} question paper for class ${studentClass} based on chapters: ${chapters.join(', ')}${topics ? ` with focus on: ${topics}` : ''}. 
  
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

    // Extract client custom API Key from headers if they provided one
    const customApiKey = req.headers['x-api-key'];

    const content = await callGemini(prompt, customApiKey);

    // Save to MongoDB database
    const paperInstance = await QuestionPaper.create({
      subject,
      class: studentClass,
      totalMarks: Number(totalMarks) || 100,
      difficulty: difficulty || 'Medium',
      board: board || 'NCERT',
      chapters, // Stored natively as String array
      topics: topics || '',
      instructions: instructions || '',
      pattern: pattern || 'Board-style',
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
      userId: paperInstance.userId.toString()
    });
  } catch (error) {
    console.error('Generate paper error:', error);
    res.status(500).json({ message: error.message || 'Server error generating question paper' });
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
      userId: paper.userId.toString()
    }));

    res.json(parsedPapers);
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ message: 'Server error fetching papers' });
  }
};

// @desc    Get details of a specific paper
// @route   GET /api/papers/:id
// @access  Private
export const getPaperById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid question paper identifier format' });
  }
  try {
    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found or access denied' });
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
      userId: paper.userId.toString()
    });
  } catch (error) {
    console.error('Get paper by ID error:', error);
    res.status(500).json({ message: 'Server error fetching paper' });
  }
};

// @desc    Delete a specific paper
// @route   DELETE /api/papers/:id
// @access  Private
export const deletePaper = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid question paper identifier format' });
  }
  try {
    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found or access denied' });
    }

    await QuestionPaper.deleteOne({ _id: req.params.id });

    res.json({ message: 'Question paper removed successfully' });
  } catch (error) {
    console.error('Delete paper error:', error);
    res.status(500).json({ message: 'Server error deleting paper' });
  }
};

// @desc    Generate solutions for a specific paper
// @route   POST /api/papers/:id/solutions
// @access  Private
export const generateSolutions = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid question paper identifier format' });
  }
  try {
    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found or access denied' });
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

    const customApiKey = req.headers['x-api-key'];
    const solutionContent = await callGemini(prompt, customApiKey);

    // Update database Mongoose
    paper.solutions = solutionContent;
    await paper.save();

    res.json({ solutions: paper.solutions });
  } catch (error) {
    console.error('Generate solutions error:', error);
    res.status(500).json({ message: error.message || 'Server error generating solutions' });
  }
};

// @desc    Evaluate submitted answers for a paper
// @route   POST /api/papers/:id/evaluate
// @access  Private
export const evaluateAnswers = async (req, res) => {
  const { answers } = req.body; // Array of answers

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'Answers array is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid question paper identifier format' });
  }
  try {
    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found or access denied' });
    }

    const prompt = `Evaluate the following answers for the given question paper and provide marks and detailed feedback. The answers are provided in a list where each element corresponds to a question.

Question Paper:
${paper.questions}

Answers:
${answers.map((ans, i) => `Answer for Q${i + 1}: ${ans}`).join('\n')}

Please provide:
1. A total score.
2. Question-by-question feedback.
3. An overall summary.
Make it structured and easy to read.`;

    const customApiKey = req.headers['x-api-key'];
    const evaluationContent = await callGemini(prompt, customApiKey);

    // Update database Mongoose
    paper.evaluationResult = evaluationContent;
    await paper.save();

    res.json({ evaluationResult: paper.evaluationResult });
  } catch (error) {
    console.error('Evaluate answers error:', error);
    res.status(500).json({ message: error.message || 'Server error evaluating answers' });
  }
};

// @desc    Chatbot interaction with paper context
// @route   POST /api/chat
// @access  Private
export const chatbot = async (req, res) => {
  const { message, paperId } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    let contextPrompt = '';
    
    if (paperId && mongoose.Types.ObjectId.isValid(paperId)) {
      const paper = await QuestionPaper.findOne({
        _id: paperId,
        userId: req.user.id,
      });

      if (paper) {
        contextPrompt = `Here's the context of the current question paper or study material:
\n\nQuestion Paper:\n${paper.questions}${paper.solutions ? `\n\nSolutions:\n${paper.solutions}` : ''}\n\n`;
      }
    }

    const prompt = `You are an AI educational assistant helping students with their studies. 
${contextPrompt}
Student's question: ${message}
 
Please provide a helpful, educational response that helps the student understand the concepts better. Be clear, concise, and encouraging.`;

    const customApiKey = req.headers['x-api-key'];
    const chatResponse = await callGemini(prompt, customApiKey);

    res.json({ response: chatResponse });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: error.message || 'Server error getting chatbot response' });
  }
};
