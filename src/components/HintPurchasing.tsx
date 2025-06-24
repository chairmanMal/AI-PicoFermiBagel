import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

const HintPurchasing: React.FC = () => {
  const [showHintPurchasing, setShowHintPurchasing] = useState(false);
  const { settings, hintState, dispatch, getTotalHintCost } = useGameStore();

  const handlePurchaseHint = (hintType: 'bagel' | 'not-bagel' | 'row-delta' | 'random-expose' | 'row-sums', targetNumber?: number) => {
    dispatch({
      type: 'PURCHASE_HINT',
      hintType,
      targetNumber
    });
  };

  return (
    <div className="hint-purchasing">
      <div className="hint-header">
        <ShoppingCart className="hint-icon" size={20} />
        <h3>Hint Purchasing</h3>
        <button
          className="toggle-btn"
          onClick={() => setShowHintPurchasing(!showHintPurchasing)}
          aria-label={showHintPurchasing ? 'Hide hints' : 'Show hints'}
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
          >
            <div className="hint-section">
              <h4>Number Hints</h4>
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
              >
                Randomly expose a number (5 points)
              </button>
              <p className="hint-desc">Reveals if a random number is in the target or not</p>
            </div>

            <div className="hint-section">
              <h4>Row Sums (3 points)</h4>
              <button
                className="hint-btn row-sums"
                onClick={() => handlePurchaseHint('row-sums')}
                disabled={
                  // Disable if all rows have been revealed
                  hintState?.purchasedHints.revealedRowSums.size >= settings.gridRows
                }
              >
                Buy Row Sums ({hintState?.purchasedHints.revealedRowSums.size || 0}/{settings.gridRows} revealed)
              </button>
              <p className="hint-desc">Shows the sum of target numbers for one random row</p>
            </div>

            <div className="hint-cost">
              <strong>Total Hint Cost: {getTotalHintCost()} points</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HintPurchasing; 