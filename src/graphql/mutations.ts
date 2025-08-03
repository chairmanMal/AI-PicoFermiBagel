// src/graphql/mutations.ts
export const registerUser = `
  mutation RegisterUser($input: UserRegistrationInput!) {
    registerUser(input: $input) {
      success
      deviceId
      username
      message
      suggestions
    }
  }
`;

export const joinLobby = `
  mutation JoinLobby($input: JoinLobbyInput!) {
    joinLobby(input: $input) {
      success
      gameId
      playersWaiting
      countdown
      message
    }
  }
`;



export const leaveLobby = `
  mutation LeaveLobby($input: LeaveLobbyInput!) {
    leaveLobby(input: $input)
  }
`;

export const sendGamePulse = `
  mutation SendGamePulse($input: GamePulseInput!) {
    sendGamePulse(input: $input) {
      gameActive
      playerCount
      gameTimeElapsed
      playerProgress {
        username
        guesses
        score
        active
      }
    }
  }
`;

export const submitGameResult = `
  mutation SubmitGameResult($input: GameResultInput!) {
    submitGameResult(input: $input) {
      winner
      rankings {
        rank
        username
        score
        guesses
        hints
        timeElapsed
      }
      leaderboardUpdated
      newPersonalBest
    }
  }
`;

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

// src/graphql/subscriptions.ts
export const onLobbyUpdate = `
  subscription OnLobbyUpdate($difficulty: String!) {
    onLobbyUpdate(difficulty: $difficulty) {
      difficulty
      playersWaiting
      gameId
      countdown
      players {
        username
        joinedAt
      }
    }
  }
`;

export const onGameUpdate = `
  subscription OnGameUpdate($gameId: ID!) {
    onGameUpdate(gameId: $gameId) {
      gameId
      playerProgress {
        username
        guesses
        score
        active
      }
      gameTimeElapsed
      playersRemaining
    }
  }
`;

export const onGameStart = `
  subscription OnGameStart($deviceId: ID!) {
    onGameStart(deviceId: $deviceId) {
      gameId
      difficulty
      randomSeed
      players
      gameSettings {
        rows
        columns
        selectionSetSize
        multiRowFeedback
      }
    }
  }
`;

export const onGameEnd = `
  subscription OnGameEnd($gameId: ID!) {
    onGameEnd(gameId: $gameId) {
      gameId
      winner
      finalRankings {
        rank
        username
        score
        guesses
        hints
        timeElapsed
      }
      gameStats {
        duration
        totalGuesses
        averageScore
      }
    }
  }
`;