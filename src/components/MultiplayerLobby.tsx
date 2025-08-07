// src/components/MultiplayerLobby.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceDetection } from '../utils/deviceDetection';
import { LogIn, UserPlus, LogOut, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { multiplayerService, ServiceError } from '../services/multiplayerService';
import { authService } from '../services/authService';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

interface MultiplayerLobbyProps {
  onGameStart: (gameData: any) => void;
  onBack: () => void;
  initialDifficulty?: string;
  globalUsername?: string;
}

interface LobbyPlayer {
  username: string;
  joinedAt: string;
  seatIndex?: number;
}

interface LobbyState {
  playersWaiting: number;
  gameId?: string;
  countdown?: number;
  players: LobbyPlayer[];
}

interface ErrorState {
  message: string;
  details: string;
  suggestions: string[];
  retryable: boolean;
  operation: string;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onBack,
  initialDifficulty = 'classic',
  globalUsername
}) => {
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    playersWaiting: 0,
    players: []
  });
  const [isSeated, setIsSeated] = useState(false);
  const [selectedSeatIndex, setSelectedSeatIndex] = useState<number | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  const subscriptionRef = useRef<any>(null);
  const { globalUsername: storeUsername, setGlobalUsername } = useGameStore();
  const effectiveUsername = globalUsername || storeUsername || 'Player';

  // Check authentication status on mount
  useEffect(() => {
    console.log('🔧 MultiplayerLobby: Checking authentication status...');
    const user = authService.getCurrentUser();
    console.log('🔧 MultiplayerLobby: Current user from authService:', user);
    
    if (user) {
      console.log('🔧 MultiplayerLobby: User is authenticated, setting state');
      setIsAuthenticated(true);
      setCurrentUser(user.username);
      setGlobalUsername(user.username);
    } else {
      console.log('🔧 MultiplayerLobby: No authenticated user found');
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, [setGlobalUsername]);

  const handleServiceError = (serviceError: ServiceError, operation: string) => {
    console.error(`🚨 MultiplayerLobby Error in ${operation}:`, serviceError);
    
    setError({
      message: serviceError.message,
      details: serviceError.details,
      suggestions: getRecoverySuggestions(serviceError),
      retryable: serviceError.retryable,
      operation
    });
  };

  const getRecoverySuggestions = (serviceError: ServiceError): string[] => {
    switch (serviceError.suggestedAction) {
      case 'RETRY':
        return ['Try again', 'Check your internet connection'];
      case 'SWITCH_TO_SINGLE_PLAYER':
        return ['Switch to single player mode', 'Try again later'];
      case 'CHECK_CREDENTIALS':
        return ['Check your username and password', 'Try signing in again'];
      case 'CONTACT_SUPPORT':
        return ['Contact support if problem persists'];
      default:
        return ['Try again', 'Check your internet connection'];
    }
  };

  const clearError = () => {
    setError(null);
  };

  const retryOperation = async () => {
    if (!error) return;
    
    clearError();
    
    try {
      switch (error.operation) {
        case 'joinLobby':
          if (selectedSeatIndex !== null) {
            await handleJoinLobby(selectedSeatIndex);
          }
          break;
        case 'leaveLobby':
          await handleLeaveLobby();
          break;
        case 'updateDifficultyInterest':
          await multiplayerService.updateDifficultyInterest(selectedDifficulty, true);
          break;
        default:
          console.log('No retry action for operation:', error.operation);
      }
    } catch (error) {
      console.error('Retry operation failed:', error);
    }
  };

  const switchToSinglePlayer = () => {
    // Navigate back to main menu for single player
    onBack();
  };

  // Initialize difficulty interest and lobby subscription
  useEffect(() => {
    const initializeDifficultyInterest = async () => {
      try {
        await multiplayerService.updateDifficultyInterest(selectedDifficulty, true);
      } catch (error) {
        console.error('Error initializing difficulty interest:', error);
      }
    };

    initializeDifficultyInterest();
    subscribeToLobby(selectedDifficulty);

    return () => {
      // Cleanup difficulty interest
      multiplayerService.updateDifficultyInterest(selectedDifficulty, false).catch(console.error);
    };
  }, [selectedDifficulty]);

  // Handle layout changes
  useEffect(() => {
    const handleResize = () => {
      setCurrentLayout(DeviceDetection.getCurrentLayout());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const subscribeToLobby = (difficulty: string) => {
    console.log('🏆 subscribeToLobby called for difficulty:', difficulty);
    
    // Cleanup existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    console.log('🏆 Setting up new lobby subscription');
    
    // Subscribe to lobby updates
    subscriptionRef.current = multiplayerService.subscribeLobbyUpdates(difficulty, (update) => {
      console.log('🏆 Lobby update received:', update);
      setLobbyState({
        playersWaiting: update.playersWaiting,
        gameId: update.gameId,
        countdown: update.countdown,
        players: update.players
      });
    });
  };

  const handleLoginSuccess = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    setGlobalUsername(username);
    setShowLogin(false);
    // Dispatch event to notify App component that username changed
    window.dispatchEvent(new CustomEvent('usernameChanged'));
  };

  const handleRegisterSuccess = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    setGlobalUsername(username);
    setShowRegister(false);
    // Dispatch event to notify App component that username changed
    window.dispatchEvent(new CustomEvent('usernameChanged'));
  };

  const handleSignOut = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setGlobalUsername('');
    // Dispatch event to notify App component that username changed
    window.dispatchEvent(new CustomEvent('usernameChanged'));
  };

  const handleDifficultyChange = async (newDifficulty: string) => {
    if (newDifficulty === selectedDifficulty) return;
    
    setSelectedDifficulty(newDifficulty);
    
    // Update difficulty interest
    try {
      await multiplayerService.updateDifficultyInterest(selectedDifficulty, false);
      await multiplayerService.updateDifficultyInterest(newDifficulty, true);
    } catch (error) {
      console.error('Error updating difficulty interest:', error);
    }
  };

  const handleJoinLobby = async (seatIndex: number) => {
    console.log('🔧 MultiplayerLobby: handleJoinLobby called, isAuthenticated:', isAuthenticated);
    console.log('🔧 MultiplayerLobby: currentUser:', currentUser);
    
    if (!isAuthenticated) {
      console.log('🔧 MultiplayerLobby: User not authenticated, showing login');
      setShowLogin(true);
      return;
    }

    console.log('🔧 MultiplayerLobby: User is authenticated, joining lobby');
    try {
      const result = await multiplayerService.joinLobby(selectedDifficulty, effectiveUsername);
      
      if (result.success) {
        setIsSeated(true);
        setSelectedSeatIndex(seatIndex);
        console.log('✅ Successfully joined lobby at seat', seatIndex);
      } else {
        handleServiceError(result.error!, 'joinLobby');
      }
    } catch (error) {
      console.error('Error joining lobby:', error);
      handleServiceError({
        type: 'UNKNOWN',
        message: 'Failed to join lobby',
        details: 'An unexpected error occurred',
        retryable: true,
        suggestedAction: 'RETRY',
        timestamp: new Date().toISOString(),
        operation: 'joinLobby'
      }, 'joinLobby');
    }
  };

  const handleLeaveLobby = async () => {
    try {
      await multiplayerService.leaveLobby(selectedDifficulty);
      setIsSeated(false);
      setSelectedSeatIndex(null);
      console.log('✅ Successfully left lobby');
    } catch (error) {
      console.error('Error leaving lobby:', error);
      handleServiceError({
        type: 'UNKNOWN',
        message: 'Failed to leave lobby',
        details: 'An unexpected error occurred',
        retryable: true,
        suggestedAction: 'RETRY',
        timestamp: new Date().toISOString(),
        operation: 'leaveLobby'
      }, 'leaveLobby');
    }
  };

  const cleanup = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    
    // Cleanup difficulty interest
    multiplayerService.updateDifficultyInterest(selectedDifficulty, false).catch(console.error);
  };

  const renderGameTable = () => {
    const { isIpadLandscape } = currentLayout;
    const tableSize = isIpadLandscape ? 200 : 250;
    
    const seats = [
      { index: 0, position: 'top', x: 50, y: 0 },
      { index: 1, position: 'right', x: 100, y: 50 },
      { index: 2, position: 'bottom', x: 50, y: 100 },
      { index: 3, position: 'left', x: 0, y: 50 }
    ];

    return (
      <div style={{
        position: 'relative',
        width: tableSize,
        height: tableSize,
        margin: '0 auto',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        borderRadius: '50%',
        border: '3px solid #d1d5db',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Center game info */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'white',
          borderRadius: '8px',
          padding: '8px',
          minWidth: '60px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
            {selectedDifficulty}
          </div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>
            {lobbyState.playersWaiting} waiting
          </div>
        </div>

        {/* Seat positions */}
        {seats.map((seat) => {
          const player = lobbyState.players.find(p => p.seatIndex === seat.index);
          const isCurrentUser = player?.username === effectiveUsername;
          const isLeftSeat = seat.position === 'left';
          const isRightSeat = seat.position === 'right';
          
          return (
            <div
              key={seat.index}
              onClick={() => !player && !isSeated && handleJoinLobby(seat.index)}
              style={{
                position: 'absolute',
                left: `${seat.x}%`,
                top: `${seat.y}%`,
                transform: 'translate(-50%, -50%)',
                width: tableSize * 0.25,
                height: tableSize * 0.25,
                borderRadius: '50%',
                border: player ? '2px solid #10b981' : '2px dashed #3b82f6',
                background: player ? '#f0fdf4' : '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !player && !isSeated ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                boxShadow: player ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!player && !isSeated) {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!player && !isSeated) {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                }
              }}
            >
              {player ? (
                <div style={{
                  display: 'flex',
                  flexDirection: isLeftSeat || isRightSeat ? 'column' : 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  color: isCurrentUser ? '#10b981' : '#374151',
                  fontWeight: isCurrentUser ? '600' : '500'
                }}>
                  {(isLeftSeat || isRightSeat) ? (
                    // Vertical text for left/right seats
                    (player?.username || (isCurrentUser ? effectiveUsername : '')).split('').map((char, index) => (
                      <div key={index} style={{ fontSize: tableSize * 0.03 }}>
                        {char}
                      </div>
                    ))
                  ) : (
                    // Horizontal text for top/bottom seats
                    <span style={{ fontSize: tableSize * 0.04 }}>
                      {player?.username || (isCurrentUser ? effectiveUsername : '')}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{
                  fontSize: tableSize * 0.06,
                  color: '#9ca3af',
                  fontWeight: '600'
                }}>
                  +
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderErrorModal = () => {
    if (!error) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', color: '#dc2626', fontSize: '18px' }}>
            {error.message}
          </h3>
          <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
            {error.details}
          </p>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Suggestions:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '14px' }}>
              {error.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={switchToSinglePlayer}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Single Player
            </button>
            {error.retryable && (
              <button
                onClick={retryOperation}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            )}
            <button
              onClick={clearError}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#6b7280',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const getResponsiveStyles = () => {
    const { isIpadLandscape } = currentLayout;
    
    if (isIpadLandscape) {
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
          padding: '8px'
        },
        header: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          marginBottom: '16px'
        },
        title: {
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        },
        content: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
          height: 'calc(100vh - 120px)'
        },
        leftColumn: {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '8px'
        },
        centerColumn: {
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center'
        },
        rightColumn: {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '8px'
        },
        button: {
          padding: '8px 12px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '14px',
          cursor: 'pointer',
          fontWeight: '500'
        }
      };
    } else {
      return {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
          padding: '16px'
        },
        header: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          marginBottom: '24px'
        },
        title: {
          fontSize: '24px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        },
        content: {
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          gap: '24px'
        },
        button: {
          padding: '12px 20px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: '500'
        }
      };
    }
  };

  const styles = getResponsiveStyles();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6b7280',
            fontSize: '16px'
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <h1 style={styles.title}>Multiplayer Lobby</h1>
        
        {/* Authentication Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UsersIcon size={16} color="#10b981" />
              <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '500' }}>
                {currentUser}
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#dc2626'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LogIn size={12} />
                Sign In
              </button>
              <button
                onClick={() => setShowRegister(true)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <UserPlus size={12} />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {currentLayout.isIpadLandscape ? (
          <>
            {/* Left Column - Game Table */}
            <div style={styles.leftColumn}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderGameTable()}
              </div>
            </div>

            {/* Center Column - Submit Button */}
            <div style={styles.centerColumn}>
              <button
                onClick={onBack}
                disabled={!isAuthenticated}
                style={{
                  ...styles.button,
                  background: isAuthenticated ? '#10b981' : '#9ca3af',
                  color: 'white',
                  cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                  opacity: isAuthenticated ? 1 : 0.6
                }}
              >
                Submit
              </button>
            </div>

            {/* Right Column - Menu Drawer Content */}
            <div style={styles.rightColumn}>
              {/* Menu drawer content would go here */}
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', flex: 1 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Menu</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  Menu content would go here
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Portrait Layout */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {renderGameTable()}
            </div>

            {/* Difficulty Selection */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
              {['classic', 'expert', 'master'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => handleDifficultyChange(difficulty)}
                  style={{
                    ...styles.button,
                    background: selectedDifficulty === difficulty ? '#3b82f6' : '#f3f4f6',
                    color: selectedDifficulty === difficulty ? 'white' : '#374151'
                  }}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={onBack}
              disabled={!isAuthenticated}
              style={{
                ...styles.button,
                background: isAuthenticated ? '#10b981' : '#9ca3af',
                color: 'white',
                cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                opacity: isAuthenticated ? 1 : 0.6
              }}
            >
              Submit
            </button>
          </>
        )}
      </div>

      {/* Error Modal */}
      {renderErrorModal()}

      {/* Authentication Modals */}
      <AnimatePresence>
        {showLogin && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegister && (
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onBack={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};