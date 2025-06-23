import React from 'react';
import { Eye, Target } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import './TargetDisplay.css';

const TargetDisplay: React.FC = () => {
  const { gameState, settings } = useGameStore();

  if (!settings.showTarget) {
    return null;
  }

  return (
    <div className="target-display">
      <div className="target-header">
        <Eye size={16} />
        <span className="target-label">Target Number</span>
        <Target size={16} />
      </div>
      <div className="target-number">
        {gameState.target.map((digit, index) => (
          <span key={index} className="target-digit">
            {digit}
          </span>
        ))}
      </div>
      <div className="target-note">
        (Scoring disabled)
      </div>
    </div>
  );
};

export default TargetDisplay; 