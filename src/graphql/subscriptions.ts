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

export const onDifficultyInterestUpdate = `
  subscription OnDifficultyInterestUpdate {
    onDifficultyInterestUpdate {
      difficulty
      interestCount
      timestamp
    }
  }
`;