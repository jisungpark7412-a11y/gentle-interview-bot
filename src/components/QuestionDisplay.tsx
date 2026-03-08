import React from "react";

interface QuestionDisplayProps {
  question: string;
  isRevealing: boolean;
}

const QuestionDisplay = ({ question, isRevealing }: QuestionDisplayProps) => {
  // When streaming (isRevealing), just show the question as it grows from the parent
  // The cursor shows while streaming
  const showCursor = isRevealing;

  return (
    <div className="max-w-2xl mx-auto text-center px-4">
      <p className="text-2xl md:text-3xl font-display font-medium leading-relaxed tracking-tight text-foreground">
        {question}
        {showCursor && (
          <span className="inline-block w-0.5 h-7 md:h-8 bg-primary ml-1 align-middle animate-cursor-blink" />
        )}
      </p>
    </div>
  );
};

export default QuestionDisplay;
