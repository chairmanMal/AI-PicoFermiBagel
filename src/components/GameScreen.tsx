import React, { useState, useEffect, useRef } from 'react';
import { Settings, Menu } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
// Audio system is available via soundUtils when needed

// Layout Components
import LandscapeLayoutClean from './layouts/LandscapeLayoutClean';
import PortraitLayout from './PortraitLayout';
import SettingsDrawerContent from './SettingsDrawerContent';
import MenuDrawerContent from './MenuDrawerContent';

// Utility Functions
import { DeviceDetection } from '../utils/deviceDetection';
import { DrawerManager } from '../utils/drawerManager';

import './GameScreen.css';

const GameScreen: React.FC = () => {
  // ==========================================
  // CORE RESPONSIBILITY 1: GAME STATE INTEGRATION
  // ==========================================
  const { resetAllSettings } = useGameStore();

  // ==========================================
  // CORE RESPONSIBILITY 2: LAYOUT DETECTION & MANAGEMENT
  // ==========================================
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());

  // Drawer state (managed by DrawerManager utility)
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  // Refs for layout components
  const guessElementRef = useRef<HTMLDivElement>(null);
  const gameScreenRef = useRef<HTMLDivElement>(null);
  const previousLayoutRef = useRef(currentLayout);

  // ==========================================
  // CORE RESPONSIBILITY 3: AUDIO SYSTEM
  // ==========================================
  useEffect(() => {
    console.log('🎵 Audio system initialized');
    // Audio system is initialized when soundUtils is imported
    // No additional initialization needed
  }, []);

  // ==========================================
  // LAYOUT DETECTION & MANAGEMENT
  // ==========================================
  useEffect(() => {
    const detectLayout = () => {
      const previousLayout = previousLayoutRef.current;
      const detection = DeviceDetection.getCurrentLayout();
      
      console.log('📱 Layout detected:', detection);
      console.log('📱 Previous layout:', previousLayout);
      
      // Close menu drawer when switching from landscape to portrait
      if (previousLayout.orientation === 'landscape' && detection.orientation === 'portrait') {
        console.log('📱 Orientation changed from landscape to portrait - closing menu drawer');
        setIsMenuDrawerOpen(false);
      }
      
      // Update refs and state
      previousLayoutRef.current = currentLayout;
      setCurrentLayout(detection);
    };

    // Initial detection
    detectLayout();

    // Listen for orientation changes
    const handleResize = () => {
      detectLayout();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []); // Remove currentLayout dependency to avoid circular updates

  // ==========================================
  // DRAWER MANAGEMENT (delegated to utility)
  // ==========================================
  useEffect(() => {
    const drawerManager = new DrawerManager({
      isMenuDrawerOpen,
      setIsMenuDrawerOpen,
      isSettingsDrawerOpen,
      setIsSettingsDrawerOpen,
      currentLayout
    });
    
    // Prevent background scrolling when menu drawer is open
    if (isMenuDrawerOpen && currentLayout.orientation === 'portrait') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      drawerManager.cleanup();
      document.body.style.overflow = ''; // Cleanup on unmount
    };
  }, [isMenuDrawerOpen, isSettingsDrawerOpen, currentLayout]);

  // ==========================================
  // SETTINGS DRAWER SWIPE-TO-CLOSE
  // ==========================================
  useEffect(() => {
    if (!isSettingsDrawerOpen) return;

    const settingsDrawer = document.querySelector('.settings-drawer') as HTMLElement;
    if (!settingsDrawer) return;

    const handleSwipeLeft = (e: TouchEvent) => {
    const touch = e.touches[0];
      if (!touch) return;

      const startX = touch.clientX;
      const drawerRect = settingsDrawer.getBoundingClientRect();
      
      // Only handle swipes that start within the drawer area
      if (startX < drawerRect.left || startX > drawerRect.right) {
      return;
    }
    
      const drawerContent = settingsDrawer.querySelector('.drawer-content') as HTMLElement;
      if (!drawerContent) return;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.changedTouches[0];
        if (!moveTouch) return;

        const currentX = moveTouch.clientX;
        const deltaX = currentX - startX;
        
        // Only apply visual feedback for leftward swipes
        if (deltaX < 0) {
          drawerContent.style.transform = `translateX(${deltaX}px)`;
          drawerContent.style.transition = 'none'; // Disable transition during drag
        }
      };

      const handleTouchEnd = (endEvent: TouchEvent) => {
        const endTouch = endEvent.changedTouches[0];
        if (!endTouch) return;

        const endX = endTouch.clientX;
        const deltaX = endX - startX;
        const swipeDistance = Math.abs(deltaX);
        const drawerWidth = drawerRect.width;
        
        // Reset visual feedback
        drawerContent.style.transform = '';
        drawerContent.style.transition = '';
        
        // Require swipe to traverse at least 50% of drawer width AND be leftward
        if (deltaX < 0 && swipeDistance >= (drawerWidth * 0.5)) {
          setIsSettingsDrawerOpen(false);
        }

        settingsDrawer.removeEventListener('touchend', handleTouchEnd);
        settingsDrawer.removeEventListener('touchmove', handleTouchMove);
      };

      settingsDrawer.addEventListener('touchend', handleTouchEnd);
      settingsDrawer.addEventListener('touchmove', handleTouchMove);
    };

    settingsDrawer.addEventListener('touchstart', handleSwipeLeft);

    return () => {
      settingsDrawer.removeEventListener('touchstart', handleSwipeLeft);
    };
  }, [isSettingsDrawerOpen]);

  // ==========================================
  // MENU DRAWER SWIPE-TO-CLOSE
  // ==========================================
  useEffect(() => {
    if (!isMenuDrawerOpen) return;

    const menuDrawer = document.querySelector('.mobile-drawer') as HTMLElement;
    if (!menuDrawer) return;

    const handleSwipeRight = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      const startX = touch.clientX;
      const drawerRect = menuDrawer.getBoundingClientRect();
      
      // Only handle swipes that start within the drawer area
      if (startX < drawerRect.left || startX > drawerRect.right) {
        return;
      }
      
      const drawerContent = menuDrawer.querySelector('.drawer-content') as HTMLElement;
      if (!drawerContent) return;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.changedTouches[0];
        if (!moveTouch) return;

        const currentX = moveTouch.clientX;
        const deltaX = currentX - startX;
        
        // Only apply visual feedback for rightward swipes
        if (deltaX > 0) {
          drawerContent.style.transform = `translateX(${deltaX}px)`;
          drawerContent.style.transition = 'none'; // Disable transition during drag
        }
      };

      const handleTouchEnd = (endEvent: TouchEvent) => {
        const endTouch = endEvent.changedTouches[0];
        if (!endTouch) return;

        const endX = endTouch.clientX;
        const deltaX = endX - startX;
        const swipeDistance = Math.abs(deltaX);
        const drawerWidth = drawerRect.width;
        
        // Reset visual feedback
        drawerContent.style.transform = '';
        drawerContent.style.transition = '';
        
        // Require swipe to traverse at least 50% of drawer width AND be rightward
        if (deltaX > 0 && swipeDistance >= (drawerWidth * 0.5)) {
          setIsMenuDrawerOpen(false);
        }

        menuDrawer.removeEventListener('touchend', handleTouchEnd);
        menuDrawer.removeEventListener('touchmove', handleTouchMove);
      };

      menuDrawer.addEventListener('touchend', handleTouchEnd);
      menuDrawer.addEventListener('touchmove', handleTouchMove);
    };

    menuDrawer.addEventListener('touchstart', handleSwipeRight);
    
    return () => {
      menuDrawer.removeEventListener('touchstart', handleSwipeRight);
    };
  }, [isMenuDrawerOpen]);

  // ==========================================
  // TOUCH OUTSIDE TO CLOSE DRAWERS - SIMPLE DARK AREA DETECTION
  // ==========================================
  // Note: The overlay elements handle this automatically via their onClick/onTouchStart handlers
  // This is much simpler than complex coordinate detection!

  // ==========================================
  // GAME STATE EFFECTS
  // ==========================================
  useEffect(() => {
    // Reset settings on startup if needed
    const shouldReset = localStorage.getItem('shouldResetOnStartup');
    if (shouldReset === 'true') {
      console.log('🔄 RESETTING ALL SETTINGS TO DEFAULTS ON STARTUP');
      resetAllSettings();
      localStorage.removeItem('shouldResetOnStartup');
      console.log('🔄 All settings and data reset to defaults');
    }
  }, [resetAllSettings]);

  // ==========================================
  // LAYOUT RENDERING
  // ==========================================
  const renderLayout = () => {
    const { orientation } = currentLayout;

    if (orientation === 'landscape') {
      // LANDSCAPE: Use LandscapeLayoutClean but settings drawer from GameScreen is available
      return <LandscapeLayoutClean guessElementRef={guessElementRef} />;
    } else {
      // PORTRAIT: Use PortraitLayout component
      return (
        <PortraitLayout
          guessElementRef={guessElementRef}
        />
      );
    }
  };

  return (
    <div
      ref={gameScreenRef}
      className="game-screen"
      data-layout={`${currentLayout.device}-${currentLayout.orientation}`}
    >
      {/* Settings Button - Always visible */}
        <button
          className="settings-button"
          onClick={() => {
          console.log('🔧 Settings button clicked - opening drawer');
            setIsSettingsDrawerOpen(true);
          }}
        aria-label="Open Settings"
        style={{
          position: 'fixed',
          top: 'calc(0px + env(safe-area-inset-top))', // Move up 25px from CSS default
          left: 'calc(10px + env(safe-area-inset-left))', // Move in 10px from CSS default
          background: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          touchAction: 'manipulation',
          zIndex: 1000,
          color: '#374151'
        }}
        ref={(el) => {
          if (el) {
            const rect = el.getBoundingClientRect();
            console.log('🔧 Settings OPEN button position:', {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              center: { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
            });
          }
        }}
        >
          <Settings size={24} />
        </button>

      {/* Menu Button - Only visible in portrait mode (not in landscape) */}
      {currentLayout.orientation === 'portrait' && (
        <button
          className="drawer-toggle-top-right"
          onClick={() => {
            console.log('🍔 Hamburger button clicked - opening menu drawer');
            setIsMenuDrawerOpen(true);
          }}
          aria-label="Open Menu"
          style={{ 
            position: 'fixed',
            top: 'calc(0px + env(safe-area-inset-top))', // Move up 25px from CSS default
            right: 'calc(10px + env(safe-area-inset-right))', // Move in 10px from CSS default
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
            zIndex: 100,
            color: '#374151'
          }}
          ref={(el) => {
            if (el) {
              const rect = el.getBoundingClientRect();
              console.log('🍔 Hamburger OPEN button position:', {
                top: rect.top,
                right: window.innerWidth - rect.right,
                width: rect.width,
                height: rect.height,
                center: { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
              });
            }
          }}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Render appropriate layout */}
      {renderLayout()}

      {/* Settings Drawer - Enhanced styling for better portrait mode experience */}
      <div className={`settings-drawer ${isSettingsDrawerOpen ? 'open' : ''}`}>
        <div className="menu-drawer-container">
          <div className="drawer-header">
        <button
              className="drawer-close"
              onClick={() => {
                console.log('❌ Settings close button clicked - closing drawer');
                setIsSettingsDrawerOpen(false);
              }}
              aria-label="Close Settings"
          style={{ 
                position: 'fixed',
                top: 'calc(0px + env(safe-area-inset-top))', // Moved up 25px from 10px (can't go negative)
                left: 'calc(10px + env(safe-area-inset-left))', // Keep same horizontal position
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '8px',
                padding: '10px', // MATCH settings button: 10px not 12px
                width: '40px', // MATCH settings button: 40px not 48px
                height: '40px', // MATCH settings button: 40px not 48px
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation',
                zIndex: 6000,
                fontSize: '24px', // SAME size as settings icon
                color: '#374151'
              }}
              ref={(el) => {
                if (el && isSettingsDrawerOpen) {
                  const rect = el.getBoundingClientRect();
                  console.log('🔧 Settings close button position:', {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    center: { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
                  });
                }
              }}
            >
              ‹
        </button>
        </div>
          <div className="drawer-content" style={{
            background: 'transparent', // TRANSPARENT background
            borderRadius: '0 12px 0 0',
            padding: '15px',
            paddingTop: '25px', // 10px gap below close icon + 15px padding = 25px total
            paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
            paddingLeft: 'calc(10px + env(safe-area-inset-left) + 20px)', // Align left edge with CENTER of close icon (10px + 20px = center of 40px button)
                    display: 'flex',
                    flexDirection: 'column',
            gap: '15px'
          }}
          ref={(el) => {
            if (el && isSettingsDrawerOpen) {
              const rect = el.getBoundingClientRect();
              const computedStyle = window.getComputedStyle(el);
              console.log('🔧 Settings drawer content position:', {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                paddingLeft: computedStyle.paddingLeft,
                calculatedPaddingLeft: `calc(10px + env(safe-area-inset-left) + 20px)`,
                safeAreaInsetLeft: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)')
              });
            }
          }}>
            <SettingsDrawerContent />
                    </div>
                  </div>
                  </div>

      {/* Menu Drawer - Enhanced for portrait mode with MenuDrawerContent */}
      {currentLayout.orientation === 'portrait' && (
        <div className={`mobile-drawer ${isMenuDrawerOpen ? 'open' : ''}`} style={{
          background: 'transparent !important',
          width: (() => {
            // EXTEND TO ORANGE BORDER - Match content width calculation
            const viewportWidth = window.innerWidth;
            const safeAreaRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0');
            const orangeBorderLeft = 5;
            const drawerRightEdge = 5 + safeAreaRight;
            const availableWidth = viewportWidth - orangeBorderLeft - drawerRightEdge;
            return `${availableWidth + 20}px`; // Add 20px for container padding
          })(),
          maxWidth: 'none',
          minWidth: '280px'
        }}>
          <div className="menu-drawer-container" style={{
            background: 'transparent !important',
            zIndex: 1002
          }}>
            <div className="drawer-header" style={{
                  background: 'transparent',
              padding: '0',
              margin: '0'
            }}>
              <button
                className="drawer-close"
                onClick={() => {
                  console.log('❌ Menu close button clicked - closing drawer');
                  setIsMenuDrawerOpen(false);
                }}
                aria-label="Close Menu"
                style={{
                  position: 'fixed',
                  top: 'calc(0px + env(safe-area-inset-top))',
                  right: 'calc(10px + env(safe-area-inset-right))',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.2s ease',
                  touchAction: 'manipulation',
                  zIndex: 6000,
                  fontSize: '24px',
                  color: '#374151'
                }}
              >
                ›
              </button>
                    </div>
            <div className="drawer-content" style={{
              position: 'fixed',
              top: '111px', // 51px (icon top) + 40px (icon height) + 20px (gap) = 111px
              left: '15px',
              right: '30px', // Right edge aligns with hamburger icon centerline (375-345=30)
              height: '500px', // Increased height to cover entire Score element including game details
              background: 'white',
              borderRadius: '12px',
              border: '3px solid #ff0000', // RED BORDER
              padding: '0',
              overflow: 'hidden',
              zIndex: 1002,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column'
            }}
            ref={(el) => {
              if (el) {
                const rect = el.getBoundingClientRect();
                const drawerWidth = rect.width; // This is 'x' - actual drawer width
                const contentWidth = 420; // From MenuDrawerContent minWidth - this is natural content width
                const greenBorderWidth = rect.width; // Full width now (no margins) = 'y'
                const requiredScale = Math.max(0.5, Math.min(1.0, greenBorderWidth / contentWidth));
                
                console.log('📏 DRAWER SIZING ANALYSIS:', {
                  drawerWidth: `${drawerWidth}px (x)`,
                  greenBorderWidth: `${greenBorderWidth}px (y)`,
                  contentWidth: `${contentWidth}px (natural content width)`,
                  requiredScale: `${requiredScale} (y/x ratio)`,
                  calculation: `${greenBorderWidth} / ${contentWidth} = ${requiredScale}`
                });
              }
            }}>
              <div style={{
                border: '2px solid #00ff00', // GREEN BORDER
                borderRadius: '8px',
                margin: '0', // No margin - expand to red border
                padding: '10px',
                paddingRight: '25px', // Extra padding for scrollbar space
                background: 'white',
                height: '100%', // Full height to cover entire Score element
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                position: 'relative',
                transform: (() => {
                  // Calculate scaling based on available width (no margins now)
                  const availableWidth = window.innerWidth - 15 - 30; // left margin + right margin only
                  const naturalContentWidth = 420; // From MenuDrawerContent
                  const scale = Math.max(0.5, Math.min(1.0, availableWidth / naturalContentWidth));
                  console.log('🔍 SCALING CALCULATION:', {
                    availableWidth: `${availableWidth}px`,
                    naturalContentWidth: `${naturalContentWidth}px`,
                    scale: `${scale}`,
                    transform: `scale(${scale})`
                  });
                  return `scale(${scale})`;
                })(),
                transformOrigin: 'top left',
                width: '420px' // Set to natural content width, then scale
              }}>
                <div style={{
                  width: '395px', // Slightly less than 420px to accommodate scrollbar
                  minHeight: '100%'
                }}>
                  <MenuDrawerContent />
              </div>
              </div>
              </div>
              </div>
            </div>
      )}

      {/* Drawer Overlays - MAXIMUM COVERAGE - Enhanced with better debugging and coverage */}
      {isSettingsDrawerOpen && (
        <div
          className="settings-drawer-overlay open"
          onClick={(e) => {
            console.log('🎯 Settings overlay clicked - closing drawer');
            e.preventDefault();
            e.stopPropagation();
            setIsSettingsDrawerOpen(false);
          }}
          onTouchStart={(e) => {
            console.log('🎯 Settings overlay touched - closing drawer');
            e.preventDefault();
            e.stopPropagation();
            setIsSettingsDrawerOpen(false);
          }}
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            width: '100vw',
            height: '100vh',
            minWidth: '100vw',
            minHeight: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 3999,
            pointerEvents: 'auto',
            touchAction: 'none',
            cursor: 'pointer',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        />
      )}
      {isMenuDrawerOpen && currentLayout.orientation === 'portrait' && (
        <div
          className="mobile-drawer-overlay open"
          onClick={(e) => {
            console.log('🎯 Menu overlay clicked - closing drawer');
            e.preventDefault();
            e.stopPropagation();
            setIsMenuDrawerOpen(false);
          }}
          onTouchStart={(e) => {
            console.log('🎯 Menu overlay touched - closing drawer');
            e.preventDefault();
            e.stopPropagation();
            setIsMenuDrawerOpen(false);
          }}
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            width: '100vw',
            height: '100vh',
            minWidth: '100vw',
            minHeight: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            pointerEvents: 'auto',
            touchAction: 'none',
            cursor: 'pointer',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        />
      )}
    </div>
  );
};

export default GameScreen; 