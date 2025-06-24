import { GameSettings, GuessResult, ScoreData } from '@/types/game';

/**
 * Generates a random target number based on game settings
 */
export function generateTarget(settings: GameSettings): number[] {
  const { targetLength, digitRange } = settings;
  const target: number[] = [];
  const usedDigits = new Set<number>();

  while (target.length < targetLength) {
    const digit = Math.floor(Math.random() * (digitRange + 1));
    if (!usedDigits.has(digit)) {
      target.push(digit);
      usedDigits.add(digit);
    }
  }

  return target;
}

/**
 * Evaluates a guess against the target and returns feedback
 */
export function evaluateGuess(guess: number[], target: number[]): GuessResult {
  let picos = 0;
  let fermis = 0;
  let bagels = 0;

  for (let i = 0; i < guess.length; i++) {
    const guessDigit = guess[i];
    
    if (guessDigit === target[i]) {
      // Correct digit in correct position
      fermis++;
    } else if (target.includes(guessDigit)) {
      // Correct digit in wrong position
      picos++;
    } else {
      // Digit not in target
      bagels++;
    }
  }

  const isWinner = fermis === target.length && picos === 0 && bagels === 0;

  return {
    picos,
    fermis,
    bagels,
    isWinner
  };
}

/**
 * Validates if a guess is valid (no repeated digits, all positions filled, within range)
 */
export function isValidGuess(guess: (number | null)[], digitRange?: number): boolean {
  // Check if all positions are filled
  if (guess.some(digit => digit === null)) {
    return false;
  }

  // Check for repeated digits
  const digits = guess as number[];
  const uniqueDigits = new Set(digits);
  if (uniqueDigits.size !== digits.length) {
    return false;
  }

  // Check if digits are within allowed range (if range is provided)
  if (digitRange !== undefined) {
    if (digits.some(digit => digit < 0 || digit > digitRange)) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates the score based on guesses, time, and hints used
 */
export function calculateScore(
  guesses: number, 
  timeMinutes: number, 
  hintCost: number
): number {
  // Score formula from manual: 100 - guesses - timeMinutes - hintCost
  const score = Math.max(0, 100 - guesses - timeMinutes - hintCost);
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

/**
 * Gets difficulty settings for different game modes
 */
export function getDifficultySettings(difficulty: string): Partial<GameSettings> {
  switch (difficulty) {
    case 'easy':
      return {
        targetLength: 3,
        digitRange: 6, // 0-6
        gridRows: 1,
        gridColumns: 3,
      };
    case 'classic':
      return {
        targetLength: 3,
        digitRange: 9, // 0-9
        gridRows: 1,
        gridColumns: 3,
      };
    case 'medium':
      return {
        targetLength: 6,
        digitRange: 12, // 0-12
        gridRows: 2,
        gridColumns: 3,
      };
    case 'hard1':
      return {
        targetLength: 6,
        digitRange: 16, // 0-16
        gridRows: 2,
        gridColumns: 3,
      };
    case 'hard2':
      return {
        targetLength: 8,
        digitRange: 19, // 0-19
        gridRows: 2,
        gridColumns: 4,
      };
    case 'hard':
      return {
        targetLength: 8,
        digitRange: 19, // 0-19
        gridRows: 2,
        gridColumns: 4,
      };
    case 'expert':
      return {
        targetLength: 9,
        digitRange: 19, // 0-19
        gridRows: 3,
        gridColumns: 3,
      };
    default:
      return getDifficultySettings('classic');
  }
}

/**
 * Calculates row deltas for hints
 */
export function calculateRowDeltas(
  guess: number[], 
  target: number[],
  showActualDeltas: boolean = false
): number[] {
  const deltas: number[] = [];
  
  // For simplicity, we'll treat each digit as its own "row"
  // In a more complex version, this could group digits into actual rows
  for (let i = 0; i < guess.length; i++) {
    const delta = target[i] - guess[i];
    deltas.push(showActualDeltas ? delta : Math.abs(delta));
  }
  
  return deltas;
}

/**
 * Calculates row sums for the target based on grid layout
 */
export function calculateTargetRowSums(
  target: number[],
  gridRows: number,
  gridColumns: number,
  revealedRows?: Set<number>
): (number | null)[] {
  console.log('🧮 calculateTargetRowSums called with:', {
    target,
    gridRows,
    gridColumns,
    revealedRows: revealedRows ? Array.from(revealedRows) : 'undefined'
  });
  
  const rowSums: (number | null)[] = [];
  
  for (let row = 0; row < gridRows; row++) {
    if (revealedRows && revealedRows.has(row)) {
      let sum = 0;
      console.log('🧮 Calculating sum for revealed row', row);
      for (let col = 0; col < gridColumns; col++) {
        const index = row * gridColumns + col;
        if (index < target.length) {
          console.log('🧮 Row', row, 'Col', col, 'Index', index, 'Value', target[index]);
          sum += target[index];
        }
      }
      console.log('🧮 Row', row, 'sum:', sum);
      rowSums.push(sum);
    } else {
      console.log('🧮 Row', row, 'not revealed, pushing null');
      rowSums.push(null); // Not revealed yet
    }
  }
  
  console.log('🧮 Final rowSums:', rowSums);
  return rowSums;
}

/**
 * Generates a unique ID for game elements
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Checks if a number has already been used in the current guess
 */
export function isNumberUsedInGuess(number: number, guess: (number | null)[]): boolean {
  return guess.includes(number);
}

/**
 * Gets the next available position in the guess
 */
export function getNextAvailablePosition(
  guess: (number | null)[], 
  lockedPositions: Set<number>,
  currentPosition: number = 0
): number {
  for (let i = currentPosition; i < guess.length; i++) {
    if (guess[i] === null && !lockedPositions.has(i)) {
      return i;
    }
  }
  
  // If no position found from current onwards, search from beginning
  for (let i = 0; i < currentPosition; i++) {
    if (guess[i] === null && !lockedPositions.has(i)) {
      return i;
    }
  }
  
  return currentPosition; // Return current if no available position found
}

/**
 * Gets the next unlocked position for auto-advance (skips locked positions)
 */
export function getNextUnlockedPosition(
  guess: (number | null)[], 
  lockedPositions: Set<number>,
  startPosition: number = 0
): number {
  console.log('🎯 getNextUnlockedPosition: start=', startPosition, 'guessLength=', guess.length, 'locked=', Array.from(lockedPositions));
  
  // Start from the given position and look for next unlocked position
  for (let i = startPosition; i < guess.length; i++) {
    console.log('🎯 Checking position', i, '- locked:', lockedPositions.has(i));
    if (!lockedPositions.has(i)) {
      console.log('🎯 Found next position:', i);
      return i;
    }
  }
  
  // If no unlocked position found from start onwards, search from beginning
  for (let i = 0; i < startPosition; i++) {
    console.log('🎯 Checking wrap-around position', i, '- locked:', lockedPositions.has(i));
    if (!lockedPositions.has(i)) {
      console.log('🎯 Found wrap-around position:', i);
      return i;
    }
  }
  
  // If all positions are locked, return the start position
  const fallback = Math.min(startPosition, guess.length - 1);
  console.log('🎯 All locked, returning fallback:', fallback);
  return fallback;
}

/**
 * Formats time in minutes and seconds
 */
export function formatGameTime(startTime: Date, endTime?: Date): string {
  const end = endTime || new Date();
  const diffMs = end.getTime() - startTime.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffSeconds = Math.floor((diffMs % 60000) / 1000);
  
  if (diffMinutes > 0) {
    return `${diffMinutes}m ${diffSeconds}s`;
  }
  return `${diffSeconds}s`;
}

/**
 * Formats score data for display
 */
export function formatScoreData(scoreData: ScoreData): string {
  return `Score: ${scoreData.score} | Guesses: ${scoreData.guesses} | Time: ${scoreData.timeMinutes}m`;
} 