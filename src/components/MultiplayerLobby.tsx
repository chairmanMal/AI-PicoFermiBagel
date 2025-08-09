// src/components/MultiplayerLobby.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ArrowLeft, 
  Crown,
  Loader,
  AlertCircle,
  Gamepad2
} from 'lucide-react';
import { multiplayerService, LobbyUpdate } from '../services/multiplayerService';
import { DeviceDetection } from '../utils/deviceDetection';
import { soundUtils } from '../utils/soundUtils';
import { useGameStore } from '../stores/gameStore';
import { authService } from '../services/authService';
import { getChessPieceForSeat, getOtherPlayerChessPiece } from '../assets/chess-pieces';

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
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentLayout, setCurrentLayout] = useState(() => DeviceDetection.getCurrentLayout());
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
  const [showGameStartOverlay, setShowGameStartOverlay] = useState(false);
  const [selectedSeatIndex, setSelectedSeatIndex] = useState<number | null>(null);
  const [difficultyInterestCounts, setDifficultyInterestCounts] = useState<Record<string, number> | null>(null);
  
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const gameStartSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use global username from gameStore
  const { globalUsername: storeGlobalUsername, setGlobalUsername } = useGameStore();
  
  // Use passed globalUsername or fall back to store's globalUsername
  const effectiveUsername = globalUsername || storeGlobalUsername || 'Player';
  
  // Handle navigation to main menu for authentication
  const handleNavigateToMenu = () => {
    const event = new CustomEvent('navigateToMenu');
    window.dispatchEvent(event);
  };
  
  // Fetch difficulty interest counts for all difficulties
  const fetchDifficultyInterestCounts = async () => {
    try {
      console.log('🎮 MultiplayerLobby: Fetching difficulty interest counts from AWS');
      const counts = await multiplayerService.getDifficultyInterestCounts();
      console.log('🎮 MultiplayerLobby: Received difficulty interest counts:', counts);
      console.log('🎮 MultiplayerLobby: Type of counts:', typeof counts, 'Is null:', counts === null);
      
      if (counts === null) {
        // AWS query not available, set to null to show "Interest count unavailable"
        console.log('🎮 MultiplayerLobby: Setting to null - AWS query not available');
        setDifficultyInterestCounts(null);
      } else {
        console.log('🎮 MultiplayerLobby: Setting counts:', counts);
        console.log('🎮 MultiplayerLobby: Classic count specifically:', counts['classic']);
        setDifficultyInterestCounts(counts);
      }
    } catch (error) {
      console.warn('🎮 MultiplayerLobby: Failed to fetch difficulty interest counts:', error);
      // Set to null to show "Interest count unavailable"
      setDifficultyInterestCounts(null);
    }
  };

  const fetchLobbyStatus = async () => {
    try {
      console.log('🎮 MultiplayerLobby: Fetching lobby status for:', selectedDifficulty);
      const status = await multiplayerService.getLobbyStatus(selectedDifficulty);
      console.log('🎮 MultiplayerLobby: Received lobby status:', status);
      
      if (status) {
        setLobbyState(prev => ({
          ...prev,
          playersWaiting: status.playersWaiting,
          players: status.players,
          gameId: status.gameId,
          countdown: status.countdown
        }));
      }
    } catch (error) {
      console.error('🎮 MultiplayerLobby: Failed to fetch lobby status:', error);
    }
  };
  
  // Load previous usernames and set initial username
  useEffect(() => {
    // Use the passed globalUsername if available, otherwise use store's globalUsername
    if (globalUsername) {
      console.log('🎮 MultiplayerLobby: Using passed username:', globalUsername);
      setGlobalUsername(globalUsername);
    }
    
    console.log('🎮 MultiplayerLobby: Final selected username:', effectiveUsername);
    
    // Fetch initial data
    fetchDifficultyInterestCounts();
    fetchLobbyStatus();
    
    let subscription: { unsubscribe: () => void } | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    
    // Subscribe to real-time difficulty interest updates (delayed to avoid overriding initial data)
    setTimeout(async () => {
      try {
        console.log('🎮 MultiplayerLobby: Setting up subscription after initial query...');
        subscription = await multiplayerService.subscribeDifficultyInterestUpdates((updates) => {
          console.log('🎮 MultiplayerLobby: Received difficulty interest updates:', updates);
          
          // Only update if we have valid data
          if (updates && updates.length > 0) {
            // Convert updates to the expected format
            const counts: Record<string, number> = {};
            updates.forEach(update => {
              counts[update.difficulty] = update.interestCount;
            });
            
            console.log('🎮 MultiplayerLobby: Updating interest counts from subscription:', counts);
            setDifficultyInterestCounts(counts);
          }
        });
      } catch (error) {
        console.error('🎮 MultiplayerLobby: Failed to setup subscription:', error);
      }
    }, 3000); // Wait 3 seconds before setting up subscription
    
    // Start heartbeat
    heartbeatInterval = startHeartbeat();
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      // Cleanup interest when component unmounts
      cleanupInterest();
    };
  }, [globalUsername, setGlobalUsername]);

  // Handle app lifecycle events for immediate cleanup and return
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🎮 MultiplayerLobby: App unloading, cleaning up interest');
      cleanupInterest();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🎮 MultiplayerLobby: App becoming hidden, cleaning up interest');
        cleanupInterest();
      } else {
        console.log('🎮 MultiplayerLobby: App becoming visible, re-registering interest');
        reRegisterInterest();
      }
    };

    const handlePageHide = () => {
      console.log('🎮 MultiplayerLobby: Page hiding, cleaning up interest');
      cleanupInterest();
    };

    const handlePageShow = () => {
      console.log('🎮 MultiplayerLobby: Page showing, re-registering interest');
      reRegisterInterest();
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      // Remove event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [selectedDifficulty]);

  // Initialize difficulty interest tracking
  useEffect(() => {
    const initializeDifficultyInterest = async () => {
      try {
        // Announce lobby entry to AWS (triggers subscription updates to all clients)
        await multiplayerService.announceLobbyEntry(selectedDifficulty);
        console.log('🎮 MultiplayerLobby: Announced lobby entry for:', selectedDifficulty);
      } catch (error) {
        console.error('🎮 MultiplayerLobby: Failed to announce lobby entry:', error);
      }
    };

    initializeDifficultyInterest();
  }, [selectedDifficulty]);

  // Heartbeat functionality
  const startHeartbeat = () => {
    if (selectedDifficulty) {
      const heartbeatInterval = setInterval(async () => {
        try {
          await multiplayerService.sendHeartbeat(selectedDifficulty);
        } catch (error) {
          console.error('🎮 MultiplayerLobby: Heartbeat failed:', error);
        }
      }, 30000); // Send heartbeat every 30 seconds
      
      return heartbeatInterval;
    }
    return null;
  };

  // Cleanup function to remove interest when leaving
  const cleanupInterest = async () => {
    if (selectedDifficulty) {
      try {
        console.log('🎮 MultiplayerLobby: Cleaning up interest for:', selectedDifficulty);
        await multiplayerService.removeDifficultyInterest(selectedDifficulty);
      } catch (error) {
        console.error('🎮 MultiplayerLobby: Failed to cleanup interest:', error);
      }
    }
  };

  // Re-register interest when returning to lobby
  const reRegisterInterest = async () => {
    if (selectedDifficulty) {
      try {
        console.log('🎮 MultiplayerLobby: Re-registering interest for:', selectedDifficulty);
        await multiplayerService.updateDifficultyInterest(selectedDifficulty, true);
        console.log('🎮 MultiplayerLobby: Successfully re-registered interest');
      } catch (error) {
        console.error('🎮 MultiplayerLobby: Failed to re-register interest:', error);
      }
    }
  };

  // Navigation cleanup - called when leaving the lobby component
  const handleNavigationAway = async () => {
    console.log('🎮 MultiplayerLobby: Navigation away detected, cleaning up...');
    await cleanupInterest();
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    // No dropdowns to close anymore
    return () => {
      // No cleanup needed
    };
  }, []);

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
    // Handle countdown - only start if we have 2+ players
    const playerCount = lobbyState.players.length;
    const shouldStartCountdown = lobbyState.countdown && lobbyState.countdown > 0 && playerCount >= 2;
    
    if (shouldStartCountdown) {
      setCountdown(lobbyState.countdown!);
      
      // Play countdown sound when countdown starts
      if (!countdownStarted) {
        setCountdownStarted(true);
        console.log('⏱️ Starting countdown with', playerCount, 'players');
        // Play the countdown sound effect using soundUtils
        soundUtils.playStopwatchSound().catch(error => {
          console.error('Failed to play countdown sound:', error);
        });
      }
      
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            setCountdownStarted(false); // Reset for next countdown
            
            // Stop the stopwatch sound when countdown reaches 1
            soundUtils.stopAllAudio();
            
            // Handle countdown reaching 0
            handleCountdownEnd();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(null);
      setCountdownStarted(false); // Reset when countdown ends
      // Stop the stopwatch sound when countdown is cancelled
      soundUtils.stopAllAudio();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [lobbyState.countdown, countdownStarted, lobbyState.players.length]);

  // Handle countdown reaching 0
  const handleCountdownEnd = () => {
    // Stop the stopwatch sound
    soundUtils.stopAllAudio();
    
    const playerCount = lobbyState.players.length;
    
    if (playerCount < 2) {
      // Not enough players - unseat current player
      console.log('Countdown ended with insufficient players, unseating player');
      setIsSeated(false);
      setLobbyState(prev => ({
        ...prev,
        playersWaiting: 0,
        players: []
      }));
    } else {
      // Enough players - start game with 5-second countdown
      console.log('Countdown ended with sufficient players, starting game');
      startGameWithCountdown();
    }
  };

  // Start game with 5-second countdown and fanfare
  const startGameWithCountdown = () => {
    setShowGameStartOverlay(true);
    setGameStartCountdown(5);
    
    // Play fanfare sound using soundUtils
    soundUtils.playFanfareSound().catch(error => {
      console.error('Failed to play fanfare sound:', error);
    });
    
    // Start 5-second countdown
    const gameStartInterval = setInterval(() => {
      setGameStartCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(gameStartInterval);
          // Start the game
          // startMultiplayerGame(); // This function is removed
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Remove the placeholder startMultiplayerGame function - real game start comes from AWS
  // const startMultiplayerGame = () => {
  //   setShowGameStartOverlay(false);
  //   setGameStartCountdown(null);
  //   
  //   // Get game data from AWS (this would come from the lobby update)
  //   const gameData = {
  //     difficulty: selectedDifficulty,
  //     players: lobbyState.players,
  //     gameId: lobbyState.gameId,
  //     // AWS would provide the random seed here
  //     randomSeed: Math.floor(Math.random() * 1000000) // Placeholder - should come from AWS
  //   };
  //   
  //   // Call the game start handler
  //   onGameStart(gameData);
  // };

  const subscribeToLobby = (difficulty: string) => {
    console.log('🏆 subscribeToLobby called for difficulty:', difficulty);
    
    if (subscriptionRef.current) {
      console.log('🏆 Unsubscribing from previous lobby subscription');
      subscriptionRef.current.unsubscribe();
    }

    console.log('🏆 Setting up new lobby subscription');
            subscriptionRef.current = multiplayerService.subscribeLobbyUpdates(
          difficulty,
          (update: LobbyUpdate) => {
            console.log('🏆 Lobby update received:', update);
            console.log('🏆 Current selectedUsername:', effectiveUsername);
            console.log('🏆 Current lobbyState:', lobbyState);
            
            // Merge current local players with AWS update
            setLobbyState(prev => {
              // Keep current player if they're seated locally but not in AWS update
              const currentPlayer = prev.players.find(p => p.username === effectiveUsername);
              const awsPlayers = update.players || [];
              
              let mergedPlayers = [...awsPlayers];
              if (currentPlayer && !awsPlayers.find(p => p.username === effectiveUsername)) {
                mergedPlayers.push(currentPlayer);
              }
              
              // Only start countdown if we have 2 or more players AND we're not the only one
              const uniquePlayers = mergedPlayers.filter((player, index, self) => 
                self.findIndex(p => p.username === player.username) === index
              );
              const shouldStartCountdown = uniquePlayers.length >= 2 && !prev.countdown;
              const countdown = shouldStartCountdown ? 30 : update.countdown;
              
              // Calculate actual player count based on seated players
              const actualPlayerCount = mergedPlayers.filter(player => player !== null && player !== undefined).length;
              
              console.log('🏆 Merged players:', mergedPlayers);
              console.log('🏆 Actual player count:', actualPlayerCount);
              console.log('🏆 Should start countdown:', shouldStartCountdown);
              
              return {
                playersWaiting: actualPlayerCount,
                gameId: update.gameId,
                countdown: countdown,
                players: mergedPlayers
              };
            });
          }
        );
        
        // Remove fallback mock player - users should manually select seats
  };

  const handleDifficultyChange = async (newDifficulty: string) => {
    if (loading) return;
    
    const previousDifficulty = selectedDifficulty;
    console.log('🎮 MultiplayerLobby: Changing difficulty from', previousDifficulty, 'to', newDifficulty);
    
    // Update local state immediately for better UX
    setSelectedDifficulty(newDifficulty);
    
    // Notify AWS of difficulty interest change
    try {
      console.log('🎮 MultiplayerLobby: Updating AWS interest - joining', newDifficulty);
      await multiplayerService.updateDifficultyInterest(newDifficulty, true); // Join new difficulty
      
      console.log('🎮 MultiplayerLobby: Successfully updated difficulty interest in AWS');
    } catch (error) {
      console.error('🎮 MultiplayerLobby: Failed to update difficulty interest:', error);
      // Revert local state if AWS update failed
      setSelectedDifficulty(previousDifficulty);
    }
    
    if (isSeated) {
      await handleLeaveLobby();
    }
  };

  // Track if this is the initial mount to prevent double registration
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Handle when player returns to lobby (difficulty changes only, not initial mount)
  useEffect(() => {
    if (selectedDifficulty && !isInitialMount) {
      console.log('🎮 MultiplayerLobby: Difficulty changed, re-registering interest for:', selectedDifficulty);
      reRegisterInterest();
    }
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [selectedDifficulty]);

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

  const handleJoinLobby = async (seatIndex: number) => {
    if (loading) return;
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      // setShowAuthNotice(true); // This state is removed
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🎮 MultiplayerLobby: Attempting to join lobby for difficulty:', selectedDifficulty);
      const result = await multiplayerService.joinLobby(selectedDifficulty, effectiveUsername);
      
      if (result.success) {
        console.log('🎮 MultiplayerLobby: Successfully joined lobby:', result);
        setIsSeated(true);
        setSelectedSeatIndex(seatIndex);
        setLobbyState(prev => ({
          ...prev,
          playersWaiting: result.playersWaiting || 0,
          gameId: result.gameId,
          countdown: result.countdown
        }));
        
        // Play join sound
        soundUtils.playGameWonSound();
      } else {
        console.error('🎮 MultiplayerLobby: Failed to join lobby:', result.error);
        setError(result.error?.message || 'Failed to join lobby. Please try again.');
      }
    } catch (error) {
      console.error('🎮 MultiplayerLobby: Error joining lobby:', error);
      setError('Failed to join lobby. Please check your connection and try again.');
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
      setSelectedSeatIndex(null);
      setLobbyState(prev => ({
        ...prev,
        playersWaiting: Math.max(0, prev.playersWaiting - 1),
        players: prev.players.filter(player => player.username !== effectiveUsername)
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
    // const radius = tableSize * 0.35;
    
    return (
      <div style={{ position: 'relative', width: tableSize, height: tableSize }}>
        {/* Octagonal Poker Table - Using the provided image */}
        <div style={{
          width: tableSize,
          height: tableSize,
          backgroundImage: 'url(/game_table.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          margin: '0 auto'
        }}>
          {/* Logo in center */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: tableSize * 0.375,
            height: tableSize * 0.375,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/splash-logo.png" 
              alt="Game Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
            {countdown && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: tableSize * 0.08,
                fontWeight: 'bold',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '50%',
                width: tableSize * 0.12,
                height: tableSize * 0.12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {countdown}
              </div>
            )}
          </div>
          
          {/* Player seats positioned around the octagonal table */}
          {seatPositions.map(({ x, y, index }) => {
            // Check if this seat should show the current user (either from players array or selected seat)
            const player = players[index];
            const isEmpty = !player && !(isSeated && selectedSeatIndex === index);
            const isCurrentUser = player?.username === effectiveUsername || (isSeated && selectedSeatIndex === index);
            const isOccupiedByOther = player && player.username !== effectiveUsername;
            
            // Determine username position based on seat index
            const isTopSeat = index === 0;    // Top seat
            const isRightSeat = index === 1;   // Right seat
            const isBottomSeat = index === 2;  // Bottom seat
            const isLeftSeat = index === 3;    // Left seat
            
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
              >
                {isEmpty ? (
                  <button
                    onClick={!isSeated ? () => handleJoinLobby(index) : undefined}
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
                  <>
                    {/* Occupied seat */}
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
                      {isCurrentUser && <Crown style={{ width: tableSize * 0.08, height: tableSize * 0.08 }} />}
                      {isOccupiedByOther && (
                        <img 
                          src={getOtherPlayerChessPiece(index)}
                          alt="Chess piece"
                          style={{ 
                            width: tableSize * 0.12, 
                            height: tableSize * 0.12,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Username positioned outside seat - Horizontal labels */}
                    <div style={{
                      position: 'absolute',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: tableSize * 0.05, // Increased from 0.04 to 0.05
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      whiteSpace: 'nowrap',
                      overflow: 'visible', // Ensure no overflow clipping
                      textOverflow: 'clip', // Prevent text truncation
                      zIndex: 4,
                      maxWidth: 'none', // Remove any max-width constraints
                      ...(isTopSeat && {
                        bottom: '120%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center'
                      }),
                      ...(isBottomSeat && {
                        top: '120%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center'
                      }),
                      ...(isLeftSeat && {
                        right: '120%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        textAlign: 'right'
                      }),
                      ...(isRightSeat && {
                        left: '120%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        textAlign: 'left'
                      })
                    }}>
                      {/* Full username without truncation */}
                      <span style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'clip'
                      }}>
                        {player?.username || (isCurrentUser ? effectiveUsername : '')}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* Game info */}
        <div style={{ 
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '100%'
        }}>

          
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
                marginTop: '12px',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
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
              {difficultyInterestCounts === null ? (
                <div style={{ 
                  fontSize: '0.7em', 
                  opacity: 0.8, 
                  marginTop: '2px',
                  color: 'rgba(255, 255, 255, 0.8)' // Same color as description text
                }}>
                  Interest count unavailable
                </div>
              ) : difficultyInterestCounts[key] !== undefined && (
                <div style={{ 
                  fontSize: '0.7em', 
                  opacity: 0.8, 
                  marginTop: '2px',
                  color: 'rgba(255, 255, 255, 0.8)' // Same color as description text
                }}>
                  {/* Subtract current player's interest from the total count */}
                  {(() => {
                    const totalCount = difficultyInterestCounts[key] || 0;
                    const isSelected = selectedDifficulty === key;
                    const otherPlayerCount = Math.max(0, totalCount - (isSelected ? 1 : 0));
                    console.log(`🎮 MultiplayerLobby: ${key} - Total: ${totalCount}, Selected: ${isSelected}, Other: ${otherPlayerCount}, Raw data:`, difficultyInterestCounts);
                    if (otherPlayerCount === 0) {
                      return '0 players interested';
                    } else if (otherPlayerCount === 1) {
                      return '1 other player interested';
                    } else {
                      return `${otherPlayerCount} players interested`;
                    }
                  })()}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Username Selector */}
      <div style={styles.difficultySection}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users style={{ width: '20px', height: '20px', color: 'white' }} />
            <h2 style={{ 
              ...styles.difficultyTitle, 
              marginBottom: '0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white'
            }}>Current User</h2>
          </div>
          
          {/* Simplified Username Display */}
          <div style={{ position: 'relative', flex: 1 }}>
            {authService.isAuthenticated() ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                height: '36px',
                boxSizing: 'border-box'
              }}>
                <span>{effectiveUsername}</span>
                <button
                  onClick={handleNavigateToMenu}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Change User
                </button>
              </div>
            ) : (
              <button
                onClick={handleNavigateToMenu}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '36px',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)'}
              >
                Sign in to play multiplayer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Player Count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: 'white',
        marginBottom: '16px',
        fontSize: '16px',
        fontWeight: 'bold',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
      }}>
        <Users style={{ width: '20px', height: '20px' }} />
        <span>{lobbyState.playersWaiting} of 4 players</span>
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

      {/* Game Start Overlay */}
      <AnimatePresence>
        {showGameStartOverlay && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                color: 'white',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 style={{ 
                fontSize: '24px', 
                marginBottom: '16px',
                color: '#60a5fa',
                fontWeight: 'bold'
              }}>
                Game Starting!
              </h2>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#fbbf24',
                marginBottom: '16px',
                textShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
              }}>
                {gameStartCountdown}
              </div>
              <p style={{ 
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0
              }}>
                Get ready to play!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Plus icon component (since it might not be in lucide-react)
// const Plus: React.FC<{ className?: string }> = ({ className }) => (
//   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//   </svg>
// );