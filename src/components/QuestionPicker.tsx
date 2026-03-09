import { useState, useEffect } from "react";
import { ArrowLeft, Flame, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { InterviewCategory } from "./CategoryPicker";

export interface SpecificQuestion {
  id?: string;
  question: string;
  isPopular?: boolean;
  company?: string;
  isPersonalized?: boolean;
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
  const [questions, setQuestions] = useState<SpecificQuestion[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isPersonalized) {
      setQuestions(CATEGORY_QUESTIONS[category]);
      setHasSearched(false);
      setSelectedQuestionId("");
    }
  }, [category, isPersonalized]);

  const searchCompanyQuestions = async () => {
    if (!company.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('company-interview-questions', {
        body: { company: company.trim(), category }
      });

      if (error) {
        console.error('Error fetching company questions:', error);
        toast.error("Failed to fetch company-specific questions");
        setQuestions(CATEGORY_QUESTIONS[category]);
      } else if (data?.success) {
        const personalizedQuestions = data.questions.map((q: any, index: number) => ({
          id: `personalized-${index}`,
          question: q.question,
          isPopular: q.isPopular,
          company: data.company,
          isPersonalized: data.isPersonalized
        }));
        setQuestions(personalizedQuestions);
        setHasSearched(true);
        setSelectedQuestionId("");
        
        if (data.isPersonalized) {
          toast.success(`Found personalized questions for ${data.company}!`);
        } else {
          toast.info(`No specific questions found for ${data.company}, showing general questions`);
        }
      } else {
        toast.error("Failed to fetch questions");
        setQuestions(CATEGORY_QUESTIONS[category]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred while searching");
      setQuestions(CATEGORY_QUESTIONS[category]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  const handleQuestionSelect = () => {
    if (selectedQuestion) {
      onSelect({
        ...selectedQuestion,
        company: isPersonalized ? company : undefined,
        isPersonalized: isPersonalized && hasSearched
      });
    }
  };

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

      {/* Personalization Section */}
      <div className="bg-secondary/30 rounded-2xl p-6 space-y-4 border border-border/50">
        <div className="flex items-center gap-3 justify-center">
          <Building2 size={20} className="text-primary" />
          <h3 className="font-display font-semibold text-lg">Personalize for Your Interview</h3>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <Label htmlFor="personalization" className="text-sm text-muted-foreground">
            Use company-specific questions
          </Label>
          <Switch
            id="personalization"
            checked={isPersonalized}
            onCheckedChange={setIsPersonalized}
          />
        </div>

        {isPersonalized && (
          <div className="space-y-3 animate-fade-up">
            <div className="flex gap-2">
              <Input
                placeholder="Enter company name (e.g., Google, Amazon, Meta)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCompanyQuestions()}
                className="flex-1"
              />
              <Button 
                onClick={searchCompanyQuestions}
                disabled={isLoading || !company.trim()}
                size="sm"
                className="px-4"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </Button>
            </div>
            {hasSearched && (
              <p className="text-xs text-muted-foreground">
                {questions.some(q => q.isPersonalized) 
                  ? `✓ Showing personalized questions for ${company}`
                  : `Showing general questions (no specific data found for ${company})`
                }
              </p>
            )}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="text-left space-y-4">
        {questions.map((question, index) => (
          <div
            key={question.id || index}
            className={`p-4 rounded-xl border transition-colors cursor-pointer ${
              selectedQuestionId === question.id
                ? "border-primary bg-primary/5"
                : "border-border/30 hover:border-primary/30 hover:bg-muted/20"
            }`}
            onClick={() => setSelectedQuestionId(question.id || `q-${index}`)}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                selectedQuestionId === question.id
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              }`}>
                {selectedQuestionId === question.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono text-muted-foreground mt-0.5">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">
                      {question.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {question.isPopular && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20">
                          <Flame size={12} className="text-orange-500" />
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            Popular Question
                          </span>
                        </div>
                      )}
                      {question.isPersonalized && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                          <Building2 size={12} className="text-primary" />
                          <span className="text-xs font-medium text-primary">
                            {question.company} Specific
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleQuestionSelect}
        disabled={!selectedQuestion}
        className="px-8 py-3.5 h-auto text-base font-semibold rounded-2xl"
      >
        Start Practice Interview
      </Button>
    </div>
  );
};

export default QuestionPicker;