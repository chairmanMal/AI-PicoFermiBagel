import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Settings, Eye, EyeOff, Volume2, VolumeX, Grid3X3, Hash, ShoppingCart } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import './MenuArea.css';

interface MenuAreaProps {
  onClose: () => void;
}

const MenuArea: React.FC<MenuAreaProps> = ({ onClose }) => {
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [showHintPurchasing, setShowHintPurchasing] = useState(false);
  const { settings, resetGame, updateSettings, gameState, hintState, dispatch, getTotalHintCost } = useGameStore();

  const handleStartNewGame = () => {
    resetGame();
    onClose();
  };

  const toggleShowTarget = () => {
    updateSettings({ showTarget: !settings.showTarget });
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleDifficultyChange = (difficulty: string) => {
    updateSettings({ difficulty: difficulty as any });
    setShowCustomSettings(false);
  };

  const handleCustomSettingChange = (key: keyof typeof settings, value: number) => {
    updateSettings({ 
      [key]: value,
      difficulty: 'custom' // Switch to custom mode when manually adjusting
    });
  };

  const handlePurchaseHint = (hintType: 'bagel' | 'not-bagel' | 'row-delta', targetNumber?: number) => {
    dispatch({
      type: 'PURCHASE_HINT',
      hintType,
      targetNumber
    });
  };

  const presetDifficulties = [
    { key: 'easy', label: 'Easy', desc: '1×3, 0-6' },
    { key: 'classic', label: 'Classic', desc: '1×3, 0-9' },
    { key: 'medium', label: 'Medium', desc: '2×3, 0-12' },
    { key: 'hard1', label: 'Hard', desc: '2×3, 0-16' },
    { key: 'hard2', label: 'Hard', desc: '2×4, 0-19' },
    { key: 'expert', label: 'Expert', desc: '3×3, 0-19' }
  ];

  return (
    <div className="menu-modal">
      <div className="menu-header">
        <h3>Game Menu</h3>
        <button 
          className="menu-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="menu-content">
        <div className="menu-section">
          <button
            className="menu-item primary"
            onClick={handleStartNewGame}
          >
            <RotateCcw size={18} />
            New Game
          </button>
        </div>

        <div className="menu-section">
          <h4>Difficulty Presets</h4>
          <div className="difficulty-list">
            {presetDifficulties.map(({ key, label, desc }) => (
              <button
                key={key}
                className={`difficulty-btn ${settings.difficulty === key ? 'active' : ''}`}
                onClick={() => handleDifficultyChange(key)}
              >
                <span className="difficulty-label">{label}</span>
                <span className="difficulty-desc">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="menu-section">
          <div className="section-header">
            <h4>Hint Purchasing</h4>
            <button
              className="toggle-btn"
              onClick={() => setShowHintPurchasing(!showHintPurchasing)}
            >
              <ShoppingCart size={16} />
              {showHintPurchasing ? 'Hide' : 'Show'}
            </button>
          </div>

          <AnimatePresence>
            {showHintPurchasing && (
              <motion.div
                className="hint-purchasing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="hint-section">
                  <h5>Number Hints (5 points each)</h5>
                  <div className="number-hints">
                    {Array.from({ length: settings.digitRange + 1 }, (_, i) => i).map(number => (
                      <div key={number} className="number-hint-group">
                        <span className="number">{number}</span>
                        <button
                          className="hint-btn bagel"
                          onClick={() => handlePurchaseHint('bagel', number)}
                          disabled={hintState?.purchasedHints.bagelNumbers.has(number)}
                        >
                          Not In
                        </button>
                        <button
                          className="hint-btn not-bagel"
                          onClick={() => handlePurchaseHint('not-bagel', number)}
                          disabled={hintState?.purchasedHints.notBagelNumbers.has(number)}
                        >
                          In Target
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hint-section">
                  <h5>Row Delta Hints (3 points each)</h5>
                  <button
                    className="hint-btn row-delta"
                    onClick={() => handlePurchaseHint('row-delta')}
                  >
                    Buy Row Delta Hint
                  </button>
                  <p className="hint-desc">Shows sum differences between guess and target rows</p>
                </div>

                <div className="hint-cost">
                  <strong>Total Hint Cost: {getTotalHintCost()} points</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="menu-section">
          <div className="section-header">
            <h4>Custom Settings</h4>
            <button
              className="toggle-btn"
              onClick={() => setShowCustomSettings(!showCustomSettings)}
            >
              <Settings size={16} />
              {showCustomSettings ? 'Hide' : 'Show'}
            </button>
          </div>

          <AnimatePresence>
            {showCustomSettings && (
              <motion.div
                className="custom-settings"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="setting-group">
                  <label>
                    <Hash size={16} />
                    Digit Range: 0-{settings.digitRange}
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="19"
                    value={settings.digitRange}
                    onChange={(e) => handleCustomSettingChange('digitRange', parseInt(e.target.value))}
                    className="range-slider"
                  />
                  <span className="range-value">{settings.digitRange + 1} numbers</span>
                </div>

                <div className="setting-group">
                  <label>
                    <Grid3X3 size={16} />
                    Grid Rows: {settings.gridRows}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={settings.gridRows}
                    onChange={(e) => handleCustomSettingChange('gridRows', parseInt(e.target.value))}
                    className="range-slider"
                  />
                  <span className="range-value">{settings.gridRows} row{settings.gridRows !== 1 ? 's' : ''}</span>
                </div>

                <div className="setting-group">
                  <label>
                    <Grid3X3 size={16} />
                    Grid Columns: {settings.gridColumns}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={settings.gridColumns}
                    onChange={(e) => handleCustomSettingChange('gridColumns', parseInt(e.target.value))}
                    className="range-slider"
                  />
                  <span className="range-value">{settings.gridColumns} column{settings.gridColumns !== 1 ? 's' : ''}</span>
                </div>

                <div className="setting-info">
                  <p>Target Length: {settings.gridRows * settings.gridColumns} digits</p>
                  <p>Current: {settings.difficulty === 'custom' ? 'Custom' : settings.difficulty}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="menu-section">
          <h4>Options</h4>
          <button
            className="menu-item toggle"
            onClick={toggleShowTarget}
          >
            {settings.showTarget ? <EyeOff size={18} /> : <Eye size={18} />}
            {settings.showTarget ? 'Hide Target' : 'Show Target'}
            <span className="toggle-note">(Disables scoring)</span>
          </button>

          <button
            className="menu-item toggle"
            onClick={toggleSound}
          >
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {settings.soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
        </div>

        <div className="menu-section">
          <h4>Current Game</h4>
          <div className="game-info">
            <div className="info-row">
              <span>Mode:</span>
              <span>{settings.difficulty === 'custom' ? 'Custom' : settings.difficulty}</span>
            </div>
            <div className="info-row">
              <span>Grid:</span>
              <span>{settings.gridRows}×{settings.gridColumns}</span>
            </div>
            <div className="info-row">
              <span>Range:</span>
              <span>0-{settings.digitRange}</span>
            </div>
            <div className="info-row">
              <span>Guesses:</span>
              <span>{gameState.guesses.length}</span>
            </div>
            <div className="info-row">
              <span>Score:</span>
              <span>{gameState.score}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuArea; 