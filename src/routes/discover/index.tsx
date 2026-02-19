import type { ApiOutputs } from "@convex/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { ListCardSkeleton } from "@/components/lists-skeleton";
import { PracticeSettingsDialog } from "@/components/practice/PracticeSettingsDialog";
import { Button } from "@/components/ui/button";
import { categoryColors, difficultyColors } from "@/lib/colors";
import { useCRPC } from "@/lib/convex/crpc";
import { getPublicLists } from "@/lib/convex/discover.server";

export const Route = createFileRoute("/discover/")({
  component: DiscoverPage,
  loader: async () => {
    const publicLists = await getPublicLists();
    return { publicLists };
  },
});

function PublicListCard({
  list,
  onPracticeOpen,
}: {
  list: ApiOutputs["wordLists"]["getPublicLists"][number];
  onPracticeOpen: () => void;
}) {
  return (
    <div className="group border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-xl text-zinc-100 transition-colors group-hover:text-white">
            {list.name}
          </h3>
          {list.description && (
            <p className="mt-1 text-sm text-zinc-500">{list.description}</p>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {list.category && (
          <span
            className={`px-3 py-1 font-medium text-xs ${
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

      <div className="mb-4 flex items-center gap-6 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>{list.wordCount} words</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          className="flex-1"
          params={{ listId: list.id }}
          to="/discover/$listId"
        >
          <Button className="w-full" size="sm" variant="outline">
            View Words
          </Button>
        </Link>
        <Button
          className="flex-1"
          onClick={onPracticeOpen}
          size="sm"
          type="button"
        >
          Practice
        </Button>
      </div>
    </div>
  );
}

function DiscoverPage() {
  const { publicLists: initialData } = Route.useLoaderData();
  const navigate = useNavigate();
  const crpc = useCRPC();

  const [practiceListId, setPracticeListId] = useState<string | null>(null);
  const [totalWords, setTotalWords] = useState(0);

  const { data: publicLists, isPending } = useQuery<
    ApiOutputs["wordLists"]["getPublicLists"]
  >({
    ...crpc.wordLists.getPublicLists.queryOptions({}),
    initialData,
  });

  const handlePracticeOpen = (
    list: ApiOutputs["wordLists"]["getPublicLists"][number]
  ) => {
    setPracticeListId(list.id);
    setTotalWords(list.wordCount);
  };

  const handleStartPractice = (settings: {
    wordCount: number;
    difficulty: string;
  }) => {
    setPracticeListId(null);
    navigate({
      to: "/practice/$listId",
      params: { listId: practiceListId ?? "" },
      search: {
        wordCount: settings.wordCount,
        difficulty: settings.difficulty,
      },
    });
  };

  function renderContent() {
    if (isPending || !publicLists) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ListCardSkeleton />
          <ListCardSkeleton />
          <ListCardSkeleton />
        </div>
      );
    }

    if (publicLists.length === 0) {
      return (
        <div className="border border-zinc-800 bg-zinc-900/30 py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <h3 className="mb-2 font-medium text-xl text-zinc-300">
            No public lists yet
          </h3>
          <p className="text-zinc-500">
            Check back soon for curated word lists
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publicLists.map((list) => (
            <PublicListCard
              key={list.id}
              list={list}
              onPracticeOpen={() => handlePracticeOpen(list)}
            />
          ))}
        </div>
        {practiceListId && (
          <PracticeSettingsDialog
            isOpen={practiceListId !== null}
            onClose={() => setPracticeListId(null)}
            onStartPractice={handleStartPractice}
            totalWords={totalWords}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            Discover Word Lists
          </h1>
          <p className="text-lg text-zinc-400">
            Browse public word lists created by the community
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
