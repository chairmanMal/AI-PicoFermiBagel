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
      text: canSubmitGuess() ? 'Submit Guess' : 'Submit completed guesses',
      icon: canSubmitGuess() ? <Send size={20} /> : <Send size={20} />,
      onClick: handleSubmit,
      className: canSubmitGuess() ? 'btn-primary' : 'btn-secondary',
      disabled: !canSubmitGuess(),
    };
  };

  const formatFeedback = (feedback: any) => {
    const parts = [];
    
    // Add Fermis first (best feedback)
    for (let i = 0; i < feedback.fermis; i++) {
      parts.push('Fermi');
    }
    
    // Add Picos second
    for (let i = 0; i < feedback.picos; i++) {
      parts.push('Pico');
    }
    
    // Only show "Bagel" if there are NO picos or fermis (all digits are wrong)
    if (feedback.fermis === 0 && feedback.picos === 0) {
      return 'Bagel';
    }
    
    return parts.join('');
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

      <div className="submit-info">
        {gameState.isGameActive && (
          <div className="game-progress">
            <span className="guess-count">
              Guess {gameState.guesses.length + 1}
            </span>
          </div>
        )}

        {!canSubmitGuess() && gameState.isGameActive && (
          <div className="validation-hints">
            {gameState.currentGuess.filter(d => d !== null).length !== new Set(gameState.currentGuess.filter(d => d !== null)).size && (
              <span className="hint">• Remove duplicate numbers</span>
            )}
            {gameState.currentGuess.some(d => d !== null && (d < 0 || d > settings.digitRange)) && (
              <span className="hint">• Numbers must be 0-{settings.digitRange}</span>
            )}
          </div>
        )}
      </div>

      {/* Fixed Size Guess History */}
      <div className="guess-history-section">
        <h4 className="history-title">Recent Guesses</h4>
        <div className="guess-history-list">
          {gameState.guesses.length > 0 ? (
            gameState.guesses.slice(-5).map((guess, index) => (
              <motion.div
                key={guess.id}
                className={`history-item ${guess.feedback.isWinner ? 'winner' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <span className="guess-display">
                  {guess.digits.join('-')}
                </span>
                <span className="feedback-display">
                  {guess.feedback.isWinner ? 'WINNER!' : formatFeedback(guess.feedback)}
                </span>
              </motion.div>
            ))
          ) : (
            // Show empty placeholders when no guesses yet
            Array.from({ length: 5 }, (_, index) => (
              <div key={`empty-${index}`} className="history-item empty">
                <span className="guess-display">---</span>
                <span className="feedback-display">---</span>
              </div>
            ))
          )}
        </div>
        {gameState.guesses.length > 5 && (
          <div className="history-info">
            Showing last 5 of {gameState.guesses.length} guesses
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitButton; 