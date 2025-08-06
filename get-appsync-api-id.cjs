const { AppSyncClient, ListGraphqlApisCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function getAppSyncApiId() {
  console.log('🔍 Finding AppSync API...\n');
  
  try {
    const response = await appsync.send(new ListGraphqlApisCommand({}));
    
    console.log('📡 AppSync APIs found:');
    response.graphqlApis.forEach((api, index) => {
      console.log(`${index + 1}. ${api.name} (${api.apiId})`);
      console.log(`   URL: ${api.uris?.GRAPHQL || 'No URL'}`);
      console.log(`   Created: ${api.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing AppSync APIs:', error.message);
  }
}

getAppSyncApiId(); 