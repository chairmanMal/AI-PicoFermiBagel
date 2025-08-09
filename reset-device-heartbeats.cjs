const { execSync } = require('child_process');

async function resetDeviceHeartbeats() {
  console.log('🔧 Resetting Device Heartbeats in DynamoDB...\n');
  
  try {
    // Step 1: Check current data
    console.log('📋 Step 1: Checking current data in the table...');
    const scanResult = execSync('aws dynamodb scan --table-name pfb-device-heartbeats', { encoding: 'utf8' });
    const data = JSON.parse(scanResult);
    
    console.log('Current items in table:');
    console.log(JSON.stringify(data, null, 2));
    
    // Step 2: Clear all items
    console.log('\n📋 Step 2: Clearing all items from the table...');
    if (data.Items && data.Items.length > 0) {
      console.log(`Found ${data.Items.length} items to delete`);
      
      for (const item of data.Items) {
        const deviceId = item.deviceId.S;
        console.log(`Deleting device: ${deviceId}`);
        
        const deleteCommand = `aws dynamodb delete-item --table-name pfb-device-heartbeats --key '{"deviceId":{"S":"${deviceId}"}}'`;
        execSync(deleteCommand, { stdio: 'inherit' });
      }
      
      console.log('✅ All device heartbeats deleted successfully!');
    } else {
      console.log('✅ Table is already empty');
    }
    
    // Step 3: Verify table is empty
    console.log('\n📋 Step 3: Verifying the table is empty...');
    const verifyResult = execSync('aws dynamodb scan --table-name pfb-device-heartbeats', { encoding: 'utf8' });
    const verifyData = JSON.parse(verifyResult);
    
    if (verifyData.Items && verifyData.Items.length === 0) {
      console.log('Table now contains 0 items');
      console.log('✅ Device heartbeats table successfully cleared!');
    } else {
      console.log('❌ Table still contains items:', verifyData.Items);
    }
    
    console.log('\n📋 Step 4: Next Steps for Proper Cleanup');
    console.log('To prevent this issue in the future, consider:');
    console.log('1. Adding TTL (Time To Live) to the table');
    console.log('2. Implementing automatic cleanup when players leave');
    console.log('3. Adding heartbeat monitoring');
    console.log('4. Periodic cleanup of stale entries');
    
  } catch (error) {
    console.log('❌ Error during reset:', error.message);
  }
}

resetDeviceHeartbeats(); 