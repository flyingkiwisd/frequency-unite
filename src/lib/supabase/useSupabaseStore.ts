'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
  const supabase = getClient();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // Load from Supabase
  useEffect(() => {
    if (!userId) {
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
  }, [userId, tableName]);

  // Save to Supabase with 500ms debounce
  const saveToSupabase = useCallback(
    (newData: T) => {
      if (!userId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        supabase
          .from(tableName)
          .upsert(
            {
              user_id: userId,
              data: newData,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
          .then(() => setHasEdits(true));
      }, 500);
    },
    [userId, tableName]
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

  const resetAll = useCallback(() => {
    if (userId) {
      supabase.from(tableName).delete().eq('user_id', userId);
    }
    setDataState(defaultData);
    setHasEdits(false);
  }, [userId, tableName, defaultData]);

  return { data, setData, hasEdits, resetAll, loading };
}
