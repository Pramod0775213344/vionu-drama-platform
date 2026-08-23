import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kflix_user', JSON.stringify(user));
      localStorage.setItem('kflix_access_token', accessToken);
      localStorage.setItem('kflix_refresh_token', refreshToken);
    }
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kflix_user');
      localStorage.removeItem('kflix_access_token');
      localStorage.removeItem('kflix_refresh_token');
    }
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  initFromStorage: () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('kflix_user');
      const token = localStorage.getItem('kflix_access_token');
      const refresh = localStorage.getItem('kflix_refresh_token');
      if (storedUser && token) {
        try {
          const user = JSON.parse(storedUser);
          set({ user, accessToken: token, refreshToken: refresh, isAuthenticated: true });
        } catch {
          localStorage.removeItem('kflix_user');
        }
      }
    }
  },
}));
