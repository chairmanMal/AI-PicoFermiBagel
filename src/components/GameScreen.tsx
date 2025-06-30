import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, Menu, Settings } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
// import { getBuildString, getBuildDateString } from '../config/version'; // Removed for production
import { soundUtils } from '../utils/soundUtils';
import GuessArea from './GuessArea';
import SelectionArea from './SelectionArea';
import CircularSubmitButton from './CircularSubmitButton';
import RecentGuessHistory from './RecentGuessHistory';

import ScoreArea from './ScoreArea';
import Scratchpad from './Scratchpad';
import MenuArea from './MenuArea';
import TargetDisplay from './TargetDisplay';
import HintPurchasing from './HintPurchasing';
import CustomScrollIndicator from './CustomScrollIndicator';
import './GameScreen.css';

const GameScreen: React.FC = () => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [useDrawer, setUseDrawer] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  const { gameState, settings, dispatch, resetAllSettings } = useGameStore();

  // Refs for dynamic positioning
  const guessElementRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const mobileDrawerContentRef = useRef<HTMLDivElement>(null);

  // Swipe gesture state
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gameScreenRef = useRef<HTMLDivElement>(null);

  // JavaScript-based iPad layout functions
  const applyIpadLandscapeLayout = useCallback(() => {
    console.log('🎯 Applying iPad landscape layout with JavaScript');
    
    // Debug: Check if elements exist
    const elements = {
      container: !!document.querySelector('.container'),
      mobileDrawer: !!document.querySelector('.mobile-drawer'),
      submitSidebar: !!document.querySelector('.submit-section-sidebar'),
      submitInline: !!document.querySelector('.submit-section-inline'),
      mainContent: !!document.querySelector('.main-content'),
      titleSection: !!document.querySelector('.title-section')
    };
    console.log('🎯 LANDSCAPE: Elements found:', elements);
    
    // Calculate optimal scaling for iPad landscape - fixed layout
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const availableWidth = viewportWidth - 10; // 5px each side
    
    // Base column widths - much smaller to prevent overlap
    const baseScaleFactor = 0.6; // Reduced from 0.8 to prevent overlap
    const baseColumnWidth = 220; // Reduced base size
    const gapWidth = 5; // Exactly 5px gaps
    const totalGaps = 2 * gapWidth; // 2 gaps between 3 columns
    
    // Calculate column widths - no relative scaling to prevent overlap
    const col1Width = baseColumnWidth; // Base size
    const col2Width = baseColumnWidth; // Same size as others to prevent overlap
    const col3Width = baseColumnWidth; // Same size
    const totalContentWidth = col1Width + col2Width + col3Width + totalGaps;
    
    // Calculate scale factor to fit within available width
    const scaleFactor = Math.min(availableWidth / totalContentWidth, baseScaleFactor);
    
    // Final scaled widths - ensure no overlap
    const finalCol1Width = col1Width * scaleFactor;
    const finalCol2Width = col2Width * scaleFactor; // Same as col1 to prevent overlap
    const finalCol3Width = col3Width * scaleFactor;
    const finalTotalWidth = finalCol1Width + finalCol2Width + finalCol3Width + totalGaps;
    
    console.log('🎯 LANDSCAPE SCALING CALCULATION:', {
      viewport: `${viewportWidth}x${viewportHeight}`,
      availableWidth,
      baseColumnWidth,
      totalContentWidth,
      scaleFactor: scaleFactor.toFixed(3),
      finalWidths: {
        col1: finalCol1Width.toFixed(1),
        col2: finalCol2Width.toFixed(1), 
        col3: finalCol3Width.toFixed(1),
        total: finalTotalWidth.toFixed(1)
      },
      leftOffset: ((availableWidth - finalTotalWidth) / 2).toFixed(1)
    });
    
    const container = document.querySelector('.container') as HTMLElement;
    const submitSidebar = document.querySelector('.submit-section-sidebar') as HTMLElement;
    const submitInline = document.querySelector('.submit-section-inline') as HTMLElement;
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    const titleSection = document.querySelector('.title-section') as HTMLElement;
    
    if (container) {
      // Apply three-column flexbox layout with proper spacing
      const leftOffset = (availableWidth - finalTotalWidth) / 2;
      
      container.style.display = 'flex';
      container.style.flexDirection = 'row';
      container.style.justifyContent = 'flex-start';
      container.style.alignItems = 'flex-start';
      container.style.gap = `${gapWidth}px`;
      container.style.margin = '0';
      container.style.padding = `40px 5px 5px ${5 + leftOffset}px`; // 5px sides, center content
      container.style.height = '100vh'; // Full viewport height
      container.style.minHeight = '100vh';
      container.style.boxSizing = 'border-box';
      container.style.width = '100vw'; // Full viewport width
      container.style.maxWidth = 'none';
      // container.style.border = '5px solid lime'; // Debug - removed for production
      // container.style.background = 'rgba(0,255,0,0.2)'; // Debug - removed for production
    }
    
    if (titleSection) {
      // Position title to span entire display width
      titleSection.style.position = 'absolute';
      titleSection.style.top = '5px'; // 5px from top
      titleSection.style.left = '5px'; // 5px from left edge
      titleSection.style.right = '5px'; // 5px from right edge
      titleSection.style.width = 'calc(100vw - 10px)'; // Full width minus 5px each side
      titleSection.style.transform = 'none';
      titleSection.style.zIndex = '10';
      titleSection.style.textAlign = 'center';
      titleSection.style.margin = '0';
      // titleSection.style.border = '2px solid yellow'; // Debug - removed for production
    }
    
    if (mainContent) {
      // Main content column (Guess + Number Selection) - 1x scale with 5px margin
      mainContent.style.flex = `0 0 ${finalCol1Width}px`;
      mainContent.style.width = `${finalCol1Width}px`;
      mainContent.style.minWidth = `${finalCol1Width}px`;
      mainContent.style.maxWidth = `${finalCol1Width}px`;
      mainContent.style.marginTop = '120px';
      mainContent.style.margin = '5px'; // 5px margin on all sides
      mainContent.style.marginTop = '80px'; // More space from title
      mainContent.style.transform = `scale(${scaleFactor})`;
      mainContent.style.transformOrigin = 'top left';
              // mainContent.style.border = '2px solid orange'; // Debug - removed for production
    }
    
    if (submitSidebar && submitInline) {
      // Show sidebar submit (middle column), hide inline submit - 1.2x scale with 5px margin
      console.log('🎯 LANDSCAPE: Setting up submit sidebar with 1.2x scale');
      submitSidebar.style.display = 'flex';
      submitInline.style.display = 'none';
      submitSidebar.style.flex = `0 0 ${finalCol2Width}px`;
      submitSidebar.style.width = `${finalCol2Width}px`;
      submitSidebar.style.minWidth = `${finalCol2Width}px`;
      submitSidebar.style.maxWidth = `${finalCol2Width}px`;
      submitSidebar.style.flexDirection = 'column';
      submitSidebar.style.justifyContent = 'flex-start';
      submitSidebar.style.alignItems = 'center';
      submitSidebar.style.height = 'fit-content';
      submitSidebar.style.transformOrigin = 'top left';
      submitSidebar.style.transform = `scale(${scaleFactor})`; // Same scaling as other columns
      submitSidebar.style.margin = '5px'; // 5px margin on all sides
      submitSidebar.style.marginTop = '80px'; // More space from title
              // submitSidebar.style.border = '3px solid red'; // Debug - removed for production
    } else {
      console.log('🎯 LANDSCAPE: Submit elements not found', {
        submitSidebar: !!submitSidebar,
        submitInline: !!submitInline
      });
    }
    
    // Try to find mobile drawer with retries since it might not be rendered yet
    const setupMobileDrawer = () => {
      const drawer = document.querySelector('.mobile-drawer') as HTMLElement;
      if (drawer) {
        console.log('🎯 LANDSCAPE: Found mobile drawer, setting up with 1x scale...');
        // Position drawer as third column (always open) - 1x scale
        drawer.style.display = 'flex';
        drawer.style.position = 'static';
        drawer.style.transform = `scale(${scaleFactor})`;
        drawer.style.transformOrigin = 'top left';
        drawer.style.flex = `0 0 ${finalCol3Width}px`;
        drawer.style.width = `${finalCol3Width}px`;
        drawer.style.minWidth = `${finalCol3Width}px`;
        drawer.style.maxWidth = `${finalCol3Width}px`;
        drawer.style.height = 'calc(100vh - 85px)'; // Full height from content start to bottom
        drawer.style.maxHeight = 'none';
        drawer.style.alignSelf = 'flex-start';
        drawer.style.margin = '5px'; // 5px margin on all sides
        drawer.style.marginTop = '80px'; // Start below title
        drawer.style.marginRight = '5px'; // Maximum 5px right margin
        drawer.style.background = 'transparent';
        // drawer.style.border = '3px solid purple'; // Debug - removed for production
        return true;
      }
      return false;
    };
    
    if (!setupMobileDrawer()) {
      console.log('🎯 LANDSCAPE: Mobile drawer not found immediately, retrying...');
      // Retry after a short delay
      setTimeout(() => {
        if (!setupMobileDrawer()) {
          console.log('🎯 LANDSCAPE: Mobile drawer still not found after retry');
        }
      }, 100);
    }
    
    // Setup drawer content if drawer was found
    const setupDrawerContent = () => {
      const drawer = document.querySelector('.mobile-drawer') as HTMLElement;
      if (drawer) {
        const drawerHeader = drawer.querySelector('.drawer-header') as HTMLElement;
        const drawerContent = drawer.querySelector('.drawer-content') as HTMLElement;
        
        // Hide drawer header (no close button needed)
        if (drawerHeader) {
          drawerHeader.style.display = 'none';
        }
        
        // Also hide any close buttons within the drawer
        const closeButtons = drawer.querySelectorAll('.drawer-close');
        closeButtons.forEach(button => {
          (button as HTMLElement).style.display = 'none';
        });
        
        // Make drawer content fill the entire vertical range
        if (drawerContent) {
          drawerContent.style.height = 'calc(100vh - 90px)'; // Full height matching drawer
          drawerContent.style.flex = '1';
          drawerContent.style.paddingTop = '0';
          drawerContent.style.marginTop = '0';
          drawerContent.style.background = 'transparent';
          drawerContent.style.boxShadow = 'none';
          drawerContent.style.borderRadius = '0';
          drawerContent.style.padding = '5px'; // Minimal padding
          drawerContent.style.overflowY = 'auto';
          drawerContent.style.scrollbarWidth = 'thick';
          drawerContent.style.scrollbarColor = '#475569 #e2e8f0';
          drawerContent.style.transform = `scale(${scaleFactor})`; // Match other columns
          drawerContent.style.transformOrigin = 'top left';
        }
      }
    };
    
    // Setup drawer content with retry
    setTimeout(setupDrawerContent, 50);
    
    // Hide hamburger menu button since drawer is always open
    const hamburgerButton = document.querySelector('.drawer-toggle-top-right') as HTMLElement;
    if (hamburgerButton) {
      hamburgerButton.style.display = 'none';
    }
    
    // Hide the close button that appears when drawer is open
    const closeButton = document.querySelector('.drawer-close') as HTMLElement;
    if (closeButton) {
      closeButton.style.display = 'none';
    }
    
    // Force the menu drawer to be open in landscape mode
    setIsMenuDrawerOpen(true);
  }, [setIsMenuDrawerOpen]);

  const applyIpadPortraitLayout = useCallback(() => {
    // console.log('🎯 🚨 ========= APPLYING IPAD PORTRAIT LAYOUT WITH JAVASCRIPT ========= 🚨');
    // console.log('🎯 🚨 VIEWPORT:', `${window.innerWidth}x${window.innerHeight}`);
    
    // Reset body/html scrolling (in case coming from iPhone portrait)
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    const container = document.querySelector('.container') as HTMLElement;
    const mobileDrawer = document.querySelector('.mobile-drawer') as HTMLElement;
    const submitSidebar = document.querySelector('.submit-section-sidebar') as HTMLElement;
    const submitInline = document.querySelector('.submit-section-inline') as HTMLElement;
    // In iPad portrait mode, we use .orange-portrait-container instead of .main-content
    const orangeContainer = document.querySelector('.orange-portrait-container') as HTMLElement;
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    const titleSection = document.querySelector('.title-section') as HTMLElement;
    
    console.log('🎯 ELEMENTS FOUND:', {
      container: !!container,
      gameScreen: !!document.querySelector('.game-screen'),
      orangeContainer: !!orangeContainer,
      mainContent: !!mainContent,
      titleSection: !!titleSection
    });
    
    // First, modify the parent game-screen to allow absolute positioning
    const gameScreen = document.querySelector('.game-screen') as HTMLElement;
    if (gameScreen) {
      gameScreen.style.cssText = 'display: block !important; position: relative !important; overflow: visible !important;';
      console.log('🎯 🚨 PORTRAIT: FORCED game-screen to block positioning with cssText');
    } else {
      console.log('🎯 ❌ PORTRAIT: Game screen element NOT FOUND');
      return; // Exit if we can't find the basic elements
    }
    
    if (container) {
      // Single column layout, elements self-center within full display
      // Container extends horizontally from left side of settings icon to right side of hamburger icon
      // Vertically from top of screen down to orange border boundary
      
      // Settings icon: 4px from left + safe area, 48px wide (doubled margin)
      // Hamburger icon: 4px from right + safe area, 48px wide (doubled margin)
      const settingsIconLeft = 4; // Doubled from 2px to 4px
      const hamburgerIconRight = 4; // Doubled from 2px to 4px
      const containerLeft = settingsIconLeft; // Start at left side of settings icon
      const containerRight = hamburgerIconRight; // End at right side of hamburger icon
      const containerWidth = `calc(100vw - ${containerLeft + containerRight}px)`; // Full width minus icon margins
      
      console.log('🎯 🚨 APPLYING CONTAINER STYLES:', {
        position: 'absolute',
        top: '0px',
        left: `${containerLeft}px`,
        width: containerWidth,
        height: '100vh'
      });
      
      // Apply styles with !important to force them
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('flex-direction', 'column', 'important');
      container.style.setProperty('justify-content', 'flex-start', 'important');
      container.style.setProperty('align-items', 'center', 'important');
      container.style.setProperty('gap', '20px', 'important');
      container.style.setProperty('margin', '0', 'important');
      container.style.setProperty('padding', '0px', 'important');
      container.style.setProperty('position', 'absolute', 'important');
      container.style.setProperty('top', '0px', 'important');
      container.style.setProperty('left', `${containerLeft}px`, 'important');
      container.style.setProperty('width', containerWidth, 'important');
      container.style.setProperty('height', '100vh', 'important');
      container.style.setProperty('min-height', '100vh', 'important');
      container.style.setProperty('max-width', 'none', 'important');
      container.style.setProperty('box-sizing', 'border-box', 'important');
      // container.style.setProperty('border', '5px solid lime', 'important'); // Debug - removed for production
      // container.style.setProperty('background', 'rgba(0,255,0,0.2)', 'important'); // Debug - removed for production
      
      console.log('🎯 🚨 FORCED CONTAINER POSITIONING FROM SETTINGS TO HAMBURGER ICON');
      
      // Verify the styles were applied
      setTimeout(() => {
        const computedStyle = window.getComputedStyle(container);
        console.log('🎯 🔍 CONTAINER COMPUTED STYLES:', {
          position: computedStyle.position,
          top: computedStyle.top,
          left: computedStyle.left,
          width: computedStyle.width,
          height: computedStyle.height,
          display: computedStyle.display
        });
      }, 100);
    } else {
      console.log('🎯 ❌ PORTRAIT: Container element NOT FOUND');
    }
    
    if (titleSection) {
      // Position title below the icon area - icons are 48px tall + 20px top margin = 68px from top
      // Add some extra space for visual separation
      const iconAreaHeight = 68; // 20px margin + 48px icon height
      const titleTopMargin = iconAreaHeight + 20; // Extra 20px for spacing
      
      titleSection.style.position = 'static';
      titleSection.style.top = '';
      titleSection.style.left = '';
      titleSection.style.transform = '';
      titleSection.style.zIndex = '10'; // Ensure it's above other content
      titleSection.style.width = '100%';
      titleSection.style.textAlign = 'center';
      titleSection.style.margin = `${titleTopMargin}px 0 30px 0`; // Top margin to clear icons + bottom spacing
      titleSection.style.display = 'block'; // Ensure it's visible
      titleSection.style.visibility = 'visible'; // Ensure it's visible
      titleSection.style.opacity = '1'; // Ensure it's visible
      // titleSection.style.border = '2px solid yellow'; // Debug - removed for production
      console.log(`🎯 PORTRAIT: Title section positioned with ${titleTopMargin}px top margin to clear icons`);
      
      // Position the orange container correctly after title is positioned
      setTimeout(() => {
        const orangeContainer = document.querySelector('.orange-portrait-container') as HTMLElement;
        if (orangeContainer) {
          const titleRect = titleSection.getBoundingClientRect();
          const subtitleBottom = titleRect.bottom + 10; // Add small gap below subtitle
          const bottomMargin = 20; // 20px from bottom of screen
          const newTop = subtitleBottom;
          const newHeight = window.innerHeight - subtitleBottom - bottomMargin; // End 20px from bottom
          
          // Update positioning with proper constraints - match green container (doubled margins)
          const containerLeft = 4; // Doubled from 2px to 4px
          const containerWidth = `calc(100vw - 8px)`; // Doubled from 4px to 8px
          
          orangeContainer.style.setProperty('position', 'fixed', 'important'); // Fixed to viewport
          orangeContainer.style.setProperty('top', `${newTop}px`, 'important');
          orangeContainer.style.setProperty('height', `${newHeight}px`, 'important');
          orangeContainer.style.setProperty('width', containerWidth, 'important');
          orangeContainer.style.setProperty('left', `${containerLeft}px`, 'important');
          orangeContainer.style.setProperty('right', 'auto', 'important');
          
          console.log(`🎯 ✅ PORTRAIT: Positioned orange container - top: ${newTop}px, height: ${newHeight}px, width: ${containerWidth}, left: ${containerLeft}px`);
          
          // Apply auto-scaling to content after positioning is complete
          setTimeout(() => {
            const gameWrapper = orangeContainer.querySelector('.game-sections-wrapper') as HTMLElement;
            if (gameWrapper) {
              // Reset any existing transforms
              gameWrapper.style.transform = '';
              gameWrapper.style.transformOrigin = 'top center';
              
              // Force layout calculation by accessing offsetHeight
              gameWrapper.offsetHeight;
              
              // Measure content and container
              const containerRect = orangeContainer.getBoundingClientRect();
              const contentHeight = gameWrapper.scrollHeight;
              const contentWidth = gameWrapper.scrollWidth;
              
              // Calculate available space (no padding subtraction - use full container)
              const availableHeight = containerRect.height;
              const availableWidth = containerRect.width;
              
              // Calculate scale factors
              const scaleX = availableWidth / contentWidth;
              const scaleY = availableHeight / contentHeight;
              const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
              
              console.log(`🎯 🔍 AUTO-SCALING ORANGE CONTAINER:`, {
                containerSize: `${containerRect.width.toFixed(0)}x${containerRect.height.toFixed(0)}`,
                contentSize: `${contentWidth}x${contentHeight}`,
                availableSize: `${availableWidth.toFixed(0)}x${availableHeight.toFixed(0)}`,
                scaleX: scaleX.toFixed(3),
                scaleY: scaleY.toFixed(3),
                finalScale: scale.toFixed(3),
                willScale: scale < 1 ? 'YES' : 'NO',
                contentOverflow: contentHeight > availableHeight ? 'HEIGHT' : contentWidth > availableWidth ? 'WIDTH' : 'NONE'
              });
              
              // Apply scaling if content doesn't fit
              if (scale < 1) {
                gameWrapper.style.transform = `scale(${scale})`;
                gameWrapper.style.transformOrigin = 'top center';
                console.log(`🎯 ✅ Applied auto-scaling: ${scale.toFixed(3)}x to orange container content`);
              } else {
                console.log(`🎯 ✅ No scaling needed - content fits perfectly`);
              }
            }
          }, 200); // Longer delay to ensure all content is rendered
        }
      }, 100); // Allow time for title positioning to complete
    }
    
    // In iPad portrait mode, we work with the orange container, not main content
    const contentContainer = orangeContainer || mainContent;
    
    if (contentContainer) {
      console.log(`🎯 ✅ PORTRAIT: Found content container (${orangeContainer ? 'orange-portrait-container' : 'main-content'})`);
      
      // For the orange container, we don't need to reposition it since it's already positioned correctly in JSX
      // We just need to ensure the scaling works properly
      if (orangeContainer) {
        console.log('🎯 ✅ PORTRAIT: Orange container found and already positioned via JSX - no repositioning needed');
        
        // Apply dynamic scaling based on game mode
        const targetLength = settings.targetLength || 3;
        let baseScaleFactor = 1.0; // Default scale
        
        if (targetLength <= 3) {
          baseScaleFactor = 1.4; // 3-digit mode - largest scale
        } else if (targetLength <= 6) {
          baseScaleFactor = 1.2; // 6-digit mode - medium scale  
        } else {
          baseScaleFactor = 1.0; // 9+ digit mode - smallest scale
        }
        
        // Apply scaling to the game content wrapper inside the orange container
        const gameWrapper = orangeContainer.querySelector('.game-sections-wrapper') as HTMLElement;
        if (gameWrapper) {
          gameWrapper.style.setProperty('transform', `scale(${baseScaleFactor})`, 'important');
          gameWrapper.style.setProperty('transform-origin', 'top center', 'important');
          console.log(`🎯 ✅ PORTRAIT: Applied ${baseScaleFactor}x scaling to game content for ${targetLength}-digit mode`);
        }
      } else if (mainContent) {
        // Legacy fallback for main content (shouldn't happen in iPad portrait but keep for safety)
        console.log('🎯 ⚠️ PORTRAIT: Using fallback main content positioning');
        // ... existing positioning code would go here if needed
      }
    } else {
      console.log('🎯 ❌ PORTRAIT: No content container found (neither orange-portrait-container nor main-content)');
    }
    
    if (submitSidebar && submitInline) {
      // Show inline submit, hide sidebar submit
      submitSidebar.style.display = 'none';
      submitInline.style.display = 'block';
      // Reset sidebar styles
      submitSidebar.style.flex = '';
      submitSidebar.style.width = '';
      submitSidebar.style.flexDirection = '';
      submitSidebar.style.justifyContent = '';
      submitSidebar.style.alignItems = '';
      submitSidebar.style.height = '';
      submitSidebar.style.transformOrigin = '';
      submitSidebar.style.transform = '';
      submitSidebar.style.marginTop = '';
      submitSidebar.style.margin = ''; // Reset any margin styles
      submitSidebar.style.border = '';
    }
    
    // Ensure both drawers are closed by default
    if (mobileDrawer) {
      mobileDrawer.style.display = '';
      mobileDrawer.style.position = '';
      mobileDrawer.style.transform = '';
      mobileDrawer.style.flex = '';
      mobileDrawer.style.width = '';
      mobileDrawer.style.height = '';
      mobileDrawer.style.maxHeight = '';
      mobileDrawer.style.alignSelf = '';
      mobileDrawer.style.marginTop = '';
      mobileDrawer.style.background = '';
      mobileDrawer.style.border = '';
      
      // Reset drawer content
      const drawerContent = mobileDrawer.querySelector('.drawer-content') as HTMLElement;
      const drawerHeader = mobileDrawer.querySelector('.drawer-header') as HTMLElement;
      if (drawerContent) {
        drawerContent.style.height = '';
        drawerContent.style.flex = '';
        drawerContent.style.paddingTop = '';
        drawerContent.style.marginTop = '';
        drawerContent.style.background = '';
        drawerContent.style.boxShadow = '';
        drawerContent.style.borderRadius = '';
        drawerContent.style.padding = '';
        drawerContent.style.overflowY = '';
        drawerContent.style.scrollbarWidth = '';
        drawerContent.style.scrollbarColor = '';
      }
      if (drawerHeader) {
        drawerHeader.style.display = '';
      }
    }
    
    // Show hamburger menu button
    const hamburgerButton = document.querySelector('.drawer-toggle-top-right') as HTMLElement;
    if (hamburgerButton) {
      hamburgerButton.style.display = '';
    }
    
    // Configure settings drawer for iPad portrait mode
    const settingsDrawer = document.querySelector('.settings-drawer') as HTMLElement;
    if (settingsDrawer) {
      // Make settings drawer 50% wider and extend to bottom minus 20px
      settingsDrawer.style.setProperty('width', 'clamp(450px, 60vw, 630px)', 'important'); // 50% wider than default
      settingsDrawer.style.setProperty('height', 'calc(100vh - 20px)', 'important'); // Extend to bottom minus 20px
      settingsDrawer.style.setProperty('top', '0px', 'important');
      settingsDrawer.style.setProperty('left', '0px', 'important');
      settingsDrawer.style.setProperty('right', 'auto', 'important'); // Ensure it's not positioned from right
    }

    // Configure settings drawer content to start below icon and extend to bottom
    const settingsDrawerContent = document.querySelector('.settings-drawer .drawer-content') as HTMLElement;
    if (settingsDrawerContent) {
      settingsDrawerContent.style.height = 'auto'; // Let content determine height
      settingsDrawerContent.style.minHeight = 'calc(100vh - 88px - 20px)'; // Minimum height to bottom
      settingsDrawerContent.style.maxHeight = 'calc(100vh - 88px - 20px)'; // Maximum height to bottom
      settingsDrawerContent.style.marginTop = '88px'; // Start below icon (20+48+20 margin)
      settingsDrawerContent.style.paddingTop = '0px'; // No extra padding
      settingsDrawerContent.style.transform = 'scale(0.85)'; // Scale down to fit content properly
      settingsDrawerContent.style.transformOrigin = 'top left'; // Scale from top-left
      settingsDrawerContent.style.overflowY = 'auto'; // Ensure scrolling works
      settingsDrawerContent.style.background = 'white'; // Keep white background for settings drawer
    }

    // Configure menu drawer (right drawer) for iPad portrait mode - identical to settings drawer
    const menuDrawer = document.querySelector('.mobile-drawer') as HTMLElement;
    if (menuDrawer) {
      menuDrawer.style.setProperty('width', 'clamp(450px, 60vw, 630px)', 'important'); // Same width as settings drawer
      menuDrawer.style.setProperty('height', 'calc(100vh - 20px)', 'important'); // Extend to bottom minus 20px
      menuDrawer.style.setProperty('top', '0px', 'important'); // Same positioning as settings drawer
      menuDrawer.style.setProperty('right', '0px', 'important'); // Right side positioning
      menuDrawer.style.setProperty('left', 'auto', 'important'); // Ensure it's not positioned from left
    }

    // Hide menu drawer header to match settings drawer behavior
    const menuDrawerHeader = document.querySelector('.mobile-drawer .drawer-header') as HTMLElement;
    if (menuDrawerHeader) {
      menuDrawerHeader.style.display = 'none'; // Hide header like settings drawer
    }

    // Configure menu drawer content to shrink to fit content or make extra space transparent
    const menuDrawerContent = document.querySelector('.mobile-drawer .drawer-content') as HTMLElement;
    if (menuDrawerContent) {
      menuDrawerContent.style.height = 'auto'; // Let content determine height
      menuDrawerContent.style.minHeight = 'auto'; // Allow content to determine minimum height
      menuDrawerContent.style.maxHeight = 'calc(100vh - 88px - 20px)'; // Maximum height to bottom
      menuDrawerContent.style.marginTop = '88px'; // Start below icon (20+48+20 margin)
      menuDrawerContent.style.paddingTop = '0px'; // No extra padding
      menuDrawerContent.style.transform = 'scale(0.85)'; // Scale down to fit content properly
      menuDrawerContent.style.transformOrigin = 'top left'; // Scale from top-left
      menuDrawerContent.style.overflowY = 'auto'; // Ensure scrolling works
      menuDrawerContent.style.background = 'white'; // Keep white background for content
      
      // Create a transparent background container for the entire drawer area
      const drawerContainer = menuDrawerContent.parentElement;
      if (drawerContainer) {
        drawerContainer.style.background = 'transparent'; // Make container background transparent
      }
    }

    // Ensure drawers are closed
    setIsMenuDrawerOpen(false);
    setIsSettingsDrawerOpen(false);
    
    // Apply styles multiple times with delays to combat any potential overrides
    setTimeout(() => {
      console.log('🎯 🚨 RE-APPLYING STYLES AFTER 100ms');
      if (container && container.style.position !== 'absolute') {
        container.style.cssText = `
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          align-items: center !important;
          gap: 20px !important;
          margin: 0 !important;
          padding: 0px !important;
          position: absolute !important;
          top: 0px !important;
          left: 4px !important;
          width: calc(100vw - 8px) !important;
          height: 100vh !important;
          min-height: 100vh !important;
          max-width: none !important;
          box-sizing: border-box !important;
        `;
        console.log('🎯 🚨 FORCED CONTAINER STYLES WITH CSSTEXT');
      }
    }, 100);
    
    setTimeout(() => {
      console.log('🎯 🚨 RE-APPLYING STYLES AFTER 500ms');
      if (container && container.style.position !== 'absolute') {
        container.style.cssText = `
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          align-items: center !important;
          gap: 20px !important;
          margin: 0 !important;
          padding: 0px !important;
          position: absolute !important;
          top: 0px !important;
          left: 4px !important;
          width: calc(100vw - 8px) !important;
          height: 100vh !important;
          min-height: 100vh !important;
          max-width: none !important;
          box-sizing: border-box !important;
        `;
        console.log('🎯 🚨 FORCED CONTAINER STYLES WITH CSSTEXT (SECOND ATTEMPT)');
      }
    }, 500);
  }, [setIsMenuDrawerOpen, setIsSettingsDrawerOpen, settings]);

  const applyIphonePortraitLayout = useCallback(() => {
    console.log('🎯 🚨 ========= APPLYING IPHONE PORTRAIT LAYOUT ========= 🚨');
    console.log('🎯 🚨 VIEWPORT:', `${window.innerWidth}x${window.innerHeight}`);
    
    // Reset body/html scrolling (in case coming from other modes)
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    const container = document.querySelector('.container') as HTMLElement;
    const titleSection = document.querySelector('.title-section') as HTMLElement;
    const gameScreen = document.querySelector('.game-screen') as HTMLElement;
    
    console.log('🎯 ELEMENTS FOUND:', {
      container: !!container,
      gameScreen: !!gameScreen,
      titleSection: !!titleSection
    });
    
    // First, modify the parent game-screen to allow normal positioning
    if (gameScreen) {
      gameScreen.style.cssText = 'display: block !important; position: relative !important; overflow: visible !important;';
      console.log('🎯 🚨 IPHONE: Set game-screen to normal block positioning');
    } else {
      console.log('🎯 ❌ IPHONE: Game screen element NOT FOUND');
      return;
    }
    
    if (container) {
      // Use reduced side padding for iPhone (50% smaller)
      const containerLeft = 5; // Reduced from 10px to 5px (50% smaller)
      const containerRight = 5; // Reduced from 10px to 5px (50% smaller)
      const containerWidth = `calc(100vw - ${containerLeft + containerRight}px)`;
      
      // Apply normal container positioning
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('flex-direction', 'column', 'important');
      container.style.setProperty('justify-content', 'flex-start', 'important');
      container.style.setProperty('align-items', 'center', 'important');
      container.style.setProperty('gap', '7px', 'important'); // Reduced from 15px to 7px (50% smaller)
      container.style.setProperty('margin', '0', 'important');
      container.style.setProperty('padding', '0px', 'important');
      container.style.setProperty('position', 'relative', 'important');
      container.style.setProperty('top', 'auto', 'important');
      container.style.setProperty('left', `${containerLeft}px`, 'important');
      container.style.setProperty('width', containerWidth, 'important');
      container.style.setProperty('height', 'auto', 'important');
      container.style.setProperty('min-height', '100vh', 'important');
      container.style.setProperty('box-sizing', 'border-box', 'important');
      container.style.setProperty('overflow', 'visible', 'important');
      
      console.log('🎯 🚨 APPLIED REDUCED CONTAINER POSITIONING FOR IPHONE (50% smaller gaps)');
    }
    
    if (titleSection) {
      const titleTopMargin = 60; // iPhone-specific: 60px from top (doubled from 30px)
      
      titleSection.style.position = 'static';
      titleSection.style.zIndex = '10';
      titleSection.style.width = '100%';
      titleSection.style.textAlign = 'center';
      titleSection.style.margin = `${titleTopMargin}px 0 1px 0`; // Keep reduced bottom margin at 1px
      titleSection.style.display = 'block';
      titleSection.style.visibility = 'visible';
      titleSection.style.opacity = '1';
      
      console.log(`🎯 IPHONE: Title positioned with ${titleTopMargin}px top margin (doubled from 30px)`);
    }
    
    // Set up iPhone container with proper height constraints and ONLY list scrolling
    setTimeout(() => {
      const iphoneContainer = document.querySelector('.iphone-portrait-container') as HTMLElement;
      if (iphoneContainer) {
        const titleRect = titleSection?.getBoundingClientRect();
        const titleBottom = titleRect ? titleRect.bottom + 10 : 120;
        
        // Get safe area bottom value for home indicator (50% reduced margins)
        const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0px';
        const safeAreaBottomValue = parseInt(safeAreaBottom) || 0;
        const homeIndicatorMargin = Math.max(safeAreaBottomValue + 10, 20); // Reduced from +20/40 to +10/20 (50% smaller)
        
        const availableHeight = window.innerHeight - titleBottom - homeIndicatorMargin;
        
        // Position the iPhone container normally
        iphoneContainer.style.setProperty('position', 'relative', 'important');
        iphoneContainer.style.setProperty('top', 'auto', 'important');
        iphoneContainer.style.setProperty('left', 'auto', 'important');
        iphoneContainer.style.setProperty('width', '100%', 'important');
        iphoneContainer.style.setProperty('height', `${availableHeight}px`, 'important');
        iphoneContainer.style.setProperty('overflow', 'hidden', 'important');
        iphoneContainer.style.setProperty('z-index', '2', 'important');
        iphoneContainer.style.setProperty('display', 'flex', 'important');
        iphoneContainer.style.setProperty('flex-direction', 'column', 'important');
        iphoneContainer.style.setProperty('margin', '0 auto', 'important');
        
        console.log(`🎯 ✅ IPHONE: Container positioned normally - height: ${availableHeight}px`);
        
        // Set up the game wrapper with normal layout
        const gameWrapper = iphoneContainer.querySelector('.game-sections-wrapper') as HTMLElement;
        if (gameWrapper) {
          gameWrapper.style.setProperty('height', '100%', 'important');
          gameWrapper.style.setProperty('overflow', 'hidden', 'important');
          gameWrapper.style.setProperty('display', 'flex', 'important');
          gameWrapper.style.setProperty('flex-direction', 'column', 'important');
          gameWrapper.style.setProperty('gap', '4px', 'important'); // Reduced from 8px to 4px (50% smaller)
          gameWrapper.style.setProperty('padding', '5px', 'important'); // Reduced from 10px to 5px (50% smaller)
          
          // Set appropriate heights for each section
          setTimeout(() => {
            const guessSection = gameWrapper.querySelector('.guess-section') as HTMLElement;
            const selectionSection = gameWrapper.querySelector('.selection-section') as HTMLElement;
            const recentGuessSection = gameWrapper.querySelector('.recent-guess-section') as HTMLElement;
            
            if (guessSection && selectionSection && recentGuessSection) {
              // Set flexible heights
              guessSection.style.setProperty('height', 'auto', 'important');
              guessSection.style.setProperty('flex', 'none', 'important');
              guessSection.style.setProperty('overflow', 'visible', 'important');
              
              selectionSection.style.setProperty('height', 'auto', 'important');
              selectionSection.style.setProperty('flex', 'none', 'important');
              selectionSection.style.setProperty('overflow', 'visible', 'important');
              
              // Recent guesses gets remaining space
              const usedSpace = guessSection.offsetHeight + selectionSection.offsetHeight + 20; // Reduced from 40px to 20px (50% smaller)
              const remainingHeight = availableHeight - usedSpace;
              recentGuessSection.style.setProperty('height', `${Math.max(remainingHeight, 200)}px`, 'important');
              recentGuessSection.style.setProperty('flex', 'none', 'important');
              recentGuessSection.style.setProperty('overflow', 'hidden', 'important');
              
              // ONLY the guess list scrolls
              setTimeout(() => {
                const guessList = recentGuessSection.querySelector('.guess-history-list') as HTMLElement;
                if (guessList) {
                  const recentGuessesHeader = recentGuessSection.querySelector('.recent-guesses-header, .history-title') as HTMLElement;
                  const headerHeight = recentGuessesHeader?.offsetHeight || 40;
                  const listHeight = Math.max(remainingHeight, 200) - headerHeight - 10; // Reduced from 20px to 10px padding (50% smaller)
                  
                  guessList.style.setProperty('height', `${listHeight}px`, 'important');
                  guessList.style.setProperty('overflow-y', 'auto', 'important');
                  guessList.style.setProperty('overflow-x', 'hidden', 'important');
                  guessList.style.setProperty('flex', 'none', 'important');
                  
                  console.log(`🎯 ✅ IPHONE: Flexible heights - Recent: ${Math.max(remainingHeight, 200)}px, List: ${listHeight}px`);
                }
              }, 50);
            }
          }, 100);
        }
      }
    }, 200);
    
    console.log('🎯 ✅ IPHONE PORTRAIT LAYOUT COMPLETE');
  }, []);

  const resetIpadLayout = useCallback(() => {
    console.log('🎯 Resetting iPad layout');
    
    // Reset body/html scrolling (always reset these)
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.height = '';
    document.body.style.margin = '';
    document.body.style.padding = '';
    document.body.style.position = '';
    document.body.style.width = '';
    
    const gameScreen = document.querySelector('.game-screen') as HTMLElement;
    const container = document.querySelector('.container') as HTMLElement;
    const mobileDrawer = document.querySelector('.mobile-drawer') as HTMLElement;
    const submitSidebar = document.querySelector('.submit-section-sidebar') as HTMLElement;
    const submitInline = document.querySelector('.submit-section-inline') as HTMLElement;
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    const titleSection = document.querySelector('.title-section') as HTMLElement;
    
    // Reset game-screen styles
    if (gameScreen) {
      gameScreen.style.display = '';
      gameScreen.style.position = '';
      gameScreen.style.overflow = '';
    }
    
    if (container) {
      // Reset container styles
      container.style.display = '';
      container.style.flexDirection = '';
      container.style.justifyContent = '';
      container.style.alignItems = '';
      container.style.gap = '';
      container.style.margin = '';
      container.style.padding = '';
      container.style.height = '';
      container.style.minHeight = '';
      container.style.boxSizing = '';
      container.style.border = '';
      container.style.background = '';
    }
    
    if (titleSection) {
      // Reset title styles
      titleSection.style.position = '';
      titleSection.style.top = '';
      titleSection.style.left = '';
      titleSection.style.transform = '';
      titleSection.style.zIndex = '';
      titleSection.style.width = '';
      titleSection.style.textAlign = '';
      titleSection.style.margin = '';
      titleSection.style.border = '';
    }
    
    if (mainContent) {
      // Reset main content styles
      mainContent.style.flex = '';
      mainContent.style.width = '';
      mainContent.style.minWidth = '';
      mainContent.style.maxWidth = '';
      mainContent.style.marginTop = '';
      mainContent.style.margin = ''; // Reset any margin styles
      mainContent.style.transform = ''; // Reset any transform styles
      mainContent.style.transformOrigin = '';
      mainContent.style.display = ''; // Reset display
      mainContent.style.flexDirection = ''; // Reset flex direction
      mainContent.style.justifyContent = ''; // Reset justify content
      mainContent.style.alignItems = ''; // Reset align items
      mainContent.style.maxWidth = ''; // Reset max width
      mainContent.style.border = '';
      mainContent.style.paddingBottom = ''; // Reset iPhone portrait padding
    }
    
    // Reset non-iPad auto-scaling transforms
    const allScaledElements = document.querySelectorAll('[style*="transform"]');
    allScaledElements.forEach(element => {
      const el = element as HTMLElement;
      if (el.style.transform && el.style.transform.includes('scale')) {
        el.style.transform = '';
        el.style.transformOrigin = '';
      }
    });
    
    if (mobileDrawer) {
      // Reset drawer styles
      mobileDrawer.style.display = '';
      mobileDrawer.style.position = '';
      mobileDrawer.style.transform = '';
      mobileDrawer.style.flex = '';
      mobileDrawer.style.width = '';
      mobileDrawer.style.height = '';
      mobileDrawer.style.maxHeight = '';
      mobileDrawer.style.alignSelf = '';
      mobileDrawer.style.marginTop = '';
      mobileDrawer.style.background = '';
      mobileDrawer.style.border = '';
      
      // Reset drawer content and header
      const drawerContent = mobileDrawer.querySelector('.drawer-content') as HTMLElement;
      const drawerHeader = mobileDrawer.querySelector('.drawer-header') as HTMLElement;
      if (drawerContent) {
        drawerContent.style.height = '';
        drawerContent.style.flex = '';
        drawerContent.style.paddingTop = '';
        drawerContent.style.marginTop = '';
        drawerContent.style.background = '';
        drawerContent.style.boxShadow = '';
        drawerContent.style.borderRadius = '';
        drawerContent.style.padding = '';
        drawerContent.style.overflowY = '';
        drawerContent.style.scrollbarWidth = '';
        drawerContent.style.scrollbarColor = '';
      }
      if (drawerHeader) {
        drawerHeader.style.display = '';
      }
    }
    
    if (submitSidebar && submitInline) {
      // Reset submit section styles
      submitSidebar.style.display = '';
      submitInline.style.display = '';
      submitSidebar.style.flex = '';
      submitSidebar.style.width = '';
      submitSidebar.style.flexDirection = '';
      submitSidebar.style.justifyContent = '';
      submitSidebar.style.alignItems = '';
      submitSidebar.style.height = '';
      submitSidebar.style.transformOrigin = '';
      submitSidebar.style.transform = '';
      submitSidebar.style.marginTop = '';
      submitSidebar.style.border = '';
    }
    
    // Reset settings drawer styles
    const settingsDrawer = document.querySelector('.settings-drawer') as HTMLElement;
    if (settingsDrawer) {
      settingsDrawer.style.width = '';
      settingsDrawer.style.height = '';
      settingsDrawer.style.top = '';
      settingsDrawer.style.left = '';
      settingsDrawer.style.right = '';
    }

    // Reset settings drawer content styles
    const settingsDrawerContent = document.querySelector('.settings-drawer .drawer-content') as HTMLElement;
    if (settingsDrawerContent) {
      settingsDrawerContent.style.height = '';
      settingsDrawerContent.style.minHeight = '';
      settingsDrawerContent.style.maxHeight = '';
      settingsDrawerContent.style.marginTop = '';
      settingsDrawerContent.style.marginLeft = '';
      settingsDrawerContent.style.paddingTop = '';
      settingsDrawerContent.style.transform = '';
      settingsDrawerContent.style.transformOrigin = '';
      settingsDrawerContent.style.overflowY = '';
      settingsDrawerContent.style.background = ''; // Reset to default white background
    }

    // Reset menu drawer styles
    const resetMenuDrawer = document.querySelector('.mobile-drawer') as HTMLElement;
    if (resetMenuDrawer) {
      resetMenuDrawer.style.width = '';
      resetMenuDrawer.style.height = '';
      resetMenuDrawer.style.top = '';
      resetMenuDrawer.style.right = '';
      resetMenuDrawer.style.left = '';
    }

    // Reset mobile drawer header
    const resetRightDrawerHeader = document.querySelector('.mobile-drawer .drawer-header') as HTMLElement;
    if (resetRightDrawerHeader) {
      resetRightDrawerHeader.style.display = '';
    }

    // Reset menu drawer content styles
    const resetMenuDrawerContent = document.querySelector('.mobile-drawer .drawer-content') as HTMLElement;
    if (resetMenuDrawerContent) {
      resetMenuDrawerContent.style.height = '';
      resetMenuDrawerContent.style.minHeight = '';
      resetMenuDrawerContent.style.maxHeight = '';
      resetMenuDrawerContent.style.marginTop = '';
      resetMenuDrawerContent.style.marginRight = '';
      resetMenuDrawerContent.style.marginLeft = '';
      resetMenuDrawerContent.style.paddingTop = '';
      resetMenuDrawerContent.style.transform = '';
      resetMenuDrawerContent.style.transformOrigin = '';
      resetMenuDrawerContent.style.overflowY = '';
      resetMenuDrawerContent.style.background = ''; // Reset to default white background
      
      // Also reset the menu drawer container background
      const menuDrawerContainer = resetMenuDrawerContent.parentElement;
      if (menuDrawerContainer) {
        menuDrawerContainer.style.background = '';
      }
    }

    // Show hamburger menu button
    const hamburgerButton = document.querySelector('.drawer-toggle-top-right') as HTMLElement;
    if (hamburgerButton) {
      hamburgerButton.style.display = '';
    }
  }, []);

  // Dynamic auto-scaling for non-iPad devices (iPhone, Desktop, etc.)
  const applyNonIpadAutoScaling = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    const isPortrait = height > width;
    const isIpadLandscape = isLandscape && height >= 768 && height <= 1024;
    const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
    const isIpad = isIpadLandscape || isIpadPortrait;
    
    // Skip iPad devices - they have their own specific scaling
    if (isIpad) {
      console.log(`🎯 Skipping universal scaling for iPad - using device-specific scaling`);
      return;
    }
    
    const isIphone = width <= 767;
    
    // Skip iPhone portrait mode - it has its own dedicated layout function
    if (isIphone && isPortrait) {
      console.log(`🎯 Skipping universal scaling for iPhone portrait - using applyIphonePortraitLayout()`);
      return;
    }
    
    const targetLength = settings.targetLength || 3;
    const gridSize = targetLength <= 3 ? 'small' : (targetLength <= 6 ? 'medium' : 'large');
    
    console.log(`🎯 NON-IPAD AUTO-SCALING: ${width}x${height}, device: ${isIphone ? 'iPhone' : 'Desktop'}, grid: ${gridSize} (${targetLength} digits)`);
    
    // Scaling logic for non-iPad devices
    let scaleFactor = 1.0;
    
    if (isIphone) {
      // iPhone landscape only (portrait is handled separately)
      scaleFactor = targetLength <= 3 ? 0.8 : (targetLength <= 6 ? 0.7 : 0.6);
    } else {
      // Desktop/Large screens: Minimal scaling needed
      scaleFactor = targetLength <= 3 ? 1.0 : (targetLength <= 6 ? 0.95 : 0.9);
    }
    
    // Apply scaling to main content
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) {
      mainContent.style.transform = `scale(${scaleFactor})`;
      mainContent.style.transformOrigin = 'center center';
      console.log(`🎯 Applied non-iPad scaling: ${scaleFactor} to main content`);
    }
    
    // Apply scaling to right panel if visible
    if (rightPanelRef.current && !useDrawer) {
      rightPanelRef.current.style.transform = `scale(${scaleFactor})`;
      rightPanelRef.current.style.transformOrigin = 'top right';
      console.log(`🎯 Applied non-iPad scaling: ${scaleFactor} to right panel`);
    }
    
  }, [settings.targetLength, useDrawer]);

  // Function to align right panel with guess element
  const alignRightPanel = useCallback(() => {
    if (!guessElementRef.current || !rightPanelRef.current || useDrawer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    const isTabletLandscape = isLandscape && width >= 768;
    
    // Skip JavaScript positioning for iPad landscape - let CSS flexbox handle it
    if (isTabletLandscape) {
      // Reset any previous absolute positioning to let CSS take over
      rightPanelRef.current.style.position = '';
      rightPanelRef.current.style.top = '';
      rightPanelRef.current.style.right = '';
      rightPanelRef.current.style.marginTop = '';
      console.log(`🎯 iPad landscape detected - using CSS flexbox positioning`);
      return;
    }

    const guessRect = guessElementRef.current.getBoundingClientRect();
    
    // Get the absolute Y position of the guess element's top edge
    const absoluteTopPosition = guessRect.top + window.scrollY;
    
    // Set the right panel to absolute positioning at that exact Y coordinate
    rightPanelRef.current.style.position = 'absolute';
    rightPanelRef.current.style.top = `${absoluteTopPosition}px`;
    rightPanelRef.current.style.right = '20px'; // Keep it on the right side
    rightPanelRef.current.style.marginTop = '0'; // Remove any margin
    
    console.log(`🎯 Aligning scratchpad to absolute Y position: ${absoluteTopPosition}px`);
  }, [useDrawer]);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const isPortrait = height > width;
      const isIpadLandscape = isLandscape && height >= 768 && height <= 1366; // Support all iPad sizes including 12.9" Pro
      const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
      const isIpad = isIpadLandscape || isIpadPortrait;
      
      // Force drawer mode for iPads and smaller devices
      // Only use side panel for large landscape devices (desktop/large tablets)
      const needsDrawer = isIpad || (isLandscape ? width < 1200 : true);
      
          // console.log(`📏 ========= SCREEN SIZE DEBUG =========`);
    // console.log(`📏 Viewport: ${width}x${height}`);
    // console.log(`📏 Landscape: ${isLandscape}, Portrait: ${isPortrait}`);
    // console.log(`📏 iPad Landscape: ${isIpadLandscape}, iPad Portrait: ${isIpadPortrait}`);
    // console.log(`📏 Is iPad: ${isIpad}, Needs Drawer: ${needsDrawer}`);
    // console.log(`📏 =====================================`);
      
      setUseDrawer(needsDrawer);
      
      // Apply device-specific layouts with JavaScript
      if (isIpadLandscape) {
        console.log('📏 🎯 CALLING applyIpadLandscapeLayout()');
        applyIpadLandscapeLayout();
      } else if (isIpadPortrait) {
        console.log('📏 🎯 CALLING applyIpadPortraitLayout()');
        applyIpadPortraitLayout();
      } else {
        // Check if this is iPhone (mobile device)
        const isMobile = width < 768; // iPhone/mobile devices
        if (isMobile && isPortrait) {
          console.log('📏 🎯 CALLING applyIphonePortraitLayout()');
          applyIphonePortraitLayout();
        } else {
          console.log('📏 🎯 CALLING resetIpadLayout()');
          resetIpadLayout();
        }
      }
      
      // Apply non-iPad auto-scaling after layout setup
      setTimeout(() => {
        applyNonIpadAutoScaling();
      }, 50); // Small delay to ensure layout is applied first
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkScreenSize, 100); // Delay to get accurate dimensions after rotation
    });

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, [settings, applyIpadLandscapeLayout, applyIpadPortraitLayout, applyIphonePortraitLayout, resetIpadLayout, applyNonIpadAutoScaling]); // Removed gameState to prevent layout recalc on every guess change

  // Effect to apply non-iPad auto-scaling on content changes
  useEffect(() => {
    console.log('🎯 Content changed - applying non-iPad auto-scaling');
    const timeoutId = setTimeout(() => {
      applyNonIpadAutoScaling();
    }, 100); // Delay to ensure content is rendered
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [settings.targetLength, settings.difficulty, applyNonIpadAutoScaling]); // Removed currentGuess.length to prevent scaling on every digit change

  // Effect to align right panel when layout changes
  useEffect(() => {
    // Use a timeout to ensure all layout calculations are complete
    const timeoutId = setTimeout(alignRightPanel, 100);
    
    // Also align on window resize
    const handleResize = () => {
      setTimeout(alignRightPanel, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [alignRightPanel, useDrawer, settings.targetLength]); // Only realign when layout-affecting settings change

  // Reset all settings to defaults on app startup (once per session)
  useEffect(() => {
    // console.log(`🚀 PicoFermiBagel ${getBuildString()} LOADED - Latest Version Confirmed!`);
    // console.log(`🚀 Build Date: ${getBuildDateString()}`);
    // console.log('🚀 If you see this message, you have the latest build with debug logging');
    
    // Only reset if this is truly the first load (check if we've already reset)
    const hasReset = sessionStorage.getItem('pfb-reset-done');
    if (!hasReset) {
      console.log('🔄 RESETTING ALL SETTINGS TO DEFAULTS ON STARTUP');
      resetAllSettings();
      sessionStorage.setItem('pfb-reset-done', 'true');
    } else {
      console.log('🔄 Settings already reset this session, skipping reset');
    }
    
    // Initialize sound volume from settings
    soundUtils.setVolume(settings.soundVolume);
    
    // Activate audio if sound is already enabled
    if (settings.soundEnabled) {
      console.log('🎵 🎯 Sound already enabled on startup - activating audio...');
      soundUtils.activateAudio().catch(error => {
        console.error('🎵 ❌ Failed to activate audio on startup:', error);
      });
    }
    
    // Simplified startup - no complex layout fixes that cause icon movement
    console.log('🔧 Simplified startup - skipping complex layout fixes to prevent icon movement');
    
    // Just ensure scroll position and toast z-index
    window.scrollTo(0, 0);
    
    // Ensure all toasts have maximum z-index
    const toastSelectors = [
      '.info-toast-overlay',
      '.help-overlay', 
      '.hints-toast-overlay',
      '.stats-toast-overlay',
      '.toast',
      '.popup',
      '.modal'
    ];
    
    toastSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).style.zIndex = '99999';
      });
    });
    
  }, [settings.soundVolume, settings.soundEnabled]);

  // Debug current game state
  useEffect(() => {
    console.log('🎮 GAME STATE DEBUG:');
    console.log('🎮 Settings:', {
      difficulty: settings?.difficulty || 'unknown',
      gridRows: settings?.gridRows || 'unknown',
      gridColumns: settings?.gridColumns || 'unknown',
      targetLength: settings?.targetLength || 'unknown'
    });
    console.log('🎮 Current guess length:', gameState.currentGuess?.length || 'unknown');
    console.log('🎮 Target length:', gameState.target?.length || 'unknown');
  }, [gameState, settings]);

  // Fix game state consistency on startup
  useEffect(() => {
    const expectedLength = settings.targetLength;
    const currentGuessLength = gameState.currentGuess.length;
    const targetLength = gameState.target.length;
    
    if (currentGuessLength !== expectedLength || targetLength !== expectedLength) {
      console.log('🔧 FIXING INCONSISTENT STATE: Starting new game to match settings');
      dispatch({ type: 'START_NEW_GAME' });
    }
  }, []); // Only run once on mount

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!swipeStartRef.current || !gameScreenRef.current) return;
    
    const touch = e.changedTouches[0];
    const { x: startX, y: startY, time: startTime } = swipeStartRef.current;
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    // Calculate swipe metrics
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;
    

    
    // Simplified swipe requirements - more lenient
    const minDistance = 30; // Reduced from 50
    const maxTime = 500; // Increased from 300
    const minVelocity = 0.1; // Reduced from 0.3
    
    // Check if this is a valid swipe
    if (distance < minDistance || deltaTime > maxTime || velocity < minVelocity) {
      swipeStartRef.current = null;
      return;
    }
    
    // Check if swipe is more horizontal than vertical
    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      swipeStartRef.current = null;
      return;
    }
    
    // Fixed logic - settings drawer always swipeable, menu drawer only when useDrawer is true
    if (deltaX < -30) {
      // Left swipe
      if (isSettingsDrawerOpen) {
        // Settings drawer is always swipeable
        setIsSettingsDrawerOpen(false);
      } else if (isMenuDrawerOpen && useDrawer) {
        // Menu drawer only when using drawer layout
        setIsMenuDrawerOpen(false);
      } else if (!isMenuDrawerOpen && !isSettingsDrawerOpen && useDrawer) {
        // Open menu drawer only when using drawer layout
        setIsMenuDrawerOpen(true);
      }
    } else if (deltaX > 30) {
      // Right swipe
      if (isMenuDrawerOpen && useDrawer) {
        // Menu drawer only when using drawer layout
        setIsMenuDrawerOpen(false);
      } else if (isSettingsDrawerOpen) {
        // Settings drawer is always swipeable
        setIsSettingsDrawerOpen(false);
      } else if (!isSettingsDrawerOpen && !isMenuDrawerOpen) {
        // Settings drawer is always available to open
        setIsSettingsDrawerOpen(true);
      }
    }
    
    swipeStartRef.current = null;
  }, [isMenuDrawerOpen, isSettingsDrawerOpen, useDrawer]);

  // Scroll to top when drawers open
  useEffect(() => {
    if (isMenuDrawerOpen && mobileDrawerContentRef.current) {
      setTimeout(() => {
        mobileDrawerContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100); // Small delay to ensure drawer is open
      
      // Apply special positioning for iPad portrait only when menu drawer is opened
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
      
      if (isIpadPortrait) {
        setTimeout(() => {
          const menuDrawerContent = document.querySelector('.mobile-drawer .drawer-content') as HTMLElement;
          if (menuDrawerContent) {
            // Menu icon position: 20px + safe area from right, 20px + safe area from top
            // Icon size is 48px, so icon center is at 24px from right edge of icon
            const iconCenterFromRight = 20 + 24; // 44px from right edge of screen
            const iconBottom = 20 + 48; // 68px from top (ignoring safe area for simplicity)
            
            // Account for existing padding/margins - reduce the calculated position
            menuDrawerContent.style.marginTop = `${iconBottom + 10 - 88}px`; // Subtract existing 88px margin
            
            // For right positioning, we need to position the LEFT edge so the RIGHT edge aligns with icon center
            // Get the content width and calculate where left edge should be
            const drawerWidth = 450; // Minimum width from clamp(450px, 60vw, 630px)
            const leftPositionFromRight = iconCenterFromRight + drawerWidth; // How far from right edge the left edge should be
            menuDrawerContent.style.marginLeft = `calc(100vw - ${leftPositionFromRight}px)`; // Position left edge
            menuDrawerContent.style.marginRight = ''; // Clear any right margin
            menuDrawerContent.style.transformOrigin = 'top right'; // Scale from top-right
            console.log('🎯 Applied special positioning to menu drawer content');
          }
        }, 150); // Delay to ensure drawer is fully open
      }
    }
  }, [isMenuDrawerOpen]);

  useEffect(() => {
    if (isSettingsDrawerOpen) {
      setTimeout(() => {
        const settingsDrawerContent = document.querySelector('.settings-drawer.open .drawer-content');
        if (settingsDrawerContent) {
          settingsDrawerContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure drawer is open
      
      // Apply special positioning for iPad portrait only when settings drawer is opened
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
      
      if (isIpadPortrait) {
        setTimeout(() => {
          const settingsDrawerContent = document.querySelector('.settings-drawer .drawer-content') as HTMLElement;
          if (settingsDrawerContent) {
            // Settings icon position: 20px + safe area from left, 20px + safe area from top
            // Icon size is 48px, so icon center is at left + 24px
            const iconCenterX = 20 + 24; // 44px from left (ignoring safe area for simplicity)
            const iconBottom = 20 + 48; // 68px from top (ignoring safe area for simplicity)
            
            // Account for existing padding/margins - reduce the calculated position
            settingsDrawerContent.style.marginTop = `${iconBottom + 10 - 88}px`; // Subtract existing 88px margin
            settingsDrawerContent.style.marginLeft = `${iconCenterX}px`; // Position left edge at icon center
            console.log('🎯 Applied special positioning to settings drawer content');
          }
        }, 150); // Delay to ensure drawer is fully open
      }
    }
  }, [isSettingsDrawerOpen]);

  // Add touch event listeners
  useEffect(() => {
    const gameScreen = gameScreenRef.current;
    if (!gameScreen) return;
    
    gameScreen.addEventListener('touchstart', handleTouchStart, { passive: true });
    gameScreen.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      gameScreen.removeEventListener('touchstart', handleTouchStart);
      gameScreen.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  // Debug safe area values
  useEffect(() => {
    const logSafeAreaInfo = () => {
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || 'not-set';
      
      console.log('🔍 Safe Area Debug Info:', {
        orientation,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        safeAreaBottom,
        userAgent: navigator.userAgent.includes('iPad') ? 'iPad' : 'other'
      });
      
      // Check if our media query matches
      const portraitMatch = window.matchMedia('(orientation: portrait)').matches;
      console.log('📱 Portrait media query matches:', portraitMatch);
      
      // Check if submit button area exists and has the pseudo element
      const submitArea = document.querySelector('.submit-button-area');
      if (submitArea) {
        const computedStyle = window.getComputedStyle(submitArea, '::after');
        console.log('🎯 Submit area ::after styles:', {
          content: computedStyle.content,
          height: computedStyle.height,
          background: computedStyle.background,
          display: computedStyle.display
        });
      }
    };

    // Log immediately and on orientation change
    logSafeAreaInfo();
    window.addEventListener('orientationchange', () => {
      setTimeout(logSafeAreaInfo, 100); // Small delay after orientation change
    });
    window.addEventListener('resize', logSafeAreaInfo);

    return () => {
      window.removeEventListener('orientationchange', logSafeAreaInfo);
      window.removeEventListener('resize', logSafeAreaInfo);
    };
  }, []);

  // Auto-scaling to ensure content fits on screen - ONLY for iPad (both orientations)
  useEffect(() => {
    let isScaling = false; // Prevent multiple simultaneous scaling operations
    
    const applyAutoScaling = () => {
      if (isScaling) {
        console.log('🔍 Skipping auto-scaling - already in progress');
        return;
      }
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isPortrait = viewportHeight > viewportWidth;
      const isLandscape = viewportWidth > viewportHeight;
      const isIpadPortrait = isPortrait && viewportWidth >= 768 && viewportWidth <= 1024;
      const isIpadLandscape = isLandscape && viewportHeight >= 768 && viewportHeight <= 1366; // Support all iPad sizes
      const isIpad = isIpadPortrait || isIpadLandscape;
      
      // ONLY apply JavaScript scaling for iPad (both orientations)
      if (!isIpad) {
        console.log(`🔍 Skipping JavaScript auto-scaling - not iPad (${viewportWidth}x${viewportHeight})`);
        return;
      }
      
      // Apply auto-scaling to orange container content in iPad portrait mode
      if (isIpadPortrait) {
        console.log('🔍 Applying auto-scaling to orange container content in iPad portrait mode');
        
        // Find the orange container and scale its content
        const orangeContainer = document.querySelector('.orange-portrait-container') as HTMLElement;
        const gameWrapper = orangeContainer?.querySelector('.game-sections-wrapper') as HTMLElement;
        
        if (orangeContainer && gameWrapper) {
          // Reset transform first
          gameWrapper.style.transform = '';
          gameWrapper.style.transformOrigin = '';
          
          setTimeout(() => {
            const containerRect = orangeContainer.getBoundingClientRect();
            const contentHeight = gameWrapper.scrollHeight;
            const contentWidth = gameWrapper.scrollWidth;
            
            const availableHeight = containerRect.height - 40; // Leave more margin
            const availableWidth = containerRect.width - 40; // Leave more margin
            
            const scaleX = availableWidth / contentWidth;
            const scaleY = availableHeight / contentHeight;
            const scale = Math.min(scaleX, scaleY, 1); // Don't scale up
            
            console.log(`🔍 AUTO-SCALING DEBUG:`, {
              containerSize: `${containerRect.width.toFixed(0)}x${containerRect.height.toFixed(0)}`,
              contentSize: `${contentWidth}x${contentHeight}`,
              availableSize: `${availableWidth.toFixed(0)}x${availableHeight.toFixed(0)}`,
              scaleX: scaleX.toFixed(3),
              scaleY: scaleY.toFixed(3),
              finalScale: scale.toFixed(3),
              willScale: scale < 0.9 ? 'YES' : 'NO'
            });
            
            // Only scale if really necessary (content is significantly larger)
            if (scale < 0.9) {
              gameWrapper.style.transform = `scale(${scale})`;
              gameWrapper.style.transformOrigin = 'top center';
              console.log(`🔍 Scaled orange container content: ${scale.toFixed(3)}`);
            } else {
              console.log(`🔍 No scaling needed - content fits well (scale would be ${scale.toFixed(3)})`);
            }
          }, 100);
        }
        return;
      }
      
      isScaling = true;
      const wrapper = document.querySelector('.app-scaling-wrapper') as HTMLElement;
      const gameScreen = document.querySelector('.game-screen') as HTMLElement;
      const container = document.querySelector('.container') as HTMLElement;
      
      if (!wrapper || !gameScreen || !container) {
        isScaling = false;
        return;
      }
      
      console.log(`🔍 APPLYING JAVASCRIPT AUTO-SCALING - iPad ${isIpadPortrait ? 'Portrait' : 'Landscape'} Mode (${viewportWidth}x${viewportHeight})`);
      
      // Reset transform first to get natural size
      container.style.transform = '';
      container.style.transformOrigin = '';
      
      // Apply with longer delay to ensure content is fully laid out
      setTimeout(() => {
        // Measure the actual content (container) that we're going to scale
        const contentHeight = container.scrollHeight;
        const contentWidth = container.scrollWidth;
        
        let availableHeight, availableWidth;
        
        // Account for keepout areas: top 40px, bottom 20px, sides 20px
        const topKeepout = 40;
        const bottomKeepout = 20;
        const sideKeepout = 20;
        
        availableHeight = viewportHeight - topKeepout - bottomKeepout; // 60px total
        availableWidth = viewportWidth - (sideKeepout * 2); // 40px total
        
        console.log(`🔍 IPAD ${isIpadPortrait ? 'PORTRAIT' : 'LANDSCAPE'} AUTO-SCALING:`, {
          viewport: `${viewportWidth}x${viewportHeight}`,
          content: `${contentWidth}x${contentHeight}`,
          available: `${availableWidth}x${availableHeight}`,
          keepout: `top:${topKeepout}px, bottom:${bottomKeepout}px, sides:${sideKeepout}px`,
          scaleX: (availableWidth / contentWidth).toFixed(3),
          scaleY: (availableHeight / contentHeight).toFixed(3),
          finalScale: Math.min(availableWidth / contentWidth, availableHeight / contentHeight, 1).toFixed(3),
          needsScaling: (contentHeight > availableHeight || contentWidth > availableWidth) ? 'YES' : 'NO'
        });
        
        // Calculate scale factors
        const scaleX = availableWidth / contentWidth;
        const scaleY = availableHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
        
        // Apply scaling if needed - iPad (both orientations)
        const shouldScale = scale < 1.0; // Only scale down when content doesn't fit
        if (shouldScale) {
          if (isIpadPortrait) {
            // Portrait: Center both horizontally and vertically
            const scaledWidth = contentWidth * scale;
            const scaledHeight = contentHeight * scale;
            const horizontalOffset = (availableWidth - scaledWidth) / 2;
            const verticalOffset = (availableHeight - scaledHeight) / 2;
            
            container.style.transform = `scale(${scale})`;
            container.style.transformOrigin = 'top left';
            container.style.marginLeft = `${horizontalOffset}px`;
            container.style.marginTop = `${verticalOffset}px`;
            
            console.log(`🔍 Portrait centering: scaledSize=${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}px, offset=${horizontalOffset.toFixed(1)}x${verticalOffset.toFixed(1)}px`);
          } else {
            // Landscape: Scale entire container, submit section already has 1.2x scaling applied in layout
            container.style.transform = `scale(${scale})`;
            container.style.transformOrigin = 'top left';
            
            // Center the scaled container
            const scaledWidth = contentWidth * scale;
            const scaledHeight = contentHeight * scale;
            const horizontalOffset = (availableWidth - scaledWidth) / 2;
            const verticalOffset = (availableHeight - scaledHeight) / 2;
            
            container.style.marginLeft = `${horizontalOffset}px`;
            container.style.marginTop = `${verticalOffset}px`;
            
            console.log(`🔍 Landscape centering: scaledSize=${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}px, offset=${horizontalOffset.toFixed(1)}x${verticalOffset.toFixed(1)}px`);
          }
          
          console.log(`🔍 APPLIED AUTO-SCALING TO CONTAINER (IPAD ${isIpadPortrait ? 'PORTRAIT' : 'LANDSCAPE'}): ${scale.toFixed(3)}`);
          console.log(`🔍 Content was ${contentWidth}x${contentHeight}, available was ${availableWidth}x${availableHeight}`);
        } else {
          // Reset container transform and margins
          container.style.transform = '';
          container.style.transformOrigin = '';
          container.style.marginLeft = '';
          container.style.marginTop = '';
          
          console.log(`🔍 NO SCALING - content fits perfectly in iPad ${isIpadPortrait ? 'portrait' : 'landscape'}`);
        }
        
        // Reset the scaling flag
        isScaling = false;
      }, 100); // Longer delay to ensure layout is complete
    };
    
    // Apply scaling on load, resize, and game state changes
    // Small delay on initial load to prevent icon jitter
    setTimeout(applyAutoScaling, 300);
    
    const handleResize = () => {
      // Reset scaling flag on resize and apply with delay
      isScaling = false;
      setTimeout(applyAutoScaling, 150);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [settings.targetLength, settings.difficulty]); // Only re-run when settings that affect layout change, not on every guess

  // Additional effect to fix toast z-index issues dynamically
  useEffect(() => {
    const fixToastZIndex = () => {
      // Use MutationObserver to watch for toast elements being added to DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check if this is a toast-related element
              if (element.classList?.contains('info-toast-overlay') ||
                  element.classList?.contains('help-overlay') ||
                  element.classList?.contains('hints-toast-overlay') ||
                  element.classList?.contains('stats-toast-overlay') ||
                  element.querySelector?.('.info-toast-overlay, .help-overlay, .hints-toast-overlay, .stats-toast-overlay')) {
                
                console.log('🎯 Toast element detected, applying z-index fix');
                (element as HTMLElement).style.zIndex = '99999';
                
                // Also fix any child toast elements
                const childToasts = element.querySelectorAll('.info-toast-overlay, .help-overlay, .hints-toast-overlay, .stats-toast-overlay');
                childToasts.forEach(child => {
                  (child as HTMLElement).style.zIndex = '99999';
                });
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => observer.disconnect();
    };
    
    const cleanup = fixToastZIndex();
    return cleanup;
  }, []);

  // Re-run auto-scaling when guesses change (for iPad portrait mode)
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
    
    if (isIpadPortrait) {
      // Delay to allow DOM to update after guess changes
      setTimeout(() => {
        const orangeContainer = document.querySelector('.orange-portrait-container') as HTMLElement;
        const gameWrapper = orangeContainer?.querySelector('.game-sections-wrapper') as HTMLElement;
        
        if (orangeContainer && gameWrapper) {
          console.log(`🎯 🔄 RE-SCALING after guess change (${gameState.guesses.length} guesses)`);
          
          // Reset any existing transforms
          gameWrapper.style.transform = '';
          gameWrapper.style.transformOrigin = 'top center';
          
          // Force layout calculation
          gameWrapper.offsetHeight;
          
          // Measure content and container
          const containerRect = orangeContainer.getBoundingClientRect();
          const contentHeight = gameWrapper.scrollHeight;
          const contentWidth = gameWrapper.scrollWidth;
          
          // Calculate available space
          const availableHeight = containerRect.height;
          const availableWidth = containerRect.width;
          
          // Calculate scale factors
          const scaleX = availableWidth / contentWidth;
          const scaleY = availableHeight / contentHeight;
          const scale = Math.min(scaleX, scaleY, 1);
          
          console.log(`🎯 🔄 RE-SCALING CALCULATION:`, {
            guesses: gameState.guesses.length,
            containerSize: `${containerRect.width.toFixed(0)}x${containerRect.height.toFixed(0)}`,
            contentSize: `${contentWidth}x${contentHeight}`,
            finalScale: scale.toFixed(3),
            willScale: scale < 1 ? 'YES' : 'NO'
          });
          
          // Apply scaling if needed
          if (scale < 1) {
            gameWrapper.style.transform = `scale(${scale})`;
            gameWrapper.style.transformOrigin = 'top center';
            console.log(`🎯 ✅ RE-APPLIED auto-scaling: ${scale.toFixed(3)}x after guess change`);
          }
        }
      }, 100);
    }
  }, [gameState.guesses.length]); // Re-run when number of guesses changes

  // Simplified positioning for circular submit button - just vertically center in cyan container
  useEffect(() => {
    const positionButton = () => {
      const submitButtons = document.querySelectorAll('.circular-submit-position');
      submitButtons.forEach((el) => {
        const guessSection = el.closest('.guess-section');
        
        if (guessSection) {
          // Adjusted vertical centering to account for header spacing imbalance (responsive)
          (el as HTMLElement).style.position = 'absolute';
          (el as HTMLElement).style.right = '20px';
          (el as HTMLElement).style.top = 'calc(50% + clamp(7px, 1.5vw, 10px))'; // Responsive adjustment based on header margin
          (el as HTMLElement).style.transform = 'translateY(-50%)';
          (el as HTMLElement).style.zIndex = '10';
          
          // console.log('🎯 Submit button positioned: responsive adjustment for header spacing imbalance');
        }
      });
    };

    // Reposition on resize and orientation change
    const handleResize = () => {
      setTimeout(positionButton, 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial positioning
    setTimeout(positionButton, 10);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [settings.gridRows, settings.gridColumns]); // Re-run when game mode changes

  // Position and scale menu drawer content in iPad portrait mode
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
    if (isMenuDrawerOpen && isIpadPortrait) {
      // CSS is now handling all positioning for iPad portrait mode
      // No JavaScript positioning needed
    }
  }, [isMenuDrawerOpen]);

  // Position and scale settings drawer content in iPad portrait mode
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
    if (isSettingsDrawerOpen && isIpadPortrait) {
      // CSS is now handling all positioning for iPad portrait mode
      // No JavaScript positioning needed
    }
  }, [isSettingsDrawerOpen]);

  return (
    <div className="app-scaling-wrapper">
      <div className="game-screen" ref={gameScreenRef}>
      {/* Settings Button - Top Left */}
      {!isSettingsDrawerOpen && (
        <button
          className="settings-button"
          onClick={() => {
            if (isMenuDrawerOpen) {
              setIsMenuDrawerOpen(false);
            }
            setIsSettingsDrawerOpen(true);
          }}
          aria-label="Open settings"
          style={{ zIndex: 2000 }} // Ensure it's above other content
        >
          <Settings size={24} />
        </button>
      )}

      {/* Hamburger Menu Toggle - Top Right */}
      {useDrawer && !isMenuDrawerOpen && (
        <button
          className="drawer-toggle-top-right"
          onClick={() => {
            if (isSettingsDrawerOpen) {
              setIsSettingsDrawerOpen(false);
            }
            setIsMenuDrawerOpen(true);
          }}
          aria-label="Open menu"
          style={{ zIndex: 2000 }} // Ensure it's above other content
        >
          <Menu size={24} />
        </button>
      )}

      {/* Settings Drawer */}
      {isSettingsDrawerOpen && (
        <div className="settings-drawer-overlay open" onClick={() => setIsSettingsDrawerOpen(false)} />
      )}
      <div className={`settings-drawer ${isSettingsDrawerOpen ? 'open' : ''}`}>
        <MenuArea onClose={() => setIsSettingsDrawerOpen(false)} />
      </div>

      {/* Settings Close Button - positioned in exact same spot as opening button */}
      {isSettingsDrawerOpen && (
        <button
          className="settings-button"
          onClick={() => setIsSettingsDrawerOpen(false)}
          aria-label="Close settings"
          style={{ 
            zIndex: 5000, // Above drawer content
            top: `calc(20px + env(safe-area-inset-top))`, // Exact same position as opening button
            left: `calc(20px + env(safe-area-inset-left))`, // Same horizontal position
            position: 'fixed', // Force fixed positioning
            width: '48px',
            height: '48px',
            // Ensure button styling matches opening button exactly
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          <Settings size={24} />
        </button>
      )}

      {/* Mobile Drawer Close Button - positioned in exact same spot as opening button */}
      {isMenuDrawerOpen && useDrawer && (
        <button
          className="drawer-toggle-top-right"
          onClick={() => setIsMenuDrawerOpen(false)}
          aria-label="Close menu"
          style={{ 
            zIndex: 5000, // Above drawer content
            top: `calc(20px + env(safe-area-inset-top))`, // Exact same position as opening button
            right: `calc(20px + env(safe-area-inset-right))`, // Same horizontal position
            position: 'fixed', // Force fixed positioning
            width: '48px',
            height: '48px',
            // Ensure button styling matches opening button exactly
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          <Menu size={24} />
        </button>
      )}

      <div className="container" style={{
        position: 'relative', // Ensure orange container is positioned relative to this
      }}>
        {/* Game Title - Outside main content for absolute positioning */}
        <div className="title-section">
          <h1 className="game-title">PicoFermiBagel</h1>
          <p className="game-subtitle">A Number-based Logical Guessing Game</p>
        </div>

        {/* Special containers for iPad portrait and iPhone portrait modes */}
        {(() => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          const isLandscape = width > height;
          const isPortrait = height > width;
          const isIpadLandscape = isLandscape && height >= 768 && height <= 1366;
          const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
          const isMobile = width < 768; // iPhone and other mobile devices
          const isIphonePortrait = isMobile && isPortrait;
          
          // Use orange container for iPad portrait mode (special layout)
          if (isIpadPortrait) {
            // Calculate position dynamically - start just below subtitle, end 20px from bottom
            // Match the green container's horizontal constraints: 20px margins on each side
            const titleSection = document.querySelector('.title-section');
            let orangeTop = 120; // Default fallback
            let orangeHeight = height - 140; // Default fallback (120 + 20)
            const orangeLeft = 0; // No margins for full width
            const orangeWidth = `100vw`; // Full viewport width
            
            if (titleSection) {
              const titleRect = titleSection.getBoundingClientRect();
              orangeTop = titleRect.bottom + 10; // 10px gap below subtitle
              orangeHeight = height - orangeTop - 20; // Extend to 20px from bottom
            }
            
            return (
              <div
                className="orange-portrait-container"
                                  style={{
                    position: 'fixed', // Use fixed positioning relative to viewport, not parent
                    top: orangeTop,
                    left: orangeLeft,
                    width: orangeWidth,
                    height: orangeHeight,
                    // border: '2px solid orange', // Debug - removed for production
                    boxSizing: 'border-box',
                    background: 'transparent',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    padding: '2px', // Reduced padding by 50% again for minimal spacing
                    overflow: 'visible', // Allow content to be visible
                  }}
              >
                <div className="game-sections-wrapper" style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 'clamp(4px, 0.75vw, 6px)', // Reduced gap by 50% again for minimal spacing between sections
                  justifyContent: 'flex-start', 
                  alignItems: 'center', // Keep other sections centered 
                  overflowY: 'visible',
                  transformOrigin: 'top center'
                }}>
                  {/* Target Display - Shows when enabled */}
                  <TargetDisplay />
                  {/* Guess Area with Circular Submit Button */}
                  <div className="guess-section" ref={guessElementRef} style={{ 
                    position: 'relative'
                  }}>
                    <GuessArea />
                    {/* Circular Submit Button positioned dynamically between info icon and container bottom */}
                    <div 
                      className="circular-submit-position"
                    >
                      <CircularSubmitButton />
                    </div>
                  </div>
                  {/* Number Selection - Natural width */}
                  <div className="selection-section">
                    <SelectionArea />
                  </div>
                  {/* Recent Guess History - Now has more space */}
                  <div className="recent-guess-section" style={{ 
                    flex: '1', // Allow it to grow to fill remaining space
                    minHeight: '0', // Let it be as small as needed
                    maxHeight: 'none', // Allow unlimited growth
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    position: 'relative'
                  }}>
                    <RecentGuessHistory />
                  </div>
                </div>
              </div>
            );
          }
          
          // Use iPhone portrait container (mimicking iPad approach but with iPhone-specific settings)
          if (isIphonePortrait) {
            const titleSection = document.querySelector('.title-section');
            let iphoneTop = 120; // Default fallback
            let iphoneHeight = height - 140; // Default fallback
            const iphoneLeft = 0; // No margins for full width
            const iphoneWidth = `100vw`; // Full viewport width
            
            if (titleSection) {
              const titleRect = titleSection.getBoundingClientRect();
              iphoneTop = titleRect.bottom + 10; // 10px gap below subtitle
              iphoneHeight = height - iphoneTop - 20; // Extend to 20px from bottom
            }
            
            return (
              <div
                className="iphone-portrait-container"
                style={{
                  position: 'fixed', // Use fixed positioning like iPad
                  top: iphoneTop,
                  left: iphoneLeft,
                  width: iphoneWidth,
                  height: iphoneHeight,
                  // border: '2px solid blue', // Debug - removed for production
                  boxSizing: 'border-box',
                  background: 'transparent',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  padding: '2px', // Same as iPad's minimal padding
                  overflow: 'visible', // Allow content to be visible
                }}
              >
                <div className="game-sections-wrapper" style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 'clamp(4px, 0.75vw, 6px)', // Reduced gap by 50% to match iPad portrait 
                  justifyContent: 'flex-start', 
                  alignItems: 'center',
                  overflowY: 'visible',
                  transformOrigin: 'top center'
                }}>
                  {/* Target Display - Shows when enabled */}
                  <TargetDisplay />
                  {/* Guess Area with Circular Submit Button */}
                  <div className="guess-section" ref={guessElementRef} style={{ 
                    position: 'relative'
                  }}>
                    <GuessArea />
                    {/* Circular Submit Button positioned dynamically */}
                    <div className="circular-submit-position">
                      <CircularSubmitButton />
                    </div>
                  </div>
                  {/* Number Selection */}
                  <div className="selection-section">
                    <SelectionArea />
                  </div>
                  {/* Recent Guess History - Fill remaining space */}
                  <div className="recent-guess-section" style={{ 
                    flex: '1',
                    minHeight: '0',
                    maxHeight: 'none',
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    position: 'relative'
                  }}>
                    <RecentGuessHistory />
                  </div>
                </div>
              </div>
            );
          }
          
          // For all other modes (iPad landscape, desktop), use main-content layout
          return (
            <div className="main-content">
              {/* Game Sections Wrapper */}
              <div className="game-sections-wrapper">
                {/* Target Display - Shows when enabled */}
                <TargetDisplay />
                {/* Guess Area with Circular Submit Button */}
                <div className="guess-section" ref={guessElementRef} style={{ 
                  position: 'relative'
                }}>
                  <GuessArea />
                  {/* Circular Submit Button positioned dynamically between info icon and container bottom */}
                  <div 
                    className="circular-submit-position"
                  >
                    <CircularSubmitButton />
                  </div>
                </div>
                {/* Number Selection */}
                <div className="selection-section">
                  <SelectionArea />
                </div>
                {/* Recent Guess History - Only show inline for mobile and portrait modes */}
                {(() => {
                  const shouldShowInlineSubmit = isMobile || isIpadPortrait || (!isIpadLandscape && isPortrait);
                  if (shouldShowInlineSubmit) {
                    return (
                      <div className="recent-guess-section" style={{ 
                        flex: '1', // Allow it to grow to fill remaining space
                        minHeight: '200px', // Minimum height for content
                        maxHeight: 'none', // Allow unlimited growth
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <RecentGuessHistory />
                      </div>
                    );
                  }
                  return null; // Don't show recent guesses in landscape modes where sidebar is used
                })()}
              </div>
            </div>
          );
        })()}

        {/* Recent Guess History as Sidebar - Only for iPad Landscape and Desktop */}
        {(() => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          const isLandscape = width > height;
          const isPortrait = height > width;
          const isIpadLandscape = isLandscape && height >= 768 && height <= 1366;
          const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
          const isMobile = width < 768; // iPhone and other mobile devices
          
          // Show sidebar recent guesses only in iPad landscape and desktop landscape modes
          // Hide in: iPad portrait, mobile (iPhone), and desktop portrait
          const shouldShowSidebar = isIpadLandscape || (!isMobile && !isIpadPortrait && isLandscape);
          
          if (shouldShowSidebar) {
            return (
              <div className="recent-guess-section submit-section-sidebar">
                <RecentGuessHistory />
              </div>
            );
          }
          return null;
        })()}
        
        {/* Circular Submit Button - Show in ALL layouts */}
        {(() => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          const isLandscape = width > height;
          const isPortrait = height > width;
          const isIpadLandscape = isLandscape && height >= 768 && height <= 1366;
          const isIpadPortrait = isPortrait && width >= 768 && width <= 1024;
          const isMobile = width < 768; // iPhone and other mobile devices
          
          // For landscape modes where we have a sidebar layout, position the button differently
          const shouldShowSidebar = isIpadLandscape || (!isMobile && !isIpadPortrait && isLandscape);
          
          if (shouldShowSidebar) {
            // In sidebar layouts, position the button between main content and sidebar
            return (
              <div className="circular-submit-landscape" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 30
              }}>
                <CircularSubmitButton />
              </div>
            );
          }
          return null; // Button is already positioned in portrait layouts via the guess section
        })()}

        {/* Desktop Right Panel - Dynamically aligned with guess section */}
        {!useDrawer && (
          <div className="right-panel" ref={rightPanelRef}>
            <div className="side-panel-section">
              <Scratchpad />
            </div>
            <div className="side-panel-section">
              <HintPurchasing />
            </div>
            <div className="side-panel-section">
              <ScoreArea />
            </div>
          </div>
        )}

        {/* Mobile/Small Screen Drawer */}
        {useDrawer && (
                      <>
            <div className={`mobile-drawer ${isMenuDrawerOpen ? 'open' : ''}`}>
              <div className="drawer-header">
                <button
                  className="drawer-close"
                  onClick={() => setIsMenuDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="drawer-content" ref={mobileDrawerContentRef} style={{ position: 'relative' }}>
                <CustomScrollIndicator containerRef={mobileDrawerContentRef} />
                <div className="side-panel-section">
                  <Scratchpad />
                </div>
                <div className="side-panel-section">
                  <HintPurchasing />
                </div>
                <div className="side-panel-section">
                  <ScoreArea />
                </div>
              </div>
            </div>


          </>
        )}


      </div>
    </div>
    </div>
  );
};

export default GameScreen; 