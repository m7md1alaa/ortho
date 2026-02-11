import { useState } from "react";
import type { Word } from "@/types";

interface UseWordEditorProps {
  word: Word;
  onSave: (data: {
    word: string;
    definition?: string;
    example?: string;
    difficulty: "easy" | "medium" | "hard";
  }) => void;
}

interface UseWordEditorReturn {
  isEditing: boolean;
  editWord: string;
  editDefinition: string;
  editExample: string;
  editDifficulty: "easy" | "medium" | "hard";
  setIsEditing: (value: boolean) => void;
  setEditWord: (value: string) => void;
  setEditDefinition: (value: string) => void;
  setEditExample: (value: string) => void;
  setEditDifficulty: (value: "easy" | "medium" | "hard") => void;
  handleSave: () => void;
  handleCancel: () => void;
  startEditing: () => void;
}

export function useWordEditor({
  word,
  onSave,
}: UseWordEditorProps): UseWordEditorReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [editWord, setEditWord] = useState(word.word);
  const [editDefinition, setEditDefinition] = useState(word.definition || "");
  const [editExample, setEditExample] = useState(word.example || "");
  const [editDifficulty, setEditDifficulty] = useState(word.difficulty);

  function handleSave() {
    if (editWord.trim()) {
      onSave({
        word: editWord.trim(),
        definition: editDefinition.trim() || undefined,
        example: editExample.trim() || undefined,
        difficulty: editDifficulty,
      });
      setIsEditing(false);
    }
  }

  function handleCancel() {
    setEditWord(word.word);
    setEditDefinition(word.definition || "");
    setEditExample(word.example || "");
    setEditDifficulty(word.difficulty);
    setIsEditing(false);
  }

  function startEditing() {
    setEditWord(word.word);
    setEditDefinition(word.definition || "");
    setEditExample(word.example || "");
    setEditDifficulty(word.difficulty);
    setIsEditing(true);
  }

  return {
    isEditing,
    editWord,
    editDefinition,
    editExample,
    editDifficulty,
    setIsEditing,
    setEditWord,
    setEditDefinition,
    setEditExample,
    setEditDifficulty,
    handleSave,
    handleCancel,
    startEditing,
  };
}
