'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CheckCircle2, Plus, Circle, ChevronRight, ChevronDown, X, BookOpen,
  Target, Briefcase, Shield, Calendar, AlertCircle, Check, Clock, Flame,
  Key, Eye, EyeOff, ExternalLink, ShieldCheck, Sparkles, ArrowRight, Loader2,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { InlineAdvisor } from '@/components/InlineAdvisor';
import { getMemberColor } from '@/lib/constants';
import { getApiKey, saveApiKey, removeApiKey, maskApiKey, isValidApiKey, hasApiKey } from '@/lib/apiKey';
import type { Task, OKR } from '@/lib/data';

/* ─── Theme ─── */
const C = {
  card: 'rgba(19, 23, 32, 0.8)', border: 'rgba(30, 38, 56, 0.5)',
  text: '#f0ebe4', textSec: '#a09888', accent: '#d4a574',
  success: '#6b8f71', warning: '#f59e0b', danger: '#ef4444',
} as const;

const card: React.CSSProperties = {
  backgroundColor: C.card, border: `1px solid ${C.border}`,
  borderRadius: 16, padding: 24,
};

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

  const statusBadge = (task: Task) => {
    const s = STATUS_BADGE[task.status] || STATUS_BADGE['todo'];
    const flash = flashId === task.id;
    return (
      <span onClick={(e) => cycleStatus(task, e)} title="Click to cycle status" style={{
        padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
        background: s.bg, color: s.text, cursor: 'pointer', transition: 'all 0.25s ease',
        transform: flash ? 'scale(1.15)' : 'scale(1)', display: 'inline-block',
      }}>{s.label}</span>
    );
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── 1. Hero Greeting + Profile ── */}
      <div style={{ ...card, padding: '28px 24px 20px', borderTop: `3px solid ${hex}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            backgroundColor: hex, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#0b0d14',
          }}>
            {member ? member.name.split(' ').map(w => w[0]).join('').slice(0, 2) : 'JH'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.2 }}>
              {getGreeting()}, {firstName}
            </h1>
            <p style={{ fontSize: 13, color: hex, fontWeight: 600, margin: '2px 0 0' }}>
              {member?.role || 'Steward'}
            </p>
            <p style={{ fontSize: 12, color: C.textSec, margin: '2px 0 0' }}>
              {member?.roleOneSentence || ''}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: loadColor, fontWeight: 600 }}>
            {activeTasks.length} active tasks
          </span>
          {criticalTasks.length > 0 && (
            <span style={{ padding: '1px 7px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
              {criticalTasks.length} critical
            </span>
          )}
          <div style={{ flex: 1, maxWidth: 140, height: 4, borderRadius: 2, background: 'rgba(160,152,136,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: loadColor, width: `${loadPct}%`, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: 11, color: C.textSec }}>{completionRate}% complete</span>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          {[
            { label: 'Active', value: activeTasks.length, color: '#60a5fa' },
            { label: 'Critical', value: criticalTasks.length, color: '#f87171' },
            { label: 'My KRs', value: totalKRs, color: hex },
            { label: 'Done Rate', value: `${completionRate}%`, color: '#4ade80' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{s.value}</div>
              <div style={{ fontSize: 9, color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── API Key Connection ── */}
      <div style={{
        ...card, padding: 0, overflow: 'hidden',
        borderLeft: apiKeyConnected ? '3px solid rgba(107,143,113,0.5)' : '3px solid rgba(212,165,116,0.5)',
      }}>
        <button
          onClick={() => setApiKeyExpanded(e => !e)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
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
          <ChevronDown size={14} style={{ color: C.textSec, transition: 'transform 0.2s', transform: apiKeyExpanded ? 'rotate(180deg)' : 'rotate(0)' }} />
        </button>

        {apiKeyExpanded && (
          <div style={{ padding: '0 16px 16px' }}>
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
                    }}
                  />
                  <button onClick={() => setShowApiKey(s => !s)} title={showApiKey ? 'Hide' : 'Show'}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.textSec }}>
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {apiKeyError && (
                  <p style={{ fontSize: 11, color: C.danger, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={11} /> {apiKeyError}
                  </p>
                )}

                <button onClick={handleSaveApiKey} disabled={apiKeySaving || !apiKeyInput.trim()}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                    backgroundColor: apiKeyInput.trim() && !apiKeySaving ? C.accent : 'rgba(30,38,56,0.5)',
                    color: apiKeyInput.trim() && !apiKeySaving ? '#0b0d14' : C.textSec,
                    fontSize: 13, fontWeight: 600, cursor: apiKeyInput.trim() ? 'pointer' : 'default',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}>
                  {apiKeySaving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Connecting...</>
                    : <><Sparkles size={14} /> Activate AI Advisor</>}
                </button>

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
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'rgba(239,68,68,0.6)', fontFamily: 'inherit' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; }}>
                    Remove key
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {apiKeySaved && (
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        )}
      </div>

      {/* ── 2. Tab Selector ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: -4 }}>
        {(['today', 'week', 'month'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? C.accent : C.textSec,
              borderBottom: activeTab === tab ? `2px solid ${C.accent}` : '2px solid transparent',
              background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}>
            {tab === 'today' ? 'Today' : tab === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* ── 3. Top Priorities ── */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={16} style={{ color: hex }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
              {activeTab === 'today' ? 'Top Priorities' : activeTab === 'week' ? 'Weekly Focus' : 'Monthly Goals'}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 12px', borderRadius: 999,
            backgroundColor: `${hitColor}15`, border: `1px solid ${hitColor}30`,
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: hitColor, fontFamily: 'monospace' }}>{hitRate}%</span>
            <span style={{ fontSize: 11, color: C.textSec }}>hit rate</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {myTasks.length === 0 ? (
            <p style={{ fontSize: 13, color: C.textSec, textAlign: 'center', padding: '20px 0', margin: 0 }}>
              No priorities yet. Add your first commitment below.
            </p>
          ) : myTasks.map((t, i) => {
            const isDone = doneMap[t.id] || t.status === 'done';
            return (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px',
                borderRadius: 10, opacity: isDone ? 0.5 : 1,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.textSec, width: 18, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                <button onClick={() => toggleDone(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
                  {isDone ? <CheckCircle2 size={20} style={{ color: C.success }} /> : <Circle size={20} style={{ color: 'rgba(160,152,136,0.4)' }} />}
                </button>
                <span style={{ flex: 1, fontSize: 14, color: C.text, lineHeight: 1.4, textDecoration: isDone ? 'line-through' : 'none' }}>{t.title}</span>
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
              style={{ flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}`, backgroundColor: 'rgba(11,13,20,0.6)', color: C.text, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={handleAddCommitment} style={{ padding: '8px 14px', borderRadius: 10, border: 'none', backgroundColor: C.accent, color: '#0b0d14', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
            <button onClick={() => { setShowAddForm(false); setNewTitle(''); }} style={{ padding: 8, borderRadius: 10, border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.textSec, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, paddingLeft: 38, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.accent, fontFamily: 'inherit' }}>
            <Plus size={14} /> Add commitment
          </button>
        )}

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, paddingLeft: 38 }}>
          <p style={{ fontSize: 12, color: C.textSec, margin: 0 }}>
            These priorities should ladder up to your OKRs.{' '}
            <button onClick={() => navigate('okrs')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 12, fontFamily: 'inherit', padding: 0, fontWeight: 500 }}>
              View OKRs <ChevronRight size={11} style={{ verticalAlign: 'middle' }} />
            </button>
          </p>
        </div>
      </div>

      {/* ── 4. My Key Results ── */}
      {krsByOkr.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={16} style={{ color: hex }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>My Key Results</span>
              <span style={{ fontSize: 11, color: C.textSec }}>({totalKRs} KRs)</span>
            </div>
            <button onClick={() => navigate('okrs')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.textSec, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          {krsByOkr.map(({ okr, krs }) => {
            const okrS = OKR_STATUS[okr.status] || OKR_STATUS['on-track'];
            return (
              <div key={okr.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.textSec, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {okr.objective}
                  </span>
                  <span style={{ padding: '2px 7px', borderRadius: 6, fontSize: 9, fontWeight: 600, background: okrS.bg, color: okrS.text, flexShrink: 0 }}>{okrS.label}</span>
                </div>
                {krs.map((kr, i) => (
                  <div key={`${okr.id}-${i}`} style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 4, background: 'rgba(28,34,48,0.4)', border: '1px solid rgba(30,38,56,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kr.text}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: hex, marginLeft: 12, flexShrink: 0 }}>{kr.progress}%</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(160,152,136,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 2, background: kr.progress >= 70 ? '#4ade80' : kr.progress >= 40 ? hex : '#f87171', width: `${kr.progress}%`, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Domains & Non-Negotiables ── */}
      {member && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {/* Domains */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Briefcase size={14} style={{ color: hex }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Domains</span>
            </div>
            {member.domains.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: hex, marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Non-Negotiables */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={14} style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Non-Negotiables</span>
              </div>
              <span style={{ fontSize: 10, color: C.textSec }}>daily check</span>
            </div>
            {member.nonNegotiables.map((item, i) => {
              const checked = !!nonNegChecks[i];
              return (
                <div key={i} onClick={() => toggleNonNeg(i)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6, cursor: 'pointer', padding: '3px 0' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    background: checked ? 'rgba(139,92,246,0.2)' : 'rgba(160,152,136,0.08)',
                    border: `1px solid ${checked ? '#8b5cf6' : '#6b6358'}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  }}>
                    {checked && <Check size={12} style={{ color: '#8b5cf6' }} />}
                  </div>
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: checked ? '#8b5cf6' : C.textSec, textDecoration: checked ? 'line-through' : 'none', transition: 'all 0.2s' }}>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 6. Upcoming Events ── */}
      {upcomingEvents.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={14} style={{ color: '#4ade80' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Upcoming Events</span>
            </div>
            <button onClick={() => navigate('events')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.textSec, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          {upcomingEvents.slice(0, 4).map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: C.text }}>{e.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>in {e._days}d</span>
                <span style={{ fontSize: 11, color: C.textSec }}>{e.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 7. AI Advisor ── */}
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

      {/* ── 8. Tenets of Council ── */}
      <div style={{ ...card, borderLeft: '3px solid #8b5cf6', padding: 0, overflow: 'hidden' }}>
        <button onClick={() => setTenetsOpen(o => !o)} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <BookOpen size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1, textAlign: 'left' }}>Tenets of Council</span>
          <ChevronDown size={14} style={{ color: C.textSec, transition: 'transform 0.2s', transform: tenetsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
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

      {/* ── 9. Priority Pyramid ── */}
      <div style={{ ...card, padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {([
            { label: 'Member-Led Initiatives', color: '#6b8f71', width: '50%', num: 3 },
            { label: 'Three Core Nodes', color: '#8b5cf6', width: '75%', num: 2 },
            { label: 'Mothership Stability', color: '#d4a574', width: '100%', num: 1 },
          ] as const).map(tier => (
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
    </div>
  );
}
