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
      
      // ORANGE BORDER: Simple positioning without submit button interference
      const orangeBorder = {
        top: subtitleBottom + 20, // Simple 20px gap below subtitle
        left: redBorder.left, // EXACTLY 5px from left screen edge
        width: redBorder.width, // EXACTLY same width as red border
        height: redBorder.bottom - (subtitleBottom + 20), // Full remaining height
        right: redBorder.right, // EXACTLY 5px from right screen edge
        bottom: redBorder.bottom // EXACTLY 20px from bottom screen edge
      };
      
      console.log('🎯 FORCED ORANGE BORDER (NO SUBMIT SPACE):', orangeBorder);
      console.log('🎯 ORANGE RIGHT EDGE: ' + orangeBorder.right + ' (should be ' + (viewportWidth - 5) + ')');
      console.log('🎯 ORANGE BOTTOM EDGE: ' + orangeBorder.bottom + ' (should be ' + (viewportHeight - 20) + ')');
      
      // Step 6: POSITION submit button COMPLETELY INDEPENDENTLY - floating above Column 1
      const submitButton = document.querySelector('.landscape-submit-button') as HTMLElement;
      if (submitButton) {
        const columnGap = 5;
        const totalGaps = 2 * columnGap;
        const availableColumnWidth = orangeBorder.width - totalGaps;
        const columnWidth = Math.floor(availableColumnWidth / 3);
        
        // Position button ABOVE the orange border content, floating independently
        const submitTop = orangeBorder.top + 15; // 15px inside the orange border area
        const submitLeft = orangeBorder.left + (columnWidth / 2) - 38; // Center over Column 1 (76px button width)
        
        // REMOVE the button from any container constraints
        submitButton.style.setProperty('position', 'fixed', 'important');
        submitButton.style.setProperty('top', `${submitTop}px`, 'important');
        submitButton.style.setProperty('left', `${submitLeft}px`, 'important');
        submitButton.style.setProperty('width', '76px', 'important');
        submitButton.style.setProperty('height', '76px', 'important');
        submitButton.style.setProperty('z-index', '200', 'important'); // Higher z-index
        submitButton.style.setProperty('pointer-events', 'auto', 'important');
        submitButton.style.setProperty('margin', '0', 'important');
        submitButton.style.setProperty('padding', '0', 'important');
        
        console.log(`🎯 SUBMIT BUTTON: Floating independently at (${submitLeft}, ${submitTop}) above Column 1`);
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
        // landscapeContent.style.setProperty('border', '2px solid orange', 'important'); // DEBUG - REMOVED
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
        column.style.setProperty('justify-content', 'flex-start', 'important');
        column.style.setProperty('align-items', 'stretch', 'important');
        column.style.setProperty('overflow', 'hidden', 'important');
        column.style.setProperty('background', 'transparent', 'important');
        
        // Special padding for Column 1 to account for submit button
        if (index === 0) {
          column.style.setProperty('padding', '90px 3px 3px 3px', 'important'); // 90px top padding for submit button
        } else {
          column.style.setProperty('padding', needsScaling ? '3px' : '5px', 'important');
        }
        
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
          
          // FORCE the numbers grid to be perfectly centered with FLEXBOX - TRUE CENTERING OF PARTIAL ROWS
          const numbersGrid = scratchpadComponent.querySelector('.numbers-grid') as HTMLElement;
          if (numbersGrid) {
            numbersGrid.style.setProperty('display', 'flex', 'important');
            numbersGrid.style.setProperty('flex-wrap', 'wrap', 'important');
            numbersGrid.style.setProperty('justify-content', 'center', 'important'); // TRUE centering including partial rows
            numbersGrid.style.setProperty('align-items', 'center', 'important');
            numbersGrid.style.setProperty('align-content', 'center', 'important');
            numbersGrid.style.setProperty('gap', '6px', 'important'); // Slightly smaller gap for landscape
            numbersGrid.style.setProperty('width', '100%', 'important');
            numbersGrid.style.setProperty('max-width', '300px', 'important'); // Smaller max width for landscape
            numbersGrid.style.setProperty('margin', '0 auto', 'important'); // FORCE center
            numbersGrid.style.setProperty('padding', '0', 'important');
            numbersGrid.style.setProperty('text-align', 'center', 'important');
            
            console.log('🎯 SCRATCHPAD GRID: Using flexbox wrap with TRUE centering of partial rows (landscape)');
          }
          
          // FORCE all number boxes to be FIXED SIZE SQUARES for flexbox layout
          const numberBoxes = scratchpadComponent.querySelectorAll('.scratchpad-number');
          numberBoxes.forEach(box => {
            const boxEl = box as HTMLElement;
            // Fixed size squares for landscape (smaller than portrait)
            boxEl.style.setProperty('width', '40px', 'important'); // Smaller for landscape
            boxEl.style.setProperty('height', '40px', 'important'); // Perfect square
            boxEl.style.setProperty('min-width', '40px', 'important');
            boxEl.style.setProperty('max-width', '40px', 'important');
            boxEl.style.setProperty('margin', '0', 'important');
            boxEl.style.setProperty('display', 'flex', 'important');
            boxEl.style.setProperty('align-items', 'center', 'important');
            boxEl.style.setProperty('justify-content', 'center', 'important');
            boxEl.style.setProperty('text-align', 'center', 'important');
            boxEl.style.setProperty('font-size', '0.9rem', 'important'); // Fixed font size
            boxEl.style.setProperty('font-weight', 'bold', 'important');
            boxEl.style.setProperty('line-height', '1', 'important');
            boxEl.style.setProperty('border-radius', '6px', 'important');
            boxEl.style.setProperty('border', '2px solid #d1d5db', 'important');
            boxEl.style.setProperty('background', 'white', 'important');
            boxEl.style.setProperty('box-sizing', 'border-box', 'important');
            boxEl.style.setProperty('flex-shrink', '0', 'important'); // Don't shrink in flexbox
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
        
        // AGGRESSIVELY RESTORE score area styling - FORCE white background
        const scoreArea = column3.querySelector('.score-area') as HTMLElement;
        if (scoreArea) {
          // Force the score area to have its original styling
          scoreArea.style.setProperty('flex', '0 0 auto', 'important');
          scoreArea.style.setProperty('margin', '0', 'important');
          scoreArea.style.setProperty('padding', '16px', 'important'); // Original padding
          scoreArea.style.setProperty('max-height', '200px', 'important'); // More space
          scoreArea.style.setProperty('background', 'linear-gradient(135deg, #f8fafc, #e2e8f0)', 'important');
          scoreArea.style.setProperty('border-radius', '12px', 'important');
          scoreArea.style.setProperty('border', '1px solid #e2e8f0', 'important');
          scoreArea.style.setProperty('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.1)', 'important');
          scoreArea.style.setProperty('overflow', 'visible', 'important');
          
          // FORCE the current score section to have blue background
          const currentScore = scoreArea.querySelector('.current-score') as HTMLElement;
          if (currentScore) {
            currentScore.style.setProperty('background', 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 'important');
            currentScore.style.setProperty('color', 'white', 'important');
            currentScore.style.setProperty('border-radius', '8px', 'important');
            currentScore.style.setProperty('padding', '12px', 'important');
            currentScore.style.setProperty('margin-bottom', '16px', 'important');
          }
          
          // FORCE ALL score area sub-elements to have proper backgrounds
          const scoreStats = scoreArea.querySelector('.score-stats') as HTMLElement;
          if (scoreStats) {
            scoreStats.style.setProperty('background', 'rgba(255, 255, 255, 0.9)', 'important');
            scoreStats.style.setProperty('border-radius', '6px', 'important');
            scoreStats.style.setProperty('border', '1px solid #e5e7eb', 'important');
            scoreStats.style.setProperty('padding', '10px', 'important');
          }
          
          // FORCE all stat items to have proper backgrounds
          const statItems = scoreArea.querySelectorAll('.stat-item');
          statItems.forEach(item => {
            const itemEl = item as HTMLElement;
            itemEl.style.setProperty('background', 'transparent', 'important');
            itemEl.style.setProperty('border-bottom', '1px solid #f1f5f9', 'important');
          });
          
          // FORCE score breakdown to have proper background
          const scoreBreakdown = scoreArea.querySelector('.score-breakdown') as HTMLElement;
          if (scoreBreakdown) {
            scoreBreakdown.style.setProperty('background', 'rgba(255, 255, 255, 0.8)', 'important');
            scoreBreakdown.style.setProperty('border-radius', '6px', 'important');
            scoreBreakdown.style.setProperty('padding', '8px', 'important');
            scoreBreakdown.style.setProperty('margin-bottom', '12px', 'important');
            scoreBreakdown.style.setProperty('border', '1px solid #e5e7eb', 'important');
          }
          
          // FORCE ALL score item elements to have white backgrounds
          const scoreItems = scoreArea.querySelectorAll('.score-item');
          scoreItems.forEach(item => {
            const itemEl = item as HTMLElement;
            itemEl.style.setProperty('background', 'rgba(255, 255, 255, 0.9)', 'important');
            itemEl.style.setProperty('border-bottom', '1px solid #f1f5f9', 'important');
            itemEl.style.setProperty('padding', '6px 8px', 'important');
            itemEl.style.setProperty('margin-bottom', '2px', 'important');
            itemEl.style.setProperty('border-radius', '4px', 'important');
          });
          
          console.log('🎯 SCORE AREA: Aggressively restored all original styling');
        }
        
        console.log('🎯 SCRATCHPAD: Optimized with controlled white area, restored gaps, fixed expansion');
      }
      
      // Step 10: PROPORTIONAL SPACE ALLOCATION for Column 1 - Keep box sizes consistent, allocate space by ratio
      setTimeout(() => {
        const column1 = document.querySelector('.landscape-column-1') as HTMLElement;
        if (column1) {
          const availableHeight = orangeBorder.height - 90 - 6; // Account for submit button (90px) and padding (6px)
          
          // Detect grid mode
          let gridRows = 1, gridColumns = 3;
          const guessGrid = document.querySelector('.guess-grid') as HTMLElement;
          if (guessGrid) {
            gridRows = parseInt(guessGrid.style.getPropertyValue('--grid-rows') || '1');
            gridColumns = parseInt(guessGrid.style.getPropertyValue('--grid-columns') || '3');
          }
          const gridMode = `${gridRows}x${gridColumns}`;
          const totalGuessBoxes = gridRows * gridColumns;
          
          console.log(`🎯 DETECTED GRID MODE: ${gridMode} (${totalGuessBoxes} guess boxes)`);
          
          // Calculate proportional space allocation - GIVE MORE SPACE TO NUMBER SELECTION
          // Target Display: Fixed small space (about 1 box equivalent)
          // Your Guess: Based on number of guess boxes
          // Number Selection: INCREASED allocation to prevent bottom boundary issues
          const targetDisplayRatio = 1; // Fixed small space
          const yourGuessRatio = totalGuessBoxes; // Proportional to number of guess boxes
          const numberSelectionRatio = Math.max(4, Math.ceil((parseInt(document.querySelector('.selection-area')?.getAttribute('data-digit-range') || '17')) / 4)); // Minimum 4 units, estimate 4 per row
          
          const totalRatio = targetDisplayRatio + yourGuessRatio + numberSelectionRatio;
          
          console.log(`🎯 SPACE ALLOCATION RATIOS: Target=${targetDisplayRatio}, Guess=${yourGuessRatio}, Selection=${numberSelectionRatio}, Total=${totalRatio}`);
          
          // Allocate heights proportionally
          const targetHeight = Math.floor((targetDisplayRatio / totalRatio) * availableHeight);
          const guessHeight = Math.floor((yourGuessRatio / totalRatio) * availableHeight);
          const selectionHeight = Math.floor((numberSelectionRatio / totalRatio) * availableHeight);
          
          console.log(`🎯 ALLOCATED HEIGHTS: Target=${targetHeight}px, Guess=${guessHeight}px, Selection=${selectionHeight}px, Total=${targetHeight + guessHeight + selectionHeight}px`);
          
          // Apply height constraints to each section
          const targetDisplay = column1.querySelector('.target-display') as HTMLElement;
          const guessSection = column1.querySelector('.guess-section') as HTMLElement;
          const selectionSection = column1.querySelector('.selection-section') as HTMLElement;
          
          if (targetDisplay) {
            targetDisplay.style.setProperty('height', `${targetHeight}px`, 'important');
            targetDisplay.style.setProperty('max-height', `${targetHeight}px`, 'important');
            targetDisplay.style.setProperty('overflow', 'hidden', 'important');
            targetDisplay.style.setProperty('display', 'flex', 'important');
            targetDisplay.style.setProperty('flex-direction', 'column', 'important');
            targetDisplay.style.setProperty('justify-content', 'center', 'important');
            console.log(`🎯 TARGET DISPLAY: Constrained to ${targetHeight}px`);
          }
          
          if (guessSection) {
            guessSection.style.setProperty('height', `${guessHeight}px`, 'important');
            guessSection.style.setProperty('max-height', `${guessHeight}px`, 'important');
            guessSection.style.setProperty('overflow', 'hidden', 'important');
            guessSection.style.setProperty('display', 'flex', 'important');
            guessSection.style.setProperty('flex-direction', 'column', 'important');
            guessSection.style.setProperty('justify-content', 'center', 'important');
            console.log(`🎯 GUESS SECTION: Constrained to ${guessHeight}px`);
          }
          
          if (selectionSection) {
            selectionSection.style.setProperty('height', `${selectionHeight}px`, 'important');
            selectionSection.style.setProperty('max-height', `${selectionHeight}px`, 'important');
            selectionSection.style.setProperty('overflow', 'hidden', 'important');
            selectionSection.style.setProperty('display', 'flex', 'important');
            selectionSection.style.setProperty('flex-direction', 'column', 'important');
            selectionSection.style.setProperty('justify-content', 'center', 'important');
            selectionSection.style.setProperty('padding-bottom', '10px', 'important'); // FORCE bottom margin
            selectionSection.style.setProperty('box-sizing', 'border-box', 'important');
            console.log(`🎯 SELECTION SECTION: Constrained to ${selectionHeight}px with bottom padding`);
          }
          
          // Wait for layout to settle, then check if content fits and scale if needed
          setTimeout(() => {
            const sections = [
              { element: targetDisplay, name: 'Target Display', allocatedHeight: targetHeight },
              { element: guessSection, name: 'Guess Section', allocatedHeight: guessHeight },
              { element: selectionSection, name: 'Selection Section', allocatedHeight: selectionHeight }
            ];
            
            sections.forEach(({ element, name, allocatedHeight }) => {
              if (!element) return;
              
              // Check if content overflows allocated space
              const contentHeight = element.scrollHeight;
              const needsScaling = contentHeight > allocatedHeight;
              
              console.log(`🎯 ${name.toUpperCase()}: content=${contentHeight}px, allocated=${allocatedHeight}px, needs scaling=${needsScaling}`);
              
              if (needsScaling) {
                // Scale content within the element to fit - MORE FLEXIBLE SCALING
                const scale = allocatedHeight / contentHeight;
                const clampedScale = Math.max(0.55, scale); // Minimum 55% scale - more flexible
                
                console.log(`🎯 ${name.toUpperCase()}: Scaling content to ${clampedScale.toFixed(3)} (${(clampedScale * 100).toFixed(1)}%)`);
                
                // Apply scaling to the content within the element with CENTERED transform origin
                const contentWrapper = element.querySelector('.guess-area, .selection-area, .target-display') as HTMLElement;
                if (contentWrapper) {
                  contentWrapper.style.setProperty('transform', `scale(${clampedScale})`, 'important');
                  contentWrapper.style.setProperty('transform-origin', 'center center', 'important'); // CENTER the scaling
                  contentWrapper.style.setProperty('width', `${100 / clampedScale}%`, 'important'); // Compensate for scaling
                  contentWrapper.style.setProperty('height', `${100 / clampedScale}%`, 'important'); // Compensate for scaling
                  
                  // Add margin compensation for centered scaling
                  const marginOffset = (allocatedHeight * (1 - clampedScale)) / 2;
                  contentWrapper.style.setProperty('margin-top', `${marginOffset}px`, 'important');
                  contentWrapper.style.setProperty('margin-bottom', `${marginOffset}px`, 'important');
                } else {
                  // If no wrapper, scale the element itself
                  element.style.setProperty('transform', `scale(${clampedScale})`, 'important');
                  element.style.setProperty('transform-origin', 'center center', 'important'); // CENTER the scaling
                }
                
                // Reduce padding for heavily scaled content
                if (clampedScale < 0.7) {
                  const paddedElements = element.querySelectorAll('[style*="padding"], .guess-area, .selection-area, .target-display');
                  paddedElements.forEach(el => {
                    const paddedEl = el as HTMLElement;
                    paddedEl.style.setProperty('padding', '4px', 'important');
                    paddedEl.style.setProperty('margin', '2px 0', 'important');
                  });
                }
            } else {
                console.log(`🎯 ${name.toUpperCase()}: No scaling needed`);
            }
            });
          }, 100);
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

  // Comprehensive cleanup function to reset landscape styles when switching orientations
  useEffect(() => {
    return () => {
      console.log('🎯 LANDSCAPE CLEANUP: Comprehensive reset of landscape-specific styles');
      
      // Reset ALL landscape-specific styles when component unmounts (orientation change)
      const elementsToCleanup = [
        { selector: '.title-section', properties: ['position', 'top', 'left', 'width', 'height', 'z-index', 'text-align', 'margin', 'transform', 'transform-origin'] },
        { selector: '.landscape-content', properties: ['position', 'top', 'left', 'width', 'height', 'z-index', 'display', 'flex-direction', 'gap', 'align-items', 'justify-content', 'box-sizing', 'background', 'border', 'overflow', 'padding', 'margin'] },
        { selector: '.landscape-submit-button', properties: ['position', 'top', 'left', 'width', 'height', 'z-index', 'pointer-events', 'margin', 'padding'] },
        { selector: '.red-border-debug', properties: ['position', 'top', 'left', 'width', 'height', 'border', 'background', 'pointer-events', 'z-index', 'box-sizing'] },
        { selector: '.container', properties: ['display', 'transform', 'transform-origin', 'margin-left', 'margin-top', 'margin-right', 'margin-bottom', 'position'] },
        { selector: '.game-screen', properties: ['padding', 'margin', 'box-sizing', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'transform', 'transform-origin'] },
        { selector: 'body', properties: ['padding', 'margin', 'box-sizing', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'transform', 'transform-origin'] },
        { selector: 'html', properties: ['padding', 'margin', 'box-sizing', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'transform', 'transform-origin'] },
        { selector: '#root', properties: ['padding', 'margin', 'box-sizing', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'transform', 'transform-origin'] },
        { selector: '.app', properties: ['padding', 'margin', 'box-sizing', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'transform', 'transform-origin'] }
      ];
      
      elementsToCleanup.forEach(({ selector, properties }) => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          properties.forEach(property => {
            element.style.removeProperty(property);
          });
        }
      });
      
      // Show portrait container if it exists
      const portraitContainer = document.querySelector('.orange-portrait-container') as HTMLElement;
      if (portraitContainer) {
        portraitContainer.style.removeProperty('display');
      }
      
      // Remove the red border debug element completely
      const redBorderDebug = document.querySelector('.red-border-debug');
      if (redBorderDebug) {
        redBorderDebug.remove();
      }
      
      console.log('🎯 LANDSCAPE CLEANUP: All landscape styles reset, ready for portrait mode');
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
      
      {/* Submit Button - Completely independent, floating above everything */}
      <div className="landscape-submit-button" style={{
        position: 'absolute',
        top: '0',
        left: '0',
        pointerEvents: 'auto',
        zIndex: 200,
        padding: '0',
        margin: '0',
        boxSizing: 'border-box'
      }}>
        <CircularSubmitButton />
      </div>
    </div>
  );
};

export default LandscapeLayout; 