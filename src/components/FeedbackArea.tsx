import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { formatGameTime } from '@/utils/gameLogic';
import './FeedbackArea.css';

interface GuessRowProps {
  guess: any;
  index: number;
  isLatest: boolean;
}

const GuessRow: React.FC<GuessRowProps> = ({ guess, index, isLatest }) => {
  const { feedback, digits, timestamp, rowDeltas } = guess;

  return (
    <motion.div
      className={`guess-row ${isLatest ? 'latest' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="guess-number">#{index + 1}</div>
      
      <div className="guess-digits">
        {digits.map((digit: number, pos: number) => (
          <span key={pos} className="digit-display">
            {digit}
          </span>
        ))}
      </div>

      <div className="feedback-results">
        <div className="feedback-item pico">
          <span className="count">{feedback.picos}</span>
          <span className="label">Pico</span>
        </div>
        <div className="feedback-item fermi">
          <span className="count">{feedback.fermis}</span>
          <span className="label">Fermi</span>
        </div>
        <div className="feedback-item bagel">
          <span className="count">{feedback.bagels}</span>
          <span className="label">Bagel</span>
        </div>
      </div>

      {rowDeltas && (
        <div className="row-deltas">
          <span className="deltas-label">Δ:</span>
          {rowDeltas.map((delta: number, pos: number) => (
            <span key={pos} className={`delta-value ${delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'zero'}`}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          ))}
        </div>
      )}

      <div className="guess-time">
        {new Date(timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        })}
      </div>

      {feedback.isWinner && (
        <div className="winner-indicator">
          <Target size={16} />
          <span>WINNER!</span>
        </div>
      )}
    </motion.div>
  );
};

const FeedbackArea: React.FC = () => {
  const { gameState, getGameTimeMinutes } = useGameStore();

  const getGameStats = () => {
    if (gameState.guesses.length === 0) return null;

    const totalPicos = gameState.guesses.reduce((sum, g) => sum + g.feedback.picos, 0);
    const totalFermis = gameState.guesses.reduce((sum, g) => sum + g.feedback.fermis, 0);
    const avgPicos = (totalPicos / gameState.guesses.length).toFixed(1);
    const avgFermis = (totalFermis / gameState.guesses.length).toFixed(1);

    return { avgPicos, avgFermis };
  };

  const stats = getGameStats();

  return (
    <div className="feedback-area">
      <div className="feedback-header">
        <h3>Guess History</h3>
        <div className="game-stats">
          <div className="stat-item">
            <Clock size={16} />
            <span>{formatGameTime(gameState.gameStartTime, gameState.gameEndTime)}</span>
          </div>
          <div className="stat-item">
            <TrendingUp size={16} />
            <span>Score: {gameState.score}</span>
          </div>
        </div>
      </div>

      <div className="feedback-legend">
        <div className="legend-section">
          <div className="legend-item">
            <div className="legend-color pico"></div>
            <span><strong>Pico:</strong> Right digit, wrong position</span>
          </div>
          <div className="legend-item">
            <div className="legend-color fermi"></div>
            <span><strong>Fermi:</strong> Right digit, right position</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bagel"></div>
            <span><strong>Bagel:</strong> Digit not in target</span>
          </div>
        </div>
      </div>

      <div className="feedback-content">
        {gameState.guesses.length === 0 ? (
          <div className="no-guesses">
            <p>No guesses yet. Make your first guess!</p>
            <p className="hint">Try starting with diverse numbers to gather information.</p>
          </div>
        ) : (
          <div className="guesses-list">
            <AnimatePresence>
              {gameState.guesses.map((guess, index) => (
                <GuessRow
                  key={guess.id}
                  guess={guess}
                  index={index}
                  isLatest={index === gameState.guesses.length - 1}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {stats && (
        <div className="feedback-summary">
          <h4>Game Statistics</h4>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="label">Total Guesses:</span>
              <span className="value">{gameState.guesses.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Avg Picos:</span>
              <span className="value">{stats.avgPicos}</span>
            </div>
            <div className="summary-item">
              <span className="label">Avg Fermis:</span>
              <span className="value">{stats.avgFermis}</span>
            </div>
            <div className="summary-item">
              <span className="label">Current Score:</span>
              <span className="value score">{gameState.score}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackArea; 