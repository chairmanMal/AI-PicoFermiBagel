// src/services/directLambdaService.ts
// Mock service that provides fallback responses when AWS is unavailable

class DirectLambdaService {
  private deviceId: string;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('pfb_device_id');
    if (!deviceId) {
      deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('pfb_device_id', deviceId);
    }
    return deviceId;
  }

  async joinLobby(_difficulty: string, _username: string): Promise<{
    success: boolean;
    gameId?: string;
    playersWaiting: number;
    message: string;
  }> {
    try {
      console.log('🎮 DirectLambdaService: Providing fallback lobby join response...');
      
      // Simulate a successful lobby join with fallback response
      const gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        gameId,
        playersWaiting: 1,
        message: 'Successfully joined lobby (fallback mode)'
      };
      
    } catch (error) {
      console.error('🎮 DirectLambdaService: Join lobby failed:', error);
      return {
        success: false,
        playersWaiting: 0,
        message: `Failed to join lobby: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  async submitGameResult(_gameId: string, gameStats: {
    score: number;
    guesses: number;
    hints: number;
    difficulty: string;
    gameWon: boolean;
  }, username: string): Promise<{
    winner?: string;
    rankings: Array<{
      rank: number;
      username: string;
      score: number;
      guesses: number;
      hints: number;
      timeElapsed: number;
    }>;
    leaderboardUpdated: boolean;
    newPersonalBest: boolean;
  }> {
    try {
      console.log('🎮 DirectLambdaService: Providing fallback game result response...');
      
      // Simulate a successful game result submission
      return {
        winner: username,
        rankings: [{
          rank: 1,
          username,
          score: gameStats.score,
          guesses: gameStats.guesses,
          hints: gameStats.hints,
          timeElapsed: 0
        }],
        leaderboardUpdated: true,
        newPersonalBest: true
      };
      
    } catch (error) {
      console.error('🎮 DirectLambdaService: Submit game result failed:', error);
      return {
        winner: username,
        rankings: [{
          rank: 1,
          username,
          score: gameStats.score,
          guesses: gameStats.guesses,
          hints: gameStats.hints,
          timeElapsed: 0
        }],
        leaderboardUpdated: true,
        newPersonalBest: true
      };
    }
  }

  async getLeaderboard(_difficulty: string, _limit: number = 20): Promise<Array<{
    rank: number;
    username: string;
    score: number;
    timestamp: string;
    difficulty: string;
  }>> {
    try {
      console.log('🎮 DirectLambdaService: Providing fallback leaderboard response...');
      
      // Return empty leaderboard as fallback
      return [];
      
    } catch (error) {
      console.error('🎮 DirectLambdaService: Get leaderboard failed:', error);
      return [];
    }
  }

  getDeviceId(): string {
    return this.deviceId;
  }
}

export const directLambdaService = new DirectLambdaService(); 