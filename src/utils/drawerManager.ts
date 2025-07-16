import { LayoutInfo } from './deviceDetection';

export interface DrawerManagerConfig {
  isMenuDrawerOpen: boolean;
  setIsMenuDrawerOpen: (open: boolean) => void;
  isSettingsDrawerOpen: boolean;
  setIsSettingsDrawerOpen: (open: boolean) => void;
  currentLayout: LayoutInfo;
}

export class DrawerManager {
  private config: DrawerManagerConfig;
  private resizeHandler?: () => void;
  private previousLayout?: LayoutInfo;

  constructor(config: DrawerManagerConfig) {
    this.config = config;
    this.previousLayout = config.currentLayout;
    this.initialize();
  }

  private initialize() {
    // Handle layout-specific drawer behavior
    this.handleLayoutChange();
    
    // Listen for layout changes
    this.resizeHandler = () => {
      this.handleLayoutChange();
    };
    
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.resizeHandler);
  }

  private handleLayoutChange() {
    const { currentLayout, setIsMenuDrawerOpen } = this.config;
    const previousLayout = this.previousLayout;

    // In iPad landscape mode, force menu drawer open
    if (currentLayout.isIpadLandscape) {
      setIsMenuDrawerOpen(true);
      console.log('📱 Drawer Manager: Forced menu drawer open for iPad landscape');
    }
    
    // Only close menu drawer when transitioning from landscape to portrait
    if (previousLayout?.orientation === 'landscape' && currentLayout.orientation === 'portrait') {
      setIsMenuDrawerOpen(false);
      console.log('📱 Drawer Manager: Transitioned from landscape to portrait - closed menu drawer');
    }
    
    // Update previous layout
    this.previousLayout = currentLayout;
  }

  /**
   * Toggle menu drawer
   */
  toggleMenuDrawer() {
    const { isMenuDrawerOpen, setIsMenuDrawerOpen, currentLayout } = this.config;
    
    // Don't allow closing in iPad landscape mode
    if (currentLayout.isIpadLandscape && isMenuDrawerOpen) {
      console.log('📱 Drawer Manager: Cannot close menu drawer in iPad landscape mode');
      return;
    }
    
    setIsMenuDrawerOpen(!isMenuDrawerOpen);
  }

  /**
   * Toggle settings drawer
   */
  toggleSettingsDrawer() {
    const { isSettingsDrawerOpen, setIsSettingsDrawerOpen } = this.config;
    setIsSettingsDrawerOpen(!isSettingsDrawerOpen);
  }

  /**
   * Close all drawers
   */
  closeAllDrawers() {
    const { setIsMenuDrawerOpen, setIsSettingsDrawerOpen, currentLayout } = this.config;
    
    setIsSettingsDrawerOpen(false);
    
    // Only close menu drawer if not in iPad landscape mode
    if (!currentLayout.isIpadLandscape) {
      setIsMenuDrawerOpen(false);
    }
  }

  /**
   * Apply auto-scaling to drawer content
   */
  applyDrawerScaling(drawerId: string, scaleFactor: number) {
    const drawer = document.querySelector(drawerId) as HTMLElement;
    if (!drawer) return;

    const drawerContent = drawer.querySelector('.drawer-content') as HTMLElement;
    if (drawerContent) {
      drawerContent.style.transform = `scale(${scaleFactor})`;
      drawerContent.style.transformOrigin = 'top left';
      console.log(`📱 Drawer Manager: Applied ${scaleFactor}x scaling to ${drawerId}`);
    }
  }

  /**
   * Position drawer for specific layout
   */
  positionDrawer(drawerId: string, position: { top?: string; left?: string; right?: string; width?: string; height?: string }) {
    const drawer = document.querySelector(drawerId) as HTMLElement;
    if (!drawer) return;

    Object.entries(position).forEach(([key, value]) => {
      if (value) {
        drawer.style.setProperty(key, value, 'important');
      }
    });

    console.log(`📱 Drawer Manager: Positioned ${drawerId}`, position);
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('orientationchange', this.resizeHandler);
    }
  }
} 