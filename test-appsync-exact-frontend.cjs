const fetch = require('node-fetch').default;

async function testAppSyncExactFrontend() {
  console.log('🧪 Testing AppSync with exact frontend query...\n');
  
  // This is the exact query from src/graphql/queries.ts
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
  
  const variables = {
    difficulty: "classic",
    limit: 20
  };
  
  try {
    console.log('📤 Sending exact frontend query:');
    console.log('Query:', query);
    console.log('Variables:', JSON.stringify(variables, null, 2));
    
    const response = await fetch('https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'da2-nfhc7ukfhjaypm2ey62x22omc4'
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });
    
    const result = await response.json();
    console.log('\n📥 AppSync response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.errors) {
      console.log('\n❌ GraphQL errors:', result.errors);
    } else if (result.data) {
      console.log('\n✅ Query successful!');
      console.log('📋 Leaderboard data:', result.data.getLeaderboard);
    }
    
  } catch (error) {
    console.error('❌ Error testing AppSync query:', error.message);
  }
}

testAppSyncExactFrontend(); 