# The reusable quiz library

The [one-line launcher](../../prompts/START.md) loads [the teacher workflow](../TEACHER_PROMPT.md). Use this library as the shared source of instructions; read a module before carrying out its phase.

| Need | Open |
| --- | --- |
| Reuse a research, design, repair or ideation prompt | [Task prompt shelf](TASK_PROMPTS.md) |
| Choose a starting experience | [Five quiz presets + five visual presets, both with Custom](PRESETS.md) |
| Research, ideate and calibrate questions | [Sources and difficulty rubric](QUESTION_RESEARCH.md) |
| Add diagrams, logos or a clear voice | [Assets and narration](ASSETS_AND_VOICE.md) |
| Suggest useful features safely | [Feature recommendations and dependencies](FEATURES.md) |
| Review the repository or repair a defect | [Review, fixes and real PRs](REVIEW_AND_FIXES.md) |
| Choose a model or specialist tool | [Capability-based routing](MODEL_ROUTING.md) |
| Reapply a personal setup next time | [Public QSK1 decoder and reusable settings](REUSE_PROTOCOL.md) |

**Flow:** brief → presets/custom → research → optional teacher review → build and checks → offline quiz + reusable setup.

The canonical input contract is [Configuration](../CONFIGURATION.md); the current implementation is the source of truth for availability. [Extension guidance](../EXTENDING_ENGINE.md) covers requests beyond it. Recommendations and proposed extensions are not implemented features. Preserve the real [BioVista example](../../examples/biovista/) and its [asset notices](../../examples/biovista/ASSET_NOTICES.md).
