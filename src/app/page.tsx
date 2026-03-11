'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { DashboardView } from '@/components/views/DashboardView';
import { NodesView } from '@/components/views/NodesView';
import { TeamView } from '@/components/views/TeamView';
import { OKRView } from '@/components/views/OKRView';
import { TasksView } from '@/components/views/TasksView';
import { RoadmapView } from '@/components/views/RoadmapView';
import { GovernanceView } from '@/components/views/GovernanceView';
import { EventsView } from '@/components/views/EventsView';
import { ChatView } from '@/components/views/ChatView';
import { BudgetView } from '@/components/views/BudgetView';
import { AdvisorView } from '@/components/views/AdvisorView';
import { StewardProfileView } from '@/components/views/StewardProfileView';
import { LoginScreen } from '@/components/LoginScreen';
import { CommandPalette } from '@/components/CommandPalette';
import { DataProvider } from '@/lib/supabase/DataProvider';
import { teamMembers } from '@/lib/data';

export type ViewType = 'profile' | 'dashboard' | 'team' | 'chat' | 'okrs' | 'tasks' | 'governance' | 'roadmap' | 'events' | 'nodes' | 'budget' | 'advisor';

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0d14',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: '24px',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="url(#loadGrad)" opacity="0.12" />
          <path d="M10 32 Q18 14 32 32 Q46 50 54 32" stroke="url(#loadWaveGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M10 32 Q18 18 32 32 Q46 46 54 32" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
          <path d="M10 32 Q18 22 32 32 Q46 42 54 32" stroke="#6b8f71" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3" />
          <circle cx="32" cy="32" r="4" fill="#d4a574" />
          <circle cx="32" cy="32" r="2" fill="#0b0d14" />
          <defs>
            <radialGradient id="loadGrad" cx="32" cy="32" r="28">
              <stop stopColor="#d4a574" />
              <stop offset="1" stopColor="#8b5cf6" />
            </radialGradient>
            <linearGradient id="loadWaveGrad" x1="10" y1="32" x2="54" y2="32">
              <stop stopColor="#d4a574" />
              <stop offset="0.5" stopColor="#c4925a" />
              <stop offset="1" stopColor="#d4a574" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '4px',
          textTransform: 'uppercase' as const,
          color: 'rgba(212, 165, 116, 0.6)',
        }}
      >
        Loading...
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

// ─── Profile Setup Screen ───
// Shown after first Clerk login when user hasn't linked to a team member yet
const tailwindColorMap: Record<string, string> = {
  'bg-amber-500': '#f59e0b', 'bg-amber-400': '#fbbf24', 'bg-rose-400': '#fb7185',
  'bg-violet-500': '#8b5cf6', 'bg-sky-400': '#38bdf8', 'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7', 'bg-pink-400': '#f472b6', 'bg-teal-400': '#2dd4bf',
  'bg-green-500': '#22c55e', 'bg-lime-500': '#84cc16', 'bg-orange-500': '#f97316',
  'bg-indigo-400': '#818cf8', 'bg-slate-400': '#94a3b8',
};

function ProfileSetupScreen({
  onClaim,
  claiming,
  setClaiming,
  onSignOut,
}: {
  onClaim: (memberId: string) => Promise<{ error: string | null }>;
  claiming: boolean;
  setClaiming: (v: boolean) => void;
  onSignOut: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async (memberId: string) => {
    setClaiming(true);
    setError(null);
    const result = await onClaim(memberId);
    if (result.error) {
      setError(result.error);
      setClaiming(false);
    }
    // On success, AuthProvider updates teamMemberId and this screen unmounts
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0d14',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background effects */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 165, 116, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139, 92, 246, 0.08), transparent)' }} />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 580,
          margin: '0 20px',
          padding: '48px 40px 40px',
          background: 'rgba(15, 18, 28, 0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(212, 165, 116, 0.12)',
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="url(#pGrad)" opacity="0.12" />
            <path d="M10 32 Q18 14 32 32 Q46 50 54 32" stroke="#d4a574" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="32" cy="32" r="4" fill="#d4a574" />
            <circle cx="32" cy="32" r="2" fill="#0b0d14" />
            <defs>
              <radialGradient id="pGrad" cx="32" cy="32" r="28">
                <stop stopColor="#d4a574" />
                <stop offset="1" stopColor="#8b5cf6" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#f0ebe4', marginBottom: 8 }}>
          Welcome to Frequency
        </h1>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#a09888', marginBottom: 8 }}>
          Select your steward profile to complete setup
        </p>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(160, 152, 136, 0.5)', marginBottom: 24, fontStyle: 'italic' }}>
          This links your account to your team member identity
        </p>

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.15), transparent)', marginBottom: 24 }} />

        {error && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#e06060', marginBottom: 16, padding: '8px 16px', background: 'rgba(224, 96, 96, 0.1)', borderRadius: 8, border: '1px solid rgba(224, 96, 96, 0.2)' }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 32,
            maxHeight: 340,
            overflowY: 'auto',
            padding: 4,
            opacity: claiming ? 0.5 : 1,
            pointerEvents: claiming ? 'none' : 'auto',
            transition: 'opacity 0.2s',
          }}
        >
          {teamMembers.map((member) => {
            const hex = tailwindColorMap[member.color] || '#d4a574';
            return (
              <button
                key={member.id}
                onClick={() => handleClaim(member.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 4px',
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderRadius: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${hex}, ${hex}cc)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {member.avatar}
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(160, 152, 136, 0.5)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>
                  {member.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {claiming && (
          <div style={{ textAlign: 'center', fontSize: 13, color: '#d4a574', marginBottom: 16 }}>
            Linking your profile...
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onSignOut}
            style={{
              background: 'transparent',
              border: '1px solid rgba(224, 96, 96, 0.2)',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: 12,
              color: '#a09888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(224, 96, 96, 0.4)'; e.currentTarget.style.color = '#e06060'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(224, 96, 96, 0.2)'; e.currentTarget.style.color = '#a09888'; }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, teamMemberId, loading, signOut, needsProfileSetup, claimTeamMember, isDemo } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [viewTransition, setViewTransition] = useState(false);
  const [claimingProfile, setClaimingProfile] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen onLogin={() => {}} />;
  }

  // Profile setup — Clerk user exists but hasn't linked to a team member yet
  if (needsProfileSetup && !isDemo) {
    return <ProfileSetupScreen onClaim={claimTeamMember} claiming={claimingProfile} setClaiming={setClaimingProfile} onSignOut={signOut} />;
  }

  const handleNavigate = (view: string) => {
    if (view === currentView) return;
    // Trigger transition
    setViewTransition(true);
    setTimeout(() => {
      setCurrentView(view as ViewType);
      setCommandPaletteOpen(false);
      // Scroll to top
      if (mainRef.current) mainRef.current.scrollTop = 0;
      // End transition
      setTimeout(() => setViewTransition(false), 20);
    }, 150);
  };

  const handleViewChange = (view: ViewType) => {
    handleNavigate(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'profile': return <StewardProfileView memberId={teamMemberId || 'james'} onNavigate={handleNavigate} />;
      case 'dashboard': return <DashboardView onNavigate={handleNavigate} />;
      case 'team': return <TeamView />;
      case 'chat': return <ChatView />;
      case 'okrs': return <OKRView />;
      case 'tasks': return <TasksView />;
      case 'governance': return <GovernanceView />;
      case 'roadmap': return <RoadmapView />;
      case 'events': return <EventsView />;
      case 'nodes': return <NodesView />;
      case 'budget': return <BudgetView />;
      case 'advisor': return <AdvisorView />;
      default: return <StewardProfileView memberId={teamMemberId || 'james'} onNavigate={handleNavigate} />;
    }
  };

  return (
    <DataProvider>
    <div className="flex h-screen overflow-hidden bg-background">
      <style>{`
        @media (min-width: 768px) { main { margin-left: ${sidebarCollapsed ? 72 : 260}px !important; } }
        .view-transition { transition: opacity 0.15s ease, transform 0.15s ease; }
        .view-fade-out { opacity: 0; transform: translateY(4px); }
        .view-fade-in { opacity: 1; transform: translateY(0); }
      `}</style>

      <div className="hidden md:block">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={teamMemberId}
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onSignOut={signOut}
        />
      </div>

      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        <div
          className={`p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto view-transition ${viewTransition ? 'view-fade-out' : 'view-fade-in'}`}
        >
          {renderView()}
        </div>
      </main>

      <MobileNav
        currentView={currentView}
        onViewChange={handleViewChange}
        onOpenSearch={() => setCommandPaletteOpen(true)}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
    </DataProvider>
  );
}
