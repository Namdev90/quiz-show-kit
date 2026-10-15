# Quiz Show Kit

![One prompt starts a reusable research, design and offline quiz workflow.](docs/images/kit-overview.svg)

**Curated for Parul University Goa · Open to every teacher.** Created by **Namdev Shirodkar**, a Parul University Goa student. Independent toolkit.

**Current toolkit: v1.1.1.** [Latest tested release and downloads](https://github.com/Namdev90/quiz-show-kit/releases/latest) · [Changes](CHANGELOG.md) · [Release contents and limits](docs/releases/v1.1.1.md)

## Start with one prompt

```text
Read https://github.com/Namdev90/quiz-show-kit/blob/main/prompts/START.md and run QSK1.
```

[**Copy the launch prompt**](prompts/START.md) · [Full workflow](prompts/START.md) · [Browse the library](docs/library/README.md) · [Try the BioVista Feature Showcase Quiz](https://github.com/Namdev90/quiz-show-kit/releases/download/v1.1.1/BioVista_Quiz_Public_Example.html)

Paste into ChatGPT or another capable assistant. It guides your choices, researches and reviews the questions, builds the quiz when file/build tools are available, and gives you a reusable prompt. **QSK1 is a public workflow shortcut**; the assistant must retrieve its instructions, or ask you to paste them. GitHub is the public destination; the ZIP also includes a local prompt launcher.

The first setup question is **Teacher mode or Competition mode?**

| Mode | How setup works |
| --- | --- |
| **Teacher mode** | Give the topic, learner level and available time; the assistant fills the remaining gaps with sensible presets and handles the detailed setup automatically. |
| **Competition mode** | Choose detailed settings for rounds, scoring, timing, passing, media, appearance and other supported controls, one manageable decision at a time. |

Switch modes or customize a setting at any time without restarting. Both modes use the same evidence review and validation. These are authoring choices, separate from the quiz's full/short playback setting and its five experience presets.

## Five starting points. Everything adaptable.

| Friendly classroom | Discussion seminar | Focused revision | Quiz competition | Visual laboratory | Custom |
| --- | --- | --- | --- | --- | --- |
| Warm, low pressure | Time to discuss | Recall and application | Showmanship and challenge | Diagrams and observations | Your own brief |

![Illustrative visual directions: Classroom teal, Lecture light, Midnight blue, Skeuomorphic desk, Glass studio and Custom.](docs/images/theme-swatches.svg)

Choose the experience and visual style independently. Customize sources, difficulty, rules, assets, narration and motion. The workflow offers compatible choices and explains when a new feature needs a tested engine extension. [See the presets and workflow library →](docs/library/README.md)

## A library, loaded only when needed

| Create | Present | Improve |
| --- | --- | --- |
| [Directories and search routes](docs/library/DIRECTORY_MAP.md) | Self-contained offline HTML | Scoped repository review |
| Difficulty and fair question pairs | Configurable visuals, sound and timing | Feature suggestions and fixes |
| [Cataloged reusable assets](assets/README.md) | Pause, undo, recovery and host tools | Reviewable changes and PR guidance |
| Five presets + custom | Local TTS or embedded voice recordings | Reusable next-session prompt |

[Reuse first →](assets/README.md) Choose a checked-in asset before generating media. Missing media can use an available plugin/tool or [open-source authoring library](docs/library/MEDIA_TOOLING.md); all playable output is embedded. The assistant follows [lean, staged instructions](docs/library/LEAN_WORKFLOW.md), adapted from [Ponytail](docs/library/PONYTAIL.md), without sacrificing requested features.

[Measured startup text](docs/PROMPT_BUDGET.json) tracks the current START + AGENTS loading budget against the recorded baseline. Detailed modules load only when needed. This measures instruction bytes, not total tokens or billing.

Smart voice cues say a one-word option on hover, focus or selection; longer options can use full-text speech. Read question aloud before opening choices. [Voice controls](docs/library/VOICE_RUNTIME.md) · [Five voice routes + Custom](docs/library/TTS_MODELS.md)

The tested bundled mode uses **two teams, four choices and one correct answer**, with complete matched pairs. New formats can be implemented in the source; choosing a custom idea alone does not implement it. [Configuration reference](docs/CONFIGURATION.md) · [Extending the engine](docs/EXTENDING_ENGINE.md)

Supplied and researched questions share the same independent evidence review, with per-option explanations, explicit verification disagreements and a compact quality report. [Editable-bank workflow](docs/library/QUESTION_BANK.md) covers DOCX review/rollback and optional print material. [Implementation coverage](docs/IMPLEMENTATION_COVERAGE.md) separates completed work, remaining limits, rejected ideas and decisions still needed; [actual test evidence](docs/IMPLEMENTATION_QA.md) reports the environments exercised.

## Build and play

With Node.js 22 or newer, build a reviewed configuration:

```sh
npm run build -- --config path/to/quiz.config.json --output dist/Quiz_Offline.html
```

Open the resulting HTML in a browser. Its scripts and approved media are embedded; play needs no server, backend, runtime CDN or API key. Rehearse the display, sound and flow before the event. Sound needs a real browser gesture, source links need internet, and answers are embedded in the host's file.

The assistant should deliver the file directly when capable. Otherwise it prepares a self-contained handoff for a build-capable assistant, with the reviewed configuration, approved assets and exact build steps. [Handoff guidance](docs/CHATGPT_HANDOFF.md)

<details>
<summary><strong>BioVista feature showcase and original archive</strong></summary>

The current example runs the latest engine with **30 main questions, four reserves, six tie cards and one practice card**. Its original question content and scoring are retained. The **Apex showcase profile** enables compatible supported features, with settings visible and read-only and the supplied Chota Namu character shown. Your own quizzes and reusable settings remain configurable. Apex names this example profile; it is not an additional engine tier or preset. The [requirements audit](docs/SHOWCASE_AUDIT.md) distinguishes demonstrated features, authoring tools and remaining decisions.

[Try the BioVista Feature Showcase Quiz](https://github.com/Namdev90/quiz-show-kit/releases/download/v1.1.1/BioVista_Quiz_Public_Example.html) · [Feature tour](examples/biovista/README.md) · [Original archived HTML source](examples/biovista/original/BioVista_Quiz_Offline.html) · [Question bank](examples/biovista/questions.json) · [Provenance](examples/biovista/origin.json) · [Asset notices](examples/biovista/ASSET_NOTICES.md)

</details>

<details>
<summary><strong>Contribute and verify</strong></summary>

```sh
npm ci --ignore-scripts
python3 -m venv .venv-authoring
.venv-authoring/bin/python -m pip install -r requirements-authoring.txt
QSK_PYTHON=.venv-authoring/bin/python npm run check
```

These POSIX-shell commands prepare the existing DOCX authoring toolchain, build the quiz and prompt launcher, validate the original configuration, and run the automated tests. On Windows, use the virtual environment's `Scripts/python.exe` and set `QSK_PYTHON` to that executable in your shell. An existing Python environment with the pinned packages can be selected instead. Python is needed for DOCX authoring/tests, not for building or playing an ordinary quiz. Browser layout, factual correctness and physical audio/projector quality require separate checks. The optional `node scripts/browser-smoke.cjs` checks the launcher with an installed Playwright Core and Chromium.

[Contributing](CONTRIBUTING.md) · [Agent guidance](AGENTS.md) · [Verification](docs/IMPLEMENTATION_QA.md) · [GitHub setup](docs/GITHUB_SETUP.md) · [Security](SECURITY.md)

</details>

<details>
<summary><strong>License and credits</strong></summary>

Own code uses the [MIT license](LICENSE). Bundled libraries retain their own terms, including GSAP's Standard No Charge license. Logos, trademarks, recordings and separately credited media are not covered by the code license. Use approved branding and media for your event. [Third-party notices](THIRD_PARTY_NOTICES.md) · [BioVista asset notices](examples/biovista/ASSET_NOTICES.md) · [Current asset/permission review](docs/ASSET_REUSE_REVIEW.md)

</details>
