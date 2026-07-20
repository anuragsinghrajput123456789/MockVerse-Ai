import { safeJsonParse } from './authHelpers';

export interface User {
  id: string;
  name?: string;
  email: string;
  hasApiKey?: boolean;
}

export const getStoredToken = (): string | null => {
  return localStorage.getItem('mockverse_token');
};

export const getStoredUser = (): User | null => {
  return safeJsonParse<User | null>(localStorage.getItem('mockverse_user'), null);
};

export const setStoredAuth = (token: string, user: User): void => {
  localStorage.setItem('mockverse_token', token);
  localStorage.setItem('mockverse_user', JSON.stringify(user));
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem('mockverse_token');
  localStorage.removeItem('mockverse_user');
};
