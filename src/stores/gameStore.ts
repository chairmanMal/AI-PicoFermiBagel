import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AppState, 
  GameAction, 
  GameSettings, 
  GameState, 
  HintState, 
  ScratchpadState, 
  GameStats,
  // LeaderboardEntry, // COMMENTED OUT - LEADERBOARD FUNCTIONALITY
  Guess
} from '@/types/game';
import { 
  generateTarget, 
  evaluateGuess, 
  isValidGuess, 
  calculateScore, 
  getDifficultySettings,
  generateId,
  getNextAvailablePosition,
  calculateRowDeltas
} from '@/utils/gameLogic';

const defaultSettings: GameSettings = {
  difficulty: 'classic',
  targetLength: 3,
  digitRange: 9,
  showTarget: false,
  selectionAreaPosition: 'bottom',
  soundEnabled: true,
  gridRows: 1,
  gridColumns: 3,
};

const createInitialGameState = (settings: GameSettings): GameState => ({
  target: generateTarget(settings),
  currentGuess: Array(settings.targetLength).fill(null),
  guesses: [],
  gameStartTime: new Date(),
  score: 0,
  isGameWon: false,
  isGameActive: true,
  activeGuessPosition: 0,
  lockedPositions: new Set(),
});

const createInitialHintState = (): HintState => ({
  purchasedHints: {
    bagelNumbers: new Set(),
    notBagelNumbers: new Set(),
    rowDeltaHints: 0,
    showActualDeltas: false,
  },
  hintCost: {
    bagelHint: 5,
    notBagelHint: 5,
    rowDeltaHint: 3,
  },
});

const createInitialScratchpadState = (digitRange: number): ScratchpadState => ({
  numberColors: new Map(
    Array.from({ length: digitRange + 1 }, (_, i) => [i, 'default' as const])
  ),
});

interface GameStore extends AppState {
  dispatch: (action: GameAction) => void;
  resetGame: () => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  getTotalHintCost: () => number;
  getGameTimeMinutes: () => number;
  isGuessValid: () => boolean;
  canSubmitGuess: () => boolean;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      gameState: createInitialGameState(defaultSettings),
      hintState: createInitialHintState(),
      scratchpadState: createInitialScratchpadState(defaultSettings.digitRange),
      stats: new Map(),
      // leaderboard: new Map(), // COMMENTED OUT - LEADERBOARD FUNCTIONALITY

      dispatch: (action: GameAction) => {
        const state = get();
        
        switch (action.type) {
          case 'START_NEW_GAME': {
            const newGameState = createInitialGameState(state.settings);
            const newHintState = createInitialHintState();
            const newScratchpadState = createInitialScratchpadState(state.settings.digitRange);
            
            set({
              gameState: newGameState,
              hintState: newHintState,
              scratchpadState: newScratchpadState,
            });
            break;
          }

          case 'SET_GUESS_DIGIT': {
            const { position, digit } = action;
            const newGuess = [...state.gameState.currentGuess];
            const newLockedPositions = new Set(state.gameState.lockedPositions);
            const wasLocked = newLockedPositions.has(position);
            const hadValue = newGuess[position] !== null;
            
            // Set the new digit
            newGuess[position] = digit;
            
            // Auto-locking logic:
            if (digit !== null) {
              if (hadValue && !wasLocked) {
                // Position had a value and wasn't locked -> auto-lock it
                newLockedPositions.add(position);
              } else if (wasLocked) {
                // Position was locked -> unlock it (replacing the value)
                newLockedPositions.delete(position);
              }
            }
            
            // Auto-advance to next position if digit was set and position isn't locked after this action
            let newActivePosition = state.gameState.activeGuessPosition;
            if (digit !== null && !newLockedPositions.has(position)) {
              newActivePosition = getNextAvailablePosition(
                newGuess, 
                newLockedPositions, 
                position + 1
              );
            }

            set({
              gameState: {
                ...state.gameState,
                currentGuess: newGuess,
                activeGuessPosition: newActivePosition,
                lockedPositions: newLockedPositions,
              },
            });
            break;
          }

          case 'ADD_DIGIT_SEQUENTIAL': {
            const { digit } = action;
            const currentGuess = [...state.gameState.currentGuess];
            const newLockedPositions = new Set(state.gameState.lockedPositions);
            const activePosition = state.gameState.activeGuessPosition;
            const hadValue = currentGuess[activePosition] !== null;
            const wasLocked = newLockedPositions.has(activePosition);
            
            // Auto-locking logic for sequential entry
            if (hadValue && !wasLocked) {
              // Position had a value and wasn't locked -> auto-lock it, then move to next
              newLockedPositions.add(activePosition);
              // Find next available position
              let nextPosition = getNextAvailablePosition(
                currentGuess, 
                newLockedPositions, 
                activePosition + 1
              );
              
              // If no next position available, stay at current
              if (nextPosition === activePosition) {
                nextPosition = activePosition;
              }
              
              // Place digit at the new position
              if (nextPosition < currentGuess.length) {
                currentGuess[nextPosition] = digit;
                // Auto-advance from new position
                const finalPosition = getNextAvailablePosition(
                  currentGuess, 
                  newLockedPositions, 
                  nextPosition + 1
                );
                
                set({
                  gameState: {
                    ...state.gameState,
                    currentGuess: currentGuess,
                    activeGuessPosition: finalPosition,
                    lockedPositions: newLockedPositions,
                  },
                });
              } else {
                // No space, just lock current position
                set({
                  gameState: {
                    ...state.gameState,
                    lockedPositions: newLockedPositions,
                  },
                });
              }
            } else if (wasLocked) {
              // Position was locked -> unlock it and replace value
              newLockedPositions.delete(activePosition);
              currentGuess[activePosition] = digit;
              
              // Auto-advance to next position
              const nextPosition = getNextAvailablePosition(
                currentGuess, 
                newLockedPositions, 
                activePosition + 1
              );
              
              set({
                gameState: {
                  ...state.gameState,
                  currentGuess: currentGuess,
                  activeGuessPosition: nextPosition,
                  lockedPositions: newLockedPositions,
                },
              });
            } else {
              // Normal case: empty position, just add digit and advance
              currentGuess[activePosition] = digit;
              
              // Calculate next position (auto-advance)
              const nextPosition = getNextAvailablePosition(
                currentGuess, 
                newLockedPositions, 
                activePosition + 1
              );
              
              set({
                gameState: {
                  ...state.gameState,
                  currentGuess: currentGuess,
                  activeGuessPosition: nextPosition,
                  lockedPositions: newLockedPositions,
                },
              });
            }
            break;
          }

          case 'SUBMIT_GUESS': {
            if (!isValidGuess(state.gameState.currentGuess, state.settings.digitRange)) return;
            
            const guess = state.gameState.currentGuess as number[];
            const feedback = evaluateGuess(guess, state.gameState.target);
            const rowDeltas = state.hintState.purchasedHints.rowDeltaHints > 0 
              ? calculateRowDeltas(guess, state.gameState.target, state.hintState.purchasedHints.showActualDeltas)
              : undefined;

            const newGuess: Guess = {
              id: generateId(),
              digits: guess,
              feedback,
              timestamp: new Date(),
              rowDeltas,
            };

            const newGuesses = [...state.gameState.guesses, newGuess];
            const timeMinutes = get().getGameTimeMinutes();
            const hintCost = get().getTotalHintCost();
            const newScore = calculateScore(newGuesses.length, timeMinutes, hintCost);

            const gameWon = feedback.isWinner;
            const maxGuesses = 20; // Maximum number of guesses before game ends
            const gameEnded = gameWon || newGuesses.length >= maxGuesses;
            
            const newGameState: GameState = {
              ...state.gameState,
              guesses: newGuesses,
              currentGuess: gameEnded 
                ? state.gameState.currentGuess 
                : Array(state.settings.targetLength).fill(null),
              score: newScore,
              isGameWon: gameWon,
              isGameActive: !gameEnded,
              activeGuessPosition: gameEnded ? state.gameState.activeGuessPosition : 0,
              gameEndTime: gameEnded ? new Date() : undefined,
            };

            set({ gameState: newGameState });

            // Update stats if game is won
            if (gameWon) {
              const currentStats = state.stats.get(state.settings.difficulty) || {
                gamesPlayed: 0,
                gamesWon: 0,
                averageScore: 0,
                bestScore: 0,
                averageGuesses: 0,
                totalHintsUsed: 0,
              };

              const newStats: GameStats = {
                ...currentStats,
                gamesPlayed: currentStats.gamesPlayed + 1,
                gamesWon: currentStats.gamesWon + 1,
                averageScore: (currentStats.averageScore * currentStats.gamesWon + newScore) / (currentStats.gamesWon + 1),
                bestScore: Math.max(currentStats.bestScore, newScore),
                averageGuesses: (currentStats.averageGuesses * currentStats.gamesWon + newGuesses.length) / (currentStats.gamesWon + 1),
                totalHintsUsed: currentStats.totalHintsUsed + hintCost,
              };

              const newStatsMap = new Map(state.stats);
              newStatsMap.set(state.settings.difficulty, newStats);
              set({ stats: newStatsMap });
            }
            break;
          }

          case 'TOGGLE_POSITION_LOCK': {
            const newLockedPositions = new Set(state.gameState.lockedPositions);
            if (newLockedPositions.has(action.position)) {
              newLockedPositions.delete(action.position);
            } else {
              newLockedPositions.add(action.position);
            }

            set({
              gameState: {
                ...state.gameState,
                lockedPositions: newLockedPositions,
              },
            });
            break;
          }

          case 'SET_ACTIVE_POSITION': {
            set({
              gameState: {
                ...state.gameState,
                activeGuessPosition: action.position,
              },
            });
            break;
          }

          case 'MOVE_DIGIT': {
            const { fromPosition, toPosition } = action;
            const newGuess = [...state.gameState.currentGuess];
            [newGuess[fromPosition], newGuess[toPosition]] = [newGuess[toPosition], newGuess[fromPosition]];

            set({
              gameState: {
                ...state.gameState,
                currentGuess: newGuess,
              },
            });
            break;
          }

          case 'PURCHASE_HINT': {
            const { hintType, targetNumber } = action;
            const newHintState = { ...state.hintState };

            switch (hintType) {
              case 'bagel':
                if (targetNumber !== undefined) {
                  newHintState.purchasedHints.bagelNumbers.add(targetNumber);
                  // Update scratchpad color
                  const newScratchpadState = { ...state.scratchpadState };
                  newScratchpadState.numberColors.set(targetNumber, 'bagel');
                  set({ scratchpadState: newScratchpadState });
                }
                break;
              case 'not-bagel':
                if (targetNumber !== undefined) {
                  newHintState.purchasedHints.notBagelNumbers.add(targetNumber);
                  // Update scratchpad color
                  const newScratchpadState = { ...state.scratchpadState };
                  newScratchpadState.numberColors.set(targetNumber, 'not-bagel');
                  set({ scratchpadState: newScratchpadState });
                }
                break;
              case 'row-delta':
                newHintState.purchasedHints.rowDeltaHints += 1;
                // If we have hints for all rows, next hint enables actual deltas
                if (newHintState.purchasedHints.rowDeltaHints > state.settings.targetLength) {
                  newHintState.purchasedHints.showActualDeltas = true;
                }
                break;
            }

            set({ hintState: newHintState });
            break;
          }

          case 'UPDATE_SETTINGS': {
            const newSettings = { ...state.settings, ...action.settings };
            const settingsChanged = JSON.stringify(newSettings) !== JSON.stringify(state.settings);
            
            if (settingsChanged) {
              // Apply difficulty presets if difficulty changed
              if (action.settings.difficulty && action.settings.difficulty !== state.settings.difficulty) {
                const difficultySettings = getDifficultySettings(action.settings.difficulty);
                Object.assign(newSettings, difficultySettings);
              }

              // Calculate targetLength based on grid dimensions
              if (action.settings.gridRows !== undefined || action.settings.gridColumns !== undefined) {
                newSettings.targetLength = newSettings.gridRows * newSettings.gridColumns;
              }

              // Start new game if game-affecting settings changed
              const gameAffectingSettings = ['difficulty', 'targetLength', 'digitRange', 'gridRows', 'gridColumns'];
              const gameAffectingChanged = gameAffectingSettings.some(
                key => action.settings[key as keyof GameSettings] !== undefined
              );

              if (gameAffectingChanged) {
                const newGameState = createInitialGameState(newSettings);
                const newHintState = createInitialHintState();
                const newScratchpadState = createInitialScratchpadState(newSettings.digitRange);
                
                set({
                  settings: newSettings,
                  gameState: newGameState,
                  hintState: newHintState,
                  scratchpadState: newScratchpadState,
                });
              } else {
                set({ settings: newSettings });
              }
            }
            break;
          }

          case 'SET_SCRATCHPAD_COLOR': {
            const newScratchpadState = { ...state.scratchpadState };
            newScratchpadState.numberColors.set(action.number, action.color);
            set({ scratchpadState: newScratchpadState });
            break;
          }

          case 'CLEAR_GAME_STATE': {
            set({
              gameState: createInitialGameState(state.settings),
              hintState: createInitialHintState(),
              scratchpadState: createInitialScratchpadState(state.settings.digitRange),
            });
            break;
          }

          // COMMENTED OUT - LEADERBOARD FUNCTIONALITY
          // case 'SAVE_SCORE': {
          //   const newLeaderboard = new Map(state.leaderboard);
          //   const difficultyBoard = newLeaderboard.get(state.settings.difficulty) || [];
          //   const updatedBoard = [...difficultyBoard, action.entry]
          //     .sort((a, b) => b.score - a.score)
          //     .slice(0, 100); // Keep top 100 scores
          //   
          //   newLeaderboard.set(state.settings.difficulty, updatedBoard);
          //   set({ leaderboard: newLeaderboard });
          //   break;
          // }
        }
      },

      resetGame: () => {
        get().dispatch({ type: 'START_NEW_GAME' });
      },

      updateSettings: (newSettings: Partial<GameSettings>) => {
        get().dispatch({ type: 'UPDATE_SETTINGS', settings: newSettings });
      },

      getTotalHintCost: () => {
        const { hintState } = get();
        const { purchasedHints, hintCost } = hintState;
        
        return (
          purchasedHints.bagelNumbers.size * hintCost.bagelHint +
          purchasedHints.notBagelNumbers.size * hintCost.notBagelHint +
          purchasedHints.rowDeltaHints * hintCost.rowDeltaHint
        );
      },

      getGameTimeMinutes: () => {
        const { gameState } = get();
        const endTime = gameState.gameEndTime || new Date();
        const diffMs = endTime.getTime() - gameState.gameStartTime.getTime();
        return Math.floor(diffMs / 60000);
      },

      isGuessValid: () => {
        const { gameState, settings } = get();
        return isValidGuess(gameState.currentGuess, settings.digitRange);
      },

      canSubmitGuess: () => {
        const { gameState, settings } = get();
        return gameState.isGameActive && isValidGuess(gameState.currentGuess, settings.digitRange);
      },
    }),
    {
      name: 'pico-fermi-bagel-store',
      partialize: (state) => ({
        settings: state.settings,
        stats: state.stats,
        // leaderboard: state.leaderboard, // COMMENTED OUT - LEADERBOARD FUNCTIONALITY
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              stats: new Map(Object.entries(parsed.state.stats || {})),
              // leaderboard: new Map(Object.entries(parsed.state.leaderboard || {})), // COMMENTED OUT - LEADERBOARD FUNCTIONALITY
            }
          };
        },
        setItem: (name, value) => {
          const serializable = {
            ...value,
            state: {
              ...value.state,
              stats: Object.fromEntries(value.state.stats || new Map()),
              // leaderboard: Object.fromEntries(value.state.leaderboard || new Map()), // COMMENTED OUT - LEADERBOARD FUNCTIONALITY
            }
          };
          localStorage.setItem(name, JSON.stringify(serializable));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
); 