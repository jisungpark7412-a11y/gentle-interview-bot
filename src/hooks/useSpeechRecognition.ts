import { useRef, useState, useEffect, useCallback } from "react";

interface SpeechRecognitionAPI {
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionAPI;
    webkitSpeechRecognition?: SpeechRecognitionAPI;
  }
}

const SILENCE_DELAY_MS = 3000;

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback((
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (error: string) => void
  ) => {
    if (!isSupported) return;

    recognitionRef.current?.abort();

    const Recognizer = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognizer();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let accumulated = "";
    let silenceTimer: ReturnType<typeof setTimeout> | null = null;
    let submitted = false;

    const doSubmit = () => {
      if (submitted) return;
      submitted = true;
      if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
      recognition.abort();
      if (accumulated.trim()) onFinal(accumulated.trim());
    };

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          accumulated += (accumulated ? " " : "") + t.trim();
        } else {
          interim += t;
        }
      }

      const display = accumulated + (interim ? (accumulated ? " " : "") + interim : "");
      onInterim(display);

      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(doSubmit, SILENCE_DELAY_MS);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
      if (!submitted && accumulated.trim()) {
        submitted = true;
        onFinal(accumulated.trim());
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
      setIsListening(false);
      onError(event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, start, stop };
}
