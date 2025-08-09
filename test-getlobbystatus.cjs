const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

async function testGetLobbyStatus() {
  console.log('🧪 Testing getLobbyStatus Lambda Function...\n');
  
  const functionName = 'pfb-lobby-management';
  
  try {
    console.log('📋 Calling getLobbyStatus for classic difficulty...');
    
    const payload = {
      operation: 'getLobbyStatus',
      input: {
        difficulty: 'classic'
      }
    };
    
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const params = {
      FunctionName: functionName,
      Payload: JSON.stringify(payload)
    };
    
    const result = await lambda.invoke(params).promise();
    const response = JSON.parse(result.Payload);
    
    console.log('📋 Response Status Code:', result.StatusCode);
    console.log('📋 Lambda Response:', JSON.stringify(response, null, 2));
    
    if (response && response.difficulty) {
      console.log('\n✅ Parsed Lobby Status:');
      console.log(`   Difficulty: ${response.difficulty}`);
      console.log(`   Players Waiting: ${response.playersWaiting}`);
      console.log(`   Game ID: ${response.gameId}`);
      console.log(`   Countdown: ${response.countdown}`);
      console.log(`   Players:`);
      
      if (response.players && response.players.length > 0) {
        response.players.forEach((player, index) => {
          console.log(`     ${index + 1}. ${player.username} (seat ${player.seatIndex})`);
        });
      } else {
        console.log('     No players found');
      }
    } else {
      console.log('❌ Invalid or empty response');
    }
    
  } catch (error) {
    console.error('❌ Error testing getLobbyStatus:', error);
  }
}

testGetLobbyStatus(); 