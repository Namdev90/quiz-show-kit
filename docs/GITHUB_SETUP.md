# GitHub setup and release checklist

These are maintainer instructions for `Namdev90/quiz-show-kit`. They describe settings to verify; the presence of this file does not prove that a setting, deployment, or release has succeeded.

## Repository

Use the public repository with `main` as its default branch. If the repository already exists, clone and inspect it; preserve its history and existing work. Keep the root README, MIT license, `.gitignore`, source, tests, documentation, and the actual BioVista example. The example is part of the kit's provenance, not a neutral replacement demo.

In **Settings → General**, enable **Template repository**. GitHub requires repository administrator access for this setting. A template generates a new repository from the selected contents; it is different from a fork. GitHub also notes that template repositories cannot contain Git LFS files. [GitHub: creating a template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)

Do not commit personal event reports, resume copies, screen recordings, tokens, private filesystem paths, or unapproved branding. Keep generated working outputs ignored unless a specific release/example output is intentionally tracked. Retain the approved BioVista example and its asset notices.

## Checks and permissions

Run the repository's validation, tests, and build before pushing. Configure CI for pull requests and pushes to `main`, using GitHub-hosted runners and only the permissions needed for those jobs. Ordinary test/build jobs should have `contents: read` and no deployment secrets.

Reference actions by reviewed, full commit SHA; keep an adjacent version comment for maintainability. Verify each SHA belongs to the intended upstream action repository before updating it. Review action changes as code. GitHub's current guidance also describes dependency lockfiles, which maintainers may adopt separately. [GitHub: secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)

Avoid running untrusted pull-request code with privileged `pull_request_target` credentials. Where repository settings permit, require the checks and a review for changes to `main`; keep release/deployment decisions separate from an untrusted contributor's test job.

## Hosted browser builder

In **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/docs**, and save. The checked-in docs/index.html is built by npm run build:builder; its BioVista example is copied into docs/examples/biovista. Publish only these intended public site files.

After deployment succeeds, open the URL reported by GitHub Pages and verify the builder loads, imports a configuration, previews it, and downloads a self-contained HTML file. Set the repository's About website to that verified URL. Do not announce the site as live solely because workflow YAML was committed.

The hosted builder is optional. People can download the project and open `index.html` locally, or use the Node CLI. Playing a generated quiz does not require GitHub Pages, a server, an API key, or an account.

## Stable release

1. Build from a clean, identified commit with the documented test results available.
2. Check that the real BioVista example, source configuration, question sources, licenses, and notices are included and that private workspace paths were removed from public credits.
3. Create a version tag and a stable release only after validating that version. Describe changes and any remaining browser/hardware verification limits.
4. Attach the documented downloadable kit/example artifacts. Include checksums when producing packaged release assets, and verify the uploaded bytes against the local files.
5. Open the release and download its assets as a user would. Confirm that the handoff's latest-stable route resolves to the intended release and that the builder/CLI instructions still work.

Review repository visibility, template status, default branch, CI results, Pages status, and release downloads independently. A successful file build does not establish any of the other statuses.
