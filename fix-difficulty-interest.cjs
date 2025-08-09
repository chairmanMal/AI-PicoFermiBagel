const { execSync } = require('child_process');

async function fixDifficultyInterest() {
  console.log('🔧 Fixing Difficulty Interest Functionality...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    console.log('📋 Step 1: Adding getDifficultyInterestCounts query to schema...');
    
    // Create the schema addition for the missing query
    const schemaAddition = `
# Add this query to your AppSync schema
extend type Query {
  getDifficultyInterestCounts: [DifficultyInterest!]!
}

# Add this type if it doesn't exist
type DifficultyInterest {
  difficulty: String!
  interestCount: Int!
  timestamp: String!
}
    `;
    
    console.log('📝 Schema addition needed:');
    console.log(schemaAddition);
    
    console.log('\n📋 Step 2: Fixing updateDifficultyInterestWithNotification resolver...');
    
    // The resolver exists but is returning null. Let's check the Lambda function
    console.log('🔍 Checking Lambda function pfb-lobby-management...');
    
    try {
      const lambdaInfo = execSync('aws lambda get-function --function-name pfb-lobby-management --query "Configuration.FunctionName" --output text', { encoding: 'utf8' });
      console.log('✅ Lambda function exists:', lambdaInfo.trim());
    } catch (error) {
      console.log('❌ Lambda function check failed:', error.message);
    }
    
    console.log('\n📋 Step 3: Testing the current mutation...');
    
    // Test the current mutation to see the exact error
    const testMutation = `
      mutation TestUpdateDifficultyInterest {
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
    
    console.log('🧪 Test mutation to run:');
    console.log(testMutation);
    
    console.log('\n📋 Manual Steps Required:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Schema" tab');
    console.log('4. Add the getDifficultyInterestCounts query to the schema');
    console.log('5. Check the pfb-lobby-management Lambda function');
    console.log('6. Ensure the Lambda returns proper UpdateDifficultyInterestResponse');
    
    console.log('\n📋 Lambda Function Requirements:');
    console.log('The pfb-lobby-management Lambda should handle:');
    console.log('- updateDifficultyInterestWithNotification operation');
    console.log('- Return proper UpdateDifficultyInterestResponse format');
    console.log('- Track difficulty interest in DynamoDB');
    console.log('- Return { success: true, message: "Updated", newInterestCount: number }');
    
    console.log('\n📋 DynamoDB Table Requirements:');
    console.log('Ensure pfb-difficulty-interest table exists with:');
    console.log('- difficulty (String) as partition key');
    console.log('- interestCount (Number) field');
    console.log('- timestamp (String) field');
    
  } catch (error) {
    console.log('❌ Error during fix:', error.message);
  }
}

fixDifficultyInterest(); 