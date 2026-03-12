// ─── Frequency Unite — Core Data Layer ───

export type MemberTier = 'core-team' | 'board' | 'node-lead' | 'member';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  shortRole: string;
  avatar: string;
  color: string;
  roleOneSentence: string;
  domains: string[];
  kpis: string[];
  nonNegotiables: string[];
  status: 'active' | 'part-time' | 'advisory' | 'hiring';
  tier: MemberTier;
  hoursPerWeek?: string;
}

export interface Node {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  gradient: string;
  purpose: string;
  capabilities: string[];
  leads: string[];
  status: 'active' | 'building' | 'pilot' | 'planned';
  priority: 'critical' | 'high' | 'medium';
  progress: number;
}

export interface OKR {
  id: string;
  objective: string;
  keyResults: { text: string; progress: number; owner: string }[];
  quarter: string;
  status: 'on-track' | 'at-risk' | 'behind';
}

export interface KPI {
  id: string;
  name: string;
  value: string;
  target: string;
  trend: 'up' | 'down' | 'flat';
  category: string;
}

export interface GovernanceDecision {
  id: string;
  date: string;
  title: string;
  description: string;
  decidedBy: string;
  impact: 'high' | 'medium' | 'low';
  category: 'governance' | 'financial' | 'membership' | 'strategy' | 'node';
}

export interface FrequencyEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  capacity: string;
  status: 'completed' | 'upcoming' | 'planning';
  highlights: string[];
}

export interface Task {
  id: string;
  title: string;
  owner: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline: string;
  node?: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  channel: string;
  sender: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
  reactions?: { emoji: string; count: number }[];
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  unread: number;
  lastMessage: string;
}

// ─── Team Members ───

export const teamMembers: TeamMember[] = [
  {
    id: 'james',
    name: 'James Hodges',
    role: 'Founder & Executive Chair',
    shortRole: 'Founder',
    avatar: 'JH',
    color: 'bg-amber-500',
    roleOneSentence: 'Founder, strategic vision-holder, and bridge between Frequency\'s being and doing hemispheres.',
    domains: [
      'Strategic vision and North Star stewardship',
      'Board governance and leadership council',
      'Capital strategy and DAF architecture',
      'Amphibian Capital bridge and fundraising',
      'Culture and coherence tone-setting',
    ],
    kpis: [
      '144 well-stewards by year-end',
      '$2M 2026 revenue target',
      'CEO hire post-Blue Spirit',
      'DAF structure operational',
    ],
    nonNegotiables: [
      'Coherence before action',
      'Systems change, not extraction',
      'Transparency with humility',
    ],
    status: 'active',
    tier: 'core-team',
    hoursPerWeek: '5-15',
  },
  {
    id: 'sian',
    name: 'Sian Hodges',
    role: 'Interim COO',
    shortRole: 'COO',
    avatar: 'SH',
    color: 'bg-rose-400',
    roleOneSentence: 'Only full-time ops person — stabilizes membership operations, cash forecasting, and team coordination.',
    domains: [
      'Day-to-day operations and membership management',
      'Event logistics and coordination',
      'Cash forecasting and budget tracking',
      'Team scheduling and communication',
      'Member onboarding and retention',
    ],
    kpis: [
      '85%+ member retention',
      'Operations running without heroics',
      'Event logistics on-budget',
      'Member NPS 9+',
    ],
    nonNegotiables: [
      'Sustainable operations pace',
      'Member experience excellence',
      'Clear communication cadence',
    ],
    status: 'active',
    tier: 'core-team',
    hoursPerWeek: '40',
  },
  {
    id: 'fairman',
    name: 'Alex James Fairman',
    role: 'Co-Founder & Strategic Architect',
    shortRole: 'Strategic Architect',
    avatar: 'AF',
    color: 'bg-violet-500',
    roleOneSentence: 'Co-founder and strategic integration lead — VP of Doing, thesis architecture, and node ecosystem design.',
    domains: [
      'Strategic integration across all nodes',
      'Thesis of Change architecture',
      'Map Node design and platform vision',
      'Deal flow curation and project diligence',
      'DAF and holdco structure design',
    ],
    kpis: [
      'Thesis framework operational',
      'Map Node MVP launched',
      '3-5 geoships identified and funded',
      'Node coordination flowing',
    ],
    nonNegotiables: [
      'Systemic thinking over quick fixes',
      'Coherence of vision across nodes',
      'Regeneration, not extraction',
    ],
    status: 'active',
    tier: 'core-team',
    hoursPerWeek: '15-20',
  },
  {
    id: 'max',
    name: 'Maximillian',
    role: 'Strategic Enrollment',
    shortRole: 'Enrollment',
    avatar: 'MX',
    color: 'bg-sky-400',
    roleOneSentence: 'Leads membership enrollment pipeline — identifying, attracting, and onboarding exceptional well-stewards.',
    domains: [
      'Membership enrollment pipeline',
      'Prospect identification and outreach',
      'Essence interviews for new members',
      'Enrollment strategy and conversion',
    ],
    kpis: [
      '25-30+ new well-stewards at events',
      'Pipeline of qualified prospects',
      'Enrollment conversion rate',
    ],
    nonNegotiables: [
      'Quality over quantity in membership',
      'Authentic connection in outreach',
    ],
    status: 'active',
    tier: 'core-team',
    hoursPerWeek: '5-10',
  },
  {
    id: 'dave',
    name: 'Dave Weale',
    role: 'Board Member & Pods/Culture',
    shortRole: 'Board & Culture',
    avatar: 'DW',
    color: 'bg-emerald-500',
    roleOneSentence: 'Board member leading pods and culture infrastructure — creating containers for deep member engagement.',
    domains: [
      'Pod facilitation and design',
      'Culture infrastructure',
      'Member engagement touchpoints',
      'Board governance',
    ],
    kpis: [
      'Active pods with consistent attendance',
      'Member engagement between events',
      'Culture health indicators',
    ],
    nonNegotiables: [
      'Space for authentic connection',
      'Both being and doing honored',
    ],
    status: 'active',
    tier: 'board',
    hoursPerWeek: '5-10',
  },
  {
    id: 'andrew',
    name: 'Andrew',
    role: 'Culture & Coherence Lead',
    shortRole: 'Coherence',
    avatar: 'AN',
    color: 'bg-purple-500',
    roleOneSentence: 'Leads culture and coherence work — ensuring alignment, embodiment, and integration practices across the community.',
    domains: [
      'Coherence practices and rituals',
      'Cultural alignment facilitation',
      'Inner work and embodiment leadership',
      'Gender balance and integration',
    ],
    kpis: [
      'Coherence score across events',
      'Integration of practices into operations',
      'Community alignment indicators',
    ],
    nonNegotiables: [
      'Inner work is non-negotiable',
      'Masculine/feminine balance',
      'Coherence before strategy',
    ],
    status: 'active',
    tier: 'core-team',
    hoursPerWeek: 'Surgical',
  },
  {
    id: 'felicia',
    name: 'Felicia Isabella',
    role: 'Culture & Coherence',
    shortRole: 'Culture',
    avatar: 'FI',
    color: 'bg-pink-400',
    roleOneSentence: 'Co-leads culture and coherence alongside Andrew — holding space for the feminine wisdom and embodied practice.',
    domains: [
      'Feminine leadership and wisdom',
      'Community coherence practices',
      'Event ceremony and ritual',
      'Women\'s Council support',
    ],
    kpis: [
      'Depth of coherence at events',
      'Feminine voice integration',
    ],
    nonNegotiables: [
      'Embodied practice over theory',
      'Receptivity and witnessing',
    ],
    status: 'active',
    tier: 'core-team',
    hoursPerWeek: 'Surgical',
  },
  {
    id: 'mafe',
    name: 'Mafe',
    role: 'PM & Virtual Assistant',
    shortRole: 'PM/VA',
    avatar: 'MF',
    color: 'bg-teal-400',
    roleOneSentence: 'Project management and operations support — Airtable, communications, and coordination backbone.',
    domains: [
      'Airtable management and tracking',
      'Email campaigns and communications',
      'Project management support',
      'Administrative coordination',
    ],
    kpis: [
      'Systems running smoothly',
      'Communications on schedule',
      'Data accuracy in Airtable',
    ],
    nonNegotiables: [
      'Reliable execution',
      'Clear documentation',
    ],
    status: 'active',
    tier: 'core-team',
    hoursPerWeek: '20',
  },
  {
    id: 'colleen',
    name: 'Colleen Galbraith',
    role: 'DAF & Financial Stewardship',
    shortRole: 'DAF Steward',
    avatar: 'CG',
    color: 'bg-amber-400',
    roleOneSentence: 'Leads DAF structure and financial stewardship — ensuring funds flow with integrity to mission-aligned projects.',
    domains: [
      'DAF administration and compliance',
      'Financial stewardship and reporting',
      'Donor relations and acknowledgment',
      'Fund deployment oversight',
    ],
    kpis: [
      'DAF operational and compliant',
      'Donor acknowledgment within compliance',
      'Fund deployment aligned with thesis',
    ],
    nonNegotiables: [
      'Financial transparency',
      'Compliance-first approach',
    ],
    status: 'active',
    tier: 'core-team',
    hoursPerWeek: '5-10',
  },
  {
    id: 'greg',
    name: 'Greg Berry',
    role: 'Capital Node Lead',
    shortRole: 'Capital Lead',
    avatar: 'GB',
    color: 'bg-green-500',
    roleOneSentence: 'Leads the Capital Node — evaluating deal flow, investor relations, and project scoring for fund deployment.',
    domains: [
      'Deal flow evaluation and scoring',
      'Capital deployment strategy',
      'Investor relations',
      'Project diligence facilitation',
    ],
    kpis: [
      'Deal flow quality and quantity',
      'Project scoring accuracy',
      'Capital deployed to aligned projects',
    ],
    nonNegotiables: [
      'Rigorous diligence',
      'Mission alignment over returns',
    ],
    status: 'active',
    tier: 'node-lead',
    hoursPerWeek: '5-10',
  },
  {
    id: 'gareth',
    name: 'Gareth Hermann',
    role: 'Bioregions Node Lead',
    shortRole: 'Bioregions',
    avatar: 'GH',
    color: 'bg-lime-500',
    roleOneSentence: 'Leads the Bioregions Node — pioneering community regeneration starting with the Nicoya Blue Zone pilot.',
    domains: [
      'Bioregional initiative design',
      'Nicoya pilot program',
      'Local community partnerships',
      'Regenerative development models',
    ],
    kpis: [
      'Nicoya pilot showing progress',
      'Community engagement metrics',
      'Replicable bioregion model',
    ],
    nonNegotiables: [
      'Local empowerment first',
      'Harmony with nature',
      'Community-led, not imposed',
    ],
    status: 'active',
    tier: 'node-lead',
    hoursPerWeek: '10-15',
  },
  {
    id: 'raamayan',
    name: 'Raamayan Ananda',
    role: 'Megaphone Node Lead',
    shortRole: 'Megaphone',
    avatar: 'RA',
    color: 'bg-orange-500',
    roleOneSentence: 'Leads the Megaphone Node — cultural narrative, movement building, distribution, and the Anthem crown jewel.',
    domains: [
      'Cultural narrative and storytelling',
      'Movement building and distribution',
      'Anthem project leadership',
      'Culture Studios and AI integration',
      'Partner network (Live Nation, etc.)',
    ],
    kpis: [
      'Distribution capacity built',
      'Anthem progress and impact',
      'Cultural narrative reach',
    ],
    nonNegotiables: [
      'Authentic storytelling',
      'Movement over marketing',
    ],
    status: 'active',
    tier: 'node-lead',
    hoursPerWeek: '10-15',
  },
  {
    id: 'sarah',
    name: 'Sarah Speers',
    role: 'School of Energy',
    shortRole: 'Energy',
    avatar: 'SS',
    color: 'bg-indigo-400',
    roleOneSentence: 'Leads The School of Energy — educational programming and energetic practices within the community.',
    domains: [
      'Educational programming',
      'Energetic practices and workshops',
      'Community learning facilitation',
    ],
    kpis: [
      'Program engagement',
      'Member learning outcomes',
    ],
    nonNegotiables: [
      'Embodied education',
      'Integrity of practice',
    ],
    status: 'active',
    tier: 'member',
    hoursPerWeek: '5-10',
  },
  {
    id: 'nipun',
    name: 'Nipun',
    role: 'Bookkeeper',
    shortRole: 'Finance',
    avatar: 'NP',
    color: 'bg-slate-400',
    roleOneSentence: 'Long-standing bookkeeper (10-year relationship) — keeps the financial books accurate and clean.',
    domains: [
      'Bookkeeping and accounting',
      'Financial record management',
      'Tax preparation support',
    ],
    kpis: [
      'Books clean and current',
      'Timely financial reports',
    ],
    nonNegotiables: [
      'Accuracy above all',
    ],
    status: 'active',
    tier: 'core-team',
    hoursPerWeek: '5',
  },
];

// ─── Nodes (replacing AI Agents) ───

export const nodes: Node[] = [
  {
    id: 'map',
    name: 'Map Node',
    shortName: 'Map',
    icon: 'Globe',
    color: 'text-violet-400',
    gradient: 'from-violet-500/10 to-indigo-500/10',
    purpose: 'Create the ecosystem infrastructure — coordination layer, deal intelligence platform, and architecture enabling all other work.',
    capabilities: [
      'Ecosystem mapping and coordination',
      'Deal intelligence platform',
      'Project tracking and scoring',
      'Cross-node integration layer',
      'AI-powered ecosystem analysis',
    ],
    leads: ['fairman'],
    status: 'active',
    priority: 'critical',
    progress: 35,
  },
  {
    id: 'bioregions',
    name: 'Bioregions Node',
    shortName: 'Bioregions',
    icon: 'TreePine',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/10 to-green-500/10',
    purpose: 'Inspire communities to flourish in harmony with nature — pioneering bioregional regeneration starting with Nicoya Blue Zone.',
    capabilities: [
      'Community regeneration design',
      'Nicoya Blue Zone pilot (Costa Rica)',
      'Nosara School partnerships',
      'Local empowerment frameworks',
      'Replicable bioregion templates',
    ],
    leads: ['gareth'],
    status: 'pilot',
    priority: 'high',
    progress: 20,
  },
  {
    id: 'capital',
    name: 'Capital Node',
    shortName: 'Capital',
    icon: 'Gem',
    color: 'text-amber-400',
    gradient: 'from-amber-500/10 to-yellow-500/10',
    purpose: 'Evaluate, select, and deploy capital to the highest-impact projects aligned with the thesis of change.',
    capabilities: [
      'Deal flow evaluation and scoring',
      'Rubric-based project selection (15-30+ score)',
      'Investor relations and LP engagement',
      'Diligence framework (3-5 finalists per event)',
      'DAF deployment oversight',
    ],
    leads: ['greg', 'james'],
    status: 'active',
    priority: 'critical',
    progress: 40,
  },
  {
    id: 'megaphone',
    name: 'Megaphone Node',
    shortName: 'Megaphone',
    icon: 'Megaphone',
    color: 'text-orange-400',
    gradient: 'from-orange-500/10 to-red-500/10',
    purpose: 'Cultural narrative, movement building, and distribution — amplifying the signal of regeneration through story, music, and media.',
    capabilities: [
      'Anthem project (crown jewel)',
      'Cultural narrative and storytelling',
      'Distribution and aggregation layer',
      'Intelligence layer (Culture Studios, AI, Beam)',
      'Venture agency partnerships',
    ],
    leads: ['raamayan'],
    status: 'building',
    priority: 'high',
    progress: 25,
  },
  {
    id: 'capitalism2',
    name: 'Capitalism 2.0 Node',
    shortName: 'Cap 2.0',
    icon: 'Sprout',
    color: 'text-teal-400',
    gradient: 'from-teal-500/10 to-cyan-500/10',
    purpose: 'Design new economic paradigm models — DECO frameworks, regenerative finance structures, and dharmic capitalism in practice.',
    capabilities: [
      'DECO (Donor Equity Conversion Option) framework',
      'Regenerative finance model design',
      'Holdco and SPV architecture',
      'New economic paradigm research',
      'Impact-first investment structures',
    ],
    leads: ['fairman', 'james'],
    status: 'building',
    priority: 'medium',
    progress: 15,
  },
  {
    id: 'thesis',
    name: 'Thesis of Change',
    shortName: 'Thesis',
    icon: 'BookOpen',
    color: 'text-purple-400',
    gradient: 'from-purple-500/10 to-fuchsia-500/10',
    purpose: 'Define how systems change happens — the intellectual and spiritual backbone guiding all Frequency investments and actions.',
    capabilities: [
      'Systems Transformation Council facilitation',
      'Geoship identification framework',
      'Thesis documentation and evolution',
      'Cross-node alignment on change theory',
      'Research and knowledge synthesis',
    ],
    leads: ['fairman'],
    status: 'active',
    priority: 'critical',
    progress: 45,
  },
];

// ─── OKRs ───

export const okrs: OKR[] = [
  {
    id: 'okr-1',
    objective: 'Build community of 144 deeply coherent well-stewards unified around systems change',
    keyResults: [
      { text: 'Reach 144 active well-stewards by December 2026', progress: 45, owner: 'james' },
      { text: 'Achieve 85%+ member retention rate', progress: 60, owner: 'sian' },
      { text: 'Onboard 25-30+ new well-stewards at Blue Spirit', progress: 10, owner: 'max' },
      { text: 'Launch 6+ active pods with consistent attendance', progress: 30, owner: 'dave' },
    ],
    quarter: 'H1 2026',
    status: 'on-track',
  },
  {
    id: 'okr-2',
    objective: 'Operationalize the DAF and deploy first capital to mission-aligned projects',
    keyResults: [
      { text: 'DAF structure fully operational and compliant', progress: 50, owner: 'colleen' },
      { text: 'Raise $500K-$1M in DAF contributions', progress: 20, owner: 'james' },
      { text: 'Select and fund 3-5 geoship projects through diligence', progress: 15, owner: 'greg' },
      { text: 'DECO framework documented and ready for first deployment', progress: 25, owner: 'fairman' },
    ],
    quarter: 'H1 2026',
    status: 'at-risk',
  },
  {
    id: 'okr-3',
    objective: 'Activate all 6 nodes with clear leads, OKRs, and visible progress',
    keyResults: [
      { text: 'Each node has a designated lead and quarterly OKRs', progress: 55, owner: 'fairman' },
      { text: 'Map Node MVP operational as coordination layer', progress: 30, owner: 'fairman' },
      { text: 'Megaphone Node cranking with distribution capacity', progress: 20, owner: 'raamayan' },
      { text: 'Bioregions Nicoya pilot showing measurable community impact', progress: 15, owner: 'gareth' },
    ],
    quarter: 'H1 2026',
    status: 'at-risk',
  },
  {
    id: 'okr-4',
    objective: 'Execute Blue Spirit event that deepens coherence and accelerates momentum',
    keyResults: [
      { text: 'Blue Spirit sells out (50-80 participants)', progress: 10, owner: 'sian' },
      { text: 'NPS of 9.3+ (matching or exceeding prior events)', progress: 0, owner: 'sian' },
      { text: 'At least 3 deal presentations with community vote', progress: 5, owner: 'greg' },
      { text: 'Post-event: CEO candidate identified and in conversation', progress: 0, owner: 'james' },
    ],
    quarter: 'Q3 2026',
    status: 'on-track',
  },
  {
    id: 'okr-5',
    objective: 'Stabilize operations and transition from heroics to systems',
    keyResults: [
      { text: 'Monthly burn stable at $22-25K (core team)', progress: 70, owner: 'sian' },
      { text: 'Cash runway visible for 12+ months', progress: 45, owner: 'nipun' },
      { text: 'Decision log maintained for every council meeting', progress: 35, owner: 'james' },
      { text: 'Hire or identify CEO candidate by Q3 2026', progress: 5, owner: 'james' },
    ],
    quarter: 'H1 2026',
    status: 'on-track',
  },
];

// ─── KPIs ───

export const kpis: KPI[] = [
  { id: 'kpi-1', name: 'Well-Stewards', value: '~65', target: '144', trend: 'up', category: 'Membership' },
  { id: 'kpi-2', name: 'Member Retention', value: '78%', target: '85%+', trend: 'up', category: 'Membership' },
  { id: 'kpi-3', name: 'Monthly Burn (Core)', value: '$22K', target: '$25K cap', trend: 'flat', category: 'Financial' },
  { id: 'kpi-4', name: '2026 Revenue', value: '$180K', target: '$2M', trend: 'up', category: 'Financial' },
  { id: 'kpi-5', name: 'DAF Raised', value: '$85K', target: '$500K-$1M', trend: 'up', category: 'Financial' },
  { id: 'kpi-6', name: 'Active Nodes', value: '4/6', target: '6/6', trend: 'up', category: 'Operations' },
  { id: 'kpi-7', name: 'Event NPS', value: '9.3', target: '9.5', trend: 'flat', category: 'Community' },
  { id: 'kpi-8', name: 'Projects Funded', value: '2', target: '5', trend: 'up', category: 'Impact' },
  { id: 'kpi-9', name: 'Team Size', value: '14', target: '18', trend: 'up', category: 'Operations' },
  { id: 'kpi-10', name: 'Coherence Rating', value: '7.2/10', target: '8.5/10', trend: 'up', category: 'Community' },
];

// ─── Governance Decisions ───

export const governanceDecisions: GovernanceDecision[] = [
  {
    id: 'dec-1',
    date: '2026-02-02',
    title: 'Teal Governance Model Adopted',
    description: 'Moved from Green-stage consensus to Teal governance with responsibility-weighted voice, decision logs required for every meeting, and subsidiarity principle.',
    decidedBy: 'Wisdom Council',
    impact: 'high',
    category: 'governance',
  },
  {
    id: 'dec-2',
    date: '2026-01-30',
    title: 'DAF Structure Approved',
    description: 'Approved Donor-Advised Fund structure with DECO framework for project investments. Holdco (Delaware LLC) established for equity management.',
    decidedBy: 'Board + Leadership Council',
    impact: 'high',
    category: 'financial',
  },
  {
    id: 'dec-3',
    date: '2026-02-15',
    title: 'Membership Pricing Finalized',
    description: 'Individual membership set at $1,200/month, couple at $1,700/month. Tax-deductible as 501(c)(3) contribution.',
    decidedBy: 'Core Stewardship Team',
    impact: 'high',
    category: 'membership',
  },
  {
    id: 'dec-4',
    date: '2026-02-20',
    title: 'Two-Hemisphere Operating Model',
    description: 'Formalized the Right Side (Being/Nonprofit) and Left Side (Doing/Capital) model with Board + Leadership Council as integration center.',
    decidedBy: 'Leadership Council',
    impact: 'high',
    category: 'governance',
  },
  {
    id: 'dec-5',
    date: '2026-03-01',
    title: 'Blue Spirit July 2026 Confirmed',
    description: 'Blue Spirit 6.0 confirmed for July 18, 2026 in Nosara, Costa Rica. Budget allocated. Registration to open in April.',
    decidedBy: 'Core Stewardship Team',
    impact: 'medium',
    category: 'strategy',
  },
  {
    id: 'dec-6',
    date: '2026-03-05',
    title: 'CEO Search to Begin Post-Blue Spirit',
    description: 'Agreed to formally begin CEO search after Blue Spirit event. James transitions from exec chair to strategic advisor role.',
    decidedBy: 'Board',
    impact: 'high',
    category: 'strategy',
  },
  {
    id: 'dec-7',
    date: '2026-02-10',
    title: 'Node Lead Accountability Framework',
    description: 'Each node lead required to submit quarterly OKRs, monthly progress updates, and participate in bi-weekly node sync calls.',
    decidedBy: 'Core Stewardship Team',
    impact: 'medium',
    category: 'node',
  },
];

// ─── Events ───

export const events: FrequencyEvent[] = [
  {
    id: 'evt-1',
    name: 'Beyul 4.0',
    date: 'June 2025',
    location: 'Boulder, CO',
    description: 'Vision alignment and community building gathering. Set the stage for 2026 governance evolution.',
    capacity: '60 attendees',
    status: 'completed',
    highlights: [
      'Vision 2026 framework established',
      'Governance charter initial draft',
      'New member essence interviews',
      '9.1/10 NPS score',
    ],
  },
  {
    id: 'evt-2',
    name: 'Cabo 5.0',
    date: 'January 26 - February 2, 2026',
    location: 'El Ganzo, Cabo San Lucas',
    description: 'Flagship gathering — governance alignment, DAF structure, node deep dives, and deal flow presentations.',
    capacity: '150-200 (50-60 stewards + 25-30 new + change agents + team)',
    status: 'completed',
    highlights: [
      'Teal governance model adopted',
      'DAF structure approved',
      'Capital node sessions with deal presentations',
      'Megaphone stage showcase',
      '9.3/10 NPS, 97% life purpose alignment',
    ],
  },
  {
    id: 'evt-3',
    name: 'Blue Spirit 6.0',
    date: 'July 18, 2026',
    location: 'Nosara, Costa Rica',
    description: 'Deeper integration event — celebrating H1 progress, team transitions, and moving from bridging to serious operations.',
    capacity: '50-80 participants',
    status: 'upcoming',
    highlights: [
      'H1 OKR review and celebration',
      'Bioregions Nicoya site visit',
      'CEO candidate conversations',
      'Node showcase and progress demos',
    ],
  },
  {
    id: 'evt-4',
    name: 'Fall Gathering',
    date: 'October 2026',
    location: 'TBD',
    description: 'End-of-year synthesis gathering — reviewing 2026 progress, setting 2027 vision, celebrating the 144.',
    capacity: '80-100',
    status: 'planning',
    highlights: [
      '2026 impact report presentation',
      '2027 strategic planning',
      'New node launches',
      'Community celebration',
    ],
  },
];

// ─── Tasks (90-Day Action Plan) ───

export const tasks: Task[] = [
  // Operations & Stabilization
  { id: 't-1', title: 'Finalize 12-month cash forecast', owner: 'sian', status: 'in-progress', priority: 'critical', deadline: '2026-03-31', category: 'Operations' },
  { id: 't-2', title: 'Complete DAF compliance checklist', owner: 'colleen', status: 'in-progress', priority: 'critical', deadline: '2026-03-31', category: 'Financial' },
  { id: 't-3', title: 'Set up decision log system for all councils', owner: 'mafe', status: 'todo', priority: 'high', deadline: '2026-04-15', category: 'Governance' },
  { id: 't-4', title: 'Monthly member communication cadence established', owner: 'sian', status: 'done', priority: 'high', deadline: '2026-03-15', category: 'Membership' },
  { id: 't-5', title: 'Migrate member data to clean Airtable system', owner: 'mafe', status: 'in-progress', priority: 'high', deadline: '2026-04-01', category: 'Operations' },

  // Membership & Growth
  { id: 't-6', title: 'Launch Blue Spirit registration', owner: 'sian', status: 'todo', priority: 'critical', deadline: '2026-04-15', category: 'Events' },
  { id: 't-7', title: 'Essence interviews for 15 new prospects', owner: 'max', status: 'in-progress', priority: 'high', deadline: '2026-05-01', category: 'Membership' },
  { id: 't-8', title: 'Member retention survey and analysis', owner: 'sian', status: 'todo', priority: 'medium', deadline: '2026-04-30', category: 'Membership' },
  { id: 't-9', title: 'Update member agreement to v1.5', owner: 'james', status: 'todo', priority: 'medium', deadline: '2026-04-15', category: 'Governance' },

  // Node Activation
  { id: 't-10', title: 'Map Node MVP specs and timeline', owner: 'fairman', status: 'in-progress', priority: 'critical', deadline: '2026-04-30', node: 'map', category: 'Node - Map' },
  { id: 't-11', title: 'Nicoya pilot Phase 1 launch', owner: 'gareth', status: 'todo', priority: 'high', deadline: '2026-05-15', node: 'bioregions', category: 'Node - Bioregions' },
  { id: 't-12', title: 'Capital Node: Score next batch of 5 deals', owner: 'greg', status: 'in-progress', priority: 'critical', deadline: '2026-04-15', node: 'capital', category: 'Node - Capital' },
  { id: 't-13', title: 'Megaphone: Anthem production milestone', owner: 'raamayan', status: 'in-progress', priority: 'high', deadline: '2026-05-01', node: 'megaphone', category: 'Node - Megaphone' },
  { id: 't-14', title: 'DECO framework v1 documentation', owner: 'fairman', status: 'todo', priority: 'high', deadline: '2026-05-30', node: 'capitalism2', category: 'Node - Cap 2.0' },
  { id: 't-15', title: 'Thesis of Change: Complete geoship criteria', owner: 'fairman', status: 'in-progress', priority: 'high', deadline: '2026-04-30', node: 'thesis', category: 'Node - Thesis' },

  // Governance & Culture
  { id: 't-16', title: 'Bi-weekly node sync calls established', owner: 'fairman', status: 'done', priority: 'high', deadline: '2026-03-15', category: 'Governance' },
  { id: 't-17', title: 'Women\'s Council charter drafted', owner: 'felicia', status: 'todo', priority: 'medium', deadline: '2026-05-01', category: 'Culture' },
  { id: 't-18', title: 'Pod facilitator training program', owner: 'dave', status: 'todo', priority: 'medium', deadline: '2026-05-15', category: 'Culture' },

  // Strategic
  { id: 't-19', title: 'CEO job description and search plan', owner: 'james', status: 'todo', priority: 'high', deadline: '2026-06-01', category: 'Strategy' },
  { id: 't-20', title: 'Family office outreach for $500K+ DAF', owner: 'james', status: 'in-progress', priority: 'critical', deadline: '2026-06-30', category: 'Financial' },
  { id: 't-21', title: 'Blue Spirit programming and agenda design', owner: 'sian', status: 'todo', priority: 'high', deadline: '2026-06-01', category: 'Events' },
];

// ─── Chat Channels ───

export const chatChannels: ChatChannel[] = [
  { id: 'general', name: 'General', description: 'Community-wide announcements and conversation', icon: 'Hash', unread: 3, lastMessage: '2 min ago' },
  { id: 'core-team', name: 'Core Team', description: 'Core team coordination and decisions', icon: 'Shield', unread: 7, lastMessage: '5 min ago' },
  { id: 'board', name: 'Board', description: 'Board governance discussions', icon: 'Crown', unread: 1, lastMessage: '1 hr ago' },
  { id: 'node-map', name: 'Node: Map', description: 'Map Node coordination and updates', icon: 'Globe', unread: 2, lastMessage: '30 min ago' },
  { id: 'node-bioregions', name: 'Node: Bioregions', description: 'Bioregions initiative updates', icon: 'TreePine', unread: 0, lastMessage: '3 hrs ago' },
  { id: 'node-capital', name: 'Node: Capital', description: 'Deal flow and investment discussions', icon: 'Gem', unread: 5, lastMessage: '15 min ago' },
  { id: 'node-megaphone', name: 'Node: Megaphone', description: 'Narrative and movement updates', icon: 'Megaphone', unread: 0, lastMessage: '1 day ago' },
  { id: 'events', name: 'Events', description: 'Event planning and logistics', icon: 'Calendar', unread: 4, lastMessage: '20 min ago' },
  { id: 'coherence', name: 'Coherence', description: 'Culture, practices, and inner work', icon: 'Heart', unread: 0, lastMessage: '2 hrs ago' },
  { id: 'random', name: 'Watercooler', description: 'Off-topic conversations and sharing', icon: 'Coffee', unread: 0, lastMessage: '4 hrs ago' },
];

// ─── Sample Chat Messages ───

export const chatMessages: ChatMessage[] = [
  { id: 'msg-1', channel: 'core-team', sender: 'James Hodges', senderAvatar: 'JH', message: 'Post-Cabo debrief: incredible energy. The Teal governance model is landing beautifully. Let\'s keep this momentum into Blue Spirit.', timestamp: '10:32 AM', reactions: [{ emoji: '🙏', count: 5 }, { emoji: '🔥', count: 3 }] },
  { id: 'msg-2', channel: 'core-team', sender: 'Sian Hodges', senderAvatar: 'SH', message: 'Cash forecast is coming together. We\'re tracking well against the $22-25K monthly burn target. Will share full doc by Friday.', timestamp: '10:45 AM', reactions: [{ emoji: '✅', count: 2 }] },
  { id: 'msg-3', channel: 'core-team', sender: 'Alex James Fairman', senderAvatar: 'AF', message: 'Map Node MVP specs almost ready. The coordination layer is going to be a game-changer for cross-node visibility. Think of it as our ecosystem nervous system.', timestamp: '11:02 AM', reactions: [{ emoji: '🧠', count: 4 }] },
  { id: 'msg-4', channel: 'node-capital', sender: 'Greg Berry', senderAvatar: 'GB', message: 'We have 8 deals in the pipeline. Narrowing to 5 finalists this week. Scoring rubric is solid — mission alignment + team + traction + scalability.', timestamp: '9:15 AM', reactions: [{ emoji: '💎', count: 3 }] },
  { id: 'msg-5', channel: 'node-capital', sender: 'James Hodges', senderAvatar: 'JH', message: 'Love the rigor, Greg. Let\'s make sure we have at least 3 ready for Blue Spirit presentations.', timestamp: '9:22 AM' },
  { id: 'msg-6', channel: 'general', sender: 'Raamayan Ananda', senderAvatar: 'RA', message: 'Anthem update: just wrapped a powerful studio session. The energy is building. This is going to be the cultural heartbeat of our movement.', timestamp: '2:30 PM', reactions: [{ emoji: '🎵', count: 7 }, { emoji: '❤️', count: 4 }] },
  { id: 'msg-7', channel: 'coherence', sender: 'Andrew', senderAvatar: 'AN', message: 'Reminder: coherence is not a destination, it\'s a practice. Our work begins with us. Wednesday breathwork circle at 7am MT.', timestamp: '8:00 AM', reactions: [{ emoji: '🌿', count: 6 }] },
  { id: 'msg-8', channel: 'events', sender: 'Sian Hodges', senderAvatar: 'SH', message: 'Blue Spirit registration landing page is in draft. Need final review by Fairman and James before we open April 15th.', timestamp: '3:15 PM', reactions: [{ emoji: '👀', count: 2 }] },
  { id: 'msg-9', channel: 'node-bioregions', sender: 'Gareth Hermann', senderAvatar: 'GH', message: 'Nicoya pilot update: met with local community leaders last week. They\'re excited about the partnership. Nosara School is on board for Phase 1.', timestamp: '11:30 AM', reactions: [{ emoji: '🌍', count: 5 }] },
  { id: 'msg-10', channel: 'board', sender: 'Dave Weale', senderAvatar: 'DW', message: 'Pod facilitation model is crystallizing. Proposing 6 pods: Purpose, Capital, Bioregion, Culture, Narrative, and Operations. Each with a trained facilitator.', timestamp: '4:00 PM', reactions: [{ emoji: '🎯', count: 3 }] },
];

// ─── Roadmap Phases ───

export const roadmapPhases = [
  {
    id: 'phase-1',
    name: 'Foundation',
    subtitle: 'Stabilize & Prove',
    timeline: 'Q1-Q2 2026',
    status: 'active' as const,
    milestones: [
      'Teal governance model adopted',
      'DAF structure operational',
      'Monthly burn stabilized at $22-25K',
      'Decision log system live',
      '65+ active well-stewards',
    ],
    color: 'amber',
  },
  {
    id: 'phase-2',
    name: 'Activation',
    subtitle: 'Blue Spirit & Beyond',
    timeline: 'Q3 2026',
    status: 'upcoming' as const,
    milestones: [
      'Blue Spirit 6.0 sells out',
      'All 6 nodes active with leads',
      '100+ well-stewards',
      'First 3 geoship projects funded',
      'CEO candidate in conversation',
    ],
    color: 'violet',
  },
  {
    id: 'phase-3',
    name: 'Scale',
    subtitle: 'Grow the Ecosystem',
    timeline: 'Q4 2026',
    status: 'planned' as const,
    milestones: [
      '144 well-stewards milestone',
      '$2M 2026 revenue target hit',
      'Map Node platform operational',
      'Nicoya pilot showing measurable impact',
      'CEO onboarded',
    ],
    color: 'emerald',
  },
  {
    id: 'phase-4',
    name: 'Deepen',
    subtitle: 'Institutional Roots',
    timeline: 'H1 2027',
    status: 'planned' as const,
    milestones: [
      'Bioregion model replicated to 2nd site',
      'Megaphone distribution at scale',
      '5+ funded projects with traction',
      'For-profit fund conversation (if warranted)',
      'Steward community self-organizing',
    ],
    color: 'sky',
  },
  {
    id: 'phase-5',
    name: 'Flourish',
    subtitle: 'The Root System Bears Fruit',
    timeline: 'H2 2027+',
    status: 'planned' as const,
    milestones: [
      '200+ well-stewards globally',
      'Multiple bioregions active',
      'For-profit spin-outs generating revenue',
      'Frequency model replicated by partners',
      'Thesis of Change impacting policy',
    ],
    color: 'rose',
  },
];

// ─── View Types ───

export type ViewType = 'dashboard' | 'team' | 'chat' | 'okrs' | 'tasks' | 'governance' | 'roadmap' | 'events' | 'nodes' | 'budget' | 'advisor' | 'leaderboard' | 'journal' | 'decisions' | 'agents';

export const viewTypes: ViewType[] = ['dashboard', 'team', 'chat', 'okrs', 'tasks', 'governance', 'roadmap', 'events', 'nodes', 'budget', 'advisor', 'leaderboard', 'journal', 'decisions', 'agents'];

// ─── Export PDF helper ───

export const exportPdf = async (element: HTMLElement, filename: string) => {
  const { default: html2canvas } = await import('html2canvas-pro');
  const canvas = await html2canvas(element, {
    backgroundColor: '#0b0d14',
    scale: 2,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
};
