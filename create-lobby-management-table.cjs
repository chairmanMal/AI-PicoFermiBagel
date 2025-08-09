const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();

async function createLobbyManagementTable() {
  console.log('🏗️  Creating pfb-lobby-management DynamoDB table...\n');
  
  const tableName = 'pfb-lobby-management';
  
  try {
    // Check if table already exists
    try {
      const existing = await dynamodb.describeTable({ TableName: tableName }).promise();
      console.log('✅ Table already exists:', existing.Table.TableStatus);
      return;
    } catch (error) {
      if (error.code !== 'ResourceNotFoundException') {
        throw error;
      }
      console.log('📋 Table does not exist, creating...');
    }
    
    const tableParams = {
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: 'difficulty',
          KeyType: 'HASH'  // Partition key
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'difficulty',
          AttributeType: 'S'  // String
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'  // On-demand billing
    };
    
    console.log('🔨 Creating table with parameters:', JSON.stringify(tableParams, null, 2));
    
    const result = await dynamodb.createTable(tableParams).promise();
    console.log('✅ Table creation initiated:', result.TableDescription.TableStatus);
    
    // Wait for table to be active
    console.log('⏳ Waiting for table to become active...');
    await dynamodb.waitFor('tableExists', { TableName: tableName }).promise();
    
    console.log('🎉 Table created successfully and is now ACTIVE!');
    
    // Verify table structure
    const description = await dynamodb.describeTable({ TableName: tableName }).promise();
    console.log('\n📋 Table Details:');
    console.log('   Status:', description.Table.TableStatus);
    console.log('   Key Schema:', description.Table.KeySchema);
    console.log('   Billing Mode:', description.Table.BillingModeSummary?.BillingMode || 'PROVISIONED');
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  }
}

createLobbyManagementTable(); 