import React, { useEffect, useState } from 'react';
import GameScreen from './components/GameScreen';
import SplashScreen from './components/SplashScreen';
import { forceCleanupDragIndicators } from '@/utils/dragCleanup';
import { initializeSoundVolume } from '@/utils/soundUtils';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayerStore } from '@/stores/multiplayerStore';
import './App.css';

// Multiplayer components (only imported if needed)
import { UsernameRegistration } from './components/UsernameRegistration';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerGameProgress } from './components/MultiplayerGameProgress';
import { MultiplayerResults } from './components/MultiplayerResults';
import multiplayerService, { GameStartEvent, GameEndResult } from './services/multiplayerService';
import MainMenu from './components/MainMenu';
import LeaderboardScreen from './components/LeaderboardScreen';

type AppScreen = 
  | 'splash' 
  | 'menu'
  | 'singlePlayer' 
  | 'usernameRegistration' 
  | 'multiplayerLobby' 
  | 'multiplayerGame'
  | 'multiplayerResults'
  | 'leaderboard';

const App: React.FC = () => {
  const { settings, globalUsername } = useGameStore();
  const multiplayerStore = useMultiplayerStore();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [navigationHistory, setNavigationHistory] = useState<AppScreen[]>([]);
  const [awsInitialized, setAwsInitialized] = useState(false);
  const [isConnectingToAWS, setIsConnectingToAWS] = useState(false);
  const [multiplayerResults] = useState<GameEndResult | null>(null);

  // Initialize sound volume on app start
  useEffect(() => {
    initializeSoundVolume(settings.soundVolume);
  }, [settings.soundVolume]);

  // Cleanup drag indicators on unmount
  useEffect(() => {
    return () => {
      forceCleanupDragIndicators();
    };
  }, []);

  // Initialize multiplayer when needed
  const initializeMultiplayer = async () => {
    if (awsInitialized) return;
    
    try {
      await multiplayerStore.initializeMultiplayer();
      setAwsInitialized(true);
      console.log('✅ Multiplayer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize multiplayer:', error);
      throw error;
    }
  };

  // Reset multiplayer state only when in lobby
  const resetMultiplayerStateIfInLobby = () => {
    if (currentScreen === 'multiplayerLobby') {
      console.log('🔄 Resetting multiplayer state due to username change in lobby');
      setAwsInitialized(false);
      multiplayerStore.cleanupMultiplayer();
    } else {
      console.log('👤 Username changed but not in lobby - no reset needed');
    }
  };

  // Navigation helper that tracks history
  const navigateTo = (screen: AppScreen) => {
    console.log(`🔄 Navigating from ${currentScreen} to ${screen}`);
    setNavigationHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  // Navigation helper that goes back to previous screen
  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const previousScreen = navigationHistory[navigationHistory.length - 1];
      console.log(`🔄 Navigating back from ${currentScreen} to ${previousScreen}`);
      setCurrentScreen(previousScreen);
      setNavigationHistory(prev => prev.slice(0, -1));
    } else {
      // Fallback to menu if no history
      console.log(`🔄 No navigation history, falling back to menu`);
      setCurrentScreen('menu');
      setNavigationHistory([]);
    }
  };

  const handleSplashComplete = () => {
    console.log('🎮 App: Splash complete, navigating to menu');
    navigateTo('menu');
  };

  const handleSinglePlayerStart = () => {
    console.log('🎮 Starting single player mode');
    navigateTo('singlePlayer');
  };

  const handleMultiplayerClick = async () => {
    // Set connecting state
    setIsConnectingToAWS(true);
    
    // Try to initialize AWS if not already initialized
    if (!awsInitialized) {
      try {
        await initializeMultiplayer();
      } catch (error) {
        setIsConnectingToAWS(false);
        alert('Multiplayer features are not available. Please check your connection.');
        return;
      }
    }

    try {
      const hasUsername = await multiplayerService.hasRegisteredUsername();
      setIsConnectingToAWS(false);
      if (hasUsername) {
        navigateTo('multiplayerLobby');
      } else {
        navigateTo('usernameRegistration');
      }
    } catch (error) {
      setIsConnectingToAWS(false);
      console.warn('Multiplayer service error:', error);
      // Fallback to username registration
      navigateTo('usernameRegistration');
    }
  };

  const handleUsernameRegistration = (username: string) => {
    console.log('🎮 App: Username registered:', username);
    console.log('🎮 App: Switching to multiplayer lobby');
    navigateTo('multiplayerLobby');
  };

  const handleGameStart = (gameData: GameStartEvent) => {
    console.log('Starting multiplayer game:', gameData);
    multiplayerStore.startMultiplayerGame(gameData);
    navigateTo('multiplayerGame');
  };

  const handleBackToMenu = () => {
    multiplayerStore.cleanupMultiplayer();
    setCurrentScreen('menu');
    setNavigationHistory([]);
  };

  // Listen for custom event from settings drawer
  useEffect(() => {
    const handleSwitchToMultiplayer = () => {
      console.log('🎮 App: Received switch to multiplayer event');
      handleMultiplayerClick();
    };

    const handleViewLeaderboardEvent = () => {
      console.log('🏆 App: Received view leaderboard event');
      handleViewLeaderboard();
    };

    const handleUsernameChangeEvent = () => {
      console.log('👤 App: Received username change event');
      resetMultiplayerStateIfInLobby();
    };

    window.addEventListener('switchToMultiplayer', handleSwitchToMultiplayer);
    window.addEventListener('viewLeaderboard', handleViewLeaderboardEvent);
    window.addEventListener('usernameChanged', handleUsernameChangeEvent);
    
    return () => {
      window.removeEventListener('switchToMultiplayer', handleSwitchToMultiplayer);
      window.removeEventListener('viewLeaderboard', handleViewLeaderboardEvent);
      window.removeEventListener('usernameChanged', handleUsernameChangeEvent);
    };
  }, []);

  const handleNewMultiplayerGame = () => {
    multiplayerStore.cleanupMultiplayer();
    navigateTo('multiplayerLobby');
  };

  const handleViewLeaderboard = () => {
    console.log('🏆 App: Navigating to leaderboard');
    navigateTo('leaderboard');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;
        
      case 'menu':
        return (
          <MainMenu
            onSinglePlayer={handleSinglePlayerStart}
            onMultiplayer={handleMultiplayerClick}
            multiplayerAvailable={true}
            isConnecting={isConnectingToAWS}
          />
        );
        
      case 'singlePlayer':
        return <GameScreen />;
        
      case 'usernameRegistration':
        return (
          <UsernameRegistration
            onRegistrationComplete={handleUsernameRegistration}
            onCancel={handleBackToMenu}
          />
        );
        
      case 'multiplayerLobby':
        return (
          <MultiplayerLobby
            onGameStart={handleGameStart}
            onBack={handleBackToMenu}
            globalUsername={globalUsername}
          />
        );
        
      case 'multiplayerGame':
        return (
          <div className="relative">
            <GameScreen />
            <MultiplayerGameProgress
              players={multiplayerStore.multiplayerPlayers}
              gameTimeElapsed={multiplayerStore.gameTimeElapsed}
              currentUsername={multiplayerStore.currentUsername || ''}
              isVisible={true}
              onToggleVisibility={() => {}}
            />
          </div>
        );
        
      case 'multiplayerResults':
        return multiplayerResults ? (
          <MultiplayerResults
            winner={multiplayerResults.winner || ''}
            rankings={multiplayerResults.rankings}
            currentUsername={multiplayerStore.currentUsername || ''}
            gameStats={{
              duration: multiplayerStore.endTime && multiplayerStore.startTime 
                ? Math.floor((multiplayerStore.endTime.getTime() - multiplayerStore.startTime.getTime()) / 1000)
                : 0,
              totalGuesses: multiplayerStore.guesses.length,
              averageScore: multiplayerResults.rankings.reduce((sum, r) => sum + r.score, 0) / multiplayerResults.rankings.length
            }}
            leaderboardData={[]}
            newPersonalBest={multiplayerResults.newPersonalBest}
            onNewGame={handleNewMultiplayerGame}
            onRematch={() => handleNewMultiplayerGame()}
            onViewLeaderboard={() => {}}
            onMainMenu={handleBackToMenu}
          />
        ) : (
          <div>Loading results...</div>
        );
        
      case 'leaderboard':
        return (
          <LeaderboardScreen
            onBack={navigateBack}
          />
        );
        
      default:
        return <GameScreen />;
    }
  };

  return (
    <div className="App">
      {renderCurrentScreen()}
    </div>
  );
};

export default App; 