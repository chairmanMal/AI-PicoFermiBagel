import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerGameProgress } from './components/MultiplayerGameProgress';
import { MultiplayerResults } from './components/MultiplayerResults';
import LeaderboardScreen from './components/LeaderboardScreen';
import { useMultiplayerStore } from './stores/multiplayerStore';
import { authService } from './services/authService';
import './App.css';
import { forceCleanupDragIndicators } from '@/utils/dragCleanup';
import { initializeSoundVolume } from '@/utils/soundUtils';
import { useGameStore } from '@/stores/gameStore';
import { GameStartEvent, GameEndResult } from './services/multiplayerService';

type AppScreen = 
  | 'splash' 
  | 'menu'
  | 'singlePlayer' 
  | 'multiplayerLobby' 
  | 'multiplayerGame'
  | 'multiplayerResults'
  | 'leaderboard';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [multiplayerResults] = useState<GameEndResult | null>(null);
  
  const multiplayerStore = useMultiplayerStore();
  const { settings } = useGameStore();

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

  // Reset multiplayer state only when in lobby
  const resetMultiplayerStateIfInLobby = () => {
    if (currentScreen === 'multiplayerLobby') {
      console.log('🔄 Resetting multiplayer state due to username change in lobby');
      multiplayerStore.cleanupMultiplayer();
    } else {
      console.log('👤 Username changed but not in lobby - no reset needed');
    }
  };

  // Navigation helper that tracks history
  const navigateTo = (screen: AppScreen) => {
    console.log(`🔄 Navigating from ${currentScreen} to ${screen}`);
    setCurrentScreen(screen);
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
    console.log('🎮 App: Multiplayer button clicked');
    
    // Check if user is authenticated
    const isAuthenticated = authService.isAuthenticated();
    if (!isAuthenticated) {
      console.log('🎮 App: User not authenticated, redirecting to menu for sign-in');
      navigateTo('menu');
      return;
    }

    console.log('🎮 App: User authenticated, navigating to multiplayer lobby');
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

    const handleNavigateToMenuEvent = () => {
      console.log('🔄 App: Received navigate to menu event');
      navigateTo('menu');
    };

    window.addEventListener('switchToMultiplayer', handleSwitchToMultiplayer);
    window.addEventListener('viewLeaderboard', handleViewLeaderboardEvent);
    window.addEventListener('usernameChanged', handleUsernameChangeEvent);
    window.addEventListener('navigateToMenu', handleNavigateToMenuEvent);
    
    return () => {
      window.removeEventListener('switchToMultiplayer', handleSwitchToMultiplayer);
      window.removeEventListener('viewLeaderboard', handleViewLeaderboardEvent);
      window.removeEventListener('usernameChanged', handleUsernameChangeEvent);
      window.removeEventListener('navigateToMenu', handleNavigateToMenuEvent);
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
            isConnecting={false} // isConnectingToAWS removed
          />
        );
        
      case 'singlePlayer':
        return <GameScreen />;
        
      case 'multiplayerLobby':
        return (
          <MultiplayerLobby
            onGameStart={handleGameStart}
            onBack={handleBackToMenu}
            globalUsername={multiplayerStore.currentUsername || ''}
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

            onMainMenu={handleBackToMenu}
          />
        ) : (
          <div>Loading results...</div>
        );
        
      case 'leaderboard':
        return (
          <LeaderboardScreen
            onBack={() => setCurrentScreen('singlePlayer')}
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