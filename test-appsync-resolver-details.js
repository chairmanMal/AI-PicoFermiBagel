import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const appsync = new AWS.AppSync();

async function testAllResolvers() {
  console.log('🧪 Testing all AppSync resolvers...\n');

  const apiId = 'dzdcg7gk5zco3fu57dotwhbrdu';

  try {
    // Get all resolvers
    const resolvers = await appsync.listResolvers({
      apiId: apiId,
      typeName: 'Mutation'
    }).promise();

    console.log('📋 Found resolvers:', resolvers.resolvers.map(r => r.fieldName));

    for (const resolver of resolvers.resolvers) {
      console.log(`\n🔍 Checking resolver: ${resolver.fieldName}`);
      
      const resolverDetails = await appsync.getResolver({
        apiId: apiId,
        typeName: 'Mutation',
        fieldName: resolver.fieldName
      }).promise();

      console.log(`   Data source: ${resolverDetails.resolver.dataSourceName}`);
      console.log(`   Type: ${resolverDetails.resolver.typeName}`);
      console.log(`   Field: ${resolverDetails.resolver.fieldName}`);
      
      if (resolverDetails.resolver.code) {
        console.log(`   Code length: ${resolverDetails.resolver.code.length} characters`);
      }
    }

  } catch (error) {
    console.log('❌ Error getting resolver details:', error.message);
  }
}

testAllResolvers(); 