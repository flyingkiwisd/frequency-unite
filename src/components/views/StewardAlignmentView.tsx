'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  ChevronDown,
  AlertTriangle,
  Flame,
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Zap,
  Shield,
  Heart,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ─── Types ─── */

interface AlignmentScore {
  stewardId: string;
  questionIndex: number;
  score: number;
}

interface WeekData {
  weekId: string;
  weekLabel: string;
  startDate: string;
  scores: AlignmentScore[];
}

/* ─── Constants ─── */

const STORAGE_KEY = 'frequency-steward-alignment';

const STEWARDS = [
  { id: 'james', name: 'James', shortRole: 'Founder', avatar: 'JH', color: '#d4a574' },
  { id: 'sian', name: 'Sian', shortRole: 'COO', avatar: 'SH', color: '#e879a0' },
  { id: 'fairman', name: 'Fairman', shortRole: 'Strategic Architect', avatar: 'AF', color: '#8b5cf6' },
  { id: 'dave', name: 'Dave', shortRole: 'Board & Culture', avatar: 'DW', color: '#34d399' },
];

const QUESTIONS = [
  'How aligned are we on 2026 priorities?',
  'How clear is the path to 144 well-stewards?',
  'How well are resources allocated across nodes?',
  'How aligned are we on Blue Spirit vision?',
  'How healthy is our team energy and pace?',
];

const DIMENSION_LABELS = ['Values', 'Mission', 'Execution', 'Culture', 'Growth'];
const DIMENSION_ICONS = [Shield, Target, Zap, Heart, TrendingUp];

const SCORE_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  5: { bg: 'rgba(16, 185, 129, 0.20)', text: '#10b981', label: 'Strong' },
  4: { bg: 'rgba(34, 197, 94, 0.18)', text: '#22c55e', label: 'Good' },
  3: { bg: 'rgba(212, 165, 116, 0.20)', text: '#d4a574', label: 'Mixed' },
  2: { bg: 'rgba(249, 115, 22, 0.20)', text: '#f97316', label: 'Weak' },
  1: { bg: 'rgba(244, 63, 94, 0.18)', text: '#f43e5e', label: 'Misaligned' },
  0: { bg: 'rgba(107, 99, 88, 0.10)', text: '#6b6358', label: 'No score' },
};

/* ─── Helpers ─── */

function getWeekId(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

function getWeekLabel(weekId: string): string {
  const d = new Date(weekId + 'T00:00:00');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
}

function generateMockData(): WeekData[] {
  const now = new Date();
  const weeks: WeekData[] = [];

  const mockPatterns: Record<string, number[][]> = {
    james: [
      [4, 3, 3, 5, 3],
      [4, 3, 3, 5, 4],
      [5, 4, 3, 5, 3],
      [5, 4, 4, 5, 4],
    ],
    sian: [
      [4, 3, 2, 4, 2],
      [4, 3, 3, 4, 2],
      [4, 3, 3, 5, 3],
      [5, 4, 3, 5, 3],
    ],
    fairman: [
      [5, 4, 3, 4, 3],
      [5, 4, 3, 4, 4],
      [5, 4, 4, 5, 4],
      [5, 5, 4, 5, 4],
    ],
    dave: [
      [3, 3, 3, 5, 4],
      [4, 3, 3, 5, 4],
      [4, 3, 3, 5, 4],
      [4, 4, 3, 5, 4],
    ],
  };

  for (let w = 4; w >= 1; w--) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - w * 7);
    const weekId = getWeekId(weekDate);
    const weekIndex = 4 - w;

    const scores: AlignmentScore[] = [];
    STEWARDS.forEach((steward) => {
      const pattern = mockPatterns[steward.id][weekIndex];
      pattern.forEach((score, qIndex) => {
        scores.push({ stewardId: steward.id, questionIndex: qIndex, score });
      });
    });

    weeks.push({
      weekId,
      weekLabel: getWeekLabel(weekId),
      startDate: weekId,
      scores,
    });
  }

  return weeks;
}

function overallScoreColor(score: number): { color: string; bg: string; label: string } {
  if (score >= 4) return { color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.15)', label: 'Strong Alignment' };
  if (score >= 3) return { color: '#d4a574', bg: 'rgba(212, 165, 116, 0.15)', label: 'Moderate Alignment' };
  return { color: '#e06060', bg: 'rgba(224, 96, 96, 0.15)', label: 'Weak Alignment' };
}

/* ─── Scoped Keyframe Styles ─── */

const SA_STYLES = `
  @keyframes sa-fadeSlideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes sa-fadeSlideRight {
    from { opacity: 0; transform: translateX(-16px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes sa-scaleIn {
    from { opacity: 0; transform: scale(0.6); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes sa-pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.2); }
    50% { box-shadow: 0 0 0 10px rgba(212, 165, 116, 0); }
  }
  @keyframes sa-pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.4); }
  }
  @keyframes sa-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes sa-radarDraw {
    from { stroke-dashoffset: 2000; opacity: 0; }
    to { stroke-dashoffset: 0; opacity: 1; }
  }
  @keyframes sa-radarScale {
    from { transform: scale(0.2); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes sa-numberCount {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes sa-ringProgress {
    from { stroke-dashoffset: var(--sa-circumference); }
    to { stroke-dashoffset: var(--sa-target-offset); }
  }
  @keyframes sa-borderGlow {
    0%, 100% { border-color: rgba(212, 165, 116, 0.08); }
    50% { border-color: rgba(212, 165, 116, 0.2); }
  }
  @keyframes sa-healthPulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.15); opacity: 1; }
  }
  @keyframes sa-connectLine {
    from { stroke-dashoffset: 100; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes sa-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
  @keyframes sa-spinSlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes sa-barGrow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }
  .sa-animate-in {
    animation: sa-fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
  .sa-glass {
    background: rgba(19, 23, 32, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(212, 165, 116, 0.08);
    border-radius: 16px;
  }
  .sa-glass-subtle {
    background: rgba(19, 23, 32, 0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(212, 165, 116, 0.06);
    border-radius: 12px;
  }
  .sa-card-hover {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .sa-card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 165, 116, 0.12);
  }
  .sa-gradient-underline {
    position: relative;
  }
  .sa-gradient-underline::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, rgba(212, 165, 116, 0.6), rgba(139, 92, 246, 0.4), rgba(107, 143, 113, 0.3));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .sa-gradient-underline:hover::after {
    opacity: 1;
  }
`;

/* ─── SVG Radar Chart Component ─── */

function RadarChart({
  dimensionScores,
  teamAvgScores,
  animated,
  selectedStewardColor,
  showComparison,
}: {
  dimensionScores: number[];
  teamAvgScores: number[];
  animated: boolean;
  selectedStewardColor: string;
  showComparison: boolean;
}) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 115;
  const levels = 5;
  const dims = DIMENSION_LABELS.length;
  const angleStep = (2 * Math.PI) / dims;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 5) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const makePolygonPoints = (values: number[]) => {
    return values
      .map((v, i) => {
        const pt = getPoint(i, v);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  };

  const makePolygonPath = (values: number[]) => {
    return values
      .map((v, i) => {
        const pt = getPoint(i, v);
        return `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
      })
      .join(' ') + ' Z';
  };

  const uid = useRef(`sa-radar-${Math.random().toString(36).slice(2, 8)}`).current;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.06)" />
          <stop offset="50%" stopColor="rgba(19, 23, 32, 0.4)" />
          <stop offset="100%" stopColor="rgba(11, 13, 20, 0.9)" />
        </radialGradient>
        <linearGradient id={`${uid}-ind`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={selectedStewardColor} stopOpacity={0.35} />
          <stop offset="100%" stopColor={selectedStewardColor} stopOpacity={0.08} />
        </linearGradient>
        <linearGradient id={`${uid}-team`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b8f71" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#6b8f71" stopOpacity={0.04} />
        </linearGradient>
        <filter id={`${uid}-glow`}>
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-dotGlow`}>
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ambient circle */}
      <circle cx={cx} cy={cy} r={maxR + 16} fill="url(#radarBg)" opacity={0.3} />
      <circle cx={cx} cy={cy} r={maxR + 10} fill={`url(#${uid}-bg)`} />

      {/* Concentric level rings with subtle gradient fills */}
      {Array.from({ length: levels }, (_, i) => {
        const r = ((i + 1) / levels) * maxR;
        return (
          <g key={`ring-${i}`}>
            <polygon
              points={Array.from({ length: dims }, (_, d) => {
                const angle = startAngle + d * angleStep;
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
              }).join(' ')}
              fill="none"
              stroke={i === levels - 1 ? 'rgba(212, 165, 116, 0.12)' : 'rgba(139, 92, 246, 0.06)'}
              strokeWidth={i === levels - 1 ? 1.5 : 0.6}
            />
          </g>
        );
      })}

      {/* Axis lines with gradient */}
      {Array.from({ length: dims }, (_, i) => {
        const angle = startAngle + i * angleStep;
        const endX = cx + maxR * Math.cos(angle);
        const endY = cy + maxR * Math.sin(angle);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={endX}
            y2={endY}
            stroke="rgba(139, 92, 246, 0.08)"
            strokeWidth={0.8}
          />
        );
      })}

      {/* Team average polygon (behind individual) with animated drawing */}
      {showComparison && (
        <path
          d={makePolygonPath(teamAvgScores)}
          fill={`url(#${uid}-team)`}
          stroke="#6b8f71"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          strokeOpacity={animated ? 0.6 : 0}
          style={{
            opacity: animated ? 1 : 0,
            transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
          }}
        />
      )}

      {/* Individual/overall score polygon with gradient fill and glow */}
      <path
        d={makePolygonPath(dimensionScores)}
        fill={`url(#${uid}-ind)`}
        stroke={selectedStewardColor}
        strokeWidth={2.5}
        strokeLinejoin="round"
        filter={`url(#${uid}-glow)`}
        style={{
          opacity: animated ? 1 : 0,
          transformOrigin: `${cx}px ${cy}px`,
          transform: animated ? 'scale(1)' : 'scale(0.15)',
          transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Score dots on individual polygon with outer glow rings */}
      {dimensionScores.map((v, i) => {
        const pt = getPoint(i, v);
        return (
          <g key={`dot-${i}`}>
            {/* Outer glow pulse */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={12}
              fill={selectedStewardColor}
              opacity={animated ? 0.08 : 0}
              style={{
                transition: `opacity 0.5s ease-out ${0.4 + i * 0.12}s`,
                animation: animated ? `sa-healthPulse 3s ease-in-out ${i * 0.5}s infinite` : 'none',
              }}
            />
            {/* Mid glow */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={8}
              fill={selectedStewardColor}
              opacity={animated ? 0.15 : 0}
              style={{
                transition: `opacity 0.4s ease-out ${0.3 + i * 0.12}s`,
              }}
            />
            {/* Core dot */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={5}
              fill={selectedStewardColor}
              stroke="#0b0d14"
              strokeWidth={2}
              filter={`url(#${uid}-dotGlow)`}
              style={{
                opacity: animated ? 1 : 0,
                transition: `opacity 0.5s ease-out ${0.2 + i * 0.12}s`,
              }}
            />
            {/* Score number at dot */}
            {v > 0 && (
              <text
                x={pt.x}
                y={pt.y - 14}
                textAnchor="middle"
                fill={selectedStewardColor}
                fontSize={9}
                fontWeight={700}
                style={{
                  opacity: animated ? 0.9 : 0,
                  transition: `opacity 0.4s ease-out ${0.5 + i * 0.12}s`,
                }}
              >
                {v}
              </text>
            )}
          </g>
        );
      })}

      {/* Dimension labels with icon circles */}
      {DIMENSION_LABELS.map((label, i) => {
        const angle = startAngle + i * angleStep;
        const labelR = maxR + 28;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        return (
          <g key={`label-${i}`}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#f0ebe4"
              fontSize={10}
              fontWeight={700}
              letterSpacing={0.5}
              style={{
                opacity: animated ? 1 : 0,
                transition: `opacity 0.5s ease-out ${0.6 + i * 0.1}s`,
              }}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Level labels */}
      {[1, 2, 3, 4, 5].map((lv) => {
        const r = (lv / 5) * maxR;
        return (
          <text
            key={`lv-${lv}`}
            x={cx + 8}
            y={cy - r + 3}
            fill="#6b6358"
            fontSize={8}
            fontWeight={500}
            opacity={0.7}
          >
            {lv}
          </text>
        );
      })}

      {/* Center beacon */}
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={selectedStewardColor}
        opacity={animated ? 0.6 : 0}
        style={{
          transition: 'opacity 0.5s ease-out 0.8s',
          animation: animated ? 'sa-healthPulse 2s ease-in-out infinite' : 'none',
        }}
      />
    </svg>
  );
}

/* ─── Animated Ring Score Component ─── */

function AnimatedRingScore({ score, maxScore = 5, color, label }: {
  score: number;
  maxScore?: number;
  color: string;
  label: string;
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showNumber, setShowNumber] = useState(false);
  const progress = maxScore > 0 ? score / maxScore : 0;
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - animatedProgress);
  const uid = useRef(`sa-ring-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    const t1 = setTimeout(() => setAnimatedProgress(progress), 300);
    const t2 = setTimeout(() => setShowNumber(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [progress]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="50%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity={0.8} />
            </linearGradient>
            <filter id={`${uid}-glow`}>
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`${uid}-innerGlow`}>
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient glow ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 6}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeOpacity={0.06}
          />

          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(30, 38, 56, 0.8)"
            strokeWidth={strokeWidth}
          />

          {/* Faint track ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={0.06}
          />

          {/* Score ring with gradient and glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${uid}-grad)`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            filter={`url(#${uid}-glow)`}
            style={{
              transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Leading dot on the progress arc */}
          {animatedProgress > 0.01 && (() => {
            const endAngle = -Math.PI / 2 + animatedProgress * 2 * Math.PI;
            const dotX = size / 2 + radius * Math.cos(endAngle);
            const dotY = size / 2 + radius * Math.sin(endAngle);
            return (
              <g>
                <circle cx={dotX} cy={dotY} r={6} fill={color} opacity={0.3}
                  style={{ animation: 'sa-healthPulse 2s ease-in-out infinite' }} />
                <circle cx={dotX} cy={dotY} r={3} fill={color} />
              </g>
            );
          })()}

          {/* Tick marks */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = -90 + (i / 5) * 360;
            const rad = (angle * Math.PI) / 180;
            const tickInner = radius - strokeWidth / 2 - 3;
            const tickOuter = radius + strokeWidth / 2 + 3;
            return (
              <line
                key={`tick-${i}`}
                x1={size / 2 + tickInner * Math.cos(rad)}
                y1={size / 2 + tickInner * Math.sin(rad)}
                x2={size / 2 + tickOuter * Math.cos(rad)}
                y2={size / 2 + tickOuter * Math.sin(rad)}
                stroke="rgba(30, 38, 56, 0.9)"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold tabular-nums"
            style={{
              color,
              fontSize: '2.5rem',
              lineHeight: 1,
              opacity: showNumber ? 1 : 0,
              transform: showNumber ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {score > 0 ? score.toFixed(1) : '--'}
          </span>
          <span className="text-[10px] font-medium mt-1" style={{ color: '#a09888' }}>/ {maxScore}</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span
          className="text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5"
          style={{
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            color,
            border: `1px solid ${color}25`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: color,
              animation: 'sa-pulseDot 2s ease-in-out infinite',
            }}
          />
          {label}
        </span>
      </div>
    </div>
  );
}

/* ─── Team Alignment Heatmap ─── */

function AlignmentHeatmap({
  heatmapData,
  questionAverages,
  animated,
}: {
  heatmapData: Record<string, Record<number, number>> | null;
  questionAverages: number[];
  animated: boolean;
}) {
  if (!heatmapData) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: '#a09888' }}>
        No alignment data for this week yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {/* Header row */}
      <div className="grid gap-2" style={{ gridTemplateColumns: '130px repeat(5, 1fr) 65px' }}>
        <div className="text-[10px] font-semibold p-2" style={{ color: '#a09888' }}>Steward</div>
        {DIMENSION_LABELS.map((dim) => (
          <div key={dim} className="text-[9px] font-medium p-1.5 text-center uppercase tracking-wider" style={{ color: '#a09888' }}>
            {dim}
          </div>
        ))}
        <div className="text-[10px] font-semibold p-2 text-center" style={{ color: '#a09888' }}>Avg</div>
      </div>

      {/* Steward rows */}
      {STEWARDS.map((steward, si) => {
        const scores = heatmapData[steward.id];
        const stewardScores = Object.values(scores).filter((s) => s > 0);
        const stewardAvg =
          stewardScores.length > 0
            ? stewardScores.reduce((a, b) => a + b, 0) / stewardScores.length
            : 0;

        return (
          <div
            key={steward.id}
            className="grid gap-2 items-center rounded-xl transition-all"
            style={{
              gridTemplateColumns: '130px repeat(5, 1fr) 65px',
              opacity: animated ? 1 : 0,
              transform: animated ? 'translateX(0)' : 'translateX(-12px)',
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${si * 0.1}s`,
              padding: '4px 0',
            }}
          >
            <div className="flex items-center gap-2.5 p-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                  color: '#0b0d14',
                  boxShadow: `0 2px 10px ${steward.color}30`,
                }}
              >
                {steward.avatar}
              </div>
              <div>
                <div className="text-xs font-semibold" style={{ color: '#f0ebe4' }}>{steward.name}</div>
                <div className="text-[9px]" style={{ color: '#a09888' }}>{steward.shortRole}</div>
              </div>
            </div>
            {QUESTIONS.map((_, qi) => {
              const score = scores[qi] || 0;
              const cfg = SCORE_COLORS[score];
              const intensity = score / 5;
              return (
                <div
                  key={qi}
                  className="flex items-center justify-center rounded-xl transition-all sa-card-hover"
                  style={{
                    backgroundColor: score > 0 ? cfg.bg : 'rgba(28, 34, 48, 0.6)',
                    boxShadow: score >= 4 ? `0 0 16px ${cfg.text}18, inset 0 1px 0 ${cfg.text}10` : 'none',
                    minHeight: 44,
                    border: score >= 4 ? `1px solid ${cfg.text}15` : '1px solid transparent',
                  }}
                >
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{
                      color: score > 0 ? cfg.text : '#6b6358',
                      opacity: score > 0 ? 0.6 + intensity * 0.4 : 0.5,
                    }}
                  >
                    {score > 0 ? score : '--'}
                  </span>
                </div>
              );
            })}
            <div className="text-center">
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: stewardAvg > 0 ? overallScoreColor(stewardAvg).color : '#6b6358' }}
              >
                {stewardAvg > 0 ? stewardAvg.toFixed(1) : '--'}
              </span>
            </div>
          </div>
        );
      })}

      {/* Average row */}
      <div
        className="grid gap-2 items-center mt-1 pt-3"
        style={{
          gridTemplateColumns: '130px repeat(5, 1fr) 65px',
          borderTop: '1px solid rgba(212, 165, 116, 0.08)',
        }}
      >
        <div className="text-[10px] font-semibold p-1.5 uppercase tracking-wider" style={{ color: '#d4a574' }}>Team Average</div>
        {questionAverages.map((avg, qi) => {
          const cfg = overallScoreColor(avg);
          return (
            <div key={qi} className="text-center p-1.5">
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: avg > 0 ? cfg.color : '#6b6358' }}
              >
                {avg > 0 ? avg.toFixed(1) : '--'}
              </span>
            </div>
          );
        })}
        <div />
      </div>
    </div>
  );
}

/* ─── Action Items Component ─── */

function ActionItems({ questionAverages, lowestIndex }: {
  questionAverages: number[];
  lowestIndex: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const actions = useMemo(() => {
    const items: { text: string; priority: 'high' | 'medium' | 'low'; dimension: string }[] = [];

    questionAverages.forEach((avg, i) => {
      if (avg > 0 && avg < 3) {
        items.push({
          text: `Schedule focused session on "${DIMENSION_LABELS[i]}" alignment`,
          priority: 'high',
          dimension: DIMENSION_LABELS[i],
        });
      } else if (avg >= 3 && avg < 4) {
        items.push({
          text: `Review "${DIMENSION_LABELS[i]}" priorities and address gaps`,
          priority: 'medium',
          dimension: DIMENSION_LABELS[i],
        });
      }
    });

    if (items.length === 0 && questionAverages.some((q) => q > 0)) {
      items.push({
        text: 'Maintain current alignment through weekly check-ins',
        priority: 'low',
        dimension: 'All',
      });
      items.push({
        text: 'Document alignment wins and share with broader team',
        priority: 'low',
        dimension: 'All',
      });
    }

    const hasData = questionAverages.some((q) => q > 0);
    if (hasData && lowestIndex >= 0) {
      items.push({
        text: `Deep-dive discussion on "${DIMENSION_LABELS[lowestIndex]}" - lowest aligned dimension`,
        priority: 'high',
        dimension: DIMENSION_LABELS[lowestIndex],
      });
    }

    if (hasData) {
      items.push({
        text: 'Each steward shares one concrete action to improve alignment',
        priority: 'medium',
        dimension: 'All',
      });
    }

    return items;
  }, [questionAverages, lowestIndex]);

  const priorityConfig = {
    high: { color: '#f43e5e', bg: 'rgba(244, 63, 94, 0.12)', gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(244, 63, 94, 0.05))', icon: AlertTriangle },
    medium: { color: '#d4a574', bg: 'rgba(212, 165, 116, 0.12)', gradient: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(212, 165, 116, 0.05))', icon: Lightbulb },
    low: { color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.12)', gradient: 'linear-gradient(135deg, rgba(107, 143, 113, 0.15), rgba(107, 143, 113, 0.05))', icon: CheckCircle2 },
  };

  if (actions.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {actions.map((action, i) => {
        const cfg = priorityConfig[action.priority];
        const Icon = cfg.icon;
        return (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl transition-all sa-card-hover"
            style={{
              background: cfg.gradient,
              border: `1px solid ${cfg.color}15`,
              borderLeftWidth: 3,
              borderLeftColor: cfg.color,
              backdropFilter: 'blur(8px)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s`,
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: `linear-gradient(135deg, ${cfg.color}25, ${cfg.color}10)`,
                border: `1px solid ${cfg.color}20`,
              }}
            >
              <Icon size={14} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: '#f0ebe4' }}>{action.text}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  style={{
                    background: `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}10)`,
                    color: cfg.color,
                    border: `1px solid ${cfg.color}20`,
                  }}
                >
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {action.priority}
                </span>
                <span className="text-[10px]" style={{ color: '#a09888' }}>{action.dimension}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Dimension Breakdown Card ─── */

function DimensionCard({
  index,
  label,
  average,
  stewardScores,
  animated,
  delay,
}: {
  index: number;
  label: string;
  average: number;
  stewardScores: { steward: typeof STEWARDS[0]; score: number }[];
  animated: boolean;
  delay: number;
}) {
  const [barAnimated, setBarAnimated] = useState(false);
  const cfg = overallScoreColor(average);
  const Icon = DIMENSION_ICONS[index];

  useEffect(() => {
    const timer = setTimeout(() => setBarAnimated(true), delay + 400);
    return () => clearTimeout(timer);
  }, [delay]);

  // Determine category gradient colors
  const catColors = [
    { from: '#d4a574', to: '#8b5cf6' },  // Values
    { from: '#8b5cf6', to: '#e879a0' },  // Mission
    { from: '#34d399', to: '#d4a574' },  // Execution
    { from: '#e879a0', to: '#f97316' },  // Culture
    { from: '#6b8f71', to: '#34d399' },  // Growth
  ][index];

  return (
    <div
      className="sa-glass sa-card-hover rounded-2xl p-5 transition-all"
      style={{
        opacity: animated ? 1 : 0,
        transform: animated ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${catColors.from}20, ${catColors.to}10)`,
              border: `1px solid ${catColors.from}20`,
            }}
          >
            <Icon size={18} style={{ color: catColors.from }} />
          </div>
          <div>
            <div className="text-sm font-bold sa-gradient-underline" style={{ color: '#f0ebe4' }}>{label}</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#a09888' }}>
              {QUESTIONS[index].length > 38 ? QUESTIONS[index].slice(0, 35) + '...' : QUESTIONS[index]}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{
              color: average > 0 ? cfg.color : '#6b6358',
              animation: animated ? 'sa-numberCount 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
              animationDelay: `${delay + 200}ms`,
            }}
          >
            {average > 0 ? average.toFixed(1) : '--'}
          </span>
          {average > 0 && (
            <div className="text-[9px] font-semibold mt-0.5" style={{ color: cfg.color }}>
              {cfg.label.split(' ')[0]}
            </div>
          )}
        </div>
      </div>

      {/* Gradient underline */}
      <div
        className="h-0.5 rounded-full mb-4"
        style={{
          background: `linear-gradient(90deg, ${catColors.from}40, ${catColors.to}20, transparent)`,
        }}
      />

      {/* Main progress bar */}
      <div
        className="h-2.5 rounded-full overflow-hidden mb-4"
        style={{ backgroundColor: 'rgba(28, 34, 48, 0.8)' }}
      >
        <div
          className="h-full rounded-full relative"
          style={{
            width: barAnimated ? `${(average / 5) * 100}%` : '0%',
            background: average > 0 ? `linear-gradient(90deg, ${catColors.from}cc, ${cfg.color})` : 'transparent',
            transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: average > 0 ? `0 0 12px ${cfg.color}30, 0 2px 4px ${cfg.color}20` : 'none',
          }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              backgroundSize: '200% 100%',
              animation: barAnimated ? 'sa-shimmer 3s ease-in-out infinite' : 'none',
            }}
          />
        </div>
      </div>

      {/* Individual steward bars */}
      <div className="space-y-2">
        {stewardScores.map(({ steward, score }) => (
          <div key={steward.id} className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                color: '#0b0d14',
                boxShadow: `0 1px 4px ${steward.color}30`,
              }}
            >
              {steward.avatar[0]}
            </div>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(28, 34, 48, 0.8)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: barAnimated ? `${(score / 5) * 100}%` : '0%',
                  background: `linear-gradient(90deg, ${steward.color}99, ${steward.color})`,
                  transition: `width 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1}s`,
                }}
              />
            </div>
            <span className="text-[10px] font-mono w-4 text-right tabular-nums" style={{ color: score > 0 ? steward.color : '#6b6358' }}>
              {score > 0 ? score : '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Overall Health Banner ─── */

function HealthBanner({
  overallScore,
  trendDirection,
  stewardCount,
  weekLabel,
}: {
  overallScore: number;
  trendDirection: 'up' | 'down' | 'flat';
  stewardCount: number;
  weekLabel: string;
}) {
  const cfg = overallScoreColor(overallScore);
  const gradientBg = overallScore >= 4
    ? 'linear-gradient(135deg, rgba(107, 143, 113, 0.15), rgba(52, 211, 153, 0.08), rgba(107, 143, 113, 0.05))'
    : overallScore >= 3
      ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(139, 92, 246, 0.08), rgba(212, 165, 116, 0.05))'
      : 'linear-gradient(135deg, rgba(224, 96, 96, 0.15), rgba(249, 115, 22, 0.08), rgba(224, 96, 96, 0.05))';

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: gradientBg,
        border: `1px solid ${cfg.color}15`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
      <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
      {/* Animated background orbs */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{
        background: `radial-gradient(circle, ${cfg.color}08, transparent)`,
        animation: 'sa-float 6s ease-in-out infinite',
      }} />
      <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full" style={{
        background: `radial-gradient(circle, rgba(139, 92, 246, 0.05), transparent)`,
        animation: 'sa-float 8s ease-in-out 2s infinite',
      }} />

      <div className="relative flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* Health indicator circle */}
          <div className="relative">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${cfg.color}25, ${cfg.color}10)`,
                border: `1px solid ${cfg.color}25`,
              }}
            >
              <span className="text-xl font-bold tabular-nums" style={{ color: cfg.color }}>
                {overallScore > 0 ? overallScore.toFixed(1) : '--'}
              </span>
            </div>
            {/* Pulse dots */}
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{
                backgroundColor: cfg.color,
                animation: 'sa-pulseDot 2s ease-in-out infinite',
                boxShadow: `0 0 6px ${cfg.color}60`,
              }}
            />
          </div>
          <div>
            <div className="text-base font-bold" style={{ color: '#f0ebe4' }}>
              Team Alignment Health
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
                style={{
                  background: `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}08)`,
                  color: cfg.color,
                  border: `1px solid ${cfg.color}20`,
                }}
              >
                {overallScore > 0 ? cfg.label : 'No Data Yet'}
              </span>
              <span className="text-[10px]" style={{ color: '#a09888' }}>
                Week of {weekLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex items-center gap-5">
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums" style={{
              color: trendDirection === 'up' ? '#6b8f71' : trendDirection === 'down' ? '#e06060' : '#a09888',
            }}>
              {trendDirection === 'up' && <TrendingUp size={18} className="inline mr-1" />}
              {trendDirection === 'down' && <TrendingDown size={18} className="inline mr-1" />}
              {trendDirection === 'flat' && <Minus size={18} className="inline mr-1" />}
              {trendDirection === 'up' ? 'Rising' : trendDirection === 'down' ? 'Falling' : 'Steady'}
            </div>
            <div className="text-[9px] font-medium uppercase tracking-wider" style={{ color: '#a09888' }}>Trend</div>
          </div>
          <div className="w-px h-8" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }} />
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums" style={{ color: '#8b5cf6' }}>{stewardCount}</div>
            <div className="text-[9px] font-medium uppercase tracking-wider" style={{ color: '#a09888' }}>Stewards</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function StewardAlignmentView() {
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [selectedSteward, setSelectedSteward] = useState<string>(STEWARDS[0].id);
  const [currentScores, setCurrentScores] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [chartMounted, setChartMounted] = useState(false);
  const [heatmapMounted, setHeatmapMounted] = useState(false);
  const [cardsMounted, setCardsMounted] = useState(false);

  // Trigger mount animations
  useEffect(() => {
    const t1 = setTimeout(() => setChartMounted(true), 200);
    const t2 = setTimeout(() => setHeatmapMounted(true), 500);
    const t3 = setTimeout(() => setCardsMounted(true), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: WeekData[] = JSON.parse(stored);
        setWeeks(parsed);
      } catch {
        const mock = generateMockData();
        setWeeks(mock);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
      }
    } else {
      const mock = generateMockData();
      setWeeks(mock);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
    }
  }, []);

  // Check if current steward already submitted this week
  const currentWeekId = getWeekId(new Date());
  useEffect(() => {
    const currentWeek = weeks.find((w) => w.weekId === currentWeekId);
    if (currentWeek) {
      const hasSubmitted = currentWeek.scores.some((s) => s.stewardId === selectedSteward);
      setSubmitted(hasSubmitted);
      if (hasSubmitted) {
        const stewardScores: Record<number, number> = {};
        currentWeek.scores
          .filter((s) => s.stewardId === selectedSteward)
          .forEach((s) => { stewardScores[s.questionIndex] = s.score; });
        setCurrentScores(stewardScores);
      } else {
        setCurrentScores({});
      }
    } else {
      setSubmitted(false);
      setCurrentScores({});
    }
  }, [selectedSteward, weeks, currentWeekId]);

  // Handle score change
  const handleScoreChange = (questionIndex: number, score: number) => {
    if (submitted) return;
    setCurrentScores((prev) => ({ ...prev, [questionIndex]: score }));
  };

  // Submit scores
  const handleSubmit = () => {
    if (Object.keys(currentScores).length !== QUESTIONS.length) return;

    const newScores: AlignmentScore[] = QUESTIONS.map((_, qi) => ({
      stewardId: selectedSteward,
      questionIndex: qi,
      score: currentScores[qi],
    }));

    setWeeks((prev) => {
      const existingWeekIndex = prev.findIndex((w) => w.weekId === currentWeekId);
      let updated: WeekData[];

      if (existingWeekIndex >= 0) {
        updated = prev.map((w, i) => {
          if (i !== existingWeekIndex) return w;
          const filtered = w.scores.filter((s) => s.stewardId !== selectedSteward);
          return { ...w, scores: [...filtered, ...newScores] };
        });
      } else {
        updated = [
          ...prev,
          {
            weekId: currentWeekId,
            weekLabel: getWeekLabel(currentWeekId),
            startDate: currentWeekId,
            scores: newScores,
          },
        ];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setSubmitted(true);
    setShowSubmitConfirm(true);
    setTimeout(() => setShowSubmitConfirm(false), 2500);
  };

  // Computed data
  const currentWeek = useMemo(
    () => weeks.find((w) => w.weekId === currentWeekId),
    [weeks, currentWeekId],
  );

  // Heatmap data for current week
  const heatmapData = useMemo(() => {
    if (!currentWeek) return null;
    const grid: Record<string, Record<number, number>> = {};
    STEWARDS.forEach((s) => {
      grid[s.id] = {};
      QUESTIONS.forEach((_, qi) => {
        const found = currentWeek.scores.find(
          (sc) => sc.stewardId === s.id && sc.questionIndex === qi,
        );
        grid[s.id][qi] = found ? found.score : 0;
      });
    });
    return grid;
  }, [currentWeek]);

  // Weekly averages for trend chart
  const weeklyAverages = useMemo(() => {
    const recentWeeks = weeks.slice(-8);
    return recentWeeks.map((w) => {
      if (w.scores.length === 0) return { weekLabel: w.weekLabel, average: 0 };
      const avg = w.scores.reduce((sum, s) => sum + s.score, 0) / w.scores.length;
      return { weekLabel: w.weekLabel, average: Math.round(avg * 100) / 100 };
    });
  }, [weeks]);

  // Overall score for current week
  const overallScore = useMemo(() => {
    if (!currentWeek || currentWeek.scores.length === 0) return 0;
    return (
      Math.round(
        (currentWeek.scores.reduce((sum, s) => sum + s.score, 0) / currentWeek.scores.length) * 100,
      ) / 100
    );
  }, [currentWeek]);

  // Question averages for current week
  const questionAverages = useMemo(() => {
    if (!currentWeek || currentWeek.scores.length === 0) return QUESTIONS.map(() => 0);
    return QUESTIONS.map((_, qi) => {
      const qScores = currentWeek.scores.filter((s) => s.questionIndex === qi);
      if (qScores.length === 0) return 0;
      return Math.round((qScores.reduce((sum, s) => sum + s.score, 0) / qScores.length) * 100) / 100;
    });
  }, [currentWeek]);

  // Selected steward dimension scores (for radar)
  const selectedStewardDimensionScores = useMemo(() => {
    if (!currentWeek) return QUESTIONS.map(() => 0);
    return QUESTIONS.map((_, qi) => {
      const found = currentWeek.scores.find(
        (s) => s.stewardId === selectedSteward && s.questionIndex === qi,
      );
      return found ? found.score : 0;
    });
  }, [currentWeek, selectedSteward]);

  const highestAlignedIndex = useMemo(() => {
    if (questionAverages.every((q) => q === 0)) return -1;
    return questionAverages.indexOf(Math.max(...questionAverages.filter((q) => q > 0)));
  }, [questionAverages]);

  const lowestAlignedIndex = useMemo(() => {
    const nonZero = questionAverages.filter((q) => q > 0);
    if (nonZero.length === 0) return -1;
    const minVal = Math.min(...nonZero);
    return questionAverages.indexOf(minVal);
  }, [questionAverages]);

  // Trend direction
  const trendDirection = useMemo(() => {
    if (weeklyAverages.length < 2) return 'flat' as const;
    const recent = weeklyAverages[weeklyAverages.length - 1]?.average ?? 0;
    const previous = weeklyAverages[weeklyAverages.length - 2]?.average ?? 0;
    if (recent > previous + 0.1) return 'up' as const;
    if (recent < previous - 0.1) return 'down' as const;
    return 'flat' as const;
  }, [weeklyAverages]);

  // Per-steward averages
  const stewardAverages = useMemo(() => {
    if (!currentWeek) return {};
    const avgs: Record<string, number> = {};
    STEWARDS.forEach((s) => {
      const scores = currentWeek.scores.filter((sc) => sc.stewardId === s.id);
      if (scores.length > 0) {
        avgs[s.id] = scores.reduce((sum, sc) => sum + sc.score, 0) / scores.length;
      } else {
        avgs[s.id] = 0;
      }
    });
    return avgs;
  }, [currentWeek]);

  const selectedStewardObj = STEWARDS.find((s) => s.id === selectedSteward) ?? STEWARDS[0];
  const allQuestionsScored = Object.keys(currentScores).length === QUESTIONS.length;
  const maxBarHeight = 130;
  const maxAvg = 5;
  const scoreCfg = overallScoreColor(overallScore);

  return (
    <div className="space-y-6">
      {/* Scoped styles */}
      <style>{SA_STYLES}</style>

      {/* ── Header ── */}
      <div className="sa-animate-in">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(139, 92, 246, 0.1))',
              border: '1px solid rgba(212, 165, 116, 0.15)',
            }}
          >
            <Users size={20} style={{ color: '#d4a574' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-glow">
              <span className="gradient-text">Steward Alignment</span>
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#a09888' }}>
              Weekly alignment pulse between core stewards. Track coherence across priorities, vision, and energy.
            </p>
          </div>
        </div>
      </div>

      {/* ── Health Banner ── */}
      <div className="sa-animate-in" style={{ animationDelay: '0.06s' }}>
        <HealthBanner
          overallScore={overallScore}
          trendDirection={trendDirection}
          stewardCount={STEWARDS.filter((s) => (stewardAverages[s.id] ?? 0) > 0).length || STEWARDS.length}
          weekLabel={getWeekLabel(currentWeekId)}
        />
      </div>

      {/* ── Animated Ring Score + Radar Chart Row ── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 sa-animate-in"
        style={{ animationDelay: '0.1s' }}
      >
        {/* Animated Ring Score */}
        <div className="sa-glass card-premium rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-5">
            <Target size={14} style={{ color: '#d4a574' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a09888' }}>
              Overall Alignment Score
            </span>
          </div>
          <AnimatedRingScore
            score={overallScore}
            maxScore={5}
            color={scoreCfg.color}
            label={overallScore > 0 ? scoreCfg.label : 'No Data'}
          />
          <div className="flex items-center gap-4 mt-5">
            <div className="flex items-center gap-1.5">
              {trendDirection === 'up' && <TrendingUp size={14} style={{ color: '#6b8f71' }} />}
              {trendDirection === 'down' && <TrendingDown size={14} style={{ color: '#e06060' }} />}
              {trendDirection === 'flat' && <Minus size={14} style={{ color: '#a09888' }} />}
              <span
                className="text-xs font-semibold"
                style={{
                  color:
                    trendDirection === 'up'
                      ? '#6b8f71'
                      : trendDirection === 'down'
                        ? '#e06060'
                        : '#a09888',
                }}
              >
                {trendDirection === 'up' ? 'Trending Up' : trendDirection === 'down' ? 'Trending Down' : 'Stable'}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: '#6b6358' }}>vs. previous week</span>
          </div>
        </div>

        {/* Radar / Spider Chart */}
        <div className="sa-glass card-premium rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} style={{ color: '#8b5cf6' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a09888' }}>
                Dimension Radar
              </span>
            </div>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-[10px] font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{
                background: showComparison
                  ? 'linear-gradient(135deg, rgba(107, 143, 113, 0.15), rgba(107, 143, 113, 0.05))'
                  : 'rgba(28, 34, 48, 0.6)',
                color: showComparison ? '#6b8f71' : '#6b6358',
                border: `1px solid ${showComparison ? 'rgba(107, 143, 113, 0.2)' : 'rgba(30, 38, 56, 0.8)'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {showComparison ? 'Comparing vs Team' : 'Individual Only'}
            </button>
          </div>

          <RadarChart
            dimensionScores={selectedStewardDimensionScores}
            teamAvgScores={questionAverages}
            animated={chartMounted}
            selectedStewardColor={selectedStewardObj.color}
            showComparison={showComparison}
          />

          {/* Steward selector for radar */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {STEWARDS.map((steward) => {
              const isActive = selectedSteward === steward.id;
              return (
                <button
                  key={steward.id}
                  onClick={() => setSelectedSteward(steward.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${steward.color}18, ${steward.color}08)`
                      : 'transparent',
                    color: isActive ? steward.color : '#6b6358',
                    border: `1px solid ${isActive ? `${steward.color}30` : 'transparent'}`,
                    boxShadow: isActive ? `0 0 12px ${steward.color}10` : 'none',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                      color: '#0b0d14',
                      boxShadow: isActive ? `0 0 8px ${steward.color}40` : 'none',
                    }}
                  >
                    {steward.avatar[0]}
                  </div>
                  {steward.name}
                </button>
              );
            })}
          </div>

          {/* Legend for comparison */}
          {showComparison && (
            <div className="flex items-center justify-center gap-5 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: selectedStewardObj.color }} />
                <span className="text-[9px] font-medium" style={{ color: '#a09888' }}>{selectedStewardObj.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: '#6b8f71', opacity: 0.5 }} />
                <span className="text-[9px] font-medium" style={{ color: '#a09888' }}>Team Avg</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 sa-animate-in"
        style={{ animationDelay: '0.14s' }}
      >
        {/* Overall Score */}
        <div className="sa-glass sa-card-hover card-stat rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${scoreCfg.color}20, ${scoreCfg.color}08)`,
                border: `1px solid ${scoreCfg.color}15`,
              }}
            >
              <Target size={16} style={{ color: scoreCfg.color }} />
            </div>
          </div>
          <div
            className="text-3xl font-bold tabular-nums"
            style={{ color: scoreCfg.color }}
          >
            {overallScore > 0 ? overallScore.toFixed(1) : '--'}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#a09888' }}>
            Overall Score
          </div>
          {overallScore > 0 && (
            <div
              className="text-[10px] font-semibold mt-2 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{
                background: `linear-gradient(135deg, ${scoreCfg.color}18, ${scoreCfg.color}08)`,
                color: scoreCfg.color,
                border: `1px solid ${scoreCfg.color}15`,
              }}
            >
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: scoreCfg.color }} />
              {scoreCfg.label}
            </div>
          )}
        </div>

        {/* Most Aligned */}
        <div className="sa-glass sa-card-hover card-stat rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(107, 143, 113, 0.2), rgba(107, 143, 113, 0.08))',
                border: '1px solid rgba(107, 143, 113, 0.15)',
              }}
            >
              <Flame size={16} style={{ color: '#6b8f71' }} />
            </div>
          </div>
          <div className="text-sm font-bold leading-snug min-h-[2.5rem] flex items-center" style={{ color: '#f0ebe4' }}>
            {highestAlignedIndex >= 0
              ? DIMENSION_LABELS[highestAlignedIndex]
              : '--'}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#a09888' }}>
            Most Aligned
          </div>
          {highestAlignedIndex >= 0 && (
            <div
              className="text-[11px] font-mono font-bold mt-2 px-2 py-0.5 rounded-full inline-block tabular-nums"
              style={{
                background: 'linear-gradient(135deg, rgba(107, 143, 113, 0.15), rgba(107, 143, 113, 0.05))',
                color: '#6b8f71',
                border: '1px solid rgba(107, 143, 113, 0.15)',
              }}
            >
              {questionAverages[highestAlignedIndex].toFixed(1)}/5
            </div>
          )}
        </div>

        {/* Least Aligned */}
        <div className="sa-glass sa-card-hover card-stat rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(224, 96, 96, 0.15), rgba(224, 96, 96, 0.05))',
                border: '1px solid rgba(224, 96, 96, 0.12)',
              }}
            >
              <AlertTriangle size={16} style={{ color: '#e06060' }} />
            </div>
          </div>
          <div className="text-sm font-bold leading-snug min-h-[2.5rem] flex items-center" style={{ color: '#f0ebe4' }}>
            {lowestAlignedIndex >= 0
              ? DIMENSION_LABELS[lowestAlignedIndex]
              : '--'}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#a09888' }}>
            Least Aligned
          </div>
          {lowestAlignedIndex >= 0 && (
            <div
              className="text-[11px] font-mono font-bold mt-2 px-2 py-0.5 rounded-full inline-block tabular-nums"
              style={{
                background: 'linear-gradient(135deg, rgba(224, 96, 96, 0.12), rgba(224, 96, 96, 0.04))',
                color: '#e06060',
                border: '1px solid rgba(224, 96, 96, 0.12)',
              }}
            >
              {questionAverages[lowestAlignedIndex].toFixed(1)}/5
            </div>
          )}
        </div>

        {/* Trend */}
        <div className="sa-glass sa-card-hover card-stat rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: trendDirection === 'up'
                  ? 'linear-gradient(135deg, rgba(107, 143, 113, 0.2), rgba(107, 143, 113, 0.08))'
                  : trendDirection === 'down'
                    ? 'linear-gradient(135deg, rgba(224, 96, 96, 0.15), rgba(224, 96, 96, 0.05))'
                    : 'linear-gradient(135deg, rgba(160, 152, 136, 0.15), rgba(160, 152, 136, 0.05))',
                border: `1px solid ${
                  trendDirection === 'up' ? 'rgba(107, 143, 113, 0.15)'
                    : trendDirection === 'down' ? 'rgba(224, 96, 96, 0.12)'
                      : 'rgba(160, 152, 136, 0.1)'
                }`,
              }}
            >
              {trendDirection === 'up' && <TrendingUp size={16} style={{ color: '#6b8f71' }} />}
              {trendDirection === 'down' && <TrendingDown size={16} style={{ color: '#e06060' }} />}
              {trendDirection === 'flat' && <Minus size={16} style={{ color: '#a09888' }} />}
            </div>
          </div>
          <div
            className="text-2xl font-bold"
            style={{
              color:
                trendDirection === 'up'
                  ? '#6b8f71'
                  : trendDirection === 'down'
                    ? '#e06060'
                    : '#a09888',
            }}
          >
            {trendDirection === 'up' ? 'Up' : trendDirection === 'down' ? 'Down' : 'Flat'}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#a09888' }}>
            Trend
          </div>
          <div className="text-[11px] mt-2" style={{ color: '#6b6358' }}>
            vs. previous week
          </div>
        </div>
      </div>

      {/* ── Individual vs Team Comparison ── */}
      <div className="sa-animate-in" style={{ animationDelay: '0.18s' }}>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
            }}
          >
            <RefreshCw size={12} style={{ color: '#8b5cf6' }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a09888' }}>
            Individual vs Team Average
          </span>
        </div>

        <div className="sa-glass card-premium rounded-2xl p-5">
          <div className="space-y-4">
            {STEWARDS.map((steward, si) => {
              const avg = stewardAverages[steward.id] ?? 0;
              const teamAvg = overallScore;
              const diff = avg - teamAvg;
              const barPercent = avg > 0 ? (avg / 5) * 100 : 0;
              const teamBarPercent = teamAvg > 0 ? (teamAvg / 5) * 100 : 0;

              return (
                <div
                  key={steward.id}
                  className="space-y-2 p-3 rounded-xl transition-all card-interactive"
                  style={{
                    background: `linear-gradient(135deg, ${steward.color}05, transparent)`,
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${steward.color}15`;
                    (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${steward.color}08, transparent)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${steward.color}05, transparent)`;
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                          color: '#0b0d14',
                          boxShadow: `0 2px 8px ${steward.color}30`,
                        }}
                      >
                        {steward.avatar[0]}
                      </div>
                      <div>
                        <span className="text-xs font-bold" style={{ color: '#f0ebe4' }}>{steward.name}</span>
                        <span className="text-[9px] ml-2" style={{ color: '#6b6358' }}>{steward.shortRole}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold tabular-nums" style={{ color: avg > 0 ? steward.color : '#6b6358' }}>
                        {avg > 0 ? avg.toFixed(1) : '--'}
                      </span>
                      {avg > 0 && teamAvg > 0 && (
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          style={{
                            background: diff >= 0
                              ? 'linear-gradient(135deg, rgba(107, 143, 113, 0.15), rgba(107, 143, 113, 0.05))'
                              : 'linear-gradient(135deg, rgba(224, 96, 96, 0.15), rgba(224, 96, 96, 0.05))',
                            color: diff >= 0 ? '#6b8f71' : '#e06060',
                            border: `1px solid ${diff >= 0 ? 'rgba(107, 143, 113, 0.15)' : 'rgba(224, 96, 96, 0.12)'}`,
                          }}
                        >
                          {diff >= 0 ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
                          {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-2.5 rounded-full overflow-hidden progress-bar-animated" style={{ backgroundColor: 'rgba(28, 34, 48, 0.8)' }}>
                    {/* Team avg marker */}
                    {teamAvg > 0 && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 z-10"
                        style={{
                          left: `${teamBarPercent}%`,
                          backgroundColor: '#a09888',
                          opacity: 0.5,
                        }}
                      />
                    )}
                    {/* Individual bar */}
                    <div
                      className="h-full rounded-full relative"
                      style={{
                        width: `${barPercent}%`,
                        background: `linear-gradient(90deg, ${steward.color}80, ${steward.color})`,
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: `0 0 8px ${steward.color}20`,
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                          backgroundSize: '200% 100%',
                          animation: 'sa-shimmer 4s ease-in-out infinite',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid rgba(212, 165, 116, 0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full" style={{ backgroundColor: '#a09888', opacity: 0.5 }} />
              <span className="text-[9px] font-medium" style={{ color: '#a09888' }}>Team Average ({overallScore > 0 ? overallScore.toFixed(1) : '--'})</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Score Submission ── */}
      <div className="sa-animate-in" style={{ animationDelay: '0.22s' }}>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(212, 165, 116, 0.05))',
            }}
          >
            <CheckCircle2 size={12} style={{ color: '#d4a574' }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a09888' }}>
            Submit Your Scores — Week of {getWeekLabel(currentWeekId)}
          </span>
        </div>

        <div className="sa-glass card-premium rounded-2xl p-6">
          {/* Steward Selector */}
          <div className="mb-6">
            <label className="text-[11px] font-semibold block mb-2.5 uppercase tracking-wider" style={{ color: '#a09888' }}>
              Submitting as:
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {STEWARDS.map((steward) => {
                const isSelected = selectedSteward === steward.id;
                const member = teamMembers.find((m) => m.id === steward.id);
                return (
                  <button
                    key={steward.id}
                    onClick={() => setSelectedSteward(steward.id)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all sa-card-hover"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${steward.color}18, ${steward.color}08)`
                        : 'rgba(28, 34, 48, 0.6)',
                      color: isSelected ? steward.color : '#a09888',
                      border: `1px solid ${isSelected ? `${steward.color}35` : 'rgba(30, 38, 56, 0.8)'}`,
                      boxShadow: isSelected ? `0 4px 16px ${steward.color}10` : 'none',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                        color: '#0b0d14',
                        boxShadow: isSelected ? `0 2px 8px ${steward.color}40` : `0 1px 4px ${steward.color}20`,
                      }}
                    >
                      {steward.avatar}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold">{steward.name}</div>
                      <div className="text-[10px]" style={{ color: '#6b6358' }}>{member?.shortRole ?? steward.shortRole}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-5">
            {QUESTIONS.map((question, qi) => {
              const selectedScore = currentScores[qi];
              const DimIcon = DIMENSION_ICONS[qi];
              return (
                <div
                  key={qi}
                  className="p-4 rounded-xl transition-all"
                  style={{
                    background: selectedScore
                      ? `linear-gradient(135deg, ${SCORE_COLORS[selectedScore].text}06, transparent)`
                      : 'rgba(28, 34, 48, 0.3)',
                    border: `1px solid ${selectedScore ? `${SCORE_COLORS[selectedScore].text}10` : 'rgba(30, 38, 56, 0.5)'}`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(212, 165, 116, 0.05))',
                        border: '1px solid rgba(212, 165, 116, 0.1)',
                      }}
                    >
                      <DimIcon size={13} style={{ color: '#d4a574' }} />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#d4a574' }}>
                        {DIMENSION_LABELS[qi]}
                      </span>
                      <div className="text-sm font-medium mt-0.5" style={{ color: '#f0ebe4' }}>{question}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-10">
                    {[1, 2, 3, 4, 5].map((score) => {
                      const isSelected = selectedScore === score;
                      const cfg = SCORE_COLORS[score];
                      return (
                        <button
                          key={score}
                          onClick={() => handleScoreChange(qi, score)}
                          disabled={submitted}
                          className="w-11 h-11 rounded-xl text-sm font-bold transition-all flex items-center justify-center"
                          style={{
                            background: isSelected
                              ? `linear-gradient(135deg, ${cfg.text}25, ${cfg.text}10)`
                              : 'rgba(28, 34, 48, 0.6)',
                            color: isSelected ? cfg.text : '#6b6358',
                            border: `1.5px solid ${isSelected ? cfg.text + '50' : 'rgba(30, 38, 56, 0.8)'}`,
                            opacity: submitted && !isSelected ? 0.3 : 1,
                            cursor: submitted ? 'default' : 'pointer',
                            boxShadow: isSelected ? `0 4px 16px ${cfg.text}20, 0 0 0 1px ${cfg.text}15` : 'none',
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          {score}
                        </button>
                      );
                    })}
                    {selectedScore && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full self-center ml-2 inline-flex items-center gap-1"
                        style={{
                          background: `linear-gradient(135deg, ${SCORE_COLORS[selectedScore].text}18, ${SCORE_COLORS[selectedScore].text}08)`,
                          color: SCORE_COLORS[selectedScore].text,
                          border: `1px solid ${SCORE_COLORS[selectedScore].text}15`,
                        }}
                      >
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: SCORE_COLORS[selectedScore].text }} />
                        {SCORE_COLORS[selectedScore].label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex items-center gap-3">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsScored}
                className="px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                style={{
                  background: allQuestionsScored
                    ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(139, 92, 246, 0.1))'
                    : 'rgba(28, 34, 48, 0.6)',
                  color: allQuestionsScored ? '#d4a574' : '#6b6358',
                  border: `1px solid ${allQuestionsScored ? 'rgba(212, 165, 116, 0.25)' : 'rgba(30, 38, 56, 0.8)'}`,
                  cursor: allQuestionsScored ? 'pointer' : 'not-allowed',
                  boxShadow: allQuestionsScored ? '0 4px 20px rgba(212, 165, 116, 0.1)' : 'none',
                }}
              >
                <CheckCircle2 size={15} />
                Submit Alignment Scores
              </button>
            ) : (
              <div
                className="flex items-center gap-2.5 text-sm px-4 py-2.5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(107, 143, 113, 0.15), rgba(107, 143, 113, 0.05))',
                  border: '1px solid rgba(107, 143, 113, 0.15)',
                }}
              >
                <CheckCircle2 size={16} style={{ color: '#6b8f71' }} />
                <span style={{ color: '#6b8f71' }} className="font-semibold">
                  Scores submitted for this week
                </span>
              </div>
            )}
            {showSubmitConfirm && (
              <span
                className="text-xs font-semibold sa-animate-in px-4 py-1.5 rounded-full inline-flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, rgba(107, 143, 113, 0.2), rgba(107, 143, 113, 0.05))',
                  color: '#6b8f71',
                  border: '1px solid rgba(107, 143, 113, 0.15)',
                }}
              >
                <CheckCircle2 size={12} />
                Saved successfully
              </span>
            )}
            {!submitted && !allQuestionsScored && (
              <span className="text-[11px] font-medium" style={{ color: '#a09888' }}>
                {QUESTIONS.length - Object.keys(currentScores).length} question{QUESTIONS.length - Object.keys(currentScores).length !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Team Alignment Heatmap ── */}
      <div className="sa-animate-in" style={{ animationDelay: '0.26s' }}>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(52, 211, 153, 0.05))',
            }}
          >
            <BarChart3 size={12} style={{ color: '#34d399' }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a09888' }}>
            Team Alignment Heatmap
          </span>
        </div>

        <div className="sa-glass rounded-2xl p-5 overflow-x-auto">
          <AlignmentHeatmap
            heatmapData={heatmapData}
            questionAverages={questionAverages}
            animated={heatmapMounted}
          />

          {/* Heatmap Legend */}
          <div
            className="flex items-center gap-4 pt-3 mt-3 flex-wrap"
            style={{ borderTop: '1px solid rgba(212, 165, 116, 0.08)' }}
          >
            <span className="text-[10px] font-semibold" style={{ color: '#a09888' }}>Legend:</span>
            {[5, 4, 3, 2, 1].map((score) => {
              const cfg = SCORE_COLORS[score];
              return (
                <div key={score} className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${cfg.text}25, ${cfg.text}10)`,
                      color: cfg.text,
                      border: `1px solid ${cfg.text}15`,
                    }}
                  >
                    {score}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: cfg.text }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Dimension Breakdown Cards ── */}
      <div className="sa-animate-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(232, 121, 160, 0.15), rgba(232, 121, 160, 0.05))',
            }}
          >
            <ChevronDown size={12} style={{ color: '#e879a0' }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a09888' }}>
            Dimension Breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIMENSION_LABELS.map((label, i) => {
            const stewardScoresForDim = STEWARDS.map((steward) => ({
              steward,
              score: currentWeek?.scores.find(
                (s) => s.stewardId === steward.id && s.questionIndex === i,
              )?.score ?? 0,
            }));

            return (
              <DimensionCard
                key={label}
                index={i}
                label={label}
                average={questionAverages[i]}
                stewardScores={stewardScoresForDim}
                animated={cardsMounted}
                delay={i * 100}
              />
            );
          })}
        </div>
      </div>

      {/* ── Action Items ── */}
      <div className="sa-animate-in" style={{ animationDelay: '0.34s' }}>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05))',
            }}
          >
            <Lightbulb size={12} style={{ color: '#f97316' }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a09888' }}>
            Action Items
          </span>
        </div>

        <ActionItems questionAverages={questionAverages} lowestIndex={lowestAlignedIndex} />
      </div>

      {/* ── Trend Chart ── */}
      <div className="sa-animate-in" style={{ animationDelay: '0.38s' }}>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(107, 143, 113, 0.15), rgba(107, 143, 113, 0.05))',
            }}
          >
            <TrendingUp size={12} style={{ color: '#6b8f71' }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a09888' }}>
            Weekly Average Alignment — Past {weeklyAverages.length} Weeks
          </span>
        </div>

        <div className="sa-glass rounded-2xl p-6">
          {weeklyAverages.length > 0 ? (
            <div>
              {/* Bar chart */}
              <div className="flex items-end gap-3 justify-between" style={{ height: maxBarHeight + 50 }}>
                {weeklyAverages.map((week, i) => {
                  const barHeight = week.average > 0 ? (week.average / maxAvg) * maxBarHeight : 4;
                  const cfg = overallScoreColor(week.average);
                  const isLatest = i === weeklyAverages.length - 1;

                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center flex-1 group"
                      style={{ maxWidth: 80 }}
                    >
                      <div
                        className="text-xs font-bold mb-1.5 tabular-nums transition-all"
                        style={{
                          color: week.average > 0 ? cfg.color : '#6b6358',
                          opacity: isLatest ? 1 : 0.8,
                        }}
                      >
                        {week.average > 0 ? week.average.toFixed(1) : '--'}
                      </div>
                      <div
                        className="w-full rounded-xl transition-all relative overflow-hidden"
                        style={{
                          height: barHeight,
                          background: week.average > 0
                            ? `linear-gradient(to top, ${cfg.color}25, ${cfg.color}50)`
                            : 'rgba(28, 34, 48, 0.6)',
                          border: isLatest ? `1.5px solid ${cfg.color}60` : '1px solid transparent',
                          boxShadow: isLatest && week.average > 0
                            ? `0 -4px 20px ${cfg.color}20, inset 0 1px 0 ${cfg.color}15`
                            : 'none',
                          transformOrigin: 'bottom',
                          animation: `sa-barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s forwards`,
                        }}
                      >
                        {/* Shimmer on latest */}
                        {isLatest && week.average > 0 && (
                          <div
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)',
                            }}
                          />
                        )}
                      </div>
                      <div
                        className="text-[10px] mt-2.5 font-medium text-center"
                        style={{
                          color: isLatest ? '#d4a574' : '#6b6358',
                        }}
                      >
                        {week.weekLabel}
                      </div>
                      {isLatest && (
                        <div
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5"
                          style={{
                            background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(212, 165, 116, 0.05))',
                            color: '#d4a574',
                            border: '1px solid rgba(212, 165, 116, 0.1)',
                          }}
                        >
                          Current
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reference lines */}
              <div className="mt-5 pt-3 flex items-center gap-5" style={{ borderTop: '1px solid rgba(212, 165, 116, 0.08)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #6b8f71, #34d399)' }} />
                  <span className="text-[10px] font-medium" style={{ color: '#a09888' }}>4.0+ Strong</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #d4a574, #f97316)' }} />
                  <span className="text-[10px] font-medium" style={{ color: '#a09888' }}>3.0-4.0 Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #e06060, #f43e5e)' }} />
                  <span className="text-[10px] font-medium" style={{ color: '#a09888' }}>&lt;3.0 Needs attention</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm py-10" style={{ color: '#a09888' }}>
              No trend data available yet. Submit scores weekly to build the trend.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
