// src/services/multiplayerService.ts
import { v4 as uuidv4 } from 'uuid';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import * as subscriptions from '../graphql/subscriptions';

// Debug imports
console.log('🔧 MultiplayerService: mutations imported:', Object.keys(mutations));
console.log('🔧 MultiplayerService: queries imported:', Object.keys(queries));
console.log('🔧 MultiplayerService: subscriptions imported:', Object.keys(subscriptions));
console.log('🔧 MultiplayerService: getLeaderboard query:', queries.getLeaderboard);

// Enhanced error types
export interface ServiceError {
  type: 'NETWORK' | 'AUTHENTICATION' | 'PERMISSION' | 'VALIDATION' | 'SERVER' | 'UNKNOWN';
  message: string;
  details: string;
  retryable: boolean;
  suggestedAction: 'RETRY' | 'SWITCH_TO_SINGLE_PLAYER' | 'CHECK_CREDENTIALS' | 'CONTACT_SUPPORT';
  timestamp: string;
  operation: string;
  originalError?: any;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  retryCount?: number;
}

// Types
export interface UserRegistrationResult {
  success: boolean;
  deviceId: string;
  username: string;
  message: string;
  suggestions: string[];
}

export interface LobbyJoinResult {
  success: boolean;
  gameId?: string;
  playersWaiting: number;
  countdown?: number;
  message: string;
  error?: ServiceError;
}

export interface GamePulseResult {
  gameActive: boolean;
  playerCount: number;
  gameTimeElapsed: number;
  playerProgress: PlayerProgress[];
}

export interface PlayerProgress {
  username: string;
  guesses: number;
  score: number;
  active: boolean;
}

export interface GameEndResult {
  winner?: string;
  rankings: PlayerRanking[];
  leaderboardUpdated: boolean;
  newPersonalBest: boolean;
  error?: ServiceError;
}

export interface PlayerRanking {
  rank: number;
  username: string;
  score: number;
  guesses: number;
  hints: number;
  timeElapsed: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  timestamp: string;
  difficulty: string;
}

export interface LobbyUpdate {
  difficulty: string;
  playersWaiting: number;
  gameId?: string;
  countdown?: number;
  players: Array<{ username: string; joinedAt: string }>;
}

export interface GameUpdate {
  gameId: string;
  playerProgress: PlayerProgress[];
  gameTimeElapsed: number;
  playersRemaining: number;
}

export interface GameStartEvent {
  gameId: string;
  difficulty: string;
  randomSeed: number;
  players: string[];
  gameSettings: {
    rows: number;
    columns: number;
    selectionSetSize: number;
    multiRowFeedback: boolean;
  };
}

class MultiplayerService {
  private client: any = null;
  private subscriptions = new Map<string, any>();
  private deviceId: string;
  private maxRetries = 3;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    const stored = localStorage.getItem('deviceId');
    if (stored) return stored;
    
    const newId = uuidv4();
    localStorage.setItem('deviceId', newId);
    return newId;
  }

  private async getClient() {
    if (!this.client) {
      // Ensure AWS is initialized before creating the client
      const { initializeAWS } = await import('./awsConfig');
      initializeAWS();
      
      // Small delay to ensure AWS is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { generateClient } = await import('aws-amplify/api');
      this.client = generateClient();
    }
    return this.client;
  }

  // Enhanced error handling utility
  private createServiceError(
    type: ServiceError['type'],
    message: string,
    details: string,
    retryable: boolean,
    suggestedAction: ServiceError['suggestedAction'],
    operation: string,
    originalError?: any
  ): ServiceError {
    return {
      type,
      message,
      details,
      retryable,
      suggestedAction,
      timestamp: new Date().toISOString(),
      operation,
      originalError
    };
  }

  // Enhanced error logging
  private logError(operation: string, error: any, context?: any) {
    const errorInfo = {
      operation,
      timestamp: new Date().toISOString(),
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        statusCode: error?.statusCode,
        networkError: error?.networkError,
        graphQLErrors: error?.graphQLErrors,
        extraInfo: error?.extraInfo
      },
      context: {
        deviceId: this.deviceId,
        username: this.getStoredUsername(),
        ...context
      }
    };

    console.error('🚨 MultiplayerService Error:', JSON.stringify(errorInfo, null, 2));
    
    // Log to localStorage for debugging
    const errorLog = JSON.parse(localStorage.getItem('multiplayerErrorLog') || '[]');
    errorLog.push(errorInfo);
    if (errorLog.length > 50) errorLog.shift(); // Keep last 50 errors
    localStorage.setItem('multiplayerErrorLog', JSON.stringify(errorLog));
  }

  // Retry logic
  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = this.maxRetries,
    context?: any
  ): Promise<ServiceResult<T>> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return { success: true, data: result, retryCount: attempt - 1 };
      } catch (error) {
        lastError = error;
        const errorContext = {
          ...context,
          attempt,
          maxRetries
        };
        this.logError(operationName, error, errorContext);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
          console.log(`🔄 Retrying ${operationName} in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    const serviceError = this.analyzeError(lastError, operationName);
    return { success: false, error: serviceError, retryCount: maxRetries };
  }

  // Error analysis
  private analyzeError(error: any, operation: string): ServiceError {
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.code || error?.statusCode;
    const networkError = error?.networkError;
    const graphQLErrors = error?.graphQLErrors;

    // Network errors
    if (networkError || errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      return this.createServiceError(
        'NETWORK',
        'Network connection failed',
        `Failed to connect to AWS services. Error: ${errorMessage}`,
        true,
        'RETRY',
        operation,
        error
      );
    }

    // Authentication errors
    if (errorCode === 401 || errorMessage.includes('Unauthorized') || errorMessage.includes('authentication')) {
      return this.createServiceError(
        'AUTHENTICATION',
        'Authentication failed',
        `AWS credentials or API key may be invalid. Error: ${errorMessage}`,
        false,
        'CHECK_CREDENTIALS',
        operation,
        error
      );
    }

    // Permission errors
    if (errorCode === 403 || errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
      return this.createServiceError(
        'PERMISSION',
        'Permission denied',
        `Insufficient permissions to perform this operation. Error: ${errorMessage}`,
        false,
        'CONTACT_SUPPORT',
        operation,
        error
      );
    }

    // GraphQL errors
    if (graphQLErrors && graphQLErrors.length > 0) {
      const graphQLError = graphQLErrors[0];
      const errorMsg = graphQLError.message;
      
      // Handle specific GraphQL errors
      if (errorMsg.includes('Cannot return null for non-nullable type')) {
        return this.createServiceError(
          'SERVER',
          'AWS service temporarily unavailable',
          `The AWS backend service is not responding properly. Error: ${errorMsg}`,
          true,
          'RETRY',
          operation,
          error
        );
      }
      
      if (errorMsg.includes('Variable') && errorMsg.includes('coerced Null value')) {
        return this.createServiceError(
          'VALIDATION',
          'Invalid request format',
          `The request format is incorrect. Error: ${errorMsg}`,
          false,
          'CONTACT_SUPPORT',
          operation,
          error
        );
      }
      
      return this.createServiceError(
        'VALIDATION',
        'GraphQL validation error',
        `GraphQL error: ${errorMsg}. Path: ${graphQLError.path?.join('.') || 'unknown'}`,
        false,
        'CONTACT_SUPPORT',
        operation,
        error
      );
    }

    // Server errors
    if (errorCode >= 500 || errorMessage.includes('Internal Server Error')) {
      return this.createServiceError(
        'SERVER',
        'Server error',
        `AWS service temporarily unavailable. Error: ${errorMessage}`,
        true,
        'RETRY',
        operation,
        error
      );
    }

    // Unknown errors
    return this.createServiceError(
      'UNKNOWN',
      'Unexpected error',
      `An unexpected error occurred: ${errorMessage}`,
      true,
      'RETRY',
      operation,
      error
    );
  }

  // Get error log for debugging
  getErrorLog(): any[] {
    return JSON.parse(localStorage.getItem('multiplayerErrorLog') || '[]');
  }

  // Clear error log
  clearErrorLog(): void {
    localStorage.removeItem('multiplayerErrorLog');
  }

  // Enhanced username validation - AWS-first with local cache
  async validateUsername(username: string): Promise<{ available: boolean; message: string; suggestions: string[] }> {
    console.log('🔧 validateUsername: Starting AWS validation for', username);
    
    // First, check local cache for previously validated usernames
    const validatedUsernames = JSON.parse(localStorage.getItem('pfb_validated_usernames') || '[]');
    if (validatedUsernames.includes(username)) {
      console.log('🔧 validateUsername: Found in local cache - previously validated by AWS');
      return {
        available: true,
        message: 'Username is available (previously validated by AWS)',
        suggestions: ['Username looks good!', 'You can proceed with registration']
      };
    }
    
    // Local validation first (quick checks)
    if (!username || username.trim() === '') {
      console.log('🔧 validateUsername: Local validation failed - empty username');
      return {
        available: false,
        message: 'Username cannot be empty',
        suggestions: ['Enter a valid username', 'Use 3-20 characters']
      };
    }
    
    if (username.length < 3 || username.length > 20) {
      console.log('🔧 validateUsername: Local validation failed - length issue');
      return {
        available: false,
        message: 'Username must be 3-20 characters long',
        suggestions: ['Use 3-20 characters', 'Try a shorter or longer username']
      };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      console.log('🔧 validateUsername: Local validation failed - invalid characters');
      return {
        available: false,
        message: 'Username can only contain letters, numbers, and underscores',
        suggestions: ['Use only letters, numbers, and underscores', 'Remove special characters']
      };
    }
    
    // Now try AWS validation
    console.log('🔧 validateUsername: Local validation passed, calling AWS...');
    try {
      const result = await this.retryOperation(
        async () => {
          console.log('🔧 validateUsername: Making AWS GraphQL call...');
          const client = await this.getClient();
          const response = await client.graphql({
            query: mutations.validateUsername,
            variables: { username }
          });
          return response;
        },
        'validateUsername',
        3,
        { username }
      );

      console.log('🔧 validateUsername: AWS operation result:', result);

      if (result.success) {
        const data = (result.data as any).data?.validateUsername;
        console.log('🔧 validateUsername: AWS data:', data);
        const available = data?.available || false;
        
        if (available) {
          // Cache this validated username locally
          validatedUsernames.push(username);
          localStorage.setItem('pfb_validated_usernames', JSON.stringify(validatedUsernames));
          console.log('🔧 validateUsername: AWS validation successful, cached locally');
        }
        
        return {
          available,
          message: data?.message || 'Username validation completed',
          suggestions: data?.suggestions || []
        };
      } else {
        // AWS failed, provide helpful error message
        console.log('🔧 validateUsername: AWS validation failed:', result.error);
        return {
          available: false,
          message: 'Unable to validate username with AWS server',
          suggestions: ['Check your internet connection', 'Try again', 'Contact support if problem persists']
        };
      }
    } catch (error) {
      console.error('🔧 validateUsername: AWS error:', error);
      return {
        available: false,
        message: 'Network error during AWS username validation',
        suggestions: ['Check your internet connection', 'Try again', 'Switch to single player mode']
      };
    }
  }

  // Enhanced user registration - AWS-first with local cache
  async registerUser(username: string): Promise<UserRegistrationResult> {
    console.log('🔧 registerUser: Registering', username, 'with AWS');
    
    // First, check if this username was already successfully registered
    const registeredUsernames = JSON.parse(localStorage.getItem('pfb_registered_usernames') || '[]');
    if (registeredUsernames.includes(username)) {
      console.log('🔧 registerUser: Found in local cache - previously registered');
      return {
        success: true,
        deviceId: this.deviceId,
        username,
        message: 'User already registered (from cache)',
        suggestions: ['You can now join games', 'Try the multiplayer lobby']
      };
    }
    
    // Try AWS registration first
    try {
      const result = await this.retryOperation(
        async () => {
          const client = await this.getClient();
          const response = await client.graphql({
            query: mutations.registerUser,
            variables: { input: { username, deviceId: this.deviceId, timestamp: new Date().toISOString() } }
          });
          return response;
        },
        'registerUser',
        3,
        { username, deviceId: this.deviceId }
      );

      if (result.success) {
        const data = (result.data as any).data?.registerUser;
        const success = data?.success || false;
        
        if (success) {
          // Cache this successfully registered username locally
          registeredUsernames.push(username);
          localStorage.setItem('pfb_registered_usernames', JSON.stringify(registeredUsernames));
          
          // Also store current username
          localStorage.setItem('username', username);
          
          console.log('🔧 registerUser: AWS registration successful, cached locally');
        }
        
        return {
          success,
          deviceId: this.deviceId,
          username,
          message: data?.message || 'Registration completed',
          suggestions: data?.suggestions || []
        };
      } else {
        // AWS failed, provide helpful error message
        console.log('🔧 registerUser: AWS registration failed, providing fallback');
        return {
          success: false,
          deviceId: this.deviceId,
          username,
          message: 'Unable to register with server',
          suggestions: ['Check your internet connection', 'Try again', 'Contact support if problem persists']
        };
      }
    } catch (error) {
      console.error('registerUser AWS error:', error);
      return {
        success: false,
        deviceId: this.deviceId,
        username,
        message: 'Network error during registration',
        suggestions: ['Check your internet connection', 'Try again', 'Switch to single player mode']
      };
    }
  }

  async hasRegisteredUsername(): Promise<boolean> {
    return !!this.getStoredUsername();
  }

  getStoredUsername(): string | null {
    return localStorage.getItem('username');
  }

  // Enhanced lobby status
  async getLobbyStatus(difficulty: string): Promise<{ difficulty: string; playersWaiting: number; estimatedWaitTime: number }> {
    const result = await this.retryOperation(
      async () => {
        const client = await this.getClient();
        const response = await client.graphql({
          query: queries.getLobbyStatus,
          variables: { difficulty }
        });
        return response;
      },
      'getLobbyStatus'
    );

    if (!result.success) {
      console.error('Failed to get lobby status:', result.error);
      return {
        difficulty,
        playersWaiting: 0,
        estimatedWaitTime: 0
      };
    }

    const data = (result.data as any).data?.getLobbyStatus;
    return {
      difficulty,
      playersWaiting: data?.playersWaiting || 0,
      estimatedWaitTime: data?.estimatedWaitTime || 0
    };
  }

  // Enhanced lobby joining
  async joinLobby(difficulty: string, username?: string): Promise<LobbyJoinResult> {
    const selectedUsername = username || this.getStoredUsername();
    if (!selectedUsername) {
      return {
        success: false,
        playersWaiting: 0,
        message: 'No username provided',
        error: this.createServiceError(
          'VALIDATION',
          'Username required',
          'A username is required to join the lobby',
          false,
          'SWITCH_TO_SINGLE_PLAYER',
          'joinLobby'
        )
      };
    }

    const result = await this.retryOperation(
      async () => {
        const client = await this.getClient();
        const response = await client.graphql({
          query: mutations.joinLobby,
          variables: {
            input: {
              deviceId: this.deviceId,
              username: selectedUsername,
              difficulty,
              timestamp: new Date().toISOString()
            }
          }
        });
        return response;
      },
      'joinLobby'
    );

    if (!result.success) {
      return {
        success: false,
        playersWaiting: 0,
        message: `Failed to join lobby: ${result.error?.message}`,
        error: result.error
      };
    }

    const data = (result.data as any).data?.joinLobby;
    return {
      success: data?.success || false,
      gameId: data?.gameId,
      playersWaiting: data?.playersWaiting || 0,
      countdown: data?.countdown,
      message: data?.message || 'Successfully joined lobby'
    };
  }

  // Enhanced lobby leaving
  async leaveLobby(difficulty: string): Promise<boolean> {
    const result = await this.retryOperation(
      async () => {
        const client = await this.getClient();
        const response = await client.graphql({
          query: mutations.leaveLobby,
          variables: {
            input: {
              deviceId: this.deviceId,
              difficulty,
              timestamp: new Date().toISOString()
            }
          }
        });
        return response;
      },
      'leaveLobby'
    );

    if (!result.success) {
      console.error('Failed to leave lobby:', result.error);
      return false;
    }

    return true;
  }

  // Enhanced difficulty interest update
  async updateDifficultyInterest(difficulty: string, isInterested: boolean): Promise<boolean> {
    const result = await this.retryOperation(
      async () => {
        const client = await this.getClient();
        const response = await client.graphql({
          query: mutations.updateDifficultyInterest,
          variables: {
            input: {
              difficulty,
              isInterested,
              deviceId: this.deviceId,
              username: this.getStoredUsername() || 'Unknown',
              timestamp: new Date().toISOString()
            }
          }
        });
        return response;
      },
      'updateDifficultyInterest'
    );

    if (!result.success) {
      console.error('Failed to update difficulty interest:', result.error);
      return false;
    }

    const data = (result.data as any).data?.updateDifficultyInterest;
    return data?.success || false;
  }

  // Enhanced game pulse
  async sendGamePulse(gameId: string, gameStats: {
    score: number;
    guesses: number;
    hints: number;
    gameInProgress: boolean;
  }): Promise<GamePulseResult | null> {
    const result = await this.retryOperation(
      async () => {
        const client = await this.getClient();
        const response = await client.graphql({
          query: mutations.sendGamePulse,
          variables: {
            input: {
              gameId,
              deviceId: this.deviceId,
              username: this.getStoredUsername() || 'Unknown',
              ...gameStats,
              timestamp: new Date().toISOString()
            }
          }
        });
        return response;
      },
      'sendGamePulse'
    );

    if (!result.success) {
      console.error('Failed to send game pulse:', result.error);
      return null;
    }

    const data = (result.data as any).data?.sendGamePulse;
    return data || null;
  }

  // Enhanced game result submission
  async submitGameResult(gameId: string, gameStats: {
    score: number;
    guesses: number;
    hints: number;
    difficulty: string;
    gameWon: boolean;
  }, username?: string): Promise<GameEndResult | null> {
    const selectedUsername = username || this.getStoredUsername() || 'Unknown';
    
    console.log('🎮 MultiplayerService: Attempting AppSync game result submission...');
    
    const result = await this.retryOperation(
      async () => {
        const client = await this.getClient();
        const response = await client.graphql({
          query: mutations.submitGameResult,
          variables: {
            input: {
              gameId,
              deviceId: this.deviceId,
              username: selectedUsername,
              ...gameStats,
              timestamp: new Date().toISOString()
            }
          }
        });
        return response;
      },
      'submitGameResult'
    );

    if (!result.success) {
      console.error('🎮 MultiplayerService: Game result submission failed:', result.error);
      return {
        winner: selectedUsername,
        rankings: [{
          rank: 1,
          username: selectedUsername,
          score: gameStats.score,
          guesses: gameStats.guesses,
          hints: gameStats.hints,
          timeElapsed: 0
        }],
        leaderboardUpdated: false,
        newPersonalBest: false,
        error: result.error
      };
    }

    const data = (result.data as any).data?.submitGameResult;
    return data || {
      winner: selectedUsername,
      rankings: [{
        rank: 1,
        username: selectedUsername,
        score: gameStats.score,
        guesses: gameStats.guesses,
        hints: gameStats.hints,
        timeElapsed: 0
      }],
      leaderboardUpdated: true,
      newPersonalBest: true
    };
  }

  // Enhanced leaderboard retrieval
  async getLeaderboard(difficulty: string, limit: number = 20): Promise<LeaderboardEntry[]> {
    console.log('🏆 MultiplayerService: Loading leaderboard data from AWS for difficulty:', difficulty);
    
    const result = await this.retryOperation(
      async () => {
        const client = await this.getClient();
        const response = await client.graphql({
          query: queries.getLeaderboard,
          variables: { difficulty, limit }
        });
        return response;
      },
      'getLeaderboard'
    );

    if (!result.success) {
      console.error('🏆 MultiplayerService: Get leaderboard failed:', result.error);
      throw new Error(`Get leaderboard failed: ${result.error?.message}`);
    }

    const data = (result.data as any).data?.getLeaderboard;
    console.log('🏆 MultiplayerService: AWS leaderboard data:', data);
    
    return data || [];
  }

  // Enhanced subscription methods
  subscribeLobbyUpdates(
    _difficulty: string, 
    _callback: (update: LobbyUpdate) => void
  ): { unsubscribe: () => void } {
    // TODO: Implement proper GraphQL subscriptions
    console.log('🎮 MultiplayerService: Lobby subscription not implemented yet');
    return { unsubscribe: () => {} };
  }

  subscribeGameUpdates(
    _gameId: string,
    _callback: (update: GameUpdate) => void
  ): { unsubscribe: () => void } {
    // TODO: Implement proper GraphQL subscriptions
    console.log('🎮 MultiplayerService: Game updates subscription not implemented yet');
    return { unsubscribe: () => {} };
  }

  subscribeGameStart(
    _callback: (event: GameStartEvent) => void
  ): { unsubscribe: () => void } {
    // TODO: Implement proper GraphQL subscriptions
    console.log('🎮 MultiplayerService: Game start subscription not implemented yet');
    return { unsubscribe: () => {} };
  }

  // Enhanced cleanup
  cleanup() {
    this.subscriptions.forEach(subscription => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    this.subscriptions.clear();
  }

  getDeviceId(): string {
    return this.deviceId;
  }
}

export const multiplayerService = new MultiplayerService();