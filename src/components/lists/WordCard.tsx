import { AlertCircle, CheckCircle, Edit2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWordEditor } from "@/hooks/useWordEditor";
import {
  calculateWordStats,
  getAccuracyColor,
  getDifficultyColor,
} from "@/lib/wordStats";
import type { Word } from "@/types/types";

interface WordCardProps {
  word: Word;
  index: number;
  onUpdate: (id: string, data: Partial<Word>) => void;
  onDelete: () => void;
}

export function WordCard({ word, index, onUpdate, onDelete }: WordCardProps) {
  const {
    isEditing,
    editWord,
    editDefinition,
    editExample,
    editDifficulty,
    setEditWord,
    setEditDefinition,
    setEditExample,
    setEditDifficulty,
    handleSave,
    handleCancel,
    startEditing,
  } = useWordEditor({
    word,
    onSave: (data) =>
      onUpdate(word.id, {
        word: data.word,
        definition: data.definition,
        example: data.example,
        difficulty: data.difficulty,
      }),
  });

  const stats = calculateWordStats(word);

  function speakWord() {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }

  if (isEditing) {
    return (
      <div className="group border border-zinc-700 bg-zinc-900/50 p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-zinc-600">#{index}</span>
            <input
              autoFocus
              className="flex-1 font-semibold text-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
              onChange={(e) => setEditWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              placeholder="Word"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              type="text"
              // biome-ignore lint/a11y/noAutofocus: Edit mode needs focus
              value={editWord}
            />
          </div>

          <input
            className="w-full text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
            onChange={(e) => setEditDefinition(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            placeholder="Definition (optional)"
            style={{
              border: "none",
              outline: "none",
              boxShadow: "none",
              background: "transparent",
            }}
            type="text"
            value={editDefinition}
          />

          <input
            className="w-full text-sm text-zinc-500 italic placeholder:text-zinc-600 focus:outline-none focus:ring-0"
            onChange={(e) => setEditExample(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            placeholder="Example sentence (optional)"
            style={{
              border: "none",
              outline: "none",
              boxShadow: "none",
              background: "transparent",
            }}
            type="text"
            value={editExample}
          />

          <div className="flex items-center justify-between pt-2">
            <Select
              onValueChange={(value) =>
                setEditDifficulty(value as "easy" | "medium" | "hard")
              }
              value={editDifficulty}
            >
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <CheckCircle className="mr-1 h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleCancel} size="sm" variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-sm text-zinc-600">#{index}</span>
            <h3 className="font-semibold text-xl text-zinc-100">{word.word}</h3>
            <Button
              onClick={speakWord}
              size="icon-xs"
              title="Listen"
              variant="ghost"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>

          {word.definition && (
            <p className="mb-2 text-zinc-400">{word.definition}</p>
          )}

          {word.example && (
            <p className="mb-3 text-sm text-zinc-500 italic">
              "{word.example}"
            </p>
          )}

          <div className="flex items-center gap-4 text-sm">
            <span
              className={`px-2 py-1 font-medium text-xs ${getDifficultyColor(
                word.difficulty
              )}`}
            >
              {word.difficulty}
            </span>

            {word.streak > 0 && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle className="h-4 w-4" />
                {word.streak} streak
              </span>
            )}

            {stats.totalAttempts > 0 && (
              <span
                className={`flex items-center gap-1 ${getAccuracyColor(stats.accuracy)}`}
              >
                <AlertCircle className="h-4 w-4" />
                {stats.accuracy}% accuracy
              </span>
            )}

            {word.nextReview && word.nextReview > Date.now() && (
              <span className="text-zinc-600">
                Next review: {new Date(word.nextReview).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            onClick={startEditing}
            size="icon-xs"
            title="Edit"
            variant="ghost"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <DeleteDialog
            buttonSize="icon-xs"
            itemName={word.word}
            onDelete={onDelete}
            title="Delete Word"
          />
        </div>
      </div>
    </div>
  );
}
