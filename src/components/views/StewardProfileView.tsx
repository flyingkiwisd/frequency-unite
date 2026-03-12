'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  User,
  Target,
  CheckSquare,
  Briefcase,
  Clock,
  Shield,
  ChevronRight,
  Flame,
  Sparkles,
  AlertCircle,
  Calendar,
  Zap,
  Plus,
  MessageCircle,
  ListTodo,
  Check,
  Activity,
  TrendingUp,
  Award,
  Star,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { tailwindColorMap } from '@/lib/constants';
import type { Task, OKR } from '@/lib/data';
import { InlineAdvisor } from '@/components/InlineAdvisor';

// ----------------------------------------------------------------
//  DESIGN TOKENS
// ----------------------------------------------------------------
const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const BG_GLASS = 'rgba(19,23,32,0.7)';
const BG_CARD = 'rgba(19,23,32,0.6)';
const BORDER_GLASS = 'rgba(212,165,116,0.08)';
const BORDER_SUBTLE = 'rgba(30,38,56,0.5)';
const CREAM = '#f0ebe4';
const MUTED = '#a09888';
const DIM = '#6b6358';
const GOLD = '#d4a574';
const PURPLE = '#8b5cf6';
const GREEN = '#6b8f71';

// ----------------------------------------------------------------
//  STATUS / PRIORITY CONFIGS
// ----------------------------------------------------------------
const STATUS_CYCLE: Task['status'][] = ['todo', 'in-progress', 'done'];
const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  'todo':        { bg: 'rgba(107,99,88,0.15)',   text: '#6b6358', label: 'To Do' },
  'in-progress': { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b', label: 'In Progress' },
  'done':        { bg: 'rgba(107,143,113,0.15)',  text: '#6b8f71', label: 'Done' },
  'blocked':     { bg: 'rgba(239,68,68,0.12)',    text: '#f87171', label: 'Blocked' },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  'critical': { bg: 'rgba(239,68,68,0.12)',   text: '#f87171' },
  'high':     { bg: 'rgba(251,146,60,0.12)',   text: '#fb923c' },
  'medium':   { bg: 'rgba(212,165,116,0.12)',  text: '#d4a574' },
  'low':      { bg: 'rgba(160,152,136,0.12)',  text: '#a09888' },
};

const OKR_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  'on-track': { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80', label: 'On Track' },
  'at-risk':  { bg: 'rgba(245,158,11,0.12)',   text: '#fbbf24', label: 'At Risk' },
  'behind':   { bg: 'rgba(239,68,68,0.12)',    text: '#f87171', label: 'Behind' },
};

// ----------------------------------------------------------------
//  HELPERS
// ----------------------------------------------------------------
function daysUntil(dateStr: string): number | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) {
    const parsed = Date.parse(dateStr);
    if (isNaN(parsed)) return null;
    return Math.ceil((parsed - now.getTime()) / 86400000);
  }
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ----------------------------------------------------------------
//  ANIMATED COUNT-UP HOOK
// ----------------------------------------------------------------
function useCountUp(target: number, duration = 1200): number {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf: number;
    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(start + diff * eased);
      setVal(current);
      if (t < 1) raf = requestAnimationFrame(step);
      else prev.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

// ----------------------------------------------------------------
//  SEMICIRCULAR GAUGE COMPONENT
// ----------------------------------------------------------------
function CapacityGauge({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.min(current / max, 1);
  const R = 70;
  const STROKE = 10;
  const circumHalf = Math.PI * R;
  const offset = circumHalf * (1 - pct);
  // Zone colors
  const zoneColor = pct < 0.5 ? '#4ade80' : pct < 0.8 ? '#fbbf24' : '#f87171';

  return (
    <div style={{ position: 'relative', width: 160, height: 90, margin: '0 auto' }}>
      <svg viewBox="0 0 160 90" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Background track */}
        <path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          stroke="rgba(160,152,136,0.1)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {/* Zone indicators - green/yellow/red thirds */}
        <defs>
          <linearGradient id="sp-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {/* Active fill */}
        <path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          stroke={zoneColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${circumHalf}`}
          strokeDashoffset={offset}
          style={{
            transition: `stroke-dashoffset 1.2s ${EASE}, stroke 0.6s ease`,
            filter: `drop-shadow(0 0 6px ${zoneColor}44)`,
          }}
        />
        {/* Needle */}
        {(() => {
          const angle = Math.PI * pct; // 0 = left, PI = right
          const nx = 80 - Math.cos(angle) * 50;
          const ny = 80 - Math.sin(angle) * 50;
          return (
            <line
              x1="80" y1="80" x2={nx} y2={ny}
              stroke={CREAM}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ transition: `all 1s ${EASE}`, filter: 'drop-shadow(0 0 3px rgba(240,235,228,0.3))' }}
            />
          );
        })()}
        {/* Center dot */}
        <circle cx="80" cy="80" r="4" fill={zoneColor} style={{ transition: `fill 0.6s ease` }} />
      </svg>
      <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: zoneColor, transition: 'color 0.6s ease' }}>
          {current}
        </span>
        <span style={{ fontSize: 12, color: DIM }}>/{max} hrs</span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
//  PROGRESS RING COMPONENT
// ----------------------------------------------------------------
function ProgressRing({ progress, size = 44, stroke = 4, color = GOLD }: { progress: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - progress / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(160,152,136,0.1)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
        style={{ transition: `stroke-dashoffset 1.2s ${EASE}`, filter: `drop-shadow(0 0 4px ${color}44)` }}
      />
    </svg>
  );
}

// ----------------------------------------------------------------
//  SCOPED KEYFRAMES
// ----------------------------------------------------------------
const SP_KEYFRAMES = `
@keyframes sp-heroEnter {
  0% { opacity:0; transform:translateY(24px) scale(0.97); }
  100% { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes sp-cardStagger {
  0% { opacity:0; transform:translateY(20px); }
  100% { opacity:1; transform:translateY(0); }
}
@keyframes sp-avatarRing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes sp-avatarGlow {
  0%,100% { box-shadow: 0 0 20px var(--sp-hex)33, 0 0 40px var(--sp-hex)11; }
  50% { box-shadow: 0 0 35px var(--sp-hex)55, 0 0 70px var(--sp-hex)22; }
}
@keyframes sp-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes sp-fadeSlide {
  0% { opacity:0; transform:translateX(-8px); }
  100% { opacity:1; transform:translateX(0); }
}
@keyframes sp-progressFill {
  0% { width: 0; }
}
@keyframes sp-pulseRing {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 0.6; }
}
@keyframes sp-checkPop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes sp-timelineDot {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.sp-card {
  animation: sp-cardStagger 0.55s ${EASE} both;
}
.sp-card:nth-child(1) { animation-delay: 0s; }
.sp-card:nth-child(2) { animation-delay: 0.06s; }
.sp-card:nth-child(3) { animation-delay: 0.12s; }
.sp-card:nth-child(4) { animation-delay: 0.15s; }
.sp-card:nth-child(5) { animation-delay: 0.18s; }
.sp-card:nth-child(6) { animation-delay: 0.21s; }
.sp-card:nth-child(7) { animation-delay: 0.24s; }
.sp-card:nth-child(8) { animation-delay: 0.27s; }
.sp-card:nth-child(9) { animation-delay: 0.30s; }
.sp-card:nth-child(10) { animation-delay: 0.33s; }

.sp-action:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.sp-action { transition: all 0.25s ${EASE}; }
.sp-task-row { transition: all 0.2s ease; }
.sp-task-row:hover { background: rgba(255,255,255,0.025); }
.sp-quick-btn { transition: all 0.25s ${EASE}; }
.sp-quick-btn:hover { transform: translateY(-1px); background: rgba(212,165,116,0.12) !important; border-color: rgba(212,165,116,0.25) !important; }
.sp-tag { transition: all 0.2s ease; }
.sp-tag:hover { transform: scale(1.08); }
.sp-timeline-item { animation: sp-fadeSlide 0.4s ${EASE} both; }
`;

// ----------------------------------------------------------------
//  GLASSMORPHISM CARD STYLE FACTORY
// ----------------------------------------------------------------
const glassCard = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '24px 28px',
  borderRadius: 16,
  background: BG_GLASS,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${BORDER_GLASS}`,
  ...extra,
});

// ================================================================
//  MAIN COMPONENT
// ================================================================
export function StewardProfileView({ memberId, onNavigate }: { memberId: string; onNavigate: (view: string) => void }) {
  const { teamMembers, tasks, okrs, events, updateTask, createTask } = useFrequencyData();

  const [flashId, setFlashId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [nonNegChecks, setNonNegChecks] = useState<Record<string, boolean>>({});

  const member = useMemo(() => teamMembers.find(m => m.id === memberId), [teamMembers, memberId]);
  const hex = member ? (tailwindColorMap[member.color] || '#d4a574') : '#d4a574';

  // Non-negotiable persistence
  useEffect(() => {
    if (!member) return;
    const key = `frequency-nonneg-${memberId}-${todayKey()}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) setNonNegChecks(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [memberId, member]);

  const toggleNonNeg = useCallback((idx: number) => {
    setNonNegChecks(prev => {
      const next = { ...prev, [idx]: !prev[idx] };
      const key = `frequency-nonneg-${memberId}-${todayKey()}`;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [memberId]);

  // ── Task derivations ──
  const myTasks = useMemo(() => tasks.filter(t => t.owner === memberId), [tasks, memberId]);
  const activeTasks = useMemo(() => myTasks.filter(t => t.status !== 'done'), [myTasks]);
  const criticalTasks = useMemo(() => activeTasks.filter(t => t.priority === 'critical'), [activeTasks]);
  const doneTasks = useMemo(() => myTasks.filter(t => t.status === 'done'), [myTasks]);
  const completionRate = myTasks.length > 0 ? Math.round((doneTasks.length / myTasks.length) * 100) : 0;

  const dailyFocus = useMemo(() =>
    myTasks.filter(t => t.status !== 'done' && (t.priority === 'critical' || t.status === 'in-progress')),
    [myTasks]
  );

  const activeCount = activeTasks.length;
  const loadColor = activeCount < 5 ? '#4ade80' : activeCount <= 8 ? '#f59e0b' : '#f87171';
  const loadPct = Math.min(100, Math.round((activeCount / 12) * 100));

  // ── OKR derivations ──
  const krsByOkr = useMemo(() => {
    const groups: { okr: OKR; krs: { text: string; progress: number; owner: string }[] }[] = [];
    okrs.forEach(okr => {
      const krs = okr.keyResults.filter(kr => kr.owner === memberId);
      if (krs.length > 0) groups.push({ okr, krs });
    });
    return groups;
  }, [okrs, memberId]);

  const totalKRs = krsByOkr.reduce((s, g) => s + g.krs.length, 0);
  const avgKRProgress = useMemo(() => {
    const all = krsByOkr.flatMap(g => g.krs);
    return all.length > 0 ? Math.round(all.reduce((s, k) => s + k.progress, 0) / all.length) : 0;
  }, [krsByOkr]);

  // ── Events ──
  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => (e.status === 'upcoming' || e.status === 'planning'))
      .map(e => ({ ...e, _days: daysUntil(e.date) }))
      .filter(e => e._days !== null && e._days >= 0 && e._days <= 30)
      .sort((a, b) => (a._days ?? 0) - (b._days ?? 0));
  }, [events]);

  // ── Streak (consecutive days with done tasks, simulated) ──
  const streakDays = useMemo(() => {
    // Compute from done task count as a proxy for consistency
    return Math.min(doneTasks.length * 2, 30);
  }, [doneTasks]);

  // ── Hours parsing ──
  const parsedHours = useMemo(() => {
    if (!member?.hoursPerWeek) return { current: 0, max: 40 };
    const match = member.hoursPerWeek.match(/(\d+)/g);
    if (!match) return { current: 0, max: 40 };
    if (match.length >= 2) return { current: parseInt(match[0]), max: parseInt(match[1]) };
    return { current: parseInt(match[0]), max: Math.max(40, parseInt(match[0]) + 10) };
  }, [member]);

  // ── Activity timeline (derive from tasks + events) ──
  const activityTimeline = useMemo(() => {
    const items: { id: string; type: 'task_done' | 'task_created' | 'event'; label: string; detail: string; color: string; timeAgo: string }[] = [];
    // Add done tasks
    doneTasks.slice(0, 4).forEach((t, i) => {
      items.push({
        id: `done-${t.id}`,
        type: 'task_done',
        label: 'Completed task',
        detail: t.title,
        color: '#4ade80',
        timeAgo: i === 0 ? 'Recently' : `${i + 1}d ago`,
      });
    });
    // Add in-progress tasks as recent activity
    myTasks.filter(t => t.status === 'in-progress').slice(0, 2).forEach((t, i) => {
      items.push({
        id: `active-${t.id}`,
        type: 'task_created',
        label: 'Working on',
        detail: t.title,
        color: '#f59e0b',
        timeAgo: 'Now',
      });
    });
    return items.slice(0, 5);
  }, [doneTasks, myTasks]);

  // ── Animated count-up values ──
  const animDone = useCountUp(doneTasks.length, 1000);
  const animOKR = useCountUp(avgKRProgress, 1200);
  const animStreak = useCountUp(streakDays, 900);
  const animCompletion = useCountUp(completionRate, 1100);

  // ── Callbacks ──
  const cycleStatus = useCallback(async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'blocked') return;
    const idx = STATUS_CYCLE.indexOf(task.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setFlashId(task.id);
    await updateTask(task.id, { status: next });
    setTimeout(() => setFlashId(null), 400);
  }, [updateTask]);

  const handleAddTask = useCallback(async () => {
    if (!newTitle.trim()) return;
    await createTask({
      title: newTitle.trim(),
      owner: memberId,
      status: 'todo',
      priority: newPriority,
      deadline: '',
      category: 'General',
    });
    setNewTitle('');
    setNewPriority('medium');
    setShowAddTask(false);
  }, [newTitle, newPriority, memberId, createTask]);

  // ── Not found state ──
  if (!member) {
    return (
      <div style={{
        maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '48px 32px',
        borderRadius: 20, background: BG_GLASS, backdropFilter: 'blur(20px)',
        border: `1px solid ${BORDER_SUBTLE}`,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
          background: 'rgba(160,152,136,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User style={{ width: 32, height: 32, color: DIM, opacity: 0.5 }} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: CREAM, margin: '0 0 8px' }}>
          Steward Not Found
        </h2>
        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0 }}>
          This steward profile could not be located. They may have been removed or the link may be invalid.
        </p>
      </div>
    );
  }

  // ── Status badge renderer ──
  const statusBadge = (task: Task) => {
    const s = STATUS_BADGE[task.status] || STATUS_BADGE['todo'];
    const flash = flashId === task.id;
    return (
      <span onClick={(e) => cycleStatus(task, e)} title="Click to cycle status" style={{
        padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, display: 'inline-block',
        background: s.bg, color: s.text, cursor: 'pointer',
        transition: `all 0.25s ${EASE}`,
        transform: flash ? 'scale(1.15)' : 'scale(1)',
        boxShadow: flash ? `0 0 8px ${s.text}44` : 'none',
      }}>{s.label}</span>
    );
  };

  // ── Non-negotiable completion count ──
  const nonNegTotal = member.nonNegotiables.length;
  const nonNegDone = Object.values(nonNegChecks).filter(Boolean).length;

  // ================================================================
  //  RENDER
  // ================================================================
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', ['--sp-hex' as string]: hex }}>
      <style>{SP_KEYFRAMES}</style>

      {/* ================================================================ */}
      {/*  1. PROFILE HERO                                                 */}
      {/* ================================================================ */}
      <div className="sp-card card-premium" style={{
        position: 'relative', padding: '36px 32px 32px', borderRadius: 20,
        background: BG_GLASS, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hex}22`, marginBottom: 20, overflow: 'hidden',
        animation: `sp-heroEnter 0.6s ${EASE} both`,
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${hex}, ${PURPLE}88, transparent)`,
        }} />
        <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          borderRadius: '50%', background: `radial-gradient(circle, ${hex}15, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          {/* Avatar with animated gradient ring + glow */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Animated gradient ring */}
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${hex}, ${PURPLE}, ${hex}88, ${hex})`,
              animation: 'sp-avatarRing 4s linear infinite',
              opacity: 0.8,
            }} />
            {/* Glow layer */}
            <div style={{
              position: 'absolute', inset: -8, borderRadius: '50%',
              animation: 'sp-avatarGlow 3s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
            {/* Avatar circle */}
            <div style={{
              position: 'relative', width: 80, height: 80, borderRadius: '50%',
              background: `linear-gradient(135deg, ${hex}, ${hex}cc)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800, color: 'white',
              border: '3px solid #0b0d14',
              zIndex: 1,
            }}>
              {member.avatar}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name with gradient text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h1 className="text-glow" style={{
                fontSize: 28, fontWeight: 800, margin: 0,
                background: `linear-gradient(135deg, ${CREAM}, ${hex})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {member.name}
              </h1>
              {/* Role badge */}
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.8px',
                background: `linear-gradient(135deg, ${hex}20, ${PURPLE}15)`,
                color: hex,
                border: `1px solid ${hex}30`,
                backdropFilter: 'blur(8px)',
              }}>
                {member.tier.replace('-', ' ')}
              </span>
            </div>

            {/* Role title */}
            <p style={{
              fontSize: 15, fontWeight: 600, margin: '0 0 8px',
              background: `linear-gradient(90deg, ${hex}, ${PURPLE}cc)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {member.role}
            </p>

            {/* Workload indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: loadColor, fontWeight: 600 }}>
                {activeCount} active task{activeCount !== 1 ? 's' : ''}
              </span>
              {criticalTasks.length > 0 && (
                <span style={{
                  padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                  background: 'rgba(239,68,68,0.12)', color: '#f87171',
                  animation: 'sp-pulseRing 2s ease-in-out infinite',
                }}>
                  {criticalTasks.length} critical
                </span>
              )}
              <div style={{
                flex: 1, maxWidth: 140, height: 4, borderRadius: 2,
                background: 'rgba(160,152,136,0.08)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: loadColor,
                  width: `${loadPct}%`, transition: `width 0.6s ${EASE}`,
                  boxShadow: `0 0 8px ${loadColor}44`,
                }} />
              </div>
            </div>

            {/* Bio */}
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 0 }}>{member.roleOneSentence}</p>
            {member.hoursPerWeek && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Clock style={{ width: 13, height: 13, color: DIM }} />
                <span style={{ fontSize: 12, color: DIM }}>{member.hoursPerWeek} hrs/week</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  2. STATS GRID — Animated count-up numbers                       */}
      {/* ================================================================ */}
      <div className="sp-card" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        marginBottom: 20,
      }}>
        {[
          { label: 'Tasks Done', value: animDone, suffix: '', icon: CheckSquare, color: '#4ade80', rawValue: doneTasks.length },
          { label: 'OKR Progress', value: animOKR, suffix: '%', icon: Target, color: GOLD, rawValue: avgKRProgress },
          { label: 'Completion', value: animCompletion, suffix: '%', icon: TrendingUp, color: '#60a5fa', rawValue: completionRate },
          { label: 'Streak Days', value: animStreak, suffix: '', icon: Flame, color: '#fb923c', rawValue: streakDays },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-stat" style={{
              ...glassCard({ padding: '20px 16px', textAlign: 'center' as const }),
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Subtle top accent */}
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
                background: `linear-gradient(90deg, transparent, ${stat.color}66, transparent)`,
                borderRadius: 1,
              }} />
              <div style={{
                width: 36, height: 36, borderRadius: 10, margin: '0 auto 10px',
                background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: 18, height: 18, color: stat.color }} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: CREAM, lineHeight: 1 }}>
                {stat.value}{stat.suffix}
              </div>
              <div style={{
                fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: '0.8px',
                marginTop: 6, fontWeight: 600,
              }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/*  3. CAPACITY GAUGE + QUICK ACTIONS (side by side)                */}
      {/* ================================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Capacity Gauge */}
        <div className="sp-card card-premium" style={glassCard()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock style={{ width: 15, height: 15, color: GOLD }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: CREAM, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Weekly Capacity
            </h3>
          </div>
          <CapacityGauge current={parsedHours.current} max={parsedHours.max} color={hex} />
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 16,
            padding: '10px 12px', borderRadius: 10, background: 'rgba(160,152,136,0.04)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: DIM, marginBottom: 2 }}>Active</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: loadColor }}>{activeCount}</div>
            </div>
            <div style={{ width: 1, background: 'rgba(160,152,136,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: DIM, marginBottom: 2 }}>Critical</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f87171' }}>{criticalTasks.length}</div>
            </div>
            <div style={{ width: 1, background: 'rgba(160,152,136,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: DIM, marginBottom: 2 }}>Done</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>{doneTasks.length}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="sp-card card-premium" style={glassCard({ display: 'flex', flexDirection: 'column' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap style={{ width: 15, height: 15, color: GOLD }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: CREAM, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Actions
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {([
              { label: 'Add Task', icon: Plus, color: GOLD, action: () => setShowAddTask(v => !v) },
              { label: 'Ask AI Advisor', icon: MessageCircle, color: PURPLE, action: () => onNavigate('advisor') },
              { label: 'View All Tasks', icon: ListTodo, color: '#60a5fa', action: () => onNavigate('tasks') },
              { label: 'View OKRs', icon: Target, color: '#4ade80', action: () => onNavigate('okrs') },
            ] as const).map(btn => {
              const Icon = btn.icon;
              return (
                <button key={btn.label} className="sp-quick-btn card-interactive" onClick={btn.action} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(19,23,32,0.5)', border: `1px solid ${BORDER_SUBTLE}`,
                  color: btn.color, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'left',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${btn.color}12`, flexShrink: 0,
                  }}>
                    <Icon style={{ width: 15, height: 15 }} />
                  </div>
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  INLINE ADD TASK FORM                                            */}
      {/* ================================================================ */}
      {showAddTask && (
        <div className="sp-card" style={{
          ...glassCard({ padding: '16px 20px', border: `1px solid rgba(212,165,116,0.2)` }),
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              placeholder="Task title..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(28,34,48,0.6)', border: `1px solid ${BORDER_SUBTLE}`,
                color: CREAM, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as Task['priority'])}
              style={{
                padding: '10px 12px', borderRadius: 10, fontSize: 12,
                background: 'rgba(28,34,48,0.6)', border: `1px solid ${BORDER_SUBTLE}`,
                color: GOLD, fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              {(['critical', 'high', 'medium', 'low'] as const).map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <button onClick={handleAddTask} style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: `linear-gradient(135deg, ${hex}30, ${hex}15)`, color: hex,
              border: `1px solid ${hex}33`, cursor: 'pointer', fontFamily: 'inherit',
              transition: `all 0.25s ${EASE}`,
            }}>
              Add
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  4. DAILY FOCUS                                                  */}
      {/* ================================================================ */}
      {dailyFocus.length > 0 && (
        <div className="sp-card card-premium" style={{
          ...glassCard({ border: `1px solid ${hex}15` }),
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${hex}15`,
              }}>
                <Flame style={{ width: 15, height: 15, color: hex }} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: CREAM, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {"Today's Focus"}
              </h3>
            </div>
            <span style={{
              fontSize: 11, color: DIM, padding: '4px 10px', borderRadius: 8,
              background: 'rgba(160,152,136,0.06)',
            }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          {dailyFocus.map(task => (
            <div key={task.id} className="sp-task-row card-interactive" style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              borderRadius: 12, marginBottom: 4,
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); updateTask(task.id, { status: 'done' }); }}
                title="Mark done"
                style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer', padding: 0,
                  background: 'rgba(160,152,136,0.08)', border: '1px solid rgba(107,99,88,0.27)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'transparent',
                  transition: `all 0.2s ${EASE}`,
                }}
              >
                <Check style={{ width: 12, height: 12 }} />
              </button>
              <span style={{
                fontSize: 13, color: CREAM, flex: 1, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {task.title}
              </span>
              <span style={{
                padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: priorityColors[task.priority]?.bg, color: priorityColors[task.priority]?.text,
              }}>
                {task.priority}
              </span>
              {statusBadge(task)}
            </div>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/*  5. CRITICAL TASKS — Action Required                             */}
      {/* ================================================================ */}
      {criticalTasks.length > 0 && (
        <div className="sp-card card-premium" style={{
          ...glassCard({
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.15)',
            backdropFilter: 'blur(20px)',
          }),
          marginBottom: 20, position: 'relative', overflow: 'hidden',
        }}>
          {/* Red accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, #f87171, #ef4444, transparent)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(239,68,68,0.12)',
            }}>
              <AlertCircle style={{ width: 15, height: 15, color: '#f87171' }} />
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Action Required — {criticalTasks.length} Critical
            </h3>
          </div>
          {criticalTasks.map(task => (
            <div key={task.id} className="sp-task-row card-interactive" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px', borderRadius: 12, marginBottom: 6, background: 'rgba(19,23,32,0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 6px #f8717144' }} />
                <span style={{ fontSize: 13, color: CREAM }}>{task.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {task.deadline && (() => {
                  const d = daysUntil(task.deadline);
                  return (
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                      background: d !== null && d <= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(160,152,136,0.08)',
                      color: d !== null && d <= 3 ? '#f87171' : DIM,
                    }}>
                      {d !== null && d >= 0 ? `${d}d left` : task.deadline}
                    </span>
                  );
                })()}
                {statusBadge(task)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/*  6. ACTIVE TASKS — Mini task cards with priority & due date      */}
      {/* ================================================================ */}
      <div className="sp-card card-premium" style={{ ...glassCard(), marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${GOLD}12`,
            }}>
              <CheckSquare style={{ width: 15, height: 15, color: GOLD }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: CREAM, margin: 0 }}>My Tasks</h3>
            <span style={{
              fontSize: 11, color: DIM, padding: '2px 8px', borderRadius: 6,
              background: 'rgba(160,152,136,0.06)',
            }}>
              {myTasks.length} total
            </span>
          </div>
          <button onClick={() => onNavigate('tasks')} className="sp-action" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600,
            background: `${GOLD}10`, color: GOLD,
            border: `1px solid ${GOLD}18`, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            View All <ChevronRight style={{ width: 12, height: 12 }} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: DIM }}>Overall Progress</span>
            <span style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>{completionRate}%</span>
          </div>
          <div className="progress-bar-animated" style={{ height: 6, borderRadius: 3, background: 'rgba(160,152,136,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${hex}, ${PURPLE}cc)`,
              width: `${completionRate}%`, animation: 'sp-progressFill 1s ease-out',
              boxShadow: `0 0 10px ${hex}44`,
            }} />
          </div>
        </div>

        {/* Task cards */}
        {activeTasks.slice(0, 6).map(task => {
          const pColor = priorityColors[task.priority];
          const d = task.deadline ? daysUntil(task.deadline) : null;
          return (
            <div key={task.id} className="sp-task-row card-interactive" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px', borderRadius: 12, marginBottom: 6,
              borderLeft: `3px solid ${pColor?.text || MUTED}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: 13, color: CREAM, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {task.title}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {d !== null && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                    background: d <= 3 ? 'rgba(239,68,68,0.12)' : d <= 7 ? 'rgba(245,158,11,0.12)' : 'rgba(160,152,136,0.08)',
                    color: d <= 3 ? '#f87171' : d <= 7 ? '#fbbf24' : DIM,
                  }}>
                    {d >= 0 ? `${d}d` : 'Overdue'}
                  </span>
                )}
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: pColor?.bg, color: pColor?.text,
                }}>
                  {task.priority}
                </span>
                {statusBadge(task)}
              </div>
            </div>
          );
        })}
        {activeTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 28, color: DIM, fontSize: 13 }}>
            <Sparkles style={{ width: 22, height: 22, margin: '0 auto 10px', opacity: 0.4 }} />
            All tasks complete! Outstanding work.
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/*  7. OKR SUMMARY CARDS — Glassmorphism with progress rings        */}
      {/* ================================================================ */}
      <div className="sp-card card-premium" style={{ ...glassCard(), marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${GOLD}12`,
            }}>
              <Target style={{ width: 15, height: 15, color: GOLD }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: CREAM, margin: 0 }}>My Key Results</h3>
            <span style={{
              fontSize: 11, color: DIM, padding: '2px 8px', borderRadius: 6,
              background: 'rgba(160,152,136,0.06)',
            }}>
              {totalKRs} KRs
            </span>
          </div>
          <button onClick={() => onNavigate('okrs')} className="sp-action" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600,
            background: `${GOLD}10`, color: GOLD,
            border: `1px solid ${GOLD}18`, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            View OKRs <ChevronRight style={{ width: 12, height: 12 }} />
          </button>
        </div>

        {krsByOkr.map(({ okr, krs }) => {
          const okrS = OKR_STATUS[okr.status] || OKR_STATUS['on-track'];
          const okrAvg = krs.length > 0 ? Math.round(krs.reduce((s, k) => s + k.progress, 0) / krs.length) : 0;
          const ringColor = okr.status === 'on-track' ? '#4ade80' : okr.status === 'at-risk' ? '#fbbf24' : '#f87171';

          return (
            <div key={okr.id} style={{
              marginBottom: 16, padding: '18px 20px', borderRadius: 14,
              background: 'rgba(28,34,48,0.4)',
              border: `1px solid ${okrS.text}15`,
              backdropFilter: 'blur(12px)',
            }}>
              {/* OKR Header with progress ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ position: 'relative' }}>
                  <ProgressRing progress={okrAvg} size={48} stroke={4} color={ringColor} />
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: ringColor,
                  }}>
                    {okrAvg}%
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, color: MUTED, fontWeight: 600,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 4,
                  }}>
                    {okr.objective.length > 70 ? okr.objective.slice(0, 70) + '...' : okr.objective}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700,
                      background: okrS.bg, color: okrS.text, textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      {okrS.label}
                    </span>
                    <span style={{ fontSize: 10, color: DIM }}>{okr.quarter}</span>
                  </div>
                </div>
              </div>

              {/* Key Results */}
              {krs.map((kr, i) => (
                <div key={`${okr.id}-${i}`} className="sp-task-row card-interactive" onClick={() => onNavigate('okrs')} style={{
                  padding: '12px 14px', borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                  background: 'rgba(19,23,32,0.4)', border: '1px solid rgba(30,38,56,0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{
                      fontSize: 13, color: CREAM, flex: 1, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {kr.text}
                    </span>
                    <span style={{
                      fontSize: 14, fontWeight: 800, marginLeft: 12, flexShrink: 0,
                      color: kr.progress >= 70 ? '#4ade80' : kr.progress >= 40 ? hex : '#f87171',
                    }}>
                      {kr.progress}%
                    </span>
                  </div>
                  <div className="progress-bar-animated" style={{ height: 4, borderRadius: 2, background: 'rgba(160,152,136,0.08)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      background: kr.progress >= 70 ? 'linear-gradient(90deg, #4ade80, #22c55e)' :
                        kr.progress >= 40 ? `linear-gradient(90deg, ${hex}, ${hex}cc)` :
                          'linear-gradient(90deg, #f87171, #ef4444)',
                      width: `${kr.progress}%`, animation: 'sp-progressFill 1s ease-out',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        {krsByOkr.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: DIM, fontSize: 13 }}>
            No key results assigned
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/*  8. DOMAIN EXPERTISE (tag cloud) + ACTIVITY TIMELINE             */}
      {/* ================================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Domain Expertise — Skill Tag Cloud */}
        <div className="sp-card card-premium" style={glassCard()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${GOLD}12`,
            }}>
              <Briefcase style={{ width: 14, height: 14, color: GOLD }} />
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: CREAM, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Domain Expertise
            </h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {member.domains.map((domain, i) => {
              // Varying sizes based on position (first = most prominent)
              const isFirst = i === 0;
              const isSecond = i === 1;
              const size = isFirst ? 13 : isSecond ? 12 : 11;
              const weight = isFirst ? 700 : isSecond ? 600 : 500;
              const opacity = isFirst ? 1 : isSecond ? 0.9 : 0.75;
              const colors = [hex, PURPLE, '#60a5fa', '#4ade80', '#fb923c', '#f472b6'];
              const tagColor = colors[i % colors.length];
              return (
                <span key={i} className="sp-tag card-interactive" style={{
                  padding: `${isFirst ? '6px 14px' : '4px 10px'}`,
                  borderRadius: 20,
                  fontSize: size, fontWeight: weight,
                  background: `${tagColor}12`,
                  color: tagColor,
                  border: `1px solid ${tagColor}20`,
                  opacity,
                  cursor: 'default',
                  lineHeight: 1.4,
                }}>
                  {domain.length > 35 ? domain.slice(0, 35) + '...' : domain}
                </span>
              );
            })}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="sp-card card-premium" style={glassCard()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(96,165,250,0.12)',
            }}>
              <Activity style={{ width: 14, height: 14, color: '#60a5fa' }} />
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: CREAM, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent Activity
            </h3>
          </div>
          {activityTimeline.length > 0 ? (
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute', left: 5, top: 4, bottom: 4, width: 1,
                background: 'linear-gradient(180deg, rgba(160,152,136,0.2), rgba(160,152,136,0.05))',
              }} />
              {activityTimeline.map((item, i) => {
                const TypeIcon = item.type === 'task_done' ? Check : item.type === 'task_created' ? Zap : Calendar;
                return (
                  <div key={item.id} className="sp-timeline-item" style={{
                    display: 'flex', gap: 12, marginBottom: 14, position: 'relative',
                    animationDelay: `${i * 0.08}s`,
                  }}>
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: -18, top: 4,
                      width: 10, height: 10, borderRadius: '50%',
                      background: item.color, border: '2px solid #0b0d14',
                      animation: `sp-timelineDot 0.4s ${EASE} both`,
                      animationDelay: `${i * 0.1 + 0.2}s`,
                      boxShadow: `0 0 6px ${item.color}44`,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <TypeIcon style={{ width: 11, height: 11, color: item.color }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {item.label}
                        </span>
                        <span style={{ fontSize: 10, color: DIM, marginLeft: 'auto' }}>{item.timeAgo}</span>
                      </div>
                      <span style={{
                        fontSize: 12, color: MUTED, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                      }}>
                        {item.detail}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: DIM, fontSize: 12 }}>
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/*  9. NON-NEGOTIABLES CHECKLIST                                    */}
      {/* ================================================================ */}
      <div className="sp-card card-premium" style={{ ...glassCard(), marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        {/* Purple accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${PURPLE}, ${PURPLE}44, transparent)`,
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${PURPLE}15`,
            }}>
              <Shield style={{ width: 14, height: 14, color: PURPLE }} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: CREAM, margin: 0 }}>Non-Negotiables</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Completion indicator */}
            <div style={{ position: 'relative' }}>
              <ProgressRing progress={nonNegTotal > 0 ? (nonNegDone / nonNegTotal) * 100 : 0} size={32} stroke={3} color={PURPLE} />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: PURPLE,
              }}>
                {nonNegDone}/{nonNegTotal}
              </div>
            </div>
            <span style={{
              fontSize: 10, color: DIM, padding: '3px 8px', borderRadius: 6,
              background: 'rgba(160,152,136,0.06)',
            }}>
              daily check
            </span>
          </div>
        </div>

        {member.nonNegotiables.map((item, i) => {
          const checked = !!nonNegChecks[i];
          return (
            <div key={i} onClick={() => toggleNonNeg(i)} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10,
              cursor: 'pointer', padding: '8px 12px', borderRadius: 10,
              background: checked ? `${PURPLE}08` : 'transparent',
              transition: `all 0.25s ${EASE}`,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                background: checked ? `${PURPLE}25` : 'rgba(160,152,136,0.08)',
                border: `1.5px solid ${checked ? PURPLE : `${DIM}44`}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: `all 0.25s ${EASE}`,
                boxShadow: checked ? `0 0 8px ${PURPLE}33` : 'none',
              }}>
                {checked && (
                  <Check style={{
                    width: 13, height: 13, color: PURPLE,
                    animation: `sp-checkPop 0.3s ${EASE}`,
                  }} />
                )}
              </div>
              <span style={{
                fontSize: 13, lineHeight: 1.5,
                color: checked ? PURPLE : MUTED,
                textDecoration: checked ? 'line-through' : 'none',
                transition: `all 0.25s ${EASE}`,
                fontWeight: checked ? 500 : 400,
              }}>
                {item}
              </span>
            </div>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/*  UPCOMING EVENTS                                                 */}
      {/* ================================================================ */}
      {upcomingEvents.length > 0 && (
        <div className="sp-card card-premium" style={{ ...glassCard(), marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, #4ade80, #4ade8044, transparent)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(74,222,128,0.12)',
            }}>
              <Calendar style={{ width: 14, height: 14, color: '#4ade80' }} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: CREAM, margin: 0 }}>Upcoming Events</h3>
          </div>
          {upcomingEvents.map(event => (
            <div key={event.id} className="sp-task-row card-interactive" onClick={() => onNavigate('events')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderRadius: 12, marginBottom: 6, cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.12)',
                }}>
                  <span style={{ fontSize: 8, fontWeight: 600, color: '#4ade80', textTransform: 'uppercase', lineHeight: 1 }}>
                    {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: CREAM, lineHeight: 1 }}>
                    {new Date(event.date + 'T12:00:00').getDate()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 13, color: CREAM, fontWeight: 600, display: 'block' }}>{event.name}</span>
                  <span style={{ fontSize: 11, color: DIM }}>{event.location}</span>
                </div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: 'rgba(74,222,128,0.1)', color: '#4ade80',
              }}>
                {event._days === 0 ? 'Today' : event._days === 1 ? 'Tomorrow' : `in ${event._days}d`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/*  10. INLINE ADVISOR — Premium Chat Bubble                        */}
      {/* ================================================================ */}
      <div className="sp-card card-premium" style={{ marginTop: 12, marginBottom: 24 }}>
        <InlineAdvisor
          title="Your Personal Advisor"
          titleIcon="lightbulb"
          compact={true}
          defaultCollapsed={true}
          storageKeySuffix="profile"
          suggestedPrompts={[
            'What should I personally focus on today?',
            'Am I taking on too much right now?',
            'What blind spots should I watch for?',
            'How can I make the biggest impact this week?',
          ]}
        />
      </div>
    </div>
  );
}
