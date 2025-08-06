const { AppSyncClient, ListResolversCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function checkResolverDataSources() {
  console.log('🔍 Checking which resolvers use which data sources...\n');
  
  try {
    // Check Query type resolvers
    const queryResolvers = await appsync.send(new ListResolversCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      typeName: 'Query'
    }));
    
    console.log('📋 Query resolvers:');
    queryResolvers.resolvers.forEach((resolver, index) => {
      console.log(`${index + 1}. ${resolver.fieldName} -> ${resolver.dataSourceName}`);
    });
    
    console.log('\n📋 Mutation resolvers:');
    const mutationResolvers = await appsync.send(new ListResolversCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      typeName: 'Mutation'
    }));
    
    mutationResolvers.resolvers.forEach((resolver, index) => {
      console.log(`${index + 1}. ${resolver.fieldName} -> ${resolver.dataSourceName}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking resolvers:', error.message);
  }
}

checkResolverDataSources(); 