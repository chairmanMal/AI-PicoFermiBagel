import React, { useState, useRef, useCallback } from 'react';
import { HelpCircle, Lock } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { getNextUnlockedPosition, calculateTargetRowSums } from '@/utils/gameLogic';
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

  const handleMouseDown = useCallback(() => {
    longPressCompleted.current = false;
    if (value !== null) {
      setIsLongPressing(true);
      longPressTimer.current = setTimeout(() => {
        onLockToggle(position);
        setIsLongPressing(false);
        longPressCompleted.current = true;
      }, 500); // 500ms for long press
    }
  }, [value, position, onLockToggle]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    longPressCompleted.current = false;
    if (value !== null) {
      setIsLongPressing(true);
      longPressTimer.current = setTimeout(() => {
        onLockToggle(position);
        setIsLongPressing(false);
        longPressCompleted.current = true;
      }, 500); // 500ms for long press
    }
  }, [value, position, onLockToggle]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isLongPressing && !longPressCompleted.current) {
      setIsLongPressing(false);
      // This was a regular click, not a long press - allow clicking on any unlocked position
      onBoxClick(position);
    } else if (longPressCompleted.current) {
      // Reset the flag for next interaction
      longPressCompleted.current = false;
      setIsLongPressing(false);
    } else if (!isLongPressing && !longPressCompleted.current) {
      // This was a click on an empty position - still allow selection
      onBoxClick(position);
    }
  }, [isLongPressing, position, onBoxClick]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isLongPressing && !longPressCompleted.current) {
      setIsLongPressing(false);
      // This was a regular tap, not a long press - allow tapping on any unlocked position
      onBoxClick(position);
    } else if (longPressCompleted.current) {
      // Reset the flag for next interaction
      longPressCompleted.current = false;
      setIsLongPressing(false);
    } else if (!isLongPressing && !longPressCompleted.current) {
      // This was a tap on an empty position - still allow selection
      onBoxClick(position);
    }
  }, [isLongPressing, position, onBoxClick]);

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
        import('../utils/soundUtils').then(({ soundUtils }) => {
          soundUtils.playDripSound();
        });
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

  return (
    <div
      className={`guess-box ${isActive ? 'active' : ''} ${isRepeated ? 'repeated' : ''} ${isDragOver ? 'drag-over' : ''} ${isLocked ? 'locked' : ''} ${isLongPressing ? 'long-pressing' : ''}`}
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
      title={value !== null && !isLocked ? "Click to select, double-click to clear, long-press to lock" : isLocked ? "Long-press to unlock" : "Click to select this position"}
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
          <Lock size={14} />
        </div>
      )}
      
      {isLongPressing && (
        <div className="long-press-indicator" />
      )}
    </div>
  );
};

const GuessArea: React.FC = () => {


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
      align-items: flex-start;
      justify-content: center;
      padding: 20px;
      padding-top: 80px;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 2147483647;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 20px;
        ">
          <h4 style="margin: 0; font-size: 1.2rem; color: #1f2937;">Guess Position Controls</h4>
          <button id="close-toast" style="
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            padding: 4px 8px;
            border-radius: 4px;
          ">×</button>
        </div>
        <div style="padding: 0 20px 20px;">
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Blue Outline:</strong> Auto-fill position - numbers will go here when tapped</p>
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Manual Selection:</strong> Click any unlocked box to make it the active position</p>
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Drag & Drop:</strong> Drag numbers directly onto any unlocked box</p>
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Locking:</strong> Long-press any filled box to lock/unlock it</p>
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Clear Numbers:</strong> Double-click any unlocked filled box to clear it</p>
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Red Border:</strong> Indicates duplicate numbers (not allowed)</p>
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Yellow Highlight:</strong> Shows a filled box selected for replacement</p>
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
    <div className="guess-area">
      <div className="guess-header">
        <h3 className="guess-title">Your Guess</h3>
        <button
          className="help-button"
          onClick={showToast}
          aria-label="Show help"
        >
          <HelpCircle size={27} />
        </button>
      </div>

      <div className="guess-grid" style={{
        '--grid-rows': settings.gridRows,
        '--grid-columns': settings.gridColumns
      } as React.CSSProperties}>
        {createGuessGrid()}
      </div>


    </div>
  );
};

export default GuessArea; 