const fetch = require('node-fetch');

async function testAppSyncSimple() {
  console.log('🧪 Testing AppSync mutation with fetch...\n');
  
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
    
    const response = await fetch('https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'da2-xxxxxxxxxxxxxxxxxxxxxxxxxx' // You'll need to get the API key
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables
      })
    });
    
    const result = await response.json();
    console.log('\n📥 AppSync response:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing AppSync mutation:', error.message);
  }
}

testAppSyncSimple(); 