import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../hooks/use-toast';

interface User {
  id: string;
  name?: string;
  email: string;
  hasApiKey?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe JSON parse for localStorage data
const safeJsonParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse stored data, clearing corrupted value:', error);
    return fallback;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Stable logout function (memoized to avoid dependency issues)
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mockverse_token');
    localStorage.removeItem('mockverse_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  }, [toast]);

  // Listen for auth-expired events from apiService (auto-logout on 401)
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

    window.addEventListener('mockverse:auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('mockverse:auth-expired', handleAuthExpired);
    };
  }, [toast]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('mockverse_token');
      const storedUser = safeJsonParse<User | null>(
        localStorage.getItem('mockverse_user'),
        null,
      );

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Verify session validity against profile endpoint
        try {
          const res = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (!res.ok) {
            // Token expired or invalid — clear auth state
            setToken(null);
            setUser(null);
            localStorage.removeItem('mockverse_token');
            localStorage.removeItem('mockverse_user');
          } else {
            const userData = await res.json();
            const enrichedUser = { ...userData, hasApiKey: !!userData.hasApiKey };
            setUser(enrichedUser);
            localStorage.setItem('mockverse_user', JSON.stringify(enrichedUser));
          }
        } catch (error) {
          console.error('Failed to verify profile session:', error);
          // Keep offline state if server is momentarily down
        }
      } else {
        // Clean up any partial state
        if (storedToken || storedUser) {
          localStorage.removeItem('mockverse_token');
          localStorage.removeItem('mockverse_user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error('Unexpected server response. Please try again.');
      }

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      const userProfile = { id: data.id, name: data.name, email: data.email, hasApiKey: !!data.hasApiKey };
      setUser(userProfile);

      localStorage.setItem('mockverse_token', data.token);
      localStorage.setItem('mockverse_user', JSON.stringify(userProfile));

      toast({
        title: "Welcome Back!",
        description: `Logged in successfully as ${data.name || data.email}`,
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
  }, [API_URL, toast]);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error('Unexpected server response. Please try again.');
      }

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setToken(data.token);
      const userProfile = { id: data.id, name: data.name, email: data.email, hasApiKey: !!data.hasApiKey };
      setUser(userProfile);

      localStorage.setItem('mockverse_token', data.token);
      localStorage.setItem('mockverse_user', JSON.stringify(userProfile));

      toast({
        title: "Account Created!",
        description: `Welcome to MockVerse, ${data.name || data.email}!`,
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
  }, [API_URL, toast]);

  const value = useMemo(() => ({
    user,
    token,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!token,
  }), [user, token, login, signup, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
