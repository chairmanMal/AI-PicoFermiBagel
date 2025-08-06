import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

// Configure AWS
const region = 'us-east-1';
const client = new DynamoDBClient({ region });

async function checkRecentEntries() {
  console.log('🔍 Checking Recent Leaderboard Entries...\n');

  try {
    const scanResult = await client.send(new ScanCommand({
      TableName: 'pfb-mobilehub-1126398616-LeaderBoardTable',
      Limit: 50 // Increase limit to see more entries
    }));
    
    console.log(`Found ${scanResult.Items.length} total entries in leaderboard table`);
    
    // Sort by date to find recent entries
    const sortedEntries = scanResult.Items.sort((a, b) => {
      const dateA = new Date(a.Date?.S || '1970-01-01');
      const dateB = new Date(b.Date?.S || '1970-01-01');
      return dateB - dateA; // Most recent first
    });

    console.log('\nMost recent 10 entries:');
    sortedEntries.slice(0, 10).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.Initials?.S} - Score: ${item.Score?.N} - Date: ${item.Date?.S} - Id: ${item.Id?.S}`);
    });

    // Look for entries with "test" in the ID
    const testEntries = scanResult.Items.filter(item => 
      item.Id?.S?.includes('test') || item.Initials?.S?.includes('Test')
    );

    console.log(`\nFound ${testEntries.length} test entries:`);
    testEntries.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.Initials?.S} - Score: ${item.Score?.N} - Date: ${item.Date?.S} - Id: ${item.Id?.S}`);
    });

  } catch (error) {
    console.log('❌ Error scanning leaderboard table:', error.message);
  }

  console.log('\n🎯 Recent entries check complete!');
}

// Run the check
checkRecentEntries().catch(console.error); 