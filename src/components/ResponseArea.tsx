import { Send } from "lucide-react";
import { useState } from "react";

interface ResponseAreaProps {
  onSubmit: (response: string) => void;
  isWaiting: boolean;
}

const ResponseArea = ({ onSubmit, isWaiting }: ResponseAreaProps) => {
  const [response, setResponse] = useState("");

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

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
      {isWaiting && (
        <p className="text-center text-sm text-muted-foreground mb-4 animate-subtle-pulse">
          Take your time to think, then respond when ready...
        </p>
      )}
      <div className="relative flex items-end gap-3 bg-surface border border-border rounded-2xl p-3 focus-within:border-primary/40 transition-colors duration-300">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          rows={1}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-base leading-relaxed max-h-32 min-h-[2.5rem] py-1.5"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
        <button
          onClick={handleSubmit}
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
