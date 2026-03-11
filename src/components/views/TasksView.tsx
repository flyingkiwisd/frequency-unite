'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Tag,
  User,
  CalendarDays,
  Network,
  ChevronRight,
  Plus,
  X,
  Trash2,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import type { Task, TeamMember } from '@/lib/data';
import { InlineAdvisor } from '@/components/InlineAdvisor';

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
    @keyframes task-modal-enter {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes task-overlay-enter {
      from { opacity: 0; }
      to { opacity: 1; }
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
    .task-modal-animated {
      animation: task-modal-enter 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .task-overlay-animated {
      animation: task-overlay-enter 0.2s ease both;
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
    .task-card-hover:hover .task-delete-btn {
      opacity: 1;
    }
    .task-delete-btn {
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .task-row-hover:hover .task-delete-btn {
      opacity: 1;
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
    .task-clickable-badge {
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      user-select: none;
    }
    .task-clickable-badge:hover {
      transform: scale(1.08);
      box-shadow: 0 0 8px rgba(212, 165, 116, 0.2);
    }
    .task-clickable-badge:active {
      transform: scale(0.95);
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
const statusCycle: Task['status'][] = ['todo', 'in-progress', 'done'];
const priorityCycle: Task['priority'][] = ['critical', 'high', 'medium', 'low'];

type FilterTab = 'all' | 'by-priority' | 'by-node' | 'by-status';

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

function getNextStatus(current: Task['status']): Task['status'] {
  if (current === 'blocked') return 'todo';
  const idx = statusCycle.indexOf(current);
  return statusCycle[(idx + 1) % statusCycle.length];
}

function getNextPriority(current: Task['priority']): Task['priority'] {
  const idx = priorityCycle.indexOf(current);
  return priorityCycle[(idx + 1) % priorityCycle.length];
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

// ─── Create Task Modal ───

interface CreateTaskModalProps {
  teamMembers: TeamMember[];
  onClose: () => void;
  onCreate: (task: Omit<Task, 'id'>) => Promise<void>;
}

function CreateTaskModal({ teamMembers, onClose, onCreate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState(teamMembers[0]?.id ?? '');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        owner,
        status: 'todo',
        priority,
        deadline,
        category: category.trim() || 'General',
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0b0d14',
    border: '1px solid rgba(212, 165, 116, 0.12)',
    borderRadius: 8,
    color: '#f0ebe4',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: '#a09888',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div
      className="task-overlay-animated"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="task-modal-animated"
        style={{
          width: 420,
          maxWidth: '90vw',
          backgroundColor: '#131720',
          border: '1px solid rgba(212, 165, 116, 0.12)',
          borderRadius: 16,
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(212, 165, 116, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} style={{ color: '#d4a574' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4' }}>
              Create Task
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b6358',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f0ebe4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6b6358'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Title */}
            <div>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.4)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.12)'; }}
                autoFocus
              />
            </div>

            {/* Owner + Priority row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Owner</label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  style={{
                    ...inputStyle,
                    appearance: 'none' as const,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6358' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    paddingRight: 30,
                    cursor: 'pointer',
                  }}
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  style={{
                    ...inputStyle,
                    appearance: 'none' as const,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6358' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    paddingRight: 30,
                    cursor: 'pointer',
                  }}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Deadline + Category row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    colorScheme: 'dark',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.4)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.12)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Engineering"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.4)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.12)'; }}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #1e2638',
                backgroundColor: 'transparent',
                color: '#a09888',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f0ebe4'; e.currentTarget.style.borderColor = '#3a3f4e'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#a09888'; e.currentTarget.style.borderColor = '#1e2638'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !deadline}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: submitting || !title.trim() || !deadline ? 'rgba(212, 165, 116, 0.15)' : 'rgba(212, 165, 116, 0.2)',
                color: submitting || !title.trim() || !deadline ? '#6b6358' : '#d4a574',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: submitting || !title.trim() || !deadline ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => { if (!submitting && title.trim() && deadline) e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.3)'; }}
              onMouseLeave={(e) => { if (!submitting && title.trim() && deadline) e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.2)'; }}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Task Card (used in kanban and grouped views) ───

function TaskCard({
  task,
  index,
  teamMembers,
  onUpdateTask,
  onDeleteTask,
}: {
  task: Task;
  index: number;
  teamMembers: TeamMember[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pConfig = priorityConfig[task.priority];
  const PriorityIcon = pConfig.icon;

  const member = teamMembers.find((m) => m.id === task.owner);
  const ownerName = member?.name ?? task.owner;
  const ownerInitials = member?.avatar ?? task.owner.slice(0, 2).toUpperCase();
  const ownerColor = member?.color ?? 'bg-slate-500';
  const ownerHex = tailwindToHex[ownerColor] || '#6b6358';

  const overdue = isOverdue(task.deadline) && task.status !== 'done';
  const days = daysUntil(task.deadline);

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = getNextStatus(task.status);
    onUpdateTask(task.id, { status: newStatus });
  };

  const handlePriorityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPriority = getNextPriority(task.priority);
    onUpdateTask(task.id, { priority: newPriority });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const sConfig = statusConfig[task.status];
  const StatusIcon = sConfig.icon;

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
        position: 'relative',
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
      {/* Delete button — visible on hover */}
      {confirmDelete ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            zIndex: 2,
            backgroundColor: '#131720',
            border: '1px solid rgba(201, 84, 74, 0.3)',
            borderRadius: 6,
            padding: '3px 6px',
          }}
        >
          <span style={{ fontSize: 10, color: '#c9544a', fontWeight: 600 }}>Delete?</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
            style={{
              background: 'rgba(201, 84, 74, 0.15)',
              border: 'none',
              borderRadius: 4,
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 600,
              color: '#ef4444',
              fontFamily: 'inherit',
            }}
          >Yes</button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
            style={{
              background: 'rgba(107, 99, 88, 0.15)',
              border: 'none',
              borderRadius: 4,
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 600,
              color: '#a09888',
              fontFamily: 'inherit',
            }}
          >No</button>
        </div>
      ) : (
        <button
          className="task-delete-btn"
          onClick={handleDelete}
          title="Delete task"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(201, 84, 74, 0.1)',
            border: 'none',
            borderRadius: 6,
            padding: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c9544a',
            transition: 'background 0.15s, color 0.15s',
            zIndex: 2,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 84, 74, 0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201, 84, 74, 0.1)'; }}
        >
          <Trash2 size={12} />
        </button>
      )}

      {/* Title */}
      <p style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4', margin: 0, lineHeight: 1.4, marginBottom: 8, paddingRight: 24 }}>
        {task.title}
      </p>

      {/* Badges Row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {/* Status badge — clickable to cycle */}
        <span
          className="task-clickable-badge"
          onClick={handleStatusClick}
          title={`Click to change status (current: ${sConfig.label})`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 7px', borderRadius: 6,
            backgroundColor: sConfig.bg, color: sConfig.color,
            fontSize: 10, fontWeight: 600,
          }}
        >
          <StatusIcon size={10} />
          {sConfig.label}
        </span>
        {/* Priority badge — clickable to cycle */}
        <span
          className="task-clickable-badge"
          onClick={handlePriorityClick}
          title={`Click to change priority (current: ${pConfig.label})`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 7px', borderRadius: 6,
            backgroundColor: pConfig.bg, color: pConfig.color,
            fontSize: 10, fontWeight: 600,
          }}
        >
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
            {ownerInitials}
          </div>
          <span style={{ fontSize: 11, color: '#a09888' }}>
            {ownerName.split(' ')[0]}
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
              Owner: {ownerName}
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

function GroupedByPriority({
  tasks: filteredTasks,
  teamMembers,
  onUpdateTask,
  onDeleteTask,
}: {
  tasks: Task[];
  teamMembers: TeamMember[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}) {
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
              {grouped.map((task, idx) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={idx}
                  teamMembers={teamMembers}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GroupedByNode({
  tasks: filteredTasks,
  teamMembers,
  onUpdateTask,
  onDeleteTask,
}: {
  tasks: Task[];
  teamMembers: TeamMember[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}) {
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
            {grouped.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={idx}
                teamMembers={teamMembers}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupedByStatus({
  tasks: filteredTasks,
  teamMembers,
  onUpdateTask,
  onDeleteTask,
}: {
  tasks: Task[];
  teamMembers: TeamMember[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}) {
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
              {grouped.map((task, idx) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={idx}
                  teamMembers={teamMembers}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───

export function TasksView() {
  const { tasks, teamMembers, updateTask, createTask, deleteTask } = useFrequencyData();

  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDeleteRowId, setConfirmDeleteRowId] = useState<string | null>(null);

  useEffect(() => { injectTaskStyles(); }, []);

  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return ['all', ...Array.from(cats).sort()];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority, filterCategory]);

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
  }, [tasks]);

  const getOwnerName = useCallback((ownerId: string): string => {
    const member = teamMembers.find((m) => m.id === ownerId);
    return member?.name ?? ownerId;
  }, [teamMembers]);

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
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {/* Create Task Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              title="Create new task"
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(212, 165, 116, 0.2)',
                cursor: 'pointer',
                backgroundColor: 'rgba(212, 165, 116, 0.08)',
                color: '#d4a574',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'background 0.15s, border-color 0.15s',
                marginRight: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.16)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.2)';
              }}
            >
              <Plus size={14} />
              New Task
            </button>

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
      {filterTab === 'by-priority' && (
        <GroupedByPriority
          tasks={filteredTasks}
          teamMembers={teamMembers}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      )}
      {filterTab === 'by-node' && (
        <GroupedByNode
          tasks={filteredTasks}
          teamMembers={teamMembers}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      )}
      {filterTab === 'by-status' && (
        <GroupedByStatus
          tasks={filteredTasks}
          teamMembers={teamMembers}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      )}

      {/* ── Kanban Board (only in "all" tab with kanban mode) ── */}
      {filterTab === 'all' && viewMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, minHeight: 400 }}>
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
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={idx}
                      teamMembers={teamMembers}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                    />
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
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ backgroundColor: '#0f1219', borderRadius: 12, border: '1px solid #1e2638', overflow: 'hidden', minWidth: 650 }}>
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 100px 100px 90px 100px 40px',
              padding: '10px 16px',
              borderBottom: '1px solid #1e2638',
              backgroundColor: '#0d1018',
            }}
          >
            {['Task', 'Owner', 'Status', 'Priority', 'Deadline', 'Category', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#6b6358', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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

            const handleRowStatusClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              const newStatus = getNextStatus(task.status);
              updateTask(task.id, { status: newStatus });
            };

            const handleRowPriorityClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              const newPriority = getNextPriority(task.priority);
              updateTask(task.id, { priority: newPriority });
            };

            const handleRowDelete = (e: React.MouseEvent) => {
              e.stopPropagation();
              setConfirmDeleteRowId(task.id);
            };

            return (
              <div
                key={task.id}
                className="task-row-animated task-row-hover"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 100px 100px 90px 100px 40px',
                  padding: '10px 16px',
                  borderBottom: '1px solid #1e2638',
                  borderLeft: `3px solid ${pConfig.borderColor}`,
                  alignItems: 'center',
                  transition: 'background 0.1s',
                  cursor: 'pointer',
                  animationDelay: `${rowIndex * 30}ms`,
                  position: 'relative',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontSize: 12, color: '#f0ebe4', fontWeight: 500 }}>{task.title}</span>
                <span style={{ fontSize: 11, color: '#a09888' }}>{getOwnerName(task.owner).split(' ')[0]}</span>
                <span
                  className="task-clickable-badge"
                  onClick={handleRowStatusClick}
                  title={`Click to change status (current: ${sConfig.label})`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: sConfig.color,
                    padding: '2px 6px', borderRadius: 6, backgroundColor: sConfig.bg, width: 'fit-content',
                  }}
                >
                  <StatusIcon size={11} /> {sConfig.label}
                </span>
                <span
                  className="task-clickable-badge"
                  onClick={handleRowPriorityClick}
                  title={`Click to change priority (current: ${pConfig.label})`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: pConfig.color,
                    padding: '2px 6px', borderRadius: 6, backgroundColor: pConfig.bg, width: 'fit-content',
                  }}
                >
                  <PriorityIcon size={10} /> {pConfig.label}
                </span>
                <span style={{ fontSize: 10, color: overdue ? '#ef4444' : '#6b6358', fontWeight: overdue ? 600 : 400 }}>
                  {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: 10, color: '#a78bfa' }}>{task.category}</span>
                {confirmDeleteRowId === task.id ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: 3 }}
                  >
                    <button
                      onClick={async (e) => { e.stopPropagation(); try { await deleteTask(task.id); } catch (err) { console.error('Failed to delete task:', err); } setConfirmDeleteRowId(null); }}
                      style={{
                        background: 'rgba(201, 84, 74, 0.15)',
                        border: 'none',
                        borderRadius: 4,
                        padding: '2px 5px',
                        cursor: 'pointer',
                        fontSize: 9,
                        fontWeight: 600,
                        color: '#ef4444',
                        fontFamily: 'inherit',
                      }}
                    >Yes</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteRowId(null); }}
                      style={{
                        background: 'rgba(107, 99, 88, 0.15)',
                        border: 'none',
                        borderRadius: 4,
                        padding: '2px 5px',
                        cursor: 'pointer',
                        fontSize: 9,
                        fontWeight: 600,
                        color: '#a09888',
                        fontFamily: 'inherit',
                      }}
                    >No</button>
                  </div>
                ) : (
                  <button
                    className="task-delete-btn"
                    onClick={handleRowDelete}
                    title="Delete task"
                    style={{
                      background: 'none',
                      border: 'none',
                      borderRadius: 6,
                      padding: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#c9544a',
                      transition: 'background 0.15s, opacity 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 84, 74, 0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* ── Create Task Modal ── */}
      {showCreateModal && (
        <CreateTaskModal
          teamMembers={teamMembers}
          onClose={() => setShowCreateModal(false)}
          onCreate={createTask}
        />
      )}

      {/* AI Advisor — Tasks Context */}
      <div style={{ marginTop: 32 }}>
        <InlineAdvisor
          title="Task Advisor"
          titleIcon="bot"
          compact={true}
          defaultCollapsed={true}
          storageKeySuffix="tasks"
          suggestedPrompts={[
            'Which tasks should I prioritize this week?',
            'Who on the team is overloaded right now?',
            'What blocked tasks need unblocking?',
            'Suggest task assignments based on capacity',
          ]}
        />
      </div>
    </div>
  );
}
