import React, { useState, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { isNumberUsedInGuess } from '@/utils/gameLogic';
import { soundUtils } from '@/utils/soundUtils';
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
      // border: 4px solid #3b82f6; // DEBUG BORDER REMOVED
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
          }
        } catch (error) {
          // Silently handle error
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
        // Check if we're still in the same touch session
        if (isLongPressing) {
          setIsLongPressing(false);
          setIsDragging(true);
          createDragIndicator(touch.clientX, touch.clientY);
        }
      }, 300);
    }
  }, [isLongPressing, createDragIndicator]);

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
      
      // Start dragging immediately on any movement
      if (!isDragging) {
        setIsLongPressing(false);
        setIsDragging(true);
        createDragIndicator(touch.clientX, touch.clientY);
      } else {
        updateDragIndicator(touch.clientX, touch.clientY);
      }
    }
  }, [dragStart, isDragging, createDragIndicator, updateDragIndicator]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    
    // Clear the drag timeout immediately
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    

    
    // Handle tap - if we were long pressing but never started dragging, it's a tap
    if (isLongPressing && !isDragging) {
      onNumberClick(digit);
    } else if (isDragging) {
      // Handle drag end
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const guessBox = elementBelow?.closest('.guess-box');
      
      if (guessBox) {
        const position = parseInt(guessBox.getAttribute('data-position') || '0');
        const isLocked = guessBox.classList.contains('locked');
        
        if (!isLocked) {
          dispatch({ type: 'SET_GUESS_DIGIT_NO_ADVANCE', position, digit });
          
          // Play drip sound for drag and drop placement with delay to ensure audio context is ready
          setTimeout(() => {
            try {
              soundUtils.playDripSound();
            } catch (error) {
              console.warn('🎵 Failed to play drip sound:', error);
            }
          }, 10);
        }
      }
    } else {
      // Fallback - if somehow we get here without proper state, treat as tap
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
    

    
    // If we were not dragging, it's a click
    if (!isDragging) {
      onNumberClick(digit);
    } else {
      // Handle drag end
      const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
      const guessBox = elementBelow?.closest('.guess-box');
      
      if (guessBox) {
        const position = parseInt(guessBox.getAttribute('data-position') || '0');
        const isLocked = guessBox.classList.contains('locked');
        
        if (!isLocked) {
          dispatch({ type: 'SET_GUESS_DIGIT_NO_ADVANCE', position, digit });
          
          // Play drip sound for drag and drop placement with delay to ensure audio context is ready
          setTimeout(() => {
            try {
              soundUtils.playDripSound();
            } catch (error) {
              console.warn('🎵 Failed to play drip sound:', error);
            }
          }, 10);
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

  // Global cleanup for orphaned drag indicators - more aggressive
  React.useEffect(() => {
    const handleGlobalTouchEnd = () => {
      // Always clean up any orphaned indicators, regardless of drag state
      if (dragIndicatorElement) {
        console.log(`🎯 SelectionArea: Global cleanup - removing orphaned drag indicator for digit ${digit}`);
        removeDragIndicator();
      }
    };

    const handleGlobalMouseUp = () => {
      // Always clean up any orphaned indicators, regardless of drag state
      if (dragIndicatorElement) {
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

    // Add a timeout-based cleanup as fallback
    const fallbackCleanup = setTimeout(() => {
      if (dragIndicatorElement) {
        console.log(`🎯 SelectionArea: Fallback cleanup - removing orphaned drag indicator for digit ${digit}`);
        removeDragIndicator();
      }
    }, 5000); // 5 second fallback

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackCleanup);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [dragIndicatorElement, digit, removeDragIndicator]);

  // Cleanup drag indicator on unmount or when digit changes
  React.useEffect(() => {
    return () => {
      if (dragIndicatorElement && document.body.contains(dragIndicatorElement)) {
        try {
          document.body.removeChild(dragIndicatorElement);
        } catch (error) {
          // Silently handle error
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

interface SelectionAreaProps {
}

const SelectionArea: React.FC<SelectionAreaProps> = () => {
  // isLandscape prop is used by parent components for layout decisions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { gameState, hintState, scratchpadState, settings, dispatch } = useGameStore();
  const { currentGuess, guesses } = gameState;

  // Clean up any orphaned drag indicators on mount/unmount
  React.useEffect(() => {
    const cleanupOrphanedIndicators = () => {
      // Look for any elements with the drag indicator styling
      const indicators = document.querySelectorAll('[style*="z-index: 2147483647"][style*="position: fixed"]');
      indicators.forEach(indicator => {
        // Check if it looks like a drag indicator (has text content that's a number)
        if (indicator.textContent && /^\d$/.test(indicator.textContent.trim())) {
          try {
            document.body.removeChild(indicator);
          } catch (error) {
            // Silently handle error
          }
        }
      });
    };

    // Clean up on mount
    cleanupOrphanedIndicators();
    
    // Also clean up on window focus/blur events as a safety net
    const handleWindowFocus = () => {
      setTimeout(cleanupOrphanedIndicators, 100);
    };
    
    const handleWindowBlur = () => {
      cleanupOrphanedIndicators();
    };
    
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      cleanupOrphanedIndicators();
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);



  const handleNumberClick = (digit: number) => {
    if (!gameState.isGameActive) return;
    

    
    // Ensure audio is activated on first interaction (fallback)
    if (settings.soundEnabled) {
      // Small delay to avoid interfering with immediate number placement
      setTimeout(() => {
        soundUtils.activateAudio().catch(() => {
          // Silently handle error
        });
      }, 10);
    }
    
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
    return guesses.some(guess => guess.digits.includes(digit));
  };

  const availableNumbers = Array.from(
    { length: settings.digitRange + 1 }, 
    (_, i) => i
  );





  return (
    <div className="selection-area" style={{ 
      position: 'relative', // CRITICAL: This makes absolute positioning work relative to this container
      height: 'auto',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'transparent', // Transparent since parent has pink background
      border: 'none', // No border since parent has border
      borderRadius: 'inherit', // Inherit from parent card
      width: '100%',
      minHeight: '0'
    }}>
      {/* Main content area - natural sizing */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '0' // Allow shrinking
      }}>
        <div className="numbers-container" style={{ 
          overflow: 'visible',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '8px', // RESTORED top padding
          paddingBottom: '8px', // Match YourGuessBlock's content padding approach
          minHeight: '0'
        }}>
          <div className="numbers-grid">
            {availableNumbers.map((digit) => (
              <NumberButton
                key={digit}
                digit={digit}
                isUsed={isNumberUsedInGuess(digit, currentGuess)}
                isUsedInSubmitted={isNumberUsedInSubmittedGuesses(digit)}
                hintColor={getHintColor(digit)}
                onNumberClick={handleNumberClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionArea; 