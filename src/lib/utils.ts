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

  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

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
        matrix[i - 1][j - 1] + cost, // substitution
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

  if (normalizedInput === normalizedTarget) return false; // Exact match, not "close"

  const distance = levenshteinDistance(normalizedInput, normalizedTarget);
  const targetLen = normalizedTarget.length;

  // Define "close" thresholds based on word length
  if (targetLen <= 4) return distance <= 1;
  if (targetLen <= 7) return distance <= 2;
  if (targetLen <= 10) return distance <= 3;
  return distance <= 4;
}

/**
 * Generate a hint showing word length with underscores
 * Optionally reveal specific positions
 */
export function generateWordHint(
  word: string,
  revealedPositions: number[] = [],
): string {
  return word
    .split("")
    .map((char, index) => {
      if (revealedPositions.includes(index)) return char;
      if (char === " ") return " ";
      return "_";
    })
    .join(" ");
}

/**
 * Get feedback type based on answer correctness and closeness
 */
export function getAnswerFeedback(
  input: string,
  target: string,
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
