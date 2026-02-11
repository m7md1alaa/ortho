import { Store } from "@tanstack/react-store";
import type { PracticeSession, Word, WordList } from "@/types";

const STORAGE_KEY = "ortho-word-lists";
const SESSIONS_KEY = "ortho-practice-sessions";

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored, (key, value) => {
        if (
          key === "createdAt" ||
          key === "updatedAt" ||
          key === "lastPracticed" ||
          key === "nextReview" ||
          key === "startedAt" ||
          key === "endedAt"
        ) {
          return value ? new Date(value) : value;
        }
        return value;
      });
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load from storage:", e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to storage:", e);
  }
}

export interface AppState {
  wordLists: WordList[];
  currentSession: PracticeSession | null;
  currentListId: string | null;
  currentWordIndex: number;
  audioEnabled: boolean;
  speechRate: number;
}

const initialState: AppState = {
  wordLists: loadFromStorage(STORAGE_KEY, []),
  currentSession: null,
  currentListId: null,
  currentWordIndex: 0,
  audioEnabled: true,
  speechRate: 0.9,
};

export const store = new Store(initialState);

store.subscribe((state) => {
  saveToStorage(STORAGE_KEY, (state as unknown as AppState).wordLists);
});

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function addWordList(
  list: Omit<WordList, "id" | "createdAt" | "updatedAt">,
): WordList {
  const newList: WordList = {
    ...list,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.setState((state) => ({
    ...state,
    wordLists: [...state.wordLists, newList],
  }));
  return newList;
}

export function updateWordList(id: string, updates: Partial<WordList>) {
  store.setState((state) => ({
    ...state,
    wordLists: state.wordLists.map((list) =>
      list.id === id ? { ...list, ...updates, updatedAt: new Date() } : list,
    ),
  }));
}

export function deleteWordList(id: string) {
  store.setState((state) => ({
    ...state,
    wordLists: state.wordLists.filter((list) => list.id !== id),
    currentListId: state.currentListId === id ? null : state.currentListId,
  }));
}

export function addWord(listId: string, word: Omit<Word, "id">): Word {
  const newWord: Word = {
    ...word,
    id: generateId(),
  };
  store.setState((state) => ({
    ...state,
    wordLists: state.wordLists.map((list) =>
      list.id === listId
        ? { ...list, words: [...list.words, newWord], updatedAt: new Date() }
        : list,
    ),
  }));
  return newWord;
}

export function updateWord(
  listId: string,
  wordId: string,
  updates: Partial<Word>,
) {
  store.setState((state) => ({
    ...state,
    wordLists: state.wordLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            words: list.words.map((word) =>
              word.id === wordId ? { ...word, ...updates } : word,
            ),
            updatedAt: new Date(),
          }
        : list,
    ),
  }));
}

export function deleteWord(listId: string, wordId: string) {
  store.setState((state) => ({
    ...state,
    wordLists: state.wordLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            words: list.words.filter((word) => word.id !== wordId),
            updatedAt: new Date(),
          }
        : list,
    ),
  }));
}

export function startPracticeSession(listId: string) {
  const session: PracticeSession = {
    id: generateId(),
    listId,
    startedAt: new Date(),
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
    if (!state.currentSession) return state;

    const endedSession = {
      ...state.currentSession,
      endedAt: new Date(),
    };

    const sessions = loadFromStorage<PracticeSession[]>(SESSIONS_KEY, []);
    saveToStorage(SESSIONS_KEY, [...sessions, endedSession]);

    const practiceTime = endedSession.endedAt
      ? endedSession.endedAt.getTime() - endedSession.startedAt.getTime()
      : 0;

    return {
      ...state,
      currentSession: null,
      wordLists: state.wordLists.map((list) =>
        list.id === state.currentListId
          ? {
              ...list,
              totalPracticeTime: list.totalPracticeTime + practiceTime,
            }
          : list,
      ),
    };
  });
}

export function recordWordPractice(
  wordId: string,
  correct: boolean,
  attempts: number,
  timeSpent: number,
) {
  store.setState((state) => {
    if (!state.currentSession || !state.currentListId) return state;

    const list = state.wordLists.find((l) => l.id === state.currentListId);
    const word = list?.words.find((w) => w.id === wordId);

    if (!word) return state;

    const newStreak = correct ? word.streak + 1 : 0;
    const nextReview = calculateNextReview(newStreak, correct);

    return {
      ...state,
      currentSession: {
        ...state.currentSession,
        wordsPracticed: [
          ...state.currentSession.wordsPracticed,
          { wordId, attempts, correct, timeSpent },
        ],
      },
      wordLists: state.wordLists.map((l) =>
        l.id === state.currentListId
          ? {
              ...l,
              words: l.words.map((w) =>
                w.id === wordId
                  ? {
                      ...w,
                      lastPracticed: new Date(),
                      nextReview,
                      correctCount: correct
                        ? w.correctCount + 1
                        : w.correctCount,
                      incorrectCount: correct
                        ? w.incorrectCount
                        : w.incorrectCount + 1,
                      streak: newStreak,
                    }
                  : w,
              ),
            }
          : l,
      ),
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

function calculateNextReview(streak: number, correct: boolean): Date {
  const now = new Date();

  if (!correct) {
    return new Date(now.getTime() + 5 * 60 * 1000);
  }

  const intervals = [
    5 * 60 * 1000,
    30 * 60 * 1000,
    2 * 60 * 60 * 1000,
    8 * 60 * 60 * 1000,
    24 * 60 * 60 * 1000,
    3 * 24 * 60 * 60 * 1000,
    7 * 24 * 60 * 60 * 1000,
    14 * 24 * 60 * 60 * 1000,
    30 * 24 * 60 * 60 * 1000,
  ];

  const interval = intervals[Math.min(streak, intervals.length - 1)];
  return new Date(now.getTime() + interval);
}

export function getDueWords(list: WordList): Word[] {
  const now = new Date();
  return list.words.filter(
    (word) => !word.nextReview || word.nextReview <= now,
  );
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
    needsReview: word.nextReview && word.nextReview <= new Date(),
  };
}
