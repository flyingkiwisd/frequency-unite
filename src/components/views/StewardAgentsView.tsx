'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield,
  Brain,
  Zap,
  BookOpen,
  Flame,
  Network,
  Map,
  Leaf,
  Search,
  Megaphone,
  UserPlus,
  Users,
  HeartPulse,
  GraduationCap,
  Palette,
  Compass,
  FileText,
  Target,
  Route,
  Lock,
  ListChecks,
  Wallet,
  PiggyBank,
  Scale,
  Wrench,
  ClipboardList,
  Landmark,
  CheckSquare,
  MessageCircle,
  Radar,
  BarChart3,
  Lightbulb,
  Dna,
  X,
  Send,
  ChevronRight,
  ChevronDown,
  Activity,
  Clock,
  Sparkles,
  Bot,
  Eye,
  TrendingUp,
  CircleDot,
  ArrowUpRight,
} from 'lucide-react';

/* ===============================================================================
   Scoped Keyframes
   =============================================================================== */

const agentsKeyframes = `
@keyframes sa-fadeSlideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes sa-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes sa-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.05); }
}
@keyframes sa-breathe {
  0%, 100% { box-shadow: 0 0 12px rgba(212,165,116,0.08); }
  50%      { box-shadow: 0 0 28px rgba(212,165,116,0.2); }
}
@keyframes sa-orbit {
  0%   { transform: rotate(0deg) translateX(6px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(6px) rotate(-360deg); }
}
@keyframes sa-slidePanel {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes sa-ringPulse {
  0%   { transform: scale(0.8); opacity: 0.8; }
  50%  { transform: scale(1.2); opacity: 0.3; }
  100% { transform: scale(0.8); opacity: 0.8; }
}
@keyframes sa-glow {
  0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
  50%      { filter: drop-shadow(0 0 10px currentColor); }
}
@keyframes sa-typewrite {
  from { width: 0; }
  to   { width: 100%; }
}
@keyframes sa-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}
@keyframes sa-progressFill {
  from { width: 0%; }
}
@keyframes sa-countUp {
  0%   { opacity: 0; transform: translateY(8px) scale(0.9); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
`;

const KEYFRAMES_ID = 'steward-agents-keyframes';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = agentsKeyframes;
  document.head.appendChild(style);
}

/* ===============================================================================
   Types
   =============================================================================== */

type HemisphereKey = 'all' | 'being' | 'doing' | 'stewardship' | 'strategy' | 'operations' | 'governance' | 'intelligence';
type AgentStatus = 'active' | 'building' | 'planned';

interface AgentActivityEntry {
  timestamp: string;
  action: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  hemisphere: Exclude<HemisphereKey, 'all'>;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  colorHex: string;
  status: AgentStatus;
  capabilities: string[];
  dataSources: string[];
  owner: string;
  uptime: number;
  dataScore: number;
  recentActions: AgentActivityEntry[];
}

/* ===============================================================================
   Agent Data (33 Agents)
   =============================================================================== */

const AGENTS: Agent[] = [
  // ─── Being Hemisphere ───
  {
    id: 'coherence-guardian',
    name: 'Coherence Guardian',
    description: 'Monitors community coherence and alignment across all steward activities, flagging drift early.',
    hemisphere: 'being',
    icon: Shield,
    color: 'text-violet-400',
    colorHex: '#a78bfa',
    status: 'active',
    capabilities: ['Alignment scoring', 'Drift detection', 'Coherence mapping', 'Tension sensing'],
    dataSources: ['Meeting notes', 'Pulse surveys', 'OKR data'],
    owner: 'james',
    uptime: 99.2,
    dataScore: 94,
    recentActions: [
      { timestamp: '2h ago', action: 'Flagged alignment drift in Pod 3 check-in' },
      { timestamp: '6h ago', action: 'Generated weekly coherence report' },
      { timestamp: '1d ago', action: 'Updated community resonance map' },
    ],
  },
  {
    id: 'wisdom-keeper',
    name: 'Wisdom Keeper',
    description: 'Preserves institutional memory and surfaces historical patterns to inform current decisions.',
    hemisphere: 'being',
    icon: BookOpen,
    color: 'text-violet-400',
    colorHex: '#a78bfa',
    status: 'active',
    capabilities: ['Pattern recognition', 'Institutional memory', 'Decision genealogy', 'Insight synthesis'],
    dataSources: ['Decision log', 'Meeting archives', 'Knowledge base', 'Governance records'],
    owner: 'sian',
    uptime: 98.7,
    dataScore: 91,
    recentActions: [
      { timestamp: '3h ago', action: 'Surfaced relevant 2024 precedent for treasury proposal' },
      { timestamp: '1d ago', action: 'Indexed 14 new governance decisions' },
      { timestamp: '2d ago', action: 'Connected pattern across Q1 and Q3 strategies' },
    ],
  },
  {
    id: 'energy-pulse',
    name: 'Energy Pulse',
    description: 'Tracks personal and collective energy levels to optimize team rhythm and prevent burnout.',
    hemisphere: 'being',
    icon: Zap,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    status: 'active',
    capabilities: ['Energy tracking', 'Burnout prediction', 'Rhythm optimization', 'Wellbeing scoring'],
    dataSources: ['Check-in data', 'Calendar patterns', 'Pulse surveys'],
    owner: 'felicia',
    uptime: 97.5,
    dataScore: 88,
    recentActions: [
      { timestamp: '1h ago', action: 'Detected low-energy pattern in operations team' },
      { timestamp: '8h ago', action: 'Recommended schedule adjustment for James' },
      { timestamp: '1d ago', action: 'Published weekly energy heatmap' },
    ],
  },
  {
    id: 'soul-mirror',
    name: 'Soul Mirror',
    description: 'Powers reflective journaling intelligence, providing prompts and insights for inner development.',
    hemisphere: 'being',
    icon: Eye,
    color: 'text-violet-400',
    colorHex: '#a78bfa',
    status: 'building',
    capabilities: ['Reflective prompts', 'Growth pattern analysis', 'Shadow work support', 'Inner alignment tracking'],
    dataSources: ['Journal entries', 'Personal OKRs', 'Coach feedback'],
    owner: 'nipun',
    uptime: 72.3,
    dataScore: 65,
    recentActions: [
      { timestamp: '4h ago', action: 'Generated morning reflection prompt for 8 stewards' },
      { timestamp: '1d ago', action: 'Analyzed monthly growth trajectory for Sian' },
    ],
  },
  {
    id: 'ritual-architect',
    name: 'Ritual Architect',
    description: 'Designs and facilitates community practices, ceremonies, and shared rituals that build culture.',
    hemisphere: 'being',
    icon: Flame,
    color: 'text-rose-400',
    colorHex: '#fb7185',
    status: 'planned',
    capabilities: ['Ritual design', 'Ceremony facilitation', 'Seasonal planning', 'Practice tracking'],
    dataSources: ['Calendar', 'Culture surveys', 'Attendance data'],
    owner: 'mafe',
    uptime: 0,
    dataScore: 30,
    recentActions: [
      { timestamp: '3d ago', action: 'Drafted Q2 ceremony calendar proposal' },
    ],
  },

  // ─── Doing Hemisphere ───
  {
    id: 'node-orchestrator',
    name: 'Node Orchestrator',
    description: 'Coordinates health, activity, and communication across all community nodes in real-time.',
    hemisphere: 'doing',
    icon: Network,
    color: 'text-sky-400',
    colorHex: '#38bdf8',
    status: 'active',
    capabilities: ['Node health monitoring', 'Cross-node sync', 'Resource allocation', 'Bottleneck detection', 'Dependency mapping'],
    dataSources: ['Node dashboards', 'Activity logs', 'Integration APIs', 'Health checks'],
    owner: 'james',
    uptime: 99.8,
    dataScore: 96,
    recentActions: [
      { timestamp: '30m ago', action: 'Synced node health scores across 7 active nodes' },
      { timestamp: '2h ago', action: 'Resolved API latency issue with Lubbock node' },
      { timestamp: '6h ago', action: 'Generated cross-node dependency report' },
    ],
  },
  {
    id: 'map-intelligence',
    name: 'Map Intelligence',
    description: 'Builds ecosystem maps and provides deal intelligence for strategic partnership navigation.',
    hemisphere: 'doing',
    icon: Map,
    color: 'text-emerald-400',
    colorHex: '#34d399',
    status: 'active',
    capabilities: ['Ecosystem mapping', 'Deal scoring', 'Relationship graphing', 'Opportunity identification'],
    dataSources: ['CRM data', 'Public filings', 'News feeds', 'Network graph'],
    owner: 'fairman',
    uptime: 96.1,
    dataScore: 89,
    recentActions: [
      { timestamp: '1h ago', action: 'Updated ecosystem map with 3 new organizations' },
      { timestamp: '5h ago', action: 'Scored incoming deal from Patagonia Foundation' },
      { timestamp: '1d ago', action: 'Identified warm intro path to Threshold Foundation' },
    ],
  },
  {
    id: 'bioregion-sentinel',
    name: 'Bioregion Sentinel',
    description: 'Monitors bioregional data, ecological conditions, and community impact indicators.',
    hemisphere: 'doing',
    icon: Leaf,
    color: 'text-green-400',
    colorHex: '#4ade80',
    status: 'building',
    capabilities: ['Bioregional monitoring', 'Ecological reporting', 'Community impact tracking', 'Environmental alerts'],
    dataSources: ['Sensor data', 'Public environmental APIs', 'Community reports'],
    owner: 'andrew',
    uptime: 68.4,
    dataScore: 72,
    recentActions: [
      { timestamp: '3h ago', action: 'Ingested water quality data for central Texas region' },
      { timestamp: '1d ago', action: 'Generated bioregional health snapshot' },
    ],
  },
  {
    id: 'capital-scout',
    name: 'Capital Scout',
    description: 'Evaluates deal flow, scores opportunities, and manages the investment pipeline intelligence.',
    hemisphere: 'doing',
    icon: Search,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    status: 'active',
    capabilities: ['Deal scoring', 'Pipeline management', 'Due diligence support', 'Return modeling'],
    dataSources: ['Deal database', 'Market data', 'Financial models', 'Advisor notes'],
    owner: 'max',
    uptime: 95.8,
    dataScore: 92,
    recentActions: [
      { timestamp: '2h ago', action: 'Scored 2 new incoming deals (avg: 7.4/10)' },
      { timestamp: '8h ago', action: 'Updated pipeline summary for weekly review' },
      { timestamp: '1d ago', action: 'Flagged due diligence gap in RegenFarms deal' },
    ],
  },
  {
    id: 'megaphone-engine',
    name: 'Megaphone Engine',
    description: 'Manages narrative strategy, content creation pipelines, and distribution across channels.',
    hemisphere: 'doing',
    icon: Megaphone,
    color: 'text-orange-400',
    colorHex: '#fb923c',
    status: 'building',
    capabilities: ['Content strategy', 'Distribution planning', 'Narrative tracking', 'Channel optimization'],
    dataSources: ['Content calendar', 'Analytics', 'Social media APIs'],
    owner: 'colleen',
    uptime: 74.2,
    dataScore: 70,
    recentActions: [
      { timestamp: '4h ago', action: 'Drafted social content for node launch announcement' },
      { timestamp: '1d ago', action: 'Analyzed engagement metrics across channels' },
    ],
  },

  // ─── Stewardship & Growth ───
  {
    id: 'enrollment-catalyst',
    name: 'Enrollment Catalyst',
    description: 'Manages the membership pipeline, tracks conversion metrics, and optimizes the enrollment journey.',
    hemisphere: 'stewardship',
    icon: UserPlus,
    color: 'text-emerald-400',
    colorHex: '#34d399',
    status: 'active',
    capabilities: ['Pipeline tracking', 'Conversion optimization', 'Journey mapping', 'Lead scoring', 'Follow-up automation'],
    dataSources: ['CRM pipeline', 'Website analytics', 'Application forms', 'Referral data'],
    owner: 'dave',
    uptime: 97.1,
    dataScore: 93,
    recentActions: [
      { timestamp: '1h ago', action: 'Moved 3 prospects to interview stage' },
      { timestamp: '4h ago', action: 'Generated weekly enrollment funnel report' },
      { timestamp: '1d ago', action: 'Identified 2 warm leads from Austin event' },
    ],
  },
  {
    id: 'pod-facilitator',
    name: 'Pod Facilitator',
    description: 'Supports pod health, facilitates check-ins, and provides tools for pod-level decision making.',
    hemisphere: 'stewardship',
    icon: Users,
    color: 'text-sky-400',
    colorHex: '#38bdf8',
    status: 'active',
    capabilities: ['Pod health scoring', 'Check-in facilitation', 'Conflict detection', 'Meeting optimization'],
    dataSources: ['Pod check-ins', 'Attendance data', 'Feedback forms'],
    owner: 'sian',
    uptime: 96.8,
    dataScore: 87,
    recentActions: [
      { timestamp: '2h ago', action: 'Compiled Pod Alpha health report (score: 8.2)' },
      { timestamp: '6h ago', action: 'Generated check-in prompts for Thursday pods' },
      { timestamp: '1d ago', action: 'Flagged low attendance trend in Pod Gamma' },
    ],
  },
  {
    id: 'member-pulse',
    name: 'Member Pulse',
    description: 'Calculates member health scores, tracks engagement patterns, and predicts churn risk.',
    hemisphere: 'stewardship',
    icon: HeartPulse,
    color: 'text-rose-400',
    colorHex: '#fb7185',
    status: 'active',
    capabilities: ['Health scoring', 'Engagement tracking', 'Churn prediction', 'Sentiment analysis'],
    dataSources: ['Activity logs', 'Check-in responses', 'Event attendance', 'Communication data'],
    owner: 'felicia',
    uptime: 98.3,
    dataScore: 90,
    recentActions: [
      { timestamp: '45m ago', action: 'Updated health scores for all 47 active members' },
      { timestamp: '5h ago', action: 'Flagged 3 members at risk of disengagement' },
      { timestamp: '1d ago', action: 'Published monthly engagement trend analysis' },
    ],
  },
  {
    id: 'steward-coach',
    name: 'Steward Coach',
    description: 'Provides personalized development paths, growth recommendations, and coaching prompts.',
    hemisphere: 'stewardship',
    icon: GraduationCap,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    status: 'building',
    capabilities: ['Growth pathing', 'Skill assessment', 'Coaching prompts', 'Development tracking'],
    dataSources: ['Skill matrices', 'Feedback data', 'Learning records'],
    owner: 'nipun',
    uptime: 65.0,
    dataScore: 60,
    recentActions: [
      { timestamp: '6h ago', action: 'Generated growth path for 5 new stewards' },
      { timestamp: '2d ago', action: 'Updated competency framework v2' },
    ],
  },
  {
    id: 'culture-weaver',
    name: 'Culture Weaver',
    description: 'Monitors culture health, surfaces integration practices, and nurtures community values.',
    hemisphere: 'stewardship',
    icon: Palette,
    color: 'text-violet-400',
    colorHex: '#a78bfa',
    status: 'planned',
    capabilities: ['Culture health index', 'Values alignment', 'Integration practices', 'Ritual suggestions'],
    dataSources: ['Culture surveys', 'Behavioral data', 'Community feedback'],
    owner: 'mafe',
    uptime: 0,
    dataScore: 25,
    recentActions: [
      { timestamp: '5d ago', action: 'Completed culture health survey design' },
    ],
  },

  // ─── Strategy & Vision ───
  {
    id: 'north-star-navigator',
    name: 'North Star Navigator',
    description: 'Tracks vision alignment and progress toward the 144-well target, ensuring strategic coherence.',
    hemisphere: 'strategy',
    icon: Compass,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    status: 'active',
    capabilities: ['Vision tracking', '144 target monitoring', 'Strategic alignment', 'Milestone forecasting'],
    dataSources: ['OKR system', 'Node data', 'Strategic plans', 'Board docs'],
    owner: 'james',
    uptime: 99.0,
    dataScore: 95,
    recentActions: [
      { timestamp: '1h ago', action: 'Updated 144-well progress dashboard (12/144)' },
      { timestamp: '4h ago', action: 'Assessed strategic alignment of new partnership' },
      { timestamp: '1d ago', action: 'Generated quarterly vision alignment report' },
    ],
  },
  {
    id: 'thesis-synthesizer',
    name: 'Thesis Synthesizer',
    description: 'Monitors the Thesis of Change, tracks hypothesis validation, and surfaces strategic insights.',
    hemisphere: 'strategy',
    icon: FileText,
    color: 'text-violet-400',
    colorHex: '#a78bfa',
    status: 'active',
    capabilities: ['Thesis monitoring', 'Hypothesis tracking', 'Evidence synthesis', 'Strategic insight generation'],
    dataSources: ['Research data', 'Impact metrics', 'Academic sources', 'Field reports'],
    owner: 'fairman',
    uptime: 94.5,
    dataScore: 86,
    recentActions: [
      { timestamp: '3h ago', action: 'Validated hypothesis #7: community-led conservation' },
      { timestamp: '1d ago', action: 'Synthesized 12 new evidence points for thesis v3' },
      { timestamp: '2d ago', action: 'Connected field findings to macro strategy' },
    ],
  },
  {
    id: 'okr-engine',
    name: 'OKR Engine',
    description: 'Tracks objectives and key results across all teams, providing real-time progress and alerts.',
    hemisphere: 'strategy',
    icon: Target,
    color: 'text-emerald-400',
    colorHex: '#34d399',
    status: 'active',
    capabilities: ['OKR tracking', 'Progress alerts', 'Cross-team alignment', 'Scoring automation'],
    dataSources: ['OKR database', 'Task system', 'Weekly reports'],
    owner: 'greg',
    uptime: 98.9,
    dataScore: 94,
    recentActions: [
      { timestamp: '30m ago', action: 'Updated Q1 OKR scores (avg: 0.72)' },
      { timestamp: '3h ago', action: 'Sent alert: KR-4 at risk of missing target' },
      { timestamp: '1d ago', action: 'Generated OKR health dashboard for board' },
    ],
  },
  {
    id: 'roadmap-pilot',
    name: 'Roadmap Pilot',
    description: 'Manages strategic phase transitions, tracks milestones, and coordinates cross-team deliverables.',
    hemisphere: 'strategy',
    icon: Route,
    color: 'text-sky-400',
    colorHex: '#38bdf8',
    status: 'building',
    capabilities: ['Phase management', 'Milestone tracking', 'Dependency mapping', 'Timeline forecasting'],
    dataSources: ['Roadmap system', 'Task data', 'Team calendars'],
    owner: 'gareth',
    uptime: 78.5,
    dataScore: 75,
    recentActions: [
      { timestamp: '2h ago', action: 'Updated Phase 2 timeline with new dependencies' },
      { timestamp: '1d ago', action: 'Flagged milestone delay risk for node expansion' },
    ],
  },
  {
    id: 'priority-lock',
    name: 'Priority Lock',
    description: 'Manages weekly priority setting, tracks accountability, and prevents scope creep.',
    hemisphere: 'strategy',
    icon: Lock,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    status: 'active',
    capabilities: ['Priority management', 'Scope protection', 'Accountability tracking', 'Weekly cadence'],
    dataSources: ['Priority board', 'Meeting notes', 'Calendar data'],
    owner: 'james',
    uptime: 97.2,
    dataScore: 91,
    recentActions: [
      { timestamp: '1h ago', action: 'Locked Week 11 priorities for core team' },
      { timestamp: '5h ago', action: 'Flagged scope creep risk on 2 active projects' },
      { timestamp: '1d ago', action: 'Published weekly accountability scorecard' },
    ],
  },

  // ─── Operations & Finance ───
  {
    id: 'task-commander',
    name: 'Task Commander',
    description: 'Manages task execution, 90-day plans, and ensures consistent delivery across all workstreams.',
    hemisphere: 'operations',
    icon: ListChecks,
    color: 'text-sky-400',
    colorHex: '#38bdf8',
    status: 'active',
    capabilities: ['Task management', '90-day planning', 'Workstream coordination', 'Velocity tracking', 'Blocker detection'],
    dataSources: ['Task database', 'Sprint boards', 'Calendar', 'Slack activity'],
    owner: 'greg',
    uptime: 99.1,
    dataScore: 95,
    recentActions: [
      { timestamp: '20m ago', action: 'Updated 90-day plan: 67% complete (on track)' },
      { timestamp: '2h ago', action: 'Flagged 4 blocked tasks across 2 workstreams' },
      { timestamp: '6h ago', action: 'Generated velocity report for sprint 8' },
    ],
  },
  {
    id: 'cash-sentinel',
    name: 'Cash Sentinel',
    description: 'Monitors cash flow, runway calculations, and financial health indicators in real-time.',
    hemisphere: 'operations',
    icon: Wallet,
    color: 'text-emerald-400',
    colorHex: '#34d399',
    status: 'active',
    capabilities: ['Cash flow monitoring', 'Runway calculation', 'Burn rate tracking', 'Forecast modeling'],
    dataSources: ['Banking API', 'Accounting system', 'Budget forecasts'],
    owner: 'sarah',
    uptime: 99.5,
    dataScore: 97,
    recentActions: [
      { timestamp: '1h ago', action: 'Updated real-time runway: 14.2 months' },
      { timestamp: '4h ago', action: 'Flagged unexpected expense in operations budget' },
      { timestamp: '1d ago', action: 'Generated monthly cash flow projection' },
    ],
  },
  {
    id: 'budget-guardian',
    name: 'Budget Guardian',
    description: 'Tracks budget adherence, spending patterns, and provides variance alerts across categories.',
    hemisphere: 'operations',
    icon: PiggyBank,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    status: 'active',
    capabilities: ['Budget tracking', 'Variance analysis', 'Spending alerts', 'Category management'],
    dataSources: ['Accounting system', 'Expense reports', 'Budget plans'],
    owner: 'sarah',
    uptime: 98.0,
    dataScore: 93,
    recentActions: [
      { timestamp: '2h ago', action: 'Budget variance alert: Travel at 112% of plan' },
      { timestamp: '8h ago', action: 'Updated Q1 budget vs. actuals dashboard' },
      { timestamp: '1d ago', action: 'Forecasted Q2 budget needs based on pipeline' },
    ],
  },
  {
    id: 'daf-compliance',
    name: 'DAF Compliance',
    description: 'Ensures donor-advised fund compliance, tracks regulatory requirements, and manages audits.',
    hemisphere: 'operations',
    icon: Scale,
    color: 'text-rose-400',
    colorHex: '#fb7185',
    status: 'building',
    capabilities: ['Compliance tracking', 'Regulatory alerts', 'Audit preparation', 'Documentation management'],
    dataSources: ['Legal docs', 'Regulatory feeds', 'DAF records'],
    owner: 'max',
    uptime: 82.0,
    dataScore: 78,
    recentActions: [
      { timestamp: '5h ago', action: 'Updated compliance checklist for Q1 audit' },
      { timestamp: '2d ago', action: 'Flagged new IRS guidance impacting DAF structure' },
    ],
  },
  {
    id: 'systems-stabilizer',
    name: 'Systems Stabilizer',
    description: 'Manages operational SOPs, process documentation, and ensures consistent system performance.',
    hemisphere: 'operations',
    icon: Wrench,
    color: 'text-slate-400',
    colorHex: '#94a3b8',
    status: 'planned',
    capabilities: ['SOP management', 'Process documentation', 'System monitoring', 'Improvement tracking'],
    dataSources: ['SOP library', 'System logs', 'Incident reports'],
    owner: 'gareth',
    uptime: 0,
    dataScore: 35,
    recentActions: [
      { timestamp: '4d ago', action: 'Catalogued 23 existing operational procedures' },
    ],
  },

  // ─── Governance & Decisions ───
  {
    id: 'decision-logger',
    name: 'Decision Logger',
    description: 'Captures decisions with full context, rationale, and dissent, building institutional memory.',
    hemisphere: 'governance',
    icon: ClipboardList,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    status: 'active',
    capabilities: ['Decision capture', 'Context logging', 'Dissent recording', 'Decision search', 'Pattern analysis'],
    dataSources: ['Meeting records', 'Governance logs', 'Slack threads', 'Email archives'],
    owner: 'sian',
    uptime: 97.8,
    dataScore: 89,
    recentActions: [
      { timestamp: '1h ago', action: 'Logged 3 decisions from Tuesday strategy call' },
      { timestamp: '6h ago', action: 'Tagged decision #127 with relevant precedents' },
      { timestamp: '1d ago', action: 'Generated decision patterns report for board' },
    ],
  },
  {
    id: 'governance-tracker',
    name: 'Governance Tracker',
    description: 'Monitors teal governance evolution, tracks organizational maturity, and suggests improvements.',
    hemisphere: 'governance',
    icon: Landmark,
    color: 'text-violet-400',
    colorHex: '#a78bfa',
    status: 'building',
    capabilities: ['Governance monitoring', 'Maturity assessment', 'Evolution tracking', 'Best practice surfacing'],
    dataSources: ['Governance framework', 'Decision log', 'Organizational assessments'],
    owner: 'raamayan',
    uptime: 70.5,
    dataScore: 66,
    recentActions: [
      { timestamp: '4h ago', action: 'Assessed consent-based decision adoption: 68%' },
      { timestamp: '2d ago', action: 'Identified 3 governance improvement opportunities' },
    ],
  },
  {
    id: 'accountability-agent',
    name: 'Accountability Agent',
    description: 'Tracks team commitments, follow-through rates, and provides gentle accountability nudges.',
    hemisphere: 'governance',
    icon: CheckSquare,
    color: 'text-emerald-400',
    colorHex: '#34d399',
    status: 'active',
    capabilities: ['Commitment tracking', 'Follow-through scoring', 'Nudge automation', 'Accountability reports'],
    dataSources: ['Task system', 'Meeting commitments', 'Check-in responses'],
    owner: 'greg',
    uptime: 96.5,
    dataScore: 88,
    recentActions: [
      { timestamp: '30m ago', action: 'Sent 5 gentle accountability nudges for overdue items' },
      { timestamp: '3h ago', action: 'Updated team follow-through scorecard (avg: 84%)' },
      { timestamp: '1d ago', action: 'Generated weekly accountability digest' },
    ],
  },
  {
    id: 'communication-hub',
    name: 'Communication Hub',
    description: 'Orchestrates member communications, manages cadence, and ensures consistent messaging.',
    hemisphere: 'governance',
    icon: MessageCircle,
    color: 'text-sky-400',
    colorHex: '#38bdf8',
    status: 'building',
    capabilities: ['Communication cadence', 'Message orchestration', 'Channel management', 'Template library'],
    dataSources: ['Email system', 'Slack data', 'Communication calendar'],
    owner: 'colleen',
    uptime: 71.0,
    dataScore: 68,
    recentActions: [
      { timestamp: '2h ago', action: 'Scheduled weekly member digest for Thursday' },
      { timestamp: '1d ago', action: 'Audited communication channels for redundancy' },
    ],
  },

  // ─── Intelligence & Evolution ───
  {
    id: 'ecosystem-radar',
    name: 'Ecosystem Radar',
    description: 'Scans the external landscape for trends, opportunities, and threats relevant to the mission.',
    hemisphere: 'intelligence',
    icon: Radar,
    color: 'text-sky-400',
    colorHex: '#38bdf8',
    status: 'active',
    capabilities: ['Trend monitoring', 'Opportunity detection', 'Threat assessment', 'Landscape mapping'],
    dataSources: ['News APIs', 'Research databases', 'Industry reports', 'Social listening'],
    owner: 'andrew',
    uptime: 95.2,
    dataScore: 85,
    recentActions: [
      { timestamp: '1h ago', action: 'Detected emerging trend: regenerative credit markets' },
      { timestamp: '5h ago', action: 'Published weekly landscape scan digest' },
      { timestamp: '1d ago', action: 'Flagged competitive development from ReFi DAO' },
    ],
  },
  {
    id: 'impact-tracker',
    name: 'Impact Tracker',
    description: 'Measures and reports on community impact, tracking KPIs across environmental and social domains.',
    hemisphere: 'intelligence',
    icon: BarChart3,
    color: 'text-emerald-400',
    colorHex: '#34d399',
    status: 'active',
    capabilities: ['Impact measurement', 'KPI tracking', 'Report generation', 'Benchmark comparison'],
    dataSources: ['Impact database', 'Node metrics', 'Environmental data', 'Community surveys'],
    owner: 'dave',
    uptime: 94.8,
    dataScore: 82,
    recentActions: [
      { timestamp: '2h ago', action: 'Updated impact dashboard: 340 acres under stewardship' },
      { timestamp: '8h ago', action: 'Generated Q1 impact report for stakeholders' },
      { timestamp: '2d ago', action: 'Benchmarked impact KPIs against sector averages' },
    ],
  },
  {
    id: 'learning-engine',
    name: 'Learning Engine',
    description: 'Synthesizes knowledge from research, conversations, and field work into actionable learning.',
    hemisphere: 'intelligence',
    icon: Lightbulb,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    status: 'building',
    capabilities: ['Knowledge synthesis', 'Research analysis', 'Learning pathways', 'Insight extraction'],
    dataSources: ['Research papers', 'Book notes', 'Workshop recordings', 'Field notes'],
    owner: 'raamayan',
    uptime: 73.0,
    dataScore: 71,
    recentActions: [
      { timestamp: '3h ago', action: 'Synthesized key insights from regenerative finance paper' },
      { timestamp: '1d ago', action: 'Created learning pathway for new steward onboarding' },
    ],
  },
  {
    id: 'evolution-architect',
    name: 'Evolution Architect',
    description: 'Monitors organizational maturity, designs evolution paths, and catalyzes systemic growth.',
    hemisphere: 'intelligence',
    icon: Dna,
    color: 'text-violet-400',
    colorHex: '#a78bfa',
    status: 'planned',
    capabilities: ['Maturity modeling', 'Evolution design', 'Systemic analysis', 'Growth catalysis'],
    dataSources: ['Organizational assessments', 'Growth metrics', 'Research library'],
    owner: 'james',
    uptime: 0,
    dataScore: 40,
    recentActions: [
      { timestamp: '1w ago', action: 'Completed organizational maturity assessment v1' },
    ],
  },
];

/* ===============================================================================
   Hemisphere Metadata
   =============================================================================== */

const HEMISPHERES: Record<HemisphereKey, { label: string; description: string; colorHex: string; colorClass: string }> = {
  all: { label: 'All Agents', description: 'Complete steward intelligence network', colorHex: '#d4a574', colorClass: 'text-accent' },
  being: { label: 'Being', description: 'Soul & Inner Work', colorHex: '#a78bfa', colorClass: 'text-violet-400' },
  doing: { label: 'Doing', description: 'Action & Execution', colorHex: '#38bdf8', colorClass: 'text-sky-400' },
  stewardship: { label: 'Stewardship', description: 'Growth & Community', colorHex: '#34d399', colorClass: 'text-emerald-400' },
  strategy: { label: 'Strategy', description: 'Vision & Direction', colorHex: '#fbbf24', colorClass: 'text-amber-400' },
  operations: { label: 'Operations', description: 'Finance & Execution', colorHex: '#94a3b8', colorClass: 'text-slate-400' },
  governance: { label: 'Governance', description: 'Decisions & Accountability', colorHex: '#fb7185', colorClass: 'text-rose-400' },
  intelligence: { label: 'Intelligence', description: 'Learning & Evolution', colorHex: '#a78bfa', colorClass: 'text-violet-400' },
};

/* ===============================================================================
   Owner Data
   =============================================================================== */

const OWNERS: Record<string, { name: string; initials: string; role: string }> = {
  james: { name: 'James', initials: 'JH', role: 'Chief Steward' },
  sian: { name: 'Sian', initials: 'SH', role: 'Community Lead' },
  fairman: { name: 'Fairman', initials: 'FT', role: 'Ecosystem Lead' },
  max: { name: 'Max', initials: 'MR', role: 'Capital Lead' },
  dave: { name: 'Dave', initials: 'DM', role: 'Impact Lead' },
  andrew: { name: 'Andrew', initials: 'AS', role: 'Bioregion Lead' },
  felicia: { name: 'Felicia', initials: 'FC', role: 'Wellbeing Lead' },
  mafe: { name: 'Mafe', initials: 'MG', role: 'Culture Lead' },
  colleen: { name: 'Colleen', initials: 'CB', role: 'Communications Lead' },
  greg: { name: 'Greg', initials: 'GS', role: 'Operations Lead' },
  gareth: { name: 'Gareth', initials: 'GP', role: 'Systems Lead' },
  raamayan: { name: 'Raamayan', initials: 'RA', role: 'Governance Lead' },
  sarah: { name: 'Sarah', initials: 'SL', role: 'Finance Lead' },
  nipun: { name: 'Nipun', initials: 'NM', role: 'Growth Lead' },
};

/* ===============================================================================
   Helper Components
   =============================================================================== */

function StatusBadge({ status }: { status: AgentStatus }) {
  const config = {
    active: {
      bg: 'rgba(107,143,113,0.15)',
      border: 'rgba(107,143,113,0.3)',
      color: '#6b8f71',
      label: 'Active',
      dot: true,
    },
    building: {
      bg: 'rgba(232,180,76,0.15)',
      border: 'rgba(232,180,76,0.3)',
      color: '#e8b44c',
      label: 'Building',
      dot: true,
    },
    planned: {
      bg: 'rgba(107,99,88,0.15)',
      border: 'rgba(107,99,88,0.3)',
      color: '#6b6358',
      label: 'Planned',
      dot: false,
    },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}
    >
      {config.dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full${status === 'active' ? ' animate-pulse-glow' : ''}`}
          style={{
            background: config.color,
            animation: status === 'active' ? 'sa-pulse 2s ease-in-out infinite' : undefined,
          }}
        />
      )}
      {config.label}
    </span>
  );
}

function HealthBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full progress-bar-animated progress-bar-glow"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            animation: 'sa-progressFill 1s ease-out',
          }}
        />
      </div>
      <span className="text-xs font-mono" style={{ color, minWidth: '2.5rem', textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  );
}

/* ===============================================================================
   Agent Card Component
   =============================================================================== */

function AgentCard({
  agent,
  index,
  isSelected,
  onSelect,
}: {
  agent: Agent;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = agent.icon;

  return (
    <div
      className="glass glass-hover card-hover-lift card-interactive rounded-xl cursor-pointer relative group"
      style={{
        animationName: 'sa-fadeSlideUp',
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: `${index * 40}ms`,
        opacity: 0,
        borderColor: isSelected ? `${agent.colorHex}44` : undefined,
        boxShadow: isSelected ? `0 0 24px ${agent.colorHex}15, 0 0 0 1px ${agent.colorHex}30` : undefined,
      }}
      onClick={() => onSelect(agent.id)}
    >
      {/* ── Gradient top border ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${agent.colorHex}, transparent)`,
          opacity: isSelected ? 1 : 0.5,
          transition: 'opacity 0.3s',
        }}
      />

      {/* ── Glow ring on hover ── */}
      <div
        className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${agent.colorHex}18, transparent, ${agent.colorHex}08)`,
        }}
      />

      <div className="relative p-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{
                background: `${agent.colorHex}15`,
                border: `1px solid ${agent.colorHex}30`,
              }}
            >
              <Icon size={20} style={{ color: agent.colorHex }} />
              {agent.status === 'active' && (
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 animate-pulse-glow"
                  style={{
                    background: '#6b8f71',
                    borderColor: 'var(--color-surface)',
                    animation: 'sa-ringPulse 3s ease-in-out infinite',
                  }}
                />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {agent.name}
              </h3>
              <span
                className="text-xs"
                style={{ color: agent.colorHex, opacity: 0.8 }}
              >
                {HEMISPHERES[agent.hemisphere].label}
              </span>
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        {/* ── Description ── */}
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {agent.description}
        </p>

        {/* ── Capabilities ── */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{
                background: `${agent.colorHex}10`,
                color: `${agent.colorHex}cc`,
                border: `1px solid ${agent.colorHex}20`,
              }}
            >
              {cap}
            </span>
          ))}
        </div>

        {/* ── Metrics ── */}
        {agent.status !== 'planned' && (
          <div className="space-y-2 mb-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Uptime
                </span>
              </div>
              <HealthBar value={agent.uptime} color={agent.uptime > 90 ? '#6b8f71' : '#e8b44c'} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Data Score
                </span>
              </div>
              <HealthBar value={agent.dataScore} color={agent.colorHex} />
            </div>
          </div>
        )}

        {/* ── Recent Activity ── */}
        <div className="border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Activity size={10} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Recent Activity
            </span>
          </div>
          <div className="space-y-1.5">
            {agent.recentActions.slice(0, 2).map((action, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="text-[10px] flex-shrink-0 mt-0.5 font-mono"
                  style={{ color: 'var(--color-text-muted)', minWidth: '3rem' }}
                >
                  {action.timestamp}
                </span>
                <span className="text-[11px] leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                  {action.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================================
   Agent Detail Panel Component
   =============================================================================== */

function AgentDetailPanel({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'agent'; text: string }[]>([
    { role: 'agent', text: `Hello! I'm ${agent.name}. How can I help you today?` },
  ]);
  const Icon = agent.icon;
  const owner = OWNERS[agent.owner];

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', text: chatInput.trim() },
      {
        role: 'agent',
        text: `Processing your request about "${chatInput.trim().slice(0, 40)}...". This feature is coming soon. I'll be able to provide real-time intelligence and take actions on your behalf.`,
      },
    ]);
    setChatInput('');
  }, [chatInput]);

  return (
    <div
      className="glass rounded-xl overflow-hidden flex flex-col"
      style={{
        animation: 'sa-slidePanel 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        border: `1px solid ${agent.colorHex}25`,
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      {/* ── Gradient Header ── */}
      <div
        className="relative p-6"
        style={{
          background: `linear-gradient(135deg, ${agent.colorHex}12, transparent, ${agent.colorHex}06)`,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${agent.colorHex}, transparent)`,
          }}
        />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `${agent.colorHex}18`,
                border: `1px solid ${agent.colorHex}35`,
                animation: 'sa-breathe 4s ease-in-out infinite',
              }}
            >
              <Icon size={28} style={{ color: agent.colorHex }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {agent.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={agent.status} />
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: `${agent.colorHex}12`,
                    color: agent.colorHex,
                    border: `1px solid ${agent.colorHex}25`,
                  }}
                >
                  {HEMISPHERES[agent.hemisphere].label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto scrollbar-autohide p-6 pt-2 space-y-5">
        {/* Description */}
        <div>
          <h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Description
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {agent.description}
          </p>
        </div>

        {/* Metrics Row */}
        {agent.status !== 'planned' && (
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}
            >
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Uptime
              </div>
              <div className="text-xl font-bold font-mono" style={{ color: agent.uptime > 90 ? '#6b8f71' : '#e8b44c' }}>
                {agent.uptime}%
              </div>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}
            >
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Data Score
              </div>
              <div className="text-xl font-bold font-mono" style={{ color: agent.colorHex }}>
                {agent.dataScore}%
              </div>
            </div>
          </div>
        )}

        {/* Capabilities */}
        <div>
          <h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Capabilities
          </h4>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((cap) => (
              <span
                key={cap}
                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: `${agent.colorHex}12`,
                  color: `${agent.colorHex}dd`,
                  border: `1px solid ${agent.colorHex}25`,
                }}
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Data Sources
          </h4>
          <div className="space-y-1.5">
            {agent.dataSources.map((source) => (
              <div
                key={source}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}
              >
                <CircleDot size={12} style={{ color: agent.colorHex, opacity: 0.6 }} />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {source}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Owner */}
        {owner && (
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Owner
            </h4>
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: `${agent.colorHex}18`,
                  color: agent.colorHex,
                  border: `1px solid ${agent.colorHex}30`,
                }}
              >
                {owner.initials}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {owner.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {owner.role}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div>
          <h4 className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Activity Timeline
          </h4>
          <div className="relative pl-4">
            {/* Timeline line */}
            <div
              className="absolute left-[5px] top-1 bottom-1 w-px"
              style={{ background: `${agent.colorHex}25` }}
            />
            <div className="space-y-3">
              {agent.recentActions.map((action, i) => (
                <div key={i} className="relative flex items-start gap-3">
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-4 top-1 w-[10px] h-[10px] rounded-full border-2 flex-shrink-0"
                    style={{
                      background: i === 0 ? agent.colorHex : 'var(--color-surface)',
                      borderColor: agent.colorHex,
                      boxShadow: i === 0 ? `0 0 8px ${agent.colorHex}40` : undefined,
                    }}
                  />
                  <div className="ml-2">
                    <div className="text-[10px] font-mono mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {action.timestamp}
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {action.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div>
          <h4 className="text-xs uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
            <Bot size={12} />
            Talk to {agent.name}
          </h4>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${agent.colorHex}20`, background: 'rgba(0,0,0,0.15)' }}
          >
            {/* Chat messages */}
            <div className="p-3 space-y-3 max-h-48 overflow-y-auto scrollbar-autohide">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? {
                            background: `${agent.colorHex}18`,
                            color: 'var(--color-text-primary)',
                            border: `1px solid ${agent.colorHex}25`,
                          }
                        : {
                            background: 'rgba(255,255,255,0.04)',
                            color: 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)',
                          }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat input */}
            <div
              className="flex items-center gap-2 p-3"
              style={{ borderTop: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.1)' }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChat();
                }}
                placeholder={`Ask ${agent.name} anything...`}
                className="flex-1 bg-transparent border-none outline-none text-xs"
                style={{ color: 'var(--color-text-primary)' }}
              />
              <button
                onClick={handleSendChat}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  background: chatInput.trim() ? `${agent.colorHex}20` : 'transparent',
                  color: chatInput.trim() ? agent.colorHex : 'var(--color-text-muted)',
                }}
                disabled={!chatInput.trim()}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================================
   Main View Component
   =============================================================================== */

export function StewardAgentsView() {
  const [activeHemisphere, setActiveHemisphere] = useState<HemisphereKey>('all');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    injectKeyframes();
  }, []);

  /* ── Computed ── */

  const stats = useMemo(() => {
    const active = AGENTS.filter((a) => a.status === 'active').length;
    const building = AGENTS.filter((a) => a.status === 'building').length;
    const planned = AGENTS.filter((a) => a.status === 'planned').length;
    const activeAgents = AGENTS.filter((a) => a.status === 'active');
    const avgUptime = activeAgents.length > 0
      ? Math.round((activeAgents.reduce((s, a) => s + a.uptime, 0) / activeAgents.length) * 10) / 10
      : 0;
    const avgDataScore = activeAgents.length > 0
      ? Math.round(activeAgents.reduce((s, a) => s + a.dataScore, 0) / activeAgents.length)
      : 0;
    return { active, building, planned, total: AGENTS.length, avgUptime, avgDataScore };
  }, []);

  const filteredAgents = useMemo(() => {
    let result = AGENTS;
    if (activeHemisphere !== 'all') {
      result = result.filter((a) => a.hemisphere === activeHemisphere);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.capabilities.some((c) => c.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeHemisphere, searchQuery]);

  const selectedAgent = useMemo(
    () => (selectedAgentId ? AGENTS.find((a) => a.id === selectedAgentId) ?? null : null),
    [selectedAgentId]
  );

  const handleSelectAgent = useCallback((id: string) => {
    setSelectedAgentId((prev) => (prev === id ? null : id));
  }, []);

  /* ── Hemisphere tabs ── */

  const hemisphereKeys: HemisphereKey[] = ['all', 'being', 'doing', 'stewardship', 'strategy', 'operations', 'governance', 'intelligence'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════════
         Hero Header
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl glass noise-overlay dot-pattern" style={{ border: '1px solid var(--color-border)' }}>
        {/* Background glow effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(212,165,116,0.06) 0%, transparent 50%)',
          }}
        />
        {/* Animated shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(212,165,116,0.4), rgba(139,92,246,0.3), rgba(107,143,113,0.3), transparent)',
            backgroundSize: '200% 100%',
            animation: 'sa-shimmer 4s linear infinite',
          }}
        />

        <div className="relative px-8 py-10">
          <div className="flex items-start justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(212,165,116,0.15))',
                    border: '1px solid rgba(139,92,246,0.25)',
                    animation: 'sa-breathe 4s ease-in-out infinite',
                  }}
                >
                  <Bot size={24} className="text-violet-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient-gold text-glow">
                    33 Agents
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse-glow"
                      style={{ background: '#6b8f71', animation: 'sa-pulse 2s ease-in-out infinite' }}
                    />
                    <span className="text-xs font-medium" style={{ color: '#6b8f71' }}>
                      Network Online
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                The Steward Intelligence Network &mdash; 33 specialized AI agents working in concert across seven hemispheres
                to monitor, advise, and amplify every dimension of community stewardship. From inner coherence to ecosystem intelligence,
                each agent serves as a tireless partner in the work of regeneration.
              </p>
            </div>

            {/* Decorative orbital visualization */}
            <div className="hidden xl:block relative w-32 h-32 flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: 'rgba(139,92,246,0.1)' }}
              />
              <div
                className="absolute inset-3 rounded-full border"
                style={{ borderColor: 'rgba(212,165,116,0.1)' }}
              />
              <div
                className="absolute inset-6 rounded-full border"
                style={{ borderColor: 'rgba(107,143,113,0.1)' }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-2xl font-bold font-mono text-gradient-gold">
                  33
                </span>
              </div>
              {/* Orbiting dots */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#a78bfa', '#fbbf24', '#34d399', '#38bdf8', '#fb7185'][i],
                    top: '50%',
                    left: '50%',
                    animation: `sa-orbit ${6 + i * 1.5}s linear infinite`,
                    animationDelay: `${i * -1.2}s`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         Stats Bar
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Agents', value: stats.total.toString(), color: '#d4a574', icon: Bot },
          { label: 'Active', value: stats.active.toString(), color: '#6b8f71', icon: Sparkles },
          { label: 'Building', value: stats.building.toString(), color: '#e8b44c', icon: Wrench },
          { label: 'Planned', value: stats.planned.toString(), color: '#6b6358', icon: Clock },
          { label: 'Avg Uptime', value: `${stats.avgUptime}%`, color: '#6b8f71', icon: TrendingUp },
          { label: 'Data Health', value: `${stats.avgDataScore}%`, color: '#a78bfa', icon: Activity },
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass glass-hover card-stat rounded-xl p-4 stagger-in"
              style={{ '--stagger-index': i } as React.CSSProperties}
            >
              <div className="flex items-center gap-2 mb-2">
                <StatIcon size={14} style={{ color: stat.color, opacity: 0.7 }} />
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {stat.label}
                </span>
              </div>
              <div
                className="text-2xl font-bold font-mono"
                style={{
                  color: stat.color,
                  animation: 'sa-countUp 0.6s ease-out forwards',
                  animationDelay: `${i * 80 + 200}ms`,
                  opacity: 0,
                }}
              >
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         Filter Bar: Hemisphere Tabs + Search
         ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="glass rounded-xl p-4"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Tabs */}
          <div className="flex-1 overflow-x-auto scrollbar-autohide">
            <div className="flex items-center gap-1.5 min-w-max">
              {hemisphereKeys.map((key) => {
                const hem = HEMISPHERES[key];
                const isActive = activeHemisphere === key;
                const count = key === 'all' ? AGENTS.length : AGENTS.filter((a) => a.hemisphere === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveHemisphere(key)}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2"
                    style={{
                      background: isActive ? `${hem.colorHex}18` : 'transparent',
                      color: isActive ? hem.colorHex : 'var(--color-text-muted)',
                      border: isActive ? `1px solid ${hem.colorHex}30` : '1px solid transparent',
                      boxShadow: isActive ? `0 0 12px ${hem.colorHex}10` : undefined,
                    }}
                  >
                    <span>{hem.label}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                      style={{
                        background: isActive ? `${hem.colorHex}15` : 'rgba(255,255,255,0.04)',
                        color: isActive ? hem.colorHex : 'var(--color-text-muted)',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-shrink-0 lg:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass pl-9 pr-4 py-2 text-xs w-full"
              style={{ minHeight: '36px' }}
            />
          </div>
        </div>

        {/* Active hemisphere description */}
        {activeHemisphere !== 'all' && (
          <div
            className="mt-3 pt-3 flex items-center gap-2"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: HEMISPHERES[activeHemisphere].colorHex }}
            />
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <span style={{ color: HEMISPHERES[activeHemisphere].colorHex, fontWeight: 600 }}>
                {HEMISPHERES[activeHemisphere].label}
              </span>
              {' '}&mdash; {HEMISPHERES[activeHemisphere].description}
            </span>
            <span className="text-xs font-mono ml-auto" style={{ color: 'var(--color-text-muted)' }}>
              {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         Agent Grid + Detail Panel
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex gap-6">
        {/* Agent Grid */}
        <div className={`flex-1 min-w-0 ${selectedAgent ? 'lg:max-w-[60%]' : ''}`}>
          {filteredAgents.length === 0 ? (
            <div
              className="glass rounded-xl p-12 text-center"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <Bot size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
              <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No agents match your search criteria.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveHemisphere('all'); }}
                className="mt-3 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                style={{
                  color: 'var(--color-accent)',
                  background: 'rgba(212,165,116,0.1)',
                  border: '1px solid rgba(212,165,116,0.2)',
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAgents.map((agent, i) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={i}
                  isSelected={selectedAgentId === agent.id}
                  onSelect={handleSelectAgent}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel (slides in on selection) */}
        {selectedAgent && (
          <div className="hidden lg:block w-[40%] flex-shrink-0 sticky top-6 self-start">
            <AgentDetailPanel
              agent={selectedAgent}
              onClose={() => setSelectedAgentId(null)}
            />
          </div>
        )}
      </div>

      {/* Mobile Detail Panel (overlays on small screens) */}
      {selectedAgent && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop"
            onClick={() => setSelectedAgentId(null)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md overflow-y-auto scrollbar-autohide bg-[var(--color-background)]">
            <AgentDetailPanel
              agent={selectedAgent}
              onClose={() => setSelectedAgentId(null)}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
         Hemisphere Summary Grid
         ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Hemisphere Overview
          </h2>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {hemisphereKeys.filter((k) => k !== 'all').map((key, i) => {
            const hem = HEMISPHERES[key];
            const hemAgents = AGENTS.filter((a) => a.hemisphere === key);
            const activeCount = hemAgents.filter((a) => a.status === 'active').length;
            const buildingCount = hemAgents.filter((a) => a.status === 'building').length;
            const avgUp = hemAgents.filter((a) => a.status === 'active').length > 0
              ? Math.round(hemAgents.filter((a) => a.status === 'active').reduce((s, a) => s + a.uptime, 0) / hemAgents.filter((a) => a.status === 'active').length)
              : 0;

            return (
              <button
                key={key}
                onClick={() => setActiveHemisphere(key)}
                className="glass glass-hover card-premium rounded-xl p-4 text-left transition-all stagger-in group"
                style={{
                  '--stagger-index': i,
                  border: activeHemisphere === key ? `1px solid ${hem.colorHex}35` : '1px solid var(--color-border)',
                  boxShadow: activeHemisphere === key ? `0 0 20px ${hem.colorHex}10` : undefined,
                } as React.CSSProperties}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${hem.colorHex}15`,
                      border: `1px solid ${hem.colorHex}25`,
                    }}
                  >
                    <span className="text-sm font-bold font-mono" style={{ color: hem.colorHex }}>
                      {hemAgents.length}
                    </span>
                  </div>
                  <ArrowUpRight
                    size={12}
                    className="opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ color: hem.colorHex }}
                  />
                </div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                  {hem.label}
                </div>
                <div className="text-[10px] mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  {hem.description}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(107,143,113,0.12)', color: '#6b8f71' }}
                  >
                    {activeCount} active
                  </span>
                  {buildingCount > 0 && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(232,180,76,0.12)', color: '#e8b44c' }}
                    >
                      {buildingCount} building
                    </span>
                  )}
                </div>
                {avgUp > 0 && (
                  <div className="mt-2">
                    <HealthBar value={avgUp} color={hem.colorHex} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
         Network Status Footer
         ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse-glow"
            style={{ background: '#6b8f71', animation: 'sa-pulse 2s ease-in-out infinite' }}
          />
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Steward Intelligence Network
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            v1.0
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6b8f71' }} />
            {stats.active} Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#e8b44c' }} />
            {stats.building} Building
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6b6358' }} />
            {stats.planned} Planned
          </span>
          <span className="h-3 w-px" style={{ background: 'var(--color-border)' }} />
          <span className="font-mono">
            Last sync: just now
          </span>
        </div>
      </div>
    </div>
  );
}
