'use client';

import {
  LayoutDashboard,
  Network,
  CheckSquare,
  Target,
  MessageCircle,
  MoreHorizontal,
  Search,
  Users,
  Map,
  Scale,
  Calendar,
  Wallet,
  X,
  ChevronDown,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

type ViewType = 'dashboard' | 'team' | 'chat' | 'okrs' | 'tasks' | 'governance' | 'roadmap' | 'events' | 'nodes' | 'budget' | 'advisor' | 'leaderboard';

interface MobileNavProps {
  currentView: string;
  onViewChange: (view: ViewType) => void;
  onOpenSearch: () => void;
}

const primaryTabs: { label: string; icon: React.ElementType; view: ViewType }[] = [
  { label: 'Home', icon: LayoutDashboard, view: 'dashboard' },
  { label: 'Tasks', icon: CheckSquare, view: 'tasks' },
  { label: 'OKRs', icon: Target, view: 'okrs' },
  { label: 'Chat', icon: MessageCircle, view: 'chat' },
];

const moreTabs: { label: string; icon: React.ElementType; view: ViewType }[] = [
  { label: 'Team', icon: Users, view: 'team' },
  { label: 'Governance', icon: Scale, view: 'governance' },
  { label: 'Roadmap', icon: Map, view: 'roadmap' },
  { label: 'Events', icon: Calendar, view: 'events' },
  { label: 'Nodes', icon: Network, view: 'nodes' },
  { label: 'Budget', icon: Wallet, view: 'budget' },
  { label: 'Leaderboard', icon: Trophy, view: 'leaderboard' },
  { label: 'AI Advisor', icon: Sparkles, view: 'advisor' },
];

/* ─── Resolve current view label ─── */
function getViewLabel(view: string): string {
  const primary = primaryTabs.find((t) => t.view === view);
  if (primary) return primary.label;
  const more = moreTabs.find((t) => t.view === view);
  if (more) return more.label;
  return 'Dashboard';
}

export function MobileNav({ currentView, onViewChange, onOpenSearch }: MobileNavProps) {
  const [showMore, setShowMore] = useState(false);
  const [pressedTab, setPressedTab] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const isMoreActive = moreTabs.some((t) => t.view === currentView);
  const currentLabel = getViewLabel(currentView);

  // Animate sheet open/close
  useEffect(() => {
    if (showMore) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSheetVisible(true);
        });
      });
    } else {
      setSheetVisible(false);
    }
  }, [showMore]);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setTimeout(() => setShowMore(false), 280);
  }, []);

  const handleTabPress = useCallback((viewId: string) => {
    setPressedTab(viewId);
    setTimeout(() => setPressedTab(null), 150);
  }, []);

  const handlePrimaryNav = useCallback((view: ViewType) => {
    handleTabPress(view);
    onViewChange(view);
    if (showMore) handleCloseSheet();
  }, [handleTabPress, onViewChange, showMore, handleCloseSheet]);

  const handleMoreNav = useCallback((view: ViewType) => {
    handleTabPress(view);
    onViewChange(view);
    handleCloseSheet();
  }, [handleTabPress, onViewChange, handleCloseSheet]);

  return (
    <>
      <style>{`
        @keyframes mobileNavGlowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes mobileNavPress {
          0% { transform: scale(1); }
          50% { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
        .mobile-nav-press {
          animation: mobileNavPress 0.15s ease-out;
        }
      `}</style>

      {/* ── Slide-up sheet overlay ── */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={handleCloseSheet}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              opacity: sheetVisible ? 1 : 0,
              transition: 'opacity 0.25s ease-out',
            }}
          />

          <div
            ref={sheetRef}
            className="absolute left-0 right-0 z-50"
            style={{
              bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
              maxHeight: '70vh',
              borderRadius: '20px 20px 0 0',
              backgroundColor: 'rgba(19, 23, 32, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(30, 38, 56, 0.6)',
              borderBottom: 'none',
              boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.4), 0 -2px 12px rgba(0, 0, 0, 0.2)',
              transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'rgba(160, 152, 136, 0.3)' }} />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b6358' }}>
                All Views
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenSearch(); handleCloseSheet(); }}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ color: '#d4a574', backgroundColor: 'rgba(212, 165, 116, 0.08)' }}
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseSheet(); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: 'rgba(160, 152, 136, 0.1)', color: '#6b6358' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 px-4 pb-5" onClick={(e) => e.stopPropagation()}>
              {moreTabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = currentView === tab.view;
                const isPressed = pressedTab === tab.view;

                return (
                  <button
                    key={tab.view}
                    onClick={() => handleMoreNav(tab.view)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${isPressed ? 'mobile-nav-press' : ''}`}
                    style={{
                      backgroundColor: isActive ? 'rgba(212, 165, 116, 0.12)' : 'rgba(28, 34, 48, 0.4)',
                      color: isActive ? '#d4a574' : '#a09888',
                      border: `1px solid ${isActive ? 'rgba(212, 165, 116, 0.2)' : 'transparent'}`,
                      opacity: sheetVisible ? 1 : 0,
                      transform: sheetVisible ? 'translateY(0)' : 'translateY(12px)',
                      transition: `all 0.3s ease-out ${Math.min(index * 0.02, 0.3)}s`,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium leading-tight text-center">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation Bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          backgroundColor: 'rgba(19, 23, 32, 0.78)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(30, 38, 56, 0.5)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div className="flex items-center justify-center pt-1.5" style={{ height: 16 }}>
          <span className="text-[9px] font-medium tracking-wider uppercase" style={{ color: 'rgba(160, 152, 136, 0.4)' }}>
            {currentLabel}
          </span>
        </div>

        <div className="flex items-center justify-around px-2 max-w-lg mx-auto" style={{ height: 56 }}>
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.view;
            const isPressed = pressedTab === tab.view;

            return (
              <button
                key={tab.view}
                onClick={() => handlePrimaryNav(tab.view)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px] ${isPressed ? 'mobile-nav-press' : ''}`}
                style={{ color: isActive ? '#d4a574' : '#6b6358', transition: 'color 0.2s ease-out' }}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 transition-all" style={{ filter: isActive ? 'drop-shadow(0 0 6px rgba(212, 165, 116, 0.5))' : 'none', transition: 'filter 0.25s ease-out' }} />
                </div>
                <span className="text-[10px] transition-all" style={{ fontWeight: isActive ? 600 : 500, transition: 'font-weight 0.2s ease-out' }}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#d4a574', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(212, 165, 116, 0.6), 0 0 16px rgba(212, 165, 116, 0.3)', animation: 'mobileNavGlowPulse 2.5s ease-in-out infinite' }} />
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => { handleTabPress('more'); if (showMore) { handleCloseSheet(); } else { setShowMore(true); } }}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px] ${pressedTab === 'more' ? 'mobile-nav-press' : ''}`}
            style={{ color: isMoreActive || showMore ? '#d4a574' : '#6b6358', transition: 'color 0.2s ease-out' }}
          >
            <div className="relative">
              {showMore ? (
                <ChevronDown className="w-5 h-5 transition-all" style={{ filter: isMoreActive ? 'drop-shadow(0 0 6px rgba(212, 165, 116, 0.5))' : 'none', transform: 'rotate(180deg)', transition: 'filter 0.25s ease-out, transform 0.3s ease-out' }} />
              ) : (
                <MoreHorizontal className="w-5 h-5 transition-all" style={{ filter: isMoreActive ? 'drop-shadow(0 0 6px rgba(212, 165, 116, 0.5))' : 'none', transition: 'filter 0.25s ease-out' }} />
              )}
            </div>
            <span className="text-[10px] transition-all" style={{ fontWeight: isMoreActive || showMore ? 600 : 500, transition: 'font-weight 0.2s ease-out' }}>
              More
            </span>
            {isMoreActive && !showMore && (
              <div className="absolute -bottom-0.5 left-1/2" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#d4a574', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(212, 165, 116, 0.6), 0 0 16px rgba(212, 165, 116, 0.3)', animation: 'mobileNavGlowPulse 2.5s ease-in-out infinite' }} />
            )}
          </button>
        </div>

        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>
    </>
  );
}
