import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle,
  Edit2,
  Plus,
  Save,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addWord, deleteWord, store, updateWord } from "@/store";
import type { Word } from "@/types";

export const Route = createFileRoute("/lists/$listId")({
  component: ListDetailPage,
});

const wordFormSchema = z.object({
  word: z.string().min(1, "Word is required"),
  definition: z.string(),
  example: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

type WordFormData = z.infer<typeof wordFormSchema>;

function ListDetailPage() {
  const { listId } = useParams({ from: "/lists/$listId" });
  const wordLists = useStore(store, (state) => state.wordLists);
  const list = wordLists.find((l) => l.id === listId);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  if (!list) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">List not found</h1>
          <Link
            to="/lists"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to lists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/lists"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to lists
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {list.name}
          </h1>
          {list.description && (
            <p className="text-zinc-400 text-lg">{list.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">List Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total Words</span>
                  <span className="text-2xl font-bold">
                    {list.words.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Mastered</span>
                  <span className="text-2xl font-bold text-green-400">
                    {list.words.filter((w) => w.streak >= 5).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Accuracy</span>
                  <span className="text-2xl font-bold">
                    {list.words.length > 0
                      ? Math.round(
                          (list.words.reduce(
                            (acc, w) => acc + w.correctCount,
                            0,
                          ) /
                            Math.max(
                              list.words.reduce(
                                (acc, w) =>
                                  acc + w.correctCount + w.incorrectCount,
                                0,
                              ),
                              1,
                            )) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/practice/$listId"
              params={{ listId: list.id }}
              className="block w-full px-4 py-3 bg-zinc-100 text-black text-center rounded-lg hover:bg-white transition-colors font-medium"
            >
              Start Practice Session
            </Link>

            {(isAdding || editingWord) && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingWord ? "Edit Word" : "Add New Word"}
                </h3>
                <WordForm
                  word={editingWord}
                  onSubmit={(data) => {
                    if (editingWord) {
                      updateWord(listId, editingWord.id, data);
                      setEditingWord(null);
                    } else {
                      addWord(listId, {
                        ...data,
                        correctCount: 0,
                        incorrectCount: 0,
                        streak: 0,
                      });
                      setIsAdding(false);
                    }
                  }}
                  onCancel={() => {
                    setIsAdding(false);
                    setEditingWord(null);
                  }}
                />
              </div>
            )}

            {!isAdding && !editingWord && (
              <Button
                onClick={() => setIsAdding(true)}
                className="w-full"
                variant="secondary"
              >
                <Plus className="w-5 h-5" />
                Add Word
              </Button>
            )}
          </div>

          <div className="lg:col-span-2">
            {list.words.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                <Brain className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-zinc-300 mb-2">
                  No words yet
                </h3>
                <p className="text-zinc-500">
                  Add your first word to start practicing
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {list.words.map((word, index) => (
                  <WordCard
                    key={word.id}
                    word={word}
                    index={index + 1}
                    onEdit={() => setEditingWord(word)}
                    onDelete={() => deleteWord(listId, word.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WordForm({
  word,
  onSubmit,
  onCancel,
}: {
  word: Word | null;
  onSubmit: (data: WordFormData) => void;
  onCancel: () => void;
}) {
  const wordId = useId();
  const definitionId = useId();
  const exampleId = useId();
  const form = useForm({
    defaultValues: {
      word: word?.word || "",
      definition: word?.definition || "",
      example: word?.example || "",
      difficulty: word?.difficulty || "medium",
    },
    validators: {
      onSubmit: wordFormSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="word">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={wordId}>Word *</Label>
            <Input
              id={wordId}
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter the word"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="definition">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={definitionId}>Definition</Label>
            <Textarea
              id={definitionId}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="What does this word mean?"
              rows={2}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="example">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={exampleId}>Example Sentence</Label>
            <Textarea
              id={exampleId}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Use the word in a sentence..."
              rows={2}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="difficulty">
        {(field) => (
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={field.state.value}
              onValueChange={(value) =>
                field.handleChange(value as "easy" | "medium" | "hard")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={form.state.isSubmitting}
          className="flex-1"
        >
          <Save className="w-4 h-4" />
          {word ? "Update" : "Add"} Word
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

function WordCard({
  word,
  index,
  onEdit,
  onDelete,
}: {
  word: Word;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const speakWord = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const totalAttempts = word.correctCount + word.incorrectCount;
  const accuracy =
    totalAttempts > 0
      ? Math.round((word.correctCount / totalAttempts) * 100)
      : 0;

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
              className={`px-2 py-1 rounded text-xs font-medium ${
                word.difficulty === "easy"
                  ? "bg-green-900/30 text-green-400"
                  : word.difficulty === "medium"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-red-900/30 text-red-400"
              }`}
            >
              {word.difficulty}
            </span>

            {word.streak > 0 && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                {word.streak} streak
              </span>
            )}

            {totalAttempts > 0 && (
              <span
                className={`flex items-center gap-1 ${
                  accuracy >= 80
                    ? "text-green-400"
                    : accuracy >= 50
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                {accuracy}% accuracy
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
          <Button variant="ghost" size="icon-xs" onClick={onEdit} title="Edit">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            title="Delete"
            className="hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
