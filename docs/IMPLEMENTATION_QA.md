# Historical implementation QA — 15 October 2026

This document preserves the initial review and PR #5 verification snapshots. Its test counts, browser observations and artifact hashes describe those revisions, not later release builds. For current release verification, use [Release QA](RELEASE_QA.md) and [the machine-readable verification record](VERIFICATION.json); published artifact identity and hashes are recorded in the release manifest.

Scope: the supplied consolidated implementation brief dated 15 October 2026, reconciled with `Namdev90/quiz-show-kit`.

Starting commit: `404ca0114b4815605f9726549dfb0e068d4d9fdd` (main). Working branch: `codex/accepted-brief-2026-10-15`. The initial review snapshot was local. The user subsequently supplied the actual Chota Namu artwork and authorized pushing; that tested tree was published in [PR #5](https://github.com/Namdev90/quiz-show-kit/pull/5), initially as a draft. The later authorized setup-mode/showcase changes were included, the PR checks succeeded, and PR #5 merged as [`176848018ac2703c7ca683a6538baed75ce35e24`](https://github.com/Namdev90/quiz-show-kit/commit/176848018ac2703c7ca683a6538baed75ce35e24). The original BioVista files are archived under `examples/biovista/original/`; its current public route is a regenerable showcase. The repository had no open issues/PRs when initially inspected; merged PRs #1–#4 were reviewed. See the follow-up record below for that scope and its actual checks.

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

`node --test tests/host-character.test.cjs`: **2/2 passed** (28,017.7 ms). DOM checks cover absence from generic configurations; exact supplied PNG data/alt text; welcome/About placement; off/on persistence; absence from gameplay/results; no runtime GIF; and no network requests. This is DOM emulation, not a rendered Windows/macOS or physical-display test. The subsequent actual-browser character check and full integrated rerun are recorded under “Pre-push validation after supplied artwork” below.

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

## Teacher/Competition and current BioVista follow-up

The user requested a first-run choice of Teacher mode (automatic sensible presets and essential questions) or Competition mode (all supported granular controls), then explicitly requested pushing the addition and making BioVista the current feature example. The first unresolved question now offers exactly those two modes. Explicit/readable saved modes skip that question; switching preserves prior choices. `setup=teacher|competition` persists in QSK1 keys and settings exports, independently of quiz presets and full/short playback. Older keys retain their original decoder/runtime behavior.

The existing example route now uses `biovista.showcase.config.json` and the current compiler/engine. Shuffle, three-second discussion, rising matched-pair difficulty, alternating round starters, all statistics, revision reports and the actual supplied Chota Namu PNG are enabled. Alternative settings, host tools, import/rollback and feature limits are mapped in [the example guide](../examples/biovista/README.md). Original question meanings, answer keys, historical source references, paired inventory and scoring/timing rules remain unchanged. Six existing numerical cards and six other image cards receive descriptive subtype labels; there are still seven visuals because one numerical card also contains a visual.

At the PR #5 snapshot, only the unscored DEMO received new option explanations and source-review metadata after inspecting NIST's SI Units “Base and Derived Units” section on 15 October 2026. The other 40 cards are not represented as freshly verified and still lack per-option rationales. The companion quality review records 93 advisory candidates, not 93 proven factual errors. No graph/code/sequence/matching content was fabricated to claim complete content-subtype coverage. Rejected and unresolved features remain excluded.

The historical HTML, original bank, notices and provenance are archived byte for byte under `examples/biovista/original/`; the canonical root configuration and original public question JSON are unchanged. PR #5 snapshot showcase SHA-256: `0a1e278f86e3d21d18ec40ee0c54f958b0d0354e92acb6259302d5d6b865722d`. Archived HTML SHA-256: `936403df41cc07e451158550df76f32be34c717a0f2e9e1280e76d6bfc9331b6`. The showcase has its own profile identity, so historical event checkpoints are not silently imported into different settings.

`npm run build:launcher` now regenerates the showcase and copies matching HTML/DOCX/settings/review companions to the public Pages directory. `npm run build:example -- --authoring` deliberately refreshes the published DOCX and its binding metadata; a changed configuration makes an old companion fail the normal build instead of being silently advertised as current. Ordinary quiz building remains Node-only.

The PR #5 snapshot's final `npm run check` passed: baseline build, current showcase/launcher generation, configuration validation and **78/78 tests**, zero failures/cancellations/skips (104.97 seconds in the test runner). This includes 10 preset checks, five showcase checks, the actual published 41-ID DOCX zero-change preview, and the retained 32-scenario engine runner. The first integrated attempt exposed a test expectation that counted the numerical-with-image card twice as an image subtype; the assertion and guide wording were corrected. A browser harness initially clicked during the protected entrance, and was corrected to wait for the actual enabled phase. Neither required changing gameplay code.

The final generated showcase was actually opened via `file://` in an offline Linux Chromium 134.0.6998.35 context. Focused checks passed for Chota at 1366×768 and 1024×768, enabled settings, embedded-media preflight, full isolated engine rehearsal, an actual audience popup, practice explanations aligned with shuffled choices, one real main question with discussion/scoring/source reveal, scored Avoid replacement with disclosed mismatch and rollback, M19 image zoom/return, statistics/revision/credits downloads and a downloaded HTML resume with the same ledger. There were zero page errors and zero HTTP requests in the primary context. M19 was reached through explicitly labeled deterministic skip transitions; this focused run did not repeat all 30 live questions. Its scoped report/screenshots are in local ignored `test-results/showcase/` output. The earlier full-event run remains separately recorded above. **Actual Windows and macOS/Safari tests were not performed.** Physical audio/projector validation is also outstanding.

At the PR #5 snapshot, START + AGENTS totaled 6,291 UTF-8 bytes / 809 whitespace-separated words, within the 6,500-byte startup budget. Local Markdown targets resolved. Source/documentation whitespace checks passed; generated HTML retained existing bundled vendor whitespace, intentionally unchanged.

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

The initial review package includes checksums and a concrete draft PR description. Its separate binary-safe implementation patch is based on the recorded starting commit. That package remains an initial-review snapshot. PR #5 contained the tested implementation, including the later setup-mode/showcase addition, and merged as `176848018ac2703c7ca683a6538baed75ce35e24` after successful checks. Current release verification is maintained separately in the records linked above. No unrelated private material or new event branding was authorized for publication by those actions.

## v1.1.2 evidence follow-up

The subsequent [evidence review](../examples/biovista/EVIDENCE_REVIEW.md) completes the forty inherited card reviews and 160 new option rationales. All thirteen non-metadata warnings have explicit dispositions; M23's neutral accessible label corrects the direct pre-reveal disclosure. This supersedes the historical gap status above without changing its dated test evidence. Current source, actual Windows browser, package and publication checks are maintained in [release QA](RELEASE_QA.md).
