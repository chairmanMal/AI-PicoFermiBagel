const fs = require('fs');
const path = require('path');

async function testGameProgress() {
  console.log('🧪 Testing Game Progress & Subscriptions...\n');
  
  try {
    const multiplayerPath = path.join(__dirname, 'src/services/multiplayerService.ts');
    const multiplayerContent = fs.readFileSync(multiplayerPath, 'utf8');
    
    // Test game pulse method
    if (multiplayerContent.includes('async sendGamePulse')) {
      console.log('✅ sendGamePulse method found');
    } else {
      console.log('❌ sendGamePulse method missing');
    }
    
    // Test game updates subscription
    if (multiplayerContent.includes('subscribeGameUpdates')) {
      console.log('✅ subscribeGameUpdates method found');
    } else {
      console.log('❌ subscribeGameUpdates method missing');
    }
    
    // Test game start subscription
    if (multiplayerContent.includes('subscribeGameStart')) {
      console.log('✅ subscribeGameStart method found');
    } else {
      console.log('❌ subscribeGameStart method missing');
    }
    
    // Test game end subscription
    if (multiplayerContent.includes('onGameEnd')) {
      console.log('✅ onGameEnd subscription found');
    } else {
      console.log('❌ onGameEnd subscription missing');
    }
    
    // Check for proper interfaces
    if (multiplayerContent.includes('interface GamePulseResult')) {
      console.log('✅ GamePulseResult interface found');
    } else {
      console.log('❌ GamePulseResult interface missing');
    }
    
    if (multiplayerContent.includes('interface GameUpdate')) {
      console.log('✅ GameUpdate interface found');
    } else {
      console.log('❌ GameUpdate interface missing');
    }
    
    if (multiplayerContent.includes('interface GameStartEvent')) {
      console.log('✅ GameStartEvent interface found');
    } else {
      console.log('❌ GameStartEvent interface missing');
    }
    
    if (multiplayerContent.includes('interface PlayerProgress')) {
      console.log('✅ PlayerProgress interface found');
    } else {
      console.log('❌ PlayerProgress interface missing');
    }
    
    // Check for subscription management
    if (multiplayerContent.includes('subscriptions.set')) {
      console.log('✅ Subscription management found');
    } else {
      console.log('❌ Subscription management missing');
    }
    
    // Check for cleanup methods
    if (multiplayerContent.includes('cleanup()')) {
      console.log('✅ Cleanup method found');
    } else {
      console.log('❌ Cleanup method missing');
    }
    
    // Check for error handling in game methods
    const gameErrorHandling = multiplayerContent.match(/sendGamePulse.*catch|subscribeGameUpdates.*catch/g);
    if (gameErrorHandling && gameErrorHandling.length >= 2) {
      console.log('✅ Error handling found in game methods');
    } else {
      console.log('❌ Error handling missing in game methods');
    }
    
    // Check for GraphQL subscriptions
    const subscriptionsPath = path.join(__dirname, 'src/graphql/subscriptions.ts');
    const subscriptionsContent = fs.readFileSync(subscriptionsPath, 'utf8');
    
    if (subscriptionsContent.includes('onGameUpdate')) {
      console.log('✅ onGameUpdate subscription found');
    } else {
      console.log('❌ onGameUpdate subscription missing');
    }
    
    if (subscriptionsContent.includes('onGameStart')) {
      console.log('✅ onGameStart subscription found');
    } else {
      console.log('❌ onGameStart subscription missing');
    }
    
    if (subscriptionsContent.includes('onGameEnd')) {
      console.log('✅ onGameEnd subscription found');
    } else {
      console.log('❌ onGameEnd subscription missing');
    }
    
    console.log('\n🎯 Game progress test completed');
    
  } catch (error) {
    console.error('❌ Error testing game progress:', error);
  }
}

testGameProgress(); 