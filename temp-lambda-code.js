const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  try {
    // Handle both submitGameResult and getLeaderboard actions
    const action = event.arguments?.action || event.action;
    
    if (action === "submitGameResult") {
      const { gameId, deviceId, username, score, guesses, hints, difficulty, gameWon, timestamp } = event.arguments.input;
      
      // Create entry in the existing DynamoDB table schema
      const entry = {
        Id: gameId,
        Initials: username.substring(0, 10),
        Score: score,
        Date: new Date().toLocaleDateString("en-US"),
        Difficulty: difficulty === "classic" ? 8 : 6,
        Attempts: guesses,
        Time: Math.round((Date.now() - new Date(timestamp).getTime()) / 1000),
        Valid: 1,
        Seed: Math.floor(Math.random() * 1000000),
        RandomCount: Math.floor(Math.random() * 100),
        VersionNumber: 0
      };
      
      console.log("Writing to DynamoDB:", entry);
      
      await dynamodb.put({
        TableName: "pfb-mobilehub-1126398616-LeaderBoardTable",
        Item: entry
      }).promise();
      
      console.log("Successfully wrote game result to DynamoDB");
      
      // Return the correct GameEndResponse structure
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
      
      const result = await dynamodb.scan({
        TableName: "pfb-mobilehub-1126398616-LeaderBoardTable",
        Limit: limit || 20
      }).promise();
      
      return (result.Items || []).map((item, index) => ({
        rank: index + 1,
        username: item.Initials || 'Unknown',
        score: parseInt(item.Score || '0'),
        timestamp: item.Date || new Date().toISOString(),
        difficulty: item.Difficulty === 8 ? 'classic' : 'easy'
      })).sort((a, b) => b.score - a.score);
    }
    
  } catch (error) {
    console.error("Error in leaderboard function:", error);
    
    // Return error response that matches expected structure
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
};