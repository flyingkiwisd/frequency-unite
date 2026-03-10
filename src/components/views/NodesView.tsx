'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { nodes, teamMembers } from '@/lib/data';
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

// ─── Component ───

export function NodesView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Summary stats
  const activeCount = nodes.filter((n) => n.status === 'active').length;
  const buildingCount = nodes.filter((n) => n.status === 'building').length;
  const pilotCount = nodes.filter((n) => n.status === 'pilot').length;
  const totalProgress = Math.round(nodes.reduce((sum, n) => sum + n.progress, 0) / nodes.length);

  const toggleExpand = (id: string) => {
    setExpandedId((prev: string | null) => (prev === id ? null : id));
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
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

        {/* Overall progress ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

      {/* ── Summary Stats ── */}
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

      {/* ── Node Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {nodes.map((node) => {
          const Icon = iconMap[node.icon] ?? Globe;
          const sts = statusStyle(node.status);
          const pri = priorityStyle(node.priority);
          const StatusIcon = statusIcon(node.status);
          const isExpanded = expandedId === node.id;

          // Resolve lead names
          const leadMembers = node.leads
            .map((lid) => teamMembers.find((m) => m.id === lid))
            .filter(Boolean);

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
                {/* Top row: icon + name + badges */}
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

                {/* Capabilities list (expandable) */}
                {isExpanded && (
                  <div
                    style={{
                      paddingTop: 8,
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
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
