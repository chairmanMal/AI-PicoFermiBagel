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

  // Add CSS to hide scrollbars when not needed
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .menu-drawer-scroll::-webkit-scrollbar {
        display: none;
      }
      .menu-drawer-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        className="menu-drawer-scroll"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px', // Match Column 1 spacing
          flex: '1',
          overflow: 'auto',
          paddingRight: '8px', // Reduced from 16px to give more space
          paddingTop: '5px', // Move content down slightly to align with other columns
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          minWidth: '420px', // Increased to match new drawer minimum width
          width: '100%' // Use full available width
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

        {/* Hint Purchasing Section - Now self-contained */}
        <div style={{
          width: '100%',
          minWidth: '420px', // Increased to match new drawer minimum width
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <HintPurchasing />
        </div>

        {/* Score Area Section - Can expand */}
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