import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

async function testUsernameRegistration() {
  console.log('🧪 Testing Username Registration...\n');

  const testPayload = {
    field: 'registerUser',
    arguments: {
      deviceId: 'test-device-123',
      username: `testuser-${Date.now()}`, // Unique username
      timestamp: new Date().toISOString()
    },
    identity: {
      sub: 'test-user-id'
    }
  };

  try {
    console.log('📤 Sending registration request...');
    const result = await lambda.invoke({
      FunctionName: 'pfb-user-management',
      Payload: JSON.stringify(testPayload),
      LogType: 'Tail'
    }).promise();

    console.log('✅ Lambda function executed successfully');
    console.log('📥 Raw Response:', JSON.stringify(result, null, 2));
    
    if (result.LogResult) {
      console.log('📋 Lambda Logs:');
      console.log(Buffer.from(result.LogResult, 'base64').toString());
    }
    
    const response = JSON.parse(result.Payload);
    console.log('📥 Parsed Response:', JSON.stringify(response, null, 2));

  } catch (error) {
    console.log('❌ Lambda function execution failed:', error.message);
  }
}

testUsernameRegistration(); 