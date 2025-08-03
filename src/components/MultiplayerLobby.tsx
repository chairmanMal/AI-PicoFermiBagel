// src/components/MultiplayerLobby.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Timer, 
  ArrowLeft, 
  Crown,
  Loader,
  AlertCircle,
  Gamepad2,
  Trophy,
  Settings
} from 'lucide-react';
import multiplayerService, { LobbyUpdate } from '../services/multiplayerService';
import { DeviceDetection } from '../utils/deviceDetection';

interface MultiplayerLobbyProps {
  onGameStart: (gameData: any) => void;
  onBack: () => void;
  initialDifficulty?: string;
}

interface LobbyPlayer {
  username: string;
  joinedAt: string;
}

interface LobbyState {
  playersWaiting: number;
  gameId?: string;
  countdown?: number;
  players: LobbyPlayer[];
}

const DIFFICULTY_CONFIGS = {
  easy: { label: 'Easy', description: '3 digits, 0-6' },
  classic: { label: 'Classic', description: '3 digits, 0-9' },
  medium: { label: 'Medium', description: '4 digits, 0-9' },
  hard: { label: 'Hard', description: '4 digits, 0-12' },
  harder: { label: 'Harder', description: '5 digits, 0-12' },
  hardest: { label: 'Hardest', description: '5 digits, 0-15' }
};

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onGameStart,
  onBack,
  initialDifficulty = 'classic'
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    playersWaiting: 0,
    players: []
  });
  const [isSeated, setIsSeated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());
  
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const gameStartSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentUsername = multiplayerService.getStoredUsername();

  useEffect(() => {
    const handleResize = () => {
      setCurrentLayout(DeviceDetection.getCurrentLayout());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Subscribe to game start events
    gameStartSubscriptionRef.current = multiplayerService.subscribeGameStart((gameData) => {
      console.log('Game starting:', gameData);
      cleanup();
      onGameStart(gameData);
    });

    return cleanup;
  }, [onGameStart]);

  useEffect(() => {
    // Subscribe to lobby updates for current difficulty
    subscribeToLobby(selectedDifficulty);
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [selectedDifficulty]);

  useEffect(() => {
    // Handle countdown
    if (lobbyState.countdown && lobbyState.countdown > 0) {
      setCountdown(lobbyState.countdown);
      
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [lobbyState.countdown]);

  const subscribeToLobby = (difficulty: string) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = multiplayerService.subscribeLobbyUpdates(
      difficulty,
      (update: LobbyUpdate) => {
        console.log('Lobby update:', update);
        setLobbyState({
          playersWaiting: update.playersWaiting,
          gameId: update.gameId,
          countdown: update.countdown,
          players: update.players || []
        });
      }
    );
  };

  const handleDifficultyChange = async (newDifficulty: string) => {
    if (isSeated) {
      await handleLeaveLobby();
    }
    setSelectedDifficulty(newDifficulty);
  };

  // Get responsive styles based on device and orientation
  const getResponsiveStyles = () => {
    const { device, orientation, isIpadLandscape } = currentLayout;
    
    if (isIpadLandscape) {
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column' as const
        },
        header: {
          marginBottom: '16px',
          padding: '8px 0'
        },
        title: {
          fontSize: '24px',
          fontWeight: 'bold' as const,
          color: 'white',
          textAlign: 'center' as const
        },
        difficultySection: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          backdropFilter: 'blur(10px)'
        },
        difficultyTitle: {
          fontSize: '16px',
          fontWeight: '600' as const,
          color: 'white',
          marginBottom: '12px',
          textAlign: 'center' as const
        },
        difficultyGrid: {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px'
        },
        difficultyButton: {
          padding: '8px 12px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '12px',
          fontWeight: '500' as const,
          cursor: 'pointer' as const,
          transition: 'all 0.2s ease'
        },
        tableSection: {
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        },
        tableSize: 200
      };
    } else if (device === 'ipad' && orientation === 'portrait') {
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column' as const
        },
        header: {
          marginBottom: '32px',
          padding: '16px 0'
        },
        title: {
          fontSize: '32px',
          fontWeight: 'bold' as const,
          color: 'white',
          textAlign: 'center' as const
        },
        difficultySection: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          backdropFilter: 'blur(10px)'
        },
        difficultyTitle: {
          fontSize: '20px',
          fontWeight: '600' as const,
          color: 'white',
          marginBottom: '16px',
          textAlign: 'center' as const
        },
        difficultyGrid: {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        },
        difficultyButton: {
          padding: '12px 16px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '14px',
          fontWeight: '500' as const,
          cursor: 'pointer' as const,
          transition: 'all 0.2s ease'
        },
        tableSection: {
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        },
        tableSize: 280
      };
    } else {
      // iPhone portrait
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column' as const
        },
        header: {
          marginBottom: '24px',
          padding: '12px 0'
        },
        title: {
          fontSize: '28px',
          fontWeight: 'bold' as const,
          color: 'white',
          textAlign: 'center' as const
        },
        difficultySection: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '24px',
          backdropFilter: 'blur(10px)'
        },
        difficultyTitle: {
          fontSize: '18px',
          fontWeight: '600' as const,
          color: 'white',
          marginBottom: '14px',
          textAlign: 'center' as const
        },
        difficultyGrid: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px'
        },
        difficultyButton: {
          padding: '10px 14px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '13px',
          fontWeight: '500' as const,
          cursor: 'pointer' as const,
          transition: 'all 0.2s ease'
        },
        tableSection: {
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        },
        tableSize: 240
      };
    }
  };

  const styles = getResponsiveStyles();

  const handleJoinLobby = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🎮 MultiplayerLobby: Attempting to join lobby for difficulty:', selectedDifficulty);
      const result = await multiplayerService.joinLobby(selectedDifficulty);
      console.log('🎮 MultiplayerLobby: Join lobby result:', result);
      
      if (result.success) {
        console.log('🎮 MultiplayerLobby: Successfully joined lobby');
        setIsSeated(true);
        setLobbyState(prev => ({
          ...prev,
          playersWaiting: result.playersWaiting || 1,
          gameId: result.gameId,
          countdown: result.countdown
        }));
      } else {
        console.log('🎮 MultiplayerLobby: Failed to join lobby:', result.message);
        setError(result.message || 'Failed to join lobby');
        // Don't change visual state if join fails
      }
    } catch (error) {
      console.error('🎮 MultiplayerLobby: Error joining lobby:', error);
      setError('Failed to join lobby. Please try again.');
      // Don't change visual state if join fails
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveLobby = async () => {
    setLoading(true);
    setError('');
    
    try {
      await multiplayerService.leaveLobby(selectedDifficulty);
      setIsSeated(false);
      setLobbyState(prev => ({
        ...prev,
        playersWaiting: Math.max(0, prev.playersWaiting - 1)
      }));
    } catch (error) {
      setError('Failed to leave lobby.');
    } finally {
      setLoading(false);
    }
  };

  const cleanup = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    if (gameStartSubscriptionRef.current) {
      gameStartSubscriptionRef.current.unsubscribe();
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  // Static seat positions - cardinal directions (0°, 90°, 180°, 270°)
  const seatPositions = [
    { x: 0, y: -140, index: 0 },     // 0 degrees (top)
    { x: 140, y: 0, index: 1 },      // 90 degrees (right)
    { x: 0, y: 140, index: 2 },      // 180 degrees (bottom)
    { x: -140, y: 0, index: 3 }      // 270 degrees (left)
  ];

  const renderGameTable = () => {
    const maxPlayers = 4;
    const players = lobbyState.players.slice(0, maxPlayers);
    const tableSize = styles.tableSize;
    const radius = tableSize * 0.35;
    
    return (
      <div style={{ position: 'relative', width: tableSize, height: tableSize }}>
        {/* Poker Table - Simple circular table with felt interior and dark green border */}
        <div style={{
          width: tableSize,
          height: tableSize,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #047857 0%, #065f46 100%)',
          border: '8px solid #064e3b',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          margin: '0 auto'
        }}>
          
          {/* Table center logo with splash image */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            zIndex: 2,
            width: tableSize * 0.54, // Reduced by 10% from 0.6 to 0.54
            height: tableSize * 0.54, // Reduced by 10% from 0.6 to 0.54
            borderRadius: '50%',
            overflow: 'hidden'
          }}>
            <img 
              src="/splash-logo.png" 
              alt="PicoFermiBagel"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            />
            <div style={{
              fontSize: tableSize * 0.06,
              fontWeight: 'bold',
              marginTop: '8px',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}>
              {DIFFICULTY_CONFIGS[selectedDifficulty as keyof typeof DIFFICULTY_CONFIGS]?.label}
            </div>
            
            {/* Countdown overlay */}
            {countdown && countdown > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '50%',
                  width: tableSize * 0.3,
                  height: tableSize * 0.3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3
                }}
              >
                <div style={{
                  fontSize: tableSize * 0.12,
                  fontWeight: 'bold',
                  color: '#fbbf24',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                  {countdown}
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Player seats */}
          {seatPositions.map(({ x, y, index }) => {
            const player = players[index];
            const isEmpty = !player;
            const isCurrentUser = player?.username === currentUsername;
            
            return (
              <motion.div
                key={index}
                style={{
                  position: 'absolute',
                  width: tableSize * 0.2,
                  height: tableSize * 0.2,
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3
                }}
                whileHover={isEmpty ? { scale: 1.1 } : {}}
                // Removed animate prop to prevent seat movement
              >
                {isEmpty ? (
                  <button
                    onClick={!isSeated ? handleJoinLobby : undefined}
                    disabled={isSeated || loading}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '3px dashed #60a5fa',
                      background: 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)',
                      cursor: !isSeated && !loading ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                      opacity: !isSeated && !loading ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => {
                      if (!isSeated && !loading) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSeated && !loading) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                  >
                    <svg 
                      style={{ width: tableSize * 0.1, height: tableSize * 0.1, color: '#3b82f6' }}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: isCurrentUser 
                      ? 'linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)'
                      : 'linear-gradient(145deg, #6b7280 0%, #4b5563 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: tableSize * 0.06,
                    boxShadow: isCurrentUser 
                      ? '0 6px 12px rgba(59, 130, 246, 0.4), 0 0 0 3px rgba(59, 130, 246, 0.3)'
                      : '0 4px 8px rgba(0, 0, 0, 0.3)',
                    border: isCurrentUser ? '2px solid #60a5fa' : 'none'
                  }}>
                    {isCurrentUser && <Crown style={{ width: tableSize * 0.08, height: tableSize * 0.08, marginRight: '4px' }} />}
                    <span style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '80%',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {player.username.length > 8 
                        ? `${player.username.slice(0, 6)}...` 
                        : player.username
                      }
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* Game info */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'white',
            marginBottom: '12px',
            fontSize: tableSize * 0.04
          }}>
            <Users style={{ width: tableSize * 0.05, height: tableSize * 0.05 }} />
            <span>{lobbyState.playersWaiting} of {maxPlayers} players</span>
          </div>
          

          
          {isSeated && !countdown && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleLeaveLobby}
              disabled={loading}
              style={{
                color: '#ef4444',
                fontSize: tableSize * 0.035,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Leave Lobby
            </motion.button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            opacity: 0.9,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to Menu
        </button>
        
        <h1 style={styles.title}>
          Multiplayer Lobby
        </h1>
      </div>

      {/* Difficulty Selector */}
      <div style={styles.difficultySection}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <Gamepad2 style={{ width: '20px', height: '20px', color: 'white' }} />
          <h2 style={styles.difficultyTitle}>Choose Difficulty</h2>
        </div>
        
        <div style={styles.difficultyGrid}>
          {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleDifficultyChange(key)}
              disabled={loading}
              style={{
                ...styles.difficultyButton,
                backgroundColor: selectedDifficulty === key 
                  ? 'rgba(59, 130, 246, 0.9)' 
                  : 'rgba(255, 255, 255, 0.2)',
                color: selectedDifficulty === key ? 'white' : 'white',
                border: selectedDifficulty === key 
                  ? '2px solid rgba(59, 130, 246, 0.8)' 
                  : '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: selectedDifficulty === key 
                  ? '0 4px 8px rgba(59, 130, 246, 0.3)' 
                  : '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (selectedDifficulty !== key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDifficulty !== key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>{config.label}</div>
              <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{config.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Game Table */}
      <div style={styles.tableSection}>
        {renderGameTable()}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              margin: '16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#fca5a5'
            }}
          >
            <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginTop: '16px' }}>
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Loader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            <span>Connecting...</span>
          </div>
        )}
        {!loading && !isSeated && (
          <span>Select a seat at the table to join the game</span>
        )}
        {!loading && isSeated && !countdown && (
          <span>Waiting for more players to join...</span>
        )}
      </div>
    </div>
  );
};

// Plus icon component (since it might not be in lucide-react)
const Plus: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);