import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, Menu, Settings } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { getBuildString, getBuildDateString } from '../config/version';
import { soundUtils } from '../utils/soundUtils';
import GuessArea from './GuessArea';
import SelectionArea from './SelectionArea';
import SubmitButton from './SubmitButton';

import ScoreArea from './ScoreArea';
import Scratchpad from './Scratchpad';
import MenuArea from './MenuArea';
import TargetDisplay from './TargetDisplay';
import HintPurchasing from './HintPurchasing';
import CustomScrollIndicator from './CustomScrollIndicator';
import './GameScreen.css';

const GameScreen: React.FC = () => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [useDrawer, setUseDrawer] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  const { gameState, settings, dispatch, resetAllSettings } = useGameStore();

  // Refs for dynamic positioning
  const guessElementRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const mobileDrawerContentRef = useRef<HTMLDivElement>(null);

  // Swipe gesture state
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gameScreenRef = useRef<HTMLDivElement>(null);

  // Function to align right panel with guess element
  const alignRightPanel = useCallback(() => {
    if (!guessElementRef.current || !rightPanelRef.current || useDrawer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    const isTabletLandscape = isLandscape && width >= 768;
    
    // Skip JavaScript positioning for iPad landscape - let CSS flexbox handle it
    if (isTabletLandscape) {
      // Reset any previous absolute positioning to let CSS take over
      rightPanelRef.current.style.position = '';
      rightPanelRef.current.style.top = '';
      rightPanelRef.current.style.right = '';
      rightPanelRef.current.style.marginTop = '';
      console.log(`🎯 iPad landscape detected - using CSS flexbox positioning`);
      return;
    }

    const guessRect = guessElementRef.current.getBoundingClientRect();
    
    // Get the absolute Y position of the guess element's top edge
    const absoluteTopPosition = guessRect.top + window.scrollY;
    
    // Set the right panel to absolute positioning at that exact Y coordinate
    rightPanelRef.current.style.position = 'absolute';
    rightPanelRef.current.style.top = `${absoluteTopPosition}px`;
    rightPanelRef.current.style.right = '20px'; // Keep it on the right side
    rightPanelRef.current.style.marginTop = '0'; // Remove any margin
    
    console.log(`🎯 Aligning scratchpad to absolute Y position: ${absoluteTopPosition}px`);
  }, [useDrawer]);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      
      // Space-based logic: Use drawer if there's not enough space for side panel
      // Need at least 900px width for main content + side panel in landscape
      // In portrait mode, always use drawer since there's no horizontal space for side panel
      const needsDrawer = isLandscape ? width < 900 : true;
      
      console.log(`📏 SCREEN SIZE DEBUG: ${width}x${height}, landscape: ${isLandscape}, needsDrawer: ${needsDrawer}`);
      setUseDrawer(needsDrawer);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkScreenSize, 100); // Delay to get accurate dimensions after rotation
    });

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, [gameState]);

  // Effect to align right panel when layout changes
  useEffect(() => {
    // Use a timeout to ensure all layout calculations are complete
    const timeoutId = setTimeout(alignRightPanel, 100);
    
    // Also align on window resize
    const handleResize = () => {
      setTimeout(alignRightPanel, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [alignRightPanel, useDrawer, gameState, settings]);

  // Reset all settings to defaults on app startup (once per session)
  useEffect(() => {
    console.log(`🚀 PicoFermiBagel ${getBuildString()} LOADED - Latest Version Confirmed!`);
    console.log(`🚀 Build Date: ${getBuildDateString()}`);
    console.log('🚀 If you see this message, you have the latest build with debug logging');
    
    // Only reset if this is truly the first load (check if we've already reset)
    const hasReset = sessionStorage.getItem('pfb-reset-done');
    if (!hasReset) {
      console.log('🔄 RESETTING ALL SETTINGS TO DEFAULTS ON STARTUP');
      resetAllSettings();
      sessionStorage.setItem('pfb-reset-done', 'true');
    } else {
      console.log('🔄 Settings already reset this session, skipping reset');
    }
    
    // Initialize sound volume from settings
    soundUtils.setVolume(settings.soundVolume);
    
    // Force layout recalculation and safe area fix
    const forceLayoutFix = () => {
      console.log('🔧 Applying JavaScript layout fixes...');
      
      // Force viewport refresh
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        const content = viewport.getAttribute('content');
        viewport.setAttribute('content', content + ', interactive-widget=resizes-content');
        setTimeout(() => {
          viewport.setAttribute('content', content || 'width=device-width, initial-scale=1');
        }, 100);
      }
      
      // Force container recalculation
      const container = document.querySelector('.container');
      if (container) {
        const originalMarginBottom = (container as HTMLElement).style.marginBottom;
        (container as HTMLElement).style.marginBottom = '0px';
        setTimeout(() => {
          (container as HTMLElement).style.marginBottom = originalMarginBottom || '';
          console.log('🔧 Container margin reset applied');
        }, 50);
      }
      
      // iPad-specific fix for portrait mode safe area
      const isIPad = window.innerWidth >= 768 && window.innerWidth <= 1024;
      const isPortrait = window.innerHeight > window.innerWidth;
      if (isIPad && isPortrait) {
        console.log('🍎 Applying iPad portrait specific fixes...');
        const gameScreen = document.querySelector('.game-screen');
        const container = document.querySelector('.container');
        const body = document.body;
        const html = document.documentElement;
        
        if (gameScreen && container) {
          // Minimal bottom spacing for iPad - much less aggressive
          (container as HTMLElement).style.paddingBottom = 'calc(40px + env(safe-area-inset-bottom, 34px))';
          (gameScreen as HTMLElement).style.paddingBottom = 'env(safe-area-inset-bottom, 34px)';
          
          // Remove excessive body padding
          body.style.paddingBottom = '';
          html.style.paddingBottom = '';
          
          // Set proper viewport height
          (gameScreen as HTMLElement).style.minHeight = '100vh';
          
          // Force scroll to top to reset positioning
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            
            // Force layout recalculation with deliberate position changes
            (container as HTMLElement).style.transform = 'translateZ(0)';
            (gameScreen as HTMLElement).style.transform = 'translateY(1px)';
            
            setTimeout(() => {
              (container as HTMLElement).style.transform = '';
              (gameScreen as HTMLElement).style.transform = 'translateY(0px)';
              
              // One more deliberate adjustment to force final positioning
              setTimeout(() => {
                (gameScreen as HTMLElement).style.transform = '';
                // Force a style recalculation by temporarily changing position
                const originalPosition = (container as HTMLElement).style.position;
                (container as HTMLElement).style.position = 'relative';
                setTimeout(() => {
                  (container as HTMLElement).style.position = originalPosition;
                  console.log('🍎 iPad positioning fix applied with forced adjustments');
                }, 25);
              }, 50);
            }, 50);
          }, 100);
        }
      }
      
      // Force scroll to ensure proper positioning
      window.scrollTo(0, 0);
      
      // Ensure all toasts have maximum z-index
      const toastSelectors = [
        '.info-toast-overlay',
        '.help-overlay', 
        '.hints-toast-overlay',
        '.stats-toast-overlay',
        '.toast',
        '.popup',
        '.modal'
      ];
      
      toastSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          (el as HTMLElement).style.zIndex = '99999';
        });
      });
    };
    
    // Apply fixes immediately and after a delay
    forceLayoutFix();
    setTimeout(forceLayoutFix, 100);
    setTimeout(forceLayoutFix, 500);
    setTimeout(forceLayoutFix, 1000);
    
  }, [settings.soundVolume]);

  // Debug current game state
  useEffect(() => {
    console.log('🎮 GAME STATE DEBUG:');
    console.log('🎮 Settings:', {
      difficulty: settings?.difficulty || 'unknown',
      gridRows: settings?.gridRows || 'unknown',
      gridColumns: settings?.gridColumns || 'unknown',
      targetLength: settings?.targetLength || 'unknown'
    });
    console.log('🎮 Current guess length:', gameState.currentGuess?.length || 'unknown');
    console.log('🎮 Target length:', gameState.target?.length || 'unknown');
  }, [gameState, settings]);

  // Fix game state consistency on startup
  useEffect(() => {
    const expectedLength = settings.targetLength;
    const currentGuessLength = gameState.currentGuess.length;
    const targetLength = gameState.target.length;
    
    if (currentGuessLength !== expectedLength || targetLength !== expectedLength) {
      console.log('🔧 FIXING INCONSISTENT STATE: Starting new game to match settings');
      dispatch({ type: 'START_NEW_GAME' });
    }
  }, []); // Only run once on mount

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!swipeStartRef.current || !gameScreenRef.current) return;
    
    const touch = e.changedTouches[0];
    const { x: startX, y: startY, time: startTime } = swipeStartRef.current;
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    // Calculate swipe metrics
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;
    

    
    // Simplified swipe requirements - more lenient
    const minDistance = 30; // Reduced from 50
    const maxTime = 500; // Increased from 300
    const minVelocity = 0.1; // Reduced from 0.3
    
    // Check if this is a valid swipe
    if (distance < minDistance || deltaTime > maxTime || velocity < minVelocity) {
      swipeStartRef.current = null;
      return;
    }
    
    // Check if swipe is more horizontal than vertical
    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      swipeStartRef.current = null;
      return;
    }
    
    // Fixed logic - settings drawer always swipeable, menu drawer only when useDrawer is true
    if (deltaX < -30) {
      // Left swipe
      if (isSettingsDrawerOpen) {
        // Settings drawer is always swipeable
        setIsSettingsDrawerOpen(false);
      } else if (isMenuDrawerOpen && useDrawer) {
        // Menu drawer only when using drawer layout
        setIsMenuDrawerOpen(false);
      } else if (!isMenuDrawerOpen && !isSettingsDrawerOpen && useDrawer) {
        // Open menu drawer only when using drawer layout
        setIsMenuDrawerOpen(true);
      }
    } else if (deltaX > 30) {
      // Right swipe
      if (isMenuDrawerOpen && useDrawer) {
        // Menu drawer only when using drawer layout
        setIsMenuDrawerOpen(false);
      } else if (isSettingsDrawerOpen) {
        // Settings drawer is always swipeable
        setIsSettingsDrawerOpen(false);
      } else if (!isSettingsDrawerOpen && !isMenuDrawerOpen) {
        // Settings drawer is always available to open
        setIsSettingsDrawerOpen(true);
      }
    }
    
    swipeStartRef.current = null;
  }, [isMenuDrawerOpen, isSettingsDrawerOpen, useDrawer]);

  // Scroll to top when drawers open
  useEffect(() => {
    if (isMenuDrawerOpen && mobileDrawerContentRef.current) {
      setTimeout(() => {
        mobileDrawerContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100); // Small delay to ensure drawer is open
    }
  }, [isMenuDrawerOpen]);

  useEffect(() => {
    if (isSettingsDrawerOpen) {
      setTimeout(() => {
        const settingsDrawerContent = document.querySelector('.settings-drawer.open .drawer-content');
        if (settingsDrawerContent) {
          settingsDrawerContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure drawer is open
    }
  }, [isSettingsDrawerOpen]);

  // Add touch event listeners
  useEffect(() => {
    const gameScreen = gameScreenRef.current;
    if (!gameScreen) return;
    
    gameScreen.addEventListener('touchstart', handleTouchStart, { passive: true });
    gameScreen.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      gameScreen.removeEventListener('touchstart', handleTouchStart);
      gameScreen.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  // Debug safe area values
  useEffect(() => {
    const logSafeAreaInfo = () => {
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || 'not-set';
      
      console.log('🔍 Safe Area Debug Info:', {
        orientation,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        safeAreaBottom,
        userAgent: navigator.userAgent.includes('iPad') ? 'iPad' : 'other'
      });
      
      // Check if our media query matches
      const portraitMatch = window.matchMedia('(orientation: portrait)').matches;
      console.log('📱 Portrait media query matches:', portraitMatch);
      
      // Check if submit button area exists and has the pseudo element
      const submitArea = document.querySelector('.submit-button-area');
      if (submitArea) {
        const computedStyle = window.getComputedStyle(submitArea, '::after');
        console.log('🎯 Submit area ::after styles:', {
          content: computedStyle.content,
          height: computedStyle.height,
          background: computedStyle.background,
          display: computedStyle.display
        });
      }
    };

    // Log immediately and on orientation change
    logSafeAreaInfo();
    window.addEventListener('orientationchange', () => {
      setTimeout(logSafeAreaInfo, 100); // Small delay after orientation change
    });
    window.addEventListener('resize', logSafeAreaInfo);

    return () => {
      window.removeEventListener('orientationchange', logSafeAreaInfo);
      window.removeEventListener('resize', logSafeAreaInfo);
    };
  }, []);

  // Auto-scaling effect ONLY for iPad portrait mode where we had initial positioning issues
  useEffect(() => {
    const applyAutoScaling = () => {
      const wrapper = document.querySelector('.app-scaling-wrapper') as HTMLElement;
      const gameScreen = document.querySelector('.game-screen') as HTMLElement;
      
      if (!wrapper || !gameScreen) return;
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isPortrait = viewportHeight > viewportWidth;
      const isIPad = viewportWidth >= 768 && viewportWidth <= 1024;
      
      // ONLY apply auto-scaling in iPad portrait mode where we had safe area issues
      // Leave landscape mode alone - it should use normal safe area padding
      if (!isIPad || !isPortrait) {
        gameScreen.style.transform = 'scale(1)';
        console.log(`🔍 Skipping auto-scaling - not iPad portrait mode (${viewportWidth}x${viewportHeight}, portrait: ${isPortrait}, iPad: ${isIPad})`);
        return;
      }
      
      // Get the wrapper's actual content dimensions (it has safe area padding)
      const wrapperRect = wrapper.getBoundingClientRect();
      const wrapperStyle = getComputedStyle(wrapper);
      const paddingTop = parseInt(wrapperStyle.paddingTop) || 0;
      const paddingBottom = parseInt(wrapperStyle.paddingBottom) || 0;
      const paddingLeft = parseInt(wrapperStyle.paddingLeft) || 0;
      const paddingRight = parseInt(wrapperStyle.paddingRight) || 0;
      
      // Calculate available space within the wrapper (excluding its padding)
      const availableWidth = wrapperRect.width - paddingLeft - paddingRight;
      const availableHeight = wrapperRect.height - paddingTop - paddingBottom;
      
      // Get the natural size the app wants to be (without scaling)
      gameScreen.style.transform = 'scale(1)';
      const naturalWidth = gameScreen.scrollWidth;
      const naturalHeight = gameScreen.scrollHeight;
      
      // Calculate scale factors
      const scaleX = availableWidth / naturalWidth;
      const scaleY = availableHeight / naturalHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Never scale up, only down
      
      console.log(`🔍 Auto-scaling calculation (iPad portrait ONLY):`, {
        viewport: `${viewportWidth}x${viewportHeight}`,
        wrapperSize: `${wrapperRect.width}x${wrapperRect.height}`,
        wrapperPadding: { top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight },
        available: `${availableWidth}x${availableHeight}`,
        natural: `${naturalWidth}x${naturalHeight}`,
        scales: { x: scaleX, y: scaleY, final: scale }
      });
      
      // Apply scaling
      if (scale < 1) {
        gameScreen.style.transform = `scale(${scale})`;
        console.log(`🔍 Applied auto-scaling: ${scale.toFixed(3)}`);
      } else {
        gameScreen.style.transform = 'scale(1)';
        console.log(`🔍 No scaling needed - app fits naturally`);
      }
    };
    
    // Apply scaling on load and resize
    applyAutoScaling();
    
    const handleResize = () => {
      setTimeout(applyAutoScaling, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Additional effect to fix toast z-index issues dynamically
  useEffect(() => {
    const fixToastZIndex = () => {
      // Use MutationObserver to watch for toast elements being added to DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check if this is a toast-related element
              if (element.classList?.contains('info-toast-overlay') ||
                  element.classList?.contains('help-overlay') ||
                  element.classList?.contains('hints-toast-overlay') ||
                  element.classList?.contains('stats-toast-overlay') ||
                  element.querySelector?.('.info-toast-overlay, .help-overlay, .hints-toast-overlay, .stats-toast-overlay')) {
                
                console.log('🎯 Toast element detected, applying z-index fix');
                (element as HTMLElement).style.zIndex = '99999';
                
                // Also fix any child toast elements
                const childToasts = element.querySelectorAll('.info-toast-overlay, .help-overlay, .hints-toast-overlay, .stats-toast-overlay');
                childToasts.forEach(child => {
                  (child as HTMLElement).style.zIndex = '99999';
                });
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => observer.disconnect();
    };
    
    const cleanup = fixToastZIndex();
    return cleanup;
  }, []);

  return (
    <div className="app-scaling-wrapper">
      <div className="game-screen" ref={gameScreenRef}>
      {/* Settings Button - Top Left */}
      {!isSettingsDrawerOpen && (
        <button
          className="settings-button"
          onClick={() => {
            if (isMenuDrawerOpen) {
              setIsMenuDrawerOpen(false);
            }
            setIsSettingsDrawerOpen(true);
          }}
          aria-label="Open settings"
        >
          <Settings size={24} />
        </button>
      )}

      {/* Hamburger Menu Toggle - Top Right */}
      {useDrawer && !isMenuDrawerOpen && (
        <button
          className="drawer-toggle-top-right"
          onClick={() => {
            if (isSettingsDrawerOpen) {
              setIsSettingsDrawerOpen(false);
            }
            setIsMenuDrawerOpen(true);
          }}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Settings Drawer */}
      {isSettingsDrawerOpen && (
        <div className="settings-drawer-overlay open" onClick={() => setIsSettingsDrawerOpen(false)} />
      )}
      <div className={`settings-drawer ${isSettingsDrawerOpen ? 'open' : ''}`}>
        <MenuArea onClose={() => setIsSettingsDrawerOpen(false)} />
      </div>

      <div className="container">
        {/* Main Game Area */}
        <div className="main-content">
          {/* Game Title */}
          <div className="title-section">
            <h1 className="game-title">PicoFermiBagel</h1>
            <p className="game-subtitle">A Number-based Logical Guessing Game</p>
          </div>

          {/* Game Sections Wrapper */}
          <div className="game-sections-wrapper">
            {/* Target Display - Shows when enabled */}
            <TargetDisplay />
            
            {/* Guess Area */}
            <div className="guess-section" ref={guessElementRef}>
              <GuessArea />
            </div>

            {/* Number Selection - Moved above Submit Button */}
            <div className="selection-section">
              <SelectionArea />
            </div>

            {/* Submit Button and Recent Guesses */}
            <div className="submit-section">
              <SubmitButton />
            </div>
          </div>
        </div>

        {/* Desktop Right Panel - Dynamically aligned with guess section */}
        {!useDrawer && (
          <div className="right-panel" ref={rightPanelRef}>
            <div className="side-panel-section">
              <Scratchpad />
            </div>
            <div className="side-panel-section">
              <HintPurchasing />
            </div>
            <div className="side-panel-section">
              <ScoreArea />
            </div>
          </div>
        )}

        {/* Mobile/Small Screen Drawer */}
        {useDrawer && (
                      <>
            <div className={`mobile-drawer ${isMenuDrawerOpen ? 'open' : ''}`}>
              <div className="drawer-header">
                <button
                  className="drawer-close"
                  onClick={() => setIsMenuDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="drawer-content" ref={mobileDrawerContentRef} style={{ position: 'relative' }}>
                <CustomScrollIndicator containerRef={mobileDrawerContentRef} />
                <div className="side-panel-section">
                  <Scratchpad />
                </div>
                <div className="side-panel-section">
                  <HintPurchasing />
                </div>
                <div className="side-panel-section">
                  <ScoreArea />
                </div>
              </div>
            </div>


          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default GameScreen; 