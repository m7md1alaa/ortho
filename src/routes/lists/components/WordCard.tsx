import { AlertCircle, CheckCircle, Edit2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { Word } from "@/types";
import { DeleteWordDialog } from "./DeleteWordDialog";

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
      <div className="group bg-zinc-900/50 border border-zinc-700 rounded-xl p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-zinc-600 text-sm font-mono">#{index}</span>
            <input
              type="text"
              value={editWord}
              onChange={(e) => setEditWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              className="flex-1 text-xl font-semibold text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
              placeholder="Word"
              // biome-ignore lint/a11y/noAutofocus: Edit mode needs focus
              autoFocus
            />
          </div>

          <input
            type="text"
            value={editDefinition}
            onChange={(e) => setEditDefinition(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            style={{
              border: "none",
              outline: "none",
              boxShadow: "none",
              background: "transparent",
            }}
            className="w-full text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
            placeholder="Definition (optional)"
          />

          <input
            type="text"
            value={editExample}
            onChange={(e) => setEditExample(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            style={{
              border: "none",
              outline: "none",
              boxShadow: "none",
              background: "transparent",
            }}
            className="w-full text-zinc-500 italic text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-0"
            placeholder="Example sentence (optional)"
          />

          <div className="flex items-center justify-between pt-2">
            <Select
              value={editDifficulty}
              onValueChange={(value) =>
                setEditDifficulty(value as "easy" | "medium" | "hard")
              }
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-zinc-600 text-sm font-mono">#{index}</span>
            <h3 className="text-xl font-semibold text-zinc-100">{word.word}</h3>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={speakWord}
              title="Listen"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          {word.definition && (
            <p className="text-zinc-400 mb-2">{word.definition}</p>
          )}

          {word.example && (
            <p className="text-zinc-500 italic text-sm mb-3">
              "{word.example}"
            </p>
          )}

          <div className="flex items-center gap-4 text-sm">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                word.difficulty,
              )}`}
            >
              {word.difficulty}
            </span>

            {word.streak > 0 && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                {word.streak} streak
              </span>
            )}

            {stats.totalAttempts > 0 && (
              <span
                className={`flex items-center gap-1 ${getAccuracyColor(stats.accuracy)}`}
              >
                <AlertCircle className="w-4 h-4" />
                {stats.accuracy}% accuracy
              </span>
            )}

            {word.nextReview && word.nextReview > new Date() && (
              <span className="text-zinc-600">
                Next review: {word.nextReview.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={startEditing}
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <DeleteWordDialog word={word.word} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}
