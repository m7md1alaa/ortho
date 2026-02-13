import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { Brain, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { BulkImportModal } from "@/components/BulkImportModal";
import { ListHeader } from "@/components/lists/ListHeader";
import { ListNotFound } from "@/components/lists/ListNotFound";
import { ListStats } from "@/components/lists/ListStats";
import { WordCard } from "@/components/lists/WordCard";
import { WordForm } from "@/components/lists/WordForm";
import { Button } from "@/components/ui/button";
import {
  addWord,
  deleteWord,
  store,
  updateWord,
  updateWordList,
} from "@/store";
import type { WordList } from "@/types";

export const Route = createFileRoute("/lists/$listId")({
  component: ListDetailPage,
});

function ListDetailPage() {
  const { listId } = useParams({ from: "/lists/$listId" });
  const wordLists = useStore(store, (state) => state.wordLists);
  const list = wordLists.find((l) => l.id === listId);
  const [isAdding, setIsAdding] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  if (!list) {
    return <ListNotFound />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <ListHeader
          description={list.description}
          name={list.name}
          onUpdate={(data) => updateWordList(listId, data)}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Sidebar
            isAdding={isAdding}
            list={list}
            onAddToggle={() => setIsAdding(!isAdding)}
            onImportOpen={() => setIsImportModalOpen(true)}
            onWordAdd={(data) => {
              addWord(listId, {
                ...data,
                correctCount: 0,
                incorrectCount: 0,
                streak: 0,
              });
              setIsAdding(false);
            }}
          />

          <WordsList
            onWordDelete={(wordId) => deleteWord(listId, wordId)}
            onWordUpdate={(wordId, data) => updateWord(listId, wordId, data)}
            words={list.words}
          />
        </div>
      </div>

      <BulkImportModal
        existingWords={list?.words.map((w) => w.word) || []}
        isOpen={isImportModalOpen}
        listId={listId}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}

interface SidebarProps {
  list: WordList;
  isAdding: boolean;
  onAddToggle: () => void;
  onImportOpen: () => void;
  onWordAdd: (data: {
    word: string;
    definition: string;
    example: string;
    difficulty: "easy" | "medium" | "hard";
  }) => void;
}

function Sidebar({
  list,
  isAdding,
  onAddToggle,
  onImportOpen,
  onWordAdd,
}: SidebarProps) {
  return (
    <div className="space-y-6 lg:col-span-1">
      <ListStats words={list.words} />

      <Link
        className="block w-full rounded-lg bg-zinc-100 px-4 py-3 text-center font-medium text-black transition-colors hover:bg-white"
        params={{ listId: list.id }}
        to="/practice/$listId"
      >
        Start Practice Session
      </Link>

      {isAdding ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
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
  words: WordList["words"];
  onWordUpdate: (
    wordId: string,
    data: Partial<WordList["words"][number]>
  ) => void;
  onWordDelete: (wordId: string) => void;
}

function WordsList({ words, onWordUpdate, onWordDelete }: WordListProps) {
  if (words.length === 0) {
    return (
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
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
