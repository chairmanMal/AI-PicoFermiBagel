import { create } from 'zustand';
import { useGameStore } from './gameStore';
import multiplayerService, { GameStartEvent, GameEndResult, GameUpdate } from '../services/multiplayerService';
import { initializeAWS } from '../services/awsConfig';

interface MultiplayerState {
  // Multiplayer-specific state
  isMultiplayer: boolean;
  gameId: string | null;
  currentUsername: string | null;
  multiplayerPlayers: any[];
  gameTimeElapsed: number;
  startTime: Date | null;
  endTime: Date | null;
  isComplete: boolean;
  isWon: boolean;
  difficulty: string;
  guesses: any[];
  score: number;
  hintsUsed: number;
  
  // Multiplayer methods
  initializeMultiplayer: () => Promise<void>;
  cleanupMultiplayer: () => void;
  startSinglePlayerGame: (difficulty: string) => void;
  startMultiplayerGame: (gameData: GameStartEvent) => void;
  updateMultiplayerProgress: (update: GameUpdate) => void;
  submitGuess: (guess: number[]) => Promise<void>;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  // Initial state
  isMultiplayer: false,
  gameId: null,
  currentUsername: null,
  multiplayerPlayers: [],
  gameTimeElapsed: 0,
  startTime: null,
  endTime: null,
  isComplete: false,
  isWon: false,
  difficulty: 'classic',
  guesses: [],
  score: 0,
  hintsUsed: 0,

  // Multiplayer methods
  initializeMultiplayer: async () => {
    console.log('🎮 Initializing multiplayer...');
    try {
      // Initialize AWS configuration
      initializeAWS();
      console.log('🎮 Multiplayer initialized with AWS configuration');
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize multiplayer:', error);
      throw error;
    }
  },

  cleanupMultiplayer: () => {
    console.log('🎮 Cleaning up multiplayer...');
    set({
      isMultiplayer: false,
      gameId: null,
      currentUsername: null,
      multiplayerPlayers: [],
      gameTimeElapsed: 0,
      startTime: null,
      endTime: null,
      isComplete: false,
      isWon: false,
    });
  },

  startSinglePlayerGame: (difficulty: string) => {
    console.log('🎮 Starting single player game with difficulty:', difficulty);
    const gameStore = useGameStore.getState();
    gameStore.dispatch({ type: 'START_NEW_GAME' });
    set({ 
      isMultiplayer: false,
      difficulty,
      isComplete: false,
      isWon: false,
      score: 0,
      guesses: [],
      hintsUsed: 0
    });
  },

  startMultiplayerGame: (gameData: GameStartEvent) => {
    console.log('🎮 Starting multiplayer game:', gameData);
    set({
      isMultiplayer: true,
      gameId: gameData.gameId,
      difficulty: gameData.difficulty,
      startTime: new Date(),
      isComplete: false,
      isWon: false,
      score: 0,
      guesses: [],
      hintsUsed: 0
    });
  },

  updateMultiplayerProgress: (update: GameUpdate) => {
    console.log('🎮 Updating multiplayer progress:', update);
    set({
      multiplayerPlayers: update.playerProgress,
      gameTimeElapsed: update.gameTimeElapsed
    });
  },

  submitGuess: async (guess: number[]) => {
    console.log('🎮 Submitting multiplayer guess:', guess);
    const state = get();
    
    if (!state.isMultiplayer || !state.gameId) {
      console.warn('Not in multiplayer mode or no game ID');
      return;
    }

    try {
      // Update local state
      set({
        guesses: [...state.guesses, guess],
        score: state.score + 10, // Simple scoring for now
      });

      // Send pulse to multiplayer service
      if (state.gameId) {
        await multiplayerService.sendGamePulse(state.gameId, {
          score: state.score + 10,
          guesses: state.guesses.length + 1,
          hints: state.hintsUsed,
          gameInProgress: !state.isComplete
        });
      }
    } catch (error) {
      console.error('Failed to submit multiplayer guess:', error);
    }
  },
})); 