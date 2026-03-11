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
    @keyframes kg-orbit-pulse {
      0%, 100% { opacity: 0.15; }
      50% { opacity: 0.35; }
    }
    @keyframes kg-connection-particle {
      0% { offset-distance: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { offset-distance: 100%; opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Component ───

export function KnowledgeGraphView() {
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [animationTick, setAnimationTick] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    injectKeyframes();
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

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 28,
          animation: 'kg-fade-in 0.5s ease both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(212, 165, 116, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Network size={22} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0ebe4', margin: 0, letterSpacing: '-0.02em' }}>
              Knowledge Graph
            </h1>
            <p style={{ fontSize: 14, color: '#a09888', margin: 0 }}>
              A living network of nodes, people, and relationships powering the Frequency ecosystem
            </p>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          marginBottom: 24,
          animation: 'kg-fade-in 0.6s ease 0.1s both',
        }}
      >
        {[
          { label: 'Active Nodes', value: nodes.length, color: '#6b8f71', icon: Zap },
          { label: 'Team Members', value: teamMembers.length, color: '#38bdf8', icon: Users },
          { label: 'Connections', value: relations.length, color: '#8b5cf6', icon: Network },
          {
            label: 'Avg Progress',
            value: `${Math.round(nodes.reduce((s, n) => s + n.progress, 0) / nodes.length)}%`,
            color: '#d4a574',
            icon: Globe,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f0ebe4' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#6b6358' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: Graph + Detail Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: detailEntity ? '1fr 340px' : '1fr',
          gap: 16,
          transition: 'grid-template-columns 0.3s ease',
          animation: 'kg-fade-in 0.7s ease 0.2s both',
        }}
      >
        {/* Graph Container */}
        <div
          style={{
            backgroundColor: '#0d1018',
            border: '1px solid #1e2638',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Ambient corner glows */}
          <div
            style={{
              position: 'absolute',
              top: -80,
              left: -80,
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -80,
              right: -80,
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 165, 116, 0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Legend */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 5,
              backgroundColor: 'rgba(13, 16, 24, 0.92)',
              backdropFilter: 'blur(8px)',
              borderRadius: 12,
              padding: '14px 16px',
              border: '1px solid #1e2638',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Legend
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Node types */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 6, border: '2px solid #6b8f71', background: 'rgba(107, 143, 113, 0.15)' }} />
                <span style={{ fontSize: 11, color: '#a09888' }}>Frequency Node</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #38bdf8', background: 'rgba(56, 189, 248, 0.15)' }} />
                <span style={{ fontSize: 11, color: '#a09888' }}>Team Member</span>
              </div>
              <div style={{ height: 1, backgroundColor: '#1e2638', margin: '4px 0' }} />
              {/* Relationship types */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 18, height: 2, backgroundColor: '#d4a574', borderRadius: 1 }} />
                <span style={{ fontSize: 11, color: '#a09888' }}>Leads</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 18, height: 2, backgroundColor: '#8b5cf6', borderRadius: 1, opacity: 0.6 }} />
                <span style={{ fontSize: 11, color: '#a09888' }}>Supports</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 18, height: 2, backgroundColor: '#6b8f71', borderRadius: 1 }} />
                <span style={{ fontSize: 11, color: '#a09888' }}>Node Link</span>
              </div>
            </div>
          </div>

          {/* Hint */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(13, 16, 24, 0.92)',
              backdropFilter: 'blur(8px)',
              borderRadius: 8,
              padding: '8px 12px',
              border: '1px solid #1e2638',
            }}
          >
            <Info size={12} style={{ color: '#6b6358' }} />
            <span style={{ fontSize: 11, color: '#6b6358' }}>Hover to highlight connections. Click to pin.</span>
          </div>

          {/* SVG Graph */}
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

              {/* Radial center gradient */}
              <radialGradient id="kg-center-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.04" />
                <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.01" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>

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

              {/* Soft shadow for node cards */}
              <filter id="kg-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="2" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.25" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background */}
            <rect width={graphWidth} height={graphHeight} fill="#0d1018" />
            <rect width={graphWidth} height={graphHeight} fill="url(#kg-grid)" />

            {/* Center ambient glow */}
            <circle cx={centerX} cy={centerY} r={300} fill="url(#kg-center-glow)" />

            {/* Orbit ring for nodes */}
            <circle
              cx={centerX}
              cy={centerY}
              r={220}
              fill="none"
              stroke="#1a1f2e"
              strokeWidth="1"
              strokeDasharray="8 8"
              style={{ animation: 'kg-orbit-pulse 4s ease-in-out infinite' }}
            />

            {/* Center label */}
            <text
              x={centerX}
              y={centerY - 10}
              textAnchor="middle"
              fill="#2a3040"
              fontSize={14}
              fontWeight={700}
              letterSpacing="0.1em"
            >
              FREQUENCY
            </text>
            <text
              x={centerX}
              y={centerY + 8}
              textAnchor="middle"
              fill="#1e2638"
              fontSize={10}
              fontWeight={600}
              letterSpacing="0.15em"
            >
              UNITE
            </text>

            {/* Connection lines */}
            {relations.map((relation, idx) => {
              const sourcePos = positionMap.get(relation.sourceId);
              const targetPos = positionMap.get(relation.targetId);
              if (!sourcePos || !targetPos) return null;

              const color = relationColors[relation.type];
              const isHighlighted =
                connectedSet &&
                (connectedSet.has(relation.sourceId) && connectedSet.has(relation.targetId));
              const isDimmed = connectedSet && !isHighlighted;

              const pathD = getCurvedPath(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);

              return (
                <g key={`rel-${idx}`}>
                  {/* Glow layer for highlighted connections */}
                  {isHighlighted && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={color}
                      strokeWidth={4}
                      opacity={0.15}
                      style={{ filter: 'blur(3px)' }}
                    />
                  )}

                  {/* Main path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHighlighted ? 2 : 1}
                    opacity={isDimmed ? 0.06 : isHighlighted ? 0.7 : 0.2}
                    strokeDasharray={relation.type === 'supports' ? '6 4' : relation.type === 'node-link' ? '10 5' : 'none'}
                    style={{
                      transition: 'opacity 0.3s ease, stroke-width 0.3s ease',
                    }}
                  />

                  {/* Animated dash flow on highlighted connections */}
                  {isHighlighted && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      opacity={0.5}
                      strokeDasharray="4 16"
                      style={{
                        animation: 'kg-dash-flow 2s linear infinite',
                      }}
                    />
                  )}

                  {/* Relationship label on highlighted node-link relations */}
                  {isHighlighted && relation.type === 'node-link' && (
                    <text
                      x={(sourcePos.x + targetPos.x) / 2}
                      y={(sourcePos.y + targetPos.y) / 2 - 8}
                      textAnchor="middle"
                      fill={color}
                      fontSize={9}
                      fontWeight={600}
                      opacity={0.8}
                      style={{ pointerEvents: 'none' }}
                    >
                      {relation.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Team member nodes (render first so Frequency nodes overlay) */}
            {positions
              .filter((p) => p.type === 'member')
              .map((entity) => {
                const member = entity.data as TeamMember;
                const color = getMemberColor(member);
                const isActive = activeEntityId === entity.id;
                const isConnected = connectedSet?.has(entity.id);
                const isDimmed = connectedSet && !isConnected;
                const r = isActive ? 20 : 16;

                return (
                  <g
                    key={entity.id}
                    style={{
                      cursor: 'pointer',
                      transition: 'opacity 0.3s ease',
                    }}
                    opacity={isDimmed ? 0.12 : 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity((prev) => (prev === entity.id ? null : entity.id));
                    }}
                    onMouseEnter={() => setHoveredEntity(entity.id)}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {/* Glow ring on active */}
                    {isActive && (
                      <circle
                        cx={entity.x}
                        cy={entity.y}
                        r={r + 8}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        opacity={0.3}
                        style={{
                          animation: 'kg-pulse-glow 2s ease-in-out infinite',
                        }}
                      />
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
                        opacity={0.35}
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Background circle */}
                    <circle
                      cx={entity.x}
                      cy={entity.y}
                      r={r}
                      fill={isActive ? `${color}25` : '#0d1018'}
                      stroke={isActive ? color : isConnected ? `${color}70` : '#1e2638'}
                      strokeWidth={isActive ? 2 : 1.5}
                      style={{ transition: 'all 0.25s ease' }}
                    />

                    {/* Avatar text */}
                    <text
                      x={entity.x}
                      y={entity.y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isActive || isConnected ? color : '#6b6358'}
                      fontSize={isActive ? 11 : 9}
                      fontWeight={700}
                      style={{ pointerEvents: 'none', transition: 'fill 0.2s ease' }}
                    >
                      {member.avatar}
                    </text>

                    {/* Name label */}
                    <text
                      x={entity.x}
                      y={entity.y + r + 12}
                      textAnchor="middle"
                      fill={isActive || isConnected ? '#f0ebe4' : '#6b6358'}
                      fontSize={9}
                      fontWeight={isActive ? 600 : 400}
                      style={{ pointerEvents: 'none', transition: 'fill 0.2s ease' }}
                    >
                      {member.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

            {/* Frequency Node hubs (larger, more prominent) */}
            {positions
              .filter((p) => p.type === 'node')
              .map((entity) => {
                const node = entity.data as Node;
                const color = getNodeHex(node);
                const Icon = iconMap[node.icon] || Globe;
                const isActive = activeEntityId === entity.id;
                const isConnected = connectedSet?.has(entity.id);
                const isDimmed = connectedSet && !isConnected;
                const baseR = 34;
                const r = isActive ? 38 : isConnected ? 36 : baseR;

                return (
                  <g
                    key={entity.id}
                    style={{
                      cursor: 'pointer',
                      transition: 'opacity 0.3s ease',
                    }}
                    opacity={isDimmed ? 0.15 : 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity((prev) => (prev === entity.id ? null : entity.id));
                    }}
                    onMouseEnter={() => setHoveredEntity(entity.id)}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {/* Ambient pulsing glow */}
                    <circle
                      cx={entity.x}
                      cy={entity.y}
                      r={r + 16}
                      fill={color}
                      opacity={isActive ? 0.08 : 0.03}
                      style={{
                        transition: 'opacity 0.3s ease',
                      }}
                    />

                    {/* Active glow ring */}
                    {isActive && (
                      <>
                        <circle
                          cx={entity.x}
                          cy={entity.y}
                          r={r + 10}
                          fill="none"
                          stroke={color}
                          strokeWidth={2}
                          opacity={0.25}
                        >
                          <animate
                            attributeName="r"
                            values={`${r + 8};${r + 14};${r + 8}`}
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.25;0.1;0.25"
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          cx={entity.x}
                          cy={entity.y}
                          r={r + 5}
                          fill="none"
                          stroke={color}
                          strokeWidth={1.5}
                          opacity={0.4}
                        />
                      </>
                    )}

                    {/* Connected indicator ring */}
                    {isConnected && !isActive && (
                      <circle
                        cx={entity.x}
                        cy={entity.y}
                        r={r + 6}
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

                    {/* Main hexagonal-ish node shape (approximated with rounded rect) */}
                    <rect
                      x={entity.x - r}
                      y={entity.y - r}
                      width={r * 2}
                      height={r * 2}
                      rx={14}
                      ry={14}
                      fill={isActive ? `${color}18` : '#0d1018'}
                      stroke={isActive ? color : isConnected ? `${color}60` : '#1e2638'}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      filter="url(#kg-shadow)"
                      style={{ transition: 'all 0.25s ease' }}
                    />

                    {/* Inner gradient overlay */}
                    <rect
                      x={entity.x - r + 1}
                      y={entity.y - r + 1}
                      width={r * 2 - 2}
                      height={r * 2 - 2}
                      rx={13}
                      ry={13}
                      fill={`${color}08`}
                      style={{ pointerEvents: 'none' }}
                    />

                    {/* Icon placeholder (colored dot since we cannot render React icons in SVG foreignObject reliably) */}
                    <circle
                      cx={entity.x}
                      cy={entity.y - 6}
                      r={8}
                      fill={`${color}25`}
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    <circle cx={entity.x} cy={entity.y - 6} r={3} fill={color} />

                    {/* Node short name */}
                    <text
                      x={entity.x}
                      y={entity.y + 12}
                      textAnchor="middle"
                      fill={isActive || isConnected ? '#f0ebe4' : '#a09888'}
                      fontSize={11}
                      fontWeight={700}
                      style={{ pointerEvents: 'none', transition: 'fill 0.2s ease' }}
                    >
                      {node.shortName}
                    </text>

                    {/* Progress indicator below */}
                    <rect
                      x={entity.x - 18}
                      y={entity.y + r + 6}
                      width={36}
                      height={3}
                      rx={1.5}
                      fill="#1e2638"
                    />
                    <rect
                      x={entity.x - 18}
                      y={entity.y + r + 6}
                      width={(node.progress / 100) * 36}
                      height={3}
                      rx={1.5}
                      fill={color}
                      opacity={0.7}
                    />

                    {/* Progress text */}
                    <text
                      x={entity.x}
                      y={entity.y + r + 18}
                      textAnchor="middle"
                      fill={color}
                      fontSize={8}
                      fontWeight={600}
                      opacity={0.7}
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.progress}%
                    </text>

                    {/* Status dot */}
                    <circle
                      cx={entity.x + r - 6}
                      cy={entity.y - r + 6}
                      r={4}
                      fill={
                        node.status === 'active'
                          ? '#6b8f71'
                          : node.status === 'building'
                            ? '#d4a574'
                            : node.status === 'pilot'
                              ? '#60a5fa'
                              : '#6b6358'
                      }
                      stroke="#0d1018"
                      strokeWidth={2}
                    />
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Detail Panel */}
        {detailEntity && (
          <div
            style={{
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 16,
              overflow: 'hidden',
              alignSelf: 'start',
              animation: 'kg-fade-in 0.3s ease both',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid #1e2638',
                background:
                  detailEntity.entity.type === 'node'
                    ? `linear-gradient(135deg, ${getNodeHex(detailEntity.entity.data as Node)}0a, transparent)`
                    : `linear-gradient(135deg, ${getMemberColor(detailEntity.entity.data as TeamMember)}0a, transparent)`,
              }}
            >
              {detailEntity.entity.type === 'node' ? (
                (() => {
                  const node = detailEntity.entity.data as Node;
                  const color = getNodeHex(node);
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: `${color}15`,
                            border: `1px solid ${color}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {React.createElement(iconMap[node.icon] || Globe, {
                            size: 20,
                            style: { color },
                          })}
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>
                            {node.name}
                          </h3>
                          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color }}>
                            {node.status} / {node.priority}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.55, margin: 0 }}>
                        {node.purpose}
                      </p>

                      {/* Progress bar */}
                      <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6358' }}>Progress</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color }}>{node.progress}%</span>
                        </div>
                        <div style={{ height: 4, backgroundColor: '#1e2638', borderRadius: 2, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${node.progress}%`,
                              borderRadius: 2,
                              background: `linear-gradient(90deg, ${color}, ${color}88)`,
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div style={{ marginTop: 14 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Capabilities
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                          {node.capabilities.slice(0, 4).map((cap, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: 10,
                                fontWeight: 500,
                                color: '#a09888',
                                backgroundColor: '#1a1f2e',
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid #252d3d',
                              }}
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : (
                (() => {
                  const member = detailEntity.entity.data as TeamMember;
                  const color = getMemberColor(member);
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${color}, ${color}88)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#0b0d14',
                          }}
                        >
                          {member.avatar}
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>
                            {member.name}
                          </h3>
                          <span style={{ fontSize: 11, color, fontWeight: 500 }}>{member.role}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.55, margin: 0 }}>
                        {member.roleOneSentence}
                      </p>

                      {/* Status */}
                      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: member.status === 'active' ? '#6b8f71' : '#d4a574',
                            backgroundColor: member.status === 'active' ? 'rgba(107, 143, 113, 0.15)' : 'rgba(212, 165, 116, 0.15)',
                            padding: '3px 8px',
                            borderRadius: 6,
                            textTransform: 'capitalize',
                          }}
                        >
                          {member.status}
                        </span>
                        {member.hoursPerWeek && (
                          <span style={{ fontSize: 10, color: '#6b6358' }}>
                            {member.hoursPerWeek} hrs/wk
                          </span>
                        )}
                      </div>
                    </>
                  );
                })()
              )}
            </div>

            {/* Connections */}
            <div style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Network size={13} style={{ color: '#d4a574' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#d4a574' }}>
                  Connections ({detailEntity.connections.length})
                </span>
              </div>

              {detailEntity.connections.length === 0 ? (
                <p style={{ fontSize: 12, color: '#6b6358', fontStyle: 'italic', margin: 0 }}>
                  No connections
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
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
                          padding: '8px 10px',
                          backgroundColor: '#0d1018',
                          border: '1px solid #1a1f2e',
                          borderRadius: 10,
                          cursor: 'pointer',
                          transition: 'border-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `${color}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#1a1f2e';
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: isNode ? 3 : '50%',
                            backgroundColor: color,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>
                            {label}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: relColor,
                            backgroundColor: `${relColor}15`,
                            padding: '2px 6px',
                            borderRadius: 4,
                            flexShrink: 0,
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

            {/* Clear button */}
            {selectedEntity && (
              <div style={{ padding: '0 20px 16px' }}>
                <button
                  onClick={() => setSelectedEntity(null)}
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    borderRadius: 8,
                    border: '1px solid #1e2638',
                    backgroundColor: 'transparent',
                    color: '#6b6358',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#a09888';
                    e.currentTarget.style.borderColor = '#2e3a4e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b6358';
                    e.currentTarget.style.borderColor = '#1e2638';
                  }}
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Node Overview Grid */}
      <div
        style={{
          marginTop: 24,
          animation: 'kg-fade-in 0.8s ease 0.3s both',
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', marginBottom: 14 }}>
          Node Overview
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {nodes.map((node) => {
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
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 12,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}50`;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e2638';
                  e.currentTarget.style.boxShadow = 'none';
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
                    background: `linear-gradient(90deg, ${color}, transparent)`,
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: `${color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>{node.shortName}</div>
                    <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'capitalize' }}>{node.status}</div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 4, backgroundColor: '#1e2638', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${node.progress}%`,
                        backgroundColor: color,
                        borderRadius: 2,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{node.progress}%</span>
                </div>

                {/* Leads */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {leadMembers.map((m, i) => (
                    <div
                      key={m!.id}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${getMemberColor(m!)}, ${getMemberColor(m!)}88)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 8,
                        fontWeight: 700,
                        color: '#0b0d14',
                        border: '2px solid #131720',
                        marginLeft: i > 0 ? -4 : 0,
                      }}
                    >
                      {m!.avatar}
                    </div>
                  ))}
                  <span style={{ fontSize: 11, color: '#6b6358', marginLeft: 4 }}>
                    {leadMembers.map((m) => m!.name.split(' ')[0]).join(', ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
