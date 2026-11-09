# Project context

## Documentation map

- `README.md`: project landing page, quick start and stable links into the official user guide.
- `docs/README.md`: official documentation index. Chapters under `docs/guide/` own installation, image transforms, files/batches, configuration, Android branding, Alloy, recipes, automation, every CLI flag and troubleshooting. Read the relevant chapter before changing public behavior.
- `CUSTOM_PRESETS.md`: compatibility navigation into the maintained configuration/Alloy chapters; avoid duplicating their reference text here.
- `test/README.md`: suite selection, fixture isolation, safe cleanup scripts, and the explicit ESLint command for this checkout.
- `images/README.md`: fixture names and limits of the sample images. Read before changing tests that use repository images.
- `docs/audits/implementation-and-cli.md`: critical review of the implementation and CLI contract, evidence, decision matrix, and dependency update results. The original diagnostic evidence is retained; the final disposition matrix records the implemented corrections.
- `CHANGELOG.md`: release history and unreleased documentation changes. Historical statements can differ from current behavior; current corrections are recorded under Unreleased.
- `LICENSE`: MIT text extracted from the existing README.
- `CLAUDE.md`: repository instructions and imports of stable project notes.
- `docs/project/requirements.md`: documentation, validation, and Git requirements.
- `docs/project/decisions.md`: dated choices and their reasons.
- `docs/project/status.md`: current work, verification results, and next steps. Read on resumption; never import at startup.

## Active architecture

`index.js` loads `src/index.js`, which applies compatibility shims and invokes the Commander program in `src/cli/program.js`. Handlers under `src/cli/commands/` dispatch general conversion to `processors/image.js`, Alloy scaling to `processors/alloy-legacy.js`, and branding to `processors/alloy-modern/index.js`.

The legacy parser and Alloy router remain in the repository but do not define the active v3 root command. Check the current handler before copying old examples or treating an internal generator as a public feature.

Configuration normalization, precedence and validation live in `src/config/precedence.js`; Alloy receives resolved platform options. `src/utils/operations.js` owns discovery, joint write planning, atomic no-clobber writes, structured results and the bounded input queue. The config is read from the current working directory. Relative conversion output resolves beside the selected source. Branding uses project-relative default staging and accepts only `--sdk android`. Alloy treats input dimensions as a 4x master on both platforms.

## Validation constraints

The project requires Node >=22.13.0 after the approved dependency upgrade. ESLint 10 uses eslint.config.cjs and npm run lint covers the full src tree. Unit/integration/all npm scripts alias the isolated real suite. glob and minimatch overrides keep the development dependency tree on patched releases; remove them only after verifying upstream ranges and regression tests.

`test/run.cjs` executes legacy suites in an exclusive temporary copy so their configuration/output cleanup cannot touch the working checkout. Use npm scripts; direct Mocha invocation bypasses this boundary. Temporary scripts used for the documentation audit were verification aids, not maintained repository tests; reproduce checks from the guides and targeted suites.

## Delegation and commits

Preserved from the former `.claude/memory/feedback_no_commits_in_subagents.md` note:

Every implementer subagent prompt must explicitly include: "Do NOT run git add or git commit. Leave changes unstaged for the user to review and commit manually."

The user must be able to test and review changes before a commit. Automatic commits inside a multi-step skill or subagent bypass that review. Only the coordinating agent may create commits after explicit user authorization, such as "commitea" or "haz el commit".

The former memory index and feedback note were consolidated here. `CLAUDE.md` imports this file instead of a separate memory index.

## Saved files and publication

The user's existing VS Code SFTP workflow uploads saved changes automatically and propagates deletions. Treat file saves accordingly; do not invent a separate deployment approval step. Transfer verification and npm publication are separate facts. Creating Git commits does not publish an npm release or push the branch.

## Contributors to this work

| Date | Assistant | Work |
| --- | --- | --- |
| 2026-11-08 | Codex (GPT-6; exact model ID unavailable) | Audit of v3 documentation and help, Humanizer editing, focused validation, semantic commits, and session notes |

## Concurrency measurements

`docs/audits/concurrency-benchmark.json` records one fresh-process measurement per concurrency setting on this Mac. Twelve 2400x1600 photographic PNGs converted to 1200-wide WebP took 2.147/1.095/0.728 seconds at concurrency 1/2/4, with maximum RSS 120832000/142884864/199704576 bytes. This single sample supports exposing a memory/speed tradeoff; it is not a guarantee for other codecs or workloads. Reproduce with `node test/benchmark.cjs` on macOS.

## Public documentation ownership

The official manual is in English, matching the repository, as explicitly selected by the user. Keep `docs/README.md` as its index and `docs/guide/` as the canonical user-facing chapters. README and the earlier custom-preset entry point link to those chapters. Preserve useful old README/preset anchors when reorganizing navigation. The npm file list includes only the public docs index/guide tree, not internal audit/session notes.

Examples describe this source checkout; an installed npm release can lag behind it even when an unreleased checkout retains the same package version. Check the installed help before making claims about published availability. Documentation changes require example, option-coverage, link and package checks proportional to scope; do not repeat the full image suite for prose alone.

## Release publication

`.github/workflows/publish.yml` publishes version-tag pushes (`v*`) through GitHub Actions OIDC on a GitHub-hosted Ubuntu runner using Node 24. It checks the tag against package.json and both root lockfile version fields, installs dependencies, runs lint/the full suite, then publishes to npm. It uses `id-token: write` without an npm token secret or NODE_AUTH_TOKEN.

The package-specific npm trusted publisher names `macCesar / imgconvert-cli / publish.yml` with no GitHub environment. The owner performs registry authorization/2FA. Renaming the workflow or adding an environment requires updating that registration. Push deliberately approved version tags, wait for the job, and verify direct registry version/latest metadata, provenance and tarball integrity. npm may accept a package and report processing before its metadata/artifact becomes available.

Main is the aligned default branch. Post-release notes intentionally follow the tag. The npm file list excludes docs/project and docs/audits while including the public docs index/guide tree; notes-only edits must leave the package payload unchanged.
