# QSK1 · Start

Curated for Parul University Goa · Open to every teacher.

```text
Read https://github.com/Namdev90/quiz-show-kit/blob/main/prompts/START.md and run QSK1.
```

Read [AGENTS.md](../AGENTS.md) once. These two files are the startup instructions; **do not load the whole library**. Respect the user's request and higher-priority instructions. If retrieval fails, request these files rather than guessing.

1. Restore readable choices; with a saved key/profile, load [reuse](../docs/library/REUSE_PROTOCOL.md). Current explicit mode overrides saved mode. Unless the authoring mode is explicitly supplied/restored, **first ask “Which setup would you like?” with exactly “Teacher mode” and “Competition mode”**. Ask this before topic or presets, even if some quiz details are known. Never infer mode from a quiz preset or full/short playback.
2. Load [presets](../docs/library/PRESETS.md). **Teacher mode:** ask only missing essential topic/audience, time and necessary content inputs; choose compatible presets/counts automatically, using friendly/classroom when no better fit is known. Show a short summary with Customize or Switch mode; do not run a settings interview. **Competition mode:** load [the interview](../docs/TEACHER_PROMPT.md) for all supported granular choices, one manageable question at a time; honor known settings and “choose for me.” Both retain five quiz and five visual presets + Custom when selecting/customizing. Switching keeps prior choices. Prefer supported choice widgets and accept available voice replies.
3. Before drafting or accepting supplied questions, load [research](../docs/library/QUESTION_RESEARCH.md). Independently check every item, option and source; cover topics, repeats and answer leakage. Give a compact quality report, record unresolved creator overrides honestly, and offer review once; honor skips.
4. For media, search [the asset catalog](../assets/README.md) first. Reuse approved assets and purpose-built tools before generating media or writing code. Load [media routes](../docs/library/MEDIA_TOOLING.md) only when needed.
5. Before building, read [configuration](../docs/CONFIGURATION.md) and `package.json`; use the existing compiler. For editable DOCX or optional print export, load [bank workflow](../docs/library/QUESTION_BANK.md). Deliver offline HTML, editable bank/configuration, reusable settings and next-session prompt. Without build capability, finish useful work and a precise handoff; do not call it a finished quiz.
6. Each run: check the actual source revision and the relevant touched instructions/code, then report concise findings. Fix/open real PRs when authorized; never publish private material by default. Load [review guidance](../docs/library/REVIEW_AND_FIXES.md) for repair/contribution work.

Use concise replies, stored files and small edits instead of repeating settings or full banks. Read a module once per revision; refresh only when changed or missing. Preserve requirements, verification, accessibility and runtime safeguards. See [the directory map](../docs/library/DIRECTORY_MAP.md) only when a path is needed. QSK1 is public shorthand, not encryption or automatic cross-chat memory.

Both modes use the same independent verification, rights/privacy and validation checks. Automatic setup never authorizes publishing or a factual override. Preserve the mode in the next-session key as `setup=teacher` or `setup=competition`; ask first only if no explicit/restored mode exists.
