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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const currentChannel = chatChannels.find((c) => c.id === selectedChannel);
  const channelMsgs = useMemo(
    () => chatMessages.filter((m) => m.channel === selectedChannel),
    [chatMessages, selectedChannel]
  );

  const ChannelIcon = currentChannel ? iconMap[currentChannel.icon] || Hash : Hash;

  /* ── Smooth channel switch with fade ── */
  const switchChannel = useCallback(
    (id: string) => {
      if (id === selectedChannel) return;
      setTransitioning(true);
      setPrevChannel(selectedChannel);
      setSidebarOpen(false);
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

  /* ── Send message handler ── */
  const handleSendMessage = useCallback(async () => {
    const text = messageInput.trim();
    if (!text) return;
    setMessageInput('');
    await sendChatMessage({
      channel: selectedChannel,
      sender: currentUser.name,
      senderAvatar: currentUser.initials,
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    // Auto-scroll happens via the effect below
  }, [messageInput, selectedChannel, sendChatMessage]);

  /* ── Auto-scroll when messages change ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

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
        @keyframes channelFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .chat-msg-enter {
          animation: msgFadeIn 0.3s ease forwards;
        }
        .channel-content-enter {
          animation: channelFadeIn 0.2s ease forwards;
        }
        @keyframes unreadPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        .sidebar-channel:hover {
          background-color: #1a1f2e !important;
        }
        .reaction-pill:hover {
          background-color: rgba(212, 165, 116, 0.18) !important;
          border-color: rgba(212, 165, 116, 0.35) !important;
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
        className={`chat-channel-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          width: 272,
          minWidth: 272,
          backgroundColor: '#0f1219',
          borderRight: '1px solid #1e2638',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '18px 18px 14px',
            borderBottom: '1px solid #1e2638',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
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
            }}
          >
            Channels
          </h2>
          <p style={{ fontSize: 11, color: '#6b6358', margin: '4px 0 0' }}>
            {chatChannels.length} channels &middot;{' '}
            {chatChannels.reduce((s, c) => s + c.unread, 0)} unread
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
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
                {/* Group label — clickable to collapse */}
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

                    return (
                      <button
                        key={channel.id}
                        onClick={() => switchChannel(channel.id)}
                        className={isActive ? '' : 'sidebar-channel'}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          width: '100%',
                          padding: '8px 18px',
                          border: 'none',
                          borderRadius: 0,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
                          color: isActive
                            ? '#e8c9a0'
                            : channel.unread > 0
                            ? '#f0ebe4'
                            : '#a09888',
                          backgroundColor: isActive
                            ? 'rgba(212, 165, 116, 0.1)'
                            : 'transparent',
                          borderLeft: isActive
                            ? '3px solid #d4a574'
                            : '3px solid transparent',
                          transition: 'background 0.15s, color 0.15s',
                          fontFamily: 'inherit',
                          textAlign: 'left',
                          minHeight: 44,
                        }}
                      >
                        <Icon
                          size={15}
                          style={{
                            flexShrink: 0,
                            opacity: isActive ? 0.9 : 0.6,
                            marginTop: 2,
                          }}
                        />
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
                              }}
                            >
                              {channel.name}
                            </span>
                            {channel.unread > 0 && (
                              <span
                                style={{
                                  backgroundColor: '#d4a574',
                                  color: '#0b0d14',
                                  fontSize: 10,
                                  fontWeight: 700,
                                  borderRadius: 10,
                                  padding: '1px 7px',
                                  minWidth: 18,
                                  textAlign: 'center',
                                  flexShrink: 0,
                                  animation:
                                    channel.unread >= 5
                                      ? 'unreadPulse 2s ease infinite'
                                      : undefined,
                                }}
                              >
                                {channel.unread}
                              </span>
                            )}
                          </div>
                          {/* Last message preview */}
                          {preview && (
                            <p
                              style={{
                                fontSize: 11,
                                color: '#6b6358',
                                margin: '2px 0 0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.3,
                                fontWeight: 400,
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Channel Header */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid #1e2638',
            backgroundColor: '#0d1018',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
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
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(212, 165, 116, 0.1)',
              border: '1px solid rgba(212, 165, 116, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ChannelIcon size={18} style={{ color: '#d4a574' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#f0ebe4',
                margin: 0,
              }}
            >
              {currentChannel?.name ?? 'Channel'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
              <p style={{ fontSize: 11, color: '#6b6358', margin: 0 }}>
                {currentChannel?.description ?? ''}
              </p>
              {currentChannel && channelMembers[currentChannel.id] && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: '#6b6358',
                    borderLeft: '1px solid #1e2638',
                    paddingLeft: 10,
                  }}
                >
                  <Users size={11} style={{ opacity: 0.7 }} />
                  {channelMembers[currentChannel.id]} members
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className={transitioning ? '' : 'channel-content-enter'}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
            opacity: transitioning ? 0 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {/* Pinned Message Banner */}
          {pinnedMessages[selectedChannel] && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                marginBottom: 16,
                backgroundColor: 'rgba(212, 165, 116, 0.06)',
                borderLeft: '3px solid #d4a574',
                borderRadius: '0 8px 8px 0',
              }}
            >
              <Pin
                size={14}
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
            /* ── Empty State ── */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#6b6358',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(212, 165, 116, 0.06)',
                  border: '1px solid rgba(212, 165, 116, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <MessageCircle size={30} style={{ opacity: 0.4, color: '#d4a574' }} />
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
              {/* decorative dots */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
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
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* ── Message Bubbles ── */
            channelMsgs.map((msg, idx) => {
              const prevMsg = idx > 0 ? channelMsgs[idx - 1] : null;
              const isSameSender = prevMsg?.sender === msg.sender;
              const isCurrentUser = msg.sender === currentUser.name;
              const avatarColor = avatarColors[msg.senderAvatar] || '#6b6358';

              return (
                <div
                  key={msg.id}
                  className="chat-msg-enter"
                  style={{
                    display: 'flex',
                    flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                    gap: 10,
                    marginTop: isSameSender ? 4 : 18,
                    animationDelay: `${idx * 40}ms`,
                    maxWidth: '85%',
                    marginLeft: isCurrentUser ? 'auto' : 0,
                    marginRight: isCurrentUser ? 0 : 'auto',
                  }}
                >
                  {/* Avatar */}
                  <div style={{ width: 36, flexShrink: 0 }}>
                    {!isSameSender && (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: avatarColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#0b0d14',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {msg.senderAvatar}
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {!isSameSender && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 8,
                          marginBottom: 4,
                          flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: isCurrentUser ? '#d4a574' : '#f0ebe4',
                          }}
                        >
                          {isCurrentUser ? 'You' : msg.sender}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: '#6b6358',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isCurrentUser
                          ? '14px 4px 14px 14px'
                          : '4px 14px 14px 14px',
                        backgroundColor: isCurrentUser
                          ? 'rgba(212, 165, 116, 0.12)'
                          : '#131720',
                        border: isCurrentUser
                          ? '1px solid rgba(212, 165, 116, 0.18)'
                          : '1px solid #1e2638',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isCurrentUser
                          ? 'rgba(212, 165, 116, 0.16)'
                          : 'rgba(255,255,255,0.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isCurrentUser
                          ? 'rgba(212, 165, 116, 0.12)'
                          : '#131720';
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          color: isCurrentUser ? '#e8d5c0' : '#c8bfb4',
                          lineHeight: 1.55,
                          margin: 0,
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.message}
                      </p>
                    </div>

                    {/* Timestamp for same-sender continuation */}
                    {isSameSender && (
                      <div
                        style={{
                          fontSize: 10,
                          color: '#6b635850',
                          marginTop: 2,
                          textAlign: isCurrentUser ? 'right' : 'left',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {msg.timestamp}
                      </div>
                    )}

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
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div
          style={{
            padding: '12px 24px 16px',
            borderTop: '1px solid #1e2638',
            backgroundColor: '#0d1018',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#131720',
              border: '1px solid #1e2638',
              borderRadius: 12,
              padding: '10px 14px',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1e2638';
            }}
          >
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 6,
                color: '#6b6358',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#a09888';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b6358';
              }}
            >
              <Paperclip size={18} />
            </button>
            <textarea
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
                fontSize: 13,
                fontFamily: 'inherit',
                padding: '2px 0',
                resize: 'none',
                minHeight: 24,
                maxHeight: 96,
              }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = '24px';
                t.style.height = Math.min(t.scrollHeight, 96) + 'px';
              }}
            />
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 6,
                color: '#6b6358',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#a09888';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b6358';
              }}
            >
              <AtSign size={18} />
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 6,
                color: '#6b6358',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#a09888';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b6358';
              }}
            >
              <Smile size={18} />
            </button>
            <button
              onClick={handleSendMessage}
              style={{
                background: messageInput.trim()
                  ? 'linear-gradient(135deg, #c4925a, #d4a574)'
                  : '#1e2638',
                border: 'none',
                cursor: messageInput.trim() ? 'pointer' : 'default',
                padding: 6,
                borderRadius: 8,
                color: messageInput.trim() ? '#0b0d14' : '#6b6358',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.2s, color 0.2s, transform 0.15s',
                transform: messageInput.trim() ? 'scale(1)' : 'scale(0.95)',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
