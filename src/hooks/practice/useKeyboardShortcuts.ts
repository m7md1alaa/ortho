import { useHotkeys } from "react-hotkeys-hook";

export interface UseKeyboardShortcutsProps {
  sessionComplete: boolean;
  currentWordIndex: number;
  showAnswer: boolean;
  currentWord: string | undefined;
  inputFocused: boolean;
  goToPreviousWord: () => void;
  goToNextWord: () => void;
  handleShowAnswer: () => void;
  handleSubmit: () => void;
  speakWord: (word: string) => void;
  setShowAnswer: (value: boolean) => void;
  setUserInput: (value: string) => void;
  setFeedbackMessage: (
    value: {
      text: string;
      type: "success" | "error" | "neutral" | "close";
    } | null
  ) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useKeyboardShortcuts({
  sessionComplete,
  currentWordIndex,
  showAnswer,
  currentWord,
  inputFocused,
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
  // Submit / Next (Enter)
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
    [sessionComplete, showAnswer, goToNextWord, handleSubmit]
  );

  // Show answer (Tab - only when not showing answer)
  useHotkeys(
    "tab",
    (e) => {
      if (!(sessionComplete || showAnswer)) {
        e.preventDefault();
        handleShowAnswer();
      }
    },
    { enableOnFormTags: true },
    [sessionComplete, showAnswer, handleShowAnswer]
  );

  // Replay audio (Space - only when input is NOT focused)
  useHotkeys(
    "space",
    (e) => {
      if (!(sessionComplete || inputFocused) && currentWord) {
        e.preventDefault();
        speakWord(currentWord);
      }
    },
    { enableOnFormTags: false }, // Don't enable on form tags
    [sessionComplete, inputFocused, currentWord, speakWord]
  );

  // Next word with Cmd (Mac) / Alt (Windows) + Right Arrow (when showing answer)
  // This leaves Ctrl+Arrow free for text navigation (jump to word boundaries)
  useHotkeys(
    "alt+right",
    (e) => {
      if (!sessionComplete && showAnswer) {
        e.preventDefault();
        goToNextWord();
      }
    },
    { enableOnFormTags: true },
    [sessionComplete, showAnswer, goToNextWord]
  );

  // Previous word with Cmd (Mac) / Alt (Windows) + Left Arrow
  // This leaves Ctrl+Arrow free for text navigation (jump to word boundaries)
  useHotkeys(
    "alt+left",
    (e) => {
      if (!sessionComplete && currentWordIndex > 0) {
        e.preventDefault();
        goToPreviousWord();
      }
    },
    { enableOnFormTags: true },
    [sessionComplete, currentWordIndex, goToPreviousWord]
  );

  // Focus input field (Cmd/Ctrl + /)
  useHotkeys(
    "mod+/",
    (e) => {
      if (!sessionComplete) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    { enableOnFormTags: true },
    [sessionComplete, inputRef]
  );

  // Reset / Clear (Esc)
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
    [sessionComplete, setShowAnswer, setUserInput, setFeedbackMessage, inputRef]
  );
}
