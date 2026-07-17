const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Timeout durations (ms)
const DEFAULT_TIMEOUT = 10000;  // 10s for CRUD operations
const AI_TIMEOUT = 120000;      // 2min for AI generation endpoints

// Helper to get auth headers
const getHeaders = (isJson = true): Record<string, string> => {
  const token = localStorage.getItem('mockverse_token');
  const headers: Record<string, string> = {};

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Helper to create a fetch request with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw new Error(`Network error: ${error.message || 'Unable to reach the server. Please check your connection.'}`);
  } finally {
    clearTimeout(timeoutId);
  }
};

// Helper to parse API errors with quota detection and 401 auto-logout
const parseApiError = async (res: Response, defaultMsg: string) => {
  let errorData: any;
  try {
    errorData = await res.json();
  } catch {
    errorData = { message: defaultMsg };
  }

  const error: any = new Error(errorData.message || defaultMsg);
  error.errorCode = errorData.errorCode || null;
  error.statusCode = res.status;

  // Auto-logout on 401 (token expired/invalid)
  if (res.status === 401) {
    const token = localStorage.getItem('mockverse_token');
    if (token) {
      // Token exists but server rejected it — clear auth state
      localStorage.removeItem('mockverse_token');
      localStorage.removeItem('mockverse_user');
      // Dispatch a custom event so AuthContext can react
      window.dispatchEvent(new CustomEvent('mockverse:auth-expired'));
    }
  }

  return error;
};

// Retry wrapper for transient 5xx errors (1 retry with backoff)
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  timeoutMs: number,
  defaultErrorMsg: string,
): Promise<Response> => {
  let lastError: any;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs);

      // Only retry on 502, 503, 504 (transient server errors)
      if (res.status >= 502 && res.status <= 504 && attempt === 0) {
        lastError = await parseApiError(res, defaultErrorMsg);
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      return res;
    } catch (error: any) {
      lastError = error;
      if (attempt === 0 && error.message?.includes('Network error')) {
        // Wait 1 second before retry for network errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
};

// ─── Question Paper API ───────────────────────────────────────────────────────

// Generate Question Paper
export const generateQuestionPaper = async (formData: any): Promise<any> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/papers`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        subject: formData.subject,
        class: formData.class,
        totalMarks: Number(formData.totalMarks) || 100,
        difficulty: formData.difficulty,
        board: formData.board,
        chapters: formData.chapters,
        topics: formData.topics || '',
        instructions: formData.instructions || '',
        pattern: formData.pattern,
        customPatternDetails: formData.customPatternDetails || '',
      }),
    },
    AI_TIMEOUT,
    'Failed to generate question paper',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to generate question paper');
  }

  const data = await res.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
};

// Get all papers (history)
export const getPapers = async (): Promise<any[]> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/papers`,
    {
      method: 'GET',
      headers: getHeaders(),
    },
    DEFAULT_TIMEOUT,
    'Failed to fetch paper history',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to fetch paper history');
  }

  const data = await res.json();
  return data.map((paper: any) => ({
    ...paper,
    createdAt: new Date(paper.createdAt),
  }));
};

// Get details of a specific paper
export const getPaperById = async (id: string): Promise<any> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/papers/${id}`,
    {
      method: 'GET',
      headers: getHeaders(),
    },
    DEFAULT_TIMEOUT,
    'Failed to fetch paper details',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to fetch paper details');
  }

  const data = await res.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
};

// Delete a paper
export const deletePaper = async (id: string): Promise<any> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/papers/${id}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    },
    DEFAULT_TIMEOUT,
    'Failed to delete question paper',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to delete question paper');
  }

  return await res.json();
};

// Generate Solutions
export const generateSolutions = async (paperId: string): Promise<string> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/papers/${paperId}/solutions`,
    {
      method: 'POST',
      headers: getHeaders(),
    },
    AI_TIMEOUT,
    'Failed to generate solutions',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to generate solutions');
  }

  const data = await res.json();
  return data.solutions;
};

// Evaluate submitted answers
export const evaluateAnswers = async (paperId: string, answers: string[]): Promise<string> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/papers/${paperId}/evaluate`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answers }),
    },
    AI_TIMEOUT,
    'Failed to evaluate answers',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to evaluate answers');
  }

  const data = await res.json();
  return data.evaluationResult;
};

// Send chatbot message
export const sendChatMessage = async (
  message: string,
  paperId?: string,
  history?: { text: string; isUser: boolean }[]
): Promise<string> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/chat`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, paperId, history }),
    },
    AI_TIMEOUT,
    'Failed to send message to chatbot',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to send message to chatbot');
  }

  const data = await res.json();
  return data.response;
};

// ─── API Key Management ───────────────────────────────────────────────────────

// Save user's Gemini API key
export const saveUserApiKey = async (apiKey: string): Promise<{ message: string; maskedKey: string; hasApiKey: boolean }> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/auth/api-key`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ apiKey }),
    },
    DEFAULT_TIMEOUT,
    'Failed to save API key',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to save API key');
  }

  return await res.json();
};

// Get user's masked API key
export const getUserApiKey = async (): Promise<{ hasApiKey: boolean; maskedKey: string | null }> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/auth/api-key`,
    {
      method: 'GET',
      headers: getHeaders(),
    },
    DEFAULT_TIMEOUT,
    'Failed to fetch API key info',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to fetch API key info');
  }

  return await res.json();
};

// Delete user's stored API key
export const deleteUserApiKey = async (): Promise<{ message: string; hasApiKey: boolean }> => {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/auth/api-key`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    },
    DEFAULT_TIMEOUT,
    'Failed to delete API key',
  );

  if (!res.ok) {
    throw await parseApiError(res, 'Failed to delete API key');
  }

  return await res.json();
};
