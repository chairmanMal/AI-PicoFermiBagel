const { DynamoDBClient, ListTablesCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { AppSyncClient, GetDataSourceCommand, GetResolverCommand } = require('@aws-sdk/client-appsync');
const { LambdaClient, GetFunctionCommand } = require('@aws-sdk/client-lambda');

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });
const appsync = new AppSyncClient({ region: 'us-east-1' });
const lambda = new LambdaClient({ region: 'us-east-1' });

async function debugAllResources() {
  console.log('🔍 Debugging all AWS resources...\n');

  // 1. Check DynamoDB Tables
  console.log('📋 1. DynamoDB Tables:');
  try {
    const tables = await dynamodb.send(new ListTablesCommand({}));
    console.log('   Tables found:', tables.TableNames);
    
    // Check if our tables exist
    const requiredTables = ['pfb-leaderboard-v2', 'pfb-usernames-v2', 'pfb-game-state-v2'];
    for (const tableName of requiredTables) {
      if (tables.TableNames.includes(tableName)) {
        console.log(`   ✅ ${tableName} exists`);
        try {
          const tableDesc = await dynamodb.send(new DescribeTableCommand({ TableName: tableName }));
          console.log(`      Status: ${tableDesc.Table.TableStatus}`);
        } catch (error) {
          console.log(`      ❌ Error describing ${tableName}: ${error.message}`);
        }
      } else {
        console.log(`   ❌ ${tableName} missing`);
      }
    }
  } catch (error) {
    console.log('   ❌ Error listing tables:', error.message);
  }

  // 2. Check AppSync Data Sources
  console.log('\n📡 2. AppSync Data Sources:');
  try {
    const dataSource = await appsync.send(new GetDataSourceCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      name: 'LeaderboardDataSource'
    }));
    console.log('   ✅ LeaderboardDataSource found');
    console.log(`   Lambda Function: ${dataSource.dataSource.lambdaConfig?.lambdaFunctionArn}`);
  } catch (error) {
    console.log('   ❌ Error getting data source:', error.message);
  }

  // 3. Check AppSync Resolver
  console.log('\n🔧 3. AppSync Resolver:');
  try {
    const resolver = await appsync.send(new GetResolverCommand({
      apiId: 'dzdcg7gk5zco3fu57dotwhbrdu',
      typeName: 'Mutation',
      fieldName: 'submitGameResult'
    }));
    console.log('   ✅ submitGameResult resolver found');
    console.log(`   Data Source: ${resolver.resolver.dataSourceName}`);
  } catch (error) {
    console.log('   ❌ Error getting resolver:', error.message);
  }

  // 4. Check Lambda Function
  console.log('\n⚡ 4. Lambda Function:');
  try {
    const functionDetails = await lambda.send(new GetFunctionCommand({
      FunctionName: 'pfb-leaderboard-v2'
    }));
    console.log('   ✅ pfb-leaderboard-v2 found');
    console.log(`   Runtime: ${functionDetails.Configuration.Runtime}`);
    console.log(`   Handler: ${functionDetails.Configuration.Handler}`);
    console.log(`   Role: ${functionDetails.Configuration.Role}`);
  } catch (error) {
    console.log('   ❌ Error getting function:', error.message);
  }

  console.log('\n🔍 Debug complete!');
}

debugAllResources().catch(console.error); 