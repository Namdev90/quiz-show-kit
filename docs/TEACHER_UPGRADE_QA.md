# Teacher workflow upgrade — 14 October 2026

The teacher launch is a repository link plus a short instruction naming `docs/TEACHER_PROMPT.md`. The expanded prompt guides one decision at a time, suggests voice replies/defaults, researches questions and produces a complete configuration with the selected customization. The main builder action copies the instruction and opens the selected ChatGPT, Gemini or Claude provider; another-assistant mode copies only; paste is still required. Repository retrieval and actual conversational compliance, including rich UI in ChatGPT/Gemini/Claude depend on the receiving assistant’s available tools. Neither an actual ChatGPT interview nor automatic cross-site transfer was tested.

## Executed checks

`npm run check` builds the canonical offline quiz and matching root/Pages builders, validates the real 41-card BioVista bank and passes **45 top-level tests**. The engine test includes **22 internal scoring/timing/recovery cases**. Tests use Node.js 24 and jsdom with simulated browser platform/audio APIs; they do not establish real browser layout, audible sound or physical projector quality.

New checks additionally verify provider selection, live in-file settings with paused clocks and unchanged ledger, storage restoration, resume-copy embedding, and keeping creator/toolkit credit off results. New checks cover the short prompt’s exact target and settings context, custom even counts, complete configuration import/save fidelity, presentation validation, scoring/theme presets and extended timing controls, recoverable rounds and optional cards, full-prompt fallback, safe logo upload/removal and unsafe SVG rejection. Playback regressions cover silent/no-motion output, sequential disclosure and unchanged answer timing, suppression of decorative effects, and configurable volume/mute with real bundled audio code over simulated platform APIs.

The canonical configuration, assets and preserved `examples/biovista/` were not modified. Legacy imports without a `presentation` object retain cinematic defaults. New classroom drafts use gentle motion and 60% volume. Generated root and Pages HTML were rebuilt from source.

## Browser boundary

The local Playwright browser check could not start because Chromium was absent. An installation attempt failed to obtain a valid browser archive. Therefore the previous verification screenshots/report are historical evidence; they do not verify the current layout. Rendered responsive inspection and actual clipboard/tab-opening behavior of this upgrade remain unverified here. Teacher source review, a real ChatGPT interview and physical sound/projector rehearsal remain required.
