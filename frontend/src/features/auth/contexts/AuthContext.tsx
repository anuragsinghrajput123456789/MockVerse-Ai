import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../../../shared/hooks/use-toast';
import { login, signup, verifySession } from '../services/authService';
import { User, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth } from '../utils/tokenStorage';
import { listenToAuthExpired } from '../utils/sessionManager';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Stable logout function
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  }, [toast]);

  // Listen for auth-expired events (auto-logout on 401)
  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
    };

    return listenToAuthExpired(handleAuthExpired);
  }, [toast]);

  // Initialize Authentication State
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Verify session validity against profile endpoint
        try {
          const verifiedUser = await verifySession(storedToken);
          setUser(verifiedUser);
          setStoredAuth(storedToken, verifiedUser);
        } catch (error) {
          console.error('Failed to verify profile session:', error);
          // Keep offline state if server is momentarily down
        }
      } else {
        // Clean up any partial state
        if (storedToken || storedUser) {
          clearStoredAuth();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await login(email, password);

      setToken(result.token);
      setUser(result.user);
      setStoredAuth(result.token, result.user);

      toast({
        title: "Welcome Back!",
        description: `Logged in successfully as ${result.user.name || result.user.email}`,
      });
      return true;
    } catch (error: any) {
      console.error('Login service error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSignup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await signup(name, email, password);

      setToken(result.token);
      setUser(result.user);
      setStoredAuth(result.token, result.user);

      toast({
        title: "Account Created!",
        description: `Welcome to MockVerse, ${result.user.name || result.user.email}!`,
      });
      return true;
    } catch (error: any) {
      console.error('Signup service error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const value = useMemo(() => ({
    user,
    token,
    login: handleLogin,
    signup: handleSignup,
    logout,
    loading,
    isAuthenticated: !!token,
  }), [user, token, handleLogin, handleSignup, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
