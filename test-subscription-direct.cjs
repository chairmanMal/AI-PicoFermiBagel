const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

async function testSubscriptionResolvers() {
  console.log('🧪 Testing Subscription Resolvers Directly...\n');
  
  const functionName = 'pfb-lobby-management';
  
  try {
    console.log('📋 Testing onDifficultyInterestUpdate...');
    
    const payload = {
      operation: 'onDifficultyInterestUpdate'
    };
    
    const params = {
      FunctionName: functionName,
      Payload: JSON.stringify(payload)
    };
    
    const result = await lambda.invoke(params).promise();
    const response = JSON.parse(result.Payload);
    
    console.log('✅ onDifficultyInterestUpdate response:', response);
    
    if (response && Array.isArray(response)) {
      console.log('✅ Subscription resolver returns array (good!)');
      if (response.length > 0) {
        console.log('✅ Has data:', response);
      } else {
        console.log('⚠️ Empty array (expected if no interest)');
      }
    } else {
      console.log('❌ Subscription resolver returns wrong format!');
      console.log('Expected: Array, Got:', typeof response);
    }
    
  } catch (error) {
    console.error('❌ Error testing subscription resolver:', error.message);
  }
  
  console.log('\n🎯 If subscription resolver works but real-time updates don\'t:');
  console.log('The issue is that AppSync subscriptions need to be triggered by MUTATIONS');
  console.log('not by direct Lambda calls. The subscription should auto-trigger when');
  console.log('updateDifficultyInterestWithNotification mutation succeeds.');
}

testSubscriptionResolvers(); 