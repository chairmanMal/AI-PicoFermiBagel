import React, { useState, useEffect, useRef } from 'react';
import { Settings, Menu } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
// Audio system is available via soundUtils when needed
import { soundUtils } from '../utils/soundUtils';


// Layout Components
import LandscapeLayoutClean from './layouts/LandscapeLayoutClean';
import PortraitLayout from './PortraitLayout';
import SettingsDrawerContent from './SettingsDrawerContent';
import MenuDrawerContent from './MenuDrawerContent';
import WinBanner from './WinBanner';
import LoseBanner from './LoseBanner';

// Utility Functions
import { DeviceDetection } from '../utils/deviceDetection';
import { DrawerManager } from '../utils/drawerManager';
import { getBackgroundGradient } from '../utils/gameLogic';

import './GameScreen.css';

const GameScreen: React.FC = () => {
  // ==========================================
  // CORE RESPONSIBILITY 1: GAME STATE INTEGRATION
  // ==========================================
  const { resetAllSettings, gameState, settings } = useGameStore();

  // ==========================================
  // CORE RESPONSIBILITY 2: LAYOUT DETECTION & MANAGEMENT
  // ==========================================
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());

  // Drawer state (managed by DrawerManager utility)
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  // Win banner state
  const [showWinBanner, setShowWinBanner] = useState(false);
  const [winBannerDismissed, setWinBannerDismissed] = useState(false);

  // Lose banner state
  const [showLoseBanner, setShowLoseBanner] = useState(false);
  const [loseBannerDismissed, setLoseBannerDismissed] = useState(false);

  // Settings drawer close handler
  const handleSettingsDrawerClose = () => {
    console.log('🔧 Settings drawer closing - will reset internal state');
    setIsSettingsDrawerOpen(false);
  };

  // Navigation handler for settings drawer
  const handleNavigateToMenu = () => {
    console.log('🔄 GameScreen: Navigating to menu from settings drawer');
    // Dispatch event to trigger navigation to menu
    window.dispatchEvent(new CustomEvent('navigateToMenu'));
  };

  // Refs for layout components
  const guessElementRef = useRef<HTMLDivElement>(null);
  const gameScreenRef = useRef<HTMLDivElement>(null);
  const previousLayoutRef = useRef(currentLayout);

  // ==========================================
  // WIN BANNER MANAGEMENT
  // ==========================================
  useEffect(() => {
    if (gameState?.isGameWon && !showWinBanner && !winBannerDismissed) {
      console.log('🎉 GameScreen: Game won - showing win banner');
      setShowWinBanner(true);
    } else if (!gameState?.isGameWon) {
      console.log('🎉 GameScreen: Game reset - resetting win banner state');
      setShowWinBanner(false);
      setWinBannerDismissed(false);
    }
  }, [gameState?.isGameWon, showWinBanner, winBannerDismissed]);

  const handleWinBannerDismiss = () => {
    console.log('🎉 GameScreen: Win banner dismissed by user');
    setShowWinBanner(false);
    setWinBannerDismissed(true); // Prevent re-showing for this win
  };

  // ==========================================
  // LOSE BANNER MANAGEMENT
  // ==========================================
  useEffect(() => {
    // Check if game is lost (score <= 0 and game is not active and not won)
    const isGameLost = gameState && !gameState.isGameActive && !gameState.isGameWon && gameState.score <= 0;
    
    if (isGameLost && !showLoseBanner && !loseBannerDismissed) {
      console.log('💀 GameScreen: Game lost - showing lose banner');
      setShowLoseBanner(true);
    } else if (!isGameLost) {
      console.log('💀 GameScreen: Game reset - resetting lose banner state');
      setShowLoseBanner(false);
      setLoseBannerDismissed(false);
    }
  }, [gameState?.isGameActive, gameState?.isGameWon, gameState?.score, showLoseBanner, loseBannerDismissed]);

  const handleLoseBannerDismiss = () => {
    console.log('💀 GameScreen: Lose banner dismissed by user');
    setShowLoseBanner(false);
    setLoseBannerDismissed(true); // Prevent re-showing for this loss
  };

  const getGameStats = () => {
    if (!gameState) return { targetNumber: '', guessCount: 0, timeElapsed: '0:00', score: 0 };
    
    const endTime = gameState.gameEndTime || new Date();
    const diffMs = endTime.getTime() - gameState.gameStartTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return {
      targetNumber: gameState.target.join(''),
      guessCount: gameState.guesses.length,
      timeElapsed: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      score: gameState.score
    };
  };

  // ==========================================
  // CORE RESPONSIBILITY 3: AUDIO SYSTEM
  // ==========================================
  useEffect(() => {
    // Auto-activate audio if sound is enabled by default
    const { settings } = useGameStore.getState();
    if (settings.soundEnabled) {
      // Set the volume level to match user settings
      soundUtils.setVolume(settings.soundVolume || 0.1);
      
      soundUtils.activateAudio().catch(error => {
        console.error('🎵 ❌ Failed to auto-activate audio on app start:', error);
      });
    }
  }, []);

  // ==========================================
  // LAYOUT DETECTION & MANAGEMENT
  // ==========================================
  useEffect(() => {
    const detectLayout = () => {
      const previousLayout = previousLayoutRef.current;
      const detection = DeviceDetection.getCurrentLayout();
      
        // console.log('📱 Layout detected:', detection);
  // console.log('📱 Previous layout:', previousLayout);
      
      // Close menu drawer when switching from landscape to portrait
      if (previousLayout.orientation === 'landscape' && detection.orientation === 'portrait') {
        console.log('📱 Orientation changed from landscape to portrait - closing menu drawer');
        setIsMenuDrawerOpen(false);
      }
      
      // Update refs and state
      previousLayoutRef.current = detection; // Use detection instead of currentLayout
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
  // SHARED SWIPE-TO-CLOSE UTILITY
  // ==========================================
  const createSwipeToClose = (
    drawerElement: HTMLElement,
    onClose: () => void,
    swipeDirection: 'left' | 'right'
  ) => {
    let startX = 0;
    let startY = 0;
    let isTrackingSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      startX = touch.clientX;
      startY = touch.clientY;
      isTrackingSwipe = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const deltaX = currentX - startX;
      const deltaY = Math.abs(currentY - startY);

      // Only track horizontal swipes if they're more horizontal than vertical
      if (!isTrackingSwipe && Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
        isTrackingSwipe = true;
      }

      // Prevent default for swipes in the close direction
      const shouldPreventDefault = swipeDirection === 'left' ? deltaX < 0 : deltaX > 0;
      if (isTrackingSwipe && shouldPreventDefault) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch || !isTrackingSwipe) return;

      const endX = touch.clientX;
      const deltaX = endX - startX;
      const swipeDistance = Math.abs(deltaX);
      
      // For menu drawer, use the visible content width instead of container width
      let drawerWidth = drawerElement.getBoundingClientRect().width;
      if (swipeDirection === 'right') {
        // Menu drawer: find the actual visible content
        const visibleContent = drawerElement.querySelector('.drawer-content') as HTMLElement;
        if (visibleContent) {
          drawerWidth = visibleContent.getBoundingClientRect().width;
        }
      }
      
      // Check if swipe is in the correct direction and covers 40% of drawer width
      const isCorrectDirection = swipeDirection === 'left' ? deltaX < 0 : deltaX > 0;
      const threshold = drawerWidth * 0.4; // 40% threshold for swipe-to-close
      if (isCorrectDirection && swipeDistance >= threshold) {
        onClose();
      }

      isTrackingSwipe = false;
    };

    drawerElement.addEventListener('touchstart', handleTouchStart);
    drawerElement.addEventListener('touchmove', handleTouchMove);
    drawerElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      drawerElement.removeEventListener('touchstart', handleTouchStart);
      drawerElement.removeEventListener('touchmove', handleTouchMove);
      drawerElement.removeEventListener('touchend', handleTouchEnd);
    };
  };

  // ==========================================
  // SETTINGS DRAWER SWIPE-TO-CLOSE
  // ==========================================
  useEffect(() => {
    if (!isSettingsDrawerOpen) return;

    const settingsDrawer = document.querySelector('.settings-drawer') as HTMLElement;
    if (!settingsDrawer) {
      return;
    }

    return createSwipeToClose(settingsDrawer, () => setIsSettingsDrawerOpen(false), 'left');
  }, [isSettingsDrawerOpen]);

  // ==========================================
  // MENU DRAWER SWIPE-TO-CLOSE (SET UP FROM HAMBURGER BUTTON CLICK)
  // ==========================================
  // Note: Swipe-to-close is now set up when the hamburger button is clicked,
  // ensuring the drawer is fully rendered before attaching event listeners.

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
      // console.log('🔄 RESETTING ALL SETTINGS TO DEFAULTS ON STARTUP');
      resetAllSettings();
      localStorage.removeItem('shouldResetOnStartup');
      // console.log('🔄 All settings and data reset to defaults');
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
      style={{
        background: getBackgroundGradient(settings.backgroundColor)
      }}
    >
      {/* Settings Button - Always visible */}
        <button
          className="settings-button"
          onClick={() => {
          console.log('🔧 Settings button clicked - opening drawer');
            // Close menu drawer if open, then open settings drawer
            if (isMenuDrawerOpen) {
              console.log('🔧 Closing menu drawer first');
              setIsMenuDrawerOpen(false);
            }
            setIsSettingsDrawerOpen(true);
          }}
        aria-label="Open Settings"
        style={{
          position: 'fixed',
          top: currentLayout.isIpadPortrait 
            ? 'calc(10px + env(safe-area-inset-top))' // Move down 10px for iPad portrait only
            : 'calc(0px + env(safe-area-inset-top))', // Normal position for iPhone
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
            // Close settings drawer if open, then open menu drawer
            if (isSettingsDrawerOpen) {
              console.log('🍔 Closing settings drawer first');
              setIsSettingsDrawerOpen(false);
            }
            setIsMenuDrawerOpen(true);
          }}
          aria-label="Open Menu"
          style={{ 
            position: 'fixed',
            top: currentLayout.isIpadPortrait 
              ? 'calc(10px + env(safe-area-inset-top))' // Move down 10px for iPad portrait only
              : 'calc(0px + env(safe-area-inset-top))', // Normal position for iPhone
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

      {/* Win Banner - Shows when game is won */}
      <WinBanner
        isVisible={showWinBanner}
        onDismiss={handleWinBannerDismiss}
        gameStats={getGameStats()}
      />

      {/* Lose Banner - Shows when game is lost (score <= 0) */}
      <LoseBanner
        isVisible={showLoseBanner}
        onDismiss={handleLoseBannerDismiss}
        gameStats={getGameStats()}
      />

      {/* Settings Drawer - Enhanced styling for better portrait mode experience */}
      {isSettingsDrawerOpen && (
        <div className="menu-drawer-container" style={{
          height: 'auto', // Override CSS height: 100% to allow content-based sizing
          minHeight: '0' // Override any min-height to allow shrinking
        }}>
          <div className="drawer-header">
            <button
              className="drawer-close"
              onClick={handleSettingsDrawerClose}
              aria-label="Close Settings"
              style={{ 
                position: 'fixed',
                top: currentLayout.isIpadPortrait 
                  ? 'calc(10px + env(safe-area-inset-top))' // Move down 10px for iPad portrait only
                  : 'calc(0px + env(safe-area-inset-top))', // Normal position for iPhone
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
            position: 'fixed',
            top: 'calc(0px + env(safe-area-inset-top) + 40px + 20px)', // Icon top + icon height + 20px gap
            left: 'calc(10px + env(safe-area-inset-left) + 20px)', // Settings icon left + icon width/2 (center line)
            width: '280px', // Reduced width for iPhone
            height: 'auto', // Dynamic height like menu drawer
            maxHeight: 'calc(100vh - 120px)', // Prevent extending off screen
            background: 'white',
            borderRadius: '12px',
            // border: '3px solid #ff0000', // RED BORDER for visual debugging - DISABLED
            padding: '0', // Remove all padding to align borders perfectly
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            overflow: 'auto',
            zIndex: 5000,
            display: 'flex',
            flexDirection: 'column'
          }}
          ref={(el) => {
            if (el && isSettingsDrawerOpen) {
              const rect = el.getBoundingClientRect();
              const screenHeight = window.innerHeight;
              const drawerBottom = rect.top + rect.height;
              
              // Get the actual closing icon position
              const closeButton = document.querySelector('.settings-drawer .drawer-close') as HTMLElement;
              const closeButtonRect = closeButton?.getBoundingClientRect();
              const iconBottom = closeButtonRect ? closeButtonRect.bottom : 50; // fallback
              const gap = 10;
              const bottomMargin = 50; // 30px original + 20px reduction = 50px total
              const expectedDrawerTop = iconBottom + gap;
              const chosenHeight = screenHeight - expectedDrawerTop - bottomMargin;
              
              console.log('🔧 Settings drawer DEBUG:', {
                screenHeight: screenHeight,
                iconBottom: iconBottom,
                expectedDrawerTop: expectedDrawerTop,
                actualDrawerTop: rect.top,
                drawerHeight: rect.height,
                drawerBottom: drawerBottom,
                distanceFromBottom: screenHeight - drawerBottom,
                chosenHeight: chosenHeight,
                actualHeight: rect.height,
                PROBLEM: drawerBottom > screenHeight ? 'DRAWER EXTENDS OFF SCREEN!' : 'OK',
                POSITIONING: Math.abs(rect.top - expectedDrawerTop) > 2 ? 'DRAWER NOT POSITIONED 10PX BELOW ICON!' : 'OK'
              });
            }
          }}>
            <SettingsDrawerContent 
              key={isSettingsDrawerOpen ? 'open' : 'closed'} 
              onClose={handleSettingsDrawerClose}
              onNavigateToMenu={handleNavigateToMenu}
            />
          </div>
        </div>
      )}

      {/* Menu Drawer - Only show in portrait mode (landscape has it in Column 3) */}
      {currentLayout.orientation === 'portrait' && isMenuDrawerOpen && (
        <div className="menu-drawer-container" style={{
          height: 'auto', // Override CSS height: 100% to allow content-based sizing
          minHeight: '0' // Override any min-height to allow shrinking
        }}>
          <div className="drawer-header">
            <button
              className="drawer-close"
              onClick={() => {
                console.log('❌ Menu close button clicked - closing drawer');
                setIsMenuDrawerOpen(false);
              }}
              aria-label="Close Menu"
              style={{ 
                position: 'fixed',
                top: currentLayout.isIpadPortrait 
                  ? 'calc(10px + env(safe-area-inset-top))' // Move down 10px for iPad portrait only
                  : 'calc(0px + env(safe-area-inset-top))', // Normal position for iPhone
                right: 'calc(10px + env(safe-area-inset-right))', // Keep same horizontal position
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
            >
              ›
            </button>
          </div>
          
          <div className="drawer-content" style={{
            position: 'fixed',
            top: 'calc(0px + env(safe-area-inset-top) + 40px + 20px)', // Icon top + icon height + 20px gap
            right: 'calc(10px + env(safe-area-inset-right) + 20px)', // Menu icon right + icon width/2 (center line)
            width: '320px', // Fixed width like settings drawer
            height: 'auto', // Will be set dynamically to match content exactly
            background: 'white',
            borderRadius: '12px',
            padding: '0', // Remove all padding to align borders perfectly
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            overflow: 'auto',
            zIndex: 6000, // Above overlay (2000) and same as settings drawer
            display: 'flex',
            flexDirection: 'column',
            // border: '3px solid #00ff00', // GREEN BORDER - DEBUG: Menu drawer content container - REMOVED
            minHeight: '0', // Override CSS min-height to allow content-based sizing
            flex: '0 0 auto' // Override CSS flex: 1 to prevent stretching
          }}
          ref={(el) => {
            if (el && isMenuDrawerOpen) {
              console.log('🍔 Menu drawer ref callback - drawer is open');
              console.log('🍔 Menu drawer element:', el);
              console.log('🍔 Menu drawer element classes:', el.className);
              
              // Wait for content to render, then adjust height to match content exactly
              setTimeout(() => {
                console.log('🍔 Menu drawer timeout callback - looking for scrollable content');
                const content = el.querySelector('.menu-drawer-scrollable') as HTMLElement;
                console.log('🍔 Menu drawer scrollable content found:', !!content);
                
                if (content) {
                  console.log('🍔 Menu drawer scrollable content element:', content);
                  console.log('🍔 Menu drawer scrollable content classes:', content.className);
                  console.log('🍔 Menu drawer scrollable content computed styles:', {
                    height: window.getComputedStyle(content).height,
                    scrollHeight: content.scrollHeight,
                    offsetHeight: content.offsetHeight,
                    clientHeight: content.clientHeight
                  });
                  
                  // Get the actual content height by measuring the scrollable content
                  const contentHeight = content.scrollHeight;
                  console.log('🍔 Menu drawer content scrollHeight:', contentHeight);
                  
                  // The content height is exactly what we need - no need to add padding
                  // since the container should size to its content
                  const finalHeight = contentHeight;
                  
                  // Calculate available screen space
                  const screenHeight = window.innerHeight;
                  const drawerTop = el.offsetTop;
                  const bottomMargin = 20; // 20px margin from bottom
                  const maxHeight = screenHeight - drawerTop - bottomMargin;
                  
                  console.log('🍔 Menu drawer height calculation:', {
                    screenHeight,
                    drawerTop,
                    bottomMargin,
                    maxHeight,
                    contentHeight,
                    finalHeight
                  });
                  
                  // Use the smaller of content height or max available height
                  const actualHeight = Math.min(finalHeight, maxHeight);
                  el.style.height = `${actualHeight}px`;
                  console.log('🍔 Menu drawer height set to:', actualHeight);
                  
                  // Force the height with !important to override any CSS conflicts
                  el.style.setProperty('height', `${actualHeight}px`, 'important');
                  console.log('🍔 Menu drawer height set with !important to:', actualHeight);
                  
                  // Log the final container dimensions
                  setTimeout(() => {
                    console.log('🍔 Menu drawer final container dimensions:', {
                      height: el.style.height,
                      computedHeight: window.getComputedStyle(el).height,
                      scrollHeight: el.scrollHeight,
                      offsetHeight: el.offsetHeight,
                      clientHeight: el.clientHeight,
                      styleHeight: el.style.getPropertyValue('height'),
                      importantHeight: el.style.getPropertyPriority('height')
                    });
                  }, 50);
                } else {
                  console.log('🍔 ERROR: Menu drawer scrollable content not found!');
                  console.log('🍔 Available child elements:', Array.from(el.children).map(child => ({
                    tagName: child.tagName,
                    className: child.className,
                    id: child.id
                  })));
                }
              }, 100);
              
              const rect = el.getBoundingClientRect();
              const screenHeight = window.innerHeight;
              const drawerBottom = rect.top + rect.height;
              
              // Get the actual closing icon position
              const closeButton = document.querySelector('.menu-drawer-container .drawer-close') as HTMLElement;
              const closeButtonRect = closeButton?.getBoundingClientRect();
              const iconBottom = closeButtonRect ? closeButtonRect.bottom : 50; // fallback
              const gap = 10;
              const bottomMargin = 50; // 30px original + 20px reduction = 50px total
              const expectedDrawerTop = iconBottom + gap;
              const chosenHeight = screenHeight - expectedDrawerTop - bottomMargin;
              
              console.log('🍔 Menu drawer DEBUG:', {
                screenHeight: screenHeight,
                iconBottom: iconBottom,
                expectedDrawerTop: expectedDrawerTop,
                actualDrawerTop: rect.top,
                drawerHeight: rect.height,
                drawerBottom: drawerBottom,
                distanceFromBottom: screenHeight - drawerBottom,
                chosenHeight: chosenHeight,
                actualHeight: rect.height,
                PROBLEM: drawerBottom > screenHeight ? 'DRAWER EXTENDS OFF SCREEN!' : 'OK',
                POSITIONING: Math.abs(rect.top - expectedDrawerTop) > 2 ? 'DRAWER NOT POSITIONED 10PX BELOW ICON!' : 'OK'
              });
            }
          }}>
            <MenuDrawerContent 
              onClose={() => setIsMenuDrawerOpen(false)}
              isPortraitMode={currentLayout.orientation === 'portrait'}
            />
          </div>
        </div>
      )}


      
      {/* Settings Drawer Overlay - Simple, reliable full-screen coverage */}
      {isSettingsDrawerOpen && (
        <div
          className="settings-drawer-overlay open"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSettingsDrawerClose();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSettingsDrawerClose();
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            userSelect: 'none',
          }}
        />
      )}
      {/* Menu Drawer Overlay - Simple, reliable full-screen coverage */}
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