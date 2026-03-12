'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Users,
  Gauge,
  BarChart3,
  Target,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
  PieChart,
  Activity,
  Briefcase,
  Cpu,
  Megaphone,
  PartyPopper,
  Layers,
  Zap,
  Flag,
} from 'lucide-react';
import { exportPdf } from '@/lib/data';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { Database } from 'lucide-react';

/* ================================================================
   Premium Dashboard Styles (injected once)
   ================================================================ */
const DASHBOARD_STYLES = `
  @keyframes barGrow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }
  @keyframes barGrowX {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  @keyframes sweepReveal {
    from { clip-path: polygon(50% 50%, 50% 0%, 50% 0%, 50% 0%, 50% 0%); }
    to { clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%); }
  }
  @keyframes countFade {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes runwayGlow {
    0%, 100% { box-shadow: 0 0 8px rgba(212,165,116,0.2); }
    50% { box-shadow: 0 0 16px rgba(212,165,116,0.4); }
  }
  @keyframes pulseIndicator {
    0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
    50% { transform: translateX(-50%) scale(1.4); opacity: 0.6; }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes runwayBarFill {
    from { width: 0%; }
    to { width: var(--target-width); }
  }
  @keyframes progressShine {
    0% { left: -30%; }
    100% { left: 130%; }
  }
  @keyframes gaugeNeedleSwing {
    from { transform: rotate(-90deg); }
  }
  @keyframes milestoneAppear {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes cardFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  @keyframes ringDraw {
    from { stroke-dashoffset: var(--ring-circumference, 251); }
    to { stroke-dashoffset: var(--ring-offset, 0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes celebrationBurst {
    0% { transform: scale(0); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  @keyframes confettiDrift {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-40px) rotate(360deg); opacity: 0; }
  }
  @keyframes pieSliceHover {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.25); }
  }
  @keyframes alertBannerSlideIn {
    from { opacity: 0; transform: translateX(-16px) scale(0.97); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes alertPulse {
    0%, 100% { box-shadow: 0 0 0 0 var(--alert-pulse-color, rgba(232,180,76,0.3)); }
    50% { box-shadow: 0 0 16px 4px var(--alert-pulse-color, rgba(232,180,76,0.15)); }
  }
  @keyframes miniBarGrow {
    from { height: 0; }
    to { height: var(--bar-height, 0); }
  }
  @keyframes celebrateShine {
    0% { left: -100%; }
    100% { left: 200%; }
  }
  @keyframes pieCenterPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }

  .budget-pie-segment {
    transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    cursor: default;
  }
  .budget-pie-segment:hover {
    filter: brightness(1.3) drop-shadow(0 0 8px var(--seg-color, rgba(212,165,116,0.5)));
    transform-origin: center;
  }

  .budget-threshold-banner {
    animation: alertBannerSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    position: relative;
    overflow: hidden;
  }
  .budget-threshold-banner::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--banner-accent, #e8b44c);
    border-radius: 3px 0 0 3px;
  }
  .budget-threshold-banner:hover {
    transform: translateX(3px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }

  .budget-mini-comparison-bar {
    transition: height 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
  }
  .budget-mini-comparison:hover .budget-mini-comparison-bar {
    opacity: 0.5;
  }
  .budget-mini-comparison:hover .budget-mini-comparison-bar:hover {
    opacity: 1;
  }

  .budget-celebration-badge {
    animation: milestoneAppear 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
    position: relative;
    overflow: hidden;
  }
  .budget-celebration-badge::after {
    content: '';
    position: absolute;
    top: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: celebrateShine 3s ease-in-out infinite;
  }

  .budget-metric-card {
    background: rgba(19,23,32,0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 20px 22px;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s;
    animation: fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) both;
    cursor: default;
  }
  .budget-metric-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 30px var(--glow-color, rgba(212,165,116,0.1));
    border-color: rgba(255,255,255,0.1);
  }
  .budget-metric-card .card-glow {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    border-radius: 16px;
  }
  .budget-metric-card:hover .card-glow {
    opacity: 1;
  }
  .budget-metric-card .trend-arrow {
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    display: inline-flex;
  }
  .budget-metric-card:hover .trend-arrow-up {
    transform: translateY(-2px);
  }
  .budget-metric-card:hover .trend-arrow-down {
    transform: translateY(2px);
  }
  .budget-metric-card .metric-value {
    animation: countFade 0.8s cubic-bezier(0.4,0,0.2,1) both;
  }

  .budget-card-panel {
    background: rgba(19,23,32,0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .budget-card-panel:hover {
    border-color: rgba(255,255,255,0.1);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }

  .budget-legend-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 10px;
    background-color: rgba(255,255,255,0.02);
    transition: background-color 0.25s, transform 0.2s;
    animation: fadeSlideIn 0.5s cubic-bezier(0.4,0,0.2,1) both;
  }
  .budget-legend-row:hover {
    background-color: rgba(255,255,255,0.06);
    transform: translateX(4px);
  }

  .budget-table-row {
    transition: background-color 0.25s;
  }
  .budget-table-row:hover {
    background-color: rgba(255,255,255,0.03);
  }

  .budget-bar-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .budget-burn-bar:hover .budget-bar-shimmer {
    opacity: 1;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  .budget-category-bar-wrapper {
    transition: opacity 0.3s;
  }
  .budget-category-bars:hover .budget-category-bar-wrapper {
    opacity: 0.4;
  }
  .budget-category-bars:hover .budget-category-bar-wrapper:hover {
    opacity: 1;
  }

  .budget-cashflow-bar-group {
    transition: opacity 0.3s;
  }
  .budget-cashflow-chart:hover .budget-cashflow-bar-group {
    opacity: 0.5;
  }
  .budget-cashflow-chart:hover .budget-cashflow-bar-group:hover {
    opacity: 1;
  }

  .budget-alert-card {
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .budget-alert-card:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }

  .budget-runway-fill {
    position: relative;
    overflow: hidden;
  }
  .budget-runway-fill::after {
    content: '';
    position: absolute;
    top: 0;
    width: 20%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    animation: progressShine 3s ease-in-out infinite;
  }

  .budget-export-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(19,23,32,0.8);
    backdrop-filter: blur(8px);
    color: #a09888;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s;
    font-family: inherit;
  }
  .budget-export-btn:hover {
    border-color: rgba(212,165,116,0.3);
    color: #d4a574;
    background: rgba(212,165,116,0.08);
    box-shadow: 0 0 20px rgba(212,165,116,0.1);
  }

  .budget-decision-row {
    transition: background-color 0.25s;
  }
  .budget-decision-row:hover {
    background-color: rgba(255,255,255,0.03);
  }

  .budget-cat-card {
    background: rgba(19,23,32,0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 14px;
    padding: 18px;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s;
    cursor: default;
  }
  .budget-cat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.35);
    border-color: rgba(255,255,255,0.1);
  }
  .budget-cat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--cat-color, rgba(212,165,116,0.6)), transparent);
  }

  .budget-gauge-zone:hover {
    filter: brightness(1.3);
    cursor: default;
  }

  .budget-milestone-marker {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  .budget-milestone-marker:hover {
    transform: scale(1.3) translateY(-2px);
  }
`;

/* ================================================================
   Constants & Data
   ================================================================ */

const CASH_IN_BANK = 210000;
const MONTHLY_BURN = 25000;
const RUNWAY_MONTHS = CASH_IN_BANK / MONTHLY_BURN; // 8.4
const MONTHLY_REVENUE = 18000;

const runwayColor = (months: number) => {
  if (months > 6) return '#6b8f71';
  if (months >= 3) return '#e8b44c';
  return '#e06060';
};

const runwayLabel = (months: number) => {
  if (months > 6) return 'Healthy';
  if (months >= 3) return 'Caution';
  return 'Critical';
};

/* -- Monthly Burn Data -- */
const burnData = [
  { month: 'Oct', label: 'Oct 2025', amount: 21000, note: null },
  { month: 'Nov', label: 'Nov 2025', amount: 23000, note: null },
  { month: 'Dec', label: 'Dec 2025', amount: 24000, note: null },
  { month: 'Jan', label: 'Jan 2026', amount: 26000, note: 'Cabo expenses' },
  { month: 'Feb', label: 'Feb 2026', amount: 22000, note: null },
  { month: 'Mar', label: 'Mar 2026', amount: 23000, note: 'Projected' },
];

const BURN_TARGET = 25000;
const MAX_BURN = Math.max(...burnData.map((d) => d.amount), BURN_TARGET) * 1.15;

/* -- Budget vs Actuals -- */
interface BudgetLine {
  category: string;
  budget: number;
  actual: number;
  color: string;
  icon: React.ElementType;
}

const budgetLines: BudgetLine[] = [
  { category: 'Core Team Payroll', budget: 15000, actual: 14500, color: '#d4a574', icon: Users },
  { category: 'Operations', budget: 4000, actual: 3800, color: '#8b5cf6', icon: Briefcase },
  { category: 'Events', budget: 3000, actual: 3200, color: '#6b8f71', icon: PartyPopper },
  { category: 'Technology', budget: 1000, actual: 800, color: '#5eaed4', icon: Cpu },
  { category: 'Marketing / Outreach', budget: 1000, actual: 600, color: '#e879a0', icon: Megaphone },
  { category: 'Misc / Buffer', budget: 1000, actual: 1200, color: '#e8b44c', icon: Layers },
];

const ragStatus = (variance: number, budget: number) => {
  const pct = Math.abs(variance) / budget;
  if (variance >= 0) return { color: '#6b8f71', label: 'Under', bg: 'rgba(107, 143, 113, 0.15)' };
  if (pct <= 0.1) return { color: '#e8b44c', label: 'Amber', bg: 'rgba(232, 180, 76, 0.15)' };
  return { color: '#e06060', label: 'Over', bg: 'rgba(224, 96, 96, 0.15)' };
};

/* -- Monthly Cash Flow Data (Revenue vs Expenses per month) -- */
const monthlyCashFlow = [
  { month: 'Oct', revenue: 14000, expenses: 21000 },
  { month: 'Nov', revenue: 15000, expenses: 23000 },
  { month: 'Dec', revenue: 16000, expenses: 24000 },
  { month: 'Jan', revenue: 17000, expenses: 26000 },
  { month: 'Feb', revenue: 18000, expenses: 22000 },
  { month: 'Mar', revenue: 18000, expenses: 23000 },
];

const MAX_CASHFLOW = Math.max(
  ...monthlyCashFlow.map((d) => Math.max(d.revenue, d.expenses))
) * 1.1;

/* -- Revenue Progression -- */
const revenueTarget = 2000000;
const monthlyRevenue = [
  { month: 'Oct', cumulative: 120000 },
  { month: 'Nov', cumulative: 135000 },
  { month: 'Dec', cumulative: 150000 },
  { month: 'Jan', cumulative: 160000 },
  { month: 'Feb', cumulative: 170000 },
  { month: 'Mar', cumulative: 180000 },
];
const currentRevenue = monthlyRevenue[monthlyRevenue.length - 1].cumulative;
const revenuePct = (currentRevenue / revenueTarget) * 100;

/* Revenue milestones */
const revenueMilestones = [
  { label: '$250K', value: 250000, pct: (250000 / revenueTarget) * 100 },
  { label: '$500K', value: 500000, pct: (500000 / revenueTarget) * 100 },
  { label: '$1M', value: 1000000, pct: (1000000 / revenueTarget) * 100 },
  { label: '$1.5M', value: 1500000, pct: (1500000 / revenueTarget) * 100 },
  { label: '$2M', value: 2000000, pct: 100 },
];

/* -- Decision Rights -- */
const decisionRights = [
  {
    threshold: '< $5K',
    decides: 'Sian',
    informs: 'James',
    color: '#6b8f71',
  },
  {
    threshold: '$5K - $25K',
    decides: 'Sian recommends',
    informs: 'James approves',
    color: '#e8b44c',
  },
  {
    threshold: '> $25K',
    decides: 'Core Stewardship Team',
    informs: 'Full alignment required',
    color: '#e06060',
  },
  {
    threshold: 'Governance',
    decides: 'Core Team decides',
    informs: 'Wisdom Council advises',
    color: '#8b5cf6',
  },
  {
    threshold: 'Hires',
    decides: 'James proposes',
    informs: 'Core Team approves',
    color: '#5eaed4',
  },
];

/* -- Alerts -- */
const alerts = [
  {
    severity: 'amber' as const,
    message: 'January burn exceeded $25K target by $1K due to Cabo retreat expenses.',
    date: 'Jan 2026',
  },
  {
    severity: 'amber' as const,
    message: 'Misc/Buffer category over budget by $200 -- review discretionary spending.',
    date: 'Mar 2026',
  },
  {
    severity: 'red' as const,
    message: 'Revenue at 9% of $2M target with 9 months remaining. Acceleration needed.',
    date: 'Mar 2026',
  },
];

const alertStyles = {
  amber: {
    bg: 'rgba(232, 180, 76, 0.06)',
    border: 'rgba(232, 180, 76, 0.2)',
    text: '#e8b44c',
    icon: '#e8b44c',
  },
  red: {
    bg: 'rgba(224, 96, 96, 0.06)',
    border: 'rgba(224, 96, 96, 0.2)',
    text: '#e06060',
    icon: '#e06060',
  },
};

/* ================================================================
   Helpers
   ================================================================ */
const fmt = (n: number) => {
  if (isNaN(n)) return '$0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return abs >= 1000 ? `${sign}$${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}K` : `${sign}$${abs}`;
};

const fmtFull = (n: number) => {
  if (n < 0) return `-$${Math.abs(n).toLocaleString()}`;
  return `$${n.toLocaleString()}`;
};

/* ================================================================
   AnimatedNumber Component
   ================================================================ */
function AnimatedNumber({ value, duration = 1200, prefix = '', suffix = '', style }: {
  value: number; duration?: number; prefix?: string; suffix?: string; style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const step = (ts: number) => {
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);

  return <span style={style}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

/* ================================================================
   Animated SVG Pie Chart with Interactive Segments
   ================================================================ */
function AnimatedPieChart({
  data,
  size = 240,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimProgress(1), 200);
    return () => clearTimeout(timer);
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);
  const center = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR * 0.58;

  // Build SVG path arcs for true pie segments
  const segments: {
    path: string;
    label: string;
    value: number;
    color: string;
    midAngle: number;
    pct: number;
  }[] = [];

  let cumulativeAngle = -Math.PI / 2; // start at top

  data.forEach((seg) => {
    const pct = seg.value / total;
    const angle = pct * 2 * Math.PI * animProgress;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    const midAngle = startAngle + angle / 2;
    const largeArc = angle > Math.PI ? 1 : 0;

    const x1o = center + outerR * Math.cos(startAngle);
    const y1o = center + outerR * Math.sin(startAngle);
    const x2o = center + outerR * Math.cos(endAngle);
    const y2o = center + outerR * Math.sin(endAngle);

    const x1i = center + innerR * Math.cos(endAngle);
    const y1i = center + innerR * Math.sin(endAngle);
    const x2i = center + innerR * Math.cos(startAngle);
    const y2i = center + innerR * Math.sin(startAngle);

    const path = [
      `M ${x1o} ${y1o}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i}`,
      'Z',
    ].join(' ');

    segments.push({ path, label: seg.label, value: seg.value, color: seg.color, midAngle, pct });
    cumulativeAngle = endAngle;
  });

  const activeSegment = hoveredSegment || selectedSegment;
  const activeData = activeSegment ? data.find(d => d.label === activeSegment) : null;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {/* Outer glow ring */}
        <circle
          cx={center} cy={center} r={outerR + 4}
          fill="none" stroke="rgba(212,165,116,0.06)" strokeWidth={1}
        />
        {/* Background ring */}
        <circle
          cx={center} cy={center} r={(outerR + innerR) / 2}
          fill="none" stroke="rgba(30,38,56,0.4)" strokeWidth={outerR - innerR}
        />
        {/* Pie segments */}
        {segments.map((seg, i) => {
          const isActive = activeSegment === seg.label;
          const explodeDistance = isActive ? 6 : 0;
          const tx = explodeDistance * Math.cos(seg.midAngle);
          const ty = explodeDistance * Math.sin(seg.midAngle);

          return (
            <g key={seg.label}>
              <path
                className="budget-pie-segment"
                d={seg.path}
                fill={seg.color}
                opacity={activeSegment && !isActive ? 0.35 : 0.85}
                style={{
                  ['--seg-color' as string]: seg.color,
                  transform: `translate(${tx}px, ${ty}px)`,
                  filter: isActive
                    ? `drop-shadow(0 0 12px ${seg.color}60) brightness(1.15)`
                    : `drop-shadow(0 0 4px ${seg.color}30)`,
                  transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s, filter 0.3s',
                } as React.CSSProperties}
                onMouseEnter={() => setHoveredSegment(seg.label)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => setSelectedSegment(selectedSegment === seg.label ? null : seg.label)}
              />
              {/* Segment separator line */}
              {animProgress > 0.5 && (
                <line
                  x1={center + innerR * Math.cos(seg.midAngle - (seg.pct * Math.PI * animProgress))}
                  y1={center + innerR * Math.sin(seg.midAngle - (seg.pct * Math.PI * animProgress))}
                  x2={center + outerR * Math.cos(seg.midAngle - (seg.pct * Math.PI * animProgress))}
                  y2={center + outerR * Math.sin(seg.midAngle - (seg.pct * Math.PI * animProgress))}
                  stroke="rgba(11,13,20,0.6)"
                  strokeWidth={1.5}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}
        {/* Inner circle for depth effect */}
        <circle
          cx={center} cy={center} r={innerR - 1}
          fill="rgba(19,23,32,0.95)"
          stroke="rgba(30,38,56,0.3)"
          strokeWidth={1}
        />
        {/* Subtle inner ring glow */}
        <circle
          cx={center} cy={center} r={innerR + 1}
          fill="none"
          stroke="rgba(212,165,116,0.08)"
          strokeWidth={1}
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
          pointerEvents: 'none',
          animation: 'pieCenterPulse 4s ease-in-out infinite',
        }}
      >
        {activeData ? (
          <>
            <span style={{
              fontSize: 10, color: activeData.color, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2,
              transition: 'color 0.3s',
            }}>
              {activeData.label}
            </span>
            <span style={{
              fontSize: 26, fontWeight: 800, color: '#f0ebe4', lineHeight: 1,
              transition: 'all 0.3s',
            }}>
              {fmtFull(activeData.value)}
            </span>
            <span style={{
              fontSize: 12, color: activeData.color, marginTop: 3,
              fontWeight: 700, transition: 'color 0.3s',
            }}>
              {((activeData.value / total) * 100).toFixed(1)}%
            </span>
          </>
        ) : (
          <>
            <span style={{
              fontSize: 26, fontWeight: 800, color: '#f0ebe4', lineHeight: 1,
              animation: 'countFade 0.8s cubic-bezier(0.4,0,0.2,1) 0.6s both',
            }}>
              {fmtFull(total)}
            </span>
            <span style={{
              fontSize: 11, color: '#6b6358', marginTop: 4,
              animation: 'countFade 0.8s cubic-bezier(0.4,0,0.2,1) 0.8s both',
            }}>
              total budget
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Budget Threshold Alert Banners
   ================================================================ */
function BudgetThresholdBanners({ lines, totalBudget }: { lines: BudgetLine[]; totalBudget: number }) {
  const overBudgetLines = lines.filter(l => l.actual > l.budget);
  const nearBudgetLines = lines.filter(l => {
    const usage = l.actual / l.budget;
    return usage >= 0.9 && usage <= 1.0;
  });

  if (overBudgetLines.length === 0 && nearBudgetLines.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {overBudgetLines.map((line, i) => {
        const overAmt = line.actual - line.budget;
        const overPct = ((overAmt / line.budget) * 100).toFixed(1);
        return (
          <div
            key={line.category}
            className="budget-threshold-banner"
            style={{
              background: 'linear-gradient(135deg, rgba(224,96,96,0.08), rgba(19,23,32,0.6))',
              border: '1px solid rgba(224,96,96,0.2)',
              borderRadius: 12,
              padding: '12px 16px 12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              animationDelay: `${i * 0.1}s`,
              ['--banner-accent' as string]: '#e06060',
              ['--alert-pulse-color' as string]: 'rgba(224,96,96,0.2)',
              animation: `alertBannerSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s both, alertPulse 3s ease-in-out ${1 + i * 0.5}s infinite`,
            } as React.CSSProperties}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: 'rgba(224,96,96,0.12)',
              border: '1px solid rgba(224,96,96,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={16} style={{ color: '#e06060' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4', marginBottom: 2 }}>
                {line.category} over budget
              </div>
              <div style={{ fontSize: 11, color: '#a09888' }}>
                Exceeded by <span style={{ color: '#e06060', fontWeight: 600 }}>{fmtFull(overAmt)}</span> ({overPct}% over)
              </div>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: '#e06060', backgroundColor: 'rgba(224,96,96,0.15)',
              borderRadius: 8, padding: '3px 10px', flexShrink: 0,
            }}>
              Over Budget
            </span>
          </div>
        );
      })}
      {nearBudgetLines.map((line, i) => {
        const usagePct = ((line.actual / line.budget) * 100).toFixed(1);
        const remaining = line.budget - line.actual;
        return (
          <div
            key={line.category}
            className="budget-threshold-banner"
            style={{
              background: 'linear-gradient(135deg, rgba(232,180,76,0.06), rgba(19,23,32,0.6))',
              border: '1px solid rgba(232,180,76,0.15)',
              borderRadius: 12,
              padding: '12px 16px 12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              animationDelay: `${(overBudgetLines.length + i) * 0.1}s`,
              ['--banner-accent' as string]: '#e8b44c',
              ['--alert-pulse-color' as string]: 'rgba(232,180,76,0.15)',
              animation: `alertBannerSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) ${(overBudgetLines.length + i) * 0.1}s both`,
              transition: 'transform 0.25s, box-shadow 0.25s',
            } as React.CSSProperties}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: 'rgba(232,180,76,0.1)',
              border: '1px solid rgba(232,180,76,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Zap size={16} style={{ color: '#e8b44c' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4', marginBottom: 2 }}>
                {line.category} nearing limit
              </div>
              <div style={{ fontSize: 11, color: '#a09888' }}>
                {usagePct}% used -- <span style={{ color: '#e8b44c', fontWeight: 600 }}>{fmtFull(remaining)}</span> remaining
              </div>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: '#e8b44c', backgroundColor: 'rgba(232,180,76,0.12)',
              borderRadius: 8, padding: '3px 10px', flexShrink: 0,
            }}>
              Warning
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   Revenue Milestone Celebration Effect
   ================================================================ */
function MilestoneCelebration({ currentRevenue, milestones }: {
  currentRevenue: number;
  milestones: { label: string; value: number; pct: number }[];
}) {
  const reachedMilestones = milestones.filter(m => currentRevenue >= m.value);
  const nextMilestone = milestones.find(m => currentRevenue < m.value);
  const lastReached = reachedMilestones[reachedMilestones.length - 1];

  if (!lastReached && !nextMilestone) return null;

  const confettiColors = ['#d4a574', '#8b5cf6', '#6b8f71', '#e8b44c', '#5eaed4'];

  return (
    <div style={{
      display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch',
    }}>
      {/* Last reached milestone celebration */}
      {lastReached && (
        <div
          className="budget-celebration-badge"
          style={{
            flex: 1, minWidth: 220,
            background: 'linear-gradient(135deg, rgba(212,165,116,0.1), rgba(19,23,32,0.8))',
            border: '1px solid rgba(212,165,116,0.2)',
            borderRadius: 14,
            padding: '18px 22px',
            position: 'relative',
            animationDelay: '0.3s',
          }}
        >
          {/* Confetti particles */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 14 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${10 + Math.random() * 80}%`,
                top: `${30 + Math.random() * 50}%`,
                width: 4 + Math.random() * 4,
                height: 4 + Math.random() * 4,
                borderRadius: Math.random() > 0.5 ? '50%' : 2,
                backgroundColor: confettiColors[i % confettiColors.length],
                animation: `confettiDrift ${1.5 + Math.random() * 1.5}s ease-out ${0.8 + Math.random() * 2}s infinite`,
                opacity: 0.6,
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(232,180,76,0.1))',
              border: '1px solid rgba(212,165,116,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PartyPopper size={18} style={{ color: '#d4a574' }} />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#d4a574', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Milestone Reached
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f0ebe4' }}>
                {lastReached.label}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#a09888', position: 'relative' }}>
            Revenue has reached the <span style={{ color: '#d4a574', fontWeight: 600 }}>{lastReached.label}</span> milestone
          </div>
        </div>
      )}

      {/* Next milestone target */}
      {nextMilestone && (
        <div style={{
          flex: 1, minWidth: 220,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(19,23,32,0.8))',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: 14,
          padding: '18px 22px',
          animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.5s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
              border: '1px solid rgba(139,92,246,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Flag size={18} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Next Target
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f0ebe4' }}>
                {nextMilestone.label}
              </div>
            </div>
          </div>
          {/* Progress toward next milestone */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#6b6358' }}>{fmtFull(currentRevenue)}</span>
              <span style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600 }}>{nextMilestone.label}</span>
            </div>
            <div style={{
              height: 6, backgroundColor: 'rgba(28,34,48,0.8)', borderRadius: 3, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min((currentRevenue / nextMilestone.value) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                borderRadius: 3,
                transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 0 8px rgba(139,92,246,0.3)',
              }} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#a09888' }}>
            <span style={{ color: '#8b5cf6', fontWeight: 600 }}>
              {fmtFull(nextMilestone.value - currentRevenue)}
            </span> remaining to next milestone
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Monthly Comparison Mini-Bar Chart
   ================================================================ */
function MonthlyComparisonChart({ data }: {
  data: { month: string; revenue: number; expenses: number }[];
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.expenses)));
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div style={{
      background: 'rgba(19,23,32,0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: '20px 22px',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={15} style={{ color: '#d4a574' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>Monthly Comparison</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#6b8f71' }} />
            <span style={{ fontSize: 10, color: '#a09888' }}>Revenue</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#ef4444', opacity: 0.7 }} />
            <span style={{ fontSize: 10, color: '#a09888' }}>Expenses</span>
          </div>
        </div>
      </div>

      <div
        className="budget-mini-comparison"
        style={{
          display: 'flex', alignItems: 'flex-end', gap: 6, height: 120,
          padding: '0 4px',
        }}
      >
        {data.map((d, i) => {
          const revH = animated ? (d.revenue / maxVal) * 100 : 0;
          const expH = animated ? (d.expenses / maxVal) * 100 : 0;
          const isHovered = hoveredIdx === i;
          const netFlow = d.revenue - d.expenses;

          return (
            <div
              key={d.month}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                height: '100%', justifyContent: 'flex-end',
                position: 'relative',
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Hover tooltip */}
              {isHovered && (
                <div style={{
                  position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(11,13,20,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '6px 10px', zIndex: 10,
                  whiteSpace: 'nowrap', pointerEvents: 'none',
                  animation: 'countFade 0.2s ease both',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ fontSize: 9, color: '#6b8f71', fontWeight: 600 }}>Rev: {fmt(d.revenue)}</div>
                  <div style={{ fontSize: 9, color: '#ef4444', fontWeight: 600 }}>Exp: {fmt(d.expenses)}</div>
                  <div style={{
                    fontSize: 9, fontWeight: 700, marginTop: 2, paddingTop: 2,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    color: netFlow >= 0 ? '#6b8f71' : '#ef4444',
                  }}>
                    Net: {netFlow >= 0 ? '+' : ''}{fmt(netFlow)}
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%',
                justifyContent: 'center', height: '100%',
              }}>
                {/* Revenue bar */}
                <div
                  className="budget-mini-comparison-bar"
                  style={{
                    width: '38%', maxWidth: 20,
                    height: `${revH}%`,
                    background: isHovered
                      ? 'linear-gradient(180deg, #6b8f71, #6b8f7188)'
                      : 'linear-gradient(180deg, #6b8f71cc, #6b8f7155)',
                    borderRadius: '4px 4px 1px 1px',
                    boxShadow: isHovered ? '0 0 8px rgba(107,143,113,0.4)' : 'none',
                    transitionDelay: `${i * 0.06}s`,
                  }}
                />
                {/* Expenses bar */}
                <div
                  className="budget-mini-comparison-bar"
                  style={{
                    width: '38%', maxWidth: 20,
                    height: `${expH}%`,
                    background: isHovered
                      ? 'linear-gradient(180deg, #ef4444cc, #ef444466)'
                      : 'linear-gradient(180deg, #ef444488, #ef444433)',
                    borderRadius: '4px 4px 1px 1px',
                    boxShadow: isHovered ? '0 0 8px rgba(239,68,68,0.3)' : 'none',
                    transitionDelay: `${i * 0.06 + 0.03}s`,
                  }}
                />
              </div>
              <span style={{
                fontSize: 9, color: isHovered ? '#f0ebe4' : '#6b6358',
                marginTop: 6, fontWeight: isHovered ? 600 : 500,
                transition: 'color 0.2s, font-weight 0.2s',
              }}>
                {d.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ================================================================
   Metric Card Component (Glassmorphism + Hover Glow)
   ================================================================ */
function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  trend,
  trendValue,
  delay,
  gradientTheme,
  subValue,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  delay: number;
  gradientTheme?: 'positive' | 'negative' | 'warning' | 'accent';
  subValue?: string;
}) {
  const gradientMap = {
    positive: 'linear-gradient(135deg, rgba(107,143,113,0.08) 0%, rgba(19,23,32,0.8) 60%)',
    negative: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(19,23,32,0.8) 60%)',
    warning: 'linear-gradient(135deg, rgba(232,180,76,0.06) 0%, rgba(19,23,32,0.8) 60%)',
    accent: 'linear-gradient(135deg, rgba(212,165,116,0.08) 0%, rgba(19,23,32,0.8) 60%)',
  };

  const glowMap = {
    positive: 'rgba(107,143,113,0.12)',
    negative: 'rgba(239,68,68,0.08)',
    warning: 'rgba(232,180,76,0.08)',
    accent: 'rgba(212,165,116,0.1)',
  };

  const theme = gradientTheme || 'accent';

  return (
    <div
      className="budget-metric-card card-stat"
      style={{
        animationDelay: `${delay}s`,
        backgroundImage: gradientMap[theme],
        ['--glow-color' as string]: glowMap[theme],
      }}
    >
      {/* Hover glow overlay */}
      <div
        className="card-glow"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${iconColor}15, transparent 70%)`,
        }}
      />
      {/* Subtle top gradient accent line */}
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
      {/* Decorative sparkline background */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: 100, height: 50, opacity: 0.06, pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 100 50" width="100" height="50">
          <path d="M0 40 Q20 35,40 28 Q60 20,80 25 Q90 28,100 20" fill="none" stroke={iconColor} strokeWidth="2" />
          <path d="M0 40 Q20 35,40 28 Q60 20,80 25 Q90 28,100 20 L100 50 L0 50 Z" fill={iconColor} opacity="0.3" />
        </svg>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
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
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: `${iconColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 12px ${iconColor}10`,
            border: `1px solid ${iconColor}20`,
          }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
      <div
        className="metric-value"
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#f0ebe4',
          lineHeight: 1,
          marginBottom: 4,
          letterSpacing: '-0.02em',
          animationDelay: `${delay + 0.2}s`,
        }}
      >
        {value}
      </div>
      {subValue && (
        <div style={{ fontSize: 11, color: '#6b6358', marginBottom: 6, fontWeight: 500 }}>
          {subValue}
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginTop: subValue ? 0 : 8,
        padding: '4px 8px', borderRadius: 8,
        backgroundColor: trend === 'up' ? 'rgba(107,143,113,0.1)' : trend === 'down' ? 'rgba(239,68,68,0.08)' : 'rgba(160,152,136,0.08)',
        width: 'fit-content',
      }}>
        <span className={`trend-arrow ${trend === 'up' ? 'trend-arrow-up' : trend === 'down' ? 'trend-arrow-down' : ''}`}>
          {trend === 'up' && <ArrowUpRight size={13} style={{ color: '#6b8f71' }} />}
          {trend === 'down' && <ArrowDownRight size={13} style={{ color: '#ef4444' }} />}
          {trend === 'neutral' && <Minus size={13} style={{ color: '#a09888' }} />}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: trend === 'up' ? '#6b8f71' : trend === 'down' ? '#ef4444' : '#a09888',
            transition: 'color 0.3s',
          }}
        >
          {trendValue}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   Burn Rate Gauge Component
   ================================================================ */
function BurnRateGauge() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  const burnRatio = MONTHLY_BURN / (MONTHLY_REVENUE || 1); // e.g. 1.39
  const runwayMonths = RUNWAY_MONTHS;
  const needleAngle = Math.min((MONTHLY_BURN / (MONTHLY_BURN * 1.6)) * 180, 180) - 90; // -90 to 90 deg range

  const gaugeZones = [
    { start: 0, end: 33, color: '#6b8f71', label: 'Low' },
    { start: 33, end: 66, color: '#e8b44c', label: 'Moderate' },
    { start: 66, end: 100, color: '#e06060', label: 'High' },
  ];

  const currentBurnPct = Math.min((MONTHLY_BURN / (BURN_TARGET * 1.3)) * 100, 100);
  const needleDeg = -90 + (currentBurnPct / 100) * 180;

  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Gauge SVG */}
      <div style={{ position: 'relative', width: 200, height: 120, flexShrink: 0 }}>
        <svg viewBox="0 0 200 120" width="200" height="120">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(30,38,56,0.6)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Colored zones */}
          {gaugeZones.map((zone, i) => {
            const startAngle = Math.PI + (zone.start / 100) * Math.PI;
            const endAngle = Math.PI + (zone.end / 100) * Math.PI;
            const x1 = 100 + 80 * Math.cos(startAngle);
            const y1 = 100 + 80 * Math.sin(startAngle);
            const x2 = 100 + 80 * Math.cos(endAngle);
            const y2 = 100 + 80 * Math.sin(endAngle);
            return (
              <path
                key={i}
                className="budget-gauge-zone"
                d={`M ${x1} ${y1} A 80 80 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={zone.color}
                strokeWidth="14"
                strokeLinecap="round"
                opacity={0.7}
                style={{
                  transition: 'opacity 0.3s',
                }}
              />
            );
          })}
          {/* Needle */}
          <g
            style={{
              transform: `rotate(${animated ? needleDeg : -90}deg)`,
              transformOrigin: '100px 100px',
              transition: 'transform 1.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <line x1="100" y1="100" x2="100" y2="30" stroke="#f0ebe4" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="100" cy="100" r="6" fill="#f0ebe4" />
            <circle cx="100" cy="100" r="3" fill="#0b0d14" />
          </g>
          {/* Zone labels */}
          <text x="28" y="115" fill="#6b8f71" fontSize="8" fontWeight="600">Low</text>
          <text x="88" y="28" fill="#e8b44c" fontSize="8" fontWeight="600" textAnchor="middle">Mod</text>
          <text x="168" y="115" fill="#e06060" fontSize="8" fontWeight="600" textAnchor="end">High</text>
        </svg>
      </div>

      {/* Stats beside gauge */}
      <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Monthly Burn
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#f0ebe4' }}>{fmt(MONTHLY_BURN)}</span>
            <span style={{ fontSize: 12, color: '#a09888' }}>/ month</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Burn-to-Revenue Ratio
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: burnRatio > 1.5 ? '#e06060' : burnRatio > 1 ? '#e8b44c' : '#6b8f71' }}>
              {burnRatio.toFixed(2)}x
            </span>
            <span style={{
              fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: burnRatio > 1.5 ? '#e06060' : burnRatio > 1 ? '#e8b44c' : '#6b8f71',
              backgroundColor: burnRatio > 1.5 ? 'rgba(224,96,96,0.12)' : burnRatio > 1 ? 'rgba(232,180,76,0.12)' : 'rgba(107,143,113,0.12)',
              padding: '2px 8px', borderRadius: 6,
            }}>
              {burnRatio > 1.5 ? 'Needs attention' : burnRatio > 1 ? 'Monitor' : 'Sustainable'}
            </span>
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 16,
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(28,34,48,0.5)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div>
            <div style={{ fontSize: 9, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Runway</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: runwayColor(runwayMonths) }}>
              {runwayMonths.toFixed(1)} mo
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
          <div>
            <div style={{ fontSize: 9, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Net Burn</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
              {fmt(MONTHLY_BURN - MONTHLY_REVENUE)}
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
          <div>
            <div style={{ fontSize: 9, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#d4a574' }}>
              {fmt(BURN_TARGET)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SVG Horizontal Bar Chart for Monthly Cash Flow
   ================================================================ */
function CashFlowTimeline() {
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimProgress(1), 200);
    return () => clearTimeout(timer);
  }, []);

  const chartWidth = 680;
  const chartHeight = 240;
  const barGroupHeight = 28;
  const rowGap = 10;
  const labelWidth = 50;
  const rightPad = 80;
  const availableWidth = chartWidth - labelWidth - rightPad;
  const totalRowHeight = barGroupHeight + rowGap;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      style={{ overflow: 'visible' }}
      className="budget-cashflow-chart"
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
        <g key={pct}>
          <line
            x1={labelWidth + pct * availableWidth}
            y1={0}
            x2={labelWidth + pct * availableWidth}
            y2={monthlyCashFlow.length * totalRowHeight}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
            strokeDasharray={pct === 0 ? undefined : '4,4'}
          />
          <text
            x={labelWidth + pct * availableWidth}
            y={monthlyCashFlow.length * totalRowHeight + 18}
            textAnchor="middle"
            fill="#6b6358"
            fontSize={9}
          >
            {fmt(Math.round(MAX_CASHFLOW * pct))}
          </text>
        </g>
      ))}

      {monthlyCashFlow.map((d, i) => {
        const revenueWidth = (d.revenue / MAX_CASHFLOW) * availableWidth * animProgress;
        const expenseWidth = (d.expenses / MAX_CASHFLOW) * availableWidth * animProgress;
        const y = i * totalRowHeight;
        const netFlow = d.revenue - d.expenses;
        const isHovered = hoveredMonth === d.month;

        return (
          <g
            key={d.month}
            className="budget-cashflow-bar-group"
            onMouseEnter={() => setHoveredMonth(d.month)}
            onMouseLeave={() => setHoveredMonth(null)}
            style={{ cursor: 'default' }}
          >
            {/* Hover background */}
            <rect
              x={0}
              y={y - 2}
              width={chartWidth}
              height={barGroupHeight + 4}
              fill={isHovered ? 'rgba(255,255,255,0.02)' : 'transparent'}
              rx={6}
              style={{ transition: 'fill 0.2s' }}
            />
            {/* Month label */}
            <text
              x={labelWidth - 8}
              y={y + barGroupHeight / 2 + 1}
              textAnchor="end"
              fill={isHovered ? '#f0ebe4' : '#a09888'}
              fontSize={11}
              fontWeight={isHovered ? 600 : 500}
              dominantBaseline="middle"
              style={{ transition: 'fill 0.2s' }}
            >
              {d.month}
            </text>

            {/* Revenue bar */}
            <rect
              x={labelWidth}
              y={y}
              width={revenueWidth}
              height={12}
              rx={4}
              fill="#6b8f71"
              opacity={isHovered ? 1 : 0.85}
              style={{
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
                transitionDelay: `${i * 0.08}s`,
                filter: isHovered ? 'drop-shadow(0 0 6px rgba(107,143,113,0.4))' : 'none',
              }}
            />

            {/* Expense bar */}
            <rect
              x={labelWidth}
              y={y + 14}
              width={expenseWidth}
              height={12}
              rx={4}
              fill="#ef4444"
              opacity={isHovered ? 0.9 : 0.6}
              style={{
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
                transitionDelay: `${i * 0.08 + 0.05}s`,
                filter: isHovered ? 'drop-shadow(0 0 6px rgba(239,68,68,0.3))' : 'none',
              }}
            />

            {/* Hover tooltip with values */}
            {isHovered && (
              <>
                <text
                  x={labelWidth + Math.max(revenueWidth, expenseWidth) + 8}
                  y={y + 8}
                  fill="#6b8f71"
                  fontSize={9}
                  fontWeight={600}
                  dominantBaseline="middle"
                  style={{ opacity: animProgress }}
                >
                  Rev: {fmt(d.revenue)}
                </text>
                <text
                  x={labelWidth + Math.max(revenueWidth, expenseWidth) + 8}
                  y={y + 22}
                  fill="#ef4444"
                  fontSize={9}
                  fontWeight={600}
                  dominantBaseline="middle"
                  style={{ opacity: animProgress }}
                >
                  Exp: {fmt(d.expenses)}
                </text>
              </>
            )}

            {/* Net flow indicator */}
            {!isHovered && (
              <text
                x={labelWidth + Math.max(revenueWidth, expenseWidth) + 8}
                y={y + barGroupHeight / 2 + 1}
                fill={netFlow >= 0 ? '#6b8f71' : '#ef4444'}
                fontSize={10}
                fontWeight={700}
                dominantBaseline="middle"
                style={{
                  transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: `${i * 0.08 + 0.1}s`,
                }}
              >
                {netFlow >= 0 ? '+' : ''}{fmt(netFlow)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ================================================================
   Revenue vs Expenses Comparison Bars
   ================================================================ */
function RevenueExpenseBars() {
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimProgress(1), 150);
    return () => clearTimeout(timer);
  }, []);

  const totalRevenue = monthlyCashFlow.reduce((s, d) => s + d.revenue, 0);
  const totalExpenses = monthlyCashFlow.reduce((s, d) => s + d.expenses, 0);
  const maxVal = Math.max(totalRevenue, totalExpenses);
  const netValue = totalRevenue - totalExpenses;

  const barData = [
    { label: 'Total Revenue', value: totalRevenue, color: '#6b8f71', gradient: 'linear-gradient(90deg, #6b8f71dd, #6b8f7155)' },
    { label: 'Total Expenses', value: totalExpenses, color: '#ef4444', gradient: 'linear-gradient(90deg, #ef4444dd, #ef444455)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {barData.map((d, idx) => {
        const pct = (d.value / maxVal) * 100 * animProgress;
        return (
          <div
            key={d.label}
            style={{
              animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) both',
              animationDelay: `${idx * 0.15}s`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#a09888', fontWeight: 500 }}>{d.label}</span>
              <span style={{ fontSize: 13, color: d.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {fmtFull(d.value)}
              </span>
            </div>
            <div
              style={{
                height: 24,
                backgroundColor: 'rgba(28,34,48,0.6)',
                borderRadius: 12,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: d.gradient,
                  borderRadius: 12,
                  transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  boxShadow: `0 0 12px ${d.color}20`,
                }}
              >
                {/* Animated shimmer */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(90deg, transparent, ${d.color}25, transparent)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Comparison line between bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '4px 0',
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
        <span style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em' }}>comparison</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      </div>

      {/* Net difference with green/red transition */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: netValue >= 0
            ? 'linear-gradient(135deg, rgba(107,143,113,0.1) 0%, rgba(19,23,32,0.6) 100%)'
            : 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(19,23,32,0.6) 100%)',
          border: `1px solid ${netValue >= 0 ? 'rgba(107,143,113,0.2)' : 'rgba(239,68,68,0.2)'}`,
          borderRadius: 12,
          backdropFilter: 'blur(8px)',
          transition: 'all 0.5s',
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.3s both',
        }}
      >
        <span style={{ fontSize: 12, color: '#a09888', fontWeight: 500 }}>Net Cash Flow (6mo)</span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: netValue >= 0 ? '#6b8f71' : '#ef4444',
            transition: 'color 0.5s',
          }}
        >
          {netValue >= 0 ? '+' : ''}{fmtFull(netValue)}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   Budget Category Card Grid
   ================================================================ */
function BudgetCategoryCards({ totalBudget }: { totalBudget: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
      gap: 14,
    }}>
      {budgetLines.map((line, idx) => {
        const pctOfTotal = (line.budget / totalBudget) * 100;
        const variance = line.budget - line.actual;
        const rag = ragStatus(variance, line.budget);
        const usagePct = Math.min((line.actual / line.budget) * 100, 120);
        const CatIcon = line.icon;

        return (
          <div
            key={line.category}
            className="budget-cat-card card-interactive"
            style={{
              animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
              animationDelay: `${0.1 + idx * 0.07}s`,
              ['--cat-color' as string]: line.color,
            }}
          >
            {/* Icon + Name row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  backgroundColor: `${line.color}15`,
                  border: `1px solid ${line.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CatIcon size={16} style={{ color: line.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', lineHeight: 1.2 }}>
                    {line.category}
                  </div>
                  <div style={{ fontSize: 10, color: '#6b6358', marginTop: 2 }}>
                    {pctOfTotal.toFixed(0)}% of total
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: rag.color, backgroundColor: rag.bg, borderRadius: 6, padding: '2px 8px',
              }}>
                {rag.label}
              </span>
            </div>

            {/* Budget / Actual numbers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Budget</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#a09888', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(line.budget)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actual</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(line.actual)}
                </div>
              </div>
            </div>

            {/* Usage bar */}
            <div style={{
              height: 6, backgroundColor: 'rgba(28,34,48,0.8)', borderRadius: 3, overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(usagePct, 100)}%`,
                backgroundColor: usagePct > 100 ? '#e06060' : line.color,
                borderRadius: 3,
                transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: `0 0 6px ${usagePct > 100 ? 'rgba(224,96,96,0.3)' : `${line.color}30`}`,
              }} />
              {/* Over-budget indicator */}
              {usagePct > 100 && (
                <div style={{
                  position: 'absolute', right: 0, top: -1, bottom: -1,
                  width: `${Math.min(usagePct - 100, 20)}%`,
                  backgroundColor: 'rgba(224,96,96,0.25)',
                  borderRadius: '0 3px 3px 0',
                }} />
              )}
            </div>

            {/* Variance */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 10, color: '#6b6358' }}>
                {usagePct.toFixed(0)}% used
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: rag.color, fontVariantNumeric: 'tabular-nums',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                {variance >= 0 ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}
                {variance >= 0 ? '+' : ''}{fmtFull(variance)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   Revenue Target Progress with Milestones
   ================================================================ */
function RevenueTargetProgress() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

  return (
    <div>
      {/* Top stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28,
      }}>
        <div style={{ animation: 'countFade 0.6s cubic-bezier(0.4,0,0.2,1) 0.7s both' }}>
          <div style={{ fontSize: 11, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Current Revenue
          </div>
          <AnimatedNumber
            value={currentRevenue}
            prefix="$"
            duration={1400}
            style={{ fontSize: 32, fontWeight: 800, color: '#f0ebe4' }}
          />
        </div>
        <div style={{ animation: 'countFade 0.6s cubic-bezier(0.4,0,0.2,1) 0.8s both' }}>
          <div style={{ fontSize: 11, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Target
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#d4a574' }}>$2M</div>
        </div>
        <div style={{ animation: 'countFade 0.6s cubic-bezier(0.4,0,0.2,1) 0.9s both' }}>
          <div style={{ fontSize: 11, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Completion
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <AnimatedNumber
              value={Math.round(revenuePct * 10) / 10}
              duration={1400}
              style={{ fontSize: 32, fontWeight: 800, color: '#e8b44c' }}
            />
            <span style={{ fontSize: 18, fontWeight: 600, color: 'rgba(232,180,76,0.6)' }}>%</span>
          </div>
        </div>
      </div>

      {/* Progress bar with milestone markers */}
      <div style={{ marginBottom: 12, position: 'relative' }}>
        <div style={{
          height: 24,
          backgroundColor: 'rgba(28,34,48,0.6)',
          borderRadius: 12,
          overflow: 'visible',
          position: 'relative',
        }}>
          {/* Fill bar */}
          <div
            className="budget-runway-fill"
            style={{
              height: '100%',
              width: animated ? `${Math.min(revenuePct, 100)}%` : '0%',
              background: 'linear-gradient(90deg, #d4a574, #e8b44c)',
              borderRadius: 12,
              transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '0 0 16px rgba(212,165,116,0.3)',
              position: 'relative',
              zIndex: 1,
            }}
          />

          {/* Milestone markers */}
          {revenueMilestones.map((m, i) => {
            const reached = revenuePct >= m.pct;
            return (
              <div
                key={m.label}
                className="budget-milestone-marker"
                style={{
                  position: 'absolute',
                  left: `${m.pct}%`,
                  top: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                  zIndex: 2,
                  animation: `milestoneAppear 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.8 + i * 0.12}s both`,
                }}
              >
                {/* Marker dot */}
                <div style={{
                  width: reached ? 16 : 10,
                  height: reached ? 16 : 10,
                  borderRadius: '50%',
                  backgroundColor: reached ? '#d4a574' : 'rgba(28,34,48,0.9)',
                  border: `2px solid ${reached ? '#e8b44c' : 'rgba(160,152,136,0.3)'}`,
                  boxShadow: reached ? '0 0 8px rgba(212,165,116,0.4)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                }}>
                  {reached && <CheckCircle2 size={8} style={{ color: '#0b0d14' }} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestone labels below */}
        <div style={{ position: 'relative', height: 28, marginTop: 6 }}>
          {revenueMilestones.map((m, i) => {
            const reached = revenuePct >= m.pct;
            return (
              <div key={m.label} style={{
                position: 'absolute',
                left: `${m.pct}%`,
                transform: 'translateX(-50%)',
                animation: `milestoneAppear 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.9 + i * 0.12}s both`,
              }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                }}>
                  <Flag size={8} style={{ color: reached ? '#d4a574' : '#6b6358', opacity: reached ? 1 : 0.5 }} />
                  <span style={{
                    fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap',
                    color: reached ? '#d4a574' : '#6b6358',
                  }}>
                    {m.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly progression cards */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
        {monthlyRevenue.map((m, i) => (
          <div
            key={m.month}
            style={{
              flex: 1,
              minWidth: 80,
              backgroundColor: 'rgba(28,34,48,0.6)',
              borderRadius: 10,
              padding: '10px 12px',
              textAlign: 'center',
              animation: 'fadeSlideUp 0.5s cubic-bezier(0.4,0,0.2,1) both',
              animationDelay: `${0.65 + i * 0.08}s`,
              border: i === monthlyRevenue.length - 1 ? '1px solid rgba(212,165,116,0.2)' : '1px solid transparent',
              transition: 'border-color 0.3s, background-color 0.3s',
            }}
          >
            <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 4 }}>{m.month}</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: i === monthlyRevenue.length - 1 ? '#d4a574' : '#a09888',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              ${(m.cumulative / 1000).toFixed(0)}K
            </div>
            {i > 0 && (
              <div
                style={{
                  fontSize: 9,
                  color: '#6b8f71',
                  marginTop: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <ArrowUpRight size={8} />
                +${((m.cumulative - monthlyRevenue[i - 1].cumulative) / 1000).toFixed(0)}K
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */

export function BudgetView() {
  const { kpis } = useFrequencyData();
  const totalBudget = budgetLines.reduce((s, l) => s + l.budget, 0);
  const totalActual = budgetLines.reduce((s, l) => s + l.actual, 0);
  const totalVariance = totalBudget - totalActual;
  const containerRef = useRef<HTMLDivElement>(null);
  const [runwayAnimated, setRunwayAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRunwayAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const donutData = budgetLines.map((l) => ({
    label: l.category,
    value: l.budget,
    color: l.color,
  }));

  return (
    <div
      ref={containerRef}
      className="scrollbar-autohide"
      style={{
        padding: 'clamp(16px, 3vw, 40px)',
        maxWidth: 1100,
        margin: '0 auto',
        backgroundColor: '#0b0d14',
        minHeight: '100vh',
      }}
    >
      {/* Inject premium dashboard styles */}
      <style>{DASHBOARD_STYLES}</style>

      {/* ================================================================
         Header
         ================================================================ */}
      <div className="noise-overlay dot-pattern" style={{ marginBottom: 36, animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(212,165,116,0.05))',
                border: '1px solid rgba(212, 165, 116, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(212,165,116,0.1)',
              }}
            >
              <DollarSign size={22} style={{ color: '#d4a574' }} />
            </div>
            <div>
              <h1
                className="text-glow"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Mothership OS
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <p style={{ fontSize: 13, color: '#a09888', margin: 0 }}>
                  Financial clarity above all. No surprises.
                </p>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#e8b44c',
                    backgroundColor: 'rgba(232, 180, 76, 0.12)',
                    border: '1px solid rgba(232, 180, 76, 0.2)',
                    borderRadius: 999,
                    padding: '2px 10px 2px 7px',
                  }}
                >
                  <Database size={10} style={{ color: '#e8b44c' }} />
                  Static Data
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { if (containerRef.current) exportPdf(containerRef.current, 'Mothership-OS'); }}
            className="budget-export-btn"
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* ================================================================
         Financial Metric Cards with Trend Indicators
         ================================================================ */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(230px, 100%), 1fr))', gap: 16 }}>
          <MetricCard
            label="Cash in Bank"
            value={fmtFull(CASH_IN_BANK)}
            icon={DollarSign}
            iconColor="#d4a574"
            trend="down"
            trendValue="-$12K from last month"
            delay={0.05}
            gradientTheme="accent"
            subValue="Available operating capital"
          />
          <MetricCard
            label="Monthly Burn"
            value={fmt(MONTHLY_BURN)}
            icon={TrendingDown}
            iconColor="#ef4444"
            trend="down"
            trendValue="-$1K from Feb"
            delay={0.1}
            gradientTheme="negative"
            subValue="All-in monthly spend"
          />
          <MetricCard
            label="Monthly Revenue"
            value={fmt(MONTHLY_REVENUE)}
            icon={TrendingUp}
            iconColor="#6b8f71"
            trend="up"
            trendValue="+$2K MoM growth"
            delay={0.15}
            gradientTheme="positive"
            subValue="Recurring + project income"
          />
          <MetricCard
            label="Runway"
            value={`${RUNWAY_MONTHS.toFixed(1)} mo`}
            icon={Gauge}
            iconColor={runwayColor(RUNWAY_MONTHS)}
            trend="neutral"
            trendValue={runwayLabel(RUNWAY_MONTHS)}
            delay={0.2}
            gradientTheme="warning"
            subValue="At current burn rate"
          />
        </div>
      </section>

      {/* ================================================================
         Budget Alert Banners (Threshold Warnings)
         ================================================================ */}
      <section style={{
        marginBottom: 32,
        animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.22s both',
      }}>
        <BudgetThresholdBanners lines={budgetLines} totalBudget={totalBudget} />
      </section>

      {/* ================================================================
         Burn Rate Gauge
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.25s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Gauge size={18} style={{ color: '#e8b44c' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Burn Rate Indicator
          </h2>
          <span
            style={{
              fontSize: 11,
              color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            vs Runway
          </span>
        </div>
        <div className="budget-card-panel card-premium" style={{ padding: 28 }}>
          <BurnRateGauge />
        </div>
      </section>

      {/* ================================================================
         Budget Categories - Card Grid
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.3s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Layers size={18} style={{ color: '#8b5cf6' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Budget Categories
          </h2>
          <span
            style={{
              fontSize: 11,
              color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            March 2026
          </span>
        </div>
        <BudgetCategoryCards totalBudget={totalBudget} />
      </section>

      {/* ================================================================
         Budget Allocation Donut Chart + Legend
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.35s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <PieChart size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Budget Allocation
          </h2>
          <span
            style={{
              fontSize: 11,
              color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            March 2026
          </span>
        </div>

        <div
          className="budget-card-panel card-premium"
          style={{
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            flexWrap: 'wrap',
          }}
        >
          {/* Animated Pie Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
            <AnimatedPieChart data={donutData} size={240} />
          </div>

          {/* Legend with staggered animation */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {budgetLines.map((line, idx) => {
                const pct = ((line.budget / totalBudget) * 100).toFixed(0);
                const variance = line.budget - line.actual;
                const rag = ragStatus(variance, line.budget);
                return (
                  <div
                    key={line.category}
                    className="budget-legend-row"
                    style={{
                      animationDelay: `${0.3 + idx * 0.08}s`,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 4,
                        backgroundColor: line.color,
                        flexShrink: 0,
                        boxShadow: `0 0 8px ${line.color}40`,
                      }}
                    />
                    <span style={{ fontSize: 13, color: '#f0ebe4', fontWeight: 500, flex: 1 }}>
                      {line.category}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: '#a09888',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 60,
                        textAlign: 'right',
                      }}
                    >
                      {fmt(line.budget)}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#6b6358',
                        fontWeight: 500,
                        minWidth: 36,
                        textAlign: 'right',
                      }}
                    >
                      {pct}%
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: rag.color,
                        backgroundColor: rag.bg,
                        borderRadius: 8,
                        padding: '2px 8px',
                      }}
                    >
                      {rag.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
         Revenue vs Expenses Comparison Bars
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.4s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity size={18} style={{ color: '#8b5cf6' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Revenue vs Expenses
          </h2>
          <span
            style={{
              fontSize: 11,
              color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            6-Month Summary
          </span>
        </div>

        <div
          className="budget-card-panel card-premium"
          style={{ padding: '24px 28px' }}
        >
          <RevenueExpenseBars />
        </div>
      </section>

      {/* ================================================================
         Monthly Comparison Mini-Bar Chart
         ================================================================ */}
      <section style={{
        marginBottom: 36,
        animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.42s both',
      }}>
        <MonthlyComparisonChart data={monthlyCashFlow} />
      </section>

      {/* ================================================================
         Monthly Cash Flow Timeline (Horizontal SVG Bar Chart)
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.45s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <BarChart3 size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Monthly Cash Flow Timeline
          </h2>
        </div>

        <div
          className="budget-card-panel"
          style={{ padding: '24px 28px' }}
        >
          {/* Legend with staggered entry */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                animation: 'fadeSlideIn 0.4s cubic-bezier(0.4,0,0.2,1) 0.4s both',
              }}
            >
              <div style={{ width: 14, height: 8, borderRadius: 4, backgroundColor: '#6b8f71', boxShadow: '0 0 6px rgba(107,143,113,0.3)' }} />
              <span style={{ fontSize: 11, color: '#a09888' }}>Revenue</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                animation: 'fadeSlideIn 0.4s cubic-bezier(0.4,0,0.2,1) 0.5s both',
              }}
            >
              <div style={{ width: 14, height: 8, borderRadius: 4, backgroundColor: '#ef4444', opacity: 0.7, boxShadow: '0 0 6px rgba(239,68,68,0.2)' }} />
              <span style={{ fontSize: 11, color: '#a09888' }}>Expenses</span>
            </div>
          </div>
          <CashFlowTimeline />
        </div>
      </section>

      {/* ================================================================
         Cash Runway Indicator
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.5s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Gauge size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Cash Runway
          </h2>
        </div>

        <div
          className="budget-card-panel"
          style={{
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          {/* Big number with glow */}
          <div style={{ textAlign: 'center', minWidth: 160 }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: runwayColor(RUNWAY_MONTHS),
                lineHeight: 1,
                letterSpacing: '-0.03em',
                textShadow: `0 0 30px ${runwayColor(RUNWAY_MONTHS)}40`,
                animation: 'countFade 0.8s cubic-bezier(0.4,0,0.2,1) 0.5s both',
              }}
            >
              {RUNWAY_MONTHS.toFixed(1)}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#a09888',
                marginTop: 4,
                animation: 'countFade 0.6s cubic-bezier(0.4,0,0.2,1) 0.7s both',
              }}
            >
              months runway
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: 8,
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: runwayColor(RUNWAY_MONTHS),
                backgroundColor: `${runwayColor(RUNWAY_MONTHS)}18`,
                borderRadius: 12,
                padding: '3px 12px',
                animation: 'runwayGlow 3s ease-in-out infinite, countFade 0.6s cubic-bezier(0.4,0,0.2,1) 0.9s both',
              }}
            >
              {runwayLabel(RUNWAY_MONTHS)}
            </div>
          </div>

          {/* Visual bar */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#a09888' }}>
                Cash in bank: <span style={{ color: '#f0ebe4', fontWeight: 600 }}>{fmtFull(CASH_IN_BANK)}</span>
              </span>
              <span style={{ fontSize: 12, color: '#a09888' }}>
                Burn rate: <span style={{ color: '#f0ebe4', fontWeight: 600 }}>{fmt(MONTHLY_BURN)}/mo</span>
              </span>
            </div>
            {/* Runway bar with animated fill */}
            <div
              style={{
                height: 28,
                backgroundColor: 'rgba(28,34,48,0.6)',
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Month marker vertical lines */}
              {[1,2,3,4,5,6,7,8,9,10,11].map((m) => (
                <div
                  key={m}
                  style={{
                    position: 'absolute',
                    left: `${(m / 12) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    backgroundColor: m === 3 ? 'rgba(239,68,68,0.3)' : m === 6 ? 'rgba(232,180,76,0.3)' : 'rgba(255,255,255,0.04)',
                    zIndex: 1,
                  }}
                />
              ))}

              {/* Animated fill bar */}
              <div
                className="budget-runway-fill"
                style={{
                  height: '100%',
                  width: runwayAnimated ? `${Math.min((RUNWAY_MONTHS / 12) * 100, 100)}%` : '0%',
                  background: `linear-gradient(90deg, ${runwayColor(RUNWAY_MONTHS)}dd, ${runwayColor(RUNWAY_MONTHS)}88)`,
                  borderRadius: 14,
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 0 16px ${runwayColor(RUNWAY_MONTHS)}30`,
                }}
              />

              {/* Pulsing current position indicator */}
              <div
                style={{
                  position: 'absolute',
                  left: `${Math.min((RUNWAY_MONTHS / 12) * 100, 100)}%`,
                  top: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#f0ebe4',
                  border: `2px solid ${runwayColor(RUNWAY_MONTHS)}`,
                  boxShadow: `0 0 12px ${runwayColor(RUNWAY_MONTHS)}60`,
                  zIndex: 2,
                  opacity: runwayAnimated ? 1 : 0,
                  transition: 'opacity 0.5s 1.5s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    border: `2px solid ${runwayColor(RUNWAY_MONTHS)}40`,
                    animation: 'pulseIndicator 2s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 6,
                fontSize: 10,
                color: '#6b6358',
              }}
            >
              <span>0 mo</span>
              <span style={{ color: '#ef4444' }}>3 mo</span>
              <span style={{ color: '#e8b44c' }}>6 mo</span>
              <span>9 mo</span>
              <span>12 mo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
         Monthly Burn Tracker (Category bars with grow animation)
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.55s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <BarChart3 size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Monthly Burn Tracker
          </h2>
          <span
            style={{
              fontSize: 11,
              color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            Last 6 months
          </span>
        </div>

        <div
          className="budget-card-panel"
          style={{ padding: '24px 28px' }}
        >
          {/* Bar chart */}
          <div className="budget-category-bars" style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, position: 'relative' }}>
            {/* Target line */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${(BURN_TARGET / MAX_BURN) * 100}%`,
                borderBottom: '2px dashed rgba(212, 165, 116, 0.4)',
                zIndex: 1,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  right: 0,
                  top: -18,
                  fontSize: 10,
                  color: '#d4a574',
                  fontWeight: 600,
                }}
              >
                Target {fmt(BURN_TARGET)}
              </span>
            </div>

            {burnData.map((d, i) => {
              const heightPct = (d.amount / MAX_BURN) * 100;
              const isOver = d.amount > BURN_TARGET;
              const barColor = isOver ? '#e8b44c' : '#6b8f71';
              return (
                <div
                  key={d.month}
                  className="budget-category-bar-wrapper budget-burn-bar"
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Amount label that fades in after bar grows */}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: isOver ? '#e8b44c' : '#a09888',
                      marginBottom: 4,
                      animation: 'countFade 0.5s cubic-bezier(0.4,0,0.2,1) both',
                      animationDelay: `${0.7 + i * 0.1}s`,
                    }}
                  >
                    {fmt(d.amount)}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 48,
                      height: `${heightPct}%`,
                      background: `linear-gradient(180deg, ${barColor}cc, ${barColor}55)`,
                      borderRadius: '8px 8px 4px 4px',
                      transformOrigin: 'bottom',
                      animation: 'barGrow 0.8s cubic-bezier(0.4,0,0.2,1) both',
                      animationDelay: `${0.5 + i * 0.1}s`,
                      position: 'relative',
                      boxShadow: `0 0 12px ${barColor}20`,
                    }}
                  >
                    {/* Shimmer on hover */}
                    <div className="budget-bar-shimmer" style={{ borderRadius: '8px 8px 4px 4px' }} />
                    {d.note && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -20,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: 8,
                          color: '#e8b44c',
                          whiteSpace: 'nowrap',
                          fontWeight: 500,
                        }}
                      >
                        {d.note}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#6b6358',
                      marginTop: 8,
                      fontWeight: 500,
                    }}
                  >
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
         Budget vs Actuals Table
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.6s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Target size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Budget vs Actuals
          </h2>
          <span
            style={{
              fontSize: 11,
              color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            March 2026
          </span>
        </div>

        <div
          className="budget-card-panel"
          style={{ overflow: 'hidden' }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
              padding: '12px 24px',
              backgroundColor: 'rgba(15,18,25,0.8)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6b6358',
            }}
          >
            <span>Category</span>
            <span style={{ textAlign: 'right' }}>Budget</span>
            <span style={{ textAlign: 'right' }}>Actual</span>
            <span style={{ textAlign: 'right' }}>Variance</span>
            <span style={{ textAlign: 'center' }}>Status</span>
          </div>

          {/* Table rows */}
          {budgetLines.map((line, i) => {
            const variance = line.budget - line.actual;
            const rag = ragStatus(variance, line.budget);
            return (
              <div
                key={line.category}
                className="budget-table-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
                  padding: '14px 24px',
                  borderBottom: i < budgetLines.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  alignItems: 'center',
                  animation: 'fadeSlideIn 0.5s cubic-bezier(0.4,0,0.2,1) both',
                  animationDelay: `${0.55 + i * 0.06}s`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 3,
                      backgroundColor: line.color,
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${line.color}40`,
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ebe4' }}>
                    {line.category}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: '#a09888',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {fmtFull(line.budget)}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: '#f0ebe4',
                    textAlign: 'right',
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {fmtFull(line.actual)}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: rag.color,
                    textAlign: 'right',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {variance >= 0 ? '+' : ''}{fmtFull(variance)}
                </span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: rag.color,
                      backgroundColor: rag.bg,
                      borderRadius: 12,
                      padding: '3px 10px',
                    }}
                  >
                    {rag.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Totals row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
              padding: '14px 24px',
              borderTop: '2px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(15,18,25,0.8)',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#d4a574' }}>Total</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#a09888',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {fmtFull(totalBudget)}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#f0ebe4',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {fmtFull(totalActual)}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: totalVariance >= 0 ? '#6b8f71' : '#ef4444',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {totalVariance >= 0 ? '+' : ''}{fmtFull(totalVariance)}
            </span>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CheckCircle2
                size={16}
                style={{ color: totalVariance >= 0 ? '#6b8f71' : '#ef4444' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
         Revenue Milestone Celebration
         ================================================================ */}
      <section style={{
        marginBottom: 32,
        animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.62s both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <PartyPopper size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Revenue Milestones
          </h2>
        </div>
        <MilestoneCelebration currentRevenue={currentRevenue} milestones={revenueMilestones} />
      </section>

      {/* ================================================================
         Revenue vs $2M Target with Milestones
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.65s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingUp size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Revenue vs $2M Target
          </h2>
        </div>

        <div
          className="budget-card-panel"
          style={{ padding: 28 }}
        >
          <RevenueTargetProgress />
        </div>
      </section>

      {/* ================================================================
         Decision Rights Matrix
         ================================================================ */}
      <section
        style={{
          marginBottom: 36,
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.7s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Shield size={18} style={{ color: '#8b5cf6' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Decision Rights Matrix
          </h2>
        </div>

        <div
          className="budget-card-panel"
          style={{ overflow: 'hidden' }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr',
              padding: '12px 24px',
              backgroundColor: 'rgba(15,18,25,0.8)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6b6358',
            }}
          >
            <span>Threshold</span>
            <span>Decision Maker</span>
            <span>Inform / Approve</span>
          </div>

          {decisionRights.map((dr, i) => (
            <div
              key={dr.threshold}
              className="budget-decision-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr 1fr',
                padding: '14px 24px',
                borderBottom: i < decisionRights.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                alignItems: 'center',
                animation: 'fadeSlideIn 0.5s cubic-bezier(0.4,0,0.2,1) both',
                animationDelay: `${0.75 + i * 0.06}s`,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: dr.color,
                }}
              >
                {dr.threshold}
              </span>
              <span style={{ fontSize: 13, color: '#f0ebe4', fontWeight: 500 }}>
                {dr.decides}
              </span>
              <span style={{ fontSize: 13, color: '#a09888' }}>
                {dr.informs}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
         Alerts
         ================================================================ */}
      <section
        style={{
          animation: 'fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.8s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <AlertTriangle size={18} style={{ color: '#e8b44c' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Active Alerts
          </h2>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#e8b44c',
              backgroundColor: 'rgba(232, 180, 76, 0.12)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            {alerts.length} active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((alert, i) => {
            const style = alertStyles[alert.severity];
            return (
              <div
                key={i}
                className="budget-alert-card"
                style={{
                  background: `linear-gradient(135deg, ${style.bg}, rgba(19,23,32,0.4))`,
                  border: `1px solid ${style.border}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  animation: 'fadeSlideIn 0.5s cubic-bezier(0.4,0,0.2,1) both',
                  animationDelay: `${0.85 + i * 0.08}s`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <AlertTriangle
                  size={18}
                  style={{ color: style.icon, flexShrink: 0, marginTop: 1 }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#f0ebe4', margin: 0, lineHeight: 1.6 }}>
                    {alert.message}
                  </p>
                  <span style={{ fontSize: 11, color: '#6b6358', marginTop: 4, display: 'block' }}>
                    {alert.date}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: style.text,
                    backgroundColor: `${style.text}18`,
                    borderRadius: 12,
                    padding: '3px 10px',
                    flexShrink: 0,
                  }}
                >
                  {alert.severity}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
