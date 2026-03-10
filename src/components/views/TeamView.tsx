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
} from 'lucide-react';
import { teamMembers, type MemberTier, type TeamMember } from '@/lib/data';

/* ─── Tier Config ─── */

type TierFilter = 'all' | MemberTier;
type ViewMode = 'grid' | 'org-chart';

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

/* ─── Component ─── */

export function TeamView() {
  const [filter, setFilter] = useState<TierFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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
  }, [filter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /* ─── Computed Stats ─── */
  const totalMembers = teamMembers.length;
  const totalHours = useMemo(() => {
    return Object.values(capacityData).reduce((sum, c) => sum + c.currentLoad, 0);
  }, []);
  const avgCapacity = useMemo(() => {
    const entries = Object.values(capacityData);
    const totalPct = entries.reduce((sum, c) => sum + (c.currentLoad / c.maxCapacity) * 100, 0);
    return Math.round(totalPct / entries.length);
  }, []);
  const atRiskCount = useMemo(() => {
    return Object.values(capacityData).filter((c) => c.trend === 'overloaded').length;
  }, []);

  /* ─── Org Chart Node Renderer ─── */
  const renderOrgNode = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return null;
    const tier = tierConfig[member.tier];
    const activity = activityData[member.id] || 'red';
    const actCfg = activityConfig[activity];
    return (
      <div
        key={member.id}
        className="glow-card rounded-lg border px-4 py-3 text-center relative"
        style={{
          backgroundColor: '#131720',
          borderColor: '#1e2638',
          minWidth: '130px',
        }}
      >
        <div
          className="w-3 h-3 rounded-full absolute top-2 right-2"
          style={{ backgroundColor: actCfg.color, boxShadow: `0 0 6px ${actCfg.color}` }}
          title={actCfg.label}
        />
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1.5"
          style={{
            background: avatarGradient(member.color),
            color: '#0b0d14',
          }}
        >
          {member.avatar}
        </div>
        <div className="text-xs font-semibold text-text-primary truncate">{member.name.split(' ')[0]}</div>
        <div className="text-[10px] text-text-muted truncate">{member.shortRole}</div>
        <span
          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-1"
          style={{ backgroundColor: tier.bg, color: tier.text }}
        >
          {tier.label}
        </span>
      </div>
    );
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

      {/* ── Search Bar ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.02s', opacity: 0 }}
      >
        <div
          className="flex items-center gap-3 rounded-lg border px-4 py-2.5"
          style={{
            backgroundColor: '#131720',
            borderColor: '#1e2638',
          }}
        >
          <Search size={16} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, role, domain, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-text-muted hover:text-text-primary text-xs font-medium flex-shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Team Stats Dashboard ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.03s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Team Dashboard
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className="glow-card rounded-lg border px-4 py-3"
            style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users size={13} style={{ color: '#d4a574' }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#d4a574' }}>
                Total Members
              </span>
            </div>
            <div className="text-2xl font-bold text-text-primary">{totalMembers}</div>
            <div className="text-[10px] text-text-muted mt-0.5">across all tiers</div>
          </div>
          <div
            className="glow-card rounded-lg border px-4 py-3"
            style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock size={13} style={{ color: '#8b5cf6' }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>
                Total Hours/Week
              </span>
            </div>
            <div className="text-2xl font-bold text-text-primary">{totalHours}</div>
            <div className="text-[10px] text-text-muted mt-0.5">combined workload</div>
          </div>
          <div
            className="glow-card rounded-lg border px-4 py-3"
            style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} style={{ color: '#34d399' }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#34d399' }}>
                Avg Capacity
              </span>
            </div>
            <div className="text-2xl font-bold text-text-primary">{avgCapacity}%</div>
            <div className="text-[10px] text-text-muted mt-0.5">utilization rate</div>
          </div>
          <div
            className="glow-card rounded-lg border px-4 py-3"
            style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={13} style={{ color: '#e06060' }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#e06060' }}>
                At Risk
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: atRiskCount > 0 ? '#e06060' : '#6b8f71' }}>
              {atRiskCount}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">{atRiskCount === 1 ? 'member' : 'members'} overloaded</div>
          </div>
        </div>
      </div>

      {/* ── Team Capacity Overview ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.04s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Capacity Breakdown
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

      {/* ── View Toggle + Filter Tabs ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in"
        style={{ animationDelay: '0.05s', opacity: 0 }}
      >
        {/* View Mode Toggle */}
        <div
          className="flex items-center gap-1 rounded-lg border p-1"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              backgroundColor: viewMode === 'grid' ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
              color: viewMode === 'grid' ? '#d4a574' : '#6b6358',
            }}
          >
            <LayoutGrid size={13} />
            Grid
          </button>
          <button
            onClick={() => setViewMode('org-chart')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              backgroundColor: viewMode === 'org-chart' ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
              color: viewMode === 'org-chart' ? '#d4a574' : '#6b6358',
            }}
          >
            <GitBranch size={13} />
            Org Chart
          </button>
        </div>

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
      </div>

      {/* ── Org Chart View ── */}
      {viewMode === 'org-chart' && (
        <div
          className="animate-fade-in"
          style={{ animationDelay: '0.08s', opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-0">
            {orgChartLevels.map((level, levelIdx) => (
              <React.Fragment key={level.label}>
                {/* Vertical connector from previous level */}
                {levelIdx > 0 && (
                  <div
                    className="w-px"
                    style={{
                      height: '24px',
                      backgroundColor: '#1e2638',
                    }}
                  />
                )}

                {/* Level label */}
                <div className="mb-2">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(212, 165, 116, 0.08)', color: '#6b6358' }}
                  >
                    {level.label}
                  </span>
                </div>

                {/* Horizontal connector bar for multi-member levels */}
                {level.members.length > 1 && (
                  <div className="relative flex items-center justify-center w-full mb-0" style={{ height: '12px' }}>
                    <div
                      className="absolute"
                      style={{
                        height: '1px',
                        backgroundColor: '#1e2638',
                        left: `calc(50% - ${(level.members.length - 1) * 40}px)`,
                        right: `calc(50% - ${(level.members.length - 1) * 40}px)`,
                        top: '0',
                      }}
                    />
                    {level.members.map((_, mIdx) => (
                      <div
                        key={mIdx}
                        className="absolute"
                        style={{
                          width: '1px',
                          height: '12px',
                          backgroundColor: '#1e2638',
                          left: `calc(50% + ${(mIdx - (level.members.length - 1) / 2) * 80}px)`,
                          top: '0',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Member nodes */}
                <div className="flex flex-wrap justify-center gap-3">
                  {level.members.map((memberId) => renderOrgNode(memberId))}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ── Team Grid ── */}
      {viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member, i) => {
            const tier = tierConfig[member.tier];
            const status = statusConfig[member.status];
            const isExpanded = expandedId === member.id;
            const cap = capacityData[member.id];
            const memberSkills = skillsMap[member.id] || [];
            const activity = activityData[member.id] || 'red';
            const actCfg = activityConfig[activity];

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
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          background: avatarGradient(member.color),
                          color: '#0b0d14',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {member.avatar}
                      </div>
                      {/* Activity indicator dot */}
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                        style={{
                          backgroundColor: actCfg.color,
                          borderColor: '#131720',
                          boxShadow: `0 0 6px ${actCfg.color}`,
                        }}
                        title={actCfg.label}
                      />
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

                  {/* Status + Hours + Quick Actions */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
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
                    {/* Quick Contact Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-md transition-colors hover:bg-white/5"
                        title="Send Email"
                        style={{ color: '#6b6358' }}
                      >
                        <Mail size={13} />
                      </button>
                      <button
                        className="p-1.5 rounded-md transition-colors hover:bg-white/5"
                        title="Open Chat"
                        style={{ color: '#6b6358' }}
                      >
                        <MessageSquare size={13} />
                      </button>
                      <button
                        className="p-1.5 rounded-md transition-colors hover:bg-white/5"
                        title="View Steward OS"
                        style={{ color: '#6b6358' }}
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Skill Tags ── */}
                {memberSkills.length > 0 && (
                  <div className="px-5 pt-2.5">
                    <div className="flex flex-wrap gap-1">
                      {memberSkills.map((skill, sIdx) => (
                        <span
                          key={skill}
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${skillColors[sIdx % skillColors.length]}15`,
                            color: skillColors[sIdx % skillColors.length],
                            border: `1px solid ${skillColors[sIdx % skillColors.length]}25`,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Capacity Bar (inline) ── */}
                {(() => {
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
                        <div>
                          <span className="text-text-muted">Activity</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: actCfg.color }}
                            />
                            <span className="text-text-primary font-medium">{actCfg.label}</span>
                          </div>
                        </div>
                        {cap && (
                          <div>
                            <span className="text-text-muted">Capacity</span>
                            <div className="text-text-primary font-medium mt-0.5">
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
      )}

      {/* ── Empty State ── */}
      {viewMode === 'grid' && filtered.length === 0 && (
        <div
          className="text-center py-12 animate-fade-in rounded-xl border"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <UserCheck size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary">
            No team members match your search.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setFilter('all'); }}
            className="mt-3 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: '#d4a574', backgroundColor: 'rgba(212, 165, 116, 0.12)' }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
