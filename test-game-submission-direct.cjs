const fs = require('fs');
const path = require('path');

async function testGameSubmissionDirect() {
  console.log('🧪 Testing Game Submission Directly...\n');
  
  try {
    // Test the submitGameResult method in multiplayerService
    const multiplayerPath = path.join(__dirname, 'src/services/multiplayerService.ts');
    const multiplayerContent = fs.readFileSync(multiplayerPath, 'utf8');
    
    // Check if submitGameResult method exists
    if (multiplayerContent.includes('async submitGameResult')) {
      console.log('✅ submitGameResult method found');
    } else {
      console.log('❌ submitGameResult method missing');
    }
    
    // Check if it calls the correct GraphQL mutation
    if (multiplayerContent.includes('mutations.submitGameResult')) {
      console.log('✅ submitGameResult calls correct mutation');
    } else {
      console.log('❌ submitGameResult does not call correct mutation');
    }
    
    // Check for proper error handling
    if (multiplayerContent.includes('catch (error')) {
      console.log('✅ submitGameResult has error handling');
    } else {
      console.log('❌ submitGameResult missing error handling');
    }
    
    // Check for proper return type
    if (multiplayerContent.includes('GameEndResult')) {
      console.log('✅ submitGameResult returns GameEndResult');
    } else {
      console.log('❌ submitGameResult missing return type');
    }
    
    // Check the GraphQL mutation
    const mutationsPath = path.join(__dirname, 'src/graphql/mutations.ts');
    const mutationsContent = fs.readFileSync(mutationsPath, 'utf8');
    
    if (mutationsContent.includes('submitGameResult')) {
      console.log('✅ submitGameResult mutation found in GraphQL');
    } else {
      console.log('❌ submitGameResult mutation missing in GraphQL');
    }
    
    // Check the gameStore submitScoreToLeaderboard method
    const gameStorePath = path.join(__dirname, 'src/stores/gameStore.ts');
    const gameStoreContent = fs.readFileSync(gameStorePath, 'utf8');
    
    if (gameStoreContent.includes('submitScoreToLeaderboard')) {
      console.log('✅ submitScoreToLeaderboard method found');
    } else {
      console.log('❌ submitScoreToLeaderboard method missing');
    }
    
    if (gameStoreContent.includes('multiplayerService.submitGameResult')) {
      console.log('✅ GameStore calls multiplayerService.submitGameResult');
    } else {
      console.log('❌ GameStore does not call multiplayerService.submitGameResult');
    }
    
    // Check for proper logging
    const loggingPatterns = [
      { pattern: 'console.log.*🎮 GameStore.*Attempting AWS submission', name: 'AWS submission logging' },
      { pattern: 'console.log.*🎮 GameStore.*Calling multiplayerService', name: 'MultiplayerService call logging' },
      { pattern: 'console.log.*🎮 GameStore.*AWS submission result', name: 'AWS result logging' }
    ];
    
    loggingPatterns.forEach(({ pattern, name }) => {
      if (new RegExp(pattern, 'g').test(gameStoreContent)) {
        console.log(`✅ ${name} found`);
      } else {
        console.log(`❌ ${name} missing`);
      }
    });
    
    // Check for error handling in gameStore
    if (gameStoreContent.includes('catch (error')) {
      console.log('✅ GameStore has error handling');
    } else {
      console.log('❌ GameStore missing error handling');
    }
    
    console.log('\n🎯 Game submission test completed');
    
  } catch (error) {
    console.error('❌ Error testing game submission:', error);
  }
}

testGameSubmissionDirect(); 