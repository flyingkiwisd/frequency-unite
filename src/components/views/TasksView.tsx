'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { tasks, teamMembers, type Task } from '@/lib/data';

const statusConfig: Record<Task['status'], { label: string; color: string; bg: string; icon: React.ElementType }> = {
  'todo': { label: 'To Do', color: '#a09888', bg: 'rgba(160, 152, 136, 0.08)', icon: Circle },
  'in-progress': { label: 'In Progress', color: '#d4a574', bg: 'rgba(212, 165, 116, 0.08)', icon: Clock },
  'done': { label: 'Done', color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.08)', icon: CheckSquare },
  'blocked': { label: 'Blocked', color: '#c9544a', bg: 'rgba(201, 84, 74, 0.08)', icon: AlertOctagon },
};

const priorityConfig: Record<Task['priority'], { label: string; color: string; bg: string; icon: React.ElementType }> = {
  'critical': { label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: AlertTriangle },
  'high': { label: 'High', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', icon: ArrowUp },
  'medium': { label: 'Medium', color: '#d4a574', bg: 'rgba(212, 165, 116, 0.08)', icon: ArrowRight },
  'low': { label: 'Low', color: '#6b6358', bg: 'rgba(107, 99, 88, 0.08)', icon: ArrowDown },
};

const statusOrder: Task['status'][] = ['todo', 'in-progress', 'done', 'blocked'];

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

export function TasksView() {
  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

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

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
    critical: tasks.filter((t) => t.priority === 'critical').length,
  }), []);

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

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {([
            { label: 'Total', value: stats.total, color: '#a09888' },
            { label: 'In Progress', value: stats.inProgress, color: '#d4a574' },
            { label: 'Done', value: stats.done, color: '#6b8f71' },
            { label: 'Blocked', value: stats.blocked, color: '#c9544a' },
            { label: 'Critical', value: stats.critical, color: '#ef4444' },
          ] as const).map((s) => (
            <div
              key={s.label}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                backgroundColor: '#131720',
                border: '1px solid #1e2638',
                minWidth: 90,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: '#6b6358', marginTop: 4, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

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

      {/* ── Kanban Board ── */}
      {viewMode === 'kanban' ? (
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
                  {columnTasks.map((task) => {
                    const pConfig = priorityConfig[task.priority];
                    const PriorityIcon = pConfig.icon;
                    const owner = getOwnerAvatar(task.owner);
                    const ownerHex = tailwindToHex[owner.color] || '#6b6358';
                    const overdue = isOverdue(task.deadline) && task.status !== 'done';

                    return (
                      <div
                        key={task.id}
                        style={{
                          backgroundColor: '#131720',
                          border: '1px solid #1e2638',
                          borderRadius: 10,
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2e3a4e';
                          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#1e2638';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Title */}
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4', margin: 0, lineHeight: 1.4, marginBottom: 8 }}>
                          {task.title}
                        </p>

                        {/* Badges Row */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                          {/* Priority */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              padding: '2px 7px',
                              borderRadius: 6,
                              backgroundColor: pConfig.bg,
                              color: pConfig.color,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            <PriorityIcon size={10} />
                            {pConfig.label}
                          </span>
                          {/* Category */}
                          <span
                            style={{
                              padding: '2px 7px',
                              borderRadius: 6,
                              backgroundColor: 'rgba(139, 92, 246, 0.08)',
                              color: '#a78bfa',
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {task.category}
                          </span>
                          {/* Node badge */}
                          {task.node && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                padding: '2px 7px',
                                borderRadius: 6,
                                backgroundColor: 'rgba(34, 211, 153, 0.08)',
                                color: '#34d399',
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              <Network size={9} />
                              {task.node}
                            </span>
                          )}
                        </div>

                        {/* Bottom Row: Owner + Deadline */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          {/* Owner */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: ownerHex,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 8,
                                fontWeight: 700,
                                color: '#0b0d14',
                              }}
                            >
                              {owner.initials}
                            </div>
                            <span style={{ fontSize: 11, color: '#a09888' }}>
                              {getOwnerName(task.owner).split(' ')[0]}
                            </span>
                          </div>
                          {/* Deadline */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10,
                              color: overdue ? '#ef4444' : '#6b6358',
                              fontWeight: overdue ? 600 : 400,
                            }}
                          >
                            <CalendarDays size={10} />
                            {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
      ) : (
        /* ── List View ── */
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
          {filteredTasks.map((task) => {
            const sConfig = statusConfig[task.status];
            const pConfig = priorityConfig[task.priority];
            const PriorityIcon = pConfig.icon;
            const StatusIcon = sConfig.icon;
            const overdue = isOverdue(task.deadline) && task.status !== 'done';

            return (
              <div
                key={task.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 90px 100px 90px 100px',
                  padding: '10px 16px',
                  borderBottom: '1px solid #1e2638',
                  alignItems: 'center',
                  transition: 'background 0.1s',
                  cursor: 'pointer',
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
