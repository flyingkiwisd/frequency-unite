'use client';

import { useState } from 'react';
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
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Data
// ─────────────────────────────────────────────────────────────────────────────
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
    revenue: '$78K/mo',
    burn: '$22K/mo',
    description: 'Current trajectory maintained. Stable membership, steady event revenue.',
    color: '#6b8f71',
    probability: '60%',
  },
  {
    name: 'Upside',
    runway: '24+ months',
    revenue: '$95K/mo',
    burn: '$24K/mo',
    description: 'Blue Spirit sells out + 30 new members onboarded. DAF admin fees scale.',
    color: '#8b5cf6',
    probability: '25%',
  },
  {
    name: 'Downside',
    runway: '11 months',
    revenue: '$55K/mo',
    burn: '$22K/mo',
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
const breakEvenTarget = 22000; // monthly burn
const currentMonthlyNet = MONTHLY_REVENUE - MONTHLY_BURN;
const breakEvenPct = Math.min((MONTHLY_REVENUE / (MONTHLY_REVENUE + MONTHLY_BURN)) * 100, 100);

// KPI sparkline data (simple arrays for mini-charts)
const balanceSparkline = [310, 325, 340, 355, 370, 385];
const burnSparkline = [21, 23, 24, 26, 22, 22];
const revenueSparkline = [62, 65, 70, 74, 76, 78];
const runwaySparkline = [14.8, 14.1, 14.2, 13.7, 16.8, 17.5];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n}`;

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

// Mini sparkline component
function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {data.map((value, i) => {
        const barHeight = ((value - min) / range) * 0.7 + 0.3; // min 30% height
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-500"
            style={{
              height: `${barHeight * 100}%`,
              backgroundColor: i === data.length - 1 ? color : `${color}55`,
              minWidth: 4,
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function CashRunwayView() {
  const [activeScenario, setActiveScenario] = useState<number>(0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
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

      {/* ── 4 KPI Cards with Sparklines ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in"
        style={{ animationDelay: '50ms', opacity: 0 }}
      >
        {/* Current Balance */}
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted uppercase tracking-wider">Current Balance</p>
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-3">$385K</div>
          <Sparkline data={balanceSparkline} color="#d4a574" />
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-[11px] text-success">+$15K from last month</span>
          </div>
        </div>

        {/* Monthly Burn */}
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted uppercase tracking-wider">Monthly Burn</p>
            <div className="w-7 h-7 rounded-lg bg-danger/15 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-danger" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-3">$22K</div>
          <Sparkline data={burnSparkline} color="#e06060" />
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown className="w-3 h-3 text-success" />
            <span className="text-[11px] text-success">-$4K from Jan peak</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted uppercase tracking-wider">Monthly Revenue</p>
            <div className="w-7 h-7 rounded-lg bg-accent-violet/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent-violet" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-3">$78K</div>
          <Sparkline data={revenueSparkline} color="#8b5cf6" />
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-[11px] text-success">+26% since Oct</span>
          </div>
        </div>

        {/* Cash Runway */}
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted uppercase tracking-wider">Cash Runway</p>
            <div className="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center">
              <Gauge className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold" style={{ color: runwayColor(RUNWAY_MONTHS) }}>
              {RUNWAY_MONTHS.toFixed(1)}
            </span>
            <span className="text-sm text-text-muted mb-1">months</span>
          </div>
          <Sparkline data={runwaySparkline} color={runwayColor(RUNWAY_MONTHS)} />
          <div className="mt-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                color: runwayColor(RUNWAY_MONTHS),
                backgroundColor: `${runwayColor(RUNWAY_MONTHS)}18`,
              }}
            >
              {runwayLabel(RUNWAY_MONTHS)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Revenue vs Plan Chart ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '100ms', opacity: 0 }}
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
                      animationDelay: `${0.15 + i * 0.06}s`,
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
                      animationDelay: `${0.18 + i * 0.06}s`,
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

      {/* ── Scenario Modeling ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '150ms', opacity: 0 }}
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
            const runwayNum = parseFloat(scenario.runway);
            const maxRunway = 30;
            const pct = Math.min((runwayNum / maxRunway) * 100, 100);
            const isNaN = Number.isNaN(runwayNum);

            return (
              <div key={scenario.name} className="flex items-center gap-4">
                <span className="text-xs text-text-muted w-24 shrink-0">{scenario.name}</span>
                <div className="flex-1 h-4 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: isNaN ? '80%' : `${pct}%`,
                      background: `linear-gradient(90deg, ${scenario.color}dd, ${scenario.color}88)`,
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
            <div className="flex-1 relative">
              <div
                className="absolute top-0 bottom-0 w-[1px] border-l-2 border-dashed border-warning/40"
                style={{ left: `${(12 / 30) * 100}%` }}
              />
              <span
                className="absolute text-[9px] text-warning font-semibold"
                style={{ left: `${(12 / 30) * 100}%`, top: -14, transform: 'translateX(-50%)' }}
              >
                12mo safety line
              </span>
            </div>
            <span className="w-20" />
          </div>
        </div>
      </div>

      {/* ── Revenue Breakdown + Break-Even ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div
          className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
          style={{ animationDelay: '200ms', opacity: 0 }}
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
          style={{ animationDelay: '250ms', opacity: 0 }}
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
                Cash flow positive — revenue exceeds burn by {fmt(currentMonthlyNet)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Assumptions ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '300ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-accent-violet" />
          <h2 className="text-lg font-semibold text-text-primary">Key Assumptions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assumptions.map((a) => (
            <div key={a.label} className="bg-surface-2 rounded-lg p-4 flex items-center justify-between">
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
