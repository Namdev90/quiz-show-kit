# Prompt library and voice verification

Review date: **15 October 2026**. This supersedes the retired browser-builder verification.

## Scope delivered

- One QSK1 launch prompt, a reusable research/design/repair library, five quiz presets plus Custom, and five visual presets plus Custom.
- Public versioned preset decoder, reusable settings export/application, dynamic authoring availability, and portable configuration output with embedded approved assets.
- Local-only browser TTS, Smart one-word / Full / Letters option cues, untimed question narration, supplied human/model recordings, language/rate/voice settings, and cancellation on incompatible transitions.
- A lightweight prompt-copy landing page, a visual README, and removal of the browser quiz editor and its production build path.

## Automated checks

`npm run check` builds the canonical offline quiz and matching root/Pages launchers, validates the real 41-card BioVista bank and runs **41 top-level tests**. The engine suite includes **22 internal scoring/timing/recovery cases**. The checks use Node.js 24 and jsdom with simulated platform/audio APIs. See `VERIFICATION.json` for the recorded result.

The tests cover all 25 quiz/theme combinations; named and custom profile reuse; legacy presentation preservation; relocated asset embedding; rejected unsupported keys and unsafe assets; scoring/timeout/pause/undo/recovery; no hidden-option narration; local-voice filtering; recorded-clip priority; silence and unavailable-voice fallback; live motion dependencies; correct Pass/Skip wording; and exact launcher clipboard/fallback behavior.

Independent source review found and corrected the relocated-asset and saved-key bugs, ineffective motion controls, misleading Pass labels, broken library navigation, and stale verification claims. Repository Markdown link checks found no broken relative targets. The source configuration and preserved BioVista examples are unchanged.

## What remains unverified

Real Chromium inspection was attempted using an installed browser, but launch failed before any page loaded with `socket(): Operation not permitted`. Therefore current browser layout, visual theme quality, real clipboard permissions and audible voice output are **not verified** by this run. No screenshot or recording is claimed.

The TTS/model catalog uses official sources checked on the stated date; no paid synthesis, listening benchmark or provider account access was exercised. Installed voices vary by event device. Actual assistant retrieval/interview in a separate conversation, factual accuracy of newly authored questions, physical speakers/projector and end-to-end screen capture require their own checks.

Cloud narration is generated before building, when authorized tools are available; it is not a live cloud integration in the event. Custom reuse needs the settings attachment or accessible full configuration. QSK1 is public shorthand, not a secret cipher or cross-chat memory.

## Asset-library and lean-startup follow-up

The catalog records 21 existing/imported files, including eight exact upstream Lucide icons with their full license. Tests verify paths, hashes, explicit reuse scope and license embedding through the existing compiler. Three additional library tests bring the current top-level total to 41. The new startup reads START + AGENTS only, deferring detailed modules to their stage; `docs/PROMPT_BUDGET.json` records 39,796 → 5,022 UTF-8 bytes (87.4% smaller). This is startup text size, not measured total tokens or cost. No global hooks, generator/model installs or cloud generation were performed. Runtime source and the preserved example are unchanged by this follow-up.
