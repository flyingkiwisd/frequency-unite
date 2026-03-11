'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
  Ticket,
  DollarSign,
  Mic2,
  BookOpen,
  Circle,
  Loader,
  Filter,
  Timer,
} from 'lucide-react';
import { type FrequencyEvent } from '@/lib/data';
import { useFrequencyData } from '@/lib/supabase/DataProvider';

// ─── Types ───

type FilterTab = 'all' | 'upcoming' | 'past';

// ─── Constants ───

const statusOrder: Record<FrequencyEvent['status'], number> = {
  upcoming: 0,
  completed: 1,
  planning: 2,
};

const statusConfig: Record<
  FrequencyEvent['status'],
  { label: string; bg: string; text: string; border: string; glow?: string }
> = {
  completed: {
    label: 'Completed',
    bg: 'rgba(107, 143, 113, 0.15)',
    text: '#6b8f71',
    border: '1px solid rgba(107, 143, 113, 0.3)',
  },
  upcoming: {
    label: 'Upcoming',
    bg: 'rgba(212, 165, 116, 0.15)',
    text: '#d4a574',
    border: '1px solid rgba(212, 165, 116, 0.4)',
    glow: '0 0 20px rgba(212, 165, 116, 0.25)',
  },
  planning: {
    label: 'Planning',
    bg: 'rgba(139, 92, 246, 0.15)',
    text: '#8b5cf6',
    border: '1px solid rgba(139, 92, 246, 0.3)',
  },
};

// Gradient header colors per event status
const headerGradients: Record<FrequencyEvent['status'], string> = {
  upcoming: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(139, 92, 246, 0.1), rgba(212, 165, 116, 0.05))',
  completed: 'linear-gradient(135deg, rgba(107, 143, 113, 0.12), rgba(96, 165, 250, 0.08), rgba(107, 143, 113, 0.04))',
  planning: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(244, 114, 182, 0.08), rgba(139, 92, 246, 0.04))',
};

// Status cycle order for inline editing
const statusCycle: FrequencyEvent['status'][] = ['upcoming', 'planning', 'completed'];

// ─── Helpers ───

function parseEventDate(dateStr: string): Date | null {
  // Handle formats like "July 18, 2026", "January 26 - February 2, 2026", "June 2025", "October 2026"
  const fullDateMatch = dateStr.match(/(\w+)\s+(\d+),?\s+(\d{4})/);
  if (fullDateMatch) {
    return new Date(`${fullDateMatch[1]} ${fullDateMatch[2]}, ${fullDateMatch[3]}`);
  }
  // Range format - use end date for "past" check, start date for countdown
  const rangeMatch = dateStr.match(/(\w+)\s+(\d+)\s*-\s*(\w+)\s+(\d+),?\s+(\d{4})/);
  if (rangeMatch) {
    return new Date(`${rangeMatch[1]} ${rangeMatch[2]}, ${rangeMatch[5]}`);
  }
  // Month Year format
  const monthYearMatch = dateStr.match(/(\w+)\s+(\d{4})/);
  if (monthYearMatch) {
    return new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`);
  }
  return null;
}

function getDaysUntil(dateStr: string): number | null {
  const date = parseEventDate(dateStr);
  if (!date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCalendarParts(dateStr: string): { day: string; month: string; year: string } {
  const date = parseEventDate(dateStr);
  if (!date || isNaN(date.getTime())) {
    // fallback for month-only dates
    const monthYearMatch = dateStr.match(/(\w+)\s+(\d{4})/);
    if (monthYearMatch) {
      return {
        day: '--',
        month: monthYearMatch[1].slice(0, 3).toUpperCase(),
        year: monthYearMatch[2],
      };
    }
    return { day: '--', month: '---', year: '----' };
  }
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return {
    day: String(date.getDate()),
    month: months[date.getMonth()],
    year: String(date.getFullYear()),
  };
}

function parseCapacity(capacityStr: string): { sold?: number; total: number; display: string } {
  // Formats: "60 attendees", "50-80 participants", "80-100", "150-200 (50-60 stewards + 25-30 new + ...)"
  const rangeMatch = capacityStr.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    return { total: parseInt(rangeMatch[2]), display: capacityStr };
  }
  const singleMatch = capacityStr.match(/(\d+)/);
  if (singleMatch) {
    return { total: parseInt(singleMatch[1]), display: capacityStr };
  }
  return { total: 0, display: capacityStr };
}

// ─── Component ───

export function EventsView() {
  const { events, updateEvent } = useFrequencyData();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [mounted, setMounted] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const sorted = useMemo(() => {
    return [...events].sort(
      (a, b) => statusOrder[a.status] - statusOrder[b.status],
    );
  }, [events]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return sorted;
    if (activeTab === 'upcoming') return sorted.filter((e) => e.status === 'upcoming' || e.status === 'planning');
    return sorted.filter((e) => e.status === 'completed');
  }, [sorted, activeTab]);

  // Staggered entrance animation
  useEffect(() => {
    if (!mounted) return;
    setVisibleCards({});
    filtered.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleCards((prev) => ({ ...prev, [idx]: true }));
      }, 120 * idx);
    });
  }, [mounted, filtered]);

  const tabCounts = useMemo(() => ({
    all: events.length,
    upcoming: events.filter((e) => e.status === 'upcoming' || e.status === 'planning').length,
    past: events.filter((e) => e.status === 'completed').length,
  }), [events]);

  // Cycle status: upcoming -> planning -> completed -> upcoming
  const handleStatusCycle = useCallback(async (event: FrequencyEvent) => {
    const currentIdx = statusCycle.indexOf(event.status);
    const nextIdx = (currentIdx + 1) % statusCycle.length;
    const newStatus = statusCycle[nextIdx];
    try {
      await updateEvent(event.id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  }, [updateEvent]);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 960, margin: '0 auto' }}>
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
          <Calendar size={28} style={{ color: '#d4a574' }} />
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#f0ebe4',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Gatherings & Events
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
          Frequency gatherings are where coherence meets action. Each event
          deepens our bond and accelerates our mission.
        </p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 28,
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderRadius: 12,
          padding: 4,
          border: '1px solid #1e2638',
          width: 'fit-content',
        }}
      >
        {([
          { key: 'all' as FilterTab, label: 'All Events', icon: Filter },
          { key: 'upcoming' as FilterTab, label: 'Upcoming', icon: Sparkles },
          { key: 'past' as FilterTab, label: 'Past', icon: CheckCircle2 },
        ]).map((tab) => {
          const isActiveTab = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: isActiveTab ? 600 : 500,
                color: isActiveTab ? '#f0ebe4' : '#6b6358',
                backgroundColor: isActiveTab ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
                border: isActiveTab ? '1px solid rgba(212, 165, 116, 0.2)' : '1px solid transparent',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActiveTab) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.color = '#a09888';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActiveTab) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#6b6358';
                }
              }}
            >
              <Icon size={13} />
              {tab.label}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: isActiveTab ? 'rgba(212, 165, 116, 0.2)' : 'rgba(255,255,255,0.06)',
                  color: isActiveTab ? '#d4a574' : '#6b6358',
                  padding: '1px 7px',
                  borderRadius: 8,
                  minWidth: 18,
                  textAlign: 'center',
                }}
              >
                {tabCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Blue Spirit 6.0 War Room ── */}
      {(activeTab === 'all' || activeTab === 'upcoming') && (
        <div
          style={{
            marginBottom: 40,
            backgroundColor: 'rgba(212, 165, 116, 0.06)',
            border: '1px solid rgba(212, 165, 116, 0.25)',
            borderRadius: 16,
            padding: 28,
            boxShadow:
              '0 0 40px rgba(212, 165, 116, 0.08), inset 0 0 40px rgba(212, 165, 116, 0.02)',
          }}
        >
          {/* War Room Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(212, 165, 116, 0.15)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(212, 165, 116, 0.15)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                boxShadow: '0 0 16px rgba(212, 165, 116, 0.25)',
              }}
            >
              <Sparkles size={20} style={{ color: '#d4a574' }} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Blue Spirit 6.0 War Room
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: '#a09888',
                  margin: '2px 0 0 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                }}
              >
                Command Center
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Tickets Sold */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <Ticket size={14} style={{ color: '#d4a574' }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#6b6358',
                  }}
                >
                  Tickets Sold
                </span>
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  marginBottom: 4,
                }}
              >
                32{' '}
                <span style={{ fontSize: 14, color: '#6b6358', fontWeight: 500 }}>
                  / 70
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.round((32 / 70) * 100)}%`,
                    height: '100%',
                    backgroundColor: '#d4a574',
                    borderRadius: 2,
                    boxShadow: '0 0 8px rgba(212, 165, 116, 0.4)',
                  }}
                />
              </div>
            </div>

            {/* Revenue */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <DollarSign size={14} style={{ color: '#d4a574' }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#6b6358',
                  }}
                >
                  Revenue
                </span>
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#f0ebe4',
                }}
              >
                $38K{' '}
                <span style={{ fontSize: 14, color: '#6b6358', fontWeight: 500 }}>
                  / $85K target
                </span>
              </div>
            </div>

            {/* Days Until Event */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <Clock size={14} style={{ color: '#d4a574' }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#6b6358',
                  }}
                >
                  Days Until Event
                </span>
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#f0ebe4',
                }}
              >
                {getDaysUntil('July 18, 2026') ?? 130}
              </div>
            </div>

            {/* Waitlist */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <Users size={14} style={{ color: '#d4a574' }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#6b6358',
                  }}
                >
                  Waitlist
                </span>
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#f0ebe4',
                }}
              >
                0
              </div>
            </div>
          </div>

          {/* Programming Status + Logistics — two-column layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            {/* Programming Status */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#6b6358',
                  marginBottom: 14,
                }}
              >
                Programming Status
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#b0a898',
                  }}
                >
                  <Mic2 size={14} style={{ color: '#d4a574', flexShrink: 0 }} />
                  <span>Sessions Designed</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontWeight: 600,
                      color: '#f0ebe4',
                    }}
                  >
                    8 / 12
                  </span>
                </li>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#b0a898',
                  }}
                >
                  <Users size={14} style={{ color: '#d4a574', flexShrink: 0 }} />
                  <span>Facilitators Confirmed</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontWeight: 600,
                      color: '#f0ebe4',
                    }}
                  >
                    6 / 10
                  </span>
                </li>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#b0a898',
                  }}
                >
                  <BookOpen
                    size={14}
                    style={{ color: '#d4a574', flexShrink: 0 }}
                  />
                  <span>Pre-reads Distributed</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontWeight: 600,
                      color: '#f0ebe4',
                    }}
                  >
                    3 / 8
                  </span>
                </li>
              </ul>
            </div>

            {/* Logistics Checklist */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#6b6358',
                  marginBottom: 14,
                }}
              >
                Logistics Checklist
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#b0a898',
                  }}
                >
                  <CheckCircle2
                    size={14}
                    style={{ color: '#6b8f71', flexShrink: 0 }}
                  />
                  <span>Venue confirmed</span>
                </li>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#b0a898',
                  }}
                >
                  <Loader
                    size={14}
                    style={{ color: '#d4a574', flexShrink: 0 }}
                  />
                  <span>Travel coordination</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#d4a574',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    In Progress
                  </span>
                </li>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#b0a898',
                  }}
                >
                  <Circle
                    size={14}
                    style={{ color: '#6b6358', flexShrink: 0 }}
                  />
                  <span>Rooming assignments</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#6b6358',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Pending
                  </span>
                </li>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#b0a898',
                  }}
                >
                  <Loader
                    size={14}
                    style={{ color: '#d4a574', flexShrink: 0 }}
                  />
                  <span>Pre-event materials</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#d4a574',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    In Progress
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Event Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {filtered.map((event, idx) => {
          const config = statusConfig[event.status];
          const isUpcoming = event.status === 'upcoming';
          const isPlanning = event.status === 'planning';
          const isCompleted = event.status === 'completed';
          const daysUntil = getDaysUntil(event.date);
          const cal = getCalendarParts(event.date);
          const capacity = parseCapacity(event.capacity);
          const isVisible = visibleCards[idx] ?? false;

          // Simulated ticket data for upcoming events
          const ticketsSold = isUpcoming ? 32 : isCompleted ? capacity.total : 0;
          const ticketsTotal = capacity.total;
          const ticketPercent = ticketsTotal > 0 ? Math.round((ticketsSold / ticketsTotal) * 100) : 0;

          return (
            <div
              key={event.id}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            >
              {/* Event Card */}
              <div
                style={{
                  backgroundColor: isUpcoming
                    ? 'rgba(212, 165, 116, 0.06)'
                    : '#131720',
                  border: isUpcoming
                    ? '1px solid rgba(212, 165, 116, 0.25)'
                    : '1px solid #1e2638',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: isUpcoming
                    ? '0 0 40px rgba(212, 165, 116, 0.08), inset 0 0 40px rgba(212, 165, 116, 0.02)'
                    : 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isUpcoming) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2e3a4e';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUpcoming) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#1e2638';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Gradient Header */}
                <div
                  style={{
                    background: headerGradients[event.status],
                    padding: '20px 28px',
                    borderBottom: `1px solid ${isUpcoming ? 'rgba(212, 165, 116, 0.12)' : 'rgba(255,255,255,0.04)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative SVG pattern in header */}
                  <svg
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 200,
                      height: '100%',
                      opacity: 0.15,
                    }}
                    viewBox="0 0 200 80"
                    preserveAspectRatio="none"
                  >
                    <circle cx="180" cy="10" r="50" fill={isUpcoming ? '#d4a574' : isCompleted ? '#6b8f71' : '#8b5cf6'} opacity="0.3" />
                    <circle cx="140" cy="60" r="30" fill={isUpcoming ? '#8b5cf6' : isCompleted ? '#60a5fa' : '#f472b6'} opacity="0.2" />
                  </svg>

                  {/* Calendar Date Display */}
                  <div
                    style={{
                      width: 64,
                      height: 72,
                      borderRadius: 12,
                      backgroundColor: isUpcoming
                        ? 'rgba(212, 165, 116, 0.12)'
                        : isCompleted
                          ? 'rgba(107, 143, 113, 0.1)'
                          : 'rgba(139, 92, 246, 0.1)',
                      border: `1px solid ${isUpcoming ? 'rgba(212, 165, 116, 0.25)' : isCompleted ? 'rgba(107, 143, 113, 0.2)' : 'rgba(139, 92, 246, 0.2)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Month header */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 20,
                        backgroundColor: isUpcoming
                          ? 'rgba(212, 165, 116, 0.2)'
                          : isCompleted
                            ? 'rgba(107, 143, 113, 0.15)'
                            : 'rgba(139, 92, 246, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: isUpcoming ? '#d4a574' : isCompleted ? '#6b8f71' : '#8b5cf6',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {cal.month}
                      </span>
                    </div>
                    {/* Day number */}
                    <span
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: '#f0ebe4',
                        lineHeight: 1,
                        marginTop: 12,
                      }}
                    >
                      {cal.day}
                    </span>
                    {/* Year */}
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 500,
                        color: '#6b6358',
                        marginTop: 1,
                      }}
                    >
                      {cal.year}
                    </span>
                  </div>

                  {/* Event title + meta */}
                  <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h2
                        style={{
                          fontSize: isUpcoming ? 22 : 19,
                          fontWeight: 700,
                          color: isUpcoming ? '#f0ebe4' : '#d8cfc4',
                          margin: 0,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {event.name}
                      </h2>
                      {isUpcoming && (
                        <Star
                          size={16}
                          style={{ color: '#d4a574', flexShrink: 0 }}
                          fill="#d4a574"
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        fontSize: 12,
                        color: '#8b7a6b',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} />
                        {event.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        {event.date}
                      </span>
                    </div>
                  </div>

                  {/* Status badge (clickable) + countdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, position: 'relative', zIndex: 1 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusCycle(event);
                      }}
                      title={`Click to change status (current: ${config.label})`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: config.text,
                        backgroundColor: config.bg,
                        border: config.border,
                        borderRadius: 20,
                        padding: '4px 12px',
                        boxShadow: config.glow ?? 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `${config.glow ?? 'none'}, 0 0 0 2px ${config.text}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = config.glow ?? 'none';
                      }}
                    >
                      {isCompleted && <CheckCircle2 size={12} />}
                      {isUpcoming && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#d4a574',
                            boxShadow: '0 0 8px rgba(212, 165, 116, 0.6)',
                            display: 'inline-block',
                            animation: 'eventPulse 2s infinite',
                          }}
                        />
                      )}
                      {isPlanning && <Clock size={12} />}
                      {config.label}
                    </button>

                    {/* Countdown display */}
                    {(isUpcoming || isPlanning) && daysUntil !== null && daysUntil > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          color: isUpcoming ? '#d4a574' : '#8b5cf6',
                          backgroundColor: isUpcoming ? 'rgba(212, 165, 116, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                          padding: '3px 10px',
                          borderRadius: 8,
                        }}
                      >
                        <Timer size={11} />
                        {daysUntil} days away
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: isUpcoming ? '24px 28px' : '20px 28px' }}>
                  {/* Description */}
                  <p
                    style={{
                      fontSize: 14,
                      color: '#a09888',
                      lineHeight: 1.6,
                      margin: '0 0 16px 0',
                    }}
                  >
                    {event.description}
                  </p>

                  {/* Capacity Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 16,
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <Users size={14} style={{ color: isUpcoming ? '#d4a574' : '#6b6358', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#a09888' }}>
                          Capacity
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isUpcoming ? '#d4a574' : '#a09888' }}>
                          {isUpcoming ? `${ticketsSold} / ${ticketsTotal}` : isCompleted ? `${ticketsTotal} attended` : capacity.display}
                        </span>
                      </div>
                      {/* Capacity progress bar */}
                      <div
                        style={{
                          height: 5,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: isUpcoming ? `${ticketPercent}%` : isCompleted ? '100%' : '0%',
                            background: isUpcoming
                              ? `linear-gradient(90deg, #d4a574, #d4a574cc)`
                              : isCompleted
                                ? 'linear-gradient(90deg, #6b8f71, #6b8f71cc)'
                                : 'transparent',
                            borderRadius: 3,
                            transition: 'width 0.6s ease',
                            boxShadow: isUpcoming ? '0 0 8px rgba(212, 165, 116, 0.3)' : 'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Highlights as gradient pills */}
                  {event.highlights.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#6b6358',
                          marginBottom: 10,
                        }}
                      >
                        {isCompleted
                          ? 'Highlights'
                          : 'Planned Highlights'}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        {event.highlights.map((h, i) => {
                          // Gradient pill colors based on status and index
                          const pillColors = isUpcoming
                            ? [
                                'linear-gradient(135deg, rgba(212, 165, 116, 0.12), rgba(212, 165, 116, 0.06))',
                                'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.06))',
                                'linear-gradient(135deg, rgba(107, 143, 113, 0.12), rgba(107, 143, 113, 0.06))',
                                'linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(96, 165, 250, 0.06))',
                              ]
                            : isCompleted
                              ? [
                                  'linear-gradient(135deg, rgba(107, 143, 113, 0.12), rgba(107, 143, 113, 0.06))',
                                  'linear-gradient(135deg, rgba(96, 165, 250, 0.10), rgba(96, 165, 250, 0.05))',
                                  'linear-gradient(135deg, rgba(160, 152, 136, 0.10), rgba(160, 152, 136, 0.05))',
                                  'linear-gradient(135deg, rgba(212, 165, 116, 0.10), rgba(212, 165, 116, 0.05))',
                                ]
                              : [
                                  'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.06))',
                                  'linear-gradient(135deg, rgba(244, 114, 182, 0.10), rgba(244, 114, 182, 0.05))',
                                  'linear-gradient(135deg, rgba(96, 165, 250, 0.10), rgba(96, 165, 250, 0.05))',
                                  'linear-gradient(135deg, rgba(212, 165, 116, 0.10), rgba(212, 165, 116, 0.05))',
                                ];
                          const pillBorders = isUpcoming
                            ? [
                                'rgba(212, 165, 116, 0.2)',
                                'rgba(139, 92, 246, 0.18)',
                                'rgba(107, 143, 113, 0.18)',
                                'rgba(96, 165, 250, 0.18)',
                              ]
                            : isCompleted
                              ? [
                                  'rgba(107, 143, 113, 0.18)',
                                  'rgba(96, 165, 250, 0.15)',
                                  'rgba(160, 152, 136, 0.15)',
                                  'rgba(212, 165, 116, 0.15)',
                                ]
                              : [
                                  'rgba(139, 92, 246, 0.18)',
                                  'rgba(244, 114, 182, 0.15)',
                                  'rgba(96, 165, 250, 0.15)',
                                  'rgba(212, 165, 116, 0.15)',
                                ];
                          const pillTextColors = isUpcoming
                            ? ['#d4a574', '#a78bfa', '#8bc49a', '#7cb8f0']
                            : isCompleted
                              ? ['#8bc49a', '#7cb8f0', '#b0a898', '#d4a574']
                              : ['#a78bfa', '#f09ac0', '#7cb8f0', '#d4a574'];

                          return (
                            <span
                              key={i}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 500,
                                color: pillTextColors[i % pillTextColors.length],
                                background: pillColors[i % pillColors.length],
                                border: `1px solid ${pillBorders[i % pillBorders.length]}`,
                                borderRadius: 20,
                                padding: '5px 14px',
                                lineHeight: 1.4,
                              }}
                            >
                              <span
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: '50%',
                                  backgroundColor: pillTextColors[i % pillTextColors.length],
                                  opacity: 0.6,
                                  flexShrink: 0,
                                }}
                              />
                              {h}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b6358',
            fontSize: 14,
          }}
        >
          No events match your filter.
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes eventPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
