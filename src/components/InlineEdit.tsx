'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Plus, Trash2, RotateCcw } from 'lucide-react';

interface InlineTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  placeholder?: string;
}

export function InlineText({
  value,
  onSave,
  className = '',
  inputClassName = '',
  multiline = false,
  placeholder = 'Click to edit...',
}: InlineTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const save = () => {
    if (draft.trim() !== value) {
      onSave(draft.trim());
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') cancel();
    if (e.key === 'Enter' && !multiline) save();
    if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) save();
  };

  if (editing) {
    return (
      <div className="flex items-start gap-1.5">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className={`flex-1 bg-white/5 border border-amber-500/50 rounded-lg px-3 py-1.5 text-text-primary text-sm outline-none focus:border-amber-400 resize-y ${inputClassName}`}
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-white/5 border border-amber-500/50 rounded-lg px-3 py-1.5 text-text-primary text-sm outline-none focus:border-amber-400 ${inputClassName}`}
            placeholder={placeholder}
          />
        )}
        <button onClick={save} className="p-1 rounded hover:bg-emerald-600/30 text-emerald-400 transition-colors" title="Save">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={cancel} className="p-1 rounded hover:bg-white/10 text-text-muted transition-colors" title="Cancel">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <span
      className={`group/iedit inline-flex items-center gap-1.5 cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-colors ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      <span className={value ? '' : 'text-text-muted italic'}>{value || placeholder}</span>
      <Pencil className="w-3 h-3 text-text-muted/50 opacity-0 group-hover/iedit:opacity-100 transition-opacity flex-shrink-0" />
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const save = () => {
    const num = parseFloat(draft);
    if (!isNaN(num) && num !== value) {
      onSave(num);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-text-muted text-sm">{prefix}</span>}
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); } }}
          min={min}
          max={max}
          step={step}
          className="w-20 bg-white/5 border border-amber-500/50 rounded-lg px-2 py-1 text-text-primary text-sm outline-none focus:border-amber-400"
        />
        {suffix && <span className="text-text-muted text-sm">{suffix}</span>}
        <button onClick={save} className="p-1 rounded hover:bg-emerald-600/30 text-emerald-400 transition-colors">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { setDraft(String(value)); setEditing(false); }} className="p-1 rounded hover:bg-white/10 text-text-muted transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <span
      className={`group/iedit inline-flex items-center gap-1 cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-colors ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      <span>{prefix}{value}{suffix}</span>
      <Pencil className="w-3 h-3 text-text-muted/50 opacity-0 group-hover/iedit:opacity-100 transition-opacity flex-shrink-0" />
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
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:ring-1 hover:ring-amber-500/50 transition-all ${current?.color || 'bg-white/10 text-text-muted'}`}
      >
        {current?.label || value}
        <Pencil className="w-2.5 h-2.5 opacity-50" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface-2 border border-border rounded-lg shadow-xl py-1 min-w-[120px]">
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const addItem = () => {
    if (draft.trim()) {
      onSave([...items, draft.trim()]);
      setDraft('');
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
    }
    setEditingIdx(null);
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => (
        <div key={idx} className="group/item flex items-center gap-2">
          {icon && <span className="flex-shrink-0 text-text-muted">{icon}</span>}
          {editingIdx === idx ? (
            <div className="flex-1 flex items-center gap-1.5">
              <input
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(idx); if (e.key === 'Escape') setEditingIdx(null); }}
                className="flex-1 bg-white/5 border border-amber-500/50 rounded px-2 py-1 text-sm text-text-primary outline-none"
                autoFocus
              />
              <button onClick={() => saveEdit(idx)} className="p-0.5 text-emerald-400 hover:bg-emerald-600/30 rounded">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => setEditingIdx(null)} className="p-0.5 text-text-muted hover:bg-white/10 rounded">
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
                <Pencil className="w-3 h-3" />
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
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
            placeholder={placeholder}
            className="flex-1 bg-white/5 border border-amber-500/50 rounded px-2 py-1 text-sm text-text-primary outline-none"
          />
          <button onClick={addItem} className="p-0.5 text-emerald-400 hover:bg-emerald-600/30 rounded">
            <Check className="w-3 h-3" />
          </button>
          <button onClick={() => { setAdding(false); setDraft(''); }} className="p-0.5 text-text-muted hover:bg-white/10 rounded">
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
