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
  Heart,
  Zap,
  Award,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* --- Colors --- */
const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const GOLD = '#e8b44c';
const DANGER = '#e06060';
const SKY = '#5eaed4';
const ROSE = '#e879a0';

/* --- Types --- */
interface WeeklyFeedback {
  weekLabel: string;
  weekStart: string;
  scores: Record<string, number>;
}

/* --- Feedback Categories --- */
const feedbackCategories = [
  { id: 'all', label: 'All', color: AMBER },
  { id: 'collaboration', label: 'Collaboration', color: VIOLET },
  { id: 'delivery', label: 'Delivery', color: SAGE },
  { id: 'leadership', label: 'Leadership', color: GOLD },
  { id: 'culture', label: 'Culture', color: ROSE },
];

/* --- Mock Data (4 weeks) --- */
const feedbackHistory: WeeklyFeedback[] = [
  {
    weekLabel: 'Week 10 (Mar 2-8)',
    weekStart: '2026-03-02',
    scores: {
      james: 4.5, sian: 4.2, fairman: 4.8, greg: 4.3, colleen: 4.6,
      dave: 4.1, gareth: 4.0, mafe: 3.9, raamayan: 3.7, andrew: 4.4,
    },
  },
  {
    weekLabel: 'Week 9 (Feb 23-Mar 1)',
    weekStart: '2026-02-23',
    scores: {
      james: 4.3, sian: 4.0, fairman: 4.6, greg: 4.5, colleen: 4.4,
      dave: 4.3, gareth: 3.8, mafe: 4.1, raamayan: 3.9, andrew: 4.2,
    },
  },
  {
    weekLabel: 'Week 8 (Feb 16-22)',
    weekStart: '2026-02-16',
    scores: {
      james: 4.6, sian: 3.8, fairman: 4.5, greg: 4.2, colleen: 4.3,
      dave: 4.0, gareth: 4.1, mafe: 3.8, raamayan: 4.0, andrew: 4.5,
    },
  },
  {
    weekLabel: 'Week 7 (Feb 9-15)',
    weekStart: '2026-02-09',
    scores: {
      james: 4.2, sian: 3.9, fairman: 4.3, greg: 4.0, colleen: 4.1,
      dave: 3.8, gareth: 3.6, mafe: 3.7, raamayan: 3.5, andrew: 4.0,
    },
  },
];

/* --- Anonymous Feedback Snippets --- */
const anonymousFeedback = [
  { sentiment: 'positive' as const, text: 'Fairman\u2019s strategic clarity this week was exceptional. His thesis framework is shaping our direction beautifully.', category: 'leadership' },
  { sentiment: 'positive' as const, text: 'Colleen\u2019s DAF work is quietly heroic. Financial stewardship at its finest.', category: 'delivery' },
  { sentiment: 'neutral' as const, text: 'Would love to see more cross-pod collaboration between Capital and Bioregions teams.', category: 'collaboration' },
  { sentiment: 'constructive' as const, text: 'Our async communication could improve \u2014 sometimes updates get lost between channels.', category: 'collaboration' },
  { sentiment: 'positive' as const, text: 'The coherence practices Andrew brings are transforming how we show up in meetings.', category: 'culture' },
  { sentiment: 'constructive' as const, text: 'We need clearer handoff processes between strategy and execution. Balls are being dropped.', category: 'delivery' },
  { sentiment: 'positive' as const, text: 'James and Sian\u2019s partnership is the backbone of this community. Grateful for their tireless work.', category: 'leadership' },
  { sentiment: 'neutral' as const, text: 'Considering whether our pod frequency is right \u2014 some members feel overwhelmed, others want more.', category: 'culture' },
];

const sentimentConfig = {
  positive: { color: SAGE, bg: `rgba(107,143,113,0.08)`, border: `rgba(107,143,113,0.2)`, icon: ThumbsUp, label: 'Positive' },
  neutral: { color: GOLD, bg: `rgba(232,180,76,0.08)`, border: `rgba(232,180,76,0.2)`, icon: Minus, label: 'Neutral' },
  constructive: { color: SKY, bg: `rgba(94,174,212,0.08)`, border: `rgba(94,174,212,0.2)`, icon: Zap, label: 'Constructive' },
};

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

/* --- Trend helpers --- */
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
  if (trend === 'up') return SAGE;
  if (trend === 'down') return DANGER;
  return '#a09888';
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <ArrowUpRight size={12} style={{ color: SAGE }} />;
  if (trend === 'down') return <ArrowDownRight size={12} style={{ color: DANGER }} />;
  return <Minus size={12} style={{ color: '#a09888' }} />;
}

/* --- SVG Overall Score Display --- */
function OverallScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / 5, 1);
  const offset = circumference * (1 - pct);
  const color = score >= 4.3 ? SAGE : score >= 3.8 ? GOLD : DANGER;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 6px ${color}50)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#f0ebe4', lineHeight: 1, fontFamily: 'monospace' }}>
          {score.toFixed(1)}
        </span>
        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={10} style={{ color: s <= Math.round(score) ? GOLD : '#2e3a4e', fill: s <= Math.round(score) ? GOLD : 'none' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- Star Rating Component --- */
function StarRating({
  value,
  onChange,
  readonly = false,
  size = 12,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readonly ? star <= Math.round(value) : star <= (hovered || value);
        return (
          <button
            key={star}
            disabled={readonly}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => onChange?.(star)}
            style={{
              cursor: readonly ? 'default' : 'pointer',
              background: 'none',
              border: 'none',
              padding: 1,
              transition: 'transform 0.15s',
              transform: !readonly && hovered === star ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <Star
              size={readonly ? size : 18}
              style={{
                color: filled ? GOLD : '#2e3a4e',
                fill: filled ? GOLD : 'none',
                transition: 'color 0.15s, fill 0.15s',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* --- Sparkline Component --- */
function Sparkline({ values, color }: { values: number[]; color: string }) {
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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {/* Area fill under line */}
      <polygon
        points={`0,${height} ${points.join(' ')} ${width},${height}`}
        fill={`${color}10`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

/* ===================================================================
   Main Component
   =================================================================== */

export function PeerFeedbackView() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [currentRatings, setCurrentRatings] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFeedbackTab, setActiveFeedbackTab] = useState('scores');

  const feedbackMembers = useMemo(() => {
    const ids = Object.keys(feedbackHistory[0]?.scores || {});
    return ids
      .map((id) => teamMembers.find((m) => m.id === id))
      .filter(Boolean) as typeof teamMembers;
  }, []);

  const latestWeek = feedbackHistory[0];
  const latestScores = Object.values(latestWeek?.scores || {});
  const avgScore =
    latestScores.length > 0
      ? latestScores.reduce((s, v) => s + v, 0) / latestScores.length
      : 0;
  const submissionsThisWeek = latestScores.length;
  const trendingUp = feedbackMembers.filter((m) => getTrend(m.id) === 'up').length;
  const trendingDown = feedbackMembers.filter((m) => getTrend(m.id) === 'down').length;

  const filteredFeedback = activeCategory === 'all'
    ? anonymousFeedback
    : anonymousFeedback.filter((f) => f.category === activeCategory);

  function getSparklineValues(memberId: string): number[] {
    return feedbackHistory.map((w) => w.scores[memberId] || 0);
  }

  const handleSubmit = () => { setSubmitted(true); };
  const handleRating = (memberId: string, score: number) => {
    setCurrentRatings((prev) => ({ ...prev, [memberId]: score }));
  };
  const ratingsGiven = Object.keys(currentRatings).length;

  // Find top and bottom performers
  const sortedByScore = feedbackMembers
    .map((m) => ({ member: m, score: latestWeek?.scores[m.id] || 0 }))
    .sort((a, b) => b.score - a.score);
  const topPerformer = sortedByScore[0];
  const bottomPerformer = sortedByScore[sortedByScore.length - 1];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px' }}>
      {/* -- Header -- */}
      <div className="animate-fade-in" style={{ marginBottom: 32, opacity: 0, animationDelay: '0s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <MessageSquare size={28} style={{ color: AMBER }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>
            Peer Feedback
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#a09888', margin: 0, paddingLeft: 40 }}>
          Weekly peer recognition and feedback. Rate your fellow stewards to strengthen collaboration and accountability.
        </p>
      </div>

      {/* -- Summary Stats with Overall Score Ring -- */}
      <div
        className="animate-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr',
          gap: 16,
          marginBottom: 24,
          animationDelay: '0.03s',
          opacity: 0,
        }}
      >
        {/* Overall Score Ring */}
        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <OverallScoreRing score={avgScore} size={110} />
          <div style={{ fontSize: 9, color: '#6b6358', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Team Average
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Submissions', value: submissionsThisWeek.toString(), color: VIOLET, icon: MessageSquare },
            { label: 'Trending Up', value: trendingUp.toString(), color: SAGE, icon: TrendingUp },
            { label: 'Trending Down', value: trendingDown.toString(), color: DANGER, icon: TrendingDown },
            { label: 'Top Performer', value: topPerformer?.member.name.split(' ')[0] || '', sub: topPerformer ? topPerformer.score.toFixed(1) : '', color: GOLD, icon: Award },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="animate-fade-in glow-card"
                style={{
                  backgroundColor: `${stat.color}0a`,
                  border: `1px solid ${stat.color}20`,
                  borderRadius: 12,
                  padding: '14px',
                  animationDelay: `${0.05 + i * 0.03}s`,
                  opacity: 0,
                  transition: 'border-color 0.3s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${stat.color}40`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${stat.color}20`;
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Icon size={13} style={{ color: stat.color }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: stat.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {stat.label}
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>
                  {stat.value}
                </div>
                {(stat as { sub?: string }).sub && (
                  <div style={{ fontSize: 10, color: '#6b6358', marginTop: 2 }}>
                    Score: {(stat as { sub?: string }).sub}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* -- Tab Navigation -- */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          animationDelay: '0.08s',
          opacity: 0,
        }}
      >
        {[
          { id: 'scores', label: 'Collaboration Scores', icon: BarChart3 },
          { id: 'submit', label: 'Submit Feedback', icon: Send },
          { id: 'anonymous', label: 'Anonymous Feedback', icon: EyeOff },
        ].map((tab) => {
          const isActive = activeFeedbackTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFeedbackTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${isActive ? AMBER + '40' : '#1e2638'}`,
                backgroundColor: isActive ? `${AMBER}12` : '#131720',
                color: isActive ? AMBER : '#6b6358',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* -- Tab Content: Collaboration Scores -- */}
      {activeFeedbackTab === 'scores' && (
        <div className="animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div
            style={{
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <BarChart3 size={14} style={{ color: '#6b6358' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Current Week Scores
              </span>
            </div>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(2, 1fr)' }}>
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
                    className="animate-fade-in glow-card"
                    style={{
                      backgroundColor: '#0f1219',
                      border: '1px solid #1c2230',
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      animationDelay: `${0.12 + i * 0.03}s`,
                      opacity: 0,
                      transition: 'border-color 0.25s, transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2e3a4e';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#1c2230';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Rank */}
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#2e3a4e', width: 16, textAlign: 'center', fontFamily: 'monospace' }}>
                      {i + 1}
                    </span>

                    {/* Avatar */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#0b0d14',
                        background: avatarGradient(member.color),
                        flexShrink: 0,
                      }}
                    >
                      {member.avatar}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>{member.name}</span>
                        <TrendIcon trend={trend} />
                        {i === 0 && <Award size={12} style={{ color: GOLD }} />}
                      </div>
                      <div style={{ fontSize: 10, color: '#6b6358' }}>{member.shortRole}</div>
                    </div>

                    {/* Sparkline */}
                    <div style={{ flexShrink: 0 }}>
                      <Sparkline values={sparkData} color={trendColor(trend)} />
                    </div>

                    {/* Score + stars */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: GOLD, fontFamily: 'monospace' }}>
                          {score.toFixed(1)}
                        </span>
                        <Star size={12} style={{ color: GOLD, fill: GOLD }} />
                      </div>
                      <StarRating value={score} readonly size={9} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* -- Tab Content: Submit Feedback -- */}
      {activeFeedbackTab === 'submit' && (
        <div className="animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div
            className="glow-card"
            style={{
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Send size={14} style={{ color: AMBER }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>Submit Weekly Feedback</span>
                <span
                  style={{
                    fontSize: 10,
                    color: '#6b6358',
                    padding: '3px 8px',
                    borderRadius: 20,
                    backgroundColor: '#1c2230',
                  }}
                >
                  Week of Mar 2-8
                </span>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${isAnonymous ? 'rgba(107,143,113,0.25)' : 'rgba(232,180,76,0.25)'}`,
                  backgroundColor: isAnonymous ? 'rgba(107,143,113,0.12)' : 'rgba(232,180,76,0.12)',
                  color: isAnonymous ? SAGE : GOLD,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                {isAnonymous ? <EyeOff size={12} /> : <Eye size={12} />}
                {isAnonymous ? 'Anonymous' : 'Named'}
              </button>
            </div>

            {submitted ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '32px 0',
                  borderRadius: 12,
                  backgroundColor: 'rgba(107,143,113,0.08)',
                  border: '1px solid rgba(107,143,113,0.2)',
                }}
              >
                <Star size={20} style={{ color: SAGE, fill: SAGE }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: SAGE }}>
                  Feedback submitted for {ratingsGiven} stewards. Thank you!
                </span>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  {feedbackMembers.map((member, i) => (
                    <div
                      key={member.id}
                      className="animate-fade-in"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        backgroundColor: currentRatings[member.id] ? 'rgba(232,180,76,0.04)' : '#0f1219',
                        border: `1px solid ${currentRatings[member.id] ? 'rgba(232,180,76,0.15)' : '#1c2230'}`,
                        transition: 'all 0.25s',
                        animationDelay: `${0.12 + i * 0.02}s`,
                        opacity: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#0b0d14',
                          background: avatarGradient(member.color),
                          flexShrink: 0,
                        }}
                      >
                        {member.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>{member.name}</div>
                        <div style={{ fontSize: 10, color: '#6b6358' }}>{member.shortRole}</div>
                      </div>
                      <StarRating
                        value={currentRatings[member.id] || 0}
                        onChange={(v) => handleRating(member.id, v)}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid #1e2638' }}>
                  <span style={{ fontSize: 11, color: '#6b6358' }}>
                    {ratingsGiven}/{feedbackMembers.length} rated
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={ratingsGiven === 0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 20px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: ratingsGiven > 0 ? 'pointer' : 'not-allowed',
                      border: `1px solid ${ratingsGiven > 0 ? 'rgba(212,165,116,0.3)' : '#1e2638'}`,
                      backgroundColor: ratingsGiven > 0 ? 'rgba(212,165,116,0.15)' : '#1c2230',
                      color: ratingsGiven > 0 ? AMBER : '#6b6358',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
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
      )}

      {/* -- Tab Content: Anonymous Feedback -- */}
      {activeFeedbackTab === 'anonymous' && (
        <div className="animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {feedbackCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${isActive ? cat.color + '40' : '#1e2638'}`,
                    backgroundColor: isActive ? `${cat.color}15` : 'transparent',
                    color: isActive ? cat.color : '#6b6358',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredFeedback.map((fb, i) => {
              const sc = sentimentConfig[fb.sentiment];
              const SentIcon = sc.icon;
              const catColor = feedbackCategories.find((c) => c.id === fb.category)?.color || AMBER;
              return (
                <div
                  key={i}
                  className="animate-fade-in glow-card"
                  style={{
                    backgroundColor: sc.bg,
                    border: `1px solid ${sc.border}`,
                    borderRadius: 12,
                    padding: '14px 18px',
                    animationDelay: `${0.12 + i * 0.04}s`,
                    opacity: 0,
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <SentIcon size={16} style={{ color: sc.color, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: '#f0ebe4', margin: 0, lineHeight: 1.6 }}>{fb.text}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 20,
                            color: sc.color,
                            backgroundColor: `${sc.color}15`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {sc.label}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 20,
                            color: catColor,
                            backgroundColor: `${catColor}15`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {fb.category}
                        </span>
                        <span style={{ fontSize: 10, color: '#4a5568', marginLeft: 'auto' }}>
                          <EyeOff size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                          Anonymous
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -- History Toggle -- */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, marginTop: 24 }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '12px 16px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            border: `1px solid ${showHistory ? 'rgba(212,165,116,0.25)' : '#1e2638'}`,
            backgroundColor: '#131720',
            color: showHistory ? AMBER : '#a09888',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            textAlign: 'left',
          }}
        >
          <Calendar size={14} />
          <span style={{ flex: 1 }}>Feedback History (Past 4 Weeks)</span>
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showHistory && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feedbackHistory.map((week, wi) => (
              <div
                key={week.weekStart}
                className="animate-fade-in glow-card"
                style={{
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 12,
                  padding: 16,
                  animationDelay: `${wi * 0.05}s`,
                  opacity: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Calendar size={12} style={{ color: '#6b6358' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888' }}>{week.weekLabel}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: '#6b6358',
                      padding: '2px 8px',
                      borderRadius: 20,
                      backgroundColor: '#1c2230',
                    }}
                  >
                    Avg: {(Object.values(week.scores).reduce((s, v) => s + v, 0) / Object.values(week.scores).length).toFixed(1)}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {Object.entries(week.scores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([memberId, score]) => {
                      const member = teamMembers.find((m) => m.id === memberId);
                      if (!member) return null;
                      return (
                        <div
                          key={memberId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 8px',
                            borderRadius: 8,
                            backgroundColor: '#0f1219',
                          }}
                        >
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 7,
                              fontWeight: 700,
                              color: '#0b0d14',
                              background: avatarGradient(member.color),
                              flexShrink: 0,
                            }}
                          >
                            {member.avatar}
                          </div>
                          <span style={{ fontSize: 10, color: '#a09888', flex: 1 }}>
                            {member.name.split(' ')[0]}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, fontFamily: 'monospace' }}>
                            {score.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
