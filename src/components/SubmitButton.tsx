import React from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw, Trophy } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import './SubmitButton.css';

const SubmitButton: React.FC = () => {
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

  const getButtonContent = () => {
    if (gameState.isGameWon || !gameState.isGameActive) {
      return {
        text: 'New Game',
        icon: <RotateCcw size={20} />,
        onClick: handleNewGame,
        className: 'btn-success',
        disabled: false,
      };
    }

    return {
      text: 'Submit a Guess',
      icon: <Send size={20} />,
      onClick: handleSubmit,
      className: canSubmitGuess() ? 'btn-primary' : 'btn-secondary',
      disabled: !canSubmitGuess(),
    };
  };



  const buttonConfig = getButtonContent();

  return (
    <div className="submit-button-area">
      {(gameState.isGameWon || (!gameState.isGameActive && !gameState.isGameWon)) && (
        <motion.div
          className="game-end-message"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleNewGame}
        >
          {gameState.isGameWon ? (
            <>
              <Trophy className="trophy-icon" size={24} />
              <span>Congratulations! You won!</span>
            </>
          ) : (
            <>
              <span>Game Over - Too many guesses!</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Target was: {gameState.target.join('-')}
              </span>
            </>
          )}
          <div className="click-hint">Click anywhere to continue</div>
        </motion.div>
      )}

      {/* Submit button with external guess count */}
      <div className="submit-row">
        <motion.button
          className={`submit-btn btn ${buttonConfig.className}`}
          onClick={buttonConfig.onClick}
          disabled={buttonConfig.disabled}
          whileHover={!buttonConfig.disabled ? { scale: 1.02 } : {}}
          whileTap={!buttonConfig.disabled ? { scale: 0.98 } : {}}
          animate={{
            opacity: buttonConfig.disabled ? 0.6 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {buttonConfig.icon}
          <span>{buttonConfig.text}</span>
        </motion.button>
        
        {gameState.isGameActive && (
          <div className="guess-count-external">
            <div className="guess-count-label">Guesses</div>
            <div className="guess-count-number">{gameState.guesses.length}</div>
          </div>
        )}
      </div>

      {/* Validation hints below the button row */}
      {!canSubmitGuess() && gameState.isGameActive && (
        <div className="validation-hints">
          {(() => {
            const filledDigits = gameState.currentGuess.filter(d => d !== null) as number[];
            const uniqueDigits = new Set(filledDigits);
            return filledDigits.length !== uniqueDigits.size;
          })() && (
            <span className="hint">• Remove duplicate numbers (click a box, then select a new number, or double-click to clear)</span>
          )}
          {gameState.currentGuess.some(d => d !== null && (d < 0 || d > settings.digitRange)) && (
            <span className="hint">• Numbers must be 0-{settings.digitRange}</span>
          )}
        </div>
      )}


    </div>
  );
};

export default SubmitButton; 