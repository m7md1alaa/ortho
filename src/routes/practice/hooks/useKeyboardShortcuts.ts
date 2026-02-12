import { useHotkeys } from "react-hotkeys-hook";

export interface UseKeyboardShortcutsProps {
  sessionComplete: boolean;
  currentWordIndex: number;
  showAnswer: boolean;
  currentWord: string | undefined;
  goToPreviousWord: () => void;
  goToNextWord: () => void;
  handleShowAnswer: () => void;
  handleSubmit: () => void;
  speakWord: (word: string) => void;
  setShowAnswer: (value: boolean) => void;
  setUserInput: (value: string) => void;
  setFeedbackMessage: (value: { text: string; type: string } | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useKeyboardShortcuts({
  sessionComplete,
  currentWordIndex,
  showAnswer,
  currentWord,
  goToPreviousWord,
  goToNextWord,
  handleShowAnswer,
  handleSubmit,
  speakWord,
  setShowAnswer,
  setUserInput,
  setFeedbackMessage,
  inputRef,
}: UseKeyboardShortcutsProps): void {
  // Previous word
  useHotkeys(
    "left",
    (e) => {
      if (!sessionComplete && currentWordIndex > 0) {
        e.preventDefault();
        goToPreviousWord();
      }
    },
    { enableOnFormTags: true },
    [sessionComplete, currentWordIndex, goToPreviousWord],
  );

  // Next word / Show answer
  useHotkeys(
    "right",
    (e) => {
      if (!sessionComplete) {
        e.preventDefault();
        if (showAnswer) {
          goToNextWord();
        } else {
          handleShowAnswer();
        }
      }
    },
    { enableOnFormTags: true },
    [sessionComplete, showAnswer, goToNextWord, handleShowAnswer],
  );

  // Replay audio
  useHotkeys(
    "ctrl+space",
    (e) => {
      if (!sessionComplete && currentWord) {
        e.preventDefault();
        speakWord(currentWord);
      }
    },
    { enableOnFormTags: true },
    [sessionComplete, currentWord, speakWord],
  );

  // Submit / Next
  useHotkeys(
    "enter",
    (e) => {
      if (!sessionComplete) {
        e.preventDefault();
        if (showAnswer) {
          goToNextWord();
        } else {
          handleSubmit();
        }
      }
    },
    { enableOnFormTags: true },
    [sessionComplete, showAnswer, goToNextWord, handleSubmit],
  );

  // Reset / Clear
  useHotkeys(
    "esc",
    (e) => {
      if (!sessionComplete) {
        e.preventDefault();
        setShowAnswer(false);
        setUserInput("");
        setFeedbackMessage(null);
        inputRef.current?.focus();
      }
    },
    { enableOnFormTags: true },
    [
      sessionComplete,
      setShowAnswer,
      setUserInput,
      setFeedbackMessage,
      inputRef,
    ],
  );
}
