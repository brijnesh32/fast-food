// lib/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE = (process.env.API_BASE_URL || "https://fast-food-backend-yx5s.onrender.com") + "/api";
const TOKEN_KEY = "FF_APP_TOKEN";

export type ApiResponse<T=any> = { success: boolean; data?: T; message?: string; status?: number };

async function getStoredToken(): Promise<string | null> {
  try { return await AsyncStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export async function setToken(token: string | null) {
  try {
    if (token === null) return AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export async function clearToken() {
  try { await AsyncStorage.removeItem(TOKEN_KEY); } catch {}
}

async function request<T = any>(path: string, opts: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as any || {}) };

  try {
    const token = await getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) return { success: false, message: json?.detail || json?.message || res.statusText, status: res.status };
  return { success: true, data: json };
}

export async function apiGet<T = any>(path: string) { return request<T>(path, { method: "GET" }); }
export async function apiPost<T = any>(path: string, body?: any) { return request<T>(path, { method: "POST", body: JSON.stringify(body) }); }
export async function apiPut<T = any>(path: string, body?: any) { return request<T>(path, { method: "PUT", body: JSON.stringify(body) }); }
export async function apiDelete<T = any>(path: string) { return request<T>(path, { method: "DELETE" }); }
