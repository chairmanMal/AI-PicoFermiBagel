const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployLambdaFixed() {
  console.log('🚀 Deploying Fixed Lambda Function...\n');
  
  try {
    // Step 1: Create temporary directory
    console.log('📋 Step 1: Creating temporary directory...');
    const tempDir = path.join(__dirname, 'temp-lambda-fixed');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);
    
    // Step 2: Copy Lambda code
    console.log('📋 Step 2: Copying Lambda code...');
    const lambdaCode = fs.readFileSync('lambda-lobby-management-with-subscriptions.js', 'utf8');
    fs.writeFileSync(path.join(tempDir, 'index.js'), lambdaCode);
    
    // Step 3: Create package.json
    console.log('📋 Step 3: Creating package.json...');
    const packageJson = {
      name: 'pfb-lobby-management-fixed',
      version: '1.0.0',
      main: 'index.js',
      dependencies: {
        'aws-sdk': '^2.1000.0'
      }
    };
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    
    // Step 4: Install dependencies
    console.log('📋 Step 4: Installing dependencies...');
    execSync('npm install --production', { cwd: tempDir, stdio: 'inherit' });
    
    // Step 5: Create zip file
    console.log('📋 Step 5: Creating zip file...');
    const zipPath = path.join(__dirname, 'lambda-fixed.zip');
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    
    execSync(`cd "${tempDir}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
    
    // Step 6: Deploy to Lambda
    console.log('📋 Step 6: Deploying to Lambda...');
    execSync(`aws lambda update-function-code --function-name pfb-lobby-management --zip-file fileb://${zipPath}`, { stdio: 'inherit' });
    
    console.log('✅ Lambda deployed successfully!');
    
    // Step 7: Clean up
    console.log('📋 Step 7: Cleaning up...');
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);
    
    console.log('\n📋 FIXES APPLIED:');
    console.log('1. ✅ getDifficultyInterestCounts now returns array format');
    console.log('2. ✅ Subscription handler returns empty array instead of null');
    console.log('3. ✅ Error handling improved to avoid null returns');
    console.log('4. ✅ Frontend already handles array format correctly');
    
  } catch (error) {
    console.log('❌ Error during deployment:', error.message);
  }
}

deployLambdaFixed(); 