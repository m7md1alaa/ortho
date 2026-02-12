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
