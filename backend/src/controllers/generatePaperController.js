import QuestionPaper from '../models/QuestionPaper.js';
import { callGeminiWithFallback, handleApiError } from './shared/geminiService.js';
import { buildGeneratePaperPrompt } from './shared/promptBuilder.js';
import { formatPaperResponse } from './shared/paperHelpers.js';
import { validateGeneratePaperInput } from './shared/validation.js';

// @desc    Generate a new question paper and save to MongoDB
// @route   POST /api/papers
// @access  Private / Public
export const generatePaper = async (req, res) => {
  try {
    const validation = validateGeneratePaperInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.message });
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
    const cleanBoard = String(board || 'NCERT').trim().substring(0, 100);
    const cleanDifficulty = difficulty || 'Medium';
    const cleanPattern = String(pattern || 'Board-style').trim().substring(0, 200);
    const cleanMarks = Number(totalMarks) || 100;
    const cleanChapters = (chapters || []).map(c => String(c).trim().substring(0, 200));

    // ─── 1. CHECK MONGODB CACHE BEFORE CALLING GEMINI ───
    // Multi-attribute cache key lookup matching: Subject, Class, Board, Pattern, Difficulty, TotalMarks, Selected Chapters
    const sortedChapters = [...cleanChapters].sort();
    const existingPaper = await QuestionPaper.findOne({
      subject: { $regex: new RegExp(`^${cleanSubject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      class: cleanClass,
      board: cleanBoard,
      difficulty: cleanDifficulty,
      pattern: cleanPattern,
      totalMarks: cleanMarks,
      chapters: { $all: sortedChapters, $size: sortedChapters.length },
      questions: { $exists: true, $ne: '' },
    }).sort({ createdAt: -1 });

    // Only reuse cached paper if it is complete and has substantial question content (>= 500 chars)
    if (existingPaper && existingPaper.questions && existingPaper.questions.trim().length >= 500) {
      console.log(`[GEMINI_CACHE] [MONGODB_HIT] Reusing cached paper ID: ${existingPaper._id} | Subject: "${cleanSubject}" | Class: "${cleanClass}" | Board: "${cleanBoard}" | Saved 1 Gemini API Request`);
      return res.status(200).json(formatPaperResponse(existingPaper));
    }

    // ─── 2. CALL GEMINI ONLY IF NO CACHED RESULT EXISTS ───
    const prompt = buildGeneratePaperPrompt({
      subject: cleanSubject,
      studentClass: cleanClass,
      chapters: cleanChapters,
      topics,
      totalMarks: cleanMarks,
      difficulty: cleanDifficulty,
      board: cleanBoard,
      pattern: cleanPattern,
      customPatternDetails,
      instructions,
    });

    const content = await callGeminiWithFallback(prompt, req, 'generate_paper', '/api/papers');

    // Save newly generated paper to MongoDB database
    const paperInstance = await QuestionPaper.create({
      subject: cleanSubject,
      class: cleanClass,
      totalMarks: cleanMarks,
      difficulty: cleanDifficulty,
      board: cleanBoard,
      chapters: cleanChapters,
      topics: String(topics || '').substring(0, 2000),
      instructions: String(instructions || '').substring(0, 5000),
      pattern: cleanPattern,
      questions: content,
      userId: req.user?.id || req.user?._id || null,
    });

    res.status(201).json(formatPaperResponse(paperInstance));
  } catch (error) {
    // Handle Mongoose validation errors separately
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    handleApiError(error, res, 'Generate paper error');
  }
};
