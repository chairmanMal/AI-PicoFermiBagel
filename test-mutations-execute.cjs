const { execSync } = require('child_process');

async function testMutationsExecute() {
  console.log('🧪 Executing AppSync Mutations...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    console.log(`📋 Using AppSync API: ${API_ID}\n`);
    
    // Test 1: Update Difficulty Interest
    console.log('🧪 Test 1: Executing updateDifficultyInterestWithNotification');
    const updateInterestMutation = `
      mutation UpdateDifficultyInterest {
        updateDifficultyInterestWithNotification(input: {
          difficulty: "classic"
          deviceId: "test-device-123"
          username: "testuser"
          timestamp: "2025-01-08T10:00:00Z"
        }) {
          success
          message
          newInterestCount
        }
      }
    `;
    
    try {
      console.log('📤 Sending mutation...');
      const result1 = execSync(`aws appsync evaluate-code --api-id ${API_ID} --runtime name=APPSYNC_JS,version=1.0.0 --code '${JSON.stringify({ query: updateInterestMutation })}' --context '{}'`, { encoding: 'utf8' });
      console.log('✅ updateDifficultyInterestWithNotification - EXECUTION SUCCESS');
      console.log('Response:', result1);
    } catch (error) {
      console.log('❌ updateDifficultyInterestWithNotification - EXECUTION FAILED');
      console.log('Error:', error.message);
    }
    
    console.log('');
    
    // Test 2: Join Lobby
    console.log('🧪 Test 2: Executing joinLobbyWithNotification');
    const joinLobbyMutation = `
      mutation JoinLobby {
        joinLobbyWithNotification(input: {
          difficulty: "classic"
          username: "testuser"
          deviceId: "test-device-123"
          timestamp: "2025-01-08T10:00:00Z"
        }) {
          success
          gameId
          playersWaiting
          message
        }
      }
    `;
    
    try {
      console.log('📤 Sending mutation...');
      const result2 = execSync(`aws appsync evaluate-code --api-id ${API_ID} --runtime name=APPSYNC_JS,version=1.0.0 --code '${JSON.stringify({ query: joinLobbyMutation })}' --context '{}'`, { encoding: 'utf8' });
      console.log('✅ joinLobbyWithNotification - EXECUTION SUCCESS');
      console.log('Response:', result2);
    } catch (error) {
      console.log('❌ joinLobbyWithNotification - EXECUTION FAILED');
      console.log('Error:', error.message);
    }
    
    console.log('');
    
    // Test 3: Leave Lobby
    console.log('🧪 Test 3: Executing leaveLobbyWithNotification');
    const leaveLobbyMutation = `
      mutation LeaveLobby {
        leaveLobbyWithNotification(input: {
          difficulty: "classic"
          username: "testuser"
          deviceId: "test-device-123"
          timestamp: "2025-01-08T10:00:00Z"
        })
      }
    `;
    
    try {
      console.log('📤 Sending mutation...');
      const result3 = execSync(`aws appsync evaluate-code --api-id ${API_ID} --runtime name=APPSYNC_JS,version=1.0.0 --code '${JSON.stringify({ query: leaveLobbyMutation })}' --context '{}'`, { encoding: 'utf8' });
      console.log('✅ leaveLobbyWithNotification - EXECUTION SUCCESS');
      console.log('Response:', result3);
    } catch (error) {
      console.log('❌ leaveLobbyWithNotification - EXECUTION FAILED');
      console.log('Error:', error.message);
    }
    
    console.log('');
    
    // Test 4: Start Game
    console.log('🧪 Test 4: Executing startGameWithNotification');
    const startGameMutation = `
      mutation StartGame {
        startGameWithNotification(input: {
          gameId: "game-123"
          difficulty: "classic"
          players: ["player1", "player2"]
          gameSettings: {
            rows: 1
            columns: 3
            selectionSetSize: 9
            multiRowFeedback: true
          }
          randomSeed: 12345
        }) {
          success
          gameId
          message
        }
      }
    `;
    
    try {
      console.log('📤 Sending mutation...');
      const result4 = execSync(`aws appsync evaluate-code --api-id ${API_ID} --runtime name=APPSYNC_JS,version=1.0.0 --code '${JSON.stringify({ query: startGameMutation })}' --context '{}'`, { encoding: 'utf8' });
      console.log('✅ startGameWithNotification - EXECUTION SUCCESS');
      console.log('Response:', result4);
    } catch (error) {
      console.log('❌ startGameWithNotification - EXECUTION FAILED');
      console.log('Error:', error.message);
    }
    
    console.log('\n🎯 Mutation execution testing completed!');
    console.log('\n📋 Summary:');
    console.log('- If you see "EXECUTION SUCCESS", the mutations are working');
    console.log('- If you see "EXECUTION FAILED", check the Lambda function logs');
    console.log('- Check CloudWatch logs for the pfb-lobby-management Lambda function');
    
  } catch (error) {
    console.error('❌ Error executing mutations:', error);
  }
}

testMutationsExecute(); 