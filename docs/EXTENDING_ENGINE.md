# Extend the first iteration

Quiz Show Kit is editable source. Its current bundled mode has two teams, four choices and matched pairs. These are tested capabilities, not a permanent limit on what can be built.

Use existing validated configuration first. For a new rule, layout or format, implement the requested behavior and check the resulting flow before offering it as available. Without code/build tools, provide a concrete handoff and label the extension as pending.

| Change | Modules to inspect |
| --- | --- |
| Rules, scores, teams and question formats | `src/profile.js`, `src/engine.js`, `src/compiler.js` |
| Visual layouts and host controls | `src/quiz-template.html`, `src/ui.js` |
| Motion and audio | `src/motion.js`, `src/penalty-motion.js`, `src/audio.js` |
| Validation and configuration | `src/compiler.js`, `docs/CONFIGURATION.md` |
| Offline bundling | `scripts/runtime.cjs`, `scripts/build.cjs` |
| Guided choices, research and reuse | `prompts/START.md`, `docs/TEACHER_PROMPT.md`, `docs/library/` |
| Public prompt launcher | `src/launcher-template.html`, `scripts/build-launcher.cjs` |

The browser quiz editor has been removed. Add authoring capabilities to the guided workflow and reusable source, not a second competing website builder.

Update input contracts and validators together; use a version and migration when needed. Match offered choices to actual capabilities and dependencies, hiding unavailable controls or explaining what must change. Keep custom choices available as requests for implementation. Never disable validation to accommodate a preset.

Keep scoring authoritative; presentation must not alter the ledger, fairness or deadlines. Test timing boundaries, reveal state, pause/recovery and undo where relevant. Preserve checkpoint compatibility or add explicit migration. Narration should finish or stop at the correct phase without changing the answer clock.

Preserve the historical BioVista archive under `examples/biovista/original/`, escaping, restricted media validation, path containment, CSP, offline bundling and notices. The current `examples/biovista/` showcase may be rebuilt with approved enhancements. A deliberately networked extension must state its connectivity requirements. Run `npm run check` and relevant regressions; report actual browser and classroom checks separately. Toolkit credit stays in welcome/About/Settings and out of results.
