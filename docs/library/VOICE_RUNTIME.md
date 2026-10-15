# Voice in the offline quiz

Use **Settings → Sound and narration** to choose the installed voice, language and speed. **Test voice** reads a neutral sentence so the host can check pronunciation. Voice choices depend on the presentation computer; they are not bundled TTS models. Only voices marked local by the browser are offered. Keep the speaker volume comfortable and rehearse subject-specific names.

| Choice | What participants hear | When it runs |
| --- | --- | --- |
| Smart | The actual answer text for a one-word option; A–D for a phrase. An embedded option recording takes priority. | Hover, keyboard focus or selection after all choices become available. |
| Full option text | The actual option text, or its embedded recording. | Hover, keyboard focus or selection. |
| Letters | The existing A–D clips. | Hover, keyboard focus or selection. |
| Read aloud | The visible question stem, or its embedded recording. | Untimed question-reading phase, before choices. |
| Read question automatically | Reads each newly displayed question stem. | Same untimed reading phase; off by default. |
| Custom recording | Your own recording or reviewed model-generated audio. | Replaces the mapped stem/option narration. |

The question stem is never combined with its hidden options, answer key or explanation for automatic speech. **Show choices + start** stops question narration and retains the configured reveal/answer timing. Options do not autoplay in a four-clip queue while the answer clock runs. Reading a hovered option does not stop or extend the clock. Long option wording should be revised or rehearsed at an appropriate answer duration.

A new utterance replaces the current one. Stop reading, pause, consultation, timeout, a different phase/question, mute, hidden page and leaving the page cancel narration. Settings pause live play. Voice controls are unavailable when sound is disabled or volume is zero; local voice settings require an installed local voice. If local TTS is unavailable or the language cannot be matched, option cues fall back to the bundled letter clips. A prepared recording works without a browser TTS voice.

## Configuration

```json
{
  "presentation": {
    "sound": true,
    "volume": 65,
    "spokenOptions": true,
    "optionSpeech": "smart",
    "readQuestions": false,
    "voiceName": "",
    "voiceLang": "en-IN",
    "speechRate": 0.95
  }
}
```

`voiceName` is an installed voice name, not an API model ID. Empty selects a matching local voice automatically. `voiceLang` accepts a language tag such as `en-IN`, `en-GB`, `hi-IN` or a custom valid tag. Select an installed voice when the automatic language match is unavailable. The chosen voice's language is used for synthesis. Speed is 0.5–2; start around 0.9–1.0 for technical terms. These settings persist in this browser and in **Save resume copy**. A saved voice name absent on another machine falls back to a local voice matching the configured language, or to available embedded clips.

## Add your recorded voice or prepared model audio

1. Record clean, separate files for the question stem and each required option, or have an authorised TTS service generate them before building. Use your own voice or a voice you have permission to use. Do not include the correct answer or explanation in a stem/option clip.
2. Give the assistant those files and tell it which question/option each file belongs to. The assistant maps them to assets and checks their content, permissions, pronunciation and duration. This toolkit does not record a microphone or clone a person's voice.
3. Store MP3, WAV or OGG files inside the event configuration folder, or use supported base64 data URIs. The normal size, path-containment and MIME validation applies. No API keys or live provider calls go into the exported HTML.
4. Build and rehearse the exported file offline on the presentation computer. Recordings use the embedded audio bus and obey sound/mute controls. Browser TTS is a separate operating-system service and may be absent from screen recordings; use embedded narration when the recording must include the voice.

Example fragments, merged into a complete configuration:

```json
{
  "assets": {
    "q01StemVoice": {"file": "audio/q01-stem.mp3", "attribution": "Recorded by the teacher with permission"},
    "q01OptionAVoice": {"file": "audio/q01-a.mp3", "attribution": "Recorded by the teacher with permission"}
  },
  "questions": [{
    "id": "Q01",
    "narration": {
      "stem": "q01StemVoice",
      "options": ["q01OptionAVoice", null, null, null]
    }
  }]
}
```

The `questions` fragment is not a complete question bank. Preserve every required question field. `narration.options`, when present, contains exactly four asset keys or null entries in A–D order. An existing asset key must refer to audio; image files, remote audio URLs and missing references are rejected. Sparse recordings are supported: unmapped options use the selected browser speech/letter behavior. Explicit **Letters** mode uses letter clips even when option recordings exist. Stem recordings remain available through **Read aloud**.

For authoring-time provider/model choices, read [TTS models and presets](TTS_MODELS.md). For broader event choices, return to the [teacher workflow](../TEACHER_PROMPT.md).

## Evidence and limits

Automated tests simulate browser speech and audio, exercising word/phrase modes, recording priority, hidden-choice protection, timer cancellation, mute, persistence and fallback. They do not establish real voice quality, speaker loudness, browser compatibility on every device or technical-term pronunciation. Physical rehearsal remains necessary.

Browser API references: [local voice flag](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService), [voice-list changes](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event), [speech and cancellation API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis). Checked 15 October 2026.
