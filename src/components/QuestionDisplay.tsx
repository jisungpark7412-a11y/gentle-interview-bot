import { useState, useEffect } from "react";

interface QuestionDisplayProps {
  question: string;
  isRevealing: boolean;
}

const QuestionDisplay = ({ question, isRevealing }: QuestionDisplayProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isRevealing) {
      setDisplayedText(question);
      return;
    }

    setDisplayedText("");
    let index = 0;

    const interval = setInterval(() => {
      if (index < question.length) {
        setDisplayedText(question.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [question, isRevealing]);

  return (
    <div className="max-w-2xl mx-auto text-center px-4">
      <p className="text-2xl md:text-3xl font-display font-medium leading-relaxed tracking-tight text-foreground">
        {displayedText}
        {showCursor && isRevealing && (
          <span className="inline-block w-0.5 h-7 md:h-8 bg-primary ml-1 align-middle animate-cursor-blink" />
        )}
      </p>
    </div>
  );
};

export default QuestionDisplay;
