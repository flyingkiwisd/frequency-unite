'use client';

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Target,
  Network,
  Heart,
  CheckCircle2,
  Flame,
  Crown,
  Medal,
  Star,
  ArrowUpDown,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ─── Types ─── */

interface ScoreBreakdown {
  okrProgress: number;
  nodeContribution: number;
  coherenceScore: number;
  accountability: number;
  streakBonus: number;
}

interface LeaderboardEntry {
  memberId: string;
  scores: ScoreBreakdown;
  totalScore: number;
  streak: number; // consecutive weeks at 80%+
}

/* ─── Mock Data ─── */

const leaderboardData: LeaderboardEntry[] = [
  {
    memberId: 'fairman',
    scores: { okrProgress: 92, nodeContribution: 95, coherenceScore: 85, accountability: 88, streakBonus: 75 },
    totalScore: 435,
    streak: 6,
  },
  {
    memberId: 'james',
    scores: { okrProgress: 88, nodeContribution: 82, coherenceScore: 90, accountability: 85, streakBonus: 65 },
    totalScore: 410,
    streak: 5,
  },
  {
    memberId: 'sian',
    scores: { okrProgress: 85, nodeContribution: 78, coherenceScore: 82, accountability: 90, streakBonus: 60 },
    totalScore: 395,
    streak: 4,
  },
  {
    memberId: 'greg',
    scores: { okrProgress: 90, nodeContribution: 88, coherenceScore: 72, accountability: 82, streakBonus: 55 },
    totalScore: 387,
    streak: 3,
  },
  {
    memberId: 'colleen',
    scores: { okrProgress: 82, nodeContribution: 75, coherenceScore: 88, accountability: 86, streakBonus: 50 },
    totalScore: 381,
    streak: 4,
  },
  {
    memberId: 'dave',
    scores: { okrProgress: 78, nodeContribution: 80, coherenceScore: 92, accountability: 75, streakBonus: 45 },
    totalScore: 370,
    streak: 3,
  },
  {
    memberId: 'gareth',
    scores: { okrProgress: 80, nodeContribution: 85, coherenceScore: 70, accountability: 78, streakBonus: 50 },
    totalScore: 363,
    streak: 4,
  },
  {
    memberId: 'mafe',
    scores: { okrProgress: 75, nodeContribution: 68, coherenceScore: 78, accountability: 88, streakBonus: 45 },
    totalScore: 354,
    streak: 3,
  },
  {
    memberId: 'raamayan',
    scores: { okrProgress: 72, nodeContribution: 82, coherenceScore: 75, accountability: 70, streakBonus: 40 },
    totalScore: 339,
    streak: 2,
  },
  {
    memberId: 'andrew',
    scores: { okrProgress: 68, nodeContribution: 60, coherenceScore: 95, accountability: 72, streakBonus: 35 },
    totalScore: 330,
    streak: 2,
  },
];

/* ─── Category config ─── */

interface CategoryConfig {
  key: keyof ScoreBreakdown;
  label: string;
  shortLabel: string;
  color: string;
  icon: React.ElementType;
}

const categories: CategoryConfig[] = [
  { key: 'okrProgress', label: 'OKR Progress', shortLabel: 'OKR', color: '#d4a574', icon: Target },
  { key: 'nodeContribution', label: 'Node Contribution', shortLabel: 'Node', color: '#8b5cf6', icon: Network },
  { key: 'coherenceScore', label: 'Coherence Score', shortLabel: 'Cohere', color: '#6b8f71', icon: Heart },
  { key: 'accountability', label: 'Accountability', shortLabel: 'Account', color: '#60a5fa', icon: CheckCircle2 },
  { key: 'streakBonus', label: 'Streak Bonus', shortLabel: 'Streak', color: '#fb923c', icon: Flame },
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

/* ─── Rank display helpers ─── */

function rankIcon(rank: number) {
  if (rank === 1) return <Crown size={16} style={{ color: '#e8b44c' }} />;
  if (rank === 2) return <Medal size={16} style={{ color: '#cbd5e1' }} />;
  if (rank === 3) return <Medal size={16} style={{ color: '#cd7f32' }} />;
  return null;
}

function rankBorder(rank: number): string {
  if (rank === 1) return 'rgba(232, 180, 76, 0.35)';
  if (rank === 2) return 'rgba(203, 213, 225, 0.25)';
  if (rank === 3) return 'rgba(205, 127, 50, 0.25)';
  return '#1e2638';
}

function rankGlow(rank: number): string {
  if (rank === 1) return '0 0 20px rgba(232, 180, 76, 0.1)';
  if (rank === 2) return '0 0 12px rgba(203, 213, 225, 0.06)';
  if (rank === 3) return '0 0 12px rgba(205, 127, 50, 0.06)';
  return 'none';
}

/* ─── Component ─── */

export function LeaderboardView() {
  const [sortCategory, setSortCategory] = useState<keyof ScoreBreakdown | 'total'>('total');

  const sorted = useMemo(() => {
    return [...leaderboardData].sort((a, b) => {
      if (sortCategory === 'total') return b.totalScore - a.totalScore;
      return b.scores[sortCategory] - a.scores[sortCategory];
    });
  }, [sortCategory]);

  // Category leaders
  const categoryLeaders = useMemo(() => {
    return categories.map((cat) => {
      const leader = [...leaderboardData].sort(
        (a, b) => b.scores[cat.key] - a.scores[cat.key]
      )[0];
      const member = teamMembers.find((m) => m.id === leader.memberId);
      return { ...cat, leader, member };
    });
  }, []);

  // MVP (top scorer)
  const mvp = sorted[0];
  const mvpMember = teamMembers.find((m) => m.id === mvp.memberId);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <Trophy size={28} className="text-accent" />
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Steward Leaderboard</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm">
          Gamified team scoring across OKRs, node work, coherence, accountability,
          and streaks.
        </p>
      </div>

      {/* ── MVP Spotlight ── */}
      {mvpMember && (
        <div
          className="glow-card rounded-xl border animate-fade-in"
          style={{
            animationDelay: '0.03s',
            opacity: 0,
            backgroundColor: 'rgba(232, 180, 76, 0.06)',
            borderColor: 'rgba(232, 180, 76, 0.3)',
            boxShadow: '0 0 30px rgba(232, 180, 76, 0.08)',
          }}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} style={{ color: '#e8b44c' }} />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#e8b44c' }}
              >
                MVP This Period
              </span>
            </div>
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{
                  background: avatarGradient(mvpMember.color),
                  color: '#0b0d14',
                  boxShadow: '0 0 20px rgba(232, 180, 76, 0.2)',
                }}
              >
                {mvpMember.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-text-primary">
                  {mvpMember.name}
                </h3>
                <p className="text-sm text-text-secondary">{mvpMember.role}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Trophy size={13} style={{ color: '#e8b44c' }} />
                    <span className="text-sm font-bold" style={{ color: '#e8b44c' }}>
                      {mvp.totalScore} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame size={13} style={{ color: '#fb923c' }} />
                    <span className="text-sm font-medium" style={{ color: '#fb923c' }}>
                      {mvp.streak}-week streak
                    </span>
                  </div>
                </div>
              </div>
              {/* Mini breakdown */}
              <div className="hidden sm:flex gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.key}
                      className="flex flex-col items-center px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: `${cat.color}12`,
                        border: `1px solid ${cat.color}25`,
                      }}
                    >
                      <Icon size={12} style={{ color: cat.color }} />
                      <span
                        className="text-sm font-bold mt-1 tabular-nums"
                        style={{ color: cat.color }}
                      >
                        {mvp.scores[cat.key]}
                      </span>
                      <span className="text-[8px] text-text-muted uppercase">
                        {cat.shortLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Leaders ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.05s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Crown size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Category Leaders
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {categoryLeaders.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                className="glow-card rounded-xl border p-4"
                style={{
                  backgroundColor: '#131720',
                  borderColor: `${cat.color}22`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} style={{ color: cat.color }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: cat.color }}
                  >
                    {cat.shortLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {cat.member && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: avatarGradient(cat.member.color),
                        color: '#0b0d14',
                      }}
                    >
                      {cat.member.avatar}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-text-primary truncate">
                      {cat.member?.name.split(' ')[0]}
                    </div>
                    <div
                      className="text-sm font-bold tabular-nums"
                      style={{ color: cat.color }}
                    >
                      {cat.leader.scores[cat.key]}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sort Controls ── */}
      <div
        className="flex items-center gap-2 flex-wrap animate-fade-in"
        style={{ animationDelay: '0.07s', opacity: 0 }}
      >
        <ArrowUpDown size={14} className="text-text-muted" />
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-2">
          Sort by
        </span>
        {[
          { key: 'total' as const, label: 'Total Score', color: '#d4a574' },
          ...categories.map((c) => ({ key: c.key, label: c.shortLabel, color: c.color })),
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortCategory(opt.key)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            style={{
              backgroundColor:
                sortCategory === opt.key
                  ? `${opt.color}18`
                  : '#131720',
              color:
                sortCategory === opt.key ? opt.color : '#6b6358',
              border: `1px solid ${
                sortCategory === opt.key ? `${opt.color}40` : '#1e2638'
              }`,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Ranking Table ── */}
      <div
        className="space-y-3 animate-fade-in"
        style={{ animationDelay: '0.09s', opacity: 0 }}
      >
        {sorted.map((entry, i) => {
          const rank = i + 1;
          const member = teamMembers.find((m) => m.id === entry.memberId);
          if (!member) return null;

          return (
            <div
              key={entry.memberId}
              className="glow-card rounded-xl border transition-all animate-fade-in"
              style={{
                backgroundColor: '#131720',
                borderColor: rankBorder(rank),
                boxShadow: rankGlow(rank),
                animationDelay: `${0.12 + i * 0.03}s`,
                opacity: 0,
              }}
            >
              <div className="p-4 flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-10 flex-shrink-0">
                  {rankIcon(rank) || (
                    <span className="text-lg font-bold text-text-muted tabular-nums">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 w-44 flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: avatarGradient(member.color),
                      color: '#0b0d14',
                    }}
                  >
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-text-muted truncate">
                      {member.shortRole}
                    </div>
                  </div>
                </div>

                {/* Total Score */}
                <div className="flex-shrink-0 w-16 text-right">
                  <span
                    className="text-xl font-bold tabular-nums"
                    style={{ color: '#d4a574' }}
                  >
                    {entry.totalScore}
                  </span>
                </div>

                {/* Stacked Bars */}
                <div className="flex-1 min-w-0 hidden sm:block">
                  <div className="flex h-5 rounded-full overflow-hidden" style={{ backgroundColor: '#1c2230' }}>
                    {categories.map((cat) => {
                      const val = entry.scores[cat.key];
                      const widthPct = (val / entry.totalScore) * 100;
                      return (
                        <div
                          key={cat.key}
                          className="h-full transition-all relative group"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: cat.color,
                            opacity: 0.8,
                          }}
                          title={`${cat.label}: ${val}`}
                        />
                      );
                    })}
                  </div>
                  {/* Legend row */}
                  <div className="flex gap-2 mt-1.5">
                    {categories.map((cat) => (
                      <span key={cat.key} className="text-[9px] tabular-nums" style={{ color: cat.color }}>
                        {cat.shortLabel}: {entry.scores[cat.key]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1 flex-shrink-0 w-20 justify-end">
                  <Flame size={13} style={{ color: entry.streak >= 4 ? '#fb923c' : '#6b6358' }} />
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: entry.streak >= 4 ? '#fb923c' : '#6b6358' }}
                  >
                    {entry.streak}w
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div
        className="flex flex-wrap gap-4 px-4 py-3 rounded-xl border animate-fade-in"
        style={{
          backgroundColor: '#131720',
          borderColor: '#1e2638',
          animationDelay: '0.4s',
          opacity: 0,
        }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: cat.color, opacity: 0.8 }}
              />
              <Icon size={11} style={{ color: cat.color }} />
              <span className="text-[11px] text-text-muted">{cat.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
