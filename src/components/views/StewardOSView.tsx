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
  Check,
  Circle,
  CheckCircle2,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

/* =====================================================================
   Types
   ===================================================================== */

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

/* =====================================================================
   Constants & Colors
   ===================================================================== */

const AMBER = '#d4a574';
const VIOLET = '#8b5cf6';
const SAGE = '#6b8f71';
const ROSE = '#f43e5e';

const JOURNAL_STORAGE_KEY = 'frequency-steward-os-journal';
const CHECKLIST_STORAGE_KEY = 'frequency-steward-os-checklist';
const COMMITMENT_STORAGE_KEY = 'frequency-steward-os-commitments';

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

/* =====================================================================
   Avatar gradient helper
   ===================================================================== */

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

/* =====================================================================
   Greeting helper
   ===================================================================== */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* =====================================================================
   SVG Progress Ring Component
   ===================================================================== */

function ProgressRing({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const offset = circumference - progress;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const scoreColor = score >= 80 ? SAGE : score >= 60 ? AMBER : ROSE;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1c2230"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
            filter: `drop-shadow(0 0 6px ${scoreColor}60)`,
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
          {animatedScore}
        </span>
        <span style={{ fontSize: '0.6rem', color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
          Score
        </span>
      </div>
    </div>
  );
}

/* =====================================================================
   Mock Steward OS Data
   ===================================================================== */

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

/* =====================================================================
   Personal Stats Mock Data
   ===================================================================== */

const personalStats: Record<string, { tasksCompleted: number; hoursLogged: number; streakDays: number; overallScore: number }> = {
  james: { tasksCompleted: 47, hoursLogged: 128, streakDays: 12, overallScore: 82 },
  sian: { tasksCompleted: 89, hoursLogged: 320, streakDays: 18, overallScore: 88 },
  fairman: { tasksCompleted: 34, hoursLogged: 96, streakDays: 9, overallScore: 85 },
  greg: { tasksCompleted: 28, hoursLogged: 64, streakDays: 7, overallScore: 78 },
  dave: { tasksCompleted: 22, hoursLogged: 52, streakDays: 11, overallScore: 75 },
};

/* =====================================================================
   Status Config
   ===================================================================== */

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(107, 143, 113, 0.15)', text: SAGE, label: 'Active' },
  'part-time': { bg: 'rgba(232, 180, 76, 0.15)', text: '#e8b44c', label: 'Part-Time' },
  advisory: { bg: 'rgba(139, 92, 246, 0.15)', text: VIOLET, label: 'Advisory' },
  hiring: { bg: 'rgba(224, 96, 96, 0.15)', text: '#e06060', label: 'Hiring' },
};

/* =====================================================================
   Component
   ===================================================================== */

export function StewardOSView() {
  const [selectedId, setSelectedId] = useState<string>(teamMembers[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [journal, setJournal] = useState<Record<string, JournalData>>({});
  const [checklistState, setChecklistState] = useState<Record<string, Record<number, boolean>>>({});
  const [commitmentState, setCommitmentState] = useState<Record<string, Record<number, boolean>>>({});
  const [mounted, setMounted] = useState(false);

  const member = useMemo(
    () => teamMembers.find((m) => m.id === selectedId) || teamMembers[0],
    [selectedId]
  );

  const osData = stewardOSData[selectedId] || null;
  const hasFullOS = osData !== null;
  const status = statusConfig[member.status] || statusConfig.active;
  const stats = personalStats[selectedId] || { tasksCompleted: 0, hoursLogged: 0, streakDays: 0, overallScore: 60 };

  /* -- Mount animation trigger -- */
  useEffect(() => {
    setMounted(false);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [selectedId]);

  /* -- Journal localStorage -- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (stored) setJournal(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  /* -- Checklist localStorage -- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (stored) setChecklistState(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  /* -- Commitment localStorage -- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMMITMENT_STORAGE_KEY);
      if (stored) setCommitmentState(JSON.parse(stored));
    } catch { /* ignore */ }
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
        try { localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });
    },
    []
  );

  const toggleChecklist = useCallback((memberId: string, index: number) => {
    setChecklistState((prev) => {
      const memberState = prev[memberId] || {};
      const updated = {
        ...prev,
        [memberId]: { ...memberState, [index]: !memberState[index] },
      };
      try { localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const toggleCommitment = useCallback((memberId: string, index: number) => {
    setCommitmentState((prev) => {
      const memberState = prev[memberId] || {};
      const updated = {
        ...prev,
        [memberId]: { ...memberState, [index]: !memberState[index] },
      };
      try { localStorage.setItem(COMMITMENT_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const currentJournal: JournalData = journal[selectedId] || {
    morning: { regulationCheck: '', topPriorities: '', whatNotToDo: '' },
    evening: { wins: '', tensionDump: '', cleanupQueue: '' },
    weekly: { prioritiesReview: '', blockers: '' },
  };

  const currentChecklist = checklistState[selectedId] || {};
  const currentCommitments = commitmentState[selectedId] || {};

  /* -- Compute weekly commitment progress -- */
  const commitmentProgress = useMemo(() => {
    if (!hasFullOS) return 0;
    const total = osData.os.weeklyCommitments.length;
    const done = Object.values(currentCommitments).filter(Boolean).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [hasFullOS, osData, currentCommitments]);

  /* -- Render Helpers -- */

  function renderScoreBar(score: number, max: number = 5) {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all"
            style={{
              width: '20px',
              backgroundColor: i < score ? AMBER : '#1c2230',
              boxShadow: i < score ? `0 0 4px ${AMBER}40` : 'none',
            }}
          />
        ))}
        <span className="text-xs font-mono ml-2" style={{ color: AMBER }}>
          {score}/{max}
        </span>
      </div>
    );
  }

  /* Card animation style */
  function cardStyle(index: number): React.CSSProperties {
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      transition: `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s`,
    };
  }

  /* =====================================================================
     Tab Content Renderers
     ===================================================================== */

  function renderOverview() {
    return (
      <div className="space-y-6">
        {/* -- Greeting Section -- */}
        <div
          className="glow-card rounded-xl border p-6"
          style={{
            ...cardStyle(0),
            backgroundColor: 'rgba(212, 165, 116, 0.04)',
            borderColor: 'rgba(212, 165, 116, 0.15)',
          }}
        >
          <div className="flex items-center gap-5">
            {/* Avatar with glow */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold"
                style={{
                  background: avatarGradient(member.color),
                  color: '#0b0d14',
                  boxShadow: `0 0 24px ${AMBER}30`,
                }}
              >
                {member.avatar}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="text-2xl font-bold"
                style={{ color: '#f0ebe4' }}
              >
                {getGreeting()}, {member.name.split(' ')[0]}
              </h2>
              <p className="text-sm mt-1" style={{ color: '#a09888' }}>
                {getFormattedDate()}
              </p>
              <p className="text-xs mt-2" style={{ color: '#6b6358' }}>
                {member.roleOneSentence}
              </p>
            </div>
          </div>
        </div>

        {/* -- Progress Ring + Personal Stats Row -- */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Progress Ring */}
          <div
            className="glow-card rounded-xl border p-5 flex flex-col items-center justify-center"
            style={{
              ...cardStyle(1),
              backgroundColor: '#131720',
              borderColor: '#1e2638',
            }}
          >
            <ProgressRing score={stats.overallScore} size={110} strokeWidth={8} />
            <span className="text-[10px] font-semibold uppercase tracking-wider mt-3" style={{ color: '#6b6358' }}>
              Overall Score
            </span>
          </div>

          {/* Stats Cards */}
          {[
            { label: 'Tasks Done', value: stats.tasksCompleted, icon: CheckCircle2, color: SAGE },
            { label: 'Hours Logged', value: stats.hoursLogged, icon: Clock, color: VIOLET },
            { label: 'Day Streak', value: stats.streakDays, icon: Flame, color: '#fb923c' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="glow-card rounded-xl border p-5 flex flex-col items-center justify-center"
                style={{
                  ...cardStyle(i + 2),
                  backgroundColor: '#131720',
                  borderColor: '#1e2638',
                }}
              >
                <Icon size={18} style={{ color: stat.color, marginBottom: 8 }} />
                <span className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>
                  {stat.value}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: '#6b6358' }}>
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* -- Daily Focus Areas with Checklist -- */}
        {hasFullOS && (
          <div
            className="glow-card rounded-xl border p-5"
            style={{ ...cardStyle(5), backgroundColor: '#131720', borderColor: '#1e2638' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sun size={14} style={{ color: '#e8b44c' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#e8b44c' }}>
                Daily Focus — Morning Checklist
              </span>
              <span
                className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${SAGE}18`,
                  color: SAGE,
                }}
              >
                {Object.values(currentChecklist).filter(Boolean).length}/{osData.os.morningChecklist.length}
              </span>
            </div>
            <div className="space-y-2">
              {osData.os.morningChecklist.map((item, i) => {
                const checked = !!currentChecklist[i];
                return (
                  <button
                    key={i}
                    onClick={() => toggleChecklist(selectedId, i)}
                    className="w-full flex items-start gap-3 text-sm text-left group transition-all rounded-lg px-2 py-2 -mx-2"
                    style={{
                      backgroundColor: checked ? 'rgba(107, 143, 113, 0.06)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                      style={{
                        borderColor: checked ? SAGE : '#2e3a4e',
                        backgroundColor: checked ? `${SAGE}25` : 'transparent',
                      }}
                    >
                      {checked && <Check size={12} style={{ color: SAGE }} />}
                    </div>
                    <span
                      className="transition-all"
                      style={{
                        color: checked ? '#6b6358' : '#a09888',
                        textDecoration: checked ? 'line-through' : 'none',
                      }}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* -- Weekly Commitment Tracker -- */}
        {hasFullOS && (
          <div
            className="glow-card rounded-xl border p-5"
            style={{ ...cardStyle(6), backgroundColor: '#131720', borderColor: '#1e2638' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} style={{ color: VIOLET }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: VIOLET }}>
                Weekly Commitments
              </span>
              <span
                className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${VIOLET}18`,
                  color: VIOLET,
                }}
              >
                {commitmentProgress}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full mb-4" style={{ backgroundColor: '#1c2230' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${commitmentProgress}%`,
                  backgroundColor: VIOLET,
                  boxShadow: `0 0 8px ${VIOLET}40`,
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            <div className="space-y-2">
              {osData.os.weeklyCommitments.map((item, i) => {
                const checked = !!currentCommitments[i];
                return (
                  <button
                    key={i}
                    onClick={() => toggleCommitment(selectedId, i)}
                    className="w-full flex items-start gap-3 text-sm text-left rounded-lg px-2 py-2 -mx-2 transition-all"
                    style={{
                      backgroundColor: checked ? 'rgba(139, 92, 246, 0.06)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                      style={{
                        borderColor: checked ? VIOLET : '#2e3a4e',
                        backgroundColor: checked ? `${VIOLET}25` : 'transparent',
                      }}
                    >
                      {checked && <Check size={12} style={{ color: VIOLET }} />}
                    </div>
                    <span
                      className="transition-all"
                      style={{
                        color: checked ? '#6b6358' : '#a09888',
                        textDecoration: checked ? 'line-through' : 'none',
                      }}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* -- Domains -- */}
        <div
          className="glow-card rounded-xl border p-5"
          style={{ ...cardStyle(7), backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} style={{ color: AMBER }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
              Domains of Responsibility
            </span>
          </div>
          <div className="space-y-2">
            {member.domains.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: AMBER }} />
                <span className="text-text-secondary">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* -- KPIs -- */}
        <div
          className="glow-card rounded-xl border p-5"
          style={{ ...cardStyle(8), backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} style={{ color: VIOLET }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: VIOLET }}>
              Key Performance Indicators
            </span>
          </div>
          <div className="space-y-2">
            {member.kpis.map((kpi, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: VIOLET }} />
                <span className="text-text-secondary">{kpi}</span>
              </div>
            ))}
          </div>
        </div>

        {/* -- Non-Negotiables -- */}
        <div
          className="glow-card rounded-xl border p-5"
          style={{ ...cardStyle(9), backgroundColor: '#131720', borderColor: '#1e2638' }}
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

        {/* -- Journal Reflection (Quick Entry) -- */}
        <div
          className="glow-card rounded-xl border p-5"
          style={{ ...cardStyle(10), backgroundColor: '#131720', borderColor: '#1e2638' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} style={{ color: '#818cf8' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#818cf8' }}>
              Quick Reflection
            </span>
          </div>
          <textarea
            className="w-full rounded-lg border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1"
            style={{
              backgroundColor: '#0b0d14',
              borderColor: '#1e2638',
              minHeight: 80,
            }}
            rows={3}
            placeholder="What is on your mind right now? A quick thought, intention, or reflection..."
            value={currentJournal.morning.regulationCheck}
            onChange={(e) => updateJournal(selectedId, 'morning', 'regulationCheck', e.target.value)}
          />
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#6b6358' }}>
            <Sparkles size={11} />
            <span>Auto-saves to browser. Full journal in Journal tab.</span>
          </div>
        </div>

        {!hasFullOS && (
          <div
            className="rounded-xl border p-6 text-center"
            style={{ ...cardStyle(5), backgroundColor: '#131720', borderColor: '#1e2638' }}
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

    return (
      <div className="space-y-6">
        {/* Morning Checklist */}
        <div className="glow-card rounded-xl border p-5" style={{ ...cardStyle(0), backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sun size={14} style={{ color: '#e8b44c' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#e8b44c' }}>
              Morning Checklist
            </span>
          </div>
          <div className="space-y-2">
            {os.morningChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <CheckSquare size={14} className="mt-0.5 flex-shrink-0 text-text-muted" />
                <span className="text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Commitments */}
        <div className="glow-card rounded-xl border p-5" style={{ ...cardStyle(1), backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} style={{ color: VIOLET }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: VIOLET }}>
              Weekly Commitments
            </span>
          </div>
          <div className="space-y-2">
            {os.weeklyCommitments.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: VIOLET }} />
                <span className="text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Filters */}
        <div className="glow-card rounded-xl border p-5" style={{ ...cardStyle(2), backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} style={{ color: AMBER }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
              Decision Filters
            </span>
          </div>
          <div className="space-y-2">
            {os.decisionFilters.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <ArrowRight size={14} className="mt-0.5 flex-shrink-0" style={{ color: AMBER }} />
                <span className="text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What's NOT in Their Seat */}
        <div className="glow-card rounded-xl border p-5" style={{ ...cardStyle(3), backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={14} style={{ color: ROSE }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ROSE }}>
              What&apos;s NOT in My Seat
            </span>
          </div>
          <div className="space-y-2">
            {os.notInSeat.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <XCircle size={12} className="mt-0.5 flex-shrink-0" style={{ color: `${ROSE}80` }} />
                <span className="text-text-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evening Reflection */}
        <div className="glow-card rounded-xl border p-5" style={{ ...cardStyle(4), backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <div className="flex items-center gap-2 mb-3">
            <Moon size={14} style={{ color: '#818cf8' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#818cf8' }}>
              Evening Reflection Prompts
            </span>
          </div>
          <div className="space-y-2">
            {os.eveningReflection.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-text-muted font-mono text-xs mt-0.5 flex-shrink-0" style={{ color: '#818cf8' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-text-secondary italic">{item}</span>
              </div>
            ))}
          </div>
        </div>
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
        <div className="glow-card rounded-xl border p-5" style={{ ...cardStyle(0), backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} style={{ color: AMBER }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
              Role Qualities Assessment
            </span>
          </div>
          <div className="space-y-5">
            {osData.qualities.map((q, i) => (
              <div key={i} style={cardStyle(i + 1)}>
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
            {
              value: (osData.qualities.reduce((sum, q) => sum + q.score, 0) / osData.qualities.length).toFixed(1),
              label: 'Avg Score',
              color: AMBER,
            },
            {
              value: osData.qualities.filter((q) => q.score >= 4).length,
              label: 'Strengths',
              color: SAGE,
            },
            {
              value: osData.qualities.filter((q) => q.score <= 3).length,
              label: 'Growth Areas',
              color: ROSE,
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className="rounded-xl border p-4 text-center"
              style={{ ...cardStyle(i + 7), backgroundColor: '#131720', borderColor: '#1e2638' }}
            >
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{item.label}</div>
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
                className="glow-card rounded-xl border p-5"
                style={{ ...cardStyle(i), backgroundColor: '#131720', borderColor: '#1e2638' }}
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
          className="glow-card rounded-xl border p-5"
          style={{ ...cardStyle(osData.risks.length), backgroundColor: '#131720', borderColor: `${ROSE}30` }}
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
            {
              value: osData.risks.filter((r) => r.likelihood === 'high' && r.impact === 'high').length,
              label: 'Critical',
              color: ROSE,
            },
            {
              value: osData.risks.filter((r) => r.likelihood === 'medium' || r.impact === 'medium').length,
              label: 'Monitor',
              color: AMBER,
            },
            {
              value: osData.risks.length,
              label: 'Total Risks',
              color: SAGE,
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className="rounded-xl border p-4 text-center"
              style={{ ...cardStyle(osData.risks.length + 1 + i), backgroundColor: '#131720', borderColor: '#1e2638' }}
            >
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderJournal() {
    return (
      <div className="space-y-6">
        {/* Morning Journal */}
        <div className="glow-card rounded-xl border p-5" style={{ ...cardStyle(0), backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sun size={14} style={{ color: '#e8b44c' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#e8b44c' }}>
              Morning Journal
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Regulation Check — How am I arriving today?
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
                placeholder={'1. \n2. \n3. '}
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
        <div className="glow-card rounded-xl border p-5" style={{ ...cardStyle(1), backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <div className="flex items-center gap-2 mb-4">
            <Moon size={14} style={{ color: '#818cf8' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#818cf8' }}>
              End-of-Day Reflection
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Wins — What moved the needle?
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
                Tension Dump — What am I carrying?
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
                Cleanup Queue — What needs follow-up?
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
        <div className="glow-card rounded-xl border p-5" style={{ ...cardStyle(2), backgroundColor: '#131720', borderColor: '#1e2638' }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} style={{ color: VIOLET }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: VIOLET }}>
              Weekly Review
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Priorities Review — Did I move the right things?
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
                Blockers — What is in the way?
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
        <div className="flex items-center gap-2 text-xs text-text-muted" style={cardStyle(3)}>
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
          className="glow-card rounded-xl border p-4"
          style={{ ...cardStyle(0), backgroundColor: '#131720', borderColor: '#1e2638' }}
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
              className="glow-card rounded-xl border p-5 transition-all"
              style={{
                ...cardStyle(i + 1),
                backgroundColor: '#131720',
                borderColor: `${cfg.color}30`,
                borderLeftWidth: '3px',
                borderLeftColor: cfg.color,
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
          className="rounded-xl border p-4"
          style={{ ...cardStyle(osData.agentInsights.length + 1), backgroundColor: '#131720', borderColor: '#1e2638' }}
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

  /* =====================================================================
     Main Render
     ===================================================================== */

  return (
    <div className="space-y-6">
      {/* -- Page Header -- */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Steward OS</span>
          </h1>
          <span
            className="text-sm font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(212, 165, 116, 0.12)', color: AMBER }}
          >
            Personal Dashboard
          </span>
        </div>
        <p className="text-text-secondary text-sm">
          Your personal operating system — clarity, rhythm, and self-awareness in one place.
        </p>
      </div>

      {/* -- Member Selector -- */}
      <div
        className="animate-fade-in relative"
        style={{ animationDelay: '0.03s', opacity: 0 }}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:border-opacity-50"
          style={{
            backgroundColor: '#131720',
            borderColor: dropdownOpen ? `${AMBER}40` : '#1e2638',
          }}
        >
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
          {member.hoursPerWeek && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Clock size={11} className="text-text-muted" />
              <span className="text-[11px] text-text-muted">{member.hoursPerWeek}h/w</span>
            </div>
          )}
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: status.bg, color: status.text }}
          >
            {status.label}
          </span>
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

      {/* -- Tab Navigation -- */}
      <div
        className="flex gap-1 overflow-x-auto pb-1 animate-fade-in"
        style={{ animationDelay: '0.05s', opacity: 0 }}
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
      <div style={{ animationDelay: '0.07s', opacity: 0 }} className="animate-fade-in">
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
