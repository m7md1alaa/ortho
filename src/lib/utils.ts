import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits needed
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) {
    return bLen;
  }
  if (bLen === 0) {
    return aLen;
  }

  // Initialize matrix
  for (let i = 0; i <= aLen; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bLen; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[aLen][bLen];
}

/**
 * Check if an answer is "close" to the target word
 * Returns true if within acceptable edit distance based on word length
 */
export function isCloseAnswer(input: string, target: string): boolean {
  const normalizedInput = input.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();

  if (normalizedInput === normalizedTarget) {
    return false; // Exact match, not "close"
  }

  const distance = levenshteinDistance(normalizedInput, normalizedTarget);
  const targetLen = normalizedTarget.length;

  // Define "close" thresholds based on word length
  if (targetLen <= 4) {
    return distance <= 1;
  }
  if (targetLen <= 7) {
    return distance <= 2;
  }
  if (targetLen <= 10) {
    return distance <= 3;
  }
  return distance <= 4;
}

/**
 * Generate a hint showing word length with underscores
 * Optionally reveal specific positions
 */
export function generateWordHint(
  word: string,
  revealedPositions: number[] = []
): string {
  return word
    .split("")
    .map((char, index) => {
      if (revealedPositions.includes(index)) {
        return char;
      }
      if (char === " ") {
        return " ";
      }
      return "_";
    })
    .join(" ");
}

/**
 * Get feedback type based on answer correctness and closeness
 */
export function getAnswerFeedback(
  input: string,
  target: string
): {
  isCorrect: boolean;
  isClose: boolean;
  message: string;
  feedbackType: "success" | "close" | "error" | null;
} {
  const normalizedInput = input.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();

  if (normalizedInput === normalizedTarget) {
    return {
      isCorrect: true,
      isClose: false,
      message: "Correct!",
      feedbackType: "success",
    };
  }

  if (isCloseAnswer(input, target)) {
    return {
      isCorrect: false,
      isClose: true,
      message: "You're close!",
      feedbackType: "close",
    };
  }

  return {
    isCorrect: false,
    isClose: false,
    message: "Try again",
    feedbackType: "error",
  };
}

/**
 * Calculate hint based on number of attempts
 * Returns null if no hint should be shown
 */
export function calculateHint(word: string, attempts: number): string | null {
  if (attempts === 0) {
    return null;
  }
  if (attempts === 1) {
    // Show word length only
    return generateWordHint(word, []);
  }
  if (attempts === 2) {
    // Show first letter + length
    return generateWordHint(word, [0]);
  }
  if (attempts >= 3) {
    // Show first and last letters
    const lastIndex = word.length - 1;
    return generateWordHint(word, [0, lastIndex]);
  }
  return null;
}

/**
 * Get input border class based on answer state
 */
export function getInputBorderClass(
  showAnswer: boolean,
  hasAnsweredCorrectly: boolean,
  userInput: string,
  currentWord: string | undefined
): string {
  if (showAnswer) {
    return hasAnsweredCorrectly
      ? "border-green-500 text-green-400 disabled:text-green-400 disabled:border-green-500"
      : "border-red-500 text-red-400 disabled:text-red-400 disabled:border-red-500";
  }
  // Check if current input is close to answer
  if (
    userInput.trim() &&
    currentWord &&
    isCloseAnswer(userInput, currentWord)
  ) {
    return "border-amber-500 text-amber-400 focus:border-amber-400";
  }
  return "border-zinc-700 focus:border-zinc-500";
}
