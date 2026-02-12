import { CheckCircle, Lightbulb, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FeedbackMessage,
  FeedbackType,
} from "../hooks/usePracticeSession";

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
    <div className="max-w-md mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Type the word you hear..."
          disabled={showAnswer}
          className={cn(
            "w-full px-6 py-4 text-center text-2xl font-medium bg-zinc-800 border-2 rounded-xl focus:outline-none transition-all",
            borderClass,
          )}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {showAnswer && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {hasAnsweredCorrectly ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Hint display */}
      {hint && !showAnswer && (
        <div className="mt-3 flex items-center justify-center gap-2 text-amber-500/80">
          <Lightbulb className="w-4 h-4" />
          <span className="text-lg font-medium tracking-wider">{hint}</span>
        </div>
      )}

      {feedbackMessage && (
        <p
          className={cn(
            "mt-3 text-center text-sm font-medium",
            getFeedbackColor(feedbackMessage.type),
          )}
        >
          {feedbackMessage.text}
        </p>
      )}

      {showAnswer && !hasAnsweredCorrectly && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
          <p className="text-red-400 text-center">
            Correct spelling: <span className="font-bold">{correctWord}</span>
          </p>
        </div>
      )}
    </div>
  );
}
