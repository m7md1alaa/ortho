import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  itemName: string;
  title: string;
  onDelete: () => void;
  buttonSize?: "icon-xs" | "icon-sm" | "icon-lg";
  description?: string;
}

export function DeleteDialog({
  itemName,
  title,
  onDelete,
  buttonSize = "icon-sm",
  description,
}: DeleteDialogProps) {
  const iconSize = buttonSize === "icon-sm" ? "h-5 w-5" : "h-4 w-4";
  const defaultDescription = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            className="hover:text-destructive"
            size={buttonSize}
            title={title.toLowerCase()}
            variant="ghost"
          >
            <Trash2 className={iconSize} />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
