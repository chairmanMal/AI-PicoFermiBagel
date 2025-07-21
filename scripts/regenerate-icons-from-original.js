const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// iOS App Icon sizes required based on Contents.json
const iconSizes = {
  // iPhone icons
  'iphone-20@2x': { size: 40, filename: 'icon-20@2x.png' },
  'iphone-20@3x': { size: 60, filename: 'icon-20@3x.png' },
  'iphone-29@2x': { size: 58, filename: 'icon-29@2x.png' },
  'iphone-29@3x': { size: 87, filename: 'icon-29@3x.png' },
  'iphone-40@2x': { size: 80, filename: 'icon-40@2x.png' },
  'iphone-40@3x': { size: 120, filename: 'icon-40@3x.png' },
  'iphone-60@2x': { size: 120, filename: 'icon-60@2x.png' },
  'iphone-60@3x': { size: 180, filename: 'icon-60@3x.png' },
  
  // iPad icons
  'ipad-20@1x': { size: 20, filename: 'icon-20.png' },
  'ipad-20@2x': { size: 40, filename: 'icon-20@2x.png' },
  'ipad-29@1x': { size: 29, filename: 'icon-29.png' },
  'ipad-29@2x': { size: 58, filename: 'icon-29@2x.png' },
  'ipad-40@1x': { size: 40, filename: 'icon-40.png' },
  'ipad-40@2x': { size: 80, filename: 'icon-40@2x.png' },
  'ipad-76@1x': { size: 76, filename: 'Icon-76.png' },
  'ipad-76@2x': { size: 152, filename: 'Icon-76@2x.png' },
  'ipad-83.5@2x': { size: 167, filename: 'icon-83.5@2x.png' },
  
  // iOS Marketing
  'ios-marketing-1024@1x': { size: 1024, filename: 'icon-1024.png' }
};

// Function to resize icon from original 1024x1024 source
async function resizeIconFromOriginal(sourcePath, size, outputPath) {
  try {
    // Resize the original icon to the target size
    await sharp(sourcePath)
      .resize(size, size, {
        kernel: sharp.kernel.lanczos3, // High-quality resampling
        fit: 'fill'
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated: ${outputPath} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${outputPath}:`, error.message);
    return false;
  }
}

// Main function to regenerate all icons from original
async function regenerateAllIconsFromOriginal() {
  const outputDir = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');
  const sourceIcon = path.join(outputDir, 'icon-1024.png');
  
  console.log('🎨 Regenerating iOS App Icons from Original Design...');
  console.log(`Source icon: ${sourceIcon}`);
  console.log(`Output directory: ${outputDir}`);
  
  // Check if source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found:', sourceIcon);
    console.log('Please ensure the original 1024x1024 icon exists.');
    return;
  }
  
  // Create backup of current icons
  const backupDir = path.join(outputDir, 'backup_before_regeneration_' + Date.now());
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Backup current icons
  const currentFiles = fs.readdirSync(outputDir).filter(file => file.endsWith('.png'));
  currentFiles.forEach(file => {
    const sourcePath = path.join(outputDir, file);
    const backupPath = path.join(backupDir, file);
    fs.copyFileSync(sourcePath, backupPath);
  });
  console.log(`Backed up ${currentFiles.length} current icons to: ${backupDir}`);
  
  // Generate new icons from original
  let successCount = 0;
  let totalCount = Object.keys(iconSizes).length;
  
  for (const [key, config] of Object.entries(iconSizes)) {
    const { size, filename } = config;
    const outputPath = path.join(outputDir, filename);
    
    console.log(`\nGenerating ${key}: ${size}x${size} -> ${filename}`);
    
    // Resize from original
    const success = await resizeIconFromOriginal(sourceIcon, size, outputPath);
    if (success) successCount++;
  }
  
  console.log(`\n🎯 Icon regeneration complete!`);
  console.log(`✅ Successfully generated: ${successCount}/${totalCount} icons`);
  
  if (successCount === totalCount) {
    console.log('\n🚀 All icons regenerated successfully from original design!');
    console.log('📱 The app icons now have consistent design across all sizes.');
    console.log('🎨 Original design preserved in all icon sizes.');
  } else {
    console.log('\n⚠️  Some icons failed to generate. Check the errors above.');
  }
}

// Run the script
if (require.main === module) {
  regenerateAllIconsFromOriginal().catch(console.error);
}

module.exports = { regenerateAllIconsFromOriginal }; 