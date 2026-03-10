'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
  Crown,
  Compass,
  User,
  Briefcase,
  Target,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { teamMembers, type MemberTier, type TeamMember } from '@/lib/data';

/* ─── Tier Config ─── */

type TierFilter = 'all' | MemberTier;

interface TierConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
}

const tierConfig: Record<MemberTier, TierConfig> = {
  'core-team': {
    label: 'Core Team',
    bg: 'rgba(212, 165, 116, 0.12)',
    text: '#d4a574',
    border: 'rgba(212, 165, 116, 0.25)',
    icon: Shield,
  },
  board: {
    label: 'Board',
    bg: 'rgba(139, 92, 246, 0.12)',
    text: '#8b5cf6',
    border: 'rgba(139, 92, 246, 0.25)',
    icon: Crown,
  },
  'node-lead': {
    label: 'Node Lead',
    bg: 'rgba(52, 211, 153, 0.12)',
    text: '#34d399',
    border: 'rgba(52, 211, 153, 0.25)',
    icon: Compass,
  },
  member: {
    label: 'Member',
    bg: 'rgba(56, 189, 248, 0.12)',
    text: '#38bdf8',
    border: 'rgba(56, 189, 248, 0.25)',
    icon: User,
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
  // Extract the tailwind color class and return a CSS gradient
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

/* ─── Filter Tabs ─── */

const filterTabs: { key: TierFilter; label: string; count?: (members: TeamMember[]) => number }[] = [
  { key: 'all', label: 'All' },
  { key: 'core-team', label: 'Core Team' },
  { key: 'board', label: 'Board' },
  { key: 'node-lead', label: 'Node Leads' },
  { key: 'member', label: 'Members' },
];

/* ─── Capacity Data ─── */

const capacityData: Record<string, { currentLoad: number; maxCapacity: number; trend: 'overloaded' | 'high' | 'balanced' | 'available' }> = {
  'james': { currentLoad: 35, maxCapacity: 40, trend: 'high' },
  'sian': { currentLoad: 52, maxCapacity: 40, trend: 'overloaded' },
  'alex': { currentLoad: 20, maxCapacity: 30, trend: 'balanced' },
  'max': { currentLoad: 28, maxCapacity: 30, trend: 'high' },
  'dave': { currentLoad: 18, maxCapacity: 25, trend: 'balanced' },
  'andrew': { currentLoad: 12, maxCapacity: 20, trend: 'balanced' },
  'felicia': { currentLoad: 10, maxCapacity: 15, trend: 'balanced' },
  'mafe': { currentLoad: 22, maxCapacity: 25, trend: 'high' },
  'colleen': { currentLoad: 8, maxCapacity: 15, trend: 'available' },
  'greg': { currentLoad: 15, maxCapacity: 20, trend: 'balanced' },
  'raamayan': { currentLoad: 18, maxCapacity: 20, trend: 'high' },
  'gareth': { currentLoad: 12, maxCapacity: 15, trend: 'balanced' },
  'sarah': { currentLoad: 6, maxCapacity: 10, trend: 'available' },
  'nick': { currentLoad: 4, maxCapacity: 8, trend: 'available' },
};

const trendConfig: Record<string, { label: string; color: string; bg: string }> = {
  overloaded: { label: 'Overloaded', color: '#e06060', bg: 'rgba(224, 96, 96, 0.12)' },
  high: { label: 'High Load', color: '#e8b44c', bg: 'rgba(232, 180, 76, 0.12)' },
  balanced: { label: 'Balanced', color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.12)' },
  available: { label: 'Available', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)' },
};

/* ─── Component ─── */

export function TeamView() {
  const [filter, setFilter] = useState<TierFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return teamMembers;
    return teamMembers.filter((m) => m.tier === filter);
  }, [filter]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Steward Team</span>
          </h1>
          <span
            className="text-sm font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(212, 165, 116, 0.12)', color: '#d4a574' }}
          >
            {teamMembers.length} members
          </span>
        </div>
        <p className="text-text-secondary text-sm">
          The stewards powering Frequency&apos;s mission across all nodes and functions.
        </p>
      </div>

      {/* ── Team Capacity Overview ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.03s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Team Capacity Overview
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['overloaded', 'high', 'balanced', 'available'] as const).map((trendKey) => {
            const cfg = trendConfig[trendKey];
            const count = Object.values(capacityData).filter((c) => c.trend === trendKey).length;
            return (
              <div
                key={trendKey}
                className="rounded-lg border px-4 py-3"
                style={{
                  backgroundColor: cfg.bg,
                  borderColor: `${cfg.color}22`,
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

      {/* ── Tier Filter Tabs ── */}
      <div
        className="flex gap-2 flex-wrap animate-fade-in"
        style={{ animationDelay: '0.05s', opacity: 0 }}
      >
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
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                backgroundColor: isActive ? 'rgba(212, 165, 116, 0.12)' : '#131720',
                color: isActive ? '#d4a574' : '#a09888',
                border: `1px solid ${isActive ? 'rgba(212, 165, 116, 0.25)' : '#1e2638'}`,
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

      {/* ── Team Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member, i) => {
          const tier = tierConfig[member.tier];
          const status = statusConfig[member.status];
          const isExpanded = expandedId === member.id;

          return (
            <div
              key={member.id}
              className="glow-card rounded-xl border transition-all animate-fade-in"
              style={{
                backgroundColor: '#131720',
                borderColor: isExpanded ? tier.border : '#1e2638',
                animationDelay: `${0.1 + i * 0.04}s`,
                opacity: 0,
              }}
            >
              {/* ── Card Header ── */}
              <div className="p-5 pb-0">
                <div className="flex items-start gap-3.5">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: avatarGradient(member.color),
                      color: '#0b0d14',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {member.name}
                      </h3>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tier.bg, color: tier.text }}
                      >
                        {tier.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{member.role}</p>
                  </div>
                </div>

                {/* Status + Hours */}
                <div className="flex items-center gap-3 mt-3">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: status.bg, color: status.text }}
                  >
                    {status.label}
                  </span>
                  {member.hoursPerWeek && (
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <Clock size={11} />
                      {member.hoursPerWeek} hrs/wk
                    </span>
                  )}
                </div>
              </div>

              {/* ── Capacity Bar ── */}
              {(() => {
                const cap = capacityData[member.id];
                if (!cap) return null;
                const trend = trendConfig[cap.trend];
                const pct = Math.min((cap.currentLoad / cap.maxCapacity) * 100, 100);
                const isOverloaded = cap.trend === 'overloaded';
                const overflowPct = isOverloaded ? (cap.currentLoad / cap.maxCapacity) * 100 : 0;
                return (
                  <div className="px-5 pt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-text-muted font-medium">
                          {cap.currentLoad}/{cap.maxCapacity} hrs
                        </span>
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: trend.bg, color: trend.color }}
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
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: '#1c2230' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${isOverloaded ? 100 : pct}%`,
                          backgroundColor: trend.color,
                          boxShadow: isOverloaded
                            ? `0 0 8px ${trend.color}, 0 0 16px rgba(224, 96, 96, 0.4)`
                            : 'none',
                          background: isOverloaded
                            ? `linear-gradient(90deg, ${trend.color} ${(100 / overflowPct) * 100}%, #ff4040)`
                            : trend.color,
                        }}
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
              <div className="px-5 pt-3 pb-4">
                {/* Role description */}
                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                  {member.roleOneSentence}
                </p>

                {/* Domains */}
                <div className="mb-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Briefcase size={11} className="text-text-muted" />
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      Domains
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {member.domains.slice(0, isExpanded ? undefined : 3).map((d, j) => (
                      <span
                        key={j}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#1c2230', color: '#a09888' }}
                      >
                        {d.length > 40 ? d.slice(0, 37) + '...' : d}
                      </span>
                    ))}
                    {!isExpanded && member.domains.length > 3 && (
                      <span className="text-[10px] text-text-muted">
                        +{member.domains.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* KPIs */}
                <div className="mb-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Target size={11} className="text-text-muted" />
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      KPIs
                    </span>
                  </div>
                  <div className="space-y-1">
                    {member.kpis.slice(0, isExpanded ? undefined : 3).map((kpi, j) => (
                      <div key={j} className="flex items-start gap-1.5 text-[11px]">
                        <div
                          className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: tier.text }}
                        />
                        <span className="text-text-secondary leading-snug">{kpi}</span>
                      </div>
                    ))}
                    {!isExpanded && member.kpis.length > 3 && (
                      <span className="text-[10px] text-text-muted ml-2.5">
                        +{member.kpis.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Non-Negotiables */}
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertCircle size={11} className="text-text-muted" />
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      Non-Negotiables
                    </span>
                  </div>
                  <div className="space-y-1">
                    {member.nonNegotiables
                      .slice(0, isExpanded ? undefined : 2)
                      .map((nn, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-[11px]">
                          <div
                            className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: '#e06060' }}
                          />
                          <span className="text-text-muted leading-snug italic">{nn}</span>
                        </div>
                      ))}
                    {!isExpanded && member.nonNegotiables.length > 2 && (
                      <span className="text-[10px] text-text-muted ml-2.5">
                        +{member.nonNegotiables.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded extra details */}
                {isExpanded && (
                  <div
                    className="pt-3 mt-3 animate-fade-in"
                    style={{ borderTop: '1px solid #1e2638' }}
                  >
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-text-muted">Tier</span>
                        <div className="text-text-primary font-medium mt-0.5 flex items-center gap-1">
                          {React.createElement(tier.icon, { size: 12, style: { color: tier.text } })}
                          {tier.label}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-muted">Status</span>
                        <div className="text-text-primary font-medium mt-0.5">{status.label}</div>
                      </div>
                      {member.hoursPerWeek && (
                        <div>
                          <span className="text-text-muted">Hours / Week</span>
                          <div className="text-text-primary font-medium mt-0.5">
                            {member.hoursPerWeek}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-text-muted">Domains</span>
                        <div className="text-text-primary font-medium mt-0.5">
                          {member.domains.length} areas
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Expand / Collapse Toggle ── */}
              <button
                onClick={() => toggleExpand(member.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors"
                style={{
                  borderTop: '1px solid #1e2638',
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
          );
        })}
      </div>
    </div>
  );
}
