# Extend the first iteration

Quiz Show Kit is editable source for an adaptable teaching toolkit. Its current bundled mode has two teams, four-choice questions and matched pairs. These are tested capabilities of this iteration, not a permanent limit on what can be built.

Teachers describe their desired behavior to the AI assistant. The assistant should use existing configuration switches first, and implement an extension when the request needs new behavior. A conversation without code/build tools should provide a concrete handoff rather than an unbuildable configuration or a claim that the extension already works.

| Change | Modules to inspect |
| --- | --- |
| New rules, scores, teams, question formats | `src/profile.js`, `src/engine.js`, `src/compiler.js` |
| New visual layouts and controls | `src/quiz-template.html`, `src/ui.js` |
| New animations or audio | `src/motion.js`, `src/penalty-motion.js`, `src/audio.js` |
| Authoring fields and import/export | `src/builder-template.html`, `src/builder-ui.js`, `src/builder-model.js` |
| Bundling and offline output | `scripts/runtime.cjs`, `scripts/build.cjs`, `scripts/build-builder.cjs` |
| Guided AI workflow | `docs/TEACHER_PROMPT.md` |

Update the input contract and validator together when a new feature changes configuration. Introduce a new schema/version and migration when required rather than accepting incompatible fields silently. Keep optional features switchable in the relevant settings, and preserve the ordinary teacher flow. Do not put implementation jargon into classroom controls.

Keep the scoring engine authoritative and animations presentational. Test every new rule at its timing boundaries, fairness, answer review, pause/recovery and undo where applicable. A decorative switch must never alter the ledger or answer deadlines. Update checkpoint identity/migration when rules or question formats change.

Preserve the real BioVista example and its existing mode separately from custom events. Retain escaping, restricted media validation, path containment, CSP, offline bundling and license notices. A genuinely networked extension should state its connectivity needs rather than claim offline operation.

Run `npm run check` and relevant new regressions. Report exactly which logic, browser and physical classroom checks actually ran. Toolkit credit belongs in welcome/About/Settings; creator credit stays out of winner/results screens. Event branding remains the teacher's choice.
