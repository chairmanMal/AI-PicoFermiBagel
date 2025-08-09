const { execSync } = require('child_process');
const fs = require('fs');

async function updateAppSyncSchema() {
  console.log('🔧 Updating AppSync Schema with Missing Components...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    // Read the schema updates
    const schemaUpdates = fs.readFileSync('aws-appsync-schema-updates-complete.graphql', 'utf8');
    console.log('📋 Schema updates to apply:');
    console.log(schemaUpdates);
    
    // Write to a temporary file for the CLI command
    fs.writeFileSync('temp-schema-updates.graphql', schemaUpdates);
    
    console.log('\n🚀 Applying schema updates to AppSync...');
    
    // Apply the schema updates
    const result = execSync(`aws appsync start-schema-creation --api-id ${API_ID} --definition file://temp-schema-updates.graphql`, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log('✅ Schema update initiated successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Wait for schema update to complete (check AWS Console)');
    console.log('2. Create resolvers for the new mutations:');
    console.log('   - sendHeartbeat');
    console.log('   - removeDifficultyInterest');
    console.log('   - getLobbyStatus');
    console.log('3. Test the app again');
    
    // Clean up
    fs.unlinkSync('temp-schema-updates.graphql');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
    console.log('\n📋 Manual Steps Required:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Schema" tab');
    console.log('4. Add the following types and mutations manually:');
    console.log('\n--- Copy and paste this into the schema editor ---');
    
    const schemaUpdates = fs.readFileSync('aws-appsync-schema-updates-complete.graphql', 'utf8');
    console.log(schemaUpdates);
    
    console.log('\n5. Save the schema');
    console.log('6. Create resolvers for each new mutation pointing to pfb-lobby-management Lambda');
  }
}

updateAppSyncSchema(); 