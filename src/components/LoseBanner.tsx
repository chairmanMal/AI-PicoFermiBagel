import React, { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { soundUtils } from '@/utils/soundUtils';
import './LoseBanner.css';

interface LoseBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  gameStats: {
    score: number;
    guessCount: number;
    timeElapsed: string;
    targetNumber: string;
  };
}

const LoseBanner: React.FC<LoseBannerProps> = ({ isVisible, onDismiss, gameStats }) => {
  const { settings } = useGameStore();

  const playLosingSound = () => {
    if (!settings.soundEnabled) {
      console.log('💀 LoseBanner: Losing sound skipped - sound disabled');
      return;
    }
    
    console.log('💀 LoseBanner: Playing losing sound via soundUtils');
    soundUtils.playGameLostSound();
  };

  // Play losing sound when banner becomes visible
  useEffect(() => {
    if (isVisible) {
      console.log('💀 LoseBanner: Game lost - playing losing sound');
      playLosingSound();
    }
  }, [isVisible]);

  const handleDismiss = () => {
    console.log('💀 LoseBanner: Dismissing banner');
    onDismiss();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    console.log('💀 LoseBanner: Overlay clicked - dismissing');
    e.preventDefault();
    e.stopPropagation();
    handleDismiss();
  };

  const handleOverlayTouch = (e: React.TouchEvent) => {
    console.log('💀 LoseBanner: Overlay touched - dismissing');
    e.preventDefault();
    e.stopPropagation();
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="lose-banner-overlay" 
      onClick={handleOverlayClick}
      onTouchEnd={handleOverlayTouch}
      onTouchStart={() => {
        console.log('💀 LoseBanner: Touch started on overlay');
        // Don't prevent default on touch start, let it bubble to touch end
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(3px)',
        cursor: 'pointer',
        touchAction: 'manipulation'
      }}
    >
      {/* Banner Content */}
      <div 
        className="lose-banner-content"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="lose-banner-header">
          <div className="skull-icon">💀</div>
          <h2>Game Over!</h2>
          <div className="tears">💧 💧 💧</div>
        </div>
        
        <div className="lose-banner-stats">
          <div className="stat-item">
            <span className="stat-label">Final Score:</span>
            <span className="stat-value">{Math.round(gameStats.score || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Guesses:</span>
            <span className="stat-value">{gameStats.guessCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{gameStats.timeElapsed}</span>
          </div>
        </div>
        
        <div className="lose-banner-message">
          Your score reached zero! Better luck next time! 😔
        </div>
        
        <div className="lose-banner-dismiss">
          Tap anywhere to try again
        </div>
      </div>
    </div>
  );
};

export default LoseBanner; 