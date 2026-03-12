'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Send, Sparkles, Loader2, ChevronDown, Zap, Target, Users,
  Shield, Heart, Calendar, TrendingUp, Network, Bot,
  Database, ArrowRight, MessageCircle,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { getApiKey } from '@/lib/apiKey';

/* ─── Premium Keyframes & Scrollbar Styles ─── */
const PREMIUM_STYLES = `
@keyframes ia-spin {
  to { transform: rotate(360deg); }
}
@keyframes ia-slideDown {
  from { max-height: 0; opacity: 0; transform: translateY(-8px); }
  to   { max-height: 600px; opacity: 1; transform: translateY(0); }
}
@keyframes ia-slideUp {
  from { max-height: 600px; opacity: 1; transform: translateY(0); }
  to   { max-height: 0; opacity: 0; transform: translateY(-8px); }
}
@keyframes ia-slideInFromRight {
  from { opacity: 0; transform: translateX(24px) scale(0.97); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes ia-slideOutToRight {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to   { opacity: 0; transform: translateX(24px) scale(0.97); }
}
@keyframes ia-promptFadeIn {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ia-responseSlideUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ia-borderGlow {
  0%, 100% { border-left-color: rgba(139,92,246,0.35); }
  50%      { border-left-color: rgba(139,92,246,0.8); }
}
@keyframes ia-progressRing {
  0%   { stroke-dashoffset: 44; }
  50%  { stroke-dashoffset: 11; }
  100% { stroke-dashoffset: 44; }
}
@keyframes ia-sparkle {
  0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
  50%      { opacity: 1; transform: scale(1.25) rotate(180deg); }
}
@keyframes ia-ripple {
  0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.3); }
  100% { box-shadow: 0 0 0 10px rgba(139,92,246,0); }
}
@keyframes ia-fadeAgent {
  0%   { opacity: 0; transform: translateY(4px); }
  15%  { opacity: 1; transform: translateY(0); }
  85%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-4px); }
}
@keyframes ia-gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes ia-togglePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.2), 0 2px 8px rgba(0,0,0,0.15); }
  50% { box-shadow: 0 0 0 4px rgba(139,92,246,0.08), 0 4px 16px rgba(0,0,0,0.2); }
}
@keyframes ia-sparkleOrbit {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes ia-starTwinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.2); }
}
@keyframes ia-messageIn {
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ia-panelAppear {
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ia-dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40% { transform: scale(1.1); opacity: 1; }
}
@keyframes ia-shimmer {
  0% { background-position: -200% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes ia-contextPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes ia-quickActionIn {
  from { opacity: 0; transform: translateY(4px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Premium thin scrollbar */
.ia-scroll::-webkit-scrollbar { width: 4px; }
.ia-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 4px; }
.ia-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 4px; }
.ia-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.45); }
.ia-scroll { scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.25) transparent; }

/* Prompt button gradient border reveal + ripple on click */
.ia-prompt-btn {
  position: relative;
  overflow: hidden;
  background-clip: padding-box;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.ia-prompt-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  padding: 1px;
  background: linear-gradient(135deg, transparent, transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease, background 0.3s ease;
  pointer-events: none;
}
.ia-prompt-btn:hover::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(212,165,116,0.6), rgba(139,92,246,0.6), rgba(212,165,116,0.6));
}
.ia-prompt-btn:hover {
  transform: translateY(-1px);
  background: rgba(139,92,246,0.12) !important;
  border-color: rgba(212,165,116,0.25) !important;
  color: #d4a574 !important;
}
.ia-prompt-btn:active {
  transform: scale(0.96);
  animation: ia-ripple 0.4s ease-out;
}

/* Header press feedback */
.ia-header-btn {
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease;
}
.ia-header-btn:active {
  transform: scale(0.985);
}
.ia-header-btn:hover {
  background: rgba(139,92,246,0.04) !important;
}

/* Send button gradient hover */
.ia-send-btn {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.ia-send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4a574, #e8c49a) !important;
  transform: scale(1.08);
  box-shadow: 0 2px 12px rgba(212,165,116,0.3);
}
.ia-send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* Input focus glow & lift */
.ia-input:focus {
  border-color: rgba(212,165,116,0.5) !important;
  box-shadow: 0 0 0 2px rgba(212,165,116,0.12), 0 4px 16px rgba(0,0,0,0.15) !important;
  transform: translateY(-1px);
}
.ia-input {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Input bar lift on focus-within */
.ia-input-bar:focus-within {
  transform: translateY(-1px);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
}
.ia-input-bar {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Toggle button hover effects */
.ia-toggle-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.ia-toggle-btn:hover {
  transform: scale(1.02);
  background: rgba(139,92,246,0.06) !important;
}

/* Quick action buttons */
.ia-quick-action {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}
.ia-quick-action::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  padding: 1px;
  background: linear-gradient(135deg, transparent, transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  transition: background 0.25s ease;
  pointer-events: none;
}
.ia-quick-action:hover {
  transform: translateY(-1px);
  background: rgba(139,92,246,0.1) !important;
  border-color: rgba(139,92,246,0.25) !important;
}
.ia-quick-action:hover::before {
  background: linear-gradient(135deg, rgba(212,165,116,0.4), rgba(139,92,246,0.4));
}
.ia-quick-action:active {
  transform: scale(0.96);
}
`;

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
          <pre key={`code-${i}`} style={{
            backgroundColor: 'rgba(0,0,0,0.35)',
            borderRadius: 8,
            padding: '12px 14px',
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#c8c2b8',
            overflowX: 'auto',
            margin: '8px 0',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            border: '1px solid rgba(139,92,246,0.12)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
          }}>
            {codeBlock.join('\n')}
          </pre>
        );
        codeBlock = [];
        inCode = false;
      } else { inCode = true; }
      continue;
    }
    if (inCode) { codeBlock.push(line); continue; }

    // Agent tags with colored glow
    const agentMatch = line.match(/^\[([A-Z\s]+)\]/);
    if (agentMatch) {
      const name = agentMatch[1].trim();
      const info = AGENT_COLORS[name];
      const rest = line.slice(agentMatch[0].length).trim();
      const Icon = info?.icon || Bot;
      const agentColor = info?.color || C.accent;
      parts.push(
        <div key={`agent-${i}`} style={{
          display: 'flex', alignItems: 'flex-start', gap: 6, margin: '8px 0 2px',
          animation: 'ia-messageIn 0.3s ease both',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 1,
            width: 18, height: 18, borderRadius: '50%',
            background: `${agentColor}15`,
            border: `1px solid ${agentColor}30`,
            filter: `drop-shadow(0 0 4px ${agentColor}30)`,
          }}>
            <Icon size={10} style={{ color: agentColor }} />
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, color: agentColor, letterSpacing: '0.04em',
            textShadow: `0 0 8px ${agentColor}40`,
          }}>{name}</span>
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
          <span style={{ color: C.accent, fontSize: 10, marginTop: 3 }}>{'\u2022'}</span>
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

/* ─── Progress Ring SVG ─── */
function ProgressRing({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" style={{ position: 'absolute', top: -4, left: -4 }}>
      <circle
        cx="11" cy="11" r="7"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="44"
        strokeDashoffset="44"
        strokeLinecap="round"
        style={{
          animation: 'ia-progressRing 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          transformOrigin: 'center',
          opacity: 0.5,
        }}
      />
    </svg>
  );
}

/* ─── Sparkle Toggle Icon ─── */
function SparkleIcon({ active }: { active: boolean }) {
  return (
    <div style={{ position: 'relative', width: 16, height: 16 }}>
      <Sparkles size={16} style={{
        color: active ? '#d4a574' : C.textSec,
        transition: 'color 0.3s ease, transform 0.3s ease',
        transform: active ? 'scale(1.1)' : 'scale(1)',
      }} />
      {/* Orbiting sparkle dot */}
      {active && (
        <div style={{
          position: 'absolute', top: -2, left: -2,
          width: 20, height: 20,
          animation: 'ia-sparkleOrbit 3s linear infinite',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 8,
            width: 3, height: 3, borderRadius: '50%',
            background: '#d4a574',
            boxShadow: '0 0 4px rgba(212,165,116,0.6)',
            animation: 'ia-starTwinkle 1.5s ease-in-out infinite',
          }} />
        </div>
      )}
    </div>
  );
}

/* ─── Context Indicator: shows what data the advisor is analyzing ─── */
function ContextBadge({ context }: { context: Record<string, unknown> }) {
  const items = useMemo(() => {
    const result: { label: string; count: number | string; color: string; icon: React.ElementType }[] = [];
    if (context.criticalTasks && Array.isArray(context.criticalTasks) && context.criticalTasks.length > 0) {
      result.push({ label: 'Critical tasks', count: context.criticalTasks.length, color: '#d4a574', icon: Target });
    }
    if (context.blockedTasks && Array.isArray(context.blockedTasks) && context.blockedTasks.length > 0) {
      result.push({ label: 'Blocked', count: context.blockedTasks.length, color: '#ef4444', icon: Shield });
    }
    if (context.activeOKRs && Array.isArray(context.activeOKRs) && context.activeOKRs.length > 0) {
      result.push({ label: 'OKRs', count: context.activeOKRs.length, color: '#8b5cf6', icon: TrendingUp });
    }
    if (context.teamSize) {
      result.push({ label: 'Team', count: context.teamSize as number, color: '#38bdf8', icon: Users });
    }
    if (context.nodeCount) {
      result.push({ label: 'Nodes', count: context.nodeCount as number, color: '#6b8f71', icon: Network });
    }
    return result;
  }, [context]);

  if (items.length === 0) return null;

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8,
      animation: 'ia-promptFadeIn 0.3s ease both',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 6,
        background: 'rgba(139,92,246,0.06)',
        border: '1px solid rgba(139,92,246,0.1)',
      }}>
        <Database size={9} style={{ color: '#8b5cf6', opacity: 0.7 }} />
        <span style={{ fontSize: 9, color: '#6b6358', fontWeight: 500, letterSpacing: '0.03em' }}>Analyzing</span>
      </div>
      {items.map((item, i) => {
        const ItemIcon = item.icon;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '3px 7px', borderRadius: 6,
            background: `${item.color}08`,
            border: `1px solid ${item.color}15`,
            animation: `ia-quickActionIn 0.25s ease ${i * 0.05}s both`,
          }}>
            <ItemIcon size={8} style={{ color: item.color, opacity: 0.8 }} />
            <span style={{ fontSize: 9, color: item.color, fontWeight: 600, opacity: 0.8 }}>{item.count}</span>
            <span style={{ fontSize: 9, color: '#6b6358' }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Quick Action Buttons ─── */
function QuickActions({ onAction, visible }: {
  onAction: (action: string) => void;
  visible: boolean;
}) {
  if (!visible) return null;

  const actions = [
    { label: 'Tell me more', icon: MessageCircle, prompt: 'Can you elaborate on that? Give me more detail and specific action items.' },
    { label: 'Apply suggestion', icon: ArrowRight, prompt: 'How do I implement this suggestion? Give me specific next steps I can take right now.' },
  ];

  return (
    <div style={{
      display: 'flex', gap: 6, marginTop: 8,
      animation: 'ia-quickActionIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {actions.map((action, i) => {
        const ActionIcon = action.icon;
        return (
          <button
            key={i}
            className="ia-quick-action"
            onClick={() => onAction(action.prompt)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8,
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.12)',
              color: C.textSec, fontSize: 10, fontWeight: 500,
              fontFamily: 'inherit',
              animation: `ia-quickActionIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.08}s both`,
            }}
          >
            <ActionIcon size={10} style={{ opacity: 0.7 }} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
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
  const [animatingOut, setAnimatingOut] = useState(false);
  const [panelMounted, setPanelMounted] = useState(!defaultCollapsed);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(0);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
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
        if (parsed.lastUserMessage) setLastUserMessage(parsed.lastUserMessage);
      }
    } catch { /* ignore */ }
  }, [storageKey]);

  // Rotating loading agent name
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setLoadingAgent(p => (p + 1) % AGENT_NAMES.length), 1800);
    return () => clearInterval(iv);
  }, [loading]);

  // Build context as structured data (for ContextBadge) and string (for API)
  const contextData = useMemo(() => {
    if (contextOverride) return contextOverride;
    const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').slice(0, 5);
    const blocked = tasks.filter(t => t.status === 'blocked').slice(0, 3);
    const activeOKRs = okrs.filter(o => (o.status as string) !== 'completed').slice(0, 4);
    return {
      teamSize: teamMembers.filter(m => m.status === 'active').length,
      criticalTasks: critical.map(t => `${t.title} (${t.owner})`),
      blockedTasks: blocked.map(t => `${t.title} (${t.owner})`),
      activeOKRs: activeOKRs.map(o => `${o.objective} [${o.status}]`),
      nodeCount: nodes.length,
      upcomingEvents: events.filter(e => e.status === 'upcoming').length,
      recentDecisions: governanceDecisions.slice(0, 3).map(d => d.title),
    };
  }, [tasks, okrs, nodes, teamMembers, events, governanceDecisions, contextOverride]);

  const context = useMemo(() => {
    return JSON.stringify(contextData).slice(0, 2000);
  }, [contextData]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setInput('');
    setLastUserMessage(text.trim());
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
        localStorage.setItem(storageKey, JSON.stringify({
          lastResponse: response,
          history: updatedHistory.slice(-6),
          lastUserMessage: text.trim(),
        }));
      } catch { /* quota */ }
    } catch (err) {
      setLastResponse(`Error: ${err instanceof Error ? err.message : 'Something went wrong'}`);
    } finally {
      setLoading(false);
    }
  }, [loading, history, context, storageKey, teamMemberId]);

  const handleToggle = useCallback(() => {
    if (collapsed) {
      setPanelMounted(true);
      setCollapsed(false);
      setAnimatingOut(false);
    } else {
      setAnimatingOut(true);
      setTimeout(() => {
        setCollapsed(true);
        setAnimatingOut(false);
        setPanelMounted(false);
      }, 300);
    }
  }, [collapsed]);

  const defaultPrompts = suggestedPrompts || [
    'What should I focus on today?',
    'Top 3 risks right now?',
    'Team capacity check',
    'Financial health pulse',
  ];

  const TitleIcon = titleIcon === 'lightbulb' ? Zap : titleIcon === 'bot' ? Bot : Sparkles;
  const maxH = compact ? 280 : 380;
  const isExpanded = !collapsed && !animatingOut;
  const currentAgentColor = AGENT_COLORS[AGENT_NAMES[loadingAgent]]?.color || C.accent;

  return (
    <div className="card-premium" style={{
      backgroundColor: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      borderLeft: '3px solid rgba(139,92,246,0.5)',
      overflow: 'hidden',
      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: isExpanded
        ? '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(139,92,246,0.06)'
        : '0 2px 8px rgba(0,0,0,0.1)',
      animation: isExpanded
        ? 'ia-borderGlow 3s ease-in-out infinite'
        : collapsed
          ? 'ia-slideOutToRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) backwards'
          : 'ia-slideInFromRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) backwards',
      position: 'relative',
    }}>
      {/* Premium background overlays */}
      <div className="noise-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div className="dot-pattern" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <style>{PREMIUM_STYLES}</style>

      {/* Header -- always visible, clickable to collapse */}
      <button
        className="ia-header-btn ia-toggle-btn"
        onClick={handleToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {/* Animated icon container */}
        <div style={{
          width: 30, height: 30, borderRadius: 10,
          background: isExpanded
            ? 'linear-gradient(135deg, rgba(212,165,116,0.18), rgba(139,92,246,0.18))'
            : 'linear-gradient(135deg, rgba(212,165,116,0.1), rgba(139,92,246,0.1))',
          border: isExpanded
            ? '1px solid rgba(139,92,246,0.25)'
            : '1px solid rgba(139,92,246,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all 0.35s ease',
          boxShadow: isExpanded
            ? '0 0 12px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
            : 'none',
          animation: isExpanded ? 'ia-togglePulse 3s ease-in-out infinite' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <SparkleIcon active={isExpanded} />
        </div>

        <div style={{ flex: 1, textAlign: 'left' }}>
          <span className="text-glow-purple" style={{ fontSize: 13, fontWeight: 600, color: C.text, display: 'block' }}>{title}</span>
          {/* Compact status when collapsed */}
          {collapsed && lastResponse && (
            <span style={{
              fontSize: 10, color: C.textSec, display: 'block', marginTop: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200,
            }}>
              Last: {lastResponse.slice(0, 40)}...
            </span>
          )}
        </div>

        {/* Agent dots with subtle animation */}
        <div style={{ display: 'flex', gap: 3, marginRight: 4 }}>
          {AGENT_NAMES.slice(0, 4).map((n, i) => (
            <div key={n} style={{
              width: 5, height: 5, borderRadius: '50%',
              backgroundColor: AGENT_COLORS[n].color,
              opacity: isExpanded ? 0.8 : 0.35,
              transition: 'opacity 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease',
              transitionDelay: `${i * 0.05}s`,
              transform: isExpanded ? 'scale(1)' : 'scale(0.85)',
              ...(isExpanded ? { boxShadow: `0 0 5px ${AGENT_COLORS[n].color}40` } : {}),
            }} />
          ))}
        </div>

        <ChevronDown size={14} style={{
          color: C.textSec,
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease',
          transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          ...(isExpanded ? { color: C.accent } : {}),
        }} />
      </button>

      {/* Expandable body with slide animation */}
      {panelMounted && (
        <div style={{
          padding: '0 16px 14px',
          animation: animatingOut
            ? 'ia-slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : 'ia-slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          overflow: 'hidden',
        }}>
          {/* Context indicator: shows what data is being analyzed */}
          {isExpanded && !contextOverride && (
            <ContextBadge context={contextData} />
          )}

          {/* Suggested prompts */}
          {!lastResponse && !loading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 6,
              marginBottom: 10,
            }}>
              {defaultPrompts.map((p, i) => (
                <button
                  key={i}
                  className="ia-prompt-btn card-interactive"
                  onClick={() => sendMessage(p)}
                  style={{
                    padding: '9px 12px', borderRadius: 10, fontSize: 11, color: C.textSec,
                    backgroundColor: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.12)',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', lineHeight: 1.35,
                    animation: `ia-promptFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.07}s both`,
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                >
                  <Sparkles size={10} style={{
                    flexShrink: 0,
                    opacity: 0.5,
                    animation: `ia-sparkle 2.5s ease-in-out ${i * 0.3}s infinite`,
                  }} />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', marginBottom: 8,
              borderRadius: 10,
              background: 'rgba(11,13,20,0.4)',
              border: `1px solid ${currentAgentColor}15`,
              borderLeft: `3px solid ${currentAgentColor}40`,
              animation: 'ia-messageIn 0.3s ease',
              transition: 'border-left-color 0.5s ease',
            }}>
              {/* Loader with progress ring */}
              <div style={{ position: 'relative', width: 14, height: 14 }}>
                <ProgressRing color={currentAgentColor} />
                <Loader2
                  size={14}
                  style={{
                    color: currentAgentColor,
                    animation: 'ia-spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                    filter: `drop-shadow(0 0 3px ${currentAgentColor}40)`,
                    transition: 'color 0.5s ease, filter 0.5s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: C.textSec, position: 'relative', overflow: 'hidden' }}>
                <span
                  key={loadingAgent}
                  style={{
                    color: currentAgentColor,
                    fontWeight: 600,
                    display: 'inline-block',
                    animation: 'ia-fadeAgent 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                    textShadow: `0 0 8px ${currentAgentColor}30`,
                  }}
                >
                  {AGENT_NAMES[loadingAgent]}
                </span>
                {' '}analyzing
                {/* Animated dots */}
                <span style={{ display: 'inline-flex', gap: 2, marginLeft: 2, verticalAlign: 'middle' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      display: 'inline-block',
                      width: 3, height: 3, borderRadius: '50%',
                      background: currentAgentColor,
                      animation: `ia-dotBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                      transition: 'background 0.5s ease',
                    }} />
                  ))}
                </span>
              </span>
            </div>
          )}

          {/* Response display with improved bubble styling */}
          {lastResponse && !loading && (
            <div
              ref={responseRef}
              className="ia-scroll scrollbar-autohide"
              style={{
                maxHeight: maxH, overflowY: 'auto', marginBottom: 10,
                animation: 'ia-responseSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              }}
            >
              {/* User's question in compact bubble */}
              {lastUserMessage && (
                <div style={{
                  display: 'flex', justifyContent: 'flex-end', marginBottom: 8,
                }}>
                  <div style={{
                    padding: '6px 12px', borderRadius: '10px 10px 2px 10px',
                    background: 'linear-gradient(135deg, rgba(212,165,116,0.1), rgba(212,165,116,0.06))',
                    border: '1px solid rgba(212,165,116,0.15)',
                    maxWidth: '85%',
                    boxShadow: '0 2px 8px rgba(212,165,116,0.04), 0 1px 2px rgba(0,0,0,0.08)',
                  }}>
                    <span style={{ fontSize: 11, color: C.accent, lineHeight: 1.4 }}>{lastUserMessage}</span>
                  </div>
                </div>
              )}

              {/* AI Response with improved shadows */}
              <div style={{
                padding: '10px 12px', borderRadius: 10,
                backgroundColor: 'rgba(11,13,20,0.5)',
                border: '1px solid rgba(30,38,56,0.4)',
                borderLeft: '3px solid rgba(139,92,246,0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.02)',
                position: 'relative',
              }}>
                {/* Subtle gradient accent at top of bubble */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(212,165,116,0.2), transparent)',
                  borderRadius: '10px 10px 0 0',
                }} />
                {formatResponse(lastResponse)}

                {/* Quick action buttons */}
                <QuickActions
                  onAction={sendMessage}
                  visible={!loading}
                />
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="ia-input-bar" style={{
            display: 'flex', gap: 8, alignItems: 'flex-end',
            padding: '4px', borderRadius: 10,
            background: 'rgba(11,13,20,0.3)',
            border: '1px solid rgba(30,38,56,0.3)',
          }}>
            <textarea
              ref={inputRef}
              className="ia-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder={lastResponse ? 'Follow up...' : 'Ask the advisory board...'}
              rows={1}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 8,
                border: 'none', backgroundColor: 'transparent',
                color: C.text, fontSize: 12, fontFamily: 'inherit', outline: 'none',
                resize: 'none', minHeight: 34, maxHeight: 72,
              }}
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = '34px'; t.style.height = `${Math.min(t.scrollHeight, 72)}px`; }}
            />
            <button
              className="ia-send-btn"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 34, height: 34, borderRadius: 8, border: 'none',
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #d4a574, #c4925a)'
                  : 'rgba(30,38,56,0.4)',
                color: input.trim() && !loading ? '#0b0d14' : C.textSec,
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: input.trim() && !loading ? '0 2px 8px rgba(212,165,116,0.2)' : 'none',
              }}
            >
              {loading ? (
                <Loader2 size={13} style={{ animation: 'ia-spin 0.9s linear infinite', color: C.textSec }} />
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
