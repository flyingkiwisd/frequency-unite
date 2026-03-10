'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { chatChannels, chatMessages, type ChatChannel } from '@/lib/data';

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ChatView() {
  const [selectedChannel, setSelectedChannel] = useState('core-team');
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChannel = chatChannels.find((c) => c.id === selectedChannel);
  const channelMsgs = chatMessages.filter((m) => m.channel === selectedChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChannel]);

  const ChannelIcon = currentChannel ? iconMap[currentChannel.icon] || Hash : Hash;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* CSS Animation for typing indicator */}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
        .typing-dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #d4a574;
          animation: typingDot 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      {/* ── Channel Sidebar ── */}
      <div
        style={{
          width: 260,
          minWidth: 260,
          backgroundColor: '#0f1219',
          borderRight: '1px solid #1e2638',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Channel Header */}
        <div
          style={{
            padding: '16px 16px 12px',
            borderBottom: '1px solid #1e2638',
          }}
        >
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
            {chatChannels.length} channels
          </p>
        </div>

        {/* Channel Groups */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {channelGroups.map((group) => {
            const groupChannels = group.ids
              .map((id) => chatChannels.find((c) => c.id === id))
              .filter(Boolean) as ChatChannel[];

            if (groupChannels.length === 0) return null;

            return (
              <div key={group.label} style={{ marginBottom: 8 }}>
                {/* Group label */}
                <div
                  style={{
                    padding: '6px 16px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#6b6358',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <ChevronDown size={10} />
                  {group.label}
                </div>

                {/* Channels */}
                {groupChannels.map((channel) => {
                  const isActive = selectedChannel === channel.id;
                  const Icon = iconMap[channel.icon] || Hash;

                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '7px 16px',
                        border: 'none',
                        borderRadius: 0,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#e8c9a0' : channel.unread > 0 ? '#f0ebe4' : '#a09888',
                        backgroundColor: isActive ? 'rgba(212, 165, 116, 0.1)' : 'transparent',
                        borderLeft: isActive ? '3px solid #d4a574' : '3px solid transparent',
                        transition: 'background 0.15s, color 0.15s',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#1a1f2e';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon size={15} style={{ flexShrink: 0, opacity: 0.7 }} />
                      <span
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
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
                          }}
                        >
                          {channel.unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
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
          <ChannelIcon size={20} style={{ color: '#d4a574' }} />
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
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
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
                <span style={{ fontSize: 10, color: '#6b6358', marginTop: 2, display: 'block' }}>
                  Pinned by {pinnedMessages[selectedChannel].author}
                </span>
              </div>
            </div>
          )}

          {channelMsgs.length === 0 ? (
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
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(212, 165, 116, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <ChannelIcon size={28} style={{ opacity: 0.5, color: '#d4a574' }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe4', margin: 0 }}>
                Welcome to #{currentChannel?.name}
              </p>
              <p style={{ fontSize: 13, margin: '8px 0 0', opacity: 0.7, lineHeight: 1.5 }}>
                This is the very beginning of the <strong style={{ color: '#d4a574', fontWeight: 600 }}>#{currentChannel?.name}</strong> channel.
              </p>
              <p style={{ fontSize: 12, margin: '12px 0 0', opacity: 0.5, maxWidth: 320, textAlign: 'center', lineHeight: 1.5 }}>
                Start the conversation by sharing an update or asking a question.
              </p>
            </div>
          ) : (
            channelMsgs.map((msg, idx) => {
              const prevMsg = idx > 0 ? channelMsgs[idx - 1] : null;
              const isSameSender = prevMsg?.sender === msg.sender;
              const avatarColor = avatarColors[msg.senderAvatar] || '#6b6358';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: isSameSender ? 4 : 16,
                    padding: '4px 8px',
                    borderRadius: 8,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
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
                          marginBottom: 2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#f0ebe4',
                          }}
                        >
                          {msg.sender}
                        </span>
                        <span style={{ fontSize: 11, color: '#6b6358' }}>{msg.timestamp}</span>
                      </div>
                    )}
                    <p
                      style={{
                        fontSize: 13,
                        color: '#c8bfb4',
                        lineHeight: 1.55,
                        margin: 0,
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.message}
                    </p>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          marginTop: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        {msg.reactions.map((r, ri) => (
                          <span
                            key={ri}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 12,
                              backgroundColor: 'rgba(212, 165, 116, 0.08)',
                              border: '1px solid rgba(212, 165, 116, 0.15)',
                              fontSize: 12,
                              cursor: 'pointer',
                              transition: 'background 0.15s, border-color 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                'rgba(212, 165, 116, 0.15)';
                              e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                'rgba(212, 165, 116, 0.08)';
                              e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.15)';
                            }}
                          >
                            <span>{r.emoji}</span>
                            <span style={{ color: '#a09888', fontSize: 11, fontWeight: 600 }}>
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
                        {msg.reactions.reduce((sum, r) => sum + r.count, 0)} replies
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {selectedChannel === 'core-team' && (
          <div
            style={{
              padding: '4px 24px 8px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: '#6b6358',
              }}
            >
              <span style={{ fontWeight: 600, color: '#a09888' }}>Sian</span>
              <span>is typing</span>
              <span style={{ display: 'inline-flex', gap: 3, marginLeft: 1, alignItems: 'center' }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </span>
            </div>
          </div>
        )}

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
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message #${currentChannel?.name ?? 'channel'}...`}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f0ebe4',
                fontSize: 13,
                fontFamily: 'inherit',
                padding: '2px 0',
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
                transition: 'background 0.2s, color 0.2s',
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
