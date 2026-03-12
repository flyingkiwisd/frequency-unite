'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Shield, Fingerprint, Heart, Sparkles, Mail, Loader2 } from 'lucide-react';
import { teamMembers } from '@/lib/data';
import { tailwindColorMap } from '@/lib/constants';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { isClerkConfigured } from '@/lib/config';
import { SignIn } from '@clerk/nextjs';

interface LoginScreenProps {
  onLogin: () => void;
}

type Mode = 'demo' | 'clerk';

const stewardQuotes = [
  { text: 'Envision, fund, and implement the world we want to leave to our children.', author: 'Frequency Mission' },
  { text: 'Stewardship is not ownership -- it is sacred responsibility.', author: 'Core Principle' },
  { text: 'We build in coherence, or we do not build at all.', author: 'Operating Agreement' },
  { text: 'Capital flows where consciousness grows.', author: 'Investment Thesis' },
  { text: 'The network is the node. The node is the network.', author: 'Topology Design' },
];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { demoLogin } = useAuth();

  const [mode, setMode] = useState<Mode>('demo');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<'core-team' | 'board' | 'all'>('all');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteFading, setQuoteFading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signingInMemberId, setSigningInMemberId] = useState<string | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // Parallax mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!screenRef.current) return;
    const rect = screenRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteFading(true);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % stewardQuotes.length);
        setQuoteFading(false);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const filteredMembers = teamMembers.filter((m) => {
    if (selectedTier === 'all') return true;
    if (selectedTier === 'board') return m.tier === 'board' || m.tier === 'core-team';
    return m.tier === selectedTier;
  });

  const getHexColor = (twClass: string) => tailwindColorMap[twClass] || '#d4a574';

  const handleDemoLogin = async (memberId: string) => {
    setIsSigningIn(true);
    setSigningInMemberId(memberId);
    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 800));
    demoLogin(memberId);
    onLogin();
  };

  // Clerk sign-in view (inline, no redirect)
  if (mode === 'clerk' && isClerkConfigured) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0d14',
          gap: 24,
        }}
      >
        <SignIn
          appearance={{
            elements: {
              rootBox: { width: '100%', maxWidth: 420 },
              card: {
                background: 'rgba(15, 18, 28, 0.9)',
                border: '1px solid rgba(212, 165, 116, 0.12)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              },
              headerTitle: { color: '#f0ebe4' },
              headerSubtitle: { color: '#a09888' },
              formFieldLabel: { color: '#a09888' },
              formFieldInput: {
                background: 'rgba(28, 34, 48, 0.6)',
                border: '1px solid rgba(212, 165, 116, 0.15)',
                color: '#f0ebe4',
              },
              formButtonPrimary: {
                background: 'linear-gradient(135deg, #d4a574, #c4925a)',
                color: '#0b0d14',
              },
              footerActionLink: { color: '#d4a574' },
            },
          }}
          routing="hash"
          fallbackRedirectUrl="/"
        />
        <button
          onClick={() => setMode('demo')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(160, 152, 136, 0.2)',
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: 13,
            color: '#a09888',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          ← Use demo mode instead
        </button>
      </div>
    );
  }

  return (
    <div className="login-screen" ref={screenRef}>
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

        /* ─── Animated gradient orbs background (CSS-only) ─── */
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

        /* ─── Background grid with intersection glow ─── */
        .login-screen::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(212, 165, 116, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 165, 116, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%);
        }

        .grid-glow {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle 2px at 60px 60px, rgba(212, 165, 116, 0.12) 0%, transparent 100%),
            radial-gradient(circle 2px at 120px 120px, rgba(139, 92, 246, 0.08) 0%, transparent 100%),
            radial-gradient(circle 2px at 180px 60px, rgba(212, 165, 116, 0.06) 0%, transparent 100%);
          background-size: 180px 180px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 65%);
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 65%);
          animation: gridGlowPulse 6s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes gridGlowPulse {
          0% { opacity: 0.4; }
          100% { opacity: 0.9; }
        }

        /* ─── Floating orbs with parallax ─── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 12s ease-in-out infinite;
          pointer-events: none;
          transition: transform 0.3s ease-out;
          will-change: transform;
        }

        .orb-1 {
          width: 500px; height: 500px;
          background: rgba(212, 165, 116, 0.07);
          top: -15%; right: -8%;
          animation-delay: 0s;
          animation-duration: 14s;
        }

        .orb-2 {
          width: 400px; height: 400px;
          background: rgba(139, 92, 246, 0.06);
          bottom: -10%; left: -8%;
          animation-delay: -4s;
          animation-duration: 16s;
        }

        .orb-3 {
          width: 300px; height: 300px;
          background: rgba(107, 143, 113, 0.05);
          top: 40%; left: 55%;
          animation-delay: -8s;
          animation-duration: 18s;
        }

        .orb-4 {
          width: 250px; height: 250px;
          background: rgba(212, 165, 116, 0.04);
          top: 20%; left: -5%;
          animation-delay: -2s;
          animation-duration: 20s;
        }

        .orb-5 {
          width: 180px; height: 180px;
          background: rgba(139, 92, 246, 0.04);
          bottom: 20%; right: 10%;
          animation-delay: -6s;
          animation-duration: 15s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.06); }
          50% { transform: translate(-20px, 20px) scale(0.94); }
          75% { transform: translate(15px, 30px) scale(1.03); }
        }

        /* ─── Particle dots (CSS-only) ─── */
        .particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 2px; height: 2px;
          border-radius: 50%;
          background: rgba(212, 165, 116, 0.3);
          animation: particleDrift linear infinite;
        }

        .particle:nth-child(1) { top: 15%; left: 10%; animation-duration: 22s; animation-delay: 0s; width: 3px; height: 3px; }
        .particle:nth-child(2) { top: 25%; left: 85%; animation-duration: 18s; animation-delay: -3s; }
        .particle:nth-child(3) { top: 70%; left: 20%; animation-duration: 24s; animation-delay: -7s; background: rgba(139, 92, 246, 0.25); }
        .particle:nth-child(4) { top: 80%; left: 75%; animation-duration: 20s; animation-delay: -5s; width: 3px; height: 3px; }
        .particle:nth-child(5) { top: 45%; left: 5%; animation-duration: 26s; animation-delay: -9s; background: rgba(107, 143, 113, 0.2); }
        .particle:nth-child(6) { top: 10%; left: 55%; animation-duration: 19s; animation-delay: -2s; }
        .particle:nth-child(7) { top: 60%; left: 90%; animation-duration: 23s; animation-delay: -11s; background: rgba(139, 92, 246, 0.2); }
        .particle:nth-child(8) { top: 90%; left: 40%; animation-duration: 21s; animation-delay: -4s; }

        @keyframes particleDrift {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translate(40px, -60px) scale(1.5); opacity: 0.6; }
          90% { opacity: 0.2; }
          100% { transform: translate(-20px, -120px) scale(0.5); opacity: 0; }
        }

        /* ─── Login card — premium glassmorphism with animated border gradient ─── */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 600px;
          margin: 0 20px;
          padding: 52px 44px 44px;
          background: rgba(13, 16, 24, 0.72);
          backdrop-filter: blur(30px) saturate(1.4);
          -webkit-backdrop-filter: blur(30px) saturate(1.4);
          border: 1px solid rgba(212, 165, 116, 0.1);
          border-radius: 28px;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.03),
            0 30px 60px -15px rgba(0, 0, 0, 0.55),
            0 0 100px rgba(212, 165, 116, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          animation: cardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Animated border gradient overlay */
        .login-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 28px;
          padding: 1px;
          background: linear-gradient(
            135deg,
            rgba(212, 165, 116, 0.25),
            rgba(139, 92, 246, 0.12),
            rgba(212, 165, 116, 0.04),
            rgba(107, 143, 113, 0.1),
            rgba(212, 165, 116, 0.25)
          );
          background-size: 400% 400%;
          animation: cardBorderShift 8s ease infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes cardBorderShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes cardAppear {
          0% { opacity: 0; transform: translateY(30px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ─── Logo area — breathing + subtle rotation ─── */
        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          position: relative;
        }

        .logo-glow {
          position: relative;
          width: 110px; height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: logoBreathe 6s ease-in-out infinite;
        }

        @keyframes logoBreathe {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.04) rotate(1.5deg); }
          50% { transform: scale(1.08) rotate(0deg); }
          75% { transform: scale(1.04) rotate(-1.5deg); }
        }

        .logo-glow::before {
          content: '';
          position: absolute;
          inset: -16px;
          background: radial-gradient(circle, rgba(212, 165, 116, 0.18), transparent 70%);
          border-radius: 50%;
          animation: glowPulse 3.5s ease-in-out infinite;
        }

        .logo-glow::after {
          content: '';
          position: absolute;
          inset: -24px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%);
          border-radius: 50%;
          animation: glowPulse 4s ease-in-out infinite reverse;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* ─── Version badge ─── */
        .version-badge {
          position: absolute;
          top: -2px;
          right: -12px;
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.12));
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #c4b5fd;
          z-index: 5;
          animation: badgePulse 3s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        /* Wave animation on the SVG */
        .wave-path-main {
          animation: waveAnimate 4s ease-in-out infinite;
        }
        .wave-path-purple {
          animation: waveAnimate 4.5s ease-in-out infinite reverse;
        }
        .wave-path-green {
          animation: waveAnimate 5s ease-in-out infinite;
          animation-delay: -1s;
        }

        @keyframes waveAnimate {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-3px); }
          50% { transform: translateY(3px); }
          75% { transform: translateY(-2px); }
        }

        /* ─── Title — gradient text with enhanced typography ─── */
        .title {
          text-align: center;
          font-size: 34px;
          font-weight: 800;
          letter-spacing: 8px;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #d4a574 0%, #e8c9a0 30%, #d4a574 50%, #8b5cf6 75%, #d4a574 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleGradient 6s ease infinite;
          line-height: 1.2;
        }

        @keyframes titleGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .subtitle {
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(212, 165, 116, 0.55);
          margin-bottom: 8px;
        }

        /* ─── Rotating quotes ─── */
        .tagline {
          text-align: center;
          font-size: 12.5px;
          color: rgba(160, 152, 136, 0.45);
          margin-bottom: 6px;
          line-height: 1.7;
          font-style: italic;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
          min-height: 40px;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .tagline.fading {
          opacity: 0;
          transform: translateY(4px);
        }

        .quote-author {
          text-align: center;
          font-size: 10px;
          color: rgba(212, 165, 116, 0.3);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 600;
          font-style: normal;
          margin-bottom: 32px;
          transition: opacity 0.5s ease;
        }

        .quote-author.fading {
          opacity: 0;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.15), rgba(139, 92, 246, 0.08), transparent);
          margin-bottom: 24px;
        }

        .demo-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(212, 165, 116, 0.12));
          border: 1px solid rgba(139, 92, 246, 0.18);
          color: #c4b5fd;
          margin-bottom: 16px;
        }

        /* ─── Tier tabs ─── */
        .tier-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tier-tab {
          padding: 7px 18px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid rgba(212, 165, 116, 0.12);
          background: transparent;
          color: rgba(160, 152, 136, 0.45);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }

        .tier-tab::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(212, 165, 116, 0.08), rgba(139, 92, 246, 0.04));
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .tier-tab:hover {
          border-color: rgba(212, 165, 116, 0.28);
          color: rgba(212, 165, 116, 0.85);
          transform: translateY(-1px);
        }

        .tier-tab:hover::before {
          opacity: 1;
        }

        .tier-tab.active {
          background: rgba(212, 165, 116, 0.1);
          border-color: rgba(212, 165, 116, 0.3);
          color: #d4a574;
          box-shadow: 0 0 20px rgba(212, 165, 116, 0.08);
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

        /* ─── Avatar grid — better layout with tooltips ─── */
        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 32px;
          max-height: 340px;
          overflow-y: auto;
          padding: 4px;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 165, 116, 0.15) transparent;
        }

        .avatar-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 14px 4px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 18px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          font-family: inherit;
        }

        .avatar-button:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
        }

        .avatar-button:active {
          transform: translateY(-2px) scale(0.98);
          transition-duration: 0.1s;
        }

        .avatar-button.signing-in {
          pointer-events: none;
          opacity: 0.7;
        }

        .avatar-button.signing-in .avatar-circle {
          animation: avatarSpin 0.8s linear infinite;
        }

        @keyframes avatarSpin {
          0% { transform: scale(1.12) rotate(0deg); }
          100% { transform: scale(1.12) rotate(360deg); }
        }

        .avatar-circle {
          width: 56px; height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px; font-weight: 700; letter-spacing: 1px; color: white;
          position: relative;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        }

        .avatar-circle::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: all 0.35s ease;
        }

        .avatar-circle::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.35s ease;
        }

        .avatar-button:hover .avatar-circle::before {
          border-color: currentColor;
          opacity: 0.35;
        }

        .avatar-button:hover .avatar-circle::after {
          opacity: 0.12;
          background: radial-gradient(circle, currentColor, transparent 70%);
        }

        .avatar-button:hover .avatar-circle {
          transform: scale(1.12);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
        }

        .avatar-name {
          font-size: 10.5px; font-weight: 500;
          color: rgba(160, 152, 136, 0.35);
          transition: all 0.3s ease;
          text-align: center;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 85px;
        }

        .avatar-button:hover .avatar-name {
          color: rgba(240, 235, 228, 0.85);
        }

        .avatar-tier-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 6px; height: 6px;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .avatar-button:hover .avatar-tier-dot {
          opacity: 1;
        }

        /* ─── Enhanced tooltip with full name + role ─── */
        .avatar-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(6px);
          padding: 8px 16px;
          background: rgba(13, 16, 24, 0.96);
          border: 1px solid rgba(212, 165, 116, 0.2);
          border-radius: 12px;
          font-size: 11px;
          color: rgba(240, 235, 228, 0.9);
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 20;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          text-align: center;
        }

        .avatar-tooltip .tooltip-name {
          font-weight: 600;
          color: #f0ebe4;
          margin-bottom: 2px;
        }

        .avatar-tooltip .tooltip-role {
          font-size: 10px;
          color: #a09888;
          font-weight: 400;
        }

        .avatar-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(212, 165, 116, 0.2);
        }

        .avatar-button:hover .avatar-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* ─── Clerk sign-in button — premium gold gradient ─── */
        .clerk-signin-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          border-radius: 14px;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #0b0d14;
          background: linear-gradient(135deg, #d4a574, #e8c9a0, #c4925a);
          background-size: 200% 200%;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow:
            0 4px 16px rgba(212, 165, 116, 0.25),
            0 0 0 1px rgba(212, 165, 116, 0.1);
          position: relative;
          overflow: hidden;
        }

        .clerk-signin-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          background-size: 200% 100%;
          animation: shimmerBtn 3s ease infinite;
        }

        @keyframes shimmerBtn {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .clerk-signin-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 8px 24px rgba(212, 165, 116, 0.35),
            0 0 0 1px rgba(212, 165, 116, 0.2);
          background-position: 100% 50%;
        }

        .clerk-signin-btn:active {
          transform: translateY(0);
          transition-duration: 0.1s;
        }

        .clerk-signin-btn.loading {
          pointer-events: none;
          opacity: 0.85;
        }

        .clerk-signin-btn .spinner {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ─── Footer badges ─── */
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

        /* ─── Scanline effect ─── */
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

        /* ─── Inner divider with Clerk button ─── */
        .clerk-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.12), rgba(139, 92, 246, 0.06), transparent);
          margin-bottom: 18px;
        }

        .clerk-or {
          text-align: center;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(160, 152, 136, 0.3);
          margin-bottom: 14px;
        }

        /* ─── Mobile responsiveness ─── */
        @media (max-width: 640px) {
          .login-card {
            margin: 0 12px;
            padding: 36px 24px 32px;
            border-radius: 22px;
            max-width: 100%;
          }

          .title {
            font-size: 24px;
            letter-spacing: 5px;
          }

          .subtitle {
            font-size: 11px;
            letter-spacing: 3px;
          }

          .tagline {
            font-size: 11.5px;
            max-width: 280px;
          }

          .logo-glow {
            width: 85px;
            height: 85px;
          }

          .logo-glow svg {
            width: 66px;
            height: 66px;
          }

          .avatar-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            max-height: 280px;
          }

          .avatar-circle {
            width: 46px;
            height: 46px;
            font-size: 13px;
          }

          .avatar-name {
            font-size: 9.5px;
            max-width: 72px;
          }

          .avatar-tooltip {
            display: none;
          }

          .tier-tabs {
            gap: 6px;
          }

          .tier-tab {
            padding: 6px 14px;
            font-size: 10px;
          }

          .orb-1 { width: 300px; height: 300px; }
          .orb-2 { width: 250px; height: 250px; }
          .orb-3 { width: 180px; height: 180px; }
          .orb-4 { width: 150px; height: 150px; }
          .orb-5 { width: 120px; height: 120px; }

          .footer-badges {
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
          }

          .badge {
            font-size: 9px;
          }

          .clerk-signin-btn {
            padding: 10px 22px;
            font-size: 12.5px;
          }

          .version-badge {
            top: -4px;
            right: -8px;
            font-size: 8px;
            padding: 2px 6px;
          }
        }

        @media (max-width: 380px) {
          .avatar-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .login-card {
            padding: 28px 16px 24px;
          }

          .title {
            font-size: 20px;
            letter-spacing: 4px;
          }
        }
      `}</style>

      {/* Background grid glow at intersections */}
      <div className="grid-glow" />

      {/* Background orbs with parallax */}
      <div
        className="orb orb-1"
        style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 20}px)` }}
      />
      <div
        className="orb orb-2"
        style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -15}px)` }}
      />
      <div
        className="orb orb-3"
        style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 25}px)` }}
      />
      <div
        className="orb orb-4"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * 10}px)` }}
      />
      <div
        className="orb orb-5"
        style={{ transform: `translate(${mousePos.x * 18}px, ${mousePos.y * -22}px)` }}
      />

      {/* Particle dots */}
      <div className="particles">
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>

      <div className="login-card">
        <div className="scanline" />

        {/* Logo — breathing + rotation with version badge */}
        <div className="logo-container">
          <div className="logo-glow">
            <svg width="88" height="88" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="url(#loginGrad)" opacity="0.1" />
              <circle cx="32" cy="32" r="28" stroke="rgba(212, 165, 116, 0.08)" strokeWidth="0.5" fill="none" />
              <g className="wave-path-main">
                <path d="M8 32 Q16 12 32 32 Q48 52 56 32" stroke="url(#waveGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
              <g className="wave-path-purple">
                <path d="M8 32 Q16 18 32 32 Q48 46 56 32" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
              </g>
              <g className="wave-path-green">
                <path d="M8 32 Q16 23 32 32 Q48 41 56 32" stroke="#6b8f71" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3" />
              </g>
              <circle cx="32" cy="32" r="5" fill="url(#centerGrad)" />
              <circle cx="32" cy="32" r="2.5" fill="#0b0d14" />
              <defs>
                <radialGradient id="loginGrad" cx="32" cy="32" r="28">
                  <stop stopColor="#d4a574" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </radialGradient>
                <linearGradient id="waveGrad" x1="8" y1="32" x2="56" y2="32">
                  <stop stopColor="#d4a574" />
                  <stop offset="0.5" stopColor="#e8c9a0" />
                  <stop offset="1" stopColor="#d4a574" />
                </linearGradient>
                <radialGradient id="centerGrad" cx="32" cy="32" r="5">
                  <stop stopColor="#e8c9a0" />
                  <stop offset="1" stopColor="#d4a574" />
                </radialGradient>
              </defs>
            </svg>
            <span className="version-badge">v2.0</span>
          </div>
        </div>

        <h1 className="title">FREQUENCY</h1>
        <p className="subtitle">Steward Operating System</p>

        {/* Rotating testimonial quotes */}
        <p className={`tagline ${quoteFading ? 'fading' : ''}`}>
          {stewardQuotes[quoteIndex].text}
        </p>
        <p className={`quote-author ${quoteFading ? 'fading' : ''}`}>
          -- {stewardQuotes[quoteIndex].author}
        </p>

        <div className="divider" />

        {/* ─── DEMO MODE — Avatar Grid Login ─── */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span className="demo-badge">
              <Sparkles size={12} />
              Select Your Profile
            </span>
          </div>

          {/* Tier tabs */}
          <div className="tier-tabs">
            <button className={`tier-tab ${selectedTier === 'all' ? 'active' : ''}`} onClick={() => setSelectedTier('all')}>All</button>
            <button className={`tier-tab ${selectedTier === 'core-team' ? 'active' : ''}`} onClick={() => setSelectedTier('core-team')}>Core Team</button>
            <button className={`tier-tab ${selectedTier === 'board' ? 'active' : ''}`} onClick={() => setSelectedTier('board')}>Board</button>
          </div>

          <div className="section-label">
            <Fingerprint size={12} />
            <span>Choose your steward identity</span>
          </div>

          <div className="avatar-grid">
            {filteredMembers.map((member, index) => {
              const hex = getHexColor(member.color);
              const tierDotColor = member.tier === 'core-team' ? '#d4a574' : member.tier === 'board' ? '#8b5cf6' : '#6b8f71';
              const isThisSigningIn = isSigningIn && signingInMemberId === member.id;
              return (
                <button
                  key={member.id}
                  className={`avatar-button ${isThisSigningIn ? 'signing-in' : ''}`}
                  onClick={() => handleDemoLogin(member.id)}
                  onMouseEnter={() => setHoveredUser(member.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                  disabled={isSigningIn}
                  style={{ animationDelay: `${index * 40}ms` } as React.CSSProperties}
                >
                  {/* Enhanced tooltip with full name + role */}
                  <div className="avatar-tooltip">
                    <div className="tooltip-name">{member.name}</div>
                    <div className="tooltip-role">{member.shortRole}</div>
                  </div>
                  <div className="avatar-tier-dot" style={{ background: tierDotColor }} />
                  <div
                    className="avatar-circle"
                    style={{
                      background: `linear-gradient(145deg, ${hex}ee, ${hex}aa)`,
                      color: hex,
                    }}
                  >
                    {isThisSigningIn ? (
                      <Loader2 size={20} style={{ color: 'white' }} className="spinner" />
                    ) : (
                      <span style={{ color: 'white' }}>{member.avatar}</span>
                    )}
                  </div>
                  <span className="avatar-name">
                    {isThisSigningIn ? 'Connecting...' : member.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isClerkConfigured && (
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div className="clerk-divider" />
            <div className="clerk-or">or</div>
            <button
              className="clerk-signin-btn"
              onClick={() => setMode('clerk')}
            >
              <Mail size={15} />
              Sign in with email
            </button>
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
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
    </div>
  );
}
