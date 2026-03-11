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
  ChevronUp,
  Filter,
  Plus,
  X,
} from 'lucide-react';
import { exportPdf, type GovernanceDecision } from '@/lib/data';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { InlineAdvisor } from '@/components/InlineAdvisor';

/* ── colour configs ── */

const impactConfig: Record<
  GovernanceDecision['impact'],
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  high: {
    label: 'High Impact',
    bg: 'rgba(212, 165, 116, 0.15)',
    text: '#d4a574',
    border: '1px solid rgba(212, 165, 116, 0.3)',
    dot: '#d4a574',
  },
  medium: {
    label: 'Medium',
    bg: 'rgba(139, 92, 246, 0.12)',
    text: '#a78bfa',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    dot: '#8b5cf6',
  },
  low: {
    label: 'Low',
    bg: 'rgba(107, 143, 113, 0.12)',
    text: '#6b8f71',
    border: '1px solid rgba(107, 143, 113, 0.25)',
    dot: '#6b8f71',
  },
};

const categoryConfig: Record<
  GovernanceDecision['category'],
  { label: string; bg: string; text: string }
> = {
  governance: { label: 'Governance', bg: 'rgba(139, 92, 246, 0.12)', text: '#a78bfa' },
  financial: { label: 'Financial', bg: 'rgba(212, 165, 116, 0.12)', text: '#d4a574' },
  membership: { label: 'Membership', bg: 'rgba(107, 143, 113, 0.12)', text: '#6b8f71' },
  strategy: { label: 'Strategy', bg: 'rgba(96, 165, 250, 0.12)', text: '#60a5fa' },
  node: { label: 'Node', bg: 'rgba(251, 146, 60, 0.12)', text: '#fb923c' },
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

/* ── Animated card wrapper ── */
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
    const timer = setTimeout(() => setVisible(true), 60 * index);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Log Decision Modal ── */
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
    transition: 'border-color 0.2s',
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
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'modalFadeIn 0.2s ease',
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 520,
          maxWidth: 'min(calc(100vw - 48px), 90vw)',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          backgroundColor: '#131720',
          border: '1px solid rgba(212, 165, 116, 0.12)',
          borderRadius: 18,
          padding: 0,
          zIndex: 9999,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 165, 116, 0.05)',
          animation: 'modalSlideIn 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(212, 165, 116, 0.12)',
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
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f0ebe4';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b6358';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Decision title..."
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.12)'; }}
            />
          </div>

          {/* Description */}
          <div>
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
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.12)'; }}
            />
          </div>

          {/* Decided By */}
          <div>
            <label style={labelStyle}>Decided By</label>
            <input
              type="text"
              value={decidedBy}
              onChange={(e) => setDecidedBy(e.target.value)}
              placeholder="Who made this decision..."
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.12)'; }}
            />
          </div>

          {/* Impact + Category row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
            }}
          >
            <Plus size={14} />
            {submitting ? 'Logging...' : 'Log Decision'}
          </button>
        </div>
      </div>

      {/* Modal animations */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translate(-50%, -48%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
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

  return (
    <div ref={containerRef} style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 1000, margin: '0 auto' }}>
      {/* keyframes */}
      <style>{`
        @keyframes govPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,165,116,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(212,165,116,0); }
        }
        @keyframes timelineFadeIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
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
                transition: 'background-color 0.15s, border-color 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
              }}
            >
              <Plus size={14} />
              Log Decision
            </button>
            <button
              onClick={() => {
                if (containerRef.current) exportPdf(containerRef.current, 'Governance');
              }}
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
            style={{
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 14,
              padding: '16px 22px',
              minWidth: 130,
              flex: '0 0 auto',
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4', lineHeight: 1 }}>
              {totalDecisions}
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Decisions
            </div>
          </div>

          {/* High impact */}
          <div
            style={{
              backgroundColor: '#131720',
              border: '1px solid rgba(212, 165, 116, 0.2)',
              borderRadius: 14,
              padding: '16px 22px',
              minWidth: 120,
              flex: '0 0 auto',
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: '#d4a574', lineHeight: 1 }}>
              {highImpactCount}
            </div>
            <div style={{ fontSize: 11, color: '#6b6358', marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              High Impact
            </div>
          </div>

          {/* Category breakdown */}
          <div
            style={{
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 14,
              padding: '14px 22px',
              flex: 1,
              minWidth: 240,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            {categoryCounts.map((c) => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: c.color,
                    flexShrink: 0,
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
              <AnimatedCard key={idx} index={idx + 1}>
                <div
                  style={{
                    backgroundColor: '#131720',
                    border: '1px solid #1e2638',
                    borderRadius: 14,
                    padding: 22,
                    transition: 'border-color 0.2s, transform 0.2s',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${p.color}40`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e2638';
                    e.currentTarget.style.transform = 'translateY(0)';
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
              </AnimatedCard>
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
                      transition: 'border-color 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${tier.color}50`;
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${tier.color}25`;
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
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

      {/* ── Board of Stewards (9-Seat Structure) ── */}
      <section style={{ marginBottom: 48 }}>
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
                    backgroundColor: '#131720',
                    border: '1px solid #1e2638',
                    borderLeft: `3px solid ${s.color}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    position: 'relative',
                    opacity: isFilled ? 1 : 0.7,
                    transition: 'border-color 0.2s, transform 0.2s, opacity 0.2s, box-shadow 0.2s',
                    boxShadow: isFilled ? `0 0 16px ${s.color}15` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${s.color}50`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e2638';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.opacity = isFilled ? '1' : '0.7';
                  }}
                >
                  {/* Seat number */}
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

                  {/* Seat name */}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#f0ebe4',
                      margin: '6px 0 8px',
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
                    {s.holder}
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </section>

      {/* ── Coherence Accountability Policy ── */}
      <section style={{ marginBottom: 48 }}>
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
                    backgroundColor: '#131720',
                    border: '1px solid #1e2638',
                    borderRadius: 14,
                    padding: '22px 20px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${s.color}50`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e2638';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
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
            borderBottom: '1px solid #1e2638',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {implementationTracker.map((item, idx) => {
            const cfg = statusConfig[item.status];
            const StatusIcon = cfg.icon;
            return (
              <AnimatedCard key={idx} index={idx + 10}>
                <div
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${cfg.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e2638';
                  }}
                >
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
                    <StatusIcon size={12} style={{ color: cfg.color }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                          transition: 'width 0.6s ease',
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
              </AnimatedCard>
            );
          })}
        </div>
      </section>

      {/* ── Decision Log — Timeline Layout ── */}
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
                  border: isActive ? `1px solid ${color}60` : '1px solid #1e2638',
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
              backgroundColor: '#1e2638',
              borderRadius: 1,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredDecisions.map((decision, idx) => {
              const impact = impactConfig[decision.impact];
              const category = categoryConfig[decision.category];
              const isExpanded = expandedId === decision.id;
              const initials = getAvatarInitials(decision.decidedBy);
              const avatarColor = getAvatarColor(decision.decidedBy);

              return (
                <AnimatedCard key={decision.id} index={idx + 16} style={{ position: 'relative' }}>
                  {/* Timeline dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -32 + 5,
                      top: 22,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: impact.dot,
                      border: '3px solid #0b0d14',
                      zIndex: 1,
                      boxShadow: `0 0 0 2px ${impact.dot}30`,
                    }}
                  />

                  {/* Card */}
                  <div
                    style={{
                      backgroundColor: '#131720',
                      border: `1px solid ${isExpanded ? impact.dot + '40' : '#1e2638'}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                      transition: 'border-color 0.25s, box-shadow 0.25s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded)
                        e.currentTarget.style.borderColor = '#2e3a4e';
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded)
                        e.currentTarget.style.borderColor = '#1e2638';
                    }}
                  >
                    {/* Clickable header area */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : decision.id)
                      }
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '18px 22px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: impact.dot,
                                display: 'inline-block',
                              }}
                            />
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

                          {/* Expand chevron */}
                          {isExpanded ? (
                            <ChevronUp size={16} style={{ color: '#6b6358' }} />
                          ) : (
                            <ChevronDown size={16} style={{ color: '#6b6358' }} />
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: '#f0ebe4',
                          margin: 0,
                        }}
                      >
                        {decision.title}
                      </h3>
                    </button>

                    {/* Expandable details */}
                    <div
                      style={{
                        maxHeight: isExpanded ? 300 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.35s ease, opacity 0.3s ease',
                        opacity: isExpanded ? 1 : 0,
                      }}
                    >
                      <div
                        style={{
                          padding: '0 22px 18px',
                          borderTop: '1px solid #1e263850',
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            color: '#a09888',
                            lineHeight: 1.6,
                            margin: '14px 0 16px 0',
                          }}
                        >
                          {decision.description}
                        </p>

                        {/* Decided by section with avatar initials */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 14px',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            borderRadius: 10,
                            border: '1px solid #1e263850',
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: avatarColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#0b0d14',
                              letterSpacing: '0.02em',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
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
                              Decided By
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

      {/* AI Advisor — Governance Context */}
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
