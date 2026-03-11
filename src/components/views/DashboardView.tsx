'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  CheckCircle2, Plus, Circle, ChevronRight, ChevronDown, X, BookOpen,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { InlineAdvisor } from '@/components/InlineAdvisor';
import { getMemberColor } from '@/lib/constants';

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
function todayKey() { return `frequency-accountability-${new Date().toISOString().slice(0, 10)}`; }
function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

type DoneMap = Record<string, boolean>;
function loadDoneMap(): DoneMap {
  try { const r = localStorage.getItem(todayKey()); return r ? JSON.parse(r) : {}; } catch { return {}; }
}
function saveDoneMap(m: DoneMap) { localStorage.setItem(todayKey(), JSON.stringify(m)); }

/* ─── Component ─── */
export function DashboardView({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { okrs, tasks, teamMembers, dataSource, updateTask, createTask } = useFrequencyData();
  const { teamMemberId } = useAuth();
  const ownerId = teamMemberId ?? 'james';
  const navigate = useCallback((view: string) => { onNavigate?.(view); }, [onNavigate]);

  /* ── Member info ── */
  const member = useMemo(() => teamMembers.find(t => t.id === teamMemberId), [teamMemberId, teamMembers]);
  const firstName = member ? member.name.split(' ')[0] : 'there';
  const memberColor = member ? getMemberColor(member.color) : C.accent;

  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
  const [tenetsOpen, setTenetsOpen] = useState(false);

  /* ── Priorities ── */
  const [doneMap, setDoneMap] = useState<DoneMap>(() => loadDoneMap());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const myTasks = useMemo(() => {
    const mine = tasks.filter(t => t.owner === ownerId && t.status !== 'done');
    if (activeTab === 'today') {
      return mine.filter(t => t.status === 'in-progress' || t.priority === 'critical' || t.priority === 'high').slice(0, 6);
    }
    if (activeTab === 'week') {
      return mine.sort((a, b) => {
        const p: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (p[a.priority] ?? 3) - (p[b.priority] ?? 3);
      }).slice(0, 10);
    }
    return mine.slice(0, 15);
  }, [tasks, ownerId, activeTab]);

  const completedCount = useMemo(() =>
    myTasks.filter(t => doneMap[t.id] || t.status === 'done').length, [myTasks, doneMap]);
  const hitRate = myTasks.length > 0 ? Math.round((completedCount / myTasks.length) * 100) : 0;
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

  /* ── OKR summary for weekly view ── */
  const myOkrs = useMemo(() =>
    okrs.filter(o => o.keyResults.some(kr => kr.owner === ownerId)).slice(0, 3),
    [okrs, ownerId]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── 1. Hero Greeting (Amphibian style) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          backgroundColor: memberColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#0b0d14', letterSpacing: '-0.02em',
        }}>
          {member ? member.name.split(' ').map(w => w[0]).join('').slice(0, 2) : 'JH'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.2 }}>
            {getGreeting()}, {firstName}
          </h1>
          <p style={{ fontSize: 13, color: C.textSec, margin: '4px 0 0' }}>
            {member?.role || 'Steward'} · {member?.shortRole || 'Frequency'}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: C.textSec }}>{formatDate()}</div>
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

      {/* ── 2. Tab Selector ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: -8 }}>
        {(['today', 'week', 'month'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? C.accent : C.textSec,
              borderBottom: activeTab === tab ? `2px solid ${C.accent}` : '2px solid transparent',
              background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}>
            {tab === 'today' ? 'Today' : tab === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* ── 3. Top Priorities ── */}
      <div style={card}>
        {/* Header with hit rate */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>
            {activeTab === 'today' ? 'Top Priorities' : activeTab === 'week' ? 'Weekly Focus' : 'Monthly Goals'}
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 12px', borderRadius: 999,
            backgroundColor: `${hitColor}15`, border: `1px solid ${hitColor}30`,
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: hitColor, fontFamily: 'monospace' }}>{hitRate}%</span>
            <span style={{ fontSize: 11, color: C.textSec }}>hit rate</span>
          </div>
        </div>

        {/* Numbered priority list */}
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
                borderRadius: 10, transition: 'background-color 0.15s',
                opacity: isDone ? 0.5 : 1,
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Number */}
                <span style={{
                  fontSize: 12, fontWeight: 600, color: C.textSec, width: 18, textAlign: 'right', flexShrink: 0,
                }}>{i + 1}.</span>

                {/* Check circle */}
                <button onClick={() => toggleDone(t.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', flexShrink: 0,
                }}>
                  {isDone
                    ? <CheckCircle2 size={20} style={{ color: C.success }} />
                    : <Circle size={20} style={{ color: 'rgba(160,152,136,0.4)' }} />
                  }
                </button>

                {/* Title */}
                <span style={{
                  flex: 1, fontSize: 14, color: C.text, lineHeight: 1.4,
                  textDecoration: isDone ? 'line-through' : 'none',
                }}>
                  {t.title}
                </span>

                {/* Priority badge (subtle) */}
                {t.priority === 'critical' && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>urgent</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Add commitment */}
        {showAddForm ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingLeft: 38 }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCommitment()}
              placeholder="What are you committing to?" autoFocus
              style={{
                flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 10,
                border: `1px solid ${C.border}`, backgroundColor: 'rgba(11,13,20,0.6)',
                color: C.text, outline: 'none', fontFamily: 'inherit',
              }} />
            <button onClick={handleAddCommitment} style={{
              padding: '8px 14px', borderRadius: 10, border: 'none',
              backgroundColor: C.accent, color: '#0b0d14', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Add</button>
            <button onClick={() => { setShowAddForm(false); setNewTitle(''); }} style={{
              padding: 8, borderRadius: 10, border: `1px solid ${C.border}`,
              backgroundColor: 'transparent', color: C.textSec, cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}><X size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, paddingLeft: 38,
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
            color: C.accent, fontFamily: 'inherit', padding: '0 0 0 38px',
          }}>
            <Plus size={14} /> Add commitment
          </button>
        )}

        {/* Footer text */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, paddingLeft: 38 }}>
          <p style={{ fontSize: 12, color: C.textSec, margin: 0, lineHeight: 1.5 }}>
            These priorities should ladder up to your OKRs.{' '}
            <button onClick={() => navigate('okrs')} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: C.accent,
              fontSize: 12, fontFamily: 'inherit', padding: 0, fontWeight: 500,
            }}>
              View OKRs <ChevronRight size={11} style={{ verticalAlign: 'middle' }} />
            </button>
          </p>
        </div>

        {/* Weekly OKR snapshot (only on week/month tab) */}
        {activeTab !== 'today' && myOkrs.length > 0 && (
          <div style={{ marginTop: 16, paddingLeft: 38 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your OKRs</p>
            {myOkrs.map(okr => {
              const avg = Math.round(okr.keyResults.reduce((s, kr) => s + kr.progress, 0) / Math.max(okr.keyResults.length, 1));
              const color = okr.status === 'on-track' ? C.success : okr.status === 'at-risk' ? C.warning : C.danger;
              return (
                <div key={okr.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: 8 }}>{okr.objective}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color, flexShrink: 0 }}>{avg}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, backgroundColor: 'rgba(30,38,56,0.6)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, backgroundColor: color, width: `${avg}%`, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. AI Advisor (prominent, like Amphibian) ── */}
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

      {/* ── 5. Tenets of Council (compact collapsible) ── */}
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

      {/* ── 6. Priority Pyramid (compact) ── */}
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
    </div>
  );
}
