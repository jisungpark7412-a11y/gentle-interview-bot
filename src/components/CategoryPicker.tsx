import { useState } from "react";
import { BrainCircuit, Users, Target, BarChart3, LineChart, ArrowLeft } from "lucide-react";

export type InterviewCategory =
  | "behavioral"
  | "product_sense"
  | "product_strategy"
  | "product_metrics"
  | "product_analytics";

interface CategoryOption {
  id: InterviewCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const categories: CategoryOption[] = [
  {
    id: "behavioral",
    label: "Behavioral",
    description: "Tell me about a time you faced a conflict, led a team, or overcame a challenge.",
    icon: <Users size={20} />,
  },
  {
    id: "product_sense",
    label: "Product Sense",
    description: "Evaluate products, identify improvements, and think through user experiences.",
    icon: <BrainCircuit size={20} />,
  },
  {
    id: "product_strategy",
    label: "Product Strategy",
    description: "Market positioning, competitive analysis, and go-to-market planning.",
    icon: <Target size={20} />,
  },
  {
    id: "product_metrics",
    label: "Product Metrics",
    description: "Define success metrics, KPIs, and measurement frameworks.",
    icon: <BarChart3 size={20} />,
  },
  {
    id: "product_analytics",
    label: "Product Analytics",
    description: "Analyze data, interpret trends, and make data-driven decisions.",
    icon: <LineChart size={20} />,
  },
];

interface CategoryPickerProps {
  onSelect: (category: InterviewCategory) => void;
  onBack?: () => void;
}

const CategoryPicker = ({ onSelect, onBack }: CategoryPickerProps) => {
  const [selected, setSelected] = useState<InterviewCategory | null>(null);

  return (
    <div className="text-center space-y-8 animate-fade-up max-w-2xl mx-auto px-4">
      <div className="space-y-3">
        {onBack && (
          <div className="flex items-center justify-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
          Choose Your Focus
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          Select the type of interview question you'd like to practice.
        </p>
      </div>

      <div className="grid gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelected(cat.id)}
            className={`group flex items-start gap-4 text-left p-4 rounded-2xl border transition-all duration-200 ${
              selected === cat.id
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card"
            }`}
          >
            <div
              className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200 ${
                selected === cat.id
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {cat.icon}
            </div>
            <div className="min-w-0">
              <p
                className={`font-display font-semibold text-sm transition-colors ${
                  selected === cat.id ? "text-foreground" : "text-foreground/80"
                }`}
              >
                {cat.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {cat.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-base hover:brightness-110 transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Begin Interview
      </button>
    </div>
  );
};

export default CategoryPicker;
