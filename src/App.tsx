import React, { useEffect } from 'react';
import GameScreen from './components/GameScreen';
import { forceCleanupDragIndicators } from '@/utils/dragCleanup';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    // Force cleanup on app mount to ensure no orphaned indicators
    forceCleanupDragIndicators();
    
    return () => {
      // Force cleanup on app unmount
      forceCleanupDragIndicators();
    };
  }, []);

  return (
    <div className="App">
      <GameScreen />
    </div>
  );
};

export default App; 