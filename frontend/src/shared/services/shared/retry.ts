import { fetchWithTimeout } from './httpClient';
import { parseApiError } from './errorHandler';

// Retry wrapper for transient 5xx errors (1 retry with backoff)
export const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  timeoutMs: number,
  defaultErrorMsg: string,
): Promise<Response> => {
  let lastError: any;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs);

      // Never retry client error 400 or rate limit / quota exhaustion 429
      if (res.status === 429 || res.status === 400 || res.status === 401) {
        return res;
      }

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
