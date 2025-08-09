const { execSync } = require('child_process');

async function checkAppSyncResolver() {
  console.log('🔍 Checking AppSync Resolver Configuration...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    console.log('📋 Checking if resolver exists for updateDifficultyInterestWithNotification...');
    
    // List all resolvers
    const resolvers = execSync(`aws appsync list-resolvers --api-id ${API_ID} --type-name Mutation`, { encoding: 'utf8' });
    console.log('Available resolvers:', resolvers);
    
    console.log('\n📋 Manual Steps to Check/Setup Resolver:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
    console.log('3. Go to "Schema" tab');
    console.log('4. Click on "Resolvers" in the left sidebar');
    console.log('5. Look for "updateDifficultyInterestWithNotification" resolver');
    
    console.log('\n📋 If resolver doesn\'t exist, create it:');
    console.log('1. Click "Attach" next to updateDifficultyInterestWithNotification');
    console.log('2. Choose "Lambda" as data source');
    console.log('3. Select the pfb-lobby-management Lambda function');
    console.log('4. For Request mapping template, use:');
    
    console.log(`
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "operation": "updateDifficultyInterestWithNotification",
    "input": $util.toJson($ctx.args.input)
  }
}
    `);
    
    console.log('5. For Response mapping template, use:');
    
    console.log(`
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end
$util.toJson($ctx.result)
    `);
    
  } catch (error) {
    console.log('❌ Error checking resolver:', error.message);
  }
}

checkAppSyncResolver(); 