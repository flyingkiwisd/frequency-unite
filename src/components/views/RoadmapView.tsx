'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Map,
  CheckCircle2,
  Circle,
  Milestone,
  Zap,
  ArrowRight,
  MapPin,
  ChevronDown,
  ChevronRight,
  StickyNote,
  AlertTriangle,
  BarChart3,
  Save,
  Target,
  Clock,
  MessageCircle,
  Sparkles,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';

// ─── Types ───

interface RoadmapProgress {
  completedMilestones: Record<string, boolean[]>;
  notes: Record<string, string>;
}

interface ContributorAvatar {
  initials: string;
  color: string;
  name: string;
}

interface SuccessMetric {
  label: string;
  current: number;
  target: number;
  unit: string;
}

// ─── Constants ───

const STORAGE_KEY = 'frequency-roadmap-progress';

const statusStyles: Record<
  'active' | 'upcoming' | 'planned',
  {
    dotBg: string;
    dotBorder: string;
    glow: string;
    cardBg: string;
    cardBorder: string;
    cardGlow: string;
    label: string;
    labelBg: string;
    labelText: string;
  }
> = {
  active: {
    dotBg: '#d4a574',
    dotBorder: 'rgba(212, 165, 116, 0.4)',
    glow: '0 0 20px rgba(212, 165, 116, 0.5)',
    cardBg: 'rgba(19, 23, 32, 0.8)',
    cardBorder: 'rgba(212, 165, 116, 0.25)',
    cardGlow:
      '0 0 40px rgba(212, 165, 116, 0.08), inset 0 0 40px rgba(212, 165, 116, 0.02)',
    label: 'Active Now',
    labelBg: 'rgba(212, 165, 116, 0.15)',
    labelText: '#d4a574',
  },
  upcoming: {
    dotBg: '#8b5cf6',
    dotBorder: 'rgba(139, 92, 246, 0.3)',
    glow: '0 0 12px rgba(139, 92, 246, 0.3)',
    cardBg: 'rgba(19, 23, 32, 0.8)',
    cardBorder: 'rgba(139, 92, 246, 0.15)',
    cardGlow: 'none',
    label: 'Upcoming',
    labelBg: 'rgba(139, 92, 246, 0.12)',
    labelText: '#8b5cf6',
  },
  planned: {
    dotBg: '#3e4a5e',
    dotBorder: '#2e3a4e',
    glow: 'none',
    cardBg: 'rgba(19, 23, 32, 0.8)',
    cardBorder: '#1e2638',
    cardGlow: 'none',
    label: 'Planned',
    labelBg: 'rgba(160, 152, 136, 0.08)',
    labelText: '#6b6358',
  },
};

const colorMap: Record<string, string> = {
  amber: '#d4a574',
  violet: '#8b5cf6',
  emerald: '#6b8f71',
  sky: '#60a5fa',
  rose: '#f472b6',
};

const phaseDependencies: Record<string, string> = {
  'phase-1': 'Depends on: DAF compliance approval, CEO search timeline',
  'phase-2': 'Depends on: Blue Spirit 6.0 success, 80+ well-stewards',
  'phase-3': 'Depends on: $500K DAF target, node operationalization',
  'phase-4': 'Depends on: Bioregion pilot results, community feedback',
  'phase-5': 'Depends on: All prior phases, sustainable revenue model',
};

// Contributor avatars per milestone [phaseId][milestoneIdx]
const milestoneContributors: Record<string, ContributorAvatar[][]> = {
  'phase-1': [
    [{ initials: 'JH', color: '#d4a574', name: 'James H.' }, { initials: 'KM', color: '#8b5cf6', name: 'Kaitlin M.' }],
    [{ initials: 'KM', color: '#8b5cf6', name: 'Kaitlin M.' }],
    [{ initials: 'JH', color: '#d4a574', name: 'James H.' }, { initials: 'TC', color: '#6b8f71', name: 'Team Council' }],
    [{ initials: 'TC', color: '#6b8f71', name: 'Team Council' }],
    [{ initials: 'JH', color: '#d4a574', name: 'James H.' }, { initials: 'NS', color: '#60a5fa', name: 'Node Stewards' }],
  ],
  'phase-2': [
    [{ initials: 'JH', color: '#d4a574', name: 'James H.' }, { initials: 'EP', color: '#f472b6', name: 'Events Pod' }],
    [{ initials: 'NS', color: '#60a5fa', name: 'Node Stewards' }],
    [{ initials: 'TC', color: '#6b8f71', name: 'Team Council' }],
    [{ initials: 'KM', color: '#8b5cf6', name: 'Kaitlin M.' }],
    [{ initials: 'JH', color: '#d4a574', name: 'James H.' }],
  ],
  'phase-3': [
    [{ initials: 'TC', color: '#6b8f71', name: 'Team Council' }],
    [{ initials: 'JH', color: '#d4a574', name: 'James H.' }, { initials: 'KM', color: '#8b5cf6', name: 'Kaitlin M.' }],
    [{ initials: 'NS', color: '#60a5fa', name: 'Node Stewards' }],
    [{ initials: 'EP', color: '#f472b6', name: 'Events Pod' }],
    [{ initials: 'JH', color: '#d4a574', name: 'James H.' }],
  ],
  'phase-4': [
    [{ initials: 'NS', color: '#60a5fa', name: 'Node Stewards' }],
    [{ initials: 'TC', color: '#6b8f71', name: 'Team Council' }],
    [{ initials: 'KM', color: '#8b5cf6', name: 'Kaitlin M.' }],
    [{ initials: 'JH', color: '#d4a574', name: 'James H.' }],
    [{ initials: 'TC', color: '#6b8f71', name: 'Team Council' }],
  ],
  'phase-5': [
    [{ initials: 'TC', color: '#6b8f71', name: 'Team Council' }],
    [{ initials: 'NS', color: '#60a5fa', name: 'Node Stewards' }],
    [{ initials: 'JH', color: '#d4a574', name: 'James H.' }],
    [{ initials: 'TC', color: '#6b8f71', name: 'Team Council' }],
    [{ initials: 'EP', color: '#f472b6', name: 'Events Pod' }],
  ],
};

// Risk level per milestone: 0=none, 1=low, 2=medium, 3=high
const milestoneRiskLevels: Record<string, number[]> = {
  'phase-1': [1, 2, 1, 0, 1],
  'phase-2': [2, 1, 1, 3, 2],
  'phase-3': [1, 2, 2, 2, 3],
  'phase-4': [2, 1, 2, 3, 1],
  'phase-5': [2, 2, 3, 2, 1],
};

// Success metrics per phase
const phaseSuccessMetrics: Record<string, SuccessMetric[]> = {
  'phase-1': [
    { label: 'Well-Stewards', current: 52, target: 65, unit: '' },
    { label: 'Monthly Burn', current: 24, target: 25, unit: 'K' },
    { label: 'DAF Progress', current: 35, target: 100, unit: '%' },
  ],
  'phase-2': [
    { label: 'BS 6.0 Tickets', current: 0, target: 150, unit: '' },
    { label: 'Active Nodes', current: 3, target: 6, unit: '' },
    { label: 'Well-Stewards', current: 52, target: 100, unit: '' },
  ],
  'phase-3': [
    { label: 'Well-Stewards', current: 52, target: 144, unit: '' },
    { label: '2026 Revenue', current: 280, target: 2000, unit: 'K' },
    { label: 'Map Node', current: 15, target: 100, unit: '%' },
  ],
  'phase-4': [
    { label: 'Bioregion Sites', current: 1, target: 2, unit: '' },
    { label: 'Funded Projects', current: 2, target: 5, unit: '' },
    { label: 'Self-Org Score', current: 40, target: 80, unit: '%' },
  ],
  'phase-5': [
    { label: 'Global Stewards', current: 52, target: 200, unit: '' },
    { label: 'Active Bioregions', current: 1, target: 4, unit: '' },
    { label: 'Policy Impact', current: 5, target: 100, unit: '%' },
  ],
};

// Discussion/comment counts per phase
const phaseCommentCounts: Record<string, number> = {
  'phase-1': 12,
  'phase-2': 5,
  'phase-3': 3,
  'phase-4': 1,
  'phase-5': 0,
};

// Planned vs actual timeline data (percent through phase)
const phaseActualProgress: Record<string, { planned: number; actual: number }> = {
  'phase-1': { planned: 42, actual: 35 },
  'phase-2': { planned: 0, actual: 0 },
  'phase-3': { planned: 0, actual: 0 },
  'phase-4': { planned: 0, actual: 0 },
  'phase-5': { planned: 0, actual: 0 },
};

const riskColors = ['transparent', '#d4a574', '#f59e0b', '#ef4444'];
const riskLabels = ['', 'Low Risk', 'Medium Risk', 'High Risk'];

// Parse timeline strings to date ranges for "You are here" indicator
const phaseTimelineRanges: Record<string, { start: Date; end: Date }> = {
  'phase-1': { start: new Date('2026-01-01'), end: new Date('2026-06-30') },
  'phase-2': { start: new Date('2026-07-01'), end: new Date('2026-09-30') },
  'phase-3': { start: new Date('2026-10-01'), end: new Date('2026-12-31') },
  'phase-4': { start: new Date('2027-01-01'), end: new Date('2027-06-30') },
  'phase-5': { start: new Date('2027-07-01'), end: new Date('2027-12-31') },
};

// ─── Helpers ───

function loadProgress(): RoadmapProgress {
  if (typeof window === 'undefined') {
    return { completedMilestones: {}, notes: {} };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { completedMilestones: {}, notes: {} };
}

function saveProgress(progress: RoadmapProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors
  }
}

function getCurrentPhaseId(): string | null {
  const now = new Date();
  for (const [phaseId, range] of Object.entries(phaseTimelineRanges)) {
    if (now >= range.start && now <= range.end) {
      return phaseId;
    }
  }
  return null;
}

function getPhaseProgressPercent(
  phaseId: string,
  totalMilestones: number,
  completedMap: Record<string, boolean[]>,
): number {
  const completed = completedMap[phaseId];
  if (!completed || totalMilestones === 0) return 0;
  const count = completed.filter(Boolean).length;
  return Math.round((count / totalMilestones) * 100);
}

function getCompletedCount(
  phaseId: string,
  completedMap: Record<string, boolean[]>,
): number {
  const completed = completedMap[phaseId];
  if (!completed) return 0;
  return completed.filter(Boolean).length;
}

function getActivePhaseIndex(roadmapPhases: { status: string }[]): number {
  const activeIdx = roadmapPhases.findIndex((p) => p.status === 'active');
  if (activeIdx >= 0) return activeIdx;
  // Fallback: find first non-completed phase
  return roadmapPhases.findIndex((p) => p.status === 'upcoming');
}

function getDaysRemaining(phaseId: string): number | null {
  const range = phaseTimelineRanges[phaseId];
  if (!range) return null;
  const now = new Date();
  if (now < range.start || now > range.end) return null;
  const diff = range.end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getNoteWordCount(note: string): number {
  if (!note || !note.trim()) return 0;
  return note.trim().split(/\s+/).length;
}

// ─── Sparkle Particle Component ───
function SparkleEffect({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad) * 20;
    const dy = Math.sin(rad) * 20;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: i % 2 === 0 ? '#d4a574' : '#6b8f71',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `sparkleParticle 0.6s ease-out forwards`,
          animationDelay: `${i * 0.03}s`,
          ['--dx' as string]: `${dx}px`,
          ['--dy' as string]: `${dy}px`,
          opacity: 0,
        }}
      />
    );
  });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {particles}
    </div>
  );
}

// ─── Animated Counter Hook ───
function useAnimatedCounter(target: number, duration: number = 1200): number {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    if (start === target) {
      setCount(target);
      return;
    }
    const startTime = performance.now();
    let rafId: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (target - start) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return count;
}

// ─── Component ───

export function RoadmapView() {
  const { roadmapPhases } = useFrequencyData();
  const [progress, setProgress] = useState<RoadmapProgress>({
    completedMilestones: {},
    notes: {},
  });
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {},
  );
  const [mounted, setMounted] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Record<number, boolean>>({});
  const [visibleMilestones, setVisibleMilestones] = useState<Record<string, Record<number, boolean>>>({});
  const [progressAnimated, setProgressAnimated] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [recentlyToggled, setRecentlyToggled] = useState<string | null>(null);
  const [celebratingMilestone, setCelebratingMilestone] = useState<string | null>(null);
  const [expandedMetrics, setExpandedMetrics] = useState<Record<string, boolean>>({});
  const phaseCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress());
    setMounted(true);
  }, []);

  // Cascading reveal animation for cards (left to right feel)
  useEffect(() => {
    if (!mounted) return;
    roadmapPhases.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleCards((prev) => ({ ...prev, [idx]: true }));
      }, 200 * idx);
    });
    // Trigger progress bar animation after cards appear
    setTimeout(() => {
      setProgressAnimated(true);
    }, 300);
  }, [mounted, roadmapPhases]);

  // Staggered milestone reveal
  useEffect(() => {
    if (!mounted) return;
    roadmapPhases.forEach((phase, phaseIdx) => {
      phase.milestones.forEach((_, mIdx) => {
        setTimeout(() => {
          setVisibleMilestones((prev) => ({
            ...prev,
            [phase.id]: { ...(prev[phase.id] || {}), [mIdx]: true },
          }));
        }, 200 * phaseIdx + 80 * mIdx + 400);
      });
    });
  }, [mounted, roadmapPhases]);

  // Persist changes
  const updateProgress = useCallback((updater: (prev: RoadmapProgress) => RoadmapProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const toggleMilestone = useCallback(
    (phaseId: string, milestoneIdx: number, totalMilestones: number) => {
      const wasCompleted = progress.completedMilestones[phaseId]?.[milestoneIdx] ?? false;
      const willBeCompleted = !wasCompleted;
      setRecentlyToggled(`${phaseId}-${milestoneIdx}`);
      setTimeout(() => setRecentlyToggled(null), 600);
      // Trigger sparkle celebration when marking complete
      if (willBeCompleted) {
        setCelebratingMilestone(`${phaseId}-${milestoneIdx}`);
        setTimeout(() => setCelebratingMilestone(null), 700);
      }
      updateProgress((prev) => {
        const phaseMilestones = prev.completedMilestones[phaseId]
          ? [...prev.completedMilestones[phaseId]]
          : new Array(totalMilestones).fill(false);
        phaseMilestones[milestoneIdx] = !phaseMilestones[milestoneIdx];
        return {
          ...prev,
          completedMilestones: {
            ...prev.completedMilestones,
            [phaseId]: phaseMilestones,
          },
        };
      });
    },
    [updateProgress, progress.completedMilestones],
  );

  const toggleMetrics = useCallback((phaseId: string) => {
    setExpandedMetrics((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  }, []);

  const updateNote = useCallback(
    (phaseId: string, note: string) => {
      updateProgress((prev) => ({
        ...prev,
        notes: { ...prev.notes, [phaseId]: note },
      }));
    },
    [updateProgress],
  );

  const toggleNoteExpanded = useCallback((phaseId: string) => {
    setExpandedNotes((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  }, []);

  // Compute overall stats
  const overallStats = useMemo(() => {
    let totalMilestones = 0;
    let totalCompleted = 0;
    for (const phase of roadmapPhases) {
      totalMilestones += phase.milestones.length;
      totalCompleted += getCompletedCount(
        phase.id,
        progress.completedMilestones,
      );
    }
    return { totalMilestones, totalCompleted };
  }, [progress.completedMilestones, roadmapPhases]);

  const currentPhaseId = useMemo(() => getCurrentPhaseId(), []);
  const activePhaseIndex = useMemo(() => getActivePhaseIndex(roadmapPhases), [roadmapPhases]);

  // Animated counters
  const animatedOverallPercent = useAnimatedCounter(
    overallStats.totalMilestones > 0
      ? Math.round((overallStats.totalCompleted / overallStats.totalMilestones) * 100)
      : 0,
    1400,
  );

  // Avoid hydration mismatch: show non-interactive state until mounted
  if (!mounted) {
    return (
      <div style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 'min(1000px, 90vw)', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Map size={28} style={{ color: '#d4a574' }} />
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#f0ebe4',
              margin: 0,
            }}
          >
            Strategic Roadmap
          </h1>
        </div>
        <p
          style={{
            fontSize: 15,
            color: '#a09888',
            margin: '8px 0 0 40px',
            fontStyle: 'italic',
          }}
        >
          Loading roadmap...
        </p>
      </div>
    );
  }

  if (!roadmapPhases || roadmapPhases.length === 0) {
    return (
      <div style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 'min(1000px, 90vw)', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Map size={28} style={{ color: '#d4a574' }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>
            Strategic Roadmap
          </h1>
        </div>
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b6358',
            fontSize: 14,
          }}
        >
          No roadmap phases have been defined yet.
        </div>
      </div>
    );
  }

  const overallPercent =
    overallStats.totalMilestones > 0
      ? Math.round(
          (overallStats.totalCompleted / overallStats.totalMilestones) * 100,
        )
      : 0;

  const activePhaseNum = activePhaseIndex >= 0 ? activePhaseIndex + 1 : null;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 'min(1000px, 90vw)', margin: '0 auto' }}>
      {/* Header */}
      <div className="noise-overlay dot-pattern" style={{ marginBottom: 24 }}>
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
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(212, 165, 116, 0.15)',
              animation: 'headerIconGlow 4s ease-in-out infinite',
            }}
          >
            <Map size={24} style={{ color: '#d4a574' }} />
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
              Strategic Roadmap
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#a09888',
                margin: '2px 0 0 0',
                fontStyle: 'italic',
                lineHeight: 1.6,
              }}
            >
              Envision, fund, and implement the world we want to leave to our
              children
            </p>
          </div>
        </div>
      </div>

      {/* Compact Progress Summary - Glassmorphism */}
      <div
        className="card-premium noise-overlay"
        style={{
          backgroundColor: 'rgba(19, 23, 32, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background gradient shimmer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.03) 0%, transparent 50%, rgba(139, 92, 246, 0.03) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(139, 92, 246, 0.15))',
            border: '1px solid rgba(212, 165, 116, 0.2)',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Target size={22} style={{ color: '#d4a574' }} />
        </div>
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}
              >
                {activePhaseNum !== null ? `Phase ${activePhaseNum} of ${roadmapPhases.length} active` : 'No active phase'}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#d4a574',
                  background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(212, 165, 116, 0.08))',
                  padding: '4px 12px',
                  borderRadius: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  border: '1px solid rgba(212, 165, 116, 0.12)',
                  animation: overallPercent === 100 ? 'celebrationGlow 2s ease-in-out infinite' : 'none',
                }}
              >
                {animatedOverallPercent}% complete
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a09888' }}>
              {overallStats.totalCompleted} / {overallStats.totalMilestones}{' '}
              milestones
            </span>
          </div>
          <div
            style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: progressAnimated ? `${overallPercent}%` : '0%',
                background:
                  'linear-gradient(90deg, #d4a574, #8b5cf6)',
                borderRadius: 4,
                transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                boxShadow: overallPercent === 100 ? '0 0 20px rgba(107, 143, 113, 0.5)' : '0 0 12px rgba(212, 165, 116, 0.3)',
              }}
            >
              {/* Shimmer effect on the progress bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                  animation: 'shimmer 2s infinite',
                }}
              />
            </div>
          </div>
          {/* Phase mini indicators with sliding active marker */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {roadmapPhases.map((phase, idx) => {
              const pPercent = getPhaseProgressPercent(
                phase.id,
                phase.milestones.length,
                progress.completedMilestones,
              );
              const accentColor = colorMap[phase.color] ?? '#a09888';
              const isActivePhase = idx === activePhaseIndex;
              return (
                <div
                  key={phase.id}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    position: 'relative',
                  }}
                >
                  {/* Mini progress dot */}
                  <div
                    style={{
                      width: isActivePhase ? 10 : 7,
                      height: isActivePhase ? 10 : 7,
                      borderRadius: '50%',
                      backgroundColor: pPercent === 100 ? '#6b8f71' : pPercent > 0 ? accentColor : 'rgba(255,255,255,0.1)',
                      border: isActivePhase ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.4s ease',
                      boxShadow: isActivePhase ? `0 0 8px ${accentColor}66` : 'none',
                      animation: isActivePhase ? 'phaseNodePulse 2.5s ease-in-out infinite' : 'none',
                    }}
                  />
                  <div
                    style={{
                      height: 3,
                      width: '100%',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: progressAnimated ? `${pPercent}%` : '0%',
                        backgroundColor: pPercent === 100 ? '#6b8f71' : accentColor,
                        borderRadius: 2,
                        transition: `width 1s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.15}s`,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: isActivePhase ? 700 : 500,
                      color: isActivePhase ? accentColor : '#6b6358',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    P{idx + 1}
                  </span>
                  {/* Active phase sliding underline */}
                  {isActivePhase && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        left: '20%',
                        right: '20%',
                        height: 2,
                        backgroundColor: accentColor,
                        borderRadius: 1,
                        animation: 'slideIn 0.5s ease-out',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Horizontal Phase Timeline ── */}
      <div
        className="card-premium"
        style={{
          backgroundColor: 'rgba(19, 23, 32, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: 16,
          padding: '24px 28px 20px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background shimmer */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.02) 0%, transparent 40%, rgba(139, 92, 246, 0.02) 100%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <MapPin size={14} style={{ color: '#d4a574' }} />
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>Phase Timeline</span>
        </div>

        <div style={{ position: 'relative', padding: '0 20px', zIndex: 1 }}>
          {/* Connecting line - base track */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 40,
            right: 40,
            height: 3,
            background: 'linear-gradient(90deg, rgba(212, 165, 116, 0.15), rgba(139, 92, 246, 0.15), rgba(107, 143, 113, 0.1), rgba(96, 165, 250, 0.08))',
            borderRadius: 2,
          }} />

          {/* Gradient fill that grows as phases complete */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 40,
            width: progressAnimated
              ? `${Math.max(0, ((activePhaseIndex + (overallPercent > 0 ? 0.5 : 0)) / Math.max(roadmapPhases.length - 1, 1)) * (100 - 10))}%`
              : '0%',
            height: 3,
            background: 'linear-gradient(90deg, #d4a574, #8b5cf6, #6b8f71)',
            borderRadius: 2,
            transition: 'width 2s cubic-bezier(0.23, 1, 0.32, 1)',
            boxShadow: '0 0 10px rgba(212, 165, 116, 0.4), 0 0 20px rgba(139, 92, 246, 0.2)',
          }}>
            {/* Animated leading edge particle */}
            <div style={{
              position: 'absolute',
              right: -2,
              top: -2,
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#d4a574',
              boxShadow: '0 0 8px rgba(212, 165, 116, 0.8)',
              animation: 'pulseCore 2s ease-in-out infinite',
            }} />
          </div>

          {/* SVG Dependency arrows between phase dots */}
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 40,
            right: 40,
            height: 34,
            pointerEvents: 'none',
            overflow: 'visible',
          }}>
            <defs>
              <marker id="depArrowHead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <path d="M0,0 L6,2 L0,4" fill="rgba(212, 165, 116, 0.3)" />
              </marker>
            </defs>
            {roadmapPhases.slice(0, -1).map((_, idx) => {
              const segW = 100 / (roadmapPhases.length - 1);
              const x1 = segW * idx + 3;
              const x2 = segW * (idx + 1) - 3;
              const isPastConnection = idx < activePhaseIndex;
              return (
                <line
                  key={`dep-${idx}`}
                  x1={`${x1}%`}
                  y1="17"
                  x2={`${x2}%`}
                  y2="17"
                  stroke={isPastConnection ? 'rgba(107, 143, 113, 0.25)' : 'rgba(212, 165, 116, 0.15)'}
                  strokeWidth="1"
                  strokeDasharray={isPastConnection ? 'none' : '4 3'}
                  markerEnd="url(#depArrowHead)"
                  style={{
                    animation: isPastConnection ? 'none' : `depArrowFlow 3s linear infinite ${idx * 0.5}s`,
                  }}
                />
              );
            })}
          </svg>

          {/* Phase markers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {roadmapPhases.map((phase, idx) => {
              const accentColor = colorMap[phase.color] ?? '#a09888';
              const isActivePhase = idx === activePhaseIndex;
              const isPast = idx < activePhaseIndex;
              const pPercent = getPhaseProgressPercent(phase.id, phase.milestones.length, progress.completedMilestones);
              const isComplete = pPercent === 100;

              return (
                <div key={phase.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  {/* Dot marker */}
                  <div style={{
                    width: isActivePhase ? 32 : 24,
                    height: isActivePhase ? 32 : 24,
                    borderRadius: '50%',
                    backgroundColor: isComplete ? '#6b8f71' : isActivePhase ? accentColor : isPast ? `${accentColor}aa` : 'rgba(62, 74, 94, 0.5)',
                    border: isActivePhase ? `3px solid ${accentColor}40` : isComplete ? '2px solid rgba(107, 143, 113, 0.4)' : '2px solid rgba(62, 74, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    boxShadow: isActivePhase
                      ? `0 0 20px ${accentColor}50, 0 0 40px ${accentColor}20`
                      : isComplete
                        ? '0 0 12px rgba(107, 143, 113, 0.3)'
                        : 'none',
                    animation: isActivePhase ? 'phaseNodePulse 2.5s ease-in-out infinite' : 'none',
                  }}>
                    {isComplete ? (
                      <CheckCircle2 size={isActivePhase ? 14 : 12} style={{ color: '#fff' }} />
                    ) : isActivePhase ? (
                      <Zap size={14} style={{ color: '#fff' }} fill="#fff" />
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, color: isPast ? '#fff' : '#6b6358' }}>{idx + 1}</span>
                    )}
                    {/* Active pulse ring */}
                    {isActivePhase && (
                      <div style={{
                        position: 'absolute',
                        inset: -6,
                        borderRadius: '50%',
                        border: `2px solid ${accentColor}30`,
                        animation: 'pulseRing 2.5s ease-in-out infinite',
                      }} />
                    )}
                  </div>

                  {/* Phase label */}
                  <div style={{ textAlign: 'center', minWidth: 0, maxWidth: '100%' }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: isActivePhase ? 700 : 500,
                      color: isActivePhase ? '#f0ebe4' : isPast || isComplete ? '#a09888' : '#6b6358',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'color 0.3s',
                    }}>
                      {phase.name.replace(/^Phase \d+:\s*/, '').split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div style={{
                      fontSize: 9,
                      color: isActivePhase ? accentColor : '#6b6358',
                      fontWeight: 500,
                      marginTop: 2,
                    }}>
                      {phase.timeline}
                    </div>
                    {isActivePhase && (
                      <div style={{
                        fontSize: 8,
                        fontWeight: 700,
                        color: '#d4a574',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginTop: 4,
                        backgroundColor: 'rgba(212, 165, 116, 0.12)',
                        border: '1px solid rgba(212, 165, 116, 0.15)',
                        borderRadius: 8,
                        padding: '2px 8px',
                        display: 'inline-block',
                      }}>
                        Current
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Planned vs Actual Timeline Comparison */}
        <div style={{ marginTop: 20, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <TrendingUp size={12} style={{ color: '#a09888' }} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6358' }}>Planned vs Actual</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 3, borderRadius: 1, backgroundColor: 'rgba(139, 92, 246, 0.6)' }} />
                <span style={{ fontSize: 9, color: '#6b6358' }}>Planned</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 3, borderRadius: 1, backgroundColor: '#d4a574' }} />
                <span style={{ fontSize: 9, color: '#6b6358' }}>Actual</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {roadmapPhases.map((phase) => {
              const ap = phaseActualProgress[phase.id] ?? { planned: 0, actual: 0 };
              const isAhead = ap.actual >= ap.planned;
              return (
                <div key={phase.id} style={{ flex: 1 }}>
                  {/* Planned bar */}
                  <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 2, marginBottom: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: progressAnimated ? `${ap.planned}%` : '0%',
                      backgroundColor: 'rgba(139, 92, 246, 0.4)',
                      borderRadius: 2,
                      transition: 'width 1.5s cubic-bezier(0.23, 1, 0.32, 1)',
                    }} />
                  </div>
                  {/* Actual bar */}
                  <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: progressAnimated ? `${ap.actual}%` : '0%',
                      backgroundColor: isAhead ? '#6b8f71' : '#d4a574',
                      borderRadius: 2,
                      transition: 'width 1.5s cubic-bezier(0.23, 1, 0.32, 1)',
                      boxShadow: ap.actual > 0 ? `0 0 4px ${isAhead ? 'rgba(107, 143, 113, 0.4)' : 'rgba(212, 165, 116, 0.4)'}` : 'none',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase Cards with SVG Timeline */}
      <div style={{ position: 'relative' }}>
        {/* SVG Vertical Timeline with animated gradient */}
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 50,
            height: '100%',
            overflow: 'visible',
          }}
        >
          <defs>
            <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(212, 165, 116, 0.6)">
                <animate attributeName="stopColor" values="rgba(212,165,116,0.6);rgba(139,92,246,0.6);rgba(212,165,116,0.6)" dur="6s" repeatCount="indefinite" />
              </stop>
              <stop offset="35%" stopColor="rgba(139, 92, 246, 0.5)">
                <animate attributeName="stopColor" values="rgba(139,92,246,0.5);rgba(107,143,113,0.5);rgba(139,92,246,0.5)" dur="6s" repeatCount="indefinite" />
              </stop>
              <stop offset="65%" stopColor="rgba(107, 143, 113, 0.4)">
                <animate attributeName="stopColor" values="rgba(107,143,113,0.4);rgba(212,165,116,0.4);rgba(107,143,113,0.4)" dur="6s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="rgba(96, 165, 250, 0.2)">
                <animate attributeName="stopColor" values="rgba(96,165,250,0.2);rgba(244,114,182,0.2);rgba(96,165,250,0.2)" dur="6s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            <linearGradient id="timelineGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(212, 165, 116, 0.15)" />
              <stop offset="50%" stopColor="rgba(139, 92, 246, 0.1)" />
              <stop offset="100%" stopColor="rgba(107, 143, 113, 0.05)" />
            </linearGradient>
            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Glow behind the timeline line */}
          <line
            x1="25"
            y1="0"
            x2="25"
            y2="9999"
            stroke="url(#timelineGlowGrad)"
            strokeWidth="8"
            style={{
              animation: 'timelineDraw 1.5s ease-out forwards',
            }}
          />
          {/* Main timeline line */}
          <line
            x1="25"
            y1="0"
            x2="25"
            y2="9999"
            stroke="url(#timelineGrad)"
            strokeWidth="2"
            strokeDasharray="6 4"
            style={{
              animation: 'timelineDraw 1.5s ease-out forwards',
            }}
          />
        </svg>

        {roadmapPhases.map((phase, idx) => {
          const style = statusStyles[phase.status];
          const accentColor = colorMap[phase.color] ?? '#a09888';
          const isActive = phase.status === 'active';
          const isCurrent = phase.id === currentPhaseId;
          const phaseCompleted = getCompletedCount(
            phase.id,
            progress.completedMilestones,
          );
          const phasePercent = getPhaseProgressPercent(
            phase.id,
            phase.milestones.length,
            progress.completedMilestones,
          );
          const noteExpanded = expandedNotes[phase.id] ?? false;
          const noteText = progress.notes[phase.id] ?? '';
          const isVisible = visibleCards[idx] ?? false;
          const isHovered = hoveredCard === idx;
          const isPhaseComplete = phasePercent === 100;

          return (
            <div
              key={phase.id}
              style={{
                position: 'relative',
                paddingLeft: 56,
                marginBottom: idx < roadmapPhases.length - 1 ? 24 : 0,
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? 'translateX(0) translateY(0)'
                  : 'translateX(-30px) translateY(10px)',
                transition: `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.05}s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.05}s`,
              }}
            >
              {/* SVG Timeline Dot */}
              <svg
                style={{
                  position: 'absolute',
                  left: isActive ? 5 : 9,
                  top: isActive ? 18 : 20,
                  width: isActive ? 40 : 32,
                  height: isActive ? 40 : 32,
                  overflow: 'visible',
                  zIndex: 2,
                }}
              >
                {/* Outer glow ring for active */}
                {isActive && (
                  <circle
                    cx={isActive ? 20 : 16}
                    cy={isActive ? 20 : 16}
                    r={isActive ? 18 : 14}
                    fill="none"
                    stroke={style.dotBorder}
                    strokeWidth="2"
                    style={{
                      animation: 'pulseRing 2.5s ease-in-out infinite',
                    }}
                  />
                )}
                {/* Completed phase outer ring */}
                {isPhaseComplete && !isActive && (
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="rgba(107, 143, 113, 0.4)"
                    strokeWidth="2"
                    style={{
                      animation: 'completedRingPulse 3s ease-in-out infinite',
                    }}
                  />
                )}
                {/* Main dot */}
                <circle
                  cx={isActive ? 20 : 16}
                  cy={isActive ? 20 : 16}
                  r={isActive ? 12 : 9}
                  fill={isPhaseComplete ? '#6b8f71' : style.dotBg}
                  stroke={isPhaseComplete ? 'rgba(107, 143, 113, 0.5)' : style.dotBorder}
                  strokeWidth="3"
                  filter={isActive ? 'url(#strongGlow)' : isPhaseComplete ? 'url(#glowFilter)' : undefined}
                />
                {/* Inner dot for active */}
                {isActive && !isPhaseComplete && (
                  <circle
                    cx="20"
                    cy="20"
                    r="4"
                    fill="#fff"
                    opacity="0.7"
                    style={{
                      animation: 'pulseCore 2s ease-in-out infinite',
                    }}
                  />
                )}
                {/* Animated checkmark for completed phases */}
                {isPhaseComplete && (
                  <g style={{ animation: 'milestoneCheck 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
                    <text
                      x={isActive ? 20 : 16}
                      y={isActive ? 25 : 21}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      &#10003;
                    </text>
                  </g>
                )}
                {/* Phase number for non-active, non-completed */}
                {!isPhaseComplete && !isActive && (
                  <text
                    x="16"
                    y="20"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {idx + 1}
                  </text>
                )}
              </svg>

              {/* "You are here" marker with glowing dot */}
              {isCurrent && (
                <div
                  style={{
                    position: 'absolute',
                    left: -6,
                    top: isActive ? 60 : 56,
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0,
                    }}
                  >
                    {/* Glowing dot above pin */}
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#d4a574',
                        boxShadow: '0 0 12px rgba(212, 165, 116, 0.8), 0 0 24px rgba(212, 165, 116, 0.4)',
                        animation: 'youAreHereGlow 2s ease-in-out infinite',
                        marginBottom: 2,
                      }}
                    />
                    <MapPin
                      size={16}
                      style={{ color: '#d4a574' }}
                      fill="#d4a574"
                    />
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        color: '#d4a574',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        whiteSpace: 'nowrap',
                        background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(212, 165, 116, 0.1))',
                        padding: '2px 6px',
                        borderRadius: 4,
                        marginTop: 2,
                        border: '1px solid rgba(212, 165, 116, 0.2)',
                        animation: 'youAreHerePulse 3s ease-in-out infinite',
                      }}
                    >
                      You are here
                    </span>
                  </div>
                </div>
              )}

              {/* Phase connector arrow */}
              {idx < roadmapPhases.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 21,
                    bottom: -16,
                    zIndex: 3,
                  }}
                >
                  <ArrowRight
                    size={10}
                    style={{
                      color: '#2e3a4e',
                      transform: 'rotate(90deg)',
                    }}
                  />
                </div>
              )}

              {/* Phase Card - Premium Glassmorphism with gradient fill */}
              <div
                className="roadmap-phase-card card-premium"
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: style.cardBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${isActive && isHovered ? 'rgba(212, 165, 116, 0.45)' : isActive ? 'rgba(212, 165, 116, 0.3)' : isHovered ? 'rgba(255, 255, 255, 0.1)' : style.cardBorder}`,
                  borderRadius: 18,
                  padding: isActive ? 28 : 24,
                  boxShadow: isActive
                    ? isHovered
                      ? `0 0 60px rgba(212, 165, 116, 0.15), 0 20px 60px rgba(0,0,0,0.3), inset 0 0 60px rgba(212, 165, 116, 0.04), 0 0 0 1px rgba(212, 165, 116, 0.15)`
                      : `0 0 40px rgba(212, 165, 116, 0.08), inset 0 0 40px rgba(212, 165, 116, 0.02), 0 0 0 1px rgba(212, 165, 116, 0.12)`
                    : isPhaseComplete
                      ? isHovered
                        ? '0 0 40px rgba(107, 143, 113, 0.12), 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(107, 143, 113, 0.1)'
                        : '0 0 20px rgba(107, 143, 113, 0.06), 0 0 0 1px rgba(107, 143, 113, 0.05)'
                      : isHovered
                        ? '0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                        : style.cardGlow,
                  transition: 'border-color 0.3s ease, box-shadow 0.5s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Active phase top accent line with animated gradient */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${accentColor}, #8b5cf6, ${accentColor})`,
                      backgroundSize: '200% 100%',
                      animation: 'gradientSlide 3s linear infinite',
                      boxShadow: `0 0 12px ${accentColor}40`,
                    }}
                  />
                )}

                {/* Phase progress gradient fill (background fills from left based on progress) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${phasePercent}%`,
                    background: isPhaseComplete
                      ? 'linear-gradient(135deg, rgba(107, 143, 113, 0.06) 0%, rgba(107, 143, 113, 0.02) 100%)'
                      : isActive
                        ? `linear-gradient(135deg, ${accentColor}0d 0%, ${accentColor}04 100%)`
                        : `linear-gradient(135deg, ${accentColor}08 0%, transparent 100%)`,
                    pointerEvents: 'none',
                    transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1)',
                    borderRight: phasePercent > 0 && phasePercent < 100
                      ? `1px solid ${isPhaseComplete ? 'rgba(107, 143, 113, 0.15)' : `${accentColor}15`}`
                      : 'none',
                  }}
                />

                {/* Celebration glow overlay for 100% complete */}
                {isPhaseComplete && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(ellipse at 50% 0%, rgba(107, 143, 113, 0.08) 0%, transparent 70%)',
                      pointerEvents: 'none',
                      animation: 'celebrationPulse 3s ease-in-out infinite',
                    }}
                  />
                )}

                {/* Active phase animated glow border overlay */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 18,
                      border: '1px solid transparent',
                      background: `linear-gradient(135deg, ${accentColor}08, transparent 50%, ${accentColor}04) border-box`,
                      pointerEvents: 'none',
                      animation: 'activePhaseGlow 4s ease-in-out infinite',
                    }}
                  />
                )}

                {/* Glassmorphism noise overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Card header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                    flexWrap: 'wrap',
                    gap: 10,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <h2
                        style={{
                          fontSize: isActive ? 22 : 18,
                          fontWeight: 700,
                          color: isActive ? '#f0ebe4' : '#d8cfc4',
                          margin: 0,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {phase.name}
                      </h2>
                      {isActive && (
                        <Zap
                          size={16}
                          style={{ color: '#d4a574', animation: 'zapPulse 2s ease-in-out infinite' }}
                          fill="#d4a574"
                        />
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: accentColor,
                        margin: 0,
                        fontWeight: 500,
                        opacity: isActive ? 1 : 0.8,
                      }}
                    >
                      {phase.subtitle}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 6,
                    }}
                  >
                    {/* Status badge with animated background */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: isPhaseComplete ? '#6b8f71' : style.labelText,
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(212, 165, 116, 0.1))'
                          : isPhaseComplete
                            ? 'linear-gradient(135deg, rgba(107, 143, 113, 0.2), rgba(107, 143, 113, 0.1))'
                            : style.labelBg,
                        backgroundSize: isActive ? '200% 200%' : 'auto',
                        animation: isActive ? 'statusBadgeGlow 3s ease-in-out infinite' : 'none',
                        borderRadius: 12,
                        padding: '4px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        border: `1px solid ${isActive ? 'rgba(212, 165, 116, 0.15)' : isPhaseComplete ? 'rgba(107, 143, 113, 0.15)' : 'transparent'}`,
                      }}
                    >
                      {isActive && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#d4a574',
                            boxShadow: '0 0 8px rgba(212, 165, 116, 0.6)',
                            display: 'inline-block',
                            animation: 'pulse 2s infinite',
                          }}
                        />
                      )}
                      {isPhaseComplete && (
                        <CheckCircle2 size={10} style={{ color: '#6b8f71' }} />
                      )}
                      {isPhaseComplete ? 'Complete' : style.label}
                    </span>

                    {/* Timeline */}
                    <span
                      style={{
                        fontSize: 12,
                        color: '#6b6358',
                        fontWeight: 500,
                      }}
                    >
                      {phase.timeline}
                    </span>
                  </div>
                </div>

                {/* Enhanced Phase Progress Bar with animated gradient fill */}
                <div style={{ marginBottom: 18, position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#a09888',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        Phase Progress
                      </span>
                      {isActive && phasePercent > 0 && phasePercent < 100 && (
                        <span style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: accentColor,
                          backgroundColor: `${accentColor}15`,
                          border: `1px solid ${accentColor}20`,
                          borderRadius: 8,
                          padding: '1px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          In Progress
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isPhaseComplete ? '#6b8f71' : accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 500, color: '#a09888' }}>
                        {phaseCompleted}/{phase.milestones.length}
                      </span>
                      <span style={{
                        backgroundColor: isPhaseComplete ? 'rgba(107, 143, 113, 0.12)' : `${accentColor}12`,
                        padding: '2px 8px',
                        borderRadius: 8,
                        fontSize: 12,
                      }}>
                        {phasePercent}%
                      </span>
                    </span>
                  </div>
                  {/* Progress bar track */}
                  <div
                    style={{
                      height: 10,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderRadius: 5,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid rgba(255,255,255,0.03)',
                    }}
                  >
                    {/* Background track segments */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', gap: 1 }}>
                      {phase.milestones.map((_, mIdx) => (
                        <div
                          key={mIdx}
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(255,255,255,0.015)',
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </div>
                    {/* Animated gradient fill - grows from 0 on mount */}
                    <div
                      style={{
                        height: '100%',
                        width: progressAnimated ? `${phasePercent}%` : '0%',
                        background: isPhaseComplete
                          ? 'linear-gradient(90deg, #4a7a50, #6b8f71, #8bc49a)'
                          : isActive
                            ? `linear-gradient(90deg, ${accentColor}cc, ${accentColor}, ${accentColor}ee)`
                            : `linear-gradient(90deg, ${accentColor}99, ${accentColor}cc)`,
                        backgroundSize: isActive ? '200% 100%' : '100% 100%',
                        animation: isActive && phasePercent > 0 ? 'gradientSlide 4s linear infinite' : 'none',
                        borderRadius: 5,
                        transition: `width 1.2s cubic-bezier(0.23, 1, 0.32, 1) ${0.2 + idx * 0.15}s`,
                        position: 'relative',
                        boxShadow: isPhaseComplete
                          ? '0 0 16px rgba(107, 143, 113, 0.5), 0 2px 8px rgba(107, 143, 113, 0.3)'
                          : phasePercent > 0
                            ? `0 0 12px ${accentColor}44, 0 2px 6px ${accentColor}22`
                            : 'none',
                      }}
                    >
                      {/* Animated shimmer on progress */}
                      {phasePercent > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                            animation: isActive ? 'shimmer 2s infinite' : 'shimmer 4s infinite',
                          }}
                        />
                      )}
                      {/* Leading edge glow */}
                      {phasePercent > 0 && phasePercent < 100 && (
                        <div style={{
                          position: 'absolute',
                          right: 0,
                          top: -1,
                          bottom: -1,
                          width: 6,
                          background: `linear-gradient(to right, transparent, ${isPhaseComplete ? '#8bc49a' : accentColor})`,
                          filter: `blur(2px)`,
                          borderRadius: '0 5px 5px 0',
                        }} />
                      )}
                    </div>
                  </div>
                  {/* Milestone markers on the progress bar track */}
                  <div
                    style={{
                      position: 'relative',
                      height: 8,
                      marginTop: 4,
                    }}
                  >
                    {phase.milestones.map((_, mIdx) => {
                      const markerPos = ((mIdx + 1) / phase.milestones.length) * 100;
                      const isCompleted = progress.completedMilestones[phase.id]?.[mIdx] ?? false;
                      return (
                        <div
                          key={mIdx}
                          style={{
                            position: 'absolute',
                            left: `${markerPos}%`,
                            top: 0,
                            transform: 'translateX(-50%)',
                            width: isCompleted ? 6 : 4,
                            height: isCompleted ? 6 : 4,
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? (isPhaseComplete ? '#6b8f71' : accentColor) : 'rgba(255,255,255,0.08)',
                            border: isCompleted ? `1px solid ${isPhaseComplete ? 'rgba(107, 143, 113, 0.5)' : `${accentColor}50`}` : 'none',
                            transition: 'all 0.3s ease',
                            boxShadow: isCompleted ? `0 0 4px ${isPhaseComplete ? 'rgba(107, 143, 113, 0.4)' : `${accentColor}40`}` : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced Milestones with premium checkmark/pending indicators */}
                <div
                  className="scrollbar-autohide"
                  style={{
                    backgroundColor: isActive ? 'rgba(212, 165, 116, 0.02)' : 'rgba(255,255,255,0.02)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    border: `1px solid ${isActive ? 'rgba(212, 165, 116, 0.06)' : 'rgba(255,255,255,0.03)'}`,
                    marginBottom: 12,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: isActive ? accentColor : '#6b6358',
                      marginBottom: 14,
                      paddingBottom: 10,
                      borderBottom: `1px solid ${isActive ? `${accentColor}10` : 'rgba(255,255,255,0.03)'}`,
                    }}
                  >
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? `${accentColor}15` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? `${accentColor}25` : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <Milestone size={11} />
                    </div>
                    Milestones
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 10,
                      color: isPhaseComplete ? '#6b8f71' : isActive ? accentColor : '#6b6358',
                      fontWeight: 600,
                      textTransform: 'none',
                      letterSpacing: 'normal',
                      backgroundColor: isPhaseComplete ? 'rgba(107, 143, 113, 0.1)' : isActive ? `${accentColor}10` : 'rgba(255,255,255,0.04)',
                      padding: '2px 10px',
                      borderRadius: 8,
                    }}>
                      {phaseCompleted}/{phase.milestones.length} done
                    </span>
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    {phase.milestones.map((milestone, mIdx) => {
                      const isCompleted =
                        progress.completedMilestones[phase.id]?.[mIdx] ?? false;
                      const isMilestoneVisible = visibleMilestones[phase.id]?.[mIdx] ?? false;
                      const wasJustToggled = recentlyToggled === `${phase.id}-${mIdx}`;
                      const isCelebrating = celebratingMilestone === `${phase.id}-${mIdx}`;
                      const contributors = milestoneContributors[phase.id]?.[mIdx] ?? [];
                      const riskLevel = milestoneRiskLevels[phase.id]?.[mIdx] ?? 0;
                      const daysLeft = isActive ? getDaysRemaining(phase.id) : null;

                      return (
                        <li
                          key={mIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            fontSize: 13,
                            color: isCompleted
                              ? '#6b8f71'
                              : phase.status === 'planned'
                                ? '#6b6358'
                                : '#b0a898',
                            lineHeight: 1.5,
                            cursor: 'pointer',
                            padding: '7px 10px',
                            borderRadius: 10,
                            transition: 'background-color 0.2s ease, transform 0.2s ease, opacity 0.4s ease, translate 0.4s ease',
                            backgroundColor: isCompleted ? 'rgba(107, 143, 113, 0.05)' : 'transparent',
                            opacity: isMilestoneVisible ? 1 : 0,
                            translate: isMilestoneVisible ? '0 0' : '0 8px',
                            position: 'relative',
                          }}
                          onClick={() =>
                            toggleMilestone(
                              phase.id,
                              mIdx,
                              phase.milestones.length,
                            )
                          }
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              isCompleted ? 'rgba(107, 143, 113, 0.08)' : 'rgba(255,255,255,0.03)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              isCompleted ? 'rgba(107, 143, 113, 0.05)' : 'transparent';
                          }}
                        >
                          {/* Sparkle celebration effect */}
                          <SparkleEffect active={isCelebrating} />

                          {/* Custom checkmark/pending indicator with animation */}
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              position: 'relative',
                              backgroundColor: isCompleted
                                ? 'rgba(107, 143, 113, 0.2)'
                                : 'rgba(255,255,255,0.04)',
                              border: isCompleted
                                ? '1.5px solid rgba(107, 143, 113, 0.4)'
                                : `1.5px solid ${isActive ? `${accentColor}44` : phase.status === 'upcoming' ? `${accentColor}33` : 'rgba(255,255,255,0.06)'}`,
                              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              transform: wasJustToggled ? 'scale(1.2)' : 'scale(1)',
                              boxShadow: isCelebrating
                                ? '0 0 20px rgba(107, 143, 113, 0.6), 0 0 40px rgba(212, 165, 116, 0.3)'
                                : isCompleted && wasJustToggled ? '0 0 12px rgba(107, 143, 113, 0.4)' : 'none',
                              animation: !isCompleted && isActive ? 'milestoneGoldPulse 3s ease-in-out infinite' : 'none',
                            }}
                          >
                            {isCompleted ? (
                              <CheckCircle2
                                size={14}
                                style={{
                                  color: '#6b8f71',
                                  animation: wasJustToggled ? 'milestoneCheck 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                                }}
                              />
                            ) : (
                              <Circle
                                size={10}
                                style={{
                                  color: isActive
                                    ? accentColor
                                    : phase.status === 'upcoming'
                                      ? accentColor
                                      : '#3e4a5e',
                                  opacity: isActive ? 0.6 : 0.4,
                                }}
                              />
                            )}
                          </div>

                          {/* Milestone text */}
                          <span
                            style={{
                              textDecoration: isCompleted
                                ? 'line-through'
                                : 'none',
                              textDecorationColor: isCompleted ? 'rgba(107, 143, 113, 0.5)' : undefined,
                              opacity: isCompleted ? 0.7 : 1,
                              flex: 1,
                              transition: 'opacity 0.3s ease',
                            }}
                          >
                            {milestone}
                          </span>

                          {/* Right side: risk + avatars + days remaining + status */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {/* Risk indicator */}
                            {riskLevel >= 2 && !isCompleted && (
                              <div
                                title={riskLabels[riskLevel]}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  padding: '1px 6px',
                                  borderRadius: 6,
                                  backgroundColor: `${riskColors[riskLevel]}15`,
                                  border: `1px solid ${riskColors[riskLevel]}25`,
                                  animation: riskLevel === 3 ? 'riskPulse 2s ease-in-out infinite' : 'none',
                                }}
                              >
                                <AlertTriangle size={9} style={{ color: riskColors[riskLevel] }} />
                                <span style={{ fontSize: 8, fontWeight: 600, color: riskColors[riskLevel], textTransform: 'uppercase' }}>
                                  {riskLevel === 3 ? 'High' : 'Med'}
                                </span>
                              </div>
                            )}

                            {/* Contributor avatars */}
                            {contributors.length > 0 && (
                              <div style={{ display: 'flex', marginLeft: 2 }}>
                                {contributors.slice(0, 3).map((c, cIdx) => (
                                  <div
                                    key={cIdx}
                                    title={c.name}
                                    style={{
                                      width: 20,
                                      height: 20,
                                      borderRadius: '50%',
                                      backgroundColor: `${c.color}25`,
                                      border: `1.5px solid ${c.color}50`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 7,
                                      fontWeight: 700,
                                      color: c.color,
                                      marginLeft: cIdx > 0 ? -6 : 0,
                                      zIndex: 3 - cIdx,
                                      position: 'relative',
                                      transition: 'transform 0.2s ease',
                                    }}
                                  >
                                    {c.initials}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Days remaining badge (active phase, incomplete milestones only) */}
                            {isActive && !isCompleted && daysLeft !== null && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                padding: '2px 7px',
                                borderRadius: 8,
                                backgroundColor: daysLeft <= 30 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 165, 116, 0.1)',
                                border: `1px solid ${daysLeft <= 30 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 165, 116, 0.15)'}`,
                              }}>
                                <Clock size={8} style={{ color: daysLeft <= 30 ? '#ef4444' : '#d4a574' }} />
                                <span style={{
                                  fontSize: 8,
                                  fontWeight: 700,
                                  color: daysLeft <= 30 ? '#ef4444' : '#d4a574',
                                }}>
                                  {daysLeft}d
                                </span>
                              </div>
                            )}

                            {/* Done badge */}
                            {isCompleted && (
                              <span style={{
                                fontSize: 9,
                                fontWeight: 600,
                                color: '#6b8f71',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                backgroundColor: 'rgba(107, 143, 113, 0.1)',
                                padding: '2px 8px',
                                borderRadius: 6,
                                flexShrink: 0,
                                animation: wasJustToggled ? 'fadeSlideIn 0.3s ease-out' : 'none',
                              }}>
                                Done
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Dependencies & Risks */}
                <div
                  className="card-interactive"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.04)',
                    borderRadius: 12,
                    padding: '12px 18px',
                    border: '1px solid rgba(239, 68, 68, 0.08)',
                    marginBottom: 12,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#6b6358',
                      marginBottom: 8,
                    }}
                  >
                    <AlertTriangle size={12} style={{ color: '#ef4444', opacity: 0.7 }} />
                    Dependencies &amp; Risks
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: '#a09888',
                      margin: 0,
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    {phaseDependencies[phase.id]}
                  </p>
                </div>

                {/* Success Metrics with mini progress bars (collapsible) */}
                {phaseSuccessMetrics[phase.id] && (
                  <div
                    className="card-interactive"
                    style={{
                      backgroundColor: 'rgba(107, 143, 113, 0.03)',
                      borderRadius: 12,
                      border: '1px solid rgba(107, 143, 113, 0.08)',
                      overflow: 'hidden',
                      marginBottom: 12,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <button
                      onClick={() => toggleMetrics(phase.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 18px',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#6b6358',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = '#a09888';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = '#6b6358';
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: expandedMetrics[phase.id] ? 'rotate(0deg)' : 'rotate(-90deg)',
                        }}
                      >
                        <ChevronDown size={12} />
                      </span>
                      <BarChart3 size={12} style={{ color: '#6b8f71' }} />
                      Success Metrics
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: 9,
                        fontWeight: 600,
                        color: '#6b8f71',
                        backgroundColor: 'rgba(107, 143, 113, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 8,
                        textTransform: 'none',
                        letterSpacing: 'normal',
                      }}>
                        {phaseSuccessMetrics[phase.id].length} metrics
                      </span>
                    </button>
                    <div
                      className="scrollbar-autohide"
                      style={{
                        maxHeight: expandedMetrics[phase.id] ? '400px' : '0px',
                        opacity: expandedMetrics[phase.id] ? 1 : 0,
                        transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease 0.1s',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '0 18px 14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {phaseSuccessMetrics[phase.id].map((metric, mIdx) => {
                          const pct = Math.min(100, Math.round((metric.current / metric.target) * 100));
                          const isOnTrack = pct >= 50;
                          return (
                            <div key={mIdx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 12, color: '#b0a898', fontWeight: 500 }}>{metric.label}</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: isOnTrack ? '#6b8f71' : '#d4a574' }}>
                                  {metric.current}{metric.unit} / {metric.target}{metric.unit}
                                </span>
                              </div>
                              <div style={{
                                height: 6,
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderRadius: 3,
                                overflow: 'hidden',
                                position: 'relative',
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  background: pct >= 100
                                    ? 'linear-gradient(90deg, #4a7a50, #6b8f71)'
                                    : isOnTrack
                                      ? `linear-gradient(90deg, ${accentColor}99, ${accentColor})`
                                      : 'linear-gradient(90deg, #d4a574aa, #d4a574)',
                                  borderRadius: 3,
                                  transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1)',
                                  boxShadow: pct >= 100 ? '0 0 8px rgba(107, 143, 113, 0.4)' : 'none',
                                  position: 'relative',
                                }}>
                                  {pct > 0 && (
                                    <div style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                      backgroundSize: '200% 100%',
                                      animation: 'shimmer 3s infinite',
                                    }} />
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', marginTop: 2 }}>
                                <span style={{
                                  fontSize: 9,
                                  fontWeight: 600,
                                  color: pct >= 100 ? '#6b8f71' : isOnTrack ? '#a09888' : '#d4a574',
                                }}>
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Phase Notes (collapsible with smooth expand) */}
                <div
                  className="card-interactive"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.03)',
                    borderRadius: 12,
                    border: '1px solid rgba(139, 92, 246, 0.08)',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <button
                    onClick={() => toggleNoteExpanded(phase.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 18px',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#6b6358',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#a09888';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#6b6358';
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: noteExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      }}
                    >
                      <ChevronDown size={12} />
                    </span>
                    <StickyNote size={12} />
                    Strategic Notes
                    {noteText && !noteExpanded && (
                      <span
                        style={{
                          fontSize: 10,
                          color: '#8b5cf6',
                          fontWeight: 500,
                          textTransform: 'none',
                          letterSpacing: 'normal',
                          marginLeft: 6,
                        }}
                      >
                        ({getNoteWordCount(noteText)} words)
                      </span>
                    )}
                    {/* Comments/discussions count badge */}
                    {(phaseCommentCounts[phase.id] ?? 0) > 0 && (
                      <span style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 9,
                        fontWeight: 600,
                        color: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 8,
                        textTransform: 'none',
                        letterSpacing: 'normal',
                        border: '1px solid rgba(139, 92, 246, 0.12)',
                      }}>
                        <MessageCircle size={8} />
                        {phaseCommentCounts[phase.id]}
                      </span>
                    )}
                  </button>
                  <div
                    className="scrollbar-autohide"
                    style={{
                      maxHeight: noteExpanded ? '300px' : '0px',
                      opacity: noteExpanded ? 1 : 0,
                      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '0 18px 14px 18px' }}>
                      <textarea
                        value={noteText}
                        onChange={(e) =>
                          updateNote(phase.id, e.target.value)
                        }
                        placeholder="Add strategic notes for this phase..."
                        rows={4}
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid #1e2638',
                          borderRadius: 8,
                          padding: '10px 14px',
                          fontSize: 13,
                          color: '#f0ebe4',
                          lineHeight: 1.6,
                          resize: 'vertical',
                          outline: 'none',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(139, 92, 246, 0.3)';
                          (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.08)';
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLTextAreaElement).style.borderColor = '#1e2638';
                          (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 6,
                          fontSize: 10,
                          color: '#6b6358',
                        }}
                      >
                        <Save size={10} />
                        Auto-saved to browser
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes pulseRing {
          0%, 100% { r: 18; opacity: 0.4; }
          50% { r: 22; opacity: 0.1; }
        }
        @keyframes pulseCore {
          0%, 100% { opacity: 0.7; r: 4; }
          50% { opacity: 0.3; r: 3; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes youAreHerePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes timelineDraw {
          from { clip-path: inset(0 0 100% 0); }
          to { clip-path: inset(0 0 0% 0); }
        }
        @keyframes phaseNodePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(212, 165, 116, 0); }
        }
        @keyframes milestoneCheck {
          0% { transform: scale(0) rotate(-10deg); }
          60% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes progressGrow {
          from { width: 0%; }
        }
        @keyframes gradientSlide {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes celebrationGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(107, 143, 113, 0.3); }
          50% { box-shadow: 0 0 20px rgba(107, 143, 113, 0.5), 0 0 40px rgba(107, 143, 113, 0.2); }
        }
        @keyframes celebrationPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes statusBadgeGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes headerIconGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(212, 165, 116, 0); }
          50% { box-shadow: 0 0 20px rgba(212, 165, 116, 0.1); }
        }
        @keyframes youAreHereGlow {
          0%, 100% {
            box-shadow: 0 0 12px rgba(212, 165, 116, 0.8), 0 0 24px rgba(212, 165, 116, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 20px rgba(212, 165, 116, 1), 0 0 40px rgba(212, 165, 116, 0.6);
            transform: scale(1.3);
          }
        }
        @keyframes milestoneGoldPulse {
          0%, 100% { border-color: rgba(212, 165, 116, 0.15); }
          50% { border-color: rgba(212, 165, 116, 0.35); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scaleX(0); }
          to { opacity: 1; transform: scaleX(1); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes zapPulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 2px rgba(212, 165, 116, 0.5)); }
          50% { opacity: 0.7; filter: drop-shadow(0 0 8px rgba(212, 165, 116, 0.8)); }
        }
        @keyframes completedRingPulse {
          0%, 100% { r: 14; opacity: 0.4; stroke: rgba(107, 143, 113, 0.4); }
          50% { r: 16; opacity: 0.15; stroke: rgba(107, 143, 113, 0.2); }
        }
        @keyframes activePhaseGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(212, 165, 116, 0.05), inset 0 0 30px rgba(212, 165, 116, 0.02); }
          50% { box-shadow: 0 0 50px rgba(212, 165, 116, 0.1), inset 0 0 50px rgba(212, 165, 116, 0.04); }
        }
        @keyframes sparkleParticle {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
            transform: translate(calc(-50% + var(--dx) * 0.6), calc(-50% + var(--dy) * 0.6)) scale(1.2);
          }
          100% {
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0);
            opacity: 0;
          }
        }
        @keyframes riskPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes depArrowFlow {
          0% { stroke-dashoffset: 14; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes metricBarGrow {
          from { width: 0%; }
        }
      `}</style>
    </div>
  );
}
