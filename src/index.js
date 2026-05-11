'use strict';

const { checkForUpdate } = require('./cli/update-check');
const { applyLegacyShims } = require('./cli/legacy-shims');
const program = require('./cli/program');

if (process.env.NO_COLOR) {
  const chalk = require('chalk');
  chalk.level = 0;
}

applyLegacyShims(process.argv);
checkForUpdate();
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
