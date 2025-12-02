// lib/useAppwrite.ts (fixed version)
import { useCallback, useEffect, useRef, useState } from 'react';

export const useAppwrite = <T>({ fn, params }: { fn: (...args: any[]) => Promise<T>; params?: any }) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const lastCallId = useRef(0);

  const refetch = useCallback(async (newParams?: any) => {
    if (!isMounted.current) return;
    
    const callId = ++lastCallId.current;
    setLoading(true);
    setError(null);

    try {
      const result = await fn(newParams || params);
      
      // Only update state if this is the most recent call
      if (isMounted.current && callId === lastCallId.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      // Only update state if this is the most recent call
      if (isMounted.current && callId === lastCallId.current) {
        setError(err as Error);
        setData(null);
      }
    } finally {
      // Only update state if this is the most recent call
      if (isMounted.current && callId === lastCallId.current) {
        setLoading(false);
      }
    }
  }, [fn, params]);

  useEffect(() => {
    isMounted.current = true;
    refetch();
    
    return () => {
      isMounted.current = false;
    };
  }, [refetch]);

  return { data, loading, error, refetch };
};