import { Link } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Word } from "@/types";
import type { FeedbackMessage } from "../hooks/usePracticeSession";
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
  onSubmit: () => void;
  onShowAnswer: () => void;
  onNextWord: () => void;
  onPlayAudio: () => void;
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
  onSubmit,
  onShowAnswer,
  onNextWord,
  onPlayAudio,
  exitLink,
}: PracticeCardProps) {
  const progress = ((currentWordIndex + 1) / totalWords) * 100;

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              to={exitLink}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Practice
            </Link>
            <span className="text-zinc-500">
              {currentWordIndex + 1} / {totalWords}
            </span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-100 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 sm:p-12">
          <WordDisplay
            word={currentWord.word}
            definition={currentWord.definition}
            example={currentWord.example}
            onPlayAudio={onPlayAudio}
          />

          <AnswerInput
            value={userInput}
            onChange={setUserInput}
            onSubmit={onSubmit}
            inputRef={{ current: null }}
            showAnswer={showAnswer}
            hasAnsweredCorrectly={hasAnsweredCorrectly}
            feedbackMessage={feedbackMessage}
            hint={hint}
            borderClass={inputBorderClass}
            correctWord={currentWord.word}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 max-w-md mx-auto">
            {!showAnswer ? (
              <>
                <Button
                  onClick={onSubmit}
                  disabled={!userInput.trim()}
                  className="flex-1"
                >
                  Submit (Enter)
                </Button>
                <Button onClick={onShowAnswer} variant="secondary">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Show Answer
                </Button>
              </>
            ) : (
              <Button onClick={onNextWord} className="flex-1">
                {currentWordIndex >= totalWords - 1 ? "Finish" : "Next Word"} →
              </Button>
            )}
          </div>

          <KeyboardShortcuts />
        </div>
      </div>
    </div>
  );
}
