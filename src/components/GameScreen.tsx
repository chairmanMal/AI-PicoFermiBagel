import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { gameState } = useGameStore();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [gameState]);

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
      {isMobile && !isDrawerOpen && (
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

          {/* Game Sections Wrapper - for right panel positioning */}
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

            {/* Desktop Right Panel - Positioned relative to game sections */}
            {!isMobile && (
              <div className="right-panel">
                <div className="side-panel-section">
                  <ScoreArea />
                </div>
                <div className="side-panel-section">
                  <Scratchpad />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobile && (
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