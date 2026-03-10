'use client';

import React from 'react';
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
} from 'lucide-react';
import { okrs, nodes, kpis, roadmapPhases, events, teamMembers } from '@/lib/data';

/* ─── Icon Lookup (for node icons stored as strings) ─── */
const iconMap: Record<string, React.ElementType> = {
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Sprout,
  BookOpen,
};

/* ─── Top-level KPI cards (curated) ─── */
const heroKpis = [
  { label: 'Well-Stewards', value: '~65', target: '144', icon: Users, trend: 'up' as const, color: '#d4a574' },
  { label: '2026 Revenue', value: '$180K', target: '$2M', icon: DollarSign, trend: 'up' as const, color: '#e8b44c' },
  { label: 'DAF Raised', value: '$85K', target: '$500K-$1M', icon: Heart, trend: 'up' as const, color: '#8b5cf6' },
  { label: 'Member Retention', value: '78%', target: '85%+', icon: TrendingUp, trend: 'up' as const, color: '#6b8f71' },
  { label: 'Event NPS', value: '9.3', target: '9.5', icon: Star, trend: 'flat' as const, color: '#e879a0' },
  { label: 'Active Nodes', value: '4', target: '6', icon: Network, trend: 'up' as const, color: '#5eaed4' },
];

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

/* ─── Component ─── */

export function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const topOkrs = okrs.slice(0, 3);
  const upcomingEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'planning');

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="animate-fade-in">
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
          return (
            <div
              key={kpi.label}
              className="glow-card rounded-xl p-4 border animate-fade-in"
              style={{
                backgroundColor: '#131720',
                borderColor: '#1e2638',
                animationDelay: `${0.05 + i * 0.04}s`,
                opacity: 0,
              }}
            >
              <div className="flex items-center justify-between mb-3">
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
              <div className="text-2xl font-bold text-text-primary tracking-tight">{kpi.value}</div>
              <div className="text-xs text-text-muted mt-0.5">{kpi.label}</div>
              <div className="text-[11px] text-text-muted mt-1">
                Target: <span className="text-text-secondary">{kpi.target}</span>
              </div>
            </div>
          );
        })}
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
                className="glow-card rounded-xl p-5 border animate-fade-in"
                style={{
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                  animationDelay: `${0.2 + i * 0.06}s`,
                  opacity: 0,
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
                className="flex-shrink-0 rounded-xl p-4 border animate-fade-in"
                style={{
                  width: 210,
                  backgroundColor: pCfg.bg || '#131720',
                  borderColor: pCfg.border,
                  boxShadow: pCfg.glow !== 'none' ? `0 0 20px ${pCfg.glow}` : 'none',
                  animationDelay: `${0.35 + i * 0.06}s`,
                  opacity: 0,
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
                className="glow-card rounded-xl p-4 border cursor-pointer hover:border-border-2 transition-colors animate-fade-in"
                style={{
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                  animationDelay: `${0.5 + i * 0.05}s`,
                  opacity: 0,
                }}
                onClick={() => onNavigate('nodes')}
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
              className="glow-card rounded-xl p-5 border animate-fade-in"
              style={{
                backgroundColor: '#131720',
                borderColor: '#1e2638',
                animationDelay: `${0.65 + i * 0.06}s`,
                opacity: 0,
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
                className="glow-card rounded-xl p-4 border text-left hover:border-border-2 transition-all group animate-fade-in"
                style={{
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                  animationDelay: `${0.8 + i * 0.04}s`,
                  opacity: 0,
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
