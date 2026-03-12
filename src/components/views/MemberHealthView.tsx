'use client';

import { useState, useEffect } from 'react';
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Users,
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
  Eye,
  BarChart3,
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
const CREAM = '#f0ebe4';
const MUTED = '#a09888';
const BG_DARK = '#0b0d14';
const BG_CARD = 'rgba(19,23,32,0.7)';
const BORDER_SUBTLE = 'rgba(212,165,116,0.08)';
const EASE_SPRING = 'cubic-bezier(0.16,1,0.3,1)';

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

/* --- Scoped Keyframes Injection --- */
const MH_KEYFRAMES_ID = 'mh-view-keyframes';

function injectMhKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(MH_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = MH_KEYFRAMES_ID;
  style.textContent = `
    @keyframes mh-fade-in {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes mh-fade-in-scale {
      from { opacity: 0; transform: scale(0.95) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes mh-slide-in-left {
      from { opacity: 0; transform: translateX(-16px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes mh-slide-in-right {
      from { opacity: 0; transform: translateX(16px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes mh-ring-fill {
      from { stroke-dashoffset: var(--mh-ring-circumference); }
      to { stroke-dashoffset: var(--mh-ring-target); }
    }
    @keyframes mh-pulse-risk {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.6); }
    }
    @keyframes mh-pulse-risk-glow {
      0%, 100% { box-shadow: 0 0 4px rgba(224,96,96,0.3); }
      50% { box-shadow: 0 0 12px rgba(224,96,96,0.7); }
    }
    @keyframes mh-pulse-warn {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.5); }
    }
    @keyframes mh-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes mh-alert-gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes mh-counter-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    @keyframes mh-bar-fill {
      from { width: 0%; }
      to { width: var(--mh-bar-width); }
    }
    @keyframes mh-sparkline-draw {
      from { stroke-dashoffset: var(--mh-sparkline-length); }
      to { stroke-dashoffset: 0; }
    }
    @keyframes mh-dot-appear {
      from { opacity: 0; r: 0; }
      to { opacity: 1; r: 2.5; }
    }
    @keyframes mh-avatar-ring-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes mh-matrix-cell-in {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes mh-number-in {
      from { opacity: 0; transform: translateY(8px) scale(0.8); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes mh-header-glow {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(212,165,116,0.15)); }
      50% { filter: drop-shadow(0 0 20px rgba(212,165,116,0.35)); }
    }
  `;
  document.head.appendChild(style);
}

/* --- Glassmorphism card style helper --- */
const glassCard = (borderColor = BORDER_SUBTLE): React.CSSProperties => ({
  background: BG_CARD,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${borderColor}`,
  borderRadius: 16,
});

/* --- Animated Circular Progress Ring (Full Circle) --- */
function HealthRing({
  score,
  size = 160,
  strokeWidth = 10,
  delay = '0.3s',
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  delay?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / 100, 1);
  const target = circumference * (1 - pct);
  const color = scoreColor(score);

  // Color-coded segments: red 0-50, gold 50-80, green 80-100
  const segments = [
    { start: 0, end: 0.5, color: DANGER },
    { start: 0.5, end: 0.8, color: GOLD },
    { start: 0.8, end: 1, color: SAGE },
  ];

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        {/* Color segment indicators on the track */}
        {segments.map((seg, i) => {
          const segLen = (seg.end - seg.start) * circumference;
          const segOffset = circumference - seg.start * circumference;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth * 0.25}
              strokeDasharray={`${segLen} ${circumference - segLen}`}
              strokeDashoffset={segOffset}
              opacity={0.12}
            />
          );
        })}
        {/* Animated progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#mh-ring-gradient)`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={target}
          style={{
            '--mh-ring-circumference': circumference,
            '--mh-ring-target': target,
            animation: `mh-ring-fill 1.6s ${EASE_SPRING} ${delay} both`,
            filter: `drop-shadow(0 0 8px ${color}60)`,
          } as React.CSSProperties}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="mh-ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={SAGE} />
            <stop offset="40%" stopColor={GOLD} />
            <stop offset="100%" stopColor={DANGER} />
          </linearGradient>
        </defs>
      </svg>
      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 800,
            color: CREAM,
            fontFamily: 'monospace',
            lineHeight: 1,
            animation: `mh-number-in 0.8s ${EASE_SPRING} ${delay} both`,
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontSize: 9,
            color: MUTED,
            marginTop: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}
        >
          Health Score
        </div>
      </div>
    </div>
  );
}

/* --- Mini Member Health Ring (for cards) --- */
function MiniHealthRing({ score, size = 40, strokeWidth = 3 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / 100, 1);
  const target = circumference * (1 - pct);
  const color = scoreColor(score);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={target}
        style={{ filter: `drop-shadow(0 0 4px ${color}50)` }}
      />
    </svg>
  );
}

/* --- Gradient Avatar Ring --- */
function AvatarRing({
  name,
  status,
  score,
  size = 44,
}: {
  name: string;
  status: string;
  score: number;
  size?: number;
}) {
  const sc = statusColors[status];
  const color = sc?.color || AMBER;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const isAtRisk = status === 'At Risk';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Animated gradient ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: 2,
          background: `conic-gradient(from 0deg, ${color}, ${color}40, ${color})`,
          animation: isAtRisk ? `mh-avatar-ring-rotate 3s linear infinite` : undefined,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}15, ${color}08)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.3,
            fontWeight: 700,
            color,
            letterSpacing: '0.02em',
          }}
        >
          {initials}
        </div>
      </div>
      {/* Risk pulse dot */}
      {isAtRisk && (
        <div
          style={{
            position: 'absolute',
            top: -1,
            right: -1,
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: DANGER,
            border: `2px solid ${BG_DARK}`,
            animation: `mh-pulse-risk 2s ease-in-out infinite`,
            zIndex: 2,
          }}
        />
      )}
      {status === 'Watch' && (
        <div
          style={{
            position: 'absolute',
            top: -1,
            right: -1,
            width: 9,
            height: 9,
            borderRadius: '50%',
            backgroundColor: GOLD,
            border: `2px solid ${BG_DARK}`,
            animation: `mh-pulse-warn 2.5s ease-in-out infinite`,
            zIndex: 2,
          }}
        />
      )}
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

/* --- Multi-Dimension Health Bar --- */
function HealthDimensionBar({
  label,
  value,
  max,
  color,
  delay = '0s',
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  delay?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 9, color: MUTED, width: 54, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
        {label}
      </span>
      <div
        className="progress-bar-animated"
        style={{
          flex: 1,
          height: 5,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.04)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${color}90, ${color})`,
            boxShadow: `0 0 8px ${color}30`,
            '--mh-bar-width': `${pct}%`,
            animation: `mh-bar-fill 1s ${EASE_SPRING} ${delay} both`,
          } as React.CSSProperties}
        />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: 'monospace', width: 28, textAlign: 'right' }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

/* --- Trend Sparkline (7-point with area fill) --- */
function TrendSparkline({
  values,
  color = SAGE,
  width = 80,
  height = 28,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  // Take last 7 data points for 7-day trend
  const data = values.slice(-7);
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 3;
  const effectiveW = width - padding * 2;
  const effectiveH = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * effectiveW;
    const y = padding + effectiveH - ((v - min) / range) * effectiveH;
    return { x, y };
  });

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0].x},${height} ${linePoints} ${points[points.length - 1].x},${height}`;

  // Estimate total path length for animation
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  const lastPt = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`mh-spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={areaPoints}
        fill={`url(#mh-spark-fill-${color.replace('#', '')})`}
        opacity={0.8}
      />
      {/* Line */}
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          '--mh-sparkline-length': totalLength,
          strokeDasharray: totalLength,
          animation: `mh-sparkline-draw 1.2s ${EASE_SPRING} 0.4s both`,
        } as React.CSSProperties}
      />
      {/* End dot */}
      <circle
        cx={lastPt.x}
        cy={lastPt.y}
        r={2.5}
        fill={color}
        style={{
          animation: `mh-dot-appear 0.3s ${EASE_SPRING} 1.5s both`,
          filter: `drop-shadow(0 0 3px ${color}80)`,
        }}
      />
    </svg>
  );
}

/* --- Engagement Heatmap --- */
function EngagementHeatmap({ data, label }: { data: number[]; label?: string }) {
  const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
  return (
    <div>
      {label && (
        <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', gap: 3 }}>
        {data.map((val, i) => {
          const intensity = Math.min(val / 10, 1);
          const bg =
            val === 0
              ? 'rgba(255,255,255,0.03)'
              : `rgba(107, 143, 113, ${0.1 + intensity * 0.6})`;
          return (
            <div
              key={i}
              title={`${weekLabels[i]}: ${val}/10`}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                backgroundColor: bg,
                border:
                  val === 0
                    ? '1px solid rgba(255,255,255,0.05)'
                    : `1px solid rgba(107, 143, 113, ${0.15 + intensity * 0.3})`,
                transition: `transform 0.2s ${EASE_SPRING}`,
                cursor: 'default',
                animation: `mh-matrix-cell-in 0.3s ${EASE_SPRING} ${i * 0.03}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* --- Health Matrix Grid --- */
function HealthMatrix({ members }: { members: Member[] }) {
  const dimensions = [
    { key: 'events', label: 'Events', getValue: (m: Member) => (m.eventsAttended / m.totalEvents) * 100 },
    { key: 'comms', label: 'Comms', getValue: (m: Member) => Math.min((m.communicationsOpened / 22) * 100, 100) },
    { key: 'nps', label: 'NPS', getValue: (m: Member) => m.npsScore * 10 },
    { key: 'health', label: 'Health', getValue: (m: Member) => m.healthScore },
  ];

  const matrixColor = (val: number) => {
    if (val >= 80) return SAGE;
    if (val >= 50) return GOLD;
    return DANGER;
  };

  const matrixOpacity = (val: number) => {
    return 0.15 + (val / 100) * 0.7;
  };

  // Sort by healthScore for matrix
  const sorted = [...members].sort((a, b) => b.healthScore - a.healthScore);

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 4, paddingLeft: 100 }}>
        {dimensions.map((d) => (
          <div
            key={d.key}
            style={{
              width: 48,
              fontSize: 8,
              color: MUTED,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
      {/* Data rows */}
      {sorted.map((member, mi) => (
        <div
          key={member.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            marginBottom: 2,
            animation: `mh-fade-in 0.4s ${EASE_SPRING} ${0.02 * mi}s both`,
          }}
        >
          <div
            style={{
              width: 100,
              fontSize: 10,
              color: CREAM,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              paddingRight: 8,
            }}
          >
            {member.name}
          </div>
          {dimensions.map((d, di) => {
            const val = d.getValue(member);
            const c = matrixColor(val);
            return (
              <div
                key={d.key}
                title={`${member.name} - ${d.label}: ${Math.round(val)}%`}
                style={{
                  width: 48,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: `mh-matrix-cell-in 0.3s ${EASE_SPRING} ${(mi * 4 + di) * 0.02}s both`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: c,
                    opacity: matrixOpacity(val),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 8,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.9)',
                    transition: `all 0.2s ${EASE_SPRING}`,
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = String(matrixOpacity(val));
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {Math.round(val)}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ===================================================================
   Main Component
   =================================================================== */

export function MemberHealthView() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    injectMhKeyframes();
  }, []);

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
  const dangerAlerts = alerts.filter((a) => a.type === 'danger');
  const hasCritical = dangerAlerts.length > 0;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px' }}>

      {/* ============================================
          Critical Alert Banner (animated gradient)
          ============================================ */}
      {hasCritical && (
        <div
          className="card-premium"
          style={{
            marginBottom: 24,
            borderRadius: 14,
            overflow: 'hidden',
            animation: `mh-fade-in 0.6s ${EASE_SPRING} 0s both`,
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              background: `linear-gradient(90deg, rgba(224,96,96,0.15), rgba(232,180,76,0.1), rgba(224,96,96,0.15))`,
              backgroundSize: '200% 100%',
              animation: `mh-alert-gradient 4s ease infinite`,
              border: `1px solid rgba(224,96,96,0.25)`,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `rgba(224,96,96,0.15)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} style={{ color: DANGER }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: DANGER, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                {dangerAlerts.length} Critical Alert{dangerAlerts.length > 1 ? 's' : ''} Requiring Attention
              </div>
              <div style={{ fontSize: 12, color: CREAM, opacity: 0.8, lineHeight: 1.4 }}>
                {dangerAlerts[0].message.split(' \u2014')[0]}
                {dangerAlerts.length > 1 && ` and ${dangerAlerts.length - 1} more`}
              </div>
            </div>
            <div
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: `1px solid rgba(224,96,96,0.3)`,
                fontSize: 11,
                fontWeight: 600,
                color: DANGER,
                background: 'rgba(224,96,96,0.08)',
                cursor: 'pointer',
                transition: `all 0.2s ${EASE_SPRING}`,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(224,96,96,0.18)';
                e.currentTarget.style.borderColor = 'rgba(224,96,96,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(224,96,96,0.08)';
                e.currentTarget.style.borderColor = 'rgba(224,96,96,0.3)';
              }}
            >
              Review Alerts
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          Header
          ============================================ */}
      <div
        style={{
          marginBottom: 32,
          animation: `mh-fade-in 0.7s ${EASE_SPRING} 0.05s both`,
          position: 'relative',
        }}
      >
        <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${AMBER}20, ${AMBER}08)`,
              border: `1px solid ${AMBER}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `mh-header-glow 3s ease-in-out infinite`,
            }}
          >
            <Heart size={22} style={{ color: AMBER }} />
          </div>
          <div>
            <h1
              className="text-glow"
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: CREAM,
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Member Health
            </h1>
            <p style={{ fontSize: 13, color: MUTED, margin: 0, marginTop: 2 }}>
              Composite health scoring for every well-steward. Monitor engagement,
              satisfaction, and proactively nurture your community.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================
          Dashboard Header: Ring + Stats
          ============================================ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 20,
          marginBottom: 24,
          animation: `mh-fade-in-scale 0.7s ${EASE_SPRING} 0.1s both`,
        }}
      >
        {/* Animated Circular Progress Ring */}
        <div
          className="card-premium"
          style={{
            ...glassCard(),
            padding: '24px 16px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <HealthRing score={avgScore} size={140} strokeWidth={9} delay="0.4s" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <TrendArrow current={avgScore} previous={avgPrevScore} />
            <span style={{ fontSize: 10, color: '#5a5248' }}>vs last period</span>
          </div>
        </div>

        {/* Stat cards with glassmorphism */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Members', value: '~65', sub: `Tracked: ${totalMembers} sample`, color: AMBER, icon: Users },
            { label: 'Healthy', value: healthyCount.toString(), sub: 'Score 80+', color: SAGE, icon: CheckCircle },
            { label: 'Watch', value: watchCount.toString(), sub: 'Score 50-79', color: GOLD, icon: Clock },
            { label: 'At Risk', value: atRiskCount.toString(), sub: 'Score <50', color: DANGER, icon: AlertTriangle },
          ].map((stat, i) => {
            const Icon = stat.icon;
            const isRisk = stat.label === 'At Risk' && atRiskCount > 0;
            return (
              <div
                key={stat.label}
                className="card-stat"
                style={{
                  ...glassCard(`${stat.color}15`),
                  padding: '16px 14px',
                  animation: `mh-slide-in-right 0.6s ${EASE_SPRING} ${0.15 + i * 0.06}s both`,
                  transition: `border-color 0.3s ${EASE_SPRING}, transform 0.3s ${EASE_SPRING}, box-shadow 0.3s`,
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${stat.color}35`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color}12`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${stat.color}15`;
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Shimmer overlay for At Risk */}
                {isRisk && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(90deg, transparent, ${DANGER}08, transparent)`,
                      backgroundSize: '200% 100%',
                      animation: `mh-shimmer 3s ease-in-out infinite`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      background: `${stat.color}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={12} style={{ color: stat.color }} />
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: stat.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: stat.color,
                    fontFamily: 'monospace',
                    lineHeight: 1,
                    animation: `mh-number-in 0.6s ${EASE_SPRING} ${0.3 + i * 0.06}s both`,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 10, color: '#5a5248', marginTop: 6 }}>{stat.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================
          Proactive Alerts
          ============================================ */}
      <div
        style={{
          marginBottom: 24,
          animation: `mh-fade-in 0.6s ${EASE_SPRING} 0.25s both`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <AlertTriangle size={16} style={{ color: GOLD }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: CREAM }}>Proactive Alerts</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              color: GOLD,
              backgroundColor: `rgba(232,180,76,0.15)`,
              border: `1px solid rgba(232,180,76,0.2)`,
              animation: `mh-counter-pulse 2s ease-in-out infinite`,
            }}
          >
            {alerts.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map((alert, idx) => {
            const ac = alertTypeColors[alert.type];
            const AlertIcon = alertTypeIcons[alert.type];
            const isDanger = alert.type === 'danger';
            return (
              <div
                key={idx}
                className="card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 18px',
                  borderRadius: 12,
                  ...glassCard(ac.borderColor),
                  background: ac.bg,
                  animation: `mh-slide-in-left 0.5s ${EASE_SPRING} ${0.3 + idx * 0.05}s both`,
                  transition: `transform 0.3s ${EASE_SPRING}, box-shadow 0.3s`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(6px)';
                  e.currentTarget.style.boxShadow = `0 4px 16px ${ac.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Pulsing dot for danger alerts */}
                {isDanger && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: DANGER,
                      animation: `mh-pulse-risk 1.5s ease-in-out infinite`,
                    }}
                  />
                )}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: `${ac.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <AlertIcon size={14} style={{ color: ac.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: CREAM, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                    {alert.message}
                  </p>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 8,
                      padding: '4px 10px',
                      borderRadius: 6,
                      backgroundColor: `${ac.color}08`,
                      border: `1px solid ${ac.color}15`,
                      transition: `all 0.2s ${EASE_SPRING}`,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${ac.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${ac.color}08`;
                    }}
                  >
                    <ArrowRight size={10} style={{ color: ac.color }} />
                    <span style={{ fontSize: 11, color: ac.color, fontWeight: 600 }}>{alert.action}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================
          Category Filter Pills (Premium Toggle)
          ============================================ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          animation: `mh-fade-in 0.5s ${EASE_SPRING} 0.4s both`,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Filter size={12} style={{ color: MUTED }} />
        </div>
        {['all', 'Healthy', 'Watch', 'At Risk'].map((status) => {
          const isActive = filterStatus === status;
          const c = status === 'all' ? AMBER : statusColors[status]?.color || AMBER;
          const StatusIcon = status === 'all' ? Eye : statusIcons[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '7px 16px',
                borderRadius: 10,
                border: isActive ? `1px solid ${c}40` : `1px solid rgba(255,255,255,0.06)`,
                backgroundColor: isActive ? `${c}15` : 'rgba(255,255,255,0.02)',
                color: isActive ? c : '#6b6358',
                cursor: 'pointer',
                transition: `all 0.3s ${EASE_SPRING}`,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: isActive ? `0 0 16px ${c}10, inset 0 0 0 0.5px ${c}20` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = `${c}25`;
                  e.currentTarget.style.color = c;
                  e.currentTarget.style.backgroundColor = `${c}08`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = '#6b6358';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                }
              }}
            >
              {StatusIcon && <StatusIcon size={11} />}
              {status === 'all' ? 'All Members' : status}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#5a5248', fontWeight: 500 }}>
          <span style={{ color: AMBER, fontWeight: 700, fontFamily: 'monospace' }}>{filteredMembers.length}</span>
          <span style={{ margin: '0 4px' }}>/</span>
          {totalMembers} members
        </span>
      </div>

      {/* ============================================
          Member Health Cards
          ============================================ */}
      <div className="scrollbar-autohide" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredMembers.map((member, idx) => {
          const sc = statusColors[member.status];
          const StatusIcon = statusIcons[member.status];
          const isExpanded = expandedMember === member.id;
          const color = sc.color;
          const isAtRisk = member.status === 'At Risk';

          // Compute dimension scores
          const engagementScore = (member.eventsAttended / member.totalEvents) * 100;
          const capacityScore = Math.min((member.communicationsOpened / 22) * 100, 100);
          const alignmentScore = member.npsScore * 10;

          return (
            <div
              key={member.id}
              className="card-interactive"
              style={{
                ...glassCard(isExpanded ? sc.borderColor : 'rgba(255,255,255,0.05)'),
                padding: 0,
                animation: `mh-fade-in-scale 0.5s ${EASE_SPRING} ${0.45 + idx * 0.04}s both`,
                transition: `border-color 0.3s ${EASE_SPRING}, box-shadow 0.3s, transform 0.3s ${EASE_SPRING}`,
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.borderColor = `${color}25`;
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.005)';
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px ${color}10`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* At-risk glow strip */}
              {isAtRisk && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${DANGER}60, transparent)`,
                    backgroundSize: '200% 100%',
                    animation: `mh-shimmer 2s ease-in-out infinite`,
                  }}
                />
              )}

              {/* Main row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  padding: '16px 20px',
                }}
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}
              >
                {/* Avatar ring */}
                <AvatarRing name={member.name} status={member.status} score={member.healthScore} size={42} />

                {/* Name + status */}
                <div style={{ width: 155, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: CREAM, marginBottom: 3 }}>{member.name}</div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 20,
                      color,
                      backgroundColor: sc.bg,
                      border: `1px solid ${color}20`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {member.status}
                  </span>
                </div>

                {/* Multi-dimension health bars */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <HealthDimensionBar label="Engage" value={engagementScore} max={100} color={VIOLET} delay={`${0.5 + idx * 0.04}s`} />
                  <HealthDimensionBar label="Capacity" value={capacityScore} max={100} color="#5eaed4" delay={`${0.55 + idx * 0.04}s`} />
                  <HealthDimensionBar label="Align" value={alignmentScore} max={100} color={SAGE} delay={`${0.6 + idx * 0.04}s`} />
                </div>

                {/* Sparkline */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <TrendSparkline values={member.engagementByWeek} color={scoreColor(member.healthScore)} width={70} height={26} />
                  <span style={{ fontSize: 8, color: '#5a5248', letterSpacing: '0.04em' }}>7-day trend</span>
                </div>

                {/* Health score ring */}
                <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                  <MiniHealthRing score={member.healthScore} size={40} strokeWidth={3} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: 11,
                      fontWeight: 800,
                      color: scoreColor(member.healthScore),
                      fontFamily: 'monospace',
                    }}
                  >
                    {member.healthScore}
                  </span>
                </div>

                <TrendArrow current={member.healthScore} previous={member.prevHealthScore} />

                {/* Chevron */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: isExpanded ? `${color}12` : 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all 0.3s ${EASE_SPRING}`,
                    flexShrink: 0,
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp size={14} style={{ color: color }} />
                  ) : (
                    <ChevronDown size={14} style={{ color: '#6b6358' }} />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div
                  style={{
                    padding: '0 20px 20px',
                    borderTop: `1px solid ${color}15`,
                    animation: `mh-fade-in 0.4s ${EASE_SPRING} both`,
                  }}
                >
                  {/* Detail grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16, marginBottom: 14 }}>
                    <div
                      style={{
                        ...glassCard(`${VIOLET}15`),
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={10} style={{ color: VIOLET }} /> Events Attended
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${(member.eventsAttended / member.totalEvents) * 100}%`,
                              background: `linear-gradient(90deg, ${VIOLET}80, ${VIOLET})`,
                              borderRadius: 3,
                              boxShadow: `0 0 8px ${VIOLET}30`,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: CREAM, fontFamily: 'monospace' }}>
                          {member.eventsAttended}/{member.totalEvents}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        ...glassCard('rgba(94,174,212,0.15)'),
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Users size={10} style={{ color: '#5eaed4' }} /> Pod Participation
                      </div>
                      <div style={{ fontSize: 11, color: '#b8b0a6', lineHeight: 1.5 }}>{member.podParticipation}</div>
                    </div>

                    <div
                      style={{
                        ...glassCard('rgba(94,174,212,0.15)'),
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MessageSquare size={10} style={{ color: '#5eaed4' }} /> Comms Opened
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min((member.communicationsOpened / 22) * 100, 100)}%`,
                              background: `linear-gradient(90deg, #5eaed480, #5eaed4)`,
                              borderRadius: 3,
                              boxShadow: `0 0 8px #5eaed430`,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: CREAM, fontFamily: 'monospace' }}>
                          {member.communicationsOpened}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        ...glassCard(`${SAGE}15`),
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Star size={10} style={{ color: SAGE }} /> NPS Score
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: member.npsScore >= 9 ? SAGE : member.npsScore >= 7 ? GOLD : DANGER,
                          }}
                        >
                          {member.npsScore}
                        </span>
                        <span style={{ fontSize: 11, color: '#5a5248' }}>/10</span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 20,
                            color: member.npsScore >= 9 ? SAGE : member.npsScore >= 7 ? GOLD : DANGER,
                            backgroundColor:
                              member.npsScore >= 9
                                ? `rgba(107,143,113,0.12)`
                                : member.npsScore >= 7
                                  ? `rgba(232,180,76,0.12)`
                                  : `rgba(224,96,96,0.12)`,
                            border: `1px solid ${
                              member.npsScore >= 9
                                ? 'rgba(107,143,113,0.2)'
                                : member.npsScore >= 7
                                  ? 'rgba(232,180,76,0.2)'
                                  : 'rgba(224,96,96,0.2)'
                            }`,
                          }}
                        >
                          {member.npsScore >= 9 ? 'Promoter' : member.npsScore >= 7 ? 'Passive' : 'Detractor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Heatmap + Sparkline */}
                  <div
                    style={{
                      ...glassCard(),
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <EngagementHeatmap data={member.engagementByWeek} label="12-Week Engagement Heatmap" />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <TrendSparkline
                          values={member.engagementByWeek}
                          color={scoreColor(member.healthScore)}
                          width={100}
                          height={32}
                        />
                        <span style={{ fontSize: 8, color: '#5a5248' }}>12-week trend</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div
                      style={{
                        ...glassCard(),
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 6, fontWeight: 600 }}>Member Since</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: CREAM }}>{member.joinDate}</div>
                      <div style={{ fontSize: 10, color: '#5a5248', marginTop: 2 }}>{member.membershipTier}</div>
                    </div>
                    <div
                      style={{
                        ...glassCard(`${AMBER}15`),
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 6, fontWeight: 600 }}>Renewal Date</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: AMBER }}>{member.renewalDate}</div>
                      <div style={{ fontSize: 10, color: '#5a5248', marginTop: 2 }}>${member.monthlyRate.toLocaleString()}/mo</div>
                    </div>
                    <div
                      style={{
                        ...glassCard(),
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 6, fontWeight: 600 }}>Notes</div>
                      <div style={{ fontSize: 11, color: '#b8b0a6', lineHeight: 1.5 }}>{member.notes}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================
          Health Matrix: All Members x All Dimensions
          ============================================ */}
      <div
        style={{
          ...glassCard(),
          padding: 24,
          marginTop: 24,
          animation: `mh-fade-in-scale 0.6s ${EASE_SPRING} 0.7s both`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: `${VIOLET}12`,
              border: `1px solid ${VIOLET}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={14} style={{ color: VIOLET }} />
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: CREAM }}>Health Matrix</span>
            <span style={{ fontSize: 11, color: '#5a5248', marginLeft: 10 }}>All members across all dimensions</span>
          </div>
        </div>
        <HealthMatrix members={defaultMembers} />
        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {[
            { label: '80-100', color: SAGE, text: 'Excellent' },
            { label: '50-79', color: GOLD, text: 'Watch' },
            { label: '0-49', color: DANGER, text: 'At Risk' },
          ].map((leg) => (
            <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: leg.color, opacity: 0.6 }} />
              <span style={{ fontSize: 10, color: MUTED }}>{leg.text} ({leg.label})</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================
          Engagement Distribution
          ============================================ */}
      <div
        style={{
          ...glassCard(),
          padding: 24,
          marginTop: 16,
          animation: `mh-fade-in-scale 0.6s ${EASE_SPRING} 0.8s both`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: `${AMBER}12`,
              border: `1px solid ${AMBER}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={14} style={{ color: AMBER }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: CREAM }}>Engagement Distribution</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {/* Health Score Distribution */}
          <div>
            <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, fontWeight: 700 }}>
              Health Score Bands
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '90-100 (Excellent)', count: defaultMembers.filter((m) => m.healthScore >= 90).length, color: SAGE },
                { label: '80-89 (Good)', count: defaultMembers.filter((m) => m.healthScore >= 80 && m.healthScore < 90).length, color: '#5eaed4' },
                { label: '50-79 (Watch)', count: defaultMembers.filter((m) => m.healthScore >= 50 && m.healthScore < 80).length, color: GOLD },
                { label: '<50 (At Risk)', count: defaultMembers.filter((m) => m.healthScore < 50).length, color: DANGER },
              ].map((band) => (
                <div key={band.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#6b6358', width: 110, flexShrink: 0 }}>{band.label}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(band.count / totalMembers) * 100}%`,
                        background: `linear-gradient(90deg, ${band.color}80, ${band.color})`,
                        borderRadius: 3,
                        boxShadow: `0 0 6px ${band.color}20`,
                        transition: `width 0.7s ${EASE_SPRING}`,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: CREAM, fontFamily: 'monospace', width: 20, textAlign: 'right' }}>
                    {band.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Membership Tier */}
          <div>
            <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, fontWeight: 700 }}>
              Membership Tiers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Individual', count: defaultMembers.filter((m) => m.membershipTier === 'Individual').length, rate: '$1,200/mo', color: AMBER },
                { label: 'Couple', count: defaultMembers.filter((m) => m.membershipTier === 'Couple').length, rate: '$1,700/mo', color: VIOLET },
              ].map((tier) => (
                <div
                  key={tier.label}
                  style={{
                    ...glassCard(`${tier.color}15`),
                    borderRadius: 10,
                    padding: 12,
                    transition: `all 0.3s ${EASE_SPRING}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${tier.color}30`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${tier.color}15`;
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: CREAM }}>{tier.label}</span>
                    <span style={{ fontSize: 10, color: AMBER, fontWeight: 600 }}>{tier.rate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tier.color, boxShadow: `0 0 6px ${tier.color}40` }} />
                    <span style={{ fontSize: 11, color: MUTED }}>{tier.count} members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NPS Distribution */}
          <div>
            <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, fontWeight: 700 }}>
              NPS Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Promoters (9-10)', count: defaultMembers.filter((m) => m.npsScore >= 9).length, color: SAGE },
                { label: 'Passives (7-8)', count: defaultMembers.filter((m) => m.npsScore >= 7 && m.npsScore < 9).length, color: GOLD },
                { label: 'Detractors (0-6)', count: defaultMembers.filter((m) => m.npsScore < 7).length, color: DANGER },
              ].map((seg) => (
                <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#6b6358', width: 110, flexShrink: 0 }}>{seg.label}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(seg.count / totalMembers) * 100}%`,
                        background: `linear-gradient(90deg, ${seg.color}80, ${seg.color})`,
                        borderRadius: 3,
                        boxShadow: `0 0 6px ${seg.color}20`,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: CREAM, fontFamily: 'monospace', width: 20, textAlign: 'right' }}>
                    {seg.count}
                  </span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>Net Promoter Score</span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: SAGE,
                    fontFamily: 'monospace',
                    filter: `drop-shadow(0 0 8px ${SAGE}40)`,
                  }}
                >
                  {Math.round(
                    ((defaultMembers.filter((m) => m.npsScore >= 9).length -
                      defaultMembers.filter((m) => m.npsScore < 7).length) /
                      totalMembers) *
                      100,
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
