const { AppSyncClient, ListApiKeysCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function getAppSyncApiKey() {
  console.log('🔍 Finding AppSync API key...\n');
  
  try {
    const response = await appsync.send(new ListApiKeysCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu'
    }));
    
    console.log('🔑 AppSync API keys found:');
    response.apiKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name || 'Unnamed'} (${key.id})`);
      console.log(`   Expires: ${key.expires}`);
      console.log(`   Key: ${key.key}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing AppSync API keys:', error.message);
  }
}

getAppSyncApiKey(); 