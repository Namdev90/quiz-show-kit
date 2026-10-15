# Release 1.1.0 verification — 15 October 2026

This is the current release record. [Earlier implementation checks](IMPLEMENTATION_QA.md) describe their own snapshots; [the initial machine-readable record](history/VERIFICATION-2026-10-15-initial.json) remains unchanged. The current machine-readable summary is [VERIFICATION.json](VERIFICATION.json).

The final release incorporates [PR #6](https://github.com/Namdev90/quiz-show-kit/pull/6), merged at `9f11de0cb3190077f0a1575e10d98e8fba496399`: checkpoint opportunity reconciliation, complete DOCX binding checks and archive-bound showcase preservation. The exact PR engine passed 38/38 cases plus 65 additional local checkpoint probes. Its GitHub CI passed 94 tests before integration.

## Automated checks

`npm run check` passed: canonical build, launcher/showcase generation, configuration validation and **107/107 tests**, with zero failures, cancellations or skips (106.80 seconds in the test runner). The retained engine runner covers 38 internal scenarios. Coverage includes the PR #6 recovery/publication regressions, four deterministic provenance cases, safe diagnostic provenance and eight release packaging cases. Packaging tests cover clean/tracked source identity, matching versions and companions, stale runtime provenance, byte hashes, pinned handoff links and refusal to overwrite outputs.

Before PR #6 integration, repeating `npm run build:launcher` preserved all 15 recorded launcher/showcase/companion files byte for byte; the combined suite also verifies reproducibility across unrelated commits and dirty state. Current and Pages copies match. Runtime source SHA-256 is `bc31460c878e4976e119e3c0bf2036a0bc65b1f232e540a3ed6bd9f08f1216f0`; current showcase SHA-256 is `d2e2cbea19068e7af1cffbd27cfaaccae477e5e63cdc60d5491c9cd449c7b8d4`. The archived original remains `936403df41cc07e451158550df76f32be34c717a0f2e9e1280e76d6bfc9331b6`.

## Actual browser scope

Linux 6.18.44 / Chromium headless 134.0.6998.35 actually opened the final integrated HTML offline and rendered welcome, the supplied Chota Namu, version 1.1.0 and the exact source digest. The rendered repair handoff retained the validated version/digest. No page errors or HTTP requests were recorded. The scoped report and screenshots are under ignored `test-results/release-1.1-integrated/`.

This final browser run is **partial**. Practice reached reveal with official scores still 0–0, but the harness attempted Confirm after that control was no longer present. Its selected-answer assertion and subsequent main/pass/Undo/reload checks were therefore not established. No further browser retry was performed. An earlier pre-integration attempt also stopped during a protected paused reveal amid execution-server stalls; that separate report remains under `test-results/release-1.1/`. Neither attempt is claimed as a completed final-file gameplay pass. Automated recovery tests and the separately recorded prior full-event/focused browser checks remain evidence for their stated scopes.

| Environment | Actual result |
| --- | --- |
| Linux Node.js 24 | Build, validation and all 107 tests passed; 38 internal engine cases. |
| Linux Chromium 134 | Final-file welcome, character and repair provenance passed; practice reached reveal, but the planned interaction/recovery run was incomplete. |
| Windows | [PR #6](https://github.com/Namdev90/quiz-show-kit/pull/6) reports actual headless Chrome 155.0.8059.40 and Edge 155.0.4283.45 checks on its own revision. Not reproduced in this Linux session; the final integrated release package was not rerun on Windows. |
| macOS / Safari | Not actually tested. |
| Physical speakers, projector, extended displays | Not tested on event hardware. |

PR #6's Windows scope was offline local-file reveal, pass metrics/scoring, Undo, reload recovery, forged-checkpoint rejection and repair provenance. Its report does not establish manual desktop, Word, audible narration, projector or final-package certification.

## Publication controls

The real clean-checkout `npm run build:release` completed successfully. All nine assets and all eight checksum entries were verified. The ZIP contained exactly the 167 tracked source files, with no ignored files or private review material. After extraction into a fresh temporary directory without a Git checkout or installed dependencies, the ordinary Node build reproduced the released showcase HTML byte for byte. The standalone handoff used commit-pinned links. All 191 checked local Markdown targets resolved. Source/documentation whitespace checks passed; generated HTML retains existing vendor formatting.

The release packager accepts only a clean identified Git tree, includes only tracked archive content, validates current generated files and preserves the historical archive. Standalone handoff links pin to the packaged commit. It does not install, regenerate or publish anything.

The main-branch release workflow first runs checks with read-only repository access. A dependent publishing job builds the exact same commit, atomically creates its version tag, publishes nine assets, then downloads and compares every asset byte for byte. Existing tags/releases are never overwritten. Remote execution and publication results are recorded by the corresponding GitHub Actions run and release manifest; this document does not pre-claim them.
