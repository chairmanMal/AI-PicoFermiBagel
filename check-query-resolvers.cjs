const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const appsync = new AWS.AppSync();

async function checkQueryResolvers() {
  console.log('🔍 Checking AppSync Query Resolvers...\n');
  
  const apiId = 'dzdcg7gk5zco3fu57dotwhbrdu';
  
  try {
    const result = await appsync.listResolvers({
      apiId,
      typeName: 'Query'
    }).promise();
    
    console.log('📋 Query Resolvers:');
    if (result.resolvers && result.resolvers.length > 0) {
      result.resolvers.forEach((resolver, index) => {
        console.log(`\n${index + 1}. Field: ${resolver.fieldName}`);
        console.log(`   Data Source: ${resolver.dataSourceName}`);
        console.log(`   Kind: ${resolver.kind}`);
        console.log(`   Request Mapping: ${resolver.requestMappingTemplate ? 'Present' : 'Missing'}`);
        console.log(`   Response Mapping: ${resolver.responseMappingTemplate ? 'Present' : 'Missing'}`);
      });
      
      // Check specifically for getLobbyStatus
      const getLobbyStatusResolver = result.resolvers.find(r => r.fieldName === 'getLobbyStatus');
      if (getLobbyStatusResolver) {
        console.log('\n✅ getLobbyStatus resolver found!');
        console.log('📋 Request Mapping Template:');
        console.log(getLobbyStatusResolver.requestMappingTemplate);
        console.log('\n📋 Response Mapping Template:');
        console.log(getLobbyStatusResolver.responseMappingTemplate);
      } else {
        console.log('\n❌ getLobbyStatus resolver NOT FOUND!');
        console.log('🔧 This is why the query returns null - no resolver attached!');
      }
      
    } else {
      console.log('No Query resolvers found');
    }
    
  } catch (error) {
    console.error('❌ Error checking resolvers:', error.message);
  }
}

checkQueryResolvers(); 