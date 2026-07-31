import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, loginApi, DEMO_USERS } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  quickLogin: (preset: 'doctor' | 'admin') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('curaiq_user');
    return saved ? JSON.parse(saved) : null; 
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('curaiq_token') || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('curaiq_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('curaiq_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('curaiq_token', token);
    } else {
      localStorage.removeItem('curaiq_token');
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password);
    setUser(res.user);
    setToken(res.token);
  };

  const quickLogin = async (preset: 'doctor' | 'admin') => {
    const presetUser = DEMO_USERS[preset] as any;
    await login(presetUser.email, presetUser.passwordHash);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('curaiq_user');
    localStorage.removeItem('curaiq_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
