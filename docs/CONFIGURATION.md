# Configure a quiz

`quiz.config.json` is the canonical input. Its `schemaVersion` is `1`. Start with the included BioVista configuration and edit a copy for your event. Keep the actual example under `examples/biovista/` intact.

The kit supports two teams, matched pairs, four options, and one correct answer. It supports different themes and even main-question counts per round. A multiteam engine, lever/reel selector and absent-team controls require the creator's expansion decision before changing this architecture; see [the extension guide](EXTENDING_ENGINE.md). Free-text and typed-numeric grading, interactive ordering/matching and rotating team membership are outside the accepted scope. Numerical, sequence and matching content remains selectable MCQ.

## Build routes

Teachers start with [the launch prompt](../prompts/START.md). The assistant gathers choices, researches questions, validates and builds the downloadable quiz. The repository's landing page only copies that prompt; there is no browser quiz builder. The following configuration/CLI reference is for the assistant or contributors, not a form for teachers to fill in.

With the Node version required by `package.json`, the CLI route is:

```sh
npm run build
```

That reads the root `quiz.config.json` and creates `dist/Quiz_Offline.html`. To keep another event in its own folder:

```sh
npm run build -- --config path/to/quiz.config.json --output dist/Quiz_Offline.html
```

Use the validation/build errors to correct the configuration. A successful build confirms compilation, not question accuracy or projector/speaker quality.

## Event, teams, and theme

| Field | Meaning |
| --- | --- |
| `event.id` | A stable identifier for this competition. Choose a new ID for a new event. |
| `event.title` | The event's visible name. |
| `event.organization` | Organization text used by the presentation. |
| `event.subtitle` | A short introductory description. |
| `event.date` | Event date in `YYYY-MM-DD` form. |
| `event.introTagline` | A short line in the opening announcement. |
| `event.introHeadline` | Optional opening headline, up to 100 characters; defaults to `Ready for the challenge?`. |
| `event.lifelineLabel` | Optional teacher-lifeline label, up to 60 characters; defaults to `Ask a teacher`. It changes the label, not the lifeline rules. |
| `teams` | Exactly two entries. Keep internal IDs `Bio` and `Vista`; customize each `name` and `color`. |
| `theme.background`, `surface`, `text` | Theme colors. Use six-digit hex values such as `#202829`. |
| `theme.font` | `Segoe UI`, `Arial`, `Verdana`, `Georgia`, or `Tahoma`; no remote font URL. |
| `theme.style` | `flat`, `skeuomorphic` (raised tactile panels), or `glass` (frosted panels with opaque fallback). |
| `theme.motif` | `dna` or `none`. The decorative motif is independent of the question topic. |

Team IDs are engine identities, not required display names. For example, `{"id":"Bio","name":"Team Atlas","color":"#18A878"}` changes the displayed name while preserving the two-team engine contract. UTF-8 question/event text can use other languages. Optional `localization` supplies a language tag and an exact-label dictionary, for example `{"language":"hi","labels":{"Settings":"सेटिंग्स"}}`. Up to 200 labels are accepted, with source labels up to 160 characters and replacements up to 240. Untranslated labels retain their English fallback. This does not translate or independently verify the question bank; check the rendered chosen language, scientific terms and font support separately.

Persistence is separated by event and a configuration fingerprint. Keep `event.id` stable while preparing one competition. Changing questions or rules creates a new profile; an incompatible checkpoint should not be treated as a continuation of the old game. Do not change rules midway through a live session.

Use team names only, not participant profiles or contact details. Names must be nonempty and distinct. A changed round order changes who starts, not who belongs to a team. No absent-team control applies to this two-team mode.

Browser privacy settings or an embedded preview can prevent local storage. Use **Save resume copy** to download a complete quiz with its checkpoint, then reopen that file to resume paused. The reusable kit's profiles and the original BioVista application's older checkpoints are different formats; cross-import is not supported.

## Presentation controls

Optional `presentation` settings are validated, saved and embedded in the exported quiz. Omitted settings retain the legacy cinematic defaults. New classroom drafts start with gentle motion and 60% volume.

| Field | Values | Legacy default |
| --- | --- | --- |
| `motion` | `cinematic`, `gentle`, `none` | `cinematic` |
| `sound` | Boolean; false keeps playback silent | `true` |
| `volume` | Integer percent, 0–100 | `80` |
| `spokenOptions` | Enable spoken option/selection cues | `true` |
| `optionSpeech` | `smart`: actual one-word text, letters for phrases; `letters`: A–D; `full`: complete option text | `smart` for new presentation settings |
| `voiceName`, `voiceLang` | Preferred installed local voice and language tag; reselect on another device if unavailable | empty name, `en-IN` |
| `speechRate` | Browser voice speed, 0.5–2 | `1` |
| `readQuestions` | Automatically narrate the stem during the untimed reading phase when available | `false` |
| `confetti` | Correct-answer/winner celebration | `true` |
| `rewards` | Visual point gains/losses; never changes score rules | `true` |
| `coinAnimation` | Animate the toss; static mode keeps the fair five-second reveal | `true` |
| `questionAnimation` | Question / explanation decorative entrances | `true` |
| `winnerAnimation` | Winner entrance animation | `true` |
| `intro` | Opening announcement; the separate fair coin toss remains available | `true` |
| `character` | Show the configured actual Chota Namu PNG on welcome/About/settings; visibility is independent of game rules | `true` when `branding.character` is configured; otherwise absent/false |

No decorative motion and the device's reduced-motion preference remove decorative movement. Options are still disclosed in order over `optionsRevealMs`; answer time begins after the last option. Gentle style uses fades and immediate score settlement, rather than flying reward/penalty coins. Rehearsal uses the configured settings. The exported file’s Settings menu can change presentation switches while the game stays paused, without changing rules/scores. Preferences persist in the same browser when storage permits. Save resume copy embeds current presentation choices for another computer. Ask the assistant to change rules/content and rebuild before play.

Give the assistant approved left/right logos, question images and recordings to embed, with alternate text and credits. Individual audio replacements use asset keys `coinSound`, `optionA`–`optionD`, and `selectA`–`selectD`; removing a replacement restores the bundled clip. Supported types and size/security limits below still apply. Physical prizes or certificates are event notes, not automated rewards.

## Rules and units

The public configuration uses seconds for answer/consultation/grace limits and milliseconds for animation and pass-transition durations. Supply JSON numbers, not quoted numeric strings. Score values are whole numbers.

| Rule | BioVista default | Accepted range or meaning |
| --- | ---: | --- |
| `primarySeconds` | 15 | 1–600 seconds; also used by direct tie opportunities. |
| `passedSeconds` | 7 | 1–600 seconds when passing is enabled; 0 is allowed when disabled. |
| `teacherSeconds` | 7 | 1–120 seconds when the teacher lifeline is enabled; 0 is allowed when disabled. |
| `graceSeconds` | 8 | 1–60 seconds for acknowledged answer entry. |
| `optionsRevealMs` | 1800 | 400–20000 ms, divided into four sequential A→B→C→D entrances. |
| `passTransitionMs` | 1000 | 300–10000 ms when passing is enabled; 0 is allowed when disabled. |
| `scoring.directCorrect` | 10 | 1–100 points. |
| `scoring.primaryWrong` | -2 | -100–0 points. |
| `scoring.passedCorrect` | 2 | 0–100 points. |
| `scoring.passedWrong` | -5 | -100–0 points. |
| `passing` | `true` | Enables one receiving-team opportunity. |
| `teacher` | `true` | Enables one teacher consultation per team across the competition. |
| `shortPairsPerRound` | 2 | 1–10000 complete pairs retained per round in short mode, up to those available. |

Passes and timeouts score zero. Negative totals are permitted. The primary timer begins after the final option finishes appearing. A confirmed primary wrong answer is unavailable on the passed turn; a voluntary pass or timeout does not block a choice. The teacher clock temporarily replaces the answer clock and then restores its saved remainder.

The full configuration uses the public names above. Internal millisecond/profile aliases are implementation details; do not mix both spellings or add unknown rule keys. Unsupported or conflicting values are errors rather than silently adjusted rules.

## Optional gameplay choices

Top-level `gameplay` configures accepted optional behavior before the event. Omitted values retain the legacy flow. Host setup changes must precede live play; they must not silently change an active score ledger.

| Field | Values/default | Meaning |
| --- | --- | --- |
| `shuffleOptions` | Boolean, `false` | Keep one option permutation per question appearance, including passes; preserve correct answer, explanation and narration identities. |
| `discussionSeconds` | Integer 0–600, `0` | Optional thinking phase before answers unlock; zero disables it. Ordinary fast-paced setup stays off. |
| `difficultyOrder` | `manual` (default), `rising`, `falling` | Reorder complete pairs within each round. Manual preserves the authored order; falling is the reverse of rising. |
| `difficultyLevels` | `['accessible','moderate','challenging','standard']` | Ordered easiest-to-hardest labels used by difficulty ordering and its legend. Supply a consistent custom list when needed. These labels are creator-assigned. |
| `roundOrder` | `fixed` (default), `alternate` | Keep the toss-selected starter every round or alternate which of the two teams starts each successive round. |
| `statistics` | Array of supported keys below; all selected by default | Select host statistics; this display selection does not change scoring. |
| `revisionReport` | Boolean, `false` | Enable optional host revision/report details; do not add a long public results report. |

Statistic keys: `directOpportunities`, `passesOffered`, `passesReached`, `attempted`, `correct`, `wrong`, `scores`, plus retained `primaryCorrect`, `passedCorrect`, `accuracy` and `winningChance`. The last metric is an illustrative model, not a calibrated prediction. Host choices control visibility, never score rules.

| Metric | Definition |
| --- | --- |
| Direct opportunities | Primary questions made ready for a team, excluding replaced questions. |
| Passes offered | Receiving opportunities created after an unsuccessful primary turn, including an active pass transition. |
| Passes reached | Offered passes whose receiving answer clock actually started. |
| Attempted | Confirmed answer selections; excludes voluntary passes/timeouts. |
| Scores | Ledger points including explicit host corrections; replacements void only the affected question outcomes. |

Check counts against the event log. An offered pass is not automatically reached or attempted, and differing counts are not a diagnosis or proof of unfairness by themselves.

Difficulty ordering preserves pair membership and comparable opportunities. Short mode first selects complete pairs, then applies the requested difficulty order. When shuffling is enabled, A–D are display positions; do not rewrite internal sequence/matching labels inside an option. Review narrated choices against their final identities.

Reserve replacement preserves the primary team and slot. Choose an unused reserve with compatible round, difficulty and time; prefer a matching topic/subtype and disclose mismatches. The host action records the reason and its score/lifeline consequence. A previously scored/revealed item requires deliberate integrity handling. If no suitable reserve exists, keep the slot paused for a decision rather than silently deleting one team's opportunity. This is distinct from the rejected routine click-confirmation feature.

## Rounds and question records

`rounds` contains 1–20 entries with unique integer `id` values from 1–1000 and visible `name` values. Prefer consecutive round IDs starting at 1. Every declared round needs main questions. The bank supports 2–200 main questions, up to 20 tie cards, at most one demonstration, and at most 250 cards overall. Give every main round an even number of questions, organized into complete pairs. Each main pair supplies one primary opportunity to each team. Questions in a pair must have the same difficulty label, comparable demands, and must not reveal each other's answers.

`questions` contains the playable records. A record has:

| Field | Requirement |
| --- | --- |
| `id` | Unique, stable string. |
| `status` | `main`, `reserve`, `tie`, or `demo`. |
| `round` | A numeric identifier from the configured rounds, including for reserves, ties, and the demonstration. |
| `pairId` | Pair identifier; main and tie pairs contain exactly two questions. |
| `difficulty` | A consistent label; use the example's `accessible`, `moderate`, and `challenging` labels. |
| `topic` | Optional topic label up to 120 characters, used for coverage and reserve suitability review. |
| `subtype` | `text` (default), `numerical`, `image`, `graph`, `code`, `sequence`, or `matching`. Every subtype remains four-option MCQ. |
| `stem` | Complete question text before choices appear; up to 300 characters. |
| `options` | Exactly four distinct answer strings; up to 180 characters each. |
| `correct` | Integer index `0`, `1`, `2`, or `3` into the authored option order; live A–D positions may differ when shuffling is enabled. |
| `optionIds` | Four distinct stable identifiers. Legacy records receive `<question ID>-A` through `-D`; keep those identities when editing/reordering. |
| `correctOptionId` | Stable ID of the intended answer; may supply the key without `correct`. If both are given they must agree. |
| `explanation` | Concise explanation suitable for the live reveal; up to 450 characters. Aim for 20–45 words. |
| `optionExplanations` | Four explanations, each up to 450 characters, in the authored option order. Legacy blanks remain blank and trigger review warnings; the compiler does not invent reasons. |
| `sources` | Up to 12 provenance records described below. A supplied private report can be cited by title without inventing a public URL. |
| `verificationDate` | The date the author actually checked those sources, in `YYYY-MM-DD` form. |
| `verification` | Optional honest question verification/override record described below. |
| `visual` | Optional supported diagram or asset reference, with useful alternative text and attribution. |

Question excerpt from the real example, using the canonical numeric answer index:

```json
{
  "id": "M01",
  "status": "main",
  "round": 1,
  "pairId": "R1P1",
  "difficulty": "accessible",
  "stem": "In a typical human body cell, which structure contains most of the cell's DNA?",
  "options": ["Nucleus", "Golgi apparatus", "Lysosome", "Cell membrane"],
  "correct": 0,
  "explanation": "The nucleus encloses the chromosomes, which contain most of a typical human cell's DNA. Mitochondria also contain a small amount of DNA, so saying that every DNA molecule is in the nucleus would be inaccurate.",
  "sources": [{"title": "NHGRI — Nucleus", "url": "https://www.genome.gov/genetics-glossary/Nucleus"}],
  "verificationDate": "2026-10-13"
}
```

This is one record, not a complete buildable quiz. Its main pair must also be present. `verificationDate` records the example's source review; it is not a claim that a copied or edited question was checked again today.

Each source requires `title`, with optional `url` (HTTPS), `section`, `edition`, `publicationDate` (year/date text), `accessedAt`, `verifiedAt`, `status` and `supportNote`. The latter two dates use `YYYY-MM-DD`. Status is `unverified`, `verified`, `conflicting` or `stale`; a verified source needs an actual `verifiedAt` and a concise original `supportNote`. These are declared review records, not a claim that the compiler fetched the page. Inspect the source yourself before assigning them.

Question `verification` accepts `status` (`unverified`, `verified`, `disputed`, `creator-override`), optional `checkedAt`, `note`, and an override only for `creator-override`. Independently verified status requires a check date, at least one verified supporting source and no unresolved stale/conflicting source. The compiler checks consistency of these records, not their factual truth. An explicit override has this shape:

```json
{
  "verification": {
    "status": "creator-override",
    "checkedAt": "2026-10-15",
    "note": "Describe the specific inspected evidence and unresolved disagreement.",
    "override": {
      "reason": "Record the creator's explicit reason for retaining this key.",
      "chosenOptionId": "M01-A",
      "recordedAt": "2026-10-15"
    }
  }
}
```

Use actual dates and the chosen answer's real ID, not these illustrative values. The chosen ID must match the key used for scoring. Never turn an override into a verified label or silently change educational meaning. Source entries and option explanations appear only after reveal; additional references/details can be expanded. Local bibliography/notes work offline, while external reference pages require internet and open separately.

Legacy inputs can omit verification metadata/source lists; this does not make them fact-checked. Supplied and researched questions need the same independent source inspection, including distractors and units. For a new event, supply supporting references and actual review dates. If the creator explicitly retains a disputed key, preserve its override status and disagreement in host/editor metadata; do not mark it independently verified. A review skip is not an override. See [question research](library/QUESTION_RESEARCH.md) for the quality report and factual workflow.

Keep the unscored demonstration separate from the main inventory. Reserves should be suitable for the round and difficulty they may replace; retain the example's supported reserve eligibility metadata when adapting it. Tie questions are optional but, when supplied, must form complete matched pairs. Without an available tie pair, an unresolved tie needs a host/faculty decision rather than an invented winner.

Short mode keeps complete pairs. It must not remove only one team's primary opportunity. Review total count, per-team topic/difficulty balance, and answer-position balance after editing.

## DOCX bank export, preview and rollback

This is an assistant/contributor workflow; teachers edit the exported document and review its human-readable comparison. It does not restore a website builder. Export requires Python 3 and `python-docx`; import uses bounded standard-library ZIP/XML parsing. `requirements-authoring.txt` pins the authoring toolchain already used for this implementation (python-docx 1.2.0, lxml 6.1.1, typing_extensions 4.16.0). Contributor/CI setup uses an isolated virtual environment as shown in [README](../README.md); an existing compatible Python environment also works. No installer runs from the quiz. Use `QSK_PYTHON` to select the Python executable. Ordinary HTML building and offline play do not require Python.

```sh
node scripts/question-bank.cjs export --config path/to/quiz.config.json --output path/to/Question_Bank.docx
node scripts/question-bank.cjs preview --config path/to/quiz.config.json --document path/to/Question_Bank.docx --workspace path/to/new-review
node scripts/question-bank.cjs apply --config path/to/quiz.config.json --review path/to/new-review/review.json
node scripts/question-bank.cjs rollback --config path/to/quiz.config.json --review path/to/new-review/review.json
```

Preview creates a separate workspace with the original `source.docx`, `candidate.config.json`, machine-readable `review.json`, readable `review.html` and `errors.json` when applicable. Review added/removed/changed questions and answer-key changes before choosing Apply. Apply preserves `previous.config.json`; rollback restores the saved configuration's exact bytes and refuses to overwrite newer work. Stale exported templates/previews cannot replace a changed bank. Apply checks the candidate/base hashes so edits after preview need a fresh review. Invalid imports cannot replace the current valid bank. Rebuild/rehearse after applying; do not edit a live event.

Use the exported template, keep Question ID and Option IDs stable, and edit the plain two-column table's clearly labeled values. Copy/delete an entire question table to add/remove an item, preserving complete main/tie pairs. Select the intended key by its **Correct option ID**. Existing media/narration references and protected recovery metadata round-trip; changed media needs an approved local file. Do not add inline media to the DOCX. Source rows hold the same provenance fields as the configuration. Educational edits invalidate inherited verification status for rechecking and appear in the preview; explicit creator overrides remain honestly recorded.

Import requires the exported template. If an editor strips the custom XML, its visible QSK1 event/revision identity can bind the document to the unchanged current configuration and recover the preserved metadata. If both forms of identity are lost, export a fresh template. Macro/embedded-object content, encrypted packages, unsupported fields/content, external resources other than non-fetched HTTPS hyperlinks, and tracked changes that have not been accepted/rejected are rejected. Limits: 8 MiB file, 15 MiB expanded parts, 300 package members and 5 MiB per part. A representative actual Linux LibreOffice save/reimport preserved all questions without added, removed or changed records, including the identity fallback. This is not actual Windows Word or macOS Word testing; other editors must preserve the template and either recovery metadata or the visible event/revision identity.

Add `--fix-format` to Preview for the bounded “fix it for me” route. Only supported unambiguous structural normalization is attempted and listed in the preview; it does not guess answers or sources. If educational meaning is unclear, get the creator's decision. See [bank workflow](library/QUESTION_BANK.md) and [research checks](library/QUESTION_RESEARCH.md) for independent verification, heuristic warnings, source disagreements and optional print/revision material.

## Images, logos, and audio

`assets` maps a key to an object containing either `data` (a supported base64 data URI) or `file` (a relative asset filename). `branding.left` and `branding.right` optionally refer to those keys:

```json
{
  "assets": {"myLogo": {"file": "assets/my-logo.png"}},
  "branding": {"left": {"asset": "myLogo", "alt": "My approved organization logo"}}
}
```

For the CLI, relative filenames are resolved inside the selected configuration's directory. Files outside that directory, absolute paths, JavaScript, and remote runtime URLs are not supported asset inputs. Use PNG, JPEG, WebP, or restricted static SVG images, or WAV, MP3, or OGG audio. The CLI accepts individual files up to 2 MiB. The validator allows at most 100 asset entries, a 3 MiB data-URI text limit per asset, and 20 MiB of embedded asset data-URI text overall. A source citation URL is a reference, not an asset download instruction.

SVG must pass the static-image checks. Scripts, event handlers, stylesheets, embedded objects, animation elements, resource links, and external references are rejected. Use simple self-contained geometry; if an approved SVG depends on unsupported features, export it to PNG or WebP. Acceptance by the validator is not permission to use someone else's artwork.

The assistant must resolve actual approved files before building; a pathname in JSON alone does not supply the file. Use embedded data URIs, bundled asset keys, or paths within the selected configuration directory. The finished quiz embeds the accepted media and does not need those neighboring files to play.

Built-in scientific diagrams from BioVista are available; consult the example's `visual` records for their supported type/key combinations. A custom question image can use `"visual": {"key": "myImage", "alt": "Description of the relevant image", "attribution": "Creator and permission or license"}`, where `myImage` exists in `assets`. Do not paste executable SVG, HTML, scripts, or remote embeds into question text.

The MIT license covers the kit's own software as described in the repository license. Example trademarks, branding, third-party libraries, and media have separate notices. Read [third-party notices](../THIRD_PARTY_NOTICES.md) and [BioVista asset notices](../examples/biovista/ASSET_NOTICES.md) before reusing them for another event.

The existing `assets/images/parul-goa-pcahs-transparent.png` has cataloged source/history and event-specific approval; its catalog scope is **permission-required**, not a general university endorsement or reuse grant. Confirm that this supplied mark is authorized for the intended event/distribution. The user subsequently supplied the actual Chota Namu PNG/GIF and authorized their use/publication in this project; [asset review](ASSET_REUSE_REVIEW.md) records the narrower permission and remaining third-party restrictions. Do not infer a general reuse or MIT license for the character.

Optional `branding.character` uses `{ "asset": "chotaNamu", "alt": "Chota Namu" }`, referencing an approved local image asset. The supplied `assets/characters/chota-namu.png` is displayed unchanged on welcome and About/settings only, with the persistent **Show Chota Namu on welcome and About** visibility toggle (`presentation.character`). It does not cover gameplay controls or appear in public results. A configuration without `branding.character` does not acquire a character automatically. The supplied idle GIF is preserved for reference; it is not runtime media, and no cursor-following gaze was added. For a new event, keep the project-specific asset permission or use text-only branding/an independently authorized asset.

## Before the event

Review every answer and source, then rehearse the generated HTML on the actual display and speakers. Check long questions, the four sequential choices, both correct and wrong paths, teacher timing, undo, recovery, and ties. The offline HTML contains its answers; keep an unreleased event file with the host. Sound begins after a real browser gesture. Optional screen recording requires the host's browser picker and is not a microphone recorder.

Static SVG imports also reject namespace-prefixed elements and numeric character references. Use a plain static export or PNG/WebP for complex artwork.

## Presets and dynamic authoring choices

`src/presets.js` is the public QSK1 decoder: `QSK1 preset=<id> theme=<id>`. The five quiz IDs are `friendly`, `seminar`, `revision`, `competition`, `visual-lab`; theme IDs are `classroom`, `lecture`, `midnight`, `skeuomorphic`, `glass`. Both accept `custom`. See [the preset library](library/PRESETS.md). The decoder rejects unknown versions, IDs, duplicate fields and arbitrary commands. It is a public shorthand, not encryption.

The assistant calls `choices(config, capabilities)` after edits and only offers active settings. Disabled paths have human-readable reasons: pass controls depend on passing, lifeline time on the lifeline, voice on sound/local voice availability, and decorative effects on motion. Structural changes are unavailable during live play. Invalid paired inventories or rule values block compilation; suggestions do not silently alter user decisions. A valid configuration still needs factual and timing review.

Agent-side use:

```sh
node scripts/preset.cjs --config quiz.config.json --key "QSK1 preset=seminar theme=glass" --output dist/custom.config.json --save-settings dist/my.qsk-settings.json
```

Reusable settings version 1 contains teams, theme, presentation and rules, plus optional validated `gameplay` and `localization` when supplied. Earlier version-1 files without these optional fields remain valid. Apply with `--settings FILE` after preset defaults. Without an explicit `--key`, the saved key is used. Relocated configuration outputs embed their approved source assets so their relative paths do not break. It omits event identity, questions, rounds, branding and assets; retain the complete event configuration for those. A new chat must receive the profile attachment or accessible link to restore custom choices. The short preset code alone restores only catalog defaults. No hidden cross-chat memory or automatic repository write occurs.

## Voice recordings and TTS

See [voice runtime](library/VOICE_RUNTIME.md) for controls and fallbacks, and [TTS model choices](library/TTS_MODELS.md) for optional pre-generation. Local browser TTS depends on installed voices. A downloaded quiz makes no speech API calls; hosted TTS must be generated with authorized tools before building, then embedded. Human recordings are equally supported. No assistant should claim to have recorded its own voice.

An optional question `narration` record maps a stem and/or four option slots to existing audio assets:

```json
{"stem":"q1-stem","options":["q1-a",null,"q1-c",null]}
```

Omit `stem` or `options` when unused. Each non-null reference must be WAV, MP3 or OGG and obey the same asset budget. The source text must match the final question/options; replacing text requires reviewing its recording too. Never embed a clip that gives away the correct answer. Recordings take priority where configured, with local speech/letter fallback as documented. Browser speech is separate from captured Web Audio and may be absent from screen recordings; use embedded clips when the recording must include narration.
