'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
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
function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  // Dynamic imports resolved at module level when Clerk is configured
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useAuth: useClerkAuth, useUser } = require('@clerk/nextjs');
  const { getToken, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser, isLoaded } = useUser();

  const [teamMemberId, setTeamMemberId] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);

  // Build authenticated Supabase client (re-created when getToken changes)
  const supabase = useMemo(() => {
    return createClerkSupabaseClient(() =>
      getToken({ template: 'supabase' })
    );
  }, [getToken]);

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

  const demoLogin = useCallback((_memberId: string) => {
    // No-op in Clerk mode
    console.warn('demoLogin called in Clerk mode — ignored');
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
function DemoAuthProvider({ children }: { children: React.ReactNode }) {
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

function ClerkAuthProviderSafe({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // During SSG/SSR (build time), skip Clerk hooks — return loading state
    return (
      <AuthContext.Provider value={LOADING_VALUE}>
        {children}
      </AuthContext.Provider>
    );
  }

  // After hydration, safe to use Clerk hooks
  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}

// ═══════════════════════════════════════════
// Top-level provider — picks Clerk or Demo
// ═══════════════════════════════════════════
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isClerkConfigured) {
    return <ClerkAuthProviderSafe>{children}</ClerkAuthProviderSafe>;
  }
  return <DemoAuthProvider>{children}</DemoAuthProvider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
