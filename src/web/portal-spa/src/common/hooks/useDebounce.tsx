import { useCallback, useEffect, useRef } from "react";

/**
 * Custom hook for debouncing an function.
 * @param fn The function to debounce.
 * @param delay The debounce delay in milliseconds.
 */
export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
}
