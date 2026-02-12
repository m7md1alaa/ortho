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
    <div className="text-center mb-8">
      <Button
        onClick={onPlayAudio}
        variant="secondary"
        className="rounded-full mb-6"
      >
        <Volume2 className="w-5 h-5" />
        <span>Listen</span>
        <span className="text-muted-foreground text-sm">(Ctrl + Space)</span>
      </Button>

      {definition && <p className="text-zinc-400 text-lg mb-2">{definition}</p>}

      {example && (
        <p className="text-zinc-500 italic">
          "{example.replace(word, "_____")}"
        </p>
      )}
    </div>
  );
}
