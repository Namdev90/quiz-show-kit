# Documentation guide

Quiz Show Kit has three different jobs: author a reviewed configuration, build a self-contained quiz, and host it reliably. Start with the guide for your role rather than loading every document.

## Teachers and event hosts

| Need | Start here |
| --- | --- |
| Create a quiz with an assistant | [QSK1 launch prompt](../prompts/START.md) |
| Understand the toolkit and current download | [Repository README](../README.md) |
| Prepare, run or recover a live session | [Operations and troubleshooting](OPERATIONS.md) |
| Choose presets, questions, voice or media | [Workflow library](library/README.md) |
| Reuse approved media | [Asset shelf](../assets/README.md) and [reuse review](ASSET_REUSE_REVIEW.md) |
| Edit a question bank and preserve rollback | [Question-bank workflow](library/QUESTION_BANK.md) |
| Move work to a build-capable assistant | [ChatGPT handoff](CHATGPT_HANDOFF.md) |

Teacher mode and Competition mode are authoring workflows. Full/short playback and the five experience presets are separate settings. QSK1 is public shorthand for retrieved instructions, not an installed command or automatic cross-chat memory.

## Builders and contributors

| Need | Reference |
| --- | --- |
| Understand source and generated files | [Architecture](ARCHITECTURE.md) |
| Set valid questions, rules, media and presentation | [Configuration](CONFIGURATION.md) |
| Add a new capability | [Extending the engine](EXTENDING_ENGINE.md) and [Contributing](../CONTRIBUTING.md) |
| Navigate source/assets/tools | [Directory map](library/DIRECTORY_MAP.md) |
| Review implemented scope and remaining decisions | [Implementation coverage](IMPLEMENTATION_COVERAGE.md) |
| Run tests and prepare a release | [Contributing](../CONTRIBUTING.md), [GitHub setup](GITHUB_SETUP.md), and [package scripts](../package.json) |
| Report a vulnerability and protect private event data | [Security policy](../SECURITY.md) |

The supported bundled format has two teams, four options, one correct answer and matched question pairs. A custom request is not an implemented extension until source, validation and tests support it.

## BioVista, releases and evidence

- [Current BioVista showcase](../examples/biovista/README.md): the fixed Apex example and its companion files.
- [Showcase requirements audit](SHOWCASE_AUDIT.md) and [evidence review](../examples/biovista/EVIDENCE_REVIEW.md): demonstrated behavior and question-review limits.
- [Project history](HISTORY.md) and [changelog](../CHANGELOG.md): source-linked development and release milestones.
- [Release notes](releases/v1.1.3.md), [release QA](RELEASE_QA.md) and [machine-readable verification](VERIFICATION.json): dated evidence for the unreleased source candidate.
- [Earlier implementation QA](IMPLEMENTATION_QA.md) and [historical verification records](history/): retain their original dates and test scope.
- [Original BioVista archive](../examples/biovista/original/README.md): preserved source material, not the current configurable toolkit.
- [Third-party notices](../THIRD_PARTY_NOTICES.md), [asset notices](../examples/biovista/ASSET_NOTICES.md) and [MIT license](../LICENSE): different scopes of permission.

A successful build does not verify scientific answers, rights to media, screen-reader behavior, pronunciation or a classroom projector. Follow the exact evidence scope in the linked records and rehearse on the actual event hardware.

GitHub release downloads are the public delivery route. Root and documentation HTML launchers are generated local/dormant copies; this guide does not enable Pages hosting or replace the prompt workflow with a browser editor.
