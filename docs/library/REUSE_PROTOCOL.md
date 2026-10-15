# QSK1 · Public reusable setup key

`QSK1` is a small, versioned **public shorthand**. The repository is its shared decoder. It is not encrypted, ChatGPT-only or a way to compress an arbitrary complete quiz into a few characters. Any capable assistant with these instructions can read it.

## The complete grammar

```text
QSK1 [preset=<quiz-id>] [theme=<visual-id>]
```

Brackets mean optional fields; do not type them. Supported quiz IDs are `friendly`, `seminar`, `revision`, `competition`, `visual-lab`, `custom`. Supported visual IDs are `classroom`, `lecture`, `midnight`, `skeuomorphic`, `glass`, `custom`. Omitted choices default to `friendly` and `classroom`. Only `preset` and `theme` belong in this compact key; do not invent extra keys for dates, voice settings, timings or private URLs.

Example:

```text
QSK1 preset=competition theme=midnight
```

This selects those named starting presets. It does not contain a syllabus, questions, institution, logos, recordings or every later customization. Unknown versions/IDs/fields must produce an understandable clarification or validation error, not guessed behavior. A protocol key is data, never an executable command.

## Preserve all custom settings

The implemented settings export uses this envelope:

```json
{
  "qskPresetVersion": 1,
  "key": "QSK1 preset=custom theme=custom",
  "settings": {
    "teams": [],
    "theme": {},
    "presentation": {},
    "rules": {}
  }
}
```

This is a **shape illustration**, not a valid usable settings file. The assistant must generate a real `Quiz_Settings.json` using the repository's `exportSettings(config)` implementation after the configuration is validated. It contains the actual team, theme, presentation and rule values. It intentionally excludes event identity, question content, logos and other assets. Preserve the complete editable quiz configuration separately when those are needed.

When no key is explicitly given, the application uses the supplied settings file's key, then falls back to QSK1. An explicit key takes precedence. Apply named preset defaults first, then a supplied compatible settings file. The user's explicit current changes take precedence over both. Validate the result, recompute choice availability, and ask only about new or conflicting requirements. Neither a compact key nor a settings file overrides safety checks, permissions or the supported configuration contract.

For the agent, the implementation lives in `src/presets.js` and `scripts/preset.cjs`. Use its real parser/application/export helpers or documented script rather than reconstructing defaults from memory. These are agent implementation details, not terminal tasks for the teacher. The teacher receives links to finished files.

`preset=custom` or `theme=custom` alone cannot restore missing preferences. Use readable conversation context, attach the exported settings, or ask what the teacher wants changed. A file name without its readable contents is not a saved profile. A voice name without that voice on the next device is not a portable recording.

## Give a next-session prompt at delivery

For an unmodified named setup:

```text
Read https://github.com/Namdev90/quiz-show-kit/blob/main/prompts/START.md and apply QSK1 preset=competition theme=midnight. Make my next quiz; ask only for missing details.
```

For a customized setup, provide the actual settings attachment and this ready-to-copy prompt:

```text
Read https://github.com/Namdev90/quiz-show-kit/blob/main/prompts/START.md. Apply QSK1 preset=custom theme=custom with my attached Quiz_Settings.json. Make my next quiz; keep my settings and ask only for missing details.
```

Tell the teacher to attach the supplied settings file next time. Do not claim automatic application across unrelated chats, accounts or assistants when the key/file has not been provided. When it is supplied and readable, apply it automatically without re-interviewing the teacher about settled preferences.

Provide a full configuration backup as well as the settings file. The full backup can preserve exact wording, assets and event identity when requested; the settings file is a clean starting setup for a new quiz. Never publish either file to a public repository by default. Record the source revision used so future version-dependent changes can be assessed honestly.
