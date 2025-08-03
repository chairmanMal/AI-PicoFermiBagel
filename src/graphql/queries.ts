// src/graphql/queries.ts
export const getLeaderboard = `
  query GetLeaderboard($difficulty: String!, $limit: Int) {
    getLeaderboard(difficulty: $difficulty, limit: $limit) {
      rank
      username
      score
      timestamp
      difficulty
    }
  }
`;

export const getUserStats = `
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
`;

export const getLobbyStatus = `
  query GetLobbyStatus($difficulty: String!) {
    getLobbyStatus(difficulty: $difficulty) {
      difficulty
      playersWaiting
      estimatedWaitTime
    }
  }
`;