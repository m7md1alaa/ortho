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
import type { Difficulty } from "@/types/types";

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
      difficulty: "medium" as Difficulty,
    },
    validators: {
      onSubmit: wordFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="word">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={wordId}>Word *</Label>
            <Input
              id={wordId}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter the word"
              type="text"
              value={field.state.value}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-destructive text-sm">
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
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="What does this word mean?"
              rows={2}
              value={field.state.value}
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
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Use the word in a sentence..."
              rows={2}
              value={field.state.value}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="difficulty">
        {(field) => (
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              onValueChange={(value) => field.handleChange(value as Difficulty)}
              value={field.state.value}
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
          className="flex-1"
          disabled={form.state.isSubmitting}
          type="submit"
        >
          <Save className="h-4 w-4" />
          Add Word
        </Button>
        <Button onClick={onCancel} type="button" variant="outline">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

export type { WordFormData };
