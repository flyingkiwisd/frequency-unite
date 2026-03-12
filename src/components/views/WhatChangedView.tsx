'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Clock,
  Users,
  Scale,
  Network,
  DollarSign,
  Calendar,
  Heart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Zap,
  Star,
  Eye,
  Tag,
  ChevronRight,
  Wrench,
  Lightbulb,
  BarChart3,
  Shield,
  Activity,
} from 'lucide-react';

/* ─── Types ─── */

type TimeFilter = 'today' | 'this-week' | 'this-month';

type Category = 'membership' | 'governance' | 'nodes' | 'financial' | 'events' | 'culture';

type Sentiment = 'positive' | 'neutral' | 'negative';

type ImpactLevel = 'high' | 'medium' | 'low';

type ChangeType = 'feature' | 'fix' | 'update' | 'decision';

interface ChangeItem {
  id: string;
  category: Category;
  sentiment: Sentiment;
  impact: ImpactLevel;
  changeType: ChangeType;
  description: string;
  detail: string;
  triggeredBy: string;
  timestamp: string;
  timeAgo: string;
  daysAgo: number;
  affectedAreas: string[];
  isNew?: boolean;
}

/* ─── Scoped Keyframes (wc- prefix) ─── */

const animationStyles = `
@keyframes wc-fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
    filter: blur(4px);
  }
  60% {
    opacity: 1;
    transform: translateY(-2px) scale(1.003);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes wc-cardEntrance {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
    filter: blur(6px);
  }
  70% {
    opacity: 1;
    transform: translateY(-1px) scale(1.005);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes wc-statEntrance {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.92);
  }
  70% {
    opacity: 1;
    transform: translateY(-2px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes wc-newPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(212, 165, 116, 0); }
}

@keyframes wc-shimmerBorder {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes wc-slideExpand {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }
}

@keyframes wc-trendBounce {
  0% { transform: translateY(0); }
  25% { transform: translateY(-3px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(-1.5px); }
  100% { transform: translateY(0); }
}

@keyframes wc-impactGlow {
  0%, 100% { box-shadow: 0 0 4px rgba(212, 165, 116, 0.3); }
  50% { box-shadow: 0 0 12px rgba(212, 165, 116, 0.6); }
}

@keyframes wc-sparkleRotate {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(10deg) scale(1.1); }
  50% { transform: rotate(0deg) scale(1); }
  75% { transform: rotate(-10deg) scale(1.1); }
  100% { transform: rotate(0deg) scale(1); }
}

@keyframes wc-insightShimmer {
  0% { background-position: -300% center; }
  100% { background-position: 300% center; }
}

@keyframes wc-timelineDotPing {
  0% { transform: scale(1); opacity: 1; }
  75% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(2.2); opacity: 0; }
}

@keyframes wc-pillGlow {
  0%, 100% { box-shadow: 0 0 6px rgba(212, 165, 116, 0.2), inset 0 0 6px rgba(212, 165, 116, 0.05); }
  50% { box-shadow: 0 0 16px rgba(212, 165, 116, 0.4), inset 0 0 10px rgba(212, 165, 116, 0.1); }
}

@keyframes wc-headerGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes wc-counterUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

/* ─── Design Tokens ─── */
const glass = {
  bg: 'rgba(19, 23, 32, 0.7)',
  border: 'rgba(212, 165, 116, 0.08)',
  blur: 'blur(20px)',
  hoverBorder: 'rgba(212, 165, 116, 0.18)',
};
const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ─── Config ─── */

const categoryConfig: Record<Category, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  membership: { label: 'Membership', color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.12)', icon: Users },
  governance: { label: 'Governance', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', icon: Scale },
  nodes: { label: 'Nodes', color: '#5eaed4', bg: 'rgba(94, 174, 212, 0.12)', icon: Network },
  financial: { label: 'Financial', color: '#d4a574', bg: 'rgba(212, 165, 116, 0.12)', icon: DollarSign },
  events: { label: 'Events', color: '#e879a0', bg: 'rgba(232, 121, 160, 0.12)', icon: Calendar },
  culture: { label: 'Culture', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)', icon: Heart },
};

const sentimentConfig: Record<Sentiment, { label: string; color: string; bg: string; icon: React.ElementType; borderColor: string }> = {
  positive: { label: 'Positive', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', icon: TrendingUp, borderColor: 'rgba(52, 211, 153, 0.5)' },
  neutral: { label: 'Neutral', color: '#e8b44c', bg: 'rgba(232, 180, 76, 0.12)', icon: Minus, borderColor: 'rgba(232, 180, 76, 0.35)' },
  negative: { label: 'Needs Attention', color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', icon: TrendingDown, borderColor: 'rgba(248, 113, 113, 0.5)' },
};

const impactConfig: Record<ImpactLevel, { label: string; tag: string; color: string; bg: string; glowColor: string; size: number }> = {
  high: { label: 'High Impact', tag: 'HIGH', color: '#d4a574', bg: 'rgba(212, 165, 116, 0.15)', glowColor: 'rgba(212, 165, 116, 0.5)', size: 28 },
  medium: { label: 'Medium', tag: 'MED', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', glowColor: 'rgba(96, 165, 250, 0.3)', size: 22 },
  low: { label: 'Low', tag: 'LOW', color: '#a09888', bg: 'rgba(160, 152, 136, 0.12)', glowColor: 'rgba(160, 152, 136, 0.2)', size: 18 },
};

const changeTypeConfig: Record<ChangeType, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  feature: {
    label: 'Feature',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.25)',
    icon: Star,
  },
  fix: {
    label: 'Fix',
    color: '#f87171',
    bg: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.25)',
    icon: Wrench,
  },
  update: {
    label: 'Update',
    color: '#d4a574',
    bg: 'rgba(212, 165, 116, 0.1)',
    border: '1px solid rgba(212, 165, 116, 0.25)',
    icon: ArrowUpRight,
  },
  decision: {
    label: 'Decision',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    icon: Lightbulb,
  },
};

const timeFilters: { key: TimeFilter; label: string; maxDays: number }[] = [
  { key: 'today', label: 'Today', maxDays: 1 },
  { key: 'this-week', label: 'This Week', maxDays: 7 },
  { key: 'this-month', label: 'This Month', maxDays: 30 },
];

/* ─── Mock Data ─── */

const changesData: ChangeItem[] = [
  {
    id: 'chg-1',
    category: 'membership',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'feature',
    description: '3 new well-steward applications received this week',
    detail: 'Applications from Costa Rica, UK, and California — all referred by existing members. Essence interviews scheduled.',
    triggeredBy: 'Maximillian',
    timestamp: '2026-03-09',
    timeAgo: '2 hours ago',
    daysAgo: 0,
    affectedAreas: ['Membership Pipeline', 'Onboarding'],
    isNew: true,
  },
  {
    id: 'chg-2',
    category: 'financial',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'update',
    description: 'Monthly burn came in at $21.8K — under target',
    detail: 'February burn was $3.2K under the $25K/mo target. Travel costs lower than projected; contractor spend stable.',
    triggeredBy: 'Colleen Galbraith',
    timestamp: '2026-03-09',
    timeAgo: '4 hours ago',
    daysAgo: 0,
    affectedAreas: ['Budget', 'Runway'],
    isNew: true,
  },
  {
    id: 'chg-3',
    category: 'nodes',
    sentiment: 'negative',
    impact: 'high',
    changeType: 'fix',
    description: 'Nicoya pilot Phase 1 delayed by 2 weeks',
    detail: 'Local permitting process taking longer than expected. Gareth working with community leaders on expedited review.',
    triggeredBy: 'Gareth Hermann',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    daysAgo: 1,
    affectedAreas: ['Bioregions Node', 'Timeline'],
    isNew: true,
  },
  {
    id: 'chg-4',
    category: 'governance',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'feature',
    description: 'Teal governance decision log now maintained for 30 consecutive days',
    detail: 'Every council meeting has produced a documented decision log since February 7. Transparency streak intact.',
    triggeredBy: 'Core Stewardship Team',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    daysAgo: 1,
    affectedAreas: ['Governance', 'Transparency'],
  },
  {
    id: 'chg-5',
    category: 'events',
    sentiment: 'neutral',
    impact: 'high',
    changeType: 'update',
    description: 'Blue Spirit ticket sales at 32/70 — 46% capacity',
    detail: 'Registration pace is on track but not accelerating. Early-bird pricing ends March 31. Marketing push planned.',
    triggeredBy: 'Sian Hodges',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    daysAgo: 1,
    affectedAreas: ['Events', 'Revenue'],
  },
  {
    id: 'chg-6',
    category: 'nodes',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'decision',
    description: 'Map Node MVP specs approved by Wisdom Council',
    detail: 'The coordination layer specs passed Wisdom Council review. Development sprint begins next week with Fairman leading.',
    triggeredBy: 'Wisdom Council',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    daysAgo: 2,
    affectedAreas: ['Map Node', 'Development'],
  },
  {
    id: 'chg-7',
    category: 'membership',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'update',
    description: 'Member retention improved to 82% (was 78%)',
    detail: 'Pod engagement and monthly calls driving better retention. 4 at-risk members re-engaged after personal outreach.',
    triggeredBy: 'Maximillian',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    daysAgo: 2,
    affectedAreas: ['Membership', 'Community Health'],
  },
  {
    id: 'chg-8',
    category: 'nodes',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'feature',
    description: 'Anthem studio session completed — 3 tracks in production',
    detail: 'Raamayan wrapped a powerful studio session. Cultural heartbeat tracks enter mixing phase next week.',
    triggeredBy: 'Raamayan Ananda',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    daysAgo: 3,
    affectedAreas: ['Megaphone Node', 'Culture'],
  },
  {
    id: 'chg-9',
    category: 'financial',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'update',
    description: 'DAF compliance review passed with no issues',
    detail: 'Quarterly compliance check completed. All donor-advised fund documentation meets regulatory standards.',
    triggeredBy: 'Colleen Galbraith',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    daysAgo: 3,
    affectedAreas: ['Compliance', 'DAF'],
  },
  {
    id: 'chg-10',
    category: 'culture',
    sentiment: 'negative',
    impact: 'medium',
    changeType: 'fix',
    description: 'Pod attendance dropped 15% in February',
    detail: 'Participation dipped across 3 of 4 active pods. Scheduling conflicts cited as primary reason. Pod leads meeting to discuss format changes.',
    triggeredBy: 'Dave Wolstencroft',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    daysAgo: 4,
    affectedAreas: ['Pods', 'Engagement'],
  },
  {
    id: 'chg-11',
    category: 'nodes',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'feature',
    description: 'Capital Node scored 3 new deals this week',
    detail: 'Greg reports 3 new investment opportunities under evaluation, bringing active pipeline to 8 deals total.',
    triggeredBy: 'Greg Berry',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    daysAgo: 4,
    affectedAreas: ['Capital Node', 'Pipeline'],
  },
  {
    id: 'chg-12',
    category: 'financial',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'update',
    description: 'Cash runway extended to 14 months',
    detail: 'Combination of lower burn rate and new membership revenue pushed runway from 12 to 14 months. Healthy position.',
    triggeredBy: 'James Hodges',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    daysAgo: 5,
    affectedAreas: ['Financial Health', 'Runway'],
  },
  {
    id: 'chg-13',
    category: 'governance',
    sentiment: 'positive',
    impact: 'high',
    changeType: 'decision',
    description: 'Board approved CEO search timeline',
    detail: 'Board agreed to formally begin CEO search after Blue Spirit. James transitions to strategic advisor role by Q4 2026.',
    triggeredBy: 'Board',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    daysAgo: 5,
    affectedAreas: ['Leadership', 'Governance'],
  },
  {
    id: 'chg-14',
    category: 'nodes',
    sentiment: 'neutral',
    impact: 'medium',
    changeType: 'feature',
    description: 'DECO framework v1 documentation started',
    detail: 'First draft of the decentralized coordination framework is underway. Targeting completion by end of March.',
    triggeredBy: 'Alex James Fairman',
    timestamp: '2026-03-03',
    timeAgo: '6 days ago',
    daysAgo: 6,
    affectedAreas: ['DECO', 'Documentation'],
  },
  {
    id: 'chg-15',
    category: 'culture',
    sentiment: 'positive',
    impact: 'low',
    changeType: 'feature',
    description: "Women's Council charter drafting began",
    detail: 'An emerging group of women stewards initiated a formal charter to define purpose, cadence, and decision authority.',
    triggeredBy: 'Community Members',
    timestamp: '2026-03-02',
    timeAgo: '1 week ago',
    daysAgo: 7,
    affectedAreas: ['Culture', 'Governance'],
  },
  {
    id: 'chg-16',
    category: 'membership',
    sentiment: 'neutral',
    impact: 'medium',
    changeType: 'decision',
    description: 'Membership tier restructuring proposal submitted',
    detail: 'New tiered pricing model proposed with Steward ($500/yr), Guardian ($2,500/yr), and Founder ($10K/yr) levels.',
    triggeredBy: 'Maximillian',
    timestamp: '2026-03-01',
    timeAgo: '8 days ago',
    daysAgo: 8,
    affectedAreas: ['Membership', 'Pricing'],
  },
  {
    id: 'chg-17',
    category: 'events',
    sentiment: 'positive',
    impact: 'medium',
    changeType: 'update',
    description: 'Cabo 5.0 post-event survey completed — 9.3 NPS',
    detail: 'Final survey results in. Strongest scores in community connection and governance sessions. Food scored lowest.',
    triggeredBy: 'Sian Hodges',
    timestamp: '2026-02-25',
    timeAgo: '12 days ago',
    daysAgo: 12,
    affectedAreas: ['Events', 'NPS'],
  },
  {
    id: 'chg-18',
    category: 'governance',
    sentiment: 'neutral',
    impact: 'low',
    changeType: 'update',
    description: 'Node lead quarterly report template finalized',
    detail: 'Standardized reporting template approved. All node leads will use it starting Q2 2026.',
    triggeredBy: 'Core Stewardship Team',
    timestamp: '2026-02-20',
    timeAgo: '17 days ago',
    daysAgo: 17,
    affectedAreas: ['Reporting', 'Nodes'],
  },
];

/* ─── Helper: Group by time period ─── */

function groupByTimePeriod(items: ChangeItem[]): { label: string; relative: string; items: ChangeItem[] }[] {
  const groups: { label: string; relative: string; items: ChangeItem[] }[] = [];
  const today: ChangeItem[] = [];
  const thisWeek: ChangeItem[] = [];
  const thisMonth: ChangeItem[] = [];
  const older: ChangeItem[] = [];

  items.forEach((item) => {
    if (item.daysAgo === 0) today.push(item);
    else if (item.daysAgo <= 7) thisWeek.push(item);
    else if (item.daysAgo <= 30) thisMonth.push(item);
    else older.push(item);
  });

  if (today.length > 0) groups.push({ label: 'Today', relative: 'March 10, 2026', items: today });
  if (thisWeek.length > 0) groups.push({ label: 'This Week', relative: 'Mar 3 -- Mar 9', items: thisWeek });
  if (thisMonth.length > 0) groups.push({ label: 'Earlier This Month', relative: 'Feb 20 -- Mar 2', items: thisMonth });
  if (older.length > 0) groups.push({ label: 'Earlier', relative: 'Older entries', items: older });

  return groups;
}

/* ─── Helper: derive insight from data ─── */
function deriveInsight(changes: ChangeItem[]): { text: string; type: 'momentum' | 'alert' | 'milestone' } | null {
  const positive = changes.filter((c) => c.sentiment === 'positive').length;
  const negative = changes.filter((c) => c.sentiment === 'negative').length;
  const highImpact = changes.filter((c) => c.impact === 'high');
  const ratio = changes.length > 0 ? positive / changes.length : 0;

  if (ratio >= 0.7 && changes.length >= 5) {
    return { text: `Strong momentum: ${Math.round(ratio * 100)}% of changes this period are positive. The ecosystem is accelerating.`, type: 'momentum' };
  }
  if (negative >= 2) {
    return { text: `${negative} items need attention this period. Consider reviewing priorities to keep the roadmap on track.`, type: 'alert' };
  }
  if (highImpact.length >= 3) {
    return { text: `${highImpact.length} high-impact changes landed. Major progress across multiple fronts.`, type: 'milestone' };
  }
  return null;
}

/* ─── Sub-components ─── */

/* Impact Badge: size-coded circle/shield with glow */
function ImpactBadge({ level }: { level: ImpactLevel }) {
  const cfg = impactConfig[level];
  const isHigh = level === 'high';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: cfg.size,
        height: cfg.size,
        borderRadius: isHigh ? 8 : '50%',
        backgroundColor: cfg.bg,
        border: `1.5px solid ${cfg.color}50`,
        boxShadow: isHigh ? `0 0 10px ${cfg.glowColor}` : `0 0 4px ${cfg.glowColor}`,
        animation: isHigh ? 'wc-impactGlow 3s ease-in-out infinite' : 'none',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {isHigh ? (
        <Shield size={14} style={{ color: cfg.color }} />
      ) : (
        <div
          style={{
            width: level === 'medium' ? 8 : 5,
            height: level === 'medium' ? 8 : 5,
            borderRadius: '50%',
            backgroundColor: cfg.color,
            opacity: level === 'medium' ? 0.8 : 0.5,
          }}
        />
      )}
      <span
        style={{
          position: 'absolute',
          bottom: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: cfg.color,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
        }}
      >
        {cfg.tag}
      </span>
    </div>
  );
}

/* Trend Arrow: animated directional arrow with color coding */
function TrendArrow({ sentiment }: { sentiment: Sentiment }) {
  const icons = {
    positive: ArrowUpRight,
    neutral: ArrowRight,
    negative: ArrowDownRight,
  };
  const colors = {
    positive: '#34d399',
    neutral: '#e8b44c',
    negative: '#f87171',
  };
  const Icon = icons[sentiment];
  const color = colors[sentiment];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: `${color}12`,
        border: `1px solid ${color}25`,
        animation: sentiment !== 'neutral' ? 'wc-trendBounce 2.5s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }}
    >
      <Icon size={14} style={{ color }} />
    </div>
  );
}

/* Category Icon: styled container with category-colored backgrounds */
function CategoryIcon({ category }: { category: Category }) {
  const cfg = categoryConfig[category];
  const Icon = cfg.icon;
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${cfg.bg}, ${cfg.color}08)`,
        border: `1px solid ${cfg.color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={15} style={{ color: cfg.color }} />
    </div>
  );
}

/* Insight Callout Card */
function InsightCallout({ insight }: { insight: { text: string; type: 'momentum' | 'alert' | 'milestone' } }) {
  const configMap = {
    momentum: {
      gradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.08), rgba(107, 143, 113, 0.06))',
      borderColor: 'rgba(52, 211, 153, 0.2)',
      iconColor: '#34d399',
      accentGradient: 'linear-gradient(90deg, rgba(52, 211, 153, 0.4), rgba(107, 143, 113, 0.2), rgba(52, 211, 153, 0.4))',
    },
    alert: {
      gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.08), rgba(251, 146, 60, 0.06))',
      borderColor: 'rgba(248, 113, 113, 0.2)',
      iconColor: '#f87171',
      accentGradient: 'linear-gradient(90deg, rgba(248, 113, 113, 0.4), rgba(251, 146, 60, 0.2), rgba(248, 113, 113, 0.4))',
    },
    milestone: {
      gradient: 'linear-gradient(135deg, rgba(212, 165, 116, 0.08), rgba(139, 92, 246, 0.06))',
      borderColor: 'rgba(212, 165, 116, 0.2)',
      iconColor: '#d4a574',
      accentGradient: 'linear-gradient(90deg, rgba(212, 165, 116, 0.4), rgba(139, 92, 246, 0.2), rgba(212, 165, 116, 0.4))',
    },
  };
  const cfg = configMap[insight.type];
  const IconComp = insight.type === 'alert' ? AlertTriangle : insight.type === 'momentum' ? Activity : Sparkles;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 24,
      }}
    >
      {/* Top accent gradient bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: cfg.accentGradient,
          backgroundSize: '200% 100%',
          animation: 'wc-insightShimmer 4s linear infinite',
        }}
      />
      <div
        style={{
          background: cfg.gradient,
          backdropFilter: glass.blur,
          WebkitBackdropFilter: glass.blur,
          border: `1px solid ${cfg.borderColor}`,
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${cfg.iconColor}15`,
            border: `1px solid ${cfg.iconColor}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconComp size={18} style={{ color: cfg.iconColor }} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 6,
            }}
          >
            <Lightbulb size={12} style={{ color: cfg.iconColor, opacity: 0.7 }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: cfg.iconColor,
              }}
            >
              Insight
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: '#f0ebe4',
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 400,
            }}
          >
            {insight.text}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Component ─── */

export function WhatChangedView() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this-week');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* Derived data */
  const filteredChanges = useMemo(() => {
    const maxDays = timeFilters.find((t) => t.key === timeFilter)?.maxDays ?? 7;
    return changesData.filter((c) => {
      const inTime = c.daysAgo <= maxDays;
      const inCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return inTime && inCategory;
    });
  }, [timeFilter, categoryFilter]);

  const groupedChanges = useMemo(() => groupByTimePeriod(filteredChanges), [filteredChanges]);

  const newSinceLastVisit = useMemo(() => {
    return filteredChanges.filter((c) => c.isNew);
  }, [filteredChanges]);

  const stats = useMemo(() => {
    const total = filteredChanges.length;
    const positive = filteredChanges.filter((c) => c.sentiment === 'positive').length;
    const neutral = filteredChanges.filter((c) => c.sentiment === 'neutral').length;
    const negative = filteredChanges.filter((c) => c.sentiment === 'negative').length;
    return { total, positive, neutral, negative };
  }, [filteredChanges]);

  const summaryStats = useMemo(() => {
    const weekChanges = changesData.filter((c) => c.daysAgo <= 7).length;
    const monthChanges = changesData.filter((c) => c.daysAgo <= 30).length;
    const highImpactWeek = changesData.filter((c) => c.daysAgo <= 7 && c.impact === 'high').length;
    const decisionsWeek = changesData.filter((c) => c.daysAgo <= 7 && c.changeType === 'decision').length;
    return { weekChanges, monthChanges, highImpactWeek, decisionsWeek };
  }, []);

  const categoryCounts = useMemo(() => {
    const maxDays = timeFilters.find((t) => t.key === timeFilter)?.maxDays ?? 7;
    const timeFiltered = changesData.filter((c) => c.daysAgo <= maxDays);
    const counts: Record<string, number> = { all: timeFiltered.length };
    timeFiltered.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [timeFilter]);

  const insight = useMemo(() => deriveInsight(filteredChanges), [filteredChanges]);

  /* Find the most impactful change for the highlighted hero */
  const mostImpactful = useMemo(() => {
    const highImpact = filteredChanges.filter((c) => c.impact === 'high');
    if (highImpact.length === 0) return null;
    // Prefer new items, then most recent
    const newHigh = highImpact.filter((c) => c.isNew);
    return newHigh.length > 0 ? newHigh[0] : highImpact[0];
  }, [filteredChanges]);

  // Running index counter for staggered animations across groups
  let globalItemIndex = 0;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Inject scoped animations */}
      <style>{animationStyles}</style>

      {/* ── Header with animated gradient ── */}
      <div
        style={{
          marginBottom: 32,
          animation: mounted ? 'wc-fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both' : 'none',
          position: 'relative',
        }}
      >
        <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.25), rgba(139, 92, 246, 0.2), rgba(52, 211, 153, 0.15))',
              backgroundSize: '300% 300%',
              animation: 'wc-headerGradient 6s ease infinite',
              border: '1px solid rgba(212, 165, 116, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: glass.blur,
              WebkitBackdropFilter: glass.blur,
            }}
          >
            <Sparkles
              size={24}
              style={{
                color: '#d4a574',
                animation: 'wc-sparkleRotate 4s ease-in-out infinite',
              }}
            />
          </div>
          <div>
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
              <span className="gradient-text">What Changed</span>
            </h1>
            <p style={{ fontSize: 14, color: '#a09888', margin: 0, marginTop: 2 }}>
              Activity digest across the Frequency ecosystem. Track momentum, celebrate wins, and catch what needs attention.
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Stats: animated key metrics ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'This Week', value: summaryStats.weekChanges, icon: Calendar, color: '#d4a574', sub: 'changes tracked' },
          { label: 'This Month', value: summaryStats.monthChanges, icon: BarChart3, color: '#8b5cf6', sub: 'total changes' },
          { label: 'High Impact', value: summaryStats.highImpactWeek, icon: Zap, color: '#e8b44c', sub: 'this week' },
          { label: 'Decisions', value: summaryStats.decisionsWeek, icon: Lightbulb, color: '#6b8f71', sub: 'this week' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card-stat"
              style={{
                background: glass.bg,
                backdropFilter: glass.blur,
                WebkitBackdropFilter: glass.blur,
                border: `1px solid ${glass.border}`,
                borderRadius: 14,
                padding: '16px 18px',
                animation: mounted ? `wc-statEntrance 0.5s ${ease} ${0.12 + idx * 0.07}s both` : 'none',
                transition: `all 0.3s ${ease}`,
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = glass.hoverBorder;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${glass.hoverBorder}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = glass.border;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Subtle gradient overlay on hover */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(ellipse at top left, ${stat.color}08, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, position: 'relative' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: `linear-gradient(135deg, ${stat.color}18, ${stat.color}08)`,
                    border: `1px solid ${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={15} style={{ color: stat.color }} />
                </div>
                <span
                  style={{
                    fontSize: 10,
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
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  letterSpacing: '-0.02em',
                  position: 'relative',
                  animation: mounted ? `wc-counterUp 0.6s ${ease} ${0.3 + idx * 0.1}s both` : 'none',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: '#6b6358', marginTop: 3, position: 'relative' }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Most Impactful Change Highlight ── */}
      {mostImpactful && (
        <div
          style={{
            marginBottom: 24,
            animation: mounted ? `wc-fadeSlideUp 0.5s ${ease} 0.2s both` : 'none',
          }}
        >
          <div
            className="card-premium"
            style={{
              position: 'relative',
              borderRadius: 16,
              padding: 1.5,
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.5), rgba(139, 92, 246, 0.35), rgba(52, 211, 153, 0.3))',
              backgroundSize: '200% 200%',
              animation: 'wc-shimmerBorder 4s ease-in-out infinite',
            }}
          >
            <div
              style={{
                background: glass.bg,
                backdropFilter: glass.blur,
                WebkitBackdropFilter: glass.blur,
                borderRadius: 15,
                padding: '18px 22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(212, 165, 116, 0.08))',
                    border: '1px solid rgba(212, 165, 116, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Zap size={14} style={{ color: '#d4a574' }} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#d4a574',
                  }}
                >
                  Most Impactful Change
                </span>
                <TrendArrow sentiment={mostImpactful.sentiment} />
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#f0ebe4',
                  margin: '0 0 6px 0',
                  lineHeight: 1.4,
                }}
              >
                {mostImpactful.description}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: '#a09888',
                  margin: '0 0 10px 0',
                  lineHeight: 1.5,
                }}
              >
                {mostImpactful.detail}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <CategoryIcon category={mostImpactful.category} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: categoryConfig[mostImpactful.category].color,
                  }}
                >
                  {categoryConfig[mostImpactful.category].label}
                </span>
                <span style={{ color: '#2e3a4e' }}>|</span>
                <span style={{ fontSize: 11, color: '#6b6358' }}>
                  {mostImpactful.timeAgo} by {mostImpactful.triggeredBy}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── "New Since Your Last Visit" Section ── */}
      {newSinceLastVisit.length > 0 && (
        <div
          style={{
            marginBottom: 24,
            animation: mounted ? `wc-fadeSlideUp 0.5s ${ease} 0.25s both` : 'none',
          }}
        >
          <div
            className="card-premium"
            style={{
              position: 'relative',
              borderRadius: 14,
              padding: 1,
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.5), rgba(139, 92, 246, 0.4), rgba(52, 211, 153, 0.3))',
              backgroundSize: '200% 200%',
              animation: 'wc-shimmerBorder 4s ease-in-out infinite',
            }}
          >
            <div
              style={{
                background: glass.bg,
                backdropFilter: glass.blur,
                WebkitBackdropFilter: glass.blur,
                borderRadius: 13,
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    backgroundColor: 'rgba(212, 165, 116, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Eye size={13} style={{ color: '#d4a574' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#d4a574', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  New Since Your Last Visit
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    backgroundColor: 'rgba(212, 165, 116, 0.2)',
                    color: '#d4a574',
                    borderRadius: 8,
                    padding: '2px 8px',
                    animation: 'wc-newPulse 2s ease-in-out infinite',
                  }}
                >
                  {newSinceLastVisit.length} new
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {newSinceLastVisit.map((change) => {
                  const sentCfg = sentimentConfig[change.sentiment];
                  const ctCfg = changeTypeConfig[change.changeType];
                  const CtIcon = ctCfg.icon;
                  return (
                    <div
                      key={change.id}
                      className="card-interactive"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 10,
                        backgroundColor: change.sentiment === 'positive'
                          ? 'rgba(52, 211, 153, 0.04)'
                          : change.sentiment === 'negative'
                            ? 'rgba(248, 113, 113, 0.04)'
                            : 'rgba(255,255,255,0.02)',
                        borderLeft: `3px solid ${sentCfg.color}`,
                        cursor: 'pointer',
                        transition: `all 0.2s ${ease}`,
                      }}
                      onClick={() => toggleExpand(change.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = change.sentiment === 'positive'
                          ? 'rgba(52, 211, 153, 0.04)'
                          : change.sentiment === 'negative'
                            ? 'rgba(248, 113, 113, 0.04)'
                            : 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <CtIcon size={12} style={{ color: ctCfg.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#f0ebe4', fontWeight: 500, flex: 1 }}>
                        {change.description}
                      </span>
                      <TrendArrow sentiment={change.sentiment} />
                      <span style={{ fontSize: 10, color: '#6b6358', flexShrink: 0 }}>
                        {change.timeAgo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Time Period Filter: Premium Toggle Pills ── */}
      <div
        style={{
          marginBottom: 20,
          animation: mounted ? `wc-fadeSlideUp 0.5s ${ease} 0.3s both` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Clock size={14} style={{ color: '#6b6358' }} />
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>
            Time Period
          </span>
        </div>
        <div
          style={{
            display: 'inline-flex',
            gap: 0,
            background: 'rgba(19, 23, 32, 0.5)',
            borderRadius: 12,
            border: `1px solid ${glass.border}`,
            padding: 3,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
          }}
        >
          {timeFilters.map((tf) => {
            const isActive = timeFilter === tf.key;
            return (
              <button
                key={tf.key}
                onClick={() => setTimeFilter(tf.key)}
                style={{
                  padding: '8px 22px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(212, 165, 116, 0.14)' : 'transparent',
                  color: isActive ? '#d4a574' : '#6b6358',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'inherit',
                  transition: `all 0.25s ${ease}`,
                  position: 'relative',
                  animation: isActive ? 'wc-pillGlow 3s ease-in-out infinite' : 'none',
                  boxShadow: isActive ? '0 0 12px rgba(212, 165, 116, 0.15), inset 0 0 8px rgba(212, 165, 116, 0.05)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#a09888';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#6b6358';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div
        style={{
          marginBottom: 24,
          animation: mounted ? `wc-fadeSlideUp 0.5s ${ease} 0.35s both` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Filter size={14} style={{ color: '#6b6358' }} />
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>
            Category
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'membership', 'governance', 'nodes', 'financial', 'events', 'culture'] as const).map((cat) => {
            const isActive = categoryFilter === cat;
            const config = cat === 'all' ? { label: 'All', color: '#a09888' } : categoryConfig[cat];
            const count = categoryCounts[cat] || 0;
            const CatIcon = cat !== 'all' ? categoryConfig[cat as Category].icon : Sparkles;

            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  border: isActive ? `1px solid ${config.color}55` : `1px solid ${glass.border}`,
                  cursor: 'pointer',
                  backgroundColor: isActive ? `${config.color}18` : 'transparent',
                  backdropFilter: isActive ? glass.blur : 'none',
                  WebkitBackdropFilter: isActive ? glass.blur : 'none',
                  color: isActive ? config.color : '#6b6358',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: `all 0.25s ${ease}`,
                  boxShadow: isActive ? `0 0 12px ${config.color}20` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#2e3a4e';
                    e.currentTarget.style.color = '#a09888';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = glass.border;
                    e.currentTarget.style.color = '#6b6358';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {cat !== 'all' && <CatIcon size={12} />}
                {config.label}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    backgroundColor: isActive ? `${config.color}22` : 'rgba(30, 38, 56, 0.8)',
                    color: isActive ? config.color : '#6b6358',
                    borderRadius: 8,
                    padding: '1px 6px',
                    transition: `all 0.2s ${ease}`,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sentiment Stats Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {/* Total */}
        <div
          className="card-stat"
          style={{
            background: glass.bg,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
            border: `1px solid ${glass.border}`,
            borderRadius: 14,
            padding: '16px 20px',
            animation: mounted ? `wc-statEntrance 0.5s ${ease} 0.38s both` : 'none',
            transition: `all 0.3s ${ease}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = glass.hoverBorder;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = glass.border;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(160, 152, 136, 0.12), rgba(160, 152, 136, 0.04))',
                border: '1px solid rgba(160, 152, 136, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} style={{ color: '#a09888' }} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4', letterSpacing: '-0.02em' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Total Changes</div>
        </div>

        {/* Positive */}
        <div
          className="card-stat"
          style={{
            background: glass.bg,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
            border: `1px solid ${glass.border}`,
            borderRadius: 14,
            padding: '16px 20px',
            animation: mounted ? `wc-statEntrance 0.5s ${ease} 0.43s both` : 'none',
            transition: `all 0.3s ${ease}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = glass.border;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.12), rgba(52, 211, 153, 0.04))',
                border: '1px solid rgba(52, 211, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={16} style={{ color: '#34d399' }} />
            </div>
            <TrendArrow sentiment="positive" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#34d399', letterSpacing: '-0.02em' }}>
            {stats.positive}
          </div>
          <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Positive</div>
        </div>

        {/* Neutral */}
        <div
          className="card-stat"
          style={{
            background: glass.bg,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
            border: `1px solid ${glass.border}`,
            borderRadius: 14,
            padding: '16px 20px',
            animation: mounted ? `wc-statEntrance 0.5s ${ease} 0.48s both` : 'none',
            transition: `all 0.3s ${ease}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(232, 180, 76, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = glass.border;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(232, 180, 76, 0.12), rgba(232, 180, 76, 0.04))',
                border: '1px solid rgba(232, 180, 76, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Minus size={16} style={{ color: '#e8b44c' }} />
            </div>
            <TrendArrow sentiment="neutral" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#e8b44c', letterSpacing: '-0.02em' }}>
            {stats.neutral}
          </div>
          <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Neutral</div>
        </div>

        {/* Needs Attention */}
        <div
          className="card-stat"
          style={{
            background: glass.bg,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
            border: `1px solid ${glass.border}`,
            borderRadius: 14,
            padding: '16px 20px',
            animation: mounted ? `wc-statEntrance 0.5s ${ease} 0.53s both` : 'none',
            transition: `all 0.3s ${ease}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = glass.border;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.12), rgba(248, 113, 113, 0.04))',
                border: '1px solid rgba(248, 113, 113, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={16} style={{ color: '#f87171' }} />
            </div>
            <TrendArrow sentiment="negative" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f87171', letterSpacing: '-0.02em' }}>
            {stats.negative}
          </div>
          <div style={{ fontSize: 11, color: '#6b6358', marginTop: 2 }}>Needs Attention</div>
        </div>
      </div>

      {/* ── Insight Callout ── */}
      {insight && (
        <div style={{ animation: mounted ? `wc-fadeSlideUp 0.5s ${ease} 0.4s both` : 'none' }}>
          <InsightCallout insight={insight} />
        </div>
      )}

      {/* ── Changelog Timeline ── */}
      <div style={{ position: 'relative' }}>
        {groupedChanges.map((group, groupIdx) => (
          <div key={group.label} style={{ marginBottom: 8 }}>
            {/* Date Grouping Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
                paddingLeft: 20,
                position: 'relative',
                animation: mounted ? `wc-fadeSlideUp 0.45s ${ease} ${0.45 + groupIdx * 0.1}s both` : 'none',
              }}
            >
              {/* Timeline dot for group header with ping animation */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#d4a574',
                  border: '2px solid #0b0d14',
                  boxShadow: '0 0 0 3px rgba(212, 165, 116, 0.2)',
                  zIndex: 2,
                }}
              />
              {/* Ping ring behind dot */}
              {groupIdx === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(212, 165, 116, 0.4)',
                    zIndex: 1,
                    animation: 'wc-timelineDotPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingLeft: 16,
                }}
              >
                <Calendar size={13} style={{ color: '#d4a574' }} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#d4a574',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {group.label}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: '#6b6358',
                    fontWeight: 500,
                  }}
                >
                  {group.relative}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#6b6358',
                    backgroundColor: 'rgba(212, 165, 116, 0.1)',
                    borderRadius: 8,
                    padding: '2px 8px',
                  }}
                >
                  {group.items.length} {group.items.length === 1 ? 'change' : 'changes'}
                </span>
              </div>
            </div>

            {/* Change cards in this group */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                paddingLeft: 20,
                position: 'relative',
                marginBottom: 24,
              }}
            >
              {/* Vertical timeline connector line */}
              <div
                style={{
                  position: 'absolute',
                  left: 5,
                  top: -8,
                  bottom: -16,
                  width: 2,
                  background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.2), rgba(30, 38, 56, 0.5))',
                  zIndex: 0,
                }}
              />

              {group.items.map((change) => {
                const catCfg = categoryConfig[change.category];
                const sentCfg = sentimentConfig[change.sentiment];
                const impCfg = impactConfig[change.impact];
                const ctCfg = changeTypeConfig[change.changeType];
                const CatIcon = catCfg.icon;
                const SentIcon = sentCfg.icon;
                const CtIcon = ctCfg.icon;
                const isExpanded = expandedIds.has(change.id);

                const sentimentBorderColor = sentCfg.borderColor;

                const currentGlobalIdx = globalItemIndex++;

                return (
                  <div
                    key={change.id}
                    style={{
                      position: 'relative',
                      paddingLeft: 24,
                      animation: mounted
                        ? `wc-cardEntrance 0.5s ${ease} ${0.5 + currentGlobalIdx * 0.06}s both`
                        : 'none',
                    }}
                  >
                    {/* Timeline dot for each item -- colored by category */}
                    <div
                      style={{
                        position: 'absolute',
                        left: -1,
                        top: 20,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: `${catCfg.color}20`,
                        border: `2px solid ${catCfg.color}`,
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: `all 0.3s ${ease}`,
                      }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: catCfg.color,
                        }}
                      />
                    </div>

                    {/* Glassmorphism Card with sentiment-colored left border */}
                    <div
                      className="card-interactive"
                      style={{
                        background: glass.bg,
                        backdropFilter: glass.blur,
                        WebkitBackdropFilter: glass.blur,
                        border: `1px solid ${glass.border}`,
                        borderRadius: 14,
                        padding: '18px 22px',
                        borderLeft: `3px solid ${sentimentBorderColor}`,
                        transition: `all 0.3s ${ease}`,
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onClick={() => toggleExpand(change.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = glass.hoverBorder;
                        e.currentTarget.style.borderLeftColor = sentCfg.color;
                        e.currentTarget.style.borderLeftWidth = '3px';
                        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${glass.hoverBorder}`;
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = glass.border;
                        e.currentTarget.style.borderLeftColor = sentimentBorderColor;
                        e.currentTarget.style.borderLeftWidth = '3px';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* "New" indicator overlay glow */}
                      {change.isNew && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 80,
                            height: 80,
                            background: 'radial-gradient(circle at top right, rgba(212, 165, 116, 0.1), transparent 70%)',
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      {/* Top row: badges + impact badge + timestamp */}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {/* New badge */}
                          {change.isNew && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontSize: 9,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#d4a574',
                                backgroundColor: 'rgba(212, 165, 116, 0.15)',
                                border: '1px solid rgba(212, 165, 116, 0.3)',
                                borderRadius: 6,
                                padding: '2px 7px',
                                animation: 'wc-newPulse 2.5s ease-in-out infinite',
                              }}
                            >
                              NEW
                            </span>
                          )}

                          {/* Change type badge */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: ctCfg.color,
                              backgroundColor: ctCfg.bg,
                              border: ctCfg.border,
                              borderRadius: 8,
                              padding: '3px 9px',
                            }}
                          >
                            <CtIcon size={10} />
                            {ctCfg.label}
                          </span>

                          {/* Sentiment indicator with trend arrow */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: sentCfg.bg,
                              borderRadius: 12,
                              padding: '3px 9px',
                            }}
                          >
                            <SentIcon size={11} style={{ color: sentCfg.color }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: sentCfg.color }}>
                              {sentCfg.label}
                            </span>
                          </div>

                          {/* Category badge with styled icon container */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: catCfg.color,
                              backgroundColor: catCfg.bg,
                              borderRadius: 12,
                              padding: '3px 10px',
                            }}
                          >
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 5,
                                background: `${catCfg.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CatIcon size={9} />
                            </div>
                            {catCfg.label}
                          </span>
                        </div>

                        {/* Right side: impact badge + timestamp + expand */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ImpactBadge level={change.impact} />
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              color: '#6b6358',
                              marginLeft: change.impact === 'high' ? 4 : 0,
                            }}
                          >
                            <Clock size={10} />
                            {change.timeAgo}
                          </span>
                          <ChevronRight
                            size={14}
                            style={{
                              color: '#4a443e',
                              transition: `transform 0.3s ${ease}`,
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Description with diff-style prefix and trend arrow */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <TrendArrow sentiment={change.sentiment} />
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#f0ebe4',
                            margin: 0,
                            lineHeight: 1.5,
                            flex: 1,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: 14,
                              fontWeight: 700,
                              color: change.sentiment === 'positive' ? '#34d399'
                                : change.sentiment === 'negative' ? '#f87171'
                                : '#d4a574',
                              marginRight: 6,
                              opacity: 0.7,
                            }}
                          >
                            {change.sentiment === 'positive' ? '+' : change.sentiment === 'negative' ? '!' : '~'}
                          </span>
                          <span
                            style={{
                              backgroundColor: change.sentiment === 'positive'
                                ? 'rgba(52, 211, 153, 0.06)'
                                : change.sentiment === 'negative'
                                  ? 'rgba(248, 113, 113, 0.06)'
                                  : 'rgba(212, 165, 116, 0.06)',
                              borderRadius: 4,
                              padding: '1px 4px',
                            }}
                          >
                            {change.description}
                          </span>
                        </h3>
                      </div>

                      {/* Collapsed preview */}
                      {!isExpanded && (
                        <p
                          style={{
                            fontSize: 13,
                            color: '#6b6358',
                            lineHeight: 1.5,
                            margin: '0 0 8px 36px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '85%',
                          }}
                        >
                          {change.detail}
                        </p>
                      )}

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div
                          style={{
                            marginLeft: 36,
                            animation: `wc-slideExpand 0.35s ${ease} both`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              color: '#a09888',
                              lineHeight: 1.7,
                              margin: '0 0 14px 0',
                            }}
                          >
                            {change.detail}
                          </p>

                          {/* Affected areas as colored tag pills */}
                          {change.affectedAreas.length > 0 && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                marginBottom: 10,
                                flexWrap: 'wrap',
                              }}
                            >
                              <Tag size={10} style={{ color: '#4a443e' }} />
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: '#4a443e',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                }}
                              >
                                Affected:
                              </span>
                              {change.affectedAreas.map((area, areaIdx) => (
                                <span
                                  key={areaIdx}
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 500,
                                    color: catCfg.color,
                                    backgroundColor: `${catCfg.color}10`,
                                    border: `1px solid ${catCfg.color}20`,
                                    borderRadius: 10,
                                    padding: '3px 10px',
                                    transition: `all 0.2s ${ease}`,
                                    cursor: 'default',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = `${catCfg.color}20`;
                                    e.currentTarget.style.borderColor = `${catCfg.color}40`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = `${catCfg.color}10`;
                                    e.currentTarget.style.borderColor = `${catCfg.color}20`;
                                  }}
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom: triggered by */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 11,
                          color: '#6b6358',
                          marginLeft: 36,
                        }}
                      >
                        <Zap size={10} style={{ color: '#4a443e' }} />
                        <span>
                          Triggered by:{' '}
                          <span style={{ color: '#8b7a6b', fontWeight: 500 }}>
                            {change.triggeredBy}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredChanges.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 40px',
              color: '#6b6358',
              background: glass.bg,
              backdropFilter: glass.blur,
              WebkitBackdropFilter: glass.blur,
              border: `1px solid ${glass.border}`,
              borderRadius: 14,
              animation: mounted ? `wc-fadeSlideUp 0.5s ${ease} 0.3s both` : 'none',
            }}
          >
            <Filter size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 14, margin: '0 0 4px', color: '#a09888' }}>No changes match your filters</p>
            <p style={{ fontSize: 12, margin: 0 }}>
              Try expanding the time period or selecting a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
