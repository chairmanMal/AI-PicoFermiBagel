export interface GameSettings {
  difficulty: 'classic' | 'easy' | 'medium' | 'hard' | 'expert' | 'custom';
  targetLength: number;
  digitRange: number; // 0-19 max for new requirements
  showTarget: boolean;
  selectionAreaPosition: 'top' | 'bottom';
  soundEnabled: boolean;
  gridRows: number; // Number of rows in guess grid (1-4)
  gridColumns: number; // Number of columns in guess grid (1-4)
}

export interface Guess {
  id: string;
  digits: number[];
  feedback: GuessResult;
  timestamp: Date;
  rowDeltas?: number[]; // For row delta hints
}

export interface GuessResult {
  picos: number;
  fermis: number;
  bagels: number;
  isWinner: boolean;
}

export interface GameState {
  target: number[];
  currentGuess: (number | null)[];
  guesses: Guess[];
  gameStartTime: Date;
  gameEndTime?: Date;
  score: number;
  isGameWon: boolean;
  isGameActive: boolean;
  activeGuessPosition: number;
  lockedPositions: Set<number>;
}

export interface HintState {
  purchasedHints: {
    bagelNumbers: Set<number>;
    notBagelNumbers: Set<number>;
    rowDeltaHints: number; // Count of row delta hints purchased
    showActualDeltas: boolean; // Whether to show +/- or just magnitude
  };
  hintCost: {
    bagelHint: number;
    notBagelHint: number;
    rowDeltaHint: number;
  };
}

export interface ScratchpadState {
  numberColors: Map<number, ScratchpadColor>;
}

export type ScratchpadColor = 
  | 'default'
  | 'maybe'
  | 'likely'
  | 'unlikely'
  | 'bagel'
  | 'not-bagel';

export interface ScoreData {
  score: number;
  guesses: number;
  timeMinutes: number;
  hintCost: number;
  difficulty: string;
  timestamp: Date;
}

// LEADERBOARD FUNCTIONALITY - COMMENTED OUT FOR NOW
// export interface LeaderboardEntry {
//   id: string;
//   playerName: string;
//   score: number;
//   guesses: number;
//   timeMinutes: number;
//   difficulty: string;
//   timestamp: Date;
// }

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  averageScore: number;
  bestScore: number;
  averageGuesses: number;
  totalHintsUsed: number;
}

export interface AppState {
  settings: GameSettings;
  gameState: GameState;
  hintState: HintState;
  scratchpadState: ScratchpadState;
  stats: Map<string, GameStats>; // Key is difficulty level
  // leaderboard: Map<string, LeaderboardEntry[]>; // Key is difficulty level - COMMENTED OUT
}

export type GameAction = 
  | { type: 'START_NEW_GAME' }
  | { type: 'SET_GUESS_DIGIT'; position: number; digit: number | null }
  | { type: 'ADD_DIGIT_SEQUENTIAL'; digit: number }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'TOGGLE_POSITION_LOCK'; position: number }
  | { type: 'SET_ACTIVE_POSITION'; position: number }
  | { type: 'MOVE_DIGIT'; fromPosition: number; toPosition: number }
  | { type: 'PURCHASE_HINT'; hintType: 'bagel' | 'not-bagel' | 'row-delta'; targetNumber?: number }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'SET_SCRATCHPAD_COLOR'; number: number; color: ScratchpadColor }
  | { type: 'CLEAR_GAME_STATE' };
  // | { type: 'SAVE_SCORE'; entry: LeaderboardEntry }; // COMMENTED OUT - LEADERBOARD FUNCTIONALITY 