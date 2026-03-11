'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Users, CheckCircle2, Target, Network, TrendingUp, Calendar,
  Plus, Circle, ChevronRight, ChevronDown, Zap, ListTodo, X, Sparkles, Bot, Trophy, BookOpen,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';

/* ─── Theme ─── */
const C = {
  card: 'rgba(19, 23, 32, 0.8)', border: 'rgba(30, 38, 56, 0.5)',
  text: '#f0ebe4', textSec: '#a09888', accent: '#d4a574',
  success: '#6b8f71', warning: '#f59e0b', danger: '#ef4444',
} as const;

const card: React.CSSProperties = {
  backgroundColor: C.card, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: 20,
};

/* ─── Helpers ─── */
function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function todayKey() { return `frequency-accountability-${new Date().toISOString().slice(0, 10)}`; }
function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

type DoneMap = Record<string, boolean>;
function loadDoneMap(): DoneMap {
  try { const r = localStorage.getItem(todayKey()); return r ? JSON.parse(r) : {}; } catch { return {}; }
}
function saveDoneMap(m: DoneMap) { localStorage.setItem(todayKey(), JSON.stringify(m)); }

const SIGNAL_COLORS: Record<string, string> = { danger: C.danger, warning: C.warning, success: C.success };
const signalColor = (l: string) => SIGNAL_COLORS[l] ?? C.success;
const statusDot = (s: string) => s === 'in-progress' ? C.warning : s === 'blocked' ? C.danger : s === 'todo' ? C.textSec : C.success;
const priStyle = (p: string) => p === 'critical'
  ? { color: C.danger, bg: 'rgba(239,68,68,0.12)' }
  : p === 'high' ? { color: C.warning, bg: 'rgba(245,158,11,0.12)' }
  : { color: C.textSec, bg: 'rgba(160,152,136,0.12)' };

/* ─── Component ─── */
export function DashboardView({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { okrs, nodes, events, teamMembers, tasks, dataSource, updateTask, createTask } = useFrequencyData();
  const { teamMemberId } = useAuth();
  const ownerId = teamMemberId ?? 'james';
  const navigate = useCallback((view: string) => { onNavigate?.(view); }, [onNavigate]);

  const userName = useMemo(() => {
    if (!teamMemberId) return 'there';
    const m = teamMembers.find(t => t.id === teamMemberId);
    return m ? m.name.split(' ')[0] : 'there';
  }, [teamMemberId, teamMembers]);

  /* ── Accountability Tracker ── */
  const [doneMap, setDoneMap] = useState<DoneMap>(() => loadDoneMap());
  const [showAddForm, setShowAddForm] = useState(false);
  const [tenetsOpen, setTenetsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const todayTasks = useMemo(() =>
    tasks.filter(t => t.status === 'in-progress' || t.priority === 'critical'), [tasks]);
  const completedToday = useMemo(() =>
    todayTasks.filter(t => doneMap[t.id] || t.status === 'done').length, [todayTasks, doneMap]);
  const hitRate = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;
  const hitColor = hitRate >= 67 ? C.success : hitRate >= 34 ? C.warning : C.danger;

  const toggleDone = useCallback((id: string) => {
    setDoneMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      saveDoneMap(next);
      if (next[id]) updateTask(id, { status: 'done' });
      return next;
    });
  }, [updateTask]);

  const handleAddCommitment = useCallback(async () => {
    if (!newTitle.trim()) return;
    await createTask({
      title: newTitle.trim(), owner: ownerId,
      status: 'in-progress', priority: 'high',
      deadline: new Date().toISOString().slice(0, 10), category: 'Daily',
    });
    setNewTitle(''); setShowAddForm(false);
  }, [newTitle, ownerId, createTask]);

  /* ── KPI calculations ── */
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const taskRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const onTrackOkrs = okrs.filter(o => o.status === 'on-track').length;
  const avgNode = nodes.length > 0 ? Math.round(nodes.reduce((s, n) => s + n.progress, 0) / nodes.length) : 0;

  /* ── Agent Signals ── */
  const signals = useMemo(() => {
    const s: { label: string; level: 'danger' | 'warning' | 'success'; text: string }[] = [];
    const counts: Record<string, number> = {};
    tasks.filter(t => t.status !== 'done').forEach(t => { counts[t.owner] = (counts[t.owner] || 0) + 1; });
    const overloaded = Object.entries(counts).filter(([, c]) => c >= 5)
      .map(([id]) => teamMembers.find(m => m.id === id)?.name.split(' ')[0]).filter(Boolean);
    if (overloaded.length) s.push({ label: 'Overloaded', level: 'warning', text: `${overloaded.join(', ')} have 5+ open tasks` });
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    if (blocked) s.push({ label: 'Blocked', level: 'danger', text: `${blocked} task${blocked > 1 ? 's' : ''} blocked` });
    const atRisk = okrs.filter(o => o.status === 'at-risk' || o.status === 'behind').length;
    if (atRisk) s.push({ label: 'OKR Risk', level: 'warning', text: `${atRisk} OKR${atRisk > 1 ? 's' : ''} at risk` });
    const up = events.filter(e => e.status === 'upcoming').length;
    if (up) s.push({ label: 'Events', level: 'success', text: `${up} upcoming` });
    if (!s.length) s.push({ label: 'All Clear', level: 'success', text: 'No critical signals' });
    return s.slice(0, 4);
  }, [tasks, okrs, events, teamMembers]);

  /* ── Active Work ── */
  const topTasks = useMemo(() => [...tasks].filter(t => t.status !== 'done')
    .sort((a, b) => {
      const p: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (p[a.priority] ?? 3) - (p[b.priority] ?? 3);
    }).slice(0, 5), [tasks]);
  const topOkrs = okrs.slice(0, 3);
  const criticalCount = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ── 1. Greeting Hero ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.2 }}>
            {getGreeting()}, {userName}
          </h1>
          <p style={{ fontSize: 13, color: C.textSec, marginTop: 6 }}>{formatDate()}</p>
          <p style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>
            <span style={{ color: C.danger, fontWeight: 600 }}>{criticalCount} critical task{criticalCount !== 1 ? 's' : ''}</span>
            {' \u00b7 '}<span>{upcomingCount} event{upcomingCount !== 1 ? 's' : ''} ahead</span>
          </p>
        </div>
        {/* 7. Data Source Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          color: dataSource === 'supabase' ? C.success : C.warning,
          backgroundColor: dataSource === 'supabase' ? 'rgba(107,143,113,0.12)' : 'rgba(245,158,11,0.12)',
          border: `1px solid ${dataSource === 'supabase' ? 'rgba(107,143,113,0.25)' : 'rgba(245,158,11,0.25)'}`,
          borderRadius: 999, padding: '3px 10px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dataSource === 'supabase' ? C.success : C.warning }} />
          {dataSource === 'supabase' ? 'Live Data' : 'Demo Data'}
        </div>
      </div>

      {/* ── 2. Daily Accountability Tracker ── */}
      <div style={{ ...card, borderLeft: `3px solid ${C.accent}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ListTodo size={18} style={{ color: C.accent }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Daily Accountability</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: hitColor, fontFamily: 'monospace' }}>{hitRate}%</span>
            <span style={{ fontSize: 11, color: C.textSec }}>{completedToday}/{todayTasks.length} done</span>
          </div>
        </div>
        {/* Hit rate bar */}
        <div style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(30,38,56,0.6)', marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, backgroundColor: hitColor, width: `${hitRate}%`, transition: 'width 0.4s ease' }} />
        </div>
        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {todayTasks.length === 0 ? (
            <p style={{ fontSize: 13, color: C.textSec, textAlign: 'center', padding: '16px 0', margin: 0 }}>No tasks yet</p>
          ) : todayTasks.map(t => {
            const isDone = doneMap[t.id] || t.status === 'done';
            const ps = priStyle(t.priority);
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(30,38,56,0.3)', opacity: isDone ? 0.5 : 1 }}>
                <button onClick={() => toggleDone(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
                  {isDone ? <CheckCircle2 size={18} style={{ color: C.success }} /> : <Circle size={18} style={{ color: C.textSec }} />}
                </button>
                <span style={{ flex: 1, fontSize: 13, color: C.text, textDecoration: isDone ? 'line-through' : 'none' }}>{t.title}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, backgroundColor: ps.bg, color: ps.color }}>{t.priority}</span>
              </div>
            );
          })}
        </div>
        {/* Add commitment */}
        {showAddForm ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCommitment()}
              placeholder="What are you committing to today?" autoFocus
              style={{ flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: 'rgba(11,13,20,0.6)', color: C.text, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={handleAddCommitment} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', backgroundColor: C.accent, color: '#0b0d14', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
            <button onClick={() => { setShowAddForm(false); setNewTitle(''); }} style={{ padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.textSec, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.accent, fontFamily: 'inherit', padding: 0 }}>
            <Plus size={14} /> Add commitment
          </button>
        )}
      </div>

      {/* ── 3. Hero KPIs Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        {([
          { label: 'Active Members', value: activeMembers, icon: Users, color: C.accent, trend: '+2' },
          { label: 'Task Completion', value: `${taskRate}%`, icon: CheckCircle2, color: C.success, trend: `${doneTasks}/${tasks.length}` },
          { label: 'OKR Health', value: `${onTrackOkrs}/${okrs.length}`, icon: Target, color: onTrackOkrs >= okrs.length / 2 ? C.success : C.warning, trend: 'on track' },
          { label: 'Node Progress', value: `${avgNode}%`, icon: Network, color: avgNode >= 30 ? C.success : C.warning, trend: `avg across ${nodes.length}` },
        ] as const).map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${kpi.color}15` }}>
                  <Icon size={16} style={{ color: kpi.color }} />
                </div>
                <span style={{ fontSize: 11, color: C.textSec }}>{kpi.label}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: kpi.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={12} />{kpi.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. Agent Signals Banner ── */}
      <div style={{ ...card, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <Zap size={16} style={{ color: C.accent }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Signals</span>
        </div>
        {signals.map((s, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, backgroundColor: `${signalColor(s.level)}12`, border: `1px solid ${signalColor(s.level)}30` }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: signalColor(s.level) }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: signalColor(s.level) }}>{s.label}</span>
            <span style={{ fontSize: 11, color: C.textSec }}>{s.text}</span>
          </div>
        ))}
      </div>

      {/* ── 4a. Tenets of Council ── */}
      <div style={{ ...card, borderLeft: '3px solid #8b5cf6', padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setTenetsOpen(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <BookOpen size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1, textAlign: 'left' }}>Tenets of Council</span>
          <ChevronDown size={14} style={{ color: C.textSec, transition: 'transform 0.2s', transform: tenetsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
        {tenetsOpen && (
          <div style={{ padding: '0 20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Coherence before action. Mothership first. Always.',
              'We operate from trust, not suspicion.',
              'Responsibility-weighted voice \u2014 greater responsibility, greater say.',
              'Decisions are logged, transparent, and accountable.',
              'The sacred is not reducible to the measurable.',
              'Subsidiarity \u2014 decisions at the lowest competent level.',
              'We honor both Being (Right Side) and Doing (Left Side).',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
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

      {/* ── 4b. Priority Pyramid ── */}
      <div style={{ ...card, padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {([
            { label: 'Member-Led Initiatives', color: '#6b8f71', width: '50%', num: 3 },
            { label: 'Three Core Nodes', color: '#8b5cf6', width: '75%', num: 2 },
            { label: 'Mothership Stability', color: '#d4a574', width: '100%', num: 1 },
          ] as const).map((tier) => (
            <div key={tier.num} style={{
              width: tier.width, backgroundColor: 'rgba(19,23,32,0.9)',
              borderLeft: `3px solid ${tier.color}`, borderRadius: 4,
              padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: tier.color, flexShrink: 0 }}>P{tier.num}</span>
              <span style={{ fontSize: 11, color: C.textSec }}>{tier.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. AI Advisor Quick-Ask ── */}
      <div style={{ ...card, borderLeft: '3px solid #8b5cf6', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={20} style={{ color: '#d4a574' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>AI Advisory Board</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['What should I focus on?', 'Risk assessment', 'Team capacity'].map((q, i) => (
              <button key={i} onClick={() => navigate('advisor')} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 999, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', color: '#a09888', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)'; e.currentTarget.style.color = '#d4a574'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)'; e.currentTarget.style.color = '#a09888'; }}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => navigate('advisor')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(212,165,116,0.12), rgba(139,92,246,0.12))', border: '1px solid rgba(212,165,116,0.2)', color: C.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(139,92,246,0.2))'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,165,116,0.12), rgba(139,92,246,0.12))'; }}>
          <Bot size={14} /> Ask Now <ChevronRight size={12} />
        </button>
      </div>

      {/* ── 6. Quick Actions Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
        {([
          { label: 'Add Task', icon: Plus, view: 'tasks' },
          { label: 'Review OKRs', icon: Target, view: 'okrs' },
          { label: 'Check Nodes', icon: Network, view: 'nodes' },
          { label: 'Team', icon: Users, view: 'team' },
          { label: 'Events', icon: Calendar, view: 'events' },
          { label: 'Leaderboard', icon: Trophy, view: 'leaderboard' },
          { label: 'Ask Advisor', icon: Sparkles, view: 'advisor' },
        ] as const).map((a, i) => {
          const Icon = a.icon;
          return (
            <button key={i} onClick={() => navigate(a.view)}
              style={{ ...card, padding: '14px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'border-color 0.2s, transform 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <Icon size={18} style={{ color: C.textSec }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 6. Active Work Preview ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {/* Left: Top 5 Tasks */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Top Tasks</span>
            <button onClick={() => navigate('tasks')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.textSec, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topTasks.map(t => {
              const ps = priStyle(t.priority);
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: statusDot(t.status) }} />
                  <span style={{ flex: 1, fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999, backgroundColor: ps.bg, color: ps.color }}>{t.priority}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Right: Top 3 OKRs */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>OKR Progress</span>
            <button onClick={() => navigate('okrs')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.textSec, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topOkrs.length === 0 ? (
              <p style={{ fontSize: 13, color: C.textSec, textAlign: 'center', padding: '16px 0', margin: 0 }}>No OKRs active</p>
            ) : topOkrs.map(okr => {
              const avg = Math.round(okr.keyResults.reduce((s, kr) => s + kr.progress, 0) / okr.keyResults.length);
              const oc = okr.status === 'on-track' ? C.success : okr.status === 'at-risk' ? C.warning : C.danger;
              return (
                <div key={okr.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{okr.objective}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: oc, flexShrink: 0 }}>{avg}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(30,38,56,0.6)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, backgroundColor: oc, width: `${avg}%`, transition: 'width 0.4s ease' }} />
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
