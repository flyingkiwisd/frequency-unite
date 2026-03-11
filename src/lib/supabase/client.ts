import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 &&
  SUPABASE_KEY.length > 0 &&
  !SUPABASE_URL.includes('placeholder');

/**
 * Creates a Supabase client that uses a Clerk JWT for authentication.
 * The getToken callback is called before each Supabase request to inject
 * a fresh Clerk-signed JWT into the Authorization header.
 */
export function createClerkSupabaseClient(
  getToken: () => Promise<string | null>
) {
  if (!isSupabaseConfigured) return null;

  return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      fetch: async (url, options = {}) => {
        const token = await getToken();
        const headers = new Headers(options?.headers);
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        return fetch(url, { ...options, headers });
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Creates a plain (unauthenticated) Supabase client for public reads.
 * Uses the anon key — only works with tables that allow anon SELECT.
 */
export function createAnonClient() {
  if (!isSupabaseConfigured) return null;
  try {
    return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
  } catch {
    return null;
  }
}
