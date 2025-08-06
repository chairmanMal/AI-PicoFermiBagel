const fs = require('fs');
const path = require('path');

async function testLobbyManagement() {
  console.log('🧪 Testing Lobby Management...\n');
  
  try {
    const multiplayerPath = path.join(__dirname, 'src/services/multiplayerService.ts');
    const multiplayerContent = fs.readFileSync(multiplayerPath, 'utf8');
    
    // Test lobby join method
    if (multiplayerContent.includes('async joinLobby')) {
      console.log('✅ joinLobby method found');
    } else {
      console.log('❌ joinLobby method missing');
    }
    
    // Test lobby leave method
    if (multiplayerContent.includes('async leaveLobby')) {
      console.log('✅ leaveLobby method found');
    } else {
      console.log('❌ leaveLobby method missing');
    }
    
    // Test lobby status method
    if (multiplayerContent.includes('getLobbyStatus')) {
      console.log('✅ getLobbyStatus method found');
    } else {
      console.log('❌ getLobbyStatus method missing');
    }
    
    // Test lobby subscriptions
    if (multiplayerContent.includes('subscribeLobbyUpdates')) {
      console.log('✅ subscribeLobbyUpdates method found');
    } else {
      console.log('❌ subscribeLobbyUpdates method missing');
    }
    
    // Check for proper interfaces
    if (multiplayerContent.includes('interface LobbyJoinResult')) {
      console.log('✅ LobbyJoinResult interface found');
    } else {
      console.log('❌ LobbyJoinResult interface missing');
    }
    
    if (multiplayerContent.includes('interface LobbyUpdate')) {
      console.log('✅ LobbyUpdate interface found');
    } else {
      console.log('❌ LobbyUpdate interface missing');
    }
    
    // Check for subscription cleanup
    if (multiplayerContent.includes('unsubscribe')) {
      console.log('✅ Subscription cleanup found');
    } else {
      console.log('❌ Subscription cleanup missing');
    }
    
    // Check for error handling in lobby methods
    const lobbyErrorHandling = multiplayerContent.match(/joinLobby.*catch|leaveLobby.*catch/g);
    if (lobbyErrorHandling && lobbyErrorHandling.length >= 2) {
      console.log('✅ Error handling found in lobby methods');
    } else {
      console.log('❌ Error handling missing in lobby methods');
    }
    
    // Check for GraphQL mutations/queries
    const mutationsPath = path.join(__dirname, 'src/graphql/mutations.ts');
    const mutationsContent = fs.readFileSync(mutationsPath, 'utf8');
    
    if (mutationsContent.includes('joinLobby')) {
      console.log('✅ joinLobby mutation found');
    } else {
      console.log('❌ joinLobby mutation missing');
    }
    
    if (mutationsContent.includes('leaveLobby')) {
      console.log('✅ leaveLobby mutation found');
    } else {
      console.log('❌ leaveLobby mutation missing');
    }
    
    if (mutationsContent.includes('getLobbyStatus')) {
      console.log('✅ getLobbyStatus query found');
    } else {
      console.log('❌ getLobbyStatus query missing');
    }
    
    console.log('\n🎯 Lobby management test completed');
    
  } catch (error) {
    console.error('❌ Error testing lobby management:', error);
  }
}

testLobbyManagement(); 