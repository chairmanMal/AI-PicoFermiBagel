const { AppSyncClient, StartQueryExecutionCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function testAppSyncMutation() {
  console.log('🧪 Testing AppSync mutation directly...\n');
  
  const mutation = `
    mutation SubmitGameResult($input: SubmitGameResultInput!) {
      submitGameResult(input: $input) {
        winner
        rankings {
          rank
          username
          score
          guesses
          hints
          timeElapsed
        }
        leaderboardUpdated
        newPersonalBest
      }
    }
  `;
  
  const variables = {
    input: {
      gameId: "test-game-" + Date.now(),
      deviceId: "test-device-" + Date.now(),
      username: "TST25",
      score: 99.5,
      guesses: 3,
      hints: 0,
      difficulty: "classic",
      gameWon: true,
      timestamp: new Date().toISOString()
    }
  };
  
  try {
    console.log('📤 Sending AppSync mutation:');
    console.log('Variables:', JSON.stringify(variables, null, 2));
    
    const response = await appsync.send(new StartQueryExecutionCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      query: mutation,
      variables: JSON.stringify(variables)
    }));
    
    console.log('\n📥 AppSync response:');
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('Errors:', JSON.stringify(response.errors, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing AppSync mutation:', error.message);
  }
}

testAppSyncMutation(); 