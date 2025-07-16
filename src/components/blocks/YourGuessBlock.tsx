import React from 'react';
import GuessArea from '../GuessArea';
import CircularSubmitButton from '../CircularSubmitButton';
import { HelpCircle } from 'lucide-react';

interface YourGuessBlockProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
  isLandscape?: boolean; // Optional prop to remove debug colors in landscape mode
}

const YourGuessBlock: React.FC<YourGuessBlockProps> = ({ guessElementRef, isLandscape = false }) => {
  console.log('🎯 YourGuessBlock rendering - BUILD 1319 - isLandscape:', isLandscape);
  // Show the same help toast as GuessArea
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
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Blue Outline:</strong> This is considered the active position. A tapped number in the selection grid will be assigned to this guess location. After autofill-ing, the active position will automatically advance</p>
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Manual Selection:</strong> Click any unlocked box to make it the active position for autofill</p>
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Drag & Drop:</strong> Drag numbers directly onto any unlocked box from the selection area, or drag numbers between guess positions to swap them</p>
          <p style="margin: 12px 0; color: #374151; line-height: 1.5;"><strong>Locking:</strong> Long-press any filled guess position to lock/unlock it from changing values. Locking also causes the autofill advancing to skip that position</p>
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

  return (
    <div 
      className="your-guess-block"
      ref={guessElementRef}
      style={{
        background: 'white', // Add white background for portrait mode
        borderRadius: '12px', // Add rounded corners
        padding: '16px', // Normal padding since footer is in flow
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Add subtle shadow
        width: '100%',
        height: '100%', // Always use 100% height
        boxSizing: 'border-box',
        position: 'relative', // CRITICAL: This makes absolute positioning work relative to this container
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isLandscape ? 'white' : 'lime', // BRIGHT GREEN (only in portrait)
        border: isLandscape ? 'none' : '5px solid red'
      }}
    >
      {/* Help icon absolutely positioned in upper left - relative to card boundaries */}
      <button
        className="help-button"
        onClick={showToast}
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
      >
        <HelpCircle size={27} />
      </button>

      {/* Submit button in upper right corner */}
      <div style={{
        position: 'absolute',
        top: '7px', // Moved down 5px from 2px to 7px
        right: '7px', // 5px more space from the right edge
        zIndex: 10
      }}>
        <CircularSubmitButton />
      </div>

      {/* Title centered at the top */}
      <h3 className="guess-title" style={{
        margin: '0 0 1px 0', // FURTHER REDUCED gap between title and array (50% less)
        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
        color: '#1f2937',
        fontWeight: 600,
        textAlign: 'center',
        width: '100%'
      }}>Your Guess</h3>
      {/* Main content - directly in card */}
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column',
        paddingBottom: '0px', // REMOVED padding that was creating gap
        minHeight: '0' // Allow shrinking
      }}>
        <GuessArea isLandscape={isLandscape} />
      </div>

      {/* Footer positioned at bottom */}
      <div 
        className="block-footer" 
        style={{
          position: 'relative', // Use relative positioning
          fontSize: 'clamp(0.85rem, 2vw, 1rem)', // Match Number Selection footer font
          color: '#6b7280',
          fontWeight: 400, // Match Number Selection footer weight
          textAlign: 'center',
          padding: '8px 0',
          borderTop: 'none', // Remove the tiny line above footer
          zIndex: 5,
          boxSizing: 'border-box', // Ensure padding is included in width calculation
          flexShrink: 0, // Prevent footer from shrinking
          // Override any CSS that might interfere
          margin: '0', // Override the CSS margin-top: 8px
          marginTop: 'auto', // Force auto margin to push to bottom
          // Force the styles with very specific values
          backgroundColor: isLandscape ? 'rgb(255, 0, 255)' : 'rgb(255, 255, 0)', // MAGENTA vs YELLOW
          border: isLandscape ? '5px solid rgb(0, 0, 0)' : '3px solid rgb(0, 0, 255)', // BLACK vs BLUE
          // Ensure full width by removing any container padding
          marginLeft: '-16px', // Compensate for container padding
          marginRight: '-16px', // Compensate for container padding
          width: 'calc(100% + 32px)' // Extend beyond container padding
        }}
        onLoad={() => {
          console.log('🎯 YOUR GUESS FOOTER STYLE DEBUG - isLandscape:', isLandscape, 'backgroundColor:', isLandscape ? 'MAGENTA' : 'YELLOW');
          console.log('🎯 YOUR GUESS FOOTER: Loaded with bright yellow background');
          const footerEl = document.querySelector('.your-guess-block .block-footer') as HTMLElement;
          const parentEl = document.querySelector('.your-guess-block') as HTMLElement;
          if (footerEl && parentEl) {
            console.log('🎯 YOUR GUESS FOOTER: Position and size:', {
              footerRect: footerEl.getBoundingClientRect(),
              parentHeight: parentEl.offsetHeight,
              footerHeight: footerEl.offsetHeight
            });
          }
        }}
      >
        Tap a box to select, drag to swap, long-press to lock
      </div>
    </div>
  );
};

export default YourGuessBlock; 