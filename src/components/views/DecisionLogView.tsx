'use client';

import React, { useState, useMemo } from 'react';
import {
  Scale,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  X,
  Users,
  Calendar,
  Sparkles,
  FileText,
  AlertTriangle,
  Bot,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   Scoped Keyframes — prefixed with `dl-`
   ═══════════════════════════════════════════════════════════════════ */
const scopedKeyframes = `
@keyframes dl-fadeUp {
  0% { opacity: 0; transform: translateY(16px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dl-slideDown {
  0% { opacity: 0; max-height: 0; }
  100% { opacity: 1; max-height: 600px; }
}
@keyframes dl-countUp {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes dl-modalIn {
  0% { opacity: 0; transform: scale(0.95) translateY(12px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
`;

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

type Category = 'strategy' | 'governance' | 'financial' | 'membership' | 'node' | 'operations' | 'culture';
type Status = 'final' | 'pending' | 'reversed';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

interface Decision {
  id: string;
  title: string;
  category: Category;
  status: Status;
  date: string;
  decidedBy: string[];
  affectedMembers: string[];
  description: string;
  rationale: string;
  aiNote: string;
}

/* ═══════════════════════════════════════════════════════════════════
   Team Member Data
   ═══════════════════════════════════════════════════════════════════ */

const members: TeamMember[] = [
  { id: 'james', name: 'James', avatar: 'JH' },
  { id: 'sian', name: 'Sian', avatar: 'SH' },
  { id: 'fairman', name: 'Fairman', avatar: 'AF' },
  { id: 'max', name: 'Max', avatar: 'MX' },
  { id: 'dave', name: 'Dave', avatar: 'DW' },
  { id: 'andrew', name: 'Andrew', avatar: 'AN' },
  { id: 'felicia', name: 'Felicia', avatar: 'FI' },
  { id: 'mafe', name: 'Mafe', avatar: 'MF' },
  { id: 'colleen', name: 'Colleen', avatar: 'CG' },
  { id: 'greg', name: 'Greg', avatar: 'GB' },
  { id: 'gareth', name: 'Gareth', avatar: 'GH' },
  { id: 'raamayan', name: 'Raamayan', avatar: 'RA' },
  { id: 'sarah', name: 'Sarah', avatar: 'SS' },
  { id: 'nipun', name: 'Nipun', avatar: 'NP' },
];

const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

/* ═══════════════════════════════════════════════════════════════════
   Category & Status Configs
   ═══════════════════════════════════════════════════════════════════ */

const categoryConfig: Record<Category, { label: string; color: string; bg: string; border: string }> = {
  strategy:   { label: 'Strategy',   color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.12)', border: 'rgba(45, 212, 191, 0.3)' },
  governance: { label: 'Governance', color: '#e8b44c', bg: 'rgba(232, 180, 76, 0.12)',  border: 'rgba(232, 180, 76, 0.3)' },
  financial:  { label: 'Financial',  color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)',  border: 'rgba(52, 211, 153, 0.3)' },
  membership: { label: 'Membership', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.3)' },
  node:       { label: 'Node',       color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)',  border: 'rgba(139, 92, 246, 0.3)' },
  operations: { label: 'Operations', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)',  border: 'rgba(251, 146, 60, 0.3)' },
  culture:    { label: 'Culture',    color: '#f472b6', bg: 'rgba(244, 114, 182, 0.12)', border: 'rgba(244, 114, 182, 0.3)' },
};

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  final:    { label: 'Final',          color: '#6b8f71', bg: 'rgba(107, 143, 113, 0.15)', icon: CheckCircle2 },
  pending:  { label: 'Pending Review', color: '#e8b44c', bg: 'rgba(232, 180, 76, 0.15)',  icon: Clock },
  reversed: { label: 'Reversed',       color: '#e06060', bg: 'rgba(224, 96, 96, 0.15)',   icon: XCircle },
};

/* ═══════════════════════════════════════════════════════════════════
   Pre-populated Decisions
   ═══════════════════════════════════════════════════════════════════ */

const initialDecisions: Decision[] = [
  {
    id: 'd-001',
    title: 'Teal Governance Model Adopted',
    category: 'strategy',
    status: 'final',
    date: '2026-01-15',
    decidedBy: ['james', 'fairman', 'nipun'],
    affectedMembers: ['james', 'sian', 'fairman', 'dave', 'max', 'colleen', 'andrew'],
    description: 'Formally adopted the Teal governance model as Frequency Unite\'s operating philosophy. Moving beyond Green-stage consensus toward self-managing, purpose-driven governance where authority flows to competence and responsibility.',
    rationale: 'Consensus-based decision-making was slowing execution and creating decision bottlenecks. Teal allows distributed authority while maintaining coherence through shared purpose. Aligns with our thesis of regenerative systems that evolve beyond traditional hierarchies.',
    aiNote: 'This decision aligns with OKR-1 (Governance clarity). Consider establishing a Teal practices library by Q2 to support adoption across all nodes.',
  },
  {
    id: 'd-002',
    title: 'DAF Structure Approved',
    category: 'financial',
    status: 'final',
    date: '2026-01-18',
    decidedBy: ['james', 'colleen', 'fairman'],
    affectedMembers: ['james', 'colleen', 'fairman', 'greg', 'sian'],
    description: 'Approved the Donor-Advised Fund (DAF) structure as the primary philanthropic capital vehicle. This creates a tax-advantaged mechanism for channeling member contributions toward regenerative impact projects.',
    rationale: 'The DAF structure provides maximum tax efficiency for donors while giving Frequency Unite flexible deployment capability. It separates the capital pool from operational funds, creating cleaner governance and greater donor confidence.',
    aiNote: 'This decision aligns with OKR-3 (Capital infrastructure). The DECO Framework v1 should be finalized before first DAF deployment to ensure alignment with investment thesis.',
  },
  {
    id: 'd-003',
    title: 'Membership Pricing: $1,200/mo individual, $1,700/mo couple',
    category: 'membership',
    status: 'final',
    date: '2026-02-10',
    decidedBy: ['james', 'max', 'sian'],
    affectedMembers: ['max', 'sian', 'james', 'felicia', 'mafe'],
    description: 'Established individual membership at $1,200/month and couple membership at $1,700/month. Pricing reflects the premium stewardship community value proposition and covers operational costs plus investment in community infrastructure.',
    rationale: 'Pricing validated through enrollment conversations showing high-net-worth individuals see this as exceptional value relative to other communities. The couple discount at $1,700 (vs $2,400) incentivizes household participation while maintaining per-seat economics.',
    aiNote: 'Consider reviewing in 90 days against enrollment velocity data. If conversion rate falls below 40% of qualified leads, revisit pricing or packaging.',
  },
  {
    id: 'd-004',
    title: 'Two-Hemisphere Operating Model formalized',
    category: 'governance',
    status: 'final',
    date: '2026-01-20',
    decidedBy: ['james', 'fairman'],
    affectedMembers: ['james', 'sian', 'fairman', 'dave', 'andrew', 'colleen', 'gareth'],
    description: 'Formalized the Two-Hemisphere Operating Model. Right Side (Being/Nonprofit): culture, coherence, community, member care. Left Side (Doing/Capital): nodes, investments, operations, execution. Both hemispheres are honored and integrated through the Core Stewardship Team.',
    rationale: 'Separating being and doing prevents the typical startup failure mode of sacrificing culture for growth. It also creates clearer accountability structures and allows different leadership styles in each hemisphere.',
    aiNote: 'Strong alignment with Teal governance adoption. Recommend quarterly hemisphere health checks to ensure integration remains strong as team scales.',
  },
  {
    id: 'd-005',
    title: 'Blue Spirit July 2026 Confirmed',
    category: 'strategy',
    status: 'final',
    date: '2026-02-20',
    decidedBy: ['james', 'sian', 'fairman'],
    affectedMembers: ['james', 'sian', 'fairman', 'mafe', 'felicia', 'max', 'dave'],
    description: 'Confirmed the Blue Spirit retreat in Costa Rica for July 2026 as the flagship gathering. This serves as both a transformational member experience and a strategic inflection point for the community.',
    rationale: 'Blue Spirit creates the immersive container needed to deepen relationships, align on vision, and catalyze the next phase of growth. Timing allows sufficient runway for enrollment to hit 50+ member target. Costa Rica location aligns with the Nicoya Blue Zone node strategy.',
    aiNote: 'This decision aligns with OKR-2 (Community activation). Ensure event logistics are locked by April to allow 3-month member preparation window.',
  },
  {
    id: 'd-006',
    title: 'CEO Search Post-Blue Spirit',
    category: 'strategy',
    status: 'final',
    date: '2026-02-20',
    decidedBy: ['james', 'fairman', 'nipun'],
    affectedMembers: ['james', 'sian', 'fairman', 'dave', 'colleen'],
    description: 'Determined that the CEO search process will commence after the Blue Spirit retreat in July 2026. The CEO will be the operational leader of the Doing hemisphere, reporting to the Board and working in partnership with the Founder.',
    rationale: 'Launching a CEO search now would be premature. The Blue Spirit retreat will crystallize the role requirements and allow potential internal candidates to demonstrate readiness. Post-retreat clarity enables a more targeted search with better cultural fit assessment.',
    aiNote: 'Consider defining CEO criteria document by May 2026. The 90-day search window post-Blue Spirit aligns with typical executive search timelines for a Q4 start.',
  },
  {
    id: 'd-007',
    title: 'Node Lead Accountability Framework',
    category: 'governance',
    status: 'final',
    date: '2026-02-25',
    decidedBy: ['james', 'dave', 'fairman'],
    affectedMembers: ['dave', 'andrew', 'gareth', 'greg', 'raamayan', 'sarah'],
    description: 'Established the accountability framework for Node Leads including quarterly OKR reporting, monthly check-ins with Core Stewardship, and clear authority boundaries for autonomous decision-making within their domain.',
    rationale: 'Node Leads need both clear authority and clear accountability. Without a framework, node autonomy can drift into disconnection from the broader mission. This creates the guardrails that enable genuine sovereignty.',
    aiNote: 'This decision aligns with OKR-1 (Governance clarity) and the Teal model adoption. First quarterly review cycle should include a retrospective on the framework itself.',
  },
  {
    id: 'd-008',
    title: '6 Pod Structure Proposed',
    category: 'culture',
    status: 'pending',
    date: '2026-03-01',
    decidedBy: ['dave', 'james'],
    affectedMembers: ['dave', 'james', 'sian', 'fairman', 'max', 'felicia', 'mafe', 'andrew'],
    description: 'Proposed organizing the steward community into 6 thematic pods for deeper connection: Wellness, Wealth, Wisdom, Wonder, Work, and World. Each pod would meet bi-weekly with a rotating facilitator.',
    rationale: 'As membership scales past 30, the full-group dynamic becomes too large for genuine intimacy. Pods create smaller containers for vulnerability and mutual support while the full community gathers monthly.',
    aiNote: 'Pending review by Wisdom Council. Consider piloting with 2-3 pods before full rollout. Pod structure should integrate with existing node structure to avoid organizational complexity.',
  },
  {
    id: 'd-009',
    title: 'DECO Framework v1 for DAF Deployment',
    category: 'financial',
    status: 'pending',
    date: '2026-03-05',
    decidedBy: ['fairman', 'james', 'colleen'],
    affectedMembers: ['fairman', 'colleen', 'james', 'greg', 'gareth'],
    description: 'The DECO (Decentralized Capital Operations) Framework v1 outlines the criteria, process, and governance for deploying capital from the DAF into regenerative impact projects. Includes deal sourcing, diligence, voting, and impact measurement.',
    rationale: 'With the DAF structure approved, a clear deployment framework is needed before first capital allocation. DECO creates transparent, repeatable processes that build donor trust while enabling rapid deployment to high-impact opportunities.',
    aiNote: 'Pending final review. This should be ratified before Q2 DAF deployment targets. Consider adding an impact measurement rubric aligned with the UN SDGs or Doughnut Economics framework.',
  },
  {
    id: 'd-010',
    title: 'Nicoya Blue Zone Pilot Phase 1',
    category: 'node',
    status: 'final',
    date: '2026-02-15',
    decidedBy: ['james', 'fairman', 'mafe'],
    affectedMembers: ['mafe', 'james', 'fairman', 'sian', 'raamayan'],
    description: 'Approved Phase 1 of the Nicoya Blue Zone node pilot in Costa Rica. Includes site identification, local partnership development, and a 90-day exploration sprint to validate the node model in a Blue Zone context.',
    rationale: 'Nicoya represents a natural alignment between Frequency Unite\'s regenerative mission and a proven longevity/wellness ecosystem. Starting with a pilot phase manages risk while building the playbook for future node launches.',
    aiNote: 'This decision aligns with OKR-4 (Node expansion). Phase 1 completion timeline should align with Blue Spirit in July to showcase progress to members.',
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function DecisionLogView() {
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New decision form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('strategy');
  const [newDecidedBy, setNewDecidedBy] = useState<string[]>([]);
  const [newAffected, setNewAffected] = useState<string[]>([]);
  const [newRationale, setNewRationale] = useState('');

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let result = [...decisions];
    if (categoryFilter !== 'all') result = result.filter((d) => d.category === categoryFilter);
    if (statusFilter !== 'all') result = result.filter((d) => d.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.rationale.toLowerCase().includes(q)
      );
    }
    return result;
  }, [decisions, categoryFilter, statusFilter, searchQuery]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    return {
      total: decisions.length,
      final: decisions.filter((d) => d.status === 'final').length,
      pending: decisions.filter((d) => d.status === 'pending').length,
      thisQuarter: decisions.filter((d) => new Date(d.date) >= quarterStart).length,
    };
  }, [decisions]);

  /* ── Add Decision ── */
  const handleAddDecision = () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    const decision: Decision = {
      id: `d-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      decidedBy: newDecidedBy.length > 0 ? newDecidedBy : ['james'],
      affectedMembers: newAffected,
      description: newDescription,
      rationale: newRationale || 'Rationale to be documented.',
      aiNote: 'New decision — AI analysis will be generated after next sync.',
    };
    setDecisions((prev) => [decision, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setNewCategory('strategy');
    setNewDecidedBy([]);
    setNewAffected([]);
    setNewRationale('');
    setShowAddForm(false);
  };

  const toggleMember = (list: string[], setList: (v: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((m) => m !== id) : [...list, id]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /* ═══════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{scopedKeyframes}</style>

      <div className="space-y-6 pb-12 scrollbar-autohide">
        {/* ── Header ── */}
        <div className="noise-overlay dot-pattern" style={{ animation: 'dl-fadeUp 0.5s ease-out both' }}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 44,
                  height: 44,
                  background: 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(139,92,246,0.15))',
                  border: '1px solid rgba(212,165,116,0.2)',
                }}
              >
                <Scale size={22} style={{ color: '#d4a574' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-glow" style={{ color: '#f0ebe4' }}>
                  Decision Log
                </h1>
                <p className="text-sm mt-0.5" style={{ color: '#a09888' }}>
                  Institutional memory — every decision captured, every rationale preserved
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(212,165,116,0.1))',
                border: '1px solid rgba(212,165,116,0.3)',
                color: '#d4a574',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,165,116,0.3), rgba(212,165,116,0.15))';
                e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(212,165,116,0.1))';
                e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)';
              }}
            >
              <Plus size={16} />
              New Decision
            </button>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Total Decisions', value: stats.total, color: '#d4a574' },
              { label: 'Final', value: stats.final, color: '#6b8f71' },
              { label: 'Pending Review', value: stats.pending, color: '#e8b44c' },
              { label: 'This Quarter', value: stats.thisQuarter, color: '#8b5cf6' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="glass glass-hover card-stat rounded-xl px-4 py-3"
                style={{ animation: `dl-countUp 0.5s ease-out ${i * 0.08}s both` }}
              >
                <div className="text-xs font-medium mb-1" style={{ color: '#6b6358' }}>
                  {stat.label}
                </div>
                <div className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filters ── */}
        <div
          className="space-y-3"
          style={{ animation: 'dl-fadeUp 0.5s ease-out 0.15s both' }}
        >
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-[0_0_12px_rgba(212,165,116,0.15)]"
              style={{
                background: categoryFilter === 'all' ? 'rgba(212,165,116,0.2)' : 'rgba(19,23,32,0.6)',
                border: `1px solid ${categoryFilter === 'all' ? 'rgba(212,165,116,0.4)' : 'rgba(30,38,56,0.8)'}`,
                color: categoryFilter === 'all' ? '#d4a574' : '#6b6358',
              }}
            >
              All
            </button>
            {(Object.keys(categoryConfig) as Category[]).map((cat) => {
              const cfg = categoryConfig[cat];
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(active ? 'all' : cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-[0_0_12px_rgba(212,165,116,0.15)]"
                  style={{
                    background: active ? cfg.bg : 'rgba(19,23,32,0.6)',
                    border: `1px solid ${active ? cfg.border : 'rgba(30,38,56,0.8)'}`,
                    color: active ? cfg.color : '#6b6358',
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Status + Search row */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                style={{
                  background: statusFilter === 'all' ? 'rgba(212,165,116,0.15)' : 'transparent',
                  border: `1px solid ${statusFilter === 'all' ? 'rgba(212,165,116,0.3)' : 'rgba(30,38,56,0.6)'}`,
                  color: statusFilter === 'all' ? '#d4a574' : '#6b6358',
                }}
              >
                All
              </button>
              {(Object.keys(statusConfig) as Status[]).map((st) => {
                const cfg = statusConfig[st];
                const active = statusFilter === st;
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(active ? 'all' : st)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    style={{
                      background: active ? cfg.bg : 'transparent',
                      border: `1px solid ${active ? `${cfg.color}44` : 'rgba(30,38,56,0.6)'}`,
                      color: active ? cfg.color : '#6b6358',
                    }}
                  >
                    <cfg.icon size={12} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1" />

            {/* Search */}
            <div className="relative" style={{ minWidth: 220 }}>
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#6b6358' }}
              />
              <input
                type="text"
                placeholder="Search decisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgba(19,23,32,0.7)',
                  border: '1px solid rgba(30,38,56,0.8)',
                  color: '#f0ebe4',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(30,38,56,0.8)';
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Decision Cards ── */}
        <div className="space-y-3 scrollbar-autohide">
          {filtered.length === 0 && (
            <div
              className="glass rounded-xl px-6 py-12 text-center"
              style={{ animation: 'dl-fadeUp 0.4s ease-out both' }}
            >
              <FileText size={32} className="mx-auto mb-3" style={{ color: '#6b6358' }} />
              <p className="text-sm" style={{ color: '#a09888' }}>
                No decisions match the current filters.
              </p>
            </div>
          )}

          {filtered.map((decision, idx) => {
            const catCfg = categoryConfig[decision.category];
            const stCfg = statusConfig[decision.status];
            const StIcon = stCfg.icon;
            const expanded = expandedId === decision.id;

            return (
              <div
                key={decision.id}
                className="glass glass-hover card-interactive rounded-xl overflow-hidden card-hover-lift"
                style={{
                  animation: `dl-fadeUp 0.4s ease-out ${idx * 0.05}s both`,
                  borderLeft: `3px solid ${catCfg.color}`,
                }}
              >
                {/* Card Header — always visible */}
                <button
                  onClick={() => setExpandedId(expanded ? null : decision.id)}
                  className="w-full text-left px-5 py-4 cursor-pointer"
                  style={{ background: 'transparent', border: 'none' }}
                >
                  <div className="flex items-center gap-3">
                    {/* Title + Badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="text-sm font-semibold truncate" style={{ color: '#f0ebe4' }}>
                          {decision.title}
                        </h3>
                        {/* Category badge */}
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                          style={{
                            background: catCfg.bg,
                            color: catCfg.color,
                            border: `1px solid ${catCfg.border}`,
                          }}
                        >
                          {catCfg.label}
                        </span>
                        {/* Status badge */}
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                          style={{
                            background: stCfg.bg,
                            color: stCfg.color,
                          }}
                        >
                          <StIcon size={10} />
                          {stCfg.label}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-xs" style={{ color: '#6b6358' }}>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(decision.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={11} />
                          <span style={{ color: '#a09888' }}>
                            {decision.decidedBy.map((id) => memberMap[id]?.name ?? id).join(', ')}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Affected avatars */}
                    <div className="flex items-center -space-x-2 mr-2">
                      {decision.affectedMembers.slice(0, 5).map((id) => {
                        const m = memberMap[id];
                        if (!m) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-center rounded-full text-[9px] font-bold"
                            style={{
                              width: 26,
                              height: 26,
                              background: 'rgba(212,165,116,0.15)',
                              border: '2px solid rgba(19,23,32,0.9)',
                              color: '#d4a574',
                            }}
                            title={m.name}
                          >
                            {m.avatar}
                          </div>
                        );
                      })}
                      {decision.affectedMembers.length > 5 && (
                        <div
                          className="flex items-center justify-center rounded-full text-[9px] font-bold"
                          style={{
                            width: 26,
                            height: 26,
                            background: 'rgba(139,92,246,0.15)',
                            border: '2px solid rgba(19,23,32,0.9)',
                            color: '#a78bfa',
                          }}
                        >
                          +{decision.affectedMembers.length - 5}
                        </div>
                      )}
                    </div>

                    {/* Expand chevron */}
                    <div
                      className="transition-transform duration-300"
                      style={{
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: '#6b6358',
                      }}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </button>

                {/* Expanded Detail */}
                {expanded && (
                  <div
                    className="px-5 pb-5 space-y-4"
                    style={{
                      animation: 'dl-slideDown 0.3s ease-out both',
                      borderTop: '1px solid rgba(30,38,56,0.6)',
                    }}
                  >
                    <div className="pt-4" />

                    {/* Description */}
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b6358' }}>
                        Description
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#a09888' }}>
                        {decision.description}
                      </p>
                    </div>

                    {/* Rationale — highlighted */}
                    <div
                      className="rounded-lg px-4 py-3 gradient-border"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212,165,116,0.08), rgba(139,92,246,0.05))',
                        border: '1px solid rgba(212,165,116,0.12)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={13} style={{ color: '#d4a574' }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#d4a574' }}>
                          Rationale
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#c4b5a0' }}>
                        {decision.rationale}
                      </p>
                    </div>

                    {/* Affected Parties */}
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b6358' }}>
                        Affected Parties
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {decision.affectedMembers.map((id) => {
                          const m = memberMap[id];
                          if (!m) return null;
                          return (
                            <div
                              key={id}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                              style={{
                                background: 'rgba(212,165,116,0.08)',
                                border: '1px solid rgba(212,165,116,0.15)',
                                color: '#a09888',
                              }}
                            >
                              <div
                                className="flex items-center justify-center rounded-full text-[8px] font-bold"
                                style={{
                                  width: 20,
                                  height: 20,
                                  background: 'rgba(212,165,116,0.2)',
                                  color: '#d4a574',
                                }}
                              >
                                {m.avatar}
                              </div>
                              {m.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div
                      className="rounded-lg px-4 py-3 gradient-border"
                      style={{
                        background: 'rgba(139,92,246,0.06)',
                        border: '1px solid rgba(139,92,246,0.12)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Bot size={13} style={{ color: '#a78bfa' }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                          AI Analysis
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#8b8597' }}>
                        {decision.aiNote}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         Add New Decision Modal
         ═══════════════════════════════════════════════════════════════ */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <div
            className="w-full rounded-2xl overflow-hidden scrollbar-autohide card-premium"
            style={{
              maxWidth: 600,
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'rgba(19,23,32,0.95)',
              border: '1px solid rgba(212,165,116,0.15)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(212,165,116,0.05)',
              animation: 'dl-modalIn 0.3s ease-out both',
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(30,38,56,0.6)' }}
            >
              <div className="flex items-center gap-2.5">
                <Scale size={18} style={{ color: '#d4a574' }} />
                <h2 className="text-base font-semibold" style={{ color: '#f0ebe4' }}>
                  Record New Decision
                </h2>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
                style={{ color: '#6b6358' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(224,96,96,0.15)';
                  e.currentTarget.style.color = '#e06060';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b6358';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b6358' }}>
                  Decision Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Annual Retreat Location Confirmed"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(11,13,20,0.6)',
                    border: '1px solid rgba(30,38,56,0.8)',
                    color: '#f0ebe4',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(30,38,56,0.8)')}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b6358' }}>
                  Description
                </label>
                <textarea
                  placeholder="Describe the decision and its context..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none transition-all duration-200"
                  style={{
                    background: 'rgba(11,13,20,0.6)',
                    border: '1px solid rgba(30,38,56,0.8)',
                    color: '#f0ebe4',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(30,38,56,0.8)')}
                />
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b6358' }}>
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(categoryConfig) as Category[]).map((cat) => {
                    const cfg = categoryConfig[cat];
                    const active = newCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setNewCategory(cat)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
                        style={{
                          background: active ? cfg.bg : 'rgba(11,13,20,0.6)',
                          border: `1px solid ${active ? cfg.border : 'rgba(30,38,56,0.6)'}`,
                          color: active ? cfg.color : '#6b6358',
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Decided By */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b6358' }}>
                  Decided By
                </label>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => {
                    const active = newDecidedBy.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleMember(newDecidedBy, setNewDecidedBy, m.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
                        style={{
                          background: active ? 'rgba(212,165,116,0.15)' : 'rgba(11,13,20,0.6)',
                          border: `1px solid ${active ? 'rgba(212,165,116,0.3)' : 'rgba(30,38,56,0.6)'}`,
                          color: active ? '#d4a574' : '#6b6358',
                        }}
                      >
                        <span
                          className="flex items-center justify-center rounded-full text-[8px] font-bold"
                          style={{
                            width: 18,
                            height: 18,
                            background: active ? 'rgba(212,165,116,0.25)' : 'rgba(30,38,56,0.5)',
                            color: active ? '#d4a574' : '#6b6358',
                          }}
                        >
                          {m.avatar}
                        </span>
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Affected Members */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b6358' }}>
                  Affected Members
                </label>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => {
                    const active = newAffected.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleMember(newAffected, setNewAffected, m.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
                        style={{
                          background: active ? 'rgba(139,92,246,0.15)' : 'rgba(11,13,20,0.6)',
                          border: `1px solid ${active ? 'rgba(139,92,246,0.25)' : 'rgba(30,38,56,0.6)'}`,
                          color: active ? '#a78bfa' : '#6b6358',
                        }}
                      >
                        <span
                          className="flex items-center justify-center rounded-full text-[8px] font-bold"
                          style={{
                            width: 18,
                            height: 18,
                            background: active ? 'rgba(139,92,246,0.25)' : 'rgba(30,38,56,0.5)',
                            color: active ? '#a78bfa' : '#6b6358',
                          }}
                        >
                          {m.avatar}
                        </span>
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rationale */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b6358' }}>
                  Rationale
                </label>
                <textarea
                  placeholder="Why was this decision made? What was the reasoning?"
                  value={newRationale}
                  onChange={(e) => setNewRationale(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none transition-all duration-200"
                  style={{
                    background: 'rgba(11,13,20,0.6)',
                    border: '1px solid rgba(30,38,56,0.8)',
                    color: '#f0ebe4',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(30,38,56,0.8)')}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4"
              style={{ borderTop: '1px solid rgba(30,38,56,0.6)' }}
            >
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(30,38,56,0.8)',
                  color: '#6b6358',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(107,99,88,0.4)';
                  e.currentTarget.style.color = '#a09888';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(30,38,56,0.8)';
                  e.currentTarget.style.color = '#6b6358';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddDecision}
                disabled={!newTitle.trim() || !newDescription.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background:
                    newTitle.trim() && newDescription.trim()
                      ? 'linear-gradient(135deg, rgba(212,165,116,0.3), rgba(212,165,116,0.15))'
                      : 'rgba(30,38,56,0.4)',
                  border: `1px solid ${
                    newTitle.trim() && newDescription.trim()
                      ? 'rgba(212,165,116,0.4)'
                      : 'rgba(30,38,56,0.6)'
                  }`,
                  color:
                    newTitle.trim() && newDescription.trim() ? '#d4a574' : '#4a4540',
                  opacity: newTitle.trim() && newDescription.trim() ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (newTitle.trim() && newDescription.trim()) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,165,116,0.4), rgba(212,165,116,0.2))';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(212,165,116,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newTitle.trim() && newDescription.trim()) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,165,116,0.3), rgba(212,165,116,0.15))';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <Scale size={14} />
                Record Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
