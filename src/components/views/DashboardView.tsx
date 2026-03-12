'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  CheckCircle2, Plus, Circle, ChevronRight, ChevronDown, X, BookOpen,
  Target, Briefcase, Shield, Calendar, AlertCircle, Check, Clock, Flame,
  Key, Eye, EyeOff, ExternalLink, ShieldCheck, Sparkles, ArrowRight, Loader2,
  Inbox, BarChart3, ListChecks,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { InlineAdvisor } from '@/components/InlineAdvisor';
import { getMemberColor } from '@/lib/constants';
import { getApiKey, saveApiKey, removeApiKey, maskApiKey, isValidApiKey, hasApiKey } from '@/lib/apiKey';
import type { Task, OKR } from '@/lib/data';

/* ─── Injected Styles / Keyframes ─── */
const dashboardStyles = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 8px 2px rgba(212,165,116,0.15); }
  50%      { box-shadow: 0 0 20px 6px rgba(212,165,116,0.35); }
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes countUp {
  0%   { opacity: 0; transform: translateY(8px) scale(0.9); filter: blur(4px); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.02); filter: blur(0); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

@keyframes avatarRingPulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(212,165,116,0.2), 0 0 12px 4px rgba(212,165,116,0.08); }
  50%      { box-shadow: 0 0 0 5px rgba(212,165,116,0.35), 0 0 20px 8px rgba(212,165,116,0.15); }
}

@keyframes sparkleFloat {
  0%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
  20%      { opacity: 1; transform: translate(-4px,-8px) scale(1); }
  80%      { opacity: 0.6; transform: translate(4px,-14px) scale(0.6); }
}

@keyframes sparkleFloat2 {
  0%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
  30%      { opacity: 0.8; transform: translate(6px,-6px) scale(0.8); }
  70%      { opacity: 0.3; transform: translate(-2px,-12px) scale(0.4); }
}

@keyframes progressFill {
  from { width: 0%; }
}

@keyframes badgePulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.7; }
}

@keyframes slideIndicator {
  from { transform: scaleX(0.8); opacity: 0.6; }
  to   { transform: scaleX(1); opacity: 1; }
}

@keyframes borderGradientRotate {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes progressGlow {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 2px currentColor); }
  50%      { filter: brightness(1.3) drop-shadow(0 0 6px currentColor); }
}

@keyframes statNumberPop {
  0%   { opacity: 0; transform: translateY(12px) scale(0.8); filter: blur(6px); }
  50%  { opacity: 1; transform: translateY(-3px) scale(1.05); filter: blur(0); }
  70%  { transform: translateY(1px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.8; }
}

@keyframes accentLineReveal {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

@keyframes sparklineTrail {
  from { stroke-dashoffset: 100; }
  to   { stroke-dashoffset: 0; }
}

@keyframes priorityBorderGlow {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}

@keyframes rippleEffect {
  0%   { transform: scale(0); opacity: 0.5; }
  100% { transform: scale(4); opacity: 0; }
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes skeletonShimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes scrollReveal {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Focus Visible ─── */
.dash-focusable:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 2px #0b0d14, 0 0 0 4px #d4a574 !important;
}

/* ─── Reduced Motion ─── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

/* ─── Theme ─── */
const C = {
  bg: '#0b0d14',
  card: 'rgba(19, 23, 32, 0.8)', border: 'rgba(30, 38, 56, 0.5)',
  text: '#f0ebe4', textSec: '#a09888', textMuted: '#6b6358',
  accent: '#d4a574', purple: '#8b5cf6',
  success: '#6b8f71', warning: '#f59e0b', danger: '#ef4444',
} as const;

/* Priority colors for left accent borders */
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#d4a574',
  low: '#6b8f71',
};

const card: React.CSSProperties = {
  backgroundColor: C.card, border: `1px solid ${C.border}`,
  borderRadius: 16, padding: 24,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  transition: 'box-shadow 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
};

/* ─── Section Header Component ─── */
const SectionHeader = ({ icon, title, count, accentColor, children }: {
  icon: React.ReactNode;
  title: string;
  count?: number | string;
  accentColor?: string;
  children?: React.ReactNode;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: `linear-gradient(135deg, ${accentColor || C.accent}18, ${accentColor || C.accent}08)`,
        border: `1px solid ${accentColor || C.accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>{title}</span>
        {count !== undefined && (
          <span style={{
            fontSize: 11, color: C.textSec, marginLeft: 8,
            padding: '2px 8px', borderRadius: 6,
            background: 'rgba(160,152,136,0.08)',
          }}>
            {count}
          </span>
        )}
      </div>
    </div>
    {children}
  </div>
);

/* ─── Skeleton Loader ─── */
const Skeleton = ({ width = '100%', height = 16, borderRadius = 8, style }: {
  width?: string | number; height?: number; borderRadius?: number; style?: React.CSSProperties;
}) => (
  <div style={{
    width, height, borderRadius,
    background: 'linear-gradient(90deg, rgba(160,152,136,0.06) 25%, rgba(160,152,136,0.12) 50%, rgba(160,152,136,0.06) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonShimmer 1.8s ease-in-out infinite',
    ...style,
  }} />
);

/* ─── Empty State ─── */
const EmptyState = ({ icon, message, actionLabel, onAction }: {
  icon: React.ReactNode; message: string; actionLabel?: string; onAction?: () => void;
}) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '32px 24px', gap: 12, textAlign: 'center',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: 'linear-gradient(135deg, rgba(160,152,136,0.08), rgba(160,152,136,0.03))',
      border: '1px solid rgba(160,152,136,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <p style={{ fontSize: 13, color: C.textSec, margin: 0, maxWidth: 260, lineHeight: 1.5 }}>{message}</p>
    {actionLabel && onAction && (
      <button onClick={onAction} className="dash-focusable" style={{
        padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.accent}25`,
        background: `linear-gradient(135deg, ${C.accent}10, ${C.accent}05)`,
        color: C.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.25s ease',
      }}>
        {actionLabel}
      </button>
    )}
  </div>
);

/* ─── Animated Counter Hook ─── */
function useCountUp(target: number, duration: number = 800, delay: number = 300): number {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(target);
  useEffect(() => {
    const start = performance.now() + delay;
    const from = 0;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = Math.max(0, now - start);
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    prevTarget.current = target;
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return value;
}

/* ─── Tooltip Wrapper ─── */
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%',
          transform: 'translateX(-50%)', marginBottom: 8,
          padding: '6px 10px', borderRadius: 8,
          background: 'rgba(19, 23, 32, 0.95)',
          border: '1px solid rgba(212,165,116,0.2)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          fontSize: 11, color: '#f0ebe4', whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'tooltipFadeIn 0.2s ease-out both',
          zIndex: 50, pointerEvents: 'none',
          lineHeight: 1.4, maxWidth: 220, textAlign: 'center',
        }}>
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: '5px solid rgba(19, 23, 32, 0.95)',
          }} />
        </div>
      )}
    </div>
  );
};

/* ─── Scroll Reveal Wrapper ─── */
const ScrollReveal = ({ children, delay = 0, style }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

/* ─── Gradient Separator ─── */
const GradientSeparator = ({ color = C.accent }: { color?: string }) => (
  <div style={{
    height: 1, margin: '0 auto', width: '80%',
    background: `linear-gradient(90deg, transparent, ${color}25, transparent)`,
  }} />
);

/* ─── Ripple Button Wrapper ─── */
const RippleButton = ({ children, onClick, style, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
        background:rgba(212,165,116,0.25);
        animation:rippleEffect 0.6s ease-out forwards;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    onClick?.(e);
  };
  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className={`dash-focusable ${className || ''}`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      {...props}
    >
      {children}
    </button>
  );
};

/* ─── Stat Tooltip Descriptions ─── */
const STAT_TOOLTIPS = [
  'Tasks currently in progress or pending completion',
  'Urgent tasks requiring immediate attention',
  'Key Results you own across all OKRs',
  'Percentage of your total tasks marked done',
];

/* ─── Helpers ─── */
function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function daysUntil(dateStr: string): number | null {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const t = new Date(dateStr);
  if (isNaN(t.getTime())) return null;
  return Math.ceil((t.getTime() - now.getTime()) / 86400000);
}

type DoneMap = Record<string, boolean>;

const STATUS_CYCLE: Task['status'][] = ['todo', 'in-progress', 'done'];
const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  'todo': { bg: 'rgba(107,99,88,0.15)', text: '#6b6358', label: 'To Do' },
  'in-progress': { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'In Progress' },
  'done': { bg: 'rgba(107,143,113,0.15)', text: '#6b8f71', label: 'Done' },
  'blocked': { bg: 'rgba(239,68,68,0.12)', text: '#f87171', label: 'Blocked' },
};
const OKR_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  'on-track': { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', label: 'On Track' },
  'at-risk': { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', label: 'At Risk' },
  'behind': { bg: 'rgba(239,68,68,0.12)', text: '#f87171', label: 'Behind' },
};

/* ─── Component ─── */
export function DashboardView({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { okrs, tasks, teamMembers, events, dataSource, updateTask, createTask } = useFrequencyData();
  const { teamMemberId } = useAuth();
  const ownerId = teamMemberId ?? 'james';
  const navigate = useCallback((view: string) => { onNavigate?.(view); }, [onNavigate]);

  /* ── Mount + loading state for entry animations & skeletons ── */
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 50);
    const t2 = setTimeout(() => setIsLoading(false), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* ── Member info ── */
  const member = useMemo(() => teamMembers.find(t => t.id === teamMemberId), [teamMemberId, teamMembers]);
  const firstName = member ? member.name.split(' ')[0] : 'there';
  const hex = member ? getMemberColor(member.color) : C.accent;

  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
  const [tenetsOpen, setTenetsOpen] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  /* ── Priorities ── */
  const doneMapKey = `frequency-acc-${ownerId}-${todayStr()}`;
  const [doneMap, setDoneMap] = useState<DoneMap>(() => {
    try { const r = localStorage.getItem(doneMapKey); return r ? JSON.parse(r) : {}; } catch { return {}; }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  /* ── API Key state ── */
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyConnected, setApiKeyConnected] = useState(() => hasApiKey(ownerId));
  const [apiKeySaving, setApiKeySaving] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [apiKeyExpanded, setApiKeyExpanded] = useState(false);

  const handleSaveApiKey = useCallback(async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) { setApiKeyError('Paste your API key'); return; }
    if (!isValidApiKey(trimmed)) { setApiKeyError('Should start with sk-ant- and be at least 20 chars'); return; }
    setApiKeyError(null);
    setApiKeySaving(true);
    await new Promise(r => setTimeout(r, 500));
    saveApiKey(ownerId, trimmed);
    setApiKeyConnected(true);
    setApiKeySaved(true);
    setApiKeySaving(false);
    setApiKeyInput('');
    setTimeout(() => setApiKeySaved(false), 2000);
  }, [apiKeyInput, ownerId]);

  const handleRemoveApiKey = useCallback(() => {
    removeApiKey(ownerId);
    setApiKeyConnected(false);
    setApiKeyInput('');
  }, [ownerId]);

  /* ── Non-Negotiables checks ── */
  const [nonNegChecks, setNonNegChecks] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!member) return;
    const key = `frequency-nonneg-${ownerId}-${todayStr()}`;
    try { const s = localStorage.getItem(key); if (s) setNonNegChecks(JSON.parse(s)); } catch { /* */ }
  }, [ownerId, member]);
  const toggleNonNeg = useCallback((idx: number) => {
    setNonNegChecks(prev => {
      const next = { ...prev, [idx]: !prev[idx] };
      try { localStorage.setItem(`frequency-nonneg-${ownerId}-${todayStr()}`, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }, [ownerId]);

  /* ── My tasks ── */
  const allMyTasks = useMemo(() => tasks.filter(t => t.owner === ownerId), [tasks, ownerId]);
  const activeTasks = useMemo(() => allMyTasks.filter(t => t.status !== 'done'), [allMyTasks]);
  const criticalTasks = useMemo(() => activeTasks.filter(t => t.priority === 'critical'), [activeTasks]);
  const completionRate = allMyTasks.length > 0 ? Math.round((allMyTasks.filter(t => t.status === 'done').length / allMyTasks.length) * 100) : 0;

  const myTasks = useMemo(() => {
    const mine = activeTasks;
    if (activeTab === 'today') {
      return mine.filter(t => t.status === 'in-progress' || t.priority === 'critical' || t.priority === 'high').slice(0, 6);
    }
    if (activeTab === 'week') {
      return [...mine].sort((a, b) => {
        const p: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (p[a.priority] ?? 3) - (p[b.priority] ?? 3);
      }).slice(0, 10);
    }
    return mine.slice(0, 15);
  }, [activeTasks, activeTab]);

  const completedCount = useMemo(() =>
    myTasks.filter(t => doneMap[t.id] || t.status === 'done').length, [myTasks, doneMap]);
  const hitRate = myTasks.length > 0 ? Math.round((completedCount / myTasks.length) * 100) : 0;
  const hitColor = hitRate >= 67 ? C.success : hitRate >= 34 ? C.warning : C.danger;

  const toggleDone = useCallback((id: string) => {
    setDoneMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(doneMapKey, JSON.stringify(next)); } catch { /* */ }
      if (next[id]) {
        updateTask(id, { status: 'done' });
      } else {
        updateTask(id, { status: 'in-progress' });
      }
      return next;
    });
  }, [updateTask, ownerId]);

  const handleAddCommitment = useCallback(async () => {
    if (!newTitle.trim()) return;
    await createTask({
      title: newTitle.trim(), owner: ownerId,
      status: 'in-progress', priority: 'high',
      deadline: todayStr(), category: 'Daily',
    });
    setNewTitle(''); setShowAddForm(false);
  }, [newTitle, ownerId, createTask]);

  const cycleStatus = useCallback(async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'blocked') return;
    const idx = STATUS_CYCLE.indexOf(task.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setFlashId(task.id);
    await updateTask(task.id, { status: next });
    setTimeout(() => setFlashId(null), 400);
  }, [updateTask]);

  /* ── KRs by OKR ── */
  const krsByOkr = useMemo(() => {
    const groups: { okr: OKR; krs: { text: string; progress: number; owner: string }[] }[] = [];
    okrs.forEach(okr => {
      const krs = okr.keyResults.filter(kr => kr.owner === ownerId);
      if (krs.length > 0) groups.push({ okr, krs });
    });
    return groups;
  }, [okrs, ownerId]);
  const totalKRs = krsByOkr.reduce((s, g) => s + g.krs.length, 0);

  /* ── Upcoming events ── */
  const upcomingEvents = useMemo(() =>
    events.filter(e => e.status === 'upcoming' || e.status === 'planning')
      .map(e => ({ ...e, _days: daysUntil(e.date) }))
      .filter(e => e._days !== null && e._days >= 0 && e._days <= 30)
      .sort((a, b) => (a._days ?? 0) - (b._days ?? 0)),
    [events]);

  /* ── Capacity ── */
  const loadColor = activeTasks.length < 5 ? '#4ade80' : activeTasks.length <= 8 ? '#f59e0b' : '#f87171';
  const loadPct = Math.min(100, Math.round((activeTasks.length / 12) * 100));

  /* ── Animated counters ── */
  const animActive = useCountUp(activeTasks.length, 800, 500);
  const animCritical = useCountUp(criticalTasks.length, 800, 600);
  const animKRs = useCountUp(totalKRs, 800, 700);
  const animCompletion = useCountUp(completionRate, 1000, 800);

  /* ── Hover state helpers ── */
  const [hoveredStatIdx, setHoveredStatIdx] = useState<number | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const statusBadge = (task: Task) => {
    const s = STATUS_BADGE[task.status] || STATUS_BADGE['todo'];
    const flash = flashId === task.id;
    const isRisk = task.status === 'blocked';
    return (
      <span onClick={(e) => cycleStatus(task, e)} title="Click to cycle status" style={{
        padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
        background: s.bg, color: s.text, cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: flash ? 'scale(1.15)' : 'scale(1)', display: 'inline-block',
        animation: isRisk ? 'badgePulse 2s ease-in-out infinite' : 'none',
      }}>{s.label}</span>
    );
  };

  /* ── Stagger delay helper ── */
  const stagger = (index: number, base: number = 0) =>
    mounted ? `${base + index * 50}ms` : '0ms';

  return (
    <>
      {/* Inject CSS keyframes */}
      <style>{dashboardStyles}</style>

      <div className="scrollbar-autohide" style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── 1. Hero Greeting + Profile ── */}
      <div className="card-premium" style={{
        ...card, padding: '28px 24px 20px', borderTop: `3px solid ${hex}`,
        position: 'relative', overflow: 'hidden',
        animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
      }}>
        {/* Noise + dot pattern overlays */}
        <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none' }} />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none', opacity: 0.3 }} />
        {/* Animated gradient background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: `linear-gradient(135deg, rgba(212,165,116,0.04) 0%, rgba(139,92,246,0.04) 50%, rgba(212,165,116,0.04) 100%)`,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
          borderRadius: 16,
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, position: 'relative' }}>
          {/* Avatar with glow ring + sparkle pseudo-elements */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              backgroundColor: hex, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: '#0b0d14',
              animation: 'avatarRingPulse 3s ease-in-out infinite',
              position: 'relative', zIndex: 1,
            }}>
              {member ? member.name.split(' ').map(w => w[0]).join('').slice(0, 2) : 'JH'}
            </div>
            {/* Sparkle elements */}
            <div style={{
              position: 'absolute', top: -2, right: -4, width: 6, height: 6,
              borderRadius: '50%', backgroundColor: C.accent,
              animation: 'sparkleFloat 3s ease-in-out infinite',
              animationDelay: '0s', pointerEvents: 'none', zIndex: 2,
            }} />
            <div style={{
              position: 'absolute', top: 4, right: -6, width: 4, height: 4,
              borderRadius: '50%', backgroundColor: C.purple,
              animation: 'sparkleFloat2 3.5s ease-in-out infinite',
              animationDelay: '0.5s', pointerEvents: 'none', zIndex: 2,
            }} />
            <div style={{
              position: 'absolute', bottom: 2, right: -3, width: 3, height: 3,
              borderRadius: '50%', backgroundColor: C.accent,
              animation: 'sparkleFloat 4s ease-in-out infinite',
              animationDelay: '1.2s', pointerEvents: 'none', zIndex: 2,
              opacity: 0.7,
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="text-glow" style={{
              fontSize: 24, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.2,
              animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
              animationDelay: '0.1s',
            }}>
              {getGreeting()}, {firstName}
            </h1>
            <p style={{
              fontSize: 13, color: hex, fontWeight: 600, margin: '2px 0 0',
              animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
              animationDelay: '0.2s',
            }}>
              {member?.role || 'Steward'}
            </p>
            <p style={{
              fontSize: 12, color: C.textSec, margin: '2px 0 0',
              animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
              animationDelay: '0.3s',
            }}>
              {member?.roleOneSentence || ''}
            </p>
          </div>
          <div style={{
            textAlign: 'right', flexShrink: 0,
            animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
            animationDelay: '0.15s',
          }}>
            <div style={{ fontSize: 12, color: C.textSec }}>{formatDate()}</div>
            {member?.hoursPerWeek && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
                <Clock size={11} style={{ color: C.textSec }} />
                <span style={{ fontSize: 11, color: C.textSec }}>{member.hoursPerWeek} hrs/week</span>
              </div>
            )}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4,
              color: dataSource === 'supabase' ? C.success : C.warning,
              backgroundColor: dataSource === 'supabase' ? 'rgba(107,143,113,0.12)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${dataSource === 'supabase' ? 'rgba(107,143,113,0.25)' : 'rgba(245,158,11,0.25)'}`,
              borderRadius: 999, padding: '2px 8px',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: dataSource === 'supabase' ? C.success : C.warning }} />
              {dataSource === 'supabase' ? 'Live' : 'Demo'}
            </div>
          </div>
        </div>

        {/* Capacity + Quick Stats */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
          position: 'relative',
          animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
          animationDelay: '0.25s',
        }}>
          <span style={{ fontSize: 11, color: loadColor, fontWeight: 600 }}>
            {activeTasks.length} active tasks
          </span>
          {criticalTasks.length > 0 && (
            <span style={{
              padding: '1px 7px', borderRadius: 6, fontSize: 10, fontWeight: 600,
              background: 'rgba(239,68,68,0.12)', color: '#f87171',
              animation: 'badgePulse 2s ease-in-out infinite',
            }}>
              {criticalTasks.length} critical
            </span>
          )}
          <div style={{ flex: 1, maxWidth: 140, height: 4, borderRadius: 3, background: 'rgba(160,152,136,0.06)', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${loadColor}80, ${loadColor})`,
              width: mounted ? `${loadPct}%` : '0%',
              transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transitionDelay: '0.5s',
              boxShadow: `0 0 6px ${loadColor}30`,
            }} />
          </div>
          <span style={{ fontSize: 11, color: C.textSec }}>{completionRate}% complete</span>
        </div>

        {/* Stats row — glassmorphism stat cards with animated counters */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
          paddingTop: 16, borderTop: `1px solid ${C.border}`, position: 'relative',
        }}>
          {/* Accent line reveal under the separator */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: `linear-gradient(90deg, transparent, ${C.accent}40, transparent)`,
            animation: mounted ? 'accentLineReveal 0.8s ease-out both' : 'none',
            animationDelay: '0.4s',
            transformOrigin: 'center',
          }} />
          {isLoading ? (
            /* Skeleton loading state for stat cards */
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} style={{
                textAlign: 'center', padding: '14px 8px 12px', borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(19, 23, 32, 0.5), rgba(15, 18, 25, 0.3))',
                border: '1px solid rgba(30, 38, 56, 0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <Skeleton width={40} height={28} borderRadius={6} />
                <Skeleton width={48} height={10} borderRadius={4} />
              </div>
            ))
          ) : [
            { label: 'Active', value: animActive, displayValue: `${animActive}`, color: '#60a5fa' },
            { label: 'Critical', value: animCritical, displayValue: `${animCritical}`, color: '#f87171' },
            { label: 'My KRs', value: animKRs, displayValue: `${animKRs}`, color: hex },
            { label: 'Done Rate', value: animCompletion, displayValue: `${animCompletion}%`, color: '#4ade80' },
          ].map((s, idx) => (
            <Tooltip key={s.label} text={STAT_TOOLTIPS[idx]}>
              <div
                onMouseEnter={() => setHoveredStatIdx(idx)}
                onMouseLeave={() => setHoveredStatIdx(null)}
                tabIndex={0}
                className="dash-focusable card-stat"
                role="status"
                aria-label={`${s.label}: ${s.displayValue}`}
                style={{
                  textAlign: 'center', position: 'relative', overflow: 'hidden',
                  padding: '14px 8px 12px', borderRadius: 14,
                  background: hoveredStatIdx === idx
                    ? `linear-gradient(135deg, rgba(30, 38, 56, 0.7), rgba(19, 23, 32, 0.5))`
                    : `linear-gradient(135deg, rgba(19, 23, 32, 0.5), rgba(15, 18, 25, 0.3))`,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: hoveredStatIdx === idx
                    ? `1px solid ${s.color}40`
                    : '1px solid rgba(30, 38, 56, 0.3)',
                  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: hoveredStatIdx === idx ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredStatIdx === idx
                    ? `0 12px 28px rgba(0,0,0,0.25), 0 0 0 1px ${s.color}15, inset 0 1px 0 rgba(255,255,255,0.05)`
                    : '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.02)',
                  animation: mounted ? 'fadeSlideUp 0.5s ease-out both' : 'none',
                  animationDelay: stagger(idx, 300),
                  cursor: 'default',
                }}
              >
                {/* Gradient glow behind stat */}
                <div style={{
                  position: 'absolute', bottom: -10, left: '20%', right: '20%', height: '60%',
                  background: `radial-gradient(ellipse at center bottom, ${s.color}12, transparent 70%)`,
                  borderRadius: '50%', pointerEvents: 'none',
                  animation: hoveredStatIdx === idx ? 'glowPulse 2s ease-in-out infinite' : 'none',
                }} />
                {/* Top accent dot */}
                <div style={{
                  position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%',
                  backgroundColor: s.color,
                  opacity: hoveredStatIdx === idx ? 0.8 : 0.3,
                  transition: 'opacity 0.3s ease',
                }} />
                <div style={{
                  fontSize: 26, fontWeight: 800, color: C.text,
                  position: 'relative', zIndex: 1,
                  fontFamily: 'inherit',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  animation: mounted ? 'statNumberPop 0.8s ease-out both' : 'none',
                  animationDelay: stagger(idx, 500),
                  textShadow: hoveredStatIdx === idx ? `0 0 20px ${s.color}30` : 'none',
                  transition: 'text-shadow 0.3s ease',
                }}>{s.displayValue}</div>
                <div style={{
                  fontSize: 10, color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.08em',
                  position: 'relative', zIndex: 1, marginTop: 4, fontWeight: 600,
                }}>{s.label}</div>
                {/* Bottom color accent bar */}
                <div style={{
                  position: 'absolute', bottom: 0, left: '25%', right: '25%', height: 2,
                  background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)`,
                  borderRadius: 1,
                  opacity: hoveredStatIdx === idx ? 1 : 0.3,
                  transition: 'opacity 0.3s ease',
                }} />
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* ── API Key Connection ── */}
      <div style={{
        ...card, padding: 0, overflow: 'hidden',
        borderLeft: apiKeyConnected ? '3px solid rgba(107,143,113,0.5)' : '3px solid rgba(212,165,116,0.5)',
        animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
        animationDelay: '0.15s',
      }}>
        <button
          onClick={() => setApiKeyExpanded(e => !e)}
          className="dash-focusable"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.2s ease', borderRadius: '16px 16px 0 0',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: apiKeyConnected
              ? 'rgba(107,143,113,0.12)' : 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.15))',
            border: `1px solid ${apiKeyConnected ? 'rgba(107,143,113,0.25)' : 'rgba(212,165,116,0.25)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {apiKeyConnected ? <Check size={14} style={{ color: C.success }} /> : <Key size={14} style={{ color: C.accent }} />}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
              {apiKeyConnected ? 'AI Advisor Connected' : 'Connect Your AI Advisor'}
            </span>
            <span style={{ fontSize: 11, color: C.textSec, marginLeft: 8 }}>
              {apiKeyConnected
                ? maskApiKey(getApiKey(ownerId) || '')
                : '30 seconds to set up'}
            </span>
          </div>
          {apiKeyConnected && (
            <span style={{
              padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
              background: 'rgba(107,143,113,0.12)', color: C.success,
              border: '1px solid rgba(107,143,113,0.25)',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: C.success, display: 'inline-block', marginRight: 4 }} />
              Active
            </span>
          )}
          <ChevronDown size={14} style={{ color: C.textSec, transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: apiKeyExpanded ? 'rotate(180deg)' : 'rotate(0)' }} />
        </button>

        {apiKeyExpanded && (
          <div style={{ padding: '0 16px 16px', animation: 'fadeSlideUp 0.3s ease-out both' }}>
            {!apiKeyConnected ? (
              <>
                {/* Step-by-step */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(212,165,116,0.12)', border: '1px solid rgba(212,165,116,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: C.accent,
                    }}>1</div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Get your API key</p>
                      <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: C.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        console.anthropic.com <ExternalLink size={9} />
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(212,165,116,0.12)', border: '1px solid rgba(212,165,116,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: C.accent,
                    }}>2</div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>Paste it below</p>
                  </div>
                </div>

                {/* Input */}
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <Key size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textSec, opacity: 0.5 }} />
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={e => { setApiKeyInput(e.target.value); setApiKeyError(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveApiKey(); }}
                    placeholder="sk-ant-api03-..."
                    autoFocus
                    style={{
                      width: '100%', padding: '10px 40px 10px 34px', borderRadius: 10,
                      border: `1px solid ${apiKeyError ? 'rgba(239,68,68,0.4)' : C.border}`,
                      backgroundColor: 'rgba(11,13,20,0.6)', color: C.text, fontSize: 12,
                      fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = `${C.accent}60`; e.currentTarget.style.boxShadow = `0 0 0 2px ${C.accent}15`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = apiKeyError ? 'rgba(239,68,68,0.4)' : C.border; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button onClick={() => setShowApiKey(s => !s)} title={showApiKey ? 'Hide' : 'Show'}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.textSec,
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.text; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.textSec; }}
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {apiKeyError && (
                  <p style={{ fontSize: 11, color: C.danger, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={11} /> {apiKeyError}
                  </p>
                )}

                <RippleButton onClick={handleSaveApiKey} disabled={apiKeySaving || !apiKeyInput.trim()}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                    backgroundColor: apiKeyInput.trim() && !apiKeySaving ? C.accent : 'rgba(30,38,56,0.5)',
                    color: apiKeyInput.trim() && !apiKeySaving ? '#0b0d14' : C.textSec,
                    fontSize: 13, fontWeight: 600, cursor: apiKeyInput.trim() ? 'pointer' : 'default',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={e => { if (apiKeyInput.trim() && !apiKeySaving) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseDown={e => { if (apiKeyInput.trim() && !apiKeySaving) e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={e => { if (apiKeyInput.trim() && !apiKeySaving) e.currentTarget.style.transform = 'scale(1.02)'; }}
                >
                  {apiKeySaving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Connecting...</>
                    : <><Sparkles size={14} /> Activate AI Advisor</>}
                </RippleButton>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                  <ShieldCheck size={11} style={{ color: C.success }} />
                  <span style={{ fontSize: 10, color: C.textSec }}>Stored locally in your browser. Never shared.</span>
                </div>
              </>
            ) : (
              <>
                {/* Connected state */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 8, marginBottom: 8,
                  background: 'rgba(107,143,113,0.08)', border: '1px solid rgba(107,143,113,0.15)',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.success }} />
                  <span style={{ fontSize: 11, color: C.success, flex: 1 }}>
                    Connected — key: <span style={{ fontFamily: 'monospace' }}>{maskApiKey(getApiKey(ownerId) || '')}</span>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: C.textSec }}>
                    Your key powers the AI Advisor across all views.
                  </span>
                  <button onClick={handleRemoveApiKey}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'rgba(239,68,68,0.6)', fontFamily: 'inherit', transition: 'color 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; }}>
                    Remove key
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Tab Selector with Sliding Indicator ── */}
      <div style={{
        display: 'flex', gap: 0, position: 'relative',
        borderBottom: `1px solid ${C.border}`, marginBottom: -4,
        animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
        animationDelay: '0.2s',
      }}>
        {(['today', 'week', 'month'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="dash-focusable"
              style={{
                padding: '10px 20px', fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isActive ? C.accent : C.textSec,
                borderBottom: isActive ? `2px solid ${C.accent}` : '2px solid transparent',
                background: isActive ? `linear-gradient(to top, rgba(212,165,116,0.06), transparent)` : 'none',
                border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid',
                borderBottomColor: isActive ? C.accent : 'transparent',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative', borderRadius: '8px 8px 0 0',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = C.textSec; }}
            >
              {tab === 'today' ? 'Today' : tab === 'week' ? 'This Week' : 'This Month'}
              {isActive && (
                <span style={{
                  position: 'absolute', bottom: -1, left: '10%', right: '10%', height: 2,
                  background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
                  borderRadius: 1,
                  animation: 'slideIndicator 0.3s ease-out both',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3. Top Priorities ── */}
      <div className="card-premium" style={{
        ...card, padding: '28px 24px',
        animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
        animationDelay: '0.25s',
      }}>
        <SectionHeader
          icon={<Flame size={16} style={{ color: hex }} />}
          title={activeTab === 'today' ? 'Top Priorities' : activeTab === 'week' ? 'Weekly Focus' : 'Monthly Goals'}
          accentColor={hex}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 999,
            background: `linear-gradient(135deg, ${hitColor}12, ${hitColor}06)`,
            border: `1px solid ${hitColor}25`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: hitColor, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>{hitRate}%</span>
            <span style={{ fontSize: 10, color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.05em' }}>hit rate</span>
          </div>
        </SectionHeader>

        {/* Progress overview bar */}
        <div style={{
          height: 3, borderRadius: 2, background: 'rgba(160,152,136,0.06)', overflow: 'hidden', marginBottom: 16,
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: `linear-gradient(90deg, ${hitColor}80, ${hitColor})`,
            width: mounted ? `${hitRate}%` : '0%',
            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transitionDelay: '0.5s',
            boxShadow: `0 0 8px ${hitColor}40`,
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {isLoading ? (
            /* Skeleton loading for task list */
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px 11px 14px', borderRadius: 10,
              }}>
                <Skeleton width={18} height={14} borderRadius={4} />
                <Skeleton width={20} height={20} borderRadius={10} />
                <Skeleton width={`${70 - idx * 10}%`} height={14} borderRadius={6} />
                <Skeleton width={52} height={20} borderRadius={6} />
              </div>
            ))
          ) : myTasks.length === 0 ? (
            <EmptyState
              icon={<ListChecks size={22} style={{ color: C.textMuted }} />}
              message="No priorities yet. Add your first commitment to start tracking progress."
              actionLabel="Add commitment"
              onAction={() => setShowAddForm(true)}
            />
          ) : myTasks.map((t, i) => {
            const isDone = doneMap[t.id] || t.status === 'done';
            const isHovered = hoveredTaskId === t.id;
            const priorityColor = PRIORITY_COLORS[t.priority] || C.accent;
            return (
              <div
                key={t.id}
                onMouseEnter={() => setHoveredTaskId(t.id)}
                onMouseLeave={() => setHoveredTaskId(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px 11px 14px',
                  borderRadius: 10, opacity: isDone ? 0.45 : 1,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isHovered && !isDone ? 'translateX(2px)' : 'translateX(0)',
                  boxShadow: isHovered && !isDone
                    ? `0 4px 16px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.03)`
                    : 'none',
                  background: isHovered && !isDone
                    ? `linear-gradient(90deg, ${priorityColor}08, rgba(30, 38, 56, 0.25))`
                    : isDone ? 'rgba(107,143,113,0.04)' : 'transparent',
                  borderLeft: `3px solid ${isDone ? C.success + '60' : priorityColor}`,
                  animation: mounted ? 'fadeSlideUp 0.5s ease-out both' : 'none',
                  animationDelay: stagger(i, 350),
                  position: 'relative',
                }}
              >
                {/* Priority glow on hover */}
                {isHovered && !isDone && (
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3,
                    background: priorityColor,
                    boxShadow: `0 0 8px ${priorityColor}60, 0 0 16px ${priorityColor}30`,
                    borderRadius: 2,
                    animation: 'priorityBorderGlow 1.5s ease-in-out infinite',
                  }} />
                )}
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, width: 18, textAlign: 'right', flexShrink: 0, fontFamily: 'monospace' }}>{i + 1}</span>
                <button onClick={() => toggleDone(t.id)} className="dash-focusable" style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0,
                  transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: 'scale(1)', borderRadius: 10,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {isDone ? <CheckCircle2 size={20} style={{ color: C.success }} /> : <Circle size={20} style={{ color: 'rgba(160,152,136,0.3)' }} />}
                </button>
                <span style={{
                  flex: 1, fontSize: 13, color: isDone ? C.textSec : C.text, lineHeight: 1.4,
                  textDecoration: isDone ? 'line-through' : 'none',
                  transition: 'color 0.2s ease',
                  fontWeight: t.priority === 'critical' ? 600 : 400,
                }}>{t.title}</span>
                {/* Priority dot indicator */}
                {!isDone && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: priorityColor,
                    opacity: 0.6,
                    boxShadow: t.priority === 'critical' ? `0 0 6px ${priorityColor}60` : 'none',
                  }} />
                )}
                {statusBadge(t)}
              </div>
            );
          })}
        </div>

        {showAddForm ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingLeft: 38 }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCommitment()}
              placeholder="What are you committing to?" autoFocus
              style={{
                flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 10,
                border: `1px solid ${C.border}`, backgroundColor: 'rgba(11,13,20,0.6)',
                color: C.text, outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = `${C.accent}60`; e.currentTarget.style.boxShadow = `0 0 0 2px ${C.accent}15`; }}
              onBlur={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <RippleButton onClick={handleAddCommitment} style={{
              padding: '8px 14px', borderRadius: 10, border: 'none',
              backgroundColor: C.accent, color: '#0b0d14', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            >Add</RippleButton>
            <button onClick={() => { setShowAddForm(false); setNewTitle(''); }} className="dash-focusable" style={{
              padding: 8, borderRadius: 10, border: `1px solid ${C.border}`,
              backgroundColor: 'transparent', color: C.textSec, cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.accent}50`; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSec; }}
            ><X size={14} /></button>
          </div>
        ) : (
          <RippleButton onClick={() => setShowAddForm(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 16,
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.accent,
            fontFamily: 'inherit', fontWeight: 500,
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: 'scale(1)',
            padding: '8px 12px 8px 38px',
            borderRadius: 8,
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.background = `linear-gradient(90deg, ${C.accent}08, transparent)`;
              e.currentTarget.style.boxShadow = `0 0 16px ${C.accent}10`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 6,
              background: `linear-gradient(135deg, ${C.accent}20, ${C.accent}08)`,
              border: `1px solid ${C.accent}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={12} />
            </div>
            Add commitment
          </RippleButton>
        )}

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, paddingLeft: 38 }}>
          <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>
            These priorities should ladder up to your OKRs.{' '}
            <button onClick={() => navigate('okrs')} className="dash-focusable" style={{
              background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13,
              fontFamily: 'inherit', padding: 0, fontWeight: 500,
              transition: 'opacity 0.2s ease', borderRadius: 4,
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              View OKRs <ChevronRight size={11} style={{ verticalAlign: 'middle' }} />
            </button>
          </p>
        </div>
      </div>

      {/* ── Separator ── */}
      <GradientSeparator />

      {/* ── 4. My Key Results ── */}
      {krsByOkr.length > 0 ? (
        <ScrollReveal delay={50}>
        <div className="card-premium" style={{
          ...card, padding: '28px 24px',
        }}>
          <SectionHeader
            icon={<Target size={16} style={{ color: hex }} />}
            title="My Key Results"
            count={`${totalKRs} KRs`}
            accentColor={hex}
          >
            <RippleButton onClick={() => navigate('okrs')} style={{
              background: 'linear-gradient(135deg, rgba(212,165,116,0.08), rgba(212,165,116,0.03))',
              border: `1px solid ${C.accent}20`,
              borderRadius: 8, cursor: 'pointer', fontSize: 11, color: C.textSec,
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.color = C.accent;
                e.currentTarget.style.borderColor = `${C.accent}40`;
                e.currentTarget.style.boxShadow = `0 0 12px ${C.accent}10`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = C.textSec;
                e.currentTarget.style.borderColor = `${C.accent}20`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View all <ChevronRight size={12} />
            </RippleButton>
          </SectionHeader>
          {krsByOkr.map(({ okr, krs }, groupIdx) => {
            const okrS = OKR_STATUS[okr.status] || OKR_STATUS['on-track'];
            const isAtRiskOrBehind = okr.status === 'at-risk' || okr.status === 'behind';
            const avgProgress = Math.round(krs.reduce((s, kr) => s + kr.progress, 0) / krs.length);
            return (
              <div key={okr.id} style={{ marginBottom: 16 }}>
                {/* OKR objective header with improved badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                  padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(19,23,32,0.5)',
                  borderLeft: `2px solid ${okrS.text}40`,
                }}>
                  <span style={{ fontSize: 12, color: C.text, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {okr.objective}
                  </span>
                  {/* Mini sparkline circle indicator */}
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(160,152,136,0.1)" strokeWidth="2.5" />
                    <circle cx="12" cy="12" r="9" fill="none" stroke={okrS.text} strokeWidth="2.5"
                      strokeDasharray={`${avgProgress * 0.565} 56.5`}
                      strokeLinecap="round"
                      transform="rotate(-90 12 12)"
                      style={{
                        transition: 'stroke-dasharray 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        filter: `drop-shadow(0 0 3px ${okrS.text}40)`,
                      }}
                    />
                    <text x="12" y="12.5" textAnchor="middle" dominantBaseline="middle"
                      style={{ fontSize: 7, fontWeight: 700, fill: okrS.text }}
                    >{avgProgress}</text>
                  </svg>
                  <span style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700,
                    background: `linear-gradient(135deg, ${okrS.bg}, ${okrS.text}08)`,
                    color: okrS.text, flexShrink: 0,
                    border: `1px solid ${okrS.text}20`,
                    animation: isAtRiskOrBehind ? 'badgePulse 2s ease-in-out infinite' : 'none',
                    letterSpacing: '0.03em', textTransform: 'uppercase',
                  }}>{okrS.label}</span>
                </div>
                {krs.map((kr, i) => {
                  const progressColor = kr.progress >= 70 ? '#4ade80' : kr.progress >= 40 ? hex : '#f87171';
                  return (
                    <div key={`${okr.id}-${i}`} style={{
                      padding: '10px 14px', borderRadius: 10, marginBottom: 6,
                      background: 'linear-gradient(135deg, rgba(28,34,48,0.5), rgba(19,23,32,0.3))',
                      border: '1px solid rgba(30,38,56,0.3)',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      cursor: 'default',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateX(2px)';
                        e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px ${progressColor}15`;
                        e.currentTarget.style.borderColor = `${progressColor}20`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'rgba(30,38,56,0.3)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{kr.text}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12, flexShrink: 0 }}>
                          {/* Mini sparkline bar visualization */}
                          <div style={{
                            display: 'flex', alignItems: 'flex-end', gap: 1, height: 14,
                          }}>
                            {[0.3, 0.5, 0.4, 0.7, 0.6, 0.8, kr.progress / 100].map((h, bi) => (
                              <div key={bi} style={{
                                width: 2, borderRadius: 1,
                                height: `${Math.max(20, h * 100)}%`,
                                backgroundColor: bi === 6 ? progressColor : `${progressColor}30`,
                                transition: 'height 0.5s ease',
                                transitionDelay: `${bi * 50}ms`,
                              }} />
                            ))}
                          </div>
                          <span style={{
                            fontSize: 13, fontWeight: 800, color: progressColor,
                            fontFamily: 'monospace', letterSpacing: '-0.02em',
                            textShadow: `0 0 12px ${progressColor}30`,
                          }}>{kr.progress}%</span>
                        </div>
                      </div>
                      {/* Enhanced progress bar with gradient fill */}
                      <div style={{
                        height: 4, borderRadius: 3,
                        background: 'rgba(160,152,136,0.06)', overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          background: `linear-gradient(90deg, ${progressColor}80, ${progressColor})`,
                          width: mounted ? `${kr.progress}%` : '0%',
                          transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transitionDelay: `${400 + groupIdx * 100 + i * 80}ms`,
                          boxShadow: `0 0 8px ${progressColor}30, 0 0 2px ${progressColor}50`,
                          position: 'relative',
                        }} />
                        {/* Animated shimmer on progress bar */}
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 3s linear infinite',
                          pointerEvents: 'none',
                          borderRadius: 3,
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal delay={50}>
          <div style={{ ...card, padding: '28px 24px' }}>
            <SectionHeader
              icon={<Target size={16} style={{ color: hex }} />}
              title="My Key Results"
              accentColor={hex}
            />
            <EmptyState
              icon={<BarChart3 size={22} style={{ color: C.textMuted }} />}
              message="No Key Results assigned to you yet. Check back once OKRs are set up."
              actionLabel="View OKRs"
              onAction={() => navigate('okrs')}
            />
          </div>
        </ScrollReveal>
      )}

      {/* ── Separator ── */}
      <GradientSeparator color={C.purple} />

      {/* ── 5. Domains & Non-Negotiables ── */}
      {member && (
        <ScrollReveal delay={80}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {/* Domains */}
          <div className="card-interactive" style={{
            ...card, padding: '24px 24px 20px',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 12px 36px rgba(0,0,0,0.18), 0 0 0 1px ${C.accent}12`;
              e.currentTarget.style.borderColor = `${C.accent}30`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(135deg, ${hex}18, ${hex}08)`,
                border: `1px solid ${hex}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Briefcase size={13} style={{ color: hex }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>Domains</span>
            </div>
            {/* Accent line */}
            <div style={{
              height: 1, marginBottom: 14,
              background: `linear-gradient(90deg, ${hex}30, transparent)`,
              animation: mounted ? 'accentLineReveal 0.6s ease-out both' : 'none',
              animationDelay: '0.5s', transformOrigin: 'left',
            }} />
            {member.domains.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8,
                padding: '4px 8px', borderRadius: 6,
                transition: 'background 0.2s ease',
                animation: mounted ? 'fadeSlideUp 0.4s ease-out both' : 'none',
                animationDelay: stagger(i, 450),
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${hex}08`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${hex}, ${hex}80)`,
                  marginTop: 5, flexShrink: 0,
                  boxShadow: `0 0 4px ${hex}30`,
                }} />
                <span style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Non-Negotiables */}
          <div className="card-interactive" style={{
            ...card, padding: '24px 24px 20px',
            animation: mounted ? 'fadeSlideUp 0.6s ease-out both' : 'none',
            animationDelay: '0.4s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 12px 36px rgba(0,0,0,0.18), 0 0 0 1px ${C.purple}12`;
              e.currentTarget.style.borderColor = `${C.purple}30`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${C.purple}18, ${C.purple}08)`,
                  border: `1px solid ${C.purple}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={13} style={{ color: '#8b5cf6' }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>Non-Negotiables</span>
              </div>
              <span style={{
                fontSize: 9, color: C.purple, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '2px 8px', borderRadius: 6,
                background: `${C.purple}10`, border: `1px solid ${C.purple}15`,
              }}>daily</span>
            </div>
            {/* Accent line */}
            <div style={{
              height: 1, marginBottom: 14,
              background: `linear-gradient(90deg, ${C.purple}30, transparent)`,
              animation: mounted ? 'accentLineReveal 0.6s ease-out both' : 'none',
              animationDelay: '0.55s', transformOrigin: 'left',
            }} />
            {member.nonNegotiables.map((item, i) => {
              const checked = !!nonNegChecks[i];
              return (
                <div key={i} onClick={() => toggleNonNeg(i)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6, cursor: 'pointer', padding: '3px 0',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  animation: mounted ? 'fadeSlideUp 0.4s ease-out both' : 'none',
                  animationDelay: stagger(i, 500),
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    background: checked ? 'rgba(139,92,246,0.2)' : 'rgba(160,152,136,0.08)',
                    border: `1px solid ${checked ? '#8b5cf6' : '#6b6358'}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: checked ? 'scale(1)' : 'scale(1)',
                  }}>
                    {checked && <Check size={12} style={{ color: '#8b5cf6' }} />}
                  </div>
                  <span style={{
                    fontSize: 13, lineHeight: 1.5,
                    color: checked ? '#8b5cf6' : C.textSec,
                    textDecoration: checked ? 'line-through' : 'none',
                    transition: 'all 0.25s ease',
                    // Shimmer on completed
                    ...(checked ? {
                      backgroundImage: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 50%, #8b5cf6 100%)',
                      backgroundSize: '200% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'shimmer 3s linear infinite',
                    } : {}),
                  }}>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
        </ScrollReveal>
      )}

      {/* ── Separator ── */}
      <GradientSeparator color={C.success} />

      {/* ── 6. Upcoming Events ── */}
      {upcomingEvents.length > 0 ? (
        <ScrollReveal delay={100}>
        <div className="card-premium" style={{
          ...card, padding: '28px 24px',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 12px 36px rgba(0,0,0,0.18), 0 0 0 1px rgba(74,222,128,0.08)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <SectionHeader
            icon={<Calendar size={14} style={{ color: '#4ade80' }} />}
            title="Upcoming Events"
            count={upcomingEvents.length}
            accentColor="#4ade80"
          >
            <RippleButton onClick={() => navigate('events')} style={{
              background: 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(74,222,128,0.03))',
              border: '1px solid rgba(74,222,128,0.15)',
              borderRadius: 8, cursor: 'pointer', fontSize: 11, color: C.textSec,
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#4ade80';
                e.currentTarget.style.borderColor = 'rgba(74,222,128,0.35)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(74,222,128,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = C.textSec;
                e.currentTarget.style.borderColor = 'rgba(74,222,128,0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View all <ChevronRight size={12} />
            </RippleButton>
          </SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {upcomingEvents.slice(0, 4).map((e, i) => {
              const urgency = (e._days ?? 30) <= 3 ? '#f87171' : (e._days ?? 30) <= 7 ? '#fbbf24' : '#4ade80';
              return (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(28,34,48,0.3), rgba(19,23,32,0.2))',
                  border: '1px solid rgba(30,38,56,0.25)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  animation: mounted ? 'fadeSlideUp 0.4s ease-out both' : 'none',
                  animationDelay: stagger(i, 550),
                  borderLeft: `3px solid ${urgency}40`,
                }}
                  onMouseEnter={ev => {
                    ev.currentTarget.style.transform = 'translateX(2px)';
                    ev.currentTarget.style.background = `linear-gradient(90deg, ${urgency}06, rgba(28,34,48,0.3))`;
                    ev.currentTarget.style.borderLeftColor = urgency;
                    ev.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.1)`;
                  }}
                  onMouseLeave={ev => {
                    ev.currentTarget.style.transform = 'translateX(0)';
                    ev.currentTarget.style.background = 'linear-gradient(135deg, rgba(28,34,48,0.3), rgba(19,23,32,0.2))';
                    ev.currentTarget.style.borderLeftColor = `${urgency}40`;
                    ev.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{e.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: `linear-gradient(135deg, ${urgency}15, ${urgency}08)`,
                      color: urgency,
                      border: `1px solid ${urgency}20`,
                      fontFamily: 'monospace',
                    }}>
                      {e._days}d
                    </span>
                    <span style={{ fontSize: 11, color: C.textSec }}>{e.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal delay={100}>
          <div style={{ ...card, padding: '28px 24px' }}>
            <SectionHeader
              icon={<Calendar size={14} style={{ color: '#4ade80' }} />}
              title="Upcoming Events"
              accentColor="#4ade80"
            />
            <EmptyState
              icon={<Inbox size={22} style={{ color: C.textMuted }} />}
              message="No upcoming events in the next 30 days. Enjoy the calm."
            />
          </div>
        </ScrollReveal>
      )}

      {/* ── Separator ── */}
      <GradientSeparator />

      {/* ── 7. AI Advisor ── */}
      <ScrollReveal delay={120}>
      <div>
        <InlineAdvisor
          title={`${firstName}, here are some things to consider today`}
          titleIcon="lightbulb"
          storageKeySuffix="dashboard"
          suggestedPrompts={[
            'What should my #1 priority be today and why?',
            'Where am I most at risk of dropping the ball?',
            'Give me a brutally honest assessment — am I on track?',
            'What hard conversation should I be having that I\'m avoiding?',
            'What would a world-class leader do differently in my position?',
            'Challenge my thinking on my current top priority',
          ]}
        />
      </div>
      </ScrollReveal>

      {/* ── Separator ── */}
      <GradientSeparator color={C.purple} />

      {/* ── 8. Tenets of Council ── */}
      <ScrollReveal delay={140}>
      <div className="card-premium" style={{
        ...card, borderLeft: `3px solid ${C.purple}60`, padding: 0, overflow: 'hidden',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 12px 36px rgba(0,0,0,0.18), 0 0 0 1px ${C.purple}10`;
          e.currentTarget.style.borderLeftColor = C.purple;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderLeftColor = `${C.purple}60`;
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <button onClick={() => setTenetsOpen(o => !o)} className="dash-focusable" style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.2s ease', borderRadius: 16,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = `${C.purple}05`; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.purple}18, ${C.purple}08)`,
            border: `1px solid ${C.purple}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BookOpen size={13} style={{ color: '#8b5cf6' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text, flex: 1, textAlign: 'left', letterSpacing: '-0.01em' }}>Tenets of Council</span>
          <ChevronDown size={14} style={{ color: C.textSec, transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: tenetsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
        {tenetsOpen && (
          <div style={{ padding: '0 20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Coherence before action. Mothership first. Always.',
              'We operate from trust, not suspicion.',
              'Responsibility-weighted voice — greater responsibility, greater say.',
              'Decisions are logged, transparent, and accountable.',
              'The sacred is not reducible to the measurable.',
              'Subsidiarity — decisions at the lowest competent level.',
              'We honor both Being (Right Side) and Doing (Left Side).',
            ].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                animation: 'fadeSlideUp 0.4s ease-out both',
                animationDelay: `${i * 50}ms`,
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#8b5cf6', lineHeight: 1,
                }}>{i + 1}</div>
                <span style={{ fontSize: 11, color: C.textSec, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      </ScrollReveal>

      {/* ── Separator ── */}
      <GradientSeparator />

      {/* ── 9. Priority Pyramid ── */}
      <ScrollReveal delay={160}>
      <div className="card-premium" style={{
        ...card, padding: '24px 24px',
        position: 'relative', overflow: 'hidden',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 12px 36px rgba(0,0,0,0.18), 0 0 0 1px ${C.accent}08`;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Subtle gradient background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, rgba(212,165,116,0.02) 0%, rgba(139,92,246,0.02) 50%, rgba(107,143,113,0.02) 100%)',
          pointerEvents: 'none', borderRadius: 16,
        }} />
        <div style={{
          textAlign: 'center', marginBottom: 14, position: 'relative',
          fontSize: 11, color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
        }}>Priority Stack</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
          {([
            { label: 'Member-Led Initiatives', color: '#6b8f71', width: '50%', num: 3 },
            { label: 'Three Core Nodes', color: '#8b5cf6', width: '72%', num: 2 },
            { label: 'Mothership Stability', color: '#d4a574', width: '100%', num: 1 },
          ] as const).map((tier, idx) => (
            <div key={tier.num} style={{
              width: tier.width,
              background: `linear-gradient(135deg, rgba(19,23,32,0.9), ${tier.color}08)`,
              borderLeft: `3px solid ${tier.color}`,
              borderRadius: 8,
              padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: mounted ? 'fadeSlideUp 0.5s ease-out both' : 'none',
              animationDelay: stagger(idx, 700),
              cursor: 'default',
              border: `1px solid ${tier.color}15`,
              borderLeftWidth: 3,
              borderLeftStyle: 'solid',
              borderLeftColor: tier.color,
              position: 'relative',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                e.currentTarget.style.boxShadow = `0 6px 16px rgba(0,0,0,0.15), 0 0 0 1px ${tier.color}20, inset 0 0 20px ${tier.color}05`;
                e.currentTarget.style.borderLeftColor = tier.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 800, color: tier.color, flexShrink: 0,
                width: 22, height: 22, borderRadius: 6,
                background: `${tier.color}15`, border: `1px solid ${tier.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                letterSpacing: '0.02em',
              }}>P{tier.num}</span>
              <span style={{ fontSize: 12, color: C.textSec, fontWeight: 500 }}>{tier.label}</span>
            </div>
          ))}
        </div>
      </div>
      </ScrollReveal>
    </div>
    </>
  );
}
