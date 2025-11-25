// lib/useAppwrite.ts
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

type Fn<TParams, TResult> = (params: TParams) => Promise<TResult>;

export default function useAppwrite<T, P extends Record<string, any> = {}>({ fn, params = {} as P, skip = false }: { fn: Fn<P, any>; params?: P; skip?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (p: P) => {
    setLoading(true); setError(null);
    try {
      const result = await fn(p);
      setData(result as T);
    } catch (err: any) {
      const msg = err?.message ?? "Unknown error";
      setError(msg);
      Alert.alert("Error", msg);
    } finally { setLoading(false); }
  }, [fn]);

  useEffect(() => { if (!skip) fetchData(params); }, []);

  const refetch = async (newParams?: P) => await fetchData((newParams ?? params) as P);

  return { data, loading, error, refetch };
}
