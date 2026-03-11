// Shared configuration — importable from both Server and Client Components

export const isClerkConfigured =
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '').length > 0 &&
  !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '').includes('placeholder');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 &&
  SUPABASE_KEY.length > 0 &&
  !SUPABASE_URL.includes('placeholder');
