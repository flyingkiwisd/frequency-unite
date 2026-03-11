'use client';

import { useState, useEffect, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Gauge,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Layers,
  Zap,
  Shield,
  Clock,
  Heart,
  Activity,
} from 'lucide-react';

/* ================================================================
   Constants & Data
   ================================================================ */
const CURRENT_BALANCE = 385000;
const MONTHLY_BURN = 22000;
const MONTHLY_REVENUE = 78000;
const NET_MONTHLY = MONTHLY_REVENUE - MONTHLY_BURN;
const RUNWAY_MONTHS = CURRENT_BALANCE / MONTHLY_BURN;

// Revenue vs Plan (last 6 months)
const revenueVsPlan = [
  { month: 'Oct', actual: 62000, plan: 60000 },
  { month: 'Nov', actual: 65000, plan: 65000 },
  { month: 'Dec', actual: 70000, plan: 68000 },
  { month: 'Jan', actual: 74000, plan: 72000 },
  { month: 'Feb', actual: 76000, plan: 75000 },
  { month: 'Mar', actual: 78000, plan: 78000 },
];

const MAX_REVENUE = Math.max(
  ...revenueVsPlan.map((d) => Math.max(d.actual, d.plan)),
) * 1.15;

// Scenario Modeling
const scenarios = [
  {
    name: 'Base Case',
    runway: '17.5 months',
    runwayNum: 17.5,
    revenue: '$78K/mo',
    revenueNum: 78000,
    burn: '$22K/mo',
    burnNum: 22000,
    description: 'Current trajectory maintained. Stable membership, steady event revenue.',
    color: '#6b8f71',
    probability: '60%',
  },
  {
    name: 'Upside',
    runway: '24+ months',
    runwayNum: 24,
    revenue: '$95K/mo',
    revenueNum: 95000,
    burn: '$24K/mo',
    burnNum: 24000,
    description: 'Blue Spirit sells out + 30 new members onboarded. DAF admin fees scale.',
    color: '#8b5cf6',
    probability: '25%',
  },
  {
    name: 'Downside',
    runway: '11 months',
    runwayNum: 11,
    revenue: '$55K/mo',
    revenueNum: 55000,
    burn: '$22K/mo',
    burnNum: 22000,
    description: 'Member churn increases to 15%. Blue Spirit undersells at 60% capacity.',
    color: '#e06060',
    probability: '15%',
  },
];

// Revenue Breakdown
const revenueBreakdown = [
  { label: 'Memberships', amount: 58000, color: '#d4a574', pct: 74 },
  { label: 'Events', amount: 15000, color: '#8b5cf6', pct: 19 },
  { label: 'DAF Admin Fees', amount: 5000, color: '#6b8f71', pct: 7 },
];

// Key Assumptions
const assumptions = [
  { label: 'Active members', value: '~65', trend: 'stable' as const },
  { label: 'Avg membership revenue', value: '$1,290/mo', trend: 'up' as const },
  { label: 'Monthly member churn', value: '~3%', trend: 'stable' as const },
  { label: 'Event revenue (annualized)', value: '$180K', trend: 'up' as const },
  { label: 'DAF AUM growing', value: '$85K committed', trend: 'up' as const },
  { label: 'Headcount', value: '3 core + fractional', trend: 'stable' as const },
];

// Break-even metrics
const breakEvenTarget = 22000;
const currentMonthlyNet = MONTHLY_REVENUE - MONTHLY_BURN;
const breakEvenPct = Math.min((MONTHLY_REVENUE / (MONTHLY_REVENUE + MONTHLY_BURN)) * 100, 100);

// 12-month projected cash data for line chart
const MINIMUM_THRESHOLD = 100000;
const projectedCash = (() => {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const baseData: { month: string; base: number; optimistic: number; conservative: number }[] = [];
  let baseBal = CURRENT_BALANCE;
  let optBal = CURRENT_BALANCE;
  let conBal = CURRENT_BALANCE;

  for (let i = 0; i < 12; i++) {
    // Base case: steady net monthly
    baseBal += NET_MONTHLY;
    // Optimistic: revenue grows 3% each month
    optBal += (95000 - 24000) + i * 1500;
    // Conservative: revenue declines, burn stays
    conBal += (55000 - 22000) - i * 800;

    baseData.push({
      month: months[i],
      base: Math.max(baseBal, 0),
      optimistic: Math.max(optBal, 0),
      conservative: Math.max(conBal, 0),
    });
  }
  return baseData;
})();

// KPI sparkline data
const balanceSparkline = [310, 325, 340, 355, 370, 385];
const burnSparkline = [21, 23, 24, 26, 22, 22];
const revenueSparkline = [62, 65, 70, 74, 76, 78];
const runwaySparkline = [14.8, 14.1, 14.2, 13.7, 16.8, 17.5];

/* ================================================================
   Helpers
   ================================================================ */
const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n}`;

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

const runwayColor = (months: number) => {
  if (months > 12) return '#6b8f71';
  if (months >= 6) return '#e8b44c';
  return '#e06060';
};

const runwayLabel = (months: number) => {
  if (months > 12) return 'Healthy';
  if (months >= 6) return 'Caution';
  return 'Critical';
};

/* ================================================================
   Animated Counter Component
   ================================================================ */
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 2000;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Eased progress for dramatic countdown feel
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);

  return (
    <span>
      {prefix}{target >= 100 ? Math.round(value).toLocaleString() : value.toFixed(1)}{suffix}
    </span>
  );
}

/* ================================================================
   Health Indicator Card
   ================================================================ */
function HealthCard({
  label,
  value,
  icon: Icon,
  iconColor,
  sparkData,
  trendLabel,
  trendDirection,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  sparkData: number[];
  trendLabel: string;
  trendDirection: 'up' | 'down' | 'stable';
  delay: number;
}) {
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimProgress(1), delay * 1000 + 300);
    return () => clearTimeout(timer);
  }, [delay]);

  const max = Math.max(...sparkData);
  const min = Math.min(...sparkData);
  const range = max - min || 1;

  // Build SVG sparkline path
  const sparkW = 80;
  const sparkH = 32;
  const points = sparkData.map((v, i) => {
    const x = (i / (sparkData.length - 1)) * sparkW;
    const y = sparkH - ((v - min) / range) * sparkH * 0.8 - sparkH * 0.1;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${sparkW},${sparkH} L 0,${sparkH} Z`;

  return (
    <div
      className="animate-fade-in"
      style={{
        animationDelay: `${delay}s`,
        opacity: 0,
        backgroundColor: '#131720',
        border: '1px solid #1e2638',
        borderRadius: 16,
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${iconColor}80, transparent)`,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#6b6358',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: `${iconColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#f0ebe4',
          lineHeight: 1,
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>

      {/* SVG Sparkline */}
      <svg
        width={sparkW}
        height={sparkH}
        viewBox={`0 0 ${sparkW} ${sparkH}`}
        style={{ marginBottom: 8, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`sparkGrad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={iconColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={iconColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={areaPath}
          fill={`url(#sparkGrad-${label.replace(/\s/g, '')})`}
          style={{
            transition: 'all 1s ease-out',
            opacity: animProgress,
          }}
        />
        <path
          d={linePath}
          fill="none"
          stroke={iconColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'all 1s ease-out',
            opacity: animProgress,
          }}
        />
        {/* Endpoint dot */}
        {sparkData.length > 0 && (
          <circle
            cx={sparkW}
            cy={sparkH - ((sparkData[sparkData.length - 1] - min) / range) * sparkH * 0.8 - sparkH * 0.1}
            r={3}
            fill={iconColor}
            style={{
              transition: 'all 1s ease-out',
              opacity: animProgress,
            }}
          />
        )}
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {trendDirection === 'up' && <TrendingUp size={12} style={{ color: '#6b8f71' }} />}
        {trendDirection === 'down' && <TrendingDown size={12} style={{ color: '#6b8f71' }} />}
        {trendDirection === 'stable' && <ArrowRight size={12} style={{ color: '#a09888' }} />}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: trendDirection === 'stable' ? '#a09888' : '#6b8f71',
          }}
        >
          {trendLabel}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   Dramatic SVG Line Chart with Danger Zone
   ================================================================ */
function ProjectedCashChart({ activeScenario }: { activeScenario: number }) {
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    setAnimProgress(0);
    const timer = setTimeout(() => setAnimProgress(1), 100);
    return () => clearTimeout(timer);
  }, [activeScenario]);

  const chartW = 720;
  const chartH = 320;
  const padLeft = 65;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;

  // Calculate bounds
  const allValues = projectedCash.flatMap((d) => [d.base, d.optimistic, d.conservative]);
  const maxVal = Math.max(...allValues, CURRENT_BALANCE) * 1.1;
  const minVal = 0;
  const valRange = maxVal - minVal;

  const toX = (i: number) => padLeft + (i / (projectedCash.length - 1)) * plotW;
  const toY = (val: number) => padTop + plotH - ((val - minVal) / valRange) * plotH;

  // Build paths
  const buildPath = (key: 'base' | 'optimistic' | 'conservative') => {
    const startPoint = `M ${padLeft},${toY(CURRENT_BALANCE)}`;
    const linePoints = projectedCash
      .map((d, i) => `L ${toX(i)},${toY(d[key])}`)
      .join(' ');
    return `${startPoint} ${linePoints}`;
  };

  const buildArea = (key: 'base' | 'optimistic' | 'conservative') => {
    const path = buildPath(key);
    const lastX = toX(projectedCash.length - 1);
    return `${path} L ${lastX},${toY(0)} L ${padLeft},${toY(0)} Z`;
  };

  // Danger zone (below minimum threshold)
  const dangerY = toY(MINIMUM_THRESHOLD);

  // Grid lines
  const gridValues = [0, 200000, 400000, 600000, 800000, 1000000].filter((v) => v <= maxVal);

  // Determine which lines to show based on scenario
  const showBase = true;
  const showOptimistic = activeScenario === 1 || activeScenario === 0;
  const showConservative = activeScenario === 2 || activeScenario === 0;

  const scenarioColors = {
    base: '#6b8f71',
    optimistic: '#8b5cf6',
    conservative: '#e06060',
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg
        width="100%"
        viewBox={`0 0 ${chartW} ${chartH}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Danger zone gradient */}
          <linearGradient id="dangerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e06060" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#e06060" stopOpacity={0.02} />
          </linearGradient>
          {/* Line gradients */}
          <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b8f71" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#6b8f71" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="conGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e06060" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#e06060" stopOpacity={0} />
          </linearGradient>
          {/* Glow filter */}
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Danger Zone fill */}
        <rect
          x={padLeft}
          y={dangerY}
          width={plotW}
          height={padTop + plotH - dangerY}
          fill="url(#dangerGrad)"
          rx={0}
        />

        {/* Danger zone label */}
        <text
          x={padLeft + 8}
          y={dangerY + 16}
          fill="#e06060"
          fontSize={9}
          fontWeight={600}
          opacity={0.8}
        >
          DANGER ZONE
        </text>

        {/* Grid lines */}
        {gridValues.map((val) => (
          <g key={val}>
            <line
              x1={padLeft}
              y1={toY(val)}
              x2={padLeft + plotW}
              y2={toY(val)}
              stroke="#1e2638"
              strokeWidth={1}
              strokeDasharray={val === 0 ? undefined : '4,6'}
            />
            <text
              x={padLeft - 8}
              y={toY(val) + 4}
              textAnchor="end"
              fill="#6b6358"
              fontSize={10}
            >
              {val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : fmt(val)}
            </text>
          </g>
        ))}

        {/* Minimum threshold line */}
        <line
          x1={padLeft}
          y1={dangerY}
          x2={padLeft + plotW}
          y2={dangerY}
          stroke="#e06060"
          strokeWidth={2}
          strokeDasharray="8,4"
          opacity={0.6}
        />
        <text
          x={padLeft + plotW + 4}
          y={dangerY + 4}
          fill="#e06060"
          fontSize={9}
          fontWeight={600}
        >
          Min: $100K
        </text>

        {/* Month labels */}
        {projectedCash.map((d, i) => (
          <text
            key={d.month}
            x={toX(i)}
            y={chartH - 8}
            textAnchor="middle"
            fill="#6b6358"
            fontSize={10}
            fontWeight={500}
          >
            {d.month}
          </text>
        ))}

        {/* Start point marker */}
        <text
          x={padLeft}
          y={chartH - 8}
          textAnchor="middle"
          fill="#d4a574"
          fontSize={10}
          fontWeight={600}
        >
          Now
        </text>

        {/* Optimistic area and line */}
        {showOptimistic && (
          <g style={{
            transition: 'opacity 0.8s ease-out',
            opacity: animProgress,
          }}>
            <path
              d={buildArea('optimistic')}
              fill="url(#optGrad)"
            />
            <path
              d={buildPath('optimistic')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
              strokeDasharray={activeScenario === 0 ? '6,4' : undefined}
              style={{
                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            {/* Endpoint */}
            <circle
              cx={toX(projectedCash.length - 1)}
              cy={toY(projectedCash[projectedCash.length - 1].optimistic)}
              r={5}
              fill="#8b5cf6"
              stroke="#131720"
              strokeWidth={2}
            />
            <text
              x={toX(projectedCash.length - 1)}
              y={toY(projectedCash[projectedCash.length - 1].optimistic) - 12}
              textAnchor="middle"
              fill="#8b5cf6"
              fontSize={10}
              fontWeight={700}
            >
              {fmt(projectedCash[projectedCash.length - 1].optimistic)}
            </text>
          </g>
        )}

        {/* Base area and line */}
        {showBase && (
          <g style={{
            transition: 'opacity 0.8s ease-out',
            opacity: animProgress,
          }}>
            <path
              d={buildArea('base')}
              fill="url(#baseGrad)"
            />
            <path
              d={buildPath('base')}
              fill="none"
              stroke="#6b8f71"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
              style={{
                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            {/* Endpoint */}
            <circle
              cx={toX(projectedCash.length - 1)}
              cy={toY(projectedCash[projectedCash.length - 1].base)}
              r={5}
              fill="#6b8f71"
              stroke="#131720"
              strokeWidth={2}
            />
            <text
              x={toX(projectedCash.length - 1)}
              y={toY(projectedCash[projectedCash.length - 1].base) - 12}
              textAnchor="middle"
              fill="#6b8f71"
              fontSize={10}
              fontWeight={700}
            >
              {fmt(projectedCash[projectedCash.length - 1].base)}
            </text>
          </g>
        )}

        {/* Conservative area and line */}
        {showConservative && (
          <g style={{
            transition: 'opacity 0.8s ease-out',
            opacity: animProgress,
          }}>
            <path
              d={buildArea('conservative')}
              fill="url(#conGrad)"
            />
            <path
              d={buildPath('conservative')}
              fill="none"
              stroke="#e06060"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
              strokeDasharray={activeScenario === 0 ? '6,4' : undefined}
              style={{
                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            {/* Endpoint */}
            <circle
              cx={toX(projectedCash.length - 1)}
              cy={toY(projectedCash[projectedCash.length - 1].conservative)}
              r={5}
              fill="#e06060"
              stroke="#131720"
              strokeWidth={2}
            />
            <text
              x={toX(projectedCash.length - 1)}
              y={toY(projectedCash[projectedCash.length - 1].conservative) - 12}
              textAnchor="middle"
              fill="#e06060"
              fontSize={10}
              fontWeight={700}
            >
              {fmt(projectedCash[projectedCash.length - 1].conservative)}
            </text>
          </g>
        )}

        {/* Starting balance dot */}
        <circle
          cx={padLeft}
          cy={toY(CURRENT_BALANCE)}
          r={6}
          fill="#d4a574"
          stroke="#131720"
          strokeWidth={3}
        />
        <text
          x={padLeft + 12}
          y={toY(CURRENT_BALANCE) - 10}
          fill="#d4a574"
          fontSize={11}
          fontWeight={700}
        >
          $385K
        </text>
      </svg>

      {/* CSS for glow animation */}
      <style>{`
        @keyframes chartPulse {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(107, 143, 113, 0.2)); }
          50% { filter: drop-shadow(0 0 12px rgba(107, 143, 113, 0.4)); }
        }
      `}</style>
    </div>
  );
}

/* ================================================================
   Animated Countdown Display for Runway
   ================================================================ */
function RunwayCountdown() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 2500;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(elapsed / duration, 1);
      // Dramatic easing
      const eased = 1 - Math.pow(1 - p, 5);
      setProgress(eased);
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  const months = Math.floor(RUNWAY_MONTHS * progress);
  const decimal = ((RUNWAY_MONTHS * progress) % 1).toFixed(1).slice(1);
  const totalDays = Math.round(RUNWAY_MONTHS * 30.44 * progress);
  const weeks = Math.round(RUNWAY_MONTHS * 4.33 * progress);

  // Ring progress
  const ringSize = 200;
  const ringStroke = 14;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = (RUNWAY_MONTHS / 24) * progress; // 24 months = full ring
  const ringDash = ringCircumference * Math.min(ringProgress, 1);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 40,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {/* Animated ring */}
      <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
        <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
          {/* Background track */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke="#1e2638"
            strokeWidth={ringStroke}
          />
          {/* Danger zone arc (0-25%) */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke="rgba(224, 96, 96, 0.15)"
            strokeWidth={ringStroke}
            strokeDasharray={`${ringCircumference * 0.25} ${ringCircumference * 0.75}`}
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
          />
          {/* Progress arc */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke={runwayColor(RUNWAY_MONTHS)}
            strokeWidth={ringStroke}
            strokeLinecap="round"
            strokeDasharray={`${ringDash} ${ringCircumference - ringDash}`}
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            style={{
              transition: 'stroke-dasharray 0.1s linear',
              filter: `drop-shadow(0 0 8px ${runwayColor(RUNWAY_MONTHS)}60)`,
            }}
          />
        </svg>
        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: runwayColor(RUNWAY_MONTHS),
                lineHeight: 1,
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {months}
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: `${runwayColor(RUNWAY_MONTHS)}99`,
                lineHeight: 1,
              }}
            >
              {decimal}
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#6b6358', fontWeight: 600, marginTop: 2 }}>
            months
          </span>
        </div>
      </div>

      {/* Supplementary metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 20px',
            backgroundColor: '#1c2230',
            borderRadius: 12,
            minWidth: 200,
          }}
        >
          <Clock size={18} style={{ color: '#d4a574' }} />
          <div>
            <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Days
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f0ebe4', fontVariantNumeric: 'tabular-nums' }}>
              {totalDays}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 20px',
            backgroundColor: '#1c2230',
            borderRadius: 12,
            minWidth: 200,
          }}
        >
          <Activity size={18} style={{ color: '#8b5cf6' }} />
          <div>
            <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Weeks
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f0ebe4', fontVariantNumeric: 'tabular-nums' }}>
              {weeks}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 20px',
            backgroundColor: runwayColor(RUNWAY_MONTHS) === '#6b8f71' ? 'rgba(107, 143, 113, 0.08)' : 'rgba(232, 180, 76, 0.08)',
            border: `1px solid ${runwayColor(RUNWAY_MONTHS)}30`,
            borderRadius: 12,
            minWidth: 200,
          }}
        >
          <Heart size={18} style={{ color: runwayColor(RUNWAY_MONTHS) }} />
          <div>
            <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Health Status
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: runwayColor(RUNWAY_MONTHS) }}>
              {runwayLabel(RUNWAY_MONTHS)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Component
   ================================================================ */
export function CashRunwayView() {
  const [activeScenario, setActiveScenario] = useState<number>(0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ================================================================
         Header
         ================================================================ */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="gradient-text">Cash Runway</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          Financial health dashboard for Frequency Unite. Track cash position,
          burn rate, and runway to ensure long-term sustainability.
        </p>
      </div>

      {/* ================================================================
         Key Financial Health Indicator Cards
         ================================================================ */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        style={{ opacity: 1 }}
      >
        <HealthCard
          label="Current Balance"
          value="$385K"
          icon={DollarSign}
          iconColor="#d4a574"
          sparkData={balanceSparkline}
          trendLabel="+$15K from last month"
          trendDirection="up"
          delay={0.05}
        />
        <HealthCard
          label="Monthly Burn"
          value="$22K"
          icon={TrendingDown}
          iconColor="#e06060"
          sparkData={burnSparkline}
          trendLabel="-$4K from Jan peak"
          trendDirection="down"
          delay={0.1}
        />
        <HealthCard
          label="Monthly Revenue"
          value="$78K"
          icon={TrendingUp}
          iconColor="#8b5cf6"
          sparkData={revenueSparkline}
          trendLabel="+26% since Oct"
          trendDirection="up"
          delay={0.15}
        />
        <HealthCard
          label="Net Cash Flow"
          value={`+${fmt(NET_MONTHLY)}/mo`}
          icon={Activity}
          iconColor="#6b8f71"
          sparkData={[41, 42, 46, 48, 54, 56]}
          trendLabel="Cash flow positive"
          trendDirection="up"
          delay={0.2}
        />
      </div>

      {/* ================================================================
         Animated Runway Countdown Display
         ================================================================ */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '250ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Gauge className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Runway Countdown</h2>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
            style={{
              color: runwayColor(RUNWAY_MONTHS),
              backgroundColor: `${runwayColor(RUNWAY_MONTHS)}18`,
            }}
          >
            {runwayLabel(RUNWAY_MONTHS)}
          </span>
        </div>

        <RunwayCountdown />

        {/* Supporting info bar */}
        <div
          className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-8 flex-wrap"
        >
          <div className="text-center">
            <p className="text-xs text-text-muted">Cash in Bank</p>
            <p className="text-sm font-bold text-accent">{fmtFull(CURRENT_BALANCE)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted">Monthly Burn</p>
            <p className="text-sm font-bold text-danger">{fmt(MONTHLY_BURN)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted">Monthly Revenue</p>
            <p className="text-sm font-bold text-accent-violet">{fmt(MONTHLY_REVENUE)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted">Net Monthly</p>
            <p className="text-sm font-bold text-success">+{fmt(NET_MONTHLY)}</p>
          </div>
        </div>
      </div>

      {/* ================================================================
         Projected Cash - Dramatic SVG Line Chart
         ================================================================ */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '350ms', opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">12-Month Cash Projection</h2>
          </div>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Projected cash balance over the next 12 months. Red zone indicates minimum reserve threshold.
        </p>

        {/* Chart Legend */}
        <div className="flex items-center gap-6 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: '#6b8f71' }} />
            <span className="text-xs text-text-muted">Base Case</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: '#8b5cf6', opacity: activeScenario === 0 ? 0.6 : 1 }} />
            <span className="text-xs text-text-muted">Optimistic</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: '#e06060', opacity: activeScenario === 0 ? 0.6 : 1 }} />
            <span className="text-xs text-text-muted">Conservative</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: '#e06060', opacity: 0.5 }} />
            <span className="text-xs text-text-muted">Min Reserve ($100K)</span>
          </div>
        </div>

        <ProjectedCashChart activeScenario={activeScenario} />
      </div>

      {/* ================================================================
         Scenario Comparison
         ================================================================ */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '450ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Layers className="w-5 h-5 text-accent-violet" />
          <h2 className="text-lg font-semibold text-text-primary">Scenario Modeling</h2>
        </div>

        {/* Scenario Tabs */}
        <div className="flex gap-3 mb-6">
          {scenarios.map((scenario, idx) => (
            <button
              key={scenario.name}
              onClick={() => setActiveScenario(idx)}
              className={`flex-1 rounded-xl p-4 border transition-all duration-300 text-left ${
                activeScenario === idx
                  ? 'border-opacity-50'
                  : 'border-border hover:border-border-2'
              }`}
              style={{
                borderColor: activeScenario === idx ? scenario.color : undefined,
                backgroundColor: activeScenario === idx ? `${scenario.color}08` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: activeScenario === idx ? scenario.color : '#f0ebe4' }}
                >
                  {scenario.name}
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${scenario.color}18`,
                    color: scenario.color,
                  }}
                >
                  {scenario.probability}
                </span>
              </div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: scenario.color }}
              >
                {scenario.runway}
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">{scenario.description}</p>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-[10px] text-text-muted">Revenue</p>
                  <p className="text-xs font-semibold text-text-secondary">{scenario.revenue}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Burn</p>
                  <p className="text-xs font-semibold text-text-secondary">{scenario.burn}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Runway Visual Comparison */}
        <div className="space-y-3">
          <p className="text-xs text-text-muted uppercase tracking-wider">Runway Comparison</p>
          {scenarios.map((scenario, idx) => {
            const runwayNum = scenario.runwayNum;
            const maxRunway = 30;
            const pct = Math.min((runwayNum / maxRunway) * 100, 100);

            return (
              <div key={scenario.name} className="flex items-center gap-4">
                <span className="text-xs text-text-muted w-24 shrink-0">{scenario.name}</span>
                <div className="flex-1 h-5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${scenario.color}dd, ${scenario.color}88)`,
                      boxShadow: activeScenario === idx ? `0 0 12px ${scenario.color}40` : 'none',
                    }}
                  />
                </div>
                <span
                  className="text-xs font-bold w-20 text-right"
                  style={{ color: scenario.color }}
                >
                  {scenario.runway}
                </span>
              </div>
            );
          })}
          {/* 12-month safety marker */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted w-24 shrink-0" />
            <div className="flex-1 relative h-4">
              <div
                className="absolute top-0 bottom-0 w-[1px] border-l-2 border-dashed border-warning/40"
                style={{ left: `${(12 / 30) * 100}%` }}
              />
              <span
                className="absolute text-[9px] text-warning font-semibold"
                style={{ left: `${(12 / 30) * 100}%`, top: -12, transform: 'translateX(-50%)' }}
              >
                12mo safety line
              </span>
            </div>
            <span className="w-20" />
          </div>
        </div>

        {/* Scenario comparison metrics */}
        <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4">
          {scenarios.map((s) => (
            <div
              key={s.name}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                backgroundColor: `${s.color}08`,
                border: `1px solid ${s.color}20`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: s.color, marginBottom: 8 }}>
                {s.name} Projection
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: '#6b6358' }}>12-Mo Cash</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f0ebe4', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(CURRENT_BALANCE + (s.revenueNum - s.burnNum) * 12)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: '#6b6358' }}>Net/Month</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: s.revenueNum - s.burnNum >= 0 ? '#6b8f71' : '#e06060',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {s.revenueNum - s.burnNum >= 0 ? '+' : ''}{fmt(s.revenueNum - s.burnNum)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================
         Revenue vs Plan Chart
         ================================================================ */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '550ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Revenue vs Plan</h2>
          <span className="text-[11px] text-text-muted bg-surface-2 px-2.5 py-0.5 rounded-full">
            Last 6 months
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-violet" />
            <span className="text-xs text-text-muted">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm border-2 border-accent/50 bg-transparent" />
            <span className="text-xs text-text-muted">Plan</span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-4" style={{ height: 200 }}>
          {revenueVsPlan.map((d, i) => {
            const actualPct = (d.actual / MAX_REVENUE) * 100;
            const planPct = (d.plan / MAX_REVENUE) * 100;
            const isAbovePlan = d.actual >= d.plan;

            return (
              <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end gap-1">
                <span
                  className="text-[10px] font-semibold mb-1"
                  style={{ color: isAbovePlan ? '#6b8f71' : '#e8b44c' }}
                >
                  {fmt(d.actual)}
                </span>
                <div className="flex items-end gap-1 w-full justify-center" style={{ flex: 1 }}>
                  {/* Actual bar */}
                  <div
                    className="animate-fade-in rounded-t-md"
                    style={{
                      width: '40%',
                      maxWidth: 32,
                      height: `${actualPct}%`,
                      background: 'linear-gradient(180deg, #8b5cf6cc, #8b5cf655)',
                      animationDelay: `${0.6 + i * 0.06}s`,
                      opacity: 0,
                    }}
                  />
                  {/* Plan bar */}
                  <div
                    className="animate-fade-in rounded-t-md"
                    style={{
                      width: '40%',
                      maxWidth: 32,
                      height: `${planPct}%`,
                      border: '2px solid rgba(212, 165, 116, 0.4)',
                      backgroundColor: 'rgba(212, 165, 116, 0.08)',
                      animationDelay: `${0.63 + i * 0.06}s`,
                      opacity: 0,
                    }}
                  />
                </div>
                <span className="text-[11px] text-text-muted font-medium mt-2">{d.month}</span>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-text-muted">6-Month Actual</p>
            <p className="text-sm font-bold text-accent-violet">
              {fmt(revenueVsPlan.reduce((s, d) => s + d.actual, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted">6-Month Plan</p>
            <p className="text-sm font-bold text-accent">
              {fmt(revenueVsPlan.reduce((s, d) => s + d.plan, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted">Variance</p>
            <p className="text-sm font-bold text-success">
              +{fmt(revenueVsPlan.reduce((s, d) => s + d.actual, 0) - revenueVsPlan.reduce((s, d) => s + d.plan, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================
         Revenue Breakdown + Break-Even
         ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div
          className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
          style={{ animationDelay: '650ms', opacity: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Revenue Breakdown</h2>
            <span className="text-[11px] text-text-muted bg-surface-2 px-2.5 py-0.5 rounded-full">
              {fmt(MONTHLY_REVENUE)}/mo
            </span>
          </div>

          {/* Stacked bar visual */}
          <div className="h-8 rounded-full overflow-hidden flex mb-6">
            {revenueBreakdown.map((seg) => (
              <div
                key={seg.label}
                className="h-full transition-all duration-700"
                style={{
                  width: `${seg.pct}%`,
                  backgroundColor: seg.color,
                }}
                title={`${seg.label}: ${fmt(seg.amount)}`}
              />
            ))}
          </div>

          <div className="space-y-3">
            {revenueBreakdown.map((seg) => (
              <div key={seg.label} className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-sm text-text-primary flex-1">{seg.label}</span>
                <span className="text-sm font-bold text-text-primary font-mono">
                  {fmt(seg.amount)}
                </span>
                <span className="text-xs text-text-muted w-10 text-right">{seg.pct}%</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-muted">Total Monthly Revenue</span>
            <span className="text-lg font-bold text-accent">{fmt(MONTHLY_REVENUE)}</span>
          </div>
        </div>

        {/* Break-Even Progress */}
        <div
          className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
          style={{ animationDelay: '700ms', opacity: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold text-text-primary">Break-Even Progress</h2>
          </div>

          {/* Big visual indicator */}
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center">
              <svg width="160" height="160" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="#1e2638"
                  strokeWidth="12"
                />
                {/* Progress arc */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="#6b8f71"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(2 * Math.PI * 68 * breakEvenPct) / 100} ${2 * Math.PI * 68}`}
                  transform="rotate(-90 80 80)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-success">
                  {Math.round(breakEvenPct)}%
                </span>
                <span className="text-[10px] text-text-muted">self-sustaining</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-surface-2 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Monthly Revenue</p>
                <p className="text-sm font-bold text-success">{fmt(MONTHLY_REVENUE)}</p>
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="bg-surface-2 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Monthly Burn</p>
                <p className="text-sm font-bold text-danger">{fmt(MONTHLY_BURN)}</p>
              </div>
              <TrendingDown className="w-4 h-4 text-danger" />
            </div>
            <div className="bg-surface-2 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Net Monthly Cash Flow</p>
                <p className="text-sm font-bold text-success">+{fmt(currentMonthlyNet)}</p>
              </div>
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs text-success font-semibold">
                Cash flow positive -- revenue exceeds burn by {fmt(currentMonthlyNet)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
         Key Assumptions
         ================================================================ */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '800ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-accent-violet" />
          <h2 className="text-lg font-semibold text-text-primary">Key Assumptions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assumptions.map((a, i) => (
            <div
              key={a.label}
              className="bg-surface-2 rounded-lg p-4 flex items-center justify-between animate-fade-in"
              style={{
                animationDelay: `${0.85 + i * 0.04}s`,
                opacity: 0,
              }}
            >
              <div>
                <p className="text-xs text-text-muted mb-1">{a.label}</p>
                <p className="text-sm font-semibold text-text-primary">{a.value}</p>
              </div>
              <div className="flex items-center gap-1">
                {a.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-success" />}
                {a.trend === 'stable' && (
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                )}
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    a.trend === 'up' ? 'text-success' : 'text-text-muted'
                  }`}
                >
                  {a.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Risk callout */}
        <div className="mt-4 flex items-start gap-3 bg-warning/10 border border-warning/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-warning" />
          <div>
            <p className="text-sm text-text-primary">
              Key risk: Member churn above 5%/mo would reduce runway below 12 months.
              Blue Spirit event revenue is lumpy and depends on 70+ ticket sales.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <ArrowRight className="w-3 h-3 text-text-muted" />
              <span className="text-xs text-text-secondary">
                Mitigation: Pre-sales campaign + member retention focus in Q2
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
