# One prompt, portable handoff

Use the same public entry point for every new conversation:

```text
Read https://github.com/Namdev90/quiz-show-kit/blob/main/prompts/START.md and run QSK1.
```

[START.md](../prompts/START.md) is the versioned entry contract; the linked workflow and library hold the details. QSK1 is a documented public abbreviation, not encryption or a model-exclusive language. If the assistant cannot retrieve the files, supply their full contents or the repository archive. Do not claim repository access without reading it.

## What the receiving assistant needs

- The specific repository commit or release actually used.
- The reviewed event brief and complete configuration, plus approved media and their notices.
- Decisions already made, including Teacher/Competition authoring mode when selected, requested changes and unresolved questions. Preserve mode as `setup=teacher` or `setup=competition` in the reusable key; otherwise ask the first two-choice mode question before new topic/preset questions.
- What research, builds, automated checks and actual browser/hardware checks have run.
- A saved profile or reusable next-session prompt, when continuing an existing event.

Keep the historical BioVista archive under `examples/biovista/original/` intact and build a teacher's new event separately. The current `examples/biovista/` showcase is rebuilt with approved enhancements. Preserve complete matched pairs and the current runtime contract unless implementing a deliberate tested extension.

## Deliver the quiz

When code/file tools are available, build the reviewed event and return its self-contained HTML plus an editable configuration/assets package. Rehearse answer hiding, sequential disclosure, clocks, scoring, passing, lifelines, undo, recovery and ties as applicable. Report logic tests, DOM checks, real browser checks and physical sound/projector checks separately.

Without execution tools, return complete configuration and approved assets with the exact command the next machine should run:

```sh
npm run build -- --config path/to/quiz.config.json --output dist/Quiz_Offline.html
```

`npm run build` uses Node.js 22+ and built-in Node modules. Local media paths resolve within the configuration's directory. Do not return a partial JSON example, invent a built file, or send users to a retired browser editor. A custom extension still needs implementation and verification.

The finished event needs no runtime server, API key or adjacent asset files. Source links require internet; sound requires a real initial browser gesture. Optional screen capture requires the person's browser source-selection approval.

## Reuse and improve

Follow the current workflow for the run's repository review and compact next-session prompt. A profile applies only when the next conversation receives or can retrieve it; no cross-chat memory or automatic transfer is assumed. Keep private question banks, recordings and personal event data out of public PRs. Publishing or messaging requires the user's explicit authorization.
