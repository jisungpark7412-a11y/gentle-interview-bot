import { useState } from "react";
import { ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import type { InterviewCategory } from "./CategoryPicker";

export interface SpecificQuestion {
  id: string;
  question: string;
  isPopular?: boolean;
}

const CATEGORY_QUESTIONS: Record<InterviewCategory, SpecificQuestion[]> = {
  behavioral: [
    {
      id: "tell-me-about-yourself",
      question: "Tell me about yourself",
      isPopular: true,
    },
    {
      id: "conflict-with-engineering",
      question: "Tell me about a time that you had a conflict with an engineering partner. How did you convince the engineering partner?",
      isPopular: true,
    },
    {
      id: "long-term-tradeoff",
      question: "Tell me about a time that you made a long term trade off instead of a short term trade off?",
      isPopular: true,
    },
    {
      id: "weakness",
      question: "What is your weakness?",
      isPopular: true,
    },
    {
      id: "greatest-strengths",
      question: "What are your greatest strengths or your superpower?",
      isPopular: true,
    },
    {
      id: "prioritize-features",
      question: "You have 3 features your team wants to build — how do you decide what ships first?",
    },
  ],
  product_sense: [
    {
      id: "favorite-product",
      question: "What is your favorite product? Why?",
    },
    {
      id: "most-used-product",
      question: "What is your most used product? How would you improve it?",
    },
    {
      id: "alarm-clock-blind",
      question: "Create an alarm clock for blind people?",
    },
    {
      id: "grow-new-product",
      question: "How would you grow a new product in a new market?",
    },
  ],
  product_strategy: [
    {
      id: "tiktok-snapchat",
      question: "Should Tiktok buy Snapchat?",
    },
    {
      id: "paypal-bitcoin",
      question: "Should Paypal invest in their own bitcoin product?",
    },
    {
      id: "measure-trust-ai",
      question: "How would you measure trust in a Gen AI product?",
    },
    {
      id: "competitor-retention",
      question: "A competitor just launched a feature that's hurting your retention — what do you do?",
    },
  ],
  product_metrics: [
    {
      id: "instagram-stories",
      question: "How would you measure the success of Instagram Stories?",
    },
    {
      id: "netflix-dau-drop",
      question: "Netflix's daily active users dropped 20% overnight — walk me through how you'd investigate",
    },
    {
      id: "feature-success",
      question: "How would you decide if a new feature was successful after launch?",
    },
    {
      id: "spotify-north-star",
      question: "What's the north star metric for Spotify? Why?",
    },
  ],
  product_analytics: [
    {
      id: "dau-investigation",
      question: "You notice that daily active users for your product dropped 15% over the past week. Walk me through how you'd investigate this.",
    },
    {
      id: "data-segmentation",
      question: "How would you segment users to understand retention patterns?",
    },
    {
      id: "ab-test-design",
      question: "Design an A/B test for a new checkout flow",
    },
    {
      id: "metric-conflicts",
      question: "Two important metrics are moving in opposite directions — how do you handle this?",
    },
  ],
};

const CATEGORY_LABELS: Record<InterviewCategory, string> = {
  behavioral: "Behavioral",
  product_sense: "Product Sense",
  product_strategy: "Product Strategy", 
  product_metrics: "Product Metrics",
  product_analytics: "Product Analytics",
};

interface QuestionPickerProps {
  category: InterviewCategory;
  onSelect: (question: SpecificQuestion) => void;
  onBack: () => void;
}

const QuestionPicker = ({ category, onSelect, onBack }: QuestionPickerProps) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const questions = CATEGORY_QUESTIONS[category];
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  return (
    <div className="text-center space-y-8 animate-fade-up max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <Badge variant="outline" className="text-xs font-medium">
            Step 2 of 2
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
          Choose Your Question
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          Select a specific {CATEGORY_LABELS[category].toLowerCase()} question to practice.
        </p>
      </div>

      {/* Questions */}
      <Card className="text-left border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <RadioGroup
            value={selectedQuestionId}
            onValueChange={setSelectedQuestionId}
            className="space-y-4"
          >
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-start space-x-3 p-4 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-muted/20 transition-colors"
              >
                <RadioGroupItem 
                  value={question.id} 
                  id={question.id}
                  className="mt-0.5"
                />
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-mono text-muted-foreground mt-0.5">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <label
                        htmlFor={question.id}
                        className="text-sm font-medium leading-relaxed cursor-pointer"
                      >
                        {question.question}
                      </label>
                      {question.isPopular && (
                        <div className="flex items-center gap-1 mt-1">
                          <Flame size={12} className="text-orange-500 dark:text-orange-400" />
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            Popular Question
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <Button
        onClick={() => selectedQuestion && onSelect(selectedQuestion)}
        disabled={!selectedQuestion}
        className="px-8 py-3.5 h-auto text-base font-semibold rounded-2xl"
      >
        Start Practice Interview
      </Button>
    </div>
  );
};

export default QuestionPicker;