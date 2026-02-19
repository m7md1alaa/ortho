import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WordDisplayProps {
  word: string;
  definition?: string;
  example?: string;
  onPlayAudio: () => void;
}

export function WordDisplay({
  word,
  definition,
  example,
  onPlayAudio,
}: WordDisplayProps) {
  return (
    <div className="mb-8 text-center">
      <Button
        className="mb-6 rounded-full"
        onClick={onPlayAudio}
        variant="secondary"
      >
        <Volume2 className="h-5 w-5" />
        <span>Listen</span>
        <span className="text-muted-foreground text-sm">(Ctrl + Space)</span>
      </Button>

      {definition && <p className="mb-2 text-lg text-zinc-400">{definition}</p>}

      {example && (
        <p className="text-zinc-500 italic">
          "{example.replace(word, "_____")}"
        </p>
      )}
    </div>
  );
}
