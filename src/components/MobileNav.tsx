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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ViewType } from '@/lib/data';

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

/* --- All tab views for indicator index calculation --- */
const allPrimaryViews = primaryTabs.map((t) => t.view);

/* --- Resolve current view label --- */
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
  const [longPressTab, setLongPressTab] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [closeRotation, setCloseRotation] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMoreActive = moreTabs.some((t) => t.view === currentView);
  const currentLabel = getViewLabel(currentView);

  /* --- Sliding indicator position --- */
  const activeIndex = useMemo(() => {
    const idx = allPrimaryViews.indexOf(currentView as ViewType);
    if (idx >= 0) return idx;
    if (isMoreActive) return 4; // "More" position
    return -1;
  }, [currentView, isMoreActive]);

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

  // Show swipe hint after first mount, then hide
  useEffect(() => {
    swipeHintTimerRef.current = setTimeout(() => {
      setShowSwipeHint(true);
      setTimeout(() => setShowSwipeHint(false), 3500);
    }, 2000);
    return () => {
      if (swipeHintTimerRef.current) clearTimeout(swipeHintTimerRef.current);
    };
  }, []);

  const handleCloseSheet = useCallback(() => {
    setCloseRotation(true);
    setSheetVisible(false);
    setTimeout(() => {
      setShowMore(false);
      setCloseRotation(false);
    }, 280);
  }, []);

  const handleTabPress = useCallback((viewId: string) => {
    setPressedTab(viewId);
    setTimeout(() => setPressedTab(null), 120);
  }, []);

  // Long-press handlers for haptic-style visual feedback
  const handleTouchStart = useCallback((viewId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressTab(viewId);
      // Reset after visual feedback completes
      setTimeout(() => setLongPressTab(null), 400);
    }, 300);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Cleanup long press timer
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
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

  /* --- Compute indicator translate --- */
  const indicatorStyle = useMemo(() => {
    if (activeIndex < 0) return { opacity: 0 };
    // Each tab is evenly spaced across 5 slots (4 primary + 1 more)
    // Position is percentage-based within the flex container
    const totalTabs = 5;
    const slotWidth = 100 / totalTabs;
    const translateX = slotWidth * activeIndex + slotWidth / 2;
    return {
      opacity: 1,
      left: `${translateX}%`,
      transform: 'translateX(-50%)',
      transition: 'left 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease-out, width 0.2s ease-out',
    };
  }, [activeIndex]);

  return (
    <>
      <style>{`
        @keyframes mobileNavSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes dotBounce {
          0% { transform: translateX(-50%) scale(0); }
          60% { transform: translateX(-50%) scale(1.3); }
          100% { transform: translateX(-50%) scale(1); }
        }
        @keyframes sheetSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes itemStagger {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileNavGlowPulse {
          0%, 100% { box-shadow: 0 0 6px rgba(212, 165, 116, 0.4), 0 0 12px rgba(212, 165, 116, 0.15); }
          50% { box-shadow: 0 0 10px rgba(212, 165, 116, 0.7), 0 0 20px rgba(212, 165, 116, 0.3); }
        }
        @keyframes indicatorGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes closeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(90deg); }
        }
        @keyframes longPressRipple {
          0% { transform: scale(0.8); opacity: 0.6; box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
          40% { transform: scale(1.05); opacity: 0.8; box-shadow: 0 0 0 8px rgba(212, 165, 116, 0); }
          100% { transform: scale(1); opacity: 0; box-shadow: 0 0 0 12px rgba(212, 165, 116, 0); }
        }
        @keyframes indicatorStretch {
          0% { width: 20px; }
          30% { width: 32px; }
          100% { width: 20px; }
        }
        @keyframes swipeHintSlide {
          0% { opacity: 0; transform: translateX(8px); }
          15% { opacity: 1; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(-16px); }
          65% { opacity: 1; transform: translateX(0); }
          85% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(8px); }
        }
        @keyframes swipeArrowBounce {
          0%, 100% { transform: translateX(0); opacity: 0.4; }
          50% { transform: translateX(-4px); opacity: 1; }
        }
        .mnav-tab-press {
          transform: scale(0.92) !important;
          transition: transform 0.06s ease-out !important;
        }
        .mnav-tab-release {
          transform: scale(1);
          transition: transform 0.15s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mnav-long-press {
          position: relative;
        }
        .mnav-long-press::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 48px;
          height: 48px;
          margin: -24px 0 0 -24px;
          border-radius: 50%;
          background: rgba(212, 165, 116, 0.15);
          animation: longPressRipple 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          pointer-events: none;
        }
        .mnav-sheet-item {
          animation: itemStagger 0.28s cubic-bezier(0.32, 0.72, 0, 1) both;
        }
        .mnav-close-spin {
          animation: closeRotate 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        .mnav-sheet-item-hover {
          transition: background-color 0.15s ease-out, transform 0.15s ease-out, border-color 0.15s ease-out;
        }
        .mnav-sheet-item-hover:active {
          transform: scale(0.96);
          transition: transform 0.06s ease-out;
        }
        .mnav-indicator-transitioning {
          animation: indicatorStretch 0.35s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .mnav-swipe-hint {
          animation: swipeHintSlide 3s ease-in-out forwards;
        }
        .mnav-swipe-arrow {
          animation: swipeArrowBounce 1s ease-in-out infinite;
        }
      `}</style>

      {/* -- Slide-up sheet overlay -- */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={handleCloseSheet}
        >
          {/* Backdrop blur + dim */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px) saturate(120%)',
              WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              opacity: sheetVisible ? 1 : 0,
              transition: 'opacity 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          />

          {/* Sheet panel */}
          <div
            ref={sheetRef}
            className="absolute left-0 right-0 z-50"
            style={{
              bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
              maxHeight: '70vh',
              borderRadius: '24px 24px 0 0',
              backgroundColor: 'rgba(14, 17, 26, 0.88)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              borderTop: '1px solid rgba(212, 165, 116, 0.1)',
              borderLeft: '1px solid rgba(30, 38, 56, 0.4)',
              borderRight: '1px solid rgba(30, 38, 56, 0.4)',
              boxShadow: '0 -12px 48px rgba(0, 0, 0, 0.5), 0 -4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
              transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-[5px] rounded-full"
                style={{ backgroundColor: 'rgba(160, 152, 136, 0.25)' }}
              />
            </div>

            {/* Header with search and close */}
            <div className="flex items-center justify-between px-5 pb-3 pt-1">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'rgba(160, 152, 136, 0.5)' }}
              >
                All Views
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenSearch(); handleCloseSheet(); }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                  style={{
                    color: '#d4a574',
                    backgroundColor: 'rgba(212, 165, 116, 0.08)',
                    border: '1px solid rgba(212, 165, 116, 0.1)',
                    transition: 'all 0.15s ease-out',
                  }}
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseSheet(); }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${closeRotation ? 'mnav-close-spin' : ''}`}
                  style={{
                    backgroundColor: 'rgba(160, 152, 136, 0.08)',
                    color: 'rgba(160, 152, 136, 0.6)',
                    border: '1px solid rgba(160, 152, 136, 0.08)',
                    transition: 'all 0.15s ease-out',
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid of more tabs with stagger animation */}
            <div className="grid grid-cols-3 gap-2 px-4 pb-6" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }} onClick={(e) => e.stopPropagation()}>
              {moreTabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = currentView === tab.view;
                const isPressed = pressedTab === tab.view;

                return (
                  <button
                    key={tab.view}
                    onClick={() => handleMoreNav(tab.view)}
                    className={`mnav-sheet-item mnav-sheet-item-hover flex flex-col items-center gap-2 p-3.5 rounded-2xl ${isPressed ? 'mnav-tab-press' : ''}`}
                    style={{
                      backgroundColor: isActive
                        ? 'rgba(212, 165, 116, 0.12)'
                        : 'rgba(28, 34, 48, 0.35)',
                      color: isActive ? '#d4a574' : 'rgba(160, 152, 136, 0.7)',
                      border: `1px solid ${isActive ? 'rgba(212, 165, 116, 0.2)' : 'rgba(30, 38, 56, 0.3)'}`,
                      boxShadow: isActive
                        ? '0 0 16px rgba(212, 165, 116, 0.08), inset 0 1px 0 rgba(212, 165, 116, 0.06)'
                        : 'inset 0 1px 0 rgba(255, 255, 255, 0.02)',
                      animationDelay: `${0.03 + index * 0.035}s`,
                    }}
                  >
                    <div className="relative">
                      <Icon
                        className="w-[22px] h-[22px]"
                        style={{
                          filter: isActive
                            ? 'drop-shadow(0 0 8px rgba(212, 165, 116, 0.5))'
                            : 'none',
                          transition: 'filter 0.2s ease-out',
                        }}
                      />
                    </div>
                    <span
                      className="text-[11px] leading-tight text-center"
                      style={{ fontWeight: isActive ? 600 : 500 }}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -- Bottom Navigation Bar -- */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          backgroundColor: 'rgba(11, 13, 20, 0.65)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.4), 0 -2px 0 rgba(30, 38, 56, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          borderTop: '1px solid rgba(212, 165, 116, 0.06)',
          // Safe area padding for notch devices
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {/* Gradient top border: gold center fading to transparent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(212, 165, 116, 0.06) 15%, rgba(212, 165, 116, 0.3) 50%, rgba(212, 165, 116, 0.06) 85%, transparent 100%)',
          }}
        />

        {/* Current view label + swipe hint */}
        <div className="flex items-center justify-center pt-2 relative" style={{ height: 18 }}>
          <span
            className="text-[9px] font-semibold tracking-[0.15em] uppercase"
            style={{ color: 'rgba(160, 152, 136, 0.35)' }}
          >
            {currentLabel}
          </span>
          {/* Swipe gesture hint */}
          {showSwipeHint && (
            <div
              className="mnav-swipe-hint absolute right-4 flex items-center gap-1"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <ChevronLeft className="mnav-swipe-arrow w-3 h-3" style={{ color: 'rgba(212, 165, 116, 0.4)' }} />
              <span style={{ fontSize: 9, color: 'rgba(212, 165, 116, 0.4)', letterSpacing: '0.05em' }}>swipe</span>
              <ChevronRight className="mnav-swipe-arrow w-3 h-3" style={{ color: 'rgba(212, 165, 116, 0.4)', animationDelay: '0.15s' }} />
            </div>
          )}
        </div>

        {/* Tab row with sliding indicator */}
        <div className="relative flex items-center justify-around px-2 max-w-lg mx-auto" style={{ height: 62 }}>
          {/* --- Sliding pill indicator --- */}
          <div
            className="absolute"
            style={{
              bottom: 2,
              width: 20,
              height: 4,
              borderRadius: 3,
              backgroundColor: '#d4a574',
              ...indicatorStyle,
              animation: activeIndex >= 0 ? 'mobileNavGlowPulse 3s ease-in-out infinite' : 'none',
            }}
          >
            {/* Soft glow behind indicator */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 32,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 'rgba(212, 165, 116, 0.2)',
                filter: 'blur(6px)',
                animation: 'indicatorGlow 3s ease-in-out infinite',
              }}
            />
          </div>

          {/* Primary tabs */}
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.view;
            const isPressed = pressedTab === tab.view;
            const isLongPressed = longPressTab === tab.view;

            return (
              <button
                key={tab.view}
                onClick={() => handlePrimaryNav(tab.view)}
                onTouchStart={() => handleTouchStart(tab.view)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className={`relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl min-w-[60px] ${isPressed ? 'mnav-tab-press' : 'mnav-tab-release'} ${isLongPressed ? 'mnav-long-press' : ''}`}
                style={{
                  color: isActive ? '#d4a574' : 'rgba(107, 99, 88, 0.75)',
                  transition: 'color 0.15s ease-out, background 0.2s ease-out',
                  background: isActive ? 'rgba(212, 165, 116, 0.06)' : 'transparent',
                }}
              >
                <div
                  className="relative"
                  style={{
                    transform: isActive ? 'scale(1.15) translateY(-1px)' : 'scale(1)',
                    transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <Icon
                    className="w-[24px] h-[24px]"
                    strokeWidth={isActive ? 2.4 : 1.7}
                    style={{
                      filter: isActive
                        ? 'drop-shadow(0 0 8px rgba(212, 165, 116, 0.6)) drop-shadow(0 0 16px rgba(212, 165, 116, 0.2))'
                        : 'none',
                      transition: 'filter 0.25s ease-out',
                    }}
                  />
                </div>
                <span
                  className="text-[10px] leading-none"
                  style={{
                    fontWeight: isActive ? 650 : 500,
                    opacity: isActive ? 1 : 0.7,
                    transition: 'all 0.2s ease-out',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {tab.label}
                </span>
                {/* Active dot indicator */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#d4a574',
                      boxShadow: '0 0 6px rgba(212, 165, 116, 0.5)',
                      animation: 'dotBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                    }}
                  />
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => { handleTabPress('more'); if (showMore) { handleCloseSheet(); } else { setShowMore(true); } }}
            onTouchStart={() => handleTouchStart('more')}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={`relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl min-w-[60px] ${pressedTab === 'more' ? 'mnav-tab-press' : 'mnav-tab-release'} ${longPressTab === 'more' ? 'mnav-long-press' : ''}`}
            style={{
              color: isMoreActive || showMore ? '#d4a574' : 'rgba(107, 99, 88, 0.75)',
              transition: 'color 0.15s ease-out, background 0.2s ease-out',
              background: isMoreActive && !showMore ? 'rgba(212, 165, 116, 0.06)' : 'transparent',
            }}
          >
            <div
              className="relative"
              style={{
                transform: isMoreActive && !showMore ? 'scale(1.15) translateY(-1px)' : 'scale(1)',
                transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {showMore ? (
                <ChevronDown
                  className="w-[24px] h-[24px]"
                  strokeWidth={isMoreActive ? 2.4 : 1.7}
                  style={{
                    filter: isMoreActive
                      ? 'drop-shadow(0 0 8px rgba(212, 165, 116, 0.6)) drop-shadow(0 0 16px rgba(212, 165, 116, 0.2))'
                      : 'none',
                    transform: 'rotate(180deg)',
                    transition: 'filter 0.25s ease-out, transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                />
              ) : (
                <MoreHorizontal
                  className="w-[24px] h-[24px]"
                  strokeWidth={isMoreActive ? 2.4 : 1.7}
                  style={{
                    filter: isMoreActive
                      ? 'drop-shadow(0 0 8px rgba(212, 165, 116, 0.6)) drop-shadow(0 0 16px rgba(212, 165, 116, 0.2))'
                      : 'none',
                    transition: 'filter 0.25s ease-out',
                  }}
                />
              )}
            </div>
            <span
              className="text-[10px] leading-none"
              style={{
                fontWeight: isMoreActive || showMore ? 650 : 500,
                opacity: isMoreActive || showMore ? 1 : 0.7,
                transition: 'all 0.2s ease-out',
              }}
            >
              More
            </span>
            {/* Active dot indicator for More */}
            {isMoreActive && !showMore && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#d4a574',
                  boxShadow: '0 0 6px rgba(212, 165, 116, 0.5)',
                  animation: 'dotBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                }}
              />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
