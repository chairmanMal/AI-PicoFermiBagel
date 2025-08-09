const { execSync } = require('child_process');

async function createAppSyncDataSource() {
  console.log('🔧 Creating AppSync Data Source...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  const LAMBDA_FUNCTION_NAME = 'pfb-lobby-management';
  const LAMBDA_ROLE_ARN = 'arn:aws:iam::171591329315:role/service-role/pfb-auth-service-role-rteqat4u';
  
  try {
    console.log('📋 Checking existing data sources...');
    
    // List existing data sources
    const dataSources = execSync(`aws appsync list-data-sources --api-id ${API_ID} --query "dataSources[].name" --output text`, { encoding: 'utf8' });
    console.log('✅ Existing data sources:', dataSources.trim());
    
    // Check if our data source already exists
    if (dataSources.includes('pfb-lobby-management')) {
      console.log('✅ Data source pfb-lobby-management already exists');
      return;
    }
    
    console.log('📋 Creating new data source...');
    
    // Create the data source
    const createCommand = `aws appsync create-data-source \
      --api-id ${API_ID} \
      --name pfb-lobby-management \
      --type AWS_LAMBDA \
      --lambda-config lambdaFunctionArn=arn:aws:lambda:us-east-1:171591329315:function:${LAMBDA_FUNCTION_NAME},lambdaFunctionName=${LAMBDA_FUNCTION_NAME}`;
    
    execSync(createCommand, { stdio: 'inherit' });
    console.log('✅ Data source created successfully!');
    
  } catch (error) {
    console.log('❌ Error creating data source:', error.message);
    console.log('\n📋 Manual Data Source Creation Required:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Data Sources" tab');
    console.log('4. Click "Create data source"');
    console.log('5. Configure:');
    console.log('   - Name: pfb-lobby-management');
    console.log('   - Type: AWS Lambda');
    console.log('   - Lambda function: pfb-lobby-management');
    console.log('   - IAM role: arn:aws:iam::171591329315:role/service-role/pfb-auth-service-role-rteqat4u');
  }
}

createAppSyncDataSource(); 