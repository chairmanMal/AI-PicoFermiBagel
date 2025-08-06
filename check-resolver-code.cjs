const { AppSyncClient, GetResolverCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function checkResolverCode() {
  console.log('🔍 Checking AppSync resolver code in detail...\n');

  try {
    const resolver = await appsync.send(new GetResolverCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      typeName: 'Mutation',
      fieldName: 'submitGameResult'
    }));
    
    console.log('📋 Resolver details:');
    console.log(`   Data Source: ${resolver.resolver.dataSourceName}`);
    console.log(`   Type: ${resolver.resolver.typeName}`);
    console.log(`   Field: ${resolver.resolver.fieldName}`);
    
    if (resolver.resolver.code) {
      console.log('\n📝 Resolver code:');
      console.log(resolver.resolver.code);
    }
    
    if (resolver.resolver.requestMappingTemplate) {
      console.log('\n📝 Request mapping template:');
      console.log(resolver.resolver.requestMappingTemplate);
    }
    
    if (resolver.resolver.responseMappingTemplate) {
      console.log('\n📝 Response mapping template:');
      console.log(resolver.resolver.responseMappingTemplate);
    }
    
  } catch (error) {
    console.error('❌ Error getting resolver details:', error.message);
  }
}

checkResolverCode(); 