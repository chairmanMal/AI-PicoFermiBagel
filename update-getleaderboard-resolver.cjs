const { AppSyncClient, UpdateResolverCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function updateGetLeaderboardResolver() {
  console.log('🔧 Updating getLeaderboard resolver to use LeaderboardDataSource...\n');
  
  try {
    console.log('🔧 Updating resolver...');
    
    await appsync.send(new UpdateResolverCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      typeName: 'Query',
      fieldName: 'getLeaderboard',
      dataSourceName: 'LeaderboardDataSource'
    }));
    
    console.log('✅ Successfully updated getLeaderboard resolver');
    
  } catch (error) {
    console.error('❌ Error updating resolver:', error.message);
  }
}

updateGetLeaderboardResolver(); 