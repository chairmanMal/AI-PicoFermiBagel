const { execSync } = require('child_process');

async function testLambdaDirect() {
  console.log('🧪 Testing Lambda Function Directly...\n');
  
  const testEvent = {
    payload: {
      operation: 'updateDifficultyInterestWithNotification',
      input: {
        difficulty: 'classic',
        deviceId: 'test-device-123',
        username: 'testuser',
        timestamp: '2025-01-08T10:00:00Z'
      }
    }
  };
  
  console.log('📤 Invoking Lambda function with test event...');
  console.log('Event:', JSON.stringify(testEvent, null, 2));
  
  try {
    const result = execSync(`aws lambda invoke --function-name pfb-lobby-management --payload '${JSON.stringify(testEvent)}' response.json`, { encoding: 'utf8' });
    console.log('✅ Lambda invocation result:', result);
    
    // Read the response file
    const fs = require('fs');
    if (fs.existsSync('response.json')) {
      const response = JSON.parse(fs.readFileSync('response.json', 'utf8'));
      console.log('📥 Lambda response:', JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Lambda invocation failed:', error.message);
  }
  
  console.log('\n🔍 If the Lambda test fails, the issue might be:');
  console.log('1. Lambda function not properly deployed');
  console.log('2. DynamoDB table does not exist');
  console.log('3. Lambda execution role lacks permissions');
  console.log('4. Lambda function has runtime errors');
  
  console.log('\n📋 Manual Debugging Steps:');
  console.log('1. Go to AWS Lambda Console');
  console.log('2. Find function: pfb-lobby-management');
  console.log('3. Check the "Monitor" tab for recent invocations');
  console.log('4. Check the "Logs" tab for CloudWatch logs');
  console.log('5. Verify the DynamoDB table pfb-difficulty-interest exists');
}

testLambdaDirect(); 