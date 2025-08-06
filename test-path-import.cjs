const fs = require('fs');
const path = require('path');

async function testPathImport() {
  console.log('🔧 Testing path import...\n');
  
  try {
    // Test the exact path used in LeaderboardScreen
    const leaderboardScreenPath = path.join(__dirname, 'src/components/LeaderboardScreen.tsx');
    const multiplayerServicePath = path.join(__dirname, 'src/services/multiplayerService.ts');
    
    console.log('📁 LeaderboardScreen path:', leaderboardScreenPath);
    console.log('📁 MultiplayerService path:', multiplayerServicePath);
    
    // Check if both files exist
    if (fs.existsSync(leaderboardScreenPath)) {
      console.log('✅ LeaderboardScreen.tsx exists');
    } else {
      console.log('❌ LeaderboardScreen.tsx does not exist');
    }
    
    if (fs.existsSync(multiplayerServicePath)) {
      console.log('✅ multiplayerService.ts exists');
    } else {
      console.log('❌ multiplayerService.ts does not exist');
    }
    
    // Check the relative path from LeaderboardScreen to multiplayerService
    const relativePath = path.relative(path.dirname(leaderboardScreenPath), multiplayerServicePath);
    console.log('📁 Relative path from LeaderboardScreen to multiplayerService:', relativePath);
    
    // Check if the path '../services/multiplayerService' would work
    const expectedPath = '../services/multiplayerService';
    console.log('📁 Expected path in import:', expectedPath);
    
    // Check if the file exists at the expected path
    const expectedFullPath = path.join(path.dirname(leaderboardScreenPath), expectedPath + '.ts');
    if (fs.existsSync(expectedFullPath)) {
      console.log('✅ Expected path exists');
    } else {
      console.log('❌ Expected path does not exist');
    }
    
    // Check if there are any syntax errors in the LeaderboardScreen file
    const leaderboardContent = fs.readFileSync(leaderboardScreenPath, 'utf8');
    const importMatch = leaderboardContent.match(/import.*multiplayerService.*from.*['"]([^'"]*)['"]/);
    if (importMatch) {
      console.log('📦 Found import in LeaderboardScreen:', importMatch[0]);
      console.log('📁 Import path:', importMatch[1]);
    } else {
      console.log('❌ No multiplayerService import found in LeaderboardScreen');
    }
    
  } catch (error) {
    console.error('❌ Error testing path import:', error);
  }
}

testPathImport(); 