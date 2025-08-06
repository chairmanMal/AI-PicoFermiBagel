// src/components/MultiplayerLobby.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader,
  AlertCircle,
  RefreshCw,
  Home
} from 'lucide-react';
import { multiplayerService, LobbyUpdate, ServiceError } from '../services/multiplayerService';
import { DeviceDetection } from '../utils/deviceDetection';
import { soundUtils } from '../utils/soundUtils';
import { useGameStore } from '../stores/gameStore';
import { getBackgroundGradient } from '../utils/gameLogic';

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
  initialDifficulty = 'classic',
  globalUsername
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    playersWaiting: 0,
    players: []
  });
  const [isSeated, setIsSeated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());
  const [showUsernameSelector, setShowUsernameSelector] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [previousUsernames, setPreviousUsernames] = useState<string[]>([]);
  const [difficultyInterest, setDifficultyInterest] = useState<Record<string, number>>({});
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
  const [showGameStartOverlay, setShowGameStartOverlay] = useState(false);
  const [selectedSeatIndex, setSelectedSeatIndex] = useState<number | null>(null);
  
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const gameStartSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use global username from gameStore
  const { globalUsername: storeGlobalUsername, setGlobalUsername, settings } = useGameStore();
  
  // Use passed globalUsername or fall back to store's globalUsername
  const effectiveUsername = globalUsername || storeGlobalUsername || 'Player';

  // Enhanced error handling
  const handleServiceError = (serviceError: ServiceError, operation: string) => {
    const suggestions = getRecoverySuggestions(serviceError);
    
    setError({
      message: serviceError.message,
      details: serviceError.details,
      suggestions,
      retryable: serviceError.retryable,
      operation
    });

    console.error(`🚨 ${operation} failed:`, {
      type: serviceError.type,
      message: serviceError.message,
      details: serviceError.details,
      retryable: serviceError.retryable,
      suggestedAction: serviceError.suggestedAction,
      timestamp: serviceError.timestamp
    });
  };

  const getRecoverySuggestions = (serviceError: ServiceError): string[] => {
    switch (serviceError.suggestedAction) {
      case 'RETRY':
        return ['Try again', 'Check your internet connection', 'Switch to single player mode'];
      case 'CHECK_CREDENTIALS':
        return ['Check AWS credentials', 'Contact support', 'Switch to single player mode'];
      case 'CONTACT_SUPPORT':
        return ['Contact support', 'Switch to single player mode'];
      case 'SWITCH_TO_SINGLE_PLAYER':
        return ['Switch to single player mode', 'Try again later'];
      default:
        return ['Try again', 'Switch to single player mode'];
    }
  };

  const clearError = () => {
    setError(null);
  };

  const retryOperation = async () => {
    if (!error?.retryable) return;
    
    clearError();
    setLoading(true);
    
    try {
      // Re-attempt the failed operation based on the operation type
      switch (error.operation) {
        case 'joinLobby':
          if (selectedSeatIndex !== null) {
            await handleJoinLobby(selectedSeatIndex);
          }
          break;
        case 'updateDifficultyInterest':
          await multiplayerService.updateDifficultyInterest(selectedDifficulty, true);
          break;
        case 'leaveLobby':
          await handleLeaveLobby();
          break;
        default:
          console.log('Unknown operation to retry:', error.operation);
      }
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setLoading(false);
    }
  };

  const switchToSinglePlayer = () => {
    clearError();
    onBack();
  };

  // Load previous usernames and set initial username
  useEffect(() => {
    const storedUsernames = localStorage.getItem('pfb_previous_usernames');
    if (storedUsernames) {
      const usernames = JSON.parse(storedUsernames);
      setPreviousUsernames(usernames);
    }
    
    // Use the passed globalUsername if available, otherwise use first from stored usernames
    if (globalUsername) {
      console.log('🎮 MultiplayerLobby: Using passed username:', globalUsername);
      setGlobalUsername(globalUsername);
    } else if (storedUsernames) {
      const usernames = JSON.parse(storedUsernames);
      if (usernames.length > 0) {
        console.log('🎮 MultiplayerLobby: Using first stored username:', usernames[0]);
        setGlobalUsername(usernames[0]);
      }
    }
    
    console.log('🎮 MultiplayerLobby: Final selected username:', effectiveUsername);
  }, [globalUsername, setGlobalUsername, effectiveUsername]);

  // Initialize difficulty interest tracking
  useEffect(() => {
    const initializeDifficultyInterest = async () => {
      try {
        const result = await multiplayerService.updateDifficultyInterest(selectedDifficulty, true);
        if (!result) {
          console.warn('Failed to update difficulty interest');
        }
      } catch (error) {
        console.error('Error initializing difficulty interest:', error);
      }
    };

    initializeDifficultyInterest();
  }, [selectedDifficulty]);

  // Layout detection
  useEffect(() => {
    const handleResize = () => {
      const newLayout = DeviceDetection.getCurrentLayout();
      if (newLayout !== currentLayout) {
        setCurrentLayout(newLayout);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentLayout]);

  // Subscribe to lobby updates
  useEffect(() => {
    subscribeToLobby(selectedDifficulty);
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [selectedDifficulty]);

  // Subscribe to game start events
  useEffect(() => {
    gameStartSubscriptionRef.current = multiplayerService.subscribeGameStart((event) => {
      console.log('🎮 MultiplayerLobby: Game start event received:', event);
      setShowGameStartOverlay(true);
      setGameStartCountdown(5);
      
      // Start countdown
      const interval = setInterval(() => {
        setGameStartCountdown((prev) => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval);
            // Start the game
            onGameStart(event);
            return null;
          }
        });
      }, 1000);
      
      countdownIntervalRef.current = interval;
    });

    return () => {
      if (gameStartSubscriptionRef.current) {
        gameStartSubscriptionRef.current.unsubscribe();
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [onGameStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const subscribeToLobby = (difficulty: string) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = multiplayerService.subscribeLobbyUpdates(difficulty, (update: LobbyUpdate) => {
      console.log('🎮 MultiplayerLobby: Lobby update received:', update);
      
      setLobbyState({
        playersWaiting: update.playersWaiting,
        gameId: update.gameId,
        countdown: update.countdown,
        players: update.players || []
      });

      // Update difficulty interest count
      setDifficultyInterest(prev => ({
        ...prev,
        [difficulty]: update.playersWaiting
      }));

      // Handle countdown
      if (update.countdown && update.countdown > 0) {
        setCountdown(update.countdown);
        setCountdownStarted(true);
      } else if (update.countdown === 0) {
        setCountdown(null);
        setCountdownStarted(false);
      }
    });
  };

  const handleUsernameSelect = async (username: string) => {
    setShowUsernameSelector(false);
    setGlobalUsername(username);
    
    // If currently seated, update the lobby with new username
    if (isSeated) {
      try {
        await handleLeaveLobby();
        await handleJoinLobby(selectedSeatIndex!);
      } catch (error) {
        console.error('Error updating username in lobby:', error);
      }
    }
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
          // Add to previous usernames
          const updatedUsernames = [trimmedUsername, ...previousUsernames.filter(u => u !== trimmedUsername)].slice(0, 10);
          setPreviousUsernames(updatedUsernames);
          localStorage.setItem('pfb_previous_usernames', JSON.stringify(updatedUsernames));
          
          // Set as current username
          setGlobalUsername(trimmedUsername);
          setNewUsername('');
          setShowUsernameSelector(false);
          
          // If currently seated, update the lobby
          if (isSeated) {
            try {
              await handleLeaveLobby();
              await handleJoinLobby(selectedSeatIndex!);
            } catch (error) {
              console.error('Error updating username in lobby:', error);
            }
          }
        } else {
          setError({
            message: 'Failed to register username',
            details: result.message || 'Registration failed',
            suggestions: ['Try a different username', 'Check your internet connection'],
            retryable: true,
            operation: 'registerUser'
          });
        }
      } else {
        setError({
          message: 'Username not available',
          details: validation.message || 'Username is already taken',
          suggestions: validation.suggestions || ['Try a different username', 'Add numbers to your username'],
          retryable: false,
          operation: 'validateUsername'
        });
      }
    } catch (error) {
      console.error('Username registration error:', error);
      setError({
        message: 'Unable to validate username',
        details: 'Network error during validation',
        suggestions: ['Check your internet connection', 'Try again', 'Switch to single player mode'],
        retryable: true,
        operation: 'validateUsername'
      });
    }
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

  const getResponsiveStyles = () => {
    const layout = DeviceDetection.getCurrentLayout();
    const isLandscape = layout.orientation === 'landscape';
    const isTablet = layout.device === 'ipad';
    
    if (isTablet && isLandscape) {
      return {
        container: {
          width: '100vw',
          height: '100vh',
          background: getBackgroundGradient(settings.backgroundColor),
          display: 'flex',
          flexDirection: 'column' as const,
          padding: '10px',
          gap: '5px'
        },
        header: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '5px'
        },
        content: {
          display: 'flex',
          flex: 1,
          gap: '5px'
        },
        leftColumn: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '5px'
        },
        centerColumn: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '5px'
        },
        rightColumn: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '5px'
        }
      };
    }
    
    return {
      container: {
        width: '100vw',
        height: '100vh',
        background: getBackgroundGradient(settings.backgroundColor),
        display: 'flex',
        flexDirection: 'column' as const,
        padding: '20px',
        gap: '15px'
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px'
      },
      content: {
        display: 'flex',
        flexDirection: 'column' as const,
        flex: 1,
        gap: '15px'
      }
    };
  };

  const handleJoinLobby = async (seatIndex: number) => {
    if (loading) return;
    
    setLoading(true);
    clearError();
    
    try {
      console.log('🎮 MultiplayerLobby: Joining lobby for difficulty:', selectedDifficulty);
      
      const result = await multiplayerService.joinLobby(selectedDifficulty, effectiveUsername);
      
      if (!result.success) {
        if (result.error) {
          handleServiceError(result.error, 'joinLobby');
        } else {
          setError({
            message: 'Failed to join lobby',
            details: result.message || 'Unknown error occurred',
            suggestions: ['Try again', 'Check your internet connection', 'Switch to single player mode'],
            retryable: true,
            operation: 'joinLobby'
          });
        }
        return;
      }
      
      setIsSeated(true);
      setSelectedSeatIndex(seatIndex);
      
      console.log('🎮 MultiplayerLobby: Successfully joined lobby:', result);
      
      // Play success sound
      soundUtils.playVolumeTestSound();
      
    } catch (error) {
      console.error('🎮 MultiplayerLobby: Error joining lobby:', error);
      setError({
        message: 'Failed to join lobby',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        suggestions: ['Try again', 'Check your internet connection', 'Switch to single player mode'],
        retryable: true,
        operation: 'joinLobby'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveLobby = async () => {
    if (loading) return;
    
    setLoading(true);
    clearError();
    
    try {
      const success = await multiplayerService.leaveLobby(selectedDifficulty);
      
      if (!success) {
        setError({
          message: 'Failed to leave lobby',
          details: 'Could not leave the lobby properly',
          suggestions: ['Try again', 'Switch to single player mode'],
          retryable: true,
          operation: 'leaveLobby'
        });
        return;
      }
      
      setIsSeated(false);
      setSelectedSeatIndex(null);
      
      console.log('🎮 MultiplayerLobby: Successfully left lobby');
      
    } catch (error) {
      console.error('🎮 MultiplayerLobby: Error leaving lobby:', error);
      setError({
        message: 'Failed to leave lobby',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        suggestions: ['Try again', 'Switch to single player mode'],
        retryable: true,
        operation: 'leaveLobby'
      });
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
    
    // Leave lobby if seated
    if (isSeated) {
      multiplayerService.leaveLobby(selectedDifficulty).catch(console.error);
    }
  };

  const renderGameTable = () => {
    const layout = DeviceDetection.getCurrentLayout();
    const isLandscape = layout.orientation === 'landscape';
    const isTablet = layout.device === 'ipad';
    
    if (isTablet && isLandscape) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '5px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}>
            <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
              Players in {DIFFICULTY_CONFIGS[selectedDifficulty as keyof typeof DIFFICULTY_CONFIGS]?.label}: {difficultyInterest[selectedDifficulty] || 0}
            </span>
            <button
              onClick={() => setShowUsernameSelector(!showUsernameSelector)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 10px',
                color: '#ffffff',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {effectiveUsername || 'Choose username...'}
            </button>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr 1fr', 
            gap: '5px',
            flex: 1
          }}>
            {[0, 1, 2, 3].map((seatIndex) => {
              const isOccupied = lobbyState.players.some(p => p.seatIndex === seatIndex);
              const isCurrentUser = isSeated && selectedSeatIndex === seatIndex;
              const isOccupiedByOther = isOccupied && !isCurrentUser;
              
              return (
                <div
                  key={seatIndex}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '10px',
                    background: isOccupied ? '#ffffff' : 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: '12px',
                    border: '2px solid #3b82f6',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    cursor: isOccupied ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => !isOccupied && handleJoinLobby(seatIndex)}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isOccupied ? '#ffffff' : 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)',
                    border: '2px solid #3b82f6',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e40af'
                  }}>
                    {isOccupied ? (
                      <span style={{ fontSize: '22px' }}>
                        {seatIndex === 0 ? '♔' : seatIndex === 1 ? '♘' : seatIndex === 2 ? '♖' : '♗'}
                      </span>
                    ) : (
                      seatIndex + 1
                    )}
                  </div>
                  
                  <div style={{
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#1e40af',
                    fontWeight: 'bold',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {isCurrentUser ? effectiveUsername : isOccupiedByOther ? 'Player' : 'Empty'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    // Portrait layout
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}>
          <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
            Players in {DIFFICULTY_CONFIGS[selectedDifficulty as keyof typeof DIFFICULTY_CONFIGS]?.label}: {difficultyInterest[selectedDifficulty] || 0}
          </span>
          <button
            onClick={() => setShowUsernameSelector(!showUsernameSelector)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {effectiveUsername || 'Choose username...'}
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '15px',
          flex: 1
        }}>
          {[0, 1, 2, 3].map((seatIndex) => {
            const isOccupied = lobbyState.players.some(p => p.seatIndex === seatIndex);
            const isCurrentUser = isSeated && selectedSeatIndex === seatIndex;
            const isOccupiedByOther = isOccupied && !isCurrentUser;
            
            return (
              <div
                key={seatIndex}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '20px',
                  background: isOccupied ? '#ffffff' : 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)',
                  borderRadius: '16px',
                  border: '3px solid #3b82f6',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                  cursor: isOccupied ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onClick={() => !isOccupied && handleJoinLobby(seatIndex)}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isOccupied ? '#ffffff' : 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)',
                  border: '3px solid #3b82f6',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1e40af'
                }}>
                  {isOccupied ? (
                    <span style={{ fontSize: '32px' }}>
                      {seatIndex === 0 ? '♔' : seatIndex === 1 ? '♘' : seatIndex === 2 ? '♖' : '♗'}
                    </span>
                  ) : (
                    seatIndex + 1
                  )}
                </div>
                
                <div style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#1e40af',
                  fontWeight: 'bold',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {isCurrentUser ? effectiveUsername : isOccupiedByOther ? 'Player' : 'Empty'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const styles = getResponsiveStyles();

  // Error overlay
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Multiplayer Lobby</h1>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: '20px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          margin: '20px'
        }}>
          <AlertCircle size={48} color="#ef4444" />
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '20px' }}>
              {error.message}
            </h2>
            <p style={{ color: '#ffffff', margin: '0 0 20px 0', fontSize: '14px', opacity: 0.8 }}>
              {error.details}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
            {error.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  if (suggestion.includes('Try again') && error.retryable) {
                    retryOperation();
                  } else if (suggestion.includes('Switch to single player')) {
                    switchToSinglePlayer();
                  } else {
                    clearError();
                  }
                }}
                style={{
                  background: suggestion.includes('Try again') ? '#3b82f6' : 
                           suggestion.includes('Switch to single player') ? '#ef4444' : 
                           'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                disabled={loading}
              >
                {suggestion.includes('Try again') && <RefreshCw size={16} />}
                {suggestion.includes('Switch to single player') && <Home size={16} />}
                {suggestion}
              </button>
            ))}
          </div>
          
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <Loader size={16} className="animate-spin" />
              Retrying...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Multiplayer Lobby</h1>
      </div>

      <div style={styles.content}>
        {DeviceDetection.getCurrentLayout().device === 'ipad' && DeviceDetection.getCurrentLayout().orientation === 'landscape' ? (
          // Three-column layout for iPad landscape
          <>
            <div style={styles.leftColumn}>
              {renderGameTable()}
            </div>
            <div style={styles.centerColumn}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                flex: 1
              }}>
                <div style={{
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ color: '#ffffff', margin: '0 0 5px 0', fontSize: '14px' }}>Difficulty</h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px'
                  }}>
                    {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => handleDifficultyChange(key)}
                        style={{
                          background: selectedDifficulty === key ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          color: '#ffffff',
                          fontSize: '10px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontWeight: 'bold' }}>{config.label}</div>
                        <div style={{ fontSize: '8px', opacity: 0.8 }}>{config.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {isSeated && (
                  <button
                    onClick={handleLeaveLobby}
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Leaving...' : 'Leave Lobby'}
                  </button>
                )}
              </div>
            </div>
            <div style={styles.rightColumn}>
              <div style={{
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                height: 'fit-content'
              }}>
                <h3 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '14px' }}>Lobby Status</h3>
                <div style={{ color: '#ffffff', fontSize: '12px' }}>
                  <div>Players waiting: {lobbyState.playersWaiting}</div>
                  {lobbyState.gameId && <div>Game ID: {lobbyState.gameId}</div>}
                  {countdown && <div>Countdown: {countdown}s</div>}
                </div>
              </div>
            </div>
          </>
        ) : (
          // Single column layout for portrait
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px'
            }}>
              <h3 style={{ color: '#ffffff', margin: 0, fontSize: '16px' }}>Select Difficulty</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleDifficultyChange(key)}
                    style={{
                      background: selectedDifficulty === key ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
            
            {renderGameTable()}
            
            {isSeated && (
              <button
                onClick={handleLeaveLobby}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px',
                  color: '#ffffff',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                disabled={loading}
              >
                {loading ? 'Leaving...' : 'Leave Lobby'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Username Selector */}
      <AnimatePresence>
        {showUsernameSelector && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowUsernameSelector(false)}
          >
            <motion.div
              style={{
                background: getBackgroundGradient(settings.backgroundColor),
                padding: '20px',
                borderRadius: '16px',
                minWidth: '300px',
                maxWidth: '90%',
                border: '2px solid #3b82f6'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ color: '#ffffff', margin: '0 0 15px 0', textAlign: 'center' }}>
                Select Username
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #3b82f6',
                    fontSize: '14px',
                    background: 'rgba(255, 255, 255, 0.9)'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleNewUsername()}
                />
              </div>
              
              {previousUsernames.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '14px' }}>
                    Previous Usernames:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {previousUsernames.map((username, index) => (
                      <button
                        key={index}
                        onClick={() => handleUsernameSelect(username)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {username}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowUsernameSelector(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewUsername}
                  style={{
                    flex: 1,
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Set Username
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdownStarted && countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              style={{
                background: getBackgroundGradient(settings.backgroundColor),
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '3px solid #3b82f6'
              }}
            >
              <h2 style={{ color: '#ffffff', margin: '0 0 20px 0', fontSize: '24px' }}>
                Game Starting!
              </h2>
              <div style={{ color: '#ffffff', fontSize: '48px', fontWeight: 'bold' }}>
                {countdown}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Start Overlay */}
      <AnimatePresence>
        {showGameStartOverlay && gameStartCountdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              style={{
                background: getBackgroundGradient(settings.backgroundColor),
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '3px solid #3b82f6'
              }}
            >
              <h2 style={{ color: '#ffffff', margin: '0 0 20px 0', fontSize: '24px' }}>
                Multiplayer Game Starting!
              </h2>
              <div style={{ color: '#ffffff', fontSize: '48px', fontWeight: 'bold' }}>
                {gameStartCountdown}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};