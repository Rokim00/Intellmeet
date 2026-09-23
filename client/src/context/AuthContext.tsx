import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '@/api/auth/auth.api';
import { setAccessToken, getAccessToken } from '@/api/client';
import type { User, LoginDTO, SignupDTO } from '@/api/auth/auth.types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (dto: LoginDTO) => Promise<void>;
  signup: (dto: SignupDTO) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('intellmeet_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('intellmeet_user');
      const token = localStorage.getItem('intellmeet_token');
      return !(saved && token);
    }
    return false;
  });

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const savedToken = getAccessToken();

      if (!savedToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        // Verify current active token with backend
        const { data: meData } = await authApi.getMe();
        if (active && meData?.data) {
          setUser(meData.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('intellmeet_user', JSON.stringify(meData.data));
          }
        }
      } catch (err) {
        // If access token expired, try to rotate via refresh-token endpoint
        try {
          const { data: refreshData } = await authApi.refreshToken();
          const token = refreshData?.data?.accessToken;
          if (token) {
            setAccessToken(token);
            const { data: meData } = await authApi.getMe();
            if (active && meData?.data) {
              setUser(meData.data);
              if (typeof window !== 'undefined') {
                localStorage.setItem('intellmeet_user', JSON.stringify(meData.data));
              }
            }
          } else {
            throw new Error('No new token returned');
          }
        } catch {
          // If refresh also failed, clear session
          setAccessToken(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('intellmeet_user');
          }
          if (active) setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (dto: LoginDTO) => {
    const { data } = await authApi.login(dto);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('intellmeet_user', JSON.stringify(data.data.user));
    }
  }, []);

  const signup = useCallback(async (dto: SignupDTO) => {
    const { data } = await authApi.register(dto);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('intellmeet_user', JSON.stringify(data.data.user));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('intellmeet_user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
