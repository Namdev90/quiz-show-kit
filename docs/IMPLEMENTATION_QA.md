# Consolidated brief implementation — 15 October 2026

Scope: the supplied consolidated implementation brief dated 15 October 2026, reconciled with `Namdev90/quiz-show-kit`.

Starting commit: `404ca0114b4815605f9726549dfb0e068d4d9fdd` (main). Working branch: `codex/accepted-brief-2026-10-15`. The initial review snapshot was local: no remote push, PR, merge, deployment, message or public issue had been performed. The user subsequently explicitly authorized pushing the reviewed implementation and supplied the actual Chota Namu artwork. Branch push and draft-PR preparation are authorized; their result is pending confirmation. No merge or deployment is authorized by that instruction. The repository had no open issues/PRs when initially inspected; merged PRs #1–#4 were reviewed. New work preserves the prompt launcher and the immutable original BioVista example.

## Changes and decisions

See [coverage matrix](IMPLEMENTATION_COVERAGE.md) for every accepted, rejected and unresolved item, [configuration](CONFIGURATION.md) for new settings, and [question-bank workflow](library/QUESTION_BANK.md) for DOCX commands. The source/runtime changes are compiler validation and provenance, stable option identities, safe shuffling, discussion timing, paired difficulty sequencing, two-team round rotation, reserve/avoid audit policy, host-selected statistics/revision, source reveal, image zoom, language-label configuration, repair diagnostics, isolated rehearsal, preflight and audience display. Reusable settings include the new optional configuration.

The current engine genuinely supports two teams. The brief explicitly requires a decision before a multiteam architecture extension, so no multiteam reel selector or absent-team policy was invented. The visual planner, role rotation, free-text answers, drag/drop interactions, special sensory preset and retention dashboard remain excluded or unresolved as specified.

The existing Parul/PCAHS logo has event-specific approval recorded; the intended wider use still needs confirmation. The user subsequently supplied the actual Chota Namu PNG/GIF and authorized project-scoped use and repository publication. The unchanged PNG is optional on welcome/About/settings with a visibility toggle; the GIF is retained as supplied reference. No substitute likeness or gaze animation was generated. [Asset review](ASSET_REUSE_REVIEW.md) documents that narrower permission and the ongoing speech-recording/trademark restrictions. Existing locked dev dependencies were restored using `npm ci --ignore-scripts`; no new runtime dependency/model was adopted. The installed python-docx 1.2.0 supports DOCX export; import uses bounded Python standard-library ZIP/XML processing. `requirements-authoring.txt` pins the already used authoring toolchain (python-docx 1.2.0, lxml 6.1.1 and typing_extensions 4.16.0) for reproducible contributor/CI setup. No local pip installation was performed for this change; CI installs that toolchain in a virtual environment. Python is not required for ordinary quiz building or offline play.

## Initial review verification record

The commands and browser observations below describe the initial reviewed implementation, before the later supplied-character integration. They remain evidence for that snapshot; character-specific checks and the publication result require their own confirmed record.

- Baseline `npm run check`: passed, 41 top-level tests including the original 22-case engine runner.
- Final integrated `npm run check`: **passed**, 66 top-level tests, zero failures (117.3 seconds in the test runner). This includes the engine runner with 32 internal scenarios.
- Focused engine checks: 32/32, including original scoring/clock/recovery cases and a real checkpoint fixture generated from the untouched starting engine.
- Focused DOCX checks: 12/12 (rerun after the final import-order preview regression was added), including malicious/unsupported documents, verification recheck, preview isolation, tampering/stale-review guards and byte-exact rollback.
- Existing presentation/voice checks: 15/15. New host helpers: 4/4; host DOM interactions: 3/3.
- Session checks cover independent full/tie simulation, reserve replacement, pass receipt, paused reveal restoration, missing media and reusable settings.
- Original BioVista files are unchanged. Legacy unchanged configuration fingerprint remains `biovista-2026:7100e679`; compatible metadata-only version-5 checkpoints migrate after integrity validation. Material content/rule changes remain incompatible by design.
- `git diff --check`, local documentation links and startup prompt measurement are included in final verification. START + AGENTS totals 5,217 UTF-8 bytes; this is instruction size, not token billing savings.

## Subsequent supplied-character checks

`node --test tests/host-character.test.cjs`: **2/2 passed** (28,017.7 ms). DOM checks cover absence from generic configurations; exact supplied PNG data/alt text; welcome/About placement; off/on persistence; absence from gameplay/results; no runtime GIF; and no network requests. This is DOM emulation, not a rendered Windows/macOS or physical-display test. The subsequent actual-browser character check and full integrated rerun are pending confirmation in this pre-publication record.

## Real environments

| Environment | Actual execution | Scope |
| --- | --- | --- |
| Linux x64, Node 24.19.0 | Yes | Build, schema, unit/integration, jsdom and CLI checks. jsdom clock/audio/storage APIs are simulations, not browser evidence. |
| Linux Chromium headless 134.0.6998.35 | Yes | Local `file://` launch with offline network context; rendered interactions and screenshots at 1366×768, 1920×1080 and 1024×768. Final browser findings recorded below. |
| Linux LibreOffice | Yes | Exported two-question DOCX opened/saved/reimported with no question changes; three-page template visually inspected. Not Microsoft Word or macOS Word testing. |
| Windows | **Not tested** | No Windows machine/browser session was available. |
| macOS / Safari | **Not tested** | No actual Mac/Safari session was available. Linux Chromium, jsdom or Linux WebKit cannot establish Safari compatibility. |

Desktop Chromium initially failed on an environment socket restriction. The already-installed Chromium headless shell launched without escalation. No browser was downloaded. Browser fixture clocks use 600 seconds to avoid test-run scheduling delays while preserving real short reveal/discussion transitions; ordinary/custom clock boundaries are separately covered by engine tests. The screenshot text-size check uses CSS zoom and is not claimed as browser-toolbar zoom verification.

Reproduce rendered checks with installed Playwright and Chromium:

```sh
QSK_PLAYWRIGHT_MODULE=/path/to/playwright \
QSK_BROWSER_EXECUTABLE=/path/to/chromium-headless-shell \
node scripts/brief-browser-smoke.cjs
```

`test-results/brief-browser/results.json` records the 30-card main-event run plus practice. `test-results/brief-browser/tie/results.json` independently records a smaller matched tie fixture (two main cards and two tie cards). The review package carries scoped JSON reports and screenshots for both. Headless screenshots do not certify projector optics, audible narration or physical dual-display placement.

## Offline launch and recovery

Extract the review package and open `Quiz_Offline.html` in a browser. Gameplay scripts, styles and permitted selected media are embedded; there is no required server, runtime CDN or live AI service. Settings → Check offline readiness checks configuration/media. Run complete rehearsal check uses isolated engine state; Preview rehearsal on screen shows a short labeled demonstration and restores official state with a paused clock. Neither is a new factual review of the inherited example bank.

Source links open a separate page and require internet. Bibliographic notes remain in the local file. Sound requires a real gesture; browser speech depends on installed voices. Physical audibility and pronunciation still require the event machine. Use an extended display for the audience window; mirroring exposes the host screen. This is presentation privacy, not a hostile-client security boundary: the host HTML contains the question bank.

After interruption, reopening offers Resume/Start fresh. Storage is browser-dependent. Save resume copy downloads a portable checkpoint; keep the file with the host. Changing educational content or scoring requires a new compatible configuration, not forcibly importing an unrelated checkpoint.

## Native platform validation still required

On actual Windows Chrome/Edge and actual macOS Safari (plus Chrome where used): open the extracted HTML via its normal file route with network disabled; run preflight and full live/practice flows; test local media/TTS; refresh/reopen plus downloaded resume; download reports; try image zoom/Escape and keyboard navigation; allow/deny popup and move audience to an extended display; use the target projector aspect ratio and 100/125/150/200% browser zoom; test screen recording where supported. Record OS/browser versions and failures. Do not mark these platforms verified until those runs occur.

## Initial integrated results

Automated build/launcher/validation and the integrated suite passed. The final DOCX import-order preview change was separately verified by all 12 question-bank tests.

Actual rendered Linux Chromium checks passed: local offline startup; 30 main cards plus practice; a separate two-main/two-tie fixture exercising a wrong tie answer and equal tie opportunities; final scoring and refresh recovery; fixed coin outcome through resizing; blocked pass choices; source/explanation reveal; image zoom; and long names/options at all three recorded viewports. Gameplay made zero network requests and produced zero page errors. An external reference opened separately and failed with `net::ERR_INTERNET_DISCONNECTED` while quiz state and scores remained intact. Larger CSS text remained usable through content scrolling, with critical controls retained; this is not a claim that arbitrarily long content fits on one screen.

The delivered full 41-question DOCX and embedded-media configuration were paired and reimported with zero content/order changes. The inherited bank review reports 92 advisory candidates: 41 missing new verification records, 41 missing per-option explanations, seven wording checks and three possible image-label/filename clues. These do not establish 92 factual errors; no source or rationale was invented. The representative Linux LibreOffice save/reimport also preserved question semantics.

## Pre-push validation after supplied artwork

After integrating the supplied character, the quiz build, launcher build and configuration validation passed; the original configuration fingerprint remained `biovista-2026:7100e679`. The complete direct test command `node --test tests/*.test.cjs` passed **70/70** with no failures, cancellations or skips (66.9 seconds). Focused compiler/catalog checks passed 16/16 and character DOM checks passed 2/2. Both original BioVista directories and the canonical `quiz.config.json` remain unchanged.

Actual Linux Chromium 134.0.6998.35 rendered the exact supplied PNG offline at 1366×768 and 1024×768, on welcome and About/settings. The visibility checkbox hid both immediately, persisted across reload and restored the image when enabled. The character was absent from the real question screen and an explicitly synthetic final-presentation state; this focused check did not repeat the already recorded full event. No network requests or page errors occurred. Screenshots and the scoped report are in the local `test-results/character/` output. Windows and macOS/Safari remain untested.

The publication review checked asset hashes/provenance and excluded private brief pointers, question-bank uploads, logs and generated review packages from the source branch. The supplied artwork is project-scoped, not generally relicensed under MIT. The CI workflow now declares the existing DOCX authoring packages instead of assuming they are preinstalled; its remote execution result belongs to the pull request checks.

## Implementation file map

| Area | Changed or added source paths |
| --- | --- |
| Schema and bank review | `src/compiler.js`, `src/question-bank.js`, `scripts/question-bank.cjs`, `scripts/question-bank-docx.py` |
| Event state and reusable settings | `src/engine.js`, `src/presets.js` |
| Host and presentation | `src/ui.js`, `src/host-tools.js`, `src/host-tools.css`, `src/session-tools.js`, `src/session-tools.css`, `scripts/runtime.cjs` |
| Supplied character | `assets/characters/chota-namu.png`, `assets/characters/chota-namu-idle.gif`, `assets/characters/NOTICE.md`, `assets/characters/PROVENANCE.json`, `assets/catalog.json`, `assets/README.md`, `THIRD_PARTY_NOTICES.md` |
| Regression evidence | `tests/compiler.test.cjs`, `tests/engine.test.cjs`, `tests/library.test.cjs`, `tests/brief-regression.test.cjs`, `tests/host-tools.test.cjs`, `tests/host-ui.test.cjs`, `tests/host-character.test.cjs`, `tests/question-bank.test.cjs`, `tests/session-tools.test.cjs`, `tests/fixtures/legacy-engine-v5-checkpoint.json`, `scripts/brief-browser-smoke.cjs` |
| Authoring and review guides | `README.md`, `prompts/START.md`, `docs/TEACHER_PROMPT.md`, `docs/CONFIGURATION.md`, `docs/PROMPT_BUDGET.json`, `docs/ASSET_REUSE_REVIEW.md`, `docs/IMPLEMENTATION_COVERAGE.md`, `docs/IMPLEMENTATION_QA.md`, `docs/library/FEATURES.md`, `docs/library/PRESETS.md`, `docs/library/QUESTION_RESEARCH.md`, `docs/library/QUESTION_BANK.md`, `docs/library/README.md`, `docs/library/REUSE_PROTOCOL.md` |
| Authoring setup/build hygiene | `requirements-authoring.txt`, `.github/workflows/check.yml`, `.gitignore` (Python cache/virtual-environment files), contributor setup commands in `README.md` |

The initial review package includes checksums and a concrete draft PR description. Its separate binary-safe implementation patch is based on the recorded starting commit. That package remains an initial-review snapshot. The user's later push instruction authorizes the reviewed branch publication and draft PR; record actual remote URLs/commit results only after they are confirmed. It does not authorize merging, deploying or unrelated publication of private/event-restricted material.
