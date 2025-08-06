import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const appsync = new AWS.AppSync();

async function testDataSource() {
  console.log('🧪 Testing AppSync Data Source...\n');

  const apiId = 'dzdcg7gk5zco3fu57dotwhbrdu';

  try {
    // Get all data sources
    const dataSources = await appsync.listDataSources({
      apiId: apiId
    }).promise();

    console.log('📋 Found data sources:', dataSources.dataSources.map(ds => ds.name));

    for (const dataSource of dataSources.dataSources) {
      console.log(`\n🔍 Checking data source: ${dataSource.name}`);
      
      const dataSourceDetails = await appsync.getDataSource({
        apiId: apiId,
        name: dataSource.name
      }).promise();

      console.log(`   Type: ${dataSourceDetails.dataSource.type}`);
      console.log(`   Service role: ${dataSourceDetails.dataSource.serviceRoleArn}`);
      
      if (dataSourceDetails.dataSource.lambdaConfig) {
        console.log(`   Lambda function: ${dataSourceDetails.dataSource.lambdaConfig.lambdaFunctionArn}`);
      }
    }

  } catch (error) {
    console.log('❌ Error getting data source details:', error.message);
  }
}

testDataSource(); 