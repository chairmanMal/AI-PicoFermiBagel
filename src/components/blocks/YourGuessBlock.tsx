import React from 'react';
import GuessArea from '../GuessArea';

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
        boxSizing: 'border-box'
      }}
    >
      <GuessArea />
    </div>
  );
};

export default YourGuessBlock; 