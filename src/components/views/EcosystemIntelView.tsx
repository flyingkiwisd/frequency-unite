'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe,
  Handshake,
  Rocket,
  DollarSign,
  UserCog,
  ArrowRightLeft,
  Filter,
  ExternalLink,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Building2,
  Leaf,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Link2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ─── Types ─── */

type SignalCategory =
  | 'Partnership Opportunity'
  | 'Program Launch'
  | 'Funding Round'
  | 'Leadership Change'
  | 'Strategic Shift';

type ImpactLevel = 'Low' | 'Medium' | 'High';
type TrendDirection = 'up' | 'down' | 'stable';

interface EcosystemOrg {
  id: string;
  name: string;
  focus: string;
  alignment: string;
  icon: React.ElementType;
  color: string;
  trend: TrendDirection;
  relevanceScore: number;
}

interface RelatedEntity {
  name: string;
  role: string;
  color: string;
}

interface IntelSignal {
  id: string;
  orgId: string;
  date: string;
  category: SignalCategory;
  title: string;
  summary: string;
  impact: ImpactLevel;
  frequencyImplication: string;
  source: string;
  relatedEntities: RelatedEntity[];
}

/* ─── Animated Entry ─── */

function AnimatedEntry({ children, delay = 0, style }: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.45s ease-out, transform 0.45s ease-out',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── SVG Mini Sparkline Chart ─── */

function MiniSparkline({ data, color, width = 60, height = 24 }: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;
  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * effectiveWidth;
    const y = padding + effectiveHeight - ((v - min) / range) * effectiveHeight;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = points + ` ${padding + effectiveWidth},${padding + effectiveHeight} ${padding},${padding + effectiveHeight}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#sparkGrad-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length > 0 && (() => {
        const lastX = padding + effectiveWidth;
        const lastY = padding + effectiveHeight - ((data[data.length - 1] - min) / range) * effectiveHeight;
        return (
          <circle cx={lastX} cy={lastY} r="2" fill={color} />
        );
      })()}
    </svg>
  );
}

/* ─── SVG Ecosystem Metrics Donut ─── */

function MetricsDonut({ segments, size = 80 }: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const currentOffset = offset;
        offset += dash;
        return (
          <circle
            key={seg.label}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity={0.8}
          >
            <title>{`${seg.label}: ${seg.value}`}</title>
          </circle>
        );
      })}
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 12, fill: '#f0ebe4', fontWeight: 700 }}>
        {total}
      </text>
      <text x={size / 2} y={size / 2 + 12} textAnchor="middle"
        style={{ fontSize: 7, fill: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        signals
      </text>
    </svg>
  );
}

/* ─── Trend Arrow Component ─── */

function TrendArrow({ direction, color }: { direction: TrendDirection; color: string }) {
  if (direction === 'up') {
    return <ArrowUpRight size={12} style={{ color }} />;
  }
  if (direction === 'down') {
    return <ArrowDownRight size={12} style={{ color: '#e06060' }} />;
  }
  return <Minus size={12} style={{ color: '#6b6358' }} />;
}

/* ─── Priority Indicator ─── */

function PriorityIndicator({ impact }: { impact: ImpactLevel }) {
  const levels = impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1;
  const color = impact === 'High' ? '#e06060' : impact === 'Medium' ? '#e8b44c' : '#a09888';

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: 4 + i * 3,
            borderRadius: 1,
            backgroundColor: i <= levels ? color : '#1e2638',
            transition: 'background-color 0.3s',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Ecosystem Organizations ─── */

const ecosystemOrgs: EcosystemOrg[] = [
  {
    id: 'regenesis',
    name: 'Regenesis Group',
    focus: 'Regenerative development',
    alignment: 'Potential bioregion partner',
    icon: Leaf,
    color: '#6b8f71',
    trend: 'up',
    relevanceScore: 92,
  },
  {
    id: 'bfi',
    name: 'Buckminster Fuller Institute',
    focus: 'Systems thinking',
    alignment: 'Thesis alignment',
    icon: Globe,
    color: '#8b5cf6',
    trend: 'up',
    relevanceScore: 78,
  },
  {
    id: 'presencing',
    name: 'Presencing Institute (Otto Scharmer)',
    focus: 'Theory U',
    alignment: 'Coherence practices',
    icon: BookOpen,
    color: '#60a5fa',
    trend: 'up',
    relevanceScore: 85,
  },
  {
    id: 'blab',
    name: 'B Lab / B Corp Movement',
    focus: 'Conscious capitalism',
    alignment: 'Philosophical alignment',
    icon: Building2,
    color: '#d4a574',
    trend: 'stable',
    relevanceScore: 65,
  },
  {
    id: 'patagonia',
    name: 'Patagonia / 1% for the Planet',
    focus: 'Environmental stewardship',
    alignment: 'Stewardship model',
    icon: Leaf,
    color: '#34d399',
    trend: 'stable',
    relevanceScore: 60,
  },
  {
    id: 'conscious-cap',
    name: 'Conscious Capitalism',
    focus: 'Stakeholder capitalism',
    alignment: 'Philosophical alignment',
    icon: TrendingUp,
    color: '#fb923c',
    trend: 'up',
    relevanceScore: 82,
  },
];

/* ─── Intelligence Signals ─── */

const intelSignals: IntelSignal[] = [
  {
    id: 'sig-1',
    orgId: 'regenesis',
    date: '2026-03-05',
    category: 'Partnership Opportunity',
    title: 'Regenesis Launches Bioregion Practitioner Network',
    summary: 'Regenesis Group announced a global network for bioregional practitioners, opening membership to aligned organizations working on place-based regeneration.',
    impact: 'High',
    frequencyImplication: 'Direct opportunity to integrate Gareth\'s Bioregions Node with Regenesis methodology. Could accelerate the Nicoya pilot with their proven frameworks and provide credibility for future bioregion sites.',
    source: 'regenesisgroup.com',
    relatedEntities: [
      { name: 'Gareth Hermann', role: 'Bioregions Lead', color: '#84cc16' },
      { name: 'Bioregions Node', role: 'Node', color: '#34d399' },
    ],
  },
  {
    id: 'sig-2',
    orgId: 'bfi',
    date: '2026-03-01',
    category: 'Program Launch',
    title: 'BFI Design Science Studio 2026 Applications Open',
    summary: 'The Buckminster Fuller Institute opened applications for their annual Design Science Studio, a 6-week intensive for systems-level innovation projects.',
    impact: 'Medium',
    frequencyImplication: 'Fairman\'s Thesis of Change and Map Node could be strong applicants. BFI endorsement would validate our systems approach and open doors to their alumni network of 2,000+ systems thinkers.',
    source: 'bfi.org',
    relatedEntities: [
      { name: 'Alex James Fairman', role: 'Strategic Architect', color: '#8b5cf6' },
      { name: 'Map Node', role: 'Node', color: '#8b5cf6' },
      { name: 'Thesis of Change', role: 'Node', color: '#a855f7' },
    ],
  },
  {
    id: 'sig-3',
    orgId: 'presencing',
    date: '2026-02-28',
    category: 'Strategic Shift',
    title: 'Presencing Institute Pivots Toward Collective Action',
    summary: 'Otto Scharmer announced a strategic pivot from individual awareness to collective action platforms, launching a new initiative for organizational transformation at scale.',
    impact: 'High',
    frequencyImplication: 'Strong alignment with our coherence-to-action bridge. Andrew and Felicia could explore integrating Theory U practices into our pod facilitation model. Their new collective action focus mirrors our two-hemisphere approach.',
    source: 'presencing.org',
    relatedEntities: [
      { name: 'Andrew', role: 'Coherence Lead', color: '#a855f7' },
      { name: 'Felicia Isabella', role: 'Culture', color: '#f472b6' },
      { name: 'Dave Weale', role: 'Pods & Culture', color: '#34d399' },
    ],
  },
  {
    id: 'sig-4',
    orgId: 'blab',
    date: '2026-02-25',
    category: 'Strategic Shift',
    title: 'B Lab Introduces Impact Measurement 3.0 Framework',
    summary: 'B Lab released a new impact measurement framework moving beyond traditional ESG metrics toward systems-level impact assessment, incorporating regenerative indicators.',
    impact: 'Medium',
    frequencyImplication: 'Could inform our capital node\'s deal scoring rubric. Greg\'s evaluation criteria could incorporate B Lab\'s regenerative indicators, giving our investment thesis additional rigor and external credibility.',
    source: 'bcorporation.net',
    relatedEntities: [
      { name: 'Greg Berry', role: 'Capital Lead', color: '#22c55e' },
      { name: 'Capital Node', role: 'Node', color: '#d4a574' },
    ],
  },
  {
    id: 'sig-5',
    orgId: 'patagonia',
    date: '2026-02-20',
    category: 'Funding Round',
    title: '1% for the Planet Surpasses $500M in Total Giving',
    summary: '1% for the Planet announced crossing the $500M milestone in total giving. They are actively seeking new philanthropic models beyond traditional corporate giving.',
    impact: 'Medium',
    frequencyImplication: 'Our DAF model could be presented as an innovative alternative to traditional 1% giving. Colleen could explore whether Frequency members could channel their 1% commitments through our DAF structure.',
    source: 'onepercentfortheplanet.org',
    relatedEntities: [
      { name: 'Colleen Galbraith', role: 'DAF Steward', color: '#d4a574' },
      { name: 'James Hodges', role: 'Founder', color: '#d4a574' },
    ],
  },
  {
    id: 'sig-6',
    orgId: 'conscious-cap',
    date: '2026-02-18',
    category: 'Leadership Change',
    title: 'Conscious Capitalism Appoints New CEO with Impact Investing Background',
    summary: 'Conscious Capitalism named a new CEO with deep roots in impact investing and regenerative finance, signaling a shift from philosophy toward practical capital deployment.',
    impact: 'High',
    frequencyImplication: 'This leadership shift creates a natural alignment opportunity. James should consider reaching out for a strategic conversation. Their pivot toward capital deployment mirrors our Capitalism 2.0 node vision.',
    source: 'consciouscapitalism.org',
    relatedEntities: [
      { name: 'James Hodges', role: 'Founder', color: '#d4a574' },
      { name: 'Capitalism 2.0 Node', role: 'Node', color: '#2dd4bf' },
    ],
  },
  {
    id: 'sig-7',
    orgId: 'regenesis',
    date: '2026-02-15',
    category: 'Program Launch',
    title: 'Regenesis Opens Costa Rica Regenerative Development Fellowship',
    summary: 'A new 12-month fellowship program focused on regenerative development in Costa Rica, specifically targeting the Nicoya Peninsula and Guanacaste regions.',
    impact: 'High',
    frequencyImplication: 'Directly relevant to our Nicoya pilot. Gareth should immediately explore partnership or co-sponsorship. This could provide on-the-ground expertise and local legitimacy for our bioregion initiative.',
    source: 'regenesisgroup.com',
    relatedEntities: [
      { name: 'Gareth Hermann', role: 'Bioregions Lead', color: '#84cc16' },
      { name: 'Bioregions Node', role: 'Node', color: '#34d399' },
      { name: 'Blue Spirit 6.0', role: 'Event', color: '#d4a574' },
    ],
  },
  {
    id: 'sig-8',
    orgId: 'bfi',
    date: '2026-02-10',
    category: 'Partnership Opportunity',
    title: 'BFI Seeking Partners for Global Systems Change Mapping Project',
    summary: 'The Buckminster Fuller Institute is building a collaborative systems change map and seeking partner organizations to contribute data, case studies, and technology.',
    impact: 'Medium',
    frequencyImplication: 'Our Map Node is a natural fit for this partnership. Fairman\'s ecosystem mapping work could contribute to and benefit from BFI\'s global dataset. This could position Frequency as a key node in the global systems change infrastructure.',
    source: 'bfi.org',
    relatedEntities: [
      { name: 'Alex James Fairman', role: 'Strategic Architect', color: '#8b5cf6' },
      { name: 'Map Node', role: 'Node', color: '#8b5cf6' },
    ],
  },
  {
    id: 'sig-9',
    orgId: 'presencing',
    date: '2026-02-05',
    category: 'Partnership Opportunity',
    title: 'Presencing Institute Launches Cohort-Based Learning for Communities',
    summary: 'New offering designed for established communities to deepen collective awareness practices. Seeking pilot communities for a facilitated 8-week program.',
    impact: 'Medium',
    frequencyImplication: 'Dave\'s pod facilitation work could integrate this program. Our steward community of 65+ would be an ideal pilot cohort, and the structured curriculum could accelerate our coherence practices.',
    source: 'presencing.org',
    relatedEntities: [
      { name: 'Dave Weale', role: 'Pods & Culture', color: '#34d399' },
      { name: 'Andrew', role: 'Coherence Lead', color: '#a855f7' },
    ],
  },
  {
    id: 'sig-10',
    orgId: 'blab',
    date: '2026-01-30',
    category: 'Funding Round',
    title: 'B Lab Raises $25M for Emerging Market Expansion',
    summary: 'B Lab secured $25M in funding to expand B Corp certification into emerging markets, with a focus on Latin America and Southeast Asia.',
    impact: 'Low',
    frequencyImplication: 'Peripheral relevance. Their Latin America expansion could eventually intersect with our bioregion work in Costa Rica, but no immediate action needed. Worth monitoring for future alignment.',
    source: 'bcorporation.net',
    relatedEntities: [
      { name: 'Bioregions Node', role: 'Node', color: '#34d399' },
    ],
  },
];

/* ─── Category config ─── */

const categoryConfig: Record<
  SignalCategory,
  { color: string; bg: string; icon: React.ElementType }
> = {
  'Partnership Opportunity': {
    color: '#6b8f71',
    bg: 'rgba(107, 143, 113, 0.12)',
    icon: Handshake,
  },
  'Program Launch': {
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    icon: Rocket,
  },
  'Funding Round': {
    color: '#d4a574',
    bg: 'rgba(212, 165, 116, 0.12)',
    icon: DollarSign,
  },
  'Leadership Change': {
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.12)',
    icon: UserCog,
  },
  'Strategic Shift': {
    color: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.12)',
    icon: ArrowRightLeft,
  },
};

/* ─── Impact config ─── */

const impactConfig: Record<
  ImpactLevel,
  { color: string; bg: string; border: string }
> = {
  High: {
    color: '#e06060',
    bg: 'rgba(224, 96, 96, 0.12)',
    border: 'rgba(224, 96, 96, 0.25)',
  },
  Medium: {
    color: '#e8b44c',
    bg: 'rgba(232, 180, 76, 0.12)',
    border: 'rgba(232, 180, 76, 0.25)',
  },
  Low: {
    color: '#a09888',
    bg: 'rgba(160, 152, 136, 0.12)',
    border: 'rgba(160, 152, 136, 0.2)',
  },
};

/* ─── Sparkline data per org (simulated activity trends) ─── */

const orgSparklines: Record<string, number[]> = {
  'regenesis': [2, 3, 4, 3, 5, 6, 8],
  'bfi': [3, 2, 4, 5, 4, 5, 6],
  'presencing': [1, 3, 2, 4, 5, 6, 7],
  'blab': [4, 3, 3, 4, 3, 4, 4],
  'patagonia': [2, 2, 3, 3, 2, 3, 3],
  'conscious-cap': [1, 2, 3, 4, 5, 6, 7],
};

/* ─── Component ─── */

export function EcosystemIntelView() {
  const [categoryFilter, setCategoryFilter] = useState<SignalCategory | 'all'>('all');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  const filteredSignals = useMemo(() => {
    const sorted = [...intelSignals].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (categoryFilter === 'all') return sorted;
    return sorted.filter((s) => s.category === categoryFilter);
  }, [categoryFilter]);

  // Stats
  const highImpactCount = intelSignals.filter((s) => s.impact === 'High').length;
  const partnershipCount = intelSignals.filter(
    (s) => s.category === 'Partnership Opportunity'
  ).length;
  const orgCount = ecosystemOrgs.length;

  // Category counts for donut
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    intelSignals.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div style={{ padding: '24px 32px', height: '100%', overflow: 'auto', backgroundColor: '#0b0d14' }}>
      {/* ── Header ── */}
      <AnimatedEntry delay={0}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(212, 165, 116, 0.1)',
              border: '1px solid rgba(212, 165, 116, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Globe size={20} style={{ color: '#d4a574' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0ebe4', margin: 0, letterSpacing: '-0.01em' }}>
                Ecosystem Intel
              </h1>
              <p style={{ fontSize: 13, color: '#6b6358', margin: 0 }}>
                Intelligence on aligned organizations and movements
              </p>
            </div>
          </div>
        </div>
      </AnimatedEntry>

      {/* ── Summary Stats + Donut ── */}
      <AnimatedEntry delay={50}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr)) auto',
          gap: 12,
          marginBottom: 24,
          alignItems: 'stretch',
        }}>
          {[
            {
              label: 'Tracked Orgs',
              value: orgCount.toString(),
              icon: Building2,
              color: '#8b5cf6',
              bg: 'rgba(139, 92, 246, 0.08)',
            },
            {
              label: 'Total Signals',
              value: intelSignals.length.toString(),
              icon: AlertCircle,
              color: '#d4a574',
              bg: 'rgba(212, 165, 116, 0.08)',
            },
            {
              label: 'High Impact',
              value: highImpactCount.toString(),
              icon: Zap,
              color: '#e06060',
              bg: 'rgba(224, 96, 96, 0.08)',
            },
            {
              label: 'Partnerships',
              value: partnershipCount.toString(),
              icon: Handshake,
              color: '#6b8f71',
              bg: 'rgba(107, 143, 113, 0.08)',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{
                  backgroundColor: '#0f1219',
                  border: '1px solid #1e2638',
                  borderRadius: 12,
                  padding: '14px 18px',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${stat.color}40`;
                  e.currentTarget.style.boxShadow = `0 0 12px ${stat.color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e2638';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: stat.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={12} style={{ color: stat.color }} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: '#6b6358',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {stat.label}
                  </span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            );
          })}

          {/* Donut chart */}
          <div
            style={{
              backgroundColor: '#0f1219',
              border: '1px solid #1e2638',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 110,
            }}
          >
            <div style={{ fontSize: 10, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              By Category
            </div>
            <MetricsDonut
              size={72}
              segments={Object.entries(categoryCounts).map(([cat, count]) => ({
                label: cat,
                value: count,
                color: categoryConfig[cat as SignalCategory]?.color || '#a09888',
              }))}
            />
          </div>
        </div>
      </AnimatedEntry>

      {/* ── Tracked Organizations with trends ── */}
      <AnimatedEntry delay={100}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Building2 size={14} style={{ color: '#6b6358' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Aligned Organizations
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 10,
          }}>
            {ecosystemOrgs.map((org, i) => {
              const Icon = org.icon;
              const signalCount = intelSignals.filter(
                (s) => s.orgId === org.id
              ).length;
              const sparkData = orgSparklines[org.id] || [1, 2, 3, 2, 3];
              return (
                <AnimatedEntry key={org.id} delay={120 + i * 40}>
                  <div
                    style={{
                      backgroundColor: '#0f1219',
                      border: `1px solid ${org.color}18`,
                      borderRadius: 12,
                      padding: '14px 16px',
                      transition: 'all 0.2s',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${org.color}40`;
                      e.currentTarget.style.boxShadow = `0 4px 16px ${org.color}10`;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${org.color}18`;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: `${org.color}12`,
                          border: `1px solid ${org.color}25`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} style={{ color: org.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <h3 style={{
                            fontSize: 12, fontWeight: 600, color: '#f0ebe4', margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {org.name}
                          </h3>
                          <TrendArrow direction={org.trend} color={org.color} />
                        </div>
                        <p style={{ fontSize: 10, color: '#6b6358', margin: 0, marginBottom: 6 }}>
                          {org.focus}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 10,
                              background: `${org.color}12`, color: org.color,
                            }}>
                              {org.alignment}
                            </span>
                            {signalCount > 0 && (
                              <span style={{
                                fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 10,
                                background: 'rgba(212,165,116,0.12)', color: '#d4a574',
                              }}>
                                {signalCount}
                              </span>
                            )}
                          </div>
                          <MiniSparkline data={sparkData} color={org.color} width={48} height={18} />
                        </div>
                      </div>
                    </div>
                    {/* Relevance score bar */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 9, color: '#4a443e' }}>Relevance</span>
                        <span style={{ fontSize: 9, color: org.color, fontWeight: 600 }}>{org.relevanceScore}%</span>
                      </div>
                      <div style={{
                        height: 3, borderRadius: 2, background: '#1e2638', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${org.relevanceScore}%`, height: '100%',
                          background: org.color, borderRadius: 2,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  </div>
                </AnimatedEntry>
              );
            })}
          </div>
        </div>
      </AnimatedEntry>

      {/* ── Category Filter ── */}
      <AnimatedEntry delay={350}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <Filter size={14} style={{ color: '#6b6358' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Filter
          </span>
          <button
            onClick={() => setCategoryFilter('all')}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
              backgroundColor: categoryFilter === 'all' ? 'rgba(212, 165, 116, 0.15)' : '#0f1219',
              color: categoryFilter === 'all' ? '#d4a574' : '#6b6358',
              border: `1px solid ${categoryFilter === 'all' ? 'rgba(212, 165, 116, 0.3)' : '#1e2638'}`,
            }}
          >
            All ({intelSignals.length})
          </button>
          {(Object.keys(categoryConfig) as SignalCategory[]).map((cat) => {
            const cfg = categoryConfig[cat];
            const count = intelSignals.filter((s) => s.category === cat).length;
            if (count === 0) return null;
            const CatIcon = cfg.icon;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5,
                  backgroundColor: categoryFilter === cat ? cfg.bg : '#0f1219',
                  color: categoryFilter === cat ? cfg.color : '#6b6358',
                  border: `1px solid ${categoryFilter === cat ? `${cfg.color}40` : '#1e2638'}`,
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== cat) {
                    e.currentTarget.style.borderColor = '#2e3a4e';
                    e.currentTarget.style.color = '#a09888';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== cat) {
                    e.currentTarget.style.borderColor = '#1e2638';
                    e.currentTarget.style.color = '#6b6358';
                  }
                }}
              >
                <CatIcon size={11} />
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </AnimatedEntry>

      {/* ── Intelligence Signals ── */}
      <div>
        {filteredSignals.map((signal, i) => {
          const org = ecosystemOrgs.find((o) => o.id === signal.orgId);
          const catCfg = categoryConfig[signal.category];
          const impCfg = impactConfig[signal.impact];
          const CatIcon = catCfg.icon;
          const isExpanded = expandedSignal === signal.id;

          return (
            <AnimatedEntry key={signal.id} delay={400 + i * 50}>
              <div
                style={{
                  backgroundColor: '#0f1219',
                  border: `1px solid ${isExpanded ? `${catCfg.color}40` : signal.impact === 'High' ? 'rgba(224, 96, 96, 0.2)' : '#1e2638'}`,
                  borderLeft: `3px solid ${impCfg.color}`,
                  borderRadius: 12,
                  marginBottom: 12,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
                onClick={() => setExpandedSignal(isExpanded ? null : signal.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${catCfg.color}40`;
                  e.currentTarget.style.borderLeftColor = impCfg.color;
                  e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.15)`;
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) {
                    e.currentTarget.style.borderColor = signal.impact === 'High' ? 'rgba(224, 96, 96, 0.2)' : '#1e2638';
                  }
                  e.currentTarget.style.borderLeftColor = impCfg.color;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ padding: '16px 20px' }}>
                  {/* Top row: date + badges + priority indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, color: '#6b6358', fontVariantNumeric: 'tabular-nums',
                        background: 'rgba(30,38,56,0.3)', padding: '2px 8px', borderRadius: 6,
                      }}>
                        {new Date(signal.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {org && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                          background: `${org.color}12`, color: org.color,
                        }}>
                          <org.icon size={9} />
                          {org.name}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Priority indicator bars */}
                      <PriorityIndicator impact={signal.impact} />
                      {/* Category badge */}
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                        background: catCfg.bg, color: catCfg.color,
                      }}>
                        <CatIcon size={10} />
                        {signal.category}
                      </span>
                      {/* Impact badge */}
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                        background: impCfg.bg, color: impCfg.color,
                        border: `1px solid ${impCfg.border}`,
                      }}>
                        {signal.impact}
                      </span>
                      {/* Expand/collapse */}
                      {isExpanded ? (
                        <ChevronDown size={14} style={{ color: '#6b6358' }} />
                      ) : (
                        <ChevronRight size={14} style={{ color: '#4a443e' }} />
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4', margin: '0 0 6px', lineHeight: 1.4 }}>
                    {signal.title}
                  </h3>

                  {/* Summary */}
                  <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.6, margin: '0 0 10px' }}>
                    {signal.summary}
                  </p>

                  {/* Frequency Implication (always visible for High impact) */}
                  {(isExpanded || signal.impact === 'High') && (
                    <div
                      style={{
                        borderRadius: 10, padding: '12px 14px', marginTop: 10,
                        background: 'rgba(212, 165, 116, 0.06)',
                        border: '1px solid rgba(212, 165, 116, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Lightbulb size={13} style={{ color: '#d4a574' }} />
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: '#d4a574',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          What This Means For Frequency
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.6, margin: 0 }}>
                        {signal.frequencyImplication}
                      </p>
                    </div>
                  )}

                  {/* Related Entities (visible when expanded) */}
                  {isExpanded && signal.relatedEntities.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <Link2 size={11} style={{ color: '#4a443e' }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Related Entities
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {signal.relatedEntities.map((entity, ei) => (
                          <div
                            key={ei}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '6px 12px', borderRadius: 8,
                              background: 'rgba(30, 38, 56, 0.2)',
                              border: '1px solid #1e2638',
                              transition: 'border-color 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${entity.color}40`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
                          >
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%',
                              background: `${entity.color}20`,
                              border: `1px solid ${entity.color}30`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 8, fontWeight: 700, color: entity.color,
                            }}>
                              {entity.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#f0ebe4', fontWeight: 500 }}>
                                {entity.name}
                              </div>
                              <div style={{ fontSize: 9, color: '#4a443e' }}>
                                {entity.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source + expand hint */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 12, paddingTop: 10,
                    borderTop: '1px solid #1e2638',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: 'rgba(30,38,56,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ExternalLink size={10} style={{ color: '#4a443e' }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#6b6358' }}>
                        {signal.source}
                      </span>
                    </div>
                    {!isExpanded && signal.impact !== 'High' && (
                      <span style={{ fontSize: 10, color: '#4a443e', fontStyle: 'italic' }}>
                        Click to expand analysis
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedEntry>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {filteredSignals.length === 0 && (
        <AnimatedEntry delay={400}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '48px 24px', borderRadius: 12,
            background: '#0f1219', border: '1px solid #1e2638',
          }}>
            <Globe size={32} style={{ color: '#4a443e', marginBottom: 12 }} />
            <span style={{ fontSize: 14, color: '#6b6358' }}>
              No signals found for this category.
            </span>
          </div>
        </AnimatedEntry>
      )}
    </div>
  );
}
