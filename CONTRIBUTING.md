# Contributing

Contributions should improve the reusable kit while preserving the real BioVista example and the reliability of live play. For another event, start by changing `quiz.config.json`; an event theme rarely needs a new engine.

Read [configuration guidance](docs/CONFIGURATION.md), [agent guidance](AGENTS.md), and the [asset notices](examples/biovista/ASSET_NOTICES.md). Use a branch in your fork or checkout for the change. Keep the change focused and preserve unrelated work.

## Content changes

A question contribution needs a complete stem, four plausible options, one correct numeric index, an explanation, and sources that support the answer. Record the actual verification date. Prefer primary sources. Avoid ambiguous questions, misleading distractors, accidental answer-length clues, and a paired question whose answer is revealed by the preceding explanation.

Check topic and difficulty balance between teams and retain complete matched pairs. Use stable IDs so a diff can be reviewed. Do not silently rewrite an in-progress event or claim a source was checked when it was not accessible. Ordinary factual corrections belong in an issue or pull request with the supporting source.

## Code changes

Read `package.json` and use the existing test and build scripts. Run the relevant checks and `npm run build`; include a small alternate configuration when changing configuration support. Keep generated files reproducible from their inputs.

For scoring, timing, passing, or recovery changes, test the meaningful boundaries: repeated clicks, timeout/confirm races, hidden-page interruption, pause/resume during option entrances, wrong-choice blocking, teacher return time, negative scores, complete tie pairs, undo, and restoring a checkpoint. For compiler/input changes, test rejected executable content and escaping/path boundaries as well as valid media.

Changes to presentation need inspection at the supported display sizes and with long question/option text. Report actual browser/rendering and audio checks separately from mocked DOM tests. A source check alone does not establish smooth animation or audible output.

## Prompt and library changes

Keep `prompts/START.md` as the single entry contract and `docs/TEACHER_PROMPT.md` as the guided workflow. Use library modules for reusable presets, sources, difficulty, narration, assets and maintenance guidance. Keep five presets plus custom, and keep suggested controls aligned with tested capabilities. Do not reintroduce a competing website quiz editor or promise a private cipher, automatic memory, unavailable tools or untested extensions.

The local root launcher and dormant documentation mirror are generated from `src/launcher-template.html` by `npm run build:launcher`. The exact showcase CTA downloads the versioned GitHub release; keep quiz hosting disabled. Original SVG documentation illustrations live in `docs/images`; label conceptual swatches clearly instead of presenting them as runtime screenshots.

## Pull requests

Review existing issues/PRs first, then explain the concrete problem, resulting behavior, and how it was checked. A QSK1 run includes a repository review when accessible, but does not authorize public contributions by itself; prepare local suggestions or a patch when publication is not authorized. Include an example configuration or minimal reproduction when useful. Note any remaining verification limits. Screenshots or recordings should come from the actual build and contain no private event data.

Keep attribution and license files with any added dependency or asset. Use reviewed, pinned dependencies and bundled runtime assets. Do not add analytics, remote runtime requests, API credentials, or arbitrary executable configuration values as a shortcut.

Report exploitable input, privacy, or workflow issues through [SECURITY.md](SECURITY.md). Do not put a working exploit containing private data in a public issue.
