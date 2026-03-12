import React from "react";

interface ScoreEntry {
  earned: number | null;
  outOf: number;
  notes: string;
}

interface ParsedFeedback {
  scores: Map<string, ScoreEntry>;
  totalEarned: number | null;
  overallSummary: string;
  topStrength: string;
  topAreaToImprove: string;
}

function parseScoreStr(s: string): { earned: number | null; outOf: number } {
  const clean = s.replace(/\*\*/g, "").trim();
  const m = clean.match(/^(\d+)?\s*\/\s*(\d+)$/);
  if (m) return { earned: m[1] ? parseInt(m[1]) : null, outOf: parseInt(m[2]) };
  return { earned: null, outOf: 0 };
}

function parseFeedback(text: string): ParsedFeedback {
  const scores = new Map<string, ScoreEntry>();
  let totalEarned: number | null = null;

  for (const line of text.split("\n")) {
    if (!line.includes("|")) continue;
    const parts = line.split("|").map(p => p.replace(/\*\*/g, "").trim());
    const cells = parts.slice(1, parts.length - 1);
    if (cells.length < 2) continue;
    const criteria = cells[0].trim();
    if (!criteria || criteria.match(/^-+$/) || criteria.toLowerCase() === "criteria") continue;

    const { earned, outOf } = parseScoreStr(cells[1]);
    const notes = (cells[2] || "").trim();

    if (criteria.toLowerCase() === "total") {
      totalEarned = earned;
    } else {
      scores.set(criteria, { earned, outOf, notes });
    }
  }

  const summary = text.match(/\*\*Overall Summary:\*\*\s*([\s\S]*?)(?=\n\*\*|\n---|$)/i)?.[1]?.trim() ?? "";
  const strength = text.match(/\*\*Top strength:\*\*\s*([\s\S]*?)(?=\n\*\*|\n---|$)/i)?.[1]?.trim() ?? "";
  const improve = text.match(/\*\*Top area to improve:\*\*\s*([\s\S]*?)(?=\n\*\*|\n---|$)/i)?.[1]?.trim() ?? "";

  return { scores, totalEarned, overallSummary: summary, topStrength: strength, topAreaToImprove: improve };
}

function findScore(scores: Map<string, ScoreEntry>, keyword: string): ScoreEntry | undefined {
  const lc = keyword.toLowerCase();
  for (const [key, entry] of scores.entries()) {
    if (key.toLowerCase().includes(lc)) return entry;
  }
  return undefined;
}

const CRITERIA = [
  { keyword: "answer structure", emoji: "🏗️", label: "Answer Structure" },
  { keyword: "user segment", emoji: "👤", label: "User Segments" },
  { keyword: "pain point", emoji: "📊", label: "Pain Points & Opportunities" },
  { keyword: "solution", emoji: "🧠", label: "Solutions" },
  { keyword: "prioriti", emoji: "🔧", label: "Prioritization" },
  { keyword: "metric", emoji: "🔢", label: "Metrics" },
] as const;

function ScoreBar({ earned, outOf }: { earned: number | null; outOf: number }) {
  const pct = earned !== null && outOf > 0 ? Math.round((earned / outOf) * 100) : 0;
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-border/50">
      <div
        className="h-1.5 rounded-full bg-primary transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ScoreCard({
  emoji,
  label,
  entry,
  delay,
}: {
  emoji: string;
  label: string;
  entry: ScoreEntry | undefined;
  delay: number;
}) {
  const scoreText = entry
    ? entry.earned !== null
      ? `${entry.earned} / ${entry.outOf}`
      : `— / ${entry.outOf}`
    : "—";

  return (
    <div
      className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-surface p-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <span>{emoji}</span>
          {label}
        </span>
        <span className="text-sm font-semibold text-primary tabular-nums">{scoreText}</span>
      </div>
      {entry && <ScoreBar earned={entry.earned} outOf={entry.outOf} />}
      {entry?.notes && (
        <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
      )}
    </div>
  );
}

interface FeedbackDisplayProps {
  feedbackText: string;
}

const FeedbackDisplay = ({ feedbackText }: FeedbackDisplayProps) => {
  const feedback = parseFeedback(feedbackText);
  const hasStructured = feedback.scores.size > 0;

  if (!hasStructured) {
    return (
      <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line max-w-2xl mx-auto px-4 text-center">
        {feedbackText}
      </p>
    );
  }

  const totalEmoji =
    feedback.totalEarned === null ? "🤔" :
    feedback.totalEarned >= 75 ? "😊" :
    feedback.totalEarned >= 50 ? "😐" : "😢";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-3 pb-10">
      {/* 1. Overall Summary */}
      {feedback.overallSummary && (
        <div className="rounded-2xl border border-border/50 bg-surface p-5 animate-fade-up" style={{ animationDelay: "0ms" }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Overall Summary
          </h3>
          <p className="text-sm text-foreground leading-relaxed">{feedback.overallSummary}</p>
        </div>
      )}

      {/* 2–7. Score cards in 2-col grid */}
      <div className="grid grid-cols-2 gap-3">
        {CRITERIA.map(({ keyword, emoji, label }, i) => (
          <ScoreCard
            key={keyword}
            emoji={emoji}
            label={label}
            entry={findScore(feedback.scores, keyword)}
            delay={100 + i * 60}
          />
        ))}
      </div>

      {/* 8. Total Score */}
      <div
        className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col items-center gap-2 animate-fade-up"
        style={{ animationDelay: "460ms" }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Total Score
        </span>
        <div className="flex items-center gap-3">
          <span className="text-5xl font-display font-bold text-foreground tabular-nums">
            {feedback.totalEarned ?? "?"}<span className="text-2xl text-muted-foreground">/100</span>
          </span>
          <span className="text-4xl">{totalEmoji}</span>
        </div>
      </div>

      {/* 9. Top Strength */}
      {feedback.topStrength && (
        <div
          className="rounded-2xl border border-border/50 bg-surface p-5 animate-fade-up"
          style={{ animationDelay: "520ms" }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <span>💪</span> Top Strength
          </h3>
          <p className="text-sm text-foreground leading-relaxed">{feedback.topStrength}</p>
        </div>
      )}

      {/* 10. Top Area to Improve */}
      {feedback.topAreaToImprove && (
        <div
          className="rounded-2xl border border-border/50 bg-surface p-5 animate-fade-up"
          style={{ animationDelay: "580ms" }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Top Area to Improve
          </h3>
          <p className="text-sm text-foreground leading-relaxed">{feedback.topAreaToImprove}</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;
