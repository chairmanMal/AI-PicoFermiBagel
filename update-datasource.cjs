const { AppSyncClient, UpdateDataSourceCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function updateDataSource() {
  console.log('🔧 Updating LambdaDataSource to point to pfb-leaderboard-v2...\n');
  
  try {
    console.log('🔧 Updating data source...');
    
    await appsync.send(new UpdateDataSourceCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      name: 'LambdaDataSource',
      type: 'AWS_LAMBDA',
      serviceRoleArn: 'arn:aws:iam::171591329315:role/PFB-AppSync-ServiceRole',
      lambdaConfig: {
        lambdaFunctionArn: 'arn:aws:lambda:us-east-1:171591329315:function:pfb-leaderboard-v2'
      }
    }));
    
    console.log('✅ Successfully updated LambdaDataSource');
    
  } catch (error) {
    console.error('❌ Error updating data source:', error.message);
  }
}

updateDataSource(); 