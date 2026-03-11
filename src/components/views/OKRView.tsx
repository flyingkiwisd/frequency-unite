'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Target, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle,
  XCircle, BarChart3, ChevronDown, Flame, MessageSquarePlus, X, Check,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import type { OKR, KPI } from '@/lib/data';
import { InlineAdvisor } from '@/components/InlineAdvisor';

// ─── CSS Keyframes (injected once) ───

const STYLE_ID = 'okr-view-animations';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes okr-pulse-risk {
      0%, 100% { box-shadow: 0 0 0 0 rgba(212,165,116,0.4); }
      50% { box-shadow: 0 0 0 6px rgba(212,165,116,0); }
    }
    @keyframes okr-pulse-behind {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
      50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
    }
    @keyframes okr-card-enter {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes okr-ring-fill {
      from { stroke-dasharray: 0 138.23; }
    }
    @keyframes okr-bar-grow {
      from { width: 0%; }
    }
    @keyframes okr-summary-enter {
      from { opacity: 0; transform: translateY(-12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .okr-card-animated {
      animation: okr-card-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .okr-summary-bar {
      animation: okr-summary-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .okr-pulse-at-risk {
      animation: okr-pulse-risk 2s ease-in-out infinite;
    }
    .okr-pulse-behind {
      animation: okr-pulse-behind 1.6s ease-in-out infinite;
    }
    .okr-progress-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) scale(0.9);
      opacity: 0;
      background: #1a1f2e;
      border: 1px solid #2e3a4e;
      border-radius: 8px;
      padding: 8px 12px;
      pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
      white-space: nowrap;
      z-index: 30;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }
    .okr-bar-wrapper:hover .okr-progress-tooltip {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
  `;
  document.head.appendChild(style);
}

// ─── Local-only edits (confidence & notes — not in DataProvider) ───

interface LocalEdits {
  notes: Record<string, Record<number, string>>;
  confidence: Record<string, number>;
}

function emptyLocalEdits(): LocalEdits {
  return { notes: {}, confidence: {} };
}

// ─── Helpers ───

function trendIcon(trend: KPI['trend']) {
  const map = {
    up: { Icon: TrendingUp, color: '#6b8f71' },
    down: { Icon: TrendingDown, color: '#ef4444' },
    flat: { Icon: Minus, color: '#6b6358' },
  };
  return map[trend];
}

const statusCycle: OKR['status'][] = ['on-track', 'at-risk', 'behind'];

function statusBadge(status: OKR['status']): { bg: string; text: string; label: string; Icon: React.ElementType } {
  const map = {
    'on-track': { bg: 'rgba(107,143,113,0.15)', text: '#6b8f71', label: 'On Track', Icon: CheckCircle2 },
    'at-risk': { bg: 'rgba(212,165,116,0.15)', text: '#d4a574', label: 'At Risk', Icon: AlertTriangle },
    'behind': { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', label: 'Behind', Icon: XCircle },
  };
  return map[status];
}

const categoryColors: Record<string, string> = {
  Membership: '#8b5cf6', Financial: '#d4a574', Operations: '#60a5fa', Community: '#6b8f71', Impact: '#f472b6',
};

function progressGradient(progress: number): string {
  if (progress >= 60) return 'linear-gradient(90deg, #4a7a52, #6b8f71, #8bb896)';
  if (progress >= 30) return 'linear-gradient(90deg, #b8864a, #d4a574, #e8c89a)';
  return 'linear-gradient(90deg, #c43030, #ef4444, #f87171)';
}

function progressColor(progress: number): string {
  if (progress >= 60) return '#6b8f71';
  if (progress >= 30) return '#d4a574';
  return '#ef4444';
}

// ─── Animated Progress Ring ───

function AnimatedProgressRing({
  progress,
  size = 64,
  strokeWidth = 5,
  color,
  delay = 0,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  delay?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), delay);
    return () => clearTimeout(timer);
  }, [progress, delay]);

  const dashOffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`ring-grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1e2638" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#ring-grad-${color.replace('#', '')})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
        {/* Glow dot at the end of the arc */}
        {animatedProgress > 3 && (
          <circle
            cx={size / 2 + radius * Math.cos(((animatedProgress / 100) * 360 - 90) * Math.PI / 180)}
            cy={size / 2 + radius * Math.sin(((animatedProgress / 100) * 360 - 90) * Math.PI / 180)}
            r={strokeWidth / 2 + 1}
            fill={color}
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
              transition: 'cx 1s cubic-bezier(0.22, 1, 0.36, 1), cy 1s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        )}
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size > 56 ? 15 : 13, fontWeight: 700, color,
      }}>
        {progress}%
      </span>
    </div>
  );
}

// ─── Sub-components ───

function ConfidenceFlames({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hover || value);
        return (
          <button
            key={n}
            onClick={(e) => { e.stopPropagation(); onChange(n); }}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: 'none', border: 'none', padding: 1, cursor: 'pointer',
              display: 'flex', alignItems: 'center', transition: 'transform 0.15s',
              transform: hover === n ? 'scale(1.2)' : 'scale(1)',
            }}
            title={`Confidence: ${n}/5`}
          >
            <Flame size={16} style={{
              color: active ? '#d4a574' : '#2e3a4e',
              fill: active ? 'rgba(212,165,116,0.5)' : 'none',
              transition: 'color 0.15s, fill 0.15s',
            }} />
          </button>
        );
      })}
      {value > 0 && (
        <span style={{ fontSize: 10, color: '#6b6358', marginLeft: 4, fontWeight: 600 }}>{value}/5</span>
      )}
    </div>
  );
}

function InlineProgressEditor({ current, onSave, onCancel }: { current: number; onSave: (v: number) => void; onCancel: () => void }) {
  const [val, setVal] = useState(String(current));
  const inputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  const commit = () => onSave(Math.max(0, Math.min(100, parseInt(val, 10) || 0)));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef} type="number" min={0} max={100} value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onCancel(); }}
        onBlur={commit}
        style={{
          width: 48, padding: '2px 6px', backgroundColor: '#0b0d14', border: '1px solid #d4a574',
          borderRadius: 4, color: '#f0ebe4', fontSize: 12, fontWeight: 700, textAlign: 'center',
          fontFamily: 'inherit', outline: 'none',
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, color: '#6b6358' }}>%</span>
      <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
        <Check size={14} style={{ color: '#6b8f71' }} />
      </button>
      <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
        <X size={14} style={{ color: '#ef4444' }} />
      </button>
    </div>
  );
}

function NoteEditor({ initial, onSave, onClose }: { initial: string; onSave: (text: string) => void; onClose: () => void }) {
  const [text, setText] = useState(initial);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div
      style={{ marginTop: 8, padding: '8px 10px', backgroundColor: 'rgba(212,165,116,0.05)', border: '1px solid rgba(212,165,116,0.15)', borderRadius: 8 }}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={ref} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Add a note or update..." rows={2}
        style={{
          width: '100%', backgroundColor: 'transparent', border: 'none', color: '#a09888',
          fontSize: 12, fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.5,
        }}
      />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
        <button onClick={onClose} style={{
          padding: '4px 10px', fontSize: 11, fontWeight: 600, backgroundColor: 'transparent',
          border: '1px solid #1e2638', borderRadius: 6, color: '#6b6358', cursor: 'pointer', fontFamily: 'inherit',
        }}>Cancel</button>
        <button onClick={() => { onSave(text); onClose(); }} style={{
          padding: '4px 10px', fontSize: 11, fontWeight: 600, backgroundColor: 'rgba(212,165,116,0.15)',
          border: '1px solid rgba(212,165,116,0.25)', borderRadius: 6, color: '#d4a574', cursor: 'pointer', fontFamily: 'inherit',
        }}>Save</button>
      </div>
    </div>
  );
}

function QuarterComparisonChart({ okrData }: { okrData: OKR[] }) {
  const quarterData = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    okrData.forEach((okr) => {
      if (!map[okr.quarter]) map[okr.quarter] = { total: 0, count: 0 };
      const avg = okr.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / okr.keyResults.length;
      map[okr.quarter].total += avg;
      map[okr.quarter].count += 1;
    });
    return Object.entries(map)
      .map(([quarter, d]) => ({ quarter, average: Math.round(d.total / d.count) }))
      .sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [okrData]);

  const maxVal = Math.max(...quarterData.map((d) => d.average), 1);
  const barMaxH = 100, barW = 48, gap = 24;
  const totalW = quarterData.length * (barW + gap) - gap + 40;

  return (
    <div style={{ backgroundColor: '#131720', border: '1px solid #1e2638', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', marginTop: 0, marginBottom: 16 }}>
        Quarter Comparison
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={totalW} height={barMaxH + 40} viewBox={`0 0 ${totalW} ${barMaxH + 40}`} style={{ overflow: 'visible' }}>
          {quarterData.map((d, i) => {
            const x = 20 + i * (barW + gap);
            const h = (d.average / maxVal) * barMaxH;
            const barColor = d.average >= 50 ? '#6b8f71' : d.average >= 25 ? '#d4a574' : '#ef4444';
            return (
              <g key={d.quarter}>
                <rect x={x} y={barMaxH - h} width={barW} height={h} rx={6} fill={barColor} opacity={0.8} />
                <text x={x + barW / 2} y={barMaxH - h - 8} textAnchor="middle" fill="#f0ebe4" fontSize="12" fontWeight="700">
                  {d.average}%
                </text>
                <text x={x + barW / 2} y={barMaxH + 18} textAnchor="middle" fill="#a09888" fontSize="11" fontWeight="500">
                  {d.quarter}
                </text>
              </g>
            );
          })}
          <line x1={16} y1={barMaxH} x2={totalW - 4} y2={barMaxH} stroke="#1e2638" strokeWidth={1} />
        </svg>
      </div>
    </div>
  );
}

// ─── Summary Bar ───

function SummaryBar({ stats }: { stats: { total: number; avgProgress: number; onTrack: number; atRisk: number; behind: number } }) {
  return (
    <div
      className="okr-summary-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '14px 24px',
        backgroundColor: '#131720',
        border: '1px solid #1e2638',
        borderRadius: 12,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Target size={16} style={{ color: '#8b5cf6' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4' }}>
          {stats.total} Objectives
        </span>
      </div>

      <div style={{ width: 1, height: 24, backgroundColor: '#1e2638' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, position: 'relative',
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="13" fill="none" stroke="#1e2638" strokeWidth="3" />
            <circle
              cx="16" cy="16" r="13" fill="none" stroke="#8b5cf6"
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(stats.avgProgress / 100) * 81.68} 81.68`}
              transform="rotate(-90 16 16)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6', lineHeight: 1 }}>
            {stats.avgProgress}%
          </div>
          <div style={{ fontSize: 10, color: '#6b6358', fontWeight: 500 }}>avg progress</div>
        </div>
      </div>

      <div style={{ width: 1, height: 24, backgroundColor: '#1e2638' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6b8f71' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b8f71' }}>{stats.onTrack}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>on-track</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d4a574' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#d4a574' }}>{stats.atRisk}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>at-risk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>{stats.behind}</span>
          <span style={{ fontSize: 11, color: '#6b6358' }}>behind</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───

export function OKRView() {
  const { okrs, kpis, teamMembers, updateOKRStatus, updateKeyResultProgress } = useFrequencyData();

  // Local-only state: notes & confidence (not backed by DataProvider)
  const [localEdits, setLocalEdits] = useState<LocalEdits>(emptyLocalEdits);
  const [editingProgress, setEditingProgress] = useState<{ okrId: string; krIdx: number } | null>(null);
  const [editingNote, setEditingNote] = useState<{ okrId: string; krIdx: number } | null>(null);

  useEffect(() => { injectStyles(); }, []);

  // Owner resolver using live teamMembers from DataProvider
  const resolveOwner = useCallback((ownerId: string) => {
    const m = teamMembers.find((t) => t.id === ownerId);
    return m ? { name: m.name.split(' ')[0], avatar: m.avatar } : { name: ownerId, avatar: ownerId.slice(0, 2).toUpperCase() };
  }, [teamMembers]);

  // ─── Status cycling → DataProvider mutation ───
  const cycleStatus = useCallback((okrId: string, current: OKR['status']) => {
    const idx = statusCycle.indexOf(current);
    const nextStatus = statusCycle[(idx + 1) % statusCycle.length];
    updateOKRStatus(okrId, nextStatus);
  }, [updateOKRStatus]);

  // ─── Progress update → DataProvider mutation ───
  const setProgress = useCallback((okrId: string, krIdx: number, value: number) => {
    const okr = okrs.find((o) => o.id === okrId);
    if (!okr) return;
    const kr = okr.keyResults[krIdx];
    if (!kr) return;
    updateKeyResultProgress(okrId, kr.text, value);
  }, [okrs, updateKeyResultProgress]);

  // ─── Local note management ───
  const setNote = useCallback((okrId: string, krIdx: number, text: string) => {
    setLocalEdits((prev) => {
      const next = { ...prev, notes: { ...prev.notes } };
      if (!next.notes[okrId]) next.notes[okrId] = {};
      if (text.trim()) {
        next.notes[okrId] = { ...next.notes[okrId], [krIdx]: text.trim() };
      } else {
        const copy = { ...next.notes[okrId] };
        delete copy[krIdx];
        if (Object.keys(copy).length === 0) delete next.notes[okrId];
        else next.notes[okrId] = copy;
      }
      return next;
    });
  }, []);

  // ─── Local confidence management ───
  const setConfidence = useCallback((okrId: string, value: number) => {
    setLocalEdits((prev) => ({ ...prev, confidence: { ...prev.confidence, [okrId]: value } }));
  }, []);

  // Derived data
  const quarters = useMemo(() => [...new Set(okrs.map((o) => o.quarter))], [okrs]);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);

  const kpiCategories = useMemo(() => {
    const cats: Record<string, KPI[]> = {};
    kpis.forEach((kpi) => {
      if (!cats[kpi.category]) cats[kpi.category] = [];
      cats[kpi.category].push(kpi);
    });
    return cats;
  }, [kpis]);

  const filteredOkrs = useMemo(
    () => selectedQuarter === 'all' ? okrs : okrs.filter((o) => o.quarter === selectedQuarter),
    [selectedQuarter, okrs]
  );

  const summaryStats = useMemo(() => {
    const total = filteredOkrs.length;
    let onTrack = 0, atRisk = 0, behind = 0, totalProgress = 0;
    filteredOkrs.forEach((okr) => {
      if (okr.status === 'on-track') onTrack++;
      else if (okr.status === 'at-risk') atRisk++;
      else behind++;
      totalProgress += okr.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / okr.keyResults.length;
    });
    return { total, onTrack, atRisk, behind, avgProgress: total > 0 ? Math.round(totalProgress / total) : 0 };
  }, [filteredOkrs]);

  // ─── Render ───

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Target size={24} style={{ color: '#d4a574' }} />
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>OKRs &amp; KPIs</h1>
          </div>
          <p style={{ fontSize: 14, color: '#a09888', margin: 0 }}>
            Objectives, key results, and performance indicators tracking Frequency&apos;s progress
          </p>
        </div>

        {/* Quarter selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowQuarterDropdown((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              backgroundColor: '#131720', border: '1px solid #1e2638', borderRadius: 8,
              color: '#f0ebe4', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
          >
            <BarChart3 size={16} style={{ color: '#d4a574' }} />
            {selectedQuarter === 'all' ? 'All Quarters' : selectedQuarter}
            <ChevronDown size={14} style={{ color: '#6b6358' }} />
          </button>

          {showQuarterDropdown && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              backgroundColor: '#131720', border: '1px solid #1e2638', borderRadius: 8,
              overflow: 'hidden', zIndex: 20, minWidth: 150, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {['all', ...quarters].map((q) => (
                <button
                  key={q}
                  onClick={() => { setSelectedQuarter(q); setShowQuarterDropdown(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '10px 16px', border: 'none',
                    backgroundColor: selectedQuarter === q ? 'rgba(212,165,116,0.08)' : 'transparent',
                    color: selectedQuarter === q ? '#d4a574' : '#a09888', fontSize: 13,
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    fontWeight: selectedQuarter === q ? 600 : 400, transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (selectedQuarter !== q) e.currentTarget.style.backgroundColor = '#1e2638'; }}
                  onMouseLeave={(e) => { if (selectedQuarter !== q) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {q === 'all' ? 'All Quarters' : q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Bar ── */}
      <SummaryBar stats={summaryStats} />

      {/* ── Summary Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(170px, 100%), 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total OKRs', value: summaryStats.total, color: '#8b5cf6' },
          { label: 'On Track', value: summaryStats.onTrack, color: '#6b8f71' },
          { label: 'At Risk', value: summaryStats.atRisk, color: '#d4a574' },
          { label: 'Behind', value: summaryStats.behind, color: '#ef4444' },
          { label: 'Avg Progress', value: `${summaryStats.avgProgress}%`, color: '#60a5fa' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#131720', border: '1px solid #1e2638', borderRadius: 12,
              padding: '14px 18px', transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
          >
            <div style={{ fontSize: 11, color: '#6b6358', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── KPI Dashboard ── */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={18} style={{ color: '#8b5cf6' }} />
          Key Performance Indicators
        </h2>

        {Object.entries(kpiCategories).map(([category, categoryKpis]) => (
          <div key={category} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: categoryColors[category] ?? '#6b6358' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: categoryColors[category] ?? '#a09888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {category}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {categoryKpis.map((kpi) => {
                const t = trendIcon(kpi.trend);
                return (
                  <div
                    key={kpi.id}
                    style={{ backgroundColor: '#131720', border: '1px solid #1e2638', borderRadius: 12, padding: '16px 18px', transition: 'border-color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#6b6358', fontWeight: 500 }}>{kpi.name}</span>
                      <t.Icon size={16} style={{ color: t.color }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', marginBottom: 4 }}>{kpi.value}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: '#6b6358' }}>Target:</span>
                      <span style={{ fontSize: 11, color: '#a09888', fontWeight: 600 }}>{kpi.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, backgroundColor: '#1e2638', marginBottom: 32 }} />

      {/* ── Quarter Comparison (only when "All Quarters" selected) ── */}
      {selectedQuarter === 'all' && <QuarterComparisonChart okrData={okrs} />}

      {/* ── OKRs Section ── */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={18} style={{ color: '#d4a574' }} />
          Objectives &amp; Key Results
          {selectedQuarter !== 'all' && (
            <span style={{ fontSize: 13, fontWeight: 500, color: '#6b6358', marginLeft: 4 }}>
              — {selectedQuarter}
            </span>
          )}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredOkrs.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#6b6358',
              fontSize: 14,
              fontWeight: 500,
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 14,
            }}>
              No OKRs for this quarter
            </div>
          )}
          {filteredOkrs.map((okr, cardIndex) => {
            const badge = statusBadge(okr.status);
            const overallProgress = Math.round(
              okr.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / okr.keyResults.length
            );
            const confidence = localEdits.confidence[okr.id] ?? 0;

            const pulseClass = okr.status === 'at-risk'
              ? 'okr-pulse-at-risk'
              : okr.status === 'behind'
              ? 'okr-pulse-behind'
              : '';

            return (
              <div
                key={okr.id}
                className="okr-card-animated"
                style={{
                  backgroundColor: '#131720', border: '1px solid #1e2638',
                  borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.3s',
                  animationDelay: `${cardIndex * 100}ms`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
              >
                {/* Top accent line */}
                <div style={{ height: 3, background: `linear-gradient(to right, ${badge.text}, transparent)` }} />

                <div style={{ padding: '20px 24px' }}>
                  {/* Objective header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                        {okr.objective}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {/* Status badge (clickable to cycle) with pulse animation */}
                        <button
                          className={pulseClass}
                          onClick={() => cycleStatus(okr.id, okr.status)}
                          title="Click to cycle status"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 11, fontWeight: 600, color: badge.text,
                            backgroundColor: badge.bg, padding: '3px 10px', borderRadius: 6,
                            lineHeight: 1, border: '1px solid transparent',
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'transform 0.1s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <badge.Icon size={12} />
                          {badge.label}
                        </button>

                        {/* Quarter badge */}
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: '#8b5cf6',
                          backgroundColor: 'rgba(139,92,246,0.12)', padding: '3px 10px',
                          borderRadius: 6, lineHeight: 1,
                        }}>
                          {okr.quarter}
                        </span>

                        {/* Confidence flames */}
                        <div style={{ marginLeft: 4 }}>
                          <ConfidenceFlames value={confidence} onChange={(v) => setConfidence(okr.id, v)} />
                        </div>
                      </div>
                    </div>

                    {/* Animated circular progress ring */}
                    <AnimatedProgressRing
                      progress={overallProgress}
                      size={64}
                      strokeWidth={5}
                      color={badge.text}
                      delay={cardIndex * 100 + 200}
                    />
                  </div>

                  {/* Key Results */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {okr.keyResults.map((kr, idx) => {
                      const owner = resolveOwner(kr.owner);
                      const effectiveProgress = kr.progress;
                      const barColor = progressColor(effectiveProgress);
                      const gradient = progressGradient(effectiveProgress);
                      const isEditingThis = editingProgress?.okrId === okr.id && editingProgress?.krIdx === idx;
                      const isEditingNoteHere = editingNote?.okrId === okr.id && editingNote?.krIdx === idx;
                      const noteText = localEdits.notes[okr.id]?.[idx] ?? '';
                      const hasNote = noteText.length > 0;

                      return (
                        <div key={idx} style={{ backgroundColor: '#0d1018', borderRadius: 10, padding: '12px 16px', border: '1px solid #1a1f2e' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: '#a09888', lineHeight: 1.45, flex: 1 }}>
                              {kr.text}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              {/* Note icon */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNote(isEditingNoteHere ? null : { okrId: okr.id, krIdx: idx });
                                }}
                                title={hasNote ? 'Edit note' : 'Add note'}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                                  display: 'flex', alignItems: 'center',
                                  opacity: hasNote ? 1 : 0.4, transition: 'opacity 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                onMouseLeave={(e) => { if (!hasNote) e.currentTarget.style.opacity = '0.4'; }}
                              >
                                <MessageSquarePlus size={14} style={{ color: hasNote ? '#d4a574' : '#6b6358' }} />
                              </button>

                              <div
                                title={owner.name}
                                style={{
                                  width: 24, height: 24, borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #c4925a, #d4a574)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 9, fontWeight: 700, color: '#0b0d14',
                                }}
                              >
                                {owner.avatar}
                              </div>
                              <span style={{ fontSize: 11, color: '#6b6358' }}>{owner.name}</span>
                            </div>
                          </div>

                          {/* Enhanced gradient progress bar with hover tooltip */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              className="okr-bar-wrapper"
                              style={{
                                flex: 1, height: 7, backgroundColor: '#1e2638', borderRadius: 4,
                                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                              }}
                              onClick={() => setEditingProgress({ okrId: okr.id, krIdx: idx })}
                              title="Click to edit progress"
                            >
                              <div style={{
                                height: '100%', width: `${effectiveProgress}%`, borderRadius: 4,
                                background: gradient,
                                transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                                boxShadow: `0 0 8px ${barColor}40`,
                              }} />
                              {/* Hover tooltip */}
                              <div className="okr-progress-tooltip">
                                <div style={{ fontSize: 11, fontWeight: 700, color: barColor, marginBottom: 2 }}>
                                  {effectiveProgress}% complete
                                </div>
                                <div style={{ fontSize: 10, color: '#6b6358' }}>
                                  Owner: {owner.name}
                                </div>
                              </div>
                            </div>
                            {isEditingThis ? (
                              <InlineProgressEditor
                                current={effectiveProgress}
                                onSave={(v) => { setProgress(okr.id, idx, v); setEditingProgress(null); }}
                                onCancel={() => setEditingProgress(null)}
                              />
                            ) : (
                              <span
                                onClick={() => setEditingProgress({ okrId: okr.id, krIdx: idx })}
                                title="Click to edit progress"
                                style={{
                                  fontSize: 12, fontWeight: 700, color: barColor, minWidth: 36,
                                  textAlign: 'right', cursor: 'pointer',
                                  transition: 'opacity 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                              >
                                {effectiveProgress}%
                              </span>
                            )}
                          </div>

                          {/* Note display */}
                          {hasNote && !isEditingNoteHere && (
                            <div
                              style={{
                                marginTop: 8, padding: '6px 10px',
                                backgroundColor: 'rgba(212,165,116,0.04)',
                                border: '1px solid rgba(212,165,116,0.1)', borderRadius: 6,
                                fontSize: 11, color: '#a09888', lineHeight: 1.5, cursor: 'pointer',
                              }}
                              onClick={() => setEditingNote({ okrId: okr.id, krIdx: idx })}
                              title="Click to edit note"
                            >
                              {noteText}
                            </div>
                          )}

                          {/* Note editor */}
                          {isEditingNoteHere && (
                            <NoteEditor
                              initial={noteText}
                              onSave={(text) => setNote(okr.id, idx, text)}
                              onClose={() => setEditingNote(null)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Close quarter dropdown when clicking outside */}
      {showQuarterDropdown && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          onClick={() => setShowQuarterDropdown(false)}
        />
      )}

      {/* AI Advisor — OKR Context */}
      <div style={{ marginTop: 32 }}>
        <InlineAdvisor
          title="OKR Advisor"
          titleIcon="sparkles"
          compact={true}
          defaultCollapsed={true}
          storageKeySuffix="okrs"
          suggestedPrompts={[
            'Which OKRs are at risk and what should we do?',
            'Are our key results ambitious enough?',
            'How should we adjust targets for next quarter?',
            'What OKRs are missing from our strategy?',
          ]}
        />
      </div>
    </div>
  );
}
