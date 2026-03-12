'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Activity,
  ChevronDown,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Flame,
  Plus,
  Trash2,
  Save,
  Trophy,
  Target,
  TrendingUp,
  Crown,
  Medal,
  Award,
  Users,
  Zap,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  Shield,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

// ── Types ──────────────────────────────────────────────────

type CommitmentStatus = 'pending' | 'completed' | 'missed' | 'partial';

interface Commitment {
  id: string;
  text: string;
  status: CommitmentStatus;
}

interface DayEntry {
  date: string; // YYYY-MM-DD
  commitments: Commitment[];
}

interface MemberData {
  [memberId: string]: {
    entries: DayEntry[];
  };
}

// ── Helpers ────────────────────────────────────────────────

const LS_KEY = 'frequency-accountability';

const todayStr = () => new Date().toISOString().split('T')[0];

const dayLabel = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const weekdayShort = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

const getWeekDates = (offset: number = 0): string[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + offset * 7);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const getHitRate = (entry: DayEntry | undefined): number => {
  if (!entry || entry.commitments.length === 0) return 0;
  const completed = entry.commitments.filter((c) => c.status === 'completed').length;
  const partial = entry.commitments.filter((c) => c.status === 'partial').length;
  return Math.round(((completed + partial * 0.5) / entry.commitments.length) * 100);
};

const statusBg = (status: CommitmentStatus) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500/15 border-emerald-500/30';
    case 'partial': return 'bg-amber-500/15 border-amber-500/30';
    case 'missed': return 'bg-rose-500/15 border-rose-500/30';
    default: return 'bg-surface-3 border-border';
  }
};

/** Days between a date string and today. Negative = overdue. */
const daysUntil = (dateStr: string): number => {
  const today = new Date(todayStr() + 'T12:00:00');
  const target = new Date(dateStr + 'T12:00:00');
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// ── Scoped keyframe styles injected once ────────────────────

const styleId = 'accountability-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes acc-flame-dance {
      0%, 100% { transform: scaleY(1) translateY(0) rotate(0deg); }
      20% { transform: scaleY(1.1) translateY(-1.5px) rotate(-2deg); }
      40% { transform: scaleY(0.92) translateY(1px) rotate(1deg); }
      60% { transform: scaleY(1.06) translateY(-1px) rotate(-1deg); }
      80% { transform: scaleY(0.97) translateY(0.5px) rotate(0.5deg); }
    }
    @keyframes acc-pulse-glow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    @keyframes acc-ring-fill {
      from { stroke-dashoffset: var(--acc-circ); }
    }
    @keyframes acc-heat-cell-in {
      from { opacity: 0; transform: scale(0.3); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes acc-stat-count-up {
      from { opacity: 0; transform: translateY(10px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes acc-stagger-in {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes acc-slide-up {
      from { opacity: 0; transform: translateY(24px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes acc-glow-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(212,165,116,0); }
      50% { box-shadow: 0 0 20px 2px rgba(212,165,116,0.15); }
    }
    @keyframes acc-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes acc-rank-bounce {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    @keyframes acc-progress-fill {
      from { width: 0%; }
    }
    @keyframes acc-ember-float {
      0% { opacity: 0; transform: translateY(0) scale(0.5); }
      30% { opacity: 1; }
      100% { opacity: 0; transform: translateY(-20px) scale(0); }
    }
    @keyframes acc-number-pop {
      0% { transform: scale(0.8); opacity: 0; }
      60% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes acc-card-hover-glow {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes acc-bar-grow {
      from { transform: scaleY(0); }
      to { transform: scaleY(1); }
    }
    @keyframes acc-sparkle-rotate {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.2); }
      100% { transform: rotate(360deg) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

// ── Design tokens ──────────────────────────────────────────

const GLASS = {
  bg: 'rgba(19,23,32,0.7)',
  border: 'rgba(212,165,116,0.08)',
  borderHover: 'rgba(212,165,116,0.18)',
  blur: 'blur(20px)',
} as const;

const EASE = 'cubic-bezier(0.16,1,0.3,1)';

const COLORS = {
  gold: '#d4a574',
  purple: '#8b5cf6',
  green: '#6b8f71',
  cream: '#f0ebe4',
  muted: '#a09888',
  dimmed: '#6b6358',
  bg: '#0b0d14',
  surface: '#131720',
  surfaceAlt: '#0f1219',
  border: '#1e2638',
  borderHover: '#2a3550',
  amber: '#e8b44c',
  red: '#e06060',
  redDark: '#c04040',
  greenDark: '#4a6f50',
} as const;

// ── SVG Score Ring ─────────────────────────────────────────

function ScoreRing({ score, size = 140, strokeWidth = 10, label }: { score: number; size?: number; strokeWidth?: number; label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  const color = score >= 80 ? COLORS.green : score >= 50 ? COLORS.amber : score > 0 ? COLORS.red : '#262e3e';
  const glowColor = score >= 80 ? 'rgba(107,143,113,0.35)' : score >= 50 ? 'rgba(232,180,76,0.35)' : 'rgba(224,96,96,0.25)';
  const secondaryColor = score >= 80 ? COLORS.purple : score >= 50 ? COLORS.gold : '#8b5cf6';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={`acc-ring-grad-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          opacity={0.6}
        />
        {/* Subtle tick marks */}
        {[0, 25, 50, 75].map((tick) => {
          const tickOffset = circumference - (tick / 100) * circumference;
          return (
            <circle
              key={tick}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="rgba(160,152,136,0.15)"
              strokeWidth={strokeWidth + 2}
              strokeDasharray={`2 ${circumference - 2}`}
              strokeDashoffset={tickOffset}
            />
          );
        })}
        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#acc-ring-grad-${score})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            '--acc-circ': `${circumference}`,
            animation: `acc-ring-fill 1.2s ${EASE} forwards`,
            filter: score > 0 ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
            transition: `stroke-dashoffset 1s ${EASE}, stroke 0.5s ease`,
          } as React.CSSProperties}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: size * 0.28,
          fontWeight: 800,
          color: COLORS.cream,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          animation: `acc-number-pop 0.6s ${EASE} 0.4s both`,
        }}>
          {score}%
        </span>
        {label && (
          <span style={{
            fontSize: 10,
            color: COLORS.dimmed,
            marginTop: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Small Progress Ring (for individual cards) ──────────────

function MiniProgressRing({ score, size = 44, strokeWidth = 4 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;
  const color = score >= 80 ? COLORS.green : score >= 50 ? COLORS.amber : score > 0 ? COLORS.red : '#262e3e';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={COLORS.border} strokeWidth={strokeWidth} opacity={0.5} />
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{
            transition: `stroke-dashoffset 0.8s ${EASE}`,
            filter: score > 0 ? `drop-shadow(0 0 4px ${color}40)` : 'none',
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
      </div>
    </div>
  );
}

// ── Animated Flame SVG ─────────────────────────────────────

function AnimatedFlame({ size = 26, active = true }: { size?: number; active?: boolean }) {
  const uniqueId = useMemo(() => `acc-flame-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{
        animation: active ? `acc-flame-dance 1.5s ease-in-out infinite` : 'none',
        filter: active ? 'drop-shadow(0 0 4px rgba(232,180,76,0.4))' : 'none',
      }}
    >
      <defs>
        {active && (
          <filter id={`${uniqueId}-glow`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
        <linearGradient id={`${uniqueId}-grad`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={active ? '#e06060' : '#3a3a3a'} />
          <stop offset="40%" stopColor={active ? '#e8b44c' : '#4a4a4a'} />
          <stop offset="80%" stopColor={active ? '#f0c060' : '#555'} />
          <stop offset="100%" stopColor={active ? '#ffe08a' : '#555'} />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 8 6 8 10C8 11.5 8.5 12.8 9.4 13.8C8.5 13.3 8 12.2 8 11C5.5 13 4 16 4 18C4 21.3 7.6 24 12 24C16.4 24 20 21.3 20 18C20 12 12 2 12 2Z"
        fill={`url(#${uniqueId}-grad)`}
        filter={active ? `url(#${uniqueId}-glow)` : undefined}
      />
      {active && (
        <path
          d="M12 24C14.2 24 16 22 16 19.5C16 17 12 12 12 12C12 12 8 17 8 19.5C8 22 9.8 24 12 24Z"
          fill="#ffe08a" opacity="0.75"
        />
      )}
    </svg>
  );
}

// ── Ember particles (floating sparks) ──────────────────────

function EmberParticles({ count = 3 }: { count?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: `${25 + i * 25}%`,
            width: 3,
            height: 3,
            borderRadius: '50%',
            backgroundColor: COLORS.amber,
            animation: `acc-ember-float ${1.5 + i * 0.4}s ease-out ${i * 0.3}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ── SVG Heat Calendar ──────────────────────────────────────

function HeatCalendar({ memberData, weeksBack = 8 }: { memberData: { entries: DayEntry[] } | undefined; weeksBack?: number }) {
  const cellSize = 15;
  const cellGap = 3;
  const labelWidth = 28;

  const allWeeks: string[][] = [];
  for (let w = -(weeksBack - 1); w <= 0; w++) {
    allWeeks.push(getWeekDates(w));
  }
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const getColor = (dateStr: string) => {
    const entry = memberData?.entries.find((e) => e.date === dateStr);
    const rate = getHitRate(entry);
    if (!entry || entry.commitments.length === 0) return '#1c2230';
    if (rate === 100) return COLORS.green;
    if (rate >= 75) return 'rgba(107,143,113,0.6)';
    if (rate >= 50) return COLORS.amber;
    if (rate >= 25) return 'rgba(232,180,76,0.5)';
    return COLORS.red;
  };

  const svgWidth = labelWidth + allWeeks.length * (cellSize + cellGap);
  const svgHeight = 7 * (cellSize + cellGap) + 20;

  return (
    <svg width={svgWidth} height={svgHeight} style={{ overflow: 'visible' }}>
      {/* Day labels */}
      {dayLabels.map((lbl, i) => (
        <text
          key={`day-${i}`}
          x={labelWidth - 6}
          y={20 + i * (cellSize + cellGap) + cellSize / 2 + 3}
          fill={COLORS.dimmed}
          fontSize={9}
          textAnchor="end"
          fontFamily="inherit"
        >
          {i % 2 === 0 ? lbl : ''}
        </text>
      ))}
      {/* Week columns */}
      {allWeeks.map((week, wIdx) => {
        const firstDate = new Date(week[0] + 'T12:00:00');
        const showMonth = wIdx === 0 || firstDate.getDate() <= 7;
        return (
          <g key={`week-${wIdx}`}>
            {showMonth && (
              <text
                x={labelWidth + wIdx * (cellSize + cellGap)}
                y={10}
                fill={COLORS.dimmed}
                fontSize={9}
                fontFamily="inherit"
              >
                {firstDate.toLocaleDateString('en-US', { month: 'short' })}
              </text>
            )}
            {week.map((dateStr, dIdx) => {
              const color = getColor(dateStr);
              const today = todayStr();
              const isToday = dateStr === today;
              const entry = memberData?.entries.find(e => e.date === dateStr);
              const rate = getHitRate(entry);
              return (
                <g key={dateStr}>
                  <rect
                    x={labelWidth + wIdx * (cellSize + cellGap)}
                    y={20 + dIdx * (cellSize + cellGap)}
                    width={cellSize}
                    height={cellSize}
                    rx={3}
                    fill={color}
                    stroke={isToday ? COLORS.gold : 'none'}
                    strokeWidth={isToday ? 1.5 : 0}
                    style={{
                      animation: `acc-heat-cell-in 0.4s ${EASE} ${wIdx * 25 + dIdx * 8}ms both`,
                      cursor: 'default',
                    }}
                  />
                  {/* Glow for 100% days */}
                  {rate === 100 && (
                    <rect
                      x={labelWidth + wIdx * (cellSize + cellGap) - 1}
                      y={20 + dIdx * (cellSize + cellGap) - 1}
                      width={cellSize + 2}
                      height={cellSize + 2}
                      rx={4}
                      fill="none"
                      stroke={COLORS.green}
                      strokeWidth={0.5}
                      opacity={0.4}
                      style={{
                        animation: `acc-heat-cell-in 0.4s ${EASE} ${wIdx * 25 + dIdx * 8 + 100}ms both`,
                      }}
                    />
                  )}
                  <title>{dayLabel(dateStr)}: {rate}%</title>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ── Trend Arrow Indicator ──────────────────────────────────

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const isUp = diff > 0;
  const isFlat = diff === 0;

  if (isFlat) return (
    <span style={{
      fontSize: 10, color: COLORS.dimmed, display: 'inline-flex', alignItems: 'center', gap: 2,
    }}>
      --
    </span>
  );

  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      color: isUp ? COLORS.green : COLORS.red,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      backgroundColor: isUp ? 'rgba(107,143,113,0.12)' : 'rgba(224,96,96,0.12)',
      padding: '2px 6px',
      borderRadius: 8,
    }}>
      {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {Math.abs(diff)}%
    </span>
  );
}

// ── Summary Stats Bar ──────────────────────────────────────

function SummaryStatsBar({
  streak,
  completionRate,
  teamAvg,
  totalCompleted,
  previousWeekRate,
  delay,
}: {
  streak: number;
  completionRate: number;
  teamAvg: number;
  totalCompleted: number;
  previousWeekRate: number;
  delay: number;
}) {
  const stats = [
    {
      icon: <AnimatedFlame size={20} active={streak > 0} />,
      value: `${streak}`,
      label: 'Day Streak',
      color: streak > 0 ? COLORS.amber : COLORS.dimmed,
      sub: streak >= 7 ? 'On fire!' : streak > 0 ? 'Keep going' : 'Start today',
      trend: null,
      glow: streak >= 5,
    },
    {
      icon: <Target size={18} style={{ color: COLORS.gold }} />,
      value: `${completionRate}%`,
      label: 'Completion Rate',
      color: completionRate >= 80 ? COLORS.green : completionRate >= 50 ? COLORS.amber : COLORS.red,
      sub: 'This week',
      trend: { current: completionRate, previous: previousWeekRate },
      glow: completionRate >= 90,
    },
    {
      icon: <Users size={18} style={{ color: COLORS.purple }} />,
      value: `${teamAvg}%`,
      label: 'Team Average',
      color: teamAvg >= 80 ? COLORS.green : teamAvg >= 50 ? COLORS.amber : COLORS.red,
      sub: 'All members',
      trend: null,
      glow: false,
    },
    {
      icon: <Zap size={18} style={{ color: COLORS.green }} />,
      value: `${totalCompleted}`,
      label: 'Completed',
      color: COLORS.green,
      sub: 'All time',
      trend: null,
      glow: false,
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 14,
    }}>
      {stats.map((stat, i) => (
        <div
          className="card-stat"
          key={stat.label}
          style={{
            animation: `acc-slide-up 0.6s ${EASE} ${delay + i * 70}ms both`,
            background: GLASS.bg,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
            border: `1px solid ${stat.glow ? `${stat.color}30` : GLASS.border}`,
            borderRadius: 16,
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            transition: `border-color 0.4s ${EASE}, box-shadow 0.4s ${EASE}, transform 0.3s ${EASE}`,
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = stat.color + '40';
            e.currentTarget.style.boxShadow = `0 4px 24px ${stat.color}15, inset 0 1px 0 ${stat.color}10`;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = stat.glow ? `${stat.color}30` : GLASS.border;
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Subtle radial glow for high-value stats */}
          {stat.glow && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(ellipse at 30% 50%, ${stat.color}10 0%, transparent 70%)`,
              animation: `acc-pulse-glow 4s ease-in-out infinite`,
            }} />
          )}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: `${stat.color}10`,
            border: `1px solid ${stat.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
          }}>
            {stat.icon}
          </div>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 24, fontWeight: 800, color: stat.color,
                lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                display: 'block',
                animation: `acc-number-pop 0.5s ${EASE} ${delay + i * 70 + 200}ms both`,
              }}>
                {stat.value}
              </span>
              {stat.trend && (
                <TrendArrow current={stat.trend.current} previous={stat.trend.previous} />
              )}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: COLORS.muted, display: 'block', marginTop: 3,
            }}>
              {stat.label}
            </span>
            <span style={{ fontSize: 10, color: COLORS.dimmed }}>{stat.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Weekly Grid Cell ───────────────────────────────────────

function WeekGridCell({
  date,
  entry,
  isToday,
  delay,
}: {
  date: string;
  entry: DayEntry | undefined;
  isToday: boolean;
  delay: number;
}) {
  const rate = getHitRate(entry);
  const hasData = entry && entry.commitments.length > 0;
  const completed = entry?.commitments.filter((c) => c.status === 'completed').length ?? 0;
  const total = entry?.commitments.length ?? 0;
  const [hovered, setHovered] = useState(false);

  let bgColor: string = COLORS.surface;
  let borderColor: string = COLORS.border;
  let dotColor: string = '#262e3e';

  if (hasData) {
    if (rate === 100) {
      bgColor = 'rgba(107, 143, 113, 0.15)';
      borderColor = 'rgba(107, 143, 113, 0.4)';
      dotColor = COLORS.green;
    } else if (rate >= 50) {
      bgColor = 'rgba(232, 180, 76, 0.12)';
      borderColor = 'rgba(232, 180, 76, 0.35)';
      dotColor = COLORS.amber;
    } else if (rate > 0) {
      bgColor = 'rgba(224, 96, 96, 0.12)';
      borderColor = 'rgba(224, 96, 96, 0.35)';
      dotColor = COLORS.red;
    }
  }

  return (
    <div
      style={{
        animation: `acc-stagger-in 0.5s ${EASE} ${delay}ms both`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flex: 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: isToday ? COLORS.gold : COLORS.dimmed,
        transition: `color 0.3s ${EASE}`,
      }}>
        {weekdayShort(date)}
      </span>
      <div style={{
        width: 54,
        height: 54,
        borderRadius: 14,
        backgroundColor: bgColor,
        border: `2px solid ${isToday ? COLORS.gold : borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: `all 0.4s ${EASE}`,
        boxShadow: isToday
          ? '0 0 20px rgba(212,165,116,0.2), inset 0 1px 0 rgba(212,165,116,0.1)'
          : hovered && hasData
            ? `0 0 16px ${dotColor}25`
            : 'none',
        position: 'relative',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        cursor: 'default',
      }}>
        {/* Colored status dot */}
        <div style={{
          width: hasData ? 16 : 8,
          height: hasData ? 16 : 8,
          borderRadius: '50%',
          backgroundColor: dotColor,
          transition: `all 0.3s ${EASE}`,
          boxShadow: hasData && rate === 100 ? `0 0 10px ${dotColor}60` : 'none',
        }} />
        {/* Streak fire for 100% days */}
        {hasData && rate === 100 && (
          <div style={{ position: 'absolute', top: -7, right: -5 }}>
            <AnimatedFlame size={14} active />
          </div>
        )}
        {/* Hover tooltip */}
        {hovered && hasData && (
          <div style={{
            position: 'absolute',
            bottom: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(11,13,20,0.95)',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: '8px 12px',
            whiteSpace: 'nowrap',
            zIndex: 20,
            animation: `acc-stat-count-up 0.2s ${EASE} both`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.cream, marginBottom: 4 }}>
              {dayLabel(date)}
            </div>
            {entry?.commitments.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  backgroundColor: c.status === 'completed' ? COLORS.green : c.status === 'partial' ? COLORS.amber : c.status === 'missed' ? COLORS.red : COLORS.dimmed,
                }} />
                <span style={{ fontSize: 10, color: COLORS.muted, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {hasData ? (
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: rate === 100 ? COLORS.green : rate >= 50 ? COLORS.amber : COLORS.red,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {completed}/{total}
        </span>
      ) : (
        <span style={{ fontSize: 10, color: '#262e3e' }}>--</span>
      )}
    </div>
  );
}

// ── Animated Streak Counter ────────────────────────────────

function StreakCounter({ streak }: { streak: number }) {
  const isActive = streak > 0;
  const isHot = streak >= 5;
  const isBlazing = streak >= 10;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '18px 22px',
      borderRadius: 16,
      background: isActive ? GLASS.bg : COLORS.surface,
      backdropFilter: isActive ? GLASS.blur : 'none',
      WebkitBackdropFilter: isActive ? GLASS.blur : 'none',
      border: `1px solid ${isBlazing ? 'rgba(232, 180, 76, 0.5)' : isHot ? 'rgba(232, 180, 76, 0.35)' : isActive ? 'rgba(232, 180, 76, 0.2)' : COLORS.border}`,
      position: 'relative',
      overflow: 'hidden',
      transition: `all 0.4s ${EASE}`,
    }}>
      {/* Animated glow background for active streaks */}
      {isActive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isBlazing
            ? 'radial-gradient(ellipse at 15% 50%, rgba(232,180,76,0.2) 0%, transparent 60%)'
            : isHot
              ? 'radial-gradient(ellipse at 15% 50%, rgba(232,180,76,0.15) 0%, transparent 60%)'
              : 'radial-gradient(ellipse at 15% 50%, rgba(232,180,76,0.08) 0%, transparent 60%)',
          animation: `acc-pulse-glow 3s ease-in-out infinite`,
        }} />
      )}
      {/* Ember particles for hot streaks */}
      {isHot && <EmberParticles count={isBlazing ? 5 : 3} />}

      <div style={{
        position: 'relative',
        width: 48,
        height: 48,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isActive ? 'rgba(232, 180, 76, 0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isActive ? 'rgba(232,180,76,0.2)' : 'transparent'}`,
      }}>
        <AnimatedFlame size={28} active={isActive} />
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontSize: 32,
            fontWeight: 800,
            color: isActive ? COLORS.amber : COLORS.dimmed,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            animation: `acc-number-pop 0.6s ${EASE} both`,
          }}>
            {streak}
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: isActive ? COLORS.gold : COLORS.dimmed,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            day streak
          </span>
          {isBlazing && (
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#ff6b6b',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(232,180,76,0.15))',
              padding: '3px 10px',
              borderRadius: 8,
              border: '1px solid rgba(255,107,107,0.2)',
              animation: `acc-pulse-glow 2s ease-in-out infinite`,
            }}>
              BLAZING
            </span>
          )}
          {isHot && !isBlazing && (
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.red,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              backgroundColor: 'rgba(224,96,96,0.12)',
              padding: '3px 10px',
              borderRadius: 8,
            }}>
              HOT
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: COLORS.dimmed, marginTop: 3, display: 'block' }}>
          {isBlazing ? 'Absolutely unstoppable commitment!' : isHot ? 'Blazing through commitments!' : isActive ? 'Consecutive 100% completion days' : 'Complete all commitments to start'}
        </span>
      </div>

      {/* Milestone markers */}
      {streak > 0 && (
        <div style={{
          position: 'relative',
          display: 'flex',
          gap: 4,
          alignItems: 'center',
        }}>
          {[3, 5, 7, 10, 14].map((milestone) => (
            <div
              key={milestone}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: streak >= milestone ? COLORS.amber : COLORS.border,
                transition: `all 0.3s ${EASE}`,
                boxShadow: streak >= milestone ? `0 0 6px ${COLORS.amber}50` : 'none',
              }}
              title={`${milestone}-day milestone`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Due Date / Urgency Indicator ───────────────────────────

function UrgencyBadge({ date }: { date: string }) {
  const days = daysUntil(date);
  const today = todayStr();
  const isToday = date === today;

  if (isToday) return (
    <span style={{
      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: COLORS.gold, backgroundColor: 'rgba(212,165,116,0.12)',
      border: '1px solid rgba(212,165,116,0.2)',
      padding: '2px 8px', borderRadius: 8,
      animation: `acc-glow-pulse 3s ease-in-out infinite`,
    }}>
      Today
    </span>
  );

  if (days < 0) return (
    <span style={{
      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: COLORS.red, backgroundColor: 'rgba(224,96,96,0.12)',
      border: '1px solid rgba(224,96,96,0.2)',
      padding: '2px 8px', borderRadius: 8,
    }}>
      <Clock size={8} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
      Overdue
    </span>
  );

  if (days <= 1) return (
    <span style={{
      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: COLORS.amber, backgroundColor: 'rgba(232,180,76,0.12)',
      border: '1px solid rgba(232,180,76,0.2)',
      padding: '2px 8px', borderRadius: 8,
    }}>
      Due Soon
    </span>
  );

  return (
    <span style={{
      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: COLORS.green, backgroundColor: 'rgba(107,143,113,0.12)',
      border: '1px solid rgba(107,143,113,0.2)',
      padding: '2px 8px', borderRadius: 8,
    }}>
      On Track
    </span>
  );
}

// ── Individual Accountability Card ─────────────────────────

function AccountabilityCard({
  member,
  memberData,
  streak,
  weeklyAvg,
  totalCompleted,
  totalCommitments,
  delay,
}: {
  member: (typeof teamMembers)[number];
  memberData: { entries: DayEntry[] } | undefined;
  streak: number;
  weeklyAvg: number;
  totalCompleted: number;
  totalCommitments: number;
  delay: number;
}) {
  const completionRate = totalCommitments > 0 ? Math.round((totalCompleted / totalCommitments) * 100) : 0;
  const isHot = streak >= 3;
  const [hovered, setHovered] = useState(false);

  // Mini sparkline data (last 7 entries)
  const sparklineData = useMemo(() => {
    if (!memberData) return [];
    const sorted = [...memberData.entries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
    return sorted.map(e => getHitRate(e));
  }, [memberData]);

  return (
    <div
      className="card-interactive"
      style={{
        animation: `acc-slide-up 0.6s ${EASE} ${delay}ms both`,
        background: GLASS.bg,
        backdropFilter: GLASS.blur,
        WebkitBackdropFilter: GLASS.blur,
        border: `1px solid ${isHot ? 'rgba(232,180,76,0.25)' : hovered ? GLASS.borderHover : GLASS.border}`,
        borderRadius: 18,
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: `all 0.4s ${EASE}`,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`
          : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hot streak glow */}
      {isHot && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 0% 50%, rgba(232,180,76,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Progress ring */}
      <MiniProgressRing score={weeklyAvg} />

      {/* Avatar */}
      <div
        className={member.color}
        style={{
          width: 38, height: 38, borderRadius: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
          position: 'relative',
          transition: `transform 0.3s ${EASE}`,
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {member.avatar}
        {isHot && (
          <div style={{
            position: 'absolute', top: -6, right: -6,
            width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AnimatedFlame size={16} active />
          </div>
        )}
      </div>

      {/* Name + role */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.cream, display: 'block' }}>
          {member.name.split(' ')[0]}
        </span>
        <span style={{ fontSize: 10, color: COLORS.dimmed }}>{member.shortRole}</span>
      </div>

      {/* Sparkline on hover */}
      {hovered && sparklineData.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 2, height: 24,
          animation: `acc-stat-count-up 0.2s ${EASE} both`,
        }}>
          {sparklineData.map((val, idx) => (
            <div
              key={idx}
              style={{
                width: 4,
                height: `${Math.max(val * 0.24, 2)}px`,
                borderRadius: 2,
                backgroundColor: val >= 80 ? COLORS.green : val >= 50 ? COLORS.amber : val > 0 ? COLORS.red : COLORS.border,
                transition: `height 0.3s ${EASE}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 42 }}>
        <Flame size={13} style={{ color: streak > 0 ? COLORS.amber : '#262e3e' }} />
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: streak > 0 ? COLORS.amber : COLORS.dimmed,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {streak}
        </span>
      </div>

      {/* Completion with gradient bar */}
      <div style={{ textAlign: 'right', minWidth: 60 }}>
        <span style={{
          fontSize: 10, color: COLORS.dimmed, display: 'block',
          textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
        }}>
          Done
        </span>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: completionRate >= 80 ? COLORS.green : completionRate >= 50 ? COLORS.amber : COLORS.muted,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {totalCompleted}/{totalCommitments}
        </span>
        <div style={{
          height: 3, backgroundColor: COLORS.border, borderRadius: 2,
          overflow: 'hidden', marginTop: 4,
        }}>
          <div style={{
            height: '100%',
            width: totalCommitments > 0 ? `${(totalCompleted / totalCommitments) * 100}%` : '0%',
            background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
            borderRadius: 2,
            transition: `width 0.8s ${EASE}`,
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Commitment Card ────────────────────────────────────────

function CommitmentCard({
  commitment,
  date,
  onUpdateStatus,
  onRemove,
  delay,
}: {
  commitment: Commitment;
  date: string;
  onUpdateStatus: (date: string, id: string, status: CommitmentStatus) => void;
  onRemove: (date: string, id: string) => void;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);

  const progressValue =
    commitment.status === 'completed' ? 100
      : commitment.status === 'partial' ? 50
        : commitment.status === 'missed' ? 0
          : 0;

  const progressColor =
    commitment.status === 'completed' ? COLORS.green
      : commitment.status === 'partial' ? COLORS.amber
        : commitment.status === 'missed' ? COLORS.red
          : '#262e3e';

  const borderColor =
    commitment.status === 'completed' ? 'rgba(107,143,113,0.3)'
      : commitment.status === 'partial' ? 'rgba(232,180,76,0.3)'
        : commitment.status === 'missed' ? 'rgba(224,96,96,0.3)'
          : GLASS.border;

  const bgColor =
    commitment.status === 'completed' ? 'rgba(107,143,113,0.06)'
      : commitment.status === 'partial' ? 'rgba(232,180,76,0.06)'
        : commitment.status === 'missed' ? 'rgba(224,96,96,0.06)'
          : GLASS.bg;

  return (
    <div
      style={{
        animation: `acc-slide-up 0.5s ${EASE} ${delay}ms both`,
        padding: '16px 18px',
        borderRadius: 14,
        border: `1px solid ${hovered ? (commitment.status === 'pending' ? GLASS.borderHover : borderColor) : borderColor}`,
        background: bgColor,
        backdropFilter: GLASS.blur,
        WebkitBackdropFilter: GLASS.blur,
        transition: `all 0.3s ${EASE}`,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <p style={{
              fontSize: 13,
              fontWeight: 500,
              color: commitment.status === 'completed' ? COLORS.muted : COLORS.cream,
              textDecoration: commitment.status === 'completed' ? 'line-through' : 'none',
              margin: 0,
              lineHeight: 1.4,
              transition: `color 0.3s ${EASE}`,
            }}>
              {commitment.text}
            </p>
            {commitment.status === 'completed' && (
              <CheckCircle2 size={14} style={{ color: COLORS.green, flexShrink: 0, opacity: 0.7 }} />
            )}
          </div>
          {/* Progress bar with gradient fill */}
          <div style={{
            marginTop: 8,
            height: 4,
            backgroundColor: COLORS.border,
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressValue}%`,
              background: commitment.status === 'completed'
                ? `linear-gradient(90deg, ${COLORS.green}, ${COLORS.green}cc)`
                : commitment.status === 'partial'
                  ? `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.gold})`
                  : progressColor,
              borderRadius: 3,
              transition: `width 0.6s ${EASE}, background-color 0.3s ease`,
              boxShadow: progressValue > 0 ? `0 0 8px ${progressColor}30` : 'none',
            }} />
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0,
          opacity: hovered ? 1 : 0.7,
          transition: `opacity 0.3s ${EASE}`,
        }}>
          {(['completed', 'partial', 'missed'] as CommitmentStatus[]).map((status) => {
            const Icon = status === 'completed' ? CheckCircle2 : status === 'partial' ? MinusCircle : XCircle;
            const color = status === 'completed' ? COLORS.green : status === 'partial' ? COLORS.amber : COLORS.red;
            const isActive = commitment.status === status;
            return (
              <button
                key={status}
                onClick={() => onUpdateStatus(date, commitment.id, status)}
                style={{
                  padding: 5, borderRadius: 8, border: 'none',
                  backgroundColor: isActive ? `${color}18` : 'transparent',
                  color: isActive ? color : COLORS.dimmed,
                  cursor: 'pointer',
                  transition: `all 0.2s ${EASE}`,
                  display: 'flex',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
                title={status.charAt(0).toUpperCase() + status.slice(1)}
              >
                <Icon size={18} />
              </button>
            );
          })}
          <button
            onClick={() => onRemove(date, commitment.id)}
            style={{
              padding: 5, borderRadius: 8, border: 'none', backgroundColor: 'transparent',
              color: COLORS.dimmed, cursor: 'pointer',
              transition: `all 0.2s ${EASE}`, display: 'flex', marginLeft: 2,
              opacity: hovered ? 0.8 : 0.4,
            }}
            title="Remove"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard Row ────────────────────────────────────────

function LeaderboardRow({
  rank,
  member,
  score,
  streak,
  completed,
  total,
  delay,
}: {
  rank: number;
  member: (typeof teamMembers)[number];
  score: number;
  streak: number;
  completed: number;
  total: number;
  delay: number;
}) {
  const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : rank === 3 ? Award : Target;
  const rankColor = rank === 1 ? COLORS.amber : rank === 2 ? '#c0c0c0' : rank === 3 ? COLORS.gold : COLORS.dimmed;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        animation: `acc-slide-up 0.5s ${EASE} ${delay}ms both`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        borderRadius: 14,
        background: rank === 1 ? 'rgba(232,180,76,0.06)' : hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        border: `1px solid ${rank === 1 ? 'rgba(232,180,76,0.2)' : hovered ? GLASS.border : 'transparent'}`,
        transition: `all 0.3s ${EASE}`,
        cursor: 'default',
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rank badge */}
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: `${rankColor}12`,
        border: `1px solid ${rankColor}20`,
        position: 'relative',
      }}>
        <RankIcon size={16} style={{ color: rankColor }} />
        {rank === 1 && (
          <div style={{
            position: 'absolute', inset: -1,
            borderRadius: 11,
            border: `1px solid ${COLORS.amber}30`,
            animation: `acc-pulse-glow 3s ease-in-out infinite`,
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
      }}
        className={member.color}
      >
        {member.avatar}
      </div>

      {/* Name & role */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.cream, display: 'block' }}>
          {member.name.split(' ')[0]}
        </span>
        <span style={{ fontSize: 10, color: COLORS.dimmed }}>{member.shortRole}</span>
      </div>

      {/* Score with gradient text for #1 */}
      <div style={{ textAlign: 'right', minWidth: 50 }}>
        <span style={{
          fontSize: 18, fontWeight: 800,
          color: score >= 80 ? COLORS.green : score >= 50 ? COLORS.amber : COLORS.red,
          fontVariantNumeric: 'tabular-nums',
          ...(rank === 1 ? {
            background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.gold})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } : {}),
        }}>
          {score}%
        </span>
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 40 }}>
        <Flame size={12} style={{ color: streak > 0 ? COLORS.amber : '#262e3e' }} />
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: streak > 0 ? COLORS.amber : COLORS.dimmed,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {streak}
        </span>
      </div>

      {/* Completion bar with gradient */}
      <div style={{ width: 70 }}>
        <div style={{
          height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: total > 0 ? `${(completed / total) * 100}%` : '0%',
            background: score >= 80
              ? `linear-gradient(90deg, ${COLORS.green}, ${COLORS.purple})`
              : score >= 50
                ? `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.gold})`
                : `linear-gradient(90deg, ${COLORS.red}, ${COLORS.redDark})`,
            borderRadius: 3,
            transition: `width 0.8s ${EASE}`,
          }} />
        </div>
        <span style={{
          fontSize: 9, color: COLORS.dimmed, marginTop: 3, display: 'block', textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {completed}/{total}
        </span>
      </div>
    </div>
  );
}

// ── Mock data generator ───────────────────────────────────

const generateMockData = (): MemberData => {
  const data: MemberData = {};
  const currentWeek = getWeekDates(0);
  const mockCommitments: Record<string, string[][]> = {
    james: [
      ['Review DAF structure compliance doc', 'Blue Spirit speaker outreach', 'Capital Node deal pipeline review'],
      ['Wisdom Council prep for Thursday', 'Map Node MVP feedback session', 'Review DAF structure compliance doc'],
      ['Blue Spirit speaker outreach', 'Capital Node deal pipeline review', 'Wisdom Council prep for Thursday'],
      ['Map Node MVP feedback session', 'Review DAF structure compliance doc', 'Blue Spirit speaker outreach'],
      ['Capital Node deal pipeline review', 'Wisdom Council prep for Thursday', 'Map Node MVP feedback session'],
    ],
    sian: [
      ['Cash forecast weekly update', 'Member onboarding call with 3 prospects', 'Blue Spirit logistics vendor review'],
      ['Update Airtable member database', 'Team capacity review', 'Cash forecast weekly update'],
      ['Member onboarding call with 3 prospects', 'Blue Spirit logistics vendor review', 'Update Airtable member database'],
      ['Team capacity review', 'Cash forecast weekly update', 'Member onboarding call with 3 prospects'],
      ['Blue Spirit logistics vendor review', 'Update Airtable member database', 'Team capacity review'],
    ],
    fairman: [
      ['Thesis of Change v2 draft', 'Node lead sync call prep', 'DECO framework legal review'],
      ['Cross-node dependency mapping', 'Map Node architecture sprint', 'Thesis of Change v2 draft'],
      ['Node lead sync call prep', 'DECO framework legal review', 'Cross-node dependency mapping'],
      ['Map Node architecture sprint', 'Thesis of Change v2 draft', 'Node lead sync call prep'],
      ['DECO framework legal review', 'Cross-node dependency mapping', 'Map Node architecture sprint'],
    ],
  };

  const statuses: CommitmentStatus[][] = [
    ['completed', 'completed', 'partial'],
    ['completed', 'partial', 'completed'],
    ['completed', 'completed', 'completed'],
    ['partial', 'completed', 'missed'],
    ['pending', 'pending', 'pending'],
  ];

  const historicalStatuses: CommitmentStatus[][] = [
    ['completed', 'completed', 'completed'],
    ['completed', 'partial', 'completed'],
    ['completed', 'completed', 'missed'],
    ['partial', 'completed', 'completed'],
    ['completed', 'completed', 'partial'],
    ['missed', 'partial', 'completed'],
    ['completed', 'completed', 'completed'],
  ];

  for (const memberId of Object.keys(mockCommitments)) {
    const entries: DayEntry[] = [];
    const commitmentSets = mockCommitments[memberId];

    for (let w = -7; w < 0; w++) {
      const weekDates = getWeekDates(w);
      for (let d = 0; d < 5; d++) {
        const dayStatuses = historicalStatuses[(Math.abs(w) + d) % historicalStatuses.length];
        entries.push({
          date: weekDates[d],
          commitments: commitmentSets[d % commitmentSets.length].map((text, j) => ({
            id: `${memberId}-${weekDates[d]}-${j}`,
            text,
            status: dayStatuses[j],
          })),
        });
      }
    }

    for (let i = 0; i < Math.min(currentWeek.length, commitmentSets.length); i++) {
      const dayCommitments = commitmentSets[i];
      const dayStatuses = statuses[i];
      entries.push({
        date: currentWeek[i],
        commitments: dayCommitments.map((text, j) => ({
          id: `${memberId}-${currentWeek[i]}-${j}`,
          text,
          status: dayStatuses[j],
        })),
      });
    }
    data[memberId] = { entries };
  }

  return data;
};

// ── Component ──────────────────────────────────────────────

export function AccountabilityView() {
  const [selectedMember, setSelectedMember] = useState(teamMembers[0].id);
  const [data, setData] = useState<MemberData>({});
  const [newCommitment, setNewCommitment] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load from localStorage or initialize with mock data
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        const mock = generateMockData();
        setData(mock);
        localStorage.setItem(LS_KEY, JSON.stringify(mock));
      }
    } else {
      const mock = generateMockData();
      setData(mock);
      localStorage.setItem(LS_KEY, JSON.stringify(mock));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    }
  }, [data]);

  const today = todayStr();
  const currentWeek = useMemo(() => getWeekDates(0), []);
  const memberData = data[selectedMember];
  const todayEntry = memberData?.entries.find((e) => e.date === today);
  const selectedMemberObj = teamMembers.find((m) => m.id === selectedMember);
  const activeMembers = teamMembers.filter((m) => m.status !== 'hiring');

  // Streak calculation
  const streak = useMemo(() => {
    if (!memberData) return 0;
    let count = 0;
    const sorted = [...memberData.entries]
      .filter((e) => e.date < today)
      .sort((a, b) => b.date.localeCompare(a.date));
    for (const entry of sorted) {
      const rate = getHitRate(entry);
      if (rate === 100) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [memberData, today]);

  // Weekly average
  const weeklyAvg = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const d of currentWeek) {
      const entry = memberData?.entries.find((e) => e.date === d);
      if (entry && entry.commitments.length > 0) {
        total += getHitRate(entry);
        count++;
      }
    }
    return count > 0 ? Math.round(total / count) : 0;
  }, [memberData, currentWeek]);

  // Previous week average (for trend indicator)
  const previousWeekRate = useMemo(() => {
    const prevWeek = getWeekDates(-1);
    let total = 0;
    let count = 0;
    for (const d of prevWeek) {
      const entry = memberData?.entries.find((e) => e.date === d);
      if (entry && entry.commitments.length > 0) {
        total += getHitRate(entry);
        count++;
      }
    }
    return count > 0 ? Math.round(total / count) : 0;
  }, [memberData]);

  // Total completed
  const totalCompleted = useMemo(() => {
    return memberData?.entries.reduce((sum, e) => sum + e.commitments.filter((c) => c.status === 'completed').length, 0) ?? 0;
  }, [memberData]);

  // Team average
  const teamAvg = useMemo(() => {
    const membersWithData = ['james', 'sian', 'fairman'];
    let teamTotal = 0;
    let teamCount = 0;
    for (const mid of membersWithData) {
      const md = data[mid];
      if (!md) continue;
      for (const d of currentWeek) {
        const entry = md.entries.find((e) => e.date === d);
        if (entry && entry.commitments.length > 0) {
          teamTotal += getHitRate(entry);
          teamCount++;
        }
      }
    }
    return teamCount > 0 ? Math.round(teamTotal / teamCount) : 0;
  }, [data, currentWeek]);

  // Monthly trend (past 4 weeks)
  const monthlyTrend = useMemo(() => {
    const weeks: { label: string; rate: number }[] = [];
    for (let w = -3; w <= 0; w++) {
      const weekDates = getWeekDates(w);
      let totalRate = 0;
      let daysWithData = 0;
      for (const date of weekDates) {
        const entry = memberData?.entries.find((e) => e.date === date);
        if (entry && entry.commitments.length > 0) {
          totalRate += getHitRate(entry);
          daysWithData++;
        }
      }
      const avgRate = daysWithData > 0 ? Math.round(totalRate / daysWithData) : 0;
      const start = new Date(weekDates[0] + 'T12:00:00');
      weeks.push({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: avgRate,
      });
    }
    return weeks;
  }, [memberData]);

  // Leaderboard data
  const leaderboard = useMemo(() => {
    const membersWithData = ['james', 'sian', 'fairman'];
    return membersWithData.map((memberId) => {
      const md = data[memberId];
      const member = teamMembers.find((m) => m.id === memberId);
      if (!md || !member) return null;

      let totalRate = 0;
      let daysCount = 0;
      let totalComp = 0;
      let totalComm = 0;

      for (const entry of md.entries) {
        if (entry.commitments.length > 0) {
          totalRate += getHitRate(entry);
          daysCount++;
          totalComp += entry.commitments.filter((c) => c.status === 'completed').length;
          totalComm += entry.commitments.length;
        }
      }

      const avgScore = daysCount > 0 ? Math.round(totalRate / daysCount) : 0;

      let streakCount = 0;
      const sorted = [...md.entries]
        .filter((e) => e.date < today)
        .sort((a, b) => b.date.localeCompare(a.date));
      for (const entry of sorted) {
        if (getHitRate(entry) === 100) streakCount++;
        else break;
      }

      let wTotal = 0;
      let wCount = 0;
      for (const d of currentWeek) {
        const entry = md.entries.find((e) => e.date === d);
        if (entry && entry.commitments.length > 0) {
          wTotal += getHitRate(entry);
          wCount++;
        }
      }

      return {
        member,
        score: avgScore,
        streak: streakCount,
        completed: totalComp,
        total: totalComm,
        weeklyAvg: wCount > 0 ? Math.round(wTotal / wCount) : 0,
        memberData: md,
      };
    }).filter(Boolean).sort((a, b) => b!.score - a!.score) as {
      member: (typeof teamMembers)[number];
      score: number;
      streak: number;
      completed: number;
      total: number;
      weeklyAvg: number;
      memberData: { entries: DayEntry[] };
    }[];
  }, [data, today, currentWeek]);

  // ── Handlers ──

  const addCommitment = useCallback(() => {
    if (!newCommitment.trim()) return;
    const commitment: Commitment = {
      id: `${selectedMember}-${today}-${Date.now()}`,
      text: newCommitment.trim(),
      status: 'pending',
    };
    setData((prev) => {
      const memberEntries = prev[selectedMember]?.entries || [];
      const existingEntryIdx = memberEntries.findIndex((e) => e.date === today);
      let updatedEntries: DayEntry[];
      if (existingEntryIdx >= 0) {
        updatedEntries = memberEntries.map((e, i) =>
          i === existingEntryIdx
            ? { ...e, commitments: [...e.commitments, commitment] }
            : e
        );
      } else {
        updatedEntries = [...memberEntries, { date: today, commitments: [commitment] }];
      }
      return { ...prev, [selectedMember]: { entries: updatedEntries } };
    });
    setNewCommitment('');
  }, [newCommitment, selectedMember, today]);

  const updateStatus = useCallback((date: string, commitmentId: string, status: CommitmentStatus) => {
    setData((prev) => {
      const memberEntries = prev[selectedMember]?.entries || [];
      const updatedEntries = memberEntries.map((entry) => {
        if (entry.date !== date) return entry;
        return {
          ...entry,
          commitments: entry.commitments.map((c) =>
            c.id === commitmentId ? { ...c, status } : c
          ),
        };
      });
      return { ...prev, [selectedMember]: { entries: updatedEntries } };
    });
  }, [selectedMember]);

  const removeCommitment = useCallback((date: string, commitmentId: string) => {
    setData((prev) => {
      const memberEntries = prev[selectedMember]?.entries || [];
      const updatedEntries = memberEntries.map((entry) => {
        if (entry.date !== date) return entry;
        return {
          ...entry,
          commitments: entry.commitments.filter((c) => c.id !== commitmentId),
        };
      });
      return { ...prev, [selectedMember]: { entries: updatedEntries } };
    });
  }, [selectedMember]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-acc-dropdown]')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{
        animation: `acc-slide-up 0.6s ${EASE} 0ms both`,
        marginBottom: 32,
        position: 'relative',
      }}>
        <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.1))',
                border: '1px solid rgba(212,165,116,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <Activity size={22} style={{ color: COLORS.gold }} />
                <div style={{
                  position: 'absolute', inset: -1, borderRadius: 15,
                  background: 'linear-gradient(135deg, rgba(212,165,116,0.1), transparent)',
                  pointerEvents: 'none',
                  animation: `acc-pulse-glow 4s ease-in-out infinite`,
                }} />
              </div>
              <div>
                <h1 className="text-glow" style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  <span className="gradient-text">Steward Accountability Loops</span>
                </h1>
                <p style={{ fontSize: 13, color: COLORS.muted, margin: 0, marginTop: 4 }}>
                  Track morning commitments against end-of-day results. Build consistency across the steward team.
                </p>
              </div>
            </div>
          </div>

          {/* Member Selector */}
          <div style={{ position: 'relative' }} data-acc-dropdown>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: GLASS.bg,
                backdropFilter: GLASS.blur,
                WebkitBackdropFilter: GLASS.blur,
                border: `1px solid ${dropdownOpen ? GLASS.borderHover : GLASS.border}`,
                borderRadius: 14, padding: '12px 18px',
                cursor: 'pointer', minWidth: 230,
                transition: `all 0.3s ${EASE}`,
                boxShadow: dropdownOpen ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {selectedMemberObj && (
                <div
                  className={selectedMemberObj.color}
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                  }}
                >
                  {selectedMemberObj.avatar}
                </div>
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.cream, margin: 0 }}>{selectedMemberObj?.name}</p>
                <p style={{ fontSize: 11, color: COLORS.dimmed, margin: 0 }}>{selectedMemberObj?.shortRole}</p>
              </div>
              <ChevronDown size={16} style={{
                color: COLORS.dimmed,
                transition: `transform 0.3s ${EASE}`,
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8, width: '100%',
                background: 'rgba(19,23,32,0.95)',
                backdropFilter: GLASS.blur,
                WebkitBackdropFilter: GLASS.blur,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                zIndex: 50, padding: 6, maxHeight: 280, overflowY: 'auto',
                animation: `acc-stat-count-up 0.25s ${EASE} both`,
              }}
              className="scrollbar-autohide"
              >
                {activeMembers.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMember(m.id); setDropdownOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10, border: 'none',
                      backgroundColor: m.id === selectedMember ? 'rgba(212,165,116,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: `all 0.2s ${EASE}`,
                      animation: `acc-stagger-in 0.3s ${EASE} ${i * 30}ms both`,
                    }}
                    onMouseEnter={(e) => {
                      if (m.id !== selectedMember) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      if (m.id !== selectedMember) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div
                      className={m.color}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 10, fontWeight: 700,
                      }}
                    >
                      {m.avatar}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 12, color: COLORS.cream, margin: 0 }}>{m.name}</p>
                      <p style={{ fontSize: 10, color: COLORS.dimmed, margin: 0 }}>{m.shortRole}</p>
                    </div>
                    {m.id === selectedMember && (
                      <CheckCircle2 size={14} style={{ color: COLORS.gold, marginLeft: 'auto' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary Stats Bar ── */}
      <div style={{
        animation: `acc-slide-up 0.6s ${EASE} 60ms both`,
        marginBottom: 28,
      }}>
        <SummaryStatsBar
          streak={streak}
          completionRate={weeklyAvg}
          teamAvg={teamAvg}
          totalCompleted={totalCompleted}
          previousWeekRate={previousWeekRate}
          delay={100}
        />
      </div>

      {/* ── Score Ring + Streak + Heat Calendar Row ── */}
      <div
        style={{
          animation: `acc-slide-up 0.6s ${EASE} 140ms both`,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 24,
          marginBottom: 28,
        }}
      >
        {/* Left: Score Ring */}
        <div className="card-premium" style={{
          background: GLASS.bg,
          backdropFilter: GLASS.blur,
          WebkitBackdropFilter: GLASS.blur,
          border: `1px solid ${GLASS.border}`,
          borderRadius: 20, padding: '32px 36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle radial background */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: weeklyAvg >= 80
              ? 'radial-gradient(circle at 50% 50%, rgba(107,143,113,0.06) 0%, transparent 70%)'
              : weeklyAvg >= 50
                ? 'radial-gradient(circle at 50% 50%, rgba(232,180,76,0.06) 0%, transparent 70%)'
                : 'none',
          }} />
          <ScoreRing score={weeklyAvg} size={160} strokeWidth={12} label="This Week" />
          {/* Sub-metric badges */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: COLORS.dimmed, backgroundColor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '3px 10px',
            }}>
              <Shield size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
              {streak}d streak
            </span>
            <span style={{
              fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: COLORS.dimmed, backgroundColor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '3px 10px',
            }}>
              <BarChart3 size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
              {totalCompleted} done
            </span>
          </div>
        </div>

        {/* Right: Streak + Heat Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StreakCounter streak={streak} />

          {/* Heat Calendar */}
          <div className="card-premium" style={{
            background: GLASS.bg,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
            border: `1px solid ${GLASS.border}`,
            borderRadius: 16, padding: '20px 24px',
            transition: `border-color 0.3s ${EASE}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} style={{ color: COLORS.purple }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>
                  Streak Calendar
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, color: COLORS.dimmed }}>
                <span>Less</span>
                {['#1c2230', 'rgba(224,96,96,0.6)', COLORS.amber, 'rgba(107,143,113,0.6)', COLORS.green].map((c, i) => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: 3, backgroundColor: c,
                    transition: `transform 0.2s ${EASE}`,
                  }} />
                ))}
                <span>More</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <HeatCalendar memberData={memberData} weeksBack={8} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Weekly Accountability Grid ── */}
      <div
        className="card-premium"
        style={{
          animation: `acc-slide-up 0.6s ${EASE} 220ms both`,
          background: GLASS.bg,
          backdropFilter: GLASS.blur,
          WebkitBackdropFilter: GLASS.blur,
          border: `1px solid ${GLASS.border}`,
          borderRadius: 20,
          padding: '28px 32px',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.cream, margin: 0 }}>
              Weekly Tracker
            </h3>
            <span style={{ fontSize: 11, color: COLORS.dimmed }}>
              {dayLabel(currentWeek[0])} &mdash; {dayLabel(currentWeek[6])}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, fontSize: 10, color: COLORS.dimmed,
          }}>
            {[
              { label: '100%', color: COLORS.green },
              { label: 'Partial', color: COLORS.amber },
              { label: 'Missed', color: COLORS.red },
            ].map((item) => (
              <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color,
                  boxShadow: `0 0 6px ${item.color}30`,
                }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', gap: 8,
        }}>
          {currentWeek.map((date, i) => (
            <WeekGridCell
              key={date}
              date={date}
              entry={memberData?.entries.find((e) => e.date === date)}
              isToday={date === today}
              delay={260 + i * 50}
            />
          ))}
        </div>

        {/* Week progress bar */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: COLORS.dimmed }}>Weekly Progress</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendArrow current={weeklyAvg} previous={previousWeekRate} />
              <span style={{
                fontSize: 13, fontWeight: 700, color: COLORS.gold,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {weeklyAvg}%
              </span>
            </div>
          </div>
          <div className="progress-bar-animated" style={{
            height: 7, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              height: '100%', width: `${weeklyAvg}%`, borderRadius: 4,
              background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
              transition: `width 1.2s ${EASE}`,
              position: 'relative',
            }}>
              {/* Shimmer effect */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 4,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'acc-shimmer 2.5s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Commitments + Hit Rate Chart ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28,
      }}>
        {/* Today's Commitments */}
        <div
          className="card-premium"
          style={{
            animation: `acc-slide-up 0.6s ${EASE} 320ms both`,
            background: GLASS.bg,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
            border: `1px solid ${GLASS.border}`,
            borderRadius: 20, padding: '28px 30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.cream, margin: 0 }}>
                Top 3 Today
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: COLORS.dimmed }}>{dayLabel(today)}</span>
                <UrgencyBadge date={today} />
              </div>
            </div>
            {todayEntry && todayEntry.commitments.length > 0 && (
              <MiniProgressRing score={getHitRate(todayEntry)} size={38} strokeWidth={3} />
            )}
          </div>

          {/* Add commitment */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <input
              type="text"
              value={newCommitment}
              onChange={(e) => setNewCommitment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCommitment()}
              placeholder="Add a commitment..."
              disabled={(todayEntry?.commitments.length ?? 0) >= 5}
              style={{
                flex: 1,
                backgroundColor: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12, padding: '12px 16px', fontSize: 13,
                color: COLORS.cream, outline: 'none',
                transition: `all 0.3s ${EASE}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLORS.gold + '50';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.gold}10`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={addCommitment}
              disabled={!newCommitment.trim() || (todayEntry?.commitments.length ?? 0) >= 5}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.gold}cc)`,
                color: COLORS.bg, cursor: 'pointer',
                opacity: !newCommitment.trim() || (todayEntry?.commitments.length ?? 0) >= 5 ? 0.3 : 1,
                transition: `all 0.3s ${EASE}`,
                boxShadow: newCommitment.trim() ? `0 4px 12px ${COLORS.gold}30` : 'none',
              }}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Commitment cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayEntry?.commitments.map((c, i) => (
              <CommitmentCard
                key={c.id}
                commitment={c}
                date={today}
                onUpdateStatus={updateStatus}
                onRemove={removeCommitment}
                delay={370 + i * 60}
              />
            ))}
            {(!todayEntry || todayEntry.commitments.length === 0) && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '40px 20px', color: COLORS.dimmed,
                borderRadius: 14,
                border: `1px dashed ${COLORS.border}`,
                backgroundColor: 'rgba(255,255,255,0.01)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  backgroundColor: 'rgba(212,165,116,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Save size={22} style={{ opacity: 0.4, color: COLORS.gold }} />
                </div>
                <p style={{ fontSize: 13, margin: 0, color: COLORS.muted }}>No commitments yet for today</p>
                <p style={{ fontSize: 11, margin: '4px 0 0 0', opacity: 0.6 }}>Add your Top 3 priorities above</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Hit Rate Chart */}
        <div
          className="card-premium"
          style={{
            animation: `acc-slide-up 0.6s ${EASE} 380ms both`,
            background: GLASS.bg,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
            border: `1px solid ${GLASS.border}`,
            borderRadius: 20, padding: '28px 30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.cream, margin: 0 }}>
              Weekly Hit Rate
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={14} style={{ color: COLORS.purple }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted }}>
                {weeklyAvg}% avg
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180, marginBottom: 16 }}>
            {currentWeek.map((date, i) => {
              const entry = memberData?.entries.find((e) => e.date === date);
              const rate = getHitRate(entry);
              const isToday = date === today;
              const barColor = rate >= 80
                ? `linear-gradient(180deg, ${COLORS.green}, ${COLORS.greenDark})`
                : rate >= 50
                  ? `linear-gradient(180deg, ${COLORS.amber}, #c99530)`
                  : rate > 0
                    ? `linear-gradient(180deg, ${COLORS.red}, ${COLORS.redDark})`
                    : '#1c2230';

              return (
                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: rate > 0 ? COLORS.cream : '#262e3e',
                    fontVariantNumeric: 'tabular-nums',
                    animation: rate > 0 ? `acc-number-pop 0.4s ${EASE} ${420 + i * 80 + 200}ms both` : 'none',
                    opacity: rate > 0 ? undefined : 1,
                  }}>
                    {rate > 0 ? `${rate}%` : ''}
                  </span>
                  <div style={{
                    width: '100%', height: 130,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {/* Average line */}
                    {weeklyAvg > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: `${weeklyAvg * 1.3}%`,
                        left: 0, right: 0,
                        height: 1,
                        backgroundColor: `${COLORS.gold}30`,
                        borderTop: `1px dashed ${COLORS.gold}40`,
                        zIndex: 1,
                      }} />
                    )}
                    <div
                      style={{
                        width: '100%', borderRadius: 10, background: barColor,
                        height: `${rate}%`, minHeight: rate > 0 ? 4 : 0,
                        transition: `height 1s ${EASE}`,
                        transformOrigin: 'bottom',
                        animation: `acc-bar-grow 0.8s ${EASE} ${420 + i * 80}ms both`,
                        position: 'relative',
                      }}
                    >
                      {rate === 100 && (
                        <div style={{
                          position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)',
                          animation: `acc-sparkle-rotate 3s ease-in-out infinite`,
                        }}>
                          <Sparkles size={10} style={{ color: COLORS.green }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: isToday ? 700 : 500,
                    color: isToday ? COLORS.gold : COLORS.dimmed,
                  }}>
                    {weekdayShort(date)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Monthly Trend Sparkline */}
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TrendingUp size={12} style={{ color: COLORS.muted }} />
              <span style={{ fontSize: 11, color: COLORS.dimmed }}>4-Week Trend</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {monthlyTrend.map((week, i) => {
                const isCurrentWeek = i === monthlyTrend.length - 1;
                const prevRate = i > 0 ? monthlyTrend[i - 1].rate : week.rate;
                const barGradient = week.rate >= 80
                  ? `linear-gradient(90deg, ${COLORS.green}, ${COLORS.purple})`
                  : week.rate >= 50
                    ? `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.gold})`
                    : week.rate > 0
                      ? `linear-gradient(90deg, ${COLORS.red}, ${COLORS.redDark})`
                      : '#1c2230';
                return (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{
                        fontSize: 10, color: isCurrentWeek ? COLORS.gold : COLORS.dimmed,
                        fontWeight: isCurrentWeek ? 600 : 400,
                      }}>
                        {week.label}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: isCurrentWeek ? COLORS.gold : COLORS.muted,
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {week.rate}%
                        </span>
                        {i > 0 && <TrendArrow current={week.rate} previous={prevRate} />}
                      </div>
                    </div>
                    <div style={{
                      height: 5, backgroundColor: '#1c2230', borderRadius: 3, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${week.rate}%`,
                        background: barGradient, borderRadius: 3,
                        transition: `width 0.8s ${EASE}`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Individual Accountability Cards ── */}
      <div
        style={{
          animation: `acc-slide-up 0.6s ${EASE} 460ms both`,
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={14} style={{ color: COLORS.purple }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.cream, margin: 0 }}>
            Individual Accountability
          </h3>
          <span style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: COLORS.dimmed,
            background: GLASS.bg,
            backdropFilter: GLASS.blur,
            border: `1px solid ${GLASS.border}`,
            borderRadius: 12, padding: '3px 12px', marginLeft: 4,
          }}>
            {leaderboard.length} members tracking
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
          {leaderboard.map((row, i) => (
            <AccountabilityCard
              key={row.member.id}
              member={row.member}
              memberData={row.memberData}
              streak={row.streak}
              weeklyAvg={row.weeklyAvg}
              totalCompleted={row.completed}
              totalCommitments={row.total}
              delay={520 + i * 80}
            />
          ))}
        </div>
      </div>

      {/* ── Team Leaderboard + Week History ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
      }}>
        {/* Team Accountability Leaderboard */}
        <div
          className="card-premium"
          style={{
            animation: `acc-slide-up 0.6s ${EASE} 560ms both`,
            background: GLASS.bg,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
            border: `1px solid ${GLASS.border}`,
            borderRadius: 20, padding: '28px 30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              backgroundColor: 'rgba(232,180,76,0.1)',
              border: '1px solid rgba(232,180,76,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trophy size={14} style={{ color: COLORS.amber }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.cream, margin: 0 }}>
              Team Leaderboard
            </h3>
          </div>

          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '34px 36px 1fr 50px 40px 70px',
            gap: 12, padding: '0 18px 12px',
            fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: COLORS.dimmed,
            borderBottom: `1px solid ${COLORS.border}`, marginBottom: 6,
          }}>
            <span>#</span>
            <span></span>
            <span>Name</span>
            <span style={{ textAlign: 'right' }}>Score</span>
            <span style={{ textAlign: 'center' }}>
              <Flame size={10} style={{ display: 'inline' }} />
            </span>
            <span style={{ textAlign: 'center' }}>Done</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {leaderboard.map((row, i) => (
              <LeaderboardRow
                key={row.member.id}
                rank={i + 1}
                member={row.member}
                score={row.score}
                streak={row.streak}
                completed={row.completed}
                total={row.total}
                delay={620 + i * 80}
              />
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '36px 0', color: COLORS.dimmed,
            }}>
              <Trophy size={24} style={{ opacity: 0.2, marginBottom: 8 }} />
              <span style={{ fontSize: 12 }}>No data yet</span>
            </div>
          )}
        </div>

        {/* This Week's Commitments History */}
        <div
          className="card-premium"
          style={{
            animation: `acc-slide-up 0.6s ${EASE} 620ms both`,
            background: GLASS.bg,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
            border: `1px solid ${GLASS.border}`,
            borderRadius: 20, padding: '28px 30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              backgroundColor: 'rgba(107,143,113,0.1)',
              border: '1px solid rgba(107,143,113,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Calendar size={14} style={{ color: COLORS.green }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.cream, margin: 0 }}>
              This Week&apos;s History
            </h3>
          </div>

          <div className="scrollbar-autohide" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
            {currentWeek.map((date, dayIdx) => {
              const entry = memberData?.entries.find((e) => e.date === date);
              const isToday = date === today;
              const hitRate = getHitRate(entry);
              if (!entry || entry.commitments.length === 0) return null;

              return (
                <div
                  key={date}
                  style={{
                    animation: `acc-stagger-in 0.4s ${EASE} ${680 + dayIdx * 60}ms both`,
                    borderRadius: 14,
                    border: `1px solid ${isToday ? 'rgba(212,165,116,0.2)' : COLORS.border}`,
                    backgroundColor: isToday ? 'rgba(212,165,116,0.04)' : COLORS.surfaceAlt,
                    padding: '16px 18px',
                    transition: `all 0.3s ${EASE}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: isToday ? COLORS.gold : COLORS.muted,
                      }}>
                        {dayLabel(date)}
                      </span>
                      {isToday && <UrgencyBadge date={date} />}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '3px 12px', borderRadius: 10,
                      fontVariantNumeric: 'tabular-nums',
                      backgroundColor:
                        hitRate >= 80 ? 'rgba(107,143,113,0.12)'
                          : hitRate >= 50 ? 'rgba(232,180,76,0.12)'
                            : 'rgba(224,96,96,0.12)',
                      color:
                        hitRate >= 80 ? COLORS.green
                          : hitRate >= 50 ? COLORS.amber
                            : COLORS.red,
                      border: `1px solid ${
                        hitRate >= 80 ? 'rgba(107,143,113,0.2)'
                          : hitRate >= 50 ? 'rgba(232,180,76,0.2)'
                            : 'rgba(224,96,96,0.2)'
                      }`,
                    }}>
                      {hitRate}%
                    </span>
                  </div>

                  {/* Completion bar with gradient */}
                  <div style={{
                    height: 4, backgroundColor: COLORS.border, borderRadius: 3,
                    overflow: 'hidden', marginBottom: 12,
                  }}>
                    <div style={{
                      height: '100%', width: `${hitRate}%`,
                      background:
                        hitRate >= 80 ? `linear-gradient(90deg, ${COLORS.green}, ${COLORS.purple})`
                          : hitRate >= 50 ? `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.gold})`
                            : `linear-gradient(90deg, ${COLORS.red}, ${COLORS.redDark})`,
                      borderRadius: 3,
                      transition: `width 0.8s ${EASE}`,
                    }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {entry.commitments.map((c) => (
                      <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '2px 0',
                      }}>
                        {c.status === 'completed' && <CheckCircle2 size={13} style={{ color: COLORS.green, flexShrink: 0 }} />}
                        {c.status === 'partial' && <MinusCircle size={13} style={{ color: COLORS.amber, flexShrink: 0 }} />}
                        {c.status === 'missed' && <XCircle size={13} style={{ color: COLORS.red, flexShrink: 0 }} />}
                        {c.status === 'pending' && (
                          <div style={{
                            width: 13, height: 13, borderRadius: '50%',
                            border: `1.5px solid ${COLORS.dimmed}`, flexShrink: 0,
                          }} />
                        )}
                        <span style={{
                          fontSize: 12,
                          color: c.status === 'completed' ? COLORS.muted : c.status === 'missed' ? COLORS.red : COLORS.cream,
                          textDecoration: c.status === 'completed' ? 'line-through' : 'none',
                          transition: `color 0.2s ${EASE}`,
                        }}>
                          {c.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
