import type { Id } from "@convex/dataModel";
import type { ApiOutputs } from "@convex/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryColors, difficultyColors } from "@/lib/colors";
import { useCRPC } from "@/lib/convex/crpc";
import { getPublicListById } from "@/lib/convex/discover";

export const Route = createFileRoute("/discover/$listId")({
  component: PublicListDetailPage,
  loader: async ({ params }) => {
    const list = await getPublicListById({
      data: { listId: params.listId as Id<"wordLists"> },
    });
    return { list };
  },
});

function PublicListDetailPage() {
  const { listId } = useParams({ from: "/discover/$listId" });
  const { list: initialData } = Route.useLoaderData();
  const crpc = useCRPC();

  const { data: list, isPending } = useQuery<
    ApiOutputs["wordLists"]["getPublicListById"]
  >({
    ...crpc.wordLists.getPublicListById.queryOptions({
      listId: listId as Id<"wordLists">,
    }),
    initialData,
  });

  if (isPending) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-8 h-8 w-1/3 rounded bg-zinc-800" />
            <div className="mb-4 h-4 w-1/2 rounded bg-zinc-800" />
            <div className="space-y-3">
              {[...new Array(5)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <div className="h-12 rounded bg-zinc-800" key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
            <h3 className="mb-2 font-medium text-xl text-zinc-300">
              List not found
            </h3>
            <p className="mb-6 text-zinc-500">
              This list may have been removed or is not public
            </p>
            <Link to="/discover">
              <Button variant="outline">Back to Discover</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          to="/discover"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {list.category && (
              <span
                className={`rounded-full px-3 py-1 font-medium text-xs ${
                  categoryColors[list.category] || categoryColors.General
                }`}
              >
                {list.category}
              </span>
            )}
            {list.difficulty && (
              <span
                className={`font-medium text-xs capitalize ${
                  difficultyColors[list.difficulty] || "text-zinc-400"
                }`}
              >
                {list.difficulty}
              </span>
            )}
          </div>

          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            {list.name}
          </h1>

          {list.description && (
            <p className="mb-6 text-lg text-zinc-400">{list.description}</p>
          )}

          <div className="mb-6 flex items-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{list.words.length} words</span>
            </div>
          </div>

          <Link params={{ listId }} to="/practice/$listId">
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Practice This List
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="border-zinc-800 border-b px-6 py-4">
            <h2 className="font-semibold text-lg">Words in this list</h2>
          </div>

          <div className="divide-y divide-zinc-800">
            {list.words.map((word, index) => (
              <div
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-zinc-800/50"
                key={word.id}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-medium text-sm text-zinc-400">
                  {index + 1}
                </span>
                <span className="font-medium text-lg text-zinc-200">
                  {word.word}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
