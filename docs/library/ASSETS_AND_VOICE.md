# Assets and a clear reading voice

The repository is a reusable asset and workflow library. Reuse only compatible media with appropriate rights; a file's presence is not permission to use its trademark or voice in every new event.

| Need | Existing starting place | Adaptation |
| --- | --- | --- |
| Scientific diagrams | `examples/biovista/questions.json` and the source diagram rendering | Reuse supported diagrams only when accurate for the new stem; author exact new diagrams as static assets |
| Logos or event artwork | Teacher-approved uploads | Embed accepted files with meaningful alternative text; text-only branding is valid |
| Coin/selection accents | `assets/audio/`, `src/shared-assets.json`, `THIRD_PARTY_NOTICES.md` | Keep provenance and license notices; replace or silence freely within supported settings |
| Original spoken letters | `assets/audio/optionA.wav` through `optionD.wav` | Retain provenance; do not treat them as a new user's own recordings |
| Question/option narration | Approved recorded clips, supported local speech, or pre-generated TTS | Link narration to the exact current stem/option text and inspect timing |

Use the current [voice runtime contract](VOICE_RUNTIME.md) for exact fields, narration behavior and cancellation/timing safeguards. The source configuration is authoritative if documentation and implementation disagree.

## Voice choices, always with Custom

Offer **smart option reading**, **full option reading**, **letter cues**, **recorded voice**, **silent**, or **Custom**, as supported by the current runtime. In smart mode, a one-word option should be spoken as that word instead of announcing A/B/C/D. Describe the actual fallback for longer options from the runtime contract. Do not guess pronunciation from a letter label or reveal which option is correct.

Use only voices the runtime verifies as local when local speech is available. Let the teacher choose language/accent and a comfortable rate after hearing a real sample where possible. A saved voice name is a preference, not proof that the same voice exists on another device. Do not promise consistent quality or offline availability of every system voice; verify on the event machine, or embed approved audio clips for predictable offline playback.

For a clearer synthesized voice, use an available speech-generation tool **before the event**, export the approved clips and embed them. Read current official documentation before naming or recommending a provider/model, and verify language support, output format, licensing, access and any cost. Never embed API keys or call a cloud speech service during offline play. This workflow does not require the teacher to obtain an API key; choose an available authorized tool or another supported route.

The teacher can **record their own voice** in an available recorder and upload clips. The assistant can incorporate supplied recordings; it must not claim to have recorded its own human voice or the teacher's voice. Do not substitute a screen recording for microphone capture. A dedicated in-quiz microphone recorder or a provider-specific voice-cloning feature requires separate implementation and consent; do not list it as already present.

For foreign terms, scientific names or acronyms, audition actual pronunciation. Keep a pronunciation note in the working brief and re-record/re-generate incorrect clips. Do not claim speech quality was checked merely because the file parses.

## Protect the quiz flow

Associate stem audio and each option clip with the current question content. An edit to wording invalidates its old narration until rechecked. Narration must not overlap itself, continue into another card, give away hidden options, survive a sound-off command, or continue after pause/undo/recovery in a way that contradicts the screen. Use the runtime's supported cancellation and timing behavior; if the desired flow is absent, implement and test it before promising it.

Check long option reading and clip lengths against reveal/answer timing. Do not silently shorten speech or take a team's response time to satisfy decorative timing. If a clip needs more time, show the proposed timing change, choose a supported narration mode or implement a tested scheduling change. Respect the teacher's selected silent mode and device reduced-motion preference.

Accepted asset types and size limits are in [Configuration](../CONFIGURATION.md). Keep every playable file embedded; no remote runtime media. Never fabricate base64, inject HTML/scripts into labels, or bypass path/SVG validation. Keep personal recordings, private reports and unapproved logos out of public commits and PRs.
