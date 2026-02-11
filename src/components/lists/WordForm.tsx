import { useForm } from "@tanstack/react-form";
import { Save, X } from "lucide-react";
import { useId } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const wordFormSchema = z.object({
  word: z.string().min(1, "Word is required"),
  definition: z.string(),
  example: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

type WordFormData = z.infer<typeof wordFormSchema>;

interface WordFormProps {
  onSubmit: (data: WordFormData) => void;
  onCancel: () => void;
}

export function WordForm({ onSubmit, onCancel }: WordFormProps) {
  const wordId = useId();
  const definitionId = useId();
  const exampleId = useId();
  const form = useForm({
    defaultValues: {
      word: "",
      definition: "",
      example: "",
      difficulty: "medium" as "easy" | "medium" | "hard",
    },
    validators: {
      onSubmit: wordFormSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="word">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={wordId}>Word *</Label>
            <Input
              id={wordId}
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter the word"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="definition">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={definitionId}>Definition</Label>
            <Textarea
              id={definitionId}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="What does this word mean?"
              rows={2}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="example">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={exampleId}>Example Sentence</Label>
            <Textarea
              id={exampleId}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Use the word in a sentence..."
              rows={2}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="difficulty">
        {(field) => (
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={field.state.value}
              onValueChange={(value) =>
                field.handleChange(value as "easy" | "medium" | "hard")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={form.state.isSubmitting}
          className="flex-1"
        >
          <Save className="w-4 h-4" />
          Add Word
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

export type { WordFormData };
