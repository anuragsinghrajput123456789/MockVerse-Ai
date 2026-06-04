import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';

interface User {
  id: string;
  name?: string;
  email: string;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('mockverse_token');
      const storedUser = localStorage.getItem('mockverse_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Optionally verify session validity against profile endpoint
        try {
          const res = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (!res.ok) {
            // Token expired or invalid
            logout();
          } else {
            const userData = await res.json();
            setUser(userData);
            localStorage.setItem('mockverse_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Failed to verify profile session:', error);
          // Keep offline state if server is momentarily down
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      const userProfile = { id: data.id, name: data.name, email: data.email };
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
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setToken(data.token);
      const userProfile = { id: data.id, name: data.name, email: data.email };
      setUser(userProfile);

      localStorage.setItem('mockverse_token', data.token);
      localStorage.setItem('mockverse_user', JSON.stringify(userProfile));

      toast({
        title: "Account Created!",
        description: `Welcome to MockVerse, ${data.name}!`,
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
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mockverse_token');
    localStorage.removeItem('mockverse_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
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
