import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { dispatch } = useGameStore();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      // For mouse, start drag immediately on move
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      setIsLongPressing(true);
      
      // Start drag after a short delay to differentiate from tap
      dragTimeoutRef.current = setTimeout(() => {
        setIsLongPressing(false);
        setIsDragging(true);
        setDragPosition({ x: touch.clientX, y: touch.clientY });
      }, 200); // Slightly longer delay for better UX
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragStart && !isDragging) {
      setIsDragging(true);
    }
    if (isDragging) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  }, [dragStart, isDragging]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    if (dragStart) {
      e.preventDefault();
      const touch = e.touches[0];
      if (!isDragging) {
        setIsDragging(true);
      }
      setDragPosition({ x: touch.clientX, y: touch.clientY });
    }
  }, [dragStart, isDragging]);

  const handleDragEnd = useCallback((clientX: number, clientY: number) => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }

    if (isDragging) {
      // Find the element under the drop point
      const elementBelow = document.elementFromPoint(clientX, clientY);
      const guessBox = elementBelow?.closest('.guess-box');
      
      if (guessBox) {
        const position = parseInt(guessBox.getAttribute('data-position') || '0');
        const isLocked = guessBox.classList.contains('locked');
        
        if (!isLocked) {
          dispatch({ type: 'SET_GUESS_DIGIT_NO_ADVANCE', position, digit });
        }
      }
    } else if (!isLongPressing) {
      // This was a tap/click, not a drag or long press
      onNumberClick(digit);
    }

    // Reset all states
    setIsDragging(false);
    setIsLongPressing(false);
    setDragStart(null);
    setDragPosition(null);
  }, [isDragging, isLongPressing, digit, dispatch, onNumberClick]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    handleDragEnd(e.clientX, e.clientY);
  }, [handleDragEnd]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    handleDragEnd(touch.clientX, touch.clientY);
  }, [handleDragEnd]);

  // Add event listeners for mouse/touch events
  React.useEffect(() => {
    if (dragStart) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [dragStart, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const buttonClasses = [
    'number-button',
    isUsed && 'used',
    isUsedInSubmitted && 'used-submitted',
    hintColor !== 'default' && `hint-${hintColor}`,
    isDragging && 'dragging',
  ].filter(Boolean).join(' ');

  const dragStyle = isDragging && dragPosition ? {
    position: 'fixed' as const,
    left: dragPosition.x - (dragStart?.x || 0),
    top: dragPosition.y - (dragStart?.y || 0),
    zIndex: 9999, // Very high z-index to appear above everything
    pointerEvents: 'none' as const,
    transform: 'scale(2.0) rotate(5deg)', // Double the size for maximum visibility
    opacity: 1,
    backgroundColor: '#1f2937', // Dark background for contrast
    color: 'white', // White text for maximum visibility
    border: '3px solid #3b82f6', // Blue border for visibility
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(59, 130, 246, 0.3)', // Strong shadow and glow
    borderRadius: '8px',
  } : {};

  return (
    <>
      <div
        ref={dragRef}
        className={buttonClasses}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="button"
        tabIndex={0}
        style={{
          transform: isDragging ? 'scale(1.2)' : isLongPressing ? 'scale(1.1)' : 'scale(1)',
          opacity: 1, // Keep full opacity to maintain grid layout
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'transform 0.1s ease' : 'all 0.2s ease',
          zIndex: isDragging ? 10 : 1, // Bring to front when dragging
          boxShadow: isLongPressing ? '0 0 10px rgba(59, 130, 246, 0.5)' : undefined,
        }}
      >
        <span className="number-text">{digit}</span>
        {isUsed && <div className="used-indicator">•</div>}
      </div>
      
      {/* Dragging clone that follows cursor/finger - rendered as portal to appear above everything */}
      {isDragging && dragPosition && createPortal(
        <div
          className={`${buttonClasses} dragging-clone`}
          style={dragStyle}
        >
          <span className="number-text">{digit}</span>
        </div>,
        document.body
      )}
    </>
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
          <p className="selection-subtitle">Tap to auto-fill or drag to specific positions</p>
        </div>
        <button
          className="help-button"
          onClick={() => setShowHelp(true)}
          aria-label="Show help"
        >
          <HelpCircle size={27} />
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
                <h4>How to Select Numbers</h4>
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
                  <p><strong>Auto-fill:</strong> Tap numbers to fill the highlighted position (blue outline)</p>
                  <p><strong>Manual:</strong> Click a guess box first, then tap a number</p>
                  <p><strong>Drag & Drop:</strong> Hold and drag numbers to specific positions</p>
                  <p><strong>Lock:</strong> Long-press filled positions to lock them</p>
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