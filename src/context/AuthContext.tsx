import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { setDatabaseUser, migrateFromLegacyDB } from '../db/clinicDB';

// ─── MODO OFFLINE: Descomenta las líneas de 'api' y elimina MOCK_USER
// ─── cuando el backend esté operativo nuevamente. ─────────────────────────────
// import api from '../services/api';

const MOCK_USER = {
  id: 'offline-user-001',
  email: 'demo@clinicmanager.local',
  name: 'Usuario Demo',
  plan: 'FULL_ACCESS' as const,
  role: 'ADMIN' as const,
  createdAt: new Date().toISOString(),
};

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

// ─── Helpers (no usados en modo offline, pero mantenidos para restaurar fácil) ─
const STORAGE_KEYS = {
  ACCESS: 'cm_access_token',
  REFRESH: 'cm_refresh_token',
  USER: 'cm_user',
} as const;

void STORAGE_KEYS; // evita warning de unused en modo offline

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, _setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((newUser: AuthUser | null) => {
    if (newUser) {
      setDatabaseUser(newUser.id);
      migrateFromLegacyDB(newUser.id).catch(err => {
        console.error('Migration error:', err);
      });
    } else {
      setDatabaseUser();
    }
    _setUser(newUser);
  }, []);

  // ── MODO OFFLINE: Auto-login con usuario mock ─────────────────────────────
  // TODO: Restaurar lógica original cuando el backend esté operativo.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialize = useCallback(async () => {
    setUser(MOCK_USER);
    setIsLoading(false);
  }, []);
  // ── FIN MODO OFFLINE ──────────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const signInWithGoogle = useCallback(() => {
    // MODO OFFLINE: login directo sin Google OAuth
    setUser(MOCK_USER);
  }, []);

  const signOut = useCallback(() => {
    // MODO OFFLINE: solo limpia el estado local
    _setUser(null);
    setDatabaseUser();
    window.location.href = '/';
  }, []);

  const refreshUser = useCallback(async () => {
    // MODO OFFLINE: no-op
  }, []);

  // Inicializar al montar
  useEffect(() => {
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    plan: user?.plan ?? null,
    isFullAccess: !!user,
    isTrial: false,
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
