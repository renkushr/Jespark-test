import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { User } from '../../types';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  lineLogin: (lineId: string, name: string, email?: string, pictureUrl?: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string, birthDate?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getMe();
      setUser({
        name: userData.name,
        tier: userData.tier,
        memberSince: userData.memberSince,
        points: userData.points,
        walletBalance: userData.walletBalance,
        avatar: userData.avatar,
      });
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      apiClient.clearToken();
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    apiClient.setToken(response.token);
    setUser({
      name: response.user.name,
      tier: response.user.tier,
      memberSince: response.user.memberSince,
      points: response.user.points,
      walletBalance: response.user.walletBalance,
      avatar: response.user.avatar,
    });
    setIsLoggedIn(true);
  };

  const lineLogin = async (lineId: string, name: string, email?: string, pictureUrl?: string) => {
    const response = await apiClient.lineLogin(lineId, name, email, pictureUrl);
    const token = response?.token;
    if (!token) {
      console.error('LINE login: no token in response', response);
      throw new Error('เข้าสู่ระบบไม่สำเร็จ — ไม่ได้รับ token');
    }
    apiClient.setToken(token);
    setUser({
      name: response.user.name,
      tier: response.user.tier,
      memberSince: response.user.memberSince,
      points: response.user.points,
      walletBalance: response.user.walletBalance,
      avatar: response.user.avatar,
    });
    setIsLoggedIn(true);
  };

  const register = async (email: string, password: string, name: string, phone?: string, birthDate?: string) => {
    const response = await apiClient.register(email, password, name, phone, birthDate);
    apiClient.setToken(response.token);
    await refreshUser();
  };

  const logout = () => {
    apiClient.clearToken();
    setIsLoggedIn(false);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, lineLogin, register, logout, updateUser, refreshUser }}>
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
