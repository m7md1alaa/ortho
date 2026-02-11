import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListEditor } from "@/hooks/useListEditor";

interface ListHeaderProps {
  name: string;
  description?: string;
  onUpdate: (data: { name: string; description?: string }) => void;
}

export function ListHeader({ name, description, onUpdate }: ListHeaderProps) {
  const {
    isEditing,
    editName,
    editDescription,
    setEditName,
    setEditDescription,
    handleSave,
    handleCancel,
    startEditing,
  } = useListEditor({
    initialName: name,
    initialDescription: description,
    onSave: onUpdate,
  });

  return (
    <div className="mb-8">
      <Link
        to="/lists"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to lists
      </Link>
      <div className="group">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              className="w-full text-4xl font-bold tracking-tight text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0"
              placeholder="List name"
              // biome-ignore lint/a11y/noAutofocus: Edit mode needs focus
              autoFocus
            />
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              className="w-full text-lg text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0"
              placeholder="Description (optional)"
            />
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={startEditing}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Edit list"
              >
                <Edit2 className="w-5 h-5" />
              </Button>
            </div>
            {description && (
              <p className="text-zinc-400 text-lg">{description}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
