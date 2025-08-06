const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function testLeaderboardV2() {
  console.log('🧪 Testing pfb-leaderboard-v2 Lambda function...\n');
  
  // Test event that matches what AppSync would send for submitGameResult
  const testEvent = {
    arguments: {
      input: {
        gameId: "test-game-123",
        deviceId: "test-device-456",
        username: "TST25",
        score: 97.68,
        guesses: 2,
        hints: 0,
        difficulty: "classic",
        gameWon: true,
        timestamp: "2025-08-05T07:03:18.834Z"
      }
    },
    action: "submitGameResult"
  };
  
  try {
    console.log('📤 Sending test event to pfb-leaderboard-v2:');
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
    console.error('❌ Error testing Lambda function:', error.message);
  }
}

testLeaderboardV2(); 