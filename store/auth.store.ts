// store/auth.store.ts
import { createUser, getCurrentUser, logout, signIn } from "@/lib/appwrite";
import type { User } from "@/type";
import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  setIsAuthenticated: (v: boolean) => void;
  setUser: (u: User | null) => void;
  setLoading: (l: boolean) => void;
  fetchAuthenticatedUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (v) => set({ isAuthenticated: v }),
  setUser: (u) => set({ user: u }),
  setLoading: (l) => set({ isLoading: l }),

  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      if (user) set({ isAuthenticated: true, user: user as User });
      else set({ isAuthenticated: false, user: null });
    } catch (e) {
      console.log("fetchAuthenticatedUser error", e);
      set({ isAuthenticated: false, user: null });
    } finally { set({ isLoading: false }); }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await signIn({ email, password });
      if (!user) return { ok: false, message: "Login failed" };
      set({ isAuthenticated: true, user: user as User });
      return { ok: true };
    } catch (e: any) { return { ok: false, message: e?.message || "Login error" }; } finally { set({ isLoading: false }); }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const user = await createUser({ name, email, password });
      if (!user) return { ok: false, message: "Register failed" };
      set({ isAuthenticated: true, user: user as User });
      return { ok: true };
    } catch (e: any) { return { ok: false, message: e?.message || "Register error" }; } finally { set({ isLoading: false }); }
  },

  signOut: async () => {
    await logout();
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuthStore;
