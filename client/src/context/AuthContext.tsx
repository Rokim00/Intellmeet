import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api, { setAccessToken } from '../services/api';
import type { User, LoginDTO, SignupDTO, AuthResponse } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  signup: (userData: SignupDTO) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authenticated session on app initialization
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        // 1. Attempt token refresh using the HTTP-only cookie set by backend
        const refreshResponse = await api.post<{ data: { accessToken: string } }>('/refresh');
        const token = refreshResponse.data?.data?.accessToken;

        if (token) {
          setAccessToken(token);

          // 2. Fetch authenticated user profile
          const userResponse = await api.get<{ data: User }>('/me');
          if (isMounted) {
            setUser(userResponse.data?.data || null);
          }
        }
      } catch {
        // If refresh fails (no cookie / expired session), reset state cleanly
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginDTO): Promise<void> => {
    const response = await api.post<AuthResponse>('/login', credentials);
    const { user: loggedInUser, accessToken } = response.data.data;
    setAccessToken(accessToken);
    setUser(loggedInUser);
  };

  const signup = async (userData: SignupDTO): Promise<void> => {
    const response = await api.post<AuthResponse>('/signup', userData);
    const { user: registeredUser, accessToken } = response.data.data;
    setAccessToken(accessToken);
    setUser(registeredUser);
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/logout');
    } catch {
      // Proceed with local client teardown even if server logout fails
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {loading ? (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};