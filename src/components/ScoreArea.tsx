import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Target, Lightbulb, Hash, BarChart3, X } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import './ScoreArea.css';

const ScoreArea: React.FC = () => {
  const { gameState, settings, stats, getGameTimeMinutes, getTotalHintCost } = useGameStore();
  const [showStatsToast, setShowStatsToast] = useState(false);

  const calculateCurrentScore = () => {
    if (!gameState.isGameActive && !gameState.isGameWon) return 0;
    
    const guessCount = gameState.guesses.length;
    const timeMinutes = getGameTimeMinutes();
    const hintCosts = getTotalHintCost();
    
    return Math.max(0, 100 - guessCount - timeMinutes - hintCosts);
  };

  const currentScore = calculateCurrentScore();
  const currentStats = stats instanceof Map ? stats.get(settings.difficulty) : undefined;

  return (
    <div className="score-area">
      <div className="score-header">
        <Trophy className="score-icon" size={20} />
        <h3>Score</h3>
        <button
          className="stats-button"
          onClick={() => setShowStatsToast(true)}
          aria-label="Show statistics"
        >
          <BarChart3 size={18} />
        </button>
      </div>

      <motion.div
        className="current-score"
        animate={{ scale: gameState.isGameWon ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="score-value">{currentScore}</div>
        <div className="score-label">Current</div>
      </motion.div>

      <div className="score-breakdown">
        <div className="score-item">
          <Target size={16} />
          <span className="score-text">Base Score</span>
          <span className="score-number">100</span>
        </div>

        <div className="score-item penalty">
          <Hash size={16} />
          <span className="score-text">Guesses</span>
          <span className="score-number">-{gameState.guesses.length}</span>
        </div>

        <div className="score-item penalty">
          <Clock size={16} />
          <span className="score-text">Time (min)</span>
          <span className="score-number">-{getGameTimeMinutes()}</span>
        </div>

        {getTotalHintCost() > 0 && (
          <div className="score-item penalty">
            <Lightbulb size={16} />
            <span className="score-text">Hints</span>
            <span className="score-number">-{getTotalHintCost()}</span>
          </div>
        )}
      </div>

      {/* Stats Toast */}
      <AnimatePresence>
        {showStatsToast && (
          <motion.div
            className="stats-toast-overlay"
            style={{ zIndex: 99999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStatsToast(false)}
          >
            <motion.div
              className="stats-toast"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stats-toast-header">
                <h4>Statistics</h4>
                <button
                  className="stats-close-button"
                  onClick={() => setShowStatsToast(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="stats-toast-content">
                <div className="stat-item">
                  <span className="stat-label">Best Score</span>
                  <span className="stat-value">
                    {Math.round(currentStats?.bestScore || 0)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Score</span>
                  <span className="stat-value">
                    {Math.round(currentStats?.averageScore || 0)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Games Won</span>
                  <span className="stat-value">
                    {currentStats?.gamesWon || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScoreArea; 