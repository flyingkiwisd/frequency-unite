'use client';

import { useState } from 'react';
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Users,
  TrendingDown,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquare,
  Activity,
  ArrowRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Member {
  id: string;
  name: string;
  healthScore: number;
  status: 'Healthy' | 'Watch' | 'At Risk';
  lastEngagement: string;
  membershipTier: 'Individual' | 'Couple';
  monthlyRate: number;
  eventsAttended: number;
  totalEvents: number;
  podParticipation: string;
  communicationsOpened: number;
  npsScore: number;
  renewalDate: string;
  joinDate: string;
  notes: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Data
// ─────────────────────────────────────────────────────────────────────────────
const defaultMembers: Member[] = [
  {
    id: 'mem-1',
    name: 'Michael Chen',
    healthScore: 95,
    status: 'Healthy',
    lastEngagement: '2 days ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 4,
    totalEvents: 4,
    podParticipation: 'Capital pod — active contributor',
    communicationsOpened: 18,
    npsScore: 10,
    renewalDate: 'Sep 2026',
    joinDate: 'Sep 2025',
    notes: 'Highly engaged. Consistently attends all events and pod sessions.',
  },
  {
    id: 'mem-2',
    name: 'Sarah Martinez',
    healthScore: 88,
    status: 'Healthy',
    lastEngagement: '5 days ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 3,
    totalEvents: 4,
    podParticipation: 'Bioregions pod — new member',
    communicationsOpened: 14,
    npsScore: 9,
    renewalDate: 'Jan 2027',
    joinDate: 'Jan 2026',
    notes: 'New member since Cabo retreat. Onboarding well, strong early engagement.',
  },
  {
    id: 'mem-3',
    name: 'David Thornton',
    healthScore: 72,
    status: 'Watch',
    lastEngagement: '18 days ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 2,
    totalEvents: 4,
    podParticipation: 'Capital pod — missed last 2 sessions',
    communicationsOpened: 8,
    npsScore: 7,
    renewalDate: 'Jun 2026',
    joinDate: 'Jun 2025',
    notes: 'Missed last 2 pod sessions. May have scheduling conflicts — follow up.',
  },
  {
    id: 'mem-4',
    name: 'Elena Vasquez',
    healthScore: 91,
    status: 'Healthy',
    lastEngagement: '3 days ago',
    membershipTier: 'Couple',
    monthlyRate: 1700,
    eventsAttended: 4,
    totalEvents: 4,
    podParticipation: 'Thesis of Change pod — co-facilitator',
    communicationsOpened: 20,
    npsScore: 10,
    renewalDate: 'Aug 2026',
    joinDate: 'Aug 2025',
    notes: 'Couple membership. Both partners highly engaged. Potential ambassador.',
  },
  {
    id: 'mem-5',
    name: 'Robert Kim',
    healthScore: 45,
    status: 'At Risk',
    lastEngagement: '62 days ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 0,
    totalEvents: 4,
    podParticipation: 'None — not attending',
    communicationsOpened: 2,
    npsScore: 4,
    renewalDate: 'Apr 2026',
    joinDate: 'Apr 2025',
    notes: 'No engagement in 60+ days. Multiple outreach attempts unanswered.',
  },
  {
    id: 'mem-6',
    name: 'Jennifer Walsh',
    healthScore: 83,
    status: 'Healthy',
    lastEngagement: '7 days ago',
    membershipTier: 'Couple',
    monthlyRate: 1700,
    eventsAttended: 3,
    totalEvents: 4,
    podParticipation: 'Capital pod — regular attendee',
    communicationsOpened: 15,
    npsScore: 9,
    renewalDate: 'Nov 2026',
    joinDate: 'Jul 2025',
    notes: 'Recently upgraded from Individual to Couple tier. Partner joining events.',
  },
  {
    id: 'mem-7',
    name: 'Marcus Johnson',
    healthScore: 58,
    status: 'Watch',
    lastEngagement: '25 days ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 1,
    totalEvents: 4,
    podParticipation: 'Bioregions pod — sporadic',
    communicationsOpened: 6,
    npsScore: 6,
    renewalDate: 'May 2026',
    joinDate: 'May 2025',
    notes: 'Payment issue flagged — card declined last month. Resolved but watching.',
  },
  {
    id: 'mem-8',
    name: 'Lisa Park',
    healthScore: 94,
    status: 'Healthy',
    lastEngagement: '1 day ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 4,
    totalEvents: 4,
    podParticipation: 'Capitalism 2.0 pod — facilitator',
    communicationsOpened: 22,
    npsScore: 10,
    renewalDate: 'Oct 2026',
    joinDate: 'Oct 2025',
    notes: 'Pod facilitator. One of our most engaged members. Key community anchor.',
  },
  {
    id: 'mem-9',
    name: 'Thomas Reed',
    healthScore: 38,
    status: 'At Risk',
    lastEngagement: '45 days ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 0,
    totalEvents: 4,
    podParticipation: 'None — dropped out',
    communicationsOpened: 1,
    npsScore: 3,
    renewalDate: 'Mar 2026',
    joinDate: 'Mar 2025',
    notes: 'Considering cancellation. Expressed dissatisfaction with event scheduling.',
  },
  {
    id: 'mem-10',
    name: 'Amanda Foster',
    healthScore: 76,
    status: 'Watch',
    lastEngagement: '14 days ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 2,
    totalEvents: 4,
    podParticipation: 'Thesis of Change pod — intermittent',
    communicationsOpened: 10,
    npsScore: 7,
    renewalDate: 'Jul 2026',
    joinDate: 'Jul 2025',
    notes: 'Travel schedule conflicts with events. Engaged when available.',
  },
  {
    id: 'mem-11',
    name: 'Daniel Okafor',
    healthScore: 89,
    status: 'Healthy',
    lastEngagement: '4 days ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 3,
    totalEvents: 4,
    podParticipation: 'Bioregions node — active contributor',
    communicationsOpened: 16,
    npsScore: 9,
    renewalDate: 'Dec 2026',
    joinDate: 'Dec 2025',
    notes: 'Active in Bioregions node. Contributing to regenerative agriculture projects.',
  },
  {
    id: 'mem-12',
    name: 'Rachel Green',
    healthScore: 67,
    status: 'Watch',
    lastEngagement: '21 days ago',
    membershipTier: 'Individual',
    monthlyRate: 1200,
    eventsAttended: 2,
    totalEvents: 4,
    podParticipation: 'Capital pod — declining attendance',
    communicationsOpened: 7,
    npsScore: 6,
    renewalDate: 'Aug 2026',
    joinDate: 'Aug 2025',
    notes: 'Engagement declining over last 2 months. Was previously very active.',
  },
];

const alerts = [
  {
    type: 'danger' as const,
    message: 'Thomas Reed renewal is this month — considering cancellation. Immediate personal outreach needed.',
    action: 'Schedule 1:1 call with James',
  },
  {
    type: 'danger' as const,
    message: 'Robert Kim has not engaged in 60+ days. Multiple outreach attempts unanswered.',
    action: 'Final personal outreach before pause',
  },
  {
    type: 'warning' as const,
    message: 'Rachel Green engagement declining — was previously one of our most active members.',
    action: 'Check in on experience',
  },
  {
    type: 'warning' as const,
    message: 'Marcus Johnson had a payment issue last month. Card declined then resolved.',
    action: 'Monitor next billing cycle',
  },
  {
    type: 'info' as const,
    message: 'Jennifer Walsh upgraded to Couple tier — partner is now attending events.',
    action: 'Send welcome package to partner',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const statusConfig = {
  Healthy: { color: 'text-success', bg: 'bg-success/15', border: 'border-success/30', icon: CheckCircle },
  Watch: { color: 'text-warning', bg: 'bg-warning/15', border: 'border-warning/30', icon: Clock },
  'At Risk': { color: 'text-danger', bg: 'bg-danger/15', border: 'border-danger/30', icon: AlertTriangle },
};

const alertTypeConfig = {
  danger: { bg: 'bg-danger/10', border: 'border-danger/30', color: 'text-danger', icon: AlertTriangle },
  warning: { bg: 'bg-warning/10', border: 'border-warning/30', color: 'text-warning', icon: Clock },
  info: { bg: 'bg-accent-sage/10', border: 'border-accent-sage/30', color: 'text-accent-sage', icon: CheckCircle },
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'bg-success';
  if (score >= 50) return 'bg-warning';
  return 'bg-danger';
};

const scoreTextColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function MemberHealthView() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const sortedMembers = [...defaultMembers].sort((a, b) => a.healthScore - b.healthScore);
  const filteredMembers =
    filterStatus === 'all'
      ? sortedMembers
      : sortedMembers.filter((m) => m.status === filterStatus);

  const totalMembers = defaultMembers.length;
  const avgScore = Math.round(
    defaultMembers.reduce((sum, m) => sum + m.healthScore, 0) / defaultMembers.length,
  );
  const healthyCount = defaultMembers.filter((m) => m.status === 'Healthy').length;
  const watchCount = defaultMembers.filter((m) => m.status === 'Watch').length;
  const atRiskCount = defaultMembers.filter((m) => m.status === 'At Risk').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="gradient-text">Member Health</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          Composite health scoring for every well-steward. Monitor engagement,
          satisfaction, and proactively nurture your community.
        </p>
      </div>

      {/* ── Proactive Alerts ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '50ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-semibold text-text-primary">Proactive Alerts</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning">
            {alerts.length}
          </span>
        </div>
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const alertConf = alertTypeConfig[alert.type];
            const AlertIcon = alertConf.icon;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${alertConf.bg} border ${alertConf.border} rounded-xl p-4`}
              >
                <AlertIcon className={`w-5 h-5 shrink-0 mt-0.5 ${alertConf.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-secondary">{alert.action}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Overall Health Summary ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-5 gap-4 animate-fade-in"
        style={{ animationDelay: '100ms', opacity: 0 }}
      >
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Total Members</p>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <span className="text-3xl font-bold text-text-primary">~65</span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Tracked: {totalMembers} sample
          </p>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Healthy</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-3xl font-bold text-success">{healthyCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Score 80+</p>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Watch</p>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            <span className="text-3xl font-bold text-warning">{watchCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Score 50-79</p>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">At Risk</p>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <span className="text-3xl font-bold text-danger">{atRiskCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Score &lt;50</p>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Avg Health Score</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${scoreTextColor(avgScore)}`}>{avgScore}</span>
            <span className="text-text-muted text-sm mb-1">/100</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${scoreColor(avgScore)}`}
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Filter Controls ── */}
      <div
        className="flex items-center gap-3 animate-fade-in"
        style={{ animationDelay: '150ms', opacity: 0 }}
      >
        <Filter className="w-4 h-4 text-text-muted" />
        <span className="text-xs text-text-muted uppercase tracking-wider">Filter:</span>
        {['all', 'Healthy', 'Watch', 'At Risk'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === status
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'bg-surface-2 text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            {status === 'all' ? 'All Members' : status}
          </button>
        ))}
        <span className="ml-auto text-xs text-text-muted">
          Showing {filteredMembers.length} of {totalMembers}
        </span>
      </div>

      {/* ── Member Health Cards ── */}
      <div
        className="space-y-3 animate-fade-in"
        style={{ animationDelay: '200ms', opacity: 0 }}
      >
        {filteredMembers.map((member) => {
          const config = statusConfig[member.status];
          const StatusIcon = config.icon;
          const isExpanded = expandedMember === member.id;

          return (
            <div
              key={member.id}
              className={`w-full text-left glow-card bg-surface border rounded-xl p-5 transition-all duration-300 hover:border-border-2 ${
                isExpanded ? config.border : 'border-border'
              }`}
            >
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}
              >
                {/* Name & Status */}
                <div className="flex items-center gap-3 sm:w-52 shrink-0">
                  <StatusIcon className={`w-5 h-5 shrink-0 ${config.color}`} />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{member.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      {member.status}
                    </span>
                  </div>
                </div>

                {/* Health Score Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${scoreColor(member.healthScore)}`}
                        style={{ width: `${member.healthScore}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-12 text-right ${scoreTextColor(member.healthScore)}`}>
                      {member.healthScore}
                    </span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex items-center gap-4 sm:w-80 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-text-muted">Tier</p>
                    <p className="text-sm font-medium text-text-primary">{member.membershipTier}</p>
                    <p className="text-[10px] text-accent">${member.monthlyRate.toLocaleString()}/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">Last Active</p>
                    <p className="text-sm font-medium text-text-secondary">{member.lastEngagement}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">NPS</p>
                    <p className={`text-sm font-bold ${
                      member.npsScore >= 9 ? 'text-success' : member.npsScore >= 7 ? 'text-warning' : 'text-danger'
                    }`}>
                      {member.npsScore}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-surface-2 rounded-lg p-3">
                      <p className="text-xs text-text-muted mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Events Attended
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-violet rounded-full"
                            style={{ width: `${(member.eventsAttended / member.totalEvents) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-text-primary">
                          {member.eventsAttended}/{member.totalEvents}
                        </span>
                      </div>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-3">
                      <p className="text-xs text-text-muted mb-1 flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> Pod Participation
                      </p>
                      <p className="text-xs text-text-secondary">{member.podParticipation}</p>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-3">
                      <p className="text-xs text-text-muted mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" /> Comms Opened
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-sky rounded-full"
                            style={{ width: `${Math.min((member.communicationsOpened / 22) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-text-primary">
                          {member.communicationsOpened}
                        </span>
                      </div>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-3">
                      <p className="text-xs text-text-muted mb-1 flex items-center gap-1.5">
                        <Star className="w-3 h-3" /> NPS Score
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          member.npsScore >= 9 ? 'text-success' : member.npsScore >= 7 ? 'text-warning' : 'text-danger'
                        }`}>
                          {member.npsScore}
                        </span>
                        <span className="text-xs text-text-muted">/10</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          member.npsScore >= 9
                            ? 'bg-success/15 text-success'
                            : member.npsScore >= 7
                              ? 'bg-warning/15 text-warning'
                              : 'bg-danger/15 text-danger'
                        }`}>
                          {member.npsScore >= 9 ? 'Promoter' : member.npsScore >= 7 ? 'Passive' : 'Detractor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-surface-2 rounded-lg p-3">
                      <p className="text-xs text-text-muted mb-1">Member Since</p>
                      <p className="text-sm text-text-primary font-medium">{member.joinDate}</p>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-3">
                      <p className="text-xs text-text-muted mb-1">Renewal Date</p>
                      <p className="text-sm text-accent font-medium">{member.renewalDate}</p>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-3">
                      <p className="text-xs text-text-muted mb-1">Notes</p>
                      <p className="text-xs text-text-secondary leading-relaxed">{member.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Engagement Distribution ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '275ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Engagement Distribution</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Health Score Distribution */}
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Health Score Bands</p>
            <div className="space-y-2">
              {[
                { label: '90-100 (Excellent)', count: defaultMembers.filter(m => m.healthScore >= 90).length, color: 'bg-success', pct: (defaultMembers.filter(m => m.healthScore >= 90).length / totalMembers) * 100 },
                { label: '80-89 (Good)', count: defaultMembers.filter(m => m.healthScore >= 80 && m.healthScore < 90).length, color: 'bg-accent-sage', pct: (defaultMembers.filter(m => m.healthScore >= 80 && m.healthScore < 90).length / totalMembers) * 100 },
                { label: '50-79 (Watch)', count: defaultMembers.filter(m => m.healthScore >= 50 && m.healthScore < 80).length, color: 'bg-warning', pct: (defaultMembers.filter(m => m.healthScore >= 50 && m.healthScore < 80).length / totalMembers) * 100 },
                { label: '<50 (At Risk)', count: defaultMembers.filter(m => m.healthScore < 50).length, color: 'bg-danger', pct: (defaultMembers.filter(m => m.healthScore < 50).length / totalMembers) * 100 },
              ].map((band) => (
                <div key={band.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-text-muted w-28 shrink-0">{band.label}</span>
                  <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full ${band.color} rounded-full`} style={{ width: `${band.pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-text-primary w-6 text-right">{band.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Membership Tier Breakdown */}
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Membership Tiers</p>
            <div className="space-y-3">
              {[
                { label: 'Individual', count: defaultMembers.filter(m => m.membershipTier === 'Individual').length, rate: '$1,200/mo', color: 'bg-accent' },
                { label: 'Couple', count: defaultMembers.filter(m => m.membershipTier === 'Couple').length, rate: '$1,700/mo', color: 'bg-accent-violet' },
              ].map((tier) => (
                <div key={tier.label} className="bg-surface-2 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">{tier.label}</span>
                    <span className="text-xs text-accent">{tier.rate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tier.color}`} />
                    <span className="text-xs text-text-secondary">{tier.count} members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NPS Distribution */}
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">NPS Breakdown</p>
            <div className="space-y-2">
              {[
                { label: 'Promoters (9-10)', count: defaultMembers.filter(m => m.npsScore >= 9).length, color: 'bg-success' },
                { label: 'Passives (7-8)', count: defaultMembers.filter(m => m.npsScore >= 7 && m.npsScore < 9).length, color: 'bg-warning' },
                { label: 'Detractors (0-6)', count: defaultMembers.filter(m => m.npsScore < 7).length, color: 'bg-danger' },
              ].map((seg) => (
                <div key={seg.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-text-muted w-32 shrink-0">{seg.label}</span>
                  <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${seg.color} rounded-full`}
                      style={{ width: `${(seg.count / totalMembers) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-text-primary w-6 text-right">{seg.count}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Net Promoter Score</span>
                  <span className="text-lg font-bold text-success">
                    {Math.round(
                      ((defaultMembers.filter(m => m.npsScore >= 9).length -
                        defaultMembers.filter(m => m.npsScore < 7).length) /
                        totalMembers) * 100
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
