// src/graphql/mutations.ts
export const validateUsername = `
  mutation ValidateUsername($username: String!) {
    validateUsername(username: $username) {
      available
      message
      suggestions
    }
  }
`;

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

export const loginUser = `
  mutation LoginUser($input: UserLoginInput!) {
    loginUser(input: $input) {
      success
      user {
        username
        deviceId
        createdAt
        lastLogin
        gamesPlayed
        bestScore
        averageScore
      }
      message
      suggestions
    }
  }
`;

export const registerUserWithPassword = `
  mutation RegisterUserWithPassword($input: UserRegistrationWithPasswordInput!) {
    registerUserWithPassword(input: $input) {
      success
      user {
        username
        deviceId
        createdAt
        lastLogin
        gamesPlayed
        bestScore
        averageScore
      }
      message
      suggestions
    }
  }
`;

export const joinLobby = `
  mutation JoinLobbyWithNotification($input: JoinLobbyInputWithNotification!) {
    joinLobbyWithNotification(input: $input) {
      success
      gameId
      playersWaiting
      message
    }
  }
`;

export const leaveLobby = `
  mutation LeaveLobbyWithNotification($input: LeaveLobbyInputWithNotification!) {
    leaveLobbyWithNotification(input: $input) {
      success
      message
    }
  }
`;

export const updateDifficultyInterest = `
  mutation UpdateDifficultyInterestWithNotification($input: UpdateDifficultyInterestInput!) {
    updateDifficultyInterestWithNotification(input: $input) {
      success
      message
      newInterestCount
    }
  }
`;

export const sendHeartbeat = `
  mutation SendHeartbeat($input: HeartbeatInput!) {
    sendHeartbeat(input: $input) {
      success
      message
    }
  }
`;

export const removeDifficultyInterest = `
  mutation RemoveDifficultyInterest($input: RemoveDifficultyInterestInput!) {
    removeDifficultyInterest(input: $input) {
      success
      message
      newInterestCount
    }
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


