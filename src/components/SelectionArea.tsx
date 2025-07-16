import React, { useState, useRef, useCallback, useEffect } from 'react';
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

interface SelectionAreaProps {
  isLandscape?: boolean; // Optional prop to remove debug colors in landscape mode
}

const SelectionArea: React.FC<SelectionAreaProps> = ({ isLandscape = false }) => {
  console.log('🎯 SelectionArea rendering - BUILD 1312 - isLandscape:', isLandscape);
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
            console.log('🧹 Cleaned up orphaned drag indicator:', indicator.textContent);
          } catch (error) {
            console.warn('🧹 Failed to clean up orphaned indicator:', error);
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
    
    console.log(`🎵 Number click: digit=${digit}, soundEnabled=${settings.soundEnabled}`);
    
    // Ensure audio is activated on first interaction (fallback)
    if (settings.soundEnabled) {
      // Small delay to avoid interfering with immediate number placement
      setTimeout(() => {
        console.log(`🎵 Attempting to activate audio for digit ${digit}`);
        soundUtils.activateAudio().catch(error => {
          console.error('🎵 ❌ Failed to activate audio on number click:', error);
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

  // Debug logging to understand what's happening
  console.log(`🔍 SelectionArea Debug - BUILD 1319:`, {
    digitRange: settings.digitRange,
    availableNumbersCount: availableNumbers.length,
    availableNumbers: availableNumbers,
    targetLength: settings.targetLength,
    gridRows: settings.gridRows,
    gridColumns: settings.gridColumns,
    difficulty: settings.difficulty,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    containerStyle: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    }
  });

  // Additional debugging for the numbers grid
  useEffect(() => {
    const numbersGrid = document.querySelector('.numbers-grid') as HTMLElement;
    if (numbersGrid) {
      console.log(`🔍 Numbers Grid Debug:`, {
        gridElement: numbersGrid,
        gridHeight: numbersGrid.offsetHeight,
        gridWidth: numbersGrid.offsetWidth,
        gridChildren: numbersGrid.children.length,
        gridStyle: window.getComputedStyle(numbersGrid),
        containerHeight: numbersGrid.parentElement?.offsetHeight,
        containerStyle: numbersGrid.parentElement ? window.getComputedStyle(numbersGrid.parentElement) : null
      });
    }
  }, [availableNumbers]);

  return (
    <div className="selection-area" style={{ 
      position: 'relative', // CRITICAL: This makes absolute positioning work relative to this container
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'transparent', // Transparent since parent has pink background
      border: 'none', // No border since parent has border
      borderRadius: 'inherit', // Inherit from parent card
      width: '100%',
      minHeight: '0'
    }}>
      {/* Title centered at the top */}
      <h3 className="selection-title" style={{
        margin: '0 0 clamp(8px, 2vw, 12px) 0', // RESTORED spacing between title and array
        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
        color: '#1f2937',
        fontWeight: 600,
        textAlign: 'center',
        width: '100%',
        flexShrink: 0
      }}>Number Selection</h3>
      
      {/* Main content area - takes remaining space */}
      <div style={{ 
        flex: '1', 
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
          paddingBottom: '0px', // REMOVED padding that was pushing footer up
          flex: '1',
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
      
      {/* Footer positioned at bottom using flexbox */}
      <div 
        className="block-footer" 
        style={{
          position: 'relative', // Use relative positioning
          fontSize: 'clamp(0.85rem, 2vw, 1rem)', // Match Number Selection footer font
          color: '#6b7280',
          fontWeight: 400, // Match Number Selection footer weight
          textAlign: 'center',
          padding: '8px 0',
          borderTop: '1px solid #e5e7eb',
          zIndex: 5,
          boxSizing: 'border-box', // Ensure padding is included in width calculation
          flexShrink: 0, // Prevent footer from shrinking
          // Override any CSS that might interfere
          margin: '0', // Override the CSS margin-top: 8px
          marginTop: 'auto', // Force auto margin to push to bottom
          // Ensure full width by removing any container padding
          marginLeft: '0', // No container padding to compensate for
          marginRight: '0', // No container padding to compensate for
          width: '100%' // Full width
        }}
        onLoad={() => {
          console.log('🎯 NUMBER SELECTION FOOTER: Loaded with proper positioning');
          const footerEl = document.querySelector('.selection-area .block-footer') as HTMLElement;
          const parentEl = document.querySelector('.selection-area') as HTMLElement;
          if (footerEl && parentEl) {
            console.log('🎯 NUMBER SELECTION FOOTER: Position and size:', {
              footerRect: footerEl.getBoundingClientRect(),
              parentHeight: parentEl.offsetHeight,
              footerHeight: footerEl.offsetHeight
            });
          }
        }}
      >
        Tap to auto-fill or drag to specific guess positions
      </div>
    </div>
  );
};

export default SelectionArea; 