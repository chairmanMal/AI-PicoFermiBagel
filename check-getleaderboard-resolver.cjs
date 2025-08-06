const { AppSyncClient, GetResolverCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function checkGetLeaderboardResolver() {
  console.log('🔍 Checking getLeaderboard resolver...\n');
  
  try {
    const response = await appsync.send(new GetResolverCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      typeName: 'Query',
      fieldName: 'getLeaderboard'
    }));
    
    console.log('📋 getLeaderboard resolver found:');
    console.log('Type:', response.resolver.typeName);
    console.log('Field:', response.resolver.fieldName);
    console.log('DataSource:', response.resolver.dataSourceName);
    console.log('Request mapping template:', response.resolver.requestMappingTemplate);
    console.log('Response mapping template:', response.resolver.responseMappingTemplate);
    
  } catch (error) {
    console.error('❌ Error checking getLeaderboard resolver:', error.message);
  }
}

checkGetLeaderboardResolver(); 