import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import AIOrb from "@/components/AIOrb";
import QuestionDisplay from "@/components/QuestionDisplay";
import ResponseArea from "@/components/ResponseArea";
import InterviewHeader from "@/components/InterviewHeader";
import CategoryPicker, { type InterviewCategory } from "@/components/CategoryPicker";
import QuestionPicker, { type SpecificQuestion } from "@/components/QuestionPicker";
import HeroSection from "@/components/landing/HeroSection";
import ValuePropsSection from "@/components/landing/ValuePropsSection";
import OfferingsSection from "@/components/landing/OfferingsSection";
import { streamChat, type ChatMessage } from "@/lib/streamChat";
import { buildProductSensePrompt } from "@/lib/productSensePrompt";
import FeedbackDisplay from "@/components/FeedbackDisplay";

type InterviewState = "idle" | "selecting" | "selecting-question" | "asking" | "waiting" | "processing" | "complete";

const Index = () => {
  const [state, setState] = useState<InterviewState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const messagesRef = useRef<ChatMessage[]>([]);
  const categoryRef = useRef<InterviewCategory>("product_sense");
  const selectedCategoryRef = useRef<InterviewCategory>("product_sense");
  const specificQuestionRef = useRef<SpecificQuestion | null>(null);

  const fetchNextQuestion = useCallback(async () => {
    setState("asking");
    setCurrentQuestion("");

    let fullText = "";
    try {
      await streamChat({
        messages: messagesRef.current,
        category: categoryRef.current,
        specificQuestion: specificQuestionRef.current,
        systemPromptOverride: categoryRef.current === "product_sense" ? buildProductSensePrompt(specificQuestionRef.current?.question) : undefined,
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

  const selectCategory = useCallback((category: InterviewCategory) => {
    selectedCategoryRef.current = category;
    setState("selecting-question");
  }, []);

  const startInterview = useCallback((question: SpecificQuestion) => {
    categoryRef.current = selectedCategoryRef.current;
    specificQuestionRef.current = question;
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
        isActive={state !== "idle" && state !== "selecting" && state !== "selecting-question" && state !== "complete"}
        onLogoClick={() => setState("idle")}
        onBack={
          state === "asking" || state === "waiting" || state === "processing"
            ? () => setState("selecting")
            : undefined
        }
      />

      {state === "idle" ? (
        <main className="flex-1 relative z-10">
          <HeroSection onGetStarted={() => setState("selecting")} />
          <ValuePropsSection />
          <OfferingsSection onStartPractice={() => setState("selecting")} />
        </main>
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center gap-10 pb-8 relative z-10">
          {/* AI Orb */}
          <AIOrb isListening={state === "waiting"} />

          {state === "selecting" ? (
            <CategoryPicker onSelect={selectCategory} onBack={() => setState("idle")} />
          ) : state === "selecting-question" ? (
            <QuestionPicker
              category={selectedCategoryRef.current}
              onSelect={startInterview}
              onBack={() => setState("selecting")}
            />
          ) : state === "complete" ? (
            <div className="w-full space-y-6 animate-fade-up">
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground text-center px-4">
                Interview Complete
              </h1>
              <FeedbackDisplay feedbackText={currentQuestion} />
              <div className="flex justify-center pb-4">
                <button
                  onClick={() => setState("selecting")}
                  className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-base hover:brightness-110 transition-all duration-200 shadow-lg shadow-primary/20"
                >
                  Practice Again
                </button>
              </div>
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
        </main>
      )}
    </div>
  );
};

export default Index;
