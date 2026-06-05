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
  abort: () => void;
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
  const committedRef = useRef(false);
  const transcriptRef = useRef("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const SpeechRecognition = useMemo(() => {
    const speechWindow = window as SpeechWindow;
    return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  }, []);

  const isSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  function commitTranscript() {
    const transcript = transcriptRef.current.trim();

    if (!transcript || committedRef.current) {
      return;
    }

    committedRef.current = true;
    onText(transcript);
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  function start() {
    if (!SpeechRecognition) {
      setError("La dictee vocale n'est pas disponible sur ce navigateur.");
      return;
    }

    setError(null);
    transcriptRef.current = "";
    committedRef.current = false;
    recognitionRef.current?.abort();

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      let hasFinalResult = false;

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        transcript += result[0]?.transcript ?? "";

        if (result.isFinal) {
          hasFinalResult = true;
        }
      }

      transcriptRef.current = transcript.trim();

      if (hasFinalResult) {
        commitTranscript();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Autorise le micro pour dicter une question.");
      } else if (event.error !== "no-speech" && !transcriptRef.current) {
        setError("La dictee vocale s'est arretee.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      commitTranscript();
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError("La dictee vocale est deja en cours.");
      setIsListening(false);
    }
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
