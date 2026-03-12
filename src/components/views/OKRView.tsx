'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Target, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle,
  XCircle, BarChart3, ChevronDown, Flame, MessageSquarePlus, X, Check,
  Clock, ChevronRight, Shield,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import type { OKR, KPI } from '@/lib/data';
import { InlineAdvisor } from '@/components/InlineAdvisor';

// ─── CSS Keyframes (injected once) ───

const STYLE_ID = 'okr-view-animations';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes okr-pulse-risk {
      0%, 100% { box-shadow: 0 0 0 0 rgba(212,165,116,0.4); }
      50% { box-shadow: 0 0 0 6px rgba(212,165,116,0); }
    }
    @keyframes okr-pulse-behind {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
      50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
    }
    @keyframes okr-card-enter {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes okr-ring-fill {
      from { stroke-dasharray: 0 138.23; }
    }
    @keyframes okr-bar-grow {
      from { width: 0%; }
    }
    @keyframes okr-summary-enter {
      from { opacity: 0; transform: translateY(-12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes okr-progressFill {
      from { width: 0%; }
    }
    @keyframes okr-progressShimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes okr-countUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes okr-celebrateGlow {
      0%, 100% { box-shadow: 0 0 8px rgba(107,143,113,0.3); }
      50% { box-shadow: 0 0 20px rgba(107,143,113,0.6); }
    }
    @keyframes okr-checkmark-pop {
      0% { transform: scale(0) rotate(-45deg); opacity: 0; }
      50% { transform: scale(1.2) rotate(0deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes okr-kr-reveal {
      from { opacity: 0; transform: translateY(12px); max-height: 0; }
      to { opacity: 1; transform: translateY(0); max-height: 300px; }
    }
    @keyframes okr-glow-green {
      0%, 100% { box-shadow: 0 0 12px rgba(107,143,113,0.15), inset 0 1px 0 rgba(107,143,113,0.1); }
      50% { box-shadow: 0 0 24px rgba(107,143,113,0.3), inset 0 1px 0 rgba(107,143,113,0.2); }
    }
    @keyframes okr-glow-gold {
      0%, 100% { box-shadow: 0 0 12px rgba(212,165,116,0.15), inset 0 1px 0 rgba(212,165,116,0.1); }
      50% { box-shadow: 0 0 24px rgba(212,165,116,0.3), inset 0 1px 0 rgba(212,165,116,0.2); }
    }
    @keyframes okr-glow-red {
      0%, 100% { box-shadow: 0 0 12px rgba(239,68,68,0.1), inset 0 1px 0 rgba(239,68,68,0.08); }
      50% { box-shadow: 0 0 24px rgba(239,68,68,0.2), inset 0 1px 0 rgba(239,68,68,0.15); }
    }
    @keyframes okr-stat-enter {
      from { opacity: 0; transform: translateY(16px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes okr-kpi-trend-up {
      0%, 100% { filter: drop-shadow(0 0 3px rgba(107,143,113,0.4)); }
      50% { filter: drop-shadow(0 0 8px rgba(107,143,113,0.7)); }
    }
    @keyframes okr-kpi-trend-down {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }
    @keyframes okr-milestone-pop {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes okr-ring-glow-pulse {
      0%, 100% { filter: drop-shadow(0 0 4px var(--ring-color)); }
      50% { filter: drop-shadow(0 0 10px var(--ring-color)); }
    }
    @keyframes okr-ring-draw {
      from { stroke-dashoffset: var(--ring-circumference); }
    }
    @keyframes okr-sparkline-draw {
      from { stroke-dashoffset: var(--sparkline-len); }
      to { stroke-dashoffset: 0; }
    }
    @keyframes okr-sparkline-dot-pop {
      from { r: 0; opacity: 0; }
      to { r: 2.5; opacity: 1; }
    }
    @keyframes okr-separator-glow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes okr-expand {
      from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
      to { opacity: 1; max-height: 800px; padding-top: 10px; padding-bottom: 0; }
    }
    @keyframes okr-status-morph {
      0% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.08); filter: brightness(1.3); }
      100% { transform: scale(1); filter: brightness(1); }
    }
    @keyframes okr-confidence-badge-enter {
      from { opacity: 0; transform: scale(0.8) translateY(2px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes okr-timestamp-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .okr-card-animated {
      animation: okr-card-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .okr-summary-bar {
      animation: okr-summary-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .okr-pulse-at-risk {
      animation: okr-pulse-risk 2s ease-in-out infinite;
    }
    .okr-pulse-behind {
      animation: okr-pulse-behind 1.6s ease-in-out infinite;
    }
    .okr-progress-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) scale(0.9);
      opacity: 0;
      background: rgba(19,23,32,0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      padding: 8px 12px;
      pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
      white-space: nowrap;
      z-index: 30;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }
    .okr-bar-wrapper:hover .okr-progress-tooltip {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
    .okr-card-glass {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .okr-card-glass:hover {
      transform: translateY(-3px);
    }
    .okr-card-glass.status-on-track {
      border-left: 4px solid rgba(107,143,113,0.7) !important;
    }
    .okr-card-glass.status-on-track:hover {
      border-color: rgba(107,143,113,0.4) !important;
      border-left-color: rgba(107,143,113,0.9) !important;
      box-shadow: 0 8px 32px rgba(107,143,113,0.12), 0 0 0 1px rgba(107,143,113,0.1);
    }
    .okr-card-glass.status-at-risk {
      border-left: 4px solid rgba(251,191,36,0.7) !important;
    }
    .okr-card-glass.status-at-risk:hover {
      border-color: rgba(251,191,36,0.4) !important;
      border-left-color: rgba(251,191,36,0.9) !important;
      box-shadow: 0 8px 32px rgba(251,191,36,0.12), 0 0 0 1px rgba(251,191,36,0.1);
    }
    .okr-card-glass.status-behind {
      border-left: 4px solid rgba(248,113,113,0.7) !important;
    }
    .okr-card-glass.status-behind:hover {
      border-color: rgba(248,113,113,0.3) !important;
      border-left-color: rgba(248,113,113,0.9) !important;
      box-shadow: 0 8px 32px rgba(239,68,68,0.1), 0 0 0 1px rgba(239,68,68,0.08);
    }
    .okr-kr-item {
      animation: okr-kr-reveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
      position: relative;
    }
    .okr-kr-container {
      position: relative;
      padding-left: 20px;
    }
    .okr-kr-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 8px;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.08) 100%);
      border-radius: 1px;
    }
    .okr-kr-item-connected {
      position: relative;
    }
    .okr-kr-item-connected::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -12px;
      width: 12px;
      height: 2px;
      background: linear-gradient(90deg, rgba(139,92,246,0.3), rgba(139,92,246,0.1));
    }
    .okr-kr-item-connected::after {
      content: '';
      position: absolute;
      top: 50%;
      left: -14px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(139,92,246,0.4);
      transform: translateY(-50%);
      box-shadow: 0 0 6px rgba(139,92,246,0.3);
    }
    .okr-status-badge-glow {
      position: relative;
      overflow: visible;
    }
    .okr-status-badge-glow.glow-green {
      box-shadow: 0 0 8px rgba(74,222,128,0.2), inset 0 1px 0 rgba(74,222,128,0.15);
    }
    .okr-status-badge-glow.glow-green:hover {
      box-shadow: 0 0 14px rgba(74,222,128,0.35), inset 0 1px 0 rgba(74,222,128,0.2);
    }
    .okr-status-badge-glow.glow-amber {
      box-shadow: 0 0 8px rgba(251,191,36,0.2), inset 0 1px 0 rgba(251,191,36,0.15);
    }
    .okr-status-badge-glow.glow-amber:hover {
      box-shadow: 0 0 14px rgba(251,191,36,0.35), inset 0 1px 0 rgba(251,191,36,0.2);
    }
    .okr-status-badge-glow.glow-red {
      box-shadow: 0 0 8px rgba(248,113,113,0.2), inset 0 1px 0 rgba(248,113,113,0.15);
    }
    .okr-status-badge-glow.glow-red:hover {
      box-shadow: 0 0 14px rgba(248,113,113,0.35), inset 0 1px 0 rgba(248,113,113,0.2);
    }
    @keyframes okr-health-banner-enter {
      from { opacity: 0; transform: translateY(-16px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .okr-health-banner {
      animation: okr-health-banner-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .okr-shimmer-bar {
      position: relative;
      overflow: hidden;
    }
    .okr-shimmer-bar::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,255,255,0.08) 30%,
        rgba(255,255,255,0.18) 50%,
        rgba(255,255,255,0.08) 70%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: okr-progressShimmer 2s ease-in-out infinite;
      border-radius: inherit;
    }
    .okr-celebrate-bar {
      animation: okr-celebrateGlow 2s ease-in-out infinite;
      border-radius: 4px;
    }
    .okr-stat-card {
      animation: okr-stat-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
      transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    }
    .okr-stat-card:hover {
      transform: translateY(-2px);
      border-color: #2e3a4e !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .okr-kpi-card {
      transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .okr-kpi-card:hover {
      transform: translateY(-2px);
      border-color: #2e3a4e !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .okr-trend-up {
      animation: okr-kpi-trend-up 2s ease-in-out infinite;
    }
    .okr-trend-down {
      animation: okr-kpi-trend-down 1.5s ease-in-out infinite;
    }
    .okr-filter-pill {
      position: relative;
      transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    }
    .okr-filter-pill:hover {
      background-color: rgba(212,165,116,0.06) !important;
    }
    .okr-checkmark-anim {
      animation: okr-checkmark-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .okr-milestone-marker {
      animation: okr-milestone-pop 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .okr-status-morph-anim {
      animation: okr-status-morph 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .okr-confidence-badge {
      animation: okr-confidence-badge-enter 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .okr-kr-collapse-wrapper {
      overflow: hidden;
      transition: max-height 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease, padding-top 0.35s ease;
    }
    .okr-kr-collapse-wrapper.collapsed {
      max-height: 0 !important;
      opacity: 0;
      padding-top: 0 !important;
    }
    .okr-kr-collapse-wrapper.expanded {
      opacity: 1;
    }
    .okr-expand-toggle {
      transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .okr-expand-toggle.rotated {
      transform: rotate(90deg);
    }
    .okr-timestamp-tooltip {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%) scale(0.9);
      opacity: 0;
      background: rgba(11,13,20,0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px;
      padding: 5px 10px;
      pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
      white-space: nowrap;
      z-index: 30;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      font-size: 10px;
      color: #a09888;
    }
    .okr-timestamp-wrap:hover .okr-timestamp-tooltip {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
    .okr-objective-separator {
      position: relative;
      height: 1px;
      margin: 8px 0;
    }
    .okr-objective-separator::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(139,92,246,0.15) 20%, rgba(212,165,116,0.2) 50%, rgba(139,92,246,0.15) 80%, transparent);
    }
    .okr-objective-separator::after {
      content: '';
      position: absolute;
      top: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 3px;
      border-radius: 2px;
      background: linear-gradient(90deg, #8b5cf6, #d4a574);
      opacity: 0.35;
    }
  `;
  document.head.appendChild(style);
}

// ─── Local-only edits (confidence & notes -- not in DataProvider) ───

interface LocalEdits {
  notes: Record<string, Record<number, string>>;
  confidence: Record<string, number>;
}

function emptyLocalEdits(): LocalEdits {
  return { notes: {}, confidence: {} };
}

// ─── Helpers ───

function trendIcon(trend: KPI['trend']) {
  const map = {
    up: { Icon: TrendingUp, color: '#6b8f71', className: 'okr-trend-up' },
    down: { Icon: TrendingDown, color: '#ef4444', className: 'okr-trend-down' },
    flat: { Icon: Minus, color: '#6b6358', className: '' },
  };
  return map[trend];
}

const statusCycle: OKR['status'][] = ['on-track', 'at-risk', 'behind'];

function statusBadge(status: OKR['status']): { bg: string; text: string; label: string; Icon: React.ElementType; glowClass: string; borderColor: string } {
  const map = {
    'on-track': { bg: 'rgba(74,222,128,0.12)', text: '#4ade80', label: 'On Track', Icon: CheckCircle2, glowClass: 'glow-green', borderColor: '#4ade80' },
    'at-risk': { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', label: 'At Risk', Icon: AlertTriangle, glowClass: 'glow-amber', borderColor: '#fbbf24' },
    'behind': { bg: 'rgba(248,113,113,0.12)', text: '#f87171', label: 'Behind', Icon: XCircle, glowClass: 'glow-red', borderColor: '#f87171' },
  };
  return map[status];
}

const categoryColors: Record<string, string> = {
  Membership: '#8b5cf6', Financial: '#d4a574', Operations: '#60a5fa', Community: '#6b8f71', Impact: '#f472b6',
};

function progressGradient(progress: number): string {
  if (progress >= 60) return 'linear-gradient(90deg, #4a7a52, #6b8f71, #8bb896)';
  if (progress >= 30) return 'linear-gradient(90deg, #b8864a, #d4a574, #e8c89a)';
  return 'linear-gradient(90deg, #c43030, #ef4444, #f87171)';
}

function progressColor(progress: number): string {
  if (progress >= 60) return '#6b8f71';
  if (progress >= 30) return '#d4a574';
  return '#ef4444';
}

// ─── Relative Timestamp Helper ───

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatExactDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Generate a deterministic "last updated" date per OKR for demo purposes
function getOkrLastUpdated(okrId: string): Date {
  let hash = 0;
  for (let i = 0; i < okrId.length; i++) {
    hash = ((hash << 5) - hash) + okrId.charCodeAt(i);
    hash |= 0;
  }
  const now = new Date();
  const hoursAgo = Math.abs(hash % 168); // within last week
  return new Date(now.getTime() - hoursAgo * 3600000);
}

// ─── Sparkline Data Generator ───
// Generates deterministic 4-week trend data from the current progress
function generateSparklineData(progress: number, okrId: string): number[] {
  let hash = 0;
  for (let i = 0; i < okrId.length; i++) {
    hash = ((hash << 5) - hash) + okrId.charCodeAt(i);
    hash |= 0;
  }
  const points: number[] = [];
  const seed = Math.abs(hash);
  // Work backwards from current progress
  for (let w = 0; w < 4; w++) {
    const variance = ((seed >> (w * 4)) & 0xF) - 7; // -7 to +8
    const weekProgress = Math.max(0, Math.min(100, progress - (3 - w) * 8 + variance));
    points.push(Math.round(weekProgress));
  }
  // Ensure last point matches actual progress
  points[3] = progress;
  return points;
}

// ─── Confidence Level Label ───

function confidenceLabel(value: number): { text: string; color: string; bg: string } {
  if (value >= 5) return { text: 'Very High', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' };
  if (value >= 4) return { text: 'High', color: '#6b8f71', bg: 'rgba(107,143,113,0.1)' };
  if (value >= 3) return { text: 'Medium', color: '#d4a574', bg: 'rgba(212,165,116,0.1)' };
  if (value >= 2) return { text: 'Low', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' };
  if (value >= 1) return { text: 'Very Low', color: '#f87171', bg: 'rgba(248,113,113,0.1)' };
  return { text: 'Not Set', color: '#6b6358', bg: 'rgba(107,99,88,0.08)' };
}

// ─── Animated Counter Hook ───

function useCountUp(target: number, duration: number = 1000, delay: number = 0): number {
  const [value, setValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

// ─── Animated Progress Ring (enhanced with draw-on-mount) ───

function AnimatedProgressRing({
  progress,
  size = 64,
  strokeWidth = 5,
  color,
  delay = 0,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  delay?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setAnimatedProgress(progress);
    }, delay);
    return () => clearTimeout(timer);
  }, [progress, delay]);

  const dashOffset = circumference - (animatedProgress / 100) * circumference;
  const displayValue = useCountUp(progress, 1000, delay);

  // Tick marks around the ring for visual detail
  const tickCount = 12;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 360 - 90;
    const rad = angle * (Math.PI / 180);
    const outerR = radius + strokeWidth / 2 + 2;
    const innerR = radius + strokeWidth / 2;
    return {
      x1: size / 2 + innerR * Math.cos(rad),
      y1: size / 2 + innerR * Math.sin(rad),
      x2: size / 2 + outerR * Math.cos(rad),
      y2: size / 2 + outerR * Math.sin(rad),
    };
  });

  return (
    <div style={{
      position: 'relative', width: size, height: size, flexShrink: 0,
      ['--ring-color' as string]: color,
      ['--ring-circumference' as string]: `${circumference}`,
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`ring-grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id={`ring-glow-${color.replace('#', '')}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={i < (animatedProgress / 100) * tickCount ? `${color}40` : '#1e263820'}
            strokeWidth={0.5}
            style={{ transition: 'stroke 0.8s ease' }}
          />
        ))}

        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1e2638" strokeWidth={strokeWidth}
        />

        {/* Progress arc with draw-on-mount */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#ring-grad-${color.replace('#', '')})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? dashOffset : circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter={`url(#ring-glow-${color.replace('#', '')})`}
          style={{
            transition: mounted
              ? 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
          }}
        />

        {/* Glow dot at the end of the arc */}
        {animatedProgress > 3 && (
          <circle
            cx={size / 2 + radius * Math.cos(((animatedProgress / 100) * 360 - 90) * Math.PI / 180)}
            cy={size / 2 + radius * Math.sin(((animatedProgress / 100) * 360 - 90) * Math.PI / 180)}
            r={strokeWidth / 2 + 1}
            fill={color}
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
              transition: 'cx 1.2s cubic-bezier(0.22, 1, 0.36, 1), cy 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        )}
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size > 56 ? 15 : 13, fontWeight: 700, color,
        letterSpacing: '-0.02em',
      }}>
        {displayValue}%
      </span>
    </div>
  );
}

// ─── Mini Sparkline (4-week health trend) ───

function MiniSparkline({
  data,
  color,
  width = 56,
  height = 24,
  delay = 0,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data, 1);
  const range = max - min || 1;
  const padY = 3;

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * (width - 4) + 2,
    y: height - padY - ((val - min) / range) * (height - padY * 2),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Approximate path length
  let pathLen = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    pathLen += Math.sqrt(dx * dx + dy * dy);
  }

  // Trend direction
  const trending = data[data.length - 1] > data[0] ? 'up' : data[data.length - 1] < data[0] ? 'down' : 'flat';
  const lineColor = trending === 'up' ? '#6b8f71' : trending === 'down' ? '#ef4444' : color;

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
      title={`4-week trend: ${data.map(d => d + '%').join(' -> ')}`}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fill area under sparkline */}
        {visible && (
          <path
            d={`${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`}
            fill={`url(#spark-fill-${color.replace('#', '')})`}
            style={{ opacity: 0, animation: 'okr-timestamp-fade 0.6s ease forwards', animationDelay: `${delay + 400}ms` }}
          />
        )}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            ['--sparkline-len' as string]: `${pathLen}`,
            strokeDasharray: visible ? 'none' : `${pathLen}`,
            strokeDashoffset: visible ? 0 : pathLen,
            transition: visible ? `stroke-dashoffset 0.8s ease ${delay}ms` : 'none',
            filter: `drop-shadow(0 0 2px ${lineColor}50)`,
          }}
        />

        {/* Data points */}
        {visible && points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 2.5 : 1.5}
            fill={i === points.length - 1 ? lineColor : `${lineColor}80`}
            style={{
              opacity: 0,
              animation: `okr-timestamp-fade 0.3s ease forwards`,
              animationDelay: `${delay + 600 + i * 100}ms`,
              filter: i === points.length - 1 ? `drop-shadow(0 0 3px ${lineColor})` : 'none',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Milestone Progress Bar (enhanced shimmer) ───

function AnimatedProgressBar({
  progress,
  gradient,
  barColor,
  delay = 0,
  thin = false,
}: {
  progress: number;
  gradient: string;
  barColor: string;
  delay?: number;
  thin?: boolean;
}) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const height = thin ? 6 : 8;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(progress), delay + 100);
    return () => clearTimeout(timer);
  }, [progress, delay]);

  const milestones = [25, 50, 75, 100];
  const isCelebrating = progress >= 100;

  return (
    <div
      style={{
        flex: 1,
        height,
        backgroundColor: '#1e2638',
        borderRadius: height / 2,
        overflow: 'visible',
        position: 'relative',
      }}
    >
      {/* Milestone markers with labels */}
      {milestones.map((ms, i) => {
        const reached = animatedWidth >= ms;
        return (
          <div
            key={ms}
            className="okr-milestone-marker"
            style={{
              position: 'absolute',
              left: `${ms}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: reached ? 3 : 2,
              height: height + (thin ? 6 : 8),
              backgroundColor: reached ? `${barColor}80` : '#2e3a4e',
              borderRadius: 1.5,
              zIndex: 2,
              transition: 'background-color 0.4s ease, width 0.3s ease, height 0.3s ease',
              animationDelay: `${delay + 300 + i * 100}ms`,
            }}
          >
            {/* Milestone percentage label visible on hover */}
            {ms < 100 && (
              <span style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 8,
                fontWeight: 600,
                color: reached ? `${barColor}90` : '#2e3a4e',
                whiteSpace: 'nowrap',
                paddingBottom: 2,
                transition: 'color 0.4s ease',
                letterSpacing: '-0.02em',
              }}>
                {ms}
              </span>
            )}
          </div>
        );
      })}

      {/* Fill bar container */}
      <div
        className={isCelebrating ? 'okr-celebrate-bar' : ''}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        {/* Animated fill */}
        <div
          className="okr-shimmer-bar progress-bar-animated"
          style={{
            height: '100%',
            width: `${animatedWidth}%`,
            borderRadius: height / 2,
            background: gradient,
            transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)',
            boxShadow: `0 0 ${isCelebrating ? 14 : 8}px ${barColor}40`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Count-Up Stat Display ───

function CountUpStat({ value, suffix = '', color, delay = 0 }: { value: number; suffix?: string; color: string; delay?: number }) {
  const displayVal = useCountUp(value, 800, delay);
  return (
    <span style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.02em' }}>
      {displayVal}{suffix}
    </span>
  );
}

// ─── Count-Up Percentage (for use inside .map()) ───

function CountUpPercent({ value, color, delay, onClick, title }: {
  value: number; color: string; delay: number;
  onClick: () => void; title: string;
}) {
  const displayVal = useCountUp(value, 900, delay);
  return (
    <span
      onClick={onClick}
      title={title}
      style={{
        fontSize: 12, fontWeight: 700, color, minWidth: 36,
        textAlign: 'right', cursor: 'pointer',
        transition: 'opacity 0.15s, color 0.3s ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '0.7'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '1'; }}
    >
      {displayVal}%
    </span>
  );
}

// ─── Relative Timestamp Display ───

function RelativeTimestamp({ date }: { date: Date }) {
  return (
    <div
      className="okr-timestamp-wrap"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        animation: 'okr-timestamp-fade 0.5s ease both',
      }}
    >
      <Clock size={10} style={{ color: '#6b635860' }} />
      <span style={{
        fontSize: 10,
        color: '#6b6358',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}>
        {getRelativeTime(date)}
      </span>
      <div className="okr-timestamp-tooltip">
        {formatExactDate(date)}
      </div>
    </div>
  );
}

// ─── Confidence Badge (compact display) ───

function ConfidenceBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const label = confidenceLabel(value);
  return (
    <span
      className="okr-confidence-badge"
      title={`Team confidence: ${label.text} (${value}/5)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        color: label.color,
        backgroundColor: label.bg,
        padding: '2px 8px',
        borderRadius: 10,
        border: `1px solid ${label.color}20`,
        lineHeight: 1.3,
        letterSpacing: '0.02em',
      }}
    >
      <Shield size={9} />
      {label.text}
    </span>
  );
}

// ─── Sub-components ───

function ConfidenceFlames({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hover || value);
        return (
          <button
            key={n}
            onClick={(e) => { e.stopPropagation(); onChange(n); }}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: 'none', border: 'none', padding: 1, cursor: 'pointer',
              display: 'flex', alignItems: 'center', transition: 'transform 0.15s',
              transform: hover === n ? 'scale(1.2)' : 'scale(1)',
            }}
            title={`Confidence: ${n}/5`}
          >
            <Flame size={16} style={{
              color: active ? '#d4a574' : '#2e3a4e',
              fill: active ? 'rgba(212,165,116,0.5)' : 'none',
              transition: 'color 0.15s, fill 0.15s',
            }} />
          </button>
        );
      })}
      {value > 0 && (
        <span style={{ fontSize: 10, color: '#6b6358', marginLeft: 4, fontWeight: 600 }}>{value}/5</span>
      )}
    </div>
  );
}

function InlineProgressEditor({ current, onSave, onCancel }: { current: number; onSave: (v: number) => void; onCancel: () => void }) {
  const [val, setVal] = useState(String(current));
  const inputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  const commit = () => onSave(Math.max(0, Math.min(100, parseInt(val, 10) || 0)));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef} type="number" min={0} max={100} value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onCancel(); }}
        onBlur={commit}
        style={{
          width: 48, padding: '2px 6px', backgroundColor: '#0b0d14', border: '1px solid #d4a574',
          borderRadius: 4, color: '#f0ebe4', fontSize: 12, fontWeight: 700, textAlign: 'center',
          fontFamily: 'inherit', outline: 'none',
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, color: '#6b6358' }}>%</span>
      <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
        <Check size={14} style={{ color: '#6b8f71' }} />
      </button>
      <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
        <X size={14} style={{ color: '#ef4444' }} />
      </button>
    </div>
  );
}

function NoteEditor({ initial, onSave, onClose }: { initial: string; onSave: (text: string) => void; onClose: () => void }) {
  const [text, setText] = useState(initial);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div
      style={{ marginTop: 8, padding: '8px 10px', backgroundColor: 'rgba(212,165,116,0.05)', border: '1px solid rgba(212,165,116,0.15)', borderRadius: 8 }}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={ref} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Add a note or update..." rows={2}
        style={{
          width: '100%', backgroundColor: 'transparent', border: 'none', color: '#a09888',
          fontSize: 12, fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.5,
        }}
      />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
        <button onClick={onClose} style={{
          padding: '4px 10px', fontSize: 11, fontWeight: 600, backgroundColor: 'transparent',
          border: '1px solid #1e2638', borderRadius: 6, color: '#6b6358', cursor: 'pointer', fontFamily: 'inherit',
        }}>Cancel</button>
        <button onClick={() => { onSave(text); onClose(); }} style={{
          padding: '4px 10px', fontSize: 11, fontWeight: 600, backgroundColor: 'rgba(212,165,116,0.15)',
          border: '1px solid rgba(212,165,116,0.25)', borderRadius: 6, color: '#d4a574', cursor: 'pointer', fontFamily: 'inherit',
        }}>Save</button>
      </div>
    </div>
  );
}

function QuarterComparisonChart({ okrData }: { okrData: OKR[] }) {
  const quarterData = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    okrData.forEach((okr) => {
      if (!map[okr.quarter]) map[okr.quarter] = { total: 0, count: 0 };
      const avg = okr.keyResults.length > 0 ? okr.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / okr.keyResults.length : 0;
      map[okr.quarter].total += avg;
      map[okr.quarter].count += 1;
    });
    return Object.entries(map)
      .map(([quarter, d]) => ({ quarter, average: Math.round(d.total / d.count) }))
      .sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [okrData]);

  const maxVal = Math.max(...quarterData.map((d) => d.average), 1);
  const barMaxH = 100, barW = 48, gap = 24;
  const totalW = quarterData.length * (barW + gap) - gap + 40;

  return (
    <div className="card-premium" style={{
      background: 'rgba(19,23,32,0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 12,
      padding: '20px 24px',
      marginBottom: 24,
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', marginTop: 0, marginBottom: 16, letterSpacing: '-0.01em' }}>
        Quarter Comparison
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={totalW} height={barMaxH + 40} viewBox={`0 0 ${totalW} ${barMaxH + 40}`} style={{ overflow: 'visible' }}>
          {quarterData.map((d, i) => {
            const x = 20 + i * (barW + gap);
            const h = (d.average / maxVal) * barMaxH;
            const barColor = d.average >= 50 ? '#6b8f71' : d.average >= 25 ? '#d4a574' : '#ef4444';
            return (
              <g key={d.quarter}>
                <defs>
                  <linearGradient id={`qbar-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={barColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={barColor} stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <rect x={x} y={barMaxH - h} width={barW} height={h} rx={6} fill={`url(#qbar-${i})`} opacity={0.8}>
                  <animate attributeName="height" from="0" to={h} dur="0.8s" fill="freeze" begin={`${i * 0.15}s`} />
                  <animate attributeName="y" from={barMaxH} to={barMaxH - h} dur="0.8s" fill="freeze" begin={`${i * 0.15}s`} />
                </rect>
                <text x={x + barW / 2} y={barMaxH - h - 8} textAnchor="middle" fill="#f0ebe4" fontSize="12" fontWeight="700">
                  {d.average}%
                </text>
                <text x={x + barW / 2} y={barMaxH + 18} textAnchor="middle" fill="#a09888" fontSize="11" fontWeight="500">
                  {d.quarter}
                </text>
              </g>
            );
          })}
          <line x1={16} y1={barMaxH} x2={totalW - 4} y2={barMaxH} stroke="#1e2638" strokeWidth={1} />
        </svg>
      </div>
    </div>
  );
}

// ─── Visual Grouping Separator ───

function ObjectiveSeparator() {
  return <div className="okr-objective-separator" />;
}

// ─── Summary Bar ───

function SummaryBar({ stats }: { stats: { total: number; avgProgress: number; onTrack: number; atRisk: number; behind: number } }) {
  const avgDisplay = useCountUp(stats.avgProgress, 1000, 200);

  // Determine overall health
  const healthLabel = stats.onTrack >= stats.total * 0.6 ? 'Healthy' : stats.behind >= stats.total * 0.4 ? 'Needs Attention' : 'Mixed';
  const healthColor = healthLabel === 'Healthy' ? '#4ade80' : healthLabel === 'Needs Attention' ? '#f87171' : '#fbbf24';
  const healthGradient = healthLabel === 'Healthy'
    ? 'linear-gradient(135deg, rgba(74,222,128,0.06) 0%, rgba(19,23,32,0.95) 40%, rgba(19,23,32,0.95) 60%, rgba(74,222,128,0.04) 100%)'
    : healthLabel === 'Needs Attention'
    ? 'linear-gradient(135deg, rgba(248,113,113,0.06) 0%, rgba(19,23,32,0.95) 40%, rgba(19,23,32,0.95) 60%, rgba(248,113,113,0.04) 100%)'
    : 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(19,23,32,0.95) 40%, rgba(19,23,32,0.95) 60%, rgba(251,191,36,0.04) 100%)';

  return (
    <div
      className="okr-health-banner card-premium"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '18px 28px',
        background: healthGradient,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
        boxShadow: `0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 60px ${healthColor}08`,
        overflow: 'hidden',
      }}
    >
      {/* Top accent line matching health */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${healthColor}60, ${healthColor}, ${healthColor}60, transparent)`,
      }} />
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 120, height: 120,
        background: `radial-gradient(circle, ${healthColor}08 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Health status label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', backgroundColor: healthColor,
          boxShadow: `0 0 10px ${healthColor}60, 0 0 20px ${healthColor}30`,
          animation: healthLabel !== 'Healthy' ? 'okr-pulse-risk 2s ease-in-out infinite' : 'none',
        }} />
        <div>
          <div style={{ fontSize: 11, color: '#6b6358', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>
            OKR Health
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: healthColor, lineHeight: 1.3 }}>
            {healthLabel}
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, transparent, ${healthColor}20, transparent)` }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Target size={16} style={{ color: '#8b5cf6' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4' }}>
          {stats.total} Objectives
        </span>
      </div>

      <div style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, transparent, #1e2638, transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 36, height: 36, position: 'relative',
        }}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#1e2638" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6"
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(stats.avgProgress / 100) * 87.96} 87.96`}
              transform="rotate(-90 18 18)"
              style={{
                transition: 'stroke-dasharray 1s cubic-bezier(0.22, 1, 0.36, 1)',
                filter: 'drop-shadow(0 0 4px rgba(139,92,246,0.5))',
              }}
            />
          </svg>
          <span style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#8b5cf6',
          }}>
            {avgDisplay}%
          </span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6', lineHeight: 1 }}>
            Avg Progress
          </div>
          <div style={{ fontSize: 10, color: '#6b6358', fontWeight: 500 }}>across all OKRs</div>
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, transparent, #1e2638, transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.5)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>{stats.onTrack}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>on-track</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.5)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>{stats.atRisk}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>at-risk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f87171', boxShadow: '0 0 8px rgba(248,113,113,0.4)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>{stats.behind}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>behind</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───

export function OKRView() {
  const { okrs, kpis, teamMembers, updateOKRStatus, updateKeyResultProgress } = useFrequencyData();

  // Local-only state: notes & confidence (not backed by DataProvider)
  const [localEdits, setLocalEdits] = useState<LocalEdits>(emptyLocalEdits);
  const [editingProgress, setEditingProgress] = useState<{ okrId: string; krIdx: number } | null>(null);
  const [editingNote, setEditingNote] = useState<{ okrId: string; krIdx: number } | null>(null);

  // Collapse/expand state per OKR
  const [collapsedOkrs, setCollapsedOkrs] = useState<Record<string, boolean>>({});

  // Status morph animation key
  const [statusMorphKey, setStatusMorphKey] = useState<Record<string, number>>({});

  useEffect(() => { injectStyles(); }, []);

  // Owner resolver using live teamMembers from DataProvider
  const resolveOwner = useCallback((ownerId: string) => {
    const m = teamMembers.find((t) => t.id === ownerId);
    return m ? { name: m.name.split(' ')[0], avatar: m.avatar } : { name: ownerId, avatar: ownerId.slice(0, 2).toUpperCase() };
  }, [teamMembers]);

  // ─── Status cycling with smooth morph animation ───
  const cycleStatus = useCallback((okrId: string, current: OKR['status']) => {
    const idx = statusCycle.indexOf(current);
    const nextStatus = statusCycle[(idx + 1) % statusCycle.length];
    setStatusMorphKey((prev) => ({ ...prev, [okrId]: (prev[okrId] || 0) + 1 }));
    updateOKRStatus(okrId, nextStatus);
  }, [updateOKRStatus]);

  // ─── Toggle collapse/expand ───
  const toggleCollapse = useCallback((okrId: string) => {
    setCollapsedOkrs((prev) => ({ ...prev, [okrId]: !prev[okrId] }));
  }, []);

  // ─── Progress update ───
  const setProgress = useCallback((okrId: string, krIdx: number, value: number) => {
    const okr = okrs.find((o) => o.id === okrId);
    if (!okr) return;
    const kr = okr.keyResults[krIdx];
    if (!kr) return;
    updateKeyResultProgress(okrId, kr.text, value);
  }, [okrs, updateKeyResultProgress]);

  // ─── Local note management ───
  const setNote = useCallback((okrId: string, krIdx: number, text: string) => {
    setLocalEdits((prev) => {
      const next = { ...prev, notes: { ...prev.notes } };
      if (!next.notes[okrId]) next.notes[okrId] = {};
      if (text.trim()) {
        next.notes[okrId] = { ...next.notes[okrId], [krIdx]: text.trim() };
      } else {
        const copy = { ...next.notes[okrId] };
        delete copy[krIdx];
        if (Object.keys(copy).length === 0) delete next.notes[okrId];
        else next.notes[okrId] = copy;
      }
      return next;
    });
  }, []);

  // ─── Local confidence management ───
  const setConfidence = useCallback((okrId: string, value: number) => {
    setLocalEdits((prev) => ({ ...prev, confidence: { ...prev.confidence, [okrId]: value } }));
  }, []);

  // Derived data
  const quarters = useMemo(() => [...new Set(okrs.map((o) => o.quarter))], [okrs]);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);

  const kpiCategories = useMemo(() => {
    const cats: Record<string, KPI[]> = {};
    kpis.forEach((kpi) => {
      if (!cats[kpi.category]) cats[kpi.category] = [];
      cats[kpi.category].push(kpi);
    });
    return cats;
  }, [kpis]);

  const filteredOkrs = useMemo(
    () => selectedQuarter === 'all' ? okrs : okrs.filter((o) => o.quarter === selectedQuarter),
    [selectedQuarter, okrs]
  );

  const summaryStats = useMemo(() => {
    const total = filteredOkrs.length;
    let onTrack = 0, atRisk = 0, behind = 0, totalProgress = 0;
    filteredOkrs.forEach((okr) => {
      if (okr.status === 'on-track') onTrack++;
      else if (okr.status === 'at-risk') atRisk++;
      else behind++;
      totalProgress += okr.keyResults.length > 0 ? okr.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / okr.keyResults.length : 0;
    });
    return { total, onTrack, atRisk, behind, avgProgress: total > 0 ? Math.round(totalProgress / total) : 0 };
  }, [filteredOkrs]);

  // ─── Render ───

  return (
    <div className="noise-overlay dot-pattern scrollbar-autohide" style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Target size={24} style={{ color: '#d4a574' }} />
            <h1 className="text-glow" style={{ fontSize: 24, fontWeight: 700, color: '#f0ebe4', margin: 0, letterSpacing: '-0.02em' }}>OKRs &amp; KPIs</h1>
          </div>
          <p style={{ fontSize: 14, color: '#a09888', margin: 0, lineHeight: 1.5 }}>
            Objectives, key results, and performance indicators tracking Frequency&apos;s progress
          </p>
        </div>

        {/* Quarter selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowQuarterDropdown((v) => !v)}
            className="okr-filter-pill"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              background: 'rgba(19,23,32,0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              color: '#f0ebe4', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <BarChart3 size={16} style={{ color: '#d4a574' }} />
            {selectedQuarter === 'all' ? 'All Quarters' : selectedQuarter}
            <ChevronDown size={14} style={{
              color: '#6b6358',
              transition: 'transform 0.25s ease',
              transform: showQuarterDropdown ? 'rotate(180deg)' : 'rotate(0)',
            }} />
          </button>

          {showQuarterDropdown && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: 'rgba(19,23,32,0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              overflow: 'hidden', zIndex: 20, minWidth: 150,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)',
            }}>
              {['all', ...quarters].map((q) => (
                <button
                  key={q}
                  onClick={() => { setSelectedQuarter(q); setShowQuarterDropdown(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '10px 16px', border: 'none',
                    backgroundColor: selectedQuarter === q ? 'rgba(212,165,116,0.08)' : 'transparent',
                    color: selectedQuarter === q ? '#d4a574' : '#a09888', fontSize: 13,
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    fontWeight: selectedQuarter === q ? 600 : 400, transition: 'background 0.2s, color 0.2s',
                    borderLeft: selectedQuarter === q ? '2px solid #d4a574' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => { if (selectedQuarter !== q) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { if (selectedQuarter !== q) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {q === 'all' ? 'All Quarters' : q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Bar ── */}
      <SummaryBar stats={summaryStats} />

      {/* ── Summary Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(170px, 100%), 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Total OKRs', value: summaryStats.total, color: '#8b5cf6', isPercent: false },
          { label: 'On Track', value: summaryStats.onTrack, color: '#6b8f71', isPercent: false },
          { label: 'At Risk', value: summaryStats.atRisk, color: '#d4a574', isPercent: false },
          { label: 'Behind', value: summaryStats.behind, color: '#ef4444', isPercent: false },
          { label: 'Avg Progress', value: summaryStats.avgProgress, color: '#60a5fa', isPercent: true },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="okr-stat-card card-stat"
            style={{
              background: 'rgba(19,23,32,0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '14px 18px',
              animationDelay: `${i * 80}ms`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top gradient accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, ${stat.color}40, ${stat.color}, ${stat.color}40)`,
            }} />
            <div style={{ fontSize: 11, color: '#6b6358', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
            <CountUpStat value={stat.value} suffix={stat.isPercent ? '%' : ''} color={stat.color} delay={200 + i * 120} />
          </div>
        ))}
      </div>

      {/* ── KPI Dashboard ── */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em' }}>
          <BarChart3 size={18} style={{ color: '#8b5cf6' }} />
          Key Performance Indicators
        </h2>

        {Object.entries(kpiCategories).map(([category, categoryKpis]) => (
          <div key={category} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: categoryColors[category] ?? '#6b6358',
                boxShadow: `0 0 6px ${categoryColors[category] ?? '#6b6358'}40`,
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: categoryColors[category] ?? '#a09888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {category}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {categoryKpis.map((kpi) => {
                const t = trendIcon(kpi.trend);
                return (
                  <div
                    key={kpi.id}
                    className="okr-kpi-card"
                    style={{
                      background: 'rgba(19,23,32,0.8)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: 12,
                      padding: '16px 18px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Subtle top gradient line matching category */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg, transparent, ${categoryColors[category] ?? '#6b6358'}60, transparent)`,
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#6b6358', fontWeight: 500 }}>{kpi.name}</span>
                      <span className={t.className}>
                        <t.Icon size={16} style={{ color: t.color, transition: 'color 0.3s ease' }} />
                      </span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', marginBottom: 4, letterSpacing: '-0.02em' }}>{kpi.value}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: '#6b6358' }}>Target:</span>
                      <span style={{ fontSize: 11, color: '#a09888', fontWeight: 600 }}>{kpi.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, #1e2638, #2e3a4e, #1e2638, transparent)',
        marginBottom: 32,
      }} />

      {/* ── Quarter Comparison (only when "All Quarters" selected) ── */}
      {selectedQuarter === 'all' && <QuarterComparisonChart okrData={okrs} />}

      {/* ── OKRs Section ── */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em' }}>
          <Target size={18} style={{ color: '#d4a574' }} />
          Objectives &amp; Key Results
          {selectedQuarter !== 'all' && (
            <span style={{ fontSize: 13, fontWeight: 500, color: '#6b6358', marginLeft: 4 }}>
              — {selectedQuarter}
            </span>
          )}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filteredOkrs.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#6b6358',
              fontSize: 14,
              fontWeight: 500,
              background: 'rgba(19,23,32,0.8)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 14,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}>
              No OKRs for this quarter
            </div>
          )}
          {filteredOkrs.map((okr, cardIndex) => {
            const badge = statusBadge(okr.status);
            const overallProgress = okr.keyResults.length > 0 ? Math.round(
              okr.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / okr.keyResults.length
            ) : 0;
            const confidence = localEdits.confidence[okr.id] ?? 0;
            const isCollapsed = collapsedOkrs[okr.id] ?? false;
            const lastUpdated = getOkrLastUpdated(okr.id);
            const sparklineData = generateSparklineData(overallProgress, okr.id);
            const morphKey = statusMorphKey[okr.id] || 0;

            const pulseClass = okr.status === 'at-risk'
              ? 'okr-pulse-at-risk'
              : okr.status === 'behind'
              ? 'okr-pulse-behind'
              : '';

            const statusClass = `status-${okr.status}`;

            return (
              <React.Fragment key={okr.id}>
                {/* Gradient separator between objectives */}
                {cardIndex > 0 && <ObjectiveSeparator />}

                <div
                  className={`okr-card-animated okr-card-glass card-interactive ${statusClass}`}
                  style={{
                    background: 'rgba(19,23,32,0.8)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 14, overflow: 'hidden',
                    animationDelay: `${cardIndex * 80}ms`,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                    marginBottom: 4,
                  }}
                >
                  {/* Top accent gradient line matching status color */}
                  <div style={{
                    height: 3,
                    background: `linear-gradient(90deg, ${badge.text}20, ${badge.text}, ${badge.text}80, ${badge.text}20)`,
                  }} />

                  <div style={{ padding: '20px 24px' }}>
                    {/* Objective header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title row with expand toggle */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                          <button
                            onClick={() => toggleCollapse(okr.id)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: 2, display: 'flex', alignItems: 'center',
                              marginTop: 2, flexShrink: 0,
                            }}
                            title={isCollapsed ? 'Expand key results' : 'Collapse key results'}
                          >
                            <ChevronRight
                              size={16}
                              className={`okr-expand-toggle ${isCollapsed ? '' : 'rotated'}`}
                              style={{ color: '#6b6358' }}
                            />
                          </button>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4', margin: 0, lineHeight: 1.45, letterSpacing: '-0.01em' }}>
                            {okr.objective}
                          </h3>
                        </div>

                        {/* Status row with badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingLeft: 26 }}>
                          {/* Premium status badge with smooth morph animation */}
                          <button
                            key={`status-${morphKey}`}
                            className={`${pulseClass} okr-status-badge-glow ${badge.glowClass} ${morphKey > 0 ? 'okr-status-morph-anim' : ''}`}
                            onClick={() => cycleStatus(okr.id, okr.status)}
                            title="Click to cycle status"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              fontSize: 11, fontWeight: 700, color: badge.text,
                              backgroundColor: badge.bg,
                              padding: '5px 14px', borderRadius: 20,
                              lineHeight: 1,
                              border: `1px solid ${badge.text}30`,
                              cursor: 'pointer', fontFamily: 'inherit',
                              transition: 'transform 0.15s, box-shadow 0.4s ease, background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease',
                              letterSpacing: '0.02em',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            <badge.Icon size={12} />
                            {badge.label}
                          </button>

                          {/* Quarter badge */}
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: '#8b5cf6',
                            backgroundColor: 'rgba(139,92,246,0.12)', padding: '3px 10px',
                            borderRadius: 6, lineHeight: 1,
                          }}>
                            {okr.quarter}
                          </span>

                          {/* Confidence badge (compact visual) */}
                          <ConfidenceBadge value={confidence} />

                          {/* Confidence flames (interactive setter) */}
                          <div style={{ marginLeft: 2 }}>
                            <ConfidenceFlames value={confidence} onChange={(v) => setConfidence(okr.id, v)} />
                          </div>

                          {/* Divider dot */}
                          <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#1e2638', flexShrink: 0 }} />

                          {/* Last updated timestamp */}
                          <RelativeTimestamp date={lastUpdated} />
                        </div>
                      </div>

                      {/* Right side: Ring + Sparkline */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        {/* Mini sparkline showing 4-week trend */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            4w trend
                          </span>
                          <MiniSparkline
                            data={sparklineData}
                            color={badge.text}
                            width={56}
                            height={24}
                            delay={cardIndex * 80 + 400}
                          />
                        </div>

                        {/* Animated circular progress ring */}
                        <AnimatedProgressRing
                          progress={overallProgress}
                          size={64}
                          strokeWidth={5}
                          color={badge.text}
                          delay={cardIndex * 80 + 200}
                        />
                      </div>
                    </div>

                    {/* Key Results with collapse/expand animation */}
                    <div
                      className={`okr-kr-collapse-wrapper ${isCollapsed ? 'collapsed' : 'expanded'}`}
                      style={{
                        maxHeight: isCollapsed ? 0 : `${okr.keyResults.length * 140 + 100}px`,
                        paddingTop: isCollapsed ? 0 : 10,
                      }}
                    >
                      <div className="okr-kr-container" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {okr.keyResults.map((kr, idx) => {
                          const owner = resolveOwner(kr.owner);
                          const effectiveProgress = kr.progress;
                          const barColor = progressColor(effectiveProgress);
                          const gradient = progressGradient(effectiveProgress);
                          const isEditingThis = editingProgress?.okrId === okr.id && editingProgress?.krIdx === idx;
                          const isEditingNoteHere = editingNote?.okrId === okr.id && editingNote?.krIdx === idx;
                          const noteText = localEdits.notes[okr.id]?.[idx] ?? '';
                          const hasNote = noteText.length > 0;
                          const isComplete = effectiveProgress >= 100;

                          // Owner ring color based on progress
                          const ownerRingColor = isComplete ? '#6b8f71' : barColor;

                          return (
                            <div
                              key={idx}
                              className="okr-kr-item okr-kr-item-connected"
                              style={{
                                backgroundColor: 'rgba(13,16,24,0.5)',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                borderRadius: 10,
                                padding: '12px 16px',
                                border: '1px solid rgba(30,38,56,0.5)',
                                borderLeft: `2px solid ${barColor}40`,
                                animationDelay: `${cardIndex * 80 + 200 + idx * 80}ms`,
                                transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.3s ease',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(46,58,78,0.8)'; e.currentTarget.style.borderLeftColor = `${barColor}70`; e.currentTarget.style.backgroundColor = 'rgba(13,16,24,0.75)'; e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)`; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(30,38,56,0.5)'; e.currentTarget.style.borderLeftColor = `${barColor}40`; e.currentTarget.style.backgroundColor = 'rgba(13,16,24,0.5)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                                  {/* Checkmark animation for completed KRs */}
                                  {isComplete && (
                                    <span className="okr-checkmark-anim" style={{ flexShrink: 0, marginTop: 1 }}>
                                      <CheckCircle2 size={16} style={{
                                        color: '#6b8f71',
                                        filter: 'drop-shadow(0 0 4px rgba(107,143,113,0.5))',
                                      }} />
                                    </span>
                                  )}
                                  <span style={{
                                    fontSize: 13,
                                    color: isComplete ? '#8bb896' : '#a09888',
                                    lineHeight: 1.45,
                                    flex: 1,
                                  }}>
                                    {kr.text}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  {/* Note icon */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingNote(isEditingNoteHere ? null : { okrId: okr.id, krIdx: idx });
                                    }}
                                    title={hasNote ? 'Edit note' : 'Add note'}
                                    style={{
                                      background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                                      display: 'flex', alignItems: 'center',
                                      opacity: hasNote ? 1 : 0.4, transition: 'opacity 0.15s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                    onMouseLeave={(e) => { if (!hasNote) e.currentTarget.style.opacity = '0.4'; }}
                                  >
                                    <MessageSquarePlus size={14} style={{ color: hasNote ? '#d4a574' : '#6b6358' }} />
                                  </button>

                                  {/* Owner avatar with colored ring */}
                                  <div
                                    title={owner.name}
                                    style={{
                                      width: 28, height: 28, borderRadius: '50%',
                                      padding: 2,
                                      background: `linear-gradient(135deg, ${ownerRingColor}80, ${ownerRingColor})`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      boxShadow: `0 0 8px ${ownerRingColor}30`,
                                      transition: 'box-shadow 0.3s ease',
                                    }}
                                  >
                                    <div style={{
                                      width: 24, height: 24, borderRadius: '50%',
                                      background: 'linear-gradient(135deg, #1a1f2e, #0d1018)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: 9, fontWeight: 700, color: ownerRingColor,
                                    }}>
                                      {owner.avatar}
                                    </div>
                                  </div>
                                  <span style={{ fontSize: 11, color: '#6b6358' }}>{owner.name}</span>
                                </div>
                              </div>

                              {/* Enhanced animated progress bar with milestones */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div
                                  className="okr-bar-wrapper"
                                  style={{
                                    flex: 1, position: 'relative', cursor: 'pointer',
                                  }}
                                  onClick={() => setEditingProgress({ okrId: okr.id, krIdx: idx })}
                                  title="Click to edit progress"
                                >
                                  <AnimatedProgressBar
                                    progress={effectiveProgress}
                                    gradient={gradient}
                                    barColor={barColor}
                                    delay={cardIndex * 80 + idx * 100}
                                    thin={true}
                                  />
                                  {/* Hover tooltip */}
                                  <div className="okr-progress-tooltip">
                                    <div style={{ fontSize: 11, fontWeight: 700, color: barColor, marginBottom: 2 }}>
                                      {effectiveProgress}% complete
                                    </div>
                                    <div style={{ fontSize: 10, color: '#6b6358' }}>
                                      Owner: {owner.name}
                                    </div>
                                  </div>
                                </div>
                                {isEditingThis ? (
                                  <InlineProgressEditor
                                    current={effectiveProgress}
                                    onSave={(v) => { setProgress(okr.id, idx, v); setEditingProgress(null); }}
                                    onCancel={() => setEditingProgress(null)}
                                  />
                                ) : (
                                  <CountUpPercent
                                    value={effectiveProgress}
                                    color={barColor}
                                    delay={cardIndex * 80 + 300 + idx * 100}
                                    onClick={() => setEditingProgress({ okrId: okr.id, krIdx: idx })}
                                    title="Click to edit progress"
                                  />
                                )}
                              </div>

                              {/* Note display */}
                              {hasNote && !isEditingNoteHere && (
                                <div
                                  style={{
                                    marginTop: 8, padding: '6px 10px',
                                    backgroundColor: 'rgba(212,165,116,0.04)',
                                    border: '1px solid rgba(212,165,116,0.1)', borderRadius: 6,
                                    fontSize: 11, color: '#a09888', lineHeight: 1.5, cursor: 'pointer',
                                  }}
                                  onClick={() => setEditingNote({ okrId: okr.id, krIdx: idx })}
                                  title="Click to edit note"
                                >
                                  {noteText}
                                </div>
                              )}

                              {/* Note editor */}
                              {isEditingNoteHere && (
                                <NoteEditor
                                  initial={noteText}
                                  onSave={(text) => setNote(okr.id, idx, text)}
                                  onClose={() => setEditingNote(null)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Collapsed summary line */}
                    {isCollapsed && (
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, paddingLeft: 26,
                          animation: 'okr-timestamp-fade 0.3s ease both',
                        }}
                      >
                        <span style={{ fontSize: 11, color: '#6b6358' }}>
                          {okr.keyResults.length} key result{okr.keyResults.length !== 1 ? 's' : ''}
                        </span>
                        <div style={{ flex: 1, maxWidth: 200 }}>
                          <AnimatedProgressBar
                            progress={overallProgress}
                            gradient={progressGradient(overallProgress)}
                            barColor={progressColor(overallProgress)}
                            delay={0}
                            thin={true}
                          />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: progressColor(overallProgress) }}>
                          {overallProgress}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Close quarter dropdown when clicking outside */}
      {showQuarterDropdown && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          onClick={() => setShowQuarterDropdown(false)}
        />
      )}

      {/* AI Advisor -- OKR Context */}
      <div style={{ marginTop: 36 }}>
        <InlineAdvisor
          title="OKR Advisor"
          titleIcon="sparkles"
          compact={true}
          defaultCollapsed={true}
          storageKeySuffix="okrs"
          suggestedPrompts={[
            'Which OKRs are at risk and what should we do?',
            'Are our key results ambitious enough?',
            'How should we adjust targets for next quarter?',
            'What OKRs are missing from our strategy?',
          ]}
        />
      </div>
    </div>
  );
}
