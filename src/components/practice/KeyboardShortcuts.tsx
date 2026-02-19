import { Keyboard } from "lucide-react";

export function KeyboardShortcuts() {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return (
    <div className="mt-12 border-zinc-800 border-t pt-8">
      <div className="flex flex-col items-center gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Keyboard className="h-4 w-4" />
          <span className="font-medium">Keyboard shortcuts:</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <span>
            <kbd className="rounded bg-zinc-800 px-2 py-1">Enter</kbd> Submit
          </span>
          <span>
            <kbd className="rounded bg-zinc-800 px-2 py-1">Tab</kbd> Show Answer
          </span>
          <span>
            <kbd className="rounded bg-zinc-800 px-2 py-1">Space</kbd> Replay
            <span className="ml-1 text-xs text-zinc-600">
              (when not typing)
            </span>
          </span>
          <span>
            <kbd className="rounded bg-zinc-800 px-2 py-1">
              {isMac ? "⌘" : "Ctrl"}+/
            </kbd>{" "}
            Focus
          </span>
          <span>
            <kbd className="rounded bg-zinc-800 px-2 py-1">
              {isMac ? "⌘" : "Alt"}+→
            </kbd>{" "}
            Next
          </span>
          <span>
            <kbd className="rounded bg-zinc-800 px-2 py-1">
              {isMac ? "⌘" : "Alt"}+←
            </kbd>{" "}
            Previous
          </span>
          <span>
            <kbd className="rounded bg-zinc-800 px-2 py-1">Esc</kbd> Clear
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-600">
          Tip: Use Ctrl+Arrow to jump between words when typing
        </p>
      </div>
    </div>
  );
}
