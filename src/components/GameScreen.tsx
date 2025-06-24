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
import './GameScreen.css';

const GameScreen: React.FC = () => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [useDrawer, setUseDrawer] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  const { gameState, settings, dispatch } = useGameStore();

  // Refs for dynamic positioning
  const guessElementRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Swipe gesture state
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gameScreenRef = useRef<HTMLDivElement>(null);

  // Function to align right panel with guess element
  const alignRightPanel = useCallback(() => {
    if (!guessElementRef.current || !rightPanelRef.current || useDrawer) return;

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

  // App startup indicator
  useEffect(() => {
    console.log(`🚀 PicoFermiBagel ${getBuildString()} LOADED - Latest Version Confirmed!`);
    console.log(`🚀 Build Date: ${getBuildDateString()}`);
    console.log('🚀 If you see this message, you have the latest build with debug logging');
    console.log('🚀 CONSISTENCY FIX IS ACTIVE - State will auto-correct on startup');
    
    // Initialize sound volume from settings
    soundUtils.setVolume(settings.soundVolume);
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
    
    // Fixed logic - close whatever is open with appropriate swipe direction
    if (deltaX < -30) {
      // Left swipe
      if (isSettingsDrawerOpen && useDrawer) {
        setIsSettingsDrawerOpen(false);
      } else if (isMenuDrawerOpen && useDrawer) {
        setIsMenuDrawerOpen(false);
      } else if (!isMenuDrawerOpen && !isSettingsDrawerOpen && useDrawer) {
        setIsMenuDrawerOpen(true);
      }
    } else if (deltaX > 30) {
      // Right swipe
      if (isMenuDrawerOpen && useDrawer) {
        setIsMenuDrawerOpen(false);
      } else if (isSettingsDrawerOpen && useDrawer) {
        setIsSettingsDrawerOpen(false);
      } else if (!isSettingsDrawerOpen && !isMenuDrawerOpen && useDrawer) {
        setIsSettingsDrawerOpen(true);
      }
    }
    
    swipeStartRef.current = null;
  }, [isMenuDrawerOpen, isSettingsDrawerOpen, useDrawer]);

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

  return (
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
              <div className="drawer-content">
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
  );
};

export default GameScreen; 