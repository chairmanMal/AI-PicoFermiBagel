const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function testAppSyncFormat() {
  console.log('🧪 Testing pfb-leaderboard-v2 with AppSync format...\n');
  
  // This is the exact format AppSync sends to Lambda
  const testEvent = {
    version: "2017-02-28",
    operation: "Invoke",
    payload: {
      field: "submitGameResult",
      arguments: {
        input: {
          gameId: "test-game-123",
          deviceId: "test-device-456",
          username: "TST25",
          score: 97.63,
          guesses: 2,
          hints: 0,
          difficulty: "classic",
          gameWon: true,
          timestamp: "2025-08-05T07:10:11.739Z"
        }
      },
      identity: null
    }
  };
  
  try {
    console.log('📤 Sending AppSync-formatted event to pfb-leaderboard-v2:');
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

testAppSyncFormat(); 