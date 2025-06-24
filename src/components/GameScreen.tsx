import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { getBuildString, getBuildDateString } from '../config/version';
import GuessArea from './GuessArea';
import SelectionArea from './SelectionArea';
import SubmitButton from './SubmitButton';

import ScoreArea from './ScoreArea';
import Scratchpad from './Scratchpad';
import MenuArea from './MenuArea';
import TargetDisplay from './TargetDisplay';
import './GameScreen.css';

const GameScreen: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [useDrawer, setUseDrawer] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { gameState, settings, dispatch } = useGameStore();

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

  // App startup indicator
  useEffect(() => {
    console.log(`🚀 PicoFermiBagel ${getBuildString()} LOADED - Latest Version Confirmed!`);
    console.log(`🚀 Build Date: ${getBuildDateString()}`);
    console.log('🚀 If you see this message, you have the latest build with debug logging');
    console.log('🚀 CONSISTENCY FIX IS ACTIVE - State will auto-correct on startup');
  }, []);

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

  return (
    <div className="game-screen">
      {/* Hamburger Menu Button - Top Left */}
      <button
        className="hamburger-button"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Chevron Drawer Toggle - Top Right */}
      {useDrawer && !isDrawerOpen && (
        <button
          className="drawer-toggle-top-right"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Open side panel"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="menu-container" onClick={(e) => e.stopPropagation()}>
            <MenuArea onClose={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="container">
        {/* Main Game Area */}
        <div className="main-content">
          {/* Game Title */}
          <div className="title-section">
            <h1 className="game-title">PicoFermiBagel</h1>
            <p className="game-subtitle">A Number-based Logical Guessing Game</p>
          </div>

          {/* Game Sections Wrapper - for right panel positioning reference */}
          <div className="game-sections-wrapper">
            {/* Target Display - Shows when enabled */}
            <TargetDisplay />
            
            {/* Guess Area */}
            <div className="guess-section">
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

        {/* Desktop Right Panel - Direct sibling to main-content for proper alignment */}
        {!useDrawer && (
          <div className="right-panel">
            <div className="side-panel-section">
              <ScoreArea />
            </div>
            <div className="side-panel-section">
              <Scratchpad />
            </div>
          </div>
        )}

        {/* Mobile/Small Screen Drawer */}
        {useDrawer && (
          <>
            <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
              <div className="drawer-header">
                <button
                  className="drawer-close"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close side panel"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="drawer-content">
                <div className="side-panel-section">
                  <ScoreArea />
                </div>
                <div className="side-panel-section">
                  <Scratchpad />
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