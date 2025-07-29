import React, { useRef, useEffect } from 'react';
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
  /** Whether this is in portrait mode (for swipe-to-close) */
  isPortraitMode?: boolean;
}

const MenuDrawerContent: React.FC<MenuDrawerContentProps> = ({ onClose, isPortraitMode = false }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set up swipe-to-close when component mounts (portrait mode only)
  useEffect(() => {
    if (!isPortraitMode || !onClose) {
      return;
    }
    
    const createSwipeToClose = (drawerElement: HTMLElement) => {
      let startX = 0;
      let startY = 0;
      let isTrackingSwipe = false;

      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        startX = touch.clientX;
        startY = touch.clientY;
        isTrackingSwipe = false;
      };

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        if (!touch) return;
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        const deltaX = currentX - startX;
        const deltaY = Math.abs(currentY - startY);
        if (!isTrackingSwipe && Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
          isTrackingSwipe = true;
        }
        if (isTrackingSwipe && deltaX > 0) {
          e.preventDefault();
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        if (!touch || !isTrackingSwipe) return;
        const endX = touch.clientX;
        const deltaX = endX - startX;
        const swipeDistance = Math.abs(deltaX);
        
                         // Use the visible content width for threshold calculation
        const drawerWidth = drawerElement.getBoundingClientRect().width;
        const threshold = drawerWidth * 0.4; // 40% threshold for swipe-to-close
        const isCorrectDirection = deltaX > 0;
        if (isCorrectDirection && swipeDistance >= threshold) {
          onClose();
        }
        isTrackingSwipe = false;
      };

      drawerElement.addEventListener('touchstart', handleTouchStart);
      drawerElement.addEventListener('touchmove', handleTouchMove);
      drawerElement.addEventListener('touchend', handleTouchEnd);

      return () => {
        drawerElement.removeEventListener('touchstart', handleTouchStart);
        drawerElement.removeEventListener('touchmove', handleTouchMove);
        drawerElement.removeEventListener('touchend', handleTouchEnd);
      };
    };

    // Wait for the component to be fully rendered
    const setupSwipeToClose = () => {
      if (scrollContainerRef.current) {
        const rect = scrollContainerRef.current.getBoundingClientRect();
        
        if (rect.width > 0 && rect.height > 0) {
          return createSwipeToClose(scrollContainerRef.current);
        } else {
          setTimeout(setupSwipeToClose, 50);
        }
      }
    };

    // Start setup after a short delay
    setTimeout(setupSwipeToClose, 100);

    return () => {
      // Component cleanup
    };
  }, [isPortraitMode, onClose]);

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