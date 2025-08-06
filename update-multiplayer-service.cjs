const fs = require('fs');
const path = require('path');

async function updateMultiplayerService() {
  console.log('🔧 Updating multiplayerService to use AppSync query...\n');
  
  const multiplayerServicePath = path.join(__dirname, 'src/services/multiplayerService.ts');
  
  // Read the current file
  let content = fs.readFileSync(multiplayerServicePath, 'utf8');
  
  // Replace the getLeaderboard method to use AppSync query
  const newGetLeaderboardMethod = `  // Leaderboard
  async getLeaderboard(difficulty: string, limit: number = 20): Promise<LeaderboardEntry[]> {
    try {
      console.log('🎮 MultiplayerService: Getting leaderboard via AppSync for difficulty:', difficulty);
      
      const result = await this.client.graphql({
        query: queries.getLeaderboard,
        variables: {
          difficulty: difficulty,
          limit: limit
        }
      });

      console.log('🎮 MultiplayerService: AppSync query result:', result);
      
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
      return [];
    }
  }`;
  
  // Find and replace the old getLeaderboard method
  const oldMethodRegex = /\/\/ Leaderboard[\s\S]*?async getLeaderboard[\s\S]*?return \[\];[\s\S]*?}/;
  
  if (oldMethodRegex.test(content)) {
    content = content.replace(oldMethodRegex, newGetLeaderboardMethod);
    fs.writeFileSync(multiplayerServicePath, content);
    console.log('✅ Successfully updated multiplayerService to use AppSync query');
  } else {
    console.log('❌ Could not find the old getLeaderboard method to replace');
  }
}

updateMultiplayerService(); 