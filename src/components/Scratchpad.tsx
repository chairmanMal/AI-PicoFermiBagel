import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
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
  


  // Create toast outside of any stacking context
  const showToast = () => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 2147483647;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 12px 12px 0 0;
        ">
          <h4 style="margin: 0; color: #1f2937; font-size: 1.1rem; font-weight: 600;">Scratchpad Guide</h4>
          <button id="close-toast" style="
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            padding: 4px;
            border-radius: 4px;
            font-size: 18px;
          ">✕</button>
        </div>
        <div style="padding: 20px;">
          <div style="margin-bottom: 20px;">
            <h5 style="margin: 0 0 12px 0; color: #1f2937; font-size: 1rem; font-weight: 600;">Color Meanings:</h5>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: #374151;">
                <div style="width: 16px; height: 16px; border-radius: 3px; background-color: #e5e7eb; border: 1px solid #d1d5db;"></div>
                <span><strong>Unknown</strong> - No information yet</span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: #374151;">
                <div style="width: 16px; height: 16px; border-radius: 3px; background-color: #fecaca; border: 1px solid #ef4444;"></div>
                <span><strong>Bagel</strong> - NOT in target</span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: #374151;">
                <div style="width: 16px; height: 16px; border-radius: 3px; background-color: #fde68a; border: 1px solid #f59e0b;"></div>
                <span><strong>Pico</strong> - In target, wrong position</span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: #374151;">
                <div style="width: 16px; height: 16px; border-radius: 3px; background-color: #a7f3d0; border: 1px solid #10b981;"></div>
                <span><strong>Fermi</strong> - In target, correct position</span>
              </div>
            </div>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
            <h5 style="margin: 0 0 8px 0; color: #1f2937; font-size: 1rem; font-weight: 600;">Tips:</h5>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 0.85rem; line-height: 1.4;">
              <li>Click numbers to cycle through colors</li>
              <li>Use colors to track your logical deductions</li>
              <li>Hint-purchased numbers are locked with 💡</li>
              <li>This is just for your memory - doesn't affect scoring</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    const closeToast = () => {
      document.body.removeChild(overlay);
    };
    
    overlay.addEventListener('click', closeToast);
    overlay.querySelector('#close-toast')?.addEventListener('click', closeToast);
    
    document.body.appendChild(overlay);
  };

  const colorMeanings: Record<ScratchpadColor, { label: string; description: string }> = {
    default: { label: 'Unknown', description: 'No information yet' },
    bagel: { label: 'Bagel', description: 'NOT in target' },
    pico: { label: 'Pico', description: 'In target, wrong position' },
    fermi: { label: 'Fermi', description: 'In target, correct position' },
  };

  const colorCycle: ScratchpadColor[] = [
    'default',
    'bagel',
    'pico',
    'fermi'
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

  // Using flexbox wrap - no need for column calculations
  // Flexbox will automatically wrap and center partial rows

  return (
    <div className="scratchpad">
      <button 
        className="info-button info-button-corner"
        onClick={showToast}
        title="Show color meanings and tips"
      >
        <HelpCircle size={20} />
      </button>
      <div className="scratchpad-header">
        <div className="header-content">
          <h3>Scratchpad</h3>
        </div>
        <p className="scratchpad-description">
          Click numbers to track your thinking
        </p>
      </div>

      <div className="scratchpad-numbers">
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


    </div>
  );
};

export default Scratchpad; 