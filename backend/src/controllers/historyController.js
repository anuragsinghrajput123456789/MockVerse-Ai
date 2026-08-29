import QuestionPaper from '../models/QuestionPaper.js';
import { formatPaperResponse } from './shared/paperHelpers.js';

// @desc    Get all question papers for the authenticated user
// @route   GET /api/papers
// @access  Private
export const getPapers = async (req, res) => {
  try {
    if (!req.user) {
      return res.json([]);
    }
    const papers = await QuestionPaper.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const parsedPapers = papers.map(paper => formatPaperResponse(paper));
    res.json(parsedPapers);
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching papers.' });
  }
};
