import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { useId } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addWordList, deleteWordList, store } from "@/store";
import type { Word, WordList } from "@/types";

export const Route = createFileRoute("/lists/")({
  component: ListsPage,
});

const listFormSchema = z.object({
  name: z.string().min(1, "List name is required"),
  description: z.string(),
});

function ListsPage() {
  const wordLists = useStore(store, (state) => state.wordLists);
  const nameId = useId();
  const descriptionId = useId();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onSubmit: listFormSchema,
    },
    onSubmit: async ({ value }) => {
      addWordList({
        name: value.name,
        description: value.description,
        words: [],
        totalPracticeTime: 0,
      });
      form.reset();
    },
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Word Lists</h1>
          <p className="text-zinc-400 text-lg">
            Create and manage your spelling practice lists
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New List
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-4"
              >
                <form.Field name="name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={nameId}>List Name</Label>
                      <Input
                        id={nameId}
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., GRE Vocabulary"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="description">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={descriptionId}>
                        Description (optional)
                      </Label>
                      <Textarea
                        id={descriptionId}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Brief description of this list..."
                        rows={3}
                      />
                    </div>
                  )}
                </form.Field>

                <Button
                  type="submit"
                  disabled={form.state.isSubmitting}
                  className="w-full"
                >
                  Create List
                </Button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            {wordLists.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-zinc-300 mb-2">
                  No lists yet
                </h3>
                <p className="text-zinc-500">
                  Create your first word list to start practicing
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {wordLists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListCard({ list }: { list: WordList }) {
  const totalWords = list.words.length;
  const masteredWords = list.words.filter((w) => w.streak >= 5).length;
  const accuracy =
    totalWords > 0
      ? Math.round(
          (list.words.reduce(
            (acc: number, w: Word) => acc + w.correctCount,
            0,
          ) /
            Math.max(
              list.words.reduce(
                (acc: number, w: Word) =>
                  acc + w.correctCount + w.incorrectCount,
                0,
              ),
              1,
            )) *
            100,
        )
      : 0;

  return (
    <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            to="/lists/$listId"
            params={{ listId: list.id }}
            className="text-xl font-semibold text-zinc-100 hover:text-white transition-colors"
          >
            {list.name}
          </Link>
          {list.description && (
            <p className="text-zinc-500 mt-1 text-sm">{list.description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => deleteWordList(list.id)}
          className="opacity-0 group-hover:opacity-100 hover:text-destructive"
          title="Delete list"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-6 text-sm text-zinc-500 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>{totalWords} words</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span>{masteredWords} mastered</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{accuracy}% accuracy</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/lists/$listId"
          params={{ listId: list.id }}
          className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 text-center rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium"
        >
          Edit Words
        </Link>
        <Link
          to="/practice/$listId"
          params={{ listId: list.id }}
          className="flex-1 px-4 py-2 bg-zinc-100 text-black text-center rounded-lg hover:bg-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          Practice
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
