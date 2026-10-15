# Find the right shelf

**Search metadata → inspect a matching source → reuse the selected item.** Read only the files needed for the current phase; retain paths/IDs in the working brief instead of repeatedly pasting their full contents.

| Need | Existing location | What to retrieve |
| --- | --- | --- |
| Start a run | [`prompts/START.md`](../../prompts/START.md) | Short public launch protocol |
| Workflow modules | [Library index](README.md) | The module for the current task |
| Reuse media | [`assets/catalog.json`](../../assets/catalog.json) | Filter by tags, type and `reuse.scope`; no base64 |
| Browse icons visually | [Asset shelf](../../assets/README.md) | Eight local Lucide SVGs and their stable IDs |
| UI/reward audio | [`assets/audio/`](../../assets/audio/) | Five CC0 effects; distinguish four restricted example letter clips |
| Existing marks | [`assets/images/`](../../assets/images/) | Reference/event branding; check permission before reuse |
| Actual Chota Namu | [`assets/characters/`](../../assets/characters/) | User-supplied static PNG, GIF reference and project-specific authorization/provenance; not a general artwork license |
| Media permissions | [`assets/LICENSES/`](../../assets/LICENSES/) and [third-party notices](../../THIRD_PARTY_NOTICES.md) | Complete notices and source provenance |
| Built-in question diagrams | [`src/ui.js`](../../src/ui.js), `visual()` | Existing keys: `microscope`, `pipette`, `dna`, `ph`, `biohazard`; confirm exact meaning and accessibility |
| Current feature showcase | [`examples/biovista/README.md`](../../examples/biovista/README.md), [`biovista.showcase.config.json`](../../biovista.showcase.config.json) | Current runtime/settings and matching DOCX/quality companions; only the demo has the added independent review metadata |
| Historical question examples and sources | [`examples/biovista/original/questions.json`](../../examples/biovista/original/questions.json) | Preserved original cards/source dates; not freshly verified by rebuilding |
| DOCX editing and recovery | [Bank workflow](QUESTION_BANK.md), [`scripts/question-bank.cjs`](../../scripts/question-bank.cjs) | Exported template, matching configuration, preview/apply/rollback commands |
| Presets and custom choices | [Presets](PRESETS.md), [`src/presets.js`](../../src/presets.js) | A matching starting configuration |
| Narration routes | [Assets and voice](ASSETS_AND_VOICE.md), [voice choices](TTS_MODELS.md) | Existing recordings/local speech before new generation |
| Reusable packages | [`vendor/manifest.json`](../../vendor/manifest.json), [`package.json`](../../package.json) | Versions, purpose and license paths; use the existing implementation |
| Build or verify | [`scripts/`](../../scripts/), [`tests/`](../../tests/) | Relevant existing command/check |
| Rebuild the public example | [`scripts/build-example.cjs`](../../scripts/build-example.cjs), [`requirements-authoring.txt`](../../requirements-authoring.txt) | `--authoring` regenerates the matching DOCX; the launcher build refreshes dormant local mirrors; GitHub release downloads are the public route |
| Prepare a versioned release | [`release.json`](../../release.json), [release instructions](../GITHUB_SETUP.md#stable-release) | Version/notes and `npm run build:release`; identified source kit, playable files, companions and hashes |
| Save a setup for next time | [Reuse protocol](REUSE_PROTOCOL.md) | Compact prompt plus supplied settings attachment |

Built-in drawings are schematics tied to the original questions: the DNA key is a ladder-style sketch, the pH drawing contains fixed values, and the biohazard mark uses a system glyph. Inspect before reuse; do not describe any of them as a newly validated scientific illustration. The bundled Lucide icons are a separate decorative shelf.

## Where a new file belongs

| New material | Destination and rule |
| --- | --- |
| Approved reusable icon | `assets/icons/<source>/`; keep upstream license, revision and hashes |
| Approved scientific diagram | Create `assets/diagrams/<topic>/` only when needed; static SVG/PNG/WebP with source and alt text |
| Approved generic photo/image | `assets/images/<topic>/`; chosen files with clear reuse terms |
| Approved generic sound | `assets/audio/<source>/`; sound, voice and model rights checked separately |
| Permission/license notice | `assets/LICENSES/`; link it from the catalog |
| Reusable workflow instruction | `docs/library/`; link from the library index rather than duplicating it in prompts |
| Private notes, event logos or personal recordings | A private event package outside tracked repository content; public inclusion requires explicit authorization |
| Model weights, caches, generated previews, build output | Appropriate local cache/private build directory; do not add large model repositories to the asset shelf |

These are placement conventions, not claims that every suggested subdirectory already exists. The finished quiz embeds its selected assets and works offline. Public reusable assets live in GitHub; private event inputs stay in their private package.

## When the local shelf has no fit

Use available connectors and specialist tools to locate a suitable original source before writing a replacement: an icon project's source directory and license, a creator's sound collection, an institutional media collection with explicit reuse terms, or a model repository's model card and license. Prefer official/creator sources, and check **each file's** rights and scientific relevance. A search result or an image-generation library is not itself a licensed asset.

For the existing collection, the catalog links the verified Lucide source revision and the historically recorded Kenney/StarNinjas source pages. Use those identifiers instead of searching for the same assets again. Retrieve a new generator/model only when approved premade assets and existing capabilities cannot meet the brief; keep any accepted reusable output local with provenance and actual verification status.
