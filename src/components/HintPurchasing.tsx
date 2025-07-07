import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

const HintPurchasing: React.FC = () => {
  const [showHintPurchasing, setShowHintPurchasing] = useState(false);
  const { settings, hintState, gameState, dispatch, getTotalHintCost } = useGameStore();

  // Reset to hidden state when a new game starts
  useEffect(() => {
    // Reset when game starts (no guesses yet) or when target changes (new game)
    if (gameState.guesses.length === 0 || gameState.gameStartTime) {
      setShowHintPurchasing(false);
      console.log('🔍 HintPurchasing: Reset to hidden state for new game');
    }
  }, [gameState.target, gameState.gameStartTime]); // Watch for new game indicators

  // Debug logging
  useEffect(() => {
    console.log('🔍 HintPurchasing Debug:', {
      showHintPurchasing,
      buttonText: showHintPurchasing ? 'Hide' : 'Show',
      contentVisible: showHintPurchasing
    });
  }, [showHintPurchasing]);

  const handlePurchaseHint = (hintType: 'bagel' | 'not-bagel' | 'row-delta' | 'random-expose' | 'row-sums', targetNumber?: number) => {
    dispatch({
      type: 'PURCHASE_HINT',
      hintType,
      targetNumber
    });
  };

  return (
    <div className="hint-purchasing" style={{
      width: '100%',
      background: showHintPurchasing ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
      borderRadius: showHintPurchasing ? '8px' : '0',
      padding: showHintPurchasing ? '12px' : '0',
      boxShadow: showHintPurchasing ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
      border: showHintPurchasing ? '1px solid #e5e7eb' : 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    }}>
      <div 
        className="hint-header hint-header-horizontal"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minWidth: '280px',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          boxSizing: 'border-box',
          margin: showHintPurchasing ? '0 0 12px 0' : '0'
        }}
      >
        <ShoppingCart className="hint-icon" size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <h3 style={{ margin: '0', flex: '1', textAlign: 'center', color: '#1f2937', fontSize: '1rem' }}>Hint Purchasing</h3>
        <button
          className="toggle-btn"
          onClick={() => setShowHintPurchasing(!showHintPurchasing)}
          aria-label={showHintPurchasing ? 'Hide hints' : 'Show hints'}
          style={{ flexShrink: 0 }}
        >
          {showHintPurchasing ? 'Hide' : 'Show'}
        </button>
      </div>

      <AnimatePresence>
        {showHintPurchasing && (
          <motion.div
            className="hint-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              color: '#1f2937', // Dark text for visibility on white background
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}
          >
            <div className="hint-section" style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                color: '#1f2937', 
                fontSize: '1rem', 
                fontWeight: '600' 
              }}>Number Hints</h4>
              <button
                className="hint-btn random-expose"
                onClick={() => handlePurchaseHint('random-expose')}
                disabled={
                  // Disable if all numbers have been exposed
                  Array.from({ length: settings.digitRange + 1 }, (_, i) => i).every(num =>
                    hintState?.purchasedHints.randomExposedNumbers.has(num) ||
                    hintState?.purchasedHints.bagelNumbers.has(num) ||
                    hintState?.purchasedHints.notBagelNumbers.has(num)
                  )
                }
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  width: '100%',
                  marginBottom: '8px'
                }}
              >
                Randomly expose a number (5 points)
              </button>
              <p className="hint-desc" style={{ 
                fontSize: '0.8rem', 
                color: '#4b5563', 
                margin: '4px 0 0 0', 
                lineHeight: '1.4' 
              }}>Reveals if a random number is in the target or not</p>
            </div>

            <div className="hint-section" style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                color: '#1f2937', 
                fontSize: '1rem', 
                fontWeight: '600' 
              }}>Row Sums (3 points)</h4>
              <button
                className="hint-btn row-sums"
                onClick={() => handlePurchaseHint('row-sums')}
                disabled={
                  // Disable if all rows have been revealed
                  hintState?.purchasedHints.revealedRowSums.size >= settings.gridRows
                }
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  width: '100%',
                  marginBottom: '8px'
                }}
              >
                Buy Row Sums ({hintState?.purchasedHints.revealedRowSums.size || 0}/{settings.gridRows} revealed)
              </button>
              <p className="hint-desc" style={{ 
                fontSize: '0.8rem', 
                color: '#4b5563', 
                margin: '4px 0 0 0', 
                lineHeight: '1.4' 
              }}>Shows the sum of target numbers for one random row</p>
            </div>

            <div className="hint-cost" style={{
              padding: '12px',
              background: '#fef3c7',
              borderRadius: '6px',
              border: '1px solid #f59e0b',
              textAlign: 'center',
              color: '#92400e',
              fontWeight: '600',
              marginTop: '8px'
            }}>
              <strong>Total Hint Cost: {getTotalHintCost()} points</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HintPurchasing; 