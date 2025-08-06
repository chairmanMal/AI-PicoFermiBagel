import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// Configure AWS
const region = 'us-east-1';
const client = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(client);

async function testWinSubmission() {
  console.log('🧪 Testing Win Submission...\n');

  // Simulate the exact data that would be submitted from a win
  const testEntry = {
    Id: `test-win-${Date.now()}`,
    Initials: 'TestUser',
    Score: 95,
    Date: new Date().toLocaleDateString('en-US'),
    Difficulty: 8,
    Attempts: 5,
    Time: 120, // 2 minutes in seconds
    Valid: 1,
    Seed: Math.floor(Math.random() * 1000000),
    RandomCount: Math.floor(Math.random() * 100),
    VersionNumber: 0
  };

  console.log('1. Attempting to write test entry to DynamoDB...');
  console.log('Entry data:', JSON.stringify(testEntry, null, 2));

  try {
    const result = await docClient.send(new PutCommand({
      TableName: 'pfb-mobilehub-1126398616-LeaderBoardTable',
      Item: testEntry
    }));

    console.log('✅ Successfully wrote to DynamoDB');
    console.log('Result:', result);
  } catch (error) {
    console.log('❌ Failed to write to DynamoDB:', error.message);
    console.log('Error details:', error);
  }

  // Check if the entry was actually written
  console.log('\n2. Checking if entry was written...');
  try {
    const { ScanCommand } = await import('@aws-sdk/client-dynamodb');
    const scanResult = await client.send(new ScanCommand({
      TableName: 'pfb-mobilehub-1126398616-LeaderBoardTable',
      FilterExpression: 'Initials = :initials',
      ExpressionAttributeValues: {
        ':initials': { S: 'TestUser' }
      },
      Limit: 5
    }));

    console.log(`Found ${scanResult.Items.length} entries with Initials = 'TestUser':`);
    scanResult.Items.forEach((item, index) => {
      console.log(`  Entry ${index + 1}: ${item.Initials?.S} - Score: ${item.Score?.N}`);
    });
  } catch (error) {
    console.log('❌ Error checking for written entries:', error.message);
  }

  console.log('\n🎯 Win submission test complete!');
}

// Run the test
testWinSubmission().catch(console.error); 