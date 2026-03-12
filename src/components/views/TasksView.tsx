'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
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
  GripVertical,
  Link2,
  Sparkles,
  Square,
  CheckSquare2,
  Keyboard,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import type { Task, TeamMember, Node } from '@/lib/data';
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
      from { opacity: 0; transform: translateY(18px) scale(0.96); filter: blur(2px); }
      to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
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
    @keyframes taskShimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes doneGlow {
      0%, 100% { box-shadow: inset 0 0 0 rgba(107,143,113,0); }
      50% { box-shadow: inset 0 0 30px rgba(107,143,113,0.05); }
    }
    @keyframes blockedStripe {
      0% { background-position: 0 0; }
      100% { background-position: 40px 40px; }
    }
    @keyframes slideIndicator {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
    @keyframes countBadgePulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.08); opacity: 0.85; }
    }
    @keyframes emptyColumnPulse {
      0%, 100% { border-color: #1e2638; }
      50% { border-color: #2e3a4e; }
    }
    @keyframes iconBounce {
      0% { transform: translateY(4px); opacity: 0; }
      50% { transform: translateY(-2px); opacity: 1; }
      70% { transform: translateY(1px); }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes progressGrow {
      from { width: 0%; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes columnHeaderGlow {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }
    @keyframes createBtnGlow {
      0%, 100% { box-shadow: 0 0 0 rgba(212, 165, 116, 0); }
      50% { box-shadow: 0 0 20px rgba(212, 165, 116, 0.15); }
    }
    .task-card-animated {
      animation: task-card-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
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
    .task-done-card {
      animation: doneGlow 3s ease-in-out infinite;
      background-image: linear-gradient(
        110deg,
        transparent 30%,
        rgba(107,143,113,0.04) 38%,
        rgba(107,143,113,0.08) 42%,
        rgba(107,143,113,0.04) 46%,
        transparent 54%
      );
      background-size: 200% 100%;
      animation: doneGlow 3s ease-in-out infinite, taskShimmer 4s linear infinite;
    }
    .task-blocked-card {
      background-image: repeating-linear-gradient(
        135deg,
        transparent,
        transparent 10px,
        rgba(201, 84, 74, 0.02) 10px,
        rgba(201, 84, 74, 0.02) 20px
      );
      background-size: 40px 40px;
      animation: blockedStripe 2s linear infinite;
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
      transition: background 0.25s ease-out, color 0.25s ease-out, box-shadow 0.25s ease-out;
      white-space: nowrap;
      position: relative;
    }
    .task-filter-tab::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 15%;
      right: 15%;
      height: 2px;
      background: #d4a574;
      border-radius: 1px;
      transform: scaleX(0);
      transition: transform 0.25s ease-out;
      transform-origin: center;
    }
    .task-filter-tab:hover {
      background: rgba(212, 165, 116, 0.06);
      color: #a09888 !important;
    }
    .task-filter-tab-active {
      background: rgba(212, 165, 116, 0.12) !important;
      color: #d4a574 !important;
      box-shadow: none;
    }
    .task-filter-tab-active::after {
      transform: scaleX(1);
      animation: slideIndicator 0.3s ease-out;
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
    .task-count-badge-pulse {
      animation: countBadgePulse 2s ease-in-out infinite;
    }
    .task-empty-column {
      animation: emptyColumnPulse 2.5s ease-in-out infinite;
    }
    .task-icon-bounce {
      animation: iconBounce 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .task-count-up {
      animation: countUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .task-progress-animated {
      animation: progressGrow 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .task-create-btn:hover {
      animation: createBtnGlow 1.5s ease-in-out infinite;
    }
    .task-create-btn:hover .task-create-icon {
      transform: rotate(90deg);
    }
    .task-create-icon {
      transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    /* ─── Second-pass: Confetti / Sparkle celebration ─── */
    @keyframes sparkle-burst {
      0% { transform: scale(0) rotate(0deg); opacity: 1; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
      100% { transform: scale(0) rotate(360deg); opacity: 0; }
    }
    @keyframes sparkle-particle {
      0% { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
    }
    @keyframes celebration-ring {
      0% { transform: scale(0.5); opacity: 0.8; box-shadow: 0 0 0 0 rgba(107,143,113,0.4); }
      100% { transform: scale(1.5); opacity: 0; box-shadow: 0 0 0 12px rgba(107,143,113,0); }
    }
    @keyframes check-bounce {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.3); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    .task-celebration-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 10;
      overflow: hidden;
      border-radius: 10px;
    }
    .task-celebration-particle {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      animation: sparkle-particle 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .task-celebration-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 24px;
      height: 24px;
      margin: -12px 0 0 -12px;
      border-radius: 50%;
      border: 2px solid rgba(107,143,113,0.5);
      animation: celebration-ring 0.6s ease-out forwards;
    }
    .task-celebration-check {
      animation: check-bounce 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    /* ─── Second-pass: Drag handle grip dots ─── */
    .task-drag-handle {
      opacity: 0;
      transition: opacity 0.15s ease;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3a3f4e;
      flex-shrink: 0;
    }
    .task-drag-handle:active {
      cursor: grabbing;
      color: #d4a574;
    }
    .task-card-hover:hover .task-drag-handle {
      opacity: 1;
    }
    .task-row-hover:hover .task-drag-handle {
      opacity: 1;
    }
    /* ─── Second-pass: Filter height transition ─── */
    .task-filter-results-container {
      transition: max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
      overflow: hidden;
    }
    /* ─── Second-pass: Keyboard shortcut hint ─── */
    @keyframes kbd-hint-enter {
      from { opacity: 0; transform: translateY(4px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .task-kbd-hint {
      position: absolute;
      bottom: -28px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(11, 13, 20, 0.95);
      border: 1px solid rgba(212, 165, 116, 0.2);
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 9px;
      font-weight: 600;
      color: #d4a574;
      white-space: nowrap;
      pointer-events: none;
      z-index: 20;
      animation: kbd-hint-enter 0.15s ease both;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    .task-kbd-hint kbd {
      display: inline-block;
      background: rgba(212, 165, 116, 0.12);
      border: 1px solid rgba(212, 165, 116, 0.2);
      border-radius: 3px;
      padding: 0px 4px;
      font-size: 9px;
      font-family: inherit;
      font-weight: 700;
      color: #d4a574;
      margin: 0 2px;
    }
    /* ─── Second-pass: Batch selection checkbox ─── */
    @keyframes batch-checkbox-enter {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }
    .task-batch-checkbox {
      opacity: 0;
      transition: opacity 0.15s ease;
      cursor: pointer;
      flex-shrink: 0;
    }
    .task-card-hover:hover .task-batch-checkbox,
    .task-row-hover:hover .task-batch-checkbox,
    .task-batch-checkbox.task-batch-visible {
      opacity: 1;
    }
    .task-batch-checkbox-checked {
      animation: batch-checkbox-enter 0.2s ease both;
    }
    /* ─── Second-pass: Smooth reorder / status-change transition ─── */
    .task-reorder-animated {
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
    }
    /* ─── Second-pass: Proportion bar segments ─── */
    @keyframes proportion-segment-grow {
      from { width: 0%; }
    }
    .task-proportion-segment {
      height: 100%;
      transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      animation: proportion-segment-grow 1s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    /* ─── Second-pass: Chain link for blocked-by ─── */
    @keyframes chain-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    .task-chain-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(201, 84, 74, 0.08);
      border: 1px solid rgba(201, 84, 74, 0.15);
      font-size: 9px;
      font-weight: 600;
      color: #c9544a;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .task-chain-link:hover {
      background: rgba(201, 84, 74, 0.15);
      border-color: rgba(201, 84, 74, 0.3);
    }
    .task-chain-link svg {
      animation: chain-pulse 2s ease-in-out infinite;
    }
    /* ─── Second-pass: Subtask mini progress ─── */
    .task-subtask-bar {
      height: 3px;
      border-radius: 1.5px;
      background: rgba(30, 38, 56, 0.8);
      overflow: hidden;
      flex: 1;
      min-width: 30px;
    }
    .task-subtask-fill {
      height: 100%;
      border-radius: 1.5px;
      background: linear-gradient(90deg, #6b8f71, #8bb896);
      transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
    /* ─── Second-pass: Empty state contextual ─── */
    @keyframes empty-icon-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .task-empty-icon-float {
      animation: empty-icon-float 2.5s ease-in-out infinite;
    }
    .task-view-toggle {
      position: relative;
      transition: background 0.25s ease-out, color 0.25s ease-out;
    }
    .task-view-toggle:hover .task-toggle-icon {
      transform: rotate(15deg);
    }
    .task-toggle-icon {
      transition: transform 0.25s ease-out;
    }
    @keyframes task-due-pulse-red {
      0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.3); }
      50% { box-shadow: 0 0 6px rgba(248,113,113,0.15); }
    }
    @keyframes task-group-header-enter {
      from { opacity: 0; transform: translateX(-12px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .task-group-header-animated {
      animation: task-group-header-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .task-due-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      transition: transform 0.15s ease, box-shadow 0.2s ease;
    }
    .task-due-indicator:hover {
      transform: scale(1.05);
    }
    .task-due-overdue {
      background: rgba(248,113,113,0.12);
      color: #f87171;
      border: 1px solid rgba(248,113,113,0.2);
      animation: task-due-pulse-red 2s ease-in-out infinite;
    }
    .task-due-soon {
      background: rgba(251,191,36,0.10);
      color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.15);
    }
    .task-due-ok {
      background: rgba(74,222,128,0.08);
      color: #4ade80;
      border: 1px solid rgba(74,222,128,0.12);
    }
    .task-due-done {
      background: rgba(107,143,113,0.08);
      color: #6b8f71;
      border: 1px solid rgba(107,143,113,0.1);
    }
    .task-avatar-enhanced {
      position: relative;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .task-avatar-enhanced:hover {
      transform: scale(1.12);
      z-index: 5;
    }
    .task-filter-select {
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .task-filter-select:hover {
      border-color: rgba(212, 165, 116, 0.25) !important;
      box-shadow: 0 0 12px rgba(212, 165, 116, 0.06);
    }
    .task-filter-select:focus {
      border-color: rgba(212, 165, 116, 0.4) !important;
      box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.08);
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

function getDueClass(deadline: string, status: Task['status']): string {
  if (status === 'done') return 'task-due-done';
  const days = daysUntil(deadline);
  if (days < 0) return 'task-due-overdue';
  if (days <= 3) return 'task-due-soon';
  return 'task-due-ok';
}

function getDueLabel(deadline: string, status: Task['status']): string {
  if (status === 'done') return 'Completed';
  const days = daysUntil(deadline);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 3) return `${days}d left`;
  return `${days}d left`;
}

// ─── Compact Summary Bar ───

function TaskSummaryBar({ stats }: { stats: { total: number; completed: number; inProgress: number; todo: number; blocked: number; overdue: number; completionPct: number } }) {
  return (
    <div
      className="task-summary-bar card-premium"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #131720 0%, #161d2a 50%, #141923 100%)',
        border: '1px solid #1e2638',
        borderRadius: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle decorative accent line at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.15), transparent)',
      }} />

      {/* Completion mini-ring */}
      <div className="card-stat" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <span className="task-count-up" style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#6b8f71', animationDelay: '0.2s',
          }}>
            {stats.completionPct}%
          </span>
        </div>
        <div>
          <div className="task-count-up" style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', lineHeight: 1, animationDelay: '0.1s' }}>{stats.total}</div>
          <div style={{ fontSize: 10, color: '#6b6358' }}>total tasks</div>
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: 'linear-gradient(180deg, transparent, #1e2638, transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div className="card-stat" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="task-icon-bounce" style={{ display: 'flex', animationDelay: '0.15s' }}>
            <CheckSquare size={13} style={{ color: '#6b8f71' }} />
          </span>
          <span className="task-count-up" style={{ fontSize: 13, fontWeight: 700, color: '#6b8f71', animationDelay: '0.2s' }}>{stats.completed}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>completed</span>
        </div>
        <div className="card-stat" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="task-icon-bounce" style={{ display: 'flex', animationDelay: '0.25s' }}>
            <Clock size={13} style={{ color: '#d4a574' }} />
          </span>
          <span className="task-count-up" style={{ fontSize: 13, fontWeight: 700, color: '#d4a574', animationDelay: '0.3s' }}>{stats.inProgress}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>in-progress</span>
        </div>
        {stats.overdue > 0 && (
          <div className="card-stat" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="task-icon-bounce" style={{ display: 'flex', animationDelay: '0.35s' }}>
              <AlertTriangle size={13} style={{ color: '#ef4444' }} />
            </span>
            <span className="task-count-up" style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', animationDelay: '0.4s' }}>{stats.overdue}</span>
            <span style={{ fontSize: 11, color: '#6b6358' }}>overdue</span>
          </div>
        )}
      </div>

      {/* Progress proportion bar — done / in-progress / todo / blocked */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ display: 'flex', gap: 1, height: 8, backgroundColor: '#1e2638', borderRadius: 4, overflow: 'hidden' }}>
          {stats.completed > 0 && (
            <div className="task-proportion-segment" title={`Done: ${stats.completed}`} style={{
              width: `${(stats.completed / stats.total) * 100}%`,
              background: 'linear-gradient(90deg, #4a7a52, #6b8f71)',
              borderRadius: stats.inProgress === 0 && stats.todo === 0 && stats.blocked === 0 ? 4 : '4px 0 0 4px',
            }} />
          )}
          {stats.inProgress > 0 && (
            <div className="task-proportion-segment" title={`In Progress: ${stats.inProgress}`} style={{
              width: `${(stats.inProgress / stats.total) * 100}%`,
              background: 'linear-gradient(90deg, #c4935e, #d4a574)',
              animationDelay: '0.1s',
            }} />
          )}
          {stats.todo > 0 && (
            <div className="task-proportion-segment" title={`To Do: ${stats.todo}`} style={{
              width: `${(stats.todo / stats.total) * 100}%`,
              background: 'linear-gradient(90deg, #6b6358, #a09888)',
              animationDelay: '0.2s',
            }} />
          )}
          {stats.blocked > 0 && (
            <div className="task-proportion-segment" title={`Blocked: ${stats.blocked}`} style={{
              width: `${(stats.blocked / stats.total) * 100}%`,
              background: 'linear-gradient(90deg, #a03e36, #c9544a)',
              borderRadius: '0 4px 4px 0',
              animationDelay: '0.3s',
            }} />
          )}
        </div>
        {/* Proportion legend */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4, justifyContent: 'flex-end' }}>
          {[
            { label: 'Done', color: '#6b8f71', count: stats.completed },
            { label: 'Active', color: '#d4a574', count: stats.inProgress },
            { label: 'To Do', color: '#a09888', count: stats.todo },
            ...(stats.blocked > 0 ? [{ label: 'Blocked', color: '#c9544a', count: stats.blocked }] : []),
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, backgroundColor: item.color }} />
              <span style={{ fontSize: 9, color: '#6b6358' }}>{item.count} {item.label}</span>
            </div>
          ))}
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
      background: 'linear-gradient(135deg, #0d1018, #0f121c)',
      borderRadius: 10, border: '1px solid #1e2638',
      marginBottom: 16,
      position: 'relative',
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
        className="task-modal-animated card-premium"
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

// ─── Celebration Particles Generator ───

function CelebrationOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  const particles = useMemo(() => {
    const colors = ['#6b8f71', '#8bb896', '#d4a574', '#a78bfa', '#fbbf24', '#4ade80'];
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * 360;
      const distance = 20 + Math.random() * 30;
      const tx = Math.cos((angle * Math.PI) / 180) * distance;
      const ty = Math.sin((angle * Math.PI) / 180) * distance;
      return {
        id: i,
        color: colors[i % colors.length],
        tx: `${tx}px`,
        ty: `${ty}px`,
        delay: `${i * 0.03}s`,
        size: 3 + Math.random() * 4,
      };
    });
  }, []);

  return (
    <div className="task-celebration-overlay">
      <div className="task-celebration-ring" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="task-celebration-particle"
          style={{
            left: '50%', top: '50%',
            width: p.size, height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            '--tx': p.tx, '--ty': p.ty,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Simulated subtask data (derived from task attributes) ───

function getSubtaskInfo(task: Task): { total: number; done: number } | null {
  // Simulate subtask data from task title patterns or category complexity
  // Tasks with longer titles or critical priority tend to have subtasks
  const hash = task.title.length + task.category.length;
  if (hash < 15) return null;
  const total = 2 + (hash % 5);
  const done = task.status === 'done' ? total : task.status === 'in-progress' ? Math.floor(total * 0.4) : task.status === 'blocked' ? Math.floor(total * 0.2) : 0;
  return { total, done };
}

// ─── Get simulated blocking task for blocked tasks ───

function getBlockingTaskTitle(task: Task, allTasks: Task[]): string | null {
  if (task.status !== 'blocked') return null;
  // Find a plausible blocker: an in-progress task from same category or node
  const blocker = allTasks.find(t =>
    t.id !== task.id &&
    t.status === 'in-progress' &&
    (t.category === task.category || (t.node && t.node === task.node))
  );
  return blocker ? blocker.title : null;
}

function TaskCard({
  task,
  index,
  teamMembers,
  allNodes,
  allCategories,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  batchMode,
  isSelected,
  onToggleSelect,
}: {
  task: Task;
  index: number;
  teamMembers: TeamMember[];
  allNodes?: Node[];
  allCategories?: string[];
  allTasks?: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  batchMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showKbdHint, setShowKbdHint] = useState(false);
  const prevStatusRef = useRef(task.status);
  const cardRef = useRef<HTMLDivElement>(null);
  const editable = !!allNodes; // inline editing only when allNodes is passed
  const pConfig = priorityConfig[task.priority];
  const PriorityIcon = pConfig.icon;

  const member = teamMembers.find((m) => m.id === task.owner);
  const ownerName = member?.name ?? task.owner;
  const ownerInitials = member?.avatar ?? task.owner.slice(0, 2).toUpperCase();
  const ownerColor = member?.color ?? 'bg-slate-500';
  const ownerHex = tailwindToHex[ownerColor] || '#6b6358';

  const overdue = isOverdue(task.deadline) && task.status !== 'done';
  const days = daysUntil(task.deadline);
  const subtaskInfo = useMemo(() => getSubtaskInfo(task), [task.title, task.category, task.status]);
  const blockingTitle = useMemo(() => allTasks ? getBlockingTaskTitle(task, allTasks) : null, [task, allTasks]);

  // Celebration effect: detect when task transitions to done
  useEffect(() => {
    if (prevStatusRef.current !== 'done' && task.status === 'done') {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 800);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = task.status;
  }, [task.status]);

  // Keyboard shortcut handler
  useEffect(() => {
    if (!showKbdHint) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        onUpdateTask(task.id, { status: 'done' });
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        onUpdateTask(task.id, { priority: getNextPriority(task.priority) });
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        onUpdateTask(task.id, { status: getNextStatus(task.status) });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showKbdHint, task.id, task.status, task.priority, onUpdateTask]);

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

  const cardStatusClass = task.status === 'done' ? ' task-done-card' : task.status === 'blocked' ? ' task-blocked-card' : '';

  return (
    <div
      ref={cardRef}
      className={`task-card-animated task-card-hover task-reorder-animated card-interactive${cardStatusClass}`}
      style={{
        backgroundColor: isSelected ? 'rgba(212, 165, 116, 0.06)' : 'rgba(19, 23, 32, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: isSelected ? '1px solid rgba(212, 165, 116, 0.3)' : '1px solid #1e2638',
        borderLeft: `3px solid ${pConfig.borderColor}`,
        borderRadius: 10,
        padding: '12px 12px 0 12px',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease-out, box-shadow 0.3s ease-out, transform 0.25s ease-out, background-color 0.2s ease',
        animationDelay: `${index * 60}ms`,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isSelected ? 'rgba(212, 165, 116, 0.4)' : '#2e3a4e';
        e.currentTarget.style.borderLeftColor = pConfig.borderColor;
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${pConfig.borderColor}15`;
        e.currentTarget.style.transform = 'translateY(-2px)';
        setShowKbdHint(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isSelected ? 'rgba(212, 165, 116, 0.3)' : '#1e2638';
        e.currentTarget.style.borderLeftColor = pConfig.borderColor;
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
        setShowKbdHint(false);
      }}
    >
      {/* Celebration sparkle overlay */}
      <CelebrationOverlay show={showCelebration} />

      {/* Gradient overlay on left border - fades to transparent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: `linear-gradient(to bottom, ${pConfig.borderColor}, ${pConfig.borderColor}66, transparent)`,
        pointerEvents: 'none',
        zIndex: 1,
        borderRadius: '10px 0 0 10px',
      }} />

      {/* Top row: drag handle + batch checkbox + delete */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 4 }}>
        {/* Drag handle grip dots */}
        <div className="task-drag-handle" title="Drag to reorder" style={{ marginTop: 1 }}>
          <GripVertical size={14} />
        </div>

        {/* Batch selection checkbox */}
        {onToggleSelect && (
          <div
            className={`task-batch-checkbox ${batchMode || isSelected ? 'task-batch-visible' : ''} ${isSelected ? 'task-batch-checkbox-checked' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleSelect(task.id); }}
            style={{ marginTop: 1, display: 'flex', alignItems: 'center' }}
            title="Select for batch actions"
          >
            {isSelected ? (
              <CheckSquare2 size={14} style={{ color: '#d4a574' }} />
            ) : (
              <Square size={14} style={{ color: '#3a3f4e' }} />
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Keyboard shortcut hints — visible on hover */}
        {showKbdHint && !confirmDelete && (
          <div className="task-kbd-hint" style={{ bottom: 'auto', top: -28, left: '50%' }}>
            <kbd>D</kbd> done <kbd>S</kbd> status <kbd>P</kbd> priority
          </div>
        )}

        {/* Delete button — visible on hover */}
        {confirmDelete ? (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
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
      </div>

      {/* Title — click to edit */}
      {editingField === 'title' ? (
        <div style={{ marginBottom: 8, paddingRight: 24 }}>
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (titleDraft.trim() && titleDraft.trim() !== task.title) onUpdateTask(task.id, { title: titleDraft.trim() });
                setEditingField(null);
              }
              if (e.key === 'Escape') { setTitleDraft(task.title); setEditingField(null); }
            }}
            onBlur={() => {
              if (titleDraft.trim() && titleDraft.trim() !== task.title) onUpdateTask(task.id, { title: titleDraft.trim() });
              setEditingField(null);
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', fontSize: 12, fontWeight: 600, color: '#f0ebe4',
              backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,165,116,0.4)',
              borderRadius: 6, padding: '4px 8px', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
      ) : (
        <p
          onClick={(e) => { if (editable) { e.stopPropagation(); setEditingField('title'); setTitleDraft(task.title); } }}
          style={{
            fontSize: 12, fontWeight: 600, color: '#f0ebe4', margin: 0, lineHeight: 1.4,
            marginBottom: 8, paddingRight: 24, cursor: editable ? 'text' : 'default',
            borderRadius: 4, transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { if (editable) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
          onMouseLeave={(e) => { if (editable) e.currentTarget.style.backgroundColor = 'transparent'; }}
          title={editable ? 'Click to edit' : undefined}
        >
          {task.title}
        </p>
      )}

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
        {/* Category — click to edit */}
        {editingField === 'category' && allCategories ? (
          <select
            value={task.category}
            onChange={(e) => { onUpdateTask(task.id, { category: e.target.value }); setEditingField(null); }}
            onBlur={() => setEditingField(null)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{
              padding: '2px 7px', borderRadius: 6, backgroundColor: 'rgba(139,92,246,0.08)',
              color: '#a78bfa', fontSize: 10, fontWeight: 600,
              border: '1px solid rgba(139,92,246,0.3)', outline: 'none',
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <span
            onClick={(e) => { if (editable) { e.stopPropagation(); setEditingField('category'); } }}
            style={{
              padding: '2px 7px', borderRadius: 6,
              backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#a78bfa',
              fontSize: 10, fontWeight: 600, cursor: editable ? 'pointer' : 'default',
            }}
            title={editable ? 'Click to change category' : undefined}
          >
            {task.category}
          </span>
        )}
        {/* Node badge — click to edit */}
        {editingField === 'node' && allNodes ? (
          <select
            value={task.node || ''}
            onChange={(e) => { onUpdateTask(task.id, { node: e.target.value || undefined }); setEditingField(null); }}
            onBlur={() => setEditingField(null)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{
              padding: '2px 7px', borderRadius: 6, backgroundColor: 'rgba(34,211,153,0.08)',
              color: '#34d399', fontSize: 10, fontWeight: 600,
              border: '1px solid rgba(34,211,153,0.3)', outline: 'none',
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            <option value="">None</option>
            {allNodes.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
          </select>
        ) : task.node ? (
          <span
            onClick={(e) => { if (editable) { e.stopPropagation(); setEditingField('node'); } }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 7px', borderRadius: 6,
              backgroundColor: 'rgba(34, 211, 153, 0.08)', color: '#34d399',
              fontSize: 10, fontWeight: 600, cursor: editable ? 'pointer' : 'default',
            }}
            title={editable ? 'Click to change node' : undefined}
          >
            <Network size={9} />
            {task.node}
          </span>
        ) : editable ? (
          <span
            onClick={(e) => { e.stopPropagation(); setEditingField('node'); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 7px', borderRadius: 6,
              backgroundColor: 'rgba(34,211,153,0.04)', color: '#34d39966',
              fontSize: 10, fontWeight: 600, cursor: 'pointer',
              border: '1px dashed rgba(34,211,153,0.2)',
            }}
            title="Click to assign a node"
          >
            <Network size={9} /> + node
          </span>
        ) : null}
      </div>

      {/* Subtask count indicator with mini progress bar */}
      {subtaskInfo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
          padding: '3px 0',
        }}>
          <Sparkles size={9} style={{ color: '#6b8f71', flexShrink: 0 }} />
          <span style={{ fontSize: 9, color: '#6b6358', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {subtaskInfo.done}/{subtaskInfo.total} subtasks
          </span>
          <div className="task-subtask-bar">
            <div
              className="task-subtask-fill"
              style={{ width: `${(subtaskInfo.done / subtaskInfo.total) * 100}%` }}
            />
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700,
            color: subtaskInfo.done === subtaskInfo.total ? '#6b8f71' : '#a09888',
          }}>
            {Math.round((subtaskInfo.done / subtaskInfo.total) * 100)}%
          </span>
        </div>
      )}

      {/* Blocked-by dependency link */}
      {blockingTitle && (
        <div style={{ marginBottom: 8 }}>
          <span className="task-chain-link" title={`Blocked by: ${blockingTitle}`}>
            <Link2 size={9} />
            <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
              Blocked by: {blockingTitle}
            </span>
          </span>
        </div>
      )}

      {/* Bottom Row: Owner + Deadline */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 12,
      }}>
        {/* Owner — enhanced avatar with click to edit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            className="task-avatar-enhanced"
            title={ownerName}
            style={{
              width: 24, height: 24, borderRadius: '50%',
              padding: 2,
              background: `linear-gradient(135deg, ${ownerHex}80, ${ownerHex})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 8px ${ownerHex}25`,
              flexShrink: 0,
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a1f2e, #0d1018)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 700, color: ownerHex,
              letterSpacing: '0.02em',
            }}>
              {ownerInitials}
            </div>
          </div>
          {editingField === 'owner' ? (
            <select
              value={task.owner}
              onChange={(e) => { onUpdateTask(task.id, { owner: e.target.value }); setEditingField(null); }}
              onBlur={() => setEditingField(null)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                fontSize: 11, color: '#f0ebe4', backgroundColor: '#131720',
                border: '1px solid rgba(212,165,116,0.3)', borderRadius: 6,
                padding: '1px 4px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          ) : (
            <span
              onClick={(e) => { if (editable) { e.stopPropagation(); setEditingField('owner'); } }}
              style={{
                fontSize: 11, color: '#a09888', cursor: editable ? 'pointer' : 'default',
                borderRadius: 4, padding: '1px 4px', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (editable) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(e) => { if (editable) e.currentTarget.style.backgroundColor = 'transparent'; }}
              title={editable ? 'Click to change owner' : undefined}
            >
              {ownerName.split(' ')[0]}
            </span>
          )}
        </div>
        {/* Deadline — color-coded due date indicator */}
        {editingField === 'deadline' ? (
          <input
            type="date"
            value={task.deadline}
            onChange={(e) => { onUpdateTask(task.id, { deadline: e.target.value }); setEditingField(null); }}
            onBlur={() => setEditingField(null)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{
              fontSize: 10, color: '#f0ebe4', backgroundColor: '#131720',
              border: '1px solid rgba(212,165,116,0.3)', borderRadius: 6,
              padding: '1px 4px', outline: 'none', fontFamily: 'inherit',
              cursor: 'pointer', colorScheme: 'dark',
            }}
          />
        ) : (
          <div
            className={`task-due-indicator ${getDueClass(task.deadline, task.status)}`}
            onClick={(e) => { if (editable) { e.stopPropagation(); setEditingField('deadline'); } }}
            style={{
              cursor: editable ? 'pointer' : 'default',
            }}
            title={editable ? `Click to change deadline (${getDueLabel(task.deadline, task.status)})` : getDueLabel(task.deadline, task.status)}
          >
            <CalendarDays size={10} />
            <span>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span style={{ fontSize: 9, opacity: 0.8 }}>{getDueLabel(task.deadline, task.status)}</span>
          </div>
        )}
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

// ─── Contextual Empty State ───

const emptyStateMessages: Record<string, { icon: React.ElementType; message: string; hint: string }> = {
  'todo': { icon: Circle, message: 'No tasks in the backlog', hint: 'Create new tasks to populate your to-do queue' },
  'in-progress': { icon: Clock, message: 'Nothing in progress', hint: 'Move tasks here when you start working on them' },
  'done': { icon: CheckSquare, message: 'No completed tasks yet', hint: 'Mark tasks as done to see them here' },
  'blocked': { icon: AlertOctagon, message: 'No blockers -- smooth sailing!', hint: 'Tasks with dependencies will appear here' },
  'critical': { icon: AlertTriangle, message: 'No critical tasks', hint: 'High-urgency items will appear here when flagged' },
  'high': { icon: ArrowUp, message: 'No high-priority tasks', hint: 'Escalate tasks here to keep them visible' },
  'medium': { icon: ArrowRight, message: 'No medium-priority tasks', hint: 'Standard tasks with moderate urgency live here' },
  'low': { icon: ArrowDown, message: 'No low-priority tasks', hint: 'Nice-to-haves and stretch goals go here' },
};

function ContextualEmptyState({ groupKey, color }: { groupKey: string; color: string }) {
  const config = emptyStateMessages[groupKey] || { icon: Circle, message: 'No tasks in this group', hint: 'Tasks matching this filter will appear here' };
  const Icon = config.icon;
  return (
    <div style={{
      textAlign: 'center', padding: '28px 20px',
      border: '1.5px dashed rgba(30, 38, 56, 0.6)', borderRadius: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      background: 'radial-gradient(ellipse at center, rgba(30, 38, 56, 0.1) 0%, transparent 70%)',
    }}>
      <div className="task-empty-icon-float" style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `1.5px dashed ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}08`,
      }}>
        <Icon size={16} style={{ color: `${color}50` }} />
      </div>
      <span style={{ fontSize: 12, color: '#3a3530', fontWeight: 600 }}>{config.message}</span>
      <span style={{ fontSize: 10, color: '#2a2520' }}>{config.hint}</span>
    </div>
  );
}

// ─── Grouped View Components ───

function GroupedByPriority({
  tasks: filteredTasks,
  teamMembers,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  batchMode,
  selectedIds,
  onToggleSelect,
}: {
  tasks: Task[];
  teamMembers: TeamMember[];
  allTasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  batchMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  const priorities: Task['priority'][] = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="task-filter-results-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {priorities.map((priority, groupIdx) => {
        const pConfig = priorityConfig[priority];
        const PIcon = pConfig.icon;
        const grouped = filteredTasks.filter((t) => t.priority === priority);

        return (
          <div key={priority}>
            <div
              className="task-group-header-animated"
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                paddingBottom: 10, position: 'relative',
                animationDelay: `${groupIdx * 100}ms`,
              }}
            >
              {/* Gradient underline */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${pConfig.borderColor}60, ${pConfig.borderColor}20, transparent)`,
                borderRadius: 1,
              }} />
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: pConfig.bg,
                border: `1px solid ${pConfig.borderColor}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PIcon size={14} style={{ color: pConfig.color }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: pConfig.color, letterSpacing: '-0.01em' }}>{pConfig.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: pConfig.color,
                backgroundColor: pConfig.bg, borderRadius: 12, padding: '3px 10px',
                border: `1px solid ${pConfig.borderColor}20`,
                boxShadow: `0 0 8px ${pConfig.borderColor}10`,
              }}>{grouped.length}</span>
            </div>
            {grouped.length === 0 ? (
              <ContextualEmptyState groupKey={priority} color={pConfig.borderColor} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {grouped.map((task, idx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={idx}
                    teamMembers={teamMembers}
                    allTasks={allTasks}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    batchMode={batchMode}
                    isSelected={selectedIds.has(task.id)}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GroupedByNode({
  tasks: filteredTasks,
  teamMembers,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  batchMode,
  selectedIds,
  onToggleSelect,
}: {
  tasks: Task[];
  teamMembers: TeamMember[];
  allTasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  batchMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
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
    <div className="task-filter-results-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {nodeGroups.map(([nodeName, grouped], groupIdx) => {
        const nodeColor = nodeName === 'No Node' ? '#6b6358' : '#34d399';
        return (
          <div key={nodeName}>
            <div
              className="task-group-header-animated"
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                paddingBottom: 10, position: 'relative',
                animationDelay: `${groupIdx * 100}ms`,
              }}
            >
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${nodeColor}60, ${nodeColor}20, transparent)`,
                borderRadius: 1,
              }} />
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `${nodeColor}12`,
                border: `1px solid ${nodeColor}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Network size={14} style={{ color: nodeColor }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: nodeColor, letterSpacing: '-0.01em' }}>
                {nodeName}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: nodeColor,
                backgroundColor: `${nodeColor}12`, borderRadius: 12, padding: '3px 10px',
                border: `1px solid ${nodeColor}20`,
                boxShadow: `0 0 8px ${nodeColor}10`,
              }}>{grouped.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {grouped.map((task, idx) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={idx}
                  teamMembers={teamMembers}
                  allTasks={allTasks}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  batchMode={batchMode}
                  isSelected={selectedIds.has(task.id)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GroupedByStatus({
  tasks: filteredTasks,
  teamMembers,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  batchMode,
  selectedIds,
  onToggleSelect,
}: {
  tasks: Task[];
  teamMembers: TeamMember[];
  allTasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  batchMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <div className="task-filter-results-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {statusOrder.map((status, groupIdx) => {
        const config = statusConfig[status];
        const SIcon = config.icon;
        const grouped = filteredTasks.filter((t) => t.status === status);

        return (
          <div key={status}>
            <div
              className="task-group-header-animated"
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                paddingBottom: 10, position: 'relative',
                animationDelay: `${groupIdx * 100}ms`,
            }}>
              {/* Gradient underline */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${config.color}60, ${config.color}20, transparent)`,
                borderRadius: 1,
              }} />
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: config.bg,
                border: `1px solid ${config.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <SIcon size={14} style={{ color: config.color }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: config.color, letterSpacing: '-0.01em' }}>{config.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: config.color,
                backgroundColor: config.bg, borderRadius: 12, padding: '3px 10px',
                border: `1px solid ${config.color}20`,
                boxShadow: `0 0 8px ${config.color}10`,
              }}>{grouped.length}</span>
            </div>
            {grouped.length === 0 ? (
              <ContextualEmptyState groupKey={status} color={config.color} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {grouped.map((task, idx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={idx}
                    teamMembers={teamMembers}
                    allTasks={allTasks}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    batchMode={batchMode}
                    isSelected={selectedIds.has(task.id)}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───

// ─── DnD Helper: Droppable Column ───

function DroppableColumn({ status, isOver, children }: { status: string; isOver: boolean; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: status });
  const config = statusConfig[status as Task['status']];
  return (
    <div ref={setNodeRef} style={{
      backgroundColor: isOver ? `${config.color}08` : '#0f1219',
      borderRadius: 12,
      border: `1px solid ${isOver ? config.color + '40' : '#1e2638'}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      transition: 'border-color 0.2s ease, background-color 0.2s ease',
      minHeight: 200,
    }}>
      {children}
    </div>
  );
}

// ─── DnD Helper: Draggable TaskCard Wrapper ───

function DraggableTaskCard(props: {
  task: Task; index: number; teamMembers: TeamMember[];
  allNodes: Node[]; allCategories: string[];
  allTasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  batchMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: props.task.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.35 : 1,
        transition: isDragging ? undefined : 'opacity 0.2s ease',
        zIndex: isDragging ? 100 : 'auto',
      }}
      {...listeners}
      {...attributes}
    >
      <TaskCard {...props} />
    </div>
  );
}

export function TasksView() {
  const { tasks, teamMembers, nodes, updateTask, createTask, deleteTask } = useFrequencyData();

  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDeleteRowId, setConfirmDeleteRowId] = useState<string | null>(null);

  // ─── Batch Selection State ───
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleBatchSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (!batchMode) setBatchMode(true);
  }, [batchMode]);

  const clearBatchSelection = useCallback(() => {
    setSelectedIds(new Set());
    setBatchMode(false);
  }, []);

  const batchUpdateStatus = useCallback(async (newStatus: Task['status']) => {
    await Promise.all(
      Array.from(selectedIds).map(id => updateTask(id, { status: newStatus }))
    );
    clearBatchSelection();
  }, [selectedIds, updateTask, clearBatchSelection]);

  // ─── Drag-and-Drop State ───
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeTask = useMemo(
    () => (activeTaskId ? tasks.find(t => t.id === activeTaskId) ?? null : null),
    [activeTaskId, tasks]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined;
    if (overId && statusOrder.includes(overId as Task['status'])) {
      setOverColumnId(overId);
    } else {
      setOverColumnId(null);
    }
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);
    setOverColumnId(null);
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];
    if (statusOrder.includes(newStatus)) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        await updateTask(taskId, { status: newStatus });
      }
    }
  }, [tasks, updateTask]);

  const handleDragCancel = useCallback(() => {
    setActiveTaskId(null);
    setOverColumnId(null);
  }, []);

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
    backgroundColor: 'rgba(19,23,32,0.9)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 500,
    color: '#c8bfb4',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23d4a574' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: 30,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <div className="scrollbar-autohide" style={{ padding: '24px 32px', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div className="noise-overlay dot-pattern" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 className="text-glow" style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', margin: 0, letterSpacing: '-0.01em' }}>
              Task Commander
            </h1>
            <p style={{ fontSize: 13, color: '#6b6358', margin: '4px 0 0' }}>
              90-day action plan &middot; {stats.total} tasks across all workstreams
            </p>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {/* Create Task Button */}
            <button
              className="task-create-btn"
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
                transition: 'background 0.25s ease-out, border-color 0.25s ease-out, box-shadow 0.3s ease-out',
                marginRight: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.16)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 165, 116, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="task-create-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <Plus size={14} />
              </span>
              New Task
            </button>

            <div style={{
              display: 'flex',
              gap: 2,
              padding: 2,
              borderRadius: 10,
              backgroundColor: 'rgba(11, 13, 20, 0.6)',
              border: '1px solid #1e2638',
            }}>
              <button
                className="task-view-toggle"
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'kanban' ? 'rgba(212, 165, 116, 0.14)' : 'transparent',
                  color: viewMode === 'kanban' ? '#d4a574' : '#6b6358',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontFamily: 'inherit',
                  transition: 'background 0.25s ease-out, color 0.25s ease-out',
                }}
              >
                <span className="task-toggle-icon" style={{ display: 'flex' }}>
                  <LayoutGrid size={15} />
                </span>
                Board
              </button>
              <button
                className="task-view-toggle"
                onClick={() => setViewMode('list')}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'list' ? 'rgba(212, 165, 116, 0.14)' : 'transparent',
                  color: viewMode === 'list' ? '#d4a574' : '#6b6358',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontFamily: 'inherit',
                  transition: 'background 0.25s ease-out, color 0.25s ease-out',
                }}
              >
                <span className="task-toggle-icon" style={{ display: 'flex' }}>
                  <List size={15} />
                </span>
                List
              </button>
            </div>
          </div>
        </div>

        {/* Compact Summary Bar */}
        <TaskSummaryBar stats={stats} />

        {/* Filter Tabs */}
        <FilterTabs active={filterTab} onChange={setFilterTab} />

        {/* Filters */}
        <div className="card-premium" style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          padding: '10px 16px',
          background: 'linear-gradient(135deg, rgba(19,23,32,0.6) 0%, rgba(19,23,32,0.4) 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.03)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px',
            borderRadius: 8,
            background: 'rgba(212,165,116,0.06)',
            border: '1px solid rgba(212,165,116,0.1)',
          }}>
            <Filter size={13} style={{ color: '#d4a574' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#d4a574', letterSpacing: '0.04em' }}>FILTERS</span>
          </div>
          <select className="task-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Task['status'] | 'all')} style={selectStyle}>
            <option value="all">All Statuses</option>
            {statusOrder.map((s) => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
          <select className="task-filter-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as Task['priority'] | 'all')} style={selectStyle}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="task-filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={selectStyle}>
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
                padding: '6px 14px',
                borderRadius: 10,
                border: '1px solid rgba(248,113,113,0.15)',
                cursor: 'pointer',
                backgroundColor: 'rgba(248,113,113,0.06)',
                color: '#f87171',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.12)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.06)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)'; }}
            >
              <X size={11} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Batch Action Toolbar ── */}
      {batchMode && selectedIds.size > 0 && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
            marginBottom: 16, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.08) 0%, rgba(212, 165, 116, 0.04) 100%)',
            border: '1px solid rgba(212, 165, 116, 0.15)',
            animation: 'task-card-enter 0.25s ease both',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d4a574' }}>
            {selectedIds.size} selected
          </span>
          <div style={{ width: 1, height: 20, background: 'rgba(212, 165, 116, 0.15)' }} />
          <span style={{ fontSize: 11, color: '#6b6358', fontWeight: 600 }}>Move to:</span>
          {statusOrder.map(s => {
            const sc = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() => batchUpdateStatus(s)}
                style={{
                  padding: '4px 10px', borderRadius: 6,
                  border: `1px solid ${sc.color}25`,
                  background: sc.bg, color: sc.color,
                  fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${sc.color}50`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${sc.color}25`; }}
              >
                {sc.label}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button
            onClick={clearBatchSelection}
            style={{
              padding: '4px 10px', borderRadius: 6,
              border: '1px solid rgba(248,113,113,0.15)',
              background: 'rgba(248,113,113,0.06)', color: '#f87171',
              fontSize: 10, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.06)'; }}
          >
            <X size={10} />
            Clear
          </button>
        </div>
      )}

      {/* ── Grouped Views (by-priority, by-node, by-status) ── */}
      {filterTab === 'by-priority' && (
        <GroupedByPriority
          tasks={filteredTasks}
          teamMembers={teamMembers}
          allTasks={tasks}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          batchMode={batchMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleBatchSelect}
        />
      )}
      {filterTab === 'by-node' && (
        <GroupedByNode
          tasks={filteredTasks}
          teamMembers={teamMembers}
          allTasks={tasks}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          batchMode={batchMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleBatchSelect}
        />
      )}
      {filterTab === 'by-status' && (
        <GroupedByStatus
          tasks={filteredTasks}
          teamMembers={teamMembers}
          allTasks={tasks}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          batchMode={batchMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleBatchSelect}
        />
      )}

      {/* ── Kanban Board with Drag-and-Drop ── */}
      {filterTab === 'all' && viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, minHeight: 400 }}>
            {statusOrder.map((status) => {
              const config = statusConfig[status];
              const StatusIcon = config.icon;
              const columnTasks = filteredTasks.filter((t) => t.status === status);

              return (
                <DroppableColumn key={status} status={status} isOver={overColumnId === status}>
                  {/* Column Header */}
                  <div style={{
                    padding: '12px 14px',
                    background: `linear-gradient(135deg, ${config.color}08 0%, ${config.color}04 50%, transparent 100%)`,
                    borderBottom: `2px solid ${config.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Bottom border glow effect */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 6,
                      background: `radial-gradient(ellipse at center, ${config.color}20 0%, transparent 70%)`,
                      filter: 'blur(4px)',
                      pointerEvents: 'none',
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StatusIcon size={15} style={{ color: config.color }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: config.color }}>{config.label}</span>
                    </div>
                    <span
                      className={columnTasks.length > 5 ? 'task-count-badge-pulse' : ''}
                      style={{
                        fontSize: 11, fontWeight: 700, backgroundColor: config.bg,
                        color: config.color, borderRadius: 10, padding: '2px 8px',
                        border: `1px solid ${config.color}15`,
                      }}
                    >
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="scrollbar-autohide" style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {columnTasks.map((task, idx) => (
                      <DraggableTaskCard
                        key={task.id}
                        task={task}
                        index={idx}
                        teamMembers={teamMembers}
                        allNodes={nodes}
                        allCategories={categories.filter(c => c !== 'all')}
                        allTasks={tasks}
                        onUpdateTask={updateTask}
                        onDeleteTask={deleteTask}
                        batchMode={batchMode}
                        isSelected={selectedIds.has(task.id)}
                        onToggleSelect={toggleBatchSelect}
                      />
                    ))}
                    {columnTasks.length === 0 && (
                      <div style={{ margin: 4 }}>
                        <ContextualEmptyState groupKey={status} color={config.color} />
                      </div>
                    )}
                  </div>
                </DroppableColumn>
              );
            })}
          </div>

          {/* Drag Overlay — ghost card follows cursor */}
          <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
            {activeTask ? (
              <div style={{ opacity: 0.9, transform: 'rotate(2deg)', pointerEvents: 'none' }}>
                <TaskCard
                  task={activeTask}
                  index={0}
                  teamMembers={teamMembers}
                  onUpdateTask={async () => {}}
                  onDeleteTask={async () => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── List View (only in "all" tab with list mode) ── */}
      {filterTab === 'all' && viewMode === 'list' && (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ backgroundColor: '#0f1219', borderRadius: 12, border: '1px solid #1e2638', overflow: 'hidden', minWidth: 700 }}>
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 24px 1fr 120px 100px 100px 90px 100px 40px',
              padding: '10px 16px',
              borderBottom: '1px solid #1e2638',
              backgroundColor: '#0d1018',
            }}
          >
            {['', '', 'Task', 'Owner', 'Status', 'Priority', 'Deadline', 'Category', ''].map((h, i) => (
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
                className="task-row-animated task-row-hover task-reorder-animated card-interactive"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 24px 1fr 120px 100px 100px 90px 100px 40px',
                  padding: '10px 16px',
                  borderBottom: '1px solid #1e2638',
                  borderLeft: `3px solid ${pConfig.borderColor}`,
                  alignItems: 'center',
                  transition: 'background 0.2s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                  cursor: 'pointer',
                  animationDelay: `${rowIndex * 30}ms`,
                  position: 'relative',
                  backgroundColor: selectedIds.has(task.id) ? 'rgba(212, 165, 116, 0.04)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!selectedIds.has(task.id)) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { if (!selectedIds.has(task.id)) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Drag handle */}
                <div className="task-drag-handle" title="Drag to reorder">
                  <GripVertical size={13} />
                </div>
                {/* Batch checkbox */}
                <div
                  className={`task-batch-checkbox ${batchMode || selectedIds.has(task.id) ? 'task-batch-visible' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleBatchSelect(task.id); }}
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  {selectedIds.has(task.id) ? (
                    <CheckSquare2 size={13} style={{ color: '#d4a574' }} />
                  ) : (
                    <Square size={13} style={{ color: '#3a3f4e' }} />
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#f0ebe4', fontWeight: 500 }}>{task.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {(() => {
                    const m = teamMembers.find((tm) => tm.id === task.owner);
                    const initials = m?.avatar ?? task.owner.slice(0, 2).toUpperCase();
                    const color = tailwindToHex[m?.color ?? ''] || '#6b6358';
                    return (
                      <div
                        className="task-avatar-enhanced"
                        style={{
                          width: 20, height: 20, borderRadius: '50%',
                          padding: 1.5,
                          background: `linear-gradient(135deg, ${color}80, ${color})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{
                          width: 17, height: 17, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1a1f2e, #0d1018)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 7, fontWeight: 700, color,
                        }}>
                          {initials}
                        </div>
                      </div>
                    );
                  })()}
                  <span style={{ fontSize: 11, color: '#a09888' }}>{getOwnerName(task.owner).split(' ')[0]}</span>
                </div>
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
                <span
                  className={`task-due-indicator ${getDueClass(task.deadline, task.status)}`}
                  style={{ fontSize: 10 }}
                >
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
