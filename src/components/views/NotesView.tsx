'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'frequency-notes';

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

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Blue Spirit Planning Notes',
    content: '# Blue Spirit Planning\n\nKey areas to address for the upcoming Blue Spirit gathering:\n\n## Logistics\n- Venue confirmation and capacity check\n- Catering arrangements for 50+ attendees\n- AV equipment and presentation setup\n\n## Agenda Items\n1. Opening ceremony and intention setting\n2. Breakout sessions on community governance\n3. Financial transparency workshop\n4. Closing circle and commitments\n\n## Action Items\n- **Send invitations** by end of week\n- *Confirm speakers* for each session\n- Prepare welcome packets\n\nNotes from last planning call: focus on creating space for authentic dialogue rather than rigid structure.',
    category: 'Blue Spirit',
    tags: ['event', 'logistics'],
    pinned: true,
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

function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getReadingTime(words: number): string {
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers (must come before bold/italic)
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:600;color:#f0ebe4;margin:16px 0 8px 0;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:600;color:#f0ebe4;margin:20px 0 10px 0;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:700;color:#f0ebe4;margin:24px 0 12px 0;">$1</h1>');

  // Bold then italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f0ebe4;font-weight:600;">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em style="color:#d4a574;font-style:italic;">$1</em>');

  // Unordered list items
  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:20px;padding:2px 0;color:#a09888;list-style-type:disc;">$1</li>');

  // Ordered list items
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li style="margin-left:20px;padding:2px 0;color:#a09888;list-style-type:decimal;">$1</li>');

  // Wrap consecutive disc <li> in <ul>
  html = html.replace(/((?:<li[^>]*list-style-type:disc[^>]*>.*?<\/li>\n?)+)/g, '<ul style="margin:8px 0;padding:0;">$1</ul>');

  // Wrap consecutive decimal <li> in <ol>
  html = html.replace(/((?:<li[^>]*list-style-type:decimal[^>]*>.*?<\/li>\n?)+)/g, '<ol style="margin:8px 0;padding:0;">$1</ol>');

  // Remaining non-empty lines become paragraphs (skip lines that start with HTML tags)
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);
    if (loaded.length > 0) setSelectedId(loaded[0].id);
    setMounted(true);
  }, []);

  // ── Auto-save whenever notes change ──────────────────────────────────────
  useEffect(() => {
    if (mounted) saveNotes(notes);
  }, [notes, mounted]);

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

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) ?? null, [notes, selectedId]);

  const filteredTagSuggestions = useMemo(() => {
    if (!selectedNote) return [];
    const existing = selectedNote.tags;
    if (!tagInput.trim()) return TAG_SUGGESTIONS.filter((t) => !existing.includes(t)).slice(0, 8);
    const q = tagInput.toLowerCase();
    return TAG_SUGGESTIONS.filter((t) => t.includes(q) && !existing.includes(t)).slice(0, 8);
  }, [tagInput, selectedNote]);

  // ── Styles ───────────────────────────────────────────────────────────────

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

  const categoryBadge = (cat: string): React.CSSProperties => ({
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 4,
    background: `${CATEGORY_COLORS[cat] || '#a09888'}18`,
    color: CATEGORY_COLORS[cat] || '#a09888',
    fontWeight: 500,
  });

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
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR                                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        width: 320, minWidth: 320, background: '#0f1219',
        borderRight: '1px solid #1e2638', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1e2638' }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe4', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#d4a574" />
              Notes
            </span>
            <button
              onClick={createNote}
              title="New Note"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 6,
                background: 'rgba(212,165,116,0.1)', border: '1px solid rgba(212,165,116,0.2)',
                color: '#d4a574', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Category folder selector */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: '#131720', border: '1px solid #1e2638',
                borderRadius: 8, color: '#a09888', fontSize: 13, cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderOpen size={14} />
                {activeCategory}
              </span>
              <ChevronDown size={14} />
            </button>
            {showCategoryDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                background: '#131720', border: '1px solid #1e2638', borderRadius: 8,
                zIndex: 20, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowCategoryDropdown(false); }}
                    style={{
                      padding: '8px 12px', fontSize: 13,
                      color: activeCategory === cat ? '#d4a574' : '#a09888',
                      background: activeCategory === cat ? 'rgba(212,165,116,0.08)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(212,165,116,0.06)'; }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        activeCategory === cat ? 'rgba(212,165,116,0.08)' : 'transparent';
                    }}
                  >
                    {cat !== 'All' && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: CATEGORY_COLORS[cat] || '#a09888', flexShrink: 0,
                      }} />
                    )}
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', background: '#131720',
            border: '1px solid #1e2638', borderRadius: 8, padding: '7px 10px', gap: 8,
          }}>
            <Search size={14} color="#6b6358" />
            <input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#f0ebe4', fontSize: 13, fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <X size={14} color="#6b6358" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
            )}
          </div>
        </div>

        {/* Note count */}
        <div style={{ fontSize: 11, color: '#4a443e', padding: '6px 16px 10px' }}>
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        </div>

        {/* Note list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#4a443e', fontSize: 13 }}>
              No notes found.
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = selectedId === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => { setSelectedId(note.id); setPreviewMode(false); }}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? 'rgba(212,165,116,0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid #d4a574' : '3px solid transparent',
                    marginBottom: 2, transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(212,165,116,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: '#f0ebe4', marginBottom: 3,
                    display: 'flex', alignItems: 'center', gap: 6,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {note.pinned && <Pin size={12} style={{ color: '#d4a574', flexShrink: 0 }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {note.title || 'Untitled'}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11, color: '#6b6358', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={categoryBadge(note.category)}>{note.category}</span>
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                  {note.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 4,
                          background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
                        }}>
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 4,
                          background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', opacity: 0.6,
                        }}>
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* EDITOR / EMPTY STATE                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {selectedNote ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0b0d14' }}>
          {/* Editor Header */}
          <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid #1e2638' }}>
            {/* Title row + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <input
                value={selectedNote.title}
                onChange={(e) => updateField(selectedNote.id, 'title', e.target.value)}
                placeholder="Note title..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#f0ebe4', fontSize: 20, fontWeight: 600, marginRight: 12, fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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

            {/* Meta row: category select + date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6b6358', marginBottom: 8 }}>
              <select
                value={selectedNote.category}
                onChange={(e) => updateField(selectedNote.id, 'category', e.target.value as Exclude<Category, 'All'>)}
                style={{
                  background: '#131720', border: '1px solid #1e2638', borderRadius: 4,
                  color: '#a09888', fontSize: 11, padding: '2px 6px', outline: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {EDITABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} />
                {formatDate(selectedNote.updatedAt)}
              </span>
            </div>

            {/* Tags row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', position: 'relative' }}>
              <Tag size={12} color="#6b6358" />
              {selectedNote.tags.map((tag) => (
                <span key={tag} style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                  padding: '2px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
                }}>
                  {tag}
                  <span
                    onClick={() => removeTag(selectedNote.id, tag)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.7 }}
                  >
                    <X size={10} />
                  </span>
                </span>
              ))}
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
                    width: 100, background: 'transparent', border: '1px solid #1e2638',
                    borderRadius: 4, padding: '2px 6px', fontSize: 11, color: '#f0ebe4',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 4,
                    background: '#131720', border: '1px solid #1e2638', borderRadius: 6,
                    zIndex: 20, minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    maxHeight: 160, overflowY: 'auto',
                  }}>
                    {filteredTagSuggestions.map((sug) => (
                      <div
                        key={sug}
                        onMouseDown={(e) => { e.preventDefault(); addTag(selectedNote.id, sug); }}
                        style={{ padding: '6px 10px', fontSize: 12, color: '#a09888', cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = 'rgba(139,92,246,0.08)';
                          (e.currentTarget as HTMLDivElement).style.color = '#8b5cf6';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                          (e.currentTarget as HTMLDivElement).style.color = '#a09888';
                        }}
                      >
                        {sug}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor Body */}
          <div style={{ flex: 1, padding: '16px 24px', overflow: 'auto' }}>
            {previewMode ? (
              <div
                style={{ lineHeight: 1.7, fontSize: 14 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedNote.content) }}
              />
            ) : (
              <textarea
                value={selectedNote.content}
                onChange={(e) => updateField(selectedNote.id, 'content', e.target.value)}
                placeholder="Start writing... (supports basic markdown: # headers, **bold**, *italic*, - lists)"
                style={{
                  width: '100%', height: '100%', background: 'transparent', border: 'none',
                  outline: 'none', color: '#a09888', fontSize: 14, lineHeight: 1.7,
                  resize: 'none', fontFamily: 'inherit',
                }}
              />
            )}
          </div>

          {/* Editor Footer */}
          <div style={{
            padding: '10px 24px', borderTop: '1px solid #1e2638',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 12, color: '#4a443e',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>{getWordCount(selectedNote.content)} words</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BookOpen size={11} />
                {getReadingTime(getWordCount(selectedNote.content))}
              </span>
            </span>
            <span>Created {formatDate(selectedNote.createdAt)}</span>
          </div>
        </div>
      ) : (
        /* ─── Empty State ─────────────────────────────────────────────────── */
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', color: '#4a443e', gap: 16, padding: 40, textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'rgba(212,165,116,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={28} color="#d4a574" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#6b6358' }}>
            No Note Selected
          </div>
          <div style={{ fontSize: 13, color: '#4a443e', maxWidth: 300, lineHeight: 1.6 }}>
            Select a note from the sidebar to view and edit, or create a new one to get started with your ideas.
          </div>
          <button
            onClick={createNote}
            style={{
              marginTop: 8, padding: '10px 20px', background: 'rgba(212,165,116,0.1)',
              border: '1px solid rgba(212,165,116,0.2)', borderRadius: 8,
              color: '#d4a574', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
            }}
          >
            <Plus size={16} />
            Create New Note
          </button>
        </div>
      )}
    </div>
  );
}

export default NotesView;
