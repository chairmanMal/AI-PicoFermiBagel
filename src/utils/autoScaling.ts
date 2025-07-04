import { LayoutInfo } from './deviceDetection';

export interface ScalingConfig {
  targetWidth?: number;
  targetHeight?: number;
  minScale?: number;
  maxScale?: number;
  respectAspectRatio?: boolean;
}

export class AutoScaling {
  /**
   * Calculate optimal scale factor for given dimensions
   */
  static calculateScaleFactor(
    containerWidth: number,
    containerHeight: number,
    contentWidth: number,
    contentHeight: number,
    config: ScalingConfig = {}
  ): number {
    const {
      minScale = 0.1,
      maxScale = 3.0,
      respectAspectRatio = true
    } = config;

    let scaleX = containerWidth / contentWidth;
    let scaleY = containerHeight / contentHeight;

    let scale: number;
    
    if (respectAspectRatio) {
      // Use the smaller scale to ensure content fits in both dimensions
      scale = Math.min(scaleX, scaleY);
    } else {
      // Use average scale
      scale = (scaleX + scaleY) / 2;
    }

    // Clamp to min/max bounds
    scale = Math.max(minScale, Math.min(maxScale, scale));

    return scale;
  }

  /**
   * Apply scaling to an element
   */
  static applyScaling(
    element: HTMLElement,
    scaleFactor: number,
    origin: string = 'top left'
  ): void {
    element.style.transform = `scale(${scaleFactor})`;
    element.style.transformOrigin = origin;
    
    console.log(`🔧 Auto Scaling: Applied ${scaleFactor.toFixed(3)}x scale to element`);
  }

  /**
   * Calculate layout-specific scaling
   */
  static getLayoutScaling(layout: LayoutInfo, baseScale: number = 1.0): number {
    const { device, orientation, width, height } = layout;

    let scaleFactor = baseScale;

    if (device === 'ipad') {
      if (orientation === 'landscape') {
        // iPad landscape: More conservative scaling
        scaleFactor = Math.min(width / 1200, height / 800) * 0.8;
      } else {
        // iPad portrait: Moderate scaling
        scaleFactor = Math.min(width / 800, height / 1200) * 0.9;
      }
    } else {
      // iPhone: More aggressive scaling
      if (orientation === 'portrait') {
        scaleFactor = Math.min(width / 400, height / 800) * 1.1;
      }
    }

    // Clamp to reasonable bounds
    return Math.max(0.5, Math.min(2.0, scaleFactor));
  }

  /**
   * Auto-scale content to fit container
   */
  static autoFitContent(
    containerSelector: string,
    contentSelector: string,
    config: ScalingConfig = {}
  ): boolean {
    const container = document.querySelector(containerSelector) as HTMLElement;
    const content = document.querySelector(contentSelector) as HTMLElement;

    if (!container || !content) {
      console.warn(`🔧 Auto Scaling: Could not find container (${containerSelector}) or content (${contentSelector})`);
      return false;
    }

    const containerRect = container.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    const scaleFactor = this.calculateScaleFactor(
      containerRect.width,
      containerRect.height,
      contentRect.width,
      contentRect.height,
      config
    );

    this.applyScaling(content, scaleFactor);
    return true;
  }

  /**
   * Reset scaling on an element
   */
  static resetScaling(element: HTMLElement): void {
    element.style.transform = 'none';
    element.style.transformOrigin = '';
    console.log('🔧 Auto Scaling: Reset scaling on element');
  }

  /**
   * Get responsive font size based on viewport
   */
  static getResponsiveFontSize(
    baseSize: number,
    layout: LayoutInfo,
    minSize: number = 12,
    maxSize: number = 48
  ): number {
    const scaleFactor = this.getLayoutScaling(layout);
    const fontSize = baseSize * scaleFactor;
    
    return Math.max(minSize, Math.min(maxSize, fontSize));
  }

  /**
   * Apply responsive spacing based on layout
   */
  static getResponsiveSpacing(
    baseSpacing: number,
    layout: LayoutInfo,
    minSpacing: number = 4,
    maxSpacing: number = 40
  ): number {
    const scaleFactor = this.getLayoutScaling(layout);
    const spacing = baseSpacing * scaleFactor;
    
    return Math.max(minSpacing, Math.min(maxSpacing, spacing));
  }
} 