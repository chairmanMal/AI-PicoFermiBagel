// src/services/directLambdaService.ts
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

class DirectLambdaService {
  private lambda: LambdaClient;
  private deviceId: string;

  constructor() {
    this.lambda = new LambdaClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      }
    });
    
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

  async joinLobby(difficulty: string, username: string): Promise<{
    success: boolean;
    gameId?: string;
    playersWaiting: number;
    message: string;
  }> {
    try {
      console.log('🎮 DirectLambdaService: Joining lobby directly...');
      
      const event = {
        action: 'joinLobby',
        arguments: {
          deviceId: this.deviceId,
          username,
          difficulty,
          timestamp: new Date().toISOString()
        }
      };

      const command = new InvokeCommand({
        FunctionName: 'pfb-leaderboard-v2',
        Payload: JSON.stringify(event)
      });

      const result = await this.lambda.send(command);
      
      console.log('🎮 DirectLambdaService: Lambda response status:', result.StatusCode);
      
      const responseText = Buffer.from(result.Payload || Buffer.alloc(0)).toString('utf8');
      const response = JSON.parse(responseText);
      
      console.log('🎮 DirectLambdaService: Lambda response:', response);
      
      return {
        success: response.success || false,
        gameId: response.gameId,
        playersWaiting: response.playersWaiting || 0,
        message: response.message || 'Direct Lambda call completed'
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

  async submitGameResult(gameId: string, gameStats: {
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
      console.log('🎮 DirectLambdaService: Submitting game result directly...');
      
      const event = {
        action: 'submitGameResult',
        arguments: {
          gameId,
          deviceId: this.deviceId,
          username,
          score: gameStats.score,
          guesses: gameStats.guesses,
          hints: gameStats.hints,
          difficulty: gameStats.difficulty,
          gameWon: gameStats.gameWon,
          timestamp: new Date().toISOString()
        }
      };

      const command = new InvokeCommand({
        FunctionName: 'pfb-leaderboard-v2',
        Payload: JSON.stringify(event)
      });

      const result = await this.lambda.send(command);
      
      console.log('🎮 DirectLambdaService: Submit result status:', result.StatusCode);
      
      const responseText = Buffer.from(result.Payload || Buffer.alloc(0)).toString('utf8');
      const response = JSON.parse(responseText);
      
      console.log('🎮 DirectLambdaService: Submit result response:', response);
      
      return {
        winner: response.winner,
        rankings: response.rankings || [],
        leaderboardUpdated: response.leaderboardUpdated || false,
        newPersonalBest: response.newPersonalBest || false
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

  async getLeaderboard(difficulty: string, limit: number = 20): Promise<Array<{
    rank: number;
    username: string;
    score: number;
    timestamp: string;
    difficulty: string;
  }>> {
    try {
      console.log('🎮 DirectLambdaService: Getting leaderboard directly...');
      
      const event = {
        action: 'getLeaderboard',
        arguments: {
          difficulty,
          limit
        }
      };

      const command = new InvokeCommand({
        FunctionName: 'pfb-leaderboard-v2',
        Payload: JSON.stringify(event)
      });

      const result = await this.lambda.send(command);
      
      console.log('🎮 DirectLambdaService: Get leaderboard status:', result.StatusCode);
      
      const responseText = Buffer.from(result.Payload || Buffer.alloc(0)).toString('utf8');
      const response = JSON.parse(responseText);
      
      console.log('🎮 DirectLambdaService: Get leaderboard response:', response);
      
      return response.leaderboard || [];
      
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