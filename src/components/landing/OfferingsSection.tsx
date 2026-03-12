import { Bot, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfferingsSectionProps {
  onStartPractice: () => void;
}

const AI_TAGS = ["Product Sense", "Strategy", "Metrics", "Analytics", "Behavioral"];
const MENTOR_TAGS = ["Mock Interviews", "Resume Review", "Career Strategy", "Offer Negotiation"];

const OfferingsSection = ({ onStartPractice }: OfferingsSectionProps) => {
  return (
    <section id="offerings" className="relative px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-primary/70 uppercase tracking-[0.2em] mb-4">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
            Two ways to prepare
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Start with AI practice for free, or level up with a real human mentor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── AI Interview Coach ── */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 flex flex-col group">
            {/* Corner glow */}
            <div className="absolute -top-28 -right-28 w-56 h-56 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
            {/* Inner shimmer */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

            <div className="relative flex flex-col flex-1">
              {/* Icon + badge row */}
              <div className="flex items-center gap-3 mb-7">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex-shrink-0">
                  <Bot size={22} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  Available Now
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                AI Interview Coach
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-7">
                Practice with a structured AI interviewer trained on real PM
                questions. Get follow-up questions, instant feedback, and a
                detailed scored evaluation after every session.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {AI_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary/80 border border-primary/15 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Button
                onClick={onStartPractice}
                className="w-fit px-6 py-5 rounded-xl font-display font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all group/btn mt-auto"
              >
                Start Practicing Free
                <ArrowRight
                  size={16}
                  className="group-hover/btn:translate-x-0.5 transition-transform"
                />
              </Button>
            </div>
          </div>

          {/* ── Professional Mentoring ── */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-surface to-transparent p-8 flex flex-col group">
            {/* Corner glow */}
            <div className="absolute -bottom-28 -left-28 w-56 h-56 rounded-full bg-muted/30 blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col flex-1">
              {/* Icon + badge row */}
              <div className="flex items-center gap-3 mb-7">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/60 border border-border/60 flex-shrink-0">
                  <Users size={22} className="text-muted-foreground" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted/30 border border-border/30">
                  Coming Soon
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                1:1 Professional Mentoring
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-7">
                Get personalized guidance from industry professionals who've
                worked at top tech companies. Real mock interviews, resume
                reviews, and career coaching tailored to your target role.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {MENTOR_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted/40 text-muted-foreground/50 border border-border/30 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Button
                variant="outline"
                disabled
                className="w-fit px-6 py-5 rounded-xl font-display font-semibold border-border/40 opacity-50 cursor-default mt-auto"
              >
                <Sparkles size={15} />
                Notify Me When Live
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferingsSection;
