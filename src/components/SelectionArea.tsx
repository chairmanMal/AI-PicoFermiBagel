import React, { useState, useRef, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';
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

  const [dragIndicatorElement, setDragIndicatorElement] = useState<HTMLDivElement | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { dispatch } = useGameStore();

  // Create global drag indicator attached to document.body
  const createDragIndicator = useCallback((x: number, y: number) => {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      left: ${x - 35}px;
      top: ${y - 35}px;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: #1f2937;
      border: 4px solid #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 900;
      z-index: 2147483647;
      pointer-events: none;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(59, 130, 246, 0.3);
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);
      opacity: 1;
      visibility: visible;
    `;
    indicator.textContent = digit.toString();
    document.body.appendChild(indicator);
    setDragIndicatorElement(indicator);
    // console.log(`🎯 Created global drag indicator for digit ${digit} at ${x}, ${y}`);
    return indicator;
  }, [digit]);

  // Update drag indicator position
  const updateDragIndicator = useCallback((x: number, y: number) => {
    if (dragIndicatorElement) {
      dragIndicatorElement.style.left = `${x - 35}px`;
      dragIndicatorElement.style.top = `${y - 35}px`;
      // console.log(`🎯 Updated drag indicator position to ${x}, ${y}`);
    }
  }, [dragIndicatorElement]);

  // Remove drag indicator with safety checks
  const removeDragIndicator = useCallback(() => {
    if (dragIndicatorElement) {
      try {
        if (document.body.contains(dragIndicatorElement)) {
          document.body.removeChild(dragIndicatorElement);
          console.log(`🎯 SelectionArea: Removed drag indicator for digit ${digit}`);
        }
      } catch (error) {
        console.warn(`🎯 SelectionArea: Failed to remove drag indicator for digit ${digit}:`, error);
      }
      setDragIndicatorElement(null);
    }
  }, [dragIndicatorElement, digit]);

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
      const relativeX = touch.clientX - rect.left;
      const relativeY = touch.clientY - rect.top;
      setDragStart({ x: relativeX, y: relativeY });
      setIsLongPressing(true);
      
      // Set timeout for drag detection
      dragTimeoutRef.current = setTimeout(() => {
        if (isLongPressing && dragStart) { // Only start drag if still pressing and not moved
          setIsLongPressing(false);
          setIsDragging(true);
          createDragIndicator(touch.clientX, touch.clientY);
        }
      }, 300);
    }
  }, [digit, isLongPressing, dragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragStart && !isDragging) {
      setIsDragging(true);
      createDragIndicator(e.clientX, e.clientY);
    }
    if (isDragging) {
      updateDragIndicator(e.clientX, e.clientY);
    }
  }, [dragStart, isDragging, createDragIndicator, updateDragIndicator]);

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
        createDragIndicator(touch.clientX, touch.clientY);
      }
      updateDragIndicator(touch.clientX, touch.clientY);
    }
  }, [dragStart, isDragging, digit, createDragIndicator, updateDragIndicator]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    
    // Clear the drag timeout immediately
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    console.log(`🎯 Touch end for digit ${digit}: isLongPressing=${isLongPressing}, isDragging=${isDragging}`);
    
    // Handle tap - if we were long pressing but never started dragging, it's a tap
    if (isLongPressing && !isDragging) {
      console.log(`🎯 Tap detected for digit ${digit} - calling onNumberClick`);
      onNumberClick(digit);
    } else if (isDragging) {
      // Handle drag end
      console.log(`🎯 Drag end for digit ${digit}`);
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const guessBox = elementBelow?.closest('.guess-box');
      
      if (guessBox) {
        const position = parseInt(guessBox.getAttribute('data-position') || '0');
        const isLocked = guessBox.classList.contains('locked');
        
        if (!isLocked) {
          dispatch({ type: 'SET_GUESS_DIGIT_NO_ADVANCE', position, digit });
          
          // Play drip sound for drag and drop placement
          import('../utils/soundUtils').then(({ soundUtils }) => {
            soundUtils.playDripSound();
          });
        }
      }
    } else {
      // Fallback - if somehow we get here without proper state, treat as tap
      console.log(`🎯 Fallback tap for digit ${digit}`);
      onNumberClick(digit);
    }
    
    // Always reset states and clean up
    setIsDragging(false);
    setIsLongPressing(false);
    setDragStart(null);
    removeDragIndicator();
  }, [isLongPressing, isDragging, digit, onNumberClick, dispatch, removeDragIndicator]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    // Clear the drag timeout immediately
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    console.log(`🎯 Mouse up for digit ${digit}: isDragging=${isDragging}`);
    
    // If we were not dragging, it's a click
    if (!isDragging) {
      console.log(`🎯 Click detected for digit ${digit} - calling onNumberClick`);
      onNumberClick(digit);
    } else {
      // Handle drag end
      console.log(`🎯 Mouse drag end for digit ${digit}`);
      const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
      const guessBox = elementBelow?.closest('.guess-box');
      
      if (guessBox) {
        const position = parseInt(guessBox.getAttribute('data-position') || '0');
        const isLocked = guessBox.classList.contains('locked');
        
        if (!isLocked) {
          dispatch({ type: 'SET_GUESS_DIGIT_NO_ADVANCE', position, digit });
          
          // Play drip sound for drag and drop placement
          import('../utils/soundUtils').then(({ soundUtils }) => {
            soundUtils.playDripSound();
          });
        }
      }
    }
    
    // Always reset states and clean up
    setIsDragging(false);
    setIsLongPressing(false);
    setDragStart(null);
    removeDragIndicator();
  }, [isDragging, digit, onNumberClick, dispatch, removeDragIndicator]);

  // Add a simple click handler for mouse users
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only handle click if we're not in a drag state
    if (!isDragging && !isLongPressing) {
      e.preventDefault();
      onNumberClick(digit);
    }
  }, [isDragging, isLongPressing, digit, onNumberClick]);

  // Add a simple touch end handler for immediate tap response
  const handleTouchEndImmediate = useCallback((e: React.TouchEvent) => {
    // Only handle if we're not in a drag state and it's a quick tap
    if (!isDragging && isLongPressing) {
      e.preventDefault();
      // This will be handled by the document touch end handler
    }
  }, [isDragging, isLongPressing]);

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

  // Global cleanup for orphaned drag indicators - less aggressive
  React.useEffect(() => {
    const handleGlobalTouchEnd = () => {
      // Only clean up if we have an orphaned drag indicator
      if (dragIndicatorElement && !isDragging) {
        console.log(`🎯 SelectionArea: Global cleanup - removing orphaned drag indicator for digit ${digit}`);
        removeDragIndicator();
      }
    };

    const handleGlobalMouseUp = () => {
      // Only clean up if we have an orphaned drag indicator
      if (dragIndicatorElement && !isDragging) {
        console.log(`🎯 SelectionArea: Global mouse cleanup - removing orphaned drag indicator for digit ${digit}`);
        removeDragIndicator();
      }
    };

    // Add global listeners with passive: true for better performance
    // Use a slight delay to avoid interfering with the component's own handlers
    const timeoutId = setTimeout(() => {
      document.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: true });
      document.addEventListener('touchcancel', handleGlobalTouchEnd, { passive: true });
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [isDragging, dragIndicatorElement, digit, removeDragIndicator]);

  // Cleanup drag indicator on unmount or when digit changes
  React.useEffect(() => {
    return () => {
      if (dragIndicatorElement && document.body.contains(dragIndicatorElement)) {
        try {
          document.body.removeChild(dragIndicatorElement);
          console.log(`🎯 SelectionArea: Cleanup on unmount - removed drag indicator for digit ${digit}`);
        } catch (error) {
          console.warn(`🎯 SelectionArea: Cleanup on unmount - failed to remove drag indicator for digit ${digit}:`, error);
        }
      }
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, [dragIndicatorElement, digit]);

  const buttonClasses = [
    'number-button',
    isUsed && 'used',
    isUsedInSubmitted && 'used-submitted',
    hintColor !== 'default' && `hint-${hintColor}`,
    // Remove 'dragging' class since we're not styling the original button during drag
  ].filter(Boolean).join(' ');

  return (
    <>
      <div
        ref={dragRef}
        className={buttonClasses}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        onTouchEnd={handleTouchEndImmediate}
        role="button"
        tabIndex={0}
        style={{
          // NO transforms - keep original button completely static
          cursor: isDragging ? 'grabbing' : 'grab',
          // Only subtle visual feedback that doesn't affect layout
          boxShadow: isLongPressing ? '0 0 10px rgba(59, 130, 246, 0.5)' : undefined,
        }}
      >
        <span className="number-text">{digit}</span>
        {isUsed && <div className="used-indicator">•</div>}
      </div>

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

  // Clean up any orphaned drag indicators on mount/unmount
  React.useEffect(() => {
    const cleanupOrphanedIndicators = () => {
      const indicators = document.querySelectorAll('[style*="z-index: 2147483647"][style*="position: fixed"]');
      indicators.forEach(indicator => {
        if (indicator.textContent && /^\d$/.test(indicator.textContent)) {
          try {
            document.body.removeChild(indicator);
            // console.log('🧹 Cleaned up orphaned drag indicator');
          } catch (error) {
            console.warn('🧹 Failed to clean up orphaned indicator:', error);
          }
        }
      });
    };

    cleanupOrphanedIndicators();
    
    return () => {
      cleanupOrphanedIndicators();
    };
  }, []);



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
          <h4 style="margin: 0; color: #1f2937; font-size: 1.1rem; font-weight: 600;">How to Select Numbers</h4>
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
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: #374151;">
              <div style="width: 16px; height: 16px; border-radius: 3px; background-color: #fecaca; border: 1px solid #ef4444;"></div>
              <span><strong>Bagel</strong> - Not in target number</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: #374151;">
              <div style="width: 16px; height: 16px; border-radius: 3px; background-color: #fde68a; border: 1px solid #f59e0b;"></div>
              <span><strong>Pico</strong> - In target, wrong position</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: #374151;">
              <div style="width: 16px; height: 16px; border-radius: 3px; background-color: #a7f3d0; border: 1px solid #10b981;"></div>
              <span><strong>Fermi</strong> - In target, correct position</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: #374151;">
              <div style="width: 16px; height: 16px; border-radius: 3px; background-color: #e5e7eb; border: 1px solid #9ca3af;"></div>
              <span><strong>Used</strong> - Currently in guess</span>
            </div>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
            <p style="margin: 8px 0; font-size: 0.85rem; color: #6b7280; line-height: 1.4;"><strong>Auto-fill:</strong> Tap numbers to fill the highlighted guess position (blue outline)</p>
            <p style="margin: 8px 0; font-size: 0.85rem; color: #6b7280; line-height: 1.4;"><strong>Manual:</strong> Click a guess box first (moves blue outline), then tap a number to fill that guess position</p>
            <p style="margin: 8px 0; font-size: 0.85rem; color: #6b7280; line-height: 1.4;"><strong>Drag & Drop:</strong> Hold and drag a number to a specific guess position and release to assign that position your dragged number</p>
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
      return 'fermi'; // Update to use fermi instead of not-bagel
    }
    
    // Show all scratchpad colors in Number Selection
    const scratchpadColor = scratchpadState.numberColors.get(digit) || 'default';
    return scratchpadColor;
  };

  const isNumberUsedInSubmittedGuesses = (digit: number): boolean => {
    return gameState.guesses.some(guess => guess.digits.includes(digit));
  };

  const availableNumbers = Array.from(
    { length: settings.digitRange + 1 }, 
    (_, i) => i
  );

  // Check if we're in iPad portrait mode for dynamic width expansion
  // const width = window.innerWidth;
  // const height = window.innerHeight;
  // const isPortrait = height > width;
  // const isIpadPortrait = isPortrait && width >= 768 && width <= 1024; // Removed for production
  
  // Debug logging to understand what's happening
  // console.log(`🔍 SelectionArea Debug:`, {
  //   width,
  //   height,
  //   isPortrait,
  //   isIpadPortrait,
  //   targetLength: settings.targetLength,
  //   gridRows: settings.gridRows,
  //   gridColumns: settings.gridColumns,
  //   digitRange: settings.digitRange,
  //   availableNumbersCount: availableNumbers.length
  // });

  return (
    <div className="selection-area" style={{ position: 'relative' }}>
      {/* Help icon absolutely positioned in upper left */}
      <button
        className="help-button"
        onClick={showToast}
        aria-label="Show help"
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '6px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 11
        }}
      >
        <HelpCircle size={27} />
      </button>
      {/* Title centered at the top */}
      <h3 className="selection-title" style={{
        margin: '0 0 clamp(4px, 1vw, 8px) 0',
        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
        color: '#1f2937',
        fontWeight: 600,
        textAlign: 'center',
        width: '100%'
      }}>Number Selection</h3>
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
      {/* Subtitle as footer */}
      <div className="block-footer" style={{
        marginTop: '4px',
        fontSize: 'clamp(0.85rem, 2vw, 1rem)',
        color: '#6b7280',
        fontWeight: 400,
        textAlign: 'center',
        width: '100%'
      }}>
        Tap to auto-fill or drag to specific positions
      </div>
    </div>
  );
};

export default SelectionArea; 