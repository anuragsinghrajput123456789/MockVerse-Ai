import { GoogleGenAI } from '@google/genai';
import User from '../../models/User.js';
import { decryptApiKey } from '../authController.js';

// Model configuration with env fallback
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Helper to resolve the best API key: header > user stored > env default
export const resolveApiKey = async (req) => {
  // Priority 1: Client-sent header override
  if (req.headers && req.headers['x-api-key']) {
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

// Helper to call Gemini API using the official @google/genai SDK
export const callGemini = async (prompt, apiKey) => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on server and no custom key provided.');
  }

  const cleanApiKey = apiKey.trim();

  // Enforce a max prompt length to prevent abuse (100K chars ~ many pages of text)
  if (prompt.length > 100000) {
    throw new Error('Prompt is too long. Please reduce the input size.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: cleanApiKey });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    let textContent = response.text;

    if (!textContent || !textContent.trim()) {
      throw new Error('No text content returned from Gemini API.');
    }

    // Clean up response: Strip surrounding markdown code block wrapper backticks if wrapped
    let cleanText = textContent.trim();
    if (cleanText.startsWith('```')) {
      const lines = cleanText.split('\n');
      if (lines[0].startsWith('```')) {
        lines.shift();
      }
      if (lines[lines.length - 1].startsWith('```')) {
        lines.pop();
      }
      cleanText = lines.join('\n').trim();
    }

    return cleanText;

  } catch (error) {
    const errMsg = error.message || '';

    // Handle API key errors
    if (
      errMsg.includes('API_KEY_INVALID') ||
      (errMsg.includes('invalid') && errMsg.includes('key')) ||
      errMsg.includes('UNAUTHENTICATED') ||
      errMsg.includes('401') ||
      error.status === 401
    ) {
      const apiError = new Error('API_KEY_INVALID: The provided Gemini API key is invalid or has been revoked. Please check and update your API key in the Profile settings.');
      apiError.statusCode = 400; // Use 400 instead of 401 to prevent frontend JWT auto-logout
      apiError.errorCode = 'API_KEY_INVALID';
      throw apiError;
    }

    // Handle quota/rate limit errors
    if (
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('quota') ||
      errMsg.includes('rate limit') ||
      errMsg.includes('429') ||
      error.status === 429
    ) {
      const quotaError = new Error('API_KEY_QUOTA_EXHAUSTED: Your API key has exceeded its usage limit. Please check your Google AI Studio dashboard or wait for the quota to reset.');
      quotaError.statusCode = 429;
      quotaError.errorCode = 'API_KEY_QUOTA_EXHAUSTED';
      throw quotaError;
    }

    // Handle safety blocks
    if (errMsg.includes('safety') || errMsg.includes('blocked') || errMsg.includes('SAFETY')) {
      throw new Error('Content generation was blocked by AI safety settings. Please try adjusting your parameters.');
    }

    // Re-throw with a clearer message
    throw new Error(`Gemini API error: ${errMsg}`);
  }
};

// Helper to call Gemini API with fallback retry and secondary API key attempts
export const callGeminiWithFallback = async (prompt, req) => {
  const { key, source } = await resolveApiKey(req);
  
  if (!key) {
    throw new Error('Gemini API key is not configured on server and no custom key provided.');
  }

  try {
    return await callGemini(prompt, key);
  } catch (firstError) {
    // Fall back to server key if:
    // 1. The primary key was a custom key (either stored or from headers)
    // 2. We have a server-level default API key configured
    // 3. The server fallback key is different from the failed key
    if (source !== 'server' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== key.trim()) {
      console.warn(`Primary key (${source}) failed: ${firstError.message}. Trying server default fallback key...`);
      try {
        return await callGemini(prompt, process.env.GEMINI_API_KEY);
      } catch (fallbackError) {
        console.error('Server default fallback key also failed:', fallbackError.message);
        throw fallbackError;
      }
    }
    throw firstError;
  }
};

// Helper to send quota-aware error responses
export const handleApiError = (error, res, defaultMessage) => {
  console.error(defaultMessage + ':', error.message || error);

  if (error.message?.startsWith('API_KEY_QUOTA_EXHAUSTED')) {
    return res.status(429).json({
      message: error.message.replace('API_KEY_QUOTA_EXHAUSTED: ', ''),
      errorCode: 'API_KEY_QUOTA_EXHAUSTED',
    });
  }

  if (error.message?.startsWith('API_KEY_INVALID')) {
    return res.status(400).json({
      message: error.message.replace('API_KEY_INVALID: ', ''),
      errorCode: 'API_KEY_INVALID',
    });
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ message: error.message || defaultMessage });
};
