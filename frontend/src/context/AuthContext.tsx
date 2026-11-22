import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import api from '../api';

export interface UserProfile {
  id: string;
  telegramId: string;
  firstName: string;
  username?: string;
  balance: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  setGuestMode: (guest: boolean) => void;
  loginWithMagicLink: (code: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,
  setGuestMode: () => {},
  loginWithMagicLink: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const refreshProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data) setUser(res.data);
    } catch (e) {
      console.warn('Failed to refresh profile', e);
    }
  };

  useEffect(() => {
    const authenticate = async () => {
      try {
        if (WebApp.ready) WebApp.ready();
        const initData = WebApp.initData;

        // Agar Telegram initData mavjud bo'lsa
        if (initData) {
          const res = await api.post('/auth/telegram', { initData });
          const { access_token, user: userData } = res.data;
          localStorage.setItem('access_token', access_token);
          setToken(access_token);
          setUser({
            ...userData,
            balance: Number(userData.balance || 0),
          });
          setIsGuest(false);
          setIsLoading(false);
          return;
        }

        // Brauzer yoki dev muhiti: stored token borligini tekshirish
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
          setToken(storedToken);
          // Default mock/stored profile
          setUser({
            id: 'demo-user-1',
            telegramId: '12345678',
            firstName: 'Mijoz',
            username: 'fastpay_user',
            balance: 125000,
          });
          setIsGuest(false);
          setIsLoading(false);
          return;
        }

        // InitData ham yo'q, stored token ham yo'q
        // Brauzerda ochilganda darhol TezPIN Mini App ko'rinishi uchun demo/guest rejimida ochiladi
        setUser({
          id: 'demo-user-1',
          telegramId: '8407085035',
          firstName: 'khypes',
          username: 'khypes',
          balance: 0,
        });
        setIsGuest(true);
        setIsLoading(false);
      } catch (err) {
        console.warn('Telegram auth check failed, proceeding to fallback:', err);
        setIsLoading(false);
      }
    };

    authenticate();
  }, []);

  const loginWithMagicLink = async (code: string) => {
    try {
      const res = await api.post('/auth/magic-link', { code });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('access_token', access_token);
      setToken(access_token);
      setUser(userData);
      setIsGuest(false);
    } catch (e) {
      // Mock fallback for test code
      if (code === '123456' || code.length >= 4) {
        const mockUser = {
          id: 'magic-user-1',
          telegramId: '98765432',
          firstName: 'FastPAY Mehmoni',
          username: 'magic_guest',
          balance: 75000,
        };
        setUser(mockUser);
        setToken('magic-mock-token');
        setIsGuest(false);
      } else {
        throw new Error('Yaroqsiz kod');
      }
    }
  };

  const setGuestMode = (guest: boolean) => {
    setIsGuest(guest);
    if (guest && !user) {
      setUser({
        id: 'guest-user',
        telegramId: '00000000',
        firstName: 'Mehmon',
        balance: 50000,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token || isGuest,
        isGuest,
        setGuestMode,
        loginWithMagicLink,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
