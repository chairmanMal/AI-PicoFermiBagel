import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

async function testJoinLobbyWithExistingUsername() {
  console.log('🧪 Testing joinLobby with existing username...\n');

  const existingUsername = 'testuser'; // This might already exist
  
  const testPayload = {
    field: 'joinLobby',
    arguments: {
      deviceId: 'test-device-123',
      username: existingUsername,
      difficulty: 'classic',
      timestamp: new Date().toISOString()
    },
    identity: {
      sub: 'test-user-id'
    }
  };

  try {
    console.log('📤 Sending request with existing username:', existingUsername);
    const result = await lambda.invoke({
      FunctionName: 'pfb-lobby-management',
      Payload: JSON.stringify(testPayload),
      LogType: 'Tail'
    }).promise();

    console.log('✅ Lambda function executed successfully');
    console.log('📥 Response:', JSON.parse(result.Payload));
    
    if (result.LogResult) {
      console.log('📋 Lambda Logs:');
      console.log(Buffer.from(result.LogResult, 'base64').toString());
    }

  } catch (error) {
    console.log('❌ Lambda function execution failed:', error.message);
  }
}

testJoinLobbyWithExistingUsername(); 