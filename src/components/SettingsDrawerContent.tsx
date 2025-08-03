import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Settings, Eye, EyeOff, Volume2, VolumeX, Grid3X3, Hash, BookOpen, Users } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import { getFullVersionString } from '../config/version';
import { getBackgroundGradient } from '../utils/gameLogic';
// Removed CustomScrollIndicator - using simple iPhone menu drawer scrolling approach

/**
 * SettingsDrawerContent - A self-contained library component for settings drawer content
 * 
 * This component contains all the content that appears in the settings drawer
 * when opened via the settings icon. It should NEVER appear in landscape columns.
 * 
 * Features:
 * - Self-contained settings functionality
 * - Scrollable when content exceeds container
 * - Custom scroll indicator for visual feedback
 * - Consistent appearance across orientations
 * - No close functionality (handled by parent drawer)
 */
interface SettingsDrawerContentProps {
  /** Optional callback when close is requested (handled by parent) */
  onClose?: () => void;
}

const SettingsDrawerContent: React.FC<SettingsDrawerContentProps> = ({ onClose }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const { settings, resetGame, updateSettings, gameState } = useGameStore();
  const multiplayerStore = useMultiplayerStore();

  // Simple cleanup on component unmount
  React.useEffect(() => {
    return () => {
      console.log('🔧 SettingsDrawerContent: Component unmounting - cleaning up');
      // Component is being unmounted, no need to reset state as it will be destroyed
    };
  }, []);

  const handleCloseDrawer = () => {
    setShowManual(false);
    setShowCustomSettings(false);
    if (onClose) {
      onClose();
    }
  };

  const handleStartNewGame = () => {
    resetGame();
    handleCloseDrawer();
  };

  const toggleShowTarget = () => {
    updateSettings({ showTarget: !settings.showTarget });
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleClearGuess = () => {
    updateSettings({ clearGuessAfterSubmit: !settings.clearGuessAfterSubmit });
  };



  const handleBackgroundColorChange = (color: 'purple' | 'red' | 'green' | 'blue' | 'orange') => {
    updateSettings({ backgroundColor: color });
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVolume = parseFloat(e.target.value);
    // Snap to nearest 10% increment (0.0, 0.1, 0.2, ..., 1.0)
    const snappedVolume = Math.round(rawVolume * 10) / 10;
    
    updateSettings({ soundVolume: snappedVolume });
    
    // Play a throttled test sound to demonstrate the volume change without crackling
    import('../utils/soundUtils').then(({ soundUtils }) => {
      soundUtils.playVolumeTestSound();
    });
  };

  const handleOpenManual = () => {
    // Show the manual in an in-app modal instead of trying to open externally
    setShowManual(true);
  };

  const handleSwitchToMultiplayer = () => {
    console.log('🎮 Switching to multiplayer mode from settings');
    // Close the settings drawer
    handleCloseDrawer();
    // Navigate to multiplayer mode (this will be handled by the parent App component)
    // For now, we'll use a custom event that the App can listen to
    window.dispatchEvent(new CustomEvent('switchToMultiplayer'));
  };

  const presetDifficulties = [
    { key: 'easy', label: 'Easy', desc: '1×3, 0-6' },
    { key: 'classic', label: 'Classic', desc: '1×3, 0-9' },
    { key: 'medium', label: 'Medium', desc: '2×3, 0-12' },
    { key: 'hard1', label: 'Hard', desc: '2×3, 0-16' },
    { key: 'hard2', label: 'Harder', desc: '2×4, 0-19' },
    { key: 'expert', label: 'Hardest', desc: '3×3, 0-19' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: '0',
      position: 'relative',
      /* DEBUG: Yellow border for settings drawer content wrapper - REMOVED */
      /* border: '3px solid yellow' */
    }}>
      {/* Settings Content - All the game settings and options, full width */}
      <div 
        ref={scrollContainerRef}
        style={{
          flex: '1',
          overflow: 'auto', // Standard browser scrolling
          position: 'relative',
          width: '100%',
          background: 'white',
          borderRadius: '12px',
          padding: '15px',
          margin: '0',
          // Minimal scrollbar styling
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
          pointerEvents: 'auto',
          touchAction: 'pan-y', // Allow vertical scrolling but not horizontal gestures
        } as React.CSSProperties & {
          pointerEvents: 'auto !important';
          touchAction: 'pan-y !important';
        }}
        className="settings-drawer-scrollable"
      >
        {/* Direct menu content without drawer wrapper */}
        <div className="menu-section" style={{ 
          padding: '0 20px 16px 0', // Add 20px right padding to keep content away from scrollbar
          borderBottom: '1px solid #f3f4f6',
          /* DEBUG: Magenta border for menu sections - REMOVED */
          /* border: '2px solid magenta' */
        }}>
          <button
            className="menu-item primary"
            onClick={handleStartNewGame}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: '1px solid #4f46e5',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              marginBottom: '0'
            }}
          >
            <RotateCcw size={18} />
            New Game
          </button>
        </div>

        <div className="menu-section" style={{ padding: '16px 20px 16px 0', borderBottom: '1px solid #f3f4f6' }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#374151', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>Difficulty Presets</h4>
          <div className="difficulty-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {presetDifficulties.map(({ key, label, desc }) => (
              <button
                key={key}
                className={`difficulty-btn ${settings.difficulty === key ? 'active' : ''}`}
                onClick={() => handleDifficultyChange(key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '12px 16px',
                  background: settings.difficulty === key ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid ' + (settings.difficulty === key ? '#4f46e5' : 'rgba(0, 0, 0, 0.1)'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                  color: settings.difficulty === key ? 'white' : '#374151'
                }}
              >
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{label}</span>
                <span style={{ fontSize: '0.8rem', opacity: '0.8', marginTop: '2px' }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="menu-section" style={{ padding: '16px 20px 16px 0', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ 
              margin: '0', 
              color: '#374151', 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px' 
            }}>Custom Settings</h4>
            <button
              onClick={() => setShowCustomSettings(!showCustomSettings)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#4f46e5',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Settings size={16} />
              {showCustomSettings ? 'Hide' : 'Show'}
            </button>
          </div>

          <AnimatePresence>
            {showCustomSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#374151', fontSize: '0.9rem', fontWeight: '500' }}>
                    <Hash size={16} />
                    Digit Range: 0-{settings.digitRange}
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="19"
                    value={settings.digitRange}
                    onChange={(e) => handleCustomSettingChange('digitRange', parseInt(e.target.value))}
                    style={{ width: '100%', marginBottom: '4px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{settings.digitRange + 1} numbers</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#374151', fontSize: '0.9rem', fontWeight: '500' }}>
                    <Grid3X3 size={16} />
                    Grid Rows: {settings.gridRows}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={settings.gridRows}
                    onChange={(e) => handleCustomSettingChange('gridRows', parseInt(e.target.value))}
                    style={{ width: '100%', marginBottom: '4px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{settings.gridRows} row{settings.gridRows !== 1 ? 's' : ''}</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#374151', fontSize: '0.9rem', fontWeight: '500' }}>
                    <Grid3X3 size={16} />
                    Grid Columns: {settings.gridColumns}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={settings.gridColumns}
                    onChange={(e) => handleCustomSettingChange('gridColumns', parseInt(e.target.value))}
                    style={{ width: '100%', marginBottom: '4px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{settings.gridColumns} column{settings.gridColumns !== 1 ? 's' : ''}</span>
                </div>

                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#374151' }}>Target Length: {settings.gridRows * settings.gridColumns} digits</p>
                  <p style={{ margin: '0', fontSize: '0.85rem', color: '#374151' }}>Current: {settings.difficulty === 'custom' ? 'Custom' : settings.difficulty}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="menu-section" style={{ padding: '16px 20px 16px 0', borderBottom: '1px solid #f3f4f6' }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#374151', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>Options</h4>
          
          <button
            onClick={handleOpenManual}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#374151',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            <BookOpen size={18} />
            How to Play
          </button>

          <button
            onClick={toggleShowTarget}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#374151',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            {settings.showTarget ? <EyeOff size={18} /> : <Eye size={18} />}
            {settings.showTarget ? 'Hide Target' : 'Show Target'}
            <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: 'auto' }}>(Disables scoring)</span>
          </button>

          <button
            onClick={toggleSound}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#374151',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {settings.soundEnabled ? 'Sound: ON' : 'Sound: OFF'}
          </button>

          <button
            onClick={handleSwitchToMultiplayer}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              border: '1px solid #7c3aed',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            <Users size={18} />
            Switch to Multiplayer
            <span style={{ fontSize: '0.8rem', opacity: '0.9', marginLeft: 'auto' }}>Play with friends!</span>
          </button>

          {settings.soundEnabled && (
            <div 
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '8px 11px',
                background: 'none',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '0.9rem', fontWeight: '500' }}>
                <Volume2 size={16} />
                Volume: {Math.round((settings.soundVolume || 0.1) * 100)}% 
                <span style={{ fontSize: '0.8em', opacity: 0.7 }}>
                  (Level {Math.round((settings.soundVolume || 0.1) * 10)})
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume || 0.1}
                onChange={handleVolumeChange}
                style={{
                  width: '100%',
                  background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(settings.soundVolume || 0.1) * 100}%, #e5e7eb ${(settings.soundVolume || 0.1) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.7em', 
                opacity: 0.6,
                marginTop: '2px'
              }}>
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          <button
            onClick={toggleClearGuess}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#374151',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            <RotateCcw size={18} />
            {settings.clearGuessAfterSubmit ? 'Clear Guess After Submit: ON' : 'Clear Guess After Submit: OFF'}
          </button>



          {/* Background Color Picker */}
          <button
            onClick={() => {}} // No action needed, just for styling
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px 11px',
              background: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              cursor: 'default',
              color: '#374151',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: getBackgroundGradient(settings.backgroundColor) }} />
              Background Color
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              width: '100%'
            }}>
              {(['purple', 'red', 'green', 'blue', 'orange'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => handleBackgroundColorChange(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: settings.backgroundColor === color ? '3px solid #374151' : '2px solid rgba(0, 0, 0, 0.2)',
                    background: getBackgroundGradient(color),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: settings.backgroundColor === color ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transform: settings.backgroundColor === color ? 'scale(1.1)' : 'scale(1)',
                  }}
                  title={`${color.charAt(0).toUpperCase() + color.slice(1)} theme`}
                />
              ))}
            </div>
          </button>
        </div>

        <div className="menu-section" style={{ padding: '16px 20px 16px 0', borderBottom: '1px solid #f3f4f6' }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#374151', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>Current Game</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: '#6b7280' }}>Mode:</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>{settings.difficulty === 'custom' ? 'Custom' : settings.difficulty}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: '#6b7280' }}>Grid:</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>{settings.gridRows}×{settings.gridColumns}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: '#6b7280' }}>Range:</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>0-{settings.digitRange}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: '#6b7280' }}>Guesses:</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>{gameState.guesses.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: '#6b7280' }}>Score:</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>{gameState.score}</span>
            </div>
          </div>
        </div>

        <div className="menu-section" style={{ padding: '16px 20px 0 0', borderBottom: 'none' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ 
              fontSize: '0.8rem', 
              color: '#374151', 
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace", 
              fontWeight: '500' 
            }}>{getFullVersionString()}</span>
          </div>
        </div>
      </div>
      
      {/* Removed CustomScrollIndicator - using simple iPhone menu drawer scrolling approach */}

      {/* Manual Modal - Full screen sized with proper dismissal */}
      <AnimatePresence>
        {showManual && (
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20000, // Higher than everything else
              padding: '20px',
              boxSizing: 'border-box'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowManual(false)}
          >
            <motion.div
              style={{
                background: 'white',
                borderRadius: '12px',
                width: 'min(95vw, 1200px)', // Much larger width
                height: 'min(90vh, 900px)', // Much larger height
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                position: 'relative'
              }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                background: '#f8fafc',
                flexShrink: 0
              }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.3rem', fontWeight: '600' }}>How to Play - PicoFermiBagel</h3>
                <button
                  onClick={() => setShowManual(false)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#dc2626',
                    cursor: 'pointer',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  aria-label="Close manual"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  <X size={18} style={{ marginRight: '6px' }} />
                  Close
                </button>
              </div>
              
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <iframe
                  src="/pfb_manual.html"
                  title="PicoFermiBagel Manual"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  frameBorder="0"
                />
              </div>
              
              {/* Dismiss instruction */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                backdropFilter: 'blur(4px)',
                zIndex: 1
              }}>
                Click anywhere outside to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsDrawerContent; 