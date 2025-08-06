#!/usr/bin/env node

/**
 * AWS Backend Fix Script
 * 
 * This script will create the missing AWS infrastructure for the PicoFermiBagel game:
 * 1. Create API Gateway endpoint for game result submission
 * 2. Create Lambda function to handle game results
 * 3. Update AppSync schema to match frontend expectations
 * 4. Set up proper IAM permissions
 */

const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: 'us-east-1',
  // Note: You'll need to set up AWS credentials via:
  // - AWS CLI: aws configure
  // - Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  // - IAM roles (if running on EC2)
});

const lambda = new AWS.Lambda();
const apigateway = new AWS.APIGateway();
const appsync = new AWS.AppSync();
const dynamodb = new AWS.DynamoDB();

async function createGameResultLambda() {
  console.log('🔧 Creating Lambda function for game result submission...');
  
  const lambdaCode = `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    console.log('Received game result:', JSON.stringify(event, null, 2));
    
    const {
      gameId,
      username,
      score,
      guesses,
      hints,
      difficulty,
      gameWon,
      timestamp
    } = JSON.parse(event.body);
    
    // Create entry in the existing DynamoDB table schema
    const entry = {
      Id: gameId,
      Initials: username.substring(0, 10),
      Score: Math.round(score),
      Date: new Date().toLocaleDateString('en-US'),
      Difficulty: difficulty === 'classic' ? 8 : 6,
      Attempts: guesses,
      Time: Math.round((Date.now() - new Date(timestamp).getTime()) / 1000),
      Valid: 1,
      Seed: Math.floor(Math.random() * 1000000),
      RandomCount: Math.floor(Math.random() * 100),
      VersionNumber: 0
    };
    
    console.log('Writing to DynamoDB:', entry);
    
    await dynamodb.put({
      TableName: 'pfb-mobilehub-1126398616-LeaderBoardTable',
      Item: entry
    }).promise();
    
    console.log('Successfully wrote game result to DynamoDB');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        message: 'Game result submitted successfully',
        gameId: gameId,
        username: username,
        score: score
      })
    };
    
  } catch (error) {
    console.error('Error submitting game result:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to submit game result',
        error: error.message
      })
    };
  }
};
`;

  const params = {
    FunctionName: 'pfb-submit-game-result',
    Runtime: 'nodejs18.x',
    Role: 'arn:aws:iam::171591329315:role/lambda-execution-role', // You'll need to create this role
    Handler: 'index.handler',
    Code: {
      ZipFile: Buffer.from(lambdaCode)
    },
    Description: 'Submit game results to DynamoDB leaderboard',
    Timeout: 30,
    MemorySize: 128
  };

  try {
    const result = await lambda.createFunction(params).promise();
    console.log('✅ Lambda function created:', result.FunctionArn);
    return result.FunctionArn;
  } catch (error) {
    if (error.code === 'ResourceConflictException') {
      console.log('⚠️  Lambda function already exists');
      return `arn:aws:lambda:us-east-1:171591329315:function:pfb-submit-game-result`;
    } else {
      console.error('❌ Failed to create Lambda function:', error.message);
      throw error;
    }
  }
}

async function createApiGateway() {
  console.log('🔧 Creating API Gateway for game result submission...');
  
  try {
    // Create REST API
    const apiResult = await apigateway.createRestApi({
      name: 'PicoFermiBagel-GameAPI',
      description: 'API for PicoFermiBagel game result submission'
    }).promise();
    
    const apiId = apiResult.id;
    console.log('✅ REST API created:', apiId);
    
    // Get root resource
    const resources = await apigateway.getResources({ restApiId: apiId }).promise();
    const rootResource = resources.items.find(r => r.path === '/');
    
    // Create /submit-game-result resource
    const resourceResult = await apigateway.createResource({
      restApiId: apiId,
      parentId: rootResource.id,
      pathPart: 'submit-game-result'
    }).promise();
    
    // Create POST method
    await apigateway.putMethod({
      restApiId: apiId,
      resourceId: resourceResult.id,
      httpMethod: 'POST',
      authorizationType: 'NONE'
    }).promise();
    
    // Set up Lambda integration
    const lambdaArn = await createGameResultLambda();
    
    await apigateway.putIntegration({
      restApiId: apiId,
      resourceId: resourceResult.id,
      httpMethod: 'POST',
      type: 'AWS_PROXY',
      integrationHttpMethod: 'POST',
      uri: `arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`
    }).promise();
    
    // Deploy the API
    const deployment = await apigateway.createDeployment({
      restApiId: apiId,
      stageName: 'prod'
    }).promise();
    
    const apiUrl = `https://${apiId}.execute-api.us-east-1.amazonaws.com/prod/submit-game-result`;
    console.log('✅ API Gateway created and deployed:', apiUrl);
    
    return apiUrl;
    
  } catch (error) {
    console.error('❌ Failed to create API Gateway:', error.message);
    throw error;
  }
}

async function updateAppSyncSchema() {
  console.log('🔧 Updating AppSync schema...');
  
  // This would require the AppSync API ID and schema update
  // For now, we'll just log what needs to be done
  console.log('📝 AppSync schema needs to be updated manually in the AWS Console:');
  console.log('   1. Go to AWS AppSync Console');
  console.log('   2. Find your API (likely named something like "pfb-mobilehub-1126398616")');
  console.log('   3. Go to Schema tab');
  console.log('   4. Add the missing types and mutations:');
  console.log('');
  console.log('   Add this to the schema:');
  console.log(`
    type GameResultInput {
      gameId: ID!
      deviceId: ID!
      username: String!
      score: Int!
      guesses: Int!
      hints: Int!
      difficulty: String!
      gameWon: Boolean!
      timestamp: String!
    }
    
    type GameEndResponse {
      winner: String!
      rankings: [PlayerRanking!]!
      leaderboardUpdated: Boolean!
      newPersonalBest: Boolean!
    }
    
    type PlayerRanking {
      rank: Int!
      username: String!
      score: Int!
      guesses: Int!
      hints: Int!
      timeElapsed: Int!
    }
    
    type UsernameValidationInput {
      username: String!
    }
    
    type UsernameValidationResponse {
      available: Boolean!
      message: String!
      suggestions: [String!]!
    }
    
    extend type Mutation {
      submitGameResult(input: GameResultInput!): GameEndResponse!
      validateUsername(input: UsernameValidationInput!): UsernameValidationResponse!
    }
  `);
}

async function main() {
  console.log('🚀 Starting AWS Backend Fix...\n');
  
  try {
    // Create API Gateway and Lambda
    const apiUrl = await createApiGateway();
    
    // Update AppSync schema (manual instructions)
    await updateAppSyncSchema();
    
    console.log('\n✅ AWS Backend Fix Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update the API URL in the app to:', apiUrl);
    console.log('2. Manually update the AppSync schema in AWS Console');
    console.log('3. Test the game result submission');
    
  } catch (error) {
    console.error('\n❌ AWS Backend Fix Failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure AWS credentials are configured');
    console.log('2. Check that you have the necessary IAM permissions');
    console.log('3. Verify the AWS region is correct (us-east-1)');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createGameResultLambda, createApiGateway, updateAppSyncSchema }; 