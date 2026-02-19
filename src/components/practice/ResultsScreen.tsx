import { Link } from "@tanstack/react-router";
import { RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PracticeResults } from "@/hooks/practice/usePracticeSession";

interface ResultsScreenProps {
  results: PracticeResults;
  totalWords: number;
  onRestart: () => void;
}

export function ResultsScreen({
  results,
  totalWords,
  onRestart,
}: ResultsScreenProps) {
  const accuracy = Math.round((results.correct / totalWords) * 100);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
      <div className="mx-4 w-full max-w-md">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <div className="mb-6">
            <Trophy
              className={`mx-auto h-16 w-16 ${
                accuracy >= 80
                  ? "text-yellow-400"
                  : accuracy >= 50
                    ? "text-zinc-400"
                    : "text-zinc-600"
              }`}
            />
          </div>

          <h1 className="mb-2 font-bold text-3xl">Session Complete!</h1>
          <p className="mb-8 text-zinc-400">Here's how you performed</p>

          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-zinc-800/50 p-4">
              <div className="mb-1 font-bold text-3xl text-green-400">
                {results.correct}
              </div>
              <div className="text-sm text-zinc-500">Correct</div>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4">
              <div className="mb-1 font-bold text-3xl text-red-400">
                {results.incorrect}
              </div>
              <div className="text-sm text-zinc-500">Incorrect</div>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4">
              <div className="mb-1 font-bold text-3xl text-zinc-400">
                {results.skipped}
              </div>
              <div className="text-sm text-zinc-500">Skipped</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-2 font-bold text-5xl">{accuracy}%</div>
            <div className="text-zinc-500">Accuracy</div>
          </div>

          <div className="space-y-3">
            <Button className="w-full" onClick={onRestart}>
              <RotateCcw className="h-4 w-4" />
              Practice Again
            </Button>
            <Link
              className="block w-full rounded-lg bg-zinc-800 px-6 py-3 text-center text-zinc-300 transition-colors hover:bg-zinc-700"
              to="/lists"
            >
              Back to Lists
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
