import { DEFAULT_TIMEOUT } from './shared/apiConfig';
import { httpPost, httpFetch } from './shared/httpClient';

export const loginUser = async (email: string, password: string): Promise<any> => {
  return httpPost('/auth/login', { email, password }, DEFAULT_TIMEOUT, 'Login failed');
};

export const signupUser = async (name: string, email: string, password: string): Promise<any> => {
  return httpPost('/auth/signup', { name, email, password }, DEFAULT_TIMEOUT, 'Signup failed');
};

export const verifyProfileSession = async (token: string): Promise<any> => {
  const res = await httpFetch(
    '/auth/profile',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    DEFAULT_TIMEOUT,
    'Failed to verify profile session'
  );
  return await res.json();
};
