'use strict';
const { loadConfig, getMergedPresets } = require('../../config/loader');
const { applyConfigPrecedence } = require('../../config/precedence');
const { validateInput } = require('../../utils/validation');
const { logger } = require('../../utils/logger');
const { processImages } = require('../../processors/image');
module.exports = async function generalAction(source, options, command) {
  const config = loadConfig();
  const explicit = Object.fromEntries(Object.entries(options).filter(([k]) => command.getOptionValueSource(k) === 'cli'));
  const args = applyConfigPrecedence({ _: source ? [source] : [], presetName: options.preset, debug: options.debug, _userArgs: explicit }, config, getMergedPresets(config));
  logger.setDebugMode(Boolean(args.debug));
  if (args.debug) logger.debug(JSON.stringify({ effective: args, origins: args._origins }, null, 2));
  const validation = validateInput(args, config);
  if (!validation.valid) throw new Error(validation.error);
  const result = await processImages(args, config);
  process.exitCode = result.exitCode;
};
