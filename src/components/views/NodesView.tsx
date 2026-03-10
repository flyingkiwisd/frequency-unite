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
} from 'lucide-react';
import { nodes, teamMembers, exportPdf } from '@/lib/data';
import type { Node } from '@/lib/data';

// ─── Icon mapping ───
const iconMap: Record<string, React.ElementType> = {
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Sprout,
  BookOpen,
};

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

// Maturity key mapping (node.id -> maturity key)
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

// ─── Component ───

export function NodesView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [updateNodeId, setUpdateNodeId] = useState<string | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [nodeUpdates, setNodeUpdates] = useState<NodeUpdate[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load updates from localStorage on mount
  useEffect(() => {
    setNodeUpdates(loadUpdates());
  }, []);

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

  return (
    <div ref={containerRef} style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Signal size={24} style={{ color: '#d4a574' }} />
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Node Ecosystem</h1>
          </div>
          <p style={{ fontSize: 14, color: '#a09888', margin: 0 }}>
            Six interconnected nodes driving Frequency&apos;s mission forward
          </p>
        </div>

        {/* Overall progress ring + View Toggle + Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #1e2638',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '7px 12px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? 'rgba(212, 165, 116, 0.15)' : '#131720',
                color: viewMode === 'grid' ? '#d4a574' : '#6b6358',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
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
                borderLeft: '1px solid #1e2638',
                backgroundColor: viewMode === 'list' ? 'rgba(212, 165, 116, 0.15)' : '#131720',
                color: viewMode === 'list' ? '#d4a574' : '#6b6358',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
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
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#d4a574' }}>
              {totalProgress}%
            </span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>Overall Progress</div>
            <div style={{ fontSize: 11, color: '#6b6358' }}>Across all nodes</div>
          </div>
        </div>
      </div>

      {/* ── Ecosystem Health Dashboard ── */}
      <div style={{
        backgroundColor: '#131720',
        border: '1px solid #1e2638',
        borderRadius: 14,
        padding: '24px 28px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Activity size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Ecosystem Health Dashboard</h2>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Overall Health Score */}
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
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
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
              }}>
                {overallHealth}
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888' }}>Overall Health</span>
            <span style={{ fontSize: 11, color: '#6b6358' }}>Weighted avg</span>
          </div>

          {/* Horizontal Bar Chart */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#a09888', marginBottom: 12 }}>Node Health Scores</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {nodes.map((node) => {
                const score = nodeHealthScores[node.id] || 0;
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
                          backgroundColor: healthColor(score),
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: healthColor(score), width: 30, textAlign: 'right' }}>
                      {score}
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

      {/* ── Summary Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Active', value: activeCount, color: '#6b8f71', icon: Zap },
          { label: 'Building', value: buildingCount, color: '#d4a574', icon: Layers },
          { label: 'Pilot', value: pilotCount, color: '#60a5fa', icon: FlaskConical },
          { label: 'Total Progress', value: `${totalProgress}%`, color: '#8b5cf6', icon: Signal },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: `${stat.color}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f0ebe4' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#6b6358' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <div style={{
          backgroundColor: '#131720',
          border: '1px solid #1e2638',
          borderRadius: 14,
          overflow: 'hidden',
          marginBottom: 32,
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 0.8fr 1fr 1.2fr 1fr',
            gap: 8,
            padding: '14px 20px',
            borderBottom: '1px solid #1e2638',
            backgroundColor: 'rgba(30, 38, 56, 0.3)',
          }}>
            {['Node', 'Status', 'Priority', 'Health', 'Progress', 'Lead', 'Last Update'].map((col) => (
              <span key={col} style={{ fontSize: 11, fontWeight: 700, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col}
              </span>
            ))}
          </div>
          {/* Table rows */}
          {nodes.map((node) => {
            const sts = statusStyle(node.status);
            const pri = priorityStyle(node.priority);
            const score = nodeHealthScores[node.id] || 0;
            const metrics = nodeMetrics[node.id];
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
                  borderBottom: '1px solid #1e2638',
                  alignItems: 'center',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(30, 38, 56, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Node */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 5, backgroundColor: '#1e2638', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${node.progress}%`, backgroundColor: sts.text, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888', minWidth: 30 }}>{node.progress}%</span>
                </div>
                {/* Lead */}
                <span style={{ fontSize: 12, color: '#a09888' }}>
                  {leadMembers.map((m) => m!.name.split(' ')[0]).join(', ')}
                </span>
                {/* Last Update */}
                <span style={{ fontSize: 11, color: '#6b6358' }}>
                  {latestUpdate ? timeAgo(latestUpdate.timestamp) : metrics?.lastUpdate || '—'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Node Cards Grid ── */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {nodes.map((node) => {
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

            // Resolve lead names
            const leadMembers = node.leads
              .map((lid) => teamMembers.find((m) => m.id === lid))
              .filter(Boolean);

            // Contributors count
            const contributorsCount = leadMembers.length + (metrics?.extraContributors || 0);

            return (
              <div
                key={node.id}
                style={{
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2e3a4e';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e2638';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Gradient top accent */}
                <div
                  style={{
                    height: 3,
                    background: `linear-gradient(to right, ${sts.text}, transparent)`,
                  }}
                />

                <div style={{ padding: '20px 20px 16px' }}>
                  {/* Top row: icon + name + health badge + badges */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${node.gradient.includes('violet') ? 'rgba(139,92,246,0.12)' : node.gradient.includes('emerald') ? 'rgba(52,211,153,0.12)' : node.gradient.includes('amber') ? 'rgba(212,165,116,0.12)' : node.gradient.includes('orange') ? 'rgba(251,146,60,0.12)' : node.gradient.includes('teal') ? 'rgba(45,212,191,0.12)' : 'rgba(168,85,247,0.12)'}, transparent)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} className={node.color} style={{ color: sts.text }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>{node.name}</h3>
                        {/* Health Score Badge */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            color: healthColor(score),
                            backgroundColor: `${healthColor(score)}18`,
                            padding: '2px 8px',
                            borderRadius: 10,
                            lineHeight: 1.4,
                            border: `1px solid ${healthColor(score)}30`,
                          }}
                        >
                          <Activity size={10} />
                          {score}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
                            padding: '3px 8px',
                            borderRadius: 6,
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
                            padding: '3px 8px',
                            borderRadius: 6,
                            lineHeight: 1,
                          }}
                        >
                          {pri.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purpose */}
                  <p style={{ fontSize: 13, color: '#a09888', lineHeight: 1.55, margin: '0 0 16px 0' }}>
                    {node.purpose}
                  </p>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888' }}>Progress</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#f0ebe4' }}>{node.progress}%</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        backgroundColor: '#1e2638',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${node.progress}%`,
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${sts.text}, ${sts.text}88)`,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
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
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: lvl <= nodeMaturity[matKey].level ? sts.text : '#1e2638',
                              transition: 'background-color 0.3s ease',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leads */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: '#6b6358', marginRight: 4 }}>Leads:</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {leadMembers.map((member, i) => (
                          <div
                            key={member!.id}
                            title={member!.name}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #c4925a, #d4a574)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#0b0d14',
                              border: '2px solid #131720',
                              marginLeft: i > 0 ? -6 : 0,
                              zIndex: leadMembers.length - i,
                              position: 'relative',
                            }}
                          >
                            {member!.avatar}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: '#a09888', marginLeft: 4 }}>
                        {leadMembers.map((m) => m!.name.split(' ')[0]).join(', ')}
                      </span>
                    </div>
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
                          border: '1px solid #1e2638',
                          backgroundColor: 'transparent',
                          color: '#a09888',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.15s, color 0.15s',
                          marginBottom: latestUpdate ? 8 : 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#d4a574';
                          e.currentTarget.style.color = '#d4a574';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#1e2638';
                          e.currentTarget.style.color = '#a09888';
                        }}
                      >
                        <MessageSquarePlus size={13} />
                        Post Update
                      </button>
                    )}

                    {/* Inline update textarea */}
                    {isUpdating && (
                      <div style={{ marginBottom: 8 }}>
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
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a574'; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            onClick={() => handlePostUpdate(node.id)}
                            disabled={!updateText.trim()}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 6,
                              border: 'none',
                              backgroundColor: updateText.trim() ? '#d4a574' : '#2e3a4e',
                              color: updateText.trim() ? '#0b0d14' : '#6b6358',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: updateText.trim() ? 'pointer' : 'not-allowed',
                              fontFamily: 'inherit',
                              transition: 'background-color 0.15s',
                            }}
                          >
                            Post
                          </button>
                          <button
                            onClick={() => { setUpdateNodeId(null); setUpdateText(''); }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 6,
                              border: '1px solid #1e2638',
                              backgroundColor: 'transparent',
                              color: '#a09888',
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
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
                        backgroundColor: 'rgba(212, 165, 116, 0.06)',
                        borderRadius: 8,
                        borderLeft: '3px solid #d4a57440',
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
                      borderTop: '1px solid #1e2638',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: '#a09888',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#d4a574'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#a09888'; }}
                  >
                    <span>{isExpanded ? 'Hide' : 'Show'} Capabilities ({node.capabilities.length})</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Expanded content: Capabilities + Metrics */}
                  {isExpanded && (
                    <div style={{ paddingTop: 8 }}>
                      {/* Node Metrics Row */}
                      {metrics && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 10,
                          marginBottom: 16,
                          padding: '12px',
                          backgroundColor: 'rgba(30, 38, 56, 0.25)',
                          borderRadius: 10,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <CheckCircle2 size={14} style={{ color: '#8b5cf6' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>{metrics.activeTasks}</div>
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
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>{contributorsCount}</div>
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

                      {/* Capabilities list */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
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
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                backgroundColor: sts.text,
                                flexShrink: 0,
                                marginTop: 6,
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

      {/* ── Cross-Node Dependencies ── */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', marginBottom: 16 }}>
          Cross-Node Dependencies
        </h2>
        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 14,
            padding: '20px 24px',
          }}
        >
          {/* Strength legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1e2638' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6358' }}>Strength:</span>
            {(['strong', 'medium', 'weak'] as const).map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: strengthColors[s],
                }} />
                <span style={{ fontSize: 11, color: '#a09888', textTransform: 'capitalize' }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {crossDeps.map((dep, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  paddingBottom: idx < crossDeps.length - 1 ? 16 : 0,
                  borderBottom: idx < crossDeps.length - 1 ? '1px solid #1e2638' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                  {/* Strength dot */}
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: strengthColors[dep.strength],
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${strengthColors[dep.strength]}40`,
                  }} />
                  <span style={{ color: '#d4a574' }}>{dep.from}</span>
                  <ArrowRight size={14} style={{ color: '#6b6358' }} />
                  <span style={{ color: '#f0ebe4' }}>{dep.to}</span>
                  {/* Strength label */}
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: strengthColors[dep.strength],
                    backgroundColor: `${strengthColors[dep.strength]}15`,
                    padding: '2px 6px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}>
                    {dep.strength}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#6b6358', paddingLeft: 20 }}>
                  {dep.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
