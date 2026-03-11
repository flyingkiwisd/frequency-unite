'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Users,
  DollarSign,
  Heart,
  Star,
  Network,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Calendar,
  Target,
  Map,
  ChevronRight,
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Sprout,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  Download,
} from 'lucide-react';
import { okrs, nodes, kpis, roadmapPhases, events, teamMembers, exportPdf } from '@/lib/data';

/* ─── Icon Lookup (for node icons stored as strings) ─── */
const iconMap: Record<string, React.ElementType> = {
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Sprout,
  BookOpen,
};

/* ─── Sparkline data (fabricated trends for each hero KPI) ─── */
const sparklineData: number[][] = [
  [30, 38, 42, 50, 55, 60, 65],       // Well-Stewards
  [60, 85, 110, 130, 145, 165, 180],   // Revenue (K)
  [10, 25, 35, 50, 60, 72, 85],        // DAF Raised (K)
  [72, 74, 76, 75, 77, 76, 78],        // Retention %
  [8.8, 9.0, 9.1, 9.0, 9.2, 9.4, 9.3],// Event NPS
  [1, 2, 2, 3, 3, 4, 4],              // Active Nodes
  [220, 200, 185, 170, 155, 140, 130], // Blue Spirit countdown
];

/* ─── Top-level KPI cards (curated) ─── */
const heroKpis = [
  { label: 'Well-Stewards', value: '~65', numericValue: 65, target: '144', targetNumeric: 144, icon: Users, trend: 'up' as const, color: '#d4a574' },
  { label: '2026 Revenue', value: '$180K', numericValue: 180, target: '$2M', targetNumeric: 2000, icon: DollarSign, trend: 'up' as const, color: '#e8b44c', prefix: '$', suffix: 'K' },
  { label: 'DAF Raised', value: '$85K', numericValue: 85, target: '$500K-$1M', targetNumeric: 500, icon: Heart, trend: 'up' as const, color: '#8b5cf6', prefix: '$', suffix: 'K' },
  { label: 'Member Retention', value: '78%', numericValue: 78, target: '85%+', targetNumeric: 85, icon: TrendingUp, trend: 'up' as const, color: '#6b8f71', suffix: '%' },
  { label: 'Event NPS', value: '9.3', numericValue: 9.3, target: '9.5', targetNumeric: 9.5, icon: Star, trend: 'flat' as const, color: '#e879a0' },
  { label: 'Active Nodes', value: '4', numericValue: 4, target: '6', targetNumeric: 6, icon: Network, trend: 'up' as const, color: '#5eaed4' },
  { label: 'Blue Spirit 6.0', value: '130', numericValue: 130, target: 'Jul 18, 2026', targetNumeric: 200, icon: Calendar, trend: 'flat' as const, color: '#e879a0' },
];

/* ─── Agent Signals (8-agent advisory board) ─── */
const agentSignals: { agent: string; level: 'warning' | 'info' | 'critical'; message: string; icon: React.ElementType }[] = [
  { agent: 'Mothership', level: 'info', message: 'Cash runway at 8.4 months — healthy. Burn rate stable at $25K/mo.', icon: DollarSign },
  { agent: 'Membership', level: 'warning', message: 'Retention at 78%, below 85% target. 4 members flagged at-risk of churn.', icon: Users },
  { agent: 'Node Intel', level: 'warning', message: 'Capitalism 2.0 and Thesis of Change nodes have no monthly update for 30+ days.', icon: Network },
  { agent: 'Events', level: 'info', message: 'Blue Spirit 6.0: 130 days out. 32/70 tickets sold (46%). Registration pace on track.', icon: Calendar },
  { agent: 'People', level: 'critical', message: 'Sian capacity at risk — 50+ hrs/week for 3 consecutive weeks. Fractional PM hire urgent.', icon: AlertTriangle },
];

const signalLevelColor: Record<string, string> = {
  critical: '#e06060',
  warning: '#e8b44c',
  info: '#6b8f71',
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
  if (trend === 'up') return <TrendingUp size={14} />;
  if (trend === 'down') return <TrendingDown size={14} />;
  return <Minus size={14} />;
};

const trendColor = (trend: 'up' | 'down' | 'flat') => {
  if (trend === 'up') return '#6b8f71';
  if (trend === 'down') return '#e06060';
  return '#a09888';
};

/* ─── Status helpers ─── */
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  'on-track': { bg: 'rgba(107, 143, 113, 0.15)', text: '#6b8f71', label: 'On Track' },
  'at-risk': { bg: 'rgba(232, 180, 76, 0.15)', text: '#e8b44c', label: 'At Risk' },
  behind: { bg: 'rgba(224, 96, 96, 0.15)', text: '#e06060', label: 'Behind' },
};

const nodeStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(107, 143, 113, 0.15)', text: '#6b8f71', label: 'Active' },
  building: { bg: 'rgba(232, 180, 76, 0.15)', text: '#e8b44c', label: 'Building' },
  pilot: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', label: 'Pilot' },
  planned: { bg: 'rgba(160, 152, 136, 0.15)', text: '#a09888', label: 'Planned' },
};

const phaseStatusConfig: Record<string, { border: string; bg: string; glow: string }> = {
  active: { border: '#d4a574', bg: 'rgba(212, 165, 116, 0.08)', glow: 'rgba(212, 165, 116, 0.2)' },
  upcoming: { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.06)', glow: 'rgba(139, 92, 246, 0.15)' },
  completed: { border: '#6b8f71', bg: 'rgba(107, 143, 113, 0.06)', glow: 'rgba(107, 143, 113, 0.15)' },
  planned: { border: '#2e3a4e', bg: 'transparent', glow: 'none' },
};

const phaseColorMap: Record<string, string> = {
  amber: '#d4a574',
  violet: '#8b5cf6',
  emerald: '#6b8f71',
  sky: '#5eaed4',
  rose: '#e879a0',
};

/* ─── Quick Links ─── */
const quickLinks = [
  { label: 'Team', view: 'team', icon: Users, desc: 'View steward profiles' },
  { label: 'Nodes', view: 'nodes', icon: Network, desc: 'Explore all 6 nodes' },
  { label: 'OKRs & KPIs', view: 'okrs', icon: Target, desc: 'Track objectives' },
  { label: 'Roadmap', view: 'roadmap', icon: Map, desc: 'See the journey ahead' },
  { label: 'Events', view: 'events', icon: Calendar, desc: 'Upcoming gatherings' },
];

/* ─── Progress Ring Component ─── */
function ProgressRing({ progress, color, size = 52, strokeWidth = 3.5 }: { progress: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (progress / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress, circumference]);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, right: 0 }}>
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1e2638"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
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
          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: `drop-shadow(0 0 4px ${color}66)`,
        }}
      />
    </svg>
  );
}

/* ─── Sparkline Component ─── */
function Sparkline({ data, color, width = 80, height = 28 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Area fill path (close at bottom)
  const firstX = padding;
  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2);
  const areaPath = `M${firstX},${height} L${points.split(' ').map(p => p).join(' L')} L${lastX},${height} Z`;

  const gradientId = `spark-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 2px ${color}44)` }}
      />
      {/* End dot */}
      <circle
        cx={parseFloat(points.split(' ').pop()!.split(',')[0])}
        cy={parseFloat(points.split(' ').pop()!.split(',')[1])}
        r="2"
        fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration: number = 1200, decimals: number = 0): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setCount(parseFloat(current.toFixed(decimals)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    // Small delay so it starts after mount animation
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, 400);

    return () => {
      clearTimeout(timer);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, duration, decimals]);

  return count;
}

/* ─── Animated KPI Value Display ─── */
function AnimatedKpiValue({ kpi }: { kpi: typeof heroKpis[number] }) {
  const decimals = kpi.label === 'Event NPS' ? 1 : 0;
  const animatedValue = useAnimatedCounter(kpi.numericValue, 1400, decimals);

  const prefix = kpi.prefix || (kpi.label === 'Well-Stewards' ? '~' : '');
  const suffix = kpi.suffix || '';

  return (
    <span>
      {prefix}{decimals > 0 ? animatedValue.toFixed(decimals) : Math.round(animatedValue)}{suffix}
    </span>
  );
}

/* ─── War Room Signal Count ─── */
const urgentSignalCount = agentSignals.filter(s => s.level === 'critical' || s.level === 'warning').length;

/* ─── Global Styles (injected once) ─── */
const dashboardStyles = `
  @keyframes dashboardPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes dashboardPulseRing {
    0%, 100% { box-shadow: 0 0 0 0 rgba(224, 96, 96, 0.4); }
    50% { box-shadow: 0 0 0 4px rgba(224, 96, 96, 0); }
  }
  @keyframes warRoomPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }
  @keyframes warRoomBorderShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .dashboard-card-enhanced {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .dashboard-card-enhanced:hover {
    transform: translateY(-2px) scale(1.015);
  }
  .signal-dot-critical {
    animation: dashboardPulse 1.5s ease-in-out infinite;
  }
  .signal-dot-warning {
    animation: dashboardPulse 2s ease-in-out infinite;
  }
`;

/* ─── Component ─── */

export function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const topOkrs = okrs.slice(0, 3);
  const upcomingEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'planning');
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Inject dashboard-specific styles */}
      <style>{dashboardStyles}</style>

      {/* ── War Room Summary Banner ── */}
      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          borderRadius: 14,
          padding: 2,
          background: 'linear-gradient(135deg, #e06060, #e8b44c, #d4a574, #8b5cf6)',
          backgroundSize: '300% 300%',
          animation: 'warRoomBorderShift 6s ease infinite',
          opacity: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 20px',
            borderRadius: 12,
            backgroundColor: '#131720',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#e06060',
                  animation: 'warRoomPulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>
              {urgentSignalCount} signal{urgentSignalCount !== 1 ? 's' : ''} need attention
            </span>
            <div style={{ display: 'flex', gap: 6, marginLeft: 4 }}>
              {agentSignals
                .filter(s => s.level === 'critical' || s.level === 'warning')
                .map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 999,
                      backgroundColor: `${signalLevelColor[s.level]}18`,
                      color: signalLevelColor[s.level],
                    }}
                  >
                    {s.agent}
                  </span>
                ))}
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('agent-signals-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#d4a574',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'inherit',
              padding: '4px 0',
            }}
          >
            Review <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            <span className="gradient-text">Frequency Command Center</span>
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
            North Star: <span className="text-accent font-medium">144 well-stewards</span> &middot;{' '}
            <span className="text-accent font-medium">$2M revenue</span> &middot;{' '}
            <span className="text-accent font-medium">Systems change</span> &mdash; building the root
            system for a regenerative world.
          </p>
        </div>
        <button
          onClick={() => { if (containerRef.current) exportPdf(containerRef.current, 'Dashboard'); }}
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

      {/* ── Hero KPI Cards ── */}
      <div
        className="grid gap-4 animate-fade-in"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          animationDelay: '0.05s',
        }}
      >
        {heroKpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const progress = Math.min(Math.round((kpi.numericValue / kpi.targetNumeric) * 100), 100);
          return (
            <div
              key={kpi.label}
              className="glow-card rounded-xl p-4 border animate-fade-in dashboard-card-enhanced"
              style={{
                backgroundColor: '#131720',
                borderColor: '#1e2638',
                animationDelay: `${0.05 + i * 0.04}s`,
                opacity: 0,
                position: 'relative',
                overflow: 'hidden',
                // Hover glow is handled by inline pseudo-approach via boxShadow on hover
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 20px ${kpi.color}25, 0 4px 16px rgba(0,0,0,0.3)`;
                e.currentTarget.style.borderColor = `${kpi.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#1e2638';
              }}
            >
              {/* Progress Ring (top-right) */}
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <ProgressRing progress={progress} color={kpi.color} size={44} strokeWidth={3} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 700,
                  color: kpi.color,
                  fontFamily: 'monospace',
                }}>
                  {progress}%
                </div>
              </div>

              <div className="flex items-center justify-between mb-3" style={{ paddingRight: 48 }}>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${kpi.color}15` }}
                >
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
                <div
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: trendColor(kpi.trend) }}
                >
                  <TrendIcon trend={kpi.trend} />
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary tracking-tight">
                <AnimatedKpiValue kpi={kpi} />
                {kpi.label === 'Blue Spirit 6.0' && <span className="text-sm font-medium text-text-muted ml-1">days</span>}
              </div>
              <div className="text-xs text-text-muted mt-0.5">{kpi.label}</div>
              <div className="text-[11px] text-text-muted mt-1">
                Target: <span className="text-text-secondary">{kpi.target}</span>
              </div>
              {/* Sparkline */}
              <div style={{ marginTop: 8 }}>
                <Sparkline data={sparklineData[i]} color={kpi.color} width={110} height={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Agent Signals ── */}
      <div id="agent-signals-section" className="animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Radio size={18} className="text-accent" />
            Agent Signals
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1"
              style={{ backgroundColor: 'rgba(232, 180, 76, 0.15)', color: '#e8b44c' }}
            >
              {agentSignals.length}
            </span>
          </h2>
        </div>
        <div className="space-y-3">
          {agentSignals.map((signal, i) => {
            const SigIcon = signal.icon;
            const borderColor = signalLevelColor[signal.level];
            const pulseClass = signal.level === 'critical'
              ? 'signal-dot-critical'
              : signal.level === 'warning'
                ? 'signal-dot-warning'
                : '';
            return (
              <div
                key={i}
                className="rounded-xl p-4 border flex items-start gap-3 animate-fade-in dashboard-card-enhanced"
                style={{
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                  borderLeftWidth: 3,
                  borderLeftColor: borderColor,
                  animationDelay: `${0.12 + i * 0.04}s`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 16px ${borderColor}20`;
                  e.currentTarget.style.borderColor = '#1e2638';
                  e.currentTarget.style.borderLeftColor = borderColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${borderColor}15` }}
                >
                  <SigIcon size={16} style={{ color: borderColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${borderColor}20`, color: borderColor }}
                    >
                      {signal.agent}
                    </span>
                    {/* Pulsing status dot */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div
                        className={pulseClass}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: borderColor,
                        }}
                      />
                      <span
                        className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: borderColor }}
                      >
                        {signal.level}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{signal.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Top 3 OKRs ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0.15s', opacity: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Target size={18} className="text-accent" />
            Top Objectives
          </h2>
          <button
            onClick={() => onNavigate('okrs')}
            className="text-xs text-text-muted hover:text-accent flex items-center gap-1 transition-colors"
          >
            View all OKRs <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {topOkrs.map((okr, i) => {
            const cfg = statusConfig[okr.status] ?? statusConfig['on-track'];
            const avgProgress = Math.round(
              okr.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / okr.keyResults.length,
            );
            return (
              <div
                key={okr.id}
                className="glow-card rounded-xl p-5 border animate-fade-in dashboard-card-enhanced"
                style={{
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                  animationDelay: `${0.2 + i * 0.06}s`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 20px ${cfg.text}20, 0 4px 16px rgba(0,0,0,0.2)`;
                  e.currentTarget.style.borderColor = `${cfg.text}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#1e2638';
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: cfg.bg, color: cfg.text }}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-xs text-text-muted">{okr.quarter}</span>
                </div>
                <p className="text-sm font-medium text-text-primary leading-snug mb-4 line-clamp-3">
                  {okr.objective}
                </p>
                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-text-muted">Overall progress</span>
                    <span className="text-[11px] font-semibold text-text-secondary">
                      {avgProgress}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#1e2638' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${avgProgress}%`,
                        background: `linear-gradient(90deg, ${cfg.text}, ${cfg.text}cc)`,
                      }}
                    />
                  </div>
                </div>
                {/* Key results */}
                <div className="space-y-1.5 mt-3">
                  {okr.keyResults.slice(0, 3).map((kr, j) => (
                    <div key={j} className="flex items-center gap-2 text-[11px]">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: kr.progress >= 50 ? '#6b8f71' : '#e8b44c' }}
                      />
                      <span className="text-text-secondary truncate flex-1">{kr.text}</span>
                      <span className="text-text-muted font-mono">{kr.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Roadmap Timeline ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Map size={18} className="text-accent-violet" />
            Roadmap
          </h2>
          <button
            onClick={() => onNavigate('roadmap')}
            className="text-xs text-text-muted hover:text-accent flex items-center gap-1 transition-colors"
          >
            Full roadmap <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {roadmapPhases.map((phase, i) => {
            const pCfg = phaseStatusConfig[phase.status] ?? phaseStatusConfig.planned;
            const dotColor = phaseColorMap[phase.color] ?? '#a09888';
            return (
              <div
                key={phase.id}
                className="flex-shrink-0 rounded-xl p-4 border animate-fade-in dashboard-card-enhanced"
                style={{
                  width: 210,
                  backgroundColor: pCfg.bg || '#131720',
                  borderColor: pCfg.border,
                  boxShadow: pCfg.glow !== 'none' ? `0 0 20px ${pCfg.glow}` : 'none',
                  animationDelay: `${0.35 + i * 0.06}s`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 24px ${dotColor}30, 0 4px 16px rgba(0,0,0,0.2)`;
                  e.currentTarget.style.borderColor = dotColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = pCfg.glow !== 'none' ? `0 0 20px ${pCfg.glow}` : 'none';
                  e.currentTarget.style.borderColor = pCfg.border;
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span className="text-sm font-semibold text-text-primary">{phase.name}</span>
                </div>
                <p className="text-[11px] text-text-muted mb-1">{phase.subtitle}</p>
                <p className="text-[11px] text-text-secondary font-mono mb-3">{phase.timeline}</p>
                <ul className="space-y-1">
                  {phase.milestones.slice(0, 3).map((m, j) => (
                    <li key={j} className="text-[10px] text-text-muted flex items-start gap-1.5">
                      <CheckCircle2
                        size={10}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: dotColor }}
                      />
                      <span className="leading-tight">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Node Overview ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0.45s', opacity: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Network size={18} className="text-accent-sage" />
            Node Overview
          </h2>
          <button
            onClick={() => onNavigate('nodes')}
            className="text-xs text-text-muted hover:text-accent flex items-center gap-1 transition-colors"
          >
            View all nodes <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node, i) => {
            const Icon = iconMap[node.icon] || Globe;
            const nCfg = nodeStatusConfig[node.status] ?? nodeStatusConfig.active;
            const lead = node.leads[0]
              ? teamMembers.find((m) => m.id === node.leads[0])
              : null;
            return (
              <div
                key={node.id}
                className="glow-card rounded-xl p-4 border cursor-pointer transition-colors animate-fade-in dashboard-card-enhanced"
                style={{
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                  animationDelay: `${0.5 + i * 0.05}s`,
                  opacity: 0,
                }}
                onClick={() => onNavigate('nodes')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 20px ${nCfg.text}20, 0 4px 16px rgba(0,0,0,0.2)`;
                  e.currentTarget.style.borderColor = `${nCfg.text}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#1e2638';
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${node.gradient}`}
                    >
                      <Icon size={18} className={node.color} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{node.name}</div>
                      {lead && (
                        <div className="text-[11px] text-text-muted">
                          Lead: {lead.name.split(' ')[0]}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: nCfg.bg, color: nCfg.text }}
                  >
                    {nCfg.label}
                  </span>
                </div>
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-text-muted">Progress</span>
                    <span className="text-[11px] text-text-secondary font-mono">
                      {node.progress}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#1e2638' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${node.progress}%`,
                        background: `linear-gradient(90deg, ${nCfg.text}, ${nCfg.text}cc)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Upcoming Events ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Calendar size={18} className="text-accent-rose" />
            Upcoming Events
          </h2>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs text-text-muted hover:text-accent flex items-center gap-1 transition-colors"
          >
            All events <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {upcomingEvents.map((evt, i) => (
            <div
              key={evt.id}
              className="glow-card rounded-xl p-5 border animate-fade-in dashboard-card-enhanced"
              style={{
                backgroundColor: '#131720',
                borderColor: '#1e2638',
                animationDelay: `${0.65 + i * 0.06}s`,
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(0,0,0,0.2)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#1e2638';
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{evt.name}</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">{evt.location}</p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor:
                      evt.status === 'upcoming'
                        ? 'rgba(139, 92, 246, 0.15)'
                        : 'rgba(160, 152, 136, 0.15)',
                    color: evt.status === 'upcoming' ? '#8b5cf6' : '#a09888',
                  }}
                >
                  {evt.status === 'upcoming' ? 'Upcoming' : 'Planning'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={12} className="text-text-muted" />
                <span className="text-xs text-text-secondary">{evt.date}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">{evt.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {evt.highlights.slice(0, 3).map((h, j) => (
                  <span
                    key={j}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#1c2230', color: '#a09888' }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0.75s', opacity: 0 }}>
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <ArrowRight size={18} className="text-accent" />
          Quick Navigation
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <button
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className="glow-card rounded-xl p-4 border text-left transition-all group animate-fade-in dashboard-card-enhanced"
                style={{
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                  animationDelay: `${0.8 + i * 0.04}s`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 165, 116, 0.15), 0 4px 16px rgba(0,0,0,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#1e2638';
                }}
              >
                <Icon
                  size={20}
                  className="text-text-muted mb-2 group-hover:text-accent transition-colors"
                />
                <div className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                  {link.label}
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">{link.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
