'use strict';

const { checkForUpdate } = require('./cli/update-check');
const { applyLegacyShims } = require('./cli/legacy-shims');
const program = require('./cli/program');

if (process.env.NO_COLOR) {
  const chalk = require('chalk').default;
  chalk.level = 0;
}

applyLegacyShims(process.argv);
checkForUpdate();
program.exitOverride();
(async () => {
  try {
    if (!process.argv.slice(2).length) program.outputHelp();
    else await program.parseAsync(process.argv);
  } catch (error) {
    if (error.code === 'commander.helpDisplayed' || error.code === 'commander.version') return;
    if (!error.code?.startsWith('commander.')) console.error(`Error: ${error.message}`);
    if (process.argv.includes('--debug') || process.argv.includes('-d')) console.error(error.stack);
    process.exitCode = 1;
  }
})();
