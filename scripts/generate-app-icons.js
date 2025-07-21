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

// SVG template for the PFB logo
function generatePFBLogoSVG(size) {
  const center = size / 2;
  const radius = size * 0.4; // 80% of half size for the disc
  const letterSize = size * 0.15; // Letter size relative to total size
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Radial gradient for metallic disc -->
    <radialGradient id="metallic" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#d1d5db;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9ca3af;stop-opacity:1" />
    </radialGradient>
    
    <!-- Linear gradient for brushed metal effect -->
    <linearGradient id="brushed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
      <stop offset="25%" style="stop-color:#e5e7eb;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#d1d5db;stop-opacity:1" />
      <stop offset="75%" style="stop-color:#e5e7eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#metallic)" stroke="#6b7280" stroke-width="1"/>
  
  <!-- Brushed metal texture overlay -->
  <circle cx="${center}" cy="${center}" r="${radius - 1}" fill="url(#brushed)" opacity="0.3"/>
  
  <!-- Letter F (Purple) -->
  <text x="${center}" y="${center - radius * 0.3}" 
        font-family="Arial, sans-serif" 
        font-size="${letterSize}" 
        font-weight="bold" 
        fill="#8b5cf6" 
        text-anchor="middle" 
        dominant-baseline="middle">F</text>
  
  <!-- Letter P (Blue) - rotated slightly -->
  <text x="${center - radius * 0.3}" y="${center + radius * 0.3}" 
        font-family="Arial, sans-serif" 
        font-size="${letterSize}" 
        font-weight="bold" 
        fill="#3b82f6" 
        text-anchor="middle" 
        dominant-baseline="middle"
        transform="rotate(15, ${center - radius * 0.3}, ${center + radius * 0.3})">P</text>
  
  <!-- Letter B (Orange) - rotated slightly -->
  <text x="${center + radius * 0.3}" y="${center + radius * 0.3}" 
        font-family="Arial, sans-serif" 
        font-size="${letterSize}" 
        font-weight="bold" 
        fill="#f97316" 
        text-anchor="middle" 
        dominant-baseline="middle"
        transform="rotate(-15, ${center + radius * 0.3}, ${center + radius * 0.3})">B</text>
</svg>`;
}

// Function to convert SVG to PNG using sharp
async function generatePNGFromSVG(svgContent, size, outputPath) {
  try {
    // Convert SVG to PNG using sharp
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated: ${outputPath} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${outputPath}:`, error.message);
    return false;
  }
}

// Main function to generate all icons
async function generateAllIcons() {
  const outputDir = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');
  
  console.log('🎨 Generating PFB App Icons...');
  console.log(`Output directory: ${outputDir}`);
  
  // Create backup of existing icons
  const backupDir = path.join(outputDir, 'backup_' + Date.now());
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Backup existing icons
  const existingFiles = fs.readdirSync(outputDir).filter(file => file.endsWith('.png'));
  existingFiles.forEach(file => {
    const sourcePath = path.join(outputDir, file);
    const backupPath = path.join(backupDir, file);
    fs.copyFileSync(sourcePath, backupPath);
  });
  console.log(`Backed up ${existingFiles.length} existing icons to: ${backupDir}`);
  
  // Generate new icons
  let successCount = 0;
  let totalCount = Object.keys(iconSizes).length;
  
  for (const [key, config] of Object.entries(iconSizes)) {
    const { size, filename } = config;
    const outputPath = path.join(outputDir, filename);
    
    console.log(`\nGenerating ${key}: ${size}x${size} -> ${filename}`);
    
    // Generate SVG content
    const svgContent = generatePFBLogoSVG(size);
    
    // Convert to PNG
    const success = await generatePNGFromSVG(svgContent, size, outputPath);
    if (success) successCount++;
  }
  
  console.log(`\n🎯 Icon generation complete!`);
  console.log(`✅ Successfully generated: ${successCount}/${totalCount} icons`);
  
  if (successCount === totalCount) {
    console.log('\n🚀 All icons generated successfully!');
    console.log('📱 The app icons are now ready for iOS builds.');
  } else {
    console.log('\n⚠️  Some icons failed to generate. Check the errors above.');
  }
}

// Run the script
if (require.main === module) {
  generateAllIcons().catch(console.error);
}

module.exports = { generatePFBLogoSVG, generateAllIcons }; 