import { Mic } from "lucide-react";

const AudioIndicator = ({ isActive = false }: { isActive?: boolean }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 ${
          isActive
            ? "border-primary/50 bg-primary/10"
            : "border-border bg-secondary"
        }`}
      >
        <Mic
          size={20}
          className={`transition-colors duration-300 ${
            isActive ? "text-primary" : "text-muted-foreground"
          }`}
        />
        {isActive && (
          <span className="absolute inset-0 rounded-full border border-primary/30 animate-ripple" />
        )}
      </div>

      {/* Sound wave bars */}
      <div className="flex items-center gap-[3px] h-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all duration-300 ${
              isActive ? "bg-primary" : "bg-muted-foreground/30"
            }`}
            style={{
              height: isActive ? undefined : "8px",
              animation: isActive
                ? `sound-wave 1.2s ease-in-out ${i * 0.15}s infinite`
                : "none",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {isActive ? "Listening" : "Audio Ready"}
      </span>
    </div>
  );
};

export default AudioIndicator;
