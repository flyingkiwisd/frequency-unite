'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Calendar,
  Clock,
  Ticket,
  Target,
  ChevronRight,
  ChevronDown,
  ArrowDown,
  Zap,
  Download,
  UserPlus,
  ArrowUpRight,
  Mail,
  Phone,
  Filter,
  SlidersHorizontal,
  Sparkles,
  Activity,
  Search,
  BarChart3,
  Inbox,
  Heart,
  Star,
  Shield,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { teamMembers, exportPdf } from '@/lib/data';

/* ================================================================
   Scoped Keyframes (enr- prefix)
   ================================================================ */
const scopedKeyframes = `
@keyframes enr-fadeSlideUp {
  0% { opacity: 0; transform: translateY(24px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes enr-fadeSlideRight {
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes enr-countUp {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes enr-pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(212, 165, 116, 0.08); }
  50% { box-shadow: 0 0 40px rgba(212, 165, 116, 0.2), 0 0 80px rgba(212, 165, 116, 0.05); }
}

@keyframes enr-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes enr-breathe {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}

@keyframes enr-progressFill {
  0% { width: 0%; }
}

@keyframes enr-ringDraw {
  0% { stroke-dashoffset: var(--enr-circumference); }
}

@keyframes enr-flowPulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.5; }
}

@keyframes enr-dotPing {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}

@keyframes enr-borderGlow {
  0% { border-color: rgba(212, 165, 116, 0.08); }
  50% { border-color: rgba(212, 165, 116, 0.25); }
  100% { border-color: rgba(212, 165, 116, 0.08); }
}

@keyframes enr-slideInStagger {
  0% { opacity: 0; transform: translateY(16px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes enr-funnelExpand {
  0% { transform: scaleX(0); transform-origin: left; opacity: 0; }
  100% { transform: scaleX(1); transform-origin: left; opacity: 1; }
}

@keyframes enr-conversionPop {
  0% { opacity: 0; transform: scale(0.5); }
  60% { transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes enr-glowLine {
  0% { opacity: 0.3; filter: blur(0px); }
  50% { opacity: 0.8; filter: blur(1px); }
  100% { opacity: 0.3; filter: blur(0px); }
}

@keyframes enr-timelineDot {
  0% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(212, 165, 116, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0); }
}

@keyframes enr-floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes enr-scaleIn {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
`;

/* ================================================================
   Color Palette
   ================================================================ */
const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const ROSE = '#e879a0';
const SKY = '#5eaed4';
const ORANGE = '#f59e0b';
const GOLD = '#e8b44c';
const CREAM = '#f0ebe4';
const MUTED = '#a09888';
const BG_DARK = '#0b0d14';
const SURFACE = '#131720';

/* ================================================================
   Pipeline Stages
   ================================================================ */
const pipelineStages = [
  { label: 'Awareness', count: 610, color: '#6b8f71', icon: Sparkles },
  { label: 'Prospect', count: 145, color: '#5eaed4', icon: Search },
  { label: 'Conversation', count: 68, color: '#8b5cf6', icon: Users },
  { label: 'Offer', count: 32, color: '#d4a574', icon: Mail },
  { label: 'Signed', count: 18, color: '#e8b44c', icon: CheckCircle },
  { label: 'Active', count: 65, color: '#e879a0', icon: Heart },
];

/* ================================================================
   Revenue Segments
   ================================================================ */
const revenueSegments = [
  { label: 'Memberships', amount: 780000, color: AMBER },
  { label: 'Events', amount: 285000, color: VIOLET },
  { label: 'Pledges', amount: 120000, color: SAGE },
  { label: 'Donors', amount: 85000, color: ROSE },
  { label: 'Grants', amount: 45000, color: SKY },
];
const revenueTarget = 2000000;
const revenueTotal = revenueSegments.reduce((s, r) => s + r.amount, 0);

/* ================================================================
   Member Composition
   ================================================================ */
const memberTypes = [
  { label: 'Coherence Members', count: 28, color: SAGE },
  { label: 'Investors', count: 15, color: GOLD },
  { label: 'Founders', count: 12, color: ROSE },
  { label: 'Network Stewards', count: 6, color: ORANGE },
  { label: 'Experts', count: 4, color: SKY },
];
const totalTarget = 144;
const totalActive = memberTypes.reduce((s, m) => s + m.count, 0);

/* ================================================================
   Pipeline Member Cards
   ================================================================ */
const pipelineMembers = [
  { name: 'Alicia Rivera', stage: 'Conversation', avatar: 'AR', daysInStage: 5, source: 'Cabo Referral', score: 88, color: VIOLET },
  { name: 'Marcus Chen', stage: 'Offer', avatar: 'MC', daysInStage: 3, source: 'Warm Intro', score: 92, color: AMBER },
  { name: 'Priya Sharma', stage: 'Prospect', avatar: 'PS', daysInStage: 12, source: 'Website', score: 74, color: SKY },
  { name: 'Daniel Reeves', stage: 'Conversation', avatar: 'DR', daysInStage: 8, source: 'Event Lead', score: 81, color: VIOLET },
  { name: 'Sophie Langford', stage: 'Offer', avatar: 'SL', daysInStage: 2, source: 'Board Referral', score: 95, color: AMBER },
  { name: 'Tobias Grant', stage: 'Signed', avatar: 'TG', daysInStage: 1, source: 'Blue Spirit 5.0', score: 90, color: GOLD },
];

/* ================================================================
   At-Risk Members
   ================================================================ */
const atRiskMembers = [
  { name: 'Daniel Reeves', renewalDate: '2026-03-28', engagement: 'low' as const, daysSinceTouch: 34 },
  { name: 'Sophie Langford', renewalDate: '2026-04-05', engagement: 'low' as const, daysSinceTouch: 21 },
  { name: 'Marcus Chen', renewalDate: '2026-04-12', engagement: 'medium' as const, daysSinceTouch: 18 },
  { name: 'Priya Sharma', renewalDate: '2026-03-22', engagement: 'low' as const, daysSinceTouch: 42 },
  { name: 'Tobias Grant', renewalDate: '2026-04-20', engagement: 'medium' as const, daysSinceTouch: 15 },
];

/* ================================================================
   Blue Spirit Event Data
   ================================================================ */
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

/* ================================================================
   Enrollment Timeline Events
   ================================================================ */
const enrollmentTimeline = [
  { date: 'Mar 8', event: 'Tobias Grant signed membership agreement', type: 'signed' as const, color: GOLD },
  { date: 'Mar 6', event: 'Sophie Langford received formal offer', type: 'offer' as const, color: AMBER },
  { date: 'Mar 5', event: 'Marcus Chen moved to Offer stage', type: 'offer' as const, color: AMBER },
  { date: 'Mar 3', event: 'Alicia Rivera entered Conversation stage', type: 'conversation' as const, color: VIOLET },
  { date: 'Mar 1', event: 'Daniel Reeves referred via Event Lead', type: 'prospect' as const, color: SKY },
  { date: 'Feb 27', event: 'Priya Sharma discovered via website funnel', type: 'awareness' as const, color: SAGE },
  { date: 'Feb 25', event: 'Blue Spirit 5.0 generated 4 warm leads', type: 'awareness' as const, color: SAGE },
];

/* ================================================================
   Helpers
   ================================================================ */
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

const GLASS_BG = 'rgba(19, 23, 32, 0.7)';
const GLASS_BORDER = 'rgba(212, 165, 116, 0.08)';
const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ================================================================
   Animated Counter Hook
   ================================================================ */
function useAnimatedCounter(target: number, duration = 2000, decimals = 0) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
}

/* ================================================================
   AnimatedNumber Component
   ================================================================ */
function AnimatedNumber({
  target,
  prefix = '',
  suffix = '',
  color = CREAM,
  size = 32,
  duration = 2000,
  decimals = 0,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  size?: number;
  duration?: number;
  decimals?: number;
}) {
  const displayVal = useAnimatedCounter(target, duration, decimals);

  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 800,
        color,
        fontFamily: 'var(--font-mono, monospace)',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        animation: 'enr-countUp 0.6s ease-out both',
      }}
    >
      {prefix}
      {typeof displayVal === 'number' ? displayVal.toLocaleString() : displayVal}
      {suffix}
    </span>
  );
}

/* ================================================================
   Progress Ring Component (Enhanced)
   ================================================================ */
function ProgressRing({
  current,
  target,
  size = 160,
  strokeWidth = 10,
  color = AMBER,
  glowIntensity = 0.6,
}: {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowIntensity?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(current / target, 1);
  const offset = circumference * (1 - pct);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="enr-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={VIOLET} />
          </linearGradient>
          <filter id="enr-ring-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor={color} floodOpacity={glowIntensity} />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        {/* Tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = size / 2 + (radius - strokeWidth / 2 - 2) * Math.cos(rad);
          const y1 = size / 2 + (radius - strokeWidth / 2 - 2) * Math.sin(rad);
          const x2 = size / 2 + (radius + strokeWidth / 2 + 2) * Math.cos(rad);
          const y2 = size / 2 + (radius + strokeWidth / 2 + 2) * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.5"
            />
          );
        })}
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#enr-ring-grad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#enr-ring-glow)"
          style={{
            '--enr-circumference': `${circumference}`,
            transition: `stroke-dashoffset 1.8s ${EASE_OUT_EXPO}`,
            animation: 'enr-ringDraw 1.8s ease-out both',
          } as React.CSSProperties}
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
        <AnimatedNumber target={current} color={CREAM} size={36} />
        <span style={{ fontSize: 13, color: '#8b7a6b', marginTop: 4 }}>
          / {target}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   Glassmorphism Section Card
   ================================================================ */
function SectionCard({
  children,
  delay = 0,
  accentColor,
}: {
  children: React.ReactNode;
  delay?: number;
  accentColor?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card-premium"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: GLASS_BG,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? (accentColor ? accentColor + '30' : 'rgba(212, 165, 116, 0.18)') : GLASS_BORDER}`,
        borderRadius: 16,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        animation: `enr-fadeSlideUp 0.6s ${EASE_OUT_EXPO} both`,
        animationDelay: `${delay}s`,
        transition: `border-color 0.4s ${EASE_OUT_EXPO}, box-shadow 0.4s ${EASE_OUT_EXPO}, transform 0.4s ${EASE_OUT_EXPO}`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)${accentColor ? `, 0 0 60px ${accentColor}10` : ''}`
          : '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Top edge glow line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: accentColor
            ? `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`
            : `linear-gradient(90deg, transparent, ${AMBER}40, ${VIOLET}30, transparent)`,
          opacity: hovered ? 1 : 0.3,
          transition: `opacity 0.4s ${EASE_OUT_EXPO}`,
        }}
      />
      <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
      {children}
    </div>
  );
}

/* ================================================================
   Section Header (Enhanced)
   ================================================================ */
function SectionHeader({
  icon: Icon,
  label,
  color,
  badge,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  badge?: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}15`,
            border: `1px solid ${color}20`,
            boxShadow: `0 0 12px ${color}10`,
          }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <h2
          className="text-glow"
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: CREAM,
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
              padding: '3px 10px',
              borderRadius: 20,
              color,
              backgroundColor: `${color}12`,
              border: `1px solid ${color}25`,
              marginLeft: 4,
              letterSpacing: '0.04em',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p style={{ fontSize: 12, color: MUTED, margin: '6px 0 0 44px', lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ================================================================
   Filter Pill Component
   ================================================================ */
function FilterPill({
  label,
  active,
  onClick,
  color = AMBER,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '6px 14px',
        borderRadius: 20,
        border: `1px solid ${active ? color + '50' : hovered ? color + '30' : 'rgba(255,255,255,0.08)'}`,
        backgroundColor: active ? `${color}18` : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        color: active ? color : hovered ? CREAM : MUTED,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        transition: `all 0.25s ${EASE_OUT_EXPO}`,
        fontFamily: 'inherit',
        letterSpacing: '0.02em',
        boxShadow: active ? `0 0 16px ${color}15, inset 0 0 12px ${color}08` : 'none',
        outline: 'none',
      }}
    >
      {label}
    </button>
  );
}

/* ================================================================
   Enhanced Funnel Visualization
   ================================================================ */
function FunnelVisualization() {
  const funnelMax = pipelineStages[0].count;

  return (
    <div style={{ position: 'relative' }}>
      {pipelineStages.map((stage, i) => {
        const barWidthPct = Math.max(12, (stage.count / funnelMax) * 100);
        const prevCount = i > 0 ? pipelineStages[i - 1].count : null;
        const conversion = prevCount !== null ? Math.round((stage.count / prevCount) * 100) : null;
        const StageIcon = stage.icon;

        return (
          <div key={stage.label} style={{ marginBottom: i < pipelineStages.length - 1 ? 0 : 0 }}>
            {/* Conversion percentage between stages */}
            {conversion !== null && i > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 0',
                  animation: `enr-conversionPop 0.5s ${EASE_OUT_EXPO} both`,
                  animationDelay: `${0.4 + i * 0.12}s`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '2px 10px',
                    borderRadius: 12,
                    backgroundColor: `${stage.color}0a`,
                    border: `1px dashed ${stage.color}25`,
                  }}
                >
                  <ArrowDown size={10} style={{ color: stage.color, opacity: 0.5 }} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: stage.color,
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {conversion}%
                  </span>
                </div>
              </div>
            )}

            {/* Stage row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '8px 0',
                animation: `enr-fadeSlideRight 0.5s ${EASE_OUT_EXPO} both`,
                animationDelay: `${0.2 + i * 0.1}s`,
              }}
            >
              {/* Stage icon and label */}
              <div style={{ width: 110, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${stage.color}15`,
                    border: `1px solid ${stage.color}20`,
                  }}
                >
                  <StageIcon size={13} style={{ color: stage.color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#d8cfc4', whiteSpace: 'nowrap' }}>
                  {stage.label}
                </span>
              </div>

              {/* Gradient-filled bar */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div
                  style={{
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${barWidthPct}%`,
                      background: `linear-gradient(90deg, ${stage.color}50, ${stage.color}18)`,
                      borderRadius: 7,
                      position: 'relative',
                      animation: `enr-progressFill 1.2s ${EASE_OUT_EXPO} both`,
                      animationDelay: `${0.3 + i * 0.1}s`,
                    }}
                  >
                    {/* Shimmer overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(90deg, transparent, ${stage.color}20, transparent)`,
                        backgroundSize: '200% 100%',
                        animation: 'enr-shimmer 3s ease-in-out infinite',
                        animationDelay: `${i * 0.5}s`,
                        borderRadius: 7,
                      }}
                    />
                    {/* Top glow line */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 4,
                        right: 4,
                        height: 1,
                        background: `linear-gradient(90deg, transparent, ${stage.color}80, transparent)`,
                        animation: 'enr-glowLine 2s ease-in-out infinite',
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Count */}
              <div style={{ width: 70, textAlign: 'right', flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: stage.color,
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stage.count.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   Pipeline Member Card (Enhanced Glassmorphism)
   ================================================================ */
function PipelineMemberCard({
  member,
  index,
}: {
  member: typeof pipelineMembers[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const scoreColor = member.score >= 85 ? SAGE : member.score >= 70 ? GOLD : '#e06060';
  const scorePct = member.score / 100;

  return (
    <div
      className="card-interactive"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px 18px',
        borderRadius: 14,
        background: hovered ? 'rgba(19, 23, 32, 0.85)' : GLASS_BG,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? member.color + '35' : GLASS_BORDER}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: `all 0.35s ${EASE_OUT_EXPO}`,
        animation: `enr-slideInStagger 0.5s ${EASE_OUT_EXPO} both`,
        animationDelay: `${0.3 + index * 0.06}s`,
        transform: hovered ? 'translateY(-2px) scale(1.005)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.3), 0 0 24px ${member.color}10`
          : '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hover shimmer */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${member.color}50, transparent)`,
            animation: 'enr-glowLine 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Avatar with ring progress */}
      <div style={{ position: 'relative', width: 42, height: 42, flexShrink: 0 }}>
        <svg width={42} height={42} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={21} cy={21} r={19} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
          <circle
            cx={21} cy={21} r={19} fill="none"
            stroke={member.color}
            strokeWidth={2}
            strokeDasharray={2 * Math.PI * 19}
            strokeDashoffset={2 * Math.PI * 19 * (1 - scorePct)}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${member.color}50)` }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: 3,
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#0b0d14',
            background: `linear-gradient(135deg, ${member.color}, ${member.color}88)`,
          }}
        >
          {member.avatar}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 650, color: CREAM }}>{member.name}</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 20,
              color: member.color,
              backgroundColor: `${member.color}12`,
              border: `1px solid ${member.color}20`,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {member.stage}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#6b6358' }}>
          <span>{member.source}</span>
          <span style={{ color: '#2e3a4e' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={9} />
            {member.daysInStage}d in stage
          </span>
        </div>
        {/* Mini progress bar */}
        <div
          style={{
            marginTop: 6,
            height: 2,
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${member.score}%`,
              background: `linear-gradient(90deg, ${member.color}60, ${scoreColor}80)`,
              borderRadius: 1,
              transition: `width 0.8s ${EASE_OUT_EXPO}`,
            }}
          />
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: scoreColor,
            fontFamily: 'var(--font-mono, monospace)',
            lineHeight: 1,
            textShadow: hovered ? `0 0 12px ${scoreColor}40` : 'none',
            transition: 'text-shadow 0.3s',
          }}
        >
          {member.score}
        </div>
        <div style={{ fontSize: 8, color: '#6b6358', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
          Fit Score
        </div>
      </div>

      {/* Action indicator */}
      <ChevronRight
        size={14}
        style={{
          color: hovered ? member.color : '#2e3a4e',
          transition: `color 0.25s ${EASE_OUT_EXPO}, transform 0.25s ${EASE_OUT_EXPO}`,
          transform: hovered ? 'translateX(3px)' : 'none',
          flexShrink: 0,
        }}
      />
    </div>
  );
}

/* ================================================================
   Stats Header Card
   ================================================================ */
function StatsHeaderCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
  index,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  const trendColor = trend === 'up' ? SAGE : trend === 'down' ? '#e06060' : GOLD;
  const isPercentage = label.includes('Conv');
  const isCurrency = label.includes('Revenue');

  return (
    <div
      className="card-stat"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '18px 18px 16px',
        borderRadius: 14,
        background: GLASS_BG,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? color + '35' : GLASS_BORDER}`,
        position: 'relative',
        overflow: 'hidden',
        animation: `enr-fadeSlideUp 0.5s ${EASE_OUT_EXPO} both`,
        animationDelay: `${0.08 + index * 0.06}s`,
        transition: `all 0.35s ${EASE_OUT_EXPO}`,
        transform: hovered ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.35), 0 0 30px ${color}10`
          : '0 4px 16px rgba(0,0,0,0.2)',
        cursor: 'default',
      }}
    >
      {/* Top glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
          opacity: hovered ? 1 : 0.2,
          transition: `opacity 0.4s ${EASE_OUT_EXPO}`,
        }}
      />

      {/* Icon + Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}12`,
            border: `1px solid ${color}18`,
          }}
        >
          <Icon size={12} style={{ color }} />
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: MUTED,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </span>
      </div>

      {/* Animated large number */}
      <AnimatedNumber
        target={value}
        color={color}
        size={28}
        prefix={isCurrency ? '$' : ''}
        suffix={isPercentage ? '%' : isCurrency ? 'K' : ''}
      />

      {/* Trend badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 8,
          padding: '3px 8px',
          borderRadius: 8,
          backgroundColor: `${trendColor}10`,
          border: `1px solid ${trendColor}15`,
          width: 'fit-content',
        }}
      >
        <TrendIcon size={10} style={{ color: trendColor }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: trendColor }}>
          {trendValue}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   Timeline Component
   ================================================================ */
function EnrollmentTimeline() {
  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      {/* Vertical connector line */}
      <div
        style={{
          position: 'absolute',
          left: 7,
          top: 8,
          bottom: 8,
          width: 2,
          background: `linear-gradient(to bottom, ${AMBER}40, ${VIOLET}20, ${SAGE}15)`,
          borderRadius: 1,
        }}
      />

      {enrollmentTimeline.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '10px 0',
            position: 'relative',
            animation: `enr-fadeSlideRight 0.4s ${EASE_OUT_EXPO} both`,
            animationDelay: `${0.5 + i * 0.08}s`,
          }}
        >
          {/* Status dot */}
          <div style={{ position: 'absolute', left: -20, top: 14 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: item.color,
                border: `2px solid ${SURFACE}`,
                boxShadow: `0 0 8px ${item.color}50`,
                animation: i === 0 ? 'enr-timelineDot 2s ease-in-out infinite' : 'none',
              }}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.date}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  padding: '1px 7px',
                  borderRadius: 10,
                  color: item.color,
                  backgroundColor: `${item.color}10`,
                  border: `1px solid ${item.color}18`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {item.type}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#d8cfc4', margin: 0, lineHeight: 1.5 }}>
              {item.event}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   Empty State Component
   ================================================================ */
function EmptyState({
  icon: Icon,
  title,
  description,
  color = MUTED,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${color}10`,
          border: `1px solid ${color}18`,
          marginBottom: 16,
          animation: 'enr-floatY 3s ease-in-out infinite',
        }}
      >
        <Icon size={24} style={{ color, opacity: 0.6 }} />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: CREAM, margin: '0 0 6px' }}>
        {title}
      </h3>
      <p style={{ fontSize: 12, color: MUTED, margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  );
}

/* ===================================================================
   Main Component
   =================================================================== */
export function EnrollmentView() {
  const funnelMax = pipelineStages[0].count;
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score');

  const filteredMembers = pipelineMembers.filter((m) => {
    if (activeFilter === 'All') return true;
    return m.stage === activeFilter;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'days') return b.daysInStage - a.daysInStage;
    return a.name.localeCompare(b.name);
  });

  const pipelineTotal = pipelineStages.reduce((s, st) => s + st.count, 0);
  const fullFunnelConv = Math.round((pipelineStages[pipelineStages.length - 1].count / pipelineStages[0].count) * 100);

  return (
    <>
      {/* Inject scoped keyframes */}
      <style dangerouslySetInnerHTML={{ __html: scopedKeyframes }} />

      <div ref={containerRef} style={{ padding: '32px 40px', maxWidth: 1080, margin: '0 auto' }}>
        {/* ================================================================
           1. HEADER
           ================================================================ */}
        <div
          style={{
            marginBottom: 32,
            animation: `enr-fadeSlideUp 0.6s ${EASE_OUT_EXPO} both`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
          <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${AMBER}20, ${VIOLET}10)`,
                    border: `1px solid ${AMBER}20`,
                    boxShadow: `0 0 20px ${AMBER}10`,
                  }}
                >
                  <Users size={22} style={{ color: AMBER }} />
                </div>
                <div>
                  <h1
                    className="text-glow"
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: CREAM,
                      margin: 0,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                  >
                    Enrollment Pipeline
                  </h1>
                  <p style={{ fontSize: 13, color: MUTED, margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Building the 144 &mdash; tracking every step from awareness to active stewardship.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Export button */}
              <button
                onClick={() => {
                  if (containerRef.current) exportPdf(containerRef.current, 'Enrollment');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  borderRadius: 10,
                  border: `1px solid ${GLASS_BORDER}`,
                  background: GLASS_BG,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: MUTED,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: `all 0.25s ${EASE_OUT_EXPO}`,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${AMBER}30`;
                  e.currentTarget.style.color = CREAM;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = GLASS_BORDER;
                  e.currentTarget.style.color = MUTED;
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Download size={14} />
                Export PDF
              </button>

              {/* Progress Ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ProgressRing current={totalActive} target={totalTarget} size={120} strokeWidth={8} color={AMBER} />
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: AMBER,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 6,
                    }}
                  >
                    Stewards
                  </div>
                  <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
                    <span style={{ color: CREAM, fontWeight: 600 }}>{totalActive}</span> active
                    <br />
                    <span style={{ color: CREAM, fontWeight: 600 }}>{totalTarget - totalActive}</span> remaining
                    <br />
                    <span style={{ color: SAGE, fontWeight: 600 }}>{Math.round((totalActive / totalTarget) * 100)}%</span> complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
           2. STATS HEADER BAR (Animated Numbers + Trends)
           ================================================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <StatsHeaderCard
            label="Pipeline Total"
            value={pipelineTotal}
            icon={UserPlus}
            color={AMBER}
            trend="up"
            trendValue="+12% this month"
            index={0}
          />
          <StatsHeaderCard
            label="Full Funnel Conv."
            value={fullFunnelConv}
            icon={TrendingUp}
            color={VIOLET}
            trend="up"
            trendValue="+2.3% vs last"
            index={1}
          />
          <StatsHeaderCard
            label="Active Conversations"
            value={pipelineStages[2].count}
            icon={Users}
            color={SKY}
            trend="stable"
            trendValue="Steady flow"
            index={2}
          />
          <StatsHeaderCard
            label="Revenue YTD"
            value={Math.round(revenueTotal / 1000)}
            icon={DollarSign}
            color={GOLD}
            trend="up"
            trendValue="+18% YoY"
            index={3}
          />
        </div>

        {/* ================================================================
           3. PIPELINE FUNNEL (Enhanced)
           ================================================================ */}
        <SectionCard delay={0.16} accentColor={VIOLET}>
          <SectionHeader
            icon={BarChart3}
            label="Pipeline Funnel"
            color={VIOLET}
            badge={`${pipelineStages.length} stages`}
            subtitle="Conversion rates between each stage of the enrollment journey"
          />
          <FunnelVisualization />

          {/* Overall conversion summary */}
          <div
            style={{
              marginTop: 20,
              padding: '14px 20px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              justifyContent: 'center',
              gap: 40,
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Full Funnel Conversion', value: `${fullFunnelConv}%`, color: AMBER },
              { label: 'Active Conversations', value: `${pipelineStages[2].count}`, color: VIOLET },
              { label: 'Signed This Period', value: `${pipelineStages[4].count}`, color: SAGE },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: item.color,
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {item.value}
                </div>
                <div style={{ fontSize: 11, color: '#6b6358', marginTop: 3 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ================================================================
           4. PIPELINE MEMBER CARDS (with Filters)
           ================================================================ */}
        <div style={{ marginTop: 24 }}>
          <SectionCard delay={0.22} accentColor={AMBER}>
            <SectionHeader
              icon={UserPlus}
              label="Active Pipeline"
              color={AMBER}
              badge={`${sortedMembers.length} prospects`}
              subtitle="Prospective members currently moving through the enrollment funnel"
            />

            {/* Filter + Sort Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 16,
              }}
            >
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <Filter size={13} style={{ color: MUTED, marginRight: 4 }} />
                {['All', 'Prospect', 'Conversation', 'Offer', 'Signed'].map((stage) => (
                  <FilterPill
                    key={stage}
                    label={stage}
                    active={activeFilter === stage}
                    onClick={() => setActiveFilter(stage)}
                    color={
                      stage === 'All'
                        ? AMBER
                        : pipelineStages.find((s) => s.label === stage)?.color || AMBER
                    }
                  />
                ))}
              </div>

              {/* Sort controls */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <SlidersHorizontal size={13} style={{ color: MUTED, marginRight: 4 }} />
                {[
                  { key: 'score', label: 'Score' },
                  { key: 'days', label: 'Days' },
                  { key: 'name', label: 'Name' },
                ].map((sort) => (
                  <FilterPill
                    key={sort.key}
                    label={sort.key === sortBy ? `${sort.label} ↓` : sort.label}
                    active={sortBy === sort.key}
                    onClick={() => setSortBy(sort.key)}
                    color={VIOLET}
                  />
                ))}
              </div>
            </div>

            {/* Member Cards */}
            {sortedMembers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedMembers.map((member, i) => (
                  <PipelineMemberCard key={member.name} member={member} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                title="No prospects in this stage"
                description="Adjust filters to see pipeline members in other enrollment stages."
                color={AMBER}
              />
            )}

            {/* Avatar stack summary */}
            {sortedMembers.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 16px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* Stacked avatars */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {sortedMembers.slice(0, 5).map((m, i) => (
                    <div
                      key={m.name}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#0b0d14',
                        background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`,
                        border: `2px solid ${SURFACE}`,
                        marginLeft: i === 0 ? 0 : -8,
                        zIndex: 5 - i,
                        position: 'relative',
                      }}
                    >
                      {m.avatar}
                    </div>
                  ))}
                  {sortedMembers.length > 5 && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                        color: MUTED,
                        backgroundColor: '#1c2230',
                        border: `2px solid ${SURFACE}`,
                        marginLeft: -8,
                      }}
                    >
                      +{sortedMembers.length - 5}
                    </div>
                  )}
                  <span style={{ fontSize: 12, color: MUTED, marginLeft: 10 }}>
                    {sortedMembers.length} active prospect{sortedMembers.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Average score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={12} style={{ color: GOLD }} />
                  <span style={{ fontSize: 12, color: MUTED }}>Avg score:</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: GOLD,
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {Math.round(sortedMembers.reduce((s, m) => s + m.score, 0) / sortedMembers.length)}
                  </span>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ================================================================
           5. REVENUE TRACKER
           ================================================================ */}
        <div style={{ marginTop: 24 }}>
          <SectionCard delay={0.28} accentColor={GOLD}>
            <SectionHeader icon={DollarSign} label="Revenue Tracker" color={GOLD} subtitle="Year-to-date revenue against annual target across all segments" />

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
              <AnimatedNumber target={revenueTotal} prefix="$" color={CREAM} size={30} />
              <span style={{ fontSize: 14, color: '#6b6358' }}>
                of {formatCurrency(revenueTarget)} target
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: SAGE,
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <TrendingUp size={14} />
                {Math.round((revenueTotal / revenueTarget) * 100)}%
              </span>
            </div>

            {/* Stacked horizontal bar */}
            <div
              className="progress-bar-animated"
              style={{
                height: 40,
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: 18,
                position: 'relative',
              }}
            >
              {revenueSegments.map((seg, i) => {
                const segPct = (seg.amount / revenueTarget) * 100;
                return (
                  <div
                    key={seg.label}
                    style={{
                      width: `${segPct}%`,
                      height: '100%',
                      background: `linear-gradient(135deg, ${seg.color}65, ${seg.color}35)`,
                      borderRight: '1px solid rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: `enr-progressFill 1s ${EASE_OUT_EXPO} both`,
                      animationDelay: `${0.4 + i * 0.1}s`,
                    }}
                    title={`${seg.label}: ${formatCurrency(seg.amount)}`}
                  >
                    {/* Shimmer overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(90deg, transparent 30%, ${seg.color}25 50%, transparent 70%)`,
                        backgroundSize: '200% 100%',
                        animation: 'enr-shimmer 4s ease-in-out infinite',
                        animationDelay: `${i * 0.6}s`,
                      }}
                    />
                    {segPct > 6 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: CREAM,
                          textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                          whiteSpace: 'nowrap',
                          position: 'relative',
                          zIndex: 1,
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
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      backgroundColor: seg.color,
                      boxShadow: `0 0 6px ${seg.color}40`,
                    }}
                  />
                  <span style={{ fontSize: 12, color: MUTED }}>{seg.label}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#d8cfc4',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {formatCurrency(seg.amount)}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ================================================================
           6. MEMBER COMPOSITION (Grid of 144 circles)
           ================================================================ */}
        <div style={{ marginTop: 24 }}>
          <SectionCard delay={0.34} accentColor={SAGE}>
            <SectionHeader
              icon={Target}
              label="Member Composition"
              color={SAGE}
              badge={`${totalActive}/${totalTarget}`}
              subtitle="Visual map of all 144 steward seats showing fill status by member type"
            />

            {/* Member type pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {memberTypes.map((mt, i) => (
                <div
                  key={mt.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 14px',
                    borderRadius: 10,
                    background: GLASS_BG,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${mt.color}20`,
                    transition: `all 0.3s ${EASE_OUT_EXPO}`,
                    cursor: 'default',
                    animation: `enr-scaleIn 0.4s ${EASE_OUT_EXPO} both`,
                    animationDelay: `${0.5 + i * 0.06}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.borderColor = `${mt.color}45`;
                    e.currentTarget.style.boxShadow = `0 4px 16px ${mt.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = `${mt.color}20`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: mt.color,
                      boxShadow: `0 0 6px ${mt.color}50`,
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#d8cfc4' }}>{mt.label}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: mt.color,
                      fontFamily: 'var(--font-mono, monospace)',
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
                      backgroundColor: filled ? `${circleColor}50` : 'rgba(255,255,255,0.03)',
                      border: filled ? `1.5px solid ${circleColor}70` : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: filled ? `0 0 6px ${circleColor}25` : 'none',
                      transition: `all 0.4s ${EASE_OUT_EXPO}`,
                      animation: filled ? `enr-scaleIn 0.3s ${EASE_OUT_EXPO} both` : 'none',
                      animationDelay: filled ? `${0.6 + i * 0.008}s` : '0s',
                    }}
                  />
                );
              })}
            </div>

            {/* Totals bar */}
            <div
              style={{
                marginTop: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: GLASS_BG,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 10,
                border: `1px solid ${GLASS_BORDER}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={14} style={{ color: AMBER }} />
                <span style={{ fontSize: 13, color: MUTED }}>Total Active</span>
                <AnimatedNumber target={totalActive} color={AMBER} size={20} />
              </div>
              <div
                className="progress-bar-animated"
                style={{
                  height: 4,
                  flex: 1,
                  margin: '0 20px',
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(totalActive / totalTarget) * 100}%`,
                    background: `linear-gradient(90deg, ${AMBER}, ${SAGE})`,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${AMBER}30`,
                    animation: `enr-progressFill 1.5s ${EASE_OUT_EXPO} both`,
                    animationDelay: '0.8s',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#6b6358' }}>Target</span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: CREAM,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {totalTarget}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ================================================================
           7. ENROLLMENT TIMELINE
           ================================================================ */}
        <div style={{ marginTop: 24 }}>
          <SectionCard delay={0.40} accentColor={VIOLET}>
            <SectionHeader
              icon={Activity}
              label="Enrollment Timeline"
              color={VIOLET}
              badge="Recent"
              subtitle="Latest enrollment activity and pipeline movements"
            />
            <EnrollmentTimeline />
          </SectionCard>
        </div>

        {/* ================================================================
           BOTTOM ROW: At-Risk Members + Blue Spirit Tracker
           ================================================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            marginTop: 24,
          }}
        >
          {/* ================================================================
             8. AT-RISK MEMBERS
             ================================================================ */}
          <SectionCard delay={0.46} accentColor="#e06060">
            <SectionHeader
              icon={AlertTriangle}
              label="At-Risk Members"
              color="#e06060"
              badge={`${atRiskMembers.length}`}
              subtitle="Members approaching renewal with low engagement signals"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {atRiskMembers.map((member, idx) => {
                const eng = engagementConfig[member.engagement];
                const renewalDate = new Date(member.renewalDate);
                const daysToRenewal = Math.ceil(
                  (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );
                const urgent = daysToRenewal <= 14;
                const urgency = daysToRenewal <= 7 ? 1 : daysToRenewal <= 14 ? 0.6 : 0.3;

                return (
                  <div
                    className="card-interactive"
                    key={member.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: urgent ? 'rgba(224, 96, 96, 0.06)' : GLASS_BG,
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: urgent
                        ? '1px solid rgba(224, 96, 96, 0.2)'
                        : `1px solid ${GLASS_BORDER}`,
                      transition: `all 0.3s ${EASE_OUT_EXPO}`,
                      animation: `enr-slideInStagger 0.4s ${EASE_OUT_EXPO} both`,
                      animationDelay: `${0.5 + idx * 0.06}s`,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = urgent
                        ? 'rgba(224, 96, 96, 0.1)'
                        : 'rgba(19, 23, 32, 0.85)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.borderColor = urgent
                        ? 'rgba(224, 96, 96, 0.35)'
                        : 'rgba(212, 165, 116, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = urgent
                        ? 'rgba(224, 96, 96, 0.06)'
                        : GLASS_BG;
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = urgent
                        ? 'rgba(224, 96, 96, 0.2)'
                        : GLASS_BORDER;
                    }}
                  >
                    {/* Urgency bar on left */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: `linear-gradient(to bottom, ${eng.color}${urgent ? 'aa' : '50'}, transparent)`,
                        borderRadius: '3px 0 0 3px',
                      }}
                    />

                    <div style={{ paddingLeft: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 650, color: '#d8cfc4' }}>
                          {member.name}
                        </span>
                        {urgent && (
                          <AlertTriangle
                            size={12}
                            style={{
                              color: '#e06060',
                              animation: 'enr-breathe 2s ease-in-out infinite',
                            }}
                          />
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
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 20,
                        color: eng.color,
                        backgroundColor: eng.bg,
                        border: `1px solid ${eng.color}25`,
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

          {/* ================================================================
             9. BLUE SPIRIT SELLOUT TRACKER
             ================================================================ */}
          <SectionCard delay={0.50} accentColor={AMBER}>
            <SectionHeader
              icon={Ticket}
              label="Blue Spirit Sellout Tracker"
              color={AMBER}
              subtitle="Live ticket and revenue tracking for the flagship retreat"
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 16,
              }}
            >
              {/* Tickets */}
              {[
                {
                  label: 'Tickets Sold',
                  value: blueSpiritStats.ticketsSold,
                  target: blueSpiritStats.ticketTarget,
                  color: AMBER,
                  showBar: true,
                },
                {
                  label: 'Revenue',
                  value: blueSpiritStats.revenue,
                  target: blueSpiritStats.revenueBudget,
                  color: VIOLET,
                  showBar: true,
                  isCurrency: true,
                },
                {
                  label: 'Waitlist',
                  value: blueSpiritStats.waitlist,
                  target: null,
                  color: SAGE,
                  showBar: false,
                },
                {
                  label: 'Days Until Event',
                  value: blueSpiritStats.daysUntil,
                  target: null,
                  color: ROSE,
                  showBar: false,
                },
              ].map((stat, i) => {
                const pct = stat.target ? Math.round((stat.value / stat.target) * 100) : null;
                return (
                  <div
                    className="card-stat"
                    key={stat.label}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: GLASS_BG,
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: `1px solid ${stat.color}18`,
                      transition: `all 0.3s ${EASE_OUT_EXPO}`,
                      animation: `enr-fadeSlideUp 0.4s ${EASE_OUT_EXPO} both`,
                      animationDelay: `${0.6 + i * 0.08}s`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${stat.color}40`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 4px 20px ${stat.color}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${stat.color}18`;
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#6b6358', marginBottom: 6 }}>{stat.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <AnimatedNumber
                        target={stat.isCurrency ? Math.round(stat.value / 1000) : stat.value}
                        prefix={stat.isCurrency ? '$' : ''}
                        suffix={stat.isCurrency ? 'K' : ''}
                        color={stat.color}
                        size={24}
                      />
                      {stat.target && (
                        <span style={{ fontSize: 13, color: '#6b6358' }}>
                          / {stat.isCurrency ? formatCurrency(stat.target) : stat.target}
                        </span>
                      )}
                    </div>
                    {stat.showBar && pct !== null && (
                      <div
                        className="progress-bar-animated"
                        style={{
                          marginTop: 8,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${stat.color}80, ${stat.color}50)`,
                            borderRadius: 2,
                            boxShadow: `0 0 8px ${stat.color}30`,
                            animation: `enr-progressFill 1.2s ${EASE_OUT_EXPO} both`,
                            animationDelay: `${0.8 + i * 0.1}s`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Event info footer */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: GLASS_BG,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${GLASS_BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: MUTED }}>
                <Calendar size={13} style={{ color: AMBER }} />
                <span style={{ fontWeight: 650, color: '#d8cfc4' }}>Blue Spirit 6.0</span>
                <span style={{ color: '#2e3a4e' }}>|</span>
                <span>July 18, 2026</span>
                <span style={{ color: '#2e3a4e' }}>|</span>
                <span>Nosara, Costa Rica</span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: AMBER,
                  padding: '4px 12px',
                  borderRadius: 20,
                  backgroundColor: `${AMBER}12`,
                  border: `1px solid ${AMBER}25`,
                  boxShadow: `0 0 12px ${AMBER}10`,
                }}
              >
                {Math.round((blueSpiritStats.ticketsSold / blueSpiritStats.ticketTarget) * 100)}% sold
              </span>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
