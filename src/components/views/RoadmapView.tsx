'use client';

import React from 'react';
import {
  Map,
  CheckCircle2,
  Circle,
  Milestone,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { roadmapPhases } from '@/lib/data';

const statusStyles: Record<
  'active' | 'upcoming' | 'planned',
  {
    dotBg: string;
    dotBorder: string;
    glow: string;
    cardBg: string;
    cardBorder: string;
    cardGlow: string;
    label: string;
    labelBg: string;
    labelText: string;
  }
> = {
  active: {
    dotBg: '#d4a574',
    dotBorder: 'rgba(212, 165, 116, 0.4)',
    glow: '0 0 20px rgba(212, 165, 116, 0.5)',
    cardBg: 'rgba(212, 165, 116, 0.05)',
    cardBorder: 'rgba(212, 165, 116, 0.25)',
    cardGlow:
      '0 0 40px rgba(212, 165, 116, 0.08), inset 0 0 40px rgba(212, 165, 116, 0.02)',
    label: 'Active Now',
    labelBg: 'rgba(212, 165, 116, 0.15)',
    labelText: '#d4a574',
  },
  upcoming: {
    dotBg: '#8b5cf6',
    dotBorder: 'rgba(139, 92, 246, 0.3)',
    glow: '0 0 12px rgba(139, 92, 246, 0.3)',
    cardBg: 'rgba(139, 92, 246, 0.03)',
    cardBorder: 'rgba(139, 92, 246, 0.15)',
    cardGlow: 'none',
    label: 'Upcoming',
    labelBg: 'rgba(139, 92, 246, 0.12)',
    labelText: '#8b5cf6',
  },
  planned: {
    dotBg: '#3e4a5e',
    dotBorder: '#2e3a4e',
    glow: 'none',
    cardBg: '#131720',
    cardBorder: '#1e2638',
    cardGlow: 'none',
    label: 'Planned',
    labelBg: 'rgba(160, 152, 136, 0.08)',
    labelText: '#6b6358',
  },
};

const colorMap: Record<string, string> = {
  amber: '#d4a574',
  violet: '#8b5cf6',
  emerald: '#6b8f71',
  sky: '#60a5fa',
  rose: '#f472b6',
};

export function RoadmapView() {
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
          <Map size={28} style={{ color: '#d4a574' }} />
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#f0ebe4',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Strategic Roadmap
          </h1>
        </div>
        <p
          style={{
            fontSize: 15,
            color: '#a09888',
            margin: '0 0 0 40px',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}
        >
          Envision, fund, and implement the world we want to leave to our
          children
        </p>
      </div>

      {/* Horizontal timeline indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          marginBottom: 36,
          padding: '0 8px',
          overflowX: 'auto',
        }}
      >
        {roadmapPhases.map((phase, idx) => {
          const style = statusStyles[phase.status];
          const accentColor = colorMap[phase.color] ?? '#a09888';
          const isActive = phase.status === 'active';

          return (
            <React.Fragment key={phase.id}>
              {/* Phase indicator */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  flex: '0 0 auto',
                }}
              >
                <div
                  style={{
                    width: isActive ? 20 : 14,
                    height: isActive ? 20 : 14,
                    borderRadius: '50%',
                    backgroundColor: style.dotBg,
                    border: `3px solid ${style.dotBorder}`,
                    boxShadow: style.glow,
                    transition: 'all 0.3s',
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? accentColor : '#6b6358',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {phase.name}
                </span>
              </div>

              {/* Connector line */}
              {idx < roadmapPhases.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    minWidth: 40,
                    backgroundColor:
                      phase.status === 'active'
                        ? 'rgba(212, 165, 116, 0.3)'
                        : '#1e2638',
                    borderRadius: 1,
                    marginTop: -18,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Phase Cards */}
      <div style={{ position: 'relative' }}>
        {/* Vertical connection line */}
        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 0,
            bottom: 0,
            width: 2,
            background:
              'linear-gradient(to bottom, rgba(212, 165, 116, 0.4), rgba(139, 92, 246, 0.3), rgba(107, 143, 113, 0.2), rgba(96, 165, 250, 0.1), rgba(244, 114, 182, 0.05))',
          }}
        />

        {roadmapPhases.map((phase, idx) => {
          const style = statusStyles[phase.status];
          const accentColor = colorMap[phase.color] ?? '#a09888';
          const isActive = phase.status === 'active';

          return (
            <div
              key={phase.id}
              style={{
                position: 'relative',
                paddingLeft: 56,
                marginBottom: idx < roadmapPhases.length - 1 ? 24 : 0,
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: isActive ? 13 : 16,
                  top: isActive ? 22 : 24,
                  width: isActive ? 24 : 18,
                  height: isActive ? 24 : 18,
                  borderRadius: '50%',
                  backgroundColor: style.dotBg,
                  border: `3px solid ${style.dotBorder}`,
                  boxShadow: style.glow,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isActive && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      opacity: 0.6,
                    }}
                  />
                )}
              </div>

              {/* Phase connector arrow */}
              {idx < roadmapPhases.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 21,
                    bottom: -16,
                    zIndex: 3,
                  }}
                >
                  <ArrowRight
                    size={10}
                    style={{
                      color: '#2e3a4e',
                      transform: 'rotate(90deg)',
                    }}
                  />
                </div>
              )}

              {/* Phase Card */}
              <div
                style={{
                  backgroundColor: style.cardBg,
                  border: `1px solid ${style.cardBorder}`,
                  borderRadius: 16,
                  padding: isActive ? 28 : 24,
                  boxShadow: style.cardGlow,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <h2
                        style={{
                          fontSize: isActive ? 22 : 18,
                          fontWeight: 700,
                          color: isActive ? '#f0ebe4' : '#d8cfc4',
                          margin: 0,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {phase.name}
                      </h2>
                      {isActive && (
                        <Zap
                          size={16}
                          style={{ color: '#d4a574' }}
                          fill="#d4a574"
                        />
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: accentColor,
                        margin: 0,
                        fontWeight: 500,
                        opacity: isActive ? 1 : 0.8,
                      }}
                    >
                      {phase.subtitle}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 6,
                    }}
                  >
                    {/* Status badge */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: style.labelText,
                        backgroundColor: style.labelBg,
                        borderRadius: 12,
                        padding: '3px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      {isActive && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#d4a574',
                            boxShadow: '0 0 8px rgba(212, 165, 116, 0.6)',
                            display: 'inline-block',
                            animation: 'pulse 2s infinite',
                          }}
                        />
                      )}
                      {style.label}
                    </span>

                    {/* Timeline */}
                    <span
                      style={{
                        fontSize: 12,
                        color: '#6b6358',
                        fontWeight: 500,
                      }}
                    >
                      {phase.timeline}
                    </span>
                  </div>
                </div>

                {/* Milestones */}
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: 10,
                    padding: '14px 18px',
                    border: '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#6b6358',
                      marginBottom: 12,
                    }}
                  >
                    <Milestone size={12} />
                    Milestones
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {phase.milestones.map((milestone, mIdx) => (
                      <li
                        key={mIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: 13,
                          color:
                            phase.status === 'planned'
                              ? '#6b6358'
                              : '#b0a898',
                          lineHeight: 1.5,
                        }}
                      >
                        {isActive ? (
                          <CheckCircle2
                            size={15}
                            style={{
                              color: accentColor,
                              flexShrink: 0,
                              marginTop: 2,
                              opacity: 0.8,
                            }}
                          />
                        ) : (
                          <Circle
                            size={15}
                            style={{
                              color:
                                phase.status === 'upcoming'
                                  ? accentColor
                                  : '#3e4a5e',
                              flexShrink: 0,
                              marginTop: 2,
                              opacity: phase.status === 'upcoming' ? 0.6 : 0.4,
                            }}
                          />
                        )}
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
