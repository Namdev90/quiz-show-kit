# Existing asset and dependency review

Review date: 15 October 2026, with the subsequent user-supplied Chota Namu artwork recorded below. Scope: checked-in files, notices, provenance records and SHA-256 consistency, plus the official GSAP terms checked during implementation. This review does not claim that all historical media source pages or original creators' rights were independently reverified today. Existing suitable local components are retained. No new dependency/model was adopted; existing locked development dependencies were restored with `npm ci --ignore-scripts` for checks. The supplied character files are the user's actual files, not newly generated replacements.

## Reusable components

| Component | Recorded version/license | Local evidence and use |
| --- | --- | --- |
| GSAP | 3.15.0; Standard No Charge license | Manifest hash matches `vendor/gsap.min.js`; header and license-reference file retained. Existing animation use; not MIT and not a blanket unrestricted-use grant. |
| canvas-confetti | 1.9.4; ISC | Manifest hash matches bundled file; full local license. Existing celebrations. |
| howler.js | 2.2.4; MIT | Manifest hash matches bundled file; full local license. Existing local audio. |
| three.js | 0.186.1; MIT | Manifest hash matches bundled file; full local license. Existing decorative DNA rendering with fallback. |
| Eight Lucide icons | Pinned upstream commit `d672fc43dbf60962d9d829e35bc3b3e5ed89a178`; ISC | Actual SVG files, full upstream ISC/Feather notice, source hashes and reuse metadata in catalog. UI icons do not substitute for scientific evidence. |
| Five coin/selection effects | Recorded CC0 1.0 provenance | StarNinjas coin and Kenney selection accents; local WAV files, original identifiers/hashes and notices. Physical room audition is separate. |
| Project code and original generated cues | MIT | Root license retained. A software license does not cover third-party marks or recordings. |
| python-docx | 1.2.0; MIT | Existing installed authoring tool reused for DOCX export; not embedded in the offline quiz. Import uses bounded Python standard-library ZIP/XML parsing. |
| lxml / typing_extensions | 6.1.1 BSD-3-Clause / 4.16.0 PSF-2.0 | Existing python-docx authoring dependencies; installed metadata checked. Pinned with python-docx in `requirements-authoring.txt`, not embedded in offline gameplay. |

The manifest records historical source/integrity verification dates. The four current vendored hashes were checked against it during this review. Local embedding avoids live runtime CDNs; it does not establish present maintenance status or permission for materially different uses. Any dependency upgrade or new product use needs its own review. The [official GSAP Standard License](https://gsap.com/community/standard-license/) was checked during implementation (effective 30 April 2025; last modified 30 May 2025): it supports the existing web-interface use while retaining restrictions including competing no-code animation builders. GSAP has a local license **reference**, rather than a complete offline copy of those web terms; its header/reference are retained. No new animation library is needed for the retained two-team coin toss.

## Permission and input gaps

| Item | Established record | Required action before broader reuse |
| --- | --- | --- |
| Parul University Goa/PCAHS mark | `assets/images/parul-goa-pcahs-transparent.png`; 1,015,602 bytes; SHA-256 `5e5bf13cdf6ed02938e757a16ee392b6a1c09f364dc5e42ab7f3d50d886db4d1`. Catalog describes a user-approved transparent derivative, recorded 13 October 2026, sourced from [the supplied image](https://photos.app.goo.gl/Yk97qKBB3LGtPA6i9). | Confirm that this exact file is authorized for the intended event/distribution. Catalog scope remains `permission-required`; do not infer general university endorsement. Request the correct approved file if this is not it. |
| Actual Chota Namu character | Namdev Shirodkar supplied the PNG and idle GIF on 15 October 2026 with instructions to use them in this project and publish the repository update. Unchanged files: `assets/characters/chota-namu.png` (572×1281 RGBA; 811,281 bytes) and `assets/characters/chota-namu-idle.gif` (384×256; 73 frames; 694,219 bytes). | Project-specific use/publication authorization is recorded. It is not an unrelated-use or general redistribution grant, MIT relicensing, or independent verification of original authorship/third-party rights. Static PNG is the optional runtime artwork; GIF is retained as supplied reference, not played in the quiz. No substitute likeness or gaze animation was created. |
| BioVista mark | Organiser-approved event artwork; source and transparency-edit history in catalog. | Event-specific permission is not general reuse. Preserve the example; use approved event branding elsewhere. |
| Python and OpenAI marks | Official source records and trademark notices exist. | Follow applicable brand policy/permission; software licenses do not grant trademark rights. |
| `optionA`–`optionD` speech clips | Original BioVista recordings produced with installed Microsoft Zira; `example-only`. | No general redistribution grant is recorded. For another distribution, replace all four with authorized recordings or use a separately tested build that omits them. Muting/omitting asset keys alone does not remove shared fallback audio. |
| Teacher question banks, notes, recordings | Not automatically public or licensed for repository distribution. | Keep private; obtain specific publication permission. Copying a source citation does not license its full article/image. |

The original event and existing files are preserved. The generic toolkit must not present every teacher's output as an official university product. Keep Namdev Shirodkar's creator credit and special curation for Parul University Goa in entry/About/settings, not winner/results. The actual character is opt-in through `branding.character`, with a visibility control; configurations without that reference remain unbranded by the character. The later push instruction does not broaden the logo, trademark, voice-recording or private-question-bank permissions described above.

The supplied character's full SHA-256 values and original filenames are recorded in [its provenance](../assets/characters/PROVENANCE.json); preserve the [project-use notice](../assets/characters/NOTICE.md) with authorized project distributions. Catalog IDs are `chotaNamu` for the PNG and `chotaNamuIdleSource` for the GIF reference. Neither file was resized, cropped, recolored or recompressed.

## Distribution checklist for selected assets

Keep the actual file, author/source URL, license/version, attribution and modification notes in the event package. Preserve complete required notices, including in standalone HTML when a separate file would not travel with it. Where an asset requires visible attribution, an optional downloaded credits report alone is insufficient. Review the host credits download against the assets actually embedded. Do not include private paths, tokens or personal recording metadata in a public report.

References: [catalog](../assets/catalog.json), [asset shelf](../assets/README.md), [vendor manifest](../vendor/manifest.json), [third-party notices](../THIRD_PARTY_NOTICES.md), [BioVista notices](../examples/biovista/ASSET_NOTICES.md).
