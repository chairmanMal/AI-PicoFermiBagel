import React, { useEffect, useRef } from 'react';
import TargetDisplay from './TargetDisplay';
import GuessArea from './GuessArea';
import SelectionArea from './SelectionArea';
import RecentGuessHistory from './RecentGuessHistory';
import Scratchpad from './Scratchpad';
import HintPurchasing from './HintPurchasing';
import ScoreArea from './ScoreArea';
import CircularSubmitButton from './CircularSubmitButton';

interface LandscapeLayoutProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
}

const LandscapeLayout: React.FC<LandscapeLayoutProps> = ({ guessElementRef }) => {
  const landscapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🎯 ========= LANDSCAPE LAYOUT BUILD 660 - FIXED LAYOUT INTERFERENCE ========= 🎯');
    console.log('🎯 VIEWPORT:', `${window.innerWidth}x${window.innerHeight}`);
    
    // Step 1: COMPLETELY RESET any portrait layout interference
    const elementsToReset = [
      document.querySelector('.game-screen'),
      document.querySelector('body'),
      document.querySelector('html'),
      document.querySelector('#root'),
      document.querySelector('.app'),
      document.querySelector('.landscape-container'),
      document.querySelector('.container'),
      document.querySelector('.title-section'),
      document.querySelector('.orange-portrait-container') // Reset portrait container
    ];
    
    elementsToReset.forEach(element => {
      if (element) {
        const el = element as HTMLElement;
        // Reset ALL positioning and styling that could interfere
        el.style.setProperty('padding', '0', 'important');
        el.style.setProperty('margin', '0', 'important');
        el.style.setProperty('box-sizing', 'border-box', 'important');
        el.style.setProperty('position', 'static', 'important');
        el.style.setProperty('top', 'auto', 'important');
        el.style.setProperty('left', 'auto', 'important');
        el.style.setProperty('right', 'auto', 'important');
        el.style.setProperty('bottom', 'auto', 'important');
        el.style.setProperty('width', 'auto', 'important');
        el.style.setProperty('height', 'auto', 'important');
        el.style.setProperty('transform', 'none', 'important');
        el.style.setProperty('transform-origin', 'top left', 'important');
      }
    });
    
    // Hide portrait container completely
    const portraitContainer = document.querySelector('.orange-portrait-container') as HTMLElement;
    if (portraitContainer) {
      portraitContainer.style.setProperty('display', 'none', 'important');
    }
    
    console.log('🎯 ALL INTERFERING ELEMENTS: Reset and portrait container hidden');
    
    // Step 2: DISABLE GameScreen auto-scaling that's interfering
    const gameContainer = document.querySelector('.container') as HTMLElement;
    if (gameContainer) {
      // Reset any auto-scaling applied by GameScreen
      gameContainer.style.setProperty('transform', 'none', 'important');
      gameContainer.style.setProperty('transform-origin', 'top left', 'important');
      gameContainer.style.setProperty('margin-left', '0', 'important');
      gameContainer.style.setProperty('margin-top', '0', 'important');
      gameContainer.style.setProperty('margin-right', '0', 'important');
      gameContainer.style.setProperty('margin-bottom', '0', 'important');
      gameContainer.style.setProperty('position', 'static', 'important');
      console.log('🎯 DISABLED GameScreen auto-scaling that was interfering');
    }
    
    // Step 3: FORCE containers to EXACT screen edge positions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // RED BORDER: MUST be exactly 5px from screen edges
    const redBorder = {
      top: 10,
      left: 5,
      width: viewportWidth - 10, // 5px from both sides = 10px total
      height: viewportHeight - 30, // 10px top + 20px bottom = 30px total
      right: viewportWidth - 5,
      bottom: viewportHeight - 20
    };
    
    console.log('🎯 FORCED RED BORDER:', redBorder);
    console.log('🎯 SCREEN VERIFICATION: Width=' + viewportWidth + ', Height=' + viewportHeight);
    console.log('🎯 RIGHT EDGE CHECK: ' + redBorder.right + ' should equal ' + (viewportWidth - 5));
    
    // Step 4: Position title section and get subtitle position
    const titleSection = document.querySelector('.title-section') as HTMLElement;
    if (titleSection) {
      titleSection.style.setProperty('position', 'fixed', 'important');
      titleSection.style.setProperty('top', `${redBorder.top}px`, 'important');
      titleSection.style.setProperty('left', `${redBorder.left}px`, 'important');
      titleSection.style.setProperty('width', `${redBorder.width}px`, 'important');
      titleSection.style.setProperty('text-align', 'center', 'important');
      titleSection.style.setProperty('z-index', '100', 'important');
      titleSection.style.setProperty('padding', '0', 'important');
      titleSection.style.setProperty('margin', '0', 'important');
      titleSection.style.setProperty('display', 'flex', 'important');
      titleSection.style.setProperty('flex-direction', 'column', 'important');
      titleSection.style.setProperty('justify-content', 'flex-start', 'important');
      titleSection.style.setProperty('align-items', 'center', 'important');
      
      const title = titleSection.querySelector('.game-title') as HTMLElement;
      const subtitle = titleSection.querySelector('.game-subtitle') as HTMLElement;
      
      if (title) {
        title.style.margin = '10px 0 5px 0';
        title.style.fontSize = '1.8rem';
        title.style.fontWeight = '600';
      }
      
      if (subtitle) {
        subtitle.style.margin = '0 0 10px 0';
        subtitle.style.fontSize = '1.1rem';
      }
      
      console.log('🎯 TITLE SECTION: Forcibly positioned');
    }
    
    // Step 5: Calculate orange border positioning WITHOUT submit button space
    setTimeout(() => {
      if (!titleSection) return;
      
      const subtitle = titleSection.querySelector('.game-subtitle') as HTMLElement;
      if (!subtitle) return;
      
      const subtitleRect = subtitle.getBoundingClientRect();
      const subtitleBottom = subtitleRect.bottom;
      
      // ORANGE BORDER: NO submit button space - overlay button instead
      const orangeBorder = {
        top: subtitleBottom + 15, // Normal gap, no submit button space
        left: redBorder.left, // EXACTLY 5px from left screen edge
        width: redBorder.width, // EXACTLY same width as red border
        height: redBorder.bottom - (subtitleBottom + 15), // Normal height
        right: redBorder.right, // EXACTLY 5px from right screen edge
        bottom: redBorder.bottom // EXACTLY 20px from bottom screen edge
      };
      
      console.log('🎯 FORCED ORANGE BORDER (NO SUBMIT SPACE):', orangeBorder);
      console.log('🎯 ORANGE RIGHT EDGE: ' + orangeBorder.right + ' (should be ' + (viewportWidth - 5) + ')');
      console.log('🎯 ORANGE BOTTOM EDGE: ' + orangeBorder.bottom + ' (should be ' + (viewportHeight - 20) + ')');
      
      // Step 6: OVERLAY submit button above orange border (no spacing effect)
      const submitButton = document.querySelector('.landscape-submit-button') as HTMLElement;
      if (submitButton) {
        const columnGap = 5;
        const totalGaps = 2 * columnGap;
        const availableColumnWidth = orangeBorder.width - totalGaps;
        const columnWidth = Math.floor(availableColumnWidth / 3);
        
        // Position button OVERLAYING the orange border, centered over Column 1
        const submitTop = orangeBorder.top + 10; // 10px into orange border
        const submitLeft = orangeBorder.left + (columnWidth / 2) - 38; // Center over Column 1 (76px button width)
        
        submitButton.style.setProperty('position', 'fixed', 'important');
        submitButton.style.setProperty('top', `${submitTop}px`, 'important');
        submitButton.style.setProperty('left', `${submitLeft}px`, 'important');
        submitButton.style.setProperty('width', '76px', 'important'); // Exact CircularSubmitButton size
        submitButton.style.setProperty('height', '76px', 'important');
        submitButton.style.setProperty('z-index', '150', 'important');
        
        console.log('🎯 SUBMIT BUTTON: Overlaid above orange border, centered over Column 1');
      }
      
      // Step 7: FORCE landscape content container to exact positions
      const landscapeContent = document.querySelector('.landscape-content') as HTMLElement;
      if (landscapeContent) {
        // FORCE the container to exact screen positions
        landscapeContent.style.setProperty('position', 'fixed', 'important');
        landscapeContent.style.setProperty('top', `${orangeBorder.top}px`, 'important');
        landscapeContent.style.setProperty('left', `${orangeBorder.left}px`, 'important');
        landscapeContent.style.setProperty('width', `${orangeBorder.width}px`, 'important');
        landscapeContent.style.setProperty('height', `${orangeBorder.height}px`, 'important');
        landscapeContent.style.setProperty('right', 'auto', 'important');
        landscapeContent.style.setProperty('bottom', 'auto', 'important');
        landscapeContent.style.setProperty('display', 'flex', 'important');
        landscapeContent.style.setProperty('flex-direction', 'row', 'important');
        landscapeContent.style.setProperty('gap', '5px', 'important');
        landscapeContent.style.setProperty('align-items', 'stretch', 'important');
        landscapeContent.style.setProperty('justify-content', 'flex-start', 'important');
        landscapeContent.style.setProperty('box-sizing', 'border-box', 'important');
        landscapeContent.style.setProperty('z-index', '20', 'important');
        landscapeContent.style.setProperty('background', 'transparent', 'important');
        landscapeContent.style.setProperty('border', '2px solid orange', 'important'); // DEBUG
        landscapeContent.style.setProperty('overflow', 'hidden', 'important');
        landscapeContent.style.setProperty('padding', '0', 'important');
        landscapeContent.style.setProperty('margin', '0', 'important');
        
        console.log('🎯 LANDSCAPE CONTENT: FORCED to exact screen positions');
        
        // Verify the actual computed position
        setTimeout(() => {
          const rect = landscapeContent.getBoundingClientRect();
          console.log('🎯 ACTUAL ORANGE POSITION:', {
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
          });
          console.log('🎯 EDGE VERIFICATION: Right edge at ' + rect.right + 'px (target: ' + (viewportWidth - 5) + 'px)');
          console.log('🎯 BOTTOM VERIFICATION: Bottom edge at ' + rect.bottom + 'px (target: ' + (viewportHeight - 20) + 'px)');
        }, 100);
      }
      
      // Step 8: Configure columns with improved scaling
      const columnGap = 5;
      const totalGaps = 2 * columnGap;
      const availableColumnWidth = orangeBorder.width - totalGaps;
      const columnWidth = Math.floor(availableColumnWidth / 3);
      
      const columns = [
        { element: document.querySelector('.landscape-column-1') as HTMLElement, name: 'COLUMN 1', needsScaling: true },
        { element: document.querySelector('.landscape-column-2') as HTMLElement, name: 'COLUMN 2', needsScaling: false },
        { element: document.querySelector('.landscape-column-3') as HTMLElement, name: 'COLUMN 3', needsScaling: false }
      ];
      
      columns.forEach(({ element: column, name, needsScaling }, index) => {
        if (!column) return;
        
        column.style.setProperty('width', `${columnWidth}px`, 'important');
        column.style.setProperty('height', `${orangeBorder.height}px`, 'important');
        column.style.setProperty('max-height', `${orangeBorder.height}px`, 'important');
        column.style.setProperty('display', 'flex', 'important');
        column.style.setProperty('flex-direction', 'column', 'important');
        column.style.setProperty('gap', needsScaling ? '3px' : '5px', 'important'); // Tighter gap for Column 1
        column.style.setProperty('justify-content', index === 1 ? 'flex-start' : 'flex-start', 'important');
        column.style.setProperty('align-items', 'stretch', 'important');
        column.style.setProperty('overflow', 'hidden', 'important');
        column.style.setProperty('background', 'transparent', 'important');
        column.style.setProperty('padding', needsScaling ? '3px' : '5px', 'important'); // Tighter padding for Column 1
        column.style.setProperty('box-sizing', 'border-box', 'important');
        column.style.setProperty('margin', '0', 'important');
        
        console.log(`🎯 ${name}: Configured and constrained`);
      });
      
      // Step 9: OPTIMIZE SCRATCHPAD in Column 3 - RESTORE GAPS BUT PREVENT EXPANSION
      const column3 = document.querySelector('.landscape-column-3') as HTMLElement;
      if (column3) {
        // RESTORE gaps between scratchpad and hint purchasing (was 0px, now 8px)
        column3.style.setProperty('gap', '8px', 'important');
        
        // Target the actual scratchpad component
        const scratchpadComponent = column3.querySelector('.scratchpad') as HTMLElement;
        if (scratchpadComponent) {
          // Expand the scratchpad to fill available space but not beyond
          scratchpadComponent.style.setProperty('flex', '1', 'important');
          scratchpadComponent.style.setProperty('margin', '0', 'important');
          scratchpadComponent.style.setProperty('padding', '5px', 'important');
          scratchpadComponent.style.setProperty('min-height', '0', 'important'); // Allow shrinking
          scratchpadComponent.style.setProperty('max-height', 'none', 'important'); // But don't force max
          
          // Target the numbers container (the white area) - FIX over-expansion
          const numbersContainer = scratchpadComponent.querySelector('.numbers-container') as HTMLElement;
          if (numbersContainer) {
            numbersContainer.style.setProperty('background', 'white', 'important');
            numbersContainer.style.setProperty('border-radius', '8px', 'important');
            numbersContainer.style.setProperty('padding', '8px', 'important'); // Reduced from 10px
            numbersContainer.style.setProperty('margin', '3px', 'important'); // Reduced from 5px
            numbersContainer.style.setProperty('height', 'auto', 'important'); // Let it size naturally
            numbersContainer.style.setProperty('max-height', 'calc(100% - 6px)', 'important'); // Prevent overflow
            numbersContainer.style.setProperty('overflow', 'auto', 'important');
          }
          
          // Target the numbers grid for auto-arrangement
          const numbersGrid = scratchpadComponent.querySelector('.numbers-grid') as HTMLElement;
          if (numbersGrid) {
            numbersGrid.style.setProperty('display', 'grid', 'important');
            numbersGrid.style.setProperty('grid-template-columns', 'repeat(auto-fit, minmax(35px, 1fr))', 'important'); // Auto-arrange
            numbersGrid.style.setProperty('grid-gap', '4px', 'important'); // Tight spacing
            numbersGrid.style.setProperty('align-content', 'start', 'important');
            numbersGrid.style.setProperty('justify-content', 'start', 'important');
            numbersGrid.style.setProperty('height', 'auto', 'important'); // Natural height
          }
          
          // Optimize all number boxes
          const numberBoxes = scratchpadComponent.querySelectorAll('.scratchpad-number');
          numberBoxes.forEach(box => {
            const boxEl = box as HTMLElement;
            boxEl.style.setProperty('margin', '0', 'important');
            boxEl.style.setProperty('padding', '6px', 'important');
            boxEl.style.setProperty('font-size', '0.9rem', 'important');
            boxEl.style.setProperty('line-height', '1.0', 'important');
            boxEl.style.setProperty('min-height', '32px', 'important');
            boxEl.style.setProperty('width', '100%', 'important');
          });
        }
        
        // Optimize hint purchasing to take fixed space (not expanding)
        const hintPurchasing = column3.querySelector('.hint-purchasing') as HTMLElement;
        if (hintPurchasing) {
          hintPurchasing.style.setProperty('flex', '0 0 auto', 'important'); // Fixed size
          hintPurchasing.style.setProperty('margin', '0', 'important');
          hintPurchasing.style.setProperty('padding', '5px', 'important');
          hintPurchasing.style.setProperty('max-height', '120px', 'important'); // Limit height
        }
        
        // Optimize score area to take minimal space
        const scoreArea = column3.querySelector('.score-area') as HTMLElement;
        if (scoreArea) {
          scoreArea.style.setProperty('flex', '0 0 auto', 'important'); // Fixed size
          scoreArea.style.setProperty('margin', '0', 'important');
          scoreArea.style.setProperty('padding', '5px', 'important');
          scoreArea.style.setProperty('max-height', '80px', 'important'); // Limit height
        }
        
        console.log('🎯 SCRATCHPAD: Optimized with controlled white area, restored gaps, fixed expansion');
      }
      
      // Step 10: IMPROVED SCALING for Column 1 to prevent clipping
      setTimeout(() => {
        const column1 = document.querySelector('.landscape-column-1') as HTMLElement;
        if (column1) {
          const availableHeight = orangeBorder.height - 6; // Account for padding
          let totalContentHeight = 0;
          const children = Array.from(column1.children) as HTMLElement[];
          
          // Force layout calculation
          children.forEach(child => {
            child.style.transform = 'none';
            child.style.marginBottom = '0';
          });
          
          // Wait for layout to settle
          setTimeout(() => {
            children.forEach(child => {
              totalContentHeight += child.offsetHeight;
            });
            totalContentHeight += (children.length - 1) * 3; // Account for gaps
            
            if (totalContentHeight > availableHeight) {
              const scale = Math.max(0.7, availableHeight / totalContentHeight); // Minimum 70% scale
              console.log(`🎯 COLUMN 1 SCALING: ${scale.toFixed(3)} (content: ${totalContentHeight}px, available: ${availableHeight}px)`);
              
              children.forEach((child, index) => {
                child.style.setProperty('transform', `scale(${scale})`, 'important');
                child.style.setProperty('transform-origin', 'top center', 'important');
                // Adjust margins to compensate for scaling
                const marginAdjustment = (1 - scale) * -child.offsetHeight * 0.5;
                if (index < children.length - 1) {
                  child.style.setProperty('margin-bottom', `${marginAdjustment}px`, 'important');
                }
              });
            } else {
              console.log(`🎯 COLUMN 1: No scaling needed (content: ${totalContentHeight}px, available: ${availableHeight}px)`);
            }
          }, 50);
        }
      }, 300);
    }, 100);
    
    // Add FORCED RED BORDER debug visualization
    const landscapeContainer = document.querySelector('.landscape-container') as HTMLElement;
    if (landscapeContainer) {
      let redBorderDiv = document.querySelector('.red-border-debug') as HTMLElement;
      if (!redBorderDiv) {
        redBorderDiv = document.createElement('div');
        redBorderDiv.className = 'red-border-debug';
        landscapeContainer.appendChild(redBorderDiv);
      }
      redBorderDiv.style.setProperty('position', 'fixed', 'important');
      redBorderDiv.style.setProperty('top', `${redBorder.top}px`, 'important');
      redBorderDiv.style.setProperty('left', `${redBorder.left}px`, 'important');
      redBorderDiv.style.setProperty('width', `${redBorder.width}px`, 'important');
      redBorderDiv.style.setProperty('height', `${redBorder.height}px`, 'important');
      redBorderDiv.style.setProperty('border', '2px solid red', 'important');
      redBorderDiv.style.setProperty('background', 'transparent', 'important');
      redBorderDiv.style.setProperty('pointer-events', 'none', 'important');
      redBorderDiv.style.setProperty('z-index', '5', 'important');
      redBorderDiv.style.setProperty('box-sizing', 'border-box', 'important');
      
      console.log('🎯 RED BORDER DEBUG: FORCED to exact screen edges');
    }
    
    // Hide old container
    const container = document.querySelector('.container') as HTMLElement;
    if (container) {
      container.style.display = 'none';
      console.log('🎯 OLD CONTAINER: Hidden');
    }
    
    console.log('🎯 ========= LANDSCAPE LAYOUT BUILD 660 COMPLETE ========= 🎯');
  }, []);

  // Cleanup function to reset landscape styles when switching orientations
  useEffect(() => {
    return () => {
      console.log('🎯 LANDSCAPE CLEANUP: Resetting landscape-specific styles');
      
      // Reset landscape-specific styles when component unmounts (orientation change)
      const elementsToCleanup = [
        '.title-section',
        '.landscape-content',
        '.landscape-submit-button',
        '.red-border-debug',
        '.container'
      ];
      
      elementsToCleanup.forEach(selector => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          element.style.removeProperty('position');
          element.style.removeProperty('top');
          element.style.removeProperty('left');
          element.style.removeProperty('width');
          element.style.removeProperty('height');
          element.style.removeProperty('z-index');
          element.style.removeProperty('display');
        }
      });
      
      // Show portrait container if it exists
      const portraitContainer = document.querySelector('.orange-portrait-container') as HTMLElement;
      if (portraitContainer) {
        portraitContainer.style.removeProperty('display');
      }
    };
  }, []);

  return (
    <div 
      ref={landscapeRef}
      className="landscape-container" 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        background: 'transparent',
        pointerEvents: 'none',
        padding: '0',
        margin: '0',
        boxSizing: 'border-box'
      }}
    >
      {/* Submit Button - Overlaid above orange border */}
      <div className="landscape-submit-button" style={{
        pointerEvents: 'auto',
        padding: '0',
        margin: '0',
        boxSizing: 'border-box'
      }}>
        <CircularSubmitButton />
      </div>
      
      <div className="landscape-content" style={{
        pointerEvents: 'auto',
        padding: '0',
        margin: '0',
        boxSizing: 'border-box'
      }}>
        {/* Column 1: Target Display + Guess Area + Number Selection */}
        <div className="landscape-column-1">
          <TargetDisplay />
          <div className="guess-section" ref={guessElementRef} style={{ position: 'relative' }}>
            <GuessArea />
          </div>
          <div className="selection-section">
            <SelectionArea />
          </div>
        </div>
        
        {/* Column 2: Recent Guesses */}
        <div className="landscape-column-2">
          <RecentGuessHistory />
        </div>
        
        {/* Column 3: Menu drawer content */}
        <div className="landscape-column-3">
          <div className="side-panel-section">
            <Scratchpad />
          </div>
          <div className="side-panel-section">
            <HintPurchasing />
          </div>
          <div className="side-panel-section">
            <ScoreArea />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandscapeLayout; 