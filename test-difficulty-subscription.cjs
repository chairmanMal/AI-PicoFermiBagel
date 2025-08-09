const { execSync } = require('child_process');

async function testDifficultySubscription() {
  console.log('🔍 Testing Difficulty Interest Subscription...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    console.log('📋 Step 1: Checking if difficulty interest subscription exists...');
    
    // Try to get the schema to see available subscriptions
    try {
      const schemaResult = execSync(`aws appsync get-introspection-schema --api-id ${API_ID} --format JSON`, { encoding: 'utf8' });
      console.log('✅ Schema retrieved successfully');
      
      // Parse and check for difficulty interest subscription
      const schema = JSON.parse(schemaResult);
      const subscriptionType = schema.data.__schema.types.find(t => t.name === 'Subscription');
      
      if (subscriptionType) {
        console.log('📋 Available subscriptions:');
        subscriptionType.fields.forEach(field => {
          console.log(`  - ${field.name}`);
        });
        
        const hasDifficultySubscription = subscriptionType.fields.some(f => 
          f.name.includes('Difficulty') || f.name.includes('Interest')
        );
        
        if (hasDifficultySubscription) {
          console.log('✅ Found difficulty interest subscription!');
        } else {
          console.log('❌ No difficulty interest subscription found');
          console.log('📋 Need to add subscription to schema');
        }
      } else {
        console.log('❌ No Subscription type found in schema');
      }
      
    } catch (error) {
      console.log('❌ Could not get schema:', error.message);
    }
    
    console.log('\n📋 Step 2: Manual Steps to Add Subscription');
    console.log('If no subscription exists, you need to:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Schema" tab');
    console.log('4. Add this subscription to your schema:');
    
    console.log(`
extend type Subscription {
  onDifficultyInterestUpdate: [DifficultyInterest!]!
}
    `);
    
    console.log('5. Go to "Resolvers" tab');
    console.log('6. Click "Attach" next to onDifficultyInterestUpdate');
    console.log('7. Choose "Lambda" as data source');
    console.log('8. Select "pfb_lobby_management" from dropdown');
    console.log('9. For Request mapping template, use:');
    
    console.log(`
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "operation": "onDifficultyInterestUpdate"
  }
}
    `);
    
    console.log('10. For Response mapping template, use:');
    
    console.log(`
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end
$util.toJson($ctx.result)
    `);
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
  }
}

testDifficultySubscription(); 