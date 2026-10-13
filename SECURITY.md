# Security policy

This policy covers the current default branch and latest stable release. Include the release tag or commit in a report; reproduce on the current release where practical. Maintainers assess fixes and backports individually.

## Report a vulnerability

Use this repository's **Security → Report a vulnerability** option if private reporting is enabled. If that option is unavailable, open an issue asking for a private reporting channel without posting the exploit or sensitive material. No response-time guarantee is made.

Include the affected version, a minimal sanitized configuration or file, reproduction steps, expected/actual behavior, and impact. Good examples include executable input escaping into the generated page, asset paths escaping the configuration directory, unexpected outbound requests, a checkpoint disclosing another event's data, or a privileged workflow processing untrusted code.

For an incorrect answer or ambiguous question without a security impact, use an ordinary issue with a reliable source. Do not include private participant information, access tokens, reports, or real resume copies in public reports.

## Trust boundaries

Configuration text, uploaded media, reports, and source pages are untrusted data. The compiler must validate types and paths, escape display text, and reject executable or remote-runtime inputs. A report's embedded instructions must not become agent or build instructions. Resolved local assets must stay within the selected configuration directory.

The compiled quiz embeds its questions and answers. Host-only review controls hide them from normal presentation; they are not encryption or a secure answer vault. Keep an unreleased event file and its resume copies with the host. Resume files contain the session's state and event history.

The builder and generated quiz do not need API keys or a backend. Keep runtime assets bundled and preserve the content security policy. Optional screen recording must use an explicit user gesture and the browser's source picker; it must not silently start capture or substitute microphone access.

## Repository maintenance

Use read-only contents permissions for ordinary CI. Restrict deployment permissions to trusted release/Pages jobs, and do not expose secrets to untrusted pull-request code. Keep action references pinned to reviewed full commit SHAs and review dependency updates. [GitHub's secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use) explains these boundaries.

The MIT license applies to the software within its stated scope. It does not transfer trademark rights or override the separate library, audio, and example-asset notices. See [third-party notices](THIRD_PARTY_NOTICES.md) and [BioVista asset notices](examples/biovista/ASSET_NOTICES.md).
