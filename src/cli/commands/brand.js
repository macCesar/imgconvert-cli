'use strict';
const path = require('path');
const { runModern } = require('../../processors/alloy-modern');
const { logger } = require('../../utils/logger');

module.exports = async function brandAction(master, options) {
  if (options.debug) logger.setDebugMode(true);

  const anySubFlag = options.adaptive || options.marketplace || options.notification || options.splash;
  const kitchenSink = !anySubFlag && !options.cleanupLegacy;

  try {
    await runModern({
      master: master ? path.resolve(master) : null,
      monochromeMaster:  options.monochromeMaster ? path.resolve(options.monochromeMaster) : null,
      bgColor:           options.bgColor || '#FFFFFF',
      bgColorExplicit:   Boolean(options.bgColor),
      padding:           options.padding   ?? 20,
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
    });
  } catch (err) {
    logger.error(err.message);
    if (options.debug) console.error(err.stack);
    process.exit(1);
  }
};
