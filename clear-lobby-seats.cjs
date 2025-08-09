const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function clearLobbySeats() {
  console.log('🧹 Clearing All Lobby Seats...\n');

  try {
    const tableName = 'pfb-lobby-management';
    
    // Get all lobby entries
    console.log('📋 Scanning lobby management table...');
    const scanResult = await dynamodb.scan({
      TableName: tableName
    }).promise();
    
    if (scanResult.Items && scanResult.Items.length > 0) {
      console.log(`Found ${scanResult.Items.length} lobby entries to clear`);
      
      for (const lobby of scanResult.Items) {
        console.log(`\nClearing seats for ${lobby.difficulty} lobby...`);
        console.log(`  Current players: ${lobby.players ? lobby.players.length : 0}`);
        
        // Clear all players and reset lobby state
        const clearedLobby = {
          ...lobby,
          players: [],
          playersWaiting: 0,
          countdown: null,
          countdownStartTime: null,
          gameActive: false,
          gameId: null,
          lastUpdated: new Date().toISOString()
        };
        
        await dynamodb.put({
          TableName: tableName,
          Item: clearedLobby
        }).promise();
        
        console.log(`  ✅ Cleared ${lobby.difficulty} lobby`);
      }
    } else {
      console.log('No lobby entries found');
    }
    
    console.log('\n✅ All lobby seats cleared!');
    console.log('🎯 All devices should now show "0 of 4 players" and empty seats');
    
  } catch (error) {
    console.error('❌ Error clearing lobby seats:', error);
  }
}

clearLobbySeats(); 