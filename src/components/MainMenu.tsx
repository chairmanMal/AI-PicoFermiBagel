import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DeviceDetection } from '../utils/deviceDetection';
import { Users } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';

interface MainMenuProps {
  onSinglePlayer: () => void;
  onMultiplayer: () => void;
  multiplayerAvailable: boolean;
  isConnecting?: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ 
  onSinglePlayer, 
  onMultiplayer, 
  multiplayerAvailable,
  isConnecting = false
}) => {
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());
  const [showUsernameSelector, setShowUsernameSelector] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [previousUsernames, setPreviousUsernames] = useState<string[]>([]);
  
  // Use global username from gameStore
  const { globalUsername, setGlobalUsername } = useGameStore();

  // Load previous usernames from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pfb_previous_usernames');
    if (saved) {
      const usernames = JSON.parse(saved);
      setPreviousUsernames(usernames);
      if (usernames.length > 0 && !globalUsername) {
        setGlobalUsername(usernames[0]);
      }
    }
  }, [globalUsername, setGlobalUsername]);

  const handleUsernameSelect = (username: string) => {
    setGlobalUsername(username);
    setShowUsernameSelector(false);
    // Dispatch event to notify App component that username changed
    window.dispatchEvent(new CustomEvent('usernameChanged'));
  };

  const handleNewUsername = async () => {
    if (!newUsername.trim()) return;
    
    const trimmedUsername = newUsername.trim();
    
    try {
      // Initialize AWS first
      const { initializeAWS } = await import('../services/awsConfig');
      initializeAWS();
      
      // Small delay to ensure AWS is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Import and use multiplayerService for validation
      const { multiplayerService } = await import('../services/multiplayerService');
      const validation = await multiplayerService.validateUsername(trimmedUsername);
      
      if (validation.available) {
        // Username is available, register it
        const result = await multiplayerService.registerUser(trimmedUsername);
        
        if (result.success) {
          // Username is valid, add to local storage
          const updatedUsernames = [trimmedUsername, ...previousUsernames].slice(0, 5);
          setPreviousUsernames(updatedUsernames);
          localStorage.setItem('pfb_previous_usernames', JSON.stringify(updatedUsernames));
          
          setGlobalUsername(trimmedUsername);
          setNewUsername('');
          setShowUsernameSelector(false);
          
          // Dispatch event to notify App component that username changed
          window.dispatchEvent(new CustomEvent('usernameChanged'));
        } else {
          alert(result.message || 'Failed to register username');
        }
      } else {
        alert(validation.message || 'Username not available');
      }
    } catch (error) {
      console.error('Username registration error:', error);
      alert('Unable to validate username. Please check your internet connection and try again.');
    }
  };

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
        
        {/* Username Selector */}
        <div style={{
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <Users size={20} color="#6b7280" />
            <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>
              Select Username
            </span>
          </div>
          
          {!showUsernameSelector ? (
            <button
              onClick={() => setShowUsernameSelector(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              {globalUsername || 'Choose username...'}
            </button>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              padding: '12px',
              maxWidth: '280px',
              margin: '0 auto'
            }}>
              {/* Previous usernames */}
              {previousUsernames.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                    Previous usernames:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {previousUsernames.map(username => (
                      <button
                        key={username}
                        onClick={() => handleUsernameSelect(username)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                          background: 'white',
                          color: '#374151',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {username}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New username input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleNewUsername()}
                />
                <button
                  onClick={handleNewUsername}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#2563eb',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
        
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
            {isConnecting && (
              <span style={{ display: 'block', fontSize: '14px', fontWeight: 'normal' }}>Connecting...</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MainMenu; 