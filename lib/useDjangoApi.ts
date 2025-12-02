// lib/useDjangoApi.ts
import { useCallback, useEffect, useState } from 'react';
import { getCategories, getMenu } from './api';

export const useDjangoApi = <T>(fn: (...args: any[]) => Promise<T>, params?: any) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (newParams?: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fn(newParams || params);
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [fn, params]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};

export const useMenu = (params: { category?: string; query?: string; limit?: number } = {}) => {
  return useDjangoApi(getMenu, params);
};

export const useCategories = () => {
  return useDjangoApi(getCategories);
};