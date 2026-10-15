# Configure a quiz

`quiz.config.json` is the canonical input. Its `schemaVersion` is `1`. Start with the included BioVista configuration and edit a copy for your event. Keep the actual example under `examples/biovista/` intact.

The kit supports two teams, matched pairs, four options, and one correct answer. It supports different themes and even main-question counts per round. Those are the current bundled-mode limits. Additional teams, tournament formats, buzzers, open answers and speed multipliers can be developed as engine extensions; see [the extension guide](EXTENDING_ENGINE.md).

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

Team IDs are engine identities, not required display names. For example, `{"id":"Bio","name":"Team Atlas","color":"#18A878"}` changes the displayed name while preserving the two-team engine contract. Controls remain in English; UTF-8 question and event text can contain other languages. A full interface translation is not a configuration feature.

Persistence is separated by event and a configuration fingerprint. Keep `event.id` stable while preparing one competition. Changing questions or rules creates a new profile; an incompatible checkpoint should not be treated as a continuation of the old game. Do not change rules midway through a live session.

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
| `stem` | Complete question text before choices appear; up to 300 characters. |
| `options` | Exactly four distinct answer strings; up to 180 characters each. |
| `correct` | Integer index `0`, `1`, `2`, or `3`, corresponding to displayed A, B, C, or D. |
| `explanation` | Concise explanation suitable for the live reveal; up to 450 characters. Aim for 20–45 words. |
| `sources` | Up to 12 source records with `title` and an optional HTTPS `url`. A supplied report can be cited by title without inventing a public URL. |
| `verificationDate` | The date the author actually checked those sources, in `YYYY-MM-DD` form. |
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

The validator can accept a missing source list; this does not make a question fact-checked. For a researched event, supply sources supporting the answer and explanation, and record the date of actual review. Keep inaccessible or disputed claims out of scored play until resolved.

Keep the unscored demonstration separate from the main inventory. Reserves should be suitable for the round and difficulty they may replace; retain the example's supported reserve eligibility metadata when adapting it. Tie questions are optional but, when supplied, must form complete matched pairs. Without an available tie pair, an unresolved tie needs a host/faculty decision rather than an invented winner.

Short mode keeps complete pairs. It must not remove only one team's primary opportunity. Review total count, per-team topic/difficulty balance, and answer-position balance after editing.

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

Reusable settings version 1 contains teams, theme, presentation and rules. Apply with `--settings FILE` after preset defaults. Without an explicit `--key`, the saved key is used. Relocated configuration outputs embed their approved source assets so their relative paths do not break. It omits event identity, questions, rounds, branding and assets; retain the complete event configuration for those. A new chat must receive the profile attachment or accessible link to restore custom choices. The short preset code alone restores only catalog defaults. No hidden cross-chat memory or automatic repository write occurs.

## Voice recordings and TTS

See [voice runtime](library/VOICE_RUNTIME.md) for controls and fallbacks, and [TTS model choices](library/TTS_MODELS.md) for optional pre-generation. Local browser TTS depends on installed voices. A downloaded quiz makes no speech API calls; hosted TTS must be generated with authorized tools before building, then embedded. Human recordings are equally supported. No assistant should claim to have recorded its own voice.

An optional question `narration` record maps a stem and/or four option slots to existing audio assets:

```json
{"stem":"q1-stem","options":["q1-a",null,"q1-c",null]}
```

Omit `stem` or `options` when unused. Each non-null reference must be WAV, MP3 or OGG and obey the same asset budget. The source text must match the final question/options; replacing text requires reviewing its recording too. Never embed a clip that gives away the correct answer. Recordings take priority where configured, with local speech/letter fallback as documented. Browser speech is separate from captured Web Audio and may be absent from screen recordings; use embedded clips when the recording must include narration.
