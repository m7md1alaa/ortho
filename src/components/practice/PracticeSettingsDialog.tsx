import { useForm } from "@tanstack/react-form";
import { useId } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Difficulty } from "@/types/types";

interface PracticeSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalWords: number;
  onStartPractice: (settings: PracticeSettingsFormData) => void;
}

const practiceSettingsSchema = z.object({
  wordCount: z.number().min(1, "At least 1 word is required"),
  difficulty: z.union([z.literal("all"), z.enum(["easy", "medium", "hard"])]),
});

type PracticeSettingsFormData = z.infer<typeof practiceSettingsSchema>;

export function PracticeSettingsDialog({
  isOpen,
  onClose,
  totalWords,
  onStartPractice,
}: PracticeSettingsDialogProps) {
  const wordCountId = useId();
  const form = useForm({
    defaultValues: {
      wordCount: totalWords,
      difficulty: "all" as Difficulty | "all",
    },
    validators: {
      onChange: practiceSettingsSchema.superRefine((data, ctx) => {
        if (data.wordCount > totalWords) {
          ctx.addIssue({
            code: "too_big",
            maximum: totalWords,
            type: "number",
            inclusive: true,
            path: ["wordCount"],
            message: `Cannot exceed ${totalWords} available words`,
            origin: "number",
          });
        }
      }),
    },
    onSubmit: ({ value }) => {
      onStartPractice(value);
    },
  });

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Practice Settings</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Configure your practice session before starting
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="wordCount">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={wordCountId}>Number of words</Label>
                <Input
                  id={wordCountId}
                  max={totalWords}
                  min={1}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10);
                    if (!Number.isNaN(value)) {
                      field.handleChange(value);
                    }
                  }}
                  type="number"
                  value={field.state.value}
                />
                {field.state.meta.errors.length > 0 ? (
                  <p className="text-destructive text-sm">
                    {typeof field.state.meta.errors[0] === "string"
                      ? field.state.meta.errors[0]
                      : (field.state.meta.errors[0]?.message ??
                        "Invalid value")}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Total available: {totalWords} words
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="difficulty">
            {(field) => (
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  onValueChange={(value) =>
                    field.handleChange(value as Difficulty | "all")
                  }
                  value={field.state.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-zinc-100 text-black hover:bg-white"
              disabled={form.state.isSubmitting || form.state.isValid === false}
              type="submit"
            >
              Start Practice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
