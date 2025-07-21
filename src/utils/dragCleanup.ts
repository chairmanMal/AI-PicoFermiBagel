// Centralized drag cleanup utility
// This handles orphaned drag indicators that might be left on screen due to race conditions

interface DragCleanupOptions {
  checkInterval?: number; // How often to check for orphaned indicators (default: 2 seconds)
  maxAge?: number; // Maximum age of indicators before forced cleanup (default: 10 seconds)
}

class DragCleanupManager {
  private static instance: DragCleanupManager;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private indicatorTimestamps = new Map<HTMLElement, number>();
  private options: Required<DragCleanupOptions>;

  private constructor(options: DragCleanupOptions = {}) {
    this.options = {
      checkInterval: options.checkInterval || 2000,
      maxAge: options.maxAge || 10000,
    };
  }

  static getInstance(options?: DragCleanupOptions): DragCleanupManager {
    if (!DragCleanupManager.instance) {
      DragCleanupManager.instance = new DragCleanupManager(options);
    }
    return DragCleanupManager.instance;
  }

  // Start the background cleanup process
  start(): void {
    if (this.cleanupInterval) {
      return; // Already running
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupOrphanedIndicators();
    }, this.options.checkInterval);

    // Also clean up on page visibility change
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Clean up on window focus/blur
    window.addEventListener('focus', this.handleWindowFocus);
    window.addEventListener('blur', this.handleWindowBlur);
    
    // Clean up on any touch/mouse events that might indicate user interaction
    document.addEventListener('touchend', this.handleGlobalTouchEnd, { passive: true });
    document.addEventListener('mouseup', this.handleGlobalMouseUp, { passive: true });
    document.addEventListener('touchcancel', this.handleGlobalTouchEnd, { passive: true });
    
    // Additional safety: clean up on any mouse/touch movement that might indicate drag end
    document.addEventListener('mousemove', this.handleGlobalMouseMove, { passive: true });
    document.addEventListener('touchmove', this.handleGlobalTouchMove, { passive: true });
    
    // Clean up on any click/tap that might indicate interaction end
    document.addEventListener('click', this.handleGlobalClick, { passive: true });
    document.addEventListener('touchstart', this.handleGlobalTouchStart, { passive: true });
  }

  // Stop the background cleanup process
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('touchend', this.handleGlobalTouchEnd);
    document.removeEventListener('mouseup', this.handleGlobalMouseUp);
    document.removeEventListener('touchcancel', this.handleGlobalTouchEnd);
    document.removeEventListener('mousemove', this.handleGlobalMouseMove);
    document.removeEventListener('touchmove', this.handleGlobalTouchMove);
    document.removeEventListener('click', this.handleGlobalClick);
    document.removeEventListener('touchstart', this.handleGlobalTouchStart);
  }

  // Register a drag indicator for tracking
  registerIndicator(element: HTMLElement): void {
    this.indicatorTimestamps.set(element, Date.now());
  }

  // Unregister a drag indicator (when properly cleaned up)
  unregisterIndicator(element: HTMLElement): void {
    this.indicatorTimestamps.delete(element);
  }

  // Force cleanup of all orphaned indicators
  forceCleanup(): void {
    this.cleanupOrphanedIndicators(true);
  }

  private cleanupOrphanedIndicators(force = false): void {
    const now = Date.now();
    const indicators = document.querySelectorAll('[style*="z-index: 2147483647"][style*="position: fixed"]');
    
    indicators.forEach(indicator => {
      const element = indicator as HTMLElement;
      
      // Check if it looks like a drag indicator (has text content that's a number)
      if (element.textContent && /^\d$/.test(element.textContent.trim())) {
        const timestamp = this.indicatorTimestamps.get(element);
        const age = timestamp ? now - timestamp : Infinity;
        
        // Remove if forced, too old, or not tracked (orphaned)
        if (force || age > this.options.maxAge || !timestamp) {
          try {
            if (document.body.contains(element)) {
              document.body.removeChild(element);
              console.log(`🎯 DragCleanup: Removed orphaned drag indicator (age: ${age}ms, forced: ${force})`);
            }
          } catch (error) {
            console.warn('🎯 DragCleanup: Failed to remove orphaned drag indicator:', error);
          }
          this.indicatorTimestamps.delete(element);
        }
      }
    });
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      // Page is hidden, clean up immediately
      this.cleanupOrphanedIndicators(true);
    }
  };

  private handleWindowFocus = (): void => {
    // Small delay to avoid interfering with other handlers
    setTimeout(() => this.cleanupOrphanedIndicators(true), 100);
  };

  private handleWindowBlur = (): void => {
    this.cleanupOrphanedIndicators(true);
  };

  private handleGlobalTouchEnd = (): void => {
    // Small delay to avoid interfering with component handlers
    setTimeout(() => this.cleanupOrphanedIndicators(), 50);
  };

  private handleGlobalMouseUp = (): void => {
    // Small delay to avoid interfering with component handlers
    setTimeout(() => this.cleanupOrphanedIndicators(), 50);
  };

  private handleGlobalMouseMove = (): void => {
    // Clean up on mouse movement (might indicate drag end)
    setTimeout(() => this.cleanupOrphanedIndicators(), 100);
  };

  private handleGlobalTouchMove = (): void => {
    // Clean up on touch movement (might indicate drag end)
    setTimeout(() => this.cleanupOrphanedIndicators(), 100);
  };

  private handleGlobalClick = (): void => {
    // Clean up on any click (might indicate interaction end)
    setTimeout(() => this.cleanupOrphanedIndicators(), 50);
  };

  private handleGlobalTouchStart = (): void => {
    // Clean up on touch start (might indicate new interaction)
    setTimeout(() => this.cleanupOrphanedIndicators(), 50);
  };
}

// Export singleton instance
export const dragCleanupManager = DragCleanupManager.getInstance();

// Utility functions for components to use
export const registerDragIndicator = (element: HTMLElement): void => {
  dragCleanupManager.registerIndicator(element);
};

export const unregisterDragIndicator = (element: HTMLElement): void => {
  dragCleanupManager.unregisterIndicator(element);
};

export const forceCleanupDragIndicators = (): void => {
  dragCleanupManager.forceCleanup();
};

// Start the cleanup manager when the module is imported
if (typeof window !== 'undefined') {
  // Start cleanup manager after a short delay to ensure DOM is ready
  setTimeout(() => {
    dragCleanupManager.start();
  }, 100);
  
  // Expose cleanup functions to window for debugging
  (window as any).dragCleanup = {
    forceCleanup: () => dragCleanupManager.forceCleanup(),
    start: () => dragCleanupManager.start(),
    stop: () => dragCleanupManager.stop(),
  };
} 