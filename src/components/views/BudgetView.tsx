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
} from 'lucide-react';
import { exportPdf } from '@/lib/data';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { Database } from 'lucide-react';

/* ================================================================
   Constants & Data
   ================================================================ */

const CASH_IN_BANK = 210000;
const MONTHLY_BURN = 25000;
const RUNWAY_MONTHS = CASH_IN_BANK / MONTHLY_BURN; // 8.4
const MONTHLY_REVENUE = 18000;
const NET_MONTHLY = MONTHLY_REVENUE - MONTHLY_BURN;

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
}

const budgetLines: BudgetLine[] = [
  { category: 'Core Team Payroll', budget: 15000, actual: 14500, color: '#d4a574' },
  { category: 'Operations', budget: 4000, actual: 3800, color: '#8b5cf6' },
  { category: 'Events', budget: 3000, actual: 3200, color: '#6b8f71' },
  { category: 'Technology', budget: 1000, actual: 800, color: '#5eaed4' },
  { category: 'Marketing / Outreach', budget: 1000, actual: 600, color: '#e879a0' },
  { category: 'Misc / Buffer', budget: 1000, actual: 1200, color: '#e8b44c' },
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
    bg: 'rgba(232, 180, 76, 0.08)',
    border: 'rgba(232, 180, 76, 0.25)',
    text: '#e8b44c',
    icon: '#e8b44c',
  },
  red: {
    bg: 'rgba(224, 96, 96, 0.08)',
    border: 'rgba(224, 96, 96, 0.25)',
    text: '#e06060',
    icon: '#e06060',
  },
};

/* ================================================================
   Helpers
   ================================================================ */
const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n}`;

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

/* ================================================================
   SVG Donut Chart Component
   ================================================================ */
function DonutChart({
  data,
  size = 220,
  strokeWidth = 32,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimProgress(1), 100);
    return () => clearTimeout(timer);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0);
  const center = size / 2;

  let cumulativeOffset = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1e2638"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {data.map((segment, i) => {
          const segmentLength = (segment.value / total) * circumference;
          const offset = cumulativeOffset;
          cumulativeOffset += segmentLength;
          const dashLength = segmentLength * animProgress;

          return (
            <circle
              key={segment.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
              style={{
                transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: `drop-shadow(0 0 4px ${segment.color}40)`,
              }}
            />
          );
        })}
      </svg>
      {/* Center text */}
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
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#f0ebe4',
            lineHeight: 1,
          }}
        >
          {fmtFull(total)}
        </span>
        <span style={{ fontSize: 11, color: '#6b6358', marginTop: 4 }}>
          total budget
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   Animated Counter Hook
   ================================================================ */
function useAnimatedNumber(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

/* ================================================================
   Metric Card Component
   ================================================================ */
function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  trend,
  trendValue,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  delay: number;
}) {
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
      {/* Subtle top gradient accent */}
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
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {trend === 'up' && <ArrowUpRight size={12} style={{ color: '#6b8f71' }} />}
        {trend === 'down' && <ArrowDownRight size={12} style={{ color: '#e06060' }} />}
        {trend === 'neutral' && <Minus size={12} style={{ color: '#a09888' }} />}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: trend === 'up' ? '#6b8f71' : trend === 'down' ? '#e06060' : '#a09888',
          }}
        >
          {trendValue}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   SVG Horizontal Bar Chart for Monthly Cash Flow
   ================================================================ */
function CashFlowTimeline() {
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimProgress(1), 200);
    return () => clearTimeout(timer);
  }, []);

  const chartWidth = 680;
  const chartHeight = 220;
  const barGroupHeight = 28;
  const rowGap = 8;
  const labelWidth = 50;
  const rightPad = 60;
  const availableWidth = chartWidth - labelWidth - rightPad;
  const totalRowHeight = barGroupHeight + rowGap;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      style={{ overflow: 'visible' }}
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
        <g key={pct}>
          <line
            x1={labelWidth + pct * availableWidth}
            y1={0}
            x2={labelWidth + pct * availableWidth}
            y2={monthlyCashFlow.length * totalRowHeight}
            stroke="#1e2638"
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

        return (
          <g key={d.month}>
            {/* Month label */}
            <text
              x={labelWidth - 8}
              y={y + barGroupHeight / 2 + 1}
              textAnchor="end"
              fill="#a09888"
              fontSize={11}
              fontWeight={500}
              dominantBaseline="middle"
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
              opacity={0.85}
              style={{
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: `${i * 0.08}s`,
              }}
            />

            {/* Expense bar */}
            <rect
              x={labelWidth}
              y={y + 14}
              width={expenseWidth}
              height={12}
              rx={4}
              fill="#e06060"
              opacity={0.7}
              style={{
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: `${i * 0.08 + 0.05}s`,
              }}
            />

            {/* Net flow indicator */}
            <text
              x={labelWidth + Math.max(revenueWidth, expenseWidth) + 8}
              y={y + barGroupHeight / 2 + 1}
              fill={netFlow >= 0 ? '#6b8f71' : '#e06060'}
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

  const barData = [
    { label: 'Total Revenue', value: totalRevenue, color: '#6b8f71', gradient: 'linear-gradient(90deg, #6b8f71dd, #6b8f7155)' },
    { label: 'Total Expenses', value: totalExpenses, color: '#e06060', gradient: 'linear-gradient(90deg, #e06060dd, #e0606055)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {barData.map((d) => {
        const pct = (d.value / maxVal) * 100 * animProgress;
        return (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#a09888', fontWeight: 500 }}>{d.label}</span>
              <span style={{ fontSize: 13, color: d.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {fmtFull(d.value)}
              </span>
            </div>
            <div
              style={{
                height: 24,
                backgroundColor: '#1c2230',
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
      {/* Net difference */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: totalRevenue >= totalExpenses ? 'rgba(107, 143, 113, 0.08)' : 'rgba(224, 96, 96, 0.08)',
          border: `1px solid ${totalRevenue >= totalExpenses ? 'rgba(107, 143, 113, 0.2)' : 'rgba(224, 96, 96, 0.2)'}`,
          borderRadius: 12,
        }}
      >
        <span style={{ fontSize: 12, color: '#a09888', fontWeight: 500 }}>Net Cash Flow (6mo)</span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: totalRevenue >= totalExpenses ? '#6b8f71' : '#e06060',
          }}
        >
          {totalRevenue >= totalExpenses ? '+' : ''}{fmtFull(totalRevenue - totalExpenses)}
        </span>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
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

  const donutData = budgetLines.map((l) => ({
    label: l.category,
    value: l.budget,
    color: l.color,
  }));

  return (
    <div ref={containerRef} style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* ================================================================
         Header
         ================================================================ */}
      <div className="animate-fade-in" style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: 'rgba(212, 165, 116, 0.12)',
                border: '1px solid rgba(212, 165, 116, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={22} style={{ color: '#d4a574' }} />
            </div>
            <div>
              <h1
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #1e2638',
              backgroundColor: '#131720',
              color: '#a09888',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
              fontFamily: 'inherit',
            }}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <MetricCard
            label="Cash in Bank"
            value={fmtFull(CASH_IN_BANK)}
            icon={DollarSign}
            iconColor="#d4a574"
            trend="down"
            trendValue="-$12K from last month"
            delay={0.05}
          />
          <MetricCard
            label="Monthly Burn"
            value={fmt(MONTHLY_BURN)}
            icon={TrendingDown}
            iconColor="#e06060"
            trend="down"
            trendValue="-$1K from Feb"
            delay={0.1}
          />
          <MetricCard
            label="Monthly Revenue"
            value={fmt(MONTHLY_REVENUE)}
            icon={TrendingUp}
            iconColor="#6b8f71"
            trend="up"
            trendValue="+$2K MoM growth"
            delay={0.15}
          />
          <MetricCard
            label="Runway"
            value={`${RUNWAY_MONTHS.toFixed(1)} mo`}
            icon={Gauge}
            iconColor={runwayColor(RUNWAY_MONTHS)}
            trend="neutral"
            trendValue={runwayLabel(RUNWAY_MONTHS)}
            delay={0.2}
          />
        </div>
      </section>

      {/* ================================================================
         Budget Allocation Donut Chart + Legend
         ================================================================ */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.25s', opacity: 0, marginBottom: 36 }}
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
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            flexWrap: 'wrap',
          }}
        >
          {/* Donut Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
            <DonutChart data={donutData} size={220} strokeWidth={32} />
          </div>

          {/* Legend */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {budgetLines.map((line) => {
                const pct = ((line.budget / totalBudget) * 100).toFixed(0);
                const variance = line.budget - line.actual;
                const rag = ragStatus(variance, line.budget);
                return (
                  <div
                    key={line.category}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 4,
                        backgroundColor: line.color,
                        flexShrink: 0,
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
        className="animate-fade-in"
        style={{ animationDelay: '0.3s', opacity: 0, marginBottom: 36 }}
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
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: '24px 28px',
          }}
        >
          <RevenueExpenseBars />
        </div>
      </section>

      {/* ================================================================
         Monthly Cash Flow Timeline (Horizontal SVG Bar Chart)
         ================================================================ */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.35s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <BarChart3 size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Monthly Cash Flow Timeline
          </h2>
        </div>

        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: '24px 28px',
          }}
        >
          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 8, borderRadius: 4, backgroundColor: '#6b8f71' }} />
              <span style={{ fontSize: 11, color: '#a09888' }}>Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 8, borderRadius: 4, backgroundColor: '#e06060', opacity: 0.7 }} />
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
        className="animate-fade-in"
        style={{ animationDelay: '0.4s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Gauge size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Cash Runway
          </h2>
        </div>

        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          {/* Big number */}
          <div style={{ textAlign: 'center', minWidth: 160 }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: runwayColor(RUNWAY_MONTHS),
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              {RUNWAY_MONTHS.toFixed(1)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#a09888', marginTop: 4 }}>
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
            {/* Runway bar */}
            <div
              style={{
                height: 28,
                backgroundColor: '#1c2230',
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min((RUNWAY_MONTHS / 12) * 100, 100)}%`,
                  background: `linear-gradient(90deg, ${runwayColor(RUNWAY_MONTHS)}dd, ${runwayColor(RUNWAY_MONTHS)}88)`,
                  borderRadius: 14,
                  transition: 'width 1s ease-out',
                }}
              />
              {/* 6-month marker */}
              <div
                style={{
                  position: 'absolute',
                  left: `${(6 / 12) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: '#e8b44c60',
                }}
              />
              {/* 3-month marker */}
              <div
                style={{
                  position: 'absolute',
                  left: `${(3 / 12) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: '#e0606060',
                }}
              />
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
              <span style={{ color: '#e06060' }}>3 mo</span>
              <span style={{ color: '#e8b44c' }}>6 mo</span>
              <span>9 mo</span>
              <span>12 mo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
         Monthly Burn Tracker
         ================================================================ */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.45s', opacity: 0, marginBottom: 36 }}
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
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: '24px 28px',
          }}
        >
          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, position: 'relative' }}>
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
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: isOver ? '#e8b44c' : '#a09888',
                      marginBottom: 4,
                    }}
                  >
                    {fmt(d.amount)}
                  </span>
                  <div
                    className="animate-fade-in"
                    style={{
                      width: '100%',
                      maxWidth: 48,
                      height: `${heightPct}%`,
                      background: `linear-gradient(180deg, ${barColor}cc, ${barColor}55)`,
                      borderRadius: '8px 8px 4px 4px',
                      animationDelay: `${0.5 + i * 0.06}s`,
                      opacity: 0,
                      position: 'relative',
                    }}
                  >
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
        className="animate-fade-in"
        style={{ animationDelay: '0.5s', opacity: 0, marginBottom: 36 }}
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
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
              padding: '12px 24px',
              backgroundColor: '#0f1219',
              borderBottom: '1px solid #1e2638',
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
                className="animate-fade-in"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
                  padding: '14px 24px',
                  borderBottom: i < budgetLines.length - 1 ? '1px solid #1e263833' : 'none',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  animationDelay: `${0.55 + i * 0.04}s`,
                  opacity: 0,
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
              borderTop: '2px solid #1e2638',
              backgroundColor: '#0f1219',
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
                color: totalVariance >= 0 ? '#6b8f71' : '#e06060',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {totalVariance >= 0 ? '+' : ''}{fmtFull(totalVariance)}
            </span>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CheckCircle2
                size={16}
                style={{ color: totalVariance >= 0 ? '#6b8f71' : '#e06060' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
         Revenue vs $2M Target
         ================================================================ */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.6s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingUp size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Revenue vs $2M Target
          </h2>
        </div>

        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: 28,
          }}
        >
          {/* Top stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Current Revenue
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4' }}>
                $180K
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Target
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#d4a574' }}>
                $2M
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Completion
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#e8b44c' }}>
                {revenuePct.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                height: 18,
                backgroundColor: '#1c2230',
                borderRadius: 10,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(revenuePct, 100)}%`,
                  background: 'linear-gradient(90deg, #d4a574, #e8b44c)',
                  borderRadius: 10,
                  transition: 'width 1s ease-out',
                }}
              />
            </div>
          </div>

          {/* Monthly progression */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {monthlyRevenue.map((m, i) => (
              <div
                key={m.month}
                className="animate-fade-in"
                style={{
                  flex: 1,
                  minWidth: 80,
                  backgroundColor: '#1c2230',
                  borderRadius: 10,
                  padding: '10px 12px',
                  textAlign: 'center',
                  animationDelay: `${0.65 + i * 0.05}s`,
                  opacity: 0,
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
      </section>

      {/* ================================================================
         Decision Rights Matrix
         ================================================================ */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.7s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Shield size={18} style={{ color: '#8b5cf6' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Decision Rights Matrix
          </h2>
        </div>

        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr',
              padding: '12px 24px',
              backgroundColor: '#0f1219',
              borderBottom: '1px solid #1e2638',
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
              className="animate-fade-in"
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr 1fr',
                padding: '14px 24px',
                borderBottom: i < decisionRights.length - 1 ? '1px solid #1e263833' : 'none',
                alignItems: 'center',
                animationDelay: `${0.75 + i * 0.04}s`,
                opacity: 0,
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
        className="animate-fade-in"
        style={{ animationDelay: '0.8s', opacity: 0 }}
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
                className="animate-fade-in"
                style={{
                  backgroundColor: style.bg,
                  border: `1px solid ${style.border}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  animationDelay: `${0.85 + i * 0.06}s`,
                  opacity: 0,
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
