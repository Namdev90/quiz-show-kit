# The reusable quiz library

The [one-line launcher](../../prompts/START.md) starts the staged workflow; [the detailed interview](../TEACHER_PROMPT.md) is loaded only when needed. Use this library as the shared source of instructions. Start reads only START + AGENTS; read a module before its phase, not every linked file at startup.

| Need | Open |
| --- | --- |
| Reuse a research, design, repair or ideation prompt | [Task prompt shelf](TASK_PROMPTS.md) |
| Find the right directory | [Repository map and search routes](DIRECTORY_MAP.md) |
| Reuse real media | [Asset library](../../assets/README.md) and [catalog](../../assets/catalog.json) |
| Reduce repeated context | [Lean workflow](LEAN_WORKFLOW.md) and [Ponytail provenance](PONYTAIL.md) |
| Generate a missing asset | [Optional open-source tools and plugin routes](MEDIA_TOOLING.md) |
| Choose a starting experience | [Five quiz presets + five visual presets, both with Custom](PRESETS.md) |
| Choose Teacher-mode defaults or Competition-mode granular setup | [Authoring-mode interview](../TEACHER_PROMPT.md) when needed; the first mode choice is in START |
| Research, ideate and calibrate questions | [Sources and difficulty rubric](QUESTION_RESEARCH.md) |
| Edit supplied questions, review changes or export DOCX/optional print | [Question-bank workflow](QUESTION_BANK.md) |
| Add diagrams, logos or a clear voice | [Assets and narration](ASSETS_AND_VOICE.md) |
| Suggest useful features safely | [Feature recommendations and dependencies](FEATURES.md) |
| Review the repository or repair a defect | [Review, fixes and real PRs](REVIEW_AND_FIXES.md) |
| Choose a model or specialist tool | [Capability-based routing](MODEL_ROUTING.md) |
| Reapply a personal setup next time | [Public QSK1 decoder and reusable settings](REUSE_PROTOCOL.md) |

**Flow:** Teacher mode / Competition mode → missing brief inputs → automatic settings or granular choices → research → optional teacher review → build and checks → offline quiz + reusable setup. Skip the first mode question only when the mode is explicitly supplied/restored; never infer it from the quiz preset. Both routes use the same verification and safety requirements. Switching routes retains completed work.

The canonical input contract is [Configuration](../CONFIGURATION.md); the current implementation is the source of truth for availability. [Extension guidance](../EXTENDING_ENGINE.md) covers requests beyond it. Recommendations and proposed extensions are not implemented features. The [current BioVista showcase](../../examples/biovista/README.md) uses approved enhancements; preserve the [historical original](../../examples/biovista/original/) and its [asset notices](../../examples/biovista/original/ASSET_NOTICES.md). Custom teacher events remain separate.
