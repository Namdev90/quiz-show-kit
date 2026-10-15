# Media: reuse first, generate only the missing pieces

Read this module only when preparing media. **The finished quiz contains its media; generation is an optional preparation step.** No model download, API key, CDN or generation request belongs in live play.

## Pick the shortest route

| Order | Route | What to do |
| --- | --- | --- |
| 1 | Repository assets | Search the [asset shelf](../../assets/README.md) and [catalog](../../assets/catalog.json) for an accurate, licensed match. Reuse the actual file; check its individual rights record. |
| 2 | Approved uploads | Use the teacher's suitable image or recording. Keep private material private; permission to play it is not permission to publish it on GitHub. |
| 3 | Available specialist tools | Inspect only relevant plugin/tool capabilities. Prefer an existing media, diagram or speech tool with usable file export over building a new generator. |
| 4 | Existing open-source libraries | If a tool is unavailable or unsuitable, use a documented library in an authorized authoring environment. Check dependencies and model/voice licenses separately. |
| 5 | Small missing adapter | Write only the glue that is necessary to export, validate or embed the result. Do not recreate speech engines, image models or audio players. |

Tools may be missing, rate-limited or account-dependent. A listed connector is not proof of access or permission to use paid compute. On failure, use another suitable authorized route or finish a precise handoff; do not repeatedly retry or claim generation succeeded.

## Optional open-source authoring shelf

Primary sources checked **15 October 2026**. These are candidates, **not installed integrations or quality rankings**. Recheck the selected release/model card when using it; pin the version and voice/model revision in the asset record.

| Candidate | Useful for | Code vs. model rights | QSK use |
| --- | --- | --- | --- |
| [Kokoro inference library](https://github.com/hexgrad/kokoro) + [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) | Preparing narration with an open-weight TTS model | Both list Apache-2.0; dependencies and any substituted voice/model have their own terms. | Optional Custom voice route. Audition subject terms, generate WAV files, then embed accepted clips. Check the selected language/voice combination. |
| [Piper](https://github.com/OHF-Voice/piper1-gpl) | Local neural speech synthesis during preparation | Current engine: GPL-3.0. Each voice's [MODEL_CARD](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md) supplies its licensing information; do not assume every voice shares the code license. | Optional Custom voice route. Download the selected voice and its matching config for authoring, then export clips. Do not bundle an entire engine/model tree into the quiz. |
| [Hugging Face Diffusers](https://github.com/huggingface/diffusers) | Decorative image generation when reuse and available image tools are insufficient | Library: Apache-2.0. Selected checkpoints have separate [model cards and license metadata](https://huggingface.co/docs/hub/model-cards). | Optional authoring environment with suitable hardware. Export approved images; never invent scientific evidence, measured plots or required factual labels. |
| [howler.js](https://github.com/goldfire/howler.js) | Playback of finished audio | MIT; the kit's bundled version and notice are in `vendor/manifest.json`. | Already bundled. Reuse existing playback and cancellation behavior; it does not generate speech or music. |

The [five voice presets + Custom](TTS_MODELS.md) remain the teacher-facing choices; Kokoro and Piper are possible **Custom** authoring routes, not extra runtime services. Host reading, approved recordings and verified local browser speech remain valid lightweight choices. An open-weight model is not necessarily a fully open training dataset or training pipeline.

## Keep outputs here, not model warehouses

- Commit reusable, approved image/audio **files**, their provenance and required notices inside this repository. A remote URL or catalog entry alone is not a bundled asset. Reference local paths and let the compiler embed them.
- Keep large weights, caches, virtual environments and whole upstream clones outside Git. Use a pinned, appropriately authorized download only when authoring needs it. Small redistributable support files may be stored locally with their licenses and hashes; never assume model weights fit the offline asset contract.
- For each new file, retain source or generation method, creator/provider, license or permission, upstream version/revision where applicable, modifications and SHA-256. For narration also retain exact script, voice, language and pronunciation-review status. A changed script requires clip review or regeneration.
- Use the [configuration limits](../CONFIGURATION.md): supported static images or WAV/MP3/OGG, currently at most 2 MiB per CLI input file. The overall asset limits still apply. Trim/convert with an existing media tool when appropriate; changing an extension does not convert a file.
- Inspect images for correctness and accessibility; listen to speech for pronunciation, completeness and neutral option emphasis. Build and rehearse offline. A parsed file or generated waveform is not an audition.

Do not add a dependency solely because it exists or ask a teacher to install authoring software. Use one suitable route for the missing output, then stop. Preserve the runtime safeguards in [Assets and voice](ASSETS_AND_VOICE.md) and [Voice runtime](VOICE_RUNTIME.md).
