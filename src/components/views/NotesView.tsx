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
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
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
      <circle cx="18" cy="18" r={radius} fill="none" stroke="#1e2638" strokeWidth="2.5" />
      <circle
        cx="18" cy="18" r={radius} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
        style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
      />
      <text x="18" y="18" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 8, fill: color, fontWeight: 600 }}>
        {pct < 0.01 ? '0%' : pct >= 1 ? 'MAX' : `${Math.round(pct * 100)}%`}
      </text>
    </svg>
  );
}

// ─── Formatting Toolbar Hints ─────────────────────────────────────────────────

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
      display: 'flex', alignItems: 'center', gap: 2, padding: '6px 0',
      borderBottom: '1px solid #1e2638', marginBottom: 8,
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
              width: 30, height: 28, borderRadius: 6,
              background: 'transparent', border: '1px solid transparent',
              color: '#4a443e', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212,165,116,0.08)';
              e.currentTarget.style.color = '#d4a574';
              e.currentTarget.style.borderColor = 'rgba(212,165,116,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#4a443e';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <Icon size={14} />
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#3a352f',
        padding: '0 6px',
      }}>
        <Type size={10} />
        <span>Markdown supported</span>
      </div>
    </div>
  );
}

// ─── Empty State Illustration (pure SVG) ─────────────────────────────────────

function EmptyStateIllustration() {
  return (
    <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="130" rx="70" ry="12" fill="rgba(212,165,116,0.06)" />
      <rect x="40" y="20" width="100" height="120" rx="8" fill="#131720" stroke="#1e2638" strokeWidth="1.5" />
      <rect x="56" y="20" width="2" height="120" fill="#1e2638" />
      {[35, 50, 65, 80, 95, 110, 125].map((y) => (
        <circle key={y} cx="57" cy={y} r="4" fill="none" stroke="#2e3a4e" strokeWidth="1.2" />
      ))}
      <line x1="68" y1="42" x2="125" y2="42" stroke="#1e2638" strokeWidth="1" />
      <line x1="68" y1="55" x2="120" y2="55" stroke="#1e2638" strokeWidth="1" />
      <line x1="68" y1="68" x2="115" y2="68" stroke="#1e2638" strokeWidth="1" />
      <line x1="68" y1="81" x2="122" y2="81" stroke="#1e2638" strokeWidth="1" />
      <line x1="68" y1="94" x2="108" y2="94" stroke="#1e2638" strokeWidth="1" />
      <line x1="68" y1="42" x2="100" y2="42" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <g transform="translate(115, 15) rotate(25)">
        <rect x="0" y="0" width="6" height="50" rx="3" fill="#8b5cf6" opacity="0.8" />
        <polygon points="0,50 6,50 3,60" fill="#d4a574" opacity="0.8" />
      </g>
      <g transform="translate(135, 25)">
        <path d="M0,-6 L1.5,0 L0,6 L-1.5,0 Z" fill="#d4a574" opacity="0.5" />
        <path d="M-6,0 L0,-1.5 L6,0 L0,1.5 Z" fill="#d4a574" opacity="0.5" />
      </g>
      <g transform="translate(30, 100)">
        <path d="M0,-4 L1,0 L0,4 L-1,0 Z" fill="#8b5cf6" opacity="0.4" />
        <path d="M-4,0 L0,-1 L4,0 L0,1 Z" fill="#8b5cf6" opacity="0.4" />
      </g>
    </svg>
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
  const searchRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // ── Render Helpers ─────────────────────────────────────────────────────

  const iconBtn = (active?: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 6,
    background: active ? 'rgba(212,165,116,0.12)' : 'transparent',
    border: '1px solid transparent',
    color: active ? '#d4a574' : '#6b6358',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const renderNoteCard = (note: Note, index: number, isPinned: boolean) => {
    const isActive = selectedId === note.id;
    const catColor = CATEGORY_COLORS[note.category] || '#a09888';
    const wordCount = getWordCount(note.content);

    if (viewMode === 'grid') {
      return (
        <AnimatedCard key={note.id} delay={index * 50}>
          <div
            onClick={() => { setSelectedId(note.id); setPreviewMode(false); }}
            style={{
              background: isActive ? '#131720' : '#0f1219',
              border: isActive ? '1px solid rgba(212,165,116,0.3)' : '1px solid #1e2638',
              borderLeft: `3px solid ${catColor}`,
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#2e3a4e';
                e.currentTarget.style.borderLeftColor = catColor;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.2), inset 3px 0 0 ${catColor}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#1e2638';
                e.currentTarget.style.borderLeftColor = catColor;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {/* Pin + Bookmark indicators */}
            <div style={{
              position: 'absolute', top: 8, right: 8,
              display: 'flex', gap: 4,
            }}>
              {note.bookmarked && (
                <BookmarkCheck size={12} style={{ color: '#8b5cf6', opacity: 0.7 }} />
              )}
              {isPinned && (
                <Pin size={12} style={{ color: '#d4a574', opacity: 0.6 }} />
              )}
            </div>

            {/* Category pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: `${catColor}15`, color: catColor,
              marginBottom: 10, alignSelf: 'flex-start',
              letterSpacing: '0.02em',
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%', background: catColor,
              }} />
              {note.category}
            </div>

            {/* Title */}
            <div style={{
              fontSize: 14, fontWeight: 600, color: '#f0ebe4', marginBottom: 6,
              lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {note.title || 'Untitled'}
            </div>

            {/* Content preview */}
            <div style={{
              fontSize: 12, color: '#6b6358', lineHeight: 1.5, flex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              marginBottom: 12,
            }}>
              {getContentPreview(note.content)}
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {note.tags.slice(0, 3).map((tag) => (
                  <span key={tag} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    background: `${getTagColor(tag)}15`, color: getTagColor(tag),
                    fontWeight: 500,
                  }}>
                    {tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(107,99,88,0.15)', color: '#6b6358',
                  }}>
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 10, color: '#4a443e', borderTop: '1px solid #1e2638',
              paddingTop: 8, marginTop: 'auto',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={10} />
                {formatRelativeDate(note.updatedAt)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Hash size={9} />
                  {wordCount}w
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <AlignLeft size={9} />
                  {getCharCount(note.content)}c
                </span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      );
    }

    // List view
    return (
      <AnimatedCard key={note.id} delay={index * 35}>
        <div
          onClick={() => { setSelectedId(note.id); setPreviewMode(false); }}
          style={{
            display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 10,
            cursor: 'pointer',
            background: isActive ? 'rgba(212,165,116,0.06)' : 'transparent',
            border: isActive ? '1px solid rgba(212,165,116,0.15)' : '1px solid transparent',
            transition: 'all 0.15s',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = 'rgba(212,165,116,0.03)';
              e.currentTarget.style.border = '1px solid #1e2638';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.border = '1px solid transparent';
            }
          }}
        >
          {/* Left color bar */}
          <div style={{
            width: 3, borderRadius: 2, flexShrink: 0,
            background: isActive ? '#d4a574' : catColor,
            opacity: isActive ? 1 : 0.5,
            transition: 'opacity 0.15s',
            boxShadow: isActive ? `0 0 8px ${catColor}40` : 'none',
          }} />

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
            }}>
              {isPinned && <Pin size={11} style={{ color: '#d4a574', flexShrink: 0 }} />}
              {note.bookmarked && <BookmarkCheck size={11} style={{ color: '#8b5cf6', flexShrink: 0 }} />}
              <span style={{
                fontSize: 13, fontWeight: 600, color: '#f0ebe4',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {note.title || 'Untitled'}
              </span>
            </div>

            {/* Preview text */}
            <div style={{
              fontSize: 12, color: '#6b6358', lineHeight: 1.5, marginBottom: 6,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {getContentPreview(note.content, 80)}
            </div>

            {/* Bottom row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 4,
                background: `${catColor}15`, color: catColor,
              }}>
                {note.category}
              </span>
              {note.tags.slice(0, 2).map((tag) => (
                <span key={tag} style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 4,
                  background: `${getTagColor(tag)}12`, color: getTagColor(tag),
                }}>
                  {tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span style={{ fontSize: 10, color: '#4a443e' }}>+{note.tags.length - 2}</span>
              )}
              <span style={{
                fontSize: 10, color: '#4a443e', marginLeft: 'auto',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <AlignLeft size={9} />
                  {getCharCount(note.content)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={9} />
                  {formatRelativeDate(note.updatedAt)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </AnimatedCard>
    );
  };

  // ── Date badge component ─────────────────────────────────────────────────

  const DateBadge = ({ label, value, icon: Icon, color = '#6b6358' }: {
    label: string; value: string; icon: React.ElementType; color?: string;
  }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
      background: 'rgba(30,38,56,0.3)', borderRadius: 6,
      border: '1px solid rgba(30,38,56,0.5)',
    }}>
      <Icon size={10} style={{ color: '#4a443e' }} />
      <span style={{ fontSize: 10, color: '#4a443e', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 11, color, fontWeight: 500 }}>{value}</span>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div style={{
        display: 'flex', height: '100%', background: '#0b0d14', color: '#f0ebe4',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#4a443e',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'rgba(212,165,116,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={24} color="#4a443e" />
          </div>
          <span style={{ fontSize: 14, color: '#6b6358' }}>Loading notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', height: '100%', background: '#0b0d14', color: '#f0ebe4',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
    }}>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        width: 360, minWidth: 360, background: '#0f1219',
        borderRight: '1px solid #1e2638', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1e2638' }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#d4a574" />
              Notes
              <span style={{
                fontSize: 11, fontWeight: 500, color: '#4a443e',
                background: 'rgba(30,38,56,0.4)', padding: '1px 7px', borderRadius: 8,
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
                  padding: 5,
                }}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                style={{
                  ...iconBtn(viewMode === 'grid'),
                  padding: 5,
                }}
              >
                <LayoutGrid size={14} />
              </button>
              <div style={{ width: 1, height: 16, background: '#1e2638', margin: '0 4px' }} />
              <button
                onClick={createNote}
                title="New Note"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '5px 10px', borderRadius: 6, gap: 4,
                  background: 'rgba(212,165,116,0.1)', border: '1px solid rgba(212,165,116,0.2)',
                  color: '#d4a574', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  fontFamily: 'inherit', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212,165,116,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(212,165,116,0.1)';
                }}
              >
                <Plus size={14} />
                New
              </button>
            </div>
          </div>

          {/* Search bar with icon and clear */}
          <div style={{
            display: 'flex', alignItems: 'center', background: '#131720',
            border: '1px solid #1e2638', borderRadius: 10, padding: '8px 12px', gap: 8,
            transition: 'border-color 0.15s',
            marginBottom: 10,
          }}>
            <Search size={14} color="#6b6358" style={{ flexShrink: 0 }} />
            <input
              ref={searchRef}
              placeholder="Search notes, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#f0ebe4', fontSize: 13, fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(107,99,88,0.2)', border: 'none', borderRadius: 4,
                  padding: 2, cursor: 'pointer', color: '#6b6358',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category tabs with counts */}
          <div style={{
            display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2,
          }}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const catColor2 = cat === 'All' ? '#d4a574' : (CATEGORY_COLORS[cat] || '#a09888');
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                    fontSize: 11, fontWeight: isActive ? 600 : 400, cursor: 'pointer',
                    background: isActive ? `${catColor2}18` : 'transparent',
                    color: isActive ? catColor2 : '#6b6358',
                    border: isActive ? `1px solid ${catColor2}30` : '1px solid transparent',
                    fontFamily: 'inherit', transition: 'all 0.15s', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#a09888';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#6b6358';
                  }}
                >
                  {cat}
                  {count > 0 && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '0px 5px',
                      borderRadius: 6,
                      background: isActive ? `${catColor2}22` : 'rgba(30,38,56,0.4)',
                      color: isActive ? catColor2 : '#4a443e',
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
          fontSize: 11, color: '#4a443e', padding: '8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pinnedNotes.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Pin size={9} color="#d4a574" />
                {pinnedNotes.length}
              </span>
            )}
            {notes.filter(n => n.bookmarked).length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <BookmarkCheck size={9} color="#8b5cf6" />
                {notes.filter(n => n.bookmarked).length}
              </span>
            )}
          </div>
        </div>

        {/* Note list / grid */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: viewMode === 'grid' ? '0 12px 12px' : '0 8px 8px',
        }}>
          {filteredNotes.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px', color: '#4a443e',
            }}>
              <Search size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
              <div style={{ fontSize: 13, marginBottom: 4 }}>No notes found</div>
              <div style={{ fontSize: 11, color: '#3a352f' }}>
                Try adjusting your search or category filter
              </div>
            </div>
          ) : (
            <>
              {/* Pinned section */}
              {pinnedNotes.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: '#d4a574', textTransform: 'uppercase',
                    letterSpacing: '0.06em', padding: '4px 8px', marginBottom: 4,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <Pin size={10} />
                    Pinned
                  </div>
                  <div style={viewMode === 'grid' ? {
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
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
                      fontSize: 10, fontWeight: 600, color: '#4a443e', textTransform: 'uppercase',
                      letterSpacing: '0.06em', padding: '4px 8px', marginBottom: 4,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <Clock size={10} />
                      Recent
                    </div>
                  )}
                  <div style={viewMode === 'grid' ? {
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                  } : {}}>
                    {unpinnedNotes.map((note, i) => renderNoteCard(note, i + pinnedNotes.length, false))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EDITOR / EMPTY STATE                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedNote ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0b0d14' }}>
          {/* Editor Header */}
          <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid #1e2638' }}>
            {/* Title row + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <input
                value={selectedNote.title}
                onChange={(e) => updateField(selectedNote.id, 'title', e.target.value)}
                placeholder="Note title..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#f0ebe4', fontSize: 22, fontWeight: 700, marginRight: 12, fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => toggleBookmark(selectedNote.id)}
                  title={selectedNote.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  style={iconBtn(selectedNote.bookmarked)}
                >
                  {selectedNote.bookmarked ? (
                    <BookmarkCheck size={15} style={{ color: '#8b5cf6' }} />
                  ) : (
                    <Bookmark size={15} />
                  )}
                </button>
                <button
                  onClick={() => togglePin(selectedNote.id)}
                  title={selectedNote.pinned ? 'Unpin' : 'Pin'}
                  style={iconBtn(selectedNote.pinned)}
                >
                  {selectedNote.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                </button>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  title={previewMode ? 'Edit' : 'Preview'}
                  style={iconBtn(previewMode)}
                >
                  {previewMode ? <Edit3 size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => copyToClipboard(selectedNote.content)}
                  title="Copy to clipboard"
                  style={iconBtn(copied)}
                >
                  {copied ? <Check size={15} color="#6b8f71" /> : <Copy size={15} />}
                </button>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  title="Delete note"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 6, borderRadius: 6, background: 'transparent',
                    border: '1px solid transparent', color: '#6b6358', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#e07a5f'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#6b6358'; }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Meta row: category + date badges */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b6358', marginBottom: 10,
              flexWrap: 'wrap',
            }}>
              {/* Category selector with color indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 6,
                background: `${CATEGORY_COLORS[selectedNote.category] || '#a09888'}12`,
                border: `1px solid ${CATEGORY_COLORS[selectedNote.category] || '#a09888'}25`,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: CATEGORY_COLORS[selectedNote.category] || '#a09888',
                  boxShadow: `0 0 6px ${CATEGORY_COLORS[selectedNote.category] || '#a09888'}40`,
                }} />
                <select
                  value={selectedNote.category}
                  onChange={(e) => updateField(selectedNote.id, 'category', e.target.value as Exclude<Category, 'All'>)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: CATEGORY_COLORS[selectedNote.category] || '#a09888',
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
                color="#6b6358"
              />
              <DateBadge
                label="Created"
                value={formatDate(selectedNote.createdAt)}
                icon={Clock}
                color="#4a443e"
              />
            </div>

            {/* Tags row with colored pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', position: 'relative' }}>
              <Tag size={12} color="#6b6358" />
              {selectedNote.tags.map((tag) => {
                const tc = getTagColor(tag);
                return (
                  <span key={tag} style={{
                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                    padding: '3px 10px', borderRadius: 20,
                    background: `${tc}15`, color: tc,
                    fontWeight: 500, transition: 'all 0.15s',
                  }}>
                    {tag}
                    <span
                      onClick={() => removeTag(selectedNote.id, tag)}
                      style={{
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        opacity: 0.6, marginLeft: 2,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '1'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '0.6'; }}
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
                    width: 110, background: 'transparent', border: '1px solid #1e2638',
                    borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#f0ebe4',
                    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2e3a4e'; }}
                  onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#1e2638'; }}
                />
                {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 4,
                    background: '#131720', border: '1px solid #1e2638', borderRadius: 8,
                    zIndex: 20, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    maxHeight: 180, overflowY: 'auto', padding: 4,
                  }}>
                    {filteredTagSuggestions.map((sug) => {
                      const sc = getTagColor(sug);
                      return (
                        <div
                          key={sug}
                          onMouseDown={(e) => { e.preventDefault(); addTag(selectedNote.id, sug); }}
                          style={{
                            padding: '6px 10px', fontSize: 12, color: '#a09888', cursor: 'pointer',
                            borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.1s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${sc}12`;
                            e.currentTarget.style.color = sc;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#a09888';
                          }}
                        >
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%', background: sc, flexShrink: 0,
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
          <div style={{ flex: 1, padding: '12px 28px 20px', overflow: 'auto' }}>
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
                    outline: 'none', color: '#a09888', fontSize: 14, lineHeight: 1.8,
                    resize: 'none', fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
                    letterSpacing: '-0.01em',
                  }}
                />
              </div>
            )}
          </div>

          {/* Editor Footer */}
          <div style={{
            padding: '8px 24px', borderTop: '1px solid #1e2638',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 12, color: '#4a443e',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Hash size={11} />
                {getWordCount(selectedNote.content)} words
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlignLeft size={11} />
                {getCharCount(selectedNote.content)} chars
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BookOpen size={11} />
                {getReadingTime(getWordCount(selectedNote.content))}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CharCountRing count={getCharCount(selectedNote.content)} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {previewMode ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b8f71' }}>
                    <Eye size={11} />
                    Preview
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d4a574' }}>
                    <Edit3 size={11} />
                    Editing
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Empty State with Illustration ──────────────────────────────── */
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', color: '#4a443e', gap: 8, padding: 40, textAlign: 'center',
        }}>
          <EmptyStateIllustration />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#6b6358', marginTop: 8 }}>
            Capture Your Thoughts
          </div>
          <div style={{ fontSize: 13, color: '#4a443e', maxWidth: 340, lineHeight: 1.7 }}>
            Select a note from the sidebar to view and edit, or create a new one to start capturing your ideas, plans, and reflections.
          </div>
          <button
            onClick={createNote}
            style={{
              marginTop: 12, padding: '10px 24px', background: 'rgba(212,165,116,0.1)',
              border: '1px solid rgba(212,165,116,0.25)', borderRadius: 10,
              color: '#d4a574', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212,165,116,0.18)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(212,165,116,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={16} />
            Create New Note
          </button>
          <div style={{
            marginTop: 16, fontSize: 11, color: '#3a352f', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Sparkles size={12} color="#d4a574" opacity={0.4} />
            Supports Markdown formatting
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesView;
