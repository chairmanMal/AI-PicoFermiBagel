const { execSync } = require('child_process');
const fs = require('fs');

async function updateLambdaDifficultyInterest() {
  console.log('🔧 Updating Lambda Function for Difficulty Interest...\n');
  
  // Create the updated Lambda function code
  const lambdaCode = `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('🎮 Lambda received event:', JSON.stringify(event, null, 2));
  
  const { operation, input } = event;
  
  try {
    switch (operation) {
      case 'updateDifficultyInterestWithNotification':
        return await handleUpdateDifficultyInterest(input);
      case 'getDifficultyInterestCounts':
        return await handleGetDifficultyInterestCounts();
      case 'joinLobbyWithNotification':
        return await handleJoinLobby(input);
      case 'leaveLobbyWithNotification':
        return await handleLeaveLobby(input);
      case 'startGameWithNotification':
        return await handleStartGame(input);
      default:
        throw new Error(\`Unknown operation: \${operation}\`);
    }
  } catch (error) {
    console.error('❌ Lambda error:', error);
    return {
      success: false,
      message: error.message,
      error: error.toString()
    };
  }
};

async function handleUpdateDifficultyInterest(input) {
  console.log('🎮 Handling updateDifficultyInterestWithNotification:', input);
  
  const { difficulty, deviceId, username, timestamp } = input;
  
  if (!difficulty) {
    throw new Error('Difficulty is required');
  }
  
  try {
    // Update the difficulty interest count
    const params = {
      TableName: 'pfb-difficulty-interest',
      Key: { difficulty },
      UpdateExpression: 'SET interestCount = if_not_exists(interestCount, :zero) + :increment, lastUpdated = :timestamp',
      ExpressionAttributeValues: {
        ':increment': 1,
        ':zero': 0,
        ':timestamp': timestamp || new Date().toISOString()
      },
      ReturnValues: 'UPDATED_NEW'
    };
    
    const result = await dynamodb.update(params).promise();
    const newInterestCount = result.Attributes.interestCount;
    
    console.log('✅ Updated difficulty interest:', { difficulty, newInterestCount });
    
    return {
      success: true,
      message: 'Difficulty interest updated successfully',
      newInterestCount: newInterestCount
    };
  } catch (error) {
    console.error('❌ Error updating difficulty interest:', error);
    throw new Error(\`Failed to update difficulty interest: \${error.message}\`);
  }
}

async function handleGetDifficultyInterestCounts() {
  console.log('🎮 Handling getDifficultyInterestCounts');
  
  try {
    const params = {
      TableName: 'pfb-difficulty-interest',
      ProjectionExpression: 'difficulty, interestCount, lastUpdated'
    };
    
    const result = await dynamodb.scan(params).promise();
    
    const difficultyInterests = result.Items.map(item => ({
      difficulty: item.difficulty,
      interestCount: item.interestCount || 0,
      timestamp: item.lastUpdated || new Date().toISOString()
    }));
    
    console.log('✅ Retrieved difficulty interest counts:', difficultyInterests);
    
    return difficultyInterests;
  } catch (error) {
    console.error('❌ Error getting difficulty interest counts:', error);
    throw new Error(\`Failed to get difficulty interest counts: \${error.message}\`);
  }
}

async function handleJoinLobby(input) {
  console.log('🎮 Handling joinLobbyWithNotification:', input);
  
  // Placeholder implementation
  return {
    success: true,
    gameId: 'game-' + Date.now(),
    playersWaiting: 1,
    message: 'Joined lobby successfully'
  };
}

async function handleLeaveLobby(input) {
  console.log('🎮 Handling leaveLobbyWithNotification:', input);
  
  // Placeholder implementation
  return {
    success: true,
    message: 'Left lobby successfully'
  };
}

async function handleStartGame(input) {
  console.log('🎮 Handling startGameWithNotification:', input);
  
  // Placeholder implementation
  return {
    success: true,
    gameId: input.gameId,
    message: 'Game started successfully'
  };
}
`;

  // Write the Lambda code to a file
  const lambdaFilePath = 'lambda-lobby-management-updated.js';
  fs.writeFileSync(lambdaFilePath, lambdaCode);
  
  console.log('📝 Created updated Lambda function code:', lambdaFilePath);
  
  // Create deployment package
  console.log('📦 Creating deployment package...');
  
  try {
    // Create a temporary directory for the deployment package
    const tempDir = 'lambda-deploy-temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Copy the Lambda code
    fs.copyFileSync(lambdaFilePath, `${tempDir}/index.js`);
    
    // Create package.json for dependencies
    const packageJson = {
      name: "pfb-lobby-management",
      version: "1.0.0",
      dependencies: {
        "aws-sdk": "^2.1000.0"
      }
    };
    
    fs.writeFileSync(`${tempDir}/package.json`, JSON.stringify(packageJson, null, 2));
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install --production', { cwd: tempDir, stdio: 'inherit' });
    
    // Create zip file
    console.log('📦 Creating deployment package...');
    execSync('zip -r lambda-deployment.zip .', { cwd: tempDir, stdio: 'inherit' });
    
    // Move zip to current directory
    fs.renameSync(`${tempDir}/lambda-deployment.zip`, 'lambda-deployment.zip');
    
    console.log('✅ Deployment package created: lambda-deployment.zip');
    
    // Update the Lambda function
    console.log('🚀 Updating Lambda function...');
    execSync('aws lambda update-function-code --function-name pfb-lobby-management --zip-file fileb://lambda-deployment.zip', { stdio: 'inherit' });
    
    console.log('✅ Lambda function updated successfully!');
    
    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(lambdaFilePath);
    fs.unlinkSync('lambda-deployment.zip');
    
  } catch (error) {
    console.log('❌ Error updating Lambda:', error.message);
    console.log('📋 Manual steps required:');
    console.log('1. Go to AWS Lambda Console');
    console.log('2. Find the pfb-lobby-management function');
    console.log('3. Replace the code with the updated version');
    console.log('4. Test the function');
  }
}

updateLambdaDifficultyInterest(); 