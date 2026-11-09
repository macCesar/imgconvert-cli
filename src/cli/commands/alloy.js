'use strict';
const { loadConfig, getMergedPresets } = require('../../config/loader');
const { resolveAlloyOptions } = require('../../config/precedence');
const { logger } = require('../../utils/logger');
const { processAlloyLegacy } = require('../../processors/alloy-legacy');
module.exports = async function alloyAction(source, options, command) {
  const config = loadConfig();
  const explicit = Object.fromEntries(Object.entries(options).filter(([k]) => command.getOptionValueSource(k) === 'cli'));
  const args = resolveAlloyOptions({ _: source ? [source] : [], presetName: options.preset || 'alloy', group: options.group, debug: options.debug, _userArgs: explicit }, config, getMergedPresets(config));
  logger.setDebugMode(Boolean(args.debug));
  const result = await processAlloyLegacy(args, config);
  process.exitCode = result.exitCode;
};
