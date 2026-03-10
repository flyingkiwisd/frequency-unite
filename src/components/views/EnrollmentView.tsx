'use client';

import React, { useRef } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Calendar,
  Clock,
  Ticket,
  Target,
  ChevronRight,
  ArrowDown,
  Zap,
  Download,
} from 'lucide-react';
import { teamMembers, exportPdf } from '@/lib/data';

/* ─── Color Palette ─── */
const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const ROSE = '#e879a0';
const SKY = '#5eaed4';
const ORANGE = '#f59e0b';
const GOLD = '#e8b44c';

/* ─── Pipeline Stages ─── */
const pipelineStages = [
  { label: 'Awareness', count: 610, color: '#6b8f71' },
  { label: 'Prospect', count: 145, color: '#5eaed4' },
  { label: 'Conversation', count: 68, color: '#8b5cf6' },
  { label: 'Offer', count: 32, color: '#d4a574' },
  { label: 'Signed', count: 18, color: '#e8b44c' },
  { label: 'Active', count: 65, color: '#e879a0' },
];

/* ─── Revenue Segments ─── */
const revenueSegments = [
  { label: 'Memberships', amount: 780000, color: AMBER },
  { label: 'Events', amount: 285000, color: VIOLET },
  { label: 'Pledges', amount: 120000, color: SAGE },
  { label: 'Donors', amount: 85000, color: ROSE },
  { label: 'Grants', amount: 45000, color: SKY },
];
const revenueTarget = 2000000;
const revenueTotal = revenueSegments.reduce((s, r) => s + r.amount, 0);

/* ─── Member Composition ─── */
const memberTypes = [
  { label: 'Coherence Members', count: 28, color: SAGE },
  { label: 'Investors', count: 15, color: GOLD },
  { label: 'Founders', count: 12, color: ROSE },
  { label: 'Network Stewards', count: 6, color: ORANGE },
  { label: 'Experts', count: 4, color: SKY },
];
const totalTarget = 144;
const totalActive = memberTypes.reduce((s, m) => s + m.count, 0);

/* ─── At-Risk Members ─── */
const atRiskMembers = [
  {
    name: 'Daniel Reeves',
    renewalDate: '2026-03-28',
    engagement: 'low' as const,
    daysSinceTouch: 34,
  },
  {
    name: 'Sophie Langford',
    renewalDate: '2026-04-05',
    engagement: 'low' as const,
    daysSinceTouch: 21,
  },
  {
    name: 'Marcus Chen',
    renewalDate: '2026-04-12',
    engagement: 'medium' as const,
    daysSinceTouch: 18,
  },
  {
    name: 'Priya Sharma',
    renewalDate: '2026-03-22',
    engagement: 'low' as const,
    daysSinceTouch: 42,
  },
  {
    name: 'Tobias Grant',
    renewalDate: '2026-04-20',
    engagement: 'medium' as const,
    daysSinceTouch: 15,
  },
];

/* ─── Blue Spirit Event Data ─── */
const blueSpiritDate = new Date('2026-07-18');
const today = new Date();
const daysUntilEvent = Math.max(
  0,
  Math.ceil(
    (blueSpiritDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
);

const blueSpiritStats = {
  ticketsSold: 32,
  ticketTarget: 70,
  revenue: 38000,
  revenueBudget: 85000,
  waitlist: 0,
  daysUntil: daysUntilEvent,
};

/* ─── Helpers ─── */
const formatCurrency = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
};

const engagementConfig: Record<
  'low' | 'medium' | 'high',
  { label: string; color: string; bg: string }
> = {
  low: { label: 'Low', color: '#e06060', bg: 'rgba(224, 96, 96, 0.15)' },
  medium: { label: 'Medium', color: '#e8b44c', bg: 'rgba(232, 180, 76, 0.15)' },
  high: { label: 'High', color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.15)' },
};

/* ─── Progress Ring Component ─── */
function ProgressRing({
  current,
  target,
  size = 160,
  strokeWidth = 10,
  color = AMBER,
}: {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(current / target, 1);
  const offset = circumference * (1 - pct);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />
      </svg>
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
            fontSize: 36,
            fontWeight: 800,
            color: '#f0ebe4',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {current}
        </span>
        <span
          style={{
            fontSize: 13,
            color: '#8b7a6b',
            marginTop: 2,
          }}
        >
          / {target}
        </span>
      </div>
    </div>
  );
}

/* ─── Section Card Wrapper ─── */
function SectionCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-in"
      style={{
        backgroundColor: '#131720',
        border: '1px solid #1e2638',
        borderRadius: 16,
        padding: 24,
        animationDelay: `${delay}s`,
        opacity: 0,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Section Header ─── */
function SectionHeader({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${color}15`,
        }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#f0ebe4',
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */

export function EnrollmentView() {
  /* ── Compute funnel max for bar widths ── */
  const funnelMax = pipelineStages[0].count;
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ padding: '32px 40px', maxWidth: 1080, margin: '0 auto' }}>
      {/* ═══ 1. HEADER ═══ */}
      <div
        className="animate-fade-in"
        style={{ marginBottom: 40, opacity: 0, animationDelay: '0s' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 6,
              }}
            >
              <Users size={28} style={{ color: AMBER }} />
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Enrollment Pipeline
              </h1>
              <button
                onClick={() => { if (containerRef.current) exportPdf(containerRef.current, 'Enrollment'); }}
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
            <p
              style={{
                fontSize: 14,
                color: '#a09888',
                margin: 0,
                paddingLeft: 40,
              }}
            >
              Building the 144 &mdash; tracking every step from awareness to
              active stewardship.
            </p>
          </div>

          {/* Progress Ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ProgressRing
              current={totalActive}
              target={totalTarget}
              size={120}
              strokeWidth={8}
              color={AMBER}
            />
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: AMBER,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 4,
                }}
              >
                Stewards
              </div>
              <div style={{ fontSize: 13, color: '#a09888', lineHeight: 1.6 }}>
                {totalActive} active
                <br />
                {totalTarget - totalActive} remaining
                <br />
                <span style={{ color: SAGE }}>
                  {Math.round((totalActive / totalTarget) * 100)}% complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 2. PIPELINE FUNNEL ═══ */}
      <SectionCard delay={0.08}>
        <SectionHeader icon={TrendingUp} label="Pipeline Funnel" color={VIOLET} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pipelineStages.map((stage, i) => {
            const widthPct = Math.max(
              15,
              Math.round((stage.count / funnelMax) * 100)
            );
            const prevCount =
              i > 0 ? pipelineStages[i - 1].count : null;
            const conversionRate =
              prevCount !== null
                ? Math.round((stage.count / prevCount) * 100)
                : null;

            return (
              <div key={stage.label}>
                {/* Conversion arrow between stages */}
                {conversionRate !== null && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '2px 0',
                    }}
                  >
                    <ArrowDown size={12} style={{ color: '#4a5568' }} />
                    <span
                      style={{
                        fontSize: 11,
                        color: '#6b6358',
                        fontWeight: 500,
                        fontFamily: 'monospace',
                      }}
                    >
                      {conversionRate}%
                    </span>
                  </div>
                )}

                {/* Stage bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {/* Label */}
                  <div
                    style={{
                      width: 100,
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#d8cfc4',
                      textAlign: 'right',
                    }}
                  >
                    {stage.label}
                  </div>

                  {/* Bar container */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <div
                      style={{
                        height: 32,
                        width: `${widthPct}%`,
                        backgroundColor: `${stage.color}22`,
                        border: `1px solid ${stage.color}40`,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 12,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'width 0.6s ease-out',
                      }}
                    >
                      {/* Fill gradient */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(90deg, ${stage.color}30, ${stage.color}08)`,
                          borderRadius: 5,
                        }}
                      />
                      <span
                        style={{
                          position: 'relative',
                          fontSize: 14,
                          fontWeight: 700,
                          color: stage.color,
                          fontFamily: 'monospace',
                        }}
                      >
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall conversion summary */}
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: AMBER, fontFamily: 'monospace' }}>
              {Math.round(
                (pipelineStages[pipelineStages.length - 1].count /
                  pipelineStages[0].count) *
                  100
              )}
              %
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>
              Full Funnel Conversion
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: VIOLET, fontFamily: 'monospace' }}>
              {pipelineStages[2].count}
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>
              Active Conversations
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: SAGE, fontFamily: 'monospace' }}>
              {pipelineStages[4].count}
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>
              Signed This Period
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ═══ 3. REVENUE TRACKER ═══ */}
      <div style={{ marginTop: 24 }}>
        <SectionCard delay={0.16}>
          <SectionHeader icon={DollarSign} label="Revenue Tracker" color={GOLD} />

          {/* Total summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#f0ebe4',
                fontFamily: 'monospace',
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(revenueTotal)}
            </span>
            <span style={{ fontSize: 14, color: '#6b6358' }}>
              of {formatCurrency(revenueTarget)} target
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: SAGE,
                marginLeft: 'auto',
              }}
            >
              {Math.round((revenueTotal / revenueTarget) * 100)}%
            </span>
          </div>

          {/* Stacked horizontal bar */}
          <div
            style={{
              height: 36,
              borderRadius: 8,
              overflow: 'hidden',
              display: 'flex',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: 16,
            }}
          >
            {revenueSegments.map((seg) => {
              const segPct = (seg.amount / revenueTarget) * 100;
              return (
                <div
                  key={seg.label}
                  style={{
                    width: `${segPct}%`,
                    height: '100%',
                    backgroundColor: `${seg.color}55`,
                    borderRight: '1px solid rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'width 0.6s ease-out',
                  }}
                  title={`${seg.label}: ${formatCurrency(seg.amount)}`}
                >
                  {segPct > 6 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#f0ebe4',
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatCurrency(seg.amount)}
                    </span>
                  )}
                </div>
              );
            })}
            {/* Remaining unfilled portion */}
            <div
              style={{
                flex: 1,
                height: '100%',
              }}
            />
          </div>

          {/* Segment legend */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            {revenueSegments.map((seg) => (
              <div
                key={seg.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    backgroundColor: seg.color,
                  }}
                />
                <span style={{ fontSize: 12, color: '#a09888' }}>
                  {seg.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#d8cfc4',
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(seg.amount)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ═══ 4. MEMBER COMPOSITION WHEEL (Grid of 144 circles) ═══ */}
      <div style={{ marginTop: 24 }}>
        <SectionCard delay={0.24}>
          <SectionHeader icon={Target} label="Member Composition" color={SAGE} />

          {/* Summary row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 20,
            }}
          >
            {memberTypes.map((mt) => (
              <div
                key={mt.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  backgroundColor: `${mt.color}10`,
                  border: `1px solid ${mt.color}25`,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: mt.color,
                  }}
                />
                <span style={{ fontSize: 12, color: '#d8cfc4' }}>
                  {mt.label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: mt.color,
                    fontFamily: 'monospace',
                  }}
                >
                  {mt.count}
                </span>
              </div>
            ))}
          </div>

          {/* Grid of 144 circles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(18, 1fr)',
              gap: 4,
              maxWidth: 540,
            }}
          >
            {Array.from({ length: totalTarget }).map((_, i) => {
              // Determine which member type this circle belongs to
              let accumulated = 0;
              let circleColor = 'rgba(255,255,255,0.06)';
              let filled = false;

              for (const mt of memberTypes) {
                if (i < accumulated + mt.count) {
                  circleColor = mt.color;
                  filled = true;
                  break;
                }
                accumulated += mt.count;
              }

              return (
                <div
                  key={i}
                  style={{
                    width: '100%',
                    paddingBottom: '100%',
                    borderRadius: '50%',
                    backgroundColor: filled ? `${circleColor}50` : 'rgba(255,255,255,0.04)',
                    border: filled
                      ? `1.5px solid ${circleColor}80`
                      : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: filled
                      ? `0 0 4px ${circleColor}30`
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              );
            })}
          </div>

          {/* Totals bar */}
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={14} style={{ color: AMBER }} />
              <span style={{ fontSize: 13, color: '#a09888' }}>
                Total Active
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: AMBER,
                  fontFamily: 'monospace',
                }}
              >
                {totalActive}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#6b6358' }}>
                Target
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#f0ebe4',
                  fontFamily: 'monospace',
                }}
              >
                {totalTarget}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ═══ BOTTOM ROW: At-Risk Members + Blue Spirit Tracker ═══ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginTop: 24,
        }}
      >
        {/* ═══ 5. AT-RISK MEMBERS ═══ */}
        <SectionCard delay={0.32}>
          <SectionHeader
            icon={AlertTriangle}
            label="At-Risk Members"
            color="#e06060"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {atRiskMembers.map((member) => {
              const eng = engagementConfig[member.engagement];
              const renewalDate = new Date(member.renewalDate);
              const daysToRenewal = Math.ceil(
                (renewalDate.getTime() - today.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const urgent = daysToRenewal <= 14;

              return (
                <div
                  key={member.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    backgroundColor: urgent
                      ? 'rgba(224, 96, 96, 0.06)'
                      : 'rgba(255,255,255,0.02)',
                    border: urgent
                      ? '1px solid rgba(224, 96, 96, 0.2)'
                      : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#d8cfc4',
                        marginBottom: 3,
                      }}
                    >
                      {member.name}
                      {urgent && (
                        <AlertTriangle
                          size={12}
                          style={{
                            color: '#e06060',
                            marginLeft: 6,
                            verticalAlign: 'middle',
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 11,
                        color: '#6b6358',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={10} />
                        Renews{' '}
                        {renewalDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} />
                        {member.daysSinceTouch}d since touch
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 20,
                      color: eng.color,
                      backgroundColor: eng.bg,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {eng.label}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ═══ 6. BLUE SPIRIT SELLOUT TRACKER ═══ */}
        <SectionCard delay={0.38}>
          <SectionHeader
            icon={Ticket}
            label="Blue Spirit Sellout Tracker"
            color={AMBER}
          />

          {/* Key stats grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 16,
            }}
          >
            {/* Tickets */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                backgroundColor: 'rgba(212, 165, 116, 0.06)',
                border: '1px solid rgba(212, 165, 116, 0.15)',
              }}
            >
              <div
                style={{ fontSize: 11, color: '#6b6358', marginBottom: 6 }}
              >
                Tickets Sold
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: AMBER,
                    fontFamily: 'monospace',
                  }}
                >
                  {blueSpiritStats.ticketsSold}
                </span>
                <span style={{ fontSize: 13, color: '#6b6358' }}>
                  / {blueSpiritStats.ticketTarget}
                </span>
              </div>
              {/* Mini bar */}
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(
                      (blueSpiritStats.ticketsSold /
                        blueSpiritStats.ticketTarget) *
                        100
                    )}%`,
                    backgroundColor: AMBER,
                    borderRadius: 2,
                    transition: 'width 0.6s ease-out',
                  }}
                />
              </div>
            </div>

            {/* Revenue */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                backgroundColor: 'rgba(139, 92, 246, 0.06)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
              }}
            >
              <div
                style={{ fontSize: 11, color: '#6b6358', marginBottom: 6 }}
              >
                Revenue
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: VIOLET,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(blueSpiritStats.revenue)}
                </span>
                <span style={{ fontSize: 13, color: '#6b6358' }}>
                  / {formatCurrency(blueSpiritStats.revenueBudget)}
                </span>
              </div>
              {/* Mini bar */}
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(
                      (blueSpiritStats.revenue /
                        blueSpiritStats.revenueBudget) *
                        100
                    )}%`,
                    backgroundColor: VIOLET,
                    borderRadius: 2,
                    transition: 'width 0.6s ease-out',
                  }}
                />
              </div>
            </div>

            {/* Waitlist */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                backgroundColor: 'rgba(107, 143, 113, 0.06)',
                border: '1px solid rgba(107, 143, 113, 0.15)',
              }}
            >
              <div
                style={{ fontSize: 11, color: '#6b6358', marginBottom: 6 }}
              >
                Waitlist
              </div>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: SAGE,
                  fontFamily: 'monospace',
                }}
              >
                {blueSpiritStats.waitlist}
              </span>
            </div>

            {/* Days Until */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                backgroundColor: 'rgba(232, 135, 160, 0.06)',
                border: '1px solid rgba(232, 135, 160, 0.15)',
              }}
            >
              <div
                style={{ fontSize: 11, color: '#6b6358', marginBottom: 6 }}
              >
                Days Until Event
              </div>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: ROSE,
                  fontFamily: 'monospace',
                }}
              >
                {blueSpiritStats.daysUntil}
              </span>
            </div>
          </div>

          {/* Event info footer */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: '#a09888',
              }}
            >
              <Calendar size={13} style={{ color: AMBER }} />
              <span style={{ fontWeight: 600, color: '#d8cfc4' }}>
                Blue Spirit 6.0
              </span>
              &middot; July 18, 2026 &middot; Nosara, Costa Rica
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: AMBER,
                padding: '3px 10px',
                borderRadius: 20,
                backgroundColor: 'rgba(212, 165, 116, 0.12)',
                border: '1px solid rgba(212, 165, 116, 0.25)',
              }}
            >
              {Math.round(
                (blueSpiritStats.ticketsSold /
                  blueSpiritStats.ticketTarget) *
                  100
              )}
              % sold
            </span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
