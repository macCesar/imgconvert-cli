# Project context

## Documentation map

- `README.md`: public command reference, installation, source/output paths, migration, and known limitations. Read before changing public options or examples.
- `CUSTOM_PRESETS.md`: valid preset recipes, precedence, path resolution, and grouped Alloy configuration. Read before changing configuration behavior.
- `test/README.md`: suite selection, fixture handling, destructive cleanup scripts, and the explicit ESLint command for this checkout.
- `images/README.md`: fixture names and limits of the sample images. Read before changing tests that use repository images.
- `CHANGELOG.md`: release history and unreleased documentation changes. Historical statements can differ from current behavior; current corrections are recorded under Unreleased.
- `LICENSE`: MIT text extracted from the existing README.
- `CLAUDE.md`: repository instructions and imports of stable project notes.
- `docs/project/requirements.md`: documentation, validation, and Git requirements.
- `docs/project/decisions.md`: dated choices and their reasons.
- `docs/project/status.md`: current work, verification results, and next steps. Read on resumption; never import at startup.

## Active architecture

`index.js` loads `src/index.js`, which applies compatibility shims and invokes the Commander program in `src/cli/program.js`. Handlers under `src/cli/commands/` dispatch general conversion to `processors/image.js`, Alloy scaling to `processors/alloy-legacy.js`, and branding to `processors/alloy-modern/index.js`.

The legacy parser and Alloy router remain in the repository but do not define the active v3 root command. Check the current handler before copying old examples or treating an internal generator as a public feature.

General configuration precedence lives in `src/config/precedence.js`. The config is read from the current working directory. Relative conversion output resolves beside the selected source. Branding uses project-relative default staging and accepts only `--sdk android`. Alloy treats input dimensions as a 4x master on both platforms.

## Validation constraints

The package's Node 14 declaration is older than the installed Sharp/Commander requirements. See README for actual version ranges. Legacy unit/integration npm scripts reference absent directories. No ESLint configuration is checked in; use the explicit syntax-check command in the testing guide.

Some tests create and delete root configuration and output directories. Inspect their setup/cleanup before running them against a working checkout. Temporary scripts used for the documentation audit were verification aids, not maintained repository tests; reproduce checks from the guides and targeted suites.

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
