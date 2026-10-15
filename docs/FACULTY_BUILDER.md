# Faculty workflow

The website builder has been retired. The existing site now provides the single launch prompt:

```text
Read https://github.com/Namdev90/quiz-show-kit/blob/main/prompts/START.md and run QSK1.
```

Follow [START.md](../prompts/START.md) for the current workflow and [the library](library/README.md) for presets, research, assets and reuse. Your assistant builds the offline quiz when tools permit. Otherwise transfer the complete configuration/assets handoff to a build-capable assistant as described in [CHATGPT_HANDOFF.md](CHATGPT_HANDOFF.md).

Existing `schemaVersion: 1` configurations remain supported by the compiler. A saved builder work file wraps its configuration under `config`; extract that object, finish any incomplete edits, supply its approved assets, then validate and build it. A questions-only `qskDraftVersion: 1` reply must first be combined with a complete configuration, preserving its settings. Do not treat either wrapper as a directly playable file.

No browser-stored drafts are erased by the launcher. If your only copy remains in an old browser's builder storage, preserve that browser profile and retrieve a backup before clearing it; the launcher does not migrate or inspect it.
