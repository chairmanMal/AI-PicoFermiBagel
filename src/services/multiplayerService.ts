// src/services/multiplayerService.ts
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import * as subscriptions from '../graphql/subscriptions';

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
  private client = generateClient();
  private subscriptions = new Map<string, any>();
  private deviceId: string;
  private failedOperationsQueue: any[] = [];

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('pfb_device_id');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('pfb_device_id', deviceId);
    }
    return deviceId;
  }

  // User Management
  async registerUser(username: string): Promise<UserRegistrationResult> {
    try {
      const result = await this.client.graphql({
        query: mutations.registerUser,
        variables: {
          input: {
            deviceId: this.deviceId,
            username,
            timestamp: new Date().toISOString()
          }
        }
      });

      const response = result.data.registerUser;
      
      if (response.success) {
        localStorage.setItem('pfb_username', username);
        localStorage.setItem('pfb_user_registered', 'true');
      }

      return response;
    } catch (error) {
      console.error('User registration failed:', error);
      return {
        success: false,
        deviceId: this.deviceId,
        username: '',
        message: 'Registration failed due to network error',
        suggestions: []
      };
    }
  }

  async hasRegisteredUsername(): Promise<boolean> {
    const username = localStorage.getItem('pfb_username');
    const registered = localStorage.getItem('pfb_user_registered');
    return !!(username && registered);
  }

  getStoredUsername(): string | null {
    return localStorage.getItem('pfb_username');
  }

  // Lobby Management
  async joinLobby(difficulty: string): Promise<LobbyJoinResult> {
    try {
      const username = this.getStoredUsername();
      if (!username) {
        throw new Error('No registered username found');
      }

      console.log('🎮 MultiplayerService: Joining lobby with:', { deviceId: this.deviceId, username, difficulty });

      const result = await this.client.graphql({
        query: mutations.joinLobby,
        variables: {
          input: {
            deviceId: this.deviceId,
            username,
            difficulty,
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log('🎮 MultiplayerService: GraphQL result:', result);

      // Type guard to check if it's a GraphQLResult
      if ('errors' in result && result.errors && result.errors.length > 0) {
        console.error('🎮 MultiplayerService: GraphQL errors:', result.errors);
        return {
          success: false,
          playersWaiting: 0,
          message: `Failed to join game: ${result.errors[0].message}`
        };
      }

      if (!('data' in result) || !result.data || !result.data.joinLobby) {
        console.error('🎮 MultiplayerService: No data in response:', result);
        return {
          success: false,
          playersWaiting: 0,
          message: 'Failed to join game: No response from server'
        };
      }

      return (result as any).data.joinLobby;
    } catch (error) {
      console.error('🎮 MultiplayerService: Join lobby failed:', error);
      return {
        success: false,
        playersWaiting: 0,
        message: 'Failed to join game: Network error'
      };
    }
  }

  async leaveLobby(difficulty: string): Promise<boolean> {
    try {
      await this.client.graphql({
        query: mutations.leaveLobby,
        variables: {
          input: {
            deviceId: this.deviceId,
            difficulty
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Leave lobby failed:', error);
      return false;
    }
  }

  // Game Operations
  async sendGamePulse(gameId: string, gameStats: {
    score: number;
    guesses: number;
    hints: number;
    gameInProgress: boolean;
  }): Promise<GamePulseResult | null> {
    try {
      const result = await this.client.graphql({
        query: mutations.sendGamePulse,
        variables: {
          input: {
            gameId,
            deviceId: this.deviceId,
            ...gameStats,
            timestamp: new Date().toISOString()
          }
        }
      });

      return (result as any).data.sendGamePulse;
    } catch (error) {
      console.error('Send game pulse failed:', error);
      // Queue for retry
      this.queueFailedOperation('pulse', { gameId, gameStats });
      return null;
    }
  }

  async submitGameResult(gameId: string, gameStats: {
    score: number;
    guesses: number;
    hints: number;
    difficulty: string;
    gameWon: boolean;
  }): Promise<GameEndResult | null> {
    try {
      const username = this.getStoredUsername();
      if (!username) {
        throw new Error('No registered username found');
      }

      const result = await this.client.graphql({
        query: mutations.submitGameResult,
        variables: {
          input: {
            gameId,
            deviceId: this.deviceId,
            username,
            ...gameStats,
            timestamp: new Date().toISOString()
          }
        }
      });

      return (result as any).data.submitGameResult;
    } catch (error) {
      console.error('Submit game result failed:', error);
      return null;
    }
  }

  // Leaderboard
  async getLeaderboard(difficulty: string, limit: number = 20): Promise<LeaderboardEntry[]> {
    try {
      const result = await this.client.graphql({
        query: queries.getLeaderboard,
        variables: { difficulty, limit }
      });

      return (result as any).data.getLeaderboard || [];
    } catch (error) {
      console.error('Get leaderboard failed:', error);
      return [];
    }
  }

  // Subscriptions
  subscribeLobbyUpdates(
    difficulty: string, 
    callback: (update: LobbyUpdate) => void
  ): { unsubscribe: () => void } {
    try {
      const subscription = (this.client.graphql({
        query: subscriptions.onLobbyUpdate,
        variables: { difficulty }
      }) as any).subscribe({
        next: (result: any) => {
          if (result.data?.onLobbyUpdate) {
            callback(result.data.onLobbyUpdate);
          }
        },
        error: (error: any) => {
          console.error('Lobby subscription error:', error);
          // Implement reconnection logic
          setTimeout(() => {
            this.subscribeLobbyUpdates(difficulty, callback);
          }, 5000);
        }
      });

      this.subscriptions.set(`lobby-${difficulty}`, subscription);

      return {
        unsubscribe: () => {
          subscription.unsubscribe();
          this.subscriptions.delete(`lobby-${difficulty}`);
        }
      };
    } catch (error) {
      console.error('Failed to subscribe to lobby updates:', error);
      return { unsubscribe: () => {} };
    }
  }

  subscribeGameUpdates(
    gameId: string,
    callback: (update: GameUpdate) => void
  ): { unsubscribe: () => void } {
    try {
      const subscription = (this.client.graphql({
        query: subscriptions.onGameUpdate,
        variables: { gameId }
      }) as any).subscribe({
        next: (result: any) => {
          if (result.data?.onGameUpdate) {
            callback(result.data.onGameUpdate);
          }
        },
        error: (error: any) => {
          console.error('Game subscription error:', error);
          // Implement reconnection logic
          setTimeout(() => {
            this.subscribeGameUpdates(gameId, callback);
          }, 5000);
        }
      });

      this.subscriptions.set(`game-${gameId}`, subscription);

      return {
        unsubscribe: () => {
          subscription.unsubscribe();
          this.subscriptions.delete(`game-${gameId}`);
        }
      };
    } catch (error) {
      console.error('Failed to subscribe to game updates:', error);
      return { unsubscribe: () => {} };
    }
  }

  subscribeGameStart(
    callback: (event: GameStartEvent) => void
  ): { unsubscribe: () => void } {
    try {
      const subscription = (this.client.graphql({
        query: subscriptions.onGameStart,
        variables: { deviceId: this.deviceId }
      }) as any).subscribe({
        next: (result: any) => {
          if (result.data?.onGameStart) {
            callback(result.data.onGameStart);
          }
        },
        error: (error: any) => {
          console.error('Game start subscription error:', error);
        }
      });

      this.subscriptions.set('game-start', subscription);

      return {
        unsubscribe: () => {
          subscription.unsubscribe();
          this.subscriptions.delete('game-start');
        }
      };
    } catch (error) {
      console.error('Failed to subscribe to game start:', error);
      return { unsubscribe: () => {} };
    }
  }

  // Utility methods
  private queueFailedOperation(type: string, data: any) {
    this.failedOperationsQueue.push({
      type,
      data,
      timestamp: Date.now()
    });

    // Limit queue size
    if (this.failedOperationsQueue.length > 50) {
      this.failedOperationsQueue.shift();
    }
  }

  async retryFailedOperations() {
    const operationsToRetry = [...this.failedOperationsQueue];
    this.failedOperationsQueue = [];

    for (const operation of operationsToRetry) {
      try {
        if (operation.type === 'pulse') {
          await this.sendGamePulse(
            operation.data.gameId,
            operation.data.gameStats
          );
        }
      } catch (error) {
        // Re-queue if still failing
        this.queueFailedOperation(operation.type, operation.data);
      }
    }
  }

  cleanup() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  getDeviceId(): string {
    return this.deviceId;
  }
}

// Export singleton instance
export const multiplayerService = new MultiplayerService();
export default multiplayerService;