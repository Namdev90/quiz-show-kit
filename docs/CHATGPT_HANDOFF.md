# One prompt, portable handoff

Use the same public entry point for every new conversation:

```text
Read https://github.com/Namdev90/quiz-show-kit/blob/main/prompts/START.md and run QSK1.
```

[START.md](../prompts/START.md) is the versioned entry contract; the linked workflow and library hold the details. QSK1 is a documented public abbreviation, not encryption or a model-exclusive language. If the assistant cannot retrieve the files, supply their full contents or the repository archive. Do not claim repository access without reading it.

For a published download, use [latest stable release](https://github.com/Namdev90/quiz-show-kit/releases/latest) and record its actual tag/commit. For development, use the identified `main` revision. Do not mix an old release's builder instructions/assets with current source files; the active product is the prompt-led authoring workflow and offline runtime. Older dated releases and QA reports remain historical snapshots, even when newer source is available.

The current release pack includes the full source kit, playable showcase and matching authoring companions, plus `Quiz_Show_Kit_Release_Manifest.json` and `Quiz_Show_Kit_SHA256SUMS.txt` identifying its exact source and file hashes. Use [CHANGELOG](../CHANGELOG.md) for version changes and [release instructions](GITHUB_SETUP.md#stable-release) to prepare a new pack; do not describe a locally built pack as already published.

## What the receiving assistant needs

- The specific repository commit or release actually used.
- The reviewed event brief and complete configuration, plus approved media and their notices.
- Decisions already made, including Teacher/Competition authoring mode when selected, requested changes and unresolved questions. Preserve mode as `setup=teacher` or `setup=competition` in the reusable key; otherwise ask the first two-choice mode question before new topic/preset questions.
- What research, builds, automated checks and actual browser/hardware checks have run.
- A saved profile or reusable next-session prompt, when continuing an existing event.
- For DOCX editing, the matching configuration and the original exported template/review workspace. For the showcase, retain `BioVista_Question_Bank.meta.json`; a different revision's bank/configuration is not an interchangeable pair.

Keep the historical BioVista archive under `examples/biovista/original/` intact and build a teacher's new event separately. The current `examples/biovista/` showcase is a fixed Apex demonstration with read-only settings. Use its reusable settings or remove `showcase: true` in a separate full event copy for customization. Preserve complete matched pairs and the current runtime contract unless implementing a deliberate tested extension.

## Deliver the quiz

When code/file tools are available, build the reviewed event and return its self-contained HTML plus an editable configuration/assets package. Rehearse answer hiding, sequential disclosure, clocks, scoring, passing, lifelines, undo, recovery and ties as applicable. Report logic tests, DOM checks, real browser checks and physical sound/projector checks separately.

Without execution tools, return complete configuration and approved assets with the exact command the next machine should run:

```sh
npm run build -- --config path/to/quiz.config.json --output dist/Quiz_Offline.html
```

`npm run build` uses Node.js 22+ and built-in Node modules. Local media paths resolve within the configuration's directory. Do not return a partial JSON example, invent a built file, or send users to a retired browser editor. A custom extension still needs implementation and verification.

DOCX export/import tests use the separately pinned Python authoring environment described in [Configuration](CONFIGURATION.md). Updating the public showcase's bank requires `npm run build:example -- --authoring`; `npm run build:launcher` then refreshes its local mirrors. These contributor steps do not require teachers to install tools to play the delivered HTML.

The repository is the public destination; the exact **Try the BioVista Feature Showcase Quiz** CTA downloads the release HTML. Keep quiz hosting disabled. The finished event needs no runtime server, API key or adjacent asset files. Source links require internet; sound requires a real initial browser gesture. Optional screen capture requires the person's browser source-selection approval.

## Reuse and improve

Follow the current workflow for the run's repository review and compact next-session prompt. A profile applies only when the next conversation receives or can retrieve it; no cross-chat memory or automatic transfer is assumed. Keep private question banks, recordings and personal event data out of public PRs. Publishing or messaging requires the user's explicit authorization.
