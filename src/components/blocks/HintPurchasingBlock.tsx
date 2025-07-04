import React from 'react';
import HintPurchasing from '../HintPurchasing';

const HintPurchasingBlock: React.FC = () => {
  return (
    <div 
      className="hint-purchasing-block"
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
      <HintPurchasing />
    </div>
  );
};

export default HintPurchasingBlock; 