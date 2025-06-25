import React, { useState, useEffect, useRef } from 'react';

interface CustomScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const CustomScrollIndicator: React.FC<CustomScrollIndicatorProps> = ({ containerRef }) => {
  const [scrollInfo, setScrollInfo] = useState({ showIndicator: false, thumbHeight: 0, thumbTop: 0 });
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScrollIndicator = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const hasScroll = scrollHeight > clientHeight;
      
      if (hasScroll) {
        const scrollRatio = scrollTop / (scrollHeight - clientHeight);
        const trackHeight = clientHeight - 8; // 4px margin top/bottom
        const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * trackHeight);
        const thumbTop = 4 + scrollRatio * (trackHeight - thumbHeight);
        
        setScrollInfo({
          showIndicator: true,
          thumbHeight,
          thumbTop
        });
      } else {
        setScrollInfo({ showIndicator: false, thumbHeight: 0, thumbTop: 0 });
      }
    };

    updateScrollIndicator();
    container.addEventListener('scroll', updateScrollIndicator);
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateScrollIndicator);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollIndicator);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  if (!scrollInfo.showIndicator) return null;

  return (
    <div 
      ref={indicatorRef}
      style={{
        position: 'absolute',
        right: '2px',
        top: '0',
        width: '12px',
        height: '100%',
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      {/* Track */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          right: '0',
          width: '12px',
          height: 'calc(100% - 8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px'
        }}
      />
      {/* Thumb */}
      <div
        style={{
          position: 'absolute',
          right: '0',
          width: '12px',
          height: `${scrollInfo.thumbHeight}px`,
          top: `${scrollInfo.thumbTop}px`,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '6px',
          transition: 'opacity 0.2s ease',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      />
    </div>
  );
};

export default CustomScrollIndicator; 