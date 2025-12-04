// store/auth.store.ts - FIXED VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false, // Should be false initially
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('🔐 Attempting login for:', email);
          const response = await fetch('https://fast-food-backend-yx5s.onrender.com/api/auth/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();
          console.log('✅ Login response:', data);
          
          if (!response.ok || !data.ok) {
            return {
              ok: false,
              message: data.message || 'Login failed'
            };
          }
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { ok: true };
          
        } catch (error: any) {
          console.error('❌ Login error:', error);
          set({ isLoading: false });
          return {
            ok: false,
            message: error.message || 'Network error'
          };
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('📝 Attempting registration for:', email);
          const response = await fetch('https://fast-food-backend-yx5s.onrender.com/api/auth/register/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
          });

          const data = await response.json();
          console.log('✅ Register response:', data);
          
          if (!response.ok || !data.ok) {
            return {
              ok: false,
              message: data.message || 'Registration failed'
            };
          }
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { ok: true };
          
        } catch (error: any) {
          console.error('❌ Register error:', error);
          set({ isLoading: false });
          return {
            ok: false,
            message: error.message || 'Network error'
          };
        }
      },

      logout: () => {
        console.log('🚪 Logging out');
        set({
          user: null,
          token: null,
          isAuthenticated: false, // Explicitly set to false
          isLoading: false,
        });
      },

      checkAuth: async () => {
        console.log('🔍 Starting auth check...');
        const { token, user } = get();
        
        // If no token, definitely not authenticated
        if (!token) {
          console.log('❌ No token found, setting isAuthenticated = false');
          set({ 
            isAuthenticated: false,
            user: null, // Clear user too
            isLoading: false 
          });
          return;
        }
        
        console.log('🔑 Token found, validating with server...');
        set({ isLoading: true });
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const response = await fetch('https://fast-food-backend-yx5s.onrender.com/api/auth/profile/', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          console.log('📡 Profile check response status:', response.status);
          
          if (response.status === 401) {
            // Token is invalid
            console.log('🚫 Token invalid, logging out');
            get().logout();
            return;
          }
          
          if (!response.ok) {
            // Server error
            console.log('⚠️ Profile check failed, keeping token but not authenticating');
            set({ 
              isLoading: false,
              isAuthenticated: false // Not authenticated on server error
            });
            return;
          }
          
          const data = await response.json();
          console.log('✅ Profile data:', data);
          
          if (data.ok) {
            console.log('✅ Token valid, user authenticated');
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            console.log('❌ Profile data not ok, logging out');
            get().logout();
          }
          
        } catch (error: any) {
          console.error('🌐 Auth check network error:', error.message);
          // Network error - keep token but don't set as authenticated
          set({ 
            isLoading: false,
            isAuthenticated: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log('❌ Error rehydrating auth store:', error);
        } else {
          console.log('🔄 Auth store rehydrated:', {
            hasUser: !!state?.user,
            hasToken: !!state?.token,
            isAuthenticated: state?.isAuthenticated
          });
          
          // Fix: Ensure consistency after rehydration
          if (state && !state.token && state.isAuthenticated) {
            console.log('⚠️ Inconsistent state detected! Fixing...');
            state.isAuthenticated = false;
            state.user = null;
          }
        }
      },
    }
  )
);

export default useAuthStore;