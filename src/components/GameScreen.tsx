import React, { useState, useEffect, useRef } from 'react';
import { Settings, Menu } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
// Audio system is available via soundUtils when needed

// Layout Components
import LandscapeLayoutClean from './layouts/LandscapeLayoutClean';
import PortraitLayout from './PortraitLayout';
import MenuArea from './MenuArea';
import SettingsDrawerContent from './SettingsDrawerContent';

// Utility Functions
import { DeviceDetection } from '../utils/deviceDetection';
import { DrawerManager } from '../utils/drawerManager';
import { TouchHandler } from '../utils/touchHandler';

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
      const detection = DeviceDetection.getCurrentLayout();
      setCurrentLayout(detection);
      console.log('📱 Layout detected:', detection);
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
  }, []);

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
    
    return () => {
      drawerManager.cleanup();
    };
  }, [isMenuDrawerOpen, isSettingsDrawerOpen, currentLayout]);

  // ==========================================
  // TOUCH/SWIPE HANDLING (delegated to utility)
  // ==========================================
  useEffect(() => {
    if (!gameScreenRef.current) return;

    const touchHandler = new TouchHandler({
      element: gameScreenRef.current,
      onSwipeLeft: () => setIsMenuDrawerOpen(true),
      onSwipeRight: () => setIsSettingsDrawerOpen(true),
      currentLayout
    });

    return () => {
      touchHandler.cleanup();
    };
  }, [currentLayout]);

  // ==========================================
  // SETTINGS DRAWER SWIPE-TO-CLOSE
  // ==========================================
  useEffect(() => {
    if (!isSettingsDrawerOpen) return;

    const settingsDrawer = document.querySelector('.settings-drawer') as HTMLElement;
    if (!settingsDrawer) return;

    const handleSwipeLeft = (e: TouchEvent) => {
      const startX = e.touches[0]?.clientX;
      if (!startX) return;

      const handleTouchEnd = (endEvent: TouchEvent) => {
        const endX = endEvent.changedTouches[0]?.clientX;
        if (!endX) return;

        const deltaX = endX - startX;
        if (deltaX < -50) { // Swipe left to close
          setIsSettingsDrawerOpen(false);
        }

        settingsDrawer.removeEventListener('touchend', handleTouchEnd);
      };

      settingsDrawer.addEventListener('touchend', handleTouchEnd);
    };

    settingsDrawer.addEventListener('touchstart', handleSwipeLeft);
    
    return () => {
      settingsDrawer.removeEventListener('touchstart', handleSwipeLeft);
    };
  }, [isSettingsDrawerOpen]);

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
          isMenuDrawerOpen={isMenuDrawerOpen}
          setIsMenuDrawerOpen={setIsMenuDrawerOpen}
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
        onClick={() => setIsSettingsDrawerOpen(true)}
        aria-label="Open Settings"
        >
          <Settings size={24} />
        </button>

      {/* Menu Button - Only visible in portrait mode (not in landscape) */}
      {currentLayout.orientation === 'portrait' && (
        <button
          className="drawer-toggle-top-right"
          onClick={() => setIsMenuDrawerOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Render appropriate layout */}
      {renderLayout()}

      {/* Settings Drawer - Exact copy of portrait mode structure */}
            <div className={`settings-drawer ${isSettingsDrawerOpen ? 'open' : ''}`}>
        <div className="menu-drawer-container">
          <div className="drawer-header">
            <button
              className="drawer-close"
              onClick={() => setIsSettingsDrawerOpen(false)}
              aria-label="Close Settings"
              style={{
                position: 'fixed',
                top: 'calc(20px + env(safe-area-inset-top))',
                left: 'calc(20px + env(safe-area-inset-left))',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                width: '48px',
                height: '48px',
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
              ‹
            </button>
          </div>
          <div className="drawer-content">
            <SettingsDrawerContent />
          </div>
        </div>
      </div>

      {/* Menu Drawer - Only in portrait mode */}
      {currentLayout.orientation === 'portrait' && (
              <div className={`mobile-drawer ${isMenuDrawerOpen ? 'open' : ''}`}>
          <div className="menu-drawer-container">
                <div className="drawer-header">
                  <button
                    className="drawer-close"
                    onClick={() => setIsMenuDrawerOpen(false)}
                aria-label="Close Menu"
                  >
                ✕
                  </button>
                </div>
                      <div className="drawer-content">
            <MenuArea onClose={() => setIsMenuDrawerOpen(false)} />
                  </div>
                  </div>
                  </div>
      )}

      {/* Drawer Overlays */}
      {isSettingsDrawerOpen && (
        <div
          className="settings-drawer-overlay open"
          onClick={() => setIsSettingsDrawerOpen(false)}
        />
      )}
      {isMenuDrawerOpen && currentLayout.orientation === 'portrait' && (
        <div
          className="mobile-drawer-overlay open"
          onClick={() => setIsMenuDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default GameScreen; 