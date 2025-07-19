import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import TargetDisplay from './TargetDisplay';
import YourGuessBlock from './blocks/YourGuessBlock';
import NumberSelectionBlock from './blocks/NumberSelectionBlock';
import RecentGuessHistory from './RecentGuessHistory';

interface PortraitLayoutProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
}

const PortraitLayout: React.FC<PortraitLayoutProps> = ({ guessElementRef }) => {
  const { settings } = useGameStore();



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
        <div className="selection-section" style={{ flexShrink: 0 }}>
          <NumberSelectionBlock />
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