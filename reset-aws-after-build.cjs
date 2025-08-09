const { execSync } = require('child_process');

async function resetAWSAfterBuild() {
  console.log('🧹 Post-Build AWS Cleanup: Resetting Interest Data...\n');
  
  try {
    // Step 1: Reset difficulty interest table
    console.log('📋 Step 1: Resetting Difficulty Interest Table...');
    await resetDifficultyInterestTable();
    
    // Step 2: Reset device heartbeats table
    console.log('\n📋 Step 2: Resetting Device Heartbeats Table...');
    await resetDeviceHeartbeatsTable();
    
    console.log('\n✅ AWS CLEANUP COMPLETE!');
    console.log('🎯 Ready for clean testing with fresh interest data');
    console.log('📱 All difficulty buttons should show "0 players interested"');
    
  } catch (error) {
    console.log('❌ Error during AWS cleanup:', error.message);
  }
}

async function resetDifficultyInterestTable() {
  try {
    const scanResult = execSync('aws dynamodb scan --table-name pfb-difficulty-interest', { encoding: 'utf8' });
    const data = JSON.parse(scanResult);
    
    if (data.Items && data.Items.length > 0) {
      console.log(`   Found ${data.Items.length} difficulty interest items to delete`);
      
      for (const item of data.Items) {
        const difficulty = item.difficulty.S;
        console.log(`   Deleting difficulty: ${difficulty}`);
        
        const deleteCommand = `aws dynamodb delete-item --table-name pfb-difficulty-interest --key '{"difficulty":{"S":"${difficulty}"}}'`;
        execSync(deleteCommand, { stdio: 'pipe' });
      }
      
      console.log('   ✅ Difficulty interest table cleared');
    } else {
      console.log('   ✅ Difficulty interest table already empty');
    }
  } catch (error) {
    console.log('   ❌ Error resetting difficulty interest table:', error.message);
  }
}

async function resetDeviceHeartbeatsTable() {
  try {
    const scanResult = execSync('aws dynamodb scan --table-name pfb-device-heartbeats', { encoding: 'utf8' });
    const data = JSON.parse(scanResult);
    
    if (data.Items && data.Items.length > 0) {
      console.log(`   Found ${data.Items.length} device heartbeat items to delete`);
      
      for (const item of data.Items) {
        const deviceId = item.deviceId.S;
        console.log(`   Deleting device: ${deviceId.substring(0, 8)}...`);
        
        const deleteCommand = `aws dynamodb delete-item --table-name pfb-device-heartbeats --key '{"deviceId":{"S":"${deviceId}"}}'`;
        execSync(deleteCommand, { stdio: 'pipe' });
      }
      
      console.log('   ✅ Device heartbeats table cleared');
    } else {
      console.log('   ✅ Device heartbeats table already empty');
    }
  } catch (error) {
    console.log('   ❌ Error resetting device heartbeats table:', error.message);
  }
}

// Run the cleanup
resetAWSAfterBuild(); 