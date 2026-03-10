import { ShieldCheck, Infinity, Target } from "lucide-react";

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Created by Real Professionals",
    description: "Our question bank is curated by professionals who've worked at Meta and Google — giving you insider-level preparation.",
  },
  {
    icon: Infinity,
    title: "Unlimited Practice",
    description: "Practice as many times as you need to nail your interview. No limits, no paywalls on core practice sessions.",
  },
  {
    icon: Target,
    title: "Real Interview Questions",
    description: "Practice real questions as if you're actually in the interview — same format, same pressure, same depth.",
  },
];

const ValuePropsSection = () => {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
            Why Candidates Choose Us
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to walk into your interview with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUE_PROPS.map((prop, i) => (
            <div
              key={prop.title}
              className="group relative p-8 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                <prop.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {prop.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropsSection;
