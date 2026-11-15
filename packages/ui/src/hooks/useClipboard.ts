"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export type ClipboardStatus = "idle" | "copying" | "success" | "error";
export function useClipboard({
  resetDelay = 1400,
}: { resetDelay?: number } = {}) {
  const [status, setStatus] = useState<ClipboardStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const request = useRef(0);
  const mounted = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const invalidate = useCallback(() => {
    request.current++;
    clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      invalidate();
    };
  }, [invalidate]);
  const reset = useCallback(() => {
    request.current++;
    clearTimeout(timer.current);
    setStatus("idle");
    setError(null);
  }, []);
  const copy = useCallback(
    async (value: string) => {
      const attempt = ++request.current;
      clearTimeout(timer.current);
      setError(null);
      setStatus("copying");
      try {
        if (!navigator.clipboard?.writeText)
          throw new Error("Clipboard is unavailable.");
        await navigator.clipboard.writeText(value);
        if (!mounted.current || attempt !== request.current) return false;
        setStatus("success");
        timer.current = setTimeout(() => {
          if (mounted.current && attempt === request.current) setStatus("idle");
        }, resetDelay);
        return true;
      } catch (cause) {
        if (mounted.current && attempt === request.current) {
          setError(cause instanceof Error ? cause : new Error("Copy failed."));
          setStatus("error");
        }
        return false;
      }
    },
    [resetDelay],
  );
  return { copy, status, error, reset };
}
