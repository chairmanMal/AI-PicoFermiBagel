import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const appsync = new AWS.AppSync();

async function testAppSyncJoinLobby() {
  console.log('🧪 Testing AppSync joinLobby directly...\n');

  const apiId = 'dzdcg7gk5zco3fu57dotwhbrdu'; // From previous test

  try {
    // Get the resolver details
    const resolver = await appsync.getResolver({
      apiId: apiId,
      typeName: 'Mutation',
      fieldName: 'joinLobby'
    }).promise();

    console.log('📋 Resolver details:', JSON.stringify(resolver, null, 2));

    // Check the request mapping template
    if (resolver.resolver.requestMappingTemplate) {
      console.log('📝 Request mapping template:');
      console.log(resolver.resolver.requestMappingTemplate);
    }

    // Check the response mapping template
    if (resolver.resolver.responseMappingTemplate) {
      console.log('📝 Response mapping template:');
      console.log(resolver.resolver.responseMappingTemplate);
    }

    // Check the data source
    if (resolver.resolver.dataSourceName) {
      console.log('📊 Data source:', resolver.resolver.dataSourceName);
    }

  } catch (error) {
    console.log('❌ Error getting resolver details:', error.message);
  }
}

testAppSyncJoinLobby(); 