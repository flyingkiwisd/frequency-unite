'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { tailwindColorMap } from '@/lib/constants';
import type { Task, OKR } from '@/lib/data';

// ─── Status cycling config ───
const STATUS_CYCLE: Task['status'][] = ['todo', 'in-progress', 'done'];
const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  'todo':        { bg: 'rgba(107,99,88,0.15)',  text: '#6b6358', label: 'To Do' },
  'in-progress': { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'In Progress' },
  'done':        { bg: 'rgba(107,143,113,0.15)', text: '#6b8f71', label: 'Done' },
  'blocked':     { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', label: 'Blocked' },
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

// ─── Helpers ───
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

export function StewardProfileView({ memberId, onNavigate }: { memberId: string; onNavigate: (view: string) => void }) {
  const { teamMembers, tasks, okrs, events, updateTask, createTask } = useFrequencyData();

  const [flashId, setFlashId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [nonNegChecks, setNonNegChecks] = useState<Record<string, boolean>>({});

  const member = useMemo(() => teamMembers.find(m => m.id === memberId), [teamMembers, memberId]);
  const hex = member ? (tailwindColorMap[member.color] || '#d4a574') : '#d4a574';

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

  const myTasks = useMemo(() => tasks.filter(t => t.owner === memberId), [tasks, memberId]);
  const activeTasks = useMemo(() => myTasks.filter(t => t.status !== 'done'), [myTasks]);
  const criticalTasks = useMemo(() => activeTasks.filter(t => t.priority === 'critical'), [activeTasks]);
  const completionRate = myTasks.length > 0 ? Math.round((myTasks.filter(t => t.status === 'done').length / myTasks.length) * 100) : 0;

  const dailyFocus = useMemo(() =>
    myTasks.filter(t => t.status !== 'done' && (t.priority === 'critical' || t.status === 'in-progress')),
    [myTasks]
  );

  const activeCount = activeTasks.length;
  const loadColor = activeCount < 5 ? '#4ade80' : activeCount <= 8 ? '#f59e0b' : '#f87171';
  const loadPct = Math.min(100, Math.round((activeCount / 12) * 100));

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

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => (e.status === 'upcoming' || e.status === 'planning'))
      .map(e => ({ ...e, _days: daysUntil(e.date) }))
      .filter(e => e._days !== null && e._days >= 0 && e._days <= 30)
      .sort((a, b) => (a._days ?? 0) - (b._days ?? 0));
  }, [events]);

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

  if (!member) {
    return (
      <div style={{
        maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '48px 32px',
        borderRadius: 20, background: 'rgba(19,23,32,0.8)', border: '1px solid rgba(30,38,56,0.5)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
          background: 'rgba(160,152,136,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User style={{ width: 32, height: 32, color: '#6b6358', opacity: 0.5 }} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', margin: '0 0 8px' }}>
          Steward Not Found
        </h2>
        <p style={{ fontSize: 13, color: '#a09888', lineHeight: 1.6, margin: 0 }}>
          This steward profile could not be located. They may have been removed or the link may be invalid.
        </p>
      </div>
    );
  }

  const statusBadge = (task: Task) => {
    const s = STATUS_BADGE[task.status] || STATUS_BADGE['todo'];
    const flash = flashId === task.id;
    return (
      <span onClick={(e) => cycleStatus(task, e)} title="Click to cycle status" style={{
        padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, display: 'inline-block',
        background: s.bg, color: s.text, cursor: 'pointer', transition: 'all 0.25s ease',
        transform: flash ? 'scale(1.15)' : 'scale(1)', boxShadow: flash ? `0 0 8px ${s.text}44` : 'none',
      }}>{s.label}</span>
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @keyframes profileCardEnter { 0% { opacity:0; transform:translateY(16px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes pulseGlow { 0%,100% { box-shadow:0 0 20px ${hex}33,0 0 40px ${hex}11; } 50% { box-shadow:0 0 30px ${hex}44,0 0 60px ${hex}22; } }
        @keyframes progressFill { 0% { width:0; } }
        .profile-card { animation: profileCardEnter 0.5s ease-out both; }
        .profile-card:nth-child(2) { animation-delay:0.05s; }
        .profile-card:nth-child(3) { animation-delay:0.1s; }
        .profile-card:nth-child(4) { animation-delay:0.15s; }
        .profile-card:nth-child(5) { animation-delay:0.2s; }
        .profile-action:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
        .profile-action { transition:all 0.2s ease; }
        .task-row:hover { background:rgba(255,255,255,0.02); }
        .quick-btn:hover { background:rgba(212,165,116,0.12) !important; border-color:rgba(212,165,116,0.25) !important; }
      `}</style>

      {/* ── Hero Card ── */}
      <div className="profile-card" style={{
        position: 'relative', padding: '32px 28px 28px', borderRadius: 20,
        background: 'rgba(19,23,32,0.8)', border: `1px solid ${hex}22`, marginBottom: 20, overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${hex}, ${hex}88, transparent)` }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `linear-gradient(135deg, ${hex}, ${hex}cc)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: 'white', flexShrink: 0,
            boxShadow: `0 8px 24px ${hex}33`, animation: 'pulseGlow 3s ease-in-out infinite',
          }}>
            {member.avatar}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>{member.name}</h1>
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px',
                background: `${hex}18`, color: hex, border: `1px solid ${hex}25`,
              }}>{member.tier.replace('-', ' ')}</span>
            </div>
            <p style={{ fontSize: 14, color: hex, fontWeight: 600, marginBottom: 4 }}>{member.role}</p>

            {/* ── Capacity / Workload Indicator ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: loadColor, fontWeight: 600 }}>
                {activeCount} active task{activeCount !== 1 ? 's' : ''}
              </span>
              {criticalTasks.length > 0 && (
                <span style={{
                  padding: '1px 7px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                  background: 'rgba(239,68,68,0.12)', color: '#f87171',
                }}>
                  {criticalTasks.length} critical
                </span>
              )}
              <div style={{
                flex: 1, maxWidth: 120, height: 4, borderRadius: 2,
                background: 'rgba(160,152,136,0.08)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: loadColor,
                  width: `${loadPct}%`, transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#a09888', lineHeight: 1.5, marginBottom: 0 }}>{member.roleOneSentence}</p>
            {member.hoursPerWeek && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Clock style={{ width: 13, height: 13, color: '#6b6358' }} />
                <span style={{ fontSize: 12, color: '#6b6358' }}>{member.hoursPerWeek} hrs/week</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12,
          marginTop: 24, padding: '16px 0 0', borderTop: '1px solid rgba(160,152,136,0.08)',
        }}>
          {[
            { label: 'Active Tasks', value: activeCount, icon: CheckSquare, color: '#60a5fa' },
            { label: 'Critical', value: criticalTasks.length, icon: AlertCircle, color: '#f87171' },
            { label: 'My KRs', value: totalKRs, icon: Target, color: '#d4a574' },
            { label: 'Completion', value: `${completionRate}%`, icon: Zap, color: '#4ade80' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon style={{ width: 14, height: 14, color: stat.color }} />
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#f0ebe4' }}>{stat.value}</span>
                </div>
                <span style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Actions Row ── */}
      <div className="profile-card" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {([
          { label: 'Add Task', icon: Plus, color: '#d4a574', action: () => setShowAddTask(v => !v) },
          { label: 'Ask Advisor', icon: MessageCircle, color: '#8b5cf6', action: () => onNavigate('advisor') },
          { label: 'View All Tasks', icon: ListTodo, color: '#60a5fa', action: () => onNavigate('tasks') },
        ] as const).map(btn => {
          const Icon = btn.icon;
          return (
            <button key={btn.label} className="quick-btn" onClick={btn.action} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
              background: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)',
              color: btn.color, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <Icon style={{ width: 14, height: 14 }} /> {btn.label}
            </button>
          );
        })}
      </div>

      {/* ── Inline Add Task Form ── */}
      {showAddTask && (
        <div className="profile-card" style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(19,23,32,0.7)', border: '1px solid rgba(212,165,116,0.15)', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTask()} placeholder="Task title..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, background: 'rgba(28,34,48,0.6)', border: '1px solid rgba(30,38,56,0.5)', color: '#f0ebe4', outline: 'none', fontFamily: 'inherit' }} />
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as Task['priority'])} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12, background: 'rgba(28,34,48,0.6)', border: '1px solid rgba(30,38,56,0.5)', color: '#d4a574', fontFamily: 'inherit', cursor: 'pointer' }}>
              {(['critical', 'high', 'medium', 'low'] as const).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <button onClick={handleAddTask} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: `${hex}22`, color: hex, border: `1px solid ${hex}33`, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
          </div>
        </div>
      )}

      {/* ── Daily Focus ── */}
      {dailyFocus.length > 0 && (
        <div className="profile-card" style={{
          padding: '20px 24px', borderRadius: 16,
          background: 'rgba(19,23,32,0.6)', border: `1px solid ${hex}15`, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame style={{ width: 16, height: 16, color: hex }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {"Today's Focus"}
              </h3>
            </div>
            <span style={{ fontSize: 11, color: '#6b6358' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          {dailyFocus.map(task => (
            <div key={task.id} className="task-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, marginBottom: 4 }}>
              <button onClick={(e) => { e.stopPropagation(); updateTask(task.id, { status: 'done' }); }} title="Mark done" style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0, cursor: 'pointer', padding: 0,
                background: 'rgba(160,152,136,0.08)', border: '1px solid rgba(107,99,88,0.27)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'transparent',
              }}>
                <Check style={{ width: 12, height: 12 }} />
              </button>
              <span style={{ fontSize: 13, color: '#f0ebe4', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: priorityColors[task.priority]?.bg, color: priorityColors[task.priority]?.text }}>{task.priority}</span>
              {statusBadge(task)}
            </div>
          ))}
        </div>
      )}

      {/* ── Critical Tasks ── */}
      {criticalTasks.length > 0 && (
        <div className="profile-card" style={{
          padding: '20px 24px', borderRadius: 16,
          background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertCircle style={{ width: 16, height: 16, color: '#f87171' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Action Required — {criticalTasks.length} Critical
            </h3>
          </div>
          {criticalTasks.map(task => (
            <div key={task.id} className="task-row" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: 10, marginBottom: 6, background: 'rgba(19,23,32,0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171' }} />
                <span style={{ fontSize: 13, color: '#f0ebe4' }}>{task.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {task.deadline && <span style={{ fontSize: 11, color: '#6b6358' }}>{task.deadline}</span>}
                {statusBadge(task)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── My Tasks ── */}
      <div className="profile-card" style={{
        padding: '20px 24px', borderRadius: 16,
        background: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare style={{ width: 16, height: 16, color: '#d4a574' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>My Tasks</h3>
            <span style={{ fontSize: 11, color: '#6b6358' }}>({myTasks.length} total)</span>
          </div>
          <button onClick={() => onNavigate('tasks')} className="profile-action" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: 'rgba(212,165,116,0.08)', color: '#d4a574',
            border: '1px solid rgba(212,165,116,0.12)', cursor: 'pointer',
          }}>
            View All <ChevronRight style={{ width: 12, height: 12 }} />
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#6b6358' }}>Progress</span>
            <span style={{ fontSize: 11, color: '#d4a574', fontWeight: 600 }}>{completionRate}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(160,152,136,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${hex}, ${hex}cc)`,
              width: `${completionRate}%`, animation: 'progressFill 0.8s ease-out',
              boxShadow: `0 0 8px ${hex}44`,
            }} />
          </div>
        </div>

        {activeTasks.slice(0, 6).map(task => (
          <div key={task.id} className="task-row" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 12px', borderRadius: 10, marginBottom: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: priorityColors[task.priority]?.text || '#a09888',
              }} />
              <span style={{ fontSize: 13, color: '#f0ebe4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.title}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{
                padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: priorityColors[task.priority]?.bg, color: priorityColors[task.priority]?.text,
              }}>
                {task.priority}
              </span>
              {statusBadge(task)}
            </div>
          </div>
        ))}
        {activeTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: '#6b6358', fontSize: 13 }}>
            <Sparkles style={{ width: 20, height: 20, margin: '0 auto 8px', opacity: 0.4 }} />
            All tasks complete!
          </div>
        )}
      </div>

      {/* ── My Key Results (grouped by OKR) ── */}
      <div className="profile-card" style={{
        padding: '20px 24px', borderRadius: 16,
        background: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target style={{ width: 16, height: 16, color: '#d4a574' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>My Key Results</h3>
            <span style={{ fontSize: 11, color: '#6b6358' }}>({totalKRs} KRs, avg {avgKRProgress}%)</span>
          </div>
          <button onClick={() => onNavigate('okrs')} className="profile-action" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: 'rgba(212,165,116,0.08)', color: '#d4a574',
            border: '1px solid rgba(212,165,116,0.12)', cursor: 'pointer',
          }}>
            View OKRs <ChevronRight style={{ width: 12, height: 12 }} />
          </button>
        </div>

        {krsByOkr.map(({ okr, krs }) => {
          const okrS = OKR_STATUS[okr.status] || OKR_STATUS['on-track'];
          return (
            <div key={okr.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11, color: '#a09888', fontWeight: 600, flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {okr.objective.length > 70 ? okr.objective.slice(0, 70) + '...' : okr.objective}
                </span>
                <span style={{
                  padding: '2px 7px', borderRadius: 6, fontSize: 9, fontWeight: 600,
                  background: okrS.bg, color: okrS.text, flexShrink: 0,
                }}>
                  {okrS.label}
                </span>
              </div>
              {krs.map((kr, i) => (
                <div key={`${okr.id}-${i}`} className="task-row" onClick={() => onNavigate('okrs')} style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                  background: 'rgba(28,34,48,0.4)', border: '1px solid rgba(30,38,56,0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#f0ebe4', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {kr.text}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: hex, marginLeft: 12, flexShrink: 0 }}>
                      {kr.progress}%
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(160,152,136,0.08)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      background: kr.progress >= 70 ? 'linear-gradient(90deg, #4ade80, #22c55e)' :
                        kr.progress >= 40 ? `linear-gradient(90deg, ${hex}, ${hex}cc)` :
                          'linear-gradient(90deg, #f87171, #ef4444)',
                      width: `${kr.progress}%`, animation: 'progressFill 1s ease-out',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        {krsByOkr.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: '#6b6358', fontSize: 13 }}>
            No key results assigned
          </div>
        )}
      </div>

      {/* ── Domains & Non-Negotiables ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="profile-card" style={{
          padding: '20px 24px', borderRadius: 16,
          background: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Briefcase style={{ width: 15, height: 15, color: '#d4a574' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Domains</h3>
          </div>
          {member.domains.map((domain, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: hex, marginTop: 6, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#a09888', lineHeight: 1.5 }}>{domain}</span>
            </div>
          ))}
        </div>

        {/* Non-Negotiables as Checklist */}
        <div className="profile-card" style={{
          padding: '20px 24px', borderRadius: 16,
          background: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield style={{ width: 15, height: 15, color: '#8b5cf6' }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Non-Negotiables</h3>
            </div>
            <span style={{ fontSize: 10, color: '#6b6358' }}>daily check</span>
          </div>
          {member.nonNegotiables.map((item, i) => {
            const checked = !!nonNegChecks[i];
            return (
              <div key={i} onClick={() => toggleNonNeg(i)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, cursor: 'pointer', padding: '4px 0' }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  background: checked ? 'rgba(139,92,246,0.2)' : 'rgba(160,152,136,0.08)',
                  border: `1px solid ${checked ? '#8b5cf6' : '#6b6358'}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease',
                }}>
                  {checked && <Check style={{ width: 12, height: 12, color: '#8b5cf6' }} />}
                </div>
                <span style={{ fontSize: 12, lineHeight: 1.5, color: checked ? '#8b5cf6' : '#a09888', textDecoration: checked ? 'line-through' : 'none', transition: 'all 0.2s ease' }}>{item}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Upcoming Events (within 30 days) ── */}
      {upcomingEvents.length > 0 && (
        <div className="profile-card" style={{
          padding: '20px 24px', borderRadius: 16,
          background: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Calendar style={{ width: 15, height: 15, color: '#4ade80' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Upcoming Events</h3>
          </div>
          {upcomingEvents.map(event => (
            <div key={event.id} className="task-row" onClick={() => onNavigate('events')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#f0ebe4', fontWeight: 500 }}>{event.name}</span>
                <span style={{ fontSize: 11, color: '#6b6358' }}>{event.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>in {event._days} day{event._days !== 1 ? 's' : ''}</span>
                <span style={{ fontSize: 11, color: '#6b6358' }}>{event.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
