import { Keyboard } from "lucide-react";

export function KeyboardShortcuts() {
  return (
    <div className="mt-12 pt-8 border-t border-zinc-800">
      <div className="flex items-center justify-center gap-8 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          <span>Keyboard shortcuts:</span>
        </div>
        <div className="flex gap-4">
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">Enter</kbd> Submit
          </span>
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">Ctrl+Space</kbd>{" "}
            Replay
          </span>
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">→</kbd> Show Answer
          </span>
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">←</kbd> Previous
          </span>
        </div>
      </div>
    </div>
  );
}
