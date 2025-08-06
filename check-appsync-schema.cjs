const { AppSyncClient, GetIntrospectionSchemaCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function checkAppSyncSchema() {
  console.log('🔍 Checking AppSync schema...\n');
  
  try {
    const response = await appsync.send(new GetIntrospectionSchemaCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      format: 'SDL'
    }));
    
    console.log('📋 AppSync Schema:');
    console.log(response.schema);
    
  } catch (error) {
    console.error('❌ Error getting schema:', error.message);
  }
}

checkAppSyncSchema(); 