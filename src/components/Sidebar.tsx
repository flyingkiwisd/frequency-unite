'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Network,
  Users,
  Target,
  CheckSquare,
  Map,
  Scale,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Calendar,
  Wallet,
  LogOut,
  User,
  Sparkles,
  Trophy,
  Check,
  ArrowLeftRight,
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { teamMembers } from '@/lib/data';
import { isClerkConfigured } from '@/lib/config';

type ViewType = 'profile' | 'dashboard' | 'team' | 'chat' | 'okrs' | 'tasks' | 'governance' | 'roadmap' | 'events' | 'nodes' | 'budget' | 'advisor' | 'leaderboard';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: string | null;
  onOpenSearch?: () => void;
  onSignOut?: () => void;
  onSwitchProfile?: (userId: string) => void;
}

const tailwindColorMap: Record<string, string> = {
  'bg-amber-500': '#f59e0b', 'bg-amber-400': '#fbbf24', 'bg-rose-400': '#fb7185',
  'bg-violet-500': '#8b5cf6', 'bg-sky-400': '#38bdf8', 'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7', 'bg-pink-400': '#f472b6', 'bg-teal-400': '#2dd4bf',
  'bg-green-500': '#22c55e', 'bg-lime-500': '#84cc16', 'bg-orange-500': '#f97316',
  'bg-indigo-400': '#818cf8', 'bg-slate-400': '#94a3b8',
};

const navItems: { label: string; icon: React.ElementType; view: ViewType; group: number }[] = [
  // Personal
  { label: 'My Profile', icon: User, view: 'profile', group: 0 },
  // Core Operations
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', group: 1 },
  { label: 'Team', icon: Users, view: 'team', group: 1 },
  { label: 'Chat', icon: MessageCircle, view: 'chat', group: 1 },
  // Strategy & Execution
  { label: 'OKRs & KPIs', icon: Target, view: 'okrs', group: 2 },
  { label: 'Tasks', icon: CheckSquare, view: 'tasks', group: 2 },
  { label: 'Governance', icon: Scale, view: 'governance', group: 2 },
  // Planning & Coordination
  { label: 'Roadmap', icon: Map, view: 'roadmap', group: 3 },
  { label: 'Events', icon: Calendar, view: 'events', group: 3 },
  { label: 'Nodes', icon: Network, view: 'nodes', group: 3 },
  // Finance
  { label: 'Budget', icon: Wallet, view: 'budget', group: 4 },
  // Performance
  { label: 'Leaderboard', icon: Trophy, view: 'leaderboard', group: 5 },
  // AI Advisory
  { label: 'AI Advisor', icon: Sparkles, view: 'advisor', group: 5 },
];

// Clerk UserButton section — renders Clerk's built-in user menu when Clerk is configured
function ClerkUserSection({ collapsed, userName }: { collapsed: boolean; userName: string }) {
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
  onSwitchProfile,
}: SidebarProps) {
  const user = teamMembers.find((m) => m.id === currentUser);
  const initials = user?.avatar ?? '??';
  const userName = user?.name ?? 'Unknown';
  const userColor = tailwindColorMap[user?.color || ''] || '#d4a574';
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!showProfilePicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowProfilePicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfilePicker]);

  const activeMembers = teamMembers.filter(m => m.status === 'active');

  const groups = [0, 1, 2, 3, 4, 5];

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

      {/* User Section with Profile Picker */}
      <div ref={pickerRef} style={{ position: 'relative', borderTop: '1px solid #1e2638', flexShrink: 0 }}>
        {/* Profile Picker Dropdown */}
        {showProfilePicker && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            backgroundColor: '#131720', border: '1px solid #1e2638', borderBottom: 'none',
            borderRadius: '12px 12px 0 0', maxHeight: 320, overflowY: 'auto',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1e2638' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArrowLeftRight size={14} style={{ color: '#6b6358' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Switch Profile</span>
              </div>
            </div>
            <div style={{ padding: 8 }}>
              {activeMembers.map(member => {
                const isCurrent = member.id === currentUser;
                const hex = tailwindColorMap[member.color] || '#d4a574';
                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      if (!isCurrent && onSwitchProfile) onSwitchProfile(member.id);
                      setShowProfilePicker(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '8px 10px', border: 'none', borderRadius: 8,
                      cursor: isCurrent ? 'default' : 'pointer', fontFamily: 'inherit',
                      backgroundColor: isCurrent ? 'rgba(212, 165, 116, 0.08)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.backgroundColor = '#1e2638'; }}
                    onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${hex}, ${hex}cc)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>
                      {member.avatar}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', textAlign: 'left' }}>
                      <div style={{ fontSize: 12, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? '#f0ebe4' : '#a09888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                      <div style={{ fontSize: 10, color: '#6b6358', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.role}</div>
                    </div>
                    {isCurrent && <Check size={14} style={{ color: '#6b8f71', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* User Button */}
        <div style={{ padding: collapsed ? '16px 0' : '16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 12 }}>
          {isClerkConfigured ? (
            <ClerkUserSection collapsed={collapsed} userName={userName} />
          ) : (
            <>
              <button
                onClick={() => setShowProfilePicker(!showProfilePicker)}
                title={collapsed ? `${userName} — click to switch` : undefined}
                style={{ position: 'relative', flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${userColor}, ${userColor}cc)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '0.02em',
                  boxShadow: showProfilePicker ? `0 0 0 2px #131720, 0 0 0 4px ${userColor}60` : 'none',
                  transition: 'box-shadow 0.2s',
                }}>
                  {initials}
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#6b8f71', border: '2px solid #131720' }} />
              </button>
              {!collapsed && (
                <>
                  <button
                    onClick={() => setShowProfilePicker(!showProfilePicker)}
                    style={{ overflow: 'hidden', flex: 1, minWidth: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                    <div style={{ fontSize: 11, color: '#6b8f71', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6b8f71', display: 'inline-block' }} />
                      Online
                    </div>
                  </button>
                  <ChevronDown size={14} style={{
                    color: '#6b6358', flexShrink: 0, transition: 'transform 0.2s',
                    transform: showProfilePicker ? 'rotate(180deg)' : 'rotate(0)',
                  }} />
                  {onSignOut && (
                    <button
                      onClick={onSignOut}
                      title="Sign out"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6358', transition: 'background 0.15s, color 0.15s', flexShrink: 0 }}
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
      </div>
    </aside>
  );
}
