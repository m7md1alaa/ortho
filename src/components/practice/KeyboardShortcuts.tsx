import { Keyboard } from "lucide-react";

export function KeyboardShortcuts() {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return (
    <div className="mt-12 pt-8 border-t border-zinc-800">
      <div className="flex flex-col items-center gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          <span className="font-medium">Keyboard shortcuts:</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">Enter</kbd> Submit
          </span>
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">Tab</kbd> Show Answer
          </span>
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">Space</kbd> Replay
            <span className="text-zinc-600 text-xs ml-1">
              (when not typing)
            </span>
          </span>
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">
              {isMac ? "⌘" : "Ctrl"}+/
            </kbd>{" "}
            Focus
          </span>
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">
              {isMac ? "⌘" : "Alt"}+→
            </kbd>{" "}
            Next
          </span>
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">
              {isMac ? "⌘" : "Alt"}+←
            </kbd>{" "}
            Previous
          </span>
          <span>
            <kbd className="px-2 py-1 bg-zinc-800 rounded">Esc</kbd> Clear
          </span>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          Tip: Use Ctrl+Arrow to jump between words when typing
        </p>
      </div>
    </div>
  );
}
