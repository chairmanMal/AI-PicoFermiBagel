const { AppSyncClient, GetDataSourceCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function checkAppSyncDataSource() {
  console.log('🔍 Checking LeaderboardDataSource configuration...\n');
  
  try {
    const response = await appsync.send(new GetDataSourceCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      name: 'LeaderboardDataSource'
    }));
    
    console.log('📋 Data source details:');
    console.log('   Name:', response.dataSource.name);
    console.log('   Type:', response.dataSource.type);
    console.log('   Service Role:', response.dataSource.serviceRoleArn);
    
    if (response.dataSource.lambdaConfig) {
      console.log('   Lambda Function ARN:', response.dataSource.lambdaConfig.lambdaFunctionArn);
    }
    
  } catch (error) {
    console.error('❌ Error checking data source:', error.message);
  }
}

checkAppSyncDataSource(); 