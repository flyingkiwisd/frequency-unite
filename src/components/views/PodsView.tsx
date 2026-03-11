'use client';

import React, { useState } from 'react';
import {
  Compass,
  Heart,
  Landmark,
  TreePine,
  Palette,
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
  TrendingUp,
  ArrowRight,
  Zap,
  Shield,
} from 'lucide-react';

/* ─── Keyframe styles injected once ─── */

const styleId = 'pods-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes connection-dash {
      to { stroke-dashoffset: -20; }
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.3); }
    }
    @keyframes slide-in-right {
      from { opacity: 0; transform: translateX(-12px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes bar-grow {
      from { width: 0; }
    }
    @keyframes ring-fill {
      from { stroke-dashoffset: var(--ring-circ); }
    }
  `;
  document.head.appendChild(style);
}

/* ─── Pod Data ─── */

interface Pod {
  name: string;
  lead: string;
  icon: React.ElementType;
  color: string;
  memberCount: number;
  targetMembers: string;
  status: 'forming' | 'active' | 'thriving';
  nextMeeting: string;
  description: string;
  members: { avatar: string; name: string; color: string }[];
  recentActivity: string;
}

const pods: Pod[] = [
  {
    name: 'Purpose Pod',
    lead: 'James',
    icon: Compass,
    color: '#d4a574',
    memberCount: 6,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 7, 2026',
    description: 'Vision, North Star alignment, and strategic direction. Holds the why behind every initiative and ensures all nodes serve the larger purpose.',
    members: [
      { avatar: 'JH', name: 'James', color: 'bg-amber-500' },
      { avatar: 'AF', name: 'Fairman', color: 'bg-violet-500' },
      { avatar: 'SH', name: 'Sian', color: 'bg-rose-400' },
      { avatar: 'CG', name: 'Colleen', color: 'bg-amber-400' },
      { avatar: 'DW', name: 'Dave', color: 'bg-emerald-500' },
      { avatar: 'MX', name: 'Max', color: 'bg-sky-400' },
    ],
    recentActivity: 'James shared updated North Star framework',
  },
  {
    name: 'Capital Pod',
    lead: 'Greg',
    icon: Landmark,
    color: '#e8b44c',
    memberCount: 4,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 9, 2026',
    description: 'Investment evaluation, deal flow management, and capital stewardship. Bridges regenerative finance with real-world impact.',
    members: [
      { avatar: 'GB', name: 'Greg', color: 'bg-green-500' },
      { avatar: 'JH', name: 'James', color: 'bg-amber-500' },
      { avatar: 'CG', name: 'Colleen', color: 'bg-amber-400' },
      { avatar: 'AF', name: 'Fairman', color: 'bg-violet-500' },
    ],
    recentActivity: 'Greg scored 3 new deals for pipeline review',
  },
  {
    name: 'Bioregion Pod',
    lead: 'Gareth',
    icon: TreePine,
    color: '#6b8f71',
    memberCount: 5,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 11, 2026',
    description: 'Community regeneration and local impact in specific bioregions. Land-based projects, indigenous collaboration, and place-based transformation.',
    members: [
      { avatar: 'GH', name: 'Gareth', color: 'bg-lime-500' },
      { avatar: 'JH', name: 'James', color: 'bg-amber-500' },
      { avatar: 'AF', name: 'Fairman', color: 'bg-violet-500' },
      { avatar: 'SS', name: 'Sarah', color: 'bg-indigo-400' },
      { avatar: 'DW', name: 'Dave', color: 'bg-emerald-500' },
    ],
    recentActivity: 'Gareth met with Nicoya community leaders',
  },
  {
    name: 'Culture Pod',
    lead: 'Andrew / Felicia',
    icon: Heart,
    color: '#e879a0',
    memberCount: 7,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 8, 2026',
    description: 'Coherence practices, inner work, and the living culture of Frequency. Holds the relational and somatic field of the community.',
    members: [
      { avatar: 'AN', name: 'Andrew', color: 'bg-purple-500' },
      { avatar: 'FI', name: 'Felicia', color: 'bg-pink-400' },
      { avatar: 'DW', name: 'Dave', color: 'bg-emerald-500' },
      { avatar: 'SH', name: 'Sian', color: 'bg-rose-400' },
      { avatar: 'JH', name: 'James', color: 'bg-amber-500' },
      { avatar: 'SS', name: 'Sarah', color: 'bg-indigo-400' },
      { avatar: 'MX', name: 'Max', color: 'bg-sky-400' },
    ],
    recentActivity: 'Andrew led post-Cabo breathwork integration',
  },
  {
    name: 'Narrative Pod',
    lead: 'Raamayan',
    icon: BookOpen,
    color: '#8b5cf6',
    memberCount: 3,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 14, 2026',
    description: 'Storytelling, movement building, and narrative infrastructure. Crafts the language and media that carry the Frequency signal into the world.',
    members: [
      { avatar: 'RA', name: 'Raamayan', color: 'bg-orange-500' },
      { avatar: 'AF', name: 'Fairman', color: 'bg-violet-500' },
      { avatar: 'JH', name: 'James', color: 'bg-amber-500' },
    ],
    recentActivity: 'Raamayan wrapped Anthem studio session',
  },
  {
    name: 'Operations Pod',
    lead: 'Sian',
    icon: Settings,
    color: '#5eaed4',
    memberCount: 5,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 10, 2026',
    description: 'Process, systems, and membership operations. The backbone that makes everything else possible -- CRM, communications, event logistics, onboarding.',
    members: [
      { avatar: 'SH', name: 'Sian', color: 'bg-rose-400' },
      { avatar: 'MF', name: 'Mafe', color: 'bg-teal-400' },
      { avatar: 'NP', name: 'Nipun', color: 'bg-slate-400' },
      { avatar: 'JH', name: 'James', color: 'bg-amber-500' },
      { avatar: 'CG', name: 'Colleen', color: 'bg-amber-400' },
    ],
    recentActivity: 'Sian drafted Blue Spirit registration page',
  },
];

const podStatusConfig: Record<Pod['status'], { bg: string; text: string; label: string }> = {
  forming: { bg: 'rgba(232, 180, 76, 0.15)', text: '#e8b44c', label: 'Forming' },
  active: { bg: 'rgba(107, 143, 113, 0.15)', text: '#6b8f71', label: 'Active' },
  thriving: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', label: 'Thriving' },
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
  {
    name: 'Breathwork Circle',
    schedule: 'Wednesday 7am MT',
    facilitator: 'Andrew',
    icon: Activity,
    color: '#e879a0',
  },
  {
    name: 'Full Community Coherence Call',
    schedule: 'Monthly (2nd Saturday)',
    facilitator: 'Rotating',
    icon: Users,
    color: '#d4a574',
  },
  {
    name: 'Opening Ceremony Design',
    schedule: 'Pre-event (as needed)',
    facilitator: 'Culture Pod',
    icon: Star,
    color: '#8b5cf6',
  },
  {
    name: 'Essence Interviews',
    schedule: 'Ongoing',
    facilitator: 'Max',
    icon: MessageCircle,
    color: '#5eaed4',
  },
];

/* ─── Pod Health (April preview) ─── */

interface PodHealth {
  pod: string;
  attendance: number;
  facilitatorStatus: 'trained' | 'in-training' | 'needed';
  satisfaction: string;
  engagement: number;
  weeklyActivity: number[];
}

const podHealth: PodHealth[] = [
  { pod: 'Purpose Pod', attendance: 88, facilitatorStatus: 'trained', satisfaction: 'Strong alignment', engagement: 92, weeklyActivity: [85, 88, 90, 92] },
  { pod: 'Capital Pod', attendance: 75, facilitatorStatus: 'in-training', satisfaction: 'Engaged', engagement: 78, weeklyActivity: [70, 72, 76, 75] },
  { pod: 'Bioregion Pod', attendance: 82, facilitatorStatus: 'trained', satisfaction: 'Energized', engagement: 85, weeklyActivity: [78, 80, 84, 82] },
  { pod: 'Culture Pod', attendance: 90, facilitatorStatus: 'trained', satisfaction: 'Deep connection', engagement: 95, weeklyActivity: [88, 91, 93, 90] },
  { pod: 'Narrative Pod', attendance: 78, facilitatorStatus: 'needed', satisfaction: 'Finding rhythm', engagement: 72, weeklyActivity: [65, 70, 75, 78] },
  { pod: 'Operations Pod', attendance: 85, facilitatorStatus: 'trained', satisfaction: 'Efficient', engagement: 88, weeklyActivity: [82, 85, 86, 85] },
];

const facilitatorStatusConfig: Record<PodHealth['facilitatorStatus'], { color: string; label: string; bg: string }> = {
  trained: { color: '#6b8f71', label: 'Trained', bg: 'rgba(107, 143, 113, 0.15)' },
  'in-training': { color: '#e8b44c', label: 'In Training', bg: 'rgba(232, 180, 76, 0.15)' },
  needed: { color: '#e06060', label: 'Needed', bg: 'rgba(224, 96, 96, 0.15)' },
};

/* ─── Activity Timeline ─── */

interface TimelineEvent {
  time: string;
  pod: string;
  event: string;
  color: string;
  icon: React.ElementType;
}

const timelineEvents: TimelineEvent[] = [
  { time: '2 hrs ago', pod: 'Culture Pod', event: 'Andrew led Wednesday breathwork circle', color: '#e879a0', icon: Activity },
  { time: '5 hrs ago', pod: 'Capital Pod', event: 'Greg shared deal pipeline update with 3 new prospects', color: '#e8b44c', icon: Landmark },
  { time: '1 day ago', pod: 'Narrative Pod', event: 'Raamayan posted Anthem studio progress update', color: '#8b5cf6', icon: BookOpen },
  { time: '1 day ago', pod: 'Operations Pod', event: 'Sian completed Blue Spirit logistics draft', color: '#5eaed4', icon: Settings },
  { time: '2 days ago', pod: 'Bioregion Pod', event: 'Gareth shared Nicoya community meeting notes', color: '#6b8f71', icon: TreePine },
  { time: '3 days ago', pod: 'Purpose Pod', event: 'James circulated updated North Star framework', color: '#d4a574', icon: Compass },
];

/* ─── Coherence Journal Entries ─── */

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

/* ─── Helper: Mini Bar Chart ─── */

function MiniBarChart({ values, color, height = 28 }: { values: number[]; color: string; height?: number }) {
  const max = Math.max(...values, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            minHeight: 2,
            backgroundColor: color,
            borderRadius: 2,
            opacity: 0.4 + (i / values.length) * 0.6,
            animation: `bar-grow 0.6s ease-out ${i * 100}ms both`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Helper: Avatar Stack ─── */

function AvatarStack({ members, max = 5 }: { members: Pod['members']; max?: number }) {
  const shown = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <div
          key={m.avatar + i}
          className={m.color}
          title={m.name}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
            color: '#fff',
            marginLeft: i > 0 ? -6 : 0,
            border: '2px solid #131720',
            position: 'relative',
            zIndex: max - i,
            transition: 'transform 0.2s',
          }}
        >
          {m.avatar}
        </div>
      ))}
      {overflow > 0 && (
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700,
          color: '#a09888',
          backgroundColor: '#1e2638',
          marginLeft: -6,
          border: '2px solid #131720',
          position: 'relative',
          zIndex: 0,
        }}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

/* ─── Helper: Health Indicator Badge ─── */

function HealthBadge({ attendance, engagement }: { attendance: number; engagement: number }) {
  const avg = (attendance + engagement) / 2;
  const status = avg >= 85 ? 'Healthy' : avg >= 70 ? 'Growing' : 'Needs Attention';
  const color = avg >= 85 ? '#6b8f71' : avg >= 70 ? '#e8b44c' : '#e06060';
  const bg = avg >= 85 ? 'rgba(107,143,113,0.12)' : avg >= 70 ? 'rgba(232,180,76,0.12)' : 'rgba(224,96,96,0.12)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 12,
      backgroundColor: bg,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        backgroundColor: color,
        animation: avg >= 85 ? 'pulse-dot 2s ease-in-out infinite' : 'none',
      }} />
      <span style={{
        fontSize: 10, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        color,
      }}>
        {status}
      </span>
    </div>
  );
}

/* ─── Pod Connections SVG ─── */

function PodConnections() {
  const nodes = [
    { x: 60, y: 30, label: 'Purpose', color: '#d4a574' },
    { x: 140, y: 20, label: 'Capital', color: '#e8b44c' },
    { x: 200, y: 60, label: 'Bio', color: '#6b8f71' },
    { x: 180, y: 120, label: 'Culture', color: '#e879a0' },
    { x: 100, y: 130, label: 'Narrative', color: '#8b5cf6' },
    { x: 30, y: 90, label: 'Ops', color: '#5eaed4' },
  ];

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [0, 3], [1, 4], [2, 5],
  ];

  return (
    <svg width={240} height={160} style={{ overflow: 'visible' }}>
      <defs>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {connections.map(([a, b], i) => (
        <line
          key={`conn-${i}`}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="#1e2638"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          style={{ animation: 'connection-dash 2s linear infinite' }}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={`node-${i}`}>
          <circle
            cx={n.x} cy={n.y} r={16}
            fill={`${n.color}20`}
            stroke={n.color}
            strokeWidth={1.5}
            filter="url(#node-glow)"
            style={{
              animation: `pulse-dot 3s ease-in-out ${i * 0.3}s infinite`,
              transformOrigin: `${n.x}px ${n.y}px`,
            }}
          />
          <circle cx={n.x} cy={n.y} r={4} fill={n.color} />
          <text
            x={n.x} y={n.y + 26}
            fill="#a09888"
            fontSize={8}
            textAnchor="middle"
            fontFamily="inherit"
            fontWeight={600}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Pod Comparison Summary ─── */

function PodComparisonSummary() {
  const totalMembers = pods.reduce((sum, p) => sum + p.memberCount, 0);
  const avgAttendance = Math.round(podHealth.reduce((sum, p) => sum + p.attendance, 0) / podHealth.length);
  const avgEngagement = Math.round(podHealth.reduce((sum, p) => sum + p.engagement, 0) / podHealth.length);
  const trainedFacilitators = podHealth.filter(p => p.facilitatorStatus === 'trained').length;

  const metrics = [
    { label: 'Total Members', value: totalMembers.toString(), sub: `across ${pods.length} pods`, color: '#d4a574', icon: <Users size={18} style={{ color: '#d4a574' }} /> },
    { label: 'Avg Attendance', value: `${avgAttendance}%`, sub: 'last 4 weeks', color: avgAttendance >= 85 ? '#6b8f71' : '#e8b44c', icon: <CheckCircle2 size={18} style={{ color: avgAttendance >= 85 ? '#6b8f71' : '#e8b44c' }} /> },
    { label: 'Engagement', value: `${avgEngagement}%`, sub: 'cross-pod avg', color: avgEngagement >= 85 ? '#6b8f71' : '#e8b44c', icon: <Zap size={18} style={{ color: avgEngagement >= 85 ? '#6b8f71' : '#e8b44c' }} /> },
    { label: 'Trained Facilitators', value: `${trainedFacilitators}/${pods.length}`, sub: 'ready to lead', color: trainedFacilitators >= 4 ? '#6b8f71' : '#e8b44c', icon: <Shield size={18} style={{ color: trainedFacilitators >= 4 ? '#6b8f71' : '#e8b44c' }} /> },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto',
      gap: 24,
      backgroundColor: '#131720',
      border: '1px solid #1e2638',
      borderRadius: 20,
      padding: '24px 28px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="animate-fade-in"
            style={{
              animationDelay: `${100 + i * 60}ms`, opacity: 0,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              backgroundColor: `${m.color}12`, border: `1px solid ${m.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {m.icon}
            </div>
            <div>
              <span style={{
                fontSize: 22, fontWeight: 800, color: m.color,
                lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                display: 'block',
              }}>
                {m.value}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#a09888',
                display: 'block', marginTop: 2,
              }}>
                {m.label}
              </span>
              <span style={{ fontSize: 10, color: '#6b6358' }}>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="animate-fade-in" style={{ animationDelay: '300ms', opacity: 0, display: 'flex', alignItems: 'center' }}>
        <PodConnections />
      </div>
    </div>
  );
}

/* ─── Component ─── */

export function PodsView() {
  const [expandedPod, setExpandedPod] = useState<string | null>(null);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 42, height: 42, borderRadius: 12,
              backgroundColor: 'rgba(232, 135, 160, 0.12)',
              border: '1px solid rgba(232, 135, 160, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Heart size={22} style={{ color: '#e879a0' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: '#f0ebe4',
              margin: 0, letterSpacing: '-0.01em',
            }}>
              Pods & Coherence
            </h1>
            <p style={{ fontSize: 13, color: '#a09888', margin: 0, marginTop: 2, fontStyle: 'italic' }}>
              Coherence is not a destination, it&apos;s a practice
            </p>
          </div>
        </div>
      </div>

      {/* ── Pod Comparison Summary ── */}
      <section className="animate-fade-in" style={{ animationDelay: '0.05s', opacity: 0, marginBottom: 28 }}>
        <PodComparisonSummary />
      </section>

      {/* ── Pod Overview ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.1s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Palette size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Pod Overview
          </h2>
          <span
            style={{
              fontSize: 11, color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12, padding: '2px 10px', marginLeft: 4,
            }}
          >
            {pods.length} pods proposed
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}>
          {pods.map((pod, i) => {
            const Icon = pod.icon;
            const statusCfg = podStatusConfig[pod.status];
            const isExpanded = expandedPod === pod.name;
            const health = podHealth.find(h => h.pod === pod.name);

            return (
              <div
                key={pod.name}
                className="animate-fade-in glow-card"
                style={{
                  backgroundColor: '#131720',
                  border: `1px solid ${isExpanded ? `${pod.color}40` : '#1e2638'}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'border-color 0.25s, box-shadow 0.3s',
                  animationDelay: `${0.12 + i * 0.06}s`,
                  opacity: 0,
                }}
              >
                <div style={{ padding: 22 }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        backgroundColor: `${pod.color}15`,
                        border: `1px solid ${pod.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={20} style={{ color: pod.color }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
                          {pod.name}
                        </h3>
                        <span style={{ fontSize: 12, color: '#a09888' }}>
                          Led by <span style={{ color: pod.color, fontWeight: 500 }}>{pod.lead}</span>
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: statusCfg.text,
                        backgroundColor: statusCfg.bg, borderRadius: 12, padding: '3px 10px',
                      }}>
                        {statusCfg.label}
                      </span>
                      {health && (
                        <HealthBadge attendance={health.attendance} engagement={health.engagement} />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.65, margin: '0 0 14px 0' }}>
                    {pod.description}
                  </p>

                  {/* Member avatars + meta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <AvatarStack members={pod.members} max={5} />
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Users size={12} style={{ color: '#6b6358' }} />
                        <span style={{ fontSize: 11, color: '#a09888' }}>
                          <span style={{ color: '#f0ebe4', fontWeight: 600 }}>{pod.memberCount}</span>
                          <span style={{ color: '#6b6358' }}> / {pod.targetMembers}</span>
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={12} style={{ color: '#6b6358' }} />
                        <span style={{ fontSize: 11, color: '#a09888' }}>
                          Next: <span style={{ color: '#f0ebe4', fontWeight: 500 }}>{pod.nextMeeting}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent activity line */}
                  <div style={{
                    marginTop: 12, padding: '8px 12px',
                    backgroundColor: `${pod.color}08`,
                    borderRadius: 10,
                    borderLeft: `2px solid ${pod.color}40`,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <ArrowRight size={11} style={{ color: pod.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#a09888', fontStyle: 'italic' }}>
                      {pod.recentActivity}
                    </span>
                  </div>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedPod(isExpanded ? null : pod.name)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6, padding: '10px 0',
                    fontSize: 11, fontWeight: 500,
                    color: isExpanded ? pod.color : '#6b6358',
                    backgroundColor: isExpanded ? `${pod.color}08` : 'transparent',
                    borderTop: '1px solid #1e2638',
                    border: 'none', borderTopStyle: 'solid',
                    borderTopWidth: 1, borderTopColor: '#1e2638',
                    cursor: 'pointer', transition: 'color 0.2s, background-color 0.2s',
                  }}
                >
                  {isExpanded ? (
                    <>Show less <ChevronUp size={13} /></>
                  ) : (
                    <>Show more <ChevronDown size={13} /></>
                  )}
                </button>

                {/* Expanded details with engagement mini chart */}
                {isExpanded && health && (
                  <div style={{
                    padding: '16px 22px',
                    borderTop: '1px solid #1e263860',
                    backgroundColor: '#0f1219',
                    animation: 'slide-in-right 0.3s ease-out',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6358', display: 'block', marginBottom: 6 }}>
                          Attendance
                        </span>
                        <span style={{
                          fontSize: 20, fontWeight: 800,
                          color: health.attendance >= 85 ? '#6b8f71' : '#e8b44c',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {health.attendance}%
                        </span>
                        <div style={{ marginTop: 8 }}>
                          <MiniBarChart values={health.weeklyActivity} color={pod.color} height={24} />
                          <span style={{ fontSize: 9, color: '#6b6358', marginTop: 4, display: 'block' }}>Last 4 weeks</span>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6358', display: 'block', marginBottom: 6 }}>
                          Engagement
                        </span>
                        <span style={{
                          fontSize: 20, fontWeight: 800,
                          color: health.engagement >= 85 ? '#6b8f71' : '#e8b44c',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {health.engagement}%
                        </span>
                        <div style={{
                          marginTop: 8, height: 4, backgroundColor: '#1e2638', borderRadius: 2, overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${health.engagement}%`,
                            backgroundColor: health.engagement >= 85 ? '#6b8f71' : '#e8b44c',
                            borderRadius: 2,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6358', display: 'block', marginBottom: 6 }}>
                          Facilitator
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: facilitatorStatusConfig[health.facilitatorStatus].color,
                          backgroundColor: facilitatorStatusConfig[health.facilitatorStatus].bg,
                          borderRadius: 12, padding: '4px 12px',
                          display: 'inline-block',
                        }}>
                          {facilitatorStatusConfig[health.facilitatorStatus].label}
                        </span>
                        <p style={{ fontSize: 11, color: '#a09888', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                          {health.satisfaction}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Pod Activity Timeline ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.25s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Clock size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Pod Activity Timeline
          </h2>
        </div>

        <div style={{
          backgroundColor: '#131720',
          border: '1px solid #1e2638',
          borderRadius: 16,
          padding: '20px 24px',
          position: 'relative',
        }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: 38,
            top: 28,
            bottom: 28,
            width: 2,
            backgroundColor: '#1e2638',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {timelineEvents.map((evt, i) => {
              const Icon = evt.icon;
              return (
                <div
                  key={i}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${0.3 + i * 0.06}s`,
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '12px 0',
                    position: 'relative',
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 10,
                    backgroundColor: `${evt.color}15`,
                    border: `1px solid ${evt.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    <Icon size={14} style={{ color: evt.color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: evt.color,
                      }}>
                        {evt.pod}
                      </span>
                      <span style={{ fontSize: 10, color: '#6b6358' }}>
                        {evt.time}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#a09888', margin: 0, lineHeight: 1.5 }}>
                      {evt.event}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Coherence Practices Calendar ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.35s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Calendar size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Coherence Practices
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14,
        }}>
          {practices.map((practice, i) => {
            const Icon = practice.icon;
            return (
              <div
                key={practice.name}
                className="animate-fade-in glow-card"
                style={{
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 14,
                  padding: 20,
                  animationDelay: `${0.38 + i * 0.05}s`,
                  opacity: 0,
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    backgroundColor: `${practice.color}15`,
                    border: `1px solid ${practice.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
        style={{ animationDelay: '0.45s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <BarChart3 size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Pod Health Dashboard
          </h2>
          <span style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: '#e8b44c',
            backgroundColor: 'rgba(232, 180, 76, 0.12)',
            borderRadius: 12, padding: '3px 10px', marginLeft: 4,
          }}>
            Preview -- launches April
          </span>
        </div>

        <div style={{
          backgroundColor: '#131720',
          border: '1px solid #1e2638',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 80px 1fr 1.2fr',
            padding: '12px 24px',
            backgroundColor: '#0f1219',
            borderBottom: '1px solid #1e2638',
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: '#6b6358',
          }}>
            <span>Pod</span>
            <span style={{ textAlign: 'center' }}>Attendance</span>
            <span style={{ textAlign: 'center' }}>Trend</span>
            <span style={{ textAlign: 'center' }}>Facilitator</span>
            <span>Satisfaction</span>
          </div>

          {podHealth.map((ph, i) => {
            const facCfg = facilitatorStatusConfig[ph.facilitatorStatus];
            const attendanceColor =
              ph.attendance >= 85 ? '#6b8f71' : ph.attendance >= 75 ? '#e8b44c' : '#e06060';
            const pod = pods.find(p => p.name === ph.pod);
            return (
              <div
                key={ph.pod}
                className="animate-fade-in"
                style={{
                  animationDelay: `${0.5 + i * 0.04}s`,
                  opacity: 0,
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 80px 1fr 1.2fr',
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
                    fontSize: 14, fontWeight: 700, color: attendanceColor,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {ph.attendance}%
                  </span>
                  <div style={{
                    height: 4, backgroundColor: '#1c2230', borderRadius: 2,
                    marginTop: 4, overflow: 'hidden', maxWidth: 80, margin: '4px auto 0',
                  }}>
                    <div style={{
                      height: '100%', width: `${ph.attendance}%`,
                      backgroundColor: attendanceColor, borderRadius: 2,
                    }} />
                  </div>
                </div>
                {/* Mini bar chart for trend */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 48 }}>
                    <MiniBarChart
                      values={ph.weeklyActivity}
                      color={pod?.color || '#6b6358'}
                      height={20}
                    />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: facCfg.color,
                    backgroundColor: facCfg.bg, borderRadius: 12, padding: '3px 10px',
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
        style={{ animationDelay: '0.55s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <PenLine size={18} style={{ color: '#8b5cf6' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Coherence Journal
          </h2>
          <span style={{
            fontSize: 11, color: '#6b6358',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 12, padding: '2px 10px', marginLeft: 4,
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
                backgroundColor: '#131720',
                border: '1px solid #1e2638',
                borderRadius: 14,
                padding: 22,
                borderLeft: '3px solid #8b5cf640',
                animationDelay: `${0.58 + i * 0.06}s`,
                opacity: 0,
              }}
            >
              <p style={{
                fontSize: 14, color: '#e8e0d6', lineHeight: 1.7,
                margin: 0, fontStyle: 'italic',
              }}>
                &ldquo;{entry.text}&rdquo;
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginTop: 14, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#d4a574' }}>
                  &mdash; {entry.author}
                </span>
                <span style={{
                  fontSize: 10, color: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                  borderRadius: 12, padding: '2px 10px', fontWeight: 500,
                }}>
                  {entry.context}
                </span>
                <span style={{ fontSize: 11, color: '#6b6358' }}>{entry.date}</span>
              </div>
            </div>
          ))}

          {/* Free-text area placeholder */}
          <div style={{
            backgroundColor: '#0f1219',
            border: '1px dashed #2e3a4e',
            borderRadius: 14, padding: 20, textAlign: 'center',
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
        style={{ animationDelay: '0.65s', opacity: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Users size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Gender Balance Tracker
          </h2>
        </div>

        <div style={{
          backgroundColor: '#131720',
          border: '1px solid #1e2638',
          borderRadius: 16, padding: 24,
        }}>
          {/* Balance bars */}
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
                    height: 20, display: 'flex', borderRadius: 10,
                    overflow: 'hidden', backgroundColor: '#1c2230',
                  }}>
                    <div style={{
                      width: `${malePct}%`,
                      background: 'linear-gradient(90deg, #5eaed4cc, #5eaed488)',
                      transition: 'width 0.6s ease-out',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
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

          {/* Note */}
          <div style={{
            marginTop: 20, padding: '12px 16px',
            backgroundColor: '#0f1219', borderRadius: 10,
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
