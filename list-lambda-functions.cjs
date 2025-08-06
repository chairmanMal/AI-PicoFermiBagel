const { LambdaClient, ListFunctionsCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function listLambdaFunctions() {
  console.log('🔍 Listing all Lambda functions...\n');
  
  try {
    const response = await lambda.send(new ListFunctionsCommand({}));
    
    console.log('📋 All Lambda functions:');
    response.Functions.forEach(func => {
      console.log(`   - ${func.FunctionName} (${func.Runtime})`);
    });
    
    console.log('\n🎯 PFB-related functions:');
    const pfbFunctions = response.Functions.filter(func => 
      func.FunctionName.includes('pfb') || 
      func.FunctionName.includes('PFB')
    );
    
    if (pfbFunctions.length > 0) {
      pfbFunctions.forEach(func => {
        console.log(`   - ${func.FunctionName} (${func.Runtime})`);
      });
    } else {
      console.log('   No PFB-related functions found');
    }
    
  } catch (error) {
    console.error('❌ Error listing Lambda functions:', error.message);
  }
}

listLambdaFunctions(); 