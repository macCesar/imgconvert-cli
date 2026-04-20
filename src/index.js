'use strict';

const { checkForUpdate } = require('./cli/update-check');
const program = require('./cli/program');

if (process.env.NO_COLOR) {
  const chalk = require('chalk');
  chalk.level = 0;
}

checkForUpdate();
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
