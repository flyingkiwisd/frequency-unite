'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Star,
  Send,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Users,
  Calendar,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ─── Types ─── */

interface WeeklyFeedback {
  weekLabel: string;
  weekStart: string;
  scores: Record<string, number>; // memberId -> score (1-5)
}

/* ─── Mock Data (4 weeks) ─── */

const feedbackHistory: WeeklyFeedback[] = [
  {
    weekLabel: 'Week 10 (Mar 2-8)',
    weekStart: '2026-03-02',
    scores: {
      james: 4.5,
      sian: 4.2,
      fairman: 4.8,
      greg: 4.3,
      colleen: 4.6,
      dave: 4.1,
      gareth: 4.0,
      mafe: 3.9,
      raamayan: 3.7,
      andrew: 4.4,
    },
  },
  {
    weekLabel: 'Week 9 (Feb 23-Mar 1)',
    weekStart: '2026-02-23',
    scores: {
      james: 4.3,
      sian: 4.0,
      fairman: 4.6,
      greg: 4.5,
      colleen: 4.4,
      dave: 4.3,
      gareth: 3.8,
      mafe: 4.1,
      raamayan: 3.9,
      andrew: 4.2,
    },
  },
  {
    weekLabel: 'Week 8 (Feb 16-22)',
    weekStart: '2026-02-16',
    scores: {
      james: 4.6,
      sian: 3.8,
      fairman: 4.5,
      greg: 4.2,
      colleen: 4.3,
      dave: 4.0,
      gareth: 4.1,
      mafe: 3.8,
      raamayan: 4.0,
      andrew: 4.5,
    },
  },
  {
    weekLabel: 'Week 7 (Feb 9-15)',
    weekStart: '2026-02-09',
    scores: {
      james: 4.2,
      sian: 3.9,
      fairman: 4.3,
      greg: 4.0,
      colleen: 4.1,
      dave: 3.8,
      gareth: 3.6,
      mafe: 3.7,
      raamayan: 3.5,
      andrew: 4.0,
    },
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

/* ─── Trend helpers ─── */

function getTrend(memberId: string): 'up' | 'down' | 'flat' {
  const latest = feedbackHistory[0]?.scores[memberId];
  const previous = feedbackHistory[1]?.scores[memberId];
  if (!latest || !previous) return 'flat';
  const diff = latest - previous;
  if (diff > 0.15) return 'up';
  if (diff < -0.15) return 'down';
  return 'flat';
}

function trendColor(trend: 'up' | 'down' | 'flat'): string {
  if (trend === 'up') return '#6b8f71';
  if (trend === 'down') return '#e06060';
  return '#a09888';
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp size={12} style={{ color: '#6b8f71' }} />;
  if (trend === 'down') return <TrendingDown size={12} style={{ color: '#e06060' }} />;
  return <Minus size={12} style={{ color: '#a09888' }} />;
}

/* ─── Star Rating Component ─── */

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readonly ? star <= Math.round(value) : star <= (hovered || value);
        return (
          <button
            key={star}
            disabled={readonly}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => onChange?.(star)}
            className="transition-all"
            style={{
              cursor: readonly ? 'default' : 'pointer',
              background: 'none',
              border: 'none',
              padding: 1,
            }}
          >
            <Star
              size={readonly ? 12 : 18}
              style={{
                color: filled ? '#e8b44c' : '#2e3a4e',
                fill: filled ? '#e8b44c' : 'none',
                transition: 'color 0.15s, fill 0.15s',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ─── Sparkline Component ─── */

function Sparkline({ values, color }: { values: number[]; color: string }) {
  // Reversed so oldest is on left
  const data = [...values].reverse();
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const range = max - min || 1;
  const width = 80;
  const height = 24;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Latest point dot */}
      {data.length > 0 && (
        <circle
          cx={width}
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  );
}

/* ─── Component ─── */

export function PeerFeedbackView() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [currentRatings, setCurrentRatings] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Members to show feedback for
  const feedbackMembers = useMemo(() => {
    const ids = Object.keys(feedbackHistory[0]?.scores || {});
    return ids
      .map((id) => teamMembers.find((m) => m.id === id))
      .filter(Boolean) as typeof teamMembers;
  }, []);

  // Aggregate stats
  const latestWeek = feedbackHistory[0];
  const latestScores = Object.values(latestWeek?.scores || {});
  const avgScore =
    latestScores.length > 0
      ? (latestScores.reduce((s, v) => s + v, 0) / latestScores.length).toFixed(1)
      : '0';
  const submissionsThisWeek = latestScores.length;
  const trendingUp = feedbackMembers.filter((m) => getTrend(m.id) === 'up').length;
  const trendingDown = feedbackMembers.filter((m) => getTrend(m.id) === 'down').length;

  // Get sparkline values for a member (most recent 4 weeks)
  function getSparklineValues(memberId: string): number[] {
    return feedbackHistory.map((w) => w.scores[memberId] || 0);
  }

  const handleSubmit = () => {
    setSubmitted(true);
    // In production, this would POST to an API
  };

  const handleRating = (memberId: string, score: number) => {
    setCurrentRatings((prev) => ({ ...prev, [memberId]: score }));
  };

  const ratingsGiven = Object.keys(currentRatings).length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <MessageSquare size={28} className="text-accent" />
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Peer Feedback</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm">
          Weekly peer recognition and feedback. Rate your fellow stewards to
          strengthen collaboration and accountability.
        </p>
      </div>

      {/* ── Aggregate Stats ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in"
        style={{ animationDelay: '0.03s', opacity: 0 }}
      >
        {[
          {
            label: 'Average Score',
            value: avgScore,
            icon: Star,
            color: '#e8b44c',
            bg: 'rgba(232, 180, 76, 0.12)',
          },
          {
            label: 'Submissions This Week',
            value: submissionsThisWeek.toString(),
            icon: MessageSquare,
            color: '#8b5cf6',
            bg: 'rgba(139, 92, 246, 0.12)',
          },
          {
            label: 'Trending Up',
            value: trendingUp.toString(),
            icon: TrendingUp,
            color: '#6b8f71',
            bg: 'rgba(107, 143, 113, 0.12)',
          },
          {
            label: 'Trending Down',
            value: trendingDown.toString(),
            icon: TrendingDown,
            color: '#e06060',
            bg: 'rgba(224, 96, 96, 0.12)',
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
            </div>
          );
        })}
      </div>

      {/* ── Submit Feedback Section ── */}
      <div
        className="glow-card rounded-xl border animate-fade-in"
        style={{
          backgroundColor: '#131720',
          borderColor: '#1e2638',
          animationDelay: '0.05s',
          opacity: 0,
        }}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send size={14} className="text-accent" />
              <span className="text-sm font-semibold text-text-primary">
                Submit Weekly Feedback
              </span>
              <span className="text-[10px] text-text-muted px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1c2230' }}>
                Week of Mar 2-8
              </span>
            </div>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: isAnonymous
                  ? 'rgba(107, 143, 113, 0.12)'
                  : 'rgba(232, 180, 76, 0.12)',
                color: isAnonymous ? '#6b8f71' : '#e8b44c',
                border: `1px solid ${isAnonymous ? 'rgba(107, 143, 113, 0.25)' : 'rgba(232, 180, 76, 0.25)'}`,
              }}
            >
              {isAnonymous ? <EyeOff size={12} /> : <Eye size={12} />}
              {isAnonymous ? 'Anonymous' : 'Named'}
            </button>
          </div>

          {submitted ? (
            <div
              className="flex items-center justify-center gap-3 py-8 rounded-lg"
              style={{
                backgroundColor: 'rgba(107, 143, 113, 0.08)',
                border: '1px solid rgba(107, 143, 113, 0.2)',
              }}
            >
              <Star size={20} style={{ color: '#6b8f71', fill: '#6b8f71' }} />
              <span className="text-sm font-medium" style={{ color: '#6b8f71' }}>
                Feedback submitted for {ratingsGiven} stewards. Thank you!
              </span>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {feedbackMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: currentRatings[member.id]
                        ? 'rgba(232, 180, 76, 0.04)'
                        : '#0f1219',
                      border: `1px solid ${currentRatings[member.id] ? 'rgba(232, 180, 76, 0.15)' : '#1c2230'}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: avatarGradient(member.color),
                        color: '#0b0d14',
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-text-primary truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-text-muted truncate">
                        {member.shortRole}
                      </div>
                    </div>
                    <StarRating
                      value={currentRatings[member.id] || 0}
                      onChange={(v) => handleRating(member.id, v)}
                    />
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #1e2638' }}>
                <span className="text-xs text-text-muted">
                  {ratingsGiven}/{feedbackMembers.length} rated
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={ratingsGiven === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    backgroundColor:
                      ratingsGiven > 0
                        ? 'rgba(212, 165, 116, 0.15)'
                        : '#1c2230',
                    color: ratingsGiven > 0 ? '#d4a574' : '#6b6358',
                    border: `1px solid ${ratingsGiven > 0 ? 'rgba(212, 165, 116, 0.3)' : '#1e2638'}`,
                    cursor: ratingsGiven > 0 ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Send size={14} />
                  Submit Feedback
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Collaboration Score Summary ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.07s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Collaboration Scores — Current Week
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {feedbackMembers
            .map((member) => {
              const score = latestWeek?.scores[member.id] || 0;
              const trend = getTrend(member.id);
              const sparkData = getSparklineValues(member.id);
              return { member, score, trend, sparkData };
            })
            .sort((a, b) => b.score - a.score)
            .map(({ member, score, trend, sparkData }, i) => (
              <div
                key={member.id}
                className="glow-card rounded-xl border p-4 flex items-center gap-4 animate-fade-in"
                style={{
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                  animationDelay: `${0.1 + i * 0.03}s`,
                  opacity: 0,
                }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: avatarGradient(member.color),
                    color: '#0b0d14',
                  }}
                >
                  {member.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {member.name}
                    </span>
                    <TrendIcon trend={trend} />
                  </div>
                  <div className="text-[11px] text-text-muted">
                    {member.shortRole}
                  </div>
                </div>

                {/* Sparkline */}
                <div className="flex-shrink-0 hidden sm:block">
                  <Sparkline values={sparkData} color={trendColor(trend)} />
                </div>

                {/* Score */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold tabular-nums" style={{ color: '#e8b44c' }}>
                      {score.toFixed(1)}
                    </span>
                    <Star size={13} style={{ color: '#e8b44c', fill: '#e8b44c' }} />
                  </div>
                  <StarRating value={score} readonly />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── History Toggle ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.12s', opacity: 0 }}
      >
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: '#131720',
            color: showHistory ? '#d4a574' : '#a09888',
            border: `1px solid ${showHistory ? 'rgba(212, 165, 116, 0.25)' : '#1e2638'}`,
          }}
        >
          <Calendar size={14} />
          <span className="flex-1 text-left">
            Feedback History (Past 4 Weeks)
          </span>
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-4">
            {feedbackHistory.map((week, wi) => (
              <div
                key={week.weekStart}
                className="glow-card rounded-xl border animate-fade-in"
                style={{
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                  animationDelay: `${wi * 0.05}s`,
                  opacity: 0,
                }}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={13} className="text-text-muted" />
                    <span className="text-xs font-semibold text-text-secondary">
                      {week.weekLabel}
                    </span>
                    <span className="text-[10px] text-text-muted px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1c2230' }}>
                      Avg: {(
                        Object.values(week.scores).reduce((s, v) => s + v, 0) /
                        Object.values(week.scores).length
                      ).toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Object.entries(week.scores)
                      .sort(([, a], [, b]) => b - a)
                      .map(([memberId, score]) => {
                        const member = teamMembers.find((m) => m.id === memberId);
                        if (!member) return null;
                        return (
                          <div
                            key={memberId}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                            style={{ backgroundColor: '#0f1219' }}
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                              style={{
                                background: avatarGradient(member.color),
                                color: '#0b0d14',
                              }}
                            >
                              {member.avatar}
                            </div>
                            <span className="text-[11px] text-text-secondary truncate flex-1">
                              {member.name.split(' ')[0]}
                            </span>
                            <span
                              className="text-xs font-bold tabular-nums"
                              style={{ color: '#e8b44c' }}
                            >
                              {score.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
