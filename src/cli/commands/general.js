'use strict';
const path = require('path');
const { loadConfig, getMergedPresets } = require('../../config/loader');
const { applyConfigPrecedence } = require('../../config/precedence');
const { validateInput } = require('../../utils/validation');
const { logger } = require('../../utils/logger');
const { processImages } = require('../../processors/image');

module.exports = async function generalAction(source, options) {
  const args = buildArgs(source, options);
  const config = loadConfig();
  const presets = getMergedPresets(config);
  const finalArgs = applyConfigPrecedence(args, config, presets);
  if (finalArgs.debug) logger.setDebugMode(true);
  const validation = validateInput(finalArgs, config);
  if (!validation.valid) {
    logger.error(validation.error);
    process.exit(1);
  }
  await processImages(finalArgs, config);
};

function buildArgs(source, opts) {
  return {
    _: source ? [source] : [],
    format:   opts.format   ?? null,
    quality:  opts.quality  ?? null,
    background: opts.background ?? null,
    width:    opts.width    ?? null,
    height:   opts.height   ?? null,
    fit:      opts.fit      ?? null,
    position: opts.position ?? null,
    crop:     opts.crop     ?? null,
    canvas:   opts.canvas   || false,
    trim:     opts.trim     || false,
    rename:   opts.rename   ?? null,
    name:     opts.name     ?? null,
    output:   opts.output   ?? null,
    'replace-originals': opts.replace || opts.replaceOriginals || false,
    preset:     opts.preset ?? null,
    presetName: opts.preset ?? null,
    subPreset:  null,
    debug:      opts.debug  || false,
    // _userArgs: used by applyConfigPrecedence for precedence checking
    // With Commander, opted-in values are always "user-specified"
    // We need a _userArgs object that mirrors what was explicitly set
    _userArgs: buildUserArgs(opts),
  };
}

function buildUserArgs(opts) {
  // Commander only sets opts keys that were explicitly passed by the user
  // Use this to build the _userArgs shape that applyConfigPrecedence expects
  const u = {};
  if (opts.format   !== undefined && opts.format   !== null) u.format   = opts.format;
  if (opts.quality  !== undefined && opts.quality  !== null) u.quality  = opts.quality;
  if (opts.background !== undefined && opts.background !== null) u.background = opts.background;
  if (opts.width    !== undefined && opts.width    !== null) u.width    = opts.width;
  if (opts.height   !== undefined && opts.height   !== null) u.height   = opts.height;
  if (opts.fit      !== undefined && opts.fit      !== null) u.fit      = opts.fit;
  if (opts.position !== undefined && opts.position !== null) u.position = opts.position;
  if (opts.crop     !== undefined && opts.crop     !== null) u.crop     = opts.crop;
  if (opts.canvas   === true) u.canvas   = true;
  if (opts.trim     === true) u.trim     = true;
  if (opts.rename   !== undefined && opts.rename   !== null) u.rename   = opts.rename;
  if (opts.name     !== undefined && opts.name     !== null) u.name     = opts.name;
  if (opts.output   !== undefined && opts.output   !== null) u.output   = opts.output;
  if (opts.replace  === true) u['replace-originals'] = true;
  if (opts.preset   !== undefined && opts.preset   !== null) u.preset   = opts.preset;
  return u;
}
