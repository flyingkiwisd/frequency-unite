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

/* ─── Component ─── */

export function TeamView() {
  const { teamMembers } = useFrequencyData();
  const [filter, setFilter] = useState<TierFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

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

  /* ─── Hours progress bar max ─── */
  const maxHoursDisplay = 40;

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

      {/* ── Team Stats Summary ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.03s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Team Overview
          </span>
        </div>
        <div
          className="glow-card rounded-xl border p-5"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {/* Total Members */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Users size={13} style={{ color: '#d4a574' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#d4a574' }}>
                  Total
                </span>
              </div>
              <div className="text-2xl font-bold text-text-primary">{totalMembers}</div>
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
              <div className="text-2xl font-bold text-text-primary">{avgHoursPerWeek}</div>
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
              <div className="text-2xl font-bold text-text-primary">{avgCapacity}%</div>
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
              <div className="text-2xl font-bold" style={{ color: atRiskCount > 0 ? '#e06060' : '#6b8f71' }}>
                {atRiskCount}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">{atRiskCount === 1 ? 'member' : 'members'} overloaded</div>
            </div>
          </div>

          {/* ── Tier Distribution Bar ── */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #1e2638' }}>
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
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
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

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {/* List header */}
          <div
            className="grid items-center gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted animate-fade-in"
            style={{
              gridTemplateColumns: '2.5fr 1fr 1fr 1.5fr 1fr',
              animationDelay: '0.08s',
              opacity: 0,
            }}
          >
            <span>Member</span>
            <span>Tier</span>
            <span>Status</span>
            <span>Hours / Capacity</span>
            <span>Activity</span>
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

            return (
              <div
                key={member.id}
                className="grid items-center gap-4 rounded-lg border px-4 py-3 transition-all animate-fade-in"
                style={{
                  gridTemplateColumns: '2.5fr 1fr 1fr 1.5fr 1fr',
                  background: isHovered
                    ? `linear-gradient(135deg, #131720 60%, ${cardGradient(member.color)})`
                    : '#131720',
                  borderColor: isHovered ? `${accent}33` : '#1e2638',
                  animationDelay: `${0.1 + i * 0.03}s`,
                  opacity: 0,
                }}
                onMouseEnter={() => setHoveredCardId(member.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                {/* Name + Role */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: avatarGradient(member.color),
                        color: '#0b0d14',
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                      style={{
                        backgroundColor: actCfg.color,
                        borderColor: '#131720',
                        boxShadow: `0 0 4px ${actCfg.color}`,
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate">{member.name}</div>
                    <div className="text-[11px] text-text-muted truncate">{member.shortRole}</div>
                  </div>
                </div>

                {/* Tier */}
                <div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: tier.bg, color: tier.text }}
                  >
                    {tier.label}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: status.bg, color: status.text }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Hours + capacity bar */}
                <div className="flex items-center gap-2.5">
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
                          backgroundColor: accent,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: actCfg.color, boxShadow: `0 0 4px ${actCfg.color}` }}
                  />
                  <span className="text-[10px] text-text-secondary truncate">{actCfg.label}</span>
                </div>

                {/* Hover tooltip for role description */}
                {isHovered && (
                  <div
                    className="text-[11px] text-text-secondary leading-relaxed pt-1 pb-0.5 animate-fade-in"
                    style={{ gridColumn: '1 / -1', animationDuration: '0.2s' }}
                  >
                    {member.roleOneSentence}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Grid View — Enhanced Cards ── */}
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
            const accent = memberAccentColor(member.color);
            const isHovered = hoveredCardId === member.id;
            const hoursNum = parseHoursToNumber(member.hoursPerWeek);
            const hoursPct = Math.min((hoursNum / maxHoursDisplay) * 100, 100);

            return (
              <div
                key={member.id}
                className="glow-card rounded-xl border transition-all animate-fade-in"
                style={{
                  background: isHovered
                    ? `linear-gradient(160deg, #131720 40%, ${cardGradient(member.color)} 100%)`
                    : `linear-gradient(160deg, #131720 70%, ${cardGradient(member.color)} 100%)`,
                  borderColor: isHovered ? `${accent}44` : isExpanded ? tier.border : '#1e2638',
                  animationDelay: `${0.1 + i * 0.04}s`,
                  opacity: 0,
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered ? `0 8px 32px ${cardGradient(member.color)}` : 'none',
                }}
                onMouseEnter={() => setHoveredCardId(member.id)}
                onMouseLeave={() => setHoveredCardId(null)}
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
                          boxShadow: isHovered ? `0 0 16px ${accent}44` : 'none',
                          transition: 'box-shadow 0.3s ease',
                        }}
                      >
                        {member.avatar}
                      </div>
                      {/* Activity / status indicator dot */}
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

                  {/* Status + Hours Progress + Quick Actions */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: status.bg, color: status.text }}
                      >
                        {status.label}
                      </span>
                      {member.hoursPerWeek && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-text-muted flex items-center gap-1">
                            <Clock size={11} />
                            {member.hoursPerWeek}
                          </span>
                          {/* Mini hours progress bar */}
                          <div
                            className="w-12 h-1.5 rounded-full overflow-hidden"
                            style={{ backgroundColor: '#1c2230' }}
                            title={`${member.hoursPerWeek} hrs/week`}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${hoursPct}%`,
                                backgroundColor: accent,
                                opacity: 0.75,
                              }}
                            />
                          </div>
                        </div>
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

                {/* ── Domain Tags as Pills ── */}
                <div className="px-5 pt-2.5">
                  <div className="flex flex-wrap gap-1">
                    {member.domains.slice(0, isExpanded ? undefined : 3).map((d, j) => (
                      <span
                        key={j}
                        className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${accent}12`,
                          color: '#a09888',
                          border: `1px solid ${accent}20`,
                        }}
                      >
                        {d.length > 35 ? d.slice(0, 32) + '...' : d}
                      </span>
                    ))}
                    {!isExpanded && member.domains.length > 3 && (
                      <span
                        className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                        style={{ color: '#6b6358' }}
                      >
                        +{member.domains.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Skill Tags ── */}
                {memberSkills.length > 0 && (
                  <div className="px-5 pt-2">
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

                {/* ── Hover: Role description reveal ── */}
                {isHovered && !isExpanded && (
                  <div
                    className="px-5 pt-2.5"
                    style={{ animation: 'fadeIn 0.25s ease-out forwards' }}
                  >
                    <p className="text-[11px] text-text-secondary leading-relaxed italic">
                      {member.roleOneSentence}
                    </p>
                  </div>
                )}

                {/* ── Capacity Bar ── */}
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
                  {/* Role description (always visible when expanded) */}
                  {isExpanded && (
                    <p className="text-xs text-text-secondary leading-relaxed mb-3">
                      {member.roleOneSentence}
                    </p>
                  )}

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
      {(viewMode === 'grid' || viewMode === 'list') && filtered.length === 0 && (
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
