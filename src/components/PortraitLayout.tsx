import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import TargetDisplay from './TargetDisplay';
import YourGuessBlock from './blocks/YourGuessBlock';
import SelectionArea from './SelectionArea';
import RecentGuessHistory from './RecentGuessHistory';

interface PortraitLayoutProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
}

const PortraitLayout: React.FC<PortraitLayoutProps> = ({ guessElementRef }) => {
  const { settings } = useGameStore();

  // Show help toast for Number Selection
  const showNumberSelectionHelp = () => {
    console.log(`🔍 Number Selection Help clicked - showing toast`);
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2147483647;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 20px;
      padding-top: 80px;
    `;
    overlay.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 20px;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Number Selection Help</h3>
        <p style="margin: 0 0 10px 0; color: #374151; line-height: 1.5;">
          <strong>Tap</strong> any number to automatically fill the next available position in your guess.
        </p>
        <p style="margin: 0 0 10px 0; color: #374151; line-height: 1.5;">
          <strong>Drag</strong> a number to place it in a specific position in your guess.
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Numbers 0-${settings.digitRange} are available for this game mode.
        </p>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-top: 15px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Got it!</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  };

  return (
    <div 
      className="portrait-layout" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        padding: '20px 20px 20px 20px',
        boxSizing: 'border-box',
        gap: '15px',
        overflow: 'hidden'
      }}
    >
      {/* Title and Subtitle */}
      <div className="title-section" style={{
        textAlign: 'center',
        flexShrink: 0,
        marginBottom: '10px'
      }}>
        <h1 className="game-title" style={{
          margin: '0 0 5px 0',
          fontSize: '1.8rem',
          fontWeight: '600',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          PicoFermiBagel
        </h1>
        <p className="game-subtitle" style={{
          margin: '0',
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}>
          A Number-based Logical Guessing Game
        </p>
      </div>

      {/* Main Content Area */}
      <div className="portrait-content" style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        gap: '12.5px',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* Target Display - Only render when enabled */}
        {settings.showTarget && (
          <div style={{ flexShrink: 0 }}>
            <TargetDisplay />
          </div>
        )}
        
        {/* Guess Area */}
        <div className="guess-section" style={{ flexShrink: 0 }}>
          <YourGuessBlock guessElementRef={guessElementRef} />
        </div>
        
        {/* Number Selection */}
        <div className="selection-section" style={{ 
          flexShrink: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
          {/* Help icon */}
          <button
            className="help-button"
            onClick={showNumberSelectionHelp}
            aria-label="Show help"
            style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 11
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <HelpCircle size={27} />
          </button>
          <SelectionArea />
        </div>
        
        {/* Recent Guesses - Takes remaining space */}
        <div className="recent-guess-section" style={{ 
          flex: '1',
          minHeight: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          overflow: 'auto',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}>
          <RecentGuessHistory />
        </div>
      </div>
    </div>
  );
};

export default PortraitLayout; 