// Using built-in fetch

console.log('🔗 Testing AppSync Direct Connection\n');

async function testAppSyncDirect() {
  console.log('📤 Testing submitGameResult mutation directly...');
  
  try {
    // Test data
    const testGameData = {
      gameId: `test-game-${Date.now()}`,
      deviceId: `test-device-${Date.now()}`,
      username: 'TestPlayer',
      score: 95,
      guesses: 3,
      hints: 0,
      difficulty: 'classic',
      gameWon: true,
      timestamp: new Date().toISOString()
    };
    
    console.log('📋 Test data:', testGameData);
    
    // AppSync endpoint and API key from awsConfig.ts
    const endpoint = 'https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql';
    const apiKey = 'da2-nfhc7ukfhjaypm2ey62x22omc4';
    
    const query = `
      mutation SubmitGameResult($input: GameResultInput!) {
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
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        query,
        variables: {
          input: testGameData
        }
      })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      console.log('❌ GraphQL errors:', result.errors);
    } else {
      console.log('✅ Game submission successful!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Direct AppSync test failed:', error.message);
  }
}

async function testLeaderboardQuery() {
  console.log('\n📊 Testing getLeaderboard query directly...');
  
  try {
    const endpoint = 'https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql';
    const apiKey = 'da2-nfhc7ukfhjaypm2ey62x22omc4';
    
    const query = `
      query GetLeaderboard($difficulty: String!, $limit: Int) {
        getLeaderboard(difficulty: $difficulty, limit: $limit) {
          rank
          username
          score
          timestamp
          difficulty
        }
      }
    `;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        query,
        variables: {
          difficulty: 'classic',
          limit: 10
        }
      })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      console.log('❌ GraphQL errors:', result.errors);
    } else {
      console.log('✅ Leaderboard query successful!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Leaderboard query failed:', error.message);
  }
}

async function main() {
  await testAppSyncDirect();
  await testLeaderboardQuery();
  
  console.log('\n🎯 Direct AppSync Test Complete!');
}

main().catch(console.error); 