#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

async function deployRealtimeLambda() {
  console.log('🚀 Deploying Real-time Updates Lambda Function...\n');
  
  try {
    // Create package.json for Lambda dependencies
    const packageJson = {
      "name": "pfb-lobby-management",
      "version": "1.0.0",
      "description": "Lambda function for PicoFermiBagel multiplayer lobby management",
      "main": "index.js",
      "dependencies": {
        "aws-sdk": "^2.1001.0",
        "jmespath": "^0.15.0"
      }
    };
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('📦 Created package.json');
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Create deployment package
    console.log('📦 Creating deployment package...');
    execSync('zip -r lambda-deployment.zip index.js node_modules/ package.json', { stdio: 'inherit' });
    
    // Update Lambda function
    console.log('🔄 Updating existing Lambda function...');
    execSync('aws lambda update-function-code --function-name pfb-lobby-management --zip-file fileb://lambda-deployment.zip', { stdio: 'inherit' });
    
    console.log('✅ Real-time updates Lambda function deployed successfully!');
    
    // Clean up
    console.log('🧹 Cleaning up...');
    execSync('rm -rf node_modules package.json package-lock.json lambda-deployment.zip', { stdio: 'inherit' });
    
    console.log('\n📋 Next Steps:');
    console.log('1. Create AppSync data source named: pfb_lobby_management');
    console.log('2. Create resolvers for mutations: joinLobbyWithNotification, leaveLobbyWithNotification, startGameWithNotification');
    console.log('3. Test the complete setup');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

deployRealtimeLambda(); 