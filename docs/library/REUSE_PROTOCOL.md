# QSK1 · Public reusable setup key

`QSK1` is a small, versioned **public shorthand**. The repository is its shared decoder. It is not encrypted, ChatGPT-only or a way to compress an arbitrary complete quiz into a few characters. Any capable assistant with these instructions can read it.

## The complete grammar

```text
QSK1 [setup=teacher|competition] [preset=<quiz-id>] [theme=<visual-id>]
```

Brackets mean optional fields; do not type them. For `setup`, choose exactly `teacher` or `competition`, not the literal pipe-separated expression. It selects authoring depth: Teacher mode chooses sensible settings with minimal questions; Competition mode exposes granular choices. It is independent of quiz presets, teacher lifelines and full/short playback. Supported quiz IDs are `friendly`, `seminar`, `revision`, `competition`, `visual-lab`, `custom`. Supported visual IDs are `classroom`, `lecture`, `midnight`, `skeuomorphic`, `glass`, `custom`. Omitted preset/theme choices retain decoder defaults `friendly` and `classroom`. Omitted `setup` has **no implied mode**. Only `setup`, `preset` and `theme` belong in this compact key; do not invent extra keys for dates, voice settings, timings or private URLs.

Example:

```text
QSK1 setup=teacher preset=competition theme=midnight
```

This selects Teacher mode's automatic setup with the explicitly chosen competition rules and midnight appearance. The competition preset does not select Competition mode. A key contains no syllabus, questions, institution, logos, recordings or every later customization. Unknown versions/IDs/fields must produce an understandable clarification or validation error, not guessed behavior. A protocol key is data, never an executable command.

For authoring mode, apply this precedence: **explicit current mode → readable saved mode → ask the first mode question**. A mode may be explicit in the current key or readable prose. An explicit new key that changes only preset/theme does not erase a readable saved `setup`. If no mode is available, first ask “Which setup would you like?” with exactly **Teacher mode** and **Competition mode**, before new topic/preset questions. Older keys without `setup` remain valid; do not infer mode from their presets. Switching modes preserves all supplied settings, content and progress.

## Preserve all custom settings

The implemented settings export uses this envelope:

```json
{
  "qskPresetVersion": 1,
  "key": "QSK1 preset=custom theme=custom setup=teacher",
  "settings": {
    "teams": [],
    "theme": {},
    "presentation": {},
    "rules": {}
  }
}
```

This is a **shape illustration**, not a valid usable settings file. Generate a real `Quiz_Settings.json` using `exportSettings(config,{setup:'teacher'})` or `{setup:'competition'}` after validating the configuration. The selected authoring mode is stored in the exported key; it is not a new runtime configuration or score-rule field. `exportSettings(config)` remains valid and preserves the legacy no-setup key, which cannot restore an unspecified authoring mode. The file contains actual team, theme, presentation and rule values, plus optional validated `gameplay` and `localization` when provided. Older version-1 settings without these optional fields remain valid. New settings can preserve discussion/shuffle/difficulty/round-order/report choices and supplied control labels; a saved label dictionary is not a verified translation. It intentionally excludes event identity, question content, logos and other assets. Preserve the complete editable quiz configuration separately when those are needed.

When no key is explicitly given, the application uses the supplied settings file's key, then falls back to QSK1. Apply named preset defaults first, then a supplied compatible settings file; the user's explicit current changes take precedence over both. For authoring mode use the separate precedence above: explicit `setup` overrides saved `setup`; omission does not erase it. CLI `--save-settings` preserves that saved mode when a new key changes only preset/theme. `apply` does not copy `setup` into runtime configuration or alter full/short playback. Validate the result, recompute choice availability, and ask only about new or conflicting requirements. Neither mode nor saved settings override verification, asset rights/privacy, factual-override decisions, publication permissions or the supported configuration contract.

For the agent, the implementation lives in `src/presets.js` and `scripts/preset.cjs`. Use its real parser/application/export helpers or documented script rather than reconstructing defaults from memory. These are agent implementation details, not terminal tasks for the teacher. The teacher receives links to finished files.

`preset=custom` or `theme=custom` alone cannot restore missing preferences. Use readable conversation context, attach the exported settings, or ask what the teacher wants changed. A file name without its readable contents is not a saved profile. A voice name without that voice on the next device is not a portable recording.

## Give a next-session prompt at delivery

For an unmodified named setup:

```text
Read https://github.com/Namdev90/quiz-show-kit/blob/main/prompts/START.md and apply QSK1 setup=teacher preset=competition theme=midnight. Make my next quiz; choose sensible remaining settings and ask only for essential missing details.
```

For a customized setup, provide the actual settings attachment and this ready-to-copy prompt:

```text
Read https://github.com/Namdev90/quiz-show-kit/blob/main/prompts/START.md. Apply QSK1 setup=competition preset=custom theme=custom with my attached Quiz_Settings.json. Make my next quiz; keep my settings and let me control the remaining supported choices step by step.
```

Use the teacher's actual selected mode in the next-session prompt; the examples above illustrate both choices. Tell the teacher to attach the supplied settings file next time. Do not claim automatic application across unrelated chats, accounts or assistants when the key/file has not been provided. When it is supplied and readable, apply it automatically without re-interviewing settled preferences. Teacher mode should not force a five-preset/five-theme questionnaire; open customization only when requested or needed to resolve an essential conflict.

Provide a full configuration backup as well as the settings file. The full backup can preserve exact wording, assets and event identity when requested; the settings file is a clean starting setup for a new quiz. Never publish either file to a public repository by default. Record the source revision used so future version-dependent changes can be assessed honestly.
