import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import './RecentGuessHistory.css';

const RecentGuessHistory: React.FC = () => {
  const { gameState } = useGameStore();
  const historyListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new guesses are added
  useEffect(() => {
    if (historyListRef.current && gameState.guesses.length > 0) {
      historyListRef.current.scrollTop = historyListRef.current.scrollHeight;
    }
  }, [gameState.guesses.length]);

  const formatFeedback = (feedback: any) => {
    // Only show "Bagel" if there are NO picos or fermis (all digits are wrong)
    if (feedback.fermis === 0 && feedback.picos === 0) {
      return 'Bagel';
    }
    
    return 'Pico-' + feedback.picos + ', Fermi-' + feedback.fermis;
  };

  return (
    <div className="recent-guess-history">
      <h4 className="history-title">Recent Guesses ({gameState.guesses.length})</h4>
      <div className="guess-history-list" ref={historyListRef}>
        {gameState.guesses.length > 0 ? (
          gameState.guesses.map((guess, index) => (
            <motion.div
              key={guess.id}
              className={`history-item ${guess.feedback.isWinner ? 'winner' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index, 4) * 0.1 }}
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
          Array.from({ length: 12 }, (_, index) => (
            <div key={`empty-${index}`} className="history-item empty">
              <span className="guess-display">---</span>
              <span className="feedback-display">---</span>
            </div>
          ))
        )}
      </div>
      {gameState.guesses.length > 0 && (
        <div className="history-info">
          {gameState.guesses.length} guess{gameState.guesses.length !== 1 ? 'es' : ''} total
          {gameState.guesses.length > 12 && ' • Scroll to see all'}
        </div>
      )}
    </div>
  );
};

export default RecentGuessHistory; 