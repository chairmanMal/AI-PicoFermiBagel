import React, { useState, useRef, useCallback } from 'react';
import { Lock } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { getNextUnlockedPosition, calculateTargetRowSums } from '@/utils/gameLogic';
import { soundUtils } from '@/utils/soundUtils';
import { registerDragIndicator, unregisterDragIndicator } from '@/utils/dragCleanup';
import { getBuildString } from '@/config/version';
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
  const [isDragOver, setIsDragOver] = useState(false);
  
  // New state for dragging guess box numbers
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragIndicatorElement, setDragIndicatorElement] = useState<HTMLDivElement | null>(null);
  const dragTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDoubleClickRef = useRef(false);
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
    console.log(`🎯 GuessArea: Mouse down on position ${position}, value: ${value}, type: ${typeof value}`);
    console.log(`🎯 GuessArea: TEST - Mouse down event received on position ${position}`);
    
    // Clear any existing drag state first
    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }
    setIsDragging(false);
    setDragStart(null);
    removeDragIndicator();
    
    // ONLY set up drag timer if there's a value (filled position) AND it's not locked
    if (value !== null && value !== undefined && !isLocked) {
      console.log(`🎯 GuessArea: Setting up drag timer for position ${position} with value ${value} (unlocked)`);
      const rect = e.currentTarget.getBoundingClientRect();
      const startPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      
      // Start 300ms timer for drag detection (much more responsive)
      dragTimerRef.current = setTimeout(() => {
        if (!isDoubleClickRef.current) {
          console.log(`🎯 GuessArea: Drag timer completed for position ${position}, starting drag`);
          setDragStart(startPos);
          setIsDragging(true);
          createDragIndicator(e.clientX, e.clientY);
        } else {
          console.log(`🎯 GuessArea: Drag timer cancelled due to double-click for position ${position}`);
        }
      }, 300); // 300ms to start drag
    } else if (value !== null && value !== undefined && isLocked) {
      console.log(`🎯 GuessArea: No drag timer for position ${position} - locked position`);
    } else {
      console.log(`🎯 GuessArea: No drag timer for position ${position} - empty position`);
    }
  }, [position, value, createDragIndicator, removeDragIndicator]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    console.log(`🎯 GuessArea: Touch start on position ${position}, value: ${value}, type: ${typeof value}`);
    
    // Clear any existing drag state first
    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }
    setIsDragging(false);
    setDragStart(null);
    removeDragIndicator();
    
    // ONLY set up drag timer if there's a value (filled position) AND it's not locked
    if (value !== null && value !== undefined && !isLocked) {
      console.log(`🎯 GuessArea: Setting up touch drag timer for position ${position} with value ${value} (unlocked)`);
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const startPos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      
      // Start 300ms timer for drag detection (much more responsive)
      dragTimerRef.current = setTimeout(() => {
        if (!isDoubleClickRef.current) {
          console.log(`🎯 GuessArea: Touch drag timer completed for position ${position}, starting drag`);
          console.log(`🎯 GuessArea: Setting drag state - startPos:`, startPos, `clientX: ${touch.clientX}, clientY: ${touch.clientY}`);
          setDragStart(startPos);
          setIsDragging(true);
          const indicator = createDragIndicator(touch.clientX, touch.clientY);
          console.log(`🎯 GuessArea: Drag indicator created:`, indicator ? 'success' : 'failed');
        } else {
          console.log(`🎯 GuessArea: Touch drag timer cancelled due to double-click for position ${position}`);
        }
      }, 300); // 300ms to start drag
    } else if (value !== null && value !== undefined && isLocked) {
      console.log(`🎯 GuessArea: No touch drag timer for position ${position} - locked position`);
    } else {
      console.log(`🎯 GuessArea: No touch drag timer for position ${position} - empty position`);
    }
  }, [position, value, createDragIndicator, removeDragIndicator]);

  // Mouse move handler for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Only track movement if already dragging
    if (isDragging) {
      updateDragIndicator(e.clientX, e.clientY);
    } else {
      // If not dragging but we have drag state, force cleanup
      if (dragStart || dragIndicatorElement) {
        console.log('🎯 GuessArea: Force cleanup on mouse move - not dragging but have drag state');
        setIsDragging(false);
        setDragStart(null);
        removeDragIndicator();
      }
    }
  }, [isDragging, dragStart, dragIndicatorElement, updateDragIndicator, removeDragIndicator]);

  // Touch move handler for dragging
  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Only track movement if already dragging
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      updateDragIndicator(touch.clientX, touch.clientY);
    }
  }, [isDragging, updateDragIndicator]);

  // Handle drag end for swapping
  const handleDragEnd = useCallback((clientX: number, clientY: number) => {
    try {
      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current);
        dragTimerRef.current = null;
      }

      let dropSuccessful = false;

      if (isDragging) {
        // Find the element under the drop point
        const elementBelow = document.elementFromPoint(clientX, clientY);
        const targetGuessBox = elementBelow?.closest('.guess-box');
        
        if (targetGuessBox) {
          const targetPosition = parseInt(targetGuessBox.getAttribute('data-position') || '0');
          const targetIsLocked = targetGuessBox.classList.contains('locked');
          
          // Only swap if target is different position, target is not locked, and source is not locked
          if (targetPosition !== position && !targetIsLocked && !isLocked) {
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
    console.log(`🎯 GuessArea: Mouse up on position ${position}, isDragging: ${isDragging}, value: ${value}`);
    
    // ALWAYS clear the drag timer first - this prevents any drag logic from starting
    if (dragTimerRef.current) {
      console.log(`🎯 GuessArea: Clearing drag timer for position ${position}`);
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
      }
      
    try {
      if (isDragging) {
        console.log(`🎯 GuessArea: Handling drag end for position ${position}`);
        handleDragEnd(e.clientX, e.clientY);
      } else {
        // Single click - only move selection target if not locked
        if (!isLocked) {
          console.log(`🎯 GuessArea: Single click - moving selection to position ${position}`);
          onBoxClick(position);
        } else {
          console.log(`🎯 GuessArea: Single click on locked position ${position} - no action`);
        }
      }
    } catch (error) {
      console.warn('🎯 GuessArea: Error in handleMouseUp:', error);
    } finally {
      // Always ensure cleanup, even if not dragging
      console.log(`🎯 GuessArea: Final cleanup for position ${position}`);
      setIsDragging(false);
      setDragStart(null);
      removeDragIndicator();
    }
  }, [position, onBoxClick, isDragging, handleDragEnd, isLocked, removeDragIndicator, value]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    console.log(`🎯 GuessArea: Touch end on position ${position}, isDragging: ${isDragging}, value: ${value}`);
    
    // ALWAYS clear the drag timer first - this prevents any drag logic from starting
    if (dragTimerRef.current) {
      console.log(`🎯 GuessArea: Clearing drag timer for position ${position}`);
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
      }
      
    try {
      if (isDragging) {
        console.log(`🎯 GuessArea: Handling touch drag end for position ${position}`);
        const touch = e.changedTouches[0];
        handleDragEnd(touch.clientX, touch.clientY);
      } else {
        // Single tap - only move selection target if not locked
        if (!isLocked) {
          console.log(`🎯 GuessArea: Single tap - moving selection to position ${position}`);
          onBoxClick(position);
        } else {
          console.log(`🎯 GuessArea: Single tap on locked position ${position} - no action`);
        }
      }
    } catch (error) {
      console.warn('🎯 GuessArea: Error in handleTouchEnd:', error);
    } finally {
      // Always ensure cleanup, even if not dragging
      console.log(`🎯 GuessArea: Final cleanup for position ${position}`);
      setIsDragging(false);
      setDragStart(null);
      removeDragIndicator();
    }
  }, [position, onBoxClick, isDragging, handleDragEnd, isLocked, removeDragIndicator, value]);

  const handleDoubleClick = () => {
    console.log(`🎯 GuessArea: Double-click detected on position ${position}, value: ${value}, type: ${typeof value}`);
    
    // Set flag to prevent drag detection
    isDoubleClickRef.current = true;
    console.log(`🎯 GuessArea: Set isDoubleClickRef to true for position ${position}`);
    
    // Clear any pending drag timer
    if (dragTimerRef.current) {
      console.log(`🎯 GuessArea: Clearing drag timer due to double-click for position ${position}`);
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }
    
    // ONLY handle double-click for filled positions
    if (value !== null && value !== undefined) {
      // Double click on filled position toggles lock state
      console.log(`🎯 GuessArea: Calling onLockToggle for position ${position}`);
      onLockToggle(position);
    } else {
      // Double click on empty position does nothing
      console.log(`🎯 GuessArea: Double-click on empty position ${position} - doing nothing`);
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isDoubleClickRef.current = false;
      console.log(`🎯 GuessArea: Reset isDoubleClickRef to false for position ${position}`);
    }, 100);
  };

  // Add a simple test to see if double-click events are being received at all
  React.useEffect(() => {
    const element = document.querySelector(`[data-position="${position}"]`);
    if (element) {
      const testDoubleClick = () => {
        console.log(`🎯 GuessArea: TEST - Double-click event received on position ${position}`);
      };
      element.addEventListener('dblclick', testDoubleClick);
      return () => element.removeEventListener('dblclick', testDoubleClick);
    }
  }, [position]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default context menu
    if (value !== null && !isLocked) {
      // Right-click on unlocked filled position clears it
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
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove]);

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
      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current);
      }
    };
  }, [dragIndicatorElement, position]);

  // Cleanup drag state when position changes (user clicks different position)
  React.useEffect(() => {
    // Only clear drag state if we're not currently in a drag operation
    if (!isDragging) {
      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current);
        dragTimerRef.current = null;
      }
      setDragStart(null);
      removeDragIndicator();
    }
  }, [position, removeDragIndicator, isDragging]);

  // Additional cleanup when value changes (prevents drag on empty positions)
  React.useEffect(() => {
    if (value === null || value === undefined) {
      // Clear drag state if position becomes empty and we're not currently dragging
      if (!isDragging) {
        if (dragTimerRef.current) {
          clearTimeout(dragTimerRef.current);
          dragTimerRef.current = null;
        }
        setDragStart(null);
        removeDragIndicator();
      }
    }
  }, [value, removeDragIndicator, isDragging]);

  return (
    <div
      className={`guess-box ${isActive ? 'active' : ''} ${isRepeated ? 'repeated' : ''} ${isDragOver ? 'drag-over' : ''} ${isLocked ? 'locked' : ''} ${isDragging ? 'dragging' : ''}`}
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
      onContextMenu={handleContextMenu}
      title={value !== null && !isLocked ? "Click to select, double-click to lock/unlock, right-click to clear, or drag to swap with another position" : value !== null ? "Click to select, double-click to lock/unlock, or drag to swap with another position" : "Click to select this position"}
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
    </div>
  );
};

interface GuessAreaProps {
  // Removed isLandscape prop since we're no longer using conditional styling
}

const GuessArea: React.FC<GuessAreaProps> = () => {
  const { settings, gameState, hintState, dispatch } = useGameStore();
  
  // Log build number for debugging
  console.log(`🎯 GuessArea: Component initialized - ${getBuildString()}`);
  
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