# Quiz Show Kit

Build a complete quiz show as one offline HTML file. Customize the event, two teams, questions, rules, colors, and approved logos while keeping the scoring engine and animated presentation.

The included example is the **real BioVista quiz**: 30 main questions across five rounds, four reserves, six tie cards, and one unscored demonstration. Its 41 cards, visual assets, and presentation are preserved in [BioVista_Quiz_Offline.html](examples/biovista/BioVista_Quiz_Offline.html). Download that file and open it in a browser to try the original event. See its [source questions](examples/biovista/questions.json), [provenance](examples/biovista/origin.json), and [asset notices](examples/biovista/ASSET_NOTICES.md).

## Make your quiz — for every teacher

**Curated for Parul University Goa · Open to every teacher.** Created by **Namdev Shirodkar**, a Parul University Goa student. Any teacher, subject, department or college can use and adapt it. This is an independent toolkit.

Paste this short instruction into ChatGPT, Gemini, Claude or another capable assistant:

```text
https://github.com/Namdev90/quiz-show-kit
Read docs/TEACHER_PROMPT.md fully and follow it. Guide me one question at a time to create my customized offline quiz. Use visual choices where supported, offer voice replies and defaults, and extend the engine for any new features I request.
```

The short instruction points to the [expanded teacher prompt](docs/TEACHER_PROMPT.md). ChatGPT reads it, asks about your lesson, logos, theme, animation, sound, teams, timing and scoring, then writes the questions for you. Say **choose for me** for suggested defaults. Turn on voice mode yourself if you prefer speaking. Repository retrieval depends on the tools in that conversation; if it cannot open the file, paste the file's full contents instead.

Open the [browser builder](https://namdev90.github.io/quiz-show-kit/) to edit, preview and download. No installation or API key is needed. For offline authoring, download the kit, extract it and open `index.html`.

1. Choose your AI assistant and click **Copy & open**. Paste the short instruction in its new tab. Choose “Another assistant” to copy without opening a provider. Existing lesson/settings details travel with it. The linked prompt guides quick or detailed setup. If ChatGPT cannot retrieve repository files, the builder can copy a self-contained questions-only prompt; customize its rules and appearance in the builder.
2. If your conversation can build files, it can deliver the offline HTML directly. Otherwise paste its entire configuration reply into **Paste ChatGPT's reply**, choose **Read reply**, check the summary and choose **Use these questions**. A complete configuration includes your customization choices; a questions-only draft retains your current settings.
3. Edit questions, answers, explanations, sources and images. **Customize your quiz** contains logos, themes, team colors, timing, points, motion, sound, editable intro text and optional audio replacements. Add rounds, reserves, practice cards or complete tie pairs with buttons.
4. Preview and rehearse, review every answer/source, then download one offline HTML file. **Save work** keeps an editable backup you can reopen.

The downloaded event contains its scripts and media; it needs no server, backend, runtime CDN or adjacent asset files. Opening source links needs internet. Sound requires a real browser gesture. A passing format check is not factual verification. Read the [faculty guide](docs/FACULTY_BUILDER.md), [configuration reference](docs/CONFIGURATION.md), and [current verification](docs/TEACHER_UPGRADE_QA.md).

## What you can configure

Use [quiz.config.json](quiz.config.json) as the editable BioVista starting point. Keep the preserved example unchanged and give a new competition its own `event.id`.

- Two team names and colors, editable opening wording, direct corner-logo uploads, three theme presets, custom palettes/system fonts, and optional DNA motif.
- Cinematic, gentle or no decorative motion; optional intro, confetti and point effects; sound on/off, volume, spoken A–D cues and individual audio replacements.
- Matched question pairs, four options with one correct answer, explanations, sources, diagrams or approved images, reserves, an optional demonstration, and optional tie pairs.
- An even number of main questions per round, within the documented limits.
- Answer, consultation, and entry-grace durations; sequential option entrances; scoring; optional passing and teacher lifelines; and short-mode pair counts.

The current bundled mode uses two teams with matched primary opportunities. Extra teams, other formats, open-answer marking and interface translation require an engine extension; they are not existing configuration switches. See [extending the engine](docs/EXTENDING_ENGINE.md). Event and question text can use UTF-8; controls are in English. See [Configuration](docs/CONFIGURATION.md) for exact fields, accepted assets, limits, and examples.

The BioVista defaults award **+10** for a primary correct answer, **−2** for primary wrong, **+2** for passed correct, and **−5** for passed wrong. Primary answers get 15 seconds; passed answers and the once-per-team teacher consultation get 7 seconds each. A→B→C→D enters sequentially over 1.8 seconds before the answer clock begins. A tried primary-wrong option is blocked on the passed turn. Ties use complete matched pairs, a separate tally, and no passing.

## Build with Node

Use Node.js 22 or newer. The CLI build uses the bundled runtime and Node's built-in modules:

```sh
npm run build
```

This reads the root configuration and creates `dist/Quiz_Offline.html`. For a separate event folder:

```sh
npm run build -- --config path/to/quiz.config.json --output dist/Quiz_Offline.html
```

Local asset paths resolve inside that configuration's directory. The browser builder instead uses the files you explicitly select or media embedded in the configuration.

Contributors should install the development dependencies before running the full checks:

```sh
npm install
npm run check
```

`check` builds the event and browser builder, validates the package, and runs the tests defined in `package.json`. A passing check does not establish factual accuracy, actual browser rendering, or room audio quality. See [Contributing](CONTRIBUTING.md) and [GitHub setup](docs/GITHUB_SETUP.md).

## Running an event

The exported file’s **Settings** menu includes live sound, volume, motion, coin/question/winner animation, intro, confetti and point-effect switches, plus creator/About details. Changes preserve scores and clocks; Save resume copy carries them to another computer. Toolkit credit appears in welcome/About, not results.

The presentation includes an opening reveal, a coin toss, shared DNA/timer movement, spoken option cues, point-by-point rewards and penalties, confetti, teacher consultation, round statistics, and winner presentation. Host tools provide content review, score corrections, reserves, undo, and resume copies. The engine controls scores and clocks; animations display their results.

Sound starts after a real browser gesture. Rehearse long text, both teams, passing, penalties, teacher timing, recovery, and tie flow. An embedded preview or browser privacy setting may deny local storage; **Save resume copy** downloads a complete quiz with the checkpoint. Optional recording depends on browser support and requires the host to choose the captured screen or window. Keep unreleased event files with the host: their answers are embedded in the HTML.

## License and credits

The project's own code is available under the [MIT license](LICENSE). Bundled libraries retain their own licenses, including GSAP's Standard No Charge license. MIT does not license the example's logos, trademarks, speech recordings, or other separately credited media. Read [Third-party notices](THIRD_PARTY_NOTICES.md) and [BioVista asset notices](examples/biovista/ASSET_NOTICES.md); use your own approved branding for a new event.

For security reports, see [SECURITY.md](SECURITY.md). For agent-assisted contributions, see [AGENTS.md](AGENTS.md).
