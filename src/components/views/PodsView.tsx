'use client';

import React, { useState, useRef, useEffect } from 'react';
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

/* ─── Scoped Keyframes (pod- prefix) ─── */

const styleId = 'pods-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes pod-connection-dash {
      to { stroke-dashoffset: -20; }
    }
    @keyframes pod-pulse-dot {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.3); }
    }
    @keyframes pod-slide-down {
      from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
      to { opacity: 1; max-height: 500px; padding-top: 20px; padding-bottom: 20px; }
    }
    @keyframes pod-slide-up {
      from { opacity: 1; max-height: 500px; }
      to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
    }
    @keyframes pod-bar-grow {
      from { width: 0; }
    }
    @keyframes pod-ring-fill {
      from { stroke-dashoffset: var(--pod-ring-circ); }
    }
    @keyframes pod-sparkline-draw {
      from { stroke-dashoffset: var(--pod-spark-len); }
      to { stroke-dashoffset: 0; }
    }
    @keyframes pod-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes pod-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    @keyframes pod-glow-pulse {
      0%, 100% { box-shadow: 0 0 0px var(--pod-glow-color); }
      50% { box-shadow: 0 0 20px var(--pod-glow-color); }
    }
    @keyframes pod-icon-breathe {
      0%, 100% { filter: drop-shadow(0 0 2px var(--pod-icon-color)); }
      50% { filter: drop-shadow(0 0 8px var(--pod-icon-color)); }
    }
    @keyframes pod-stat-count {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pod-node-orbit {
      0% { transform: rotate(0deg) translateX(var(--pod-orbit-r)) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(var(--pod-orbit-r)) rotate(-360deg); }
    }
    @keyframes pod-avatar-ring-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pod-fade-in-up {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pod-tag-appear {
      from { opacity: 0; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

/* ─── Design Tokens ─── */

const GLASS = {
  bg: 'rgba(19, 23, 32, 0.7)',
  border: 'rgba(212, 165, 116, 0.08)',
  blur: 'blur(20px)',
  borderHover: 'rgba(212, 165, 116, 0.18)',
};

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

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
  practiceAreas: string[];
  rituals: string[];
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
    practiceAreas: ['Strategy', 'Vision', 'Alignment'],
    rituals: ['Weekly North Star review', 'Monthly purpose audit'],
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
    practiceAreas: ['Finance', 'Impact', 'Due Diligence'],
    rituals: ['Deal review sessions', 'Bi-weekly pipeline sync'],
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
    practiceAreas: ['Land', 'Indigenous', 'Ecology'],
    rituals: ['Site visit debriefs', 'Community listening circles'],
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
    practiceAreas: ['Breathwork', 'Somatic', 'Relational'],
    rituals: ['Weekly breathwork circle', 'Monthly field sensing'],
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
    practiceAreas: ['Story', 'Media', 'Language'],
    rituals: ['Creative sprints', 'Narrative weaving sessions'],
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
    practiceAreas: ['Systems', 'Process', 'Logistics'],
    rituals: ['Ops standup (bi-weekly)', 'Systems review'],
  },
];

const podStatusConfig: Record<Pod['status'], { bg: string; text: string; label: string; glow: string }> = {
  forming: { bg: 'rgba(232, 180, 76, 0.15)', text: '#e8b44c', label: 'Forming', glow: 'rgba(232, 180, 76, 0.3)' },
  active: { bg: 'rgba(107, 143, 113, 0.15)', text: '#6b8f71', label: 'Active', glow: 'rgba(107, 143, 113, 0.3)' },
  thriving: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', label: 'Thriving', glow: 'rgba(139, 92, 246, 0.3)' },
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

/* ─── Helper: Sparkline SVG ─── */

function Sparkline({ values, color, width = 64, height = 24 }: { values: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M${pts.join(' L')}`;
  const totalLen = values.length * 20;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`pod-spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <path
        d={`${pathD} L${width},${height} L0,${height} Z`}
        fill={`url(#pod-spark-grad-${color.replace('#', '')})`}
      />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          ['--pod-spark-len' as string]: totalLen,
          strokeDasharray: totalLen,
          animation: `pod-sparkline-draw 1.2s ${EASE} forwards`,
        } as React.CSSProperties}
      />
      {/* End dot */}
      <circle
        cx={width}
        cy={parseFloat(pts[pts.length - 1].split(',')[1])}
        r={2.5}
        fill={color}
        style={{ animation: 'pod-pulse-dot 2s ease-in-out infinite' }}
      />
    </svg>
  );
}

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
            animation: `pod-bar-grow 0.6s ease-out ${i * 100}ms both`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Helper: Circular Progress Ring ─── */

function VitalityRing({ value, color, size = 44, strokeWidth = 3.5 }: { value: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(30, 38, 56, 0.8)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            ['--pod-ring-circ' as string]: circumference,
            animation: `pod-ring-fill 1.2s ${EASE} forwards`,
            filter: `drop-shadow(0 0 4px ${color}60)`,
          } as React.CSSProperties}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: size * 0.27,
          fontWeight: 800,
          color,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
      </div>
    </div>
  );
}

/* ─── Helper: Avatar Stack with Gradient Rings ─── */

function AvatarStack({ members, max = 5, podColor }: { members: Pod['members']; max?: number; podColor: string }) {
  const shown = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <div
          key={m.avatar + i}
          title={m.name}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            padding: 2,
            background: `linear-gradient(135deg, ${podColor}, ${podColor}40)`,
            marginLeft: i > 0 ? -8 : 0,
            position: 'relative',
            zIndex: max - i,
            transition: `transform 0.3s ${EASE}, z-index 0.1s`,
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.12)';
            (e.currentTarget as HTMLElement).style.zIndex = '20';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
            (e.currentTarget as HTMLElement).style.zIndex = String(max - i);
          }}
        >
          <div
            className={m.color}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 700,
              color: '#fff',
              border: '2px solid #131720',
            }}
          >
            {m.avatar}
          </div>
        </div>
      ))}
      {overflow > 0 && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: '#a09888',
          background: `linear-gradient(135deg, #1e2638, #252d40)`,
          marginLeft: -8,
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

/* ─── Helper: Practice Area Tag Pills ─── */

function PracticeTagPills({ areas, color }: { areas: string[]; color: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {areas.map((area, i) => (
        <span
          key={area}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 10,
            fontWeight: 600,
            color: `${color}cc`,
            backgroundColor: `${color}12`,
            border: `1px solid ${color}20`,
            borderRadius: 20,
            padding: '3px 10px 3px 8px',
            letterSpacing: '0.02em',
            animation: `pod-tag-appear 0.3s ${EASE} ${i * 80}ms both`,
          }}
        >
          <span style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
            boxShadow: `0 0 4px ${color}60`,
          }} />
          {area}
        </span>
      ))}
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
        animation: avg >= 85 ? 'pod-pulse-dot 2s ease-in-out infinite' : 'none',
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

/* ─── Pod Connections SVG (enhanced) ─── */

function PodConnections() {
  const nodes = [
    { x: 70, y: 30, label: 'Purpose', color: '#d4a574' },
    { x: 160, y: 20, label: 'Capital', color: '#e8b44c' },
    { x: 220, y: 65, label: 'Bio', color: '#6b8f71' },
    { x: 195, y: 130, label: 'Culture', color: '#e879a0' },
    { x: 105, y: 140, label: 'Narrative', color: '#8b5cf6' },
    { x: 35, y: 95, label: 'Ops', color: '#5eaed4' },
  ];

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [0, 3], [1, 4], [2, 5],
  ];

  return (
    <svg width={260} height={175} style={{ overflow: 'visible' }}>
      <defs>
        <filter id="pod-node-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {nodes.map((n, i) => (
          <radialGradient key={`grad-${i}`} id={`pod-node-grad-${i}`}>
            <stop offset="0%" stopColor={n.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={n.color} stopOpacity="0.05" />
          </radialGradient>
        ))}
      </defs>
      {connections.map(([a, b], i) => {
        const midX = (nodes[a].x + nodes[b].x) / 2;
        const midY = (nodes[a].y + nodes[b].y) / 2;
        return (
          <g key={`conn-${i}`}>
            <line
              x1={nodes[a].x} y1={nodes[a].y}
              x2={nodes[b].x} y2={nodes[b].y}
              stroke="rgba(212, 165, 116, 0.12)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              style={{ animation: `pod-connection-dash 2s linear infinite` }}
            />
            <circle
              cx={midX}
              cy={midY}
              r={1.5}
              fill="#d4a574"
              opacity={0.4}
              style={{
                animation: `pod-pulse-dot 3s ease-in-out ${i * 0.2}s infinite`,
                transformOrigin: `${midX}px ${midY}px`,
              }}
            />
          </g>
        );
      })}
      {nodes.map((n, i) => (
        <g key={`node-${i}`}>
          <circle
            cx={n.x} cy={n.y} r={20}
            fill={`url(#pod-node-grad-${i})`}
            stroke={`${n.color}40`}
            strokeWidth={1}
          />
          <circle
            cx={n.x} cy={n.y} r={12}
            fill={`${n.color}18`}
            stroke={n.color}
            strokeWidth={1.5}
            filter="url(#pod-node-glow)"
            style={{
              animation: `pod-pulse-dot 4s ease-in-out ${i * 0.4}s infinite`,
              transformOrigin: `${n.x}px ${n.y}px`,
            }}
          />
          <circle cx={n.x} cy={n.y} r={3.5} fill={n.color} />
          <text
            x={n.x} y={n.y + 28}
            fill="#a09888"
            fontSize={9}
            textAnchor="middle"
            fontFamily="inherit"
            fontWeight={600}
            letterSpacing="0.04em"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Stats Header ─── */

function StatsHeader() {
  const totalMembers = pods.reduce((sum, p) => sum + p.memberCount, 0);
  const avgAttendance = Math.round(podHealth.reduce((sum, p) => sum + p.attendance, 0) / podHealth.length);
  const avgEngagement = Math.round(podHealth.reduce((sum, p) => sum + p.engagement, 0) / podHealth.length);
  const trainedFacilitators = podHealth.filter(p => p.facilitatorStatus === 'trained').length;

  const metrics = [
    { label: 'Active Pods', value: pods.length.toString(), sub: 'proposed nodes', color: '#d4a574', icon: <Palette size={18} style={{ color: '#d4a574' }} />, trend: [4, 5, 5, 6] },
    { label: 'Total Members', value: totalMembers.toString(), sub: `across all pods`, color: '#8b5cf6', icon: <Users size={18} style={{ color: '#8b5cf6' }} />, trend: [22, 25, 28, 30] },
    { label: 'Avg Attendance', value: `${avgAttendance}%`, sub: 'last 4 weeks', color: avgAttendance >= 85 ? '#6b8f71' : '#e8b44c', icon: <CheckCircle2 size={18} style={{ color: avgAttendance >= 85 ? '#6b8f71' : '#e8b44c' }} />, trend: [80, 82, 84, avgAttendance] },
    { label: 'Engagement', value: `${avgEngagement}%`, sub: 'cross-pod avg', color: avgEngagement >= 85 ? '#6b8f71' : '#e8b44c', icon: <Zap size={18} style={{ color: avgEngagement >= 85 ? '#6b8f71' : '#e8b44c' }} />, trend: [78, 80, 82, avgEngagement] },
    { label: 'Facilitators', value: `${trainedFacilitators}/${pods.length}`, sub: 'ready to lead', color: trainedFacilitators >= 4 ? '#6b8f71' : '#e8b44c', icon: <Shield size={18} style={{ color: trainedFacilitators >= 4 ? '#6b8f71' : '#e8b44c' }} />, trend: [2, 3, 3, trainedFacilitators] },
  ];

  return (
    <div className="card-premium" style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 28,
      background: GLASS.bg,
      backdropFilter: GLASS.blur,
      WebkitBackdropFilter: GLASS.blur,
      border: `1px solid ${GLASS.border}`,
      borderRadius: 20,
      padding: '26px 30px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle shimmer overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.02), transparent)',
        backgroundSize: '200% 100%',
        animation: 'pod-shimmer 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, position: 'relative', zIndex: 1 }}>
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="animate-fade-in card-stat"
            style={{
              animationDelay: `${100 + i * 60}ms`, opacity: 0,
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: '14px 16px',
              borderRadius: 14,
              backgroundColor: 'rgba(11, 13, 20, 0.4)',
              border: `1px solid ${m.color}12`,
              transition: `border-color 0.3s ${EASE}, background-color 0.3s ${EASE}`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${m.color}30`;
              (e.currentTarget as HTMLElement).style.backgroundColor = `rgba(11, 13, 20, 0.6)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${m.color}12`;
              (e.currentTarget as HTMLElement).style.backgroundColor = `rgba(11, 13, 20, 0.4)`;
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: `${m.color}12`, border: `1px solid ${m.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {m.icon}
              </div>
              <Sparkline values={m.trend} color={m.color} width={48} height={20} />
            </div>
            <div>
              <span style={{
                fontSize: 24, fontWeight: 800, color: m.color,
                lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                display: 'block',
                animation: `pod-stat-count 0.6s ${EASE} ${200 + i * 80}ms both`,
              }}>
                {m.value}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#a09888',
                display: 'block', marginTop: 3,
              }}>
                {m.label}
              </span>
              <span style={{ fontSize: 10, color: '#6b6358' }}>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="animate-fade-in" style={{ animationDelay: '300ms', opacity: 0, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <PodConnections />
      </div>
    </div>
  );
}

/* ─── Expandable Card Accordion ─── */

function ExpandedPodDetails({ pod, health }: { pod: Pod; health: PodHealth }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, []);

  return (
    <div
      style={{
        overflow: 'hidden',
        maxHeight: typeof contentHeight === 'number' ? contentHeight + 40 : 500,
        animation: `pod-fade-in-up 0.4s ${EASE} both`,
      }}
    >
      <div
        ref={contentRef}
        style={{
          padding: '20px 24px',
          borderTop: `1px solid ${pod.color}15`,
          background: `linear-gradient(180deg, ${pod.color}06, transparent)`,
        }}
      >
        {/* Mini stat row with trend sparklines */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{
            padding: '14px 16px',
            borderRadius: 12,
            backgroundColor: 'rgba(11, 13, 20, 0.5)',
            border: '1px solid rgba(30, 38, 56, 0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6358' }}>
                Attendance
              </span>
              <Sparkline values={health.weeklyActivity} color={pod.color} width={40} height={16} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <VitalityRing value={health.attendance} color={health.attendance >= 85 ? '#6b8f71' : '#e8b44c'} size={40} strokeWidth={3} />
              <div>
                <span style={{
                  fontSize: 18, fontWeight: 800,
                  color: health.attendance >= 85 ? '#6b8f71' : '#e8b44c',
                  fontVariantNumeric: 'tabular-nums',
                  display: 'block',
                }}>
                  {health.attendance}%
                </span>
                <span style={{ fontSize: 9, color: '#6b6358' }}>Last 4 weeks</span>
              </div>
            </div>
          </div>

          <div style={{
            padding: '14px 16px',
            borderRadius: 12,
            backgroundColor: 'rgba(11, 13, 20, 0.5)',
            border: '1px solid rgba(30, 38, 56, 0.5)',
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6358', display: 'block', marginBottom: 8 }}>
              Engagement
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <VitalityRing value={health.engagement} color={health.engagement >= 85 ? '#6b8f71' : '#e8b44c'} size={40} strokeWidth={3} />
              <div>
                <span style={{
                  fontSize: 18, fontWeight: 800,
                  color: health.engagement >= 85 ? '#6b8f71' : '#e8b44c',
                  fontVariantNumeric: 'tabular-nums',
                  display: 'block',
                }}>
                  {health.engagement}%
                </span>
                <div style={{
                  marginTop: 4, height: 3, width: 60, backgroundColor: '#1e2638', borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${health.engagement}%`,
                    backgroundColor: health.engagement >= 85 ? '#6b8f71' : '#e8b44c',
                    borderRadius: 2,
                    transition: `width 0.6s ${EASE}`,
                  }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '14px 16px',
            borderRadius: 12,
            backgroundColor: 'rgba(11, 13, 20, 0.5)',
            border: '1px solid rgba(30, 38, 56, 0.5)',
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6358', display: 'block', marginBottom: 8 }}>
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

        {/* Rituals & Meetings */}
        {pod.rituals && pod.rituals.length > 0 && (
          <div style={{
            padding: '14px 16px',
            borderRadius: 12,
            backgroundColor: 'rgba(11, 13, 20, 0.4)',
            border: `1px solid ${pod.color}10`,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: pod.color,
              display: 'block', marginBottom: 10,
            }}>
              Rituals & Meetings
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pod.rituals.map((ritual, ri) => (
                <div
                  key={ritual}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    animation: `pod-fade-in-up 0.3s ${EASE} ${ri * 80 + 200}ms both`,
                  }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    backgroundColor: pod.color,
                    boxShadow: `0 0 6px ${pod.color}40`,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 12, color: '#a09888' }}>{ritual}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Component ─── */

export function PodsView() {
  const [expandedPod, setExpandedPod] = useState<string | null>(null);
  const [hoveredPod, setHoveredPod] = useState<string | null>(null);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1180, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ marginBottom: 28, position: 'relative' }}>
        <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(232, 135, 160, 0.18), rgba(139, 92, 246, 0.12))',
              border: '1px solid rgba(232, 135, 160, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Heart size={22} style={{ color: '#e879a0', filter: 'drop-shadow(0 0 6px rgba(232, 135, 160, 0.4))' }} />
          </div>
          <div>
            <h1 className="text-glow" style={{
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

      {/* ── Stats Header (enhanced) ── */}
      <section className="animate-fade-in" style={{ animationDelay: '0.05s', opacity: 0, marginBottom: 28 }}>
        <StatsHeader />
      </section>

      {/* ── Pod Overview ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.1s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Palette size={18} style={{ color: '#d4a574' }} />
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 18,
        }}>
          {pods.map((pod, i) => {
            const Icon = pod.icon;
            const statusCfg = podStatusConfig[pod.status];
            const isExpanded = expandedPod === pod.name;
            const isHovered = hoveredPod === pod.name;
            const health = podHealth.find(h => h.pod === pod.name);

            return (
              <div
                key={pod.name}
                className="animate-fade-in card-interactive"
                onMouseEnter={() => setHoveredPod(pod.name)}
                onMouseLeave={() => setHoveredPod(null)}
                style={{
                  background: GLASS.bg,
                  backdropFilter: GLASS.blur,
                  WebkitBackdropFilter: GLASS.blur,
                  border: `1px solid ${isExpanded ? `${pod.color}35` : isHovered ? `${pod.color}25` : GLASS.border}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: `border-color 0.3s ${EASE}, box-shadow 0.4s ${EASE}, transform 0.4s ${EASE}`,
                  animationDelay: `${0.12 + i * 0.06}s`,
                  opacity: 0,
                  boxShadow: isHovered
                    ? `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${pod.color}15, inset 0 1px 0 ${pod.color}08`
                    : '0 2px 8px rgba(0,0,0,0.15)',
                  transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  position: 'relative',
                }}
              >
                {/* Themed gradient strip at top */}
                <div style={{
                  height: 3,
                  background: `linear-gradient(90deg, ${pod.color}00, ${pod.color}, ${pod.color}00)`,
                  opacity: isHovered || isExpanded ? 0.8 : 0.3,
                  transition: `opacity 0.4s ${EASE}`,
                }} />

                <div style={{ padding: '20px 22px 18px' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Pod icon with glow */}
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 13,
                        background: `linear-gradient(135deg, ${pod.color}18, ${pod.color}08)`,
                        border: `1px solid ${pod.color}25`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: `box-shadow 0.4s ${EASE}`,
                        boxShadow: isHovered ? `0 0 16px ${pod.color}25` : `0 0 0px ${pod.color}00`,
                      }}>
                        <Icon
                          size={21}
                          style={{
                            color: pod.color,
                            ['--pod-icon-color' as string]: `${pod.color}60`,
                            animation: isHovered ? `pod-icon-breathe 2s ease-in-out infinite` : 'none',
                          } as React.CSSProperties}
                        />
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
                  <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.65, margin: '0 0 12px 0' }}>
                    {pod.description}
                  </p>

                  {/* Practice area tag pills */}
                  <div style={{ marginBottom: 14 }}>
                    <PracticeTagPills areas={pod.practiceAreas} color={pod.color} />
                  </div>

                  {/* Member avatars + member count badge + meta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AvatarStack members={pod.members} max={5} podColor={pod.color} />
                      {/* Member count badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 20,
                        backgroundColor: `${pod.color}10`,
                        border: `1px solid ${pod.color}15`,
                      }}>
                        <Users size={10} style={{ color: pod.color }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: pod.color, fontVariantNumeric: 'tabular-nums' }}>
                          {pod.memberCount}
                        </span>
                        <span style={{ fontSize: 10, color: '#6b6358' }}>/ {pod.targetMembers}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={12} style={{ color: '#6b6358' }} />
                      <span style={{ fontSize: 11, color: '#a09888' }}>
                        Next: <span style={{ color: '#f0ebe4', fontWeight: 500 }}>{pod.nextMeeting}</span>
                      </span>
                    </div>
                  </div>

                  {/* Vitality ring (mini) in card */}
                  {health && (
                    <div style={{
                      marginTop: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '10px 14px',
                      borderRadius: 12,
                      backgroundColor: 'rgba(11, 13, 20, 0.4)',
                      border: '1px solid rgba(30, 38, 56, 0.4)',
                    }}>
                      <VitalityRing
                        value={Math.round((health.attendance + health.engagement) / 2)}
                        color={pod.color}
                        size={36}
                        strokeWidth={3}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6358' }}>
                            Pod Vitality
                          </span>
                          <TrendingUp size={12} style={{ color: pod.color, opacity: 0.6 }} />
                        </div>
                        <Sparkline values={health.weeklyActivity} color={pod.color} width={100} height={18} />
                      </div>
                    </div>
                  )}

                  {/* Recent activity line */}
                  <div style={{
                    marginTop: 12, padding: '8px 12px',
                    backgroundColor: `${pod.color}06`,
                    borderRadius: 10,
                    borderLeft: `2px solid ${pod.color}30`,
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
                    justifyContent: 'center', gap: 6, padding: '11px 0',
                    fontSize: 11, fontWeight: 500,
                    color: isExpanded ? pod.color : '#6b6358',
                    backgroundColor: isExpanded ? `${pod.color}06` : 'transparent',
                    borderTop: `1px solid ${isExpanded ? `${pod.color}15` : '#1e263850'}`,
                    border: 'none', borderTopStyle: 'solid',
                    borderTopWidth: 1, borderTopColor: isExpanded ? `${pod.color}15` : '#1e263850',
                    cursor: 'pointer',
                    transition: `color 0.3s ${EASE}, background-color 0.3s ${EASE}`,
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) (e.currentTarget as HTMLElement).style.color = pod.color;
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) (e.currentTarget as HTMLElement).style.color = '#6b6358';
                  }}
                >
                  {isExpanded ? (
                    <>Show less <ChevronUp size={13} /></>
                  ) : (
                    <>Show more <ChevronDown size={13} /></>
                  )}
                </button>

                {/* Expanded details with smooth accordion */}
                {isExpanded && health && (
                  <ExpandedPodDetails pod={pod} health={health} />
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
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Pod Activity Timeline
          </h2>
        </div>

        <div className="card-premium" style={{
          background: GLASS.bg,
          backdropFilter: GLASS.blur,
          WebkitBackdropFilter: GLASS.blur,
          border: `1px solid ${GLASS.border}`,
          borderRadius: 16,
          padding: '20px 24px',
          position: 'relative',
        }}>
          {/* Timeline line with gradient fade */}
          <div style={{
            position: 'absolute',
            left: 38,
            top: 28,
            bottom: 28,
            width: 2,
            background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.2), rgba(30, 38, 56, 0.6), rgba(30, 38, 56, 0.2))',
            borderRadius: 1,
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
                    transition: `background-color 0.3s ${EASE}`,
                    borderRadius: 10,
                  }}
                >
                  {/* Timeline dot with glow */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 10,
                    background: `linear-gradient(135deg, ${evt.color}18, ${evt.color}08)`,
                    border: `1px solid ${evt.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: `0 0 8px ${evt.color}15`,
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
                      <span style={{
                        fontSize: 10, color: '#6b6358',
                        padding: '1px 8px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                      }}>
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
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
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
                className="animate-fade-in card-interactive"
                style={{
                  background: GLASS.bg,
                  backdropFilter: GLASS.blur,
                  WebkitBackdropFilter: GLASS.blur,
                  border: `1px solid ${GLASS.border}`,
                  borderRadius: 14,
                  padding: 20,
                  animationDelay: `${0.38 + i * 0.05}s`,
                  opacity: 0,
                  transition: `border-color 0.3s ${EASE}, box-shadow 0.4s ${EASE}, transform 0.3s ${EASE}`,
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = `${practice.color}25`;
                  el.style.boxShadow = `0 6px 24px rgba(0,0,0,0.25), 0 0 0 1px ${practice.color}12`;
                  el.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = GLASS.border;
                  el.style.boxShadow = 'none';
                  el.style.transform = 'translateY(0)';
                }}
              >
                {/* Subtle top gradient strip */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${practice.color}50, transparent)`,
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `linear-gradient(135deg, ${practice.color}18, ${practice.color}08)`,
                    border: `1px solid ${practice.color}25`,
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
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
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

        <div className="card-premium" style={{
          background: GLASS.bg,
          backdropFilter: GLASS.blur,
          WebkitBackdropFilter: GLASS.blur,
          border: `1px solid ${GLASS.border}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 80px 1fr 1.2fr',
            padding: '12px 24px',
            backgroundColor: 'rgba(11, 13, 20, 0.5)',
            borderBottom: '1px solid rgba(30, 38, 56, 0.5)',
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
                  borderBottom: i < podHealth.length - 1 ? '1px solid rgba(30, 38, 56, 0.2)' : 'none',
                  alignItems: 'center',
                  transition: `background-color 0.3s ${EASE}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(212, 165, 116, 0.02)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {pod && (
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      backgroundColor: pod.color,
                      boxShadow: `0 0 6px ${pod.color}40`,
                    }} />
                  )}
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ebe4' }}>
                    {ph.pod}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 14, fontWeight: 700, color: attendanceColor,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {ph.attendance}%
                  </span>
                  <div className="progress-bar-animated" style={{
                    height: 4, backgroundColor: 'rgba(30, 38, 56, 0.5)', borderRadius: 2,
                    marginTop: 4, overflow: 'hidden', maxWidth: 80, margin: '4px auto 0',
                  }}>
                    <div style={{
                      height: '100%', width: `${ph.attendance}%`,
                      backgroundColor: attendanceColor, borderRadius: 2,
                      boxShadow: `0 0 4px ${attendanceColor}40`,
                    }} />
                  </div>
                </div>
                {/* Sparkline trend */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Sparkline
                    values={ph.weeklyActivity}
                    color={pod?.color || '#6b6358'}
                    width={48}
                    height={20}
                  />
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
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
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
              className="animate-fade-in card-interactive"
              style={{
                background: GLASS.bg,
                backdropFilter: GLASS.blur,
                WebkitBackdropFilter: GLASS.blur,
                border: `1px solid ${GLASS.border}`,
                borderRadius: 14,
                padding: 22,
                borderLeft: '3px solid #8b5cf640',
                animationDelay: `${0.58 + i * 0.06}s`,
                opacity: 0,
                transition: `border-left-color 0.3s ${EASE}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderLeftColor = '#8b5cf680';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderLeftColor = '#8b5cf640';
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
            background: 'rgba(11, 13, 20, 0.4)',
            border: '1px dashed rgba(46, 58, 78, 0.6)',
            borderRadius: 14, padding: 20, textAlign: 'center',
            transition: `border-color 0.3s ${EASE}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(46, 58, 78, 0.6)';
          }}
          >
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
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Gender Balance Tracker
          </h2>
        </div>

        <div className="card-premium" style={{
          background: GLASS.bg,
          backdropFilter: GLASS.blur,
          WebkitBackdropFilter: GLASS.blur,
          border: `1px solid ${GLASS.border}`,
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
                    overflow: 'hidden', backgroundColor: 'rgba(28, 34, 48, 0.6)',
                  }}>
                    <div style={{
                      width: `${malePct}%`,
                      background: 'linear-gradient(90deg, #5eaed4cc, #5eaed488)',
                      transition: `width 0.6s ${EASE}`,
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
                      transition: `width 0.6s ${EASE}`,
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
            backgroundColor: 'rgba(11, 13, 20, 0.4)', borderRadius: 10,
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
