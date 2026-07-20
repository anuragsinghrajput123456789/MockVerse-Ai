import QuestionPaper from '../models/QuestionPaper.js';
import { findPaperForRequest, formatPaperResponse } from './shared/paperHelpers.js';
import { validateObjectId } from './shared/validation.js';

// @desc    Get details of a specific paper
// @route   GET /api/papers/:id
// @access  Private
export const getPaperById = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid question paper identifier format.' });
    }

    const paper = await findPaperForRequest(req.params.id, req);

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found or access denied.' });
    }

    res.json(formatPaperResponse(paper));
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
    if (!validateObjectId(req.params.id)) {
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
