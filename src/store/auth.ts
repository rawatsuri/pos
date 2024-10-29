import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, register as apiRegister } from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const { data } = await apiLogin(credentials);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to login', 
            isLoading: false 
          });
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const { data } = await apiRegister(userData);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to register', 
            isLoading: false 
          });
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
);