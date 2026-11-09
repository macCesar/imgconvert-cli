# Testing imgconvert-cli

Use Node.js 22.13.0 or later and install development dependencies with `npm ci`. The updated dependency tree was tested on Node 22.23.2, with focused checks on the minimum supported version.

## Select tests for the change

```bash
npm run test:help
npm run test:config
npm run test:general -- --grep "Batch renaming"
npm run test:alloy
npm run test:brand
npm test -- test/completions.test.js
npm test -- 'test/{cleanup-legacy,tiapp-reader}.test.js'
```

Run the smallest relevant subset first. Expand only when shared behavior or a failure requires it. `--grep` is Mocha's test-name filter; there is no need to edit tests to select a category. For detailed general-suite CLI logs:

```bash
npm run test:verbose -- --grep "Batch renaming"
```

## Suite inventory

| File | Coverage area |
| --- | --- |
| `general.test.js` | Conversion, formats, dimensions, fit, crop, positions, presets/precedence, naming, canvas, errors |
| `help.test.js` | Root/subcommand help, topic help, unknown topics |
| `config.test.js` | Config init, existing config, force, show |
| `brand.test.js` | Public brand subcommand and generated assets |
| `alloy.test.js` | Public multi-scale Alloy subcommand |
| `completions.test.js` | Script output and installation/removal in isolated home directories |
| `alloy-modern.test.js` | Shared branding pipeline and generators, including legacy integration paths |
| `cleanup-legacy.test.js` | Cleanup categories and preview behavior |
| `tiapp-reader.test.js` | Titanium XML analysis and layout detection |

These are behavior/integration checks, not measured line or branch coverage. Do not infer a coverage percentage from the number of tests.

## Full suite and legacy scripts

```bash
npm test
```

`npm test` runs every `test/*.test.js` in an exclusive temporary copy of the project. `test:all`, `test:unit`, and `test:integration` are aliases for this same suite until a genuine unit/integration split exists. `test:watch` watches that disposable copy; restart it to copy new repository edits. `test:debug` enables verbose logging and an inspector break.

## Fixtures and side effects

`test/run.cjs` copies source, tests and image fixtures into a fresh OS temporary directory and links installed dependencies. Every test-created config and output stays inside that copy or an exclusive per-test temporary directory. The runner removes its copy in `finally`. Use the npm scripts for isolation; direct Mocha calls bypass this boundary. An interrupted process may leave its exclusive temporary directory; it never needs to delete user output folders.

`npm run clean` and `clean-all` only explain automatic test cleanup. They do not delete project outputs or configuration. `clean-force` additionally removes `node_modules/.cache/`.

Regression suites cover the correction contract (`contract.test.js`), atomic writes and bounded tasks (`operations.test.js`), context-sensitive completion (`completion-contract.test.js`) and safe tooling (`tooling.test.js`). Assertions inspect metadata or alpha when existence alone cannot prove behavior. Run `node test/benchmark.cjs` on macOS for separate-process concurrency measurements.

## Static checks

`npm run lint` uses ESLint 10 and the checked-in `eslint.config.cjs`. Its rules check parsing, unreachable code, duplicate arguments/keys, constant conditions, invalid type checks, and constructor/super usage.

```bash
npm run lint
npx eslint src/cli/program.js src/cli/help.js
```

For documentation changes, parse fenced JSON examples and check links/command syntax as well as testing affected help output.

## Troubleshooting

For missing fixtures, confirm the files in `images/` instead of looking for old `image.jpg`/`image.png` names. For timeouts, rerun the failing file or name filter with a longer timeout before expanding the suite. For destination mismatches, check source-relative output rules in the [README](../README.md#paths-and-overwriting).

Some existing tests exercise older internal paths. Public v3 behavior is defined by `src/cli/program.js` and its command handlers; see the [known limitations](../README.md#known-limitations) before treating an old example as supported syntax.
