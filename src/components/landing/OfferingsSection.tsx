import { Bot, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfferingsSectionProps {
  onStartPractice: () => void;
}

const OfferingsSection = ({ onStartPractice }: OfferingsSectionProps) => {
  return (
    <section id="offerings" className="relative px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
            Our Services
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            From AI-powered practice to 1:1 mentoring — we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AI Interview Assistant */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-surface p-10 flex flex-col">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 mb-6">
              <Bot size={28} className="text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-3">
              AI Interview Assistant
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
              Trained AI Assistant on real interview questions for product interviews. Get instant feedback, follow-up questions, and structured practice sessions.
            </p>
            <Button
              onClick={onStartPractice}
              className="w-fit px-6 py-5 rounded-xl font-display font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
            >
              Try It Free
              <ArrowRight size={16} />
            </Button>

            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          </div>

          {/* Professional Mentoring */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-10 flex flex-col">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent border border-accent-foreground/20 mb-6">
              <Users size={28} className="text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-3">
              Professional Mentoring
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
              Want 1:1 help to land your dream job? Book with one of our career consultants for resume feedback and mock interviews with real industry professionals.
            </p>
            <Button
              variant="outline"
              className="w-fit px-6 py-5 rounded-xl font-display font-semibold border-border hover:bg-accent hover:text-accent-foreground transition-all"
            >
              Coming Soon
            </Button>

            {/* Decorative glow */}
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-accent/10 blur-[80px] pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferingsSection;
