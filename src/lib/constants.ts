// ─── Shared Constants ───
// Single source of truth for color mappings and other constants used across the app.

import {
  Zap,
  Users,
  Network,
  Shield,
  Heart,
  Calendar,
  TrendingUp,
  Target,
} from 'lucide-react';

// ─── Tailwind Color Map ───
// Maps Tailwind bg-* class names to hex values for inline styles / canvas rendering.
export const tailwindColorMap: Record<string, string> = {
  'bg-amber-500': '#f59e0b',
  'bg-amber-400': '#fbbf24',
  'bg-rose-400': '#fb7185',
  'bg-violet-500': '#8b5cf6',
  'bg-sky-400': '#38bdf8',
  'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7',
  'bg-pink-400': '#f472b6',
  'bg-teal-400': '#2dd4bf',
  'bg-green-500': '#22c55e',
  'bg-lime-500': '#84cc16',
  'bg-orange-500': '#f97316',
  'bg-indigo-400': '#818cf8',
  'bg-slate-400': '#94a3b8',
};

/**
 * Returns the hex color for a Tailwind bg-* class.
 * Falls back to the warm neutral `#d4a574` if the class isn't mapped.
 */
export function getMemberColor(colorClass: string): string {
  return tailwindColorMap[colorClass] || '#d4a574';
}

// ─── Agent Colors ───
// Color + icon pairings for the 8 AI advisor agents.
export const AGENT_COLORS: Record<string, { color: string; icon: React.ElementType }> = {
  'MOTHERSHIP': { color: '#f59e0b', icon: Zap },
  'MEMBERSHIP': { color: '#38bdf8', icon: Users },
  'NODE INTEL': { color: '#8b5cf6', icon: Network },
  'GOVERNANCE': { color: '#10b981', icon: Shield },
  'COHERENCE': { color: '#f472b6', icon: Heart },
  'EVENT': { color: '#4ade80', icon: Calendar },
  'IMPACT': { color: '#fb923c', icon: TrendingUp },
  'PEOPLE': { color: '#60a5fa', icon: Target },
};

// ─── Status Colors ───
// Consistent status badge colors for tasks and items.
export const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  'todo': { bg: 'rgba(160, 152, 136, 0.12)', text: '#a09888', label: 'To Do' },
  'in-progress': { bg: 'rgba(59, 130, 246, 0.12)', text: '#60a5fa', label: 'In Progress' },
  'done': { bg: 'rgba(34, 197, 94, 0.12)', text: '#4ade80', label: 'Done' },
  'blocked': { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', label: 'Blocked' },
  // OKR / project-level statuses
  'on-track': { bg: 'rgba(34, 197, 94, 0.12)', text: '#4ade80', label: 'On Track' },
  'at-risk': { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', label: 'At Risk' },
  'behind': { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', label: 'Behind' },
};

// ─── Priority Colors ───
// Badge colors for task priorities.
export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  'critical': { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171' },
  'high': { bg: 'rgba(251, 146, 60, 0.12)', text: '#fb923c' },
  'medium': { bg: 'rgba(212, 165, 116, 0.12)', text: '#d4a574' },
  'low': { bg: 'rgba(160, 152, 136, 0.12)', text: '#a09888' },
};
