import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// Configure AWS
const region = 'us-east-1';
const lambda = new LambdaClient({ region });

async function testLambdaDirect() {
  console.log('🧪 Testing Direct Lambda Leaderboard Function...\n');

  const testEvent = {
    gameId: `test-direct-${Date.now()}`,
    username: 'TestUser',
    score: 95,
    guesses: 5,
    hints: 0,
    difficulty: 'classic',
    gameWon: true,
    timestamp: new Date().toISOString()
  };

  console.log('📤 Sending test event to Lambda:');
  console.log(JSON.stringify(testEvent, null, 2));

  try {
    const command = new InvokeCommand({
      FunctionName: 'pfb-leaderboard-direct',
      Payload: JSON.stringify(testEvent)
    });

    const result = await lambda.send(command);
    
    console.log('\n📥 Lambda response:');
    console.log('Status Code:', result.StatusCode);
    
    if (result.Payload) {
      const payload = JSON.parse(new TextDecoder().decode(result.Payload));
      console.log('Response:', JSON.stringify(payload, null, 2));
    }
    
    if (result.LogResult) {
      console.log('\n📋 Lambda logs:');
      const logs = new TextDecoder().decode(Buffer.from(result.LogResult, 'base64'));
      console.log(logs);
    }

  } catch (error) {
    console.error('❌ Error invoking Lambda:', error);
  }

  console.log('\n🎯 Test complete!');
}

// Run the test
testLambdaDirect().catch(console.error); 