const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

async function testJoinLobbyDebug() {
  console.log('🧪 Detailed joinLobby Debug Test...\n');
  
  const functionName = 'pfb-lobby-management';
  
  try {
    // Test 1: Check if Lambda function exists
    console.log('📋 Step 1: Checking if Lambda function exists...');
    const listResult = await lambda.listFunctions({}).promise();
    const ourFunction = listResult.Functions.find(f => f.FunctionName === functionName);
    
    if (ourFunction) {
      console.log('✅ Lambda function exists');
      console.log('   Last Modified:', ourFunction.LastModified);
      console.log('   Runtime:', ourFunction.Runtime);
    } else {
      console.log('❌ Lambda function not found!');
      return;
    }
    
    // Test 2: Try a simple operation first
    console.log('\n📋 Step 2: Testing simple operation (getDifficultyInterestCounts)...');
    const simplePayload = {
      operation: 'getDifficultyInterestCounts'
    };
    
    let simpleResult = await lambda.invoke({
      FunctionName: functionName,
      Payload: JSON.stringify(simplePayload)
    }).promise();
    
    let simpleResponse = JSON.parse(simpleResult.Payload);
    console.log('📥 Simple operation response:', JSON.stringify(simpleResponse, null, 2));
    
    // Test 3: Try joinLobby with detailed logging
    console.log('\n📋 Step 3: Testing joinLobbyWithNotification...');
    const joinPayload = {
      operation: 'joinLobbyWithNotification',
      input: {
        difficulty: 'classic',
        username: 'DebugUser',
        deviceId: 'debug-device-456',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('📤 Join payload:', JSON.stringify(joinPayload, null, 2));
    
    let joinResult = await lambda.invoke({
      FunctionName: functionName,
      Payload: JSON.stringify(joinPayload)
    }).promise();
    
    let joinResponse = JSON.parse(joinResult.Payload);
    console.log('📥 Join response:', JSON.stringify(joinResponse, null, 2));
    
    // Test 4: Check if it's a permissions issue
    if (joinResponse.statusCode === 500) {
      console.log('\n📋 Step 4: Checking for DynamoDB permissions...');
      console.log('Error message:', joinResponse.body);
      
      // Check if DynamoDB table exists
      const dynamodb = new AWS.DynamoDB();
      try {
        const tables = await dynamodb.listTables({}).promise();
        console.log('📋 Available DynamoDB tables:');
        tables.TableNames.forEach(name => {
          if (name.includes('pfb')) {
            console.log('   ✅', name);
          }
        });
        
        // Check specific table
        try {
          const tableDesc = await dynamodb.describeTable({TableName: 'pfb-lobby-management'}).promise();
          console.log('✅ pfb-lobby-management table exists and is', tableDesc.Table.TableStatus);
        } catch (tableError) {
          console.log('❌ pfb-lobby-management table error:', tableError.message);
        }
        
      } catch (dbError) {
        console.log('❌ DynamoDB access error:', dbError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in debug test:', error.message);
  }
}

testJoinLobbyDebug(); 