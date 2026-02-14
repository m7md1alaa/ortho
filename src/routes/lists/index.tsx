import type { ApiOutputs } from "@convex/types";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Authenticated, useAuth } from "better-convex/react";
import { ArrowRight, BookOpen, Plus, Trash2 } from "lucide-react";
import { useEffect, useId } from "react";
import { z } from "zod";
import { ListCardSkeleton } from "@/components/lists-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCRPC } from "@/lib/convex/crpc";

const listFormSchema = z.object({
  name: z.string().min(1, "List name is required"),
  description: z.string(),
});

function ListsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const crpc = useCRPC();
  const queryClient = useQueryClient();

  const nameId = useId();
  const descriptionId = useId();

  const {
    data: wordLists,
    isPending,
    error,
  } = useQuery<ApiOutputs["wordLists"]["getUserLists"]>(
    crpc.wordLists.getUserLists.queryOptions({})
  );

  useEffect(() => {
    if (error?.message?.includes("UNAUTHORIZED")) {
      navigate({ to: "/auth" });
    }
  }, [error, navigate]);

  const createList = useMutation(
    crpc.wordLists.createList.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          crpc.wordLists.getUserLists.queryFilter()
        );
      },
    })
  );

  const deleteList = useMutation(
    crpc.wordLists.deleteList.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          crpc.wordLists.getUserLists.queryFilter()
        );
      },
    })
  );

  useEffect(() => {
    if (!(isLoading || isAuthenticated)) {
      navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onSubmit: listFormSchema,
    },
    onSubmit: ({ value }) => {
      createList.mutate({
        name: value.name,
        description: value.description,
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
              {isPending || !wordLists ? (
                <div className="space-y-4">
                  <ListCardSkeleton />
                  <ListCardSkeleton />
                  <ListCardSkeleton />
                </div>
              ) : (
                <ListContent onDelete={deleteList} wordLists={wordLists} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}

function ListCard({
  list,
  onDelete,
}: {
  list: ApiOutputs["wordLists"]["getUserLists"][number];
  onDelete: () => void;
}) {
  const totalWords = list.wordCount;
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
          onClick={onDelete}
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

function ListContent({
  wordLists,
  onDelete,
}: {
  wordLists: ApiOutputs["wordLists"]["getUserLists"];
  onDelete: ReturnType<typeof useMutation>;
}) {
  if (wordLists.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
        <h3 className="mb-2 font-medium text-xl text-zinc-300">No lists yet</h3>
        <p className="text-zinc-500">
          Create your first word list to start practicing
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {wordLists.map(
        (list: ApiOutputs["wordLists"]["getUserLists"][number]) => (
          <ListCard
            key={list.id}
            list={list}
            onDelete={() => onDelete.mutate({ listId: list.id })}
          />
        )
      )}
    </div>
  );
}

export const Route = createFileRoute("/lists/")({
  component: ListsPage,
});
