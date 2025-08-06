// Using built-in fetch (Node.js 18+)

// Test AppSync submission directly
async function testAppSyncSubmission() {
  console.log('🧪 Testing AppSync Submission...\n');

  // You'll need to set these environment variables
  const APPSYNC_ENDPOINT = process.env.APPSYNC_ENDPOINT;
  const APPSYNC_API_KEY = process.env.APPSYNC_API_KEY;

  if (!APPSYNC_ENDPOINT || !APPSYNC_API_KEY) {
    console.log('❌ APPSYNC_ENDPOINT and APPSYNC_API_KEY environment variables not set');
    console.log('   Set these to test AppSync submission');
    return;
  }

  // Test the submitGameResult mutation
  const mutation = `
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

  const variables = {
    input: {
      gameId: "test-game-123",
      deviceId: "test-device-123",
      username: "testuser",
      score: 95,
      guesses: 5,
      hints: 0,
      difficulty: "classic",
      gameWon: true,
      timestamp: new Date().toISOString()
    }
  };

  try {
    console.log('1. Testing submitGameResult mutation...');
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables
      })
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.errors) {
      console.log('❌ GraphQL errors:', result.errors);
    } else if (result.data) {
      console.log('✅ Mutation successful:', result.data.submitGameResult);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  // Test the getLeaderboard query
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

  try {
    console.log('\n2. Testing getLeaderboard query...');
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY
      },
      body: JSON.stringify({
        query: query,
        variables: { difficulty: "classic", limit: 10 }
      })
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.errors) {
      console.log('❌ GraphQL errors:', result.errors);
    } else if (result.data) {
      console.log('✅ Query successful:', result.data.getLeaderboard);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n🎯 AppSync submission test complete!');
}

// Run the test
testAppSyncSubmission().catch(console.error); 