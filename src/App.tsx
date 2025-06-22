import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GameScreen from './components/GameScreen';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <GameScreen />
      </div>
    </DndProvider>
  );
};

export default App; 