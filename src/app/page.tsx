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
import { LeaderboardView } from '@/components/views/LeaderboardView';
import { JournalView } from '@/components/views/JournalView';
import { DecisionLogView } from '@/components/views/DecisionLogView';
import { StewardAgentsView } from '@/components/views/StewardAgentsView';
import { LoginScreen } from '@/components/LoginScreen';
import { CommandPalette } from '@/components/CommandPalette';
import { DataProvider } from '@/lib/supabase/DataProvider';
import { teamMembers, viewTypes } from '@/lib/data';
import type { ViewType } from '@/lib/data';
import { tailwindColorMap } from '@/lib/constants';

/* ─── Global Design System Styles ─── */
const globalStyles = `
  :root {
    --fu-bg-primary: #0b0d14;
    --fu-bg-secondary: #0f1219;
    --fu-bg-elevated: #141820;
    --fu-accent: #d4a574;
    --fu-accent-muted: rgba(212, 165, 116, 0.6);
    --fu-accent-subtle: rgba(212, 165, 116, 0.12);
    --fu-accent-ghost: rgba(212, 165, 116, 0.05);
    --fu-text-primary: #f0ebe4;
    --fu-text-secondary: #a09888;
    --fu-text-muted: rgba(160, 152, 136, 0.5);
    --fu-purple: #8b5cf6;
    --fu-green: #6b8f71;
    --fu-border: rgba(212, 165, 116, 0.08);
    --fu-transition-fast: 150ms;
    --fu-transition-normal: 250ms;
    --fu-transition-slow: 400ms;
    --fu-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --fu-ease-in: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    --fu-ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    --fu-radius-sm: 8px;
    --fu-radius-md: 12px;
    --fu-radius-lg: 16px;
    --fu-radius-xl: 24px;
    --fu-glass-bg: rgba(19, 23, 32, 0.65);
    --fu-glass-border: rgba(212, 165, 116, 0.1);
    --fu-glass-blur: 20px;
  }

  /* ─ View Transition Animations ─ */
  .view-enter { animation: viewEnter 0.3s var(--fu-ease-out) forwards; }
  .view-exit { animation: viewExit 0.2s var(--fu-ease-in) forwards; }

  @keyframes viewEnter {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes viewExit {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-4px); }
  }

  /* Directional slide variants */
  .view-slide-left  { animation: viewSlideLeft  0.25s var(--fu-ease-out) forwards; }
  .view-slide-right { animation: viewSlideRight 0.25s var(--fu-ease-out) forwards; }

  @keyframes viewSlideLeft {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes viewSlideRight {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ─ Splash / Loading Animations ─ */
  @keyframes splashLogoIn {
    0%   { opacity: 0; transform: scale(0.7) rotate(-10deg); filter: blur(8px); }
    50%  { opacity: 1; transform: scale(1.05) rotate(0deg); filter: blur(0); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); }
  }
  @keyframes splashTextIn {
    from { opacity: 0; transform: translateY(10px); letter-spacing: 10px; }
    to   { opacity: 1; transform: translateY(0); letter-spacing: 5px; }
  }
  @keyframes splashSubtitleIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 0.5; transform: translateY(0); }
  }
  @keyframes splashFadeOut {
    from { opacity: 1; transform: scale(1); }
    to   { opacity: 0; transform: scale(1.05); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50%      { opacity: 1; transform: scale(1.05); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes contentReveal {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes waveFloat {
    0%   { transform: translateY(0) scaleY(1); }
    50%  { transform: translateY(-3px) scaleY(1.08); }
    100% { transform: translateY(0) scaleY(1); }
  }
  @keyframes orbFloat1 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
    33%  { transform: translate(30px, -20px) scale(1.1); opacity: 0.25; }
    66%  { transform: translate(-20px, 10px) scale(0.95); opacity: 0.1; }
  }
  @keyframes orbFloat2 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
    33%  { transform: translate(-25px, 15px) scale(1.15); opacity: 0.2; }
    66%  { transform: translate(15px, -25px) scale(0.9); opacity: 0.08; }
  }
  @keyframes ringPulse {
    0%   { transform: scale(0.8); opacity: 0.4; }
    50%  { transform: scale(1.2); opacity: 0; }
    100% { transform: scale(0.8); opacity: 0; }
  }
  @keyframes progressLine {
    0%   { width: 0%; }
    100% { width: 100%; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ─ Sidebar / Content Border Glow ─ */
  @keyframes borderGlow {
    0%, 100% { opacity: 0.3; }
    50%      { opacity: 0.7; }
  }

  /* ─ Ambient Particle System (CSS-only) ─ */
  @keyframes particleDrift1 {
    0%   { transform: translate(0, 0); opacity: 0; }
    10%  { opacity: 0.5; }
    90%  { opacity: 0.5; }
    100% { transform: translate(120px, -180px); opacity: 0; }
  }
  @keyframes particleDrift2 {
    0%   { transform: translate(0, 0); opacity: 0; }
    10%  { opacity: 0.35; }
    90%  { opacity: 0.35; }
    100% { transform: translate(-100px, -200px); opacity: 0; }
  }
  @keyframes particleDrift3 {
    0%   { transform: translate(0, 0); opacity: 0; }
    10%  { opacity: 0.4; }
    90%  { opacity: 0.4; }
    100% { transform: translate(80px, -150px); opacity: 0; }
  }
  @keyframes particleDrift4 {
    0%   { transform: translate(0, 0); opacity: 0; }
    10%  { opacity: 0.3; }
    90%  { opacity: 0.3; }
    100% { transform: translate(-60px, -220px); opacity: 0; }
  }
  @keyframes particleDrift5 {
    0%   { transform: translate(0, 0); opacity: 0; }
    10%  { opacity: 0.45; }
    90%  { opacity: 0.45; }
    100% { transform: translate(90px, -170px); opacity: 0; }
  }
  .fu-particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    will-change: transform, opacity;
  }
  .fu-particle-1 { width: 3px; height: 3px; background: rgba(212, 165, 116, 0.4); bottom: 20%; left: 15%; animation: particleDrift1 12s ease-in-out infinite; }
  .fu-particle-2 { width: 2px; height: 2px; background: rgba(139, 92, 246, 0.35); bottom: 30%; left: 45%; animation: particleDrift2 16s ease-in-out infinite 2s; }
  .fu-particle-3 { width: 4px; height: 4px; background: rgba(212, 165, 116, 0.25); bottom: 10%; left: 70%; animation: particleDrift3 14s ease-in-out infinite 4s; }
  .fu-particle-4 { width: 2px; height: 2px; background: rgba(107, 143, 113, 0.35); bottom: 40%; left: 30%; animation: particleDrift4 18s ease-in-out infinite 6s; }
  .fu-particle-5 { width: 3px; height: 3px; background: rgba(139, 92, 246, 0.3); bottom: 15%; left: 85%; animation: particleDrift5 15s ease-in-out infinite 3s; }

  /* ─ View Crossfade ─ */
  @keyframes viewCrossfadeIn {
    from { opacity: 0; filter: blur(2px); }
    to   { opacity: 1; filter: blur(0px); }
  }
  @keyframes viewCrossfadeOut {
    from { opacity: 1; filter: blur(0px); }
    to   { opacity: 0; filter: blur(2px); }
  }

  /* ─ Idle Screensaver ─ */
  @keyframes idleBreath1 {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.06; }
    50%      { transform: translate(-50%, -50%) scale(1.6); opacity: 0.12; }
  }
  @keyframes idleBreath2 {
    0%, 100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.04; }
    50%      { transform: translate(-50%, -50%) scale(0.8); opacity: 0.1; }
  }
  @keyframes idleDrift {
    0%   { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
  .fu-idle-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    opacity: 0;
    transition: opacity 2s ease-in-out;
  }
  .fu-idle-overlay.active {
    opacity: 1;
  }

  /* ─ Notification Toast Area ─ */
  .fu-toast-area {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
    max-width: 360px;
  }
  @keyframes toastSlideIn {
    from { opacity: 0; transform: translateX(20px) scale(0.95); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes toastSlideOut {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to   { opacity: 0; transform: translateX(20px) scale(0.95); }
  }
  .fu-toast {
    pointer-events: auto;
    background: var(--fu-glass-bg);
    backdrop-filter: blur(var(--fu-glass-blur));
    -webkit-backdrop-filter: blur(var(--fu-glass-blur));
    border: 1px solid var(--fu-glass-border);
    border-radius: var(--fu-radius-md);
    padding: 12px 16px;
    font-size: 13px;
    color: var(--fu-text-primary);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03);
    animation: toastSlideIn 0.35s var(--fu-ease-out) forwards;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ─ Breadcrumb Trail ─ */
  .fu-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--fu-text-muted);
    padding: 0 0 12px 0;
    user-select: none;
  }
  .fu-breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s ease;
  }
  .fu-breadcrumb-item.clickable {
    cursor: pointer;
  }
  .fu-breadcrumb-item.clickable:hover {
    color: var(--fu-accent);
  }
  .fu-breadcrumb-item.current {
    color: var(--fu-text-secondary);
    font-weight: 500;
  }
  .fu-breadcrumb-sep {
    color: var(--fu-text-muted);
    font-size: 9px;
    opacity: 0.6;
  }

  /* ─ Sidebar collapse: smooth content fade ─ */
  .fu-sidebar-content-fade {
    transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1) 0.05s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .fu-sidebar-collapsed .fu-sidebar-content-fade {
    opacity: 0;
    transform: translateX(-8px);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  /* ─ Loading Progress Percentage ─ */
  @keyframes loadingPercentFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 0.4; transform: translateY(0); }
  }

  /* ─ Profile Setup: tier filter tabs ─ */
  @keyframes tierFilterIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }
  .fu-tier-tab {
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 20px;
    border: 1px solid rgba(212, 165, 116, 0.1);
    background: transparent;
    color: var(--fu-text-muted);
    cursor: pointer;
    transition: all 0.25s var(--fu-ease-out);
    font-family: inherit;
    letter-spacing: 0.3px;
  }
  .fu-tier-tab:hover {
    border-color: rgba(212, 165, 116, 0.2);
    color: var(--fu-text-secondary);
    background: rgba(212, 165, 116, 0.04);
  }
  .fu-tier-tab.active {
    border-color: rgba(212, 165, 116, 0.3);
    color: var(--fu-accent);
    background: rgba(212, 165, 116, 0.08);
  }
  @keyframes memberCardFilter {
    from { opacity: 0; transform: scale(0.92) translateY(6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .fu-member-card-filtered {
    animation: memberCardFilter 0.3s var(--fu-ease-out) forwards;
  }

  /* ─ Role preview tooltip ─ */
  .fu-role-preview {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    padding: 10px 14px;
    background: rgba(19, 23, 32, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(212, 165, 116, 0.15);
    border-radius: 10px;
    font-size: 10px;
    color: var(--fu-text-secondary);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 50;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    max-width: 200px;
    white-space: normal;
    text-align: center;
    line-height: 1.4;
  }
  .fu-role-preview::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(212, 165, 116, 0.15);
  }
  .fu-role-preview.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* ─ Global Scrollbar ─ */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(212, 165, 116, 0.15); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(212, 165, 116, 0.3); }

  /* ─ Selection ─ */
  ::selection { background: rgba(212, 165, 116, 0.25); color: #f0ebe4; }

  /* ─ Focus Visible ─ */
  :focus-visible {
    outline: 2px solid rgba(212, 165, 116, 0.5);
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* ─ Smooth Scroll ─ */
  .fu-smooth-scroll { scroll-behavior: smooth; }

  /* ─ Reduced Motion ─ */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

function LoadingScreen() {
  const [phase, setPhase] = useState<'splash' | 'fadeout' | 'done'>('splash');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fadeout'), 1800);
    const t2 = setTimeout(() => setPhase('done'), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Animate progress percentage
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 2200; // match total loading duration
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

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
        position: 'relative',
        overflow: 'hidden',
        animation: phase === 'fadeout' ? 'splashFadeOut 0.5s ease-out forwards' : undefined,
        opacity: phase === 'done' ? 0 : undefined,
      }}
    >
      <style>{globalStyles}</style>

      {/* Floating ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '25%', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 165, 116, 0.12) 0%, transparent 70%)',
          animation: 'orbFloat1 8s ease-in-out infinite', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '20%', width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          animation: 'orbFloat2 10s ease-in-out infinite', filter: 'blur(50px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '25%', left: '40%', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107, 143, 113, 0.08) 0%, transparent 70%)',
          animation: 'orbFloat1 12s ease-in-out infinite 2s', filter: 'blur(30px)',
        }} />
      </div>

      {/* Pulse ring behind logo */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 120, height: 120,
          marginTop: -60, marginLeft: -60, borderRadius: '50%',
          border: '1px solid rgba(212, 165, 116, 0.2)',
          animation: 'ringPulse 2s ease-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 120, height: 120,
          marginTop: -60, marginLeft: -60, borderRadius: '50%',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          animation: 'ringPulse 2s ease-out infinite 0.5s',
        }} />

        {/* Logo */}
        <div style={{
          animation: 'splashLogoIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          opacity: 0, position: 'relative', zIndex: 2,
        }}>
          <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="url(#loadGrad)" opacity="0.15" />
            <g style={{ animation: 'waveFloat 3s ease-in-out infinite' }}>
              <path d="M10 32 Q18 14 32 32 Q46 50 54 32" stroke="url(#loadWaveGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </g>
            <g style={{ animation: 'waveFloat 3s ease-in-out infinite 0.3s' }}>
              <path d="M10 32 Q18 18 32 32 Q46 46 54 32" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
            </g>
            <g style={{ animation: 'waveFloat 3s ease-in-out infinite 0.6s' }}>
              <path d="M10 32 Q18 22 32 32 Q46 42 54 32" stroke="#6b8f71" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
            </g>
            <circle cx="32" cy="32" r="4.5" fill="#d4a574" />
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
      </div>

      {/* Brand name */}
      <div style={{
        fontSize: '13px', fontWeight: 700, letterSpacing: '6px',
        textTransform: 'uppercase' as const,
        background: 'linear-gradient(90deg, rgba(212,165,116,0.5) 0%, #d4a574 50%, rgba(212,165,116,0.5) 100%)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        animation: 'splashTextIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards, shimmer 3s ease-in-out infinite 1s',
        opacity: 0,
      }}>
        Frequency Unite
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: '10px', fontWeight: 400, letterSpacing: '2px',
        textTransform: 'uppercase' as const,
        color: 'rgba(160, 152, 136, 0.4)',
        animation: 'splashSubtitleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards',
        opacity: 0, marginTop: 8,
      }}>
        Steward Operating System
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop: 36, width: 80, height: 2, borderRadius: 1,
        background: 'rgba(212, 165, 116, 0.08)', overflow: 'hidden',
        animation: 'splashSubtitleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards',
        opacity: 0,
      }}>
        <div style={{
          height: '100%', borderRadius: 1,
          background: 'linear-gradient(90deg, #d4a574, #8b5cf6)',
          animation: 'progressLine 1.5s cubic-bezier(0.4, 0, 0.2, 1) 1s forwards',
          width: '0%',
        }} />
      </div>

      {/* Progress percentage */}
      <div style={{
        marginTop: 12,
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '1.5px',
        fontVariantNumeric: 'tabular-nums',
        color: 'rgba(212, 165, 116, 0.4)',
        animation: 'loadingPercentFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards',
        opacity: 0,
      }}>
        {progress}%
      </div>
    </div>
  );
}

// ─── Profile Setup Screen ───
// Shown after first Clerk login when user hasn't linked to a team member yet

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
  const [activeTier, setActiveTier] = useState<string>('all');
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const tiers = [
    { key: 'all', label: 'All' },
    { key: 'core-team', label: 'Core Team' },
    { key: 'board', label: 'Board' },
    { key: 'node-lead', label: 'Node Leads' },
    { key: 'member', label: 'Members' },
  ];

  const filteredMembers = activeTier === 'all'
    ? teamMembers
    : teamMembers.filter(m => m.tier === activeTier);

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
      <style>{globalStyles}</style>
      {/* Background effects — animated orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,165,116,0.1) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'orbFloat1 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'orbFloat2 14s ease-in-out infinite' }} />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 600,
          margin: '0 20px',
          padding: '52px 44px 44px',
          background: 'rgba(15, 18, 28, 0.7)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(212, 165, 116, 0.1)',
          borderRadius: 28,
          boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.03)',
          animation: 'contentReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 100, height: 100, marginTop: -50, marginLeft: -50, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,165,116,0.08) 0%, transparent 70%)' }} />
            <svg width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2 }}>
              <circle cx="32" cy="32" r="28" fill="url(#pGrad)" opacity="0.15" />
              <g style={{ animation: 'waveFloat 3s ease-in-out infinite' }}>
                <path d="M10 32 Q18 14 32 32 Q46 50 54 32" stroke="#d4a574" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
              <g style={{ animation: 'waveFloat 3s ease-in-out infinite 0.4s' }}>
                <path d="M10 32 Q18 18 32 32 Q46 46 54 32" stroke="#8b5cf6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
              </g>
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
        </div>

        <h1 style={{
          textAlign: 'center', fontSize: 24, fontWeight: 700, marginBottom: 8,
          background: 'linear-gradient(135deg, #f0ebe4 0%, #d4a574 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Welcome to Frequency
        </h1>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#a09888', marginBottom: 8, lineHeight: 1.5 }}>
          Select your steward profile to complete setup
        </p>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(160, 152, 136, 0.4)', marginBottom: 28, fontStyle: 'italic' }}>
          This links your account to your team member identity
        </p>

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.15), transparent)', marginBottom: 20 }} />

        {/* Tier filter tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {tiers.map((tier) => (
            <button
              key={tier.key}
              className={`fu-tier-tab ${activeTier === tier.key ? 'active' : ''}`}
              onClick={() => setActiveTier(tier.key)}
            >
              {tier.label}
              {tier.key !== 'all' && (
                <span style={{ marginLeft: 4, opacity: 0.5, fontSize: 10 }}>
                  {teamMembers.filter(m => tier.key === 'all' || m.tier === tier.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#e06060', marginBottom: 16, padding: '10px 16px', background: 'rgba(224, 96, 96, 0.08)', borderRadius: 12, border: '1px solid rgba(224, 96, 96, 0.15)', backdropFilter: 'blur(8px)' }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            marginBottom: 32,
            maxHeight: 360,
            overflowY: 'auto',
            padding: 4,
            opacity: claiming ? 0.4 : 1,
            pointerEvents: claiming ? 'none' : 'auto',
            transition: 'opacity 0.3s',
          }}
        >
          {filteredMembers.map((member, idx) => {
            const hex = tailwindColorMap[member.color] || '#d4a574';
            const isHovered = hoveredMember === member.id;
            return (
              <button
                key={member.id}
                className="fu-member-card-filtered"
                onClick={() => handleClaim(member.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 4px',
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderRadius: 16,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  fontFamily: 'inherit',
                  animationDelay: `${idx * 0.03}s`,
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  setHoveredMember(member.id);
                  e.currentTarget.style.background = `rgba(${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}, 0.06)`;
                  e.currentTarget.style.borderColor = `${hex}25`;
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${hex}15`;
                }}
                onMouseLeave={(e) => {
                  setHoveredMember(null);
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Role preview tooltip */}
                <div className={`fu-role-preview ${isHovered ? 'visible' : ''}`}>
                  <div style={{ fontWeight: 600, color: hex, marginBottom: 2, fontSize: 11 }}>{member.shortRole || member.role}</div>
                  <div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{member.tier.replace('-', ' ')}</div>
                </div>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${hex}, ${hex}aa)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'white',
                      boxShadow: `0 4px 16px ${hex}30`,
                      transition: 'box-shadow 0.25s',
                    }}
                  >
                    {member.avatar}
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#a09888', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80, transition: 'color 0.2s' }}>
                  {member.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {claiming && (
          <div style={{ textAlign: 'center', fontSize: 13, color: '#d4a574', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, border: '2px solid #d4a574', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Linking your profile...
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onSignOut}
            style={{
              background: 'transparent',
              border: '1px solid rgba(160, 152, 136, 0.15)',
              borderRadius: 10,
              padding: '9px 24px',
              fontSize: 12,
              fontWeight: 500,
              color: '#6b6358',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(224, 96, 96, 0.3)'; e.currentTarget.style.color = '#e06060'; e.currentTarget.style.background = 'rgba(224, 96, 96, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(160, 152, 136, 0.15)'; e.currentTarget.style.color = '#6b6358'; e.currentTarget.style.background = 'transparent'; }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── View depth map for directional transitions ─── */
const viewDepthMap: Record<ViewType, number> = {
  dashboard: 0,
  team: 1,
  chat: 1,
  okrs: 2,
  tasks: 2,
  governance: 2,
  roadmap: 2,
  events: 2,
  nodes: 3,
  budget: 3,
  advisor: 3,
  leaderboard: 3,
  journal: 2,
  decisions: 2,
  agents: 3,
};

export default function Home() {
  const { user, teamMemberId, loading, signOut, needsProfileSetup, claimTeamMember, isDemo, demoLogin } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [viewTransition, setViewTransition] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | 'none'>('none');
  const [contentReady, setContentReady] = useState(false);
  const [claimingProfile, setClaimingProfile] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [viewHistory, setViewHistory] = useState<ViewType[]>(['dashboard']);
  const mainRef = useRef<HTMLElement>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevViewRef = useRef<ViewType>('dashboard');
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Content reveal after initial mount
  useEffect(() => {
    const t = setTimeout(() => setContentReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  // ─── Idle state detection (60s of inactivity) ───
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsIdle(true), 60000);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach(evt => window.addEventListener(evt, resetIdleTimer, { passive: true }));
    resetIdleTimer(); // start the timer
    return () => {
      events.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // ─── Scroll parallax for background orbs ───
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // ─── Track view history for breadcrumbs ───
  useEffect(() => {
    setViewHistory(prev => {
      if (prev[prev.length - 1] === currentView) return prev;
      // Keep last 5 entries max
      const next = [...prev, currentView];
      return next.length > 5 ? next.slice(-5) : next;
    });
  }, [currentView]);

  // ─── ALL hooks must be above early returns (Rules of Hooks) ───
  const handleNavigate = useCallback((view: string) => {
    if (!viewTypes.includes(view as ViewType)) {
      console.warn(`Invalid view: "${view}"`);
      return;
    }
    if (view === currentView) return;

    // Clear any pending transition timeouts to prevent race conditions on rapid clicks
    if (transitionRef.current) clearTimeout(transitionRef.current);
    if (fadeRef.current) clearTimeout(fadeRef.current);

    // Determine slide direction based on view depth
    const currentDepth = viewDepthMap[currentView] ?? 0;
    const nextDepth = viewDepthMap[view as ViewType] ?? 0;
    const direction = nextDepth > currentDepth ? 'left' : nextDepth < currentDepth ? 'right' : 'none';
    setTransitionDirection(direction);

    // Trigger exit transition
    setViewTransition(true);
    prevViewRef.current = currentView;
    transitionRef.current = setTimeout(() => {
      setCurrentView(view as ViewType);
      setCommandPaletteOpen(false);
      // Scroll to top
      if (mainRef.current) mainRef.current.scrollTop = 0;
      // End transition (begin enter animation)
      fadeRef.current = setTimeout(() => setViewTransition(false), 20);
    }, 200);
  }, [currentView]);

  // ─── Early returns (after all hooks) ───
  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen onLogin={() => {}} />;
  }

  // Profile setup -- Clerk user exists but hasn't linked to a team member yet
  if (needsProfileSetup && !isDemo) {
    return <ProfileSetupScreen onClaim={claimTeamMember} claiming={claimingProfile} setClaiming={setClaimingProfile} onSignOut={signOut} />;
  }

  const handleViewChange = (view: ViewType) => {
    handleNavigate(view);
  };

  // ─── View label map for breadcrumbs ───
  const viewLabelMap: Record<ViewType, string> = {
    dashboard: 'Dashboard',
    team: 'Team',
    chat: 'Chat',
    okrs: 'OKRs & KPIs',
    tasks: 'Tasks',
    governance: 'Governance',
    roadmap: 'Roadmap',
    events: 'Events',
    nodes: 'Nodes',
    budget: 'Budget',
    advisor: 'AI Advisor',
    leaderboard: 'Leaderboard',
    journal: 'Journal',
    decisions: 'Decisions',
    agents: '33 Agents',
  };

  // Build breadcrumb path from view hierarchy
  const getBreadcrumbPath = (): { view: ViewType; label: string }[] => {
    const crumbs: { view: ViewType; label: string }[] = [];
    const depth = viewDepthMap[currentView] ?? 0;
    if (depth > 0) {
      crumbs.push({ view: 'dashboard', label: 'Dashboard' });
    }
    // Add intermediate if depth > 1 and we have history
    if (depth > 1) {
      const intermediate = viewHistory.find(v => v !== 'dashboard' && v !== currentView && (viewDepthMap[v] ?? 0) < depth);
      if (intermediate) {
        crumbs.push({ view: intermediate, label: viewLabelMap[intermediate] });
      }
    }
    crumbs.push({ view: currentView, label: viewLabelMap[currentView] });
    return crumbs;
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onNavigate={handleNavigate} />;
      case 'team': return <TeamView onNavigate={handleNavigate} />;
      case 'chat': return <ChatView />;
      case 'okrs': return <OKRView />;
      case 'tasks': return <TasksView />;
      case 'governance': return <GovernanceView />;
      case 'roadmap': return <RoadmapView />;
      case 'events': return <EventsView />;
      case 'nodes': return <NodesView />;
      case 'budget': return <BudgetView />;
      case 'advisor': return <AdvisorView />;
      case 'leaderboard': return <LeaderboardView />;
      case 'journal': return <JournalView />;
      case 'decisions': return <DecisionLogView />;
      case 'agents': return <StewardAgentsView />;
      default: return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  // Compute transition classes (enhanced with crossfade blur)
  const getViewTransitionStyle = (): React.CSSProperties => {
    if (viewTransition) {
      // Exit phase — crossfade out with subtle blur
      return {
        opacity: 0,
        filter: 'blur(2px)',
        transform: transitionDirection === 'left'
          ? 'translateX(-8px) translateY(2px)'
          : transitionDirection === 'right'
          ? 'translateX(8px) translateY(2px)'
          : 'translateY(4px)',
        transition: 'opacity 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19), transform 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19), filter 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      };
    }
    // Enter phase — crossfade in, clear blur
    return {
      opacity: 1,
      filter: 'blur(0px)',
      transform: 'translateX(0) translateY(0)',
      transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  const sidebarWidth = sidebarCollapsed ? 72 : 260;
  const breadcrumbs = getBreadcrumbPath();

  // Parallax offsets for ambient orbs
  const parallaxY1 = scrollY * 0.04;
  const parallaxY2 = scrollY * -0.03;
  const parallaxY3 = scrollY * 0.02;

  return (
    <DataProvider>
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--fu-bg-primary, #0b0d14)' }}>
      <style>{globalStyles}</style>
      <style>{`
        @media (min-width: 768px) {
          main.fu-main {
            margin-left: ${sidebarWidth}px !important;
            transition: margin-left 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        }
      `}</style>

      {/* ─── Notification Toast Area (top-right placeholder) ─── */}
      <div className="fu-toast-area" role="status" aria-live="polite" aria-label="Notifications">
        {/* Toasts will be injected here by a toast provider. Styled placeholder: */}
        {/* <div className="fu-toast">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6b8f71', flexShrink: 0 }} />
          <span>Notification message</span>
        </div> */}
      </div>

      {/* ─── Idle Screensaver Overlay ─── */}
      <div className={`fu-idle-overlay ${isIdle ? 'active' : ''}`}>
        <div style={{
          position: 'absolute',
          top: '30%', left: '25%',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 165, 116, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'idleBreath1 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '55%', left: '65%',
          width: 350, height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'idleBreath2 10s ease-in-out infinite 2s',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 600, height: 600,
          borderRadius: '50%',
          border: '1px solid rgba(212, 165, 116, 0.03)',
          animation: 'idleDrift 60s linear infinite',
        }} />
      </div>

      <div className="hidden md:block">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={teamMemberId}
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onSignOut={signOut}
          onSwitchProfile={demoLogin}
        />
      </div>

      {/* Animated gradient border between sidebar and content */}
      <div
        className="hidden md:block"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: sidebarWidth,
          width: '1px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(212, 165, 116, 0.12) 15%, rgba(212, 165, 116, 0.2) 50%, rgba(212, 165, 116, 0.12) 85%, transparent 100%)',
          zIndex: 30,
          transition: 'left 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '-3px',
            width: '7px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(212, 165, 116, 0.04) 25%, rgba(212, 165, 116, 0.06) 50%, rgba(212, 165, 116, 0.04) 75%, transparent 100%)',
            animation: 'borderGlow 5s ease-in-out infinite',
          }}
        />
      </div>

      <main
        ref={mainRef}
        className="fu-main flex-1 overflow-y-auto fu-smooth-scroll"
        style={{
          marginLeft: 0,
          position: 'relative',
          transition: 'margin-left 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Layered ambient background with parallax + noise texture */}
        <div
          className="noise-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 50% 40% at 30% 20%, rgba(212, 165, 116, 0.02), transparent 60%),
              radial-gradient(ellipse 40% 35% at 70% 60%, rgba(139, 92, 246, 0.015), transparent 60%),
              radial-gradient(ellipse 60% 50% at 50% 30%, rgba(212, 165, 116, 0.025), transparent 70%)
            `,
          }} />
          {/* Parallax ambient orbs */}
          <div style={{
            position: 'absolute', top: '15%', left: '20%', width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 165, 116, 0.04) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'orbFloat1 20s ease-in-out infinite',
            transform: `translateY(${parallaxY1}px)`,
            willChange: 'transform',
          }} />
          <div style={{
            position: 'absolute', top: '50%', right: '15%', width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)',
            filter: 'blur(45px)',
            animation: 'orbFloat2 24s ease-in-out infinite',
            transform: `translateY(${parallaxY2}px)`,
            willChange: 'transform',
          }} />
          <div style={{
            position: 'absolute', bottom: '20%', left: '50%', width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(107, 143, 113, 0.025) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'orbFloat1 28s ease-in-out infinite 5s',
            transform: `translateY(${parallaxY3}px)`,
            willChange: 'transform',
          }} />
        </div>

        {/* ─── Ambient Particle System (CSS-only, 5 dots) ─── */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div className="fu-particle fu-particle-1" />
          <div className="fu-particle fu-particle-2" />
          <div className="fu-particle fu-particle-3" />
          <div className="fu-particle fu-particle-4" />
          <div className="fu-particle fu-particle-5" />
        </div>

        {/* Top scroll fade indicator */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'linear-gradient(180deg, #0b0d14 0%, rgba(11,13,20,0.8) 40%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 10,
            marginBottom: '-40px',
          }}
        />

        <div
          className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto"
          style={{
            position: 'relative',
            zIndex: 1,
            ...getViewTransitionStyle(),
            ...(contentReady ? {} : { animation: 'contentReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0 }),
          }}
        >
          {/* ─── Breadcrumb Trail ─── */}
          {breadcrumbs.length > 1 && (
            <nav className="fu-breadcrumb" aria-label="Breadcrumb" style={{ paddingTop: 4 }}>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <span key={crumb.view + i} className="fu-breadcrumb-item" style={{ display: 'contents' }}>
                    {i > 0 && <span className="fu-breadcrumb-sep" aria-hidden="true">/</span>}
                    {isLast ? (
                      <span className="fu-breadcrumb-item current" aria-current="page">{crumb.label}</span>
                    ) : (
                      <span
                        className="fu-breadcrumb-item clickable"
                        role="link"
                        tabIndex={0}
                        onClick={() => handleNavigate(crumb.view)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleNavigate(crumb.view); }}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </span>
                );
              })}
              {/* Keyboard shortcut badge */}
              <span style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(212, 165, 116, 0.06)',
                border: '1px solid rgba(212, 165, 116, 0.08)',
                fontSize: 10,
                color: 'rgba(160, 152, 136, 0.5)',
                fontWeight: 500,
                letterSpacing: '0.3px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
              }}
              onClick={() => setCommandPaletteOpen(true)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.2)'; e.currentTarget.style.color = 'rgba(212, 165, 116, 0.6)'; e.currentTarget.style.background = 'rgba(212, 165, 116, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.08)'; e.currentTarget.style.color = 'rgba(160, 152, 136, 0.5)'; e.currentTarget.style.background = 'rgba(212, 165, 116, 0.06)'; }}
              title="Open command palette"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setCommandPaletteOpen(true); }}
              >
                <span style={{ fontSize: 11 }}>&#8984;</span>K
              </span>
            </nav>
          )}

          {/* When on dashboard (no breadcrumb), show just the shortcut badge */}
          {breadcrumbs.length <= 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 8, paddingTop: 4 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(212, 165, 116, 0.06)',
                border: '1px solid rgba(212, 165, 116, 0.08)',
                fontSize: 10,
                color: 'rgba(160, 152, 136, 0.5)',
                fontWeight: 500,
                letterSpacing: '0.3px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
              }}
              onClick={() => setCommandPaletteOpen(true)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.2)'; e.currentTarget.style.color = 'rgba(212, 165, 116, 0.6)'; e.currentTarget.style.background = 'rgba(212, 165, 116, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.08)'; e.currentTarget.style.color = 'rgba(160, 152, 136, 0.5)'; e.currentTarget.style.background = 'rgba(212, 165, 116, 0.06)'; }}
              title="Open command palette"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setCommandPaletteOpen(true); }}
              >
                <span style={{ fontSize: 11 }}>&#8984;</span>K
              </span>
            </div>
          )}

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
