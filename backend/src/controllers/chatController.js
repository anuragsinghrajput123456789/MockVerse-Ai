import { callGeminiWithFallback, handleApiError } from './shared/geminiService.js';
import { buildChatbotPrompt } from './shared/promptBuilder.js';
import { findPaperForRequest } from './shared/paperHelpers.js';
import { validateChatbotInput, validateObjectId } from './shared/validation.js';

// @desc    Chatbot interaction with paper context
// @route   POST /api/chat
// @access  Private
export const chatbot = async (req, res) => {
  try {
    const validation = validateChatbotInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const { message, paperId, history } = req.body;
    const sanitizedMessage = message.trim().substring(0, 10000);

    let contextPrompt = '';

    if (paperId && validateObjectId(paperId)) {
      try {
        const paper = await findPaperForRequest(paperId, req);
        if (paper) {
          contextPrompt = `Here's the context of the current question paper:\n\nQuestion Paper:\n${paper.questions}${paper.solutions ? `\n\nSolutions:\n${paper.solutions}` : ''}\n\n`;
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

    const prompt = buildChatbotPrompt(contextPrompt, historyPrompt, sanitizedMessage);

    const chatResponse = await callGeminiWithFallback(prompt, req);

    res.json({ response: chatResponse });
  } catch (error) {
    handleApiError(error, res, 'Chatbot error');
  }
};
