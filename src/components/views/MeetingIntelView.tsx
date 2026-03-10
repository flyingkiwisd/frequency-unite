'use client';

import React, { useState, useMemo } from 'react';
import {
  Brain,
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Sparkles,
  Target,
  Users,
  BookOpen,
  Gavel,
  StickyNote,
  CheckSquare,
  BarChart3,
  Zap,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

// ─── Types ───

type MeetingType = 'wisdom-council' | 'node-sync' | 'board' | 'standup' | 'external';
type MeetingStatus = 'upcoming' | 'completed';

interface AgendaItem {
  text: string;
  source: string;
  duration?: string;
}

interface PreRead {
  title: string;
  summary: string;
}

interface ActionItem {
  text: string;
  owner: string;
  done: boolean;
}

interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  agenda: AgendaItem[];
  preReads: PreRead[];
  suggestedOutcomes: string[];
  decisions: string[];
  actionItems: ActionItem[];
  notes: string;
}

// ─── Config ───

const meetingTypeConfig: Record<MeetingType, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  'wisdom-council': {
    label: 'Wisdom Council',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    icon: Brain,
  },
  'node-sync': {
    label: 'Node Sync',
    color: '#d4a574',
    bg: 'rgba(212, 165, 116, 0.12)',
    border: '1px solid rgba(212, 165, 116, 0.3)',
    icon: Zap,
  },
  'board': {
    label: 'Board',
    color: '#6b8f71',
    bg: 'rgba(107, 143, 113, 0.12)',
    border: '1px solid rgba(107, 143, 113, 0.3)',
    icon: Gavel,
  },
  'standup': {
    label: 'Standup',
    color: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.12)',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    icon: ListChecks,
  },
  'external': {
    label: 'External',
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.12)',
    border: '1px solid rgba(251, 146, 60, 0.3)',
    icon: Users,
  },
};

const statusConfig: Record<MeetingStatus, { label: string; color: string; bg: string; border: string }> = {
  upcoming: {
    label: 'Upcoming',
    color: '#d4a574',
    bg: 'rgba(212, 165, 116, 0.15)',
    border: '1px solid rgba(212, 165, 116, 0.4)',
  },
  completed: {
    label: 'Completed',
    color: '#6b8f71',
    bg: 'rgba(107, 143, 113, 0.15)',
    border: '1px solid rgba(107, 143, 113, 0.3)',
  },
};

const tailwindToHex: Record<string, string> = {
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

// ─── Helpers ───

function getMember(id: string) {
  return teamMembers.find((m) => m.id === id);
}

function getMemberName(id: string): string {
  return getMember(id)?.name ?? id;
}

function getMemberAvatar(id: string): { initials: string; hex: string } {
  const member = getMember(id);
  return {
    initials: member?.avatar ?? id.slice(0, 2).toUpperCase(),
    hex: tailwindToHex[member?.color ?? 'bg-slate-400'] ?? '#94a3b8',
  };
}

// ─── Mock Data ───

const initialMeetings: Meeting[] = [
  {
    id: 'mtg-1',
    title: 'Wisdom Council \u2014 March Weekly',
    type: 'wisdom-council',
    status: 'upcoming',
    date: 'March 12, 2026',
    time: '10:00 AM MT',
    duration: '90 min',
    attendees: ['james', 'fairman', 'sian', 'dave'],
    agenda: [
      { text: 'Coherence check-in and centering practice', source: 'Standing agenda', duration: '10 min' },
      { text: 'Blue Spirit 6.0 registration timeline review', source: 'Auto-generated from Tasks (t-6)', duration: '15 min' },
      { text: 'CEO search criteria discussion', source: 'Auto-generated from Governance (dec-6)', duration: '20 min' },
      { text: 'H1 OKR mid-quarter pulse check', source: 'Auto-generated from OKR tracker', duration: '25 min' },
      { text: 'Pod facilitation model update from Dave', source: 'Requested by Dave Weale', duration: '15 min' },
    ],
    preReads: [
      { title: 'H1 2026 OKR Scorecard', summary: 'Current progress across 5 objectives. OKR-1 (community) at 36% avg, OKR-2 (DAF) at 28% avg. Blue Spirit and Ops OKRs tracking strongest.' },
      { title: 'CEO Search Framework (Draft)', summary: 'Proposed criteria: systems-change background, fundraising experience, community-builder archetype, alignment with Teal governance.' },
    ],
    suggestedOutcomes: [
      'Confirm Blue Spirit registration launch date (April 15 target)',
      'Align on CEO search timeline and initial criteria',
      'Identify at-risk OKRs needing intervention this month',
    ],
    decisions: [],
    actionItems: [
      { text: 'Draft CEO job description for review', owner: 'james', done: false },
      { text: 'Prepare OKR deep-dive for next council', owner: 'fairman', done: false },
    ],
    notes: '',
  },
  {
    id: 'mtg-2',
    title: 'Node Lead Sync',
    type: 'node-sync',
    status: 'upcoming',
    date: 'March 13, 2026',
    time: '2:00 PM MT',
    duration: '60 min',
    attendees: ['fairman', 'greg', 'gareth', 'raamayan'],
    agenda: [
      { text: 'Node status round-robin (5 min each)', source: 'Standing agenda', duration: '20 min' },
      { text: 'Cross-node dependency mapping', source: 'Auto-generated from Map Node roadmap', duration: '15 min' },
      { text: 'Capital Node deal pipeline status', source: 'Auto-generated from Tasks (t-12)', duration: '10 min' },
      { text: 'Megaphone Anthem milestone check-in', source: 'Auto-generated from Tasks (t-13)', duration: '10 min' },
    ],
    preReads: [
      { title: 'Node Progress Dashboard', summary: 'Map 35%, Capital 40%, Bioregions 20%, Megaphone 25%. Thesis and Cap 2.0 nodes still in early build phase.' },
      { title: 'Capital Node Pipeline Summary', summary: '8 deals in pipeline, narrowing to 5 finalists. Scoring rubric: mission alignment + team + traction + scalability.' },
    ],
    suggestedOutcomes: [
      'Updated dependency map across all 6 nodes',
      'Capital Node finalist list confirmed for Blue Spirit presentations',
      'Anthem production timeline validated',
    ],
    decisions: [],
    actionItems: [
      { text: 'Circulate updated node dependency diagram', owner: 'fairman', done: false },
      { text: 'Finalize top 5 deal summaries for review', owner: 'greg', done: false },
    ],
    notes: '',
  },
  {
    id: 'mtg-3',
    title: 'Board Governance Review',
    type: 'board',
    status: 'completed',
    date: 'March 5, 2026',
    time: '9:00 AM MT',
    duration: '120 min',
    attendees: ['james', 'dave', 'fairman'],
    agenda: [
      { text: 'Teal governance implementation progress', source: 'Standing agenda', duration: '20 min' },
      { text: 'Decision log system review', source: 'Auto-generated from Tasks (t-3)', duration: '15 min' },
      { text: 'Board composition and succession planning', source: 'Requested by James Hodges', duration: '25 min' },
      { text: 'Financial stewardship quarterly review', source: 'Auto-generated from KPI tracker', duration: '20 min' },
      { text: 'CEO search mandate and timeline', source: 'Auto-generated from Governance (dec-6)', duration: '20 min' },
    ],
    preReads: [
      { title: 'Teal Governance Implementation Report', summary: 'Decision logs now active for 3 of 4 councils. Subsidiarity principle applied in 80% of recent decisions. Need improvement on documentation cadence.' },
      { title: 'Q1 Financial Summary', summary: 'Monthly burn at $22K, within target. Revenue at $180K YTD against $2M annual goal. DAF at $85K raised toward $500K-$1M target.' },
    ],
    suggestedOutcomes: [
      'Approve formal CEO search mandate',
      'Validate decision log system for full rollout',
      'Confirm board succession framework',
    ],
    decisions: [
      'CEO search formally approved to begin post-Blue Spirit (July 2026)',
      'Decision log system approved for full rollout across all councils',
      'Board to expand from 3 to 5 members by Q4 2026',
    ],
    actionItems: [
      { text: 'Draft board expansion criteria document', owner: 'dave', done: true },
      { text: 'Implement decision log system in Airtable', owner: 'fairman', done: false },
      { text: 'Prepare CEO search timeline proposal', owner: 'james', done: true },
    ],
    notes: 'Strong alignment on Teal governance direction. Dave emphasized the importance of maintaining cultural integrity through the board expansion process. Board unanimously agreed that CEO search should prioritize systems-change experience over traditional nonprofit management.',
  },
  {
    id: 'mtg-4',
    title: 'Blue Spirit Planning Sprint',
    type: 'standup',
    status: 'upcoming',
    date: 'March 14, 2026',
    time: '11:00 AM MT',
    duration: '45 min',
    attendees: ['sian', 'james', 'mafe'],
    agenda: [
      { text: 'Registration page status and review', source: 'Auto-generated from Tasks (t-6)', duration: '10 min' },
      { text: 'Programming and agenda design kickoff', source: 'Auto-generated from Tasks (t-21)', duration: '15 min' },
      { text: 'Logistics timeline and vendor confirmations', source: 'Auto-generated from Events tracker', duration: '10 min' },
      { text: 'Airtable member data migration impact on invites', source: 'Auto-generated from Tasks (t-5)', duration: '10 min' },
    ],
    preReads: [
      { title: 'Blue Spirit 6.0 Event Brief', summary: 'July 18, 2026 in Nosara, Costa Rica. Target 50-80 participants. Venue confirmed. Registration opens April 15. Budget: $85K target revenue.' },
    ],
    suggestedOutcomes: [
      'Registration page final review assigned',
      'Programming committee and timeline established',
      'Vendor checklist with deadlines confirmed',
    ],
    decisions: [],
    actionItems: [
      { text: 'Complete registration landing page draft', owner: 'mafe', done: false },
      { text: 'Create Blue Spirit programming committee brief', owner: 'sian', done: false },
      { text: 'Send vendor confirmation emails for venue and travel', owner: 'sian', done: false },
    ],
    notes: '',
  },
  {
    id: 'mtg-5',
    title: 'Capital Node Deal Review',
    type: 'node-sync',
    status: 'completed',
    date: 'March 3, 2026',
    time: '3:00 PM MT',
    duration: '75 min',
    attendees: ['greg', 'james', 'fairman'],
    agenda: [
      { text: 'Pipeline overview: 8 deals in diligence', source: 'Standing agenda', duration: '10 min' },
      { text: 'Scoring rubric calibration session', source: 'Requested by Greg Berry', duration: '20 min' },
      { text: 'Top 3 deal deep-dives with preliminary scores', source: 'Auto-generated from Capital Node tracker', duration: '30 min' },
      { text: 'Blue Spirit presentation format design', source: 'Auto-generated from Events (evt-3)', duration: '15 min' },
    ],
    preReads: [
      { title: 'Deal Pipeline Summary (March)', summary: '8 active deals. Sectors: regenerative agriculture (2), clean energy (2), community housing (1), education tech (1), bioregion development (2).' },
      { title: 'Scoring Rubric v2.1', summary: '4 dimensions: mission alignment (40%), team quality (25%), traction/evidence (20%), scalability (15%). Minimum score of 15/30 to advance.' },
    ],
    suggestedOutcomes: [
      'Calibrated scoring rubric with team alignment',
      'Shortlist of 5 finalists from 8 candidates',
      'Blue Spirit presentation template agreed',
    ],
    decisions: [
      'Scoring rubric v2.1 approved with minor adjustments to mission alignment weighting',
      'Advanced 5 deals to finalist stage: regenerative ag (Verdant Farms), clean energy (SolarNexus), community housing (CommonGround), bioregion dev (Nicoya Partners, TerraVida)',
      'Blue Spirit will feature 3 deal presentations with community vote format',
    ],
    actionItems: [
      { text: 'Prepare one-pager for each of the 5 finalists', owner: 'greg', done: true },
      { text: 'Design Blue Spirit deal presentation template', owner: 'fairman', done: true },
      { text: 'Schedule founder calls for top 3 finalists', owner: 'greg', done: false },
    ],
    notes: 'Rigorous session. Fairman pushed for stronger thesis-of-change alignment in scoring. Greg agreed to increase mission alignment weighting from 35% to 40%. James emphasized that community vote at Blue Spirit should be advisory, not binding, to maintain diligence integrity.',
  },
  {
    id: 'mtg-6',
    title: 'DAF Compliance Check-in',
    type: 'external',
    status: 'completed',
    date: 'February 28, 2026',
    time: '1:00 PM MT',
    duration: '60 min',
    attendees: ['colleen', 'james', 'nipun'],
    agenda: [
      { text: 'DAF compliance checklist progress review', source: 'Auto-generated from Tasks (t-2)', duration: '15 min' },
      { text: 'Donor acknowledgment process and IRS requirements', source: 'Requested by Colleen Galbraith', duration: '15 min' },
      { text: 'DECO framework tax implications discussion', source: 'Auto-generated from Node tasks', duration: '15 min' },
      { text: 'Year-end financial reporting readiness', source: 'Standing agenda', duration: '15 min' },
    ],
    preReads: [
      { title: 'DAF Compliance Checklist v1', summary: '18 items total, 12 completed, 4 in progress, 2 pending. Key blockers: DECO legal review and holdco registration.' },
      { title: 'IRS 501(c)(3) Reporting Requirements', summary: 'Annual Form 990 due May 15. Donor acknowledgment letters required for contributions over $250. Need clean segregation of DAF funds.' },
    ],
    suggestedOutcomes: [
      'Clear compliance timeline through Q2',
      'Donor acknowledgment template approved',
      'DECO tax implications understood and documented',
    ],
    decisions: [
      'Donor acknowledgment letter template approved for immediate use',
      'DECO framework requires separate legal opinion before first deployment',
      'Nipun to prepare draft Form 990 by April 15 for review',
    ],
    actionItems: [
      { text: 'Send donor acknowledgment letters for Q1 contributions', owner: 'colleen', done: true },
      { text: 'Engage tax attorney for DECO legal opinion', owner: 'james', done: false },
      { text: 'Prepare draft Form 990 for review', owner: 'nipun', done: false },
      { text: 'Complete remaining 6 DAF compliance checklist items', owner: 'colleen', done: false },
    ],
    notes: 'Productive compliance review. Colleen flagged that the DECO framework introduces novel tax considerations that need professional legal review before any deployment. Nipun confirmed books are clean and current. James committed to engaging a tax attorney this month.',
  },
  {
    id: 'mtg-7',
    title: 'Coherence & Culture Sync',
    type: 'wisdom-council',
    status: 'upcoming',
    date: 'March 16, 2026',
    time: '8:00 AM MT',
    duration: '60 min',
    attendees: ['james', 'dave', 'sian', 'fairman'],
    agenda: [
      { text: 'Community coherence pulse and wellbeing check', source: 'Standing agenda', duration: '15 min' },
      { text: 'Pod launch readiness review (6 pods target)', source: 'Auto-generated from Tasks (t-18)', duration: '15 min' },
      { text: 'Blue Spirit coherence programming design', source: 'Auto-generated from Events (evt-3)', duration: '15 min' },
      { text: 'Member engagement between events strategy', source: 'Requested by Dave Weale', duration: '15 min' },
    ],
    preReads: [
      { title: 'Community Coherence Metrics', summary: 'Coherence rating: 7.2/10 (target 8.5). Event NPS: 9.3. Member retention: 78% (target 85%). Between-event engagement needs improvement.' },
    ],
    suggestedOutcomes: [
      'Pod launch timeline confirmed with facilitator assignments',
      'Blue Spirit coherence programming outline approved',
      'Between-event engagement pilot designed',
    ],
    decisions: [],
    actionItems: [
      { text: 'Finalize pod facilitator assignments', owner: 'dave', done: false },
      { text: 'Draft Blue Spirit opening ceremony outline', owner: 'james', done: false },
    ],
    notes: '',
  },
];

// ─── Component ───

export function MeetingIntelView() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<MeetingType | 'all'>('all');
  const [activeSection, setActiveSection] = useState<Record<string, string>>({});

  // Derived state
  const filteredMeetings = useMemo(() => {
    const filtered = activeFilter === 'all'
      ? meetings
      : meetings.filter((m) => m.type === activeFilter);
    // Sort: upcoming first, then by date descending
    return [...filtered].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'upcoming' ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [meetings, activeFilter]);

  const stats = useMemo(() => {
    const totalMeetings = meetings.length;
    const decisionsCount = meetings.reduce((acc, m) => acc + m.decisions.length, 0);
    const allActions = meetings.flatMap((m) => m.actionItems);
    const totalActions = allActions.length;
    const doneActions = allActions.filter((a) => a.done).length;
    const completionRate = totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;
    return { totalMeetings, decisionsCount, totalActions, completionRate };
  }, [meetings]);

  // Handlers
  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function toggleActionItem(meetingId: string, actionIdx: number) {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const updated = [...m.actionItems];
        updated[actionIdx] = { ...updated[actionIdx], done: !updated[actionIdx].done };
        return { ...m, actionItems: updated };
      })
    );
  }

  function updateNotes(meetingId: string, notes: string) {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, notes } : m))
    );
  }

  function getActiveSection(meetingId: string): string {
    return activeSection[meetingId] ?? 'agenda';
  }

  function setMeetingSection(meetingId: string, section: string) {
    setActiveSection((prev) => ({ ...prev, [meetingId]: section }));
  }

  // ─── Render ───

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <Brain size={28} style={{ color: '#8b5cf6' }} />
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#f0ebe4',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Meeting Intelligence
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
          AI-curated agendas, pre-reads, and action tracking. Every meeting is a container for coherent decision-making.
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          { label: 'Total Meetings', value: stats.totalMeetings, icon: Calendar, color: '#d4a574' },
          { label: 'Decisions Captured', value: stats.decisionsCount, icon: Gavel, color: '#8b5cf6' },
          { label: 'Action Items', value: stats.totalActions, icon: Target, color: '#6b8f71' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: BarChart3, color: '#60a5fa' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                backgroundColor: '#131720',
                border: '1px solid #1e2638',
                borderRadius: 14,
                padding: '18px 20px',
                transition: 'border-color 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <Icon size={14} style={{ color: stat.color }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#6b6358',
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        {(['all', 'wisdom-council', 'node-sync', 'board', 'standup', 'external'] as const).map((filterKey) => {
          const isActive = activeFilter === filterKey;
          const config = filterKey === 'all' ? null : meetingTypeConfig[filterKey];
          const label = filterKey === 'all' ? 'All Meetings' : config!.label;
          const color = filterKey === 'all' ? '#d4a574' : config!.color;
          const count = filterKey === 'all'
            ? meetings.length
            : meetings.filter((m) => m.type === filterKey).length;

          return (
            <button
              key={filterKey}
              onClick={() => setActiveFilter(filterKey)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 10,
                border: isActive ? `1px solid ${color}50` : '1px solid #1e2638',
                backgroundColor: isActive ? `${color}15` : '#131720',
                color: isActive ? color : '#a09888',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {label}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: isActive ? `${color}25` : 'rgba(255,255,255,0.04)',
                  color: isActive ? color : '#6b6358',
                  borderRadius: 8,
                  padding: '1px 7px',
                  minWidth: 18,
                  textAlign: 'center',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Meeting Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {filteredMeetings.map((meeting) => {
          const isExpanded = expandedId === meeting.id;
          const typeConfig = meetingTypeConfig[meeting.type];
          const statConfig = statusConfig[meeting.status];
          const TypeIcon = typeConfig.icon;
          const section = getActiveSection(meeting.id);
          const doneCount = meeting.actionItems.filter((a) => a.done).length;
          const totalActions = meeting.actionItems.length;

          return (
            <div
              key={meeting.id}
              style={{
                backgroundColor: meeting.status === 'upcoming'
                  ? 'rgba(212, 165, 116, 0.03)'
                  : '#131720',
                border: meeting.status === 'upcoming'
                  ? '1px solid rgba(212, 165, 116, 0.15)'
                  : '1px solid #1e2638',
                borderRadius: 16,
                overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: meeting.status === 'upcoming'
                  ? '0 0 24px rgba(212, 165, 116, 0.04)'
                  : 'none',
              }}
            >
              {/* Card Header (clickable) */}
              <button
                onClick={() => toggleExpand(meeting.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  width: '100%',
                  padding: '18px 22px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                {/* Expand icon */}
                <div style={{ flexShrink: 0, color: '#6b6358' }}>
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>

                {/* Type icon */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: typeConfig.bg,
                    border: typeConfig.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TypeIcon size={18} style={{ color: typeConfig.color }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 4,
                      flexWrap: 'wrap',
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
                      {meeting.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: typeConfig.color,
                        backgroundColor: typeConfig.bg,
                        borderRadius: 12,
                        padding: '2px 10px',
                      }}
                    >
                      {typeConfig.label}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: statConfig.color,
                        backgroundColor: statConfig.bg,
                        border: statConfig.border,
                        borderRadius: 12,
                        padding: '2px 10px',
                      }}
                    >
                      {statConfig.label}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      fontSize: 12,
                      color: '#6b6358',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      {meeting.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {meeting.time} ({meeting.duration})
                    </span>
                  </div>
                </div>

                {/* Right side: Attendee avatars + quick stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  {/* Action items progress */}
                  {totalActions > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        color: doneCount === totalActions ? '#6b8f71' : '#a09888',
                      }}
                    >
                      <CheckSquare size={12} />
                      {doneCount}/{totalActions}
                    </div>
                  )}

                  {/* Decisions count */}
                  {meeting.decisions.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        color: '#8b5cf6',
                      }}
                    >
                      <Gavel size={12} />
                      {meeting.decisions.length}
                    </div>
                  )}

                  {/* Attendee avatars (stacked) */}
                  <div style={{ display: 'flex', marginLeft: 4 }}>
                    {meeting.attendees.slice(0, 4).map((id, idx) => {
                      const avatar = getMemberAvatar(id);
                      return (
                        <div
                          key={id}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: avatar.hex,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#fff',
                            marginLeft: idx > 0 ? -8 : 0,
                            border: '2px solid #131720',
                            zIndex: meeting.attendees.length - idx,
                            position: 'relative',
                          }}
                          title={getMemberName(id)}
                        >
                          {avatar.initials}
                        </div>
                      );
                    })}
                    {meeting.attendees.length > 4 && (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: '#2a3040',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#a09888',
                          marginLeft: -8,
                          border: '2px solid #131720',
                          position: 'relative',
                        }}
                      >
                        +{meeting.attendees.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #1e2638' }}>
                  {/* Attendees row */}
                  <div
                    style={{
                      padding: '14px 22px',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Users size={13} style={{ color: '#6b6358' }} />
                    <span style={{ fontSize: 11, color: '#6b6358', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Attendees:
                    </span>
                    {meeting.attendees.map((id) => {
                      const avatar = getMemberAvatar(id);
                      const member = getMember(id);
                      return (
                        <div
                          key={id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 20,
                            padding: '3px 10px 3px 3px',
                          }}
                        >
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              backgroundColor: avatar.hex,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 8,
                              fontWeight: 700,
                              color: '#fff',
                            }}
                          >
                            {avatar.initials}
                          </div>
                          <span style={{ fontSize: 12, color: '#c8bfb4' }}>
                            {member?.name ?? id}
                          </span>
                          <span style={{ fontSize: 10, color: '#6b6358' }}>
                            {member?.shortRole}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Section Tabs */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 0,
                      borderBottom: '1px solid #1e2638',
                      padding: '0 22px',
                    }}
                  >
                    {[
                      { key: 'agenda', label: 'Agenda', icon: Sparkles, count: meeting.agenda.length },
                      { key: 'prereads', label: 'Pre-Reads', icon: BookOpen, count: meeting.preReads.length },
                      { key: 'outcomes', label: 'Outcomes', icon: Lightbulb, count: meeting.suggestedOutcomes.length },
                      { key: 'decisions', label: 'Decisions', icon: Gavel, count: meeting.decisions.length },
                      { key: 'actions', label: 'Actions', icon: Target, count: meeting.actionItems.length },
                      { key: 'notes', label: 'Notes', icon: StickyNote, count: meeting.notes ? 1 : 0 },
                    ].map((tab) => {
                      const isActiveTab = section === tab.key;
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setMeetingSection(meeting.id, tab.key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '10px 14px',
                            border: 'none',
                            borderBottom: isActiveTab ? '2px solid #d4a574' : '2px solid transparent',
                            backgroundColor: 'transparent',
                            color: isActiveTab ? '#d4a574' : '#6b6358',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'color 0.15s, border-color 0.15s',
                            fontFamily: 'inherit',
                          }}
                        >
                          <TabIcon size={13} />
                          {tab.label}
                          {tab.count > 0 && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                backgroundColor: isActiveTab ? 'rgba(212, 165, 116, 0.2)' : 'rgba(255,255,255,0.04)',
                                color: isActiveTab ? '#d4a574' : '#4a443e',
                                borderRadius: 6,
                                padding: '1px 5px',
                                minWidth: 14,
                                textAlign: 'center',
                              }}
                            >
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Section Content */}
                  <div style={{ padding: '18px 22px' }}>
                    {/* Agenda */}
                    {section === 'agenda' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 4,
                          }}
                        >
                          <Sparkles size={14} style={{ color: '#8b5cf6' }} />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#8b5cf6',
                            }}
                          >
                            Auto-Generated Agenda
                          </span>
                        </div>
                        {meeting.agenda.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              gap: 14,
                              padding: '12px 16px',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              borderRadius: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 7,
                                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#8b5cf6',
                                flexShrink: 0,
                              }}
                            >
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, color: '#f0ebe4', fontWeight: 500, marginBottom: 4 }}>
                                {item.text}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#6b6358' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FileText size={10} />
                                  {item.source}
                                </span>
                                {item.duration && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={10} />
                                    {item.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pre-Reads */}
                    {section === 'prereads' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {meeting.preReads.length === 0 ? (
                          <div style={{ fontSize: 13, color: '#6b6358', padding: 20, textAlign: 'center' }}>
                            No pre-reads for this meeting
                          </div>
                        ) : (
                          meeting.preReads.map((pr, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '16px 18px',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: 10,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <BookOpen size={14} style={{ color: '#d4a574' }} />
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#e8c9a0' }}>
                                  {pr.title}
                                </span>
                              </div>
                              <p style={{ fontSize: 13, color: '#a09888', lineHeight: 1.6, margin: 0 }}>
                                {pr.summary}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Suggested Outcomes */}
                    {section === 'outcomes' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Lightbulb size={14} style={{ color: '#d4a574' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#d4a574' }}>
                            Suggested Outcomes
                          </span>
                        </div>
                        {meeting.suggestedOutcomes.length === 0 ? (
                          <div style={{ fontSize: 13, color: '#6b6358', padding: 20, textAlign: 'center' }}>
                            No suggested outcomes yet
                          </div>
                        ) : (
                          meeting.suggestedOutcomes.map((outcome, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '10px 14px',
                                backgroundColor: 'rgba(212, 165, 116, 0.04)',
                                border: '1px solid rgba(212, 165, 116, 0.1)',
                                borderRadius: 10,
                              }}
                            >
                              <Lightbulb size={14} style={{ color: '#d4a574', marginTop: 2, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: '#c8bfb4', lineHeight: 1.5 }}>
                                {outcome}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Decisions */}
                    {section === 'decisions' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Gavel size={14} style={{ color: '#8b5cf6' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#8b5cf6' }}>
                            Decisions Captured
                          </span>
                        </div>
                        {meeting.decisions.length === 0 ? (
                          <div
                            style={{
                              fontSize: 13,
                              color: '#6b6358',
                              padding: 20,
                              textAlign: 'center',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              borderRadius: 10,
                              border: '1px dashed rgba(255,255,255,0.06)',
                            }}
                          >
                            {meeting.status === 'upcoming'
                              ? 'Decisions will be captured during this meeting'
                              : 'No decisions recorded'}
                          </div>
                        ) : (
                          meeting.decisions.map((decision, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '12px 16px',
                                backgroundColor: 'rgba(139, 92, 246, 0.06)',
                                border: '1px solid rgba(139, 92, 246, 0.15)',
                                borderRadius: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  marginTop: 1,
                                }}
                              >
                                <Gavel size={11} style={{ color: '#8b5cf6' }} />
                              </div>
                              <span style={{ fontSize: 13, color: '#d8cfc4', lineHeight: 1.5 }}>
                                {decision}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Action Items */}
                    {section === 'actions' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Target size={14} style={{ color: '#6b8f71' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b8f71' }}>
                              Action Items
                            </span>
                          </div>
                          {totalActions > 0 && (
                            <span style={{ fontSize: 11, color: '#6b6358' }}>
                              {doneCount} of {totalActions} complete
                            </span>
                          )}
                        </div>
                        {meeting.actionItems.length === 0 ? (
                          <div
                            style={{
                              fontSize: 13,
                              color: '#6b6358',
                              padding: 20,
                              textAlign: 'center',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              borderRadius: 10,
                              border: '1px dashed rgba(255,255,255,0.06)',
                            }}
                          >
                            No action items yet
                          </div>
                        ) : (
                          meeting.actionItems.map((action, idx) => {
                            const ownerAvatar = getMemberAvatar(action.owner);
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  padding: '10px 14px',
                                  backgroundColor: action.done
                                    ? 'rgba(107, 143, 113, 0.06)'
                                    : 'rgba(255,255,255,0.02)',
                                  border: action.done
                                    ? '1px solid rgba(107, 143, 113, 0.15)'
                                    : '1px solid rgba(255,255,255,0.04)',
                                  borderRadius: 10,
                                  transition: 'all 0.15s',
                                }}
                              >
                                {/* Checkbox */}
                                <button
                                  onClick={() => toggleActionItem(meeting.id, idx)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 22,
                                    height: 22,
                                    borderRadius: 6,
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    padding: 0,
                                    flexShrink: 0,
                                    color: action.done ? '#6b8f71' : '#4a443e',
                                    transition: 'color 0.15s',
                                  }}
                                >
                                  {action.done ? (
                                    <CheckCircle2 size={18} />
                                  ) : (
                                    <Circle size={18} />
                                  )}
                                </button>

                                {/* Text */}
                                <span
                                  style={{
                                    flex: 1,
                                    fontSize: 13,
                                    color: action.done ? '#6b6358' : '#c8bfb4',
                                    textDecoration: action.done ? 'line-through' : 'none',
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {action.text}
                                </span>

                                {/* Owner */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    flexShrink: 0,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: '50%',
                                      backgroundColor: ownerAvatar.hex,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 8,
                                      fontWeight: 700,
                                      color: '#fff',
                                    }}
                                  >
                                    {ownerAvatar.initials}
                                  </div>
                                  <span style={{ fontSize: 11, color: '#6b6358' }}>
                                    {getMemberName(action.owner).split(' ')[0]}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {section === 'notes' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <MessageSquare size={14} style={{ color: '#a09888' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888' }}>
                            Meeting Notes
                          </span>
                        </div>
                        <textarea
                          value={meeting.notes}
                          onChange={(e) => updateNotes(meeting.id, e.target.value)}
                          placeholder={meeting.status === 'upcoming'
                            ? 'Notes will be captured during this meeting...'
                            : 'Add notes from this meeting...'}
                          style={{
                            width: '100%',
                            minHeight: 120,
                            padding: '14px 16px',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 10,
                            outline: 'none',
                            color: '#c8bfb4',
                            fontSize: 13,
                            lineHeight: 1.7,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                          }}
                        />
                        {meeting.notes && (
                          <div style={{ marginTop: 8, fontSize: 11, color: '#4a443e', textAlign: 'right' }}>
                            {meeting.notes.length} characters
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredMeetings.length === 0 && (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              color: '#6b6358',
              backgroundColor: '#131720',
              borderRadius: 16,
              border: '1px solid #1e2638',
            }}
          >
            <Calendar size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 14, margin: 0 }}>No meetings match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
