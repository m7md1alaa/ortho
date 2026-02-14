import { useCallback, useEffect, useRef, useState } from "react";
import { getAnswerFeedback } from "@/lib/utils";
import {
  endPracticeSession,
  recordWordPractice,
  setCurrentWordIndex,
  startPracticeSession,
} from "@/store";
import type { Word } from "@/types/types";

export type FeedbackType = "success" | "error" | "neutral" | "close";

export interface FeedbackMessage {
  text: string;
  type: FeedbackType;
}

export interface PracticeResults {
  correct: number;
  incorrect: number;
  skipped: number;
}

export interface UsePracticeSessionReturn {
  // State
  userInput: string;
  setUserInput: (value: string) => void;
  showAnswer: boolean;
  setShowAnswer: (value: boolean) => void;
  attempts: number;
  sessionComplete: boolean;
  feedbackMessage: FeedbackMessage | null;
  setFeedbackMessage: (value: FeedbackMessage | null) => void;
  hasAnsweredCorrectly: boolean;
  results: PracticeResults;
  inputRef: React.RefObject<HTMLInputElement | null>;
  practiceWords: Word[];
  setPracticeWords: (words: Word[]) => void;

  // Actions
  handleSubmit: () => void;
  handleShowAnswer: () => void;
  goToNextWord: () => void;
  goToPreviousWord: () => void;
  resetSession: () => void;
}

export function usePracticeSession(
  listId: string,
  listWords: Word[],
  currentWordIndex: number
): UsePracticeSessionReturn {
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [feedbackMessage, setFeedbackMessage] =
    useState<FeedbackMessage | null>(null);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [results, setResults] = useState<PracticeResults>({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);

  const currentWord = practiceWords[currentWordIndex];

  // Initialize session
  useEffect(() => {
    if (listWords.length > 0 && practiceWords.length === 0) {
      startPracticeSession(listId);
      const words = [...listWords].sort(() => Math.random() - 0.5);
      setPracticeWords(words);
    }
  }, [listWords, listId, practiceWords.length]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    if (!(currentWord && userInput.trim())) {
      return;
    }

    const feedback = getAnswerFeedback(userInput, currentWord.word);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (feedback.isCorrect) {
      recordWordPractice(currentWord.id, true, newAttempts, 0);
      setResults((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setHasAnsweredCorrectly(true);
      setShowAnswer(true);
      setFeedbackMessage({
        text: feedback.message,
        type: "success",
      });
    } else if (feedback.isClose) {
      setFeedbackMessage({
        text: `${feedback.message} (${newAttempts} ${newAttempts === 1 ? "attempt" : "attempts"})`,
        type: "close",
      });
      inputRef.current?.focus();
    } else {
      setFeedbackMessage({
        text: `${feedback.message} (${newAttempts} ${newAttempts === 1 ? "attempt" : "attempts"})`,
        type: "error",
      });
      inputRef.current?.focus();
    }
  }, [currentWord, userInput, attempts]);

  const handleShowAnswer = useCallback(() => {
    if (!currentWord) {
      return;
    }
    recordWordPractice(currentWord.id, false, attempts, 0);
    setResults((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    setShowAnswer(true);
    setHasAnsweredCorrectly(false);
    setFeedbackMessage({ text: "Answer revealed", type: "neutral" });
  }, [currentWord, attempts]);

  const goToNextWord = useCallback(() => {
    if (currentWordIndex >= practiceWords.length - 1) {
      endPracticeSession();
      setSessionComplete(true);
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserInput("");
      setShowAnswer(false);
      setAttempts(0);
      setHasAnsweredCorrectly(false);
      setFeedbackMessage(null);
    }
  }, [currentWordIndex, practiceWords.length]);

  const goToPreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setUserInput("");
      setShowAnswer(false);
      setAttempts(0);
      setHasAnsweredCorrectly(false);
      setFeedbackMessage(null);
    }
  }, [currentWordIndex]);

  const resetSession = useCallback(() => {
    setSessionComplete(false);
    setResults({ correct: 0, incorrect: 0, skipped: 0 });
    setCurrentWordIndex(0);
    setUserInput("");
    setShowAnswer(false);
    setAttempts(0);
    setHasAnsweredCorrectly(false);
    setFeedbackMessage(null);
    startPracticeSession(listId);
    const words = [...listWords].sort(() => Math.random() - 0.5);
    setPracticeWords(words);
  }, [listId, listWords]);

  // Auto-advance when answer is correct
  useEffect(() => {
    if (showAnswer && hasAnsweredCorrectly) {
      const timer = setTimeout(() => {
        goToNextWord();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showAnswer, hasAnsweredCorrectly, goToNextWord]);

  return {
    userInput,
    setUserInput,
    showAnswer,
    setShowAnswer,
    attempts,
    sessionComplete,
    feedbackMessage,
    setFeedbackMessage,
    hasAnsweredCorrectly,
    results,
    inputRef,
    practiceWords,
    setPracticeWords,
    handleSubmit,
    handleShowAnswer,
    goToNextWord,
    goToPreviousWord,
    resetSession,
  };
}
