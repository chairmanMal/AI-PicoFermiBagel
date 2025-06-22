import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Lock, LockOpen } from 'lucide-react';
import { useDrop } from 'react-dnd';
import { useGameStore } from '@/stores/gameStore';
import './GuessArea.css';

interface GuessBoxProps {
  position: number;
  value: number | null;
  isActive: boolean;
  isLocked: boolean;
  isRepeated: boolean;
  onBoxClick: (position: number) => void;
  onLockToggle: (position: number) => void;
}

const GuessBox: React.FC<GuessBoxProps> = ({ 
  position, 
  value, 
  isActive, 
  isLocked, 
  isRepeated,
  onBoxClick, 
  onLockToggle 
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'number',
    drop: (item: { digit: number }) => {
      useGameStore.getState().dispatch({
        type: 'SET_GUESS_DIGIT',
        position,
        digit: item.digit
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [position]);

  return (
    <div
      ref={drop}
      className={`guess-box ${isActive ? 'active' : ''} ${isRepeated ? 'repeated' : ''} ${isOver ? 'drag-over' : ''}`}
      onClick={() => onBoxClick(position)}
    >
      <div className="guess-content">
        {value !== null ? (
          <span className={`guess-digit ${isRepeated ? 'repeated-text' : ''}`}>
            {value}
          </span>
        ) : (
          <span className="guess-placeholder">{position + 1}</span>
        )}
      </div>
      
      {isLocked && (
        <div className="lock-indicator">
          <Lock size={12} />
        </div>
      )}
      
      <button
        className="lock-toggle"
        onClick={(e) => {
          e.stopPropagation();
          onLockToggle(position);
        }}
        aria-label={isLocked ? 'Unlock position' : 'Lock position'}
      >
        {isLocked ? <Lock size={14} /> : <LockOpen size={14} />}
      </button>
    </div>
  );
};

const GuessArea: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  const { settings, gameState, dispatch } = useGameStore();
  
  const handleBoxClick = (position: number) => {
    dispatch({ type: 'SET_ACTIVE_POSITION', position });
  };

  const handleLockToggle = (position: number) => {
    dispatch({ type: 'TOGGLE_POSITION_LOCK', position });
  };

  // Check for repeated digits
  const getRepeatedPositions = () => {
    const repeated = new Set<number>();
    const digitCounts = new Map<number, number[]>();
    
    gameState.currentGuess.forEach((digit, index) => {
      if (digit !== null) {
        if (!digitCounts.has(digit)) {
          digitCounts.set(digit, []);
        }
        digitCounts.get(digit)!.push(index);
      }
    });

    digitCounts.forEach((positions) => {
      if (positions.length > 1) {
        positions.forEach(pos => repeated.add(pos));
      }
    });

    return repeated;
  };

  const repeatedPositions = getRepeatedPositions();

  // Create grid layout based on settings
  const createGuessGrid = () => {
    const boxes = [];
    let position = 0;
    
    for (let row = 0; row < settings.gridRows; row++) {
      const rowBoxes = [];
      for (let col = 0; col < settings.gridColumns; col++) {
        rowBoxes.push(
          <GuessBox
            key={position}
            position={position}
            value={gameState.currentGuess[position]}
            isActive={gameState.activeGuessPosition === position}
            isLocked={gameState.lockedPositions.has(position)}
            isRepeated={repeatedPositions.has(position)}
            onBoxClick={handleBoxClick}
            onLockToggle={handleLockToggle}
          />
        );
        position++;
      }
      boxes.push(
        <div key={`row-${row}`} className="guess-row">
          {rowBoxes}
        </div>
      );
    }
    
    return boxes;
  };

  return (
    <div className="guess-area">
      <div className="guess-header">
        <h3 className="guess-title">Your Guess</h3>
        <button
          className="help-button"
          onClick={() => setShowHelp(true)}
          aria-label="Show help"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      <div className="guess-grid" style={{
        '--grid-rows': settings.gridRows,
        '--grid-columns': settings.gridColumns
      } as React.CSSProperties}>
        {createGuessGrid()}
      </div>

      {/* Help Toast */}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <motion.div
            className="help-toast"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="help-header">
              <h4>How to Enter Your Guess</h4>
              <button
                className="help-close"
                onClick={() => setShowHelp(false)}
                aria-label="Close help"
              >
                ×
              </button>
            </div>
            <div className="help-content">
              <p><strong>Sequential Entry:</strong> Click numbers to fill boxes left-to-right, then next row.</p>
              <p><strong>Specific Positioning:</strong> Click a box first, then click a number to place it there.</p>
              <p><strong>Drag & Drop:</strong> Drag numbers directly onto boxes.</p>
              <p><strong>Lock Positions:</strong> Click the lock icon to prevent auto-advance from changing that position.</p>
              <p><strong>Red Numbers:</strong> Indicates repeated digits (not allowed).</p>
              <p><strong>Blue Outline:</strong> Shows the active position for sequential entry.</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GuessArea; 