'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users, Target, Flame, Activity, ChevronUp, ChevronDown, Star, Zap, Award } from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { getMemberColor } from '@/lib/constants';
import type { TeamMember, Task, OKR } from '@/lib/data';

type TimeFilter = 'week' | 'month' | 'all';

interface MemberScore {
  member: TeamMember;
  score: number;
  tasksDone: number;
  tasksTotal: number;
  hasActiveTasks: boolean;
  // Category breakdown
  taskPoints: number;
  criticalBonus: number;
  okrPoints: number;
  blockedPenalty: number;
}

function computeScores(members: TeamMember[], tasks: Task[], okrs: OKR[]): MemberScore[] {
  return members.map((member) => {
    const my = tasks.filter((t) => t.owner === member.id);
    const done = my.filter((t) => t.status === 'done');
    const inProg = my.filter((t) => t.status === 'in-progress');
    const blocked = my.filter((t) => t.status === 'blocked');
    const critDone = done.filter((t) => t.priority === 'critical');
    let okrPts = 0;
    okrs.forEach((o) => o.keyResults.forEach((kr) => {
      if (kr.owner === member.id && kr.progress > 50) okrPts += 5;
    }));
    const taskPoints = done.length * 10 + inProg.length * 3;
    const criticalBonus = critDone.length * 5;
    const blockedPenalty = blocked.length * 5;
    const score = taskPoints + criticalBonus + okrPts - blockedPenalty;
    return {
      member,
      score: Math.max(0, score),
      tasksDone: done.length,
      tasksTotal: my.length,
      hasActiveTasks: inProg.length > 0,
      taskPoints,
      criticalBonus,
      okrPoints: okrPts,
      blockedPenalty,
    };
  });
}

const GOLD = '#d4a574', SILVER = '#94a3b8', BRONZE = '#cd7f32';
const podiumColor = (i: number) => i === 0 ? GOLD : i === 1 ? SILVER : BRONZE;

const card: React.CSSProperties = {
  backgroundColor: 'rgba(19, 23, 32, 0.8)',
  border: '1px solid rgba(30, 38, 56, 0.5)',
  borderRadius: 12,
};

const BOUNCY = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/* ------------------------------------------------------------------ */
/*  Inline <style> block with all keyframes + utility animations       */
/* ------------------------------------------------------------------ */
const globalCSS = `
@keyframes podiumRise {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes crownBounce {
  0%, 100% { transform: rotate(-5deg) scale(1); }
  50%      { transform: rotate(5deg) scale(1.12); }
}
@keyframes goldShimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes scoreCount {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1);   }
}
@keyframes rowSlideIn {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0);    }
}
@keyframes avatarPulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--pulse-color, rgba(212,165,116,0.5)); }
  50%      { box-shadow: 0 0 12px 4px var(--pulse-color, rgba(212,165,116,0.3)); }
}
@keyframes floatSparkle {
  0%   { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-28px) scale(0); opacity: 0; }
}
@keyframes progressRing {
  from { stroke-dashoffset: var(--ring-circumference, 251); }
  to   { stroke-dashoffset: var(--ring-offset, 0); }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes trophySpin {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25%      { transform: rotate(-8deg) scale(1.08); }
  75%      { transform: rotate(8deg) scale(1.08); }
}
@keyframes pulseGlow {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
@keyframes shimmerBar {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes slideIndicator {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes statCountUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes engagementPulse {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50%      { transform: scale(1.04); filter: brightness(1.2); }
}
@keyframes sparklineWave {
  0%   { d: path("M0 20 Q10 18, 20 15 Q30 12, 40 10 Q50 8, 60 12 Q70 16, 80 14 Q90 10, 100 8"); }
  50%  { d: path("M0 18 Q10 14, 20 12 Q30 16, 40 8 Q50 12, 60 10 Q70 8, 80 16 Q90 12, 100 10"); }
  100% { d: path("M0 20 Q10 18, 20 15 Q30 12, 40 10 Q50 8, 60 12 Q70 16, 80 14 Q90 10, 100 8"); }
}
@keyframes barGrowX {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes podiumGlowPulse {
  0%, 100% { box-shadow: 0 0 20px var(--podium-glow, rgba(212,165,116,0.15)); }
  50%      { box-shadow: 0 0 40px var(--podium-glow, rgba(212,165,116,0.25)); }
}
@keyframes rankBadgePop {
  from { transform: scale(0) rotate(-180deg); }
  to   { transform: scale(1) rotate(0deg); }
}
@keyframes medalSwing {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(6deg); }
  75% { transform: rotate(-6deg); }
}
@keyframes rankSlideUp {
  from { transform: translateY(8px); opacity: 0.5; }
  to   { transform: translateY(0);   opacity: 1; }
}
@keyframes rankSlideDown {
  from { transform: translateY(-8px); opacity: 0.5; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes badgePop {
  0% { transform: scale(0) rotate(-15deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes spotlightCone {
  0%, 100% { opacity: 0.12; transform: scaleY(1); }
  50% { opacity: 0.22; transform: scaleY(1.05); }
}
@keyframes spotlightGlow {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.3; }
}
@keyframes filterTransition {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes badgeShine {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* Achievement badge styles */
.lb-achievement-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  animation: badgePop 0.5s ${BOUNCY} both;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.lb-achievement-badge::after {
  content: '';
  position: absolute;
  top: 0;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  animation: badgeShine 4s ease-in-out infinite;
}

/* Spotlight cone for #1 */
.lb-spotlight-cone {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 180px;
  background: linear-gradient(
    180deg,
    ${GOLD}20 0%,
    ${GOLD}08 40%,
    transparent 100%
  );
  clip-path: polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%);
  pointer-events: none;
  animation: spotlightCone 3s ease-in-out infinite;
  z-index: 0;
}

/* Spotlight circle glow */
.lb-spotlight-glow {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, ${GOLD}25, transparent 70%);
  pointer-events: none;
  animation: spotlightGlow 3s ease-in-out infinite;
  z-index: 0;
}

/* Rank change animation classes */
.lb-rank-up {
  animation: rankSlideUp 0.6s ${BOUNCY} both;
}
.lb-rank-down {
  animation: rankSlideDown 0.6s ${BOUNCY} both;
}

/* Mobile responsive table */
@media (max-width: 768px) {
  .lb-table-grid {
    grid-template-columns: 44px 1fr 60px 60px !important;
  }
  .lb-table-grid .lb-col-breakdown,
  .lb-table-grid .lb-col-status {
    display: none !important;
  }
  .lb-table-header-grid {
    grid-template-columns: 44px 1fr 60px 60px !important;
  }
  .lb-table-header-grid .lb-col-breakdown,
  .lb-table-header-grid .lb-col-status {
    display: none !important;
  }
  .lb-podium-container {
    gap: 12px !important;
  }
  .lb-podium-avatar-first {
    width: 56px !important;
    height: 56px !important;
    font-size: 18px !important;
  }
  .lb-podium-avatar-other {
    width: 44px !important;
    height: 44px !important;
    font-size: 14px !important;
  }
  .lb-stat-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 480px) {
  .lb-table-grid {
    grid-template-columns: 36px 1fr 50px !important;
  }
  .lb-table-grid .lb-col-tasks {
    display: none !important;
  }
  .lb-table-header-grid {
    grid-template-columns: 36px 1fr 50px !important;
  }
  .lb-table-header-grid .lb-col-tasks {
    display: none !important;
  }
  .lb-filter-container {
    flex-wrap: wrap !important;
  }
}

/* Background dot pattern */
.lb-bg-pattern {
  background-image: radial-gradient(rgba(212,165,116,0.04) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Row hover effects */
.lb-row-hover {
  position: relative;
  transition: all 0.25s ${BOUNCY};
}
.lb-row-hover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  transition: background 0.25s ease;
  pointer-events: none;
  border-radius: 0;
}
.lb-row-hover:hover::before {
  background: linear-gradient(90deg, rgba(212,165,116,0.06) 0%, rgba(212,165,116,0.02) 100%);
}
.lb-row-hover:hover {
  transform: translateX(-2px);
  box-shadow: inset 3px 0 0 0 rgba(212,165,116,0.3);
}

/* Score bar shimmer */
.lb-score-bar {
  position: relative;
  overflow: hidden;
}
.lb-score-bar::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: shimmerBar 3s ease-in-out infinite;
}

/* Filter button effects */
.lb-filter-btn {
  position: relative;
  transition: all 0.25s ${BOUNCY};
}
.lb-filter-btn:hover {
  transform: translateY(-1px);
}
.lb-filter-btn-active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 20%; right: 20%;
  height: 2px;
  background: ${GOLD};
  border-radius: 1px;
  animation: slideIndicator 0.3s ${BOUNCY} forwards;
}

/* Stat card glassmorphism */
.lb-stat-card {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ${BOUNCY};
}
.lb-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
}
.lb-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  border-color: rgba(212,165,116,0.15);
}

/* Podium card hover */
.lb-podium-card {
  transition: transform 0.3s ${BOUNCY}, box-shadow 0.3s ease;
}
.lb-podium-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 40px var(--podium-glow, rgba(0,0,0,0.3));
}

/* Score breakdown tooltip */
.lb-breakdown-tooltip {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s, transform 0.2s;
}
.lb-row-hover:hover .lb-breakdown-tooltip {
  opacity: 1;
  transform: translateY(4px);
  pointer-events: auto;
}
`;

/* ------------------------------------------------------------------ */
/*  Sparkle / particle component for #1                                */
/* ------------------------------------------------------------------ */
function GoldSparkles() {
  const particles = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: 15 + Math.random() * 70,
      delay: Math.random() * 2.5,
      size: 3 + Math.random() * 3,
      duration: 1.2 + Math.random() * 1,
    })), []);

  return (
    <div style={{ position: 'absolute', inset: -8, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          bottom: '20%',
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          backgroundColor: GOLD,
          animation: `floatSparkle ${p.duration}s ease-out ${p.delay}s infinite`,
          opacity: 0.8,
          boxShadow: `0 0 4px ${GOLD}`,
        }} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AnimatedNumber: count-up effect                                    */
/* ------------------------------------------------------------------ */
function AnimatedNumber({ value, duration = 1200, style }: { value: number; duration?: number; style?: React.CSSProperties }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = value;
    const step = (ts: number) => {
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);

  return <span style={style}>{display}</span>;
}

/* ------------------------------------------------------------------ */
/*  Circular progress ring for stat cards                              */
/* ------------------------------------------------------------------ */
function CircularProgress({ value, color, size = 36 }: { value: number; color: string; size?: number }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(30,38,56,0.6)" strokeWidth={3} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={3} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          ['--ring-circumference' as string]: circ,
          ['--ring-offset' as string]: offset,
          animation: `progressRing 1.5s ${BOUNCY} forwards`,
          transition: 'stroke-dashoffset 1s ease',
        } as React.CSSProperties}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini Sparkline SVG decoration                                      */
/* ------------------------------------------------------------------ */
function MiniSparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 28" style={{ width: 80, height: 22, opacity: 0.25, flexShrink: 0 }}>
      <defs>
        <linearGradient id={`sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 20 Q10 18, 20 15 Q30 12, 40 10 Q50 8, 60 12 Q70 16, 80 14 Q90 10, 100 8"
        fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
      />
      <path
        d="M0 20 Q10 18, 20 15 Q30 12, 40 10 Q50 8, 60 12 Q70 16, 80 14 Q90 10, 100 8 L100 28 L0 28 Z"
        fill={`url(#sp-${color.replace('#', '')})`}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Rank change indicator                                              */
/* ------------------------------------------------------------------ */
function RankChange({ rank }: { rank: number }) {
  // Deterministic pseudo-random based on rank for demo display
  const change = rank <= 2 ? 1 : rank === 3 ? 0 : rank % 3 === 0 ? -1 : rank % 2 === 0 ? 1 : 0;
  if (change === 0) return <span style={{ width: 16 }} />;
  return change > 0
    ? <ChevronUp size={13} style={{ color: '#4ade80', flexShrink: 0 }} />
    : <ChevronDown size={13} style={{ color: '#f87171', flexShrink: 0 }} />;
}

/* ------------------------------------------------------------------ */
/*  Achievement Badges                                                 */
/* ------------------------------------------------------------------ */
type BadgeType = 'top-performer' | 'most-improved' | 'consistent';

interface Badge {
  type: BadgeType;
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}

const BADGES: Record<BadgeType, Badge> = {
  'top-performer': {
    type: 'top-performer',
    label: 'Top Performer',
    color: '#d4a574',
    bg: 'rgba(212,165,116,0.15)',
    icon: Crown,
  },
  'most-improved': {
    type: 'most-improved',
    label: 'Most Improved',
    color: '#6b8f71',
    bg: 'rgba(107,143,113,0.15)',
    icon: TrendingUp,
  },
  'consistent': {
    type: 'consistent',
    label: 'Consistent',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.15)',
    icon: Target,
  },
};

function getAchievementBadges(ranked: MemberScore[]): Map<string, BadgeType[]> {
  const badgeMap = new Map<string, BadgeType[]>();

  ranked.forEach((entry, idx) => {
    const badges: BadgeType[] = [];

    // Top Performer: rank 1
    if (idx === 0 && entry.score > 0) {
      badges.push('top-performer');
    }

    // Most Improved: highest critical bonus relative to tasks (shows extra effort)
    if (entry.criticalBonus > 0 && entry.criticalBonus >= Math.max(...ranked.map(r => r.criticalBonus))) {
      badges.push('most-improved');
    }

    // Consistent: high completion rate (>= 60%) with multiple tasks
    if (entry.tasksTotal >= 3 && (entry.tasksDone / entry.tasksTotal) >= 0.6) {
      badges.push('consistent');
    }

    if (badges.length > 0) {
      badgeMap.set(entry.member.id, badges);
    }
  });

  return badgeMap;
}

function AchievementBadge({ type, delay = 0 }: { type: BadgeType; delay?: number }) {
  const badge = BADGES[type];
  const BadgeIcon = badge.icon;

  return (
    <span
      className="lb-achievement-badge"
      style={{
        color: badge.color,
        backgroundColor: badge.bg,
        border: `1px solid ${badge.color}30`,
        animationDelay: `${delay}s`,
      }}
    >
      <BadgeIcon size={9} />
      {badge.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Category Breakdown Bar                                       */
/* ------------------------------------------------------------------ */
function ScoreBreakdownBar({ entry, maxScore }: { entry: MemberScore; maxScore: number }) {
  const total = entry.score;
  if (total === 0) return null;

  const segments = [
    { value: entry.taskPoints, color: '#6b8f71', label: 'Tasks' },
    { value: entry.criticalBonus, color: '#d4a574', label: 'Critical' },
    { value: entry.okrPoints, color: '#8b5cf6', label: 'OKR' },
  ].filter(s => s.value > 0);

  const barWidthPct = (total / maxScore) * 100;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{
        height: 6, backgroundColor: 'rgba(30,38,56,0.6)', borderRadius: 3,
        overflow: 'hidden', display: 'flex',
        width: `${barWidthPct}%`,
        transformOrigin: 'left',
        animation: `barGrowX 0.8s ${BOUNCY} forwards`,
      }}>
        {segments.map((seg, i) => {
          const segPct = (seg.value / total) * 100;
          return (
            <div key={seg.label} style={{
              height: '100%',
              width: `${segPct}%`,
              backgroundColor: seg.color,
              opacity: 0.85,
              borderRight: i < segments.length - 1 ? '1px solid rgba(11,13,20,0.5)' : 'none',
            }} />
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export function LeaderboardView() {
  const { teamMembers, tasks, okrs, nodes } = useFrequencyData();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevRanks, setPrevRanks] = useState<Map<string, number>>(new Map());

  const handleFilterChange = (newFilter: TimeFilter) => {
    // Capture current ranks before transition
    const currentRanks = new Map<string, number>();
    ranked.forEach((entry, idx) => currentRanks.set(entry.member.id, idx));
    setPrevRanks(currentRanks);

    setIsTransitioning(true);
    setTimeFilter(newFilter);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const ranked = useMemo(() => {
    let filteredTasks = tasks;

    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (timeFilter === 'week') {
        cutoff.setDate(now.getDate() - 7);
      } else if (timeFilter === 'month') {
        cutoff.setDate(now.getDate() - 30);
      }
      filteredTasks = tasks.filter(t => {
        if (!t.deadline) return false;
        return new Date(t.deadline) >= cutoff;
      });
    }

    return computeScores(teamMembers, filteredTasks, okrs).sort((a, b) => b.score - a.score);
  }, [teamMembers, tasks, okrs, timeFilter]);
  const top3 = ranked.slice(0, 3);

  const maxScore = useMemo(() => Math.max(...ranked.map(r => r.score), 1), [ranked]);
  const badgeMap = useMemo(() => getAchievementBadges(ranked), [ranked]);

  const stats = useMemo(() => {
    const totalDone = ranked.reduce((s, r) => s + r.tasksDone, 0);
    const total = ranked.reduce((s, r) => s + r.tasksTotal, 0);
    const rate = total > 0 ? Math.round((totalDone / total) * 100) : 0;
    const active = ranked.filter((r) => r.hasActiveTasks).length;
    const eng = teamMembers.length > 0 ? Math.round((active / teamMembers.length) * 100) : 0;
    const sorted = [...nodes].sort((a, b) => b.progress - a.progress);
    const topNode = sorted.length > 0 ? sorted[0] : null;
    return { totalDone, rate, eng, topNode };
  }, [ranked, teamMembers, nodes]);

  const filters: { key: TimeFilter; label: string }[] = [
    { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }, { key: 'all', label: 'All Time' },
  ];

  // Track hovered row for expanded detail
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <>
      {/* Inject global keyframes */}
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />

      <div className="lb-bg-pattern" style={{
        display: 'flex', flexDirection: 'column', gap: 24,
        position: 'relative', minHeight: '100%',
      }}>

        {/* -- Header -- */}
        <div className="noise-overlay dot-pattern" style={{
          padding: '20px 0 12px',
          background: 'linear-gradient(180deg, rgba(212,165,116,0.04) 0%, transparent 100%)',
          borderRadius: '12px 12px 0 0',
          animation: 'fadeSlideUp 0.5s ease forwards',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ animation: 'trophySpin 3s ease-in-out infinite', display: 'inline-flex' }}>
              <Trophy size={26} style={{ color: GOLD, filter: `drop-shadow(0 0 6px ${GOLD}60)` }} />
            </div>
            <h1 className="text-glow" style={{
              fontSize: 28, fontWeight: 700, margin: 0,
              background: `linear-gradient(135deg, #f0ebe4, ${GOLD})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Leaderboard</h1>
          </div>
          <p style={{ fontSize: 13, color: '#a09888', margin: 0, letterSpacing: 0.3 }}>
            Team performance &amp; accountability
          </p>
        </div>

        {/* -- Time Filter -- */}
        <div className="lb-filter-container" style={{ display: 'flex', gap: 8, animation: 'fadeSlideUp 0.6s ease forwards' }}>
          {filters.map(({ key, label }) => {
            const on = timeFilter === key;
            return (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
                className={`lb-filter-btn ${on ? 'lb-filter-btn-active' : ''}`}
                style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: on ? `1px solid ${GOLD}50` : '1px solid rgba(30,38,56,0.5)',
                  backgroundColor: on ? 'rgba(212,165,116,0.12)' : 'rgba(19,23,32,0.8)',
                  color: on ? GOLD : '#a09888',
                  boxShadow: on ? `0 0 12px ${GOLD}15` : 'none',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >{label}</button>
            );
          })}
        </div>

        {/* -- Empty state -- */}
        {ranked.length === 0 && (
          <div style={{
            ...card,
            padding: '48px 24px',
            textAlign: 'center',
            color: '#6b6358',
            fontSize: 14,
            fontWeight: 500,
          }}>
            No team data available
          </div>
        )}

        {/* -- Podium (Top 3 with Enhanced Treatment) -- */}
        {top3.length >= 3 && (
          <div className="card-premium" style={{
            ...card, padding: '28px 24px 24px',
            background: 'linear-gradient(180deg, rgba(19,23,32,0.95) 0%, rgba(19,23,32,0.7) 100%)',
            position: 'relative', overflow: 'hidden',
            animation: 'fadeSlideUp 0.6s ease 0.1s both',
          }}>
            {/* Subtle radial glow behind podium */}
            <div style={{
              position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 400, height: 250, borderRadius: '50%',
              background: `radial-gradient(ellipse, ${GOLD}08 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, position: 'relative' }}>
              <div style={{ animation: 'crownBounce 2s ease-in-out infinite' }}>
                <Crown size={16} style={{ color: GOLD, filter: `drop-shadow(0 0 4px ${GOLD}80)` }} />
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: 1.5,
              }}>
                Top Performers
              </span>
            </div>

            <div className="lb-podium-container" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 20, flexWrap: 'wrap', position: 'relative' }}>
              {[1, 0, 2].map((idx, displayOrder) => {
                const e = top3[idx]; if (!e) return null;
                const c = podiumColor(idx);
                const first = idx === 0;
                const sz = first ? 72 : 56;
                const ph = first ? 80 : idx === 1 ? 56 : 44;
                // Podium rise: 2nd place first, then 1st, then 3rd
                const riseDelay = displayOrder === 0 ? '0.2s' : displayOrder === 1 ? '0.5s' : '0.35s';
                const memberBadges = badgeMap.get(e.member.id) || [];

                return (
                  <div key={e.member.id} className="lb-podium-card card-interactive" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    animation: `podiumRise 0.7s ${BOUNCY} ${riseDelay} both`,
                    position: 'relative',
                    padding: '16px 20px 0',
                    borderRadius: 16,
                    background: first
                      ? `linear-gradient(180deg, ${c}10, ${c}04)`
                      : 'transparent',
                    border: first ? `1px solid ${c}18` : '1px solid transparent',
                    ['--podium-glow' as string]: `${c}20`,
                  } as React.CSSProperties}>
                    {/* Spotlight cone effect for #1 */}
                    {first && <div className="lb-spotlight-cone" />}
                    {first && <div className="lb-spotlight-glow" />}
                    {/* Gold sparkles for #1 */}
                    {first && <GoldSparkles />}

                    <div style={{ position: 'relative', marginBottom: 12 }}>
                      {/* Warm glow ring for #1 */}
                      {first && (
                        <div style={{
                          position: 'absolute', inset: -8, borderRadius: '50%',
                          background: `radial-gradient(circle, ${GOLD}20 0%, transparent 70%)`,
                          animation: 'pulseGlow 2s ease-in-out infinite',
                        }} />
                      )}

                      {/* Avatar */}
                      <div style={{
                        width: sz, height: sz, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: first ? 22 : 16, fontWeight: 700, color: '#0b0d14',
                        backgroundColor: getMemberColor(e.member.color),
                        border: `3px solid ${c}70`,
                        boxShadow: `0 0 24px ${c}30`,
                        animation: `avatarPulse 2.5s ease-in-out infinite`,
                        ['--pulse-color' as string]: `${c}40`,
                      } as React.CSSProperties}>{e.member.avatar}</div>

                      {/* Rank badge */}
                      <div style={{
                        position: 'absolute', top: -4, right: -6,
                        width: 24, height: 24, borderRadius: '50%',
                        backgroundColor: c, color: '#0b0d14',
                        fontSize: 10, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 2px 10px ${c}50`,
                        border: '2px solid rgba(11,13,20,0.6)',
                        animation: `rankBadgePop 0.5s ${BOUNCY} ${parseFloat(riseDelay) + 0.3}s both`,
                      }}>
                        {first ? (
                          <Crown size={12} style={{ animation: 'crownBounce 2s ease-in-out infinite' }} />
                        ) : idx + 1}
                      </div>
                    </div>

                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4', marginBottom: 2 }}>
                      {e.member.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: 10, color: '#a09888', marginBottom: 8 }}>
                      {e.member.shortRole}
                    </span>

                    {/* Task completion mini-bar */}
                    <div style={{ width: '100%', maxWidth: 80, marginBottom: 8 }}>
                      <div style={{
                        height: 3, backgroundColor: 'rgba(30,38,56,0.6)', borderRadius: 2, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${e.tasksTotal > 0 ? (e.tasksDone / e.tasksTotal) * 100 : 0}%`,
                          backgroundColor: c,
                          borderRadius: 2,
                          transition: 'width 1s ease',
                          opacity: 0.7,
                        }} />
                      </div>
                      <div style={{ fontSize: 9, color: '#6b6358', textAlign: 'center', marginTop: 3 }}>
                        {e.tasksDone}/{e.tasksTotal} tasks
                      </div>
                    </div>

                    {/* Animated score */}
                    <div style={{ animation: `scoreCount 0.6s ${BOUNCY} ${parseFloat(riseDelay) + 0.3}s both`, position: 'relative', zIndex: 1 }}>
                      <AnimatedNumber
                        value={e.score}
                        duration={1400}
                        style={{
                          fontSize: first ? 30 : 22, fontWeight: 800, color: c,
                          fontVariantNumeric: 'tabular-nums',
                          textShadow: first ? `0 0 16px ${c}40` : `0 0 8px ${c}25`,
                        }}
                      />
                      <span style={{ fontSize: 10, color: `${c}90`, marginLeft: 2 }}>pts</span>
                    </div>

                    {/* Achievement badges */}
                    {memberBadges.length > 0 && (
                      <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center',
                        marginTop: 6, position: 'relative', zIndex: 1,
                      }}>
                        {memberBadges.map((bt, bi) => (
                          <AchievementBadge
                            key={bt}
                            type={bt}
                            delay={parseFloat(riseDelay) + 0.5 + bi * 0.15}
                          />
                        ))}
                      </div>
                    )}

                    {/* Podium pillar */}
                    <div style={{
                      width: first ? 84 : 68, height: ph,
                      borderRadius: '10px 10px 0 0', marginTop: 10,
                      background: `linear-gradient(to top, ${c}08, ${c}20)`,
                      border: `1px solid ${c}18`, borderBottom: 'none',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {/* Shimmer on podium */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(180deg, ${c}10 0%, transparent 50%, ${c}05 100%)`,
                      }} />
                      {/* Rank number on pillar */}
                      <div style={{
                        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                        fontSize: 20, fontWeight: 800, color: `${c}30`,
                      }}>
                        {idx + 1}
                      </div>
                      {first && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                          background: `linear-gradient(90deg, transparent, ${c}60, transparent)`,
                          backgroundSize: '200% 100%',
                          animation: 'goldShimmer 3s linear infinite',
                        }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -- Score Category Legend -- */}
        <div style={{
          display: 'flex', gap: 16, flexWrap: 'wrap',
          animation: 'fadeSlideUp 0.6s ease 0.25s both',
        }}>
          {[
            { color: '#6b8f71', label: 'Task Points' },
            { color: '#d4a574', label: 'Critical Bonus' },
            { color: '#8b5cf6', label: 'OKR Points' },
            { color: '#f87171', label: 'Blocked Penalty', dash: true },
          ].map(seg => (
            <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10, height: 10, borderRadius: 3,
                backgroundColor: seg.dash ? 'transparent' : seg.color,
                border: seg.dash ? `2px dashed ${seg.color}` : 'none',
                boxShadow: seg.dash ? 'none' : `0 0 4px ${seg.color}40`,
              }} />
              <span style={{ fontSize: 10, color: '#a09888', fontWeight: 500 }}>{seg.label}</span>
            </div>
          ))}
        </div>

        {/* -- Ranked Table -- */}
        <div className="card-premium" style={{
          ...card, overflow: 'hidden',
          animation: 'fadeSlideUp 0.7s ease 0.3s both',
        }}>
          <div className="scrollbar-autohide" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as const }}>
          <div style={{ minWidth: 520 }}>

          {/* Table header */}
          <div className="lb-table-header-grid" style={{
            display: 'grid', gridTemplateColumns: '52px 1fr 80px 140px 100px 80px', padding: '12px 16px',
            borderBottom: '1px solid rgba(30,38,56,0.5)', fontSize: 10, fontWeight: 700, color: '#a09888',
            textTransform: 'uppercase', letterSpacing: 0.8,
            background: 'linear-gradient(180deg, rgba(212,165,116,0.03) 0%, transparent 100%)',
          }}>
            <span>Rank</span><span>Member</span>
            <span style={{ textAlign: 'right' }}>Score</span>
            <span className="lb-col-breakdown" style={{ textAlign: 'center' }}>Score Breakdown</span>
            <span className="lb-col-tasks" style={{ textAlign: 'center' }}>Tasks</span>
            <span className="lb-col-status" style={{ textAlign: 'center' }}>Status</span>
          </div>

          {ranked.map((entry, i) => {
            const rank = i + 1;
            const t3 = rank <= 3;
            const rc = rank === 1 ? GOLD : rank === 2 ? SILVER : rank === 3 ? BRONZE : '#a09888';
            const pct = entry.tasksTotal > 0 ? Math.round((entry.tasksDone / entry.tasksTotal) * 100) : 0;
            const scorePct = Math.round((entry.score / maxScore) * 100);
            const isHovered = hoveredRow === entry.member.id;
            const memberBadges = badgeMap.get(entry.member.id) || [];

            // Rank change animation
            const prevRank = prevRanks.get(entry.member.id);
            const rankChanged = prevRank !== undefined && prevRank !== i;
            const movedUp = prevRank !== undefined && prevRank > i;
            const rankAnimClass = isTransitioning && rankChanged
              ? (movedUp ? 'lb-rank-up' : 'lb-rank-down')
              : '';

            return (
              <div
                key={entry.member.id}
                className={`lb-row-hover lb-table-grid ${rankAnimClass}`}
                style={{
                  display: 'grid', gridTemplateColumns: '52px 1fr 80px 140px 100px 80px', alignItems: 'center',
                  padding: '14px 16px', borderBottom: '1px solid rgba(30,38,56,0.3)',
                  animation: isTransitioning
                    ? `filterTransition 0.4s cubic-bezier(0.4,0,0.2,1) ${i * 0.04}s both`
                    : `rowSlideIn 0.4s ${BOUNCY} ${0.15 + i * 0.06}s both`,
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: t3 ? `${rc}04` : 'transparent',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={() => setHoveredRow(entry.member.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Score bar background */}
                <div className="lb-score-bar" style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: `${scorePct}%`,
                  background: `linear-gradient(90deg, ${rc}06, ${rc}03)`,
                  pointerEvents: 'none',
                  transition: 'width 0.8s ease',
                }} />

                {/* Rank badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', gap: 2 }}>
                  {rank === 1 ? (
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `linear-gradient(135deg, ${GOLD}25, ${GOLD}10)`,
                      border: `1px solid ${GOLD}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Crown size={16} style={{ color: GOLD, filter: `drop-shadow(0 0 3px ${GOLD}60)` }} />
                    </div>
                  ) : rank === 2 ? (
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `linear-gradient(135deg, ${SILVER}20, ${SILVER}08)`,
                      border: `1px solid ${SILVER}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Medal size={15} style={{ color: SILVER, filter: `drop-shadow(0 0 3px ${SILVER}40)`, animation: 'medalSwing 3s ease-in-out infinite' }} />
                    </div>
                  ) : rank === 3 ? (
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `linear-gradient(135deg, ${BRONZE}20, ${BRONZE}08)`,
                      border: `1px solid ${BRONZE}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Medal size={15} style={{ color: BRONZE, filter: `drop-shadow(0 0 3px ${BRONZE}40)`, animation: 'medalSwing 3s ease-in-out 0.5s infinite' }} />
                    </div>
                  ) : (
                    <span style={{
                      fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                      color: '#a09888',
                      width: 28, height: 28, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: 'rgba(30,38,56,0.5)',
                      border: '1px solid rgba(30,38,56,0.8)',
                    }}>{rank}</span>
                  )}
                  <RankChange rank={rank} />
                </div>

                {/* Avatar + Name + Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, position: 'relative' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#0b0d14',
                    backgroundColor: getMemberColor(entry.member.color),
                    flexShrink: 0,
                    border: t3 ? `2px solid ${rc}50` : '2px solid rgba(30,38,56,0.5)',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    boxShadow: isHovered ? `0 0 12px ${rc}30` : 'none',
                  }}>{entry.member.avatar}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: t3 ? '#f0ebe4' : '#e0dbd4',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        transition: 'color 0.2s ease',
                      }}>
                        {entry.member.name}
                      </div>
                      {/* Achievement badges inline */}
                      {memberBadges.slice(0, 2).map((bt, bi) => (
                        <AchievementBadge
                          key={bt}
                          type={bt}
                          delay={0.3 + i * 0.06 + bi * 0.1}
                        />
                      ))}
                    </div>
                    <div style={{
                      fontSize: 11, color: '#a09888',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {entry.member.shortRole}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right', position: 'relative' }}>
                  <span style={{
                    fontSize: 18, fontWeight: 800,
                    color: t3 ? rc : '#f0ebe4',
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: t3 ? `0 0 8px ${rc}25` : 'none',
                  }}>{entry.score}</span>
                  <span style={{ fontSize: 9, color: `${rc}70`, marginLeft: 2 }}>pts</span>
                </div>

                {/* Score Breakdown Bar */}
                <div className="lb-col-breakdown" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0 8px' }}>
                  <ScoreBreakdownBar entry={entry} maxScore={maxScore} />
                </div>

                {/* Tasks progress */}
                <div className="lb-col-tasks" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                  <span style={{ fontSize: 11, color: '#f0ebe4', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                    {entry.tasksDone} / {entry.tasksTotal}
                  </span>
                  <div style={{
                    width: '100%', height: 4, borderRadius: 2,
                    backgroundColor: 'rgba(30,38,56,0.8)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 2,
                      transition: `width 0.8s ${BOUNCY}`,
                      backgroundColor: pct >= 60 ? '#6b8f71' : pct >= 30 ? GOLD : '#a09888',
                      boxShadow: pct >= 60 ? '0 0 4px rgba(107,143,113,0.4)' : 'none',
                    }} />
                  </div>
                </div>

                {/* Activity status */}
                <div className="lb-col-status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative' }}>
                  {entry.hasActiveTasks
                    ? <><Flame size={13} style={{ color: '#6b8f71', filter: 'drop-shadow(0 0 3px rgba(107,143,113,0.5))' }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b8f71' }}>Active</span></>
                    : <><Activity size={13} style={{ color: '#a09888' }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#a09888' }}>Quiet</span></>}
                </div>
              </div>
            );
          })}

          </div>
          </div>
        </div>

        {/* -- Team Stats -- */}
        <div className="lb-stat-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 12,
          animation: 'fadeSlideUp 0.8s ease 0.5s both',
        }}>
          {/* Tasks Completed */}
          <div className="lb-stat-card card-stat" style={{
            ...card, padding: 16,
            background: 'linear-gradient(135deg, rgba(19,23,32,0.85) 0%, rgba(19,23,32,0.65) 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={14} style={{ color: '#6b8f71' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#a09888', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Tasks Completed
                </span>
              </div>
              <MiniSparkline color="#6b8f71" />
            </div>
            <div style={{ animation: 'statCountUp 0.5s ease 0.7s both' }}>
              <AnimatedNumber
                value={stats.totalDone}
                duration={1600}
                style={{ fontSize: 28, fontWeight: 700, color: '#6b8f71', fontVariantNumeric: 'tabular-nums' }}
              />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="lb-stat-card card-stat" style={{
            ...card, padding: 16,
            background: 'linear-gradient(135deg, rgba(19,23,32,0.85) 0%, rgba(19,23,32,0.65) 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={14} style={{ color: GOLD }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#a09888', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Completion Rate
                </span>
              </div>
              <CircularProgress value={stats.rate} color={GOLD} />
            </div>
            <div style={{ animation: 'statCountUp 0.5s ease 0.8s both' }}>
              <AnimatedNumber
                value={stats.rate}
                duration={1600}
                style={{ fontSize: 28, fontWeight: 700, color: GOLD, fontVariantNumeric: 'tabular-nums' }}
              />
              <span style={{ fontSize: 16, fontWeight: 600, color: `${GOLD}90`, marginLeft: 1 }}>%</span>
            </div>
          </div>

          {/* Most Active Node */}
          <div className="lb-stat-card card-stat" style={{
            ...card, padding: 16,
            background: 'linear-gradient(135deg, rgba(19,23,32,0.85) 0%, rgba(19,23,32,0.65) 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#a09888', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Most Active Node
                </span>
              </div>
              <MiniSparkline color="#8b5cf6" />
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, color: '#8b5cf6', fontVariantNumeric: 'tabular-nums',
              animation: 'statCountUp 0.5s ease 0.9s both',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {stats.topNode?.shortName ?? '--'}
            </div>
          </div>

          {/* Engagement */}
          <div className="lb-stat-card card-stat" style={{
            ...card, padding: 16,
            background: 'linear-gradient(135deg, rgba(19,23,32,0.85) 0%, rgba(19,23,32,0.65) 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#a09888', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Engagement
                </span>
              </div>
              <CircularProgress value={stats.eng} color="#38bdf8" />
            </div>
            <div style={{ animation: 'engagementPulse 3s ease-in-out infinite' }}>
              <AnimatedNumber
                value={stats.eng}
                duration={1600}
                style={{ fontSize: 28, fontWeight: 700, color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}
              />
              <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(56,189,248,0.6)', marginLeft: 1 }}>%</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
