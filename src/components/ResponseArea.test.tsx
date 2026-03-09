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
    expect(start).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.any(Function)
    );
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
