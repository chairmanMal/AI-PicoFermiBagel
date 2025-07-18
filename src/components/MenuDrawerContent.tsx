import React, { useRef } from 'react';
import Scratchpad from './Scratchpad';
import HintPurchasing from './HintPurchasing';
import ScoreArea from './ScoreArea';

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
 * - Consistent appearance across layouts
 * - No close functionality (handled by parent drawer)
 * - Exact same structure as SettingsDrawerContent for height measurement
 */
interface MenuDrawerContentProps {
  /** Optional callback when close is requested (not used in landscape column) */
  onClose?: () => void;
}

const MenuDrawerContent: React.FC<MenuDrawerContentProps> = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Simple cleanup on component unmount
  React.useEffect(() => {
    return () => {
      console.log('🍔 MenuDrawerContent: Component unmounting - cleaning up');
      // Component is being unmounted, no need to reset state as it will be destroyed
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'auto', // Size to content instead of 100%
      overflow: 'visible', // Allow content to determine size
      padding: '0',
      position: 'relative',
              // border: '3px solid #ff00ff' // MAGENTA BORDER - DEBUG: Menu drawer content wrapper - REMOVED
    }}>
      {/* Menu Content - All the game menu content, full width */}
      <div 
        ref={scrollContainerRef}
        style={{
          flex: 'none', // Don't expand, size to content
          overflow: 'visible', // Don't scroll, let content determine size
          position: 'relative',
          width: '100%',
          background: 'white',
          borderRadius: '12px',
          padding: '10px', // Reduced from 15px to 10px
          margin: '0',
          // Minimal scrollbar styling
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
          pointerEvents: 'auto',
          touchAction: 'pan-y', // Allow vertical scrolling but not horizontal gestures
          // border: '3px solid #0000ff' // BLUE BORDER - DEBUG: Menu drawer scrollable container - REMOVED
        } as React.CSSProperties & {
          pointerEvents: 'auto !important';
          touchAction: 'pan-y !important';
        }}
        className="menu-drawer-scrollable"
      >
        {/* Direct menu content without drawer wrapper */}
        <div className="menu-section" style={{ 
          padding: '0 0 15px 0', // Reduced to 15px gap
          borderBottom: '1px solid #f3f4f6',
          // border: '2px solid #ff8800' // ORANGE BORDER - DEBUG: Menu section 1 - REMOVED
        }}>
          {/* Scratchpad Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            padding: '0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <Scratchpad />
          </div>
        </div>

        <div className="menu-section" style={{ 
          padding: '10px 0 10px 0', // Reduced to 10px gap (15px + 10px = 25px total)
          borderBottom: '1px solid #f3f4f6',
          // border: '2px solid #8800ff' // PURPLE BORDER - DEBUG: Menu section 2 - REMOVED
        }}>
          {/* Hint Purchasing Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            padding: '0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <HintPurchasing />
          </div>
        </div>

        <div className="menu-section" style={{ 
          padding: '10px 0 0 0', // Reduced to 10px gap (10px + 10px = 20px total, but no bottom padding)
          borderBottom: '1px solid #f3f4f6',
          // border: '2px solid #0088ff' // LIGHT BLUE BORDER - DEBUG: Menu section 3 - REMOVED
        }}>
          {/* Score Area Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            padding: '0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            // border: '3px solid #0000ff' // BLUE BORDER - DEBUG: Score area container - REMOVED
          }}>
            <ScoreArea />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDrawerContent; 