import { ShieldCheck, Zap, Target } from "lucide-react";

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Created by Real Professionals",
    description:
      "Our question bank is curated by PMs who've worked at Meta and Google — giving you insider-level preparation, not generic advice.",
    accentFrom: "from-blue-500/10",
    accentTo: "to-transparent",
    borderHover: "hover:border-blue-500/30",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Zap,
    title: "Unlimited Practice",
    description:
      "Practice as many times as you need to nail your interview. No limits, no paywalls on core practice sessions — ever.",
    accentFrom: "from-violet-500/10",
    accentTo: "to-transparent",
    borderHover: "hover:border-violet-500/30",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: Target,
    title: "Real Interview Format",
    description:
      "Same questions, same depth, same follow-ups as actual PM interviews. Walk in already knowing what to expect.",
    accentFrom: "from-emerald-500/10",
    accentTo: "to-transparent",
    borderHover: "hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
];

const ValuePropsSection = () => {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-primary/70 uppercase tracking-[0.2em] mb-4">
            Why candidates choose us
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
            Everything you need to{" "}
            <span className="text-muted-foreground/50">get the offer</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {VALUE_PROPS.map((prop, i) => (
            <div
              key={prop.title}
              className={`group relative p-7 rounded-2xl bg-gradient-to-br ${prop.accentFrom} ${prop.accentTo} border border-border/40 ${prop.borderHover} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Hover inner glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/[0.015] to-transparent pointer-events-none" />

              <div
                className={`flex items-center justify-center w-11 h-11 rounded-xl ${prop.iconBg} border ${prop.iconBorder} mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <prop.icon size={20} className={prop.iconColor} />
              </div>

              <h3 className="text-base font-display font-semibold text-foreground mb-2 leading-snug">
                {prop.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
