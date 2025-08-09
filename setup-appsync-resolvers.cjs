const { execSync } = require('child_process');

async function setupAppSyncResolvers() {
  console.log('🔧 Setting up AppSync JavaScript Resolvers...\n');
  
  console.log('📋 Manual Setup Instructions:');
  console.log('1. Go to AWS AppSync Console');
  console.log('2. Navigate to your API: PicoFermiBagel-Multiplayer-API');
  console.log('3. Go to "Schema" tab');
  console.log('4. Click on "Resolvers" in the left sidebar');
  
  console.log('\n🔧 For each mutation, you need to:');
  console.log('1. Click "Attach" next to the mutation');
  console.log('2. Choose "Lambda" as data source');
  console.log('3. Select the pfb-lobby-management Lambda function');
  console.log('4. Use the JavaScript resolver code below');
  
  console.log('\n📝 Resolver Code for updateDifficultyInterestWithNotification:');
  console.log('Request mapping template:');
  console.log(`
export function request(ctx) {
  console.log('🎮 Difficulty interest update request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'updateDifficultyInterestWithNotification',
      input: ctx.args.input
    }
  };
}
  `);
  
  console.log('Response mapping template:');
  console.log(`
export function response(ctx) {
  console.log('🎮 Difficulty interest update response:', JSON.stringify(ctx.result, null, 2));
  
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }
  
  return ctx.result;
}
  `);
  
  console.log('\n📝 Resolver Code for joinLobbyWithNotification:');
  console.log('Request mapping template:');
  console.log(`
export function request(ctx) {
  console.log('🎮 Player join lobby request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'joinLobbyWithNotification',
      input: ctx.args.input
    }
  };
}
  `);
  
  console.log('Response mapping template:');
  console.log(`
export function response(ctx) {
  console.log('🎮 Player join lobby response:', JSON.stringify(ctx.result, null, 2));
  
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }
  
  return ctx.result;
}
  `);
  
  console.log('\n📝 Resolver Code for leaveLobbyWithNotification:');
  console.log('Request mapping template:');
  console.log(`
export function request(ctx) {
  console.log('🎮 Player leave lobby request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'leaveLobbyWithNotification',
      input: ctx.args.input
    }
  };
}
  `);
  
  console.log('Response mapping template:');
  console.log(`
export function response(ctx) {
  console.log('🎮 Player leave lobby response:', JSON.stringify(ctx.result, null, 2));
  
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }
  
  return ctx.result;
}
  `);
  
  console.log('\n📝 Resolver Code for startGameWithNotification:');
  console.log('Request mapping template:');
  console.log(`
export function request(ctx) {
  console.log('🎮 Game start request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'startGameWithNotification',
      input: ctx.args.input
    }
  };
}
  `);
  
  console.log('Response mapping template:');
  console.log(`
export function response(ctx) {
  console.log('🎮 Game start response:', JSON.stringify(ctx.result, null, 2));
  
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }
  
  return ctx.result;
}
  `);
  
  console.log('\n🎯 Setup Steps:');
  console.log('1. Create resolver for updateDifficultyInterestWithNotification first');
  console.log('2. Test the mutation in AppSync Console');
  console.log('3. If it works, create the other resolvers');
  console.log('4. Then add the subscriptions');
  
  console.log('\n⚠️  Important Notes:');
  console.log('- Use JavaScript code, not VTL templates');
  console.log('- Make sure the Lambda function name is: pfb-lobby-management');
  console.log('- The resolver code should be pasted exactly as shown above');
  console.log('- Each resolver needs both request and response functions');
}

setupAppSyncResolvers(); 