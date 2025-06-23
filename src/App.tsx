import React, { useEffect } from 'react';
import GameScreen from './components/GameScreen';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="App">
      <GameScreen />
    </div>
  );
};

export default App; 