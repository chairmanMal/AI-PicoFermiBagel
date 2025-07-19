import React, { useEffect } from 'react';
import SelectionArea from '../SelectionArea';
import { HelpCircle } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

interface NumberSelectionBlockProps {
  // No props needed for now
}

const NumberSelectionBlock: React.FC<NumberSelectionBlockProps> = () => {
  const { settings } = useGameStore();
  
  // Add CSS override with maximum specificity - EXACTLY like YourGuessBlock
  useEffect(() => {
    const styleId = 'number-selection-block-override';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
      .portrait-content .selection-section .number-selection-block {
        height: auto !important;
        flex: 0 0 auto !important;
        display: block !important;
        min-height: 0 !important;
        max-height: none !important;
      }
      
      .portrait-content .target-display {
        margin: 0 !important;
      }
    `;
    
    return () => {
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, []);

  // Show the same help toast as SelectionArea
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

  return (
    <div 
      className="number-selection-block"
      style={{
        background: 'white', // EXACTLY like YourGuessBlock
        borderRadius: '12px', // Add rounded corners
        padding: '8px 15px 0px 15px', // Reduced top padding from 15px to 8px to reduce gaps
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // EXACTLY like YourGuessBlock
        width: '100%',
        height: 'auto !important', // Override CSS height: 100%
        boxSizing: 'border-box',
        position: 'relative', // CRITICAL: This makes absolute positioning work relative to this container
        margin: '0',
        marginTop: '-10px', // Reduce gap by 50% (assuming ~20px gap, reduce by 10px)
        flex: '0 0 auto !important', // Override CSS flex: 1 1 auto
        display: 'block !important', // Override CSS display: flex
        overflow: 'visible' // Allow footer to extend beyond card boundaries
        // Use natural flow - no flexbox
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

      {/* Title centered at the top */}
      <h3 className="selection-title" style={{
        margin: '5px 0 10px 0', // Reduced top margin from 10px to 5px to reduce gaps
        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
        color: '#1f2937',
        fontWeight: 600,
        textAlign: 'center',
        width: '100%'
      }}>Number Selection</h3>
      
      {/* Main content - directly in card */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '40px' // Increased padding to make room for absolute positioned footer
      }}>
        <SelectionArea />
      </div>

      {/* Footer as separate element in content stack */}
      <div className="block-footer" style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        padding: '8px 3px', // Reduced horizontal padding to 3px from sides
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#6b7280',
        fontWeight: 500,
        borderRadius: '0 0 12px 12px' // Rounded corners only on bottom to match card
      }}>
        Tap # to autofill or drag it to a specific position
      </div>
    </div>
  );
};

export default NumberSelectionBlock; 