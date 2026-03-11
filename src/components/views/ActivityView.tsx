'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

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

const BOOKMARKS_KEY = 'frequency-bookmarked-activities';

const impactConfig: Record<ImpactLevel, { dot: string; label: string; glow: string }> = {
  positive: { dot: '#6b8f71', label: 'Positive', glow: 'rgba(107, 143, 113, 0.3)' },
  neutral: { dot: '#e8b44c', label: 'Neutral', glow: 'rgba(232, 180, 76, 0.3)' },
  concern: { dot: '#ef4444', label: 'Concern', glow: 'rgba(239, 68, 68, 0.3)' },
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
        transition: 'opacity 0.45s ease-out, transform 0.45s ease-out',
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
  const barWidth = 14;
  const gap = 6;
  const chartHeight = 32;
  const chartWidth = data.length * (barWidth + gap) - gap;

  return (
    <svg width={chartWidth} height={chartHeight + 16} viewBox={`0 0 ${chartWidth} ${chartHeight + 16}`}>
      {data.map((d, i) => {
        const barHeight = Math.max(2, (d.count / maxCount) * chartHeight);
        const x = i * (barWidth + gap);
        return (
          <g key={d.label}>
            <rect
              x={x} y={chartHeight - barHeight} width={barWidth} height={barHeight}
              rx={3} fill={d.color} opacity={0.7}
            >
              <title>{`${d.label}: ${d.count}`}</title>
            </rect>
            <text
              x={x + barWidth / 2} y={chartHeight + 10}
              textAnchor="middle" style={{ fontSize: 7, fill: '#4a443e' }}
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

function AvatarBadge({ initials, color, size = 28 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}20`,
      border: `1.5px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color,
      flexShrink: 0,
      letterSpacing: '-0.02em',
    }}>
      {initials}
    </div>
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

  let animationIndex = 0;

  return (
    <div style={{ padding: '24px 32px', height: '100%', overflow: 'auto', backgroundColor: '#0b0d14' }}>
      {/* Header */}
      <AnimatedEntry delay={0}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(212, 165, 116, 0.1)',
              border: '1px solid rgba(212, 165, 116, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={18} style={{ color: '#d4a574' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', margin: 0, letterSpacing: '-0.01em' }}>
                Activity Feed
              </h1>
              <p style={{ fontSize: 12, color: '#6b6358', margin: 0 }}>
                Recent updates across all workstreams
              </p>
            </div>
          </div>
        </div>
      </AnimatedEntry>

      {/* Stats Summary Row */}
      <AnimatedEntry delay={50}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#0f1219',
              border: '1px solid #1e2638',
              borderRadius: 12,
              padding: '14px 18px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total Activities
              </div>
              <Activity size={12} style={{ color: '#4a443e' }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f0ebe4' }}>
              {activityData.length}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#0f1219',
              border: '1px solid #1e2638',
              borderRadius: 12,
              padding: '14px 18px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                This Week
              </div>
              <TrendingUp size={12} style={{ color: '#d4a574' }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#d4a574' }}>
              {thisWeekCount}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#0f1219',
              border: '1px solid #1e2638',
              borderRadius: 12,
              padding: '14px 18px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(107, 143, 113, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Positive Impact
              </div>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#6b8f71',
                boxShadow: '0 0 6px rgba(107,143,113,0.4)',
              }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#6b8f71' }}>
              {positiveCount}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#0f1219',
              border: '1px solid #1e2638',
              borderRadius: 12,
              padding: '14px 18px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
          >
            <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Type Distribution
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

      {/* Stacked bar */}
      <AnimatedEntry delay={100}>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              height: 6,
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: '#1e2638',
            }}
          >
            {typeBreakdown.map((t) => (
              <div
                key={t.type}
                style={{
                  width: `${t.pct}%`,
                  backgroundColor: t.color,
                  transition: 'width 0.4s ease',
                }}
                title={`${t.label}: ${t.count}`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            {typeBreakdown.filter((t) => t.count > 0).map((t) => (
              <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: t.color }} />
                <span style={{ fontSize: 10, color: '#6b6358' }}>
                  {t.label} {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedEntry>

      {/* Search Bar */}
      <AnimatedEntry delay={120}>
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#4a443e',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search activities by title, description, or person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 34px',
              backgroundColor: '#0f1219',
              border: '1px solid #1e2638',
              borderRadius: 10,
              color: '#f0ebe4',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
          />
        </div>
      </AnimatedEntry>

      {/* Time Period Filter */}
      <AnimatedEntry delay={140}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {([
            { key: 'all' as TimePeriod, label: 'All Time' },
            { key: 'week' as TimePeriod, label: 'This Week' },
            { key: 'month' as TimePeriod, label: 'This Month' },
          ]).map(({ key, label }) => {
            const isActive = timePeriod === key;
            return (
              <button
                key={key}
                onClick={() => setTimePeriod(key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #1e2638',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  color: isActive ? '#8b5cf6' : '#6b6358',
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#2e3a4e';
                    e.currentTarget.style.color = '#a09888';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#1e2638';
                    e.currentTarget.style.color = '#6b6358';
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </AnimatedEntry>

      {/* Type Filter Tabs */}
      <AnimatedEntry delay={160}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
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
              const isBookmarked = type === 'bookmarked';
              const TypeIcon = type !== 'all' && type !== 'bookmarked' ? typeConfig[type].icon : null;

              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: isActive ? `1px solid ${config.color}44` : '1px solid #1e2638',
                    cursor: 'pointer',
                    backgroundColor: isActive ? `${config.color}18` : 'transparent',
                    color: isActive ? config.color : '#6b6358',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#2e3a4e';
                      e.currentTarget.style.color = '#a09888';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#1e2638';
                      e.currentTarget.style.color = '#6b6358';
                    }
                  }}
                >
                  {isBookmarked && <Star size={11} />}
                  {TypeIcon && <TypeIcon size={11} />}
                  {config.label}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      backgroundColor: isActive ? `${config.color}22` : '#1e2638',
                      color: isActive ? config.color : '#6b6358',
                      borderRadius: 8,
                      padding: '1px 6px',
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

      {/* Activity Timeline with Day Grouping */}
      <div style={{ position: 'relative' }}>
        {/* Timeline connector line */}
        <div
          style={{
            position: 'absolute',
            left: 19,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'linear-gradient(to bottom, #2e3a4e, #1e2638 40%, #1e2638 80%, transparent)',
            borderRadius: 1,
          }}
        />

        {groupedActivities.map((group, gi) => (
          <div key={group.date}>
            {/* Day Header */}
            <AnimatedEntry delay={200 + gi * 40}>
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  paddingTop: gi === 0 ? 0 : 16,
                  paddingBottom: 12,
                  backgroundColor: '#0b0d14',
                }}
              >
                <div
                  style={{
                    width: 40,
                    display: 'flex',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: group.label === 'Today' ? '#d4a574' : group.label === 'Yesterday' ? '#8b5cf6' : '#1e2638',
                      border: `2px solid ${group.label === 'Today' ? 'rgba(212,165,116,0.4)' : group.label === 'Yesterday' ? 'rgba(139,92,246,0.3)' : '#2e3a4e'}`,
                      boxShadow: group.label === 'Today' ? '0 0 8px rgba(212,165,116,0.3)' : 'none',
                    }}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: group.label === 'Today' ? '#d4a574' : '#a09888',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {group.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: '#1e2638',
                    }}
                  />
                  <span style={{
                    fontSize: 10, color: '#4a443e', whiteSpace: 'nowrap',
                    background: 'rgba(30,38,56,0.3)', padding: '2px 8px', borderRadius: 6,
                  }}>
                    {group.items.length} {group.items.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>
              </div>
            </AnimatedEntry>

            {/* Activities in this group */}
            {group.items.map((item, idx) => {
              const Icon = item.icon;
              const tConfig = typeConfig[item.type];
              const isExpanded = expandedId === item.id;
              const isBookmarked = bookmarks.has(item.id);
              const impactCfg = impactConfig[item.impact];
              const isLast = gi === groupedActivities.length - 1 && idx === group.items.length - 1;
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
                        backgroundColor: item.iconBg,
                        border: `2px solid ${item.iconColor}33`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        zIndex: 1,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                    >
                      <Icon size={16} style={{ color: item.iconColor }} />
                    </div>

                    {/* Content Card */}
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: '#0f1219',
                        border: `1px solid ${isExpanded ? '#2e3a4e' : item.impact === 'concern' ? 'rgba(239,68,68,0.2)' : '#1e2638'}`,
                        borderLeft: `3px solid ${impactCfg.dot}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        marginBottom: 12,
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2e3a4e';
                        e.currentTarget.style.borderLeftColor = impactCfg.dot;
                        e.currentTarget.style.boxShadow = `0 2px 12px rgba(0,0,0,0.15), inset 3px 0 0 ${impactCfg.dot}`;
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) {
                          e.currentTarget.style.borderColor = item.impact === 'concern' ? 'rgba(239,68,68,0.2)' : '#1e2638';
                        }
                        e.currentTarget.style.borderLeftColor = impactCfg.dot;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Top row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 8,
                          marginBottom: 6,
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
                              boxShadow: `0 0 6px ${impactCfg.glow}`,
                            }}
                          />
                          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0, lineHeight: 1.4 }}>
                            {item.title}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={(e) => toggleBookmark(item.id, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 2,
                              display: 'flex',
                              alignItems: 'center',
                              color: isBookmarked ? '#d4a574' : '#4a443e',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isBookmarked) e.currentTarget.style.color = '#a09888';
                            }}
                            onMouseLeave={(e) => {
                              if (!isBookmarked) e.currentTarget.style.color = '#4a443e';
                            }}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark activity'}
                          >
                            <Star
                              size={13}
                              fill={isBookmarked ? '#d4a574' : 'none'}
                            />
                          </button>
                          {isExpanded ? (
                            <ChevronDown size={13} style={{ color: '#6b6358' }} />
                          ) : (
                            <ChevronRight size={13} style={{ color: '#4a443e' }} />
                          )}
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              backgroundColor: `${tConfig.color}15`,
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
                      <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.5, margin: '0 0 8px' }}>
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
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AvatarBadge
                            initials={item.actorAvatar}
                            color={getActorColor(item.actorAvatar)}
                            size={22}
                          />
                          <span style={{ color: '#a09888', fontWeight: 500 }}>{item.actor}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={10} />
                          {item.timeAgo}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div
                          style={{
                            marginTop: 14,
                            paddingTop: 14,
                            borderTop: '1px solid #1e2638',
                          }}
                        >
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, color: '#6b6358', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
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
                              <div
                                style={{
                                  backgroundColor: 'rgba(30, 38, 56, 0.3)',
                                  borderRadius: 8,
                                  padding: '8px 12px',
                                }}
                              >
                                <div style={{ fontSize: 10, color: '#4a443e', marginBottom: 2 }}>Impact</div>
                                <div style={{ fontSize: 12, color: impactCfg.dot, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <div
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      backgroundColor: impactCfg.dot,
                                      boxShadow: `0 0 4px ${impactCfg.glow}`,
                                    }}
                                  />
                                  {impactCfg.label}
                                </div>
                              </div>
                              <div
                                style={{
                                  backgroundColor: 'rgba(30, 38, 56, 0.3)',
                                  borderRadius: 8,
                                  padding: '8px 12px',
                                }}
                              >
                                <div style={{ fontSize: 10, color: '#4a443e', marginBottom: 2 }}>Date</div>
                                <div style={{ fontSize: 12, color: '#f0ebe4', fontWeight: 500 }}>
                                  {new Date(item.timestamp + 'T00:00:00').toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </div>
                              </div>
                              <div
                                style={{
                                  backgroundColor: 'rgba(30, 38, 56, 0.3)',
                                  borderRadius: 8,
                                  padding: '8px 12px',
                                }}
                              >
                                <div style={{ fontSize: 10, color: '#4a443e', marginBottom: 2 }}>Type</div>
                                <div style={{ fontSize: 12, color: tConfig.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <tConfig.icon size={11} />
                                  {tConfig.label}
                                </div>
                              </div>
                              <div
                                style={{
                                  backgroundColor: 'rgba(30, 38, 56, 0.3)',
                                  borderRadius: 8,
                                  padding: '8px 12px',
                                }}
                              >
                                <div style={{ fontSize: 10, color: '#4a443e', marginBottom: 2 }}>Actor</div>
                                <div style={{ fontSize: 12, color: '#f0ebe4', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <AvatarBadge initials={item.actorAvatar} color={getActorColor(item.actorAvatar)} size={18} />
                                  {item.actor}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Related Items */}
                          <div>
                            <div style={{ fontSize: 11, color: '#6b6358', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Link2 size={11} style={{ color: '#4a443e' }} />
                              Related Items
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {item.relatedItems.map((rel, ri) => (
                                <div
                                  key={ri}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '7px 12px',
                                    borderRadius: 8,
                                    backgroundColor: 'rgba(30, 38, 56, 0.2)',
                                    border: '1px solid #1e2638',
                                    transition: 'border-color 0.15s',
                                    cursor: 'default',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#2e3a4e';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#1e2638';
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 5,
                                      height: 5,
                                      borderRadius: '50%',
                                      backgroundColor: rel.color,
                                      flexShrink: 0,
                                      boxShadow: `0 0 4px ${rel.color}40`,
                                    }}
                                  />
                                  <span style={{ fontSize: 12, color: '#a09888', flex: 1 }}>
                                    {rel.label}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 9,
                                      color: '#4a443e',
                                      backgroundColor: 'rgba(30, 38, 56, 0.5)',
                                      padding: '1px 6px',
                                      borderRadius: 4,
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
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
            <div style={{ textAlign: 'center', padding: 40, color: '#6b6358' }}>
              <Filter size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ fontSize: 13, margin: 0 }}>
                {searchQuery
                  ? 'No activities match your search'
                  : filterType === 'bookmarked'
                  ? 'No bookmarked activities yet'
                  : 'No activities match the selected filter'}
              </p>
            </div>
          </AnimatedEntry>
        )}
      </div>
    </div>
  );
}
