'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Send, Bot, User, Sparkles, AlertCircle, Loader2, Trash2, RotateCcw,
  Zap, Target, Users, Shield, Heart, Calendar, TrendingUp, Network, ChevronDown,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { getApiKey } from '@/lib/apiKey';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }
interface StoredMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }

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

const QUICK_PROMPTS = [
  { label: 'What should I focus on today?', prompt: 'Based on my current tasks and priorities, what should I personally focus on today?' },
  { label: 'Weekly priorities for the team', prompt: 'What should Frequency prioritize this week? Have each relevant agent weigh in briefly.' },
  { label: 'Financial health check', prompt: 'Mothership Agent: Give me a concise financial health assessment. What\'s our runway and burn rate?' },
  { label: 'Which nodes need attention?', prompt: 'Node Intelligence Agent: Which nodes need the most attention right now? Rank by urgency.' },
  { label: 'Risk assessment', prompt: 'All agents: What are the top 3 risks Frequency faces right now? Rank by urgency.' },
  { label: 'Prepare for next event', prompt: 'Event Agent: What needs to happen before our next upcoming event? Give me a checklist.' },
];

const STORAGE_KEY = (id: string) => `frequency-advisor-chat-${id}`;

function getSuggestions(msgs: Message[]): string[] {
  if (msgs.length < 2) return [];
  const last = msgs[msgs.length - 1];
  if (last.role !== 'assistant') return [];
  const t = last.content.toLowerCase();
  const s: string[] = [];
  if (t.includes('task') || t.includes('priority') || t.includes('focus')) s.push('What are the blockers?', 'Who owns what?');
  if (t.includes('node') || t.includes('progress')) s.push('Node health details', 'Which leads are stretched thin?');
  if (t.includes('event') || t.includes('blue spirit')) s.push('Event timeline breakdown', 'What\'s the budget status?');
  if (t.includes('financial') || t.includes('runway') || t.includes('burn')) s.push('Revenue projections', 'Where can we cut costs?');
  if (t.includes('risk') || t.includes('blocked')) s.push('Mitigation strategies', 'Who should own each risk?');
  if (t.includes('okr') || t.includes('objective')) s.push('Which OKRs are at risk?', 'Suggest new key results');
  if (t.includes('member') || t.includes('team') || t.includes('people')) s.push('Capacity overview', 'Hiring priorities');
  if (s.length === 0) s.push('Tell me more', 'What actions should we take?');
  return s.slice(0, 3);
}

// ─── Safe inline formatting component (XSS-safe replacement for dangerouslySetInnerHTML) ───
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

const codePre: React.CSSProperties = {
  fontSize: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px',
  margin: '6px 0', overflowX: 'auto', color: '#c8c2b8', border: '1px solid rgba(30,38,56,0.5)',
  fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5,
};

function formatAgentResponse(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const lines = content.split('\n');
  let inCode = false;
  let codeAcc: string[] = [];

  const flushCode = (key: string) => {
    if (codeAcc.length > 0) parts.push(<pre key={key} style={codePre}>{codeAcc.join('\n')}</pre>);
    codeAcc = [];
  };

  lines.forEach((line, i) => {
    if (line.trim().startsWith('```')) {
      if (inCode) flushCode(`code-${i}`);
      inCode = !inCode;
      return;
    }
    if (inCode) { codeAcc.push(line); return; }

    // Agent tags
    const am = line.match(/\[([A-Z\s&]+)\]/);
    if (am) {
      const name = am[1].trim();
      const info = Object.entries(AGENT_COLORS).find(([k]) => name.includes(k));
      if (info) {
        const [, { color, icon: Icon }] = info;
        const rest = line.replace(/\[[A-Z\s&]+\]/, '').trim();
        parts.push(
          <div key={`a-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i > 0 ? 12 : 0, marginBottom: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30` }}>
              <Icon style={{ width: 13, height: 13, color }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{name}</span>
            {rest && <span style={{ fontSize: 13, color: '#a09888' }}>{rest}</span>}
          </div>
        );
        return;
      }
    }
    // Headers
    const hm = line.match(/^(#{2,3})\s+(.+)/);
    if (hm) {
      const lvl = hm[1].length;
      parts.push(<div key={`h-${i}`} style={{ fontSize: lvl === 2 ? 15 : 14, fontWeight: 700, color: '#f0ebe4', margin: `${lvl === 2 ? 14 : 10}px 0 6px` }}>{hm[2]}</div>);
      return;
    }
    // Numbered list
    const nm = line.match(/^(\d+)\.\s+(.+)/);
    if (nm) {
      parts.push(
        <div key={`n-${i}`} style={{ display: 'flex', gap: 8, marginLeft: 4, marginBottom: 4 }}>
          <span style={{ color: '#d4a574', flexShrink: 0, fontWeight: 600, fontSize: 13, minWidth: 18 }}>{nm[1]}.</span>
          <span style={{ fontSize: 13, color: '#e0dbd4', lineHeight: 1.6 }}><SafeInline text={nm[2]} /></span>
        </div>
      );
      return;
    }
    // Bullets
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      parts.push(
        <div key={`b-${i}`} style={{ display: 'flex', gap: 8, marginLeft: 8, marginBottom: 4 }}>
          <span style={{ color: '#d4a574', flexShrink: 0 }}>{'\u2022'}</span>
          <span style={{ fontSize: 13, color: '#e0dbd4', lineHeight: 1.6 }}><SafeInline text={line.replace(/^[\s]*[-•]\s*/, '')} /></span>
        </div>
      );
    } else if (line.trim().length > 0) {
      parts.push(<p key={`l-${i}`} style={{ fontSize: 13, color: '#e0dbd4', lineHeight: 1.6, margin: '4px 0' }}><SafeInline text={line} /></p>);
    } else {
      parts.push(<div key={`s-${i}`} style={{ height: 8 }} />);
    }
  });
  if (inCode) flushCode('code-end');
  return parts;
}

// ─── Main Component ───
export function AdvisorView() {
  const { tasks, okrs, kpis, nodes, teamMembers, events, governanceDecisions } = useFrequencyData();
  const { teamMemberId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [agentsExpanded, setAgentsExpanded] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentMember = teamMembers.find(m => m.id === teamMemberId);
  const storageKey = teamMemberId ? STORAGE_KEY(teamMemberId) : null;

  // Load chat from localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: StoredMessage[] = JSON.parse(raw);
        if (parsed.length > 0) {
          setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
          setRestored(true);
          setTimeout(() => setRestored(false), 3000);
        }
      }
    } catch { /* ignore */ }
  }, [storageKey]);

  // Save chat to localStorage
  useEffect(() => {
    if (!storageKey || messages.length === 0) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(
        messages.map(m => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp.toISOString() }))
      ));
    } catch { /* ignore */ }
  }, [messages, storageKey]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Rotating agent during loading
  useEffect(() => {
    if (!isLoading) return;
    const iv = setInterval(() => setLoadingAgent(p => (p + 1) % AGENT_NAMES.length), 1800);
    return () => clearInterval(iv);
  }, [isLoading]);

  // Concise context (~2000 chars max)
  const context = useMemo(() => {
    const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').slice(0, 5);
    const blocked = tasks.filter(t => t.status === 'blocked').slice(0, 3);
    const tc = { total: tasks.length, todo: tasks.filter(t => t.status === 'todo').length, ip: tasks.filter(t => t.status === 'in-progress').length, done: tasks.filter(t => t.status === 'done').length, blk: tasks.filter(t => t.status === 'blocked').length };
    const activeOKRs = okrs.filter(o => ['on-track', 'at-risk', 'behind'].includes(o.status)).slice(0, 4);
    const okrStr = activeOKRs.map(o => { const a = o.keyResults.length ? Math.round(o.keyResults.reduce((s, kr) => s + kr.progress, 0) / o.keyResults.length) : 0; return `- "${o.objective}" (${o.status}, ${a}%)`; }).join('\n');
    const nodeStr = nodes.map(n => `- ${n.name}: ${n.status}, ${n.progress}%`).join('\n');
    const kpiStr = kpis.slice(0, 5).map(k => `- ${k.name}: ${k.value} (target: ${k.target}, ${k.trend})`).join('\n');
    const evtStr = events.filter(e => e.status !== 'completed').slice(0, 3).map(e => `- ${e.name}: ${e.date} (${e.status})`).join('\n');
    const govStr = governanceDecisions.slice(0, 3).map(d => `- "${d.title}" (${d.impact} impact)`).join('\n');
    let ctx = `USER: ${currentMember?.name || 'Unknown'} (${currentMember?.role || 'Unknown'})
TASKS: ${tc.total} (${tc.todo} todo, ${tc.ip} active, ${tc.blk} blocked, ${tc.done} done)
Critical:\n${critical.map(t => `- "${t.title}" (${t.status}, ${t.owner})`).join('\n')}
${blocked.length ? `Blocked:\n${blocked.map(t => `- "${t.title}" (${t.owner})`).join('\n')}` : ''}
OKRs:\n${okrStr}\nNODES:\n${nodeStr}\nKPIs:\n${kpiStr}\nEVENTS:\n${evtStr}\nGOVERNANCE:\n${govStr}
TEAM: ${teamMembers.length} members, ${teamMembers.filter(m => m.tier === 'core-team').length} core`;
    if (ctx.length > 2000) ctx = ctx.slice(0, 2000) + '...';
    return ctx;
  }, [tasks, okrs, kpis, nodes, teamMembers, events, governanceDecisions, currentMember]);

  const contextSize = useMemo(() => Math.round(context.length / 4), [context]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: content.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);
    try {
      const allMsgs = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const userApiKey = teamMemberId ? getApiKey(teamMemberId) : null;
      const res = await fetch('/api/advisor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMsgs, context, ...(userApiKey ? { apiKey: userApiKey } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');
      setMessages(prev => [...prev, { id: `asst-${Date.now()}`, role: 'assistant', content: data.message, timestamp: new Date() }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setIsLoading(false); }
  }, [messages, isLoading, context]);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    if (storageKey) try { localStorage.removeItem(storageKey); } catch { /* */ }
  };

  const suggestions = getSuggestions(messages);
  const agentName = AGENT_NAMES[loadingAgent];
  const agentInfo = AGENT_COLORS[agentName];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes advisorPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes advisorFadeIn { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes advisorTyping { 0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); } 30% { opacity: 1; transform: scale(1); } }
        .advisor-msg { animation: advisorFadeIn 0.3s ease-out; }
        .advisor-quick:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .advisor-quick { transition: all 0.2s ease; }
        .advisor-chip:hover { background: rgba(212,165,116,0.15) !important; border-color: rgba(212,165,116,0.3) !important; }
        .advisor-chip { transition: all 0.15s ease; cursor: pointer; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', marginBottom: 12, borderBottom: '1px solid rgba(30,38,56,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(212,165,116,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: 20, height: 20, color: '#d4a574' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Advisory Board</h2>
            <p style={{ fontSize: 12, color: '#6b6358', margin: 0 }}>8 AI agents &middot; ~{contextSize} tokens context</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {restored && <span style={{ fontSize: 11, color: '#6b6358', fontStyle: 'italic', animation: 'advisorFadeIn 0.3s ease-out' }}>Conversation restored</span>}
          {messages.length > 0 && (
            <button onClick={clearChat} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'rgba(160,152,136,0.08)', color: '#6b6358', border: '1px solid rgba(160,152,136,0.12)', cursor: 'pointer' }}>
              <Trash2 style={{ width: 12, height: 12 }} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 12 }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, rgba(212,165,116,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(212,165,116,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'advisorPulse 3s ease-in-out infinite' }}>
              <Bot style={{ width: 36, height: 36, color: '#d4a574' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', marginBottom: 6 }}>Frequency Advisory Board</h3>
              <p style={{ fontSize: 13, color: '#6b6358', maxWidth: 420, lineHeight: 1.6 }}>8 specialized AI agents with full context of your team, tasks, OKRs, nodes, events, and governance. Ask anything.</p>
            </div>

            {/* Collapsible Agent Legend */}
            <div style={{ maxWidth: 500, width: '100%' }}>
              <button onClick={() => setAgentsExpanded(!agentsExpanded)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6358', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {Object.entries(AGENT_COLORS).map(([n, { color, icon: I }]) => <I key={n} style={{ width: 11, height: 11, color, opacity: 0.7 }} />)}
                </span>
                <span>Agents</span>
                <ChevronDown style={{ width: 12, height: 12, transition: 'transform 0.2s', transform: agentsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              {agentsExpanded && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8, animation: 'advisorFadeIn 0.2s ease-out' }}>
                  {Object.entries(AGENT_COLORS).map(([n, { color, icon: I }]) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: `${color}0a`, border: `1px solid ${color}18` }}>
                      <I style={{ width: 12, height: 12, color }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{n}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick prompts */}
            <div style={{ width: '100%', maxWidth: 600 }}>
              <p style={{ fontSize: 11, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>Quick prompts</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {QUICK_PROMPTS.map((qp, i) => (
                  <button key={i} onClick={() => sendMessage(qp.prompt)} className="advisor-quick" style={{ padding: '10px 14px', borderRadius: 10, textAlign: 'left', background: 'rgba(19,23,32,0.6)', border: '1px solid rgba(30,38,56,0.5)', color: '#a09888', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className="advisor-msg" style={{ display: 'flex', gap: 12, marginBottom: 16, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(212,165,116,0.1))' : 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(212,165,116,0.1))',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(212,165,116,0.2)' : 'rgba(139,92,246,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {msg.role === 'user' ? <User style={{ width: 15, height: 15, color: '#d4a574' }} /> : <Bot style={{ width: 15, height: 15, color: '#8b5cf6' }} />}
                </div>
                <div style={{
                  maxWidth: '80%', padding: '12px 16px', borderRadius: 14,
                  background: msg.role === 'user' ? 'rgba(212,165,116,0.08)' : 'rgba(19,23,32,0.8)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(212,165,116,0.12)' : 'rgba(30,38,56,0.5)'}`,
                }}>
                  {msg.role === 'assistant' ? <div>{formatAgentResponse(msg.content)}</div> : <p style={{ fontSize: 13, color: '#f0ebe4', lineHeight: 1.6, margin: 0 }}>{msg.content}</p>}
                  <div style={{ fontSize: 10, color: '#4a4540', marginTop: 6, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Post-response suggestion chips */}
            {!isLoading && suggestions.length > 0 && (
              <div className="advisor-msg" style={{ display: 'flex', gap: 8, marginBottom: 16, marginLeft: 44, flexWrap: 'wrap' }}>
                {suggestions.map((s, i) => (
                  <button key={i} className="advisor-chip" onClick={() => sendMessage(s)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'rgba(212,165,116,0.06)', color: '#a09888', border: '1px solid rgba(212,165,116,0.15)', fontFamily: 'inherit' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Loading with rotating agent name */}
            {isLoading && (
              <div className="advisor-msg" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(212,165,116,0.1))', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot style={{ width: 15, height: 15, color: '#8b5cf6' }} />
                </div>
                <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(19,23,32,0.8)', border: '1px solid rgba(30,38,56,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: agentInfo?.color || '#8b5cf6', animation: 'advisorTyping 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                  ))}
                  <span style={{ fontSize: 12, color: agentInfo?.color || '#6b6358', marginLeft: 4, fontWeight: 500 }}>{agentName} analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, marginBottom: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <AlertCircle style={{ width: 14, height: 14, color: '#f87171', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#f87171', flex: 1 }}>{error}</span>
          <button onClick={() => { setError(null); if (messages.length > 0) { const last = messages[messages.length - 1]; if (last.role === 'user') sendMessage(last.content); } }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: 11, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', cursor: 'pointer' }}>
            <RotateCcw style={{ width: 11, height: 11 }} /> Retry
          </button>
        </div>
      )}

      {/* Input area */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '12px 16px', borderRadius: 16, background: 'rgba(19,23,32,0.8)', border: '1px solid rgba(30,38,56,0.5)' }}>
        <textarea
          ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Ask the advisory board anything..." rows={1}
          style={{ flex: 1, resize: 'none', border: 'none', outline: 'none', background: 'transparent', color: '#f0ebe4', fontSize: 14, lineHeight: 1.5, fontFamily: 'inherit', maxHeight: 120, minHeight: 24 }}
          onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = '24px'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
        />
        <button
          onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
          style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: input.trim() && !isLoading ? 'linear-gradient(135deg, #d4a574, #c4925a)' : 'rgba(160,152,136,0.08)', border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
        >
          {isLoading ? <Loader2 style={{ width: 16, height: 16, color: '#6b6358', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: 16, height: 16, color: input.trim() ? '#0b0d14' : '#6b6358' }} />}
        </button>
      </div>
    </div>
  );
}
