// store/auth.store.ts - OPTIMIZED VERSION
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  isOffline: boolean;

  // Actions
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setOffline: (status: boolean) => void;
}

const API_BASE_URL = "https://fast-food-backend-yx5s.onrender.com/api";

// Helper to check network connectivity
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.log("📱 Network check failed:", error);
    return true; // Assume connected if check fails
  }
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isOffline: false,

      setOffline: (status: boolean) => {
        set({ isOffline: status });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log("🔐 Attempting login for:", email);

          // Check network first
          const isConnected = await checkNetworkConnectivity();
          if (!isConnected) {
            set({ isLoading: false, isOffline: true });
            return {
              ok: false,
              message: "No internet connection. Please check your network.",
            };
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 10 second timeout

          const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = await response.json();
          console.log("✅ Login response received");

          if (response.status === 401) {
            return {
              ok: false,
              message: "Invalid email or password",
            };
          }

          if (!response.ok) {
            return {
              ok: false,
              message: data.message || "Login failed. Please try again.",
            };
          }

          if (!data.token || !data.user) {
            return {
              ok: false,
              message: "Invalid response from server",
            };
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            isOffline: false,
          });

          return { ok: true };
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.log("⏱️ Login request timed out");
            return {
              ok: false,
              message: "Request timed out. Please try again.",
            };
          }

          console.error("❌ Login error:", error.message);
          return {
            ok: false,
            message:
              error.message || "Network error. Please check your connection.",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log("📝 Attempting registration for:", email);

          // Check network first
          const isConnected = await checkNetworkConnectivity();
          if (!isConnected) {
            set({ isLoading: false, isOffline: true });
            return {
              ok: false,
              message: "No internet connection. Please check your network.",
            };
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = await response.json();
          console.log("✅ Register response received");

          if (response.status === 400) {
            return {
              ok: false,
              message: data.message || "User already exists or invalid data",
            };
          }

          if (!response.ok) {
            return {
              ok: false,
              message: data.message || "Registration failed. Please try again.",
            };
          }

          if (!data.token || !data.user) {
            return {
              ok: false,
              message: "Invalid response from server",
            };
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            isOffline: false,
          });

          return { ok: true };
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.log("⏱️ Registration request timed out");
            return {
              ok: false,
              message: "Request timed out. Please try again.",
            };
          }

          console.error("❌ Register error:", error.message);
          return {
            ok: false,
            message:
              error.message || "Network error. Please check your connection.",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        console.log("🚪 Logging out");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isOffline: false,
        });

        // Clear stored data
        try {
          await AsyncStorage.removeItem("auth-storage");
        } catch (error) {
          console.log("Error clearing storage:", error);
        }
      },

      checkAuth: async () => {
        console.log("🔍 Starting auth check...");
        const { token, user } = get();

        // If no token, definitely not authenticated
        if (!token) {
          console.log("❌ No token found");
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
          return;
        }

        // Check network first
        const isConnected = await checkNetworkConnectivity();
        if (!isConnected) {
          console.log("📱 No internet connection during auth check");
          set({
            isOffline: true,
            isLoading: false,
            // Don't change authentication status - keep previous state
          });
          return;
        }

        console.log("🔑 Token found, validating with server...");
        set({ isLoading: true });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log("📡 Profile check response status:", response.status);

          if (response.status === 401) {
            console.log("🚫 Token invalid, logging out");
            await get().logout();
            return;
          }

          if (!response.ok) {
            console.log(
              "⚠️ Profile check failed with status:",
              response.status,
            );
            set({
              isLoading: false,
              isAuthenticated: false,
            });
            return;
          }

          const data = await response.json();

          // Check if user exists in response
          if (data.user || data.id) {
            console.log("✅ Token valid, user authenticated");
            set({
              user: data.user || data,
              isAuthenticated: true,
              isLoading: false,
              isOffline: false,
            });
          } else {
            console.log("❌ No user data in response");
            set({
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } catch (error: any) {
          clearTimeout(timeoutId);

          // Handle abort (timeout) gracefully
          if (error.name === "AbortError") {
            console.log("⏱️ Auth check timed out - will retry later");
            // Keep current auth state, just mark as not loading
            set({
              isLoading: false,
              // Don't change isAuthenticated - user might still be valid
            });
          } else {
            console.log("🌐 Auth check network error:", error.message);
            set({
              isLoading: false,
              isOffline: true,
              // Don't change authentication status on network errors
            });
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log("❌ Error rehydrating auth store:", error);
        } else {
          console.log("🔄 Auth store rehydrated:", {
            hasUser: !!state?.user,
            hasToken: !!state?.token,
            isAuthenticated: state?.isAuthenticated,
          });

          // Fix inconsistent state
          if (state && !state.token && state.isAuthenticated) {
            console.log("⚠️ Inconsistent state detected! Fixing...");
            state.isAuthenticated = false;
            state.user = null;
          }

          // Check if token exists but no user
          if (state && state.token && !state.user) {
            console.log("⚠️ Token exists but no user data");
            state.isAuthenticated = false;
          }
        }
      },
    },
  ),
);

// Set up network listener
if (typeof window !== "undefined") {
  NetInfo.addEventListener((state) => {
    const { setOffline } = useAuthStore.getState();
    setOffline(!state.isConnected);

    if (state.isConnected) {
      // If we just came online, check auth again
      const { token, checkAuth } = useAuthStore.getState();
      if (token) {
        console.log("📱 Network restored, rechecking auth...");
        checkAuth();
      }
    }
  });
}

export default useAuthStore;
