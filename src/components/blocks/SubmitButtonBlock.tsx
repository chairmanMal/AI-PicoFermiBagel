import React from 'react';
import CircularSubmitButton from '../CircularSubmitButton';

const SubmitButtonBlock: React.FC = () => {
  return (
    <div 
      className="submit-button-block"
      style={{
        // Only internal styling - no positioning or layout constraints
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '76px',
        height: '76px',
        boxSizing: 'border-box'
      }}
    >
      <CircularSubmitButton />
    </div>
  );
};

export default SubmitButtonBlock; 