'use client';

import React, { useState, useMemo } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  Search,
  FileText,
  Clock,
  Edit3,
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

const defaultNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Blue Spirit Planning Notes',
    content:
      'Key considerations for Blue Spirit 6.0:\n\n- Venue: Blue Spirit Retreat Center, Nosara\n- Date: July 18, 2026\n- Capacity: 50-80 participants\n- Programming needs: node showcases, deal presentations, coherence practices\n- Must coordinate with Sian on logistics and budget\n- Registration opens April 15th\n\nAction items:\n- Finalize speaker list by May\n- Coordinate with Gareth on Nicoya site visit\n- Plan CEO candidate casual conversations',
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'note-2',
    title: 'DAF Structure Thoughts',
    content:
      'Notes from conversation with Colleen:\n\n- 501(c)(3) structure allows tax-deductible contributions\n- DECO framework: Donor Equity Conversion Option\n- Need holdco (Delaware LLC) for equity management\n- Compliance checklist must be complete by end of March\n- Family office outreach strategy for $500K+ goal\n\nKey question: How do we balance donor acknowledgment with compliance requirements?',
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: 'note-3',
    title: 'Teal Governance Reflections',
    content:
      'After Cabo, the Teal governance model is really landing.\n\nCore principles:\n1. Responsibility-weighted voice (not equal vote)\n2. Decision logs for every meeting\n3. Subsidiarity - decisions at the lowest competent level\n4. Coherence before action\n5. Integration of being and doing\n\nThis feels right. The Green-stage consensus was holding us back. Teal allows both structure and flow.',
    timestamp: Date.now() - 86400000 * 8,
  },
  {
    id: 'note-4',
    title: 'Node Ecosystem Vision',
    content:
      'The 6 nodes form an interconnected ecosystem:\n\nMap Node - coordination nervous system\nBioregions - place-based regeneration\nCapital - fuel for the engine\nMegaphone - cultural amplification\nCapitalism 2.0 - new economic models\nThesis of Change - intellectual backbone\n\nEach node needs: a lead, quarterly OKRs, monthly updates, and bi-weekly sync calls.\n\nThe Map Node is the connective tissue. Fairman is right that it needs to be the first to fully operationalize.',
    timestamp: Date.now() - 86400000 * 12,
  },
];

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeFull(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(defaultNotes[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  function addNote() {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      timestamp: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setSelectedNoteId(remaining[0]?.id ?? null);
    }
  }

  function updateNoteTitle(id: string, title: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title, timestamp: Date.now() } : n))
    );
  }

  function updateNoteContent(id: string, content: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content, timestamp: Date.now() } : n))
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Notes Sidebar ── */}
      <div
        style={{
          width: 300,
          minWidth: 300,
          backgroundColor: '#0f1219',
          borderRight: '1px solid #1e2638',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1e2638', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StickyNote size={18} style={{ color: '#d4a574' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Notes</h2>
            </div>
            <button
              onClick={addNote}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: 'rgba(212, 165, 116, 0.12)',
                color: '#d4a574',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.12)';
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            <Search size={14} style={{ color: '#6b6358', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f0ebe4',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            />
          </div>
          <p style={{ fontSize: 11, color: '#6b6358', margin: '8px 0 0' }}>
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Notes List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {filteredNotes.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6b6358', fontSize: 12 }}>
              {searchQuery ? 'No matching notes' : 'No notes yet'}
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = selectedNoteId === note.id;
              const preview = note.content.split('\n').find((l) => l.trim()) || 'Empty note';

              return (
                <button
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    border: 'none',
                    borderLeft: isActive ? '3px solid #d4a574' : '3px solid transparent',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(212, 165, 116, 0.08)' : 'transparent',
                    transition: 'background 0.12s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#1a1f2e';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#e8c9a0' : '#f0ebe4', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b6358', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                    {preview.slice(0, 80)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4a443e' }}>
                    <Clock size={10} />
                    {formatDate(note.timestamp)}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Editor Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div
              style={{
                padding: '14px 24px',
                borderBottom: '1px solid #1e2638',
                backgroundColor: '#0d1018',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <FileText size={18} style={{ color: '#d4a574', flexShrink: 0 }} />
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => updateNoteTitle(selectedNote.id, e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#f0ebe4',
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    padding: 0,
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: '#4a443e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} />
                  {formatTimeFull(selectedNote.timestamp)}
                </span>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    color: '#6b6358',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(201, 84, 74, 0.12)';
                    e.currentTarget.style.color = '#c9544a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b6358';
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <textarea
                value={selectedNote.content}
                onChange={(e) => updateNoteContent(selectedNote.id, e.target.value)}
                placeholder="Start writing..."
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '20px 24px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#c8bfb4',
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontFamily: 'inherit',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </>
        ) : (
          /* Empty state */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b6358',
            }}
          >
            <Edit3 size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 14, margin: 0 }}>No note selected</p>
            <p style={{ fontSize: 12, margin: '4px 0 0', opacity: 0.6 }}>
              Select a note or create a new one
            </p>
            <button
              onClick={addNote}
              style={{
                marginTop: 16,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: 'rgba(212, 165, 116, 0.12)',
                color: '#d4a574',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.12)';
              }}
            >
              <Plus size={15} /> New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
