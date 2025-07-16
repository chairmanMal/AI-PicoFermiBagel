import React, { useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import YourGuessBlock from '../blocks/YourGuessBlock';
import SelectionArea from '../SelectionArea';
import MenuDrawerContent from '../MenuDrawerContent';
import RecentGuessHistory from '../RecentGuessHistory';
import TargetDisplay from '../TargetDisplay';

interface LandscapeLayoutCleanProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
}

const LandscapeLayoutClean: React.FC<LandscapeLayoutCleanProps> = ({ guessElementRef }) => {
  const landscapeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { settings } = useGameStore();

  // Show help toast for Number Selection
  const showNumberSelectionHelp = () => {
    console.log(`🔍 Number Selection Help clicked - showing toast`);
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
        padding: 20px;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Number Selection Help</h3>
        <p style="margin: 0 0 10px 0; color: #374151; line-height: 1.5;">
          <strong>Tap</strong> any number to automatically fill the next available position in your guess.
        </p>
        <p style="margin: 0 0 10px 0; color: #374151; line-height: 1.5;">
          <strong>Drag</strong> a number to place it in a specific position in your guess.
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Numbers 0-${settings.digitRange} are available for this game mode.
        </p>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-top: 15px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Got it!</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  };

  useEffect(() => {
    console.log('🎯 ========= LANDSCAPE LAYOUT CLEAN - CONTENT-ONLY AUTO-SCALING ========= 🎯');
    console.log('🎯 VIEWPORT:', `${window.innerWidth}x${window.innerHeight}`);

    // Get the actual block containers
    const yourGuessBlock = document.querySelector('.your-guess-block') as HTMLElement;
    const numberSelectionBlock = document.querySelector('.number-selection-block') as HTMLElement;
    
    console.log('🎯 Your Guess Block found:', !!yourGuessBlock);
    console.log('🎯 Number Selection Block found:', !!numberSelectionBlock);

    // Helper to scale only the content grids, not the entire blocks
    const scaleContentGrids = (containerEl: HTMLElement, blockType: string, minScale = 0.15) => {
      if (!containerEl) {
        console.log(`   🎯 No container element found for ${blockType}`);
        return;
      }
      
      console.log(`   🎯 Processing ${blockType} container:`, containerEl.className);
      
      // Find the content grids within the container (both types)
      const numbersGrid = containerEl.querySelector('.numbers-grid') as HTMLElement;
      const guessGrid = containerEl.querySelector('.guess-grid') as HTMLElement;
      const gridToScale = numbersGrid || guessGrid;
      
      if (!gridToScale) {
        console.log(`   🎯 No grid found in ${blockType} (looked for .numbers-grid and .guess-grid)`);
        return;
      }
      
      // Set overflow: visible to prevent accidental clipping
      if (gridToScale.parentElement) gridToScale.parentElement.style.overflow = 'visible';
      gridToScale.style.overflow = 'visible';
      
      console.log(`   🎯 Found grid in ${blockType}:`, gridToScale.className);
      
      // Reset scaling first
      gridToScale.style.transform = 'none';
      gridToScale.style.transformOrigin = 'top center';
      
      // Get the container dimensions
      const containerHeight = containerEl.offsetHeight;
      const containerWidth = containerEl.offsetWidth;
      const gridHeight = gridToScale.scrollHeight;
      const gridWidth = gridToScale.scrollWidth;
      
      // Dynamically measure title and footer heights
      const titleEl = containerEl.querySelector('.selection-title, .guess-title') as HTMLElement;
      const footerEl = containerEl.querySelector('.block-footer') as HTMLElement;
      const titleHeight = titleEl ? titleEl.offsetHeight + 12 : 50; // Add more margin for title
      const footerHeight = footerEl ? footerEl.offsetHeight + 20 : 50; // Add more padding and margin for footer
      
      // Measure numbers-container padding
      const numbersContainer = containerEl.querySelector('.numbers-container') as HTMLElement;
      let numbersPadding = 0;
      if (numbersContainer) {
        const style = window.getComputedStyle(numbersContainer);
        numbersPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      }
      // Measure numbers-grid gap (vertical)
      let gridGap = 0;
      if (numbersGrid) {
        const style = window.getComputedStyle(numbersGrid);
        gridGap = parseFloat(style.rowGap || style.gap || '0');
      }
      
      const reserved = titleHeight + footerHeight + numbersPadding + gridGap;
      
      console.log(`   🎯 ${blockType} measured heights:`, {
        titleHeight,
        footerHeight,
        numbersPadding,
        gridGap,
        totalReserved: reserved
      });
      
      // Calculate available space for grid
      const availableHeight = Math.max(containerHeight - reserved - 10, 100); // Extra 10px buffer
      const availableWidth = containerWidth - 20; // 10px padding on each side
      
      console.log(`   🎯 ${blockType} available space:`, `${availableWidth}x${availableHeight}`);
      
      // Calculate scale factors
      const heightScale = availableHeight / gridHeight;
      const widthScale = availableWidth / gridWidth;
      const scale = Math.max(Math.min(heightScale, widthScale), minScale);
      
      console.log(`   🎯 ${blockType} scale calculation:`, {
        heightScale: heightScale.toFixed(3),
        widthScale: widthScale.toFixed(3),
        finalScale: scale.toFixed(3)
      });
      
      // Apply scaling if needed
      if (scale < 1) {
        gridToScale.style.transform = `scale(${scale})`;
        console.log(`   🎯 Applied scale ${scale.toFixed(3)} to ${blockType}`);
      } else {
        console.log(`   🎯 No scaling needed for ${blockType} (scale would be ${scale.toFixed(3)})`);
      }
    };

    // Apply scaling to both blocks
    if (yourGuessBlock) {
      scaleContentGrids(yourGuessBlock, 'Your Guess Block');
    }
    
    if (numberSelectionBlock) {
      scaleContentGrids(numberSelectionBlock, 'Number Selection Block');
    }

    // Cleanup function
    return () => {
      console.log('🎯 Cleaning up scaling observers');
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
        zIndex: 50,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Title and Subtitle - Top justified, horizontally centered */}
      <div ref={headerRef} style={{
        flex: '0 0 auto',
        padding: '10px 5px 5px 5px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 className="landscape-title" style={{
          margin: '0 0 5px 0',
          fontSize: '1.8rem',
          fontWeight: '600'
        }}>
          PicoFermiBagel
        </h1>
        <p className="landscape-subtitle" style={{
          margin: '0',
          fontSize: '1.1rem',
          opacity: 0.9
        }}>
          A Number-based Logical Guessing Game
        </p>
      </div>
      
      {/* Orange Container - 3 Columns within red border */}
      <div className="orange-container" style={{
        flex: '1',
        display: 'flex',
        justifyContent: 'center', // Center the columns horizontally
        alignItems: 'stretch', // Stretch columns to full height
        gap: '5px',
        padding: '2.5px 2.5px 12.5px 2.5px', // Added 10px bottom padding (2.5 + 10 = 12.5)
        minHeight: 0 // Allow container to shrink
      }}>
        {/* Column 1: Target Display + Your Guess + Number Selection stacked */}
        <div className="landscape-column column-1" style={{
          flex: '1.2', // Reduced from '1.4' to '1.2' (50% less growth)
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          height: '100%',
          padding: '2.5px', // Reduced by 50% from 5px to 2.5px
          minHeight: 0 // Allow column to shrink
        }}>
          {/* Target Display - Only shows if enabled */}
          {settings.showTarget && (
            <div style={{
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}>
              <TargetDisplay />
            </div>
          )}
          
          {/* Your Guess Block - Natural expansion with embedded submit button */}
          <div style={{
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}>
            <YourGuessBlock guessElementRef={guessElementRef} isLandscape={true} />
          </div>
          
          {/* Number Selection Block - Takes remaining space */}
          <div className="number-selection-block" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            overflow: 'visible',
            minHeight: 0,
            position: 'relative'
          }}>
            {/* Help icon absolutely positioned in upper left - same as Your Guess block */}
            <button
              className="help-button"
              onClick={showNumberSelectionHelp}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <HelpCircle size={27} />
            </button>
            <SelectionArea isLandscape={true} />
          </div>
        </div>
        
        {/* Column 2: Recent Guesses (Reduced Width) */}
        <div className="landscape-column column-2" style={{
          flex: '0.9', // Increased from '0.8' to '0.9' (50% less reduction)
          height: '100%',
          padding: '2.5px', // Reduced by 50% from 5px to 2.5px
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0 // Allow column to shrink
        }}>
          {/* Recent Guesses - Takes full available space */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            flex: '1', // Takes full available space
            minHeight: 0, // Allow shrinking below content size
            maxHeight: '100%', // Don't exceed container
            overflow: 'auto', // Changed from 'hidden' to 'auto' for consistency
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start' // Align to top
          }}>
            <RecentGuessHistory />
          </div>
        </div>
        
        {/* Column 3: Menu Content (Always Open, No Close Icon) */}
        <div className="landscape-column column-3" style={{
          flex: '1', // Keep the same width
          height: '100%',
          padding: '0px', // Remove all padding to make content wider
          minHeight: 0 // Allow column to shrink
        }}>
          <div style={{
            background: 'transparent',
            borderRadius: '12px',
            padding: '0px 5px 5px 5px', // Minimal padding, no top padding, reduced horizontal
            boxShadow: 'none',
            backdropFilter: 'none',
            height: '100%',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <MenuDrawerContent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandscapeLayoutClean; 