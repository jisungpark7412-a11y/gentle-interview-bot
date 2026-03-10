import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 md:pt-44 md:pb-32">
      {/* Decorative badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
        <Sparkles size={14} className="text-primary" />
        <span className="text-xs font-medium text-primary tracking-wide uppercase">
          AI-Powered Interview Prep
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground max-w-4xl leading-[1.1] animate-fade-up">
        Land Your Dream Job
      </h1>

      <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-up" style={{ animationDelay: "100ms" }}>
        Practice interviewing with real questions asked in Google, Meta and Uber interviews
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <Button
          onClick={onGetStarted}
          className="px-8 py-6 rounded-2xl text-base font-display font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
          size="lg"
        >
          Start Practicing
          <ArrowRight size={18} />
        </Button>
        <Button
          variant="outline"
          className="px-8 py-6 rounded-2xl text-base font-display font-semibold border-border hover:bg-surface-elevated transition-all"
          size="lg"
          onClick={() => {
            document.getElementById("offerings")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Learn More
        </Button>
      </div>

      {/* Company logos hint */}
      <div className="mt-16 flex items-center gap-3 text-muted-foreground animate-fade-up" style={{ animationDelay: "300ms" }}>
        <span className="text-xs uppercase tracking-widest font-medium">Trusted by candidates landing roles at</span>
      </div>
      <div className="mt-4 flex items-center gap-8 text-muted-foreground/60 font-display font-semibold text-lg animate-fade-up" style={{ animationDelay: "350ms" }}>
        <span>Google</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span>Meta</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span>Uber</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span>Amazon</span>
      </div>
    </section>
  );
};

export default HeroSection;
