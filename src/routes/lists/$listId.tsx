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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ListHeader
          name={list.name}
          description={list.description}
          onUpdate={(data) => updateWordList(listId, data)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Sidebar
            list={list}
            isAdding={isAdding}
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
            words={list.words}
            onWordUpdate={(wordId, data) => updateWord(listId, wordId, data)}
            onWordDelete={(wordId) => deleteWord(listId, wordId)}
          />
        </div>
      </div>

      <BulkImportModal
        listId={listId}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingWords={list?.words.map((w) => w.word) || []}
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
    <div className="lg:col-span-1 space-y-6">
      <ListStats words={list.words} />

      <Link
        to="/practice/$listId"
        params={{ listId: list.id }}
        className="block w-full px-4 py-3 bg-zinc-100 text-black text-center rounded-lg hover:bg-white transition-colors font-medium"
      >
        Start Practice Session
      </Link>

      {isAdding ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Word</h3>
          <WordForm onSubmit={onWordAdd} onCancel={onAddToggle} />
        </div>
      ) : (
        <div className="space-y-3">
          <Button onClick={onAddToggle} className="w-full" variant="secondary">
            <Plus className="w-5 h-5" />
            Add Word
          </Button>
          <Button onClick={onImportOpen} className="w-full" variant="outline">
            <Upload className="w-5 h-5" />
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
    data: Partial<WordList["words"][number]>,
  ) => void;
  onWordDelete: (wordId: string) => void;
}

function WordsList({ words, onWordUpdate, onWordDelete }: WordListProps) {
  if (words.length === 0) {
    return (
      <div className="lg:col-span-2">
        <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-xl">
          <Brain className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-zinc-300 mb-2">
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
            key={word.id}
            word={word}
            index={index + 1}
            onUpdate={onWordUpdate}
            onDelete={() => onWordDelete(word.id)}
          />
        ))}
      </div>
    </div>
  );
}
