import { Send, Mic, MicOff } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ResponseAreaProps {
  onSubmit: (response: string) => void;
  isWaiting: boolean;
}

const ResponseArea = ({ onSubmit, isWaiting }: ResponseAreaProps) => {
  const [response, setResponse] = useState("");
  const [isInterim, setIsInterim] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSupported, isListening, start, stop } = useSpeechRecognition();

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response.trim());
      setResponse("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stop();
      setIsInterim(false);
      return;
    }

    start(
      (interim) => {
        setResponse(interim);
        setIsInterim(true);
      },
      (final) => {
        setResponse(final);
        setIsInterim(false);
        setTimeout(() => textareaRef.current?.focus(), 0);
      },
      (error) => {
        setIsInterim(false);
        if (error === "not-allowed") {
          toast.error("Microphone access denied");
        } else if (error === "no-speech") {
          toast.error("No speech detected, try again");
        } else {
          toast.error("Speech recognition failed");
        }
      }
    );
  }, [isListening, start, stop]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
      {isWaiting && (
        <p className="text-center text-sm text-muted-foreground mb-4 animate-subtle-pulse">
          Take your time to think, then respond when ready...
        </p>
      )}
      <div className="relative flex items-end gap-3 bg-surface border border-border rounded-2xl p-3 focus-within:border-primary/40 transition-colors duration-300">
        <textarea
          ref={textareaRef}
          value={response}
          onChange={(e) => {
            setResponse(e.target.value);
            setIsInterim(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          rows={1}
          className={`flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-base leading-relaxed max-h-32 min-h-[2.5rem] py-1.5 transition-opacity duration-150 ${
            isInterim ? "opacity-50" : "opacity-100"
          }`}
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
        {isSupported && (
          <button
            onClick={handleMicClick}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            className={`relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
              isListening
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            {isListening && (
              <span className="absolute inset-0 rounded-xl border border-primary/40 animate-ripple" />
            )}
          </button>
        )}
        <button
          onClick={handleSubmit}
          aria-label="Send"
          disabled={!response.trim()}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-200"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ResponseArea;
