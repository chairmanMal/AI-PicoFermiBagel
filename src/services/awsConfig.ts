// src/services/awsConfig.ts
import { Amplify } from 'aws-amplify';

// Your actual AWS configuration values from Phase 1
const awsConfig = {
  aws_appsync_graphqlEndpoint: 'https://i4n55xxcjrds7e7aygfxajkozq.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'da2-nfhc7ukfhjaypm2ey62x22omc4',
};

// Configure Amplify
export const initializeAWS = () => {
  try {
    console.log('🔧 AWS: Initializing Amplify configuration...');
    console.log('🔧 AWS: Endpoint:', awsConfig.aws_appsync_graphqlEndpoint);
    console.log('🔧 AWS: Region:', awsConfig.aws_appsync_region);
    console.log('🔧 AWS: Auth Type:', awsConfig.aws_appsync_authenticationType);
    console.log('🔧 AWS: API Key:', awsConfig.aws_appsync_apiKey.substring(0, 10) + '...');
    
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
    console.log('✅ AWS: Amplify configured successfully');
  } catch (error: any) {
    console.error('❌ AWS: Configuration failed:', error);
    console.error('❌ AWS: Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
};

export { awsConfig };