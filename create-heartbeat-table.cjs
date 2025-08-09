const { execSync } = require('child_process');

async function createHeartbeatTable() {
  console.log('🔧 Creating Device Heartbeats DynamoDB Table...\n');
  
  try {
    console.log('📋 Step 1: Creating pfb-device-heartbeats table...');
    
    const createTableCommand = `aws dynamodb create-table \
      --table-name pfb-device-heartbeats \
      --attribute-definitions AttributeName=deviceId,AttributeType=S \
      --key-schema AttributeName=deviceId,KeyType=HASH \
      --billing-mode PAY_PER_REQUEST \
      --tags Key=Project,Value=PicoFermiBagel Key=Environment,Value=Production`;
    
    execSync(createTableCommand, { stdio: 'inherit' });
    
    console.log('✅ Device heartbeats table created successfully!');
    
    console.log('\n📋 Step 2: Waiting for table to be active...');
    
    // Wait for table to be active
    const waitCommand = `aws dynamodb wait table-exists --table-name pfb-device-heartbeats`;
    execSync(waitCommand, { stdio: 'inherit' });
    
    console.log('✅ Table is now active and ready for use!');
    
    console.log('\n📋 Table Details:');
    console.log('• Table Name: pfb-device-heartbeats');
    console.log('• Primary Key: deviceId (String)');
    console.log('• Billing Mode: Pay per request');
    console.log('• TTL: 5 minutes (configured in Lambda)');
    console.log('• Purpose: Track active devices and their difficulty interests');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy the updated Lambda function with heartbeat support');
    console.log('2. Test the heartbeat functionality in the app');
    console.log('3. Monitor the table for device heartbeats');
    
  } catch (error) {
    console.log('❌ Error creating heartbeat table:', error.message);
    
    if (error.message.includes('Table already exists')) {
      console.log('ℹ️  Table already exists, continuing...');
    } else {
      console.log('\n📋 Manual Steps if CLI fails:');
      console.log('1. Go to AWS DynamoDB Console');
      console.log('2. Click "Create table"');
      console.log('3. Table name: pfb-device-heartbeats');
      console.log('4. Partition key: deviceId (String)');
      console.log('5. Billing mode: Pay per request');
      console.log('6. Click "Create"');
    }
  }
}

createHeartbeatTable(); 