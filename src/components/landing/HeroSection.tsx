import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Google G — standard 4-color SVG
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Meta — infinity M shape in Meta blue
const MetaLogo = () => (
  <svg viewBox="0 0 30 20" className="h-4 w-auto flex-shrink-0">
    <path
      d="M1.5 10c0-3.6 1.8-7 4.5-7 1.5 0 2.8 1.2 4.1 3.8L11 9l-.9 2.2C8.8 13.8 7.5 15 6 15c-2.7 0-4.5-2.4-4.5-5zm21 5c-1.5 0-2.8-1.2-4.1-3.8L17.5 9l1-2.2C19.8 4.2 21.1 3 22.5 3c2.7 0 4.5 2.4 4.5 5s-1.8 5-4.5 5zm-7.5-3.7c-.6 1.3-1.3 2.4-2.1 3-1.1 1.1-2.4 1.7-3.9 1.7 1.5 0 2.8-.6 3.9-1.7.8-.7 1.5-1.7 2.1-3zm0-4.6c.6-1.3 1.3-2.4 2.1-3 1.1-1.1 2.4-1.7 3.9-1.7-1.5 0-2.8.6-3.9 1.7-.8.7-1.5 1.7-2.1 3z"
      fill="#0081FB"
    />
    <path
      d="M11 9c.8-1.7 1.8-3.3 3-4.3.8-.7 1.6-1 2.5-1s1.7.3 2.5 1c1.2 1 2.2 2.6 3 4.3-.8 1.7-1.8 3.3-3 4.3-.8.7-1.6 1-2.5 1s-1.7-.3-2.5-1C12.8 12.3 11.8 10.7 11 9z"
      fill="#0082FB"
    />
  </svg>
);

// Uber — circle monogram
const UberLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0">
    <circle cx="12" cy="12" r="11" fill="currentColor" className="text-foreground" />
    <path
      d="M8.5 8v5a3.5 3.5 0 0 0 7 0V8h-2v5a1.5 1.5 0 0 1-3 0V8H8.5z"
      fill="black"
    />
  </svg>
);

// Amazon — "a" with orange smile arrow
const AmazonLogo = () => (
  <svg viewBox="0 0 32 28" className="h-5 w-auto flex-shrink-0">
    {/* "a" letterform */}
    <path
      d="M13 4C9.1 4 6 7.1 6 11s3.1 7 7 7c1.9 0 3.6-.7 4.9-1.9V18h2.2V4H18v1.9C16.7 4.7 14.9 4 13 4zm0 2c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z"
      fill="white"
      opacity="0.85"
    />
    {/* Orange smile arrow */}
    <path
      d="M5 22c5.5 3 15 3 20.5 0"
      stroke="#FF9900"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M23 20.5l2.5 1.5-1.5 2"
      stroke="#FF9900"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const COMPANIES = [
  { name: "Google", Logo: GoogleLogo },
  { name: "Meta", Logo: MetaLogo },
  { name: "Uber", Logo: UberLogo },
  { name: "Amazon", Logo: AmazonLogo },
];

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Central glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />

      {/* Badge */}
      <div
        className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 mb-8 animate-fade-up"
        style={{ animationDelay: "0ms" }}
      >
        <Sparkles size={12} className="text-primary" />
        <span className="text-xs font-semibold text-primary/90 tracking-widest uppercase">
          AI-Powered Interview Practice
        </span>
      </div>

      {/* Headline */}
      <h1
        className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tight leading-[1.05] animate-fade-up max-w-5xl"
        style={{ animationDelay: "80ms" }}
      >
        <span className="text-foreground">Ace your</span>
        <br />
        <span className="bg-gradient-to-br from-primary via-primary/90 to-primary/50 bg-clip-text text-transparent">
          PM Interview
        </span>
      </h1>

      {/* Subheadline */}
      <p
        className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed animate-fade-up"
        style={{ animationDelay: "160ms" }}
      >
        Practice with real questions from top tech companies. Get structured AI
        feedback and a scored evaluation after every session.
      </p>

      {/* CTAs */}
      <div
        className="mt-10 flex flex-col sm:flex-row gap-3 animate-fade-up"
        style={{ animationDelay: "240ms" }}
      >
        <Button
          onClick={onGetStarted}
          className="px-8 py-6 rounded-2xl text-base font-display font-semibold shadow-lg shadow-primary/25 hover:brightness-110 transition-all group"
          size="lg"
        >
          Start Practicing Free
          <ArrowRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Button>
        <Button
          variant="outline"
          className="px-8 py-6 rounded-2xl text-base font-display font-semibold border-border/60 hover:bg-card transition-all"
          size="lg"
          onClick={() =>
            document
              .getElementById("offerings")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          See How It Works
        </Button>
      </div>

      {/* Social proof — company logos */}
      <div
        className="mt-20 flex flex-col items-center gap-5 animate-fade-up"
        style={{ animationDelay: "320ms" }}
      >
        <p className="text-xs font-medium text-muted-foreground/40 uppercase tracking-[0.18em]">
          Trusted by candidates landing offers at
        </p>
        <div className="flex items-center gap-8 md:gap-12">
          {COMPANIES.map(({ name, Logo }) => (
            <div
              key={name}
              className="flex items-center gap-2.5 opacity-35 hover:opacity-60 transition-opacity duration-300"
            >
              <Logo />
              <span className="text-sm font-semibold text-foreground/90 tracking-tight">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
