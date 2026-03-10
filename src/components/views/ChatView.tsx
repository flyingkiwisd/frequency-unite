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
          <div>
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
            <p style={{ fontSize: 11, color: '#6b6358', margin: '2px 0 0' }}>
              {currentChannel?.description ?? ''}
            </p>
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
              <ChannelIcon size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 14, margin: 0 }}>No messages in #{currentChannel?.name} yet</p>
              <p style={{ fontSize: 12, margin: '4px 0 0', opacity: 0.6 }}>
                Start the conversation
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
