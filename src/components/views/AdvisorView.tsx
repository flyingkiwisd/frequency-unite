'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  Loader2,
  Trash2,
  RotateCcw,
  Zap,
  Target,
  Users,
  Shield,
  Heart,
  Calendar,
  TrendingUp,
  Network,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentTag?: string;
}

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

const QUICK_PROMPTS = [
  { label: 'Weekly priorities', prompt: 'What should Frequency prioritize this week? Have each relevant agent weigh in.' },
  { label: 'Financial health', prompt: 'Mothership Agent: Give me a financial health assessment. What\'s our runway looking like?' },
  { label: 'Node status', prompt: 'Node Intelligence Agent: Which nodes need attention? What\'s the health of each?' },
  { label: 'Blue Spirit prep', prompt: 'Event Agent: How are Blue Spirit 6.0 preparations going? What needs immediate attention?' },
  { label: 'Membership growth', prompt: 'Membership Agent: Where are we on the path to 144? What\'s the pipeline looking like?' },
  { label: 'Team capacity', prompt: 'People Agent: Is anyone overloaded? What are the key hiring priorities?' },
  { label: 'Risk assessment', prompt: 'All agents: What are the top 3 risks Frequency faces right now? Rank by urgency.' },
  { label: 'Coherence check', prompt: 'Culture & Coherence Agent: How is the being side of Frequency? Are we honoring both hemispheres?' },
];

function formatAgentResponse(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    // Detect agent tags like [MOTHERSHIP] or [NODE INTEL]
    const agentMatch = line.match(/\[([A-Z\s&]+)\]/);
    if (agentMatch) {
      const agentName = agentMatch[1].trim();
      const agentInfo = Object.entries(AGENT_COLORS).find(([key]) =>
        agentName.includes(key)
      );
      if (agentInfo) {
        const [, { color, icon: Icon }] = agentInfo;
        const restOfLine = line.replace(/\[[A-Z\s&]+\]/, '').trim();
        parts.push(
          <div key={`agent-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i > 0 ? 12 : 0, marginBottom: 6 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 8,
              background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${color}30`,
            }}>
              <Icon style={{ width: 13, height: 13, color }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {agentName}
            </span>
            {restOfLine && <span style={{ fontSize: 13, color: '#a09888' }}>{restOfLine}</span>}
          </div>
        );
        return;
      }
    }

    // Bold text **...**
    const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      parts.push(
        <div key={`line-${i}`} style={{ display: 'flex', gap: 8, marginLeft: 8, marginBottom: 4 }}>
          <span style={{ color: '#d4a574', flexShrink: 0 }}>•</span>
          <span style={{ fontSize: 13, color: '#e0dbd4', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-•]\s*/, '') }} />
        </div>
      );
    } else if (line.trim().length > 0) {
      parts.push(
        <p key={`line-${i}`} style={{ fontSize: 13, color: '#e0dbd4', lineHeight: 1.6, margin: '4px 0' }} dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    } else {
      parts.push(<div key={`space-${i}`} style={{ height: 8 }} />);
    }
  });

  return parts;
}

export function AdvisorView() {
  const { tasks, okrs, kpis, nodes, teamMembers, events, governanceDecisions } = useFrequencyData();
  const { teamMemberId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentMember = teamMembers.find(m => m.id === teamMemberId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build context string from live data
  const buildContext = useCallback(() => {
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
    };
    const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'done');

    const okrSummary = okrs.map(o => {
      const avgProgress = o.keyResults.length > 0
        ? Math.round(o.keyResults.reduce((s, kr) => s + kr.progress, 0) / o.keyResults.length)
        : 0;
      return `- "${o.objective}" (${o.quarter}, ${o.status}, ${avgProgress}% avg progress)`;
    }).join('\n');

    const nodeSummary = nodes.map(n =>
      `- ${n.name}: ${n.status}, ${n.progress}% progress, priority: ${n.priority}, leads: ${n.leads.join(', ')}`
    ).join('\n');

    const kpiSummary = kpis.map(k =>
      `- ${k.name}: ${k.value} (target: ${k.target}, trend: ${k.trend})`
    ).join('\n');

    const recentDecisions = governanceDecisions.slice(0, 5).map(d =>
      `- ${d.date}: "${d.title}" (${d.impact} impact, ${d.category}) — decided by ${d.decidedBy}`
    ).join('\n');

    const upcomingEvents = events.filter(e => e.status !== 'completed').map(e =>
      `- ${e.name}: ${e.date}, ${e.location} (${e.status}, capacity: ${e.capacity})`
    ).join('\n');

    const teamSummary = `${teamMembers.length} team members, ${teamMembers.filter(m => m.tier === 'core-team').length} core team, ${teamMembers.filter(m => m.tier === 'node-lead').length} node leads`;

    return `CURRENT USER: ${currentMember?.name || 'Unknown'} (${currentMember?.role || 'Unknown role'})

TASKS: ${tasks.length} total (${tasksByStatus.todo} todo, ${tasksByStatus.inProgress} in-progress, ${tasksByStatus.done} done, ${tasksByStatus.blocked} blocked)
Critical tasks not done:
${criticalTasks.map(t => `- "${t.title}" (${t.status}, deadline: ${t.deadline}, owner: ${t.owner})`).join('\n')}

OKRs:
${okrSummary}

NODES:
${nodeSummary}

KPIs:
${kpiSummary}

RECENT GOVERNANCE DECISIONS:
${recentDecisions}

UPCOMING EVENTS:
${upcomingEvents}

TEAM: ${teamSummary}`;
  }, [tasks, okrs, kpis, nodes, teamMembers, events, governanceDecisions, currentMember]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const allMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          context: buildContext(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, buildContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes advisorPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes advisorFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes advisorTyping {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
        .advisor-msg { animation: advisorFadeIn 0.3s ease-out; }
        .advisor-quick:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
        .advisor-quick { transition: all 0.2s ease; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 0', marginBottom: 12, borderBottom: '1px solid rgba(30, 38, 56, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(139, 92, 246, 0.15))',
            border: '1px solid rgba(212, 165, 116, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles style={{ width: 20, height: 20, color: '#d4a574' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Advisory Board</h2>
            <p style={{ fontSize: 12, color: '#6b6358', margin: 0 }}>8 AI agents with full context of Frequency</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: 'rgba(160, 152, 136, 0.08)', color: '#6b6358',
              border: '1px solid rgba(160, 152, 136, 0.12)', cursor: 'pointer',
            }}
          >
            <Trash2 style={{ width: 12, height: 12 }} /> Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 12 }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24 }}>
            {/* Welcome state */}
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1), rgba(139, 92, 246, 0.1))',
              border: '1px solid rgba(212, 165, 116, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'advisorPulse 3s ease-in-out infinite',
            }}>
              <Bot style={{ width: 36, height: 36, color: '#d4a574' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', marginBottom: 6 }}>
                Frequency Advisory Board
              </h3>
              <p style={{ fontSize: 13, color: '#6b6358', maxWidth: 420, lineHeight: 1.6 }}>
                8 specialized AI agents with full context of your team, tasks, OKRs, nodes, events, and governance decisions. Ask anything.
              </p>
            </div>

            {/* Agent roster */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}>
              {Object.entries(AGENT_COLORS).map(([name, { color, icon: Icon }]) => (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 8,
                  background: `${color}0a`, border: `1px solid ${color}18`,
                }}>
                  <Icon style={{ width: 12, height: 12, color }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{name}</span>
                </div>
              ))}
            </div>

            {/* Quick prompts */}
            <div style={{ width: '100%', maxWidth: 600 }}>
              <p style={{ fontSize: 11, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
                Quick prompts
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qp.prompt)}
                    className="advisor-quick"
                    style={{
                      padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                      background: 'rgba(19, 23, 32, 0.6)', border: '1px solid rgba(30, 38, 56, 0.5)',
                      color: '#a09888', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="advisor-msg"
                style={{
                  display: 'flex', gap: 12, marginBottom: 16,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(212, 165, 116, 0.1))'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(212, 165, 116, 0.1))',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(212, 165, 116, 0.2)' : 'rgba(139, 92, 246, 0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {msg.role === 'user'
                    ? <User style={{ width: 15, height: 15, color: '#d4a574' }} />
                    : <Bot style={{ width: 15, height: 15, color: '#8b5cf6' }} />
                  }
                </div>

                {/* Message bubble */}
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px', borderRadius: 14,
                  background: msg.role === 'user'
                    ? 'rgba(212, 165, 116, 0.08)'
                    : 'rgba(19, 23, 32, 0.8)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(212, 165, 116, 0.12)' : 'rgba(30, 38, 56, 0.5)'}`,
                }}>
                  {msg.role === 'assistant' ? (
                    <div>{formatAgentResponse(msg.content)}</div>
                  ) : (
                    <p style={{ fontSize: 13, color: '#f0ebe4', lineHeight: 1.6, margin: 0 }}>{msg.content}</p>
                  )}
                  <div style={{ fontSize: 10, color: '#4a4540', marginTop: 6, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="advisor-msg" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(212, 165, 116, 0.1))',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot style={{ width: 15, height: 15, color: '#8b5cf6' }} />
                </div>
                <div style={{
                  padding: '14px 18px', borderRadius: 14,
                  background: 'rgba(19, 23, 32, 0.8)', border: '1px solid rgba(30, 38, 56, 0.5)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6',
                      animation: `advisorTyping 1.4s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                  <span style={{ fontSize: 12, color: '#6b6358', marginLeft: 6 }}>Agents conferring...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
          borderRadius: 10, marginBottom: 8,
          background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)',
        }}>
          <AlertCircle style={{ width: 14, height: 14, color: '#f87171', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#f87171', flex: 1 }}>{error}</span>
          <button
            onClick={() => { setError(null); if (messages.length > 0) { const last = messages[messages.length - 1]; if (last.role === 'user') sendMessage(last.content); } }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: 11, background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', cursor: 'pointer' }}
          >
            <RotateCcw style={{ width: 11, height: 11 }} /> Retry
          </button>
        </div>
      )}

      {/* Input area */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        padding: '12px 16px', borderRadius: 16,
        background: 'rgba(19, 23, 32, 0.8)',
        border: '1px solid rgba(30, 38, 56, 0.5)',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the advisory board anything..."
          rows={1}
          style={{
            flex: 1, resize: 'none', border: 'none', outline: 'none',
            background: 'transparent', color: '#f0ebe4', fontSize: 14,
            lineHeight: 1.5, fontFamily: 'inherit',
            maxHeight: 120, minHeight: 24,
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = '24px';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: input.trim() && !isLoading
              ? 'linear-gradient(135deg, #d4a574, #c4925a)'
              : 'rgba(160, 152, 136, 0.08)',
            border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          {isLoading
            ? <Loader2 style={{ width: 16, height: 16, color: '#6b6358', animation: 'spin 1s linear infinite' }} />
            : <Send style={{ width: 16, height: 16, color: input.trim() ? '#0b0d14' : '#6b6358' }} />
          }
        </button>
      </div>
    </div>
  );
}
