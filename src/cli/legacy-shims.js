'use strict';

/**
 * Legacy argv shims — rewrite v2-style flags to v3 equivalents and emit a
 * deprecation warning on stderr. Runs BEFORE Commander sees argv so scripts
 * pinned to v2 syntax keep working in v3 with a single nudge.
 *
 * Removed in v4.
 */

const chalk = require('chalk');

/**
 * @param {string[]} argv - The live process.argv array (mutated in place).
 */
function applyLegacyShims(argv) {
  shimHeightShort(argv);
  shimBareConfig(argv);
}

/**
 * v2: `-h <n>` meant `--height <n>`.
 * v3: `-h` is `--help` (standard). Rewrite `-h <positive-int>` to `--height <n>`.
 */
function shimHeightShort(argv) {
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] !== '-h') continue;
    const next = argv[i + 1];
    if (!next || !/^\d+$/.test(next)) continue;

    process.stderr.write(
      chalk.yellow(
        `\n⚠  '-h ${next}' is deprecated in v3 (now means --help).\n` +
        `   Rewriting to '--height ${next}'. Update your scripts to use --height explicitly.\n\n`
      )
    );
    argv[i] = '--height';
    return; // only rewrite the first match — user has bigger issues if they have two
  }
}

/**
 * v2: `imgconvert config` (bare) created the config file.
 * v3: `config` has explicit subcommands `init` and `show`. Rewrite bare
 * `config` invocations to `config init` with a warning.
 */
function shimBareConfig(argv) {
  // Find the first non-flag token after the binary path.
  // argv[0] = node, argv[1] = script, argv[2..] = user args.
  let i = 2;
  while (i < argv.length && argv[i].startsWith('-')) i++;
  if (argv[i] !== 'config') return;

  const next = argv[i + 1];
  const hasSubcommand = next === 'init' || next === 'show';
  const nextIsFlag = next && next.startsWith('-');
  if (hasSubcommand) return;
  // If next is a flag (e.g. `config --help`), let Commander handle it normally.
  if (nextIsFlag) return;

  process.stderr.write(
    chalk.yellow(
      `\n⚠  'imgconvert config' (no subcommand) is deprecated in v3.\n` +
      `   Use 'imgconvert config init' or 'imgconvert config show' explicitly.\n` +
      `   Running 'config init' for backwards compatibility.\n\n`
    )
  );
  argv.splice(i + 1, 0, 'init');
}

module.exports = { applyLegacyShims };
