'use client';

import { useState, useMemo } from 'react';
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
  ArrowRight,
  Calendar,
  Zap,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import type { TeamMember, Task, OKR } from '@/lib/data';

const tailwindColorMap: Record<string, string> = {
  'bg-amber-500': '#f59e0b', 'bg-amber-400': '#fbbf24', 'bg-rose-400': '#fb7185',
  'bg-violet-500': '#8b5cf6', 'bg-sky-400': '#38bdf8', 'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7', 'bg-pink-400': '#f472b6', 'bg-teal-400': '#2dd4bf',
  'bg-green-500': '#22c55e', 'bg-lime-500': '#84cc16', 'bg-orange-500': '#f97316',
  'bg-indigo-400': '#818cf8', 'bg-slate-400': '#94a3b8',
};

interface StewardProfileViewProps {
  memberId: string;
  onNavigate: (view: string) => void;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  'todo': { bg: 'rgba(160, 152, 136, 0.12)', text: '#a09888', label: 'To Do' },
  'in-progress': { bg: 'rgba(59, 130, 246, 0.12)', text: '#60a5fa', label: 'In Progress' },
  'done': { bg: 'rgba(34, 197, 94, 0.12)', text: '#4ade80', label: 'Done' },
  'blocked': { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', label: 'Blocked' },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  'critical': { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171' },
  'high': { bg: 'rgba(251, 146, 60, 0.12)', text: '#fb923c' },
  'medium': { bg: 'rgba(212, 165, 116, 0.12)', text: '#d4a574' },
  'low': { bg: 'rgba(160, 152, 136, 0.12)', text: '#a09888' },
};

export function StewardProfileView({ memberId, onNavigate }: StewardProfileViewProps) {
  const { teamMembers, tasks, okrs, events } = useFrequencyData();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const member = useMemo(() => teamMembers.find(m => m.id === memberId), [teamMembers, memberId]);
  const hex = member ? (tailwindColorMap[member.color] || '#d4a574') : '#d4a574';

  // My tasks (owned by this member)
  const myTasks = useMemo(() =>
    tasks.filter(t => t.owner === memberId),
    [tasks, memberId]
  );

  const activeTasks = useMemo(() =>
    myTasks.filter(t => t.status !== 'done'),
    [myTasks]
  );

  const criticalTasks = useMemo(() =>
    activeTasks.filter(t => t.priority === 'critical'),
    [activeTasks]
  );

  // My OKR key results (owned by this member)
  const myKeyResults = useMemo(() => {
    const results: { okr: OKR; kr: { text: string; progress: number; owner: string }; krIndex: number }[] = [];
    okrs.forEach(okr => {
      okr.keyResults.forEach((kr, idx) => {
        if (kr.owner === memberId) {
          results.push({ okr, kr, krIndex: idx });
        }
      });
    });
    return results;
  }, [okrs, memberId]);

  // Upcoming events
  const upcomingEvents = useMemo(() =>
    events.filter(e => e.status === 'upcoming' || e.status === 'planning'),
    [events]
  );

  // Task completion rate
  const completionRate = myTasks.length > 0
    ? Math.round((myTasks.filter(t => t.status === 'done').length / myTasks.length) * 100)
    : 0;

  // Average KR progress
  const avgKRProgress = myKeyResults.length > 0
    ? Math.round(myKeyResults.reduce((sum, r) => sum + r.kr.progress, 0) / myKeyResults.length)
    : 0;

  if (!member) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#a09888' }}>
        <User style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }} />
        <p>Steward profile not found</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @keyframes profileCardEnter {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px ${hex}33, 0 0 40px ${hex}11; }
          50% { box-shadow: 0 0 30px ${hex}44, 0 0 60px ${hex}22; }
        }
        @keyframes progressFill {
          0% { width: 0; }
        }
        .profile-card { animation: profileCardEnter 0.5s ease-out both; }
        .profile-card:nth-child(2) { animation-delay: 0.05s; }
        .profile-card:nth-child(3) { animation-delay: 0.1s; }
        .profile-card:nth-child(4) { animation-delay: 0.15s; }
        .profile-card:nth-child(5) { animation-delay: 0.2s; }
        .profile-action:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); }
        .profile-action { transition: all 0.2s ease; }
        .task-row:hover { background: rgba(255, 255, 255, 0.02); }
      `}</style>

      {/* ── Hero Card ── */}
      <div
        className="profile-card"
        style={{
          position: 'relative',
          padding: '32px 28px 28px',
          borderRadius: 20,
          background: 'rgba(19, 23, 32, 0.8)',
          border: `1px solid ${hex}22`,
          marginBottom: 20,
          overflow: 'hidden',
        }}
      >
        {/* Gradient accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${hex}, ${hex}88, transparent)`,
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          {/* Avatar */}
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `linear-gradient(135deg, ${hex}, ${hex}cc)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: 'white', flexShrink: 0,
              boxShadow: `0 8px 24px ${hex}33`,
              animation: 'pulseGlow 3s ease-in-out infinite',
            }}
          >
            {member.avatar}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>
                {member.name}
              </h1>
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px',
                background: `${hex}18`, color: hex, border: `1px solid ${hex}25`,
              }}>
                {member.tier.replace('-', ' ')}
              </span>
            </div>
            <p style={{ fontSize: 14, color: hex, fontWeight: 600, marginBottom: 6 }}>
              {member.role}
            </p>
            <p style={{ fontSize: 13, color: '#a09888', lineHeight: 1.5, marginBottom: 0 }}>
              {member.roleOneSentence}
            </p>
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
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          marginTop: 24, padding: '16px 0 0',
          borderTop: '1px solid rgba(160, 152, 136, 0.08)',
        }}>
          {[
            { label: 'Active Tasks', value: activeTasks.length, icon: CheckSquare, color: '#60a5fa' },
            { label: 'Critical', value: criticalTasks.length, icon: AlertCircle, color: '#f87171' },
            { label: 'My KRs', value: myKeyResults.length, icon: Target, color: '#d4a574' },
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

      {/* ── Critical Tasks — Action Required ── */}
      {criticalTasks.length > 0 && (
        <div
          className="profile-card"
          style={{
            padding: '20px 24px',
            borderRadius: 16,
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.12)',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Flame style={{ width: 16, height: 16, color: '#f87171' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Action Required — {criticalTasks.length} Critical
            </h3>
          </div>
          {criticalTasks.map(task => (
            <div
              key={task.id}
              className="task-row"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                background: 'rgba(19, 23, 32, 0.5)', cursor: 'pointer',
              }}
              onClick={() => onNavigate('tasks')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171' }} />
                <span style={{ fontSize: 13, color: '#f0ebe4' }}>{task.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {task.deadline && (
                  <span style={{ fontSize: 11, color: '#6b6358' }}>{task.deadline}</span>
                )}
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: statusColors[task.status]?.bg, color: statusColors[task.status]?.text,
                }}>
                  {statusColors[task.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── My Tasks ── */}
      <div
        className="profile-card"
        style={{
          padding: '20px 24px',
          borderRadius: 16,
          background: 'rgba(19, 23, 32, 0.6)',
          border: '1px solid rgba(30, 38, 56, 0.5)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare style={{ width: 16, height: 16, color: '#d4a574' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>My Tasks</h3>
            <span style={{ fontSize: 11, color: '#6b6358' }}>({myTasks.length} total)</span>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="profile-action"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: 'rgba(212, 165, 116, 0.08)', color: '#d4a574',
              border: '1px solid rgba(212, 165, 116, 0.12)', cursor: 'pointer',
            }}
          >
            View All <ChevronRight style={{ width: 12, height: 12 }} />
          </button>
        </div>

        {/* Task progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#6b6358' }}>Progress</span>
            <span style={{ fontSize: 11, color: '#d4a574', fontWeight: 600 }}>{completionRate}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(160, 152, 136, 0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${hex}, ${hex}cc)`,
              width: `${completionRate}%`,
              animation: 'progressFill 0.8s ease-out',
              boxShadow: `0 0 8px ${hex}44`,
            }} />
          </div>
        </div>

        {activeTasks.slice(0, 6).map(task => (
          <div
            key={task.id}
            className="task-row"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: 10, marginBottom: 4,
              cursor: 'pointer',
            }}
            onClick={() => onNavigate('tasks')}
          >
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
              <span style={{
                padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: statusColors[task.status]?.bg, color: statusColors[task.status]?.text,
              }}>
                {statusColors[task.status]?.label}
              </span>
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

      {/* ── My Key Results ── */}
      <div
        className="profile-card"
        style={{
          padding: '20px 24px',
          borderRadius: 16,
          background: 'rgba(19, 23, 32, 0.6)',
          border: '1px solid rgba(30, 38, 56, 0.5)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target style={{ width: 16, height: 16, color: '#d4a574' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>My Key Results</h3>
            <span style={{ fontSize: 11, color: '#6b6358' }}>({myKeyResults.length} KRs, avg {avgKRProgress}%)</span>
          </div>
          <button
            onClick={() => onNavigate('okrs')}
            className="profile-action"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: 'rgba(212, 165, 116, 0.08)', color: '#d4a574',
              border: '1px solid rgba(212, 165, 116, 0.12)', cursor: 'pointer',
            }}
          >
            View OKRs <ChevronRight style={{ width: 12, height: 12 }} />
          </button>
        </div>

        {myKeyResults.map(({ okr, kr }, i) => (
          <div
            key={`${okr.id}-${i}`}
            style={{
              padding: '12px 14px', borderRadius: 12, marginBottom: 8,
              background: 'rgba(28, 34, 48, 0.4)',
              border: '1px solid rgba(30, 38, 56, 0.3)',
              cursor: 'pointer',
            }}
            className="task-row"
            onClick={() => onNavigate('okrs')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#f0ebe4', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {kr.text}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: hex, marginLeft: 12, flexShrink: 0 }}>
                {kr.progress}%
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(160, 152, 136, 0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: kr.progress >= 70 ? 'linear-gradient(90deg, #4ade80, #22c55e)' :
                  kr.progress >= 40 ? `linear-gradient(90deg, ${hex}, ${hex}cc)` :
                    'linear-gradient(90deg, #f87171, #ef4444)',
                width: `${kr.progress}%`,
                animation: 'progressFill 1s ease-out',
              }} />
            </div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 10, color: '#6b6358' }}>
                {okr.objective.length > 60 ? okr.objective.slice(0, 60) + '...' : okr.objective}
              </span>
            </div>
          </div>
        ))}
        {myKeyResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: '#6b6358', fontSize: 13 }}>
            No key results assigned
          </div>
        )}
      </div>

      {/* ── Domains & Non-Negotiables ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Domains */}
        <div
          className="profile-card"
          style={{
            padding: '20px 24px',
            borderRadius: 16,
            background: 'rgba(19, 23, 32, 0.6)',
            border: '1px solid rgba(30, 38, 56, 0.5)',
          }}
        >
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

        {/* Non-Negotiables */}
        <div
          className="profile-card"
          style={{
            padding: '20px 24px',
            borderRadius: 16,
            background: 'rgba(19, 23, 32, 0.6)',
            border: '1px solid rgba(30, 38, 56, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Shield style={{ width: 15, height: 15, color: '#8b5cf6' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Non-Negotiables</h3>
          </div>
          {member.nonNegotiables.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#8b5cf6', marginTop: 6, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#a09888', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Navigation ── */}
      <div
        className="profile-card"
        style={{
          padding: '20px 24px',
          borderRadius: 16,
          background: 'rgba(19, 23, 32, 0.6)',
          border: '1px solid rgba(30, 38, 56, 0.5)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ArrowRight style={{ width: 15, height: 15, color: '#d4a574' }} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Quick Navigation</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Dashboard', view: 'dashboard', icon: Sparkles, color: '#d4a574' },
            { label: 'Tasks', view: 'tasks', icon: CheckSquare, color: '#60a5fa' },
            { label: 'OKRs', view: 'okrs', icon: Target, color: '#f59e0b' },
            { label: 'Events', view: 'events', icon: Calendar, color: '#4ade80' },
          ].map(nav => {
            const Icon = nav.icon;
            return (
              <button
                key={nav.view}
                onClick={() => onNavigate(nav.view)}
                className="profile-action"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 8px', borderRadius: 12,
                  background: 'rgba(28, 34, 48, 0.4)',
                  border: '1px solid rgba(30, 38, 56, 0.3)',
                  color: nav.color, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Icon style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#a09888' }}>{nav.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Upcoming Events ── */}
      {upcomingEvents.length > 0 && (
        <div
          className="profile-card"
          style={{
            padding: '20px 24px',
            borderRadius: 16,
            background: 'rgba(19, 23, 32, 0.6)',
            border: '1px solid rgba(30, 38, 56, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Calendar style={{ width: 15, height: 15, color: '#4ade80' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Upcoming Events</h3>
          </div>
          {upcomingEvents.map(event => (
            <div
              key={event.id}
              className="task-row"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('events')}
            >
              <div>
                <span style={{ fontSize: 13, color: '#f0ebe4', fontWeight: 500 }}>{event.name}</span>
                <span style={{ fontSize: 11, color: '#6b6358', marginLeft: 8 }}>{event.date}</span>
              </div>
              <span style={{ fontSize: 11, color: '#6b6358' }}>{event.location}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
