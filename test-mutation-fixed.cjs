const { execSync } = require('child_process');

async function testMutationFixed() {
  console.log('🧪 Testing mutation after Lambda fix...\n');
  
  const mutation = `
    mutation UpdateDifficultyInterest {
      updateDifficultyInterestWithNotification(input: {
        difficulty: "classic"
        deviceId: "test-device-123"
        username: "testuser"
        timestamp: "2025-01-08T10:00:00Z"
      }) {
        success
        message
        newInterestCount
      }
    }
  `;
  
  console.log('📤 Testing mutation: updateDifficultyInterestWithNotification');
  console.log('Input:', JSON.stringify({
    difficulty: "classic",
    deviceId: "test-device-123", 
    username: "testuser",
    timestamp: "2025-01-08T10:00:00Z"
  }, null, 2));
  
  console.log('\n📋 Manual Test Instructions:');
  console.log('1. Go to AWS AppSync Console');
  console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
  console.log('3. Go to "Queries" tab');
  console.log('4. Paste this mutation:');
  console.log(mutation);
  console.log('\n5. Click "Play" to execute');
  console.log('6. Check the result - it should now return a proper response instead of null');
  
  console.log('\n🔍 Expected Result:');
  console.log('If successful, you should see something like:');
  console.log(`
{
  "data": {
    "updateDifficultyInterestWithNotification": {
      "success": true,
      "message": "Interest updated successfully",
      "newInterestCount": 1
    }
  }
}
  `);
  
  console.log('\n❌ If you still get null, the issue might be:');
  console.log('1. AppSync resolver not properly configured');
  console.log('2. DynamoDB table does not exist');
  console.log('3. Lambda execution role lacks permissions');
  console.log('4. Lambda function has runtime errors');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Test the mutation manually in AppSync Console');
  console.log('2. If it works, we can proceed with creating the other resolvers');
  console.log('3. If it fails, check CloudWatch logs for the Lambda function');
}

testMutationFixed(); 