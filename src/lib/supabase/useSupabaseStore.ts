'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const isConfigured = SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0 && !SUPABASE_URL.includes('placeholder');

function getClient(): SupabaseClient | null {
  if (!isConfigured) return null;
  try {
    return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  } catch {
    return null;
  }
}

export function useSupabaseStore<T>(
  tableName: string,
  defaultData: T
): {
  data: T;
  setData: (updater: T | ((prev: T) => T)) => void;
  hasEdits: boolean;
  resetAll: () => void;
  loading: boolean;
} {
  const [data, setDataState] = useState<T>(defaultData);
  const [hasEdits, setHasEdits] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [supabase] = useState(() => getClient());

  // Get current user
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, [supabase]);

  // Load from Supabase
  useEffect(() => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const { data: row } = await supabase
          .from(tableName)
          .select('data')
          .eq('user_id', userId)
          .single();
        if (row?.data != null) {
          setDataState(row.data as T);
          setHasEdits(true);
        }
      } catch {
        // No data found, use defaults
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [supabase, userId, tableName]);

  // Save to Supabase with 500ms debounce
  const saveToSupabase = useCallback(
    (newData: T) => {
      if (!supabase || !userId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          await supabase
            .from(tableName)
            .upsert(
              {
                user_id: userId,
                data: newData,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
          setHasEdits(true);
        } catch {
          // Silently fail save — data is still in local state
        }
      }, 500);
    },
    [supabase, userId, tableName]
  );

  const setData = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setDataState((prev) => {
        const next =
          typeof updater === 'function'
            ? (updater as (prev: T) => T)(prev)
            : updater;
        saveToSupabase(next);
        return next;
      });
    },
    [saveToSupabase]
  );

  const resetAll = useCallback(async () => {
    if (supabase && userId) {
      try {
        await supabase.from(tableName).delete().eq('user_id', userId);
      } catch {
        // Silently fail delete
      }
    }
    setDataState(defaultData);
    setHasEdits(false);
  }, [supabase, userId, tableName, defaultData]);

  return { data, setData, hasEdits, resetAll, loading };
}
