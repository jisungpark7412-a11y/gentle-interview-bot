import React, { useState, useEffect, useRef } from "react";

interface QuestionDisplayProps {
  question: string;
  isRevealing: boolean;
}

const MS_PER_CHAR = 12; // ~83 chars/sec

const QuestionDisplay = ({ question, isRevealing }: QuestionDisplayProps) => {
  const [displayed, setDisplayed] = useState("");
  const targetRef = useRef(question);
  const animRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  // Keep target ref in sync with incoming streamed text
  useEffect(() => {
    targetRef.current = question;
    if (!question) setDisplayed("");
  }, [question]);

  // Typewriter animation loop
  useEffect(() => {
    if (!isRevealing) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      setDisplayed(targetRef.current);
      return;
    }

    setDisplayed("");
    lastTickRef.current = 0;

    const tick = (timestamp: number) => {
      if (lastTickRef.current === 0) lastTickRef.current = timestamp;
      const elapsed = timestamp - lastTickRef.current;
      const charsToAdd = Math.max(0, Math.floor(elapsed / MS_PER_CHAR));

      if (charsToAdd > 0) {
        lastTickRef.current = timestamp;
        setDisplayed(prev => {
          const target = targetRef.current;
          if (prev.length >= target.length) return prev;
          return target.slice(0, prev.length + charsToAdd);
        });
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [isRevealing]);

  return (
    <div className="max-w-2xl mx-auto text-center px-4">
      <p className="text-2xl md:text-3xl font-display font-medium leading-relaxed tracking-tight text-foreground">
        {displayed}
        {isRevealing && (
          <span className="inline-block w-0.5 h-7 md:h-8 bg-primary ml-1 align-middle animate-cursor-blink" />
        )}
      </p>
    </div>
  );
};

export default QuestionDisplay;
