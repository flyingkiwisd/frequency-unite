'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sun,
  Moon,
  BarChart3,
  BookOpen,
  Sparkles,
  Brain,
  TrendingUp,
  Zap,
  Heart,
  CheckCircle2,
  Circle,
  ChevronRight,
  Calendar,
  Flame,
  Target,
  Shield,
  Eye,
  Compass,
  Leaf,
  RefreshCw,
  Send,
  Clock,
  Award,
  Filter,
  MessageSquare,
} from 'lucide-react';

/* ===============================================================================
   Types
   =============================================================================== */

type CheckInTab = 'morning' | 'eod' | 'weekly';
type MoodKey = 'great' | 'good' | 'neutral' | 'tough' | 'rough';
type InsightTimeframe = '7d' | '14d' | '30d';

interface JournalEntry {
  id: string;
  type: CheckInTab;
  date: string;
  energy: number;
  mood: MoodKey;
  checklist: boolean[];
  winOfDay: string;
  dailyPromptIndex: number;
  promptResponse: string;
  notes: string;
  createdAt: string;
}

interface ThemeCount {
  theme: string;
  count: number;
  color: string;
}

/* ===============================================================================
   Constants
   =============================================================================== */

const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const ROSE = '#e879a0';
const SKY = '#5eaed4';
const WARNING = '#e8b44c';

const STORAGE_KEY = 'frequency-journal-entries';

const MOOD_OPTIONS: { key: MoodKey; emoji: string; label: string }[] = [
  { key: 'great', emoji: '\u{1F929}', label: 'Great' },
  { key: 'good', emoji: '\u{1F60A}', label: 'Good' },
  { key: 'neutral', emoji: '\u{1F610}', label: 'Neutral' },
  { key: 'tough', emoji: '\u{1F614}', label: 'Tough' },
  { key: 'rough', emoji: '\u{1F625}', label: 'Rough' },
];

const ENERGY_EMOJIS = ['\u{1F634}', '\u{1F615}', '\u{1F610}', '\u{1F60A}', '\u{1F525}'];

const STEWARD_CHECKLIST = [
  'Reviewed community pulse before diving into tasks',
  'Checked in with at least one pod lead or node steward',
  'Aligned top priority with Frequency\'s current OKR',
  'Paused to ask: "Is this coherence or urgency?"',
  'Acknowledged one team contribution before 10am',
  'Confirmed today\'s single most leveraged action',
];

const COMMITMENTS = [
  { text: 'Coherence before action', icon: Compass, color: AMBER },
  { text: 'Systems change, not extraction', icon: RefreshCw, color: VIOLET },
  { text: 'Transparency with humility', icon: Eye, color: SAGE },
  { text: 'One direction at a time \u2014 finish before pivoting', icon: Target, color: SKY },
];

const DECISION_FILTERS = [
  'Is this about clarity or urgency?',
  'Is this for Frequency or for me?',
  'Who should own this?',
];

const DAILY_PRINCIPLES = [
  'The root system matters more than the fruit.',
  'Coherence is the foundation of all lasting impact.',
  'Who owns it matters more than what needs doing.',
  'Community is the technology.',
  'Slow is smooth and smooth is fast.',
  'Stewardship means tending what you didn\'t plant.',
  'Alignment compounds; misalignment decays.',
  'A thriving node needs no permission to grow.',
  'Governance is care made visible.',
  'Impact without integrity is extraction.',
  'Listen to the system before acting on it.',
  'Regeneration starts with what you stop doing.',
  'Culture is upstream of strategy.',
  'The quality of your questions determines the quality of your community.',
  'Hold space before you hold opinions.',
  'What you tolerate defines what you stand for.',
  'Every decision is a vote for the community you\'re building.',
  'Presence is the most underrated leadership skill.',
  'Build the soil, not just the harvest.',
  'Trust is earned in droplets and lost in buckets.',
  'The edge of comfort is where growth begins.',
  'What would a 100-year steward do?',
  'Complexity is the enemy of execution.',
  'Belonging is not a feature \u2014 it\'s the foundation.',
];

const DAILY_PROMPTS = [
  'What\'s the single most leveraged stewardship action today?',
  'Where am I confusing activity with alignment?',
  'What would a thriving community of 144 look like today?',
  'What tension am I avoiding that the system needs me to address?',
  'Who needs support that I haven\'t checked in with?',
  'What would I stop doing if I trusted the team fully?',
  'Where is the community asking me to listen instead of act?',
  'What decision am I delaying that costs more each day?',
  'How am I modeling the culture I want to see?',
  'What would this look like if it were easy?',
  'Where am I over-functioning as a steward?',
  'What needs to die so something better can grow?',
  'Am I building for resilience or for speed?',
  'What conversation would unlock the most energy right now?',
  'Where is the gap between our stated values and lived experience?',
  'What would a new member notice about our culture today?',
  'How am I contributing to or resolving the biggest blocker?',
  'What pattern keeps recurring that I haven\'t named yet?',
  'Where is the system showing me something I\'m not ready to see?',
  'What am I holding that someone else should own?',
  'If I could only do one thing this week, what would matter most?',
  'Where am I optimizing for my comfort instead of community health?',
  'What would radical transparency look like in this situation?',
  'How does today\'s work connect to the 10-year vision?',
  'What would the community lose if I disappeared for a month?',
  'Where am I building dependency instead of capacity?',
  'What\'s the kindest and most honest thing I can do today?',
  'Am I responding to what is, or reacting to what I fear?',
  'What would the healthiest version of this community decide?',
  'Where is joy in the work today?',
  'What boundary do I need to hold more firmly?',
  'How am I investing in the next generation of stewards?',
];

const THEME_KEYWORDS: { label: string; color: string }[] = [
  { label: 'Team Alignment', color: AMBER },
  { label: 'Membership', color: VIOLET },
  { label: 'Culture', color: SAGE },
  { label: 'Node Progress', color: SKY },
  { label: 'Events', color: ROSE },
  { label: 'Financial Health', color: WARNING },
  { label: 'Governance', color: VIOLET },
  { label: 'Strategy', color: AMBER },
  { label: 'Impact', color: SAGE },
  { label: 'Energy & Wellness', color: SKY },
  { label: 'Decision Making', color: ROSE },
  { label: 'Enrollment', color: WARNING },
  { label: 'Coherence', color: AMBER },
  { label: 'Community Building', color: SAGE },
];

const TAB_CONFIG: { key: CheckInTab; label: string; sublabel: string; icon: React.ElementType; color: string }[] = [
  { key: 'morning', label: 'Morning', sublabel: 'Set intentions', icon: Sun, color: AMBER },
  { key: 'eod', label: 'End of Day', sublabel: 'Reflect & close', icon: Moon, color: VIOLET },
  { key: 'weekly', label: 'Weekly Pulse', sublabel: 'Step back & assess', icon: BarChart3, color: SAGE },
];

/* ===============================================================================
   Scoped Keyframes
   =============================================================================== */

const journalKeyframes = `
@keyframes jv-fadeUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes jv-glowPulse {
  0%, 100% { box-shadow: 0 0 12px rgba(212,165,116,0.12); }
  50%      { box-shadow: 0 0 28px rgba(212,165,116,0.25); }
}
@keyframes jv-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes jv-breathe {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50%      { transform: scale(1.04); opacity: 1; }
}
@keyframes jv-borderGlow {
  0%, 100% { border-color: rgba(212,165,116,0.08); }
  50%      { border-color: rgba(212,165,116,0.22); }
}
@keyframes jv-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
`;

/* ===============================================================================
   Helpers
   =============================================================================== */

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function analyzeThemes(entries: JournalEntry[]): ThemeCount[] {
  const counts: Record<string, number> = {};
  const colorMap: Record<string, string> = {};
  THEME_KEYWORDS.forEach((tk) => {
    colorMap[tk.label] = tk.color;
  });

  entries.forEach((entry) => {
    const text = `${entry.winOfDay} ${entry.promptResponse} ${entry.notes}`.toLowerCase();
    THEME_KEYWORDS.forEach((tk) => {
      const keywords = tk.label.toLowerCase().split(/\s*&\s*|\s+/);
      const matched = keywords.some((kw) => text.includes(kw));
      if (matched) {
        counts[tk.label] = (counts[tk.label] || 0) + 1;
      }
    });
  });

  return Object.entries(counts)
    .map(([theme, count]) => ({ theme, count, color: colorMap[theme] || AMBER }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

/* ===============================================================================
   Component
   =============================================================================== */

export function JournalView() {
  /* ── State ── */
  const [activeTab, setActiveTab] = useState<CheckInTab>('morning');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [insightTimeframe, setInsightTimeframe] = useState<InsightTimeframe>('14d');

  // Form state
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState<MoodKey>('good');
  const [checklist, setChecklist] = useState<boolean[]>(STEWARD_CHECKLIST.map(() => false));
  const [winOfDay, setWinOfDay] = useState('');
  const [promptResponse, setPromptResponse] = useState('');
  const [notes, setNotes] = useState('');

  /* ── Derived ── */
  const todayStr = getTodayStr();
  const dayOfYear = getDayOfYear();
  const todayPrinciple = DAILY_PRINCIPLES[dayOfYear % DAILY_PRINCIPLES.length];
  const todayPromptIndex = dayOfYear % DAILY_PROMPTS.length;
  const todayPrompt = DAILY_PROMPTS[todayPromptIndex];

  /* ── localStorage ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEntries(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const persistEntries = useCallback((updated: JournalEntry[]) => {
    setEntries(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const mornings = entries.filter((e) => e.type === 'morning').length;
    const eods = entries.filter((e) => e.type === 'eod').length;
    const weeklys = entries.filter((e) => e.type === 'weekly').length;
    const avgEnergy = entries.length > 0
      ? (entries.reduce((sum, e) => sum + e.energy, 0) / entries.length).toFixed(1)
      : '0.0';

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const thisWeek = entries.filter((e) => new Date(e.createdAt) >= weekStart).length;

    return { mornings, eods, weeklys, avgEnergy, thisWeek };
  }, [entries]);

  /* ── Insights ── */
  const insightEntries = useMemo(() => {
    const days = insightTimeframe === '7d' ? 7 : insightTimeframe === '14d' ? 14 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entries.filter((e) => new Date(e.createdAt) >= cutoff);
  }, [entries, insightTimeframe]);

  const themes = useMemo(() => analyzeThemes(insightEntries), [insightEntries]);

  const coachFeedback = useMemo(() => {
    if (insightEntries.length === 0) {
      return {
        pattern: 'Start logging to see pattern analysis here.',
        energy: 'No energy data available yet.',
        checklist: 'Begin your morning check-ins to track commitment follow-through.',
      };
    }
    const avgE = insightEntries.reduce((s, e) => s + e.energy, 0) / insightEntries.length;
    const checklistRate = insightEntries.reduce((s, e) => {
      const checked = e.checklist.filter(Boolean).length;
      return s + (checked / (e.checklist.length || 1));
    }, 0) / insightEntries.length;

    const topTheme = themes.length > 0 ? themes[0].theme : 'general stewardship';

    return {
      pattern: `Your reflections center around ${topTheme}. ${themes.length > 2 ? `You also frequently touch on ${themes[1]?.theme} and ${themes[2]?.theme}.` : 'Keep logging to reveal deeper patterns.'}`,
      energy: avgE >= 4 ? 'Your energy has been consistently high. Protect this by guarding your rhythms.' :
        avgE >= 3 ? 'Energy is stable. Look for small wins that compound your momentum.' :
        'Energy has been running low. Consider which commitments need pruning.',
      checklist: checklistRate >= 0.8 ? 'Excellent consistency with your steward commitments. This discipline is building trust.' :
        checklistRate >= 0.5 ? 'Moderate follow-through on commitments. Consider which ones are truly essential.' :
        'Low commitment completion rate. Are these the right commitments, or do they need revisiting?',
    };
  }, [insightEntries, themes]);

  /* ── Form Handlers ── */
  const resetForm = useCallback(() => {
    setEnergy(3);
    setMood('good');
    setChecklist(STEWARD_CHECKLIST.map(() => false));
    setWinOfDay('');
    setPromptResponse('');
    setNotes('');
    setIsEditing(false);
  }, []);

  const handleBegin = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handlePublish = useCallback(() => {
    const newEntry: JournalEntry = {
      id: generateId(),
      type: activeTab,
      date: todayStr,
      energy,
      mood,
      checklist: [...checklist],
      winOfDay,
      dailyPromptIndex: todayPromptIndex,
      promptResponse,
      notes,
      createdAt: new Date().toISOString(),
    };
    persistEntries([newEntry, ...entries]);
    resetForm();
  }, [activeTab, todayStr, energy, mood, checklist, winOfDay, todayPromptIndex, promptResponse, notes, entries, persistEntries, resetForm]);

  const toggleChecklist = useCallback((index: number) => {
    setChecklist((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }, []);

  /* ── Render ── */
  const todayHasEntry = entries.some((e) => e.date === todayStr && e.type === activeTab);
  const checklistDone = checklist.filter(Boolean).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Inject scoped keyframes */}
      <style dangerouslySetInnerHTML={{ __html: journalKeyframes }} />

      {/* ─────────── Header ─────────── */}
      <div
        className="glass rounded-2xl border p-6 card-premium noise-overlay dot-pattern"
        style={{
          borderColor: 'rgba(212,165,116,0.1)',
          animation: 'jv-fadeUp 0.5s ease-out forwards',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${AMBER}20, ${VIOLET}20)` }}
              >
                <BookOpen size={20} style={{ color: AMBER }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary text-glow">Journal &amp; Reflection</h1>
                <p className="text-xs text-text-muted">Your stewardship operating rhythm</p>
              </div>
            </div>
            {/* Personal Mantra */}
            <div
              className="mt-3 px-4 py-2.5 rounded-lg border"
              style={{
                background: 'rgba(139,92,246,0.06)',
                borderColor: 'rgba(139,92,246,0.12)',
              }}
            >
              <p className="text-xs text-text-muted mb-0.5 uppercase tracking-wider font-semibold" style={{ color: VIOLET }}>
                Personal Mantra
              </p>
              <p className="text-sm text-text-secondary italic">
                &ldquo;Coherence before action &mdash; systems change, not extraction&rdquo;
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Mornings', value: stats.mornings, color: AMBER, icon: Sun },
              { label: 'EODs', value: stats.eods, color: VIOLET, icon: Moon },
              { label: 'Weekly', value: stats.weeklys, color: SAGE, icon: BarChart3 },
              { label: 'Avg Energy', value: stats.avgEnergy, color: WARNING, icon: Zap },
            ].map((s, i) => (
              <div
                key={s.label}
                className="glass-hover rounded-xl border px-4 py-3 min-w-[100px] text-center card-stat"
                style={{
                  borderColor: `${s.color}15`,
                  animation: `jv-fadeUp 0.5s ease-out ${0.1 + i * 0.06}s forwards`,
                  opacity: 0,
                }}
              >
                <s.icon size={14} className="mx-auto mb-1" style={{ color: s.color }} />
                <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
            {/* This week badge */}
            <div
              className="rounded-xl border px-4 py-3 min-w-[100px] text-center flex flex-col items-center justify-center card-stat"
              style={{
                borderColor: `${SAGE}20`,
                background: `linear-gradient(135deg, ${SAGE}08, ${AMBER}08)`,
                animation: `jv-fadeUp 0.5s ease-out 0.36s forwards`,
                opacity: 0,
              }}
            >
              <Flame size={14} style={{ color: SAGE }} />
              <div className="text-lg font-bold font-mono" style={{ color: SAGE }}>{stats.thisWeek}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">This Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── Daily Principle ─────────── */}
      <div
        className="rounded-xl border px-5 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(107,143,113,0.06)',
          borderColor: 'rgba(107,143,113,0.12)',
          animation: 'jv-fadeUp 0.5s ease-out 0.15s forwards',
          opacity: 0,
        }}
      >
        <Leaf size={16} style={{ color: SAGE }} />
        <p className="text-sm text-text-secondary italic">{todayPrinciple}</p>
      </div>

      {/* ─────────── Check-In Tabs ─────────── */}
      <div
        className="flex gap-2"
        style={{ animation: 'jv-fadeUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
      >
        {TAB_CONFIG.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); resetForm(); }}
              className="flex-1 rounded-xl border px-4 py-3 transition-all duration-300 cursor-pointer card-interactive"
              style={{
                background: active ? `${tab.color}12` : 'rgba(19,23,32,0.5)',
                borderColor: active ? `${tab.color}30` : '#1e2638',
                boxShadow: active ? `0 0 20px ${tab.color}15` : 'none',
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <tab.icon size={16} style={{ color: active ? tab.color : '#6b6358' }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: active ? tab.color : '#a09888' }}
                >
                  {tab.label}
                </span>
              </div>
              <p className="text-[10px] text-center" style={{ color: active ? `${tab.color}aa` : '#6b6358' }}>
                {tab.sublabel}
              </p>
            </button>
          );
        })}
      </div>

      {/* ─────────── Check-In Form ─────────── */}
      <div
        className="glass rounded-2xl border p-6 card-premium"
        style={{
          borderColor: `${TAB_CONFIG.find((t) => t.key === activeTab)!.color}12`,
          animation: 'jv-fadeUp 0.5s ease-out 0.25s forwards',
          opacity: 0,
        }}
      >
        {/* Date + status row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar size={14} style={{ color: AMBER }} />
            <span className="text-sm text-text-secondary">{formatDate(todayStr)}</span>
          </div>
          {todayHasEntry && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: `${SAGE}18`, color: SAGE }}
            >
              Logged today
            </span>
          )}
        </div>

        {!isEditing ? (
          /* ── Begin Prompt ── */
          <div className="text-center py-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${AMBER}15, ${VIOLET}15)`,
                animation: 'jv-breathe 3s ease-in-out infinite',
              }}
            >
              {activeTab === 'morning' ? <Sun size={28} style={{ color: AMBER }} /> :
                activeTab === 'eod' ? <Moon size={28} style={{ color: VIOLET }} /> :
                <BarChart3 size={28} style={{ color: SAGE }} />}
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {activeTab === 'morning' ? 'Start Today\'s Entry' :
                activeTab === 'eod' ? 'Close Out the Day' :
                'Weekly Pulse Check'}
            </h3>
            <p className="text-sm text-text-muted mb-5 max-w-md mx-auto">
              {activeTab === 'morning' ? 'Set your intentions and align with your stewardship commitments.' :
                activeTab === 'eod' ? 'Reflect on what happened, capture wins, and release tension.' :
                'Step back, assess the bigger picture, and recalibrate for the week ahead.'}
            </p>
            <button
              onClick={handleBegin}
              className="btn btn-primary"
            >
              Begin
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          /* ── Active Form ── */
          <div className="space-y-6">
            {/* Energy Level */}
            <div>
              <label className="input-label flex items-center gap-2 mb-2">
                <Zap size={13} style={{ color: WARNING }} />
                Energy Level
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergy(level)}
                    className="flex-1 rounded-lg border py-3 text-center transition-all duration-200 cursor-pointer card-interactive"
                    style={{
                      background: energy === level ? `${WARNING}18` : 'rgba(19,23,32,0.5)',
                      borderColor: energy === level ? `${WARNING}40` : '#1e2638',
                      boxShadow: energy === level ? `0 0 12px ${WARNING}20` : 'none',
                    }}
                  >
                    <div className="text-xl mb-0.5">{ENERGY_EMOJIS[level - 1]}</div>
                    <div
                      className="text-[10px] font-mono"
                      style={{ color: energy === level ? WARNING : '#6b6358' }}
                    >
                      {level}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="input-label flex items-center gap-2 mb-2">
                <Heart size={13} style={{ color: ROSE }} />
                Mood
              </label>
              <div className="flex gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    className="flex-1 rounded-lg border py-2.5 text-center transition-all duration-200 cursor-pointer card-interactive"
                    style={{
                      background: mood === m.key ? `${ROSE}15` : 'rgba(19,23,32,0.5)',
                      borderColor: mood === m.key ? `${ROSE}35` : '#1e2638',
                      boxShadow: mood === m.key ? `0 0 12px ${ROSE}18` : 'none',
                    }}
                  >
                    <div className="text-lg">{m.emoji}</div>
                    <div
                      className="text-[10px]"
                      style={{ color: mood === m.key ? ROSE : '#6b6358' }}
                    >
                      {m.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Steward Checklist */}
            <div>
              <label className="input-label flex items-center gap-2 mb-2">
                <CheckCircle2 size={13} style={{ color: SAGE }} />
                Steward Commitments
                <span className="ml-auto text-[10px] font-mono" style={{ color: SAGE }}>
                  {checklistDone}/{STEWARD_CHECKLIST.length}
                </span>
              </label>
              <div className="space-y-1.5">
                {STEWARD_CHECKLIST.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => toggleChecklist(i)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 text-left cursor-pointer card-interactive"
                    style={{
                      background: checklist[i] ? `${SAGE}0a` : 'transparent',
                      borderColor: checklist[i] ? `${SAGE}25` : '#1e2638',
                    }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {checklist[i] ? (
                        <CheckCircle2 size={16} style={{ color: SAGE }} />
                      ) : (
                        <Circle size={16} style={{ color: '#3a4458' }} />
                      )}
                    </div>
                    <span
                      className="text-sm"
                      style={{
                        color: checklist[i] ? '#e8e0d6' : '#a09888',
                        textDecoration: checklist[i] ? 'line-through' : 'none',
                        textDecorationColor: `${SAGE}50`,
                      }}
                    >
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Win of the Day */}
            <div className="input-group">
              <label className="input-label flex items-center gap-2">
                <Award size={13} style={{ color: AMBER }} />
                Win of the Day
              </label>
              <input
                type="text"
                className="input-glass"
                placeholder="What's one thing you're proud of today?"
                value={winOfDay}
                onChange={(e) => setWinOfDay(e.target.value)}
              />
            </div>

            {/* Daily Prompt */}
            <div>
              <label className="input-label flex items-center gap-2 mb-2">
                <Sparkles size={13} style={{ color: VIOLET }} />
                Today&apos;s Prompt
              </label>
              <div
                className="rounded-lg border px-4 py-3 mb-2"
                style={{
                  background: `${VIOLET}08`,
                  borderColor: `${VIOLET}15`,
                }}
              >
                <p className="text-sm text-text-secondary italic">&ldquo;{todayPrompt}&rdquo;</p>
              </div>
              <textarea
                className="input-glass"
                rows={3}
                placeholder="Your reflection..."
                value={promptResponse}
                onChange={(e) => setPromptResponse(e.target.value)}
              />
            </div>

            {/* Free-form Notes */}
            <div className="input-group">
              <label className="input-label flex items-center gap-2">
                <MessageSquare size={13} style={{ color: SKY }} />
                Notes
              </label>
              <textarea
                className="input-glass"
                rows={4}
                placeholder="Anything else on your mind..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Publish */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={resetForm}
                className="btn btn-ghost text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="btn btn-primary"
              >
                <Send size={14} />
                Publish Entry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────── AI Insights ─────────── */}
      <div
        className="glass rounded-2xl border p-6 card-premium"
        style={{
          borderColor: 'rgba(139,92,246,0.1)',
          animation: 'jv-fadeUp 0.5s ease-out 0.35s forwards',
          opacity: 0,
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${VIOLET}15` }}
            >
              <Brain size={16} style={{ color: VIOLET }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary text-glow-purple">AI Insights</h2>
              <p className="text-[10px] text-text-muted">Pattern recognition across your journal</p>
            </div>
          </div>

          {/* Timeframe filter */}
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: '#131720' }}>
            {(['7d', '14d', '30d'] as InsightTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setInsightTimeframe(tf)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer card-interactive"
                style={{
                  background: insightTimeframe === tf ? `${VIOLET}20` : 'transparent',
                  color: insightTimeframe === tf ? VIOLET : '#6b6358',
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring Themes */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Recurring Themes
          </h3>
          {themes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <span
                  key={t.theme}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: `${t.color}12`,
                    color: t.color,
                    border: `1px solid ${t.color}20`,
                  }}
                >
                  {t.theme}
                  <span
                    className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono"
                    style={{ background: `${t.color}18` }}
                  >
                    {t.count}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">No themes detected yet. Keep journaling to surface patterns.</p>
          )}
        </div>

        {/* Theme Trends */}
        {themes.length > 0 && (
          <div
            className="rounded-lg border px-4 py-3 mb-5"
            style={{ background: `${VIOLET}06`, borderColor: `${VIOLET}12` }}
          >
            <div className="flex items-start gap-2">
              <TrendingUp size={14} className="mt-0.5 flex-shrink-0" style={{ color: VIOLET }} />
              <p className="text-sm text-text-secondary">
                {themes.length >= 3
                  ? `Your top themes are ${themes[0].theme}, ${themes[1].theme}, and ${themes[2].theme}. Consider whether these reflect your highest-leverage stewardship areas.`
                  : `${themes[0].theme} is your dominant theme. Diversifying reflections may reveal blind spots.`}
              </p>
            </div>
          </div>
        )}

        {/* AI Coach Feedback */}
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: 'Pattern Analysis', text: coachFeedback.pattern, icon: Eye, color: AMBER },
            { label: 'Energy Trends', text: coachFeedback.energy, icon: Zap, color: WARNING },
            { label: 'Commitment Follow-through', text: coachFeedback.checklist, icon: CheckCircle2, color: SAGE },
          ].map((card, i) => (
            <div
              key={card.label}
              className="rounded-xl border p-4 card-stat"
              style={{
                background: `${card.color}06`,
                borderColor: `${card.color}12`,
                animation: `jv-fadeUp 0.5s ease-out ${0.4 + i * 0.08}s forwards`,
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <card.icon size={13} style={{ color: card.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: card.color }}>
                  {card.label}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────── Bottom Cards: Commitments + Decision Filter ─────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Your Commitments */}
        <div
          className="glass rounded-2xl border p-5 card-premium"
          style={{
            borderColor: 'rgba(212,165,116,0.08)',
            animation: 'jv-fadeUp 0.5s ease-out 0.5s forwards',
            opacity: 0,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield size={15} style={{ color: AMBER }} />
            <h3 className="text-sm font-semibold text-text-primary text-glow">Your Commitments</h3>
          </div>
          <div className="space-y-2.5">
            {COMMITMENTS.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 card-interactive"
                style={{
                  borderColor: `${c.color}12`,
                  background: `${c.color}06`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: `${c.color}15` }}
                >
                  <c.icon size={14} style={{ color: c.color }} />
                </div>
                <span className="text-sm text-text-secondary">{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Filter */}
        <div
          className="glass rounded-2xl border p-5 card-premium"
          style={{
            borderColor: 'rgba(139,92,246,0.08)',
            animation: 'jv-fadeUp 0.5s ease-out 0.55s forwards',
            opacity: 0,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter size={15} style={{ color: VIOLET }} />
            <h3 className="text-sm font-semibold text-text-primary text-glow-purple">Decision Filter</h3>
          </div>
          <p className="text-xs text-text-muted mb-4">Before acting, run your decision through these questions:</p>
          <div className="space-y-3">
            {DECISION_FILTERS.map((q, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-3 py-3 rounded-lg border"
                style={{
                  borderColor: `${VIOLET}12`,
                  background: `${VIOLET}06`,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold font-mono"
                  style={{ background: `${VIOLET}18`, color: VIOLET }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-text-secondary italic">{q}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────── Recent Entries ─────────── */}
      {entries.length > 0 && (
        <div
          className="glass rounded-2xl border p-6 card-premium"
          style={{
            borderColor: 'rgba(212,165,116,0.08)',
            animation: 'jv-fadeUp 0.5s ease-out 0.6s forwards',
            opacity: 0,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} style={{ color: AMBER }} />
            <h3 className="text-sm font-semibold text-text-primary text-glow">Recent Entries</h3>
            <span className="text-[10px] text-text-muted ml-auto font-mono">{entries.length} total</span>
          </div>
          <div className="space-y-2 scrollbar-autohide" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {entries.slice(0, 8).map((entry) => {
              const tabCfg = TAB_CONFIG.find((t) => t.key === entry.type)!;
              const moodCfg = MOOD_OPTIONS.find((m) => m.key === entry.mood);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 glass-hover card-interactive"
                  style={{ borderColor: '#1e2638' }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tabCfg.color}15` }}
                  >
                    <tabCfg.icon size={13} style={{ color: tabCfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-primary font-medium">{tabCfg.label}</span>
                      <span className="text-[10px] text-text-muted">{formatDate(entry.date)}</span>
                    </div>
                    {entry.winOfDay && (
                      <p className="text-xs text-text-muted truncate mt-0.5">
                        Win: {entry.winOfDay}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm">{moodCfg?.emoji}</span>
                    <div className="flex items-center gap-1">
                      <Zap size={10} style={{ color: WARNING }} />
                      <span className="text-xs font-mono" style={{ color: WARNING }}>{entry.energy}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
