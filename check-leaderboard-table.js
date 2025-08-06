import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

// Configure AWS
const region = 'us-east-1';
const dynamodbClient = new DynamoDBClient({ region });

async function checkLeaderboardTable() {
  console.log('🔍 Checking Leaderboard Table Contents...\n');

  try {
    const scanResult = await dynamodbClient.send(new ScanCommand({
      TableName: 'pfb-mobilehub-1126398616-LeaderBoardTable',
      Limit: 10
    }));
    
    console.log(`Found ${scanResult.Items.length} entries in leaderboard table:`);
    scanResult.Items.forEach((item, index) => {
      console.log(`\nEntry ${index + 1}:`);
      Object.keys(item).forEach(key => {
        const value = item[key];
        if (value.S) console.log(`  ${key}: ${value.S}`);
        else if (value.N) console.log(`  ${key}: ${value.N}`);
        else if (value.BOOL !== undefined) console.log(`  ${key}: ${value.BOOL}`);
        else console.log(`  ${key}: ${JSON.stringify(value)}`);
      });
    });
  } catch (error) {
    console.log('❌ Error scanning leaderboard table:', error.message);
  }

  console.log('\n🎯 Table check complete!');
}

// Run the check
checkLeaderboardTable().catch(console.error); 