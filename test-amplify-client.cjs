const fs = require('fs');
const path = require('path');

async function testAmplifyClient() {
  console.log('🧪 Testing Amplify client configuration...\n');
  
  // Create a simple test file to check Amplify configuration
  const testCode = `
// Test Amplify configuration
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

const awsConfig = {
  aws_appsync_graphqlEndpoint: 'https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'da2-nfhc7ukfhjaypm2ey62x22omc4',
};

// Configure Amplify
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: awsConfig.aws_appsync_graphqlEndpoint,
      region: awsConfig.aws_appsync_region,
      defaultAuthMode: 'apiKey',
      apiKey: awsConfig.aws_appsync_apiKey,
    }
  }
});

console.log('Amplify configured successfully');

// Test the client
const client = generateClient();
console.log('Client generated successfully');

// Test a simple query
const testQuery = \`
  query TestQuery {
    getLeaderboard(difficulty: "classic", limit: 1) {
      rank
      username
      score
    }
  }
\`;

try {
  const result = await client.graphql({
    query: testQuery
  });
  console.log('Query result:', result);
} catch (error) {
  console.error('Query failed:', error);
}
`;

  const testFilePath = path.join(__dirname, 'test-amplify.js');
  fs.writeFileSync(testFilePath, testCode);
  
  console.log('✅ Created test file:', testFilePath);
  console.log('💡 You can run this test with: node test-amplify.js');
}

testAmplifyClient(); 