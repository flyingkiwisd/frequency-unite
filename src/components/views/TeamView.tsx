'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
  Crown,
  Compass,
  User,
  Target,
  AlertCircle,
  AlertTriangle,
  Search,
  Mail,
  MessageSquare,
  ExternalLink,
  LayoutGrid,
  GitBranch,
  Activity,
  TrendingUp,
  BarChart3,
  UserCheck,
  List,
  RotateCcw,
  X,
  GitCompare,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { type MemberTier, type TeamMember } from '@/lib/data';
import { useFrequencyData } from '@/lib/supabase/DataProvider';

/* ─── Tier Config ─── */

type TierFilter = 'all' | MemberTier;
type ViewMode = 'grid' | 'list' | 'org-chart';

interface TierConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
  ringColor: string;
  gradientBadge: string;
}

const tierConfig: Record<MemberTier, TierConfig> = {
  'core-team': {
    label: 'Core Team',
    bg: 'rgba(212, 165, 116, 0.12)',
    text: '#d4a574',
    border: 'rgba(212, 165, 116, 0.25)',
    icon: Shield,
    ringColor: '#d4a574',
    gradientBadge: 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(232,180,76,0.15))',
  },
  board: {
    label: 'Board',
    bg: 'rgba(139, 92, 246, 0.12)',
    text: '#8b5cf6',
    border: 'rgba(139, 92, 246, 0.25)',
    icon: Crown,
    ringColor: '#8b5cf6',
    gradientBadge: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(167,139,250,0.15))',
  },
  'node-lead': {
    label: 'Node Lead',
    bg: 'rgba(52, 211, 153, 0.12)',
    text: '#34d399',
    border: 'rgba(52, 211, 153, 0.25)',
    icon: Compass,
    ringColor: '#34d399',
    gradientBadge: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(110,231,183,0.15))',
  },
  member: {
    label: 'Member',
    bg: 'rgba(56, 189, 248, 0.12)',
    text: '#38bdf8',
    border: 'rgba(56, 189, 248, 0.25)',
    icon: User,
    ringColor: '#38bdf8',
    gradientBadge: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(125,211,252,0.15))',
  },
};

/* ─── Status Config ─── */

const statusConfig: Record<TeamMember['status'], { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(107, 143, 113, 0.15)', text: '#6b8f71', label: 'Active' },
  'part-time': { bg: 'rgba(232, 180, 76, 0.15)', text: '#e8b44c', label: 'Part-Time' },
  advisory: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', label: 'Advisory' },
  hiring: { bg: 'rgba(224, 96, 96, 0.15)', text: '#e06060', label: 'Hiring' },
};

/* ─── Avatar gradient helper ─── */

function avatarGradient(color: string): string {
  const gradientMap: Record<string, string> = {
    'bg-amber-500': 'linear-gradient(135deg, #c4925a, #d4a574)',
    'bg-amber-400': 'linear-gradient(135deg, #d4a574, #e8b44c)',
    'bg-rose-400': 'linear-gradient(135deg, #e879a0, #f0a0b8)',
    'bg-violet-500': 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    'bg-sky-400': 'linear-gradient(135deg, #38bdf8, #5eaed4)',
    'bg-emerald-500': 'linear-gradient(135deg, #10b981, #34d399)',
    'bg-purple-500': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'bg-pink-400': 'linear-gradient(135deg, #e879a0, #f0a0b8)',
    'bg-teal-400': 'linear-gradient(135deg, #2dd4bf, #5eead4)',
    'bg-green-500': 'linear-gradient(135deg, #22c55e, #4ade80)',
    'bg-lime-500': 'linear-gradient(135deg, #84cc16, #a3e635)',
    'bg-orange-500': 'linear-gradient(135deg, #f97316, #fb923c)',
    'bg-indigo-400': 'linear-gradient(135deg, #818cf8, #a5b4fc)',
    'bg-slate-400': 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
  };
  return gradientMap[color] || 'linear-gradient(135deg, #a09888, #6b6358)';
}

/* ─── Card background gradient from member color ─── */

function cardGradient(color: string): string {
  const colorMap: Record<string, string> = {
    'bg-amber-500': 'rgba(212, 165, 116, 0.06)',
    'bg-amber-400': 'rgba(212, 165, 116, 0.05)',
    'bg-rose-400': 'rgba(232, 121, 160, 0.06)',
    'bg-violet-500': 'rgba(139, 92, 246, 0.06)',
    'bg-sky-400': 'rgba(56, 189, 248, 0.06)',
    'bg-emerald-500': 'rgba(16, 185, 129, 0.06)',
    'bg-purple-500': 'rgba(139, 92, 246, 0.05)',
    'bg-pink-400': 'rgba(232, 121, 160, 0.05)',
    'bg-teal-400': 'rgba(45, 212, 191, 0.06)',
    'bg-green-500': 'rgba(34, 197, 94, 0.06)',
    'bg-lime-500': 'rgba(132, 204, 22, 0.06)',
    'bg-orange-500': 'rgba(249, 115, 22, 0.06)',
    'bg-indigo-400': 'rgba(129, 140, 248, 0.06)',
    'bg-slate-400': 'rgba(148, 163, 184, 0.05)',
  };
  return colorMap[color] || 'rgba(160, 152, 136, 0.04)';
}

function memberAccentColor(color: string): string {
  const colorMap: Record<string, string> = {
    'bg-amber-500': '#d4a574',
    'bg-amber-400': '#e8b44c',
    'bg-rose-400': '#e879a0',
    'bg-violet-500': '#8b5cf6',
    'bg-sky-400': '#38bdf8',
    'bg-emerald-500': '#34d399',
    'bg-purple-500': '#a78bfa',
    'bg-pink-400': '#f0a0b8',
    'bg-teal-400': '#2dd4bf',
    'bg-green-500': '#4ade80',
    'bg-lime-500': '#a3e635',
    'bg-orange-500': '#fb923c',
    'bg-indigo-400': '#a5b4fc',
    'bg-slate-400': '#cbd5e1',
  };
  return colorMap[color] || '#a09888';
}

/* ─── Filter Tabs ─── */

const filterTabs: { key: TierFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'core-team', label: 'Core Team' },
  { key: 'board', label: 'Board' },
  { key: 'node-lead', label: 'Node Leads' },
  { key: 'member', label: 'Members' },
];

/* ─── Inline Capacity Data ─── */

const capacityData: Record<string, { currentLoad: number; maxCapacity: number; trend: 'overloaded' | 'high' | 'balanced' | 'available' }> = {
  james: { currentLoad: 35, maxCapacity: 40, trend: 'high' },
  sian: { currentLoad: 52, maxCapacity: 40, trend: 'overloaded' },
  fairman: { currentLoad: 20, maxCapacity: 30, trend: 'balanced' },
  max: { currentLoad: 28, maxCapacity: 30, trend: 'high' },
  dave: { currentLoad: 18, maxCapacity: 25, trend: 'balanced' },
  andrew: { currentLoad: 12, maxCapacity: 20, trend: 'balanced' },
  felicia: { currentLoad: 10, maxCapacity: 15, trend: 'balanced' },
  mafe: { currentLoad: 22, maxCapacity: 25, trend: 'high' },
  colleen: { currentLoad: 8, maxCapacity: 15, trend: 'available' },
  greg: { currentLoad: 15, maxCapacity: 20, trend: 'balanced' },
  raamayan: { currentLoad: 18, maxCapacity: 20, trend: 'high' },
  gareth: { currentLoad: 12, maxCapacity: 15, trend: 'balanced' },
  sarah: { currentLoad: 6, maxCapacity: 10, trend: 'available' },
  nipun: { currentLoad: 4, maxCapacity: 8, trend: 'available' },
};

const trendConfig: Record<string, { label: string; color: string; bg: string }> = {
  overloaded: { label: 'Overloaded', color: '#e06060', bg: 'rgba(224, 96, 96, 0.12)' },
  high: { label: 'High Load', color: '#e8b44c', bg: 'rgba(232, 180, 76, 0.12)' },
  balanced: { label: 'Balanced', color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.12)' },
  available: { label: 'Available', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)' },
};

/* ─── Skill Tags ─── */

const skillsMap: Record<string, string[]> = {
  james: ['Strategy', 'Vision', 'Fundraising', 'Leadership'],
  sian: ['Operations', 'Events', 'Community', 'Finance'],
  fairman: ['Architecture', 'Technology', 'Coordination', 'Design'],
  max: ['Enrollment', 'Sales', 'Relationships', 'Growth'],
  dave: ['Governance', 'Culture', 'Board Relations', 'Coaching'],
  andrew: ['Coherence', 'Facilitation', 'Integration'],
  felicia: ['Culture', 'Ceremony', 'Feminine Leadership'],
  mafe: ['Project Management', 'Airtable', 'Communications'],
  colleen: ['DAF', 'Compliance', 'Financial Stewardship'],
  greg: ['Deal Flow', 'Capital', 'Diligence'],
  gareth: ['Bioregions', 'Community', 'Regeneration'],
  raamayan: ['Narrative', 'Distribution', 'Movement Building'],
  sarah: ['Education', 'Energy Work', 'Facilitation'],
  nipun: ['Bookkeeping', 'Accounting', 'Tax'],
};

const skillColors: string[] = [
  '#d4a574', '#8b5cf6', '#34d399', '#38bdf8',
  '#e8b44c', '#e879a0', '#2dd4bf', '#f97316',
];

/* ─── KPI Sparkline Data (7-day trends) ─── */

function generateSparkline(memberId: string): number[] {
  // Deterministic pseudo-random based on member id for consistent sparklines
  let seed = 0;
  for (let i = 0; i < memberId.length; i++) seed += memberId.charCodeAt(i);
  const vals: number[] = [];
  let v = 30 + (seed % 40);
  for (let i = 0; i < 7; i++) {
    const delta = ((seed * (i + 1) * 7) % 21) - 10;
    v = Math.max(5, Math.min(95, v + delta));
    vals.push(v);
    seed = (seed * 31 + 17) % 997;
  }
  return vals;
}

/* ─── Sparkline SVG Component ─── */

function KpiSparkline({ data, color, width = 56, height = 20 }: { data: number[]; color: string; width?: number; height?: number }) {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;
  const padding = 2;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * innerW;
    const y = padding + innerH - ((v - minVal) / range) * innerH;
    return `${x},${y}`;
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt}` : `${acc} L ${pt}`;
  }, '');

  // Area fill path
  const lastX = padding + innerW;
  const firstX = padding;
  const areaD = `${pathD} L ${lastX},${height} L ${firstX},${height} Z`;

  const trending = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark-fill-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle
        cx={padding + innerW}
        cy={padding + innerH - ((data[data.length - 1] - minVal) / range) * innerH}
        r="2"
        fill={trending ? '#6b8f71' : '#e06060'}
      />
    </svg>
  );
}

/* ─── Text Highlight Helper ─── */

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              backgroundColor: 'rgba(212, 165, 116, 0.25)',
              color: '#d4a574',
              borderRadius: '2px',
              padding: '0 2px',
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── Animated Capacity Bar ─── */

function AnimatedBar({
  targetWidth,
  color,
  gradient,
  glowColor,
  isOverloaded,
  delay = 0,
}: {
  targetWidth: number;
  color: string;
  gradient: string;
  glowColor: string;
  isOverloaded: boolean;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setWidth(targetWidth);
    }, delay);
    return () => clearTimeout(timer);
  }, [targetWidth, delay]);

  return (
    <div
      className="h-full rounded-full"
      style={{
        width: `${mounted ? width : 0}%`,
        background: gradient,
        boxShadow: isOverloaded
          ? `0 0 8px ${color}, 0 0 16px rgba(224, 96, 96, 0.4)`
          : `0 0 4px ${glowColor}`,
        transition: mounted
          ? 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'none',
      }}
    />
  );
}

/* ─── Activity Indicator Data ─── */

const activityData: Record<string, 'green' | 'amber' | 'red'> = {
  james: 'green',
  sian: 'green',
  fairman: 'green',
  max: 'amber',
  dave: 'green',
  andrew: 'amber',
  felicia: 'red',
  mafe: 'green',
  colleen: 'amber',
  greg: 'green',
  gareth: 'amber',
  raamayan: 'green',
  sarah: 'red',
  nipun: 'amber',
};

const activityConfig: Record<string, { color: string; label: string }> = {
  green: { color: '#22c55e', label: 'Active recently' },
  amber: { color: '#e8b44c', label: 'Active this week' },
  red: { color: '#e06060', label: 'No recent activity' },
};

/* ─── Org Chart Data ─── */

const orgChartLevels = [
  {
    label: 'Executive',
    members: ['james'],
  },
  {
    label: 'Leadership',
    members: ['sian', 'fairman', 'dave'],
  },
  {
    label: 'Team',
    members: ['max', 'greg', 'gareth', 'raamayan', 'andrew', 'felicia', 'mafe', 'colleen', 'sarah', 'nipun'],
  },
];

/* ─── Parse hours string to numeric value ─── */

function parseHoursToNumber(hrs: string | undefined): number {
  if (!hrs) return 0;
  if (hrs.toLowerCase() === 'surgical') return 2;
  const parts = hrs.split('-').map((s) => parseFloat(s.trim()));
  if (parts.length === 2) return (parts[0] + parts[1]) / 2;
  return parts[0] || 0;
}

/* ─── CSS Animations ─── */

const teamViewStyles = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulseRing {
    0%, 100% { box-shadow: 0 0 0 0 rgba(212,165,116,0.4); }
    50% { box-shadow: 0 0 0 6px rgba(212,165,116,0); }
  }
  @keyframes cardGlow {
    0%, 100% { border-color: rgba(30,38,56,0.5); }
    50% { border-color: rgba(212,165,116,0.2); }
  }
  @keyframes floatEmpty {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes avatarPulse {
    0%, 100% { box-shadow: 0 0 0 0 var(--pulse-color, rgba(212,165,116,0.3)); }
    50% { box-shadow: 0 0 12px 4px var(--pulse-color, rgba(212,165,116,0.15)); }
  }
  @keyframes statusPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
  }
  @keyframes tagReveal {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes onlinePulse {
    0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
    50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }
  @keyframes onlinePulseRing {
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(2.2); opacity: 0; }
    100% { transform: scale(1); opacity: 0; }
  }
  @keyframes cardFlip {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(180deg); }
  }
  @keyframes cardFlipBack {
    0% { transform: rotateY(180deg); }
    100% { transform: rotateY(0deg); }
  }
  @keyframes orgLineGrow {
    from { stroke-dashoffset: 100; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes orgLinePulse {
    0%, 100% { stroke-opacity: 0.3; }
    50% { stroke-opacity: 0.7; }
  }
  @keyframes compareSlideIn {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes sparkDraw {
    from { stroke-dashoffset: 200; }
    to { stroke-dashoffset: 0; }
  }

  .tv-card-glass {
    background: rgba(19, 23, 32, 0.75) !important;
    backdrop-filter: blur(20px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.35s ease;
  }
  .tv-card-glass:hover {
    transform: translateY(-6px) scale(1.008) !important;
    box-shadow: 0 20px 50px rgba(0,0,0,0.35),
                0 0 40px var(--card-glow, rgba(212,165,116,0.06)) !important;
  }

  .tv-badge-shimmer {
    background-size: 200% auto;
    animation: shimmer 3s linear infinite;
  }

  .tv-badge-hover {
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.2s ease;
  }
  .tv-badge-hover:hover {
    transform: scale(1.08);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  .tv-action-btn {
    position: relative;
    overflow: hidden;
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
                color 0.2s ease,
                background-color 0.25s ease;
  }
  .tv-action-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: currentColor;
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .tv-action-btn:hover {
    transform: scale(1.12);
    color: #d4a574 !important;
    background-color: rgba(212, 165, 116, 0.1);
  }
  .tv-action-btn:hover::before {
    opacity: 0.06;
  }
  .tv-action-btn:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }

  .tv-stat-number {
    animation: countUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .tv-search-input {
    transition: border-color 0.35s ease, box-shadow 0.35s ease, background-color 0.35s ease;
  }
  .tv-search-input:focus-within {
    border-color: rgba(212, 165, 116, 0.55) !important;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1),
                0 0 24px rgba(212, 165, 116, 0.1),
                inset 0 1px 0 rgba(212, 165, 116, 0.06);
    background-color: rgba(19, 23, 32, 0.95) !important;
  }
  .tv-search-input:focus-within .tv-search-icon {
    color: #d4a574 !important;
    transition: color 0.3s ease;
  }

  .tv-filter-active {
    position: relative;
  }
  .tv-filter-active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #d4a574, transparent);
    border-radius: 1px;
  }

  .tv-gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 12px 12px 0 0;
    opacity: 0.7;
    transition: opacity 0.35s ease, height 0.35s ease;
  }

  .tv-card-glass:hover .tv-gradient-overlay {
    opacity: 1;
    height: 4px;
  }

  .tv-section-header {
    position: relative;
    padding-bottom: 8px;
  }
  .tv-section-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--header-color, rgba(212,165,116,0.3)), transparent 70%);
    border-radius: 1px;
  }

  .tv-domain-tag {
    position: relative;
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
                background-color 0.2s ease,
                box-shadow 0.2s ease;
  }
  .tv-domain-tag:hover {
    transform: translateY(-1px) scale(1.04);
    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  }

  .tv-skill-tag {
    position: relative;
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
                background-color 0.2s ease,
                box-shadow 0.2s ease;
  }
  .tv-skill-tag:hover {
    transform: translateY(-1px) scale(1.04);
    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  }

  .tv-kpi-item {
    transition: transform 0.2s ease, padding-left 0.2s ease;
  }
  .tv-kpi-item:hover {
    transform: translateX(3px);
  }

  .tv-avatar-glow {
    transition: box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .tv-status-dot {
    animation: statusPulse 2.5s ease-in-out infinite;
  }
  .tv-status-dot-inactive {
    animation: none;
  }

  .tv-empty-float {
    animation: floatEmpty 3s ease-in-out infinite;
  }
  .tv-empty-glow {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  .tv-separator {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,165,116,0.3), transparent);
  }

  .tv-stats-header {
    background: linear-gradient(180deg, rgba(19,23,32,0.95) 0%, rgba(19,23,32,0.8) 100%);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .tv-view-toggle-btn {
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .tv-view-toggle-btn:hover {
    transform: translateY(-1px);
  }

  .tv-org-node {
    background: rgba(19, 23, 32, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.3s ease,
                border-color 0.3s ease;
  }
  .tv-org-node:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }

  .tv-list-row-glass {
    background: rgba(19, 23, 32, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.25s ease,
                border-color 0.25s ease;
  }
  .tv-list-row-glass:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }

  .tv-capacity-card {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.25s ease;
  }
  .tv-capacity-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  /* Card flip container */
  .tv-flip-container {
    perspective: 1200px;
    transform-style: preserve-3d;
  }
  .tv-flip-inner {
    position: relative;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
    transform-style: preserve-3d;
  }
  .tv-flip-inner.tv-flipped {
    transform: rotateY(180deg);
  }
  .tv-flip-front,
  .tv-flip-back {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .tv-flip-back {
    position: absolute;
    inset: 0;
    transform: rotateY(180deg);
  }

  /* Online pulse ring */
  .tv-online-pulse {
    animation: onlinePulse 2s ease-in-out infinite;
  }
  .tv-online-pulse::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 1.5px solid rgba(34,197,94,0.4);
    animation: onlinePulseRing 2s ease-in-out infinite;
  }

  /* Parallax container */
  .tv-parallax-grid {
    will-change: transform;
  }
  .tv-parallax-grid > * {
    will-change: transform;
    transition: transform 0.1s linear;
  }

  /* Compare panel */
  .tv-compare-panel {
    animation: compareSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .tv-compare-bar {
    animation: fadeSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .tv-compare-selected {
    outline: 2px solid rgba(139, 92, 246, 0.6) !important;
    outline-offset: 2px;
  }

  /* Org chart SVG lines */
  .tv-org-line {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
    animation: orgLinePulse 4s ease-in-out infinite;
  }

  .team-list-header,
  .team-list-row {
    grid-template-columns: 2.5fr 1fr 1fr 1.5fr 1fr;
  }
  .team-list-col-hide-mobile {}
  @media (max-width: 767px) {
    .team-list-header,
    .team-list-row {
      grid-template-columns: 2fr 1fr;
    }
    .team-list-col-hide-mobile {
      display: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tv-card-glass,
    .tv-card-glass:hover,
    .tv-action-btn,
    .tv-action-btn:hover,
    .tv-action-btn:active,
    .tv-badge-hover,
    .tv-badge-hover:hover,
    .tv-view-toggle-btn,
    .tv-view-toggle-btn:hover,
    .tv-org-node,
    .tv-org-node:hover,
    .tv-list-row-glass,
    .tv-list-row-glass:hover,
    .tv-capacity-card,
    .tv-capacity-card:hover,
    .tv-compare-panel,
    .tv-compare-bar {
      transition: none !important;
      transform: none !important;
      animation: none !important;
    }
    .tv-badge-shimmer {
      animation: none !important;
    }
    .tv-empty-float,
    .tv-empty-glow {
      animation: none !important;
    }
    .tv-stat-number {
      animation: none !important;
    }
    .tv-flip-inner {
      transition: none !important;
    }
    .tv-online-pulse,
    .tv-online-pulse::after {
      animation: none !important;
    }
    .tv-org-line {
      animation: none !important;
    }
    [style*="animation"] {
      animation: none !important;
    }
  }
`;

/* ─── Component ─── */

export function TeamView({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { teamMembers } = useFrequencyData();
  const [filter, setFilter] = useState<TierFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<number>(0);

  // Mount detection for animations
  useEffect(() => {
    setMounted(true);
  }, []);

  // Parallax scroll effect on grid
  useEffect(() => {
    if (viewMode !== 'grid' || !gridRef.current) return;
    const handleScroll = () => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const scrollY = -rect.top;
      parallaxRef.current = scrollY;
      const cards = gridRef.current.children;
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const row = Math.floor(i / 3);
        const offset = scrollY * 0.02 * (row % 2 === 0 ? 1 : -1);
        card.style.transform = `translateY(${offset}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  const filtered = useMemo(() => {
    let result = teamMembers;
    if (filter !== 'all') {
      result = result.filter((m) => m.tier === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.domains.some((d) => d.toLowerCase().includes(q)) ||
          (skillsMap[m.id] || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    return result;
  }, [filter, searchQuery, teamMembers]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCompareSelect = useCallback((id: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  const resetCompare = useCallback(() => {
    setCompareMode(false);
    setCompareSelection([]);
  }, []);

  /* ─── Computed Stats ─── */
  const totalMembers = teamMembers.length;
  const totalHours = useMemo(() => {
    return Object.values(capacityData).reduce((sum, c) => sum + c.currentLoad, 0);
  }, []);
  const avgHoursPerWeek = useMemo(() => {
    const hoursValues = teamMembers.map((m) => parseHoursToNumber(m.hoursPerWeek)).filter((h) => h > 0);
    return hoursValues.length > 0 ? Math.round(hoursValues.reduce((a, b) => a + b, 0) / hoursValues.length) : 0;
  }, [teamMembers]);
  const avgCapacity = useMemo(() => {
    const entries = Object.values(capacityData);
    const totalPct = entries.reduce((sum, c) => sum + (c.currentLoad / c.maxCapacity) * 100, 0);
    return Math.round(totalPct / entries.length);
  }, []);
  const atRiskCount = useMemo(() => {
    return Object.values(capacityData).filter((c) => c.trend === 'overloaded').length;
  }, []);
  const coreTeamCount = useMemo(() => teamMembers.filter((m) => m.tier === 'core-team').length, [teamMembers]);
  const boardCount = useMemo(() => teamMembers.filter((m) => m.tier === 'board').length, [teamMembers]);
  const nodeLeadCount = useMemo(() => teamMembers.filter((m) => m.tier === 'node-lead').length, [teamMembers]);
  const memberCount = useMemo(() => teamMembers.filter((m) => m.tier === 'member').length, [teamMembers]);

  /* ─── Org Chart Node Renderer ─── */
  const renderOrgNode = (memberId: string, nodeIdx: number) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return null;
    const tier = tierConfig[member.tier];
    const activity = activityData[member.id] || 'red';
    const actCfg = activityConfig[activity];
    const accent = memberAccentColor(member.color);
    const isOnline = activity === 'green';
    return (
      <div
        key={member.id}
        className="tv-org-node rounded-xl border px-5 py-4 text-center relative overflow-hidden"
        style={{
          borderColor: 'rgba(30,38,56,0.5)',
          minWidth: '140px',
          animation: `fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + nodeIdx * 0.06}s both`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
        }}
      >
        {/* Gradient overlay top */}
        <div
          className="tv-gradient-overlay"
          style={{ background: `linear-gradient(90deg, ${accent}66, ${tier.ringColor}33, transparent)` }}
        />
        {/* Activity indicator with online pulse */}
        <div
          className={`w-3 h-3 rounded-full absolute top-2.5 right-2.5 ${isOnline ? 'tv-online-pulse' : 'tv-status-dot-inactive'}`}
          style={{ backgroundColor: actCfg.color, boxShadow: `0 0 8px ${actCfg.color}88` }}
          title={actCfg.label}
        />
        <div className="relative inline-flex mx-auto mb-2">
          <div
            className="tv-avatar-glow w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: avatarGradient(member.color),
              color: '#0b0d14',
              boxShadow: `0 0 0 2.5px #0b0d14, 0 0 0 4.5px ${tier.ringColor}77, 0 0 16px ${accent}22`,
            }}
          >
            {member.avatar}
          </div>
        </div>
        <div className="text-xs font-semibold text-text-primary truncate">{member.name.split(' ')[0]}</div>
        <div className="text-[10px] text-text-muted truncate mt-0.5">{member.shortRole}</div>
        <span
          className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1.5 tv-badge-hover"
          style={{
            background: tier.gradientBadge,
            color: tier.text,
            border: `1px solid ${tier.border}`,
            boxShadow: `0 1px 3px ${tier.border}`,
          }}
        >
          {React.createElement(tier.icon, { size: 8 })}
          {tier.label}
        </span>
      </div>
    );
  };

  /* ─── Hours progress bar max ─── */
  const maxHoursDisplay = 40;

  return (
    <div className="space-y-6">
      {/* ── Injected Styles ── */}
      <style>{teamViewStyles}</style>

      {/* ── Header ── */}
      <div
        className="noise-overlay dot-pattern"
        style={{
          animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0s both',
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight text-glow">
            <span className="gradient-text">Steward Team</span>
          </h1>
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full tv-badge-hover"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(232, 180, 76, 0.1))',
              color: '#d4a574',
              border: '1px solid rgba(212, 165, 116, 0.2)',
              boxShadow: '0 1px 4px rgba(212, 165, 116, 0.1)',
            }}
          >
            <Users size={13} />
            {teamMembers.length} members
          </span>
        </div>
        <p className="text-text-secondary text-sm" style={{ maxWidth: '480px' }}>
          The stewards powering Frequency&apos;s mission across all nodes and functions.
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div
        style={{
          animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.06s both',
        }}
      >
        <div
          className="tv-search-input flex items-center gap-3 rounded-xl border px-5 py-3 card-premium"
          style={{
            backgroundColor: 'rgba(19, 23, 32, 0.8)',
            backdropFilter: 'blur(16px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
            borderColor: 'rgba(30,38,56,0.5)',
          }}
        >
          <Search size={16} className="tv-search-icon text-text-muted flex-shrink-0" style={{ transition: 'color 0.3s ease' }} />
          <input
            type="text"
            placeholder="Search by name, role, domain, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full"
            style={{ caretColor: '#d4a574' }}
          />
          {searchQuery && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: filtered.length > 0 ? 'rgba(107, 143, 113, 0.15)' : 'rgba(224, 96, 96, 0.15)',
                  color: filtered.length > 0 ? '#6b8f71' : '#e06060',
                }}
              >
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md"
                style={{
                  color: '#d4a574',
                  backgroundColor: 'rgba(212, 165, 116, 0.1)',
                  border: '1px solid rgba(212, 165, 116, 0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={10} />
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Team Stats Summary ── */}
      <div
        style={{
          animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both',
        }}
      >
        <div className="tv-section-header flex items-center gap-2 mb-4" style={{ '--header-color': 'rgba(212,165,116,0.35)' } as React.CSSProperties}>
          <BarChart3 size={14} style={{ color: '#d4a574', opacity: 0.7 }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a09888' }}>
            Team Overview
          </span>
        </div>
        <div
          className="tv-stats-header rounded-xl border p-5 relative overflow-hidden card-stat card-premium"
          style={{ borderColor: 'rgba(30,38,56,0.5)' }}
        >
          {/* Subtle gradient background for stats */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 20% 0%, rgba(212,165,116,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.03) 0%, transparent 60%)',
            }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 relative">
            {/* Total Members */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Users size={13} style={{ color: '#d4a574' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#d4a574' }}>
                  Total
                </span>
              </div>
              <div
                className="text-2xl font-bold text-text-primary tv-stat-number"
                style={{ animationDelay: '0.3s' }}
              >
                {totalMembers}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">team members</div>
            </div>

            {/* Avg Hours */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Clock size={13} style={{ color: '#8b5cf6' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>
                  Avg Hours
                </span>
              </div>
              <div
                className="text-2xl font-bold text-text-primary tv-stat-number"
                style={{ animationDelay: '0.4s' }}
              >
                {avgHoursPerWeek}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">hrs/week average</div>
            </div>

            {/* Capacity */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp size={13} style={{ color: '#34d399' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#34d399' }}>
                  Capacity
                </span>
              </div>
              <div
                className="text-2xl font-bold text-text-primary tv-stat-number"
                style={{ animationDelay: '0.5s' }}
              >
                {avgCapacity}%
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">avg utilization</div>
            </div>

            {/* At Risk */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle size={13} style={{ color: '#e06060' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#e06060' }}>
                  At Risk
                </span>
              </div>
              <div
                className="text-2xl font-bold tv-stat-number"
                style={{ color: atRiskCount > 0 ? '#e06060' : '#6b8f71', animationDelay: '0.6s' }}
              >
                {atRiskCount}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">{atRiskCount === 1 ? 'member' : 'members'} overloaded</div>
            </div>
          </div>

          {/* ── Gradient Separator ── */}
          <div className="tv-separator mt-5 mb-4" />

          {/* ── Tier Distribution Bar ── */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Tier Distribution</span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
              <div
                className="rounded-l-full transition-all"
                style={{
                  width: `${(coreTeamCount / totalMembers) * 100}%`,
                  backgroundColor: '#d4a574',
                }}
                title={`Core Team: ${coreTeamCount}`}
              />
              <div
                className="transition-all"
                style={{
                  width: `${(boardCount / totalMembers) * 100}%`,
                  backgroundColor: '#8b5cf6',
                }}
                title={`Board: ${boardCount}`}
              />
              <div
                className="transition-all"
                style={{
                  width: `${(nodeLeadCount / totalMembers) * 100}%`,
                  backgroundColor: '#34d399',
                }}
                title={`Node Leads: ${nodeLeadCount}`}
              />
              <div
                className="rounded-r-full transition-all"
                style={{
                  width: `${(memberCount / totalMembers) * 100}%`,
                  backgroundColor: '#38bdf8',
                }}
                title={`Members: ${memberCount}`}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d4a574' }} />
                <span className="text-[10px] text-text-secondary">Core Team <span className="text-text-muted font-mono">{coreTeamCount}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                <span className="text-[10px] text-text-secondary">Board <span className="text-text-muted font-mono">{boardCount}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#34d399' }} />
                <span className="text-[10px] text-text-secondary">Node Leads <span className="text-text-muted font-mono">{nodeLeadCount}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#38bdf8' }} />
                <span className="text-[10px] text-text-secondary">Members <span className="text-text-muted font-mono">{memberCount}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Capacity Breakdown ── */}
      <div
        style={{
          animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both',
        }}
      >
        <div className="tv-section-header flex items-center gap-2 mb-4" style={{ '--header-color': 'rgba(139,92,246,0.3)' } as React.CSSProperties}>
          <Activity size={14} style={{ color: '#8b5cf6', opacity: 0.7 }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a09888' }}>
            Capacity Breakdown
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['overloaded', 'high', 'balanced', 'available'] as const).map((trendKey, tIdx) => {
            const cfg = trendConfig[trendKey];
            const count = Object.values(capacityData).filter((c) => c.trend === trendKey).length;
            return (
              <div
                key={trendKey}
                className="tv-capacity-card rounded-lg border px-4 py-3"
                style={{
                  backgroundColor: cfg.bg,
                  borderColor: `${cfg.color}22`,
                  animation: `fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.2 + tIdx * 0.06}s both`,
                }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: cfg.color }}>
                  {cfg.label}
                </div>
                <div className="text-2xl font-bold" style={{ color: cfg.color }}>
                  {count}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  {count === 1 ? 'member' : 'members'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── View Toggle + Filter Tabs ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3"
        style={{
          animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.24s both',
        }}
      >
        {/* View Mode Toggle */}
        <div
          className="flex items-center gap-1 rounded-lg border p-1"
          style={{
            backgroundColor: 'rgba(19, 23, 32, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderColor: 'rgba(30,38,56,0.5)',
          }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className="tv-view-toggle-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
            style={{
              backgroundColor: viewMode === 'grid' ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
              color: viewMode === 'grid' ? '#d4a574' : '#6b6358',
            }}
          >
            <LayoutGrid size={13} />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="tv-view-toggle-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
            style={{
              backgroundColor: viewMode === 'list' ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
              color: viewMode === 'list' ? '#d4a574' : '#6b6358',
            }}
          >
            <List size={13} />
            List
          </button>
          <button
            onClick={() => setViewMode('org-chart')}
            className="tv-view-toggle-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
            style={{
              backgroundColor: viewMode === 'org-chart' ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
              color: viewMode === 'org-chart' ? '#d4a574' : '#6b6358',
            }}
          >
            <GitBranch size={13} />
            Org Chart
          </button>
        </div>

        {/* Compare Mode Toggle */}
        <button
          onClick={() => {
            if (compareMode) resetCompare();
            else setCompareMode(true);
          }}
          className="tv-view-toggle-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: compareMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(19, 23, 32, 0.8)',
            color: compareMode ? '#8b5cf6' : '#6b6358',
            border: `1px solid ${compareMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(30,38,56,0.5)'}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'all 0.25s ease',
          }}
        >
          <GitCompare size={13} />
          {compareMode ? 'Exit Compare' : 'Compare'}
          {compareMode && compareSelection.length > 0 && (
            <span
              className="text-[10px] font-mono px-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}
            >
              {compareSelection.length}/2
            </span>
          )}
        </button>

        {/* Tier Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.key;
            const count =
              tab.key === 'all'
                ? teamMembers.length
                : teamMembers.filter((m) => m.tier === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 relative ${isActive ? 'tv-filter-active' : ''}`}
                style={{
                  backgroundColor: isActive ? 'rgba(212, 165, 116, 0.12)' : 'rgba(19, 23, 32, 0.8)',
                  color: isActive ? '#d4a574' : '#a09888',
                  border: `1px solid ${isActive ? 'rgba(212, 165, 116, 0.25)' : 'rgba(30,38,56,0.5)'}`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                {tab.label}
                <span
                  className="text-[11px] font-mono px-1.5 py-0 rounded-full"
                  style={{
                    backgroundColor: isActive
                      ? 'rgba(212, 165, 116, 0.2)'
                      : '#1c2230',
                    color: isActive ? '#d4a574' : '#6b6358',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Org Chart View ── */}
      {viewMode === 'org-chart' && (
        <div
          style={{
            animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both',
          }}
        >
          {orgChartLevels.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl border relative overflow-hidden"
              style={{
                backgroundColor: 'rgba(19, 23, 32, 0.8)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderColor: 'rgba(30,38,56,0.5)',
              }}
            >
              <div className="tv-empty-float">
                <GitBranch size={40} className="mx-auto mb-4" style={{ color: 'rgba(212,165,116,0.3)' }} />
              </div>
              <p className="text-sm text-text-secondary">
                No org structure defined
              </p>
              <div
                className="tv-empty-glow mx-auto mt-4"
                style={{
                  width: '60px',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, rgba(212,165,116,0.4), transparent)',
                  borderRadius: '1px',
                }}
              />
            </div>
          ) : (
          <div className="flex flex-col items-center gap-0 relative">
            {orgChartLevels.map((level, levelIdx) => {
              const tierColor = levelIdx === 0 ? '#d4a574' : levelIdx === 1 ? '#8b5cf6' : '#34d399';
              return (
              <React.Fragment key={level.label}>
                {/* Animated SVG vertical connector */}
                {levelIdx > 0 && (
                  <div className="relative flex items-center justify-center w-full" style={{ height: '32px' }}>
                    <svg width="100%" height="32" className="absolute inset-0" style={{ overflow: 'visible' }}>
                      {/* Central vertical line with glow */}
                      <line
                        x1="50%" y1="0" x2="50%" y2="32"
                        stroke={tierColor}
                        strokeWidth="1.5"
                        className="tv-org-line"
                        style={{ animationDelay: `${levelIdx * 0.3}s`, filter: `drop-shadow(0 0 4px ${tierColor}44)` }}
                      />
                      {/* Animated dot traveling down */}
                      <circle r="2.5" fill={tierColor} opacity="0.7">
                        <animateMotion
                          dur="3s"
                          repeatCount="indefinite"
                          path={`M ${0},0 L ${0},32`}
                          begin={`${levelIdx * 0.5}s`}
                        />
                      </circle>
                    </svg>
                  </div>
                )}

                {/* Level label with tier color accent */}
                <div className="mb-3 relative">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full"
                    style={{
                      backgroundColor: `${tierColor}12`,
                      color: tierColor,
                      border: `1px solid ${tierColor}25`,
                      boxShadow: `0 0 12px ${tierColor}08`,
                    }}
                  >
                    {level.label}
                  </span>
                </div>

                {/* SVG horizontal connector bar for multi-member levels */}
                {level.members.length > 1 && (
                  <div className="relative flex items-center justify-center w-full mb-1" style={{ height: '20px' }}>
                    <svg width="100%" height="20" className="absolute inset-0" style={{ overflow: 'visible' }}>
                      {/* Horizontal line */}
                      <line
                        x1={`calc(50% - ${(level.members.length - 1) * 42}px)`}
                        y1="2"
                        x2={`calc(50% + ${(level.members.length - 1) * 42}px)`}
                        y2="2"
                        stroke={tierColor}
                        strokeWidth="1"
                        opacity="0.35"
                        style={{ filter: `drop-shadow(0 0 3px ${tierColor}33)` }}
                      />
                      {/* Vertical drops to each member */}
                      {level.members.map((_, mIdx) => {
                        const xPos = `calc(50% + ${(mIdx - (level.members.length - 1) / 2) * 84}px)`;
                        return (
                          <line
                            key={mIdx}
                            x1={xPos} y1="2"
                            x2={xPos} y2="20"
                            stroke={tierColor}
                            strokeWidth="1"
                            opacity="0.35"
                            className="tv-org-line"
                            style={{ animationDelay: `${mIdx * 0.15}s`, filter: `drop-shadow(0 0 3px ${tierColor}33)` }}
                          />
                        );
                      })}
                      {/* Node dots at intersections */}
                      {level.members.map((_, mIdx) => {
                        const cx = `calc(50% + ${(mIdx - (level.members.length - 1) / 2) * 84}px)`;
                        return (
                          <circle
                            key={`dot-${mIdx}`}
                            cx={cx} cy="2" r="2.5"
                            fill={tierColor}
                            opacity="0.5"
                          />
                        );
                      })}
                    </svg>
                  </div>
                )}

                {/* Member nodes */}
                <div className="flex flex-wrap justify-center gap-4">
                  {level.members.map((memberId, mIdx) => renderOrgNode(memberId, levelIdx * 3 + mIdx))}
                </div>
              </React.Fragment>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {/* List header */}
          <div
            className="team-list-header grid items-center gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted"
            style={{
              animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both',
            }}
          >
            <span>Member</span>
            <span>Tier</span>
            <span className="team-list-col-hide-mobile">Status</span>
            <span className="team-list-col-hide-mobile">Hours / Capacity</span>
            <span className="team-list-col-hide-mobile">Activity</span>
          </div>

          {filtered.map((member, i) => {
            const tier = tierConfig[member.tier];
            const status = statusConfig[member.status];
            const cap = capacityData[member.id];
            const activity = activityData[member.id] || 'red';
            const actCfg = activityConfig[activity];
            const accent = memberAccentColor(member.color);
            const isHovered = hoveredCardId === member.id;
            const hoursNum = parseHoursToNumber(member.hoursPerWeek);
            const hoursPct = Math.min((hoursNum / maxHoursDisplay) * 100, 100);
            const isOnline = activity === 'green';

            return (
              <div
                key={member.id}
                className="tv-list-row-glass team-list-row grid items-center gap-4 rounded-xl border px-4 py-3 relative overflow-hidden card-interactive"
                style={{
                  borderColor: isHovered ? `${accent}44` : 'rgba(30,38,56,0.5)',
                  boxShadow: isHovered ? `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)` : 'inset 0 1px 0 rgba(255,255,255,0.02)',
                  animation: `fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.32 + i * 0.06}s both`,
                }}
                onMouseEnter={() => setHoveredCardId(member.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                {/* Color-coded left accent line */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-[3px] rounded-l-xl"
                  style={{
                    background: isHovered ? `linear-gradient(180deg, ${accent}, ${accent}44)` : `linear-gradient(180deg, ${accent}44, transparent)`,
                    transition: 'background 0.3s ease',
                  }}
                />
                {/* Name + Role */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div
                      className="tv-avatar-glow w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: avatarGradient(member.color),
                        color: '#0b0d14',
                        boxShadow: isHovered
                          ? `0 0 0 2px #0b0d14, 0 0 0 4px ${tier.ringColor}88, 0 0 12px ${accent}33`
                          : `0 0 0 2px #0b0d14, 0 0 0 3.5px ${tier.ringColor}55`,
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isOnline ? 'tv-online-pulse' : 'tv-status-dot-inactive'}`}
                      style={{
                        backgroundColor: actCfg.color,
                        borderColor: 'rgba(19, 23, 32, 0.9)',
                        boxShadow: `0 0 6px ${actCfg.color}88`,
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate">
                      <HighlightedText text={member.name} query={searchQuery} />
                    </div>
                    <div className="text-[11px] text-text-muted truncate">
                      <HighlightedText text={member.shortRole} query={searchQuery} />
                    </div>
                  </div>
                </div>

                {/* Tier */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full tv-badge-hover ${member.tier === 'core-team' ? 'tv-badge-shimmer' : ''}`}
                    style={{
                      background: tier.gradientBadge,
                      color: tier.text,
                      border: `1px solid ${tier.border}`,
                      boxShadow: `0 1px 3px ${tier.border}`,
                    }}
                  >
                    {React.createElement(tier.icon, { size: 9 })}
                    {tier.label}
                  </span>
                </div>

                {/* Status */}
                <div className="team-list-col-hide-mobile">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: status.bg, color: status.text, border: `1px solid ${status.text}22` }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Hours + capacity bar */}
                <div className="team-list-col-hide-mobile flex items-center gap-2.5">
                  <span className="text-[11px] text-text-muted font-medium whitespace-nowrap w-14">
                    {member.hoursPerWeek || '--'} hrs
                  </span>
                  <div className="flex-1">
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: '#1c2230' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${hoursPct}%`,
                          background: `linear-gradient(90deg, ${accent}cc, ${accent})`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="team-list-col-hide-mobile flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: actCfg.color, boxShadow: `0 0 6px ${actCfg.color}88` }}
                  />
                  <span className="text-[10px] text-text-secondary truncate">{actCfg.label}</span>
                </div>

                {/* Hover tooltip for role description */}
                {isHovered && (
                  <div
                    className="text-[11px] text-text-secondary leading-relaxed pt-1 pb-0.5"
                    style={{
                      gridColumn: '1 / -1',
                      animation: 'fadeSlideUp 0.2s ease-out both',
                      borderLeft: `2px solid ${accent}44`,
                      paddingLeft: '10px',
                      marginLeft: '4px',
                    }}
                  >
                    {member.roleOneSentence}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Compare Mode Bar ── */}
      {compareMode && (
        <div
          className="tv-compare-bar rounded-xl border p-4 flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.06)',
            borderColor: 'rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3">
            <GitCompare size={16} style={{ color: '#8b5cf6' }} />
            <span className="text-sm font-medium" style={{ color: '#a78bfa' }}>
              Select {2 - compareSelection.length} member{compareSelection.length === 1 ? '' : 's'} to compare
            </span>
            {compareSelection.length > 0 && (
              <div className="flex items-center gap-2">
                {compareSelection.map((id) => {
                  const m = teamMembers.find((x) => x.id === id);
                  if (!m) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        color: '#a78bfa',
                        border: '1px solid rgba(139, 92, 246, 0.25)',
                      }}
                    >
                      {m.avatar} {m.name.split(' ')[0]}
                      <button onClick={() => toggleCompareSelect(id)} className="hover:text-white ml-0.5">
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
                {compareSelection.length === 2 && (
                  <ArrowRight size={14} style={{ color: '#8b5cf6', opacity: 0.5 }} />
                )}
              </div>
            )}
          </div>
          <button
            onClick={resetCompare}
            className="text-[11px] font-medium px-3 py-1 rounded-md"
            style={{ color: '#6b6358', backgroundColor: 'rgba(30,38,56,0.5)' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Comparison Panel ── */}
      {compareMode && compareSelection.length === 2 && (() => {
        const [m1, m2] = compareSelection.map((id) => teamMembers.find((x) => x.id === id)).filter(Boolean) as TeamMember[];
        if (!m1 || !m2) return null;
        const t1 = tierConfig[m1.tier]; const t2 = tierConfig[m2.tier];
        const a1 = memberAccentColor(m1.color); const a2 = memberAccentColor(m2.color);
        const c1 = capacityData[m1.id]; const c2 = capacityData[m2.id];
        const h1 = parseHoursToNumber(m1.hoursPerWeek); const h2 = parseHoursToNumber(m2.hoursPerWeek);
        const s1 = skillsMap[m1.id] || []; const s2 = skillsMap[m2.id] || [];
        const spark1 = generateSparkline(m1.id); const spark2 = generateSparkline(m2.id);

        return (
          <div
            className="tv-compare-panel rounded-2xl border p-6 relative overflow-hidden card-premium"
            style={{
              backgroundColor: 'rgba(19, 23, 32, 0.85)',
              borderColor: 'rgba(139, 92, 246, 0.2)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 25% 0%, ${a1}06, transparent 50%), radial-gradient(ellipse at 75% 0%, ${a2}06, transparent 50%)` }}
            />
            <div className="text-center mb-5 relative">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>
                Member Comparison
              </span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 relative">
              {/* Member 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold"
                  style={{ background: avatarGradient(m1.color), color: '#0b0d14', boxShadow: `0 0 0 3px #0b0d14, 0 0 0 5px ${t1.ringColor}77` }}
                >{m1.avatar}</div>
                <div className="text-sm font-semibold text-text-primary">{m1.name}</div>
                <div className="text-[11px] text-text-muted mb-3">{m1.shortRole}</div>
              </div>
              {/* VS separator */}
              <div className="flex items-start pt-6">
                <span className="text-lg font-bold px-3 py-1 rounded-full" style={{ color: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)' }}>vs</span>
              </div>
              {/* Member 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold"
                  style={{ background: avatarGradient(m2.color), color: '#0b0d14', boxShadow: `0 0 0 3px #0b0d14, 0 0 0 5px ${t2.ringColor}77` }}
                >{m2.avatar}</div>
                <div className="text-sm font-semibold text-text-primary">{m2.name}</div>
                <div className="text-[11px] text-text-muted mb-3">{m2.shortRole}</div>
              </div>
            </div>
            {/* Stats comparison rows */}
            <div className="space-y-3 mt-4 relative">
              {/* Hours */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                <div className="text-right">
                  <span className="text-sm font-bold text-text-primary">{m1.hoursPerWeek || '--'}</span>
                  <span className="text-[10px] text-text-muted ml-1">hrs</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted w-20 text-center">Hours</span>
                <div>
                  <span className="text-sm font-bold text-text-primary">{m2.hoursPerWeek || '--'}</span>
                  <span className="text-[10px] text-text-muted ml-1">hrs</span>
                </div>
              </div>
              {/* Capacity */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                <div className="text-right">
                  <span className="text-sm font-bold" style={{ color: c1 ? trendConfig[c1.trend].color : '#a09888' }}>
                    {c1 ? `${Math.round((c1.currentLoad / c1.maxCapacity) * 100)}%` : '--'}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted w-20 text-center">Capacity</span>
                <div>
                  <span className="text-sm font-bold" style={{ color: c2 ? trendConfig[c2.trend].color : '#a09888' }}>
                    {c2 ? `${Math.round((c2.currentLoad / c2.maxCapacity) * 100)}%` : '--'}
                  </span>
                </div>
              </div>
              {/* 7-Day Trend sparklines */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                <div className="flex justify-end"><KpiSparkline data={spark1} color={a1} width={72} height={24} /></div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted w-20 text-center">7-Day</span>
                <div><KpiSparkline data={spark2} color={a2} width={72} height={24} /></div>
              </div>
              {/* Domains */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                <div className="text-right"><span className="text-sm font-bold text-text-primary">{m1.domains.length}</span></div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted w-20 text-center">Domains</span>
                <div><span className="text-sm font-bold text-text-primary">{m2.domains.length}</span></div>
              </div>
              {/* Skills */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
                <div className="flex flex-wrap gap-1 justify-end">
                  {s1.map((s) => (
                    <span key={s} className="text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${a1}15`, color: a1, border: `1px solid ${a1}25` }}>{s}</span>
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted w-20 text-center pt-0.5">Skills</span>
                <div className="flex flex-wrap gap-1">
                  {s2.map((s) => (
                    <span key={s} className="text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${a2}15`, color: a2, border: `1px solid ${a2}25` }}>{s}</span>
                  ))}
                </div>
              </div>
              {/* KPIs count */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                <div className="text-right"><span className="text-sm font-bold text-text-primary">{m1.kpis.length}</span></div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted w-20 text-center">KPIs</span>
                <div><span className="text-sm font-bold text-text-primary">{m2.kpis.length}</span></div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Grid View -- Enhanced Cards with Flip ── */}
      {viewMode === 'grid' && (
        <div ref={gridRef} className="tv-parallax-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member, i) => {
            const tier = tierConfig[member.tier];
            const status = statusConfig[member.status];
            const isExpanded = expandedId === member.id;
            const cap = capacityData[member.id];
            const memberSkills = skillsMap[member.id] || [];
            const activity = activityData[member.id] || 'red';
            const actCfg = activityConfig[activity];
            const accent = memberAccentColor(member.color);
            const isHovered = hoveredCardId === member.id;
            const hoursNum = parseHoursToNumber(member.hoursPerWeek);
            const hoursPct = Math.min((hoursNum / maxHoursDisplay) * 100, 100);
            const isOnline = activity === 'green';
            const isFlipped = flippedCards.has(member.id);
            const isCompareSelected = compareSelection.includes(member.id);
            const sparkData = generateSparkline(member.id);

            return (
              <div
                key={member.id}
                className={`tv-flip-container ${isCompareSelected ? 'tv-compare-selected' : ''}`}
                style={{
                  animation: `fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.3 + i * 0.06}s both`,
                }}
                onMouseEnter={() => setHoveredCardId(member.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                <div className={`tv-flip-inner ${isFlipped ? 'tv-flipped' : ''}`}>
                  {/* ═══ FRONT FACE ═══ */}
                  <div
                    className="tv-flip-front tv-card-glass glow-card rounded-2xl border relative overflow-hidden card-interactive"
                    style={{
                      '--card-glow': `${accent}0d`,
                      borderColor: isHovered
                        ? `${accent}55`
                        : isExpanded
                        ? tier.border
                        : 'rgba(30,38,56,0.5)',
                      boxShadow: isHovered
                        ? `0 16px 48px rgba(0,0,0,0.35), 0 0 35px ${accent}0d, inset 0 1px 0 rgba(255,255,255,0.04)`
                        : 'inset 0 1px 0 rgba(255,255,255,0.02)',
                    } as React.CSSProperties}
                  >
                {/* ── Color-coded gradient top border ── */}
                <div
                  className="tv-gradient-overlay"
                  style={{
                    background: `linear-gradient(90deg, ${accent}88, ${tier.ringColor}55, transparent)`,
                  }}
                />

                {/* ── Subtle glassmorphism gradient wash ── */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isHovered
                      ? `radial-gradient(ellipse at 30% 0%, ${accent}0c 0%, transparent 55%), radial-gradient(ellipse at 70% 100%, ${tier.ringColor}06 0%, transparent 50%)`
                      : `radial-gradient(ellipse at 50% 0%, ${accent}04 0%, transparent 60%)`,
                    transition: 'background 0.5s ease',
                  }}
                />

                {/* ── Card Header ── */}
                <div className="p-5 pb-0 relative">
                  <div className="flex items-start gap-4">
                    {/* Avatar with glow ring + online indicator */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="tv-avatar-glow w-14 h-14 rounded-full flex items-center justify-center text-base font-bold"
                        style={{
                          background: avatarGradient(member.color),
                          color: '#0b0d14',
                          letterSpacing: '0.02em',
                          boxShadow: isHovered
                            ? `0 0 0 3px #0b0d14, 0 0 0 5.5px ${tier.ringColor}aa, 0 0 24px ${accent}44, 0 4px 12px rgba(0,0,0,0.3)`
                            : `0 0 0 3px #0b0d14, 0 0 0 5px ${tier.ringColor}55, 0 2px 8px rgba(0,0,0,0.2)`,
                        }}
                      >
                        {member.avatar}
                      </div>
                      {/* Online status indicator with enhanced pulse */}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[2.5px] ${isOnline ? 'tv-online-pulse' : 'tv-status-dot-inactive'}`}
                        style={{
                          backgroundColor: actCfg.color,
                          borderColor: 'rgba(19, 23, 32, 0.95)',
                          boxShadow: `0 0 8px ${actCfg.color}88`,
                        }}
                        title={isOnline ? 'Online now' : actCfg.label}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[15px] font-semibold text-text-primary truncate">
                          <HighlightedText text={member.name} query={searchQuery} />
                        </h3>
                        {isOnline && (
                          <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                            ONLINE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 truncate">
                        <HighlightedText text={member.role} query={searchQuery} />
                      </p>
                      {/* Tier badge - premium pill style */}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full tv-badge-hover ${member.tier === 'core-team' ? 'tv-badge-shimmer' : ''}`}
                          style={{
                            background: member.tier === 'core-team'
                              ? 'linear-gradient(135deg, rgba(212,165,116,0.28), rgba(232,180,76,0.18), rgba(212,165,116,0.28))'
                              : tier.gradientBadge,
                            backgroundSize: member.tier === 'core-team' ? '200% auto' : undefined,
                            color: tier.text,
                            border: `1px solid ${tier.border}`,
                            boxShadow: `0 1px 4px ${tier.border}`,
                          }}
                        >
                          {React.createElement(tier.icon, { size: 10 })}
                          {tier.label}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: status.bg, color: status.text, border: `1px solid ${status.text}22` }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hours Progress + Quick Actions */}
                  <div className="flex items-center justify-between mt-3.5">
                    <div className="flex items-center gap-3">
                      {member.hoursPerWeek && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-text-muted flex items-center gap-1">
                            <Clock size={11} style={{ color: accent, opacity: 0.7 }} />
                            {member.hoursPerWeek} hrs/wk
                          </span>
                          {/* Mini hours progress bar - animated */}
                          <div
                            className="w-14 h-1.5 rounded-full overflow-hidden"
                            style={{ backgroundColor: '#1c2230' }}
                            title={`${member.hoursPerWeek} hrs/week`}
                          >
                            <AnimatedBar
                              targetWidth={hoursPct}
                              color={accent}
                              gradient={`linear-gradient(90deg, ${accent}cc, ${accent})`}
                              glowColor={`${accent}44`}
                              isOverloaded={false}
                              delay={600 + i * 80}
                            />
                          </div>
                        </div>
                      )}
                      {/* Mini sparkline */}
                      <KpiSparkline data={sparkData} color={accent} width={48} height={16} />
                    </div>
                    {/* Quick Contact Actions */}
                    <div className="flex items-center gap-0.5">
                      {compareMode ? (
                        <button
                          className="tv-action-btn p-1.5 rounded-lg relative"
                          title={isCompareSelected ? 'Remove from compare' : 'Add to compare'}
                          style={{ color: isCompareSelected ? '#8b5cf6' : '#6b6358' }}
                          onClick={(e) => { e.stopPropagation(); toggleCompareSelect(member.id); }}
                        >
                          <GitCompare size={13} className="relative z-10" />
                        </button>
                      ) : (
                        <>
                      <button
                        className="tv-action-btn p-1.5 rounded-lg relative"
                        title="Send Email"
                        style={{ color: '#6b6358' }}
                        onClick={() => window.open(`mailto:${member.name.toLowerCase().replace(' ', '.')}@frequency.community`)}
                      >
                        <Mail size={13} className="relative z-10" />
                      </button>
                      <button
                        className="tv-action-btn p-1.5 rounded-lg relative"
                        title="Open Chat"
                        style={{ color: '#6b6358' }}
                        onClick={() => onNavigate?.('chat')}
                      >
                        <MessageSquare size={13} className="relative z-10" />
                      </button>
                      <button
                        className="tv-action-btn p-1.5 rounded-lg relative"
                        title="Flip card for details"
                        style={{ color: '#6b6358' }}
                        onClick={(e) => { e.stopPropagation(); toggleFlip(member.id); }}
                      >
                        <RotateCcw size={13} className="relative z-10" />
                      </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Domain Tags with colored dots ── */}
                <div className="px-5 pt-3 relative">
                  <div className="flex flex-wrap gap-1.5">
                    {member.domains.slice(0, isExpanded ? undefined : 3).map((d, j) => (
                      <span
                        key={j}
                        className="tv-domain-tag inline-flex items-center gap-1.5 text-[9px] font-medium px-2.5 py-1 rounded-full cursor-default"
                        style={{
                          backgroundColor: `${accent}14`,
                          color: '#b8a898',
                          border: `1px solid ${accent}22`,
                        }}
                        title={d}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: accent, opacity: 0.7 }}
                        />
                        <HighlightedText text={d.length > 30 ? d.slice(0, 28) + '...' : d} query={searchQuery} />
                      </span>
                    ))}
                    {!isExpanded && member.domains.length > 3 && (
                      <span
                        className="text-[9px] font-medium px-2 py-1 rounded-full"
                        style={{ color: '#6b6358', backgroundColor: 'rgba(30,38,56,0.3)' }}
                      >
                        +{member.domains.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Skill Tags with colored dots ── */}
                {memberSkills.length > 0 && (
                  <div className="px-5 pt-2 relative">
                    <div className="flex flex-wrap gap-1.5">
                      {memberSkills.map((skill, sIdx) => {
                        const sColor = skillColors[sIdx % skillColors.length];
                        return (
                          <span
                            key={skill}
                            className="tv-skill-tag inline-flex items-center gap-1.5 text-[9px] font-semibold px-2.5 py-1 rounded-full cursor-default"
                            style={{
                              backgroundColor: `${sColor}15`,
                              color: sColor,
                              border: `1px solid ${sColor}25`,
                            }}
                            title={skill}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: sColor, opacity: 0.6 }}
                            />
                            <HighlightedText text={skill} query={searchQuery} />
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Hover: Role description reveal ── */}
                {isHovered && !isExpanded && (
                  <div
                    className="px-5 pt-3 relative"
                    style={{ animation: 'fadeSlideUp 0.25s ease-out both' }}
                  >
                    <p className="text-[11px] text-text-secondary leading-relaxed italic"
                      style={{ borderLeft: `2px solid ${accent}44`, paddingLeft: '10px' }}
                    >
                      {member.roleOneSentence}
                    </p>
                  </div>
                )}

                {/* ── Capacity Bar - Animated ── */}
                {(() => {
                  if (!cap) return null;
                  const trend = trendConfig[cap.trend];
                  const pct = Math.min((cap.currentLoad / cap.maxCapacity) * 100, 100);
                  const isOverloaded = cap.trend === 'overloaded';
                  const overflowPct = isOverloaded ? (cap.currentLoad / cap.maxCapacity) * 100 : 0;
                  return (
                    <div className="px-5 pt-3 relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-text-muted font-medium">
                            {cap.currentLoad}/{cap.maxCapacity} hrs
                          </span>
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: trend.bg, color: trend.color, border: `1px solid ${trend.color}22` }}
                          >
                            {trend.label}
                          </span>
                        </div>
                        {isOverloaded && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle size={11} style={{ color: '#e06060' }} />
                            <span className="text-[9px] font-semibold" style={{ color: '#e06060' }}>
                              Over capacity
                            </span>
                          </div>
                        )}
                      </div>
                      <div
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#1c2230' }}
                      >
                        <AnimatedBar
                          targetWidth={isOverloaded ? 100 : pct}
                          color={trend.color}
                          gradient={isOverloaded
                            ? `linear-gradient(90deg, ${trend.color} ${(100 / overflowPct) * 100}%, #ff4040)`
                            : `linear-gradient(90deg, ${trend.color}cc, ${trend.color})`}
                          glowColor={`${trend.color}44`}
                          isOverloaded={isOverloaded}
                          delay={800 + i * 80}
                        />
                      </div>
                      {isOverloaded && (
                        <div className="text-[9px] mt-1" style={{ color: '#e06060' }}>
                          {Math.round(overflowPct)}% of capacity used
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Card Body ── */}
                <div className="px-5 pt-3.5 pb-4 relative">
                  {/* Role description (always visible when expanded) */}
                  {isExpanded && (
                    <p className="text-xs text-text-secondary leading-relaxed mb-3"
                      style={{ borderLeft: `2px solid ${accent}44`, paddingLeft: '10px' }}
                    >
                      {member.roleOneSentence}
                    </p>
                  )}

                  {/* KPIs with sparklines */}
                  <div className="mb-3">
                    <div className="tv-section-header flex items-center justify-between mb-2" style={{ '--header-color': `${tier.text}44`, paddingBottom: '6px' } as React.CSSProperties}>
                      <div className="flex items-center gap-1.5">
                        <Target size={11} style={{ color: tier.text, opacity: 0.7 }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#a09888' }}>
                          KPIs
                        </span>
                      </div>
                      <KpiSparkline data={sparkData} color={tier.text} width={56} height={18} />
                    </div>
                    <div className="space-y-1.5">
                      {member.kpis.slice(0, isExpanded ? undefined : 3).map((kpi, j) => (
                        <div key={j} className="tv-kpi-item flex items-start gap-2 text-[11px]">
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: tier.text, boxShadow: `0 0 4px ${tier.text}44` }}
                          />
                          <span className="text-text-secondary leading-snug">{kpi}</span>
                        </div>
                      ))}
                      {!isExpanded && member.kpis.length > 3 && (
                        <span className="text-[10px] text-text-muted ml-3.5 font-medium">
                          +{member.kpis.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Non-Negotiables */}
                  <div className="mb-3">
                    <div className="tv-section-header flex items-center gap-1.5 mb-2" style={{ '--header-color': 'rgba(224,96,96,0.3)', paddingBottom: '6px' } as React.CSSProperties}>
                      <AlertCircle size={11} style={{ color: '#e06060', opacity: 0.7 }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#a09888' }}>
                        Non-Negotiables
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {member.nonNegotiables
                        .slice(0, isExpanded ? undefined : 2)
                        .map((nn, j) => (
                          <div key={j} className="tv-kpi-item flex items-start gap-2 text-[11px]">
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: '#e06060', boxShadow: '0 0 4px rgba(224,96,96,0.3)' }}
                            />
                            <span className="text-text-muted leading-snug italic">{nn}</span>
                          </div>
                        ))}
                      {!isExpanded && member.nonNegotiables.length > 2 && (
                        <span className="text-[10px] text-text-muted ml-3.5 font-medium">
                          +{member.nonNegotiables.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded extra details */}
                  {isExpanded && (
                    <div
                      className="pt-3 mt-3"
                      style={{
                        borderTop: '1px solid rgba(30,38,56,0.5)',
                        animation: 'fadeSlideUp 0.3s ease-out both',
                      }}
                    >
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <span className="text-text-muted text-[10px]">Tier</span>
                          <div className="text-text-primary font-medium mt-1 flex items-center gap-1.5">
                            {React.createElement(tier.icon, { size: 12, style: { color: tier.text } })}
                            {tier.label}
                          </div>
                        </div>
                        <div>
                          <span className="text-text-muted text-[10px]">Status</span>
                          <div className="text-text-primary font-medium mt-1">{status.label}</div>
                        </div>
                        {member.hoursPerWeek && (
                          <div>
                            <span className="text-text-muted text-[10px]">Hours / Week</span>
                            <div className="text-text-primary font-medium mt-1">
                              {member.hoursPerWeek}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="text-text-muted text-[10px]">Domains</span>
                          <div className="text-text-primary font-medium mt-1">
                            {member.domains.length} areas
                          </div>
                        </div>
                        <div>
                          <span className="text-text-muted text-[10px]">Activity</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: actCfg.color, boxShadow: `0 0 6px ${actCfg.color}66` }}
                            />
                            <span className="text-text-primary font-medium">{actCfg.label}</span>
                          </div>
                        </div>
                        {cap && (
                          <div>
                            <span className="text-text-muted text-[10px]">Capacity</span>
                            <div className="text-text-primary font-medium mt-1">
                              {Math.round((cap.currentLoad / cap.maxCapacity) * 100)}% used
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Expand / Collapse Toggle ── */}
                <button
                  onClick={() => toggleExpand(member.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-[11px] font-medium transition-all relative"
                  style={{
                    borderTop: '1px solid rgba(30,38,56,0.5)',
                    color: isExpanded ? tier.text : '#6b6358',
                    backgroundColor: isExpanded ? `${tier.bg}` : 'transparent',
                  }}
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp size={13} />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown size={13} />
                    </>
                  )}
                </button>
                  </div>

                  {/* ═══ BACK FACE (flipped stats) ═══ */}
                  <div
                    className="tv-flip-back tv-card-glass rounded-2xl border overflow-hidden"
                    style={{
                      '--card-glow': `${accent}0d`,
                      borderColor: `${accent}44`,
                      boxShadow: `0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
                    } as React.CSSProperties}
                  >
                    {/* Gradient top */}
                    <div className="tv-gradient-overlay" style={{ background: `linear-gradient(90deg, ${tier.ringColor}88, ${accent}55, transparent)` }} />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}08, transparent 60%)` }} />

                    <div className="p-5 relative h-full flex flex-col">
                      {/* Back header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ background: avatarGradient(member.color), color: '#0b0d14', boxShadow: `0 0 0 2px #0b0d14, 0 0 0 3.5px ${tier.ringColor}55` }}
                          >{member.avatar}</div>
                          <div>
                            <div className="text-sm font-semibold text-text-primary">{member.name.split(' ')[0]}</div>
                            <div className="text-[10px] text-text-muted">Detailed Stats</div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFlip(member.id); }}
                          className="tv-action-btn p-2 rounded-lg"
                          style={{ color: '#d4a574' }}
                          title="Flip back"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>

                      {/* Detailed stats grid */}
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        {/* Capacity gauge */}
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)' }}>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#a09888' }}>Capacity</div>
                          {cap ? (
                            <>
                              <div className="text-lg font-bold" style={{ color: trendConfig[cap.trend].color }}>
                                {Math.round((cap.currentLoad / cap.maxCapacity) * 100)}%
                              </div>
                              <div className="text-[10px] text-text-muted">{cap.currentLoad}/{cap.maxCapacity} hrs</div>
                              <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: '#1c2230' }}>
                                <AnimatedBar
                                  targetWidth={Math.min((cap.currentLoad / cap.maxCapacity) * 100, 100)}
                                  color={trendConfig[cap.trend].color}
                                  gradient={`linear-gradient(90deg, ${trendConfig[cap.trend].color}cc, ${trendConfig[cap.trend].color})`}
                                  glowColor={`${trendConfig[cap.trend].color}44`}
                                  isOverloaded={cap.trend === 'overloaded'}
                                  delay={300}
                                />
                              </div>
                            </>
                          ) : (
                            <div className="text-text-muted text-[11px]">No data</div>
                          )}
                        </div>

                        {/* 7-Day Trend */}
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)' }}>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#a09888' }}>7-Day Trend</div>
                          <KpiSparkline data={sparkData} color={accent} width={80} height={32} />
                          <div className="text-[10px] text-text-muted mt-1">
                            {sparkData[sparkData.length - 1] >= sparkData[0] ? 'Trending up' : 'Trending down'}
                          </div>
                        </div>

                        {/* Hours */}
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)' }}>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#a09888' }}>Hours/Week</div>
                          <div className="text-lg font-bold text-text-primary">{member.hoursPerWeek || '--'}</div>
                          <div className="text-[10px] text-text-muted">committed</div>
                        </div>

                        {/* Activity */}
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)' }}>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#a09888' }}>Activity</div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isOnline ? 'tv-online-pulse' : ''}`}
                              style={{ backgroundColor: actCfg.color, boxShadow: `0 0 6px ${actCfg.color}88` }}
                            />
                            <span className="text-sm font-semibold" style={{ color: actCfg.color }}>{actCfg.label}</span>
                          </div>
                        </div>

                        {/* Domains */}
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)' }}>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#a09888' }}>Domains</div>
                          <div className="text-lg font-bold text-text-primary">{member.domains.length}</div>
                          <div className="text-[10px] text-text-muted">active areas</div>
                        </div>

                        {/* KPIs */}
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)' }}>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#a09888' }}>KPIs</div>
                          <div className="text-lg font-bold text-text-primary">{member.kpis.length}</div>
                          <div className="text-[10px] text-text-muted">tracked metrics</div>
                        </div>
                      </div>

                      {/* Skills on back */}
                      {memberSkills.length > 0 && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(30,38,56,0.5)' }}>
                          <div className="flex flex-wrap gap-1.5">
                            {memberSkills.map((s, sIdx) => {
                              const sc = skillColors[sIdx % skillColors.length];
                              return (
                                <span key={s} className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: `${sc}15`, color: sc, border: `1px solid ${sc}25` }}
                                >{s}</span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty State ── */}
      {(viewMode === 'grid' || viewMode === 'list') && filtered.length === 0 && (
        <div
          className="text-center py-20 rounded-2xl border relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(19, 23, 32, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(30,38,56,0.5)',
            animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
          }}
        >
          {/* Decorative background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(212,165,116,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.03) 0%, transparent 50%)',
            }}
          />
          <div className="tv-empty-float relative">
            <div className="relative inline-block">
              <UserCheck size={48} className="mx-auto mb-2" style={{ color: 'rgba(212,165,116,0.3)' }} />
              <div className="absolute -top-1 -right-1">
                <Search size={20} style={{ color: 'rgba(139,92,246,0.3)' }} />
              </div>
            </div>
          </div>
          <h3 className="text-base font-semibold text-text-primary relative mt-2 mb-1">
            No results found
          </h3>
          <p className="text-sm text-text-secondary relative max-w-xs mx-auto">
            {searchQuery ? (
              <>No team members match &ldquo;<span style={{ color: '#d4a574' }}>{searchQuery}</span>&rdquo;</>
            ) : (
              <>No team members in the selected filter.</>
            )}
          </p>
          <div
            className="tv-empty-glow mx-auto mt-4"
            style={{
              width: '80px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(212,165,116,0.4), transparent)',
              borderRadius: '1px',
            }}
          />
          <div className="flex items-center justify-center gap-3 mt-6 relative">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
                style={{
                  color: '#d4a574',
                  backgroundColor: 'rgba(212, 165, 116, 0.12)',
                  border: '1px solid rgba(212, 165, 116, 0.2)',
                }}
              >
                <X size={12} />
                Clear search
              </button>
            )}
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
                style={{
                  color: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                <RotateCcw size={12} />
                Show all tiers
              </button>
            )}
            <button
              onClick={() => { setSearchQuery(''); setFilter('all'); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
              style={{
                color: '#f0ebe4',
                backgroundColor: 'rgba(240, 235, 228, 0.08)',
                border: '1px solid rgba(240, 235, 228, 0.15)',
              }}
            >
              <RotateCcw size={12} />
              Reset all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
