const fs = require('fs');
const path = require('path');

async function debugLeaderboardFrontend() {
  console.log('🔧 Adding detailed logging to multiplayerService...\n');
  
  const multiplayerServicePath = path.join(__dirname, 'src/services/multiplayerService.ts');
  
  // Read the current file
  let content = fs.readFileSync(multiplayerServicePath, 'utf8');
  
  // Add more detailed logging to the getLeaderboard method
  const updatedGetLeaderboardMethod = `  // Leaderboard
  async getLeaderboard(difficulty: string, limit: number = 20): Promise<LeaderboardEntry[]> {
    try {
      console.log('🎮 MultiplayerService: Getting leaderboard via AppSync for difficulty:', difficulty);
      console.log('🎮 MultiplayerService: Using queries.getLeaderboard:', queries.getLeaderboard);
      
      const result = await this.client.graphql({
        query: queries.getLeaderboard,
        variables: {
          difficulty: difficulty,
          limit: limit
        }
      });

      console.log('🎮 MultiplayerService: AppSync query result:', JSON.stringify(result, null, 2));
      
      // Check for GraphQL errors
      if ('errors' in result && result.errors && result.errors.length > 0) {
        console.error('🎮 MultiplayerService: GraphQL errors:', result.errors);
        return [];
      }

      if (!('data' in result) || !result.data || !result.data.getLeaderboard) {
        console.error('🎮 MultiplayerService: No data in response:', result);
        return [];
      }

      const leaderboardData = result.data.getLeaderboard;
      console.log('🎮 MultiplayerService: Leaderboard data received:', leaderboardData);
      
      return leaderboardData.map((entry: any) => ({
        rank: entry.rank,
        username: entry.username,
        score: entry.score,
        timestamp: entry.timestamp,
        difficulty: entry.difficulty
      }));
      
    } catch (error) {
      console.error('Get leaderboard failed:', error);
      console.error('Get leaderboard failed details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return [];
    }
  }`;
  
  // Find and replace the old getLeaderboard method
  const oldMethodRegex = /\/\/ Leaderboard[\s\S]*?async getLeaderboard[\s\S]*?return \[\];[\s\S]*?}/;
  
  if (oldMethodRegex.test(content)) {
    content = content.replace(oldMethodRegex, updatedGetLeaderboardMethod);
    fs.writeFileSync(multiplayerServicePath, content);
    console.log('✅ Successfully added detailed logging to multiplayerService');
  } else {
    console.log('❌ Could not find the getLeaderboard method to replace');
  }
}

debugLeaderboardFrontend(); 