import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { Authenticated } from "better-convex/react";
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
    onSubmit: ({ value }) => {
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
    <Authenticated>
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="mb-4 font-bold text-4xl tracking-tight">
              Word Lists
            </h1>
            <p className="text-lg text-zinc-400">
              Create and manage your spelling practice lists
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-lg">
                  <Plus className="h-5 w-5" />
                  Create New List
                </h2>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                >
                  <form.Field name="name">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={nameId}>List Name</Label>
                        <Input
                          id={nameId}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., GRE Vocabulary"
                          type="text"
                          value={field.state.value}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-destructive text-sm">
                            {field.state.meta.errors[0]?.message}
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
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Brief description of this list..."
                          rows={3}
                          value={field.state.value}
                        />
                      </div>
                    )}
                  </form.Field>

                  <Button
                    className="w-full"
                    disabled={form.state.isSubmitting}
                    type="submit"
                  >
                    Create List
                  </Button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              {wordLists.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                  <h3 className="mb-2 font-medium text-xl text-zinc-300">
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
    </Authenticated>
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
            0
          ) /
            Math.max(
              list.words.reduce(
                (acc: number, w: Word) =>
                  acc + w.correctCount + w.incorrectCount,
                0
              ),
              1
            )) *
            100
        )
      : 0;

  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <Link
            className="font-semibold text-xl text-zinc-100 transition-colors hover:text-white"
            params={{ listId: list.id }}
            to="/lists/$listId"
          >
            {list.name}
          </Link>
          {list.description && (
            <p className="mt-1 text-sm text-zinc-500">{list.description}</p>
          )}
        </div>
        <Button
          className="opacity-0 hover:text-destructive group-hover:opacity-100"
          onClick={() => deleteWordList(list.id)}
          size="icon-sm"
          title="Delete list"
          variant="ghost"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-6 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>{totalWords} words</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span>{masteredWords} mastered</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{accuracy}% accuracy</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-center font-medium text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
          params={{ listId: list.id }}
          to="/lists/$listId"
        >
          Edit Words
        </Link>
        <Link
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-center font-medium text-black text-sm transition-colors hover:bg-white"
          params={{ listId: list.id }}
          to="/practice/$listId"
        >
          Practice
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
