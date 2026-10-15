# Reuse an asset before making one

[Searchable catalog](catalog.json) · [Directory map](../docs/library/DIRECTORY_MAP.md) · [Voice and media workflow](../docs/library/ASSETS_AND_VOICE.md)

| Laboratory | Chemistry | Biology | Timing |
| :---: | :---: | :---: | :---: |
| ![Microscope icon](icons/lucide/microscope.svg) | ![Flask icon](icons/lucide/flask-conical.svg) | ![DNA icon](icons/lucide/dna.svg) | ![Timer icon](icons/lucide/timer.svg) |
| `lucide-microscope` | `lucide-flask-conical` | `lucide-dna` | `lucide-timer` |

| Sound | Awards | Learning | Pictures |
| :---: | :---: | :---: | :---: |
| ![Volume icon](icons/lucide/volume-2.svg) | ![Trophy icon](icons/lucide/trophy.svg) | ![Book icon](icons/lucide/book-open.svg) | ![Image icon](icons/lucide/image.svg) |
| `lucide-volume-2` | `lucide-trophy` | `lucide-book-open` | `lucide-image` |

These eight small Lucide files are exact upstream SVGs under ISC, with the [complete upstream license](LICENSES/lucide-LICENSE). They are decorative/interface icons, not accurate scientific figures. Keep informative labels beside controls. In image embedding, their original `currentColor` normally renders black; use a suitable light background and inspect the actual result. Any deliberate recoloring is a derivative: record it and validate again.

## Know what can be reused

| Shelf | Files | Permission status |
| --- | ---: | --- |
| Lucide icons | 8 | Reusable with the full license notice |
| Coin and selection effects | 5 | CC0; existing creator/source records retained |
| Spoken A–D letters | 4 | Original BioVista example only; no general voice/recording license granted |
| Event and identification marks | 4 | Permission/policy review required; not covered by the code license |
| Supplied Chota Namu character | 2 | Project-specific user authorization; unrelated reuse requires permission |

See [third-party notices](../THIRD_PARTY_NOTICES.md) and [example notices](../examples/biovista/ASSET_NOTICES.md). A public file is not permission to use a trademark, someone's likeness, or a voice. Open-source software licenses do not establish rights to model weights, generated output, or voice recordings.

The current compiler also includes the four original A–D fallback clips from `src/shared-assets.json` unless they are overridden. Selecting only reusable catalog entries, omitting those asset keys, or muting the quiz does **not** remove the recordings from its HTML. For a new distribution without permission to reuse them, replace **all four** `optionA`–`optionD` keys with authorized clips before building, or implement and verify a build that omits them. Do not treat a catalog filter as a media-removal mechanism.

## Find, select, embed

1. Search catalog metadata for the intended meaning and permitted reuse. Inspect only matching files. Prefer an existing suitable sound/image or built-in diagram, then an approved premade source; generate only to fill a real gap.
2. Confirm the image fits the question and write context-appropriate alternative text. An icon must not stand in for a scientific structure or experimental result. Keep image and alternative text equally informative without accidental answer cues.
3. Copy the selected file into the private event's configuration directory, or embed it with existing file tools. Use [the supported asset fields](../docs/CONFIGURATION.md#images-logos-and-audio). Relative paths cannot escape that directory. There are no runtime downloads.
4. Copy the catalog's provenance and license ID into the asset metadata. Read `license.noticePath` and place its **complete text** in `assets[key].licenseText`; the compiler preserves this metadata in the offline HTML. A pathname alone does not carry the license into a standalone quiz. Include notices with any separately distributed assets too.
5. Run the existing validator/build, then inspect image legibility and audition audio. No new generator, dependency, model download, API key, or synthesis is needed to use this shelf.

For an assistant with `jq`, this lists reusable audio/icon IDs and paths without loading media bytes:

```sh
jq -r '.assets[] | select(.reuse.scope == "reusable") | [.id, .type, .path] | @tsv' assets/catalog.json
```

Use an available JSON/file tool if `jq` is absent; do not require the teacher to install it. The catalog contains no base64. **Do not read `src/shared-assets.json`, compiled HTML, or image/audio binaries into the conversation to browse the collection.**

## Add only useful, approved files

The catalog uses repository-root paths and records `id`, `type`, `mimeType`, `tags`, `alt`, `license`, `reuse`, `provenance`, `sha256`, and `bytes`. IDs are stable and unique. Every entry points to an actual local file and a local notice. New upstream assets should pin a source revision or retain a stable download URL and checksum; describe modifications. Existing provenance dates remain historical, not newly verified claims.

Store approved reusable media in this repository, with notices under `assets/LICENSES/`. Add only selected files, not a complete stock library or model checkpoint. Record private teacher uploads and voice clips in the private event package; publish them here only with explicit authorization and suitable rights. See the [directory map](../docs/library/DIRECTORY_MAP.md) for current locations and where future media belongs.

## Supplied Chota Namu character

The [unchanged PNG](characters/chota-namu.png) is the optional static runtime choice. The [original GIF](characters/chota-namu-idle.gif) is preserved as an animation/reference source with its original caption and background; GIF is not a supported runtime import in this version. Neither file is automatically added to generic quizzes or the shared asset bundle. Select the PNG explicitly through `branding.character` and include the [complete project-use notice](characters/NOTICE.md) in its asset `licenseText`. The [provenance record](characters/PROVENANCE.json) identifies supplied filenames, dates, sizes and hashes without claiming an independent general artwork license.
