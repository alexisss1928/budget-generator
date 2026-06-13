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

export type UserPlan = 'FREE' | 'FREE_TRIAL' | 'FULL_ACCESS';
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
  isTrial: boolean;
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
      // Intentar decodificar el payload del JWT
      const payloadPart = accessToken.split('.')[1];
      if (payloadPart) {
        const decoded = JSON.parse(atob(payloadPart));
        const isExpired = decoded.exp * 1000 < Date.now();
        const plan = decoded.plan;

        if (!isExpired && (plan === 'FULL_ACCESS' || plan === 'FREE_TRIAL')) {
          // Fast Path para PRO: Entrar inmediatamente usando caché local
          setUser(JSON.parse(storedUser));
          setIsLoading(false);

          // Actualizar la sesión en segundo plano silenciosamente
          api.get<AuthUser>('/auth/me').then(({ data }) => {
            setUser(data);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
          }).catch(() => {
            // Si el token es revocado, eventualmente se cerrará la sesión en otra llamada,
            // por ahora no bloqueamos.
          });
          return;
        }
      }
    } catch (e) {
      // Falla la decodificación, seguimos con el flujo normal
    }

    try {
      // Validate token with backend (Slow Path para Free o usuarios sin token largo)
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
        // Plant floor entries BEFORE cleaning the URL so Google OAuth pages
        // are buried deep. Three entries ensure pressing back always hits our
        // floor first, never Google directly.
        window.history.replaceState({ appFloor: true }, '', '/');
        window.history.pushState({ appFloor: true }, '', '/');
        window.history.pushState({ appFloor: true }, '', '/');
        // (InnerApp will detect these and not plant its own, just push the section)
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

  const signOut = useCallback(() => {
    // 1. Limpiar storage y estado inmediatamente para que el UI reaccione sin esperar
    clearStorage();
    setUser(null);

    // 2. Hacer la petición de logout en segundo plano (fire-and-forget)
    // Así si Render está dormido, no bloquea al usuario.
    api.post('/auth/logout').catch(() => {
      // ignore
    });

    // 3. Forzar redirección para limpiar el stack de navegación (history traps de la PWA) y variables en memoria
    window.location.href = '/';
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
    isFullAccess: user?.plan === 'FULL_ACCESS' || user?.plan === 'FREE_TRIAL' || user?.role === 'ADMIN',
    isTrial: user?.plan === 'FREE_TRIAL',
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
