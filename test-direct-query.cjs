const { execSync } = require('child_process');

async function testDirectQuery() {
  console.log('🔍 Testing Direct AWS GraphQL Query...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  const REGION = 'us-east-1';
  
  try {
    // Create the GraphQL query
    const query = {
      query: `
        query GetDifficultyInterestCounts {
          getDifficultyInterestCounts {
            difficulty
            interestCount
            timestamp
          }
        }
      `
    };
    
    // Write query to temp file
    const fs = require('fs');
    fs.writeFileSync('temp-query.json', JSON.stringify(query, null, 2));
    
    console.log('📋 Query being sent:');
    console.log(JSON.stringify(query, null, 2));
    
    // Execute the query
    const result = execSync(`aws appsync start-schema-creation --api-id ${API_ID} --definition file://temp-query.json`, { encoding: 'utf8' });
    console.log('📋 Raw response:', result);
    
    // Clean up
    fs.unlinkSync('temp-query.json');
    
  } catch (error) {
    console.error('❌ Error testing query:', error.message);
    
    // Try a simpler approach - invoke Lambda directly
    console.log('\n🔧 Trying direct Lambda invocation...');
    try {
      const lambdaPayload = {
        operation: 'getDifficultyInterestCounts'
      };
      
      const fs = require('fs');
      fs.writeFileSync('temp-payload.json', JSON.stringify(lambdaPayload, null, 2));
      
      const lambdaResult = execSync('aws lambda invoke --function-name pfb-lobby-management --payload file://temp-payload.json response-output.json', { encoding: 'utf8' });
      console.log('📋 Lambda invocation result:', lambdaResult);
      
      const response = fs.readFileSync('response-output.json', 'utf8');
      console.log('📋 Lambda response:', response);
      
      // Clean up
      fs.unlinkSync('temp-payload.json');
      fs.unlinkSync('response-output.json');
      
    } catch (lambdaError) {
      console.error('❌ Lambda test failed:', lambdaError.message);
    }
  }
}

testDirectQuery(); 