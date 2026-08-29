import { callGeminiWithFallback, handleApiError } from './shared/geminiService.js';
import { buildGenerateSolutionsPrompt } from './shared/promptBuilder.js';
import { findPaperForRequest } from './shared/paperHelpers.js';
import { validateObjectId } from './shared/validation.js';

// @desc    Generate solutions for a specific paper
// @route   POST /api/papers/:id/solutions
// @access  Private / Public
export const generateSolutions = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid question paper identifier format.' });
    }

    const paper = await findPaperForRequest(req.params.id, req);

    if (!paper) {
      return res.status(404).json({ success: false, message: 'Question paper not found or access denied.' });
    }

    // ─── CHECK MONGODB CACHE BEFORE CALLING GEMINI ───
    if (paper.solutions) {
      console.log(`[GEMINI_CACHE] [MONGODB_HIT] Reusing cached solutions for paper ID: ${paper._id} | Saved 1 Gemini API Request`);
      return res.json({ solutions: paper.solutions });
    }

    const prompt = buildGenerateSolutionsPrompt(paper.questions);

    const solutionContent = await callGeminiWithFallback(prompt, req, 'generate_solutions', `/api/papers/${req.params.id}/solutions`);

    // Update database
    paper.solutions = solutionContent;
    await paper.save();

    res.json({ solutions: paper.solutions });
  } catch (error) {
    handleApiError(error, res, 'Generate solutions error');
  }
};
