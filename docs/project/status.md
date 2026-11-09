# Current status

Updated: 2026-11-08
Session by: Codex
Branch: main
Phase: ImgConvert CLI 4.0.0 published to npm and GitHub through trusted publishing.

## Release result

- Version: `4.0.0`; direct registry requests verified `dist-tags.latest = 4.0.0`.
- Release commit: `de8bdac91dc15190475b8a18140ebf7000203309`; annotated tag `v4.0.0` resolves to this commit.
- GitHub Release: https://github.com/macCesar/imgconvert-cli/releases/tag/v4.0.0
- Successful workflow: https://github.com/macCesar/imgconvert-cli/actions/runs/42559917032
- npm: https://www.npmjs.com/package/imgconvert-cli/v/4.0.0
- Registry publication time: `2026-11-09T04:11:35.683Z` (2026-11-08 in the user's timezone).
- Registry publisher: GitHub Actions, with a GitHub trusted-publisher identity and provenance attestations. Registry gitHead matches the release commit.
- Downloaded registry tarball SHA-1: `cdb33fb51be9b01c8ee383e66031ddc09be662d1`; advertised SHA-512 integrity also verified.

The user approved a major release and the switch to the same GitHub Actions/OIDC flow used by TiTools and AISkills. Workflow commit `b72b8f3` was fast-forwarded onto main and pushed before publisher registration. The user registered `macCesar / imgconvert-cli / publish.yml`, no environment, with direct npm publish permission and their own 2FA. No local npm login or npm token secret was needed.

GitHub Actions accepted publication before npm exposed the new version. npm reported processing; verification waited until the version endpoint, latest dist-tag and tarball were publicly available. Publication is verified against registry metadata and downloaded bytes, not inferred from a pushed tag or cached npm CLI output.

## Released scope

F-01 through F-18 are implemented or explicitly disposed, with F-12 accepted as a CLI-only public contract. The release includes file/output protection, explicit in-place/overwrite policies, shared configuration validation, exit codes 0/1/2, corrected trim/crop/canvas composition, Alloy selection/source/output fixes, safe branding preview/cleanup, contextual completion and bounded input concurrency. Evidence and the final matrix remain in `docs/audits/implementation-and-cli.md`.

The English official manual consists of `docs/README.md` and ten chapters under `docs/guide/`, linked from README and CUSTOM_PRESETS. All 11 public manual files ship; internal audit/session notes do not. Version 4 reflects the raised Node minimum and public compatibility changes; deprecated aliases/shims are retained as documented.

## Verification

- GitHub-hosted Ubuntu: Node 24.22.2, npm 11.19.1. Version guard, npm ci, lint, all 202 tests and OIDC publication succeeded. The full CI suite took 57 seconds.
- Guard tests accepted matching tag/manifest/lock versions and rejected mismatched tags/lockfiles.
- Release-specific local checks: version test and ten help tests passed; lint and diff checks passed. The version assertion now reads package.json instead of hard-coding 3.0.0.
- Documentation: 42 Commander long flags, seven strict JSON examples, 91 shell blocks and 140 local links/anchors across 15 Markdown files passed.
- Package: 59 files, including all 11 manual files and no screenshots/internal notes. A temporary installation of the packed executable reported 4.0.0 and produced a verified 80x40 WebP from PNG. The downloaded registry tarball matches that tested artifact and its advertised SHA-512 integrity.
- Earlier development checks: Node 22.23.2 full suite 202 passing; Node 22.13.0 focused subset 57 passing; documentation examples 45 isolated CLI invocations with 33 artifact checks; dependency audit zero vulnerabilities.

Session-note edits follow the release tag and are excluded from the package. A fresh pack comparison verifies they leave the published payload byte-identical. No full image suite is repeated solely for session closure.

## Git and deployment state

Main was fast-forwarded without force and pushed; the feature branch remains. No branch/tag was deleted and no history was rewritten. Workflow and release commits are `b72b8f3` and `de8bdac`; the post-publication notes are committed separately as `docs(project): record v4.0.0 publication and session close` and pushed to main.

All root screenshots matching `*-.png` remain untracked, unchanged and excluded from commits/package. Saved files follow the existing SFTP upload workflow; transfer telemetry was not independently checked. GitHub/npm publication was independently verified.

## Remaining environment checks and next step

The Linux/Node 24 CI flow now passes. Windows behavior, live Zsh/Fish sessions, mobile app builds and SFTP telemetry remain unverified. There is no pending release blocker. Future releases use the confirmed tag-triggered workflow and registry verification; decide new feature work separately.
