'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Map,
  CheckCircle2,
  Circle,
  Milestone,
  Zap,
  ArrowRight,
  MapPin,
  ChevronDown,
  ChevronRight,
  StickyNote,
  AlertTriangle,
  BarChart3,
  Save,
} from 'lucide-react';
import { roadmapPhases } from '@/lib/data';

// ─── Types ───

interface RoadmapProgress {
  completedMilestones: Record<string, boolean[]>;
  notes: Record<string, string>;
}

// ─── Constants ───

const STORAGE_KEY = 'frequency-roadmap-progress';

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

const phaseDependencies: Record<string, string> = {
  'phase-1': 'Depends on: DAF compliance approval, CEO search timeline',
  'phase-2': 'Depends on: Blue Spirit 6.0 success, 80+ well-stewards',
  'phase-3': 'Depends on: $500K DAF target, node operationalization',
  'phase-4': 'Depends on: Bioregion pilot results, community feedback',
  'phase-5': 'Depends on: All prior phases, sustainable revenue model',
};

// Parse timeline strings to date ranges for "You are here" indicator
const phaseTimelineRanges: Record<string, { start: Date; end: Date }> = {
  'phase-1': { start: new Date('2026-01-01'), end: new Date('2026-06-30') },
  'phase-2': { start: new Date('2026-07-01'), end: new Date('2026-09-30') },
  'phase-3': { start: new Date('2026-10-01'), end: new Date('2026-12-31') },
  'phase-4': { start: new Date('2027-01-01'), end: new Date('2027-06-30') },
  'phase-5': { start: new Date('2027-07-01'), end: new Date('2027-12-31') },
};

// ─── Helpers ───

function loadProgress(): RoadmapProgress {
  if (typeof window === 'undefined') {
    return { completedMilestones: {}, notes: {} };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { completedMilestones: {}, notes: {} };
}

function saveProgress(progress: RoadmapProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors
  }
}

function getCurrentPhaseId(): string | null {
  const now = new Date();
  for (const [phaseId, range] of Object.entries(phaseTimelineRanges)) {
    if (now >= range.start && now <= range.end) {
      return phaseId;
    }
  }
  return null;
}

function getPhaseProgressPercent(
  phaseId: string,
  totalMilestones: number,
  completedMap: Record<string, boolean[]>,
): number {
  const completed = completedMap[phaseId];
  if (!completed || totalMilestones === 0) return 0;
  const count = completed.filter(Boolean).length;
  return Math.round((count / totalMilestones) * 100);
}

function getCompletedCount(
  phaseId: string,
  completedMap: Record<string, boolean[]>,
): number {
  const completed = completedMap[phaseId];
  if (!completed) return 0;
  return completed.filter(Boolean).length;
}

// ─── Component ───

export function RoadmapView() {
  const [progress, setProgress] = useState<RoadmapProgress>({
    completedMilestones: {},
    notes: {},
  });
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {},
  );
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress());
    setMounted(true);
  }, []);

  // Persist changes
  const updateProgress = useCallback((updater: (prev: RoadmapProgress) => RoadmapProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const toggleMilestone = useCallback(
    (phaseId: string, milestoneIdx: number, totalMilestones: number) => {
      updateProgress((prev) => {
        const phaseMilestones = prev.completedMilestones[phaseId]
          ? [...prev.completedMilestones[phaseId]]
          : new Array(totalMilestones).fill(false);
        phaseMilestones[milestoneIdx] = !phaseMilestones[milestoneIdx];
        return {
          ...prev,
          completedMilestones: {
            ...prev.completedMilestones,
            [phaseId]: phaseMilestones,
          },
        };
      });
    },
    [updateProgress],
  );

  const updateNote = useCallback(
    (phaseId: string, note: string) => {
      updateProgress((prev) => ({
        ...prev,
        notes: { ...prev.notes, [phaseId]: note },
      }));
    },
    [updateProgress],
  );

  const toggleNoteExpanded = useCallback((phaseId: string) => {
    setExpandedNotes((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  }, []);

  // Compute overall stats
  const overallStats = useMemo(() => {
    let totalMilestones = 0;
    let totalCompleted = 0;
    for (const phase of roadmapPhases) {
      totalMilestones += phase.milestones.length;
      totalCompleted += getCompletedCount(
        phase.id,
        progress.completedMilestones,
      );
    }
    return { totalMilestones, totalCompleted };
  }, [progress.completedMilestones]);

  const currentPhaseId = useMemo(() => getCurrentPhaseId(), []);

  // Avoid hydration mismatch: show non-interactive state until mounted
  if (!mounted) {
    return (
      <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Map size={28} style={{ color: '#d4a574' }} />
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#f0ebe4',
              margin: 0,
            }}
          >
            Strategic Roadmap
          </h1>
        </div>
        <p
          style={{
            fontSize: 15,
            color: '#a09888',
            margin: '8px 0 0 40px',
            fontStyle: 'italic',
          }}
        >
          Loading roadmap...
        </p>
      </div>
    );
  }

  const overallPercent =
    overallStats.totalMilestones > 0
      ? Math.round(
          (overallStats.totalCompleted / overallStats.totalMilestones) * 100,
        )
      : 0;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
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

      {/* Overall Progress */}
      <div
        style={{
          backgroundColor: '#131720',
          border: '1px solid #1e2638',
          borderRadius: 14,
          padding: '18px 24px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <BarChart3 size={20} style={{ color: '#d4a574', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span
              style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}
            >
              Overall Roadmap Progress
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#d4a574' }}>
              {overallStats.totalCompleted} / {overallStats.totalMilestones}{' '}
              milestones ({overallPercent}%)
            </span>
          </div>
          <div
            style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${overallPercent}%`,
                background:
                  'linear-gradient(90deg, #d4a574, #8b5cf6)',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
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
          position: 'relative',
        }}
      >
        {roadmapPhases.map((phase, idx) => {
          const style = statusStyles[phase.status];
          const accentColor = colorMap[phase.color] ?? '#a09888';
          const isActive = phase.status === 'active';
          const isCurrent = phase.id === currentPhaseId;

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
                  position: 'relative',
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
                {/* "You are here" indicator */}
                {isCurrent && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -28,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#d4a574',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                        backgroundColor: 'rgba(212, 165, 116, 0.15)',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      You are here
                    </span>
                    <MapPin
                      size={12}
                      style={{ color: '#d4a574' }}
                      fill="#d4a574"
                    />
                  </div>
                )}
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
          const isCurrent = phase.id === currentPhaseId;
          const phaseCompleted = getCompletedCount(
            phase.id,
            progress.completedMilestones,
          );
          const phasePercent = getPhaseProgressPercent(
            phase.id,
            phase.milestones.length,
            progress.completedMilestones,
          );
          const noteExpanded = expandedNotes[phase.id] ?? false;
          const noteText = progress.notes[phase.id] ?? '';

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

              {/* "You are here" badge on the vertical timeline */}
              {isCurrent && (
                <div
                  style={{
                    position: 'absolute',
                    left: -4,
                    top: isActive ? 52 : 48,
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <MapPin
                    size={14}
                    style={{ color: '#d4a574' }}
                    fill="#d4a574"
                  />
                </div>
              )}

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

                {/* Phase Progress Bar */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#a09888',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Phase Progress
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: phasePercent === 100 ? '#6b8f71' : accentColor,
                      }}
                    >
                      {phaseCompleted} of {phase.milestones.length} milestones (
                      {phasePercent}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${phasePercent}%`,
                        backgroundColor:
                          phasePercent === 100 ? '#6b8f71' : accentColor,
                        borderRadius: 3,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: 10,
                    padding: '14px 18px',
                    border: '1px solid rgba(255,255,255,0.03)',
                    marginBottom: 12,
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
                      gap: 8,
                    }}
                  >
                    {phase.milestones.map((milestone, mIdx) => {
                      const isCompleted =
                        progress.completedMilestones[phase.id]?.[mIdx] ?? false;

                      return (
                        <li
                          key={mIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            fontSize: 13,
                            color: isCompleted
                              ? '#6b8f71'
                              : phase.status === 'planned'
                                ? '#6b6358'
                                : '#b0a898',
                            lineHeight: 1.5,
                            cursor: 'pointer',
                            padding: '4px 6px',
                            borderRadius: 8,
                            transition: 'background-color 0.15s',
                          }}
                          onClick={() =>
                            toggleMilestone(
                              phase.id,
                              mIdx,
                              phase.milestones.length,
                            )
                          }
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              'rgba(255,255,255,0.03)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              'transparent';
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle2
                              size={16}
                              style={{
                                color: '#6b8f71',
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            />
                          ) : (
                            <Circle
                              size={16}
                              style={{
                                color:
                                  isActive
                                    ? accentColor
                                    : phase.status === 'upcoming'
                                      ? accentColor
                                      : '#3e4a5e',
                                flexShrink: 0,
                                marginTop: 1,
                                opacity:
                                  isActive
                                    ? 0.8
                                    : phase.status === 'upcoming'
                                      ? 0.6
                                      : 0.4,
                              }}
                            />
                          )}
                          <span
                            style={{
                              textDecoration: isCompleted
                                ? 'line-through'
                                : 'none',
                              opacity: isCompleted ? 0.7 : 1,
                            }}
                          >
                            {milestone}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Dependencies & Risks */}
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.04)',
                    borderRadius: 10,
                    padding: '12px 18px',
                    border: '1px solid rgba(239, 68, 68, 0.08)',
                    marginBottom: 12,
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
                      marginBottom: 8,
                    }}
                  >
                    <AlertTriangle size={12} style={{ color: '#ef4444', opacity: 0.7 }} />
                    Dependencies &amp; Risks
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: '#a09888',
                      margin: 0,
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    {phaseDependencies[phase.id]}
                  </p>
                </div>

                {/* Phase Notes (collapsible) */}
                <div
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.03)',
                    borderRadius: 10,
                    border: '1px solid rgba(139, 92, 246, 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => toggleNoteExpanded(phase.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 18px',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#6b6358',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {noteExpanded ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                    <StickyNote size={12} />
                    Strategic Notes
                    {noteText && !noteExpanded && (
                      <span
                        style={{
                          fontSize: 10,
                          color: '#8b5cf6',
                          fontWeight: 500,
                          textTransform: 'none',
                          letterSpacing: 'normal',
                          marginLeft: 6,
                        }}
                      >
                        (has notes)
                      </span>
                    )}
                  </button>
                  {noteExpanded && (
                    <div style={{ padding: '0 18px 14px 18px' }}>
                      <textarea
                        value={noteText}
                        onChange={(e) =>
                          updateNote(phase.id, e.target.value)
                        }
                        placeholder="Add strategic notes for this phase..."
                        rows={4}
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid #1e2638',
                          borderRadius: 8,
                          padding: '10px 14px',
                          fontSize: 13,
                          color: '#f0ebe4',
                          lineHeight: 1.6,
                          resize: 'vertical',
                          outline: 'none',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLTextAreaElement).style.borderColor =
                            '#2e3a4e';
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLTextAreaElement).style.borderColor =
                            '#1e2638';
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 6,
                          fontSize: 10,
                          color: '#6b6358',
                        }}
                      >
                        <Save size={10} />
                        Auto-saved to browser
                      </div>
                    </div>
                  )}
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
