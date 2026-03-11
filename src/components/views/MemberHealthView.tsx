'use client';

import { useState } from 'react';
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Users,
  TrendingDown,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquare,
  Activity,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Shield,
  Flame,
} from 'lucide-react';

/* --- Types --- */
interface Member {
  id: string;
  name: string;
  healthScore: number;
  prevHealthScore: number;
  status: 'Healthy' | 'Watch' | 'At Risk';
  lastEngagement: string;
  membershipTier: 'Individual' | 'Couple';
  monthlyRate: number;
  eventsAttended: number;
  totalEvents: number;
  podParticipation: string;
  communicationsOpened: number;
  npsScore: number;
  renewalDate: string;
  joinDate: string;
  notes: string;
  engagementByWeek: number[];
}

/* --- Default Data --- */
const defaultMembers: Member[] = [
  {
    id: 'mem-1', name: 'Michael Chen', healthScore: 95, prevHealthScore: 92,
    status: 'Healthy', lastEngagement: '2 days ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 4, totalEvents: 4,
    podParticipation: 'Capital pod \u2014 active contributor', communicationsOpened: 18,
    npsScore: 10, renewalDate: 'Sep 2026', joinDate: 'Sep 2025',
    notes: 'Highly engaged. Consistently attends all events and pod sessions.',
    engagementByWeek: [8, 9, 10, 9, 10, 8, 9, 10, 9, 10, 8, 10],
  },
  {
    id: 'mem-2', name: 'Sarah Martinez', healthScore: 88, prevHealthScore: 84,
    status: 'Healthy', lastEngagement: '5 days ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 3, totalEvents: 4,
    podParticipation: 'Bioregions pod \u2014 new member', communicationsOpened: 14,
    npsScore: 9, renewalDate: 'Jan 2027', joinDate: 'Jan 2026',
    notes: 'New member since Cabo retreat. Onboarding well, strong early engagement.',
    engagementByWeek: [0, 0, 0, 5, 6, 7, 7, 8, 7, 8, 8, 9],
  },
  {
    id: 'mem-3', name: 'David Thornton', healthScore: 72, prevHealthScore: 78,
    status: 'Watch', lastEngagement: '18 days ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 2, totalEvents: 4,
    podParticipation: 'Capital pod \u2014 missed last 2 sessions', communicationsOpened: 8,
    npsScore: 7, renewalDate: 'Jun 2026', joinDate: 'Jun 2025',
    notes: 'Missed last 2 pod sessions. May have scheduling conflicts \u2014 follow up.',
    engagementByWeek: [7, 8, 7, 8, 7, 6, 5, 5, 4, 3, 3, 4],
  },
  {
    id: 'mem-4', name: 'Elena Vasquez', healthScore: 91, prevHealthScore: 89,
    status: 'Healthy', lastEngagement: '3 days ago', membershipTier: 'Couple',
    monthlyRate: 1700, eventsAttended: 4, totalEvents: 4,
    podParticipation: 'Thesis of Change pod \u2014 co-facilitator', communicationsOpened: 20,
    npsScore: 10, renewalDate: 'Aug 2026', joinDate: 'Aug 2025',
    notes: 'Couple membership. Both partners highly engaged. Potential ambassador.',
    engagementByWeek: [8, 8, 9, 9, 9, 10, 10, 9, 10, 10, 9, 10],
  },
  {
    id: 'mem-5', name: 'Robert Kim', healthScore: 45, prevHealthScore: 52,
    status: 'At Risk', lastEngagement: '62 days ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 0, totalEvents: 4,
    podParticipation: 'None \u2014 not attending', communicationsOpened: 2,
    npsScore: 4, renewalDate: 'Apr 2026', joinDate: 'Apr 2025',
    notes: 'No engagement in 60+ days. Multiple outreach attempts unanswered.',
    engagementByWeek: [5, 4, 3, 2, 2, 1, 1, 0, 0, 0, 1, 0],
  },
  {
    id: 'mem-6', name: 'Jennifer Walsh', healthScore: 83, prevHealthScore: 80,
    status: 'Healthy', lastEngagement: '7 days ago', membershipTier: 'Couple',
    monthlyRate: 1700, eventsAttended: 3, totalEvents: 4,
    podParticipation: 'Capital pod \u2014 regular attendee', communicationsOpened: 15,
    npsScore: 9, renewalDate: 'Nov 2026', joinDate: 'Jul 2025',
    notes: 'Recently upgraded from Individual to Couple tier. Partner joining events.',
    engagementByWeek: [6, 6, 7, 7, 7, 8, 8, 8, 9, 8, 8, 9],
  },
  {
    id: 'mem-7', name: 'Marcus Johnson', healthScore: 58, prevHealthScore: 62,
    status: 'Watch', lastEngagement: '25 days ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 1, totalEvents: 4,
    podParticipation: 'Bioregions pod \u2014 sporadic', communicationsOpened: 6,
    npsScore: 6, renewalDate: 'May 2026', joinDate: 'May 2025',
    notes: 'Payment issue flagged \u2014 card declined last month. Resolved but watching.',
    engagementByWeek: [7, 6, 5, 5, 4, 4, 3, 3, 3, 2, 2, 3],
  },
  {
    id: 'mem-8', name: 'Lisa Park', healthScore: 94, prevHealthScore: 93,
    status: 'Healthy', lastEngagement: '1 day ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 4, totalEvents: 4,
    podParticipation: 'Capitalism 2.0 pod \u2014 facilitator', communicationsOpened: 22,
    npsScore: 10, renewalDate: 'Oct 2026', joinDate: 'Oct 2025',
    notes: 'Pod facilitator. One of our most engaged members. Key community anchor.',
    engagementByWeek: [9, 10, 10, 9, 10, 10, 10, 10, 9, 10, 10, 10],
  },
  {
    id: 'mem-9', name: 'Thomas Reed', healthScore: 38, prevHealthScore: 45,
    status: 'At Risk', lastEngagement: '45 days ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 0, totalEvents: 4,
    podParticipation: 'None \u2014 dropped out', communicationsOpened: 1,
    npsScore: 3, renewalDate: 'Mar 2026', joinDate: 'Mar 2025',
    notes: 'Considering cancellation. Expressed dissatisfaction with event scheduling.',
    engagementByWeek: [6, 5, 4, 3, 3, 2, 1, 1, 0, 0, 0, 0],
  },
  {
    id: 'mem-10', name: 'Amanda Foster', healthScore: 76, prevHealthScore: 74,
    status: 'Watch', lastEngagement: '14 days ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 2, totalEvents: 4,
    podParticipation: 'Thesis of Change pod \u2014 intermittent', communicationsOpened: 10,
    npsScore: 7, renewalDate: 'Jul 2026', joinDate: 'Jul 2025',
    notes: 'Travel schedule conflicts with events. Engaged when available.',
    engagementByWeek: [5, 7, 3, 8, 2, 7, 4, 8, 3, 7, 5, 6],
  },
  {
    id: 'mem-11', name: 'Daniel Okafor', healthScore: 89, prevHealthScore: 86,
    status: 'Healthy', lastEngagement: '4 days ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 3, totalEvents: 4,
    podParticipation: 'Bioregions node \u2014 active contributor', communicationsOpened: 16,
    npsScore: 9, renewalDate: 'Dec 2026', joinDate: 'Dec 2025',
    notes: 'Active in Bioregions node. Contributing to regenerative agriculture projects.',
    engagementByWeek: [0, 0, 3, 5, 6, 7, 7, 8, 8, 8, 9, 9],
  },
  {
    id: 'mem-12', name: 'Rachel Green', healthScore: 67, prevHealthScore: 75,
    status: 'Watch', lastEngagement: '21 days ago', membershipTier: 'Individual',
    monthlyRate: 1200, eventsAttended: 2, totalEvents: 4,
    podParticipation: 'Capital pod \u2014 declining attendance', communicationsOpened: 7,
    npsScore: 6, renewalDate: 'Aug 2026', joinDate: 'Aug 2025',
    notes: 'Engagement declining over last 2 months. Was previously very active.',
    engagementByWeek: [9, 9, 8, 8, 7, 7, 6, 5, 4, 4, 3, 3],
  },
];

const alerts = [
  {
    type: 'danger' as const,
    message: 'Thomas Reed renewal is this month \u2014 considering cancellation. Immediate personal outreach needed.',
    action: 'Schedule 1:1 call with James',
  },
  {
    type: 'danger' as const,
    message: 'Robert Kim has not engaged in 60+ days. Multiple outreach attempts unanswered.',
    action: 'Final personal outreach before pause',
  },
  {
    type: 'warning' as const,
    message: 'Rachel Green engagement declining \u2014 was previously one of our most active members.',
    action: 'Check in on experience',
  },
  {
    type: 'warning' as const,
    message: 'Marcus Johnson had a payment issue last month. Card declined then resolved.',
    action: 'Monitor next billing cycle',
  },
  {
    type: 'info' as const,
    message: 'Jennifer Walsh upgraded to Couple tier \u2014 partner is now attending events.',
    action: 'Send welcome package to partner',
  },
];

/* --- Colors --- */
const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const ROSE = '#e879a0';
const GOLD = '#e8b44c';
const DANGER = '#e06060';

/* --- Helpers --- */
const statusColors: Record<string, { color: string; bg: string; borderColor: string }> = {
  Healthy: { color: SAGE, bg: `rgba(107,143,113,0.12)`, borderColor: `rgba(107,143,113,0.3)` },
  Watch: { color: GOLD, bg: `rgba(232,180,76,0.12)`, borderColor: `rgba(232,180,76,0.3)` },
  'At Risk': { color: DANGER, bg: `rgba(224,96,96,0.12)`, borderColor: `rgba(224,96,96,0.3)` },
};

const statusIcons: Record<string, React.ElementType> = {
  Healthy: CheckCircle,
  Watch: Clock,
  'At Risk': AlertTriangle,
};

const alertTypeColors: Record<string, { color: string; bg: string; borderColor: string }> = {
  danger: { color: DANGER, bg: `rgba(224,96,96,0.08)`, borderColor: `rgba(224,96,96,0.25)` },
  warning: { color: GOLD, bg: `rgba(232,180,76,0.08)`, borderColor: `rgba(232,180,76,0.25)` },
  info: { color: SAGE, bg: `rgba(107,143,113,0.08)`, borderColor: `rgba(107,143,113,0.25)` },
};

const alertTypeIcons: Record<string, React.ElementType> = {
  danger: AlertTriangle,
  warning: Clock,
  info: CheckCircle,
};

const scoreColor = (score: number) => {
  if (score >= 80) return SAGE;
  if (score >= 50) return GOLD;
  return DANGER;
};

/* --- SVG Radial Health Gauge --- */
function HealthGauge({ score, size = 140 }: { score: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half circle
  const pct = Math.min(score / 100, 1);
  const offset = circumference * (1 - pct);
  const color = scoreColor(score);

  return (
    <div style={{ position: 'relative', width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={DANGER} />
            <stop offset="50%" stopColor={GOLD} />
            <stop offset="100%" stopColor={SAGE} />
          </linearGradient>
        </defs>
        {/* Track */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
            filter: `drop-shadow(0 0 6px ${color}50)`,
          }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI * (1 - tick / 100);
          const x1 = size / 2 + (radius - 16) * Math.cos(angle);
          const y1 = size / 2 - (radius - 16) * Math.sin(angle);
          const x2 = size / 2 + (radius - 8) * Math.cos(angle);
          const y2 = size / 2 - (radius - 8) * Math.sin(angle);
          return (
            <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 800, color: '#f0ebe4', fontFamily: 'monospace', lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontSize: 10, color: '#6b6358', marginTop: 2 }}>AVG HEALTH</div>
      </div>
    </div>
  );
}

/* --- Trend Arrow --- */
function TrendArrow({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (Math.abs(diff) < 1) {
    return <Minus size={12} style={{ color: '#6b6358' }} />;
  }
  if (diff > 0) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        <ArrowUpRight size={12} style={{ color: SAGE }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: SAGE }}>+{diff}</span>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <ArrowDownRight size={12} style={{ color: DANGER }} />
      <span style={{ fontSize: 10, fontWeight: 600, color: DANGER }}>{diff}</span>
    </span>
  );
}

/* --- Engagement Heatmap --- */
function EngagementHeatmap({ data, label }: { data: number[]; label?: string }) {
  const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
  return (
    <div>
      {label && <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>}
      <div style={{ display: 'flex', gap: 2 }}>
        {data.map((val, i) => {
          const intensity = Math.min(val / 10, 1);
          const bg = val === 0
            ? 'rgba(255,255,255,0.03)'
            : `rgba(107, 143, 113, ${0.1 + intensity * 0.6})`;
          return (
            <div
              key={i}
              title={`${weekLabels[i]}: ${val}/10`}
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                backgroundColor: bg,
                border: val === 0 ? '1px solid rgba(255,255,255,0.05)' : `1px solid rgba(107, 143, 113, ${0.15 + intensity * 0.3})`,
                transition: 'transform 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* --- Mini Sparkline --- */
function MiniSparkline({ values, color = SAGE }: { values: number[]; color?: string }) {
  const width = 60;
  const height = 20;
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - (values[values.length - 1] / max) * height} r="2" fill={color} />
    </svg>
  );
}

/* ===================================================================
   Main Component
   =================================================================== */

export function MemberHealthView() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const sortedMembers = [...defaultMembers].sort((a, b) => a.healthScore - b.healthScore);
  const filteredMembers =
    filterStatus === 'all'
      ? sortedMembers
      : sortedMembers.filter((m) => m.status === filterStatus);

  const totalMembers = defaultMembers.length;
  const avgScore = Math.round(
    defaultMembers.reduce((sum, m) => sum + m.healthScore, 0) / defaultMembers.length,
  );
  const healthyCount = defaultMembers.filter((m) => m.status === 'Healthy').length;
  const watchCount = defaultMembers.filter((m) => m.status === 'Watch').length;
  const atRiskCount = defaultMembers.filter((m) => m.status === 'At Risk').length;
  const avgPrevScore = Math.round(
    defaultMembers.reduce((sum, m) => sum + m.prevHealthScore, 0) / defaultMembers.length,
  );

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px' }}>
      {/* -- Header -- */}
      <div
        className="animate-fade-in"
        style={{ marginBottom: 32, opacity: 0, animationDelay: '0ms' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Heart size={28} style={{ color: AMBER }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4', margin: 0, letterSpacing: '-0.01em' }}>
            Member Health
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#a09888', margin: 0, paddingLeft: 40 }}>
          Composite health scoring for every well-steward. Monitor engagement,
          satisfaction, and proactively nurture your community.
        </p>
      </div>

      {/* -- Summary Stats with Gauge -- */}
      <div
        className="animate-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          gap: 24,
          marginBottom: 24,
          animationDelay: '0.04s',
          opacity: 0,
        }}
      >
        {/* Radial Gauge */}
        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: '20px 16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HealthGauge score={avgScore} size={150} />
          <TrendArrow current={avgScore} previous={avgPrevScore} />
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Members', value: '~65', sub: `Tracked: ${totalMembers} sample`, color: AMBER, icon: Users },
            { label: 'Healthy', value: healthyCount.toString(), sub: 'Score 80+', color: SAGE, icon: CheckCircle },
            { label: 'Watch', value: watchCount.toString(), sub: 'Score 50-79', color: GOLD, icon: Clock },
            { label: 'At Risk', value: atRiskCount.toString(), sub: 'Score <50', color: DANGER, icon: AlertTriangle },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="animate-fade-in glow-card"
                style={{
                  backgroundColor: `${stat.color}0a`,
                  border: `1px solid ${stat.color}20`,
                  borderRadius: 12,
                  padding: '16px 14px',
                  animationDelay: `${0.06 + i * 0.03}s`,
                  opacity: 0,
                  transition: 'border-color 0.3s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${stat.color}40`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${stat.color}20`;
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Icon size={14} style={{ color: stat.color }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: stat.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {stat.label}
                  </span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: 'monospace', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 10, color: '#6b6358', marginTop: 4 }}>{stat.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -- Proactive Alerts -- */}
      <div
        className="animate-fade-in"
        style={{ marginBottom: 24, animationDelay: '0.1s', opacity: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <AlertTriangle size={16} style={{ color: GOLD }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>Proactive Alerts</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 20,
              color: GOLD,
              backgroundColor: `rgba(232,180,76,0.15)`,
            }}
          >
            {alerts.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map((alert, idx) => {
            const ac = alertTypeColors[alert.type];
            const AlertIcon = alertTypeIcons[alert.type];
            return (
              <div
                key={idx}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  backgroundColor: ac.bg,
                  border: `1px solid ${ac.borderColor}`,
                  animationDelay: `${0.12 + idx * 0.03}s`,
                  opacity: 0,
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                <AlertIcon size={16} style={{ color: ac.color, flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#f0ebe4', margin: 0, lineHeight: 1.5 }}>{alert.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <ArrowRight size={10} style={{ color: '#6b6358' }} />
                    <span style={{ fontSize: 11, color: '#a09888' }}>{alert.action}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -- Filter Controls -- */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          animationDelay: '0.18s',
          opacity: 0,
        }}
      >
        <Filter size={13} style={{ color: '#6b6358' }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Filter:
        </span>
        {['all', 'Healthy', 'Watch', 'At Risk'].map((status) => {
          const isActive = filterStatus === status;
          const c = status === 'all' ? AMBER : statusColors[status]?.color || AMBER;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: 8,
                border: `1px solid ${isActive ? c + '40' : '#1e2638'}`,
                backgroundColor: isActive ? `${c}15` : '#131720',
                color: isActive ? c : '#6b6358',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {status === 'all' ? 'All Members' : status}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b6358' }}>
          Showing {filteredMembers.length} of {totalMembers}
        </span>
      </div>

      {/* -- Member Health Cards -- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredMembers.map((member, idx) => {
          const sc = statusColors[member.status];
          const StatusIcon = statusIcons[member.status];
          const isExpanded = expandedMember === member.id;
          const color = sc.color;

          return (
            <div
              key={member.id}
              className="animate-fade-in glow-card"
              style={{
                backgroundColor: '#131720',
                border: `1px solid ${isExpanded ? sc.borderColor : '#1e2638'}`,
                borderRadius: 14,
                padding: '16px 20px',
                animationDelay: `${0.2 + idx * 0.03}s`,
                opacity: 0,
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                if (!isExpanded) e.currentTarget.style.borderColor = '#2e3a4e';
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) e.currentTarget.style.borderColor = '#1e2638';
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}
              >
                {/* Status icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 200, flexShrink: 0 }}>
                  <StatusIcon size={16} style={{ color }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>{member.name}</div>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 20,
                        color,
                        backgroundColor: sc.bg,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>

                {/* Health score bar */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: '#1c2230', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${member.healthScore}%`,
                        borderRadius: 4,
                        backgroundColor: scoreColor(member.healthScore),
                        transition: 'width 0.7s ease-out',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(member.healthScore), fontFamily: 'monospace', width: 32, textAlign: 'right' }}>
                    {member.healthScore}
                  </span>
                  <TrendArrow current={member.healthScore} previous={member.prevHealthScore} />
                </div>

                {/* Quick info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#6b6358' }}>Tier</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#d8cfc4' }}>{member.membershipTier}</div>
                    <div style={{ fontSize: 10, color: AMBER }}>${member.monthlyRate.toLocaleString()}/mo</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#6b6358' }}>Last Active</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#a09888' }}>{member.lastEngagement}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#6b6358' }}>NPS</div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: member.npsScore >= 9 ? SAGE : member.npsScore >= 7 ? GOLD : DANGER,
                      }}
                    >
                      {member.npsScore}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={14} style={{ color: '#6b6358' }} />
                  ) : (
                    <ChevronDown size={14} style={{ color: '#6b6358' }} />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1e2638' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                    <div style={{ backgroundColor: '#0f1219', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={10} /> Events Attended
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#1c2230', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${(member.eventsAttended / member.totalEvents) * 100}%`,
                              backgroundColor: VIOLET,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f0ebe4', fontFamily: 'monospace' }}>
                          {member.eventsAttended}/{member.totalEvents}
                        </span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#0f1219', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={10} /> Pod Participation
                      </div>
                      <div style={{ fontSize: 11, color: '#a09888', lineHeight: 1.4 }}>{member.podParticipation}</div>
                    </div>
                    <div style={{ backgroundColor: '#0f1219', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageSquare size={10} /> Comms Opened
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#1c2230', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min((member.communicationsOpened / 22) * 100, 100)}%`,
                              backgroundColor: '#5eaed4',
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f0ebe4', fontFamily: 'monospace' }}>
                          {member.communicationsOpened}
                        </span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#0f1219', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={10} /> NPS Score
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: member.npsScore >= 9 ? SAGE : member.npsScore >= 7 ? GOLD : DANGER,
                          }}
                        >
                          {member.npsScore}
                        </span>
                        <span style={{ fontSize: 11, color: '#6b6358' }}>/10</span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 20,
                            color: member.npsScore >= 9 ? SAGE : member.npsScore >= 7 ? GOLD : DANGER,
                            backgroundColor: member.npsScore >= 9 ? `rgba(107,143,113,0.12)` : member.npsScore >= 7 ? `rgba(232,180,76,0.12)` : `rgba(224,96,96,0.12)`,
                          }}
                        >
                          {member.npsScore >= 9 ? 'Promoter' : member.npsScore >= 7 ? 'Passive' : 'Detractor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Heatmap */}
                  <div style={{ backgroundColor: '#0f1219', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <EngagementHeatmap data={member.engagementByWeek} label="12-Week Engagement Heatmap" />
                      <MiniSparkline values={member.engagementByWeek} color={scoreColor(member.healthScore)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div style={{ backgroundColor: '#0f1219', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 4 }}>Member Since</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>{member.joinDate}</div>
                    </div>
                    <div style={{ backgroundColor: '#0f1219', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 4 }}>Renewal Date</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: AMBER }}>{member.renewalDate}</div>
                    </div>
                    <div style={{ backgroundColor: '#0f1219', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 4 }}>Notes</div>
                      <div style={{ fontSize: 11, color: '#a09888', lineHeight: 1.4 }}>{member.notes}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* -- Engagement Distribution -- */}
      <div
        className="animate-fade-in glow-card"
        style={{
          backgroundColor: '#131720',
          border: '1px solid #1e2638',
          borderRadius: 16,
          padding: 24,
          marginTop: 24,
          animationDelay: '0.35s',
          opacity: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Activity size={16} style={{ color: AMBER }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>Engagement Distribution</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {/* Health Score Distribution */}
          <div>
            <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Health Score Bands
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '90-100 (Excellent)', count: defaultMembers.filter(m => m.healthScore >= 90).length, color: SAGE },
                { label: '80-89 (Good)', count: defaultMembers.filter(m => m.healthScore >= 80 && m.healthScore < 90).length, color: '#5eaed4' },
                { label: '50-79 (Watch)', count: defaultMembers.filter(m => m.healthScore >= 50 && m.healthScore < 80).length, color: GOLD },
                { label: '<50 (At Risk)', count: defaultMembers.filter(m => m.healthScore < 50).length, color: DANGER },
              ].map((band) => (
                <div key={band.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#6b6358', width: 110, flexShrink: 0 }}>{band.label}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#1c2230', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(band.count / totalMembers) * 100}%`,
                        backgroundColor: band.color,
                        borderRadius: 3,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f0ebe4', fontFamily: 'monospace', width: 20, textAlign: 'right' }}>
                    {band.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Membership Tier */}
          <div>
            <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Membership Tiers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Individual', count: defaultMembers.filter(m => m.membershipTier === 'Individual').length, rate: '$1,200/mo', color: AMBER },
                { label: 'Couple', count: defaultMembers.filter(m => m.membershipTier === 'Couple').length, rate: '$1,700/mo', color: VIOLET },
              ].map((tier) => (
                <div key={tier.label} style={{ backgroundColor: '#0f1219', borderRadius: 8, padding: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>{tier.label}</span>
                    <span style={{ fontSize: 10, color: AMBER }}>{tier.rate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tier.color }} />
                    <span style={{ fontSize: 11, color: '#a09888' }}>{tier.count} members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NPS Distribution */}
          <div>
            <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              NPS Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Promoters (9-10)', count: defaultMembers.filter(m => m.npsScore >= 9).length, color: SAGE },
                { label: 'Passives (7-8)', count: defaultMembers.filter(m => m.npsScore >= 7 && m.npsScore < 9).length, color: GOLD },
                { label: 'Detractors (0-6)', count: defaultMembers.filter(m => m.npsScore < 7).length, color: DANGER },
              ].map((seg) => (
                <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#6b6358', width: 110, flexShrink: 0 }}>{seg.label}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#1c2230', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(seg.count / totalMembers) * 100}%`,
                        backgroundColor: seg.color,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f0ebe4', fontFamily: 'monospace', width: 20, textAlign: 'right' }}>
                    {seg.count}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #1e2638', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#6b6358' }}>Net Promoter Score</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: SAGE, fontFamily: 'monospace' }}>
                  {Math.round(
                    ((defaultMembers.filter(m => m.npsScore >= 9).length -
                      defaultMembers.filter(m => m.npsScore < 7).length) /
                      totalMembers) * 100
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
