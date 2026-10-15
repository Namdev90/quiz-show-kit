# BioVista: current feature showcase

[Try the BioVista Feature Showcase Quiz](https://github.com/Namdev90/quiz-show-kit/releases/download/v1.1.2/BioVista_Quiz_Public_Example.html) · [Editable configuration source](../../biovista.showcase.config.json) · [Question bank DOCX](BioVista_Question_Bank.docx) · [Reusable settings](BioVista_Showcase.qsk-settings.json) · [Quality review source](BioVista_Quality_Review.html) · [Historical original source](original/BioVista_Quiz_Offline.html)

The current example runs the current Quiz Show Kit engine with the original public BioVista bank: **30 main questions, four reserves, six tie cards and one practice card**. Question wording, options, intended answers, overall explanations, source titles/URLs and historical verification dates are unchanged. All 41 cards now have four concise option rationales and inspected evidence dated 15 October 2026. Original citation identities are retained and corroborating sources appended. M23 has a neutral geometric accessible label that preserves the image task without naming its answer. The [evidence review](EVIDENCE_REVIEW.md) records all thirteen manual warning dispositions, shared teaching and pair/coverage limits. Six existing numerical items and six image questions receive descriptive subtype labels without changes to their content. There are seven existing visual cards in total: the numerical M30 also includes a visual. The [historical HTML, bank and provenance](original/README.md) are preserved byte for byte. The ordinary root `quiz.config.json` remains the baseline configuration; the showcase has its own event identity and settings.

The CTA downloads the release HTML; open the saved file in a laptop browser. Gameplay, included media, host tools and rehearsal work locally; external source websites need internet. The file contains its answer bank, so it is a host document rather than a secure participant handout. **Apex** names this fixed feature showcase profile, not an extra engine tier: supported compatible features are enabled, settings are visible and read-only, and ordinary quizzes remain configurable. Consult the [current QA report](../../docs/RELEASE_QA.md) and [requirement matrix](../../docs/SHOWCASE_AUDIT.md) for actual platform checks and limits.

## Start with this short tour

1. Open **Settings** on the welcome screen. Inspect the enabled read-only showcase settings and the supplied Chota Namu character. Customize a separate quiz with the reusable settings rather than changing the example.
2. Run **Rehearsal / preflight**. It uses a separate state; inspect its findings, then return to the live example. Run an event-screen preview to inspect media and narration on the actual computer.
3. Use the two-team coin toss and practice question. Watch the sequential choices, the **3-second discussion**, then the full answer clock. Display letters are shuffled, but answer identities, scoring and narration remain together.
4. On a main question, try a wrong answer and receiving-team pass. The tried wrong choice stays blocked. Use pause, teacher consultation and Undo, then save/reopen a resume copy.
5. Open host controls to inspect reserve choices, selected statistics, source/explanation reveal, revision download, asset credits, audience view and repair handoff. **M19** is the first existing main question with a diagram; click its visual and use Escape to return.

## Deliberate showcase defaults

| Setting | Showcase choice | What it demonstrates |
| --- | --- | --- |
| Answer/teacher/grace clocks and scoring | Original 15/7/7/8-second clocks and original scoring | Existing BioVista operating rules remain intact. |
| Option shuffle | On | One fixed identity-preserving permutation per question, including passes and recovery. |
| Discussion | 3 seconds | Choices are visible but answers remain locked until discussion finishes. Normal quizzes can set 0 for ordinary fast play. |
| Difficulty | Rising, using accessible → moderate → challenging | Intact matched pairs remain balanced. Falling and manual remain choices for a separate configurable quiz. |
| Round turn order | Alternate | The two teams swap who starts each new round; membership is unchanged. |
| Statistics | All 11 supported metrics selected | Normal quizzes can choose a subset. Illustrative winning chances retain their explicit assumptions. |
| Revision report | On | Local host reports describe observed revealed-question performance by topic/team. |
| Character | Supplied Chota Namu PNG, visible | Welcome and About/settings only; its showcase visibility is fixed. Pointer-responsive tilt and gentle idle motion use the unchanged PNG; system reduced motion is respected. |
| Motion/audio | Cinematic effects, full option speech, question narration, 80% volume | Local voice availability still applies, with embedded A-D/selection fallback clips. Physical audio remains an event-machine check. |
| Control language | English | An exact-label dictionary is supported for a separate event; no unreviewed translation was invented. |

Every supported optional capability remains selectable in the general engine. Mutually exclusive themes, difficulty directions and authoring depths are alternatives; the fixed showcase selects one compatible combination.

## Feature map

| Capability | Where to inspect it | Coverage and limits in this example |
| --- | --- | --- |
| Sources and answer explanation | After answer reveal | Existing references and overall explanations appear only after valid opportunities finish. Reference links may be unavailable offline without affecting scores. |
| Explanation for each option | After every answer reveal; DOCX fields | All 41 cards have four original option rationales supported by inspected sources. Their mapping follows shuffled identities. Source/check notes are dated 15 October 2026; historical dates are retained separately. |
| Rehearsal and preflight | Settings / rehearsal controls | Separate rehearsal state, phase/scoring checks and local media inventory. A successful rehearsal is not a fresh scientific review or proof of physical speaker quality. |
| Avoid / matched replacement | Host score/question controls | Existing reserves are ranked by topic/format fit, with round/difficulty/time enforced. Some topics have no exact reserve. Mismatches are disclosed; scored/revealed replacement explains and audits its rollback. |
| Statistics and revision | Settings, statistics and report download | Offered passes and reached passes are distinct; totals derive from the ledger. Detailed answers stay in host exports, not a long public result report. |
| Coin and turn rotation | Welcome toss and round introductions | Two-team toss commits one result before animation; successive round starts alternate. More than two teams and a reel selector remain unresolved architecture scope. |
| Visual zoom | Existing diagram/image questions, starting at M19 | Click to enlarge; close or Escape returns to the question. Scientific imagery and alternative text are retained. |
| Host/audience view | Settings / audience view | Optional second window shows the audience-safe view. Privacy requires an extended display; mirroring is not private. |
| Recovery and failure help | Save resume copy; visible error/repair controls | Reopen paused. A redacted repair payload can be previewed/copied locally; the runtime never uploads it or pushes GitHub fixes. |
| Credit and licenses | About/settings and credits download | Creator/toolkit credit, the existing approved event marks and original character provenance. No implied university endorsement of other events. |
| Team names, timing, effects and language | Configuration and read-only showcase Settings | Team labels only. The general engine permits supported settings changes; this demonstration fixes its profile. |
| Text, numerical and visual MCQs | Original questions, six numerical items and seven existing visuals | Existing numerical items (M07, M08, M17, M18, M30, R02) and visuals are explicitly classified without new scientific claims. Graph, code, sequence-as-MCQ and matching-as-MCQ remain supported authoring alternatives not populated here. No free-response or drag-and-drop game was added. |
| Editable bank and safe import | Companion DOCX and commands below | Stable IDs/media metadata, change preview, valid-bank preservation, explicit apply and exact rollback. Import validates structure, not scientific truth. |
| Quality, repeat and leakage review | Companion quality review and authoring prompt | Twelve heuristic candidates remain visible with manual dispositions; M23's accessible-label warning is corrected. The evidence ledger documents all thirteen reviews and accepted shared-teaching limits. Builds fetch no sources. |
| Reusable authoring modes | Companion settings key / START prompt | `setup=teacher` is the guided minimal path; `setup=competition` exposes advanced creator choices. These select authoring depth, never live gameplay modes. |

Optional print fallback remains a creator request that needs a separately prepared and checked participant/host export. A browser Print command or the answer-bearing DOCX is not presented as a verified participant fallback. No visual session planner, roles rotation, ordinary-click confirmation feature or dedicated sensory preset was added.

## Editable DOCX and rollback walkthrough

Keep the published DOCX unchanged. Make a copy to edit, and ask the assistant to make a separate root-level copy of `biovista.showcase.config.json` named `my-biovista.config.json`. Remove `showcase: true` there for an editable event, then export a fresh DOCX for that configuration before applying changes. Keeping the copy beside the original preserves relative asset paths. The existing published DOCX remains bound to the unmodified fixed showcase.

From the repository root:

```sh
node scripts/question-bank.cjs export --config my-biovista.config.json --output my-biovista-bank.docx
node scripts/question-bank.cjs preview --config my-biovista.config.json --document my-edited-bank.docx --workspace dist/biovista-review-1
```

Read the generated `review.html`. New or changed educational content needs independent checking even when format validation succeeds. Only after reviewing the actual changes:

```sh
node scripts/question-bank.cjs apply --config my-biovista.config.json --review dist/biovista-review-1/review.json
node scripts/question-bank.cjs rollback --config my-biovista.config.json --review dist/biovista-review-1/review.json
```

Apply and rollback are alternative deliberate steps; do not run them together automatically. The published [quality companion](BioVista_Quality_Review.json) is a read-only unchanged-bank example, not an apply transaction. For unclear format errors, use the documented **“I do not understand — fix it for me”** workflow; meaning-changing repairs need a creator decision.

The reusable settings file includes the gameplay/localization choices and the key `QSK1 preset=custom theme=custom setup=competition`. It excludes the event, bank, branding and media. Attach the full configuration for a complete event; attach the settings for repeatable preferences. Switch only `setup=teacher` for a guided authoring conversation without silently changing live rules.

## Regenerate from source

```sh
npm run build:example
npm run build:example -- --authoring
npm run build:launcher
```

The first command is Node-only and regenerates current HTML, reusable settings, quality review and provenance. If configuration changes after DOCX export, it requests `--authoring` instead of publishing a stale companion. `--authoring` also regenerates the published companion DOCX using the existing Python 3 / `python-docx` helper; it never edits a user's separate DOCX. `build:launcher` regenerates the current example and checked-in local mirrors; its CTA points to the repository release download. GitHub Pages is disabled and no hosted preview is needed. Ordinary `npm run build` stays Node-only and builds baseline/custom configurations as before.

Publication requires both DOCX companions and validates their format, event, card count, configuration fingerprint and actual document SHA-256 before writing output. Missing or changed companions require `--authoring`. Preservation compares the showcase with `original/questions.json` and the recorded digest of the original engine's normalized rules; editing the root configuration cannot redefine that baseline. A regression check recovers those rules from the digest-checked archived HTML. Supplemental evidence is allowed only with complete verified records and an exact question SHA-256 receipt in `evidence-review.json`; accessible-label edits additionally need an explicit before/after correction. Receipts cannot authorize changes to archived educational content, IDs, order/pairs or score rules.

Generated HTML embeds the toolkit version and deterministic runtime-source SHA-256 without the invoking checkout's commit or dirty flag, so unrelated commits and working changes do not change its bytes. Missing checkout provenance remains unknown in repair diagnostics. The current `origin.json` records the generated HTML's actual SHA-256; release commit identity belongs in release records outside the regenerable artifact.

The archive is verified against its recorded SHA-256 and never rewritten by these commands. Preserve the [asset notices](ASSET_NOTICES.md), [character notice](../../assets/characters/NOTICE.md) and third-party licenses with distributions. New events should use their own approved branding and independently reviewed bank.
