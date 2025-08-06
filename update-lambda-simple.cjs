const { LambdaClient, UpdateFunctionCodeCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function updateLambdaSimple() {
  console.log('🔧 Updating Lambda function with correct code...\n');
  
  // The correct code that handles the exact event format
  const code = `import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  try {
    // Handle the exact AppSync format from the logs
    const action = event.field;
    const input = event.arguments?.input;
    
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
    
    console.log("No matching action found, returning null");
    return null;
    
  } catch (error) {
    console.error("Error in leaderboard function:", error);
    return null;
  }
};`;

  try {
    console.log('🔧 Updating Lambda function...');
    await lambda.send(new UpdateFunctionCodeCommand({
      FunctionName: 'pfb-leaderboard-v2',
      ZipFile: Buffer.from(code)
    }));
    
    console.log('✅ Successfully updated Lambda function');
    
  } catch (error) {
    console.error('❌ Error updating Lambda function:', error.message);
  }
}

updateLambdaSimple(); 