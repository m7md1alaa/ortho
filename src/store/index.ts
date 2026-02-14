import { Store } from "@tanstack/react-store";
import type { Word } from "@/types/types";

interface PracticeSession {
  id: string;
  listId: string;
  startedAt: number;
  wordsPracticed: Array<{
    wordId: string;
    attempts: number;
    correct: boolean;
    timeSpent: number;
  }>;
}

export interface AppState {
  currentSession: PracticeSession | null;
  currentListId: string | null;
  currentWordIndex: number;
  audioEnabled: boolean;
  speechRate: number;
}

const initialState: AppState = {
  currentSession: null,
  currentListId: null,
  currentWordIndex: 0,
  audioEnabled: true,
  speechRate: 0.9,
};

export const store = new Store(initialState);

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function startPracticeSession(listId: string) {
  const session: PracticeSession = {
    id: generateId(),
    listId,
    startedAt: Date.now(),
    wordsPracticed: [],
  };
  store.setState((state) => ({
    ...state,
    currentSession: session,
    currentListId: listId,
    currentWordIndex: 0,
  }));
  return session;
}

export function endPracticeSession() {
  store.setState((state) => {
    if (!state.currentSession) {
      return state;
    }

    return {
      ...state,
      currentSession: null,
    };
  });
}

export function recordWordPractice(
  wordId: string,
  correct: boolean,
  attempts: number,
  timeSpent: number
) {
  store.setState((state) => {
    if (!(state.currentSession && state.currentListId)) {
      return state;
    }

    return {
      ...state,
      currentSession: {
        ...state.currentSession,
        wordsPracticed: [
          ...state.currentSession.wordsPracticed,
          { wordId, attempts, correct, timeSpent },
        ],
      },
    };
  });
}

export function setCurrentWordIndex(index: number) {
  store.setState((state) => ({
    ...state,
    currentWordIndex: index,
  }));
}

export function setAudioEnabled(enabled: boolean) {
  store.setState((state) => ({
    ...state,
    audioEnabled: enabled,
  }));
}

export function setSpeechRate(rate: number) {
  store.setState((state) => ({
    ...state,
    speechRate: rate,
  }));
}

export function getWordStats(word: Word) {
  const totalAttempts = word.correctCount + word.incorrectCount;
  const accuracy =
    totalAttempts > 0 ? (word.correctCount / totalAttempts) * 100 : 0;

  return {
    totalAttempts,
    accuracy: Math.round(accuracy),
    isNew: totalAttempts === 0,
    isMastered: word.streak >= 5,
    needsReview: word.nextReview && word.nextReview <= Date.now(),
  };
}
