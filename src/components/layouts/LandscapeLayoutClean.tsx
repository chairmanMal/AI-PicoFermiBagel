import React, { useEffect, useRef } from 'react';
import GuessArea from '../GuessArea';
import SelectionArea from '../SelectionArea';
import GlobalSubmitButton from '../GlobalSubmitButton';
import MenuDrawerContent from '../MenuDrawerContent';
import RecentGuessHistory from '../RecentGuessHistory';

interface LandscapeLayoutCleanProps {
  guessElementRef: React.RefObject<HTMLDivElement>;
}

const LandscapeLayoutClean: React.FC<LandscapeLayoutCleanProps> = ({ guessElementRef }) => {
  const landscapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🎯 ========= LANDSCAPE LAYOUT BUILD 808 - NATURAL EXPANSION + REMAINING SPACE ========= 🎯');
    
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    console.log('📐 VIEWPORT:', `${viewport.width}x${viewport.height}`);
    
    // Calculate title and subtitle heights first
    setTimeout(() => {
      const titleElement = document.querySelector('.landscape-title') as HTMLElement;
      const subtitleElement = document.querySelector('.landscape-subtitle') as HTMLElement;
      
      if (titleElement && subtitleElement) {
        const titleHeight = titleElement.offsetHeight;
        const subtitleHeight = subtitleElement.offsetHeight;
        const titleAreaHeight = titleHeight + subtitleHeight + 5; // 5px gap between title and subtitle
        
        console.log('📝 TITLE AREA:', { titleHeight, subtitleHeight, totalHeight: titleAreaHeight });
        
        // RED BORDER: Displayable area
        const redBorder = {
          top: 10, // 10px from top
          left: 5, // 5px from left edge
          right: 5, // 5px from right edge  
          bottom: 10, // 10px from bottom
          width: viewport.width - 10, // 5px each side
          height: viewport.height - 20 // 10px top + 10px bottom
        };
        
        console.log('🔴 RED BORDER (Displayable Area):', redBorder);
        
        // ORANGE BORDER: 3-column container within red border, below subtitle
        const orangeBorder = {
          top: redBorder.top + titleAreaHeight + 30, // 30px below subtitle
          left: redBorder.left,
          right: redBorder.right,
          bottom: redBorder.bottom,
          width: redBorder.width,
          height: redBorder.height - titleAreaHeight - 30
        };
        
        console.log('🟠 ORANGE BORDER (3-Column Container):', orangeBorder);
        
        // COLUMN CALCULATIONS
        const columnGap = 5; // 5px gaps between columns
        const totalGaps = 2 * columnGap; // 2 gaps for 3 columns
        const columnWidth = (orangeBorder.width - totalGaps) / 3;
        
        console.log('📊 COLUMNS:', {
          columnWidth: columnWidth.toFixed(1),
          columnGap,
          totalWidth: (columnWidth * 3 + totalGaps).toFixed(1),
          availableHeight: orangeBorder.height
        });
        
        // SUBMIT BUTTON: Above column 1, centered horizontally, completely above orange border
        const submitButton = {
          top: orangeBorder.top - 96, // 96px above orange border (76px button height + 20px margin)
          left: redBorder.left + (columnWidth / 2) - 38, // Center above column 1 (button is 76px wide)
          width: 76,
          height: 76
        };
        
        console.log('🔘 SUBMIT BUTTON:', submitButton);
        
        // Apply red border to landscape container
        const landscapeContainer = landscapeRef.current;
        if (landscapeContainer) {
          landscapeContainer.style.setProperty('border', '2px solid red', 'important');
          landscapeContainer.style.setProperty('position', 'fixed', 'important');
          landscapeContainer.style.setProperty('top', `${redBorder.top}px`, 'important');
          landscapeContainer.style.setProperty('left', `${redBorder.left}px`, 'important');
          landscapeContainer.style.setProperty('width', `${redBorder.width}px`, 'important');
          landscapeContainer.style.setProperty('height', `${redBorder.height}px`, 'important');
          landscapeContainer.style.setProperty('z-index', '50', 'important');
          
          console.log('✅ RED BORDER: Applied to landscape container');
        }
        
        // Apply orange border to 3-column container
        const orangeContainer = document.querySelector('.orange-container') as HTMLElement;
        if (orangeContainer) {
          orangeContainer.style.setProperty('border', '2px solid orange', 'important');
          orangeContainer.style.setProperty('position', 'absolute', 'important');
          orangeContainer.style.setProperty('top', `${titleAreaHeight + 30}px`, 'important');
          orangeContainer.style.setProperty('left', '0px', 'important');
          orangeContainer.style.setProperty('width', `${orangeBorder.width}px`, 'important');
          orangeContainer.style.setProperty('height', `${orangeBorder.height}px`, 'important');
          orangeContainer.style.setProperty('display', 'flex', 'important');
          orangeContainer.style.setProperty('gap', `${columnGap}px`, 'important');
          
          console.log('✅ ORANGE BORDER: Applied to 3-column container');
        }
        
                 // Position submit button completely above orange border
         const submitButtonElement = document.querySelector('.landscape-submit-button') as HTMLElement;
         if (submitButtonElement) {
           submitButtonElement.style.setProperty('position', 'absolute', 'important');
           submitButtonElement.style.setProperty('top', `${titleAreaHeight + 30 - 96}px`, 'important');
           submitButtonElement.style.setProperty('left', `${(columnWidth / 2) - 38}px`, 'important');
           submitButtonElement.style.setProperty('z-index', '100', 'important');
           submitButtonElement.style.setProperty('border', '2px solid lime', 'important');
           
           console.log('✅ SUBMIT BUTTON: Positioned completely above orange border (96px clearance)');
         }
        
        // Smart scaling: Only scale Number Selection buttons to fit remaining space
        setTimeout(() => {
          const column1 = document.querySelector('.landscape-column:first-child') as HTMLElement;
          if (column1) {
            const selectionBlock = column1.querySelector('div:last-child') as HTMLElement;
            if (selectionBlock) {
              const numberButtons = selectionBlock.querySelectorAll('.number-button');
              
              console.log(`🎯 SMART SCALING: Found ${numberButtons.length} number buttons to scale`);
              
              if (numberButtons.length > 0) {
                // Check if Number Selection content overflows its allocated space
                const selectionContentHeight = selectionBlock.scrollHeight;
                const selectionAllocatedHeight = selectionBlock.offsetHeight;
                const selectionOverhead = 100; // Title, subtitle, padding
                const availableSelectionHeight = selectionAllocatedHeight - selectionOverhead;
                
                console.log(`   📐 Selection Content: ${selectionContentHeight}px`);
                console.log(`   📐 Selection Allocated: ${selectionAllocatedHeight}px`);
                console.log(`   📐 Selection Available: ${availableSelectionHeight}px`);
                
                if (selectionContentHeight > availableSelectionHeight) {
                  const selectionScale = Math.max(0.5, availableSelectionHeight / selectionContentHeight);
                  
                  console.log(`   🎯 SCALING NUMBER BUTTONS: ${selectionScale.toFixed(3)}x (${(selectionScale * 100).toFixed(1)}%)`);
                  
                  numberButtons.forEach(button => {
                    (button as HTMLElement).style.setProperty('transform', `scale(${selectionScale})`, 'important');
                    (button as HTMLElement).style.setProperty('transform-origin', 'center', 'important');
                  });
                  
                  console.log(`   ✅ APPLIED SCALING: ${selectionScale.toFixed(3)}x to prevent clipping`);
                } else {
                  console.log(`   ✅ NO SCALING NEEDED: Number Selection fits naturally`);
                }
              }
            }
          }
          
          // Apply minimal scaling to other columns if needed (unchanged)
          const otherColumns = document.querySelectorAll('.landscape-column:not(:first-child)');
          otherColumns.forEach((column, index) => {
            const columnElement = column as HTMLElement;
            const contentHeight = columnElement.scrollHeight;
            const availableHeight = orangeBorder.height - 10;
            
            if (contentHeight > availableHeight) {
              const scaleFactor = availableHeight / contentHeight;
              columnElement.style.setProperty('transform', `scale(${scaleFactor})`, 'important');
              columnElement.style.setProperty('transform-origin', 'top left', 'important');
              console.log(`📏 COLUMN ${index + 2} SCALED: ${scaleFactor.toFixed(3)}x to fit ${availableHeight}px`);
            } else {
              columnElement.style.setProperty('transform', 'none', 'important');
              console.log(`📏 COLUMN ${index + 2}: No scaling needed`);
            }
          });
        }, 150);
      }
    }, 100);
    
  }, []);

  return (
    <div 
      ref={landscapeRef}
      className="landscape-container"
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: 50,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pointerEvents: 'auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Title and Subtitle - Top justified, horizontally centered */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '5px',
        right: '5px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 className="landscape-title" style={{
          margin: '0 0 5px 0',
          fontSize: '1.8rem',
          fontWeight: '600'
        }}>
          PicoFermiBagel
        </h1>
        <p className="landscape-subtitle" style={{
          margin: '0',
          fontSize: '1.1rem',
          opacity: 0.9
        }}>
          A Number-based Logical Guessing Game
        </p>
      </div>
      
      {/* Submit Button - Above Column 1, NOT constrained by orange border */}
      <div className="landscape-submit-button">
        <GlobalSubmitButton />
      </div>
      
      {/* Orange Container - 3 Columns within red border */}
      <div className="orange-container">
        {/* Column 1: Your Guess + Number Selection stacked */}
        <div className="landscape-column column-1" style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          height: '100%',
          padding: '5px'
        }}>
          {/* Your Guess Block - Natural expansion */}
          <div 
            ref={guessElementRef}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '15px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}
          >
            <GuessArea />
          </div>
          
          {/* Number Selection Block - Takes remaining space */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            <SelectionArea />
          </div>
        </div>
        
        {/* Column 2: Recent Guesses */}
        <div className="landscape-column column-2" style={{
          flex: '1',
          height: '100%',
          padding: '5px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <RecentGuessHistory />
          </div>
        </div>
        
        {/* Column 3: Menu Content (Always Open, No Close Icon) */}
        <div className="landscape-column column-3" style={{
          flex: '1',
          height: '100%',
          padding: '5px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            height: '100%',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <MenuDrawerContent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandscapeLayoutClean; 