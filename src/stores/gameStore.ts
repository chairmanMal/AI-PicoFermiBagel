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
  LeaderboardEntry, // Re-enabled leaderboard functionality
  Guess
} from '@/types/game';
import { 
  generateTarget, 
  evaluateGuess, 
  isValidGuess, 
  calculateScore, 
  getDifficultySettings,
  generateId,
  calculateRowDeltas,
  calculateTargetRowSums,
  getNextUnlockedPosition
} from '@/utils/gameLogic';
import { soundUtils } from '@/utils/soundUtils';

const defaultSettings: GameSettings = {
  difficulty: 'classic',
  targetLength: 3,
  digitRange: 9,
  showTarget: false,
  selectionAreaPosition: 'bottom',
  soundEnabled: true,
  soundVolume: 0.1, // Reduced from 0.2 to 0.1 (10% instead of 20%)
  gridRows: 1,
  gridColumns: 3,
  clearGuessAfterSubmit: true,
  multiRowGuessFeedback: true, // Default to enabled
  backgroundColor: 'purple', // Default to original purple theme
  developerMode: false,
  developerLoseScore: 80,
  randomSeed: Math.floor(Math.random() * 1000000), // Random seed for developer mode
};

const createInitialGameState = (settings: GameSettings): GameState => {
  console.log('🎮 CREATING INITIAL GAME STATE with settings:', {
    difficulty: settings.difficulty,
    digitRange: settings.digitRange,
    targetLength: settings.targetLength,
    fullSettings: settings
  });
  
  return {
    target: generateTarget(settings),
    currentGuess: Array(settings.targetLength).fill(null),
    guesses: [],
    gameStartTime: new Date(),
    score: 100, // Start with 100 points
    isGameWon: false,
    isGameActive: true,
    activeGuessPosition: 0,
    lockedPositions: new Set(),
  };
};

const createInitialHintState = (): HintState => ({
  purchasedHints: {
    bagelNumbers: new Set(),
    notBagelNumbers: new Set(),
    rowDeltaHints: 0,
    showActualDeltas: false,
    randomExposedNumbers: new Set(),
    revealedRowSums: new Set(),
  },
  hintCost: {
    bagelHint: 5,
    notBagelHint: 5,
    rowDeltaHint: 3,
    randomExposeHint: 5,
    rowSumsHint: 3,
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
  resetAllSettings: () => void;
  isDeveloperMode: () => boolean;
  getDeveloperLoseScore: () => number;
  getRandomSeed: () => number;
  submitScoreToLeaderboard: (gameId?: string) => Promise<void>;
  
  // Global username management
  globalUsername: string;
  setGlobalUsername: (username: string) => void;
  getGlobalUsername: () => string;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      gameState: null as any, // Will be initialized after settings are loaded
      hintState: null as any, // Will be initialized after settings are loaded
      scratchpadState: null as any, // Will be initialized after settings are loaded
      stats: new Map(),
      leaderboard: new Map(), // RE-ENABLED LEADERBOARD FUNCTIONALITY

      dispatch: (action: GameAction) => {
        const state = get();
        
        switch (action.type) {
          case 'START_NEW_GAME': {
            const newGameState = createInitialGameState(state.settings);
            const newHintState = createInitialHintState();
            const newScratchpadState = createInitialScratchpadState(state.settings.digitRange);
            
            // Reset UI settings to defaults while preserving difficulty and sound
            const resetSettings: GameSettings = {
              ...state.settings,
              showTarget: false, // Reset to default
              selectionAreaPosition: 'bottom' as const, // Reset to default
              // Keep difficulty and soundEnabled as they are
            };
            
            set({
              settings: resetSettings,
              gameState: newGameState,
              hintState: newHintState,
              scratchpadState: newScratchpadState,
            });
            
            // OPTIMIZED: Pre-activate audio for immediate response on first interaction
            if (resetSettings.soundEnabled) {
              soundUtils.activateAudio().catch(() => {
                // Silently handle activation errors
              });
            }
            break;
          }

          case 'START_MULTIPLAYER_GAME': {
            console.log('🎮 GameStore: Starting multiplayer game with seed:', action.randomSeed);
            const newGameState = createInitialGameState(state.settings);
            const newHintState = createInitialHintState();
            const newScratchpadState = createInitialScratchpadState(state.settings.digitRange);
            
            // Reset UI settings to defaults while preserving difficulty and sound
            const resetSettings: GameSettings = {
              ...state.settings,
              showTarget: false, // Reset to default
              selectionAreaPosition: 'bottom' as const, // Reset to default
              randomSeed: action.randomSeed, // Use the AWS-provided random seed
              // Keep difficulty and soundEnabled as they are
            };
            
            console.log('🎮 GameStore: Updated settings with AWS seed:', resetSettings.randomSeed);
            
            set({
              settings: resetSettings,
              gameState: newGameState,
              hintState: newHintState,
              scratchpadState: newScratchpadState,
            });
            
            // OPTIMIZED: Pre-activate audio for immediate response on first interaction
            if (resetSettings.soundEnabled) {
              soundUtils.activateAudio().catch(() => {
                // Silently handle activation errors
              });
            }
            break;
          }

          case 'SET_GUESS_DIGIT': {
            const { position, digit } = action;
            const newGuess = [...state.gameState.currentGuess];
            const newLockedPositions = new Set(state.gameState.lockedPositions);
            
            // Check if digit is already in the guess (redundant) - excluding the current position
            const isRedundant = digit !== null && newGuess.some((d, i) => i !== position && d === digit);
            
            // Set the new digit (or clear if digit is null)
            newGuess[position] = digit;
            
            // Play sound if digit was placed and sound is enabled
            if (digit !== null && state.settings.soundEnabled) {
              if (isRedundant) {
                soundUtils.playDudSound();
              } else {
                soundUtils.playDigitPlaceSound();
              }
            }
            
            // Auto-advance to next position if digit was set and we're not manually selecting
            let newActivePosition = state.gameState.activeGuessPosition;
            if (digit !== null) {
              // Find next unlocked position
              newActivePosition = getNextUnlockedPosition(
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
              },
            });
            break;
          }

          case 'SET_GUESS_DIGIT_NO_ADVANCE': {
            const { position, digit } = action;
            const newGuess = [...state.gameState.currentGuess];
            
            // Check if digit is already in the guess (redundant) - excluding the current position
            const isRedundant = digit !== null && newGuess.some((d, i) => i !== position && d === digit);
            
            // Set the new digit (or clear if digit is null) without advancing position
            newGuess[position] = digit;
            
            // Play sound if digit was placed and sound is enabled
            if (digit !== null && state.settings.soundEnabled) {
              if (isRedundant) {
                soundUtils.playDudSound();
              } else {
                soundUtils.playDigitPlaceSound();
              }
            }

            set({
              gameState: {
                ...state.gameState,
                currentGuess: newGuess,
                // Keep the same active position - don't auto-advance
              },
            });
            break;
          }

          case 'ADD_DIGIT_SEQUENTIAL': {
            const { digit } = action;
            const currentGuess = [...state.gameState.currentGuess];
            const lockedPositions = new Set(state.gameState.lockedPositions);
            const activePosition = state.gameState.activeGuessPosition;
            
        
            
            // console.log('🔢 AUTOFILL DEBUG: Placing digit', digit, 'at position', activePosition);
            // console.log('🔢 AUTOFILL DEBUG: Guess length:', currentGuess.length, 'Locked positions:', Array.from(lockedPositions));
            
            // Check if digit is already in the guess (redundant)
            const isRedundant = currentGuess.includes(digit);
            
            // Place digit at the active position
            currentGuess[activePosition] = digit;
            
            // Play sound if sound is enabled
            if (state.settings.soundEnabled) {
              if (isRedundant) {
                soundUtils.playDudSound();
              } else {
                soundUtils.playDigitPlaceSound();
              }
            }
            
            // Auto-advance to next unlocked position
            const nextPosition = getNextUnlockedPosition(
              currentGuess, 
              lockedPositions, 
              activePosition + 1
            );
            
            // console.log('🔢 AUTOFILL DEBUG: Next position:', activePosition, '→', nextPosition);
            
            set({
              gameState: {
                ...state.gameState,
                currentGuess: currentGuess,
                activeGuessPosition: nextPosition,
              },
            });
            break;
          }

          case 'SUBMIT_GUESS': {
            // console.log('🚀 SUBMIT_GUESS: Starting submission process');
            // console.log('🚀 Current guess:', state.gameState.currentGuess);
            // console.log('🚀 Settings:', state.settings);
            // console.log('🚀 Digit range:', state.settings.digitRange);
            
            const isValid = isValidGuess(state.gameState.currentGuess, state.settings.digitRange);
            // console.log('🚀 Is guess valid?', isValid);
            
            if (!isValid) {
              // console.log('🚀 ❌ GUESS INVALID - ABORTING SUBMISSION');
              return;
            }
            
            // console.log('🚀 ✅ GUESS VALID - PROCEEDING WITH SUBMISSION');
            const guess = state.gameState.currentGuess as number[];
            const feedback = evaluateGuess(guess, state.gameState.target);
            const rowDeltas = state.hintState.purchasedHints.rowDeltaHints > 0 
              ? calculateRowDeltas(guess, state.gameState.target, state.hintState.purchasedHints.showActualDeltas)
              : undefined;
            const targetRowSums = state.hintState.purchasedHints.revealedRowSums.size > 0
              ? calculateTargetRowSums(state.gameState.target, state.settings.gridRows, state.settings.gridColumns, state.hintState.purchasedHints.revealedRowSums)
              : undefined;

            console.log('💾 STORING GUESS - targetRowSums:', targetRowSums);

            const newGuess: Guess = {
              id: generateId(),
              digits: guess,
              feedback,
              timestamp: new Date(),
              rowDeltas,
              targetRowSums,
            };

            console.log('💾 NEW GUESS OBJECT:', newGuess);

            const newGuesses = [...state.gameState.guesses, newGuess];
            console.log('🚀 📝 TOTAL GUESSES AFTER ADDING:', newGuesses.length);
            console.log('🚀 📝 ALL GUESSES:', newGuesses);
            const timeMinutes = get().getGameTimeMinutes();
            const hintCost = get().getTotalHintCost();
            const newScore = calculateScore(
              newGuesses.length, 
              timeMinutes, 
              hintCost,
              state.settings.developerMode,
              state.settings.developerLoseScore
            );
            
            // Debug developer mode
            if (state.settings.developerMode) {
              console.log('🔧 Developer Mode Debug:', {
                guesses: newGuesses.length,
                timeMinutes,
                hintCost,
                calculatedScore: 100 - newGuesses.length - timeMinutes - hintCost,
                developerLoseScore: state.settings.developerLoseScore,
                finalScore: newScore,
                shouldLose: (100 - newGuesses.length - timeMinutes - hintCost) <= state.settings.developerLoseScore
              });
            }

            const gameWon = feedback.isWinner;
            const maxGuesses = 100; // Maximum number of guesses (effectively unlimited due to score-based ending)
            const gameEnded = gameWon || newScore <= 0 || newGuesses.length >= maxGuesses;
            
            // Create new guess array that preserves locked positions when clearing after submit
            const newCurrentGuess = gameEnded 
              ? state.gameState.currentGuess 
              : state.settings.clearGuessAfterSubmit 
                ? state.gameState.currentGuess.map((digit, index) => 
                    state.gameState.lockedPositions.has(index) ? digit : null
                  )
                : state.gameState.currentGuess;

            const newGameState: GameState = {
              ...state.gameState,
              guesses: newGuesses,
              currentGuess: newCurrentGuess,
              score: newScore,
              isGameWon: gameWon,
              isGameActive: !gameEnded,
              activeGuessPosition: gameEnded 
                ? state.gameState.activeGuessPosition 
                : state.settings.clearGuessAfterSubmit 
                  ? 0 
                  : state.gameState.activeGuessPosition,
              gameEndTime: gameEnded ? new Date() : undefined,
            };

            set({ gameState: newGameState });
            console.log('🚀 ✅ GAME STATE UPDATED WITH NEW GUESS');
            console.log('🚀 ✅ Final guess count:', newGameState.guesses.length);

            // Play sound feedback if sound is enabled
            if (state.settings.soundEnabled) {
              if (gameWon) {
                soundUtils.playGameWonSound();
              } else if (!gameEnded) {
                soundUtils.playGuessCompleteSound();
              } else {
                // Game lost (too many guesses)
                soundUtils.playGameLostSound();
              }
            }

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
            console.log('[DEBUG] PURCHASE_HINT action:', { hintType, targetNumber, hintState: state.hintState });

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
                  newScratchpadState.numberColors.set(targetNumber, 'fermi');
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
              case 'random-expose':
                // Find a random number that hasn't been exposed yet
                const availableNumbers = Array.from({ length: state.settings.digitRange + 1 }, (_, i) => i)
                  .filter(num => 
                    !newHintState.purchasedHints.randomExposedNumbers.has(num) &&
                    !newHintState.purchasedHints.bagelNumbers.has(num) &&
                    !newHintState.purchasedHints.notBagelNumbers.has(num)
                  );
                
                if (availableNumbers.length > 0) {
                  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                  const selectedNumber = availableNumbers[randomIndex];
                  
                  // Check if the number is in the target
                  const isInTarget = state.gameState.target.includes(selectedNumber);
                  
                  // Add to appropriate set and update scratchpad
                  if (isInTarget) {
                    newHintState.purchasedHints.notBagelNumbers.add(selectedNumber);
                  } else {
                    newHintState.purchasedHints.bagelNumbers.add(selectedNumber);
                  }
                  
                  newHintState.purchasedHints.randomExposedNumbers.add(selectedNumber);
                  
                  // Update scratchpad color
                  const newScratchpadState = { ...state.scratchpadState };
                  newScratchpadState.numberColors.set(selectedNumber, isInTarget ? 'fermi' : 'bagel');
                  set({ scratchpadState: newScratchpadState });
                }
                break;
              case 'row-sums':
                console.log('💰 ROW SUM HINT DEBUG: Purchase initiated');
                console.log('💰 Grid rows:', state.settings.gridRows);
                console.log('💰 Current revealed rows:', Array.from(newHintState.purchasedHints.revealedRowSums));
                
                // Find available rows that don't have their sums revealed yet
                const availableRows = Array.from({ length: state.settings.gridRows }, (_, i) => i)
                  .filter(rowIndex => !newHintState.purchasedHints.revealedRowSums.has(rowIndex));
                
                console.log('💰 Available rows for reveal:', availableRows);
                
                if (availableRows.length > 0) {
                  // Randomly select one of the available rows
                  const randomIndex = Math.floor(Math.random() * availableRows.length);
                  const selectedRow = availableRows[randomIndex];
                  console.log('💰 Selected row for reveal:', selectedRow);
                  newHintState.purchasedHints.revealedRowSums.add(selectedRow);
                  console.log('💰 After adding - revealed rows:', Array.from(newHintState.purchasedHints.revealedRowSums));
                } else {
                  console.log('💰 No available rows to reveal!');
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
                console.log('🔧 DIFFICULTY CHANGE:', {
                  from: state.settings.difficulty,
                  to: action.settings.difficulty,
                  oldDigitRange: state.settings.digitRange,
                });
                const difficultySettings = getDifficultySettings(action.settings.difficulty);
                console.log('🔧 APPLYING DIFFICULTY SETTINGS:', difficultySettings);
                Object.assign(newSettings, difficultySettings);
                console.log('🔧 NEW SETTINGS AFTER DIFFICULTY CHANGE:', {
                  difficulty: newSettings.difficulty,
                  digitRange: newSettings.digitRange,
                  targetLength: newSettings.targetLength
                });
              }

              // Calculate targetLength based on grid dimensions
              if (action.settings.gridRows !== undefined || action.settings.gridColumns !== undefined) {
                newSettings.targetLength = newSettings.gridRows * newSettings.gridColumns;
              }

              // Update sound volume if changed
              if (action.settings.soundVolume !== undefined) {
                soundUtils.setVolume(action.settings.soundVolume);
              }

              // Activate audio if sound is being enabled
              if (action.settings.soundEnabled === true && state.settings.soundEnabled === false) {
        
                soundUtils.activateAudio().catch(error => {
                  console.error('🎵 ❌ Failed to activate audio on sound enable:', error);
                });
              }

              // Start new game if game-affecting settings changed
              const gameAffectingSettings = ['difficulty', 'targetLength', 'digitRange', 'gridRows', 'gridColumns'];
              const gameAffectingChanged = gameAffectingSettings.some(
                key => {
                  if (key === 'difficulty') {
                    // Don't restart for difficulty changes to 'custom' (custom settings adjustments)
                    const newDifficulty = action.settings[key as keyof GameSettings];
                    return newDifficulty !== undefined && newDifficulty !== 'custom';
                  }
                  return action.settings[key as keyof GameSettings] !== undefined;
                }
              );

              if (gameAffectingChanged) {
                console.log('🔧 GAME-AFFECTING SETTINGS CHANGED - STARTING NEW GAME');
                console.log('🔧 Creating new game state with settings:', {
                  difficulty: newSettings.difficulty,
                  digitRange: newSettings.digitRange,
                  targetLength: newSettings.targetLength
                });
                
                // Ensure showTarget is always disabled when starting a new game due to settings change
                newSettings.showTarget = false;
                console.log('🔧 Disabled showTarget for new game');
                
                const newGameState = createInitialGameState(newSettings);
                const newHintState = createInitialHintState();
                const newScratchpadState = createInitialScratchpadState(newSettings.digitRange);
                
                console.log('🔧 NEW GAME STATE TARGET:', newGameState.target);
                
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
            // Ensure showTarget is disabled when clearing game state
            const resetSettings = {
              ...state.settings,
              showTarget: false
            };
            
            set({
              settings: resetSettings,
              gameState: createInitialGameState(resetSettings),
              hintState: createInitialHintState(),
              scratchpadState: createInitialScratchpadState(resetSettings.digitRange),
            });
            break;
          }

          // RE-ENABLED LEADERBOARD FUNCTIONALITY
          case 'SAVE_SCORE': {
            console.log('🏆 GameStore: Saving score to leaderboard:', action.entry);
            const newLeaderboard = new Map(state.leaderboard);
            const difficultyBoard = newLeaderboard.get(state.settings.difficulty) || [];
            const updatedBoard = [...difficultyBoard, action.entry]
              .sort((a, b) => b.score - a.score)
              .slice(0, 100); // Keep top 100 scores
            
            newLeaderboard.set(state.settings.difficulty, updatedBoard);
            console.log('🏆 GameStore: Updated leaderboard for', state.settings.difficulty, ':', updatedBoard);
            set({ leaderboard: newLeaderboard });
            break;
          }
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
        // Only count bagel/not-bagel hints that were NOT revealed by random-expose
        const bagelCount = Array.from(purchasedHints.bagelNumbers)
          .filter(num => !purchasedHints.randomExposedNumbers.has(num)).length;
        const notBagelCount = Array.from(purchasedHints.notBagelNumbers)
          .filter(num => !purchasedHints.randomExposedNumbers.has(num)).length;
        const costBreakdown = {
          bagel: bagelCount * hintCost.bagelHint,
          notBagel: notBagelCount * hintCost.notBagelHint,
          rowDelta: purchasedHints.rowDeltaHints * hintCost.rowDeltaHint,
          randomExpose: purchasedHints.randomExposedNumbers.size * hintCost.randomExposeHint,
          rowSums: purchasedHints.revealedRowSums.size * hintCost.rowSumsHint,
        };
        const total = costBreakdown.bagel + costBreakdown.notBagel + costBreakdown.rowDelta + costBreakdown.randomExpose + costBreakdown.rowSums;
        console.log('[DEBUG] getTotalHintCost breakdown:', costBreakdown, 'total:', total);
        return total;
      },

      getGameTimeMinutes: () => {
        const { gameState } = get();
        const endTime = gameState.gameEndTime || new Date();
        const diffMs = endTime.getTime() - gameState.gameStartTime.getTime();
        const timeMinutes = diffMs / 60000; // Convert to minutes
        
        // Quantize to 0.2 second increments (0.2/60 = 0.00333... minutes)
        const quantizedMinutes = Math.round(timeMinutes / 0.003333333) * 0.003333333;
        
        return Math.round(quantizedMinutes * 100) / 100; // Round to 2 decimal places
      },

      isGuessValid: () => {
        const { gameState, settings } = get();
        return isValidGuess(gameState.currentGuess, settings.digitRange);
      },

      canSubmitGuess: () => {
        const { gameState, settings } = get();
        return gameState.isGameActive && isValidGuess(gameState.currentGuess, settings.digitRange);
      },

      resetAllSettings: () => {
        // Clear localStorage to reset all persisted data
        localStorage.removeItem('pico-fermi-bagel-store');
        
        // Reset to defaults
        set({
          settings: defaultSettings,
          gameState: createInitialGameState(defaultSettings),
          hintState: createInitialHintState(),
          scratchpadState: createInitialScratchpadState(defaultSettings.digitRange),
          stats: new Map(),
        });
        
        console.log('🔄 All settings and data reset to defaults');
      },

      isDeveloperMode: () => {
        const { settings } = get();
        return settings.developerMode;
      },

      getDeveloperLoseScore: () => {
        const { settings } = get();
        return settings.developerLoseScore;
      },

      getRandomSeed: () => {
        const { settings } = get();
        console.log('🎮 GameStore: getRandomSeed called, returning:', settings.randomSeed);
        return settings.randomSeed;
      },

      // Global username management
      globalUsername: (() => {
        // Try to get from localStorage first
        const stored = localStorage.getItem('pfb_global_username');
        if (stored) {
          console.log('🌍 GameStore: Loading global username from localStorage:', stored);
          return stored;
        }
        
        // Try to get from previous usernames
        const previous = localStorage.getItem('pfb_previous_usernames');
        if (previous) {
          const usernames = JSON.parse(previous);
          if (usernames.length > 0) {
            console.log('🌍 GameStore: Loading global username from previous usernames:', usernames[0]);
            return usernames[0];
          }
        }
        
        return 'Player'; // Default username
      })(),
      
      setGlobalUsername: (username: string) => {
        console.log('🌍 GameStore: Setting global username:', username);
        set({ globalUsername: username });
        
        // Update localStorage
        localStorage.setItem('pfb_global_username', username);
        
        // Update multiplayer service
        if (username) {
          localStorage.setItem('pfb_username', username);
          localStorage.setItem('pfb_user_registered', 'true');
        }
        
        // Update previous usernames list
        const stored = localStorage.getItem('pfb_previous_usernames');
        const previousUsernames = stored ? JSON.parse(stored) : [];
        if (username && !previousUsernames.includes(username)) {
          const updated = [username, ...previousUsernames].slice(0, 5);
          localStorage.setItem('pfb_previous_usernames', JSON.stringify(updated));
        }
      },
      
      getGlobalUsername: () => {
        return get().globalUsername;
      },

      // Leaderboard functionality
      submitScoreToLeaderboard: async (_gameId: string = '0') => {
        const { gameState, settings } = get();
        
        if (!gameState.isGameWon) {
          console.log('🎮 GameStore: Game not won, skipping leaderboard submission');
          return;
        }

        // Check if score was already submitted for this game
        const existingScores = get().leaderboard.get(settings.difficulty) || [];
        const alreadySubmitted = existingScores.some(entry => 
          entry.playerName === 'Player' && 
          entry.guesses === gameState.guesses.length &&
          Math.abs(entry.timestamp.getTime() - gameState.gameStartTime.getTime()) < 1000
        );

        if (alreadySubmitted) {
          console.log('🎮 GameStore: Score already submitted for this game, skipping');
          return;
        }

        const timeMinutes = get().getGameTimeMinutes();
        
        // Get username from localStorage
        const savedUsernames = localStorage.getItem('pfb_previous_usernames');
        const usernames = savedUsernames ? JSON.parse(savedUsernames) : [];
        const currentUsername = usernames.length > 0 ? usernames[0] : 'Player';
        
        const leaderboardEntry: LeaderboardEntry = {
          id: generateId(),
          playerName: currentUsername,
          score: gameState.score,
          guesses: gameState.guesses.length,
          timeMinutes,
          difficulty: settings.difficulty,
          timestamp: new Date(),
        };

        console.log('🎮 GameStore: Submitting score to leaderboard:', leaderboardEntry);
        
        // Save to local leaderboard
        get().dispatch({ type: 'SAVE_SCORE', entry: leaderboardEntry });
        
        // Submit to AWS leaderboard via multiplayerService
        try {
          console.log('🎮 GameStore: Attempting AWS submission with data:', {
            gameId: _gameId,
            score: gameState.score,
            guesses: gameState.guesses.length,
            hints: get().getTotalHintCost(),
            difficulty: settings.difficulty,
            gameWon: true,
            username: currentUsername
          });
          
          // Ensure AWS is initialized
          const { initializeAWS } = await import('../services/awsConfig');
          initializeAWS();
          
          const { multiplayerService } = await import('../services/multiplayerService');
          console.log('🎮 GameStore: Calling multiplayerService.submitGameResult...');
          const result = await multiplayerService.submitGameResult(_gameId, {
            score: Math.round(gameState.score),
            guesses: gameState.guesses.length,
            hints: get().getTotalHintCost(),
            difficulty: settings.difficulty,
            gameWon: true
          }, currentUsername);
          console.log('🎮 GameStore: AWS submission result:', result);
        } catch (error: any) {
          console.error('🎮 GameStore: Failed to submit to AWS:', error);
          console.error('🎮 GameStore: Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
      },
    }),
    {
      name: 'pico-fermi-bagel-store',
      partialize: (state) => ({
        settings: state.settings,
        stats: state.stats,
        leaderboard: state.leaderboard, // RE-ENABLED LEADERBOARD FUNCTIONALITY
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          
          let settings: GameSettings;
          let stats: Map<string, any>;
          
          if (!str) {
            // First run - no localStorage data
            console.log('💾 First run - no localStorage data, using default settings');
            settings = { ...defaultSettings };
            stats = new Map();
          } else {
            // Subsequent runs - load from localStorage
            const parsed = JSON.parse(str);
            settings = parsed.state?.settings || defaultSettings;
            stats = new Map(Object.entries(parsed.state.stats || {}));
            console.log('💾 Loading from localStorage');
          }
          
          // CRITICAL: Always override showTarget to false on app startup
          settings.showTarget = false;
          
          console.log('💾 Final settings:', {
            difficulty: settings.difficulty,
            digitRange: settings.digitRange,
            targetLength: settings.targetLength
          });
          
          // Create initial state with the correct settings (only once!)
          const gameState = createInitialGameState(settings);
          const hintState = createInitialHintState();
          const scratchpadState = createInitialScratchpadState(settings.digitRange);
          
          console.log('💾 Created initial game state with correct settings');
          
          return {
            state: {
              settings,
              gameState,
              hintState,
              scratchpadState,
              stats,
              leaderboard: new Map(), // RE-ENABLED LEADERBOARD FUNCTIONALITY
            }
          };
        },
        setItem: (name, value) => {
          const serializable = {
            ...value,
            state: {
              ...value.state,
              stats: Object.fromEntries(value.state.stats || new Map()),
              leaderboard: Object.fromEntries(value.state.leaderboard || new Map()), // RE-ENABLED LEADERBOARD FUNCTIONALITY
            }
          };
          localStorage.setItem(name, JSON.stringify(serializable));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
); 