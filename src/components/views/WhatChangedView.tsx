'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Clock,
  Users,
  Scale,
  Network,
  DollarSign,
  Calendar,
  Heart,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Zap,
  Shield,
  Star,
  Eye,
  Tag,
  ChevronRight,
  Wrench,
  Lightbulb,
  GitCommit,
} from 'lucide-react';

/* ─── Types ─── */

type TimeFilter = 'today' | 'this-week' | 'this-month';

type Category = 'membership' | 'governance' | 'nodes' | 'financial' | 'events' | 'culture';

type Sentiment = 'positive' | 'neutral' | 'negative';

type ImpactLevel = 'high' | 'medium' | 'low';

type ChangeType = 'feature' | 'fix' | 'update' | 'decision';

interface ChangeItem {
  id: string;
  category: Category;
  sentiment: Sentiment;
  impact: ImpactLevel;
  changeType: ChangeType;
  description: string;
  detail: string;
  triggeredBy: string;
  timestamp: string;
  timeAgo: string;
  daysAgo: number;
  affectedAreas: string[];
  isNew?: boolean;
}

/* ─── Inline Keyframes ─── */

const animationStyles = `
@keyframes timelineReveal {
  0% {
    opacity: 0;
    transform: translateY(-16px) scale(0.97);
  }
  60% {
    opacity: 1;
    transform: translateY(2px) scale(1.003);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes timelineDotPulse {
  0% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(212, 165, 116, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0); }
}

@keyframes timelineLineGrow {
  from { height: 0%; }
  to { height: 100%; }
}

@keyframes newBadgePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes shimmerHighlight {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }
}

@keyframes statCardEntrance {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
`;

/* ─── Config ─── */

const categoryConfig: Record<Category, { label: string; color: string; icon: React.ElementType }> = {
  membership: { label: 'Membership', color: '#6b8f71', icon: Users },
  governance: { label: 'Governance', color: '#8b5cf6', icon: Scale },
  nodes: { label: 'Nodes', color: '#5eaed4', icon: Network },
  financial: { label: 'Financial', color: '#d4a574', icon: DollarSign },
  events: { label: 'Events', color: '#e879a0', icon: Calendar },
  culture: { label: 'Culture', color: '#fb923c', icon: Heart },
};

const sentimentConfig: Record<Sentiment, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  positive: { label: 'Positive', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', icon: TrendingUp },
  neutral: { label: 'Neutral', color: '#e8b44c', bg: 'rgba(232, 180, 76, 0.12)', icon: Minus },
  negative: { label: 'Needs Attention', color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', icon: TrendingDown },
};

const impactConfig: Record<ImpactLevel, { label: string; color: string; bg: string }> = {
  high: { label: 'High Impact', color: '#d4a574', bg: 'rgba(212, 165, 116, 0.15)' },
  medium: { label: 'Medium', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)' },
  low: { label: 'Low', color: '#a09888', bg: 'rgba(160, 152, 136, 0.12)' },
};

const changeTypeConfig: Record<ChangeType, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  feature: {
    label: 'Feature',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.25)',
    icon: Star,
  },
  fix: {
    label: 'Fix',
    color: '#f87171',
    bg: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.25)',
    icon: Wrench,
  },
  update: {
    label: 'Update',
    color: '#d4a574',
    bg: 'rgba(212, 165, 116, 0.1)',
    border: '1px solid rgba(212, 165, 116, 0.25)',
    icon: ArrowUpRight,
  },
  decision: {
    label: 'Decision',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    icon: Lightbulb,
  },
};

const timeFilters: { key: TimeFilter; label: string; maxDays: number }[] = [
  { key: 'today', label: 'Today', maxDays: 1 },
  { key: 'this-week', label: 'This Week', maxDays: 7 },
  { key: 'this-month', label: 'This Month', maxDays: 30 },
];

/* ─── Mock Data ─── */

const changesData: ChangeItem[] = [
  {
    id: 'chg-1',
    category: 'membership',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'feature',
    description: '3 new well-steward applications received this week',
    detail: 'Applications from Costa Rica, UK, and California — all referred by existing members. Essence interviews scheduled.',
    triggeredBy: 'Maximillian',
    timestamp: '2026-03-09',
    timeAgo: '2 hours ago',
    daysAgo: 0,
    affectedAreas: ['Membership Pipeline', 'Onboarding'],
    isNew: true,
  },
  {
    id: 'chg-2',
    category: 'financial',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'update',
    description: 'Monthly burn came in at $21.8K — under target',
    detail: 'February burn was $3.2K under the $25K/mo target. Travel costs lower than projected; contractor spend stable.',
    triggeredBy: 'Colleen Galbraith',
    timestamp: '2026-03-09',
    timeAgo: '4 hours ago',
    daysAgo: 0,
    affectedAreas: ['Budget', 'Runway'],
    isNew: true,
  },
  {
    id: 'chg-3',
    category: 'nodes',
    sentiment: 'negative',
    impact: 'high',
    changeType: 'fix',
    description: 'Nicoya pilot Phase 1 delayed by 2 weeks',
    detail: 'Local permitting process taking longer than expected. Gareth working with community leaders on expedited review.',
    triggeredBy: 'Gareth Hermann',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    daysAgo: 1,
    affectedAreas: ['Bioregions Node', 'Timeline'],
    isNew: true,
  },
  {
    id: 'chg-4',
    category: 'governance',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'feature',
    description: 'Teal governance decision log now maintained for 30 consecutive days',
    detail: 'Every council meeting has produced a documented decision log since February 7. Transparency streak intact.',
    triggeredBy: 'Core Stewardship Team',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    daysAgo: 1,
    affectedAreas: ['Governance', 'Transparency'],
  },
  {
    id: 'chg-5',
    category: 'events',
    sentiment: 'neutral',
    impact: 'high',
    changeType: 'update',
    description: 'Blue Spirit ticket sales at 32/70 — 46% capacity',
    detail: 'Registration pace is on track but not accelerating. Early-bird pricing ends March 31. Marketing push planned.',
    triggeredBy: 'Sian Hodges',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    daysAgo: 1,
    affectedAreas: ['Events', 'Revenue'],
  },
  {
    id: 'chg-6',
    category: 'nodes',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'decision',
    description: 'Map Node MVP specs approved by Wisdom Council',
    detail: 'The coordination layer specs passed Wisdom Council review. Development sprint begins next week with Fairman leading.',
    triggeredBy: 'Wisdom Council',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    daysAgo: 2,
    affectedAreas: ['Map Node', 'Development'],
  },
  {
    id: 'chg-7',
    category: 'membership',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'update',
    description: 'Member retention improved to 82% (was 78%)',
    detail: 'Pod engagement and monthly calls driving better retention. 4 at-risk members re-engaged after personal outreach.',
    triggeredBy: 'Maximillian',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    daysAgo: 2,
    affectedAreas: ['Membership', 'Community Health'],
  },
  {
    id: 'chg-8',
    category: 'nodes',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'feature',
    description: 'Anthem studio session completed — 3 tracks in production',
    detail: 'Raamayan wrapped a powerful studio session. Cultural heartbeat tracks enter mixing phase next week.',
    triggeredBy: 'Raamayan Ananda',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    daysAgo: 3,
    affectedAreas: ['Megaphone Node', 'Culture'],
  },
  {
    id: 'chg-9',
    category: 'financial',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'update',
    description: 'DAF compliance review passed with no issues',
    detail: 'Quarterly compliance check completed. All donor-advised fund documentation meets regulatory standards.',
    triggeredBy: 'Colleen Galbraith',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    daysAgo: 3,
    affectedAreas: ['Compliance', 'DAF'],
  },
  {
    id: 'chg-10',
    category: 'culture',
    sentiment: 'negative',
    impact: 'medium',
    changeType: 'fix',
    description: 'Pod attendance dropped 15% in February',
    detail: 'Participation dipped across 3 of 4 active pods. Scheduling conflicts cited as primary reason. Pod leads meeting to discuss format changes.',
    triggeredBy: 'Dave Wolstencroft',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    daysAgo: 4,
    affectedAreas: ['Pods', 'Engagement'],
  },
  {
    id: 'chg-11',
    category: 'nodes',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'feature',
    description: 'Capital Node scored 3 new deals this week',
    detail: 'Greg reports 3 new investment opportunities under evaluation, bringing active pipeline to 8 deals total.',
    triggeredBy: 'Greg Berry',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    daysAgo: 4,
    affectedAreas: ['Capital Node', 'Pipeline'],
  },
  {
    id: 'chg-12',
    category: 'financial',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'update',
    description: 'Cash runway extended to 14 months',
    detail: 'Combination of lower burn rate and new membership revenue pushed runway from 12 to 14 months. Healthy position.',
    triggeredBy: 'James Hodges',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    daysAgo: 5,
    affectedAreas: ['Financial Health', 'Runway'],
  },
  {
    id: 'chg-13',
    category: 'governance',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'decision',
    description: 'Board approved CEO search timeline',
    detail: 'Board agreed to formally begin CEO search after Blue Spirit. James transitions to strategic advisor role by Q4 2026.',
    triggeredBy: 'Board',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    daysAgo: 5,
    affectedAreas: ['Leadership', 'Governance'],
  },
  {
    id: 'chg-14',
    category: 'nodes',
    sentiment: 'neutral',
    impact: 'medium',
    changeType: 'feature',
    description: 'DECO framework v1 documentation started',
    detail: 'First draft of the decentralized coordination framework is underway. Targeting completion by end of March.',
    triggeredBy: 'Alex James Fairman',
    timestamp: '2026-03-03',
    timeAgo: '6 days ago',
    daysAgo: 6,
    affectedAreas: ['DECO', 'Documentation'],
  },
  {
    id: 'chg-15',
    category: 'culture',
    sentiment: 'positive',
    impact: 'low',
    changeType: 'feature',
    description: "Women's Council charter drafting began",
    detail: 'An emerging group of women stewards initiated a formal charter to define purpose, cadence, and decision authority.',
    triggeredBy: 'Community Members',
    timestamp: '2026-03-02',
    timeAgo: '1 week ago',
    daysAgo: 7,
    affectedAreas: ['Culture', 'Governance'],
  },
  {
    id: 'chg-16',
    category: 'membership',
    sentiment: 'neutral',
    impact: 'medium',
    changeType: 'decision',
    description: 'Membership tier restructuring proposal submitted',
    detail: 'New tiered pricing model proposed with Steward ($500/yr), Guardian ($2,500/yr), and Founder ($10K/yr) levels.',
    triggeredBy: 'Maximillian',
    timestamp: '2026-03-01',
    timeAgo: '8 days ago',
    daysAgo: 8,
    affectedAreas: ['Membership', 'Pricing'],
  },
  {
    id: 'chg-17',
    category: 'events',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'update',
    description: 'Cabo 5.0 post-event survey completed — 9.3 NPS',
    detail: 'Final survey results in. Strongest scores in community connection and governance sessions. Food scored lowest.',
    triggeredBy: 'Sian Hodges',
    timestamp: '2026-02-25',
    timeAgo: '12 days ago',
    daysAgo: 12,
    affectedAreas: ['Events', 'NPS'],
  },
  {
    id: 'chg-18',
    category: 'governance',
    sentiment: 'neutral',
    impact: 'low',
    changeType: 'update',
    description: 'Node lead quarterly report template finalized',
    detail: 'Standardized reporting template approved. All node leads will use it starting Q2 2026.',
    triggeredBy: 'Core Stewardship Team',
    timestamp: '2026-02-20',
    timeAgo: '17 days ago',
    daysAgo: 17,
    affectedAreas: ['Reporting', 'Nodes'],
  },
];

/* ─── Helper: Group by time period ─── */

function groupByTimePeriod(items: ChangeItem[]): { label: string; items: ChangeItem[] }[] {
  const groups: { label: string; items: ChangeItem[] }[] = [];
  const today: ChangeItem[] = [];
  const thisWeek: ChangeItem[] = [];
  const thisMonth: ChangeItem[] = [];
  const older: ChangeItem[] = [];

  items.forEach((item) => {
    if (item.daysAgo === 0) today.push(item);
    else if (item.daysAgo <= 7) thisWeek.push(item);
    else if (item.daysAgo <= 30) thisMonth.push(item);
    else older.push(item);
  });

  if (today.length > 0) groups.push({ label: 'Today', items: today });
  if (thisWeek.length > 0) groups.push({ label: 'This Week', items: thisWeek });
  if (thisMonth.length > 0) groups.push({ label: 'This Month', items: thisMonth });
  if (older.length > 0) groups.push({ label: 'Earlier', items: older });

  return groups;
}

/* ─── Component ─── */

export function WhatChangedView() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this-week');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* Derived data */
  const filteredChanges = useMemo(() => {
    const maxDays = timeFilters.find((t) => t.key === timeFilter)?.maxDays ?? 7;
    return changesData.filter((c) => {
      const inTime = c.daysAgo <= maxDays;
      const inCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return inTime && inCategory;
    });
  }, [timeFilter, categoryFilter]);

  const groupedChanges = useMemo(() => groupByTimePeriod(filteredChanges), [filteredChanges]);

  const newSinceLastVisit = useMemo(() => {
    return filteredChanges.filter((c) => c.isNew);
  }, [filteredChanges]);

  const stats = useMemo(() => {
    const total = filteredChanges.length;
    const positive = filteredChanges.filter((c) => c.sentiment === 'positive').length;
    const neutral = filteredChanges.filter((c) => c.sentiment === 'neutral').length;
    const negative = filteredChanges.filter((c) => c.sentiment === 'negative').length;
    return { total, positive, neutral, negative };
  }, [filteredChanges]);

  const categoryCounts = useMemo(() => {
    const maxDays = timeFilters.find((t) => t.key === timeFilter)?.maxDays ?? 7;
    const timeFiltered = changesData.filter((c) => c.daysAgo <= maxDays);
    const counts: Record<string, number> = { all: timeFiltered.length };
    timeFiltered.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [timeFilter]);

  // Running index counter for staggered animations across groups
  let globalItemIndex = 0;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Inject animations */}
      <style>{animationStyles}</style>

      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(139, 92, 246, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={22} style={{ color: '#d4a574' }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#f0ebe4',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              <span className="gradient-text">What Changed</span>
            </h1>
            <p style={{ fontSize: 14, color: '#a09888', margin: 0, marginTop: 2 }}>
              Activity digest across the Frequency ecosystem. Track momentum, celebrate wins, and catch what needs attention.
            </p>
          </div>
        </div>
      </div>

      {/* ── "New Since Your Last Visit" Section ── */}
      {newSinceLastVisit.length > 0 && (
        <div
          className="animate-fade-in"
          style={{
            marginBottom: 24,
            animationDelay: '0.03s',
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: 14,
              padding: 1,
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.5), rgba(139, 92, 246, 0.4), rgba(52, 211, 153, 0.3))',
              backgroundSize: '200% 200%',
              animation: 'shimmerHighlight 4s ease-in-out infinite',
            }}
          >
            <div
              style={{
                backgroundColor: '#131720',
                borderRadius: 13,
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    backgroundColor: 'rgba(212, 165, 116, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Eye size={13} style={{ color: '#d4a574' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#d4a574', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  New Since Your Last Visit
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    backgroundColor: 'rgba(212, 165, 116, 0.2)',
                    color: '#d4a574',
                    borderRadius: 8,
                    padding: '2px 8px',
                    animation: 'newBadgePulse 2s ease-in-out infinite',
                  }}
                >
                  {newSinceLastVisit.length} new
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {newSinceLastVisit.map((change) => {
                  const catCfg = categoryConfig[change.category];
                  const sentCfg = sentimentConfig[change.sentiment];
                  const ctCfg = changeTypeConfig[change.changeType];
                  const CtIcon = ctCfg.icon;
                  return (
                    <div
                      key={change.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 8,
                        backgroundColor: change.sentiment === 'positive'
                          ? 'rgba(52, 211, 153, 0.04)'
                          : change.sentiment === 'negative'
                            ? 'rgba(248, 113, 113, 0.04)'
                            : 'rgba(255,255,255,0.02)',
                        borderLeft: `3px solid ${sentCfg.color}`,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onClick={() => toggleExpand(change.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = change.sentiment === 'positive'
                          ? 'rgba(52, 211, 153, 0.04)'
                          : change.sentiment === 'negative'
                            ? 'rgba(248, 113, 113, 0.04)'
                            : 'rgba(255,255,255,0.02)';
                      }}
                    >
                      <CtIcon size={12} style={{ color: ctCfg.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#f0ebe4', fontWeight: 500, flex: 1 }}>
                        {change.description}
                      </span>
                      <span style={{ fontSize: 10, color: '#6b6358', flexShrink: 0 }}>
                        {change.timeAgo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Time Filter ── */}
      <div className="animate-fade-in" style={{ marginBottom: 20, animationDelay: '0.05s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Clock size={14} style={{ color: '#6b6358' }} />
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>
            Time Period
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {timeFilters.map((tf) => {
            const isActive = timeFilter === tf.key;
            return (
              <button
                key={tf.key}
                onClick={() => setTimeFilter(tf.key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  border: isActive ? '1px solid rgba(212, 165, 116, 0.4)' : '1px solid #1e2638',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
                  color: isActive ? '#d4a574' : '#6b6358',
                  fontSize: 13,
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
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Category Filter ── */}
      <div className="animate-fade-in" style={{ marginBottom: 24, animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Filter size={14} style={{ color: '#6b6358' }} />
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>
            Category
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'membership', 'governance', 'nodes', 'financial', 'events', 'culture'] as const).map((cat) => {
            const isActive = categoryFilter === cat;
            const config = cat === 'all' ? { label: 'All', color: '#a09888' } : categoryConfig[cat];
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
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
          })}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div
        className="animate-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 32,
          animationDelay: '0.15s',
        }}
      >
        {/* Total */}
        <div
          className="glow-card"
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 14,
            padding: '16px 20px',
            animation: mounted ? 'statCardEntrance 0.4s ease-out 0.2s both' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: 'rgba(160, 152, 136, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} style={{ color: '#a09888' }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#f0ebe4', letterSpacing: '-0.02em' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Total Changes</div>
        </div>

        {/* Positive */}
        <div
          className="glow-card"
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 14,
            padding: '16px 20px',
            animation: mounted ? 'statCardEntrance 0.4s ease-out 0.28s both' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={16} style={{ color: '#34d399' }} />
            </div>
            <ArrowUpRight size={14} style={{ color: '#34d399' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#34d399', letterSpacing: '-0.02em' }}>
            {stats.positive}
          </div>
          <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Positive</div>
        </div>

        {/* Neutral */}
        <div
          className="glow-card"
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 14,
            padding: '16px 20px',
            animation: mounted ? 'statCardEntrance 0.4s ease-out 0.36s both' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: 'rgba(232, 180, 76, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Minus size={16} style={{ color: '#e8b44c' }} />
            </div>
            <ArrowRight size={14} style={{ color: '#e8b44c' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#e8b44c', letterSpacing: '-0.02em' }}>
            {stats.neutral}
          </div>
          <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Neutral</div>
        </div>

        {/* Needs Attention */}
        <div
          className="glow-card"
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 14,
            padding: '16px 20px',
            animation: mounted ? 'statCardEntrance 0.4s ease-out 0.44s both' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={16} style={{ color: '#f87171' }} />
            </div>
            <ArrowDownRight size={14} style={{ color: '#f87171' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#f87171', letterSpacing: '-0.02em' }}>
            {stats.negative}
          </div>
          <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Needs Attention</div>
        </div>
      </div>

      {/* ── Changelog Timeline ── */}
      <div style={{ position: 'relative' }}>
        {groupedChanges.map((group, groupIdx) => (
          <div key={group.label} style={{ marginBottom: 8 }}>
            {/* Time Period Header / Date Marker */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
                paddingLeft: 20,
                position: 'relative',
                animation: mounted ? `timelineReveal 0.45s ease-out ${0.2 + groupIdx * 0.1}s both` : 'none',
              }}
            >
              {/* Timeline dot for group header */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#d4a574',
                  border: '2px solid #0d1117',
                  boxShadow: '0 0 0 3px rgba(212, 165, 116, 0.2)',
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingLeft: 16,
                }}
              >
                <Calendar size={13} style={{ color: '#d4a574' }} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#d4a574',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {group.label}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#6b6358',
                    backgroundColor: 'rgba(212, 165, 116, 0.1)',
                    borderRadius: 8,
                    padding: '2px 8px',
                  }}
                >
                  {group.items.length} {group.items.length === 1 ? 'change' : 'changes'}
                </span>
              </div>
            </div>

            {/* Change cards in this group */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                paddingLeft: 20,
                position: 'relative',
                marginBottom: 24,
              }}
            >
              {/* Vertical timeline line */}
              <div
                style={{
                  position: 'absolute',
                  left: 5,
                  top: -8,
                  bottom: -16,
                  width: 2,
                  backgroundColor: '#1e2638',
                  zIndex: 0,
                }}
              />

              {group.items.map((change, idx) => {
                const catCfg = categoryConfig[change.category];
                const sentCfg = sentimentConfig[change.sentiment];
                const impCfg = impactConfig[change.impact];
                const ctCfg = changeTypeConfig[change.changeType];
                const CatIcon = catCfg.icon;
                const SentIcon = sentCfg.icon;
                const CtIcon = ctCfg.icon;
                const isExpanded = expandedIds.has(change.id);

                // Diff-style colors
                const diffBorderColor = change.sentiment === 'positive'
                  ? 'rgba(52, 211, 153, 0.25)'  // green for additions
                  : change.sentiment === 'negative'
                    ? 'rgba(248, 113, 113, 0.25)'
                    : 'rgba(212, 165, 116, 0.15)'; // amber for changes/neutral

                const diffAccentColor = change.sentiment === 'positive'
                  ? '#34d399'
                  : change.sentiment === 'negative'
                    ? '#f87171'
                    : '#d4a574';

                const currentGlobalIdx = globalItemIndex++;

                return (
                  <div
                    key={change.id}
                    style={{
                      position: 'relative',
                      paddingLeft: 24,
                      animation: mounted
                        ? `timelineReveal 0.4s ease-out ${0.3 + currentGlobalIdx * 0.05}s both`
                        : 'none',
                    }}
                  >
                    {/* Timeline dot for each item */}
                    <div
                      style={{
                        position: 'absolute',
                        left: -1,
                        top: 18,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: sentCfg.bg,
                        border: `2px solid ${sentCfg.color}`,
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: sentCfg.color,
                        }}
                      />
                    </div>

                    {/* Card */}
                    <div
                      style={{
                        backgroundColor: '#131720',
                        border: `1px solid ${diffBorderColor}`,
                        borderRadius: 14,
                        padding: '18px 22px',
                        borderLeftWidth: 3,
                        borderLeftColor: diffAccentColor,
                        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onClick={() => toggleExpand(change.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2e3a4e';
                        e.currentTarget.style.borderLeftColor = diffAccentColor;
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = diffBorderColor;
                        e.currentTarget.style.borderLeftColor = diffAccentColor;
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* "New" indicator overlay for new items */}
                      {change.isNew && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 50,
                            height: 50,
                            background: 'radial-gradient(circle at top right, rgba(212, 165, 116, 0.1), transparent 70%)',
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      {/* Top row: badges + timestamp */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 10,
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {/* New badge */}
                          {change.isNew && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontSize: 9,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#d4a574',
                                backgroundColor: 'rgba(212, 165, 116, 0.15)',
                                border: '1px solid rgba(212, 165, 116, 0.3)',
                                borderRadius: 6,
                                padding: '2px 7px',
                                animation: 'newBadgePulse 2.5s ease-in-out infinite',
                              }}
                            >
                              NEW
                            </span>
                          )}

                          {/* Change type badge */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: ctCfg.color,
                              backgroundColor: ctCfg.bg,
                              border: ctCfg.border,
                              borderRadius: 8,
                              padding: '3px 9px',
                            }}
                          >
                            <CtIcon size={10} />
                            {ctCfg.label}
                          </span>

                          {/* Sentiment indicator */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: sentCfg.bg,
                              borderRadius: 12,
                              padding: '3px 9px',
                            }}
                          >
                            <SentIcon size={11} style={{ color: sentCfg.color }} />
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: sentCfg.color,
                              }}
                            >
                              {sentCfg.label}
                            </span>
                          </div>

                          {/* Category badge */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: catCfg.color,
                              backgroundColor: `${catCfg.color}15`,
                              borderRadius: 12,
                              padding: '3px 9px',
                            }}
                          >
                            <CatIcon size={10} />
                            {catCfg.label}
                          </span>

                          {/* Impact badge */}
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: impCfg.color,
                              backgroundColor: impCfg.bg,
                              borderRadius: 12,
                              padding: '3px 9px',
                            }}
                          >
                            {impCfg.label}
                          </span>
                        </div>

                        {/* Timestamp + expand indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              color: '#6b6358',
                            }}
                          >
                            <Clock size={10} />
                            {change.timeAgo}
                          </span>
                          <ChevronRight
                            size={14}
                            style={{
                              color: '#4a443e',
                              transition: 'transform 0.2s',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Description with diff-style highlighting */}
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: '#f0ebe4',
                          margin: '0 0 6px 0',
                          lineHeight: 1.4,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                        }}
                      >
                        {/* Diff prefix symbol */}
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: change.sentiment === 'positive' ? '#34d399'
                              : change.sentiment === 'negative' ? '#f87171'
                              : '#d4a574',
                            fontFamily: 'monospace',
                            flexShrink: 0,
                            width: 16,
                            textAlign: 'center',
                            opacity: 0.7,
                          }}
                        >
                          {change.sentiment === 'positive' ? '+' : change.sentiment === 'negative' ? '!' : '~'}
                        </span>
                        <span
                          style={{
                            backgroundColor: change.sentiment === 'positive'
                              ? 'rgba(52, 211, 153, 0.06)'
                              : change.sentiment === 'negative'
                                ? 'rgba(248, 113, 113, 0.06)'
                                : 'rgba(212, 165, 116, 0.06)',
                            borderRadius: 4,
                            padding: '1px 4px',
                          }}
                        >
                          {change.description}
                        </span>
                      </h3>

                      {/* Collapsed preview of detail */}
                      {!isExpanded && (
                        <p
                          style={{
                            fontSize: 13,
                            color: '#6b6358',
                            lineHeight: 1.5,
                            margin: '0 0 8px 24px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '90%',
                          }}
                        >
                          {change.detail}
                        </p>
                      )}

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div
                          style={{
                            marginLeft: 24,
                            animation: 'slideDown 0.3s ease-out both',
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              color: '#a09888',
                              lineHeight: 1.6,
                              margin: '0 0 12px 0',
                            }}
                          >
                            {change.detail}
                          </p>

                          {/* Impact indicators - affected areas */}
                          {change.affectedAreas.length > 0 && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                marginBottom: 10,
                                flexWrap: 'wrap',
                              }}
                            >
                              <Tag size={10} style={{ color: '#4a443e' }} />
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#4a443e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Affected:
                              </span>
                              {change.affectedAreas.map((area, areaIdx) => (
                                <span
                                  key={areaIdx}
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 500,
                                    color: '#8b7a6b',
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 6,
                                    padding: '2px 8px',
                                  }}
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom: triggered by */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 11,
                          color: '#6b6358',
                          marginLeft: 24,
                        }}
                      >
                        <Zap size={10} style={{ color: '#4a443e' }} />
                        <span>
                          Triggered by:{' '}
                          <span style={{ color: '#8b7a6b', fontWeight: 500 }}>
                            {change.triggeredBy}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredChanges.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 40px',
              color: '#6b6358',
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 14,
            }}
          >
            <Filter size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 14, margin: '0 0 4px', color: '#a09888' }}>No changes match your filters</p>
            <p style={{ fontSize: 12, margin: 0 }}>
              Try expanding the time period or selecting a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
