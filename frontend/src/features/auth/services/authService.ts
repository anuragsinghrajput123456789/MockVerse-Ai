import {
  loginUser as apiLoginUser,
  signupUser as apiSignupUser,
  verifyProfileSession as apiVerifyProfileSession
} from '../../../shared/services/authService';
import { User } from '../utils/tokenStorage';

export interface AuthResult {
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<AuthResult> => {
  const data = await apiLoginUser(email, password);
  return {
    token: data.token,
    user: {
      id: data.id,
      name: data.name,
      email: data.email,
      hasApiKey: !!data.hasApiKey,
    },
  };
};

export const signup = async (name: string, email: string, password: string): Promise<AuthResult> => {
  const data = await apiSignupUser(name, email, password);
  return {
    token: data.token,
    user: {
      id: data.id,
      name: data.name,
      email: data.email,
      hasApiKey: !!data.hasApiKey,
    },
  };
};

export const verifySession = async (token: string): Promise<User> => {
  const userData = await apiVerifyProfileSession(token);
  return {
    ...userData,
    hasApiKey: !!userData.hasApiKey,
  };
};
