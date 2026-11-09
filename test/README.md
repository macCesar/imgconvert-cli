# Testing imgconvert-cli

Install development dependencies with `npm ci`. Use a Node version supported by Mocha 11 (`^18.18.0 || ^20.9.0 || >=21.1.0`) and Sharp; this checkout was validated on Node 22.

## Select tests for the change

```bash
npm run test:help
npm run test:config
npm run test:general -- --grep "Batch renaming"
npm run test:alloy
npm run test:brand
npx mocha test/completions.test.js --timeout 30000
npx mocha test/cleanup-legacy.test.js test/tiapp-reader.test.js --timeout 30000
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

The main script runs `test/*.test.js` with a 300-second timeout. There is no `test/simple.test.js`, `test/unit/`, or `test/integration/` in this checkout. The existing `test:unit`, `test:integration`, and consequently `test:all` npm scripts reference absent paths; use the commands above. `test:watch` watches the main suite; `test:debug` enables verbose logging and an inspector break.

## Fixtures and side effects

The general/Alloy suites copy actual images from [`images/`](../images/README.md), including `canyon-river.jpg` and `mountain-lake.png`, into temporary directories. Other tests generate their own SVG/PNG fixtures. Assert metadata, dimensions, alpha, or actual destination paths when the behavior needs them; file existence alone does not prove correctness.

Run tests in a disposable checkout or back up any existing `.imgconverter.config.json` in the working directory. Some suites create and delete that file in the repository root. Test directories and cleanup vary by suite. Do not assume a failed or interrupted run restores user configuration.

`npm run clean` (also `clean-all`) removes `test/temp-test/`, `converted/`, `app/`, `compressed/`, `output/`, `*-preset/`, and `.imgconverter.config.json` from the current project. These paths may contain project files. `clean-force` also removes `node_modules/.cache/`. Tests can run without these cleanup commands. Inspect leftovers before removing them.

## Static checks

`npm run lint` targets all `src/**/*.js`, but this checkout does not include an ESLint configuration. To check JavaScript syntax with the installed ESLint 8:

```bash
npx eslint --no-eslintrc --env node,es2022 --parser-options '{"ecmaVersion":2022}' src/cli/program.js src/cli/help.js
```

Use project lint rules if a configuration is added. For documentation changes, parse fenced JSON examples and check links/command syntax as well as testing affected help output.

## Troubleshooting

For missing fixtures, confirm the files in `images/` instead of looking for old `image.jpg`/`image.png` names. For timeouts, rerun the failing file or name filter with a longer timeout before expanding the suite. For destination mismatches, check source-relative output rules in the [README](../README.md#paths-and-overwriting).

Some existing tests exercise older internal paths. Public v3 behavior is defined by `src/cli/program.js` and its command handlers; see the [known limitations](../README.md#known-limitations) before treating an old example as supported syntax.
