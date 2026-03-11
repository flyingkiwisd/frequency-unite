'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Heart,
  Landmark,
  TreePine,
  BookOpen,
  Settings,
  Calendar,
  Users,
  Activity,
  MessageCircle,
  Clock,
  CheckCircle2,
  Star,
  BarChart3,
  PenLine,
  ChevronDown,
  ChevronUp,
  Filter,
  Target,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ─── Types ─── */

type PodStatus = 'forming' | 'active' | 'thriving';
type PodType = 'strategy' | 'operations' | 'culture' | 'creative';
type HealthLevel = 'green' | 'amber' | 'red';

interface PodGoal {
  text: string;
  progress: number;
}

interface PodMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

interface Pod {
  name: string;
  lead: string;
  icon: React.ElementType;
  color: string;
  memberCount: number;
  targetMembers: string;
  status: PodStatus;
  type: PodType;
  nextMeeting: string;
  meetingFrequency: string;
  description: string;
  health: HealthLevel;
  activityScore: number;
  goals: PodGoal[];
  members: PodMember[];
  meetingsThisMonth: number[];
}

/* ─── Data ─── */

const resolveMember = (id: string): PodMember | null => {
  const m = teamMembers.find((tm) => tm.id === id);
  if (!m) return null;
  return { id: m.id, name: m.name.split(' ')[0], avatar: m.avatar, color: m.color };
};

const pods: Pod[] = [
  {
    name: 'Purpose Pod',
    lead: 'James',
    icon: Compass,
    color: '#d4a574',
    memberCount: 6,
    targetMembers: '8-12',
    status: 'active',
    type: 'strategy',
    nextMeeting: 'April 7, 2026',
    meetingFrequency: 'Weekly',
    description: 'Vision, North Star alignment, and strategic direction. Holds the why behind every initiative and ensures all nodes serve the larger purpose.',
    health: 'green',
    activityScore: 88,
    goals: [
      { text: 'Define 2026 North Star metrics', progress: 75 },
      { text: 'Align all nodes on thesis of change', progress: 60 },
      { text: 'Strategic planning for H2', progress: 30 },
    ],
    members: [
      resolveMember('james')!, resolveMember('fairman')!, resolveMember('dave')!,
      resolveMember('sian')!, resolveMember('andrew')!, resolveMember('colleen')!,
    ].filter(Boolean),
    meetingsThisMonth: [3, 10, 17, 24],
  },
  {
    name: 'Capital Pod',
    lead: 'Greg',
    icon: Landmark,
    color: '#e8b44c',
    memberCount: 4,
    targetMembers: '8-12',
    status: 'forming',
    type: 'strategy',
    nextMeeting: 'April 9, 2026',
    meetingFrequency: 'Bi-weekly',
    description: 'Investment evaluation, deal flow management, and capital stewardship. Bridges regenerative finance with real-world impact.',
    health: 'amber',
    activityScore: 72,
    goals: [
      { text: 'Score next batch of 5 deals', progress: 45 },
      { text: 'DAF deployment framework', progress: 55 },
      { text: 'Investor relations pipeline', progress: 20 },
    ],
    members: [
      resolveMember('greg')!, resolveMember('james')!, resolveMember('colleen')!, resolveMember('fairman')!,
    ].filter(Boolean),
    meetingsThisMonth: [9, 23],
  },
  {
    name: 'Bioregion Pod',
    lead: 'Gareth',
    icon: TreePine,
    color: '#6b8f71',
    memberCount: 5,
    targetMembers: '8-12',
    status: 'forming',
    type: 'operations',
    nextMeeting: 'April 11, 2026',
    meetingFrequency: 'Bi-weekly',
    description: 'Community regeneration and local impact in specific bioregions. Land-based projects, indigenous collaboration, and place-based transformation.',
    health: 'green',
    activityScore: 82,
    goals: [
      { text: 'Nicoya pilot Phase 1 launch', progress: 40 },
      { text: 'Community partnerships mapped', progress: 65 },
      { text: 'Replicable bioregion template', progress: 15 },
    ],
    members: [
      resolveMember('gareth')!, resolveMember('james')!, resolveMember('fairman')!,
      resolveMember('sian')!, resolveMember('sarah')!,
    ].filter(Boolean),
    meetingsThisMonth: [4, 11, 25],
  },
  {
    name: 'Culture Pod',
    lead: 'Andrew / Felicia',
    icon: Heart,
    color: '#e879a0',
    memberCount: 7,
    targetMembers: '8-12',
    status: 'thriving',
    type: 'culture',
    nextMeeting: 'April 8, 2026',
    meetingFrequency: 'Weekly',
    description: 'Coherence practices, inner work, and the living culture of Frequency. Holds the relational and somatic field of the community.',
    health: 'green',
    activityScore: 92,
    goals: [
      { text: 'Pod facilitator training program', progress: 50 },
      { text: 'Coherence practices integrated', progress: 80 },
      { text: "Women's Council charter", progress: 35 },
    ],
    members: [
      resolveMember('andrew')!, resolveMember('felicia')!, resolveMember('dave')!,
      resolveMember('james')!, resolveMember('sian')!, resolveMember('sarah')!, resolveMember('mafe')!,
    ].filter(Boolean),
    meetingsThisMonth: [1, 8, 15, 22, 29],
  },
  {
    name: 'Narrative Pod',
    lead: 'Raamayan',
    icon: BookOpen,
    color: '#8b5cf6',
    memberCount: 3,
    targetMembers: '8-12',
    status: 'forming',
    type: 'creative',
    nextMeeting: 'April 14, 2026',
    meetingFrequency: 'Bi-weekly',
    description: 'Storytelling, movement building, and narrative infrastructure. Crafts the language and media that carry the Frequency signal into the world.',
    health: 'red',
    activityScore: 48,
    goals: [
      { text: 'Anthem production milestone', progress: 25 },
      { text: 'Distribution capacity built', progress: 15 },
      { text: 'Cultural narrative framework', progress: 30 },
    ],
    members: [
      resolveMember('raamayan')!, resolveMember('james')!, resolveMember('fairman')!,
    ].filter(Boolean),
    meetingsThisMonth: [14, 28],
  },
  {
    name: 'Operations Pod',
    lead: 'Sian',
    icon: Settings,
    color: '#5eaed4',
    memberCount: 5,
    targetMembers: '8-12',
    status: 'active',
    type: 'operations',
    nextMeeting: 'April 10, 2026',
    meetingFrequency: 'Weekly',
    description: 'Process, systems, and membership operations. The backbone that makes everything else possible -- CRM, communications, event logistics, onboarding.',
    health: 'green',
    activityScore: 86,
    goals: [
      { text: 'Airtable migration complete', progress: 70 },
      { text: 'Blue Spirit registration live', progress: 40 },
      { text: 'Ops running without heroics', progress: 55 },
    ],
    members: [
      resolveMember('sian')!, resolveMember('mafe')!, resolveMember('nipun')!,
      resolveMember('colleen')!, resolveMember('james')!,
    ].filter(Boolean),
    meetingsThisMonth: [3, 10, 17, 24],
  },
];

const podStatusConfig: Record<PodStatus, { bg: string; text: string; label: string }> = {
  forming: { bg: 'rgba(232, 180, 76, 0.15)', text: '#e8b44c', label: 'Forming' },
  active: { bg: 'rgba(107, 143, 113, 0.15)', text: '#6b8f71', label: 'Active' },
  thriving: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', label: 'Thriving' },
};

const healthConfig: Record<HealthLevel, { color: string; bg: string; label: string; glow: string }> = {
  green: { color: '#6b8f71', bg: 'rgba(107,143,113,0.15)', label: 'Healthy', glow: 'rgba(107,143,113,0.3)' },
  amber: { color: '#e8b44c', bg: 'rgba(232,180,76,0.15)', label: 'Needs Attention', glow: 'rgba(232,180,76,0.3)' },
  red: { color: '#e06060', bg: 'rgba(224,96,96,0.15)', label: 'At Risk', glow: 'rgba(224,96,96,0.3)' },
};

const podTypeConfig: Record<PodType, { label: string; color: string }> = {
  strategy: { label: 'Strategy', color: '#d4a574' },
  operations: { label: 'Operations', color: '#5eaed4' },
  culture: { label: 'Culture', color: '#e879a0' },
  creative: { label: 'Creative', color: '#8b5cf6' },
};

/* ─── Coherence Practices ─── */

interface Practice {
  name: string;
  schedule: string;
  facilitator: string;
  icon: React.ElementType;
  color: string;
}

const practices: Practice[] = [
  { name: 'Breathwork Circle', schedule: 'Wednesday 7am MT', facilitator: 'Andrew', icon: Activity, color: '#e879a0' },
  { name: 'Full Community Coherence Call', schedule: 'Monthly (2nd Saturday)', facilitator: 'Rotating', icon: Users, color: '#d4a574' },
  { name: 'Opening Ceremony Design', schedule: 'Pre-event (as needed)', facilitator: 'Culture Pod', icon: Star, color: '#8b5cf6' },
  { name: 'Essence Interviews', schedule: 'Ongoing', facilitator: 'Max', icon: MessageCircle, color: '#5eaed4' },
];

/* ─── Pod Health Table Data ─── */

interface PodHealthRow {
  pod: string;
  attendance: number;
  facilitatorStatus: 'trained' | 'in-training' | 'needed';
  satisfaction: string;
}

const podHealth: PodHealthRow[] = [
  { pod: 'Purpose Pod', attendance: 88, facilitatorStatus: 'trained', satisfaction: 'Strong alignment' },
  { pod: 'Capital Pod', attendance: 75, facilitatorStatus: 'in-training', satisfaction: 'Engaged' },
  { pod: 'Bioregion Pod', attendance: 82, facilitatorStatus: 'trained', satisfaction: 'Energized' },
  { pod: 'Culture Pod', attendance: 90, facilitatorStatus: 'trained', satisfaction: 'Deep connection' },
  { pod: 'Narrative Pod', attendance: 78, facilitatorStatus: 'needed', satisfaction: 'Finding rhythm' },
  { pod: 'Operations Pod', attendance: 85, facilitatorStatus: 'trained', satisfaction: 'Efficient' },
];

const facilitatorStatusConfig: Record<PodHealthRow['facilitatorStatus'], { color: string; label: string; bg: string }> = {
  trained: { color: '#6b8f71', label: 'Trained', bg: 'rgba(107, 143, 113, 0.15)' },
  'in-training': { color: '#e8b44c', label: 'In Training', bg: 'rgba(232, 180, 76, 0.15)' },
  needed: { color: '#e06060', label: 'Needed', bg: 'rgba(224, 96, 96, 0.15)' },
};

/* ─── Journal Entries ─── */

interface JournalEntry {
  text: string;
  author: string;
  context: string;
  date: string;
}

const journalEntries: JournalEntry[] = [
  {
    text: 'Post-Cabo: The masculine-feminine balance work landed deeply. Group heart connection was the strongest we\'ve experienced.',
    author: 'Andrew',
    context: 'After Cabo Retreat',
    date: 'Jan 2026',
  },
  {
    text: 'The Teal governance shift is not just structural \u2014 it\'s a consciousness shift. We\'re learning to lead from a different place.',
    author: 'Felicia',
    context: 'Governance Reflection',
    date: 'Feb 2026',
  },
];

/* ─── Gender Balance ─── */

interface BalanceRow {
  group: string;
  male: number;
  female: number;
}

const genderBalance: BalanceRow[] = [
  { group: 'Core Team', male: 5, female: 4 },
  { group: 'Node Leads', male: 3, female: 1 },
  { group: 'Board', male: 1, female: 0 },
];

/* ─── Sub Components ─── */

// Overlapping Avatar Circles
function AvatarStack({ members, max = 5 }: { members: PodMember[]; max?: number }) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((m, i) => (
        <div
          key={m.id}
          title={m.name}
          className={m.color}
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            border: '2px solid #131720',
            marginLeft: i === 0 ? 0 : -8,
            zIndex: max - i,
            position: 'relative',
            transition: 'transform 0.2s',
          }}
        >
          {m.avatar}
        </div>
      ))}
      {overflow > 0 && (
        <div style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,
          fontWeight: 700,
          color: '#a09888',
          backgroundColor: '#1c2230',
          border: '2px solid #131720',
          marginLeft: -8,
          zIndex: 0,
          position: 'relative',
        }}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

// Health Indicator Dot with pulse
function HealthIndicator({ health, showLabel = true }: { health: HealthLevel; showLabel?: boolean }) {
  const cfg = healthConfig[health];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 10, height: 10 }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: cfg.color,
        }} />
        {/* Pulse animation ring */}
        <div style={{
          position: 'absolute',
          inset: -3,
          borderRadius: '50%',
          border: `2px solid ${cfg.color}`,
          animation: health === 'red' ? 'pulse-glow 2s ease-in-out infinite' : 'none',
          opacity: 0.4,
        }} />
      </div>
      {showLabel && (
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: cfg.color,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {cfg.label}
        </span>
      )}
    </div>
  );
}

// Mini Calendar Grid
function MeetingCalendar({ days, color }: { days: number[]; color: string }) {
  const totalDays = 30;
  const daySet = new Set(days);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 2,
    }}>
      {Array.from({ length: totalDays }, (_, i) => {
        const day = i + 1;
        const hasMeeting = daySet.has(day);
        return (
          <div
            key={day}
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: hasMeeting ? `${color}30` : '#1c2230',
              border: hasMeeting ? `1px solid ${color}60` : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 7,
              fontWeight: hasMeeting ? 700 : 400,
              color: hasMeeting ? color : '#3a3a3a',
            }}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}

// Goal Progress Bar
function GoalProgress({ goal, color, delay }: { goal: PodGoal; color: string; delay: number }) {
  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#a09888', lineHeight: 1.3 }}>{goal.text}</span>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
          marginLeft: 8,
          flexShrink: 0,
        }}>
          {goal.progress}%
        </span>
      </div>
      <div style={{ height: 4, backgroundColor: '#1c2230', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${goal.progress}%`,
          backgroundColor: color,
          borderRadius: 2,
          transition: 'width 0.8s ease-out',
          opacity: 0.8,
        }} />
      </div>
    </div>
  );
}

// Pod Connection Lines SVG
function PodConnections({ podColor, members }: { podColor: string; members: PodMember[] }) {
  if (members.length < 2) return null;
  const centerX = 60;
  const centerY = 30;
  const radius = 24;

  return (
    <svg width={120} height={60} style={{ position: 'absolute', bottom: -4, right: 8, opacity: 0.15, pointerEvents: 'none' }}>
      {members.slice(0, 5).map((_, i) => {
        const angle = (i / Math.min(members.length, 5)) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return (
          <g key={i}>
            <line
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke={podColor}
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <circle cx={x} cy={y} r={3} fill={podColor} />
          </g>
        );
      })}
      <circle cx={centerX} cy={centerY} r={4} fill={podColor} />
    </svg>
  );
}

/* ─── Main Component ─── */

export function PodsView() {
  const [expandedPod, setExpandedPod] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<PodStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<PodType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPods = useMemo(() => {
    return pods.filter((pod) => {
      if (filterStatus !== 'all' && pod.status !== filterStatus) return false;
      if (filterType !== 'all' && pod.type !== filterType) return false;
      return true;
    });
  }, [filterStatus, filterType]);

  // Summary stats
  const totalMembers = pods.reduce((s, p) => s + p.memberCount, 0);
  const avgHealth = Math.round(pods.reduce((s, p) => s + p.activityScore, 0) / pods.length);
  const thrivingCount = pods.filter((p) => p.status === 'thriving').length;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: 'rgba(232, 135, 160, 0.12)',
              border: '1px solid rgba(232, 135, 160, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={22} style={{ color: '#e879a0' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4', margin: 0, letterSpacing: '-0.01em' }}>
              <span className="gradient-text">Pods & Coherence</span>
            </h1>
            <p style={{ fontSize: 13, color: '#a09888', margin: 0, marginTop: 2, fontStyle: 'italic' }}>
              Coherence is not a destination, it&apos;s a practice
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div
        className="animate-fade-in"
        style={{
          animationDelay: '50ms',
          opacity: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[
          { label: 'Active Pods', value: pods.length.toString(), icon: Target, color: '#d4a574', sub: `${thrivingCount} thriving` },
          { label: 'Total Members', value: totalMembers.toString(), icon: Users, color: '#8b5cf6', sub: 'across all pods' },
          { label: 'Avg Activity', value: `${avgHealth}%`, icon: TrendingUp, color: '#6b8f71', sub: 'health score' },
          { label: 'Next Meeting', value: 'Apr 7', icon: Calendar, color: '#e879a0', sub: 'Purpose Pod' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="animate-fade-in"
              style={{
                animationDelay: `${80 + i * 40}ms`,
                opacity: 0,
                backgroundColor: '#131720',
                border: '1px solid #1e2638',
                borderRadius: 16,
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Icon size={13} style={{ color: stat.color }} />
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>
                  {stat.label}
                </span>
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#f0ebe4', display: 'block', fontVariantNumeric: 'tabular-nums' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 11, color: '#6b6358', marginTop: 2, display: 'block' }}>
                {stat.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div
        className="animate-fade-in"
        style={{
          animationDelay: '150ms',
          opacity: 0,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #1e2638',
            backgroundColor: showFilters ? 'rgba(212,165,116,0.08)' : '#131720',
            color: showFilters ? '#d4a574' : '#a09888',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Filter size={14} />
          Filters
          {(filterStatus !== 'all' || filterType !== 'all') && (
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#d4a574',
              marginLeft: 2,
            }} />
          )}
        </button>

        {showFilters && (
          <>
            {/* Status filter */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', 'forming', 'active', 'thriving'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid',
                    borderColor: filterStatus === status ? '#d4a57450' : '#1e2638',
                    backgroundColor: filterStatus === status ? 'rgba(212,165,116,0.1)' : 'transparent',
                    color: filterStatus === status ? '#d4a574' : '#6b6358',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textTransform: 'capitalize',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', 'strategy', 'operations', 'culture', 'creative'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid',
                    borderColor: filterType === type ? '#8b5cf650' : '#1e2638',
                    backgroundColor: filterType === type ? 'rgba(139,92,246,0.1)' : 'transparent',
                    color: filterType === type
                      ? (type === 'all' ? '#8b5cf6' : podTypeConfig[type as PodType].color)
                      : '#6b6358',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textTransform: 'capitalize',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </>
        )}

        <span style={{ fontSize: 11, color: '#6b6358', marginLeft: 'auto' }}>
          Showing {filteredPods.length} of {pods.length} pods
        </span>
      </div>

      {/* ── Pod Cards ── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 18,
        }}>
          {filteredPods.map((pod, i) => {
            const Icon = pod.icon;
            const statusCfg = podStatusConfig[pod.status];
            const hCfg = healthConfig[pod.health];
            const typeCfg = podTypeConfig[pod.type];
            const isExpanded = expandedPod === pod.name;

            return (
              <div
                key={pod.name}
                className="animate-fade-in"
                style={{
                  animationDelay: `${200 + i * 80}ms`,
                  opacity: 0,
                  backgroundColor: '#131720',
                  border: `1px solid ${isExpanded ? `${pod.color}40` : '#1e2638'}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  boxShadow: isExpanded ? `0 0 30px ${pod.color}10` : 'none',
                  position: 'relative',
                }}
              >
                {/* Connection lines background */}
                <PodConnections podColor={pod.color} members={pod.members} />

                <div style={{ padding: '22px 24px', position: 'relative' }}>
                  {/* Top row: icon, name, badges */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 13,
                        backgroundColor: `${pod.color}15`,
                        border: `1px solid ${pod.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon size={20} style={{ color: pod.color }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
                          {pod.name}
                        </h3>
                        <span style={{ fontSize: 11, color: '#a09888' }}>
                          Led by <span style={{ color: pod.color, fontWeight: 500 }}>{pod.lead}</span>
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: statusCfg.text,
                        backgroundColor: statusCfg.bg,
                        borderRadius: 10,
                        padding: '3px 10px',
                      }}>
                        {statusCfg.label}
                      </span>
                      <HealthIndicator health={pod.health} />
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.65, margin: '0 0 16px 0' }}>
                    {pod.description}
                  </p>

                  {/* Avatar stack + meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <AvatarStack members={pod.members} max={5} />

                    <div style={{ display: 'flex', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={11} style={{ color: '#6b6358' }} />
                        <span style={{ fontSize: 11, color: '#f0ebe4', fontWeight: 600 }}>{pod.memberCount}</span>
                        <span style={{ fontSize: 10, color: '#6b6358' }}>/ {pod.targetMembers}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} style={{ color: '#6b6358' }} />
                        <span style={{ fontSize: 10, color: '#a09888' }}>{pod.meetingFrequency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Type badge + Activity score */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid #1e2638',
                  }}>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: typeCfg.color,
                      backgroundColor: `${typeCfg.color}12`,
                      border: `1px solid ${typeCfg.color}25`,
                      borderRadius: 8,
                      padding: '3px 10px',
                    }}>
                      {typeCfg.label}
                    </span>

                    {/* Activity score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: '#6b6358' }}>Activity</span>
                      <div style={{ width: 60, height: 5, backgroundColor: '#1c2230', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pod.activityScore}%`,
                          backgroundColor: hCfg.color,
                          borderRadius: 3,
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: hCfg.color,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {pod.activityScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Expanded Section ── */}
                {isExpanded && (
                  <div style={{
                    padding: '0 24px 20px',
                    borderTop: '1px solid #1e2638',
                    paddingTop: 20,
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      {/* Goals with progress */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          <Target size={13} style={{ color: pod.color }} />
                          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a09888' }}>
                            Goals
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {pod.goals.map((goal, gi) => (
                            <GoalProgress key={gi} goal={goal} color={pod.color} delay={100 + gi * 60} />
                          ))}
                        </div>
                      </div>

                      {/* Meeting Calendar */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          <Calendar size={13} style={{ color: pod.color }} />
                          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a09888' }}>
                            April Meetings
                          </span>
                        </div>
                        <MeetingCalendar days={pod.meetingsThisMonth} color={pod.color} />
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={11} style={{ color: '#6b6358' }} />
                          <span style={{ fontSize: 11, color: '#a09888' }}>
                            Next: <span style={{ color: '#f0ebe4', fontWeight: 500 }}>{pod.nextMeeting}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member list with connections */}
                    <div style={{ marginTop: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <Users size={13} style={{ color: pod.color }} />
                        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a09888' }}>
                          Members
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {pod.members.map((m) => (
                          <div key={m.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px',
                            borderRadius: 10,
                            backgroundColor: '#0f1219',
                            border: '1px solid #1e2638',
                          }}>
                            <div
                              className={m.color}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 8,
                                fontWeight: 700,
                                color: '#fff',
                              }}
                            >
                              {m.avatar}
                            </div>
                            <span style={{ fontSize: 11, color: '#f0ebe4', fontWeight: 500 }}>{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedPod(isExpanded ? null : pod.name)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '11px 0',
                    fontSize: 11,
                    fontWeight: 500,
                    color: isExpanded ? pod.color : '#6b6358',
                    backgroundColor: isExpanded ? `${pod.color}08` : 'transparent',
                    borderTop: '1px solid #1e2638',
                    border: 'none',
                    borderTopStyle: 'solid',
                    borderTopWidth: 1,
                    borderTopColor: '#1e2638',
                    cursor: 'pointer',
                    transition: 'color 0.2s, background-color 0.2s',
                  }}
                >
                  {isExpanded ? (
                    <>Show less <ChevronUp size={13} /></>
                  ) : (
                    <>Goals, meetings & members <ChevronDown size={13} /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Coherence Practices Calendar ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.4s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: 'rgba(212,165,116,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={16} style={{ color: '#d4a574' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Coherence Practices
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 14,
        }}>
          {practices.map((practice, i) => {
            const Icon = practice.icon;
            return (
              <div
                key={practice.name}
                className="animate-fade-in"
                style={{
                  animationDelay: `${0.45 + i * 0.06}s`,
                  opacity: 0,
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 16,
                  padding: 20,
                  transition: 'border-color 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: `${practice.color}15`,
                    border: `1px solid ${practice.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={16} style={{ color: practice.color }} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
                    {practice.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Clock size={11} style={{ color: '#6b6358' }} />
                  <span style={{ fontSize: 12, color: '#d4a574', fontWeight: 500 }}>
                    {practice.schedule}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={11} style={{ color: '#6b6358' }} />
                  <span style={{ fontSize: 12, color: '#a09888' }}>
                    Facilitated by <span style={{ color: '#f0ebe4', fontWeight: 500 }}>{practice.facilitator}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Pod Health Dashboard ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.55s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: 'rgba(139,92,246,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BarChart3 size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Pod Health Dashboard
          </h2>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#e8b44c',
            backgroundColor: 'rgba(232, 180, 76, 0.12)',
            borderRadius: 12,
            padding: '3px 10px',
            marginLeft: 4,
          }}>
            Preview -- launches April
          </span>
        </div>

        <div style={{
          backgroundColor: '#131720',
          border: '1px solid #1e2638',
          borderRadius: 18,
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr',
            padding: '12px 24px',
            backgroundColor: '#0f1219',
            borderBottom: '1px solid #1e2638',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#6b6358',
          }}>
            <span>Pod</span>
            <span style={{ textAlign: 'center' }}>Attendance</span>
            <span style={{ textAlign: 'center' }}>Facilitator</span>
            <span>Satisfaction</span>
          </div>

          {podHealth.map((ph, i) => {
            const facCfg = facilitatorStatusConfig[ph.facilitatorStatus];
            const attendanceColor = ph.attendance >= 85 ? '#6b8f71' : ph.attendance >= 75 ? '#e8b44c' : '#e06060';
            return (
              <div
                key={ph.pod}
                className="animate-fade-in"
                style={{
                  animationDelay: `${0.6 + i * 0.05}s`,
                  opacity: 0,
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr',
                  padding: '14px 24px',
                  borderBottom: i < podHealth.length - 1 ? '1px solid #1e263833' : 'none',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ebe4' }}>
                  {ph.pod}
                </span>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: attendanceColor,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {ph.attendance}%
                  </span>
                  <div style={{
                    height: 4,
                    backgroundColor: '#1c2230',
                    borderRadius: 2,
                    marginTop: 4,
                    overflow: 'hidden',
                    maxWidth: 80,
                    margin: '4px auto 0',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${ph.attendance}%`,
                      backgroundColor: attendanceColor,
                      borderRadius: 2,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: facCfg.color,
                    backgroundColor: facCfg.bg,
                    borderRadius: 12,
                    padding: '3px 10px',
                  }}>
                    {facCfg.label}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#a09888', fontStyle: 'italic' }}>
                  {ph.satisfaction}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Coherence Journal ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.7s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: 'rgba(139,92,246,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PenLine size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Coherence Journal
          </h2>
          <span style={{
            fontSize: 11,
            color: '#6b6358',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 12,
            padding: '2px 10px',
            marginLeft: 4,
          }}>
            Reflections, not metrics
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {journalEntries.map((entry, i) => (
            <div
              key={i}
              className="animate-fade-in"
              style={{
                animationDelay: `${0.75 + i * 0.06}s`,
                opacity: 0,
                backgroundColor: '#131720',
                border: '1px solid #1e2638',
                borderRadius: 16,
                padding: 22,
                borderLeft: '3px solid #8b5cf640',
              }}
            >
              <p style={{
                fontSize: 14,
                color: '#e8e0d6',
                lineHeight: 1.7,
                margin: 0,
                fontStyle: 'italic',
              }}>
                &ldquo;{entry.text}&rdquo;
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 14,
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#d4a574' }}>
                  &mdash; {entry.author}
                </span>
                <span style={{
                  fontSize: 10,
                  color: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                  borderRadius: 12,
                  padding: '2px 10px',
                  fontWeight: 500,
                }}>
                  {entry.context}
                </span>
                <span style={{ fontSize: 11, color: '#6b6358' }}>{entry.date}</span>
              </div>
            </div>
          ))}

          {/* Free-text placeholder */}
          <div style={{
            backgroundColor: '#0f1219',
            border: '1px dashed #2e3a4e',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center',
          }}>
            <PenLine size={20} style={{ color: '#2e3a4e', marginBottom: 8 }} />
            <p style={{ fontSize: 12, color: '#6b6358', margin: 0 }}>
              Add a reflection... This space is for qualitative sensing, not scoring.
            </p>
          </div>
        </div>
      </section>

      {/* ── Gender Balance Tracker ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.85s', opacity: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: 'rgba(212,165,116,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users size={16} style={{ color: '#d4a574' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Gender Balance Tracker
          </h2>
        </div>

        <div style={{
          backgroundColor: '#131720',
          border: '1px solid #1e2638',
          borderRadius: 18,
          padding: 24,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {genderBalance.map((row) => {
              const total = row.male + row.female;
              const malePct = total > 0 ? (row.male / total) * 100 : 50;
              const femalePct = total > 0 ? (row.female / total) * 100 : 50;
              return (
                <div key={row.group}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>
                      {row.group}
                    </span>
                    <span style={{ fontSize: 12, color: '#a09888' }}>
                      <span style={{ color: '#5eaed4' }}>{row.male}M</span>
                      {' / '}
                      <span style={{ color: '#e879a0' }}>{row.female}F</span>
                    </span>
                  </div>
                  <div style={{
                    height: 20,
                    display: 'flex',
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: '#1c2230',
                  }}>
                    <div style={{
                      width: `${malePct}%`,
                      background: 'linear-gradient(90deg, #5eaed4cc, #5eaed488)',
                      transition: 'width 0.6s ease-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {malePct > 20 && (
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#0b0d14' }}>
                          {malePct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div style={{
                      width: `${femalePct}%`,
                      background: 'linear-gradient(90deg, #e879a088, #e879a0cc)',
                      transition: 'width 0.6s ease-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {femalePct > 20 && (
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#0b0d14' }}>
                          {femalePct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: 20,
            padding: '12px 16px',
            backgroundColor: '#0f1219',
            borderRadius: 12,
            borderLeft: '3px solid #d4a57440',
          }}>
            <p style={{ fontSize: 12, color: '#a09888', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
              Balance is a practice, not a target. We track representation not to optimize a number,
              but to stay aware of the field we&apos;re creating and the voices shaping it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
