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
  Wifi,
  ChevronRight,
  MapPin,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
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

type IntelTab = 'all' | 'Partnership Opportunity' | 'Program Launch' | 'Funding Round' | 'Leadership Change' | 'Strategic Shift';

interface EcosystemOrg {
  id: string;
  name: string;
  initials: string;
  focus: string;
  alignment: string;
  icon: React.ElementType;
  color: string;
  location: { x: number; y: number; label: string };
  trendDirection: 'up' | 'down' | 'stable';
  opportunityScore: number; // 0-100
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
  signalStrength: number; // 1-5
}

/* ─── Ecosystem Organizations ─── */

const ecosystemOrgs: EcosystemOrg[] = [
  {
    id: 'regenesis',
    name: 'Regenesis Group',
    initials: 'RG',
    focus: 'Regenerative development',
    alignment: 'Potential bioregion partner',
    icon: Leaf,
    color: '#6b8f71',
    location: { x: 22, y: 42, label: 'Santa Fe, NM' },
    trendDirection: 'up',
    opportunityScore: 88,
  },
  {
    id: 'bfi',
    name: 'Buckminster Fuller Institute',
    initials: 'BFI',
    focus: 'Systems thinking',
    alignment: 'Thesis alignment',
    icon: Globe,
    color: '#8b5cf6',
    location: { x: 25, y: 38, label: 'New York, NY' },
    trendDirection: 'stable',
    opportunityScore: 72,
  },
  {
    id: 'presencing',
    name: 'Presencing Institute',
    initials: 'PI',
    focus: 'Theory U',
    alignment: 'Coherence practices',
    icon: BookOpen,
    color: '#60a5fa',
    location: { x: 27, y: 36, label: 'Cambridge, MA' },
    trendDirection: 'up',
    opportunityScore: 82,
  },
  {
    id: 'blab',
    name: 'B Lab / B Corp',
    initials: 'BL',
    focus: 'Conscious capitalism',
    alignment: 'Philosophical alignment',
    icon: Building2,
    color: '#d4a574',
    location: { x: 24, y: 39, label: 'Wayne, PA' },
    trendDirection: 'stable',
    opportunityScore: 65,
  },
  {
    id: 'patagonia',
    name: 'Patagonia / 1% Planet',
    initials: 'PG',
    focus: 'Environmental stewardship',
    alignment: 'Stewardship model',
    icon: Leaf,
    color: '#34d399',
    location: { x: 18, y: 42, label: 'Ventura, CA' },
    trendDirection: 'up',
    opportunityScore: 58,
  },
  {
    id: 'conscious-cap',
    name: 'Conscious Capitalism',
    initials: 'CC',
    focus: 'Stakeholder capitalism',
    alignment: 'Philosophical alignment',
    icon: TrendingUp,
    color: '#fb923c',
    location: { x: 20, y: 40, label: 'Austin, TX' },
    trendDirection: 'up',
    opportunityScore: 78,
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
    signalStrength: 5,
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
    signalStrength: 3,
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
    signalStrength: 5,
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
    signalStrength: 3,
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
    signalStrength: 3,
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
    signalStrength: 4,
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
    signalStrength: 5,
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
    signalStrength: 4,
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
    signalStrength: 3,
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
    signalStrength: 2,
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

/* ─── Animated Card Entrance ─── */

function AnimatedCard({ children, delay = 0, style, className }: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Signal Strength Indicator ─── */

function SignalStrengthBar({ strength, color }: { strength: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {[1, 2, 3, 4, 5].map((level) => (
        <div key={level} style={{
          width: 3,
          height: 4 + level * 2.4,
          borderRadius: 1.5,
          backgroundColor: level <= strength ? color : '#1e2638',
          transition: 'background-color 0.3s',
          opacity: level <= strength ? 1 : 0.4,
        }} />
      ))}
    </div>
  );
}

/* ─── Opportunity Score Bar ─── */

function OpportunityScoreBar({ score, color }: { score: number; color: string }) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimatedWidth(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <div style={{
        flex: 1, height: 6, borderRadius: 3,
        background: '#1e2638', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          width: `${animatedWidth}%`, height: '100%', borderRadius: 3,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          transition: 'width 0.8s ease-out',
          position: 'relative',
        }}>
          {/* Glow effect at the tip */}
          <div style={{
            position: 'absolute', right: 0, top: -2, width: 10, height: 10,
            borderRadius: '50%', background: color,
            opacity: 0.3, filter: 'blur(4px)',
          }} />
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28, textAlign: 'right' }}>
        {score}
      </span>
    </div>
  );
}

/* ─── Trend Arrow ─── */

function TrendArrow({ direction, color }: { direction: 'up' | 'down' | 'stable'; color: string }) {
  if (direction === 'up') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3, color: '#6b8f71',
        fontSize: 10, fontWeight: 600,
      }}>
        <ArrowUpRight size={12} />
        <span>Rising</span>
      </div>
    );
  }
  if (direction === 'down') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3, color: '#e06060',
        fontSize: 10, fontWeight: 600,
      }}>
        <ArrowDownRight size={12} />
        <span>Declining</span>
      </div>
    );
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 3, color: '#a09888',
      fontSize: 10, fontWeight: 600,
    }}>
      <Minus size={12} />
      <span>Stable</span>
    </div>
  );
}

/* ─── World Map SVG (simplified) ─── */

function WorldMapPlaceholder({ orgs }: { orgs: EcosystemOrg[] }) {
  const [hoveredOrg, setHoveredOrg] = useState<string | null>(null);

  return (
    <div style={{
      position: 'relative', width: '100%', height: 220,
      background: '#0f1219', borderRadius: 12, border: '1px solid #1e2638',
      overflow: 'hidden',
    }}>
      {/* Grid pattern overlay */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2e3a4e" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Simplified world map paths */}
      <svg viewBox="0 0 100 50" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{
        position: 'absolute', top: 0, left: 0,
      }}>
        {/* Continents - simplified outlines */}
        {/* North America */}
        <path d="M8,8 Q12,5 18,7 Q22,6 25,8 Q27,10 28,14 Q27,16 25,18 Q22,20 20,22 Q18,24 16,22 Q14,20 12,18 Q10,16 8,14 Q7,12 8,8 Z"
          fill="rgba(212,165,116,0.06)" stroke="rgba(212,165,116,0.15)" strokeWidth="0.3" />
        {/* Central/South America */}
        <path d="M20,22 Q22,24 24,26 Q25,28 26,32 Q27,36 25,40 Q24,42 22,43 Q20,42 19,40 Q18,36 19,32 Q19,28 20,22 Z"
          fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.12)" strokeWidth="0.3" />
        {/* Europe */}
        <path d="M42,6 Q44,5 48,6 Q50,7 52,9 Q51,11 50,13 Q48,14 46,13 Q44,12 43,10 Q42,8 42,6 Z"
          fill="rgba(96,165,250,0.06)" stroke="rgba(96,165,250,0.12)" strokeWidth="0.3" />
        {/* Africa */}
        <path d="M44,14 Q48,14 50,16 Q52,18 54,22 Q55,26 54,32 Q52,36 50,38 Q48,40 46,38 Q44,36 43,32 Q42,28 42,24 Q42,20 43,16 Q43,15 44,14 Z"
          fill="rgba(107,143,113,0.06)" stroke="rgba(107,143,113,0.12)" strokeWidth="0.3" />
        {/* Asia */}
        <path d="M54,6 Q60,4 68,5 Q76,6 82,8 Q86,10 88,14 Q87,18 84,20 Q80,22 76,22 Q72,21 68,18 Q64,16 60,14 Q56,12 54,10 Q53,8 54,6 Z"
          fill="rgba(251,146,60,0.06)" stroke="rgba(251,146,60,0.12)" strokeWidth="0.3" />
        {/* Australia */}
        <path d="M76,30 Q80,28 84,29 Q86,30 87,33 Q86,36 84,37 Q80,38 78,36 Q76,34 76,30 Z"
          fill="rgba(232,180,76,0.06)" stroke="rgba(232,180,76,0.12)" strokeWidth="0.3" />

        {/* Connection lines between orgs */}
        {orgs.map((org, i) =>
          orgs.slice(i + 1).map((other) => (
            <line key={`${org.id}-${other.id}`}
              x1={org.location.x} y1={org.location.y}
              x2={other.location.x} y2={other.location.y}
              stroke="rgba(212,165,116,0.06)" strokeWidth="0.2"
              strokeDasharray="1,2"
            />
          ))
        )}

        {/* Organization location markers */}
        {orgs.map((org) => {
          const isHovered = hoveredOrg === org.id;
          return (
            <g key={org.id}
              onMouseEnter={() => setHoveredOrg(org.id)}
              onMouseLeave={() => setHoveredOrg(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse ring */}
              <circle cx={org.location.x} cy={org.location.y} r={isHovered ? 3 : 2}
                fill="none" stroke={org.color} strokeWidth="0.3"
                opacity={isHovered ? 0.6 : 0.3}
              >
                <animate attributeName="r" from="2" to="5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle cx={org.location.x} cy={org.location.y} r={isHovered ? 1.5 : 1}
                fill={org.color}
                style={{ transition: 'r 0.2s' }}
              />
              {/* Label on hover */}
              {isHovered && (
                <g>
                  <rect x={org.location.x + 2} y={org.location.y - 4} width={org.initials.length * 2.5 + 3} height={5}
                    rx="1" fill="#131720" stroke={org.color} strokeWidth="0.2" opacity="0.95" />
                  <text x={org.location.x + 3.5} y={org.location.y - 0.5}
                    fontSize="2.5" fill={org.color} fontWeight="600" fontFamily="sans-serif">
                    {org.initials}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Title overlay */}
      <div style={{
        position: 'absolute', top: 12, left: 16, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <MapPin size={12} color="#d4a574" />
        <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Partner Locations
        </span>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 10, right: 16, display: 'flex', gap: 8,
        background: 'rgba(15,18,25,0.8)', padding: '4px 10px', borderRadius: 6,
        backdropFilter: 'blur(8px)',
      }}>
        {orgs.map((org) => (
          <div key={org.id} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            opacity: hoveredOrg === org.id ? 1 : 0.6,
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={() => setHoveredOrg(org.id)}
            onMouseLeave={() => setHoveredOrg(null)}
          >
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: org.color }} />
            <span style={{ fontSize: 8, color: org.color, fontWeight: 500 }}>{org.initials}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Component ─── */

export function EcosystemIntelView() {
  const [activeTab, setActiveTab] = useState<IntelTab>('all');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSignals = useMemo(() => {
    let sorted = [...intelSignals].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (activeTab !== 'all') {
      sorted = sorted.filter((s) => s.category === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      sorted = sorted.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          ecosystemOrgs.find((o) => o.id === s.orgId)?.name.toLowerCase().includes(q)
      );
    }
    return sorted;
  }, [activeTab, searchQuery]);

  // Stats
  const highImpactCount = intelSignals.filter((s) => s.impact === 'High').length;
  const partnershipCount = intelSignals.filter(
    (s) => s.category === 'Partnership Opportunity'
  ).length;
  const orgCount = ecosystemOrgs.length;
  const avgOpportunityScore = Math.round(
    ecosystemOrgs.reduce((sum, o) => sum + o.opportunityScore, 0) / ecosystemOrgs.length
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <AnimatedCard delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(212,165,116,0.1)', border: '1px solid rgba(212,165,116,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ letterSpacing: '-0.01em' }}>
              <span className="gradient-text">Ecosystem Intel</span>
            </h1>
            <p className="text-text-secondary text-xs" style={{ marginTop: 2 }}>
              Intelligence on aligned organizations and movements
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* ── World Map ── */}
      <AnimatedCard delay={50}>
        <WorldMapPlaceholder orgs={ecosystemOrgs} />
      </AnimatedCard>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            icon: Wifi,
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
            label: 'Avg. Opportunity',
            value: `${avgOpportunityScore}%`,
            icon: BarChart3,
            color: '#6b8f71',
            bg: 'rgba(107, 143, 113, 0.08)',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <AnimatedCard key={stat.label} delay={80 + i * 40}>
              <div
                className="glow-card rounded-xl border p-4"
                style={{
                  backgroundColor: stat.bg,
                  borderColor: `${stat.color}18`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${stat.color}40, transparent)`,
                }} />
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} style={{ color: stat.color }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: stat.color }}
                  >
                    {stat.label}
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* ── Partner / Competitor Cards with Logos and Scores ── */}
      <AnimatedCard delay={250}>
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Aligned Organizations
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ecosystemOrgs.map((org, i) => {
            const Icon = org.icon;
            const signalCount = intelSignals.filter(
              (s) => s.orgId === org.id
            ).length;
            return (
              <AnimatedCard key={org.id} delay={280 + i * 50}>
                <div
                  className="glow-card rounded-xl border transition-all"
                  style={{
                    backgroundColor: '#131720',
                    borderColor: `${org.color}18`,
                    padding: 16,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top accent */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, ${org.color}50, transparent)`,
                  }} />

                  <div className="flex items-start gap-3">
                    {/* Logo/Initials circle */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${org.color}12`,
                      border: `1px solid ${org.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: org.color,
                        letterSpacing: '-0.02em',
                      }}>
                        {org.initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-text-primary truncate">
                        {org.name}
                      </h3>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {org.focus}
                      </p>
                    </div>
                  </div>

                  {/* Market trend indicator */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 10, paddingTop: 10, borderTop: '1px solid #1e2638',
                  }}>
                    <TrendArrow direction={org.trendDirection} color={org.color} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {signalCount > 0 && (
                        <span style={{
                          fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
                          background: 'rgba(212,165,116,0.1)', color: '#d4a574',
                        }}>
                          {signalCount} signal{signalCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Opportunity Score */}
                  <div style={{ marginTop: 8 }}>
                    <div style={{
                      fontSize: 9, color: '#4a443e', marginBottom: 4,
                      textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
                    }}>
                      Opportunity Score
                    </div>
                    <OpportunityScoreBar score={org.opportunityScore} color={org.color} />
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </AnimatedCard>

      {/* ── Search ── */}
      <AnimatedCard delay={550}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#4a443e', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search signals by title, org, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 34px',
              backgroundColor: '#131720', border: '1px solid #1e2638',
              borderRadius: 10, color: '#f0ebe4', fontSize: 13,
              fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 0.15s', boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#1e2638'; }}
          />
        </div>
      </AnimatedCard>

      {/* ── Intelligence Categories as Tabs ── */}
      <AnimatedCard delay={580}>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-1">
            Category
          </span>
          {/* "All" tab */}
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: activeTab === 'all' ? 600 : 400,
              background: activeTab === 'all' ? 'rgba(212,165,116,0.12)' : '#131720',
              color: activeTab === 'all' ? '#d4a574' : '#6b6358',
              border: `1px solid ${activeTab === 'all' ? 'rgba(212,165,116,0.3)' : '#1e2638'}`,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            All
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: activeTab === 'all' ? 'rgba(212,165,116,0.15)' : '#1e2638',
              color: activeTab === 'all' ? '#d4a574' : '#6b6358',
              padding: '0 5px', borderRadius: 6,
            }}>
              {intelSignals.length}
            </span>
          </button>
          {/* Category tabs */}
          {(Object.keys(categoryConfig) as SignalCategory[]).map((cat) => {
            const cfg = categoryConfig[cat];
            const CatIcon = cfg.icon;
            const count = intelSignals.filter((s) => s.category === cat).length;
            if (count === 0) return null;
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? cfg.bg : '#131720',
                  color: isActive ? cfg.color : '#6b6358',
                  border: `1px solid ${isActive ? `${cfg.color}40` : '#1e2638'}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <CatIcon size={11} />
                {cat}
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: isActive ? `${cfg.color}18` : '#1e2638',
                  color: isActive ? cfg.color : '#6b6358',
                  padding: '0 5px', borderRadius: 6,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </AnimatedCard>

      {/* ── Intelligence Signals ── */}
      <div className="space-y-4">
        {filteredSignals.map((signal, i) => {
          const org = ecosystemOrgs.find((o) => o.id === signal.orgId);
          const catCfg = categoryConfig[signal.category];
          const impCfg = impactConfig[signal.impact];
          const CatIcon = catCfg.icon;
          const isExpanded = expandedSignal === signal.id;

          return (
            <AnimatedCard key={signal.id} delay={620 + i * 60}>
              <div
                className="glow-card rounded-xl border transition-all cursor-pointer"
                style={{
                  backgroundColor: '#131720',
                  borderColor: isExpanded
                    ? `${catCfg.color}40`
                    : signal.impact === 'High'
                    ? 'rgba(224, 96, 96, 0.2)'
                    : '#1e2638',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() =>
                  setExpandedSignal(isExpanded ? null : signal.id)
                }
              >
                {/* Left accent for high impact */}
                {signal.impact === 'High' && (
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: 'linear-gradient(to bottom, #e06060, transparent)',
                    borderRadius: '12px 0 0 12px',
                  }} />
                )}

                <div className="p-5">
                  {/* Top row: date + signal strength + badges */}
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-text-muted tabular-nums">
                        {new Date(signal.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {org && (
                        <span className="flex items-center gap-1.5">
                          {/* Org initials badge */}
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 20, height: 20, borderRadius: 6,
                              background: `${org.color}15`, fontSize: 8, fontWeight: 700,
                              color: org.color,
                            }}
                          >
                            {org.initials}
                          </span>
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: org.color }}
                          >
                            {org.name}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Signal Strength */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Wifi size={10} style={{ color: '#4a443e' }} />
                        <SignalStrengthBar strength={signal.signalStrength} color={catCfg.color} />
                      </div>
                      {/* Category badge */}
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{
                          backgroundColor: catCfg.bg,
                          color: catCfg.color,
                        }}
                      >
                        <CatIcon size={10} />
                        {signal.category}
                      </span>
                      {/* Impact badge */}
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: impCfg.bg,
                          color: impCfg.color,
                          border: `1px solid ${impCfg.border}`,
                        }}
                      >
                        {signal.impact} Impact
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-text-primary mb-2" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {signal.title}
                    {isExpanded ? (
                      <ChevronRight size={14} style={{ color: '#6b6358', transform: 'rotate(90deg)', transition: 'transform 0.2s' }} />
                    ) : (
                      <ChevronRight size={14} style={{ color: '#4a443e', transition: 'transform 0.2s' }} />
                    )}
                  </h3>

                  {/* Summary */}
                  <p className="text-[12px] text-text-secondary leading-relaxed mb-3">
                    {signal.summary}
                  </p>

                  {/* Frequency Implication (always visible for High impact, expandable for others) */}
                  {(isExpanded || signal.impact === 'High') && (
                    <div
                      className="rounded-lg p-3 mt-3"
                      style={{
                        backgroundColor: 'rgba(212, 165, 116, 0.06)',
                        border: '1px solid rgba(212, 165, 116, 0.15)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={13} style={{ color: '#d4a574' }} />
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: '#d4a574' }}
                        >
                          What This Means For Frequency
                        </span>
                      </div>
                      <p className="text-[12px] text-text-secondary leading-relaxed">
                        {signal.frequencyImplication}
                      </p>
                    </div>
                  )}

                  {/* Expanded: Opportunity score for the related org */}
                  {isExpanded && org && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px', borderRadius: 8,
                      background: 'rgba(30,38,56,0.2)', border: '1px solid #1e2638',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 8,
                      }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: '#6b6358',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          Opportunity Score for {org.initials}
                        </span>
                        <TrendArrow direction={org.trendDirection} color={org.color} />
                      </div>
                      <OpportunityScoreBar score={org.opportunityScore} color={org.color} />
                    </div>
                  )}

                  {/* Source */}
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #1e2638' }}>
                    <div className="flex items-center gap-1.5">
                      <ExternalLink size={11} className="text-text-muted" />
                      <span className="text-[10px] text-text-muted">
                        {signal.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isExpanded && signal.impact !== 'High' && (
                        <span className="text-[10px] text-text-muted italic">
                          Click to expand analysis
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {filteredSignals.length === 0 && (
        <AnimatedCard delay={100}>
          <div
            className="flex flex-col items-center justify-center py-12 rounded-xl border"
            style={{
              backgroundColor: '#131720',
              borderColor: '#1e2638',
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'rgba(107,99,88,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Globe size={28} className="text-text-muted" style={{ opacity: 0.4 }} />
            </div>
            <span className="text-sm text-text-muted font-medium">
              No signals found
            </span>
            <span className="text-xs text-text-muted mt-1" style={{ opacity: 0.6 }}>
              Try adjusting your category filter or search
            </span>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}
