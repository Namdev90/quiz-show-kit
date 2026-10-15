# Less repeated context, complete results

The short launch URL saves typing; it does not make retrieved instructions free. Reduce the instructions and data actually read at each stage. These are workflow instructions for capable assistants, not changes to a user's subscription, model, context window, hidden reasoning or app settings.

| Stage | Load now | Defer |
| --- | --- | --- |
| Start | `prompts/START.md` + `AGENTS.md`; readable existing choices | README, complete configuration, every library module |
| Presets / reuse | `PRESETS.md` or `REUSE_PROTOCOL.md` as needed | Unselected media/provider instructions |
| Research | `QUESTION_RESEARCH.md`, supplied syllabus, relevant sources | Engine internals and all unrelated papers |
| Media | Filter `assets/catalog.json`, then relevant asset/voice guide | Base64 bundles, full model repositories/weights |
| Build | Configuration reference, package scripts, chosen inputs | Unchanged generated output and vendor source |
| Repair / extend | Relevant callers, contract, targeted tests | Unrelated rewrites or full-repository audits |

Paths in this table refer to this library directory unless a repository-root path is given. Use the [directory map](DIRECTORY_MAP.md) to resolve unfamiliar paths; do not recursively fetch every link. Required modules must still be read before their phase. In a long or compacted conversation, reread missing instructions rather than pretending they remain available.

## The teacher's side

Ask one missing decision at a time. Offer five presets + Custom where specified, accept “choose for me”, and apply readable saved settings before asking. Keep useful visual choices; remove repeated explanations and duplicate approval loops. Custom preferences need their settings attachment next time. Do not tell teachers to maintain JSON, install libraries or run terminals.

Keep a compact working brief in an actual available file/context: learning goal, audience, selected preset and overrides, counts/pairs, media IDs, source revision, source-check status and unresolved decisions. Update changes, not an ever-growing transcript. Do not invent persistence or repeat the full brief on every turn.

Write a question bank once to the editable configuration. Review only the requested round/items and patch those IDs. Return links to real completed files instead of repeatedly printing the entire JSON/base64. Preserve source records and all question content; economy is not permission to omit requested questions.

## The assistant's side

Discover only task-relevant tool/plugin names, then read the selected schema or skill. Use connected search, subject databases, media tools and GitHub operations when suitable; do not install or invoke an entire tool catalog. Use existing compiler/preset helpers and asset metadata. Tool absence gets one honest fallback, not repeated failed calls or unsupported claims.

Batch independent reads/searches; keep dependent edits sequential. Request bounded excerpts and concise tool summaries, keeping full diagnostics in files. Reuse material already read from the same revision. Check a repository revision once per run and refresh after writes; scope the required review to this task. Do not translate a routine quiz request into a full audit.

Delegate only independent work that offsets its extra context and coordination. Use the least expensive capable route actually available; suggest a model switch only when useful and never claim to change it invisibly. Prefer existing approved media over generation. Generate only a missing asset, keeping exact diagrams and data deterministic.

Run focused checks after a meaningful change and the required release gate before merging. Stop when the identified risk is resolved. Never remove validation, downgrade tests or omit a requested feature to make a token figure look better.

## Measurement, not promises

`npm run measure:prompts` reports UTF-8 bytes and whitespace-separated words for the required startup files, plus the previous startup path when that Git commit is available. These are reproducible **text-size measurements, not token or billing measurements**. Actual tokenizer, model, tool overhead, research, output length and retries affect total usage. No percentage reduction in a user's bill or end-to-end tokens is guaranteed.

See [Ponytail provenance](PONYTAIL.md) for the upstream inspiration; this repository's staged loading and asset catalog are its own implementation.
