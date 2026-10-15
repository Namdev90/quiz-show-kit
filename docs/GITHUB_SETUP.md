# GitHub setup and release checklist

These are maintainer instructions for `Namdev90/quiz-show-kit`. They describe settings to verify; the presence of this file does not prove that a setting, deployment, or release has succeeded.

## Repository

Use the public repository with `main` as its default branch. If the repository already exists, clone and inspect it; preserve its history and existing work. Keep the root README, MIT license, `.gitignore`, source, tests, documentation and both BioVista paths: the current regenerable showcase in `examples/biovista/`, and its preserved historical archive in `examples/biovista/original/`. Do not replace that historical provenance with a neutral demo.

In **Settings → General**, enable **Template repository**. GitHub requires repository administrator access for this setting. A template generates a new repository from the selected contents; it is different from a fork. GitHub also notes that template repositories cannot contain Git LFS files. [GitHub: creating a template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)

Do not commit personal event reports, resume copies, screen recordings, tokens, private filesystem paths, or unapproved branding. Keep generated working outputs ignored unless a specific release/example output is intentionally tracked. Retain the approved BioVista example and its asset notices.

## Checks and permissions

Run the repository's validation, tests and build before pushing. Follow the contributor environment setup in [README](../README.md): the full suite includes DOCX authoring tests and needs the pinned Python environment from `requirements-authoring.txt`, selected with `QSK_PYTHON`. An ordinary HTML build/play does not need Python. Configure CI for pull requests and pushes to `main`, using GitHub-hosted runners and only the permissions needed for those jobs. Ordinary test/build jobs should have `contents: read` and no deployment secrets.

Reference actions by reviewed, full commit SHA; keep an adjacent version comment for maintainability. Verify each SHA belongs to the intended upstream action repository before updating it. Review action changes as code. GitHub's current guidance also describes dependency lockfiles, which maintainers may adopt separately. [GitHub: secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)

Avoid running untrusted pull-request code with privileged `pull_request_target` credentials. Where repository settings permit, require the checks and a review for changes to `main`; keep release/deployment decisions separate from an untrusted contributor's test job.

## Repository-only delivery

The repository and its release downloads are the public destination. **Keep GitHub Pages disabled and the repository About website empty.** On 15 October 2026 the confirmed quiz Pages configuration was preserved and unpublished; both former launcher and showcase endpoints returned HTTP 404. Source and historical deployment records were preserved. No unrelated provider sites were changed.

Copy the prompt from README or open `index.html` locally from the source ZIP. The exact **Try the BioVista Feature Showcase Quiz** CTA downloads `BioVista_Quiz_Public_Example.html` from the matching GitHub release. It must not open a hosted preview. The receiving authoring workflow starts with Teacher mode versus Competition mode unless explicitly restored.

`npm run build:launcher` maintains `index.html`, the dormant `docs/index.html` mirror and matching companion files in both checked-in paths. These are preserved repository files, not a deployment instruction. Do not enable Pages, create substitute hosting or restore the retired maker. Playing the generated quiz needs no server, API key or account.

## Stable release

The release source of truth is [`release.json`](../release.json): version, release name and the path to its notes. Keep its version consistent with `package.json` and `package-lock.json`, and record changes in [CHANGELOG](../CHANGELOG.md). Packaging and publication share a stable-only version policy: numeric `X.Y.Z` with no leading zeros, prerelease suffix, build metadata or whitespace. Do not infer the current release from an unchanged source file's date.

1. Prepare a new version and its notes with the user's publication authorization. Describe the current prompt-based workflow, changes and remaining Windows/macOS/browser/hardware limits. Do not rewrite old release dates, tags or historical QA to make older snapshots look current.
2. If showcase content/configuration changed, regenerate its companions with `npm run build:example -- --authoring`. Run `npm run check` to refresh and validate launchers and checked-in mirrors. Keep the preserved archive unchanged. Verify the fixed Apex HTML, DOCX metadata/configuration fingerprint, reusable unlocked settings and read-only quality review agree.
3. Check that tracked source configuration, question sources, applicable licenses/notices and the intended public example may all be published, with no private workspace paths, unapproved event inputs or resume files. The release ZIP includes **all tracked files**. Record inherited content-review gaps without claiming the build independently fact-checked them.
4. Commit the reviewed release changes using the authorized repository workflow. From that clean, identified checkout, run `npm run build:release`. It checks manifest/package/lockfile version agreement and writes `dist/release/`: a full source-kit ZIP under `quiz-show-kit/`, standalone current HTML, matching DOCX/settings/quality companions, handoff instructions, `Quiz_Show_Kit_Release_Manifest.json` with the exact source commit/tree and artifact hashes, and `Quiz_Show_Kit_SHA256SUMS.txt`. The pack is generated by `scripts/build-release.cjs`; it does not publish by itself or overwrite an existing nonempty output directory. For another local pack, use `npm run build:release -- --output path/to/new-empty-directory`.
5. The release workflow runs when `release.json` changes on `main`, or by manual workflow dispatch on `main` in this repository. Its read-only verification job runs the checks, builds the pack and requires a clean tree. Only the separate publication job receives `contents: write`; it creates the new stable version from the checked source SHA using the repository's `GITHUB_TOKEN`. No separate personal access token or interactive login is required. Existing tags/releases are not overwritten. A normal source commit does not create a release unless that explicit release trigger applies.
6. Open [latest stable release](https://github.com/Namdev90/quiz-show-kit/releases/latest) and download its assets as a user would. Verify their hashes against the manifest/checksum file, the intended tag/source revision, offline launch and companion files. A source archive and a ready-to-play HTML serve different needs; label them clearly. Only then describe that release route as current.

### Retrying interrupted publication

Retry the failed workflow run at its **original source SHA**. A newer commit is a different package even if the version is unchanged. The publisher reuses an exact-source tag and resumes only a draft whose repository/tag/source commit/tree/manifest marker and release metadata match exactly. It downloads and verifies existing completed assets, then uploads missing ones. A same-source completed release is verified without modification. Published or mismatched files are never overwritten, and a newer stable release prevents an older draft retry from replacing Latest.

GitHub can leave an empty `starter` after a failed upload. Only an expected zero-byte starter in the matching owned draft, unchanged for at least two minutes and rechecked by numeric asset ID, may be removed and uploaded again. A recent or changed starter stops the attempt; retry later at the same workflow SHA. Other mismatches require investigation, not automatic deletion. Authentication and network errors stop the attempt without creating substitute versions or overwriting history.

Review repository visibility, template status, default branch, CI results, Pages status, and release downloads independently. A successful file build does not establish any of the other statuses.

A branch commit, a Pages deployment and a published release are separate outputs; changing `main` does not update an old release attachment. Preserve historical releases as snapshots. New releases should package the current prompt-led workflow, not reuse the retired browser-builder download.

Older dates on unchanged source files, archived originals, source-verification records or historical releases are expected. They identify real history, not a requirement to edit every file. Correct active guidance or regenerate affected artifacts when behavior changes; preserve historical evidence and its limits. Current implementation instructions belong in START/configuration/library guides, while dated QA reports describe only the revision and environment actually tested.
