const { execSync } = require('child_process');

async function buildAndReset() {
  console.log('🚀 Starting Build and AWS Reset Process...\n');
  
  try {
    // Step 1: Build the app
    console.log('📋 Step 1: Building the application...');
    console.log('Running: npm run build');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully!\n');
    
    // Step 2: Sync with Capacitor
    console.log('📋 Step 2: Syncing with Capacitor iOS...');
    console.log('Running: npx cap sync ios');
    execSync('npx cap sync ios', { stdio: 'inherit' });
    console.log('✅ Capacitor sync completed successfully!\n');
    
    // Step 3: Reset AWS data
    console.log('📋 Step 3: Resetting AWS interest data...');
    await resetAWSData();
    
    console.log('\n🎉 BUILD AND RESET COMPLETE!');
    console.log('✅ App is built and synced');
    console.log('✅ AWS data is clean and ready');
    console.log('📱 Ready to test with fresh interest data');
    
  } catch (error) {
    console.log('❌ Error during build and reset:', error.message);
    process.exit(1);
  }
}

async function resetAWSData() {
  try {
    // Reset difficulty interest table
    await resetDifficultyInterestTable();
    
    // Reset device heartbeats table
    await resetDeviceHeartbeatsTable();
    
    console.log('✅ AWS cleanup completed');
    
  } catch (error) {
    console.log('❌ Error during AWS cleanup:', error.message);
  }
}

async function resetDifficultyInterestTable() {
  try {
    const scanResult = execSync('aws dynamodb scan --table-name pfb-difficulty-interest', { encoding: 'utf8' });
    const data = JSON.parse(scanResult);
    
    if (data.Items && data.Items.length > 0) {
      console.log(`   Clearing ${data.Items.length} difficulty interest items...`);
      
      for (const item of data.Items) {
        const difficulty = item.difficulty.S;
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
      console.log(`   Clearing ${data.Items.length} device heartbeat items...`);
      
      for (const item of data.Items) {
        const deviceId = item.deviceId.S;
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

// Run the build and reset process
buildAndReset(); 