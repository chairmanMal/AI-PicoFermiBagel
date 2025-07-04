import { LayoutInfo } from './deviceDetection';

export interface TouchHandlerConfig {
  element: HTMLElement;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  currentLayout: LayoutInfo;
}

export class TouchHandler {
  private config: TouchHandlerConfig;
  private swipeStart: { x: number; y: number; time: number } | null = null;
  private touchStartHandler?: (e: TouchEvent) => void;
  private touchEndHandler?: (e: TouchEvent) => void;

  // Swipe detection thresholds
  private readonly MIN_SWIPE_DISTANCE = 50;
  private readonly MAX_SWIPE_TIME = 300;
  private readonly MAX_VERTICAL_DEVIATION = 100;

  constructor(config: TouchHandlerConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize() {
    this.touchStartHandler = (e: TouchEvent) => this.handleTouchStart(e);
    this.touchEndHandler = (e: TouchEvent) => this.handleTouchEnd(e);

    this.config.element.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    this.config.element.addEventListener('touchend', this.touchEndHandler, { passive: true });

    console.log('👆 Touch Handler: Initialized for', this.config.currentLayout);
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    this.swipeStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }

  private handleTouchEnd(e: TouchEvent) {
    if (!this.swipeStart || e.changedTouches.length !== 1) {
      this.swipeStart = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.swipeStart.x;
    const deltaY = touch.clientY - this.swipeStart.y;
    const deltaTime = Date.now() - this.swipeStart.time;

    this.swipeStart = null;

    // Check if it's a valid swipe
    if (deltaTime > this.MAX_SWIPE_TIME) return;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Must be primarily horizontal for left/right swipes
    if (absX < this.MIN_SWIPE_DISTANCE) return;
    if (absY > this.MAX_VERTICAL_DEVIATION) return;

    // Determine swipe direction and handle
    if (deltaX > 0) {
      // Swipe right
      this.handleSwipeRight();
    } else {
      // Swipe left
      this.handleSwipeLeft();
    }
  }

  private handleSwipeLeft() {
    const { currentLayout, onSwipeLeft } = this.config;
    
    // Only handle swipes in portrait mode
    if (currentLayout.orientation !== 'portrait') return;
    
    console.log('👆 Touch Handler: Swipe left detected');
    onSwipeLeft?.();
  }

  private handleSwipeRight() {
    const { currentLayout, onSwipeRight } = this.config;
    
    // Only handle swipes in portrait mode
    if (currentLayout.orientation !== 'portrait') return;
    
    console.log('👆 Touch Handler: Swipe right detected');
    onSwipeRight?.();
  }

  /**
   * Update layout information
   */
  updateLayout(newLayout: LayoutInfo) {
    this.config.currentLayout = newLayout;
    console.log('👆 Touch Handler: Layout updated to', newLayout);
  }

  /**
   * Enable/disable touch handling
   */
  setEnabled(enabled: boolean) {
    if (enabled) {
      if (!this.touchStartHandler || !this.touchEndHandler) {
        this.initialize();
      }
    } else {
      this.cleanup();
    }
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    if (this.touchStartHandler) {
      this.config.element.removeEventListener('touchstart', this.touchStartHandler);
    }
    if (this.touchEndHandler) {
      this.config.element.removeEventListener('touchend', this.touchEndHandler);
    }
    
    this.touchStartHandler = undefined;
    this.touchEndHandler = undefined;
    this.swipeStart = null;
    
    console.log('👆 Touch Handler: Cleaned up');
  }
} 