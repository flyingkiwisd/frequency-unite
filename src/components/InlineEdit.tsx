'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Check, X, Plus, Trash2, RotateCcw, Undo2 } from 'lucide-react';

/* ─── Shared inline edit styles ─── */
const inlineStyles = `
  .ie-transition-enter {
    animation: ieSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes ieSlideIn {
    0% { opacity: 0; transform: scale(0.96) translateY(2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  .ie-transition-exit {
    animation: ieSlideOut 0.15s ease-out;
  }

  @keyframes ieSlideOut {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.96); }
  }

  .ie-input-gold {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .ie-input-gold:focus {
    border-color: rgba(212, 165, 116, 0.6) !important;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.12), 0 0 16px rgba(212, 165, 116, 0.08) !important;
  }

  .ie-save-flash {
    animation: ieSaveFlash 0.6s ease-out;
  }

  @keyframes ieSaveFlash {
    0% { background-color: rgba(107, 143, 113, 0.2); box-shadow: 0 0 12px rgba(107, 143, 113, 0.15); }
    100% { background-color: transparent; box-shadow: none; }
  }

  .ie-pencil-hover {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .group\\/iedit:hover .ie-pencil-hover {
    transform: rotate(-15deg) scale(1.15);
    color: rgba(212, 165, 116, 0.7) !important;
  }

  .ie-undo-enter {
    animation: ieUndoSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes ieUndoSlide {
    0% { opacity: 0; transform: translateX(-8px) scale(0.9); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
  }

  .ie-undo-exit {
    animation: ieUndoFade 0.2s ease-out forwards;
  }

  @keyframes ieUndoFade {
    0% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(8px); }
  }

  .ie-char-count {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.5px;
    color: rgba(160, 152, 136, 0.4);
    text-align: right;
    margin-top: 2px;
    transition: color 0.2s ease;
  }

  .ie-char-count.near-limit {
    color: rgba(212, 165, 116, 0.7);
  }

  .ie-char-count.at-limit {
    color: rgba(239, 68, 68, 0.7);
  }

  .ie-placeholder {
    font-style: italic;
    color: rgba(160, 152, 136, 0.35);
  }
`;

// Inject styles once
let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = inlineStyles;
  document.head.appendChild(style);
  stylesInjected = true;
}

interface InlineTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function InlineText({
  value,
  onSave,
  className = '',
  inputClassName = '',
  multiline = false,
  placeholder = 'Click to edit...',
  maxLength,
}: InlineTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [justSaved, setJustSaved] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [undoDismissing, setUndoDismissing] = useState(false);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ensureStyles();
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  // Clean up undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed !== value) {
      setPreviousValue(value);
      onSave(trimmed);
      // Green flash confirmation
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 600);
      // Show undo button briefly
      setShowUndo(true);
      setUndoDismissing(false);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setUndoDismissing(true);
        setTimeout(() => {
          setShowUndo(false);
          setUndoDismissing(false);
          setPreviousValue(null);
        }, 200);
      }, 4000);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleUndo = () => {
    if (previousValue !== null) {
      onSave(previousValue);
      setShowUndo(false);
      setUndoDismissing(false);
      setPreviousValue(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') cancel();
    if (e.key === 'Enter' && !multiline) save();
    if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) save();
  };

  if (editing) {
    return (
      <div className="ie-transition-enter">
        <div className="flex items-start gap-1.5">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              onChange={(e) => {
                if (maxLength && e.target.value.length > maxLength) return;
                setDraft(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              rows={3}
              className={`ie-input-gold flex-1 bg-white/5 border border-[rgba(212,165,116,0.35)] rounded-lg px-3 py-1.5 text-text-primary text-sm outline-none resize-y placeholder:italic placeholder:text-[rgba(160,152,136,0.35)] ${inputClassName}`}
              placeholder={placeholder}
              maxLength={maxLength}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={draft}
              onChange={(e) => {
                if (maxLength && e.target.value.length > maxLength) return;
                setDraft(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              className={`ie-input-gold flex-1 bg-white/5 border border-[rgba(212,165,116,0.35)] rounded-lg px-3 py-1.5 text-text-primary text-sm outline-none placeholder:italic placeholder:text-[rgba(160,152,136,0.35)] ${inputClassName}`}
              placeholder={placeholder}
              maxLength={maxLength}
            />
          )}
          <button onClick={save} className="p-1 rounded hover:bg-emerald-600/30 text-emerald-400 transition-colors" title="Save (Enter)">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={cancel} className="p-1 rounded hover:bg-white/10 text-text-muted transition-colors" title="Cancel (Esc)">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Character count for textareas */}
        {multiline && maxLength && (
          <div className={`ie-char-count ${draft.length > maxLength * 0.9 ? (draft.length >= maxLength ? 'at-limit' : 'near-limit') : ''}`}>
            {draft.length}/{maxLength}
          </div>
        )}
        {multiline && !maxLength && (
          <div className="ie-char-count">
            {draft.length} chars
          </div>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`group/iedit inline-flex items-center gap-1.5 cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-all ${justSaved ? 'ie-save-flash' : ''} ${className}`}
        onClick={() => setEditing(true)}
        title="Click to edit"
      >
        <span className={value ? '' : 'ie-placeholder'}>{value || placeholder}</span>
        <Pencil className="ie-pencil-hover w-3 h-3 text-text-muted/50 opacity-0 group-hover/iedit:opacity-100 transition-opacity flex-shrink-0" />
      </span>
      {showUndo && (
        <button
          onClick={handleUndo}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-[#6b8f71] bg-[rgba(107,143,113,0.1)] border border-[rgba(107,143,113,0.2)] hover:bg-[rgba(107,143,113,0.18)] transition-colors cursor-pointer ${undoDismissing ? 'ie-undo-exit' : 'ie-undo-enter'}`}
          title="Undo last change"
        >
          <Undo2 className="w-2.5 h-2.5" />
          Undo
        </button>
      )}
    </span>
  );
}

interface InlineNumberProps {
  value: number;
  onSave: (value: number) => void;
  className?: string;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function InlineNumber({
  value,
  onSave,
  className = '',
  suffix = '',
  prefix = '',
  min,
  max,
  step = 1,
}: InlineNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [justSaved, setJustSaved] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [undoDismissing, setUndoDismissing] = useState(false);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ensureStyles();
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const save = () => {
    const num = parseFloat(draft);
    if (!isNaN(num) && num !== value) {
      setPreviousValue(value);
      onSave(num);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 600);
      setShowUndo(true);
      setUndoDismissing(false);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setUndoDismissing(true);
        setTimeout(() => {
          setShowUndo(false);
          setUndoDismissing(false);
          setPreviousValue(null);
        }, 200);
      }, 4000);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  const handleUndo = () => {
    if (previousValue !== null) {
      onSave(previousValue);
      setShowUndo(false);
      setUndoDismissing(false);
      setPreviousValue(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  };

  if (editing) {
    return (
      <div className="ie-transition-enter flex items-center gap-1.5">
        {prefix && <span className="text-text-muted text-sm">{prefix}</span>}
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          min={min}
          max={max}
          step={step}
          className="ie-input-gold w-20 bg-white/5 border border-[rgba(212,165,116,0.35)] rounded-lg px-2 py-1 text-text-primary text-sm outline-none"
        />
        {suffix && <span className="text-text-muted text-sm">{suffix}</span>}
        <button onClick={save} className="p-1 rounded hover:bg-emerald-600/30 text-emerald-400 transition-colors" title="Save (Enter)">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={cancel} className="p-1 rounded hover:bg-white/10 text-text-muted transition-colors" title="Cancel (Esc)">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`group/iedit inline-flex items-center gap-1 cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-all ${justSaved ? 'ie-save-flash' : ''} ${className}`}
        onClick={() => setEditing(true)}
        title="Click to edit"
      >
        <span>{prefix}{value}{suffix}</span>
        <Pencil className="ie-pencil-hover w-3 h-3 text-text-muted/50 opacity-0 group-hover/iedit:opacity-100 transition-opacity flex-shrink-0" />
      </span>
      {showUndo && (
        <button
          onClick={handleUndo}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-[#6b8f71] bg-[rgba(107,143,113,0.1)] border border-[rgba(107,143,113,0.2)] hover:bg-[rgba(107,143,113,0.18)] transition-colors cursor-pointer ${undoDismissing ? 'ie-undo-exit' : 'ie-undo-enter'}`}
          title="Undo last change"
        >
          <Undo2 className="w-2.5 h-2.5" />
          Undo
        </button>
      )}
    </span>
  );
}

interface InlineSelectProps {
  value: string;
  options: { label: string; value: string; color?: string }[];
  onSave: (value: string) => void;
  className?: string;
}

export function InlineSelect({ value, options, onSave, className = '' }: InlineSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureStyles();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Keyboard nav for select dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:ring-1 hover:ring-[rgba(212,165,116,0.5)] transition-all ${current?.color || 'bg-white/10 text-text-muted'}`}
      >
        {current?.label || value}
        <Pencil className="ie-pencil-hover w-2.5 h-2.5 opacity-50" />
      </button>
      {open && (
        <div className="ie-transition-enter absolute top-full left-0 mt-1 z-50 bg-surface-2 border border-border rounded-lg shadow-xl py-1 min-w-[120px]">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onSave(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors ${opt.value === value ? 'text-amber-400 font-medium' : 'text-text-secondary'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface InlineListProps {
  items: string[];
  onSave: (items: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function InlineList({ items, onSave, placeholder = 'Add item...', icon }: InlineListProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [justSavedIdx, setJustSavedIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ensureStyles();
  }, []);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const addItem = () => {
    if (draft.trim()) {
      onSave([...items, draft.trim()]);
      setDraft('');
      // Flash the newly added item
      setJustSavedIdx(items.length);
      setTimeout(() => setJustSavedIdx(null), 600);
    }
    setAdding(false);
  };

  const removeItem = (idx: number) => {
    onSave(items.filter((_, i) => i !== idx));
  };

  const saveEdit = (idx: number) => {
    if (editDraft.trim()) {
      const updated = [...items];
      updated[idx] = editDraft.trim();
      onSave(updated);
      setJustSavedIdx(idx);
      setTimeout(() => setJustSavedIdx(null), 600);
    }
    setEditingIdx(null);
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => (
        <div key={idx} className={`group/item flex items-center gap-2 rounded px-1 -mx-1 transition-all ${justSavedIdx === idx ? 'ie-save-flash' : ''}`}>
          {icon && <span className="flex-shrink-0 text-text-muted">{icon}</span>}
          {editingIdx === idx ? (
            <div className="ie-transition-enter flex-1 flex items-center gap-1.5">
              <input
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(idx); if (e.key === 'Escape') setEditingIdx(null); }}
                className="ie-input-gold flex-1 bg-white/5 border border-[rgba(212,165,116,0.35)] rounded px-2 py-1 text-sm text-text-primary outline-none placeholder:italic placeholder:text-[rgba(160,152,136,0.35)]"
                autoFocus
              />
              <button onClick={() => saveEdit(idx)} className="p-0.5 text-emerald-400 hover:bg-emerald-600/30 rounded" title="Save (Enter)">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => setEditingIdx(null)} className="p-0.5 text-text-muted hover:bg-white/10 rounded" title="Cancel (Esc)">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <span
                className="flex-1 text-sm text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                onClick={() => { setEditingIdx(idx); setEditDraft(item); }}
              >
                {item}
              </span>
              <button
                onClick={() => { setEditingIdx(idx); setEditDraft(item); }}
                className="p-0.5 text-text-muted/30 opacity-0 group-hover/item:opacity-100 hover:text-text-muted transition-all"
              >
                <Pencil className="ie-pencil-hover w-3 h-3" />
              </button>
              <button
                onClick={() => removeItem(idx)}
                className="p-0.5 text-text-muted/30 opacity-0 group-hover/item:opacity-100 hover:text-rose-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      ))}
      {adding ? (
        <div className="ie-transition-enter flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
            placeholder={placeholder}
            className="ie-input-gold flex-1 bg-white/5 border border-[rgba(212,165,116,0.35)] rounded px-2 py-1 text-sm text-text-primary outline-none placeholder:italic placeholder:text-[rgba(160,152,136,0.35)]"
          />
          <button onClick={addItem} className="p-0.5 text-emerald-400 hover:bg-emerald-600/30 rounded" title="Save (Enter)">
            <Check className="w-3 h-3" />
          </button>
          <button onClick={() => { setAdding(false); setDraft(''); }} className="p-0.5 text-text-muted hover:bg-white/10 rounded" title="Cancel (Esc)">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-amber-400 transition-colors mt-1"
        >
          <Plus className="w-3 h-3" />
          {placeholder}
        </button>
      )}
    </div>
  );
}

interface EditBannerProps {
  hasEdits: boolean;
  onReset: () => void;
  label?: string;
}

export function EditBanner({ hasEdits, onReset, label = 'This view has custom edits saved locally' }: EditBannerProps) {
  if (!hasEdits) return null;
  return (
    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 mb-4">
      <span className="text-xs text-amber-400">{label}</span>
      <button
        onClick={onReset}
        className="flex items-center gap-1 text-xs text-text-muted hover:text-amber-400 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Reset to Original
      </button>
    </div>
  );
}
