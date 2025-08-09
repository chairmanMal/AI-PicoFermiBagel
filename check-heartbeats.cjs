const { execSync } = require('child_process');

async function checkHeartbeats() {
  console.log('🔍 Checking Device Heartbeats Table...\n');
  
  try {
    const result = execSync('aws dynamodb scan --table-name pfb-device-heartbeats', { encoding: 'utf8' });
    const data = JSON.parse(result);
    
    console.log('📋 Heartbeats data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.Items && data.Items.length > 0) {
      console.log('\n📋 Active devices:');
      data.Items.forEach((item, index) => {
        const deviceId = item.deviceId.S;
        const difficulty = item.difficulty.S;
        const lastHeartbeat = item.lastHeartbeat.S;
        const username = item.username?.S || 'Unknown';
        
        console.log(`${index + 1}. Device: ${deviceId.substring(0, 8)}..., Difficulty: ${difficulty}, User: ${username}, Last: ${lastHeartbeat}`);
      });
    } else {
      console.log('❌ No active device heartbeats found!');
    }
    
  } catch (error) {
    console.error('❌ Error checking heartbeats:', error.message);
  }
}

checkHeartbeats(); 