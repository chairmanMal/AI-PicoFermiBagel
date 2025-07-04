import React, { useEffect, useRef } from 'react';
import TargetDisplay from './TargetDisplay';
import GuessArea from './GuessArea';
import SelectionArea from './SelectionArea';
import RecentGuessHistory from './RecentGuessHistory';
import GlobalSubmitButton from './GlobalSubmitButton';
import Scratchpad from './Scratchpad';
import HintPurchasing from './HintPurchasing';
import ScoreArea from './ScoreArea';

interface PortraitLayoutProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
  isMenuDrawerOpen: boolean;
  setIsMenuDrawerOpen: (open: boolean) => void;
}

const PortraitLayout: React.FC<PortraitLayoutProps> = ({ guessElementRef, isMenuDrawerOpen, setIsMenuDrawerOpen }) => {
  const portraitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🎯 ========= PORTRAIT LAYOUT BUILD 665 - INDEPENDENT LAYOUT ========= 🎯');
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
    
    // PORTRAIT BORDER: Full screen with small margins
    const portraitBorder = {
      top: 10,
      left: 10,
      width: viewportWidth - 20, // 10px from both sides = 20px total
      height: viewportHeight - 30, // 10px top + 20px bottom = 30px total
      right: viewportWidth - 10,
      bottom: viewportHeight - 20
    };
    
    console.log('🎯 PORTRAIT BORDER:', portraitBorder);
    console.log('🎯 SCREEN VERIFICATION: Width=' + viewportWidth + ', Height=' + viewportHeight);
    
    // Step 3: Position title section for portrait
    const titleSection = document.querySelector('.title-section') as HTMLElement;
    if (titleSection) {
      titleSection.style.setProperty('position', 'fixed', 'important');
      titleSection.style.setProperty('top', `${portraitBorder.top + 10}px`, 'important');
      titleSection.style.setProperty('left', `${portraitBorder.left}px`, 'important');
      titleSection.style.setProperty('width', `${portraitBorder.width}px`, 'important');
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
      
      console.log('🎯 PORTRAIT TITLE SECTION: Positioned');
    }
    
    // Step 4: Calculate content area positioning
    setTimeout(() => {
      if (!titleSection) return;
      
      const subtitle = titleSection.querySelector('.game-subtitle') as HTMLElement;
      if (!subtitle) return;
      
      const subtitleRect = subtitle.getBoundingClientRect();
      const subtitleBottom = subtitleRect.bottom;
      
      // PORTRAIT CONTENT AREA: Single column layout
      const contentGap = 20; // Gap between title and content
      const portraitContent = {
        top: subtitleBottom + contentGap,
        left: portraitBorder.left,
        width: portraitBorder.width,
        height: portraitBorder.bottom - (subtitleBottom + contentGap),
        right: portraitBorder.right,
        bottom: portraitBorder.bottom
      };
      
      console.log('🎯 PORTRAIT CONTENT AREA:', portraitContent);
      
      // Step 5: Position portrait content container
      const portraitContentEl = document.querySelector('.portrait-content') as HTMLElement;
      if (portraitContentEl) {
        portraitContentEl.style.setProperty('position', 'fixed', 'important');
        portraitContentEl.style.setProperty('top', `${portraitContent.top}px`, 'important');
        portraitContentEl.style.setProperty('left', `${portraitContent.left}px`, 'important');
        portraitContentEl.style.setProperty('width', `${portraitContent.width}px`, 'important');
        portraitContentEl.style.setProperty('height', `${portraitContent.height}px`, 'important');
        portraitContentEl.style.setProperty('display', 'flex', 'important');
        portraitContentEl.style.setProperty('flex-direction', 'column', 'important');
        portraitContentEl.style.setProperty('gap', '15px', 'important');
        portraitContentEl.style.setProperty('align-items', 'center', 'important');
        portraitContentEl.style.setProperty('justify-content', 'flex-start', 'important');
        portraitContentEl.style.setProperty('box-sizing', 'border-box', 'important');
        portraitContentEl.style.setProperty('z-index', '20', 'important');
        portraitContentEl.style.setProperty('background', 'transparent', 'important');
        portraitContentEl.style.setProperty('overflow-y', 'auto', 'important');
        portraitContentEl.style.setProperty('padding', '10px', 'important');
        portraitContentEl.style.setProperty('margin', '0', 'important');
        
        console.log('🎯 PORTRAIT CONTENT: Positioned');
      }
      
      // Step 6: Position submit button for portrait mode
      const submitButton = document.querySelector('.portrait-submit-button') as HTMLElement;
      if (submitButton) {
        // Position submit button between guess area and selection area
        const submitTop = portraitContent.top + 200; // Approximate position
        const submitLeft = portraitContent.left + (portraitContent.width / 2) - 38; // Center horizontally
        
        submitButton.style.setProperty('position', 'fixed', 'important');
        submitButton.style.setProperty('top', `${submitTop}px`, 'important');
        submitButton.style.setProperty('left', `${submitLeft}px`, 'important');
        submitButton.style.setProperty('width', '76px', 'important');
        submitButton.style.setProperty('height', '76px', 'important');
        submitButton.style.setProperty('z-index', '200', 'important');
        submitButton.style.setProperty('pointer-events', 'auto', 'important');
        submitButton.style.setProperty('margin', '0', 'important');
        submitButton.style.setProperty('padding', '0', 'important');
        
        console.log(`🎯 PORTRAIT SUBMIT BUTTON: Positioned at (${submitLeft}, ${submitTop})`);
      }
    }, 100);
    
    // Hide old container
    const container = document.querySelector('.container') as HTMLElement;
    if (container) {
      container.style.display = 'none';
      console.log('🎯 OLD CONTAINER: Hidden');
    }
    
    console.log('🎯 ========= PORTRAIT LAYOUT BUILD 665 COMPLETE ========= 🎯');
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
      <div className="portrait-content" style={{
        pointerEvents: 'auto',
        padding: '0',
        margin: '0',
        boxSizing: 'border-box'
      }}>
        {/* Target Display */}
        <TargetDisplay />
        
        {/* Guess Area */}
        <div className="guess-section" ref={guessElementRef} style={{ position: 'relative' }}>
          <GuessArea />
        </div>
        
        {/* Number Selection */}
        <div className="selection-section">
          <SelectionArea />
        </div>
        
        {/* Recent Guesses */}
        <div className="recent-guess-section" style={{ 
          flex: '1',
          minHeight: '200px',
          overflow: 'visible'
        }}>
          <RecentGuessHistory />
        </div>
      </div>
      
      {/* Submit Button - Completely independent, floating */}
      <div className="portrait-submit-button" style={{
        position: 'absolute',
        top: '0',
        left: '0',
        pointerEvents: 'auto',
        zIndex: 200,
        padding: '0',
        margin: '0',
        boxSizing: 'border-box'
      }}>
        <GlobalSubmitButton />
      </div>
      
      {/* Mobile Drawer for Portrait Mode */}
      <div className={`mobile-drawer ${isMenuDrawerOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        top: '0',
        right: isMenuDrawerOpen ? '0' : '-100%',
        width: '80%',
        height: '100vh',
        background: 'white',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '20px'
      }}>
        <div className="drawer-header" style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setIsMenuDrawerOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              float: 'right'
            }}
          >
            ✕
          </button>
        </div>
        <div className="drawer-content">
          <div className="side-panel-section" style={{ marginBottom: '20px' }}>
            <Scratchpad />
          </div>
          <div className="side-panel-section" style={{ marginBottom: '20px' }}>
            <HintPurchasing />
          </div>
          <div className="side-panel-section">
            <ScoreArea />
          </div>
        </div>
      </div>
      
      {/* Drawer Overlay */}
      {isMenuDrawerOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => setIsMenuDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default PortraitLayout; 