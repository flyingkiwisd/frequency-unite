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
  Zap,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* --- CSS Keyframes injected via style tag --- */

const styleId = 'leaderboard-styles';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes lb-sparkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }
    @keyframes lb-bar-fill {
      from { width: 0%; }
    }
    @keyframes lb-podium-rise {
      from { opacity: 0; transform: translateY(30px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes lb-row-enter {
      from { opacity: 0; transform: translateX(-16px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes lb-score-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    @keyframes lb-glow-pulse {
      0%, 100% { box-shadow: 0 0 15px rgba(232, 180, 76, 0.1); }
      50% { box-shadow: 0 0 30px rgba(232, 180, 76, 0.25); }
    }
    .lb-sparkle-container {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      pointer-events: none;
    }
    .lb-sparkle-1 { animation: lb-sparkle 2s ease-in-out infinite; }
    .lb-sparkle-2 { animation: lb-sparkle 2s ease-in-out infinite 0.7s; }
    .lb-sparkle-3 { animation: lb-sparkle 2s ease-in-out infinite 1.4s; }
    .lb-podium-gold { animation: lb-podium-rise 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.1s; opacity: 0; }
    .lb-podium-silver { animation: lb-podium-rise 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.25s; opacity: 0; }
    .lb-podium-bronze { animation: lb-podium-rise 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.4s; opacity: 0; }
    .lb-glow-gold { animation: lb-glow-pulse 3s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}

/* --- Types --- */

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
  trend: 'up' | 'down' | 'stable';
  previousRank: number;
}

/* --- Mock Data --- */

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
    trend: 'stable',
    previousRank: 2,
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
    trend: 'stable',
    previousRank: 6,
  },
  {
    memberId: 'gareth',
    scores: { okrProgress: 80, nodeContribution: 85, coherenceScore: 70, accountability: 78, streakBonus: 50 },
    totalScore: 363,
    streak: 4,
    trend: 'up',
    previousRank: 9,
  },
  {
    memberId: 'mafe',
    scores: { okrProgress: 75, nodeContribution: 68, coherenceScore: 78, accountability: 88, streakBonus: 45 },
    totalScore: 354,
    streak: 3,
    trend: 'down',
    previousRank: 7,
  },
  {
    memberId: 'raamayan',
    scores: { okrProgress: 72, nodeContribution: 82, coherenceScore: 75, accountability: 70, streakBonus: 40 },
    totalScore: 339,
    streak: 2,
    trend: 'stable',
    previousRank: 9,
  },
  {
    memberId: 'andrew',
    scores: { okrProgress: 68, nodeContribution: 60, coherenceScore: 95, accountability: 72, streakBonus: 35 },
    totalScore: 330,
    streak: 2,
    trend: 'down',
    previousRank: 8,
  },
];

/* --- Category Config --- */

type CategoryTab = 'total' | 'engagement' | 'impact' | 'consistency';

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

const categoryTabs: { key: CategoryTab; label: string; color: string; sortKey: keyof ScoreBreakdown | 'total' }[] = [
  { key: 'total', label: 'Overall', color: '#d4a574', sortKey: 'total' },
  { key: 'engagement', label: 'Engagement', color: '#8b5cf6', sortKey: 'nodeContribution' },
  { key: 'impact', label: 'Impact', color: '#6b8f71', sortKey: 'okrProgress' },
  { key: 'consistency', label: 'Consistency', color: '#60a5fa', sortKey: 'accountability' },
];

/* --- Current user ID (simulated) --- */
const CURRENT_USER_ID = 'james';

/* --- Avatar gradient helper --- */

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

/* --- Podium styling --- */

const podiumConfig = {
  1: {
    color: '#e8b44c',
    bgFrom: 'rgba(232, 180, 76, 0.12)',
    bgTo: 'rgba(232, 180, 76, 0.03)',
    border: 'rgba(232, 180, 76, 0.35)',
    glow: '0 0 30px rgba(232, 180, 76, 0.12)',
    avatarSize: 72,
    animClass: 'lb-podium-gold',
    label: '1st',
  },
  2: {
    color: '#cbd5e1',
    bgFrom: 'rgba(203, 213, 225, 0.08)',
    bgTo: 'rgba(203, 213, 225, 0.02)',
    border: 'rgba(203, 213, 225, 0.25)',
    glow: '0 0 20px rgba(203, 213, 225, 0.06)',
    avatarSize: 60,
    animClass: 'lb-podium-silver',
    label: '2nd',
  },
  3: {
    color: '#cd7f32',
    bgFrom: 'rgba(205, 127, 50, 0.08)',
    bgTo: 'rgba(205, 127, 50, 0.02)',
    border: 'rgba(205, 127, 50, 0.25)',
    glow: '0 0 20px rgba(205, 127, 50, 0.06)',
    avatarSize: 56,
    animClass: 'lb-podium-bronze',
    label: '3rd',
  },
} as const;

/* --- Sparkle SVG --- */

function SparkleIcon({ size = 8, color = '#e8b44c' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2Z" />
    </svg>
  );
}

/* --- Trend icon --- */

function TrendIndicator({ trend, previousRank, currentRank }: { trend: string; previousRank: number; currentRank: number }) {
  const diff = previousRank - currentRank;
  if (trend === 'up' && diff > 0) {
    return (
      <div className="flex items-center gap-0.5" title={`Up ${diff} from #${previousRank}`}>
        <TrendingUp size={12} style={{ color: '#6b8f71' }} />
        <span className="text-[10px] font-semibold tabular-nums" style={{ color: '#6b8f71' }}>
          +{diff}
        </span>
      </div>
    );
  }
  if (trend === 'down') {
    const absDiff = Math.abs(diff);
    return (
      <div className="flex items-center gap-0.5" title={`Down ${absDiff} from #${previousRank}`}>
        <TrendingDown size={12} style={{ color: '#e06060' }} />
        <span className="text-[10px] font-semibold tabular-nums" style={{ color: '#e06060' }}>
          -{absDiff || 1}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5" title="No change">
      <Minus size={12} style={{ color: '#6b6358' }} />
    </div>
  );
}

/* --- Component --- */

export function LeaderboardView() {
  const [activeTab, setActiveTab] = useState<CategoryTab>('total');
  const [mounted, setMounted] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);

  useEffect(() => {
    injectStyles();
    setMounted(true);
    const barTimer = setTimeout(() => setBarsAnimated(true), 600);
    return () => clearTimeout(barTimer);
  }, []);

  const sortKey = categoryTabs.find((t) => t.key === activeTab)?.sortKey || 'total';

  const sorted = useMemo(() => {
    return [...leaderboardData].sort((a, b) => {
      if (sortKey === 'total') return b.totalScore - a.totalScore;
      return b.scores[sortKey] - a.scores[sortKey];
    });
  }, [sortKey]);

  const maxScore = useMemo(() => {
    if (sortKey === 'total') return Math.max(...leaderboardData.map((e) => e.totalScore));
    return Math.max(...leaderboardData.map((e) => e.scores[sortKey]));
  }, [sortKey]);

  // Top 3 for podium
  const podium = sorted.slice(0, 3);
  const restOfBoard = sorted.slice(3);

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

  /* --- Row animation style --- */
  function rowStyle(index: number): React.CSSProperties {
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateX(0)' : 'translateX(-16px)',
      transition: `opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1) ${0.5 + index * 0.06}s, transform 0.45s cubic-bezier(0.4, 0, 0.2, 1) ${0.5 + index * 0.06}s`,
    };
  }

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
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

      {/* --- Podium Display (Top 3) --- */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.03s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Crown size={14} style={{ color: '#e8b44c' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#e8b44c' }}>
            Top Performers
          </span>
        </div>

        {/* Podium: arranged as 2nd | 1st | 3rd */}
        <div className="grid grid-cols-3 gap-3 items-end">
          {[podium[1], podium[0], podium[2]].map((entry, displayIndex) => {
            if (!entry) return null;
            const actualRank = (displayIndex === 0 ? 2 : displayIndex === 1 ? 1 : 3) as 1 | 2 | 3;
            const config = podiumConfig[actualRank];
            const member = teamMembers.find((m) => m.id === entry.memberId);
            if (!member) return null;

            const isGold = actualRank === 1;

            return (
              <div
                key={entry.memberId}
                className={`${config.animClass} glow-card rounded-xl border text-center ${isGold ? 'lb-glow-gold' : ''}`}
                style={{
                  background: `linear-gradient(180deg, ${config.bgFrom}, ${config.bgTo})`,
                  borderColor: config.border,
                  padding: isGold ? '1.5rem 1rem' : '1.25rem 0.75rem',
                }}
              >
                {/* Rank badge */}
                <div className="flex justify-center mb-3">
                  <div
                    className="flex items-center justify-center rounded-full font-bold"
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: `${config.color}20`,
                      color: config.color,
                      fontSize: '0.7rem',
                      border: `1.5px solid ${config.color}50`,
                    }}
                  >
                    {config.label}
                  </div>
                </div>

                {/* Avatar with sparkle for gold */}
                <div className="flex justify-center mb-3" style={{ position: 'relative', display: 'inline-flex', margin: '0 auto' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div
                      className="rounded-full flex items-center justify-center font-bold"
                      style={{
                        width: config.avatarSize,
                        height: config.avatarSize,
                        background: avatarGradient(member.color),
                        color: '#0b0d14',
                        fontSize: isGold ? '1.1rem' : '0.9rem',
                        boxShadow: config.glow,
                        border: `2px solid ${config.color}40`,
                      }}
                    >
                      {member.avatar}
                    </div>
                    {/* Sparkle effects for top performers */}
                    {isGold && (
                      <div className="lb-sparkle-container">
                        <div className="lb-sparkle-1" style={{ position: 'absolute', top: 0, right: 0 }}>
                          <SparkleIcon size={10} color="#e8b44c" />
                        </div>
                        <div className="lb-sparkle-2" style={{ position: 'absolute', top: -3, right: 8 }}>
                          <SparkleIcon size={7} color="#e8b44c" />
                        </div>
                        <div className="lb-sparkle-3" style={{ position: 'absolute', top: 6, right: -2 }}>
                          <SparkleIcon size={6} color="#e8b44c" />
                        </div>
                      </div>
                    )}
                    {actualRank <= 2 && !isGold && (
                      <div className="lb-sparkle-container">
                        <div className="lb-sparkle-1" style={{ position: 'absolute', top: 0, right: 2 }}>
                          <SparkleIcon size={7} color={config.color} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Score */}
                <h3
                  className="font-bold truncate"
                  style={{ color: '#f0ebe4', fontSize: isGold ? '0.95rem' : '0.85rem' }}
                >
                  {member.name.split(' ')[0]}
                </h3>
                <p className="text-[11px] truncate" style={{ color: '#6b6358' }}>
                  {member.shortRole}
                </p>
                <div
                  className="text-2xl font-bold tabular-nums mt-2"
                  style={{ color: config.color, fontSize: isGold ? '1.75rem' : '1.5rem' }}
                >
                  {entry.totalScore}
                </div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6b6358' }}>
                  points
                </div>

                {/* Streak */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Flame size={12} style={{ color: '#fb923c' }} />
                  <span className="text-xs font-semibold tabular-nums" style={{ color: '#fb923c' }}>
                    {entry.streak}w
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Category Tabs --- */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.06s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <ArrowUpDown size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-1">
            Category
          </span>
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? `${tab.color}18` : '#131720',
                color: activeTab === tab.key ? tab.color : '#6b6358',
                border: `1px solid ${activeTab === tab.key ? `${tab.color}40` : '#1e2638'}`,
                boxShadow: activeTab === tab.key ? `0 0 12px ${tab.color}10` : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Category Leaders --- */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.08s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap size={13} className="text-text-muted" />
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
                style={{ backgroundColor: '#131720', borderColor: `${cat.color}22` }}
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
                      style={{ background: avatarGradient(cat.member.color), color: '#0b0d14' }}
                    >
                      {cat.member.avatar}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-text-primary truncate">
                      {cat.member?.name.split(' ')[0]}
                    </div>
                    <div className="text-sm font-bold tabular-nums" style={{ color: cat.color }}>
                      {cat.leader.scores[cat.key]}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Full Leaderboard Table --- */}
      <div className="space-y-2">
        {/* Table Header */}
        <div
          className="flex items-center gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: '#6b6358', ...rowStyle(-1) }}
        >
          <div className="w-8 text-center">#</div>
          <div className="w-40">Steward</div>
          <div className="w-16 text-right">Score</div>
          <div className="flex-1 hidden sm:block">Performance</div>
          <div className="w-14 text-center">Trend</div>
          <div className="w-14 text-right">Streak</div>
        </div>

        {/* Rows */}
        {sorted.map((entry, i) => {
          const rank = i + 1;
          const member = teamMembers.find((m) => m.id === entry.memberId);
          if (!member) return null;

          const isCurrentUser = entry.memberId === CURRENT_USER_ID;
          const isTop3 = rank <= 3;
          const entryScore = sortKey === 'total' ? entry.totalScore : entry.scores[sortKey];
          const barWidth = maxScore > 0 ? (entryScore / maxScore) * 100 : 0;

          const tabColor = categoryTabs.find((t) => t.key === activeTab)?.color || '#d4a574';

          return (
            <div
              key={entry.memberId}
              className="glow-card rounded-xl border transition-all"
              style={{
                ...rowStyle(i),
                backgroundColor: isCurrentUser ? 'rgba(139, 92, 246, 0.06)' : '#131720',
                borderColor: isCurrentUser
                  ? 'rgba(139, 92, 246, 0.3)'
                  : isTop3
                    ? podiumConfig[rank as 1 | 2 | 3]?.border || '#1e2638'
                    : '#1e2638',
                boxShadow: isCurrentUser
                  ? '0 0 20px rgba(139, 92, 246, 0.08)'
                  : isTop3
                    ? podiumConfig[rank as 1 | 2 | 3]?.glow || 'none'
                    : 'none',
              }}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Rank */}
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {rank === 1 && <Crown size={16} style={{ color: '#e8b44c' }} />}
                  {rank === 2 && <Medal size={16} style={{ color: '#cbd5e1' }} />}
                  {rank === 3 && <Medal size={16} style={{ color: '#cd7f32' }} />}
                  {rank > 3 && (
                    <span className="text-lg font-bold tabular-nums" style={{ color: '#6b6358' }}>
                      {rank}
                    </span>
                  )}
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 w-40 flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: avatarGradient(member.color),
                      color: '#0b0d14',
                      border: isCurrentUser ? '2px solid rgba(139, 92, 246, 0.4)' : 'none',
                    }}
                  >
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-text-primary truncate">
                        {member.name}
                      </span>
                      {isCurrentUser && (
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-muted truncate">{member.shortRole}</div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 w-16 text-right">
                  <span
                    className="text-xl font-bold tabular-nums"
                    style={{ color: isCurrentUser ? '#8b5cf6' : tabColor }}
                  >
                    {entryScore}
                  </span>
                </div>

                {/* Animated Score Bar */}
                <div className="flex-1 min-w-0 hidden sm:block">
                  <div className="flex h-5 rounded-full overflow-hidden" style={{ backgroundColor: '#1c2230' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: barsAnimated ? `${barWidth}%` : '0%',
                        background: isCurrentUser
                          ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.6), rgba(139, 92, 246, 0.8))'
                          : sortKey === 'total'
                            ? `linear-gradient(90deg, ${tabColor}90, ${tabColor})`
                            : `${tabColor}cc`,
                        transition: `width 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.05}s`,
                        boxShadow: `0 0 8px ${isCurrentUser ? 'rgba(139, 92, 246, 0.3)' : `${tabColor}30`}`,
                      }}
                    />
                  </div>
                  {/* Mini category breakdown below bar (only in total view) */}
                  {sortKey === 'total' && (
                    <div className="flex gap-2 mt-1">
                      {categories.map((cat) => (
                        <span key={cat.key} className="text-[9px] tabular-nums" style={{ color: cat.color }}>
                          {cat.shortLabel}: {entry.scores[cat.key]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trend */}
                <div className="w-14 flex justify-center flex-shrink-0">
                  <TrendIndicator trend={entry.trend} previousRank={entry.previousRank} currentRank={rank} />
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1 flex-shrink-0 w-14 justify-end">
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

      {/* --- Your Rank Summary (if user not in top 3) --- */}
      {(() => {
        const userRank = sorted.findIndex((e) => e.memberId === CURRENT_USER_ID) + 1;
        const userEntry = sorted.find((e) => e.memberId === CURRENT_USER_ID);
        const userMember = teamMembers.find((m) => m.id === CURRENT_USER_ID);
        if (!userEntry || !userMember || userRank <= 0) return null;

        return (
          <div
            className="glow-card rounded-xl border p-4 animate-fade-in"
            style={{
              animationDelay: '0.5s',
              opacity: 0,
              backgroundColor: 'rgba(139, 92, 246, 0.06)',
              borderColor: 'rgba(139, 92, 246, 0.25)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star size={14} style={{ color: '#8b5cf6' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>
                  Your Position
                </span>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: avatarGradient(userMember.color), color: '#0b0d14' }}
                >
                  {userMember.avatar}
                </div>
                <div>
                  <span className="text-sm font-bold text-text-primary">{userMember.name}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span style={{ color: '#8b5cf6' }}>
                      Rank #{userRank}
                    </span>
                    <span className="tabular-nums" style={{ color: '#d4a574' }}>
                      {userEntry.totalScore} pts
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Flame size={11} style={{ color: '#fb923c' }} />
                      <span style={{ color: '#fb923c' }}>{userEntry.streak}w streak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- Legend --- */}
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
