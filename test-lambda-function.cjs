const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function testLambdaFunction() {
  console.log('🧪 Testing pfb-leaderboard-v2 Lambda function...\n');
  
  // Test event that matches what AppSync would send
  const testEvent = {
    arguments: {
      input: {
        gameId: "test-game-123",
        deviceId: "test-device-456",
        username: "TST25",
        score: 97.76,
        guesses: 2,
        hints: 0,
        difficulty: "classic",
        gameWon: true,
        timestamp: "2025-08-05T06:35:30.389Z"
      }
    },
    action: "submitGameResult"
  };
  
  try {
    console.log('📤 Sending test event to Lambda:');
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

testLambdaFunction(); 