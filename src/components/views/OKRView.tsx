'use client';

import React, { useState, useMemo } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { okrs, kpis, teamMembers } from '@/lib/data';
import type { OKR, KPI } from '@/lib/data';

// ─── Helpers ───

function trendIcon(trend: KPI['trend']) {
  switch (trend) {
    case 'up':
      return { Icon: TrendingUp, color: '#6b8f71' };
    case 'down':
      return { Icon: TrendingDown, color: '#ef4444' };
    case 'flat':
      return { Icon: Minus, color: '#6b6358' };
  }
}

function statusBadge(status: OKR['status']): { bg: string; text: string; label: string; Icon: React.ElementType } {
  switch (status) {
    case 'on-track':
      return { bg: 'rgba(107, 143, 113, 0.15)', text: '#6b8f71', label: 'On Track', Icon: CheckCircle2 };
    case 'at-risk':
      return { bg: 'rgba(212, 165, 116, 0.15)', text: '#d4a574', label: 'At Risk', Icon: AlertTriangle };
    case 'behind':
      return { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', label: 'Behind', Icon: XCircle };
  }
}

function resolveOwner(ownerId: string): { name: string; avatar: string } {
  const member = teamMembers.find((m) => m.id === ownerId);
  return member
    ? { name: member.name.split(' ')[0], avatar: member.avatar }
    : { name: ownerId, avatar: ownerId.slice(0, 2).toUpperCase() };
}

// KPI category colors
const categoryColors: Record<string, string> = {
  Membership: '#8b5cf6',
  Financial: '#d4a574',
  Operations: '#60a5fa',
  Community: '#6b8f71',
  Impact: '#f472b6',
};

// ─── Component ───

export function OKRView() {
  // Get unique quarters from OKRs
  const quarters = useMemo(() => {
    const unique = [...new Set(okrs.map((o) => o.quarter))];
    return unique;
  }, []);

  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);

  // Group KPIs by category
  const kpiCategories = useMemo(() => {
    const cats: Record<string, KPI[]> = {};
    kpis.forEach((kpi) => {
      if (!cats[kpi.category]) cats[kpi.category] = [];
      cats[kpi.category].push(kpi);
    });
    return cats;
  }, []);

  // Filtered OKRs
  const filteredOkrs = useMemo(() => {
    if (selectedQuarter === 'all') return okrs;
    return okrs.filter((o) => o.quarter === selectedQuarter);
  }, [selectedQuarter]);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
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
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 8,
              color: '#f0ebe4',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
          >
            <BarChart3 size={16} style={{ color: '#d4a574' }} />
            {selectedQuarter === 'all' ? 'All Quarters' : selectedQuarter}
            <ChevronDown size={14} style={{ color: '#6b6358' }} />
          </button>

          {showQuarterDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                backgroundColor: '#131720',
                border: '1px solid #1e2638',
                borderRadius: 8,
                overflow: 'hidden',
                zIndex: 20,
                minWidth: 150,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              <button
                onClick={() => { setSelectedQuarter('all'); setShowQuarterDropdown(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: selectedQuarter === 'all' ? 'rgba(212,165,116,0.08)' : 'transparent',
                  color: selectedQuarter === 'all' ? '#d4a574' : '#a09888',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontWeight: selectedQuarter === 'all' ? 600 : 400,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (selectedQuarter !== 'all') e.currentTarget.style.backgroundColor = '#1e2638'; }}
                onMouseLeave={(e) => { if (selectedQuarter !== 'all') e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                All Quarters
              </button>
              {quarters.map((q) => (
                <button
                  key={q}
                  onClick={() => { setSelectedQuarter(q); setShowQuarterDropdown(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    backgroundColor: selectedQuarter === q ? 'rgba(212,165,116,0.08)' : 'transparent',
                    color: selectedQuarter === q ? '#d4a574' : '#a09888',
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    fontWeight: selectedQuarter === q ? 600 : 400,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (selectedQuarter !== q) e.currentTarget.style.backgroundColor = '#1e2638'; }}
                  onMouseLeave={(e) => { if (selectedQuarter !== q) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Dashboard ── */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={18} style={{ color: '#8b5cf6' }} />
          Key Performance Indicators
        </h2>

        {Object.entries(kpiCategories).map(([category, categoryKpis]) => (
          <div key={category} style={{ marginBottom: 20 }}>
            {/* Category label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: categoryColors[category] ?? '#6b6358',
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: categoryColors[category] ?? '#a09888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {category}
              </span>
            </div>

            {/* KPI cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {categoryKpis.map((kpi) => {
                const t = trendIcon(kpi.trend);
                return (
                  <div
                    key={kpi.id}
                    style={{
                      backgroundColor: '#131720',
                      border: '1px solid #1e2638',
                      borderRadius: 12,
                      padding: '16px 18px',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#6b6358', fontWeight: 500 }}>{kpi.name}</span>
                      <t.Icon size={16} style={{ color: t.color }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', marginBottom: 4 }}>
                      {kpi.value}
                    </div>
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
          {filteredOkrs.map((okr) => {
            const badge = statusBadge(okr.status);
            // Calculate overall progress (average of key results)
            const overallProgress = Math.round(
              okr.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / okr.keyResults.length
            );

            return (
              <div
                key={okr.id}
                style={{
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
              >
                {/* Top accent line */}
                <div
                  style={{
                    height: 3,
                    background: `linear-gradient(to right, ${badge.text}, transparent)`,
                  }}
                />

                <div style={{ padding: '20px 24px' }}>
                  {/* Objective header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                        {okr.objective}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Status badge */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            color: badge.text,
                            backgroundColor: badge.bg,
                            padding: '3px 10px',
                            borderRadius: 6,
                            lineHeight: 1,
                          }}
                        >
                          <badge.Icon size={12} />
                          {badge.label}
                        </span>
                        {/* Quarter badge */}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.12)',
                            padding: '3px 10px',
                            borderRadius: 6,
                            lineHeight: 1,
                          }}
                        >
                          {okr.quarter}
                        </span>
                      </div>
                    </div>

                    {/* Overall objective progress ring */}
                    <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                      <svg width="52" height="52" viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="22" fill="none" stroke="#1e2638" strokeWidth="4" />
                        <circle
                          cx="26"
                          cy="26"
                          r="22"
                          fill="none"
                          stroke={badge.text}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${(overallProgress / 100) * 138.2} 138.2`}
                          transform="rotate(-90 26 26)"
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      </svg>
                      <span
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          color: badge.text,
                        }}
                      >
                        {overallProgress}%
                      </span>
                    </div>
                  </div>

                  {/* Key Results */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {okr.keyResults.map((kr, idx) => {
                      const owner = resolveOwner(kr.owner);
                      // Color the progress bar based on progress level
                      const barColor =
                        kr.progress >= 60 ? '#6b8f71' : kr.progress >= 30 ? '#d4a574' : '#ef4444';

                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: '#0d1018',
                            borderRadius: 10,
                            padding: '12px 16px',
                            border: '1px solid #1a1f2e',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: '#a09888', lineHeight: 1.45, flex: 1 }}>
                              {kr.text}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <div
                                title={owner.name}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #c4925a, #d4a574)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: '#0b0d14',
                                }}
                              >
                                {owner.avatar}
                              </div>
                              <span style={{ fontSize: 11, color: '#6b6358' }}>{owner.name}</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                flex: 1,
                                height: 5,
                                backgroundColor: '#1e2638',
                                borderRadius: 3,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${kr.progress}%`,
                                  borderRadius: 3,
                                  backgroundColor: barColor,
                                  transition: 'width 0.5s ease',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: barColor, minWidth: 36, textAlign: 'right' }}>
                              {kr.progress}%
                            </span>
                          </div>
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
    </div>
  );
}
