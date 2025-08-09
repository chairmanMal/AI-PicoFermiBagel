const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const appsync = new AWS.AppSync();

async function getAPIKeys() {
  console.log('🔑 Getting AppSync API Keys...\n');
  
  const apiId = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    const result = await appsync.listApiKeys({ apiId }).promise();
    
    console.log('📋 Current API Keys:');
    result.apiKeys.forEach((key, index) => {
      const expires = new Date(key.expires * 1000);
      const now = new Date();
      const isExpired = expires < now;
      
      console.log(`\n${index + 1}. API Key: ${key.id}`);
      console.log(`   Key: ${key.id}`);
      console.log(`   Expires: ${expires.toISOString()}`);
      console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
      console.log(`   Description: ${key.description || 'No description'}`);
    });
    
    // Check if we need to create a new key
    const validKeys = result.apiKeys.filter(key => {
      const expires = new Date(key.expires * 1000);
      const now = new Date();
      return expires > now;
    });
    
    if (validKeys.length === 0) {
      console.log('\n🚨 No valid API keys found! Creating a new one...');
      
      const newKeyResult = await appsync.createApiKey({
        apiId,
        description: 'PicoFermiBagel Multiplayer API Key',
        expires: Math.floor((Date.now() + (365 * 24 * 60 * 60 * 1000)) / 1000) // 1 year from now
      }).promise();
      
      console.log('\n✅ New API Key Created:');
      console.log(`   Key: ${newKeyResult.apiKey.id}`);
      console.log(`   Expires: ${new Date(newKeyResult.apiKey.expires * 1000).toISOString()}`);
      
      return newKeyResult.apiKey.id;
    } else {
      console.log(`\n✅ Using valid API key: ${validKeys[0].id}`);
      return validKeys[0].id;
    }
    
  } catch (error) {
    console.error('❌ Error getting API keys:', error.message);
    throw error;
  }
}

getAPIKeys().then(apiKey => {
  console.log(`\n🎯 Use this API key in your app: ${apiKey}`);
}).catch(console.error); 