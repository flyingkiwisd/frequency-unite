'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  Component,
  type ReactNode,
  type ErrorInfo,
} from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { isClerkConfigured } from '@/lib/config';
import { createClerkSupabaseClient } from './client';

// Re-export for backward compatibility
export { isClerkConfigured };
export const isSupabaseConfigured = isClerkConfigured; // legacy alias

// ─── Demo mode constants ───
const DEMO_STORAGE_KEY = 'frequency-demo-session';

// ─── Auth context shape ───
export interface AuthContextType {
  user: { id: string; email?: string } | null;
  teamMemberId: string | null;
  loading: boolean;
  isDemo: boolean;
  needsProfileSetup: boolean;
  signOut: () => Promise<void>;
  demoLogin: (teamMemberId: string) => void;
  claimTeamMember: (memberId: string) => Promise<{ error: string | null }>;
  supabase: SupabaseClient | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ───
function createDemoUser(memberId: string) {
  return {
    id: `demo-${memberId}`,
    email: `${memberId}@frequency.demo`,
  };
}

async function resolveTeamMemberId(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('id')
    .eq('auth_user_id', clerkUserId)
    .single();
  if (error || !data) return null;
  return data.id;
}

// ═══════════════════════════════════════════
// Clerk Auth Provider (when Clerk IS configured)
// ═══════════════════════════════════════════
function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser, isLoaded } = useUser();

  const [teamMemberId, setTeamMemberId] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);

  // ─── Server-side token exchange ───
  // Instead of relying on a Clerk JWT template (which requires HS256 +
  // custom signing key — only configurable via Clerk Dashboard UI),
  // we fetch an HS256 JWT from our own API route that mints tokens
  // signed with the Supabase JWT secret.
  const tokenCache = useRef<{ token: string; expiresAt: number } | null>(null);

  const getSupabaseToken = useCallback(async (): Promise<string | null> => {
    // Return cached token if still valid (with 10s buffer)
    if (
      tokenCache.current &&
      Date.now() < tokenCache.current.expiresAt - 10_000
    ) {
      return tokenCache.current.token;
    }

    try {
      const res = await fetch('/api/supabase-token');
      if (!res.ok) return null;
      const { token, expiresAt } = await res.json();
      tokenCache.current = { token, expiresAt };
      return token;
    } catch {
      console.warn('[Auth] Failed to fetch Supabase token');
      return null;
    }
  }, []);

  // Build authenticated Supabase client using server-minted tokens
  const supabase = useMemo(() => {
    return createClerkSupabaseClient(getSupabaseToken);
  }, [getSupabaseToken]);

  // Resolve teamMemberId from team_members table after login
  useEffect(() => {
    if (!isLoaded || !clerkUser || !supabase) return;

    resolveTeamMemberId(supabase, clerkUser.id)
      .then((id) => {
        setTeamMemberId(id);
        setProfileChecked(true);
      })
      .catch(() => {
        setProfileChecked(true);
      });
  }, [isLoaded, clerkUser, supabase]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
    setTeamMemberId(null);
    setProfileChecked(false);
  }, [clerkSignOut]);

  const demoLogin = useCallback((memberId: string) => {
    // Store demo session and reload to switch to DemoAuthProvider
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ memberId }));
      window.location.reload();
    } catch {
      console.warn('Could not start demo mode');
    }
  }, []);

  const claimTeamMember = useCallback(
    async (memberId: string): Promise<{ error: string | null }> => {
      if (!supabase || !clerkUser) {
        return { error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('team_members')
        .update({ auth_user_id: clerkUser.id })
        .eq('id', memberId)
        .is('auth_user_id', null);

      if (error) {
        return { error: error.message };
      }

      setTeamMemberId(memberId);
      return { error: null };
    },
    [supabase, clerkUser]
  );

  const user = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
      }
    : null;

  const needsProfileSetup =
    isLoaded && !!clerkUser && profileChecked && teamMemberId === null;

  const value: AuthContextType = {
    user,
    teamMemberId,
    loading: !isLoaded || (!profileChecked && !!clerkUser),
    isDemo: false,
    needsProfileSetup,
    signOut,
    demoLogin,
    claimTeamMember,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ═══════════════════════════════════════════
// Demo Auth Provider (when Clerk is NOT configured)
// ═══════════════════════════════════════════
function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(
    null
  );
  const [teamMemberId, setTeamMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore demo session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) {
        const { memberId } = JSON.parse(stored);
        if (memberId) {
          setUser(createDemoUser(memberId));
          setTeamMemberId(memberId);
        }
      }
    } catch {
      // Invalid or missing demo session
    }
    setLoading(false);
  }, []);

  const demoLogin = useCallback((memberId: string) => {
    try {
      localStorage.setItem(
        DEMO_STORAGE_KEY,
        JSON.stringify({ memberId })
      );
    } catch {
      // localStorage unavailable
    }
    setUser(createDemoUser(memberId));
    setTeamMemberId(memberId);
  }, []);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
    setUser(null);
    setTeamMemberId(null);
  }, []);

  const claimTeamMember = useCallback(
    async (_memberId: string): Promise<{ error: string | null }> => {
      return { error: 'Not available in demo mode' };
    },
    []
  );

  const value: AuthContextType = {
    user,
    teamMemberId,
    loading,
    isDemo: true,
    needsProfileSetup: false,
    signOut,
    demoLogin,
    claimTeamMember,
    supabase: null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ═══════════════════════════════════════════
// SSR-safe Clerk wrapper — defers hook usage until after hydration
// (prevents build error: "useAuth can only be used within ClerkProvider")
// ═══════════════════════════════════════════
const LOADING_VALUE: AuthContextType = {
  user: null,
  teamMemberId: null,
  loading: true,
  isDemo: false,
  needsProfileSetup: false,
  signOut: async () => {},
  demoLogin: () => {},
  claimTeamMember: async () => ({ error: 'Not ready' }),
  supabase: null,
};

function ClerkAuthProviderSafe({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // During SSG/SSR (build time), skip Clerk hooks — return loading state
    return (
      <AuthContext.Provider value={LOADING_VALUE}>
        {children}
      </AuthContext.Provider>
    );
  }

  // If Clerk throws at runtime, fall back to demo mode
  if (hasError) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  // After hydration, safe to use Clerk hooks
  return (
    <ClerkErrorBoundary onError={() => setHasError(true)}>
      <ClerkAuthProvider>{children}</ClerkAuthProvider>
    </ClerkErrorBoundary>
  );
}

// ─── Error boundary for Clerk auth ───
class ClerkErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Clerk Auth Error]', error, info);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// ═══════════════════════════════════════════
// Top-level provider — picks Clerk or Demo
// Supports demo mode even when Clerk is configured:
// if user has a demo session in localStorage, use DemoAuthProvider.
// ═══════════════════════════════════════════
export function AuthProvider({ children }: { children: ReactNode }) {
  const [useDemoMode, setUseDemoMode] = useState<boolean | null>(null);

  // On mount, check if there's a demo session stored
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      setUseDemoMode(stored ? true : false);
    } catch {
      setUseDemoMode(false);
    }
  }, []);

  // Show nothing until we've checked localStorage (prevents flash)
  if (useDemoMode === null) {
    return (
      <AuthContext.Provider value={LOADING_VALUE}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Use Demo mode if: Clerk not configured, or user has active demo session
  if (!isClerkConfigured || useDemoMode) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  // Clerk configured + no demo session → use Clerk
  return <ClerkAuthProviderSafe>{children}</ClerkAuthProviderSafe>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
