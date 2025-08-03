import React, { useEffect, useState } from 'react';
import GameScreen from './components/GameScreen';
import SplashScreen from './components/SplashScreen';
import { forceCleanupDragIndicators } from '@/utils/dragCleanup';
import { soundUtils, initializeSoundVolume } from '@/utils/soundUtils';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayerStore } from '@/stores/multiplayerStore';
import { getBuildString } from '@/config/version';
import { getBackgroundGradient } from '@/utils/gameLogic';
import './App.css';

// Multiplayer components (only imported if needed)
import { UsernameRegistration } from './components/UsernameRegistration';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerGameProgress } from './components/MultiplayerGameProgress';
import { MultiplayerResults } from './components/MultiplayerResults';
import multiplayerService, { GameStartEvent, GameEndResult } from './services/multiplayerService';
import MainMenu from './components/MainMenu';

type AppScreen = 
  | 'splash' 
  | 'menu'
  | 'singlePlayer' 
  | 'usernameRegistration' 
  | 'multiplayerLobby' 
  | 'multiplayerGame'
  | 'multiplayerResults';

const App: React.FC = () => {
  const { settings } = useGameStore();
  const multiplayerStore = useMultiplayerStore();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [awsInitialized, setAwsInitialized] = useState(false);
  const [multiplayerResults, setMultiplayerResults] = useState<GameEndResult | null>(null);
  
  useEffect(() => {
    // Log current build number for debugging
    console.log(`🚀 App starting - ${getBuildString()}`);
    
    // Force cleanup on app mount to ensure no orphaned indicators
    forceCleanupDragIndicators();
    
    // Initialize sound volume from settings
    initializeSoundVolume(settings.soundVolume);
    
    // OPTIMIZED: Pre-activate audio on app startup for immediate response
    if (settings.soundEnabled) {
      soundUtils.activateAudio().catch(() => {
        // Silently handle activation errors
      });
    }

    // Initialize multiplayer (non-blocking)
    initializeMultiplayer();
    
    return () => {
      // Force cleanup on app unmount
      forceCleanupDragIndicators();
      multiplayerStore.cleanupMultiplayer();
    };
  }, [settings.soundEnabled, settings.soundVolume]);

  // Update CSS variable for background color
  useEffect(() => {
    const gradient = getBackgroundGradient(settings.backgroundColor);
    document.documentElement.style.setProperty('--app-background-gradient', gradient);
  }, [settings.backgroundColor]);

  const initializeMultiplayer = async () => {
    try {
      await multiplayerStore.initializeMultiplayer();
      setAwsInitialized(true);
      console.log('✅ Multiplayer initialized successfully');
    } catch (error) {
      console.warn('⚠️ Multiplayer not available:', error);
      setAwsInitialized(false);
    }
  };

  const handleSplashComplete = () => {
    console.log('🚀 App: Splash screen completed, showing main menu');
    setCurrentScreen('menu');
  };

  const handleSinglePlayerStart = () => {
    console.log('🎮 Starting single player mode');
    setCurrentScreen('singlePlayer');
  };

  const handleMultiplayerClick = async () => {
    if (!awsInitialized) {
      alert('Multiplayer features are not available. Please check your connection.');
      return;
    }

    try {
      const hasUsername = await multiplayerService.hasRegisteredUsername();
      if (hasUsername) {
        setCurrentScreen('multiplayerLobby');
      } else {
        setCurrentScreen('usernameRegistration');
      }
    } catch (error) {
      console.warn('Multiplayer service error:', error);
      // Fallback to username registration
      setCurrentScreen('usernameRegistration');
    }
  };

  const handleUsernameRegistration = (username: string) => {
    console.log('🎮 App: Username registered:', username);
    console.log('🎮 App: Switching to multiplayer lobby');
    setCurrentScreen('multiplayerLobby');
  };

  const handleGameStart = (gameData: GameStartEvent) => {
    console.log('Starting multiplayer game:', gameData);
    multiplayerStore.startMultiplayerGame(gameData);
    setCurrentScreen('multiplayerGame');
  };

  const handleMultiplayerGameEnd = (results: GameEndResult) => {
    console.log('Multiplayer game ended:', results);
    setMultiplayerResults(results);
    setCurrentScreen('multiplayerResults');
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

    window.addEventListener('switchToMultiplayer', handleSwitchToMultiplayer);
    
    return () => {
      window.removeEventListener('switchToMultiplayer', handleSwitchToMultiplayer);
    };
  }, []);

  const handleNewMultiplayerGame = () => {
    multiplayerStore.cleanupMultiplayer();
    setCurrentScreen('multiplayerLobby');
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
            multiplayerAvailable={awsInitialized}
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