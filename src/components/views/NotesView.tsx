'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Pin,
  PinOff,
  Tag,
  Eye,
  Edit3,
  Copy,
  Check,
  FolderOpen,
  Clock,
  BookOpen,
  X,
  ChevronDown,
  Sparkles,
  LayoutGrid,
  List,
  Calendar,
  Hash,
  Bold,
  Italic,
  Heading,
  ListOrdered,
  Type,
  AlignLeft,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

// ─── Scoped Keyframes (nt- prefix) ──────────────────────────────────────────

const scopedKeyframes = `
@keyframes nt-fade-up {
  from { opacity: 0; transform: translateY(18px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes nt-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes nt-glow-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(212,165,116,0.15); }
  50%      { box-shadow: 0 0 20px rgba(212,165,116,0.3); }
}
@keyframes nt-pin-glow {
  0%, 100% { filter: drop-shadow(0 0 3px rgba(212,165,116,0.3)); }
  50%      { filter: drop-shadow(0 0 8px rgba(212,165,116,0.6)); }
}
@keyframes nt-float-in {
  from { opacity: 0; transform: translateY(24px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes nt-fab-entrance {
  from { opacity: 0; transform: scale(0.5) rotate(-20deg); }
  to   { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes nt-fab-pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(212,165,116,0.25), 0 0 40px rgba(212,165,116,0.1); }
  50%      { box-shadow: 0 6px 30px rgba(212,165,116,0.4), 0 0 60px rgba(212,165,116,0.15); }
}
@keyframes nt-border-glow {
  0%, 100% { border-color: rgba(212,165,116,0.15); }
  50%      { border-color: rgba(212,165,116,0.35); }
}
@keyframes nt-slide-down {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nt-card-shine {
  0%   { left: -100%; }
  100% { left: 200%; }
}
@keyframes nt-empty-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes nt-dot-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.3); }
}
@keyframes nt-action-reveal {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nt-ring-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes nt-loading-bar {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
`;

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = 'All' | 'General' | 'Blue Spirit' | 'Governance' | 'Nodes' | 'Finance' | 'Personal';

interface Note {
  id: string;
  title: string;
  content: string;
  category: Exclude<Category, 'All'>;
  tags: string[];
  pinned: boolean;
  bookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'frequency-notes';
const VIEW_MODE_KEY = 'frequency-notes-view';

const CATEGORIES: Category[] = ['All', 'General', 'Blue Spirit', 'Governance', 'Nodes', 'Finance', 'Personal'];
const EDITABLE_CATEGORIES: Exclude<Category, 'All'>[] = ['General', 'Blue Spirit', 'Governance', 'Nodes', 'Finance', 'Personal'];

const TAG_SUGGESTIONS = [
  'event', 'logistics', 'daf', 'compliance', 'teal', 'culture',
  'strategy', 'vision', 'meeting', 'action-item', 'research',
  'draft', 'important', 'follow-up', 'idea', 'reference',
];

const CATEGORY_COLORS: Record<string, string> = {
  'General': '#a09888',
  'Blue Spirit': '#5b9bd5',
  'Governance': '#8b5cf6',
  'Nodes': '#6b8f71',
  'Finance': '#d4a574',
  'Personal': '#e07a5f',
};

const CATEGORY_ICONS: Record<string, string> = {
  'General': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'Blue Spirit': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  'Governance': 'M12 2L2 7v10l10 5 10-5V7L12 2z',
  'Nodes': 'M12 2a3 3 0 013 3c0 .85-.36 1.62-.94 2.16L17 10h-2l-2-2-2 2H9l2.94-2.84A3.001 3.001 0 0112 2z',
  'Finance': 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  'Personal': 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
};

const TAG_COLORS: Record<string, string> = {
  'event': '#8b5cf6',
  'logistics': '#5b9bd5',
  'daf': '#d4a574',
  'compliance': '#e06060',
  'teal': '#6b8f71',
  'culture': '#e879a0',
  'strategy': '#fb923c',
  'vision': '#60a5fa',
  'meeting': '#a09888',
  'action-item': '#e8b44c',
  'research': '#34d399',
  'draft': '#6b6358',
  'important': '#e06060',
  'follow-up': '#fb923c',
  'idea': '#8b5cf6',
  'reference': '#5eaed4',
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || '#8b5cf6';
}

// ─── Design Tokens ───────────────────────────────────────────────────────────

const DS = {
  bg:       '#0b0d14',
  surface:  '#0f1219',
  glass:    'rgba(19,23,32,0.7)',
  glassBorder: 'rgba(212,165,116,0.08)',
  gold:     '#d4a574',
  purple:   '#8b5cf6',
  green:    '#6b8f71',
  cream:    '#f0ebe4',
  muted:    '#a09888',
  dim:      '#6b6358',
  faint:    '#4a443e',
  darker:   '#3a352f',
  line:     '#1e2638',
  panelBg:  '#131720',
  ease:     'cubic-bezier(0.16,1,0.3,1)',
  radius:   12,
  radiusLg: 16,
  blur:     'blur(20px)',
};

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Blue Spirit Planning Notes',
    content: '# Blue Spirit Planning\n\nKey areas to address for the upcoming Blue Spirit gathering:\n\n## Logistics\n- Venue confirmation and capacity check\n- Catering arrangements for 50+ attendees\n- AV equipment and presentation setup\n\n## Agenda Items\n1. Opening ceremony and intention setting\n2. Breakout sessions on community governance\n3. Financial transparency workshop\n4. Closing circle and commitments\n\n## Action Items\n- **Send invitations** by end of week\n- *Confirm speakers* for each session\n- Prepare welcome packets\n\nNotes from last planning call: focus on creating space for authentic dialogue rather than rigid structure.',
    category: 'Blue Spirit',
    tags: ['event', 'logistics'],
    pinned: true,
    bookmarked: true,
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
  },
  {
    id: 'note-2',
    title: 'DAF Structure Thoughts',
    content: '# DAF Structure\n\nExploring the optimal structure for our Donor-Advised Fund:\n\n## Current Considerations\n- **Compliance requirements** vary by jurisdiction\n- Need to establish clear grant-making guidelines\n- Minimum distribution thresholds\n\n## Proposed Framework\n1. Set annual distribution target at 7%\n2. Create advisory committee with rotating membership\n3. Quarterly review of investment allocations\n4. Transparent reporting to all stakeholders\n\n## Open Questions\n- How to handle *restricted vs unrestricted* contributions?\n- Timeline for first major grant cycle\n- Integration with existing financial systems',
    category: 'Finance',
    tags: ['daf', 'compliance'],
    pinned: false,
    bookmarked: false,
    createdAt: '2025-11-20T09:00:00Z',
    updatedAt: '2026-01-18T11:00:00Z',
  },
  {
    id: 'note-3',
    title: 'Teal Governance Reflections',
    content: '# Teal Governance\n\nReflections on implementing teal organizational principles:\n\n## Core Principles\n- **Self-management** over hierarchical control\n- *Wholeness* — bringing full selves to work\n- Evolutionary purpose guiding decisions\n\n## What We Have Learned\n- Consent-based decision making works well for policy\n- Advice process accelerates operational decisions\n- Role clarity matters more than title clarity\n\n## Cultural Shifts Needed\n1. Move from permission-seeking to initiative-taking\n2. Embrace productive conflict as growth\n3. Build feedback loops into daily practice\n\nThe journey toward teal is not a destination but a continuous evolution of consciousness and practice.',
    category: 'Governance',
    tags: ['teal', 'culture'],
    pinned: false,
    bookmarked: true,
    createdAt: '2025-10-05T08:00:00Z',
    updatedAt: '2026-01-15T16:00:00Z',
  },
  {
    id: 'note-4',
    title: 'Node Ecosystem Vision',
    content: '# Node Ecosystem Vision\n\n## Strategic Overview\nBuilding a decentralized network of interconnected nodes that serve as:\n- Community hubs for local engagement\n- Resource sharing and mutual aid centers\n- Knowledge repositories and learning spaces\n\n## Phase 1: Foundation\n1. Establish 5 pilot nodes in diverse geographies\n2. Develop shared governance protocol\n3. Create inter-node communication infrastructure\n\n## Phase 2: Growth\n- **Scale to 20 nodes** within 18 months\n- Launch node-to-node resource sharing platform\n- Implement *collective intelligence* tools\n\n## Key Metrics\n- Active node participation rate\n- Inter-node collaboration frequency\n- Community impact measurements\n\nVision: A living network where each node strengthens the whole while maintaining its unique local character.',
    category: 'Nodes',
    tags: ['strategy', 'vision'],
    pinned: false,
    bookmarked: false,
    createdAt: '2025-09-12T07:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return 'note-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeDate(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(iso);
}

function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getCharCount(text: string): number {
  return text.length;
}

function getReadingTime(words: number): string {
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

function getContentPreview(text: string, maxLen = 120): string {
  const cleaned = text
    .replace(/^#+\s.*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-*]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen).trim() + '...';
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:600;color:#f0ebe4;margin:16px 0 8px 0;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:600;color:#f0ebe4;margin:20px 0 10px 0;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:700;color:#f0ebe4;margin:24px 0 12px 0;">$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f0ebe4;font-weight:600;">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em style="color:#d4a574;font-style:italic;">$1</em>');

  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:20px;padding:2px 0;color:#a09888;list-style-type:disc;">$1</li>');
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li style="margin-left:20px;padding:2px 0;color:#a09888;list-style-type:decimal;">$1</li>');

  html = html.replace(/((?:<li[^>]*list-style-type:disc[^>]*>.*?<\/li>\n?)+)/g, '<ul style="margin:8px 0;padding:0;">$1</ul>');
  html = html.replace(/((?:<li[^>]*list-style-type:decimal[^>]*>.*?<\/li>\n?)+)/g, '<ol style="margin:8px 0;padding:0;">$1</ol>');

  html = html.replace(/^(?!<[hulo])(.*\S.*)$/gm, '<p style="margin:6px 0;color:#a09888;line-height:1.7;">$1</p>');

  return html;
}

// ─── Persistence ─────────────────────────────────────────────────────────────

function loadNotes(): Note[] {
  if (typeof window === 'undefined') return DEFAULT_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migrate old notes that don't have bookmarked field
        return parsed.map((n: Note) => ({
          ...n,
          bookmarked: n.bookmarked ?? false,
        }));
      }
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_NOTES;
}

function saveNotes(notes: Note[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // silently fail if storage is full
  }
}

// ─── Animated Card Wrapper ──────────────────────────────────────────────────

function AnimatedCard({ children, delay = 0, style, ...props }: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  [key: string]: unknown;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.97)',
        transition: `opacity 0.5s ${DS.ease}, transform 0.5s ${DS.ease}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Character Count Progress Ring (SVG) ─────────────────────────────────────

function CharCountRing({ count, max = 5000 }: { count: number; max?: number }) {
  const pct = Math.min(count / max, 1);
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - pct * circumference;
  const color = pct > 0.9 ? '#e06060' : pct > 0.7 ? '#e8b44c' : '#6b8f71';

  return (
    <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
      <circle cx="18" cy="18" r={radius} fill="none" stroke="rgba(30,38,56,0.5)" strokeWidth="2.5" />
      <circle
        cx="18" cy="18" r={radius} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
        style={{ transition: `stroke-dashoffset 0.5s ${DS.ease}, stroke 0.3s ease` }}
      />
      <text x="18" y="18" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 8, fill: color, fontWeight: 600 }}>
        {pct < 0.01 ? '0%' : pct >= 1 ? 'MAX' : `${Math.round(pct * 100)}%`}
      </text>
    </svg>
  );
}

// ─── Formatting Toolbar ─────────────────────────────────────────────────────

function FormattingToolbar({ onInsert }: { onInsert: (text: string) => void }) {
  const tools = [
    { icon: Heading, label: 'Heading', insert: '# ', hint: '# Heading' },
    { icon: Bold, label: 'Bold', insert: '****', hint: '**bold**' },
    { icon: Italic, label: 'Italic', insert: '**', hint: '*italic*' },
    { icon: List, label: 'Bullet list', insert: '- ', hint: '- item' },
    { icon: ListOrdered, label: 'Numbered list', insert: '1. ', hint: '1. item' },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2, padding: '8px 0',
      borderBottom: `1px solid ${DS.line}`, marginBottom: 10,
    }}>
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.label}
            title={`${tool.label} (${tool.hint})`}
            onClick={() => onInsert(tool.insert)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 30, borderRadius: 8,
              background: 'transparent', border: '1px solid transparent',
              color: DS.faint, cursor: 'pointer',
              transition: `all 0.2s ${DS.ease}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212,165,116,0.08)';
              e.currentTarget.style.color = DS.gold;
              e.currentTarget.style.borderColor = 'rgba(212,165,116,0.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = DS.faint;
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Icon size={14} />
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: DS.darker,
        padding: '0 6px',
      }}>
        <Type size={10} />
        <span>Markdown supported</span>
      </div>
    </div>
  );
}

// ─── Empty State Illustration (enhanced SVG) ──────────────────────────────────

function EmptyStateIllustration() {
  return (
    <svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'nt-empty-float 4s ease-in-out infinite' }}>
      <defs>
        <linearGradient id="nt-noteGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={DS.gold} stopOpacity="0.15" />
          <stop offset="100%" stopColor={DS.purple} stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="nt-penGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={DS.purple} />
          <stop offset="100%" stopColor={DS.gold} />
        </linearGradient>
        <filter id="nt-softGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="100" cy="150" rx="75" ry="14" fill="rgba(212,165,116,0.04)" />
      <rect x="45" y="22" width="110" height="130" rx="10" fill="#131720" stroke={DS.line} strokeWidth="1.5" />
      <rect x="45" y="22" width="110" height="130" rx="10" fill="url(#nt-noteGrad)" />
      <rect x="63" y="22" width="2" height="130" fill="rgba(30,38,56,0.4)" />
      {[38, 54, 70, 86, 102, 118, 134].map((y) => (
        <circle key={y} cx="64" cy={y} r="3.5" fill="none" stroke="rgba(46,58,78,0.5)" strokeWidth="1" />
      ))}
      <line x1="75" y1="45" x2="138" y2="45" stroke={DS.line} strokeWidth="1" />
      <line x1="75" y1="58" x2="130" y2="58" stroke={DS.line} strokeWidth="1" />
      <line x1="75" y1="71" x2="125" y2="71" stroke={DS.line} strokeWidth="1" />
      <line x1="75" y1="84" x2="135" y2="84" stroke={DS.line} strokeWidth="1" />
      <line x1="75" y1="97" x2="115" y2="97" stroke={DS.line} strokeWidth="1" />
      <line x1="75" y1="45" x2="110" y2="45" stroke={DS.gold} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <g transform="translate(125, 18) rotate(25)" filter="url(#nt-softGlow)">
        <rect x="0" y="0" width="7" height="52" rx="3.5" fill="url(#nt-penGrad)" opacity="0.85" />
        <polygon points="0,52 7,52 3.5,62" fill={DS.gold} opacity="0.8" />
      </g>
      <g transform="translate(148, 28)">
        <path d="M0,-6 L1.5,0 L0,6 L-1.5,0 Z" fill={DS.gold} opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M-6,0 L0,-1.5 L6,0 L0,1.5 Z" fill={DS.gold} opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(32, 110)">
        <path d="M0,-4 L1,0 L0,4 L-1,0 Z" fill={DS.purple} opacity="0.3">
          <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M-4,0 L0,-1 L4,0 L0,1 Z" fill={DS.purple} opacity="0.3">
          <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3s" begin="0.8s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}

// ─── Author Avatar with Gradient Ring ────────────────────────────────────────

function AuthorAvatar({ category, size = 24 }: { category: string; size?: number }) {
  const color = CATEGORY_COLORS[category] || DS.muted;
  const initials = category.split(' ').map(w => w[0]).join('').slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `conic-gradient(from 0deg, ${color}, ${DS.gold}, ${DS.purple}, ${color})`,
      padding: 2, flexShrink: 0,
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: DS.panelBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 700, color,
        letterSpacing: '-0.02em',
      }}>
        {initials}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [previewMode, setPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stylesInjected = useRef(false);

  // ── Inject scoped keyframes ───────────────────────────────────────────────
  useEffect(() => {
    if (stylesInjected.current) return;
    stylesInjected.current = true;
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-nt-keyframes', 'true');
    styleEl.textContent = scopedKeyframes;
    document.head.appendChild(styleEl);
    return () => {
      if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
    };
  }, []);

  // ── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);
    if (loaded.length > 0) setSelectedId(loaded[0].id);
    try {
      const savedView = localStorage.getItem(VIEW_MODE_KEY);
      if (savedView === 'grid' || savedView === 'list') setViewMode(savedView);
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  // ── Auto-save whenever notes change ──────────────────────────────────────
  useEffect(() => {
    if (mounted) saveNotes(notes);
  }, [notes, mounted]);

  // ── Save view mode preference ──────────────────────────────────────────
  useEffect(() => {
    if (mounted) {
      try { localStorage.setItem(VIEW_MODE_KEY, viewMode); } catch { /* ignore */ }
    }
  }, [viewMode, mounted]);

  // ── Mutations ────────────────────────────────────────────────────────────

  const updateNotes = useCallback((updater: (prev: Note[]) => Note[]) => {
    setNotes(updater);
  }, []);

  const createNote = useCallback(() => {
    const cat: Exclude<Category, 'All'> = activeCategory === 'All' ? 'General' : activeCategory;
    const now = new Date().toISOString();
    const note: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      category: cat,
      tags: [],
      pinned: false,
      bookmarked: false,
      createdAt: now,
      updatedAt: now,
    };
    updateNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
    setPreviewMode(false);
  }, [activeCategory, updateNotes]);

  const deleteNote = useCallback((id: string) => {
    updateNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedId((curr) => (curr === id ? null : curr));
  }, [updateNotes]);

  const updateField = useCallback(<K extends keyof Note>(id: string, field: K, value: Note[K]) => {
    updateNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, [field]: value, updatedAt: new Date().toISOString() } : n
      )
    );
  }, [updateNotes]);

  const togglePin = useCallback((id: string) => {
    updateNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n))
    );
  }, [updateNotes]);

  const toggleBookmark = useCallback((id: string) => {
    updateNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, bookmarked: !n.bookmarked, updatedAt: new Date().toISOString() } : n))
    );
  }, [updateNotes]);

  const addTag = useCallback((id: string, tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    updateNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id || n.tags.includes(trimmed)) return n;
        return { ...n, tags: [...n.tags, trimmed], updatedAt: new Date().toISOString() };
      })
    );
    setTagInput('');
    setShowTagSuggestions(false);
  }, [updateNotes]);

  const removeTag = useCallback((id: string, tag: string) => {
    updateNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        return { ...n, tags: n.tags.filter((t) => t !== tag), updatedAt: new Date().toISOString() };
      })
    );
  }, [updateNotes]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may not be available
    }
  }, []);

  const insertFormatting = useCallback((text: string) => {
    if (!textareaRef.current || !selectedId) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const current = ta.value;
    const newContent = current.substring(0, start) + text + current.substring(end);
    updateField(selectedId, 'content', newContent);
    // Set cursor position after insert
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const cursorPos = text.includes('****') ? start + 2 : text.includes('**') ? start + 1 : start + text.length;
        textareaRef.current.selectionStart = cursorPos;
        textareaRef.current.selectionEnd = cursorPos;
        textareaRef.current.focus();
      }
    });
  }, [selectedId, updateField]);

  // ── Derived State ────────────────────────────────────────────────────────

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (activeCategory !== 'All') {
      result = result.filter((n) => n.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.includes(q))
      );
    }
    return [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, activeCategory, searchQuery]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.pinned), [filteredNotes]);
  const unpinnedNotes = useMemo(() => filteredNotes.filter((n) => !n.pinned), [filteredNotes]);

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) ?? null, [notes, selectedId]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All': notes.length };
    notes.forEach((n) => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [notes]);

  const filteredTagSuggestions = useMemo(() => {
    if (!selectedNote) return [];
    const existing = selectedNote.tags;
    if (!tagInput.trim()) return TAG_SUGGESTIONS.filter((t) => !existing.includes(t)).slice(0, 8);
    const q = tagInput.toLowerCase();
    return TAG_SUGGESTIONS.filter((t) => t.includes(q) && !existing.includes(t)).slice(0, 8);
  }, [tagInput, selectedNote]);

  // ── Glassmorphism Card Style Builder ───────────────────────────────────────

  const glassCard = (isActive: boolean, catColor: string): React.CSSProperties => ({
    background: isActive
      ? `linear-gradient(135deg, rgba(19,23,32,0.85), rgba(19,23,32,0.65))`
      : DS.glass,
    backdropFilter: DS.blur,
    WebkitBackdropFilter: DS.blur,
    border: isActive
      ? `1px solid rgba(212,165,116,0.25)`
      : `1px solid ${DS.glassBorder}`,
    borderRadius: DS.radiusLg,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    transition: `all 0.35s ${DS.ease}`,
  });

  // ── Render Helpers ─────────────────────────────────────────────────────

  const iconBtn = (active?: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
    borderRadius: 8,
    background: active ? 'rgba(212,165,116,0.12)' : 'transparent',
    border: '1px solid transparent',
    color: active ? DS.gold : DS.dim,
    cursor: 'pointer',
    transition: `all 0.2s ${DS.ease}`,
  });

  const renderNoteCard = (note: Note, index: number, isPinned: boolean) => {
    const isActive = selectedId === note.id;
    const isHovered = hoveredCardId === note.id;
    const catColor = CATEGORY_COLORS[note.category] || DS.muted;
    const wordCount = getWordCount(note.content);

    if (viewMode === 'grid') {
      return (
        <AnimatedCard key={note.id} delay={index * 60}>
          <div
            className="card-interactive"
            onClick={() => { setSelectedId(note.id); setPreviewMode(false); }}
            onMouseEnter={() => setHoveredCardId(note.id)}
            onMouseLeave={() => setHoveredCardId(null)}
            style={{
              ...glassCard(isActive, catColor),
              padding: 0,
              cursor: 'pointer',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              transform: isHovered && !isActive ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: isActive
                ? `0 0 0 1px rgba(212,165,116,0.2), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`
                : isHovered
                  ? `0 12px 40px rgba(0,0,0,0.35), 0 0 20px ${catColor}15, inset 0 1px 0 rgba(255,255,255,0.03)`
                  : `0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02)`,
            }}
          >
            {/* Color-coded top accent strip */}
            <div style={{
              height: 3,
              background: `linear-gradient(90deg, ${catColor}, ${catColor}88, transparent)`,
              borderRadius: `${DS.radiusLg}px ${DS.radiusLg}px 0 0`,
              opacity: isActive || isHovered ? 1 : 0.6,
              transition: `opacity 0.3s ${DS.ease}`,
            }} />

            {/* Shine effect on hover */}
            {isHovered && (
              <div style={{
                position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                animation: 'nt-card-shine 0.8s ease-out forwards',
                pointerEvents: 'none',
              }} />
            )}

            <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Top row: Category + Pin/Bookmark */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                {/* Category indicator: colored dot + label */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: `${catColor}12`, color: catColor,
                  letterSpacing: '0.03em', textTransform: 'uppercase',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: catColor,
                    boxShadow: `0 0 6px ${catColor}50`,
                    animation: isPinned ? 'nt-dot-pulse 2s ease-in-out infinite' : 'none',
                  }} />
                  {note.category}
                </div>

                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {note.bookmarked && (
                    <BookmarkCheck size={13} style={{
                      color: DS.purple, opacity: 0.8,
                      filter: `drop-shadow(0 0 3px ${DS.purple}40)`,
                    }} />
                  )}
                  {isPinned && (
                    <Pin size={13} style={{
                      color: DS.gold,
                      animation: 'nt-pin-glow 2.5s ease-in-out infinite',
                    }} />
                  )}
                </div>
              </div>

              {/* Title */}
              <div style={{
                fontSize: 14, fontWeight: 700, color: DS.cream, marginBottom: 8,
                lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                letterSpacing: '-0.01em',
              }}>
                {note.title || 'Untitled'}
              </div>

              {/* Rich text preview */}
              <div style={{
                fontSize: 12, color: DS.dim, lineHeight: 1.6, flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                marginBottom: 14,
              }}>
                {getContentPreview(note.content, 140)}
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag} style={{
                      fontSize: 10, padding: '3px 9px', borderRadius: 20,
                      background: `${getTagColor(tag)}12`, color: getTagColor(tag),
                      fontWeight: 500, border: `1px solid ${getTagColor(tag)}15`,
                    }}>
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span style={{
                      fontSize: 10, padding: '3px 9px', borderRadius: 20,
                      background: 'rgba(107,99,88,0.1)', color: DS.dim,
                      border: '1px solid rgba(107,99,88,0.1)',
                    }}>
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Footer: Timestamp + Author Avatar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 10, color: DS.faint,
                borderTop: `1px solid ${DS.glassBorder}`,
                paddingTop: 10, marginTop: 'auto',
              }}>
                <span
                  title={`Updated: ${formatDate(note.updatedAt)}\nCreated: ${formatDate(note.createdAt)}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'default' }}
                >
                  <Clock size={10} />
                  {formatRelativeDate(note.updatedAt)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Hash size={9} />
                    {wordCount}w
                  </span>
                  <AuthorAvatar category={note.category} size={22} />
                </div>
              </div>

              {/* Hover action buttons overlay */}
              {isHovered && (
                <div style={{
                  position: 'absolute', bottom: 44, right: 14,
                  display: 'flex', gap: 4,
                  animation: 'nt-action-reveal 0.25s ease-out forwards',
                }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedId(note.id); setPreviewMode(false); }}
                    title="Edit"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(19,23,32,0.9)', border: `1px solid ${DS.glassBorder}`,
                      backdropFilter: DS.blur, color: DS.muted, cursor: 'pointer',
                      transition: `all 0.15s ${DS.ease}`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = DS.gold; e.currentTarget.style.borderColor = `${DS.gold}40`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = DS.muted; e.currentTarget.style.borderColor = DS.glassBorder; }}
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(19,23,32,0.9)', border: `1px solid ${DS.glassBorder}`,
                      backdropFilter: DS.blur,
                      color: note.pinned ? DS.gold : DS.muted, cursor: 'pointer',
                      transition: `all 0.15s ${DS.ease}`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = DS.gold; e.currentTarget.style.borderColor = `${DS.gold}40`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = note.pinned ? DS.gold : DS.muted; e.currentTarget.style.borderColor = DS.glassBorder; }}
                  >
                    {note.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    title="Delete"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(19,23,32,0.9)', border: `1px solid ${DS.glassBorder}`,
                      backdropFilter: DS.blur, color: DS.muted, cursor: 'pointer',
                      transition: `all 0.15s ${DS.ease}`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#e07a5f'; e.currentTarget.style.borderColor = 'rgba(224,122,95,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = DS.muted; e.currentTarget.style.borderColor = DS.glassBorder; }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </AnimatedCard>
      );
    }

    // ── List view ─────────────────────────────────────────────────────────────
    return (
      <AnimatedCard key={note.id} delay={index * 40}>
        <div
          className="card-interactive"
          onClick={() => { setSelectedId(note.id); setPreviewMode(false); }}
          onMouseEnter={() => setHoveredCardId(note.id)}
          onMouseLeave={() => setHoveredCardId(null)}
          style={{
            display: 'flex', gap: 14, padding: '14px 16px',
            borderRadius: DS.radius,
            cursor: 'pointer',
            background: isActive
              ? 'rgba(212,165,116,0.06)'
              : isHovered
                ? 'rgba(212,165,116,0.025)'
                : 'transparent',
            border: isActive
              ? '1px solid rgba(212,165,116,0.18)'
              : isHovered
                ? `1px solid ${DS.glassBorder}`
                : '1px solid transparent',
            transition: `all 0.25s ${DS.ease}`,
            position: 'relative',
            backdropFilter: isActive || isHovered ? DS.blur : 'none',
            transform: isHovered && !isActive ? 'translateX(2px)' : 'translateX(0)',
          }}
        >
          {/* Left color bar with glow */}
          <div style={{
            width: 3, borderRadius: 2, flexShrink: 0,
            background: isActive ? DS.gold : catColor,
            opacity: isActive ? 1 : isHovered ? 0.8 : 0.4,
            transition: `all 0.25s ${DS.ease}`,
            boxShadow: isActive
              ? `0 0 10px ${DS.gold}50, 0 0 3px ${DS.gold}30`
              : isHovered
                ? `0 0 6px ${catColor}30`
                : 'none',
          }} />

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5,
            }}>
              {isPinned && (
                <Pin size={11} style={{
                  color: DS.gold, flexShrink: 0,
                  animation: 'nt-pin-glow 2.5s ease-in-out infinite',
                }} />
              )}
              {note.bookmarked && (
                <BookmarkCheck size={11} style={{
                  color: DS.purple, flexShrink: 0,
                  filter: `drop-shadow(0 0 2px ${DS.purple}30)`,
                }} />
              )}
              <span style={{
                fontSize: 13, fontWeight: 600, color: DS.cream,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}>
                {note.title || 'Untitled'}
              </span>
            </div>

            {/* Preview text */}
            <div style={{
              fontSize: 12, color: DS.dim, lineHeight: 1.5, marginBottom: 7,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {getContentPreview(note.content, 80)}
            </div>

            {/* Bottom row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Category indicator with dot */}
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: `${catColor}12`, color: catColor,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: catColor,
                  boxShadow: `0 0 4px ${catColor}40`,
                }} />
                {note.category}
              </span>
              {note.tags.slice(0, 2).map((tag) => (
                <span key={tag} style={{
                  fontSize: 10, padding: '2px 7px', borderRadius: 20,
                  background: `${getTagColor(tag)}10`, color: getTagColor(tag),
                  border: `1px solid ${getTagColor(tag)}12`,
                }}>
                  {tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span style={{ fontSize: 10, color: DS.faint }}>+{note.tags.length - 2}</span>
              )}
              <span style={{
                fontSize: 10, color: DS.faint, marginLeft: 'auto',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <AlignLeft size={9} />
                  {getCharCount(note.content)}
                </span>
                <span
                  title={`Updated: ${formatDate(note.updatedAt)}\nCreated: ${formatDate(note.createdAt)}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'default' }}
                >
                  <Clock size={9} />
                  {formatRelativeDate(note.updatedAt)}
                </span>
              </span>
            </div>
          </div>

          {/* Hover action buttons for list view */}
          {isHovered && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              animation: 'nt-action-reveal 0.2s ease-out forwards',
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                title={note.pinned ? 'Unpin' : 'Pin'}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 26, height: 26, borderRadius: 6,
                  background: 'rgba(19,23,32,0.8)', border: `1px solid ${DS.glassBorder}`,
                  color: note.pinned ? DS.gold : DS.dim, cursor: 'pointer',
                  transition: `all 0.15s ${DS.ease}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = DS.gold; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = note.pinned ? DS.gold : DS.dim; }}
              >
                {note.pinned ? <PinOff size={11} /> : <Pin size={11} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                title="Delete"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 26, height: 26, borderRadius: 6,
                  background: 'rgba(19,23,32,0.8)', border: `1px solid ${DS.glassBorder}`,
                  color: DS.dim, cursor: 'pointer',
                  transition: `all 0.15s ${DS.ease}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#e07a5f'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = DS.dim; }}
              >
                <Trash2 size={11} />
              </button>
            </div>
          )}
        </div>
      </AnimatedCard>
    );
  };

  // ── Date badge component ─────────────────────────────────────────────────

  const DateBadge = ({ label, value, icon: Icon, color = DS.dim }: {
    label: string; value: string; icon: React.ElementType; color?: string;
  }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px',
      background: DS.glass, borderRadius: 8,
      border: `1px solid ${DS.glassBorder}`,
      backdropFilter: DS.blur,
    }}>
      <Icon size={10} style={{ color: DS.faint }} />
      <span style={{ fontSize: 10, color: DS.faint, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 11, color, fontWeight: 500 }}>{value}</span>
    </div>
  );

  // ── Loading state ─────────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div style={{
        display: 'flex', height: '100%', background: DS.bg, color: DS.cream,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: DS.faint,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: DS.glass, border: `1px solid ${DS.glassBorder}`,
            backdropFilter: DS.blur,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <FileText size={26} color={DS.faint} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, transparent, ${DS.gold}40, transparent)`,
              animation: 'nt-loading-bar 1.5s ease-in-out infinite',
            }} />
          </div>
          <span style={{ fontSize: 14, color: DS.dim, fontWeight: 500 }}>Loading notes...</span>
        </div>
      </div>
    );
  }

  // ── Main Render ─────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex', height: '100%', background: DS.bg, color: DS.cream,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        width: 380, minWidth: 380, background: DS.surface,
        borderRight: `1px solid ${DS.line}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Subtle top gradient glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 120,
          background: `radial-gradient(ellipse at 50% 0%, ${DS.gold}06 0%, transparent 70%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Sidebar Header */}
        <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${DS.line}`, position: 'relative', zIndex: 1 }}>
          <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
          <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="text-glow" style={{
              fontSize: 17, fontWeight: 700, color: DS.cream,
              display: 'flex', alignItems: 'center', gap: 8,
              letterSpacing: '-0.02em',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: `linear-gradient(135deg, ${DS.gold}18, ${DS.gold}08)`,
                border: `1px solid ${DS.gold}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={16} color={DS.gold} />
              </div>
              Notes
              <span style={{
                fontSize: 11, fontWeight: 600, color: DS.faint,
                background: DS.glass, padding: '2px 9px', borderRadius: 10,
                border: `1px solid ${DS.glassBorder}`,
                backdropFilter: DS.blur,
              }}>
                {notes.length}
              </span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Grid/List toggle */}
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                style={{
                  ...iconBtn(viewMode === 'list'),
                  padding: 6,
                }}
                onMouseEnter={(e) => { if (viewMode !== 'list') e.currentTarget.style.color = DS.muted; }}
                onMouseLeave={(e) => { if (viewMode !== 'list') e.currentTarget.style.color = DS.dim; }}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                style={{
                  ...iconBtn(viewMode === 'grid'),
                  padding: 6,
                }}
                onMouseEnter={(e) => { if (viewMode !== 'grid') e.currentTarget.style.color = DS.muted; }}
                onMouseLeave={(e) => { if (viewMode !== 'grid') e.currentTarget.style.color = DS.dim; }}
              >
                <LayoutGrid size={14} />
              </button>
              <div style={{ width: 1, height: 18, background: DS.line, margin: '0 5px' }} />
              <button
                onClick={createNote}
                title="New Note"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '6px 12px', borderRadius: 8, gap: 5,
                  background: `linear-gradient(135deg, ${DS.gold}14, ${DS.gold}08)`,
                  border: `1px solid ${DS.gold}25`,
                  color: DS.gold, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  fontFamily: 'inherit', transition: `all 0.25s ${DS.ease}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${DS.gold}22, ${DS.gold}12)`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${DS.gold}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${DS.gold}14, ${DS.gold}08)`;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Plus size={14} />
                New
              </button>
            </div>
          </div>

          {/* Search bar with glassmorphism and gold focus ring */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: DS.glass,
            backdropFilter: DS.blur,
            border: searchFocused
              ? `1px solid ${DS.gold}40`
              : `1px solid ${DS.glassBorder}`,
            borderRadius: DS.radius,
            padding: '9px 14px', gap: 8,
            transition: `all 0.3s ${DS.ease}`,
            marginBottom: 12,
            boxShadow: searchFocused
              ? `0 0 0 3px ${DS.gold}10, 0 4px 16px rgba(0,0,0,0.2)`
              : '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <Search size={14} color={searchFocused ? DS.gold : DS.dim} style={{
              flexShrink: 0, transition: `color 0.2s ${DS.ease}`,
            }} />
            <input
              ref={searchRef}
              placeholder="Search notes, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: DS.cream, fontSize: 13, fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(107,99,88,0.15)', border: 'none', borderRadius: 6,
                  padding: 3, cursor: 'pointer', color: DS.dim,
                  transition: `all 0.15s ${DS.ease}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(107,99,88,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(107,99,88,0.15)'; }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div style={{
            display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2,
          }}>
            {CATEGORIES.map((cat) => {
              const isActiveCat = activeCategory === cat;
              const catColor2 = cat === 'All' ? DS.gold : (CATEGORY_COLORS[cat] || DS.muted);
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, whiteSpace: 'nowrap',
                    fontSize: 11, fontWeight: isActiveCat ? 600 : 400, cursor: 'pointer',
                    background: isActiveCat
                      ? `linear-gradient(135deg, ${catColor2}18, ${catColor2}0a)`
                      : 'transparent',
                    color: isActiveCat ? catColor2 : DS.dim,
                    border: isActiveCat ? `1px solid ${catColor2}30` : '1px solid transparent',
                    fontFamily: 'inherit',
                    transition: `all 0.25s ${DS.ease}`,
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 5,
                    backdropFilter: isActiveCat ? DS.blur : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActiveCat) {
                      e.currentTarget.style.color = DS.muted;
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActiveCat) {
                      e.currentTarget.style.color = DS.dim;
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {isActiveCat && cat !== 'All' && (
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%', background: catColor2,
                      boxShadow: `0 0 4px ${catColor2}50`,
                    }} />
                  )}
                  {cat}
                  {count > 0 && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '0px 6px',
                      borderRadius: 8,
                      background: isActiveCat ? `${catColor2}20` : 'rgba(30,38,56,0.4)',
                      color: isActiveCat ? catColor2 : DS.faint,
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Note count + stats */}
        <div style={{
          fontSize: 11, color: DS.faint, padding: '9px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', zIndex: 1,
        }}>
          <span>
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {pinnedNotes.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Pin size={9} color={DS.gold} />
                {pinnedNotes.length}
              </span>
            )}
            {notes.filter(n => n.bookmarked).length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <BookmarkCheck size={9} color={DS.purple} />
                {notes.filter(n => n.bookmarked).length}
              </span>
            )}
          </div>
        </div>

        {/* Note list / grid */}
        <div className="scrollbar-autohide" style={{
          flex: 1, overflowY: 'auto',
          padding: viewMode === 'grid' ? '0 14px 14px' : '0 8px 8px',
          position: 'relative', zIndex: 1,
        }}>
          {filteredNotes.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 20px', color: DS.faint,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
                background: DS.glass, border: `1px solid ${DS.glassBorder}`,
                backdropFilter: DS.blur,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Search size={24} style={{ opacity: 0.4 }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: DS.dim }}>No notes found</div>
              <div style={{ fontSize: 12, color: DS.darker, lineHeight: 1.6 }}>
                Try adjusting your search or category filter
              </div>
            </div>
          ) : (
            <>
              {/* Pinned section */}
              {pinnedNotes.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: DS.gold, textTransform: 'uppercase',
                    letterSpacing: '0.08em', padding: '5px 10px', marginBottom: 6,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Pin size={10} style={{ animation: 'nt-pin-glow 2.5s ease-in-out infinite' }} />
                    Pinned
                    <div style={{
                      flex: 1, height: 1,
                      background: `linear-gradient(90deg, ${DS.gold}20, transparent)`,
                    }} />
                  </div>
                  <div style={viewMode === 'grid' ? {
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                  } : {}}>
                    {pinnedNotes.map((note, i) => renderNoteCard(note, i, true))}
                  </div>
                </div>
              )}

              {/* Unpinned section */}
              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: DS.faint, textTransform: 'uppercase',
                      letterSpacing: '0.08em', padding: '5px 10px', marginBottom: 6,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <Clock size={10} />
                      Recent
                      <div style={{
                        flex: 1, height: 1,
                        background: `linear-gradient(90deg, ${DS.faint}20, transparent)`,
                      }} />
                    </div>
                  )}
                  <div style={viewMode === 'grid' ? {
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                  } : {}}>
                    {unpinnedNotes.map((note, i) => renderNoteCard(note, i + pinnedNotes.length, false))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Premium Floating Action Button */}
        <div style={{
          position: 'absolute', bottom: 20, right: 20, zIndex: 10,
        }}>
          <button
            onClick={createNote}
            title="Create new note"
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `linear-gradient(135deg, ${DS.gold}, #c49560)`,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0b0d14',
              boxShadow: `0 4px 20px ${DS.gold}30, 0 0 40px ${DS.gold}10`,
              transition: `all 0.3s ${DS.ease}`,
              animation: 'nt-fab-entrance 0.5s cubic-bezier(0.16,1,0.3,1) forwards, nt-fab-pulse 3s ease-in-out 1s infinite',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = `0 6px 30px ${DS.gold}50, 0 0 60px ${DS.gold}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 4px 20px ${DS.gold}30, 0 0 40px ${DS.gold}10`;
            }}
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EDITOR / EMPTY STATE                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedNote ? (
        <div className="card-premium" style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: DS.bg, position: 'relative',
        }}>
          {/* Subtle ambient glow behind editor */}
          <div style={{
            position: 'absolute', top: -50, right: -50, width: 300, height: 300,
            background: `radial-gradient(circle, ${CATEGORY_COLORS[selectedNote.category] || DS.muted}06 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Editor Header */}
          <div style={{
            padding: '18px 28px 14px',
            borderBottom: `1px solid ${DS.line}`,
            position: 'relative', zIndex: 1,
            background: `linear-gradient(180deg, rgba(15,18,25,0.5) 0%, transparent 100%)`,
          }}>
            <div className="noise-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none' }} />
            <div className="dot-pattern" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0.3 }} />
            {/* Title row + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <input
                value={selectedNote.title}
                onChange={(e) => updateField(selectedNote.id, 'title', e.target.value)}
                placeholder="Note title..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: DS.cream, fontSize: 24, fontWeight: 700, marginRight: 16, fontFamily: 'inherit',
                  letterSpacing: '-0.02em',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => toggleBookmark(selectedNote.id)}
                  title={selectedNote.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  style={{
                    ...iconBtn(selectedNote.bookmarked),
                    transition: `all 0.25s ${DS.ease}`,
                  }}
                  onMouseEnter={(e) => { if (!selectedNote.bookmarked) e.currentTarget.style.color = DS.purple; }}
                  onMouseLeave={(e) => { if (!selectedNote.bookmarked) e.currentTarget.style.color = DS.dim; }}
                >
                  {selectedNote.bookmarked ? (
                    <BookmarkCheck size={16} style={{ color: DS.purple, filter: `drop-shadow(0 0 4px ${DS.purple}40)` }} />
                  ) : (
                    <Bookmark size={16} />
                  )}
                </button>
                <button
                  onClick={() => togglePin(selectedNote.id)}
                  title={selectedNote.pinned ? 'Unpin' : 'Pin'}
                  style={{
                    ...iconBtn(selectedNote.pinned),
                    transition: `all 0.25s ${DS.ease}`,
                  }}
                  onMouseEnter={(e) => { if (!selectedNote.pinned) e.currentTarget.style.color = DS.gold; }}
                  onMouseLeave={(e) => { if (!selectedNote.pinned) e.currentTarget.style.color = DS.dim; }}
                >
                  {selectedNote.pinned ? (
                    <PinOff size={16} style={{ color: DS.gold }} />
                  ) : (
                    <Pin size={16} />
                  )}
                </button>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  title={previewMode ? 'Edit' : 'Preview'}
                  style={{
                    ...iconBtn(previewMode),
                    transition: `all 0.25s ${DS.ease}`,
                  }}
                  onMouseEnter={(e) => { if (!previewMode) e.currentTarget.style.color = DS.green; }}
                  onMouseLeave={(e) => { if (!previewMode) e.currentTarget.style.color = DS.dim; }}
                >
                  {previewMode ? <Edit3 size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyToClipboard(selectedNote.content)}
                  title="Copy to clipboard"
                  style={{
                    ...iconBtn(copied),
                    transition: `all 0.25s ${DS.ease}`,
                  }}
                >
                  {copied ? <Check size={16} color={DS.green} /> : <Copy size={16} />}
                </button>
                <div style={{ width: 1, height: 20, background: DS.line, margin: '0 3px' }} />
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  title="Delete note"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 7, borderRadius: 8, background: 'transparent',
                    border: '1px solid transparent', color: DS.dim, cursor: 'pointer',
                    transition: `all 0.25s ${DS.ease}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#e07a5f';
                    e.currentTarget.style.background = 'rgba(224,122,95,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(224,122,95,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = DS.dim;
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Meta row: category + date badges */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: DS.dim, marginBottom: 12,
              flexWrap: 'wrap',
            }}>
              {/* Category selector with color indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 8,
                background: `${CATEGORY_COLORS[selectedNote.category] || DS.muted}10`,
                border: `1px solid ${CATEGORY_COLORS[selectedNote.category] || DS.muted}20`,
                backdropFilter: DS.blur,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: CATEGORY_COLORS[selectedNote.category] || DS.muted,
                  boxShadow: `0 0 8px ${CATEGORY_COLORS[selectedNote.category] || DS.muted}40`,
                }} />
                <select
                  value={selectedNote.category}
                  onChange={(e) => updateField(selectedNote.id, 'category', e.target.value as Exclude<Category, 'All'>)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: CATEGORY_COLORS[selectedNote.category] || DS.muted,
                    fontSize: 11, outline: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 600,
                  }}
                >
                  {EDITABLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <DateBadge
                label="Modified"
                value={formatRelativeDate(selectedNote.updatedAt)}
                icon={Calendar}
                color={DS.dim}
              />
              <DateBadge
                label="Created"
                value={formatDate(selectedNote.createdAt)}
                icon={Clock}
                color={DS.faint}
              />
            </div>

            {/* Tags row with colored pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', position: 'relative' }}>
              <Tag size={12} color={DS.dim} />
              {selectedNote.tags.map((tag) => {
                const tc = getTagColor(tag);
                return (
                  <span key={tag} style={{
                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                    padding: '3px 11px', borderRadius: 20,
                    background: `${tc}12`, color: tc,
                    border: `1px solid ${tc}15`,
                    fontWeight: 500, transition: `all 0.2s ${DS.ease}`,
                  }}>
                    {tag}
                    <span
                      onClick={() => removeTag(selectedNote.id, tag)}
                      style={{
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        opacity: 0.5, marginLeft: 2,
                        transition: `opacity 0.15s ${DS.ease}`,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '1'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '0.5'; }}
                    >
                      <X size={10} />
                    </span>
                  </span>
                );
              })}
              <div style={{ position: 'relative' }}>
                <input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(selectedNote.id, tagInput);
                    }
                  }}
                  style={{
                    width: 110, background: 'transparent',
                    border: `1px solid ${DS.glassBorder}`,
                    borderRadius: 20, padding: '3px 11px', fontSize: 11, color: DS.cream,
                    outline: 'none', fontFamily: 'inherit',
                    transition: `all 0.2s ${DS.ease}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${DS.gold}25`; }}
                  onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = DS.glassBorder; }}
                />
                {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                  <div className="scrollbar-autohide" style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 6,
                    background: DS.glass, backdropFilter: DS.blur,
                    border: `1px solid ${DS.glassBorder}`, borderRadius: DS.radius,
                    zIndex: 20, minWidth: 180,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                    maxHeight: 200, overflowY: 'auto', padding: 5,
                    animation: 'nt-slide-down 0.2s ease-out forwards',
                  }}>
                    {filteredTagSuggestions.map((sug) => {
                      const sc = getTagColor(sug);
                      return (
                        <div
                          key={sug}
                          onMouseDown={(e) => { e.preventDefault(); addTag(selectedNote.id, sug); }}
                          style={{
                            padding: '7px 12px', fontSize: 12, color: DS.muted, cursor: 'pointer',
                            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
                            transition: `all 0.15s ${DS.ease}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${sc}10`;
                            e.currentTarget.style.color = sc;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = DS.muted;
                          }}
                        >
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%', background: sc, flexShrink: 0,
                            boxShadow: `0 0 4px ${sc}40`,
                          }} />
                          {sug}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor Body */}
          <div className="scrollbar-autohide" style={{ flex: 1, padding: '14px 32px 24px', overflow: 'auto', position: 'relative', zIndex: 1 }}>
            {previewMode ? (
              <div
                style={{ lineHeight: 1.7, fontSize: 14, maxWidth: 720, paddingTop: 8 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedNote.content) }}
              />
            ) : (
              <div style={{ maxWidth: 720, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Formatting Toolbar */}
                <FormattingToolbar onInsert={insertFormatting} />
                <textarea
                  ref={textareaRef}
                  value={selectedNote.content}
                  onChange={(e) => updateField(selectedNote.id, 'content', e.target.value)}
                  placeholder="Start writing... (supports basic markdown: # headers, **bold**, *italic*, - lists)"
                  style={{
                    width: '100%', flex: 1, background: 'transparent', border: 'none',
                    outline: 'none', color: DS.muted, fontSize: 14, lineHeight: 1.8,
                    resize: 'none', fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
                    letterSpacing: '-0.01em',
                  }}
                />
              </div>
            )}
          </div>

          {/* Editor Footer */}
          <div style={{
            padding: '10px 28px',
            borderTop: `1px solid ${DS.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 12, color: DS.faint,
            background: `linear-gradient(0deg, rgba(15,18,25,0.3) 0%, transparent 100%)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Hash size={11} />
                {getWordCount(selectedNote.content)} words
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlignLeft size={11} />
                {getCharCount(selectedNote.content)} chars
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <BookOpen size={11} />
                {getReadingTime(getWordCount(selectedNote.content))}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <CharCountRing count={getCharCount(selectedNote.content)} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {previewMode ? (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: DS.green, fontWeight: 500,
                    padding: '3px 10px', borderRadius: 8,
                    background: `${DS.green}10`,
                  }}>
                    <Eye size={11} />
                    Preview
                  </span>
                ) : (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: DS.gold, fontWeight: 500,
                    padding: '3px 10px', borderRadius: 8,
                    background: `${DS.gold}10`,
                  }}>
                    <Edit3 size={11} />
                    Editing
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Empty State ────────────────────────────────────────────────── */
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', color: DS.faint, gap: 8, padding: 40, textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Ambient background glow */}
          <div style={{
            position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 400, height: 400,
            background: `radial-gradient(circle, ${DS.gold}04 0%, ${DS.purple}02 40%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <EmptyStateIllustration />
          <div style={{
            fontSize: 22, fontWeight: 700, color: DS.dim, marginTop: 12,
            letterSpacing: '-0.02em',
          }}>
            Capture Your Thoughts
          </div>
          <div style={{
            fontSize: 13, color: DS.faint, maxWidth: 360, lineHeight: 1.7,
          }}>
            Select a note from the sidebar to view and edit, or create a new one to start capturing your ideas, plans, and reflections.
          </div>
          <button
            onClick={createNote}
            style={{
              marginTop: 16, padding: '12px 28px',
              background: `linear-gradient(135deg, ${DS.gold}12, ${DS.gold}06)`,
              border: `1px solid ${DS.gold}25`,
              borderRadius: DS.radius,
              color: DS.gold, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
              transition: `all 0.3s ${DS.ease}`,
              backdropFilter: DS.blur,
              boxShadow: `0 4px 16px ${DS.gold}08`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${DS.gold}20, ${DS.gold}10)`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${DS.gold}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${DS.gold}12, ${DS.gold}06)`;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${DS.gold}08`;
            }}
          >
            <Plus size={16} />
            Create New Note
          </button>
          <div style={{
            marginTop: 20, fontSize: 11, color: DS.darker, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Sparkles size={12} color={DS.gold} opacity={0.4} />
            Supports Markdown formatting
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesView;
