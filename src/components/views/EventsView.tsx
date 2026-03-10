'use client';

import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
} from 'lucide-react';
import { events, type FrequencyEvent } from '@/lib/data';

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

export function EventsView() {
  const sorted = [...events].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
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

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Vertical timeline line */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            top: 0,
            bottom: 0,
            width: 2,
            background:
              'linear-gradient(to bottom, rgba(212, 165, 116, 0.4), rgba(139, 92, 246, 0.2), rgba(107, 143, 113, 0.1))',
          }}
        />

        {sorted.map((event, idx) => {
          const config = statusConfig[event.status];
          const isUpcoming = event.status === 'upcoming';

          return (
            <div
              key={event.id}
              style={{
                position: 'relative',
                paddingLeft: 52,
                marginBottom: idx < sorted.length - 1 ? 32 : 0,
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: 11,
                  top: isUpcoming ? 24 : 20,
                  width: isUpcoming ? 20 : 16,
                  height: isUpcoming ? 20 : 16,
                  borderRadius: '50%',
                  backgroundColor: isUpcoming
                    ? '#d4a574'
                    : event.status === 'completed'
                      ? '#6b8f71'
                      : '#8b5cf6',
                  border: `3px solid ${isUpcoming ? 'rgba(212, 165, 116, 0.3)' : '#131720'}`,
                  boxShadow: isUpcoming
                    ? '0 0 16px rgba(212, 165, 116, 0.5)'
                    : 'none',
                  zIndex: 2,
                }}
              />

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
                  padding: isUpcoming ? 28 : 24,
                  boxShadow: isUpcoming
                    ? '0 0 40px rgba(212, 165, 116, 0.08), inset 0 0 40px rgba(212, 165, 116, 0.02)'
                    : 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Top row: status + date */}
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
                  <span
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
                    }}
                  >
                    {event.status === 'completed' && (
                      <CheckCircle2 size={12} />
                    )}
                    {event.status === 'upcoming' && <Sparkles size={12} />}
                    {event.status === 'planning' && <Clock size={12} />}
                    {config.label}
                  </span>

                  <span
                    style={{
                      fontSize: 13,
                      color: '#a09888',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Calendar size={14} />
                    {event.date}
                  </span>
                </div>

                {/* Name */}
                <h2
                  style={{
                    fontSize: isUpcoming ? 24 : 20,
                    fontWeight: 700,
                    color: isUpcoming ? '#f0ebe4' : '#d8cfc4',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {event.name}
                  {isUpcoming && (
                    <Star
                      size={18}
                      style={{
                        marginLeft: 10,
                        color: '#d4a574',
                        verticalAlign: 'middle',
                      }}
                      fill="#d4a574"
                    />
                  )}
                </h2>

                {/* Location */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    color: '#8b7a6b',
                    marginBottom: 14,
                  }}
                >
                  <MapPin size={14} />
                  {event.location}
                </div>

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

                {/* Capacity */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    color: '#8b7a6b',
                    marginBottom: 16,
                  }}
                >
                  <Users size={14} />
                  <span>Capacity: {event.capacity}</span>
                </div>

                {/* Highlights */}
                {event.highlights.length > 0 && (
                  <div
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: 10,
                      padding: '14px 18px',
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
                        marginBottom: 10,
                      }}
                    >
                      {event.status === 'completed'
                        ? 'Highlights'
                        : 'Planned Highlights'}
                    </div>
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {event.highlights.map((h, i) => (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            fontSize: 13,
                            color: '#b0a898',
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              backgroundColor: isUpcoming
                                ? '#d4a574'
                                : event.status === 'completed'
                                  ? '#6b8f71'
                                  : '#8b5cf6',
                              marginTop: 7,
                              flexShrink: 0,
                            }}
                          />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
