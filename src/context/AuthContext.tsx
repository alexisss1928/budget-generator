import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import api from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserPlan = 'FREE' | 'FULL_ACCESS';
export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  plan: UserPlan;
  role: UserRole;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  plan: UserPlan | null;
  isFullAccess: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  ACCESS: 'cm_access_token',
  REFRESH: 'cm_refresh_token',
  USER: 'cm_user',
} as const;

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function clearStorage() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS);
  localStorage.removeItem(STORAGE_KEYS.REFRESH);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Initialize from localStorage ─────────────────────────────────────────
  const initialize = useCallback(async () => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS);

    if (!storedUser || !accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      // Validate token with backend
      const { data } = await api.get<AuthUser>('/auth/me');
      setUser(data);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
    } catch {
      // Token invalid — try refresh (handled by interceptor)
      clearStorage();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for OAuth callback tokens in URL
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userParam = params.get('user');

    if (accessToken && refreshToken && userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem(STORAGE_KEYS.ACCESS, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsedUser));
        setUser(parsedUser);
        // Clean up URL
        window.history.replaceState({}, '', '/');
      } catch (e) {
        console.error('Failed to parse auth callback params', e);
      }
      setIsLoading(false);
    } else {
      initialize();
    }
  }, [initialize]);

  const signInWithGoogle = useCallback(() => {
    window.location.href = `${API_BASE}/auth/google`;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    clearStorage();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<AuthUser>('/auth/me');
      setUser(data);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
    } catch {
      clearStorage();
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    plan: user?.plan ?? null,
    isFullAccess: user?.plan === 'FULL_ACCESS' || user?.role === 'ADMIN',
    signInWithGoogle,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
