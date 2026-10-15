# Release 1.1.2 candidate verification — 15 October 2026

This records source and focused generated-candidate checks on Windows. Exact release commit/tree identity belongs in the release manifest; actual publication and downloaded-file verification are separate and reported against that package. Earlier [v1.1.1 verification](history/VERIFICATION-v1.1.1.json) and [implementation history](IMPLEMENTATION_QA.md) retain their dated scope.

## Source, evidence and regressions

Baseline/showcase/launcher builds and configuration validation passed. The editable DOCX was regenerated with the existing local Python 3.13.14/python-docx runtime and round-tripped all 41 stable IDs with no changes. Actual DOCX SHA-256 and configuration-fingerprint binding remain required before normal publication. The first restricted-sandbox interpreter launch failed before reading the bank; the existing runtime/export succeeded outside that sandbox.

`npm test -- --test-concurrency=2` passed **185 tests**, with zero failures, cancellations or skips (106.53 seconds). Nine new evidence/preservation tests cover exact receipts, complete source/rationale records, rejection of educational/ID/pair/scoring edits, explicit label corrections, missing-evidence publication claims, the known source-note cues, M23 label/zoom and shuffled rationale alignment. The M23 regression also reproduced and now prevents Enter on a feedback summary activating Next. Retained checks include 38 internal engine scenarios,56 mocked publisher cases and10 packaging cases; mocks are not live publication evidence.

The [evidence review](../examples/biovista/EVIDENCE_REVIEW.md) records 40 inherited factual reviews,160 new original option rationales,88 inspected source records across 41 cards and all 13 manual heuristic dispositions. No stem/option/key/overall-explanation correction was required. Twelve deliberate heuristic candidates remain visible; M23's direct label disclosure is corrected. All 164 rationales and41 overall explanations received a final sequence pass. Full/short deterministic engine journeys made 3278 pre-reveal field-hiding checks using simulated ticks. Shared DEMO-to-T01 teaching, pair-demand and reserve-coverage limitations remain explicit. Builds do not fetch sources.

## Actual focused Windows checks

| Installed browser | Viewport | Passed checks | Interruption resumes |
| --- | --- | ---: | ---: |
| Chrome 155.0.8059.40 | 1366x768 | 17 | 0 |
| Edge 155.0.4283.45 | 1920x1080 | 17 | 0 |

Both installed headless browsers opened the exact saved HTML through a file URL with network disabled. They checked all 41 embedded evidence records/164 rationales/88 sources, known source-note cue removal, M23's normal and keyboard-zoom labels, pre-reveal hiding, real discussion locking, shuffled rationale alignment, visible inspected-source dates, native Enter/Space source/rationale expansion, one correct direct award and horizontal fit. Both reported zero page errors and zero HTTP(S) gameplay requests.

The M23 prior-history fixture was generated through the actual engine using simulated ticks, checkpoint-validated/rebased and injected through the existing test hook. M23 then used real clocks and native keyboard input; the driver could resume a genuine interruption pause. Decorative entrances used the existing skipMotion helper. The score check is one real M23 award relative to synthetic prior scores. **This is focused rendering/input verification, not a complete real-time quiz journey or physical screen-reader/speaker test.**

The broad all-correct browser harness did not complete a clean full run during this release task. Earlier attempts stopped at interruption pauses, moving-control stability waits or unreliable forced-pointer activation; partial card checks are not represented as complete passes. The first focused attempt also looked for a date inside closed source details; final checks actually expand them. The keyboard summary conflict was reproduced in a regression, fixed minimally and verified in both final focused runs. Existing v1.1.1 full-event evidence and current deterministic engine coverage remain separately scoped.

## Identity and remaining limits

Showcase SHA-256: `ce9a683df2187cc651b6c7d85a0526a3263bcfe01d33ab9fd3629c33550b0196`. Runtime-source SHA-256: `0f678cd72885b1e401f0b330e21d27b1340d114b2a7b316f0a77353382829387`. Historical archive SHA-256: `936403df41cc07e451158550df76f32be34c717a0f2e9e1280e76d6bfc9331b6`. See [VERIFICATION.json](VERIFICATION.json) for machine-readable details. Original root config/public question JSON/archive, citation identities, historical dates, IDs and score/timing rules remain intact. Reviewed metadata and M23's exact label correction are bound to receipts; an ongoing event should stay in its original saved file/profile.

macOS/Safari, manual desktop interaction, physical speakers/pronunciation, projectors/extended displays, an actual screen reader and Windows Word GUI remain untested. No broader artwork/mark license is claimed. GitHub release downloads remain the delivery route; Pages stays disabled. Old released versions are not replaced. Final package/checksum/source-rebuild and actual-download checks are reported separately against their exact manifest.
