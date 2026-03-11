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
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

// ─── Types ───

type MeetingType = 'wisdom-council' | 'node-sync' | 'board' | 'standup' | 'external';
type MeetingStatus = 'upcoming' | 'completed';
type FilterTab = 'all' | 'this-week' | 'by-node' | 'action-items';

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
  priority?: 'high' | 'medium' | 'low';
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
  sentiment?: 'energized' | 'constructive' | 'tense' | 'neutral';
  aiInsights?: { text: string; priority: 'high' | 'medium' | 'low' }[];
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

const sentimentConfig: Record<string, { label: string; color: string; emoji: string }> = {
  energized: { label: 'Energized', color: '#34d399', emoji: '' },
  constructive: { label: 'Constructive', color: '#60a5fa', emoji: '' },
  tense: { label: 'Tense', color: '#f87171', emoji: '' },
  neutral: { label: 'Neutral', color: '#e8b44c', emoji: '' },
};

const insightPriorityConfig: Record<string, { color: string; bg: string; border: string }> = {
  high: { color: '#e06060', bg: 'rgba(224, 96, 96, 0.1)', border: 'rgba(224, 96, 96, 0.25)' },
  medium: { color: '#e8b44c', bg: 'rgba(232, 180, 76, 0.1)', border: 'rgba(232, 180, 76, 0.25)' },
  low: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.2)' },
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

function parseDurationMinutes(dur: string): number {
  const match = dur.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

function getRelativeDate(dateStr: string): string {
  const now = new Date('2026-03-10');
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return '';
}

// ─── Sentiment Gauge SVG ───

function SentimentGauge({ sentiment }: { sentiment: string }) {
  const cfg = sentimentConfig[sentiment] ?? sentimentConfig.neutral;
  const angles: Record<string, number> = {
    tense: -60,
    neutral: -20,
    constructive: 20,
    energized: 55,
  };
  const angle = angles[sentiment] ?? 0;
  const needleRad = (angle * Math.PI) / 180;
  const needleLen = 18;
  const cx = 28;
  const cy = 26;
  const nx = cx + needleLen * Math.cos(needleRad - Math.PI);
  const ny = cy + needleLen * Math.sin(needleRad - Math.PI);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="56" height="32" viewBox="0 0 56 32">
        {/* Arc background */}
        <path
          d="M 6 26 A 22 22 0 0 1 50 26"
          fill="none"
          stroke="#1e2638"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Colored sections */}
        <path d="M 6 26 A 22 22 0 0 1 15 10" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path d="M 15 10 A 22 22 0 0 1 28 4" fill="none" stroke="#e8b44c" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path d="M 28 4 A 22 22 0 0 1 41 10" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path d="M 41 10 A 22 22 0 0 1 50 26" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={cfg.color}
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transition: 'all 0.6s ease-out' }}
        />
        <circle cx={cx} cy={cy} r="3" fill={cfg.color} />
      </svg>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>{cfg.label}</div>
        <div style={{ fontSize: 16 }}>{cfg.emoji}</div>
      </div>
    </div>
  );
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
    sentiment: 'constructive',
    aiInsights: [
      { text: 'OKR-2 (DAF) at 28% -- at risk of falling behind without intervention this month', priority: 'high' },
      { text: 'CEO search criteria should align with Teal governance principles documented in dec-4', priority: 'medium' },
    ],
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
      { text: 'Draft CEO job description for review', owner: 'james', done: false, priority: 'high' },
      { text: 'Prepare OKR deep-dive for next council', owner: 'fairman', done: false, priority: 'medium' },
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
    sentiment: 'energized',
    aiInsights: [
      { text: 'Capital Node pipeline is healthy at 8 deals -- needs narrowing to 5 finalists for Blue Spirit', priority: 'medium' },
      { text: 'Nicoya pilot delayed 2 weeks -- may impact Bioregions Node quarterly targets', priority: 'high' },
    ],
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
      { text: 'Circulate updated node dependency diagram', owner: 'fairman', done: false, priority: 'medium' },
      { text: 'Finalize top 5 deal summaries for review', owner: 'greg', done: false, priority: 'high' },
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
    sentiment: 'energized',
    aiInsights: [
      { text: 'Board expansion from 3 to 5 members is a major governance milestone -- criteria document needed', priority: 'high' },
      { text: 'CEO search timeline aligns well with Blue Spirit for internal announcement', priority: 'low' },
    ],
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
      { text: 'Draft board expansion criteria document', owner: 'dave', done: true, priority: 'high' },
      { text: 'Implement decision log system in Airtable', owner: 'fairman', done: false, priority: 'medium' },
      { text: 'Prepare CEO search timeline proposal', owner: 'james', done: true, priority: 'high' },
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
    sentiment: 'constructive',
    aiInsights: [
      { text: 'Registration opens in 32 days -- landing page draft still pending review', priority: 'high' },
      { text: 'Airtable migration may affect invite list accuracy -- verify before launch', priority: 'medium' },
    ],
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
      { text: 'Complete registration landing page draft', owner: 'mafe', done: false, priority: 'high' },
      { text: 'Create Blue Spirit programming committee brief', owner: 'sian', done: false, priority: 'medium' },
      { text: 'Send vendor confirmation emails for venue and travel', owner: 'sian', done: false, priority: 'low' },
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
    sentiment: 'energized',
    aiInsights: [
      { text: 'Mission alignment weighting increased to 40% -- strengthens thesis-of-change alignment in scoring', priority: 'medium' },
      { text: '5 finalists selected -- 3 will present at Blue Spirit with advisory community vote', priority: 'low' },
    ],
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
      { text: 'Prepare one-pager for each of the 5 finalists', owner: 'greg', done: true, priority: 'high' },
      { text: 'Design Blue Spirit deal presentation template', owner: 'fairman', done: true, priority: 'medium' },
      { text: 'Schedule founder calls for top 3 finalists', owner: 'greg', done: false, priority: 'high' },
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
    sentiment: 'constructive',
    aiInsights: [
      { text: 'DECO framework needs separate legal opinion before deployment -- potential blocker for Capital Node', priority: 'high' },
      { text: 'Form 990 due May 15 -- draft needed by April 15 for review buffer', priority: 'medium' },
    ],
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
      { text: 'Send donor acknowledgment letters for Q1 contributions', owner: 'colleen', done: true, priority: 'high' },
      { text: 'Engage tax attorney for DECO legal opinion', owner: 'james', done: false, priority: 'high' },
      { text: 'Prepare draft Form 990 for review', owner: 'nipun', done: false, priority: 'medium' },
      { text: 'Complete remaining 6 DAF compliance checklist items', owner: 'colleen', done: false, priority: 'medium' },
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
    sentiment: 'neutral',
    aiInsights: [
      { text: 'Coherence rating at 7.2/10 vs 8.5 target -- pod attendance drop may be a factor', priority: 'high' },
      { text: 'Between-event engagement is the weakest metric -- consider async community rituals', priority: 'medium' },
    ],
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
      { text: 'Finalize pod facilitator assignments', owner: 'dave', done: false, priority: 'high' },
      { text: 'Draft Blue Spirit opening ceremony outline', owner: 'james', done: false, priority: 'medium' },
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
  const [viewTab, setViewTab] = useState<FilterTab>('all');

  // Derived state
  const filteredMeetings = useMemo(() => {
    let filtered = meetings;

    // View tab filter
    if (viewTab === 'this-week') {
      filtered = filtered.filter((m) => {
        const d = new Date(m.date);
        const now = new Date('2026-03-10');
        const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= -7 && diff <= 7;
      });
    } else if (viewTab === 'by-node') {
      filtered = filtered.filter((m) => m.type === 'node-sync');
    } else if (viewTab === 'action-items') {
      filtered = filtered.filter((m) => m.actionItems.some((a) => !a.done));
    }

    // Type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((m) => m.type === activeFilter);
    }

    // Sort: upcoming first, then by date descending
    return [...filtered].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'upcoming' ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [meetings, activeFilter, viewTab]);

  const stats = useMemo(() => {
    const totalMeetings = meetings.length;
    const upcomingCount = meetings.filter((m) => m.status === 'upcoming').length;
    const decisionsCount = meetings.reduce((acc, m) => acc + m.decisions.length, 0);
    const allActions = meetings.flatMap((m) => m.actionItems);
    const totalActions = allActions.length;
    const doneActions = allActions.filter((a) => a.done).length;
    const completionRate = totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;
    const highPriorityOpen = allActions.filter((a) => !a.done && a.priority === 'high').length;
    return { totalMeetings, upcomingCount, decisionsCount, totalActions, doneActions, completionRate, highPriorityOpen };
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
      <div className="animate-fade-in" style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Brain size={24} style={{ color: '#8b5cf6' }} />
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
              Meeting Intelligence
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#a09888',
                margin: 0,
              }}
            >
              AI-curated agendas, pre-reads, and action tracking for coherent decision-making.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div
        className="animate-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 24,
          animationDelay: '0.05s',
        }}
      >
        {[
          { label: 'Total Meetings', value: stats.totalMeetings, sub: `${stats.upcomingCount} upcoming`, icon: Calendar, color: '#d4a574', subColor: '#d4a574' },
          { label: 'Decisions Captured', value: stats.decisionsCount, sub: 'across all meetings', icon: Gavel, color: '#8b5cf6', subColor: '#6b6358' },
          { label: 'Action Items', value: `${stats.doneActions}/${stats.totalActions}`, sub: `${stats.highPriorityOpen} high priority open`, icon: Target, color: '#6b8f71', subColor: stats.highPriorityOpen > 0 ? '#e06060' : '#6b6358' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, sub: stats.completionRate >= 50 ? 'on track' : 'needs attention', icon: BarChart3, color: '#60a5fa', subColor: stats.completionRate >= 50 ? '#6b8f71' : '#e8b44c' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glow-card animate-fade-in"
              style={{
                backgroundColor: '#131720',
                border: '1px solid #1e2638',
                borderRadius: 14,
                padding: '16px 20px',
                animationDelay: `${0.08 + idx * 0.04}s`,
                opacity: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={16} style={{ color: stat.color }} />
                </div>
                {stat.label === 'Completion Rate' && (
                  <div style={{ width: 44, height: 44, position: 'relative' }}>
                    <svg width="44" height="44" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#1e2638" strokeWidth="3" />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke={stat.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${(stats.completionRate / 100) * 113} 113`}
                        transform="rotate(-90 22 22)"
                        style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 10, color: stat.subColor, marginTop: 2 }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* View Tabs (All, This Week, By Node, Action Items) */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          animationDelay: '0.12s',
          opacity: 0,
        }}
      >
        {([
          { key: 'all' as FilterTab, label: 'All Meetings', icon: Calendar },
          { key: 'this-week' as FilterTab, label: 'This Week', icon: Clock },
          { key: 'by-node' as FilterTab, label: 'By Node', icon: Zap },
          { key: 'action-items' as FilterTab, label: 'Action Items', icon: Target },
        ]).map((tab) => {
          const isActive = viewTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setViewTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 10,
                border: isActive ? '1px solid rgba(212, 165, 116, 0.35)' : '1px solid #1e2638',
                backgroundColor: isActive ? 'rgba(212, 165, 116, 0.1)' : 'transparent',
                color: isActive ? '#d4a574' : '#6b6358',
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#2e3a4e';
                  e.currentTarget.style.color = '#a09888';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#1e2638';
                  e.currentTarget.style.color = '#6b6358';
                }
              }}
            >
              <TabIcon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Type Filter Pills */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 24,
          flexWrap: 'wrap',
          animationDelay: '0.15s',
          opacity: 0,
        }}
      >
        {(['all', 'wisdom-council', 'node-sync', 'board', 'standup', 'external'] as const).map((filterKey) => {
          const isActive = activeFilter === filterKey;
          const config = filterKey === 'all' ? null : meetingTypeConfig[filterKey];
          const label = filterKey === 'all' ? 'All Types' : config!.label;
          const color = filterKey === 'all' ? '#a09888' : config!.color;
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
                padding: '6px 14px',
                borderRadius: 20,
                border: isActive ? `1px solid ${color}44` : '1px solid #1e2638',
                backgroundColor: isActive ? `${color}15` : 'transparent',
                color: isActive ? color : '#6b6358',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#2e3a4e';
                  e.currentTarget.style.color = '#a09888';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#1e2638';
                  e.currentTarget.style.color = '#6b6358';
                }
              }}
            >
              {label}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: isActive ? `${color}25` : '#1e2638',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredMeetings.map((meeting, meetingIdx) => {
          const isExpanded = expandedId === meeting.id;
          const typeConfig = meetingTypeConfig[meeting.type];
          const statConfig = statusConfig[meeting.status];
          const TypeIcon = typeConfig.icon;
          const section = getActiveSection(meeting.id);
          const doneCount = meeting.actionItems.filter((a) => a.done).length;
          const totalActions = meeting.actionItems.length;
          const relDate = getRelativeDate(meeting.date);
          const durationMin = parseDurationMinutes(meeting.duration);

          return (
            <div
              key={meeting.id}
              className="animate-fade-in"
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
                animationDelay: `${0.2 + meetingIdx * 0.06}s`,
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = meeting.status === 'upcoming'
                  ? 'rgba(212, 165, 116, 0.3)'
                  : '#2e3a4e';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = meeting.status === 'upcoming'
                  ? 'rgba(212, 165, 116, 0.15)'
                  : '#1e2638';
                e.currentTarget.style.boxShadow = meeting.status === 'upcoming'
                  ? '0 0 24px rgba(212, 165, 116, 0.04)'
                  : 'none';
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
                <div style={{ flexShrink: 0, color: '#6b6358', transition: 'transform 0.2s' }}>
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>

                {/* Type icon */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: typeConfig.bg,
                    border: typeConfig.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TypeIcon size={20} style={{ color: typeConfig.color }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
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
                    {relDate && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: meeting.status === 'upcoming' ? '#d4a574' : '#6b6358',
                          backgroundColor: meeting.status === 'upcoming' ? 'rgba(212, 165, 116, 0.1)' : 'rgba(255,255,255,0.03)',
                          borderRadius: 12,
                          padding: '2px 10px',
                        }}
                      >
                        {relDate}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      fontSize: 12,
                      color: '#6b6358',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} />
                      {meeting.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {meeting.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: Math.min(durationMin / 2, 60),
                          height: 4,
                          borderRadius: 2,
                          background: `linear-gradient(90deg, ${typeConfig.color}60, ${typeConfig.color}20)`,
                        }}
                      />
                      <span style={{ fontSize: 11 }}>{meeting.duration}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={11} />
                      {meeting.attendees.length}
                    </span>
                  </div>
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                  {meeting.aiInsights && meeting.aiInsights.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        color: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.08)',
                        borderRadius: 8,
                        padding: '3px 8px',
                      }}
                      title="AI Insights"
                    >
                      <Sparkles size={11} />
                      {meeting.aiInsights.length}
                    </div>
                  )}

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
                  {/* Top row: Sentiment gauge + AI Insights */}
                  <div
                    style={{
                      padding: '16px 22px',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      display: 'flex',
                      gap: 24,
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Sentiment Gauge */}
                    {meeting.sentiment && (
                      <div
                        className="animate-fade-in"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: 12,
                          padding: '10px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>
                          Meeting Tone
                        </span>
                        <SentimentGauge sentiment={meeting.sentiment} />
                      </div>
                    )}

                    {/* AI Insights */}
                    {meeting.aiInsights && meeting.aiInsights.length > 0 && (
                      <div className="animate-fade-in" style={{ flex: 1, minWidth: 240, animationDelay: '0.1s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <Sparkles size={13} style={{ color: '#8b5cf6' }} />
                          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b5cf6' }}>
                            AI Insights
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {meeting.aiInsights.map((insight, idx) => {
                            const pc = insightPriorityConfig[insight.priority];
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 8,
                                  padding: '8px 12px',
                                  backgroundColor: pc.bg,
                                  border: `1px solid ${pc.border}`,
                                  borderRadius: 10,
                                }}
                              >
                                <div
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: pc.color,
                                    marginTop: 5,
                                    flexShrink: 0,
                                  }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: 12, color: '#c8bfb4', lineHeight: 1.5 }}>
                                    {insight.text}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    color: pc.color,
                                    flexShrink: 0,
                                    marginTop: 2,
                                  }}
                                >
                                  {insight.priority}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendees row */}
                  <div
                    className="animate-fade-in"
                    style={{
                      padding: '14px 22px',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                      animationDelay: '0.08s',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Sparkles size={14} style={{ color: '#8b5cf6' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#8b5cf6' }}>
                            Auto-Generated Agenda
                          </span>
                          <span style={{ fontSize: 11, color: '#6b6358', marginLeft: 'auto' }}>
                            Total: {meeting.duration}
                          </span>
                        </div>
                        {meeting.agenda.map((item, idx) => (
                          <div
                            key={idx}
                            className="animate-fade-in"
                            style={{
                              display: 'flex',
                              gap: 14,
                              padding: '12px 16px',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              borderRadius: 10,
                              animationDelay: `${idx * 0.05}s`,
                              opacity: 0,
                              transition: 'background-color 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
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
                              </div>
                            </div>
                            {item.duration && (
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: '#8b5cf6',
                                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                                  borderRadius: 8,
                                  padding: '2px 8px',
                                  flexShrink: 0,
                                  alignSelf: 'center',
                                }}
                              >
                                {item.duration}
                              </div>
                            )}
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
                              className="animate-fade-in"
                              style={{
                                padding: '16px 18px',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: 10,
                                animationDelay: `${idx * 0.06}s`,
                                opacity: 0,
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
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#d4a574' }}>Suggested Outcomes</span>
                        </div>
                        {meeting.suggestedOutcomes.length === 0 ? (
                          <div style={{ fontSize: 13, color: '#6b6358', padding: 20, textAlign: 'center' }}>
                            No suggested outcomes yet
                          </div>
                        ) : (
                          meeting.suggestedOutcomes.map((outcome, idx) => (
                            <div
                              key={idx}
                              className="animate-fade-in"
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '10px 14px',
                                backgroundColor: 'rgba(212, 165, 116, 0.04)',
                                border: '1px solid rgba(212, 165, 116, 0.1)',
                                borderRadius: 10,
                                animationDelay: `${idx * 0.05}s`,
                                opacity: 0,
                              }}
                            >
                              <Lightbulb size={14} style={{ color: '#d4a574', marginTop: 2, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: '#c8bfb4', lineHeight: 1.5 }}>{outcome}</span>
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
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#8b5cf6' }}>Decisions Captured</span>
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
                              className="animate-fade-in"
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '12px 16px',
                                backgroundColor: 'rgba(139, 92, 246, 0.06)',
                                border: '1px solid rgba(139, 92, 246, 0.15)',
                                borderRadius: 10,
                                animationDelay: `${idx * 0.05}s`,
                                opacity: 0,
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
                              <span style={{ fontSize: 13, color: '#d8cfc4', lineHeight: 1.5 }}>{decision}</span>
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
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b8f71' }}>Action Items</span>
                          </div>
                          {totalActions > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 80, height: 4, borderRadius: 2, backgroundColor: '#1e2638', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${(doneCount / totalActions) * 100}%`,
                                    height: '100%',
                                    borderRadius: 2,
                                    backgroundColor: doneCount === totalActions ? '#6b8f71' : '#d4a574',
                                    transition: 'width 0.3s ease-out',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 11, color: '#6b6358' }}>
                                {doneCount} of {totalActions} complete
                              </span>
                            </div>
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
                            const prioColor = action.priority === 'high' ? '#e06060' : action.priority === 'medium' ? '#e8b44c' : '#60a5fa';
                            return (
                              <div
                                key={idx}
                                className="animate-fade-in"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  padding: '10px 14px',
                                  backgroundColor: action.done ? 'rgba(107, 143, 113, 0.06)' : 'rgba(255,255,255,0.02)',
                                  border: action.done ? '1px solid rgba(107, 143, 113, 0.15)' : '1px solid rgba(255,255,255,0.04)',
                                  borderRadius: 10,
                                  transition: 'all 0.15s',
                                  animationDelay: `${idx * 0.04}s`,
                                  opacity: 0,
                                }}
                              >
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
                                  {action.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </button>

                                {action.priority && !action.done && (
                                  <div
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      backgroundColor: prioColor,
                                      flexShrink: 0,
                                    }}
                                    title={`${action.priority} priority`}
                                  />
                                )}

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

                                {action.priority && !action.done && (
                                  <span
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      color: prioColor,
                                      backgroundColor: `${prioColor}15`,
                                      borderRadius: 6,
                                      padding: '2px 6px',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {action.priority}
                                  </span>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  <div
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      backgroundColor: action.done ? '#2a3040' : ownerAvatar.hex,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 8,
                                      fontWeight: 700,
                                      color: '#fff',
                                      border: action.done ? '1px solid #3a4050' : 'none',
                                    }}
                                  >
                                    {ownerAvatar.initials}
                                  </div>
                                  <span style={{ fontSize: 11, color: action.done ? '#4a443e' : '#6b6358' }}>
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
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888' }}>Meeting Notes</span>
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
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)'; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
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
            className="animate-fade-in"
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
            <p style={{ fontSize: 14, margin: '0 0 4px', color: '#a09888' }}>No meetings match this filter</p>
            <p style={{ fontSize: 12, margin: 0 }}>Try adjusting the view or type filters above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
