const { LambdaClient, UpdateFunctionCodeCommand } = require('@aws-sdk/client-lambda');
const fs = require('fs');
const path = require('path');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function fixLambdaExactFormat() {
  console.log('🔧 Fixing Lambda function with exact event format...\n');
  
  const code = `import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  try {
    // Handle the exact AppSync format from the logs
    let action, input;
    
    if (event.field) {
      // AppSync format from logs
      action = event.field;
      input = event.arguments?.input;
    } else if (event.payload && event.payload.field) {
      // Alternative AppSync format
      action = event.payload.field;
      input = event.payload.arguments?.input;
    } else if (event.arguments && event.arguments.input) {
      // Direct format
      action = event.arguments?.action || event.action;
      input = event.arguments.input;
    } else {
      // Fallback format
      action = event.action;
      input = event.input;
    }
    
    console.log("Action:", action);
    console.log("Input:", JSON.stringify(input, null, 2));
    
    if (action === "submitGameResult") {
      const { gameId, deviceId, username, score, guesses, hints, difficulty, gameWon, timestamp } = input;
      
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
      
      await dynamodb.send(new PutCommand({
        TableName: "pfb-leaderboard-v2",
        Item: entry
      }));
      
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
    }
    
    if (action === "getLeaderboard") {
      const { difficulty, limit } = input || {};
      
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
      
      const result = await dynamodb.send(new QueryCommand(params));
      
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
    
    // If no action matched, return null (this causes the AppSync error)
    console.log("No matching action found, returning null");
    return null;
    
  } catch (error) {
    console.error("Error in leaderboard function:", error);
    
    if (action === "submitGameResult") {
      return {
        winner: input?.username || "Unknown",
        rankings: [],
        leaderboardUpdated: false,
        newPersonalBest: false
      };
    } else {
      return null;
    }
  }
};`;

  try {
    console.log('📝 Writing updated code to temp file...');
    const tempFile = path.join(__dirname, 'temp-lambda-exact.js');
    fs.writeFileSync(tempFile, code);
    const codeBuffer = fs.readFileSync(tempFile);
    
    console.log('🔧 Updating Lambda function...');
    await lambda.send(new UpdateFunctionCodeCommand({
      FunctionName: 'pfb-leaderboard-v2',
      ZipFile: codeBuffer
    }));
    
    console.log('✅ Successfully updated Lambda function with exact event format');
    fs.unlinkSync(tempFile);
    
  } catch (error) {
    console.error('❌ Error updating Lambda function:', error.message);
  }
}

fixLambdaExactFormat(); 