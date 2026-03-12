'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Send, Bot, User, Sparkles, AlertCircle, Loader2, Trash2, RotateCcw,
  Zap, Target, Users, Shield, Heart, Calendar, TrendingUp, Network, ChevronDown,
  Database, Lock, Eye, MessageSquare, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { getApiKey } from '@/lib/apiKey';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; isNew?: boolean; }
interface StoredMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }
interface FeedbackState { [msgId: string]: 'up' | 'down' | null; }

const AGENT_COLORS: Record<string, { color: string; icon: React.ElementType; description: string }> = {
  'MOTHERSHIP': { color: '#f59e0b', icon: Zap, description: 'Financial ops & runway' },
  'MEMBERSHIP': { color: '#38bdf8', icon: Users, description: 'Member growth & retention' },
  'NODE INTEL': { color: '#8b5cf6', icon: Network, description: 'Node health & progress' },
  'GOVERNANCE': { color: '#10b981', icon: Shield, description: 'Decisions & compliance' },
  'COHERENCE': { color: '#f472b6', icon: Heart, description: 'Culture & alignment' },
  'EVENT': { color: '#4ade80', icon: Calendar, description: 'Events & programming' },
  'IMPACT': { color: '#fb923c', icon: TrendingUp, description: 'Metrics & outcomes' },
  'PEOPLE': { color: '#60a5fa', icon: Target, description: 'Team & capacity' },
};
const AGENT_NAMES = Object.keys(AGENT_COLORS);

const QUICK_PROMPTS = [
  { label: 'What should I focus on today?', prompt: 'Based on my current tasks and priorities, what should I personally focus on today?', icon: Target },
  { label: 'Weekly priorities for the team', prompt: 'What should Frequency prioritize this week? Have each relevant agent weigh in briefly.', icon: Users },
  { label: 'Financial health check', prompt: 'Mothership Agent: Give me a concise financial health assessment. What\'s our runway and burn rate?', icon: Zap },
  { label: 'Which nodes need attention?', prompt: 'Node Intelligence Agent: Which nodes need the most attention right now? Rank by urgency.', icon: Network },
  { label: 'Risk assessment', prompt: 'All agents: What are the top 3 risks Frequency faces right now? Rank by urgency.', icon: Shield },
  { label: 'Prepare for next event', prompt: 'Event Agent: What needs to happen before our next upcoming event? Give me a checklist.', icon: Calendar },
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
  let lastAgent: string | null = null;

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
        // Add divider between different agent sections
        if (lastAgent !== null && lastAgent !== name) {
          parts.push(
            <div key={`div-${i}`} style={{
              height: 1,
              margin: '14px 0',
              background: `linear-gradient(90deg, transparent, ${color}30, rgba(212,165,116,0.2), transparent)`,
            }} />
          );
        }
        lastAgent = name;
        parts.push(
          <div key={`a-${i}`} className="advisor-agent-tag" style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: i > 0 ? 14 : 0, marginBottom: 8,
          }}>
            <div className="advisor-agent-icon" style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${color}25, ${color}10)`,
              border: `1.5px solid ${color}40`,
              boxShadow: `0 0 12px ${color}20, inset 0 1px 0 ${color}15`,
              animation: 'agentIconFloat 3s ease-in-out infinite',
            }}>
              <Icon style={{ width: 13, height: 13, color }} />
            </div>
            <span className="advisor-agent-name" style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'agentGlow 3s ease-in-out infinite',
              padding: '3px 10px', borderRadius: 6,
              border: `1px solid ${color}25`,
              // @ts-expect-error -- textShadow used for the glow animation fallback
              '--agent-color': color,
            }}>{name}</span>
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

// ─── Typewriter text component ───
function TypewriterText({ text, delay = 50 }: { text: string; delay?: number }) {
  const [visibleWords, setVisibleWords] = useState(0);
  const words = useMemo(() => text.split(' '), [text]);

  useEffect(() => {
    if (visibleWords < words.length) {
      const timer = setTimeout(() => setVisibleWords(v => v + 1), delay);
      return () => clearTimeout(timer);
    }
  }, [visibleWords, words.length, delay]);

  return (
    <>
      {words.map((word, i) => (
        <span key={i} style={{
          opacity: i < visibleWords ? 1 : 0,
          transform: i < visibleWords ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          display: 'inline-block',
          marginRight: '0.25em',
        }}>{word}</span>
      ))}
    </>
  );
}

// ─── Streaming Response: word-by-word reveal for new AI messages ───
function StreamingResponse({ content, onComplete }: { content: string; onComplete: () => void }) {
  const [visibleChars, setVisibleChars] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (visibleChars < content.length) {
      // Variable speed: faster for spaces/punctuation, slower for new words
      const nextChar = content[visibleChars];
      const speed = nextChar === ' ' ? 8 : nextChar === '\n' ? 30 : 12;
      const timer = setTimeout(() => setVisibleChars(v => Math.min(v + 2, content.length)), speed);
      return () => clearTimeout(timer);
    } else if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [visibleChars, content, onComplete]);

  const visibleContent = content.slice(0, visibleChars);
  const formatted = formatAgentResponse(visibleContent);

  return (
    <div style={{ position: 'relative' }}>
      {formatted}
      {visibleChars < content.length && (
        <span style={{
          display: 'inline-block',
          width: 2, height: 14,
          background: 'linear-gradient(180deg, #d4a574, #8b5cf6)',
          borderRadius: 1,
          marginLeft: 2,
          verticalAlign: 'middle',
          animation: 'cursorBlink 0.8s ease-in-out infinite',
        }} />
      )}
    </div>
  );
}

// ─── Message Feedback (Thumbs up/down) ───
function MessageFeedback({ msgId, feedback, onFeedback }: {
  msgId: string;
  feedback: 'up' | 'down' | null;
  onFeedback: (msgId: string, type: 'up' | 'down') => void;
}) {
  const [animating, setAnimating] = useState<'up' | 'down' | null>(null);

  const handleClick = (type: 'up' | 'down') => {
    setAnimating(type);
    onFeedback(msgId, type);
    setTimeout(() => setAnimating(null), 600);
  };

  return (
    <div style={{
      display: 'flex', gap: 4, marginTop: 8, justifyContent: 'flex-start',
      animation: 'timestampFade 0.6s ease 0.5s both',
    }}>
      <button
        onClick={() => handleClick('up')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26, borderRadius: 8,
          background: feedback === 'up' ? 'rgba(107,143,113,0.15)' : 'transparent',
          border: feedback === 'up' ? '1px solid rgba(107,143,113,0.3)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: animating === 'up' ? 'scale(1.3)' : 'scale(1)',
        }}
        onMouseEnter={e => { if (!feedback) { e.currentTarget.style.background = 'rgba(107,143,113,0.08)'; e.currentTarget.style.borderColor = 'rgba(107,143,113,0.15)'; }}}
        onMouseLeave={e => { if (!feedback) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}}
      >
        <ThumbsUp style={{
          width: 12, height: 12,
          color: feedback === 'up' ? '#6b8f71' : '#4a4540',
          transition: 'color 0.2s ease',
          ...(animating === 'up' ? { filter: 'drop-shadow(0 0 4px rgba(107,143,113,0.5))' } : {}),
        }} />
      </button>
      <button
        onClick={() => handleClick('down')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26, borderRadius: 8,
          background: feedback === 'down' ? 'rgba(239,68,68,0.1)' : 'transparent',
          border: feedback === 'down' ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: animating === 'down' ? 'scale(1.3)' : 'scale(1)',
        }}
        onMouseEnter={e => { if (!feedback) { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.12)'; }}}
        onMouseLeave={e => { if (!feedback) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}}
      >
        <ThumbsDown style={{
          width: 12, height: 12,
          color: feedback === 'down' ? '#f87171' : '#4a4540',
          transition: 'color 0.2s ease',
          ...(animating === 'down' ? { filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.4))' } : {}),
        }} />
      </button>
      {feedback && (
        <span style={{
          fontSize: 10, color: feedback === 'up' ? '#6b8f71' : '#f87171',
          marginLeft: 4, alignSelf: 'center',
          animation: 'chipEntry 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: 0.7,
        }}>
          {feedback === 'up' ? 'Helpful' : 'Not helpful'}
        </span>
      )}
    </div>
  );
}

// ─── Agent Hover Preview Tooltip ───
function AgentPreviewTooltip({ name, color, icon: Icon, description, visible }: {
  name: string; color: string; icon: React.ElementType; description: string; visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
      padding: '10px 14px', borderRadius: 12, minWidth: 180, zIndex: 20,
      background: 'rgba(11,13,20,0.92)',
      border: `1px solid ${color}30`,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 16px ${color}10`,
      animation: 'agentTooltipIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: 'none',
    }}>
      {/* Arrow */}
      <div style={{
        position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
        width: 10, height: 10,
        background: 'rgba(11,13,20,0.92)',
        borderRight: `1px solid ${color}30`,
        borderBottom: `1px solid ${color}30`,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}25, ${color}10)`,
          border: `1.5px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 8px ${color}20`,
        }}>
          <Icon style={{ width: 11, height: 11, color }} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>{name}</span>
      </div>
      <p style={{ fontSize: 11, color: '#a09888', lineHeight: 1.5, margin: 0 }}>{description}</p>
      <div style={{
        marginTop: 6, paddingTop: 6,
        borderTop: `1px solid ${color}15`,
        fontSize: 10, color: '#6b6358',
      }}>
        Click to focus this agent
      </div>
    </div>
  );
}

// ─── Agent Avatar with pulsing glow ───
function AgentAvatar({ agentName, size = 32, thinking = false }: { agentName?: string; size?: number; thinking?: boolean }) {
  const info = agentName ? AGENT_COLORS[agentName] : null;
  const color = info?.color || '#8b5cf6';
  const Icon = info?.icon || Bot;
  const radius = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Pulsing glow ring when thinking */}
      {thinking && (
        <>
          <div style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            animation: 'avatarPulse 2s ease-in-out infinite',
          }} />
          <svg width={size + 8} height={size + 8} style={{
            position: 'absolute', top: -4, left: -4,
            animation: 'progressRing 2s linear infinite',
          }}>
            <circle cx={radius + 4} cy={radius + 4} r={radius + 2} fill="none" stroke={`${color}20`} strokeWidth="1.5" />
            <circle cx={radius + 4} cy={radius + 4} r={radius + 2} fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="30 70"
              strokeLinecap="round"
              style={{ opacity: 0.7 }}
            />
          </svg>
        </>
      )}
      {/* Avatar circle */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}30, ${color}10)`,
        border: `1.5px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: thinking
          ? `0 0 16px ${color}30, 0 0 32px ${color}10`
          : `0 0 12px ${color}15`,
        transition: 'box-shadow 0.5s ease',
        position: 'relative', zIndex: 1,
      }}>
        <Icon style={{ width: size * 0.45, height: size * 0.45, color }} />
      </div>
    </div>
  );
}

// ─── Context Indicator ───
function ContextIndicator({ context, contextSize }: { context: string; contextSize: number }) {
  const [expanded, setExpanded] = useState(false);

  const contextItems = useMemo(() => {
    const items: { label: string; icon: React.ElementType; color: string }[] = [];
    if (context.includes('TASKS')) items.push({ label: 'Tasks', icon: Target, color: '#d4a574' });
    if (context.includes('OKRs')) items.push({ label: 'OKRs', icon: TrendingUp, color: '#8b5cf6' });
    if (context.includes('NODES')) items.push({ label: 'Nodes', icon: Network, color: '#6b8f71' });
    if (context.includes('TEAM')) items.push({ label: 'Team', icon: Users, color: '#38bdf8' });
    if (context.includes('EVENTS')) items.push({ label: 'Events', icon: Calendar, color: '#4ade80' });
    if (context.includes('GOVERNANCE')) items.push({ label: 'Governance', icon: Shield, color: '#10b981' });
    if (context.includes('KPIs')) items.push({ label: 'KPIs', icon: TrendingUp, color: '#fb923c' });
    return items;
  }, [context]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20,
          background: 'rgba(139,92,246,0.06)',
          border: '1px solid rgba(139,92,246,0.12)',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)';
          e.currentTarget.style.background = 'rgba(139,92,246,0.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)';
          e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
        }}
      >
        <Database style={{ width: 11, height: 11, color: '#8b5cf6' }} />
        <span style={{ fontSize: 10, color: '#a09888', fontWeight: 500 }}>~{contextSize} tokens</span>
        <Eye style={{ width: 10, height: 10, color: '#6b6358' }} />
      </button>

      {expanded && (
        <div className="card-premium" style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          padding: '12px 14px', borderRadius: 12, minWidth: 220, zIndex: 10,
          background: 'rgba(19,23,32,0.95)',
          border: '1px solid rgba(30,38,56,0.6)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'messageSlideIn 0.2s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Lock style={{ width: 11, height: 11, color: '#6b8f71' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#f0ebe4' }}>Data Context</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {contextItems.map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: `${item.color}12`, border: `1px solid ${item.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ItemIcon style={{ width: 11, height: 11, color: item.color }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#a09888' }}>{item.label}</span>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', marginLeft: 'auto',
                    background: '#6b8f71', boxShadow: '0 0 4px rgba(107,143,113,0.4)',
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: 10, paddingTop: 8,
            borderTop: '1px solid rgba(30,38,56,0.4)',
            fontSize: 10, color: '#6b6358', lineHeight: 1.4,
          }}>
            Live data feeds into every agent response for contextual analysis.
          </div>
        </div>
      )}
    </div>
  );
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
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(0);
  const [prevLoadingAgent, setPrevLoadingAgent] = useState(0);
  const [agentTransition, setAgentTransition] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [restoredVisible, setRestoredVisible] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
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
          setRestoredVisible(true);
          setTimeout(() => setRestoredVisible(false), 2500);
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

  // Rotating agent during loading with smooth crossfade
  useEffect(() => {
    if (!isLoading) return;
    const iv = setInterval(() => {
      setAgentTransition(true);
      setTimeout(() => {
        setPrevLoadingAgent(loadingAgent);
        setLoadingAgent(p => (p + 1) % AGENT_NAMES.length);
        setTimeout(() => setAgentTransition(false), 50);
      }, 300);
    }, 2200);
    return () => clearInterval(iv);
  }, [isLoading, loadingAgent]);

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
    // Prepend selected agent context if one is focused
    const finalContent = selectedAgent
      ? `${selectedAgent} Agent: ${content.trim()}`
      : content.trim();
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: finalContent, timestamp: new Date() };
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
      const asstId = `asst-${Date.now()}`;
      setStreamingMsgId(asstId);
      setMessages(prev => [...prev, { id: asstId, role: 'assistant', content: data.message, timestamp: new Date(), isNew: true }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setIsLoading(false); }
  }, [messages, isLoading, context, teamMemberId, selectedAgent]);

  const handleFeedback = useCallback((msgId: string, type: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, [msgId]: prev[msgId] === type ? null : type }));
  }, []);

  const handleStreamComplete = useCallback(() => {
    setStreamingMsgId(null);
    // Mark message as no longer new after streaming completes
    setMessages(prev => prev.map(m => m.id === streamingMsgId ? { ...m, isNew: false } : m));
  }, [streamingMsgId]);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    if (storageKey) try { localStorage.removeItem(storageKey); } catch { /* */ }
  };

  const suggestions = getSuggestions(messages);
  const agentName = AGENT_NAMES[loadingAgent];
  const agentInfo = AGENT_COLORS[agentName];
  const prevAgentName = AGENT_NAMES[prevLoadingAgent];
  const prevAgentInfo = AGENT_COLORS[prevAgentName];
  const activeAgentColor = selectedAgent ? AGENT_COLORS[selectedAgent]?.color || '#d4a574' : '#d4a574';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{`
        /* ── Core Animations ── */
        @keyframes messageSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes agentGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
        @keyframes typingPremium {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.2; }
          40% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes fadeRotate {
          from { opacity: 0; transform: scale(0.8) rotate(-10deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes inputFocusGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(212,165,116,0.2), 0 0 0 rgba(212,165,116,0); }
          50% { box-shadow: 0 0 0 1px rgba(212,165,116,0.35), 0 0 20px rgba(212,165,116,0.08); }
        }
        @keyframes premiumPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes gradientOrb {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes agentIconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        @keyframes progressRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes chipEntry {
          from { opacity: 0; transform: translateY(6px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chipBounce {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes errorPulse {
          0%, 100% { border-color: rgba(239,68,68,0.15); }
          50% { border-color: rgba(239,68,68,0.35); }
        }
        @keyframes retryRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes dotPattern {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes restoredFade {
          0% { opacity: 0; transform: translateX(8px); }
          15% { opacity: 1; transform: translateX(0); }
          85% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-4px); }
        }
        @keyframes timestampFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sendBtnHover {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes avatarPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        @keyframes agentCardGlow {
          0%, 100% { box-shadow: var(--glow-idle); }
          50% { box-shadow: var(--glow-active); }
        }
        @keyframes promptIconSpin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(12deg) scale(1.1); }
        }
        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes inputBarGlow {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes agentTooltipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.96); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes feedbackPop {
          0% { transform: scale(1); }
          40% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        @keyframes thinkingPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes glassShimmer {
          0% { background-position: -200% 50%; }
          100% { background-position: 200% 50%; }
        }

        /* ── Message Styles ── */
        .advisor-msg {
          animation: messageSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ── Quick Prompt Hover (Glassmorphism pills) ── */
        .advisor-quick {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .advisor-quick::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(212,165,116,0), rgba(139,92,246,0));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          transition: background 0.3s ease;
          pointer-events: none;
        }
        .advisor-quick:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(212,165,116,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
          background: rgba(19,23,32,0.75) !important;
          color: #d4a574 !important;
        }
        .advisor-quick:hover::before {
          background: linear-gradient(135deg, rgba(212,165,116,0.5), rgba(139,92,246,0.5));
        }
        .advisor-quick:hover .advisor-quick-icon {
          animation: promptIconSpin 0.4s ease;
          color: #d4a574 !important;
        }
        .advisor-quick:active {
          transform: translateY(0) scale(0.97);
        }

        /* ── Suggestion Chips ── */
        .advisor-chip {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
        }
        .advisor-chip::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(212,165,116,0), rgba(139,92,246,0));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          transition: background 0.25s ease;
          pointer-events: none;
        }
        .advisor-chip:hover {
          background: rgba(212,165,116,0.1) !important;
          border-color: rgba(212,165,116,0.25) !important;
          transform: translateY(-1px);
        }
        .advisor-chip:hover::before {
          background: linear-gradient(135deg, rgba(212,165,116,0.4), rgba(139,92,246,0.4));
        }
        .advisor-chip:active {
          animation: chipBounce 0.2s ease;
        }

        /* ── Send Button ── */
        .advisor-send-active:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(212,165,116,0.3);
        }
        .advisor-send-active:active {
          transform: scale(0.95);
        }

        /* ── Retry Button ── */
        .advisor-retry:hover .advisor-retry-icon {
          animation: retryRotate 0.5s ease;
        }

        /* ── Clear Button ── */
        .advisor-clear:hover {
          background: rgba(160,152,136,0.15) !important;
          border-color: rgba(160,152,136,0.25) !important;
        }

        /* ── Agent Card Hover ── */
        .advisor-agent-card {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .advisor-agent-card:hover {
          transform: translateY(-2px) scale(1.02);
        }

        /* ── Agent Legend Tags ── */
        .advisor-legend-tag {
          transition: all 0.2s ease;
        }
        .advisor-legend-tag:hover {
          transform: translateY(-1px);
        }

        /* ── Scrollbar ── */
        .advisor-messages::-webkit-scrollbar { width: 4px; }
        .advisor-messages::-webkit-scrollbar-track { background: transparent; }
        .advisor-messages::-webkit-scrollbar-thumb { background: rgba(160,152,136,0.15); border-radius: 4px; }
        .advisor-messages::-webkit-scrollbar-thumb:hover { background: rgba(160,152,136,0.25); }

        /* ── User Bubble Glow ── */
        .advisor-user-bubble {
          position: relative;
        }
        .advisor-user-bubble::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px 16px 4px 16px;
          background: linear-gradient(135deg, rgba(212,165,116,0.06), transparent);
          pointer-events: none;
        }

        /* ── Assistant Bubble ── */
        .advisor-asst-bubble {
          position: relative;
        }
        .advisor-asst-bubble::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 3px;
          pointer-events: none;
        }
      `}</style>

      {/* Subtle animated dot pattern background for welcome screen */}
      {messages.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 70%)',
        }}>
          <svg width="100%" height="100%" style={{ opacity: 0.4, animation: 'dotPattern 8s ease-in-out infinite' }}>
            <defs>
              <pattern id="advisor-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.6" fill="rgba(212,165,116,0.25)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#advisor-dots)" />
          </svg>
        </div>
      )}

      {/* Header */}
      <div className="noise-overlay dot-pattern" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', marginBottom: 12, borderBottom: '1px solid rgba(30,38,56,0.5)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(212,165,116,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(212,165,116,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(212,165,116,0.08), 0 0 40px rgba(139,92,246,0.05)',
          }}>
            <Sparkles style={{ width: 20, height: 20, color: '#d4a574' }} />
          </div>
          <div>
            <h2 className="text-glow" style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Advisory Board</h2>
            <p style={{ fontSize: 12, color: '#6b6358', margin: 0 }}>
              8 AI agents
              {selectedAgent && (
                <span style={{ color: AGENT_COLORS[selectedAgent]?.color, fontWeight: 600 }}>
                  {' '}&middot; {selectedAgent} focused
                </span>
              )}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ContextIndicator context={context} contextSize={contextSize} />
          {restored && (
            <span style={{
              fontSize: 11, color: '#6b6358', fontStyle: 'italic',
              opacity: restoredVisible ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}>Conversation restored</span>
          )}
          {messages.length > 0 && (
            <button onClick={clearChat} className="advisor-clear" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: 'rgba(160,152,136,0.08)', color: '#6b6358', border: '1px solid rgba(160,152,136,0.12)', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              <Trash2 style={{ width: 12, height: 12 }} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="advisor-messages scrollbar-autohide" style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 12, position: 'relative', zIndex: 1 }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 28 }}>
            {/* Premium pulsing bot icon with gradient glow */}
            <div style={{ position: 'relative' }}>
              {/* Outer glow ring */}
              <div style={{
                position: 'absolute', inset: -12,
                borderRadius: 32,
                background: 'radial-gradient(circle, rgba(212,165,116,0.12) 0%, rgba(139,92,246,0.08) 50%, transparent 70%)',
                animation: 'gradientOrb 4s ease-in-out infinite',
                filter: 'blur(8px)',
              }} />
              {/* Secondary glow ring */}
              <div style={{
                position: 'absolute', inset: -6,
                borderRadius: 28,
                background: 'radial-gradient(circle, rgba(212,165,116,0.08) 0%, rgba(139,92,246,0.06) 60%, transparent 80%)',
                animation: 'gradientOrb 4s ease-in-out infinite 0.5s',
              }} />
              <div className="card-premium" style={{
                position: 'relative',
                width: 80, height: 80, borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(212,165,116,0.12), rgba(139,92,246,0.1), rgba(212,165,116,0.08))',
                backgroundSize: '200% 200%',
                animation: 'premiumPulse 4s ease-in-out infinite, gradientShift 6s ease infinite',
                border: '1px solid rgba(212,165,116,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(212,165,116,0.08), 0 0 60px rgba(139,92,246,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
              }}>
                <Bot style={{ width: 36, height: 36, color: '#d4a574' }} />
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f0ebe4', marginBottom: 8, letterSpacing: '-0.01em' }}>Frequency Advisory Board</h3>
              <p style={{ fontSize: 13, color: '#6b6358', maxWidth: 420, lineHeight: 1.7 }}>
                <TypewriterText text="8 specialized AI agents with full context of your team, tasks, OKRs, nodes, events, and governance. Ask anything." delay={50} />
              </p>
            </div>

            {/* Agent Selector Grid */}
            <div style={{ maxWidth: 600, width: '100%' }}>
              <button onClick={() => setAgentsExpanded(!agentsExpanded)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6358', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {Object.entries(AGENT_COLORS).map(([n, { color, icon: I }]) => (
                    <span key={n} style={{
                      display: 'inline-flex',
                      filter: `drop-shadow(0 0 3px ${color}60)`,
                    }}>
                      <I style={{ width: 11, height: 11, color, opacity: 0.85 }} />
                    </span>
                  ))}
                </span>
                <span>Select Agent</span>
                <ChevronDown style={{ width: 12, height: 12, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', transform: agentsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              {agentsExpanded && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
                  marginTop: 12,
                  animation: 'messageSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                  {/* All Agents card */}
                  <div
                    className="advisor-agent-card card-interactive"
                    onClick={() => setSelectedAgent(null)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '12px 8px', borderRadius: 12,
                      background: !selectedAgent
                        ? 'linear-gradient(135deg, rgba(212,165,116,0.12), rgba(139,92,246,0.08))'
                        : 'rgba(19,23,32,0.6)',
                      border: !selectedAgent
                        ? '1.5px solid rgba(212,165,116,0.35)'
                        : '1px solid rgba(30,38,56,0.5)',
                      boxShadow: !selectedAgent
                        ? '0 0 16px rgba(212,165,116,0.12), inset 0 1px 0 rgba(255,255,255,0.03)'
                        : 'none',
                      animation: `messageSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0s both`,
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(139,92,246,0.15))',
                      border: '1.5px solid rgba(212,165,116,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MessageSquare style={{ width: 14, height: 14, color: '#d4a574' }} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: !selectedAgent ? '#d4a574' : '#a09888', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'center' }}>All</span>
                  </div>
                  {Object.entries(AGENT_COLORS).map(([n, { color, icon: I, description }], idx) => {
                    const isActive = selectedAgent === n;
                    const isHovered = hoveredAgent === n;
                    return (
                      <div
                        key={n}
                        className="advisor-agent-card card-interactive"
                        onClick={() => setSelectedAgent(isActive ? null : n)}
                        onMouseEnter={() => setHoveredAgent(n)}
                        onMouseLeave={() => setHoveredAgent(null)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          padding: '12px 8px', borderRadius: 12,
                          position: 'relative',
                          background: isActive
                            ? `linear-gradient(135deg, ${color}15, ${color}08)`
                            : isHovered
                              ? `linear-gradient(135deg, ${color}0a, ${color}05)`
                              : 'rgba(19,23,32,0.6)',
                          border: isActive
                            ? `1.5px solid ${color}50`
                            : isHovered
                              ? `1px solid ${color}25`
                              : '1px solid rgba(30,38,56,0.5)',
                          boxShadow: isActive
                            ? `0 0 16px ${color}18, inset 0 1px 0 ${color}10`
                            : isHovered
                              ? `0 0 12px ${color}10`
                              : 'none',
                          animation: `messageSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${(idx + 1) * 0.04}s both`,
                          transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                        }}
                      >
                        {/* Hover preview tooltip */}
                        <AgentPreviewTooltip
                          name={n}
                          color={color}
                          icon={I}
                          description={description}
                          visible={isHovered && !isActive}
                        />
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${color}25, ${color}10)`,
                          border: `1.5px solid ${isActive ? `${color}60` : isHovered ? `${color}45` : `${color}30`}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: isActive ? `0 0 12px ${color}25` : isHovered ? `0 0 8px ${color}15` : 'none',
                          transition: 'box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
                          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                        }}>
                          <I style={{ width: 14, height: 14, color }} />
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, color: isActive || isHovered ? color : '#a09888', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'center', lineHeight: 1.2, transition: 'color 0.2s ease' }}>{n}</span>
                        <span style={{ fontSize: 8, color: '#6b6358', textAlign: 'center', lineHeight: 1.2, maxWidth: '100%' }}>{description}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick prompts -- glassmorphism pills */}
            <div style={{ width: '100%', maxWidth: 600 }}>
              <p style={{ fontSize: 11, color: '#6b6358', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>Quick prompts</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {QUICK_PROMPTS.map((qp, i) => {
                  const QpIcon = qp.icon;
                  return (
                    <button key={i} onClick={() => sendMessage(qp.prompt)} className="advisor-quick card-interactive" style={{
                      padding: '10px 18px', borderRadius: 24, textAlign: 'left',
                      background: 'rgba(19,23,32,0.45)',
                      border: '1px solid rgba(139,92,246,0.12)',
                      color: '#a09888', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                      lineHeight: 1.4,
                      display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
                      animation: `chipEntry 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.06}s both`,
                    }}>
                      <QpIcon className="advisor-quick-icon" style={{
                        width: 13, height: 13, color: '#a09888', transition: 'color 0.3s ease',
                        flexShrink: 0,
                      }} />
                      <span>{qp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, msgIdx) => {
              // Detect agent from assistant response
              const responseAgent = msg.role === 'assistant'
                ? AGENT_NAMES.find(n => msg.content.includes(`[${n}]`))
                : undefined;

              return (
                <div key={msg.id}>
                  {/* Gradient divider between message groups */}
                  {msgIdx > 0 && messages[msgIdx - 1].role !== msg.role && (
                    <div style={{
                      height: 1, margin: '4px 44px 4px 44px',
                      background: 'linear-gradient(90deg, transparent, rgba(212,165,116,0.08), rgba(139,92,246,0.08), transparent)',
                    }} />
                  )}
                  <div className="advisor-msg" style={{
                    display: 'flex', gap: 12, marginBottom: 16,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    animationDelay: `${Math.min(msgIdx * 0.05, 0.3)}s`,
                    animationFillMode: 'both',
                  }}>
                    {/* Avatar */}
                    {msg.role === 'user' ? (
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(212,165,116,0.25), rgba(212,165,116,0.1))',
                        border: '1.5px solid rgba(212,165,116,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 12px rgba(212,165,116,0.1)',
                      }}>
                        <User style={{ width: 15, height: 15, color: '#d4a574' }} />
                      </div>
                    ) : (
                      <AgentAvatar agentName={responseAgent} size={34} />
                    )}

                    {/* Message Bubble */}
                    {msg.role === 'user' ? (
                      <div className="advisor-user-bubble" style={{
                        maxWidth: '75%', padding: '12px 16px',
                        borderRadius: '16px 16px 4px 16px',
                        background: 'linear-gradient(135deg, rgba(212,165,116,0.12), rgba(212,165,116,0.05))',
                        border: '1px solid rgba(212,165,116,0.2)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 2px 12px rgba(212,165,116,0.06)',
                      }}>
                        <p style={{ fontSize: 13, color: '#f0ebe4', lineHeight: 1.6, margin: 0 }}>{msg.content}</p>
                        <div style={{
                          fontSize: 10, color: 'rgba(212,165,116,0.4)', marginTop: 6, textAlign: 'right',
                          animation: 'timestampFade 0.6s ease 0.3s both',
                        }}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        maxWidth: '80%', padding: '14px 16px',
                        borderRadius: '16px 16px 16px 4px',
                        background: 'rgba(19,23,32,0.85)',
                        border: `1px solid ${responseAgent ? `${AGENT_COLORS[responseAgent]?.color}18` : 'rgba(139,92,246,0.1)'}`,
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(139,92,246,0.05)',
                        borderLeft: `3px solid ${responseAgent ? `${AGENT_COLORS[responseAgent]?.color}50` : 'rgba(139,92,246,0.3)'}`,
                      }}>
                        {/* Streaming animation for new messages, static for restored */}
                        <div>
                          {msg.isNew && msg.id === streamingMsgId
                            ? <StreamingResponse content={msg.content} onComplete={handleStreamComplete} />
                            : formatAgentResponse(msg.content)
                          }
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginTop: 6,
                        }}>
                          <div style={{
                            fontSize: 10, color: '#4a4540',
                            animation: 'timestampFade 0.6s ease 0.3s both',
                          }}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {/* Feedback thumbs up/down */}
                        <MessageFeedback
                          msgId={msg.id}
                          feedback={feedback[msg.id] || null}
                          onFeedback={handleFeedback}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Post-response suggestion chips -- glassmorphism pills */}
            {!isLoading && suggestions.length > 0 && !streamingMsgId && (
              <div className="advisor-msg" style={{
                display: 'flex', gap: 8, marginBottom: 16, marginLeft: 46, flexWrap: 'wrap',
                alignItems: 'center',
              }}>
                <Sparkles style={{ width: 12, height: 12, color: '#6b6358', marginTop: 1, flexShrink: 0 }} />
                {suggestions.map((s, i) => (
                  <button key={i} className="advisor-chip" onClick={() => sendMessage(s)} style={{
                    padding: '7px 16px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                    background: 'rgba(19,23,32,0.45)', color: '#a09888',
                    border: '1px solid rgba(139,92,246,0.12)', fontFamily: 'inherit',
                    animation: `chipEntry 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s both`,
                    position: 'relative',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.02)',
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Thinking indicator with "Agent is thinking..." */}
            {isLoading && (
              <div className="advisor-msg" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <AgentAvatar agentName={agentName} size={34} thinking />
                <div style={{
                  padding: '14px 18px', borderRadius: '16px 16px 16px 4px',
                  background: 'rgba(19,23,32,0.85)', border: '1px solid rgba(30,38,56,0.5)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  borderLeft: `3px solid ${agentInfo?.color || '#8b5cf6'}40`,
                  transition: 'border-left-color 0.5s ease',
                  minWidth: 220,
                }}>
                  {/* "Agent is thinking..." label */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                    animation: 'thinkingPulse 2s ease-in-out infinite',
                  }}>
                    <Sparkles style={{ width: 12, height: 12, color: agentInfo?.color || '#8b5cf6', opacity: 0.7 }} />
                    <span style={{ fontSize: 11, color: '#a09888', fontWeight: 500 }}>Agent is thinking</span>
                  </div>
                  {/* Premium typing dots with agent crossfade */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${agentInfo?.color || '#8b5cf6'}, ${agentInfo?.color || '#8b5cf6'}aa)`,
                          animation: 'typingPremium 1.4s ease-in-out infinite',
                          animationDelay: `${i * 0.15}s`,
                          boxShadow: `0 0 6px ${agentInfo?.color || '#8b5cf6'}40`,
                          transition: 'background 0.6s ease, box-shadow 0.6s ease',
                        }} />
                      ))}
                    </div>
                    {/* Smooth crossfading agent name */}
                    <div style={{ position: 'relative', height: 16, display: 'flex', alignItems: 'center', minWidth: 140 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 500, marginLeft: 2,
                        position: 'absolute', left: 0, whiteSpace: 'nowrap',
                        color: prevAgentInfo?.color || '#6b6358',
                        opacity: agentTransition ? 0 : 0,
                        transform: agentTransition ? 'translateY(-6px)' : 'translateY(-6px)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease, color 0.3s ease',
                      }}>{prevAgentName} analyzing...</span>
                      <span style={{
                        fontSize: 12, fontWeight: 500, marginLeft: 2,
                        position: 'absolute', left: 0, whiteSpace: 'nowrap',
                        color: agentInfo?.color || '#6b6358',
                        opacity: agentTransition ? 0 : 1,
                        transform: agentTransition ? 'translateY(6px)' : 'translateY(0)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease, color 0.6s ease',
                      }}>{agentName} analyzing...</span>
                    </div>
                  </div>
                  {/* Shimmer bar at bottom */}
                  <div style={{
                    marginTop: 10, height: 2, borderRadius: 1, overflow: 'hidden',
                    background: 'rgba(30,38,56,0.3)',
                  }}>
                    <div style={{
                      width: '40%', height: '100%',
                      background: `linear-gradient(90deg, transparent, ${agentInfo?.color || '#8b5cf6'}60, transparent)`,
                      backgroundSize: '200% 100%',
                      animation: 'glassShimmer 1.5s ease-in-out infinite',
                    }} />
                  </div>
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
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, marginBottom: 8,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
          animation: 'errorPulse 2s ease-in-out infinite, messageSlideIn 0.3s ease',
          backdropFilter: 'blur(8px)',
        }}>
          <AlertCircle style={{ width: 14, height: 14, color: '#f87171', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#f87171', flex: 1 }}>{error}</span>
          <button className="advisor-retry" onClick={() => { setError(null); if (messages.length > 0) { const last = messages[messages.length - 1]; if (last.role === 'user') sendMessage(last.content); } }} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: 11,
            background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            <RotateCcw className="advisor-retry-icon" style={{ width: 11, height: 11 }} /> Retry
          </button>
        </div>
      )}

      {/* Premium Input Area */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Selected agent indicator above input */}
        {selectedAgent && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 6, paddingLeft: 16,
            animation: 'messageSlideIn 0.2s ease',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: AGENT_COLORS[selectedAgent]?.color,
              boxShadow: `0 0 6px ${AGENT_COLORS[selectedAgent]?.color}50`,
            }} />
            <span style={{ fontSize: 10, color: AGENT_COLORS[selectedAgent]?.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Directing to {selectedAgent}
            </span>
            <button onClick={() => setSelectedAgent(null)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
              fontSize: 10, color: '#6b6358', borderRadius: 4,
            }}>
              Clear
            </button>
          </div>
        )}

        <div className="card-premium" style={{
          display: 'flex', alignItems: 'flex-end', gap: 10, padding: '12px 16px', borderRadius: 16,
          background: 'rgba(19,23,32,0.85)',
          border: `1px solid ${inputFocused
            ? (selectedAgent ? `${activeAgentColor}30` : 'rgba(212,165,116,0.25)')
            : 'rgba(30,38,56,0.5)'}`,
          backdropFilter: 'blur(16px)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          boxShadow: inputFocused
            ? `0 0 0 1px ${selectedAgent ? `${activeAgentColor}10` : 'rgba(212,165,116,0.1)'}, 0 0 20px ${selectedAgent ? `${activeAgentColor}08` : 'rgba(212,165,116,0.06)'}, 0 4px 16px rgba(0,0,0,0.15)`
            : '0 2px 8px rgba(0,0,0,0.1)',
          animation: inputFocused ? 'inputFocusGlow 3s ease-in-out infinite' : 'none',
          position: 'relative',
        }}>
          {/* Animated border gradient when focused */}
          {inputFocused && (
            <div style={{
              position: 'absolute', inset: -1, borderRadius: 17,
              padding: 1,
              background: `linear-gradient(90deg, ${activeAgentColor}00, ${activeAgentColor}30, rgba(139,92,246,0.2), ${activeAgentColor}00)`,
              backgroundSize: '200% 100%',
              animation: 'borderFlow 3s linear infinite',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
              opacity: 0.6,
            }} />
          )}

          <textarea
            ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)}
            placeholder={selectedAgent ? `Ask ${selectedAgent} agent...` : 'Ask the advisory board anything...'} rows={1}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none', background: 'transparent',
              color: '#f0ebe4', fontSize: 14, lineHeight: 1.5, fontFamily: 'inherit',
              maxHeight: 120, minHeight: 24,
              transition: 'height 0.15s ease',
            }}
            onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = '24px'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
          />
          <button
            onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
            className={input.trim() && !isLoading ? 'advisor-send-active' : ''}
            style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: input.trim() && !isLoading
                ? `linear-gradient(135deg, ${activeAgentColor}, ${selectedAgent ? `${activeAgentColor}cc` : '#c4925a'})`
                : 'rgba(160,152,136,0.06)',
              border: input.trim() && !isLoading
                ? `1px solid ${activeAgentColor}40`
                : '1px solid rgba(160,152,136,0.08)',
              cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: !input.trim() && !isLoading ? 0.5 : 1,
              boxShadow: input.trim() && !isLoading ? `0 2px 12px ${activeAgentColor}30` : 'none',
            }}
          >
            {isLoading ? <Loader2 style={{ width: 16, height: 16, color: '#6b6358', animation: 'progressRing 1s linear infinite' }} /> : <Send style={{ width: 16, height: 16, color: input.trim() ? '#0b0d14' : '#6b6358', transition: 'color 0.2s ease' }} />}
          </button>
        </div>
      </div>
    </div>
  );
}
