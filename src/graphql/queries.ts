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
  query GetLobbyStatus($input: GetLobbyStatusInput!) {
    getLobbyStatus(input: $input) {
      difficulty
      playersWaiting
      players {
        username
        joinedAt
        seatIndex
      }
      gameId
      countdown
    }
  }
`;

export const getDifficultyInterestCounts = `
  query GetDifficultyInterestCounts {
    getDifficultyInterestCounts {
      difficulty
      interestCount
      timestamp
    }
  }
`;