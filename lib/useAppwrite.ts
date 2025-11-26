import { useEffect, useState } from 'react';

interface UseApiOptions {
  fn: (...args: any[]) => Promise<any>;
  params?: any;
}

export const useApi = ({ fn, params }: UseApiOptions) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async (newParams?: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(newParams || params);
      setData(result);
    } catch (err: any) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
};

// Keep the old name for compatibility
export const useAppwrite = useApi;