import React, { useRef } from 'react';
import MenuArea from './MenuArea';
import CustomScrollIndicator from './CustomScrollIndicator';

/**
 * SettingsDrawerContent - A self-contained library component for settings drawer content
 * 
 * This component contains all the content that appears in the settings drawer
 * when opened via the settings icon. It should NEVER appear in landscape columns.
 * 
 * Features:
 * - Self-contained settings functionality
 * - Scrollable when content exceeds container
 * - Custom scroll indicator for visual feedback
 * - Consistent appearance across orientations
 * - No close functionality (handled by parent drawer)
 */
interface SettingsDrawerContentProps {
  /** Optional callback when close is requested (handled by parent) */
  onClose?: () => void;
}

const SettingsDrawerContent: React.FC<SettingsDrawerContentProps> = ({ onClose }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: '0',
      position: 'relative'
    }}>
      {/* Settings Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        flexShrink: 0
      }}>
        <h2 style={{
          margin: '0',
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Settings
        </h2>
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '0.9rem',
          opacity: 0.8,
          color: '#6b7280'
        }}>
          Customize your game experience
        </p>
      </div>

      {/* Settings Content - All the game settings and options */}
      <div 
        ref={scrollContainerRef}
        style={{
          flex: '1',
          overflow: 'auto',
          position: 'relative',
          paddingRight: '16px' // Make room for scroll indicator
        }}
      >
        <MenuArea onClose={onClose || (() => {})} />
      </div>
      
      {/* Custom Scroll Indicator */}
      <CustomScrollIndicator containerRef={scrollContainerRef} />
    </div>
  );
};

export default SettingsDrawerContent; 