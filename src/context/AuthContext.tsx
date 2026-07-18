import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import api, { setAuthToken } from '../lib/api';
import { User } from '../types';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Cannot reach the API server. Make sure the backend is running.';
    }
    const data = error.response.data as { message?: string; errors?: { msg?: string }[] };
    return data?.message || data?.errors?.[0]?.msg || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const TOKEN_KEY = 'medicare_auth_token';

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        setAuthToken(token);
        try {
          const { data } = await api.get<{ user: User }>('/auth/me');
          setUser(data.user);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setAuthToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });

      localStorage.setItem(TOKEN_KEY, data.token);
      setAuthToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Login failed'));
    }
  };

  const register = async (email: string, password: string, fullName: string, role: string) => {
    try {
      await api.post('/auth/register', {
        email,
        password,
        fullName,
        role,
      });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Registration failed'));
    }
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
