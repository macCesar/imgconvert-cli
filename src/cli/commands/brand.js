'use strict';
const path = require('path');
const chalk = require('chalk');
const { runModern } = require('../../processors/alloy-modern');
const { logger } = require('../../utils/logger');

const VALID_SDKS = ['android'];

module.exports = async function brandAction(master, options) {
  if (options.debug) logger.setDebugMode(true);

  // --sdk is required. Listing valid values without any framework recommendations
  // keeps the error self-contained: the user picks from the supported list.
  if (!options.sdk && !options.cleanupLegacy) {
    printSdkRequiredError();
    process.exit(1);
  }

  const sdk = options.sdk || 'android'; // any valid value — cleanup-only mode won't use it
  if (options.sdk && !VALID_SDKS.includes(sdk)) {
    printSdkRequiredError(sdk);
    process.exit(1);
  }

  const anySubFlag = options.adaptive || options.marketplace || options.notification || options.splash;
  const kitchenSink = !anySubFlag && !options.cleanupLegacy;

  // Dark/Tinted icons are iOS 18+ variants for Titanium's DefaultIcon pipeline
  // and are intentionally off in imgconvert — purgetss owns that workflow.
  const withDark = false;
  const withTinted = false;

  try {
    await runModern({
      master: master ? path.resolve(master) : null,
      monochromeMaster:  options.monochromeMaster ? path.resolve(options.monochromeMaster) : null,
      darkMaster:        options.darkMaster ? path.resolve(options.darkMaster) : null,
      darkBgColor:       options.darkBgColor || null,
      withDark,
      withTinted,
      tintedMaster:      options.tintedMaster ? path.resolve(options.tintedMaster) : null,
      bgColor:           options.bgColor || '#FFFFFF',
      bgColorExplicit:   Boolean(options.bgColor),
      padding:           options.padding   ?? 15,
      iosPadding:        options.iosPadding ?? 4,
      adaptive:          kitchenSink ? true : Boolean(options.adaptive),
      marketplace:       kitchenSink ? true : Boolean(options.marketplace),
      notification:      kitchenSink ? true : Boolean(options.notification),
      splash:            kitchenSink ? true : Boolean(options.splash),
      cleanupLegacy:     Boolean(options.cleanupLegacy),
      aggressive:        Boolean(options.aggressive),
      projectRoot:       options.project ? path.resolve(options.project) : process.cwd(),
      output:            options.output || null,
      dryRun:            Boolean(options.dryRun),
      inPlace:           Boolean(options.inPlace),
      notes:             Boolean(options.notes),
      sdk,
    });
  } catch (err) {
    logger.error(err.message);
    if (options.debug) console.error(err.stack);
    process.exit(1);
  }
};

function printSdkRequiredError(invalidValue) {
  if (invalidValue) {
    logger.error(`Unknown --sdk value: '${invalidValue}'`);
  } else {
    logger.error('imgconvert brand requires --sdk <target>');
  }
  process.stderr.write('\n  Valid target:\n');
  process.stderr.write(`    ${chalk.green('--sdk android')}    ${chalk.dim('app/src/main/res/')}\n`);
  process.stderr.write(`\n  ${chalk.dim('(kotlin, react-native, flutter planned for a future release)')}\n\n`);
}
