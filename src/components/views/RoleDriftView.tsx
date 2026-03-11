'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  Activity,
  Target,
  Users,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  Lightbulb,
  Shield,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* --- Colors --- */
const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const GOLD = '#e8b44c';
const DANGER = '#e06060';
const SKY = '#5eaed4';
const ROSE = '#e879a0';

/* --- Types --- */
interface DriftActivity {
  label: string;
  type: 'in-seat' | 'out-of-seat';
  hoursPerWeek: number;
}

interface DriftMember {
  id: string;
  driftScore: number;
  prevDriftScore: number;
  activities: DriftActivity[];
  recommendation?: string;
}

/* --- Mock Data --- */
const driftData: DriftMember[] = [
  {
    id: 'sian',
    driftScore: 35,
    prevDriftScore: 42,
    activities: [
      { label: 'Cash forecasting', type: 'in-seat', hoursPerWeek: 8 },
      { label: 'Member onboarding', type: 'in-seat', hoursPerWeek: 6 },
      { label: 'Strategic planning', type: 'out-of-seat', hoursPerWeek: 10 },
      { label: 'Fundraising calls', type: 'out-of-seat', hoursPerWeek: 8 },
      { label: 'Board governance', type: 'out-of-seat', hoursPerWeek: 5 },
    ],
    recommendation: 'High drift alert. Sian is carrying strategic work that should belong to a CEO hire. Prioritize offloading fundraising and board governance.',
  },
  {
    id: 'james',
    driftScore: 75,
    prevDriftScore: 72,
    activities: [
      { label: 'Vision strategy', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Board governance', type: 'in-seat', hoursPerWeek: 3 },
      { label: 'Capital strategy', type: 'in-seat', hoursPerWeek: 3 },
      { label: 'Operational decisions', type: 'out-of-seat', hoursPerWeek: 2 },
      { label: 'Vendor management', type: 'out-of-seat', hoursPerWeek: 1 },
    ],
    recommendation: 'Moderate drift. Consider delegating vendor management and day-to-day operational decisions to COO.',
  },
  {
    id: 'fairman',
    driftScore: 82,
    prevDriftScore: 80,
    activities: [
      { label: 'Thesis architecture', type: 'in-seat', hoursPerWeek: 6 },
      { label: 'Node design', type: 'in-seat', hoursPerWeek: 5 },
      { label: 'DECO framework', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Event logistics', type: 'out-of-seat', hoursPerWeek: 3 },
    ],
    recommendation: 'Well-focused. Minor drift into event logistics \u2014 could be redirected to ops team.',
  },
  {
    id: 'greg',
    driftScore: 90,
    prevDriftScore: 88,
    activities: [
      { label: 'Deal scoring', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Capital deployment', type: 'in-seat', hoursPerWeek: 3 },
      { label: 'Due diligence', type: 'in-seat', hoursPerWeek: 3 },
    ],
  },
  {
    id: 'mafe',
    driftScore: 70,
    prevDriftScore: 65,
    activities: [
      { label: 'Airtable management', type: 'in-seat', hoursPerWeek: 8 },
      { label: 'Communications', type: 'in-seat', hoursPerWeek: 6 },
      { label: 'Strategic planning', type: 'out-of-seat', hoursPerWeek: 3 },
      { label: 'Member outreach', type: 'out-of-seat', hoursPerWeek: 3 },
    ],
    recommendation: 'Improving focus. Strategic planning and member outreach are stretching beyond PM scope.',
  },
  {
    id: 'colleen',
    driftScore: 88,
    prevDriftScore: 86,
    activities: [
      { label: 'DAF compliance', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Financial stewardship', type: 'in-seat', hoursPerWeek: 3 },
      { label: 'General ops', type: 'out-of-seat', hoursPerWeek: 1 },
    ],
  },
  {
    id: 'dave',
    driftScore: 78,
    prevDriftScore: 75,
    activities: [
      { label: 'Pod facilitation', type: 'in-seat', hoursPerWeek: 4 },
      { label: 'Board governance', type: 'in-seat', hoursPerWeek: 2 },
      { label: 'Cash forecasting', type: 'out-of-seat', hoursPerWeek: 2 },
      { label: 'Vendor management', type: 'out-of-seat', hoursPerWeek: 1 },
    ],
    recommendation: 'Cash forecasting is out of scope for Board & Culture role. Redirect to Sian or finance.',
  },
  {
    id: 'gareth',
    driftScore: 85,
    prevDriftScore: 82,
    activities: [
      { label: 'Bioregion design', type: 'in-seat', hoursPerWeek: 6 },
      { label: 'Nicoya pilot', type: 'in-seat', hoursPerWeek: 5 },
      { label: 'Admin tasks', type: 'out-of-seat', hoursPerWeek: 2 },
    ],
  },
];

/* --- Avatar gradient helper --- */
function avatarGradient(color: string): string {
  const gradientMap: Record<string, string> = {
    'bg-amber-500': 'linear-gradient(135deg, #c4925a, #d4a574)',
    'bg-amber-400': 'linear-gradient(135deg, #d4a574, #e8b44c)',
    'bg-rose-400': 'linear-gradient(135deg, #e879a0, #f0a0b8)',
    'bg-violet-500': 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    'bg-sky-400': 'linear-gradient(135deg, #38bdf8, #5eaed4)',
    'bg-emerald-500': 'linear-gradient(135deg, #10b981, #34d399)',
    'bg-purple-500': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'bg-pink-400': 'linear-gradient(135deg, #e879a0, #f0a0b8)',
    'bg-teal-400': 'linear-gradient(135deg, #2dd4bf, #5eead4)',
    'bg-green-500': 'linear-gradient(135deg, #22c55e, #4ade80)',
    'bg-lime-500': 'linear-gradient(135deg, #84cc16, #a3e635)',
    'bg-orange-500': 'linear-gradient(135deg, #f97316, #fb923c)',
    'bg-indigo-400': 'linear-gradient(135deg, #818cf8, #a5b4fc)',
    'bg-slate-400': 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
  };
  return gradientMap[color] || 'linear-gradient(135deg, #a09888, #6b6358)';
}

/* --- Score color helpers --- */
function scoreColor(score: number): string {
  if (score >= 80) return SAGE;
  if (score >= 60) return GOLD;
  return DANGER;
}

function scoreBg(score: number): string {
  if (score >= 80) return 'rgba(107, 143, 113, 0.12)';
  if (score >= 60) return 'rgba(232, 180, 76, 0.12)';
  return 'rgba(224, 96, 96, 0.12)';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Focused';
  if (score >= 60) return 'Moderate Drift';
  return 'High Drift';
}

/* --- SVG Radar Chart --- */
function RadarChart({ data, size = 200 }: { data: typeof driftData; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 20;
  const members = data.slice(0, 8); // Max 8 for radar
  const angleStep = (2 * Math.PI) / members.length;

  // Generate points for each ring level
  function ringPoints(radius: number) {
    return members.map((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  }

  // Generate points for data polygon
  const dataPoints = members.map((m, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (m.driftScore / 100) * maxRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%">
          <stop offset="0%" stopColor={AMBER} stopOpacity="0.2" />
          <stop offset="100%" stopColor={AMBER} stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* Background rings */}
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <polygon
          key={level}
          points={ringPoints(maxRadius * level)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis lines */}
      {members.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const x2 = cx + maxRadius * Math.cos(angle);
        const y2 = cy + maxRadius * Math.sin(angle);
        return (
          <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="url(#radar-fill)"
        stroke={AMBER}
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${AMBER}30)` }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => {
        const color = scoreColor(members[i].driftScore);
        return (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#131720" strokeWidth="1.5" />
        );
      })}

      {/* Labels */}
      {members.map((m, i) => {
        const member = teamMembers.find((tm) => tm.id === m.id);
        if (!member) return null;
        const angle = -Math.PI / 2 + i * angleStep;
        const labelR = maxRadius + 14;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
        return (
          <text
            key={m.id}
            x={x}
            y={y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fill={scoreColor(m.driftScore)}
            fontSize="9"
            fontWeight="600"
          >
            {member.name.split(' ')[0]}
          </text>
        );
      })}
    </svg>
  );
}

/* --- SVG Bar Chart for Activities --- */
function ActivityBarChart({ activities }: { activities: DriftActivity[] }) {
  const maxHours = Math.max(...activities.map((a) => a.hoursPerWeek), 1);
  const barHeight = 16;
  const gap = 6;
  const labelWidth = 110;
  const chartWidth = 200;
  const totalHeight = activities.length * (barHeight + gap) - gap;

  return (
    <svg width={labelWidth + chartWidth + 40} height={totalHeight} viewBox={`0 0 ${labelWidth + chartWidth + 40} ${totalHeight}`}>
      {activities.map((a, i) => {
        const y = i * (barHeight + gap);
        const barW = (a.hoursPerWeek / maxHours) * chartWidth;
        const color = a.type === 'in-seat' ? SAGE : GOLD;
        return (
          <g key={i}>
            <text x={labelWidth - 6} y={y + barHeight / 2 + 1} textAnchor="end" fill="#a09888" fontSize="10" dominantBaseline="middle">
              {a.label}
            </text>
            <rect x={labelWidth} y={y} width={barW} height={barHeight} rx={4} fill={`${color}30`} stroke={`${color}40`} strokeWidth="0.5" />
            <rect x={labelWidth} y={y} width={barW} height={barHeight} rx={4} fill={`${color}20`}>
              <animate attributeName="width" from="0" to={barW} dur="0.6s" fill="freeze" />
            </rect>
            <text x={labelWidth + barW + 6} y={y + barHeight / 2 + 1} fill={color} fontSize="10" fontWeight="600" fontFamily="monospace" dominantBaseline="middle">
              {a.hoursPerWeek}h
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* --- Drift Score Badge --- */
function DriftBadge({ score, size = 'normal' }: { score: number; size?: 'normal' | 'large' }) {
  const color = scoreColor(score);
  const bg = scoreBg(score);
  const label = scoreLabel(score);
  const driftPct = 100 - score;

  if (size === 'large') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 16px',
          borderRadius: 12,
          backgroundColor: bg,
          border: `1px solid ${color}30`,
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'monospace', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
          {label}
        </span>
        <span style={{ fontSize: 10, color: '#6b6358', marginTop: 2 }}>
          {driftPct}% drift
        </span>
      </div>
    );
  }

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 20,
        color,
        backgroundColor: bg,
        border: `1px solid ${color}25`,
        fontFamily: 'monospace',
      }}
    >
      {score}
    </span>
  );
}

/* --- Team Drift Overview SVG --- */
function TeamDriftOverview({ data }: { data: Array<{ id: string; driftScore: number; member: any }> }) {
  const barHeight = 24;
  const gap = 8;
  const labelWidth = 90;
  const chartWidth = 400;
  const totalHeight = data.length * (barHeight + gap) - gap;
  const sorted = [...data].sort((a, b) => a.driftScore - b.driftScore);

  return (
    <svg width="100%" height={totalHeight + 10} viewBox={`0 0 ${labelWidth + chartWidth + 60} ${totalHeight + 10}`}>
      {sorted.map((item, i) => {
        const y = i * (barHeight + gap);
        const inSeatW = (item.driftScore / 100) * chartWidth;
        const outSeatW = ((100 - item.driftScore) / 100) * chartWidth;
        const color = scoreColor(item.driftScore);

        return (
          <g key={item.id}>
            {/* Name */}
            <text x={labelWidth - 8} y={y + barHeight / 2 + 1} textAnchor="end" fill="#d8cfc4" fontSize="11" fontWeight="600" dominantBaseline="middle">
              {item.member?.name.split(' ')[0] || item.id}
            </text>

            {/* In-seat bar (green) */}
            <rect x={labelWidth} y={y} width={inSeatW} height={barHeight} rx={4} fill={`${SAGE}30`} stroke={`${SAGE}25`} strokeWidth="0.5" />

            {/* Out-of-seat bar (amber/red) */}
            <rect x={labelWidth + inSeatW} y={y} width={outSeatW} height={barHeight} rx={0} fill={`${item.driftScore < 50 ? DANGER : GOLD}20`} stroke={`${item.driftScore < 50 ? DANGER : GOLD}20`} strokeWidth="0.5">
              <animate attributeName="rx" from="0" to="4" dur="0.3s" fill="freeze" />
            </rect>

            {/* Score overlay text */}
            <text x={labelWidth + 8} y={y + barHeight / 2 + 1} fill={SAGE} fontSize="10" fontWeight="700" fontFamily="monospace" dominantBaseline="middle">
              {item.driftScore}%
            </text>

            {/* Drift % on right */}
            <text
              x={labelWidth + chartWidth + 8}
              y={y + barHeight / 2 + 1}
              fill={color}
              fontSize="10"
              fontWeight="600"
              fontFamily="monospace"
              dominantBaseline="middle"
            >
              {100 - item.driftScore}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ===================================================================
   Main Component
   =================================================================== */

export function RoleDriftView() {
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const enrichedData = useMemo(() => {
    return driftData
      .map((d) => {
        const member = teamMembers.find((m) => m.id === d.id);
        return { ...d, member };
      })
      .filter((d) => d.member);
  }, []);

  const sorted = useMemo(() => {
    return [...enrichedData].sort((a, b) =>
      sortAsc ? b.driftScore - a.driftScore : a.driftScore - b.driftScore
    );
  }, [enrichedData, sortAsc]);

  // Aggregate stats
  const avgScore = Math.round(
    enrichedData.reduce((sum, d) => sum + d.driftScore, 0) / enrichedData.length
  );
  const mostFocused = enrichedData.reduce((best, d) => d.driftScore > best.driftScore ? d : best);
  const mostDrifted = enrichedData.reduce((worst, d) => d.driftScore < worst.driftScore ? d : worst);
  const totalActivities = enrichedData.reduce((sum, d) => sum + d.activities.length, 0);
  const membersWithRecs = enrichedData.filter((d) => d.recommendation).length;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px' }}>
      {/* -- Header -- */}
      <div className="animate-fade-in" style={{ marginBottom: 32, opacity: 0, animationDelay: '0s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Compass size={28} style={{ color: AMBER }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>
            Role Drift Detector
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#a09888', margin: 0, paddingLeft: 40 }}>
          Tracking role adherence across the steward team. Lower scores indicate more time spent outside defined responsibilities.
        </p>
      </div>

      {/* -- Summary Stats -- */}
      <div
        className="animate-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          marginBottom: 24,
          animationDelay: '0.03s',
          opacity: 0,
        }}
      >
        {[
          { label: 'Avg Focus Score', value: avgScore.toString(), color: scoreColor(avgScore), icon: Target },
          { label: 'Most Focused', value: mostFocused.member?.name.split(' ')[0] || '', sub: `Score: ${mostFocused.driftScore}`, color: SAGE, icon: CheckCircle2 },
          { label: 'Most Drifted', value: mostDrifted.member?.name.split(' ')[0] || '', sub: `Score: ${mostDrifted.driftScore}`, color: DANGER, icon: TrendingDown },
          { label: 'Total Activities', value: totalActivities.toString(), color: VIOLET, icon: Activity },
          { label: 'Action Needed', value: membersWithRecs.toString(), sub: 'recommendations', color: GOLD, icon: Lightbulb },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="animate-fade-in glow-card"
              style={{
                backgroundColor: `${stat.color}0a`,
                border: `1px solid ${stat.color}20`,
                borderRadius: 12,
                padding: '14px',
                animationDelay: `${0.05 + i * 0.03}s`,
                opacity: 0,
                transition: 'border-color 0.3s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${stat.color}40`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${stat.color}20`;
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Icon size={13} style={{ color: stat.color }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: stat.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>
                {stat.value}
              </div>
              {(stat as { sub?: string }).sub && (
                <div style={{ fontSize: 10, color: '#6b6358', marginTop: 2 }}>
                  {(stat as { sub?: string }).sub}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* -- Radar Chart + Team Overview Grid -- */}
      <div
        className="animate-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: 24,
          marginBottom: 24,
          animationDelay: '0.1s',
          opacity: 0,
        }}
      >
        {/* Radar */}
        <div
          className="glow-card"
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, alignSelf: 'flex-start' }}>
            <BarChart3 size={13} style={{ color: '#6b6358' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Focus Radar
            </span>
          </div>
          <RadarChart data={driftData} size={210} />
        </div>

        {/* Team Drift Overview bars */}
        <div
          className="glow-card"
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={13} style={{ color: '#6b6358' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Team Drift Overview
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: `${SAGE}40` }} />
                <span style={{ fontSize: 9, color: '#6b6358' }}>In-Seat</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: `${GOLD}30` }} />
                <span style={{ fontSize: 9, color: '#6b6358' }}>Drift</span>
              </div>
            </div>
          </div>
          <TeamDriftOverview data={enrichedData as any} />
        </div>
      </div>

      {/* -- Sort Toggle -- */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          animationDelay: '0.14s',
          opacity: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={13} style={{ color: '#6b6358' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Team Members ({sorted.length})
          </span>
        </div>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid #1e2638',
            backgroundColor: '#131720',
            color: '#a09888',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          <ArrowUpDown size={12} />
          {sortAsc ? 'Most Focused First' : 'Most Drifted First'}
        </button>
      </div>

      {/* -- Drift Cards -- */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {sorted.map((item, i) => {
          const member = item.member!;
          const isWarning = item.driftScore < 50;
          const inSeat = item.activities.filter((a) => a.type === 'in-seat');
          const outSeat = item.activities.filter((a) => a.type === 'out-of-seat');
          const driftPct = 100 - item.driftScore;
          const isExpanded = expandedCard === item.id;
          const trendDiff = item.driftScore - item.prevDriftScore;

          return (
            <div
              key={item.id}
              className="animate-fade-in glow-card"
              style={{
                backgroundColor: '#131720',
                border: `1px solid ${isWarning ? 'rgba(224,96,96,0.35)' : isExpanded ? '#2e3a4e' : '#1e2638'}`,
                borderRadius: 14,
                animationDelay: `${0.18 + i * 0.04}s`,
                opacity: 0,
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                if (!isExpanded && !isWarning) e.currentTarget.style.borderColor = '#2e3a4e';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                if (!isExpanded && !isWarning) e.currentTarget.style.borderColor = '#1e2638';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ padding: '18px 20px' }}>
                {/* Member Header */}
                <div
                  style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12, cursor: 'pointer' }}
                  onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0b0d14',
                      background: avatarGradient(member.color),
                      flexShrink: 0,
                    }}
                  >
                    {member.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4' }}>{member.name}</span>
                      {isWarning && <AlertTriangle size={14} style={{ color: DANGER }} />}
                      {/* Trend badge */}
                      {trendDiff !== 0 && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            fontSize: 9,
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 20,
                            color: trendDiff > 0 ? SAGE : DANGER,
                            backgroundColor: trendDiff > 0 ? 'rgba(107,143,113,0.12)' : 'rgba(224,96,96,0.12)',
                          }}
                        >
                          {trendDiff > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                          {trendDiff > 0 ? '+' : ''}{trendDiff}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: '#a09888', margin: '2px 0 0' }}>{member.role}</p>
                  </div>
                  {/* Score badge */}
                  <DriftBadge score={item.driftScore} size="large" />
                </div>

                {/* Role description */}
                <p style={{ fontSize: 11, color: '#6b6358', lineHeight: 1.5, margin: '0 0 12px', fontStyle: 'italic' }}>
                  {member.roleOneSentence}
                </p>

                {/* Drift Meter */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Drift Meter
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: scoreColor(item.driftScore) }}>
                      {driftPct}% out-of-seat
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: '#1c2230', overflow: 'hidden', display: 'flex' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${item.driftScore}%`,
                        backgroundColor: SAGE,
                        borderRadius: '4px 0 0 4px',
                        transition: 'width 0.6s ease-out',
                      }}
                    />
                    <div
                      style={{
                        height: '100%',
                        width: `${driftPct}%`,
                        backgroundColor: item.driftScore < 50 ? DANGER : GOLD,
                        borderRadius: '0 4px 4px 0',
                        transition: 'width 0.6s ease-out',
                      }}
                    />
                  </div>
                </div>

                {/* Activities */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* In-Seat */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <CheckCircle2 size={11} style={{ color: SAGE }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: SAGE, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        In-Seat ({inSeat.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {inSeat.map((a, j) => (
                        <div
                          key={j}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 11,
                            padding: '4px 8px',
                            borderRadius: 6,
                            backgroundColor: 'rgba(107,143,113,0.08)',
                            color: '#a09888',
                          }}
                        >
                          <span>{a.label}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: SAGE, fontFamily: 'monospace' }}>
                            {a.hoursPerWeek}h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Out-of-Seat */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <AlertTriangle size={11} style={{ color: GOLD }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Out-of-Seat ({outSeat.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {outSeat.length === 0 ? (
                        <div
                          style={{
                            fontSize: 11,
                            padding: '4px 8px',
                            borderRadius: 6,
                            backgroundColor: 'rgba(107,143,113,0.06)',
                            color: '#6b6358',
                            fontStyle: 'italic',
                          }}
                        >
                          None detected
                        </div>
                      ) : (
                        outSeat.map((a, j) => (
                          <div
                            key={j}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: 11,
                              padding: '4px 8px',
                              borderRadius: 6,
                              backgroundColor: 'rgba(232,180,76,0.08)',
                              color: '#a09888',
                            }}
                          >
                            <span>{a.label}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: GOLD, fontFamily: 'monospace' }}>
                              {a.hoursPerWeek}h
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded: Activity Bar Chart + Recommendation */}
                {isExpanded && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1e2638' }}>
                    {/* Activity hours chart */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                        Weekly Hours Breakdown
                      </div>
                      <ActivityBarChart activities={item.activities} />
                    </div>

                    {/* Recommendation card */}
                    {item.recommendation && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '12px 14px',
                          borderRadius: 10,
                          backgroundColor: `rgba(232,180,76,0.06)`,
                          border: `1px solid rgba(232,180,76,0.2)`,
                        }}
                      >
                        <Lightbulb size={14} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                            Recommendation
                          </div>
                          <p style={{ fontSize: 12, color: '#d8cfc4', margin: 0, lineHeight: 1.6 }}>
                            {item.recommendation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Warning Banner */}
                {isWarning && !isExpanded && (
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      backgroundColor: 'rgba(224,96,96,0.08)',
                      border: '1px solid rgba(224,96,96,0.2)',
                    }}
                  >
                    <AlertTriangle size={12} style={{ color: DANGER }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: DANGER }}>
                      Significant role drift detected. Consider role clarity conversation.
                    </span>
                  </div>
                )}

                {/* Expand toggle */}
                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid #1e2638',
                      backgroundColor: 'transparent',
                      color: '#6b6358',
                      fontFamily: 'inherit',
                      transition: 'color 0.2s',
                    }}
                  >
                    {isExpanded ? 'Show Less' : 'Details'}
                    <ChevronRight
                      size={10}
                      style={{
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* -- Recommendations Summary -- */}
      {enrichedData.filter((d) => d.recommendation).length > 0 && (
        <div
          className="animate-fade-in glow-card"
          style={{
            backgroundColor: '#131720',
            border: '1px solid #1e2638',
            borderRadius: 16,
            padding: 24,
            marginTop: 24,
            animationDelay: '0.4s',
            opacity: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Lightbulb size={16} style={{ color: GOLD }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>Action Recommendations</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 20,
                color: GOLD,
                backgroundColor: 'rgba(232,180,76,0.15)',
              }}
            >
              {enrichedData.filter((d) => d.recommendation).length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enrichedData
              .filter((d) => d.recommendation)
              .sort((a, b) => a.driftScore - b.driftScore)
              .map((item, i) => (
                <div
                  key={item.id}
                  className="animate-fade-in"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '12px 16px',
                    borderRadius: 10,
                    backgroundColor: `${scoreColor(item.driftScore)}08`,
                    border: `1px solid ${scoreColor(item.driftScore)}20`,
                    animationDelay: `${0.42 + i * 0.04}s`,
                    opacity: 0,
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 700,
                      color: '#0b0d14',
                      background: avatarGradient(item.member!.color),
                      flexShrink: 0,
                    }}
                  >
                    {item.member!.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#f0ebe4' }}>{item.member!.name}</span>
                      <DriftBadge score={item.driftScore} />
                    </div>
                    <p style={{ fontSize: 12, color: '#a09888', margin: 0, lineHeight: 1.5 }}>
                      {item.recommendation}
                    </p>
                  </div>
                  <ArrowRight size={14} style={{ color: '#2e3a4e', flexShrink: 0, marginTop: 4 }} />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
