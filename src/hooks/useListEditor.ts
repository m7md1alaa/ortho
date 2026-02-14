import { useState } from "react";

interface UseListEditorProps {
  initialName: string;
  initialDescription?: string;
  onSave: (data: { name: string; description?: string }) => void;
}

interface UseListEditorReturn {
  isEditing: boolean;
  editName: string;
  editDescription: string;
  setIsEditing: (value: boolean) => void;
  setEditName: (value: string) => void;
  setEditDescription: (value: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
  startEditing: () => void;
}

export function useListEditor({
  initialName,
  initialDescription,
  onSave,
}: UseListEditorProps): UseListEditorReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialName);
  const [editDescription, setEditDescription] = useState(
    initialDescription || ""
  );

  function handleSave() {
    if (editName.trim()) {
      onSave({
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  }

  function handleCancel() {
    setEditName(initialName);
    setEditDescription(initialDescription || "");
    setIsEditing(false);
  }

  function startEditing() {
    setEditName(initialName);
    setEditDescription(initialDescription || "");
    setIsEditing(true);
  }

  return {
    isEditing,
    editName,
    editDescription,
    setIsEditing,
    setEditName,
    setEditDescription,
    handleSave,
    handleCancel,
    startEditing,
  };
}
