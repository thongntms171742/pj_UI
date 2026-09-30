/**
 * AuthContext — wraps login/logout and exposes the active session.
 * Mirrors the auth state held in `App.tsx` on the web (lines 314–351 of
 * frontend/src/app/App.tsx).
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';
import { ApiError, setToken } from '../api/client';
import { STORAGE_KEYS, getStoredJSON, setStoredJSON, removeStored } from '../utils/storage';
import type { SessionUser } from '../types';

interface AuthContextValue {
  session: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  showToast: (msg: string) => void;
  toastMsg: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Hydrate from storage on mount
  useEffect(() => {
    (async () => {
      const stored = await getStoredJSON<SessionUser>(STORAGE_KEYS.session);
      if (stored?.token) {
        setSession(stored);
        await setToken(stored.token);
      }
      setLoading(false);
    })();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await authApi.login({ email, password });
        const next: SessionUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          token: res.token,
          roles: res.user.roles,
          avatarUrl: res.user.avatarUrl,
          sellerStatus: res.user.sellerStatus ?? 'NONE',
        };
        await setToken(next.token);
        await setStoredJSON(STORAGE_KEYS.session, next);
        setSession(next);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Đăng nhập thất bại';
        showToast(`⚠️ ${msg}`);
        throw err;
      }
    },
    [showToast],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const res = await authApi.register({ name, email, password });
        const next: SessionUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          token: res.token,
          roles: res.user.roles,
          avatarUrl: res.user.avatarUrl,
          sellerStatus: res.user.sellerStatus ?? 'NONE',
        };
        await setToken(next.token);
        await setStoredJSON(STORAGE_KEYS.session, next);
        setSession(next);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Đăng ký thất bại';
        showToast(`⚠️ ${msg}`);
        throw err;
      }
    },
    [showToast],
  );

  const logout = useCallback(async () => {
    // Best-effort cleanup. Each step is wrapped so a single failure (e.g.
    // AsyncStorage quota exceeded, network timeout) does NOT prevent
    // session from being cleared in memory. The in-memory clear is the
    // authoritative step that triggers navigation back to AuthNavigator.
    setSession(null);
    setLoading(false);

    const errors: string[] = [];
    try {
      await setToken(null);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
    try {
      await removeStored(STORAGE_KEYS.session);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
    try {
      await removeStored(STORAGE_KEYS.cart);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
    try {
      await removeStored(STORAGE_KEYS.likedProducts);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    if (errors.length > 0) {
      // Surface a non-blocking warning; session is already cleared.
      showToast(`⚠️ Logout cleanup warning: ${errors.join('; ')}`);
    }
  }, [showToast]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, loading, login, register, logout, showToast, toastMsg }),
    [session, loading, login, register, logout, showToast, toastMsg],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}