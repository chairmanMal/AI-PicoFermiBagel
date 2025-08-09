const { execSync } = require('child_process');
const fs = require('fs');

async function testCompleteSetup() {
  console.log('🧪 Testing Complete Setup...\n');
  
  // 1. Test Lambda Function
  console.log('1️⃣ Testing Lambda Function...');
  try {
    const lambdaResult = execSync('aws lambda get-function --function-name pfb-lobby-management --query "Configuration.FunctionName" --output text', { encoding: 'utf8' });
    console.log('✅ Lambda function exists:', lambdaResult.trim());
  } catch (error) {
    console.log('❌ Lambda function not found or error:', error.message);
    return;
  }
  
  // 2. Test Lambda Function Directly
  console.log('\n2️⃣ Testing Lambda Function Directly...');
  try {
    const testPayload = {
      operation: 'updateDifficultyInterestWithNotification',
      input: {
        difficulty: 'classic',
        deviceId: 'test-device-123',
        username: 'testuser',
        timestamp: new Date().toISOString()
      }
    };
    
    fs.writeFileSync('test-payload.json', JSON.stringify(testPayload, null, 2));
    execSync('aws lambda invoke --function-name pfb-lobby-management --payload file://test-payload.json --cli-binary-format raw-in-base64-out response.json', { stdio: 'inherit' });
    
    const response = JSON.parse(fs.readFileSync('response.json', 'utf8'));
    console.log('✅ Lambda function works correctly');
    console.log('📄 Response:', JSON.stringify(response, null, 2));
    
    // Clean up
    fs.unlinkSync('test-payload.json');
    fs.unlinkSync('response.json');
  } catch (error) {
    console.log('❌ Lambda function invocation failed:', error.message);
  }
  
  // 3. Test AppSync API
  console.log('\n3️⃣ Testing AppSync API...');
  try {
    const apiResult = execSync('aws appsync get-graphql-api --api-id dzdcg7gk5zco3fu57dotwhbrdu --query "graphqlApi.name" --output text', { encoding: 'utf8' });
    console.log('✅ AppSync API found:', apiResult.trim());
  } catch (error) {
    console.log('❌ AppSync API not found or error:', error.message);
  }
  
  // 4. Test GraphQL Schema
  console.log('\n4️⃣ Testing GraphQL Schema...');
  try {
    execSync('aws appsync get-introspection-schema --api-id dzdcg7gk5zco3fu57dotwhbrdu --format JSON > schema.json', { stdio: 'inherit' });
    const schema = JSON.parse(fs.readFileSync('schema.json', 'utf8'));
    console.log('✅ Schema retrieved successfully');
    
    // Check for required mutations
    const mutationType = schema.data.__schema.types.find(t => t.name === 'Mutation');
    if (mutationType) {
      const mutations = mutationType.fields.map(f => f.name);
      const requiredMutations = [
        'updateDifficultyInterestWithNotification',
        'joinLobbyWithNotification',
        'leaveLobbyWithNotification',
        'startGameWithNotification'
      ];
      
      const missingMutations = requiredMutations.filter(mut => !mutations.includes(mut));
      if (missingMutations.length === 0) {
        console.log('✅ All required mutations found in schema');
      } else {
        console.log('❌ Missing mutations in schema:', missingMutations);
      }
    } else {
      console.log('❌ Mutation type not found in schema');
    }
    
    fs.unlinkSync('schema.json');
  } catch (error) {
    console.log('❌ Schema test failed:', error.message);
  }
  
  // 5. Test DynamoDB Tables
  console.log('\n5️⃣ Testing DynamoDB Tables...');
  const tables = ['pfb-difficulty-interest', 'pfb-lobby-status', 'pfb-user-profiles'];
  
  for (const table of tables) {
    try {
      execSync(`aws dynamodb describe-table --table-name ${table} --query "Table.TableName" --output text`, { stdio: 'pipe' });
      console.log(`✅ Table ${table} exists`);
    } catch (error) {
      console.log(`❌ Table ${table} not found or error`);
    }
  }
  
  // 6. Test AppSync Resolvers
  console.log('\n6️⃣ Testing AppSync Resolvers...');
  try {
    const resolvers = execSync('aws appsync list-resolvers --api-id dzdcg7gk5zco3fu57dotwhbrdu --type-name Mutation --query "resolvers[].fieldName" --output text', { encoding: 'utf8' });
    const resolverList = resolvers.trim().split('\t');
    console.log('✅ Resolvers found:', resolverList);
    
    const requiredResolvers = [
      'updateDifficultyInterestWithNotification',
      'joinLobbyWithNotification', 
      'leaveLobbyWithNotification',
      'startGameWithNotification'
    ];
    
    const missingResolvers = requiredResolvers.filter(resolver => !resolverList.includes(resolver));
    if (missingResolvers.length === 0) {
      console.log('✅ All required resolvers found');
    } else {
      console.log('❌ Missing resolvers:', missingResolvers);
    }
  } catch (error) {
    console.log('❌ Resolver test failed:', error.message);
  }
  
  console.log('\n🎯 Summary:');
  console.log('If you see any ❌ errors above, you need to:');
  console.log('1. Add missing schema types/mutations to AppSync');
  console.log('2. Create missing resolvers in AppSync');
  console.log('3. Ensure Lambda function has correct permissions');
  console.log('4. Check that DynamoDB tables exist');
}

testCompleteSetup(); 