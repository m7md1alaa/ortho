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
    if (!inputText.trim()) return [];
    return inputText
      .split("\n")
      .map((line) => {
        return line
          .replace(/^\s*[\d]+[.)]\s*/, "")
          .replace(/^[-•*]\s*/, "")
          .replace(/\s+/g, " ")
          .trim();
      })
      .filter((line) => line.length > 0)
      .slice(0, MAX_WORDS);
  }, [inputText]);

  const duplicateCount = useMemo(() => {
    const existingSet = new Set(
      existingWords.map((w) => w.toLowerCase().trim()),
    );
    return parsedWords.filter((word) => existingSet.has(word.toLowerCase()))
      .length;
  }, [parsedWords, existingWords]);

  const newWordsCount = parsedWords.length - duplicateCount;
  const isOverLimit = parsedWords.length >= MAX_WORDS;

  const handleImport = async () => {
    if (parsedWords.length === 0) return;

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
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Import Complete
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Your words have been processed successfully.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {result.added}
                </div>
                <div className="text-sm text-zinc-400 mt-1">Words Added</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {result.skipped}
                </div>
                <div className="text-sm text-zinc-400 mt-1">
                  Duplicates Skipped
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Done
            </Button>
            {result.added > 0 && (
              <Button
                onClick={handleReset}
                className="flex-1 bg-zinc-100 text-black hover:bg-white"
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100">
            <Upload className="w-5 h-5" />
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
                    <span className="text-zinc-100 font-medium">
                      {parsedWords.length}
                    </span>{" "}
                    of {MAX_WORDS} words
                  </>
                ) : (
                  "Enter words to import"
                )}
              </span>
              {isOverLimit && (
                <span className="text-yellow-400 text-xs">Limit reached</span>
              )}
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isOverLimit ? "bg-yellow-400" : "bg-zinc-100",
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
              placeholder="Paste words here, one per line...&#10;apple&#10;banana&#10;cherry"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none"
              disabled={isImporting}
            />
            {inputText && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setInputText("")}
                className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Stats */}
          {parsedWords.length > 0 && (
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-green-900/30 text-green-400 border-green-800"
              >
                {newWordsCount} new
              </Badge>
              {duplicateCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-900/30 text-yellow-400 border-yellow-800"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {duplicateCount} duplicates
                </Badge>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-zinc-500 space-y-1">
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
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedWords.length === 0 || isImporting}
            className="flex-1 bg-zinc-100 text-black hover:bg-white disabled:opacity-50"
          >
            {isImporting ? (
              "Importing..."
            ) : (
              <>
                <FileUp className="w-4 h-4 mr-2" />
                Import {newWordsCount > 0 && `${newWordsCount} `}Words
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
