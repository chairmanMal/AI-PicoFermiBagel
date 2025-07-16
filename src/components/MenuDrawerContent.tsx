import React from 'react';
import Scratchpad from './Scratchpad';
import HintPurchasing from './HintPurchasing';
import ScoreArea from './ScoreArea';
// Removed CustomScrollIndicator - using standard browser scrolling

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
  // Removed scrollContainerRef - using standard browser scrolling

  // Simple scrolling implementation like iPhone menu drawer - no custom scrollbar hiding
  // Let the system handle scrollbars naturally

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'fit-content', // Only as tall as content
      maxHeight: '100%', // Don't exceed container height
      overflow: 'hidden',
      padding: '0',
      position: 'relative',
      background: 'transparent' // Transparent background
    }}>
      <div 
        className="menu-drawer-scroll"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          height: 'fit-content', // Only as tall as content
          overflow: 'visible', // Allow content to determine height
          paddingRight: '0',
          paddingTop: '0',
          paddingLeft: '0',
          minWidth: '280px', // Reduced from 420px to allow expansion
          width: '100%',
          // Minimal scrollbar styling
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        {/* Scratchpad Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <Scratchpad />
        </div>

        {/* Hint Purchasing Section - Full width background like other elements */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <HintPurchasing />
        </div>

        {/* Score Area Section - Can expand */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <ScoreArea />
        </div>
      </div>
      
      {/* Using standard browser scrolling - no custom indicator needed */}
    </div>
  );
};

export default MenuDrawerContent; 