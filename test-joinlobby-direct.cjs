const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

async function testJoinLobbyDirect() {
  console.log('🧪 Testing joinLobby Lambda Function Directly...\n');
  
  const functionName = 'pfb-lobby-management';
  
  try {
    console.log('📋 Calling joinLobbyWithNotification...');
    
    const payload = {
      operation: 'joinLobbyWithNotification',
      input: {
        difficulty: 'classic',
        username: 'TestUser',
        deviceId: 'test-device-123',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const params = {
      FunctionName: functionName,
      Payload: JSON.stringify(payload)
    };
    
    const result = await lambda.invoke(params).promise();
    const response = JSON.parse(result.Payload);
    
    console.log('📥 Lambda Response:', JSON.stringify(response, null, 2));
    
    // Check if response has required fields
    console.log('\n🔍 Response Analysis:');
    console.log('- Has success field:', response.hasOwnProperty('success'));
    console.log('- Success value:', response.success);
    console.log('- Success type:', typeof response.success);
    console.log('- Has gameId field:', response.hasOwnProperty('gameId'));
    console.log('- Has playersWaiting field:', response.hasOwnProperty('playersWaiting'));
    console.log('- Has message field:', response.hasOwnProperty('message'));
    
    if (response.success !== true && response.success !== false) {
      console.log('❌ PROBLEM: success field is not a boolean!');
      console.log('   Expected: true or false');
      console.log('   Got:', response.success, '(type:', typeof response.success, ')');
    } else {
      console.log('✅ Success field is properly set as boolean');
    }
    
  } catch (error) {
    console.error('❌ Error testing joinLobby:', error.message);
  }
}

testJoinLobbyDirect(); 