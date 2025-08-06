const fetch = require('node-fetch').default;

async function testAppSyncGetLeaderboard() {
  console.log('🧪 Testing getLeaderboard AppSync query directly...\n');
  
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
    limit: 10
  };
  
  try {
    console.log('📤 Sending getLeaderboard query:');
    console.log('Variables:', JSON.stringify(variables, null, 2));
    
    const response = await fetch('https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'da2-nfhc7ukfhjaypm2ey62x22omc4' // Using the API key from earlier
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
    console.error('❌ Error testing getLeaderboard query:', error.message);
  }
}

testAppSyncGetLeaderboard(); 