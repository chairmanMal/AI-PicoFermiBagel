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

export const validateUsername = `
  mutation ValidateUsername($input: UsernameValidationInput!) {
    validateUsername(input: $input) {
      available
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

export const submitGameResultBasic = `
  mutation SubmitGameResultBasic($input: GameResultInput!) {
    submitGameResult(input: $input) {
      winner
      leaderboardUpdated
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