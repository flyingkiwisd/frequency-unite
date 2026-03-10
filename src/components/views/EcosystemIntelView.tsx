'use client';

import React, { useState, useMemo } from 'react';
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
  Building2,
  Leaf,
  BookOpen,
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

interface EcosystemOrg {
  id: string;
  name: string;
  focus: string;
  alignment: string;
  icon: React.ElementType;
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
  },
  {
    id: 'bfi',
    name: 'Buckminster Fuller Institute',
    focus: 'Systems thinking',
    alignment: 'Thesis alignment',
    icon: Globe,
    color: '#8b5cf6',
  },
  {
    id: 'presencing',
    name: 'Presencing Institute (Otto Scharmer)',
    focus: 'Theory U',
    alignment: 'Coherence practices',
    icon: BookOpen,
    color: '#60a5fa',
  },
  {
    id: 'blab',
    name: 'B Lab / B Corp Movement',
    focus: 'Conscious capitalism',
    alignment: 'Philosophical alignment',
    icon: Building2,
    color: '#d4a574',
  },
  {
    id: 'patagonia',
    name: 'Patagonia / 1% for the Planet',
    focus: 'Environmental stewardship',
    alignment: 'Stewardship model',
    icon: Leaf,
    color: '#34d399',
  },
  {
    id: 'conscious-cap',
    name: 'Conscious Capitalism',
    focus: 'Stakeholder capitalism',
    alignment: 'Philosophical alignment',
    icon: TrendingUp,
    color: '#fb923c',
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

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <Globe size={28} className="text-accent" />
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Ecosystem Intel</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm">
          Intelligence on aligned organizations and movements. Tracking
          opportunities, shifts, and signals that matter for Frequency&apos;s
          mission.
        </p>
      </div>

      {/* ── Summary Stats ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in"
        style={{ animationDelay: '0.03s', opacity: 0 }}
      >
        {[
          {
            label: 'Tracked Orgs',
            value: orgCount.toString(),
            icon: Building2,
            color: '#8b5cf6',
            bg: 'rgba(139, 92, 246, 0.12)',
          },
          {
            label: 'Total Signals',
            value: intelSignals.length.toString(),
            icon: AlertCircle,
            color: '#d4a574',
            bg: 'rgba(212, 165, 116, 0.12)',
          },
          {
            label: 'High Impact',
            value: highImpactCount.toString(),
            icon: TrendingUp,
            color: '#e06060',
            bg: 'rgba(224, 96, 96, 0.12)',
          },
          {
            label: 'Partnership Opps',
            value: partnershipCount.toString(),
            icon: Handshake,
            color: '#6b8f71',
            bg: 'rgba(107, 143, 113, 0.12)',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glow-card rounded-xl border p-4"
              style={{
                backgroundColor: stat.bg,
                borderColor: `${stat.color}22`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: stat.color }} />
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
          );
        })}
      </div>

      {/* ── Tracked Organizations ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.05s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Aligned Organizations
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ecosystemOrgs.map((org) => {
            const Icon = org.icon;
            const signalCount = intelSignals.filter(
              (s) => s.orgId === org.id
            ).length;
            return (
              <div
                key={org.id}
                className="glow-card rounded-xl border p-4 transition-all"
                style={{
                  backgroundColor: '#131720',
                  borderColor: `${org.color}22`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${org.color}15`,
                      border: `1px solid ${org.color}30`,
                    }}
                  >
                    <Icon size={16} style={{ color: org.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-text-primary truncate">
                      {org.name}
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {org.focus}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${org.color}12`,
                          color: org.color,
                        }}
                      >
                        {org.alignment}
                      </span>
                      {signalCount > 0 && (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'rgba(212, 165, 116, 0.12)',
                            color: '#d4a574',
                          }}
                        >
                          {signalCount} signal{signalCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Category Filter ── */}
      <div
        className="flex items-center gap-2 flex-wrap animate-fade-in"
        style={{ animationDelay: '0.07s', opacity: 0 }}
      >
        <Filter size={14} className="text-text-muted" />
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-1">
          Filter
        </span>
        <button
          onClick={() => setCategoryFilter('all')}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
          style={{
            backgroundColor:
              categoryFilter === 'all'
                ? 'rgba(212, 165, 116, 0.15)'
                : '#131720',
            color: categoryFilter === 'all' ? '#d4a574' : '#6b6358',
            border: `1px solid ${
              categoryFilter === 'all'
                ? 'rgba(212, 165, 116, 0.3)'
                : '#1e2638'
            }`,
          }}
        >
          All ({intelSignals.length})
        </button>
        {(Object.keys(categoryConfig) as SignalCategory[]).map((cat) => {
          const cfg = categoryConfig[cat];
          const count = intelSignals.filter((s) => s.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{
                backgroundColor:
                  categoryFilter === cat ? cfg.bg : '#131720',
                color: categoryFilter === cat ? cfg.color : '#6b6358',
                border: `1px solid ${
                  categoryFilter === cat
                    ? `${cfg.color}40`
                    : '#1e2638'
                }`,
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Intelligence Signals ── */}
      <div
        className="space-y-4 animate-fade-in"
        style={{ animationDelay: '0.09s', opacity: 0 }}
      >
        {filteredSignals.map((signal, i) => {
          const org = ecosystemOrgs.find((o) => o.id === signal.orgId);
          const catCfg = categoryConfig[signal.category];
          const impCfg = impactConfig[signal.impact];
          const CatIcon = catCfg.icon;
          const isExpanded = expandedSignal === signal.id;

          return (
            <div
              key={signal.id}
              className="glow-card rounded-xl border transition-all animate-fade-in cursor-pointer"
              style={{
                backgroundColor: '#131720',
                borderColor: isExpanded
                  ? `${catCfg.color}40`
                  : signal.impact === 'High'
                  ? 'rgba(224, 96, 96, 0.2)'
                  : '#1e2638',
                animationDelay: `${0.12 + i * 0.03}s`,
                opacity: 0,
              }}
              onClick={() =>
                setExpandedSignal(isExpanded ? null : signal.id)
              }
            >
              <div className="p-5">
                {/* Top row: date + badges */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted tabular-nums">
                      {new Date(signal.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {org && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${org.color}12`,
                          color: org.color,
                        }}
                      >
                        {org.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
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
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  {signal.title}
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

                {/* Source */}
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #1e2638' }}>
                  <div className="flex items-center gap-1.5">
                    <ExternalLink size={11} className="text-text-muted" />
                    <span className="text-[10px] text-text-muted">
                      {signal.source}
                    </span>
                  </div>
                  {!isExpanded && signal.impact !== 'High' && (
                    <span className="text-[10px] text-text-muted italic">
                      Click to expand analysis
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {filteredSignals.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-xl border"
          style={{
            backgroundColor: '#131720',
            borderColor: '#1e2638',
          }}
        >
          <Globe size={32} className="text-text-muted mb-3" />
          <span className="text-sm text-text-muted">
            No signals found for this category.
          </span>
        </div>
      )}
    </div>
  );
}
