# Voice Input Design

**Date:** 2026-03-08
**Status:** Approved

## Problem

The microphone icon in `AudioIndicator` is a visual stub — clicking it sets a "Listening" CSS state but captures no audio. Users cannot give answers by voice.

## Goal

Allow users to click a mic button, speak their answer, and have the transcribed text populate the `ResponseArea` textarea for review before submitting.

## Approach

Use the browser's **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`). This requires no backend changes, has zero cost, and provides real-time interim transcription. The tradeoff is Chrome/Edge-only support; unsupported browsers gracefully hide the mic button.

## Architecture

All Web Speech API logic lives in a new `useSpeechRecognition` hook. `ResponseArea` consumes the hook and renders the mic button inline. `Index.tsx` and the Supabase backend are unchanged.

The existing fixed-bottom `AudioIndicator` component and its `toggleAudio` / `isAudioActive` wiring in `Index.tsx` are removed — superseded by the in-textarea mic.

## Components

### `src/hooks/useSpeechRecognition.ts` (new)

Wraps `window.SpeechRecognition` with the following config:
- `continuous: false` — stops after a natural pause
- `interimResults: true` — fires partial results while the user speaks

**Exposed API:**
```ts
{
  isSupported: boolean;
  isListening: boolean;
  start: (onTranscript: (text: string) => void) => void;
  stop: () => void;
}
```

- `isSupported` is `false` on Firefox/Safari (mic button is hidden)
- `start` begins recognition and calls `onTranscript` with the **final** result when the user stops speaking
- `stop` calls `.abort()` to cancel early (transcript up to that point is kept in textarea)
- Cleanup on unmount calls `.abort()` to release the microphone

### `src/components/ResponseArea.tsx` (modified)

A mic icon button (`Mic` / `MicOff` from lucide-react) is added to the left of the Send button inside the existing textarea container.

**States:**
- **Hidden** — `isSupported` is false
- **Idle** — `Mic` icon, muted color
- **Listening** — `MicOff` icon, primary color, subtle pulse ring; clicking stops recognition

**Behavior:**
- While listening, interim transcript is written into the textarea (slightly dimmed)
- On recognition end, final transcript replaces interim text; textarea is focused for editing
- Errors surface as toasts

### `src/pages/Index.tsx` (modified)

- Remove `isAudioActive` state and `toggleAudio` callback
- Remove the fixed-bottom `<button onClick={toggleAudio}>` wrapping `AudioIndicator`
- Remove `AudioIndicator` import

## Error Handling

| Scenario | Behavior |
|---|---|
| Unsupported browser | Mic button hidden |
| Permission denied | Toast: "Microphone access denied" |
| No speech detected | Toast: "No speech detected, try again" |
| Network/recognition error | Toast: "Speech recognition failed" |
| User stops early | Transcript up to that point is kept |

## Out of Scope

- Cross-browser STT via Supabase Edge Function + Whisper (future enhancement)
- Auto-submit on speech end
- Continuous listening across multiple questions
