import { Link } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedbackMessage } from "@/hooks/practice/usePracticeSession";
import type { Word } from "@/types/types";
import { AnswerInput } from "./AnswerInput";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { WordDisplay } from "./WordDisplay";

interface PracticeCardProps {
  currentWord: Word;
  currentWordIndex: number;
  totalWords: number;
  userInput: string;
  setUserInput: (value: string) => void;
  showAnswer: boolean;
  hasAnsweredCorrectly: boolean;
  feedbackMessage: FeedbackMessage | null;
  hint: string | null;
  inputBorderClass: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onShowAnswer: () => void;
  onNextWord: () => void;
  onPlayAudio: () => void;
  onFocusInput: () => void;
  onBlurInput: () => void;
  exitLink: string;
}

export function PracticeCard({
  currentWord,
  currentWordIndex,
  totalWords,
  userInput,
  setUserInput,
  showAnswer,
  hasAnsweredCorrectly,
  feedbackMessage,
  hint,
  inputBorderClass,
  inputRef,
  onSubmit,
  onShowAnswer,
  onNextWord,
  onPlayAudio,
  onFocusInput,
  onBlurInput,
  exitLink,
}: PracticeCardProps) {
  const progress = ((currentWordIndex + 1) / totalWords) * 100;

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <Link
              className="inline-flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-300"
              to={exitLink}
            >
              <ArrowLeft className="h-4 w-4" />
              Exit Practice
            </Link>
            <span className="text-zinc-500">
              {currentWordIndex + 1} / {totalWords}
            </span>
          </div>
          <div className="h-1 overflow-hidden bg-zinc-800">
            <div
              className="h-full bg-zinc-100 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="border border-zinc-800 bg-zinc-900/50 p-8 sm:p-12">
          <WordDisplay
            definition={currentWord.definition}
            example={currentWord.example}
            onPlayAudio={onPlayAudio}
            word={currentWord.word}
          />

          <AnswerInput
            borderClass={inputBorderClass}
            correctWord={currentWord.word}
            feedbackMessage={feedbackMessage}
            hasAnsweredCorrectly={hasAnsweredCorrectly}
            hint={hint}
            inputRef={inputRef}
            onBlur={onBlurInput}
            onChange={setUserInput}
            onFocus={onFocusInput}
            onSubmit={onSubmit}
            showAnswer={showAnswer}
            value={userInput}
          />

          {/* Action Buttons */}
          <div className="mx-auto mt-6 flex max-w-md gap-3">
            {showAnswer ? (
              <Button className="flex-1" onClick={onNextWord}>
                {currentWordIndex >= totalWords - 1 ? "Finish" : "Next Word"} →
              </Button>
            ) : (
              <>
                <Button
                  className="flex-1"
                  disabled={!userInput.trim()}
                  onClick={onSubmit}
                >
                  Submit (Enter)
                </Button>
                <Button onClick={onShowAnswer} variant="secondary">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Show Answer
                </Button>
              </>
            )}
          </div>

          <KeyboardShortcuts />
        </div>
      </div>
    </div>
  );
}
