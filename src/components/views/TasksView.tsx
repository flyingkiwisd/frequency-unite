'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckSquare,
  Circle,
  Clock,
  AlertTriangle,
  AlertOctagon,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Filter,
  LayoutGrid,
  List,
  Flag,
  Tag,
  User,
  CalendarDays,
  Network,
  ChevronRight,
} from 'lucide-react';
import { tasks, teamMembers, type Task } from '@/lib/data';

// ─── CSS Keyframes (injected once) ───

const TASK_STYLE_ID = 'task-view-animations';

function injectTaskStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(TASK_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = TASK_STYLE_ID;
  style.textContent = `
    @keyframes task-card-enter {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes task-summary-enter {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes task-row-enter {
      from { opacity: 0; transform: translateX(-12px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .task-card-animated {
      animation: task-card-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .task-row-animated {
      animation: task-row-enter 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .task-summary-bar {
      animation: task-summary-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .task-detail-reveal {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease, padding 0.3s ease;
      padding: 0 12px;
    }
    .task-card-hover:hover .task-detail-reveal {
      max-height: 120px;
      opacity: 1;
      padding: 8px 12px;
    }
    .task-filter-tab {
      padding: 6px 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      transition: background 0.15s, color 0.15s, box-shadow 0.15s;
      white-space: nowrap;
    }
    .task-filter-tab:hover {
      background: rgba(212, 165, 116, 0.06);
    }
    .task-filter-tab-active {
      background: rgba(212, 165, 116, 0.12) !important;
      color: #d4a574 !important;
      box-shadow: inset 0 -2px 0 0 #d4a574;
    }
  `;
  document.head.appendChild(style);
}

// ─── Config ───

const statusConfig: Record<Task['status'], { label: string; color: string; bg: string; icon: React.ElementType }> = {
  'todo': { label: 'To Do', color: '#a09888', bg: 'rgba(160, 152, 136, 0.08)', icon: Circle },
  'in-progress': { label: 'In Progress', color: '#d4a574', bg: 'rgba(212, 165, 116, 0.08)', icon: Clock },
  'done': { label: 'Done', color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.08)', icon: CheckSquare },
  'blocked': { label: 'Blocked', color: '#c9544a', bg: 'rgba(201, 84, 74, 0.08)', icon: AlertOctagon },
};

const priorityConfig: Record<Task['priority'], { label: string; color: string; bg: string; icon: React.ElementType; borderColor: string }> = {
  'critical': { label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: AlertTriangle, borderColor: '#ef4444' },
  'high': { label: 'High', color: '#d4a574', bg: 'rgba(212, 165, 116, 0.10)', icon: ArrowUp, borderColor: '#d4a574' },
  'medium': { label: 'Medium', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.10)', icon: ArrowRight, borderColor: '#8b5cf6' },
  'low': { label: 'Low', color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.10)', icon: ArrowDown, borderColor: '#6b8f71' },
};

const statusOrder: Task['status'][] = ['todo', 'in-progress', 'done', 'blocked'];

type FilterTab = 'all' | 'by-priority' | 'by-node' | 'by-status';

function getOwnerName(ownerId: string): string {
  const member = teamMembers.find((m) => m.id === ownerId);
  return member?.name ?? ownerId;
}

function getOwnerAvatar(ownerId: string): { initials: string; color: string } {
  const member = teamMembers.find((m) => m.id === ownerId);
  return {
    initials: member?.avatar ?? ownerId.slice(0, 2).toUpperCase(),
    color: member?.color ?? 'bg-slate-500',
  };
}

const tailwindToHex: Record<string, string> = {
  'bg-amber-500': '#f59e0b',
  'bg-rose-400': '#fb7185',
  'bg-violet-500': '#8b5cf6',
  'bg-sky-400': '#38bdf8',
  'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7',
  'bg-pink-400': '#f472b6',
  'bg-teal-400': '#2dd4bf',
  'bg-amber-400': '#fbbf24',
  'bg-green-500': '#22c55e',
  'bg-lime-500': '#84cc16',
  'bg-orange-500': '#f97316',
  'bg-indigo-400': '#818cf8',
  'bg-slate-400': '#94a3b8',
};

function isOverdue(deadline: string): boolean {
  return new Date(deadline) < new Date() && deadline !== '';
}

function daysUntil(deadline: string): number {
  const diff = new Date(deadline).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Compact Summary Bar ───

function TaskSummaryBar({ stats }: { stats: { total: number; completed: number; inProgress: number; overdue: number; completionPct: number } }) {
  return (
    <div
      className="task-summary-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '12px 20px',
        backgroundColor: '#131720',
        border: '1px solid #1e2638',
        borderRadius: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}
    >
      {/* Completion mini-ring */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, position: 'relative' }}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#1e2638" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none" stroke="#6b8f71"
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(stats.completionPct / 100) * 94.25} 94.25`}
              transform="rotate(-90 18 18)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <span style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#6b8f71',
          }}>
            {stats.completionPct}%
          </span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', lineHeight: 1 }}>{stats.total}</div>
          <div style={{ fontSize: 10, color: '#6b6358' }}>total tasks</div>
        </div>
      </div>

      <div style={{ width: 1, height: 28, backgroundColor: '#1e2638' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <CheckSquare size={13} style={{ color: '#6b8f71' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6b8f71' }}>{stats.completed}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={13} style={{ color: '#d4a574' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#d4a574' }}>{stats.inProgress}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>in-progress</span>
        </div>
        {stats.overdue > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <AlertTriangle size={13} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{stats.overdue}</span>
            <span style={{ fontSize: 11, color: '#6b6358' }}>overdue</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ flex: 1, minWidth: 100 }}>
        <div style={{ height: 6, backgroundColor: '#1e2638', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${stats.completionPct}%`, borderRadius: 3,
            background: 'linear-gradient(90deg, #4a7a52, #6b8f71, #8bb896)',
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Filter Tabs ───

function FilterTabs({ active, onChange }: { active: FilterTab; onChange: (t: FilterTab) => void }) {
  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'by-priority', label: 'By Priority' },
    { id: 'by-node', label: 'By Node' },
    { id: 'by-status', label: 'By Status' },
  ];

  return (
    <div style={{
      display: 'flex', gap: 4, padding: '4px',
      backgroundColor: '#0d1018', borderRadius: 10, border: '1px solid #1e2638',
      marginBottom: 16,
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`task-filter-tab ${active === tab.id ? 'task-filter-tab-active' : ''}`}
          onClick={() => onChange(tab.id)}
          style={{
            color: active === tab.id ? '#d4a574' : '#6b6358',
            background: active === tab.id ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Task Card (used in kanban and grouped views) ───

function TaskCard({ task, index }: { task: Task; index: number }) {
  const pConfig = priorityConfig[task.priority];
  const PriorityIcon = pConfig.icon;
  const owner = getOwnerAvatar(task.owner);
  const ownerHex = tailwindToHex[owner.color] || '#6b6358';
  const overdue = isOverdue(task.deadline) && task.status !== 'done';
  const days = daysUntil(task.deadline);

  return (
    <div
      className="task-card-animated task-card-hover"
      style={{
        backgroundColor: '#131720',
        border: '1px solid #1e2638',
        borderLeft: `3px solid ${pConfig.borderColor}`,
        borderRadius: 10,
        padding: '12px 12px 0 12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.2s, transform 0.2s',
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#2e3a4e';
        e.currentTarget.style.borderLeftColor = pConfig.borderColor;
        e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.25), inset 3px 0 0 ${pConfig.borderColor}`;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e2638';
        e.currentTarget.style.borderLeftColor = pConfig.borderColor;
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Title */}
      <p style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4', margin: 0, lineHeight: 1.4, marginBottom: 8 }}>
        {task.title}
      </p>

      {/* Badges Row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {/* Priority */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          padding: '2px 7px', borderRadius: 6,
          backgroundColor: pConfig.bg, color: pConfig.color,
          fontSize: 10, fontWeight: 600,
        }}>
          <PriorityIcon size={10} />
          {pConfig.label}
        </span>
        {/* Category */}
        <span style={{
          padding: '2px 7px', borderRadius: 6,
          backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#a78bfa',
          fontSize: 10, fontWeight: 600,
        }}>
          {task.category}
        </span>
        {/* Node badge */}
        {task.node && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 7px', borderRadius: 6,
            backgroundColor: 'rgba(34, 211, 153, 0.08)', color: '#34d399',
            fontSize: 10, fontWeight: 600,
          }}>
            <Network size={9} />
            {task.node}
          </span>
        )}
      </div>

      {/* Bottom Row: Owner + Deadline */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 12,
      }}>
        {/* Owner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            backgroundColor: ownerHex,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: '#0b0d14',
          }}>
            {owner.initials}
          </div>
          <span style={{ fontSize: 11, color: '#a09888' }}>
            {getOwnerName(task.owner).split(' ')[0]}
          </span>
        </div>
        {/* Deadline */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 10,
          color: overdue ? '#ef4444' : '#6b6358',
          fontWeight: overdue ? 600 : 400,
        }}>
          <CalendarDays size={10} />
          {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Hover reveal: full task details */}
      <div className="task-detail-reveal" style={{
        borderTop: '1px solid #1e2638',
        marginLeft: -12, marginRight: -12,
        backgroundColor: 'rgba(11, 13, 20, 0.6)',
        borderRadius: '0 0 10px 10px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={10} style={{ color: '#6b6358' }} />
            <span style={{ fontSize: 10, color: '#a09888' }}>
              Owner: {getOwnerName(task.owner)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={10} style={{ color: '#6b6358' }} />
            <span style={{ fontSize: 10, color: overdue ? '#ef4444' : '#a09888' }}>
              {overdue ? `Overdue by ${Math.abs(days)} days` : `${days} days remaining`}
            </span>
          </div>
          {task.node && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Network size={10} style={{ color: '#6b6358' }} />
              <span style={{ fontSize: 10, color: '#a09888' }}>Node: {task.node}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={10} style={{ color: '#6b6358' }} />
            <span style={{ fontSize: 10, color: '#a09888' }}>Category: {task.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Grouped View Components ───

function GroupedByPriority({ tasks: filteredTasks }: { tasks: Task[] }) {
  const priorities: Task['priority'][] = ['critical', 'high', 'medium', 'low'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {priorities.map((priority) => {
        const pConfig = priorityConfig[priority];
        const PIcon = pConfig.icon;
        const grouped = filteredTasks.filter((t) => t.priority === priority);
        if (grouped.length === 0) return null;

        return (
          <div key={priority}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
              paddingBottom: 8, borderBottom: `2px solid ${pConfig.borderColor}22`,
            }}>
              <PIcon size={16} style={{ color: pConfig.color }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: pConfig.color }}>{pConfig.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: pConfig.color,
                backgroundColor: pConfig.bg, borderRadius: 10, padding: '2px 8px',
              }}>{grouped.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {grouped.map((task, idx) => <TaskCard key={task.id} task={task} index={idx} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GroupedByNode({ tasks: filteredTasks }: { tasks: Task[] }) {
  const nodeGroups = useMemo(() => {
    const map: Record<string, Task[]> = { 'No Node': [] };
    filteredTasks.forEach((t) => {
      const key = t.node || 'No Node';
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return Object.entries(map).filter(([, ts]) => ts.length > 0).sort((a, b) => {
      if (a[0] === 'No Node') return 1;
      if (b[0] === 'No Node') return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [filteredTasks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {nodeGroups.map(([nodeName, grouped]) => (
        <div key={nodeName}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            paddingBottom: 8, borderBottom: '2px solid rgba(34, 211, 153, 0.12)',
          }}>
            <Network size={16} style={{ color: nodeName === 'No Node' ? '#6b6358' : '#34d399' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: nodeName === 'No Node' ? '#6b6358' : '#34d399' }}>
              {nodeName}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#34d399',
              backgroundColor: 'rgba(34, 211, 153, 0.08)', borderRadius: 10, padding: '2px 8px',
            }}>{grouped.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {grouped.map((task, idx) => <TaskCard key={task.id} task={task} index={idx} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupedByStatus({ tasks: filteredTasks }: { tasks: Task[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {statusOrder.map((status) => {
        const config = statusConfig[status];
        const SIcon = config.icon;
        const grouped = filteredTasks.filter((t) => t.status === status);
        if (grouped.length === 0) return null;

        return (
          <div key={status}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
              paddingBottom: 8, borderBottom: `2px solid ${config.color}22`,
            }}>
              <SIcon size={16} style={{ color: config.color }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: config.color }}>{config.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: config.color,
                backgroundColor: config.bg, borderRadius: 10, padding: '2px 8px',
              }}>{grouped.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {grouped.map((task, idx) => <TaskCard key={task.id} task={task} index={idx} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───

export function TasksView() {
  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  useEffect(() => { injectTaskStyles(); }, []);

  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return ['all', ...Array.from(cats).sort()];
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    });
  }, [filterStatus, filterPriority, filterCategory]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const overdue = tasks.filter((t) => isOverdue(t.deadline) && t.status !== 'done').length;
    return {
      total,
      completed,
      inProgress,
      overdue,
      todo: tasks.filter((t) => t.status === 'todo').length,
      blocked: tasks.filter((t) => t.status === 'blocked').length,
      critical: tasks.filter((t) => t.priority === 'critical').length,
      completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, []);

  const selectStyle: React.CSSProperties = {
    backgroundColor: '#131720',
    border: '1px solid #1e2638',
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: 12,
    color: '#c8bfb4',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6358' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    paddingRight: 28,
  };

  return (
    <div style={{ padding: '24px 32px', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', margin: 0, letterSpacing: '-0.01em' }}>
              Task Commander
            </h1>
            <p style={{ fontSize: 13, color: '#6b6358', margin: '4px 0 0' }}>
              90-day action plan &middot; {stats.total} tasks across all workstreams
            </p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'kanban' ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
                color: viewMode === 'kanban' ? '#d4a574' : '#6b6358',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontFamily: 'inherit',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <LayoutGrid size={15} /> Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'list' ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
                color: viewMode === 'list' ? '#d4a574' : '#6b6358',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontFamily: 'inherit',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <List size={15} /> List
            </button>
          </div>
        </div>

        {/* Compact Summary Bar */}
        <TaskSummaryBar stats={stats} />

        {/* Filter Tabs */}
        <FilterTabs active={filterTab} onChange={setFilterTab} />

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: '#6b6358' }} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Task['status'] | 'all')} style={selectStyle}>
            <option value="all">All Statuses</option>
            {statusOrder.map((s) => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as Task['priority'] | 'all')} style={selectStyle}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={selectStyle}>
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
          {(filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all') && (
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterCategory('all');
              }}
              style={{
                padding: '5px 10px',
                borderRadius: 8,
                border: '1px solid #1e2638',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: '#a09888',
                fontSize: 11,
                fontFamily: 'inherit',
                transition: 'color 0.15s',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Grouped Views (by-priority, by-node, by-status) ── */}
      {filterTab === 'by-priority' && <GroupedByPriority tasks={filteredTasks} />}
      {filterTab === 'by-node' && <GroupedByNode tasks={filteredTasks} />}
      {filterTab === 'by-status' && <GroupedByStatus tasks={filteredTasks} />}

      {/* ── Kanban Board (only in "all" tab with kanban mode) ── */}
      {filterTab === 'all' && viewMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, minHeight: 400 }}>
          {statusOrder.map((status) => {
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            const columnTasks = filteredTasks.filter((t) => t.status === status);

            return (
              <div
                key={status}
                style={{
                  backgroundColor: '#0f1219',
                  borderRadius: 12,
                  border: '1px solid #1e2638',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: `2px solid ${config.color}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusIcon size={15} style={{ color: config.color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: config.color }}>
                      {config.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: config.bg,
                      color: config.color,
                      borderRadius: 10,
                      padding: '2px 8px',
                    }}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {columnTasks.map((task, idx) => (
                    <TaskCard key={task.id} task={task} index={idx} />
                  ))}
                  {columnTasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 20, color: '#3a3530', fontSize: 12 }}>
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List View (only in "all" tab with list mode) ── */}
      {filterTab === 'all' && viewMode === 'list' && (
        <div style={{ backgroundColor: '#0f1219', borderRadius: 12, border: '1px solid #1e2638', overflow: 'hidden' }}>
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 90px 100px 90px 100px',
              padding: '10px 16px',
              borderBottom: '1px solid #1e2638',
              backgroundColor: '#0d1018',
            }}
          >
            {['Task', 'Owner', 'Status', 'Priority', 'Deadline', 'Category'].map((h) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#6b6358', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>
          {/* Table Rows */}
          {filteredTasks.map((task, rowIndex) => {
            const sConfig = statusConfig[task.status];
            const pConfig = priorityConfig[task.priority];
            const PriorityIcon = pConfig.icon;
            const StatusIcon = sConfig.icon;
            const overdue = isOverdue(task.deadline) && task.status !== 'done';

            return (
              <div
                key={task.id}
                className="task-row-animated"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 90px 100px 90px 100px',
                  padding: '10px 16px',
                  borderBottom: '1px solid #1e2638',
                  borderLeft: `3px solid ${pConfig.borderColor}`,
                  alignItems: 'center',
                  transition: 'background 0.1s',
                  cursor: 'pointer',
                  animationDelay: `${rowIndex * 30}ms`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontSize: 12, color: '#f0ebe4', fontWeight: 500 }}>{task.title}</span>
                <span style={{ fontSize: 11, color: '#a09888' }}>{getOwnerName(task.owner).split(' ')[0]}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: sConfig.color }}>
                  <StatusIcon size={11} /> {sConfig.label}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: pConfig.color }}>
                  <PriorityIcon size={10} /> {pConfig.label}
                </span>
                <span style={{ fontSize: 10, color: overdue ? '#ef4444' : '#6b6358', fontWeight: overdue ? 600 : 400 }}>
                  {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: 10, color: '#a78bfa' }}>{task.category}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
