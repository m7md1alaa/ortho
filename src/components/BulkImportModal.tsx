import { AlertCircle, CheckCircle, FileUp, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { addWordsBulk, type BulkImportResult } from "@/store";

const MAX_WORDS = 300;

// Top-level regex literals for performance
const NUMBERED_LIST_REGEX = /^\s*[\d]+[.)]\s*/;
const BULLET_LIST_REGEX = /^[-•*]\s*/;
const MULTIPLE_SPACES_REGEX = /\s+/g;

interface BulkImportModalProps {
  listId: string;
  isOpen: boolean;
  onClose: () => void;
  existingWords: string[];
}

export function BulkImportModal({
  listId,
  isOpen,
  onClose,
  existingWords,
}: BulkImportModalProps) {
  const [inputText, setInputText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  const parsedWords = useMemo(() => {
    if (!inputText.trim()) {
      return [];
    }
    return inputText
      .split("\n")
      .map((line) => {
        return line
          .replace(NUMBERED_LIST_REGEX, "")
          .replace(BULLET_LIST_REGEX, "")
          .replace(MULTIPLE_SPACES_REGEX, " ")
          .trim();
      })
      .filter((line) => line.length > 0)
      .slice(0, MAX_WORDS);
  }, [inputText]);

  const duplicateCount = useMemo(() => {
    const existingSet = new Set(
      existingWords.map((w) => w.toLowerCase().trim())
    );
    return parsedWords.filter((word) => existingSet.has(word.toLowerCase()))
      .length;
  }, [parsedWords, existingWords]);

  const newWordsCount = parsedWords.length - duplicateCount;
  const isOverLimit = parsedWords.length >= MAX_WORDS;

  const handleImport = () => {
    if (parsedWords.length === 0) {
      return;
    }

    setIsImporting(true);

    const wordsToImport = parsedWords.map((word) => ({ word }));
    const importResult = addWordsBulk(listId, wordsToImport);

    setResult(importResult);
    setIsImporting(false);
  };

  const handleClose = () => {
    setInputText("");
    setResult(null);
    onClose();
  };

  const handleReset = () => {
    setInputText("");
    setResult(null);
  };

  if (result) {
    return (
      <Dialog onOpenChange={handleClose} open={isOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Import Complete
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Your words have been processed successfully.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-800/50 p-4 text-center">
                <div className="font-bold text-3xl text-green-400">
                  {result.added}
                </div>
                <div className="mt-1 text-sm text-zinc-400">Words Added</div>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-4 text-center">
                <div className="font-bold text-3xl text-yellow-400">
                  {result.skipped}
                </div>
                <div className="mt-1 text-sm text-zinc-400">
                  Duplicates Skipped
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={handleClose}
              variant="outline"
            >
              Done
            </Button>
            {result.added > 0 && (
              <Button
                className="flex-1 bg-zinc-100 text-black hover:bg-white"
                onClick={handleReset}
              >
                Import More
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100">
            <Upload className="h-5 w-5" />
            Bulk Import Words
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Paste words below, one per line. Maximum {MAX_WORDS} words.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">
                {parsedWords.length > 0 ? (
                  <>
                    <span className="font-medium text-zinc-100">
                      {parsedWords.length}
                    </span>{" "}
                    of {MAX_WORDS} words
                  </>
                ) : (
                  "Enter words to import"
                )}
              </span>
              {isOverLimit && (
                <span className="text-xs text-yellow-400">Limit reached</span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isOverLimit ? "bg-yellow-400" : "bg-zinc-100"
                )}
                style={{
                  width: `${Math.min((parsedWords.length / MAX_WORDS) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <Textarea
              className="min-h-[200px] resize-none border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
              disabled={isImporting}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste words here, one per line...&#10;apple&#10;banana&#10;cherry"
              value={inputText}
            />
            {inputText && (
              <Button
                className="absolute top-2 right-2 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
                onClick={() => setInputText("")}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Stats */}
          {parsedWords.length > 0 && (
            <div className="flex items-center gap-3">
              <Badge
                className="border-green-800 bg-green-900/30 text-green-400"
                variant="secondary"
              >
                {newWordsCount} new
              </Badge>
              {duplicateCount > 0 && (
                <Badge
                  className="border-yellow-800 bg-yellow-900/30 text-yellow-400"
                  variant="secondary"
                >
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {duplicateCount} duplicates
                </Badge>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="space-y-1 text-xs text-zinc-500">
            <p>• One word per line</p>
            <p>
              • Numbers (1., 2), bullets (-, •, *), and extra spaces are
              auto-removed
            </p>
            <p>• Duplicates will be skipped automatically</p>
            <p>• All imported words will have "medium" difficulty</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            disabled={isImporting}
            onClick={handleClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-zinc-100 text-black hover:bg-white disabled:opacity-50"
            disabled={parsedWords.length === 0}
            loading={isImporting}
            onClick={handleImport}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import {newWordsCount > 0 && `${newWordsCount} `}Words
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
