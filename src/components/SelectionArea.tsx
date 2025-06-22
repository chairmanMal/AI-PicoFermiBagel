import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { isNumberUsedInGuess } from '@/utils/gameLogic';
import './SelectionArea.css';

interface NumberButtonProps {
  digit: number;
  isUsed: boolean;
  isUsedInSubmitted: boolean;
  hintColor: string;
  onNumberClick: (digit: number) => void;
}

const NumberButton: React.FC<NumberButtonProps> = ({
  digit,
  isUsed,
  isUsedInSubmitted,
  hintColor,
  onNumberClick,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'number',
    item: { digit },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const buttonClasses = [
    'number-button',
    isUsed && 'used',
    isUsedInSubmitted && 'used-submitted',
    hintColor !== 'default' && `hint-${hintColor}`,
    isDragging && 'dragging',
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      ref={drag}
      className={buttonClasses}
      onClick={() => onNumberClick(digit)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: isDragging ? -5 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      <span className="number-text">{digit}</span>
      {isUsed && <div className="used-indicator">•</div>}
    </motion.button>
  );
};

const SelectionArea: React.FC = () => {
  const { 
    gameState, 
    settings, 
    hintState,
    scratchpadState,
    dispatch 
  } = useGameStore();

  const [showHelp, setShowHelp] = useState(false);

  const handleNumberClick = (digit: number) => {
    if (!gameState.isGameActive) return;
    
    dispatch({ type: 'ADD_DIGIT_SEQUENTIAL', digit });
  };

  const getHintColor = (digit: number): string => {
    // Check purchased hints first (these always show)
    if (hintState.purchasedHints.bagelNumbers.has(digit)) {
      return 'bagel';
    }
    if (hintState.purchasedHints.notBagelNumbers.has(digit)) {
      return 'not-bagel';
    }
    
    // Only show bagel color from scratchpad
    const scratchpadColor = scratchpadState.numberColors.get(digit) || 'default';
    if (scratchpadColor === 'bagel') {
      return 'bagel';
    }
    
    return 'default';
  };

  const isNumberUsedInSubmittedGuesses = (digit: number): boolean => {
    return gameState.guesses.some(guess => guess.digits.includes(digit));
  };

  const availableNumbers = Array.from(
    { length: settings.digitRange + 1 }, 
    (_, i) => i
  );

  return (
    <div className="selection-area">
      <div className="selection-header">
        <div className="selection-titles">
          <h3 className="selection-title">Number Selection</h3>
          <p className="selection-subtitle">Select numbers for your guess</p>
        </div>
        <button
          className="help-button"
          onClick={() => setShowHelp(true)}
          aria-label="Show help"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      <div className="numbers-container">
        <div className="numbers-grid">
          {availableNumbers.map((digit) => (
            <NumberButton
              key={digit}
              digit={digit}
              isUsed={isNumberUsedInGuess(digit, gameState.currentGuess)}
              isUsedInSubmitted={isNumberUsedInSubmittedGuesses(digit)}
              hintColor={getHintColor(digit)}
              onNumberClick={handleNumberClick}
            />
          ))}
        </div>
      </div>

      {/* Informational Toast */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="info-toast-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              className="info-toast"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="info-toast-header">
                <h4>Color Legend</h4>
                <button
                  className="info-close-button"
                  onClick={() => setShowHelp(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="info-toast-content">
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color hint-bagel"></div>
                    <span><strong>Bagel</strong> - Not in target number</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color hint-not-bagel"></div>
                    <span><strong>Not Bagel</strong> - In target number</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color used"></div>
                    <span><strong>Used</strong> - Currently in guess</span>
                  </div>
                </div>
                <div className="usage-info">
                  <p><strong>Number Range:</strong> 0 - {settings.digitRange}</p>
                  <p><strong>Tip:</strong> Click numbers to add them sequentially, or drag and drop for specific positions.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectionArea; 