import React, { useEffect, useState } from 'react';
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
  const [isIPhone, setIsIPhone] = useState(false);

  useEffect(() => {
    // Detect iPhone
    const userAgent = navigator.userAgent;
    const isIPhoneDevice = /iPhone/.test(userAgent) && !/iPad/.test(userAgent);
    setIsIPhone(isIPhoneDevice);
  }, []);

  return (
    <div 
      className="portrait-layout" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        padding: '20px 10px 20px 10px', // Reduced horizontal padding from 20px to 10px (50% reduction)
        boxSizing: 'border-box',
        gap: '5px', // Minimal gap to match landscape mode's spacing
        overflow: 'hidden'
      }}
    >
      {/* Title and Subtitle */}
      <div className="title-section" style={{
        textAlign: 'center',
        flexShrink: 0,
        marginBottom: '0', // No margin to allow gap to control spacing
        marginTop: isIPhone ? '35px' : '0' // Move title down 35px for iPhone (increased from 30px to 35px)
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
          paddingBottom: isIPhone ? '4px' : '0', // Add 4px padding beneath subtitle for iPhone
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
        gap: '5px', // Minimal gap to match landscape mode's spacing
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* Target Display - Only render when enabled OR developer mode is enabled */}
        {(settings.showTarget || settings.developerMode) && (
          <div style={{ 
            flexShrink: 0
          }}>
            <TargetDisplay />
          </div>
        )}
        
        {/* Guess Area */}
        <div className="guess-section" style={{ 
          flexShrink: 0
        }}>
          <YourGuessBlock guessElementRef={guessElementRef} />
        </div>
        
        {/* Number Selection */}
        <div className="selection-section" style={{ 
          flexShrink: 0
        }}>
          <NumberSelectionBlock />
        </div>
        
        {/* Recent Guesses - Takes remaining space */}
        <div className="recent-guess-section" style={{ 
          flex: '1',
          minHeight: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '5px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          overflow: 'auto',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          marginTop: '0' // No margin to allow gap to control spacing
        }}>
          <RecentGuessHistory />
        </div>
      </div>
    </div>
  );
};

export default PortraitLayout; 