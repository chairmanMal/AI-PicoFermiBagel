import React, { useEffect, useRef } from 'react';
import TargetDisplay from './TargetDisplay';
import GuessArea from './GuessArea';
import SelectionArea from './SelectionArea';
import RecentGuessHistory from './RecentGuessHistory';
import Scratchpad from './Scratchpad';
import HintPurchasing from './HintPurchasing';
import ScoreArea from './ScoreArea';

interface LandscapeLayoutProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
}

const LandscapeLayout: React.FC<LandscapeLayoutProps> = ({ guessElementRef }) => {
  const landscapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🎯 ========= DISABLE AUTOSCALING + FORCE EDGES (BUILD 655) ========= 🎯');
    console.log('🎯 VIEWPORT:', `${window.innerWidth}x${window.innerHeight}`);
    
    // Step 1: AGGRESSIVELY remove ALL padding/margins that could interfere
    const elementsToReset = [
      document.querySelector('.game-screen'),
      document.querySelector('body'),
      document.querySelector('html'),
      document.querySelector('#root'),
      document.querySelector('.app'),
      document.querySelector('.landscape-container')
    ];
    
    elementsToReset.forEach(element => {
      if (element) {
        const el = element as HTMLElement;
        el.style.setProperty('padding', '0', 'important');
        el.style.setProperty('margin', '0', 'important');
        el.style.setProperty('box-sizing', 'border-box', 'important');
      }
    });
    
    console.log('🎯 ALL INTERFERING ELEMENTS: Padding/margin forcibly removed');
    
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
    
    // Step 5: Calculate and FORCE orange border positioning
    setTimeout(() => {
      if (!titleSection) return;
      
      const subtitle = titleSection.querySelector('.game-subtitle') as HTMLElement;
      if (!subtitle) return;
      
      const subtitleRect = subtitle.getBoundingClientRect();
      const subtitleBottom = subtitleRect.bottom;
      
      // ORANGE BORDER: MUST match red border edges EXACTLY
      const orangeBorder = {
        top: subtitleBottom + 15,
        left: redBorder.left, // EXACTLY 5px from left screen edge
        width: redBorder.width, // EXACTLY same width as red border
        height: redBorder.bottom - (subtitleBottom + 15),
        right: redBorder.right, // EXACTLY 5px from right screen edge
        bottom: redBorder.bottom // EXACTLY 20px from bottom screen edge
      };
      
      console.log('🎯 FORCED ORANGE BORDER:', orangeBorder);
      console.log('🎯 ORANGE RIGHT EDGE: ' + orangeBorder.right + ' (should be ' + (viewportWidth - 5) + ')');
      console.log('🎯 ORANGE BOTTOM EDGE: ' + orangeBorder.bottom + ' (should be ' + (viewportHeight - 20) + ')');
      
      // Step 6: FORCE landscape content container to exact positions
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
      
      // Step 7: Configure columns with optimized scratchpad
      const columnGap = 5;
      const totalGaps = 2 * columnGap;
      const availableColumnWidth = orangeBorder.width - totalGaps;
      const columnWidth = Math.floor(availableColumnWidth / 3);
      
      const columns = [
        { element: document.querySelector('.landscape-column-1') as HTMLElement, name: 'COLUMN 1' },
        { element: document.querySelector('.landscape-column-2') as HTMLElement, name: 'COLUMN 2' },
        { element: document.querySelector('.landscape-column-3') as HTMLElement, name: 'COLUMN 3' }
      ];
      
      columns.forEach(({ element: column, name }, index) => {
        if (!column) return;
        
        column.style.setProperty('width', `${columnWidth}px`, 'important');
        column.style.setProperty('height', `${orangeBorder.height}px`, 'important');
        column.style.setProperty('max-height', `${orangeBorder.height}px`, 'important');
        column.style.setProperty('display', 'flex', 'important');
        column.style.setProperty('flex-direction', 'column', 'important');
        column.style.setProperty('gap', '5px', 'important');
        column.style.setProperty('justify-content', index === 1 ? 'center' : 'flex-start', 'important');
        column.style.setProperty('align-items', 'stretch', 'important');
        column.style.setProperty('overflow', 'hidden', 'important');
        column.style.setProperty('background', 'transparent', 'important');
        column.style.setProperty('padding', '5px', 'important');
        column.style.setProperty('box-sizing', 'border-box', 'important');
        column.style.setProperty('margin', '0', 'important');
        
        console.log(`🎯 ${name}: Configured and constrained`);
      });
      
      // Step 8: OPTIMIZE SCRATCHPAD in Column 3
      const column3 = document.querySelector('.landscape-column-3') as HTMLElement;
      if (column3) {
        // Optimize scratchpad layout
        const scratchpad = column3.querySelector('.scratchpad') as HTMLElement;
        if (scratchpad) {
          // Reduce vertical spacing
          scratchpad.style.setProperty('line-height', '1.0', 'important');
          scratchpad.style.setProperty('gap', '2px', 'important');
        }
        
        // Expand white area and optimize layout
        const scratchpadGrid = column3.querySelector('.scratchpad-grid') as HTMLElement;
        if (scratchpadGrid) {
          scratchpadGrid.style.setProperty('margin', '5px', 'important');
          scratchpadGrid.style.setProperty('padding', '10px', 'important'); // Expand to within 10px of pink area
          scratchpadGrid.style.setProperty('width', 'calc(100% - 10px)', 'important'); // Expand to within 10px of sides
          scratchpadGrid.style.setProperty('height', 'auto', 'important');
          scratchpadGrid.style.setProperty('display', 'grid', 'important');
          scratchpadGrid.style.setProperty('grid-template-columns', 'repeat(auto-fit, minmax(40px, 1fr))', 'important'); // Auto-arrange boxes
          scratchpadGrid.style.setProperty('grid-gap', '3px', 'important'); // Tight spacing
          scratchpadGrid.style.setProperty('align-content', 'start', 'important');
          scratchpadGrid.style.setProperty('line-height', '1.0', 'important'); // Reduce line spacing
        }
        
        // Optimize scratchpad content
        const scratchpadContent = column3.querySelector('.scratchpad-content') as HTMLElement;
        if (scratchpadContent) {
          scratchpadContent.style.setProperty('line-height', '1.0', 'important'); // Tight line spacing
          scratchpadContent.style.setProperty('font-size', '0.8em', 'important'); // Smaller font
          scratchpadContent.style.setProperty('margin', '0', 'important');
          scratchpadContent.style.setProperty('padding', '0', 'important');
        }
        
        // Optimize all number boxes in scratchpad
        const numberBoxes = column3.querySelectorAll('.scratchpad-number');
        numberBoxes.forEach(box => {
          const boxEl = box as HTMLElement;
          boxEl.style.setProperty('margin', '1px', 'important'); // Minimal margins
          boxEl.style.setProperty('padding', '4px', 'important'); // Compact padding
          boxEl.style.setProperty('line-height', '1.0', 'important'); // Tight line height
        });
        
        console.log('🎯 SCRATCHPAD: Optimized with expanded white area and tight spacing');
      }
      
      // Dynamic scaling for content that doesn't fit
      setTimeout(() => {
        columns.forEach(({ element: column, name }) => {
          if (!column) return;
          
          const availableHeight = orangeBorder.height - 10;
          let totalContentHeight = 0;
          const children = Array.from(column.children) as HTMLElement[];
          
          children.forEach(child => {
            totalContentHeight += child.offsetHeight;
          });
          totalContentHeight += (children.length - 1) * 5;
          
          if (totalContentHeight > availableHeight) {
            const scale = Math.max(0.6, availableHeight / totalContentHeight);
            console.log(`🎯 ${name} SCALING:`, scale);
            
            children.forEach(child => {
              child.style.transform = `scale(${scale})`;
              child.style.transformOrigin = 'top center';
              child.style.marginBottom = `${(1 - scale) * -20}px`;
            });
          }
        });
      }, 200);
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
    
    console.log('🎯 ========= DISABLED AUTOSCALING + FORCED EDGES COMPLETE ========= 🎯');
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
    </div>
  );
};

export default LandscapeLayout; 