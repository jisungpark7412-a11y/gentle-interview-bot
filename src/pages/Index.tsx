import { useState, useCallback } from "react";
import AIOrb from "@/components/AIOrb";
import QuestionDisplay from "@/components/QuestionDisplay";
import AudioIndicator from "@/components/AudioIndicator";
import ResponseArea from "@/components/ResponseArea";
import InterviewHeader from "@/components/InterviewHeader";

const INTERVIEW_QUESTIONS = [
  "What is your favorite consumer product?",
  "How would you improve it?",
];

type InterviewState = "idle" | "asking" | "waiting" | "processing";

const Index = () => {
  const [state, setState] = useState<InterviewState>("idle");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [responses, setResponses] = useState<string[]>([]);

  const startInterview = useCallback(() => {
    setState("asking");
    setTimeout(() => {
      setState("waiting");
    }, INTERVIEW_QUESTIONS[currentQuestionIndex].length * 40 + 500);
  }, [currentQuestionIndex]);

  const handleResponse = useCallback(
    (response: string) => {
      setResponses((prev) => [...prev, response]);
      setState("processing");

      // Simulate processing then move to next question
      setTimeout(() => {
        if (currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setState("asking");
          setTimeout(() => {
            setState("waiting");
          }, INTERVIEW_QUESTIONS[currentQuestionIndex + 1].length * 40 + 500);
        } else {
          setState("idle");
        }
      }, 1500);
    },
    [currentQuestionIndex]
  );

  const toggleAudio = useCallback(() => {
    setIsAudioActive((prev) => !prev);
  }, []);

  const isComplete =
    state === "idle" && responses.length === INTERVIEW_QUESTIONS.length;

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <InterviewHeader
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={INTERVIEW_QUESTIONS.length}
        isActive={state !== "idle"}
      />

      <main className="flex-1 flex flex-col items-center justify-center gap-10 pb-8 relative z-10">
        {/* AI Orb */}
        <AIOrb isListening={state === "waiting" || isAudioActive} />

        {/* Question or Welcome */}
        {state === "idle" && !isComplete ? (
          <div className="text-center space-y-6 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
              Ready to Practice?
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your AI interviewer will guide you through a series of questions.
              Take your time and answer naturally.
            </p>
            <button
              onClick={startInterview}
              className="mt-4 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-base hover:brightness-110 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Begin Interview
            </button>
          </div>
        ) : isComplete ? (
          <div className="text-center space-y-6 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
              Interview Complete
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Great job! You answered all {INTERVIEW_QUESTIONS.length} questions.
              Keep practicing to build your confidence.
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-accent-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              {responses.length} responses recorded
            </div>
          </div>
        ) : (
          <>
            {state === "processing" ? (
              <div className="text-center animate-subtle-pulse">
                <p className="text-muted-foreground text-lg">
                  Preparing next question...
                </p>
              </div>
            ) : (
              <QuestionDisplay
                question={INTERVIEW_QUESTIONS[currentQuestionIndex]}
                isRevealing={state === "asking"}
              />
            )}
          </>
        )}

        {/* Response Input */}
        {state === "waiting" && (
          <ResponseArea onSubmit={handleResponse} isWaiting />
        )}

        {/* Audio Indicator */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
          <button onClick={toggleAudio} className="outline-none">
            <AudioIndicator isActive={isAudioActive} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Index;
