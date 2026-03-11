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
  category: 'Team' | 'Nodes' | 'OKRs' | 'KPIs' | 'Navigation';
  action: string;
}

const navigationItems: SearchResult[] = [
  { id: 'nav-dashboard', icon: <LayoutDashboard className="w-4 h-4" />, title: 'Dashboard', subtitle: 'Your personal command center & key metrics', category: 'Navigation', action: 'dashboard' },
  { id: 'nav-team', icon: <Users className="w-4 h-4" />, title: 'Team', subtitle: 'Core team, board, and node leads', category: 'Navigation', action: 'team' },
  { id: 'nav-chat', icon: <MessageCircle className="w-4 h-4" />, title: 'Chat', subtitle: 'Team communication channels', category: 'Navigation', action: 'chat' },
  { id: 'nav-okrs', icon: <Target className="w-4 h-4" />, title: 'OKRs & KPIs', subtitle: 'Objectives, key results, and metrics', category: 'Navigation', action: 'okrs' },
  { id: 'nav-tasks', icon: <CheckSquare className="w-4 h-4" />, title: 'Tasks', subtitle: '90-day action plan and tracking', category: 'Navigation', action: 'tasks' },
  { id: 'nav-governance', icon: <Scale className="w-4 h-4" />, title: 'Governance', subtitle: 'Decisions, policies, and council records', category: 'Navigation', action: 'governance' },
  { id: 'nav-roadmap', icon: <Map className="w-4 h-4" />, title: 'Roadmap', subtitle: 'Strategic phases and milestones', category: 'Navigation', action: 'roadmap' },
  { id: 'nav-events', icon: <Calendar className="w-4 h-4" />, title: 'Events', subtitle: 'Gatherings and retreats', category: 'Navigation', action: 'events' },
  { id: 'nav-nodes', icon: <Network className="w-4 h-4" />, title: 'Nodes', subtitle: 'Node ecosystem and progress', category: 'Navigation', action: 'nodes' },
  { id: 'nav-budget', icon: <Wallet className="w-4 h-4" />, title: 'Budget', subtitle: 'Financial overview and tracking', category: 'Navigation', action: 'budget' },
  { id: 'nav-leaderboard', icon: <Trophy className="w-4 h-4" />, title: 'Leaderboard', subtitle: 'Team performance and accountability rankings', category: 'Navigation', action: 'leaderboard' },
  { id: 'nav-advisor', icon: <Sparkles className="w-4 h-4" />, title: 'AI Advisor', subtitle: 'Frequency Advisory Board — 8 AI agents', category: 'Navigation', action: 'advisor' },
];

const categoryOrder: SearchResult['category'][] = ['Navigation', 'Team', 'Nodes', 'OKRs', 'KPIs'];

const categoryIcons: Record<SearchResult['category'], React.ReactNode> = {
  Navigation: <ArrowRight className="w-3 h-3" />,
  Team: <Users className="w-3 h-3" />,
  Nodes: <Network className="w-3 h-3" />,
  OKRs: <Target className="w-3 h-3" />,
  KPIs: <TrendingUp className="w-3 h-3" />,
};

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const allResults = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];
    teamMembers.forEach((member) => {
      results.push({ id: `team-${member.id}`, icon: <Users className="w-4 h-4" />, title: member.name, subtitle: member.role, category: 'Team', action: 'team' });
    });
    nodes.forEach((node) => {
      results.push({ id: `node-${node.id}`, icon: <Network className="w-4 h-4" />, title: node.name, subtitle: node.purpose.slice(0, 60) + '...', category: 'Nodes', action: 'nodes' });
    });
    okrs.forEach((okr) => {
      results.push({ id: `okr-${okr.id}`, icon: <Target className="w-4 h-4" />, title: okr.objective.slice(0, 50) + '...', subtitle: `${okr.quarter} · ${okr.status.replace('-', ' ')}`, category: 'OKRs', action: 'okrs' });
    });
    kpis.forEach((kpi) => {
      results.push({ id: `kpi-${kpi.id}`, icon: <TrendingUp className="w-4 h-4" />, title: kpi.name, subtitle: `${kpi.value} → ${kpi.target} · ${kpi.category}`, category: 'KPIs', action: 'okrs' });
    });
    return results;
  }, []);

  const filteredResults = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return navigationItems;
    const matched: SearchResult[] = [];
    navigationItems.forEach((item) => {
      if (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)) matched.push(item);
    });
    allResults.forEach((item) => {
      if (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)) matched.push(item);
    });
    return matched;
  }, [query, allResults]);

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

  useEffect(() => {
    if (isOpen) { setIsAnimating(true); setQuery(''); setSelectedIndex(0); requestAnimationFrame(() => { inputRef.current?.focus(); }); }
  }, [isOpen]);

  useEffect(() => {
    if (!resultsRef.current) return;
    const el = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleSelect = useCallback((result: SearchResult) => { onNavigate(result.action); onClose(); }, [onNavigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setSelectedIndex((p) => p < flatResults.length - 1 ? p + 1 : 0); break;
      case 'ArrowUp': e.preventDefault(); setSelectedIndex((p) => p > 0 ? p - 1 : flatResults.length - 1); break;
      case 'Enter': e.preventDefault(); if (flatResults[selectedIndex]) handleSelect(flatResults[selectedIndex]); break;
      case 'Escape': e.preventDefault(); onClose(); break;
    }
  }, [flatResults, selectedIndex, handleSelect, onClose]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] transition-all duration-200 ${isOpen ? 'bg-black/60 backdrop-blur-sm opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTransitionEnd={() => { if (!isOpen) setIsAnimating(false); }}
    >
      <div
        className={`w-full max-w-2xl mx-4 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transition-all duration-200 ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4'}`}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search anything... team, nodes, tasks, OKRs" className="flex-1 bg-transparent text-text-primary text-base placeholder:text-text-muted outline-none" autoComplete="off" spellCheck={false} />
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 border border-border">
            <Command className="w-3 h-3 text-text-muted" /><span className="text-xs text-text-muted font-mono">K</span>
          </div>
        </div>
        <div ref={resultsRef} className="max-h-[400px] overflow-y-auto py-2">
          {flatResults.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Search className="w-10 h-10 text-text-muted/40 mx-auto mb-3" />
              <p className="text-text-muted text-sm">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-text-muted/60 text-xs mt-1">Try searching for a team member, node, or OKR</p>
            </div>
          ) : (
            categoryOrder.map((category) => {
              const items = groupedResults[category];
              if (!items || items.length === 0) return null;
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 px-5 py-2 mt-1">
                    <span className="text-text-muted">{categoryIcons[category]}</span>
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-text-muted">{category}</span>
                    <span className="text-[10px] text-text-muted/50 font-mono">{items.length}</span>
                  </div>
                  {items.map((result) => {
                    const gi = flatResults.indexOf(result);
                    const isSelected = gi === selectedIndex;
                    return (
                      <button key={result.id} data-index={gi} onClick={() => handleSelect(result)} onMouseEnter={() => setSelectedIndex(gi)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors duration-75 cursor-pointer ${isSelected ? 'bg-surface-2' : 'hover:bg-surface-2'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-accent/15 text-accent' : 'bg-surface-3 text-text-muted'}`}>{result.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-text-primary truncate">{result.title}</div>
                          <div className="text-xs text-text-muted truncate">{result.subtitle}</div>
                        </div>
                        <span className="flex-shrink-0 text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-surface-3 text-text-muted border border-border">{result.category}</span>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-center gap-6 px-5 py-3 border-t border-border bg-surface-2/50">
          <span className="flex items-center gap-1.5 text-xs text-text-muted"><kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[10px] font-mono">&uarr;&darr;</kbd>Navigate</span>
          <span className="flex items-center gap-1.5 text-xs text-text-muted"><kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[10px] font-mono">&crarr;</kbd>Select</span>
          <span className="flex items-center gap-1.5 text-xs text-text-muted"><kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[10px] font-mono">esc</kbd>Close</span>
        </div>
      </div>
    </div>
  );
}
