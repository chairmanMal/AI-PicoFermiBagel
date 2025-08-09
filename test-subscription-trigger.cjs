const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

async function testMutationToSubscriptionFlow() {
  console.log('🧪 Testing Mutation → Subscription Flow...\n');
  
  const functionName = 'pfb-lobby-management';
  
  try {
    console.log('📋 Step 1: Call updateDifficultyInterestWithNotification mutation...');
    
    const mutationPayload = {
      operation: 'updateDifficultyInterestWithNotification',
      input: {
        difficulty: 'classic',
        deviceId: 'test-device-123',
        username: 'TestUser',
        timestamp: new Date().toISOString()
      }
    };
    
    const mutationParams = {
      FunctionName: functionName,
      Payload: JSON.stringify(mutationPayload)
    };
    
    const mutationResult = await lambda.invoke(mutationParams).promise();
    const mutationResponse = JSON.parse(mutationResult.Payload);
    
    console.log('✅ Mutation response:', mutationResponse);
    
    // Wait a moment for potential subscription triggers
    console.log('\n📋 Step 2: Waiting 2 seconds for subscription triggers...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📋 Step 3: Manually call subscription resolver...');
    
    const subscriptionPayload = {
      operation: 'onDifficultyInterestUpdate'
    };
    
    const subscriptionParams = {
      FunctionName: functionName,
      Payload: JSON.stringify(subscriptionPayload)
    };
    
    const subscriptionResult = await lambda.invoke(subscriptionParams).promise();
    const subscriptionResponse = JSON.parse(subscriptionResult.Payload);
    
    console.log('✅ Subscription response:', subscriptionResponse);
    
    console.log('\n🎯 Analysis:');
    console.log('- Mutation succeeded:', mutationResponse.success);
    console.log('- New interest count:', mutationResponse.newInterestCount);
    console.log('- Subscription data available:', Array.isArray(subscriptionResponse));
    console.log('- Subscription data length:', subscriptionResponse?.length || 0);
    
    console.log('\n🚨 KEY INSIGHT:');
    console.log('AppSync subscriptions should auto-trigger when mutations succeed,');
    console.log('but this requires proper AppSync resolver configuration, not Lambda calls!');
    
  } catch (error) {
    console.error('❌ Error in mutation-subscription test:', error.message);
  }
}

testMutationToSubscriptionFlow(); 