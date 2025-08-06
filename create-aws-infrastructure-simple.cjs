const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { AppSyncClient, CreateDataSourceCommand } = require('@aws-sdk/client-appsync');
const { LambdaClient, CreateFunctionCommand } = require('@aws-sdk/client-lambda');
const fs = require('fs');
const path = require('path');

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });
const appsync = new AppSyncClient({ region: 'us-east-1' });
const lambda = new LambdaClient({ region: 'us-east-1' });

const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';
const ACCOUNT_ID = '171591329315';

async function createDynamoDBTables() {
  console.log('🗄️ Creating DynamoDB tables...\n');

  const tables = [
    {
      name: 'pfb-leaderboard-v2',
      description: 'Leaderboard for game scores and rankings',
      schema: {
        AttributeDefinitions: [
          { AttributeName: 'gameId', AttributeType: 'S' },
          { AttributeName: 'username', AttributeType: 'S' },
          { AttributeName: 'score', AttributeType: 'N' },
          { AttributeName: 'difficulty', AttributeType: 'S' }
        ],
        KeySchema: [
          { AttributeName: 'gameId', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'username-index',
            KeySchema: [
              { AttributeName: 'username', KeyType: 'HASH' },
              { AttributeName: 'score', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' }
          },
          {
            IndexName: 'difficulty-score-index',
            KeySchema: [
              { AttributeName: 'difficulty', KeyType: 'HASH' },
              { AttributeName: 'score', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' }
          }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }
    },
    {
      name: 'pfb-usernames-v2',
      description: 'Username registration and validation',
      schema: {
        AttributeDefinitions: [
          { AttributeName: 'username', AttributeType: 'S' },
          { AttributeName: 'deviceId', AttributeType: 'S' }
        ],
        KeySchema: [
          { AttributeName: 'username', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'deviceId-index',
            KeySchema: [
              { AttributeName: 'deviceId', KeyType: 'HASH' }
            ],
            Projection: { ProjectionType: 'ALL' }
          }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }
    },
    {
      name: 'pfb-game-state-v2',
      description: 'Game state and lobby management',
      schema: {
        AttributeDefinitions: [
          { AttributeName: 'gameId', AttributeType: 'S' },
          { AttributeName: 'deviceId', AttributeType: 'S' },
          { AttributeName: 'status', AttributeType: 'S' }
        ],
        KeySchema: [
          { AttributeName: 'gameId', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'deviceId-index',
            KeySchema: [
              { AttributeName: 'deviceId', KeyType: 'HASH' }
            ],
            Projection: { ProjectionType: 'ALL' }
          },
          {
            IndexName: 'status-index',
            KeySchema: [
              { AttributeName: 'status', KeyType: 'HASH' }
            ],
            Projection: { ProjectionType: 'ALL' }
          }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }
    }
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Creating table: ${table.name}`);
      await dynamodb.send(new CreateTableCommand({
        TableName: table.name,
        ...table.schema
      }));
      console.log(`✅ Created table: ${table.name}`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`ℹ️ Table ${table.name} already exists`);
      } else {
        console.error(`❌ Error creating table ${table.name}:`, error.message);
      }
    }
  }
}

async function createLambdaFunctions() {
  console.log('\n🔧 Creating Lambda functions...\n');

  // Leaderboard Lambda function code
  const leaderboardCode = `const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  try {
    const action = event.arguments?.action || event.action;
    
    if (action === "submitGameResult") {
      const { gameId, deviceId, username, score, guesses, hints, difficulty, gameWon, timestamp } = event.arguments.input;
      
      const entry = {
        gameId: gameId,
        username: username,
        score: score,
        guesses: guesses,
        hints: hints,
        difficulty: difficulty,
        gameWon: gameWon,
        timestamp: timestamp,
        deviceId: deviceId,
        createdAt: new Date().toISOString()
      };
      
      console.log("Writing to DynamoDB:", entry);
      
      await dynamodb.put({
        TableName: "pfb-leaderboard-v2",
        Item: entry
      }).promise();
      
      console.log("Successfully wrote game result to DynamoDB");
      
      return {
        winner: username,
        rankings: [{
          rank: 1,
          username: username,
          score: score,
          guesses: guesses,
          hints: hints,
          timeElapsed: Math.round((Date.now() - new Date(timestamp).getTime()) / 1000)
        }],
        leaderboardUpdated: true,
        newPersonalBest: true
      };
      
    } else if (action === "getLeaderboard") {
      const { difficulty, limit } = event.arguments;
      
      const params = {
        TableName: "pfb-leaderboard-v2",
        IndexName: "difficulty-score-index",
        KeyConditionExpression: "difficulty = :difficulty",
        ExpressionAttributeValues: {
          ":difficulty": difficulty || "classic"
        },
        ScanIndexForward: false,
        Limit: limit || 20
      };
      
      const result = await dynamodb.query(params).promise();
      
      return (result.Items || []).map((item, index) => ({
        rank: index + 1,
        username: item.username,
        score: item.score,
        guesses: item.guesses,
        hints: item.hints,
        timestamp: item.timestamp,
        difficulty: item.difficulty
      }));
    }
    
  } catch (error) {
    console.error("Error in leaderboard function:", error);
    
    if (event.arguments?.action === "submitGameResult") {
      return {
        winner: event.arguments.input?.username || "Unknown",
        rankings: [],
        leaderboardUpdated: false,
        newPersonalBest: false
      };
    } else {
      return [];
    }
  }
};`;

  const functions = [
    {
      name: 'pfb-leaderboard-v2',
      description: 'Leaderboard management for game scores',
      code: leaderboardCode
    }
  ];

  for (const func of functions) {
    try {
      console.log(`🔧 Creating Lambda function: ${func.name}`);
      
      // Write code to temp file
      const tempFile = path.join(__dirname, `temp-${func.name}.js`);
      fs.writeFileSync(tempFile, func.code);
      const codeBuffer = fs.readFileSync(tempFile);
      
      await lambda.send(new CreateFunctionCommand({
        FunctionName: func.name,
        Runtime: 'nodejs18.x',
        Role: `arn:aws:iam::${ACCOUNT_ID}:role/PFB-AppSync-ServiceRole`,
        Handler: 'index.handler',
        Code: { ZipFile: codeBuffer },
        Description: func.description
      }));
      
      console.log(`✅ Created Lambda function: ${func.name}`);
      fs.unlinkSync(tempFile);
      
    } catch (error) {
      if (error.name === 'ResourceConflictException') {
        console.log(`ℹ️ Lambda function ${func.name} already exists`);
      } else {
        console.error(`❌ Error creating Lambda function ${func.name}:`, error.message);
      }
    }
  }
}

async function createAppSyncDataSources() {
  console.log('\n📡 Creating AppSync data sources...\n');

  const dataSources = [
    {
      name: 'LeaderboardDataSource',
      lambdaFunctionArn: `arn:aws:lambda:us-east-1:${ACCOUNT_ID}:function:pfb-leaderboard-v2`
    }
  ];

  for (const ds of dataSources) {
    try {
      console.log(`📡 Creating data source: ${ds.name}`);
      
      await appsync.send(new CreateDataSourceCommand({
        apiId: API_ID,
        name: ds.name,
        type: 'AWS_LAMBDA',
        serviceRoleArn: `arn:aws:iam::${ACCOUNT_ID}:role/PFB-AppSync-ServiceRole`,
        lambdaConfig: {
          lambdaFunctionArn: ds.lambdaFunctionArn
        }
      }));
      
      console.log(`✅ Created data source: ${ds.name}`);
      
    } catch (error) {
      if (error.name === 'ConflictException') {
        console.log(`ℹ️ Data source ${ds.name} already exists`);
      } else {
        console.error(`❌ Error creating data source ${ds.name}:`, error.message);
      }
    }
  }
}

async function main() {
  console.log('🚀 Setting up AWS infrastructure for PicoFermiBagel v2...\n');
  
  await createDynamoDBTables();
  await createLambdaFunctions();
  await createAppSyncDataSources();
  
  console.log('\n✅ Infrastructure setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Update AppSync resolver for submitGameResult to use LeaderboardDataSource');
  console.log('2. Test the new infrastructure');
  console.log('3. Update your frontend code to use the new table names');
}

main().catch(console.error); 