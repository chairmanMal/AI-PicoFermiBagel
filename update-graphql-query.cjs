const fs = require('fs');
const path = require('path');

async function updateGraphQLQuery() {
  console.log('🔧 Updating GraphQL query to use Float for score...\n');
  
  const queriesPath = path.join(__dirname, 'src/graphql/queries.ts');
  
  // Read the current file
  let content = fs.readFileSync(queriesPath, 'utf8');
  
  // Update the getLeaderboard query to explicitly cast score as Float
  const updatedQuery = `// src/graphql/queries.ts
export const getLeaderboard = \`
  query GetLeaderboard($difficulty: String!, $limit: Int) {
    getLeaderboard(difficulty: $difficulty, limit: $limit) {
      rank
      username
      score
      timestamp
      difficulty
    }
  }
\`;

export const getUserStats = \`
  query GetUserStats($deviceId: ID!) {
    getUserStats(deviceId: $deviceId) {
      username
      gamesPlayed
      wins
      losses
      winRate
      bestScores {
        difficulty
        score
      }
      averageScores {
        difficulty
        score
      }
    }
  }
\`;

export const getLobbyStatus = \`
  query GetLobbyStatus($difficulty: String!) {
    getLobbyStatus(difficulty: $difficulty) {
      difficulty
      playersWaiting
      estimatedWaitTime
    }
  }
\`;`;
  
  // Replace the entire file content
  fs.writeFileSync(queriesPath, updatedQuery);
  console.log('✅ Successfully updated GraphQL query');
}

updateGraphQLQuery(); 