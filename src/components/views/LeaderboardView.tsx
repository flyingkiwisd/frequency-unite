'use client';

import { useState, useMemo } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users, Target, Flame, Activity } from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { getMemberColor } from '@/lib/constants';
import type { TeamMember, Task, OKR } from '@/lib/data';

type TimeFilter = 'week' | 'month' | 'all';

interface MemberScore {
  member: TeamMember;
  score: number;
  tasksDone: number;
  tasksTotal: number;
  hasActiveTasks: boolean;
}

function computeScores(members: TeamMember[], tasks: Task[], okrs: OKR[]): MemberScore[] {
  return members.map((member) => {
    const my = tasks.filter((t) => t.owner === member.id);
    const done = my.filter((t) => t.status === 'done');
    const inProg = my.filter((t) => t.status === 'in-progress');
    const blocked = my.filter((t) => t.status === 'blocked');
    const critDone = done.filter((t) => t.priority === 'critical');
    let okrPts = 0;
    okrs.forEach((o) => o.keyResults.forEach((kr) => {
      if (kr.owner === member.id && kr.progress > 50) okrPts += 5;
    }));
    const score = done.length * 10 + inProg.length * 3 + critDone.length * 5 + okrPts - blocked.length * 5;
    return { member, score: Math.max(0, score), tasksDone: done.length, tasksTotal: my.length, hasActiveTasks: inProg.length > 0 };
  });
}

const GOLD = '#d4a574', SILVER = '#94a3b8', BRONZE = '#cd7f32';
const podiumColor = (i: number) => i === 0 ? GOLD : i === 1 ? SILVER : BRONZE;

const card: React.CSSProperties = {
  backgroundColor: 'rgba(19, 23, 32, 0.8)',
  border: '1px solid rgba(30, 38, 56, 0.5)',
  borderRadius: 12,
};

export function LeaderboardView() {
  const { teamMembers, tasks, okrs, nodes } = useFrequencyData();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const ranked = useMemo(() =>
    computeScores(teamMembers, tasks, okrs).sort((a, b) => b.score - a.score),
    [teamMembers, tasks, okrs],
  );
  const top3 = ranked.slice(0, 3);

  const stats = useMemo(() => {
    const totalDone = tasks.filter((t) => t.status === 'done').length;
    const total = tasks.length;
    const rate = total > 0 ? Math.round((totalDone / total) * 100) : 0;
    const active = ranked.filter((r) => r.hasActiveTasks).length;
    const eng = teamMembers.length > 0 ? Math.round((active / teamMembers.length) * 100) : 0;
    const topNode = [...nodes].sort((a, b) => b.progress - a.progress)[0];
    return { totalDone, rate, eng, topNode };
  }, [tasks, ranked, teamMembers, nodes]);

  const filters: { key: TimeFilter; label: string }[] = [
    { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }, { key: 'all', label: 'All Time' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Trophy size={26} style={{ color: GOLD }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Leaderboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#a09888', margin: 0 }}>Team performance &amp; accountability</p>
      </div>

      {/* Time Filter */}
      <div style={{ display: 'flex', gap: 8 }}>
        {filters.map(({ key, label }) => {
          const on = timeFilter === key;
          return (
            <button key={key} onClick={() => setTimeFilter(key)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: on ? '1px solid rgba(212,165,116,0.4)' : '1px solid rgba(30,38,56,0.5)',
              backgroundColor: on ? 'rgba(212,165,116,0.12)' : 'rgba(19,23,32,0.8)',
              color: on ? GOLD : '#a09888', transition: 'all 0.2s',
            }}>{label}</button>
          );
        })}
      </div>

      {/* Podium */}
      {top3.length >= 3 && (
        <div style={{ ...card, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Crown size={16} style={{ color: GOLD }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: 1 }}>
              Top Performers
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 24 }}>
            {[1, 0, 2].map((idx) => {
              const e = top3[idx]; if (!e) return null;
              const c = podiumColor(idx), first = idx === 0, sz = first ? 64 : 52, ph = first ? 64 : idx === 1 ? 48 : 36;
              return (
                <div key={e.member.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <div style={{
                      width: sz, height: sz, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: first ? 18 : 14, fontWeight: 700, color: '#0b0d14',
                      backgroundColor: getMemberColor(e.member.color), border: `2px solid ${c}60`, boxShadow: `0 0 16px ${c}30`,
                    }}>{e.member.avatar}</div>
                    <div style={{
                      position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%',
                      backgroundColor: c, color: '#0b0d14', fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{first ? <Crown size={11} /> : idx + 1}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>{e.member.name.split(' ')[0]}</span>
                  <span style={{ fontSize: 10, color: '#a09888', marginBottom: 4 }}>{e.member.shortRole}</span>
                  <span style={{ fontSize: first ? 22 : 18, fontWeight: 700, color: c, fontVariantNumeric: 'tabular-nums' }}>{e.score}</span>
                  <div style={{
                    width: first ? 72 : 60, height: ph, borderRadius: '8px 8px 0 0', marginTop: 6,
                    background: `linear-gradient(to top, ${c}10, ${c}25)`, border: `1px solid ${c}20`, borderBottom: 'none',
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ranked Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '48px 1fr 80px 120px 80px', padding: '10px 16px',
          borderBottom: '1px solid rgba(30,38,56,0.5)', fontSize: 10, fontWeight: 700, color: '#a09888',
          textTransform: 'uppercase', letterSpacing: 0.8,
        }}>
          <span>Rank</span><span>Member</span>
          <span style={{ textAlign: 'right' }}>Score</span>
          <span style={{ textAlign: 'center' }}>Tasks</span>
          <span style={{ textAlign: 'center' }}>Status</span>
        </div>

        {ranked.map((entry, i) => {
          const rank = i + 1, t3 = rank <= 3;
          const rc = rank === 1 ? GOLD : rank === 2 ? SILVER : rank === 3 ? BRONZE : '#a09888';
          const pct = entry.tasksTotal > 0 ? Math.round((entry.tasksDone / entry.tasksTotal) * 100) : 0;
          return (
            <div key={entry.member.id} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 80px 120px 80px', alignItems: 'center',
              padding: '12px 16px', borderBottom: '1px solid rgba(30,38,56,0.3)', transition: 'background-color 0.15s',
            }}
              onMouseEnter={(ev) => { (ev.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(212,165,116,0.04)'; }}
              onMouseLeave={(ev) => { (ev.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
            >
              {/* Rank */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {rank === 1 ? <Crown size={18} style={{ color: GOLD }} />
                  : rank === 2 ? <Medal size={16} style={{ color: SILVER }} />
                  : rank === 3 ? <Medal size={16} style={{ color: BRONZE }} />
                  : <span style={{ fontSize: 15, fontWeight: 700, color: '#a09888', fontVariantNumeric: 'tabular-nums' }}>{rank}</span>}
              </div>
              {/* Avatar + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#0b0d14', backgroundColor: getMemberColor(entry.member.color),
                  flexShrink: 0, border: t3 ? `2px solid ${rc}40` : 'none',
                }}>{entry.member.avatar}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.member.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#a09888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.member.shortRole}
                  </div>
                </div>
              </div>
              {/* Score */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: t3 ? rc : '#f0ebe4', fontVariantNumeric: 'tabular-nums' }}>{entry.score}</span>
              </div>
              {/* Tasks progress */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#f0ebe4', fontVariantNumeric: 'tabular-nums' }}>
                  {entry.tasksDone} / {entry.tasksTotal}
                </span>
                <div style={{ width: '100%', height: 4, borderRadius: 2, backgroundColor: 'rgba(30,38,56,0.8)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`, borderRadius: 2, transition: 'width 0.5s ease',
                    backgroundColor: pct >= 60 ? '#6b8f71' : pct >= 30 ? GOLD : '#a09888',
                  }} />
                </div>
              </div>
              {/* Activity status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {entry.hasActiveTasks
                  ? <><Flame size={13} style={{ color: '#6b8f71' }} /><span style={{ fontSize: 11, fontWeight: 600, color: '#6b8f71' }}>Active</span></>
                  : <><Activity size={13} style={{ color: '#a09888' }} /><span style={{ fontSize: 11, fontWeight: 600, color: '#a09888' }}>Quiet</span></>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {([
          { icon: Target, label: 'Tasks Completed', value: String(stats.totalDone), color: '#6b8f71' },
          { icon: TrendingUp, label: 'Completion Rate', value: `${stats.rate}%`, color: GOLD },
          { icon: Activity, label: 'Most Active Node', value: stats.topNode?.shortName ?? '--', color: '#8b5cf6' },
          { icon: Users, label: 'Engagement', value: `${stats.eng}%`, color: '#38bdf8' },
        ] as const).map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Icon size={14} style={{ color }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#a09888', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
