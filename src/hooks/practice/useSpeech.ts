import { useCallback, useEffect } from "react";

export interface UseSpeechReturn {
  speakWord: (word: string) => void;
}

export function useSpeech(
  audioEnabled: boolean,
  speechRate: number,
  currentWord: string | undefined
): UseSpeechReturn {
  const speakWord = useCallback(
    (word: string) => {
      if ("speechSynthesis" in window && audioEnabled) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = speechRate;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    },
    [audioEnabled, speechRate]
  );

  // Auto-speak current word
  useEffect(() => {
    if (currentWord) {
      const timer = setTimeout(() => {
        speakWord(currentWord);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentWord, speakWord]);

  return { speakWord };
}
