import React, { useEffect } from 'react';
import GameScreen from './components/GameScreen';
import { forceCleanupDragIndicators } from '@/utils/dragCleanup';
import { soundUtils } from '@/utils/soundUtils';
import { useGameStore } from '@/stores/gameStore';
import { getBuildString } from '@/config/version';
import './App.css';

const App: React.FC = () => {
  const { settings } = useGameStore();
  
  useEffect(() => {
    // Log current build number for debugging
    console.log(`🚀 App starting - ${getBuildString()}`);
    
    // Force cleanup on app mount to ensure no orphaned indicators
    forceCleanupDragIndicators();
    
    // OPTIMIZED: Pre-activate audio on app startup for immediate response
    if (settings.soundEnabled) {
      soundUtils.activateAudio().catch(() => {
        // Silently handle activation errors
      });
    }
    
    return () => {
      // Force cleanup on app unmount
      forceCleanupDragIndicators();
    };
  }, [settings.soundEnabled]);

  return (
    <div className="App">
      <GameScreen />
    </div>
  );
};

export default App; 