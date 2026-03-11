'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Send, Sparkles, Loader2, ChevronDown, Zap, Target, Users,
  Shield, Heart, Calendar, TrendingUp, Network, Bot,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { getApiKey } from '@/lib/apiKey';

/* ─── Theme ─── */
const C = {
  card: 'rgba(19, 23, 32, 0.8)', border: 'rgba(30, 38, 56, 0.5)',
  text: '#f0ebe4', textSec: '#a09888', accent: '#d4a574',
  success: '#6b8f71', warning: '#f59e0b', danger: '#ef4444',
} as const;

const AGENT_COLORS: Record<string, { color: string; icon: React.ElementType }> = {
  'MOTHERSHIP': { color: '#f59e0b', icon: Zap },
  'MEMBERSHIP': { color: '#38bdf8', icon: Users },
  'NODE INTEL': { color: '#8b5cf6', icon: Network },
  'GOVERNANCE': { color: '#10b981', icon: Shield },
  'COHERENCE': { color: '#f472b6', icon: Heart },
  'EVENT': { color: '#4ade80', icon: Calendar },
  'IMPACT': { color: '#fb923c', icon: TrendingUp },
  'PEOPLE': { color: '#60a5fa', icon: Target },
};
const AGENT_NAMES = Object.keys(AGENT_COLORS);

/* ─── Props ─── */
interface InlineAdvisorProps {
  title?: string;
  titleIcon?: 'bot' | 'sparkles' | 'lightbulb';
  compact?: boolean;
  defaultCollapsed?: boolean;
  suggestedPrompts?: string[];
  contextOverride?: Record<string, unknown>;
  storageKeySuffix?: string;
}

/* ─── Safe inline formatting component (XSS-safe replacement for dangerouslySetInnerHTML) ─── */
function SafeInline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Link
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    // Find earliest match
    const matches = [
      boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
      codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
      linkMatch ? { type: 'link', match: linkMatch, index: linkMatch.index! } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    if (first.index > 0) {
      parts.push(remaining.slice(0, first.index));
    }

    if (first.type === 'bold') {
      parts.push(<strong key={key++}>{first.match[1]}</strong>);
    } else if (first.type === 'code') {
      parts.push(<code key={key++} style={{background:'rgba(0,0,0,0.3)',padding:'1px 5px',borderRadius:4,fontSize:12,fontFamily:'monospace',color:'#c8c2b8'}}>{first.match[1]}</code>);
    } else if (first.type === 'link') {
      parts.push(<a key={key++} href={first.match[2]} target="_blank" rel="noopener noreferrer" style={{color:'#d4a574',textDecoration:'underline'}}>{first.match[1]}</a>);
    }

    remaining = remaining.slice(first.index + first.match[0].length);
  }

  return <>{parts}</>;
}

function formatResponse(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const lines = content.split('\n');
  let inCode = false;
  let codeBlock: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      if (inCode) {
        parts.push(
          <pre key={`code-${i}`} style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', color: '#c8c2b8', overflowX: 'auto', margin: '6px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {codeBlock.join('\n')}
          </pre>
        );
        codeBlock = [];
        inCode = false;
      } else { inCode = true; }
      continue;
    }
    if (inCode) { codeBlock.push(line); continue; }

    // Agent tags
    const agentMatch = line.match(/^\[([A-Z\s]+)\]/);
    if (agentMatch) {
      const name = agentMatch[1].trim();
      const info = AGENT_COLORS[name];
      const rest = line.slice(agentMatch[0].length).trim();
      const Icon = info?.icon || Bot;
      parts.push(
        <div key={`agent-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, margin: '8px 0 2px' }}>
          <Icon size={12} style={{ color: info?.color || C.accent, flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: info?.color || C.accent, letterSpacing: '0.04em' }}>{name}</span>
          {rest && <span style={{ fontSize: 12, color: C.text }}><SafeInline text={rest} /></span>}
        </div>
      );
      continue;
    }

    // Headers
    if (line.startsWith('## ') || line.startsWith('### ')) {
      parts.push(<div key={`h-${i}`} style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '8px 0 2px' }}>{line.replace(/^#+\s/, '')}</div>);
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      parts.push(
        <div key={`li-${i}`} style={{ display: 'flex', gap: 6, marginLeft: 4, margin: '2px 0' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, flexShrink: 0 }}>{numMatch[1]}.</span>
          <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}><SafeInline text={numMatch[2]} /></span>
        </div>
      );
      continue;
    }

    // Bullet
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      parts.push(
        <div key={`bl-${i}`} style={{ display: 'flex', gap: 6, marginLeft: 4, margin: '2px 0' }}>
          <span style={{ color: C.accent, fontSize: 10, marginTop: 3 }}>•</span>
          <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}><SafeInline text={line.trim().slice(2)} /></span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) { parts.push(<div key={`sp-${i}`} style={{ height: 6 }} />); continue; }

    // Normal paragraph
    parts.push(<p key={`p-${i}`} style={{ fontSize: 12, color: C.text, lineHeight: 1.5, margin: '2px 0' }}><SafeInline text={line} /></p>);
  }
  return parts;
}

/* ─── Component ─── */
export function InlineAdvisor({
  title = 'AI Advisory Board',
  titleIcon = 'sparkles',
  compact = false,
  defaultCollapsed = false,
  suggestedPrompts,
  contextOverride,
  storageKeySuffix,
}: InlineAdvisorProps) {
  const { tasks, okrs, nodes, teamMembers, events, governanceDecisions } = useFrequencyData();
  const { teamMemberId } = useAuth();

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(0);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Storage key scoped by member + suffix
  const storageKey = `frequency-inline-advisor-${teamMemberId || 'anon'}${storageKeySuffix ? `-${storageKeySuffix}` : ''}`;

  // Load last response from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lastResponse) setLastResponse(parsed.lastResponse);
        if (parsed.history) setHistory(parsed.history.slice(-6)); // keep last 3 exchanges
      }
    } catch { /* ignore */ }
  }, [storageKey]);

  // Rotating loading agent name
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setLoadingAgent(p => (p + 1) % AGENT_NAMES.length), 1800);
    return () => clearInterval(iv);
  }, [loading]);

  // Build context
  const context = useMemo(() => {
    if (contextOverride) return JSON.stringify(contextOverride).slice(0, 2000);
    const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').slice(0, 5);
    const blocked = tasks.filter(t => t.status === 'blocked').slice(0, 3);
    const activeOKRs = okrs.filter(o => (o.status as string) !== 'completed').slice(0, 4);
    const ctx: Record<string, unknown> = {
      teamSize: teamMembers.filter(m => m.status === 'active').length,
      criticalTasks: critical.map(t => `${t.title} (${t.owner})`),
      blockedTasks: blocked.map(t => `${t.title} (${t.owner})`),
      activeOKRs: activeOKRs.map(o => `${o.objective} [${o.status}]`),
      nodeCount: nodes.length,
      upcomingEvents: events.filter(e => e.status === 'upcoming').length,
      recentDecisions: governanceDecisions.slice(0, 3).map(d => d.title),
    };
    return JSON.stringify(ctx).slice(0, 2000);
  }, [tasks, okrs, nodes, teamMembers, events, governanceDecisions, contextOverride]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setInput('');
    const newHistory = [...history, { role: 'user' as const, content: text.trim() }];

    try {
      // Include user's personal API key if available
      const userApiKey = teamMemberId ? getApiKey(teamMemberId) : null;
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.slice(-6),
          context,
          ...(userApiKey ? { apiKey: userApiKey } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const response = data.message;
      const updatedHistory = [...newHistory, { role: 'assistant' as const, content: response }];
      setLastResponse(response);
      setHistory(updatedHistory.slice(-6));
      // Save to storage
      try {
        localStorage.setItem(storageKey, JSON.stringify({ lastResponse: response, history: updatedHistory.slice(-6) }));
      } catch { /* quota */ }
    } catch (err) {
      setLastResponse(`Error: ${err instanceof Error ? err.message : 'Something went wrong'}`);
    } finally {
      setLoading(false);
    }
  }, [loading, history, context, storageKey]);

  const defaultPrompts = suggestedPrompts || [
    'What should I focus on today?',
    'Top 3 risks right now?',
    'Team capacity check',
    'Financial health pulse',
  ];

  const TitleIcon = titleIcon === 'lightbulb' ? Zap : titleIcon === 'bot' ? Bot : Sparkles;
  const maxH = compact ? 280 : 380;

  return (
    <div style={{
      backgroundColor: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, borderLeft: '3px solid rgba(139,92,246,0.5)',
      overflow: 'hidden', transition: 'all 0.3s ease',
    }}>
      {/* Header — always visible, clickable to collapse */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.15))',
          border: '1px solid rgba(139,92,246,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <TitleIcon size={14} style={{ color: C.accent }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1, textAlign: 'left' }}>{title}</span>
        {/* Agent dots */}
        <div style={{ display: 'flex', gap: 3, marginRight: 4 }}>
          {AGENT_NAMES.slice(0, 4).map(n => (
            <div key={n} style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: AGENT_COLORS[n].color, opacity: 0.5 }} />
          ))}
        </div>
        <ChevronDown size={14} style={{ color: C.textSec, transition: 'transform 0.2s', transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }} />
      </button>

      {/* Expandable body */}
      {!collapsed && (
        <div style={{ padding: '0 16px 14px' }}>
          {/* Suggested prompts */}
          {!lastResponse && !loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6, marginBottom: 10 }}>
              {defaultPrompts.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)}
                  style={{
                    padding: '8px 10px', borderRadius: 8, fontSize: 11, color: C.textSec,
                    backgroundColor: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', lineHeight: 1.3,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)'; e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'; e.currentTarget.style.color = C.textSec; }}
                >
                  <Sparkles size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', opacity: 0.5 }} />
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', marginBottom: 8 }}>
              <Loader2 size={14} style={{ color: AGENT_COLORS[AGENT_NAMES[loadingAgent]]?.color || C.accent, animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 11, color: C.textSec }}>
                <span style={{ color: AGENT_COLORS[AGENT_NAMES[loadingAgent]]?.color, fontWeight: 600 }}>{AGENT_NAMES[loadingAgent]}</span> analyzing...
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Response display */}
          {lastResponse && !loading && (
            <div ref={responseRef} style={{
              maxHeight: maxH, overflowY: 'auto', marginBottom: 10,
              padding: '10px 12px', borderRadius: 8,
              backgroundColor: 'rgba(11,13,20,0.5)', border: '1px solid rgba(30,38,56,0.4)',
            }}>
              {formatResponse(lastResponse)}
            </div>
          )}

          {/* Input bar */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder={lastResponse ? 'Follow up...' : 'Ask the advisory board...'}
              rows={1}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8,
                border: `1px solid ${C.border}`, backgroundColor: 'rgba(11,13,20,0.6)',
                color: C.text, fontSize: 12, fontFamily: 'inherit', outline: 'none',
                resize: 'none', minHeight: 36, maxHeight: 72,
              }}
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = '36px'; t.style.height = `${Math.min(t.scrollHeight, 72)}px`; }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                backgroundColor: input.trim() && !loading ? C.accent : 'rgba(30,38,56,0.5)',
                color: input.trim() && !loading ? '#0b0d14' : C.textSec,
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
