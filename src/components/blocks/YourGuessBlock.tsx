import React from 'react';
import GuessArea from '../GuessArea';
import CircularSubmitButton from '../CircularSubmitButton';

interface YourGuessBlockProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
}

const YourGuessBlock: React.FC<YourGuessBlockProps> = ({ guessElementRef }) => {
  return (
    <div 
      className="your-guess-block"
      ref={guessElementRef}
      style={{
        // Only internal styling - no positioning or layout constraints
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative', // Enable absolute positioning for submit button
        minHeight: 'max-content', // Dynamically adjust to content size
        paddingBottom: '20px' // Extra padding at bottom for visual balance
      }}
    >
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
        paddingRight: '80px' // Give space for submit button (60px button + 20px gap)
      }}>
        <GuessArea />
      </div>
    </div>
  );
};

export default YourGuessBlock; 