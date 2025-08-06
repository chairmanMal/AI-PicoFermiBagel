import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  region: 'us-east-1', // Update this to your region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();
const appsync = new AWS.AppSync();
const lambda = new AWS.Lambda();

console.log('🔍 Testing AWS Leaderboard Functionality\n');

async function testDynamoDBLeaderboard() {
  console.log('📊 Testing DynamoDB Leaderboard Table...');
  try {
    const result = await dynamodb.describeTable({ TableName: 'PicoFermiBagel-GameData' }).promise();
    console.log('✅ DynamoDB Table exists and is active');
    console.log(`   Table Status: ${result.Table.TableStatus}`);
    
    // Scan for leaderboard entries
    const scanResult = await dynamodb.scan({
      TableName: 'PicoFermiBagel-GameData',
      FilterExpression: 'begins_with(PK, :pk)',
      ExpressionAttributeValues: {
        ':pk': { S: 'LEADERBOARD#' }
      }
    }).promise();
    
    console.log(`📈 Found ${scanResult.Items.length} leaderboard entries`);
    
    if (scanResult.Items.length > 0) {
      console.log('📋 Sample entries:');
      scanResult.Items.slice(0, 5).forEach((item, index) => {
        console.log(`   ${index + 1}. PK: ${item.PK.S}, SK: ${item.SK.S}`);
        if (item.score) console.log(`      Score: ${item.score.N}`);
        if (item.username) console.log(`      Username: ${item.username.S}`);
        if (item.difficulty) console.log(`      Difficulty: ${item.difficulty.S}`);
      });
    }
  } catch (error) {
    console.log('❌ DynamoDB Table error:', error.message);
  }
}

async function testAppSyncLeaderboard() {
  console.log('\n🔗 Testing AppSync Leaderboard Resolvers...');
  try {
    // List GraphQL APIs
    const apis = await appsync.listGraphqlApis().promise();
    const pfbApi = apis.graphqlApis.find(api => api.name.includes('PicoFermiBagel'));
    
    if (pfbApi) {
      console.log(`✅ Found AppSync API: ${pfbApi.name}`);
      console.log(`   API ID: ${pfbApi.apiId}`);
      
      // List resolvers
      const resolvers = await appsync.listResolvers({
        apiId: pfbApi.apiId,
        typeName: 'Query'
      }).promise();
      
      const leaderboardResolver = resolvers.resolvers.find(r => r.fieldName === 'getLeaderboard');
      if (leaderboardResolver) {
        console.log('✅ getLeaderboard resolver exists');
        console.log(`   Resolver ARN: ${leaderboardResolver.resolverArn}`);
      } else {
        console.log('❌ getLeaderboard resolver not found');
      }
    } else {
      console.log('❌ PicoFermiBagel AppSync API not found');
    }
  } catch (error) {
    console.log('❌ AppSync error:', error.message);
  }
}

async function testLambdaFunctions() {
  console.log('\n⚡ Testing Lambda Functions...');
  try {
    // List all Lambda functions
    const functions = await lambda.listFunctions().promise();
    const pfbFunctions = functions.Functions.filter(f => f.FunctionName.includes('pfb') || f.FunctionName.includes('PicoFermiBagel'));
    
    console.log(`📋 Found ${pfbFunctions.length} PicoFermiBagel Lambda functions:`);
    pfbFunctions.forEach(func => {
      console.log(`   - ${func.FunctionName} (${func.Runtime})`);
    });
    
    if (pfbFunctions.length === 0) {
      console.log('❌ No PicoFermiBagel Lambda functions found');
      console.log('📋 All available functions:');
      functions.Functions.slice(0, 10).forEach(func => {
        console.log(`   - ${func.FunctionName}`);
      });
    }
  } catch (error) {
    console.log('❌ Lambda error:', error.message);
  }
}

async function testGameDataTable() {
  console.log('\n🎮 Testing Game Data Table...');
  try {
    // Scan for game results
    const scanResult = await dynamodb.scan({
      TableName: 'PicoFermiBagel-GameData',
      FilterExpression: 'begins_with(PK, :pk)',
      ExpressionAttributeValues: {
        ':pk': { S: 'GAME#' }
      }
    }).promise();
    
    console.log(`📈 Found ${scanResult.Items.length} game entries`);
    
    if (scanResult.Items.length > 0) {
      console.log('📋 Sample game entries:');
      scanResult.Items.slice(0, 5).forEach((item, index) => {
        console.log(`   ${index + 1}. PK: ${item.PK.S}, SK: ${item.SK.S}`);
        if (item.score) console.log(`      Score: ${item.score.N}`);
        if (item.username) console.log(`      Username: ${item.username.S}`);
        if (item.difficulty) console.log(`      Difficulty: ${item.difficulty.S}`);
        if (item.gameWon) console.log(`      Game Won: ${item.gameWon.BOOL}`);
      });
    }
  } catch (error) {
    console.log('❌ Game data scan error:', error.message);
  }
}

async function main() {
  await testDynamoDBLeaderboard();
  await testAppSyncLeaderboard();
  await testLambdaFunctions();
  await testGameDataTable();
  
  console.log('\n🎯 AWS Leaderboard Test Complete!');
  console.log('\n📝 To verify data flow:');
  console.log('1. Win a game in the app');
  console.log('2. Check console for "AWS submission result"');
  console.log('3. Run this script again to see new entries');
  console.log('4. Check leaderboard screen for AWS data');
}

main().catch(console.error); 