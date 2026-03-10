'use client';

import React, { useState } from 'react';
import {
  Compass,
  Heart,
  Landmark,
  TreePine,
  Palette,
  BookOpen,
  Settings,
  Calendar,
  Users,
  Activity,
  MessageCircle,
  Clock,
  CheckCircle2,
  Star,
  BarChart3,
  PenLine,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/* ─── Pod Data ─── */

interface Pod {
  name: string;
  lead: string;
  icon: React.ElementType;
  color: string;
  memberCount: number;
  targetMembers: string;
  status: 'forming' | 'active' | 'thriving';
  nextMeeting: string;
  description: string;
}

const pods: Pod[] = [
  {
    name: 'Purpose Pod',
    lead: 'James',
    icon: Compass,
    color: '#d4a574',
    memberCount: 6,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 7, 2026',
    description: 'Vision, North Star alignment, and strategic direction. Holds the why behind every initiative and ensures all nodes serve the larger purpose.',
  },
  {
    name: 'Capital Pod',
    lead: 'Greg',
    icon: Landmark,
    color: '#e8b44c',
    memberCount: 4,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 9, 2026',
    description: 'Investment evaluation, deal flow management, and capital stewardship. Bridges regenerative finance with real-world impact.',
  },
  {
    name: 'Bioregion Pod',
    lead: 'Gareth',
    icon: TreePine,
    color: '#6b8f71',
    memberCount: 5,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 11, 2026',
    description: 'Community regeneration and local impact in specific bioregions. Land-based projects, indigenous collaboration, and place-based transformation.',
  },
  {
    name: 'Culture Pod',
    lead: 'Andrew / Felicia',
    icon: Heart,
    color: '#e879a0',
    memberCount: 7,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 8, 2026',
    description: 'Coherence practices, inner work, and the living culture of Frequency. Holds the relational and somatic field of the community.',
  },
  {
    name: 'Narrative Pod',
    lead: 'Raamayan',
    icon: BookOpen,
    color: '#8b5cf6',
    memberCount: 3,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 14, 2026',
    description: 'Storytelling, movement building, and narrative infrastructure. Crafts the language and media that carry the Frequency signal into the world.',
  },
  {
    name: 'Operations Pod',
    lead: 'Sian',
    icon: Settings,
    color: '#5eaed4',
    memberCount: 5,
    targetMembers: '8-12',
    status: 'forming',
    nextMeeting: 'April 10, 2026',
    description: 'Process, systems, and membership operations. The backbone that makes everything else possible — CRM, communications, event logistics, onboarding.',
  },
];

const podStatusConfig: Record<Pod['status'], { bg: string; text: string; label: string }> = {
  forming: { bg: 'rgba(232, 180, 76, 0.15)', text: '#e8b44c', label: 'Forming' },
  active: { bg: 'rgba(107, 143, 113, 0.15)', text: '#6b8f71', label: 'Active' },
  thriving: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', label: 'Thriving' },
};

/* ─── Coherence Practices ─── */

interface Practice {
  name: string;
  schedule: string;
  facilitator: string;
  icon: React.ElementType;
  color: string;
}

const practices: Practice[] = [
  {
    name: 'Breathwork Circle',
    schedule: 'Wednesday 7am MT',
    facilitator: 'Andrew',
    icon: Activity,
    color: '#e879a0',
  },
  {
    name: 'Full Community Coherence Call',
    schedule: 'Monthly (2nd Saturday)',
    facilitator: 'Rotating',
    icon: Users,
    color: '#d4a574',
  },
  {
    name: 'Opening Ceremony Design',
    schedule: 'Pre-event (as needed)',
    facilitator: 'Culture Pod',
    icon: Star,
    color: '#8b5cf6',
  },
  {
    name: 'Essence Interviews',
    schedule: 'Ongoing',
    facilitator: 'Max',
    icon: MessageCircle,
    color: '#5eaed4',
  },
];

/* ─── Pod Health (April preview) ─── */

interface PodHealth {
  pod: string;
  attendance: number;
  facilitatorStatus: 'trained' | 'in-training' | 'needed';
  satisfaction: string;
}

const podHealth: PodHealth[] = [
  { pod: 'Purpose Pod', attendance: 88, facilitatorStatus: 'trained', satisfaction: 'Strong alignment' },
  { pod: 'Capital Pod', attendance: 75, facilitatorStatus: 'in-training', satisfaction: 'Engaged' },
  { pod: 'Bioregion Pod', attendance: 82, facilitatorStatus: 'trained', satisfaction: 'Energized' },
  { pod: 'Culture Pod', attendance: 90, facilitatorStatus: 'trained', satisfaction: 'Deep connection' },
  { pod: 'Narrative Pod', attendance: 78, facilitatorStatus: 'needed', satisfaction: 'Finding rhythm' },
  { pod: 'Operations Pod', attendance: 85, facilitatorStatus: 'trained', satisfaction: 'Efficient' },
];

const facilitatorStatusConfig: Record<PodHealth['facilitatorStatus'], { color: string; label: string; bg: string }> = {
  trained: { color: '#6b8f71', label: 'Trained', bg: 'rgba(107, 143, 113, 0.15)' },
  'in-training': { color: '#e8b44c', label: 'In Training', bg: 'rgba(232, 180, 76, 0.15)' },
  needed: { color: '#e06060', label: 'Needed', bg: 'rgba(224, 96, 96, 0.15)' },
};

/* ─── Coherence Journal Entries ─── */

interface JournalEntry {
  text: string;
  author: string;
  context: string;
  date: string;
}

const journalEntries: JournalEntry[] = [
  {
    text: 'Post-Cabo: The masculine-feminine balance work landed deeply. Group heart connection was the strongest we\'ve experienced.',
    author: 'Andrew',
    context: 'After Cabo Retreat',
    date: 'Jan 2026',
  },
  {
    text: 'The Teal governance shift is not just structural \u2014 it\'s a consciousness shift. We\'re learning to lead from a different place.',
    author: 'Felicia',
    context: 'Governance Reflection',
    date: 'Feb 2026',
  },
];

/* ─── Gender Balance ─── */

interface BalanceRow {
  group: string;
  male: number;
  female: number;
}

const genderBalance: BalanceRow[] = [
  { group: 'Core Team', male: 5, female: 4 },
  { group: 'Node Leads', male: 3, female: 1 },
  { group: 'Board', male: 1, female: 0 },
];

/* ─── Component ─── */

export function PodsView() {
  const [expandedPod, setExpandedPod] = useState<string | null>(null);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: 'rgba(232, 135, 160, 0.12)',
              border: '1px solid rgba(232, 135, 160, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={22} style={{ color: '#e879a0' }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#f0ebe4',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Pods & Coherence
            </h1>
            <p style={{ fontSize: 13, color: '#a09888', margin: 0, marginTop: 2, fontStyle: 'italic' }}>
              Coherence is not a destination, it&apos;s a practice
            </p>
          </div>
        </div>
      </div>

      {/* ── Pod Overview ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.05s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Palette size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Pod Overview
          </h2>
          <span
            style={{
              fontSize: 11,
              color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            {pods.length} pods proposed
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {pods.map((pod, i) => {
            const Icon = pod.icon;
            const statusCfg = podStatusConfig[pod.status];
            const isExpanded = expandedPod === pod.name;
            return (
              <div
                key={pod.name}
                className="animate-fade-in"
                style={{
                  backgroundColor: '#131720',
                  border: `1px solid ${isExpanded ? `${pod.color}40` : '#1e2638'}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'border-color 0.25s',
                  animationDelay: `${0.08 + i * 0.05}s`,
                  opacity: 0,
                }}
              >
                <div style={{ padding: 22 }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: `${pod.color}15`,
                          border: `1px solid ${pod.color}30`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={20} style={{ color: pod.color }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
                          {pod.name}
                        </h3>
                        <span style={{ fontSize: 12, color: '#a09888' }}>
                          Led by <span style={{ color: pod.color, fontWeight: 500 }}>{pod.lead}</span>
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: statusCfg.text,
                        backgroundColor: statusCfg.bg,
                        borderRadius: 12,
                        padding: '3px 10px',
                      }}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.65, margin: '0 0 14px 0' }}>
                    {pod.description}
                  </p>

                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={12} style={{ color: '#6b6358' }} />
                      <span style={{ fontSize: 11, color: '#a09888' }}>
                        <span style={{ color: '#f0ebe4', fontWeight: 600 }}>{pod.memberCount}</span>
                        <span style={{ color: '#6b6358' }}> / {pod.targetMembers}</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={12} style={{ color: '#6b6358' }} />
                      <span style={{ fontSize: 11, color: '#a09888' }}>
                        Next: <span style={{ color: '#f0ebe4', fontWeight: 500 }}>{pod.nextMeeting}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedPod(isExpanded ? null : pod.name)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 0',
                    fontSize: 11,
                    fontWeight: 500,
                    color: isExpanded ? pod.color : '#6b6358',
                    backgroundColor: isExpanded ? `${pod.color}08` : 'transparent',
                    borderTop: '1px solid #1e2638',
                    border: 'none',
                    borderTopStyle: 'solid',
                    borderTopWidth: 1,
                    borderTopColor: '#1e2638',
                    cursor: 'pointer',
                    transition: 'color 0.2s, background-color 0.2s',
                  }}
                >
                  {isExpanded ? (
                    <>Show less <ChevronUp size={13} /></>
                  ) : (
                    <>Show more <ChevronDown size={13} /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Coherence Practices Calendar ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.2s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Calendar size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Coherence Practices
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          {practices.map((practice, i) => {
            const Icon = practice.icon;
            return (
              <div
                key={practice.name}
                className="animate-fade-in"
                style={{
                  backgroundColor: '#131720',
                  border: '1px solid #1e2638',
                  borderRadius: 14,
                  padding: 20,
                  animationDelay: `${0.25 + i * 0.05}s`,
                  opacity: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: `${practice.color}15`,
                      border: `1px solid ${practice.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} style={{ color: practice.color }} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
                    {practice.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Clock size={11} style={{ color: '#6b6358' }} />
                  <span style={{ fontSize: 12, color: '#d4a574', fontWeight: 500 }}>
                    {practice.schedule}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={11} style={{ color: '#6b6358' }} />
                  <span style={{ fontSize: 12, color: '#a09888' }}>
                    Facilitated by <span style={{ color: '#f0ebe4', fontWeight: 500 }}>{practice.facilitator}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Pod Health Dashboard ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.35s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <BarChart3 size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Pod Health Dashboard
          </h2>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#e8b44c',
              backgroundColor: 'rgba(232, 180, 76, 0.12)',
              borderRadius: 12,
              padding: '3px 10px',
              marginLeft: 4,
            }}
          >
            Preview — launches April
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr',
              padding: '12px 24px',
              backgroundColor: '#0f1219',
              borderBottom: '1px solid #1e2638',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6b6358',
            }}
          >
            <span>Pod</span>
            <span style={{ textAlign: 'center' }}>Attendance</span>
            <span style={{ textAlign: 'center' }}>Facilitator</span>
            <span>Satisfaction</span>
          </div>

          {podHealth.map((ph, i) => {
            const facCfg = facilitatorStatusConfig[ph.facilitatorStatus];
            const attendanceColor =
              ph.attendance >= 85 ? '#6b8f71' : ph.attendance >= 75 ? '#e8b44c' : '#e06060';
            return (
              <div
                key={ph.pod}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr',
                  padding: '14px 24px',
                  borderBottom: i < podHealth.length - 1 ? '1px solid #1e263833' : 'none',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ebe4' }}>
                  {ph.pod}
                </span>
                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: attendanceColor,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {ph.attendance}%
                  </span>
                  <div
                    style={{
                      height: 4,
                      backgroundColor: '#1c2230',
                      borderRadius: 2,
                      marginTop: 4,
                      overflow: 'hidden',
                      maxWidth: 80,
                      margin: '4px auto 0',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${ph.attendance}%`,
                        backgroundColor: attendanceColor,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: facCfg.color,
                      backgroundColor: facCfg.bg,
                      borderRadius: 12,
                      padding: '3px 10px',
                    }}
                  >
                    {facCfg.label}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#a09888', fontStyle: 'italic' }}>
                  {ph.satisfaction}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Coherence Journal ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.45s', opacity: 0, marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <PenLine size={18} style={{ color: '#8b5cf6' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Coherence Journal
          </h2>
          <span
            style={{
              fontSize: 11,
              color: '#6b6358',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: '2px 10px',
              marginLeft: 4,
            }}
          >
            Reflections, not metrics
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {journalEntries.map((entry, i) => (
            <div
              key={i}
              className="animate-fade-in"
              style={{
                backgroundColor: '#131720',
                border: '1px solid #1e2638',
                borderRadius: 14,
                padding: 22,
                borderLeft: '3px solid #8b5cf640',
                animationDelay: `${0.5 + i * 0.06}s`,
                opacity: 0,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: '#e8e0d6',
                  lineHeight: 1.7,
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{entry.text}&rdquo;
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 14,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#d4a574' }}>
                  &mdash; {entry.author}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.12)',
                    borderRadius: 12,
                    padding: '2px 10px',
                    fontWeight: 500,
                  }}
                >
                  {entry.context}
                </span>
                <span style={{ fontSize: 11, color: '#6b6358' }}>{entry.date}</span>
              </div>
            </div>
          ))}

          {/* Free-text area placeholder */}
          <div
            style={{
              backgroundColor: '#0f1219',
              border: '1px dashed #2e3a4e',
              borderRadius: 14,
              padding: 20,
              textAlign: 'center',
            }}
          >
            <PenLine size={20} style={{ color: '#2e3a4e', marginBottom: 8 }} />
            <p style={{ fontSize: 12, color: '#6b6358', margin: 0 }}>
              Add a reflection... This space is for qualitative sensing, not scoring.
            </p>
          </div>
        </div>
      </section>

      {/* ── Gender Balance Tracker ── */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0.55s', opacity: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Users size={18} style={{ color: '#d4a574' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
            Gender Balance Tracker
          </h2>
        </div>

        <div
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: 24,
          }}
        >
          {/* Balance bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {genderBalance.map((row) => {
              const total = row.male + row.female;
              const malePct = total > 0 ? (row.male / total) * 100 : 50;
              const femalePct = total > 0 ? (row.female / total) * 100 : 50;
              return (
                <div key={row.group}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>
                      {row.group}
                    </span>
                    <span style={{ fontSize: 12, color: '#a09888' }}>
                      <span style={{ color: '#5eaed4' }}>{row.male}M</span>
                      {' / '}
                      <span style={{ color: '#e879a0' }}>{row.female}F</span>
                    </span>
                  </div>
                  <div
                    style={{
                      height: 20,
                      display: 'flex',
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: '#1c2230',
                    }}
                  >
                    <div
                      style={{
                        width: `${malePct}%`,
                        background: 'linear-gradient(90deg, #5eaed4cc, #5eaed488)',
                        transition: 'width 0.6s ease-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {malePct > 20 && (
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#0b0d14' }}>
                          {malePct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        width: `${femalePct}%`,
                        background: 'linear-gradient(90deg, #e879a088, #e879a0cc)',
                        transition: 'width 0.6s ease-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {femalePct > 20 && (
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#0b0d14' }}>
                          {femalePct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Note */}
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              backgroundColor: '#0f1219',
              borderRadius: 10,
              borderLeft: '3px solid #d4a57440',
            }}
          >
            <p style={{ fontSize: 12, color: '#a09888', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
              Balance is a practice, not a target. We track representation not to optimize a number,
              but to stay aware of the field we&apos;re creating and the voices shaping it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
