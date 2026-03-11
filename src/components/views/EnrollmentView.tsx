'use client';

import React, { useRef, useState } from 'react';
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
  UserPlus,
  ArrowUpRight,
  Mail,
  Phone,
} from 'lucide-react';
import { teamMembers, exportPdf } from '@/lib/data';

/* --- Color Palette --- */
const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const ROSE = '#e879a0';
const SKY = '#5eaed4';
const ORANGE = '#f59e0b';
const GOLD = '#e8b44c';

/* --- Pipeline Stages --- */
const pipelineStages = [
  { label: 'Awareness', count: 610, color: '#6b8f71', icon: '~' },
  { label: 'Prospect', count: 145, color: '#5eaed4', icon: '~' },
  { label: 'Conversation', count: 68, color: '#8b5cf6', icon: '~' },
  { label: 'Offer', count: 32, color: '#d4a574', icon: '~' },
  { label: 'Signed', count: 18, color: '#e8b44c', icon: '~' },
  { label: 'Active', count: 65, color: '#e879a0', icon: '~' },
];

/* --- Revenue Segments --- */
const revenueSegments = [
  { label: 'Memberships', amount: 780000, color: AMBER },
  { label: 'Events', amount: 285000, color: VIOLET },
  { label: 'Pledges', amount: 120000, color: SAGE },
  { label: 'Donors', amount: 85000, color: ROSE },
  { label: 'Grants', amount: 45000, color: SKY },
];
const revenueTarget = 2000000;
const revenueTotal = revenueSegments.reduce((s, r) => s + r.amount, 0);

/* --- Member Composition --- */
const memberTypes = [
  { label: 'Coherence Members', count: 28, color: SAGE },
  { label: 'Investors', count: 15, color: GOLD },
  { label: 'Founders', count: 12, color: ROSE },
  { label: 'Network Stewards', count: 6, color: ORANGE },
  { label: 'Experts', count: 4, color: SKY },
];
const totalTarget = 144;
const totalActive = memberTypes.reduce((s, m) => s + m.count, 0);

/* --- Pipeline Member Cards --- */
const pipelineMembers = [
  { name: 'Alicia Rivera', stage: 'Conversation', avatar: 'AR', daysInStage: 5, source: 'Cabo Referral', score: 88, color: VIOLET },
  { name: 'Marcus Chen', stage: 'Offer', avatar: 'MC', daysInStage: 3, source: 'Warm Intro', score: 92, color: AMBER },
  { name: 'Priya Sharma', stage: 'Prospect', avatar: 'PS', daysInStage: 12, source: 'Website', score: 74, color: SKY },
  { name: 'Daniel Reeves', stage: 'Conversation', avatar: 'DR', daysInStage: 8, source: 'Event Lead', score: 81, color: VIOLET },
  { name: 'Sophie Langford', stage: 'Offer', avatar: 'SL', daysInStage: 2, source: 'Board Referral', score: 95, color: AMBER },
  { name: 'Tobias Grant', stage: 'Signed', avatar: 'TG', daysInStage: 1, source: 'Blue Spirit 5.0', score: 90, color: GOLD },
];

/* --- At-Risk Members --- */
const atRiskMembers = [
  { name: 'Daniel Reeves', renewalDate: '2026-03-28', engagement: 'low' as const, daysSinceTouch: 34 },
  { name: 'Sophie Langford', renewalDate: '2026-04-05', engagement: 'low' as const, daysSinceTouch: 21 },
  { name: 'Marcus Chen', renewalDate: '2026-04-12', engagement: 'medium' as const, daysSinceTouch: 18 },
  { name: 'Priya Sharma', renewalDate: '2026-03-22', engagement: 'low' as const, daysSinceTouch: 42 },
  { name: 'Tobias Grant', renewalDate: '2026-04-20', engagement: 'medium' as const, daysSinceTouch: 15 },
];

/* --- Blue Spirit Event Data --- */
const blueSpiritDate = new Date('2026-07-18');
const today = new Date();
const daysUntilEvent = Math.max(
  0,
  Math.ceil((blueSpiritDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
);

const blueSpiritStats = {
  ticketsSold: 32,
  ticketTarget: 70,
  revenue: 38000,
  revenueBudget: 85000,
  waitlist: 0,
  daysUntil: daysUntilEvent,
};

/* --- Helpers --- */
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

/* --- SVG Funnel Visualization --- */
function FunnelSVG() {
  const stageHeight = 42;
  const gap = 6;
  const totalHeight = pipelineStages.length * (stageHeight + gap) - gap;
  const width = 600;
  const maxBarWidth = 480;
  const labelWidth = 100;
  const funnelMax = pipelineStages[0].count;

  return (
    <svg width="100%" height={totalHeight} viewBox={`0 0 ${width} ${totalHeight}`} style={{ overflow: 'visible' }}>
      <defs>
        {pipelineStages.map((stage, i) => (
          <linearGradient key={stage.label} id={`funnel-grad-${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={stage.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={stage.color} stopOpacity="0.08" />
          </linearGradient>
        ))}
      </defs>
      {pipelineStages.map((stage, i) => {
        const y = i * (stageHeight + gap);
        const barW = Math.max(60, (stage.count / funnelMax) * maxBarWidth);
        const xOffset = labelWidth + (maxBarWidth - barW) / 2;
        const prevCount = i > 0 ? pipelineStages[i - 1].count : null;
        const conversion = prevCount !== null ? Math.round((stage.count / prevCount) * 100) : null;

        return (
          <g key={stage.label}>
            {/* Stage label */}
            <text x={labelWidth - 8} y={y + stageHeight / 2 + 1} textAnchor="end" fill="#d8cfc4" fontSize="12" fontWeight="600" dominantBaseline="middle">
              {stage.label}
            </text>

            {/* Funnel bar (trapezoid shape) */}
            <rect
              x={xOffset}
              y={y}
              width={barW}
              height={stageHeight}
              rx={6}
              fill={`url(#funnel-grad-${i})`}
              stroke={`${stage.color}40`}
              strokeWidth="1"
              style={{ transition: 'all 0.6s ease-out' }}
            />

            {/* Glow line at top of bar */}
            <line x1={xOffset + 4} y1={y} x2={xOffset + barW - 4} y2={y} stroke={stage.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

            {/* Count text */}
            <text x={xOffset + 14} y={y + stageHeight / 2 + 1} fill={stage.color} fontSize="15" fontWeight="700" fontFamily="monospace" dominantBaseline="middle">
              {stage.count.toLocaleString()}
            </text>

            {/* Conversion rate badge between stages */}
            {conversion !== null && i > 0 && (
              <g>
                <rect
                  x={width - 70}
                  y={y - gap / 2 - 10}
                  width={48}
                  height={20}
                  rx={10}
                  fill={`${stage.color}18`}
                  stroke={`${stage.color}30`}
                  strokeWidth="0.5"
                />
                <text
                  x={width - 46}
                  y={y - gap / 2 + 1}
                  textAnchor="middle"
                  fill={stage.color}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                  dominantBaseline="middle"
                >
                  {conversion}%
                </text>
              </g>
            )}

            {/* Connector line between stages */}
            {i < pipelineStages.length - 1 && (
              <line
                x1={labelWidth + maxBarWidth / 2}
                y1={y + stageHeight}
                x2={labelWidth + maxBarWidth / 2}
                y2={y + stageHeight + gap}
                stroke="#2e3a4e"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* --- Progress Ring Component --- */
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
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
        <span style={{ fontSize: 13, color: '#8b7a6b', marginTop: 2 }}>
          / {target}
        </span>
      </div>
    </div>
  );
}

/* --- Section Card Wrapper --- */
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
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#2e3a4e';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e2638';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
    </div>
  );
}

/* --- Section Header --- */
function SectionHeader({
  icon: Icon,
  label,
  color,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  badge?: string;
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
      {badge && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 20,
            color,
            backgroundColor: `${color}15`,
            border: `1px solid ${color}30`,
            marginLeft: 4,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/* --- Pipeline Member Card --- */
function PipelineMemberCard({
  member,
  index,
}: {
  member: typeof pipelineMembers[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="animate-fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        backgroundColor: hovered ? 'rgba(255,255,255,0.03)' : '#0f1219',
        border: `1px solid ${hovered ? member.color + '40' : '#1c2230'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.25s ease',
        animationDelay: `${0.3 + index * 0.04}s`,
        opacity: 0,
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? `0 4px 16px ${member.color}10` : 'none',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#0b0d14',
          background: `linear-gradient(135deg, ${member.color}, ${member.color}88)`,
          flexShrink: 0,
        }}
      >
        {member.avatar}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>{member.name}</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 20,
              color: member.color,
              backgroundColor: `${member.color}15`,
              border: `1px solid ${member.color}25`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {member.stage}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#6b6358' }}>
          <span>{member.source}</span>
          <span style={{ color: '#2e3a4e' }}>|</span>
          <span>{member.daysInStage}d in stage</span>
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: member.score >= 85 ? SAGE : member.score >= 70 ? GOLD : '#e06060',
            fontFamily: 'monospace',
            lineHeight: 1,
          }}
        >
          {member.score}
        </div>
        <div style={{ fontSize: 9, color: '#6b6358', marginTop: 2 }}>FIT SCORE</div>
      </div>

      {/* Action indicator */}
      <ChevronRight
        size={14}
        style={{
          color: hovered ? member.color : '#2e3a4e',
          transition: 'color 0.2s, transform 0.2s',
          transform: hovered ? 'translateX(2px)' : 'none',
          flexShrink: 0,
        }}
      />
    </div>
  );
}

/* ===================================================================
   Main Component
   =================================================================== */

export function EnrollmentView() {
  const funnelMax = pipelineStages[0].count;
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ padding: '32px 40px', maxWidth: 1080, margin: '0 auto' }}>
      {/* === 1. HEADER === */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
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
            <p style={{ fontSize: 14, color: '#a09888', margin: 0, paddingLeft: 40 }}>
              Building the 144 &mdash; tracking every step from awareness to active stewardship.
            </p>
          </div>

          {/* Progress Ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ProgressRing current={totalActive} target={totalTarget} size={120} strokeWidth={8} color={AMBER} />
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
                <span style={{ color: SAGE }}>{Math.round((totalActive / totalTarget) * 100)}% complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === SUMMARY STATS BAR === */}
      <div
        className="animate-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 24,
          animationDelay: '0.04s',
          opacity: 0,
        }}
      >
        {[
          { label: 'Pipeline Total', value: pipelineStages.reduce((s, st) => s + st.count, 0).toLocaleString(), color: AMBER, icon: UserPlus },
          { label: 'Full Funnel Conv.', value: `${Math.round((pipelineStages[pipelineStages.length - 1].count / pipelineStages[0].count) * 100)}%`, color: VIOLET, icon: TrendingUp },
          { label: 'Active Conversations', value: pipelineStages[2].count.toString(), color: SKY, icon: Users },
          { label: 'Revenue YTD', value: formatCurrency(revenueTotal), color: GOLD, icon: DollarSign },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glow-card"
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                backgroundColor: `${stat.color}0a`,
                border: `1px solid ${stat.color}20`,
                transition: 'border-color 0.3s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${stat.color}40`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${stat.color}20`;
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Icon size={13} style={{ color: stat.color }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: stat.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* === 2. PIPELINE FUNNEL (SVG) === */}
      <SectionCard delay={0.08}>
        <SectionHeader icon={TrendingUp} label="Pipeline Funnel" color={VIOLET} badge={`${pipelineStages.length} stages`} />
        <FunnelSVG />

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
              {Math.round((pipelineStages[pipelineStages.length - 1].count / pipelineStages[0].count) * 100)}%
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Full Funnel Conversion</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: VIOLET, fontFamily: 'monospace' }}>
              {pipelineStages[2].count}
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Active Conversations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: SAGE, fontFamily: 'monospace' }}>
              {pipelineStages[4].count}
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Signed This Period</div>
          </div>
        </div>
      </SectionCard>

      {/* === 3. PIPELINE MEMBER CARDS === */}
      <div style={{ marginTop: 24 }}>
        <SectionCard delay={0.12}>
          <SectionHeader icon={UserPlus} label="Active Pipeline" color={AMBER} badge={`${pipelineMembers.length} prospects`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pipelineMembers.map((member, i) => (
              <PipelineMemberCard key={member.name} member={member} index={i} />
            ))}
          </div>
        </SectionCard>
      </div>

      {/* === 4. REVENUE TRACKER === */}
      <div style={{ marginTop: 24 }}>
        <SectionCard delay={0.16}>
          <SectionHeader icon={DollarSign} label="Revenue Tracker" color={GOLD} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
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
            <span style={{ fontSize: 13, fontWeight: 600, color: SAGE, marginLeft: 'auto' }}>
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
            <div style={{ flex: 1, height: '100%' }} />
          </div>

          {/* Segment legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {revenueSegments.map((seg) => (
              <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: seg.color }} />
                <span style={{ fontSize: 12, color: '#a09888' }}>{seg.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#d8cfc4', fontFamily: 'monospace' }}>
                  {formatCurrency(seg.amount)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* === 5. MEMBER COMPOSITION WHEEL (Grid of 144 circles) === */}
      <div style={{ marginTop: 24 }}>
        <SectionCard delay={0.24}>
          <SectionHeader icon={Target} label="Member Composition" color={SAGE} badge={`${totalActive}/${totalTarget}`} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
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
                  transition: 'transform 0.2s, border-color 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.borderColor = `${mt.color}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = `${mt.color}25`;
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: mt.color }} />
                <span style={{ fontSize: 12, color: '#d8cfc4' }}>{mt.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: mt.color, fontFamily: 'monospace' }}>
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
                    border: filled ? `1.5px solid ${circleColor}80` : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: filled ? `0 0 4px ${circleColor}30` : 'none',
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
              <span style={{ fontSize: 13, color: '#a09888' }}>Total Active</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: AMBER, fontFamily: 'monospace' }}>
                {totalActive}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#6b6358' }}>Target</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f0ebe4', fontFamily: 'monospace' }}>
                {totalTarget}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* === BOTTOM ROW: At-Risk Members + Blue Spirit Tracker === */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginTop: 24,
        }}
      >
        {/* === 6. AT-RISK MEMBERS === */}
        <SectionCard delay={0.32}>
          <SectionHeader icon={AlertTriangle} label="At-Risk Members" color="#e06060" badge={`${atRiskMembers.length}`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {atRiskMembers.map((member, idx) => {
              const eng = engagementConfig[member.engagement];
              const renewalDate = new Date(member.renewalDate);
              const daysToRenewal = Math.ceil(
                (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              const urgent = daysToRenewal <= 14;

              return (
                <div
                  key={member.name}
                  className="animate-fade-in"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    backgroundColor: urgent ? 'rgba(224, 96, 96, 0.06)' : 'rgba(255,255,255,0.02)',
                    border: urgent ? '1px solid rgba(224, 96, 96, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.25s ease',
                    animationDelay: `${0.36 + idx * 0.04}s`,
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = urgent ? 'rgba(224, 96, 96, 0.1)' : 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = urgent ? 'rgba(224, 96, 96, 0.06)' : 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#d8cfc4', marginBottom: 3 }}>
                      {member.name}
                      {urgent && (
                        <AlertTriangle size={12} style={{ color: '#e06060', marginLeft: 6, verticalAlign: 'middle' }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#6b6358' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={10} />
                        Renews{' '}
                        {renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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

        {/* === 7. BLUE SPIRIT SELLOUT TRACKER === */}
        <SectionCard delay={0.38}>
          <SectionHeader icon={Ticket} label="Blue Spirit Sellout Tracker" color={AMBER} />

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
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.15)'; }}
            >
              <div style={{ fontSize: 11, color: '#6b6358', marginBottom: 6 }}>Tickets Sold</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: AMBER, fontFamily: 'monospace' }}>
                  {blueSpiritStats.ticketsSold}
                </span>
                <span style={{ fontSize: 13, color: '#6b6358' }}>/ {blueSpiritStats.ticketTarget}</span>
              </div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round((blueSpiritStats.ticketsSold / blueSpiritStats.ticketTarget) * 100)}%`,
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
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.15)'; }}
            >
              <div style={{ fontSize: 11, color: '#6b6358', marginBottom: 6 }}>Revenue</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: VIOLET, fontFamily: 'monospace' }}>
                  {formatCurrency(blueSpiritStats.revenue)}
                </span>
                <span style={{ fontSize: 13, color: '#6b6358' }}>/ {formatCurrency(blueSpiritStats.revenueBudget)}</span>
              </div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round((blueSpiritStats.revenue / blueSpiritStats.revenueBudget) * 100)}%`,
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
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(107, 143, 113, 0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(107, 143, 113, 0.15)'; }}
            >
              <div style={{ fontSize: 11, color: '#6b6358', marginBottom: 6 }}>Waitlist</div>
              <span style={{ fontSize: 24, fontWeight: 800, color: SAGE, fontFamily: 'monospace' }}>
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
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 135, 160, 0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 135, 160, 0.15)'; }}
            >
              <div style={{ fontSize: 11, color: '#6b6358', marginBottom: 6 }}>Days Until Event</div>
              <span style={{ fontSize: 24, fontWeight: 800, color: ROSE, fontFamily: 'monospace' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#a09888' }}>
              <Calendar size={13} style={{ color: AMBER }} />
              <span style={{ fontWeight: 600, color: '#d8cfc4' }}>Blue Spirit 6.0</span>
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
              {Math.round((blueSpiritStats.ticketsSold / blueSpiritStats.ticketTarget) * 100)}% sold
            </span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
