const { LambdaClient, UpdateFunctionConfigurationCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function updateLambdaHandler() {
  console.log('🔧 Updating Lambda function handler...\n');
  
  try {
    console.log('🔧 Setting Lambda handler to index.mjs...');
    
    await lambda.send(new UpdateFunctionConfigurationCommand({
      FunctionName: 'pfb-leaderboard-v2',
      Runtime: 'nodejs22.x',
      Handler: 'index.handler'
    }));
    
    console.log('✅ Successfully updated Lambda handler');
    
  } catch (error) {
    console.error('❌ Error updating Lambda handler:', error.message);
  }
}

updateLambdaHandler(); 