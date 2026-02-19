import type { Id } from "@convex/dataModel";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useAuth } from "better-convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PracticeCard } from "@/components/practice/PracticeCard";
import { PracticeCardSkeleton } from "@/components/practice/PracticeCardSkeleton";
import { ResultsScreen } from "@/components/practice/ResultsScreen";
import { useKeyboardShortcuts } from "@/hooks/practice/useKeyboardShortcuts";
import { usePracticeSession } from "@/hooks/practice/usePracticeSession";
import { useSpeech } from "@/hooks/practice/useSpeech";
import { useCRPC } from "@/lib/convex/crpc";
import { getPublicListById } from "@/lib/convex/discover";
import { calculateHint, getInputBorderClass } from "@/lib/utils";
import { store } from "@/store";
import { asId, type Word } from "@/types/types";

export const Route = createFileRoute("/practice/$listId")({
  component: PracticePage,
  loader: async ({ params }) => {
    try {
      const list = await getPublicListById({
        data: { listId: params.listId as Id<"wordLists"> },
      });
      return { list, error: null };
    } catch (error) {
      console.error("Practice loader error:", error);
      return {
        list: null,
        error: null,
      };
    }
  },
});

function PracticePage() {
  const { listId } = useParams({ from: "/practice/$listId" });
  const loaderData = Route.useLoaderData();
  const crpc = useCRPC();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [hasRedirected, setHasRedirected] = useState(false);

  // Track if we're on the client to avoid hydration mismatches
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const typedListId = asId<"wordLists">(listId);

  // For authenticated users: use reactive query with full data
  // Only enable after hydration to avoid mismatches
  const { data: authList, isPending: isAuthPending } = useQuery({
    ...crpc.wordLists.getListById.queryOptions({ listId: typedListId }),
    enabled: isClient && isAuthenticated,
  });

  // Use auth data if available and we're on client, otherwise fall back to loader data
  const list = isClient && isAuthenticated ? authList : loaderData?.list;
  const isPending =
    isAuthLoading || (isClient && isAuthenticated && isAuthPending);

  const currentWordIndex = useStore(store, (state) => state.currentWordIndex);
  const audioEnabled = useStore(store, (state) => state.audioEnabled);
  const speechRate = useStore(store, (state) => state.speechRate);

  // Map words to the expected format - public lists have minimal word data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const words: Word[] =
    list?.words.map(
      (w: { id: Id<"words">; word: string } | Word): Word =>
        "correctCount" in w
          ? (w as Word)
          : ({
              id: w.id,
              word: w.word,
              correctCount: 0,
              createdAt: Date.now(),
              difficulty: "medium" as const,
              incorrectCount: 0,
              lastPracticed: undefined,
              listId: typedListId,
              practiceCount: 0,
              streak: 0,
              updatedAt: Date.now(),
              userId: undefined as unknown as Id<"user">,
            } as Word)
    ) ?? [];

  // Redirect to list page if no words and not already redirected
  useEffect(() => {
    if (isClient && words.length === 0 && list && !hasRedirected) {
      setHasRedirected(true);
      toast.error("Add some words to this list first");
      navigate({ to: "/lists/$listId", params: { listId: list.id } });
    }
  }, [isClient, words.length, list, hasRedirected, navigate]);
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
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center py-20">
          <PracticeCardSkeleton />
        </div>
      </div>
    );
  }

  if (loaderData?.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl text-red-400">
            Failed to load list
          </h1>
          <p className="mb-4 text-zinc-400">{loaderData.error}</p>
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

  if (sessionComplete) {
    return (
      <>
        {!isAuthenticated && (
          <div className="border-zinc-800 border-b bg-zinc-900/50 px-4 py-3">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <p className="text-sm text-zinc-400">
                Sign in to save your progress and track your improvement over
                time
              </p>
              <Link
                className="rounded bg-zinc-800 px-3 py-1 font-medium text-sm text-white transition-colors hover:bg-zinc-700"
                to="/auth"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
        <ResultsScreen
          onRestart={() => {
            resetSession();
            setPracticeWords([...words].sort(() => Math.random() - 0.5));
          }}
          results={results}
          totalWords={practiceWords.length}
        />
      </>
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
    <>
      {!isAuthenticated && (
        <div className="border-zinc-800 border-b bg-zinc-900/50 px-4 py-3">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <p className="text-sm text-zinc-400">
              Sign in to save your progress
            </p>
            <Link
              className="rounded bg-zinc-800 px-3 py-1 font-medium text-sm text-white transition-colors hover:bg-zinc-700"
              to="/auth"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

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
    </>
  );
}
