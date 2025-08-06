const { AppSyncClient, ListDataSourcesCommand } = require('@aws-sdk/client-appsync');

const appsync = new AppSyncClient({ region: 'us-east-1' });

async function listDataSources() {
  console.log('🔍 Listing all AppSync data sources...\n');
  
  try {
    const response = await appsync.send(new ListDataSourcesCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu'
    }));
    
    console.log('📋 Data sources found:');
    response.dataSources.forEach((ds, index) => {
      console.log(`${index + 1}. ${ds.name} (${ds.type})`);
      if (ds.type === 'AWS_LAMBDA') {
        console.log(`   Lambda ARN: ${ds.lambdaConfig?.lambdaFunctionArn}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing data sources:', error.message);
  }
}

listDataSources(); 