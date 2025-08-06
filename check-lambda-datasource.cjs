const { AppSyncClient, GetDataSourceCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function checkLambdaDataSource() {
  console.log('🔍 Checking LambdaDataSource...\n');
  
  try {
    const response = await appsync.send(new GetDataSourceCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      name: 'LambdaDataSource'
    }));
    
    console.log('📋 LambdaDataSource found:');
    console.log('Name:', response.dataSource.name);
    console.log('Type:', response.dataSource.type);
    console.log('Service Role ARN:', response.dataSource.serviceRoleArn);
    console.log('Lambda Config:', response.dataSource.lambdaConfig?.lambdaFunctionArn);
    
  } catch (error) {
    console.error('❌ Error checking LambdaDataSource:', error.message);
  }
}

checkLambdaDataSource(); 