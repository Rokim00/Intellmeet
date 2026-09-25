import { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '@/api/auth/auth.api';
import { setAccessToken, getAccessToken } from '@/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@/hooks/useApi';
import { queryKeys } from '@/api/queryClient';
import type { User, LoginDTO, SignupDTO } from '@/api/auth/auth.types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (dto: LoginDTO) => Promise<void>;
  signup: (dto: SignupDTO) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-reads the current profile, e.g. after the organization changed. */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // The session is restored through TanStack Query rather than a useEffect, so
  // StrictMode's double mount joins the in-flight request instead of sending a
  // second one, and the result is cached for the rest of the session.
  // Tracked as state because localStorage alone never triggers a re-render.
  const [hasToken, setHasToken] = useState(() => getAccessToken() !== null);

  const { data, error } = useQuery<User>(queryKeys.auth.me, () => authApi.getMe(), {
    enabled: hasToken,
    staleTime: 60_000,
  });

  const clearSession = useCallback(() => {
    setAccessToken(null);
    queryClient.clear();
    setHasToken(false);
  }, [queryClient]);

  // A rejected profile means the token is no longer usable. This only touches
  // external systems (localStorage + the query cache); the signed-out state is
  // derived from `error` below rather than being set here, which would cause a
  // cascading render. A ref keeps it to a single clear per failed session.
  const clearedForError = useRef(false);
  useEffect(() => {
    if (error && hasToken && !clearedForError.current) {
      clearedForError.current = true;
      setAccessToken(null);
      queryClient.clear();
    }
    if (!error) {
      clearedForError.current = false;
    }
  }, [error, hasToken, queryClient]);

  // Derive rather than store: an errored session is treated as signed out.
  const user = error ? null : (data ?? null);
  const loading = hasToken && !user && !error;

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
  }, [queryClient]);

  const login = useCallback(
    async (dto: LoginDTO) => {
      const { data } = await authApi.login(dto);
      setAccessToken(data.data.accessToken);
      queryClient.setQueryData(queryKeys.auth.me, data.data.user);
      setHasToken(true);
    },
    [queryClient]
  );

  const signup = useCallback(
    async (dto: SignupDTO) => {
      const { data } = await authApi.register(dto);
      setAccessToken(data.data.accessToken);
      queryClient.setQueryData(queryKeys.auth.me, data.data.user);
      setHasToken(true);
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Cached queries are user-scoped; the next user must never read them.
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user: user ?? null,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      refreshProfile,
    }),
    [user, loading, login, signup, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
