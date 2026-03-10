'use client';

import React, { useRef } from 'react';
import {
  Scale,
  BookOpen,
  ScrollText,
  Shield,
  Users,
  Network,
  Eye,
  ArrowRight,
  CircleDot,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { governanceDecisions, exportPdf, type GovernanceDecision } from '@/lib/data';

const impactConfig: Record<
  GovernanceDecision['impact'],
  { label: string; bg: string; text: string; border: string }
> = {
  high: {
    label: 'High Impact',
    bg: 'rgba(212, 165, 116, 0.15)',
    text: '#d4a574',
    border: '1px solid rgba(212, 165, 116, 0.3)',
  },
  medium: {
    label: 'Medium',
    bg: 'rgba(96, 165, 250, 0.12)',
    text: '#60a5fa',
    border: '1px solid rgba(96, 165, 250, 0.25)',
  },
  low: {
    label: 'Low',
    bg: 'rgba(160, 152, 136, 0.12)',
    text: '#a09888',
    border: '1px solid rgba(160, 152, 136, 0.2)',
  },
};

const categoryConfig: Record<
  GovernanceDecision['category'],
  { label: string; bg: string; text: string }
> = {
  governance: {
    label: 'Governance',
    bg: 'rgba(139, 92, 246, 0.12)',
    text: '#a78bfa',
  },
  financial: {
    label: 'Financial',
    bg: 'rgba(212, 165, 116, 0.12)',
    text: '#d4a574',
  },
  membership: {
    label: 'Membership',
    bg: 'rgba(107, 143, 113, 0.12)',
    text: '#6b8f71',
  },
  strategy: {
    label: 'Strategy',
    bg: 'rgba(96, 165, 250, 0.12)',
    text: '#60a5fa',
  },
  node: {
    label: 'Node',
    bg: 'rgba(251, 146, 60, 0.12)',
    text: '#fb923c',
  },
};

const principles = [
  {
    icon: Eye,
    title: 'Teal Governance Model',
    description:
      'Self-managing, purpose-driven governance beyond Green-stage consensus. Authority flows to competence and responsibility.',
    color: '#8b5cf6',
  },
  {
    icon: Scale,
    title: 'Responsibility-Weighted Voice',
    description:
      'Those with greater responsibility and skin in the game carry proportionally greater voice in decisions.',
    color: '#d4a574',
  },
  {
    icon: ScrollText,
    title: 'Decision Logs Required',
    description:
      'Every council meeting produces a decision log. Transparency is non-negotiable. Every decision is recorded and accessible.',
    color: '#6b8f71',
  },
  {
    icon: Network,
    title: 'Subsidiarity Principle',
    description:
      'Decisions are made at the lowest competent level. Nodes are sovereign in their domain. Escalation only when cross-cutting.',
    color: '#60a5fa',
  },
  {
    icon: CircleDot,
    title: 'Two-Hemisphere Model',
    description:
      'Right Side (Being/Nonprofit): culture, coherence, community. Left Side (Doing/Capital): nodes, investments, operations. Both hemispheres are honored and integrated.',
    color: '#fb923c',
  },
];

const governanceStructure = [
  {
    title: 'Wisdom Council',
    role: 'Advisory',
    description:
      'Elder advisors providing long-term perspective and pattern recognition. Guides but does not direct.',
    color: '#8b5cf6',
    icon: Eye,
  },
  {
    title: 'Core Stewardship Team',
    role: 'Decision Authority',
    description:
      'Operational leadership with decision-making authority on day-to-day matters. James, Sian, Fairman, and functional leads.',
    color: '#d4a574',
    icon: Shield,
  },
  {
    title: 'Stewards Council',
    role: 'Synthesis',
    description:
      'Broader council of stewards who synthesize perspectives, give input on strategic direction, and hold accountability.',
    color: '#6b8f71',
    icon: Users,
  },
  {
    title: 'Member-Led Nodes',
    role: 'Sovereign',
    description:
      'Autonomous nodes with designated leads. Each node self-governs within its domain, reporting quarterly OKRs.',
    color: '#60a5fa',
    icon: Network,
  },
];

const implementationTracker: {
  decision: string;
  decidedDate: string;
  owner: string;
  deadline: string;
  status: 'completed' | 'in-progress' | 'overdue' | 'pending';
  progress: number;
}[] = [
  { decision: 'Adopt Teal governance model', decidedDate: 'Jan 15, 2026', owner: 'James', deadline: 'Mar 31, 2026', status: 'in-progress', progress: 65 },
  { decision: 'Launch 6 pods by April', decidedDate: 'Jan 18, 2026', owner: 'Dave', deadline: 'Apr 15, 2026', status: 'in-progress', progress: 40 },
  { decision: 'Establish DAF structure', decidedDate: 'Jan 18, 2026', owner: 'Colleen', deadline: 'Mar 1, 2026', status: 'completed', progress: 100 },
  { decision: 'Hire fractional PM', decidedDate: 'Feb 5, 2026', owner: 'James', deadline: 'Mar 15, 2026', status: 'overdue', progress: 20 },
  { decision: 'Set individual membership tiers', decidedDate: 'Feb 10, 2026', owner: 'Max', deadline: 'Feb 28, 2026', status: 'completed', progress: 100 },
  { decision: 'Define CEO search criteria', decidedDate: 'Feb 20, 2026', owner: 'James', deadline: 'May 1, 2026', status: 'pending', progress: 10 },
];

const statusConfig: Record<
  'completed' | 'in-progress' | 'overdue' | 'pending',
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  completed: { label: 'Completed', color: '#6b8f71', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: '#e8b44c', icon: Clock },
  overdue: { label: 'Overdue', color: '#e06060', icon: AlertTriangle },
  pending: { label: 'Pending', color: '#a09888', icon: Clock },
};

export function GovernanceView() {
  const sorted = [...governanceDecisions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Scale size={28} style={{ color: '#8b5cf6' }} />
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#f0ebe4',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Governance & Decisions
            </h1>
          </div>
          <button
            onClick={() => { if (containerRef.current) exportPdf(containerRef.current, 'Governance'); }}
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
        <p
          style={{
            fontSize: 14,
            color: '#a09888',
            margin: 0,
            paddingLeft: 40,
          }}
        >
          How we make decisions matters as much as what we decide. Our
          governance evolves with our consciousness.
        </p>
      </div>

      {/* Governance Principles */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          }}
        >
          <BookOpen size={18} style={{ color: '#d4a574' }} />
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#e8c9a0',
              margin: 0,
            }}
          >
            Governance Principles
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 14,
                  padding: 22,
                  transition: 'border-color 0.2s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: `${p.color}15`,
                      border: `1px solid ${p.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} style={{ color: p.color }} />
                  </div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#f0ebe4',
                      margin: 0,
                    }}
                  >
                    {p.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: '#a09888',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Governance Structure */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          }}
        >
          <Network size={18} style={{ color: '#8b5cf6' }} />
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#e8c9a0',
              margin: 0,
            }}
          >
            Governance Structure
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            position: 'relative',
          }}
        >
          {governanceStructure.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <div key={idx} style={{ position: 'relative' }}>
                {/* Connector arrow */}
                {idx < governanceStructure.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '4px 0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 2,
                          height: 12,
                          backgroundColor: '#1e2638',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: '#131720',
                    border: `1px solid ${tier.color}25`,
                    borderRadius: 14,
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: `${tier.color}12`,
                      border: `1px solid ${tier.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} style={{ color: tier.color }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: '#f0ebe4',
                          margin: 0,
                        }}
                      >
                        {tier.title}
                      </h3>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: tier.color,
                          backgroundColor: `${tier.color}15`,
                          borderRadius: 12,
                          padding: '2px 10px',
                        }}
                      >
                        {tier.role}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#a09888',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {tier.description}
                    </p>
                  </div>

                  {/* Arrow for flow indication */}
                  {idx < governanceStructure.length - 1 && (
                    <ArrowRight
                      size={16}
                      style={{
                        color: '#2e3a4e',
                        flexShrink: 0,
                        transform: 'rotate(90deg)',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Decision-to-Implementation Tracker */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          }}
        >
          <Target size={18} style={{ color: '#e8b44c' }} />
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#e8c9a0',
              margin: 0,
            }}
          >
            Decision &rarr; Implementation
          </h2>
        </div>

        {/* Summary row */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {(
            ['completed', 'in-progress', 'overdue', 'pending'] as const
          ).map((s) => {
            const cfg = statusConfig[s];
            const count = implementationTracker.filter(
              (t) => t.status === s
            ).length;
            const Icon = cfg.icon;
            return (
              <div
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: `${cfg.color}12`,
                  border: `1px solid ${cfg.color}30`,
                  borderRadius: 10,
                  padding: '6px 14px',
                }}
              >
                <Icon size={14} style={{ color: cfg.color }} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: cfg.color,
                  }}
                >
                  {count}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: '#a09888',
                  }}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tracker table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
            gap: 12,
            padding: '0 22px 10px',
            borderBottom: '1px solid #1e2638',
            marginBottom: 8,
          }}
        >
          {['Decision', 'Owner', 'Deadline', 'Status', 'Progress'].map(
            (header) => (
              <span
                key={header}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#6b6358',
                }}
              >
                {header}
              </span>
            )
          )}
        </div>

        {/* Tracker rows */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {implementationTracker.map((item, idx) => {
            const cfg = statusConfig[item.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 14,
                  padding: '14px 22px',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
                  gap: 12,
                  alignItems: 'center',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Decision name */}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#f0ebe4',
                  }}
                >
                  {item.decision}
                </span>

                {/* Owner */}
                <span
                  style={{
                    fontSize: 13,
                    color: '#a09888',
                  }}
                >
                  {item.owner}
                </span>

                {/* Deadline */}
                <span
                  style={{
                    fontSize: 12,
                    color:
                      item.status === 'overdue' ? '#e06060' : '#a09888',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.deadline}
                </span>

                {/* Status badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <StatusIcon size={12} style={{ color: cfg.color }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: cfg.color,
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.progress}%`,
                        height: '100%',
                        backgroundColor: cfg.color,
                        borderRadius: 3,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: cfg.color,
                      minWidth: 32,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Decision Log */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          }}
        >
          <ScrollText size={18} style={{ color: '#6b8f71' }} />
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#e8c9a0',
              margin: 0,
            }}
          >
            Decision Log
          </h2>
          <span
            style={{
              fontSize: 12,
              color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            {sorted.length} decisions
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {sorted.map((decision) => {
            const impact = impactConfig[decision.impact];
            const category = categoryConfig[decision.category];

            return (
              <div
                key={decision.id}
                style={{
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 14,
                  padding: '20px 24px',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Top row: date + badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: '#6b6358',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {new Date(decision.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {/* Impact badge */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: impact.text,
                        backgroundColor: impact.bg,
                        border: impact.border,
                        borderRadius: 12,
                        padding: '3px 10px',
                      }}
                    >
                      {impact.label}
                    </span>

                    {/* Category badge */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: category.text,
                        backgroundColor: category.bg,
                        borderRadius: 12,
                        padding: '3px 10px',
                      }}
                    >
                      {category.label}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#f0ebe4',
                    margin: '0 0 8px 0',
                  }}
                >
                  {decision.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: 13,
                    color: '#a09888',
                    lineHeight: 1.6,
                    margin: '0 0 12px 0',
                  }}
                >
                  {decision.description}
                </p>

                {/* Decided by */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: '#6b6358',
                  }}
                >
                  <Shield size={12} />
                  <span>
                    Decided by:{' '}
                    <span style={{ color: '#8b7a6b', fontWeight: 500 }}>
                      {decision.decidedBy}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
