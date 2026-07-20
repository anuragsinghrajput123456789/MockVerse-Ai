import { DEFAULT_TIMEOUT } from './shared/apiConfig';
import { httpGet, httpPut, httpDelete } from './shared/httpClient';

// Save user's Gemini API key
export const saveUserApiKey = async (apiKey: string): Promise<{ message: string; maskedKey: string; hasApiKey: boolean }> => {
  return httpPut('/auth/api-key', { apiKey }, DEFAULT_TIMEOUT, 'Failed to save API key');
};

// Get user's masked API key
export const getUserApiKey = async (): Promise<{ hasApiKey: boolean; maskedKey: string | null }> => {
  return httpGet('/auth/api-key', DEFAULT_TIMEOUT, 'Failed to fetch API key info');
};

// Delete user's stored API key
export const deleteUserApiKey = async (): Promise<{ message: string; hasApiKey: boolean }> => {
  return httpDelete('/auth/api-key', DEFAULT_TIMEOUT, 'Failed to delete API key');
};
