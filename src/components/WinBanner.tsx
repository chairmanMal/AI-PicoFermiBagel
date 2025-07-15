import React, { useEffect, useState } from 'react';
import './WinBanner.css';
import tadaaSound from '../assets/tadaa-victory.mp3';
import { useGameStore } from '../stores/gameStore';

interface WinBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  gameStats: {
    targetNumber: string;
    guessCount: number;
    timeElapsed: string;
    score: number;
  };
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  fallSpeed: number;
  delay: number;
  opacity: number;
}

const WinBanner: React.FC<WinBannerProps> = ({ isVisible, onDismiss, gameStats }) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [hasLaunchedForCurrentWin, setHasLaunchedForCurrentWin] = useState(false);
  const [lastWinTarget, setLastWinTarget] = useState<string>('');
  const { settings } = useGameStore();

  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

  const createConfetti = () => {
    const pieces: ConfettiPiece[] = [];
    
    // Create 200 pieces with random delays for natural floating effect
    for (let i = 0; i < 200; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100, // Random horizontal position across screen
        y: -10, // Start above screen
        size: Math.random() * 15 + 8, // Size between 8-23px
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4, // Random rotation speed
        fallSpeed: Math.random() * 2 + 1, // Random fall speed (1-3)
        delay: Math.random() * 5000, // Random delay up to 5 seconds
        opacity: 0.8 + Math.random() * 0.2 // Random opacity 0.8-1.0
      });
    }
    
    setConfetti(pieces);
  };

  const playVictorySound = () => {
    if (!settings.soundEnabled) {
      console.log('Victory sound skipped - sound disabled');
      return;
    }
    
    try {
      const audio = new Audio(tadaaSound);
      audio.volume = (settings.soundVolume || 0.1) * 0.3; // Reduce victory sound to 30% of game volume
      console.log(`Playing victory sound at volume: ${audio.volume}`);
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Audio creation failed:', error);
    }
  };

  // Launch confetti and sound only once per win
  useEffect(() => {
    if (isVisible && !hasLaunchedForCurrentWin && gameStats.targetNumber !== lastWinTarget) {
      console.log('🎉 WinBanner: Launching confetti and sound for new win');
      
      // Start confetti and sound simultaneously for better timing
      playVictorySound();
      createConfetti();
      
      setHasLaunchedForCurrentWin(true);
      setLastWinTarget(gameStats.targetNumber);
    }
  }, [isVisible, hasLaunchedForCurrentWin, gameStats.targetNumber, lastWinTarget]);

  // Reset launch flag when banner is hidden (new game started)
  useEffect(() => {
    if (!isVisible && hasLaunchedForCurrentWin) {
      console.log('🎉 WinBanner: Game reset - resetting launch flag');
      setHasLaunchedForCurrentWin(false);
      setConfetti([]);
    }
  }, [isVisible, hasLaunchedForCurrentWin]);

  const handleDismiss = () => {
    console.log('🎉 WinBanner: Dismissing banner');
    setConfetti([]); // Clear confetti immediately
    onDismiss();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    console.log('🎉 WinBanner: Overlay clicked - dismissing');
    e.preventDefault();
    e.stopPropagation();
    handleDismiss();
  };

  const handleOverlayTouch = (e: React.TouchEvent) => {
    console.log('🎉 WinBanner: Overlay touched - dismissing');
    e.preventDefault();
    e.stopPropagation();
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="win-banner-overlay" 
      onClick={handleOverlayClick}
      onTouchEnd={handleOverlayTouch}
      onTouchStart={() => {
        console.log('🎉 WinBanner: Touch started on overlay');
        // Don't prevent default on touch start, let it bubble to touch end
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(3px)',
        cursor: 'pointer',
        touchAction: 'manipulation'
      }}
    >
      {/* Confetti Layer */}
      <div className="confetti-container" style={{ pointerEvents: 'none' }}>
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="confetti-piece floating"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              opacity: piece.opacity,
              animationDelay: `${piece.delay}ms`,
              animationDuration: `${3000 + Math.random() * 2000}ms`, // 3-5 second fall
              '--fall-speed': `${piece.fallSpeed}`,
              '--rotation-speed': `${piece.rotationSpeed}deg`,
              pointerEvents: 'none'
            } as React.CSSProperties & { '--fall-speed': string; '--rotation-speed': string }}
          />
        ))}
      </div>

      {/* Banner Content */}
      <div 
        className="win-banner-content" 
        style={{ pointerEvents: 'auto' }}
      >
        <div className="win-banner-header">
          <div className="trophy-icon">🏆</div>
          <h2>Congratulations!</h2>
          <div className="sparkles">✨ ✨ ✨</div>
        </div>
        
        <div className="win-banner-stats">
          <div className="stat-item">
            <span className="stat-label">Score:</span>
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
        
        <div className="win-banner-message">
          You cracked the code! 🎉
        </div>
        
        <div className="win-banner-dismiss">
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
};

export default WinBanner; 