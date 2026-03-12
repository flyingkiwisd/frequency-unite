'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  Activity,
  Target,
  Users,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  Lightbulb,
  Shield,
  ArrowRight,
  BarChart3,
  Zap,
  Clock,
  Layers,
  Eye,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ═══════════════════════════════════════════════════════════════════
   Scoped Keyframes
   ═══════════════════════════════════════════════════════════════════ */

const scopedKeyframes = `
@keyframes rd-fadeUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes rd-slideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes rd-ringDraw {
  from { stroke-dashoffset: var(--rd-circumference); }
  to   { stroke-dashoffset: var(--rd-offset); }
}
@keyframes rd-pulseAlert {
  0%, 100% { box-shadow: 0 0 0 0 rgba(224,96,96,0.4); }
  50%      { box-shadow: 0 0 0 8px rgba(224,96,96,0); }
}
@keyframes rd-pulseGlow {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
}
@keyframes rd-radarSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes rd-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes rd-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.02); }
}
@keyframes rd-countUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rd-expandIn {
  from { opacity: 0; max-height: 0; }
  to   { opacity: 1; max-height: 600px; }
}
@keyframes rd-gaugeNeedle {
  from { transform: rotate(-90deg); }
  to   { transform: rotate(var(--rd-needle-angle)); }
}
@keyframes rd-sparklineIn {
  from { stroke-dashoffset: 200; }
  to   { stroke-dashoffset: 0; }
}
@keyframes rd-dotPulse {
  0%, 100% { r: 3; }
  50%      { r: 5; }
}
@keyframes rd-barGrow {
  from { width: 0; }
}
@keyframes rd-scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
@keyframes rd-floatBadge {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
`;

/* ═══════════════════════════════════════════════════════════════════
   Design Tokens
   ═══════════════════════════════════════════════════════════════════ */

const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const GOLD = '#e8b44c';
const DANGER = '#e06060';
const SKY = '#5eaed4';
const ROSE = '#e879a0';
const CREAM = '#f0ebe4';
const MUTED = '#a09888';
const DIM = '#6b6358';
const SURFACE = '#131720';
const SURFACE2 = '#1c2230';
const BORDER = '#1e2638';
const BORDER2 = '#2e3a4e';
const BG = '#0b0d14';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const GLASS_BG = 'rgba(19,23,32,0.7)';
const GLASS_BORDER = 'rgba(212,165,116,0.08)';
const GLASS_HOVER = 'rgba(19,23,32,0.85)';

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface DriftActivity {
  label: string;
  type: 'in-seat' | 'out-of-seat';
  hoursPerWeek: number;
}

interface DriftMember {
  id: string;
  driftScore: number;
  prevDriftScore: number;
  activities: DriftActivity[];
  recommendation?: string;
}

/* ═══════════════════════════════════════════════════════════════════
   Mock Data (preserved)
   ═══════════════════════════════════════════════════════════════════ */

const driftData: DriftMember[] = [
  {
    id: 'sian',
    driftScore: 35,
    prevDriftScore: 42,
    activities: [
      { label: 'Cash forecasting', type: 'in-seat', hoursPerWeek: 8 },
      { label: 'Member onboarding', type: 'in-seat', hoursPerWeek: 6 },
      { label: 'Strategic planning', type: 'out-of-seat', hoursPerWeek: 10 },
      { label: 'Fundraising calls', type: 'out-of-seat', hoursPerWeek: 8 },
      { label: 'Board governance', type: 'out-of-seat', hoursPerWeek: 5 },
    ],
    recommendation: 'High drift alert. Sian is carrying strategic work that should belong to a CEO hire. Prioritize offloading fundraising and board governance.',
  },
  {
    id: 'james',
    driftScore: 75,
    prevDriftScore: 72,
    activities: [
      { label: 'Vision strategy', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Board governance', type: 'in-seat', hoursPerWeek: 3 },
      { label: 'Capital strategy', type: 'in-seat', hoursPerWeek: 3 },
      { label: 'Operational decisions', type: 'out-of-seat', hoursPerWeek: 2 },
      { label: 'Vendor management', type: 'out-of-seat', hoursPerWeek: 1 },
    ],
    recommendation: 'Moderate drift. Consider delegating vendor management and day-to-day operational decisions to COO.',
  },
  {
    id: 'fairman',
    driftScore: 82,
    prevDriftScore: 80,
    activities: [
      { label: 'Thesis architecture', type: 'in-seat', hoursPerWeek: 6 },
      { label: 'Node design', type: 'in-seat', hoursPerWeek: 5 },
      { label: 'DECO framework', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Event logistics', type: 'out-of-seat', hoursPerWeek: 3 },
    ],
    recommendation: 'Well-focused. Minor drift into event logistics — could be redirected to ops team.',
  },
  {
    id: 'greg',
    driftScore: 90,
    prevDriftScore: 88,
    activities: [
      { label: 'Deal scoring', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Capital deployment', type: 'in-seat', hoursPerWeek: 3 },
      { label: 'Due diligence', type: 'in-seat', hoursPerWeek: 3 },
    ],
  },
  {
    id: 'mafe',
    driftScore: 70,
    prevDriftScore: 65,
    activities: [
      { label: 'Airtable management', type: 'in-seat', hoursPerWeek: 8 },
      { label: 'Communications', type: 'in-seat', hoursPerWeek: 6 },
      { label: 'Strategic planning', type: 'out-of-seat', hoursPerWeek: 3 },
      { label: 'Member outreach', type: 'out-of-seat', hoursPerWeek: 3 },
    ],
    recommendation: 'Improving focus. Strategic planning and member outreach are stretching beyond PM scope.',
  },
  {
    id: 'colleen',
    driftScore: 88,
    prevDriftScore: 86,
    activities: [
      { label: 'DAF compliance', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Financial stewardship', type: 'in-seat', hoursPerWeek: 3 },
      { label: 'General ops', type: 'out-of-seat', hoursPerWeek: 1 },
    ],
  },
  {
    id: 'dave',
    driftScore: 78,
    prevDriftScore: 75,
    activities: [
      { label: 'Pod facilitation', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Board governance', type: 'in-seat', hoursPerWeek: 2 },
      { label: 'Cash forecasting', type: 'out-of-seat', hoursPerWeek: 2 },
      { label: 'Vendor management', type: 'out-of-seat', hoursPerWeek: 1 },
    ],
    recommendation: 'Cash forecasting is out of scope for Board & Culture role. Redirect to Sian or finance.',
  },
  {
    id: 'gareth',
    driftScore: 85,
    prevDriftScore: 82,
    activities: [
      { label: 'Bioregion design', type: 'in-seat', hoursPerWeek: 6 },
      { label: 'Nicoya pilot', type: 'in-seat', hoursPerWeek: 5 },
      { label: 'Admin tasks', type: 'out-of-seat', hoursPerWeek: 2 },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

function avatarGradient(color: string): string {
  const gradientMap: Record<string, string> = {
    'bg-amber-500': 'linear-gradient(135deg, #c4925a, #d4a574)',
    'bg-amber-400': 'linear-gradient(135deg, #d4a574, #e8b44c)',
    'bg-rose-400': 'linear-gradient(135deg, #e879a0, #f0a0b8)',
    'bg-violet-500': 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    'bg-sky-400': 'linear-gradient(135deg, #38bdf8, #5eaed4)',
    'bg-emerald-500': 'linear-gradient(135deg, #10b981, #34d399)',
    'bg-purple-500': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'bg-pink-400': 'linear-gradient(135deg, #e879a0, #f0a0b8)',
    'bg-teal-400': 'linear-gradient(135deg, #2dd4bf, #5eead4)',
    'bg-green-500': 'linear-gradient(135deg, #22c55e, #4ade80)',
    'bg-lime-500': 'linear-gradient(135deg, #84cc16, #a3e635)',
    'bg-orange-500': 'linear-gradient(135deg, #f97316, #fb923c)',
    'bg-indigo-400': 'linear-gradient(135deg, #818cf8, #a5b4fc)',
    'bg-slate-400': 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
  };
  return gradientMap[color] || 'linear-gradient(135deg, #a09888, #6b6358)';
}

function scoreColor(score: number): string {
  if (score >= 80) return SAGE;
  if (score >= 60) return GOLD;
  return DANGER;
}

function scoreBg(score: number): string {
  if (score >= 80) return 'rgba(107, 143, 113, 0.12)';
  if (score >= 60) return 'rgba(232, 180, 76, 0.12)';
  return 'rgba(224, 96, 96, 0.12)';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Focused';
  if (score >= 60) return 'Moderate Drift';
  return 'High Drift';
}

function scoreLabelIcon(score: number) {
  if (score >= 80) return CheckCircle2;
  if (score >= 60) return Activity;
  return AlertTriangle;
}

/** Generate synthetic sparkline data for drift-over-time visualization */
function generateSparkline(current: number, prev: number, points = 8): number[] {
  const result: number[] = [];
  const start = Math.max(10, Math.min(95, prev - Math.floor(Math.random() * 15)));
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const base = start + (current - start) * t;
    const noise = (Math.random() - 0.5) * 12;
    result.push(Math.max(5, Math.min(98, Math.round(base + noise * (1 - t * 0.5)))));
  }
  result[result.length - 1] = current;
  return result;
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════════ */

/* --- Animated Counter --- */
function AnimatedNumber({ value, color, size = 28, delay = 0 }: { value: number; color: string; size?: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 800;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <span
      ref={ref}
      style={{
        fontSize: size,
        fontWeight: 800,
        color,
        fontFamily: 'var(--font-mono, monospace)',
        lineHeight: 1,
        animation: `rd-countUp 0.5s ${EASE} ${delay}ms both`,
      }}
    >
      {display}
    </span>
  );
}

/* --- Circular Drift Score Ring --- */
function DriftRing({
  score,
  size = 72,
  strokeWidth = 5,
  delay = 0,
  showLabel = true,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  showLabel?: boolean;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`rd-ring-grad-${score}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
          <filter id={`rd-ring-glow-${score}-${size}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />

        {/* Score arc */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={`url(#rd-ring-grad-${score}-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            '--rd-circumference': `${circumference}`,
            '--rd-offset': `${offset}`,
            animation: `rd-ringDraw 1.2s ${EASE} ${delay}ms both`,
            filter: `drop-shadow(0 0 4px ${color}40)`,
          } as React.CSSProperties}
        />

        {/* Tip glow dot */}
        {score > 0 && (
          <circle
            cx={cx + radius * Math.cos((-90 + (score / 100) * 360) * Math.PI / 180)}
            cy={cy + radius * Math.sin((-90 + (score / 100) * 360) * Math.PI / 180)}
            r={strokeWidth / 2 + 1}
            fill={color}
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
              animation: `rd-scaleIn 0.3s ${EASE} ${delay + 1000}ms both`,
            }}
          />
        )}
      </svg>

      {/* Center label */}
      {showLabel && (
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
          <AnimatedNumber value={score} color={color} size={size > 60 ? 20 : 14} delay={delay + 200} />
          <span style={{ fontSize: 8, fontWeight: 600, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1 }}>
            focus
          </span>
        </div>
      )}
    </div>
  );
}

/* --- Sparkline Mini-Chart --- */
function Sparkline({
  data,
  width = 80,
  height = 28,
  color,
  delay = 0,
}: {
  data: number[];
  width?: number;
  height?: number;
  color: string;
  delay?: number;
}) {
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return { x, y };
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = pathD + ` L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`rd-spark-fill-${delay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#rd-spark-fill-${delay})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="200"
        style={{
          animation: `rd-sparklineIn 1s ${EASE} ${delay}ms both`,
        }}
      />
      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="3"
        fill={color}
        stroke={SURFACE}
        strokeWidth="1.5"
        style={{
          animation: `rd-scaleIn 0.3s ${EASE} ${delay + 800}ms both`,
        }}
      />
    </svg>
  );
}

/* --- Pulsing Alert Badge --- */
function AlertBadge({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 9,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 20,
        color: DANGER,
        backgroundColor: 'rgba(224,96,96,0.12)',
        border: '1px solid rgba(224,96,96,0.25)',
        animation: `rd-pulseAlert 2s ease-in-out infinite, rd-scaleIn 0.4s ${EASE} ${delay}ms both`,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      <AlertTriangle size={10} />
      {label}
    </span>
  );
}

/* --- Category Domain Tag --- */
function DomainTag({
  label,
  type,
  hours,
  delay = 0,
}: {
  label: string;
  type: 'in-seat' | 'out-of-seat';
  hours: number;
  delay?: number;
}) {
  const isInSeat = type === 'in-seat';
  const color = isInSeat ? SAGE : GOLD;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11,
        padding: '6px 10px',
        borderRadius: 8,
        background: `linear-gradient(135deg, ${color}08, ${color}04)`,
        border: `1px solid ${color}15`,
        transition: `all 0.3s ${EASE}`,
        animation: `rd-fadeUp 0.4s ${EASE} ${delay}ms both`,
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}35`;
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}14, ${color}08)`;
        e.currentTarget.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}15`;
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}08, ${color}04)`;
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}50`,
          }}
        />
        <span style={{ color: MUTED }}>{label}</span>
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color,
          fontFamily: 'var(--font-mono, monospace)',
          minWidth: 28,
          textAlign: 'right',
        }}
      >
        {hours}h
      </span>
    </div>
  );
}

/* --- Gauge Visualization (overall team drift) --- */
function DriftGauge({ score, size = 180 }: { score: number; size?: number }) {
  const cx = size / 2;
  const cy = size * 0.6;
  const radius = size * 0.4;
  const startAngle = -180;
  const endAngle = 0;
  const sweepAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (score / 100) * sweepAngle;

  const arcPath = (angle: number, r: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const start = arcPath(startAngle, radius);
  const end = arcPath(endAngle, radius);
  const scorePoint = arcPath(scoreAngle, radius);

  // Build arc for background
  const bgArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;

  // Build arc for score fill
  const largeArc = score > 50 ? 1 : 0;
  const scoreArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${scorePoint.x} ${scorePoint.y}`;

  const color = scoreColor(score);

  // Tick marks
  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="rd-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={DANGER} />
          <stop offset="40%" stopColor={GOLD} />
          <stop offset="100%" stopColor={SAGE} />
        </linearGradient>
        <filter id="rd-gauge-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background arc */}
      <path
        d={bgArc}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* Gradient colored arc */}
      <path
        d={bgArc}
        fill="none"
        stroke="url(#rd-gauge-gradient)"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.2"
      />

      {/* Active score arc */}
      <path
        d={scoreArc}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        filter="url(#rd-gauge-glow)"
        strokeDasharray="500"
        style={{
          animation: `rd-sparklineIn 1.5s ${EASE} 300ms both`,
        }}
      />

      {/* Tick marks */}
      {ticks.map((tick) => {
        const angle = startAngle + (tick / 100) * sweepAngle;
        const innerR = radius - 10;
        const outerR = radius + 10;
        const p1 = arcPath(angle, innerR);
        const p2 = arcPath(angle, outerR);
        const labelP = arcPath(angle, outerR + 12);
        return (
          <g key={tick}>
            <line
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            <text
              x={labelP.x} y={labelP.y}
              fill={DIM}
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--font-mono, monospace)"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={scorePoint.x} y2={scorePoint.y}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          filter: `drop-shadow(0 0 4px ${color}80)`,
        }}
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="5" fill={color} stroke={SURFACE} strokeWidth="2" />

      {/* Score display */}
      <text
        x={cx} y={cy + 24}
        fill={color}
        fontSize="22"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="var(--font-mono, monospace)"
      >
        {score}%
      </text>
      <text
        x={cx} y={cy + 38}
        fill={DIM}
        fontSize="9"
        fontWeight="600"
        textAnchor="middle"
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        TEAM FOCUS
      </text>
    </svg>
  );
}

/* --- Enhanced Radar Chart --- */
function RadarChart({ data, size = 220 }: { data: typeof driftData; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 24;
  const members = data.slice(0, 8);
  const angleStep = (2 * Math.PI) / members.length;

  function ringPoints(radius: number) {
    return members.map((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  }

  const dataPoints = members.map((m, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (m.driftScore / 100) * maxRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, score: m.driftScore };
  });

  const prevDataPoints = members.map((m, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (m.prevDriftScore / 100) * maxRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const prevPolygon = prevDataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="rd-radar-fill" cx="50%" cy="50%">
          <stop offset="0%" stopColor={AMBER} stopOpacity="0.25" />
          <stop offset="100%" stopColor={AMBER} stopOpacity="0.03" />
        </radialGradient>
        <radialGradient id="rd-radar-bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="rd-radar-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background fill */}
      <circle cx={cx} cy={cy} r={maxRadius} fill="url(#rd-radar-bg)" />

      {/* Concentric rings */}
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <polygon
          key={level}
          points={ringPoints(maxRadius * level)}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.5"
          strokeDasharray={level < 1 ? '2,3' : 'none'}
        />
      ))}

      {/* Ring labels */}
      {[25, 50, 75, 100].map((val) => (
        <text
          key={val}
          x={cx + 4}
          y={cy - (val / 100) * maxRadius + 3}
          fill="rgba(255,255,255,0.12)"
          fontSize="7"
          fontFamily="var(--font-mono, monospace)"
        >
          {val}
        </text>
      ))}

      {/* Axis lines */}
      {members.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const x2 = cx + maxRadius * Math.cos(angle);
        const y2 = cy + maxRadius * Math.sin(angle);
        return (
          <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        );
      })}

      {/* Previous period polygon (ghost) */}
      <polygon
        points={prevPolygon}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
        strokeDasharray="3,3"
        strokeLinejoin="round"
      />

      {/* Current data polygon */}
      <polygon
        points={dataPolygon}
        fill="url(#rd-radar-fill)"
        stroke={AMBER}
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#rd-radar-glow)"
        style={{ transition: `all 0.6s ${EASE}` }}
      />

      {/* Data points with color coding */}
      {dataPoints.map((p, i) => {
        const color = scoreColor(members[i].driftScore);
        return (
          <g key={i}>
            {/* Outer glow ring */}
            <circle
              cx={p.x} cy={p.y} r="8"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              opacity="0.3"
            />
            {/* Data dot */}
            <circle
              cx={p.x} cy={p.y} r="4.5"
              fill={color}
              stroke={SURFACE}
              strokeWidth="2"
              style={{
                animation: `rd-scaleIn 0.4s ${EASE} ${300 + i * 80}ms both`,
                filter: `drop-shadow(0 0 4px ${color}60)`,
              }}
            />
          </g>
        );
      })}

      {/* Labels */}
      {members.map((m, i) => {
        const member = teamMembers.find((tm) => tm.id === m.id);
        if (!member) return null;
        const angle = -Math.PI / 2 + i * angleStep;
        const labelR = maxRadius + 18;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
        const color = scoreColor(m.driftScore);
        return (
          <g key={m.id}>
            <text
              x={x} y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill={color}
              fontSize="9"
              fontWeight="700"
              style={{ textShadow: `0 0 8px ${color}30` }}
            >
              {member.name.split(' ')[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* --- Role Comparison Panel --- */
function RoleComparison({
  member,
  activities,
  delay = 0,
}: {
  member: any;
  activities: DriftActivity[];
  delay?: number;
}) {
  const inSeat = activities.filter((a) => a.type === 'in-seat');
  const outSeat = activities.filter((a) => a.type === 'out-of-seat');
  const totalIn = inSeat.reduce((s, a) => s + a.hoursPerWeek, 0);
  const totalOut = outSeat.reduce((s, a) => s + a.hoursPerWeek, 0);
  const total = totalIn + totalOut;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${BORDER}`,
        animation: `rd-fadeUp 0.5s ${EASE} ${delay}ms both`,
      }}
    >
      {/* Defined Role */}
      <div style={{ padding: '14px 16px', background: `linear-gradient(135deg, ${SAGE}06, ${SAGE}02)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Shield size={12} style={{ color: SAGE }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Defined Role
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              fontWeight: 700,
              color: SAGE,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {totalIn}h/wk
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {inSeat.map((a, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: MUTED,
              }}
            >
              <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: SAGE, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{a.label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: SAGE, fontFamily: 'var(--font-mono, monospace)' }}>
                {a.hoursPerWeek}h
              </span>
            </div>
          ))}
          {inSeat.length === 0 && (
            <span style={{ fontSize: 11, color: DIM, fontStyle: 'italic' }}>No in-seat activities</span>
          )}
        </div>
        {/* Percentage bar */}
        <div style={{ marginTop: 10 }}>
          <div className="progress-bar-animated" style={{ height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: total > 0 ? `${(totalIn / total) * 100}%` : '0%',
                backgroundColor: SAGE,
                borderRadius: 2,
                transition: `width 0.8s ${EASE}`,
              }}
            />
          </div>
          <span style={{ fontSize: 9, color: DIM, marginTop: 3, display: 'block' }}>
            {total > 0 ? Math.round((totalIn / total) * 100) : 0}% of time
          </span>
        </div>
      </div>

      {/* Actual Activity (drift) */}
      <div style={{ padding: '14px 16px', background: `linear-gradient(135deg, ${GOLD}06, ${GOLD}02)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Compass size={12} style={{ color: GOLD }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Drift Activity
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              fontWeight: 700,
              color: GOLD,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {totalOut}h/wk
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {outSeat.map((a, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: MUTED,
              }}
            >
              <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: GOLD, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{a.label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: GOLD, fontFamily: 'var(--font-mono, monospace)' }}>
                {a.hoursPerWeek}h
              </span>
            </div>
          ))}
          {outSeat.length === 0 && (
            <span style={{ fontSize: 11, color: DIM, fontStyle: 'italic' }}>No drift detected</span>
          )}
        </div>
        {/* Percentage bar */}
        <div style={{ marginTop: 10 }}>
          <div className="progress-bar-animated" style={{ height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: total > 0 ? `${(totalOut / total) * 100}%` : '0%',
                backgroundColor: GOLD,
                borderRadius: 2,
                transition: `width 0.8s ${EASE}`,
              }}
            />
          </div>
          <span style={{ fontSize: 9, color: DIM, marginTop: 3, display: 'block' }}>
            {total > 0 ? Math.round((totalOut / total) * 100) : 0}% of time
          </span>
        </div>
      </div>
    </div>
  );
}

/* --- Activity Bar Chart (enhanced) --- */
function ActivityBarChart({ activities, delay = 0 }: { activities: DriftActivity[]; delay?: number }) {
  const maxHours = Math.max(...activities.map((a) => a.hoursPerWeek), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {activities.map((a, i) => {
        const color = a.type === 'in-seat' ? SAGE : GOLD;
        const pct = (a.hoursPerWeek / maxHours) * 100;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: `rd-fadeUp 0.4s ${EASE} ${delay + i * 60}ms both`,
            }}
          >
            <span style={{ fontSize: 10, color: MUTED, width: 110, textAlign: 'right', flexShrink: 0 }}>
              {a.label}
            </span>
            <div style={{ flex: 1, height: 16, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.02)', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}30, ${color}50)`,
                  borderRadius: 4,
                  animation: `rd-barGrow 0.8s ${EASE} ${delay + i * 60 + 200}ms both`,
                  position: 'relative',
                }}
              >
                {/* Shimmer */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(90deg, transparent, ${color}20, transparent)`,
                    backgroundSize: '200% 100%',
                    animation: 'rd-shimmer 3s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color,
                fontFamily: 'var(--font-mono, monospace)',
                width: 28,
                textAlign: 'right',
              }}
            >
              {a.hoursPerWeek}h
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* --- Glassmorphism Card Wrapper --- */
function GlassCard({
  children,
  style,
  className = '',
  hover = true,
  delay = 0,
  glow,
  onClick,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hover?: boolean;
  delay?: number;
  glow?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`glow-card ${className}`}
      onClick={onClick}
      style={{
        background: GLASS_BG,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${GLASS_BORDER}`,
        borderRadius: 16,
        animation: `rd-fadeUp 0.5s ${EASE} ${delay}ms both`,
        transition: `all 0.3s ${EASE}`,
        ...(hover ? { cursor: 'pointer' } : {}),
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.background = GLASS_HOVER;
        e.currentTarget.style.borderColor = 'rgba(212,165,116,0.18)';
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)${glow ? `, 0 0 20px ${glow}` : ''}`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.background = GLASS_BG;
        e.currentTarget.style.borderColor = GLASS_BORDER;
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      } : undefined}
    >
      {children}
    </div>
  );
}

/* --- Team Drift Overview (horizontal stacked bars) --- */
function TeamDriftOverview({ data }: { data: Array<{ id: string; driftScore: number; member: any }> }) {
  const sorted = [...data].sort((a, b) => a.driftScore - b.driftScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map((item, i) => {
        const color = scoreColor(item.driftScore);
        const driftPct = 100 - item.driftScore;
        return (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: `rd-fadeUp 0.4s ${EASE} ${200 + i * 60}ms both`,
            }}
          >
            {/* Name */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: CREAM,
                width: 70,
                textAlign: 'right',
                flexShrink: 0,
              }}
            >
              {item.member?.name.split(' ')[0] || item.id}
            </span>

            {/* Bar track */}
            <div
              style={{
                flex: 1,
                height: 22,
                borderRadius: 6,
                backgroundColor: 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
                display: 'flex',
                position: 'relative',
              }}
            >
              {/* In-seat fill */}
              <div
                style={{
                  height: '100%',
                  width: `${item.driftScore}%`,
                  background: `linear-gradient(90deg, ${SAGE}20, ${SAGE}35)`,
                  borderRadius: '6px 0 0 6px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 8,
                  animation: `rd-barGrow 0.8s ${EASE} ${300 + i * 80}ms both`,
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, color: SAGE, fontFamily: 'var(--font-mono, monospace)' }}>
                  {item.driftScore}%
                </span>
              </div>

              {/* Drift fill */}
              <div
                style={{
                  height: '100%',
                  width: `${driftPct}%`,
                  background: `linear-gradient(90deg, ${item.driftScore < 50 ? DANGER : GOLD}15, ${item.driftScore < 50 ? DANGER : GOLD}25)`,
                  borderRadius: '0 6px 6px 0',
                }}
              />
            </div>

            {/* Drift % badge */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color,
                fontFamily: 'var(--font-mono, monospace)',
                width: 36,
                textAlign: 'right',
              }}
            >
              {driftPct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */

export function RoleDriftView() {
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const enrichedData = useMemo(() => {
    return driftData
      .map((d) => {
        const member = teamMembers.find((m) => m.id === d.id);
        return { ...d, member };
      })
      .filter((d) => d.member);
  }, []);

  const sorted = useMemo(() => {
    return [...enrichedData].sort((a, b) =>
      sortAsc ? b.driftScore - a.driftScore : a.driftScore - b.driftScore
    );
  }, [enrichedData, sortAsc]);

  // Sparkline cache
  const sparklines = useMemo(() => {
    const map: Record<string, number[]> = {};
    enrichedData.forEach((d) => {
      map[d.id] = generateSparkline(d.driftScore, d.prevDriftScore);
    });
    return map;
  }, [enrichedData]);

  // Aggregate stats
  const avgScore = Math.round(
    enrichedData.reduce((sum, d) => sum + d.driftScore, 0) / enrichedData.length
  );
  const mostFocused = enrichedData.reduce((best, d) => d.driftScore > best.driftScore ? d : best);
  const mostDrifted = enrichedData.reduce((worst, d) => d.driftScore < worst.driftScore ? d : worst);
  const totalActivities = enrichedData.reduce((sum, d) => sum + d.activities.length, 0);
  const membersWithRecs = enrichedData.filter((d) => d.recommendation).length;
  const atRiskCount = enrichedData.filter((d) => d.driftScore < 60).length;
  const totalInSeatHours = enrichedData.reduce(
    (s, d) => s + d.activities.filter((a) => a.type === 'in-seat').reduce((h, a) => h + a.hoursPerWeek, 0),
    0
  );
  const totalOutSeatHours = enrichedData.reduce(
    (s, d) => s + d.activities.filter((a) => a.type === 'out-of-seat').reduce((h, a) => h + a.hoursPerWeek, 0),
    0
  );

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 40px' }}>
      {/* Inject scoped keyframes */}
      <style dangerouslySetInnerHTML={{ __html: scopedKeyframes }} />

      {/* ── Header ── */}
      <div style={{ marginBottom: 36, animation: `rd-fadeUp 0.6s ${EASE} 0ms both`, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${AMBER}20, ${VIOLET}15)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${AMBER}20`,
            }}
          >
            <Compass size={24} style={{ color: AMBER }} />
          </div>
          <div>
            <h1 className="text-glow" style={{ fontSize: 28, fontWeight: 800, color: CREAM, margin: 0, letterSpacing: '-0.02em' }}>
              Role Drift Detector
            </h1>
            <p style={{ fontSize: 13, color: MUTED, margin: '4px 0 0', lineHeight: 1.4 }}>
              Tracking role adherence across the steward team. Lower scores indicate more time spent outside defined responsibilities.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Header Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 10,
          marginBottom: 28,
        }}
      >
        {[
          {
            label: 'Team Focus',
            value: avgScore,
            suffix: '%',
            color: scoreColor(avgScore),
            icon: Target,
            sub: scoreLabel(avgScore),
          },
          {
            label: 'Members at Risk',
            value: atRiskCount,
            suffix: '',
            color: atRiskCount > 0 ? DANGER : SAGE,
            icon: AlertTriangle,
            sub: atRiskCount > 0 ? 'need attention' : 'all clear',
            pulse: atRiskCount > 0,
          },
          {
            label: 'Most Focused',
            value: mostFocused.driftScore,
            suffix: '',
            color: SAGE,
            icon: CheckCircle2,
            sub: mostFocused.member?.name.split(' ')[0] || '',
          },
          {
            label: 'Most Drifted',
            value: mostDrifted.driftScore,
            suffix: '',
            color: DANGER,
            icon: TrendingDown,
            sub: mostDrifted.member?.name.split(' ')[0] || '',
          },
          {
            label: 'In-Seat Hours',
            value: totalInSeatHours,
            suffix: 'h',
            color: SAGE,
            icon: Clock,
            sub: `${totalActivities} activities tracked`,
          },
          {
            label: 'Action Items',
            value: membersWithRecs,
            suffix: '',
            color: GOLD,
            icon: Lightbulb,
            sub: 'recommendations',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlassCard
              key={stat.label}
              className="card-stat"
              delay={80 + i * 50}
              style={{
                padding: '16px 14px',
                ...(stat.pulse ? { animation: `rd-pulseAlert 3s ease-in-out infinite, rd-fadeUp 0.5s ${EASE} ${80 + i * 50}ms both` } : {}),
              }}
              glow={`${stat.color}15`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    backgroundColor: `${stat.color}12`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={12} style={{ color: stat.color }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <AnimatedNumber value={stat.value} color={stat.color} size={24} delay={200 + i * 60} />
                {stat.suffix && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono, monospace)' }}>
                    {stat.suffix}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: DIM, marginTop: 3 }}>
                {stat.sub}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── Gauge + Radar + Team Overview ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 250px 1fr',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Gauge */}
        <GlassCard className="card-premium" delay={300} hover={false} style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, alignSelf: 'flex-start' }}>
            <Zap size={12} style={{ color: DIM }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Drift Gauge
            </span>
          </div>
          <DriftGauge score={avgScore} size={170} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: SAGE, fontFamily: 'var(--font-mono, monospace)' }}>{totalInSeatHours}h</span>
              <span style={{ fontSize: 8, color: DIM, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>In-Seat</span>
            </div>
            <div style={{ width: 1, backgroundColor: BORDER }} />
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: GOLD, fontFamily: 'var(--font-mono, monospace)' }}>{totalOutSeatHours}h</span>
              <span style={{ fontSize: 8, color: DIM, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Drift</span>
            </div>
          </div>
        </GlassCard>

        {/* Radar */}
        <GlassCard className="card-premium" delay={350} hover={false} style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, alignSelf: 'flex-start', paddingLeft: 4 }}>
            <BarChart3 size={12} style={{ color: DIM }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Focus Radar
            </span>
          </div>
          <RadarChart data={driftData} size={215} />
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 2, backgroundColor: AMBER, borderRadius: 1 }} />
              <span style={{ fontSize: 8, color: DIM }}>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 2, borderBottom: `1px dashed rgba(255,255,255,0.2)` }} />
              <span style={{ fontSize: 8, color: DIM }}>Previous</span>
            </div>
          </div>
        </GlassCard>

        {/* Team overview bars */}
        <GlassCard className="card-premium" delay={400} hover={false} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={12} style={{ color: DIM }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Team Overview
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: `${SAGE}40` }} />
                <span style={{ fontSize: 8, color: DIM }}>In-Seat</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: `${GOLD}30` }} />
                <span style={{ fontSize: 8, color: DIM }}>Drift</span>
              </div>
            </div>
          </div>
          <TeamDriftOverview data={enrichedData as any} />
        </GlassCard>
      </div>

      {/* ── Sort Controls ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          animation: `rd-fadeUp 0.5s ${EASE} 450ms both`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={14} style={{ color: AMBER }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: CREAM }}>
            Member Drift Cards
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 20,
              color: MUTED,
              backgroundColor: 'rgba(255,255,255,0.04)',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {sorted.length}
          </span>
        </div>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            border: `1px solid ${BORDER}`,
            background: GLASS_BG,
            backdropFilter: 'blur(12px)',
            color: MUTED,
            fontFamily: 'inherit',
            transition: `all 0.3s ${EASE}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${AMBER}30`;
            e.currentTarget.style.color = CREAM;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = BORDER;
            e.currentTarget.style.color = MUTED;
          }}
        >
          <ArrowUpDown size={12} />
          {sortAsc ? 'Most Focused First' : 'Most Drifted First'}
        </button>
      </div>

      {/* ── Drift Cards Grid ── */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {sorted.map((item, i) => {
          const member = item.member!;
          const isWarning = item.driftScore < 50;
          const isModerate = item.driftScore >= 50 && item.driftScore < 80;
          const inSeat = item.activities.filter((a) => a.type === 'in-seat');
          const outSeat = item.activities.filter((a) => a.type === 'out-of-seat');
          const driftPct = 100 - item.driftScore;
          const isExpanded = expandedCard === item.id;
          const isHovered = hoveredCard === item.id;
          const trendDiff = item.driftScore - item.prevDriftScore;
          const color = scoreColor(item.driftScore);
          const LabelIcon = scoreLabelIcon(item.driftScore);
          const sparkData = sparklines[item.id] || [];
          const cardDelay = 500 + i * 70;

          return (
            <div
              key={item.id}
              style={{
                animation: `rd-fadeUp 0.5s ${EASE} ${cardDelay}ms both`,
                position: 'relative',
              }}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Pulsing alert indicator for high-drift */}
              {isWarning && (
                <div
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: DANGER,
                    zIndex: 10,
                    animation: 'rd-pulseAlert 2s ease-in-out infinite',
                    border: `2px solid ${BG}`,
                  }}
                />
              )}

              <div
                className="glow-card card-interactive"
                style={{
                  background: GLASS_BG,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${isWarning ? 'rgba(224,96,96,0.3)' : isExpanded ? BORDER2 : GLASS_BORDER}`,
                  borderRadius: 16,
                  transition: `all 0.4s ${EASE}`,
                  overflow: 'hidden',
                  ...(isHovered ? {
                    borderColor: isWarning ? 'rgba(224,96,96,0.45)' : `${color}30`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${color}10`,
                    transform: 'translateY(-3px)',
                  } : {}),
                }}
              >
                {/* Top colored accent line */}
                <div
                  style={{
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
                    opacity: isHovered ? 1 : 0,
                    transition: `opacity 0.4s ${EASE}`,
                  }}
                />

                <div style={{ padding: '20px 22px' }}>
                  {/* ── Card Header ── */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: 14,
                      marginBottom: 14,
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                  >
                    {/* Avatar with ring */}
                    <div style={{ position: 'relative' }}>
                      <DriftRing score={item.driftScore} size={56} strokeWidth={3} delay={cardDelay + 200} showLabel={false} />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 8,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: BG,
                          background: avatarGradient(member.color),
                        }}
                      >
                        {member.avatar}
                      </div>
                    </div>

                    {/* Name + role + badges */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: CREAM }}>{member.name}</span>
                        {isWarning && <AlertBadge label="High Drift" delay={cardDelay + 300} />}
                        {trendDiff !== 0 && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 20,
                              color: trendDiff > 0 ? SAGE : DANGER,
                              backgroundColor: trendDiff > 0 ? 'rgba(107,143,113,0.12)' : 'rgba(224,96,96,0.12)',
                              animation: `rd-scaleIn 0.3s ${EASE} ${cardDelay + 400}ms both`,
                            }}
                          >
                            {trendDiff > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                            {trendDiff > 0 ? '+' : ''}{trendDiff}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: MUTED, margin: '3px 0 0' }}>{member.role}</p>
                    </div>

                    {/* Score + sparkline column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '8px 14px',
                          borderRadius: 12,
                          background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                          border: `1px solid ${color}20`,
                        }}
                      >
                        <AnimatedNumber value={item.driftScore} color={color} size={22} delay={cardDelay + 100} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                          <LabelIcon size={8} style={{ color }} />
                          <span style={{ fontSize: 8, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {scoreLabel(item.driftScore)}
                          </span>
                        </div>
                      </div>
                      <Sparkline data={sparkData} width={70} height={22} color={color} delay={cardDelay + 300} />
                    </div>
                  </div>

                  {/* Role description */}
                  <p style={{ fontSize: 11, color: DIM, lineHeight: 1.6, margin: '0 0 14px', fontStyle: 'italic' }}>
                    {member.roleOneSentence}
                  </p>

                  {/* ── Drift Meter ── */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Drift Meter
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: 'var(--font-mono, monospace)' }}>
                        {driftPct}% out-of-seat
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        overflow: 'hidden',
                        display: 'flex',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${item.driftScore}%`,
                          background: `linear-gradient(90deg, ${SAGE}60, ${SAGE}90)`,
                          borderRadius: '4px 0 0 4px',
                          transition: `width 0.8s ${EASE}`,
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)`,
                            backgroundSize: '200% 100%',
                            animation: 'rd-shimmer 3s ease-in-out infinite',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          height: '100%',
                          width: `${driftPct}%`,
                          background: `linear-gradient(90deg, ${isWarning ? DANGER : GOLD}50, ${isWarning ? DANGER : GOLD}80)`,
                          borderRadius: '0 4px 4px 0',
                          transition: `width 0.8s ${EASE}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Category Domain Tags ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* In-Seat */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <CheckCircle2 size={11} style={{ color: SAGE }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          In-Seat ({inSeat.length})
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {inSeat.map((a, j) => (
                          <DomainTag key={j} label={a.label} type={a.type} hours={a.hoursPerWeek} delay={cardDelay + 200 + j * 40} />
                        ))}
                      </div>
                    </div>

                    {/* Out-of-Seat */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <AlertTriangle size={11} style={{ color: GOLD }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Out-of-Seat ({outSeat.length})
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {outSeat.length === 0 ? (
                          <div
                            style={{
                              fontSize: 11,
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: `linear-gradient(135deg, ${SAGE}06, ${SAGE}02)`,
                              color: DIM,
                              fontStyle: 'italic',
                              border: `1px solid ${SAGE}10`,
                            }}
                          >
                            None detected
                          </div>
                        ) : (
                          outSeat.map((a, j) => (
                            <DomainTag key={j} label={a.label} type={a.type} hours={a.hoursPerWeek} delay={cardDelay + 200 + j * 40} />
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Expanded Section ── */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: `1px solid ${BORDER}`,
                        animation: `rd-expandIn 0.5s ${EASE} both`,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Role Comparison panels */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <Eye size={11} style={{ color: MUTED }} />
                          <span style={{ fontSize: 9, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Role Comparison
                          </span>
                        </div>
                        <RoleComparison member={member} activities={item.activities} delay={100} />
                      </div>

                      {/* Weekly hours breakdown */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <BarChart3 size={11} style={{ color: MUTED }} />
                          <span style={{ fontSize: 9, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Weekly Hours Breakdown
                          </span>
                        </div>
                        <ActivityBarChart activities={item.activities} delay={200} />
                      </div>

                      {/* Recommendation card */}
                      {item.recommendation && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: '14px 16px',
                            borderRadius: 12,
                            background: `linear-gradient(135deg, ${GOLD}08, ${GOLD}03)`,
                            border: `1px solid ${GOLD}20`,
                            animation: `rd-fadeUp 0.5s ${EASE} 300ms both`,
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              backgroundColor: `${GOLD}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Lightbulb size={14} style={{ color: GOLD }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                              Recommendation
                            </div>
                            <p style={{ fontSize: 12, color: '#d8cfc4', margin: 0, lineHeight: 1.6 }}>
                              {item.recommendation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Warning Banner (collapsed) */}
                  {isWarning && !isExpanded && (
                    <div
                      style={{
                        marginTop: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, rgba(224,96,96,0.08), rgba(224,96,96,0.03))',
                        border: '1px solid rgba(224,96,96,0.2)',
                        animation: `rd-fadeUp 0.4s ${EASE} ${cardDelay + 400}ms both`,
                      }}
                    >
                      <AlertTriangle size={12} style={{ color: DANGER, animation: 'rd-pulseGlow 2s ease-in-out infinite' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: DANGER }}>
                        Significant role drift detected. Consider role clarity conversation.
                      </span>
                    </div>
                  )}

                  {/* Expand toggle */}
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 16px',
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: `1px solid ${BORDER}`,
                        background: 'transparent',
                        color: DIM,
                        fontFamily: 'inherit',
                        transition: `all 0.3s ${EASE}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${color}30`;
                        e.currentTarget.style.color = color;
                        e.currentTarget.style.backgroundColor = `${color}08`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = BORDER;
                        e.currentTarget.style.color = DIM;
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {isExpanded ? 'Show Less' : 'Full Analysis'}
                      <ChevronRight
                        size={10}
                        style={{
                          transition: `transform 0.3s ${EASE}`,
                          transform: isExpanded ? 'rotate(90deg)' : 'none',
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recommendations Summary ── */}
      {enrichedData.filter((d) => d.recommendation).length > 0 && (
        <GlassCard
          delay={800}
          hover={false}
          style={{ padding: 24, marginTop: 28 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${GOLD}20, ${AMBER}15)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lightbulb size={16} style={{ color: GOLD }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: CREAM }}>Action Recommendations</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
                color: GOLD,
                backgroundColor: `${GOLD}15`,
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {enrichedData.filter((d) => d.recommendation).length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enrichedData
              .filter((d) => d.recommendation)
              .sort((a, b) => a.driftScore - b.driftScore)
              .map((item, i) => {
                const color = scoreColor(item.driftScore);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '14px 18px',
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${color}08, ${color}03)`,
                      border: `1px solid ${color}15`,
                      animation: `rd-fadeUp 0.4s ${EASE} ${850 + i * 60}ms both`,
                      transition: `all 0.3s ${EASE}`,
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(6px)';
                      e.currentTarget.style.borderColor = `${color}30`;
                      e.currentTarget.style.boxShadow = `0 4px 16px ${color}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = `${color}15`;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <DriftRing score={item.driftScore} size={40} strokeWidth={2.5} delay={900 + i * 60} showLabel={false} />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 6,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 8,
                          fontWeight: 700,
                          color: BG,
                          background: avatarGradient(item.member!.color),
                        }}
                      >
                        {item.member!.avatar}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: CREAM }}>{item.member!.name}</span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 20,
                            color,
                            backgroundColor: `${color}15`,
                            fontFamily: 'var(--font-mono, monospace)',
                          }}
                        >
                          {item.driftScore}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                        {item.recommendation}
                      </p>
                    </div>

                    <ArrowRight size={14} style={{ color: BORDER2, flexShrink: 0, marginTop: 6 }} />
                  </div>
                );
              })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
