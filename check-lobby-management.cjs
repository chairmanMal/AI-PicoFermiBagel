const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();

async function checkLobbyManagement() {
  console.log('🔍 Checking Lobby Management Table Contents...\n');

  try {
    const params = {
      TableName: 'pfb-lobby-management'
    };

    console.log('📋 Scanning pfb-lobby-management table...');
    const result = await dynamodb.scan(params).promise();
    
    console.log('Table contents:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📋 Parsed data:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.Items && result.Items.length > 0) {
      console.log('\n📋 Found lobbies:');
      result.Items.forEach((item, index) => {
        const difficulty = item.difficulty?.S || 'Unknown';
        const playersRaw = item.players?.L || [];
        const players = playersRaw.map(p => ({
          username: p.M?.username?.S || 'Unknown',
          deviceId: p.M?.deviceId?.S || 'Unknown',
          seatIndex: p.M?.seatIndex?.N || 'Unknown',
          joinedAt: p.M?.joinedAt?.S || 'Unknown'
        }));
        const gameActive = item.gameActive?.BOOL || false;
        const countdown = item.countdown?.N || null;
        const lastUpdated = item.lastUpdated?.S || 'Unknown';
        
        console.log(`${index + 1}. Difficulty: ${difficulty}`);
        console.log(`   Players: ${players.length}`);
        players.forEach((player, pIndex) => {
          console.log(`     ${pIndex + 1}. ${player.username} (seat ${player.seatIndex}) - ${player.deviceId.substring(0, 8)}...`);
        });
        console.log(`   Game Active: ${gameActive}`);
        console.log(`   Countdown: ${countdown}`);
        console.log(`   Last Updated: ${lastUpdated}`);
      });
    } else {
      console.log('📋 No lobbies found in table');
    }

  } catch (error) {
    console.error('❌ Error checking lobby management table:', error);
  }
}

checkLobbyManagement(); 