'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  Target,
  Scale,
  UserPlus,
  Calendar,
  Megaphone,
  Gem,
  TreePine,
  Globe,
  Network,
  Heart,
  Filter,
  Clock,
  Zap,
  Search,
  Star,
  ChevronDown,
  ChevronRight,
  Link2,
  BarChart3,
  CalendarDays,
  TrendingUp,
  Users,
  Award,
  Share2,
} from 'lucide-react';

// ─── Scoped Keyframes ────────────────────────────────────────────────────────

const actKeyframes = `
@keyframes act-fadeSlideIn {
  0% { opacity: 0; transform: translateY(20px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes act-pulseGlow {
  0%, 100% { box-shadow: 0 0 8px var(--act-glow-color, rgba(212,165,116,0.3)); }
  50% { box-shadow: 0 0 20px var(--act-glow-color, rgba(212,165,116,0.5)); }
}
@keyframes act-timelinePulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
@keyframes act-dotPing {
  0% { transform: scale(1); opacity: 1; }
  75% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
@keyframes act-starBounce {
  0% { transform: scale(1); }
  25% { transform: scale(0.8); }
  50% { transform: scale(1.3) rotate(15deg); }
  75% { transform: scale(0.95) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes act-starFill {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes act-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes act-gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes act-countUp {
  0% { transform: translateY(8px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes act-borderGlow {
  0%, 100% { border-color: rgba(212,165,116,0.08); }
  50% { border-color: rgba(212,165,116,0.2); }
}
@keyframes act-slideReveal {
  0% { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }
  100% { max-height: 600px; opacity: 1; }
}
@keyframes act-cardEnter {
  0% { opacity: 0; transform: translateX(-12px) scale(0.98); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes act-floatIn {
  0% { opacity: 0; transform: translateY(10px); }
  60% { transform: translateY(-2px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes act-ripple {
  0% { box-shadow: 0 0 0 0 var(--act-ripple-color, rgba(212,165,116,0.4)); }
  100% { box-shadow: 0 0 0 12px rgba(212,165,116,0); }
}
`;

// ─── Types ───────────────────────────────────────────────────────────────────

type ActivityType = 'task' | 'okr' | 'governance' | 'member' | 'event' | 'milestone';
type ImpactLevel = 'positive' | 'neutral' | 'concern';
type TimePeriod = 'all' | 'week' | 'month';

interface RelatedItem {
  label: string;
  workstream: string;
  color: string;
}

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  actor: string;
  actorAvatar: string;
  timestamp: string;
  timeAgo: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  impact: ImpactLevel;
  relatedItems: RelatedItem[];
}

// ─── Constants & Config ──────────────────────────────────────────────────────

const BOOKMARKS_KEY = 'frequency-bookmarked-activities';
const EASE_SMOOTH = 'cubic-bezier(0.16, 1, 0.3, 1)';

const impactConfig: Record<ImpactLevel, { dot: string; label: string; glow: string; border: string }> = {
  positive: { dot: '#6b8f71', label: 'Positive', glow: 'rgba(107, 143, 113, 0.3)', border: 'rgba(107, 143, 113, 0.35)' },
  neutral: { dot: '#e8b44c', label: 'Neutral', glow: 'rgba(232, 180, 76, 0.3)', border: 'rgba(232, 180, 76, 0.3)' },
  concern: { dot: '#ef4444', label: 'Concern', glow: 'rgba(239, 68, 68, 0.3)', border: 'rgba(239, 68, 68, 0.35)' },
};

const activityData: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'governance',
    title: 'Teal Governance Model Adopted',
    description: 'Wisdom Council moved from Green-stage consensus to Teal governance with responsibility-weighted voice.',
    actor: 'Wisdom Council',
    actorAvatar: 'WC',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    icon: Scale,
    iconColor: '#d4a574',
    iconBg: 'rgba(212, 165, 116, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: 'Governance Framework OKR', workstream: 'OKRs', color: '#8b5cf6' },
      { label: 'Node Lead Accountability', workstream: 'Governance', color: '#d4a574' },
    ],
  },
  {
    id: 'act-2',
    type: 'task',
    title: 'Monthly Communication Cadence Established',
    description: 'Sian completed the member communication cadence setup ahead of schedule.',
    actor: 'Sian Hodges',
    actorAvatar: 'SH',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    icon: CheckCircle2,
    iconColor: '#6b8f71',
    iconBg: 'rgba(107, 143, 113, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: 'Community Engagement Tasks', workstream: 'Tasks', color: '#6b8f71' },
      { label: '144 Well-Stewards Target', workstream: 'OKRs', color: '#8b5cf6' },
    ],
  },
  {
    id: 'act-3',
    type: 'okr',
    title: 'OKR Progress: 144 Well-Stewards',
    description: 'Community membership objective updated to 45% progress. On track for H1 2026 target.',
    actor: 'James Hodges',
    actorAvatar: 'JH',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    icon: Target,
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139, 92, 246, 0.1)',
    impact: 'neutral',
    relatedItems: [
      { label: 'New Prospect Pipeline', workstream: 'Members', color: '#38bdf8' },
      { label: 'Enrollment Flow', workstream: 'Tasks', color: '#6b8f71' },
    ],
  },
  {
    id: 'act-4',
    type: 'task',
    title: 'Bi-weekly Node Sync Calls Established',
    description: 'Fairman completed setup of regular coordination calls across all active nodes.',
    actor: 'Alex James Fairman',
    actorAvatar: 'AF',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    icon: CheckCircle2,
    iconColor: '#6b8f71',
    iconBg: 'rgba(107, 143, 113, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: 'Node Coordination Layer', workstream: 'Nodes', color: '#a855f7' },
      { label: 'Map Node MVP Specs', workstream: 'Tasks', color: '#6b8f71' },
    ],
  },
  {
    id: 'act-5',
    type: 'member',
    title: 'New Prospect Pipeline Growing',
    description: 'Maximillian is conducting essence interviews with 15 new prospects for Blue Spirit enrollment.',
    actor: 'Maximillian',
    actorAvatar: 'MX',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    icon: UserPlus,
    iconColor: '#38bdf8',
    iconBg: 'rgba(56, 189, 248, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: '144 Well-Stewards OKR', workstream: 'OKRs', color: '#8b5cf6' },
      { label: 'Blue Spirit 6.0 Event', workstream: 'Events', color: '#f97316' },
    ],
  },
  {
    id: 'act-6',
    type: 'milestone',
    title: 'Megaphone Node: Studio Session Complete',
    description: 'Raamayan wrapped a powerful Anthem studio session. Cultural heartbeat of the movement is forming.',
    actor: 'Raamayan Ananda',
    actorAvatar: 'RA',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    icon: Megaphone,
    iconColor: '#f97316',
    iconBg: 'rgba(249, 115, 22, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: 'Megaphone Node Workstream', workstream: 'Nodes', color: '#a855f7' },
      { label: 'Cultural Identity Milestone', workstream: 'Milestones', color: '#fbbf24' },
    ],
  },
  {
    id: 'act-7',
    type: 'event',
    title: 'Blue Spirit 6.0 Confirmed',
    description: 'Blue Spirit event confirmed for July 18, 2026 in Nosara, Costa Rica. Registration opens April 15th.',
    actor: 'Core Stewardship Team',
    actorAvatar: 'CS',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    icon: Calendar,
    iconColor: '#d4a574',
    iconBg: 'rgba(212, 165, 116, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: 'Event Planning Pipeline', workstream: 'Events', color: '#f97316' },
      { label: 'Bioregions: Nicoya Partnership', workstream: 'Milestones', color: '#fbbf24' },
    ],
  },
  {
    id: 'act-8',
    type: 'governance',
    title: 'CEO Search Plan Approved',
    description: 'Board agreed to formally begin CEO search after Blue Spirit. James transitions to strategic advisor.',
    actor: 'Board',
    actorAvatar: 'BD',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    icon: Scale,
    iconColor: '#d4a574',
    iconBg: 'rgba(212, 165, 116, 0.1)',
    impact: 'neutral',
    relatedItems: [
      { label: 'Leadership Transition OKR', workstream: 'OKRs', color: '#8b5cf6' },
      { label: 'Teal Governance Model', workstream: 'Governance', color: '#d4a574' },
    ],
  },
  {
    id: 'act-9',
    type: 'okr',
    title: 'DAF Structure Progress Update',
    description: 'DAF operational objective updated. Compliance checklist at 50%, fundraising at 20%. Status: at-risk.',
    actor: 'Colleen Galbraith',
    actorAvatar: 'CG',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    icon: Target,
    iconColor: '#f97316',
    iconBg: 'rgba(249, 115, 22, 0.1)',
    impact: 'concern',
    relatedItems: [
      { label: 'DAF Compliance Checklist', workstream: 'Governance', color: '#d4a574' },
      { label: 'Capital Node Pipeline', workstream: 'Nodes', color: '#a855f7' },
    ],
  },
  {
    id: 'act-10',
    type: 'milestone',
    title: 'Capital Node: 8 Deals in Pipeline',
    description: 'Greg reports 8 deals under evaluation, narrowing to 5 finalists for Blue Spirit presentations.',
    actor: 'Greg Berry',
    actorAvatar: 'GB',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    icon: Gem,
    iconColor: '#fbbf24',
    iconBg: 'rgba(251, 191, 36, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: 'Capital Node Workstream', workstream: 'Nodes', color: '#a855f7' },
      { label: 'Blue Spirit 6.0 Presentations', workstream: 'Events', color: '#f97316' },
    ],
  },
  {
    id: 'act-11',
    type: 'milestone',
    title: 'Bioregions: Nicoya Community Partnership',
    description: 'Gareth met with local community leaders. Nosara School confirmed for Phase 1 partnership.',
    actor: 'Gareth Hermann',
    actorAvatar: 'GH',
    timestamp: '2026-03-03',
    timeAgo: '6 days ago',
    icon: TreePine,
    iconColor: '#34d399',
    iconBg: 'rgba(52, 211, 153, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: 'Bioregions Node Strategy', workstream: 'Nodes', color: '#a855f7' },
      { label: 'Blue Spirit 6.0 Venue', workstream: 'Events', color: '#f97316' },
    ],
  },
  {
    id: 'act-12',
    type: 'task',
    title: 'Map Node MVP Specs In Progress',
    description: 'Fairman progressing on the coordination layer specs. The ecosystem nervous system is taking shape.',
    actor: 'Alex James Fairman',
    actorAvatar: 'AF',
    timestamp: '2026-03-03',
    timeAgo: '6 days ago',
    icon: Globe,
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139, 92, 246, 0.1)',
    impact: 'neutral',
    relatedItems: [
      { label: 'Map Node Workstream', workstream: 'Nodes', color: '#a855f7' },
      { label: 'Bi-weekly Sync Calls', workstream: 'Tasks', color: '#6b8f71' },
    ],
  },
  {
    id: 'act-13',
    type: 'governance',
    title: 'Node Lead Accountability Framework Set',
    description: 'Each node lead now required to submit quarterly OKRs, monthly updates, and join bi-weekly syncs.',
    actor: 'Core Stewardship Team',
    actorAvatar: 'CS',
    timestamp: '2026-03-02',
    timeAgo: '1 week ago',
    icon: Network,
    iconColor: '#a855f7',
    iconBg: 'rgba(168, 85, 247, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: 'Teal Governance Adoption', workstream: 'Governance', color: '#d4a574' },
      { label: 'OKR Tracking System', workstream: 'OKRs', color: '#8b5cf6' },
    ],
  },
  {
    id: 'act-14',
    type: 'event',
    title: 'Cabo 5.0 Completed Successfully',
    description: 'Flagship gathering concluded with 9.3/10 NPS. Teal governance adopted, DAF structure approved.',
    actor: 'Frequency Community',
    actorAvatar: 'FC',
    timestamp: '2026-02-02',
    timeAgo: '5 weeks ago',
    icon: Calendar,
    iconColor: '#d4a574',
    iconBg: 'rgba(212, 165, 116, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: 'Event Impact Analysis', workstream: 'Events', color: '#f97316' },
      { label: 'Governance Decisions Log', workstream: 'Governance', color: '#d4a574' },
    ],
  },
  {
    id: 'act-15',
    type: 'member',
    title: 'Community Reaches ~65 Well-Stewards',
    description: 'Membership growing steadily toward the 144 target. Retention rate improving at 78%.',
    actor: 'Frequency Community',
    actorAvatar: 'FC',
    timestamp: '2026-02-28',
    timeAgo: '1 week ago',
    icon: Heart,
    iconColor: '#f472b6',
    iconBg: 'rgba(244, 114, 182, 0.1)',
    impact: 'positive',
    relatedItems: [
      { label: '144 Well-Stewards OKR', workstream: 'OKRs', color: '#8b5cf6' },
      { label: 'Prospect Pipeline', workstream: 'Members', color: '#38bdf8' },
    ],
  },
];

const typeConfig: Record<ActivityType, { label: string; color: string; icon: React.ElementType }> = {
  task: { label: 'Task', color: '#6b8f71', icon: CheckCircle2 },
  okr: { label: 'OKR', color: '#8b5cf6', icon: Target },
  governance: { label: 'Governance', color: '#d4a574', icon: Scale },
  member: { label: 'Member', color: '#38bdf8', icon: Users },
  event: { label: 'Event', color: '#f97316', icon: Calendar },
  milestone: { label: 'Milestone', color: '#fbbf24', icon: Award },
};

// ─── Glassmorphism Styles ────────────────────────────────────────────────────

const glass = {
  card: {
    background: 'rgba(19, 23, 32, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(212, 165, 116, 0.08)',
    borderRadius: 14,
  } as React.CSSProperties,
  surface: {
    background: 'rgba(15, 18, 25, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(212, 165, 116, 0.06)',
    borderRadius: 12,
  } as React.CSSProperties,
  stat: {
    background: 'rgba(19, 23, 32, 0.65)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(212, 165, 116, 0.08)',
    borderRadius: 16,
  } as React.CSSProperties,
};

// ─── Animated Entry Wrapper ──────────────────────────────────────────────────

function AnimatedEntry({ children, delay = 0, style }: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
        transition: `opacity 0.55s ${EASE_SMOOTH}, transform 0.55s ${EASE_SMOOTH}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── SVG Mini Activity Chart ─────────────────────────────────────────────────

function ActivityMiniChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = 16;
  const gap = 5;
  const chartHeight = 36;
  const chartWidth = data.length * (barWidth + gap) - gap;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg width={chartWidth} height={chartHeight + 16} viewBox={`0 0 ${chartWidth} ${chartHeight + 16}`}>
      <defs>
        {data.map((d) => (
          <linearGradient key={`grad-${d.label}`} id={`act-bar-${d.label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={d.color} stopOpacity={0.9} />
            <stop offset="100%" stopColor={d.color} stopOpacity={0.4} />
          </linearGradient>
        ))}
      </defs>
      {data.map((d, i) => {
        const targetHeight = Math.max(3, (d.count / maxCount) * chartHeight);
        const barHeight = animated ? targetHeight : 0;
        const x = i * (barWidth + gap);
        return (
          <g key={d.label}>
            <rect
              x={x} y={chartHeight - barHeight} width={barWidth} height={barHeight}
              rx={4}
              fill={`url(#act-bar-${d.label})`}
              style={{
                transition: `height 0.8s ${EASE_SMOOTH} ${i * 80}ms, y 0.8s ${EASE_SMOOTH} ${i * 80}ms`,
                filter: `drop-shadow(0 2px 4px ${d.color}40)`,
              }}
            >
              <title>{`${d.label}: ${d.count}`}</title>
            </rect>
            <text
              x={x + barWidth / 2} y={chartHeight + 11}
              textAnchor="middle" style={{ fontSize: 7, fill: '#6b6358', fontWeight: 600 }}
            >
              {d.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── User Avatar Badge ─────────────────────────────────────────────────────

function AvatarBadge({ initials, color, size = 28, glow = false }: {
  initials: string;
  color: string;
  size?: number;
  glow?: boolean;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}25, ${color}10)`,
      border: `1.5px solid ${color}50`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color,
      flexShrink: 0,
      letterSpacing: '-0.02em',
      boxShadow: glow ? `0 0 12px ${color}30, 0 0 4px ${color}20` : 'none',
      transition: `box-shadow 0.3s ${EASE_SMOOTH}`,
    }}>
      {initials}
    </div>
  );
}

// ─── Bookmark Star with Animation ────────────────────────────────────────────

function BookmarkStar({ isBookmarked, onClick }: {
  isBookmarked: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [justToggled, setJustToggled] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setJustToggled(true);
    onClick(e);
    setTimeout(() => setJustToggled(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isBookmarked ? '#d4a574' : hovered ? '#a09888' : '#4a443e',
        transition: `color 0.2s ${EASE_SMOOTH}`,
        animation: justToggled ? 'act-starBounce 0.5s ease' : 'none',
        position: 'relative',
        borderRadius: 6,
      }}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark activity'}
    >
      {isBookmarked && (
        <div style={{
          position: 'absolute',
          inset: -2,
          borderRadius: 8,
          background: 'rgba(212, 165, 116, 0.08)',
          animation: justToggled ? 'act-ripple 0.6s ease-out' : 'none',
          '--act-ripple-color': 'rgba(212, 165, 116, 0.3)',
        } as React.CSSProperties} />
      )}
      <Star
        size={14}
        fill={isBookmarked ? '#d4a574' : 'none'}
        strokeWidth={isBookmarked ? 0 : 2}
        style={{
          filter: isBookmarked ? 'drop-shadow(0 0 4px rgba(212, 165, 116, 0.5))' : 'none',
          animation: justToggled && isBookmarked ? 'act-starFill 0.4s ease' : 'none',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </button>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDayLabel(dateStr: string, today: string): string {
  if (dateStr === today) return 'Today';
  const todayDate = new Date(today + 'T00:00:00');
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  if (dateStr === yStr) return 'Yesterday';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getStartOfWeek(today: string): string {
  const d = new Date(today + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getStartOfMonth(today: string): string {
  const d = new Date(today + 'T00:00:00');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function loadBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveBookmarks(ids: Set<string>) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...ids]));
}

function getActorColor(avatar: string): string {
  const colorMap: Record<string, string> = {
    'JH': '#d4a574', 'SH': '#f472b6', 'AF': '#8b5cf6', 'MX': '#38bdf8',
    'DW': '#34d399', 'AN': '#a855f7', 'FI': '#f472b6', 'MF': '#2dd4bf',
    'CG': '#d4a574', 'GB': '#22c55e', 'GH': '#84cc16', 'RA': '#f97316',
    'WC': '#d4a574', 'BD': '#d4a574', 'CS': '#8b5cf6', 'FC': '#6b8f71',
    'SS': '#818cf8', 'NP': '#94a3b8',
  };
  return colorMap[avatar] || '#a09888';
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ActivityView() {
  const [filterType, setFilterType] = useState<ActivityType | 'all' | 'bookmarked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Inject scoped keyframes
  useEffect(() => {
    if (!styleRef.current) {
      const style = document.createElement('style');
      style.textContent = actKeyframes;
      document.head.appendChild(style);
      styleRef.current = style;
    }
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, []);

  const toggleBookmark = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveBookmarks(next);
      return next;
    });
  }, []);

  const today = '2026-03-09';
  const weekStart = useMemo(() => getStartOfWeek(today), []);
  const monthStart = useMemo(() => getStartOfMonth(today), []);

  const filteredActivities = useMemo(() => {
    let items = activityData;

    if (timePeriod === 'week') {
      items = items.filter((a) => a.timestamp >= weekStart);
    } else if (timePeriod === 'month') {
      items = items.filter((a) => a.timestamp >= monthStart);
    }

    if (filterType === 'bookmarked') {
      items = items.filter((a) => bookmarks.has(a.id));
    } else if (filterType !== 'all') {
      items = items.filter((a) => a.type === filterType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.actor.toLowerCase().includes(q)
      );
    }

    return items;
  }, [filterType, searchQuery, timePeriod, bookmarks, weekStart, monthStart]);

  const groupedActivities = useMemo(() => {
    const groups: { date: string; label: string; items: ActivityItem[] }[] = [];
    const map = new Map<string, ActivityItem[]>();
    filteredActivities.forEach((item) => {
      const existing = map.get(item.timestamp);
      if (existing) existing.push(item);
      else map.set(item.timestamp, [item]);
    });
    map.forEach((items, date) => {
      groups.push({ date, label: formatDayLabel(date, today), items });
    });
    groups.sort((a, b) => (a.date > b.date ? -1 : 1));
    return groups;
  }, [filteredActivities]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activityData.length };
    activityData.forEach((a) => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return counts;
  }, []);

  const thisWeekCount = useMemo(
    () => activityData.filter((a) => a.timestamp >= weekStart).length,
    [weekStart]
  );

  const positiveCount = useMemo(
    () => activityData.filter((a) => a.impact === 'positive').length,
    []
  );

  const typeBreakdown = useMemo(() => {
    const types = Object.keys(typeConfig) as ActivityType[];
    const total = activityData.length;
    return types.map((t) => ({
      type: t,
      count: typeCounts[t] || 0,
      pct: total > 0 ? ((typeCounts[t] || 0) / total) * 100 : 0,
      color: typeConfig[t].color,
      label: typeConfig[t].label,
    }));
  }, [typeCounts]);

  // Derive the most active area
  const mostActiveArea = useMemo(() => {
    let maxType = 'task' as ActivityType;
    let maxCount = 0;
    (Object.keys(typeConfig) as ActivityType[]).forEach((t) => {
      const c = typeCounts[t] || 0;
      if (c > maxCount) { maxCount = c; maxType = t; }
    });
    return typeConfig[maxType];
  }, [typeCounts]);

  let animationIndex = 0;

  return (
    <div className="scrollbar-autohide" style={{
      padding: '28px 32px',
      height: '100%',
      overflow: 'auto',
      backgroundColor: '#0b0d14',
      position: 'relative',
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'fixed',
        top: -120,
        right: -120,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,165,116,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: -80,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <AnimatedEntry delay={0}>
          <div style={{ marginBottom: 24, position: 'relative' }}>
            <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
            <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                ...glass.card,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.08))',
                  animation: 'act-gradientFlow 6s ease infinite',
                  backgroundSize: '200% 200%',
                }} />
                <Activity size={20} style={{ color: '#d4a574', position: 'relative', zIndex: 1 }} />
              </div>
              <div>
                <h1 className="text-glow" style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}>
                  Activity Feed
                </h1>
                <p style={{
                  fontSize: 13,
                  color: '#6b6358',
                  margin: 0,
                  letterSpacing: '0.01em',
                }}>
                  Recent updates across all workstreams
                </p>
              </div>
            </div>
          </div>
        </AnimatedEntry>

        {/* ─── Stats Summary Row ──────────────────────────────────────── */}
        <AnimatedEntry delay={60}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
            gap: 14,
            marginBottom: 22,
          }}>
            {/* Total Activities */}
            <div className="card-stat" style={{
              ...glass.stat,
              padding: '16px 20px',
              transition: `border-color 0.3s ${EASE_SMOOTH}, box-shadow 0.3s ${EASE_SMOOTH}`,
              cursor: 'default',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,165,116,0.15)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,165,116,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Total Activities
                </div>
                <div style={{
                  width: 24, height: 24, borderRadius: 8,
                  background: 'rgba(160, 152, 136, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Activity size={12} style={{ color: '#6b6358' }} />
                </div>
              </div>
              <div style={{
                fontSize: 28, fontWeight: 700, color: '#f0ebe4',
                animation: 'act-countUp 0.6s ease-out',
                lineHeight: 1,
              }}>
                {activityData.length}
              </div>
            </div>

            {/* This Week */}
            <div className="card-stat" style={{
              ...glass.stat,
              padding: '16px 20px',
              transition: `border-color 0.3s ${EASE_SMOOTH}, box-shadow 0.3s ${EASE_SMOOTH}`,
              cursor: 'default',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,165,116,0.25)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(212,165,116,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,165,116,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  This Week
                </div>
                <div style={{
                  width: 24, height: 24, borderRadius: 8,
                  background: 'rgba(212,165,116,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrendingUp size={12} style={{ color: '#d4a574' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{
                  fontSize: 28, fontWeight: 700, color: '#d4a574',
                  animation: 'act-countUp 0.7s ease-out',
                  lineHeight: 1,
                }}>
                  {thisWeekCount}
                </div>
                <div style={{
                  fontSize: 10, color: '#6b8f71', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                  <TrendingUp size={9} />
                  active
                </div>
              </div>
            </div>

            {/* Positive Impact */}
            <div className="card-stat" style={{
              ...glass.stat,
              padding: '16px 20px',
              transition: `border-color 0.3s ${EASE_SMOOTH}, box-shadow 0.3s ${EASE_SMOOTH}`,
              cursor: 'default',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(107,143,113,0.25)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(107,143,113,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,165,116,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Positive Impact
                </div>
                <div style={{
                  width: 24, height: 24, borderRadius: 8,
                  background: 'rgba(107,143,113,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#6b8f71',
                    boxShadow: '0 0 8px rgba(107,143,113,0.5)',
                    animation: 'act-pulseGlow 3s ease-in-out infinite',
                    '--act-glow-color': 'rgba(107,143,113,0.4)',
                  } as React.CSSProperties} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{
                  fontSize: 28, fontWeight: 700, color: '#6b8f71',
                  animation: 'act-countUp 0.8s ease-out',
                  lineHeight: 1,
                }}>
                  {positiveCount}
                </div>
                <div style={{ fontSize: 10, color: '#4a443e', fontWeight: 500 }}>
                  / {activityData.length}
                </div>
              </div>
            </div>

            {/* Most Active + Chart */}
            <div className="card-stat" style={{
              ...glass.stat,
              padding: '16px 20px',
              transition: `border-color 0.3s ${EASE_SMOOTH}, box-shadow 0.3s ${EASE_SMOOTH}`,
              cursor: 'default',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(139,92,246,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,165,116,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>
                Distribution
              </div>
              <ActivityMiniChart
                data={typeBreakdown.filter(t => t.count > 0).map(t => ({
                  label: t.label,
                  count: t.count,
                  color: t.color,
                }))}
              />
            </div>
          </div>
        </AnimatedEntry>

        {/* ─── Stacked Progress Bar ───────────────────────────────────── */}
        <AnimatedEntry delay={100}>
          <div style={{ marginBottom: 20 }}>
            <div className="progress-bar-animated" style={{
              display: 'flex',
              height: 6,
              borderRadius: 3,
              overflow: 'hidden',
              background: 'rgba(30, 38, 56, 0.5)',
            }}>
              {typeBreakdown.map((t) => (
                <div
                  key={t.type}
                  style={{
                    width: `${t.pct}%`,
                    background: `linear-gradient(90deg, ${t.color}cc, ${t.color})`,
                    transition: `width 0.6s ${EASE_SMOOTH}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  title={`${t.label}: ${t.count}`}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'act-shimmer 3s linear infinite',
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
              {typeBreakdown.filter((t) => t.count > 0).map((t) => (
                <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    backgroundColor: t.color,
                    boxShadow: `0 0 4px ${t.color}40`,
                  }} />
                  <span style={{ fontSize: 11, color: '#6b6358', fontWeight: 500 }}>
                    {t.label} <span style={{ color: '#4a443e' }}>{t.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedEntry>

        {/* ─── Search Bar ─────────────────────────────────────────────── */}
        <AnimatedEntry delay={130}>
          <div style={{ marginBottom: 18, position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: searchFocused ? '#d4a574' : '#4a443e',
                pointerEvents: 'none',
                transition: `color 0.3s ${EASE_SMOOTH}`,
              }}
            />
            <input
              type="text"
              placeholder="Search activities by title, description, or person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 38px',
                ...glass.surface,
                borderColor: searchFocused ? 'rgba(212, 165, 116, 0.3)' : 'rgba(212, 165, 116, 0.06)',
                borderRadius: 12,
                color: '#f0ebe4',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                transition: `border-color 0.3s ${EASE_SMOOTH}, box-shadow 0.3s ${EASE_SMOOTH}`,
                boxSizing: 'border-box',
                boxShadow: searchFocused
                  ? '0 0 0 3px rgba(212, 165, 116, 0.08), 0 4px 16px rgba(0,0,0,0.2)'
                  : 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(160,152,136,0.1)',
                  border: 'none',
                  borderRadius: 6,
                  width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b6358',
                  fontSize: 12,
                  fontWeight: 700,
                  transition: `background 0.2s ${EASE_SMOOTH}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(160,152,136,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(160,152,136,0.1)'; }}
              >
                x
              </button>
            )}
          </div>
        </AnimatedEntry>

        {/* ─── Time Period Filter ──────────────────────────────────────── */}
        <AnimatedEntry delay={150}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {([
              { key: 'all' as TimePeriod, label: 'All Time', icon: CalendarDays },
              { key: 'week' as TimePeriod, label: 'This Week', icon: Zap },
              { key: 'month' as TimePeriod, label: 'This Month', icon: Calendar },
            ]).map(({ key, label, icon: PIcon }) => {
              const isActive = timePeriod === key;
              return (
                <button
                  key={key}
                  onClick={() => setTimePeriod(key)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 10,
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid rgba(212,165,116,0.06)',
                    cursor: 'pointer',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.06))'
                      : 'rgba(19,23,32,0.5)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: isActive ? '#a78bfa' : '#6b6358',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: 'inherit',
                    transition: `all 0.25s ${EASE_SMOOTH}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    boxShadow: isActive ? '0 2px 12px rgba(139,92,246,0.1)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
                      e.currentTarget.style.color = '#a09888';
                      e.currentTarget.style.background = 'rgba(19,23,32,0.7)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(212,165,116,0.06)';
                      e.currentTarget.style.color = '#6b6358';
                      e.currentTarget.style.background = 'rgba(19,23,32,0.5)';
                    }
                  }}
                >
                  <PIcon size={11} />
                  {label}
                </button>
              );
            })}
          </div>
        </AnimatedEntry>

        {/* ─── Type Filter Tabs ────────────────────────────────────────── */}
        <AnimatedEntry delay={170}>
          <div style={{ display: 'flex', gap: 7, marginBottom: 28, flexWrap: 'wrap' }}>
            {(['all', 'task', 'okr', 'governance', 'member', 'event', 'milestone', 'bookmarked'] as const).map(
              (type) => {
                const isActive = filterType === type;
                const config =
                  type === 'all'
                    ? { label: 'All', color: '#a09888' }
                    : type === 'bookmarked'
                    ? { label: 'Bookmarked', color: '#d4a574' }
                    : typeConfig[type];
                const count =
                  type === 'bookmarked' ? bookmarks.size : typeCounts[type] || 0;
                const isBookmarkFilter = type === 'bookmarked';
                const TypeIcon = type !== 'all' && type !== 'bookmarked' ? typeConfig[type].icon : null;

                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 20,
                      border: isActive ? `1px solid ${config.color}55` : '1px solid rgba(212,165,116,0.06)',
                      cursor: 'pointer',
                      background: isActive
                        ? `linear-gradient(135deg, ${config.color}1a, ${config.color}0d)`
                        : 'rgba(19,23,32,0.5)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      color: isActive ? config.color : '#6b6358',
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 500,
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: `all 0.25s ${EASE_SMOOTH}`,
                      boxShadow: isActive ? `0 2px 12px ${config.color}15` : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = `${config.color}30`;
                        e.currentTarget.style.color = '#a09888';
                        e.currentTarget.style.background = 'rgba(19,23,32,0.7)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(212,165,116,0.06)';
                        e.currentTarget.style.color = '#6b6358';
                        e.currentTarget.style.background = 'rgba(19,23,32,0.5)';
                      }
                    }}
                  >
                    {isBookmarkFilter && <Star size={11} fill={isActive ? '#d4a574' : 'none'} />}
                    {TypeIcon && <TypeIcon size={11} />}
                    {config.label}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: isActive ? `${config.color}20` : 'rgba(30,38,56,0.5)',
                        color: isActive ? config.color : '#4a443e',
                        borderRadius: 10,
                        padding: '2px 7px',
                        minWidth: 18,
                        textAlign: 'center',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </AnimatedEntry>

        {/* ─── Activity Timeline with Day Grouping ────────────────────── */}
        <div style={{ position: 'relative' }}>
          {/* Timeline gradient connector line */}
          <div
            style={{
              position: 'absolute',
              left: 19,
              top: 0,
              bottom: 0,
              width: 2,
              background: 'linear-gradient(to bottom, rgba(212,165,116,0.4), rgba(139,92,246,0.25) 30%, rgba(107,143,113,0.2) 60%, rgba(30,38,56,0.3) 85%, transparent)',
              borderRadius: 1,
            }}
          />
          {/* Animated pulse on timeline */}
          <div
            style={{
              position: 'absolute',
              left: 17,
              top: 0,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#d4a574',
              animation: 'act-timelinePulse 2s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(212,165,116,0.5)',
              zIndex: 2,
            }}
          />

          {groupedActivities.map((group, gi) => (
            <div key={group.date}>
              {/* ─── Day Header ──────────────────────────────────────── */}
              <AnimatedEntry delay={200 + gi * 40}>
                <div
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingTop: gi === 0 ? 0 : 20,
                    paddingBottom: 14,
                    backgroundColor: 'rgba(11, 13, 20, 0.95)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      display: 'flex',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 2,
                      position: 'relative',
                    }}
                  >
                    {/* Ping animation for Today */}
                    {group.label === 'Today' && (
                      <div style={{
                        position: 'absolute',
                        width: 14, height: 14,
                        borderRadius: '50%',
                        background: 'rgba(212,165,116,0.3)',
                        animation: 'act-dotPing 2s cubic-bezier(0,0,0.2,1) infinite',
                      }} />
                    )}
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: group.label === 'Today' ? '#d4a574' : group.label === 'Yesterday' ? '#8b5cf6' : '#2e3a4e',
                        border: `2.5px solid ${group.label === 'Today' ? 'rgba(212,165,116,0.5)' : group.label === 'Yesterday' ? 'rgba(139,92,246,0.4)' : '#3a465e'}`,
                        boxShadow: group.label === 'Today'
                          ? '0 0 12px rgba(212,165,116,0.4)'
                          : group.label === 'Yesterday'
                          ? '0 0 8px rgba(139,92,246,0.25)'
                          : 'none',
                        transition: `box-shadow 0.3s ${EASE_SMOOTH}`,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: group.label === 'Today' ? '#d4a574' : group.label === 'Yesterday' ? '#a78bfa' : '#a09888',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {group.label}
                    </span>
                    {/* Gradient divider line */}
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: group.label === 'Today'
                          ? 'linear-gradient(90deg, rgba(212,165,116,0.3), rgba(212,165,116,0.05) 80%, transparent)'
                          : group.label === 'Yesterday'
                          ? 'linear-gradient(90deg, rgba(139,92,246,0.2), rgba(139,92,246,0.03) 80%, transparent)'
                          : 'linear-gradient(90deg, rgba(46,58,78,0.6), transparent 80%)',
                      }}
                    />
                    <span style={{
                      fontSize: 10, color: '#4a443e', whiteSpace: 'nowrap',
                      background: 'rgba(30,38,56,0.4)', padding: '3px 10px', borderRadius: 8,
                      fontWeight: 600, letterSpacing: '0.02em',
                      border: '1px solid rgba(46,58,78,0.3)',
                    }}>
                      {group.items.length} {group.items.length === 1 ? 'activity' : 'activities'}
                    </span>
                  </div>
                </div>
              </AnimatedEntry>

              {/* ─── Activities in this group ──────────────────────────── */}
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                const tConfig = typeConfig[item.type];
                const isExpanded = expandedId === item.id;
                const isBookmarked = bookmarks.has(item.id);
                const impactCfg = impactConfig[item.impact];
                const isLast = gi === groupedActivities.length - 1 && idx === group.items.length - 1;
                const isHovered = hoveredCardId === item.id;
                const currentAnimIndex = animationIndex++;

                return (
                  <AnimatedEntry key={item.id} delay={250 + currentAnimIndex * 50}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 16,
                        marginBottom: isLast ? 0 : 4,
                        position: 'relative',
                      }}
                    >
                      {/* Timeline dot + icon */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${item.iconBg}, ${item.iconColor}08)`,
                          border: `2px solid ${item.iconColor}${isHovered ? '60' : '30'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          zIndex: 1,
                          transition: `transform 0.35s ${EASE_SMOOTH}, box-shadow 0.35s ${EASE_SMOOTH}, border-color 0.35s ${EASE_SMOOTH}`,
                          transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                          boxShadow: isHovered ? `0 0 16px ${item.iconColor}30` : 'none',
                        }}
                      >
                        <Icon size={16} style={{ color: item.iconColor }} />
                      </div>

                      {/* Content Card -- Glassmorphism */}
                      <div
                        className="card-interactive"
                        style={{
                          flex: 1,
                          ...glass.card,
                          borderLeft: `3px solid ${impactCfg.dot}`,
                          borderColor: isExpanded
                            ? 'rgba(212,165,116,0.15)'
                            : item.impact === 'concern'
                            ? 'rgba(239,68,68,0.15)'
                            : 'rgba(212,165,116,0.08)',
                          borderLeftColor: impactCfg.dot,
                          padding: '16px 20px',
                          marginBottom: 14,
                          transition: `border-color 0.3s ${EASE_SMOOTH}, box-shadow 0.4s ${EASE_SMOOTH}, transform 0.35s ${EASE_SMOOTH}`,
                          cursor: 'pointer',
                          transform: isHovered && !isExpanded ? 'translateX(4px)' : 'translateX(0)',
                          boxShadow: isHovered
                            ? `0 4px 24px rgba(0,0,0,0.25), inset 0 0 0 1px ${impactCfg.dot}15, 0 0 20px ${impactCfg.glow}`
                            : isExpanded
                            ? `0 4px 20px rgba(0,0,0,0.2), 0 0 12px ${impactCfg.glow}`
                            : 'none',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        onMouseEnter={() => setHoveredCardId(item.id)}
                        onMouseLeave={() => setHoveredCardId(null)}
                      >
                        {/* Subtle impact glow overlay */}
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 60,
                          background: `linear-gradient(90deg, ${impactCfg.dot}08, transparent)`,
                          pointerEvents: 'none',
                        }} />

                        {/* Top row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 8,
                            marginBottom: 8,
                            position: 'relative',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              title={impactCfg.label}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: impactCfg.dot,
                                flexShrink: 0,
                                boxShadow: `0 0 8px ${impactCfg.glow}`,
                              }}
                            />
                            <h3 style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: '#f0ebe4',
                              margin: 0,
                              lineHeight: 1.4,
                              letterSpacing: '-0.01em',
                            }}>
                              {item.title}
                            </h3>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexShrink: 0,
                            opacity: isHovered || isExpanded || isBookmarked ? 1 : 0.5,
                            transition: `opacity 0.25s ${EASE_SMOOTH}`,
                          }}>
                            <BookmarkStar
                              isBookmarked={isBookmarked}
                              onClick={(e) => toggleBookmark(item.id, e)}
                            />
                            {/* Share button on hover */}
                            <button
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 4,
                                display: 'flex',
                                alignItems: 'center',
                                color: '#4a443e',
                                borderRadius: 6,
                                opacity: isHovered ? 1 : 0,
                                transform: isHovered ? 'translateX(0)' : 'translateX(4px)',
                                transition: `opacity 0.2s ${EASE_SMOOTH}, transform 0.2s ${EASE_SMOOTH}, color 0.15s`,
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#a09888'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#4a443e'; }}
                              title="Share"
                            >
                              <Share2 size={13} />
                            </button>
                            {isExpanded ? (
                              <ChevronDown size={14} style={{
                                color: '#a09888',
                                transition: `transform 0.3s ${EASE_SMOOTH}`,
                              }} />
                            ) : (
                              <ChevronRight size={14} style={{
                                color: '#4a443e',
                                transition: `transform 0.3s ${EASE_SMOOTH}`,
                                transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
                              }} />
                            )}
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: 8,
                                background: `linear-gradient(135deg, ${tConfig.color}18, ${tConfig.color}0c)`,
                                border: `1px solid ${tConfig.color}25`,
                                color: tConfig.color,
                                fontSize: 10,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <tConfig.icon size={9} />
                              {tConfig.label}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{
                          fontSize: 12.5,
                          color: '#a09888',
                          lineHeight: 1.6,
                          margin: '0 0 10px',
                          position: 'relative',
                        }}>
                          {item.description}
                        </p>

                        {/* Bottom meta with avatar badge */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 11,
                            color: '#6b6358',
                            position: 'relative',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AvatarBadge
                              initials={item.actorAvatar}
                              color={getActorColor(item.actorAvatar)}
                              size={24}
                              glow={isHovered}
                            />
                            <span style={{ color: '#a09888', fontWeight: 500 }}>{item.actor}</span>
                          </span>
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: 'rgba(30,38,56,0.3)',
                            padding: '3px 8px',
                            borderRadius: 6,
                          }}>
                            <Clock size={10} style={{ color: '#4a443e' }} />
                            {item.timeAgo}
                          </span>
                        </div>

                        {/* ─── Expanded Details ──────────────────────────── */}
                        {isExpanded && (
                          <div
                            style={{
                              marginTop: 16,
                              paddingTop: 16,
                              borderTop: '1px solid rgba(46,58,78,0.4)',
                              animation: `act-slideReveal 0.4s ${EASE_SMOOTH}`,
                              position: 'relative',
                            }}
                          >
                            <div style={{ marginBottom: 16 }}>
                              <div style={{
                                fontSize: 11, color: '#6b6358', marginBottom: 8,
                                display: 'flex', alignItems: 'center', gap: 6,
                                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                              }}>
                                <BarChart3 size={11} style={{ color: '#4a443e' }} />
                                Details
                              </div>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: 8,
                                }}
                              >
                                {/* Impact detail */}
                                <div style={{
                                  ...glass.surface,
                                  padding: '10px 14px',
                                  animation: 'act-floatIn 0.3s ease-out 0.05s both',
                                }}>
                                  <div style={{ fontSize: 10, color: '#4a443e', marginBottom: 4, fontWeight: 500 }}>Impact</div>
                                  <div style={{
                                    fontSize: 12, color: impactCfg.dot, fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                  }}>
                                    <div style={{
                                      width: 7, height: 7, borderRadius: '50%',
                                      backgroundColor: impactCfg.dot,
                                      boxShadow: `0 0 6px ${impactCfg.glow}`,
                                    }} />
                                    {impactCfg.label}
                                  </div>
                                </div>
                                {/* Date detail */}
                                <div style={{
                                  ...glass.surface,
                                  padding: '10px 14px',
                                  animation: 'act-floatIn 0.3s ease-out 0.1s both',
                                }}>
                                  <div style={{ fontSize: 10, color: '#4a443e', marginBottom: 4, fontWeight: 500 }}>Date</div>
                                  <div style={{ fontSize: 12, color: '#f0ebe4', fontWeight: 500 }}>
                                    {new Date(item.timestamp + 'T00:00:00').toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </div>
                                </div>
                                {/* Type detail */}
                                <div style={{
                                  ...glass.surface,
                                  padding: '10px 14px',
                                  animation: 'act-floatIn 0.3s ease-out 0.15s both',
                                }}>
                                  <div style={{ fontSize: 10, color: '#4a443e', marginBottom: 4, fontWeight: 500 }}>Type</div>
                                  <div style={{
                                    fontSize: 12, color: tConfig.color, fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: 5,
                                  }}>
                                    <tConfig.icon size={11} />
                                    {tConfig.label}
                                  </div>
                                </div>
                                {/* Actor detail */}
                                <div style={{
                                  ...glass.surface,
                                  padding: '10px 14px',
                                  animation: 'act-floatIn 0.3s ease-out 0.2s both',
                                }}>
                                  <div style={{ fontSize: 10, color: '#4a443e', marginBottom: 4, fontWeight: 500 }}>Actor</div>
                                  <div style={{
                                    fontSize: 12, color: '#f0ebe4', fontWeight: 500,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                  }}>
                                    <AvatarBadge initials={item.actorAvatar} color={getActorColor(item.actorAvatar)} size={18} />
                                    {item.actor}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Related Items */}
                            <div>
                              <div style={{
                                fontSize: 11, color: '#6b6358', marginBottom: 10,
                                display: 'flex', alignItems: 'center', gap: 6,
                                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                              }}>
                                <Link2 size={11} style={{ color: '#4a443e' }} />
                                Related Items
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {item.relatedItems.map((rel, ri) => (
                                  <div
                                    key={ri}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      padding: '8px 14px',
                                      borderRadius: 10,
                                      ...glass.surface,
                                      transition: `border-color 0.25s ${EASE_SMOOTH}, transform 0.2s ${EASE_SMOOTH}, box-shadow 0.25s ${EASE_SMOOTH}`,
                                      cursor: 'default',
                                      animation: `act-floatIn 0.3s ease-out ${0.25 + ri * 0.05}s both`,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = `${rel.color}30`;
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                      e.currentTarget.style.boxShadow = `0 4px 12px ${rel.color}10`;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = 'rgba(212,165,116,0.06)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  >
                                    <div style={{
                                      width: 6, height: 6, borderRadius: '50%',
                                      backgroundColor: rel.color, flexShrink: 0,
                                      boxShadow: `0 0 6px ${rel.color}50`,
                                    }} />
                                    <span style={{ fontSize: 12, color: '#a09888', fontWeight: 500 }}>
                                      {rel.label}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 9,
                                        color: rel.color,
                                        background: `${rel.color}12`,
                                        padding: '2px 8px',
                                        borderRadius: 6,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                        border: `1px solid ${rel.color}18`,
                                      }}
                                    >
                                      {rel.workstream}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimatedEntry>
                );
              })}
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <AnimatedEntry delay={200}>
              <div style={{
                textAlign: 'center', padding: 48, color: '#6b6358',
                ...glass.card,
                margin: '20px 0',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(160,152,136,0.08)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Filter size={24} style={{ opacity: 0.4 }} />
                </div>
                <p style={{ fontSize: 14, margin: 0, fontWeight: 500, color: '#a09888' }}>
                  {searchQuery
                    ? 'No activities match your search'
                    : filterType === 'bookmarked'
                    ? 'No bookmarked activities yet'
                    : 'No activities match the selected filter'}
                </p>
                <p style={{ fontSize: 12, margin: '6px 0 0', color: '#4a443e' }}>
                  {searchQuery ? 'Try adjusting your search terms' : 'Try selecting a different filter or time period'}
                </p>
              </div>
            </AnimatedEntry>
          )}
        </div>
      </div>
    </div>
  );
}
