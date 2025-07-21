import React, { useState, useRef, useCallback } from 'react';
import { Lock } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { getNextUnlockedPosition, calculateTargetRowSums } from '@/utils/gameLogic';
import { soundUtils } from '@/utils/soundUtils';
import { registerDragIndicator, unregisterDragIndicator } from '@/utils/dragCleanup';
import './GuessArea.css';

interface GuessBoxProps {
  position: number;
  value: number | null;
  isActive: boolean;
  isLocked: boolean;
  isRepeated: boolean;
  onBoxClick: (position: number) => void;
  onLockToggle: (position: number) => void;
}

const GuessBox: React.FC<GuessBoxProps> = ({ 
  position, 
  value, 
  isActive, 
  isLocked, 
  isRepeated,
  onBoxClick, 
  onLockToggle 
}) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const longPressCompleted = useRef(false);
  
  // New state for dragging guess box numbers
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragIndicatorElement, setDragIndicatorElement] = useState<HTMLDivElement | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { dispatch } = useGameStore();

  // Create drag indicator for guess box numbers
  const createDragIndicator = useCallback((x: number, y: number) => {
    if (value === null) return null;
    
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      left: ${x - 35}px;
      top: ${y - 35}px;
      width: 70px;
      height: 70px;
      border-radius: 8px;
      background: #f3f4f6;
      // border: 4px solid #10b981; // DEBUG BORDER REMOVED
      color: #1f2937;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 900;
      z-index: 2147483647;
      pointer-events: none;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(16, 185, 129, 0.3);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      opacity: 1;
      visibility: visible;
    `;
    indicator.textContent = value.toString();
    document.body.appendChild(indicator);
    setDragIndicatorElement(indicator);
    
    // Register with cleanup manager
    registerDragIndicator(indicator);
    
    return indicator;
  }, [value]);

  // Update drag indicator position
  const updateDragIndicator = useCallback((x: number, y: number) => {
    if (dragIndicatorElement) {
      dragIndicatorElement.style.left = `${x - 35}px`;
      dragIndicatorElement.style.top = `${y - 35}px`;
    }
  }, [dragIndicatorElement]);

  // Remove drag indicator with safety checks
  const removeDragIndicator = useCallback(() => {
    if (dragIndicatorElement) {
      // Unregister from cleanup manager first
      unregisterDragIndicator(dragIndicatorElement);
      
      try {
        if (document.body.contains(dragIndicatorElement)) {
          document.body.removeChild(dragIndicatorElement);
          console.log(`🎯 GuessArea: Removed drag indicator for position ${position}`);
        }
      } catch (error) {
        console.warn(`🎯 GuessArea: Failed to remove drag indicator for position ${position}:`, error);
      }
      setDragIndicatorElement(null);
    }
  }, [dragIndicatorElement, position]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    longPressCompleted.current = false;
    // Allow long press on any position with a value (locked or unlocked)
    if (value !== null) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      
      // Delay showing the long-press indicator to avoid visual noise
      setTimeout(() => {
        if (longPressTimer.current) { // Only show if timer is still active
          setIsLongPressing(true);
        }
      }, 200); // 200ms delay before showing orange indicator
      
      // Set up long press timer for locking/unlocking
      longPressTimer.current = setTimeout(() => {
        onLockToggle(position);
        longPressCompleted.current = true;
        setDragStart(null); // Cancel any potential drag
        // Note: setIsLongPressing(false) is handled in mouse/touch up events
      }, 700); // 700ms for more deliberate long press
    }
  }, [value, position, onLockToggle]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    longPressCompleted.current = false;
    // Allow long press on any position with a value (locked or unlocked)
    if (value !== null) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      setDragStart({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      
      // Delay showing the long-press indicator to avoid visual noise
      setTimeout(() => {
        if (longPressTimer.current) { // Only show if timer is still active
          setIsLongPressing(true);
        }
      }, 200); // 200ms delay before showing orange indicator
      
      // Set up long press timer for locking/unlocking
      longPressTimer.current = setTimeout(() => {
        onLockToggle(position);
        longPressCompleted.current = true;
        setDragStart(null); // Cancel any potential drag
        // Note: setIsLongPressing(false) is handled in mouse/touch up events
      }, 700); // 700ms for more deliberate long press
    }
  }, [value, position, onLockToggle]);

  // Mouse move handler for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragStart && !isDragging && !longPressCompleted.current && e.target) {
      const target = e.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      // Start dragging if we've moved enough
      const distance = Math.sqrt(
        Math.pow(e.clientX - (dragStart.x + rect.left), 2) +
        Math.pow(e.clientY - (dragStart.y + rect.top), 2)
      );
      
      if (distance > 10) { // 10px threshold to start drag
        // Cancel long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        setIsLongPressing(false);
        setIsDragging(true);
        createDragIndicator(e.clientX, e.clientY);
      }
    }
    if (isDragging) {
      updateDragIndicator(e.clientX, e.clientY);
    }
  }, [dragStart, isDragging, createDragIndicator, updateDragIndicator]);

  // Touch move handler for dragging
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (dragStart && !isDragging && !longPressCompleted.current && e.target) {
      e.preventDefault();
      const touch = e.touches[0];
      const target = e.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      // Start dragging if we've moved enough
      const distance = Math.sqrt(
        Math.pow(touch.clientX - (dragStart.x + rect.left), 2) +
        Math.pow(touch.clientY - (dragStart.y + rect.top), 2)
      );
      
      if (distance > 10) { // 10px threshold to start drag
        // Cancel long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        setIsLongPressing(false);
        setIsDragging(true);
        createDragIndicator(touch.clientX, touch.clientY);
      }
    }
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      updateDragIndicator(touch.clientX, touch.clientY);
    }
  }, [dragStart, isDragging, createDragIndicator, updateDragIndicator]);

  // Handle drag end for swapping
  const handleDragEnd = useCallback((clientX: number, clientY: number) => {
    try {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }

      let dropSuccessful = false;

      if (isDragging) {
        // Find the element under the drop point
        const elementBelow = document.elementFromPoint(clientX, clientY);
        const targetGuessBox = elementBelow?.closest('.guess-box');
        
        if (targetGuessBox) {
          const targetPosition = parseInt(targetGuessBox.getAttribute('data-position') || '0');
          const targetIsLocked = targetGuessBox.classList.contains('locked');
          
          // Only swap if target is different position and not locked
          if (targetPosition !== position && !targetIsLocked) {
            dispatch({ type: 'MOVE_DIGIT', fromPosition: position, toPosition: targetPosition });
            dropSuccessful = true;
            
            // Play drip sound for successful swap
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

      // Log the drop result for debugging
      if (isDragging && !dropSuccessful) {
        console.log(`🎯 GuessArea: Drag ended without valid drop target for position ${position}`);
      }
    } catch (error) {
      console.warn('🎯 GuessArea: Error in handleDragEnd:', error);
    } finally {
      // Always reset drag states and remove indicator, even if there was an error
      setIsDragging(false);
      setDragStart(null);
      removeDragIndicator();
    }
  }, [isDragging, position, dispatch, removeDragIndicator]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    try {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      // Always clear long-pressing state on mouse up
      setIsLongPressing(false);
      
      if (isDragging) {
        handleDragEnd(e.clientX, e.clientY);
      } else if (!longPressCompleted.current) {
        // This was a regular click, not a long press - allow clicking on any unlocked position
        if (!isLocked) {
          onBoxClick(position);
        }
      } else if (longPressCompleted.current) {
        // Reset the flag for next interaction
        longPressCompleted.current = false;
      }
    } catch (error) {
      console.warn('🎯 GuessArea: Error in handleMouseUp:', error);
      // Ensure cleanup even on error
      setIsLongPressing(false);
      setIsDragging(false);
      setDragStart(null);
      removeDragIndicator();
    }
  }, [isLongPressing, position, onBoxClick, isDragging, handleDragEnd, isLocked, removeDragIndicator]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    try {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      // Always clear long-pressing state on touch end
      setIsLongPressing(false);
      
      if (isDragging) {
        const touch = e.changedTouches[0];
        handleDragEnd(touch.clientX, touch.clientY);
      } else if (!longPressCompleted.current) {
        // This was a regular tap, not a long press - allow tapping on any unlocked position
        if (!isLocked) {
          onBoxClick(position);
        }
      } else if (longPressCompleted.current) {
        // Reset the flag for next interaction
        longPressCompleted.current = false;
      }
    } catch (error) {
      console.warn('🎯 GuessArea: Error in handleTouchEnd:', error);
      // Ensure cleanup even on error
      setIsLongPressing(false);
      setIsDragging(false);
      setDragStart(null);
      removeDragIndicator();
    }
  }, [isLongPressing, position, onBoxClick, isDragging, handleDragEnd, isLocked, removeDragIndicator]);

  const handleDoubleClick = () => {
    if (value !== null && !isLocked) {
      useGameStore.getState().dispatch({
        type: 'SET_GUESS_DIGIT',
        position,
        digit: null
      });
    }
  };

  // Handle drag over events (HTML5 drag and drop - not currently used)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isLocked) {
      setIsDragOver(true);
    }
  }, [isLocked]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!isLocked) {
      const digit = parseInt(e.dataTransfer.getData('text/plain'));
      if (!isNaN(digit)) {
        useGameStore.getState().dispatch({
          type: 'SET_GUESS_DIGIT',
          position,
          digit
        });
        
        // Play drip sound for drag and drop placement
        setTimeout(() => {
          try {
            soundUtils.playDripSound();
          } catch (error) {
            console.warn('🎵 Failed to play drip sound:', error);
          }
        }, 10);
      }
    }
  }, [position, isLocked]);

  // Handle mouse drag feedback (for custom drag implementation)
  const handleMouseEnter = useCallback(() => {
    // Check if something is being dragged by looking for dragging elements
    const isDraggingElement = document.querySelector('.dragging');
    if (isDraggingElement && !isLocked) {
      setIsDragOver(true);
    }
  }, [isLocked]);

  const handleMouseLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // Add event listeners for drag functionality
  React.useEffect(() => {
    if (dragStart) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [dragStart, handleMouseMove, handleTouchMove]);

  // Cleanup is now handled by the centralized dragCleanupManager
  // No need for component-specific global cleanup logic

  // Cleanup drag indicator on unmount
  React.useEffect(() => {
    return () => {
      if (dragIndicatorElement) {
        // Unregister from cleanup manager
        unregisterDragIndicator(dragIndicatorElement);
        
        if (document.body.contains(dragIndicatorElement)) {
          try {
            document.body.removeChild(dragIndicatorElement);
            console.log(`🎯 GuessArea: Cleanup on unmount - removed drag indicator for position ${position}`);
          } catch (error) {
            console.warn(`🎯 GuessArea: Cleanup on unmount - failed to remove drag indicator for position ${position}:`, error);
          }
        }
      }
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, [dragIndicatorElement, position]);

  return (
    <div
      className={`guess-box ${isActive ? 'active' : ''} ${isRepeated ? 'repeated' : ''} ${isDragOver ? 'drag-over' : ''} ${isLocked ? 'locked' : ''} ${isLongPressing ? 'long-pressing' : ''} ${isDragging ? 'dragging' : ''}`}
      data-position={position}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={value !== null && !isLocked ? "Click to select, double-click to clear, long-press to lock, or drag to swap with another position" : isLocked ? "Long-press to unlock" : "Click to select this position"}
    >
      <div className="guess-content">
        {value !== null && value !== undefined ? (
          <span className={`guess-digit ${isRepeated ? 'repeated-text' : ''}`}>
            {value}
          </span>
        ) : (
          <span className="guess-placeholder">-</span>
        )}
      </div>
      
      {isLocked && (
        <div className="lock-indicator">
          <Lock size={12} />
        </div>
      )}
      
      {isLongPressing && (
        <div className="long-press-indicator" />
      )}
    </div>
  );
};

interface GuessAreaProps {
  // Removed isLandscape prop since we're no longer using conditional styling
}

const GuessArea: React.FC<GuessAreaProps> = () => {


  const { settings, gameState, hintState, dispatch } = useGameStore();
  
  // Calculate row sums if any have been purchased
  const targetRowSums = hintState.purchasedHints.revealedRowSums.size > 0
    ? calculateTargetRowSums(gameState.target, settings.gridRows, settings.gridColumns, hintState.purchasedHints.revealedRowSums)
    : undefined;
  
  const handleBoxClick = (position: number) => {
    // Allow clicking on any unlocked position to set it as active
    // (whether it's empty or has a value, as long as it's not locked)
    if (!gameState.lockedPositions.has(position)) {
      dispatch({ type: 'SET_ACTIVE_POSITION', position });
    }
  };

  const handleLockToggle = (position: number) => {
    // Only allow locking/unlocking if there's a value in the position
    if (gameState.currentGuess[position] !== null) {
      // Don't allow locking when there are duplicate numbers
      const filledDigits = gameState.currentGuess.filter(d => d !== null) as number[];
      const uniqueDigits = new Set(filledDigits);
      const hasDuplicates = filledDigits.length !== uniqueDigits.size;
      
      if (!hasDuplicates) {
        const isCurrentlyLocked = gameState.lockedPositions.has(position);
        
        if (!isCurrentlyLocked) {
          // About to lock this position
          // If this position is currently the active position (blue outline), 
          // we need to move the active position before locking
          if (gameState.activeGuessPosition === position) {
            // Find the next unlocked position (excluding this one since it will be locked)
            const nextPosition = getNextUnlockedPosition(
              gameState.currentGuess,
              new Set([...gameState.lockedPositions, position]), // Include this position as if it's already locked
              position + 1
            );
            
            // Update both the lock state and active position
            dispatch({ type: 'TOGGLE_POSITION_LOCK', position });
            dispatch({ type: 'SET_ACTIVE_POSITION', position: nextPosition });
          } else {
            // Just toggle the lock without changing active position
            dispatch({ type: 'TOGGLE_POSITION_LOCK', position });
          }
        } else {
          // About to unlock this position - just toggle the lock, don't change active position
          dispatch({ type: 'TOGGLE_POSITION_LOCK', position });
        }
      }
    }
  };

  // Check for repeated digits
  const getRepeatedPositions = () => {
    const repeated = new Set<number>();
    const digitCounts = new Map<number, number[]>();
    
    gameState.currentGuess.forEach((digit, index) => {
      if (digit !== null) {
        if (!digitCounts.has(digit)) {
          digitCounts.set(digit, []);
        }
        digitCounts.get(digit)!.push(index);
      }
    });

    digitCounts.forEach((positions) => {
      if (positions.length > 1) {
        positions.forEach(pos => repeated.add(pos));
      }
    });

    return repeated;
  };

  const repeatedPositions = getRepeatedPositions();

  // Create grid layout based on settings
  const createGuessGrid = () => {
    const boxes = [];
    let position = 0;
    
    for (let row = 0; row < settings.gridRows; row++) {
      const rowBoxes = [];
      for (let col = 0; col < settings.gridColumns; col++) {
        // Ensure we have a value for this position (null if not set)
        const value = position < gameState.currentGuess.length ? gameState.currentGuess[position] : null;
        
        // Check if there are any duplicates in the entire guess
        const filledDigits = gameState.currentGuess.filter(d => d !== null) as number[];
        const uniqueDigits = new Set(filledDigits);
        const hasDuplicates = filledDigits.length !== uniqueDigits.size;
        
        rowBoxes.push(
          <GuessBox
            key={position}
            position={position}
            value={value}
            isActive={gameState.activeGuessPosition === position}
            isLocked={!hasDuplicates && gameState.lockedPositions.has(position)}
            isRepeated={repeatedPositions.has(position)}
            onBoxClick={handleBoxClick}
            onLockToggle={handleLockToggle}
          />
        );
        position++;
      }
      boxes.push(
        <div key={`row-${row}`} className="guess-row">
          {rowBoxes}
          {targetRowSums && targetRowSums[row] !== null && (
            <span className="row-sum-display">[{targetRowSums[row]}]</span>
          )}
        </div>
      );
    }
    
    return boxes;
  };

  return (
    <div className="guess-grid" style={{
      '--grid-rows': settings.gridRows,
      '--grid-columns': settings.gridColumns,
      flex: '0 0 auto', // Don't expand, just take needed space
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center', // Always center
      alignItems: 'center',
      minHeight: '0',
      padding: '2px', // Minimal padding
      margin: '0', // Remove margin to eliminate gaps
      borderRadius: '8px', // Restore border radius for structure
      boxSizing: 'border-box' // Ensure proper sizing
    } as React.CSSProperties}>
      {createGuessGrid()}
    </div>
  );
};

export default GuessArea; 