// src/services/authService.ts
import { UserCredentials, UserProfile, LoginResult, RegistrationResult } from '../types/auth';
import * as mutations from '../graphql/mutations';

class AuthService {
  private client: any = null;
  private deviceId: string;

  constructor() {
    this.deviceId = this.generateDeviceId();
  }

  private generateDeviceId(): string {
    let deviceId = localStorage.getItem('pfb_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('pfb_device_id', deviceId);
    }
    return deviceId;
  }

  private async getClient() {
    if (!this.client) {
      const { initializeAWS } = await import('./awsConfig');
      initializeAWS();
      await new Promise(resolve => setTimeout(resolve, 100));
      const { generateClient } = await import('aws-amplify/api');
      this.client = generateClient();
    }
    return this.client;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    context: any = {}
  ): Promise<{ success: boolean; data?: T; error?: any }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return { success: true, data: result };
      } catch (error) {
        console.error(`🚨 AuthService Error:`, {
          operation: operationName,
          timestamp: new Date().toISOString(),
          error,
          context: { ...context, attempt, maxRetries }
        });

        if (attempt === maxRetries) {
          return { success: false, error };
        }

        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`🔄 Retrying ${operationName} in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return { success: false, error: new Error('Max retries exceeded') };
  }

  async registerUser(credentials: UserCredentials): Promise<RegistrationResult> {
    console.log('🔧 registerUser: Registering', credentials.username);
    
    try {
      const result = await this.retryOperation(
        async () => {
          const client = await this.getClient();
          const response = await client.graphql({
            query: mutations.registerUserWithPassword,
            variables: {
              input: {
                username: credentials.username,
                password: credentials.password,
                deviceId: this.deviceId,
                timestamp: new Date().toISOString(),
                operation: 'registerUserWithPassword'
              }
            }
          });
          return response;
        },
        'registerUser',
        3,
        { username: credentials.username }
      );

      if (result.success) {
        const data = (result.data as any).data?.registerUserWithPassword;
        const success = data?.success || false;
        
        let userProfile: UserProfile | undefined = undefined;
        if (success) {
          userProfile = {
            username: data?.user?.username || credentials.username,
            deviceId: data?.user?.deviceId || this.deviceId,
            createdAt: data?.user?.createdAt || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            gamesPlayed: data?.user?.gamesPlayed || 0,
            bestScore: data?.user?.bestScore || 0,
            averageScore: data?.user?.averageScore || 0
          };
          localStorage.setItem('pfb_current_user', JSON.stringify(userProfile));
          localStorage.setItem('pfb_username', userProfile.username);
        }
        
        return {
          success,
          user: userProfile,
          message: data?.message || 'Registration completed',
          suggestions: data?.suggestions || []
        };
      } else {
        console.log('🔧 registerUser: Registration failed, providing fallback');
        return {
          success: false,
          message: 'Unable to register with server',
          suggestions: ['Try again', 'Contact support if problem persists']
        };
      }
    } catch (error) {
      console.error('registerUser AWS error:', error);
      return {
        success: false,
        message: 'Network error during registration',
        suggestions: ['Check your internet connection', 'Try again', 'Switch to single player mode']
      };
    }
  }

  async loginUser(credentials: UserCredentials): Promise<LoginResult> {
    console.log('🔧 loginUser: Logging in', credentials.username);
    
    try {
      const result = await this.retryOperation(
        async () => {
          const client = await this.getClient();
          const response = await client.graphql({
            query: mutations.loginUser,
            variables: {
              input: {
                username: credentials.username,
                password: credentials.password,
                deviceId: this.deviceId,
                timestamp: new Date().toISOString(),
                operation: 'loginUser'
              }
            }
          });
          return response;
        },
        'loginUser',
        3,
        { username: credentials.username }
      );

      if (result.success) {
        const data = (result.data as any).data?.loginUser;
        const success = data?.success || false;
        
        let userProfile: UserProfile | undefined = undefined;
        if (success) {
          userProfile = {
            username: data?.user?.username || credentials.username,
            deviceId: data?.user?.deviceId || this.deviceId,
            createdAt: data?.user?.createdAt || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            gamesPlayed: data?.user?.gamesPlayed || 0,
            bestScore: data?.user?.bestScore || 0,
            averageScore: data?.user?.averageScore || 0
          };
          localStorage.setItem('pfb_current_user', JSON.stringify(userProfile));
          localStorage.setItem('pfb_username', userProfile.username);
        }
        
        return {
          success,
          user: userProfile,
          message: data?.message || 'Login completed',
          suggestions: data?.suggestions || []
        };
      } else {
        console.log('🔧 loginUser: Login failed, providing fallback');
        return {
          success: false,
          message: 'Unable to login with server',
          suggestions: ['Check your credentials', 'Try again', 'Contact support if problem persists']
        };
      }
    } catch (error) {
      console.error('loginUser AWS error:', error);
      return {
        success: false,
        message: 'Network error during login',
        suggestions: ['Check your internet connection', 'Try again', 'Switch to single player mode']
      };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('pfb_current_user');
    localStorage.removeItem('pfb_username');
    console.log('🔧 AuthService: User logged out');
  }

  getCurrentUser(): UserProfile | null {
    const userData = localStorage.getItem('pfb_current_user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService(); 