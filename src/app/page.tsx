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
import { NotesView } from '@/components/views/NotesView';
import { ActivityView } from '@/components/views/ActivityView';
import { EnrollmentView } from '@/components/views/EnrollmentView';
import { BudgetView } from '@/components/views/BudgetView';
import { PodsView } from '@/components/views/PodsView';
import { AccountabilityView } from '@/components/views/AccountabilityView';
import { MeetingIntelView } from '@/components/views/MeetingIntelView';
import { WhatChangedView } from '@/components/views/WhatChangedView';
import { KnowledgeGraphView } from '@/components/views/KnowledgeGraphView';
import { StewardAlignmentView } from '@/components/views/StewardAlignmentView';
import { MemberHealthView } from '@/components/views/MemberHealthView';
import { CashRunwayView } from '@/components/views/CashRunwayView';
import { RoleDriftView } from '@/components/views/RoleDriftView';
import { LeaderboardView } from '@/components/views/LeaderboardView';
import { PeerFeedbackView } from '@/components/views/PeerFeedbackView';
import { EcosystemIntelView } from '@/components/views/EcosystemIntelView';
import { StewardOSView } from '@/components/views/StewardOSView';
import { LoginScreen } from '@/components/LoginScreen';
import { CommandPalette } from '@/components/CommandPalette';

export type ViewType = 'dashboard' | 'nodes' | 'team' | 'okrs' | 'tasks' | 'roadmap' | 'governance' | 'events' | 'chat' | 'notes' | 'activity' | 'enrollment' | 'budget' | 'pods' | 'accountability' | 'meeting-intel' | 'what-changed' | 'knowledge-graph' | 'steward-alignment' | 'member-health' | 'cash-runway' | 'role-drift' | 'leaderboard' | 'peer-feedback' | 'ecosystem-intel' | 'steward-os';

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

export default function Home() {
  const { user, teamMemberId, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [viewTransition, setViewTransition] = useState(false);
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
      case 'dashboard': return <DashboardView onNavigate={handleNavigate} />;
      case 'nodes': return <NodesView />;
      case 'team': return <TeamView />;
      case 'okrs': return <OKRView />;
      case 'tasks': return <TasksView />;
      case 'roadmap': return <RoadmapView />;
      case 'governance': return <GovernanceView />;
      case 'events': return <EventsView />;
      case 'chat': return <ChatView />;
      case 'notes': return <NotesView />;
      case 'activity': return <ActivityView />;
      case 'enrollment': return <EnrollmentView />;
      case 'budget': return <BudgetView />;
      case 'pods': return <PodsView />;
      case 'accountability': return <AccountabilityView />;
      case 'meeting-intel': return <MeetingIntelView />;
      case 'what-changed': return <WhatChangedView />;
      case 'knowledge-graph': return <KnowledgeGraphView />;
      case 'steward-alignment': return <StewardAlignmentView />;
      case 'member-health': return <MemberHealthView />;
      case 'cash-runway': return <CashRunwayView />;
      case 'role-drift': return <RoleDriftView />;
      case 'leaderboard': return <LeaderboardView />;
      case 'peer-feedback': return <PeerFeedbackView />;
      case 'ecosystem-intel': return <EcosystemIntelView />;
      case 'steward-os': return <StewardOSView />;
      default: return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
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
  );
}
