'use client';

import { useState, useEffect, useCallback } from 'react';

export function useEditableStore<T>(storageKey: string, defaultData: T): {
  data: T;
  setData: (updater: T | ((prev: T) => T)) => void;
  hasEdits: boolean;
  resetAll: () => void;
} {
  const [data, setDataState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultData;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(defaultData)) {
          return parsed as T;
        }
        return { ...defaultData, ...parsed } as T;
      }
    } catch {
      // ignore
    }
    return defaultData;
  });

  const [hasEdits, setHasEdits] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(storageKey);
      setHasEdits(stored !== null);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const setData = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setDataState((prev) => {
        const next = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater;
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
          setHasEdits(true);
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageKey]
  );

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasEdits(false);
    } catch {
      // ignore
    }
    setDataState(defaultData);
  }, [storageKey, defaultData]);

  return { data, setData, hasEdits, resetAll };
}
