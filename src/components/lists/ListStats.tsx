import type { Word } from "@/types/types";

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
                0
              ),
              1
            )) *
            100
        )
      : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="mb-4 font-semibold text-lg">List Stats</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Total Words</span>
          <span className="font-bold text-2xl">{totalWords}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Mastered</span>
          <span className="font-bold text-2xl text-green-400">
            {masteredWords}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Accuracy</span>
          <span className="font-bold text-2xl">{accuracy}%</span>
        </div>
      </div>
    </div>
  );
}
