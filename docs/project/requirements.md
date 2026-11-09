# Requirements

## Documentation and CLI text

The usage guides and built-in help must describe the active v3 CLI. Every public command and option needs its purpose, accepted values, defaults, path rules, and relevant limitations. Examples must use supported syntax and valid JSON.

Document observed behavior when the implementation differs from an option's intended purpose. Listing a defect does not mean it has been fixed. Keep migration guidance separate from current usage.

Apply Humanizer when editing help, console messages, errors, and documentation. Preserve technical meaning, commands, code examples, paths, option names, and link targets. Clear existing messages can remain unchanged.

The npm package must contain the documentation linked from its README and the license text.

## Validation

Start with the tests covering the changed behavior and direct regressions. Use name filters when a test file contains unrelated cases. Lint changed JavaScript and validate relevant JSON examples, links, and package contents. Expand testing only when failures, shared changes, or specific risks justify it. Closing a session or creating a commit does not justify repeating passed tests.

## Git authorization

Commits require an explicit user instruction. Keep commits semantic and scoped to reviewed changes. Subagents must leave changes unstaged and must not commit; see the delegation rule in context.md.

## Runtime

Use Node.js 22.13.0 or later for running and developing the CLI. This minimum was explicitly approved for upgrading all dependencies. Keep dependency changes and required module adapters distinct from proposed changes to command behavior.

## Audit correction contract

Implement the agreed F-01 through F-18 dispositions while retaining conversion formats, presets, transform fits, fixed Alloy scales, branding categories and relative path rules. The public contract is the CLI; a JavaScript library API is outside scope.

Plan all destinations before writes. Require explicit overwrite permission for existing outputs and reject duplicate destinations or outputs that replace another input. In-place replacement only authorizes the input itself; preserve originals when creating a sibling with a new name or format. Use exclusive adjacent temporaries and retain valid partial results.

Resolve CLI > preset > global > default through shared configuration validation. Null inherits, false/zero remain explicit, unknown recipes and malformed JSON fail. Expose exit codes 0/1/2 for success/no-output or invalid/partial outcomes. Bound conversion and Alloy tasks by input, including all variants inside one task.

Branding dry-run must decode every supplied master and show exact write paths separately from project deletions. Android cleanup requires explicit Android orientation evidence; preserve resources whose unused status cannot be established.

Preserve unrelated pending changes and root PNGs. Do not publish, change version, create tags, commit or push without separate authorization.
