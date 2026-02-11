import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import {
  ArrowLeft,
  CheckCircle,
  Keyboard,
  RotateCcw,
  SkipForward,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  endPracticeSession,
  recordWordPractice,
  setCurrentWordIndex,
  startPracticeSession,
  store,
} from "@/store";

export const Route = createFileRoute("/practice/$listId")({
  component: PracticePage,
});

function PracticePage() {
  const { listId } = useParams({ from: "/practice/$listId" });
  const wordLists = useStore(store, (state) => state.wordLists);
  const currentSession = useStore(store, (state) => state.currentSession);
  const currentWordIndex = useStore(store, (state) => state.currentWordIndex);
  const audioEnabled = useStore(store, (state) => state.audioEnabled);
  const speechRate = useStore(store, (state) => state.speechRate);

  const list = wordLists.find((l) => l.id === listId);
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [results, setResults] = useState<{
    correct: number;
    incorrect: number;
    skipped: number;
  }>({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [practiceWords, setPracticeWords] = useState(list?.words || []);

  useEffect(() => {
    if (list && !currentSession) {
      startPracticeSession(listId);
      const words = [...list.words].sort(() => Math.random() - 0.5);
      setPracticeWords(words);
    }
  }, [list, listId, currentSession]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentWordIndex, sessionComplete]);

  const speakWord = useCallback(
    (word: string) => {
      if ("speechSynthesis" in window && audioEnabled) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = speechRate;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    },
    [audioEnabled, speechRate],
  );

  useEffect(() => {
    if (practiceWords[currentWordIndex] && !sessionComplete) {
      const timer = setTimeout(() => {
        speakWord(practiceWords[currentWordIndex].word);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, practiceWords, sessionComplete, speakWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionComplete) return;

      if (e.key === "ArrowLeft" && currentWordIndex > 0) {
        e.preventDefault();
        goToPreviousWord();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (showAnswer) {
          goToNextWord();
        } else {
          handleSkip();
        }
      } else if (e.key === " " && e.ctrlKey) {
        e.preventDefault();
        if (practiceWords[currentWordIndex]) {
          speakWord(practiceWords[currentWordIndex].word);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (showAnswer) {
          goToNextWord();
        } else {
          handleSubmit();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowAnswer(false);
        setUserInput("");
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWordIndex, showAnswer, userInput, practiceWords, sessionComplete]);

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

  if (sessionComplete) {
    return (
      <ResultsScreen
        results={results}
        totalWords={practiceWords.length}
        onRestart={() => {
          setSessionComplete(false);
          setResults({ correct: 0, incorrect: 0, skipped: 0 });
          setCurrentWordIndex(0);
          setUserInput("");
          setShowAnswer(false);
          setAttempts(0);
          startPracticeSession(listId);
          const words = [...list.words].sort(() => Math.random() - 0.5);
          setPracticeWords(words);
        }}
      />
    );
  }

  const currentWord = practiceWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / practiceWords.length) * 100;

  function handleSubmit() {
    if (!currentWord || !userInput.trim()) return;

    const isCorrect =
      userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (isCorrect) {
      recordWordPractice(currentWord.id, true, newAttempts, 0);
      setResults((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setShowAnswer(true);
    } else {
      if (newAttempts >= 2) {
        recordWordPractice(currentWord.id, false, newAttempts, 0);
        setResults((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
        setShowAnswer(true);
      }
    }
  }

  function handleSkip() {
    if (!currentWord) return;
    recordWordPractice(currentWord.id, false, attempts + 1, 0);
    setResults((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
    goToNextWord();
  }

  function goToNextWord() {
    if (currentWordIndex >= practiceWords.length - 1) {
      endPracticeSession();
      setSessionComplete(true);
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserInput("");
      setShowAnswer(false);
      setAttempts(0);
    }
  }

  function goToPreviousWord() {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setUserInput("");
      setShowAnswer(false);
      setAttempts(0);
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/lists"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Practice
            </Link>
            <span className="text-zinc-500">
              {currentWordIndex + 1} / {practiceWords.length}
            </span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-100 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 sm:p-12">
          <div className="text-center mb-8">
            <Button
              onClick={() => speakWord(currentWord.word)}
              variant="secondary"
              className="rounded-full mb-6"
            >
              <Volume2 className="w-5 h-5" />
              <span>Listen</span>
              <span className="text-muted-foreground text-sm">
                (Ctrl + Space)
              </span>
            </Button>

            {currentWord.definition && (
              <p className="text-zinc-400 text-lg mb-2">
                {currentWord.definition}
              </p>
            )}

            {currentWord.example && (
              <p className="text-zinc-500 italic">
                "{currentWord.example.replace(currentWord.word, "_____")}"
              </p>
            )}
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (showAnswer) {
                      goToNextWord();
                    } else {
                      handleSubmit();
                    }
                  }
                }}
                placeholder="Type the word you hear..."
                disabled={showAnswer}
                className={`w-full px-6 py-4 text-center text-2xl font-medium bg-zinc-800 border-2 rounded-xl focus:outline-none transition-all ${
                  showAnswer
                    ? userInput.toLowerCase() === currentWord.word.toLowerCase()
                      ? "border-green-500 text-green-400"
                      : "border-red-500 text-red-400"
                    : "border-zinc-700 focus:border-zinc-500"
                }`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />

              {showAnswer && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {userInput.toLowerCase() ===
                  currentWord.word.toLowerCase() ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {showAnswer &&
              userInput.toLowerCase() !== currentWord.word.toLowerCase() && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
                  <p className="text-red-400 text-center">
                    Correct spelling:{" "}
                    <span className="font-bold">{currentWord.word}</span>
                  </p>
                </div>
              )}

            <div className="flex gap-3 mt-6">
              {!showAnswer ? (
                <>
                  <Button
                    onClick={handleSubmit}
                    disabled={!userInput.trim()}
                    className="flex-1"
                  >
                    Submit (Enter)
                  </Button>
                  <Button onClick={handleSkip} variant="secondary">
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </Button>
                </>
              ) : (
                <Button onClick={goToNextWord} className="w-full">
                  {currentWordIndex >= practiceWords.length - 1
                    ? "Finish"
                    : "Next Word"}{" "}
                  →
                </Button>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-800">
            <div className="flex items-center justify-center gap-8 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                <span>Keyboard shortcuts:</span>
              </div>
              <div className="flex gap-4">
                <span>
                  <kbd className="px-2 py-1 bg-zinc-800 rounded">Enter</kbd>{" "}
                  Submit
                </span>
                <span>
                  <kbd className="px-2 py-1 bg-zinc-800 rounded">
                    Ctrl+Space
                  </kbd>{" "}
                  Replay
                </span>
                <span>
                  <kbd className="px-2 py-1 bg-zinc-800 rounded">→</kbd> Next
                </span>
                <span>
                  <kbd className="px-2 py-1 bg-zinc-800 rounded">←</kbd>{" "}
                  Previous
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({
  results,
  totalWords,
  onRestart,
}: {
  results: { correct: number; incorrect: number; skipped: number };
  totalWords: number;
  onRestart: () => void;
}) {
  const accuracy = Math.round((results.correct / totalWords) * 100);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="mb-6">
            <Trophy
              className={`w-16 h-16 mx-auto ${
                accuracy >= 80
                  ? "text-yellow-400"
                  : accuracy >= 50
                    ? "text-zinc-400"
                    : "text-zinc-600"
              }`}
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
          <p className="text-zinc-400 mb-8">Here's how you performed</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {results.correct}
              </div>
              <div className="text-sm text-zinc-500">Correct</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-red-400 mb-1">
                {results.incorrect}
              </div>
              <div className="text-sm text-zinc-500">Incorrect</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-zinc-400 mb-1">
                {results.skipped}
              </div>
              <div className="text-sm text-zinc-500">Skipped</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-5xl font-bold mb-2">{accuracy}%</div>
            <div className="text-zinc-500">Accuracy</div>
          </div>

          <div className="space-y-3">
            <Button onClick={onRestart} className="w-full">
              <RotateCcw className="w-4 h-4" />
              Practice Again
            </Button>
            <Link
              to="/lists"
              className="block w-full px-6 py-3 bg-zinc-800 text-zinc-300 text-center rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Back to Lists
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
