'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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

// ── Keyframe styles injected once ────────────────────────

const styleId = 'accountability-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes flame-dance {
      0%, 100% { transform: scaleY(1) translateY(0); }
      25% { transform: scaleY(1.08) translateY(-1px); }
      50% { transform: scaleY(0.95) translateY(1px); }
      75% { transform: scaleY(1.05) translateY(-0.5px); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes ring-in {
      from { stroke-dashoffset: var(--circ); }
    }
    @keyframes heat-cell-in {
      from { opacity: 0; transform: scale(0); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes stat-count-up {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ── SVG Score Ring ─────────────────────────────────────────

function ScoreRing({ score, size = 140, strokeWidth = 10, label }: { score: number; size?: number; strokeWidth?: number; label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  const color = score >= 80 ? '#6b8f71' : score >= 50 ? '#e8b44c' : score > 0 ? '#e06060' : '#262e3e';
  const glowColor = score >= 80 ? 'rgba(107,143,113,0.3)' : score >= 50 ? 'rgba(232,180,76,0.3)' : 'rgba(224,96,96,0.2)';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1e2638"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
            filter: score > 0 ? `drop-shadow(0 0 6px ${glowColor})` : 'none',
          }}
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
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: '#f0ebe4', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {score}%
        </span>
        {label && (
          <span style={{ fontSize: 10, color: '#6b6358', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
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
  const color = score >= 80 ? '#6b8f71' : score >= 50 ? '#e8b44c' : score > 0 ? '#e06060' : '#262e3e';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#1e2638" strokeWidth={strokeWidth} />
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
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
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: active ? 'flame-dance 1.5s ease-in-out infinite' : 'none' }}
    >
      <defs>
        {active && (
          <filter id="flame-glow-v2">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
        <linearGradient id="flame-grad-v2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={active ? '#e06060' : '#3a3a3a'} />
          <stop offset="50%" stopColor={active ? '#e8b44c' : '#4a4a4a'} />
          <stop offset="100%" stopColor={active ? '#f0c060' : '#555'} />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 8 6 8 10C8 11.5 8.5 12.8 9.4 13.8C8.5 13.3 8 12.2 8 11C5.5 13 4 16 4 18C4 21.3 7.6 24 12 24C16.4 24 20 21.3 20 18C20 12 12 2 12 2Z"
        fill="url(#flame-grad-v2)"
        filter={active ? 'url(#flame-glow-v2)' : undefined}
      />
      {active && (
        <path
          d="M12 24C14.2 24 16 22 16 19.5C16 17 12 12 12 12C12 12 8 17 8 19.5C8 22 9.8 24 12 24Z"
          fill="#f0c060" opacity="0.7"
        />
      )}
    </svg>
  );
}

// ── SVG Heat Calendar ──────────────────────────────────────

function HeatCalendar({ memberData, weeksBack = 8 }: { memberData: { entries: DayEntry[] } | undefined; weeksBack?: number }) {
  const cellSize = 14;
  const cellGap = 3;
  const labelWidth = 28;

  // Generate dates for past N weeks
  const allWeeks: string[][] = [];
  for (let w = -(weeksBack - 1); w <= 0; w++) {
    allWeeks.push(getWeekDates(w));
  }
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const getColor = (dateStr: string) => {
    const entry = memberData?.entries.find((e) => e.date === dateStr);
    const rate = getHitRate(entry);
    if (!entry || entry.commitments.length === 0) return '#1c2230';
    if (rate === 100) return '#6b8f71';
    if (rate >= 75) return 'rgba(107,143,113,0.6)';
    if (rate >= 50) return '#e8b44c';
    if (rate >= 25) return 'rgba(232,180,76,0.5)';
    return '#e06060';
  };

  const svgWidth = labelWidth + allWeeks.length * (cellSize + cellGap);
  const svgHeight = 7 * (cellSize + cellGap) + 20; // +20 for month labels

  return (
    <svg width={svgWidth} height={svgHeight} style={{ overflow: 'visible' }}>
      {/* Day labels */}
      {dayLabels.map((lbl, i) => (
        <text
          key={`day-${i}`}
          x={labelWidth - 6}
          y={20 + i * (cellSize + cellGap) + cellSize / 2 + 3}
          fill="#6b6358"
          fontSize={9}
          textAnchor="end"
          fontFamily="inherit"
        >
          {i % 2 === 0 ? lbl : ''}
        </text>
      ))}
      {/* Week columns */}
      {allWeeks.map((week, wIdx) => {
        // Month label for first week or when month changes
        const firstDate = new Date(week[0] + 'T12:00:00');
        const showMonth = wIdx === 0 || firstDate.getDate() <= 7;
        return (
          <g key={`week-${wIdx}`}>
            {showMonth && (
              <text
                x={labelWidth + wIdx * (cellSize + cellGap)}
                y={10}
                fill="#6b6358"
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
              return (
                <rect
                  key={dateStr}
                  x={labelWidth + wIdx * (cellSize + cellGap)}
                  y={20 + dIdx * (cellSize + cellGap)}
                  width={cellSize}
                  height={cellSize}
                  rx={3}
                  fill={color}
                  stroke={isToday ? '#d4a574' : 'none'}
                  strokeWidth={isToday ? 1.5 : 0}
                  style={{
                    animation: `heat-cell-in 0.3s ease-out ${wIdx * 30 + dIdx * 10}ms both`,
                  }}
                >
                  <title>{dayLabel(dateStr)}: {getHitRate(memberData?.entries.find(e => e.date === dateStr))}%</title>
                </rect>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ── Summary Stats Bar ──────────────────────────────────────

function SummaryStatsBar({
  streak,
  completionRate,
  teamAvg,
  totalCompleted,
  delay,
}: {
  streak: number;
  completionRate: number;
  teamAvg: number;
  totalCompleted: number;
  delay: number;
}) {
  const stats = [
    {
      icon: <AnimatedFlame size={20} active={streak > 0} />,
      value: `${streak}`,
      label: 'Day Streak',
      color: streak > 0 ? '#e8b44c' : '#6b6358',
      sub: streak >= 7 ? 'On fire!' : streak > 0 ? 'Keep going' : 'Start today',
    },
    {
      icon: <Target size={18} style={{ color: '#d4a574' }} />,
      value: `${completionRate}%`,
      label: 'Completion Rate',
      color: completionRate >= 80 ? '#6b8f71' : completionRate >= 50 ? '#e8b44c' : '#e06060',
      sub: 'This week',
    },
    {
      icon: <Users size={18} style={{ color: '#8b5cf6' }} />,
      value: `${teamAvg}%`,
      label: 'Team Average',
      color: teamAvg >= 80 ? '#6b8f71' : teamAvg >= 50 ? '#e8b44c' : '#e06060',
      sub: 'All members',
    },
    {
      icon: <Zap size={18} style={{ color: '#6b8f71' }} />,
      value: `${totalCompleted}`,
      label: 'Completed',
      color: '#6b8f71',
      sub: 'All time',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
    }}>
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="animate-fade-in"
          style={{
            animationDelay: `${delay + i * 60}ms`,
            opacity: 0,
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            transition: 'border-color 0.3s',
          }}
        >
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            backgroundColor: `${stat.color}12`,
            border: `1px solid ${stat.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {stat.icon}
          </div>
          <div>
            <span style={{
              fontSize: 22, fontWeight: 800, color: stat.color,
              lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              display: 'block',
              animation: `stat-count-up 0.5s ease-out ${delay + i * 60 + 200}ms both`,
            }}>
              {stat.value}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a09888', display: 'block', marginTop: 2 }}>
              {stat.label}
            </span>
            <span style={{ fontSize: 10, color: '#6b6358' }}>{stat.sub}</span>
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

  let bgColor = '#131720';
  let borderColor = '#1e2638';
  let dotColor = '#262e3e';

  if (hasData) {
    if (rate === 100) {
      bgColor = 'rgba(107, 143, 113, 0.15)';
      borderColor = 'rgba(107, 143, 113, 0.4)';
      dotColor = '#6b8f71';
    } else if (rate >= 50) {
      bgColor = 'rgba(232, 180, 76, 0.12)';
      borderColor = 'rgba(232, 180, 76, 0.35)';
      dotColor = '#e8b44c';
    } else if (rate > 0) {
      bgColor = 'rgba(224, 96, 96, 0.12)';
      borderColor = 'rgba(224, 96, 96, 0.35)';
      dotColor = '#e06060';
    }
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flex: 1,
      }}
    >
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: isToday ? '#d4a574' : '#6b6358',
      }}>
        {weekdayShort(date)}
      </span>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: bgColor,
        border: `2px solid ${isToday ? '#d4a574' : borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: isToday ? '0 0 16px rgba(212,165,116,0.2)' : 'none',
        position: 'relative',
      }}>
        {/* Colored status dot */}
        <div style={{
          width: hasData ? 14 : 8,
          height: hasData ? 14 : 8,
          borderRadius: '50%',
          backgroundColor: dotColor,
          transition: 'all 0.3s ease',
          boxShadow: hasData && rate === 100 ? `0 0 8px ${dotColor}60` : 'none',
        }} />
        {/* Streak fire for 100% days */}
        {hasData && rate === 100 && (
          <div style={{ position: 'absolute', top: -6, right: -4 }}>
            <AnimatedFlame size={14} active />
          </div>
        )}
      </div>
      {hasData ? (
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: rate === 100 ? '#6b8f71' : rate >= 50 ? '#e8b44c' : '#e06060',
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

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '16px 20px',
      borderRadius: 16,
      backgroundColor: isActive ? 'rgba(232, 180, 76, 0.08)' : '#131720',
      border: `1px solid ${isHot ? 'rgba(232, 180, 76, 0.4)' : isActive ? 'rgba(232, 180, 76, 0.25)' : '#1e2638'}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated glow background for active streaks */}
      {isActive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isHot
            ? 'radial-gradient(ellipse at 20% 50%, rgba(232,180,76,0.15) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 20% 50%, rgba(232,180,76,0.1) 0%, transparent 70%)',
          animation: 'pulse-glow 3s ease-in-out infinite',
        }} />
      )}
      <div style={{
        position: 'relative',
        width: 44,
        height: 44,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isActive ? 'rgba(232, 180, 76, 0.15)' : 'rgba(255,255,255,0.03)',
      }}>
        <AnimatedFlame size={26} active={isActive} />
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 28,
            fontWeight: 800,
            color: isActive ? '#e8b44c' : '#6b6358',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {streak}
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: isActive ? '#d4a574' : '#6b6358',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            day streak
          </span>
          {isHot && (
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#e06060',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: 'rgba(224,96,96,0.12)',
              padding: '2px 8px',
              borderRadius: 8,
              marginLeft: 4,
            }}>
              HOT
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#6b6358', marginTop: 2, display: 'block' }}>
          {isHot ? 'Blazing through commitments!' : isActive ? 'Consecutive 100% completion days' : 'Complete all commitments to start'}
        </span>
      </div>
    </div>
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

  return (
    <div
      className="animate-fade-in glow-card"
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        backgroundColor: '#131720',
        border: `1px solid ${isHot ? 'rgba(232,180,76,0.3)' : '#1e2638'}`,
        borderRadius: 18,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'border-color 0.3s, box-shadow 0.3s',
        position: 'relative',
        overflow: 'hidden',
      }}
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
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
          position: 'relative',
        }}
      >
        {member.avatar}
        {/* Flame badge for hot streaks */}
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
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', display: 'block' }}>
          {member.name.split(' ')[0]}
        </span>
        <span style={{ fontSize: 10, color: '#6b6358' }}>{member.shortRole}</span>
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 42 }}>
        <Flame size={13} style={{ color: streak > 0 ? '#e8b44c' : '#262e3e' }} />
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: streak > 0 ? '#e8b44c' : '#6b6358',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {streak}
        </span>
      </div>

      {/* Completion */}
      <div style={{ textAlign: 'right', minWidth: 50 }}>
        <span style={{
          fontSize: 10, color: '#6b6358', display: 'block',
          textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
        }}>
          Done
        </span>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: completionRate >= 80 ? '#6b8f71' : completionRate >= 50 ? '#e8b44c' : '#a09888',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {totalCompleted}/{totalCommitments}
        </span>
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
  const progressValue =
    commitment.status === 'completed' ? 100
      : commitment.status === 'partial' ? 50
        : commitment.status === 'missed' ? 0
          : 0;

  const progressColor =
    commitment.status === 'completed' ? '#6b8f71'
      : commitment.status === 'partial' ? '#e8b44c'
        : commitment.status === 'missed' ? '#e06060'
          : '#262e3e';

  return (
    <div
      className="animate-fade-in"
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        padding: '14px 16px',
        borderRadius: 14,
        border: '1px solid',
        borderColor:
          commitment.status === 'completed' ? 'rgba(107,143,113,0.3)'
            : commitment.status === 'partial' ? 'rgba(232,180,76,0.3)'
              : commitment.status === 'missed' ? 'rgba(224,96,96,0.3)'
                : '#1e2638',
        backgroundColor:
          commitment.status === 'completed' ? 'rgba(107,143,113,0.06)'
            : commitment.status === 'partial' ? 'rgba(232,180,76,0.06)'
              : commitment.status === 'missed' ? 'rgba(224,96,96,0.06)'
                : '#131720',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13,
            fontWeight: 500,
            color: commitment.status === 'completed' ? '#a09888' : '#f0ebe4',
            textDecoration: commitment.status === 'completed' ? 'line-through' : 'none',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {commitment.text}
          </p>
          {/* Mini progress bar */}
          <div style={{
            marginTop: 8,
            height: 3,
            backgroundColor: '#1e2638',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressValue}%`,
              backgroundColor: progressColor,
              borderRadius: 2,
              transition: 'width 0.5s ease, background-color 0.3s ease',
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => onUpdateStatus(date, commitment.id, 'completed')}
            style={{
              padding: 4, borderRadius: 6, border: 'none', backgroundColor: 'transparent',
              color: commitment.status === 'completed' ? '#6b8f71' : '#6b6358',
              cursor: 'pointer', transition: 'color 0.2s', display: 'flex',
            }}
            title="Completed"
          >
            <CheckCircle2 size={18} />
          </button>
          <button
            onClick={() => onUpdateStatus(date, commitment.id, 'partial')}
            style={{
              padding: 4, borderRadius: 6, border: 'none', backgroundColor: 'transparent',
              color: commitment.status === 'partial' ? '#e8b44c' : '#6b6358',
              cursor: 'pointer', transition: 'color 0.2s', display: 'flex',
            }}
            title="Partial"
          >
            <MinusCircle size={18} />
          </button>
          <button
            onClick={() => onUpdateStatus(date, commitment.id, 'missed')}
            style={{
              padding: 4, borderRadius: 6, border: 'none', backgroundColor: 'transparent',
              color: commitment.status === 'missed' ? '#e06060' : '#6b6358',
              cursor: 'pointer', transition: 'color 0.2s', display: 'flex',
            }}
            title="Missed"
          >
            <XCircle size={18} />
          </button>
          <button
            onClick={() => onRemove(date, commitment.id)}
            style={{
              padding: 4, borderRadius: 6, border: 'none', backgroundColor: 'transparent',
              color: '#6b6358', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', marginLeft: 2,
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
  const rankColor = rank === 1 ? '#e8b44c' : rank === 2 ? '#a09888' : rank === 3 ? '#d4a574' : '#6b6358';

  return (
    <div
      className="animate-fade-in"
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 12,
        backgroundColor: rank === 1 ? 'rgba(232,180,76,0.06)' : 'transparent',
        border: `1px solid ${rank === 1 ? 'rgba(232,180,76,0.2)' : 'transparent'}`,
        transition: 'background-color 0.2s',
      }}
    >
      {/* Rank */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: `${rankColor}15`,
      }}>
        <RankIcon size={16} style={{ color: rankColor }} />
      </div>

      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
      }}
        className={member.color}
      >
        {member.avatar}
      </div>

      {/* Name & role */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', display: 'block' }}>
          {member.name.split(' ')[0]}
        </span>
        <span style={{ fontSize: 10, color: '#6b6358' }}>{member.shortRole}</span>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'right', minWidth: 50 }}>
        <span style={{
          fontSize: 16, fontWeight: 700,
          color: score >= 80 ? '#6b8f71' : score >= 50 ? '#e8b44c' : '#e06060',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {score}%
        </span>
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 40 }}>
        <Flame size={12} style={{ color: streak > 0 ? '#e8b44c' : '#262e3e' }} />
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: streak > 0 ? '#e8b44c' : '#6b6358',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {streak}
        </span>
      </div>

      {/* Completion bar */}
      <div style={{ width: 60 }}>
        <div style={{
          height: 4, backgroundColor: '#1e2638', borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: total > 0 ? `${(completed / total) * 100}%` : '0%',
            backgroundColor: score >= 80 ? '#6b8f71' : score >= 50 ? '#e8b44c' : '#e06060',
            borderRadius: 2,
            transition: 'width 0.7s ease',
          }} />
        </div>
        <span style={{ fontSize: 9, color: '#6b6358', marginTop: 2, display: 'block', textAlign: 'center' }}>
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

  // Also generate historical data for heat calendar (past 8 weeks)
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

    // Historical weeks (7 weeks back)
    for (let w = -7; w < 0; w++) {
      const weekDates = getWeekDates(w);
      for (let d = 0; d < 5; d++) { // only weekdays
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

    // Current week
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

      // Weekly avg for this member
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

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                backgroundColor: 'rgba(212,165,116,0.12)',
                border: '1px solid rgba(212,165,116,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Activity size={22} style={{ color: '#d4a574' }} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                  <span className="gradient-text">Steward Accountability Loops</span>
                </h1>
                <p style={{ fontSize: 13, color: '#a09888', margin: 0, marginTop: 2 }}>
                  Track morning commitments against end-of-day results. Build consistency across the steward team.
                </p>
              </div>
            </div>
          </div>

          {/* Member Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                backgroundColor: '#131720', border: '1px solid #1e2638',
                borderRadius: 14, padding: '10px 16px',
                cursor: 'pointer', minWidth: 220, transition: 'border-color 0.2s',
              }}
            >
              {selectedMemberObj && (
                <div
                  className={selectedMemberObj.color}
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                  }}
                >
                  {selectedMemberObj.avatar}
                </div>
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>{selectedMemberObj?.name}</p>
                <p style={{ fontSize: 11, color: '#6b6358', margin: 0 }}>{selectedMemberObj?.shortRole}</p>
              </div>
              <ChevronDown size={16} style={{
                color: '#6b6358', transition: 'transform 0.2s',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8, width: '100%',
                backgroundColor: '#131720', border: '1px solid #1e2638',
                borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                zIndex: 50, padding: 4, maxHeight: 280, overflowY: 'auto',
              }}>
                {activeMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMember(m.id); setDropdownOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10, border: 'none',
                      backgroundColor: m.id === selectedMember ? 'rgba(212,165,116,0.08)' : 'transparent',
                      cursor: 'pointer', transition: 'background-color 0.15s',
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
                      <p style={{ fontSize: 12, color: '#f0ebe4', margin: 0 }}>{m.name}</p>
                      <p style={{ fontSize: 10, color: '#6b6358', margin: 0 }}>{m.shortRole}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary Stats Bar ── */}
      <div className="animate-fade-in" style={{ animationDelay: '50ms', opacity: 0, marginBottom: 24 }}>
        <SummaryStatsBar
          streak={streak}
          completionRate={weeklyAvg}
          teamAvg={teamAvg}
          totalCompleted={totalCompleted}
          delay={80}
        />
      </div>

      {/* ── Score Ring + Streak + Heat Calendar Row ── */}
      <div
        className="animate-fade-in"
        style={{
          animationDelay: '120ms',
          opacity: 0,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 24,
          marginBottom: 28,
        }}
      >
        {/* Left: Score Ring */}
        <div style={{
          backgroundColor: '#131720', border: '1px solid #1e2638',
          borderRadius: 20, padding: '28px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <ScoreRing score={weeklyAvg} size={150} strokeWidth={12} label="This Week" />
        </div>

        {/* Right: Streak + Heat Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StreakCounter streak={streak} />

          {/* Heat Calendar */}
          <div style={{
            backgroundColor: '#131720', border: '1px solid #1e2638',
            borderRadius: 16, padding: '18px 22px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888' }}>
                  Streak Calendar
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, color: '#6b6358' }}>
                <span>Less</span>
                {['#1c2230', 'rgba(224,96,96,0.6)', '#e8b44c', 'rgba(107,143,113,0.6)', '#6b8f71'].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c }} />
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
        className="animate-fade-in"
        style={{
          animationDelay: '200ms',
          opacity: 0,
          backgroundColor: '#131720',
          border: '1px solid #1e2638',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
              Weekly Tracker
            </h3>
            <span style={{ fontSize: 11, color: '#6b6358' }}>
              {dayLabel(currentWeek[0])} &mdash; {dayLabel(currentWeek[6])}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, fontSize: 10, color: '#6b6358',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6b8f71' }} />
              100%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#e8b44c' }} />
              Partial
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#e06060' }} />
              Missed
            </span>
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
              delay={240 + i * 50}
            />
          ))}
        </div>

        {/* Week progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#6b6358' }}>Weekly Progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d4a574', fontVariantNumeric: 'tabular-nums' }}>
              {weeklyAvg}%
            </span>
          </div>
          <div style={{ height: 6, backgroundColor: '#1e2638', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${weeklyAvg}%`, borderRadius: 3,
              background: 'linear-gradient(90deg, #d4a574, #8b5cf6)',
              transition: 'width 1s ease-out',
            }} />
          </div>
        </div>
      </div>

      {/* ── Today's Commitments + Hit Rate Chart ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28,
      }}>
        {/* Today's Commitments */}
        <div
          className="animate-fade-in"
          style={{
            animationDelay: '300ms', opacity: 0,
            backgroundColor: '#131720', border: '1px solid #1e2638',
            borderRadius: 20, padding: '24px 28px',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
              Top 3 Today
            </h3>
            <span style={{ fontSize: 11, color: '#6b6358' }}>{dayLabel(today)}</span>
          </div>

          {/* Add commitment */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={newCommitment}
              onChange={(e) => setNewCommitment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCommitment()}
              placeholder="Add a commitment..."
              disabled={(todayEntry?.commitments.length ?? 0) >= 5}
              style={{
                flex: 1, backgroundColor: '#1c2230', border: '1px solid #1e2638',
                borderRadius: 10, padding: '10px 14px', fontSize: 13,
                color: '#f0ebe4', outline: 'none', transition: 'border-color 0.2s',
              }}
            />
            <button
              onClick={addCommitment}
              disabled={!newCommitment.trim() || (todayEntry?.commitments.length ?? 0) >= 5}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 42, height: 42, borderRadius: 10, border: 'none',
                backgroundColor: '#d4a574', color: '#0b0d14', cursor: 'pointer',
                opacity: !newCommitment.trim() || (todayEntry?.commitments.length ?? 0) >= 5 ? 0.4 : 1,
                transition: 'opacity 0.2s, background-color 0.2s',
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
                delay={350 + i * 60}
              />
            ))}
            {(!todayEntry || todayEntry.commitments.length === 0) && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '36px 20px', color: '#6b6358',
              }}>
                <Save size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p style={{ fontSize: 13, margin: 0 }}>No commitments yet for today</p>
                <p style={{ fontSize: 11, margin: '4px 0 0 0', opacity: 0.6 }}>Add your Top 3 priorities above</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Hit Rate Chart */}
        <div
          className="animate-fade-in"
          style={{
            animationDelay: '350ms', opacity: 0,
            backgroundColor: '#131720', border: '1px solid #1e2638',
            borderRadius: 20, padding: '24px 28px',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe4', margin: '0 0 20px 0' }}>
            Weekly Hit Rate
          </h3>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180, marginBottom: 16 }}>
            {currentWeek.map((date, i) => {
              const entry = memberData?.entries.find((e) => e.date === date);
              const rate = getHitRate(entry);
              const isToday = date === today;
              const barColor = rate >= 80
                ? 'linear-gradient(180deg, #6b8f71, #4a6f50)'
                : rate >= 50
                  ? 'linear-gradient(180deg, #e8b44c, #c99530)'
                  : rate > 0
                    ? 'linear-gradient(180deg, #e06060, #c04040)'
                    : '#1c2230';

              return (
                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: rate > 0 ? '#f0ebe4' : '#262e3e',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {rate > 0 ? `${rate}%` : ''}
                  </span>
                  <div style={{
                    width: '100%', height: 130,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    backgroundColor: '#0f1219', borderRadius: 10, overflow: 'hidden',
                  }}>
                    <div
                      className="animate-fade-in"
                      style={{
                        animationDelay: `${400 + i * 80}ms`, opacity: 0,
                        width: '100%', borderRadius: 10, background: barColor,
                        height: `${rate}%`, minHeight: rate > 0 ? 4 : 0,
                        transition: 'height 0.8s ease-out',
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: isToday ? 700 : 500,
                    color: isToday ? '#d4a574' : '#6b6358',
                  }}>
                    {weekdayShort(date)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Monthly Trend Sparkline */}
          <div style={{ borderTop: '1px solid #1e2638', paddingTop: 16 }}>
            <span style={{ fontSize: 11, color: '#6b6358', display: 'block', marginBottom: 10 }}>4-Week Trend</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {monthlyTrend.map((week, i) => {
                const isCurrentWeek = i === monthlyTrend.length - 1;
                const barColor = week.rate >= 80 ? '#6b8f71' : week.rate >= 50 ? '#e8b44c' : week.rate > 0 ? '#e06060' : '#1c2230';
                return (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10, color: isCurrentWeek ? '#d4a574' : '#6b6358',
                        fontWeight: isCurrentWeek ? 600 : 400,
                      }}>
                        {week.label}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: isCurrentWeek ? '#d4a574' : '#a09888',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {week.rate}%
                      </span>
                    </div>
                    <div style={{ height: 4, backgroundColor: '#1c2230', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${week.rate}%`,
                        backgroundColor: barColor, borderRadius: 2,
                        transition: 'width 0.8s ease',
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
        className="animate-fade-in"
        style={{ animationDelay: '450ms', opacity: 0, marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Users size={18} style={{ color: '#8b5cf6' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
            Individual Accountability
          </h3>
          <span style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#6b6358', backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 12, padding: '2px 10px', marginLeft: 4,
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
              delay={500 + i * 80}
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
          className="animate-fade-in"
          style={{
            animationDelay: '550ms', opacity: 0,
            backgroundColor: '#131720', border: '1px solid #1e2638',
            borderRadius: 20, padding: '24px 28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Trophy size={18} style={{ color: '#e8b44c' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
              Team Leaderboard
            </h3>
          </div>

          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 34px 1fr 50px 40px 60px',
            gap: 12, padding: '0 16px 10px',
            fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: '#6b6358',
            borderBottom: '1px solid #1e2638', marginBottom: 4,
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {leaderboard.map((row, i) => (
              <LeaderboardRow
                key={row.member.id}
                rank={i + 1}
                member={row.member}
                score={row.score}
                streak={row.streak}
                completed={row.completed}
                total={row.total}
                delay={600 + i * 80}
              />
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '32px 0', color: '#6b6358',
            }}>
              <Trophy size={24} style={{ opacity: 0.2, marginBottom: 8 }} />
              <span style={{ fontSize: 12 }}>No data yet</span>
            </div>
          )}
        </div>

        {/* This Week's Commitments History */}
        <div
          className="animate-fade-in"
          style={{
            animationDelay: '600ms', opacity: 0,
            backgroundColor: '#131720', border: '1px solid #1e2638',
            borderRadius: 20, padding: '24px 28px',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe4', margin: '0 0 16px 0' }}>
            This Week&apos;s History
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
            {currentWeek.map((date, dayIdx) => {
              const entry = memberData?.entries.find((e) => e.date === date);
              const isToday = date === today;
              if (!entry || entry.commitments.length === 0) return null;

              return (
                <div
                  key={date}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${650 + dayIdx * 60}ms`, opacity: 0,
                    borderRadius: 14,
                    border: `1px solid ${isToday ? 'rgba(212,165,116,0.25)' : '#1e2638'}`,
                    backgroundColor: isToday ? 'rgba(212,165,116,0.04)' : '#0f1219',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: isToday ? '#d4a574' : '#a09888',
                    }}>
                      {dayLabel(date)} {isToday && '(Today)'}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 10px', borderRadius: 10,
                      fontVariantNumeric: 'tabular-nums',
                      backgroundColor:
                        getHitRate(entry) >= 80 ? 'rgba(107,143,113,0.15)'
                          : getHitRate(entry) >= 50 ? 'rgba(232,180,76,0.15)'
                            : 'rgba(224,96,96,0.15)',
                      color:
                        getHitRate(entry) >= 80 ? '#6b8f71'
                          : getHitRate(entry) >= 50 ? '#e8b44c'
                            : '#e06060',
                    }}>
                      {getHitRate(entry)}%
                    </span>
                  </div>

                  {/* Completion bar */}
                  <div style={{
                    height: 3, backgroundColor: '#1e2638', borderRadius: 2,
                    overflow: 'hidden', marginBottom: 10,
                  }}>
                    <div style={{
                      height: '100%', width: `${getHitRate(entry)}%`,
                      backgroundColor:
                        getHitRate(entry) >= 80 ? '#6b8f71'
                          : getHitRate(entry) >= 50 ? '#e8b44c' : '#e06060',
                      borderRadius: 2, transition: 'width 0.6s ease',
                    }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {entry.commitments.map((c) => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {c.status === 'completed' && <CheckCircle2 size={13} style={{ color: '#6b8f71', flexShrink: 0 }} />}
                        {c.status === 'partial' && <MinusCircle size={13} style={{ color: '#e8b44c', flexShrink: 0 }} />}
                        {c.status === 'missed' && <XCircle size={13} style={{ color: '#e06060', flexShrink: 0 }} />}
                        {c.status === 'pending' && (
                          <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid #6b6358', flexShrink: 0 }} />
                        )}
                        <span style={{
                          fontSize: 12,
                          color: c.status === 'completed' ? '#a09888' : c.status === 'missed' ? '#e06060' : '#f0ebe4',
                          textDecoration: c.status === 'completed' ? 'line-through' : 'none',
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
