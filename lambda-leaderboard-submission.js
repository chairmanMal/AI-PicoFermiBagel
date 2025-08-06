import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);

export const handler = async (event) => {
  console.log('🎮 Lambda: Received leaderboard submission event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the input
    const { gameId, username, score, guesses, hints, difficulty, gameWon, timestamp } = event;
    
    if (!gameId || !username || score === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Missing required fields: gameId, username, score'
        })
      };
    }
    
    // Create the entry in the old schema format
    const entry = {
      Id: gameId,
      Initials: username.substring(0, 10), // Limit to 10 chars
      Score: Number(score),
      Date: new Date().toLocaleDateString('en-US'),
      Difficulty: difficulty === 'classic' ? 8 : 6, // Map difficulty
      Attempts: Number(guesses),
      Time: Math.round((Date.now() - new Date(timestamp).getTime()) / 1000), // Time in seconds
      Valid: 1,
      Seed: Math.floor(Math.random() * 1000000), // Random seed
      RandomCount: Math.floor(Math.random() * 100),
      VersionNumber: 0
    };
    
    console.log('🎮 Lambda: Writing to DynamoDB:', entry);
    
    // Write to DynamoDB
    const result = await dynamodb.send(new PutCommand({
      TableName: 'pfb-mobilehub-1126398616-LeaderBoardTable',
      Item: entry
    }));
    
    console.log('🎮 Lambda: Successfully wrote to DynamoDB:', result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Game result submitted successfully',
        gameId: gameId,
        score: score
      })
    };
    
  } catch (error) {
    console.error('🎮 Lambda: Error submitting game result:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Failed to submit game result',
        error: error.message
      })
    };
  }
}; 