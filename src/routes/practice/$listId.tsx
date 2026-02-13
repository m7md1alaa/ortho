import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useState } from "react";
import { PracticeCard } from "@/components/practice/PracticeCard";
import { ResultsScreen } from "@/components/practice/ResultsScreen";
import { Spinner } from "@/components/ui/spinner";
import { useKeyboardShortcuts } from "@/hooks/practice/useKeyboardShortcuts";
import { usePracticeSession } from "@/hooks/practice/usePracticeSession";
import { useSpeech } from "@/hooks/practice/useSpeech";
import { calculateHint, getInputBorderClass } from "@/lib/utils";
import { store } from "@/store";

export const Route = createFileRoute("/practice/$listId")({
  component: PracticePage,
});

function PracticePage() {
  const { listId } = useParams({ from: "/practice/$listId" });
  const wordLists = useStore(store, (state) => state.wordLists);
  const currentWordIndex = useStore(store, (state) => state.currentWordIndex);
  const audioEnabled = useStore(store, (state) => state.audioEnabled);
  const speechRate = useStore(store, (state) => state.speechRate);

  const list = wordLists.find((l) => l.id === listId);

  const {
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
  } = usePracticeSession(listId, list?.words || [], currentWordIndex);

  const [inputFocused, setInputFocused] = useState(false);

  const currentWord = practiceWords[currentWordIndex];

  const { speakWord } = useSpeech(audioEnabled, speechRate, currentWord?.word);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    sessionComplete,
    currentWordIndex,
    showAnswer,
    currentWord: currentWord?.word,
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
  });

  // Calculate hint
  const hint = currentWord ? calculateHint(currentWord.word, attempts) : null;

  // Calculate input border class
  const inputBorderClass = getInputBorderClass(
    showAnswer,
    hasAnsweredCorrectly,
    userInput,
    currentWord?.word,
  );

  // Error states
  if (!list) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">List not found</h1>
          <Link
            to="/lists"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to lists
          </Link>
        </div>
      </div>
    );
  }

  if (list.words.length === 0) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No words to practice</h1>
          <p className="text-zinc-400 mb-4">
            Add some words to this list first
          </p>
          <Link
            to="/lists/$listId"
            params={{ listId: list.id }}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to list
          </Link>
        </div>
      </div>
    );
  }

  // Session complete screen
  if (sessionComplete) {
    return (
      <ResultsScreen
        results={results}
        totalWords={practiceWords.length}
        onRestart={() => {
          resetSession();
          setPracticeWords([...list.words].sort(() => Math.random() - 0.5));
        }}
      />
    );
  }

  // Main practice card
  if (!currentWord) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <PracticeCard
      currentWord={currentWord}
      currentWordIndex={currentWordIndex}
      totalWords={practiceWords.length}
      userInput={userInput}
      setUserInput={setUserInput}
      showAnswer={showAnswer}
      hasAnsweredCorrectly={hasAnsweredCorrectly}
      feedbackMessage={feedbackMessage}
      hint={hint}
      inputBorderClass={inputBorderClass}
      inputRef={inputRef}
      onSubmit={handleSubmit}
      onShowAnswer={handleShowAnswer}
      onNextWord={goToNextWord}
      onPlayAudio={() => speakWord(currentWord.word)}
      onFocusInput={() => setInputFocused(true)}
      onBlurInput={() => setInputFocused(false)}
      exitLink="/lists"
    />
  );
}
