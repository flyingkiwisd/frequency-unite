'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Sprout,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Zap,
  Layers,
  Signal,
  FlaskConical,
  Clock,
  Download,
  Activity,
  Users,
  Target,
  MessageSquarePlus,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  ArrowRight,
  Crown,
  Shield,
  Hexagon,
  Trophy,
  Sparkles,
  GitCompareArrows,
  TrendingUp,
  X,
} from 'lucide-react';
import { exportPdf } from '@/lib/data';
import type { Node } from '@/lib/data';
import { useFrequencyData } from '@/lib/supabase/DataProvider';

// ─── CSS Keyframes injection ───

const NODES_KEYFRAMES_ID = 'nodes-view-keyframes';

function injectNodesKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(NODES_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = NODES_KEYFRAMES_ID;
  style.textContent = `
    @keyframes nv-fade-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes nv-fade-up-stagger {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes nv-progress-fill {
      from { width: 0%; }
    }
    @keyframes nv-progress-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes nv-pulse-dot {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.3); }
    }
    @keyframes nv-glow-breathe {
      0%, 100% { box-shadow: 0 0 0px transparent; }
      50% { box-shadow: var(--nv-glow-shadow); }
    }
    @keyframes nv-connection-dash {
      to { stroke-dashoffset: -30; }
    }
    @keyframes nv-spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes nv-drawLine {
      from { stroke-dashoffset: 1000; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes nv-nodeGlow {
      0%, 100% { filter: drop-shadow(0 0 4px var(--nv-node-glow-color, rgba(107,143,113,0.3))); }
      50% { filter: drop-shadow(0 0 14px var(--nv-node-glow-color, rgba(107,143,113,0.6))); }
    }
    @keyframes nv-nodeGlow-steady {
      0%, 100% { filter: drop-shadow(0 0 6px var(--nv-node-glow-color, rgba(107,143,113,0.4))); }
      50% { filter: drop-shadow(0 0 10px var(--nv-node-glow-color, rgba(107,143,113,0.5))); }
    }
    @keyframes nv-nodeGlow-dim {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(239,68,68,0.2)); opacity: 0.5; }
      50% { filter: drop-shadow(0 0 6px rgba(239,68,68,0.35)); opacity: 0.65; }
    }
    @keyframes nv-healthPulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }
    @keyframes nv-gaugeArc {
      from { stroke-dasharray: 0 251; }
    }
    @keyframes nv-gaugeArc-lg {
      from { stroke-dasharray: 0 213.6; }
    }
    @keyframes nv-countUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes nv-expandIn {
      from { opacity: 0; max-height: 0; transform: translateY(-8px); }
      to { opacity: 1; max-height: 800px; transform: translateY(0); }
    }
    @keyframes nv-headerRing {
      0% { stroke-dasharray: 0 150.8; }
    }
    @keyframes nv-sparkline {
      0% { opacity: 0; transform: scaleY(0); }
      100% { opacity: 0.08; transform: scaleY(1); }
    }
    @keyframes nv-bar-fill {
      from { width: 0%; }
    }
    @keyframes nv-card-glow {
      0%, 100% { box-shadow: 0 0 0px transparent, inset 0 1px 0 rgba(255,255,255,0.02); }
      50% { box-shadow: var(--nv-card-glow, 0 0 20px rgba(107,143,113,0.08)), inset 0 1px 0 rgba(255,255,255,0.04); }
    }
    @keyframes nv-badge-pop {
      0% { opacity: 0; transform: scale(0.6); }
      60% { transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes nv-diagram-glow {
      0%, 100% { box-shadow: inset 0 0 30px rgba(139,92,246,0.03), 0 0 40px rgba(139,92,246,0.02); }
      50% { box-shadow: inset 0 0 50px rgba(139,92,246,0.06), 0 0 60px rgba(139,92,246,0.04); }
    }
    @keyframes nv-slider-glow {
      0%, 100% { box-shadow: 0 0 4px var(--nv-slider-color, #d4a574); }
      50% { box-shadow: 0 0 10px var(--nv-slider-color, #d4a574), 0 0 20px color-mix(in srgb, var(--nv-slider-color, #d4a574), transparent 60%); }
    }
    @keyframes nv-ring-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes nv-ring-fill {
      from { stroke-dasharray: 0 264; }
    }
    @keyframes nv-hex-breathe {
      0%, 100% { transform: scale(1); opacity: 0.06; }
      50% { transform: scale(1.05); opacity: 0.1; }
    }
    @keyframes nv-status-pulse {
      0%, 100% { box-shadow: 0 0 4px var(--nv-status-color, #6b8f71); }
      50% { box-shadow: 0 0 12px var(--nv-status-color, #6b8f71), 0 0 24px color-mix(in srgb, var(--nv-status-color, #6b8f71), transparent 60%); }
    }
    @keyframes nv-interconnect-dash {
      to { stroke-dashoffset: -20; }
    }
    @keyframes nv-heartbeat {
      0%, 100% { transform: scale(1); }
      14% { transform: scale(1.12); }
      28% { transform: scale(1); }
      42% { transform: scale(1.08); }
      56% { transform: scale(1); }
    }
    @keyframes nv-flatline {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 0.15; }
    }
    @keyframes nv-flatline-dash {
      to { stroke-dashoffset: -16; }
    }
    @keyframes nv-particle-flow {
      0% { offset-distance: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { offset-distance: 100%; opacity: 0; }
    }
    @keyframes nv-celebrate-burst {
      0% { transform: scale(0); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.8; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    @keyframes nv-celebrate-confetti {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(-60px) rotate(720deg); opacity: 0; }
    }
    @keyframes nv-trophy-glow {
      0%, 100% { filter: drop-shadow(0 0 6px rgba(212,165,116,0.4)); }
      50% { filter: drop-shadow(0 0 16px rgba(212,165,116,0.8)); }
    }
    @keyframes nv-notw-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes nv-sparkline-draw {
      from { stroke-dashoffset: 200; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes nv-compare-slide-in {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes nv-slider-tooltip {
      from { opacity: 0; transform: translateX(-50%) translateY(4px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes nv-dep-flow {
      0% { stroke-dashoffset: 24; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes nv-dep-pulse {
      0%, 100% { opacity: 0.4; r: 3; }
      50% { opacity: 1; r: 5; }
    }
    /* Custom range slider styling */
    input[type="range"].nv-premium-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #1e2638;
      outline: none;
      margin-top: 8px;
      cursor: pointer;
    }
    input[type="range"].nv-premium-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--nv-slider-color, #d4a574);
      cursor: pointer;
      border: 2px solid #0b0d14;
      box-shadow: 0 0 8px var(--nv-slider-color, #d4a574), 0 0 16px color-mix(in srgb, var(--nv-slider-color, #d4a574), transparent 60%);
      transition: box-shadow 0.2s ease, transform 0.15s ease;
    }
    input[type="range"].nv-premium-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 0 12px var(--nv-slider-color, #d4a574), 0 0 24px color-mix(in srgb, var(--nv-slider-color, #d4a574), transparent 50%);
    }
    input[type="range"].nv-premium-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--nv-slider-color, #d4a574);
      cursor: pointer;
      border: 2px solid #0b0d14;
      box-shadow: 0 0 8px var(--nv-slider-color, #d4a574);
    }
    input[type="range"].nv-premium-slider:active::-webkit-slider-thumb {
      transform: scale(1.25);
      box-shadow: 0 0 14px var(--nv-slider-color, #d4a574), 0 0 28px color-mix(in srgb, var(--nv-slider-color, #d4a574), transparent 40%);
    }
  `;
  document.head.appendChild(style);
}

// ─── Icon mapping ───
const iconMap: Record<string, React.ElementType> = {
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Sprout,
  BookOpen,
};

// ─── Color extraction ───

function getNodeHex(node: Node): string {
  const colorMap: Record<string, string> = {
    'text-violet-400': '#a78bfa',
    'text-emerald-400': '#34d399',
    'text-amber-400': '#fbbf24',
    'text-orange-400': '#fb923c',
    'text-teal-400': '#2dd4bf',
    'text-purple-400': '#c084fc',
  };
  return colorMap[node.color] || '#d4a574';
}

function getNodeGradient(node: Node): string {
  const gradMap: Record<string, [string, string]> = {
    'text-violet-400': ['#a78bfa', '#6366f1'],
    'text-emerald-400': ['#34d399', '#22c55e'],
    'text-amber-400': ['#fbbf24', '#f59e0b'],
    'text-orange-400': ['#fb923c', '#ef4444'],
    'text-teal-400': ['#2dd4bf', '#06b6d4'],
    'text-purple-400': ['#c084fc', '#a855f7'],
  };
  const [c1, c2] = gradMap[node.color] || ['#d4a574', '#c4925a'];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

function getMemberColor(memberId: string, teamMembers: { id: string; color: string }[]): string {
  const member = teamMembers.find((m) => m.id === memberId);
  if (!member) return '#a09888';
  const colorMap: Record<string, string> = {
    'bg-amber-500': '#f59e0b',
    'bg-rose-400': '#fb7185',
    'bg-violet-500': '#8b5cf6',
    'bg-sky-400': '#38bdf8',
    'bg-emerald-500': '#10b981',
    'bg-purple-500': '#a855f7',
    'bg-pink-400': '#f472b6',
    'bg-teal-400': '#2dd4bf',
    'bg-amber-400': '#fbbf24',
    'bg-green-500': '#22c55e',
    'bg-lime-500': '#84cc16',
    'bg-orange-500': '#f97316',
    'bg-indigo-400': '#818cf8',
    'bg-slate-400': '#94a3b8',
  };
  return colorMap[member.color] || '#a09888';
}

// ─── Health category helper ───
function healthCategory(score: number): 'healthy' | 'at-risk' | 'inactive' {
  if (score >= 70) return 'healthy';
  if (score >= 45) return 'at-risk';
  return 'inactive';
}

function healthGlowColor(score: number): string {
  const cat = healthCategory(score);
  if (cat === 'healthy') return '#6b8f71';
  if (cat === 'at-risk') return '#d4a574';
  return '#ef4444';
}

// ─── Status / Priority helpers ───
function statusStyle(status: Node['status']): { bg: string; text: string; label: string } {
  switch (status) {
    case 'active':
      return { bg: 'rgba(107, 143, 113, 0.15)', text: '#6b8f71', label: 'Active' };
    case 'building':
      return { bg: 'rgba(212, 165, 116, 0.15)', text: '#d4a574', label: 'Building' };
    case 'pilot':
      return { bg: 'rgba(96, 165, 250, 0.15)', text: '#60a5fa', label: 'Pilot' };
    case 'planned':
      return { bg: 'rgba(107, 99, 88, 0.15)', text: '#6b6358', label: 'Planned' };
    default:
      return { bg: 'rgba(107, 99, 88, 0.15)', text: '#6b6358', label: 'Unknown' };
  }
}

function priorityStyle(priority: Node['priority']): { bg: string; text: string; label: string } {
  switch (priority) {
    case 'critical':
      return { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', label: 'Critical' };
    case 'high':
      return { bg: 'rgba(212, 165, 116, 0.12)', text: '#d4a574', label: 'High' };
    case 'medium':
      return { bg: 'rgba(96, 165, 250, 0.12)', text: '#60a5fa', label: 'Medium' };
    default:
      return { bg: 'rgba(107, 99, 88, 0.12)', text: '#6b6358', label: 'Normal' };
  }
}

function statusIcon(status: Node['status']): React.ElementType {
  switch (status) {
    case 'active':
      return Zap;
    case 'building':
      return Layers;
    case 'pilot':
      return FlaskConical;
    case 'planned':
      return Clock;
    default:
      return Clock;
  }
}

// ─── Node Maturity Data ───
const nodeMaturity: Record<string, { level: number; label: string }> = {
  'map-node': { level: 3, label: 'Active work, regular updates' },
  'bioregions-node': { level: 2, label: 'OKRs set, team identified' },
  'capital-node': { level: 3, label: 'Active work, regular updates' },
  'megaphone-node': { level: 2, label: 'OKRs set, team identified' },
  'cap2-node': { level: 1, label: 'Lead assigned, purpose defined' },
  'thesis-node': { level: 3, label: 'Active work, regular updates' },
};

const maturityKeyMap: Record<string, string> = {
  map: 'map-node',
  bioregions: 'bioregions-node',
  capital: 'capital-node',
  megaphone: 'megaphone-node',
  capitalism2: 'cap2-node',
  thesis: 'thesis-node',
};

// ─── Cross-Node Dependencies ───
const crossDeps: { from: string; to: string; label: string; strength: 'strong' | 'medium' | 'weak' }[] = [
  { from: 'Thesis of Change', to: 'Capital Node', label: 'Scoring rubric feeds deal evaluation', strength: 'strong' },
  { from: 'Capital Node', to: 'Map Node', label: 'Funded projects need coordination', strength: 'strong' },
  { from: 'Map Node', to: 'Bioregions Node', label: 'Geographic mapping informs pilots', strength: 'medium' },
  { from: 'Megaphone Node', to: 'Capital Node', label: 'Distribution amplifies funded projects', strength: 'medium' },
  { from: 'Capitalism 2.0', to: 'Thesis of Change', label: 'Theory informs investment thesis', strength: 'weak' },
];

const strengthColors: Record<string, string> = {
  strong: '#6b8f71',
  medium: '#d4a574',
  weak: '#ef4444',
};

// ─── Node Health Scores ───
const nodeHealthScores: Record<string, number> = {
  map: 72,
  bioregions: 58,
  capital: 85,
  megaphone: 48,
  capitalism2: 35,
  thesis: 78,
};

function healthColor(score: number): string {
  if (score >= 75) return '#6b8f71';
  if (score >= 50) return '#d4a574';
  return '#ef4444';
}

// ─── Node Metrics Data ───
const nodeMetrics: Record<string, { activeTasks: number; lastUpdate: string; extraContributors: number; nextMilestone: string }> = {
  map: { activeTasks: 5, lastUpdate: '2 days ago', extraContributors: 2, nextMilestone: 'MVP specs finalized' },
  bioregions: { activeTasks: 3, lastUpdate: '5 days ago', extraContributors: 1, nextMilestone: 'Nicoya Phase 1 launch' },
  capital: { activeTasks: 7, lastUpdate: '1 day ago', extraContributors: 3, nextMilestone: 'Score next 5 deals' },
  megaphone: { activeTasks: 4, lastUpdate: '4 days ago', extraContributors: 2, nextMilestone: 'Anthem production milestone' },
  capitalism2: { activeTasks: 2, lastUpdate: '8 days ago', extraContributors: 1, nextMilestone: 'DECO framework v1 doc' },
  thesis: { activeTasks: 6, lastUpdate: '1 day ago', extraContributors: 2, nextMilestone: 'Geoship criteria complete' },
};

// ─── Health Trend Sparkline Data (4 weeks) ───
const healthTrends: Record<string, number[]> = {
  map: [60, 65, 68, 72],
  bioregions: [50, 52, 55, 58],
  capital: [75, 78, 82, 85],
  megaphone: [55, 52, 50, 48],
  capitalism2: [40, 38, 36, 35],
  thesis: [65, 70, 74, 78],
};

// ─── Member Contribution Data (per node) ───
const memberContributions: Record<string, { memberId: string; hours: number; tasks: number }[]> = {
  map: [
    { memberId: 'james', hours: 18, tasks: 3 },
    { memberId: 'alex', hours: 12, tasks: 2 },
  ],
  bioregions: [
    { memberId: 'james', hours: 10, tasks: 2 },
    { memberId: 'sofia', hours: 8, tasks: 1 },
  ],
  capital: [
    { memberId: 'james', hours: 22, tasks: 4 },
    { memberId: 'alex', hours: 14, tasks: 3 },
  ],
  megaphone: [
    { memberId: 'maya', hours: 16, tasks: 3 },
    { memberId: 'james', hours: 6, tasks: 1 },
  ],
  capitalism2: [
    { memberId: 'james', hours: 8, tasks: 2 },
  ],
  thesis: [
    { memberId: 'james', hours: 20, tasks: 4 },
    { memberId: 'alex', hours: 10, tasks: 2 },
  ],
};

// ─── Node of the Week determination ───
function getNodeOfTheWeek(nodes: Node[]): string | null {
  if (!nodes.length) return null;
  // Composite score: health * 0.4 + progress * 0.3 + active tasks * 0.3 (normalized)
  let bestId: string | null = null;
  let bestScore = -1;
  for (const n of nodes) {
    const health = nodeHealthScores[n.id] || 0;
    const tasks = nodeMetrics[n.id]?.activeTasks || 0;
    const trend = healthTrends[n.id] || [];
    const trendDelta = trend.length >= 2 ? trend[trend.length - 1] - trend[0] : 0;
    const composite = health * 0.35 + n.progress * 0.25 + tasks * 4 + trendDelta * 0.5;
    if (composite > bestScore) {
      bestScore = composite;
      bestId = n.id;
    }
  }
  return bestId;
}

// ─── localStorage key ───
const UPDATES_STORAGE_KEY = 'frequency-node-updates';

interface NodeUpdate {
  nodeId: string;
  text: string;
  timestamp: number;
}

function loadUpdates(): NodeUpdate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(UPDATES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUpdates(updates: NodeUpdate[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(UPDATES_STORAGE_KEY, JSON.stringify(updates));
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── AnimatedNumber: count-up effect ───
function AnimatedNumber({ value, duration = 1200, suffix = '' }: { value: number; duration?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = display;
    const start = performance.now();
    const from = startRef.current ?? 0;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <>{display}{suffix}</>;
}

// ─── Sparkline decoration (CSS-only behind metrics) ───
function SparklineDecoration({ color, height = 32 }: { color: string; height?: number }) {
  const bars = [0.3, 0.6, 0.45, 0.8, 0.55, 0.7, 0.4, 0.9, 0.5, 0.65];
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      right: 8,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 2,
      height,
      opacity: 0.08,
      pointerEvents: 'none',
    }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h * height,
            backgroundColor: color,
            borderRadius: 1,
            transformOrigin: 'bottom',
            animation: `nv-sparkline 0.6s ease ${i * 0.06}s both`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Health Trend Sparkline (mini SVG line chart) ───
function HealthTrendSparkline({ data, color, width = 80, height = 28 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const pathD = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  const areaD = pathD + ` L ${width} ${height} L 0 ${height} Z`;
  const totalLen = data.length * 40;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sparkfill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkfill-${color.replace('#', '')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLen}
        strokeDashoffset={totalLen}
        style={{ animation: `nv-sparkline-draw 1.2s ease 0.3s forwards` }}
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2.5"
        fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}

// ─── Member Contribution Stacked Bar ───
function MemberContributionBar({
  contributions,
  teamMembers,
}: {
  contributions: { memberId: string; hours: number; tasks: number }[];
  teamMembers: { id: string; name: string; color: string }[];
}) {
  if (!contributions || contributions.length === 0) return null;
  const totalHours = contributions.reduce((s, c) => s + c.hours, 0);
  if (totalHours === 0) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Users size={11} style={{ color: '#6b6358' }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contribution Breakdown</span>
      </div>
      {/* Stacked bar */}
      <div style={{
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        backgroundColor: '#1e2638',
        marginBottom: 6,
      }}>
        {contributions.map((c, i) => {
          const pct = (c.hours / totalHours) * 100;
          const memberColor = getMemberColor(c.memberId, teamMembers);
          return (
            <div
              key={c.memberId}
              style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: memberColor,
                opacity: 0.8,
                borderRight: i < contributions.length - 1 ? '1px solid #0b0d14' : 'none',
                animation: `nv-bar-fill 0.8s ease ${0.2 + i * 0.1}s both`,
                position: 'relative',
              }}
              title={`${teamMembers.find(m => m.id === c.memberId)?.name || c.memberId}: ${c.hours}h, ${c.tasks} tasks`}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {contributions.map((c) => {
          const member = teamMembers.find(m => m.id === c.memberId);
          const memberColor = getMemberColor(c.memberId, teamMembers);
          return (
            <div key={c.memberId} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: memberColor }} />
              <span style={{ fontSize: 10, color: '#a09888' }}>
                {member?.name?.split(' ')[0] || c.memberId}
              </span>
              <span style={{ fontSize: 9, color: '#6b6358' }}>{c.hours}h</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Celebration Burst (100% animation) ───
function CelebrationBurst({ color, active }: { color: string; active: boolean }) {
  const [show, setShow] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (active && !hasTriggered) {
      setShow(true);
      setHasTriggered(true);
      const timer = setTimeout(() => setShow(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [active, hasTriggered]);

  if (!show) return null;

  const confettiColors = [color, '#d4a574', '#8b5cf6', '#6b8f71', '#f0ebe4'];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 10,
      overflow: 'hidden',
      borderRadius: 20,
    }}>
      {/* Central burst ring */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 60,
        height: 60,
        marginLeft: -30,
        marginTop: -30,
        borderRadius: '50%',
        border: `3px solid ${color}`,
        animation: 'nv-celebrate-burst 1s ease-out forwards',
      }} />
      {/* Confetti particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const dist = 30 + Math.random() * 40;
        const cColor = confettiColors[i % confettiColors.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: i % 2 === 0 ? 4 : 6,
              height: i % 2 === 0 ? 6 : 4,
              backgroundColor: cColor,
              borderRadius: 1,
              transform: `rotate(${angle}deg) translateY(-${dist}px)`,
              animation: `nv-celebrate-confetti ${0.8 + Math.random() * 0.6}s ease-out ${i * 0.04}s forwards`,
              opacity: 0.9,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Node Comparison Panel ───
function NodeComparisonPanel({
  nodeA,
  nodeB,
  teamMembers,
  onClose,
}: {
  nodeA: Node;
  nodeB: Node;
  teamMembers: { id: string; name: string; color: string }[];
  onClose: () => void;
}) {
  const metrics = [
    { label: 'Progress', valA: nodeA.progress, valB: nodeB.progress, suffix: '%' },
    { label: 'Health', valA: nodeHealthScores[nodeA.id] || 0, valB: nodeHealthScores[nodeB.id] || 0, suffix: '' },
    { label: 'Active Tasks', valA: nodeMetrics[nodeA.id]?.activeTasks || 0, valB: nodeMetrics[nodeB.id]?.activeTasks || 0, suffix: '' },
    { label: 'Contributors', valA: nodeA.leads.length + (nodeMetrics[nodeA.id]?.extraContributors || 0), valB: nodeB.leads.length + (nodeMetrics[nodeB.id]?.extraContributors || 0), suffix: '' },
    { label: 'Maturity', valA: nodeMaturity[maturityKeyMap[nodeA.id]]?.level || 0, valB: nodeMaturity[maturityKeyMap[nodeB.id]]?.level || 0, suffix: '/5' },
  ];
  const colorA = getNodeHex(nodeA);
  const colorB = getNodeHex(nodeB);
  const trendA = healthTrends[nodeA.id] || [];
  const trendB = healthTrends[nodeB.id] || [];

  return (
    <div className="card-premium" style={{
      backgroundColor: 'rgba(19, 23, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(30, 38, 56, 0.8)',
      borderRadius: 16,
      padding: '24px 28px',
      marginBottom: 24,
      animation: 'nv-compare-slide-in 0.4s ease both',
      position: 'relative',
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid rgba(30, 38, 56, 0.6)',
          backgroundColor: 'rgba(30, 38, 56, 0.4)',
          color: '#a09888',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontFamily: 'inherit',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(30, 38, 56, 0.6)'; e.currentTarget.style.color = '#a09888'; }}
      >
        <X size={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <GitCompareArrows size={16} style={{ color: '#8b5cf6' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>Node Comparison</span>
      </div>

      {/* Header row with node names and sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div />
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colorA }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: colorA }}>{nodeA.shortName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HealthTrendSparkline data={trendA} color={colorA} width={70} height={22} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colorB }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: colorB }}>{nodeB.shortName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HealthTrendSparkline data={trendB} color={colorB} width={70} height={22} />
          </div>
        </div>
      </div>

      {/* Comparison rows */}
      {metrics.map((m, idx) => {
        const better = m.valA > m.valB ? 'A' : m.valB > m.valA ? 'B' : 'tie';
        return (
          <div
            key={m.label}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr',
              gap: 16,
              padding: '10px 0',
              borderBottom: idx < metrics.length - 1 ? '1px solid rgba(30, 38, 56, 0.4)' : 'none',
              animation: `nv-fade-up 0.3s ease ${idx * 0.05}s both`,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b6358' }}>{m.label}</span>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: better === 'A' ? colorA : '#a09888',
              }}>
                {m.valA}{m.suffix}
              </span>
              {better === 'A' && <TrendingUp size={12} style={{ color: '#6b8f71', marginLeft: 4, verticalAlign: 'middle' }} />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: better === 'B' ? colorB : '#a09888',
              }}>
                {m.valB}{m.suffix}
              </span>
              {better === 'B' && <TrendingUp size={12} style={{ color: '#6b8f71', marginLeft: 4, verticalAlign: 'middle' }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Circular Progress Ring Component ───
function CircularProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color,
  glowColor,
  animated = true,
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  glowColor?: string;
  animated?: boolean;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillAmount = (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e2638"
          strokeWidth={strokeWidth}
        />
        {/* Glow ring */}
        {glowColor && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={glowColor}
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
            strokeDasharray={`${fillAmount} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity={0.12}
            style={{ filter: 'blur(4px)' }}
          />
        )}
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${fillAmount} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dasharray 0.8s ease',
            ...(animated ? {
              animation: `nv-ring-fill 1.2s ease both`,
            } : {}),
          }}
        />
      </svg>
      {/* Center content */}
      {children && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Node Health Status Indicator ───
function NodeHealthIndicator({ score, size = 'small' }: { score: number; size?: 'small' | 'large' }) {
  const cat = healthCategory(score);
  const color = healthGlowColor(score);
  const labels = { healthy: 'Healthy', 'at-risk': 'At Risk', inactive: 'Dormant' };

  if (size === 'large') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 20,
        backgroundColor: `${color}12`,
        border: `1px solid ${color}25`,
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}60`,
          animation: cat !== 'healthy' ? 'nv-pulse-dot 2s ease-in-out infinite' : 'none',
          ['--nv-status-color' as string]: color,
        }} />
        <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: '0.02em' }}>
          {labels[cat]}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>
          {score}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: color,
      boxShadow: `0 0 8px ${color}60`,
      animation: cat !== 'healthy' ? 'nv-pulse-dot 2s ease-in-out infinite' : 'none',
    }} />
  );
}

// ─── Hexagonal Background SVG ───
function HexagonalBackground({ color, opacity = 0.06 }: { color: string; opacity?: number }) {
  return (
    <svg
      style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 160,
        height: 160,
        opacity,
        pointerEvents: 'none',
        animation: 'nv-hex-breathe 6s ease-in-out infinite',
      }}
      viewBox="0 0 160 160"
    >
      <polygon
        points="80,10 140,40 140,100 80,130 20,100 20,40"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
      <polygon
        points="80,25 125,48 125,92 80,115 35,92 35,48"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />
      <polygon
        points="80,40 110,56 110,84 80,100 50,84 50,56"
        fill={color}
        opacity="0.08"
      />
    </svg>
  );
}

// ─── Node Connection Diagram SVG ───

function NodeConnectionDiagram() {
  const { nodes } = useFrequencyData();
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const svgWidth = 800;
  const svgHeight = 200;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;
  const nodeRadius = 140;

  // Positions for 6 nodes in a horizontal arc
  const nodePositions = nodes.map((node, i) => {
    const angle = Math.PI + ((i / (nodes.length - 1)) * Math.PI);
    return {
      node,
      x: cx + Math.cos(angle) * nodeRadius * 1.8,
      y: cy + Math.sin(angle) * nodeRadius * 0.5 + 10,
    };
  });

  // Cross-node dependency connections mapped to indices
  const connections: { from: number; to: number; strength: string }[] = [
    { from: 5, to: 2, strength: 'strong' }, // Thesis -> Capital
    { from: 2, to: 0, strength: 'strong' }, // Capital -> Map
    { from: 0, to: 1, strength: 'medium' }, // Map -> Bioregions
    { from: 3, to: 2, strength: 'medium' }, // Megaphone -> Capital
    { from: 4, to: 5, strength: 'weak' },   // Cap2.0 -> Thesis
  ];

  // Determine which connections involve the hovered node
  const isConnectionHighlighted = (conn: { from: number; to: number }) => {
    if (hoveredNode === null) return false;
    return conn.from === hoveredNode || conn.to === hoveredNode;
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(19, 23, 32, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(30, 38, 56, 0.6)',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
        overflow: 'hidden',
        position: 'relative',
        animation: 'nv-diagram-glow 6s ease-in-out infinite',
      }}
    >
      {/* Subtle glow behind the entire diagram */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '70%',
        height: '70%',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.04), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, position: 'relative', zIndex: 1 }}>
        <Signal size={16} style={{ color: '#8b5cf6' }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Node Interconnections</h3>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {(['strong', 'medium', 'weak'] as const).map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 2, borderRadius: 1, backgroundColor: strengthColors[s] }} />
              <span style={{ fontSize: 10, color: '#6b6358', textTransform: 'capitalize' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: 'block', position: 'relative', zIndex: 1 }}
      >
        <defs>
          {connections.map((conn, i) => {
            const color = strengthColors[conn.strength];
            return (
              <linearGradient key={i} id={`nv-conn-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                <stop offset="50%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.6" />
              </linearGradient>
            );
          })}
          {/* Glow filters for nodes */}
          {nodePositions.map(({ node }, i) => {
            const score = nodeHealthScores[node.id] || 0;
            const glowCol = healthGlowColor(score);
            return (
              <filter key={`glow-${i}`} id={`nv-node-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor={glowCol} floodOpacity="0.5" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            );
          })}
        </defs>

        {/* Connection lines with animated draw-on */}
        {connections.map((conn, i) => {
          const from = nodePositions[conn.from];
          const to = nodePositions[conn.to];
          if (!from || !to) return null;
          const color = strengthColors[conn.strength];
          const mx = (from.x + to.x) / 2;
          const my = Math.min(from.y, to.y) - 30 - i * 8;
          const isHighlighted = isConnectionHighlighted(conn);
          const isDimmed = hoveredNode !== null && !isHighlighted;

          return (
            <g key={`conn-${i}`}>
              {/* Draw-on animated path */}
              <path
                d={`M ${from.x} ${from.y - 20} Q ${mx} ${my} ${to.x} ${to.y - 20}`}
                fill="none"
                stroke={color}
                strokeWidth={isHighlighted ? 3 : conn.strength === 'strong' ? 2 : 1.5}
                opacity={isDimmed ? 0.1 : isHighlighted ? 0.7 : 0.35}
                strokeDasharray={conn.strength === 'weak' ? '4 4' : conn.strength === 'medium' ? '6 3' : 'none'}
                style={{
                  transition: 'opacity 0.3s ease, stroke-width 0.3s ease',
                  ...(conn.strength !== 'weak' && conn.strength !== 'medium' ? {
                    strokeDasharray: '1000',
                    strokeDashoffset: '0',
                    animation: `nv-drawLine 1.5s ease ${0.3 + i * 0.2}s both reverse`,
                    animationDirection: 'normal',
                    animationFillMode: 'backwards',
                  } : {}),
                }}
              />
              {/* Glow line behind for highlighted */}
              {isHighlighted && (
                <path
                  d={`M ${from.x} ${from.y - 20} Q ${mx} ${my} ${to.x} ${to.y - 20}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={6}
                  opacity={0.15}
                  strokeDasharray={conn.strength === 'weak' ? '4 4' : conn.strength === 'medium' ? '6 3' : 'none'}
                  style={{ filter: 'blur(3px)' }}
                />
              )}
              {/* Animated particle flow -- multiple particles */}
              {[0, 1, 2].map((pIdx) => (
                <circle key={pIdx} r={isHighlighted ? 3 : 1.5 + pIdx * 0.3} fill={color} opacity={isDimmed ? 0.1 : 0.7 - pIdx * 0.15}>
                  <animateMotion
                    dur={`${2.5 + i * 0.4 + pIdx * 0.8}s`}
                    begin={`${pIdx * 0.9}s`}
                    repeatCount="indefinite"
                    path={`M ${from.x} ${from.y - 20} Q ${mx} ${my} ${to.x} ${to.y - 20}`}
                  />
                </circle>
              ))}
              {/* Reverse-direction particle for strong connections */}
              {conn.strength === 'strong' && (
                <circle r={1.5} fill={color} opacity={isDimmed ? 0.1 : 0.4}>
                  <animateMotion
                    dur={`${4 + i * 0.3}s`}
                    begin="1.5s"
                    repeatCount="indefinite"
                    path={`M ${to.x} ${to.y - 20} Q ${mx} ${my} ${from.x} ${from.y - 20}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Node circles with health-based pulsing */}
        {nodePositions.map(({ node, x, y }, i) => {
          const color = getNodeHex(node);
          const score = nodeHealthScores[node.id] || 0;
          const cat = healthCategory(score);
          const glowCol = healthGlowColor(score);
          const isHovered = hoveredNode === i;
          const isDimmed = hoveredNode !== null && !isHovered && !connections.some(c => (c.from === i || c.to === i) && (c.from === hoveredNode || c.to === hoveredNode));

          // Determine animation based on health category
          let glowAnimation = '';
          if (cat === 'healthy') glowAnimation = 'nv-nodeGlow-steady 3s ease-in-out infinite';
          else if (cat === 'at-risk') glowAnimation = 'nv-nodeGlow 2s ease-in-out infinite';
          else glowAnimation = 'nv-nodeGlow-dim 2.5s ease-in-out infinite';

          return (
            <g
              key={node.id}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.3s ease',
                opacity: isDimmed ? 0.3 : 1,
                // CSS variable for glow color
                ['--nv-node-glow-color' as string]: `${glowCol}88`,
                animation: glowAnimation,
              }}
              onMouseEnter={() => setHoveredNode(i)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Ambient glow - bigger on hover */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 36 : 28}
                fill={glowCol}
                opacity={isHovered ? 0.12 : 0.06}
                style={{ transition: 'r 0.3s ease, opacity 0.3s ease' }}
              />

              {/* Main circle */}
              <circle
                cx={x}
                cy={y}
                r={20}
                fill="#0b0d14"
                stroke={isHovered ? glowCol : color}
                strokeWidth={isHovered ? 2.5 : 2}
                style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }}
              />

              {/* Health ring behind circle */}
              <circle
                cx={x}
                cy={y}
                r={23}
                fill="none"
                stroke={glowCol}
                strokeWidth={1.5}
                strokeDasharray={`${(score / 100) * 144.5} 144.5`}
                strokeLinecap="round"
                transform={`rotate(-90 ${x} ${y})`}
                opacity={isHovered ? 0.6 : 0.25}
                style={{ transition: 'opacity 0.3s ease' }}
              />

              {/* Heartbeat / Flatline indicator */}
              {cat === 'healthy' ? (
                <g style={{ animation: 'nv-heartbeat 1.5s ease-in-out infinite', transformOrigin: `${x}px ${y}px` }}>
                  {/* Heart shape via SVG path */}
                  <path
                    d={`M ${x} ${y - 1} c -0.5 -2.5 -5 -4 -5 -1 c 0 2 5 5 5 5 c 0 0 5 -3 5 -5 c 0 -3 -4.5 -1.5 -5 1`}
                    fill={glowCol}
                    opacity={0.7}
                  />
                </g>
              ) : cat === 'inactive' ? (
                <g>
                  {/* Flatline EKG trace */}
                  <line x1={x - 12} y1={y - 2} x2={x + 12} y2={y - 2} stroke="#ef4444" strokeWidth={1.2} opacity={0.5}
                    strokeDasharray="4 4" style={{ animation: 'nv-flatline-dash 1s linear infinite' }} />
                  <circle cx={x} cy={y - 2} r={1.5} fill="#ef4444" opacity={0.6} style={{ animation: 'nv-flatline 2s ease-in-out infinite' }} />
                </g>
              ) : (
                <circle cx={x} cy={y - 3} r={4} fill={color} opacity={0.6} style={{ animation: 'nv-pulse-dot 2s ease-in-out infinite' }} />
              )}

              {/* Label */}
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill={color}
                fontSize={8}
                fontWeight={700}
              >
                {node.shortName}
              </text>

              {/* Name below */}
              <text
                x={x}
                y={y + 38}
                textAnchor="middle"
                fill={isHovered ? '#f0ebe4' : '#a09888'}
                fontSize={10}
                fontWeight={isHovered ? 600 : 500}
                style={{ transition: 'fill 0.3s ease' }}
              >
                {node.shortName}
              </text>

              {/* Progress bar below */}
              <rect x={x - 16} y={y + 24} width={32} height={3} rx={1.5} fill="#1e2638" />
              <rect
                x={x - 16}
                y={y + 24}
                width={(node.progress / 100) * 32}
                height={3}
                rx={1.5}
                fill={color}
                opacity={0.6}
              >
                <animate attributeName="width" from="0" to={String((node.progress / 100) * 32)} dur="1s" begin="0.5s" fill="freeze" />
              </rect>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Component ───

export function NodesView() {
  const { nodes, teamMembers, updateNodeProgress } = useFrequencyData();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [updateNodeId, setUpdateNodeId] = useState<string | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [nodeUpdates, setNodeUpdates] = useState<NodeUpdate[]>([]);
  const [mounted, setMounted] = useState(false);
  const [editingProgressNodeId, setEditingProgressNodeId] = useState<string | null>(null);
  const [editingProgressValue, setEditingProgressValue] = useState<number>(0);
  const [compareNodes, setCompareNodes] = useState<[string, string] | null>(null);
  const [compareSelecting, setCompareSelecting] = useState<string | null>(null);
  const [celebratingNodeId, setCelebratingNodeId] = useState<string | null>(null);
  const [sliderTooltip, setSliderTooltip] = useState<{ value: number; visible: boolean }>({ value: 0, visible: false });
  const progressInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectNodesKeyframes();
    setMounted(true);
  }, []);

  useEffect(() => {
    setNodeUpdates(loadUpdates());
  }, []);

  // Node of the week
  const nodeOfTheWeekId = getNodeOfTheWeek(nodes);

  // Summary stats
  const activeCount = nodes.filter((n) => n.status === 'active').length;
  const buildingCount = nodes.filter((n) => n.status === 'building').length;
  const pilotCount = nodes.filter((n) => n.status === 'pilot').length;
  const totalProgress = Math.round(nodes.reduce((sum, n) => sum + n.progress, 0) / nodes.length);

  // Ecosystem health
  const overallHealth = Math.round(
    nodes.reduce((sum, n) => sum + (nodeHealthScores[n.id] || 0), 0) / nodes.length
  );
  const nodesNeedingAttention = nodes.filter((n) => (nodeHealthScores[n.id] || 0) < 50);

  const toggleExpand = (id: string) => {
    setExpandedId((prev: string | null) => (prev === id ? null : id));
  };

  const getLatestUpdate = useCallback((nodeId: string): NodeUpdate | null => {
    const filtered = nodeUpdates.filter((u) => u.nodeId === nodeId);
    if (filtered.length === 0) return null;
    return filtered.reduce((latest, u) => (u.timestamp > latest.timestamp ? u : latest), filtered[0]);
  }, [nodeUpdates]);

  const handlePostUpdate = (nodeId: string) => {
    if (!updateText.trim()) return;
    const newUpdate: NodeUpdate = {
      nodeId,
      text: updateText.trim(),
      timestamp: Date.now(),
    };
    const updated = [...nodeUpdates, newUpdate];
    setNodeUpdates(updated);
    saveUpdates(updated);
    setUpdateText('');
    setUpdateNodeId(null);
  };

  const startEditingProgress = useCallback((nodeId: string, currentProgress: number) => {
    setEditingProgressNodeId(nodeId);
    setEditingProgressValue(currentProgress);
    // Focus input after render
    setTimeout(() => progressInputRef.current?.focus(), 0);
  }, []);

  const snapToTen = useCallback((val: number): number => {
    return Math.round(val / 10) * 10;
  }, []);

  const handleSliderChange = useCallback((rawVal: number) => {
    const snapped = snapToTen(rawVal);
    setEditingProgressValue(snapped);
    setSliderTooltip({ value: snapped, visible: true });
  }, [snapToTen]);

  const commitProgress = useCallback(() => {
    if (editingProgressNodeId !== null) {
      const clamped = Math.min(100, Math.max(0, snapToTen(editingProgressValue)));
      // Trigger celebration if hitting 100%
      if (clamped === 100) {
        setCelebratingNodeId(editingProgressNodeId);
        setTimeout(() => setCelebratingNodeId(null), 2000);
      }
      updateNodeProgress(editingProgressNodeId, clamped);
      setEditingProgressNodeId(null);
      setSliderTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [editingProgressNodeId, editingProgressValue, updateNodeProgress, snapToTen]);

  const cancelEditingProgress = useCallback(() => {
    setEditingProgressNodeId(null);
    setSliderTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // Comparison mode handlers
  const startCompare = useCallback((nodeId: string) => {
    if (!compareSelecting) {
      setCompareSelecting(nodeId);
    } else if (compareSelecting !== nodeId) {
      setCompareNodes([compareSelecting, nodeId]);
      setCompareSelecting(null);
    }
  }, [compareSelecting]);

  const cancelCompare = useCallback(() => {
    setCompareSelecting(null);
    setCompareNodes(null);
  }, []);

  return (
    <div ref={containerRef} style={{ padding: 'clamp(16px, 4vw, 24px)', maxWidth: 1200, margin: '0 auto', backgroundColor: '#0b0d14', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <div
        className="noise-overlay dot-pattern"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
          animation: mounted ? 'nv-fade-up 0.5s ease both' : 'none',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(107, 143, 113, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Signal size={22} style={{ color: '#d4a574' }} />
            </div>
            <div>
              <h1 className="text-glow" style={{ fontSize: 26, fontWeight: 800, color: '#f0ebe4', margin: 0, letterSpacing: '-0.02em' }}>Node Ecosystem</h1>
              <p style={{ fontSize: 14, color: '#a09888', margin: 0 }}>
                Six interconnected nodes driving Frequency&apos;s mission forward
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(30, 38, 56, 0.6)',
            borderRadius: 8,
            overflow: 'hidden',
            backdropFilter: 'blur(8px)',
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '7px 12px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? 'rgba(212, 165, 116, 0.15)' : 'rgba(19, 23, 32, 0.8)',
                color: viewMode === 'grid' ? '#d4a574' : '#6b6358',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.25s ease',
              }}
            >
              <LayoutGrid size={14} />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '7px 12px',
                border: 'none',
                borderLeft: '1px solid rgba(30, 38, 56, 0.6)',
                backgroundColor: viewMode === 'list' ? 'rgba(212, 165, 116, 0.15)' : 'rgba(19, 23, 32, 0.8)',
                color: viewMode === 'list' ? '#d4a574' : '#6b6358',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.25s ease',
              }}
            >
              <List size={14} />
              List
            </button>
          </div>

          <button
            onClick={() => { if (containerRef.current) exportPdf(containerRef.current, 'Nodes'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid rgba(30, 38, 56, 0.6)',
              backgroundColor: 'rgba(19, 23, 32, 0.8)',
              backdropFilter: 'blur(8px)',
              color: '#a09888',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color 0.25s, color 0.25s, box-shadow 0.25s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4a57440';
              e.currentTarget.style.color = '#d4a574';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(212, 165, 116, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(30, 38, 56, 0.6)';
              e.currentTarget.style.color = '#a09888';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Download size={14} />
            Export as Image
          </button>

          {/* Compare Mode Toggle */}
          <button
            onClick={() => {
              if (compareSelecting || compareNodes) {
                cancelCompare();
              } else {
                setCompareSelecting('__waiting__');
                setCompareSelecting(null); // just activate "select first" mode
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: `1px solid ${compareSelecting ? '#8b5cf6' : 'rgba(30, 38, 56, 0.6)'}`,
              backgroundColor: compareSelecting ? 'rgba(139, 92, 246, 0.12)' : 'rgba(19, 23, 32, 0.8)',
              backdropFilter: 'blur(8px)',
              color: compareSelecting ? '#8b5cf6' : '#a09888',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color 0.25s, color 0.25s, box-shadow 0.25s, background-color 0.25s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (!compareSelecting) {
                e.currentTarget.style.borderColor = '#8b5cf640';
                e.currentTarget.style.color = '#8b5cf6';
              }
            }}
            onMouseLeave={(e) => {
              if (!compareSelecting) {
                e.currentTarget.style.borderColor = 'rgba(30, 38, 56, 0.6)';
                e.currentTarget.style.color = '#a09888';
              }
            }}
          >
            <GitCompareArrows size={14} />
            {compareSelecting ? 'Select nodes...' : compareNodes ? 'Comparing' : 'Compare'}
          </button>

          {/* Overall progress ring -- animated on mount */}
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#1e2638" strokeWidth="4" />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#d4a574"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(totalProgress / 100) * 150.8} 150.8`}
                transform="rotate(-90 28 28)"
                style={{
                  animation: mounted ? 'nv-headerRing 1.2s ease both' : 'none',
                  transition: 'stroke-dasharray 0.5s ease',
                }}
              />
              {/* Glow ring */}
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#d4a574"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(totalProgress / 100) * 150.8} 150.8`}
                transform="rotate(-90 28 28)"
                opacity="0.15"
                style={{ filter: 'blur(3px)' }}
              />
            </svg>
            <span style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#d4a574',
              animation: mounted ? 'nv-countUp 0.6s ease 0.3s both' : 'none',
            }}>
              {mounted ? <AnimatedNumber value={totalProgress} suffix="%" /> : `${totalProgress}%`}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>Overall Progress</div>
            <div style={{ fontSize: 11, color: '#6b6358' }}>Across all nodes</div>
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {(!nodes || nodes.length === 0) && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b6358',
            fontSize: 14,
          }}
        >
          <Globe size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0 }}>No nodes have been created yet.</p>
        </div>
      )}

      {/* ── Node Connection Diagram ── */}
      {nodes && nodes.length > 0 && (
      <div style={{ animation: mounted ? 'nv-fade-up 0.6s ease 0.05s both' : 'none' }}>
        <NodeConnectionDiagram />
      </div>
      )}

      {/* ── Ecosystem Health Dashboard ── */}
      <div
        className="card-premium"
        style={{
          backgroundColor: 'rgba(19, 23, 32, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(30, 38, 56, 0.6)',
          borderRadius: 14,
          padding: '24px 28px',
          marginBottom: 24,
          animation: mounted ? 'nv-fade-up 0.6s ease 0.1s both' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Sparkline decoration */}
        <SparklineDecoration color="#d4a574" height={40} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <Activity size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Ecosystem Health Dashboard</h2>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          {/* Overall Health Score -- Animated SVG arc gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
            <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 8 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#1e2638" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={healthColor(overallHealth)}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallHealth / 100) * 213.6} 213.6`}
                  transform="rotate(-90 40 40)"
                  style={{
                    animation: mounted ? 'nv-gaugeArc-lg 1.5s ease both' : 'none',
                    transition: 'stroke-dasharray 0.5s ease',
                  }}
                />
                {/* Glow arc */}
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={healthColor(overallHealth)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallHealth / 100) * 213.6} 213.6`}
                  transform="rotate(-90 40 40)"
                  opacity="0.12"
                  style={{ filter: 'blur(4px)' }}
                />
              </svg>
              <span style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 800,
                color: healthColor(overallHealth),
                animation: mounted ? 'nv-countUp 0.8s ease 0.5s both' : 'none',
              }}>
                {mounted ? <AnimatedNumber value={overallHealth} /> : overallHealth}
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888' }}>Overall Health</span>
            <span style={{ fontSize: 11, color: '#6b6358' }}>Weighted avg</span>
          </div>

          {/* Horizontal Bar Chart with gradient fills -- animated from 0 */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#a09888', marginBottom: 12 }}>Node Health Scores</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {nodes.map((node, idx) => {
                const score = nodeHealthScores[node.id] || 0;
                const color = getNodeHex(node);
                return (
                  <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#a09888', width: 90, flexShrink: 0, textAlign: 'right' }}>
                      {node.shortName}
                    </span>
                    <div style={{ flex: 1, height: 14, backgroundColor: '#1e2638', borderRadius: 7, overflow: 'hidden', position: 'relative' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${score}%`,
                          borderRadius: 7,
                          background: `linear-gradient(90deg, ${color}, ${color}88)`,
                          position: 'relative',
                          overflow: 'hidden',
                          animation: mounted ? `nv-bar-fill 0.8s ease ${0.3 + idx * 0.1}s both` : 'none',
                        }}
                      >
                        {/* Shimmer effect */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                            animation: 'nv-progress-shimmer 3s ease-in-out infinite',
                          }}
                        />
                      </div>
                    </div>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: healthColor(score),
                      width: 30,
                      textAlign: 'right',
                      animation: mounted ? `nv-countUp 0.5s ease ${0.6 + idx * 0.1}s both` : 'none',
                    }}>
                      {mounted ? <AnimatedNumber value={score} duration={800 + idx * 100} /> : score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nodes Needing Attention */}
          <div style={{ minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <AlertTriangle size={14} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Needs Attention</span>
            </div>
            {nodesNeedingAttention.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b8f71' }}>
                <CheckCircle2 size={14} />
                All nodes healthy
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nodesNeedingAttention.map((node) => {
                  const score = nodeHealthScores[node.id] || 0;
                  return (
                    <div
                      key={node.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        borderRadius: 8,
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        flexShrink: 0,
                        animation: 'nv-pulse-dot 2s ease-in-out infinite',
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>{node.name}</div>
                        <div style={{ fontSize: 10, color: '#ef4444' }}>Health: {score}/100</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary Stats Row ── with count-up badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 32,
          animation: mounted ? 'nv-fade-up 0.6s ease 0.15s both' : 'none',
        }}
      >
        {[
          { label: 'Active', value: activeCount, color: '#6b8f71', icon: Zap },
          { label: 'Building', value: buildingCount, color: '#d4a574', icon: Layers },
          { label: 'Pilot', value: pilotCount, color: '#60a5fa', icon: FlaskConical },
          { label: 'Total Progress', value: totalProgress, color: '#8b5cf6', icon: Signal, suffix: '%' },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className="card-stat"
            style={{
              backgroundColor: 'rgba(19, 23, 32, 0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(30, 38, 56, 0.6)',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
              position: 'relative',
              overflow: 'hidden',
              animation: mounted ? `nv-badge-pop 0.5s ease ${0.2 + idx * 0.08}s both` : 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${stat.color}40`;
              e.currentTarget.style.boxShadow = `0 0 24px ${stat.color}12, 0 4px 16px rgba(0,0,0,0.2)`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(30, 38, 56, 0.6)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Sparkline decoration behind */}
            <SparklineDecoration color={stat.color} height={28} />
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: `${stat.color}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f0ebe4' }}>
                {mounted ? <AnimatedNumber value={stat.value} suffix={stat.suffix || ''} duration={1000 + idx * 150} /> : `${stat.value}${stat.suffix || ''}`}
              </div>
              <div style={{ fontSize: 12, color: '#6b6358' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <div className="card-premium" style={{
          backgroundColor: 'rgba(19, 23, 32, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(30, 38, 56, 0.6)',
          borderRadius: 14,
          overflow: 'hidden',
          marginBottom: 32,
          animation: mounted ? 'nv-fade-up 0.5s ease both' : 'none',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 0.8fr 1fr 1.2fr 1fr',
            gap: 8,
            padding: '14px 20px',
            borderBottom: '1px solid rgba(30, 38, 56, 0.6)',
            backgroundColor: 'rgba(30, 38, 56, 0.3)',
          }}>
            {['Node', 'Status', 'Priority', 'Health', 'Progress', 'Lead', 'Last Update'].map((col) => (
              <span key={col} style={{ fontSize: 11, fontWeight: 700, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col}
              </span>
            ))}
          </div>
          {/* Table rows */}
          {nodes.map((node, rowIndex) => {
            const sts = statusStyle(node.status);
            const pri = priorityStyle(node.priority);
            const score = nodeHealthScores[node.id] || 0;
            const metrics = nodeMetrics[node.id];
            const color = getNodeHex(node);
            const leadMembers = node.leads
              .map((lid) => teamMembers.find((m) => m.id === lid))
              .filter(Boolean);
            const latestUpdate = getLatestUpdate(node.id);

            return (
              <div
                key={node.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 0.8fr 1fr 1.2fr 1fr',
                  gap: 8,
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(30, 38, 56, 0.4)',
                  alignItems: 'center',
                  transition: 'background-color 0.25s, transform 0.2s',
                  animation: mounted ? `nv-fade-up 0.4s ease ${rowIndex * 0.05}s both` : 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}08`; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Node */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4' }}>{node.name}</span>
                </div>
                {/* Status */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: sts.text,
                  backgroundColor: sts.bg,
                  padding: '3px 8px',
                  borderRadius: 6,
                  lineHeight: 1,
                  width: 'fit-content',
                }}>
                  {sts.label}
                </span>
                {/* Priority */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: pri.text,
                  backgroundColor: pri.bg,
                  padding: '3px 8px',
                  borderRadius: 6,
                  lineHeight: 1,
                  width: 'fit-content',
                }}>
                  {pri.label}
                </span>
                {/* Health */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: healthColor(score),
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: healthColor(score) }}>{score}</span>
                </div>
                {/* Progress -- click to edit */}
                {editingProgressNodeId === node.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      ref={progressInputRef}
                      type="number"
                      min={0}
                      max={100}
                      value={editingProgressValue}
                      onChange={(e) => setEditingProgressValue(Number(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitProgress();
                        if (e.key === 'Escape') cancelEditingProgress();
                      }}
                      onBlur={commitProgress}
                      style={{
                        width: 52,
                        padding: '3px 6px',
                        borderRadius: 6,
                        border: `1px solid ${color}60`,
                        backgroundColor: '#0b0d14',
                        color: '#f0ebe4',
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        outline: 'none',
                        textAlign: 'center',
                      }}
                    />
                    <span style={{ fontSize: 11, color: '#6b6358' }}>%</span>
                  </div>
                ) : (
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={() => startEditingProgress(node.id, node.progress)}
                    title="Click to edit progress"
                  >
                    <div style={{ flex: 1, height: 5, backgroundColor: '#1e2638', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${node.progress}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        borderRadius: 3,
                        animation: mounted ? `nv-bar-fill 0.8s ease ${0.2 + rowIndex * 0.08}s both` : 'none',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888', minWidth: 30 }}>{node.progress}%</span>
                  </div>
                )}
                {/* Lead */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {leadMembers.slice(0, 2).map((m, i) => (
                    <div
                      key={m?.id ?? `lead-${i}`}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${getMemberColor(m?.id ?? '', teamMembers)}, ${getMemberColor(m?.id ?? '', teamMembers)}88)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 8,
                        fontWeight: 700,
                        color: '#0b0d14',
                        border: '2px solid rgba(19, 23, 32, 0.8)',
                        marginLeft: i > 0 ? -4 : 0,
                      }}
                    >
                      {m?.avatar}
                    </div>
                  ))}
                  <span style={{ fontSize: 12, color: '#a09888', marginLeft: 2 }}>
                    {leadMembers.map((m) => m?.name?.split(' ')[0] ?? '').join(', ')}
                  </span>
                </div>
                {/* Last Update */}
                <span style={{ fontSize: 11, color: '#6b6358' }}>
                  {latestUpdate ? timeAgo(latestUpdate.timestamp) : metrics?.lastUpdate || '\u2014'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Node Comparison Panel ── */}
      {compareNodes && (() => {
        const nA = nodes.find(n => n.id === compareNodes[0]);
        const nB = nodes.find(n => n.id === compareNodes[1]);
        if (nA && nB) {
          return (
            <NodeComparisonPanel
              nodeA={nA}
              nodeB={nB}
              teamMembers={teamMembers}
              onClose={cancelCompare}
            />
          );
        }
        return null;
      })()}

      {/* ── Compare mode hint ── */}
      {compareSelecting && !compareNodes && (
        <div style={{
          padding: '12px 20px',
          marginBottom: 20,
          borderRadius: 10,
          border: '1px solid rgba(139, 92, 246, 0.3)',
          backgroundColor: 'rgba(139, 92, 246, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'nv-fade-up 0.3s ease both',
        }}>
          <GitCompareArrows size={16} style={{ color: '#8b5cf6' }} />
          <span style={{ fontSize: 13, color: '#8b5cf6', fontWeight: 500 }}>
            Select a second node to compare with <strong>{nodes.find(n => n.id === compareSelecting)?.shortName || 'selected node'}</strong>
          </span>
          <button
            onClick={cancelCompare}
            style={{
              marginLeft: 'auto',
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backgroundColor: 'transparent',
              color: '#8b5cf6',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Node Cards Grid ── */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))', gap: 20 }}>
          {nodes.map((node, cardIndex) => {
            const Icon = iconMap[node.icon] ?? Globe;
            const sts = statusStyle(node.status);
            const pri = priorityStyle(node.priority);
            const StatusIcon = statusIcon(node.status);
            const isExpanded = expandedId === node.id;
            const matKey = maturityKeyMap[node.id];
            const score = nodeHealthScores[node.id] || 0;
            const metrics = nodeMetrics[node.id];
            const latestUpdate = getLatestUpdate(node.id);
            const isUpdating = updateNodeId === node.id;
            const color = getNodeHex(node);
            const gradient = getNodeGradient(node);
            const hGlow = healthGlowColor(score);
            const hCat = healthCategory(score);

            // Resolve lead names
            const leadMembers = node.leads
              .map((lid) => teamMembers.find((m) => m.id === lid))
              .filter(Boolean);

            // Contributors count
            const contributorsCount = leadMembers.length + (metrics?.extraContributors || 0);
            const isNodeOfTheWeek = nodeOfTheWeekId === node.id;
            const isCelebrating = celebratingNodeId === node.id || node.progress === 100;
            const trendData = healthTrends[node.id] || [];
            const contributions = memberContributions[node.id] || [];
            const isCompareSelecting = compareSelecting === node.id;

            return (
              <div
                key={node.id}
                className="card-interactive"
                style={{
                  backgroundColor: 'rgba(19, 23, 32, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: isNodeOfTheWeek
                    ? '1px solid rgba(212, 165, 116, 0.4)'
                    : isCompareSelecting
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : '1px solid rgba(30, 38, 56, 0.6)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
                  animation: mounted ? `nv-fade-up-stagger 0.6s ease ${cardIndex * 0.1}s both` : 'none',
                  position: 'relative',
                  ['--nv-card-glow' as string]: `0 0 24px ${hGlow}15, 0 4px 20px rgba(0,0,0,0.25)`,
                  ...(isNodeOfTheWeek ? {
                    boxShadow: `0 0 30px rgba(212, 165, 116, 0.12), 0 0 60px rgba(212, 165, 116, 0.06), inset 0 1px 0 rgba(212, 165, 116, 0.1)`,
                  } : {}),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}50`;
                  e.currentTarget.style.boxShadow = `0 12px 40px ${color}15, 0 0 0 1px ${color}12, inset 0 1px 0 rgba(255,255,255,0.06)`;
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isNodeOfTheWeek ? 'rgba(212, 165, 116, 0.4)' : 'rgba(30, 38, 56, 0.6)';
                  e.currentTarget.style.boxShadow = isNodeOfTheWeek ? '0 0 30px rgba(212, 165, 116, 0.12), 0 0 60px rgba(212, 165, 116, 0.06)' : 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Celebration burst animation */}
                <CelebrationBurst color={color} active={isCelebrating} />

                {/* Node of the Week badge */}
                {isNodeOfTheWeek && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 12px',
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(212, 165, 116, 0.08))',
                    border: '1px solid rgba(212, 165, 116, 0.3)',
                    animation: 'nv-badge-pop 0.5s ease 0.5s both',
                  }}>
                    <Trophy size={12} style={{ color: '#d4a574', animation: 'nv-trophy-glow 2s ease-in-out infinite' }} />
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      backgroundImage: 'linear-gradient(90deg, #d4a574, #f0ebe4, #d4a574)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'nv-notw-shimmer 3s linear infinite',
                    }}>
                      NODE OF THE WEEK
                    </span>
                  </div>
                )}

                {/* Gradient top accent bar -- health-colored */}
                <div
                  style={{
                    height: isNodeOfTheWeek ? 4 : 3,
                    background: isNodeOfTheWeek
                      ? 'linear-gradient(90deg, #d4a574, #8b5cf6, #d4a574, #6b8f71, #d4a574)'
                      : `linear-gradient(90deg, ${color}, ${hGlow}, ${color})`,
                    backgroundSize: isNodeOfTheWeek ? '200% 100%' : '100% 100%',
                    opacity: 0.9,
                    ...(isNodeOfTheWeek ? { animation: 'nv-notw-shimmer 4s linear infinite' } : {}),
                  }}
                />

                {/* Hexagonal background decoration */}
                <HexagonalBackground color={color} />

                {/* Gradient overlay in card background */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 160,
                    background: `linear-gradient(135deg, ${color}08, ${hGlow}04, transparent)`,
                    pointerEvents: 'none',
                  }}
                />

                <div style={{ padding: '24px 24px 20px', position: 'relative' }}>
                  {/* Top section: Circular Progress Ring + Node Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 18 }}>
                    {/* Circular Progress Ring with icon in center */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <CircularProgressRing
                        progress={node.progress}
                        size={76}
                        strokeWidth={5}
                        color={color}
                        glowColor={color}
                        animated={mounted}
                      >
                        <div style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: `linear-gradient(135deg, ${color}18, ${color}08)`,
                          border: `1px solid ${color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon size={24} style={{ color }} />
                        </div>
                      </CircularProgressRing>
                      {/* Progress % overlay at bottom of ring */}
                      <div style={{
                        position: 'absolute',
                        bottom: -4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#0b0d14',
                        border: `1px solid ${color}30`,
                        borderRadius: 8,
                        padding: '1px 8px',
                        fontSize: 10,
                        fontWeight: 700,
                        color,
                        whiteSpace: 'nowrap',
                      }}>
                        {node.progress}%
                      </div>
                    </div>

                    {/* Node info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', margin: 0, lineHeight: 1.2 }}>{node.name}</h3>
                        {/* Health trend sparkline */}
                        {trendData.length >= 2 && (
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <HealthTrendSparkline data={trendData} color={healthColor(score)} width={64} height={22} />
                            <span style={{ fontSize: 9, color: '#6b6358' }}>4w</span>
                          </div>
                        )}
                      </div>

                      {/* Status + Priority + Health badges row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                        {/* Health status indicator */}
                        <NodeHealthIndicator score={score} size="large" />
                        {/* Status badge */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            color: sts.text,
                            backgroundColor: sts.bg,
                            padding: '4px 10px',
                            borderRadius: 8,
                            lineHeight: 1,
                          }}
                        >
                          <StatusIcon size={11} />
                          {sts.label}
                        </span>
                        {/* Priority badge */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            color: pri.text,
                            backgroundColor: pri.bg,
                            padding: '4px 10px',
                            borderRadius: 8,
                            lineHeight: 1,
                          }}
                        >
                          {pri.label}
                        </span>
                      </div>

                      {/* Purpose */}
                      <p style={{ fontSize: 13, color: '#a09888', lineHeight: 1.55, margin: 0 }}>
                        {node.purpose}
                      </p>
                    </div>
                  </div>

                  {/* ── Lead Section with Avatar + Name + Role Badge ── */}
                  <div style={{
                    padding: '14px 16px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.04)',
                    marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <Crown size={12} style={{ color: '#d4a574' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Node Lead{leadMembers.length > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {leadMembers.map((member, i) => {
                        const memberColor = getMemberColor(member?.id ?? '', teamMembers);
                        return (
                          <div
                            key={member?.id ?? `lead-${i}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                            }}
                          >
                            {/* Avatar */}
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${memberColor}, ${memberColor}88)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#0b0d14',
                                boxShadow: `0 0 10px ${memberColor}25`,
                                flexShrink: 0,
                              }}
                            >
                              {member?.avatar}
                            </div>
                            {/* Name + role */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', lineHeight: 1.2 }}>
                                {member?.name}
                              </div>
                              <div style={{ fontSize: 11, color: '#a09888', lineHeight: 1.3 }}>
                                {member?.shortRole || member?.role}
                              </div>
                            </div>
                            {/* Role badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '3px 10px',
                              borderRadius: 8,
                              backgroundColor: `${color}10`,
                              border: `1px solid ${color}20`,
                            }}>
                              <Shield size={10} style={{ color }} />
                              <span style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: '0.02em' }}>Lead</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Member Contribution Breakdown */}
                  <MemberContributionBar contributions={contributions} teamMembers={teamMembers} />

                  {/* Compare Button */}
                  <button
                    onClick={() => startCompare(node.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: isCompareSelecting ? '1px solid #8b5cf6' : '1px solid rgba(30, 38, 56, 0.6)',
                      backgroundColor: isCompareSelecting ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                      color: isCompareSelecting ? '#8b5cf6' : '#6b6358',
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease',
                      marginBottom: 12,
                    }}
                    onMouseEnter={(e) => {
                      if (!isCompareSelecting) { e.currentTarget.style.borderColor = '#8b5cf640'; e.currentTarget.style.color = '#8b5cf6'; }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCompareSelecting) { e.currentTarget.style.borderColor = 'rgba(30, 38, 56, 0.6)'; e.currentTarget.style.color = '#6b6358'; }
                    }}
                  >
                    <GitCompareArrows size={11} />
                    {isCompareSelecting ? 'Selected' : compareSelecting ? 'Compare with this' : 'Compare'}
                  </button>

                  {/* Progress bar with edit support */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888' }}>Progress</span>
                      {editingProgressNodeId === node.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            ref={progressInputRef}
                            type="number"
                            min={0}
                            max={100}
                            value={editingProgressValue}
                            onChange={(e) => setEditingProgressValue(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitProgress();
                              if (e.key === 'Escape') cancelEditingProgress();
                            }}
                            onBlur={commitProgress}
                            style={{
                              width: 52,
                              padding: '2px 6px',
                              borderRadius: 6,
                              border: `1px solid ${color}60`,
                              backgroundColor: '#0b0d14',
                              color: '#f0ebe4',
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: 'inherit',
                              outline: 'none',
                              textAlign: 'center',
                            }}
                          />
                          <span style={{ fontSize: 12, color: '#6b6358' }}>%</span>
                        </div>
                      ) : (
                        <span
                          style={{ fontSize: 13, fontWeight: 700, color, cursor: 'pointer' }}
                          onClick={() => startEditingProgress(node.id, node.progress)}
                          title="Click to edit progress"
                        >
                          {node.progress}%
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        height: 8,
                        backgroundColor: '#1e2638',
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: editingProgressNodeId === node.id ? 'default' : 'pointer',
                      }}
                      onClick={() => {
                        if (editingProgressNodeId !== node.id) {
                          startEditingProgress(node.id, node.progress);
                        }
                      }}
                      title={editingProgressNodeId === node.id ? undefined : 'Click to edit progress'}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${node.progress}%`,
                          borderRadius: 4,
                          background: gradient,
                          position: 'relative',
                          overflow: 'hidden',
                          animation: mounted ? `nv-bar-fill 1s ease ${0.3 + cardIndex * 0.08}s both` : 'none',
                        }}
                      >
                        {/* Shimmer animation */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            animation: 'nv-progress-shimmer 2.5s ease-in-out infinite',
                          }}
                        />
                      </div>
                    </div>
                    {/* Enhanced slider with snap-to-10%, tooltip, and tick marks */}
                    {editingProgressNodeId === node.id && (
                      <div style={{ position: 'relative', marginTop: 4 }}>
                        {/* Value tooltip */}
                        {sliderTooltip.visible && (
                          <div style={{
                            position: 'absolute',
                            top: -28,
                            left: `${editingProgressValue}%`,
                            transform: 'translateX(-50%)',
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: color,
                            color: '#0b0d14',
                            fontSize: 11,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            animation: 'nv-slider-tooltip 0.2s ease both',
                            pointerEvents: 'none',
                            zIndex: 2,
                          }}>
                            {editingProgressValue}%
                            <div style={{
                              position: 'absolute',
                              bottom: -4,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 0,
                              height: 0,
                              borderLeft: '4px solid transparent',
                              borderRight: '4px solid transparent',
                              borderTop: `4px solid ${color}`,
                            }} />
                          </div>
                        )}
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={10}
                          value={editingProgressValue}
                          onChange={(e) => handleSliderChange(Number(e.target.value))}
                          onMouseUp={commitProgress}
                          onTouchEnd={commitProgress}
                          className="nv-premium-slider"
                          style={{
                            ['--nv-slider-color' as string]: color,
                          } as React.CSSProperties}
                        />
                        {/* Tick marks at 10% increments */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '2px 1px 0',
                        }}>
                          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
                            <div key={tick} style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              width: 1,
                            }}>
                              <div style={{
                                width: 1,
                                height: tick % 50 === 0 ? 6 : 3,
                                backgroundColor: editingProgressValue >= tick ? `${color}60` : '#2a3040',
                                transition: 'background-color 0.15s',
                              }} />
                              {tick % 50 === 0 && (
                                <span style={{
                                  fontSize: 8,
                                  color: editingProgressValue >= tick ? color : '#4a5060',
                                  marginTop: 2,
                                  transition: 'color 0.15s',
                                }}>{tick}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Maturity Indicator */}
                  {matKey && nodeMaturity[matKey] && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#a09888' }}>
                          Maturity Level {nodeMaturity[matKey].level}/5
                        </span>
                        <span style={{ fontSize: 10, color: '#6b6358' }}>
                          {nodeMaturity[matKey].label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: lvl <= nodeMaturity[matKey].level ? color : '#1e2638',
                              border: lvl <= nodeMaturity[matKey].level ? `1px solid ${color}60` : '1px solid #2a3040',
                              transition: 'background-color 0.3s ease, border-color 0.3s ease',
                              boxShadow: lvl <= nodeMaturity[matKey].level ? `0 0 6px ${color}30` : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Capability tags as styled pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                    {node.capabilities.slice(0, 3).map((cap, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          color: `${color}cc`,
                          backgroundColor: `${color}10`,
                          border: `1px solid ${color}20`,
                          padding: '3px 8px',
                          borderRadius: 12,
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 180,
                        }}
                      >
                        {cap}
                      </span>
                    ))}
                    {node.capabilities.length > 3 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#6b6358',
                          backgroundColor: '#1a1f2e',
                          padding: '3px 8px',
                          borderRadius: 12,
                        }}
                      >
                        +{node.capabilities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Post Update Button & Latest Update */}
                  <div style={{ marginBottom: 12 }}>
                    {!isUpdating && (
                      <button
                        onClick={() => { setUpdateNodeId(node.id); setUpdateText(''); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid rgba(30, 38, 56, 0.6)',
                          backgroundColor: 'transparent',
                          color: '#a09888',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.25s, color 0.25s, box-shadow 0.25s',
                          marginBottom: latestUpdate ? 8 : 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = color;
                          e.currentTarget.style.color = color;
                          e.currentTarget.style.boxShadow = `0 0 12px ${color}15`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(30, 38, 56, 0.6)';
                          e.currentTarget.style.color = '#a09888';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <MessageSquarePlus size={13} />
                        Post Update
                      </button>
                    )}

                    {/* Inline update textarea */}
                    {isUpdating && (
                      <div style={{
                        marginBottom: 8,
                        animation: 'nv-expandIn 0.3s ease both',
                      }}>
                        <textarea
                          value={updateText}
                          onChange={(e) => setUpdateText(e.target.value)}
                          placeholder="Write a brief update..."
                          autoFocus
                          style={{
                            width: '100%',
                            minHeight: 60,
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: '1px solid #2e3a4e',
                            backgroundColor: '#0b0d14',
                            color: '#f0ebe4',
                            fontSize: 13,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            outline: 'none',
                            lineHeight: 1.5,
                            boxSizing: 'border-box',
                            transition: 'border-color 0.25s, box-shadow 0.25s',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = color;
                            e.currentTarget.style.boxShadow = `0 0 12px ${color}15`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#2e3a4e';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            onClick={() => handlePostUpdate(node.id)}
                            disabled={!updateText.trim()}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 6,
                              border: 'none',
                              background: updateText.trim() ? gradient : '#2e3a4e',
                              color: updateText.trim() ? '#0b0d14' : '#6b6358',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: updateText.trim() ? 'pointer' : 'not-allowed',
                              fontFamily: 'inherit',
                              transition: 'background 0.15s',
                            }}
                          >
                            Post
                          </button>
                          <button
                            onClick={() => { setUpdateNodeId(null); setUpdateText(''); }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 6,
                              border: '1px solid rgba(30, 38, 56, 0.6)',
                              backgroundColor: 'transparent',
                              color: '#a09888',
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              transition: 'border-color 0.2s',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Latest update display */}
                    {latestUpdate && (
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: `${color}06`,
                        borderRadius: 8,
                        borderLeft: `3px solid ${color}40`,
                      }}>
                        <div style={{ fontSize: 10, color: '#6b6358', marginBottom: 4 }}>
                          Latest update &middot; {timeAgo(latestUpdate.timestamp)}
                        </div>
                        <div style={{ fontSize: 12, color: '#a09888', lineHeight: 1.45 }}>
                          {latestUpdate.text}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse capabilities */}
                  <button
                    onClick={() => toggleExpand(node.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 0',
                      border: 'none',
                      borderTop: '1px solid rgba(30, 38, 56, 0.6)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: '#a09888',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      transition: 'color 0.25s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#a09888'; }}
                  >
                    <span>{isExpanded ? 'Hide' : 'Show'} Details ({node.capabilities.length} capabilities)</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Expanded content -- smooth animate in */}
                  {isExpanded && (
                    <div style={{
                      paddingTop: 8,
                      animation: 'nv-expandIn 0.4s ease both',
                      overflow: 'hidden',
                    }}>
                      {/* Node Metrics Row */}
                      {metrics && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 10,
                          marginBottom: 16,
                          padding: '12px',
                          backgroundColor: `${color}06`,
                          borderRadius: 10,
                          border: `1px solid ${color}10`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              backgroundColor: `${color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <CheckCircle2 size={14} style={{ color }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>
                                <AnimatedNumber value={metrics.activeTasks} duration={600} />
                              </div>
                              <div style={{ fontSize: 10, color: '#6b6358' }}>Active Tasks</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              backgroundColor: 'rgba(212, 165, 116, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <CalendarClock size={14} style={{ color: '#d4a574' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>{metrics.lastUpdate}</div>
                              <div style={{ fontSize: 10, color: '#6b6358' }}>Last Update</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              backgroundColor: 'rgba(107, 143, 113, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Users size={14} style={{ color: '#6b8f71' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>
                                <AnimatedNumber value={contributorsCount} duration={600} />
                              </div>
                              <div style={{ fontSize: 10, color: '#6b6358' }}>Contributors</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              backgroundColor: 'rgba(96, 165, 250, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Target size={14} style={{ color: '#60a5fa' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#f0ebe4', lineHeight: 1.3 }}>{metrics.nextMilestone}</div>
                              <div style={{ fontSize: 10, color: '#6b6358' }}>Next Milestone</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* All capabilities list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {node.capabilities.map((cap, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              fontSize: 13,
                              color: '#a09888',
                              lineHeight: 1.45,
                              animation: `nv-fade-up 0.3s ease ${idx * 0.05}s both`,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: color,
                                flexShrink: 0,
                                marginTop: 6,
                                boxShadow: `0 0 4px ${color}30`,
                              }}
                            />
                            {cap}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Cross-Node Dependencies (enhanced with visual connectors) ── */}
      <div
        style={{
          marginTop: 32,
          animation: mounted ? 'nv-fade-up 0.6s ease 0.3s both' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(107, 143, 113, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>
            Cross-Node Dependencies
          </h2>
        </div>
        <div
          style={{
            backgroundColor: 'rgba(19, 23, 32, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(30, 38, 56, 0.6)',
            borderRadius: 14,
            padding: '20px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background subtle pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: 'radial-gradient(circle at 20% 50%, #8b5cf6, transparent 50%), radial-gradient(circle at 80% 50%, #6b8f71, transparent 50%)',
            pointerEvents: 'none',
          }} />

          {/* Strength legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(30, 38, 56, 0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6358' }}>Strength:</span>
            {(['strong', 'medium', 'weak'] as const).map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="20" height="8">
                  <line x1="0" y1="4" x2="20" y2="4" stroke={strengthColors[s]}
                    strokeWidth={s === 'strong' ? 2.5 : s === 'medium' ? 2 : 1.5}
                    strokeDasharray={s === 'weak' ? '3 3' : s === 'medium' ? '5 3' : 'none'}
                    strokeLinecap="round"
                  />
                  {s === 'strong' && (
                    <circle cx="10" cy="4" r="2" fill={strengthColors[s]} opacity="0.6">
                      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </svg>
                <span style={{ fontSize: 11, color: '#a09888', textTransform: 'capitalize' }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 1 }}>
            {crossDeps.map((dep, idx) => {
              const sColor = strengthColors[dep.strength];
              const lineWidth = dep.strength === 'strong' ? 3 : dep.strength === 'medium' ? 2 : 1.5;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    transition: 'background-color 0.25s, box-shadow 0.25s',
                    padding: '10px 14px',
                    borderRadius: 10,
                    marginBottom: 2,
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${sColor}08`;
                    e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${sColor}20, 0 0 20px ${sColor}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* From node pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(212, 165, 116, 0.08)',
                    border: '1px solid rgba(212, 165, 116, 0.15)',
                    minWidth: 120,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#d4a574' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#d4a574' }}>{dep.from}</span>
                  </div>

                  {/* Visual connector line with animated flow */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', minWidth: 60, padding: '0 4px' }}>
                    {/* Animated flowing line using CSS */}
                    <div style={{
                      flex: 1,
                      height: lineWidth,
                      borderRadius: lineWidth,
                      position: 'relative',
                      overflow: 'visible',
                    }}>
                      {/* Base track */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: lineWidth,
                        backgroundColor: sColor,
                        opacity: 0.15,
                      }} />
                      {/* Flowing animated gradient */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: lineWidth,
                        background: dep.strength === 'weak'
                          ? `repeating-linear-gradient(90deg, ${sColor}40 0px, ${sColor}40 4px, transparent 4px, transparent 8px)`
                          : dep.strength === 'medium'
                          ? `repeating-linear-gradient(90deg, ${sColor}50 0px, ${sColor}50 6px, transparent 6px, transparent 10px)`
                          : `linear-gradient(90deg, ${sColor}20, ${sColor}60, ${sColor}20)`,
                        backgroundSize: dep.strength !== 'strong' ? undefined : '40px 100%',
                        animation: dep.strength === 'strong' ? 'nv-notw-shimmer 2s linear infinite' : undefined,
                      }} />
                      {/* Pulsing dot for strong connections */}
                      {dep.strength === 'strong' && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: sColor,
                          transform: 'translate(-50%, -50%)',
                          animation: 'nv-pulse-dot 2s ease-in-out infinite',
                        }} />
                      )}
                    </div>
                    {/* Arrow indicator */}
                    <ArrowRight size={14} style={{ color: sColor, opacity: 0.6, flexShrink: 0, marginLeft: -2 }} />
                    {/* Strength label centered on line */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      backgroundColor: '#0b0d14',
                      border: `1px solid ${sColor}30`,
                    }}>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: sColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {dep.strength}
                      </span>
                    </div>
                  </div>

                  {/* To node pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(240, 235, 228, 0.04)',
                    border: '1px solid rgba(240, 235, 228, 0.1)',
                    minWidth: 120,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f0ebe4', opacity: 0.6 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>{dep.to}</span>
                  </div>

                  {/* Description on hover as tooltip style */}
                  <div style={{
                    marginLeft: 12,
                    fontSize: 11,
                    color: '#6b6358',
                    maxWidth: 200,
                    lineHeight: 1.3,
                    fontStyle: 'italic',
                  }}>
                    {dep.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
