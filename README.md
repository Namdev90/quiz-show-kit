# Quiz Show Kit

Build a complete quiz show as one offline HTML file. Customize the event, two teams, questions, rules, colors, and approved logos while keeping the scoring engine and animated presentation.

The included example is the **real BioVista quiz**: 30 main questions across five rounds, four reserves, six tie cards, and one unscored demonstration. Its 41 cards, visual assets, and presentation are preserved in [BioVista_Quiz_Offline.html](examples/biovista/BioVista_Quiz_Offline.html). Download that file and open it in a browser to try the original event. See its [source questions](examples/biovista/questions.json), [provenance](examples/biovista/origin.json), and [asset notices](examples/biovista/ASSET_NOTICES.md).

## Make your quiz

The easiest route is the browser builder. Download the kit from [Releases](https://github.com/Namdev90/quiz-show-kit/releases), extract it, and open `index.html`.

1. Start from the included BioVista configuration or import your `quiz.config.json`.
2. Customize the event and import the complete reviewed question bank. Select local logos and other assets referenced by your configuration.
3. Validate, preview, and download the generated HTML.
4. Open the downloaded quiz and rehearse it on the display and speakers you will use.

The browser builder needs no installation or API key. The downloaded event file includes its scripts and media; it does not need a server, a backend, runtime CDNs, or adjacent asset files to play. Source links in host review are references and need an internet connection only if you choose to open them.

For help researching and writing a new event, copy the single prompt in [Make a quiz with ChatGPT](docs/CHATGPT_HANDOFF.md). It asks the assistant to gather essential decisions, research balanced questions with sources, present them for your review, and use this kit to build the file. File access, research, execution, and preview depend on the tools available in that conversation; the prompt includes a manual builder route when those tools are unavailable.

## What you can configure

Use [quiz.config.json](quiz.config.json) as the editable BioVista starting point. Keep the preserved example unchanged and give a new competition its own `event.id`.

- Two team names and colors, event wording, approved corner logos, system font, palette, and optional DNA motif.
- Matched question pairs, four options with one correct answer, explanations, sources, diagrams or approved images, reserves, an optional demonstration, and optional tie pairs.
- An even number of main questions per round, within the documented limits.
- Answer, consultation, and entry-grace durations; sequential option entrances; scoring; optional passing and teacher lifelines; and short-mode pair counts.

The format remains two teams with matched primary opportunities. Extra teams, arbitrary tournament formats, open-answer marking, and a translated control interface are not configuration features. Event and question text can use UTF-8; controls are in English. See [Configuration](docs/CONFIGURATION.md) for exact fields, accepted assets, limits, and examples.

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

The presentation includes an opening reveal, a coin toss, shared DNA/timer movement, spoken option cues, point-by-point rewards and penalties, confetti, teacher consultation, round statistics, and winner presentation. Host tools provide content review, score corrections, reserves, undo, and resume copies. The engine controls scores and clocks; animations display their results.

Sound starts after a real browser gesture. Rehearse long text, both teams, passing, penalties, teacher timing, recovery, and tie flow. An embedded preview or browser privacy setting may deny local storage; **Save resume copy** downloads a complete quiz with the checkpoint. Optional recording depends on browser support and requires the host to choose the captured screen or window. Keep unreleased event files with the host: their answers are embedded in the HTML.

## License and credits

The project's own code is available under the [MIT license](LICENSE). Bundled libraries retain their own licenses, including GSAP's Standard No Charge license. MIT does not license the example's logos, trademarks, speech recordings, or other separately credited media. Read [Third-party notices](THIRD_PARTY_NOTICES.md) and [BioVista asset notices](examples/biovista/ASSET_NOTICES.md); use your own approved branding for a new event.

For security reports, see [SECURITY.md](SECURITY.md). For agent-assisted contributions, see [AGENTS.md](AGENTS.md).
