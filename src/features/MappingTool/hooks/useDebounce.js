import { useEffect, useCallback, useRef } from 'react';

export function useDebounce(callback, delay) {
  const callbackRef = useCallback(callback, [callback]);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    
    timeoutIdRef.current = setTimeout(() => {
      callbackRef(...args);
    }, delay);
  }, [callbackRef, delay]);

  return debouncedCallback;
}