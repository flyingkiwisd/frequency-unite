'use client';

import React from 'react';
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
} from 'lucide-react';
import { governanceDecisions, type GovernanceDecision } from '@/lib/data';

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

export function GovernanceView() {
  const sorted = [...governanceDecisions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
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
