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
  Loader2,
  FileText,
  MessageCircle,
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
  timestamp: string;
  timeAgo: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  impact: ImpactLevel;
  relatedItems: RelatedItem[];
}

const BOOKMARKS_KEY = 'frequency-bookmarked-activities';
const ITEMS_PER_PAGE = 8;

const impactConfig: Record<ImpactLevel, { dot: string; label: string; glow: string }> = {
  positive: { dot: '#6b8f71', label: 'Positive', glow: 'rgba(107,143,113,0.2)' },
  neutral: { dot: '#e8b44c', label: 'Neutral', glow: 'rgba(232,180,76,0.2)' },
  concern: { dot: '#ef4444', label: 'Concern', glow: 'rgba(239,68,68,0.2)' },
};

const activityData: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'governance',
    title: 'Teal Governance Model Adopted',
    description: 'Wisdom Council moved from Green-stage consensus to Teal governance with responsibility-weighted voice.',
    actor: 'Wisdom Council',
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
  member: { label: 'Member', color: '#38bdf8', icon: UserPlus },
  event: { label: 'Event', color: '#f97316', icon: Calendar },
  milestone: { label: 'Milestone', color: '#fbbf24', icon: Gem },
};

function formatDayLabel(dateStr: string, today: string): string {
  if (dateStr === today) return 'Today';
  const todayDate = new Date(today + 'T00:00:00');
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  if (dateStr === yStr) return 'Yesterday';
  const d = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.floor((todayDate.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatRelativeTimestamp(dateStr: string, today: string): string {
  const todayDate = new Date(today + 'T12:00:00');
  const d = new Date(dateStr + 'T12:00:00');
  const diffMs = todayDate.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
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

// ─── Animated entry wrapper ──────────────────────────────────────────────────

function FadeSlideIn({ children, delay = 0, style }: {
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
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.35s ease-out, transform 0.35s ease-out',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function ActivityView() {
  const [filterType, setFilterType] = useState<ActivityType | 'all' | 'bookmarked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filterType, searchQuery, timePeriod]);

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

  // Paginated activities
  const paginatedActivities = useMemo(
    () => filteredActivities.slice(0, visibleCount),
    [filteredActivities, visibleCount]
  );
  const hasMore = visibleCount < filteredActivities.length;

  const loadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      setLoadingMore(false);
    }, 400);
  }, []);

  // Group by day
  const groupedActivities = useMemo(() => {
    const groups: { date: string; label: string; items: ActivityItem[] }[] = [];
    const map = new Map<string, ActivityItem[]>();
    paginatedActivities.forEach((item) => {
      const existing = map.get(item.timestamp);
      if (existing) existing.push(item);
      else map.set(item.timestamp, [item]);
    });
    map.forEach((items, date) => {
      groups.push({ date, label: formatDayLabel(date, today), items });
    });
    groups.sort((a, b) => (a.date > b.date ? -1 : 1));
    return groups;
  }, [paginatedActivities]);

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
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(212,165,116,0.1)', border: '1px solid rgba(212,165,116,0.15)',
          }}>
            <Activity size={18} style={{ color: '#d4a574' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', margin: 0, letterSpacing: '-0.01em' }}>
              Activity Feed
            </h1>
            <p style={{ fontSize: 12, color: '#6b6358', margin: '2px 0 0' }}>
              Recent updates across all workstreams
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {[
          { label: 'Total Activities', value: activityData.length, color: '#f0ebe4', accent: '#a09888' },
          { label: 'This Week', value: thisWeekCount, color: '#d4a574', accent: '#d4a574' },
          { label: 'Positive Impact', value: positiveCount, color: '#6b8f71', accent: '#6b8f71' },
          { label: 'Bookmarked', value: bookmarks.size, color: '#e8b44c', accent: '#e8b44c' },
        ].map((stat) => (
          <div key={stat.label} style={{
            backgroundColor: '#0f1219', border: '1px solid #1e2638', borderRadius: 10,
            padding: '12px 18px', minWidth: 110, flex: '1 1 0',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, ${stat.accent}40, transparent)`,
            }} />
            <div style={{
              fontSize: 10, color: '#6b6358', textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: 4,
            }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}

        {/* Types Breakdown */}
        <div style={{
          backgroundColor: '#0f1219', border: '1px solid #1e2638', borderRadius: 10,
          padding: '12px 18px', flex: '2 1 200px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            fontSize: 10, color: '#6b6358', textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: 8,
          }}>
            Types Breakdown
          </div>
          <div style={{
            display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: '#1e2638',
          }}>
            {typeBreakdown.map((t) => (
              <div key={t.type} style={{
                width: `${t.pct}%`, backgroundColor: t.color, transition: 'width 0.3s',
              }} title={`${t.label}: ${t.count}`} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            {typeBreakdown.filter((t) => t.count > 0).map((t) => (
              <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: t.color }} />
                <span style={{ fontSize: 10, color: '#6b6358' }}>{t.label} {t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 14, position: 'relative' }}>
        <Search size={14} style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: '#4a443e', pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search activities by title, description, or person..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px 10px 38px',
            backgroundColor: '#0f1219', border: '1px solid #1e2638', borderRadius: 10,
            color: '#f0ebe4', fontSize: 13, fontFamily: 'inherit', outline: 'none',
            transition: 'border-color 0.15s', boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(107,99,88,0.2)', border: 'none', borderRadius: 4,
              padding: '2px 4px', cursor: 'pointer', color: '#6b6358', display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11 }}>Clear</span>
          </button>
        )}
      </div>

      {/* Time Period Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
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
                padding: '5px 14px', borderRadius: 8,
                border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #1e2638',
                cursor: 'pointer',
                backgroundColor: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: isActive ? '#8b5cf6' : '#6b6358',
                fontSize: 11, fontWeight: isActive ? 600 : 400,
                fontFamily: 'inherit', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
              onMouseEnter={(e) => {
                if (!isActive) { e.currentTarget.style.borderColor = '#2e3a4e'; e.currentTarget.style.color = '#a09888'; }
              }}
              onMouseLeave={(e) => {
                if (!isActive) { e.currentTarget.style.borderColor = '#1e2638'; e.currentTarget.style.color = '#6b6358'; }
              }}
            >
              <CalendarDays size={11} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Type Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'task', 'okr', 'governance', 'member', 'event', 'milestone', 'bookmarked'] as const).map(
          (type) => {
            const isActive = filterType === type;
            const config =
              type === 'all'
                ? { label: 'All', color: '#a09888', icon: Activity }
                : type === 'bookmarked'
                ? { label: 'Bookmarked', color: '#d4a574', icon: Star }
                : typeConfig[type];
            const count =
              type === 'bookmarked' ? bookmarks.size : typeCounts[type] || 0;
            const TypeIcon = 'icon' in config ? config.icon : Activity;

            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  border: isActive ? `1px solid ${config.color}44` : '1px solid #1e2638',
                  cursor: 'pointer',
                  backgroundColor: isActive ? `${config.color}18` : 'transparent',
                  color: isActive ? config.color : '#6b6358',
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) { e.currentTarget.style.borderColor = '#2e3a4e'; e.currentTarget.style.color = '#a09888'; }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) { e.currentTarget.style.borderColor = '#1e2638'; e.currentTarget.style.color = '#6b6358'; }
                }}
              >
                <TypeIcon size={12} />
                {config.label}
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  backgroundColor: isActive ? `${config.color}22` : '#1e2638',
                  color: isActive ? config.color : '#6b6358',
                  borderRadius: 8, padding: '1px 6px',
                }}>
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Activity Timeline with Day Grouping */}
      <div style={{ position: 'relative' }}>
        {/* Timeline vertical line */}
        {groupedActivities.length > 0 && (
          <div style={{
            position: 'absolute', left: 19, top: 0, bottom: 40,
            width: 2, borderRadius: 1,
            background: 'linear-gradient(to bottom, #2e3a4e, #1e2638 30%, #1e2638 70%, transparent)',
          }} />
        )}

        {groupedActivities.map((group, gi) => (
          <div key={group.date}>
            {/* Day Header */}
            <FadeSlideIn delay={gi * 60} style={{ position: 'relative', zIndex: 5 }}>
              <div style={{
                position: 'sticky', top: 0, zIndex: 10,
                display: 'flex', alignItems: 'center', gap: 12,
                paddingTop: gi === 0 ? 0 : 20, paddingBottom: 12,
                backgroundColor: '#0b0d14',
              }}>
                <div style={{
                  width: 40, display: 'flex', justifyContent: 'center', flexShrink: 0, zIndex: 2,
                }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    backgroundColor: '#0f1219', border: '2px solid #d4a574',
                    boxShadow: '0 0 8px rgba(212,165,116,0.2)',
                  }} />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: '#d4a574',
                    textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  }}>
                    {group.label}
                  </span>
                  <div style={{ flex: 1, height: 1, backgroundColor: '#1e2638' }} />
                  <span style={{
                    fontSize: 10, color: '#4a443e', whiteSpace: 'nowrap',
                    background: '#0f1219', padding: '2px 8px', borderRadius: 4,
                    border: '1px solid #1e2638',
                  }}>
                    {group.items.length} {group.items.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>
              </div>
            </FadeSlideIn>

            {/* Activities in this group */}
            {group.items.map((item, idx) => {
              const Icon = item.icon;
              const tConfig = typeConfig[item.type];
              const isExpanded = expandedId === item.id;
              const isBookmarked = bookmarks.has(item.id);
              const impactCfg = impactConfig[item.impact];
              const currentAnimIndex = animationIndex++;

              return (
                <FadeSlideIn key={item.id} delay={80 + currentAnimIndex * 50}>
                  <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                    {/* Timeline icon node */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      backgroundColor: item.iconBg,
                      border: `2px solid ${item.iconColor}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, zIndex: 1,
                      boxShadow: isExpanded ? `0 0 12px ${item.iconColor}20` : 'none',
                      transition: 'box-shadow 0.2s',
                    }}>
                      <Icon size={16} style={{ color: item.iconColor }} />
                    </div>

                    {/* Content Card */}
                    <div
                      style={{
                        flex: 1, backgroundColor: '#0f1219',
                        border: `1px solid ${isExpanded ? '#2e3a4e' : '#1e2638'}`,
                        borderRadius: 12, padding: '14px 18px', marginBottom: 12,
                        transition: 'all 0.2s', cursor: 'pointer', position: 'relative',
                        overflow: 'hidden',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2e3a4e';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) e.currentTarget.style.borderColor = '#1e2638';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Left accent bar */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
                        background: `linear-gradient(to bottom, ${tConfig.color}, transparent)`,
                        borderRadius: '12px 0 0 12px',
                        opacity: isExpanded ? 0.8 : 0.3,
                        transition: 'opacity 0.2s',
                      }} />

                      {/* Top row */}
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                        gap: 8, marginBottom: 6,
                      }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {/* Impact Dot with glow */}
                          <div title={impactCfg.label} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            backgroundColor: impactCfg.dot, flexShrink: 0,
                            boxShadow: `0 0 6px ${impactCfg.glow}`,
                          }} />
                          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0, lineHeight: 1.4 }}>
                            {item.title}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {/* Bookmark star */}
                          <button
                            onClick={(e) => toggleBookmark(item.id, e)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                              display: 'flex', alignItems: 'center',
                              color: isBookmarked ? '#d4a574' : '#4a443e',
                              transition: 'all 0.15s',
                              transform: isBookmarked ? 'scale(1.1)' : 'scale(1)',
                            }}
                            onMouseEnter={(e) => {
                              if (!isBookmarked) e.currentTarget.style.color = '#a09888';
                            }}
                            onMouseLeave={(e) => {
                              if (!isBookmarked) e.currentTarget.style.color = '#4a443e';
                            }}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark activity'}
                          >
                            <Star size={13} fill={isBookmarked ? '#d4a574' : 'none'} />
                          </button>
                          {/* Expand chevron */}
                          <div style={{
                            transition: 'transform 0.2s',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                          }}>
                            <ChevronRight size={13} style={{ color: '#6b6358' }} />
                          </div>
                          {/* Type badge */}
                          <span style={{
                            padding: '2px 8px', borderRadius: 6,
                            backgroundColor: `${tConfig.color}15`, color: tConfig.color,
                            fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            {tConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.6, margin: '0 0 8px' }}>
                        {item.description}
                      </p>

                      {/* Bottom meta */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontSize: 11, color: '#6b6358',
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            background: `${item.iconColor}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Zap size={9} style={{ color: item.iconColor }} />
                          </div>
                          {item.actor}
                        </span>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '1px 6px', borderRadius: 4,
                          background: 'rgba(30,38,56,0.3)',
                        }}>
                          <Clock size={10} />
                          {formatRelativeTimestamp(item.timestamp, today)}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div style={{
                          marginTop: 14, paddingTop: 14, borderTop: '1px solid #1e2638',
                          animation: 'fadeIn 0.3s ease-out',
                        }}>
                          {/* Detail grid */}
                          <div style={{ marginBottom: 14 }}>
                            <div style={{
                              fontSize: 11, color: '#6b6358', marginBottom: 8,
                              display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                              <BarChart3 size={11} style={{ color: '#4a443e' }} />
                              Details
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              {[
                                { label: 'Impact', value: impactCfg.label, color: impactCfg.dot, dot: true },
                                { label: 'Date', value: new Date(item.timestamp + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), color: '#f0ebe4' },
                                { label: 'Type', value: tConfig.label, color: tConfig.color },
                                { label: 'Actor', value: item.actor, color: '#f0ebe4' },
                              ].map((d) => (
                                <div key={d.label} style={{
                                  backgroundColor: 'rgba(30, 38, 56, 0.3)', borderRadius: 8, padding: '8px 12px',
                                }}>
                                  <div style={{ fontSize: 10, color: '#4a443e', marginBottom: 2 }}>{d.label}</div>
                                  <div style={{
                                    fontSize: 12, color: d.color, fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: 5,
                                  }}>
                                    {d.dot && (
                                      <div style={{
                                        width: 6, height: 6, borderRadius: '50%', backgroundColor: d.color,
                                      }} />
                                    )}
                                    {d.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Related Items */}
                          <div>
                            <div style={{
                              fontSize: 11, color: '#6b6358', marginBottom: 8,
                              display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                              <Link2 size={11} style={{ color: '#4a443e' }} />
                              Related Items
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {item.relatedItems.map((rel, ri) => (
                                <div key={ri} style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  padding: '8px 12px', borderRadius: 8,
                                  backgroundColor: 'rgba(30, 38, 56, 0.2)',
                                  border: '1px solid #1e2638',
                                  transition: 'border-color 0.15s',
                                }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
                                >
                                  <div style={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    backgroundColor: rel.color, flexShrink: 0,
                                  }} />
                                  <span style={{ fontSize: 12, color: '#a09888', flex: 1 }}>{rel.label}</span>
                                  <span style={{
                                    fontSize: 9, color: '#4a443e',
                                    backgroundColor: 'rgba(30, 38, 56, 0.5)',
                                    padding: '2px 8px', borderRadius: 4,
                                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                                  }}>
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
                </FadeSlideIn>
              );
            })}
          </div>
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 8px' }}>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                padding: '10px 28px', borderRadius: 10,
                background: 'rgba(212,165,116,0.08)',
                border: '1px solid rgba(212,165,116,0.2)',
                color: '#d4a574', fontSize: 13, fontWeight: 600,
                fontFamily: 'inherit', cursor: loadingMore ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
                opacity: loadingMore ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loadingMore) e.currentTarget.style.background = 'rgba(212,165,116,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(212,165,116,0.08)';
              }}
            >
              {loadingMore ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Load More ({filteredActivities.length - visibleCount} remaining)
                </>
              )}
            </button>
          </div>
        )}

        {/* Showing count */}
        {filteredActivities.length > 0 && (
          <div style={{
            textAlign: 'center', padding: '8px 0 16px', fontSize: 11, color: '#4a443e',
          }}>
            Showing {paginatedActivities.length} of {filteredActivities.length} activities
          </div>
        )}

        {filteredActivities.length === 0 && (
          <div style={{
            textAlign: 'center', padding: 48, color: '#6b6358',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'rgba(107,99,88,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Filter size={24} style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: 14, margin: 0, fontWeight: 500 }}>
              {searchQuery
                ? 'No activities match your search'
                : filterType === 'bookmarked'
                ? 'No bookmarked activities yet'
                : 'No activities match the selected filter'}
            </p>
            <p style={{ fontSize: 12, margin: 0, color: '#4a443e' }}>
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
