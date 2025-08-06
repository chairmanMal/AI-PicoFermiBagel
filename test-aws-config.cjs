const fs = require('fs');
const path = require('path');

async function testAWSConfig() {
  console.log('🧪 Testing AWS Configuration & Amplify Setup...\n');
  
  try {
    const awsConfigPath = path.join(__dirname, 'src/services/awsConfig.ts');
    const awsConfigContent = fs.readFileSync(awsConfigPath, 'utf8');
    
    // Check for required AWS config values
    if (awsConfigContent.includes('aws_appsync_graphqlEndpoint')) {
      console.log('✅ AppSync GraphQL endpoint configured');
    } else {
      console.log('❌ AppSync GraphQL endpoint missing');
    }
    
    if (awsConfigContent.includes('aws_appsync_region')) {
      console.log('✅ AWS region configured');
    } else {
      console.log('❌ AWS region missing');
    }
    
    if (awsConfigContent.includes('aws_appsync_authenticationType')) {
      console.log('✅ Authentication type configured');
    } else {
      console.log('❌ Authentication type missing');
    }
    
    if (awsConfigContent.includes('aws_appsync_apiKey')) {
      console.log('✅ API key configured');
    } else {
      console.log('❌ API key missing');
    }
    
    // Check for Amplify configuration
    if (awsConfigContent.includes('Amplify.configure')) {
      console.log('✅ Amplify configuration found');
    } else {
      console.log('❌ Amplify configuration missing');
    }
    
    // Check for proper error handling
    if (awsConfigContent.includes('try {') && awsConfigContent.includes('catch')) {
      console.log('✅ Error handling in AWS config');
    } else {
      console.log('❌ Error handling missing in AWS config');
    }
    
    // Check for logging
    if (awsConfigContent.includes('console.log')) {
      console.log('✅ Logging in AWS config');
    } else {
      console.log('❌ Logging missing in AWS config');
    }
    
    // Check for proper exports
    if (awsConfigContent.includes('export const initializeAWS')) {
      console.log('✅ initializeAWS function exported');
    } else {
      console.log('❌ initializeAWS function not exported');
    }
    
    if (awsConfigContent.includes('export { awsConfig }')) {
      console.log('✅ awsConfig exported');
    } else {
      console.log('❌ awsConfig not exported');
    }
    
    // Check for proper imports
    if (awsConfigContent.includes('import { Amplify }')) {
      console.log('✅ Amplify import found');
    } else {
      console.log('❌ Amplify import missing');
    }
    
    // Check for proper TypeScript typing
    if (awsConfigContent.includes(': any')) {
      console.log('✅ Error typing found');
    } else {
      console.log('❌ Error typing missing');
    }
    
    console.log('\n🎯 AWS configuration test completed');
    
  } catch (error) {
    console.error('❌ Error testing AWS configuration:', error);
  }
}

testAWSConfig(); 