const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Deploying Minimal Auth Service Lambda...');

// Create a temporary directory for the deployment
const tempDir = path.join(__dirname, 'lambda-deploy-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Copy the Lambda function to temp directory
fs.copyFileSync('lambda-auth-service-minimal.js', path.join(tempDir, 'index.js'));

// Create minimal package.json for the Lambda
const packageJson = {
  "name": "pfb-auth-service",
  "version": "1.0.0",
  "dependencies": {
    "aws-sdk": "^2.1000.0"
  }
};

fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

// Change to temp directory and install only production dependencies
process.chdir(tempDir);

console.log('📦 Installing dependencies...');
execSync('npm install --production --no-optional', { stdio: 'inherit' });

// Create ZIP file with only essential files
console.log('📦 Creating deployment package...');
execSync('zip -r ../auth-service-minimal.zip index.js package.json node_modules/aws-sdk', { stdio: 'inherit' });

// Go back to original directory
process.chdir(__dirname);

// Deploy to Lambda
console.log('🚀 Deploying to Lambda...');
execSync('aws lambda update-function-code --function-name pfb-auth-service --zip-file fileb://auth-service-minimal.zip', { stdio: 'inherit' });

console.log('✅ Auth Service deployed successfully!');

// Cleanup
execSync(`rm -rf ${tempDir}`, { stdio: 'inherit' });
fs.unlinkSync('auth-service-minimal.zip'); 