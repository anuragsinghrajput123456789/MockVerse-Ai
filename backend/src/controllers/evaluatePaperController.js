import { callGeminiWithFallback, handleApiError } from './shared/geminiService.js';
import { buildEvaluateAnswersPrompt } from './shared/promptBuilder.js';
import { findPaperForRequest } from './shared/paperHelpers.js';
import { validateEvaluateAnswersInput, validateObjectId } from './shared/validation.js';

// @desc    Evaluate submitted answers for a paper
// @route   POST /api/papers/:id/evaluate
// @access  Private / Public
export const evaluateAnswers = async (req, res) => {
  try {
    const validation = validateEvaluateAnswersInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid question paper identifier format.' });
    }

    const paper = await findPaperForRequest(req.params.id, req);

    if (!paper) {
      return res.status(404).json({ success: false, message: 'Question paper not found or access denied.' });
    }

    const prompt = buildEvaluateAnswersPrompt(paper.questions, req.body.answers);

    const evaluationContent = await callGeminiWithFallback(prompt, req, 'evaluate_answers', `/api/papers/${req.params.id}/evaluate`);

    // Update database
    paper.evaluationResult = evaluationContent;
    await paper.save();

    res.json({ evaluationResult: paper.evaluationResult });
  } catch (error) {
    handleApiError(error, res, 'Evaluate answers error');
  }
};
