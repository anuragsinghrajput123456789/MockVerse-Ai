import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import User from '../../models/User.js';
import { decryptApiKey } from '../authController.js';

// Model configuration with env fallback
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// ─── IN-MEMORY RESPONSE CACHE, IN-FLIGHT DEDUPLICATION & USER REQUEST LOCKS ───────────────────────
const aiResponseCache = new Map();
const inFlightRequests = new Map();
const activeUserLocks = new Map(); // Key: userId/IP -> { requestId, startTime, purpose, endpoint }

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 Minutes
const MAX_CACHE_ENTRIES = 100;
const LOCK_TIMEOUT_MS = 120 * 1000; // 2 minutes auto-expire lock safety
const GEMINI_CALL_TIMEOUT_MS = 90 * 1000; // 90s server-side timeout per Gemini call

// Clean up expired cache entries periodically
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, entry] of aiResponseCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      aiResponseCache.delete(key);
    }
  }
  while (aiResponseCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = aiResponseCache.keys().next().value;
    if (oldestKey) aiResponseCache.delete(oldestKey);
    else break;
  }
};

// Clean up expired user locks
const cleanExpiredUserLocks = () => {
  const now = Date.now();
  for (const [userKey, lock] of activeUserLocks.entries()) {
    if (now - lock.startTime > LOCK_TIMEOUT_MS) {
      console.warn(`[REQUEST_LOCK] Auto-releasing timed out lock for user/IP: ${userKey}`);
      activeUserLocks.delete(userKey);
    }
  }
};

// Helper to compute a hash for prompt + purpose + key signature
const createRequestHash = (prompt, apiKey, purpose = 'general') => {
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
  if (req?.user?.id || req?.user?._id) {
    try {
      const userId = req.user.id || req.user._id;
      const user = await User.findById(userId);
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

// Purpose-based Max Output Token Limits to prevent quota exhaustion and premature truncation
const PURPOSE_MAX_TOKENS = {
  generate_paper: 8192,
  generate_solutions: 8192,
  evaluate_answers: 4096,
  chatbot: 2048,
  general: 4096,
};

/**
 * Core function to execute requests against Google Gemini API
 * Includes: Response Caching, In-flight Deduplication, Per-User Request Locking,
 * Exponential Backoff for rate limits, and Structured Logging.
 */
export const callGemini = async (prompt, apiKey, purpose = 'general', meta = {}) => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on server and no custom key provided.');
  }

  const cleanApiKey = apiKey.trim();

  // Enforce a max prompt length to prevent abuse
  if (prompt.length > 100000) {
    throw new Error('Prompt is too long. Please reduce the input size.');
  }

  const userId = meta.userId || 'anonymous';
  const endpoint = meta.endpoint || 'N/A';
  const userLockKey = String(userId);

  const reqHash = createRequestHash(prompt, cleanApiKey, purpose);
  const requestId = reqHash.slice(0, 8);
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const estInputTokens = Math.ceil(prompt.length / 4);

  // 1. CHECK IN-MEMORY RESPONSE CACHE
  cleanExpiredCache();
  const cached = aiResponseCache.get(reqHash);
  if (cached && (startTime - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[GEMINI_API_LOG] RequestId: ${requestId} | Timestamp: ${timestamp} | Endpoint: ${endpoint} | Purpose: ${purpose} | User ID: ${userId} | PromptSize: ${prompt.length} chars | EstInputTokens: ${estInputTokens} | EstOutputTokens: ${Math.ceil(cached.content.length / 4)} | ExecutionTime: 0ms | Status: SUCCESS_CACHE_HIT`);
    return cached.content;
  }

  // 2. CHECK IN-FLIGHT DEDUPLICATION
  if (inFlightRequests.has(reqHash)) {
    console.log(`[GEMINI_API_LOG] RequestId: ${requestId} | Timestamp: ${timestamp} | Endpoint: ${endpoint} | Purpose: ${purpose} | User ID: ${userId} | PromptSize: ${prompt.length} chars | EstInputTokens: ${estInputTokens} | ExecutionTime: 0ms | Status: DEDUPLICATED_IN_FLIGHT`);
    return await inFlightRequests.get(reqHash);
  }

  // 3. CHECK PER-USER REQUEST LOCKING
  cleanExpiredUserLocks();
  if (activeUserLocks.has(userLockKey)) {
    const activeLock = activeUserLocks.get(userLockKey);
    console.warn(`[GEMINI_API_LOG] RequestId: ${requestId} | Timestamp: ${timestamp} | Endpoint: ${endpoint} | Purpose: ${purpose} | User ID: ${userId} | Status: REJECTED_CONCURRENT_LOCK | ActiveRequestId: ${activeLock.requestId}`);
    const lockError = new Error('CONCURRENT_REQUEST_LIMIT: A paper generation or AI request is already in progress for your account. Please wait for it to complete.');
    lockError.statusCode = 429;
    lockError.errorCode = 'CONCURRENT_REQUEST_LIMIT';
    throw lockError;
  }

  // Acquire lock for this user/IP
  activeUserLocks.set(userLockKey, { requestId, startTime: Date.now(), purpose, endpoint });

  // 4. EXECUTE GEMINI API REQUEST WITH DEDUPLICATION LOCK & EXPONENTIAL BACKOFF
  // FIX: Register the in-flight promise BEFORE the IIFE starts executing to prevent
  // race conditions where a duplicate request slips through the dedup check.
  let resolveInFlight, rejectInFlight;
  const deferredPromise = new Promise((resolve, reject) => {
    resolveInFlight = resolve;
    rejectInFlight = reject;
  });
  inFlightRequests.set(reqHash, deferredPromise);

  try {
    const maxTokens = PURPOSE_MAX_TOKENS[purpose] || 1500;
    console.log(`[GEMINI_API_LOG] RequestId: ${requestId} | Timestamp: ${timestamp} | Endpoint: ${endpoint} | Purpose: ${purpose} | User ID: ${userId} | Model: ${GEMINI_MODEL} | MaxOutputTokens: ${maxTokens} | PromptSize: ${prompt.length} chars | EstInputTokens: ${estInputTokens} | Status: START`);

    const ai = new GoogleGenAI({ apiKey: cleanApiKey });

    let response;
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        // Server-side timeout to prevent indefinite hangs
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out after 90 seconds.')), GEMINI_CALL_TIMEOUT_MS)
        );

        response = await Promise.race([
          ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
              maxOutputTokens: maxTokens,
            },
          }),
          timeoutPromise,
        ]);
        break; // Successful call
      } catch (genError) {
        attempt++;
        const errText = genError.message || '';
        const isRateLimit =
          genError.status === 429 ||
          errText.includes('429') ||
          errText.includes('RESOURCE_EXHAUSTED') ||
          errText.includes('rate limit') ||
          errText.includes('quota');

        if (isRateLimit && attempt < maxAttempts) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 400), 5000);
          console.warn(`[GEMINI_API_LOG] RequestId: ${requestId} | Transient 429 rate limit hit. Exponential backoff ${backoffMs}ms (Attempt ${attempt}/${maxAttempts})...`);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
        throw genError;
      }
    }

    // Safe text extraction — response.text getter can throw if candidates are empty/blocked
    let textContent;
    try {
      textContent = response?.text;
    } catch (extractError) {
      throw new Error(`Content was blocked or empty: ${extractError.message || 'No content returned from AI.'}`);
    }

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
    const estOutputTokens = Math.ceil(cleanText.length / 4);
    console.log(`[GEMINI_API_LOG] RequestId: ${requestId} | Timestamp: ${new Date().toISOString()} | Endpoint: ${endpoint} | Purpose: ${purpose} | User ID: ${userId} | PromptSize: ${prompt.length} chars | EstInputTokens: ${estInputTokens} | EstOutputTokens: ${estOutputTokens} | ExecutionTime: ${duration}ms | Status: SUCCESS`);

    // Store in response cache
    aiResponseCache.set(reqHash, { content: cleanText, timestamp: Date.now() });

    resolveInFlight(cleanText);
    return cleanText;

  } catch (error) {
    const duration = Date.now() - startTime;
    const errMsg = error.message || '';
    console.error(`[GEMINI_API_LOG] RequestId: ${requestId} | Timestamp: ${new Date().toISOString()} | Endpoint: ${endpoint} | Purpose: ${purpose} | User ID: ${userId} | PromptSize: ${prompt.length} chars | EstInputTokens: ${estInputTokens} | EstOutputTokens: 0 | ExecutionTime: ${duration}ms | Status: FAILURE | Error: ${errMsg}`);

    // Handle timeout errors
    if (errMsg.includes('timed out')) {
      const timeoutError = new Error('The AI request took too long to respond. Please try again.');
      timeoutError.statusCode = 504;
      rejectInFlight(timeoutError);
      throw timeoutError;
    }

    // Handle API key errors
    if (
      errMsg.includes('API_KEY_INVALID') ||
      (errMsg.includes('invalid') && errMsg.includes('key')) ||
      errMsg.includes('UNAUTHENTICATED') ||
      errMsg.includes('401') ||
      error.status === 401
    ) {
      const apiError = new Error('API_KEY_INVALID: The provided Gemini API key is invalid or has been revoked. Please check and update your API key in the Profile settings.');
      apiError.statusCode = 400;
      apiError.errorCode = 'API_KEY_INVALID';
      rejectInFlight(apiError);
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
      rejectInFlight(quotaError);
      throw quotaError;
    }

    if (errMsg.includes('safety') || errMsg.includes('blocked') || errMsg.includes('SAFETY')) {
      const safetyError = new Error('Content generation was blocked by AI safety settings. Please try adjusting your parameters.');
      rejectInFlight(safetyError);
      throw safetyError;
    }

    const genericError = new Error(`Gemini API error: ${errMsg}`);
    rejectInFlight(genericError);
    throw genericError;
  } finally {
    inFlightRequests.delete(reqHash);
    activeUserLocks.delete(userLockKey);
  }
};

// Helper to call Gemini API with fallback retry and secondary API key attempts
export const callGeminiWithFallback = async (prompt, req, purpose = 'general', endpointOverride = null) => {
  const { key, source } = await resolveApiKey(req);
  const userId = req?.user?.id || req?.user?._id || req?.ip || 'anonymous';
  const endpoint = endpointOverride || req?.originalUrl || req?.baseUrl || 'N/A';
  const meta = { userId, endpoint };
  
  if (!key) {
    throw new Error('Gemini API key is not configured on server and no custom key provided.');
  }

  try {
    return await callGemini(prompt, key, purpose, meta);
  } catch (firstError) {
    // Never try fallback key if the error was a rate limit 429, user lock, or prompt validation issue
    const isRateLimitOrLock =
      firstError.errorCode === 'CONCURRENT_REQUEST_LIMIT' ||
      firstError.errorCode === 'API_KEY_QUOTA_EXHAUSTED' ||
      firstError.statusCode === 429;

    if (!isRateLimitOrLock && source !== 'server' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== key.trim()) {
      console.warn(`[GEMINI_FALLBACK] Primary key (${source}) failed: ${firstError.message}. Trying server default fallback key...`);
      try {
        return await callGemini(prompt, process.env.GEMINI_API_KEY, `${purpose}_fallback`, meta);
      } catch (fallbackError) {
        console.error('[GEMINI_FALLBACK] Server default fallback key also failed:', fallbackError.message);
        throw fallbackError;
      }
    }
    throw firstError;
  }
};

// Helper to send quota-aware error responses
export const handleApiError = (error, res, defaultMessage) => {
  // Guard against double-response (headers already sent)
  if (res.headersSent) {
    console.error(`${defaultMessage} (headers already sent, cannot send error response):`, error.message || error);
    return;
  }

  console.error(defaultMessage + ':', error.message || error);

  // Use errorCode as primary discriminator, message as fallback
  if (error.errorCode === 'CONCURRENT_REQUEST_LIMIT' || error.message?.includes('CONCURRENT_REQUEST_LIMIT')) {
    return res.status(429).json({
      success: false,
      message: error.message.replace('CONCURRENT_REQUEST_LIMIT: ', ''),
      errorCode: 'CONCURRENT_REQUEST_LIMIT',
    });
  }

  if (error.errorCode === 'API_KEY_QUOTA_EXHAUSTED' || error.message?.includes('API_KEY_QUOTA_EXHAUSTED')) {
    return res.status(429).json({
      success: false,
      message: error.message.replace('API_KEY_QUOTA_EXHAUSTED: ', ''),
      errorCode: 'API_KEY_QUOTA_EXHAUSTED',
    });
  }

  if (error.errorCode === 'API_KEY_INVALID' || error.message?.includes('API_KEY_INVALID')) {
    return res.status(400).json({
      success: false,
      message: error.message.replace('API_KEY_INVALID: ', ''),
      errorCode: 'API_KEY_INVALID',
    });
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ success: false, message: error.message || defaultMessage });
};
