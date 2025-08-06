import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';

// Configure AWS
const region = 'us-east-1';
const lambda = new LambdaClient({ region });

async function checkLambdaFunctions() {
  console.log('🔍 Checking Lambda Functions...\n');

  try {
    const result = await lambda.send(new ListFunctionsCommand({}));
    const pfbFunctions = result.Functions.filter(func => 
      func.FunctionName.includes('pfb') || 
      func.FunctionName.includes('submit') ||
      func.FunctionName.includes('game')
    );
    
    console.log(`Found ${pfbFunctions.length} relevant Lambda functions:`);
    pfbFunctions.forEach(func => {
      console.log(`  - ${func.FunctionName} (Runtime: ${func.Runtime})`);
    });
  } catch (error) {
    console.log('❌ Error listing Lambda functions:', error.message);
  }

  console.log('\n🎯 Lambda function check complete!');
}

// Run the check
checkLambdaFunctions().catch(console.error); 