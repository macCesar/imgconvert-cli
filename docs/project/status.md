# Current status

Updated: 2026-11-08
Session by: Codex
Branch: fix/cli-audit
Phase: Official English user manual verified and committed; session closed without release actions.

## Official user documentation

The user requested a structured official guide and explicitly chose English to match the repository. `docs/README.md` is the central index; ten chapters under `docs/guide/` cover installation, image transforms, files/batches, configuration, Android branding, Alloy, recipes, automation, the full CLI reference and troubleshooting/migration. README is the project entry point; CUSTOM_PRESETS.md preserves its old entry anchors and links into the maintained chapters.

Corrected obsolete prose about JSON canvas, position fallback/compass aliases, configured Alloy sources/groups and master sizing. The manual distinguishes repository source from the currently published npm executable. Added only the public docs index/guide tree to npm's file list; internal audit/session notes remain excluded.

Documentation verification: 45 isolated CLI invocations and 33 artifact checks passed, covering dimensions, alpha, naming, paths, variant counts, dry-run and partial results. Static checks covered 42 Commander long flags, seven strict JSON examples, 91 shell blocks and 138 local links/anchors across 15 Markdown files. Package dry-run includes all 11 manual files (59 package files total), with internal audit/session notes excluded. The image-processing source and tests were unchanged; the full suite was not repeated for prose and package-file-list edits.

The user explicitly authorized semantic documentation commits and a session close. The manual/navigation changes are in `655f34b` (`docs(guide): add official English user manual`); npm inclusion is in `6619de5` (`build(package): include official documentation in npm package`). The updated documentation map, decisions and this status are recorded by `docs(project): record official manual and session close`.

No runtime/test changes or new processing work accompanied commit grouping. Existing documentation checks remained applicable; only diff/index checks, startup import checks and screenshot preservation were checked for the close. Next step: review the branch and decide separately whether to merge or release.

## Completed audit correction work

Implemented F-01 through F-18 according to the accepted plan; F-12 is explicitly accepted as a CLI-only public contract. Original diagnostic evidence and the final disposition matrix are in `docs/audits/implementation-and-cli.md`. Single-process concurrency measurements are in `docs/audits/concurrency-benchmark.json`.

The shared operations module plans destinations before writes, rejects collisions and outputs over other inputs, requires overwrite permission, commits exclusive adjacent temporaries without creation races, and bounds work by input. General conversion now supports real in-place updates and sibling format/name changes. Effective configuration is normalized and validated centrally with null inheritance, false/zero preservation, negations and strict JSON/preset errors. Structured results produce exit codes 0/1/2. Trim/crop/canvas uses intermediate dimensions and preserves alpha.

Alloy receives resolved platform options, supports configured sources and selected presets/groups, preserves scale/path conventions, and respects per-platform overwrite policy. Branding validates every supplied master in dry-run, lists writes separately from project deletions, protects existing outputs and user temporaries, and gives SDK/category-specific notes. Android cleanup requires independent Android evidence and retains resources when unused status is unproven.

Commander drives help and contextual shell completion recursively. Legacy internal adapters remain; duplicated precedence and accidental minimist usage were removed. Sinon had no consumers and was removed. Tests run in an exclusive temporary project and cleanup scripts preserve user configuration and outputs.

## Audit correction verification

- Development runtime Node 22.23.2: full suite 202 passing.
- Minimum Node 22.13.0: 57 focused tests passing across contract, operations/queue, orientation, completion, config and help. Conversion, Alloy and branding produce verified image metadata/content or alpha.
- Independent read-only review found three Important issues. Each was reproduced with a failing test and fixed: cross-input overwrite through renaming, platform-specific Alloy overwrite protection, and malformed preset object shapes. Completion findings were also corrected with behavioral regressions.
- ESLint 10 across src passed; `git diff --check` passed.
- npm audit: zero vulnerabilities. npm pack dry-run: 48 files, version 3.0.0; required guides, LICENSE and new runtime modules present.
- Documentation: five strict JSON examples and local links/anchors in six maintained documents validated; external support link HTTP 200. Bash completion context executed; Bash/Zsh syntax checked. Live Zsh/Fish completion sessions were not exercised; Fish is unavailable here.
- Benchmark: 12 photographic 2400x1600 PNGs to 1200-wide WebP. Concurrency 1/2/4: 2.147/1.095/0.728 seconds, maximum RSS 120832000/142884864/199704576 bytes. Separate process for each measurement; one sample per setting.

The full suite was repeated after review fixes and the help regression, not for session closure. Documentation-only final disposition/session updates followed the successful checks. Commit grouping changed only the Git index/history; the source and test files stayed unchanged, so no full suite was repeated solely for committing.

## Git and publication

The user authorized semantic commits and session documentation after the implementation handoff. The pre-existing dependency/toolchain edits and the completed corrections were organized on `fix/cli-audit`:

- `6bb98cd` chore(tooling): upgrade dependencies and isolate test execution.
- `8c33712` fix(processing): validate options and protect image output pipelines.
- `1583f27` feat(completions): derive contextual shell completion from Commander.
- `3b83288` docs(project): record audit corrections and session close.
- `655f34b` docs(guide): add official English user manual.
- `6619de5` build(package): include official documentation in npm package.
- Documentation session close: `docs(project): record official manual and session close`.

The unrelated root screenshots matching `*-.png` (currently `1-.png`, `2-.png`, `3-.png`) remain untracked, excluded from every commit and unchanged. No push, version bump, tag or npm publication was performed. Saved edits follow the existing SFTP upload workflow; transfer telemetry was not independently checked.

## Remaining environment verification

Windows/Linux filesystem behavior, live Zsh/Fish sessions, mobile builds and SFTP transfer status remain unverified. There is no pending implementation blocker in the accepted correction plan. The official manual follow-up is complete and committed; there are no tasks blocked on external input.
