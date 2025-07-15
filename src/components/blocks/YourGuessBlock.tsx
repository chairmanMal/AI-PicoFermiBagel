import React from 'react';
import GuessArea from '../GuessArea';
import CircularSubmitButton from '../CircularSubmitButton';
import { HelpCircle } from 'lucide-react';

interface YourGuessBlockProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
}

const YourGuessBlock: React.FC<YourGuessBlockProps> = ({ guessElementRef }) => {
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
    <div style={{ width: '100%' }}>
      <div 
        className="your-guess-block"
        ref={guessElementRef}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          minHeight: 'max-content',
          paddingBottom: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Help icon absolutely positioned in upper left */}
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
        <h3 className="guess-title" style={{
          margin: '0 0 clamp(4px, 1vw, 8px) 0',
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
          color: '#1f2937',
          fontWeight: 600,
          textAlign: 'center',
          width: '100%'
        }}>Your Guess</h3>
        {/* Submit button in upper right corner */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10
        }}>
          <CircularSubmitButton />
        </div>
        {/* Main content with right padding to avoid overlap with submit button */}
        <div style={{
          paddingRight: '80px',
          marginTop: '16px',
          width: '100%'
        }}>
          <GuessArea />
        </div>
        {/* Subtitle as footer */}
        <div className="block-footer" style={{
          marginTop: '4px',
          fontSize: 'clamp(0.85rem, 2vw, 1rem)',
          color: '#6b7280',
          fontWeight: 400,
          textAlign: 'center',
          width: '100%'
        }}>
          Tap a box to select, drag to swap, long-press to lock
        </div>
      </div>
    </div>
  );
};

export default YourGuessBlock; 