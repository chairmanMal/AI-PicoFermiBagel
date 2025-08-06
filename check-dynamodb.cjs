const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function checkDynamoDB() {
  console.log('📋 Checking DynamoDB table contents...\n');

  try {
    // Check pfb-leaderboard-v2 table
    console.log('🔍 Checking pfb-leaderboard-v2 table:');
    const result = await docClient.send(new ScanCommand({
      TableName: 'pfb-leaderboard-v2',
      Limit: 10
    }));
    
    console.log(`   Items found: ${result.Items?.length || 0}`);
    if (result.Items && result.Items.length > 0) {
      console.log('   Recent items:');
      result.Items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.username} - Score: ${item.score} - ${item.timestamp}`);
      });
    } else {
      console.log('   No items found in table');
    }

  } catch (error) {
    console.error('❌ Error checking DynamoDB:', error.message);
  }
}

checkDynamoDB(); 