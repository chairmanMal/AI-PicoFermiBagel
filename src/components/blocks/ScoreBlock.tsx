import React from 'react';
import ScoreArea from '../ScoreArea';

const ScoreBlock: React.FC = () => {
  return (
    <div 
      className="score-block"
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
      <ScoreArea />
    </div>
  );
};

export default ScoreBlock; 