const fs = require('fs');
const path = require('path');

async function testImport() {
  console.log('🔧 Testing multiplayerService import...\n');
  
  try {
    // Test if the file exists
    const filePath = path.join(__dirname, 'src/services/multiplayerService.ts');
    if (fs.existsSync(filePath)) {
      console.log('✅ multiplayerService.ts file exists');
    } else {
      console.log('❌ multiplayerService.ts file does not exist');
      return;
    }
    
    // Read the file to check for syntax errors
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('✅ File can be read');
    
    // Check for the debugging logs
    if (content.includes('🔧 MultiplayerService: mutations imported:')) {
      console.log('✅ Debugging logs found in file');
    } else {
      console.log('❌ Debugging logs not found in file');
    }
    
    // Check for the getLeaderboard method
    if (content.includes('async getLeaderboard')) {
      console.log('✅ getLeaderboard method found');
    } else {
      console.log('❌ getLeaderboard method not found');
    }
    
    // Check for the new AppSync implementation
    if (content.includes('this.client.graphql')) {
      console.log('✅ AppSync implementation found');
    } else {
      console.log('❌ AppSync implementation not found');
    }
    
    // Check for old DynamoDB implementation
    if (content.includes('DynamoDB')) {
      console.log('⚠️  Old DynamoDB implementation still present');
    } else {
      console.log('✅ No old DynamoDB implementation found');
    }
    
  } catch (error) {
    console.error('❌ Error testing import:', error);
  }
}

testImport(); 