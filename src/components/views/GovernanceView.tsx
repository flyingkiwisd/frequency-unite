'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  ChevronDown,
  Filter,
  Plus,
  X,
  Landmark,
  Coins,
  UserCog,
  Compass,
  Layers,
  MessageCircle,
  Vote,
  Gavel,
  FileText,
  Zap,
  TrendingUp,
  Timer,
} from 'lucide-react';
import { exportPdf, type GovernanceDecision } from '@/lib/data';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { InlineAdvisor } from '@/components/InlineAdvisor';

/* ── colour configs (extended with glow colors for hover) ── */

const impactConfig: Record<
  GovernanceDecision['impact'],
  { label: string; scaleLabel: string; scaleBars: number; bg: string; text: string; border: string; dot: string; glow: string; gradient: string }
> = {
  high: {
    label: 'High Impact',
    scaleLabel: 'Transformative',
    scaleBars: 5,
    bg: 'rgba(212, 165, 116, 0.15)',
    text: '#d4a574',
    border: '1px solid rgba(212, 165, 116, 0.3)',
    dot: '#d4a574',
    glow: 'rgba(212, 165, 116, 0.35)',
    gradient: 'linear-gradient(135deg, rgba(212,165,116,0.25), rgba(212,165,116,0.08))',
  },
  medium: {
    label: 'Medium',
    scaleLabel: 'Significant',
    scaleBars: 3,
    bg: 'rgba(139, 92, 246, 0.12)',
    text: '#a78bfa',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    dot: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.3)',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.06))',
  },
  low: {
    label: 'Low',
    scaleLabel: 'Minor',
    scaleBars: 1,
    bg: 'rgba(107, 143, 113, 0.12)',
    text: '#6b8f71',
    border: '1px solid rgba(107, 143, 113, 0.25)',
    dot: '#6b8f71',
    glow: 'rgba(107, 143, 113, 0.3)',
    gradient: 'linear-gradient(135deg, rgba(107,143,113,0.2), rgba(107,143,113,0.06))',
  },
};

const categoryConfig: Record<
  GovernanceDecision['category'],
  { label: string; bg: string; text: string; icon: typeof Landmark; iconBg: string }
> = {
  governance: { label: 'Governance', bg: 'rgba(139, 92, 246, 0.12)', text: '#a78bfa', icon: Landmark, iconBg: 'rgba(139, 92, 246, 0.18)' },
  financial: { label: 'Financial', bg: 'rgba(212, 165, 116, 0.12)', text: '#d4a574', icon: Coins, iconBg: 'rgba(212, 165, 116, 0.18)' },
  membership: { label: 'Membership', bg: 'rgba(107, 143, 113, 0.12)', text: '#6b8f71', icon: UserCog, iconBg: 'rgba(107, 143, 113, 0.18)' },
  strategy: { label: 'Strategy', bg: 'rgba(96, 165, 250, 0.12)', text: '#60a5fa', icon: Compass, iconBg: 'rgba(96, 165, 250, 0.18)' },
  node: { label: 'Node', bg: 'rgba(251, 146, 60, 0.12)', text: '#fb923c', icon: Layers, iconBg: 'rgba(251, 146, 60, 0.18)' },
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

/* ── Decision status config (approved/pending/rejected) ── */
const decisionStatusConfig: Record<
  'approved' | 'pending' | 'rejected',
  { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }
> = {
  approved: {
    label: 'Approved',
    color: '#6b8f71',
    bg: 'rgba(107, 143, 113, 0.12)',
    border: '1px solid rgba(107, 143, 113, 0.25)',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    color: '#e8b44c',
    bg: 'rgba(232, 180, 76, 0.12)',
    border: '1px solid rgba(232, 180, 76, 0.25)',
    icon: Clock,
  },
  rejected: {
    label: 'Rejected',
    color: '#e06060',
    bg: 'rgba(224, 96, 96, 0.12)',
    border: '1px solid rgba(224, 96, 96, 0.25)',
    icon: AlertTriangle,
  },
};

/* ── Vote breakdown data per decision (simulated, with timestamps) ── */
const voteBreakdowns: Record<string, {
  for: number; against: number; abstain: number;
  quorumRequired: number;
  voters: { name: string; vote: 'for' | 'against' | 'abstain'; timestamp: string }[];
}> = {
  'dec-1': {
    for: 5, against: 0, abstain: 1, quorumRequired: 4,
    voters: [
      { name: 'James', vote: 'for', timestamp: '2026-01-15T09:14:00Z' },
      { name: 'Sian', vote: 'for', timestamp: '2026-01-15T09:22:00Z' },
      { name: 'Dave', vote: 'for', timestamp: '2026-01-15T10:05:00Z' },
      { name: 'Colleen', vote: 'for', timestamp: '2026-01-15T11:30:00Z' },
      { name: 'Max', vote: 'for', timestamp: '2026-01-15T14:18:00Z' },
      { name: 'Fairman', vote: 'abstain', timestamp: '2026-01-15T16:45:00Z' },
    ],
  },
  'dec-2': {
    for: 4, against: 1, abstain: 1, quorumRequired: 4,
    voters: [
      { name: 'James', vote: 'for', timestamp: '2026-01-18T08:30:00Z' },
      { name: 'Sian', vote: 'for', timestamp: '2026-01-18T09:15:00Z' },
      { name: 'Dave', vote: 'against', timestamp: '2026-01-18T10:00:00Z' },
      { name: 'Colleen', vote: 'for', timestamp: '2026-01-18T11:45:00Z' },
      { name: 'Max', vote: 'for', timestamp: '2026-01-18T13:20:00Z' },
      { name: 'Fairman', vote: 'abstain', timestamp: '2026-01-18T15:10:00Z' },
    ],
  },
  'dec-3': {
    for: 6, against: 0, abstain: 0, quorumRequired: 4,
    voters: [
      { name: 'James', vote: 'for', timestamp: '2026-02-05T09:00:00Z' },
      { name: 'Sian', vote: 'for', timestamp: '2026-02-05T09:12:00Z' },
      { name: 'Dave', vote: 'for', timestamp: '2026-02-05T09:30:00Z' },
      { name: 'Colleen', vote: 'for', timestamp: '2026-02-05T10:00:00Z' },
      { name: 'Max', vote: 'for', timestamp: '2026-02-05T10:45:00Z' },
      { name: 'Fairman', vote: 'for', timestamp: '2026-02-05T11:20:00Z' },
    ],
  },
};

/* ── Decision rationales (expandable reasoning) ── */
const decisionRationales: Record<string, { rationale: string; keyFactors: string[] }> = {
  'dec-1': {
    rationale: 'The Teal governance model was selected after extensive research into self-managing organizations. The team recognized that traditional hierarchical governance would not serve a purpose-driven community. This model allows authority to flow to competence rather than position.',
    keyFactors: ['Alignment with Frequency values', 'Scalability for future growth', 'Precedent from successful Teal orgs'],
  },
  'dec-2': {
    rationale: 'Six pods were identified as the minimum viable network to demonstrate the distributed node model. Each pod represents a different functional area, creating a balanced ecosystem that can validate the broader vision.',
    keyFactors: ['Resource availability', 'Geographic distribution needs', 'Minimum viable demonstration'],
  },
  'dec-3': {
    rationale: 'A Donor-Advised Fund structure provides the optimal balance of tax efficiency, donor flexibility, and operational simplicity for Frequency\'s current stage. This enables immediate fundraising while the longer-term entity structure is finalized.',
    keyFactors: ['Tax efficiency', 'Donor flexibility', 'Operational simplicity', 'Speed to launch'],
  },
};

/* ── Decision flow stages ── */
const decisionFlowStages = [
  { key: 'proposal', label: 'Proposal', icon: FileText, color: '#a78bfa' },
  { key: 'discussion', label: 'Discussion', icon: MessageCircle, color: '#60a5fa' },
  { key: 'vote', label: 'Vote', icon: Vote, color: '#d4a574' },
  { key: 'ratified', label: 'Ratified', icon: Gavel, color: '#6b8f71' },
] as const;

/* ── Map decisions to their flow stage ── */
function getDecisionFlowStage(decision: GovernanceDecision): typeof decisionFlowStages[number]['key'] {
  const status = getDecisionStatus(decision);
  if (status === 'approved') return 'ratified';
  if (status === 'rejected') return 'vote';
  // pending decisions: high impact = discussion, others = vote
  if (decision.impact === 'high') return 'discussion';
  return 'vote';
}

/* ── Decision status resolver ── */
function getDecisionStatus(decision: GovernanceDecision): 'approved' | 'pending' | 'rejected' {
  const date = new Date(decision.date);
  const now = new Date();
  const daysSince = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  // High-impact recent decisions (< 14 days) are pending
  if (decision.impact === 'high' && daysSince < 14) return 'pending';
  // Otherwise approved by default (in a real system this would come from data)
  if (daysSince > 7) return 'approved';
  return 'pending';
}

/* ── Transparency Score Calculator ── */
function calculateTransparencyScore(decisions: GovernanceDecision[]): { score: number; logged: number; documented: number; recent: number } {
  const logged = decisions.length;
  const documented = decisions.filter(d => d.description && d.description.length > 20).length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recent = decisions.filter(d => new Date(d.date) >= thirtyDaysAgo).length;

  // Weighted score
  const logScore = Math.min(logged / 10, 1) * 40; // up to 40 points for 10+ decisions
  const docScore = (logged > 0 ? documented / logged : 0) * 35; // up to 35 points for documentation
  const recentScore = Math.min(recent / 3, 1) * 25; // up to 25 points for recent activity
  const score = Math.round(logScore + docScore + recentScore);

  return { score, logged, documented, recent };
}

/* ── avatar initials helper ── */
function getAvatarInitials(name: string): string {
  const parts = name.split(/[+&,]/).map((p) => p.trim());
  if (parts.length > 1) {
    return parts.map((p) => p.charAt(0).toUpperCase()).join('');
  }
  const words = name.split(' ');
  return words
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const avatarColors: Record<string, string> = {
  W: '#8b5cf6',
  'B+L': '#d4a574',
  'BL': '#d4a574',
  C: '#6b8f71',
  CS: '#d4a574',
  L: '#60a5fa',
  LC: '#60a5fa',
  B: '#e8b44c',
};

function getAvatarColor(decidedBy: string): string {
  const hash = decidedBy.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const palette = ['#d4a574', '#8b5cf6', '#6b8f71', '#60a5fa', '#fb923c', '#e8b44c'];
  return palette[hash % palette.length];
}

/* ── Animated card wrapper (enhanced with fadeSlideUp) ── */
function AnimatedCard({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: React.CSSProperties;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 70 * index);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1), transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Animated Progress Bar ── */
function AnimatedProgressBar({
  progress,
  color,
  delay = 0,
}: {
  progress: number;
  color: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(progress), delay + 300);
    return () => clearTimeout(timer);
  }, [progress, delay]);

  const milestones = [25, 50, 75];

  return (
    <div
      style={{
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: 3,
          transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1)',
          boxShadow: width > 0 ? `0 0 8px ${color}40` : 'none',
        }}
      />
      {milestones.map((m) => (
        <div
          key={m}
          style={{
            position: 'absolute',
            left: `${m}%`,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(255,255,255,0.1)',
          }}
        />
      ))}
    </div>
  );
}

/* ── Decision Flow Diagram ── */
function DecisionFlowDiagram({ activeStage }: { activeStage: typeof decisionFlowStages[number]['key'] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const activeIdx = decisionFlowStages.findIndex(s => s.key === activeStage);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
      {decisionFlowStages.map((stage, idx) => {
        const Icon = stage.icon;
        const isActive = idx === activeIdx;
        const isPast = idx < activeIdx;
        const opacity = mounted ? 1 : 0;
        const translateX = mounted ? 0 : -12;
        return (
          <React.Fragment key={stage.key}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                flex: 1,
                opacity,
                transform: `translateX(${translateX}px)`,
                transition: `all 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${idx * 0.12}s`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: isPast || isActive ? `${stage.color}20` : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${isPast || isActive ? stage.color : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.4s ease',
                  boxShadow: isActive ? `0 0 16px ${stage.color}40, 0 0 0 4px ${stage.color}15` : 'none',
                  position: 'relative',
                }}
              >
                {isPast ? (
                  <CheckCircle2 size={16} style={{ color: stage.color }} />
                ) : (
                  <Icon size={16} style={{ color: isPast || isActive ? stage.color : '#6b6358' }} />
                )}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    border: `2px solid ${stage.color}40`,
                    animation: 'govPulse 2.5s ease infinite',
                  }} />
                )}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color: isPast || isActive ? stage.color : '#6b6358',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                transition: 'color 0.3s',
              }}>
                {stage.label}
              </span>
            </div>
            {idx < decisionFlowStages.length - 1 && (
              <div style={{
                flex: 0.6,
                height: 2,
                borderRadius: 1,
                background: isPast
                  ? `linear-gradient(90deg, ${stage.color}, ${decisionFlowStages[idx + 1].color})`
                  : 'rgba(255,255,255,0.06)',
                transition: 'background 0.6s ease',
                marginTop: -20,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {isPast && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s ease infinite',
                  }} />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Quorum Ring ── */
function QuorumRing({ total, required, met }: { total: number; required: number; met: boolean }) {
  const [animPct, setAnimPct] = useState(0);
  const pct = Math.min(total / required, 1);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);

  const r = 18;
  const circ = 2 * Math.PI * r;
  const dashLen = animPct * circ;
  const color = met ? '#6b8f71' : '#e8b44c';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 44, height: 44 }}>
        <svg viewBox="0 0 44 44" width="44" height="44">
          <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            cx="22" cy="22" r={r} fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${circ}`}
            transform="rotate(-90 22 22)"
            style={{
              transition: 'stroke-dasharray 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
              filter: `drop-shadow(0 0 4px ${color}50)`,
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {met ? (
            <CheckCircle2 size={14} style={{ color }} />
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color }}>{total}/{required}</span>
          )}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6358' }}>Quorum</div>
        <div style={{ fontSize: 11, fontWeight: 600, color }}>
          {met ? 'Met' : `${total} of ${required} needed`}
        </div>
      </div>
    </div>
  );
}

/* ── Impact Assessment Scale ── */
function ImpactScale({ bars, color, label }: { bars: number; color: string; label: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Zap size={11} style={{ color, opacity: 0.7 }} />
      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            style={{
              width: 4,
              height: 6 + i * 2.5,
              borderRadius: 2,
              backgroundColor: i <= bars ? color : 'rgba(255,255,255,0.06)',
              transition: `all 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${mounted ? i * 0.08 : 0}s`,
              transform: mounted && i <= bars ? 'scaleY(1)' : i <= bars ? 'scaleY(0)' : 'scaleY(1)',
              transformOrigin: 'bottom',
              boxShadow: i <= bars ? `0 0 4px ${color}30` : 'none',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 9, fontWeight: 600, color, letterSpacing: '0.04em' }}>{label}</span>
    </div>
  );
}

/* ── Countdown Timer for pending decisions ── */
function CountdownTimer({ targetDate, color }: { targetDate: Date; color: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(iv);
  }, []);

  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return (
    <span style={{ fontSize: 10, color: '#e06060', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
      <Timer size={10} /> Voting closed
    </span>
  );

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      backgroundColor: `${color}10`,
      border: `1px solid ${color}25`,
      borderRadius: 10,
      padding: '4px 10px',
    }}>
      <Timer size={11} style={{ color, animation: 'statusPulse 2s ease infinite' }} />
      <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
        {days > 0 && (
          <>
            <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{days}</span>
            <span style={{ fontSize: 9, color: '#6b6358', fontWeight: 500 }}>d</span>
          </>
        )}
        <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{hours}</span>
        <span style={{ fontSize: 9, color: '#6b6358', fontWeight: 500 }}>h remaining</span>
      </div>
    </div>
  );
}

/* ── Decision Type Icon ── */
function DecisionTypeIcon({ category, size = 18 }: { category: GovernanceDecision['category']; size?: number }) {
  const cfg = categoryConfig[category];
  const Icon = cfg.icon;
  return (
    <div style={{
      width: size + 12,
      height: size + 12,
      borderRadius: 8,
      backgroundColor: cfg.iconBg,
      border: `1px solid ${cfg.text}30`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={size} style={{ color: cfg.text }} />
    </div>
  );
}

/* ── Animated Vote Bar (grows on expand) ── */
function AnimatedVoteBar({ forPct, againstPct, abstainPct, isVisible }: {
  forPct: number; againstPct: number; abstainPct: number; isVisible: boolean;
}) {
  const [widths, setWidths] = useState({ f: 0, a: 0, ab: 0 });

  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => setWidths({ f: forPct, a: againstPct, ab: abstainPct }), 200);
      return () => clearTimeout(t);
    } else {
      setWidths({ f: 0, a: 0, ab: 0 });
    }
  }, [isVisible, forPct, againstPct, abstainPct]);

  return (
    <div style={{
      height: 12,
      borderRadius: 6,
      overflow: 'hidden',
      display: 'flex',
      gap: 2,
      backgroundColor: 'rgba(255,255,255,0.03)',
    }}>
      <div style={{
        width: `${widths.f}%`,
        height: '100%',
        backgroundColor: '#6b8f71',
        borderRadius: 6,
        transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1) 0.1s',
        boxShadow: widths.f > 0 ? '0 0 10px rgba(107, 143, 113, 0.35)' : 'none',
      }} />
      <div style={{
        width: `${widths.a}%`,
        height: '100%',
        backgroundColor: '#e06060',
        borderRadius: 6,
        transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1) 0.2s',
        boxShadow: widths.a > 0 ? '0 0 10px rgba(224, 96, 96, 0.35)' : 'none',
      }} />
      <div style={{
        width: `${widths.ab}%`,
        height: '100%',
        backgroundColor: '#6b6358',
        borderRadius: 6,
        transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1) 0.3s',
      }} />
    </div>
  );
}

/* ── Gradient Section Divider ── */
function SectionDivider({ color = '#d4a574' }: { color?: string }) {
  return (
    <div style={{
      height: 1,
      margin: '48px 0',
      background: `linear-gradient(90deg, transparent, ${color}25, ${color}15, transparent)`,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: `${color}40`,
        boxShadow: `0 0 8px ${color}20`,
      }} />
    </div>
  );
}

/* ── Log Decision Modal (enhanced with scale + blur) ── */
function LogDecisionModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (decision: Omit<GovernanceDecision, 'id'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [decidedBy, setDecidedBy] = useState('');
  const [impact, setImpact] = useState<GovernanceDecision['impact']>('medium');
  const [category, setCategory] = useState<GovernanceDecision['category']>('governance');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDecidedBy('');
    setImpact('medium');
    setCategory('governance');
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !decidedBy.trim()) return;
    setSubmitting(true);
    try {
      onSubmit({
        date: today,
        title: title.trim(),
        description: description.trim(),
        decidedBy: decidedBy.trim(),
        impact,
        category,
      });
      handleClose();
    } catch {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(212, 165, 116, 0.12)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: '#f0ebe4',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box' as const,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#6b6358',
    marginBottom: 6,
    display: 'block',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b6358' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
    cursor: 'pointer',
  };

  return (
    <>
      {/* Backdrop with animated blur */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9998,
          animation: 'modalBackdropEnter 0.3s ease forwards',
        }}
      />
      {/* Modal with scale entrance */}
      <div
        className="scrollbar-autohide"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 520,
          maxWidth: 'min(calc(100vw - 48px), 90vw)',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          backgroundColor: 'rgba(19, 23, 32, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 165, 116, 0.15)',
          borderRadius: 18,
          padding: 0,
          zIndex: 9999,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(212, 165, 116, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
          animation: 'modalEnter 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        }}
      >
        {/* Top gradient line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 18,
            right: 18,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(212,165,116,0.4), transparent)',
            borderRadius: 1,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(212, 165, 116, 0.08)',
            animation: 'modalContentStagger 0.4s ease 0.1s both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: 'rgba(212, 165, 116, 0.12)',
                border: '1px solid rgba(212, 165, 116, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ScrollText size={16} style={{ color: '#d4a574' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
                Log Decision
              </h2>
              <p style={{ fontSize: 11, color: '#6b6358', margin: 0 }}>{today}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'transparent',
              color: '#6b6358',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f0ebe4';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b6358';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body with staggered animation */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div style={{ animation: 'modalContentStagger 0.4s ease 0.15s both' }}>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Decision title..."
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.08)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Description */}
          <div style={{ animation: 'modalContentStagger 0.4s ease 0.2s both' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the decision and its rationale..."
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 80,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.08)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Decided By */}
          <div style={{ animation: 'modalContentStagger 0.4s ease 0.25s both' }}>
            <label style={labelStyle}>Decided By</label>
            <input
              type="text"
              value={decidedBy}
              onChange={(e) => setDecidedBy(e.target.value)}
              placeholder="Who made this decision..."
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.08)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Impact + Category row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, animation: 'modalContentStagger 0.4s ease 0.3s both' }}>
            {/* Impact */}
            <div>
              <label style={labelStyle}>Impact</label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value as GovernanceDecision['impact'])}
                style={selectStyle}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GovernanceDecision['category'])}
                style={selectStyle}
              >
                <option value="governance">Governance</option>
                <option value="financial">Financial</option>
                <option value="membership">Membership</option>
                <option value="strategy">Strategy</option>
                <option value="node">Node</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '16px 24px',
            borderTop: '1px solid rgba(212, 165, 116, 0.08)',
            animation: 'modalContentStagger 0.4s ease 0.35s both',
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              border: '1px solid #1e2638',
              backgroundColor: 'transparent',
              color: '#a09888',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2e3a4e';
              e.currentTarget.style.color = '#f0ebe4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1e2638';
              e.currentTarget.style.color = '#a09888';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || !decidedBy.trim() || submitting}
            style={{
              padding: '9px 22px',
              borderRadius: 10,
              border: '1px solid rgba(212, 165, 116, 0.3)',
              backgroundColor: 'rgba(212, 165, 116, 0.15)',
              color: !title.trim() || !description.trim() || !decidedBy.trim() ? '#6b6358' : '#d4a574',
              fontSize: 13,
              fontWeight: 600,
              cursor: !title.trim() || !description.trim() || !decidedBy.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              opacity: !title.trim() || !description.trim() || !decidedBy.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={(e) => {
              if (title.trim() && description.trim() && decidedBy.trim()) {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.45)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(212,165,116,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={14} />
            {submitting ? 'Logging...' : 'Log Decision'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Main component ── */

export function GovernanceView() {
  const { governanceDecisions, createGovernanceDecision } = useFrequencyData();

  const sorted = [...governanceDecisions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showLogModal, setShowLogModal] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLogModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allCategories = ['all', ...Object.keys(categoryConfig)] as const;

  const filteredDecisions =
    activeCategory === 'all'
      ? sorted
      : sorted.filter((d) => d.category === activeCategory);

  /* summary stats */
  const totalDecisions = governanceDecisions.length;
  const categoryCounts = Object.entries(categoryConfig).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    color: cfg.text,
    count: governanceDecisions.filter((d) => d.category === key).length,
  }));
  const highImpactCount = governanceDecisions.filter((d) => d.impact === 'high').length;

  /* ── Glassmorphism card base style ── */
  const glassCard: React.CSSProperties = {
    backgroundColor: 'rgba(19, 23, 32, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div ref={containerRef} style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 1000, margin: '0 auto', background: '#0b0d14', minHeight: '100vh' }}>
      {/* ── All keyframes ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalEnter {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes modalBackdropEnter {
          from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        }
        @keyframes modalContentStagger {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes seatPulse {
          0%, 100% { border-color: rgba(212,165,116,0.08); box-shadow: 0 0 0 0 rgba(212,165,116,0); }
          50% { border-color: rgba(212,165,116,0.25); box-shadow: 0 0 12px rgba(212,165,116,0.06); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes progressGlow {
          0%, 100% { box-shadow: 0 0 4px rgba(232,180,76,0.2); }
          50% { box-shadow: 0 0 10px rgba(232,180,76,0.4); }
        }
        @keyframes govPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,165,116,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(212,165,116,0); }
        }
        @keyframes timelineFadeIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes downloadBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(2px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes filledSeatGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(212,165,116,0.1); }
          50% { box-shadow: 0 0 20px rgba(212,165,116,0.2); }
        }
        @keyframes needleSwing {
          0% { transform: rotate(-90deg); }
          60% { transform: rotate(var(--needle-target, 0deg)); }
          75% { transform: rotate(calc(var(--needle-target, 0deg) - 5deg)); }
          90% { transform: rotate(calc(var(--needle-target, 0deg) + 2deg)); }
          100% { transform: rotate(var(--needle-target, 0deg)); }
        }
        @keyframes voteBarGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes rationaleReveal {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flowPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--flow-color, rgba(212,165,116,0.4)); }
          50% { box-shadow: 0 0 0 8px transparent; }
        }
        @keyframes countdownTick {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Header */}
      <div className="noise-overlay dot-pattern" style={{ marginBottom: 32 }}>
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
              className="text-glow"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowLogModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid rgba(212, 165, 116, 0.3)',
                backgroundColor: 'rgba(212, 165, 116, 0.1)',
                color: '#d4a574',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.45)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(212,165,116,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Plus size={14} />
              Log Decision
            </button>
            {/* Export button with animated download icon */}
            <button
              onClick={() => {
                if (containerRef.current) exportPdf(containerRef.current, 'Governance');
              }}
              className="gov-export-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #1e2638',
                backgroundColor: 'rgba(19, 23, 32, 0.8)',
                color: '#a09888',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                fontFamily: 'inherit',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
                e.currentTarget.style.color = '#d4a574';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(212,165,116,0.08)';
                const icon = e.currentTarget.querySelector('.dl-icon') as HTMLElement;
                if (icon) icon.style.animation = 'downloadBounce 0.5s ease infinite';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e2638';
                e.currentTarget.style.color = '#a09888';
                e.currentTarget.style.boxShadow = 'none';
                const icon = e.currentTarget.querySelector('.dl-icon') as HTMLElement;
                if (icon) icon.style.animation = 'none';
              }}
            >
              <span className="dl-icon" style={{ display: 'flex', transition: 'transform 0.2s' }}>
                <Download size={14} />
              </span>
              Export as Image
            </button>
          </div>
        </div>
        <p
          style={{
            fontSize: 14,
            color: '#a09888',
            margin: 0,
            paddingLeft: 40,
          }}
        >
          How we make decisions matters as much as what we decide. Our governance evolves with our
          consciousness.
        </p>
      </div>

      {/* ── Summary Stats Bar ── */}
      <AnimatedCard index={0}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 32,
            flexWrap: 'wrap',
          }}
        >
          {/* Total */}
          <div
            className="card-stat"
            style={{
              ...glassCard,
              padding: '16px 22px',
              minWidth: 130,
              flex: '0 0 auto',
            }}
          >
            {/* Top gradient line */}
            <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)', borderRadius: 1 }} />
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4', lineHeight: 1 }}>
              {totalDecisions}
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Decisions
            </div>
          </div>

          {/* High impact */}
          <div
            className="card-stat"
            style={{
              ...glassCard,
              border: '1px solid rgba(212, 165, 116, 0.15)',
              padding: '16px 22px',
              minWidth: 120,
              flex: '0 0 auto',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,165,116,0.4), transparent)', borderRadius: 1 }} />
            <div style={{ fontSize: 28, fontWeight: 700, color: '#d4a574', lineHeight: 1 }}>
              {highImpactCount}
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              High Impact
            </div>
          </div>

          {/* Category breakdown */}
          <div
            className="card-stat"
            style={{
              ...glassCard,
              padding: '14px 22px',
              flex: 1,
              minWidth: 240,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', borderRadius: 1 }} />
            {categoryCounts.map((c) => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: c.color,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${c.color}40`,
                  }}
                />
                <span style={{ fontSize: 12, color: '#a09888' }}>
                  {c.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {/* ── Transparency Score Gauge ── */}
      <AnimatedCard index={1}>
        {(() => {
          const transparency = calculateTransparencyScore(governanceDecisions);
          const gaugeAngle = (transparency.score / 100) * 180;
          const scoreColor = transparency.score >= 70 ? '#6b8f71' : transparency.score >= 40 ? '#e8b44c' : '#e06060';
          const scoreLabel = transparency.score >= 70 ? 'Excellent' : transparency.score >= 40 ? 'Good' : 'Needs Attention';
          return (
            <div
              className="card-stat"
              style={{
                ...glassCard,
                padding: '28px 32px',
                marginBottom: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 32,
                flexWrap: 'wrap',
              }}
            >
              {/* Top gradient line */}
              <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: `linear-gradient(90deg, transparent, ${scoreColor}40, transparent)`, borderRadius: 1 }} />

              {/* Gauge with needle */}
              <div style={{ position: 'relative', width: 140, height: 85, flexShrink: 0 }}>
                <svg viewBox="0 0 140 85" width="140" height="85">
                  {/* Background arc */}
                  <path
                    d="M 15 75 A 55 55 0 0 1 125 75"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Colored gradient segments */}
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#e06060" />
                      <stop offset="40%" stopColor="#e8b44c" />
                      <stop offset="100%" stopColor="#6b8f71" />
                    </linearGradient>
                  </defs>
                  {/* Score arc */}
                  <path
                    d="M 15 75 A 55 55 0 0 1 125 75"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(gaugeAngle / 180) * 173} 173`}
                    style={{
                      filter: `drop-shadow(0 0 6px ${scoreColor}60)`,
                      transition: 'stroke-dasharray 1.5s cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                  />
                  {/* Tick marks */}
                  {[0, 25, 50, 75, 100].map((tick) => {
                    const angle = (tick / 100) * Math.PI;
                    const x1 = 70 - 48 * Math.cos(angle);
                    const y1 = 75 - 48 * Math.sin(angle);
                    const x2 = 70 - 42 * Math.cos(angle);
                    const y2 = 75 - 42 * Math.sin(angle);
                    return (
                      <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
                    );
                  })}
                  {/* Needle */}
                  <g
                    style={{
                      transformOrigin: '70px 75px',
                      ['--needle-target' as string]: `${-90 + gaugeAngle}deg`,
                      animation: 'needleSwing 1.8s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both',
                    }}
                  >
                    <line x1="70" y1="75" x2="70" y2="30" stroke={scoreColor} strokeWidth="2.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${scoreColor}80)` }} />
                    <circle cx="70" cy="75" r="4" fill={scoreColor} style={{ filter: `drop-shadow(0 0 4px ${scoreColor}60)` }} />
                    <circle cx="70" cy="75" r="2" fill="#0b0d14" />
                  </g>
                  {/* Score text */}
                  <text x="70" y="65" textAnchor="middle" fill={scoreColor} fontSize="26" fontWeight="700" fontFamily="inherit" style={{ opacity: 0, animation: 'fadeSlideUp 0.5s ease 1s forwards' }}>
                    {transparency.score}
                  </text>
                  <text x="70" y="82" textAnchor="middle" fill="#6b6358" fontSize="9" fontWeight="600" letterSpacing="0.08em" fontFamily="inherit" style={{ textTransform: 'uppercase' }}>
                    {scoreLabel}
                  </text>
                </svg>
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Eye size={16} style={{ color: scoreColor }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4' }}>Transparency Score</span>
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Decisions Logged', value: transparency.logged, max: 10, color: '#8b5cf6' },
                    { label: 'Documented', value: transparency.documented, max: transparency.logged || 1, color: '#d4a574' },
                    { label: 'Last 30 Days', value: transparency.recent, max: 3, color: '#6b8f71' },
                  ].map((metric) => {
                    const pct = Math.min((metric.value / metric.max) * 100, 100);
                    return (
                      <div key={metric.label} style={{ flex: '1 1 120px', minWidth: 100 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: '#6b6358', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{metric.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: metric.color }}>{metric.value}</span>
                        </div>
                        <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: metric.color, borderRadius: 2, transition: 'width 1s ease', boxShadow: `0 0 6px ${metric.color}40` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </AnimatedCard>

      {/* ── Decision Flow Pipeline ── */}
      <AnimatedCard index={2}>
        <div
          style={{
            ...glassCard,
            padding: '28px 32px',
            marginBottom: 0,
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.3), rgba(212,165,116,0.3), rgba(107,143,113,0.3), transparent)', borderRadius: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <TrendingUp size={16} style={{ color: '#a78bfa' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>Decision Pipeline</span>
            <span style={{ fontSize: 10, color: '#6b6358', fontWeight: 500, letterSpacing: '0.04em' }}>How decisions flow through governance</span>
          </div>
          <DecisionFlowDiagram activeStage="ratified" />
        </div>
      </AnimatedCard>

      <SectionDivider color="#d4a574" />

      {/* ── Governance Principles (enhanced with numbered circles + quote marks) ── */}
      <section style={{ marginBottom: 0 }}>
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
              <AnimatedCard key={idx} index={idx + 1}>
                <div
                  className="card-interactive"
                  style={{
                    ...glassCard,
                    padding: 22,
                    transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                    height: '100%',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${p.color}40`;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 8px 32px ${p.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Top gradient line */}
                  <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: `linear-gradient(90deg, transparent, ${p.color}40, transparent)`, borderRadius: 1 }} />

                  {/* Quote mark decoration */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 16,
                      fontSize: 48,
                      fontFamily: 'Georgia, serif',
                      color: `${p.color}10`,
                      lineHeight: 1,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    &ldquo;
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    {/* Numbered circle indicator */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        backgroundColor: `${p.color}15`,
                        border: `1.5px solid ${p.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                      }}
                    >
                      <Icon size={15} style={{ color: p.color }} />
                      {/* Number badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: '#d4a574',
                          color: '#0b0d14',
                          fontSize: 9,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #0b0d14',
                        }}
                      >
                        {idx + 1}
                      </span>
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
              </AnimatedCard>
            );
          })}
        </div>
      </section>

      <SectionDivider color="#8b5cf6" />

      {/* ── Governance Structure ── */}
      <section style={{ marginBottom: 0 }}>
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
              <AnimatedCard key={idx} index={idx + 6} style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
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
                            background: `linear-gradient(to bottom, ${tier.color}30, ${governanceStructure[idx + 1]?.color || tier.color}30)`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className="card-interactive"
                    style={{
                      ...glassCard,
                      border: `1px solid ${tier.color}20`,
                      borderRadius: 14,
                      padding: '18px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 18,
                      transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${tier.color}50`;
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = `0 4px 24px ${tier.color}12`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${tier.color}20`;
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Top gradient line */}
                    <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: `linear-gradient(90deg, transparent, ${tier.color}30, transparent)`, borderRadius: 1 }} />

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
              </AnimatedCard>
            );
          })}
        </div>
      </section>

      <SectionDivider color="#d4a574" />

      {/* ── Board of Stewards (9-Seat Structure) -- Premium card feel ── */}
      <section style={{ marginBottom: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <Users size={18} style={{ color: '#d4a574' }} />
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#e8c9a0',
              margin: 0,
            }}
          >
            Board of Stewards
          </h2>
        </div>
        <p
          style={{
            fontSize: 12,
            color: '#6b6358',
            margin: '0 0 20px 26px',
            letterSpacing: '0.02em',
          }}
        >
          9 seats &middot; 2-year terms &middot; Elected by steward nominations
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {([
            { seat: 1, name: 'Founder Seat', type: 'Reserved' as const, holder: 'James Hodges', color: '#d4a574' },
            { seat: 2, name: 'Change Agent', type: 'Elected' as const, holder: 'Open', color: '#8b5cf6' },
            { seat: 3, name: 'Wealth Steward', type: 'Elected' as const, holder: 'Open', color: '#6b8f71' },
            { seat: 4, name: 'Wisdom Keeper', type: 'Elected' as const, holder: 'Open', color: '#60a5fa' },
            { seat: 5, name: 'Change Agent', type: 'Elected' as const, holder: 'Open', color: '#8b5cf6' },
            { seat: 6, name: 'Wealth Steward', type: 'Elected' as const, holder: 'Open', color: '#6b8f71' },
            { seat: 7, name: 'Change Agent', type: 'Elected' as const, holder: 'Open', color: '#8b5cf6' },
            { seat: 8, name: 'Wisdom Keeper', type: 'Elected' as const, holder: 'Open', color: '#60a5fa' },
            { seat: 9, name: 'At-Large', type: 'Nominated' as const, holder: 'Open', color: '#fb923c' },
          ]).map((s, idx) => {
            const isFilled = s.holder !== 'Open';
            const typeColors: Record<string, { bg: string; text: string }> = {
              Reserved: { bg: 'rgba(212, 165, 116, 0.15)', text: '#d4a574' },
              Elected: { bg: 'rgba(139, 92, 246, 0.12)', text: '#a78bfa' },
              Nominated: { bg: 'rgba(251, 146, 60, 0.12)', text: '#fb923c' },
            };
            const badge = typeColors[s.type];
            return (
              <AnimatedCard key={s.seat} index={idx + 10}>
                <div
                  style={{
                    ...glassCard,
                    border: isFilled
                      ? `1px solid rgba(212, 165, 116, 0.25)`
                      : '1px dashed rgba(212, 165, 116, 0.12)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    animation: isFilled ? 'filledSeatGlow 3s ease infinite' : 'seatPulse 3s ease infinite',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${s.color}50`;
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 8px 32px ${s.color}18`;
                    e.currentTarget.style.borderStyle = 'solid';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isFilled ? 'rgba(212, 165, 116, 0.25)' : 'rgba(212, 165, 116, 0.12)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = isFilled ? '0 0 12px rgba(212,165,116,0.1)' : 'none';
                    e.currentTarget.style.borderStyle = isFilled ? 'solid' : 'dashed';
                  }}
                >
                  {/* Top gradient border line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 14,
                    right: 14,
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${s.color}${isFilled ? '50' : '20'}, transparent)`,
                    borderRadius: 1,
                  }} />

                  {/* Seat number with avatar ring for filled */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#6b6358',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Seat {s.seat}
                    </span>
                    {isFilled && (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#0b0d14',
                          boxShadow: `0 0 12px ${s.color}30`,
                          border: '2px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {getAvatarInitials(s.holder)}
                      </div>
                    )}
                  </div>

                  {/* Seat name */}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#f0ebe4',
                      marginBottom: 8,
                    }}
                  >
                    {s.name}
                  </div>

                  {/* Type badge */}
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 9,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: badge.text,
                      backgroundColor: badge.bg,
                      borderRadius: 10,
                      padding: '2px 8px',
                      marginBottom: 8,
                    }}
                  >
                    {s.type}
                  </span>

                  {/* Holder */}
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: isFilled ? 500 : 400,
                      color: isFilled ? '#f0ebe4' : '#6b6358',
                      fontStyle: isFilled ? 'normal' : 'italic',
                    }}
                  >
                    {isFilled ? s.holder : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Plus size={10} style={{ opacity: 0.5 }} />
                        Open Seat
                      </span>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </section>

      <SectionDivider color="#6b8f71" />

      {/* ── Coherence Accountability Policy ── */}
      <section style={{ marginBottom: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <Shield size={18} style={{ color: '#6b8f71' }} />
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#e8c9a0',
              margin: 0,
            }}
          >
            Coherence Accountability Policy
          </h2>
        </div>
        <p
          style={{
            fontSize: 12,
            color: '#6b6358',
            margin: '0 0 20px 26px',
            letterSpacing: '0.02em',
          }}
        >
          When a steward falls out of alignment
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 0,
            alignItems: 'stretch',
          }}
        >
          {([
            {
              step: 1,
              title: 'Private Conversation',
              description: 'Direct, compassionate dialogue between parties. Most issues resolve here.',
              color: '#6b8f71',
            },
            {
              step: 2,
              title: 'Formal Acknowledgement',
              description: 'Documented conversation with a witness. Clear agreements and timelines set.',
              color: '#f59e0b',
            },
            {
              step: 3,
              title: 'Transition with Dignity',
              description: 'If coherence cannot be restored, a graceful transition is offered.',
              color: '#ef4444',
            },
          ]).map((s, idx) => (
            <AnimatedCard key={s.step} index={idx + 19}>
              <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
                <div
                  style={{
                    ...glassCard,
                    borderRadius: 14,
                    padding: '22px 20px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${s.color}50`;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}12`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Top gradient line */}
                  <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: `linear-gradient(90deg, transparent, ${s.color}30, transparent)`, borderRadius: 1 }} />

                  {/* Step number circle */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: `${s.color}20`,
                      border: `2px solid ${s.color}60`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: s.color,
                      marginBottom: 14,
                      flexShrink: 0,
                    }}
                  >
                    {s.step}
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#f0ebe4',
                      marginBottom: 8,
                    }}
                  >
                    {s.title}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 12,
                      color: '#a09888',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {s.description}
                  </p>
                </div>

                {/* Connecting arrow between cards (not after last) */}
                {idx < 2 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      flexShrink: 0,
                    }}
                  >
                    <ArrowRight size={18} style={{ color: '#2e3a4e' }} />
                  </div>
                )}
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      <SectionDivider color="#e8b44c" />

      {/* ── Decision-to-Implementation Tracker (enhanced) ── */}
      <section style={{ marginBottom: 0 }}>
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

        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {(['completed', 'in-progress', 'overdue', 'pending'] as const).map((s) => {
            const cfg = statusConfig[s];
            const count = implementationTracker.filter((t) => t.status === s).length;
            const SIcon = cfg.icon;
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
                <SIcon size={14} style={{ color: cfg.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
                  {count}
                </span>
                <span style={{ fontSize: 12, color: '#a09888' }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
            gap: 12,
            padding: '0 22px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 8,
          }}
        >
          {['Decision', 'Owner', 'Deadline', 'Status', 'Progress'].map((header) => (
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
          ))}
        </div>

        {/* Timeline connector line */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 10,
              top: 20,
              bottom: 20,
              width: 2,
              background: 'linear-gradient(to bottom, rgba(232,180,76,0.3), rgba(232,180,76,0.05))',
              borderRadius: 1,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 0 }}>
            {implementationTracker.map((item, idx) => {
              const cfg = statusConfig[item.status];
              const StatusIcon = cfg.icon;
              const isActive = item.status === 'in-progress';
              return (
                <AnimatedCard key={idx} index={idx + 10}>
                  <div style={{ position: 'relative' }}>
                    {/* Timeline dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 4,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: cfg.color,
                        border: '3px solid #0b0d14',
                        zIndex: 1,
                        boxShadow: `0 0 0 2px ${cfg.color}30`,
                        animation: isActive ? 'statusPulse 2s ease infinite' : 'none',
                      }}
                    />

                    <div
                      style={{
                        ...glassCard,
                        borderRadius: 14,
                        padding: '14px 22px',
                        marginLeft: 24,
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
                        gap: 12,
                        alignItems: 'center',
                        transition: 'border-color 0.25s, box-shadow 0.25s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${cfg.color}35`;
                        e.currentTarget.style.boxShadow = `0 4px 20px ${cfg.color}10`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Top gradient line */}
                      <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: `linear-gradient(90deg, transparent, ${cfg.color}20, transparent)`, borderRadius: 1 }} />

                      <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ebe4' }}>
                        {item.decision}
                      </span>
                      <span style={{ fontSize: 13, color: '#a09888' }}>{item.owner}</span>
                      <span
                        style={{
                          fontSize: 12,
                          color: item.status === 'overdue' ? '#e06060' : '#a09888',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {item.deadline}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <StatusIcon
                          size={12}
                          style={{
                            color: cfg.color,
                            animation: isActive ? 'statusPulse 2s ease infinite' : 'none',
                          }}
                        />
                        <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AnimatedProgressBar
                          progress={item.progress}
                          color={cfg.color}
                          delay={idx * 100}
                        />
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
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider color="#6b8f71" />

      {/* ── Decision Log -- Timeline Layout ── */}
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
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8c9a0', margin: 0 }}>
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
            {filteredDecisions.length} decisions
          </span>
        </div>

        {/* ── Category Filter Tabs ── */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 24,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Filter size={14} style={{ color: '#6b6358', marginRight: 4 }} />
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat;
            const cfg = cat === 'all' ? null : categoryConfig[cat as GovernanceDecision['category']];
            const label = cat === 'all' ? 'All' : cfg!.label;
            const color = cat === 'all' ? '#f0ebe4' : cfg!.text;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: isActive ? `1px solid ${color}60` : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: isActive ? `${color}18` : 'transparent',
                  color: isActive ? color : '#6b6358',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = '#a09888';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#6b6358';
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Timeline ── */}
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          {/* Vertical line */}
          <div
            style={{
              position: 'absolute',
              left: 11,
              top: 8,
              bottom: 8,
              width: 2,
              background: 'linear-gradient(to bottom, rgba(107,143,113,0.3), rgba(107,143,113,0.05))',
              borderRadius: 1,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {filteredDecisions.map((decision, idx) => {
              const impact = impactConfig[decision.impact];
              const category = categoryConfig[decision.category];
              const isExpanded = expandedId === decision.id;
              const initials = getAvatarInitials(decision.decidedBy);
              const avatarColor = getAvatarColor(decision.decidedBy);
              const decisionDate = new Date(decision.date);
              const status = getDecisionStatus(decision);
              const statusCfg = decisionStatusConfig[status];
              const StatusIcon = statusCfg.icon;
              const votes = voteBreakdowns[decision.id];
              const totalVotes = votes ? votes.for + votes.against + votes.abstain : 0;
              const flowStage = getDecisionFlowStage(decision);
              const rationale = decisionRationales[decision.id];
              const isPending = status === 'pending';
              // For pending decisions, set a voting deadline 14 days from decision date
              const votingDeadline = new Date(decisionDate.getTime() + 14 * 24 * 60 * 60 * 1000);

              return (
                <AnimatedCard key={decision.id} index={idx + 16} style={{ position: 'relative' }}>
                  {/* Timeline dot with animated ring */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -32 + 5,
                      top: 26,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: impact.dot,
                      border: '3px solid #0b0d14',
                      zIndex: 1,
                      boxShadow: `0 0 0 2px ${impact.dot}30, 0 0 8px ${impact.dot}20`,
                      animation: isPending ? 'govPulse 2.5s ease infinite' : 'none',
                    }}
                  />

                  {/* Timeline connector line between dots (not on last) */}
                  {idx < filteredDecisions.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: -32 + 11,
                        top: 44,
                        bottom: -24,
                        width: 2,
                        background: `linear-gradient(to bottom, ${impact.dot}30, rgba(107,143,113,0.1))`,
                        borderRadius: 1,
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Premium Decision Card */}
                  <div
                    className="card-interactive"
                    style={{
                      ...glassCard,
                      border: `1px solid ${isExpanded ? impact.dot + '40' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 16,
                      overflow: 'hidden',
                      transition: 'border-color 0.3s, box-shadow 0.4s, transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.borderColor = `${impact.dot}30`;
                        e.currentTarget.style.boxShadow = `0 8px 32px ${impact.glow}, 0 0 0 1px ${impact.dot}15`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {/* Top gradient accent line */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg, transparent 5%, ${impact.dot}50 30%, ${impact.dot}30 70%, transparent 95%)`,
                    }} />

                    {/* Impact type indicator stripe on left */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: impact.dot,
                      boxShadow: `0 0 8px ${impact.dot}40`,
                    }} />

                    {/* Clickable header area */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : decision.id)
                      }
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '20px 24px 18px 28px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      {/* Top row: Decision type icon + Date badge + Status + Impact + Category */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 12,
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        {/* Left cluster: type icon, date badge, avatars */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {/* Decision Type Icon */}
                          <DecisionTypeIcon category={decision.category} size={15} />

                          {/* Date badge */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: 8,
                              padding: '4px 10px',
                            }}
                          >
                            <span style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', lineHeight: 1 }}>
                              {decisionDate.getDate()}
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                              <span style={{ fontSize: 9, fontWeight: 600, color: '#a09888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {decisionDate.toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <span style={{ fontSize: 9, color: '#6b6358' }}>
                                {decisionDate.getFullYear()}
                              </span>
                            </div>
                          </div>

                          {/* Voter avatars (collapsed) */}
                          {votes && (
                            <div style={{ display: 'flex', marginLeft: 4 }}>
                              {votes.voters.slice(0, 4).map((v, vIdx) => {
                                const vColor = getAvatarColor(v.name);
                                return (
                                  <div
                                    key={vIdx}
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      backgroundColor: vColor,
                                      border: '2px solid #131720',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 9,
                                      fontWeight: 700,
                                      color: '#0b0d14',
                                      marginLeft: vIdx > 0 ? -6 : 0,
                                      zIndex: 10 - vIdx,
                                      position: 'relative',
                                    }}
                                    title={v.name}
                                  >
                                    {v.name.charAt(0).toUpperCase()}
                                  </div>
                                );
                              })}
                              {votes.voters.length > 4 && (
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.08)',
                                    border: '2px solid #131720',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 8,
                                    fontWeight: 600,
                                    color: '#a09888',
                                    marginLeft: -6,
                                    zIndex: 5,
                                    position: 'relative',
                                  }}
                                >
                                  +{votes.voters.length - 4}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Countdown timer for pending decisions */}
                          {isPending && (
                            <CountdownTimer targetDate={votingDeadline} color="#e8b44c" />
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {/* Decision status badge (approved/pending/rejected) */}
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: statusCfg.color,
                              backgroundColor: statusCfg.bg,
                              border: statusCfg.border,
                              borderRadius: 12,
                              padding: '3px 10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <StatusIcon size={10} style={{ color: statusCfg.color }} />
                            {statusCfg.label}
                          </span>

                          {/* Impact assessment scale */}
                          <ImpactScale bars={impact.scaleBars} color={impact.text} label={impact.scaleLabel} />

                          {/* Category badge with icon */}
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {React.createElement(category.icon, { size: 10, style: { color: category.text } })}
                            {category.label}
                          </span>

                          {/* Expand chevron */}
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isExpanded ? 'rgba(255,255,255,0.06)' : 'transparent',
                            transition: 'all 0.25s ease',
                          }}>
                            <div style={{
                              transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              display: 'flex',
                            }}>
                              <ChevronDown size={16} style={{ color: isExpanded ? '#f0ebe4' : '#6b6358' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Title + subtitle row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h3
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#f0ebe4',
                            margin: 0,
                            flex: 1,
                            lineHeight: 1.4,
                          }}
                        >
                          {decision.title}
                        </h3>
                        {/* Mini vote indicator */}
                        {votes && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <div style={{
                              width: 40,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              overflow: 'hidden',
                              display: 'flex',
                            }}>
                              <div style={{ width: `${(votes.for / totalVotes) * 100}%`, height: '100%', backgroundColor: '#6b8f71' }} />
                              <div style={{ width: `${(votes.against / totalVotes) * 100}%`, height: '100%', backgroundColor: '#e06060' }} />
                              <div style={{ width: `${(votes.abstain / totalVotes) * 100}%`, height: '100%', backgroundColor: '#6b6358' }} />
                            </div>
                            <span style={{ fontSize: 10, color: '#6b6358' }}>{votes.for}/{totalVotes}</span>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Expandable details with vote breakdown */}
                    <div
                      style={{
                        maxHeight: isExpanded ? 1200 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.55s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease',
                        opacity: isExpanded ? 1 : 0,
                      }}
                    >
                      <div
                        style={{
                          padding: '0 24px 22px 28px',
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {/* Decision flow for this card */}
                        <div style={{ margin: '16px 0', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <TrendingUp size={12} />
                            Decision Stage
                          </div>
                          <DecisionFlowDiagram activeStage={flowStage} />
                        </div>

                        {/* Description */}
                        <p
                          style={{
                            fontSize: 13,
                            color: '#a09888',
                            lineHeight: 1.7,
                            margin: '16px 0 18px 0',
                          }}
                        >
                          {decision.description}
                        </p>

                        {/* Rationale / Reasoning Section */}
                        {rationale && (
                          <div
                            style={{
                              backgroundColor: 'rgba(139, 92, 246, 0.04)',
                              borderRadius: 12,
                              border: '1px solid rgba(139, 92, 246, 0.12)',
                              padding: '16px 18px',
                              marginBottom: 14,
                              animation: isExpanded ? 'rationaleReveal 0.5s ease 0.2s both' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                              <FileText size={12} style={{ color: '#a78bfa' }} />
                              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a78bfa' }}>
                                Rationale & Reasoning
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.7, margin: '0 0 12px 0' }}>
                              {rationale.rationale}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {rationale.keyFactors.map((factor, fIdx) => (
                                <span
                                  key={fIdx}
                                  style={{
                                    fontSize: 10,
                                    color: '#a78bfa',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.15)',
                                    borderRadius: 12,
                                    padding: '3px 10px',
                                    fontWeight: 500,
                                    animation: isExpanded ? `rationaleReveal 0.4s ease ${0.3 + fIdx * 0.08}s both` : 'none',
                                  }}
                                >
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vote Breakdown Visualization */}
                        {votes && (
                          <div
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              borderRadius: 12,
                              padding: '16px 18px',
                              border: '1px solid rgba(255,255,255,0.04)',
                              marginBottom: 14,
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 14,
                            }}>
                              <div style={{
                                fontSize: 10,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#6b6358',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                              }}>
                                <Users size={12} />
                                Vote Breakdown
                              </div>

                              {/* Quorum Ring */}
                              <QuorumRing
                                total={totalVotes}
                                required={votes.quorumRequired}
                                met={totalVotes >= votes.quorumRequired}
                              />
                            </div>

                            {/* Animated visual vote bar */}
                            <div style={{ marginBottom: 14 }}>
                              <AnimatedVoteBar
                                forPct={(votes.for / totalVotes) * 100}
                                againstPct={(votes.against / totalVotes) * 100}
                                abstainPct={(votes.abstain / totalVotes) * 100}
                                isVisible={isExpanded}
                              />
                            </div>

                            {/* Vote counts */}
                            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                              {[
                                { label: 'For', count: votes.for, color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.1)' },
                                { label: 'Against', count: votes.against, color: '#e06060', bg: 'rgba(224, 96, 96, 0.1)' },
                                { label: 'Abstain', count: votes.abstain, color: '#6b6358', bg: 'rgba(107, 99, 88, 0.1)' },
                              ].map((v) => (
                                <div key={v.label} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  backgroundColor: v.bg,
                                  borderRadius: 8,
                                  padding: '4px 10px',
                                }}>
                                  <div style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: v.color,
                                    boxShadow: `0 0 4px ${v.color}40`,
                                  }} />
                                  <span style={{ fontSize: 12, fontWeight: 600, color: v.color }}>{v.count}</span>
                                  <span style={{ fontSize: 11, color: '#a09888' }}>{v.label}</span>
                                </div>
                              ))}
                            </div>

                            {/* Individual voter list -- sorted by timestamp */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {[...votes.voters]
                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                .map((voter, vIdx) => {
                                const voteColor = voter.vote === 'for' ? '#6b8f71' : voter.vote === 'against' ? '#e06060' : '#6b6358';
                                const vColor = getAvatarColor(voter.name);
                                const voteTime = new Date(voter.timestamp);
                                return (
                                  <div
                                    key={vIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      backgroundColor: 'rgba(255,255,255,0.02)',
                                      border: `1px solid ${voteColor}20`,
                                      borderRadius: 10,
                                      padding: '6px 12px 6px 6px',
                                      animation: isExpanded ? `rationaleReveal 0.4s ease ${0.15 + vIdx * 0.06}s both` : 'none',
                                    }}
                                  >
                                    <div style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      backgroundColor: vColor,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 9,
                                      fontWeight: 700,
                                      color: '#0b0d14',
                                      flexShrink: 0,
                                    }}>
                                      {voter.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: 12, color: '#f0ebe4', fontWeight: 500, flex: 1 }}>{voter.name}</span>
                                    {/* Vote timestamp */}
                                    <span style={{ fontSize: 10, color: '#6b6358', fontVariantNumeric: 'tabular-nums' }}>
                                      {voteTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </span>
                                    {/* Vote indicator */}
                                    <span style={{
                                      fontSize: 9,
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      color: voteColor,
                                      backgroundColor: `${voteColor}15`,
                                      borderRadius: 8,
                                      padding: '2px 8px',
                                    }}>
                                      {voter.vote}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Decided by section with avatar initials */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#0b0d14',
                              letterSpacing: '0.02em',
                              flexShrink: 0,
                              boxShadow: `0 0 12px ${avatarColor}30`,
                              border: '2px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            {initials}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 10,
                                color: '#6b6358',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                fontWeight: 600,
                                marginBottom: 2,
                              }}
                            >
                              Decision Authority
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: '#f0ebe4',
                                fontWeight: 500,
                              }}
                            >
                              {decision.decidedBy}
                            </div>
                          </div>
                          {/* Decision date compact */}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 }}>
                              Date
                            </div>
                            <div style={{ fontSize: 12, color: '#a09888', fontVariantNumeric: 'tabular-nums' }}>
                              {decisionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        </div>

        {/* Empty state: no decisions at all */}
        {governanceDecisions.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: '#6b6358',
            }}
          >
            <ScrollText size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, margin: 0 }}>
              No decisions have been logged yet.
            </p>
          </div>
        )}

        {/* Empty filter state */}
        {governanceDecisions.length > 0 && filteredDecisions.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: '#6b6358',
            }}
          >
            <Filter size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, margin: 0 }}>
              No decisions in this category yet.
            </p>
          </div>
        )}
      </section>

      {/* Log Decision Modal */}
      <LogDecisionModal
        open={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSubmit={(decision) => {
          createGovernanceDecision(decision);
        }}
      />

      {/* AI Advisor -- Governance Context */}
      <div style={{ marginTop: 32 }}>
        <InlineAdvisor
          title="Governance Advisor"
          titleIcon="sparkles"
          compact={true}
          defaultCollapsed={true}
          storageKeySuffix="governance"
          suggestedPrompts={[
            'Help me think through a governance decision',
            'What does the Coherence Accountability Policy say about this?',
            'Which Tenet of Council applies here?',
            'Who has decision authority for this?',
          ]}
        />
      </div>
    </div>
  );
}
