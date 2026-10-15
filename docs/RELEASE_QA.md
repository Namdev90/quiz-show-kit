# Release 1.1.0 verification — 15 October 2026

This is the current release record. [Earlier implementation checks](IMPLEMENTATION_QA.md) describe their own snapshots; [the initial machine-readable record](history/VERIFICATION-2026-10-15-initial.json) remains unchanged. The current machine-readable summary is [VERIFICATION.json](VERIFICATION.json).

## Automated checks

`npm run check` passed: canonical build, launcher/showcase generation, configuration validation and **91/91 tests**, with zero failures, cancellations or skips (134.12 seconds in the test runner). The retained engine runner covers 32 internal scenarios. New coverage includes four deterministic provenance cases, safe diagnostic provenance and eight release packaging cases. Packaging tests cover clean/tracked source identity, matching versions and companions, stale runtime provenance, byte hashes, pinned handoff links and refusal to overwrite outputs.

Repeating `npm run build:launcher` preserved all 15 recorded launcher/showcase/companion files byte for byte. Current and Pages copies match. Runtime source SHA-256 is `6934c22f78593f6634d4451ba58fbb06c76d3e815d21097a9ca4f9df1fd0ad79`; current showcase SHA-256 is `7d1367a92ffc127aae7db77d1aa5e49cf1a5516edcb7164f1af1e78a572bbf72`. The archived original remains `936403df41cc07e451158550df76f32be34c717a0f2e9e1280e76d6bfc9331b6`.

## Actual browser scope

Linux 6.18.44 / Chromium headless 134.0.6998.35 actually opened the final HTML offline and rendered welcome, the supplied Chota Namu, version 1.1.0 and the exact source digest. The rendered repair handoff retained the validated version/digest. No page errors or HTTP requests were recorded. The local scoped report and screenshots are under ignored `test-results/release-1.1/`.

This run is **partial**, not a new complete practice or event pass. An execution-server disconnection lost the first process. The restarted run reached sequential practice choices, then timed out waiting for discussion. Its screenshot showed a paused reveal with “Resume reveal”; the harness did not resume it. This is consistent with interruption protection during the observed environment stalls, but that is an inference, not a confirmed diagnosis. No gameplay code changed for this release; the separately recorded prior full-event and focused gameplay checks remain evidence for their own snapshots.

| Environment | Actual result |
| --- | --- |
| Linux Node.js 24 | Build, validation and all 91 tests passed. |
| Linux Chromium 134 | Final-file welcome, character and repair provenance passed; practice completion interrupted as described above. |
| Windows | Not actually tested. |
| macOS / Safari | Not actually tested. |
| Physical speakers, projector, extended displays | Not tested on event hardware. |

## Publication controls

The real clean-checkout `npm run build:release` completed successfully. All nine assets and all eight checksum entries were verified. The ZIP contained exactly the 166 tracked source files, with no ignored files or private review material. After extraction into a fresh temporary directory without a Git checkout or installed dependencies, the ordinary Node build reproduced the released showcase HTML byte for byte. The standalone handoff used commit-pinned links. All 191 checked local Markdown targets resolved. Source/documentation whitespace checks passed; generated HTML retains existing vendor formatting.

The release packager accepts only a clean identified Git tree, includes only tracked archive content, validates current generated files and preserves the historical archive. Standalone handoff links pin to the packaged commit. It does not install, regenerate or publish anything.

The main-branch release workflow first runs checks with read-only repository access. A dependent publishing job builds the exact same commit, atomically creates its version tag, publishes nine assets, then downloads and compares every asset byte for byte. Existing tags/releases are never overwritten. Remote execution and publication results are recorded by the corresponding GitHub Actions run and release manifest; this document does not pre-claim them.
