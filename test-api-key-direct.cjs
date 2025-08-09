const https = require('https');

async function testAPIKey() {
  console.log('🧪 Testing AppSync API Key Directly...\n');
  
  const endpoint = 'i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com';
  const apiKey = 'da2-skqwb46s2jg3rkptz3bsbniia4';
  
  const query = `
    query {
      getDifficultyInterestCounts {
        difficulty
        interestCount
        timestamp
      }
    }
  `;
  
  const postData = JSON.stringify({
    query: query
  });
  
  const options = {
    hostname: endpoint,
    port: 443,
    path: '/graphql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📋 Response Status:', res.statusCode);
        console.log('📋 Response Headers:', res.headers);
        console.log('📋 Response Body:', data);
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) {
            console.log('❌ GraphQL Errors:', parsed.errors);
          } else {
            console.log('✅ Query Success:', parsed.data);
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', e.message);
        }
        
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ Request Error:', e.message);
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
}

testAPIKey().catch(console.error); 