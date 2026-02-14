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
        className="mb-4 inline-flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-300"
        to="/lists"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to lists
      </Link>
      <div className="group">
        {isEditing ? (
          <div className="space-y-3">
            <input
              autoFocus
              className="w-full font-bold text-4xl text-zinc-100 tracking-tight placeholder:text-zinc-600 focus:border-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              placeholder="List name"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              type="text"
              // biome-ignore lint/a11y/noAutofocus: Edit mode needs focus
              value={editName}
            />
            <input
              className="w-full text-lg text-zinc-400 placeholder:text-zinc-600 focus:border-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              placeholder="Description (optional)"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              type="text"
              value={editDescription}
            />
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} size="sm">
                <CheckCircle className="mr-1 h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleCancel} size="sm" variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="font-bold text-4xl tracking-tight">{name}</h1>
              <Button
                className="opacity-0 transition-opacity group-hover:opacity-100"
                onClick={startEditing}
                size="icon-sm"
                title="Edit list"
                variant="ghost"
              >
                <Edit2 className="h-5 w-5" />
              </Button>
            </div>
            {description && (
              <p className="text-lg text-zinc-400">{description}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
