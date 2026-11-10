'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutosaveOptions<T> {
  data: T;
  onSave?: (data: T) => Promise<void> | void;
  debounceMs?: number;
  storageKey?: string;
  enabled?: boolean;
}

export interface UseAutosaveReturn<T> {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;
  restoreDraft: () => T | null;
  clearDraft: () => void;
}

const DEFAULT_DEBOUNCE_MS = 1500;

export function useAutosave<T>({
  data,
  onSave,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  storageKey,
  enabled = true,
}: UseAutosaveOptions<T>): UseAutosaveReturn<T> {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initialRenderRef = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearDraft = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey]);

  const restoreDraft = useCallback((): T | null => {
    if (!storageKey || typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  }, [storageKey]);

  useEffect(() => {
    if (!enabled) return;

    // Skip autosave on initial component mount
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    // 1. Immediately cache data to localStorage as draft
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // Silently handle quota exceeded or private mode
      }
    }

    // 2. Debounced save trigger
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setStatus('idle');

    debounceTimerRef.current = setTimeout(async () => {
      if (!onSave) {
        setStatus('saved');
        setLastSavedAt(new Date());
        return;
      }

      setStatus('saving');
      setErrorMessage(null);

      try {
        await onSave(data);
        setStatus('saved');
        setLastSavedAt(new Date());
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Autosave failed.'
        );
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, debounceMs, enabled, onSave, storageKey]);

  return {
    status,
    lastSavedAt,
    errorMessage,
    restoreDraft,
    clearDraft,
  };
}
