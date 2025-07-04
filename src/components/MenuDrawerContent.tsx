import React, { useRef } from 'react';
import Scratchpad from './Scratchpad';
import HintPurchasing from './HintPurchasing';
import ScoreArea from './ScoreArea';
import CustomScrollIndicator from './CustomScrollIndicator';

/**
 * MenuDrawerContent - A self-contained library component for menu drawer content
 * 
 * This component contains all the content that appears in:
 * - Portrait mode: Right-side menu drawer (when opened)
 * - Landscape mode: Column 3 (always visible)
 * 
 * Features:
 * - Self-contained with all menu content
 * - Scrollable when content exceeds container
 * - Custom scroll indicator for visual feedback
 * - Consistent appearance across layouts
 * - No close functionality (handled by parent)
 */
interface MenuDrawerContentProps {
  /** Optional callback when close is requested (not used in landscape column) */
  onClose?: () => void;
}

const MenuDrawerContent: React.FC<MenuDrawerContentProps> = () => {
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
      <div 
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          flex: '1',
          overflow: 'auto',
          paddingRight: '16px' // Make room for scroll indicator
        }}
      >
        {/* Scratchpad Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <Scratchpad />
        </div>

        {/* Hint Purchasing Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <HintPurchasing />
        </div>

        {/* Score Area Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <ScoreArea />
        </div>
      </div>
      
      {/* Custom Scroll Indicator */}
      <CustomScrollIndicator containerRef={scrollContainerRef} />
    </div>
  );
};

export default MenuDrawerContent; 