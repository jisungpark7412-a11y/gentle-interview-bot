# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev         # Start Vite dev server
npm run build       # Production build
npm run lint        # ESLint
npm run test        # Run tests once (vitest)
npm run test:watch  # Run tests in watch mode

# Run a single test file
npx vitest run src/path/to/file.test.ts
```

## Architecture

This is a single-page React app (Vite + TypeScript + Tailwind + shadcn/ui) for practicing product-sense interviews. There is only one real page (`/`).

### Interview flow

All interview state lives in `src/pages/Index.tsx` as a state machine:

```
idle → asking → waiting → processing → asking → ... → complete
```

- **`idle`**: Welcome screen with "Begin Interview" button.
- **`asking`**: AI response is streaming in via SSE; `QuestionDisplay` shows text with a blinking cursor.
- **`waiting`**: Candidate types their answer in `ResponseArea`.
- **`processing`**: Briefly shown while preparing the next AI call.
- **`complete`**: The AI appended `[INTERVIEW_COMPLETE]` to its final message; feedback is displayed.

The full conversation history is kept in a `useRef<ChatMessage[]>` (not state), so it never triggers re-renders.

### Backend: Supabase Edge Function

`supabase/functions/interview-chat/index.ts` is a Deno function that:
- Receives `{ messages: ChatMessage[] }` from the frontend.
- Prepends a fixed system prompt and calls `https://ai.gateway.lovable.dev/v1/chat/completions` (Lovable AI gateway, model `google/gemini-3-flash-preview`) with `stream: true`.
- Pipes the SSE response straight back to the client.
- Requires `LOVABLE_API_KEY` as a Supabase secret (set via Supabase dashboard or `supabase secrets set`).
- Signals interview completion by including `[INTERVIEW_COMPLETE]` in its final message; the frontend strips this before display.

### Streaming client

`src/lib/streamChat.ts` manually parses the SSE stream (line-by-line, `data: ` prefix, `[DONE]` sentinel) and fires `onDelta(chunk)` for each content token and `onDone()` when the stream ends.

### Environment variables

Required in `.env` for local dev:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

### Styling conventions

- Dark-only theme. CSS custom properties are defined in `src/index.css` (no light mode variables).
- Body font: **DM Sans**; heading/display font: **Space Grotesk** (applied via `font-display` Tailwind utility).
- Custom animations (`animate-float`, `animate-fade-up`, `animate-cursor-blink`, etc.) are defined in `src/index.css` — prefer these over inline styles for motion.
- Custom color tokens: `--surface`, `--surface-elevated`, `--glow`, `--glow-muted` extend the shadcn palette.
- `AIOrb` is a Canvas-based animated component; it pulses faster when `isListening` is true.

### Path aliases

`@/` maps to `src/` (configured in Vite and `tsconfig`).
