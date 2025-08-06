const { LambdaClient, UpdateFunctionConfigurationCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function updateLambdaConfig() {
  console.log('🔧 Updating Lambda function configuration...\n');
  
  try {
    console.log('🔧 Setting Lambda to use ES modules...');
    
    await lambda.send(new UpdateFunctionConfigurationCommand({
      FunctionName: 'pfb-leaderboard-v2',
      Runtime: 'nodejs22.x',
      Handler: 'index.handler'
    }));
    
    console.log('✅ Successfully updated Lambda configuration');
    
  } catch (error) {
    console.error('❌ Error updating Lambda configuration:', error.message);
  }
}

updateLambdaConfig(); 