const { execSync } = require('child_process');

async function testMutations() {
  console.log('🧪 Testing AppSync Mutations...\n');
  
  try {
    // Get the AppSync API ID
    console.log('📋 Getting AppSync API ID...');
    const apiListOutput = execSync('aws appsync list-graphql-apis --query "graphqlApis[?name==`PicoFermiBagel-Multiplayer-API`].id" --output text', { encoding: 'utf8' });
    const apiId = apiListOutput.trim();
    
    if (!apiId) {
      console.log('❌ Could not find AppSync API named "PicoFermiBagel-Multiplayer-API"');
      console.log('Available APIs:');
      const allApis = execSync('aws appsync list-graphql-apis --query "graphqlApis[].{name:name,id:id}" --output table', { encoding: 'utf8' });
      console.log(allApis);
      return;
    }
    
    console.log(`✅ Found AppSync API: ${apiId}\n`);
    
    // Test 1: Update Difficulty Interest
    console.log('🧪 Test 1: updateDifficultyInterestWithNotification');
    const updateInterestMutation = {
      query: `
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
      `
    };
    
    try {
      const result1 = execSync(`aws appsync evaluate-code --api-id ${apiId} --runtime name=APPSYNC_JS,version=1.0.0 --code "${JSON.stringify(updateInterestMutation)}" --context '{}'`, { encoding: 'utf8' });
      console.log('✅ updateDifficultyInterestWithNotification - SUCCESS');
      console.log('Response:', result1);
    } catch (error) {
      console.log('❌ updateDifficultyInterestWithNotification - FAILED');
      console.log('Error:', error.message);
    }
    
    console.log('');
    
    // Test 2: Join Lobby
    console.log('🧪 Test 2: joinLobbyWithNotification');
    const joinLobbyMutation = {
      query: `
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
      `
    };
    
    try {
      const result2 = execSync(`aws appsync evaluate-code --api-id ${apiId} --runtime name=APPSYNC_JS,version=1.0.0 --code "${JSON.stringify(joinLobbyMutation)}" --context '{}'`, { encoding: 'utf8' });
      console.log('✅ joinLobbyWithNotification - SUCCESS');
      console.log('Response:', result2);
    } catch (error) {
      console.log('❌ joinLobbyWithNotification - FAILED');
      console.log('Error:', error.message);
    }
    
    console.log('');
    
    // Test 3: Leave Lobby
    console.log('🧪 Test 3: leaveLobbyWithNotification');
    const leaveLobbyMutation = {
      query: `
        mutation LeaveLobby {
          leaveLobbyWithNotification(input: {
            difficulty: "classic"
            username: "testuser"
            deviceId: "test-device-123"
            timestamp: "2025-01-08T10:00:00Z"
          })
        }
      `
    };
    
    try {
      const result3 = execSync(`aws appsync evaluate-code --api-id ${apiId} --runtime name=APPSYNC_JS,version=1.0.0 --code "${JSON.stringify(leaveLobbyMutation)}" --context '{}'`, { encoding: 'utf8' });
      console.log('✅ leaveLobbyWithNotification - SUCCESS');
      console.log('Response:', result3);
    } catch (error) {
      console.log('❌ leaveLobbyWithNotification - FAILED');
      console.log('Error:', error.message);
    }
    
    console.log('');
    
    // Test 4: Start Game
    console.log('🧪 Test 4: startGameWithNotification');
    const startGameMutation = {
      query: `
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
      `
    };
    
    try {
      const result4 = execSync(`aws appsync evaluate-code --api-id ${apiId} --runtime name=APPSYNC_JS,version=1.0.0 --code "${JSON.stringify(startGameMutation)}" --context '{}'`, { encoding: 'utf8' });
      console.log('✅ startGameWithNotification - SUCCESS');
      console.log('Response:', result4);
    } catch (error) {
      console.log('❌ startGameWithNotification - FAILED');
      console.log('Error:', error.message);
    }
    
    console.log('\n🎯 Mutation testing completed!');
    
  } catch (error) {
    console.error('❌ Error testing mutations:', error);
  }
}

testMutations(); 