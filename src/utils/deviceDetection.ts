export interface LayoutInfo {
  device: 'ipad' | 'iphone';
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
  isIpadLandscape: boolean;
  isIpadPortrait: boolean;
  isIphonePortrait: boolean;
}

export class DeviceDetection {
  /**
   * Detect current device type and orientation
   */
  static getCurrentLayout(): LayoutInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;

    // Device detection logic
    const isIpad = width >= 768; // iPad detection

    const device: 'ipad' | 'iphone' = isIpad ? 'ipad' : 'iphone';
    const orientation: 'portrait' | 'landscape' = isPortrait ? 'portrait' : 'landscape';

    return {
      device,
      orientation,
      width,
      height,
      isIpadLandscape: device === 'ipad' && orientation === 'landscape',
      isIpadPortrait: device === 'ipad' && orientation === 'portrait',
      isIphonePortrait: device === 'iphone' && orientation === 'portrait'
    };
  }

  /**
   * Check if current layout matches specific criteria
   */
  static isLayout(device?: 'ipad' | 'iphone', orientation?: 'portrait' | 'landscape'): boolean {
    const current = this.getCurrentLayout();
    
    if (device && current.device !== device) return false;
    if (orientation && current.orientation !== orientation) return false;
    
    return true;
  }

  /**
   * Get safe area information
   */
  static getSafeAreaInfo() {
    const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0px';
    const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0px';
    const safeAreaLeft = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left') || '0px';
    const safeAreaRight = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') || '0px';

    return {
      top: parseInt(safeAreaTop) || 0,
      bottom: parseInt(safeAreaBottom) || 0,
      left: parseInt(safeAreaLeft) || 0,
      right: parseInt(safeAreaRight) || 0
    };
  }

  /**
   * Log current layout information for debugging
   */
  static logLayoutInfo() {
    const layout = this.getCurrentLayout();
    const safeArea = this.getSafeAreaInfo();
    
    console.log('📱 Layout Info:', {
      device: layout.device,
      orientation: layout.orientation,
      viewport: `${layout.width}x${layout.height}`,
      safeArea,
      flags: {
        isIpadLandscape: layout.isIpadLandscape,
        isIpadPortrait: layout.isIpadPortrait,
        isIphonePortrait: layout.isIphonePortrait
      }
    });
  }
} 