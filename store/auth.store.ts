import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
  fetchAuthenticatedUser: () => Promise<void>;
}

// Create the auth store
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          // Mock login - replace with actual Django auth when ready
          if (email && password) {
            const user: User = {
              id: '1',
              name: 'Test User',
              email: email,
              avatar: '',
              phone: '+1234567890'
            };
            
            set({ user, isAuthenticated: true });
            return { ok: true };
          } else {
            return { ok: false, message: 'Invalid credentials' };
          }
        } catch (error) {
          return { ok: false, message: 'Login failed' };
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          // Mock registration - replace with actual Django auth when ready
          if (name && email && password) {
            const user: User = {
              id: '1',
              name: name,
              email: email,
              avatar: '',
              phone: '+1234567890'
            };
            
            set({ user, isAuthenticated: true });
            return { ok: true };
          } else {
            return { ok: false, message: 'Invalid registration data' };
          }
        } catch (error) {
          return { ok: false, message: 'Registration failed' };
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ user: null, isAuthenticated: false });
      },

      fetchAuthenticatedUser: async () => {
        // Mock - you can implement actual token-based auth later
        const { user } = get();
        if (user) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Export as default
export default useAuthStore;