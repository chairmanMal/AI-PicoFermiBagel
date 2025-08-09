const { execSync } = require('child_process');

async function fixResolver() {
  console.log('🔧 Fixing AppSync Resolver Configuration...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    console.log('📋 Step 1: Checking current resolver configuration...');
    
    // Get resolver details
    try {
      const resolverInfo = execSync(`aws appsync get-resolver --api-id ${API_ID} --type-name Query --field-name getDifficultyInterestCounts`, { encoding: 'utf8' });
      console.log('Current resolver configuration:');
      console.log(resolverInfo);
    } catch (error) {
      console.log('❌ Could not get resolver info:', error.message);
    }
    
    console.log('\n📋 Step 2: Checking available data sources...');
    
    try {
      const dataSources = execSync(`aws appsync list-data-sources --api-id ${API_ID}`, { encoding: 'utf8' });
      console.log('Available data sources:');
      console.log(dataSources);
    } catch (error) {
      console.log('❌ Could not get data sources:', error.message);
    }
    
    console.log('\n📋 Step 3: Manual Fix Required');
    console.log('The resolver is pointing to the wrong Lambda function.');
    console.log('It should use pfb_lobby_management, not pfb-auth-service-role.\n');
    
    console.log('🔧 MANUAL FIX STEPS:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Resolvers" tab');
    console.log('4. Find "Query" type');
    console.log('5. Click on "getDifficultyInterestCounts" resolver');
    console.log('6. Click "Edit" button');
    console.log('7. Change the data source to "pfb_lobby_management"');
    console.log('8. Make sure the Request mapping template is:');
    
    console.log(`
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "operation": "getDifficultyInterestCounts"
  }
}
    `);
    
    console.log('9. Make sure the Response mapping template is:');
    
    console.log(`
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end
$util.toJson($ctx.result)
    `);
    
    console.log('10. Click "Save" button\n');
    
    console.log('📋 Step 4: Alternative - Delete and Recreate');
    console.log('If editing doesn\'t work, you can:');
    console.log('1. Delete the current resolver');
    console.log('2. Create a new one with the correct data source');
    console.log('3. Use the templates above\n');
    
    console.log('✅ After fixing, test with this query:');
    console.log(`
query TestGetDifficultyInterestCounts {
  getDifficultyInterestCounts {
    difficulty
    interestCount
    timestamp
  }
}
    `);
    
  } catch (error) {
    console.log('❌ Error during fix:', error.message);
  }
}

fixResolver(); 