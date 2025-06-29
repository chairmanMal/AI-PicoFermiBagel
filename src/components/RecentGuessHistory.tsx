import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import './RecentGuessHistory.css';

const RecentGuessHistory: React.FC = () => {
  const { gameState } = useGameStore();
  const historyListRef = useRef<HTMLDivElement>(null);



  // Auto-scroll to show the latest real guess when new guesses are added
  useEffect(() => {
    if (historyListRef.current && gameState.guesses.length > 0) {
      console.log(`🔄 SCROLL: New guess added, total: ${gameState.guesses.length}`);
      
      // Enhanced scroll function that targets the last real guess
      const scrollToLatestGuess = () => {
        if (historyListRef.current) {
          const element = historyListRef.current;
          const realGuesses = element.querySelectorAll('.real-guess');
          const placeholders = element.querySelectorAll('.placeholder');
          
          console.log(`🔄 SCROLL: Found ${realGuesses.length} real guesses, ${placeholders.length} placeholders`);
          console.log(`🔄 SCROLL: Container - scrollHeight: ${element.scrollHeight}, clientHeight: ${element.clientHeight}, scrollTop: ${element.scrollTop}`);
          
          if (realGuesses.length > 0) {
            // Get the last real guess element
            const lastRealGuess = realGuesses[realGuesses.length - 1] as HTMLElement;
            console.log(`🔄 SCROLL: Last real guess element:`, lastRealGuess);
            
            // Use instant scrollIntoView to avoid conflicts
            lastRealGuess.scrollIntoView({ 
              behavior: 'auto', 
              block: 'end',
              inline: 'nearest'
            });
            
            console.log(`🔄 SCROLL: Instant scroll initiated to last guess`);
          } else {
            console.log(`🔄 SCROLL: No real guesses found, not scrolling`);
          }
        }
      };
      
      // Single well-timed scroll after DOM updates and animations start
      setTimeout(scrollToLatestGuess, 200);  // Wait for DOM updates and initial animation
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
        {/* Always show actual guesses first */}
        {gameState.guesses.map((guess, index) => (
          <motion.div
            key={guess.id}
            className={`history-item ${guess.feedback.isWinner ? 'winner' : ''} real-guess`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index, 4) * 0.1 }}
            data-guess-index={index}
            data-guess-id={guess.id}
          >
            <span className="guess-display">
              {guess.digits.join('-')}
            </span>
            <span className="feedback-display">
              {guess.feedback.isWinner ? 'WINNER!' : formatFeedback(guess.feedback)}
            </span>
          </motion.div>
        ))}
        
        {/* Add placeholders to fill remaining space (minimum 20 total items) */}
        {Array.from({ length: Math.max(20 - gameState.guesses.length, 0) }, (_, index) => (
          <div key={`placeholder-${index}`} className="history-item empty placeholder" data-placeholder-index={index}>
            <span className="guess-display">---</span>
            <span className="feedback-display">---</span>
          </div>
        ))}
      </div>
      {gameState.guesses.length > 0 && (
        <div className="history-info">
          {gameState.guesses.length} guess{gameState.guesses.length !== 1 ? 'es' : ''} total
          {gameState.guesses.length > 20 && ' • Scroll to see all'}
        </div>
      )}
    </div>
  );
};

export default RecentGuessHistory; 