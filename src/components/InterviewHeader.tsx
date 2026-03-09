import { BrainCircuit } from "lucide-react";

interface InterviewHeaderProps {
  questionNumber: number;
  totalQuestions: number;
  isActive: boolean;
  onLogoClick?: () => void;
}

const InterviewHeader = ({
  questionNumber,
  totalQuestions,
  isActive,
}: InterviewHeaderProps) => {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20">
          <BrainCircuit size={18} className="text-primary" />
        </div>
        <span className="font-display font-semibold text-foreground tracking-tight">
          InterviewAI
        </span>
      </div>

      {isActive && (
        <div className="flex items-center gap-4">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i < questionNumber
                    ? "bg-primary"
                    : i === questionNumber - 1
                    ? "bg-primary animate-breathe"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {questionNumber}/{totalQuestions}
          </span>
        </div>
      )}
    </header>
  );
};

export default InterviewHeader;
