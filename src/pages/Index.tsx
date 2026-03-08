import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import AIOrb from "@/components/AIOrb";
import QuestionDisplay from "@/components/QuestionDisplay";
import AudioIndicator from "@/components/AudioIndicator";
import ResponseArea from "@/components/ResponseArea";
import InterviewHeader from "@/components/InterviewHeader";
import CategoryPicker, { type InterviewCategory } from "@/components/CategoryPicker";
import { streamChat, type ChatMessage } from "@/lib/streamChat";

type InterviewState = "idle" | "selecting" | "asking" | "waiting" | "processing" | "complete";

const Index = () => {
  const [state, setState] = useState<InterviewState>("idle");
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const messagesRef = useRef<ChatMessage[]>([]);
  const categoryRef = useRef<InterviewCategory>("product_sense");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const messagesRef = useRef<ChatMessage[]>([]);

  const fetchNextQuestion = useCallback(async () => {
    setState("asking");
    setCurrentQuestion("");

    let fullText = "";
    try {
      await streamChat({
        messages: messagesRef.current,
        category: categoryRef.current,
        onDelta: (chunk) => {
          fullText += chunk;
          // Strip the completion marker from display
          const display = fullText.replace("[INTERVIEW_COMPLETE]", "").trim();
          setCurrentQuestion(display);
        },
        onDone: () => {
          const isComplete = fullText.includes("[INTERVIEW_COMPLETE]");
          const cleanText = fullText.replace("[INTERVIEW_COMPLETE]", "").trim();
          messagesRef.current.push({ role: "assistant", content: cleanText });

          if (isComplete) {
            setCurrentQuestion(cleanText);
            setState("complete");
          } else {
            setQuestionCount((prev) => prev + 1);
            // Small delay then allow answering
            setTimeout(() => setState("waiting"), 400);
          }
        },
      });
    } catch (e: any) {
      console.error("Stream error:", e);
      toast.error(e.message || "Failed to get next question");
      setState("idle");
    }
  }, []);

  const startInterview = useCallback((category: InterviewCategory) => {
    categoryRef.current = category;
    messagesRef.current = [];
    setQuestionCount(0);
    fetchNextQuestion();
  }, [fetchNextQuestion]);

  const handleResponse = useCallback(
    (response: string) => {
      messagesRef.current.push({ role: "user", content: response });
      setState("processing");
      // Brief pause then fetch AI's next question
      setTimeout(() => fetchNextQuestion(), 800);
    },
    [fetchNextQuestion]
  );

  const toggleAudio = useCallback(() => {
    setIsAudioActive((prev) => !prev);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <InterviewHeader
        questionNumber={questionCount}
        totalQuestions={4}
        isActive={state !== "idle" && state !== "complete"}
      />

      <main className="flex-1 flex flex-col items-center justify-center gap-10 pb-8 relative z-10">
        {/* AI Orb */}
        <AIOrb isListening={state === "waiting" || isAudioActive} />

        {/* Welcome / Question / Complete */}
        {state === "idle" ? (
          <div className="text-center space-y-6 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
              Ready to Practice?
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your AI interviewer will guide you through a product sense interview.
              Take your time and answer naturally.
            </p>
            <button
              onClick={startInterview}
              className="mt-4 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-base hover:brightness-110 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Begin Interview
            </button>
          </div>
        ) : state === "complete" ? (
          <div className="text-center space-y-6 animate-fade-up max-w-2xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
              Interview Complete
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {currentQuestion}
            </p>
            <button
              onClick={startInterview}
              className="mt-4 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-base hover:brightness-110 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Practice Again
            </button>
          </div>
        ) : state === "processing" ? (
          <div className="text-center animate-subtle-pulse">
            <p className="text-muted-foreground text-lg">Thinking...</p>
          </div>
        ) : (
          <QuestionDisplay
            question={currentQuestion}
            isRevealing={state === "asking"}
          />
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
