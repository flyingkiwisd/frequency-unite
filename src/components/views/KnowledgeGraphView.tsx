'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Network,
  Target,
  Users,
  AlertTriangle,
  Scale,
  Globe,
  Filter,
  Link2,
  CircleDot,
  Maximize2,
  Info,
} from 'lucide-react';

// ─── Types ───

type EntityType = 'decision' | 'okr' | 'node' | 'person' | 'risk';

interface GraphEntity {
  id: string;
  label: string;
  type: EntityType;
  description?: string;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

// ─── Entity Type Config ───

const entityTypeConfig: Record<
  EntityType,
  { label: string; plural: string; color: string; bgAlpha: string; icon: React.ElementType }
> = {
  decision: {
    label: 'Decision',
    plural: 'Decisions',
    color: '#8b5cf6',
    bgAlpha: 'rgba(139, 92, 246, 0.15)',
    icon: Scale,
  },
  okr: {
    label: 'OKR',
    plural: 'OKRs',
    color: '#d4a574',
    bgAlpha: 'rgba(212, 165, 116, 0.15)',
    icon: Target,
  },
  node: {
    label: 'Node',
    plural: 'Nodes',
    color: '#34d399',
    bgAlpha: 'rgba(52, 211, 153, 0.15)',
    icon: Globe,
  },
  person: {
    label: 'Person',
    plural: 'People',
    color: '#38bdf8',
    bgAlpha: 'rgba(56, 189, 248, 0.15)',
    icon: Users,
  },
  risk: {
    label: 'Risk',
    plural: 'Risks',
    color: '#f43f5e',
    bgAlpha: 'rgba(244, 63, 94, 0.15)',
    icon: AlertTriangle,
  },
};

// ─── Mock Data: Entities ───

const entities: GraphEntity[] = [
  // Nodes (6)
  { id: 'n-map', label: 'Map', type: 'node', description: 'Geographic mapping of conscious economy projects worldwide' },
  { id: 'n-bioregions', label: 'Bioregions', type: 'node', description: 'Place-based regenerative economic pilots in bioregional contexts' },
  { id: 'n-capital', label: 'Capital', type: 'node', description: 'DAF-powered conscious capital deployment and deal flow' },
  { id: 'n-megaphone', label: 'Megaphone', type: 'node', description: 'Content, media, and distribution amplifying the conscious economy' },
  { id: 'n-cap2', label: 'Cap 2.0', type: 'node', description: 'Reimagining capitalism through new economic models and theory' },
  { id: 'n-thesis', label: 'Thesis', type: 'node', description: 'Thesis of Change scoring rubric for investment evaluation' },

  // OKRs (5)
  { id: 'o-stewards', label: 'Build 144 stewards', type: 'okr', description: 'Enroll 144 founding stewards by end of Q2 2026' },
  { id: 'o-daf', label: 'Operationalize DAF', type: 'okr', description: 'Deploy first tranche of DAF capital into aligned deals' },
  { id: 'o-nodes', label: 'Activate nodes', type: 'okr', description: 'Get all 6 nodes to active status with leads and OKRs' },
  { id: 'o-bluespirit', label: 'Blue Spirit', type: 'okr', description: 'Execute Blue Spirit retreat with measurable community outcomes' },
  { id: 'o-ops', label: 'Stabilize ops', type: 'okr', description: 'Hire fractional PM and establish operational cadence' },

  // Decisions (7)
  { id: 'd-teal', label: 'Teal governance', type: 'decision', description: 'Adopt teal self-management governance model organization-wide' },
  { id: 'd-daf', label: 'DAF approved', type: 'decision', description: 'Approved donor-advised fund structure through fiscal sponsor' },
  { id: 'd-pricing', label: 'Membership pricing', type: 'decision', description: 'Set individual membership tiers at $144/mo, $1,440/yr, $14,400 lifetime' },
  { id: 'd-hemisphere', label: 'Two-hemisphere model', type: 'decision', description: 'Structure org into Being (nonprofit) and Doing (capital) hemispheres' },
  { id: 'd-bluespirit', label: 'Blue Spirit confirmed', type: 'decision', description: 'Confirmed Blue Spirit retreat venue and dates for Q2 2026' },
  { id: 'd-ceo', label: 'CEO search', type: 'decision', description: 'Initiate search for CEO to lead operational execution' },
  { id: 'd-accountability', label: 'Node accountability', type: 'decision', description: 'Require quarterly OKR reporting from all node leads' },

  // People (5)
  { id: 'p-james', label: 'James', type: 'person', description: 'Founder and visionary leader driving Frequency\'s mission' },
  { id: 'p-sian', label: 'Sian', type: 'person', description: 'Core team, operations and community orchestration' },
  { id: 'p-fairman', label: 'Fairman', type: 'person', description: 'Core team, governance and strategic counsel' },
  { id: 'p-greg', label: 'Greg', type: 'person', description: 'Capital node lead, investment and deal evaluation' },
  { id: 'p-dave', label: 'Dave', type: 'person', description: 'Community lead, pods and enrollment strategy' },

  // Risks (4)
  { id: 'r-runway', label: 'Cash runway < 6 months', type: 'risk', description: 'Operating reserves projected to last less than 6 months at current burn' },
  { id: 'r-keyperson', label: 'Key person dependency on Sian', type: 'risk', description: 'Critical operational knowledge concentrated in one team member' },
  { id: 'r-bluespirit', label: 'Blue Spirit undersells', type: 'risk', description: 'Retreat fails to meet enrollment targets, creating financial shortfall' },
  { id: 'r-parttime', label: 'Node leads part-time only', type: 'risk', description: 'All node leads operating part-time, limiting execution velocity' },
];

// ─── Mock Data: Links ───

const links: GraphLink[] = [
  // DAF → Capital → Greg → OKR chain
  { source: 'd-daf', target: 'n-capital', label: 'Establishes funding vehicle for' },
  { source: 'n-capital', target: 'p-greg', label: 'Led by' },
  { source: 'p-greg', target: 'o-daf', label: 'Owns objective' },
  { source: 'o-daf', target: 'n-capital', label: 'Activates' },

  // Teal governance connections
  { source: 'd-teal', target: 'p-james', label: 'Championed by' },
  { source: 'd-teal', target: 'p-fairman', label: 'Advised by' },
  { source: 'd-teal', target: 'd-hemisphere', label: 'Enables' },
  { source: 'd-teal', target: 'd-accountability', label: 'Requires' },

  // Two-hemisphere model connections
  { source: 'd-hemisphere', target: 'n-capital', label: 'Structures Doing side' },
  { source: 'd-hemisphere', target: 'n-thesis', label: 'Grounds Being side in' },

  // Membership & Stewards
  { source: 'd-pricing', target: 'o-stewards', label: 'Defines economics for' },
  { source: 'o-stewards', target: 'p-dave', label: 'Owned by' },
  { source: 'p-dave', target: 'n-megaphone', label: 'Amplifies through' },

  // Blue Spirit connections
  { source: 'd-bluespirit', target: 'o-bluespirit', label: 'Drives' },
  { source: 'o-bluespirit', target: 'p-sian', label: 'Coordinated by' },
  { source: 'r-bluespirit', target: 'o-bluespirit', label: 'Threatens' },
  { source: 'r-bluespirit', target: 'r-runway', label: 'Could worsen' },

  // Node activation chain
  { source: 'o-nodes', target: 'n-map', label: 'Activates' },
  { source: 'o-nodes', target: 'n-bioregions', label: 'Activates' },
  { source: 'o-nodes', target: 'n-megaphone', label: 'Activates' },
  { source: 'o-nodes', target: 'n-cap2', label: 'Activates' },
  { source: 'd-accountability', target: 'o-nodes', label: 'Holds accountable' },

  // Operations & CEO
  { source: 'o-ops', target: 'p-sian', label: 'Depends on' },
  { source: 'd-ceo', target: 'o-ops', label: 'Will resolve' },
  { source: 'd-ceo', target: 'p-james', label: 'Initiated by' },

  // Risk connections
  { source: 'r-runway', target: 'o-ops', label: 'Pressures' },
  { source: 'r-runway', target: 'd-pricing', label: 'Urgency for' },
  { source: 'r-keyperson', target: 'p-sian', label: 'Concerns' },
  { source: 'r-keyperson', target: 'd-ceo', label: 'Motivates' },
  { source: 'r-parttime', target: 'o-nodes', label: 'Slows' },
  { source: 'r-parttime', target: 'r-runway', label: 'Compounds' },

  // Cross-node dependencies
  { source: 'n-thesis', target: 'n-capital', label: 'Scoring rubric feeds' },
  { source: 'n-capital', target: 'n-map', label: 'Funded projects mapped by' },
  { source: 'n-map', target: 'n-bioregions', label: 'Geography informs' },
  { source: 'n-megaphone', target: 'n-capital', label: 'Amplifies deal flow for' },
  { source: 'n-cap2', target: 'n-thesis', label: 'Theory grounds' },

  // James connections
  { source: 'p-james', target: 'n-thesis', label: 'Leads' },
  { source: 'p-james', target: 'o-stewards', label: 'Vision for' },

  // Sian connections
  { source: 'p-sian', target: 'n-bioregions', label: 'Supports' },

  // Fairman connections
  { source: 'p-fairman', target: 'd-hemisphere', label: 'Counsels on' },
];

// ─── Radial Layout ───

function computeLayout(
  items: GraphEntity[],
  activeFilters: Set<EntityType>,
  centerX: number,
  centerY: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const filtered = items.filter((e) => activeFilters.has(e.type));

  // Group by type for radial clusters
  const groups: Record<EntityType, GraphEntity[]> = {
    decision: [],
    okr: [],
    node: [],
    person: [],
    risk: [],
  };
  filtered.forEach((e) => groups[e.type].push(e));

  const activeTypes = (Object.keys(groups) as EntityType[]).filter(
    (t) => groups[t].length > 0
  );

  // Distribute type clusters around center
  activeTypes.forEach((type, typeIndex) => {
    const clusterAngle = (typeIndex / activeTypes.length) * 2 * Math.PI - Math.PI / 2;
    const clusterRadius = 220;
    const clusterCenterX = centerX + Math.cos(clusterAngle) * clusterRadius;
    const clusterCenterY = centerY + Math.sin(clusterAngle) * clusterRadius;

    const items = groups[type];
    if (items.length === 1) {
      positions.set(items[0].id, { x: clusterCenterX, y: clusterCenterY });
    } else {
      // Spread items in a smaller arc around the cluster center
      const spreadRadius = Math.min(70 + items.length * 12, 120);
      items.forEach((item, i) => {
        const itemAngle = clusterAngle + ((i - (items.length - 1) / 2) * 0.45);
        positions.set(item.id, {
          x: clusterCenterX + Math.cos(itemAngle) * spreadRadius,
          y: clusterCenterY + Math.sin(itemAngle) * spreadRadius,
        });
      });
    }
  });

  return positions;
}

// ─── Component ───

export function KnowledgeGraphView() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<EntityType>>(
    new Set(['decision', 'okr', 'node', 'person', 'risk'])
  );
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  const graphWidth = 700;
  const graphHeight = 620;
  const centerX = graphWidth / 2;
  const centerY = graphHeight / 2;

  // Compute positions
  const positions = useMemo(
    () => computeLayout(entities, activeFilters, centerX, centerY),
    [activeFilters, centerX, centerY]
  );

  // Visible entities and links
  const visibleEntities = useMemo(
    () => entities.filter((e) => activeFilters.has(e.type)),
    [activeFilters]
  );

  const visibleLinks = useMemo(
    () =>
      links.filter(
        (l) => positions.has(l.source) && positions.has(l.target)
      ),
    [positions]
  );

  // Selected entity data
  const selectedData = useMemo(() => {
    if (!selectedEntity) return null;
    const entity = entities.find((e) => e.id === selectedEntity);
    if (!entity) return null;
    const connected = links
      .filter((l) => l.source === selectedEntity || l.target === selectedEntity)
      .map((l) => {
        const otherId = l.source === selectedEntity ? l.target : l.source;
        const other = entities.find((e) => e.id === otherId);
        return {
          entity: other,
          link: l,
          direction: l.source === selectedEntity ? 'outgoing' : 'incoming',
        };
      })
      .filter((c) => c.entity && activeFilters.has(c.entity.type));
    return { entity, connected };
  }, [selectedEntity, activeFilters]);

  // Stats
  const stats = useMemo(() => {
    const connectionCount = new Map<string, number>();
    visibleEntities.forEach((e) => connectionCount.set(e.id, 0));
    visibleLinks.forEach((l) => {
      connectionCount.set(l.source, (connectionCount.get(l.source) ?? 0) + 1);
      connectionCount.set(l.target, (connectionCount.get(l.target) ?? 0) + 1);
    });

    let mostConnected = { id: '', count: 0 };
    let orphanCount = 0;
    connectionCount.forEach((count, id) => {
      if (count > mostConnected.count) {
        mostConnected = { id, count };
      }
      if (count === 0) orphanCount++;
    });

    const mostConnectedEntity = entities.find((e) => e.id === mostConnected.id);

    return {
      totalEntities: visibleEntities.length,
      totalLinks: visibleLinks.length,
      mostConnected: mostConnectedEntity
        ? `${mostConnectedEntity.label} (${mostConnected.count})`
        : 'N/A',
      orphanCount,
    };
  }, [visibleEntities, visibleLinks]);

  // Toggle filter
  const toggleFilter = useCallback((type: EntityType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  // Check if an entity is connected to selected
  const isConnectedToSelected = useCallback(
    (entityId: string): boolean => {
      if (!selectedEntity) return false;
      return links.some(
        (l) =>
          (l.source === selectedEntity && l.target === entityId) ||
          (l.target === selectedEntity && l.source === entityId)
      );
    },
    [selectedEntity]
  );

  // Check if a link is connected to selected
  const isLinkHighlighted = useCallback(
    (link: GraphLink): boolean => {
      if (!selectedEntity) return true;
      return link.source === selectedEntity || link.target === selectedEntity;
    },
    [selectedEntity]
  );

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Network size={24} style={{ color: '#8b5cf6' }} />
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#f0ebe4',
              margin: 0,
            }}
          >
            Knowledge Graph
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#a09888', margin: 0, paddingLeft: 36 }}>
          Visualizing relationships between decisions, objectives, nodes, people, and risks across the Frequency ecosystem
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Total Entities', value: stats.totalEntities, color: '#d4a574', icon: CircleDot },
          { label: 'Total Links', value: stats.totalLinks, color: '#8b5cf6', icon: Link2 },
          { label: 'Most Connected', value: stats.mostConnected, color: '#34d399', icon: Maximize2 },
          { label: 'Orphan Count', value: stats.orphanCount, color: '#f43f5e', icon: AlertTriangle },
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
                backgroundColor: `${stat.color}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: typeof stat.value === 'number' ? 20 : 14,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: '#6b6358' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <Filter size={16} style={{ color: '#6b6358', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b6358', marginRight: 4 }}>
          Filter:
        </span>
        {(Object.keys(entityTypeConfig) as EntityType[]).map((type) => {
          const config = entityTypeConfig[type];
          const isActive = activeFilters.has(type);
          const count = entities.filter((e) => e.type === type).length;
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 8,
                border: `1px solid ${isActive ? config.color + '50' : '#1e2638'}`,
                backgroundColor: isActive ? config.bgAlpha : 'transparent',
                color: isActive ? config.color : '#6b6358',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              <config.icon size={13} />
              {config.plural}
              <span
                style={{
                  fontSize: 10,
                  opacity: 0.7,
                  backgroundColor: isActive ? `${config.color}20` : 'rgba(255,255,255,0.04)',
                  borderRadius: 6,
                  padding: '1px 6px',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content: Graph + Detail Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectedData ? '1fr 320px' : '1fr',
          gap: 16,
          transition: 'grid-template-columns 0.2s ease',
        }}
      >
        {/* Graph Container */}
        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 14,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Graph Legend */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              zIndex: 5,
              backgroundColor: 'rgba(19, 23, 32, 0.9)',
              borderRadius: 8,
              padding: '10px 12px',
              border: '1px solid #1e2638',
            }}
          >
            {(Object.keys(entityTypeConfig) as EntityType[])
              .filter((t) => activeFilters.has(t))
              .map((type) => {
                const config = entityTypeConfig[type];
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: config.color,
                      }}
                    />
                    <span style={{ fontSize: 10, color: '#a09888' }}>{config.plural}</span>
                  </div>
                );
              })}
          </div>

          {/* Instruction hint */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              zIndex: 5,
              backgroundColor: 'rgba(19, 23, 32, 0.9)',
              borderRadius: 8,
              padding: '6px 10px',
              border: '1px solid #1e2638',
            }}
          >
            <Info size={12} style={{ color: '#6b6358' }} />
            <span style={{ fontSize: 10, color: '#6b6358' }}>Click a node to inspect</span>
          </div>

          {/* SVG Graph */}
          <svg
            width="100%"
            height={graphHeight}
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            style={{ display: 'block' }}
          >
            {/* Background pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#1e2638"
                  strokeWidth="0.5"
                  opacity="0.4"
                />
              </pattern>
              {/* Glow filter for selected */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width={graphWidth} height={graphHeight} fill="url(#grid)" />

            {/* Links */}
            {visibleLinks.map((link, idx) => {
              const sourcePos = positions.get(link.source);
              const targetPos = positions.get(link.target);
              if (!sourcePos || !targetPos) return null;

              const highlighted = isLinkHighlighted(link);
              const isHovered =
                hoveredEntity === link.source || hoveredEntity === link.target;

              return (
                <line
                  key={`link-${idx}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={highlighted || isHovered ? '#3e4a5e' : '#1a1f2e'}
                  strokeWidth={highlighted && selectedEntity ? 1.5 : 0.8}
                  opacity={
                    selectedEntity
                      ? highlighted
                        ? 0.8
                        : 0.15
                      : isHovered
                        ? 0.6
                        : 0.35
                  }
                  style={{ transition: 'opacity 0.2s ease, stroke 0.2s ease' }}
                />
              );
            })}

            {/* Link labels (only for selected entity connections) */}
            {selectedEntity &&
              visibleLinks
                .filter((l) => isLinkHighlighted(l))
                .map((link, idx) => {
                  const sourcePos = positions.get(link.source);
                  const targetPos = positions.get(link.target);
                  if (!sourcePos || !targetPos) return null;

                  const mx = (sourcePos.x + targetPos.x) / 2;
                  const my = (sourcePos.y + targetPos.y) / 2;

                  return (
                    <text
                      key={`label-${idx}`}
                      x={mx}
                      y={my - 6}
                      textAnchor="middle"
                      fill="#6b6358"
                      fontSize={8}
                      fontWeight={500}
                      style={{ pointerEvents: 'none' }}
                    >
                      {link.label}
                    </text>
                  );
                })}

            {/* Entity Nodes */}
            {visibleEntities.map((entity) => {
              const pos = positions.get(entity.id);
              if (!pos) return null;

              const config = entityTypeConfig[entity.type];
              const isSelected = selectedEntity === entity.id;
              const isConnected = isConnectedToSelected(entity.id);
              const isHovered = hoveredEntity === entity.id;
              const dimmed =
                selectedEntity !== null && !isSelected && !isConnected;

              const nodeRadius = isSelected ? 26 : isHovered ? 24 : 22;

              return (
                <g
                  key={entity.id}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                  opacity={dimmed ? 0.25 : 1}
                  onClick={() =>
                    setSelectedEntity((prev) =>
                      prev === entity.id ? null : entity.id
                    )
                  }
                  onMouseEnter={() => setHoveredEntity(entity.id)}
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  {/* Outer glow ring for selected */}
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius + 6}
                      fill="none"
                      stroke={config.color}
                      strokeWidth={1.5}
                      opacity={0.3}
                      filter="url(#glow)"
                    />
                  )}

                  {/* Connection indicator ring */}
                  {isConnected && !isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius + 4}
                      fill="none"
                      stroke={config.color}
                      strokeWidth={1}
                      opacity={0.4}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    fill={isSelected ? `${config.color}30` : '#0d1018'}
                    stroke={
                      isSelected
                        ? config.color
                        : isHovered || isConnected
                          ? `${config.color}80`
                          : '#1e2638'
                    }
                    strokeWidth={isSelected ? 2 : 1.5}
                    style={{ transition: 'all 0.15s ease' }}
                  />

                  {/* Type indicator dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y - 1}
                    r={4}
                    fill={config.color}
                    opacity={0.9}
                  />

                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y + nodeRadius + 14}
                    textAnchor="middle"
                    fill={isSelected || isConnected ? '#f0ebe4' : '#a09888'}
                    fontSize={10}
                    fontWeight={isSelected ? 700 : 500}
                    style={{ pointerEvents: 'none', transition: 'fill 0.15s ease' }}
                  >
                    {entity.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail Panel */}
        {selectedData && (
          <div
            style={{
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 14,
              padding: 0,
              overflow: 'hidden',
              alignSelf: 'start',
            }}
          >
            {/* Panel header */}
            <div
              style={{
                padding: '18px 20px 14px',
                borderBottom: '1px solid #1e2638',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: entityTypeConfig[selectedData.entity.type].bgAlpha,
                    border: `1px solid ${entityTypeConfig[selectedData.entity.type].color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {React.createElement(entityTypeConfig[selectedData.entity.type].icon, {
                    size: 16,
                    style: { color: entityTypeConfig[selectedData.entity.type].color },
                  })}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#f0ebe4',
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {selectedData.entity.label}
                  </h3>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: entityTypeConfig[selectedData.entity.type].color,
                    }}
                  >
                    {entityTypeConfig[selectedData.entity.type].label}
                  </span>
                </div>
              </div>

              {selectedData.entity.description && (
                <p
                  style={{
                    fontSize: 12,
                    color: '#a09888',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {selectedData.entity.description}
                </p>
              )}
            </div>

            {/* Connections list */}
            <div style={{ padding: '14px 20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <Link2 size={14} style={{ color: '#d4a574' }} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#d4a574',
                  }}
                >
                  Connections ({selectedData.connected.length})
                </span>
              </div>

              {selectedData.connected.length === 0 ? (
                <p
                  style={{
                    fontSize: 12,
                    color: '#6b6358',
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  No visible connections with current filters
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxHeight: 400,
                    overflowY: 'auto',
                  }}
                >
                  {selectedData.connected.map((conn, idx) => {
                    if (!conn.entity) return null;
                    const connConfig = entityTypeConfig[conn.entity.type];
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedEntity(conn.entity!.id)}
                        style={{
                          backgroundColor: '#0d1018',
                          border: '1px solid #1a1f2e',
                          borderRadius: 10,
                          padding: '10px 12px',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = connConfig.color + '40';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#1a1f2e';
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: connConfig.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#f0ebe4',
                            }}
                          >
                            {conn.entity.label}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: connConfig.color,
                              backgroundColor: connConfig.bgAlpha,
                              borderRadius: 4,
                              padding: '1px 6px',
                              marginLeft: 'auto',
                              flexShrink: 0,
                            }}
                          >
                            {connConfig.label}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#6b6358',
                            paddingLeft: 14,
                          }}
                        >
                          <span style={{ color: '#a09888', fontWeight: 500 }}>
                            {conn.direction === 'outgoing' ? '\u2192' : '\u2190'}
                          </span>{' '}
                          {conn.link.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Deselect button */}
            <div
              style={{
                padding: '0 20px 14px',
              }}
            >
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
          </div>
        )}
      </div>

      {/* Entity Type Breakdown */}
      <div style={{ marginTop: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 14,
          }}
        >
          <CircleDot size={16} style={{ color: '#d4a574' }} />
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#e8c9a0',
              margin: 0,
            }}
          >
            Entity Breakdown
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {(Object.keys(entityTypeConfig) as EntityType[]).map((type) => {
            const config = entityTypeConfig[type];
            const typeEntities = entities.filter((e) => e.type === type);
            const typeLinks = links.filter(
              (l) =>
                entities.find((e) => e.id === l.source)?.type === type ||
                entities.find((e) => e.id === l.target)?.type === type
            );

            return (
              <div
                key={type}
                style={{
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 12,
                  padding: '16px 18px',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${config.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e2638';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: config.bgAlpha,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <config.icon size={16} style={{ color: config.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>
                      {typeEntities.length}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b6358' }}>{config.plural}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Link2 size={11} style={{ color: '#6b6358' }} />
                  <span style={{ fontSize: 11, color: '#6b6358' }}>
                    {typeLinks.length} connections
                  </span>
                </div>

                {/* Mini entity list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {typeEntities.map((entity) => (
                    <div
                      key={entity.id}
                      onClick={() =>
                        setSelectedEntity((prev) =>
                          prev === entity.id ? null : entity.id
                        )
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 8px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        backgroundColor:
                          selectedEntity === entity.id
                            ? config.bgAlpha
                            : 'transparent',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedEntity !== entity.id) {
                          e.currentTarget.style.backgroundColor =
                            'rgba(255,255,255,0.03)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedEntity !== entity.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          backgroundColor: config.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color:
                            selectedEntity === entity.id
                              ? config.color
                              : '#a09888',
                          fontWeight:
                            selectedEntity === entity.id ? 600 : 400,
                        }}
                      >
                        {entity.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
