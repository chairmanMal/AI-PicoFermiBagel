import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
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

  const { gameState } = useGameStore();

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
      
      // Debug logging for viewport and device detection
      console.log('=== VIEWPORT DEBUG INFO ===');
      console.log('Window dimensions:', {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      });
      console.log('Screen dimensions:', {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      });
      console.log('Orientation:', window.screen.orientation?.type || 'unknown');
      console.log('Use drawer (space-based):', needsDrawer);
      console.log('User agent:', navigator.userAgent);
      
      // Calculate what the CSS scaling should be
      const vh = window.innerHeight;
      const calculatedScale = Math.max(0.5, Math.min(vh / 1100, 0.85));
      console.log('Calculated CSS scale should be:', calculatedScale);
      console.log('Scale formula: clamp(0.5, ' + vh + ' / 1100, 0.85) =', calculatedScale);
      
      // Check if landscape
      console.log('Is landscape:', isLandscape);
      
      if (isLandscape && window.innerWidth >= 768) {
        console.log('🎯 Should be applying landscape tablet scaling!');
        console.log('Expected transform: scale(' + calculatedScale + ')');
        console.log('Expected width compensation:', window.innerWidth / calculatedScale);
        console.log('Expected height compensation:', window.innerHeight / calculatedScale);
        console.log('Should show side panel directly:', !needsDrawer);
      }
      
      console.log('========================');
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



  // Debug logging for layout investigation
  useEffect(() => {
    console.log('=== LAYOUT DEBUG ===');
    console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);
    console.log('Device pixel ratio:', window.devicePixelRatio);
  }, []);

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

            {/* Mobile Drawer Overlay */}
            {isDrawerOpen && (
              <div 
                className="drawer-overlay" 
                onClick={() => setIsDrawerOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameScreen; 