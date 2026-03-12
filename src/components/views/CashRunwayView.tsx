'use client';

import { useState, useEffect } from 'react';
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
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

/* ================================================================
   Constants & Data  (ALL ORIGINAL DATA PRESERVED)
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
    baseBal += NET_MONTHLY;
    optBal += (95000 - 24000) + i * 1500;
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

// Monthly breakdown data
const monthlyBreakdown = [
  { month: 'Oct', revenue: 62000, burn: 24000, net: 38000, balance: 310000 },
  { month: 'Nov', revenue: 65000, burn: 23000, net: 42000, balance: 325000 },
  { month: 'Dec', revenue: 70000, burn: 24000, net: 46000, balance: 340000 },
  { month: 'Jan', revenue: 74000, burn: 26000, net: 48000, balance: 355000 },
  { month: 'Feb', revenue: 76000, burn: 22000, net: 54000, balance: 370000 },
  { month: 'Mar', revenue: 78000, burn: 22000, net: 56000, balance: 385000 },
];

// Alert thresholds
const ALERT_THRESHOLDS = {
  runwayWarning: 12,
  runwayCritical: 6,
  burnRateHigh: 30000,
  balanceLow: 150000,
};

/* ================================================================
   Scoped Keyframes (cr- prefix)
   ================================================================ */
const scopedKeyframes = `
  @keyframes cr-fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes cr-slideUp {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cr-scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes cr-drawLine {
    from { stroke-dashoffset: var(--cr-path-length, 1000); }
    to { stroke-dashoffset: 0; }
  }
  @keyframes cr-pulseGlow {
    0%, 100% { opacity: 0.4; filter: blur(8px); }
    50% { opacity: 0.8; filter: blur(12px); }
  }
  @keyframes cr-needleSweep {
    from { transform: rotate(var(--cr-needle-start, -90deg)); }
    to { transform: rotate(var(--cr-needle-end, 0deg)); }
  }
  @keyframes cr-countUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes cr-flamePulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.15); opacity: 1; }
  }
  @keyframes cr-flameFlicker {
    0%, 100% { transform: scaleY(1) scaleX(1); }
    25% { transform: scaleY(1.08) scaleX(0.96); }
    50% { transform: scaleY(0.95) scaleX(1.04); }
    75% { transform: scaleY(1.05) scaleX(0.98); }
  }
  @keyframes cr-glowPulse {
    0%, 100% { box-shadow: 0 0 8px rgba(224, 96, 96, 0.2); }
    50% { box-shadow: 0 0 20px rgba(224, 96, 96, 0.5); }
  }
  @keyframes cr-barGrow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  @keyframes cr-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes cr-ringProgress {
    from { stroke-dasharray: 0 1000; }
  }
  @keyframes cr-tooltipIn {
    from { opacity: 0; transform: translateY(4px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cr-warningGlow {
    0%, 100% { box-shadow: 0 0 6px rgba(232, 180, 76, 0.15); }
    50% { box-shadow: 0 0 18px rgba(232, 180, 76, 0.45); }
  }
  @keyframes cr-sparkleFloat {
    0% { opacity: 0; transform: translateY(0) scale(0); }
    50% { opacity: 1; transform: translateY(-6px) scale(1); }
    100% { opacity: 0; transform: translateY(-12px) scale(0); }
  }
`;

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

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Glassmorphism base style
const glass = (borderColor = 'rgba(212,165,116,0.08)') => ({
  backgroundColor: 'rgba(19, 23, 32, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${borderColor}`,
  borderRadius: 16,
} as React.CSSProperties);

/* ================================================================
   useAnimatedValue Hook
   ================================================================ */
function useAnimatedValue(target: number, duration = 2000, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setValue(target * eased);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}

/* ================================================================
   Animated Counter Component
   ================================================================ */
function AnimatedCounter({ target, suffix = '', prefix = '', decimals = 0, delay = 0 }: {
  target: number; suffix?: string; prefix?: string; decimals?: number; delay?: number;
}) {
  const value = useAnimatedValue(target, 2000, delay);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()}{suffix}
    </span>
  );
}

/* ================================================================
   Sparkline SVG Component
   ================================================================ */
function Sparkline({ data, color, width = 80, height = 32, animate = true, delay = 0 }: {
  data: number[]; color: string; width?: number; height?: number; animate?: boolean; delay?: number;
}) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [animate, delay]);

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const id = `cr-spark-${color.replace('#', '')}-${data.length}`;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height * 0.8 - height * 0.1;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#${id})`}
        style={{ opacity: visible ? 1 : 0, transition: `opacity 0.8s ${EASE}` }}
      />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: visible ? 1 : 0, transition: `opacity 0.8s ${EASE}` }}
      />
      {visible && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill={color}
          style={{
            filter: `drop-shadow(0 0 4px ${color}80)`,
          }}
        />
      )}
    </svg>
  );
}

/* ================================================================
   Financial Summary Card (with animated count-up + trend + sparkline)
   ================================================================ */
function FinancialSummaryCard({
  label, value, numericValue, icon: Icon, iconColor, sparkData,
  trendLabel, trendDirection, delay, prefix = '', suffix = '', alert,
}: {
  label: string; value: string; numericValue: number;
  icon: React.ElementType; iconColor: string; sparkData: number[];
  trendLabel: string; trendDirection: 'up' | 'down' | 'stable';
  delay: number; prefix?: string; suffix?: string;
  alert?: { active: boolean; message: string };
}) {
  const [hovered, setHovered] = useState(false);
  const animValue = useAnimatedValue(numericValue, 2200, delay * 1000 + 200);

  const displayValue = numericValue >= 1000
    ? `${prefix}$${Math.round(animValue / 1000).toLocaleString()}K${suffix}`
    : `${prefix}${animValue.toFixed(1)}${suffix}`;

  return (
    <div
      className="card-stat card-interactive"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...glass(),
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        animation: `cr-slideUp 0.7s ${EASE} ${delay}s both`,
        transform: hovered ? 'translateY(-2px)' : undefined,
        transition: `transform 0.4s ${EASE}, box-shadow 0.4s ${EASE}`,
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${iconColor}20`
          : '0 4px 16px rgba(0,0,0,0.15)',
        cursor: 'default',
      }}
    >
      {/* Top accent shimmer line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${iconColor}80, transparent)`,
          opacity: hovered ? 1 : 0.6,
          transition: `opacity 0.4s ${EASE}`,
        }}
      />

      {/* Alert badge */}
      {alert?.active && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            animation: 'cr-warningGlow 2s ease-in-out infinite',
            padding: '2px 8px',
            borderRadius: 20,
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#e8b44c',
            backgroundColor: 'rgba(232, 180, 76, 0.12)',
            border: '1px solid rgba(232, 180, 76, 0.25)',
          }}
        >
          {alert.message}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6b6358',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: `${iconColor}12`,
            border: `1px solid ${iconColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `all 0.4s ${EASE}`,
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <Icon size={17} style={{ color: iconColor }} />
        </div>
      </div>

      {/* Large animated number */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#f0ebe4',
          lineHeight: 1,
          marginBottom: 14,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {displayValue}
      </div>

      {/* Sparkline */}
      <Sparkline data={sparkData} color={iconColor} animate delay={delay * 1000 + 400} />

      {/* Trend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
        {trendDirection === 'up' && <ArrowUpRight size={13} style={{ color: '#6b8f71' }} />}
        {trendDirection === 'down' && <ArrowDownRight size={13} style={{ color: '#6b8f71' }} />}
        {trendDirection === 'stable' && <ArrowRight size={13} style={{ color: '#a09888' }} />}
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
   Semicircular Runway Gauge (SVG)
   ================================================================ */
function RunwayGauge() {
  const progress = useAnimatedValue(1, 2500, 300);

  const months = RUNWAY_MONTHS * progress;
  const wholeMonths = Math.floor(months);
  const decimal = (months % 1).toFixed(1).slice(1);
  const totalDays = Math.round(RUNWAY_MONTHS * 30.44 * progress);
  const weeks = Math.round(RUNWAY_MONTHS * 4.33 * progress);

  // Gauge geometry
  const cx = 180, cy = 165, r = 140;
  const startAngle = -210;
  const endAngle = 30;
  const totalSweep = endAngle - startAngle; // 240 degrees

  // Zones: 0-6 mo = red, 6-12 = amber, 12-24+ = green
  const maxGauge = 24;
  const runwayFraction = Math.min(RUNWAY_MONTHS / maxGauge, 1);

  const angleForFraction = (frac: number) => {
    const a = startAngle + totalSweep * frac;
    return (a * Math.PI) / 180;
  };

  const pointOnArc = (frac: number) => {
    const a = angleForFraction(frac);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Build arc path
  const arcPath = (startFrac: number, endFrac: number) => {
    const a1 = angleForFraction(startFrac);
    const a2 = angleForFraction(endFrac);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const largeArc = (endFrac - startFrac) * totalSweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Tick marks
  const ticks: { frac: number; major: boolean; label?: string }[] = [];
  for (let m = 0; m <= maxGauge; m += 2) {
    ticks.push({
      frac: m / maxGauge,
      major: m % 6 === 0,
      label: m % 6 === 0 ? `${m}` : undefined,
    });
  }

  // Needle angle
  const needleFrac = runwayFraction * progress;
  const needleAngle = startAngle + totalSweep * needleFrac;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
      {/* Gauge SVG */}
      <div style={{ position: 'relative', width: 360, height: 220 }}>
        <svg width="360" height="220" viewBox="0 0 360 220" style={{ overflow: 'visible' }}>
          <defs>
            <filter id="cr-needleGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="cr-gaugeGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="cr-needleGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={runwayColor(RUNWAY_MONTHS)} stopOpacity={1} />
              <stop offset="100%" stopColor={runwayColor(RUNWAY_MONTHS)} stopOpacity={0.3} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={arcPath(0, 1)}
            fill="none"
            stroke="#1e2638"
            strokeWidth={22}
            strokeLinecap="round"
          />

          {/* Red zone: 0-25% (0-6mo) */}
          <path
            d={arcPath(0, 6 / maxGauge)}
            fill="none"
            stroke="rgba(224, 96, 96, 0.2)"
            strokeWidth={22}
            strokeLinecap="round"
          />

          {/* Amber zone: 25-50% (6-12mo) */}
          <path
            d={arcPath(6 / maxGauge, 12 / maxGauge)}
            fill="none"
            stroke="rgba(232, 180, 76, 0.15)"
            strokeWidth={22}
            strokeLinecap="round"
          />

          {/* Green zone: 50-100% (12-24mo) */}
          <path
            d={arcPath(12 / maxGauge, 1)}
            fill="none"
            stroke="rgba(107, 143, 113, 0.12)"
            strokeWidth={22}
            strokeLinecap="round"
          />

          {/* Active progress arc with glow */}
          <path
            d={arcPath(0, needleFrac)}
            fill="none"
            stroke={runwayColor(RUNWAY_MONTHS)}
            strokeWidth={22}
            strokeLinecap="round"
            filter="url(#cr-gaugeGlow)"
            style={{
              opacity: 0.3,
              transition: `all 0.1s linear`,
            }}
          />
          <path
            d={arcPath(0, needleFrac)}
            fill="none"
            stroke={runwayColor(RUNWAY_MONTHS)}
            strokeWidth={14}
            strokeLinecap="round"
            style={{
              transition: `all 0.1s linear`,
            }}
          />

          {/* Tick marks */}
          {ticks.map((tick, i) => {
            const a = angleForFraction(tick.frac);
            const outerR = r + 18;
            const innerR = r + (tick.major ? 8 : 12);
            const labelR = r + 30;
            const x1 = cx + innerR * Math.cos(a);
            const y1 = cy + innerR * Math.sin(a);
            const x2 = cx + outerR * Math.cos(a);
            const y2 = cy + outerR * Math.sin(a);
            const lx = cx + labelR * Math.cos(a);
            const ly = cy + labelR * Math.sin(a);
            return (
              <g key={i}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={tick.major ? '#4a4a5a' : '#2a2a3a'}
                  strokeWidth={tick.major ? 2 : 1}
                  strokeLinecap="round"
                />
                {tick.label && (
                  <text
                    x={lx} y={ly + 3}
                    textAnchor="middle"
                    fill="#6b6358"
                    fontSize={9}
                    fontWeight={600}
                  >
                    {tick.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Zone labels */}
          {(() => {
            const redMid = angleForFraction(3 / maxGauge);
            const amberMid = angleForFraction(9 / maxGauge);
            const greenMid = angleForFraction(18 / maxGauge);
            const lr = r - 24;
            return (
              <>
                <text x={cx + lr * Math.cos(redMid)} y={cy + lr * Math.sin(redMid) + 3} textAnchor="middle" fill="#e06060" fontSize={8} fontWeight={700} opacity={0.6}>CRITICAL</text>
                <text x={cx + lr * Math.cos(amberMid)} y={cy + lr * Math.sin(amberMid) + 3} textAnchor="middle" fill="#e8b44c" fontSize={8} fontWeight={700} opacity={0.6}>CAUTION</text>
                <text x={cx + lr * Math.cos(greenMid)} y={cy + lr * Math.sin(greenMid) + 3} textAnchor="middle" fill="#6b8f71" fontSize={8} fontWeight={700} opacity={0.6}>HEALTHY</text>
              </>
            );
          })()}

          {/* Needle */}
          <g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${needleAngle}deg)`,
              transition: 'transform 0.1s linear',
            }}
          >
            {/* Needle body */}
            <line
              x1={cx} y1={cy}
              x2={cx + r - 10} y2={cy}
              stroke="url(#cr-needleGrad)"
              strokeWidth={3}
              strokeLinecap="round"
              filter="url(#cr-needleGlow)"
            />
            {/* Needle tip */}
            <circle
              cx={cx + r - 10} cy={cy} r={4}
              fill={runwayColor(RUNWAY_MONTHS)}
              style={{ filter: `drop-shadow(0 0 6px ${runwayColor(RUNWAY_MONTHS)}80)` }}
            />
          </g>

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={10} fill="#1e2638" stroke={runwayColor(RUNWAY_MONTHS)} strokeWidth={2} />
          <circle cx={cx} cy={cy} r={4} fill={runwayColor(RUNWAY_MONTHS)} />

          {/* Center display */}
          <text
            x={cx} y={cy - 45}
            textAnchor="middle"
            fill={runwayColor(RUNWAY_MONTHS)}
            fontSize={52}
            fontWeight={900}
            style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}
          >
            {wholeMonths}{decimal}
          </text>
          <text
            x={cx} y={cy - 25}
            textAnchor="middle"
            fill="#6b6358"
            fontSize={12}
            fontWeight={600}
            style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
          >
            months runway
          </text>
        </svg>
      </div>

      {/* Supplementary metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { icon: Clock, color: '#d4a574', label: 'Total Days', val: `${totalDays}` },
          { icon: Activity, color: '#8b5cf6', label: 'Total Weeks', val: `${weeks}` },
          { icon: Heart, color: runwayColor(RUNWAY_MONTHS), label: 'Health Status', val: runwayLabel(RUNWAY_MONTHS), special: true },
        ].map((item, i) => (
          <div
            key={item.label}
            style={{
              ...glass(item.special ? `${item.color}30` : 'rgba(212,165,116,0.08)'),
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 20px',
              minWidth: 210,
              animation: `cr-fadeIn 0.6s ${EASE} ${0.6 + i * 0.12}s both`,
              backgroundColor: item.special ? `${item.color}08` : 'rgba(19, 23, 32, 0.7)',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: `${item.color}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <item.icon size={18} style={{ color: item.color }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {item.label}
              </div>
              <div style={{
                fontSize: item.special ? 17 : 24,
                fontWeight: 800,
                color: item.special ? item.color : '#f0ebe4',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {item.val}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   Burn Rate Indicator (animated flame)
   ================================================================ */
function BurnRateIndicator() {
  const isHigh = MONTHLY_BURN > ALERT_THRESHOLDS.burnRateHigh;
  const burnRatio = MONTHLY_BURN / MONTHLY_REVENUE;
  const animValue = useAnimatedValue(MONTHLY_BURN, 1800, 400);

  return (
    <div className="card-stat" style={{
      ...glass(),
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      animation: `cr-fadeIn 0.6s ${EASE} 0.3s both`,
    }}>
      <div style={{
        position: 'relative',
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Flame
          size={28}
          style={{
            color: isHigh ? '#e06060' : '#e8b44c',
            animation: isHigh ? 'cr-flamePulse 1.2s ease-in-out infinite' : 'cr-flameFlicker 2s ease-in-out infinite',
            filter: `drop-shadow(0 0 8px ${isHigh ? 'rgba(224,96,96,0.5)' : 'rgba(232,180,76,0.3)'})`,
          }}
        />
        {/* Glow ring behind flame */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${isHigh ? 'rgba(224,96,96,0.15)' : 'rgba(232,180,76,0.1)'} 0%, transparent 70%)`,
          animation: isHigh ? 'cr-pulseGlow 2s ease-in-out infinite' : undefined,
        }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Monthly Burn Rate
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#f0ebe4', fontVariantNumeric: 'tabular-nums' }}>
          ${Math.round(animValue / 1000).toLocaleString()}K
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 4 }}>Burn Ratio</div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: burnRatio < 0.3 ? '#6b8f71' : burnRatio < 0.5 ? '#e8b44c' : '#e06060',
        }}>
          {(burnRatio * 100).toFixed(0)}%
        </div>
        <div style={{ fontSize: 9, color: '#6b6358' }}>of revenue</div>
      </div>
    </div>
  );
}

/* ================================================================
   Revenue vs Plan Chart - Dual line SVG with gradient fills
   ================================================================ */
function RevenueVsPlanChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [drawProgress, setDrawProgress] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1500;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDrawProgress(eased);
      if (p < 1) requestAnimationFrame(animate);
    };
    const t = setTimeout(() => requestAnimationFrame(animate), 600);
    return () => clearTimeout(t);
  }, []);

  const chartW = 640;
  const chartH = 260;
  const padL = 55;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const toX = (i: number) => padL + (i / (revenueVsPlan.length - 1)) * plotW;
  const toY = (val: number) => padT + plotH - (val / MAX_REVENUE) * plotH;

  const buildLinePath = (key: 'actual' | 'plan') =>
    revenueVsPlan
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(d[key])}`)
      .join(' ');

  const buildAreaPath = (key: 'actual' | 'plan') => {
    const line = buildLinePath(key);
    return `${line} L ${toX(revenueVsPlan.length - 1)},${padT + plotH} L ${padL},${padT + plotH} Z`;
  };

  // Total path length estimation for animation
  const actualPathLen = revenueVsPlan.reduce((acc, d, i) => {
    if (i === 0) return 0;
    const prev = revenueVsPlan[i - 1];
    const dx = toX(i) - toX(i - 1);
    const dy = toY(d.actual) - toY(prev.actual);
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  const gridValues = [0, 20000, 40000, 60000, 80000];

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="cr-actualFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cr-planFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a574" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#d4a574" stopOpacity={0} />
          </linearGradient>
          <filter id="cr-lineGlow2">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid */}
        {gridValues.map((val) => (
          <g key={val}>
            <line
              x1={padL} y1={toY(val)} x2={padL + plotW} y2={toY(val)}
              stroke="#1e2638" strokeWidth={1} strokeDasharray={val === 0 ? undefined : '4,6'}
            />
            <text x={padL - 8} y={toY(val) + 4} textAnchor="end" fill="#6b6358" fontSize={10}>
              {fmt(val)}
            </text>
          </g>
        ))}

        {/* Month labels */}
        {revenueVsPlan.map((d, i) => (
          <text key={d.month} x={toX(i)} y={chartH - 8} textAnchor="middle" fill="#6b6358" fontSize={10} fontWeight={500}>
            {d.month}
          </text>
        ))}

        {/* Plan gradient fill */}
        <path d={buildAreaPath('plan')} fill="url(#cr-planFill)" style={{ opacity: drawProgress }} />

        {/* Plan line */}
        <path
          d={buildLinePath('plan')}
          fill="none"
          stroke="#d4a574"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6,4"
          style={{ opacity: drawProgress * 0.7 }}
        />

        {/* Actual gradient fill */}
        <path d={buildAreaPath('actual')} fill="url(#cr-actualFill)" style={{ opacity: drawProgress }} />

        {/* Actual line - animated draw */}
        <path
          d={buildLinePath('actual')}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#cr-lineGlow2)"
          strokeDasharray={actualPathLen}
          strokeDashoffset={actualPathLen * (1 - drawProgress)}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />

        {/* Data points and hover zones */}
        {revenueVsPlan.map((d, i) => {
          const x = toX(i);
          const yActual = toY(d.actual);
          const yPlan = toY(d.plan);
          const isHovered = hoveredIdx === i;

          return (
            <g key={d.month}>
              {/* Hover zone */}
              <rect
                x={x - plotW / revenueVsPlan.length / 2}
                y={padT}
                width={plotW / revenueVsPlan.length}
                height={plotH}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Vertical guide */}
              {isHovered && (
                <line
                  x1={x} y1={padT} x2={x} y2={padT + plotH}
                  stroke="rgba(212,165,116,0.15)"
                  strokeWidth={1}
                />
              )}

              {/* Plan dot */}
              <circle
                cx={x} cy={yPlan} r={isHovered ? 5 : 3}
                fill="#d4a574"
                stroke="#131720"
                strokeWidth={2}
                style={{ opacity: drawProgress, transition: `r 0.2s ${EASE}` }}
              />

              {/* Actual dot */}
              <circle
                cx={x} cy={yActual} r={isHovered ? 6 : 4}
                fill="#8b5cf6"
                stroke="#131720"
                strokeWidth={2}
                style={{
                  opacity: drawProgress,
                  filter: isHovered ? 'drop-shadow(0 0 6px rgba(139,92,246,0.6))' : undefined,
                  transition: `all 0.2s ${EASE}`,
                }}
              />

              {/* Tooltip */}
              {isHovered && (
                <g style={{ animation: `cr-tooltipIn 0.2s ${EASE} both` }}>
                  <rect
                    x={x - 55} y={Math.min(yActual, yPlan) - 58}
                    width={110} height={50}
                    rx={8}
                    fill="rgba(19, 23, 32, 0.95)"
                    stroke="rgba(212,165,116,0.2)"
                    strokeWidth={1}
                  />
                  <text x={x} y={Math.min(yActual, yPlan) - 42} textAnchor="middle" fill="#8b5cf6" fontSize={11} fontWeight={700}>
                    Actual: {fmt(d.actual)}
                  </text>
                  <text x={x} y={Math.min(yActual, yPlan) - 24} textAnchor="middle" fill="#d4a574" fontSize={11} fontWeight={600}>
                    Plan: {fmt(d.plan)}
                  </text>
                  <text x={x} y={Math.min(yActual, yPlan) - 10} textAnchor="middle"
                    fill={d.actual >= d.plan ? '#6b8f71' : '#e06060'}
                    fontSize={9} fontWeight={700}
                  >
                    {d.actual >= d.plan ? '+' : ''}{fmt(d.actual - d.plan)} variance
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Plan dots on line */}
        {revenueVsPlan.map((d, i) => (
          <circle
            key={`plan-${i}`}
            cx={toX(i)} cy={toY(d.plan)} r={3}
            fill="#d4a574"
            stroke="#131720"
            strokeWidth={2}
            style={{ opacity: drawProgress }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ================================================================
   Projected Cash Chart (12-month with interactive hover)
   ================================================================ */
function ProjectedCashChart({ activeScenario }: { activeScenario: number }) {
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  useEffect(() => {
    setAnimProgress(0);
    const timer = setTimeout(() => {
      const startTime = performance.now();
      const duration = 1200;
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const p = Math.min(elapsed / duration, 1);
        setAnimProgress(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, 100);
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

  const allValues = projectedCash.flatMap((d) => [d.base, d.optimistic, d.conservative]);
  const maxVal = Math.max(...allValues, CURRENT_BALANCE) * 1.1;
  const minVal = 0;
  const valRange = maxVal - minVal;

  const toX = (i: number) => padLeft + (i / (projectedCash.length - 1)) * plotW;
  const toY = (val: number) => padTop + plotH - ((val - minVal) / valRange) * plotH;

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

  const dangerY = toY(MINIMUM_THRESHOLD);
  const gridValues = [0, 200000, 400000, 600000, 800000, 1000000].filter((v) => v <= maxVal);

  const showBase = true;
  const showOptimistic = activeScenario === 1 || activeScenario === 0;
  const showConservative = activeScenario === 2 || activeScenario === 0;

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="cr-dangerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e06060" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#e06060" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="cr-baseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b8f71" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#6b8f71" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cr-optGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cr-conGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e06060" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#e06060" stopOpacity={0} />
          </linearGradient>
          <filter id="cr-lineGlow3">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Danger Zone */}
        <rect
          x={padLeft} y={dangerY} width={plotW} height={padTop + plotH - dangerY}
          fill="url(#cr-dangerGrad)" rx={0}
        />
        <text x={padLeft + 8} y={dangerY + 16} fill="#e06060" fontSize={9} fontWeight={600} opacity={0.8}>
          DANGER ZONE
        </text>

        {/* Grid */}
        {gridValues.map((val) => (
          <g key={val}>
            <line
              x1={padLeft} y1={toY(val)} x2={padLeft + plotW} y2={toY(val)}
              stroke="#1e2638" strokeWidth={1}
              strokeDasharray={val === 0 ? undefined : '4,6'}
            />
            <text x={padLeft - 8} y={toY(val) + 4} textAnchor="end" fill="#6b6358" fontSize={10}>
              {val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : fmt(val)}
            </text>
          </g>
        ))}

        {/* Minimum threshold */}
        <line
          x1={padLeft} y1={dangerY} x2={padLeft + plotW} y2={dangerY}
          stroke="#e06060" strokeWidth={2} strokeDasharray="8,4" opacity={0.6}
        />
        <text x={padLeft + plotW + 4} y={dangerY + 4} fill="#e06060" fontSize={9} fontWeight={600}>
          Min: $100K
        </text>

        {/* Month labels */}
        {projectedCash.map((d, i) => (
          <text key={d.month} x={toX(i)} y={chartH - 8} textAnchor="middle" fill="#6b6358" fontSize={10} fontWeight={500}>
            {d.month}
          </text>
        ))}
        <text x={padLeft} y={chartH - 8} textAnchor="middle" fill="#d4a574" fontSize={10} fontWeight={600}>
          Now
        </text>

        {/* Optimistic */}
        {showOptimistic && (
          <g style={{ opacity: animProgress, transition: `opacity 0.6s ${EASE}` }}>
            <path d={buildArea('optimistic')} fill="url(#cr-optGrad)" />
            <path
              d={buildPath('optimistic')} fill="none" stroke="#8b5cf6" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round" filter="url(#cr-lineGlow3)"
              strokeDasharray={activeScenario === 0 ? '6,4' : undefined}
            />
            <circle
              cx={toX(projectedCash.length - 1)}
              cy={toY(projectedCash[projectedCash.length - 1].optimistic)}
              r={5} fill="#8b5cf6" stroke="#131720" strokeWidth={2}
            />
            <text
              x={toX(projectedCash.length - 1)}
              y={toY(projectedCash[projectedCash.length - 1].optimistic) - 12}
              textAnchor="middle" fill="#8b5cf6" fontSize={10} fontWeight={700}
            >
              {fmt(projectedCash[projectedCash.length - 1].optimistic)}
            </text>
          </g>
        )}

        {/* Base */}
        {showBase && (
          <g style={{ opacity: animProgress, transition: `opacity 0.6s ${EASE}` }}>
            <path d={buildArea('base')} fill="url(#cr-baseGrad)" />
            <path
              d={buildPath('base')} fill="none" stroke="#6b8f71" strokeWidth={3}
              strokeLinecap="round" strokeLinejoin="round" filter="url(#cr-lineGlow3)"
            />
            <circle
              cx={toX(projectedCash.length - 1)}
              cy={toY(projectedCash[projectedCash.length - 1].base)}
              r={5} fill="#6b8f71" stroke="#131720" strokeWidth={2}
            />
            <text
              x={toX(projectedCash.length - 1)}
              y={toY(projectedCash[projectedCash.length - 1].base) - 12}
              textAnchor="middle" fill="#6b8f71" fontSize={10} fontWeight={700}
            >
              {fmt(projectedCash[projectedCash.length - 1].base)}
            </text>
          </g>
        )}

        {/* Conservative */}
        {showConservative && (
          <g style={{ opacity: animProgress, transition: `opacity 0.6s ${EASE}` }}>
            <path d={buildArea('conservative')} fill="url(#cr-conGrad)" />
            <path
              d={buildPath('conservative')} fill="none" stroke="#e06060" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round" filter="url(#cr-lineGlow3)"
              strokeDasharray={activeScenario === 0 ? '6,4' : undefined}
            />
            <circle
              cx={toX(projectedCash.length - 1)}
              cy={toY(projectedCash[projectedCash.length - 1].conservative)}
              r={5} fill="#e06060" stroke="#131720" strokeWidth={2}
            />
            <text
              x={toX(projectedCash.length - 1)}
              y={toY(projectedCash[projectedCash.length - 1].conservative) - 12}
              textAnchor="middle" fill="#e06060" fontSize={10} fontWeight={700}
            >
              {fmt(projectedCash[projectedCash.length - 1].conservative)}
            </text>
          </g>
        )}

        {/* Hover zones for each month */}
        {projectedCash.map((d, i) => {
          const x = toX(i);
          const isHovered = hoveredMonth === i;
          return (
            <g key={d.month}>
              <rect
                x={x - plotW / projectedCash.length / 2}
                y={padTop} width={plotW / projectedCash.length} height={plotH}
                fill="transparent" style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredMonth(i)}
                onMouseLeave={() => setHoveredMonth(null)}
              />
              {isHovered && (
                <>
                  <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="rgba(212,165,116,0.12)" strokeWidth={1} />
                  <g style={{ animation: `cr-tooltipIn 0.15s ${EASE} both` }}>
                    <rect x={x - 60} y={padTop} width={120} height={64} rx={8}
                      fill="rgba(19,23,32,0.95)" stroke="rgba(212,165,116,0.15)" strokeWidth={1}
                    />
                    <text x={x} y={padTop + 16} textAnchor="middle" fill="#6b8f71" fontSize={10} fontWeight={700}>
                      Base: {fmt(d.base)}
                    </text>
                    {showOptimistic && (
                      <text x={x} y={padTop + 32} textAnchor="middle" fill="#8b5cf6" fontSize={10} fontWeight={600}>
                        Opt: {fmt(d.optimistic)}
                      </text>
                    )}
                    {showConservative && (
                      <text x={x} y={padTop + 48} textAnchor="middle" fill="#e06060" fontSize={10} fontWeight={600}>
                        Con: {fmt(d.conservative)}
                      </text>
                    )}
                  </g>
                </>
              )}
            </g>
          );
        })}

        {/* Starting balance dot */}
        <circle cx={padLeft} cy={toY(CURRENT_BALANCE)} r={6} fill="#d4a574" stroke="#131720" strokeWidth={3} />
        <text x={padLeft + 12} y={toY(CURRENT_BALANCE) - 10} fill="#d4a574" fontSize={11} fontWeight={700}>
          $385K
        </text>
      </svg>
    </div>
  );
}

/* ================================================================
   Cash Position Timeline Bar
   ================================================================ */
function CashPositionTimeline() {
  const progress = useAnimatedValue(1, 1800, 500);
  const maxBalance = 500000;
  const currentPct = (CURRENT_BALANCE / maxBalance) * 100;
  const thresholdPct = (MINIMUM_THRESHOLD / maxBalance) * 100;

  return (
    <div style={{
      ...glass(),
      padding: '20px 24px',
      animation: `cr-fadeIn 0.6s ${EASE} 0.35s both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DollarSign size={16} style={{ color: '#d4a574' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>Cash Position</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#d4a574', fontVariantNumeric: 'tabular-nums' }}>
          <AnimatedCounter target={CURRENT_BALANCE} prefix="$" delay={500} />
        </span>
      </div>

      {/* Timeline bar */}
      <div style={{ position: 'relative', height: 32, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1e2638' }}>
        {/* Danger zone background */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${thresholdPct}%`,
          background: 'linear-gradient(90deg, rgba(224,96,96,0.12), rgba(224,96,96,0.04))',
        }} />

        {/* Active fill */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${currentPct * progress}%`,
          background: 'linear-gradient(90deg, #d4a574, #8b5cf6)',
          borderRadius: 16,
          transition: `width 0.1s linear`,
          boxShadow: '0 0 20px rgba(212,165,116,0.3)',
        }}>
          {/* Shimmer effect */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            backgroundSize: '200% 100%',
            animation: 'cr-shimmer 3s ease-in-out infinite',
            borderRadius: 16,
          }} />
        </div>

        {/* Minimum threshold marker */}
        <div style={{
          position: 'absolute',
          left: `${thresholdPct}%`,
          top: 0, bottom: 0,
          width: 2,
          backgroundColor: '#e06060',
          opacity: 0.6,
        }} />
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 9, color: '#6b6358' }}>$0</span>
        <span style={{ fontSize: 9, color: '#e06060', position: 'relative', left: `${thresholdPct - 50}%` }}>
          Min: {fmt(MINIMUM_THRESHOLD)}
        </span>
        <span style={{ fontSize: 9, color: '#6b6358' }}>{fmt(maxBalance)}</span>
      </div>
    </div>
  );
}

/* ================================================================
   Scenario Cards with Glassmorphism
   ================================================================ */
function ScenarioCard({
  scenario, idx, isActive, onClick,
}: {
  scenario: typeof scenarios[0]; idx: number; isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const maxRunway = 30;
  const pct = Math.min((scenario.runwayNum / maxRunway) * 100, 100);
  const barProgress = useAnimatedValue(pct, 1200, 600 + idx * 150);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...glass(isActive ? `${scenario.color}40` : 'rgba(212,165,116,0.08)'),
        flex: 1,
        padding: '20px 20px 20px 24px',
        textAlign: 'left' as const,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        animation: `cr-slideUp 0.6s ${EASE} ${0.4 + idx * 0.1}s both`,
        transform: hovered ? 'translateY(-3px)' : undefined,
        transition: `transform 0.4s ${EASE}, box-shadow 0.4s ${EASE}, background-color 0.4s ${EASE}`,
        boxShadow: isActive
          ? `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${scenario.color}30, 0 0 24px ${scenario.color}15`
          : hovered
            ? `0 8px 24px rgba(0,0,0,0.25)`
            : '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: isActive ? `${scenario.color}08` : undefined,
        outline: 'none',
      }}
    >
      {/* Color-coded left border */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 4,
        backgroundColor: scenario.color,
        borderRadius: '4px 0 0 4px',
        opacity: isActive ? 1 : 0.4,
        transition: `opacity 0.4s ${EASE}`,
      }} />

      {/* Active glow */}
      {isActive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at left center, ${scenario.color}10, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: isActive ? scenario.color : '#f0ebe4',
          transition: `color 0.3s ${EASE}`,
        }}>
          {scenario.name}
        </span>
        {/* Probability badge */}
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 20,
          backgroundColor: `${scenario.color}15`,
          color: scenario.color,
          border: `1px solid ${scenario.color}25`,
        }}>
          {scenario.probability}
        </span>
      </div>

      <div style={{
        fontSize: 28,
        fontWeight: 800,
        color: scenario.color,
        marginBottom: 6,
        letterSpacing: '-0.02em',
      }}>
        {scenario.runway}
      </div>

      <p style={{ fontSize: 11, color: '#a09888', lineHeight: 1.5, marginBottom: 14 }}>
        {scenario.description}
      </p>

      {/* Animated comparison bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          height: 6, borderRadius: 3, backgroundColor: '#1e2638',
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: `${barProgress}%`,
            background: `linear-gradient(90deg, ${scenario.color}cc, ${scenario.color}66)`,
            borderRadius: 3,
            transformOrigin: 'left',
            boxShadow: isActive ? `0 0 10px ${scenario.color}40` : undefined,
            transition: `box-shadow 0.4s ${EASE}`,
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <div style={{ fontSize: 9, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4' }}>{scenario.revenue}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Burn</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4' }}>{scenario.burn}</div>
        </div>
      </div>
    </button>
  );
}

/* ================================================================
   Monthly Breakdown Table (glassmorphism rows)
   ================================================================ */
function MonthlyBreakdownTable() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div style={{ overflow: 'hidden', borderRadius: 12 }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr 1.2fr 1.2fr 1.2fr',
        padding: '12px 20px',
        backgroundColor: 'rgba(30, 38, 56, 0.6)',
        borderBottom: '1px solid rgba(212,165,116,0.08)',
      }}>
        {['Month', 'Revenue', 'Burn', 'Net', 'Balance'].map((h) => (
          <span key={h} style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#6b6358',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {monthlyBreakdown.map((row, i) => (
        <div
          key={row.month}
          onMouseEnter={() => setHoveredRow(i)}
          onMouseLeave={() => setHoveredRow(null)}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr 1.2fr 1.2fr 1.2fr',
            padding: '14px 20px',
            backgroundColor: hoveredRow === i
              ? 'rgba(212,165,116,0.06)'
              : i % 2 === 0
                ? 'rgba(19, 23, 32, 0.4)'
                : 'rgba(19, 23, 32, 0.2)',
            borderBottom: '1px solid rgba(212,165,116,0.04)',
            transition: `background-color 0.3s ${EASE}`,
            animation: `cr-fadeIn 0.5s ${EASE} ${0.8 + i * 0.06}s both`,
            cursor: 'default',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>{row.month}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#8b5cf6', fontVariantNumeric: 'tabular-nums' }}>
            {fmt(row.revenue)}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e06060', fontVariantNumeric: 'tabular-nums' }}>
            {fmt(row.burn)}
          </span>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: row.net >= 0 ? '#6b8f71' : '#e06060',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {row.net >= 0 ? '+' : ''}{fmt(row.net)}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#d4a574', fontVariantNumeric: 'tabular-nums' }}>
            {fmt(row.balance)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   Alert Threshold Badges
   ================================================================ */
function AlertBadges() {
  const alerts = [
    {
      label: 'Runway',
      value: `${RUNWAY_MONTHS.toFixed(1)} months`,
      status: RUNWAY_MONTHS > ALERT_THRESHOLDS.runwayWarning ? 'healthy' : RUNWAY_MONTHS > ALERT_THRESHOLDS.runwayCritical ? 'warning' : 'critical',
      icon: Gauge,
    },
    {
      label: 'Burn Rate',
      value: fmt(MONTHLY_BURN),
      status: MONTHLY_BURN < ALERT_THRESHOLDS.burnRateHigh ? 'healthy' : 'warning',
      icon: Flame,
    },
    {
      label: 'Cash Balance',
      value: fmt(CURRENT_BALANCE),
      status: CURRENT_BALANCE > ALERT_THRESHOLDS.balanceLow ? 'healthy' : 'critical',
      icon: DollarSign,
    },
  ] as const;

  const statusColors = {
    healthy: '#6b8f71',
    warning: '#e8b44c',
    critical: '#e06060',
  };

  const statusLabels = {
    healthy: 'OK',
    warning: 'WATCH',
    critical: 'ALERT',
  };

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {alerts.map((alert, i) => {
        const color = statusColors[alert.status];
        const isWarning = alert.status !== 'healthy';
        return (
          <div
            key={alert.label}
            style={{
              ...glass(`${color}30`),
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
              minWidth: 180,
              animation: `cr-fadeIn 0.5s ${EASE} ${0.2 + i * 0.1}s both`,
              ...(isWarning ? { boxShadow: `0 0 12px ${color}20` } : {}),
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: `${color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...(isWarning && alert.status === 'critical' ? { animation: 'cr-glowPulse 2s ease-in-out infinite' } : {}),
            }}>
              <alert.icon size={16} style={{ color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {alert.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4' }}>{alert.value}</div>
            </div>
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 12,
              backgroundColor: `${color}18`,
              color,
              border: `1px solid ${color}25`,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              ...(isWarning ? { animation: 'cr-warningGlow 2.5s ease-in-out infinite' } : {}),
            }}>
              {statusLabels[alert.status]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export function CashRunwayView() {
  const [activeScenario, setActiveScenario] = useState<number>(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Scoped Keyframes */}
      <style>{scopedKeyframes}</style>

      {/* ================================================================
         Header
         ================================================================ */}
      <div style={{ animation: `cr-fadeIn 0.7s ${EASE} 0s both`, position: 'relative' }}>
        <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.1))',
            border: '1px solid rgba(212,165,116,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DollarSign size={22} style={{ color: '#d4a574' }} />
          </div>
          <div>
            <h1 className="text-glow" style={{
              fontSize: 28,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #d4a574, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              Cash Runway
            </h1>
            <p style={{ fontSize: 14, color: '#a09888', marginTop: 2 }}>
              Financial health dashboard for Frequency Unite
            </p>
          </div>
        </div>
        <p style={{ fontSize: 15, color: '#6b6358', maxWidth: 700, lineHeight: 1.6 }}>
          Track cash position, burn rate, and runway to ensure long-term sustainability.
        </p>
      </div>

      {/* ================================================================
         Alert Threshold Badges
         ================================================================ */}
      <AlertBadges />

      {/* ================================================================
         Financial Summary Cards (with animated count-up numbers)
         ================================================================ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}>
        <FinancialSummaryCard
          label="Current Balance"
          value="$385K"
          numericValue={385}
          icon={DollarSign}
          iconColor="#d4a574"
          sparkData={balanceSparkline}
          trendLabel="+$15K from last month"
          trendDirection="up"
          delay={0.05}
          prefix=""
          suffix=""
        />
        <FinancialSummaryCard
          label="Monthly Burn"
          value="$22K"
          numericValue={22}
          icon={TrendingDown}
          iconColor="#e06060"
          sparkData={burnSparkline}
          trendLabel="-$4K from Jan peak"
          trendDirection="down"
          delay={0.1}
        />
        <FinancialSummaryCard
          label="Monthly Revenue"
          value="$78K"
          numericValue={78}
          icon={TrendingUp}
          iconColor="#8b5cf6"
          sparkData={revenueSparkline}
          trendLabel="+26% since Oct"
          trendDirection="up"
          delay={0.15}
        />
        <FinancialSummaryCard
          label="Net Cash Flow"
          value={`+${fmt(NET_MONTHLY)}/mo`}
          numericValue={56}
          icon={Activity}
          iconColor="#6b8f71"
          sparkData={[41, 42, 46, 48, 54, 56]}
          trendLabel="Cash flow positive"
          trendDirection="up"
          delay={0.2}
          prefix="+"
          suffix=""
        />
      </div>

      {/* ================================================================
         Burn Rate Indicator + Cash Position Timeline
         ================================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <BurnRateIndicator />
        <CashPositionTimeline />
      </div>

      {/* ================================================================
         Semicircular Runway Gauge
         ================================================================ */}
      <div className="card-premium" style={{
        ...glass(),
        padding: '28px 32px',
        animation: `cr-slideUp 0.7s ${EASE} 0.25s both`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Gauge size={20} style={{ color: '#d4a574' }} />
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4' }}>Runway Gauge</h2>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 12px',
            borderRadius: 20,
            color: runwayColor(RUNWAY_MONTHS),
            backgroundColor: `${runwayColor(RUNWAY_MONTHS)}15`,
            border: `1px solid ${runwayColor(RUNWAY_MONTHS)}25`,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {runwayLabel(RUNWAY_MONTHS)}
          </span>
        </div>

        <RunwayGauge />

        {/* Supporting info bar */}
        <div style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: '1px solid rgba(212,165,116,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Cash in Bank', value: fmtFull(CURRENT_BALANCE), color: '#d4a574' },
            { label: 'Monthly Burn', value: fmt(MONTHLY_BURN), color: '#e06060' },
            { label: 'Monthly Revenue', value: fmt(MONTHLY_REVENUE), color: '#8b5cf6' },
            { label: 'Net Monthly', value: `+${fmt(NET_MONTHLY)}`, color: '#6b8f71' },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {item.label}
              </p>
              <p style={{ fontSize: 16, fontWeight: 800, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================
         12-Month Cash Projection
         ================================================================ */}
      <div className="card-premium" style={{
        ...glass(),
        padding: '28px 32px',
        animation: `cr-slideUp 0.7s ${EASE} 0.35s both`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BarChart3 size={20} style={{ color: '#d4a574' }} />
            <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4' }}>12-Month Cash Projection</h2>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#6b6358', marginBottom: 20 }}>
          Projected cash balance over the next 12 months. Red zone indicates minimum reserve threshold.
        </p>

        {/* Chart Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Base Case', color: '#6b8f71', solid: true },
            { label: 'Optimistic', color: '#8b5cf6', dashed: activeScenario === 0 },
            { label: 'Conservative', color: '#e06060', dashed: activeScenario === 0 },
            { label: 'Min Reserve ($100K)', color: '#e06060', opacity: 0.5 },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 18, height: 3, borderRadius: 2,
                backgroundColor: item.color,
                opacity: item.opacity ?? 1,
              }} />
              <span style={{ fontSize: 11, color: '#6b6358' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <ProjectedCashChart activeScenario={activeScenario} />
      </div>

      {/* ================================================================
         Scenario Modeling (glassmorphism cards)
         ================================================================ */}
      <div className="card-premium" style={{
        ...glass(),
        padding: '28px 32px',
        animation: `cr-slideUp 0.7s ${EASE} 0.45s both`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Layers size={20} style={{ color: '#8b5cf6' }} />
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4' }}>Scenario Modeling</h2>
        </div>

        {/* Scenario Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          {scenarios.map((scenario, idx) => (
            <ScenarioCard
              key={scenario.name}
              scenario={scenario}
              idx={idx}
              isActive={activeScenario === idx}
              onClick={() => setActiveScenario(idx)}
            />
          ))}
        </div>

        {/* Runway Visual Comparison */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Runway Comparison
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {scenarios.map((scenario, idx) => {
              const maxRunway = 30;
              const pct = Math.min((scenario.runwayNum / maxRunway) * 100, 100);
              return (
                <div key={scenario.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 12, color: '#a09888', width: 100, flexShrink: 0 }}>{scenario.name}</span>
                  <div className="progress-bar-animated" style={{
                    flex: 1, height: 8, backgroundColor: '#1e2638', borderRadius: 4, overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${scenario.color}dd, ${scenario.color}77)`,
                      borderRadius: 4,
                      boxShadow: activeScenario === idx ? `0 0 12px ${scenario.color}40` : 'none',
                      transition: `box-shadow 0.4s ${EASE}`,
                      animation: `cr-barGrow 1.2s ${EASE} ${0.6 + idx * 0.15}s both`,
                      transformOrigin: 'left',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: scenario.color, width: 90, textAlign: 'right' }}>
                    {scenario.runway}
                  </span>
                </div>
              );
            })}
            {/* 12-month safety line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 100, flexShrink: 0 }} />
              <div style={{ flex: 1, position: 'relative', height: 16 }}>
                <div style={{
                  position: 'absolute',
                  left: `${(12 / 30) * 100}%`,
                  top: 0, bottom: 0,
                  width: 2,
                  borderLeft: '2px dashed rgba(232, 180, 76, 0.4)',
                }} />
                <span style={{
                  position: 'absolute',
                  left: `${(12 / 30) * 100}%`,
                  top: -12,
                  transform: 'translateX(-50%)',
                  fontSize: 9,
                  color: '#e8b44c',
                  fontWeight: 700,
                }}>
                  12mo safety line
                </span>
              </div>
              <span style={{ width: 90 }} />
            </div>
          </div>
        </div>

        {/* Scenario comparison metrics */}
        <div style={{
          paddingTop: 20,
          borderTop: '1px solid rgba(212,165,116,0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {scenarios.map((s) => (
            <div
              key={s.name}
              style={{
                ...glass(`${s.color}20`),
                padding: '14px 18px',
                backgroundColor: `${s.color}06`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginBottom: 10 }}>
                {s.name} Projection
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: '#6b6358' }}>12-Mo Cash</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f0ebe4', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(CURRENT_BALANCE + (s.revenueNum - s.burnNum) * 12)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: '#6b6358' }}>Net/Month</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: s.revenueNum - s.burnNum >= 0 ? '#6b8f71' : '#e06060',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {s.revenueNum - s.burnNum >= 0 ? '+' : ''}{fmt(s.revenueNum - s.burnNum)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================
         Revenue vs Plan (dual-line SVG with gradient fills & hover tooltips)
         ================================================================ */}
      <div className="card-premium" style={{
        ...glass(),
        padding: '28px 32px',
        animation: `cr-slideUp 0.7s ${EASE} 0.55s both`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <BarChart3 size={20} style={{ color: '#d4a574' }} />
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4' }}>Revenue vs Plan</h2>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            backgroundColor: 'rgba(19, 23, 32, 0.5)',
            color: '#6b6358',
            border: '1px solid rgba(212,165,116,0.08)',
          }}>
            Last 6 months
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: '#8b5cf6' }} />
            <span style={{ fontSize: 11, color: '#a09888' }}>Actual</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, border: '2px dashed rgba(212,165,116,0.5)', backgroundColor: 'transparent' }} />
            <span style={{ fontSize: 11, color: '#a09888' }}>Plan</span>
          </div>
        </div>

        <RevenueVsPlanChart />

        {/* Summary */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid rgba(212,165,116,0.08)',
        }}>
          {[
            { label: '6-Month Actual', value: fmt(revenueVsPlan.reduce((s, d) => s + d.actual, 0)), color: '#8b5cf6' },
            { label: '6-Month Plan', value: fmt(revenueVsPlan.reduce((s, d) => s + d.plan, 0)), color: '#d4a574' },
            { label: 'Variance', value: `+${fmt(revenueVsPlan.reduce((s, d) => s + d.actual, 0) - revenueVsPlan.reduce((s, d) => s + d.plan, 0))}`, color: '#6b8f71' },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================
         Revenue Breakdown + Break-Even (side by side)
         ================================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Revenue Breakdown */}
        <div className="card-premium" style={{
          ...glass(),
          padding: '28px 32px',
          animation: `cr-slideUp 0.7s ${EASE} 0.65s both`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Target size={20} style={{ color: '#d4a574' }} />
            <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4' }}>Revenue Breakdown</h2>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              backgroundColor: 'rgba(19,23,32,0.5)', color: '#6b6358',
              border: '1px solid rgba(212,165,116,0.08)',
            }}>
              {fmt(MONTHLY_REVENUE)}/mo
            </span>
          </div>

          {/* Stacked bar */}
          <div className="progress-bar-animated" style={{
            height: 10, borderRadius: 5, overflow: 'hidden',
            display: 'flex', marginBottom: 24,
          }}>
            {revenueBreakdown.map((seg, i) => (
              <div
                key={seg.label}
                style={{
                  height: '100%',
                  width: `${seg.pct}%`,
                  backgroundColor: seg.color,
                  animation: `cr-barGrow 1s ${EASE} ${0.7 + i * 0.1}s both`,
                  transformOrigin: 'left',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {revenueBreakdown.map((seg) => (
              <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: seg.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#f0ebe4', flex: 1 }}>{seg.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(seg.amount)}
                </span>
                <span style={{ fontSize: 11, color: '#6b6358', width: 36, textAlign: 'right' }}>{seg.pct}%</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 20, paddingTop: 16,
            borderTop: '1px solid rgba(212,165,116,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: '#6b6358' }}>Total Monthly Revenue</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#d4a574' }}>{fmt(MONTHLY_REVENUE)}</span>
          </div>
        </div>

        {/* Break-Even Progress */}
        <div className="card-premium" style={{
          ...glass(),
          padding: '28px 32px',
          animation: `cr-slideUp 0.7s ${EASE} 0.7s both`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Zap size={20} style={{ color: '#e8b44c' }} />
            <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4' }}>Break-Even Progress</h2>
          </div>

          {/* Ring gauge */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="68" fill="none" stroke="#1e2638" strokeWidth="12" />
                <circle
                  cx="80" cy="80" r="68"
                  fill="none" stroke="#6b8f71" strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(2 * Math.PI * 68 * breakEvenPct) / 100} ${2 * Math.PI * 68}`}
                  transform="rotate(-90 80 80)"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(107,143,113,0.4))' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#6b8f71' }}>
                  <AnimatedCounter target={Math.round(breakEvenPct)} suffix="%" delay={800} />
                </span>
                <span style={{ fontSize: 10, color: '#6b6358' }}>self-sustaining</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Monthly Revenue', value: fmt(MONTHLY_REVENUE), color: '#6b8f71', icon: TrendingUp },
              { label: 'Monthly Burn', value: fmt(MONTHLY_BURN), color: '#e06060', icon: TrendingDown },
              { label: 'Net Monthly Cash Flow', value: `+${fmt(currentMonthlyNet)}`, color: '#6b8f71', icon: CheckCircle },
            ].map((item) => (
              <div key={item.label} style={{
                ...glass(),
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: 10, color: '#6b6358', marginBottom: 2 }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</p>
                </div>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16, paddingTop: 14,
            borderTop: '1px solid rgba(212,165,116,0.08)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <CheckCircle size={14} style={{ color: '#6b8f71' }} />
            <span style={{ fontSize: 11, color: '#6b8f71', fontWeight: 600 }}>
              Cash flow positive -- revenue exceeds burn by {fmt(currentMonthlyNet)}/mo
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================
         Monthly Breakdown Table (glassmorphism rows)
         ================================================================ */}
      <div className="card-premium" style={{
        ...glass(),
        padding: '28px 32px',
        animation: `cr-slideUp 0.7s ${EASE} 0.75s both`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <BarChart3 size={20} style={{ color: '#8b5cf6' }} />
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4' }}>Monthly Breakdown</h2>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            backgroundColor: 'rgba(19,23,32,0.5)', color: '#6b6358',
            border: '1px solid rgba(212,165,116,0.08)',
          }}>
            6-month history
          </span>
        </div>

        <MonthlyBreakdownTable />
      </div>

      {/* ================================================================
         Key Assumptions
         ================================================================ */}
      <div className="card-premium" style={{
        ...glass(),
        padding: '28px 32px',
        animation: `cr-slideUp 0.7s ${EASE} 0.85s both`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Shield size={20} style={{ color: '#8b5cf6' }} />
          <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4' }}>Key Assumptions</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 12,
        }}>
          {assumptions.map((a, i) => (
            <div
              className="card-interactive"
              key={a.label}
              style={{
                ...glass(),
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: `cr-fadeIn 0.5s ${EASE} ${0.9 + i * 0.06}s both`,
              }}
            >
              <div>
                <p style={{ fontSize: 11, color: '#6b6358', marginBottom: 4 }}>{a.label}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>{a.value}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {a.trend === 'up' && <TrendingUp size={14} style={{ color: '#6b8f71' }} />}
                {a.trend === 'stable' && <ArrowRight size={14} style={{ color: '#a09888' }} />}
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: a.trend === 'up' ? '#6b8f71' : '#a09888',
                }}>
                  {a.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Risk callout */}
        <div style={{
          marginTop: 20,
          padding: '18px 20px',
          borderRadius: 14,
          backgroundColor: 'rgba(232, 180, 76, 0.06)',
          border: '1px solid rgba(232, 180, 76, 0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          animation: `cr-fadeIn 0.6s ${EASE} 1.2s both`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: 'rgba(232, 180, 76, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            animation: 'cr-warningGlow 3s ease-in-out infinite',
          }}>
            <AlertTriangle size={18} style={{ color: '#e8b44c' }} />
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#f0ebe4', lineHeight: 1.6 }}>
              Key risk: Member churn above 5%/mo would reduce runway below 12 months.
              Blue Spirit event revenue is lumpy and depends on 70+ ticket sales.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <ArrowRight size={12} style={{ color: '#a09888' }} />
              <span style={{ fontSize: 12, color: '#a09888' }}>
                Mitigation: Pre-sales campaign + member retention focus in Q2
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
