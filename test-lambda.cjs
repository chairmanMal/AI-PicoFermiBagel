const { execSync } = require('child_process');
const fs = require('fs');

async function testLambda() {
  console.log('🧪 Testing Lambda Function...\n');
  
  try {
    // Create test payload
    const payload = {
      operation: 'getDifficultyInterestCounts'
    };
    
    fs.writeFileSync('test-payload.json', JSON.stringify(payload));
    console.log('✅ Created test payload');
    
    // Test the Lambda function
    console.log('🚀 Invoking Lambda function...');
    execSync('aws lambda invoke --function-name pfb-lobby-management --payload file://test-payload.json response.json', { stdio: 'inherit' });
    
    // Read the response
    const response = fs.readFileSync('response.json', 'utf8');
    console.log('✅ Lambda response:', response);
    
    // Clean up
    fs.unlinkSync('test-payload.json');
    fs.unlinkSync('response.json');
    
  } catch (error) {
    console.log('❌ Lambda test failed:', error.message);
  }
}

testLambda(); 