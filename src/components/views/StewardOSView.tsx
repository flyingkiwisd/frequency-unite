'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  ChevronDown,
  Clock,
  Target,
  AlertCircle,
  Shield,
  Briefcase,
  CheckSquare,
  BarChart3,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  Sun,
  Moon,
  Calendar,
  XCircle,
  Star,
  Flame,
  Brain,
  Sparkles,
  TrendingUp,
  Zap,
  Eye,
  Heart,
  RefreshCw,
  FileText,
  ArrowRight,
  Activity,
  Award,
  Layers,
  PenTool,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* ===============================================================================
   Types
   =============================================================================== */

type TabKey = 'overview' | 'os' | 'qualities' | 'risk' | 'journal' | 'agent';

interface Quality {
  name: string;
  score: number;
  description: string;
}

interface Risk {
  name: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

interface OperatingSystem {
  morningChecklist: string[];
  weeklyCommitments: string[];
  decisionFilters: string[];
  notInSeat: string[];
  eveningReflection: string[];
}

interface AgentInsight {
  type: 'strategic' | 'operational' | 'growth' | 'warning';
  title: string;
  description: string;
}

interface StewardOS {
  focusAreas: string[];
  os: OperatingSystem;
  qualities: Quality[];
  risks: Risk[];
  redLines: string[];
  agentInsights: AgentInsight[];
}

interface JournalData {
  morning: {
    regulationCheck: string;
    topPriorities: string;
    whatNotToDo: string;
  };
  evening: {
    wins: string;
    tensionDump: string;
    cleanupQueue: string;
  };
  weekly: {
    prioritiesReview: string;
    blockers: string;
  };
}

/* ===============================================================================
   Constants & Colors
   =============================================================================== */

const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const ROSE = '#f43e5e';
const SKY = '#60a5fa';
const WARNING = '#e8b44c';

const JOURNAL_STORAGE_KEY = 'frequency-steward-os-journal';

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Eye },
  { key: 'os', label: 'Operating System', icon: RefreshCw },
  { key: 'qualities', label: 'Qualities', icon: Star },
  { key: 'risk', label: 'Risk Framework', icon: AlertTriangle },
  { key: 'journal', label: 'Journal', icon: BookOpen },
  { key: 'agent', label: 'Agent Intel', icon: Brain },
];

const insightTypeConfig: Record<AgentInsight['type'], { color: string; bg: string; label: string }> = {
  strategic: { color: VIOLET, bg: 'rgba(139, 92, 246, 0.12)', label: 'Strategic' },
  operational: { color: AMBER, bg: 'rgba(212, 165, 116, 0.12)', label: 'Operational' },
  growth: { color: SAGE, bg: 'rgba(107, 143, 113, 0.12)', label: 'Growth' },
  warning: { color: ROSE, bg: 'rgba(244, 63, 94, 0.12)', label: 'Warning' },
};

const likelihoodConfig: Record<string, { color: string; bg: string }> = {
  low: { color: SAGE, bg: 'rgba(107, 143, 113, 0.15)' },
  medium: { color: AMBER, bg: 'rgba(212, 165, 116, 0.15)' },
  high: { color: ROSE, bg: 'rgba(244, 63, 94, 0.15)' },
};

/* ===============================================================================
   Avatar gradient helper
   =============================================================================== */

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

/* ===============================================================================
   SVG Progress Ring Component
   =============================================================================== */

function ProgressRing({
  score,
  maxScore = 5,
  size = 80,
  strokeWidth = 6,
  color = AMBER,
  label,
}: {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / maxScore;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const strokeDashoffset = circumference * (1 - animatedProgress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1c2230"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold" style={{ color }}>{score.toFixed(1)}</span>
        {label && <span className="text-[8px] text-text-muted uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
}

/* ===============================================================================
   Animated Counter Component
   =============================================================================== */

function AnimatedCounter({ value, suffix = '', color = AMBER, duration = 1200 }: {
  value: number;
  suffix?: string;
  color?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value * 10) / 10);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span className="text-2xl font-bold tabular-nums" style={{ color }}>
      {Number.isInteger(value) ? Math.round(displayValue) : displayValue.toFixed(1)}{suffix}
    </span>
  );
}

/* ===============================================================================
   Quick Action Card
   =============================================================================== */

function QuickActionCard({ icon: Icon, label, description, color, delay }: {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className="glow-card rounded-xl border p-4 animate-fade-in cursor-pointer group"
      style={{
        backgroundColor: '#131720',
        borderColor: '#1e2638',
        animationDelay: delay,
        opacity: 0,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="text-sm font-semibold text-text-primary mb-0.5">{label}</div>
      <div className="text-[11px] text-text-muted leading-relaxed">{description}</div>
    </div>
  );
}

/* ===============================================================================
   Mock Steward OS Data (5 core members)
   =============================================================================== */

const stewardOSData: Record<string, StewardOS> = {
  james: {
    focusAreas: [
      'Blue Spirit programming and capital alignment',
      'CEO candidate identification and outreach',
      'Family office DAF pipeline ($500K+ target)',
      'Amphibian Capital bridge — clean separation of time',
      'Culture coherence tone-setting across all touchpoints',
    ],
    os: {
      morningChecklist: [
        'Regulation check: am I leading from coherence or reaction?',
        'Review Frequency priorities vs. Amphibian demands',
        'Check capital pipeline — any LP follow-ups needed?',
        'Scan team Slack for anything needing founder voice',
        'One thing I can delegate today instead of doing myself',
      ],
      weeklyCommitments: [
        'Core team sync (30 min)',
        'Capital strategy session with Greg',
        'One member outreach call (new or retention)',
        'Board/governance check-in',
        'Personal coherence practice (minimum 2x/week)',
      ],
      decisionFilters: [
        'Does this move us toward 144 well-stewards?',
        'Am I the only one who can do this, or can it be delegated?',
        'Does this serve Frequency or my ego?',
        'Will this still matter in 6 months?',
        'Is this coherent with our thesis of change?',
      ],
      notInSeat: [
        'Day-to-day operations execution (that is Sian)',
        'Airtable, email campaigns, or admin tasks',
        'Node-level tactical decisions without leads',
        'Event logistics and vendor coordination',
        'Bookkeeping or financial record-keeping',
      ],
      eveningReflection: [
        'What moved the needle on the 144 vision today?',
        'Where did I lead from coherence vs. reactivity?',
        'What am I carrying that someone else should own?',
        'Did I protect Frequency time from Amphibian drift?',
      ],
    },
    qualities: [
      { name: 'Vision Clarity', score: 4, description: 'Strong north star vision; occasionally needs to translate it more concretely for the team' },
      { name: 'Delegation', score: 3, description: 'Improving but still tends to hold too many threads personally' },
      { name: 'Strategic Patience', score: 4, description: 'Good at playing the long game; Blue Spirit timing shows this' },
      { name: 'Culture Setting', score: 5, description: 'Sets the tone beautifully; coherence before action is lived, not just spoken' },
      { name: 'Fundraising', score: 3, description: 'Growing into this; family office relationships need more systematic cultivation' },
      { name: 'Presence & Regulation', score: 4, description: 'Increasingly embodied; models what he teaches about coherence' },
    ],
    risks: [
      { name: 'Key Person Dependency', likelihood: 'high', impact: 'high', mitigation: 'CEO hire post-Blue Spirit; document vision and decision frameworks; empower node leads' },
      { name: 'Amphibian Distraction', likelihood: 'medium', impact: 'high', mitigation: 'Clear time blocks for Frequency; weekly boundary audit; Sian as accountability partner' },
      { name: 'Scope Creep', likelihood: 'high', impact: 'medium', mitigation: 'Decision filters enforced weekly; "not in my seat" list reviewed; team empowered to push back' },
      { name: 'Burnout from Dual Roles', likelihood: 'medium', impact: 'high', mitigation: 'Hard limit on combined hours; personal practice non-negotiable; delegate more aggressively' },
    ],
    redLines: [
      'Will not compromise on coherence-first culture',
      'Will not pursue capital that misaligns with thesis',
      'Will not skip personal regulation practice',
      'Will not make unilateral decisions on governance',
    ],
    agentInsights: [
      { type: 'strategic', title: 'CEO Search Acceleration', description: 'Begin informal conversations now rather than waiting for post-Blue Spirit. Build a candidate shortlist of 3-5 by June to maintain momentum.' },
      { type: 'warning', title: 'Amphibian Time Bleed Risk', description: 'Current 5-15hr range is wide. Track actual hours for 2 weeks to establish a real baseline and create harder boundaries.' },
      { type: 'operational', title: 'Decision Framework Documentation', description: 'Your decision filters are gold but only in your head. Codify them in a shared doc so the team can apply them independently.' },
      { type: 'growth', title: 'Fundraising System Needed', description: 'Family office outreach needs a CRM and systematic follow-up cadence. Ad hoc relationship management will cap at ~$300K.' },
    ],
  },

  sian: {
    focusAreas: [
      'Blue Spirit registration launch and logistics',
      '12-month cash forecast completion',
      'Member retention survey design and execution',
      'Operations playbook documentation',
      'Team communication cadence optimization',
    ],
    os: {
      morningChecklist: [
        'Regulation check: sustainable pace or heroics?',
        'Review cash position and any pending payments',
        'Check member comms — any urgent responses needed?',
        'Blue Spirit logistics status check',
        'Prioritize top 3 tasks (not 10)',
      ],
      weeklyCommitments: [
        'Core team sync with James',
        'Operations review and task prioritization',
        'Member touchpoint (retention or onboarding)',
        'Event planning progress check',
        'Cash forecast update (even if brief)',
      ],
      decisionFilters: [
        'Can this wait until tomorrow without harm?',
        'Am I the right person, or should this go to Mafe?',
        'Does this serve member experience directly?',
        'Is this sustainable at 40hrs/week or am I drifting to 50+?',
        'What would break if I did not do this?',
      ],
      notInSeat: [
        'Strategic vision decisions (that is James/Fairman)',
        'Node-level work or deal evaluation',
        'Culture/coherence facilitation',
        'Fundraising or LP outreach',
        'Bookkeeping details (that is Nipun)',
      ],
      eveningReflection: [
        'Did I stay within sustainable hours today?',
        'What operational fire could have been prevented with a system?',
        'Where did I say yes when I should have said "not my seat"?',
        'One thing I am proud of executing today',
      ],
    },
    qualities: [
      { name: 'Operational Execution', score: 5, description: 'Exceptional at getting things done; the backbone of daily operations' },
      { name: 'Member Care', score: 5, description: 'Deeply attuned to member experience; naturally empathetic in communication' },
      { name: 'Boundary Setting', score: 2, description: 'Tendency to absorb everything; needs stronger "not my seat" practice' },
      { name: 'Systems Thinking', score: 3, description: 'Building systems but still relies on heroics; documentation improving' },
      { name: 'Cash Management', score: 4, description: 'Strong forecasting instincts; keeps the financial heartbeat visible' },
      { name: 'Delegation', score: 3, description: 'Getting better at handing things to Mafe; still holds too much' },
    ],
    risks: [
      { name: 'Burnout (Only Full-Timer)', likelihood: 'high', impact: 'high', mitigation: 'Hard cap at 40hr/week; weekly hours audit; Mafe takes more admin load; James monitors energy' },
      { name: 'Single Point of Failure', likelihood: 'high', impact: 'high', mitigation: 'Document all processes in ops playbook; cross-train Mafe on critical tasks; emergency coverage plan' },
      { name: 'Event Overload', likelihood: 'medium', impact: 'medium', mitigation: 'Event logistics checklist and timeline; delegate venue/vendor tasks; buffer days after events' },
      { name: 'Scope Absorption', likelihood: 'high', impact: 'medium', mitigation: 'Weekly "not in my seat" review; team accountability to redirect misrouted requests' },
    ],
    redLines: [
      'Will not sacrifice health for operations',
      'Will not shortcut member experience',
      'Will not make financial commitments without James approval',
    ],
    agentInsights: [
      { type: 'warning', title: 'Burnout Risk is Real and Present', description: 'At 40hr/week as the only full-timer, you are carrying structural risk. Push hard for the ops playbook so others can cover.' },
      { type: 'operational', title: 'Automate Member Communications', description: 'Set up automated email sequences for onboarding, check-ins, and renewals. This could save 5+ hours/week.' },
      { type: 'strategic', title: 'Operations Hire Needed by Q3', description: 'Even part-time operations support (15-20 hrs/wk) would dramatically reduce single-point-of-failure risk.' },
      { type: 'growth', title: 'Leverage Mafe More Aggressively', description: 'Mafe is at 20hrs/week and capable of more. Transfer Airtable ownership and email campaign management fully.' },
    ],
  },

  fairman: {
    focusAreas: [
      'Map Node MVP specification and development roadmap',
      'DECO framework v1 documentation',
      'Thesis of Change geoship criteria finalization',
      'Cross-node integration architecture',
      'Systems Transformation Council facilitation',
    ],
    os: {
      morningChecklist: [
        'Regulation check: am I in complexity or clarity today?',
        'Review Map Node development progress',
        'Check cross-node alignment — anything drifting?',
        'Thesis evolution: any new inputs to integrate?',
        'Identify one thing to simplify, not complicate',
      ],
      weeklyCommitments: [
        'Map Node development sync',
        'Cross-node coordination call',
        'Thesis documentation session (2hrs focused)',
        'DECO framework progress review',
        'One deep-thinking session (unstructured, 90min)',
      ],
      decisionFilters: [
        'Does this serve the whole ecosystem or just one node?',
        'Am I making this more complex than necessary?',
        'Can I explain this to a non-expert in 2 sentences?',
        'Does this move from theory to executable within 90 days?',
        'Is this regenerative in structure, not just intent?',
      ],
      notInSeat: [
        'Day-to-day operations or admin',
        'Member enrollment or retention',
        'Event logistics',
        'Cash management or bookkeeping',
        'Individual deal execution (that is Greg)',
      ],
      eveningReflection: [
        'Did I move something from concept to actionable today?',
        'Where did complexity creep in unnecessarily?',
        'What integration across nodes did I enable or miss?',
        'Am I within my 15-20 hour weekly boundary?',
      ],
    },
    qualities: [
      { name: 'Systems Architecture', score: 5, description: 'Exceptional ability to see the whole and design coherent structures' },
      { name: 'Intellectual Depth', score: 5, description: 'Brings rigorous thinking; thesis of change work is world-class' },
      { name: 'Simplification', score: 3, description: 'Tendency toward over-complexity; needs to practice "good enough for now"' },
      { name: 'Execution Speed', score: 3, description: 'Part-time limitation means ideas outpace implementation; needs to prioritize ruthlessly' },
      { name: 'Cross-Node Integration', score: 4, description: 'Strong connector across nodes; sees patterns others miss' },
      { name: 'Communication Clarity', score: 3, description: 'Brilliant insights sometimes lost in complexity; needs simpler framing for broader team' },
    ],
    risks: [
      { name: 'Complexity Overload', likelihood: 'high', impact: 'medium', mitigation: 'Weekly simplification review; "explain in 2 sentences" test for every framework; external accountability' },
      { name: 'Part-Time Limitation', likelihood: 'high', impact: 'high', mitigation: 'Ruthless prioritization of Map Node and DECO; say no to peripheral requests; time-box deep work' },
      { name: 'Perfectionism Paralysis', likelihood: 'medium', impact: 'high', mitigation: 'Ship v0.1 mindset; "done is better than perfect" mantras; external deadlines from team' },
      { name: 'Thesis Drift from Action', likelihood: 'medium', impact: 'medium', mitigation: 'Every thesis session must produce one actionable output; Greg/James hold accountability' },
    ],
    redLines: [
      'Will not compromise systemic coherence for speed',
      'Will not design extractive structures regardless of returns',
      'Will not exceed part-time boundary at cost of family',
    ],
    agentInsights: [
      { type: 'strategic', title: 'Map Node is the Multiplier', description: 'Every hour invested in Map Node creates visibility for all other nodes. Prioritize this ruthlessly over everything else.' },
      { type: 'warning', title: 'DECO Needs a Deadline', description: 'Framework is at risk of perpetual refinement. Set a hard ship date for v1 and iterate from real feedback, not theory.' },
      { type: 'operational', title: 'Hire a Technical Co-Lead', description: 'Map Node needs more than 15-20hrs/week of strategic architecture. Consider a technical lead to execute while you architect.' },
      { type: 'growth', title: 'Teach the Frameworks', description: 'If only Fairman understands the thesis, it is fragile. Run a "teach the teacher" session so 3-4 others can articulate it.' },
    ],
  },

  greg: {
    focusAreas: [
      'Score and rank current 8-deal pipeline to top 5',
      'Blue Spirit deal presentation preparation (3 deals)',
      'Capital deployment process documentation',
      'Investor relations framework for LP engagement',
      'Deal scoring rubric refinement',
    ],
    os: {
      morningChecklist: [
        'Regulation check: am I evaluating with clarity or bias?',
        'Review deal pipeline status and any updates from founders',
        'Check if any diligence deadlines are approaching',
        'Capital Node Slack — any new deal submissions?',
        'One follow-up to an LP or prospective donor',
      ],
      weeklyCommitments: [
        'Deal review session (score at least 2 deals)',
        'Capital strategy sync with James',
        'LP engagement touchpoint (minimum 1)',
        'Diligence deep-dive on top candidate',
        'Blue Spirit prep: refine presentation materials',
      ],
      decisionFilters: [
        'Does this project score 15+ on our rubric?',
        'Is the team capable of executing with integrity?',
        'Does this align with our thesis of change?',
        'Would I put my own money into this?',
        'Can the community engage meaningfully with this project?',
      ],
      notInSeat: [
        'Membership enrollment or retention',
        'Event logistics or coordination',
        'Culture or coherence facilitation',
        'Operations or admin tasks',
        'Thesis architecture (that is Fairman)',
      ],
      eveningReflection: [
        'Did I advance the pipeline toward Blue Spirit readiness?',
        'Am I being rigorous enough in diligence or getting excited?',
        'What would a skeptical LP ask about our top deal?',
        'Is the scoring rubric producing good signal?',
      ],
    },
    qualities: [
      { name: 'Deal Evaluation', score: 4, description: 'Strong analytical lens; rubric-based approach brings needed rigor' },
      { name: 'Mission Alignment', score: 5, description: 'Never forgets the thesis; consistently screens for values first' },
      { name: 'Investor Relations', score: 3, description: 'Early stage; needs more systematic LP engagement cadence' },
      { name: 'Process Design', score: 3, description: 'Voting and decision process still being defined; needs documentation' },
      { name: 'Communication', score: 4, description: 'Clear presenter; can translate complex deals for non-financial audience' },
    ],
    risks: [
      { name: 'Pipeline Quality', likelihood: 'medium', impact: 'high', mitigation: 'Expand deal sourcing beyond current network; partner with Fairman on thesis-aligned leads; diversify sectors' },
      { name: 'Voting Process Unclear', likelihood: 'high', impact: 'medium', mitigation: 'Document clear voting mechanism before Blue Spirit; test with mock vote; get board sign-off' },
      { name: 'Concentration Risk', likelihood: 'medium', impact: 'medium', mitigation: 'Ensure sector diversification across funded projects; no more than 40% in any single sector' },
      { name: 'LP Expectations Mismatch', likelihood: 'medium', impact: 'high', mitigation: 'Clear communication of impact-first mandate; manage return expectations explicitly; quarterly updates' },
    ],
    redLines: [
      'Will not fund projects that fail mission alignment regardless of returns',
      'Will not skip diligence for timeline pressure',
      'Will not present deals to community without rigorous scoring',
    ],
    agentInsights: [
      { type: 'operational', title: 'Voting Mechanism is Urgent', description: 'Blue Spirit is 4 months away. The community vote process needs to be documented, tested, and approved within 6 weeks.' },
      { type: 'strategic', title: 'Build a Deal Sourcing Funnel', description: 'Currently deal flow is relationship-based. Add 2-3 systematic sourcing channels (accelerators, thesis-aligned VCs, node leads).' },
      { type: 'growth', title: 'LP Quarterly Report Template', description: 'Create a standardized quarterly update for LPs/donors. Transparency builds trust and drives additional capital.' },
      { type: 'warning', title: 'Blue Spirit Presentation Quality', description: 'Presentations to community must be both rigorous and accessible. Consider dry runs with non-finance team members.' },
    ],
  },

  dave: {
    focusAreas: [
      'Pod facilitation model design (6 pods proposed)',
      'Pod facilitator training program',
      'Board governance rhythm and cadence',
      'Member engagement between events',
      'Culture health indicators framework',
    ],
    os: {
      morningChecklist: [
        'Regulation check: am I holding space or controlling space?',
        'Review pod attendance and engagement data',
        'Any facilitator check-ins needed?',
        'Board agenda items for upcoming meeting',
        'One culture-building touchpoint (message, call, or note)',
      ],
      weeklyCommitments: [
        'Pod facilitation or observation (at least 1)',
        'Facilitator check-in or training session',
        'Board prep or governance review',
        'Member engagement initiative',
        'Culture health pulse check',
      ],
      decisionFilters: [
        'Does this create space for authentic connection?',
        'Am I honoring both the being and doing hemispheres?',
        'Will this increase member engagement or add burden?',
        'Is this governance serving the community or creating bureaucracy?',
        'Can a facilitator own this without me?',
      ],
      notInSeat: [
        'Day-to-day operations or membership admin',
        'Capital evaluation or deal flow',
        'Strategic architecture or thesis work',
        'Event logistics (that is Sian)',
        'Fundraising or LP relations',
      ],
      eveningReflection: [
        'Did I create a container where someone felt truly seen today?',
        'Are the pods healthy or showing signs of fatigue?',
        'Where is the culture strong and where is it thin?',
        'What governance question needs attention before it becomes a crisis?',
      ],
    },
    qualities: [
      { name: 'Facilitation', score: 5, description: 'Natural facilitator; creates containers where depth happens organically' },
      { name: 'Cultural Intuition', score: 5, description: 'Reads the room like few others; knows when culture is healthy or thin' },
      { name: 'Governance Rigor', score: 3, description: 'Understands importance but governance documentation needs more structure' },
      { name: 'Scalability Thinking', score: 3, description: 'Pod model works but needs a plan for 144+ members; not just 65' },
      { name: 'Facilitator Development', score: 4, description: 'Good at identifying potential facilitators; training program in early stages' },
    ],
    risks: [
      { name: 'Pod Engagement Drop-Off', likelihood: 'medium', impact: 'high', mitigation: 'Monthly pod health checks; rotate topics; guest facilitators; member feedback loops' },
      { name: 'Facilitator Shortage', likelihood: 'high', impact: 'high', mitigation: 'Accelerate facilitator training; identify 6+ candidates by Blue Spirit; create facilitator toolkit' },
      { name: 'Culture-Operations Gap', likelihood: 'medium', impact: 'medium', mitigation: 'Regular syncs with Sian on culture touchpoints in operations; integrate culture into member onboarding' },
      { name: 'Board Governance Drift', likelihood: 'low', impact: 'high', mitigation: 'Monthly board health check; clear agenda templates; decision log enforcement' },
    ],
    redLines: [
      'Will not let pods become performative rather than authentic',
      'Will not skip the being hemisphere for efficiency',
      'Will not let governance become disconnected from community needs',
    ],
    agentInsights: [
      { type: 'strategic', title: 'Pod Scaling Plan Needed Now', description: 'At 144 members, you need 12-15 pods. Current plan covers 6. Start designing the scaling architecture immediately.' },
      { type: 'operational', title: 'Facilitator Toolkit is Critical Path', description: 'Without a documented toolkit, facilitator training depends on your presence. Create it so training can happen without you.' },
      { type: 'growth', title: 'Member Engagement Metrics', description: 'Culture health is currently gut-feel. Implement simple metrics: pod attendance rate, NPS, between-event engagement score.' },
      { type: 'warning', title: 'Board Meeting Cadence at Risk', description: 'Board meetings have been inconsistent. Establish a fixed cadence and protect it. Governance gaps compound silently.' },
    ],
  },
};

/* ===============================================================================
   Status Config
   =============================================================================== */

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(107, 143, 113, 0.15)', text: SAGE, label: 'Active' },
  'part-time': { bg: 'rgba(232, 180, 76, 0.15)', text: '#e8b44c', label: 'Part-Time' },
  advisory: { bg: 'rgba(139, 92, 246, 0.15)', text: VIOLET, label: 'Advisory' },
  hiring: { bg: 'rgba(224, 96, 96, 0.15)', text: '#e06060', label: 'Hiring' },
};

/* ===============================================================================
   Greeting helper
   =============================================================================== */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ===============================================================================
   Component
   =============================================================================== */

export function StewardOSView() {
  const [selectedId, setSelectedId] = useState<string>(teamMembers[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [journal, setJournal] = useState<Record<string, JournalData>>({});

  const member = useMemo(
    () => teamMembers.find((m) => m.id === selectedId) || teamMembers[0],
    [selectedId]
  );

  const osData = stewardOSData[selectedId] || null;
  const hasFullOS = osData !== null;
  const status = statusConfig[member.status] || statusConfig.active;

  /* -- Journal localStorage -- */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (stored) setJournal(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const updateJournal = useCallback(
    (memberId: string, section: keyof JournalData, field: string, value: string) => {
      setJournal((prev) => {
        const memberJournal = prev[memberId] || {
          morning: { regulationCheck: '', topPriorities: '', whatNotToDo: '' },
          evening: { wins: '', tensionDump: '', cleanupQueue: '' },
          weekly: { prioritiesReview: '', blockers: '' },
        };
        const updated = {
          ...prev,
          [memberId]: {
            ...memberJournal,
            [section]: {
              ...memberJournal[section],
              [field]: value,
            },
          },
        };
        try {
          localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    []
  );

  const currentJournal: JournalData = journal[selectedId] || {
    morning: { regulationCheck: '', topPriorities: '', whatNotToDo: '' },
    evening: { wins: '', tensionDump: '', cleanupQueue: '' },
    weekly: { prioritiesReview: '', blockers: '' },
  };

  /* -- Computed stats -- */
  const avgScore = useMemo(() => {
    if (!osData) return 0;
    return osData.qualities.reduce((s, q) => s + q.score, 0) / osData.qualities.length;
  }, [osData]);

  const strengthCount = useMemo(() => {
    if (!osData) return 0;
    return osData.qualities.filter((q) => q.score >= 4).length;
  }, [osData]);

  const criticalRisks = useMemo(() => {
    if (!osData) return 0;
    return osData.risks.filter((r) => r.likelihood === 'high' && r.impact === 'high').length;
  }, [osData]);

  const focusCount = useMemo(() => {
    if (!osData) return 0;
    return osData.focusAreas.length;
  }, [osData]);

  /* -- Render Helpers -- */

  function renderScoreBar(score: number, max: number = 5) {
    return (
      <div className="flex items-center gap-1.5">
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className="h-2.5 rounded-full transition-all"
            style={{
              width: '24px',
              backgroundColor: i < score ? AMBER : '#1c2230',
              boxShadow: i < score ? `0 0 6px ${AMBER}40` : 'none',
              transition: `all 0.4s ease ${i * 0.08}s`,
            }}
          />
        ))}
        <span className="text-xs font-mono ml-2" style={{ color: AMBER }}>
          {score}/{max}
        </span>
      </div>
    );
  }

  /* ===============================================================================
     Tab Content Renderers
     =============================================================================== */

  function renderOverview() {
    return (
      <div className="space-y-6">
        {/* Domains */}
        <div
          className="glow-card rounded-xl border p-5 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.05s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} style={{ color: AMBER }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
              Domains of Responsibility
            </span>
          </div>
          <div className="space-y-2">
            {member.domains.map((d, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm animate-fade-in"
                style={{ animationDelay: `${0.08 + i * 0.04}s`, opacity: 0 }}
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: AMBER }} />
                <span className="text-text-secondary">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div
          className="glow-card rounded-xl border p-5 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.12s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} style={{ color: VIOLET }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: VIOLET }}>
              Key Performance Indicators
            </span>
          </div>
          <div className="space-y-2">
            {member.kpis.map((kpi, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm animate-fade-in"
                style={{ animationDelay: `${0.15 + i * 0.04}s`, opacity: 0 }}
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: VIOLET }} />
                <span className="text-text-secondary">{kpi}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Non-Negotiables */}
        <div
          className="glow-card rounded-xl border p-5 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: `${ROSE}20`, animationDelay: '0.2s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} style={{ color: ROSE }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ROSE }}>
              Non-Negotiables
            </span>
          </div>
          <div className="space-y-2">
            {member.nonNegotiables.map((nn, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: ROSE }} />
                <span className="text-text-muted italic">{nn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Focus Areas */}
        {hasFullOS && (
          <div
            className="glow-card rounded-xl border p-5 animate-fade-in"
            style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.26s', opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame size={14} style={{ color: SAGE }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: SAGE }}>
                Current Focus Areas
              </span>
            </div>
            <div className="space-y-2">
              {osData.focusAreas.map((fa, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm animate-fade-in"
                  style={{ animationDelay: `${0.3 + i * 0.04}s`, opacity: 0 }}
                >
                  <span className="text-text-muted font-mono text-xs mt-0.5 flex-shrink-0" style={{ color: SAGE }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-text-secondary">{fa}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasFullOS && (
          <div
            className="rounded-xl border p-6 text-center animate-fade-in"
            style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.26s', opacity: 0 }}
          >
            <FileText size={24} className="mx-auto mb-2 text-text-muted" />
            <p className="text-sm text-text-muted">
              Full operating system data is being developed for {member.name}.
            </p>
            <p className="text-xs text-text-muted mt-1">
              Profile data shown above. OS, qualities, risks, and agent intel coming soon.
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderOS() {
    if (!hasFullOS) {
      return (
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <RefreshCw size={28} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary">Operating System not yet configured for {member.name}.</p>
          <p className="text-xs text-text-muted mt-1">Core members (James, Sian, Fairman, Greg, Dave) have full OS data.</p>
        </div>
      );
    }

    const { os } = osData;

    const sections = [
      {
        title: 'Morning Checklist',
        icon: Sun,
        color: '#e8b44c',
        items: os.morningChecklist,
        itemIcon: CheckSquare,
        delay: '0.05s',
      },
      {
        title: 'Weekly Commitments',
        icon: Calendar,
        color: VIOLET,
        items: os.weeklyCommitments,
        itemIcon: null,
        delay: '0.1s',
      },
      {
        title: 'Decision Filters',
        icon: Lightbulb,
        color: AMBER,
        items: os.decisionFilters,
        itemIcon: ArrowRight,
        delay: '0.15s',
      },
      {
        title: "What's NOT in My Seat",
        icon: XCircle,
        color: ROSE,
        items: os.notInSeat,
        itemIcon: XCircle,
        delay: '0.2s',
      },
      {
        title: 'Evening Reflection Prompts',
        icon: Moon,
        color: '#818cf8',
        items: os.eveningReflection,
        itemIcon: null,
        delay: '0.25s',
      },
    ];

    return (
      <div className="space-y-6">
        {sections.map((section, sIdx) => {
          const SectionIcon = section.icon;
          return (
            <div
              key={sIdx}
              className="glow-card rounded-xl border p-5 animate-fade-in"
              style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: section.delay, opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <SectionIcon size={14} style={{ color: section.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: section.color }}>
                  {section.title}
                </span>
              </div>
              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const ItemIcon = section.itemIcon;
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-sm animate-fade-in"
                      style={{ animationDelay: `${parseFloat(section.delay) + 0.03 + i * 0.03}s`, opacity: 0 }}
                    >
                      {ItemIcon ? (
                        <ItemIcon
                          size={section.title.includes('NOT') ? 12 : 14}
                          className="mt-0.5 flex-shrink-0"
                          style={{ color: section.title.includes('NOT') ? `${section.color}80` : '#6b6358' }}
                        />
                      ) : section.title.includes('Evening') ? (
                        <span className="text-text-muted font-mono text-xs mt-0.5 flex-shrink-0" style={{ color: section.color }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: section.color }} />
                      )}
                      <span className={`${section.title.includes('Evening') ? 'italic ' : ''}${section.title.includes('NOT') ? 'text-text-muted' : 'text-text-secondary'}`}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderQualities() {
    if (!hasFullOS) {
      return (
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <Star size={28} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary">Qualities assessment not yet available for {member.name}.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div
          className="glow-card rounded-xl border p-5 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.05s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} style={{ color: AMBER }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
              Role Qualities Assessment
            </span>
          </div>
          <div className="space-y-5">
            {osData.qualities.map((q, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${0.08 + i * 0.06}s`, opacity: 0 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-text-primary">{q.name}</span>
                </div>
                {renderScoreBar(q.score)}
                <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{q.description}</p>
                {i < osData.qualities.length - 1 && (
                  <div className="mt-4" style={{ borderBottom: '1px solid #1e2638' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: avgScore.toFixed(1), label: 'Avg Score', color: AMBER },
            { value: String(strengthCount), label: 'Strengths', color: SAGE },
            { value: String(osData.qualities.filter((q) => q.score <= 3).length), label: 'Growth Areas', color: ROSE },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border p-4 text-center animate-fade-in"
              style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: `${0.3 + i * 0.06}s`, opacity: 0 }}
            >
              <div className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderRisk() {
    if (!hasFullOS) {
      return (
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <AlertTriangle size={28} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary">Risk framework not yet configured for {member.name}.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Risks */}
        <div className="space-y-3">
          {osData.risks.map((risk, i) => {
            const lhCfg = likelihoodConfig[risk.likelihood];
            const impCfg = likelihoodConfig[risk.impact];
            return (
              <div
                key={i}
                className="glow-card rounded-xl border p-5 animate-fade-in"
                style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: `${0.05 + i * 0.06}s`, opacity: 0 }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} style={{ color: impCfg.color }} />
                    <span className="text-sm font-semibold text-text-primary">{risk.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: lhCfg.bg, color: lhCfg.color }}
                    >
                      L: {risk.likelihood}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: impCfg.bg, color: impCfg.color }}
                    >
                      I: {risk.impact}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Shield size={12} className="mt-0.5 flex-shrink-0" style={{ color: SAGE }} />
                  <span className="text-text-secondary">{risk.mitigation}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Red Lines */}
        <div
          className="glow-card rounded-xl border p-5 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: `${ROSE}30`, animationDelay: '0.3s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} style={{ color: ROSE }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ROSE }}>
              Red Lines
            </span>
          </div>
          <div className="space-y-2">
            {osData.redLines.map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: ROSE }} />
                <span className="text-text-secondary font-medium">{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: osData.risks.filter((r) => r.likelihood === 'high' && r.impact === 'high').length, label: 'Critical', color: ROSE },
            { value: osData.risks.filter((r) => r.likelihood === 'medium' || r.impact === 'medium').length, label: 'Monitor', color: AMBER },
            { value: osData.risks.length, label: 'Total Risks', color: SAGE },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border p-4 text-center animate-fade-in"
              style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: `${0.35 + i * 0.05}s`, opacity: 0 }}
            >
              <div className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderJournal() {
    const today = getTodayFormatted();

    return (
      <div className="space-y-6">
        {/* Date Badge Banner */}
        <div
          className="rounded-xl border p-4 flex items-center gap-3 animate-fade-in"
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.06)',
            borderColor: 'rgba(139, 92, 246, 0.2)',
            animationDelay: '0.03s',
            opacity: 0,
          }}
        >
          <div
            className="w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.25)' }}
          >
            <span className="text-[10px] font-semibold uppercase" style={{ color: VIOLET }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="text-lg font-bold leading-none" style={{ color: VIOLET }}>
              {new Date().getDate()}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">{today}</div>
            <div className="text-xs text-text-muted">
              Journal entries for {member.name.split(' ')[0]}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <PenTool size={12} style={{ color: VIOLET }} />
            <span className="text-[10px] font-medium" style={{ color: VIOLET }}>Auto-saving</span>
          </div>
        </div>

        {/* Morning Journal */}
        <div
          className="glow-card rounded-xl border p-5 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.08s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(232, 180, 76, 0.12)' }}
            >
              <Sun size={16} style={{ color: '#e8b44c' }} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: '#e8b44c' }}>
                Morning Journal
              </span>
              <span className="text-[10px] text-text-muted">Start your day with intention</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Regulation Check -- How am I arriving today?
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#0b0d14', borderColor: '#1e2638' }}
                rows={2}
                placeholder="How is my energy, body, mind today..."
                value={currentJournal.morning.regulationCheck}
                onChange={(e) => updateJournal(selectedId, 'morning', 'regulationCheck', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Top 3 Priorities
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#0b0d14', borderColor: '#1e2638' }}
                rows={3}
                placeholder={"1. \n2. \n3. "}
                value={currentJournal.morning.topPriorities}
                onChange={(e) => updateJournal(selectedId, 'morning', 'topPriorities', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                What I will NOT do today
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#0b0d14', borderColor: '#1e2638' }}
                rows={2}
                placeholder="Boundary-setting: what am I saying no to today..."
                value={currentJournal.morning.whatNotToDo}
                onChange={(e) => updateJournal(selectedId, 'morning', 'whatNotToDo', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* End of Day */}
        <div
          className="glow-card rounded-xl border p-5 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.14s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(129, 140, 248, 0.12)' }}
            >
              <Moon size={16} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: '#818cf8' }}>
                End-of-Day Reflection
              </span>
              <span className="text-[10px] text-text-muted">Close the loop on your day</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Wins -- What moved the needle?
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#0b0d14', borderColor: '#1e2638' }}
                rows={2}
                placeholder="Celebrate what went well..."
                value={currentJournal.evening.wins}
                onChange={(e) => updateJournal(selectedId, 'evening', 'wins', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Tension Dump -- What am I carrying?
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#0b0d14', borderColor: '#1e2638' }}
                rows={2}
                placeholder="Unresolved tensions, frustrations, or concerns..."
                value={currentJournal.evening.tensionDump}
                onChange={(e) => updateJournal(selectedId, 'evening', 'tensionDump', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Cleanup Queue -- What needs follow-up?
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#0b0d14', borderColor: '#1e2638' }}
                rows={2}
                placeholder="Loose ends, promises made, things to close..."
                value={currentJournal.evening.cleanupQueue}
                onChange={(e) => updateJournal(selectedId, 'evening', 'cleanupQueue', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Weekly */}
        <div
          className="glow-card rounded-xl border p-5 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.2s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)' }}
            >
              <Calendar size={16} style={{ color: VIOLET }} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: VIOLET }}>
                Weekly Review
              </span>
              <span className="text-[10px] text-text-muted">Zoom out and course-correct</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Priorities Review -- Did I move the right things?
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#0b0d14', borderColor: '#1e2638' }}
                rows={3}
                placeholder="Review of weekly commitments and what actually happened..."
                value={currentJournal.weekly.prioritiesReview}
                onChange={(e) => updateJournal(selectedId, 'weekly', 'prioritiesReview', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Blockers -- What is in the way?
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#0b0d14', borderColor: '#1e2638' }}
                rows={2}
                placeholder="Structural blockers, resource gaps, or dependencies..."
                value={currentJournal.weekly.blockers}
                onChange={(e) => updateJournal(selectedId, 'weekly', 'blockers', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Persistence notice */}
        <div
          className="flex items-center gap-2 text-xs text-text-muted animate-fade-in"
          style={{ animationDelay: '0.25s', opacity: 0 }}
        >
          <Sparkles size={12} />
          <span>Journal entries auto-save to your browser. They persist between sessions.</span>
        </div>
      </div>
    );
  }

  function renderAgentIntel() {
    if (!hasFullOS) {
      return (
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <Brain size={28} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary">Agent Intel not yet generated for {member.name}.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div
          className="glow-card rounded-xl border p-4 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.03s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Brain size={14} style={{ color: VIOLET }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: VIOLET }}>
              AI-Generated Insights for {member.name.split(' ')[0]}
            </span>
          </div>
          <p className="text-[11px] text-text-muted">
            Role-specific recommendations based on current data, risks, and focus areas.
          </p>
        </div>

        {osData.agentInsights.map((insight, i) => {
          const cfg = insightTypeConfig[insight.type];
          return (
            <div
              key={i}
              className="glow-card rounded-xl border p-5 transition-all animate-fade-in"
              style={{
                backgroundColor: '#131720',
                borderColor: `${cfg.color}30`,
                borderLeftWidth: '3px',
                borderLeftColor: cfg.color,
                animationDelay: `${0.08 + i * 0.06}s`,
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span className="text-sm font-semibold text-text-primary">{insight.title}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{insight.description}</p>
            </div>
          );
        })}

        {/* Insight type legend */}
        <div
          className="rounded-xl border p-4 animate-fade-in"
          style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.35s', opacity: 0 }}
        >
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Insight Types</div>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(insightTypeConfig) as [AgentInsight['type'], typeof insightTypeConfig.strategic][]).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-[11px] text-text-muted">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ===============================================================================
     Main Render
     =============================================================================== */

  return (
    <div className="space-y-6">
      {/* -- Animated Greeting Banner -- */}
      <div
        className="rounded-xl border p-5 animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.08) 0%, rgba(139, 92, 246, 0.06) 50%, rgba(107, 143, 113, 0.05) 100%)',
          borderColor: 'rgba(212, 165, 116, 0.2)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-0.5">
              <span className="gradient-text">{getGreeting()}, Steward</span>
            </h1>
            <p className="text-sm text-text-secondary">
              {getTodayFormatted()} -- Your personal operating dashboard for clarity, rhythm, and self-awareness.
            </p>
          </div>
          {/* Mini decorative SVG pulse */}
          <div className="flex-shrink-0 hidden sm:block">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke={AMBER} strokeWidth="1" strokeDasharray="4 4" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="20s" repeatCount="indefinite" />
              </circle>
              <circle cx="24" cy="24" r="12" stroke={VIOLET} strokeWidth="1" strokeDasharray="3 3" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" from="360 24 24" to="0 24 24" dur="15s" repeatCount="indefinite" />
              </circle>
              <circle cx="24" cy="24" r="4" fill={AMBER} opacity="0.6">
                <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>
      </div>

      {/* -- Member Selector -- */}
      <div
        className="animate-fade-in relative"
        style={{ animationDelay: '0.04s', opacity: 0 }}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:border-opacity-50"
          style={{
            backgroundColor: '#131720',
            borderColor: dropdownOpen ? `${AMBER}40` : '#1e2638',
          }}
        >
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: avatarGradient(member.color), color: '#0b0d14' }}
          >
            {member.avatar}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-semibold text-text-primary">{member.name}</div>
            <div className="text-xs text-text-secondary truncate">{member.role}</div>
          </div>
          <ChevronDown
            size={16}
            className="text-text-muted transition-transform flex-shrink-0"
            style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute z-50 w-full mt-1 rounded-xl border overflow-hidden shadow-xl max-h-80 overflow-y-auto"
            style={{ backgroundColor: '#131720', borderColor: '#1e2638' }}
          >
            {teamMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedId(m.id);
                  setDropdownOpen(false);
                  setActiveTab('overview');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left"
                style={{
                  backgroundColor: m.id === selectedId ? 'rgba(212, 165, 116, 0.08)' : 'transparent',
                  borderBottom: '1px solid #1e2638',
                }}
                onMouseEnter={(e) => {
                  if (m.id !== selectedId) e.currentTarget.style.backgroundColor = '#1c2230';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    m.id === selectedId ? 'rgba(212, 165, 116, 0.08)' : 'transparent';
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: avatarGradient(m.color), color: '#0b0d14' }}
                >
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{m.name}</div>
                  <div className="text-[11px] text-text-muted truncate">{m.shortRole}</div>
                </div>
                {m.id === selectedId && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: AMBER }} />
                )}
                {stewardOSData[m.id] && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'rgba(107, 143, 113, 0.15)', color: SAGE }}
                  >
                    Full OS
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* -- Profile Header with Progress Ring -- */}
      <div
        className="glow-card rounded-xl border p-5 animate-fade-in"
        style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: '0.06s', opacity: 0 }}
      >
        <div className="flex items-start gap-4">
          {/* Large avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: avatarGradient(member.color), color: '#0b0d14' }}
          >
            {member.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-bold text-text-primary">{member.name}</h2>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: status.bg, color: status.text }}
              >
                {status.label}
              </span>
              {hasFullOS && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: VIOLET }}
                >
                  Full OS
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary mb-2">{member.role}</p>
            <p className="text-xs text-text-muted leading-relaxed">{member.roleOneSentence}</p>
            {member.hoursPerWeek && (
              <div className="flex items-center gap-1.5 mt-2">
                <Clock size={12} className="text-text-muted" />
                <span className="text-xs text-text-muted">{member.hoursPerWeek} hours/week</span>
              </div>
            )}
          </div>
          {/* Progress Ring for steward score */}
          {hasFullOS && (
            <div className="flex-shrink-0 hidden sm:block">
              <ProgressRing score={avgScore} maxScore={5} size={76} strokeWidth={5} color={AMBER} label="avg" />
            </div>
          )}
        </div>
      </div>

      {/* -- Stat Counters Row (for Full OS members) -- */}
      {hasFullOS && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in"
          style={{ animationDelay: '0.08s', opacity: 0 }}
        >
          {[
            { icon: Star, label: 'Avg Score', value: parseFloat(avgScore.toFixed(1)), suffix: '', color: AMBER, iconBg: 'rgba(212, 165, 116, 0.12)' },
            { icon: Award, label: 'Strengths', value: strengthCount, suffix: '', color: SAGE, iconBg: 'rgba(107, 143, 113, 0.12)' },
            { icon: AlertTriangle, label: 'Critical Risks', value: criticalRisks, suffix: '', color: ROSE, iconBg: 'rgba(244, 63, 94, 0.12)' },
            { icon: Flame, label: 'Focus Areas', value: focusCount, suffix: '', color: VIOLET, iconBg: 'rgba(139, 92, 246, 0.12)' },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={i}
                className="glow-card rounded-xl border p-4 animate-fade-in"
                style={{ backgroundColor: '#131720', borderColor: '#1e2638', animationDelay: `${0.1 + i * 0.04}s`, opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <StatIcon size={14} style={{ color: stat.color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{stat.label}</span>
                </div>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} color={stat.color} />
              </div>
            );
          })}
        </div>
      )}

      {/* -- Quick Action Cards -- */}
      {hasFullOS && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickActionCard
            icon={Sun}
            label="Morning Check-In"
            description="Start your day with clarity"
            color={WARNING}
            delay="0.14s"
          />
          <QuickActionCard
            icon={BookOpen}
            label="Open Journal"
            description="Reflect and capture insights"
            color={VIOLET}
            delay="0.17s"
          />
          <QuickActionCard
            icon={Target}
            label="Review Focus"
            description="Check your active priorities"
            color={SAGE}
            delay="0.2s"
          />
          <QuickActionCard
            icon={Brain}
            label="Agent Intel"
            description="AI-generated recommendations"
            color={SKY}
            delay="0.23s"
          />
        </div>
      )}

      {/* -- Tab Navigation -- */}
      <div
        className="flex gap-1 overflow-x-auto pb-1 animate-fade-in"
        style={{ animationDelay: '0.16s', opacity: 0 }}
      >
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          const isDisabled = !hasFullOS && tab.key !== 'overview' && tab.key !== 'journal';
          return (
            <button
              key={tab.key}
              onClick={() => !isDisabled && setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={{
                backgroundColor: isActive ? 'rgba(212, 165, 116, 0.12)' : 'transparent',
                color: isDisabled ? '#3a3a3a' : isActive ? AMBER : '#6b6358',
                border: `1px solid ${isActive ? 'rgba(212, 165, 116, 0.25)' : 'transparent'}`,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* -- Tab Content -- */}
      <div style={{ animationDelay: '0.18s', opacity: 0 }} className="animate-fade-in">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'os' && renderOS()}
        {activeTab === 'qualities' && renderQualities()}
        {activeTab === 'risk' && renderRisk()}
        {activeTab === 'journal' && renderJournal()}
        {activeTab === 'agent' && renderAgentIntel()}
      </div>
    </div>
  );
}
