'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  teamMemberId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, teamMemberId: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const isSupabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0 && !SUPABASE_URL.includes('placeholder');

function createSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  try {
    return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  } catch {
    return null;
  }
}

async function resolveTeamMemberId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('id')
    .eq('auth_user_id', userId)
    .single();

  if (error || !data) return null;
  return data.id;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createSupabaseClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [teamMemberId, setTeamMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const memberId = await resolveTeamMemberId(supabase, currentSession.user.id);
          setTeamMemberId(memberId);
        }
      } catch (error) {
        console.error('Error initializing auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [supabase]);

  // Listen for auth state changes
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const memberId = await resolveTeamMemberId(supabase, newSession.user.id);
          setTeamMemberId(memberId);
        } else {
          setTeamMemberId(null);
        }

        if (event === 'SIGNED_OUT') {
          setTeamMemberId(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      if (!supabase) return { error: 'Supabase is not configured. Add environment variables.' };
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      selectedTeamMemberId: string
    ): Promise<{ error: string | null }> => {
      if (!supabase) return { error: 'Supabase is not configured. Add environment variables.' };
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Sign up failed. Please try again.' };
      }

      // Link the auth user to the selected team member
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ auth_user_id: data.user.id })
        .eq('id', selectedTeamMemberId);

      if (updateError) {
        return { error: `Account created but failed to link team member: ${updateError.message}` };
      }

      setTeamMemberId(selectedTeamMemberId);

      return { error: null };
    },
    [supabase]
  );

  const signOutHandler = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setTeamMemberId(null);
  }, [supabase]);

  const value: AuthContextType = {
    user,
    session,
    teamMemberId,
    loading,
    signIn,
    signUp,
    signOut: signOutHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
