import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useState } from "react";
import { PracticeCard } from "@/components/practice/PracticeCard";
import { PracticeCardSkeleton } from "@/components/practice/PracticeCardSkeleton";
import { ResultsScreen } from "@/components/practice/ResultsScreen";
import { useKeyboardShortcuts } from "@/hooks/practice/useKeyboardShortcuts";
import { usePracticeSession } from "@/hooks/practice/usePracticeSession";
import { useSpeech } from "@/hooks/practice/useSpeech";
import { useCRPC } from "@/lib/convex/crpc";
import { calculateHint, getInputBorderClass } from "@/lib/utils";
import { store } from "@/store";
import { asId } from "@/types/types";

export const Route = createFileRoute("/practice/$listId")({
  component: PracticePage,
});

function PracticePage() {
  const { listId } = useParams({ from: "/practice/$listId" });
  const crpc = useCRPC();

  const typedListId = asId<"wordLists">(listId);

  const {
    data: list,
    isPending,
    error,
  } = useQuery(
    crpc.wordLists.getListById.queryOptions({ listId: typedListId })
  );

  const currentWordIndex = useStore(store, (state) => state.currentWordIndex);
  const audioEnabled = useStore(store, (state) => state.audioEnabled);
  const speechRate = useStore(store, (state) => state.speechRate);

  const words = list?.words ?? [];
  const [inputFocused, setInputFocused] = useState(false);

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
  } = usePracticeSession(typedListId, words, currentWordIndex);

  const currentWord = practiceWords[currentWordIndex];

  const { speakWord } = useSpeech(audioEnabled, speechRate, currentWord?.word);

  useKeyboardShortcuts({
    sessionComplete,
    currentWordIndex,
    showAnswer,
    currentWord: currentWord?.word,
    inputFocused,
    goToPreviousWord,
    goToNextWord,
    handleSubmit: () => {
      if (currentWord) {
        handleSubmit();
      }
    },
    handleShowAnswer,
    speakWord: (word) => speakWord(word),
    setShowAnswer,
    setUserInput,
    setFeedbackMessage,
    inputRef,
  });

  if (isPending) {
    return <PracticeCardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl text-red-400">
            Failed to load list
          </h1>
          <p className="mb-4 text-zinc-400">
            {error.message || "An unexpected error occurred"}
          </p>
          <Link
            className="text-zinc-400 transition-colors hover:text-white"
            to="/lists"
          >
            ← Back to lists
          </Link>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">List not found</h1>
          <Link
            className="text-zinc-400 transition-colors hover:text-white"
            to="/lists"
          >
            ← Back to lists
          </Link>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">No words to practice</h1>
          <p className="mb-4 text-zinc-400">
            Add some words to this list first
          </p>
          <Link
            className="text-zinc-400 transition-colors hover:text-white"
            params={{ listId: list.id }}
            to="/lists/$listId"
          >
            ← Back to list
          </Link>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <ResultsScreen
        onRestart={() => {
          resetSession();
          setPracticeWords([...words].sort(() => Math.random() - 0.5));
        }}
        results={results}
        totalWords={practiceWords.length}
      />
    );
  }

  if (!currentWord) {
    return <PracticeCardSkeleton />;
  }

  const hint = calculateHint(currentWord.word, attempts);
  const inputBorderClass = getInputBorderClass(
    showAnswer,
    hasAnsweredCorrectly,
    userInput,
    currentWord.word
  );

  return (
    <PracticeCard
      currentWord={currentWord}
      currentWordIndex={currentWordIndex}
      exitLink="/lists"
      feedbackMessage={feedbackMessage}
      hasAnsweredCorrectly={hasAnsweredCorrectly}
      hint={hint}
      inputBorderClass={inputBorderClass}
      inputRef={inputRef}
      onBlurInput={() => setInputFocused(false)}
      onFocusInput={() => setInputFocused(true)}
      onNextWord={goToNextWord}
      onPlayAudio={() => speakWord(currentWord.word)}
      onShowAnswer={handleShowAnswer}
      onSubmit={handleSubmit}
      setUserInput={setUserInput}
      showAnswer={showAnswer}
      totalWords={practiceWords.length}
      userInput={userInput}
    />
  );
}
