import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import './CircularSubmitButton.css';

const CircularSubmitButton: React.FC = () => {
  const { 
    gameState, 
    canSubmitGuess,
    dispatch,
    settings
  } = useGameStore();

  const handleSubmit = () => {
    if (canSubmitGuess()) {
      dispatch({ type: 'SUBMIT_GUESS' });
    }
  };

  const handleNewGame = () => {
    dispatch({ type: 'START_NEW_GAME' });
  };

  const isGameEnded = gameState.isGameWon || !gameState.isGameActive;
  const isDisabled = !canSubmitGuess() && gameState.isGameActive;

  return (
    <div className="circular-submit-container">
      <motion.button
        className={`circular-submit-btn ${
          isGameEnded ? 'game-ended' : 
          isDisabled ? 'disabled' : 
          'active'
        }`}
        onClick={isGameEnded ? handleNewGame : handleSubmit}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        animate={{
          opacity: isDisabled ? 0.6 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Bulls-eye target rings */}
        <div className="target-ring ring-outer"></div>
        <div className="target-ring ring-inner"></div>
        <div className="target-center"></div>
        
        {/* Curved text around the button */}
        <div className="curved-text">
          {isGameEnded ? (
            <>
              <svg viewBox="0 0 100 100" className="text-circle">
                <defs>
                  <path id="circle-path" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                </defs>
                <text className="circular-text">
                  <textPath href="#circle-path">
                    NEW GAME • NEW GAME • NEW GAME
                  </textPath>
                </text>
              </svg>
              <RotateCcw className="center-icon" size={20} />
            </>
          ) : (
            <>
              <svg viewBox="0 0 100 100" className="text-circle">
                <defs>
                  <path id="circle-path" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                </defs>
                <text className="circular-text">
                  <textPath href="#circle-path">
                    SUBMIT • SUBMIT • SUBMIT
                  </textPath>
                </text>
              </svg>
              <div className="center-icon target-dot"></div>
            </>
          )}
        </div>
      </motion.button>
      


      {/* Guess validation messages below the button */}
      {!canSubmitGuess() && gameState.isGameActive && (
        <div className="guess-validation">

          {gameState.currentGuess.some(d => d !== null && (d < 0 || d > settings.digitRange)) && (
            <span className="validation-message">
              • Numbers must be 0-{settings.digitRange}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularSubmitButton; 