import QuestionPaper from '../models/QuestionPaper.js';
import { callGeminiWithFallback, handleApiError } from './shared/geminiService.js';
import { buildGeneratePaperPrompt } from './shared/promptBuilder.js';
import { formatPaperResponse } from './shared/paperHelpers.js';
import { validateGeneratePaperInput } from './shared/validation.js';

// @desc    Generate a new question paper and save to MongoDB
// @route   POST /api/papers
// @access  Private
export const generatePaper = async (req, res) => {
  try {
    const validation = validateGeneratePaperInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

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

    const cleanSubject = String(subject).trim().substring(0, 200);
    const cleanClass = String(studentClass).trim().substring(0, 50);
    const cleanChapters = chapters.map(c => String(c).trim().substring(0, 200));

    const prompt = buildGeneratePaperPrompt({
      subject: cleanSubject,
      studentClass: cleanClass,
      chapters: cleanChapters,
      topics,
      totalMarks,
      difficulty,
      board,
      pattern,
      customPatternDetails,
      instructions,
    });

    const content = await callGeminiWithFallback(prompt, req, 'generate_paper');

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

    res.status(201).json(formatPaperResponse(paperInstance));
  } catch (error: any) {
    // Handle Mongoose validation errors separately
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    handleApiError(error, res, 'Generate paper error');
  }
};
