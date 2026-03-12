'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Network,
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Sprout,
  BookOpen,
  Users,
  Info,
  Zap,
  Activity,
  Search,
  X,
  Sparkles,
  ArrowRight,
  Filter,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { nodes, teamMembers } from '@/lib/data';
import type { Node, TeamMember } from '@/lib/data';

// ─── Icon Mapping ───

const iconMap: Record<string, React.ElementType> = {
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Sprout,
  BookOpen,
};

// ─── Color extraction from node data ───

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

function getMemberColor(member: TeamMember): string {
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

// ─── Relationship types ───

type RelationType = 'leads' | 'supports' | 'node-link';

interface GraphRelation {
  sourceId: string;
  targetId: string;
  type: RelationType;
  label: string;
}

// ─── Build graph data from real data ───

function buildRelations(): GraphRelation[] {
  const relations: GraphRelation[] = [];

  // Node-to-node cross-dependencies
  const nodeDeps: { from: string; to: string; label: string }[] = [
    { from: 'thesis', to: 'capital', label: 'Scoring rubric' },
    { from: 'capital', to: 'map', label: 'Funded projects' },
    { from: 'map', to: 'bioregions', label: 'Geography data' },
    { from: 'megaphone', to: 'capital', label: 'Amplification' },
    { from: 'capitalism2', to: 'thesis', label: 'Theory input' },
    { from: 'map', to: 'megaphone', label: 'Story mapping' },
  ];

  nodeDeps.forEach((dep) => {
    relations.push({
      sourceId: `node-${dep.from}`,
      targetId: `node-${dep.to}`,
      type: 'node-link',
      label: dep.label,
    });
  });

  // Team member leads node
  nodes.forEach((node) => {
    node.leads.forEach((leadId) => {
      relations.push({
        sourceId: `member-${leadId}`,
        targetId: `node-${node.id}`,
        type: 'leads',
        label: 'leads',
      });
    });
  });

  // Additional support connections for key team members
  const supportLinks: { memberId: string; nodeId: string }[] = [
    { memberId: 'sian', nodeId: 'bioregions' },
    { memberId: 'james', nodeId: 'thesis' },
    { memberId: 'dave', nodeId: 'megaphone' },
    { memberId: 'colleen', nodeId: 'capital' },
    { memberId: 'max', nodeId: 'megaphone' },
  ];

  supportLinks.forEach((link) => {
    // Don't add duplicate if already a lead
    const node = nodes.find((n) => n.id === link.nodeId);
    if (node && !node.leads.includes(link.memberId)) {
      relations.push({
        sourceId: `member-${link.memberId}`,
        targetId: `node-${link.nodeId}`,
        type: 'supports',
        label: 'supports',
      });
    }
  });

  return relations;
}

// ─── Layout computation ───

interface PositionedEntity {
  id: string;
  x: number;
  y: number;
  type: 'node' | 'member';
  data: Node | TeamMember;
}

function computeRadialLayout(
  centerX: number,
  centerY: number,
  nodeRadius: number,
  memberRadius: number
): PositionedEntity[] {
  const positions: PositionedEntity[] = [];

  // Place 6 nodes as main hubs in a ring
  nodes.forEach((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
    positions.push({
      id: `node-${node.id}`,
      x: centerX + Math.cos(angle) * nodeRadius,
      y: centerY + Math.sin(angle) * nodeRadius,
      type: 'node',
      data: node,
    });
  });

  // Place team members orbiting around the nodes they lead/support
  const relations = buildRelations();
  const memberNodes = new Map<string, { nodeIds: string[]; angles: number[] }>();

  // Gather which nodes each member connects to
  teamMembers.forEach((member) => {
    const connectedNodeIds: string[] = [];
    relations.forEach((r) => {
      if (r.sourceId === `member-${member.id}` && r.targetId.startsWith('node-')) {
        connectedNodeIds.push(r.targetId);
      }
    });
    if (connectedNodeIds.length > 0) {
      memberNodes.set(member.id, { nodeIds: connectedNodeIds, angles: [] });
    }
  });

  // For each member, place them near their primary node
  const nodePositionMap = new Map<string, { x: number; y: number }>();
  positions.forEach((p) => {
    if (p.type === 'node') {
      nodePositionMap.set(p.id, { x: p.x, y: p.y });
    }
  });

  // Track how many members orbit each node to space them
  const nodeOrbitCounters = new Map<string, number>();

  teamMembers.forEach((member) => {
    const info = memberNodes.get(member.id);
    if (!info || info.nodeIds.length === 0) return;

    const primaryNodeId = info.nodeIds[0];
    const nodePos = nodePositionMap.get(primaryNodeId);
    if (!nodePos) return;

    const count = nodeOrbitCounters.get(primaryNodeId) || 0;
    nodeOrbitCounters.set(primaryNodeId, count + 1);

    // Calculate angle from center to this node, then offset for orbit
    const nodeAngle = Math.atan2(nodePos.y - centerY, nodePos.x - centerX);
    const orbitAngle = nodeAngle + (count - 1) * 0.5 - 0.25;
    const orbitDist = 75 + (count % 2) * 20;

    positions.push({
      id: `member-${member.id}`,
      x: nodePos.x + Math.cos(orbitAngle) * orbitDist,
      y: nodePos.y + Math.sin(orbitAngle) * orbitDist,
      type: 'member',
      data: member,
    });
  });

  return positions;
}

// ─── Relation colors ───

const relationColors: Record<RelationType, string> = {
  leads: '#d4a574',
  supports: '#8b5cf6',
  'node-link': '#6b8f71',
};

// ─── CSS Keyframes (injected once) ───

const KEYFRAMES_ID = 'kg-view-keyframes';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes kg-dash-flow {
      to { stroke-dashoffset: -40; }
    }
    @keyframes kg-pulse-glow {
      0%, 100% { opacity: 0.3; r: 38; }
      50% { opacity: 0.6; r: 44; }
    }
    @keyframes kg-node-breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }
    @keyframes kg-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes kg-fade-in-scale {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes kg-orbit-pulse {
      0%, 100% { opacity: 0.12; }
      50% { opacity: 0.30; }
    }
    @keyframes kg-orbit-rotate {
      from { stroke-dashoffset: 0; }
      to { stroke-dashoffset: -80; }
    }
    @keyframes kg-connection-particle {
      0% { offset-distance: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { offset-distance: 100%; opacity: 0; }
    }
    @keyframes kg-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes kg-gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes kg-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    @keyframes kg-ring-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes kg-glow-pulse {
      0%, 100% { box-shadow: 0 0 15px rgba(212, 165, 116, 0.08); }
      50% { box-shadow: 0 0 25px rgba(212, 165, 116, 0.15); }
    }
    @keyframes kg-stat-count {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes kg-line-draw {
      from { stroke-dashoffset: 1000; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes kg-particle-float {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      20% { opacity: 0.6; }
      80% { opacity: 0.6; }
      100% { transform: translateY(-30px) translateX(10px); opacity: 0; }
    }
    @keyframes kg-badge-pop {
      0% { transform: scale(0.8); opacity: 0; }
      60% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes kg-health-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(107, 143, 113, 0.3); }
      50% { box-shadow: 0 0 0 6px rgba(107, 143, 113, 0); }
    }
    @keyframes kg-empty-float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-8px) rotate(1deg); }
      66% { transform: translateY(-4px) rotate(-1deg); }
    }
    @keyframes kg-connection-flow {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -60; }
    }
    @keyframes kg-center-pulse {
      0%, 100% { opacity: 0.03; transform: scale(1); }
      50% { opacity: 0.07; transform: scale(1.05); }
    }
    @keyframes kg-svg-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Filter types ───

type FilterType = 'all' | 'nodes' | 'members' | 'leads' | 'supports' | 'node-links';

// ─── Health score computation ───

function computeHealthScore(): number {
  const avgProgress = nodes.reduce((s, n) => s + n.progress, 0) / nodes.length;
  const activeNodes = nodes.filter((n) => n.status === 'active' || n.status === 'building').length;
  const activeMembers = teamMembers.filter((m) => m.status === 'active').length;
  const nodeHealth = (activeNodes / nodes.length) * 100;
  const memberHealth = (activeMembers / teamMembers.length) * 100;
  return Math.round((avgProgress * 0.4 + nodeHealth * 0.3 + memberHealth * 0.3));
}

// ─── Component ───

export function KnowledgeGraphView() {
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [animationTick, setAnimationTick] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [entryAnimated, setEntryAnimated] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    injectKeyframes();
    // Trigger entry animations after a brief moment
    const timer = setTimeout(() => setEntryAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Slow animation tick for subtle ambient effects
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTick((t) => (t + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const graphWidth = 900;
  const graphHeight = 750;
  const centerX = graphWidth / 2;
  const centerY = graphHeight / 2;

  const relations = useMemo(() => buildRelations(), []);

  const positions = useMemo(
    () => computeRadialLayout(centerX, centerY, 220, 310),
    [centerX, centerY]
  );

  const positionMap = useMemo(() => {
    const map = new Map<string, PositionedEntity>();
    positions.forEach((p) => map.set(p.id, p));
    return map;
  }, [positions]);

  const healthScore = useMemo(() => computeHealthScore(), []);

  // Filter logic
  const filteredRelations = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'nodes' || activeFilter === 'members') return relations;
    if (activeFilter === 'leads') return relations.filter((r) => r.type === 'leads');
    if (activeFilter === 'supports') return relations.filter((r) => r.type === 'supports');
    if (activeFilter === 'node-links') return relations.filter((r) => r.type === 'node-link');
    return relations;
  }, [relations, activeFilter]);

  // Search filtering
  const filteredPositions = useMemo(() => {
    let filtered = positions;
    if (activeFilter === 'nodes') filtered = filtered.filter((p) => p.type === 'node');
    if (activeFilter === 'members') filtered = filtered.filter((p) => p.type === 'member');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        if (p.type === 'node') {
          const node = p.data as Node;
          return node.name.toLowerCase().includes(q) || node.shortName.toLowerCase().includes(q);
        } else {
          const member = p.data as TeamMember;
          return member.name.toLowerCase().includes(q) || member.role.toLowerCase().includes(q);
        }
      });
    }
    return filtered;
  }, [positions, activeFilter, searchQuery]);

  const filteredEntityIds = useMemo(() => new Set(filteredPositions.map((p) => p.id)), [filteredPositions]);

  // Determine connected entities for hover/select highlighting
  const getConnectedIds = useCallback(
    (entityId: string): Set<string> => {
      const connected = new Set<string>();
      connected.add(entityId);
      relations.forEach((r) => {
        if (r.sourceId === entityId) connected.add(r.targetId);
        if (r.targetId === entityId) connected.add(r.sourceId);
      });
      return connected;
    },
    [relations]
  );

  const activeEntityId = hoveredEntity || selectedEntity;
  const connectedSet = useMemo(
    () => (activeEntityId ? getConnectedIds(activeEntityId) : null),
    [activeEntityId, getConnectedIds]
  );

  // Detail panel data
  const detailEntity = useMemo(() => {
    const id = selectedEntity || hoveredEntity;
    if (!id) return null;
    const pos = positionMap.get(id);
    if (!pos) return null;

    const connections = relations
      .filter((r) => r.sourceId === id || r.targetId === id)
      .map((r) => {
        const otherId = r.sourceId === id ? r.targetId : r.sourceId;
        const otherPos = positionMap.get(otherId);
        return { relation: r, other: otherPos };
      })
      .filter((c) => c.other);

    return { entity: pos, connections };
  }, [selectedEntity, hoveredEntity, positionMap, relations]);

  // ─── SVG path for curved connection lines ───
  const getCurvedPath = useCallback(
    (x1: number, y1: number, x2: number, y2: number): string => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curvature = dist * 0.15;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      // Perpendicular offset for curve
      const nx = -dy / dist;
      const ny = dx / dist;
      const cx = mx + nx * curvature;
      const cy = my + ny * curvature;
      return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
    },
    []
  );

  // Filter pill definitions
  const filterPills: { key: FilterType; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'all', label: 'All', icon: Eye, count: positions.length },
    { key: 'nodes', label: 'Nodes', icon: Network, count: nodes.length },
    { key: 'members', label: 'People', icon: Users, count: teamMembers.length },
    { key: 'leads', label: 'Leads', icon: ArrowRight, count: relations.filter((r) => r.type === 'leads').length },
    { key: 'supports', label: 'Supports', icon: Activity, count: relations.filter((r) => r.type === 'supports').length },
    { key: 'node-links', label: 'Node Links', icon: Zap, count: relations.filter((r) => r.type === 'node-link').length },
  ];

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#6b8f71';
      case 'building': return '#d4a574';
      case 'pilot': return '#60a5fa';
      case 'planned': return '#8b5cf6';
      default: return '#6b6358';
    }
  };

  // Health score color
  const healthColor = healthScore >= 75 ? '#6b8f71' : healthScore >= 50 ? '#d4a574' : '#fb7185';

  return (
    <div className="scrollbar-autohide" style={{
      padding: '32px 24px',
      maxWidth: 1300,
      margin: '0 auto',
      opacity: entryAnimated ? 1 : 0,
      transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* ═══════════════════════════════════ HEADER ═══════════════════════════════════ */}
      <div
        style={{
          marginBottom: 28,
          animation: 'kg-fade-in-scale 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
          position: 'relative',
        }}
      >
        <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Icon container with animated glow */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(212, 165, 116, 0.15))',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'kg-glow-pulse 3s ease-in-out infinite',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Shimmer overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.08), transparent)',
                backgroundSize: '200% 100%',
                animation: 'kg-shimmer 3s ease-in-out infinite',
              }} />
              <Network size={24} style={{ color: '#8b5cf6', position: 'relative', zIndex: 1 }} />
            </div>
            <div>
              <h1 className="text-glow" style={{
                fontSize: 28,
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #f0ebe4, #d4a574, #8b5cf6)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'kg-gradient-shift 6s ease infinite',
              }}>
                Knowledge Graph
              </h1>
              <p style={{ fontSize: 14, color: '#a09888', margin: 0, letterSpacing: '-0.01em' }}>
                A living network of nodes, people, and relationships powering the Frequency ecosystem
              </p>
            </div>
          </div>

          {/* Health Score Badge */}
          <div
            className="card-stat"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 18px',
              borderRadius: 14,
              background: 'rgba(19, 23, 32, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 165, 116, 0.08)',
              animation: 'kg-badge-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
            }}
          >
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: healthColor,
              animation: 'kg-health-pulse 2s ease-in-out infinite',
            }} />
            <div>
              <div style={{ fontSize: 10, color: '#6b6358', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Ecosystem Health
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: healthColor, lineHeight: 1 }}>
                {healthScore}%
              </div>
            </div>
            <TrendingUp size={16} style={{ color: healthColor, opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════ STAT BADGES ═══════════════════════════════════ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          marginBottom: 20,
          animation: 'kg-fade-in-scale 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        }}
      >
        {[
          { label: 'Active Nodes', value: nodes.length, color: '#6b8f71', icon: Zap, suffix: '' },
          { label: 'Team Members', value: teamMembers.length, color: '#38bdf8', icon: Users, suffix: '' },
          { label: 'Connections', value: relations.length, color: '#8b5cf6', icon: Network, suffix: '' },
          {
            label: 'Avg Progress',
            value: Math.round(nodes.reduce((s, n) => s + n.progress, 0) / nodes.length),
            color: '#d4a574',
            icon: Globe,
            suffix: '%',
          },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className="card-stat"
            style={{
              background: 'rgba(19, 23, 32, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 165, 116, 0.08)',
              borderRadius: 14,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default',
              animation: `kg-stat-count 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + idx * 0.08}s both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${stat.color}30`;
              e.currentTarget.style.boxShadow = `0 4px 24px ${stat.color}12, inset 0 1px 0 ${stat.color}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Background gradient accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, ${stat.color}60, ${stat.color}10, transparent)`,
              borderRadius: '14px 14px 0 0',
            }} />
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${stat.color}18, ${stat.color}08)`,
                border: `1px solid ${stat.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#f0ebe4',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                {stat.value}{stat.suffix}
              </div>
              <div style={{ fontSize: 11, color: '#6b6358', fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════ FILTER & SEARCH BAR ═══════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
          animation: 'kg-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        }}
      >
        {/* Search input */}
        <div
          style={{
            position: 'relative',
            flex: '0 0 260px',
          }}
        >
          <Search size={14} style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: isSearchFocused ? '#d4a574' : '#6b6358',
            transition: 'color 0.25s ease',
          }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search nodes or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              width: '100%',
              padding: '9px 36px 9px 34px',
              borderRadius: 10,
              border: `1px solid ${isSearchFocused ? 'rgba(212, 165, 116, 0.3)' : 'rgba(212, 165, 116, 0.08)'}`,
              background: 'rgba(19, 23, 32, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: '#f0ebe4',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isSearchFocused ? '0 0 0 3px rgba(212, 165, 116, 0.08)' : 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={12} style={{ color: '#6b6358' }} />
            </button>
          )}
        </div>

        {/* Filter separator */}
        <div style={{ width: 1, height: 24, backgroundColor: '#1e2638', flexShrink: 0 }} />

        {/* Filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Filter size={13} style={{ color: '#6b6358', marginRight: 2 }} />
          {filterPills.map((pill) => {
            const isActive = activeFilter === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => setActiveFilter(pill.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${isActive ? 'rgba(212, 165, 116, 0.3)' : 'rgba(212, 165, 116, 0.08)'}`,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.12), rgba(139, 92, 246, 0.08))'
                    : 'rgba(19, 23, 32, 0.5)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: isActive ? '#d4a574' : '#6b6358',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 0 0 2px rgba(212, 165, 116, 0.08)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.15)';
                    e.currentTarget.style.color = '#a09888';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.08)';
                    e.currentTarget.style.color = '#6b6358';
                  }
                }}
              >
                <pill.icon size={11} />
                {pill.label}
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  backgroundColor: isActive ? 'rgba(212, 165, 116, 0.15)' : 'rgba(255,255,255,0.05)',
                  padding: '1px 5px',
                  borderRadius: 4,
                  minWidth: 16,
                  textAlign: 'center',
                }}>
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════ MAIN CONTENT ═══════════════════════════════════ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: detailEntity ? '1fr 360px' : '1fr',
          gap: 16,
          transition: 'grid-template-columns 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: 'kg-fade-in-scale 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both',
        }}
      >
        {/* ─────────── Graph Container ─────────── */}
        <div
          className="card-premium"
          style={{
            background: 'rgba(13, 16, 24, 0.9)',
            border: '1px solid rgba(212, 165, 116, 0.08)',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Ambient corner glows */}
          <div
            style={{
              position: 'absolute',
              top: -100,
              left: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'kg-center-pulse 6s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 165, 116, 0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'kg-center-pulse 6s ease-in-out infinite 3s',
            }}
          />
          {/* Top-right subtle glow */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: '30%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(107, 143, 113, 0.04) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* ─── Premium Legend Panel ─── */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 5,
              background: 'rgba(19, 23, 32, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 14,
              padding: '16px 18px',
              border: '1px solid rgba(212, 165, 116, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              animation: 'kg-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both',
            }}
          >
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#d4a574',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <Sparkles size={10} style={{ color: '#d4a574' }} />
              Legend
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {/* Node types */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 7,
                  border: '2px solid #6b8f71',
                  background: 'linear-gradient(135deg, rgba(107, 143, 113, 0.2), rgba(107, 143, 113, 0.05))',
                  boxShadow: '0 0 8px rgba(107, 143, 113, 0.15)',
                }} />
                <span style={{ fontSize: 11, color: '#a09888', fontWeight: 500 }}>Frequency Node</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid #38bdf8',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.05))',
                  boxShadow: '0 0 8px rgba(56, 189, 248, 0.15)',
                }} />
                <span style={{ fontSize: 11, color: '#a09888', fontWeight: 500 }}>Team Member</span>
              </div>
              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(212, 165, 116, 0.1), transparent)', margin: '3px 0' }} />
              {/* Relationship types */}
              {[
                { color: '#d4a574', label: 'Leads', dash: false },
                { color: '#8b5cf6', label: 'Supports', dash: true },
                { color: '#6b8f71', label: 'Node Link', dash: false },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 20,
                    height: 3,
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: item.dash
                        ? `repeating-linear-gradient(90deg, ${item.color}, ${item.color} 4px, transparent 4px, transparent 7px)`
                        : `linear-gradient(90deg, ${item.color}, ${item.color}80)`,
                      borderRadius: 2,
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#a09888', fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Interaction Hint ─── */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(19, 23, 32, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 10,
              padding: '9px 14px',
              border: '1px solid rgba(212, 165, 116, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              animation: 'kg-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
            }}
          >
            <Info size={12} style={{ color: '#d4a574', opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: '#a09888', fontWeight: 500 }}>Hover to highlight. Click to pin.</span>
          </div>

          {/* ═══════════════════ SVG GRAPH ═══════════════════ */}
          <svg
            ref={svgRef}
            width="100%"
            height={graphHeight}
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            style={{ display: 'block', cursor: 'default' }}
            onClick={(e) => {
              if (e.target === e.currentTarget || (e.target as Element).tagName === 'rect') {
                setSelectedEntity(null);
              }
            }}
          >
            <defs>
              {/* Background grid pattern */}
              <pattern id="kg-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1a1f2e" strokeWidth="0.3" />
              </pattern>

              {/* Dot grid pattern */}
              <pattern id="kg-dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="0.5" fill="#1e2638" opacity="0.5" />
              </pattern>

              {/* Radial center gradient */}
              <radialGradient id="kg-center-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.05" />
                <stop offset="40%" stopColor="#d4a574" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>

              {/* Node gradient fills */}
              {nodes.map((node) => {
                const color = getNodeHex(node);
                return (
                  <React.Fragment key={`grad-${node.id}`}>
                    <linearGradient id={`kg-node-fill-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                      <stop offset="50%" stopColor={color} stopOpacity="0.06" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.12" />
                    </linearGradient>
                    <linearGradient id={`kg-node-fill-active-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                      <stop offset="50%" stopColor={color} stopOpacity="0.12" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.2" />
                    </linearGradient>
                    <radialGradient id={`kg-node-glow-${node.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </radialGradient>
                  </React.Fragment>
                );
              })}

              {/* Connection gradient definitions */}
              {['leads', 'supports', 'node-link'].map((type) => {
                const color = relationColors[type as RelationType];
                return (
                  <linearGradient key={`conn-grad-${type}`} id={`kg-conn-grad-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                    <stop offset="50%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.8" />
                  </linearGradient>
                );
              })}

              {/* Glow filters per color */}
              {['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#2dd4bf', '#c084fc', '#d4a574', '#8b5cf6', '#6b8f71', '#38bdf8'].map(
                (color, i) => (
                  <filter key={i} id={`kg-glow-${color.replace('#', '')}`} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                    <feFlood floodColor={color} floodOpacity="0.4" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                )
              )}

              {/* Enhanced shadow for node cards */}
              <filter id="kg-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dx="0" dy="3" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.35" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Soft glow filter for hover */}
              <filter id="kg-hover-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
                <feOffset dx="0" dy="0" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.2" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Member glow */}
              <filter id="kg-member-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feFlood floodColor="#38bdf8" floodOpacity="0.2" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background layers */}
            <rect width={graphWidth} height={graphHeight} fill="#0b0d14" />
            <rect width={graphWidth} height={graphHeight} fill="url(#kg-grid)" />
            <rect width={graphWidth} height={graphHeight} fill="url(#kg-dot-grid)" />

            {/* Center ambient glow */}
            <circle cx={centerX} cy={centerY} r={320} fill="url(#kg-center-glow)" style={{ animation: 'kg-center-pulse 8s ease-in-out infinite' }} />

            {/* Orbit rings with animated dashes */}
            <circle
              cx={centerX}
              cy={centerY}
              r={220}
              fill="none"
              stroke="#1a1f2e"
              strokeWidth="1"
              strokeDasharray="8 12"
              style={{ animation: 'kg-orbit-rotate 20s linear infinite' }}
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={160}
              fill="none"
              stroke="#1a1f2e"
              strokeWidth="0.5"
              strokeDasharray="4 16"
              opacity={0.5}
              style={{ animation: 'kg-orbit-rotate 30s linear infinite reverse' }}
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={280}
              fill="none"
              stroke="#1a1f2e"
              strokeWidth="0.5"
              strokeDasharray="2 20"
              opacity={0.3}
              style={{ animation: 'kg-orbit-rotate 40s linear infinite' }}
            />

            {/* Center label */}
            <text
              x={centerX}
              y={centerY - 12}
              textAnchor="middle"
              fill="#2a3040"
              fontSize={15}
              fontWeight={800}
              letterSpacing="0.15em"
            >
              FREQUENCY
            </text>
            <text
              x={centerX}
              y={centerY + 6}
              textAnchor="middle"
              fill="#1e2638"
              fontSize={10}
              fontWeight={700}
              letterSpacing="0.2em"
            >
              UNITE
            </text>
            {/* Subtle center dot */}
            <circle cx={centerX} cy={centerY + 18} r={2} fill="#2a3040" opacity={0.5} />

            {/* ─── Connection lines ─── */}
            {filteredRelations.map((relation, idx) => {
              const sourcePos = positionMap.get(relation.sourceId);
              const targetPos = positionMap.get(relation.targetId);
              if (!sourcePos || !targetPos) return null;

              // Apply search filter visibility
              const sourceVisible = filteredEntityIds.has(relation.sourceId);
              const targetVisible = filteredEntityIds.has(relation.targetId);
              if (searchQuery && !sourceVisible && !targetVisible) return null;

              const color = relationColors[relation.type];
              const isHighlighted =
                connectedSet &&
                (connectedSet.has(relation.sourceId) && connectedSet.has(relation.targetId));
              const isDimmed = connectedSet && !isHighlighted;

              const pathD = getCurvedPath(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);

              // Calculate distance for varying thickness
              const dx = targetPos.x - sourcePos.x;
              const dy = targetPos.y - sourcePos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const strengthWidth = relation.type === 'node-link' ? 2 : relation.type === 'leads' ? 1.5 : 1;

              return (
                <g key={`rel-${idx}`} style={{ animation: `kg-svg-fade-in 0.8s ease ${0.3 + idx * 0.02}s both` }}>
                  {/* Wide glow layer for highlighted connections */}
                  {isHighlighted && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={color}
                      strokeWidth={6}
                      opacity={0.12}
                      strokeLinecap="round"
                      style={{ filter: 'blur(4px)' }}
                    />
                  )}

                  {/* Secondary glow */}
                  {isHighlighted && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={color}
                      strokeWidth={4}
                      opacity={0.08}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Main path with gradient color */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHighlighted ? color : color}
                    strokeWidth={isHighlighted ? strengthWidth + 1 : strengthWidth}
                    opacity={isDimmed ? 0.04 : isHighlighted ? 0.75 : 0.15}
                    strokeLinecap="round"
                    strokeDasharray={
                      relation.type === 'supports'
                        ? '6 4'
                        : relation.type === 'node-link'
                          ? '12 6'
                          : 'none'
                    }
                    style={{
                      transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />

                  {/* Animated flowing particles on highlighted connections */}
                  {isHighlighted && (
                    <>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        opacity={0.6}
                        strokeDasharray="3 20"
                        strokeLinecap="round"
                        style={{
                          animation: 'kg-connection-flow 2s linear infinite',
                        }}
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth={1}
                        opacity={0.3}
                        strokeDasharray="2 28"
                        strokeLinecap="round"
                        style={{
                          animation: 'kg-connection-flow 2.5s linear infinite 0.5s',
                        }}
                      />
                    </>
                  )}

                  {/* Relationship label on highlighted node-link relations */}
                  {isHighlighted && relation.type === 'node-link' && (
                    <>
                      {/* Label background */}
                      <rect
                        x={(sourcePos.x + targetPos.x) / 2 - 36}
                        y={(sourcePos.y + targetPos.y) / 2 - 18}
                        width={72}
                        height={16}
                        rx={4}
                        fill="#0b0d14"
                        opacity={0.85}
                      />
                      <text
                        x={(sourcePos.x + targetPos.x) / 2}
                        y={(sourcePos.y + targetPos.y) / 2 - 7}
                        textAnchor="middle"
                        fill={color}
                        fontSize={9}
                        fontWeight={700}
                        opacity={0.9}
                        letterSpacing="0.02em"
                        style={{ pointerEvents: 'none' }}
                      >
                        {relation.label}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* ─── Team member nodes (render first so Frequency nodes overlay) ─── */}
            {positions
              .filter((p) => p.type === 'member')
              .map((entity, idx) => {
                const member = entity.data as TeamMember;
                const color = getMemberColor(member);
                const isActive = activeEntityId === entity.id;
                const isConnected = connectedSet?.has(entity.id);
                const isDimmed = connectedSet && !isConnected;
                const isSearchHidden = searchQuery && !filteredEntityIds.has(entity.id);
                const isFilterHidden = (activeFilter === 'nodes');
                const r = isActive ? 22 : 17;

                return (
                  <g
                    key={entity.id}
                    style={{
                      cursor: 'pointer',
                      transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      animation: `kg-svg-fade-in 0.6s ease ${0.4 + idx * 0.03}s both`,
                    }}
                    opacity={isSearchHidden || isFilterHidden ? 0.05 : isDimmed ? 0.1 : 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity((prev) => (prev === entity.id ? null : entity.id));
                    }}
                    onMouseEnter={() => setHoveredEntity(entity.id)}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {/* Outer glow halo on active */}
                    {isActive && (
                      <>
                        <circle
                          cx={entity.x}
                          cy={entity.y}
                          r={r + 14}
                          fill={color}
                          opacity={0.06}
                        >
                          <animate
                            attributeName="r"
                            values={`${r + 12};${r + 18};${r + 12}`}
                            dur="3s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.06;0.02;0.06"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          cx={entity.x}
                          cy={entity.y}
                          r={r + 8}
                          fill="none"
                          stroke={color}
                          strokeWidth={1.5}
                          opacity={0.35}
                          strokeDasharray="4 4"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            values="0;-16"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </>
                    )}

                    {/* Connected ring */}
                    {isConnected && !isActive && (
                      <circle
                        cx={entity.x}
                        cy={entity.y}
                        r={r + 5}
                        fill="none"
                        stroke={color}
                        strokeWidth={1}
                        opacity={0.4}
                        strokeDasharray="3 3"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="0;-12"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Background circle with gradient */}
                    <circle
                      cx={entity.x}
                      cy={entity.y}
                      r={r}
                      fill={isActive ? `${color}20` : '#0d1018'}
                      stroke={isActive ? color : isConnected ? `${color}60` : '#1e2638'}
                      strokeWidth={isActive ? 2 : 1.5}
                      style={{
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        filter: isActive ? `drop-shadow(0 0 6px ${color}40)` : 'none',
                      }}
                    />

                    {/* Inner gradient fill */}
                    {(isActive || isConnected) && (
                      <circle
                        cx={entity.x}
                        cy={entity.y}
                        r={r - 1}
                        fill={`${color}10`}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

                    {/* Avatar text */}
                    <text
                      x={entity.x}
                      y={entity.y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isActive || isConnected ? color : '#6b6358'}
                      fontSize={isActive ? 12 : 10}
                      fontWeight={700}
                      style={{
                        pointerEvents: 'none',
                        transition: 'fill 0.25s ease, font-size 0.25s ease',
                      }}
                    >
                      {member.avatar}
                    </text>

                    {/* Name label with background */}
                    <rect
                      x={entity.x - 28}
                      y={entity.y + r + 4}
                      width={56}
                      height={14}
                      rx={4}
                      fill="#0b0d14"
                      opacity={isActive || isConnected ? 0.7 : 0}
                      style={{ pointerEvents: 'none', transition: 'opacity 0.25s ease' }}
                    />
                    <text
                      x={entity.x}
                      y={entity.y + r + 13}
                      textAnchor="middle"
                      fill={isActive || isConnected ? '#f0ebe4' : '#6b6358'}
                      fontSize={9}
                      fontWeight={isActive ? 700 : 500}
                      style={{ pointerEvents: 'none', transition: 'fill 0.25s ease' }}
                    >
                      {member.name.split(' ')[0]}
                    </text>

                    {/* Status dot on member */}
                    <circle
                      cx={entity.x + r - 3}
                      cy={entity.y - r + 3}
                      r={3}
                      fill={member.status === 'active' ? '#6b8f71' : member.status === 'part-time' ? '#d4a574' : '#6b6358'}
                      stroke="#0b0d14"
                      strokeWidth={1.5}
                      style={{ transition: 'fill 0.25s ease' }}
                    />
                  </g>
                );
              })}

            {/* ─── Frequency Node hubs (larger, more prominent) ─── */}
            {positions
              .filter((p) => p.type === 'node')
              .map((entity, idx) => {
                const node = entity.data as Node;
                const color = getNodeHex(node);
                const Icon = iconMap[node.icon] || Globe;
                const isActive = activeEntityId === entity.id;
                const isConnected = connectedSet?.has(entity.id);
                const isDimmed = connectedSet && !isConnected;
                const isSearchHidden = searchQuery && !filteredEntityIds.has(entity.id);
                const isFilterHidden = (activeFilter === 'members');
                const baseR = 34;
                const r = isActive ? 40 : isConnected ? 37 : baseR;

                return (
                  <g
                    key={entity.id}
                    style={{
                      cursor: 'pointer',
                      transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      animation: `kg-svg-fade-in 0.7s ease ${0.3 + idx * 0.06}s both`,
                    }}
                    opacity={isSearchHidden || isFilterHidden ? 0.06 : isDimmed ? 0.12 : 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity((prev) => (prev === entity.id ? null : entity.id));
                    }}
                    onMouseEnter={() => setHoveredEntity(entity.id)}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {/* Ambient pulsing glow - large outer aura */}
                    <circle
                      cx={entity.x}
                      cy={entity.y}
                      r={r + 24}
                      fill={`url(#kg-node-glow-${node.id})`}
                      opacity={isActive ? 0.5 : 0.15}
                      style={{ transition: 'opacity 0.35s ease' }}
                    >
                      {isActive && (
                        <animate
                          attributeName="r"
                          values={`${r + 20};${r + 30};${r + 20}`}
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>

                    {/* Active multi-ring glow effect */}
                    {isActive && (
                      <>
                        {/* Outermost ring */}
                        <circle
                          cx={entity.x}
                          cy={entity.y}
                          r={r + 14}
                          fill="none"
                          stroke={color}
                          strokeWidth={1}
                          opacity={0.15}
                        >
                          <animate
                            attributeName="r"
                            values={`${r + 12};${r + 18};${r + 12}`}
                            dur="3s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.15;0.05;0.15"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Inner bright ring */}
                        <circle
                          cx={entity.x}
                          cy={entity.y}
                          r={r + 6}
                          fill="none"
                          stroke={color}
                          strokeWidth={2}
                          opacity={0.4}
                        />
                        {/* Spinning dashed ring */}
                        <circle
                          cx={entity.x}
                          cy={entity.y}
                          r={r + 10}
                          fill="none"
                          stroke={color}
                          strokeWidth={1}
                          opacity={0.25}
                          strokeDasharray="6 10"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            values="0;-32"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </>
                    )}

                    {/* Connected indicator ring */}
                    {isConnected && !isActive && (
                      <circle
                        cx={entity.x}
                        cy={entity.y}
                        r={r + 7}
                        fill="none"
                        stroke={color}
                        strokeWidth={1}
                        opacity={0.3}
                        strokeDasharray="5 5"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="0;-20"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Main node shape with gradient fill */}
                    <rect
                      x={entity.x - r}
                      y={entity.y - r}
                      width={r * 2}
                      height={r * 2}
                      rx={16}
                      ry={16}
                      fill={isActive ? `url(#kg-node-fill-active-${node.id})` : `url(#kg-node-fill-${node.id})`}
                      stroke={isActive ? color : isConnected ? `${color}50` : '#1e2638'}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      filter="url(#kg-shadow)"
                      style={{
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />

                    {/* Inner highlight line (top edge shine) */}
                    <line
                      x1={entity.x - r + 18}
                      y1={entity.y - r + 1}
                      x2={entity.x + r - 18}
                      y2={entity.y - r + 1}
                      stroke={color}
                      strokeWidth={1}
                      opacity={isActive ? 0.3 : 0.1}
                      strokeLinecap="round"
                      style={{ transition: 'opacity 0.3s ease' }}
                    />

                    {/* Icon placeholder with enhanced gradient */}
                    <circle
                      cx={entity.x}
                      cy={entity.y - 7}
                      r={10}
                      fill={`${color}20`}
                      stroke={color}
                      strokeWidth={isActive ? 2 : 1.5}
                      opacity={isActive ? 1 : 0.8}
                      style={{ transition: 'all 0.25s ease' }}
                    />
                    <circle
                      cx={entity.x}
                      cy={entity.y - 7}
                      r={3.5}
                      fill={color}
                      opacity={isActive ? 1 : 0.8}
                    >
                      {isActive && (
                        <animate
                          attributeName="r"
                          values="3.5;4.5;3.5"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>

                    {/* Node short name */}
                    <text
                      x={entity.x}
                      y={entity.y + 14}
                      textAnchor="middle"
                      fill={isActive || isConnected ? '#f0ebe4' : '#a09888'}
                      fontSize={isActive ? 12 : 11}
                      fontWeight={800}
                      letterSpacing="-0.01em"
                      style={{ pointerEvents: 'none', transition: 'fill 0.25s ease, font-size 0.25s ease' }}
                    >
                      {node.shortName}
                    </text>

                    {/* Progress bar (enhanced) */}
                    <rect
                      x={entity.x - 20}
                      y={entity.y + r + 7}
                      width={40}
                      height={4}
                      rx={2}
                      fill="#1a1f2e"
                    />
                    <rect
                      x={entity.x - 20}
                      y={entity.y + r + 7}
                      width={(node.progress / 100) * 40}
                      height={4}
                      rx={2}
                      fill={color}
                      opacity={0.8}
                    >
                      {isActive && (
                        <animate
                          attributeName="opacity"
                          values="0.8;1;0.8"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </rect>
                    {/* Progress glow on active */}
                    {isActive && (
                      <rect
                        x={entity.x - 20}
                        y={entity.y + r + 7}
                        width={(node.progress / 100) * 40}
                        height={4}
                        rx={2}
                        fill={color}
                        opacity={0.3}
                        style={{ filter: 'blur(3px)' }}
                      />
                    )}

                    {/* Progress text */}
                    <text
                      x={entity.x}
                      y={entity.y + r + 20}
                      textAnchor="middle"
                      fill={color}
                      fontSize={8}
                      fontWeight={700}
                      opacity={isActive ? 0.9 : 0.6}
                      style={{ pointerEvents: 'none', transition: 'opacity 0.25s ease' }}
                    >
                      {node.progress}%
                    </text>

                    {/* Status dot with glow */}
                    <circle
                      cx={entity.x + r - 7}
                      cy={entity.y - r + 7}
                      r={5}
                      fill={getStatusColor(node.status)}
                      stroke="#0b0d14"
                      strokeWidth={2}
                    />
                    {isActive && (
                      <circle
                        cx={entity.x + r - 7}
                        cy={entity.y - r + 7}
                        r={5}
                        fill={getStatusColor(node.status)}
                        opacity={0.4}
                        style={{ filter: 'blur(3px)' }}
                      />
                    )}
                  </g>
                );
              })}
          </svg>
        </div>

        {/* ─────────── Detail Panel (Glassmorphism) ─────────── */}
        {detailEntity && (
          <div
            className="card-premium scrollbar-autohide"
            style={{
              background: 'rgba(19, 23, 32, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 165, 116, 0.08)',
              borderRadius: 16,
              overflow: 'hidden',
              alignSelf: 'start',
              animation: 'kg-fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Header section */}
            <div
              style={{
                padding: '22px 22px 18px',
                borderBottom: '1px solid rgba(212, 165, 116, 0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background:
                  detailEntity.entity.type === 'node'
                    ? `linear-gradient(135deg, ${getNodeHex(detailEntity.entity.data as Node)}12, transparent 60%)`
                    : `linear-gradient(135deg, ${getMemberColor(detailEntity.entity.data as TeamMember)}12, transparent 60%)`,
                pointerEvents: 'none',
              }} />

              {detailEntity.entity.type === 'node' ? (
                (() => {
                  const node = detailEntity.entity.data as Node;
                  const color = getNodeHex(node);
                  return (
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 14,
                            background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                            border: `1px solid ${color}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 20px ${color}10`,
                          }}
                        >
                          {React.createElement(iconMap[node.icon] || Globe, {
                            size: 22,
                            style: { color },
                          })}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f0ebe4', margin: 0, letterSpacing: '-0.02em' }}>
                            {node.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: getStatusColor(node.status),
                              backgroundColor: `${getStatusColor(node.status)}15`,
                              padding: '2px 8px',
                              borderRadius: 5,
                              border: `1px solid ${getStatusColor(node.status)}20`,
                            }}>
                              {node.status}
                            </span>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#6b6358',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}>
                              {node.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.6, margin: 0 }}>
                        {node.purpose}
                      </p>

                      {/* Progress bar (premium) */}
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6358' }}>Progress</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color }}>{node.progress}%</span>
                        </div>
                        <div className="progress-bar-animated" style={{
                          height: 6,
                          backgroundColor: '#1a1f2e',
                          borderRadius: 3,
                          overflow: 'hidden',
                          position: 'relative',
                        }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${node.progress}%`,
                              borderRadius: 3,
                              background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Shimmer effect on progress bar */}
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                              backgroundSize: '200% 100%',
                              animation: 'kg-shimmer 2s ease-in-out infinite',
                            }} />
                          </div>
                          {/* Glow at progress tip */}
                          <div style={{
                            position: 'absolute',
                            top: -2,
                            left: `${node.progress}%`,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: color,
                            opacity: 0.3,
                            filter: 'blur(4px)',
                            transform: 'translateX(-50%)',
                          }} />
                        </div>
                      </div>

                      {/* Capabilities as domain tags */}
                      <div style={{ marginTop: 16 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#d4a574',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          marginBottom: 10,
                        }}>
                          <Sparkles size={10} />
                          Capabilities
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {node.capabilities.slice(0, 4).map((cap, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: '#a09888',
                                background: 'rgba(19, 23, 32, 0.5)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                padding: '4px 10px',
                                borderRadius: 7,
                                border: '1px solid rgba(212, 165, 116, 0.08)',
                                transition: 'border-color 0.2s ease',
                              }}
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Team leads section */}
                      {node.leads.length > 0 && (() => {
                        const leadMembers = node.leads
                          .map((lid) => teamMembers.find((m) => m.id === lid))
                          .filter(Boolean);
                        return (
                          <div style={{ marginTop: 16 }}>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#6b6358',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              marginBottom: 8,
                              display: 'block',
                            }}>
                              Node Leads
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {leadMembers.map((m, i) => (
                                <div
                                  key={m!.id}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${getMemberColor(m!)}, ${getMemberColor(m!)}88)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: '#0b0d14',
                                    border: '2px solid rgba(19, 23, 32, 0.7)',
                                    marginLeft: i > 0 ? -6 : 0,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease',
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEntity(`member-${m!.id}`);
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)';
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                  }}
                                >
                                  {m!.avatar}
                                </div>
                              ))}
                              <span style={{ fontSize: 11, color: '#a09888', marginLeft: 4, fontWeight: 500 }}>
                                {leadMembers.map((m) => m!.name.split(' ')[0]).join(', ')}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const member = detailEntity.entity.data as TeamMember;
                  const color = getMemberColor(member);
                  return (
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${color}, ${color}88)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#0b0d14',
                            boxShadow: `0 0 20px ${color}20`,
                            position: 'relative',
                          }}
                        >
                          {member.avatar}
                          {/* Status indicator on avatar */}
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: member.status === 'active' ? '#6b8f71' : member.status === 'part-time' ? '#d4a574' : '#6b6358',
                            border: '2px solid #131720',
                          }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f0ebe4', margin: 0, letterSpacing: '-0.02em' }}>
                            {member.name}
                          </h3>
                          <span style={{ fontSize: 12, color, fontWeight: 600 }}>{member.role}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.6, margin: 0 }}>
                        {member.roleOneSentence}
                      </p>

                      {/* Status & Hours */}
                      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: member.status === 'active' ? '#6b8f71' : '#d4a574',
                            backgroundColor: member.status === 'active' ? 'rgba(107, 143, 113, 0.12)' : 'rgba(212, 165, 116, 0.12)',
                            padding: '4px 10px',
                            borderRadius: 6,
                            textTransform: 'capitalize',
                            border: `1px solid ${member.status === 'active' ? 'rgba(107, 143, 113, 0.2)' : 'rgba(212, 165, 116, 0.2)'}`,
                          }}
                        >
                          {member.status}
                        </span>
                        {member.hoursPerWeek && (
                          <span style={{
                            fontSize: 10,
                            color: '#6b6358',
                            fontWeight: 600,
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: '1px solid rgba(212, 165, 116, 0.06)',
                          }}>
                            {member.hoursPerWeek} hrs/wk
                          </span>
                        )}
                      </div>

                      {/* Domains */}
                      {member.domains && member.domains.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#6b6358',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: 8,
                            display: 'block',
                          }}>
                            Domains
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {member.domains.slice(0, 4).map((domain, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: color,
                                  background: `${color}10`,
                                  padding: '3px 9px',
                                  borderRadius: 6,
                                  border: `1px solid ${color}15`,
                                }}
                              >
                                {domain}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Connections section */}
            <div style={{ padding: '16px 22px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                marginBottom: 14,
              }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: 'rgba(212, 165, 116, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Network size={11} style={{ color: '#d4a574' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#d4a574' }}>
                  Connections
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#6b6358',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  padding: '2px 7px',
                  borderRadius: 5,
                  marginLeft: 'auto',
                }}>
                  {detailEntity.connections.length}
                </span>
              </div>

              {detailEntity.connections.length === 0 ? (
                <p style={{ fontSize: 12, color: '#6b6358', fontStyle: 'italic', margin: 0 }}>
                  No connections
                </p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  maxHeight: 300,
                  overflowY: 'auto',
                }}>
                  {detailEntity.connections.map((conn, idx) => {
                    if (!conn.other) return null;
                    const isNode = conn.other.type === 'node';
                    const color = isNode
                      ? getNodeHex(conn.other.data as Node)
                      : getMemberColor(conn.other.data as TeamMember);
                    const label = isNode
                      ? (conn.other.data as Node).name
                      : (conn.other.data as TeamMember).name;
                    const relColor = relationColors[conn.relation.type];

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedEntity(conn.other!.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 12px',
                          background: 'rgba(11, 13, 20, 0.5)',
                          border: '1px solid rgba(212, 165, 116, 0.06)',
                          borderRadius: 10,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `${color}30`;
                          e.currentTarget.style.background = `rgba(11, 13, 20, 0.7)`;
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.06)';
                          e.currentTarget.style.background = 'rgba(11, 13, 20, 0.5)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: isNode ? 4 : '50%',
                            background: `linear-gradient(135deg, ${color}, ${color}88)`,
                            flexShrink: 0,
                            boxShadow: `0 0 6px ${color}30`,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#f0ebe4', letterSpacing: '-0.01em' }}>
                            {label}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: relColor,
                            backgroundColor: `${relColor}12`,
                            padding: '3px 8px',
                            borderRadius: 5,
                            flexShrink: 0,
                            border: `1px solid ${relColor}15`,
                          }}
                        >
                          {conn.relation.type.replace('-', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clear selection button */}
            {selectedEntity && (
              <div style={{ padding: '0 22px 18px' }}>
                <button
                  onClick={() => setSelectedEntity(null)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: 10,
                    border: '1px solid rgba(212, 165, 116, 0.1)',
                    background: 'rgba(212, 165, 116, 0.04)',
                    color: '#a09888',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#d4a574';
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.25)';
                    e.currentTarget.style.background = 'rgba(212, 165, 116, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#a09888';
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.1)';
                    e.currentTarget.style.background = 'rgba(212, 165, 116, 0.04)';
                  }}
                >
                  <X size={12} />
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════ NODE OVERVIEW GRID ═══════════════════════════════════ */}
      <div
        style={{
          marginTop: 28,
          animation: 'kg-fade-in-scale 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 16,
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(212, 165, 116, 0.08))',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={14} style={{ color: '#8b5cf6' }} />
          </div>
          <h2 style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#f0ebe4',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Node Overview
          </h2>
          <div style={{
            height: 1,
            flex: 1,
            background: 'linear-gradient(90deg, rgba(212, 165, 116, 0.1), transparent)',
            marginLeft: 8,
          }} />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 12,
          }}
        >
          {nodes.map((node, idx) => {
            const color = getNodeHex(node);
            const Icon = iconMap[node.icon] || Globe;
            const leadMembers = node.leads
              .map((lid) => teamMembers.find((m) => m.id === lid))
              .filter(Boolean);

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedEntity(`node-${node.id}`);
                  setHoveredEntity(null);
                }}
                style={{
                  background: 'rgba(19, 23, 32, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 165, 116, 0.08)',
                  borderRadius: 14,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `kg-fade-in-scale 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + idx * 0.06}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}35`;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${color}12, 0 0 0 1px ${color}08`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Top gradient accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${color}80, ${color}20, transparent)`,
                    borderRadius: '14px 14px 0 0',
                  }}
                />
                {/* Corner glow */}
                <div style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${color}08, transparent)`,
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${color}18, ${color}08)`,
                      border: `1px solid ${color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#f0ebe4', letterSpacing: '-0.02em' }}>{node.shortName}</div>
                    <div style={{
                      fontSize: 10,
                      color: getStatusColor(node.status),
                      textTransform: 'capitalize',
                      fontWeight: 600,
                    }}>
                      {node.status}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    flex: 1,
                    height: 5,
                    backgroundColor: '#1a1f2e',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${node.progress}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        borderRadius: 3,
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'kg-shimmer 3s ease-in-out infinite',
                      }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{node.progress}%</span>
                </div>

                {/* Leads */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {leadMembers.map((m, i) => (
                    <div
                      key={m!.id}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${getMemberColor(m!)}, ${getMemberColor(m!)}88)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 8,
                        fontWeight: 700,
                        color: '#0b0d14',
                        border: '2px solid rgba(19, 23, 32, 0.7)',
                        marginLeft: i > 0 ? -5 : 0,
                      }}
                    >
                      {m!.avatar}
                    </div>
                  ))}
                  <span style={{ fontSize: 11, color: '#6b6358', marginLeft: 4, fontWeight: 500 }}>
                    {leadMembers.map((m) => m!.name.split(' ')[0]).join(', ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════ EMPTY STATE (when search yields nothing) ═══════════════════════════════════ */}
      {searchQuery && filteredPositions.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 32px',
            animation: 'kg-fade-in 0.4s ease both',
          }}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(212, 165, 116, 0.08))',
            border: '1px solid rgba(212, 165, 116, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            animation: 'kg-empty-float 4s ease-in-out infinite',
          }}>
            <Search size={32} style={{ color: '#6b6358' }} />
          </div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#f0ebe4',
            margin: '0 0 8px',
          }}>
            No results found
          </h3>
          <p style={{
            fontSize: 14,
            color: '#6b6358',
            margin: '0 0 20px',
            textAlign: 'center',
            maxWidth: 340,
            lineHeight: 1.5,
          }}>
            No nodes or team members match your search. Try a different keyword or clear the filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: '1px solid rgba(212, 165, 116, 0.2)',
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.08), rgba(139, 92, 246, 0.06))',
              color: '#d4a574',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 165, 116, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Sparkles size={14} />
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
