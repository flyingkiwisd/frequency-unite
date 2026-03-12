'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ChevronUp,
  MessageCircle,
  Calendar,
  Wallet,
  LogOut,
  Sparkles,
  Trophy,
  Check,
  ArrowLeftRight,
  BookOpen,
  ScrollText,
  Bot,
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { teamMembers } from '@/lib/data';
import type { ViewType } from '@/lib/data';
import { tailwindColorMap } from '@/lib/constants';
import { isClerkConfigured } from '@/lib/config';

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


const navItems: { label: string; icon: React.ElementType; view: ViewType; group: number; hasNotification?: boolean; description?: string }[] = [
  // Core Operations
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', group: 1, description: 'Overview & metrics' },
  { label: 'Team', icon: Users, view: 'team', group: 1, description: 'Members & roles' },
  { label: 'Chat', icon: MessageCircle, view: 'chat', group: 1, hasNotification: true, description: 'Team messaging' },
  // Strategy & Execution
  { label: 'OKRs & KPIs', icon: Target, view: 'okrs', group: 2, description: 'Objectives & results' },
  { label: 'Tasks', icon: CheckSquare, view: 'tasks', group: 2, hasNotification: true, description: '90-day action plan' },
  { label: 'Decisions', icon: ScrollText, view: 'decisions', group: 2, hasNotification: true, description: 'Decision log & memory' },
  { label: 'Governance', icon: Scale, view: 'governance', group: 2, description: 'Policies & structure' },
  // Steward Tools
  { label: 'Journal', icon: BookOpen, view: 'journal', group: 3, description: 'Reflection & check-ins' },
  // Planning & Coordination
  { label: 'Roadmap', icon: Map, view: 'roadmap', group: 4, description: 'Strategic phases' },
  { label: 'Events', icon: Calendar, view: 'events', group: 4, hasNotification: true, description: 'Gatherings & retreats' },
  { label: 'Nodes', icon: Network, view: 'nodes', group: 4, description: 'Node ecosystem' },
  // Finance
  { label: 'Budget', icon: Wallet, view: 'budget', group: 5, description: 'Financial tracking' },
  // Intelligence
  { label: 'Leaderboard', icon: Trophy, view: 'leaderboard', group: 6, description: 'Performance rankings' },
  { label: '33 Agents', icon: Bot, view: 'agents', group: 6, hasNotification: true, description: 'Steward intelligence network' },
  { label: 'AI Advisor', icon: Sparkles, view: 'advisor', group: 6, description: 'Advisory AI assistant' },
];

const groupLabels: Record<number, string> = {
  1: 'CORE',
  2: 'STRATEGY',
  3: 'STEWARD',
  4: 'PLANNING',
  5: 'FINANCE',
  6: 'INTELLIGENCE',
};

// Inject global keyframes and scrollbar styles once
const sidebarStyleId = 'sidebar-premium-styles';
function ensureSidebarStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(sidebarStyleId)) return;
  const style = document.createElement('style');
  style.id = sidebarStyleId;
  style.textContent = `
    @keyframes sidebarSlideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes activeIndicator {
      from { transform: scaleY(0); }
      to { transform: scaleY(1); }
    }
    @keyframes logoShimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes statusPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(107, 143, 113, 0.5); }
      50% { box-shadow: 0 0 0 3px rgba(107, 143, 113, 0); }
    }
    @keyframes navFadeIn {
      from { opacity: 0; transform: translateX(-8px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes contentFadeIn {
      from { opacity: 0; transform: translateX(-4px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes contentFadeOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(-4px); }
    }
    @keyframes activeBarSlide {
      from { opacity: 0; transform: scaleY(0.3) translateY(var(--bar-slide-from, 0px)); }
      to { opacity: 1; transform: scaleY(1) translateY(0px); }
    }
    @keyframes tooltipIn {
      from { opacity: 0; transform: translateX(-4px) scale(0.95); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes scrollIndicatorPulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes profileCardGlow {
      0%, 100% { box-shadow: inset 0 1px 0 rgba(212, 165, 116, 0.06); }
      50% { box-shadow: inset 0 1px 0 rgba(212, 165, 116, 0.12); }
    }

    .sidebar-premium-nav::-webkit-scrollbar {
      width: 4px;
    }
    .sidebar-premium-nav::-webkit-scrollbar-track {
      background: transparent;
    }
    .sidebar-premium-nav::-webkit-scrollbar-thumb {
      background: rgba(212, 165, 116, 0.15);
      border-radius: 4px;
    }
    .sidebar-premium-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(212, 165, 116, 0.3);
    }

    .sidebar-nav-item {
      position: relative;
      transition: background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                  color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                  padding-left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .sidebar-nav-item .nav-icon {
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                  filter 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .sidebar-nav-item:hover .nav-icon {
      transform: scale(1.12);
    }
    .sidebar-nav-item.active .nav-icon {
      filter: drop-shadow(0 0 6px rgba(212, 165, 116, 0.5));
    }
    .sidebar-nav-item .nav-label {
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                  opacity 0.15s ease;
    }
    .sidebar-nav-item:hover .nav-label {
      transform: translateX(2px);
    }
    .sidebar-nav-item .active-bar {
      position: absolute;
      left: 0;
      top: 8%;
      bottom: 8%;
      width: 4px;
      background: linear-gradient(180deg, #d4a574, #8b5cf6);
      border-radius: 0 4px 4px 0;
      transform-origin: center center;
      animation: activeBarSlide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      box-shadow: 0 0 8px rgba(212, 165, 116, 0.4), 0 0 16px rgba(212, 165, 116, 0.15);
      transition: top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                  bottom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes notifPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
      50% { box-shadow: 0 0 0 3px rgba(212, 165, 116, 0); }
    }
    .sidebar-notif-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #d4a574;
      border: 1.5px solid #0b0d14;
      animation: notifPulse 3s ease-in-out infinite;
    }
    .sidebar-group-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(160, 152, 136, 0.35);
      padding: 6px 12px 2px 12px;
      user-select: none;
    }
    .sidebar-profile-area {
      transition: background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .sidebar-profile-area:hover {
      background: rgba(212, 165, 116, 0.03) !important;
      box-shadow: inset 0 0 20px rgba(212, 165, 116, 0.03);
    }

    /* Collapsed tooltip */
    .sidebar-tooltip {
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      pointer-events: none;
      animation: tooltipIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      white-space: nowrap;
    }
    .sidebar-tooltip-inner {
      background: rgba(19, 23, 32, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(212, 165, 116, 0.15);
      border-radius: 8px;
      padding: 6px 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(212, 165, 116, 0.06);
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .sidebar-tooltip-arrow {
      position: absolute;
      left: -4px;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
      width: 8px;
      height: 8px;
      background: rgba(19, 23, 32, 0.96);
      border-left: 1px solid rgba(212, 165, 116, 0.15);
      border-bottom: 1px solid rgba(212, 165, 116, 0.15);
    }

    /* Sidebar content fade transitions */
    .sidebar-content-enter {
      animation: contentFadeIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .sidebar-content-exit {
      animation: contentFadeOut 0.15s ease-out forwards;
    }

    /* Scroll indicators */
    .sidebar-scroll-indicator-top,
    .sidebar-scroll-indicator-bottom {
      position: absolute;
      left: 0;
      right: 0;
      height: 32px;
      pointer-events: none;
      z-index: 5;
      transition: opacity 0.25s ease;
    }
    .sidebar-scroll-indicator-top {
      top: 0;
      background: linear-gradient(180deg, rgba(11, 13, 20, 0.95) 0%, transparent 100%);
    }
    .sidebar-scroll-indicator-bottom {
      bottom: 0;
      background: linear-gradient(0deg, rgba(11, 13, 20, 0.95) 0%, transparent 100%);
    }
    .sidebar-scroll-indicator-top::after,
    .sidebar-scroll-indicator-bottom::after {
      content: '';
      position: absolute;
      left: 20%;
      right: 20%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.2), transparent);
    }
    .sidebar-scroll-indicator-top::after {
      bottom: 4px;
    }
    .sidebar-scroll-indicator-bottom::after {
      top: 4px;
    }

    /* Profile mini-card */
    .sidebar-profile-card {
      animation: profileCardGlow 4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// Clerk UserButton section -- renders Clerk's built-in user menu when Clerk is configured
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
        <div className="sidebar-content-enter" style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
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
  const userRole = user?.role ?? 'Member';
  const userColor = tailwindColorMap[user?.color || ''] || '#d4a574';
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [prevActiveView, setPrevActiveView] = useState<string>(currentView);
  const pickerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track previous active view for slide direction
  useEffect(() => {
    if (currentView !== prevActiveView) {
      setPrevActiveView(currentView);
    }
  }, [currentView, prevActiveView]);

  // Inject premium styles on mount
  useEffect(() => {
    ensureSidebarStyles();
  }, []);

  // Close picker on outside click
  useEffect(() => {
    if (!showProfilePicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowProfilePicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfilePicker]);

  // Scroll overflow detection
  const checkScroll = useCallback(() => {
    if (!navRef.current) return;
    const el = navRef.current;
    setCanScrollUp(el.scrollTop > 8);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, collapsed]);

  const activeMembers = teamMembers.filter(m => m.status === 'active');

  const groups = [1, 2, 3, 4, 5, 6];

  // Get nav item index for slide direction
  const getNavIndex = (view: string) => navItems.findIndex(item => item.view === view);

  // Tooltip handlers for collapsed state
  const handleItemMouseEnter = useCallback((view: string) => {
    if (!collapsed) return;
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => {
      setHoveredItem(view);
    }, 200);
  }, [collapsed]);

  const handleItemMouseLeave = useCallback(() => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setHoveredItem(null);
  }, []);

  // Cleanup tooltip timer
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, []);

  // Close tooltip when expanding
  useEffect(() => {
    if (!collapsed) {
      setHoveredItem(null);
    }
  }, [collapsed]);

  return (
    <aside
      style={{
        width: collapsed ? 72 : 260,
        minWidth: collapsed ? 72 : 260,
        background: 'linear-gradient(180deg, #141824 0%, #0b0d14 40%, #0b0d14 100%)',
        borderRight: 'none',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3), 1px 0 0 rgba(212, 165, 116, 0.06)',
        animation: 'sidebarSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}
    >
      {/* Noise overlay for premium texture */}
      <div className="noise-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Logo + Collapse Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '20px 0' : '20px 16px',
          flexShrink: 0,
          position: 'relative',
          transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            <span className="sidebar-content-enter text-glow" style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              background: 'linear-gradient(90deg, #f0ebe4 0%, #d4a574 40%, #f0ebe4 60%, #d4a574 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'logoShimmer 4s ease-in-out infinite',
            }}>
              FREQUENCY UNITE
            </span>
          )}
        </div>
        {!collapsed && (
          <button onClick={onToggleCollapse} title="Collapse sidebar" className="sidebar-content-enter" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a09888', transition: 'background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1e2638'; e.currentTarget.style.color = '#f0ebe4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a09888'; }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {collapsed && (
          <button onClick={onToggleCollapse} title="Expand sidebar" style={{ position: 'absolute', top: 20, right: -12, width: 24, height: 24, borderRadius: '50%', backgroundColor: '#1e2638', border: '1px solid #2e3a4e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a09888', padding: 0, transition: 'background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', zIndex: 60 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2e3a4e'; e.currentTarget.style.color = '#f0ebe4'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e2638'; e.currentTarget.style.color = '#a09888'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ChevronRight size={14} />
          </button>
        )}
        {/* Gradient divider below brand area */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          right: '10%',
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, #d4a574 50%, transparent 100%)',
          opacity: 0.3,
        }} />
      </div>

      {/* Search Button */}
      {onOpenSearch && (
        <div style={{ padding: collapsed ? '8px 12px' : '8px 16px', flexShrink: 0, transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
              border: '1px solid rgba(212, 165, 116, 0.08)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              color: '#6b6358',
              backgroundColor: 'rgba(11, 13, 20, 0.6)',
              transition: 'border-color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.2)'; e.currentTarget.style.color = '#a09888'; e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.08)'; e.currentTarget.style.color = '#6b6358'; e.currentTarget.style.backgroundColor = 'rgba(11, 13, 20, 0.6)'; }}
          >
            <Search size={16} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span className="sidebar-content-enter" style={{ display: 'contents' }}>
                <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
                <span style={{ fontSize: 11, backgroundColor: 'rgba(212, 165, 116, 0.08)', borderRadius: 4, padding: '2px 6px', color: '#6b6358' }}>
                  ⌘K
                </span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Navigation with scroll indicators */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        {/* Top scroll indicator */}
        <div
          className="sidebar-scroll-indicator-top"
          style={{ opacity: canScrollUp ? 1 : 0 }}
        >
          <div style={{
            display: 'flex', justifyContent: 'center', paddingTop: 4,
          }}>
            <ChevronUp size={12} style={{
              color: 'rgba(212, 165, 116, 0.4)',
              animation: canScrollUp ? 'scrollIndicatorPulse 2s ease-in-out infinite' : 'none',
            }} />
          </div>
        </div>

        <nav
          ref={navRef}
          className="sidebar-premium-nav scrollbar-autohide"
          style={{
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: collapsed ? '8px 0' : '8px 8px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(212, 165, 116, 0.15) transparent',
            transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {groups.map((group, gi) => (
            <React.Fragment key={group}>
              {gi > 0 && (
                <div style={{
                  height: 1,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(212, 165, 116, 0.15) 50%, transparent 100%)',
                  margin: collapsed ? '10px 12px' : '10px 8px',
                  transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              )}
              {/* Group label */}
              {!collapsed && (
                <div className="sidebar-group-label sidebar-content-enter" style={{
                  animation: `navFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${gi * 0.05}s both`,
                }}>
                  {groupLabels[group]}
                </div>
              )}
              {navItems
                .filter((item) => item.group === group)
                .map((item, itemIndex) => {
                  const isActive = currentView === item.view;
                  const Icon = item.icon;
                  const showTooltip = collapsed && hoveredItem === item.view;

                  return (
                    <div key={item.view} style={{ position: 'relative' }}>
                      <button
                        className={`sidebar-nav-item card-interactive${isActive ? ' active' : ''}`}
                        onClick={() => onViewChange(item.view)}
                        onMouseEnter={(e) => {
                          handleItemMouseEnter(item.view);
                          if (!isActive) {
                            e.currentTarget.style.background = 'linear-gradient(90deg, rgba(212, 165, 116, 0.08) 0%, rgba(212, 165, 116, 0.03) 100%)';
                            e.currentTarget.style.color = '#f0ebe4';
                            e.currentTarget.style.boxShadow = 'inset 0 0 16px rgba(212, 165, 116, 0.04)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          handleItemMouseLeave();
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#a09888';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                          padding: collapsed ? '9px 0' : '9px 12px',
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          border: 'none',
                          borderRadius: collapsed ? 0 : '0 8px 8px 0',
                          cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#e8c9a0' : '#a09888',
                          background: isActive
                            ? 'linear-gradient(90deg, rgba(212, 165, 116, 0.12) 0%, rgba(212, 165, 116, 0.04) 100%)'
                            : 'transparent',
                          boxShadow: isActive ? 'inset 0 0 20px rgba(212, 165, 116, 0.05)' : 'none',
                          whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: 'inherit', marginBottom: 1,
                          animation: `navFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${gi * 0.05 + itemIndex * 0.03}s both`,
                          transition: 'background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        {/* Active left indicator bar with sliding animation */}
                        {isActive && !collapsed && (
                          <span
                            className="active-bar"
                            style={{
                              // Slide direction based on previous vs current index
                              ['--bar-slide-from' as string]: `${(getNavIndex(prevActiveView) - getNavIndex(currentView)) * 8}px`,
                            }}
                          />
                        )}
                        <span className="nav-icon" style={{ display: 'flex', flexShrink: 0, position: 'relative' }}>
                          <Icon size={18} />
                          {item.hasNotification && !isActive && (
                            <span className="sidebar-notif-dot" />
                          )}
                        </span>
                        {!collapsed && <span className="nav-label sidebar-content-enter">{item.label}</span>}
                        {!collapsed && item.hasNotification && !isActive && (
                          <span className="sidebar-content-enter" style={{
                            marginLeft: 'auto',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #d4a574, #e8c9a0)',
                            flexShrink: 0,
                            boxShadow: '0 0 6px rgba(212, 165, 116, 0.4)',
                          }} />
                        )}
                      </button>

                      {/* Hover tooltip when collapsed */}
                      {showTooltip && (
                        <div className="sidebar-tooltip">
                          <div className="sidebar-tooltip-arrow" />
                          <div className="sidebar-tooltip-inner">
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4', lineHeight: 1.3 }}>{item.label}</span>
                            {item.description && (
                              <span style={{ fontSize: 10, color: '#a09888', lineHeight: 1.3 }}>{item.description}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </React.Fragment>
          ))}
        </nav>

        {/* Bottom scroll indicator */}
        <div
          className="sidebar-scroll-indicator-bottom"
          style={{ opacity: canScrollDown ? 1 : 0 }}
        >
          <div style={{
            display: 'flex', justifyContent: 'center', paddingBottom: 4, height: '100%', alignItems: 'flex-end',
          }}>
            <ChevronDown size={12} style={{
              color: 'rgba(212, 165, 116, 0.4)',
              animation: canScrollDown ? 'scrollIndicatorPulse 2s ease-in-out infinite' : 'none',
            }} />
          </div>
        </div>
      </div>

      {/* User Section with Profile Picker */}
      <div ref={pickerRef} style={{ position: 'relative', flexShrink: 0 }}>
        {/* Gradient divider above profile area */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(212, 165, 116, 0.15) 50%, transparent 100%)',
        }} />

        {/* Profile Picker Dropdown */}
        {showProfilePicker && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            backgroundColor: '#0b0d14', border: '1px solid rgba(212, 165, 116, 0.1)', borderBottom: 'none',
            borderRadius: '12px 12px 0 0', maxHeight: 320, overflowY: 'auto',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.5), 0 -2px 8px rgba(212, 165, 116, 0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(212, 165, 116, 0.08)' }}>
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
                      transition: 'background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                    onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.06)'; }}
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

        {/* User Profile Mini-Card */}
        <div className="sidebar-profile-area sidebar-profile-card" style={{
          padding: collapsed ? '12px 0' : '12px 14px',
          display: 'flex',
          alignItems: collapsed ? 'center' : 'flex-start',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 10,
          borderRadius: 0,
          transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {isClerkConfigured ? (
            <ClerkUserSection collapsed={collapsed} userName={userName} />
          ) : (
            <>
              <button
                onClick={() => setShowProfilePicker(!showProfilePicker)}
                title={collapsed ? `${userName} — click to switch` : undefined}
                style={{ position: 'relative', flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {/* Status ring around avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'conic-gradient(from 0deg, #6b8f71, #6b8f71 80%, transparent 80%, transparent 100%)',
                  padding: 2,
                  animation: 'statusPulse 3s ease-in-out infinite',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${userColor}, ${userColor}cc)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '0.02em',
                    boxShadow: showProfilePicker ? `0 0 0 2px #0b0d14, 0 0 0 4px ${userColor}60` : 'none',
                    transition: 'box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}>
                    {initials}
                  </div>
                </div>
                <div style={{
                  position: 'absolute', bottom: 1, right: 1,
                  width: 10, height: 10, borderRadius: '50%',
                  backgroundColor: '#6b8f71',
                  border: '2px solid #0b0d14',
                }} />
              </button>
              {!collapsed && (
                <div className="sidebar-content-enter" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Name and role card section */}
                  <button
                    onClick={() => setShowProfilePicker(!showProfilePicker)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%' }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>{userName}</div>
                        <div style={{ fontSize: 10, color: '#a09888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3, marginTop: 1 }}>{userRole}</div>
                      </div>
                      <ChevronDown size={14} style={{
                        color: '#6b6358', flexShrink: 0, transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: showProfilePicker ? 'rotate(180deg)' : 'rotate(0)',
                      }} />
                    </div>
                  </button>
                  {/* Status + Sign out row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 10, color: '#6b8f71', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6b8f71', display: 'inline-block',
                        boxShadow: '0 0 4px rgba(107, 143, 113, 0.6)',
                      }} />
                      <span style={{ letterSpacing: '0.04em' }}>Online</span>
                    </div>
                    {onSignOut && (
                      <button
                        onClick={onSignOut}
                        title="Sign out"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6358', transition: 'background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', flexShrink: 0 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(224, 96, 96, 0.1)'; e.currentTarget.style.color = '#e06060'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6358'; }}
                      >
                        <LogOut size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
