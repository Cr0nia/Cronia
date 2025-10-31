import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthApi, type AuthResponse, type SignupRequest } from '@/services/backend';
import type { User, Wallet } from '@/types/backend';
import { setAuthToken } from '@/services/api';

const TOKEN_KEY = '@cronia/token';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  initializing: boolean;
  loading: boolean;
  primaryWallet: Wallet | null;
  signup: (data: SignupRequest) => Promise<AuthResponse>;
  login: (data: { email: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStoredSession().finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    setAuthToken(token);
    if (!token) {
      setUser(null);
    }
  }, [token]);

  const loadStoredSession = async () => {
    try {
      const stored = await AsyncStorage.getItem(TOKEN_KEY);
      if (!stored) return;
      setToken(stored);
      await fetchMe(stored);
    } catch (error) {
      console.warn('Failed to restore session', error);
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  };

  const persistToken = async (newToken: string | null) => {
    if (newToken) {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  };

  const fetchMe = async (useToken?: string) => {
    try {
      if (useToken) setAuthToken(useToken);
      const me = await AuthApi.me();
      setUser(me);
    } catch (error) {
      console.warn('Failed to fetch session', error);
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem(TOKEN_KEY);
      throw error;
    }
  };

  const handleAuthSuccess = async (response: AuthResponse) => {
    setToken(response.token);
    await persistToken(response.token);
    await fetchMe(response.token);
    return response;
  };

  const signup = async (data: SignupRequest) => {
    setLoading(true);
    try {
      const response = await AuthApi.signup(data);
      return await handleAuthSuccess(response);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await AuthApi.login(data);
      return await handleAuthSuccess(response);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      setToken(null);
      setAuthToken(null);
      await persistToken(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await fetchMe(token);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(() => {
    const primaryWallet = user?.wallets?.[0] ?? null;
    return {
      user,
      token,
      initializing,
      loading,
      primaryWallet,
      signup,
      login,
      logout,
      refresh,
      isAuthenticated: Boolean(token),
    };
  }, [user, token, initializing, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
