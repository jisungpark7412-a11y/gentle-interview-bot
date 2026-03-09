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

  it("aborts the existing instance before creating a new one on double-start", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // First start — captures the first mock instance
    act(() => {
      result.current.start(vi.fn(), vi.fn(), vi.fn());
    });
    const firstInstance = mockInstance;

    // Replace the mock so the second call gets a fresh instance
    const secondInstance = makeMockRecognition();
    (window.SpeechRecognition as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(secondInstance);

    // Second start — should abort the first instance first
    act(() => {
      result.current.start(vi.fn(), vi.fn(), vi.fn());
    });

    expect(firstInstance.abort).toHaveBeenCalledTimes(1);
    expect(secondInstance.start).toHaveBeenCalledTimes(1);
  });

  it("sets isListening to false immediately when stop() is called, without waiting for onend", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.start(vi.fn(), vi.fn(), vi.fn());
    });
    expect(result.current.isListening).toBe(true);

    // Call stop() but do NOT fire onend
    act(() => {
      result.current.stop();
    });
    expect(result.current.isListening).toBe(false);
  });

  it("only processes results from event.resultIndex onward, not from 0", () => {
    const onFinal = vi.fn();
    const onInterim = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.start(onInterim, onFinal, vi.fn());
    });

    // Simulate a second event where resultIndex=1 — result[0] is already processed
    act(() => {
      mockInstance.onresult({
        resultIndex: 1,
        results: [
          Object.assign([{ transcript: "already seen" }], { isFinal: true }),
          Object.assign([{ transcript: "new result" }], { isFinal: true }),
        ],
      } as any);
    });

    // onFinal should only be called with the new result, not "already seen"
    expect(onFinal).toHaveBeenCalledTimes(1);
    expect(onFinal).toHaveBeenCalledWith("new result");
  });
});
