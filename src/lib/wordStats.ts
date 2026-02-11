import type { Word } from "@/types";

export interface WordStats {
  totalAttempts: number;
  accuracy: number;
  isNew: boolean;
  isMastered: boolean;
  needsReview: boolean;
}

export function calculateWordStats(word: Word): WordStats {
  const totalAttempts = word.correctCount + word.incorrectCount;
  const accuracy =
    totalAttempts > 0
      ? Math.round((word.correctCount / totalAttempts) * 100)
      : 0;

  return {
    totalAttempts,
    accuracy,
    isNew: totalAttempts === 0,
    isMastered: word.streak >= 5,
    needsReview: word.nextReview ? word.nextReview <= new Date() : false,
  };
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return "text-green-400";
  if (accuracy >= 50) return "text-yellow-400";
  return "text-red-400";
}

export function getDifficultyColor(
  difficulty: "easy" | "medium" | "hard",
): string {
  switch (difficulty) {
    case "easy":
      return "bg-green-900/30 text-green-400";
    case "medium":
      return "bg-yellow-900/30 text-yellow-400";
    case "hard":
      return "bg-red-900/30 text-red-400";
  }
}
