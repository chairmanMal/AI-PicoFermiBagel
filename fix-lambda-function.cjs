const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function fixLambdaFunction() {
  console.log('🔧 Checking and fixing Lambda function...\n');
  
  const LAMBDA_FUNCTION_NAME = 'pfb-lobby-management';
  
  try {
    console.log('📋 Checking if Lambda function exists...');
    
    // Check if function exists
    try {
      const functionInfo = execSync(`aws lambda get-function --function-name ${LAMBDA_FUNCTION_NAME}`, { encoding: 'utf8' });
      console.log('✅ Lambda function exists');
      
      // Check if it has code
      const codeLocation = JSON.parse(functionInfo).Code?.Location;
      if (codeLocation) {
        console.log('✅ Lambda function has code');
      } else {
        console.log('❌ Lambda function has no code - this is the problem!');
      }
      
    } catch (error) {
      console.log('❌ Lambda function does not exist');
      console.log('Creating new Lambda function...');
      
      // Create the function
      const createCommand = `aws lambda create-function \
        --function-name ${LAMBDA_FUNCTION_NAME} \
        --runtime nodejs18.x \
        --role arn:aws:iam::171591329315:role/service-role/pfb-auth-service-role-rteqat4u \
        --handler index.handler \
        --zip-file fileb://lambda-realtime-updates.js \
        --description "Real-time multiplayer updates for PicoFermiBagel"`;
      
      execSync(createCommand, { stdio: 'inherit' });
      console.log('✅ Created new Lambda function');
      return;
    }
    
    console.log('\n📦 Deploying code to Lambda function...');
    
    // Create deployment package
    const tempDir = 'temp-lambda-deploy';
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir);
    
    // Copy Lambda code
    fs.copyFileSync('lambda-realtime-updates.js', path.join(tempDir, 'index.js'));
    
    // Create package.json
    const packageJson = {
      name: 'pfb-lobby-management',
      version: '1.0.0',
      main: 'index.js',
      dependencies: {
        'aws-sdk': '^2.1000.0'
      }
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install --production', { cwd: tempDir, stdio: 'inherit' });
    
    // Create ZIP file
    console.log('📦 Creating deployment package...');
    execSync(`cd ${tempDir} && zip -r ../${LAMBDA_FUNCTION_NAME}-deploy.zip .`, { stdio: 'inherit' });
    
    // Update function code
    console.log('🔄 Updating Lambda function code...');
    execSync(`aws lambda update-function-code --function-name ${LAMBDA_FUNCTION_NAME} --zip-file fileb://${LAMBDA_FUNCTION_NAME}-deploy.zip`, { stdio: 'inherit' });
    
    console.log('✅ Lambda function code updated successfully!');
    
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    if (fs.existsSync(`${LAMBDA_FUNCTION_NAME}-deploy.zip`)) {
      fs.unlinkSync(`${LAMBDA_FUNCTION_NAME}-deploy.zip`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing Lambda function:', error);
  }
}

fixLambdaFunction(); 