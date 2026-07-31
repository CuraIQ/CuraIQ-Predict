import React, { createContext, useContext, useState } from 'react';
import { User, loginApi, requestAccount } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, employeeId: string, email: string, role: string, department: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('curaiq_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('curaiq_token') || null);

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('curaiq_user', JSON.stringify(res.user));
    localStorage.setItem('curaiq_token', res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('curaiq_user');
    localStorage.removeItem('curaiq_token');
  };

  const register = async (name: string, employeeId: string, email: string, role: string, department: string) => {
    await requestAccount(name, employeeId, email, role, department);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user && !!token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
