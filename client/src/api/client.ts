import axios from 'axios';

let _accessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('intellmeet_token') : null;

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('intellmeet_token', token);
    } else {
      localStorage.removeItem('intellmeet_token');
    }
  }
};

export const getAccessToken = () => {
  if (!_accessToken && typeof window !== 'undefined') {
    _accessToken = localStorage.getItem('intellmeet_token');
  }
  return _accessToken;
};

const client = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isAuthEndpoint =
      original?.url?.includes('/auth/refresh-token') ||
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/signup');

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(client(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await client.post<{ data: { accessToken: string } }>('/auth/refresh-token');
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (refreshErr) {
        // The refresh token is spent or invalid; the session cannot be recovered.
        setAccessToken(null);
        refreshQueue = [];
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default client;
