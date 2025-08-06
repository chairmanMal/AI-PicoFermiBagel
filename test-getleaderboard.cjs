const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function testGetLeaderboard() {
  console.log('🧪 Testing getLeaderboard functionality...\n');
  
  // This is the exact format AppSync sends for getLeaderboard
  const testEvent = {
    field: "getLeaderboard",
    arguments: {
      difficulty: "classic",
      limit: 10
    },
    identity: null
  };
  
  try {
    console.log('📤 Sending getLeaderboard event to Lambda:');
    console.log(JSON.stringify(testEvent, null, 2));
    
    const response = await lambda.send(new InvokeCommand({
      FunctionName: 'pfb-leaderboard-v2',
      Payload: JSON.stringify(testEvent)
    }));
    
    console.log('\n📥 Lambda response:');
    console.log('Status:', response.StatusCode);
    console.log('LogResult:', response.LogResult);
    
    if (response.Payload) {
      const payload = JSON.parse(Buffer.from(response.Payload).toString());
      console.log('Payload:', JSON.stringify(payload, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing getLeaderboard:', error.message);
  }
}

testGetLeaderboard(); 