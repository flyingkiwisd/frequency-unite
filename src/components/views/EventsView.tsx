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
  Ticket,
  DollarSign,
  Mic2,
  BookOpen,
  Circle,
  Loader,
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

      {/* ── Blue Spirit 6.0 War Room ── */}
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
              130
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
