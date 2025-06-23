import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import type { ScratchpadColor } from '@/types/game';
import './Scratchpad.css';

const Scratchpad: React.FC = () => {
  const { 
    settings, 
    scratchpadState, 
    hintState,
    dispatch 
  } = useGameStore();
  
  const [showHintsToast, setShowHintsToast] = useState(false);

  const colorMeanings: Record<ScratchpadColor, { label: string; description: string }> = {
    default: { label: 'Unknown', description: 'No information yet' },
    maybe: { label: 'Maybe', description: 'Might be in target' },
    likely: { label: 'Likely', description: 'Probably in target' },
    unlikely: { label: 'Unlikely', description: 'Probably not in target' },
    bagel: { label: 'Bagel', description: 'Definitely NOT in target' },
    'not-bagel': { label: 'Not Bagel', description: 'Definitely IN target' },
  };

  const colorCycle: ScratchpadColor[] = [
    'default',
    'bagel',
    'unlikely',
    'maybe', 
    'likely',
    'not-bagel'
  ];

  const handleNumberClick = (number: number) => {
    // Don't allow manual changes to hint-purchased numbers
    if (hintState.purchasedHints.bagelNumbers.has(number) || 
        hintState.purchasedHints.notBagelNumbers.has(number)) {
      return;
    }

    const currentColor = scratchpadState.numberColors.get(number) || 'default';
    const currentIndex = colorCycle.indexOf(currentColor);
    const nextIndex = (currentIndex + 1) % colorCycle.length;
    const nextColor = colorCycle[nextIndex];

    dispatch({ 
      type: 'SET_SCRATCHPAD_COLOR', 
      number, 
      color: nextColor 
    });
  };

  const getNumberColor = (number: number): ScratchpadColor => {
    return scratchpadState.numberColors.get(number) || 'default';
  };

  const availableNumbers = Array.from(
    { length: settings.digitRange + 1 }, 
    (_, i) => i
  );

  const isHintPurchased = (number: number): boolean => {
    return hintState.purchasedHints.bagelNumbers.has(number) || 
           hintState.purchasedHints.notBagelNumbers.has(number);
  };

  return (
    <div className="scratchpad">
      <button 
        className="info-button info-button-corner"
        onClick={() => setShowHintsToast(true)}
        title="Show color meanings and tips"
      >
        <HelpCircle size={20} />
      </button>
      <div className="scratchpad-header">
        <div className="header-content">
          <h3>Scratchpad</h3>
        </div>
        <p className="scratchpad-description">
          Click numbers to track your deductions
        </p>
      </div>

      <div className="scratchpad-numbers">
        <h4>Numbers (0-{settings.digitRange}):</h4>
        <div className="numbers-container">
          <div className="numbers-grid">
            {availableNumbers.map((number) => {
              const color = getNumberColor(number);
              const isPurchased = isHintPurchased(number);
              
              return (
                <motion.button
                  key={number}
                  className={`scratchpad-number color-${color} ${isPurchased ? 'hint-purchased' : ''}`}
                  onClick={() => handleNumberClick(number)}
                  disabled={isPurchased}
                  whileHover={!isPurchased ? { scale: 1.05 } : {}}
                  whileTap={!isPurchased ? { scale: 0.95 } : {}}
                  title={
                    isPurchased 
                      ? `${number} - ${colorMeanings[color].label} (Hint purchased)`
                      : `${number} - ${colorMeanings[color].label}: ${colorMeanings[color].description}`
                  }
                >
                  <span className="number-text">{number}</span>
                  {isPurchased && (
                    <div className="hint-indicator">💡</div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hints Toast */}
      <AnimatePresence>
        {showHintsToast && (
          <motion.div
            className="hints-toast-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHintsToast(false)}
          >
            <motion.div
              className="hints-toast"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="toast-header">
                <h4>Scratchpad Guide</h4>
                <button 
                  className="close-button"
                  onClick={() => setShowHintsToast(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="toast-content">
                <div className="color-meanings">
                  <h5>Color Meanings:</h5>
                  <div className="color-grid">
                    {Object.entries(colorMeanings).map(([color, info]) => (
                      <div key={color} className="color-item">
                        <div className={`color-swatch color-${color}`}></div>
                        <div className="color-info">
                          <span className="color-name">{info.label}</span>
                          <span className="color-desc">{info.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="usage-tips">
                  <h5>Tips:</h5>
                  <ul>
                    <li>Click numbers to cycle through colors</li>
                    <li>Use colors to track your logical deductions</li>
                    <li>Hint-purchased numbers are locked with 💡</li>
                    <li>This is just for your memory - doesn't affect scoring</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scratchpad; 