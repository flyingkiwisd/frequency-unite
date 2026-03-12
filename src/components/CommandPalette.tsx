'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Users,
  Network,
  Target,
  LayoutDashboard,
  CheckSquare,
  Map,
  MessageCircle,
  Calendar,
  TrendingUp,
  ArrowRight,
  Command,
  Scale,
  Wallet,
  Sparkles,
  Trophy,
  SearchX,
  Clock,
  X,
} from 'lucide-react';
import { teamMembers, nodes, okrs, kpis } from '@/lib/data';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

interface SearchResult {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description?: string;
  category: 'Recent' | 'Team' | 'Nodes' | 'OKRs' | 'KPIs' | 'Navigation';
  action: string;
}

const RECENT_SEARCHES_KEY = 'frequency-unite-recent-searches';
const MAX_RECENT = 5;

function getRecentSearches(): { query: string; action: string; title: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(entry: { query: string; action: string; title: string }) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentSearches();
    // Remove duplicate if exists
    const filtered = existing.filter(e => e.title !== entry.title);
    const updated = [entry, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail
  }
}

function clearRecentSearches() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Silently fail
  }
}

const navigationItems: SearchResult[] = [
  { id: 'nav-dashboard', icon: <LayoutDashboard className="w-4 h-4" />, title: 'Dashboard', subtitle: 'Navigation', description: 'Your personal command center with key metrics, activity feed, and quick actions', category: 'Navigation', action: 'dashboard' },
  { id: 'nav-team', icon: <Users className="w-4 h-4" />, title: 'Team', subtitle: 'Navigation', description: 'Core team members, board advisors, and node leads with roles and status', category: 'Navigation', action: 'team' },
  { id: 'nav-chat', icon: <MessageCircle className="w-4 h-4" />, title: 'Chat', subtitle: 'Navigation', description: 'Real-time team communication channels and direct messaging', category: 'Navigation', action: 'chat' },
  { id: 'nav-okrs', icon: <Target className="w-4 h-4" />, title: 'OKRs & KPIs', subtitle: 'Navigation', description: 'Track objectives, key results, and performance indicators across all nodes', category: 'Navigation', action: 'okrs' },
  { id: 'nav-tasks', icon: <CheckSquare className="w-4 h-4" />, title: 'Tasks', subtitle: 'Navigation', description: '90-day action plan with assignments, priorities, and progress tracking', category: 'Navigation', action: 'tasks' },
  { id: 'nav-governance', icon: <Scale className="w-4 h-4" />, title: 'Governance', subtitle: 'Navigation', description: 'Decisions, policies, council records, and voting history', category: 'Navigation', action: 'governance' },
  { id: 'nav-roadmap', icon: <Map className="w-4 h-4" />, title: 'Roadmap', subtitle: 'Navigation', description: 'Strategic phases, milestones, and long-term planning timeline', category: 'Navigation', action: 'roadmap' },
  { id: 'nav-events', icon: <Calendar className="w-4 h-4" />, title: 'Events', subtitle: 'Navigation', description: 'Upcoming gatherings, retreats, and community events', category: 'Navigation', action: 'events' },
  { id: 'nav-nodes', icon: <Network className="w-4 h-4" />, title: 'Nodes', subtitle: 'Navigation', description: 'Node ecosystem overview with health metrics and progress', category: 'Navigation', action: 'nodes' },
  { id: 'nav-budget', icon: <Wallet className="w-4 h-4" />, title: 'Budget', subtitle: 'Navigation', description: 'Financial overview, expense tracking, and budget allocations', category: 'Navigation', action: 'budget' },
  { id: 'nav-leaderboard', icon: <Trophy className="w-4 h-4" />, title: 'Leaderboard', subtitle: 'Navigation', description: 'Team performance rankings and accountability scores', category: 'Navigation', action: 'leaderboard' },
  { id: 'nav-advisor', icon: <Sparkles className="w-4 h-4" />, title: 'AI Advisor', subtitle: 'Navigation', description: 'Frequency Advisory Board with 8 specialized AI agents', category: 'Navigation', action: 'advisor' },
];

const categoryOrder: SearchResult['category'][] = ['Recent', 'Navigation', 'Team', 'Nodes', 'OKRs', 'KPIs'];

const categoryIcons: Record<SearchResult['category'], React.ReactNode> = {
  Recent: <Clock className="w-3 h-3" />,
  Navigation: <ArrowRight className="w-3 h-3" />,
  Team: <Users className="w-3 h-3" />,
  Nodes: <Network className="w-3 h-3" />,
  OKRs: <Target className="w-3 h-3" />,
  KPIs: <TrendingUp className="w-3 h-3" />,
};

const placeholderHints = [
  'Search for a team member...',
  'Navigate to Dashboard...',
  'Find an OKR or KPI...',
  'Jump to a node...',
  'Open Tasks or Roadmap...',
  'Search anything...',
];

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{ query: string; action: string; title: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
    }
  }, [isOpen]);

  const allResults = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];
    teamMembers.forEach((member) => {
      results.push({ id: `team-${member.id}`, icon: <Users className="w-4 h-4" />, title: member.name, subtitle: member.role, description: `${member.role} — ${member.status === 'active' ? 'Active' : 'Inactive'} team member`, category: 'Team', action: 'team' });
    });
    nodes.forEach((node) => {
      results.push({ id: `node-${node.id}`, icon: <Network className="w-4 h-4" />, title: node.name, subtitle: `Node`, description: node.purpose.slice(0, 80), category: 'Nodes', action: 'nodes' });
    });
    okrs.forEach((okr) => {
      results.push({ id: `okr-${okr.id}`, icon: <Target className="w-4 h-4" />, title: okr.objective.slice(0, 50) + (okr.objective.length > 50 ? '...' : ''), subtitle: `${okr.quarter} · ${okr.status.replace('-', ' ')}`, description: `Objective with ${okr.keyResults?.length ?? 0} key results — ${okr.status.replace('-', ' ')}`, category: 'OKRs', action: 'okrs' });
    });
    kpis.forEach((kpi) => {
      results.push({ id: `kpi-${kpi.id}`, icon: <TrendingUp className="w-4 h-4" />, title: kpi.name, subtitle: `${kpi.value} / ${kpi.target}`, description: `${kpi.category} metric — current: ${kpi.value}, target: ${kpi.target}`, category: 'KPIs', action: 'okrs' });
    });
    return results;
  }, []);

  const filteredResults = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();

    // When no query, show recent searches + navigation items
    if (!q) {
      const results: SearchResult[] = [];

      // Add recent searches as a category
      if (recentSearches.length > 0) {
        recentSearches.forEach((recent, idx) => {
          results.push({
            id: `recent-${idx}`,
            icon: <Clock className="w-4 h-4" />,
            title: recent.title,
            subtitle: `Searched recently`,
            description: `Jump back to ${recent.title}`,
            category: 'Recent',
            action: recent.action,
          });
        });
      }

      results.push(...navigationItems);
      return results;
    }

    const matched: SearchResult[] = [];
    navigationItems.forEach((item) => {
      if (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q))) matched.push(item);
    });
    allResults.forEach((item) => {
      if (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q))) matched.push(item);
    });
    return matched;
  }, [query, allResults, recentSearches]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    categoryOrder.forEach((cat) => {
      const items = filteredResults.filter((r) => r.category === cat);
      if (items.length > 0) groups[cat] = items;
    });
    return groups;
  }, [filteredResults]);

  const flatResults = useMemo(() => {
    const flat: SearchResult[] = [];
    categoryOrder.forEach((cat) => { if (groupedResults[cat]) flat.push(...groupedResults[cat]); });
    return flat;
  }, [groupedResults]);

  // Cycle placeholder hints
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((p) => (p + 1) % placeholderHints.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Show keyboard hints after a short delay
  useEffect(() => {
    if (isOpen) {
      setShowHints(false);
      const t = setTimeout(() => setShowHints(true), 300);
      return () => clearTimeout(t);
    } else {
      setShowHints(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setIsClosing(false);
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => { inputRef.current?.focus(); });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!resultsRef.current) return;
    const el = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  // Typing pulse tracker
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 400);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsAnimating(false);
      onClose();
    }, 180);
  }, [onClose]);

  const handleSelect = useCallback((result: SearchResult) => {
    // Save to recent searches (skip if it's already a recent item)
    if (result.category !== 'Recent') {
      saveRecentSearch({ query: query || result.title, action: result.action, title: result.title });
    }
    onNavigate(result.action);
    handleClose();
  }, [onNavigate, handleClose, query]);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setSelectedIndex((p) => p < flatResults.length - 1 ? p + 1 : 0); break;
      case 'ArrowUp': e.preventDefault(); setSelectedIndex((p) => p > 0 ? p - 1 : flatResults.length - 1); break;
      case 'Enter': e.preventDefault(); if (flatResults[selectedIndex]) handleSelect(flatResults[selectedIndex]); break;
      case 'Escape': e.preventDefault(); handleClose(); break;
    }
  }, [flatResults, selectedIndex, handleSelect, handleClose]);

  if (!isOpen && !isAnimating) return null;

  const isVisible = isOpen && !isClosing;

  return (
    <>
      <style>{`
        @keyframes paletteScaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes paletteScaleOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.92); }
        }
        @keyframes resultFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes searchGlow {
          0%, 100% { box-shadow: 0 1px 0 0 rgba(212,165,116,0.3); }
          50% { box-shadow: 0 2px 0 0 rgba(212,165,116,0.7); }
        }
        @keyframes searchIconPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        @keyframes noResultsBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes hintFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        @keyframes backdropIn {
          from { backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); background-color: rgba(0,0,0,0); }
          to { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); background-color: rgba(0,0,0,0.65); }
        }
        @keyframes backdropOut {
          from { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); background-color: rgba(0,0,0,0.65); }
          to { backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); background-color: rgba(0,0,0,0); }
        }
        @keyframes placeholderFade {
          0% { opacity: 0; transform: translateY(4px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        @keyframes hintsReveal {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes outerGlow {
          0%, 100% { box-shadow: 0 0 40px 2px rgba(212,165,116,0.06), 0 0 80px 4px rgba(212,165,116,0.03), 0 25px 50px -12px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 50px 4px rgba(212,165,116,0.09), 0 0 100px 8px rgba(212,165,116,0.04), 0 25px 50px -12px rgba(0,0,0,0.5); }
        }
        @keyframes recentClearHover {
          from { transform: rotate(0); }
          to { transform: rotate(90deg); }
        }
        .cp-backdrop-in {
          animation: backdropIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .cp-backdrop-out {
          animation: backdropOut 180ms ease-out forwards;
          pointer-events: none;
        }
        .cp-palette-in {
          animation: paletteScaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center center;
        }
        .cp-palette-out {
          animation: paletteScaleOut 180ms ease-out forwards;
          transform-origin: center center;
        }
        .cp-result-item {
          animation: resultFadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .cp-search-glow {
          animation: searchGlow 2s ease-in-out infinite;
        }
        .cp-icon-pulse {
          animation: searchIconPulse 0.6s ease-in-out infinite;
        }
        .cp-no-results-bob {
          animation: noResultsBob 2.5s ease-in-out infinite;
        }
        .cp-hint-float {
          animation: hintFloat 3s ease-in-out infinite;
        }
        .cp-hints-reveal {
          animation: hintsReveal 300ms ease-out forwards;
        }
        .cp-outer-glow {
          animation: outerGlow 4s ease-in-out infinite;
        }
        .cp-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .cp-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .cp-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212,165,116,0.15);
          border-radius: 3px;
        }
        .cp-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212,165,116,0.3);
        }
        .cp-clear-recent:hover {
          color: #d4a574 !important;
          background: rgba(212, 165, 116, 0.08) !important;
        }
        .cp-clear-recent:hover .cp-clear-icon {
          transform: rotate(90deg);
        }
        .cp-clear-icon {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
      <div
        className={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] ${isVisible ? 'cp-backdrop-in' : 'cp-backdrop-out'}`}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        onAnimationEnd={() => { if (!isOpen && isClosing) { setIsAnimating(false); setIsClosing(false); } }}
      >
        <div
          className={`w-full max-w-2xl mx-4 overflow-hidden ${isVisible ? 'cp-palette-in' : 'cp-palette-out'} cp-outer-glow`}
          style={{
            background: 'rgba(19, 23, 32, 0.97)',
            borderRadius: '20px',
            border: '1px solid rgba(212, 165, 116, 0.12)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
          onKeyDown={handleKeyDown}
          onAnimationEnd={(e) => { if (!isOpen) { e.stopPropagation(); setIsAnimating(false); setIsClosing(false); } }}
        >
          {/* Search Input Area */}
          <div
            className="relative px-5 py-2"
            style={{ borderBottom: '1px solid rgba(212, 165, 116, 0.1)' }}
          >
            <div
              className="flex items-center gap-3 rounded-xl px-4"
              style={{
                height: '56px',
                background: 'rgba(11, 13, 20, 0.5)',
                border: '1px solid rgba(212, 165, 116, 0.1)',
                boxShadow: isTyping
                  ? '0 0 0 2px rgba(212, 165, 116, 0.15), 0 0 20px rgba(212, 165, 116, 0.06)'
                  : '0 0 0 1px rgba(212, 165, 116, 0.05)',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                borderColor: isTyping ? 'rgba(212, 165, 116, 0.25)' : 'rgba(212, 165, 116, 0.1)',
              }}
            >
              <div className={`flex-shrink-0 ${isTyping ? 'cp-icon-pulse' : ''}`} style={{ transition: 'transform 0.2s ease' }}>
                <Search
                  className="w-5 h-5"
                  style={{
                    color: isTyping ? '#d4a574' : 'rgba(255,255,255,0.35)',
                    transition: 'color 0.2s ease',
                  }}
                />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder={placeholderHints[placeholderIndex]}
                className="flex-1 bg-transparent outline-none"
                style={{
                  color: '#e2e0dc',
                  fontSize: '17px',
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  height: '48px',
                  caretColor: '#d4a574',
                }}
                autoComplete="off"
                spellCheck={false}
              />
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                style={{
                  background: 'rgba(212, 165, 116, 0.06)',
                  border: '1px solid rgba(212, 165, 116, 0.1)',
                }}
              >
                <Command className="w-3 h-3" style={{ color: 'rgba(212, 165, 116, 0.5)' }} />
                <span style={{ color: 'rgba(212, 165, 116, 0.5)', fontSize: '11px', fontFamily: 'ui-monospace, monospace' }}>K</span>
              </div>
            </div>
            {/* Glowing underline */}
            <div
              className="cp-search-glow"
              style={{
                position: 'absolute',
                bottom: 0,
                left: '20px',
                right: '20px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(212,165,116,0.5), transparent)',
              }}
            />
          </div>

          {/* Results List */}
          <div
            ref={resultsRef}
            className="cp-scrollbar overflow-y-auto py-2"
            style={{ maxHeight: '420px' }}
          >
            {flatResults.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <div className="cp-no-results-bob inline-block mb-4">
                  <SearchX
                    className="w-10 h-10 mx-auto"
                    style={{ color: 'rgba(212,165,116,0.3)' }}
                  />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500 }}>
                  No results for &ldquo;{query}&rdquo;
                </p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', marginTop: '6px' }}>
                  Try a different term &mdash; like a team member, node, or OKR
                </p>
              </div>
            ) : (
              categoryOrder.map((category) => {
                const items = groupedResults[category];
                if (!items || items.length === 0) return null;

                // Calculate the base animation offset for staggering
                let baseOffset = 0;
                for (const cat of categoryOrder) {
                  if (cat === category) break;
                  if (groupedResults[cat]) baseOffset += groupedResults[cat].length;
                }

                return (
                  <div key={category}>
                    {/* Category Header with count */}
                    <div className="flex items-center gap-2 px-5 py-2.5 mt-1" style={{
                      borderBottom: '1px solid rgba(212, 165, 116, 0.04)',
                    }}>
                      <span style={{
                        color: category === 'Recent' ? '#8b5cf6' : '#d4a574',
                        opacity: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        background: category === 'Recent' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(212, 165, 116, 0.06)',
                      }}>{categoryIcons[category]}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase' as const,
                          background: category === 'Recent'
                            ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
                            : 'linear-gradient(135deg, #d4a574, #e8c9a0)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {category}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: category === 'Recent' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(212,165,116,0.35)',
                          fontFamily: 'ui-monospace, monospace',
                          background: category === 'Recent' ? 'rgba(139, 92, 246, 0.06)' : 'rgba(212, 165, 116, 0.05)',
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        {items.length}
                      </span>
                      {/* Clear recent button */}
                      {category === 'Recent' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleClearRecent(); }}
                          className="cp-clear-recent"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10,
                            color: 'rgba(160, 152, 136, 0.4)',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: 4,
                            padding: '2px 6px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'color 0.15s ease, background 0.15s ease',
                          }}
                        >
                          <X className="w-3 h-3 cp-clear-icon" />
                          Clear
                        </button>
                      )}
                      <span style={{
                        flex: 1,
                        height: 1,
                        background: category === 'Recent'
                          ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent)'
                          : 'linear-gradient(90deg, rgba(212, 165, 116, 0.1), transparent)',
                        marginLeft: 8,
                      }} />
                    </div>

                    {/* Results */}
                    {items.map((result, localIdx) => {
                      const gi = flatResults.indexOf(result);
                      const isSelected = gi === selectedIndex;
                      const staggerDelay = (baseOffset + localIdx) * 30;
                      const isRecent = result.category === 'Recent';

                      return (
                        <button
                          key={result.id}
                          data-index={gi}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(gi)}
                          className="cp-result-item w-full flex items-center gap-3 px-5 py-2.5 text-left cursor-pointer group"
                          style={{
                            animationDelay: `${staggerDelay}ms`,
                            background: isSelected
                              ? 'linear-gradient(90deg, rgba(212, 165, 116, 0.1) 0%, rgba(212, 165, 116, 0.04) 100%)'
                              : 'transparent',
                            borderLeft: isSelected
                              ? `3px solid ${isRecent ? '#8b5cf6' : '#d4a574'}`
                              : '3px solid transparent',
                            transition: 'background 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
                            position: 'relative',
                            borderRadius: isSelected ? '0 8px 8px 0' : '0',
                            margin: isSelected ? '2px 8px 2px 0' : '0',
                            boxShadow: isSelected
                              ? 'inset 0 0 20px rgba(212, 165, 116, 0.04), 0 1px 3px rgba(0, 0, 0, 0.1)'
                              : 'none',
                            minHeight: isSelected && result.description ? 58 : undefined,
                          }}
                        >
                          <div
                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                              background: isSelected
                                ? isRecent
                                  ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.08))'
                                  : 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(212,165,116,0.08))'
                                : 'rgba(255,255,255,0.04)',
                              color: isSelected
                                ? isRecent ? '#8b5cf6' : '#d4a574'
                                : isRecent ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.4)',
                              transition: 'all 200ms ease',
                              transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                              boxShadow: isSelected ? '0 0 12px rgba(212, 165, 116, 0.1)' : 'none',
                            }}
                          >
                            {result.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="truncate"
                              style={{
                                fontSize: '14px',
                                color: isSelected ? '#f0ebe4' : 'rgba(255,255,255,0.8)',
                                fontWeight: isSelected ? 600 : 400,
                                transition: 'color 150ms ease',
                              }}
                            >
                              {result.title}
                            </div>
                            {/* Preview description below result name */}
                            <div
                              className="truncate"
                              style={{
                                fontSize: isSelected && result.description ? '11px' : '12px',
                                color: isSelected
                                  ? 'rgba(212,165,116,0.6)'
                                  : 'rgba(255,255,255,0.3)',
                                transition: 'color 150ms ease, font-size 150ms ease',
                                marginTop: 1,
                                maxHeight: isSelected && result.description ? 32 : 18,
                                overflow: 'hidden',
                              }}
                            >
                              {isSelected && result.description ? result.description : result.subtitle}
                            </div>
                          </div>
                          {/* Keyboard shortcut hint on selected */}
                          {isSelected && (
                            <span
                              className="flex-shrink-0 flex items-center gap-1"
                              style={{
                                fontSize: '10px',
                                color: 'rgba(212,165,116,0.4)',
                                fontFamily: 'ui-monospace, monospace',
                              }}
                            >
                              <kbd style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1px 5px',
                                borderRadius: 4,
                                background: 'rgba(212, 165, 116, 0.08)',
                                border: '1px solid rgba(212, 165, 116, 0.12)',
                                fontSize: '9px',
                                color: 'rgba(212, 165, 116, 0.5)',
                              }}>
                                {'\u21B5'}
                              </kbd>
                            </span>
                          )}
                          {!isSelected && (
                            <span
                              className="flex-shrink-0 px-2 py-0.5 rounded-full"
                              style={{
                                fontSize: '10px',
                                fontWeight: 500,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase' as const,
                                background: isRecent ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.03)',
                                color: isRecent ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.25)',
                                border: `1px solid ${isRecent ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.06)'}`,
                              }}
                            >
                              {result.category}
                            </span>
                          )}
                          <ArrowRight
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{
                              color: '#d4a574',
                              opacity: isSelected ? 1 : 0,
                              transform: isSelected ? 'translateX(0)' : 'translateX(-4px)',
                              transition: 'all 150ms ease',
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Keyboard Hints Footer */}
          <div
            className={`flex items-center justify-center gap-6 px-5 py-3 ${showHints ? 'cp-hints-reveal' : ''}`}
            style={{
              borderTop: '1px solid rgba(212, 165, 116, 0.06)',
              background: 'rgba(11, 13, 20, 0.6)',
              opacity: showHints ? 1 : 0,
            }}
          >
            {[
              { keys: '\u2191\u2193', label: 'Navigate' },
              { keys: '\u21B5', label: 'Select' },
              { keys: 'Tab', label: 'Autocomplete' },
              { keys: 'esc', label: 'Close' },
            ].map((hint) => (
              <span
                key={hint.label}
                className="flex items-center gap-1.5 cp-hint-float"
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.3)',
                  animationDelay: hint.label === 'Navigate' ? '0s' : hint.label === 'Select' ? '0.2s' : hint.label === 'Autocomplete' ? '0.4s' : '0.6s',
                }}
              >
                <kbd
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '22px',
                    padding: '2px 6px',
                    borderRadius: '5px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: '2px solid rgba(255,255,255,0.08)',
                    fontSize: '10px',
                    fontFamily: 'ui-monospace, monospace',
                    color: 'rgba(255,255,255,0.45)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {hint.keys}
                </kbd>
                {hint.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
