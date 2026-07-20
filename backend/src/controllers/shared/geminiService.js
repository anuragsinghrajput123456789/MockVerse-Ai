import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import User from '../../models/User.js';
import { decryptApiKey } from '../authController.js';

// Model configuration with env fallback
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// ─── IN-MEMORY RESPONSE CACHE & IN-FLIGHT DEDUPLICATION ───────────────────────
const aiResponseCache = new Map<string, { content: string; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<string>>();

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 Minutes
const MAX_CACHE_ENTRIES = 100;

// Clean up expired cache entries periodically
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, entry] of aiResponseCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      aiResponseCache.delete(key);
    }
  }
  if (aiResponseCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = aiResponseCache.keys().next().value;
    if (oldestKey) aiResponseCache.delete(oldestKey);
  }
};

// Helper to compute a hash for prompt + purpose + key signature
const createRequestHash = (prompt: string, apiKey: string, purpose: string = 'general') => {
  const keySig = apiKey ? apiKey.trim().slice(-8) : 'nokey';
  return crypto.createHash('sha256').update(`${purpose}:${keySig}:${prompt.trim()}`).digest('hex');
};

// Helper to resolve the best API key: header > user stored > env default
export const resolveApiKey = async (req) => {
  // Priority 1: Client-sent header override
  if (req?.headers && req.headers['x-api-key']) {
    return { key: req.headers['x-api-key'], source: 'header' };
  }

  // Priority 2: User's stored encrypted key in MongoDB
  if (req?.user?.id) {
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
export const callGemini = async (prompt: string, apiKey: string, purpose: string = 'general') => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on server and no custom key provided.');
  }

  const cleanApiKey = apiKey.trim();

  // Enforce a max prompt length to prevent abuse
  if (prompt.length > 100000) {
    throw new Error('Prompt is too long. Please reduce the input size.');
  }

  const reqHash = createRequestHash(prompt, cleanApiKey, purpose);
  const requestId = reqHash.slice(0, 8);
  const startTime = Date.now();

  // 1. CHECK IN-MEMORY RESPONSE CACHE
  cleanExpiredCache();
  const cached = aiResponseCache.get(reqHash);
  if (cached && (startTime - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[GEMINI_API] [CACHE_HIT] RequestId: ${requestId} | Purpose: ${purpose} | Duration: 0ms | Saved 1 Gemini API Request`);
    return cached.content;
  }

  // 2. CHECK IN-FLIGHT DEDUPLICATION
  if (inFlightRequests.has(reqHash)) {
    console.log(`[GEMINI_API] [DEDUPLICATED] RequestId: ${requestId} | Purpose: ${purpose} | Joining active in-flight request...`);
    return await inFlightRequests.get(reqHash)!;
  }

  // 3. EXECUTE GEMINI API REQUEST WITH DEDUPLICATION LOCK
  const requestPromise = (async () => {
    try {
      console.log(`[GEMINI_API] [START] RequestId: ${requestId} | Purpose: ${purpose} | Model: ${GEMINI_MODEL} | PromptChars: ${prompt.length}`);

      const ai = new GoogleGenAI({ apiKey: cleanApiKey });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      let textContent = response.text;

      if (!textContent || !textContent.trim()) {
        throw new Error('No text content returned from Gemini API.');
      }

      // Clean up response: Strip surrounding markdown code block wrappers
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

      const duration = Date.now() - startTime;
      const estTokens = Math.round((prompt.length + cleanText.length) / 4);
      console.log(`[GEMINI_API] [SUCCESS] RequestId: ${requestId} | Purpose: ${purpose} | Duration: ${duration}ms | EstTokens: ~${estTokens}`);

      // Store in response cache
      aiResponseCache.set(reqHash, { content: cleanText, timestamp: Date.now() });

      return cleanText;

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errMsg = error.message || '';
      console.error(`[GEMINI_API] [ERROR] RequestId: ${requestId} | Purpose: ${purpose} | Duration: ${duration}ms | Error: ${errMsg}`);

      // Handle API key errors
      if (
        errMsg.includes('API_KEY_INVALID') ||
        (errMsg.includes('invalid') && errMsg.includes('key')) ||
        errMsg.includes('UNAUTHENTICATED') ||
        errMsg.includes('401') ||
        error.status === 401
      ) {
        const apiError: any = new Error('API_KEY_INVALID: The provided Gemini API key is invalid or has been revoked. Please check and update your API key in the Profile settings.');
        apiError.statusCode = 400;
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
        const quotaError: any = new Error('API_KEY_QUOTA_EXHAUSTED: Your API key has exceeded its usage limit. Please check your Google AI Studio dashboard or wait for the quota to reset.');
        quotaError.statusCode = 429;
        quotaError.errorCode = 'API_KEY_QUOTA_EXHAUSTED';
        throw quotaError;
      }

      if (errMsg.includes('safety') || errMsg.includes('blocked') || errMsg.includes('SAFETY')) {
        throw new Error('Content generation was blocked by AI safety settings. Please try adjusting your parameters.');
      }

      throw new Error(`Gemini API error: ${errMsg}`);
    } finally {
      inFlightRequests.delete(reqHash);
    }
  })();

  inFlightRequests.set(reqHash, requestPromise);
  return await requestPromise;
};

// Helper to call Gemini API with fallback retry and secondary API key attempts
export const callGeminiWithFallback = async (prompt: string, req: any, purpose: string = 'general') => {
  const { key, source } = await resolveApiKey(req);
  
  if (!key) {
    throw new Error('Gemini API key is not configured on server and no custom key provided.');
  }

  try {
    return await callGemini(prompt, key, purpose);
  } catch (firstError: any) {
    if (source !== 'server' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== key.trim()) {
      console.warn(`Primary key (${source}) failed: ${firstError.message}. Trying server default fallback key...`);
      try {
        return await callGemini(prompt, process.env.GEMINI_API_KEY, `${purpose}_fallback`);
      } catch (fallbackError: any) {
        console.error('Server default fallback key also failed:', fallbackError.message);
        throw fallbackError;
      }
    }
    throw firstError;
  }
};

// Helper to send quota-aware error responses
export const handleApiError = (error: any, res: any, defaultMessage: string) => {
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
