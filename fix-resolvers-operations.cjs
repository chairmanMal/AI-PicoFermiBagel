const { execSync } = require('child_process');

async function fixResolverOperations() {
  console.log('🔧 Fixing Resolver Operations...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    console.log('📋 Fixing sendHeartbeat resolver...');
    
    // Fix sendHeartbeat resolver code
    const sendHeartbeatCode = `export function request(ctx) {
  console.log('🎮 sendHeartbeat request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'sendHeartbeat',
      input: ctx.args.input
    }
  };
}
export function response(ctx) {
  console.log('🎮 sendHeartbeat response:', JSON.stringify(ctx.result, null, 2));
  
  return ctx.result;
}`;

    // Write to temporary file
    require('fs').writeFileSync('temp-sendheartbeat-code.js', sendHeartbeatCode);
    
    // Update sendHeartbeat resolver
    execSync(`aws appsync update-resolver --api-id ${API_ID} --type-name Mutation --field-name sendHeartbeat --code file://temp-sendheartbeat-code.js`, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log('✅ sendHeartbeat resolver updated');
    
    console.log('\n📋 Fixing removeDifficultyInterest resolver...');
    
    // Fix removeDifficultyInterest resolver code
    const removeInterestCode = `export function request(ctx) {
  console.log('🎮 removeDifficultyInterest request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'removeDifficultyInterest',
      input: ctx.args.input
    }
  };
}
export function response(ctx) {
  console.log('🎮 removeDifficultyInterest response:', JSON.stringify(ctx.result, null, 2));
  
  return ctx.result;
}`;

    // Write to temporary file
    require('fs').writeFileSync('temp-removeinterest-code.js', removeInterestCode);
    
    // Update removeDifficultyInterest resolver
    execSync(`aws appsync update-resolver --api-id ${API_ID} --type-name Mutation --field-name removeDifficultyInterest --code file://temp-removeinterest-code.js`, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log('✅ removeDifficultyInterest resolver updated');
    
    // Clean up temp files
    require('fs').unlinkSync('temp-sendheartbeat-code.js');
    require('fs').unlinkSync('temp-removeinterest-code.js');
    
    console.log('\n🎉 All resolver operations fixed!');
    console.log('📋 Now the resolvers call the correct Lambda operations:');
    console.log('  - sendHeartbeat → sendHeartbeat');
    console.log('  - removeDifficultyInterest → removeDifficultyInterest');
    
  } catch (error) {
    console.error('❌ Error fixing resolvers:', error.message);
    console.log('\n📋 Manual Fix Required:');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Navigate to Mutation resolvers');
    console.log('3. Edit sendHeartbeat resolver code to call operation: "sendHeartbeat"');
    console.log('4. Edit removeDifficultyInterest resolver code to call operation: "removeDifficultyInterest"');
  }
}

fixResolverOperations(); 