'use client';

import React from 'react';
import {
  LayoutDashboard,
  Network,
  Users,
  Target,
  CheckSquare,
  Map,
  Scale,
  StickyNote,
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Calendar,
  UserPlus,
  Wallet,
  CircleDot,
  Flame,
  Brain,
  Sparkles,
  GitBranch,
  Heart,
  DollarSign,
  Compass,
  Trophy,
  MessageSquare,
  Globe,
  UserCog,
  HandshakeIcon,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';
import { isClerkConfigured } from '@/lib/config';

type ViewType = 'dashboard' | 'nodes' | 'team' | 'okrs' | 'tasks' | 'roadmap' | 'governance' | 'events' | 'chat' | 'notes' | 'activity' | 'enrollment' | 'budget' | 'pods' | 'accountability' | 'meeting-intel' | 'what-changed' | 'knowledge-graph' | 'steward-alignment' | 'member-health' | 'cash-runway' | 'role-drift' | 'leaderboard' | 'peer-feedback' | 'ecosystem-intel' | 'steward-os';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: string | null;
  onOpenSearch?: () => void;
  onSignOut?: () => void;
}

const navItems: { label: string; icon: React.ElementType; view: ViewType; group: number }[] = [
  // Core
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', group: 1 },
  { label: 'Nodes', icon: Network, view: 'nodes', group: 1 },
  { label: 'Team', icon: Users, view: 'team', group: 1 },
  { label: 'Chat', icon: MessageCircle, view: 'chat', group: 1 },
  { label: 'Steward OS', icon: UserCog, view: 'steward-os', group: 1 },
  // Membership & Ops
  { label: 'Enrollment', icon: UserPlus, view: 'enrollment', group: 2 },
  { label: 'Member Health', icon: Heart, view: 'member-health', group: 2 },
  { label: 'Mothership OS', icon: Wallet, view: 'budget', group: 2 },
  { label: 'Pods', icon: CircleDot, view: 'pods', group: 2 },
  // Strategy & Execution
  { label: 'OKRs & KPIs', icon: Target, view: 'okrs', group: 3 },
  { label: 'Tasks', icon: CheckSquare, view: 'tasks', group: 3 },
  { label: 'Governance', icon: Scale, view: 'governance', group: 3 },
  { label: 'Events', icon: Calendar, view: 'events', group: 3 },
  { label: 'Accountability', icon: Flame, view: 'accountability', group: 3 },
  // Intelligence
  { label: 'Meeting Intel', icon: Brain, view: 'meeting-intel', group: 4 },
  { label: 'What Changed', icon: Sparkles, view: 'what-changed', group: 4 },
  { label: 'Knowledge Graph', icon: GitBranch, view: 'knowledge-graph', group: 4 },
  { label: 'Cash Runway', icon: DollarSign, view: 'cash-runway', group: 4 },
  { label: 'Ecosystem Intel', icon: Globe, view: 'ecosystem-intel', group: 4 },
  // Performance
  { label: 'Leaderboard', icon: Trophy, view: 'leaderboard', group: 5 },
  { label: 'Peer Feedback', icon: MessageSquare, view: 'peer-feedback', group: 5 },
  { label: 'Alignment', icon: HandshakeIcon, view: 'steward-alignment', group: 5 },
  { label: 'Role Drift', icon: Compass, view: 'role-drift', group: 5 },
  // More
  { label: 'Roadmap', icon: Map, view: 'roadmap', group: 6 },
  { label: 'Notes', icon: StickyNote, view: 'notes', group: 6 },
  { label: 'Activity', icon: Activity, view: 'activity', group: 6 },
];

// Clerk UserButton section — renders Clerk's built-in user menu when Clerk is configured
function ClerkUserSection({ collapsed, userName, initials }: { collapsed: boolean; userName: string; initials: string }) {
  // Dynamic import — only resolved when Clerk is actually configured
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { UserButton } = require('@clerk/nextjs');

  return (
    <>
      <div style={{ flexShrink: 0 }}>
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 36, height: 36 },
              userButtonPopoverCard: { backgroundColor: '#131720', borderColor: '#1e2638' },
            },
          }}
        />
      </div>
      {!collapsed && (
        <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
          <div style={{ fontSize: 11, color: '#6b8f71', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6b8f71', display: 'inline-block' }} />
            Online
          </div>
        </div>
      )}
    </>
  );
}

export function Sidebar({
  currentView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  currentUser,
  onOpenSearch,
  onSignOut,
}: SidebarProps) {
  const user = teamMembers.find((m) => m.id === currentUser);
  const initials = user?.avatar ?? '??';
  const userName = user?.name ?? 'Unknown';

  const groups = [1, 2, 3, 4, 5, 6];

  return (
    <aside
      style={{
        width: collapsed ? 72 : 260,
        minWidth: collapsed ? 72 : 260,
        backgroundColor: '#131720',
        borderRight: '1px solid #1e2638',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo + Collapse Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '20px 0' : '20px 16px',
          borderBottom: '1px solid #1e2638',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <circle cx="16" cy="16" r="14" fill="url(#freqGrad)" opacity="0.15" />
            <path d="M6 16 Q10 8 16 16 Q22 24 26 16" stroke="#d4a574" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M6 16 Q10 10 16 16 Q22 22 26 16" stroke="#8b5cf6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
            <circle cx="16" cy="16" r="2.5" fill="#d4a574" />
            <defs>
              <radialGradient id="freqGrad" cx="16" cy="16" r="14">
                <stop stopColor="#d4a574" />
                <stop offset="1" stopColor="#8b5cf6" />
              </radialGradient>
            </defs>
          </svg>
          {!collapsed && (
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#f0ebe4' }}>
              FREQUENCY UNITE
            </span>
          )}
        </div>
        {!collapsed && (
          <button onClick={onToggleCollapse} title="Collapse sidebar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a09888', transition: 'background 0.15s, color 0.15s', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1e2638'; e.currentTarget.style.color = '#f0ebe4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a09888'; }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {collapsed && (
          <button onClick={onToggleCollapse} title="Expand sidebar" style={{ position: 'absolute', top: 20, right: -12, width: 24, height: 24, borderRadius: '50%', backgroundColor: '#1e2638', border: '1px solid #2e3a4e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a09888', padding: 0, transition: 'background 0.15s, color 0.15s', zIndex: 60 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2e3a4e'; e.currentTarget.style.color = '#f0ebe4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e2638'; e.currentTarget.style.color = '#a09888'; }}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Search Button */}
      {onOpenSearch && (
        <div style={{ padding: collapsed ? '8px 12px' : '8px 16px', flexShrink: 0 }}>
          <button
            onClick={onOpenSearch}
            title={collapsed ? 'Search (Cmd+K)' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: collapsed ? '8px 0' : '8px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              border: '1px solid #1e2638',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              color: '#6b6358',
              backgroundColor: '#0d1018',
              transition: 'border-color 0.15s, color 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; e.currentTarget.style.color = '#a09888'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; e.currentTarget.style.color = '#6b6358'; }}
          >
            <Search size={16} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
                <span style={{ fontSize: 11, backgroundColor: '#1e2638', borderRadius: 4, padding: '2px 6px', color: '#6b6358' }}>
                  ⌘K
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '8px 0' : '8px 8px' }}>
        {groups.map((group, gi) => (
          <React.Fragment key={group}>
            {gi > 0 && (
              <div style={{ height: 1, backgroundColor: '#1e2638', margin: collapsed ? '8px 12px' : '8px 8px' }} />
            )}
            {navItems
              .filter((item) => item.group === group)
              .map((item) => {
                const isActive = currentView === item.view;
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => onViewChange(item.view)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: collapsed ? '9px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      border: 'none',
                      borderLeft: isActive ? '3px solid #d4a574' : '3px solid transparent',
                      borderRadius: collapsed ? 0 : '0 8px 8px 0',
                      cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#e8c9a0' : '#a09888',
                      backgroundColor: isActive ? 'rgba(212, 165, 116, 0.08)' : 'transparent',
                      boxShadow: isActive ? 'inset 0 0 20px rgba(212, 165, 116, 0.05)' : 'none',
                      transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                      whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: 'inherit', marginBottom: 1,
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = '#1e2638'; e.currentTarget.style.color = '#f0ebe4'; }}}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a09888'; }}}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
          </React.Fragment>
        ))}
      </nav>

      {/* User Section */}
      <div style={{ borderTop: '1px solid #1e2638', padding: collapsed ? '16px 0' : '16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 12, flexShrink: 0 }}>
        {isClerkConfigured ? (
          <ClerkUserSection collapsed={collapsed} userName={userName} initials={initials} />
        ) : (
          <>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div title={collapsed ? userName : undefined} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #c4925a, #d4a574)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0b0d14', letterSpacing: '0.02em' }}>
                {initials}
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#6b8f71', border: '2px solid #131720' }} />
            </div>
            {!collapsed && (
              <>
                <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                  <div style={{ fontSize: 11, color: '#6b8f71', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6b8f71', display: 'inline-block' }} />
                    Online
                  </div>
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Sign out"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6b6358',
                      transition: 'background 0.15s, color 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(224, 96, 96, 0.1)'; e.currentTarget.style.color = '#e06060'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6358'; }}
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
