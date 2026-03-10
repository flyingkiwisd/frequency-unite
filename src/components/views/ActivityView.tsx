'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  Target,
  Scale,
  UserPlus,
  Calendar,
  Megaphone,
  Gem,
  TreePine,
  Globe,
  Network,
  Heart,
  Flag,
  BookOpen,
  Filter,
  Clock,
  Zap,
} from 'lucide-react';

type ActivityType = 'task' | 'okr' | 'governance' | 'member' | 'event' | 'milestone';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  timeAgo: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const activityData: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'governance',
    title: 'Teal Governance Model Adopted',
    description: 'Wisdom Council moved from Green-stage consensus to Teal governance with responsibility-weighted voice.',
    actor: 'Wisdom Council',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    icon: Scale,
    iconColor: '#d4a574',
    iconBg: 'rgba(212, 165, 116, 0.1)',
  },
  {
    id: 'act-2',
    type: 'task',
    title: 'Monthly Communication Cadence Established',
    description: 'Sian completed the member communication cadence setup ahead of schedule.',
    actor: 'Sian Hodges',
    timestamp: '2026-03-08',
    timeAgo: '1 day ago',
    icon: CheckCircle2,
    iconColor: '#6b8f71',
    iconBg: 'rgba(107, 143, 113, 0.1)',
  },
  {
    id: 'act-3',
    type: 'okr',
    title: 'OKR Progress: 144 Well-Stewards',
    description: 'Community membership objective updated to 45% progress. On track for H1 2026 target.',
    actor: 'James Hodges',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    icon: Target,
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139, 92, 246, 0.1)',
  },
  {
    id: 'act-4',
    type: 'task',
    title: 'Bi-weekly Node Sync Calls Established',
    description: 'Fairman completed setup of regular coordination calls across all active nodes.',
    actor: 'Alex James Fairman',
    timestamp: '2026-03-07',
    timeAgo: '2 days ago',
    icon: CheckCircle2,
    iconColor: '#6b8f71',
    iconBg: 'rgba(107, 143, 113, 0.1)',
  },
  {
    id: 'act-5',
    type: 'member',
    title: 'New Prospect Pipeline Growing',
    description: 'Maximillian is conducting essence interviews with 15 new prospects for Blue Spirit enrollment.',
    actor: 'Maximillian',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    icon: UserPlus,
    iconColor: '#38bdf8',
    iconBg: 'rgba(56, 189, 248, 0.1)',
  },
  {
    id: 'act-6',
    type: 'milestone',
    title: 'Megaphone Node: Studio Session Complete',
    description: 'Raamayan wrapped a powerful Anthem studio session. Cultural heartbeat of the movement is forming.',
    actor: 'Raamayan Ananda',
    timestamp: '2026-03-06',
    timeAgo: '3 days ago',
    icon: Megaphone,
    iconColor: '#f97316',
    iconBg: 'rgba(249, 115, 22, 0.1)',
  },
  {
    id: 'act-7',
    type: 'event',
    title: 'Blue Spirit 6.0 Confirmed',
    description: 'Blue Spirit event confirmed for July 18, 2026 in Nosara, Costa Rica. Registration opens April 15th.',
    actor: 'Core Stewardship Team',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    icon: Calendar,
    iconColor: '#d4a574',
    iconBg: 'rgba(212, 165, 116, 0.1)',
  },
  {
    id: 'act-8',
    type: 'governance',
    title: 'CEO Search Plan Approved',
    description: 'Board agreed to formally begin CEO search after Blue Spirit. James transitions to strategic advisor.',
    actor: 'Board',
    timestamp: '2026-03-05',
    timeAgo: '4 days ago',
    icon: Scale,
    iconColor: '#d4a574',
    iconBg: 'rgba(212, 165, 116, 0.1)',
  },
  {
    id: 'act-9',
    type: 'okr',
    title: 'DAF Structure Progress Update',
    description: 'DAF operational objective updated. Compliance checklist at 50%, fundraising at 20%. Status: at-risk.',
    actor: 'Colleen Galbraith',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    icon: Target,
    iconColor: '#f97316',
    iconBg: 'rgba(249, 115, 22, 0.1)',
  },
  {
    id: 'act-10',
    type: 'milestone',
    title: 'Capital Node: 8 Deals in Pipeline',
    description: 'Greg reports 8 deals under evaluation, narrowing to 5 finalists for Blue Spirit presentations.',
    actor: 'Greg Berry',
    timestamp: '2026-03-04',
    timeAgo: '5 days ago',
    icon: Gem,
    iconColor: '#fbbf24',
    iconBg: 'rgba(251, 191, 36, 0.1)',
  },
  {
    id: 'act-11',
    type: 'milestone',
    title: 'Bioregions: Nicoya Community Partnership',
    description: 'Gareth met with local community leaders. Nosara School confirmed for Phase 1 partnership.',
    actor: 'Gareth Hermann',
    timestamp: '2026-03-03',
    timeAgo: '6 days ago',
    icon: TreePine,
    iconColor: '#34d399',
    iconBg: 'rgba(52, 211, 153, 0.1)',
  },
  {
    id: 'act-12',
    type: 'task',
    title: 'Map Node MVP Specs In Progress',
    description: 'Fairman progressing on the coordination layer specs. The ecosystem nervous system is taking shape.',
    actor: 'Alex James Fairman',
    timestamp: '2026-03-03',
    timeAgo: '6 days ago',
    icon: Globe,
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139, 92, 246, 0.1)',
  },
  {
    id: 'act-13',
    type: 'governance',
    title: 'Node Lead Accountability Framework Set',
    description: 'Each node lead now required to submit quarterly OKRs, monthly updates, and join bi-weekly syncs.',
    actor: 'Core Stewardship Team',
    timestamp: '2026-03-02',
    timeAgo: '1 week ago',
    icon: Network,
    iconColor: '#a855f7',
    iconBg: 'rgba(168, 85, 247, 0.1)',
  },
  {
    id: 'act-14',
    type: 'event',
    title: 'Cabo 5.0 Completed Successfully',
    description: 'Flagship gathering concluded with 9.3/10 NPS. Teal governance adopted, DAF structure approved.',
    actor: 'Frequency Community',
    timestamp: '2026-02-02',
    timeAgo: '5 weeks ago',
    icon: Calendar,
    iconColor: '#d4a574',
    iconBg: 'rgba(212, 165, 116, 0.1)',
  },
  {
    id: 'act-15',
    type: 'member',
    title: 'Community Reaches ~65 Well-Stewards',
    description: 'Membership growing steadily toward the 144 target. Retention rate improving at 78%.',
    actor: 'Frequency Community',
    timestamp: '2026-02-28',
    timeAgo: '1 week ago',
    icon: Heart,
    iconColor: '#f472b6',
    iconBg: 'rgba(244, 114, 182, 0.1)',
  },
];

const typeConfig: Record<ActivityType, { label: string; color: string }> = {
  task: { label: 'Task', color: '#6b8f71' },
  okr: { label: 'OKR', color: '#8b5cf6' },
  governance: { label: 'Governance', color: '#d4a574' },
  member: { label: 'Member', color: '#38bdf8' },
  event: { label: 'Event', color: '#f97316' },
  milestone: { label: 'Milestone', color: '#fbbf24' },
};

export function ActivityView() {
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activityData;
    return activityData.filter((a) => a.type === filterType);
  }, [filterType]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activityData.length };
    activityData.forEach((a) => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div style={{ padding: '24px 32px', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Activity size={22} style={{ color: '#d4a574' }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', margin: 0, letterSpacing: '-0.01em' }}>
            Activity Feed
          </h1>
        </div>
        <p style={{ fontSize: 13, color: '#6b6358', margin: '4px 0 0' }}>
          Recent updates across all workstreams &middot; {activityData.length} activities
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'task', 'okr', 'governance', 'member', 'event', 'milestone'] as const).map(
          (type) => {
            const isActive = filterType === type;
            const config = type === 'all' ? { label: 'All', color: '#a09888' } : typeConfig[type];
            const count = typeCounts[type] || 0;

            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: isActive ? `1px solid ${config.color}44` : '1px solid #1e2638',
                  cursor: 'pointer',
                  backgroundColor: isActive ? `${config.color}18` : 'transparent',
                  color: isActive ? config.color : '#6b6358',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
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
                {config.label}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    backgroundColor: isActive ? `${config.color}22` : '#1e2638',
                    color: isActive ? config.color : '#6b6358',
                    borderRadius: 8,
                    padding: '1px 6px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Activity Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div
          style={{
            position: 'absolute',
            left: 19,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: '#1e2638',
            borderRadius: 1,
          }}
        />

        {filteredActivities.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === filteredActivities.length - 1;
          const tConfig = typeConfig[item.type];

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: 16,
                marginBottom: isLast ? 0 : 4,
                position: 'relative',
              }}
            >
              {/* Timeline dot + icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: item.iconBg,
                  border: `2px solid ${item.iconColor}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                <Icon size={16} style={{ color: item.iconColor }} />
              </div>

              {/* Content Card */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#0f1219',
                  border: '1px solid #1e2638',
                  borderRadius: 12,
                  padding: '14px 18px',
                  marginBottom: 12,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2e3a4e';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e2638';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0ebe4', margin: 0, lineHeight: 1.4 }}>
                      {item.title}
                    </h3>
                  </div>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      backgroundColor: `${tConfig.color}15`,
                      color: tConfig.color,
                      fontSize: 10,
                      fontWeight: 600,
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tConfig.label}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: 12, color: '#a09888', lineHeight: 1.5, margin: '0 0 8px' }}>
                  {item.description}
                </p>

                {/* Bottom meta */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#6b6358',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={10} style={{ color: '#4a443e' }} />
                    {item.actor}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} />
                    {item.timeAgo}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b6358' }}>
            <Filter size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
            <p style={{ fontSize: 13, margin: 0 }}>No activities match the selected filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
