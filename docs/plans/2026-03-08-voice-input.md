# Voice Input Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire up the browser Web Speech API so users can click a mic button in the textarea, speak their answer, and have the transcribed text populate the input for review before submitting.

**Architecture:** A new `useSpeechRecognition` hook wraps the browser `SpeechRecognition` API with interim + final transcript callbacks. `ResponseArea` consumes the hook and renders a mic button inside the existing textarea row. The legacy `AudioIndicator` component and its wiring in `Index.tsx` are removed.

**Tech Stack:** React, TypeScript, Vitest + React Testing Library, Web Speech API (`window.SpeechRecognition` / `window.webkitSpeechRecognition`), lucide-react (`Mic`, `MicOff`), sonner (`toast`)

---

### Task 1: Create `useSpeechRecognition` hook

**Files:**
- Create: `src/hooks/useSpeechRecognition.ts`
- Create: `src/hooks/useSpeechRecognition.test.ts`

---

**Step 1: Write the failing test**

Create `src/hooks/useSpeechRecognition.test.ts`:

```ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSpeechRecognition } from "./useSpeechRecognition";

// Minimal SpeechRecognition mock
function makeMockRecognition() {
  const instance = {
    continuous: false,
    interimResults: false,
    lang: "",
    onresult: null as any,
    onend: null as any,
    onerror: null as any,
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
  };
  return instance;
}

let mockInstance: ReturnType<typeof makeMockRecognition>;

beforeEach(() => {
  mockInstance = makeMockRecognition();
  const MockRecognition = vi.fn(() => mockInstance);
  Object.defineProperty(window, "SpeechRecognition", {
    writable: true,
    value: MockRecognition,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useSpeechRecognition", () => {
  it("reports isSupported true when SpeechRecognition exists", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
  });

  it("reports isSupported false when SpeechRecognition is absent", () => {
    Object.defineProperty(window, "SpeechRecognition", { writable: true, value: undefined });
    Object.defineProperty(window, "webkitSpeechRecognition", { writable: true, value: undefined });
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(false);
  });

  it("starts listening and calls start on the recognition instance", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.start(vi.fn(), vi.fn(), vi.fn());
    });
    expect(mockInstance.start).toHaveBeenCalledTimes(1);
    expect(result.current.isListening).toBe(true);
  });

  it("calls onInterim with interim transcript text", () => {
    const onInterim = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.start(onInterim, vi.fn(), vi.fn());
    });
    // Simulate an interim result
    act(() => {
      mockInstance.onresult({
        resultIndex: 0,
        results: [
          Object.assign([{ transcript: "hello world" }], { isFinal: false }),
        ],
      } as any);
    });
    expect(onInterim).toHaveBeenCalledWith("hello world");
  });

  it("calls onFinal with final transcript text", () => {
    const onFinal = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.start(vi.fn(), onFinal, vi.fn());
    });
    act(() => {
      mockInstance.onresult({
        resultIndex: 0,
        results: [
          Object.assign([{ transcript: "my final answer" }], { isFinal: true }),
        ],
      } as any);
    });
    expect(onFinal).toHaveBeenCalledWith("my final answer");
  });

  it("sets isListening false when recognition ends", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.start(vi.fn(), vi.fn(), vi.fn());
    });
    act(() => {
      mockInstance.onend();
    });
    expect(result.current.isListening).toBe(false);
  });

  it("calls onError with the error code on recognition error", () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.start(vi.fn(), vi.fn(), onError);
    });
    act(() => {
      mockInstance.onerror({ error: "not-allowed" } as any);
    });
    expect(onError).toHaveBeenCalledWith("not-allowed");
    expect(result.current.isListening).toBe(false);
  });

  it("calls stop on the instance when stop() is called", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.start(vi.fn(), vi.fn(), vi.fn());
    });
    act(() => {
      result.current.stop();
    });
    expect(mockInstance.stop).toHaveBeenCalledTimes(1);
  });

  it("aborts on unmount to release the microphone", () => {
    const { result, unmount } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.start(vi.fn(), vi.fn(), vi.fn());
    });
    unmount();
    expect(mockInstance.abort).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run the test to confirm it fails**

```bash
npx vitest run src/hooks/useSpeechRecognition.test.ts
```

Expected: FAIL — `Cannot find module './useSpeechRecognition'`

---

**Step 3: Write the implementation**

Create `src/hooks/useSpeechRecognition.ts`:

```ts
import { useRef, useState, useEffect } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = (
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (error: string) => void
  ) => {
    if (!isSupported) return;

    const Recognizer = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognizer();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        onFinal(final);
      } else {
        onInterim(interim);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      onError(event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
  };

  return { isSupported, isListening, start, stop };
}
```

**Step 4: Run the tests and verify they all pass**

```bash
npx vitest run src/hooks/useSpeechRecognition.test.ts
```

Expected: all 8 tests PASS

**Step 5: Commit**

```bash
git add src/hooks/useSpeechRecognition.ts src/hooks/useSpeechRecognition.test.ts
git commit -m "feat: add useSpeechRecognition hook"
```

---

### Task 2: Add mic button to `ResponseArea`

**Files:**
- Modify: `src/components/ResponseArea.tsx`
- Create: `src/components/ResponseArea.test.tsx`

---

**Step 1: Write the failing tests**

Create `src/components/ResponseArea.test.tsx`:

```tsx
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ResponseArea from "./ResponseArea";

// Mock the hook so tests don't need a real browser API
vi.mock("@/hooks/useSpeechRecognition", () => ({
  useSpeechRecognition: vi.fn(),
}));

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

function mockHook(overrides = {}) {
  (useSpeechRecognition as any).mockReturnValue({
    isSupported: true,
    isListening: false,
    start: vi.fn(),
    stop: vi.fn(),
    ...overrides,
  });
}

beforeEach(() => {
  mockHook();
});

describe("ResponseArea", () => {
  it("renders the textarea and send button", () => {
    render(<ResponseArea onSubmit={vi.fn()} isWaiting />);
    expect(screen.getByPlaceholderText("Type your answer...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("renders the mic button when speech is supported", () => {
    render(<ResponseArea onSubmit={vi.fn()} isWaiting />);
    expect(screen.getByRole("button", { name: /start voice input/i })).toBeInTheDocument();
  });

  it("does not render the mic button when speech is not supported", () => {
    mockHook({ isSupported: false });
    render(<ResponseArea onSubmit={vi.fn()} isWaiting />);
    expect(screen.queryByRole("button", { name: /voice input/i })).not.toBeInTheDocument();
  });

  it("calls start when mic button is clicked while not listening", () => {
    const start = vi.fn();
    mockHook({ start });
    render(<ResponseArea onSubmit={vi.fn()} isWaiting />);
    fireEvent.click(screen.getByRole("button", { name: /start voice input/i }));
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("calls stop when mic button is clicked while listening", () => {
    const stop = vi.fn();
    mockHook({ isListening: true, stop });
    render(<ResponseArea onSubmit={vi.fn()} isWaiting />);
    fireEvent.click(screen.getByRole("button", { name: /stop voice input/i }));
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("submits the response when send button clicked", () => {
    const onSubmit = vi.fn();
    render(<ResponseArea onSubmit={onSubmit} isWaiting />);
    const textarea = screen.getByPlaceholderText("Type your answer...");
    fireEvent.change(textarea, { target: { value: "My answer" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(onSubmit).toHaveBeenCalledWith("My answer");
  });
});
```

**Step 2: Run the tests to confirm they fail**

```bash
npx vitest run src/components/ResponseArea.test.tsx
```

Expected: FAIL — tests for mic button will fail since `ResponseArea` has no mic button yet

---

**Step 3: Rewrite `ResponseArea` to integrate the mic**

Replace the contents of `src/components/ResponseArea.tsx` with:

```tsx
import { Send, Mic, MicOff } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ResponseAreaProps {
  onSubmit: (response: string) => void;
  isWaiting: boolean;
}

const ResponseArea = ({ onSubmit, isWaiting }: ResponseAreaProps) => {
  const [response, setResponse] = useState("");
  const [isInterim, setIsInterim] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSupported, isListening, start, stop } = useSpeechRecognition();

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response.trim());
      setResponse("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stop();
      setIsInterim(false);
      return;
    }

    start(
      (interim) => {
        setResponse(interim);
        setIsInterim(true);
      },
      (final) => {
        setResponse(final);
        setIsInterim(false);
        setTimeout(() => textareaRef.current?.focus(), 0);
      },
      (error) => {
        setIsInterim(false);
        if (error === "not-allowed") {
          toast.error("Microphone access denied");
        } else if (error === "no-speech") {
          toast.error("No speech detected, try again");
        } else {
          toast.error("Speech recognition failed");
        }
      }
    );
  }, [isListening, start, stop]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
      {isWaiting && (
        <p className="text-center text-sm text-muted-foreground mb-4 animate-subtle-pulse">
          Take your time to think, then respond when ready...
        </p>
      )}
      <div className="relative flex items-end gap-3 bg-surface border border-border rounded-2xl p-3 focus-within:border-primary/40 transition-colors duration-300">
        <textarea
          ref={textareaRef}
          value={response}
          onChange={(e) => {
            setResponse(e.target.value);
            setIsInterim(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          rows={1}
          className={`flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-base leading-relaxed max-h-32 min-h-[2.5rem] py-1.5 transition-opacity duration-150 ${
            isInterim ? "opacity-50" : "opacity-100"
          }`}
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
        {isSupported && (
          <button
            onClick={handleMicClick}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            className={`relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
              isListening
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            {isListening && (
              <span className="absolute inset-0 rounded-xl border border-primary/40 animate-ripple" />
            )}
          </button>
        )}
        <button
          onClick={handleSubmit}
          aria-label="Send"
          disabled={!response.trim()}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-200"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ResponseArea;
```

**Step 4: Run the tests and verify they all pass**

```bash
npx vitest run src/components/ResponseArea.test.tsx
```

Expected: all 6 tests PASS

**Step 5: Commit**

```bash
git add src/components/ResponseArea.tsx src/components/ResponseArea.test.tsx
git commit -m "feat: add mic button to ResponseArea with speech-to-text"
```

---

### Task 3: Remove legacy `AudioIndicator` wiring from `Index.tsx`

**Files:**
- Modify: `src/pages/Index.tsx`

No new tests needed — this is pure deletion of dead code.

---

**Step 1: Remove `isAudioActive` state, `toggleAudio`, and the mic button**

In `src/pages/Index.tsx`, make the following changes:

1. Remove the `isAudioActive` state declaration:
   ```ts
   // DELETE this line:
   const [isAudioActive, setIsAudioActive] = useState(false);
   ```

2. Remove the `toggleAudio` callback:
   ```ts
   // DELETE these lines:
   const toggleAudio = useCallback(() => {
     setIsAudioActive((prev) => !prev);
   }, []);
   ```

3. In the `AIOrb` JSX, change `isListening` to remove `isAudioActive`:
   ```tsx
   // BEFORE:
   <AIOrb isListening={state === "waiting" || isAudioActive} />
   // AFTER:
   <AIOrb isListening={state === "waiting"} />
   ```

4. Remove the fixed-bottom mic button block entirely:
   ```tsx
   // DELETE these lines:
   {/* Audio Indicator */}
   <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
     <button onClick={toggleAudio} className="outline-none">
       <AudioIndicator isActive={isAudioActive} />
     </button>
   </div>
   ```

5. Remove the `AudioIndicator` import at the top:
   ```ts
   // DELETE this line:
   import AudioIndicator from "@/components/AudioIndicator";
   ```

**Step 2: Verify the app still type-checks**

```bash
npx tsc --noEmit
```

Expected: no errors

**Step 3: Run the full test suite**

```bash
npm run test
```

Expected: all tests PASS

**Step 4: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "chore: remove legacy AudioIndicator wiring from Index"
```

---

### Task 4: Manual smoke test

Start the dev server and verify the feature end-to-end:

```bash
npm run dev
```

Open `http://localhost:8080` in **Chrome or Edge** (required for Web Speech API).

Checklist:
- [ ] Click "Begin Interview" — interview starts, AI asks a question
- [ ] When in `waiting` state, a mic icon appears to the left of the Send button in the textarea
- [ ] Click the mic icon — it changes to `MicOff`, pulse ring appears, label reads "Listening"
- [ ] Speak a sentence — interim text appears dimmed in the textarea
- [ ] Stop speaking — final text replaces interim, textarea is focused and no longer dimmed
- [ ] Edit the transcript if desired, then press Send — answer is submitted, AI responds
- [ ] Click the mic, then click it again immediately — recognition stops, no crash
- [ ] Open in Firefox — mic button is hidden, text input still works normally
- [ ] (Optional) Deny mic permission in Chrome — toast "Microphone access denied" appears
