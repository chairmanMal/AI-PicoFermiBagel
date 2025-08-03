import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DeviceDetection } from '../utils/deviceDetection';

interface MainMenuProps {
  onSinglePlayer: () => void;
  onMultiplayer: () => void;
  multiplayerAvailable: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ 
  onSinglePlayer, 
  onMultiplayer, 
  multiplayerAvailable 
}) => {
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());

  useEffect(() => {
    const handleResize = () => {
      setCurrentLayout(DeviceDetection.getCurrentLayout());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get responsive styles based on device and orientation
  const getResponsiveStyles = () => {
    const { device, orientation, isIpadLandscape } = currentLayout;
    
    if (isIpadLandscape) {
      // iPad landscape: 3-column layout with smaller content
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px'
        },
        content: {
          textAlign: 'center' as const,
          maxWidth: '300px',
          width: '100%'
        },
        title: {
          fontSize: '28px',
          fontWeight: 'bold' as const,
          color: '#1f2937',
          marginBottom: '24px'
        },
        buttonContainer: {
          marginTop: '24px',
          maxWidth: '280px',
          margin: '24px auto 0'
        },
        button: {
          width: '100%',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: '600' as const,
          fontSize: '16px',
          border: 'none',
          cursor: 'pointer' as const,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '12px',
          transition: 'background-color 0.2s ease'
        }
      };
    } else if (device === 'ipad' && orientation === 'portrait') {
      // iPad portrait: centered with medium size
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        },
        content: {
          textAlign: 'center' as const,
          maxWidth: '450px',
          width: '100%'
        },
        title: {
          fontSize: '42px',
          fontWeight: 'bold' as const,
          color: '#1f2937',
          marginBottom: '36px'
        },
        buttonContainer: {
          marginTop: '36px',
          maxWidth: '380px',
          margin: '36px auto 0'
        },
        button: {
          width: '100%',
          padding: '18px 28px',
          borderRadius: '12px',
          fontWeight: '600' as const,
          fontSize: '20px',
          border: 'none',
          cursor: 'pointer' as const,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '16px',
          transition: 'background-color 0.2s ease'
        }
      };
    } else {
      // iPhone portrait: compact layout
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        },
        content: {
          textAlign: 'center' as const,
          maxWidth: '320px',
          width: '100%'
        },
        title: {
          fontSize: '32px',
          fontWeight: 'bold' as const,
          color: '#1f2937',
          marginBottom: '28px'
        },
        buttonContainer: {
          marginTop: '28px',
          maxWidth: '280px',
          margin: '28px auto 0'
        },
        button: {
          width: '100%',
          padding: '14px 24px',
          borderRadius: '10px',
          fontWeight: '600' as const,
          fontSize: '18px',
          border: 'none',
          cursor: 'pointer' as const,
          boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)',
          marginBottom: '14px',
          transition: 'background-color 0.2s ease'
        }
      };
    }
  };

  const styles = getResponsiveStyles();

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.content}
      >
        <h1 style={styles.title}>
          PicoFermiBagel
        </h1>
        
        <div style={styles.buttonContainer}>
          <button
            onClick={onSinglePlayer}
            style={{
              ...styles.button,
              backgroundColor: '#2563eb',
              color: 'white'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Single Player
          </button>
          
          <button
            onClick={onMultiplayer}
            disabled={!multiplayerAvailable}
            style={{
              ...styles.button,
              backgroundColor: multiplayerAvailable ? '#9333ea' : '#9ca3af',
              color: multiplayerAvailable ? 'white' : '#374151',
              cursor: multiplayerAvailable ? 'pointer' : 'not-allowed'
            }}
            onMouseEnter={(e) => {
              if (multiplayerAvailable) {
                e.currentTarget.style.backgroundColor = '#7c3aed';
              }
            }}
            onMouseLeave={(e) => {
              if (multiplayerAvailable) {
                e.currentTarget.style.backgroundColor = '#9333ea';
              }
            }}
          >
            Multiplayer
            {!multiplayerAvailable && (
              <span style={{ display: 'block', fontSize: '14px', fontWeight: 'normal' }}>Connecting...</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MainMenu; 