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
  BarChart3,
  Calendar,
  Zap,
  Award,
  ThumbsUp,
  ArrowUpRight,
  ArrowDownRight,
  Quote,
  Clock,
  CheckCircle,
  Sparkles,
  Shield,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ═══════════════════════════════════════════════════════════════════
   Scoped Keyframes — all prefixed with `pf-`
   ═══════════════════════════════════════════════════════════════════ */
const scopedKeyframes = `
@keyframes pf-fadeUp {
  0% { opacity: 0; transform: translateY(16px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes pf-fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes pf-slideRight {
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes pf-scaleIn {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes pf-ringDraw {
  0% { stroke-dashoffset: var(--pf-circumference); }
  100% { stroke-dashoffset: var(--pf-offset); }
}
@keyframes pf-countUp {
  0% { opacity: 0; transform: translateY(12px); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes pf-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes pf-pulseGlow {
  0%, 100% { box-shadow: 0 0 12px rgba(212,165,116,0.08); }
  50% { box-shadow: 0 0 28px rgba(212,165,116,0.18); }
}
@keyframes pf-borderFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes pf-starPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes pf-breathe {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@keyframes pf-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes pf-quoteReveal {
  0% { opacity: 0; transform: scale(0.5) rotate(-8deg); }
  100% { opacity: 0.12; transform: scale(1) rotate(0deg); }
}
@keyframes pf-connectorGrow {
  0% { height: 0; }
  100% { height: 100%; }
}
@keyframes pf-dotPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 var(--pf-dot-color); }
  50% { transform: scale(1.15); box-shadow: 0 0 8px 2px var(--pf-dot-color); }
}
@keyframes pf-successCheck {
  0% { stroke-dashoffset: 30; }
  100% { stroke-dashoffset: 0; }
}
`;

/* ═══════════════════════════════════════════════════════════════════
   Design Tokens
   ═══════════════════════════════════════════════════════════════════ */
const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const GOLD = '#e8b44c';
const DANGER = '#e06060';
const SKY = '#5eaed4';
const ROSE = '#e879a0';
const CREAM = '#f0ebe4';
const MUTED = '#a09888';
const DIM = '#6b6358';
const BG = '#0b0d14';
const SURFACE = '#131720';
const SURFACE2 = '#1c2230';
const BORDER = '#1e2638';
const BORDER2 = '#2e3a4e';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const glass = {
  background: 'rgba(19, 23, 32, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(212, 165, 116, 0.08)',
} as React.CSSProperties;

const glassStrong = {
  background: 'rgba(19, 23, 32, 0.82)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(212, 165, 116, 0.12)',
} as React.CSSProperties;

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */
interface WeeklyFeedback {
  weekLabel: string;
  weekStart: string;
  scores: Record<string, number>;
}

/* ═══════════════════════════════════════════════════════════════════
   Feedback Categories
   ═══════════════════════════════════════════════════════════════════ */
const feedbackCategories = [
  { id: 'all', label: 'All', color: AMBER },
  { id: 'collaboration', label: 'Collaboration', color: VIOLET },
  { id: 'delivery', label: 'Delivery', color: SAGE },
  { id: 'leadership', label: 'Leadership', color: GOLD },
  { id: 'culture', label: 'Culture', color: ROSE },
];

/* ═══════════════════════════════════════════════════════════════════
   Mock Data (4 weeks)
   ═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   Anonymous Feedback Snippets
   ═══════════════════════════════════════════════════════════════════ */
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
  positive: { color: SAGE, bg: `rgba(107,143,113,0.06)`, border: `rgba(107,143,113,0.18)`, icon: ThumbsUp, label: 'Positive' },
  neutral: { color: GOLD, bg: `rgba(232,180,76,0.06)`, border: `rgba(232,180,76,0.18)`, icon: Minus, label: 'Neutral' },
  constructive: { color: SKY, bg: `rgba(94,174,212,0.06)`, border: `rgba(94,174,212,0.18)`, icon: Zap, label: 'Constructive' },
};

/* ═══════════════════════════════════════════════════════════════════
   Avatar Gradient Helper
   ═══════════════════════════════════════════════════════════════════ */
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

function avatarBaseColor(color: string): string {
  const colorMap: Record<string, string> = {
    'bg-amber-500': '#c4925a', 'bg-amber-400': '#d4a574',
    'bg-rose-400': '#e879a0', 'bg-violet-500': '#7c3aed',
    'bg-sky-400': '#38bdf8', 'bg-emerald-500': '#10b981',
    'bg-purple-500': '#8b5cf6', 'bg-pink-400': '#e879a0',
    'bg-teal-400': '#2dd4bf', 'bg-green-500': '#22c55e',
    'bg-lime-500': '#84cc16', 'bg-orange-500': '#f97316',
    'bg-indigo-400': '#818cf8', 'bg-slate-400': '#94a3b8',
  };
  return colorMap[color] || '#a09888';
}

/* ═══════════════════════════════════════════════════════════════════
   Trend Helpers
   ═══════════════════════════════════════════════════════════════════ */
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
  return MUTED;
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <ArrowUpRight size={13} style={{ color: SAGE }} />;
  if (trend === 'down') return <ArrowDownRight size={13} style={{ color: DANGER }} />;
  return <Minus size={12} style={{ color: MUTED }} />;
}

/* ═══════════════════════════════════════════════════════════════════
   Animated Avatar with Gradient Ring
   ═══════════════════════════════════════════════════════════════════ */
function GlowAvatar({
  member,
  size = 40,
  showRing = true,
  delay = 0,
}: {
  member: { avatar: string; color: string; name: string };
  size?: number;
  showRing?: boolean;
  delay?: number;
}) {
  const baseColor = avatarBaseColor(member.color);
  const ringSize = size + 6;
  const innerSize = size;
  const fontSize = size <= 24 ? 7 : size <= 32 ? 9 : size <= 40 ? 11 : 14;

  return (
    <div
      style={{
        position: 'relative',
        width: ringSize,
        height: ringSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        animation: `pf-scaleIn 0.5s ${EASE} ${delay}s both`,
      }}
    >
      {/* Gradient ring */}
      {showRing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${baseColor}, ${baseColor}80, ${baseColor}20, ${baseColor}80, ${baseColor})`,
            padding: 2,
            transition: `box-shadow 0.4s ${EASE}, transform 0.4s ${EASE}`,
          }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: SURFACE }} />
        </div>
      )}
      {/* Inner avatar */}
      <div
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
          fontWeight: 700,
          color: BG,
          background: avatarGradient(member.color),
          position: 'relative',
          zIndex: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {member.avatar}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Circular Score Ring (animated SVG)
   ═══════════════════════════════════════════════════════════════════ */
function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  animated = true,
  showStars = true,
  delay = 0,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  showStars?: boolean;
  delay?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / 5, 1);
  const offset = circumference * (1 - pct);
  const color = score >= 4.3 ? SAGE : score >= 3.8 ? GOLD : DANGER;

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      animation: `pf-scaleIn 0.6s ${EASE} ${delay}s both`,
    }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        {/* Faint secondary track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`${color}10`}
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : offset}
          strokeLinecap="round"
          style={{
            '--pf-circumference': `${circumference}`,
            '--pf-offset': `${offset}`,
            animation: animated ? `pf-ringDraw 1.4s ${EASE} ${delay + 0.3}s forwards` : 'none',
            filter: `drop-shadow(0 0 8px ${color}40)`,
            transition: !animated ? `stroke-dashoffset 1s ${EASE}` : undefined,
          } as React.CSSProperties}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: size * 0.24,
          fontWeight: 800,
          color: CREAM,
          lineHeight: 1,
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '-0.03em',
          animation: `pf-countUp 0.8s ${EASE} ${delay + 0.5}s both`,
        }}>
          {score.toFixed(1)}
        </span>
        {showStars && (
          <div style={{
            display: 'flex',
            gap: 2,
            marginTop: 6,
            animation: `pf-fadeIn 0.5s ease ${delay + 0.9}s both`,
          }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={size * 0.085}
                style={{
                  color: s <= Math.round(score) ? GOLD : '#2e3a4e',
                  fill: s <= Math.round(score) ? GOLD : 'none',
                  animation: s <= Math.round(score) ? `pf-starPop 0.3s ${EASE} ${delay + 0.9 + s * 0.06}s both` : undefined,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Mini Score Ring (inline, for member cards)
   ═══════════════════════════════════════════════════════════════════ */
function MiniScoreRing({
  score,
  size = 44,
  delay = 0,
}: {
  score: number;
  size?: number;
  delay?: number;
}) {
  const sw = 3;
  const radius = (size - sw) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / 5, 1);
  const offset = circumference * (1 - pct);
  const color = score >= 4.3 ? SAGE : score >= 3.8 ? GOLD : DANGER;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={sw}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          style={{
            '--pf-circumference': `${circumference}`,
            '--pf-offset': `${offset}`,
            animation: `pf-ringDraw 1.2s ${EASE} ${delay}s forwards`,
            filter: `drop-shadow(0 0 4px ${color}30)`,
          } as React.CSSProperties}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 800,
          color: GOLD,
          fontFamily: 'var(--font-mono, monospace)',
        }}>
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Star Rating Component (enhanced)
   ═══════════════════════════════════════════════════════════════════ */
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              padding: 2,
              transition: `transform 0.2s ${EASE}, filter 0.2s`,
              transform: !readonly && hovered === star ? 'scale(1.3)' : 'scale(1)',
              filter: !readonly && hovered >= star ? `drop-shadow(0 0 4px ${GOLD}60)` : 'none',
            }}
          >
            <Star
              size={readonly ? size : 20}
              style={{
                color: filled ? GOLD : '#2e3a4e',
                fill: filled ? GOLD : 'none',
                transition: `color 0.2s, fill 0.2s`,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Sparkline Component (enhanced with gradient)
   ═══════════════════════════════════════════════════════════════════ */
function Sparkline({ values, color, id }: { values: number[]; color: string; id: string }) {
  const data = [...values].reverse();
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  const gradientId = `pf-spark-grad-${id}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points.join(' ')} ${width},${height}`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}40)` }}
      />
      {data.length > 0 && (
        <>
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * height}
            r="3"
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * height}
            r="5"
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeOpacity="0.3"
            style={{ animation: `pf-breathe 2s ease infinite` }}
          />
        </>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Animated Stat Card (summary stats with animated numbers)
   ═══════════════════════════════════════════════════════════════════ */
function AnimatedStat({
  label,
  value,
  sub,
  color,
  icon: Icon,
  delay = 0,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ElementType;
  delay?: number;
  trend?: 'up' | 'down' | 'flat';
}) {
  return (
    <div
      className="card-stat"
      style={{
        ...glassStrong,
        borderRadius: 14,
        padding: '18px 16px',
        position: 'relative',
        overflow: 'hidden',
        animation: `pf-fadeUp 0.6s ${EASE} ${delay}s both`,
        transition: `border-color 0.4s ${EASE}, transform 0.35s ${EASE}, box-shadow 0.4s ${EASE}`,
        cursor: 'default',
        borderColor: `${color}15`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}35`;
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}12, 0 0 0 1px ${color}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}15`;
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, position: 'relative' }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}12`,
          border: `1px solid ${color}20`,
        }}>
          <Icon size={13} style={{ color }} />
        </div>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: `${color}cc`,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, position: 'relative' }}>
        <span style={{
          fontSize: 28,
          fontWeight: 800,
          color,
          fontFamily: 'var(--font-mono, monospace)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          animation: `pf-countUp 0.7s ${EASE} ${delay + 0.2}s both`,
        }}>
          {value}
        </span>
        {trend && trend !== 'flat' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            animation: `pf-fadeIn 0.4s ease ${delay + 0.5}s both`,
          }}>
            {trend === 'up' ? (
              <ArrowUpRight size={14} style={{ color: SAGE }} />
            ) : (
              <ArrowDownRight size={14} style={{ color: DANGER }} />
            )}
          </div>
        )}
      </div>
      {sub && (
        <div style={{
          fontSize: 11,
          color: DIM,
          marginTop: 4,
          animation: `pf-fadeIn 0.4s ease ${delay + 0.4}s both`,
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Category Pill with Dot Indicator
   ═══════════════════════════════════════════════════════════════════ */
function CategoryPill({
  label,
  color,
  active,
  onClick,
  count,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 14px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
        border: `1px solid ${active ? color + '40' : BORDER}`,
        backgroundColor: active ? `${color}12` : 'transparent',
        color: active ? color : DIM,
        fontFamily: 'inherit',
        transition: `all 0.3s ${EASE}`,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = `${color}30`;
          e.currentTarget.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = BORDER;
          e.currentTarget.style.color = DIM;
        }
      }}
    >
      {/* Dot indicator */}
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: active ? color : `${color}40`,
        transition: `all 0.3s ${EASE}`,
        boxShadow: active ? `0 0 6px ${color}50` : 'none',
      }} />
      {label}
      {count !== undefined && (
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: 8,
          backgroundColor: active ? `${color}20` : `${BORDER}`,
          color: active ? color : DIM,
          marginLeft: -2,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Quote-styled Feedback Card
   ═══════════════════════════════════════════════════════════════════ */
function FeedbackCard({
  feedback,
  index,
}: {
  feedback: { sentiment: 'positive' | 'neutral' | 'constructive'; text: string; category: string };
  index: number;
}) {
  const sc = sentimentConfig[feedback.sentiment];
  const SentIcon = sc.icon;
  const catColor = feedbackCategories.find((c) => c.id === feedback.category)?.color || AMBER;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="card-interactive"
      style={{
        ...glass,
        borderRadius: 14,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        borderColor: isHovered ? sc.border : `${sc.color}10`,
        animation: `pf-slideRight 0.5s ${EASE} ${0.08 + index * 0.06}s both`,
        transition: `transform 0.35s ${EASE}, border-color 0.35s ${EASE}, box-shadow 0.35s ${EASE}`,
        transform: isHovered ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered ? `0 8px 32px ${sc.color}10, 0 0 0 1px ${sc.color}10` : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: isHovered ? 4 : 3,
        background: `linear-gradient(180deg, ${sc.color}, ${sc.color}40)`,
        borderRadius: '3px 0 0 3px',
        transition: `width 0.3s ${EASE}, opacity 0.3s`,
        opacity: isHovered ? 1 : 0.6,
      } as React.CSSProperties} />

      <div style={{ padding: '16px 20px 16px 22px', position: 'relative' }}>
        {/* Large decorative quote icon */}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 14,
          animation: `pf-quoteReveal 0.6s ${EASE} ${0.3 + index * 0.06}s both`,
        }}>
          <Quote size={32} style={{
            color: sc.color,
            opacity: 0.07,
            transform: 'scaleX(-1)',
          }} />
        </div>

        {/* Feedback text */}
        <p style={{
          fontSize: 13.5,
          color: CREAM,
          margin: 0,
          lineHeight: 1.7,
          position: 'relative',
          zIndex: 1,
          fontStyle: 'italic',
          letterSpacing: '0.01em',
        }}>
          {feedback.text}
        </p>

        {/* Bottom meta row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${sc.color}10`,
        }}>
          {/* Sentiment icon badge */}
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${sc.color}12`,
            border: `1px solid ${sc.color}20`,
          }}>
            <SentIcon size={11} style={{ color: sc.color }} />
          </div>
          {/* Sentiment pill */}
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 20,
            color: sc.color,
            backgroundColor: `${sc.color}10`,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {sc.label}
          </span>
          {/* Category pill with dot */}
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 9,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 20,
            color: catColor,
            backgroundColor: `${catColor}10`,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: catColor,
              boxShadow: `0 0 4px ${catColor}40`,
            }} />
            {feedback.category}
          </span>
          {/* Anonymous badge */}
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 9,
            color: '#4a5568',
            marginLeft: 'auto',
          }}>
            <Shield size={9} style={{ opacity: 0.6 }} />
            Anonymous
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Timeline Feedback History
   ═══════════════════════════════════════════════════════════════════ */
function TimelineWeek({
  week,
  index,
  isLast,
}: {
  week: WeeklyFeedback;
  index: number;
  isLast: boolean;
}) {
  const weekAvg = Object.values(week.scores).reduce((s, v) => s + v, 0) / Object.values(week.scores).length;
  const avgColor = weekAvg >= 4.3 ? SAGE : weekAvg >= 3.8 ? GOLD : DANGER;

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        position: 'relative',
        animation: `pf-fadeUp 0.5s ${EASE} ${index * 0.08}s both`,
      }}
    >
      {/* Timeline connector */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 20,
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* Dot */}
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: index === 0 ? avgColor : `${avgColor}40`,
          border: `2px solid ${index === 0 ? avgColor : `${avgColor}30`}`,
          zIndex: 1,
          boxShadow: index === 0 ? `0 0 10px ${avgColor}40` : 'none',
          '--pf-dot-color': index === 0 ? `${avgColor}40` : 'transparent',
          animation: index === 0 ? `pf-dotPulse 2s ease infinite` : undefined,
        } as React.CSSProperties} />
        {/* Connector line */}
        {!isLast && (
          <div style={{
            width: 1,
            flex: 1,
            background: `linear-gradient(180deg, ${avgColor}30, ${BORDER})`,
            marginTop: 4,
            marginBottom: 4,
          }} />
        )}
      </div>

      {/* Content card */}
      <div
        style={{
          ...glass,
          flex: 1,
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: isLast ? 0 : 12,
          transition: `border-color 0.3s ${EASE}, transform 0.3s ${EASE}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${avgColor}25`;
          e.currentTarget.style.transform = 'translateX(4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(212,165,116,0.08)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Calendar size={12} style={{ color: DIM }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{week.weekLabel}</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            marginLeft: 'auto',
            padding: '3px 10px',
            borderRadius: 20,
            background: `${avgColor}10`,
            border: `1px solid ${avgColor}15`,
          }}>
            <Star size={10} style={{ color: avgColor, fill: avgColor }} />
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: avgColor,
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              {weekAvg.toFixed(1)}
            </span>
          </div>
        </div>
        {/* Scores grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {Object.entries(week.scores)
            .sort(([, a], [, b]) => b - a)
            .map(([memberId, score]) => {
              const member = teamMembers.find((m) => m.id === memberId);
              if (!member) return null;
              const scoreColor = score >= 4.3 ? SAGE : score >= 3.8 ? GOLD : DANGER;
              return (
                <div
                  key={memberId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 8px',
                    borderRadius: 8,
                    backgroundColor: `${scoreColor}06`,
                    border: `1px solid ${scoreColor}10`,
                    transition: `background-color 0.2s, border-color 0.2s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${scoreColor}12`;
                    e.currentTarget.style.borderColor = `${scoreColor}25`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${scoreColor}06`;
                    e.currentTarget.style.borderColor = `${scoreColor}10`;
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
                      color: BG,
                      background: avatarGradient(member.color),
                      flexShrink: 0,
                    }}
                  >
                    {member.avatar}
                  </div>
                  <span style={{ fontSize: 10, color: MUTED, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.name.split(' ')[0]}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: scoreColor,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}>
                    {score.toFixed(1)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */
export function PeerFeedbackView() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [currentRatings, setCurrentRatings] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFeedbackTab, setActiveFeedbackTab] = useState('scores');
  const [feedbackText, setFeedbackText] = useState('');
  const MAX_CHARS = 280;

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

  const sortedByScore = feedbackMembers
    .map((m) => ({ member: m, score: latestWeek?.scores[m.id] || 0 }))
    .sort((a, b) => b.score - a.score);
  const topPerformer = sortedByScore[0];

  // Previous week avg for trend comparison
  const prevScores = Object.values(feedbackHistory[1]?.scores || {});
  const prevAvg = prevScores.length > 0 ? prevScores.reduce((s, v) => s + v, 0) / prevScores.length : 0;
  const avgTrend: 'up' | 'down' | 'flat' = avgScore - prevAvg > 0.05 ? 'up' : avgScore - prevAvg < -0.05 ? 'down' : 'flat';

  return (
    <>
      {/* Inject scoped keyframes */}
      <style dangerouslySetInnerHTML={{ __html: scopedKeyframes }} />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px' }}>

        {/* ─────────────────────────────────────────────────
            Header
            ───────────────────────────────────────────────── */}
        <div style={{
          marginBottom: 36,
          animation: `pf-fadeUp 0.6s ${EASE} 0s both`,
          position: 'relative',
        }}>
          <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
          <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${AMBER}15, ${VIOLET}10)`,
              border: `1px solid ${AMBER}18`,
            }}>
              <MessageSquare size={22} style={{ color: AMBER }} />
            </div>
            <div>
              <h1 className="text-glow" style={{
                fontSize: 28,
                fontWeight: 700,
                color: CREAM,
                margin: 0,
                letterSpacing: '-0.02em',
              }}>
                Peer Feedback
              </h1>
              <p style={{
                fontSize: 13.5,
                color: MUTED,
                margin: '2px 0 0',
                lineHeight: 1.4,
              }}>
                Weekly peer recognition and feedback. Rate your fellow stewards to strengthen collaboration and accountability.
              </p>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────
            Summary Stats Row
            ───────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr',
          gap: 16,
          marginBottom: 28,
          animation: `pf-fadeUp 0.6s ${EASE} 0.05s both`,
        }}>
          {/* Overall Score Ring */}
          <div className="card-stat" style={{
            ...glassStrong,
            borderRadius: 16,
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Ambient glow */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at center, ${avgScore >= 4.3 ? SAGE : GOLD}06 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            <ScoreRing score={avgScore} size={118} delay={0.2} />
            <div style={{
              fontSize: 9,
              color: DIM,
              marginTop: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              Team Average
              {avgTrend !== 'flat' && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                }}>
                  {avgTrend === 'up' ? <ArrowUpRight size={10} style={{ color: SAGE }} /> : <ArrowDownRight size={10} style={{ color: DANGER }} />}
                </span>
              )}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <AnimatedStat
              label="Submissions"
              value={submissionsThisWeek.toString()}
              sub="this week"
              color={VIOLET}
              icon={MessageSquare}
              delay={0.1}
            />
            <AnimatedStat
              label="Trending Up"
              value={trendingUp.toString()}
              sub="stewards improving"
              color={SAGE}
              icon={TrendingUp}
              delay={0.15}
              trend="up"
            />
            <AnimatedStat
              label="Trending Down"
              value={trendingDown.toString()}
              sub="need attention"
              color={DANGER}
              icon={TrendingDown}
              delay={0.2}
              trend={trendingDown > 0 ? 'down' : 'flat'}
            />
            <AnimatedStat
              label="Top Performer"
              value={topPerformer?.member.name.split(' ')[0] || ''}
              sub={topPerformer ? `Score: ${topPerformer.score.toFixed(1)}` : ''}
              color={GOLD}
              icon={Award}
              delay={0.25}
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────
            Tab Navigation
            ───────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          padding: '4px',
          borderRadius: 12,
          backgroundColor: `${SURFACE}80`,
          border: `1px solid ${BORDER}`,
          animation: `pf-fadeUp 0.5s ${EASE} 0.12s both`,
        }}>
          {[
            { id: 'scores', label: 'Collaboration Scores', icon: BarChart3 },
            { id: 'submit', label: 'Submit Feedback', icon: Send },
            { id: 'anonymous', label: 'Anonymous Feedback', icon: EyeOff },
          ].map((tab, ti) => {
            const isActive = activeFeedbackTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeedbackTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: isActive ? `${AMBER}12` : 'transparent',
                  color: isActive ? AMBER : DIM,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: `all 0.3s ${EASE}`,
                  fontFamily: 'inherit',
                  flex: 1,
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = MUTED;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = DIM;
                }}
              >
                <Icon size={14} />
                {tab.label}
                {/* Active indicator bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    right: '20%',
                    height: 2,
                    borderRadius: 1,
                    background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)`,
                    animation: `pf-fadeIn 0.3s ease`,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────────
            Tab: Collaboration Scores
            ───────────────────────────────────────────────── */}
        {activeFeedbackTab === 'scores' && (
          <div style={{ animation: `pf-fadeUp 0.5s ${EASE} 0s both` }}>
            <div className="card-premium" style={{
              ...glassStrong,
              borderRadius: 16,
              padding: 24,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative shimmer line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${AMBER}30, transparent)`,
                backgroundSize: '200% 100%',
                animation: 'pf-shimmer 4s ease infinite',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <BarChart3 size={14} style={{ color: DIM }} />
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: DIM,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Current Week Scores
                </span>
                <span style={{
                  fontSize: 10,
                  color: DIM,
                  padding: '2px 8px',
                  borderRadius: 20,
                  backgroundColor: SURFACE2,
                  marginLeft: 'auto',
                }}>
                  {latestWeek?.weekLabel}
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
                  .map(({ member, score, trend, sparkData }, i) => {
                    const isTop = i === 0;
                    return (
                      <div
                        key={member.id}
                        className="card-interactive"
                        style={{
                          ...glass,
                          borderRadius: 14,
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          animation: `pf-fadeUp 0.5s ${EASE} ${0.05 + i * 0.04}s both`,
                          transition: `border-color 0.35s ${EASE}, transform 0.35s ${EASE}, box-shadow 0.35s ${EASE}`,
                          borderColor: isTop ? `${GOLD}18` : 'rgba(212,165,116,0.06)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `${avatarBaseColor(member.color)}30`;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = `0 6px 24px rgba(0,0,0,0.2), 0 0 0 1px ${avatarBaseColor(member.color)}10`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = isTop ? `${GOLD}18` : 'rgba(212,165,116,0.06)';
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Top performer glow */}
                        {isTop && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 1,
                            background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)`,
                          }} />
                        )}

                        {/* Rank */}
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isTop ? GOLD : '#2e3a4e',
                          width: 18,
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}>
                          {i + 1}
                        </span>

                        {/* Avatar with gradient ring */}
                        <GlowAvatar member={member} size={36} delay={0.1 + i * 0.04} />

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: CREAM }}>{member.name}</span>
                            <TrendIcon trend={trend} />
                            {isTop && <Award size={13} style={{ color: GOLD, filter: `drop-shadow(0 0 4px ${GOLD}50)` }} />}
                          </div>
                          <div style={{ fontSize: 10, color: DIM, marginTop: 1 }}>{member.shortRole}</div>
                        </div>

                        {/* Sparkline */}
                        <div style={{ flexShrink: 0 }}>
                          <Sparkline values={sparkData} color={trendColor(trend)} id={member.id} />
                        </div>

                        {/* Score ring */}
                        <MiniScoreRing score={score} size={44} delay={0.2 + i * 0.04} />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────
            Tab: Submit Feedback
            ───────────────────────────────────────────────── */}
        {activeFeedbackTab === 'submit' && (
          <div style={{ animation: `pf-fadeUp 0.5s ${EASE} 0s both` }}>
            <div className="card-premium" style={{
              ...glassStrong,
              borderRadius: 16,
              padding: 24,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Top shimmer */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${AMBER}25, transparent)`,
                backgroundSize: '200% 100%',
                animation: 'pf-shimmer 4s ease infinite',
              }} />

              {/* Header row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${AMBER}12`,
                    border: `1px solid ${AMBER}20`,
                  }}>
                    <Send size={14} style={{ color: AMBER }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: CREAM }}>Submit Weekly Feedback</span>
                    <div style={{
                      fontSize: 10,
                      color: DIM,
                      marginTop: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <Clock size={9} />
                      Week of Mar 2-8
                    </div>
                  </div>
                </div>

                {/* Anonymous toggle */}
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${isAnonymous ? `${SAGE}25` : `${GOLD}25`}`,
                    backgroundColor: isAnonymous ? `${SAGE}08` : `${GOLD}08`,
                    color: isAnonymous ? SAGE : GOLD,
                    fontFamily: 'inherit',
                    transition: `all 0.3s ${EASE}`,
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isAnonymous ? `${SAGE}15` : `${GOLD}15`,
                  }}>
                    {isAnonymous ? <EyeOff size={11} /> : <Eye size={11} />}
                  </div>
                  {isAnonymous ? 'Anonymous' : 'Named'}
                </button>
              </div>

              {submitted ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  padding: '48px 0',
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${SAGE}06, ${SAGE}03)`,
                  border: `1px solid ${SAGE}18`,
                  animation: `pf-scaleIn 0.5s ${EASE} 0s both`,
                }}>
                  {/* Animated checkmark */}
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: `${SAGE}12`,
                    border: `2px solid ${SAGE}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: `pf-scaleIn 0.6s ${EASE} 0s both`,
                  }}>
                    <CheckCircle size={28} style={{ color: SAGE }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: SAGE, marginBottom: 4 }}>
                      Feedback Submitted
                    </div>
                    <div style={{ fontSize: 13, color: MUTED }}>
                      You rated {ratingsGiven} steward{ratingsGiven !== 1 ? 's' : ''} this week. Thank you!
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Rating grid */}
                  <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    {feedbackMembers.map((member, i) => {
                      const isRated = !!currentRatings[member.id];
                      const memberColor = avatarBaseColor(member.color);
                      return (
                        <div
                          key={member.id}
                          style={{
                            ...glass,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '12px 14px',
                            borderRadius: 12,
                            borderColor: isRated ? `${GOLD}20` : 'rgba(212,165,116,0.06)',
                            background: isRated ? `rgba(232,180,76,0.04)` : glass.background,
                            transition: `all 0.3s ${EASE}`,
                            animation: `pf-fadeUp 0.4s ${EASE} ${0.05 + i * 0.03}s both`,
                          }}
                          onMouseEnter={(e) => {
                            if (!isRated) e.currentTarget.style.borderColor = `${memberColor}25`;
                          }}
                          onMouseLeave={(e) => {
                            if (!isRated) e.currentTarget.style.borderColor = 'rgba(212,165,116,0.06)';
                          }}
                        >
                          <GlowAvatar member={member} size={32} delay={0.1 + i * 0.02} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: CREAM }}>{member.name}</div>
                            <div style={{ fontSize: 10, color: DIM }}>{member.shortRole}</div>
                          </div>
                          <StarRating
                            value={currentRatings[member.id] || 0}
                            onChange={(v) => handleRating(member.id, v)}
                          />
                          {isRated && (
                            <div style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: `${SAGE}18`,
                              animation: `pf-scaleIn 0.3s ${EASE}`,
                            }}>
                              <CheckCircle size={10} style={{ color: SAGE }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback text area */}
                  <div style={{
                    marginTop: 16,
                    animation: `pf-fadeUp 0.5s ${EASE} 0.4s both`,
                  }}>
                    <label style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: DIM,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'block',
                      marginBottom: 8,
                    }}>
                      Additional Comments (optional)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value.slice(0, MAX_CHARS))}
                        placeholder="Share thoughts, recognition, or constructive feedback..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: 12,
                          border: `1px solid ${feedbackText ? `${AMBER}25` : BORDER}`,
                          backgroundColor: 'rgba(19,23,32,0.5)',
                          backdropFilter: 'blur(12px)',
                          color: CREAM,
                          fontSize: 13,
                          fontFamily: 'inherit',
                          lineHeight: 1.6,
                          resize: 'vertical',
                          outline: 'none',
                          transition: `border-color 0.3s ${EASE}, box-shadow 0.3s ${EASE}`,
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = `${AMBER}40`;
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${AMBER}10, 0 0 20px ${AMBER}06`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = feedbackText ? `${AMBER}25` : BORDER;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      {/* Character counter */}
                      <div style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 14,
                        fontSize: 10,
                        fontFamily: 'var(--font-mono, monospace)',
                        color: feedbackText.length > MAX_CHARS * 0.9 ? DANGER : DIM,
                        transition: 'color 0.2s',
                        pointerEvents: 'none',
                      }}>
                        {feedbackText.length}/{MAX_CHARS}
                      </div>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 20,
                    paddingTop: 18,
                    borderTop: `1px solid ${BORDER}`,
                  }}>
                    {/* Progress indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar-animated" style={{
                        width: 120,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: `${BORDER}`,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          borderRadius: 2,
                          width: `${(ratingsGiven / feedbackMembers.length) * 100}%`,
                          background: `linear-gradient(90deg, ${AMBER}, ${GOLD})`,
                          transition: `width 0.4s ${EASE}`,
                          boxShadow: ratingsGiven > 0 ? `0 0 8px ${AMBER}40` : 'none',
                        }} />
                      </div>
                      <span style={{
                        fontSize: 11,
                        color: ratingsGiven > 0 ? MUTED : DIM,
                        fontFamily: 'var(--font-mono, monospace)',
                      }}>
                        {ratingsGiven}/{feedbackMembers.length}
                      </span>
                    </div>

                    {/* Submit button */}
                    <button
                      onClick={handleSubmit}
                      disabled={ratingsGiven === 0}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 24px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: ratingsGiven > 0 ? 'pointer' : 'not-allowed',
                        border: `1px solid ${ratingsGiven > 0 ? `${AMBER}35` : BORDER}`,
                        backgroundColor: ratingsGiven > 0 ? `${AMBER}12` : SURFACE2,
                        color: ratingsGiven > 0 ? AMBER : DIM,
                        fontFamily: 'inherit',
                        transition: `all 0.35s ${EASE}`,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        if (ratingsGiven > 0) {
                          e.currentTarget.style.backgroundColor = `${AMBER}20`;
                          e.currentTarget.style.borderColor = `${AMBER}50`;
                          e.currentTarget.style.boxShadow = `0 4px 16px ${AMBER}15`;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (ratingsGiven > 0) {
                          e.currentTarget.style.backgroundColor = `${AMBER}12`;
                          e.currentTarget.style.borderColor = `${AMBER}35`;
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      {ratingsGiven > 0 && (
                        <Sparkles size={14} style={{ animation: `pf-float 2s ease infinite` }} />
                      )}
                      <Send size={14} />
                      Submit Feedback
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────
            Tab: Anonymous Feedback
            ───────────────────────────────────────────────── */}
        {activeFeedbackTab === 'anonymous' && (
          <div style={{ animation: `pf-fadeUp 0.5s ${EASE} 0s both` }}>
            {/* Category filter pills */}
            <div style={{
              display: 'flex',
              gap: 6,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}>
              {feedbackCategories.map((cat) => {
                const count = cat.id === 'all'
                  ? anonymousFeedback.length
                  : anonymousFeedback.filter((f) => f.category === cat.id).length;
                return (
                  <CategoryPill
                    key={cat.id}
                    label={cat.label}
                    color={cat.color}
                    active={activeCategory === cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    count={count}
                  />
                );
              })}
            </div>

            {/* Feedback cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredFeedback.map((fb, i) => (
                <FeedbackCard key={i} feedback={fb} index={i} />
              ))}
              {filteredFeedback.length === 0 && (
                <div style={{
                  ...glass,
                  borderRadius: 14,
                  padding: '40px 24px',
                  textAlign: 'center',
                  animation: `pf-fadeIn 0.4s ease`,
                }}>
                  <EyeOff size={24} style={{ color: DIM, margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 13, color: DIM }}>No feedback in this category yet.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────
            History Timeline Toggle
            ───────────────────────────────────────────────── */}
        <div style={{
          marginTop: 28,
          animation: `pf-fadeUp 0.5s ${EASE} 0.15s both`,
        }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '14px 18px',
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              ...glass,
              borderColor: showHistory ? `${AMBER}20` : 'rgba(212,165,116,0.08)',
              color: showHistory ? AMBER : MUTED,
              fontFamily: 'inherit',
              transition: `all 0.35s ${EASE}`,
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${AMBER}25`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = showHistory ? `${AMBER}20` : 'rgba(212,165,116,0.08)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: showHistory ? `${AMBER}12` : `rgba(255,255,255,0.04)`,
              transition: `background 0.3s ${EASE}`,
            }}>
              <Calendar size={14} />
            </div>
            <span style={{ flex: 1 }}>Feedback History</span>
            <span style={{
              fontSize: 10,
              color: DIM,
              padding: '3px 8px',
              borderRadius: 20,
              backgroundColor: SURFACE2,
            }}>
              {feedbackHistory.length} weeks
            </span>
            <div style={{
              transition: `transform 0.3s ${EASE}`,
              transform: showHistory ? 'rotate(180deg)' : 'none',
            }}>
              <ChevronDown size={15} />
            </div>
          </button>

          {/* Timeline */}
          {showHistory && (
            <div style={{
              marginTop: 16,
              paddingLeft: 4,
              animation: `pf-fadeUp 0.4s ${EASE} 0s both`,
            }}>
              {feedbackHistory.map((week, wi) => (
                <TimelineWeek
                  key={week.weekStart}
                  week={week}
                  index={wi}
                  isLast={wi === feedbackHistory.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
