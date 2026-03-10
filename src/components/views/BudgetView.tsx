'use client';

import React, { useRef } from 'react';
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
  Minus,
  Download,
} from 'lucide-react';
import { exportPdf } from '@/lib/data';

/* ─── Constants & Data ─── */

const CASH_IN_BANK = 210000;
const MONTHLY_BURN = 25000;
const RUNWAY_MONTHS = CASH_IN_BANK / MONTHLY_BURN; // 8.4

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

/* ── Monthly Burn Data ── */
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

/* ── Budget vs Actuals ── */
interface BudgetLine {
  category: string;
  budget: number;
  actual: number;
}

const budgetLines: BudgetLine[] = [
  { category: 'Core Team Payroll', budget: 15000, actual: 14500 },
  { category: 'Operations', budget: 4000, actual: 3800 },
  { category: 'Events', budget: 3000, actual: 3200 },
  { category: 'Technology', budget: 1000, actual: 800 },
  { category: 'Marketing / Outreach', budget: 1000, actual: 600 },
  { category: 'Misc / Buffer', budget: 1000, actual: 1200 },
];

const ragStatus = (variance: number, budget: number) => {
  const pct = Math.abs(variance) / budget;
  if (variance >= 0) return { color: '#6b8f71', label: 'Under', bg: 'rgba(107, 143, 113, 0.15)' };
  if (pct <= 0.1) return { color: '#e8b44c', label: 'Amber', bg: 'rgba(232, 180, 76, 0.15)' };
  return { color: '#e06060', label: 'Over', bg: 'rgba(224, 96, 96, 0.15)' };
};

/* ── Revenue Progression ── */
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

/* ── Decision Rights ── */
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

/* ── Alerts ── */
const alerts = [
  {
    severity: 'amber' as const,
    message: 'January burn exceeded $25K target by $1K due to Cabo retreat expenses.',
    date: 'Jan 2026',
  },
  {
    severity: 'amber' as const,
    message: 'Misc/Buffer category over budget by $200 — review discretionary spending.',
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

/* ─── Helpers ─── */
const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n}`;

const fmtFull = (n: number) =>
  `$${n.toLocaleString()}`;

/* ─── Component ─── */

export function BudgetView() {
  const totalBudget = budgetLines.reduce((s, l) => s + l.budget, 0);
  const totalActual = budgetLines.reduce((s, l) => s + l.actual, 0);
  const totalVariance = totalBudget - totalActual;
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Header ── */}
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
              <p style={{ fontSize: 13, color: '#a09888', margin: 0, marginTop: 2 }}>
                Financial clarity above all. No surprises.
              </p>
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

      {/* ── Cash Runway Indicator ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.05s', opacity: 0, marginBottom: 36 }}
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

      {/* ── Monthly Burn Tracker ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.1s', opacity: 0, marginBottom: 36 }}
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
                      animationDelay: `${0.15 + i * 0.06}s`,
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

      {/* ── Budget vs Actuals Table ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.2s', opacity: 0, marginBottom: 36 }}
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
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
                  padding: '14px 24px',
                  borderBottom: i < budgetLines.length - 1 ? '1px solid #1e263833' : 'none',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ebe4' }}>
                  {line.category}
                </span>
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

      {/* ── Revenue vs $2M Target ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.3s', opacity: 0, marginBottom: 36 }}
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
                style={{
                  flex: 1,
                  minWidth: 80,
                  backgroundColor: '#1c2230',
                  borderRadius: 10,
                  padding: '10px 12px',
                  textAlign: 'center',
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

      {/* ── Decision Rights Matrix ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.4s', opacity: 0, marginBottom: 36 }}
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
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr 1fr',
                padding: '14px 24px',
                borderBottom: i < decisionRights.length - 1 ? '1px solid #1e263833' : 'none',
                alignItems: 'center',
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

      {/* ── Alerts ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.5s', opacity: 0 }}
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
                style={{
                  backgroundColor: style.bg,
                  border: `1px solid ${style.border}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
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
