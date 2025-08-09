const https = require('https');

async function testAppSyncGetLobbyStatus() {
  console.log('🧪 Testing AppSync getLobbyStatus Query...\n');
  
  const endpoint = 'i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com';
  const apiKey = 'da2-skqwb46s2jg3rkptz3bsbniia4';
  
  const query = `
    query GetLobbyStatus($input: GetLobbyStatusInput!) {
      getLobbyStatus(input: $input) {
        difficulty
        playersWaiting
        players {
          username
          joinedAt
          seatIndex
        }
        gameId
        countdown
      }
    }
  `;
  
  const postData = JSON.stringify({
    query: query,
    variables: {
      input: {
        difficulty: "classic"
      }
    }
  });
  
  const options = {
    hostname: endpoint,
    port: 443,
    path: '/graphql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📋 Response Status:', res.statusCode);
        console.log('📋 Response Body:', data);
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) {
            console.log('❌ GraphQL Errors:', parsed.errors);
          } else if (parsed.data && parsed.data.getLobbyStatus) {
            const lobbyStatus = parsed.data.getLobbyStatus;
            console.log('✅ Lobby Status Success:');
            console.log(`   Difficulty: ${lobbyStatus.difficulty}`);
            console.log(`   Players Waiting: ${lobbyStatus.playersWaiting}`);
            console.log(`   Game ID: ${lobbyStatus.gameId}`);
            console.log(`   Countdown: ${lobbyStatus.countdown}`);
            console.log(`   Players:`);
            
            if (lobbyStatus.players && lobbyStatus.players.length > 0) {
              lobbyStatus.players.forEach((player, index) => {
                console.log(`     ${index + 1}. ${player.username} (seat ${player.seatIndex})`);
              });
            } else {
              console.log('     No players found');
            }
          } else {
            console.log('❌ No data returned:', parsed);
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', e.message);
        }
        
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ Request Error:', e.message);
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
}

testAppSyncGetLobbyStatus().catch(console.error); 