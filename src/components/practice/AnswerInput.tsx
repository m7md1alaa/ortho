import { CheckCircle, Lightbulb, XCircle } from "lucide-react";
import type {
  FeedbackMessage,
  FeedbackType,
} from "@/hooks/practice/usePracticeSession";
import { cn } from "@/lib/utils";

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  showAnswer: boolean;
  hasAnsweredCorrectly: boolean;
  feedbackMessage: FeedbackMessage | null;
  hint: string | null;
  borderClass: string;
  correctWord: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function AnswerInput({
  value,
  onChange,
  onSubmit,
  inputRef,
  showAnswer,
  hasAnsweredCorrectly,
  feedbackMessage,
  hint,
  borderClass,
  correctWord,
  onFocus,
  onBlur,
}: AnswerInputProps) {
  const getFeedbackColor = (type: FeedbackType) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "close":
        return "text-amber-500";
      default:
        return "text-zinc-500";
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="relative">
        <input
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className={cn(
            "w-full border-2 bg-zinc-800 px-6 py-4 text-center font-medium text-2xl transition-all focus:outline-none",
            borderClass
          )}
          disabled={showAnswer}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Type the word you hear..."
          ref={inputRef}
          spellCheck={false}
          type="text"
          value={value}
        />

        {showAnswer && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2">
            {hasAnsweredCorrectly ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Hint display */}
      {hint && !showAnswer && (
        <div className="mt-3 flex items-center justify-center gap-2 text-amber-500/80">
          <Lightbulb className="h-4 w-4" />
          <span className="font-medium text-lg tracking-wider">{hint}</span>
        </div>
      )}

      {feedbackMessage && (
        <p
          className={cn(
            "mt-3 text-center font-medium text-sm",
            getFeedbackColor(feedbackMessage.type)
          )}
        >
          {feedbackMessage.text}
        </p>
      )}

      {showAnswer && !hasAnsweredCorrectly && (
        <div className="mt-4 border border-red-900/50 bg-red-900/20 p-4">
          <p className="text-center text-red-400">
            Correct spelling: <span className="font-bold">{correctWord}</span>
          </p>
        </div>
      )}
    </div>
  );
}
