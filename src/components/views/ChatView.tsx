'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Hash,
  Shield,
  Crown,
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Calendar,
  Heart,
  Coffee,
  Send,
  Paperclip,
  Smile,
  AtSign,
  ChevronDown,
  Pin,
  Users,
  MessageCircle,
  Menu,
  X,
  Clock,
  Search,
  ArrowDown,
  CheckCheck,
  Image,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useFrequencyData } from '@/lib/supabase/DataProvider';
import { useAuth } from '@/lib/supabase/AuthProvider';
import type { ChatChannel } from '@/lib/data';

const iconMap: Record<string, React.ElementType> = {
  Hash,
  Shield,
  Crown,
  Globe,
  TreePine,
  Gem,
  Megaphone,
  Calendar,
  Heart,
  Coffee,
};

const channelGroups: { label: string; ids: string[] }[] = [
  { label: 'General', ids: ['general', 'random'] },
  { label: 'Team', ids: ['core-team', 'board'] },
  { label: 'Nodes', ids: ['node-map', 'node-bioregions', 'node-capital', 'node-megaphone'] },
  { label: 'Other', ids: ['events', 'coherence'] },
];

const avatarColors: Record<string, string> = {
  JH: '#c4925a',
  SH: '#f472b6',
  AF: '#8b5cf6',
  GB: '#22c55e',
  RA: '#f97316',
  AN: '#a855f7',
  DW: '#34d399',
  GH: '#84cc16',
  MX: '#38bdf8',
  FI: '#f9a8d4',
  MF: '#2dd4bf',
  CG: '#fbbf24',
  SS: '#818cf8',
  NP: '#94a3b8',
};

const pinnedMessages: Record<string, { text: string; author: string }> = {
  'core-team': {
    text: 'Reminder: Blue Spirit 6.0 planning deck due by March 15. All node leads please submit updates.',
    author: 'James',
  },
  general: {
    text: 'Welcome to Frequency Unite! This is our shared operating system. Explore the sidebar to navigate.',
    author: 'Sian',
  },
};

const channelMembers: Record<string, number> = {
  'core-team': 6,
  board: 3,
  general: 14,
  random: 14,
  'node-map': 4,
  'node-bioregions': 3,
  'node-capital': 4,
  'node-megaphone': 3,
  events: 8,
  coherence: 6,
};

/* ── Emoji reaction picker data ── */
const quickEmojis = [
  { emoji: '\u{1F44D}', label: 'thumbs up' },
  { emoji: '\u{2764}\u{FE0F}', label: 'heart' },
  { emoji: '\u{1F602}', label: 'joy' },
  { emoji: '\u{1F60D}', label: 'heart eyes' },
  { emoji: '\u{1F525}', label: 'fire' },
  { emoji: '\u{1F389}', label: 'party' },
  { emoji: '\u{1F64F}', label: 'pray' },
  { emoji: '\u{1F680}', label: 'rocket' },
];

/* ── Max characters for input ── */
const MAX_CHARS = 500;

/* ── Last message preview per channel ── */
function getLastMessagePreview(
  channelId: string,
  messages: { channel: string; sender: string; message: string }[]
): string | null {
  const msgs = messages.filter((m) => m.channel === channelId);
  if (msgs.length === 0) return null;
  const last = msgs[msgs.length - 1];
  const name = last.sender.split(' ')[0];
  const text =
    last.message.length > 36 ? last.message.slice(0, 36) + '...' : last.message;
  return `${name}: ${text}`;
}

/** Convert a timestamp string like "9:14 AM" to a relative time description */
function getRelativeTime(timestamp: string): string {
  const match = timestamp.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timestamp;

  const [, hourStr, minStr, meridiem] = match;
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);
  if (meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;

  const now = new Date();
  const msgDate = new Date();
  msgDate.setHours(hours, minutes, 0, 0);

  const diffMs = now.getTime() - msgDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 0) return timestamp;
  if (diffMins < 1) return 'Just now';
  if (diffMins < 2) return '1 min ago';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 12) return `${diffHours} hours ago`;
  return timestamp;
}

/** Parse timestamp to get a Date-like grouping key for "Today", "Yesterday", etc. */
function getDateGroup(timestamp: string, idx: number): string {
  // Since all demo messages are from "today", we simulate grouping
  // by distributing messages across time groups for visual polish
  const match = timestamp.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 'Today';

  const [, hourStr, , meridiem] = match;
  let hours = parseInt(hourStr, 10);
  if (meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;

  // Group by time ranges to simulate date headers
  if (hours < 9) return 'Yesterday';
  if (hours < 12) return 'This Morning';
  return 'Today';
}

/** Highlight search matches in text */
function HighlightedText({ text, searchQuery }: { text: string; searchQuery: string }) {
  if (!searchQuery.trim()) {
    return <>{text}</>;
  }

  const parts: React.ReactNode[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = searchQuery.toLowerCase();
  let lastIndex = 0;

  let idx = lowerText.indexOf(lowerQuery, lastIndex);
  while (idx !== -1) {
    if (idx > lastIndex) {
      parts.push(text.slice(lastIndex, idx));
    }
    parts.push(
      <mark
        key={idx}
        style={{
          backgroundColor: 'rgba(212, 165, 116, 0.35)',
          color: '#f0ebe4',
          borderRadius: 3,
          padding: '1px 2px',
          border: '1px solid rgba(212, 165, 116, 0.4)',
        }}
      >
        {text.slice(idx, idx + searchQuery.length)}
      </mark>
    );
    lastIndex = idx + searchQuery.length;
    idx = lowerText.indexOf(lowerQuery, lastIndex);
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

/** Timestamp component with relative time and hover-to-reveal exact time */
function TimestampDisplay({ timestamp, align }: { timestamp: string; align?: 'left' | 'right' }) {
  const [hovered, setHovered] = useState(false);
  const relative = getRelativeTime(timestamp);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        fontSize: 10,
        color: '#6b6358',
        fontVariantNumeric: 'tabular-nums',
        cursor: 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Clock size={9} style={{ opacity: 0.5 }} />
      {relative}
      {hovered && relative !== timestamp && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            [align === 'right' ? 'right' : 'left']: 0,
            marginBottom: 6,
            padding: '4px 10px',
            borderRadius: 6,
            backgroundColor: 'rgba(11, 13, 20, 0.96)',
            border: '1px solid rgba(212, 165, 116, 0.2)',
            color: '#d4a574',
            fontSize: 10,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'none',
            animation: 'msgFadeIn 0.15s ease forwards',
            zIndex: 10,
          }}
        >
          {timestamp}
        </span>
      )}
    </span>
  );
}

/** Read receipt double-check marks */
function ReadReceipt({ isRead, isOwn }: { isRead: boolean; isOwn: boolean }) {
  if (!isOwn) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        marginLeft: 4,
        opacity: isRead ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
      }}
      title={isRead ? 'Read' : 'Sent'}
    >
      <CheckCheck
        size={13}
        style={{
          color: isRead ? '#3b82f6' : '#6b6358',
          transition: 'color 0.3s ease',
          filter: isRead ? 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.3))' : 'none',
        }}
      />
    </span>
  );
}

/** Typing indicator with bouncing dots */
function TypingIndicator({ sender }: { sender: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 0',
        animation: 'msgSlideUp 0.3s ease forwards',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: '#c8bfb4',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <Sparkles size={12} style={{ color: '#8b5cf6' }} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: '6px 16px 16px 16px',
          background: 'linear-gradient(135deg, rgba(19, 23, 32, 0.85) 0%, rgba(22, 27, 38, 0.75) 100%)',
          border: '1px solid rgba(30, 38, 56, 0.7)',
        }}
      >
        <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600, marginRight: 4 }}>{sender}</span>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

/** Emoji reaction picker overlay */
function EmojiPicker({
  show,
  onClose,
  onSelect,
  position,
}: {
  show: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  position: 'left' | 'right';
}) {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        [position === 'right' ? 'right' : 'left']: 0,
        marginBottom: 6,
        padding: '6px 8px',
        borderRadius: 12,
        backgroundColor: 'rgba(11, 13, 20, 0.98)',
        border: '1px solid rgba(30, 38, 56, 0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        gap: 2,
        zIndex: 20,
        animation: 'emojiPickerIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      onMouseLeave={onClose}
    >
      {quickEmojis.map((e) => (
        <button
          key={e.label}
          onClick={() => {
            onSelect(e.emoji);
            onClose();
          }}
          title={e.label}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
            padding: '4px 6px',
            borderRadius: 8,
            transition: 'transform 0.15s ease, background-color 0.15s ease',
            lineHeight: 1,
          }}
          onMouseEnter={(ev) => {
            ev.currentTarget.style.transform = 'scale(1.25)';
            ev.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.12)';
          }}
          onMouseLeave={(ev) => {
            ev.currentTarget.style.transform = 'scale(1)';
            ev.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {e.emoji}
        </button>
      ))}
    </div>
  );
}

/** Date group header for timestamp grouping */
function DateGroupHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        margin: '20px 0 12px',
        animation: 'msgFadeIn 0.3s ease forwards',
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(30, 38, 56, 0.6) 50%, transparent 100%)',
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#6b6358',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '4px 14px',
          borderRadius: 20,
          backgroundColor: 'rgba(19, 23, 32, 0.8)',
          border: '1px solid rgba(30, 38, 56, 0.5)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(30, 38, 56, 0.6) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

export function ChatView() {
  const { chatChannels, chatMessages, sendChatMessage, teamMembers } = useFrequencyData();
  const { teamMemberId } = useAuth();

  const currentUser = useMemo(() => {
    const member = teamMembers.find(m => m.id === teamMemberId);
    return {
      name: member?.name || 'Anonymous',
      initials: member ? member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AN',
    };
  }, [teamMembers, teamMemberId]);

  const [selectedChannel, setSelectedChannel] = useState('core-team');
  const [prevChannel, setPrevChannel] = useState('core-team');
  const [messageInput, setMessageInput] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Second-pass state
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentChannel = chatChannels.find((c) => c.id === selectedChannel);
  const channelMsgs = useMemo(
    () => chatMessages.filter((m) => m.channel === selectedChannel),
    [chatMessages, selectedChannel]
  );

  // Search match count
  useEffect(() => {
    if (searchQuery.trim()) {
      const count = channelMsgs.filter(
        (m) => m.message.toLowerCase().includes(searchQuery.toLowerCase())
      ).length;
      setSearchMatchCount(count);
    } else {
      setSearchMatchCount(0);
    }
  }, [searchQuery, channelMsgs]);

  const ChannelIcon = currentChannel ? iconMap[currentChannel.icon] || Hash : Hash;

  /* ── Smooth channel switch with fade ── */
  const switchChannel = useCallback(
    (id: string) => {
      if (id === selectedChannel) return;
      setTransitioning(true);
      setPrevChannel(selectedChannel);
      setSidebarOpen(false);
      setSearchQuery('');
      setSearchOpen(false);
      setTimeout(() => {
        setSelectedChannel(id);
        setTransitioning(false);
      }, 180);
    },
    [selectedChannel]
  );

  useEffect(() => {
    if (!transitioning) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChannel, transitioning]);

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  /* ── Scroll detection for scroll-to-bottom button ── */
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /* ── Simulated typing indicator ── */
  const simulateTyping = useCallback(() => {
    const names = ['Sian', 'Alex', 'Grace', 'David'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    setTypingUser(randomName);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setTypingUser('');
    }, 2800);
  }, []);

  /* ── Send message handler ── */
  const handleSendMessage = useCallback(async () => {
    const text = messageInput.trim();
    if (!text || text.length > MAX_CHARS) return;
    setMessageInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
    await sendChatMessage({
      channel: selectedChannel,
      sender: currentUser.name,
      senderAvatar: currentUser.initials,
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    // Simulate someone typing back after a delay
    setTimeout(() => simulateTyping(), 1500);
  }, [messageInput, selectedChannel, sendChatMessage, currentUser, simulateTyping]);

  /* ── Auto-scroll when messages change ── */
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // Only auto-scroll if user is near the bottom
    if (distFromBottom < 200) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length]);

  /* ── Search keyboard shortcut ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  const charCount = messageInput.length;
  const charWarning = charCount > MAX_CHARS * 0.9;
  const charOver = charCount > MAX_CHARS;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
        .typing-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #d4a574;
          animation: typingDot 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes msgSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes channelFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateY(12px) translateX(8px); }
          to { opacity: 1; transform: translateY(0) translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateY(12px) translateX(-8px); }
          to { opacity: 1; transform: translateY(0) translateX(0); }
        }
        @keyframes inputGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,165,116,0); }
          50% { box-shadow: 0 0 12px rgba(212,165,116,0.15); }
        }
        @keyframes floatGently {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-5px); opacity: 0.55; }
        }
        @keyframes shimmerSlide {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes sendPop {
          0% { transform: scale(1) rotate(0deg); }
          40% { transform: scale(0.85) rotate(-8deg); }
          70% { transform: scale(1.1) rotate(4deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes memberFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIndicator {
          from { height: 0; opacity: 0; }
          to { height: 100%; opacity: 1; }
        }
        @keyframes emojiPickerIn {
          from { opacity: 0; transform: translateY(4px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scrollBtnIn {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scrollBtnOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(10px) scale(0.9); }
        }
        @keyframes searchSlideDown {
          from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
          to { opacity: 1; max-height: 60px; padding-top: 10px; padding-bottom: 10px; }
        }
        @keyframes emptyIllustrationPulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.05); opacity: 0.25; }
        }
        @keyframes ctaShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .chat-msg-slide-right {
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chat-msg-slide-left {
          animation: slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chat-msg-enter {
          animation: msgFadeIn 0.3s ease forwards;
        }
        .channel-content-enter {
          animation: channelFadeIn 0.2s ease forwards;
        }
        @keyframes unreadPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.3); }
          50% { transform: scale(1.12); box-shadow: 0 0 8px 2px rgba(212, 165, 116, 0.15); }
        }
        .sidebar-channel {
          transition: background-color 0.25s ease, color 0.25s ease !important;
        }
        .sidebar-channel:hover {
          background-color: rgba(26, 31, 46, 0.8) !important;
        }
        .reaction-pill:hover {
          background-color: rgba(212, 165, 116, 0.18) !important;
          border-color: rgba(212, 165, 116, 0.35) !important;
        }
        /* Message bubble hover actions */
        .msg-bubble-wrap { position: relative; }
        .msg-bubble-wrap .msg-hover-actions {
          opacity: 0;
          transform: translateY(2px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
        }
        .msg-bubble-wrap:hover .msg-hover-actions {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .msg-bubble-wrap:hover .msg-hover-timestamp {
          opacity: 1;
        }
        /* Input area glow on focus-within */
        .chat-input-container {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .chat-input-container:focus-within {
          border-color: rgba(212, 165, 116, 0.4) !important;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.08), 0 0 16px rgba(212, 165, 116, 0.1);
          animation: inputGlow 2.5s ease infinite;
        }
        /* Toolbar icon hover */
        .chat-toolbar-btn {
          transition: color 0.2s ease, transform 0.2s ease, background-color 0.2s ease !important;
        }
        .chat-toolbar-btn:hover {
          color: #d4a574 !important;
          transform: scale(1.12);
          background-color: rgba(212, 165, 116, 0.08) !important;
        }
        /* Send button click animation */
        .chat-send-btn:active {
          animation: sendPop 0.4s ease;
        }
        /* Pin icon hover rotate */
        .pin-banner-icon {
          transition: transform 0.3s ease;
        }
        .pin-banner:hover .pin-banner-icon {
          transform: rotate(45deg) scale(1.15);
        }
        /* Pinned banner shimmer */
        .pin-banner {
          position: relative;
          overflow: hidden;
        }
        .pin-banner::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(212, 165, 116, 0.04) 25%,
            rgba(212, 165, 116, 0.08) 50%,
            rgba(212, 165, 116, 0.04) 75%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmerSlide 4s ease-in-out infinite;
          pointer-events: none;
          border-radius: inherit;
        }
        /* Active channel indicator animation */
        .channel-active-indicator {
          position: relative;
          background: linear-gradient(90deg, rgba(212, 165, 116, 0.12) 0%, rgba(212, 165, 116, 0.04) 60%, transparent 100%) !important;
        }
        .channel-active-indicator::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #d4a574, #c4925a);
          border-radius: 0 2px 2px 0;
          animation: slideIndicator 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .channel-active-indicator::after {
          content: '';
          position: absolute;
          left: 3px;
          top: 50%;
          width: 4px;
          height: 60%;
          transform: translateY(-50%);
          background: rgba(212, 165, 116, 0.08);
          filter: blur(6px);
          pointer-events: none;
        }
        /* Channel sidebar hover with glow */
        .sidebar-channel:hover {
          background: linear-gradient(90deg, rgba(26, 31, 46, 0.6) 0%, rgba(26, 31, 46, 0.3) 100%) !important;
        }
        /* Unread dot pulse */
        @keyframes unreadDotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(212, 165, 116, 0); }
        }
        /* Message group connector line */
        .msg-group-connector {
          position: relative;
        }
        .msg-group-connector::before {
          content: '';
          position: absolute;
          left: 18px;
          top: -4px;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, rgba(212, 165, 116, 0.1) 0%, rgba(30, 38, 56, 0.3) 100%);
          border-radius: 1px;
        }
        /* Send button glow on hover */
        .chat-send-btn-active {
          position: relative;
        }
        .chat-send-btn-active::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 11px;
          background: linear-gradient(135deg, rgba(196, 146, 90, 0.3), rgba(212, 165, 116, 0.1));
          filter: blur(6px);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        .chat-send-btn-active:hover::after {
          opacity: 1;
        }
        /* Channel header bottom gradient border */
        .channel-header-enhanced {
          position: relative;
        }
        .channel-header-enhanced::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 24px;
          right: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212, 165, 116, 0.3) 30%, rgba(212, 165, 116, 0.3) 70%, transparent 100%);
        }
        /* Timestamp hover reveal for grouped messages */
        .msg-grouped-timestamp {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .msg-bubble-wrap:hover .msg-grouped-timestamp {
          opacity: 1;
          transform: translateX(0);
        }
        /* Avatar ring glow */
        @keyframes avatarRingPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.15); }
          50% { box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.05); }
        }
        /* Mobile sidebar toggle button */
        .chat-sidebar-toggle { display: none; }
        /* Mobile sidebar overlay */
        .chat-sidebar-overlay { display: none; }
        @media (max-width: 767px) {
          .chat-sidebar-toggle { display: flex; }
          .chat-channel-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .chat-channel-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .chat-sidebar-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 49;
            background-color: rgba(0, 0, 0, 0.5);
          }
        }
        /* Scroll to bottom button */
        .scroll-to-bottom-btn {
          position: absolute;
          bottom: 90px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 15;
          animation: scrollBtnIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scroll-to-bottom-btn:hover {
          transform: translateX(-50%) scale(1.08);
        }
        .scroll-to-bottom-btn:hover .scroll-btn-inner {
          box-shadow: 0 6px 24px rgba(212, 165, 116, 0.35) !important;
          border-color: rgba(212, 165, 116, 0.4) !important;
        }
        /* Character count styling */
        .char-count-warn {
          color: #f59e0b !important;
        }
        .char-count-over {
          color: #ef4444 !important;
        }
        /* Search bar animations */
        .search-bar-enter {
          animation: searchSlideDown 0.25s ease forwards;
          overflow: hidden;
        }
      `}</style>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="chat-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Channel Sidebar ── */}
      <div
        className={`chat-channel-sidebar${sidebarOpen ? ' sidebar-open' : ''} card-premium`}
        style={{
          width: 272,
          minWidth: 272,
          backgroundColor: '#0e1118',
          borderRight: '1px solid rgba(30, 38, 56, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Subtle gradient at top of sidebar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.04) 0%, rgba(139, 92, 246, 0.01) 50%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        {/* Subtle right edge glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 1,
            background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.15) 0%, rgba(30, 38, 56, 0.3) 50%, rgba(212, 165, 116, 0.08) 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        {/* Sidebar Header */}
        <div
          style={{
            padding: '20px 18px 16px',
            borderBottom: '1px solid rgba(30, 38, 56, 0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.02) 0%, transparent 100%)',
          }}
        >
          <div>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#f0ebe4',
              margin: 0,
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4a574, #c4925a)',
              boxShadow: '0 0 6px rgba(212, 165, 116, 0.3)',
            }} />
            Channels
          </h2>
          <p style={{ fontSize: 11, color: '#6b6358', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            {chatChannels.length} channels
            <span style={{ display: 'inline-block', width: 3, height: 3, borderRadius: '50%', backgroundColor: '#2a3040' }} />
            {(() => {
              const totalUnread = chatChannels.reduce((s, c) => s + c.unread, 0);
              return totalUnread > 0 ? (
                <span style={{ color: '#d4a574', fontWeight: 600 }}>{totalUnread} unread</span>
              ) : (
                <span>All read</span>
              );
            })()}
          </p>
          </div>
          <button
            className="chat-sidebar-toggle"
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: '#6b6358',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Channel Groups */}
        <div className="scrollbar-autohide" style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {chatChannels.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 18px',
                color: '#6b6358',
                textAlign: 'center',
              }}
            >
              <Hash
                size={24}
                style={{ opacity: 0.4, color: '#d4a574', marginBottom: 10 }}
              />
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#a09888',
                  margin: 0,
                }}
              >
                No channels yet
              </p>
              <p
                style={{
                  fontSize: 11,
                  margin: '6px 0 0',
                  opacity: 0.6,
                  lineHeight: 1.5,
                }}
              >
                Channels will appear here once they are created.
              </p>
            </div>
          ) : (
          channelGroups.map((group) => {
            const groupChannels = group.ids
              .map((id) => chatChannels.find((c) => c.id === id))
              .filter(Boolean) as ChatChannel[];

            if (groupChannels.length === 0) return null;
            const isCollapsed = collapsedGroups[group.label];
            const groupUnread = groupChannels.reduce((s, c) => s + c.unread, 0);

            return (
              <div key={group.label} style={{ marginBottom: 4 }}>
                {/* Group label -- clickable to collapse */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    width: '100%',
                    padding: '6px 18px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#6b6358',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  <ChevronDown
                    size={10}
                    style={{
                      transition: 'transform 0.2s',
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    }}
                  />
                  {group.label}
                  {groupUnread > 0 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#d4a574',
                        backgroundColor: 'rgba(212, 165, 116, 0.15)',
                        borderRadius: 8,
                        padding: '1px 6px',
                      }}
                    >
                      {groupUnread}
                    </span>
                  )}
                </button>

                {/* Channels */}
                <div
                  style={{
                    maxHeight: isCollapsed ? 0 : 500,
                    overflow: 'hidden',
                    transition: 'max-height 0.25s ease',
                  }}
                >
                  {groupChannels.map((channel) => {
                    const isActive = selectedChannel === channel.id;
                    const Icon = iconMap[channel.icon] || Hash;
                    const preview = getLastMessagePreview(channel.id, chatMessages);
                    const hasUnread = channel.unread > 0;

                    return (
                      <button
                        key={channel.id}
                        onClick={() => switchChannel(channel.id)}
                        className={`${isActive ? 'channel-active-indicator' : 'sidebar-channel'} card-interactive`}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          width: '100%',
                          padding: '9px 18px',
                          border: 'none',
                          borderRadius: isActive ? 0 : '0 8px 8px 0',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: isActive ? 600 : hasUnread ? 700 : 400,
                          color: isActive
                            ? '#e8c9a0'
                            : hasUnread
                            ? '#f0ebe4'
                            : '#a09888',
                          backgroundColor: isActive
                            ? 'rgba(212, 165, 116, 0.1)'
                            : 'transparent',
                          borderLeft: isActive
                            ? 'none'
                            : '3px solid transparent',
                          paddingLeft: isActive ? 21 : 18,
                          transition: 'all 0.25s ease',
                          fontFamily: 'inherit',
                          textAlign: 'left',
                          minHeight: 46,
                          position: 'relative',
                          marginRight: isActive ? 0 : 8,
                        }}
                      >
                        {/* Unread left accent dot */}
                        {hasUnread && !isActive && (
                          <div
                            style={{
                              position: 'absolute',
                              left: 6,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background: '#d4a574',
                              boxShadow: '0 0 6px rgba(212, 165, 116, 0.4)',
                              animation: 'unreadDotPulse 2s ease infinite',
                            }}
                          />
                        )}
                        {/* Icon with subtle background for active */}
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            backgroundColor: isActive
                              ? 'rgba(212, 165, 116, 0.15)'
                              : hasUnread
                              ? 'rgba(240, 235, 228, 0.06)'
                              : 'transparent',
                            transition: 'background-color 0.25s ease',
                          }}
                        >
                          <Icon
                            size={14}
                            style={{
                              opacity: isActive ? 1 : hasUnread ? 0.8 : 0.5,
                              color: isActive ? '#d4a574' : undefined,
                              transition: 'opacity 0.25s ease',
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                                letterSpacing: hasUnread && !isActive ? '-0.01em' : undefined,
                              }}
                            >
                              {channel.name}
                            </span>
                            {hasUnread && (
                              <span
                                style={{
                                  background: 'linear-gradient(135deg, #d4a574, #c4925a)',
                                  color: '#0b0d14',
                                  fontSize: 10,
                                  fontWeight: 700,
                                  borderRadius: 10,
                                  padding: '2px 7px',
                                  minWidth: 18,
                                  textAlign: 'center',
                                  flexShrink: 0,
                                  boxShadow: channel.unread >= 5
                                    ? '0 0 8px rgba(212, 165, 116, 0.3)'
                                    : '0 1px 3px rgba(0, 0, 0, 0.3)',
                                  animation:
                                    channel.unread >= 5
                                      ? 'unreadPulse 2s ease infinite'
                                      : undefined,
                                }}
                              >
                                {channel.unread}
                              </span>
                            )}
                            {/* Unread dot for channels with 1-2 unread (subtle indicator) */}
                            {!hasUnread && isActive && (
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #d4a574, #c4925a)',
                                  flexShrink: 0,
                                  opacity: 0.6,
                                }}
                              />
                            )}
                          </div>
                          {/* Last message preview */}
                          {preview && (
                            <p
                              style={{
                                fontSize: 11,
                                color: isActive ? 'rgba(212, 165, 116, 0.5)' : hasUnread ? '#a09888' : '#6b6358',
                                margin: '3px 0 0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.3,
                                fontWeight: hasUnread ? 500 : 400,
                                fontStyle: hasUnread ? 'normal' : 'normal',
                              }}
                            >
                              {preview}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* ── Message Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Channel Header */}
        <div
          className="channel-header-enhanced noise-overlay dot-pattern card-premium"
          style={{
            padding: '16px 24px',
            borderBottom: 'none',
            background: 'linear-gradient(135deg, rgba(13, 16, 24, 0.98) 0%, rgba(19, 23, 32, 0.95) 50%, rgba(20, 24, 32, 0.92) 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexShrink: 0,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Mobile sidebar toggle */}
          <button
            className="chat-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: '#a09888',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Menu size={20} />
          </button>
          {/* Channel icon with gradient ring */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
              border: '1px solid rgba(212, 165, 116, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'floatGently 3s ease-in-out infinite',
              boxShadow: '0 2px 12px rgba(212, 165, 116, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
            }}
          >
            <ChannelIcon size={18} style={{ color: '#d4a574' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3
                className="text-glow"
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#f0ebe4',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {currentChannel?.name ?? 'Channel'}
              </h3>
              {/* Member count pill */}
              {currentChannel && channelMembers[currentChannel.id] && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#a09888',
                    backgroundColor: 'rgba(160, 152, 136, 0.08)',
                    border: '1px solid rgba(160, 152, 136, 0.1)',
                    borderRadius: 20,
                    padding: '3px 10px',
                    animation: 'memberFadeIn 0.5s ease forwards',
                  }}
                >
                  <Users size={11} style={{ opacity: 0.6 }} />
                  {channelMembers[currentChannel.id]}
                </span>
              )}
            </div>
            {currentChannel?.description && (
              <p style={{ fontSize: 12, color: '#6b6358', margin: '4px 0 0', lineHeight: 1.4 }}>
                {currentChannel.description}
              </p>
            )}
          </div>
          {/* Search button */}
          <button
            onClick={() => {
              setSearchOpen(prev => !prev);
              if (!searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            style={{
              background: searchOpen ? 'rgba(212, 165, 116, 0.1)' : 'none',
              border: searchOpen ? '1px solid rgba(212, 165, 116, 0.2)' : '1px solid transparent',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 10,
              color: searchOpen ? '#d4a574' : '#6b6358',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Search messages (Cmd+F)"
          >
            <Search size={16} />
          </button>
          {/* Online indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(107, 143, 113, 0.08)',
              border: '1px solid rgba(107, 143, 113, 0.15)',
            }}
          >
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#6b8f71',
              boxShadow: '0 0 6px rgba(107, 143, 113, 0.4)',
            }} />
            <span style={{ fontSize: 11, color: '#6b8f71', fontWeight: 500 }}>Live</span>
          </div>
        </div>

        {/* Search Bar (collapsible) */}
        {searchOpen && (
          <div
            className="search-bar-enter"
            style={{
              padding: '10px 24px',
              background: 'rgba(14, 17, 24, 0.95)',
              borderBottom: '1px solid rgba(30, 38, 56, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <Search size={14} style={{ color: '#6b6358', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              style={{
                flex: 1,
                background: 'rgba(19, 23, 32, 0.6)',
                border: '1px solid rgba(30, 38, 56, 0.6)',
                borderRadius: 8,
                padding: '6px 12px',
                color: '#f0ebe4',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(30, 38, 56, 0.6)';
              }}
            />
            {searchQuery && (
              <span style={{ fontSize: 11, color: searchMatchCount > 0 ? '#d4a574' : '#6b6358', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {searchMatchCount} {searchMatchCount === 1 ? 'match' : 'matches'}
              </span>
            )}
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: '#6b6358',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 6,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#d4a574'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6b6358'; }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className={`${transitioning ? '' : 'channel-content-enter'} scrollbar-autohide`}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
            opacity: transitioning ? 0 : 1,
            transition: 'opacity 0.15s ease',
            position: 'relative',
          }}
        >
          {/* Pinned Message Banner */}
          {pinnedMessages[selectedChannel] && (
            <div
              className="pin-banner"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                marginBottom: 16,
                backgroundColor: 'rgba(212, 165, 116, 0.06)',
                borderLeft: '3px solid #d4a574',
                borderRadius: '0 8px 8px 0',
                cursor: 'default',
                transition: 'background-color 0.2s ease',
              }}
            >
              <Pin
                size={14}
                className="pin-banner-icon"
                style={{
                  color: '#d4a574',
                  flexShrink: 0,
                  marginTop: 2,
                  transform: 'rotate(45deg)',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 12,
                    color: '#c8bfb4',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {pinnedMessages[selectedChannel].text}
                </p>
                <span
                  style={{
                    fontSize: 10,
                    color: '#6b6358',
                    marginTop: 2,
                    display: 'block',
                  }}
                >
                  Pinned by {pinnedMessages[selectedChannel].author}
                </span>
              </div>
            </div>
          )}

          {channelMsgs.length === 0 ? (
            /* ── Enhanced Empty State with Illustration ── */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#6b6358',
                position: 'relative',
              }}
            >
              {/* Background illustration - concentric rings */}
              <div style={{ position: 'relative', marginBottom: 24 }}>
                {[100, 72, 48].map((size, i) => (
                  <div
                    key={i}
                    style={{
                      position: i === 0 ? 'relative' : 'absolute',
                      top: i === 0 ? 0 : '50%',
                      left: i === 0 ? 0 : '50%',
                      transform: i === 0 ? 'none' : 'translate(-50%, -50%)',
                      width: size,
                      height: size,
                      borderRadius: '50%',
                      border: `1px solid rgba(212, 165, 116, ${0.06 + i * 0.04})`,
                      background: i === 2
                        ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)'
                        : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: `emptyIllustrationPulse ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
                    }}
                  >
                    {i === 2 && (
                      <MessageCircle size={22} style={{ color: '#d4a574', opacity: 0.6 }} />
                    )}
                  </div>
                ))}
                {/* Floating accent dots around the illustration */}
                {[
                  { x: -14, y: 10, color: '#d4a574', delay: 0 },
                  { x: 108, y: 20, color: '#8b5cf6', delay: 0.4 },
                  { x: 90, y: 88, color: '#6b8f71', delay: 0.8 },
                  { x: -8, y: 78, color: '#d4a574', delay: 1.2 },
                ].map((dot, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: dot.x,
                      top: dot.y,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: dot.color,
                      opacity: 0.3,
                      animation: `floatDot 3s ease-in-out ${dot.delay}s infinite`,
                    }}
                  />
                ))}
              </div>

              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#f0ebe4',
                  margin: 0,
                }}
              >
                Welcome to #{currentChannel?.name}
              </p>
              <p
                style={{
                  fontSize: 13,
                  margin: '8px 0 0',
                  opacity: 0.7,
                  lineHeight: 1.5,
                  textAlign: 'center',
                }}
              >
                This is the very beginning of the{' '}
                <strong style={{ color: '#d4a574', fontWeight: 600 }}>
                  #{currentChannel?.name}
                </strong>{' '}
                channel.
              </p>
              <p
                style={{
                  fontSize: 12,
                  margin: '14px 0 0',
                  opacity: 0.45,
                  maxWidth: 340,
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                Start the conversation by sharing an update, asking a question, or dropping a link
                the team should see.
              </p>

              {/* CTA Button */}
              <button
                onClick={() => textareaRef.current?.focus()}
                style={{
                  marginTop: 24,
                  padding: '10px 24px',
                  borderRadius: 12,
                  border: '1px solid rgba(212, 165, 116, 0.25)',
                  background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  color: '#d4a574',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 165, 116, 0.18) 0%, rgba(139, 92, 246, 0.08) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.4)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 165, 116, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.25)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Zap size={14} />
                Write the first message
              </button>

              {/* Decorative dots */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 24,
                }}
              >
                {['#d4a574', '#8b5cf6', '#6b8f71'].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: c,
                      opacity: 0.3,
                      animation: `floatDot 2.5s ease-in-out ${i * 0.3}s infinite`,
                      boxShadow: `0 0 8px ${c}33`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* ── Message Bubbles with Date Grouping ── */
            (() => {
              let lastDateGroup = '';
              return channelMsgs.map((msg, idx) => {
                const prevMsg = idx > 0 ? channelMsgs[idx - 1] : null;
                const nextMsg = idx < channelMsgs.length - 1 ? channelMsgs[idx + 1] : null;
                const isSameSender = prevMsg?.sender === msg.sender;
                const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender;
                const isFirstInGroup = !isSameSender;
                const isCurrentUser = msg.sender === currentUser.name;
                const avatarColor = avatarColors[msg.senderAvatar] || '#6b6358';
                const isLastMessage = idx === channelMsgs.length - 1;

                // Date group header
                const dateGroup = getDateGroup(msg.timestamp, idx);
                const showDateHeader = dateGroup !== lastDateGroup;
                lastDateGroup = dateGroup;

                // Search filter: dim non-matching messages
                const matchesSearch = searchQuery.trim()
                  ? msg.message.toLowerCase().includes(searchQuery.toLowerCase())
                  : true;

                // Determine bubble corner radii based on grouping position
                const getBubbleRadius = () => {
                  if (isCurrentUser) {
                    if (isFirstInGroup && isLastInGroup) return '16px 6px 16px 16px';
                    if (isFirstInGroup) return '16px 6px 6px 16px';
                    if (isLastInGroup) return '16px 6px 16px 16px';
                    return '16px 6px 6px 16px';
                  }
                  if (isFirstInGroup && isLastInGroup) return '6px 16px 16px 16px';
                  if (isFirstInGroup) return '6px 16px 16px 6px';
                  if (isLastInGroup) return '6px 16px 16px 16px';
                  return '6px 16px 16px 6px';
                };

                return (
                  <React.Fragment key={msg.id}>
                    {/* Date Group Header */}
                    {showDateHeader && <DateGroupHeader label={dateGroup} />}

                    <div
                      className={`${isCurrentUser ? 'chat-msg-slide-right' : 'chat-msg-slide-left'}${isSameSender && !isCurrentUser ? ' msg-group-connector' : ''}`}
                      style={{
                        display: 'flex',
                        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                        gap: 10,
                        marginTop: isSameSender ? 3 : 20,
                        animationDelay: `${idx * 40}ms`,
                        maxWidth: '82%',
                        marginLeft: isCurrentUser ? 'auto' : 0,
                        marginRight: isCurrentUser ? 0 : 'auto',
                        opacity: searchQuery.trim() && !matchesSearch ? 0.3 : 1,
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ width: 36, flexShrink: 0 }}>
                        {!isSameSender ? (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}cc)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#0b0d14',
                              letterSpacing: '0.02em',
                              boxShadow: `0 2px 8px ${avatarColor}33, 0 0 0 2px ${avatarColor}18`,
                              animation: isCurrentUser ? 'avatarRingPulse 3s ease-in-out infinite' : undefined,
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.08)';
                              e.currentTarget.style.boxShadow = `0 4px 12px ${avatarColor}44, 0 0 0 3px ${avatarColor}25`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = `0 2px 8px ${avatarColor}33, 0 0 0 2px ${avatarColor}18`;
                            }}
                          >
                            {msg.senderAvatar}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {!isSameSender && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginBottom: 5,
                              flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: isCurrentUser ? '#d4a574' : '#f0ebe4',
                                letterSpacing: '-0.01em',
                              }}
                            >
                              {isCurrentUser ? 'You' : msg.sender}
                            </span>
                            <TimestampDisplay timestamp={msg.timestamp} align={isCurrentUser ? 'right' : 'left'} />
                            {/* Read receipt for current user's messages */}
                            <ReadReceipt isRead={!isLastMessage} isOwn={isCurrentUser} />
                          </div>
                        )}

                        {/* Bubble */}
                        <div className="msg-bubble-wrap">
                          <div
                            style={{
                              padding: '10px 16px',
                              borderRadius: getBubbleRadius(),
                              background: isCurrentUser
                                ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.14) 0%, rgba(196, 146, 90, 0.08) 60%, rgba(139, 92, 246, 0.03) 100%)'
                                : 'linear-gradient(135deg, rgba(19, 23, 32, 0.85) 0%, rgba(22, 27, 38, 0.75) 100%)',
                              border: isCurrentUser
                                ? '1px solid rgba(212, 165, 116, 0.18)'
                                : '1px solid rgba(30, 38, 56, 0.7)',
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                              boxShadow: isCurrentUser
                                ? '0 2px 8px rgba(212, 165, 116, 0.06), 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.02)'
                                : '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
                              transition: 'background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = isCurrentUser
                                ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.2) 0%, rgba(196, 146, 90, 0.12) 60%, rgba(139, 92, 246, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(25, 30, 42, 0.9) 0%, rgba(28, 34, 48, 0.85) 100%)';
                              e.currentTarget.style.boxShadow = isCurrentUser
                                ? '0 4px 16px rgba(212, 165, 116, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)'
                                : '0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isCurrentUser
                                ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.14) 0%, rgba(196, 146, 90, 0.08) 60%, rgba(139, 92, 246, 0.03) 100%)'
                                : 'linear-gradient(135deg, rgba(19, 23, 32, 0.85) 0%, rgba(22, 27, 38, 0.75) 100%)';
                              e.currentTarget.style.boxShadow = isCurrentUser
                                ? '0 2px 8px rgba(212, 165, 116, 0.06), 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.02)'
                                : '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.02)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <p
                              style={{
                                fontSize: 13.5,
                                color: isCurrentUser ? '#e8d5c0' : '#c8bfb4',
                                lineHeight: 1.6,
                                margin: 0,
                                wordBreak: 'break-word',
                              }}
                            >
                              <HighlightedText text={msg.message} searchQuery={searchQuery} />
                            </p>
                          </div>
                          {/* Hover action icons with emoji picker */}
                          <div
                            className="msg-hover-actions"
                            style={{
                              position: 'absolute',
                              top: -8,
                              ...(isCurrentUser ? { left: 4 } : { right: 4 }),
                              display: 'flex',
                              gap: 1,
                              backgroundColor: 'rgba(15, 18, 25, 0.96)',
                              border: '1px solid rgba(30, 38, 56, 0.8)',
                              borderRadius: 8,
                              padding: '3px 4px',
                              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                              backdropFilter: 'blur(12px)',
                            }}
                          >
                            {/* Emoji reaction button with picker */}
                            <span
                              style={{
                                fontSize: 13,
                                cursor: 'pointer',
                                padding: '2px 6px',
                                borderRadius: 5,
                                transition: 'background 0.15s, transform 0.1s',
                                lineHeight: 1,
                                position: 'relative',
                              }}
                              title="Add reaction"
                              onClick={() => setActiveEmojiPicker(activeEmojiPicker === msg.id ? null : msg.id)}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.15)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                              &#x263A;
                              <EmojiPicker
                                show={activeEmojiPicker === msg.id}
                                onClose={() => setActiveEmojiPicker(null)}
                                onSelect={(emoji) => {
                                  // UI-only: no backend
                                }}
                                position={isCurrentUser ? 'right' : 'left'}
                              />
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                cursor: 'pointer',
                                padding: '2px 6px',
                                borderRadius: 5,
                                transition: 'background 0.15s, transform 0.1s',
                                lineHeight: 1,
                              }}
                              title="Reply"
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.15)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                              &#x21a9;
                            </span>
                          </div>
                          {/* Grouped message timestamp (appears on hover) */}
                          {isSameSender && (
                            <div
                              className="msg-grouped-timestamp"
                              style={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                ...(isCurrentUser ? { left: -52 } : { right: -52 }),
                                fontSize: 9,
                                color: '#6b6358',
                                fontVariantNumeric: 'tabular-nums',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              {msg.timestamp}
                              {/* Inline read receipt for grouped own messages */}
                              {isCurrentUser && (
                                <CheckCheck
                                  size={10}
                                  style={{
                                    color: !isLastMessage ? '#3b82f6' : '#6b6358',
                                    opacity: !isLastMessage ? 0.8 : 0.4,
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Reactions as emoji pills */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              gap: 6,
                              marginTop: 6,
                              flexWrap: 'wrap',
                              justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                            }}
                          >
                            {msg.reactions.map((r, ri) => (
                              <span
                                key={ri}
                                className="reaction-pill"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  padding: '3px 10px',
                                  borderRadius: 14,
                                  backgroundColor: 'rgba(212, 165, 116, 0.08)',
                                  border: '1px solid rgba(212, 165, 116, 0.15)',
                                  fontSize: 13,
                                  cursor: 'pointer',
                                  transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
                                  userSelect: 'none',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <span style={{ lineHeight: 1 }}>{r.emoji}</span>
                                <span
                                  style={{
                                    color: '#a09888',
                                    fontSize: 11,
                                    fontWeight: 600,
                                  }}
                                >
                                  {r.count}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Thread indicator for messages with 2+ reactions */}
                        {msg.reactions && msg.reactions.length >= 2 && (
                          <button
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: 4,
                              padding: '2px 0',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#d4a574',
                              fontFamily: 'inherit',
                              transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.textDecoration = 'none';
                            }}
                          >
                            {msg.reactions.reduce((sum, r) => sum + r.count, 0)} reactions
                          </button>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              });
            })()
          )}

          {/* Typing Indicator */}
          {isTyping && <TypingIndicator sender={typingUser} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <div className="scroll-to-bottom-btn">
            <button
              className="scroll-btn-inner"
              onClick={scrollToBottom}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid rgba(212, 165, 116, 0.25)',
                background: 'linear-gradient(135deg, rgba(14, 17, 24, 0.95) 0%, rgba(19, 23, 32, 0.9) 100%)',
                color: '#d4a574',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 165, 116, 0.08)',
                backdropFilter: 'blur(12px)',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              }}
            >
              <ArrowDown size={13} />
              New messages
            </button>
          </div>
        )}

        {/* Message Input */}
        <div
          style={{
            padding: '14px 24px 18px',
            borderTop: 'none',
            background: 'linear-gradient(180deg, transparent 0%, rgba(13, 16, 24, 0.6) 20%, rgba(13, 16, 24, 0.98) 100%)',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {/* Top gradient border */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 24,
              right: 24,
              height: 1,
              background: 'linear-gradient(90deg, transparent 0%, rgba(30, 38, 56, 0.5) 20%, rgba(212, 165, 116, 0.1) 50%, rgba(30, 38, 56, 0.5) 80%, transparent 100%)',
            }}
          />
          <div
            className="chat-input-container card-premium"
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              backgroundColor: 'rgba(19, 23, 32, 0.6)',
              border: charOver ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(30, 38, 56, 0.6)',
              borderRadius: 16,
              padding: '10px 12px 10px 16px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <button
              className="chat-toolbar-btn"
              title="Attach file"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 8,
                color: '#6b6358',
                display: 'flex',
                alignItems: 'center',
                marginBottom: 1,
                position: 'relative',
              }}
            >
              <Paperclip size={18} />
            </button>
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message #${currentChannel?.name ?? 'channel'}...`}
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f0ebe4',
                fontSize: 14,
                fontFamily: 'inherit',
                padding: '4px 0',
                resize: 'none',
                minHeight: 24,
                maxHeight: 120,
                lineHeight: 1.5,
                overflow: 'hidden',
              }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = '24px';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                // Show overflow scrollbar if at max
                if (t.scrollHeight > 120) {
                  t.style.overflow = 'auto';
                } else {
                  t.style.overflow = 'hidden';
                }
              }}
            />
            {/* Toolbar buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
              <button
                className="chat-toolbar-btn"
                title="Insert image"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  color: '#6b6358',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Image size={17} />
              </button>
              <button
                className="chat-toolbar-btn"
                title="Mention someone"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  color: '#6b6358',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <AtSign size={17} />
              </button>
              <button
                className="chat-toolbar-btn"
                title="Add emoji"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  color: '#6b6358',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Smile size={17} />
              </button>
              {/* Separator */}
              <div style={{ width: 1, height: 20, backgroundColor: 'rgba(30, 38, 56, 0.6)', margin: '0 4px' }} />
              {/* Send button with glow effect */}
              <button
                className={`chat-send-btn${messageInput.trim() && !charOver ? ' chat-send-btn-active' : ''}`}
                onClick={handleSendMessage}
                disabled={charOver}
                style={{
                  background: messageInput.trim() && !charOver
                    ? 'linear-gradient(135deg, #c4925a, #d4a574, #c4925a)'
                    : 'rgba(30, 38, 56, 0.6)',
                  border: messageInput.trim() && !charOver
                    ? '1px solid rgba(212, 165, 116, 0.3)'
                    : '1px solid rgba(30, 38, 56, 0.4)',
                  cursor: messageInput.trim() && !charOver ? 'pointer' : 'default',
                  padding: 8,
                  borderRadius: 10,
                  color: messageInput.trim() && !charOver ? '#0b0d14' : '#6b6358',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: messageInput.trim() && !charOver ? 'scale(1)' : 'scale(0.88)',
                  boxShadow: messageInput.trim() && !charOver
                    ? '0 2px 12px rgba(212, 165, 116, 0.3), 0 0 0 1px rgba(212, 165, 116, 0.1)'
                    : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (messageInput.trim() && !charOver) {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 165, 116, 0.45), 0 0 0 2px rgba(212, 165, 116, 0.15)';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (messageInput.trim() && !charOver) {
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(212, 165, 116, 0.3), 0 0 0 1px rgba(212, 165, 116, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          {/* Enhanced helper text with character count and attachment hint */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 6px 0', opacity: 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 10, color: '#6b6358' }}>
                Press <span style={{ fontWeight: 600, color: '#a09888' }}>Enter</span> to send
              </span>
              <span style={{ fontSize: 10, color: '#6b6358', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Paperclip size={9} style={{ opacity: 0.6 }} />
                Drag files to attach
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Character count */}
              {charCount > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: charWarning ? 600 : 400,
                    color: charOver ? '#ef4444' : charWarning ? '#f59e0b' : '#6b6358',
                    fontVariantNumeric: 'tabular-nums',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              )}
              <span style={{ fontSize: 10, color: '#6b6358' }}>
                <span style={{ fontWeight: 600, color: '#a09888' }}>Shift+Enter</span> new line
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
