# Choose a clear quiz voice

**Five starting presets + Custom.** Choose by the audience's language, pronunciation and the event laptop. Every choice can be changed. Sources checked **15 October 2026**; model availability and provider terms must be checked again before generating audio.

| Preset | Choose this when… | Model / voice starting point | How it reaches the quiz |
| --- | --- | --- | --- |
| **1 · Local classroom** | You want no cloud generation and quick setup | An installed browser voice matching the audience, preferably `en-IN` for Indian English | Live local TTS; only voices reported as `localService: true` are offered. Test on the actual laptop. |
| **2 · My recorded voice** | Your own pronunciation and delivery matter most | Your own human recording; no model required | Record with a phone or recorder, provide separate stem/option clips, then embed them before building. |
| **3 · OpenAI clear narrator** | You want to direct tone and pace in plain language | `gpt-4o-mini-tts`; audition `marin` and `cedar` | Generate MP3/WAV through an available authorized authoring tool, review, then embed. |
| **4 · Google Indian English** | You want a documented Indian English voice | Chirp 3: HD; audition `en-IN-Chirp3-HD-Kore` and `en-IN-Chirp3-HD-Charon` | Generate MP3 through Google Cloud Text-to-Speech during preparation, review, then embed. |
| **5 · ElevenLabs narrator** | You want an expressive prerecorded host | `eleven_v4`; select an available stock voice after auditioning | Generate/download audio during preparation, review, then embed. Keep answer delivery neutral. |
| **Custom** | You want another language, voice, model, recorded speaker or mixed approach | Describe the desired result; verify the provider/model first | Use compatible local speech or approved audio files. Offer host reading or sound off when voice is unnecessary. |

These are **authoring choices**, not five cloud engines built into the exported quiz. The event file has no provider keys, cloud synthesis calls or microphone recorder. The preparing assistant may generate clips only if the current tools and account permit it; otherwise it prepares the script and accepts your finished audio. Do not claim an audio file exists until it has actually been generated or supplied.

## What the provider documentation establishes

| Provider | Verified capability | Limit that affects this kit |
| --- | --- | --- |
| [OpenAI speech guide](https://developers.openai.com/api/docs/guides/text-to-speech) | `gpt-4o-mini-tts` accepts instructions for tone, accent and speed. OpenAI recommends `marin` or `cedar` for quality; voices are optimized for English. MP3 and WAV outputs are supported. | Audition subject terminology. Clearly disclose AI-generated narration to listeners, as required by OpenAI; do not label it as a human recording. |
| [Google Chirp 3: HD](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd) and [voice catalog](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types) | The two exact `en-IN` voice names above are listed. MP3 synthesis is documented. The guide documents supported SSML and pace/pronunciation controls. | Some voice-control features are marked Preview and vary by locale; inspect current support before relying on them. A desired accent does not guarantee correct scientific pronunciation. |
| [ElevenLabs model catalog](https://elevenlabs.io/docs/overview/models) | `eleven_v4` is listed for expressive, high-quality output with a 10,000-character request limit. `eleven_multilingual_v2` is also listed as a quality option, usable under Custom. | Voice availability and generation access depend on the account. Model names are not voice IDs. Audition a real available voice and keep its identifier in provenance. |
| [Web Speech API specification](https://webaudio.github.io/web-speech-api/#dom-speechsynthesisvoice-localservice) | Browser voice metadata distinguishes local from remote synthesis services. | Local voice names and availability depend on device/browser; a saved name is not a portable voice installation. Rehearse offline on the destination device. |

The choices above are starting recommendations for this toolkit, not a measured ranking. No provider audio was generated or acoustically benchmarked for this catalog. Check current access, cost and output-use terms for cloud generation; the repository does not include a paid voice subscription.

## Prepare narration that keeps the quiz fair

1. **Audition before generating everything.** Use a short passage containing subject vocabulary, abbreviations, numbers and units. Let the teacher hear it and correct pronunciation.
2. **Use a consistent script.** Read exactly the visible stem or option, without hints, commentary, correctness labels or different emphasis on the correct choice. Keep answer explanations separate from question narration.
3. **Announce the word.** Smart mode says a one-word option such as “Mitochondria” rather than “Option B”; Full mode reads longer option text. Embedded option recordings take priority in these modes. See [runtime behavior](VOICE_RUNTIME.md) for exact triggers and fallbacks.
4. **Keep the timer independent.** Read the stem before choices open; showing choices stops stem narration. Do not make a cloud request or wait for speech completion to decide a score, timeout or transition.
5. **Embed and rehearse.** Supply supported MP3/WAV/OGG files, trim accidental silence, check consistent levels, and listen through the real speakers. Follow configuration asset limits; do not rename an unsupported format to pretend it is supported.

Suggested delivery instruction for providers that accept style instructions:

> Read the supplied quiz text clearly at a measured classroom pace. Use neutral emphasis and consistent delivery for every option. Preserve the wording and numbers. Do not add introductions, hints, answers or commentary. Follow the approved pronunciation list.

## Personal recordings, provenance and offline playback

Record your own voice or use a recording the speaker has allowed you to use. This preset plays the supplied recording; it does not clone a voice, and the assistant does not have a personal human voice to record. Keep private raw recordings out of public commits.

For each generated clip, keep the script, provider, model, voice identifier, generation date, source/rights notes and pronunciation review with the event's assets. Cloud synthesis sends its input to that provider during preparation; embedded playback is local afterwards. A provider's ability to create custom voices is not permission to imitate a person.

Browser TTS may be absent from the quiz's captured audio mix. Use embedded prerecorded clips when narration must be included in a screen recording, and verify the actual recording. Local TTS remains a convenient optional fallback; host reading is always available.
