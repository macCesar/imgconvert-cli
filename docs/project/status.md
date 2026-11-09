# Current status

Updated: 2026-11-08
Session by: Codex (GPT-6; exact model ID unavailable)
Branch: main
Phase: Documentation review complete; functional defects documented for follow-up.

## Completed

The README, custom presets, test/fixture guides, help output, console messages, and branding notes now describe the active v3 interface. Humanizer was applied to maintained prose. Unsupported examples, invalid JSON, stale preset defaults, and unverified performance/coverage claims were corrected or removed. Linked guides and the existing MIT license text are included in the npm package file list.

Commits created in this session:

- `b5353c5` fix(cli): align help and console messages with v3 behavior
- `811d99f` docs: reconcile usage guides with the v3 CLI

The session-notes commit contains these four project files, the updated CLAUDE.md guidance, and migration of the pre-existing Claude memory rule into context.md. The working tree was already dirty at the start: CLAUDE.md referenced that untracked memory folder. Its rule has been preserved.

## Verification

- 35 focused Mocha tests passed after the final text edits: 25 help/completion tests, 2 filtered general help/debug tests, and 8 filtered brand help/error/dry-run tests.
- 40 isolated CLI invocations during the initial audit checked documented outputs, dimensions, presets, paths, SDK support, and observed limitations. These preceded the final prose edits.
- 12 compact/full branding-note variants rendered after Humanizer editing.
- Changed JavaScript passed explicit ESLint syntax checks. AST comparison confirmed that the Humanizer pass changed text without changing executable structure; printed integration snippets stayed unchanged.
- Five JSON examples parsed. Six Markdown files passed local-link/anchor checks. Code blocks, inline literals, quotation blocks, and link targets were preserved during Humanizer editing.
- `npm pack --dry-run` included README, custom presets, changelog, both linked testing guides, and LICENSE.
- No full-suite run was needed for these documentation and wording changes. No tests were repeated merely to create commits or close the session.

## Follow-up work

Functional fixes remain outside this completed documentation task:

- `--replace` writes to the output directory instead of reliably replacing the source.
- Alloy can lose CLI `-o` during precedence handling, always reads platform definitions from `presets.alloy`, and does not expose selective group execution in v3.
- JSON `canvas` values are ignored; the CLI flag works.
- Unknown presets fall back silently, and some processing failures can still return exit code 0.
- Node engine metadata and legacy test scripts need updating.
- Branding layout warnings and integration notes can include Titanium guidance during Android generation. Dry-run does not fully validate master decoding.

The next implementation task should select one defect, reproduce it with a focused test, then update the processor and its documentation together. See README's known limitations for details.

## Publication and blockers

Saved edits follow the user's automatic SFTP upload workflow. Transfers were not independently verified. No npm publish, version bump, tag, or Git push was performed.

No external blocker prevents the documented follow-up work.
