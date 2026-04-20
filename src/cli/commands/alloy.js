'use strict';
const { loadConfig, getMergedPresets } = require('../../config/loader');
const { applyConfigPrecedence } = require('../../config/precedence');
const { validateInput } = require('../../utils/validation');
const { logger } = require('../../utils/logger');
const { processAlloyLegacy } = require('../../processors/alloy-legacy');

module.exports = async function alloyAction(source, options) {
  if (options.debug) logger.setDebugMode(true);

  // Build args in the shape alloy-legacy.js expects
  const args = {
    _: [source],
    output:     options.output ?? null,
    preset:     options.preset ?? 'alloy',
    presetName: options.preset ?? 'alloy',
    subPreset:  null,
    debug:      options.debug || false,
    format:     null,
    quality:    null,
    width:      null,
    height:     null,
    fit:        null,
    position:   null,
    crop:       null,
    canvas:     false,
    trim:       false,
    rename:     null,
    name:       null,
    background: null,
    'replace-originals': false,
    _userArgs: {},
  };

  const config = loadConfig();
  const presets = getMergedPresets(config);
  const finalArgs = applyConfigPrecedence(args, config, presets);

  const validation = validateInput(finalArgs, config);
  if (!validation.valid) {
    logger.error(validation.error);
    process.exit(1);
  }

  try {
    await processAlloyLegacy(finalArgs, config);
  } catch (err) {
    logger.error(err.message);
    if (options.debug) console.error(err.stack);
    process.exit(1);
  }
};
