import { DynamoDBClient, DescribeTableCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { LambdaClient, InvokeCommand, GetFunctionCommand } from '@aws-sdk/client-lambda';

// Configure AWS
const region = 'us-east-1'; // Replace with your region
const dynamodbClient = new DynamoDBClient({ region });
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);
const lambda = new LambdaClient({ region });

async function testUsernameValidation() {
  console.log('🧪 Testing Username Validation System...\n');

  // Test 1: Check if DynamoDB table exists
  console.log('1. Checking DynamoDB table...');
  try {
    const tableResult = await dynamodbClient.send(new DescribeTableCommand({ TableName: 'pfb-usernames' }));
    console.log('✅ Table pfb-usernames exists');
    console.log(`   Status: ${tableResult.Table.TableStatus}`);
    console.log(`   Item count: ${tableResult.Table.ItemCount || 0}`);
  } catch (error) {
    console.log('❌ Table pfb-usernames does not exist or error:', error.message);
    console.log('   Please create the table using the instructions in aws-setup-username-validation.md');
    return;
  }

  // Test 2: Check if Lambda function exists
  console.log('\n2. Checking Lambda function...');
  try {
    const lambdaResult = await lambda.send(new GetFunctionCommand({ FunctionName: 'pfb-validateUsername' }));
    console.log('✅ Lambda function pfb-validateUsername exists');
    console.log(`   Runtime: ${lambdaResult.Configuration.Runtime}`);
    console.log(`   Handler: ${lambdaResult.Configuration.Handler}`);
  } catch (error) {
    console.log('❌ Lambda function pfb-validateUsername does not exist or error:', error.message);
    console.log('   Please create the function using the instructions in aws-setup-username-validation.md');
    return;
  }

  // Test 3: Test username validation directly
  console.log('\n3. Testing username validation...');
  const testUsernames = [
    'testuser',
    'admin',
    'player1',
    'invalid@username',
    'a', // too short
    'verylongusername123456789', // too long
    'user with spaces',
    'user123'
  ];

  for (const username of testUsernames) {
    try {
      const payload = {
        arguments: {
          input: {
            username: username,
            timestamp: new Date().toISOString()
          }
        }
      };

      const result = await lambda.send(new InvokeCommand({
        FunctionName: 'pfb-validateUsername',
        Payload: JSON.stringify(payload)
      }));

      const responseText = new TextDecoder().decode(result.Payload);
      const response = JSON.parse(responseText);
      console.log(`   "${username}": ${response.available ? '✅ Available' : '❌ Not available'}`);
      if (!response.available && response.suggestions.length > 0) {
        console.log(`      Suggestions: ${response.suggestions.join(', ')}`);
      }
    } catch (error) {
      console.log(`   "${username}": ❌ Error - ${error.message}`);
    }
  }

  // Test 4: Check existing usernames in DynamoDB
  console.log('\n4. Checking existing usernames in DynamoDB...');
  try {
    const scanResult = await dynamodbClient.send(new ScanCommand({
      TableName: 'pfb-usernames',
      Limit: 10
    }));

    console.log(`   Found ${scanResult.Items.length} usernames:`);
    scanResult.Items.forEach(item => {
      console.log(`     - ${item.username.S} (device: ${item.deviceId.S}, active: ${item.isActive.BOOL})`);
    });
  } catch (error) {
    console.log('   ❌ Error scanning table:', error.message);
  }

  // Test 5: Test AppSync integration (if endpoint available)
  console.log('\n5. Testing AppSync integration...');
  const APPSYNC_ENDPOINT = process.env.APPSYNC_ENDPOINT;
  const APPSYNC_API_KEY = process.env.APPSYNC_API_KEY;

  if (APPSYNC_ENDPOINT && APPSYNC_API_KEY) {
    try {
      const query = `
        mutation ValidateUsername($input: UsernameValidationInput!) {
          validateUsername(input: $input) {
            available
            message
            suggestions
          }
        }
      `;

      const response = await fetch(APPSYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': APPSYNC_API_KEY
        },
        body: JSON.stringify({
          query: query,
          variables: {
            input: {
              username: 'testuser',
              timestamp: new Date().toISOString()
            }
          }
        })
      });

      const result = await response.json();
      if (result.data) {
        console.log('✅ AppSync integration working');
        console.log(`   Result: ${JSON.stringify(result.data.validateUsername)}`);
      } else {
        console.log('❌ AppSync error:', result.errors);
      }
    } catch (error) {
      console.log('❌ AppSync test failed:', error.message);
    }
  } else {
    console.log('   ⚠️  APPSYNC_ENDPOINT and APPSYNC_API_KEY not set');
    console.log('   Set these environment variables to test AppSync integration');
  }

  console.log('\n🎯 Username validation test complete!');
  console.log('\nNext steps:');
  console.log('1. Deploy the backend components if any tests failed');
  console.log('2. Test the frontend integration');
  console.log('3. Monitor CloudWatch logs for any errors');
}

// Run the test
testUsernameValidation().catch(console.error); 