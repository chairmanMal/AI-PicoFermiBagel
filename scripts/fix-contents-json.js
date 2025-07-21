const fs = require('fs');
const path = require('path');

// Function to fix the Contents.json file by adding missing filenames
function fixContentsJson() {
  const contentsPath = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json');
  
  console.log('🔧 Fixing Contents.json file...');
  console.log(`File path: ${contentsPath}`);
  
  if (!fs.existsSync(contentsPath)) {
    console.error('❌ Contents.json file not found');
    return;
  }
  
  // Read the current Contents.json
  const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
  
  // Define the required filenames for each icon entry
  const requiredFilenames = {
    // iPhone icons
    'iphone-20@3x': 'icon-20@3x.png',
    'iphone-29@3x': 'icon-29@3x.png',
    'iphone-40@3x': 'icon-40@3x.png',
    'iphone-60@2x': 'icon-60@2x.png',
    'iphone-60@3x': 'icon-60@3x.png',
    
    // iPad icons (these should already be correct)
    'ipad-20@1x': 'icon-20.png',
    'ipad-20@2x': 'icon-20@2x.png',
    'ipad-29@1x': 'icon-29.png',
    'ipad-29@2x': 'icon-29@2x.png',
    'ipad-40@1x': 'icon-40.png',
    'ipad-40@2x': 'icon-40@2x.png',
    'ipad-76@1x': 'Icon-76.png',
    'ipad-76@2x': 'Icon-76@2x.png',
    'ipad-83.5@2x': 'icon-83.5@2x.png',
    
    // iOS Marketing
    'ios-marketing-1024@1x': 'icon-1024.png'
  };
  
  let fixedCount = 0;
  
  // Fix missing filenames
  contents.images.forEach((image, index) => {
    const key = `${image.idiom}-${image.size}@${image.scale}`;
    
    if (requiredFilenames[key] && !image.filename) {
      image.filename = requiredFilenames[key];
      console.log(`✅ Added filename for ${key}: ${requiredFilenames[key]}`);
      fixedCount++;
    }
  });
  
  // Write the fixed Contents.json back
  fs.writeFileSync(contentsPath, JSON.stringify(contents, null, 2));
  
  console.log(`\n🎯 Contents.json fix complete!`);
  console.log(`✅ Fixed ${fixedCount} missing filenames`);
  
  if (fixedCount === 0) {
    console.log('📝 All filenames were already present');
  }
}

// Run the script
if (require.main === module) {
  fixContentsJson();
}

module.exports = { fixContentsJson }; 