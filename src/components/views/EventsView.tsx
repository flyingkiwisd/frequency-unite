'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  UserCheck,
  UserX,
  HelpCircle,
  Zap,
  ArrowRight,
  Plus,
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  ThermometerSun,
  ChevronLeft,
  ChevronRight,
  Check,
  PartyPopper,
  Image,
  History,
  Info,
} from 'lucide-react';
import { type FrequencyEvent } from '@/lib/data';
import { useFrequencyData } from '@/lib/supabase/DataProvider';

// ─── Types ───

type FilterTab = 'all' | 'upcoming' | 'past';
type RsvpStatus = 'going' | 'maybe' | 'declined';

// ─── Constants ───

const statusOrder: Record<FrequencyEvent['status'], number> = {
  upcoming: 0,
  completed: 1,
  planning: 2,
};

const statusConfig: Record<
  FrequencyEvent['status'],
  { label: string; bg: string; text: string; border: string; glow?: string; gradient?: string }
> = {
  completed: {
    label: 'Completed',
    bg: 'rgba(107, 143, 113, 0.15)',
    text: '#6b8f71',
    border: '1px solid rgba(107, 143, 113, 0.3)',
    gradient: 'linear-gradient(135deg, rgba(107,143,113,0.25), rgba(107,143,113,0.1))',
  },
  upcoming: {
    label: 'Upcoming',
    bg: 'rgba(212, 165, 116, 0.15)',
    text: '#d4a574',
    border: '1px solid rgba(212, 165, 116, 0.4)',
    glow: '0 0 20px rgba(212, 165, 116, 0.25)',
    gradient: 'linear-gradient(135deg, rgba(212,165,116,0.25), rgba(212,165,116,0.1))',
  },
  planning: {
    label: 'Planning',
    bg: 'rgba(139, 92, 246, 0.15)',
    text: '#8b5cf6',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(139,92,246,0.1))',
  },
};

// Gradient header colors per event status
const headerGradients: Record<FrequencyEvent['status'], string> = {
  upcoming: 'linear-gradient(135deg, rgba(212, 165, 116, 0.18), rgba(139, 92, 246, 0.12), rgba(212, 165, 116, 0.06))',
  completed: 'linear-gradient(135deg, rgba(107, 143, 113, 0.14), rgba(96, 165, 250, 0.08), rgba(107, 143, 113, 0.04))',
  planning: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14), rgba(244, 114, 182, 0.08), rgba(139, 92, 246, 0.04))',
};

// Status cycle order for inline editing
const statusCycle: FrequencyEvent['status'][] = ['upcoming', 'planning', 'completed'];

// Simulated RSVP data per event
const rsvpData: Record<string, { going: number; maybe: number; declined: number; avatars: string[] }> = {};

function getRsvpForEvent(eventId: string, status: FrequencyEvent['status'], capacity: number): { going: number; maybe: number; declined: number; avatars: string[] } {
  if (rsvpData[eventId]) return rsvpData[eventId];
  const avatarPool = ['JH', 'SK', 'AL', 'MR', 'TC', 'EB', 'DF', 'NP', 'RW', 'KL', 'JB', 'CM'];
  const avatarColors = ['#f59e0b', '#fb7185', '#8b5cf6', '#38bdf8', '#10b981', '#a855f7', '#f472b6', '#2dd4bf', '#fbbf24', '#22c55e', '#84cc16', '#f97316'];
  if (status === 'completed') {
    const going = Math.min(capacity, 60);
    rsvpData[eventId] = { going, maybe: 0, declined: Math.floor(capacity * 0.08), avatars: avatarPool.slice(0, Math.min(8, going)) };
  } else if (status === 'upcoming') {
    rsvpData[eventId] = { going: 32, maybe: 12, declined: 3, avatars: avatarPool.slice(0, 8) };
  } else {
    rsvpData[eventId] = { going: 8, maybe: 20, declined: 0, avatars: avatarPool.slice(0, 5) };
  }
  return rsvpData[eventId];
}

const avatarColorMap: Record<string, string> = {
  JH: '#f59e0b', SK: '#fb7185', AL: '#8b5cf6', MR: '#38bdf8',
  TC: '#10b981', EB: '#a855f7', DF: '#f472b6', NP: '#2dd4bf',
  RW: '#fbbf24', KL: '#22c55e', JB: '#84cc16', CM: '#f97316',
};

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

// Countdown urgency color: green > 30d, amber 7-30d, red < 7d
function getUrgencyColor(daysUntil: number): { color: string; bg: string; label: string } {
  if (daysUntil <= 3) return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Imminent' };
  if (daysUntil <= 7) return { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'This week' };
  if (daysUntil <= 14) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Soon' };
  if (daysUntil <= 30) return { color: '#eab308', bg: 'rgba(234,179,8,0.10)', label: 'Approaching' };
  if (daysUntil <= 60) return { color: '#84cc16', bg: 'rgba(132,204,22,0.10)', label: 'On track' };
  return { color: '#6b8f71', bg: 'rgba(107,143,113,0.10)', label: 'Plenty of time' };
}

// Simulated weather data for outdoor events
function getWeatherForEvent(location: string, daysUntil: number | null): { icon: 'sun' | 'cloud-sun' | 'cloud-rain' | 'wind'; temp: string; desc: string } | null {
  if (daysUntil !== null && daysUntil > 30) return null; // Too far out for forecast
  const locationLower = location.toLowerCase();
  if (locationLower.includes('costa rica') || locationLower.includes('tropical'))
    return { icon: 'sun', temp: '82F', desc: 'Sunny, tropical' };
  if (locationLower.includes('london') || locationLower.includes('uk'))
    return { icon: 'cloud-rain', temp: '58F', desc: 'Partly cloudy' };
  if (locationLower.includes('mountain') || locationLower.includes('colorado'))
    return { icon: 'wind', temp: '64F', desc: 'Breezy, clear' };
  return { icon: 'cloud-sun', temp: '72F', desc: 'Fair conditions' };
}

// Simulated logistics checklist items
const logisticsItems = [
  { id: 'venue', label: 'Venue secured', defaultChecked: true },
  { id: 'catering', label: 'Catering arranged', defaultChecked: true },
  { id: 'av', label: 'A/V equipment ready', defaultChecked: false },
  { id: 'transport', label: 'Transport coordinated', defaultChecked: false },
  { id: 'materials', label: 'Materials prepared', defaultChecked: false },
];

// Tooltip detail map for highlight pills
const highlightDetails: Record<string, string> = {
  'Governance deep-dive': '3-hour intensive session on organizational governance frameworks',
  'Facilitation labs': 'Hands-on workshop to develop facilitation skills in small groups',
  'Finance sprint': 'Focused session on budget planning and financial sustainability',
  'New steward onboarding': 'Welcome program for 25-30 incoming stewards with mentorship pairing',
  'Retrospective': 'Structured reflection on outcomes, learnings, and future direction',
  'Community mapping': 'Interactive exercise mapping network connections and resources',
  'Strategic planning': 'Collaborative session setting priorities for the next quarter',
};

// ─── AnimatedCounter Hook ───

function useAnimatedCounter(target: number, duration: number = 1200, enabled: boolean = true): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      setValue(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);

  return value;
}

// ─── AnimatedProgress Component ───

function AnimatedProgress({ percent, color, glow, delay = 0 }: { percent: number; color: string; glow?: string; delay?: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percent), delay + 100);
    return () => clearTimeout(timer);
  }, [percent, delay]);

  return (
    <div
      style={{
        height: '100%',
        width: `${width}%`,
        background: color,
        borderRadius: 3,
        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: glow || 'none',
      }}
    />
  );
}

// ─── Countdown Display Component ───

function CountdownDisplay({ daysUntil, status }: { daysUntil: number; status: FrequencyEvent['status'] }) {
  const isUpcoming = status === 'upcoming';
  const urgency = getUrgencyColor(daysUntil);
  // Use urgency color for upcoming events, purple for planning
  const accentColor = isUpcoming ? urgency.color : '#8b5cf6';

  const weeks = Math.floor(daysUntil / 7);
  const remainingDays = daysUntil % 7;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: `${accentColor}08`,
        borderRadius: 12,
        border: `1px solid ${accentColor}20`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 20,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}10, transparent 70%)`,
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{
          fontSize: 32,
          fontWeight: 800,
          color: accentColor,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          textShadow: `0 0 20px ${accentColor}40`,
          animation: 'countdownPulse 3s ease-in-out infinite',
        }}>
          {daysUntil}
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: `${accentColor}cc`,
          letterSpacing: '0.02em',
        }}>
          days
        </span>
      </div>

      <div style={{
        width: 1,
        height: 28,
        backgroundColor: `${accentColor}20`,
        flexShrink: 0,
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 11, color: '#a09888', fontWeight: 500 }}>
          {weeks > 0 ? `${weeks} week${weeks > 1 ? 's' : ''}${remainingDays > 0 ? `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : ''}` : `${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
        </span>
        <span style={{ fontSize: 10, color: isUpcoming ? `${urgency.color}99` : '#6b6358', fontWeight: 500 }}>
          {isUpcoming ? urgency.label : 'until event'}
        </span>
      </div>

      <div style={{ marginLeft: 'auto', position: 'relative', zIndex: 1 }}>
        <Timer size={16} style={{ color: `${accentColor}80` }} />
      </div>
    </div>
  );
}

// ─── RSVP Avatar Row Component ───

function RsvpAvatarRow({ eventId, status, capacity }: { eventId: string; status: FrequencyEvent['status']; capacity: number }) {
  const rsvp = getRsvpForEvent(eventId, status, capacity);
  const isCompleted = status === 'completed';
  const accentColor = isCompleted ? '#6b8f71' : status === 'upcoming' ? '#d4a574' : '#8b5cf6';

  // RSVP toggle state per avatar
  const [avatarStatuses, setAvatarStatuses] = useState<Record<string, RsvpStatus>>(() => {
    const init: Record<string, RsvpStatus> = {};
    rsvp.avatars.forEach(a => { init[a] = 'going'; });
    return init;
  });
  const [poppedAvatar, setPoppedAvatar] = useState<string | null>(null);

  const rsvpCycle: RsvpStatus[] = ['going', 'maybe', 'declined'];
  const rsvpColors: Record<RsvpStatus, string> = { going: '#6b8f71', maybe: '#d4a574', declined: '#6b6358' };
  const rsvpIcons: Record<RsvpStatus, string> = { going: 'check', maybe: '?', declined: 'x' };

  const toggleAvatar = (initials: string) => {
    setPoppedAvatar(initials);
    setTimeout(() => setPoppedAvatar(null), 400);
    setAvatarStatuses(prev => {
      const current = prev[initials] || 'going';
      const idx = rsvpCycle.indexOf(current);
      const next = rsvpCycle[(idx + 1) % rsvpCycle.length];
      return { ...prev, [initials]: next };
    });
  };

  const goingCount = Object.values(avatarStatuses).filter(s => s === 'going').length + (rsvp.going > 6 ? rsvp.going - 6 : 0);
  const maybeCount = Object.values(avatarStatuses).filter(s => s === 'maybe').length + (isCompleted ? 0 : rsvp.maybe);
  const declinedCount = Object.values(avatarStatuses).filter(s => s === 'declined').length;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* Left: Clickable Avatar stack */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {rsvp.avatars.slice(0, 6).map((initials, i) => {
            const avatarStatus = avatarStatuses[initials] || 'going';
            const isPopped = poppedAvatar === initials;
            const ringColor = rsvpColors[avatarStatus];
            return (
              <div
                key={i}
                onClick={() => !isCompleted && toggleAvatar(initials)}
                title={isCompleted ? `${initials} - Attended` : `${initials} - ${avatarStatus}. Click to change.`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${avatarColorMap[initials] || '#a09888'}, ${avatarColorMap[initials] || '#a09888'}88)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#0b0d14',
                  border: `2px solid ${isCompleted ? 'rgba(19, 23, 32, 0.9)' : ringColor}`,
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: isPopped ? 20 : rsvp.avatars.length - i,
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isPopped ? 'scale(1.35) translateY(-4px)' : 'scale(1)',
                  boxShadow: isPopped ? `0 4px 16px ${ringColor}60` : 'none',
                  cursor: isCompleted ? 'default' : 'pointer',
                }}
              >
                {initials}
                {/* Tiny RSVP status indicator */}
                {!isCompleted && (
                  <span style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 10, height: 10, borderRadius: '50%',
                    backgroundColor: ringColor,
                    border: '1.5px solid rgba(19,23,32,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 6, fontWeight: 800, color: '#0b0d14',
                    transition: 'all 0.3s ease',
                    transform: isPopped ? 'scale(1.3)' : 'scale(1)',
                  }}>
                    {rsvpIcons[avatarStatus] === 'check' ? '\u2713' : rsvpIcons[avatarStatus]}
                  </span>
                )}
              </div>
            );
          })}
          {rsvp.going > 6 && (
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(19, 23, 32, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 600,
              color: '#a09888',
              marginLeft: -8,
              position: 'relative',
              zIndex: 0,
            }}>
              +{rsvp.going - 6}
            </div>
          )}
        </div>
      </div>

      {/* Right: RSVP counts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <UserCheck size={12} style={{ color: '#6b8f71' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b8f71' }}>{rsvp.going}</span>
        </div>
        {!isCompleted && rsvp.maybe > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <HelpCircle size={12} style={{ color: '#d4a574' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#d4a574' }}>{rsvp.maybe}</span>
          </div>
        )}
        {rsvp.declined > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserX size={12} style={{ color: '#6b6358' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b6358' }}>{rsvp.declined}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mini Calendar Widget ───

function MiniCalendar({ events }: { events: FrequencyEvent[] }) {
  const [calMonth, setCalMonth] = useState(() => new Date());
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const eventDates = useMemo(() => {
    const dates: Record<string, FrequencyEvent['status']> = {};
    events.forEach(ev => {
      const d = parseEventDate(ev.date);
      if (d) {
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        dates[key] = ev.status;
      }
    });
    return dates;
  }, [events]);

  const calendarDays = useMemo(() => {
    const y = calMonth.getFullYear();
    const m = calMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const days: { day: number; isCurrentMonth: boolean; eventStatus?: FrequencyEvent['status'] }[] = [];
    // Previous month padding
    const prevDays = new Date(y, m, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevDays - i, isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${y}-${m}-${d}`;
      days.push({ day: d, isCurrentMonth: true, eventStatus: eventDates[key] });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, isCurrentMonth: false });
    }
    return days;
  }, [calMonth, eventDates]);

  const today = new Date();
  const isToday = (day: number) =>
    calMonth.getFullYear() === today.getFullYear() &&
    calMonth.getMonth() === today.getMonth() &&
    day === today.getDate();

  const statusDotColor: Record<string, string> = {
    upcoming: '#d4a574',
    planning: '#8b5cf6',
    completed: '#6b8f71',
  };

  return (
    <div className="card-premium" style={{
      backgroundColor: 'rgba(19, 23, 32, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.06)',
      padding: '18px 20px',
      marginBottom: 28,
    }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button
          onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: '#6b6358', display: 'flex', alignItems: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#d4a574'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6b6358'; }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', letterSpacing: '0.02em' }}>
          {monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}
        </span>
        <button
          onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: '#6b6358', display: 'flex', alignItems: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#d4a574'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6b6358'; }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {dayNames.map(d => (
          <div key={d} style={{
            fontSize: 9, fontWeight: 600, color: '#6b6358', textAlign: 'center',
            padding: '2px 0', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {calendarDays.map((cell, i) => {
          const hasEvent = cell.isCurrentMonth && cell.eventStatus;
          const isTodayCell = cell.isCurrentMonth && isToday(cell.day);
          return (
            <div key={i} style={{
              position: 'relative',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: 28, borderRadius: 6,
              fontSize: 10, fontWeight: isTodayCell ? 700 : 500,
              color: !cell.isCurrentMonth ? '#3a3832' : isTodayCell ? '#f0ebe4' : hasEvent ? '#f0ebe4' : '#6b6358',
              backgroundColor: isTodayCell ? 'rgba(212,165,116,0.2)' : hasEvent ? 'rgba(255,255,255,0.03)' : 'transparent',
              border: isTodayCell ? '1px solid rgba(212,165,116,0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              cursor: hasEvent ? 'pointer' : 'default',
            }}>
              {cell.day}
              {/* Event dot indicator */}
              {hasEvent && (
                <div style={{
                  position: 'absolute', bottom: 2,
                  width: 4, height: 4, borderRadius: '50%',
                  backgroundColor: statusDotColor[cell.eventStatus!] || '#a09888',
                  boxShadow: `0 0 6px ${statusDotColor[cell.eventStatus!] || '#a09888'}80`,
                  animation: cell.eventStatus === 'upcoming' ? 'ev-dotPulse 2s ease-in-out infinite' : 'none',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center' }}>
        {[
          { label: 'Upcoming', color: '#d4a574' },
          { label: 'Planning', color: '#8b5cf6' },
          { label: 'Completed', color: '#6b8f71' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: item.color }} />
            <span style={{ fontSize: 9, color: '#6b6358', fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Weather Widget ───

function WeatherWidget({ location, daysUntil }: { location: string; daysUntil: number | null }) {
  const weather = getWeatherForEvent(location, daysUntil);
  if (!weather) return null;

  const WeatherIcon = weather.icon === 'sun' ? Sun : weather.icon === 'cloud-sun' ? CloudSun : weather.icon === 'cloud-rain' ? CloudRain : Wind;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(96,165,250,0.1))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <WeatherIcon size={16} style={{ color: '#eab308' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#a09888' }}>Weather Forecast</div>
        <div style={{ fontSize: 12, color: '#f0ebe4', fontWeight: 500 }}>{weather.temp} -- {weather.desc}</div>
      </div>
      <ThermometerSun size={14} style={{ color: '#6b6358' }} />
    </div>
  );
}

// ─── Logistics Checklist with Animated Checkboxes ───

function LogisticsChecklist({ eventId }: { eventId: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    logisticsItems.forEach(item => { init[item.id] = item.defaultChecked; });
    return init;
  });
  const [celebrating, setCelebrating] = useState(false);
  const [lastToggled, setLastToggled] = useState<string | null>(null);

  const completedCount = Object.values(checked).filter(Boolean).length;
  const allDone = completedCount === logisticsItems.length;

  const toggleItem = (id: string) => {
    setLastToggled(id);
    setTimeout(() => setLastToggled(null), 600);
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const newCount = Object.values(next).filter(Boolean).length;
      if (newCount === logisticsItems.length && !allDone) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 2000);
      }
      return next;
    });
  };

  return (
    <div style={{
      padding: '14px 18px',
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Celebration overlay */}
      {celebrating && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(107,143,113,0.08)',
          animation: 'ev-celebrationFade 2s ease forwards',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, animation: 'ev-celebrationBounce 0.6s ease' }}>
            <PartyPopper size={20} style={{ color: '#d4a574' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#6b8f71' }}>All Complete!</span>
            <PartyPopper size={20} style={{ color: '#8b5cf6' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>
          Logistics
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: allDone ? '#6b8f71' : '#a09888' }}>
          {completedCount}/{logisticsItems.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%', width: `${(completedCount / logisticsItems.length) * 100}%`,
          background: allDone ? 'linear-gradient(90deg, #6b8f71, #84cc16)' : 'linear-gradient(90deg, #d4a574, #d4a574cc)',
          borderRadius: 2, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {logisticsItems.map(item => {
          const isChecked = checked[item.id];
          const justToggled = lastToggled === item.id;
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 4px', background: 'none', border: 'none',
                cursor: 'pointer', borderRadius: 6,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: isChecked ? '2px solid #6b8f71' : '2px solid #3a3832',
                backgroundColor: isChecked ? 'rgba(107,143,113,0.2)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: justToggled ? 'scale(1.3)' : 'scale(1)',
              }}>
                {isChecked && (
                  <Check size={11} style={{
                    color: '#6b8f71',
                    animation: justToggled ? 'ev-checkPop 0.3s ease' : 'none',
                  }} />
                )}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: isChecked ? '#6b8f71' : '#a09888',
                textDecoration: isChecked ? 'line-through' : 'none',
                opacity: isChecked ? 0.7 : 1,
                transition: 'all 0.3s ease',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Similar Past Events ───

function SimilarPastEvents({ currentEvent, allEvents }: { currentEvent: FrequencyEvent; allEvents: FrequencyEvent[] }) {
  const pastEvents = allEvents.filter(e => e.status === 'completed' && e.id !== currentEvent.id);
  if (pastEvents.length === 0) return null;

  // Show up to 2 similar events
  const similar = pastEvents.slice(0, 2);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
      }}>
        <History size={12} style={{ color: '#6b6358' }} />
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>
          Similar Past Events
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {similar.map(ev => {
          const cal = getCalendarParts(ev.date);
          return (
            <div
              key={ev.id}
              style={{
                flex: 1, padding: '10px 12px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)',
                transition: 'all 0.25s ease', cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(107,143,113,0.2)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 28, height: 32, borderRadius: 6,
                  backgroundColor: 'rgba(107,143,113,0.1)',
                  border: '1px solid rgba(107,143,113,0.15)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 7, fontWeight: 700, color: '#6b8f71', letterSpacing: '0.05em' }}>{cal.month}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#f0ebe4', lineHeight: 1 }}>{cal.day}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#f0ebe4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ev.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#6b6358' }}>{ev.location}</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#6b8f71', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={9} />
                {parseCapacity(ev.capacity).total} attended
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Event Banner Placeholder ───

function EventBanner({ status, name }: { status: FrequencyEvent['status']; name: string }) {
  const gradients: Record<string, string> = {
    upcoming: 'linear-gradient(135deg, rgba(212,165,116,0.15) 0%, rgba(139,92,246,0.1) 40%, rgba(96,165,250,0.08) 70%, rgba(212,165,116,0.05) 100%)',
    completed: 'linear-gradient(135deg, rgba(107,143,113,0.12) 0%, rgba(96,165,250,0.08) 40%, rgba(160,152,136,0.06) 100%)',
    planning: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(244,114,182,0.08) 40%, rgba(139,92,246,0.05) 100%)',
  };

  return (
    <div style={{
      height: 80, position: 'relative', overflow: 'hidden',
      background: gradients[status],
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* Abstract decorative shapes */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }} viewBox="0 0 400 80" preserveAspectRatio="none">
        <ellipse cx="80" cy="60" rx="120" ry="60" fill={status === 'upcoming' ? '#d4a574' : status === 'completed' ? '#6b8f71' : '#8b5cf6'} />
        <ellipse cx="320" cy="20" rx="100" ry="50" fill={status === 'upcoming' ? '#8b5cf6' : '#60a5fa'} opacity="0.5" />
        <ellipse cx="200" cy="70" rx="80" ry="30" fill="#f0ebe4" opacity="0.15" />
      </svg>
      {/* Camera/image icon placeholder */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0.15,
      }}>
        <Image size={28} style={{ color: '#f0ebe4' }} />
      </div>
      {/* Gradient fade at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 30,
        background: 'linear-gradient(transparent, rgba(19,23,32,0.6))',
      }} />
    </div>
  );
}

// ─── Highlight Tooltip ───

function HighlightTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: rect.width / 2, y: -8 });
        setShow(true);
      }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div style={{
          position: 'absolute',
          bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          padding: '8px 12px',
          backgroundColor: 'rgba(11,13,20,0.95)',
          border: '1px solid rgba(212,165,116,0.2)',
          borderRadius: 8, maxWidth: 220, minWidth: 140,
          fontSize: 11, lineHeight: 1.5, color: '#a09888', fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 50, pointerEvents: 'none',
          animation: 'ev-tooltipIn 0.2s ease',
          whiteSpace: 'normal',
        }}>
          {text}
          {/* Arrow */}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid rgba(11,13,20,0.95)',
          }} />
        </div>
      )}
    </div>
  );
}

// ─── Component ───

export function EventsView() {
  const { events, updateEvent } = useFrequencyData();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [mounted, setMounted] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Record<number, boolean>>({});
  const [clickedBtn, setClickedBtn] = useState<string | null>(null);
  const [filterTransitioning, setFilterTransitioning] = useState(false);
  const prevTabRef = useRef<FilterTab>('all');

  // Animated counters for war room
  const ticketCount = useAnimatedCounter(32, 1400, mounted);
  const revenueCount = useAnimatedCounter(38, 1400, mounted);
  const daysCount = useAnimatedCounter(getDaysUntil('July 18, 2026') ?? 130, 1600, mounted);

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

  // Staggered entrance animation with filter transition support
  useEffect(() => {
    if (!mounted) return;
    // Trigger transition animation when tab changes
    if (prevTabRef.current !== activeTab) {
      setFilterTransitioning(true);
      setVisibleCards({});
      // Short fade-out then re-stagger in
      const timer = setTimeout(() => {
        setFilterTransitioning(false);
        filtered.forEach((_, idx) => {
          setTimeout(() => {
            setVisibleCards((prev) => ({ ...prev, [idx]: true }));
          }, 80 * idx);
        });
      }, 200);
      prevTabRef.current = activeTab;
      return () => clearTimeout(timer);
    }
    setVisibleCards({});
    filtered.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleCards((prev) => ({ ...prev, [idx]: true }));
      }, 120 * idx);
    });
  }, [mounted, filtered, activeTab]);

  const tabCounts = useMemo(() => ({
    all: events.length,
    upcoming: events.filter((e) => e.status === 'upcoming' || e.status === 'planning').length,
    past: events.filter((e) => e.status === 'completed').length,
  }), [events]);

  // Cycle status: upcoming -> planning -> completed -> upcoming
  const handleStatusCycle = useCallback(async (event: FrequencyEvent) => {
    setClickedBtn(event.id);
    setTimeout(() => setClickedBtn(null), 300);
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
      <div
        className="noise-overlay dot-pattern"
        style={{
          marginBottom: 32,
          animation: mounted ? 'ev-fadeSlideUp 0.6s ease both' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(212,165,116,0.2)',
              boxShadow: '0 0 20px rgba(212,165,116,0.1)',
            }}
          >
            <Calendar size={24} style={{ color: '#d4a574' }} />
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
              Gatherings & Events
            </h1>
            <p
              style={{
                fontSize: 13,
                color: '#a09888',
                margin: '2px 0 0 0',
              }}
            >
              Frequency gatherings are where coherence meets action.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs with sliding indicator */}
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
          position: 'relative',
          animation: mounted ? 'ev-fadeSlideUp 0.6s ease 0.1s both' : 'none',
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
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                position: 'relative',
                overflow: 'hidden',
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
              {/* Active sliding indicator underline */}
              {isActiveTab && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '10%',
                    right: '10%',
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #d4a574, transparent)',
                    borderRadius: 1,
                    animation: 'ev-slideIn 0.3s ease',
                  }}
                />
              )}
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
                  transition: 'all 0.35s ease',
                }}
              >
                {tabCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Mini Calendar Widget ── */}
      <div style={{ animation: mounted ? 'ev-fadeSlideUp 0.6s ease 0.12s both' : 'none' }}>
        <MiniCalendar events={events} />
      </div>

      {/* ── Blue Spirit 6.0 War Room ── */}
      {(activeTab === 'all' || activeTab === 'upcoming') && (
        <div
          style={{
            marginBottom: 40,
            position: 'relative',
            borderRadius: 18,
            padding: 2,
            background: 'linear-gradient(135deg, #d4a574, #8b5cf6, #d4a574)',
            animation: mounted ? 'ev-fadeSlideUp 0.6s ease 0.15s both' : 'none',
          }}
        >
          {/* Inner container with glassmorphism */}
          <div
            className="card-premium"
            style={{
              backgroundColor: 'rgba(11, 13, 20, 0.95)',
              borderRadius: 16,
              padding: 28,
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Subtle background pattern */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(circle at 20% 30%, rgba(212,165,116,0.06) 0%, transparent 50%),
                                  radial-gradient(circle at 80% 70%, rgba(139,92,246,0.04) 0%, transparent 50%),
                                  radial-gradient(circle at 50% 50%, rgba(212,165,116,0.02) 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            {/* Animated dot pattern overlay */}
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0.03,
                pointerEvents: 'none',
              }}
            >
              <defs>
                <pattern id="warRoomDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#d4a574" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#warRoomDots)" />
            </svg>

            {/* War Room Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid rgba(212, 165, 116, 0.15)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(139,92,246,0.15))',
                  border: '1px solid rgba(212, 165, 116, 0.3)',
                  boxShadow: '0 0 20px rgba(212, 165, 116, 0.25), 0 0 40px rgba(212, 165, 116, 0.1)',
                  animation: 'ev-eventGlow 3s ease-in-out infinite',
                }}
              >
                <Sparkles size={22} style={{ color: '#d4a574' }} />
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

              {/* Premium badge */}
              <div
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#d4a574',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.1))',
                  border: '1px solid rgba(212,165,116,0.25)',
                }}
              >
                <Star size={10} fill="#d4a574" />
                Featured
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 24,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Tickets Sold */}
              <div
                className="card-stat"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'border-color 0.3s, transform 0.2s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,165,116,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
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
                  {ticketCount}{' '}
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
                  <AnimatedProgress
                    percent={Math.round((32 / 70) * 100)}
                    color="linear-gradient(90deg, #d4a574, #e8c49a)"
                    glow="0 0 8px rgba(212, 165, 116, 0.4)"
                    delay={200}
                  />
                </div>
              </div>

              {/* Revenue */}
              <div
                className="card-stat"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'border-color 0.3s, transform 0.2s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,165,116,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
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
                  ${revenueCount}K{' '}
                  <span style={{ fontSize: 14, color: '#6b6358', fontWeight: 500 }}>
                    / $85K target
                  </span>
                </div>
              </div>

              {/* Days Until Event */}
              <div
                className="card-stat"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'border-color 0.3s, transform 0.2s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,165,116,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
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
                  {daysCount}
                </div>
              </div>

              {/* Waitlist */}
              <div
                className="card-stat"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'border-color 0.3s, transform 0.2s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,165,116,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
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

            {/* Programming Status + Logistics -- two-column layout */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Programming Status */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  border: '1px solid rgba(255,255,255,0.06)',
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
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  border: '1px solid rgba(255,255,255,0.06)',
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
        </div>
      )}

      {/* ── Event Cards with Vertical Timeline ── */}
      <div style={{
        position: 'relative', paddingLeft: 48,
        opacity: filterTransitioning ? 0 : 1,
        transform: filterTransitioning ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}>
        {/* Continuous timeline vertical line */}
        <div style={{
          position: 'absolute',
          left: 19,
          top: 0,
          bottom: 0,
          width: 2,
          background: 'linear-gradient(180deg, rgba(212,165,116,0.3), rgba(139,92,246,0.2), rgba(107,143,113,0.15), transparent)',
          borderRadius: 1,
        }} />

        {filtered.map((event, idx) => {
          const config = statusConfig[event.status];
          const isUpcoming = event.status === 'upcoming';
          const isPlanning = event.status === 'planning';
          const isCompleted = event.status === 'completed';
          const daysUntil = getDaysUntil(event.date);
          const cal = getCalendarParts(event.date);
          const capacity = parseCapacity(event.capacity);
          const isVisible = visibleCards[idx] ?? false;
          const isClicked = clickedBtn === event.id;
          const isLast = idx === filtered.length - 1;

          // Simulated ticket data for upcoming events
          const ticketsSold = isUpcoming ? 32 : isCompleted ? capacity.total : 0;
          const ticketsTotal = capacity.total;
          const ticketPercent = ticketsTotal > 0 ? Math.round((ticketsSold / ticketsTotal) * 100) : 0;

          const accentColor = isUpcoming ? '#d4a574' : isCompleted ? '#6b8f71' : '#8b5cf6';

          return (
            <div
              key={event.id}
              style={{
                position: 'relative',
                marginBottom: isLast ? 0 : 32,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            >
              {/* Timeline node */}
              <div style={{
                position: 'absolute',
                left: -48,
                top: 0,
                width: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                {/* Date marker above dot */}
                <div style={{
                  width: 40,
                  textAlign: 'center',
                  marginBottom: 6,
                }}>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: accentColor,
                    letterSpacing: '0.1em',
                    lineHeight: 1,
                  }}>
                    {cal.month}
                  </div>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#f0ebe4',
                    lineHeight: 1.2,
                  }}>
                    {cal.day}
                  </div>
                </div>

                {/* Timeline dot with status glow */}
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#0b0d14' : accentColor,
                  border: `3px solid ${accentColor}`,
                  boxShadow: !isCompleted ? `0 0 12px ${accentColor}50, 0 0 24px ${accentColor}20` : `0 0 6px ${accentColor}30`,
                  position: 'relative',
                  zIndex: 2,
                  animation: (isUpcoming || isPlanning) ? 'ev-timelinePulse 2.5s ease-in-out infinite' : 'none',
                }}>
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      inset: -3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CheckCircle2 size={16} style={{ color: '#6b8f71' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Event Card - Large glassmorphism card */}
              <div
                className="card-interactive"
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  opacity: isCompleted ? 0.88 : 1,
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-4px) scale(1.005)';
                  el.style.opacity = '1';
                  const inner = el.querySelector('[data-card-inner]') as HTMLElement;
                  if (inner) {
                    inner.style.borderColor = `${accentColor}50`;
                    inner.style.boxShadow = `0 12px 48px ${accentColor}18, 0 0 80px ${accentColor}06, inset 0 1px 0 rgba(255,255,255,0.06)`;
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.opacity = isCompleted ? '0.88' : '1';
                  const inner = el.querySelector('[data-card-inner]') as HTMLElement;
                  if (inner) {
                    inner.style.borderColor = isUpcoming ? 'rgba(212, 165, 116, 0.25)' : 'rgba(30, 38, 56, 0.6)';
                    inner.style.boxShadow = isUpcoming ? '0 4px 40px rgba(212, 165, 116, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)' : 'inset 0 1px 0 rgba(255,255,255,0.02)';
                  }
                }}
              >
                <div
                  data-card-inner=""
                  className="card-premium"
                  style={{
                    backgroundColor: 'rgba(19, 23, 32, 0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isUpcoming ? '1px solid rgba(212, 165, 116, 0.25)' : '1px solid rgba(30, 38, 56, 0.6)',
                    borderRadius: 18,
                    overflow: 'hidden',
                    boxShadow: isUpcoming ? '0 4px 40px rgba(212, 165, 116, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)' : 'inset 0 1px 0 rgba(255,255,255,0.02)',
                    transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
                  }}
                >
                  {/* Event Banner Placeholder */}
                  <EventBanner status={event.status} name={event.name} />

                  {/* Gradient Header Area */}
                  <div
                    style={{
                      background: headerGradients[event.status],
                      padding: '24px 28px 20px',
                      borderBottom: `1px solid ${isUpcoming ? 'rgba(212, 165, 116, 0.12)' : 'rgba(255,255,255,0.04)'}`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Decorative SVG circles in header */}
                    <svg
                      style={{
                        position: 'absolute',
                        right: -20,
                        top: -20,
                        width: 200,
                        height: 200,
                        opacity: 0.08,
                        pointerEvents: 'none',
                      }}
                      viewBox="0 0 200 200"
                    >
                      <circle cx="100" cy="60" r="80" fill={accentColor} opacity="0.5" />
                      <circle cx="150" cy="120" r="50" fill={isUpcoming ? '#8b5cf6' : isCompleted ? '#60a5fa' : '#f472b6'} opacity="0.3" />
                    </svg>

                    {/* Top row: Title + Status */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, position: 'relative', zIndex: 1 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <h2
                            style={{
                              fontSize: isUpcoming ? 24 : 20,
                              fontWeight: 700,
                              color: '#f0ebe4',
                              margin: 0,
                              letterSpacing: '-0.01em',
                              lineHeight: 1.2,
                            }}
                          >
                            {event.name}
                          </h2>
                          {isUpcoming && (
                            <Star size={18} style={{ color: '#d4a574', flexShrink: 0 }} fill="#d4a574" />
                          )}
                        </div>

                        {/* Info row with icon+label pairs */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 20,
                          flexWrap: 'wrap',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              backgroundColor: `${accentColor}12`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <MapPin size={12} style={{ color: accentColor }} />
                            </div>
                            <span style={{ fontSize: 13, color: '#a09888', fontWeight: 500 }}>{event.location}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              backgroundColor: `${accentColor}12`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Calendar size={12} style={{ color: accentColor }} />
                            </div>
                            <span style={{ fontSize: 13, color: '#a09888', fontWeight: 500 }}>{event.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              backgroundColor: `${accentColor}12`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Users size={12} style={{ color: accentColor }} />
                            </div>
                            <span style={{ fontSize: 13, color: '#a09888', fontWeight: 500 }}>{capacity.display}</span>
                          </div>
                        </div>
                      </div>

                      {/* Calendar date badge (prominent) */}
                      <div
                        style={{
                          width: 64,
                          height: 72,
                          borderRadius: 14,
                          backgroundColor: 'rgba(11, 13, 20, 0.7)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: `1px solid ${accentColor}30`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                          boxShadow: isUpcoming ? `0 4px 20px ${accentColor}20` : `0 2px 12px rgba(0,0,0,0.3)`,
                          animation: isUpcoming ? 'ev-datePulse 4s ease-in-out infinite' : 'none',
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
                            background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: accentColor,
                              letterSpacing: '0.12em',
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
                            marginTop: 2,
                          }}
                        >
                          {cal.year}
                        </span>
                      </div>
                    </div>

                    {/* Status badge + countdown row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, position: 'relative', zIndex: 1 }}>
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
                          background: config.gradient || config.bg,
                          border: config.border,
                          borderRadius: 20,
                          padding: '5px 16px',
                          boxShadow: config.glow ?? 'none',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isClicked ? 'scale(0.9)' : 'scale(1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08)';
                          e.currentTarget.style.boxShadow = `${config.glow ?? 'none'}, 0 0 0 3px ${config.text}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = config.glow ?? 'none';
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'scale(0.92)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08)';
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
                              animation: 'ev-eventPulse 2s infinite',
                            }}
                          />
                        )}
                        {isPlanning && <Clock size={12} />}
                        {config.label}
                      </button>

                      {/* Compact inline countdown badge */}
                      {(isUpcoming || isPlanning) && daysUntil !== null && daysUntil > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            color: accentColor,
                            backgroundColor: `${accentColor}10`,
                            padding: '4px 12px',
                            borderRadius: 10,
                            border: `1px solid ${accentColor}15`,
                          }}
                        >
                          <Zap size={11} />
                          {daysUntil}d away
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '24px 28px' }}>
                    {/* Countdown display for upcoming/planning events */}
                    {(isUpcoming || isPlanning) && daysUntil !== null && daysUntil > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <CountdownDisplay daysUntil={daysUntil} status={event.status} />
                      </div>
                    )}

                    {/* Description */}
                    <p
                      style={{
                        fontSize: 14,
                        color: '#a09888',
                        lineHeight: 1.65,
                        margin: '0 0 20px 0',
                      }}
                    >
                      {event.description}
                    </p>

                    {/* Capacity & RSVP Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      {/* Capacity Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '14px 18px',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: `${accentColor}12`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Ticket size={15} style={{ color: accentColor }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#a09888' }}>
                              Capacity
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: accentColor }}>
                              {isUpcoming ? `${ticketsSold} / ${ticketsTotal}` : isCompleted ? `${ticketsTotal} attended` : capacity.display}
                            </span>
                          </div>
                          {/* Capacity progress bar */}
                          <div
                            style={{
                              height: 6,
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <AnimatedProgress
                              percent={isUpcoming ? ticketPercent : isCompleted ? 100 : 0}
                              color={
                                isUpcoming
                                  ? 'linear-gradient(90deg, #d4a574, #d4a574cc)'
                                  : isCompleted
                                    ? 'linear-gradient(90deg, #6b8f71, #6b8f71cc)'
                                    : 'transparent'
                              }
                              glow={isUpcoming ? '0 0 8px rgba(212, 165, 116, 0.3)' : undefined}
                              delay={200 + idx * 120}
                            />
                          </div>
                        </div>
                      </div>

                      {/* RSVP Status */}
                      <RsvpAvatarRow eventId={event.id} status={event.status} capacity={capacity.total} />

                      {/* Weather Widget - for upcoming/planning events */}
                      {(isUpcoming || isPlanning) && (
                        <WeatherWidget location={event.location} daysUntil={daysUntil} />
                      )}

                      {/* Logistics Checklist - for upcoming/planning events */}
                      {(isUpcoming || isPlanning) && (
                        <LogisticsChecklist eventId={event.id} />
                      )}
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
                              <HighlightTooltip key={i} text={highlightDetails[h] || ''}>
                                <span
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
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: highlightDetails[h] ? 'help' : 'default',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = `0 2px 8px ${pillBorders[i % pillBorders.length]}`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
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
                                  {highlightDetails[h] && (
                                    <Info size={10} style={{ opacity: 0.5, flexShrink: 0 }} />
                                  )}
                                </span>
                              </HighlightTooltip>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Similar Past Events - show only for upcoming/planning */}
                    {(isUpcoming || isPlanning) && (
                      <SimilarPastEvents currentEvent={event} allEvents={events} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state with event creation CTA */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            animation: 'ev-fadeSlideUp 0.5s ease both',
          }}
        >
          {/* Decorative empty illustration */}
          <div style={{
            width: 80, height: 80, borderRadius: 20, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, rgba(212,165,116,0.1), rgba(139,92,246,0.08))',
            border: '1px solid rgba(212,165,116,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calendar size={32} style={{ color: '#d4a57450' }} />
          </div>
          <h3 style={{
            fontSize: 18, fontWeight: 700, color: '#f0ebe4', margin: '0 0 8px',
          }}>
            No events here yet
          </h3>
          <p style={{
            fontSize: 13, color: '#6b6358', margin: '0 0 24px', maxWidth: 320,
            marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6,
          }}>
            {activeTab === 'past'
              ? 'Completed events will appear here once your first gathering wraps up.'
              : 'Start planning your next gathering to bring the community together.'}
          </p>
          <button
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(212,165,116,0.3)',
              color: '#d4a574', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(212,165,116,0.1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(212,165,116,0.2)';
              e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,165,116,0.1)';
              e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)';
            }}
          >
            <Plus size={16} />
            Plan a Gathering
            <ArrowRight size={14} style={{ opacity: 0.7 }} />
          </button>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes ev-fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ev-datePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes ev-eventGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(212,165,116,0.25), 0 0 40px rgba(212,165,116,0.1); }
          50% { box-shadow: 0 0 30px rgba(212,165,116,0.35), 0 0 60px rgba(212,165,116,0.15); }
        }
        @keyframes ev-eventPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes ev-timelinePulse {
          0%, 100% { box-shadow: 0 0 12px var(--ev-accent, rgba(212,165,116,0.5)), 0 0 24px var(--ev-accent, rgba(212,165,116,0.2)); }
          50% { box-shadow: 0 0 20px var(--ev-accent, rgba(212,165,116,0.7)), 0 0 40px var(--ev-accent, rgba(212,165,116,0.3)), 0 0 0 6px transparent; }
        }
        @keyframes ev-slideIn {
          from { opacity: 0; transform: scaleX(0); }
          to { opacity: 1; transform: scaleX(1); }
        }
        @keyframes countdownPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; text-shadow: 0 0 30px var(--cd-color, rgba(212,165,116,0.6)); }
        }
        @keyframes ev-dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes ev-checkPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ev-celebrationFade {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes ev-celebrationBounce {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ev-tooltipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
