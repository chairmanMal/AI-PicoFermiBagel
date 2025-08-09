const { execSync } = require('child_process');
const fs = require('fs');

async function testLambdaSimple() {
  console.log('🧪 Testing Lambda Function (Simple)...\n');
  
  try {
    // Create test payload
    const payload = {
      operation: 'updateDifficultyInterestWithNotification',
      input: {
        difficulty: 'classic',
        deviceId: 'test-device-123',
        username: 'testuser',
        timestamp: new Date().toISOString()
      }
    };
    
    // Write payload to file
    fs.writeFileSync('test-payload.json', JSON.stringify(payload, null, 2));
    console.log('📄 Payload written to file');
    console.log('📄 Payload content:', JSON.stringify(payload, null, 2));
    
    // Invoke Lambda function
    const result = execSync('aws lambda invoke --function-name pfb-lobby-management --payload file://test-payload.json --cli-binary-format raw-in-base64-out response.json', { encoding: 'utf8' });
    console.log('✅ Lambda function invoked successfully');
    
    // Read response
    const response = JSON.parse(fs.readFileSync('response.json', 'utf8'));
    console.log('📄 Response:', JSON.stringify(response, null, 2));
    
    // Clean up
    fs.unlinkSync('test-payload.json');
    fs.unlinkSync('response.json');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLambdaSimple(); 