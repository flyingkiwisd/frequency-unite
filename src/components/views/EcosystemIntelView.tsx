'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Globe,
  Handshake,
  Rocket,
  DollarSign,
  UserCog,
  ArrowRightLeft,
  Filter,
  ExternalLink,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Building2,
  Leaf,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Link2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Shield,
  Radio,
  Target,
  Sparkles,
  Clock,
  Eye,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ─── Scoped Keyframes ─── */

const eiKeyframes = `
@keyframes ei-fadeSlideUp {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ei-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes ei-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@keyframes ei-pulseRing {
  0%   { transform: scale(0.85); opacity: 0.6; }
  50%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.85); opacity: 0.6; }
}
@keyframes ei-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(212,165,116,0.15); }
  50%      { box-shadow: 0 0 20px rgba(212,165,116,0.3); }
}
@keyframes ei-scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
@keyframes ei-nodeFloat {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(1px, -1.5px); }
  50%      { transform: translate(-0.5px, 1px); }
  75%      { transform: translate(1.5px, 0.5px); }
}
@keyframes ei-signalPulse {
  0%   { r: 3; opacity: 0.8; }
  50%  { r: 5; opacity: 0.3; }
  100% { r: 3; opacity: 0.8; }
}
@keyframes ei-drawLine {
  from { stroke-dashoffset: 100; }
  to   { stroke-dashoffset: 0; }
}
@keyframes ei-barFill {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes ei-confidenceSpin {
  from { stroke-dashoffset: 251.2; }
  to   { stroke-dashoffset: var(--ei-target-offset); }
}
@keyframes ei-cardReveal {
  from { opacity: 0; transform: translateY(12px) scale(0.97); clip-path: inset(0 0 100% 0); }
  to   { opacity: 1; transform: translateY(0) scale(1); clip-path: inset(0 0 0% 0); }
}
`;

/* ─── Types ─── */

type SignalCategory =
  | 'Partnership Opportunity'
  | 'Program Launch'
  | 'Funding Round'
  | 'Leadership Change'
  | 'Strategic Shift';

type SignalSource = 'market' | 'competitor' | 'regulation' | 'technology' | 'community';
type ImpactLevel = 'Low' | 'Medium' | 'High';
type TrendDirection = 'up' | 'down' | 'stable';

interface EcosystemOrg {
  id: string;
  name: string;
  focus: string;
  alignment: string;
  icon: React.ElementType;
  color: string;
  trend: TrendDirection;
  relevanceScore: number;
}

interface RelatedEntity {
  name: string;
  role: string;
  color: string;
}

interface IntelSignal {
  id: string;
  orgId: string;
  date: string;
  category: SignalCategory;
  title: string;
  summary: string;
  impact: ImpactLevel;
  frequencyImplication: string;
  source: string;
  relatedEntities: RelatedEntity[];
}

/* ─── Easing constant ─── */
const EI_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ─── Animated Entry ─── */

function AnimatedEntry({ children, delay = 0, style }: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.98)',
        transition: `opacity 0.55s ${EI_EASE}, transform 0.55s ${EI_EASE}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── SVG Mini Sparkline Chart (Enhanced) ─── */

function MiniSparkline({ data, color, width = 60, height = 24 }: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;
  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * effectiveWidth;
    const y = padding + effectiveHeight - ((v - min) / range) * effectiveHeight;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = points + ` ${padding + effectiveWidth},${padding + effectiveHeight} ${padding},${padding + effectiveHeight}`;
  const uid = `eiSpark-${color.replace('#', '')}-${width}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon points={areaPoints} fill={`url(#${uid}-grad)`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${uid}-glow)`}
      />
      {data.length > 0 && (() => {
        const lastX = padding + effectiveWidth;
        const lastY = padding + effectiveHeight - ((data[data.length - 1] - min) / range) * effectiveHeight;
        return (
          <>
            <circle cx={lastX} cy={lastY} r="3" fill={color} opacity="0.3">
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={lastX} cy={lastY} r="2" fill={color} />
          </>
        );
      })()}
    </svg>
  );
}

/* ─── AI Confidence Ring ─── */

function ConfidenceRing({ score, color, size = 36 }: {
  score: number;
  color: string;
  size?: number;
}) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;
  const uid = `eiConf-${score}-${color.replace('#', '')}`;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(30,38,56,0.5)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={`url(#${uid}-grad)`}
          strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={targetOffset}
          style={{
            transition: `stroke-dashoffset 1.2s ${EI_EASE}`,
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {score}
      </div>
    </div>
  );
}

/* ─── Signal Strength Bars ─── */

function SignalStrengthBars({ strength, color }: { strength: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
      {[1, 2, 3, 4, 5].map((level) => {
        const active = level <= strength;
        return (
          <div
            key={level}
            style={{
              width: 3,
              height: 4 + level * 2.4,
              borderRadius: 1.5,
              backgroundColor: active ? color : 'rgba(30,38,56,0.6)',
              opacity: active ? 0.9 : 0.3,
              transition: `all 0.3s ${EI_EASE}`,
              boxShadow: active ? `0 0 4px ${color}40` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── SVG Ecosystem Metrics Donut (Enhanced) ─── */

function MetricsDonut({ segments, size = 80 }: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const uid = 'eiDonut';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        {segments.map((seg) => (
          <filter key={`${uid}-glow-${seg.label}`} id={`${uid}-glow-${seg.label.replace(/\s/g, '')}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>
      {/* Background ring */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(30,38,56,0.4)"
        strokeWidth="6"
      />
      {segments.map((seg) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const currentOffset = offset;
        offset += dash;
        return (
          <circle
            key={seg.label}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity={0.85}
            filter={`url(#${uid}-glow-${seg.label.replace(/\s/g, '')})`}
          >
            <title>{`${seg.label}: ${seg.value}`}</title>
          </circle>
        );
      })}
      <text x={size / 2} y={size / 2 - 1} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 14, fill: '#f0ebe4', fontWeight: 700, letterSpacing: '-0.02em' }}>
        {total}
      </text>
      <text x={size / 2} y={size / 2 + 12} textAnchor="middle"
        style={{ fontSize: 7, fill: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        signals
      </text>
    </svg>
  );
}

/* ─── Trend Arrow Component ─── */

function TrendArrow({ direction, color }: { direction: TrendDirection; color: string }) {
  if (direction === 'up') {
    return <ArrowUpRight size={12} style={{ color }} />;
  }
  if (direction === 'down') {
    return <ArrowDownRight size={12} style={{ color: '#e06060' }} />;
  }
  return <Minus size={12} style={{ color: '#6b6358' }} />;
}

/* ─── Priority Indicator (Enhanced with glow) ─── */

function PriorityIndicator({ impact }: { impact: ImpactLevel }) {
  const levels = impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1;
  const color = impact === 'High' ? '#e06060' : impact === 'Medium' ? '#e8b44c' : '#a09888';

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: 4 + i * 3,
            borderRadius: 1.5,
            backgroundColor: i <= levels ? color : 'rgba(30,38,56,0.5)',
            transition: `background-color 0.3s ${EI_EASE}`,
            boxShadow: i <= levels ? `0 0 4px ${color}40` : 'none',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Source Badge Component ─── */

function SourceBadge({ source }: { source: string }) {
  const sourceMap: Record<string, { label: SignalSource; color: string; icon: React.ElementType }> = {
    'regenesisgroup.com': { label: 'community', color: '#6b8f71', icon: Leaf },
    'bfi.org': { label: 'technology', color: '#8b5cf6', icon: Sparkles },
    'presencing.org': { label: 'community', color: '#60a5fa', icon: BookOpen },
    'bcorporation.net': { label: 'regulation', color: '#d4a574', icon: Shield },
    'onepercentfortheplanet.org': { label: 'market', color: '#34d399', icon: Globe },
    'consciouscapitalism.org': { label: 'market', color: '#fb923c', icon: TrendingUp },
  };

  const cfg = sourceMap[source] || { label: 'market' as SignalSource, color: '#a09888', icon: Globe };
  const Icon = cfg.icon;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 12,
      background: `${cfg.color}10`,
      border: `1px solid ${cfg.color}20`,
      color: cfg.color,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

/* ─── Freshness Indicator ─── */

function FreshnessIndicator({ date }: { date: string }) {
  const now = new Date();
  const signalDate = new Date(date);
  const daysDiff = Math.floor((now.getTime() - signalDate.getTime()) / (1000 * 60 * 60 * 24));

  let freshness: 'fresh' | 'recent' | 'aging';
  let color: string;
  let label: string;

  if (daysDiff <= 7) {
    freshness = 'fresh';
    color = '#34d399';
    label = 'Fresh';
  } else if (daysDiff <= 21) {
    freshness = 'recent';
    color = '#d4a574';
    label = 'Recent';
  } else {
    freshness = 'aging';
    color = '#6b6358';
    label = 'Aging';
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 9, color,
    }}>
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        backgroundColor: color,
        boxShadow: freshness === 'fresh' ? `0 0 6px ${color}60` : 'none',
        animation: freshness === 'fresh' ? 'ei-pulse 2s ease-in-out infinite' : 'none',
      }} />
      {label}
    </span>
  );
}

/* ─── Trend Mini Chart (for signal cards) ─── */

function TrendMiniChart({ signalId, color }: { signalId: string; color: string }) {
  // Deterministic data from signalId
  const seed = signalId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const data = Array.from({ length: 8 }, (_, i) => {
    const val = Math.sin(seed + i * 0.7) * 3 + 5 + Math.cos(seed * 0.3 + i) * 2;
    return Math.max(1, Math.min(10, val));
  });

  return <MiniSparkline data={data} color={color} width={56} height={20} />;
}

/* ─── Ecosystem Network Map (SVG) ─── */

function EcosystemNetworkMap({
  orgs,
  signals,
  onOrgClick,
}: {
  orgs: EcosystemOrg[];
  signals: IntelSignal[];
  onOrgClick?: (orgId: string) => void;
}) {
  const [hoveredOrg, setHoveredOrg] = useState<string | null>(null);
  const width = 520;
  const height = 260;
  const cx = width / 2;
  const cy = height / 2;

  // Position orgs in an elliptical layout around center
  const orgPositions = useMemo(() => {
    return orgs.map((org, i) => {
      const angle = (i / orgs.length) * Math.PI * 2 - Math.PI / 2;
      const rx = 180;
      const ry = 90;
      return {
        ...org,
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
      };
    });
  }, [orgs]);

  // Build connections: orgs that share signals
  const connections = useMemo(() => {
    const conns: { from: string; to: string; weight: number; color: string }[] = [];
    const orgSignalMap: Record<string, Set<string>> = {};

    // Map orgs by related entities in signals
    signals.forEach((sig) => {
      if (!orgSignalMap[sig.orgId]) orgSignalMap[sig.orgId] = new Set();
      sig.relatedEntities.forEach((e) => {
        orgSignalMap[sig.orgId]?.add(e.name);
      });
    });

    // Connect orgs that share entities
    for (let i = 0; i < orgs.length; i++) {
      for (let j = i + 1; j < orgs.length; j++) {
        const aEntities = orgSignalMap[orgs[i].id] || new Set();
        const bEntities = orgSignalMap[orgs[j].id] || new Set();
        let shared = 0;
        aEntities.forEach((e) => { if (bEntities.has(e)) shared++; });
        // Also connect by similar signal categories
        const aCats = new Set(signals.filter(s => s.orgId === orgs[i].id).map(s => s.category));
        const bCats = new Set(signals.filter(s => s.orgId === orgs[j].id).map(s => s.category));
        let catOverlap = 0;
        aCats.forEach((c) => { if (bCats.has(c)) catOverlap++; });

        if (shared > 0 || catOverlap > 0) {
          conns.push({
            from: orgs[i].id,
            to: orgs[j].id,
            weight: shared + catOverlap,
            color: orgs[i].color,
          });
        }
      }
    }
    return conns;
  }, [orgs, signals]);

  const getPos = (id: string) => orgPositions.find(o => o.id === id);

  return (
    <div style={{
      background: 'rgba(19,23,32,0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(212,165,116,0.08)',
      borderRadius: 16,
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #d4a574 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'relative' }}>
        <defs>
          {/* Connection gradient */}
          <linearGradient id="eiConnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d4a574" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#d4a574" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d4a574" stopOpacity="0.15" />
          </linearGradient>
          <filter id="eiNodeGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="eiCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4a574" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#d4a574" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Center glow */}
        <circle cx={cx} cy={cy} r="60" fill="url(#eiCenterGlow)" />

        {/* Center node (Frequency) */}
        <circle cx={cx} cy={cy} r="22" fill="rgba(212,165,116,0.08)" stroke="rgba(212,165,116,0.25)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="14" fill="rgba(212,165,116,0.12)" stroke="rgba(212,165,116,0.35)" strokeWidth="1.5">
          <animate attributeName="r" values="14;16;14" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.7;1" dur="4s" repeatCount="indefinite" />
        </circle>
        <text x={cx} y={cy - 1} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 6, fill: '#d4a574', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
          FREQ
        </text>

        {/* Connection lines */}
        {connections.map((conn, i) => {
          const from = getPos(conn.from);
          const to = getPos(conn.to);
          if (!from || !to) return null;
          const isHovered = hoveredOrg === conn.from || hoveredOrg === conn.to;
          return (
            <line
              key={`conn-${i}`}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isHovered ? conn.color : 'rgba(212,165,116,0.08)'}
              strokeWidth={isHovered ? 1.5 : 0.8}
              strokeDasharray={isHovered ? 'none' : '4 4'}
              opacity={isHovered ? 0.6 : 0.3}
              style={{ transition: `all 0.4s ${EI_EASE}` }}
            />
          );
        })}

        {/* Lines from center to each org */}
        {orgPositions.map((org) => {
          const isHovered = hoveredOrg === org.id;
          return (
            <line
              key={`center-${org.id}`}
              x1={cx} y1={cy}
              x2={org.x} y2={org.y}
              stroke={isHovered ? org.color : 'rgba(212,165,116,0.06)'}
              strokeWidth={isHovered ? 1.2 : 0.6}
              strokeDasharray={isHovered ? 'none' : '2 6'}
              opacity={isHovered ? 0.5 : 0.25}
              style={{ transition: `all 0.4s ${EI_EASE}` }}
            />
          );
        })}

        {/* Org nodes */}
        {orgPositions.map((org) => {
          const isHovered = hoveredOrg === org.id;
          const signalCount = signals.filter(s => s.orgId === org.id).length;
          return (
            <g
              key={org.id}
              style={{
                cursor: 'pointer',
                animation: 'ei-nodeFloat 6s ease-in-out infinite',
                animationDelay: `${orgPositions.indexOf(org) * 0.5}s`,
              }}
              onMouseEnter={() => setHoveredOrg(org.id)}
              onMouseLeave={() => setHoveredOrg(null)}
              onClick={() => onOrgClick?.(org.id)}
            >
              {/* Outer glow ring */}
              {isHovered && (
                <circle cx={org.x} cy={org.y} r="22" fill="none"
                  stroke={org.color} strokeWidth="1" opacity="0.2"
                  style={{ animation: 'ei-pulseRing 2s ease-in-out infinite' }}
                />
              )}
              {/* Node background */}
              <circle cx={org.x} cy={org.y}
                r={isHovered ? 18 : 15}
                fill={isHovered ? `${org.color}18` : 'rgba(15,18,25,0.9)'}
                stroke={isHovered ? org.color : `${org.color}40`}
                strokeWidth={isHovered ? 1.5 : 1}
                style={{ transition: `all 0.4s ${EI_EASE}` }}
              />
              {/* Relevance ring */}
              <circle cx={org.x} cy={org.y} r={12}
                fill="none" stroke={`${org.color}30`} strokeWidth="2"
                strokeDasharray={`${(org.relevanceScore / 100) * 75.4} ${75.4 - (org.relevanceScore / 100) * 75.4}`}
                strokeDashoffset="18.85"
                strokeLinecap="round"
                transform={`rotate(-90 ${org.x} ${org.y})`}
                style={{ transition: `all 0.4s ${EI_EASE}` }}
              />
              {/* Signal count badge */}
              {signalCount > 0 && (
                <>
                  <circle cx={org.x + 11} cy={org.y - 11} r="7" fill={org.color} opacity="0.9" />
                  <text x={org.x + 11} y={org.y - 10.5} textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: 7, fill: '#0b0d14', fontWeight: 700 }}>
                    {signalCount}
                  </text>
                </>
              )}
              {/* Abbreviation */}
              <text x={org.x} y={org.y + 1} textAnchor="middle" dominantBaseline="central"
                style={{
                  fontSize: 7, fontWeight: 600,
                  fill: isHovered ? org.color : `${org.color}cc`,
                  transition: `fill 0.3s ${EI_EASE}`,
                }}>
                {org.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}
              </text>
              {/* Name label on hover */}
              {isHovered && (
                <text x={org.x} y={org.y + 28} textAnchor="middle"
                  style={{ fontSize: 8, fill: '#f0ebe4', fontWeight: 500 }}>
                  {org.name.length > 22 ? org.name.slice(0, 20) + '...' : org.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Action Recommendation Card ─── */

function ActionRecommendation({ signal, color }: {
  signal: IntelSignal;
  color: string;
}) {
  const urgency = signal.impact === 'High' ? 'Immediate' : signal.impact === 'Medium' ? 'This Week' : 'Monitor';
  const urgencyColor = signal.impact === 'High' ? '#e06060' : signal.impact === 'Medium' ? '#e8b44c' : '#6b6358';

  // Extract action from implication
  const implication = signal.frequencyImplication;
  const actionSentence = implication.split('.')[0] + '.';

  return (
    <div style={{
      borderRadius: 10,
      padding: '12px 14px',
      marginTop: 10,
      background: `linear-gradient(135deg, ${color}08 0%, rgba(212,165,116,0.04) 100%)`,
      border: `1px solid ${color}20`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}60, #d4a57440, transparent)`,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Target size={12} style={{ color }} />
          <span style={{
            fontSize: 10, fontWeight: 700, color,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Recommended Action
          </span>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
          background: `${urgencyColor}15`,
          border: `1px solid ${urgencyColor}25`,
          color: urgencyColor,
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <Clock size={8} />
          {urgency}
        </span>
      </div>
      <p style={{ fontSize: 12, color: '#c8c0b4', lineHeight: 1.55, margin: 0 }}>
        {actionSentence}
      </p>
    </div>
  );
}


/* ─── Ecosystem Organizations ─── */

const ecosystemOrgs: EcosystemOrg[] = [
  {
    id: 'regenesis',
    name: 'Regenesis Group',
    focus: 'Regenerative development',
    alignment: 'Potential bioregion partner',
    icon: Leaf,
    color: '#6b8f71',
    trend: 'up',
    relevanceScore: 92,
  },
  {
    id: 'bfi',
    name: 'Buckminster Fuller Institute',
    focus: 'Systems thinking',
    alignment: 'Thesis alignment',
    icon: Globe,
    color: '#8b5cf6',
    trend: 'up',
    relevanceScore: 78,
  },
  {
    id: 'presencing',
    name: 'Presencing Institute (Otto Scharmer)',
    focus: 'Theory U',
    alignment: 'Coherence practices',
    icon: BookOpen,
    color: '#60a5fa',
    trend: 'up',
    relevanceScore: 85,
  },
  {
    id: 'blab',
    name: 'B Lab / B Corp Movement',
    focus: 'Conscious capitalism',
    alignment: 'Philosophical alignment',
    icon: Building2,
    color: '#d4a574',
    trend: 'stable',
    relevanceScore: 65,
  },
  {
    id: 'patagonia',
    name: 'Patagonia / 1% for the Planet',
    focus: 'Environmental stewardship',
    alignment: 'Stewardship model',
    icon: Leaf,
    color: '#34d399',
    trend: 'stable',
    relevanceScore: 60,
  },
  {
    id: 'conscious-cap',
    name: 'Conscious Capitalism',
    focus: 'Stakeholder capitalism',
    alignment: 'Philosophical alignment',
    icon: TrendingUp,
    color: '#fb923c',
    trend: 'up',
    relevanceScore: 82,
  },
];

/* ─── Intelligence Signals ─── */

const intelSignals: IntelSignal[] = [
  {
    id: 'sig-1',
    orgId: 'regenesis',
    date: '2026-03-05',
    category: 'Partnership Opportunity',
    title: 'Regenesis Launches Bioregion Practitioner Network',
    summary: 'Regenesis Group announced a global network for bioregional practitioners, opening membership to aligned organizations working on place-based regeneration.',
    impact: 'High',
    frequencyImplication: 'Direct opportunity to integrate Gareth\'s Bioregions Node with Regenesis methodology. Could accelerate the Nicoya pilot with their proven frameworks and provide credibility for future bioregion sites.',
    source: 'regenesisgroup.com',
    relatedEntities: [
      { name: 'Gareth Hermann', role: 'Bioregions Lead', color: '#84cc16' },
      { name: 'Bioregions Node', role: 'Node', color: '#34d399' },
    ],
  },
  {
    id: 'sig-2',
    orgId: 'bfi',
    date: '2026-03-01',
    category: 'Program Launch',
    title: 'BFI Design Science Studio 2026 Applications Open',
    summary: 'The Buckminster Fuller Institute opened applications for their annual Design Science Studio, a 6-week intensive for systems-level innovation projects.',
    impact: 'Medium',
    frequencyImplication: 'Fairman\'s Thesis of Change and Map Node could be strong applicants. BFI endorsement would validate our systems approach and open doors to their alumni network of 2,000+ systems thinkers.',
    source: 'bfi.org',
    relatedEntities: [
      { name: 'Alex James Fairman', role: 'Strategic Architect', color: '#8b5cf6' },
      { name: 'Map Node', role: 'Node', color: '#8b5cf6' },
      { name: 'Thesis of Change', role: 'Node', color: '#a855f7' },
    ],
  },
  {
    id: 'sig-3',
    orgId: 'presencing',
    date: '2026-02-28',
    category: 'Strategic Shift',
    title: 'Presencing Institute Pivots Toward Collective Action',
    summary: 'Otto Scharmer announced a strategic pivot from individual awareness to collective action platforms, launching a new initiative for organizational transformation at scale.',
    impact: 'High',
    frequencyImplication: 'Strong alignment with our coherence-to-action bridge. Andrew and Felicia could explore integrating Theory U practices into our pod facilitation model. Their new collective action focus mirrors our two-hemisphere approach.',
    source: 'presencing.org',
    relatedEntities: [
      { name: 'Andrew', role: 'Coherence Lead', color: '#a855f7' },
      { name: 'Felicia Isabella', role: 'Culture', color: '#f472b6' },
      { name: 'Dave Weale', role: 'Pods & Culture', color: '#34d399' },
    ],
  },
  {
    id: 'sig-4',
    orgId: 'blab',
    date: '2026-02-25',
    category: 'Strategic Shift',
    title: 'B Lab Introduces Impact Measurement 3.0 Framework',
    summary: 'B Lab released a new impact measurement framework moving beyond traditional ESG metrics toward systems-level impact assessment, incorporating regenerative indicators.',
    impact: 'Medium',
    frequencyImplication: 'Could inform our capital node\'s deal scoring rubric. Greg\'s evaluation criteria could incorporate B Lab\'s regenerative indicators, giving our investment thesis additional rigor and external credibility.',
    source: 'bcorporation.net',
    relatedEntities: [
      { name: 'Greg Berry', role: 'Capital Lead', color: '#22c55e' },
      { name: 'Capital Node', role: 'Node', color: '#d4a574' },
    ],
  },
  {
    id: 'sig-5',
    orgId: 'patagonia',
    date: '2026-02-20',
    category: 'Funding Round',
    title: '1% for the Planet Surpasses $500M in Total Giving',
    summary: '1% for the Planet announced crossing the $500M milestone in total giving. They are actively seeking new philanthropic models beyond traditional corporate giving.',
    impact: 'Medium',
    frequencyImplication: 'Our DAF model could be presented as an innovative alternative to traditional 1% giving. Colleen could explore whether Frequency members could channel their 1% commitments through our DAF structure.',
    source: 'onepercentfortheplanet.org',
    relatedEntities: [
      { name: 'Colleen Galbraith', role: 'DAF Steward', color: '#d4a574' },
      { name: 'James Hodges', role: 'Founder', color: '#d4a574' },
    ],
  },
  {
    id: 'sig-6',
    orgId: 'conscious-cap',
    date: '2026-02-18',
    category: 'Leadership Change',
    title: 'Conscious Capitalism Appoints New CEO with Impact Investing Background',
    summary: 'Conscious Capitalism named a new CEO with deep roots in impact investing and regenerative finance, signaling a shift from philosophy toward practical capital deployment.',
    impact: 'High',
    frequencyImplication: 'This leadership shift creates a natural alignment opportunity. James should consider reaching out for a strategic conversation. Their pivot toward capital deployment mirrors our Capitalism 2.0 node vision.',
    source: 'consciouscapitalism.org',
    relatedEntities: [
      { name: 'James Hodges', role: 'Founder', color: '#d4a574' },
      { name: 'Capitalism 2.0 Node', role: 'Node', color: '#2dd4bf' },
    ],
  },
  {
    id: 'sig-7',
    orgId: 'regenesis',
    date: '2026-02-15',
    category: 'Program Launch',
    title: 'Regenesis Opens Costa Rica Regenerative Development Fellowship',
    summary: 'A new 12-month fellowship program focused on regenerative development in Costa Rica, specifically targeting the Nicoya Peninsula and Guanacaste regions.',
    impact: 'High',
    frequencyImplication: 'Directly relevant to our Nicoya pilot. Gareth should immediately explore partnership or co-sponsorship. This could provide on-the-ground expertise and local legitimacy for our bioregion initiative.',
    source: 'regenesisgroup.com',
    relatedEntities: [
      { name: 'Gareth Hermann', role: 'Bioregions Lead', color: '#84cc16' },
      { name: 'Bioregions Node', role: 'Node', color: '#34d399' },
      { name: 'Blue Spirit 6.0', role: 'Event', color: '#d4a574' },
    ],
  },
  {
    id: 'sig-8',
    orgId: 'bfi',
    date: '2026-02-10',
    category: 'Partnership Opportunity',
    title: 'BFI Seeking Partners for Global Systems Change Mapping Project',
    summary: 'The Buckminster Fuller Institute is building a collaborative systems change map and seeking partner organizations to contribute data, case studies, and technology.',
    impact: 'Medium',
    frequencyImplication: 'Our Map Node is a natural fit for this partnership. Fairman\'s ecosystem mapping work could contribute to and benefit from BFI\'s global dataset. This could position Frequency as a key node in the global systems change infrastructure.',
    source: 'bfi.org',
    relatedEntities: [
      { name: 'Alex James Fairman', role: 'Strategic Architect', color: '#8b5cf6' },
      { name: 'Map Node', role: 'Node', color: '#8b5cf6' },
    ],
  },
  {
    id: 'sig-9',
    orgId: 'presencing',
    date: '2026-02-05',
    category: 'Partnership Opportunity',
    title: 'Presencing Institute Launches Cohort-Based Learning for Communities',
    summary: 'New offering designed for established communities to deepen collective awareness practices. Seeking pilot communities for a facilitated 8-week program.',
    impact: 'Medium',
    frequencyImplication: 'Dave\'s pod facilitation work could integrate this program. Our steward community of 65+ would be an ideal pilot cohort, and the structured curriculum could accelerate our coherence practices.',
    source: 'presencing.org',
    relatedEntities: [
      { name: 'Dave Weale', role: 'Pods & Culture', color: '#34d399' },
      { name: 'Andrew', role: 'Coherence Lead', color: '#a855f7' },
    ],
  },
  {
    id: 'sig-10',
    orgId: 'blab',
    date: '2026-01-30',
    category: 'Funding Round',
    title: 'B Lab Raises $25M for Emerging Market Expansion',
    summary: 'B Lab secured $25M in funding to expand B Corp certification into emerging markets, with a focus on Latin America and Southeast Asia.',
    impact: 'Low',
    frequencyImplication: 'Peripheral relevance. Their Latin America expansion could eventually intersect with our bioregion work in Costa Rica, but no immediate action needed. Worth monitoring for future alignment.',
    source: 'bcorporation.net',
    relatedEntities: [
      { name: 'Bioregions Node', role: 'Node', color: '#34d399' },
    ],
  },
];

/* ─── Category config ─── */

const categoryConfig: Record<
  SignalCategory,
  { color: string; bg: string; icon: React.ElementType }
> = {
  'Partnership Opportunity': {
    color: '#6b8f71',
    bg: 'rgba(107, 143, 113, 0.12)',
    icon: Handshake,
  },
  'Program Launch': {
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    icon: Rocket,
  },
  'Funding Round': {
    color: '#d4a574',
    bg: 'rgba(212, 165, 116, 0.12)',
    icon: DollarSign,
  },
  'Leadership Change': {
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.12)',
    icon: UserCog,
  },
  'Strategic Shift': {
    color: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.12)',
    icon: ArrowRightLeft,
  },
};

/* ─── Impact config ─── */

const impactConfig: Record<
  ImpactLevel,
  { color: string; bg: string; border: string }
> = {
  High: {
    color: '#e06060',
    bg: 'rgba(224, 96, 96, 0.12)',
    border: 'rgba(224, 96, 96, 0.25)',
  },
  Medium: {
    color: '#e8b44c',
    bg: 'rgba(232, 180, 76, 0.12)',
    border: 'rgba(232, 180, 76, 0.25)',
  },
  Low: {
    color: '#a09888',
    bg: 'rgba(160, 152, 136, 0.12)',
    border: 'rgba(160, 152, 136, 0.2)',
  },
};

/* ─── Sparkline data per org (simulated activity trends) ─── */

const orgSparklines: Record<string, number[]> = {
  'regenesis': [2, 3, 4, 3, 5, 6, 8],
  'bfi': [3, 2, 4, 5, 4, 5, 6],
  'presencing': [1, 3, 2, 4, 5, 6, 7],
  'blab': [4, 3, 3, 4, 3, 4, 4],
  'patagonia': [2, 2, 3, 3, 2, 3, 3],
  'conscious-cap': [1, 2, 3, 4, 5, 6, 7],
};

/* ─── Component ─── */

export function EcosystemIntelView() {
  const [categoryFilter, setCategoryFilter] = useState<SignalCategory | 'all'>('all');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const filteredSignals = useMemo(() => {
    const sorted = [...intelSignals].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (categoryFilter === 'all') return sorted;
    return sorted.filter((s) => s.category === categoryFilter);
  }, [categoryFilter]);

  // Stats
  const highImpactCount = intelSignals.filter((s) => s.impact === 'High').length;
  const partnershipCount = intelSignals.filter(
    (s) => s.category === 'Partnership Opportunity'
  ).length;
  const orgCount = ecosystemOrgs.length;

  // Category counts for donut
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    intelSignals.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Signal strength mapping (based on impact + freshness)
  const getSignalStrength = useCallback((signal: IntelSignal) => {
    const daysDiff = Math.floor((Date.now() - new Date(signal.date).getTime()) / (1000 * 60 * 60 * 24));
    const impactScore = signal.impact === 'High' ? 3 : signal.impact === 'Medium' ? 2 : 1;
    const freshnessScore = daysDiff <= 7 ? 2 : daysDiff <= 21 ? 1 : 0;
    return Math.min(5, impactScore + freshnessScore);
  }, []);

  return (
    <div className="scrollbar-autohide" style={{ padding: '24px 32px', height: '100%', overflow: 'auto', backgroundColor: '#0b0d14' }}>
      {/* Inject scoped keyframes */}
      <style>{eiKeyframes}</style>

      {/* ── Header with glassmorphism ── */}
      <AnimatedEntry delay={0}>
        <div className="card-premium" style={{
          marginBottom: 28,
          padding: '20px 24px',
          background: 'rgba(19,23,32,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212,165,116,0.08)',
          borderRadius: 16,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
          <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
          {/* Shimmer accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(212,165,116,0.3), transparent)',
            backgroundSize: '400% 100%',
            animation: 'ei-shimmer 6s ease-in-out infinite',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.08))',
                border: '1px solid rgba(212,165,116,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <Globe size={22} style={{ color: '#d4a574' }} />
                {/* Live indicator dot */}
                <div style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#34d399',
                  border: '2px solid #0b0d14',
                  animation: 'ei-pulse 2s ease-in-out infinite',
                }} />
              </div>
              <div>
                <h1 className="text-glow" style={{
                  fontSize: 26, fontWeight: 700, color: '#f0ebe4', margin: 0,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #f0ebe4, #d4a574)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Ecosystem Intel
                </h1>
                <p style={{
                  fontSize: 13, color: '#6b6358', margin: 0, marginTop: 2,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Radio size={10} style={{ color: '#6b8f71' }} />
                  Intelligence on aligned organizations and movements
                </p>
              </div>
            </div>
            {/* AI Confidence ring for overall intel quality */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Intel Quality
                </div>
                <div style={{ fontSize: 10, color: '#a09888', marginTop: 1 }}>
                  AI Confidence
                </div>
              </div>
              <ConfidenceRing score={87} color="#d4a574" size={42} />
            </div>
          </div>
        </div>
      </AnimatedEntry>

      {/* ── Summary Stats + Donut ── */}
      <AnimatedEntry delay={60}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr)) auto',
          gap: 12,
          marginBottom: 28,
          alignItems: 'stretch',
        }}>
          {[
            {
              label: 'Tracked Orgs',
              value: orgCount.toString(),
              icon: Building2,
              color: '#8b5cf6',
              accent: 'rgba(139, 92, 246, 0.08)',
            },
            {
              label: 'Total Signals',
              value: intelSignals.length.toString(),
              icon: Activity,
              color: '#d4a574',
              accent: 'rgba(212, 165, 116, 0.08)',
            },
            {
              label: 'High Impact',
              value: highImpactCount.toString(),
              icon: Zap,
              color: '#e06060',
              accent: 'rgba(224, 96, 96, 0.08)',
            },
            {
              label: 'Partnerships',
              value: partnershipCount.toString(),
              icon: Handshake,
              color: '#6b8f71',
              accent: 'rgba(107, 143, 113, 0.08)',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            const isHovered = hoveredStat === stat.label;
            return (
              <div
                className="card-stat"
                key={stat.label}
                style={{
                  background: 'rgba(19,23,32,0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${isHovered ? `${stat.color}30` : 'rgba(212,165,116,0.08)'}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  transition: `all 0.35s ${EI_EASE}`,
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                  boxShadow: isHovered ? `0 8px 24px ${stat.color}12` : 'none',
                }}
                onMouseEnter={() => setHoveredStat(stat.label)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                {/* Accent glow top edge */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)`,
                  opacity: isHovered ? 1 : 0,
                  transition: `opacity 0.35s ${EI_EASE}`,
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8,
                    background: stat.accent,
                    border: `1px solid ${stat.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={13} style={{ color: stat.color }} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: '#6b6358',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {stat.label}
                  </span>
                </div>
                <div style={{
                  fontSize: 28, fontWeight: 700, color: stat.color,
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {stat.value}
                </div>
              </div>
            );
          })}

          {/* Donut chart card */}
          <div
            style={{
              background: 'rgba(19,23,32,0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(212,165,116,0.08)',
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 120,
            }}
          >
            <div style={{
              fontSize: 10, color: '#6b6358', textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: 8, fontWeight: 600,
            }}>
              By Category
            </div>
            <MetricsDonut
              size={76}
              segments={Object.entries(categoryCounts).map(([cat, count]) => ({
                label: cat,
                value: count,
                color: categoryConfig[cat as SignalCategory]?.color || '#a09888',
              }))}
            />
          </div>
        </div>
      </AnimatedEntry>

      {/* ── Ecosystem Network Map ── */}
      <AnimatedEntry delay={120}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Globe size={11} style={{ color: '#8b5cf6' }} />
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600, color: '#a09888',
              letterSpacing: '-0.01em',
            }}>
              Ecosystem Network Map
            </span>
            <span style={{
              fontSize: 9, color: '#4a443e', marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Eye size={9} />
              Hover to explore connections
            </span>
          </div>
          <EcosystemNetworkMap
            orgs={ecosystemOrgs}
            signals={intelSignals}
          />
        </div>
      </AnimatedEntry>

      {/* ── Tracked Organizations with trends ── */}
      <AnimatedEntry delay={200}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'rgba(107,143,113,0.08)',
              border: '1px solid rgba(107,143,113,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={11} style={{ color: '#6b8f71' }} />
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600, color: '#a09888',
              letterSpacing: '-0.01em',
            }}>
              Aligned Organizations
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 12,
          }}>
            {ecosystemOrgs.map((org, i) => {
              const Icon = org.icon;
              const signalCount = intelSignals.filter(
                (s) => s.orgId === org.id
              ).length;
              const sparkData = orgSparklines[org.id] || [1, 2, 3, 2, 3];
              return (
                <AnimatedEntry key={org.id} delay={240 + i * 50}>
                  <div
                    className="card-interactive"
                    style={{
                      background: 'rgba(19,23,32,0.7)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `1px solid ${org.color}12`,
                      borderRadius: 14,
                      padding: '16px 18px',
                      transition: `all 0.35s ${EI_EASE}`,
                      cursor: 'default',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${org.color}35`;
                      e.currentTarget.style.boxShadow = `0 8px 24px ${org.color}10, inset 0 1px 0 ${org.color}15`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${org.color}12`;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Source-colored accent bar at top */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                      background: `linear-gradient(90deg, ${org.color}50, ${org.color}15, transparent)`,
                      borderRadius: '14px 14px 0 0',
                    }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: `linear-gradient(135deg, ${org.color}15, ${org.color}08)`,
                          border: `1px solid ${org.color}20`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} style={{ color: org.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <h3 style={{
                            fontSize: 12, fontWeight: 600, color: '#f0ebe4', margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {org.name}
                          </h3>
                          <TrendArrow direction={org.trend} color={org.color} />
                        </div>
                        <p style={{ fontSize: 10, color: '#6b6358', margin: 0, marginBottom: 8 }}>
                          {org.focus}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                              background: `${org.color}10`, color: org.color,
                              border: `1px solid ${org.color}15`,
                            }}>
                              {org.alignment}
                            </span>
                            {signalCount > 0 && (
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                                background: 'rgba(212,165,116,0.1)',
                                border: '1px solid rgba(212,165,116,0.15)',
                                color: '#d4a574',
                              }}>
                                {signalCount}
                              </span>
                            )}
                          </div>
                          <MiniSparkline data={sparkData} color={org.color} width={52} height={20} />
                        </div>
                      </div>
                    </div>

                    {/* AI Confidence + Relevance bar row */}
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ConfidenceRing score={org.relevanceScore} color={org.color} size={30} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 9, color: '#4a443e' }}>Relevance</span>
                          <span style={{ fontSize: 9, color: org.color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            {org.relevanceScore}%
                          </span>
                        </div>
                        <div className="progress-bar-animated" style={{
                          height: 3, borderRadius: 2, background: 'rgba(30,38,56,0.6)', overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${org.relevanceScore}%`, height: '100%',
                            background: `linear-gradient(90deg, ${org.color}, ${org.color}80)`,
                            borderRadius: 2,
                            transition: `width 0.6s ${EI_EASE}`,
                            boxShadow: `0 0 6px ${org.color}30`,
                            transformOrigin: 'left',
                            animation: 'ei-barFill 0.8s ease-out',
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedEntry>
              );
            })}
          </div>
        </div>
      </AnimatedEntry>

      {/* ── Category Filter Pills ── */}
      <AnimatedEntry delay={500}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24,
          padding: '14px 18px',
          background: 'rgba(19,23,32,0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,165,116,0.06)',
          borderRadius: 14,
        }}>
          <Filter size={14} style={{ color: '#6b6358' }} />
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#6b6358',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4,
          }}>
            Filter
          </span>

          {/* All button */}
          <button
            onClick={() => setCategoryFilter('all')}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
              transition: `all 0.3s ${EI_EASE}`,
              backgroundColor: categoryFilter === 'all' ? 'rgba(212, 165, 116, 0.15)' : 'rgba(15,18,25,0.6)',
              color: categoryFilter === 'all' ? '#d4a574' : '#6b6358',
              border: `1px solid ${categoryFilter === 'all' ? 'rgba(212, 165, 116, 0.3)' : 'rgba(30,38,56,0.5)'}`,
              boxShadow: categoryFilter === 'all' ? '0 0 12px rgba(212,165,116,0.12), inset 0 1px 0 rgba(212,165,116,0.1)' : 'none',
            }}
          >
            All ({intelSignals.length})
          </button>

          {/* Category pills */}
          {(Object.keys(categoryConfig) as SignalCategory[]).map((cat) => {
            const cfg = categoryConfig[cat];
            const count = intelSignals.filter((s) => s.category === cat).length;
            if (count === 0) return null;
            const CatIcon = cfg.icon;
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '7px 16px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all 0.3s ${EI_EASE}`,
                  display: 'flex', alignItems: 'center', gap: 6,
                  backgroundColor: isActive ? cfg.bg : 'rgba(15,18,25,0.6)',
                  color: isActive ? cfg.color : '#6b6358',
                  border: `1px solid ${isActive ? `${cfg.color}35` : 'rgba(30,38,56,0.5)'}`,
                  boxShadow: isActive ? `0 0 12px ${cfg.color}15, inset 0 1px 0 ${cfg.color}12` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = `${cfg.color}25`;
                    e.currentTarget.style.color = cfg.color;
                    e.currentTarget.style.backgroundColor = `${cfg.color}08`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(30,38,56,0.5)';
                    e.currentTarget.style.color = '#6b6358';
                    e.currentTarget.style.backgroundColor = 'rgba(15,18,25,0.6)';
                  }
                }}
              >
                {/* Category-colored dot */}
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  backgroundColor: cfg.color,
                  opacity: isActive ? 1 : 0.4,
                  boxShadow: isActive ? `0 0 6px ${cfg.color}50` : 'none',
                  transition: `all 0.3s ${EI_EASE}`,
                }} />
                <CatIcon size={11} />
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </AnimatedEntry>

      {/* ── Intelligence Signals ── */}
      <div>
        {filteredSignals.map((signal, i) => {
          const org = ecosystemOrgs.find((o) => o.id === signal.orgId);
          const catCfg = categoryConfig[signal.category];
          const impCfg = impactConfig[signal.impact];
          const CatIcon = catCfg.icon;
          const isExpanded = expandedSignal === signal.id;
          const isPriority = signal.impact === 'High';
          const strength = getSignalStrength(signal);

          return (
            <AnimatedEntry key={signal.id} delay={560 + i * 60}>
              <div
                className="card-interactive"
                style={{
                  background: isPriority
                    ? 'linear-gradient(135deg, rgba(19,23,32,0.85), rgba(224,96,96,0.04), rgba(212,165,116,0.03))'
                    : 'rgba(19,23,32,0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${isExpanded ? `${catCfg.color}30` : isPriority ? 'rgba(224, 96, 96, 0.15)' : 'rgba(212,165,116,0.08)'}`,
                  borderRadius: 14,
                  marginBottom: 14,
                  transition: `all 0.35s ${EI_EASE}`,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onClick={() => setExpandedSignal(isExpanded ? null : signal.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${catCfg.color}30`;
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 ${catCfg.color}10`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) {
                    e.currentTarget.style.borderColor = isPriority ? 'rgba(224, 96, 96, 0.15)' : 'rgba(212,165,116,0.08)';
                  }
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Source-colored accent bar left edge */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: 3, bottom: 0,
                  background: `linear-gradient(180deg, ${impCfg.color}, ${impCfg.color}40)`,
                  borderRadius: '14px 0 0 14px',
                }} />

                {/* Priority pulsing indicator */}
                {isPriority && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'rgba(212,165,116,0.8)',
                    animation: 'ei-pulse 2s ease-in-out infinite',
                    boxShadow: '0 0 8px rgba(212,165,116,0.4)',
                  }} />
                )}

                <div style={{ padding: '18px 22px 18px 22px' }}>
                  {/* Top row: date + badges + signal strength + priority indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, color: '#6b6358', fontVariantNumeric: 'tabular-nums',
                        background: 'rgba(30,38,56,0.4)', padding: '3px 10px', borderRadius: 8,
                        border: '1px solid rgba(30,38,56,0.3)',
                      }}>
                        {new Date(signal.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <FreshnessIndicator date={signal.date} />
                      {org && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                          background: `${org.color}0c`, color: org.color,
                          border: `1px solid ${org.color}18`,
                        }}>
                          <org.icon size={9} />
                          {org.name}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Signal strength bars */}
                      <SignalStrengthBars strength={strength} color={catCfg.color} />
                      {/* Trend mini chart */}
                      <TrendMiniChart signalId={signal.id} color={catCfg.color} />
                      {/* Priority indicator bars */}
                      <PriorityIndicator impact={signal.impact} />
                      {/* Source badge */}
                      <SourceBadge source={signal.source} />
                      {/* Category badge */}
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                        background: catCfg.bg, color: catCfg.color,
                        border: `1px solid ${catCfg.color}20`,
                      }}>
                        <CatIcon size={10} />
                        {signal.category}
                      </span>
                      {/* Impact badge */}
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                        background: impCfg.bg, color: impCfg.color,
                        border: `1px solid ${impCfg.border}`,
                      }}>
                        {signal.impact}
                      </span>
                      {/* Expand/collapse */}
                      <div style={{
                        transition: `transform 0.35s ${EI_EASE}`,
                        transform: isExpanded ? 'rotate(0)' : 'rotate(0)',
                      }}>
                        {isExpanded ? (
                          <ChevronDown size={14} style={{ color: catCfg.color, transition: `color 0.3s ${EI_EASE}` }} />
                        ) : (
                          <ChevronRight size={14} style={{ color: '#4a443e', transition: `color 0.3s ${EI_EASE}` }} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: 15, fontWeight: 600, color: '#f0ebe4', margin: '0 0 6px',
                    lineHeight: 1.4, letterSpacing: '-0.01em',
                  }}>
                    {signal.title}
                  </h3>

                  {/* Summary */}
                  <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.65, margin: '0 0 10px' }}>
                    {signal.summary}
                  </p>

                  {/* Frequency Implication (always visible for High impact) */}
                  {(isExpanded || signal.impact === 'High') && (
                    <div
                      style={{
                        borderRadius: 12, padding: '14px 16px', marginTop: 12,
                        background: 'linear-gradient(135deg, rgba(212,165,116,0.06), rgba(212,165,116,0.02))',
                        border: '1px solid rgba(212,165,116,0.12)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Gradient accent top */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                        background: 'linear-gradient(90deg, rgba(212,165,116,0.3), transparent)',
                      }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Lightbulb size={13} style={{ color: '#d4a574' }} />
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: '#d4a574',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          What This Means For Frequency
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#b0a898', lineHeight: 1.65, margin: 0 }}>
                        {signal.frequencyImplication}
                      </p>
                    </div>
                  )}

                  {/* Action Recommendation (visible when expanded) */}
                  {isExpanded && (
                    <ActionRecommendation signal={signal} color={catCfg.color} />
                  )}

                  {/* Related Entities (visible when expanded) */}
                  {isExpanded && signal.relatedEntities.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                        <Link2 size={11} style={{ color: '#4a443e' }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Related Entities
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {signal.relatedEntities.map((entity, ei) => (
                          <div
                            key={ei}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '7px 14px', borderRadius: 10,
                              background: 'rgba(19,23,32,0.6)',
                              border: '1px solid rgba(30,38,56,0.4)',
                              transition: `all 0.3s ${EI_EASE}`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = `${entity.color}35`;
                              e.currentTarget.style.background = `${entity.color}08`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(30,38,56,0.4)';
                              e.currentTarget.style.background = 'rgba(19,23,32,0.6)';
                            }}
                          >
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%',
                              background: `${entity.color}15`,
                              border: `1px solid ${entity.color}25`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 8, fontWeight: 700, color: entity.color,
                            }}>
                              {entity.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#f0ebe4', fontWeight: 500 }}>
                                {entity.name}
                              </div>
                              <div style={{ fontSize: 9, color: '#4a443e' }}>
                                {entity.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source + expand hint */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 14, paddingTop: 12,
                    borderTop: '1px solid rgba(30,38,56,0.3)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: 'rgba(30,38,56,0.4)',
                        border: '1px solid rgba(30,38,56,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ExternalLink size={10} style={{ color: '#4a443e' }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#6b6358' }}>
                        {signal.source}
                      </span>
                    </div>
                    {!isExpanded && signal.impact !== 'High' && (
                      <span style={{
                        fontSize: 10, color: '#4a443e', fontStyle: 'italic',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <ChevronRight size={10} />
                        Click to expand analysis
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedEntry>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {filteredSignals.length === 0 && (
        <AnimatedEntry delay={560}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '56px 24px', borderRadius: 16,
            background: 'rgba(19,23,32,0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,165,116,0.08)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'rgba(212,165,116,0.06)',
              border: '1px solid rgba(212,165,116,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Globe size={28} style={{ color: '#4a443e' }} />
            </div>
            <span style={{ fontSize: 14, color: '#6b6358', fontWeight: 500 }}>
              No signals found for this category.
            </span>
            <span style={{ fontSize: 11, color: '#4a443e', marginTop: 4 }}>
              Try selecting a different filter above.
            </span>
          </div>
        </AnimatedEntry>
      )}
    </div>
  );
}
