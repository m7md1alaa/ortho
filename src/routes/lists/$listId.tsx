import type { ApiOutputs } from "@convex/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { Brain, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { BulkImportModal } from "@/components/BulkImportModal";
import { ListHeader } from "@/components/lists/ListHeader";
import { ListNotFound } from "@/components/lists/ListNotFound";
import { ListStats } from "@/components/lists/ListStats";
import { WordCard } from "@/components/lists/WordCard";
import { WordForm } from "@/components/lists/WordForm";
import { PracticeSettingsDialog } from "@/components/practice/PracticeSettingsDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCRPC } from "@/lib/convex/crpc";
import type { Difficulty, Word } from "@/types/types";
import { asId } from "@/types/types";

type ListWithWords = ApiOutputs["wordLists"]["getListById"];

export const Route = createFileRoute("/lists/$listId")({
  component: ListDetailPage,
});

function ListDetailPage() {
  const { listId } = useParams({ from: "/lists/$listId" });
  const navigate = useNavigate();
  const crpc = useCRPC();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPracticeSettingsOpen, setIsPracticeSettingsOpen] = useState(false);

  const handleStartPractice = (settings: {
    wordCount: number;
    difficulty: string;
  }) => {
    setIsPracticeSettingsOpen(false);
    navigate({
      to: "/practice/$listId",
      params: { listId },
      search: {
        wordCount: settings.wordCount,
        difficulty: settings.difficulty,
      },
    });
  };

  const typedListId = asId<"wordLists">(listId);

  // Fetch list data
  const {
    data: list,
    isPending,
    error,
  } = useQuery(
    crpc.wordLists.getListById.queryOptions({ listId: typedListId })
  );

  // Setup mutations
  const updateListMutation = useMutation(
    crpc.wordLists.updateList.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(crpc.wordLists.getListById.queryFilter());
      },
    })
  );

  const updateWordMutation = useMutation(
    crpc.words.updateWord.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(crpc.wordLists.getListById.queryFilter());
      },
    })
  );

  const deleteWordMutation = useMutation(
    crpc.words.deleteWord.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(crpc.wordLists.getListById.queryFilter());
      },
    })
  );

  const addWordMutation = useMutation(
    crpc.words.addWord.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(crpc.wordLists.getListById.queryFilter());
      },
    })
  );

  const bulkImportMutation = useMutation(
    crpc.words.bulkImportWords.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(crpc.wordLists.getListById.queryFilter());
      },
    })
  );

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-3 lg:col-span-2">
              {[...new Array(3)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: no id
                <Skeleton className="h-24 w-full" key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
        <div className="text-red-400">Failed to load list</div>
      </div>
    );
  }

  // Not found state
  if (!list) {
    return <ListNotFound />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <ListHeader
          description={list.description}
          name={list.name}
          onUpdate={(data) =>
            updateListMutation.mutate({ listId: typedListId, ...data })
          }
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Sidebar
            isAdding={isAdding}
            list={list}
            onAddToggle={() => setIsAdding(!isAdding)}
            onImportOpen={() => setIsImportModalOpen(true)}
            onPracticeOpen={() => setIsPracticeSettingsOpen(true)}
            onWordAdd={(data) => {
              addWordMutation.mutate({
                listId: typedListId,
                ...data,
              });
              setIsAdding(false);
            }}
          />

          <WordsList
            onWordDelete={(wordId) =>
              deleteWordMutation.mutate({ wordId: asId<"words">(wordId) })
            }
            onWordUpdate={(wordId, data) =>
              updateWordMutation.mutate({
                wordId: asId<"words">(wordId),
                ...data,
              })
            }
            words={list.words}
          />
        </div>
      </div>

      <BulkImportModal
        existingWords={list.words.map((w: Word) => w.word)}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(words) =>
          bulkImportMutation.mutateAsync({
            listId: typedListId,
            words: words.map((w) => ({
              ...w,
              definition: undefined,
              example: undefined,
              difficulty: "medium",
            })),
          })
        }
      />
      <PracticeSettingsDialog
        isOpen={isPracticeSettingsOpen}
        onClose={() => setIsPracticeSettingsOpen(false)}
        onStartPractice={handleStartPractice}
        totalWords={list.words.length}
      />
    </div>
  );
}

interface SidebarProps {
  list: ListWithWords;
  isAdding: boolean;
  onAddToggle: () => void;
  onImportOpen: () => void;
  onPracticeOpen: () => void;
  onWordAdd: (data: {
    word: string;
    definition: string;
    example: string;
    difficulty: Difficulty;
  }) => void;
}

function Sidebar({
  list,
  isAdding,
  onAddToggle,
  onImportOpen,
  onPracticeOpen,
  onWordAdd,
}: SidebarProps) {
  return (
    <div className="space-y-6 lg:col-span-1">
      <ListStats words={list.words} />

      <Button
        className="w-full bg-zinc-100 text-black hover:bg-white"
        onClick={onPracticeOpen}
      >
        Start Practice Session
      </Button>

      {isAdding ? (
        <div className="border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 font-semibold text-lg">Add New Word</h3>
          <WordForm onCancel={onAddToggle} onSubmit={onWordAdd} />
        </div>
      ) : (
        <div className="space-y-3">
          <Button className="w-full" onClick={onAddToggle} variant="secondary">
            <Plus className="h-5 w-5" />
            Add Word
          </Button>
          <Button className="w-full" onClick={onImportOpen} variant="outline">
            <Upload className="h-5 w-5" />
            Import Words
          </Button>
        </div>
      )}
    </div>
  );
}

interface WordListProps {
  words: Word[];
  onWordUpdate: (
    wordId: string,
    data: Partial<{
      word: string;
      definition?: string;
      example?: string;
      difficulty: Difficulty;
    }>
  ) => void;
  onWordDelete: (wordId: string) => void;
}

function WordsList({ words, onWordUpdate, onWordDelete }: WordListProps) {
  if (words.length === 0) {
    return (
      <div className="lg:col-span-2">
        <div className="border border-zinc-800 bg-zinc-900/30 py-16 text-center">
          <Brain className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <h3 className="mb-2 font-medium text-xl text-zinc-300">
            No words yet
          </h3>
          <p className="text-zinc-500">
            Add your first word to start practicing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="space-y-3">
        {words.map((word, index) => (
          <WordCard
            index={index + 1}
            key={word.id}
            onDelete={() => onWordDelete(word.id)}
            onUpdate={onWordUpdate}
            word={word}
          />
        ))}
      </div>
    </div>
  );
}
