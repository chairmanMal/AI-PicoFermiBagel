import React, { useEffect, useState } from 'react';
import { getBuildString } from '../config/version';
import { soundUtils } from '../utils/soundUtils';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log(`🎨 SplashScreen: Starting splash screen (Build ${getBuildString()})`);
    
    // Activate audio system during splash screen
    soundUtils.activateAudio().then(() => {
      // Audio system activated successfully
    }).catch((error) => {
      console.error('🎵 SplashScreen: Failed to activate audio system:', error);
    });
    
    const timer = setTimeout(() => {
      console.log('🎨 SplashScreen: Splash screen duration complete, transitioning to main app');
      setIsVisible(false);
      
      // Add a small delay for fade out animation
      setTimeout(() => {
        onComplete();
      }, 300);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000', // Black background
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {/* Logo Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          width: '100%',
          maxWidth: '80vw',
          maxHeight: '80vh',
        }}
      >
        {/* Logo Image */}
        <img
          src="/splash-logo.png"
          alt="PicoFermiBagel"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: 'min(120vw, 800px)', // 2x larger: 60vw -> 120vw, 400px -> 800px
            maxHeight: 'min(120vh, 800px)', // 2x larger: 60vh -> 120vh, 400px -> 800px
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
          }}
          onLoad={() => console.log('🎨 SplashScreen: Logo image loaded successfully')}
          onError={(e) => console.error('🎨 SplashScreen: Failed to load logo image:', e)}
        />
        

      </div>
      
      {/* Loading Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            animation: 'pulse 1.5s ease-in-out infinite 0.2s',
          }}
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            animation: 'pulse 1.5s ease-in-out infinite 0.4s',
          }}
        />
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen; 