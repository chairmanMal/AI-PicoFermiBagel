import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, createTransition } from 'react-dnd-multi-backend';
import GameScreen from './components/GameScreen';
import './App.css';

// Custom multi-backend configuration
const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: createTransition('pointerdown', (event: any) => {
        return event.pointerType === 'mouse';
      }),
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: {
        enableMouseEvents: false,
        delayTouchStart: 100,
        touchSlop: 8,
        ignoreContextMenu: true,
      },
      preview: true,
      transition: createTransition('pointerdown', (event: any) => {
        return event.pointerType !== 'mouse';
      }),
    },
  ],
};

const App: React.FC = () => {
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className="App">
        <GameScreen />
      </div>
    </DndProvider>
  );
};

export default App; 