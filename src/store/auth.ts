import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Demo users for local testing
const demoUsers = {
  'admin@demo.com': {
    id: 'admin-1',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'admin' as const
  },
  'manager@demo.com': {
    id: 'manager-1',
    name: 'Demo Manager',
    email: 'manager@demo.com',
    password: 'demo123',
    role: 'manager' as const
  },
  'staff@demo.com': {
    id: 'staff-1',
    name: 'Demo Staff',
    email: 'staff@demo.com',
    password: 'demo123',
    role: 'staff' as const
  }
};

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
          
          // Check demo users
          const demoUser = demoUsers[credentials.email];
          if (demoUser && demoUser.password === credentials.password) {
            const { password, ...user } = demoUser;
            set({ 
              user,
              token: 'demo-token',
              isLoading: false 
            });
            return;
          }

          throw new Error('Invalid credentials');
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to login', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          // In a real app, this would make an API call
          const newUser = {
            id: `user-${Date.now()}`,
            name: userData.name,
            email: userData.email,
            role: userData.role as 'admin' | 'manager' | 'staff'
          };
          set({ 
            user: newUser,
            token: 'demo-token',
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to register', 
            isLoading: false 
          });
          throw error;
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