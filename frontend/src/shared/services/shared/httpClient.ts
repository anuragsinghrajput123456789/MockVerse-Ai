import { API_BASE_URL, DEFAULT_TIMEOUT } from './apiConfig';
import { getHeaders } from './apiHelpers';
import { fetchWithRetry } from './retry';
import { parseApiError } from './errorHandler';

// Helper to create a fetch request with timeout
export const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
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

/**
 * Unified HTTP fetch wrapper with automatic header resolution, retries, and error handling.
 */
export const httpFetch = async (
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT,
  defaultErrorMsg: string = 'API Request Failed'
): Promise<Response> => {
  const isJson = !(options.body instanceof FormData);
  const defaultHeaders = getHeaders(isJson);
  const headers = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const res = await fetchWithRetry(
    url,
    { ...options, headers },
    timeoutMs,
    defaultErrorMsg
  );

  if (!res.ok) {
    throw await parseApiError(res, defaultErrorMsg);
  }

  return res;
};

export const httpGet = async <T = any>(
  endpoint: string,
  timeoutMs: number = DEFAULT_TIMEOUT,
  defaultErrorMsg: string = 'Request failed'
): Promise<T> => {
  const res = await httpFetch(endpoint, { method: 'GET' }, timeoutMs, defaultErrorMsg);
  return await res.json();
};

export const httpPost = async <T = any>(
  endpoint: string,
  body?: any,
  timeoutMs: number = DEFAULT_TIMEOUT,
  defaultErrorMsg: string = 'Request failed'
): Promise<T> => {
  const formattedBody = typeof body === 'string' || body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined);
  const res = await httpFetch(
    endpoint,
    {
      method: 'POST',
      body: formattedBody,
    },
    timeoutMs,
    defaultErrorMsg
  );
  return await res.json();
};

export const httpPut = async <T = any>(
  endpoint: string,
  body?: any,
  timeoutMs: number = DEFAULT_TIMEOUT,
  defaultErrorMsg: string = 'Request failed'
): Promise<T> => {
  const formattedBody = typeof body === 'string' || body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined);
  const res = await httpFetch(
    endpoint,
    {
      method: 'PUT',
      body: formattedBody,
    },
    timeoutMs,
    defaultErrorMsg
  );
  return await res.json();
};

export const httpDelete = async <T = any>(
  endpoint: string,
  timeoutMs: number = DEFAULT_TIMEOUT,
  defaultErrorMsg: string = 'Request failed'
): Promise<T> => {
  const res = await httpFetch(endpoint, { method: 'DELETE' }, timeoutMs, defaultErrorMsg);
  return await res.json();
};

export const httpBlob = async (
  endpoint: string,
  timeoutMs: number = DEFAULT_TIMEOUT,
  defaultErrorMsg: string = 'Download failed'
): Promise<Blob> => {
  const res = await httpFetch(endpoint, { method: 'GET' }, timeoutMs, defaultErrorMsg);
  return await res.blob();
};
