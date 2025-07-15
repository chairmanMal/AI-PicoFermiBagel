import React, { useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import TargetDisplay from './TargetDisplay';
import YourGuessBlock from './blocks/YourGuessBlock';
import SelectionArea from './SelectionArea';
import RecentGuessHistory from './RecentGuessHistory';

interface PortraitLayoutProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
}

const PortraitLayout: React.FC<PortraitLayoutProps> = ({ guessElementRef }) => {
  const portraitRef = useRef<HTMLDivElement>(null);
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
    console.log('🎯 ========= PORTRAIT LAYOUT WITH COLORED BORDERS ========= 🎯');
    console.log('🎯 VIEWPORT:', `${window.innerWidth}x${window.innerHeight}`);
    
    // Step 1: COMPLETELY RESET any landscape layout interference
    const elementsToReset = [
      document.querySelector('.game-screen'),
      document.querySelector('body'),
      document.querySelector('html'),
      document.querySelector('#root'),
      document.querySelector('.app'),
      document.querySelector('.container'),
      document.querySelector('.title-section'),
      document.querySelector('.landscape-container'), // Reset landscape container
      document.querySelector('.landscape-content'), // Reset landscape content
      document.querySelector('.landscape-submit-button') // Reset landscape submit button
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
        el.style.setProperty('z-index', 'auto', 'important');
        el.style.setProperty('display', '', 'important'); // Reset to default
      }
    });
    
    // Hide landscape container completely
    const landscapeContainer = document.querySelector('.landscape-container') as HTMLElement;
    if (landscapeContainer) {
      landscapeContainer.style.setProperty('display', 'none', 'important');
    }
    
    console.log('🎯 ALL LANDSCAPE ELEMENTS: Reset and landscape container hidden');
    
    // Step 2: FORCE portrait-specific layout
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // RED BORDER: Total displayable screen area (5px left/right, 10px top/bottom)
    const redBorder = {
      top: 10,
      left: 5,
      width: viewportWidth - 10, // 5px from both sides = 10px total
      height: viewportHeight - 20, // 10px top + 10px bottom = 20px total
      right: viewportWidth - 5,
      bottom: viewportHeight - 10
    };
    
    console.log('🔴 RED BORDER (Total Displayable):', redBorder);
    console.log('🎯 SCREEN VERIFICATION: Width=' + viewportWidth + ', Height=' + viewportHeight);
    
    // Apply red border to portrait container
    const portraitContainer = portraitRef.current;
    if (portraitContainer) {
      portraitContainer.style.setProperty('border', '2px solid red', 'important'); // ENABLED for debugging
      portraitContainer.style.setProperty('position', 'fixed', 'important');
      portraitContainer.style.setProperty('top', `${redBorder.top}px`, 'important');
      portraitContainer.style.setProperty('left', `${redBorder.left}px`, 'important');
      portraitContainer.style.setProperty('width', `${redBorder.width}px`, 'important');
      portraitContainer.style.setProperty('height', `${redBorder.height}px`, 'important');
      portraitContainer.style.setProperty('z-index', '1', 'important');
      
      console.log('✅ RED BORDER: Applied to portrait container');
    }
    
    // Step 3: Position title section for portrait (centered horizontally, BELOW DRAWER ICONS)
    const titleSection = document.querySelector('.title-section') as HTMLElement;
    if (titleSection) {
      const titleMarginTop = 35; // Increased from 12px to 35px - move title down to center with drawer icons
      
      titleSection.style.setProperty('position', 'fixed', 'important');
      titleSection.style.setProperty('top', `${redBorder.top + titleMarginTop}px`, 'important');
      titleSection.style.setProperty('left', `${redBorder.left}px`, 'important');
      titleSection.style.setProperty('width', `${redBorder.width}px`, 'important');
      titleSection.style.setProperty('text-align', 'center', 'important');
      titleSection.style.setProperty('z-index', '100', 'important');
      titleSection.style.setProperty('padding', '0', 'important');
      titleSection.style.setProperty('margin', '0', 'important');
      titleSection.style.setProperty('display', 'flex', 'important');
      titleSection.style.setProperty('flex-direction', 'column', 'important');
      titleSection.style.setProperty('justify-content', 'center', 'important');
      titleSection.style.setProperty('align-items', 'center', 'important');
      titleSection.style.setProperty('background', 'transparent', 'important');
      titleSection.style.setProperty('backdrop-filter', 'none', 'important');
      titleSection.style.setProperty('border-radius', 'none', 'important');
      
      const title = titleSection.querySelector('.game-title') as HTMLElement;
      const subtitle = titleSection.querySelector('.game-subtitle') as HTMLElement;
      
      if (title) {
        title.style.margin = '10px 0 7px 0'; // Keep the reduced bottom margin
        title.style.fontSize = '1.8rem';
        title.style.fontWeight = '600';
        title.style.color = 'white';
        title.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
      }
      
      if (subtitle) {
        subtitle.style.margin = '0 0 0 0'; // Reset all margins
        subtitle.style.position = 'relative'; // Enable positioning
        subtitle.style.top = '-10px'; // Keep subtitle close to title
        subtitle.style.fontSize = '1.1rem';
        subtitle.style.color = 'rgba(255, 255, 255, 0.9)';
        subtitle.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
      }
      
      console.log('🎯 PORTRAIT TITLE SECTION: Positioned with title centered with drawer icons');
    }
    
    // Step 4: Calculate content area positioning
    setTimeout(() => {
      if (!titleSection) return;
      
      const subtitle = titleSection.querySelector('.game-subtitle') as HTMLElement;
      if (!subtitle) return;
      
      const subtitleRect = subtitle.getBoundingClientRect();
      const subtitleBottom = subtitleRect.bottom;
      
      // ORANGE BORDER: Main content container (starts below title/subtitle with reduced margin)
      const contentGap = 3; // Reduced from 7.5px to 3px - compress gap between subtitle and content
      const orangeBorder = {
        top: subtitleBottom + contentGap,
        left: redBorder.left, // No margin from red border - extend to edges
        width: redBorder.width, // Full width to red borders
        height: redBorder.bottom - (subtitleBottom + contentGap) - 10, // 10px margin from bottom only
        right: redBorder.right,
        bottom: redBorder.bottom - 10
      };
      
      console.log('🟠 ORANGE BORDER (Main Content):', orangeBorder);
      
      // Step 5: Position portrait content container and apply orange border
      const portraitContentEl = document.querySelector('.portrait-content') as HTMLElement;
      if (portraitContentEl) {
        portraitContentEl.style.setProperty('border', '2px solid orange', 'important'); // ENABLED for debugging
        portraitContentEl.style.setProperty('position', 'fixed', 'important');
        portraitContentEl.style.setProperty('top', `${orangeBorder.top}px`, 'important');
        portraitContentEl.style.setProperty('left', `${orangeBorder.left}px`, 'important');
        portraitContentEl.style.setProperty('width', `${orangeBorder.width}px`, 'important');
        portraitContentEl.style.setProperty('height', `${orangeBorder.height}px`, 'important');
        portraitContentEl.style.setProperty('display', 'flex', 'important');
        portraitContentEl.style.setProperty('flex-direction', 'column', 'important');
        portraitContentEl.style.setProperty('gap', '5px', 'important');
        portraitContentEl.style.setProperty('align-items', 'center', 'important');
        portraitContentEl.style.setProperty('justify-content', 'flex-start', 'important');
        portraitContentEl.style.setProperty('box-sizing', 'border-box', 'important');
        portraitContentEl.style.setProperty('z-index', '20', 'important');
        portraitContentEl.style.setProperty('background', 'transparent', 'important');
        portraitContentEl.style.setProperty('overflow-y', 'auto', 'important');
        portraitContentEl.style.setProperty('padding', '0px', 'important');
        portraitContentEl.style.setProperty('padding', '0px', 'important');
        portraitContentEl.style.setProperty('margin', '0', 'important');
        
        console.log('🟠 ORANGE BORDER: Applied to portrait content container');
      }
      
      // Submit button is now embedded in YourGuessBlock - no separate positioning needed
      console.log('🎯 PORTRAIT SUBMIT BUTTON: Embedded in YourGuessBlock');
      
      // Debug Your Guess block positioning
      setTimeout(() => {
        const yourGuessBlock = document.querySelector('.your-guess-block') as HTMLElement;
        const guessSection = document.querySelector('.guess-section') as HTMLElement;
        
        if (yourGuessBlock) {
          const blockRect = yourGuessBlock.getBoundingClientRect();
          const blockStyles = window.getComputedStyle(yourGuessBlock);
          console.log('🔵 YOUR GUESS BLOCK DEBUG:');
          console.log('  - Position:', blockRect);
          console.log('  - Padding:', blockStyles.padding);
          console.log('  - Margin:', blockStyles.margin);
          console.log('  - Border:', blockStyles.border);
          console.log('  - Box-sizing:', blockStyles.boxSizing);
          console.log('  - Width:', blockStyles.width);
          console.log('  - Height:', blockStyles.height);
        }
        
        if (guessSection) {
          const sectionRect = guessSection.getBoundingClientRect();
          const sectionStyles = window.getComputedStyle(guessSection);
          console.log('🔵 GUESS SECTION DEBUG:');
          console.log('  - Position:', sectionRect);
          console.log('  - Padding:', sectionStyles.padding);
          console.log('  - Margin:', sectionStyles.margin);
          console.log('  - Border:', sectionStyles.border);
          console.log('  - Width:', sectionStyles.width);
          console.log('  - Height:', sectionStyles.height);
        }
      }, 200);
    }, 100);
    
    // Hide old container
    const container = document.querySelector('.container') as HTMLElement;
    if (container) {
      container.style.display = 'none';
      console.log('🎯 OLD CONTAINER: Hidden');
    }
    
    console.log('🎯 ========= PORTRAIT LAYOUT BUILD 665 COMPLETE ========= 🎯');
  }, []);

  // Add a style tag to force subtitle positioning with maximum specificity
  useEffect(() => {
    // Remove any existing style tag
    const existingStyle = document.getElementById('portrait-subtitle-override');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    console.log('🎯 SUBTITLE POSITIONING: Handled by JavaScript inline styles in PortraitLayout');
    
    return () => {
      // Cleanup
      const styleToRemove = document.getElementById('portrait-subtitle-override');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  // Cleanup function to reset portrait styles when switching orientations
  useEffect(() => {
    return () => {
      console.log('🎯 PORTRAIT CLEANUP: Resetting portrait-specific styles');
      
      // Reset portrait-specific styles when component unmounts (orientation change)
      const elementsToCleanup = [
        { selector: '.title-section', properties: ['position', 'top', 'left', 'width', 'height', 'z-index', 'text-align', 'margin', 'transform', 'transform-origin'] },
        { selector: '.portrait-content', properties: ['position', 'top', 'left', 'width', 'height', 'z-index', 'display', 'flex-direction', 'gap', 'align-items', 'justify-content', 'box-sizing', 'background', 'overflow-y', 'padding', 'margin'] },
        { selector: '.portrait-submit-button', properties: ['position', 'top', 'left', 'width', 'height', 'z-index', 'pointer-events', 'margin', 'padding'] },
        { selector: '.container', properties: ['display'] }
      ];
      
      elementsToCleanup.forEach(({ selector, properties }) => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          properties.forEach(property => {
            element.style.removeProperty(property);
          });
        }
      });
      
      console.log('🎯 PORTRAIT CLEANUP: All portrait styles reset, ready for landscape mode');
    };
  }, []);

  return (
    <div 
      ref={portraitRef}
      className="portrait-container" 
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
      {/* Title and Subtitle - Positioned between red and orange borders */}
      <div className="title-section" style={{
        position: 'fixed',
        zIndex: 100,
        pointerEvents: 'auto',
        padding: '120px 20px 60px 20px',
        margin: '0',
        boxSizing: 'border-box',
        background: 'transparent',
        backdropFilter: 'none',
        boxShadow: 'none'
      } as React.CSSProperties & {
        position: 'fixed !important';
        zIndex: '100 !important';
        pointerEvents: 'auto !important';
        padding: '120px 20px 60px 20px !important';
        margin: '0 !important';
        boxSizing: 'border-box !important';
        background: 'transparent !important';
        backdropFilter: 'none !important';
        boxShadow: 'none !important';
      }}>
        <h1 className="game-title" style={{
          margin: '10px 0 5px 0',
          fontSize: '1.8rem',
          fontWeight: '600',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}>
          PicoFermiBagel
        </h1>
        <p className="game-subtitle" style={{
          margin: '0 0 25px 0',
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}>
          A Number-based Logical Guessing Game
        </p>
      </div>
      <div className="portrait-content" style={{
        pointerEvents: 'auto',
        padding: '0', // Remove all padding so Your Guess block abuts orange border
        margin: '0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '0px', // Remove gap to eliminate spacing between elements
        overflow: 'hidden' // Ensure content stays within orange border
      }}>
        {/* Target Display */}
        <div style={{ flexShrink: 0, width: '100%' }}>
          <TargetDisplay />
        </div>
        
        {/* Guess Area - Should expand to fill allocated space */}
        <div className="guess-section" style={{ 
          position: 'relative',
          width: '100%',
          height: '400px', // Set a fixed height to make it more visible
          marginTop: '0px', // Ensure no margin preventing abutting
          background: 'transparent !important',
          borderRadius: '0 !important',
          padding: '0 !important', // Force zero padding to eliminate double-padding issue
          boxShadow: 'none !important',
          backdropFilter: 'none !important',
          border: '2px solid blue !important' // ENABLED for debugging
        }}>
          <YourGuessBlock guessElementRef={guessElementRef} />
        </div>
        
        {/* Number Selection */}
        <div className="selection-section" style={{ 
          position: 'relative',
          flexShrink: 0, 
          width: '100%' 
        }}>
          {/* Help icon absolutely positioned in upper left - relative to card boundaries */}
          <button
            className="help-button"
            onClick={showNumberSelectionHelp}
            aria-label="Show help"
            style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
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
          <SelectionArea />
        </div>
        
        {/* Recent Guesses */}
        <div className="recent-guess-section" style={{ 
          flex: '1',
          minHeight: '200px',
          overflow: 'auto',
          width: '100%',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}>
          <RecentGuessHistory />
        </div>
      </div>
      
      {/* Mobile Drawer implementation removed - handled by GameScreen */}
    </div>
  );
};

export default PortraitLayout; 