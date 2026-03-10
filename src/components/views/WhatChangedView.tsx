'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

/* ─── Types ─── */

type TimeFilter = 'today' | 'this-week' | 'this-month';

type Category = 'membership' | 'governance' | 'nodes' | 'financial' | 'events' | 'culture';

type Sentiment = 'positive' | 'neutral' | 'negative';

type ImpactLevel = 'high' | 'medium' | 'low';

interface ChangeItem {
  id: string;
  category: Category;
  sentiment: Sentiment;
  impact: ImpactLevel;
  description: string;
  detail: string;
  triggeredBy: string;
  timestamp: string;
  timeAgo: string;
  daysAgo: number;
}

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
    description: '3 new well-steward applications received this week',
    detail: 'Applications from Costa Rica, UK, and California — all referred by existing members. Essence interviews scheduled.',
    triggeredBy: 'Maximillian',
    timestamp: '2026-03-09',
    timeAgo: '2 hours ago',
    daysAgo: 0,
  },
  {
    id: 'chg-2',
    category: 'financial',
    sentiment: 'positive',
    impact: 'medium',
    description: 'Monthly burn came in at $21.8K — under target',
    detail: 'February burn was $3.2K under the $25K/mo target. Travel costs lower than projected; contractor spend stable.',
    triggeredBy: 'Colleen Galbraith',
    timestamp: '2026-03-09',
    timeAgo: '4 hours ago',
    daysAgo: 0,
  },
  {
    id: 'chg-3',
    category: 'nodes',
    sentiment: 'negative',
    impact: 'high',
    description: 'Nicoya pilot Phase 1 delayed by 2 weeks',
    detail: 'Local permitting process taking longer than expected. Gareth working with community leaders on expedited review.',
    triggeredBy: 'Gareth Hermann',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    daysAgo: 1,
  },
  {
    id: 'chg-4',
    category: 'governance',
    sentiment: 'positive',
    impact: 'medium',
    description: 'Teal governance decision log now maintained for 30 consecutive days',
    detail: 'Every council meeting has produced a documented decision log since February 7. Transparency streak intact.',
    triggeredBy: 'Core Stewardship Team',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    daysAgo: 1,
  },
  {
    id: 'chg-5',
    category: 'events',
    sentiment: 'neutral',
    impact: 'high',
    description: 'Blue Spirit ticket sales at 32/70 — 46% capacity',
    detail: 'Registration pace is on track but not accelerating. Early-bird pricing ends March 31. Marketing push planned.',
    triggeredBy: 'Sian Hodges',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    daysAgo: 1,
  },
  {
    id: 'chg-6',
    category: 'nodes',
    sentiment: 'positive',
    impact: 'high',
    description: 'Map Node MVP specs approved by Wisdom Council',
    detail: 'The coordination layer specs passed Wisdom Council review. Development sprint begins next week with Fairman leading.',
    triggeredBy: 'Wisdom Council',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    daysAgo: 2,
  },
  {
    id: 'chg-7',
    category: 'membership',
    sentiment: 'positive',
    impact: 'high',
    description: 'Member retention improved to 82% (was 78%)',
    detail: 'Pod engagement and monthly calls driving better retention. 4 at-risk members re-engaged after personal outreach.',
    triggeredBy: 'Maximillian',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    daysAgo: 2,
  },
  {
    id: 'chg-8',
    category: 'nodes',
    sentiment: 'positive',
    impact: 'medium',
    description: 'Anthem studio session completed — 3 tracks in production',
    detail: 'Raamayan wrapped a powerful studio session. Cultural heartbeat tracks enter mixing phase next week.',
    triggeredBy: 'Raamayan Ananda',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    daysAgo: 3,
  },
  {
    id: 'chg-9',
    category: 'financial',
    sentiment: 'positive',
    impact: 'medium',
    description: 'DAF compliance review passed with no issues',
    detail: 'Quarterly compliance check completed. All donor-advised fund documentation meets regulatory standards.',
    triggeredBy: 'Colleen Galbraith',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    daysAgo: 3,
  },
  {
    id: 'chg-10',
    category: 'culture',
    sentiment: 'negative',
    impact: 'medium',
    description: 'Pod attendance dropped 15% in February',
    detail: 'Participation dipped across 3 of 4 active pods. Scheduling conflicts cited as primary reason. Pod leads meeting to discuss format changes.',
    triggeredBy: 'Dave Wolstencroft',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    daysAgo: 4,
  },
  {
    id: 'chg-11',
    category: 'nodes',
    sentiment: 'positive',
    impact: 'medium',
    description: 'Capital Node scored 3 new deals this week',
    detail: 'Greg reports 3 new investment opportunities under evaluation, bringing active pipeline to 8 deals total.',
    triggeredBy: 'Greg Berry',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    daysAgo: 4,
  },
  {
    id: 'chg-12',
    category: 'financial',
    sentiment: 'positive',
    impact: 'high',
    description: 'Cash runway extended to 14 months',
    detail: 'Combination of lower burn rate and new membership revenue pushed runway from 12 to 14 months. Healthy position.',
    triggeredBy: 'James Hodges',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    daysAgo: 5,
  },
  {
    id: 'chg-13',
    category: 'governance',
    sentiment: 'positive',
    impact: 'high',
    description: 'Board approved CEO search timeline',
    detail: 'Board agreed to formally begin CEO search after Blue Spirit. James transitions to strategic advisor role by Q4 2026.',
    triggeredBy: 'Board',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    daysAgo: 5,
  },
  {
    id: 'chg-14',
    category: 'nodes',
    sentiment: 'neutral',
    impact: 'medium',
    description: 'DECO framework v1 documentation started',
    detail: 'First draft of the decentralized coordination framework is underway. Targeting completion by end of March.',
    triggeredBy: 'Alex James Fairman',
    timestamp: '2026-03-03',
    timeAgo: '6 days ago',
    daysAgo: 6,
  },
  {
    id: 'chg-15',
    category: 'culture',
    sentiment: 'positive',
    impact: 'low',
    description: "Women's Council charter drafting began",
    detail: 'An emerging group of women stewards initiated a formal charter to define purpose, cadence, and decision authority.',
    triggeredBy: 'Community Members',
    timestamp: '2026-03-02',
    timeAgo: '1 week ago',
    daysAgo: 7,
  },
  {
    id: 'chg-16',
    category: 'membership',
    sentiment: 'neutral',
    impact: 'medium',
    description: 'Membership tier restructuring proposal submitted',
    detail: 'New tiered pricing model proposed with Steward ($500/yr), Guardian ($2,500/yr), and Founder ($10K/yr) levels.',
    triggeredBy: 'Maximillian',
    timestamp: '2026-03-01',
    timeAgo: '8 days ago',
    daysAgo: 8,
  },
  {
    id: 'chg-17',
    category: 'events',
    sentiment: 'positive',
    impact: 'medium',
    description: 'Cabo 5.0 post-event survey completed — 9.3 NPS',
    detail: 'Final survey results in. Strongest scores in community connection and governance sessions. Food scored lowest.',
    triggeredBy: 'Sian Hodges',
    timestamp: '2026-02-25',
    timeAgo: '12 days ago',
    daysAgo: 12,
  },
  {
    id: 'chg-18',
    category: 'governance',
    sentiment: 'neutral',
    impact: 'low',
    description: 'Node lead quarterly report template finalized',
    detail: 'Standardized reporting template approved. All node leads will use it starting Q2 2026.',
    triggeredBy: 'Core Stewardship Team',
    timestamp: '2026-02-20',
    timeAgo: '17 days ago',
    daysAgo: 17,
  },
];

/* ─── Component ─── */

export function WhatChangedView() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this-week');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  /* Derived data */
  const filteredChanges = useMemo(() => {
    const maxDays = timeFilters.find((t) => t.key === timeFilter)?.maxDays ?? 7;
    return changesData.filter((c) => {
      const inTime = c.daysAgo <= maxDays;
      const inCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return inTime && inCategory;
    });
  }, [timeFilter, categoryFilter]);

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

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Sparkles size={28} style={{ color: '#d4a574' }} />
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
        </div>
        <p style={{ fontSize: 14, color: '#a09888', margin: 0, paddingLeft: 40 }}>
          Activity digest across the Frequency ecosystem &middot; Track momentum, celebrate wins, and catch what needs attention.
        </p>
      </div>

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

      {/* ── Change Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredChanges.map((change, idx) => {
          const catCfg = categoryConfig[change.category];
          const sentCfg = sentimentConfig[change.sentiment];
          const impCfg = impactConfig[change.impact];
          const CatIcon = catCfg.icon;
          const SentIcon = sentCfg.icon;

          return (
            <div
              key={change.id}
              className="animate-fade-in"
              style={{
                backgroundColor: '#131720',
                border: '1px solid #1e2638',
                borderRadius: 14,
                padding: '20px 24px',
                borderLeftWidth: 3,
                borderLeftColor: sentCfg.color,
                transition: 'border-color 0.2s, box-shadow 0.2s',
                animationDelay: `${0.2 + idx * 0.04}s`,
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2e3a4e';
                e.currentTarget.style.borderLeftColor = sentCfg.color;
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e2638';
                e.currentTarget.style.borderLeftColor = sentCfg.color;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Top row: sentiment indicator + badges + timestamp */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Sentiment indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: sentCfg.bg,
                      borderRadius: 12,
                      padding: '3px 10px',
                    }}
                  >
                    <SentIcon size={12} style={{ color: sentCfg.color }} />
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: catCfg.color,
                      backgroundColor: `${catCfg.color}15`,
                      borderRadius: 12,
                      padding: '3px 10px',
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
                      padding: '3px 10px',
                    }}
                  >
                    {impCfg.label}
                  </span>
                </div>

                {/* Timestamp */}
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
              </div>

              {/* Description */}
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#f0ebe4',
                  margin: '0 0 6px 0',
                  lineHeight: 1.4,
                }}
              >
                {change.description}
              </h3>

              {/* Detail */}
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

              {/* Bottom: triggered by */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: '#6b6358',
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
          );
        })}

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
