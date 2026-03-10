'use client';

import { useState } from 'react';
import { Lock, Zap, Shield, Fingerprint, Heart } from 'lucide-react';
import { teamMembers } from '@/lib/data';

interface LoginScreenProps {
  onLogin: (userId: string) => void;
}

const tailwindColorMap: Record<string, string> = {
  'bg-amber-500': '#f59e0b',
  'bg-amber-400': '#fbbf24',
  'bg-rose-400': '#fb7185',
  'bg-violet-500': '#8b5cf6',
  'bg-sky-400': '#38bdf8',
  'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7',
  'bg-pink-400': '#f472b6',
  'bg-teal-400': '#2dd4bf',
  'bg-green-500': '#22c55e',
  'bg-lime-500': '#84cc16',
  'bg-orange-500': '#f97316',
  'bg-indigo-400': '#818cf8',
  'bg-slate-400': '#94a3b8',
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [clickedUser, setClickedUser] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<'core-team' | 'board' | 'all'>('all');

  const filteredMembers = teamMembers.filter((m) => {
    if (selectedTier === 'all') return true;
    if (selectedTier === 'board') return m.tier === 'board' || m.tier === 'core-team';
    return m.tier === selectedTier;
  });

  const handleLogin = (userId: string) => {
    setClickedUser(userId);
    setTimeout(() => {
      onLogin(userId);
    }, 600);
  };

  const getHexColor = (twClass: string) => tailwindColorMap[twClass] || '#d4a574';

  return (
    <div className="login-screen">
      <style jsx>{`
        .login-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b0d14;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
        }

        .login-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 165, 116, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139, 92, 246, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(107, 143, 113, 0.06), transparent);
          animation: bgPulse 8s ease-in-out infinite alternate;
        }

        @keyframes bgPulse {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }

        .login-screen::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(212, 165, 116, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 165, 116, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%);
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 12s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px; height: 400px;
          background: rgba(212, 165, 116, 0.06);
          top: -10%; right: -5%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px; height: 300px;
          background: rgba(139, 92, 246, 0.05);
          bottom: -5%; left: -5%;
          animation-delay: -4s;
        }

        .orb-3 {
          width: 200px; height: 200px;
          background: rgba(107, 143, 113, 0.04);
          top: 50%; left: 60%;
          animation-delay: -8s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 580px;
          margin: 0 20px;
          padding: 48px 40px 40px;
          background: rgba(15, 18, 28, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(212, 165, 116, 0.12);
          border-radius: 24px;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.03),
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 80px rgba(212, 165, 116, 0.04);
          animation: cardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardAppear {
          0% { opacity: 0; transform: translateY(30px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 28px;
          animation: logoFloat 4s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .logo-glow {
          position: relative;
          width: 80px; height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-glow::before {
          content: '';
          position: absolute;
          inset: -8px;
          background: radial-gradient(circle, rgba(212, 165, 116, 0.2), transparent 70%);
          border-radius: 50%;
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .title {
          text-align: center;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 6px;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #d4a574, #8b5cf6, #6b8f71);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(212, 165, 116, 0.6);
          margin-bottom: 6px;
        }

        .tagline {
          text-align: center;
          font-size: 12px;
          color: rgba(160, 152, 136, 0.5);
          margin-bottom: 28px;
          line-height: 1.6;
          font-style: italic;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.15), transparent);
          margin-bottom: 20px;
        }

        .tier-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tier-tab {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid rgba(212, 165, 116, 0.15);
          background: transparent;
          color: rgba(160, 152, 136, 0.5);
          transition: all 0.2s;
          font-family: inherit;
        }

        .tier-tab:hover {
          border-color: rgba(212, 165, 116, 0.3);
          color: rgba(212, 165, 116, 0.8);
        }

        .tier-tab.active {
          background: rgba(212, 165, 116, 0.1);
          border-color: rgba(212, 165, 116, 0.3);
          color: #d4a574;
        }

        .section-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(160, 152, 136, 0.4);
          margin-bottom: 20px;
        }

        .section-label svg { width: 12px; height: 12px; opacity: 0.5; }

        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
          max-height: 320px;
          overflow-y: auto;
          padding: 4px;
        }

        .avatar-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 4px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .avatar-button:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.06);
          transform: translateY(-4px);
        }

        .avatar-button.clicked {
          animation: avatarClick 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes avatarClick {
          0% { transform: scale(1); }
          30% { transform: scale(0.9); }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 0.5; }
        }

        .avatar-circle {
          width: 52px; height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px; font-weight: 700; letter-spacing: 1px; color: white;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .avatar-circle::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .avatar-button:hover .avatar-circle::before {
          border-color: currentColor;
          opacity: 0.3;
        }

        .avatar-button:hover .avatar-circle {
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .avatar-name {
          font-size: 10px; font-weight: 500;
          color: rgba(160, 152, 136, 0.3);
          transition: all 0.3s ease;
          text-align: center;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 80px;
        }

        .avatar-button:hover .avatar-name {
          color: rgba(240, 235, 228, 0.8);
        }

        .avatar-role {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          padding: 6px 12px;
          background: rgba(15, 18, 28, 0.95);
          border: 1px solid rgba(212, 165, 116, 0.2);
          border-radius: 8px;
          font-size: 11px;
          color: rgba(240, 235, 228, 0.9);
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s ease;
          z-index: 20;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .avatar-button:hover .avatar-role {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .footer-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px; font-weight: 500;
          color: rgba(160, 152, 136, 0.3);
          letter-spacing: 0.5px;
        }

        .badge svg { width: 11px; height: 11px; opacity: 0.4; }

        .badge-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(212, 165, 116, 0.4);
          animation: dotPulse 2s ease-in-out infinite;
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .scanline {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.06), transparent);
          animation: scanMove 6s linear infinite;
          pointer-events: none;
          z-index: 15;
        }

        @keyframes scanMove {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="login-card">
        <div className="scanline" />

        {/* Logo */}
        <div className="logo-container">
          <div className="logo-glow">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="28" fill="url(#loginGrad)" opacity="0.12" />
              <path d="M10 32 Q18 14 32 32 Q46 50 54 32" stroke="url(#waveGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M10 32 Q18 18 32 32 Q46 46 54 32" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
              <path d="M10 32 Q18 22 32 32 Q46 42 54 32" stroke="#6b8f71" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3" />
              <circle cx="32" cy="32" r="4" fill="#d4a574" />
              <circle cx="32" cy="32" r="2" fill="#0b0d14" />
              <defs>
                <radialGradient id="loginGrad" cx="32" cy="32" r="28">
                  <stop stopColor="#d4a574" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </radialGradient>
                <linearGradient id="waveGrad" x1="10" y1="32" x2="54" y2="32">
                  <stop stopColor="#d4a574" />
                  <stop offset="0.5" stopColor="#c4925a" />
                  <stop offset="1" stopColor="#d4a574" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h1 className="title">FREQUENCY</h1>
        <p className="subtitle">Steward Operating System</p>
        <p className="tagline">
          Envision, fund, and implement the world we want to leave to our children.
        </p>

        <div className="divider" />

        {/* Tier tabs */}
        <div className="tier-tabs">
          <button className={`tier-tab ${selectedTier === 'all' ? 'active' : ''}`} onClick={() => setSelectedTier('all')}>All</button>
          <button className={`tier-tab ${selectedTier === 'core-team' ? 'active' : ''}`} onClick={() => setSelectedTier('core-team')}>Core Team</button>
          <button className={`tier-tab ${selectedTier === 'board' ? 'active' : ''}`} onClick={() => setSelectedTier('board')}>Board</button>
        </div>

        <div className="section-label">
          <Fingerprint size={12} />
          <span>Select your profile to continue</span>
        </div>

        <div className="avatar-grid">
          {filteredMembers.map((member) => {
            const hex = getHexColor(member.color);
            return (
              <button
                key={member.id}
                className={`avatar-button ${clickedUser === member.id ? 'clicked' : ''}`}
                onClick={() => handleLogin(member.id)}
                onMouseEnter={() => setHoveredUser(member.id)}
                onMouseLeave={() => setHoveredUser(null)}
              >
                <div className="avatar-role">{member.shortRole}</div>
                <div
                  className="avatar-circle"
                  style={{
                    background: `linear-gradient(135deg, ${hex}, ${hex}cc)`,
                    color: hex,
                  }}
                >
                  <span style={{ color: 'white' }}>{member.avatar}</span>
                </div>
                <span className="avatar-name">
                  {member.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="footer-badges">
          <div className="badge">
            <Shield size={11} />
            <span>Encrypted</span>
          </div>
          <div className="badge-dot" />
          <div className="badge">
            <Heart size={11} />
            <span>Steward Access</span>
          </div>
          <div className="badge-dot" />
          <div className="badge">
            <Zap size={11} />
            <span>AI-Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
