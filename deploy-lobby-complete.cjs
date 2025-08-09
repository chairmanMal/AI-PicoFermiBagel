const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployLobbyComplete() {
  console.log('🚀 Deploying Complete Lobby Management Lambda...\n');
  
  const LAMBDA_NAME = 'pfb-lobby-management';
  const tempDir = 'temp-lobby-complete';
  
  try {
    // Create temporary directory
    console.log('📋 Creating temporary deployment directory...');
    if (fs.existsSync(tempDir)) {
      execSync(`rm -rf ${tempDir}`, { stdio: 'inherit' });
    }
    fs.mkdirSync(tempDir);
    
    // Copy Lambda code
    console.log('📋 Copying Lambda function code...');
    fs.copyFileSync('lambda-lobby-management-complete.js', path.join(tempDir, 'index.js'));
    
    // Create package.json
    console.log('📋 Creating package.json...');
    const packageJson = {
      "name": "pfb-lobby-management-complete",
      "version": "1.0.0",
      "main": "index.js",
      "dependencies": {
        "aws-sdk": "^2.1000.0"
      }
    };
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    
    // Install dependencies
    console.log('📋 Installing dependencies...');
    execSync('npm install', { cwd: tempDir, stdio: 'inherit' });
    
    // Create deployment zip
    console.log('📋 Creating deployment zip...');
    const zipName = 'lobby-complete.zip';
    execSync(`cd ${tempDir} && zip -r ../${zipName} .`, { stdio: 'inherit' });
    
    // Deploy to Lambda
    console.log('📋 Deploying to AWS Lambda...');
    const deployCommand = `aws lambda update-function-code --function-name ${LAMBDA_NAME} --zip-file fileb://${zipName}`;
    execSync(deployCommand, { stdio: 'inherit' });
    
    // Clean up
    console.log('📋 Cleaning up temporary files...');
    execSync(`rm -rf ${tempDir}`, { stdio: 'inherit' });
    execSync(`rm ${zipName}`, { stdio: 'inherit' });
    
    console.log('✅ Complete Lobby Management Lambda deployed successfully!');
    console.log('\n🎯 New Features:');
    console.log('   ✅ Proper player seating with seat assignments');
    console.log('   ✅ Real-time lobby updates via subscriptions');
    console.log('   ✅ 30-second countdown when 2+ players seated');
    console.log('   ✅ Game start coordination with shared random seed');
    console.log('   ✅ Enhanced interest tracking');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    // Clean up on error
    if (fs.existsSync(tempDir)) {
      execSync(`rm -rf ${tempDir}`, { stdio: 'inherit' });
    }
    if (fs.existsSync('lobby-complete.zip')) {
      execSync('rm lobby-complete.zip', { stdio: 'inherit' });
    }
  }
}

deployLobbyComplete(); 