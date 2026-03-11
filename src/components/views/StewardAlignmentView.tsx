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
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 110;
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

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <defs>
        <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e2638" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#131720" stopOpacity="0.8" />
        </radialGradient>
        <filter id="radarGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx={cx} cy={cy} r={maxR + 8} fill="url(#radarBg)" />

      {/* Concentric level rings */}
      {Array.from({ length: levels }, (_, i) => {
        const r = ((i + 1) / levels) * maxR;
        return (
          <polygon
            key={`ring-${i}`}
            points={Array.from({ length: dims }, (_, d) => {
              const angle = startAngle + d * angleStep;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none"
            stroke="#1e2638"
            strokeWidth={i === levels - 1 ? 1.5 : 0.8}
            strokeOpacity={i === levels - 1 ? 0.6 : 0.3}
          />
        );
      })}

      {/* Axis lines */}
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
            stroke="#1e2638"
            strokeWidth={0.8}
            strokeOpacity={0.5}
          />
        );
      })}

      {/* Team average polygon (shown behind individual) */}
      {showComparison && (
        <polygon
          points={makePolygonPoints(teamAvgScores)}
          fill="rgba(107, 143, 113, 0.08)"
          stroke="#6b8f71"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeOpacity={0.5}
          style={{
            opacity: animated ? 1 : 0,
            transition: 'opacity 0.8s ease-out 0.3s',
          }}
        />
      )}

      {/* Individual/overall score polygon */}
      <polygon
        points={makePolygonPoints(dimensionScores)}
        fill={`${selectedStewardColor}18`}
        stroke={selectedStewardColor}
        strokeWidth={2}
        strokeLinejoin="round"
        filter="url(#radarGlow)"
        style={{
          opacity: animated ? 1 : 0,
          transition: 'opacity 0.6s ease-out',
          transformOrigin: `${cx}px ${cy}px`,
          transform: animated ? 'scale(1)' : 'scale(0.3)',
          transitionProperty: 'opacity, transform',
          transitionDuration: '0.8s',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Score dots on individual polygon */}
      {dimensionScores.map((v, i) => {
        const pt = getPoint(i, v);
        return (
          <g key={`dot-${i}`}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={5}
              fill={selectedStewardColor}
              stroke="#131720"
              strokeWidth={2}
              style={{
                opacity: animated ? 1 : 0,
                transition: `opacity 0.4s ease-out ${0.2 + i * 0.1}s`,
              }}
            />
            <circle
              cx={pt.x}
              cy={pt.y}
              r={8}
              fill={selectedStewardColor}
              opacity={animated ? 0.15 : 0}
              style={{
                transition: `opacity 0.4s ease-out ${0.2 + i * 0.1}s`,
              }}
            />
          </g>
        );
      })}

      {/* Dimension labels */}
      {DIMENSION_LABELS.map((label, i) => {
        const angle = startAngle + i * angleStep;
        const labelR = maxR + 24;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#a09888"
            fontSize={10}
            fontWeight={600}
          >
            {label}
          </text>
        );
      })}

      {/* Level labels along first axis */}
      {[1, 2, 3, 4, 5].map((lv) => {
        const r = (lv / 5) * maxR;
        return (
          <text
            key={`lv-${lv}`}
            x={cx + 6}
            y={cy - r + 3}
            fill="#6b6358"
            fontSize={8}
            fontWeight={500}
          >
            {lv}
          </text>
        );
      })}
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
  const progress = maxScore > 0 ? score / maxScore : 0;
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - animatedProgress);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
            <filter id="ringGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e2638"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            filter="url(#ringGlow)"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
          {/* Tick marks */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = -90 + (i / 5) * 360;
            const rad = (angle * Math.PI) / 180;
            const tickInner = radius - strokeWidth / 2 - 2;
            const tickOuter = radius + strokeWidth / 2 + 2;
            return (
              <line
                key={`tick-${i}`}
                x1={size / 2 + tickInner * Math.cos(rad)}
                y1={size / 2 + tickInner * Math.sin(rad)}
                x2={size / 2 + tickOuter * Math.cos(rad)}
                y2={size / 2 + tickOuter * Math.sin(rad)}
                stroke="#1e2638"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {score > 0 ? score.toFixed(1) : '--'}
          </span>
          <span className="text-[10px] text-text-muted font-medium">/ {maxScore}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/* ─── Team Alignment Heatmap (visual grid) ─── */

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
      <div className="p-8 text-center text-text-muted text-sm">
        No alignment data for this week yet.
      </div>
    );
  }

  return (
    <div className="grid gap-1.5">
      {/* Header row */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: '120px repeat(5, 1fr) 60px' }}>
        <div className="text-[10px] font-semibold text-text-muted p-2">Steward</div>
        {DIMENSION_LABELS.map((dim, i) => (
          <div key={dim} className="text-[9px] font-medium text-text-muted p-1.5 text-center">
            {dim}
          </div>
        ))}
        <div className="text-[10px] font-semibold text-text-muted p-2 text-center">Avg</div>
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
            className="grid gap-1.5 items-center"
            style={{
              gridTemplateColumns: '120px repeat(5, 1fr) 60px',
              opacity: animated ? 1 : 0,
              transform: animated ? 'translateY(0)' : 'translateY(8px)',
              transition: `all 0.4s ease-out ${si * 0.1}s`,
            }}
          >
            <div className="flex items-center gap-2 p-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                  color: '#0b0d14',
                }}
              >
                {steward.avatar}
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary">{steward.name}</div>
                <div className="text-[9px] text-text-muted">{steward.shortRole}</div>
              </div>
            </div>
            {QUESTIONS.map((_, qi) => {
              const score = scores[qi] || 0;
              const cfg = SCORE_COLORS[score];
              const intensity = score / 5;
              return (
                <div
                  key={qi}
                  className="flex items-center justify-center rounded-lg p-2 transition-all"
                  style={{
                    backgroundColor: score > 0 ? cfg.bg : '#1c2230',
                    boxShadow: score >= 4 ? `0 0 12px ${cfg.text}15` : 'none',
                    minHeight: 40,
                  }}
                >
                  <span
                    className="text-sm font-bold"
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
                className="text-sm font-bold"
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
        className="grid gap-1.5 items-center mt-1 pt-2"
        style={{
          gridTemplateColumns: '120px repeat(5, 1fr) 60px',
          borderTop: '1px solid #1e2638',
        }}
      >
        <div className="text-[10px] font-semibold text-text-muted p-1.5 uppercase tracking-wider">Average</div>
        {questionAverages.map((avg, qi) => {
          const cfg = overallScoreColor(avg);
          return (
            <div key={qi} className="text-center p-1.5">
              <span
                className="text-sm font-bold"
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

    // Find biggest gap between any two stewards
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
    high: { color: '#f43e5e', bg: 'rgba(244, 63, 94, 0.12)', icon: AlertTriangle },
    medium: { color: '#d4a574', bg: 'rgba(212, 165, 116, 0.12)', icon: Lightbulb },
    low: { color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.12)', icon: CheckCircle2 },
  };

  if (actions.length === 0) return null;

  return (
    <div className="space-y-2">
      {actions.map((action, i) => {
        const cfg = priorityConfig[action.priority];
        const Icon = cfg.icon;
        return (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl border transition-all"
            style={{
              backgroundColor: '#131720',
              borderColor: `${cfg.color}25`,
              borderLeftWidth: 3,
              borderLeftColor: cfg.color,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: cfg.bg }}
            >
              <Icon size={14} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-text-primary font-medium">{action.text}</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  {action.priority}
                </span>
                <span className="text-[10px] text-text-muted">{action.dimension}</span>
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

  return (
    <div
      className="glow-card rounded-xl border p-4 transition-all"
      style={{
        backgroundColor: '#131720',
        borderColor: '#1e2638',
        opacity: animated ? 1 : 0,
        transform: animated ? 'translateY(0)' : 'translateY(12px)',
        transition: `all 0.5s ease-out ${delay}ms`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${cfg.color}18` }}
          >
            <Icon size={16} style={{ color: cfg.color }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">{label}</div>
            <div className="text-[10px] text-text-muted">
              {QUESTIONS[index].length > 35 ? QUESTIONS[index].slice(0, 32) + '...' : QUESTIONS[index]}
            </div>
          </div>
        </div>
        <span className="text-xl font-bold" style={{ color: average > 0 ? cfg.color : '#6b6358' }}>
          {average > 0 ? average.toFixed(1) : '--'}
        </span>
      </div>

      {/* Main progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden mb-3"
        style={{ backgroundColor: '#1c2230' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: barAnimated ? `${(average / 5) * 100}%` : '0%',
            background: average > 0 ? `linear-gradient(90deg, ${cfg.color}cc, ${cfg.color})` : 'transparent',
            transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: average > 0 ? `0 0 8px ${cfg.color}30` : 'none',
          }}
        />
      </div>

      {/* Individual steward bars */}
      <div className="space-y-1.5">
        {stewardScores.map(({ steward, score }) => (
          <div key={steward.id} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                color: '#0b0d14',
              }}
            >
              {steward.avatar[0]}
            </div>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1c2230' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: barAnimated ? `${(score / 5) * 100}%` : '0%',
                  backgroundColor: steward.color,
                  opacity: 0.7,
                  transition: 'width 0.6s ease-out',
                }}
              />
            </div>
            <span className="text-[10px] font-mono w-4 text-right" style={{ color: score > 0 ? steward.color : '#6b6358' }}>
              {score > 0 ? score : '-'}
            </span>
          </div>
        ))}
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

  // Per-steward averages (for individual vs team comparison)
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
  const maxBarHeight = 120;
  const maxAvg = 5;
  const scoreCfg = overallScoreColor(overallScore);

  return (
    <div className="space-y-6">
      {/* Scoped styles for animations */}
      <style>{`
        @keyframes alignPulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.15); }
          50% { box-shadow: 0 0 0 8px rgba(212, 165, 116, 0); }
        }
        @keyframes alignSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .align-animate-in {
          animation: alignSlideUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="align-animate-in">
        <div className="flex items-center gap-3 mb-1">
          <Users size={24} className="text-accent" />
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Steward Alignment</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm">
          Weekly alignment pulse between core stewards. Track coherence across priorities, vision, and energy.
        </p>
      </div>

      {/* ── Animated Ring Score + Radar Chart Row ── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 align-animate-in"
        style={{ animationDelay: '0.08s' }}
      >
        {/* Animated Ring Score */}
        <div
          className="glow-card rounded-xl border p-6 flex flex-col items-center justify-center"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            Overall Alignment Score
          </div>
          <AnimatedRingScore
            score={overallScore}
            maxScore={5}
            color={scoreCfg.color}
            label={overallScore > 0 ? scoreCfg.label : 'No Data'}
          />
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              {trendDirection === 'up' && <TrendingUp size={14} style={{ color: '#6b8f71' }} />}
              {trendDirection === 'down' && <TrendingDown size={14} style={{ color: '#e06060' }} />}
              {trendDirection === 'flat' && <Minus size={14} style={{ color: '#a09888' }} />}
              <span
                className="text-xs font-medium"
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
            <span className="text-[10px] text-text-muted">vs. previous week</span>
          </div>
        </div>

        {/* Radar / Spider Chart */}
        <div
          className="glow-card rounded-xl border p-6"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Dimension Radar
            </div>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-[10px] font-medium px-2 py-1 rounded-lg transition-all"
              style={{
                backgroundColor: showComparison ? 'rgba(107, 143, 113, 0.12)' : '#1c2230',
                color: showComparison ? '#6b8f71' : '#6b6358',
                border: `1px solid ${showComparison ? 'rgba(107, 143, 113, 0.25)' : '#1e2638'}`,
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
          <div className="flex items-center justify-center gap-2 mt-3">
            {STEWARDS.map((steward) => {
              const isActive = selectedSteward === steward.id;
              return (
                <button
                  key={steward.id}
                  onClick={() => setSelectedSteward(steward.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? `${steward.color}18` : 'transparent',
                    color: isActive ? steward.color : '#6b6358',
                    border: `1px solid ${isActive ? `${steward.color}35` : 'transparent'}`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                      color: '#0b0d14',
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
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: selectedStewardObj.color }} />
                <span className="text-[9px] text-text-muted">{selectedStewardObj.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: '#6b8f71', opacity: 0.5 }} />
                <span className="text-[9px] text-text-muted">Team Avg</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 align-animate-in"
        style={{ animationDelay: '0.12s' }}
      >
        {/* Overall Score */}
        <div
          className="glow-card rounded-xl p-4 border"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: scoreCfg.bg }}
            >
              <Target size={16} style={{ color: scoreCfg.color }} />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: scoreCfg.color }}>
            {overallScore > 0 ? overallScore.toFixed(1) : '--'}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">
            Overall Score
          </div>
          {overallScore > 0 && (
            <div
              className="text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full inline-block"
              style={{ backgroundColor: scoreCfg.bg, color: scoreCfg.color }}
            >
              {scoreCfg.label}
            </div>
          )}
        </div>

        {/* Most Aligned */}
        <div
          className="glow-card rounded-xl p-4 border"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(107, 143, 113, 0.15)' }}
            >
              <Flame size={16} style={{ color: '#6b8f71' }} />
            </div>
          </div>
          <div className="text-sm font-semibold text-text-primary leading-snug min-h-[2.5rem] flex items-center">
            {highestAlignedIndex >= 0
              ? DIMENSION_LABELS[highestAlignedIndex]
              : '--'}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">
            Most Aligned
          </div>
          {highestAlignedIndex >= 0 && (
            <div className="text-[11px] font-mono mt-1" style={{ color: '#6b8f71' }}>
              {questionAverages[highestAlignedIndex].toFixed(1)}/5
            </div>
          )}
        </div>

        {/* Least Aligned */}
        <div
          className="glow-card rounded-xl p-4 border"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(224, 96, 96, 0.12)' }}
            >
              <AlertTriangle size={16} style={{ color: '#e06060' }} />
            </div>
          </div>
          <div className="text-sm font-semibold text-text-primary leading-snug min-h-[2.5rem] flex items-center">
            {lowestAlignedIndex >= 0
              ? DIMENSION_LABELS[lowestAlignedIndex]
              : '--'}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">
            Least Aligned
          </div>
          {lowestAlignedIndex >= 0 && (
            <div className="text-[11px] font-mono mt-1" style={{ color: '#e06060' }}>
              {questionAverages[lowestAlignedIndex].toFixed(1)}/5
            </div>
          )}
        </div>

        {/* Trend */}
        <div
          className="glow-card rounded-xl p-4 border"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor:
                  trendDirection === 'up'
                    ? 'rgba(107, 143, 113, 0.15)'
                    : trendDirection === 'down'
                      ? 'rgba(224, 96, 96, 0.12)'
                      : 'rgba(160, 152, 136, 0.12)',
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
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">
            Trend
          </div>
          <div className="text-[11px] text-text-muted mt-1">
            vs. previous week
          </div>
        </div>
      </div>

      {/* ── Individual vs Team Comparison ── */}
      <div className="align-animate-in" style={{ animationDelay: '0.16s' }}>
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Individual vs Team Average
          </span>
        </div>

        <div
          className="glow-card rounded-xl border p-5"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="space-y-3">
            {STEWARDS.map((steward) => {
              const avg = stewardAverages[steward.id] ?? 0;
              const teamAvg = overallScore;
              const diff = avg - teamAvg;
              const barPercent = avg > 0 ? (avg / 5) * 100 : 0;
              const teamBarPercent = teamAvg > 0 ? (teamAvg / 5) * 100 : 0;

              return (
                <div key={steward.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                          color: '#0b0d14',
                        }}
                      >
                        {steward.avatar[0]}
                      </div>
                      <span className="text-xs font-semibold text-text-primary">{steward.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: avg > 0 ? steward.color : '#6b6358' }}>
                        {avg > 0 ? avg.toFixed(1) : '--'}
                      </span>
                      {avg > 0 && teamAvg > 0 && (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: diff >= 0 ? 'rgba(107, 143, 113, 0.12)' : 'rgba(224, 96, 96, 0.12)',
                            color: diff >= 0 ? '#6b8f71' : '#e06060',
                          }}
                        >
                          {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1c2230' }}>
                    {/* Team avg marker */}
                    {teamAvg > 0 && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5"
                        style={{
                          left: `${teamBarPercent}%`,
                          backgroundColor: '#a09888',
                          opacity: 0.5,
                          zIndex: 2,
                        }}
                      />
                    )}
                    {/* Individual bar */}
                    <div
                      className="h-full rounded-full relative z-1"
                      style={{
                        width: `${barPercent}%`,
                        backgroundColor: steward.color,
                        opacity: 0.6,
                        transition: 'width 0.6s ease-out',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid #1e2638' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 rounded-full" style={{ backgroundColor: '#a09888', opacity: 0.5 }} />
              <span className="text-[9px] text-text-muted">Team Average ({overallScore > 0 ? overallScore.toFixed(1) : '--'})</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Score Submission ── */}
      <div className="align-animate-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Submit Your Scores — Week of {getWeekLabel(currentWeekId)}
          </span>
        </div>

        <div
          className="glow-card rounded-xl border p-5"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          {/* Steward Selector */}
          <div className="mb-5">
            <label className="text-[11px] text-text-muted font-medium block mb-2">
              Submitting as:
            </label>
            <div className="flex gap-2 flex-wrap">
              {STEWARDS.map((steward) => {
                const isSelected = selectedSteward === steward.id;
                const member = teamMembers.find((m) => m.id === steward.id);
                return (
                  <button
                    key={steward.id}
                    onClick={() => setSelectedSteward(steward.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: isSelected ? `${steward.color}18` : '#1c2230',
                      color: isSelected ? steward.color : '#a09888',
                      border: `1px solid ${isSelected ? `${steward.color}40` : '#1e2638'}`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                        color: '#0b0d14',
                      }}
                    >
                      {steward.avatar}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold">{steward.name}</div>
                      <div className="text-[10px] text-text-muted">{member?.shortRole ?? steward.shortRole}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {QUESTIONS.map((question, qi) => {
              const selectedScore = currentScores[qi];
              return (
                <div key={qi}>
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: 'rgba(212, 165, 116, 0.12)', color: '#d4a574' }}
                    >
                      {qi + 1}
                    </span>
                    <span className="text-sm text-text-primary font-medium">{question}</span>
                  </div>
                  <div className="flex gap-2 ml-7">
                    {[1, 2, 3, 4, 5].map((score) => {
                      const isSelected = selectedScore === score;
                      const cfg = SCORE_COLORS[score];
                      return (
                        <button
                          key={score}
                          onClick={() => handleScoreChange(qi, score)}
                          disabled={submitted}
                          className="w-10 h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center"
                          style={{
                            backgroundColor: isSelected ? cfg.bg : '#1c2230',
                            color: isSelected ? cfg.text : '#6b6358',
                            border: `1.5px solid ${isSelected ? cfg.text + '60' : '#1e2638'}`,
                            opacity: submitted && !isSelected ? 0.4 : 1,
                            cursor: submitted ? 'default' : 'pointer',
                            boxShadow: isSelected ? `0 0 12px ${cfg.text}20` : 'none',
                          }}
                        >
                          {score}
                        </button>
                      );
                    })}
                    {selectedScore && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full self-center ml-2"
                        style={{
                          backgroundColor: SCORE_COLORS[selectedScore].bg,
                          color: SCORE_COLORS[selectedScore].text,
                        }}
                      >
                        {SCORE_COLORS[selectedScore].label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-5 flex items-center gap-3">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsScored}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                style={{
                  backgroundColor: allQuestionsScored ? 'rgba(212, 165, 116, 0.15)' : '#1c2230',
                  color: allQuestionsScored ? '#d4a574' : '#6b6358',
                  border: `1px solid ${allQuestionsScored ? 'rgba(212, 165, 116, 0.3)' : '#1e2638'}`,
                  cursor: allQuestionsScored ? 'pointer' : 'not-allowed',
                }}
              >
                <CheckCircle2 size={15} />
                Submit Alignment Scores
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} style={{ color: '#6b8f71' }} />
                <span style={{ color: '#6b8f71' }} className="font-medium">
                  Scores submitted for this week
                </span>
              </div>
            )}
            {showSubmitConfirm && (
              <span
                className="text-xs font-medium align-animate-in px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(107, 143, 113, 0.15)', color: '#6b8f71' }}
              >
                Saved successfully
              </span>
            )}
            {!submitted && !allQuestionsScored && (
              <span className="text-[11px] text-text-muted">
                {QUESTIONS.length - Object.keys(currentScores).length} question{QUESTIONS.length - Object.keys(currentScores).length !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Team Alignment Heatmap ── */}
      <div className="align-animate-in" style={{ animationDelay: '0.24s' }}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Team Alignment Heatmap
          </span>
        </div>

        <div
          className="glow-card rounded-xl border p-4 overflow-x-auto"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <AlignmentHeatmap
            heatmapData={heatmapData}
            questionAverages={questionAverages}
            animated={heatmapMounted}
          />

          {/* Heatmap Legend */}
          <div
            className="flex items-center gap-4 pt-3 mt-3 flex-wrap"
            style={{ borderTop: '1px solid #1e2638' }}
          >
            <span className="text-[10px] text-text-muted font-medium">Legend:</span>
            {[5, 4, 3, 2, 1].map((score) => {
              const cfg = SCORE_COLORS[score];
              return (
                <div key={score} className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: cfg.bg, color: cfg.text }}
                  >
                    {score}
                  </div>
                  <span className="text-[10px]" style={{ color: cfg.text }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Dimension Breakdown Cards ── */}
      <div className="align-animate-in" style={{ animationDelay: '0.28s' }}>
        <div className="flex items-center gap-2 mb-3">
          <ChevronDown size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Dimension Breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* ── Action Items for Improving Alignment ── */}
      <div className="align-animate-in" style={{ animationDelay: '0.32s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Action Items
          </span>
        </div>

        <ActionItems questionAverages={questionAverages} lowestIndex={lowestAlignedIndex} />
      </div>

      {/* ── Trend Chart ── */}
      <div className="align-animate-in" style={{ animationDelay: '0.36s' }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Weekly Average Alignment — Past {weeklyAverages.length} Weeks
          </span>
        </div>

        <div
          className="glow-card rounded-xl border p-5"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          {weeklyAverages.length > 0 ? (
            <div>
              {/* Bar chart */}
              <div className="flex items-end gap-3 justify-between" style={{ height: maxBarHeight + 40 }}>
                {weeklyAverages.map((week, i) => {
                  const barHeight = week.average > 0 ? (week.average / maxAvg) * maxBarHeight : 4;
                  const cfg = overallScoreColor(week.average);
                  const isLatest = i === weeklyAverages.length - 1;

                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center flex-1"
                      style={{ maxWidth: 80 }}
                    >
                      <div
                        className="text-xs font-bold mb-1"
                        style={{ color: week.average > 0 ? cfg.color : '#6b6358' }}
                      >
                        {week.average > 0 ? week.average.toFixed(1) : '--'}
                      </div>
                      <div
                        className="w-full rounded-t-lg transition-all relative"
                        style={{
                          height: barHeight,
                          backgroundColor: week.average > 0 ? `${cfg.color}30` : '#1c2230',
                          borderLeft: isLatest ? `2px solid ${cfg.color}` : 'none',
                          borderRight: isLatest ? `2px solid ${cfg.color}` : 'none',
                          borderTop: isLatest ? `2px solid ${cfg.color}` : 'none',
                          boxShadow:
                            isLatest && week.average > 0
                              ? `0 -4px 16px ${cfg.color}25`
                              : 'none',
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: week.average > 0
                              ? `linear-gradient(to top, ${cfg.color}20, ${cfg.color}40)`
                              : 'transparent',
                          }}
                        />
                      </div>
                      <div
                        className="text-[10px] mt-2 font-medium text-center"
                        style={{
                          color: isLatest ? '#d4a574' : '#6b6358',
                        }}
                      >
                        {week.weekLabel}
                      </div>
                      {isLatest && (
                        <div
                          className="text-[9px] font-semibold uppercase tracking-wider"
                          style={{ color: '#d4a574' }}
                        >
                          Current
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reference lines */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: '#6b8f71' }} />
                  <span className="text-[10px] text-text-muted">4.0+ Strong</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: '#d4a574' }} />
                  <span className="text-[10px] text-text-muted">3.0-4.0 Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: '#e06060' }} />
                  <span className="text-[10px] text-text-muted">&lt;3.0 Needs attention</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-text-muted text-sm py-8">
              No trend data available yet. Submit scores weekly to build the trend.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
