import { callGeminiWithFallback, handleApiError } from './shared/geminiService.js';
import { buildChatbotPrompt } from './shared/promptBuilder.js';
import { findPaperForRequest } from './shared/paperHelpers.js';
import { validateChatbotInput, validateObjectId } from './shared/validation.js';

// @desc    Chatbot interaction with paper context
// @route   POST /api/chat
// @access  Private / Public
export const chatbot = async (req, res) => {
  try {
    const validation = validateChatbotInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const { message, paperId, history } = req.body;
    const sanitizedMessage = message.trim().substring(0, 2000);

    let contextPrompt = '';

    if (paperId && validateObjectId(paperId)) {
      try {
        const paper = await findPaperForRequest(paperId, req);
        if (paper) {
          const truncQuestions = String(paper.questions).substring(0, 3000);
          const truncSolutions = paper.solutions ? String(paper.solutions).substring(0, 1500) : '';
          contextPrompt = `Active Question Paper Context:\n${truncQuestions}${truncSolutions ? `\n\nSolutions:\n${truncSolutions}` : ''}\n\n`;
        }
      } catch (paperError) {
        console.error('Error loading paper context for chatbot:', paperError);
      }
    }

    let historyPrompt = '';
    if (history && Array.isArray(history) && history.length > 0) {
      // Limit history to last 6 messages to prevent token bloat
      const recentHistory = history.slice(-6);
      historyPrompt = recentHistory.map(msg => 
        msg.isUser ? `Student: ${String(msg.text).substring(0, 500)}` : `Tutor: ${String(msg.text).substring(0, 500)}`
      ).join('\n') + '\n\n';
    }

    const prompt = buildChatbotPrompt(contextPrompt, historyPrompt, sanitizedMessage);

    const chatResponse = await callGeminiWithFallback(prompt, req, 'chatbot', '/api/chat');

    res.json({ response: chatResponse });
  } catch (error) {
    handleApiError(error, res, 'Chatbot error');
  }
};
