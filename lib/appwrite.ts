// lib/appwrite.ts
import type { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import { apiGet, apiPost, clearToken, setToken } from "./api";
import dummyData from "./data";

export const createUser = async ({ email, password, name }: CreateUserParams) => {
  const res = await apiPost<{ token?: string; user?: any }>("/auth/register", { name, email, password });
  if (!res.success) throw new Error(res.message || "Register failed");
  if (res.data?.token) await setToken(res.data.token);
  return res.data?.user ?? null;
};

export const signIn = async ({ email, password }: SignInParams) => {
  const res = await apiPost<{ token?: string; user?: any }>("/auth/login", { email, password });
  if (!res.success) throw new Error(res.message || "Login failed");
  if (res.data?.token) await setToken(res.data.token);
  return res.data?.user ?? null;
};

export const getCurrentUser = async () => {
  const res = await apiGet<any>("/auth/me");
  if (!res.success) throw new Error(res.message || "Not authenticated");
  return res.data?.user ?? res.data ?? null;
};

export const getMenu = async ({ category, query, limit }: Partial<GetMenuParams> = {}) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category as string);
  if (query) params.set("q", query as string);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await apiGet<any[]>(`/menu${qs}`);
  if (!res.success) throw new Error(res.message || "Failed to fetch menu");
  return res.data ?? [];
};

export const getCategories = async () => {
  const res = await apiGet<any[]>("/categories");
  if (!res.success) throw new Error(res.message || "Failed to fetch categories");
  return res.data ?? [];
};

export const seed = async () => {
  try {
    for (const cat of dummyData.categories || []) { await apiPost("/categories", cat).catch(()=>{}); }
    for (const item of dummyData.menu || []) { await apiPost("/menu", item).catch(()=>{}); }
    return true;
  } catch { return false; }
};

export const logout = async () => { await clearToken(); return true; };

export default {
  createUser, signIn, getCurrentUser, getMenu, getCategories, seed, logout
};
