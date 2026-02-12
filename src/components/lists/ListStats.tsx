import type { Word } from "@/types";

interface ListStatsProps {
  words: Word[];
}

export function ListStats({ words }: ListStatsProps) {
  const totalWords = words.length;
  const masteredWords = words.filter((w) => w.streak >= 5).length;
  const accuracy =
    totalWords > 0
      ? Math.round(
          (words.reduce((acc, w) => acc + w.correctCount, 0) /
            Math.max(
              words.reduce(
                (acc, w) => acc + w.correctCount + w.incorrectCount,
                0,
              ),
              1,
            )) *
            100,
        )
      : 0;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">List Stats</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Total Words</span>
          <span className="text-2xl font-bold">{totalWords}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Mastered</span>
          <span className="text-2xl font-bold text-green-400">
            {masteredWords}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Accuracy</span>
          <span className="text-2xl font-bold">{accuracy}%</span>
        </div>
      </div>
    </div>
  );
}
