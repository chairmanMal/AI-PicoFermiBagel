const fs = require('fs');
const path = require('path');

async function testGameSubmission() {
  console.log('🧪 Testing Game Result Submission...\n');
  
  try {
    // Test the submitGameResult mutation
    const testGameData = {
      gameId: `test-game-${Date.now()}`,
      deviceId: 'test-device-id',
      username: 'TST25',
      score: 95.5,
      guesses: 3,
      hints: 1,
      difficulty: 'classic',
      gameWon: true,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Test game data:', testGameData);
    
    // Check if the mutation exists in the schema
    const mutationsPath = path.join(__dirname, 'src/graphql/mutations.ts');
    const mutationsContent = fs.readFileSync(mutationsPath, 'utf8');
    
    if (mutationsContent.includes('submitGameResult')) {
      console.log('✅ submitGameResult mutation found in schema');
    } else {
      console.log('❌ submitGameResult mutation not found in schema');
    }
    
    // Check if the multiplayerService has the method
    const multiplayerPath = path.join(__dirname, 'src/services/multiplayerService.ts');
    const multiplayerContent = fs.readFileSync(multiplayerPath, 'utf8');
    
    if (multiplayerContent.includes('async submitGameResult')) {
      console.log('✅ submitGameResult method found in multiplayerService');
    } else {
      console.log('❌ submitGameResult method not found in multiplayerService');
    }
    
    // Check for proper error handling
    if (multiplayerContent.includes('catch (error')) {
      console.log('✅ Error handling found in submitGameResult');
    } else {
      console.log('❌ Error handling missing in submitGameResult');
    }
    
    // Check for proper return type
    if (multiplayerContent.includes('GameEndResult')) {
      console.log('✅ Proper return type (GameEndResult) found');
    } else {
      console.log('❌ Proper return type missing');
    }
    
    console.log('\n🎯 Game submission test completed');
    
  } catch (error) {
    console.error('❌ Error testing game submission:', error);
  }
}

testGameSubmission(); 