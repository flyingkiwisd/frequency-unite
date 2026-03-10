'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  ChevronDown,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Flame,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

// ── Types ──────────────────────────────────────────────────

type CommitmentStatus = 'pending' | 'completed' | 'missed' | 'partial';

interface Commitment {
  id: string;
  text: string;
  status: CommitmentStatus;
}

interface DayEntry {
  date: string; // YYYY-MM-DD
  commitments: Commitment[];
}

interface MemberData {
  [memberId: string]: {
    entries: DayEntry[];
  };
}

// ── Helpers ────────────────────────────────────────────────

const LS_KEY = 'frequency-accountability';

const todayStr = () => new Date().toISOString().split('T')[0];

const dayLabel = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const weekdayShort = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

const getWeekDates = (offset: number = 0): string[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + offset * 7);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const getHitRate = (entry: DayEntry | undefined): number => {
  if (!entry || entry.commitments.length === 0) return 0;
  const completed = entry.commitments.filter((c) => c.status === 'completed').length;
  const partial = entry.commitments.filter((c) => c.status === 'partial').length;
  return Math.round(((completed + partial * 0.5) / entry.commitments.length) * 100);
};

const statusColor = (status: CommitmentStatus) => {
  switch (status) {
    case 'completed': return 'text-emerald-400';
    case 'partial': return 'text-amber-400';
    case 'missed': return 'text-rose-400';
    default: return 'text-text-muted';
  }
};

const statusBg = (status: CommitmentStatus) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500/15 border-emerald-500/30';
    case 'partial': return 'bg-amber-500/15 border-amber-500/30';
    case 'missed': return 'bg-rose-500/15 border-rose-500/30';
    default: return 'bg-surface-3 border-border';
  }
};

// ── Mock data generator ───────────────────────────────────

const generateMockData = (): MemberData => {
  const data: MemberData = {};
  const currentWeek = getWeekDates(0);
  const mockCommitments: Record<string, string[][]> = {
    james: [
      ['Review DAF structure compliance doc', 'Blue Spirit speaker outreach', 'Capital Node deal pipeline review'],
      ['Wisdom Council prep for Thursday', 'Map Node MVP feedback session', 'Review DAF structure compliance doc'],
      ['Blue Spirit speaker outreach', 'Capital Node deal pipeline review', 'Wisdom Council prep for Thursday'],
      ['Map Node MVP feedback session', 'Review DAF structure compliance doc', 'Blue Spirit speaker outreach'],
      ['Capital Node deal pipeline review', 'Wisdom Council prep for Thursday', 'Map Node MVP feedback session'],
    ],
    sian: [
      ['Cash forecast weekly update', 'Member onboarding call with 3 prospects', 'Blue Spirit logistics vendor review'],
      ['Update Airtable member database', 'Team capacity review', 'Cash forecast weekly update'],
      ['Member onboarding call with 3 prospects', 'Blue Spirit logistics vendor review', 'Update Airtable member database'],
      ['Team capacity review', 'Cash forecast weekly update', 'Member onboarding call with 3 prospects'],
      ['Blue Spirit logistics vendor review', 'Update Airtable member database', 'Team capacity review'],
    ],
    fairman: [
      ['Thesis of Change v2 draft', 'Node lead sync call prep', 'DECO framework legal review'],
      ['Cross-node dependency mapping', 'Map Node architecture sprint', 'Thesis of Change v2 draft'],
      ['Node lead sync call prep', 'DECO framework legal review', 'Cross-node dependency mapping'],
      ['Map Node architecture sprint', 'Thesis of Change v2 draft', 'Node lead sync call prep'],
      ['DECO framework legal review', 'Cross-node dependency mapping', 'Map Node architecture sprint'],
    ],
  };

  const statuses: CommitmentStatus[][] = [
    ['completed', 'completed', 'partial'],
    ['completed', 'partial', 'completed'],
    ['completed', 'completed', 'completed'],
    ['partial', 'completed', 'missed'],
    ['pending', 'pending', 'pending'],
  ];

  for (const memberId of Object.keys(mockCommitments)) {
    const entries: DayEntry[] = [];
    const commitmentSets = mockCommitments[memberId];
    for (let i = 0; i < Math.min(currentWeek.length, commitmentSets.length); i++) {
      const dayCommitments = commitmentSets[i];
      const dayStatuses = statuses[i];
      entries.push({
        date: currentWeek[i],
        commitments: dayCommitments.map((text, j) => ({
          id: `${memberId}-${currentWeek[i]}-${j}`,
          text,
          status: dayStatuses[j],
        })),
      });
    }
    data[memberId] = { entries };
  }

  return data;
};

// ── Component ──────────────────────────────────────────────

export function AccountabilityView() {
  const [selectedMember, setSelectedMember] = useState(teamMembers[0].id);
  const [data, setData] = useState<MemberData>({});
  const [newCommitment, setNewCommitment] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load from localStorage or initialize with mock data
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        const mock = generateMockData();
        setData(mock);
        localStorage.setItem(LS_KEY, JSON.stringify(mock));
      }
    } else {
      const mock = generateMockData();
      setData(mock);
      localStorage.setItem(LS_KEY, JSON.stringify(mock));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    }
  }, [data]);

  const today = todayStr();
  const currentWeek = useMemo(() => getWeekDates(0), []);
  const memberData = data[selectedMember];
  const todayEntry = memberData?.entries.find((e) => e.date === today);
  const selectedMemberObj = teamMembers.find((m) => m.id === selectedMember);
  const activeMembers = teamMembers.filter((m) => m.status !== 'hiring');

  // Streak calculation
  const streak = useMemo(() => {
    if (!memberData) return 0;
    let count = 0;
    const sorted = [...memberData.entries]
      .filter((e) => e.date < today)
      .sort((a, b) => b.date.localeCompare(a.date));
    for (const entry of sorted) {
      const rate = getHitRate(entry);
      if (rate === 100) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [memberData, today]);

  // Monthly trend (past 4 weeks)
  const monthlyTrend = useMemo(() => {
    const weeks: { label: string; rate: number }[] = [];
    for (let w = -3; w <= 0; w++) {
      const weekDates = getWeekDates(w);
      let totalRate = 0;
      let daysWithData = 0;
      for (const date of weekDates) {
        const entry = memberData?.entries.find((e) => e.date === date);
        if (entry && entry.commitments.length > 0) {
          totalRate += getHitRate(entry);
          daysWithData++;
        }
      }
      const avgRate = daysWithData > 0 ? Math.round(totalRate / daysWithData) : 0;
      const start = new Date(weekDates[0] + 'T12:00:00');
      weeks.push({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: avgRate,
      });
    }
    return weeks;
  }, [memberData]);

  // ── Handlers ──

  const addCommitment = () => {
    if (!newCommitment.trim()) return;
    const commitment: Commitment = {
      id: `${selectedMember}-${today}-${Date.now()}`,
      text: newCommitment.trim(),
      status: 'pending',
    };
    setData((prev) => {
      const memberEntries = prev[selectedMember]?.entries || [];
      const existingEntryIdx = memberEntries.findIndex((e) => e.date === today);
      let updatedEntries: DayEntry[];
      if (existingEntryIdx >= 0) {
        updatedEntries = memberEntries.map((e, i) =>
          i === existingEntryIdx
            ? { ...e, commitments: [...e.commitments, commitment] }
            : e
        );
      } else {
        updatedEntries = [...memberEntries, { date: today, commitments: [commitment] }];
      }
      return { ...prev, [selectedMember]: { entries: updatedEntries } };
    });
    setNewCommitment('');
  };

  const updateStatus = (date: string, commitmentId: string, status: CommitmentStatus) => {
    setData((prev) => {
      const memberEntries = prev[selectedMember]?.entries || [];
      const updatedEntries = memberEntries.map((entry) => {
        if (entry.date !== date) return entry;
        return {
          ...entry,
          commitments: entry.commitments.map((c) =>
            c.id === commitmentId ? { ...c, status } : c
          ),
        };
      });
      return { ...prev, [selectedMember]: { entries: updatedEntries } };
    });
  };

  const removeCommitment = (date: string, commitmentId: string) => {
    setData((prev) => {
      const memberEntries = prev[selectedMember]?.entries || [];
      const updatedEntries = memberEntries.map((entry) => {
        if (entry.date !== date) return entry;
        return {
          ...entry,
          commitments: entry.commitments.filter((c) => c.id !== commitmentId),
        };
      });
      return { ...prev, [selectedMember]: { entries: updatedEntries } };
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Activity className="w-7 h-7 text-accent" />
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Steward Accountability Loops</span>
            </h1>
          </div>
          <p className="text-text-secondary text-sm mt-1 max-w-xl">
            Track morning commitments against end-of-day results. Build consistency, measure follow-through across the steward team.
          </p>
        </div>

        {/* Member Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-2.5 hover:border-border-2 transition-all min-w-[200px]"
          >
            {selectedMemberObj && (
              <div className={`w-8 h-8 rounded-lg ${selectedMemberObj.color} flex items-center justify-center text-white text-xs font-bold`}>
                {selectedMemberObj.avatar}
              </div>
            )}
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-text-primary">{selectedMemberObj?.name}</p>
              <p className="text-xs text-text-muted">{selectedMemberObj?.shortRole}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-full bg-surface border border-border rounded-xl shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
              {activeMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMember(m.id); setDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2 transition-colors ${
                    m.id === selectedMember ? 'bg-surface-2' : ''
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg ${m.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {m.avatar}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-text-primary">{m.name}</p>
                    <p className="text-xs text-text-muted">{m.shortRole}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glow-card bg-surface border border-border rounded-xl p-5 animate-fade-in" style={{ animationDelay: '75ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Streak</span>
          </div>
          <p className="text-2xl font-bold text-accent">{streak}</p>
          <p className="text-xs text-text-muted mt-0.5">consecutive 100% days</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5 animate-fade-in" style={{ animationDelay: '125ms' }}>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Today&apos;s Hit Rate</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{getHitRate(todayEntry)}%</p>
          <p className="text-xs text-text-muted mt-0.5">{todayEntry?.commitments.length ?? 0} commitments</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5 animate-fade-in" style={{ animationDelay: '175ms' }}>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">This Week Avg</span>
          <p className="text-2xl font-bold text-text-primary mt-2">
            {(() => {
              let total = 0; let count = 0;
              for (const d of currentWeek) {
                const entry = memberData?.entries.find((e) => e.date === d);
                if (entry && entry.commitments.length > 0) { total += getHitRate(entry); count++; }
              }
              return count > 0 ? Math.round(total / count) : 0;
            })()}%
          </p>
          <p className="text-xs text-text-muted mt-0.5">weekly average</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5 animate-fade-in" style={{ animationDelay: '225ms' }}>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Completed</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {memberData?.entries.reduce((sum, e) => sum + e.commitments.filter((c) => c.status === 'completed').length, 0) ?? 0}
          </p>
          <p className="text-xs text-text-muted mt-0.5">all time</p>
        </div>
      </div>

      {/* ── Two Column: Today's Commitments + Weekly Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Top 3 */}
        <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '275ms' }}>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Top 3 Today
          </h3>
          <p className="text-xs text-text-muted mb-4">{dayLabel(today)}</p>

          {/* Add commitment */}
          <div className="flex items-center gap-2 mb-5">
            <input
              type="text"
              value={newCommitment}
              onChange={(e) => setNewCommitment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCommitment()}
              placeholder="Add a commitment..."
              className="flex-1 bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
              disabled={(todayEntry?.commitments.length ?? 0) >= 5}
            />
            <button
              onClick={addCommitment}
              disabled={!newCommitment.trim() || (todayEntry?.commitments.length ?? 0) >= 5}
              className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Commitments list */}
          <div className="space-y-3">
            {todayEntry?.commitments.map((c) => (
              <div
                key={c.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${statusBg(c.status)}`}
              >
                <div className="flex-1">
                  <p className={`text-sm font-medium ${c.status === 'completed' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                    {c.text}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => updateStatus(today, c.id, 'completed')}
                    className={`p-1 rounded transition-colors ${c.status === 'completed' ? 'text-emerald-400' : 'text-text-muted hover:text-emerald-400'}`}
                    title="Completed"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateStatus(today, c.id, 'partial')}
                    className={`p-1 rounded transition-colors ${c.status === 'partial' ? 'text-amber-400' : 'text-text-muted hover:text-amber-400'}`}
                    title="Partial"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateStatus(today, c.id, 'missed')}
                    className={`p-1 rounded transition-colors ${c.status === 'missed' ? 'text-rose-400' : 'text-text-muted hover:text-rose-400'}`}
                    title="Missed"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeCommitment(today, c.id)}
                    className="p-1 rounded text-text-muted hover:text-rose-400 transition-colors ml-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {(!todayEntry || todayEntry.commitments.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                <Save className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No commitments yet for today</p>
                <p className="text-xs mt-1">Add your Top 3 priorities above</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Hit Rate Chart */}
        <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '325ms' }}>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Weekly Hit Rate</h3>

          <div className="flex items-end gap-2 h-48 mb-4">
            {currentWeek.map((date) => {
              const entry = memberData?.entries.find((e) => e.date === date);
              const rate = getHitRate(entry);
              const isToday = date === today;
              const barColor = rate >= 80
                ? 'bg-emerald-500'
                : rate >= 50
                ? 'bg-amber-500'
                : rate > 0
                ? 'bg-rose-500'
                : 'bg-surface-3';

              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-mono text-text-muted">{rate > 0 ? `${rate}%` : ''}</span>
                  <div className="w-full flex flex-col justify-end h-36 bg-surface-3/50 rounded-lg overflow-hidden">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${barColor}`}
                      style={{ height: `${rate}%`, minHeight: rate > 0 ? '4px' : '0px' }}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? 'text-accent font-semibold' : 'text-text-muted'}`}>
                    {weekdayShort(date)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar for overall week */}
          <div>
            <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
              <span>Weekly Progress</span>
              <span className="text-accent font-medium">
                {(() => {
                  let total = 0; let count = 0;
                  for (const d of currentWeek) {
                    const entry = memberData?.entries.find((e) => e.date === d);
                    if (entry && entry.commitments.length > 0) { total += getHitRate(entry); count++; }
                  }
                  return count > 0 ? Math.round(total / count) : 0;
                })()}%
              </span>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-700"
                style={{
                  width: `${(() => {
                    let total = 0; let count = 0;
                    for (const d of currentWeek) {
                      const entry = memberData?.entries.find((e) => e.date === d);
                      if (entry && entry.commitments.length > 0) { total += getHitRate(entry); count++; }
                    }
                    return count > 0 ? Math.round(total / count) : 0;
                  })()}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Monthly Trend + Week History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '375ms' }}>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Trend</h3>

          <div className="space-y-3">
            {monthlyTrend.map((week, i) => {
              const barColor = week.rate >= 80
                ? 'bg-emerald-500'
                : week.rate >= 50
                ? 'bg-amber-500'
                : week.rate > 0
                ? 'bg-rose-500'
                : 'bg-surface-3';
              const isCurrentWeek = i === monthlyTrend.length - 1;

              return (
                <div key={i} className="flex items-center gap-3">
                  <span className={`text-xs font-mono w-20 flex-shrink-0 ${isCurrentWeek ? 'text-accent font-semibold' : 'text-text-muted'}`}>
                    {week.label}
                  </span>
                  <div className="flex-1 h-5 bg-surface-3/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${week.rate}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono w-10 text-right ${isCurrentWeek ? 'text-accent font-semibold' : 'text-text-muted'}`}>
                    {week.rate}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Trend line visualization */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-text-muted mb-3">Completion Trend</p>
            <div className="flex items-end justify-between h-16 gap-1">
              {monthlyTrend.map((week, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full bg-accent border-2 border-accent/50"
                    style={{ marginBottom: `${(week.rate / 100) * 48}px` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Week History */}
        <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '425ms' }}>
          <h3 className="text-lg font-semibold text-text-primary mb-4">This Week&apos;s Commitments</h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {currentWeek.map((date) => {
              const entry = memberData?.entries.find((e) => e.date === date);
              const isToday = date === today;
              if (!entry || entry.commitments.length === 0) return null;

              return (
                <div key={date} className={`rounded-lg border p-3 ${isToday ? 'border-accent/30 bg-accent/5' : 'border-border bg-surface-2/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${isToday ? 'text-accent' : 'text-text-secondary'}`}>
                      {dayLabel(date)} {isToday && '(Today)'}
                    </span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      getHitRate(entry) >= 80
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : getHitRate(entry) >= 50
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {getHitRate(entry)}%
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {entry.commitments.map((c) => (
                      <div key={c.id} className="flex items-center gap-2">
                        {c.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                        {c.status === 'partial' && <MinusCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        {c.status === 'missed' && <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                        {c.status === 'pending' && <div className="w-3.5 h-3.5 rounded-full border border-text-muted/40 flex-shrink-0" />}
                        <span className={`text-xs ${statusColor(c.status)} ${c.status === 'completed' ? 'line-through' : ''}`}>
                          {c.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
