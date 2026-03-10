'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  ChevronDown,
  AlertTriangle,
  Flame,
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ─── Types ─── */

interface AlignmentScore {
  stewardId: string;
  questionIndex: number;
  score: number;
}

interface WeekData {
  weekId: string;
  weekLabel: string;
  startDate: string;
  scores: AlignmentScore[];
}

/* ─── Constants ─── */

const STORAGE_KEY = 'frequency-steward-alignment';

const STEWARDS = [
  { id: 'james', name: 'James', shortRole: 'Founder', avatar: 'JH', color: '#d4a574' },
  { id: 'sian', name: 'Sian', shortRole: 'COO', avatar: 'SH', color: '#e879a0' },
  { id: 'fairman', name: 'Fairman', shortRole: 'Strategic Architect', avatar: 'AF', color: '#8b5cf6' },
  { id: 'dave', name: 'Dave', shortRole: 'Board & Culture', avatar: 'DW', color: '#34d399' },
];

const QUESTIONS = [
  'How aligned are we on 2026 priorities?',
  'How clear is the path to 144 well-stewards?',
  'How well are resources allocated across nodes?',
  'How aligned are we on Blue Spirit vision?',
  'How healthy is our team energy and pace?',
];

const SCORE_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  5: { bg: 'rgba(16, 185, 129, 0.20)', text: '#10b981', label: 'Strong' },
  4: { bg: 'rgba(34, 197, 94, 0.18)', text: '#22c55e', label: 'Good' },
  3: { bg: 'rgba(212, 165, 116, 0.20)', text: '#d4a574', label: 'Mixed' },
  2: { bg: 'rgba(249, 115, 22, 0.20)', text: '#f97316', label: 'Weak' },
  1: { bg: 'rgba(244, 63, 94, 0.18)', text: '#f43e5e', label: 'Misaligned' },
  0: { bg: 'rgba(107, 99, 88, 0.10)', text: '#6b6358', label: 'No score' },
};

/* ─── Helpers ─── */

function getWeekId(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

function getWeekLabel(weekId: string): string {
  const d = new Date(weekId + 'T00:00:00');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
}

function generateMockData(): WeekData[] {
  const now = new Date();
  const weeks: WeekData[] = [];

  // Generate 4 weeks of past data with realistic alignment patterns
  const mockPatterns: Record<string, number[][]> = {
    // [q0, q1, q2, q3, q4] per week, per steward
    james: [
      [4, 3, 3, 5, 3],
      [4, 3, 3, 5, 4],
      [5, 4, 3, 5, 3],
      [5, 4, 4, 5, 4],
    ],
    sian: [
      [4, 3, 2, 4, 2],
      [4, 3, 3, 4, 2],
      [4, 3, 3, 5, 3],
      [5, 4, 3, 5, 3],
    ],
    fairman: [
      [5, 4, 3, 4, 3],
      [5, 4, 3, 4, 4],
      [5, 4, 4, 5, 4],
      [5, 5, 4, 5, 4],
    ],
    dave: [
      [3, 3, 3, 5, 4],
      [4, 3, 3, 5, 4],
      [4, 3, 3, 5, 4],
      [4, 4, 3, 5, 4],
    ],
  };

  for (let w = 4; w >= 1; w--) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - w * 7);
    const weekId = getWeekId(weekDate);
    const weekIndex = 4 - w; // 0, 1, 2, 3

    const scores: AlignmentScore[] = [];
    STEWARDS.forEach((steward) => {
      const pattern = mockPatterns[steward.id][weekIndex];
      pattern.forEach((score, qIndex) => {
        scores.push({ stewardId: steward.id, questionIndex: qIndex, score });
      });
    });

    weeks.push({
      weekId,
      weekLabel: getWeekLabel(weekId),
      startDate: weekId,
      scores,
    });
  }

  return weeks;
}

function overallScoreColor(score: number): { color: string; bg: string; label: string } {
  if (score >= 4) return { color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.15)', label: 'Strong Alignment' };
  if (score >= 3) return { color: '#d4a574', bg: 'rgba(212, 165, 116, 0.15)', label: 'Moderate Alignment' };
  return { color: '#e06060', bg: 'rgba(224, 96, 96, 0.15)', label: 'Weak Alignment' };
}

/* ─── Component ─── */

export function StewardAlignmentView() {
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [selectedSteward, setSelectedSteward] = useState<string>(STEWARDS[0].id);
  const [currentScores, setCurrentScores] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: WeekData[] = JSON.parse(stored);
        setWeeks(parsed);
      } catch {
        const mock = generateMockData();
        setWeeks(mock);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
      }
    } else {
      const mock = generateMockData();
      setWeeks(mock);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
    }
  }, []);

  // Check if current steward already submitted this week
  const currentWeekId = getWeekId(new Date());
  useEffect(() => {
    const currentWeek = weeks.find((w) => w.weekId === currentWeekId);
    if (currentWeek) {
      const hasSubmitted = currentWeek.scores.some((s) => s.stewardId === selectedSteward);
      setSubmitted(hasSubmitted);
      if (hasSubmitted) {
        const stewardScores: Record<number, number> = {};
        currentWeek.scores
          .filter((s) => s.stewardId === selectedSteward)
          .forEach((s) => { stewardScores[s.questionIndex] = s.score; });
        setCurrentScores(stewardScores);
      } else {
        setCurrentScores({});
      }
    } else {
      setSubmitted(false);
      setCurrentScores({});
    }
  }, [selectedSteward, weeks, currentWeekId]);

  // Handle score change
  const handleScoreChange = (questionIndex: number, score: number) => {
    if (submitted) return;
    setCurrentScores((prev) => ({ ...prev, [questionIndex]: score }));
  };

  // Submit scores
  const handleSubmit = () => {
    if (Object.keys(currentScores).length !== QUESTIONS.length) return;

    const newScores: AlignmentScore[] = QUESTIONS.map((_, qi) => ({
      stewardId: selectedSteward,
      questionIndex: qi,
      score: currentScores[qi],
    }));

    setWeeks((prev) => {
      const existingWeekIndex = prev.findIndex((w) => w.weekId === currentWeekId);
      let updated: WeekData[];

      if (existingWeekIndex >= 0) {
        updated = prev.map((w, i) => {
          if (i !== existingWeekIndex) return w;
          // Remove old scores for this steward, add new
          const filtered = w.scores.filter((s) => s.stewardId !== selectedSteward);
          return { ...w, scores: [...filtered, ...newScores] };
        });
      } else {
        updated = [
          ...prev,
          {
            weekId: currentWeekId,
            weekLabel: getWeekLabel(currentWeekId),
            startDate: currentWeekId,
            scores: newScores,
          },
        ];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setSubmitted(true);
    setShowSubmitConfirm(true);
    setTimeout(() => setShowSubmitConfirm(false), 2500);
  };

  // Computed data
  const currentWeek = useMemo(
    () => weeks.find((w) => w.weekId === currentWeekId),
    [weeks, currentWeekId],
  );

  // Heatmap data for current week
  const heatmapData = useMemo(() => {
    if (!currentWeek) return null;
    const grid: Record<string, Record<number, number>> = {};
    STEWARDS.forEach((s) => {
      grid[s.id] = {};
      QUESTIONS.forEach((_, qi) => {
        const found = currentWeek.scores.find(
          (sc) => sc.stewardId === s.id && sc.questionIndex === qi,
        );
        grid[s.id][qi] = found ? found.score : 0;
      });
    });
    return grid;
  }, [currentWeek]);

  // Weekly averages for trend chart (past 8 weeks)
  const weeklyAverages = useMemo(() => {
    const recentWeeks = weeks.slice(-8);
    return recentWeeks.map((w) => {
      if (w.scores.length === 0) return { weekLabel: w.weekLabel, average: 0 };
      const avg = w.scores.reduce((sum, s) => sum + s.score, 0) / w.scores.length;
      return { weekLabel: w.weekLabel, average: Math.round(avg * 100) / 100 };
    });
  }, [weeks]);

  // Overall score for current week
  const overallScore = useMemo(() => {
    if (!currentWeek || currentWeek.scores.length === 0) return 0;
    return (
      Math.round(
        (currentWeek.scores.reduce((sum, s) => sum + s.score, 0) / currentWeek.scores.length) * 100,
      ) / 100
    );
  }, [currentWeek]);

  // Question averages for current week (to find highest/lowest)
  const questionAverages = useMemo(() => {
    if (!currentWeek || currentWeek.scores.length === 0) return QUESTIONS.map(() => 0);
    return QUESTIONS.map((_, qi) => {
      const qScores = currentWeek.scores.filter((s) => s.questionIndex === qi);
      if (qScores.length === 0) return 0;
      return Math.round((qScores.reduce((sum, s) => sum + s.score, 0) / qScores.length) * 100) / 100;
    });
  }, [currentWeek]);

  const highestAlignedIndex = useMemo(() => {
    if (questionAverages.every((q) => q === 0)) return -1;
    return questionAverages.indexOf(Math.max(...questionAverages.filter((q) => q > 0)));
  }, [questionAverages]);

  const lowestAlignedIndex = useMemo(() => {
    const nonZero = questionAverages.filter((q) => q > 0);
    if (nonZero.length === 0) return -1;
    const minVal = Math.min(...nonZero);
    return questionAverages.indexOf(minVal);
  }, [questionAverages]);

  // Trend direction
  const trendDirection = useMemo(() => {
    if (weeklyAverages.length < 2) return 'flat' as const;
    const recent = weeklyAverages[weeklyAverages.length - 1]?.average ?? 0;
    const previous = weeklyAverages[weeklyAverages.length - 2]?.average ?? 0;
    if (recent > previous + 0.1) return 'up' as const;
    if (recent < previous - 0.1) return 'down' as const;
    return 'flat' as const;
  }, [weeklyAverages]);

  const allQuestionsScored = Object.keys(currentScores).length === QUESTIONS.length;
  const maxBarHeight = 120;
  const maxAvg = 5;
  const scoreCfg = overallScoreColor(overallScore);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <Users size={24} className="text-accent" />
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Steward Alignment</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm">
          Weekly alignment pulse between core stewards. Track coherence across priorities, vision, and energy.
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in"
        style={{ animationDelay: '0.05s', opacity: 0 }}
      >
        {/* Overall Score */}
        <div
          className="glow-card rounded-xl p-4 border"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: scoreCfg.bg }}
            >
              <Target size={16} style={{ color: scoreCfg.color }} />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: scoreCfg.color }}>
            {overallScore > 0 ? overallScore.toFixed(1) : '--'}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">
            Overall Score
          </div>
          {overallScore > 0 && (
            <div
              className="text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full inline-block"
              style={{ backgroundColor: scoreCfg.bg, color: scoreCfg.color }}
            >
              {scoreCfg.label}
            </div>
          )}
        </div>

        {/* Most Aligned */}
        <div
          className="glow-card rounded-xl p-4 border"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(107, 143, 113, 0.15)' }}
            >
              <Flame size={16} style={{ color: '#6b8f71' }} />
            </div>
          </div>
          <div className="text-sm font-semibold text-text-primary leading-snug min-h-[2.5rem] flex items-center">
            {highestAlignedIndex >= 0
              ? QUESTIONS[highestAlignedIndex].replace('How aligned are we on ', '').replace('How clear is the ', '').replace('How well are ', '').replace('How healthy is our ', '').replace('?', '')
              : '--'}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">
            Most Aligned
          </div>
          {highestAlignedIndex >= 0 && (
            <div className="text-[11px] font-mono mt-1" style={{ color: '#6b8f71' }}>
              {questionAverages[highestAlignedIndex].toFixed(1)}/5
            </div>
          )}
        </div>

        {/* Least Aligned */}
        <div
          className="glow-card rounded-xl p-4 border"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(224, 96, 96, 0.12)' }}
            >
              <AlertTriangle size={16} style={{ color: '#e06060' }} />
            </div>
          </div>
          <div className="text-sm font-semibold text-text-primary leading-snug min-h-[2.5rem] flex items-center">
            {lowestAlignedIndex >= 0 && lowestAlignedIndex !== highestAlignedIndex
              ? QUESTIONS[lowestAlignedIndex].replace('How aligned are we on ', '').replace('How clear is the ', '').replace('How well are ', '').replace('How healthy is our ', '').replace('?', '')
              : lowestAlignedIndex >= 0
                ? QUESTIONS[lowestAlignedIndex].replace('How aligned are we on ', '').replace('How clear is the ', '').replace('How well are ', '').replace('How healthy is our ', '').replace('?', '')
                : '--'}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">
            Least Aligned
          </div>
          {lowestAlignedIndex >= 0 && (
            <div className="text-[11px] font-mono mt-1" style={{ color: '#e06060' }}>
              {questionAverages[lowestAlignedIndex].toFixed(1)}/5
            </div>
          )}
        </div>

        {/* Trend */}
        <div
          className="glow-card rounded-xl p-4 border"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor:
                  trendDirection === 'up'
                    ? 'rgba(107, 143, 113, 0.15)'
                    : trendDirection === 'down'
                      ? 'rgba(224, 96, 96, 0.12)'
                      : 'rgba(160, 152, 136, 0.12)',
              }}
            >
              {trendDirection === 'up' && <TrendingUp size={16} style={{ color: '#6b8f71' }} />}
              {trendDirection === 'down' && <TrendingDown size={16} style={{ color: '#e06060' }} />}
              {trendDirection === 'flat' && <Minus size={16} style={{ color: '#a09888' }} />}
            </div>
          </div>
          <div
            className="text-2xl font-bold"
            style={{
              color:
                trendDirection === 'up'
                  ? '#6b8f71'
                  : trendDirection === 'down'
                    ? '#e06060'
                    : '#a09888',
            }}
          >
            {trendDirection === 'up' ? 'Up' : trendDirection === 'down' ? 'Down' : 'Flat'}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">
            Trend
          </div>
          <div className="text-[11px] text-text-muted mt-1">
            vs. previous week
          </div>
        </div>
      </div>

      {/* ── Score Submission ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.1s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Submit Your Scores — Week of {getWeekLabel(currentWeekId)}
          </span>
        </div>

        <div
          className="glow-card rounded-xl border p-5"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          {/* Steward Selector */}
          <div className="mb-5">
            <label className="text-[11px] text-text-muted font-medium block mb-2">
              Submitting as:
            </label>
            <div className="flex gap-2 flex-wrap">
              {STEWARDS.map((steward) => {
                const isSelected = selectedSteward === steward.id;
                const member = teamMembers.find((m) => m.id === steward.id);
                return (
                  <button
                    key={steward.id}
                    onClick={() => setSelectedSteward(steward.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: isSelected ? `${steward.color}18` : '#1c2230',
                      color: isSelected ? steward.color : '#a09888',
                      border: `1px solid ${isSelected ? `${steward.color}40` : '#1e2638'}`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                        color: '#0b0d14',
                      }}
                    >
                      {steward.avatar}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold">{steward.name}</div>
                      <div className="text-[10px] text-text-muted">{member?.shortRole ?? steward.shortRole}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {QUESTIONS.map((question, qi) => {
              const selectedScore = currentScores[qi];
              return (
                <div key={qi}>
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: 'rgba(212, 165, 116, 0.12)', color: '#d4a574' }}
                    >
                      {qi + 1}
                    </span>
                    <span className="text-sm text-text-primary font-medium">{question}</span>
                  </div>
                  <div className="flex gap-2 ml-7">
                    {[1, 2, 3, 4, 5].map((score) => {
                      const isSelected = selectedScore === score;
                      const cfg = SCORE_COLORS[score];
                      return (
                        <button
                          key={score}
                          onClick={() => handleScoreChange(qi, score)}
                          disabled={submitted}
                          className="w-10 h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center"
                          style={{
                            backgroundColor: isSelected ? cfg.bg : '#1c2230',
                            color: isSelected ? cfg.text : '#6b6358',
                            border: `1.5px solid ${isSelected ? cfg.text + '60' : '#1e2638'}`,
                            opacity: submitted && !isSelected ? 0.4 : 1,
                            cursor: submitted ? 'default' : 'pointer',
                            boxShadow: isSelected ? `0 0 12px ${cfg.text}20` : 'none',
                          }}
                        >
                          {score}
                        </button>
                      );
                    })}
                    {selectedScore && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full self-center ml-2"
                        style={{
                          backgroundColor: SCORE_COLORS[selectedScore].bg,
                          color: SCORE_COLORS[selectedScore].text,
                        }}
                      >
                        {SCORE_COLORS[selectedScore].label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-5 flex items-center gap-3">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsScored}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                style={{
                  backgroundColor: allQuestionsScored ? 'rgba(212, 165, 116, 0.15)' : '#1c2230',
                  color: allQuestionsScored ? '#d4a574' : '#6b6358',
                  border: `1px solid ${allQuestionsScored ? 'rgba(212, 165, 116, 0.3)' : '#1e2638'}`,
                  cursor: allQuestionsScored ? 'pointer' : 'not-allowed',
                }}
              >
                <CheckCircle2 size={15} />
                Submit Alignment Scores
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} style={{ color: '#6b8f71' }} />
                <span style={{ color: '#6b8f71' }} className="font-medium">
                  Scores submitted for this week
                </span>
              </div>
            )}
            {showSubmitConfirm && (
              <span
                className="text-xs font-medium animate-fade-in px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(107, 143, 113, 0.15)', color: '#6b8f71' }}
              >
                Saved successfully
              </span>
            )}
            {!submitted && !allQuestionsScored && (
              <span className="text-[11px] text-text-muted">
                {QUESTIONS.length - Object.keys(currentScores).length} question{QUESTIONS.length - Object.keys(currentScores).length !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Alignment Heatmap ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.15s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Current Week Heatmap
          </span>
        </div>

        <div
          className="glow-card rounded-xl border overflow-hidden"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          {heatmapData ? (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th
                      className="text-left text-[11px] font-semibold text-text-muted p-3 pb-2 w-32"
                      style={{ borderBottom: '1px solid #1e2638' }}
                    >
                      Steward
                    </th>
                    {QUESTIONS.map((q, qi) => (
                      <th
                        key={qi}
                        className="text-center text-[10px] font-medium text-text-muted p-3 pb-2"
                        style={{
                          borderBottom: '1px solid #1e2638',
                          maxWidth: 100,
                          backgroundColor:
                            qi === highestAlignedIndex
                              ? 'rgba(107, 143, 113, 0.05)'
                              : qi === lowestAlignedIndex
                                ? 'rgba(224, 96, 96, 0.05)'
                                : 'transparent',
                        }}
                      >
                        <div className="leading-tight">
                          Q{qi + 1}
                        </div>
                        <div className="text-[9px] text-text-muted mt-0.5 leading-tight">
                          {q.length > 30 ? q.slice(0, 27) + '...' : q}
                        </div>
                      </th>
                    ))}
                    <th
                      className="text-center text-[11px] font-semibold text-text-muted p-3 pb-2 w-20"
                      style={{ borderBottom: '1px solid #1e2638' }}
                    >
                      Avg
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STEWARDS.map((steward) => {
                    const scores = heatmapData[steward.id];
                    const stewardScores = Object.values(scores).filter((s) => s > 0);
                    const stewardAvg =
                      stewardScores.length > 0
                        ? stewardScores.reduce((a, b) => a + b, 0) / stewardScores.length
                        : 0;

                    return (
                      <tr key={steward.id}>
                        <td
                          className="p-3"
                          style={{ borderBottom: '1px solid #1e263818' }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                                color: '#0b0d14',
                              }}
                            >
                              {steward.avatar}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-text-primary">
                                {steward.name}
                              </div>
                              <div className="text-[10px] text-text-muted">
                                {steward.shortRole}
                              </div>
                            </div>
                          </div>
                        </td>
                        {QUESTIONS.map((_, qi) => {
                          const score = scores[qi] || 0;
                          const cfg = SCORE_COLORS[score];
                          return (
                            <td
                              key={qi}
                              className="p-2 text-center"
                              style={{ borderBottom: '1px solid #1e263818' }}
                            >
                              {score > 0 ? (
                                <div
                                  className="mx-auto w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                                  style={{
                                    backgroundColor: cfg.bg,
                                    color: cfg.text,
                                    boxShadow: `0 0 8px ${cfg.text}15`,
                                  }}
                                >
                                  {score}
                                </div>
                              ) : (
                                <div
                                  className="mx-auto w-9 h-9 rounded-lg flex items-center justify-center text-[10px] text-text-muted"
                                  style={{ backgroundColor: '#1c2230' }}
                                >
                                  --
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td
                          className="p-2 text-center"
                          style={{ borderBottom: '1px solid #1e263818' }}
                        >
                          {stewardAvg > 0 ? (
                            <span
                              className="text-sm font-bold"
                              style={{ color: overallScoreColor(stewardAvg).color }}
                            >
                              {stewardAvg.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-muted">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Question averages row */}
                  <tr style={{ backgroundColor: '#0f121a' }}>
                    <td className="p-3">
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                        Average
                      </span>
                    </td>
                    {QUESTIONS.map((_, qi) => {
                      const avg = questionAverages[qi];
                      const isHighest = qi === highestAlignedIndex;
                      const isLowest = qi === lowestAlignedIndex && qi !== highestAlignedIndex;
                      return (
                        <td key={qi} className="p-2 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className="text-sm font-bold"
                              style={{
                                color: avg > 0 ? overallScoreColor(avg).color : '#6b6358',
                              }}
                            >
                              {avg > 0 ? avg.toFixed(1) : '--'}
                            </span>
                            {isHighest && avg > 0 && (
                              <ArrowUp size={10} style={{ color: '#6b8f71' }} />
                            )}
                            {isLowest && avg > 0 && (
                              <ArrowDown size={10} style={{ color: '#e06060' }} />
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center">
                      <span
                        className="text-sm font-bold"
                        style={{ color: scoreCfg.color }}
                      >
                        {overallScore > 0 ? overallScore.toFixed(1) : '--'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-text-muted text-sm">
              No alignment data for this week yet. Submit your scores above.
            </div>
          )}

          {/* Heatmap Legend */}
          <div
            className="flex items-center gap-4 px-4 py-3 flex-wrap"
            style={{ borderTop: '1px solid #1e2638', backgroundColor: '#0f121a' }}
          >
            <span className="text-[10px] text-text-muted font-medium">Legend:</span>
            {[5, 4, 3, 2, 1].map((score) => {
              const cfg = SCORE_COLORS[score];
              return (
                <div key={score} className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: cfg.bg, color: cfg.text }}
                  >
                    {score}
                  </div>
                  <span className="text-[10px]" style={{ color: cfg.text }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Trend Chart ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.2s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Weekly Average Alignment — Past {weeklyAverages.length} Weeks
          </span>
        </div>

        <div
          className="glow-card rounded-xl border p-5"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          {weeklyAverages.length > 0 ? (
            <div>
              {/* Bar chart */}
              <div className="flex items-end gap-3 justify-between" style={{ height: maxBarHeight + 40 }}>
                {weeklyAverages.map((week, i) => {
                  const barHeight = week.average > 0 ? (week.average / maxAvg) * maxBarHeight : 4;
                  const cfg = overallScoreColor(week.average);
                  const isLatest = i === weeklyAverages.length - 1;

                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center flex-1"
                      style={{ maxWidth: 80 }}
                    >
                      {/* Score label above bar */}
                      <div
                        className="text-xs font-bold mb-1"
                        style={{ color: week.average > 0 ? cfg.color : '#6b6358' }}
                      >
                        {week.average > 0 ? week.average.toFixed(1) : '--'}
                      </div>
                      {/* Bar */}
                      <div
                        className="w-full rounded-t-lg transition-all relative"
                        style={{
                          height: barHeight,
                          backgroundColor: week.average > 0 ? `${cfg.color}30` : '#1c2230',
                          borderLeft: isLatest ? `2px solid ${cfg.color}` : 'none',
                          borderRight: isLatest ? `2px solid ${cfg.color}` : 'none',
                          borderTop: isLatest ? `2px solid ${cfg.color}` : 'none',
                          boxShadow:
                            isLatest && week.average > 0
                              ? `0 -4px 16px ${cfg.color}25`
                              : 'none',
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: week.average > 0
                              ? `linear-gradient(to top, ${cfg.color}20, ${cfg.color}40)`
                              : 'transparent',
                          }}
                        />
                      </div>
                      {/* Week label below bar */}
                      <div
                        className="text-[10px] mt-2 font-medium text-center"
                        style={{
                          color: isLatest ? '#d4a574' : '#6b6358',
                        }}
                      >
                        {week.weekLabel}
                      </div>
                      {isLatest && (
                        <div
                          className="text-[9px] font-semibold uppercase tracking-wider"
                          style={{ color: '#d4a574' }}
                        >
                          Current
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reference lines */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: '#6b8f71' }} />
                  <span className="text-[10px] text-text-muted">4.0+ Strong</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: '#d4a574' }} />
                  <span className="text-[10px] text-text-muted">3.0-4.0 Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: '#e06060' }} />
                  <span className="text-[10px] text-text-muted">&lt;3.0 Needs attention</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-text-muted text-sm py-8">
              No trend data available yet. Submit scores weekly to build the trend.
            </div>
          )}
        </div>
      </div>

      {/* ── Question Breakdown ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0.25s', opacity: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <ChevronDown size={14} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Question Breakdown — Current Week
          </span>
        </div>

        <div className="space-y-2">
          {QUESTIONS.map((question, qi) => {
            const avg = questionAverages[qi];
            const cfg = overallScoreColor(avg);
            const isHighest = qi === highestAlignedIndex;
            const isLowest = qi === lowestAlignedIndex && qi !== highestAlignedIndex;
            const barWidth = avg > 0 ? (avg / 5) * 100 : 0;

            return (
              <div
                key={qi}
                className="glow-card rounded-xl border p-4"
                style={{
                  backgroundColor: '#131720',
                  borderColor: isHighest
                    ? 'rgba(107, 143, 113, 0.25)'
                    : isLowest
                      ? 'rgba(224, 96, 96, 0.2)'
                      : '#1e2638',
                  borderLeftWidth: isHighest || isLowest ? 3 : 1,
                  borderLeftColor: isHighest ? '#6b8f71' : isLowest ? '#e06060' : '#1e2638',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(212, 165, 116, 0.12)', color: '#d4a574' }}
                    >
                      {qi + 1}
                    </span>
                    <span className="text-sm text-text-primary font-medium truncate">
                      {question}
                    </span>
                    {isHighest && avg > 0 && (
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: 'rgba(107, 143, 113, 0.15)', color: '#6b8f71' }}
                      >
                        Highest
                      </span>
                    )}
                    {isLowest && avg > 0 && (
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: 'rgba(224, 96, 96, 0.12)', color: '#e06060' }}
                      >
                        Lowest
                      </span>
                    )}
                  </div>
                  <span
                    className="text-lg font-bold ml-3 flex-shrink-0"
                    style={{ color: avg > 0 ? cfg.color : '#6b6358' }}
                  >
                    {avg > 0 ? avg.toFixed(1) : '--'}
                  </span>
                </div>
                {/* Progress bar */}
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#1c2230' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barWidth}%`,
                      background: avg > 0
                        ? `linear-gradient(90deg, ${cfg.color}, ${cfg.color}cc)`
                        : 'transparent',
                    }}
                  />
                </div>
                {/* Individual steward scores */}
                {currentWeek && (
                  <div className="flex items-center gap-3 mt-2">
                    {STEWARDS.map((steward) => {
                      const score = currentWeek.scores.find(
                        (s) => s.stewardId === steward.id && s.questionIndex === qi,
                      );
                      return (
                        <div key={steward.id} className="flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold"
                            style={{
                              background: `linear-gradient(135deg, ${steward.color}cc, ${steward.color})`,
                              color: '#0b0d14',
                            }}
                          >
                            {steward.avatar[0]}
                          </div>
                          <span
                            className="text-[10px] font-mono"
                            style={{
                              color: score ? SCORE_COLORS[score.score].text : '#6b6358',
                            }}
                          >
                            {score ? score.score : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
