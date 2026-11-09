# Project history

This record links the development milestones present in inspected `main` at [6f1fbb8](https://github.com/Namdev90/quiz-show-kit/commit/6f1fbb8ad5f4c501e1876377296a7fb78fb9e0df). It supplements the [changelog](../CHANGELOG.md) and dated QA records. All timestamps below are UTC from GitHub.

## From the initial example to the current workflow

- [13 October 2026: initial commit](https://github.com/Namdev90/quiz-show-kit/commit/bf431b7ed931802895eeda893fb14a83cd10adb7) and [publication of the reusable toolkit](https://github.com/Namdev90/quiz-show-kit/commit/fb5c98517c2a56e9ccbb25f7aecc7056cfa0569a).
- The first release included a browser builder. Later merged work moved authoring to the prompt-led workflow and modular library. Historical builder notes are not instructions to restore a second website editor.
- v1.1.0 added Teacher/Competition authoring, reviewed editable banks, host/session tools and release provenance.
- v1.1.1 made BioVista the fixed Apex showcase and kept GitHub release downloads as the public delivery route.
- v1.1.2 completed the recorded BioVista evidence/rationale work and corrected a pre-reveal accessible label and native details interaction. Its release notes retain limitations and the profile/recovery boundary.

## Merged pull requests

| Merged (UTC) | Pull request | Recorded subject |
| --- | --- | --- |
| 2026-10-14 03:07:31 | [#1](https://github.com/Namdev90/quiz-show-kit/pull/1) | Guide faculty from ChatGPT draft to reviewed offline quiz |
| 2026-10-14 09:08:43 | [#2](https://github.com/Namdev90/quiz-show-kit/pull/2) | Guide every teacher through AI setup and editable quiz settings |
| 2026-10-15 06:16:42 | [#3](https://github.com/Namdev90/quiz-show-kit/pull/3) | Prompt-first quiz library, reusable presets and offline narration |
| 2026-10-15 07:37:02 | [#4](https://github.com/Namdev90/quiz-show-kit/pull/4) | Lean prompt loading and a reusable asset-first library |
| 2026-10-15 12:00:10 | [#5](https://github.com/Namdev90/quiz-show-kit/pull/5) | Add authoring modes, reviewed question banks and BioVista feature showcase |
| 2026-10-15 13:24:22 | [#6](https://github.com/Namdev90/quiz-show-kit/pull/6) | Fix build provenance, DOCX binding, and checkpoint validation |
| 2026-10-15 14:13:37 | [#7](https://github.com/Namdev90/quiz-show-kit/pull/7) | [HOLD] v1.1.0 release pending offline showcase reconciliation |
| 2026-10-15 15:03:43 | [#8](https://github.com/Namdev90/quiz-show-kit/pull/8) | Fix live animations and deliver the offline Apex showcase (v1.1.1) |
| 2026-10-15 17:00:51 | [#9](https://github.com/Namdev90/quiz-show-kit/pull/9) | Complete BioVista evidence review for v1.1.2 |

PR #7's historical title retains its `[HOLD]` text, but GitHub records it as merged at the timestamp above. Do not infer its current state from that title alone.

## Published release ledger

| Release | Published (UTC) | Recorded source target |
| --- | --- | --- |
| [v1.0.0](https://github.com/Namdev90/quiz-show-kit/releases/tag/v1.0.0) | 2026-10-13 16:15:31 | [95828ba](https://github.com/Namdev90/quiz-show-kit/commit/95828baa323c29cfb07a67bc293aa5d784452b1a) |
| [v1.1.0](https://github.com/Namdev90/quiz-show-kit/releases/tag/v1.1.0) | 2026-10-15 14:15:12 | [c05728c](https://github.com/Namdev90/quiz-show-kit/commit/c05728c9fa246852d07d80cdfae3f318274858c6) |
| [v1.1.1](https://github.com/Namdev90/quiz-show-kit/releases/tag/v1.1.1) | 2026-10-15 15:05:25 | [ebd9dd9](https://github.com/Namdev90/quiz-show-kit/commit/ebd9dd94798850dc56898290332f0a2687f420fa) |
| [v1.1.2](https://github.com/Namdev90/quiz-show-kit/releases/tag/v1.1.2) | 2026-10-15 17:02:35 | [6f1fbb8](https://github.com/Namdev90/quiz-show-kit/commit/6f1fbb8ad5f4c501e1876377296a7fb78fb9e0df) |

All four listed releases are marked stable. The inspected current version is `v1.1.2`, aligned in [package.json](../package.json) and [release.json](../release.json). Documentation updates do not republish those releases or assert that their binaries were re-tested.

## Preserve the different kinds of history

| Record | What it preserves |
| --- | --- |
| [Original BioVista archive](../examples/biovista/original/README.md) | Original HTML, question bank and provenance. Do not rewrite it to match current features. |
| [Current showcase provenance](../examples/biovista/origin.json) | Relationship between the current example and its original material. |
| [Implementation QA](IMPLEMENTATION_QA.md) | Earlier dated implementation and test observations. |
| [Release QA](RELEASE_QA.md) and [VERIFICATION.json](VERIFICATION.json) | Recorded v1.1.2 checks, exact scope and remaining environment limits. |
| [Historical verification](history/) | Earlier snapshots retained instead of overwritten. |
| [Release notes](releases/) | User-facing version boundaries and migration cautions. |

Read the linked evidence before reusing a historical claim. A source build does not repeat factual research; a browser test does not certify physical speakers, projectors, macOS/Safari or Word GUI.

## Maintain this ledger

Use the [complete main history](https://github.com/Namdev90/quiz-show-kit/commits/main/), actual merged PRs and published release metadata. Link exact commits and preserve old records. Add new tests only when run, with their actual environment and result; never invent missing dates, author actions or verification.

Keep private event histories and resume copies outside the public repository. Public project history and an event's gameplay history are different records.
