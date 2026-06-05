import { useEffect, useMemo, useRef, useState } from "react";

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface UseSpeechDictationOptions {
  onText: (text: string) => void;
}

export function useSpeechDictation({ onText }: UseSpeechDictationOptions) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const SpeechRecognition = useMemo(() => {
    const speechWindow = window as SpeechWindow;
    return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  }, []);

  const isSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function stop() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function start() {
    if (!SpeechRecognition) {
      setError("La dictee vocale n'est pas disponible sur ce navigateur.");
      return;
    }

    setError(null);

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalText += transcript;
        }
      }

      if (finalText.trim()) {
        onText(finalText.trim());
      }
    };

    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Autorise le micro pour dicter une question."
          : "La dictee vocale s'est arretee."
      );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function toggle() {
    if (isListening) {
      stop();
      return;
    }

    start();
  }

  return {
    error,
    isListening,
    isSupported,
    toggle
  };
}
