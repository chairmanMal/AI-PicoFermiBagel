const { execSync } = require('child_process');

async function checkSubscriptionResolvers() {
  console.log('🔍 Checking Subscription Resolvers...\n');
  
  const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    console.log('📋 Checking Subscription type resolvers...');
    
    // List all subscription resolvers
    const result = execSync(`aws appsync list-resolvers --api-id ${API_ID} --type-name Subscription`, { encoding: 'utf8' });
    const resolvers = JSON.parse(result);
    
    console.log('Available subscription resolvers:', JSON.stringify(resolvers, null, 2));
    
    if (resolvers.resolvers && resolvers.resolvers.length > 0) {
      console.log('\n✅ Found subscription resolvers:');
      resolvers.resolvers.forEach(resolver => {
        console.log(`- ${resolver.fieldName}`);
      });
    } else {
      console.log('\n❌ No subscription resolvers found!');
      console.log('\n📋 Missing resolvers that need to be created:');
      console.log('- onDifficultyInterestUpdate');
      console.log('- onLobbyUpdate');
      console.log('- onGameStart');
    }
    
  } catch (error) {
    console.error('❌ Error checking subscription resolvers:', error.message);
    console.log('\n📋 This likely means NO subscription resolvers exist!');
    console.log('\nSubscription resolvers need to be created manually in AWS Console:');
    console.log('1. Go to AppSync Console → Schema → Resolvers');
    console.log('2. Find Subscription type');
    console.log('3. Create resolvers for:');
    console.log('   - onDifficultyInterestUpdate → pfb-lobby-management Lambda');
    console.log('   - onLobbyUpdate → pfb-lobby-management Lambda');
    console.log('   - onGameStart → pfb-lobby-management Lambda');
  }
}

checkSubscriptionResolvers(); 