const { execSync } = require('child_process');
const fs = require('fs');

async function testMutationsComprehensive() {
  console.log('🧪 Comprehensive Mutation Testing...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  // Test 1: Check if DynamoDB tables exist
  console.log('📋 Test 1: Checking DynamoDB Tables...');
  try {
    const tables = execSync('aws dynamodb list-tables --query "TableNames[?contains(@, \'pfb\')]" --output text', { encoding: 'utf8' });
    console.log('✅ Found tables:', tables.trim());
  } catch (error) {
    console.log('❌ Error checking DynamoDB tables:', error.message);
  }
  
  // Test 2: Check Lambda function
  console.log('\n📋 Test 2: Checking Lambda Function...');
  try {
    const lambdaInfo = execSync(`aws lambda get-function --function-name pfb-lobby-management --query "Configuration.FunctionName" --output text`, { encoding: 'utf8' });
    console.log('✅ Lambda function exists:', lambdaInfo.trim());
  } catch (error) {
    console.log('❌ Lambda function check failed:', error.message);
  }
  
  // Test 3: Check AppSync schema
  console.log('\n📋 Test 3: Checking AppSync Schema...');
  try {
    const schema = execSync(`aws appsync get-introspection-schema --api-id ${API_ID} --format JSON --output text`, { encoding: 'utf8' });
    console.log('✅ AppSync schema retrieved successfully');
    
    // Check if our mutations exist in schema
    const mutations = ['updateDifficultyInterestWithNotification', 'joinLobbyWithNotification', 'leaveLobbyWithNotification', 'startGameWithNotification'];
    mutations.forEach(mutation => {
      if (schema.includes(mutation)) {
        console.log(`✅ Mutation ${mutation} found in schema`);
      } else {
        console.log(`❌ Mutation ${mutation} NOT found in schema`);
      }
    });
  } catch (error) {
    console.log('❌ Error checking AppSync schema:', error.message);
  }
  
  // Test 4: Check AppSync resolvers
  console.log('\n📋 Test 4: Checking AppSync Resolvers...');
  try {
    const resolvers = execSync(`aws appsync list-resolvers --api-id ${API_ID} --type-name Mutation --query "resolvers[].fieldName" --output text`, { encoding: 'utf8' });
    console.log('✅ Available resolvers:', resolvers.trim());
    
    const expectedResolvers = ['updateDifficultyInterestWithNotification', 'joinLobbyWithNotification', 'leaveLobbyWithNotification', 'startGameWithNotification'];
    expectedResolvers.forEach(resolver => {
      if (resolvers.includes(resolver)) {
        console.log(`✅ Resolver ${resolver} exists`);
      } else {
        console.log(`❌ Resolver ${resolver} MISSING`);
      }
    });
  } catch (error) {
    console.log('❌ Error checking AppSync resolvers:', error.message);
  }
  
  // Test 5: Test Lambda function directly
  console.log('\n📋 Test 5: Testing Lambda Function Directly...');
  try {
    const testEvent = {
      payload: {
        operation: 'updateDifficultyInterestWithNotification',
        input: {
          difficulty: 'classic',
          deviceId: 'test-device-123',
          username: 'testuser',
          timestamp: '2025-01-08T10:00:00Z'
        }
      }
    };
    
    // Write test event to file
    fs.writeFileSync('test-event.json', JSON.stringify(testEvent, null, 2));
    
    const lambdaResult = execSync(`aws lambda invoke --function-name pfb-lobby-management --payload file://test-event.json response.json`, { encoding: 'utf8' });
    console.log('✅ Lambda invocation result:', lambdaResult);
    
    if (fs.existsSync('response.json')) {
      const response = JSON.parse(fs.readFileSync('response.json', 'utf8'));
      console.log('📥 Lambda response:', JSON.stringify(response, null, 2));
    }
    
    // Cleanup
    if (fs.existsSync('test-event.json')) fs.unlinkSync('test-event.json');
    if (fs.existsSync('response.json')) fs.unlinkSync('response.json');
    
  } catch (error) {
    console.log('❌ Lambda test failed:', error.message);
  }
  
  // Test 6: Test AppSync mutation via CLI
  console.log('\n📋 Test 6: Testing AppSync Mutation via CLI...');
  try {
    const mutation = `
      mutation UpdateDifficultyInterest {
        updateDifficultyInterestWithNotification(input: {
          difficulty: "classic"
          deviceId: "test-device-123"
          username: "testuser"
          timestamp: "2025-01-08T10:00:00Z"
        }) {
          success
          message
          newInterestCount
        }
      }
    `;
    
    fs.writeFileSync('test-mutation.graphql', mutation);
    
    const appsyncResult = execSync(`aws appsync evaluate-code --api-id ${API_ID} --code file://test-mutation.graphql --runtime name=APPSYNC_JS,runtimeVersion=1.0.0`, { encoding: 'utf8' });
    console.log('✅ AppSync mutation test result:', appsyncResult);
    
    // Cleanup
    if (fs.existsSync('test-mutation.graphql')) fs.unlinkSync('test-mutation.graphql');
    
  } catch (error) {
    console.log('❌ AppSync mutation test failed:', error.message);
  }
  
  console.log('\n🔍 Summary of Issues:');
  console.log('1. Check if DynamoDB tables exist: pfb-difficulty-interest, pfb-lobby-status');
  console.log('2. Check if Lambda function has proper code');
  console.log('3. Check if AppSync schema includes the mutations');
  console.log('4. Check if AppSync resolvers are properly configured');
  console.log('5. Check if Lambda execution role has proper permissions');
  
  console.log('\n📋 Manual Debugging Steps:');
  console.log('1. Go to AWS DynamoDB Console - check if tables exist');
  console.log('2. Go to AWS Lambda Console - check pfb-lobby-management function');
  console.log('3. Go to AWS AppSync Console - check schema and resolvers');
  console.log('4. Check CloudWatch logs for Lambda function errors');
  console.log('5. Test mutation manually in AppSync Console');
}

testMutationsComprehensive(); 