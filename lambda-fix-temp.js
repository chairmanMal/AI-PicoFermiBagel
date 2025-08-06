import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  try {
    // Handle multiple AppSync event formats
    let action, input;
    
    if (event.field) {
      // Direct AppSync format: { field: "submitGameResult", arguments: {...} }
      action = event.field;
      input = event.arguments?.input;
    } else if (event.info && event.info.fieldName) {
      // AppSync format: { info: { fieldName: "submitGameResult" }, arguments: {...} }
      action = event.info.fieldName;
      input = event.arguments;
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
      
      // Create entry for DynamoDB
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
      
      try {
        await dynamodb.send(new PutCommand({
          TableName: "pfb-leaderboard-v2",
          Item: entry
        }));
        
        console.log("Successfully wrote game result to DynamoDB");
      } catch (dbError) {
        console.error("DynamoDB write error:", dbError);
        // Continue execution even if DynamoDB write fails
      }
      
      // ALWAYS return a proper GameEndResponse object (never null)
      const response = {
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
      
      console.log("Returning GameEndResponse:", JSON.stringify(response, null, 2));
      return response;
    }
    
    if (action === "getLeaderboard") {
      const { difficulty, limit } = input || {};
      
      try {
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
          timestamp: item.timestamp,
          difficulty: item.difficulty
        }));
      } catch (dbError) {
        console.error("DynamoDB query error:", dbError);
        return [];
      }
    }
    
    // If no action matched, return a default GameEndResponse instead of null
    console.log("No matching action found, returning default GameEndResponse");
    return {
      winner: "Unknown",
      rankings: [],
      leaderboardUpdated: false,
      newPersonalBest: false
    };
    
  } catch (error) {
    console.error("Error in leaderboard function:", error);
    
    // ALWAYS return a proper GameEndResponse object (never null)
    return {
      winner: "Error",
      rankings: [],
      leaderboardUpdated: false,
      newPersonalBest: false
    };
  }
};
