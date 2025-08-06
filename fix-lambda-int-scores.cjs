const { LambdaClient, UpdateFunctionCodeCommand } = require('@aws-sdk/client-lambda');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const lambda = new LambdaClient({ region: 'us-east-1' });

async function fixLambdaIntScores() {
  console.log('🔧 Fixing Lambda function to return integer scores for AppSync...\n');
  
  // The corrected code that returns integer scores for AppSync compatibility
  const code = `import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  try {
    // Handle both AppSync event formats
    let action, input;
    
    if (event.field) {
      // Direct format: { field: "getLeaderboard", arguments: {...} }
      action = event.field;
      input = event.arguments;
    } else if (event.info && event.info.fieldName) {
      // AppSync format: { info: { fieldName: "getLeaderboard" }, arguments: {...} }
      action = event.info.fieldName;
      input = event.arguments;
    } else if (event.payload && event.payload.field) {
      // Alternative AppSync format
      action = event.payload.field;
      input = event.payload.arguments?.input;
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
        score: score, // Store as float in DynamoDB
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
          score: Math.round(score), // Return as integer for AppSync
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
        score: Math.round(item.score), // Return as integer for AppSync
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
    // Create temp directory
    const tempDir = path.join(__dirname, 'temp-lambda');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Write the code file with .mjs extension
    const codeFile = path.join(tempDir, 'index.mjs');
    fs.writeFileSync(codeFile, code);
    
    // Create zip file
    const zipFile = path.join(__dirname, 'lambda.zip');
    const output = fs.createWriteStream(zipFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', async () => {
      console.log('📦 Zip file created successfully');
      
      try {
        console.log('🔧 Updating Lambda function...');
        const zipBuffer = fs.readFileSync(zipFile);
        
        await lambda.send(new UpdateFunctionCodeCommand({
          FunctionName: 'pfb-leaderboard-v2',
          ZipFile: zipBuffer
        }));
        
        console.log('✅ Successfully updated Lambda function');
        
        // Cleanup
        fs.unlinkSync(zipFile);
        fs.rmSync(tempDir, { recursive: true });
        
      } catch (error) {
        console.error('❌ Error updating Lambda function:', error.message);
      }
    });
    
    archive.pipe(output);
    archive.file(codeFile, { name: 'index.mjs' });
    archive.finalize();
    
  } catch (error) {
    console.error('❌ Error creating zip file:', error.message);
  }
}

fixLambdaIntScores(); 