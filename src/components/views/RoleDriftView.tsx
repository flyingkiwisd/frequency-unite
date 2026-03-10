'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  Activity,
  Target,
  Users,
  TrendingDown,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ─── Types ─── */

interface DriftActivity {
  label: string;
  type: 'in-seat' | 'out-of-seat';
}

interface DriftMember {
  id: string;
  driftScore: number;
  activities: DriftActivity[];
}

/* ─── Mock Data ─── */

const driftData: DriftMember[] = [
  {
    id: 'sian',
    driftScore: 35,
    activities: [
      { label: 'Cash forecasting', type: 'in-seat' },
      { label: 'Member onboarding', type: 'in-seat' },
      { label: 'Strategic planning', type: 'out-of-seat' },
      { label: 'Fundraising calls', type: 'out-of-seat' },
      { label: 'Board governance', type: 'out-of-seat' },
    ],
  },
  {
    id: 'james',
    driftScore: 75,
    activities: [
      { label: 'Vision strategy', type: 'in-seat' },
      { label: 'Board governance', type: 'in-seat' },
      { label: 'Capital strategy', type: 'in-seat' },
      { label: 'Operational decisions', type: 'out-of-seat' },
      { label: 'Vendor management', type: 'out-of-seat' },
    ],
  },
  {
    id: 'fairman',
    driftScore: 82,
    activities: [
      { label: 'Thesis architecture', type: 'in-seat' },
      { label: 'Node design', type: 'in-seat' },
      { label: 'DECO framework', type: 'in-seat' },
      { label: 'Event logistics', type: 'out-of-seat' },
    ],
  },
  {
    id: 'greg',
    driftScore: 90,
    activities: [
      { label: 'Deal scoring', type: 'in-seat' },
      { label: 'Capital deployment', type: 'in-seat' },
      { label: 'Due diligence', type: 'in-seat' },
    ],
  },
  {
    id: 'mafe',
    driftScore: 70,
    activities: [
      { label: 'Airtable management', type: 'in-seat' },
      { label: 'Communications', type: 'in-seat' },
      { label: 'Strategic planning', type: 'out-of-seat' },
      { label: 'Member outreach', type: 'out-of-seat' },
    ],
  },
  {
    id: 'colleen',
    driftScore: 88,
    activities: [
      { label: 'DAF compliance', type: 'in-seat' },
      { label: 'Financial stewardship', type: 'in-seat' },
      { label: 'General ops', type: 'out-of-seat' },
    ],
  },
  {
    id: 'dave',
    driftScore: 78,
    activities: [
      { label: 'Pod facilitation', type: 'in-seat' },
      { label: 'Board governance', type: 'in-seat' },
      { label: 'Cash forecasting', type: 'out-of-seat' },
      { label: 'Vendor management', type: 'out-of-seat' },
    ],
  },
  {
    id: 'gareth',
    driftScore: 85,
    activities: [
      { label: 'Bioregion design', type: 'in-seat' },
      { label: 'Nicoya pilot', type: 'in-seat' },
      { label: 'Admin tasks', type: 'out-of-seat' },
    ],
  },
];

/* ─── Avatar gradient helper ─── */

function avatarGradient(color: string): string {
  const gradientMap: Record<string, string> = {
    'bg-amber-500': 'linear-gradient(135deg, #c4925a, #d4a574)',
    'bg-amber-400': 'linear-gradient(135deg, #d4a574, #e8b44c)',
    'bg-rose-400': 'linear-gradient(135deg, #e879a0, #f0a0b8)',
    'bg-violet-500': 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    'bg-sky-400': 'linear-gradient(135deg, #38bdf8, #5eaed4)',
    'bg-emerald-500': 'linear-gradient(135deg, #10b981, #34d399)',
    'bg-purple-500': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'bg-pink-400': 'linear-gradient(135deg, #e879a0, #f0a0b8)',
    'bg-teal-400': 'linear-gradient(135deg, #2dd4bf, #5eead4)',
    'bg-green-500': 'linear-gradient(135deg, #22c55e, #4ade80)',
    'bg-lime-500': 'linear-gradient(135deg, #84cc16, #a3e635)',
    'bg-orange-500': 'linear-gradient(135deg, #f97316, #fb923c)',
    'bg-indigo-400': 'linear-gradient(135deg, #818cf8, #a5b4fc)',
    'bg-slate-400': 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
  };
  return gradientMap[color] || 'linear-gradient(135deg, #a09888, #6b6358)';
}

/* ─── Score color helper ─── */

function scoreColor(score: number): string {
  if (score >= 80) return '#6b8f71';
  if (score >= 60) return '#e8b44c';
  return '#e06060';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'rgba(107, 143, 113, 0.12)';
  if (score >= 60) return 'rgba(232, 180, 76, 0.12)';
  return 'rgba(224, 96, 96, 0.12)';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Focused';
  if (score >= 60) return 'Moderate Drift';
  return 'High Drift';
}

/* ─── Component ─── */

export function RoleDriftView() {
  const [sortAsc, setSortAsc] = useState(false);

  const enrichedData = useMemo(() => {
    return driftData
      .map((d) => {
        const member = teamMembers.find((m) => m.id === d.id);
        return { ...d, member };
      })
      .filter((d) => d.member)
      .sort((a, b) => (sortAsc ? a.driftScore - b.driftScore : a.driftScore - b.driftScore));
  }, [sortAsc]);

  // Sort: most drifted first (lowest score = most drift) by default
  const sorted = useMemo(() => {
    return [...enrichedData].sort((a, b) =>
      sortAsc ? b.driftScore - a.driftScore : a.driftScore - b.driftScore
    );
  }, [enrichedData, sortAsc]);

  // Aggregate stats
  const avgScore = Math.round(
    enrichedData.reduce((sum, d) => sum + d.driftScore, 0) / enrichedData.length
  );
  const mostFocused = enrichedData.reduce((best, d) =>
    d.driftScore > best.driftScore ? d : best
  );
  const mostDrifted = enrichedData.reduce((worst, d) =>
    d.driftScore < worst.driftScore ? d : worst
  );
  const totalActivities = enrichedData.reduce(
    (sum, d) => sum + d.activities.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <Compass size={28} className="text-accent" />
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Role Drift Detector</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm">
          Tracking role adherence across the steward team. Lower scores indicate
          more time spent outside defined responsibilities.
        </p>
      </div>

      {/* ── Aggregate Stats ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in"
        style={{ animationDelay: '0.03s', opacity: 0 }}
      >
        {[
          {
            label: 'Avg Drift Score',
            value: avgScore.toString(),
            icon: Target,
            color: scoreColor(avgScore),
            bg: scoreBg(avgScore),
          },
          {
            label: 'Most Focused',
            value: mostFocused.member?.name.split(' ')[0] || '',
            icon: CheckCircle2,
            color: '#6b8f71',
            bg: 'rgba(107, 143, 113, 0.12)',
            sub: `Score: ${mostFocused.driftScore}`,
          },
          {
            label: 'Most Drifted',
            value: mostDrifted.member?.name.split(' ')[0] || '',
            icon: TrendingDown,
            color: '#e06060',
            bg: 'rgba(224, 96, 96, 0.12)',
            sub: `Score: ${mostDrifted.driftScore}`,
          },
          {
            label: 'Total Activities',
            value: totalActivities.toString(),
            icon: Activity,
            color: '#8b5cf6',
            bg: 'rgba(139, 92, 246, 0.12)',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glow-card rounded-xl border p-4"
              style={{
                backgroundColor: stat.bg,
                borderColor: `${stat.color}22`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: stat.color }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: stat.color }}
                >
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              {(stat as { sub?: string }).sub && (
                <div className="text-[10px] text-text-muted mt-0.5">
                  {(stat as { sub?: string }).sub}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Sort Toggle ── */}
      <div
        className="flex items-center justify-between animate-fade-in"
        style={{ animationDelay: '0.05s', opacity: 0 }}
      >
        <div className="flex items-center gap-2">
          <Users size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Team Members ({sorted.length})
          </span>
        </div>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            backgroundColor: '#131720',
            color: '#a09888',
            border: '1px solid #1e2638',
          }}
        >
          <ArrowUpDown size={12} />
          {sortAsc ? 'Most Focused First' : 'Most Drifted First'}
        </button>
      </div>

      {/* ── Drift Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((item, i) => {
          const member = item.member!;
          const isWarning = item.driftScore < 50;
          const inSeat = item.activities.filter((a) => a.type === 'in-seat');
          const outSeat = item.activities.filter((a) => a.type === 'out-of-seat');
          const driftPct = 100 - item.driftScore;

          return (
            <div
              key={item.id}
              className="glow-card rounded-xl border transition-all animate-fade-in"
              style={{
                backgroundColor: '#131720',
                borderColor: isWarning
                  ? 'rgba(224, 96, 96, 0.35)'
                  : '#1e2638',
                animationDelay: `${0.1 + i * 0.04}s`,
                opacity: 0,
              }}
            >
              <div className="p-5">
                {/* Member Header */}
                <div className="flex items-start gap-3.5 mb-4">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: avatarGradient(member.color),
                      color: '#0b0d14',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {member.name}
                      </h3>
                      {isWarning && (
                        <AlertTriangle
                          size={14}
                          style={{ color: '#e06060' }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">
                      {member.role}
                    </p>
                  </div>
                  {/* Score Badge */}
                  <div
                    className="flex flex-col items-center px-3 py-1.5 rounded-lg flex-shrink-0"
                    style={{
                      backgroundColor: scoreBg(item.driftScore),
                      border: `1px solid ${scoreColor(item.driftScore)}30`,
                    }}
                  >
                    <span
                      className="text-xl font-bold tabular-nums"
                      style={{ color: scoreColor(item.driftScore) }}
                    >
                      {item.driftScore}
                    </span>
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wider"
                      style={{ color: scoreColor(item.driftScore) }}
                    >
                      {scoreLabel(item.driftScore)}
                    </span>
                  </div>
                </div>

                {/* Role Description */}
                <p className="text-[11px] text-text-muted leading-relaxed mb-3 italic">
                  {member.roleOneSentence}
                </p>

                {/* Drift Meter */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      Drift Meter
                    </span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: scoreColor(item.driftScore) }}
                    >
                      {driftPct}% out-of-seat
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#1c2230' }}
                  >
                    {/* In-seat portion (green) */}
                    <div className="h-full flex">
                      <div
                        className="h-full rounded-l-full transition-all"
                        style={{
                          width: `${item.driftScore}%`,
                          backgroundColor: '#6b8f71',
                        }}
                      />
                      {/* Out-of-seat portion (red/amber) */}
                      <div
                        className="h-full rounded-r-full transition-all"
                        style={{
                          width: `${driftPct}%`,
                          backgroundColor:
                            item.driftScore < 50 ? '#e06060' : '#e8b44c',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <div className="grid grid-cols-2 gap-3">
                  {/* In-Seat */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle2 size={11} style={{ color: '#6b8f71' }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#6b8f71' }}>
                        In-Seat ({inSeat.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {inSeat.map((a, j) => (
                        <div
                          key={j}
                          className="text-[11px] px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(107, 143, 113, 0.08)',
                            color: '#a09888',
                          }}
                        >
                          {a.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Out-of-Seat */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle size={11} style={{ color: '#e8b44c' }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#e8b44c' }}>
                        Out-of-Seat ({outSeat.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {outSeat.length === 0 ? (
                        <div
                          className="text-[11px] px-2 py-1 rounded italic"
                          style={{
                            backgroundColor: 'rgba(107, 143, 113, 0.06)',
                            color: '#6b6358',
                          }}
                        >
                          None detected
                        </div>
                      ) : (
                        outSeat.map((a, j) => (
                          <div
                            key={j}
                            className="text-[11px] px-2 py-1 rounded"
                            style={{
                              backgroundColor: 'rgba(232, 180, 76, 0.08)',
                              color: '#a09888',
                            }}
                          >
                            {a.label}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning Banner */}
                {isWarning && (
                  <div
                    className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(224, 96, 96, 0.08)',
                      border: '1px solid rgba(224, 96, 96, 0.2)',
                    }}
                  >
                    <AlertTriangle size={13} style={{ color: '#e06060' }} />
                    <span className="text-[11px] font-medium" style={{ color: '#e06060' }}>
                      Significant role drift detected. Consider role clarity
                      conversation.
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
