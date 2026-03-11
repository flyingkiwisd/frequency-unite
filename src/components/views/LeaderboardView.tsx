'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Award,
  BarChart3,
  Zap,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ---- Types ---- */

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
  streak: number;
  trend: 'up' | 'down' | 'flat';
  previousRank: number;
}

/* ---- Mock Data ---- */

const leaderboardData: LeaderboardEntry[] = [
  {
    memberId: 'fairman',
    scores: { okrProgress: 92, nodeContribution: 95, coherenceScore: 85, accountability: 88, streakBonus: 75 },
    totalScore: 435,
    streak: 6,
    trend: 'up',
    previousRank: 2,
  },
  {
    memberId: 'james',
    scores: { okrProgress: 88, nodeContribution: 82, coherenceScore: 90, accountability: 85, streakBonus: 65 },
    totalScore: 410,
    streak: 5,
    trend: 'flat',
    previousRank: 1,
  },
  {
    memberId: 'sian',
    scores: { okrProgress: 85, nodeContribution: 78, coherenceScore: 82, accountability: 90, streakBonus: 60 },
    totalScore: 395,
    streak: 4,
    trend: 'up',
    previousRank: 4,
  },
  {
    memberId: 'greg',
    scores: { okrProgress: 90, nodeContribution: 88, coherenceScore: 72, accountability: 82, streakBonus: 55 },
    totalScore: 387,
    streak: 3,
    trend: 'down',
    previousRank: 3,
  },
  {
    memberId: 'colleen',
    scores: { okrProgress: 82, nodeContribution: 75, coherenceScore: 88, accountability: 86, streakBonus: 50 },
    totalScore: 381,
    streak: 4,
    trend: 'up',
    previousRank: 6,
  },
  {
    memberId: 'dave',
    scores: { okrProgress: 78, nodeContribution: 80, coherenceScore: 92, accountability: 75, streakBonus: 45 },
    totalScore: 370,
    streak: 3,
    trend: 'flat',
    previousRank: 5,
  },
  {
    memberId: 'gareth',
    scores: { okrProgress: 80, nodeContribution: 85, coherenceScore: 70, accountability: 78, streakBonus: 50 },
    totalScore: 363,
    streak: 4,
    trend: 'up',
    previousRank: 8,
  },
  {
    memberId: 'mafe',
    scores: { okrProgress: 75, nodeContribution: 68, coherenceScore: 78, accountability: 88, streakBonus: 45 },
    totalScore: 354,
    streak: 3,
    trend: 'flat',
    previousRank: 7,
  },
  {
    memberId: 'raamayan',
    scores: { okrProgress: 72, nodeContribution: 82, coherenceScore: 75, accountability: 70, streakBonus: 40 },
    totalScore: 339,
    streak: 2,
    trend: 'down',
    previousRank: 8,
  },
  {
    memberId: 'andrew',
    scores: { okrProgress: 68, nodeContribution: 60, coherenceScore: 95, accountability: 72, streakBonus: 35 },
    totalScore: 330,
    streak: 2,
    trend: 'up',
    previousRank: 10,
  },
];

/* ---- Category config ---- */

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

/* ---- Avatar gradient helper ---- */

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

/* ---- Rank display helpers ---- */

const GOLD = '#e8b44c';
const SILVER = '#cbd5e1';
const BRONZE = '#cd7f32';

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

/* ---- SVG Trophy Icon ---- */

function TrophySVG({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M8 21h8m-4-4v4m-5-8c-1.5 0-3-1-3-3V6h2m14 4c0 2-1.5 3-3 3m3-7v4c0 2-1.5 3-3 3H8c-1.5 0-3-1-3-3V6h14Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v2m0 0c-2 0-3.5 1-3.5 3s1.5 3 3.5 3 3.5-1 3.5-3-1.5-3-3.5-3Z"
        fill={`${color}30`}
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  );
}

/* ---- Mini Sparkline SVG ---- */

function Sparkline({ data, color, width = 60, height = 20 }: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* Last point dot */}
      {data.length > 0 && (
        <circle
          cx={(data.length - 1) * step}
          cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
          r="2.5"
          fill={color}
          opacity="0.9"
        />
      )}
    </svg>
  );
}

/* ---- Animated Score Bar ---- */

function AnimatedScoreBar({ score, maxScore, color, delay = '0s' }: {
  score: number;
  maxScore: number;
  color: string;
  delay?: string;
}) {
  const [width, setWidth] = useState(0);
  const pct = (score / maxScore) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 150);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1c2230' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transition: `width 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}`,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </div>
  );
}

/* ---- Trend Icon ---- */

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp size={12} style={{ color: '#6b8f71' }} />;
  if (trend === 'down') return <TrendingDown size={12} style={{ color: '#e06060' }} />;
  return <Minus size={12} style={{ color: '#6b6358' }} />;
}

/* ---- Generate fake sparkline data ---- */

function generateSparkline(finalScore: number): number[] {
  const points: number[] = [];
  let val = finalScore - 40 + Math.random() * 20;
  for (let i = 0; i < 8; i++) {
    val += (Math.random() - 0.4) * 15;
    val = Math.max(0, Math.min(100, val));
    points.push(Math.round(val));
  }
  points.push(finalScore);
  return points;
}

/* ===============================================================================
   Component
   =============================================================================== */

export function LeaderboardView() {
  const [sortCategory, setSortCategory] = useState<keyof ScoreBreakdown | 'total'>('total');
  const [activeTab, setActiveTab] = useState<'overall' | keyof ScoreBreakdown>('overall');

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

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalMembers = leaderboardData.length;
    const avgScore = Math.round(leaderboardData.reduce((s, e) => s + e.totalScore, 0) / totalMembers);
    const highestScore = Math.max(...leaderboardData.map((e) => e.totalScore));
    const totalStreaks = leaderboardData.filter((e) => e.streak >= 4).length;
    const avgCoherence = Math.round(leaderboardData.reduce((s, e) => s + e.scores.coherenceScore, 0) / totalMembers);
    return { totalMembers, avgScore, highestScore, totalStreaks, avgCoherence };
  }, []);

  // Top 3 for podium
  const topThree = useMemo(() => {
    const overallSorted = [...leaderboardData].sort((a, b) => b.totalScore - a.totalScore);
    return overallSorted.slice(0, 3);
  }, []);

  // Handle tab changes
  const handleTabChange = (tab: 'overall' | keyof ScoreBreakdown) => {
    setActiveTab(tab);
    setSortCategory(tab === 'overall' ? 'total' : tab);
  };

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
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

      {/* ---- Summary Stats Row ---- */}
      <div
        className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-fade-in"
        style={{ animationDelay: '0.03s', opacity: 0 }}
      >
        {[
          { icon: Users, label: 'Stewards', value: summaryStats.totalMembers, color: '#d4a574', bg: 'rgba(212, 165, 116, 0.1)' },
          { icon: BarChart3, label: 'Avg Score', value: summaryStats.avgScore, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
          { icon: Zap, label: 'High Score', value: summaryStats.highestScore, color: '#e8b44c', bg: 'rgba(232, 180, 76, 0.1)' },
          { icon: Flame, label: 'Hot Streaks', value: summaryStats.totalStreaks, color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)' },
          { icon: Heart, label: 'Avg Coherence', value: summaryStats.avgCoherence, color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.1)' },
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={i}
              className="glow-card rounded-xl border p-3 animate-fade-in"
              style={{
                backgroundColor: '#131720',
                borderColor: '#1e2638',
                animationDelay: `${0.05 + i * 0.03}s`,
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: stat.bg }}
                >
                  <StatIcon size={12} style={{ color: stat.color }} />
                </div>
                <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-xl font-bold tabular-nums" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Podium Display ---- */}
      <div
        className="glow-card rounded-xl border p-6 animate-fade-in"
        style={{
          backgroundColor: '#131720',
          borderColor: 'rgba(232, 180, 76, 0.15)',
          animationDelay: '0.08s',
          opacity: 0,
        }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Award size={14} style={{ color: GOLD }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>
            Top Stewards This Period
          </span>
        </div>

        <div className="flex items-end justify-center gap-4 sm:gap-8">
          {/* 2nd place */}
          {topThree[1] && (() => {
            const member = teamMembers.find((m) => m.id === topThree[1].memberId);
            if (!member) return null;
            return (
              <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.15s', opacity: 0 }}>
                <div className="relative mb-2">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: avatarGradient(member.color),
                      color: '#0b0d14',
                      boxShadow: `0 0 16px rgba(203, 213, 225, 0.15)`,
                      border: `2px solid ${SILVER}40`,
                    }}
                  >
                    {member.avatar}
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: SILVER, color: '#0b0d14' }}
                  >
                    2
                  </div>
                </div>
                <TrophySVG color={SILVER} size={22} />
                <div className="text-xs font-semibold text-text-primary mt-1">{member.name.split(' ')[0]}</div>
                <div className="text-lg font-bold tabular-nums" style={{ color: SILVER }}>{topThree[1].totalScore}</div>
                <div
                  className="w-16 rounded-t-lg mt-1"
                  style={{ height: '48px', background: `linear-gradient(to top, ${SILVER}10, ${SILVER}25)`, border: `1px solid ${SILVER}20`, borderBottom: 'none' }}
                />
              </div>
            );
          })()}

          {/* 1st place */}
          {topThree[0] && (() => {
            const member = teamMembers.find((m) => m.id === topThree[0].memberId);
            if (!member) return null;
            return (
              <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <div className="relative mb-2">
                  <div
                    className="w-18 h-18 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{
                      width: '72px',
                      height: '72px',
                      background: avatarGradient(member.color),
                      color: '#0b0d14',
                      boxShadow: `0 0 24px rgba(232, 180, 76, 0.25)`,
                      border: `2px solid ${GOLD}50`,
                    }}
                  >
                    {member.avatar}
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: GOLD, color: '#0b0d14' }}
                  >
                    <Crown size={12} />
                  </div>
                </div>
                <TrophySVG color={GOLD} size={28} />
                <div className="text-sm font-semibold text-text-primary mt-1">{member.name.split(' ')[0]}</div>
                <div className="text-sm text-text-muted">{member.shortRole}</div>
                <div className="text-2xl font-bold tabular-nums" style={{ color: GOLD }}>{topThree[0].totalScore}</div>
                <div className="flex items-center gap-1 mb-1">
                  <Flame size={11} style={{ color: '#fb923c' }} />
                  <span className="text-[10px] font-medium" style={{ color: '#fb923c' }}>{topThree[0].streak}w streak</span>
                </div>
                <div
                  className="w-20 rounded-t-lg"
                  style={{ height: '72px', background: `linear-gradient(to top, ${GOLD}10, ${GOLD}25)`, border: `1px solid ${GOLD}20`, borderBottom: 'none' }}
                />
              </div>
            );
          })()}

          {/* 3rd place */}
          {topThree[2] && (() => {
            const member = teamMembers.find((m) => m.id === topThree[2].memberId);
            if (!member) return null;
            return (
              <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <div className="relative mb-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: avatarGradient(member.color),
                      color: '#0b0d14',
                      boxShadow: `0 0 12px rgba(205, 127, 50, 0.12)`,
                      border: `2px solid ${BRONZE}40`,
                    }}
                  >
                    {member.avatar}
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: BRONZE, color: '#0b0d14' }}
                  >
                    3
                  </div>
                </div>
                <TrophySVG color={BRONZE} size={22} />
                <div className="text-xs font-semibold text-text-primary mt-1">{member.name.split(' ')[0]}</div>
                <div className="text-lg font-bold tabular-nums" style={{ color: BRONZE }}>{topThree[2].totalScore}</div>
                <div
                  className="w-16 rounded-t-lg mt-1"
                  style={{ height: '36px', background: `linear-gradient(to top, ${BRONZE}10, ${BRONZE}25)`, border: `1px solid ${BRONZE}20`, borderBottom: 'none' }}
                />
              </div>
            );
          })()}
        </div>
      </div>

      {/* ---- Category Tabs ---- */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 animate-fade-in"
        style={{ animationDelay: '0.12s', opacity: 0 }}
      >
        <button
          onClick={() => handleTabChange('overall')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
          style={{
            backgroundColor: activeTab === 'overall' ? 'rgba(212, 165, 116, 0.12)' : '#131720',
            color: activeTab === 'overall' ? '#d4a574' : '#6b6358',
            border: `1px solid ${activeTab === 'overall' ? 'rgba(212, 165, 116, 0.3)' : '#1e2638'}`,
          }}
        >
          <Trophy size={12} />
          Overall
        </button>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleTabChange(cat.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={{
                backgroundColor: isActive ? `${cat.color}18` : '#131720',
                color: isActive ? cat.color : '#6b6358',
                border: `1px solid ${isActive ? `${cat.color}40` : '#1e2638'}`,
              }}
            >
              <Icon size={12} />
              {cat.shortLabel}
            </button>
          );
        })}
      </div>

      {/* ---- Category Leaders ---- */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.14s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Crown size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Category Leaders
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {categoryLeaders.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                className="glow-card rounded-xl border p-4 animate-fade-in"
                style={{
                  backgroundColor: '#131720',
                  borderColor: `${cat.color}22`,
                  animationDelay: `${0.16 + i * 0.03}s`,
                  opacity: 0,
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

      {/* ---- Sort Controls ---- */}
      <div
        className="flex items-center gap-2 flex-wrap animate-fade-in"
        style={{ animationDelay: '0.18s', opacity: 0 }}
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

      {/* ---- Ranking Table with Enhanced Member Cards ---- */}
      <div
        className="space-y-3 animate-fade-in"
        style={{ animationDelay: '0.2s', opacity: 0 }}
      >
        {sorted.map((entry, i) => {
          const rank = i + 1;
          const member = teamMembers.find((m) => m.id === entry.memberId);
          if (!member) return null;

          // Generate sparkline data from member scores
          const sparkData = generateSparkline(
            activeTab === 'overall'
              ? Math.round(entry.totalScore / 5)
              : entry.scores[activeTab as keyof ScoreBreakdown] || entry.totalScore / 5
          );

          const rankChange = entry.previousRank - rank;

          return (
            <div
              key={entry.memberId}
              className="glow-card rounded-xl border transition-all animate-fade-in"
              style={{
                backgroundColor: '#131720',
                borderColor: rankBorder(rank),
                boxShadow: rankGlow(rank),
                animationDelay: `${0.22 + i * 0.04}s`,
                opacity: 0,
              }}
            >
              <div className="p-4">
                {/* Top row: rank, avatar, name, score, trend */}
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex flex-col items-center justify-center w-10 flex-shrink-0">
                    {rank === 1 ? (
                      <Crown size={18} style={{ color: GOLD }} />
                    ) : rank === 2 ? (
                      <Medal size={16} style={{ color: SILVER }} />
                    ) : rank === 3 ? (
                      <Medal size={16} style={{ color: BRONZE }} />
                    ) : (
                      <span className="text-lg font-bold text-text-muted tabular-nums">
                        {rank}
                      </span>
                    )}
                    {/* Rank change indicator */}
                    {rankChange !== 0 && (
                      <span
                        className="text-[9px] font-semibold mt-0.5"
                        style={{ color: rankChange > 0 ? '#6b8f71' : '#e06060' }}
                      >
                        {rankChange > 0 ? `+${rankChange}` : rankChange}
                      </span>
                    )}
                  </div>

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 w-40 flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
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

                  {/* Trend arrow */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <TrendIcon trend={entry.trend} />
                  </div>

                  {/* Sparkline */}
                  <div className="hidden sm:block flex-shrink-0">
                    <Sparkline
                      data={sparkData}
                      color={
                        rank === 1 ? GOLD : rank === 2 ? SILVER : rank === 3 ? BRONZE : '#6b6358'
                      }
                      width={56}
                      height={18}
                    />
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-1 flex-shrink-0 w-16 justify-end">
                    <Flame size={13} style={{ color: entry.streak >= 4 ? '#fb923c' : '#6b6358' }} />
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: entry.streak >= 4 ? '#fb923c' : '#6b6358' }}
                    >
                      {entry.streak}w
                    </span>
                  </div>
                </div>

                {/* Score bars breakdown */}
                <div className="mt-3 hidden sm:block">
                  <div className="grid grid-cols-5 gap-2">
                    {categories.map((cat, ci) => (
                      <div key={cat.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] text-text-muted uppercase">{cat.shortLabel}</span>
                          <span className="text-[10px] font-semibold tabular-nums" style={{ color: cat.color }}>
                            {entry.scores[cat.key]}
                          </span>
                        </div>
                        <AnimatedScoreBar
                          score={entry.scores[cat.key]}
                          maxScore={100}
                          color={cat.color}
                          delay={`${ci * 0.05}s`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile: stacked bar */}
                <div className="mt-3 sm:hidden">
                  <div className="flex h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#1c2230' }}>
                    {categories.map((cat) => {
                      const val = entry.scores[cat.key];
                      const widthPct = (val / entry.totalScore) * 100;
                      return (
                        <div
                          key={cat.key}
                          className="h-full"
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
                  <div className="flex gap-2 mt-1">
                    {categories.map((cat) => (
                      <span key={cat.key} className="text-[9px] tabular-nums" style={{ color: cat.color }}>
                        {cat.shortLabel}: {entry.scores[cat.key]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Legend ---- */}
      <div
        className="flex flex-wrap gap-4 px-4 py-3 rounded-xl border animate-fade-in"
        style={{
          backgroundColor: '#131720',
          borderColor: '#1e2638',
          animationDelay: '0.55s',
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
