/**
 * Command line argument parser
 * Handles all CLI argument parsing and validation
 */

const minimist = require('minimist');
const { logger } = require('../utils/logger');

/**
 * Parse command line arguments
 * @param {Array} argv - Command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArguments(argv) {
  // Parse without defaults first to detect user-specified values
  const userArgs = minimist(argv, {
    alias: {
      H: 'help',
      v: 'version',
      q: 'quality',
      b: 'background',
      f: 'format',
      w: 'width',
      h: 'height',
      o: 'output',
      p: 'preset',
      n: 'name',
      d: 'debug'
    },
    boolean: [
      'replace-originals', 'debug', 'help', 'version', 'canvas', 'trim',
      // Modern Alloy branding flags
      'modern', 'adaptive', 'marketplace', 'notification', 'splash',
      'cleanup-legacy', 'aggressive', 'dry-run', 'in-place', 'notes'
    ],
    string: [
      'crop', 'fit', 'position', 'rename',
      // Modern Alloy branding flags
      'bg-color', 'padding', 'ios-padding', 'project', 'monochrome-master'
    ],
    unknown: (arg) => {
      if (arg.startsWith('-')) {
        // Allow negative numbers (they will be validated later)
        if (/^-\d+$/.test(arg)) {
          return true;
        }
        logger.error(`Error: Unknown option '${arg}'`);
        logger.error(`Run 'imgconvert --help' to see available options.`);
        process.exit(1);
      }
      return true;
    }
  });

  // Build args object
  const args = {
    _: userArgs._,
    help: userArgs.help,
    fit: userArgs.fit || null,
    version: userArgs.version,
    name: userArgs.name || null,
    crop: userArgs.crop || null,
    trim: userArgs.trim || false,
    width: userArgs.width || null,
    debug: userArgs.debug || false,
    output: userArgs.output || null,
    preset: userArgs.preset || null,
    height: userArgs.height || null,
    format: userArgs.format || null,
    rename: userArgs.rename || null,
    canvas: userArgs.canvas || false,
    quality: userArgs.quality || null,
    position: userArgs.position || null,
    background: userArgs.background || null,
    'replace-originals': userArgs['replace-originals'] || false,
    // Modern Alloy branding flags — passthrough to the alloy router
    modern: userArgs.modern || false,
    adaptive: userArgs.adaptive || false,
    marketplace: userArgs.marketplace || false,
    notification: userArgs.notification || false,
    splash: userArgs.splash || false,
    'cleanup-legacy': userArgs['cleanup-legacy'] || false,
    aggressive: userArgs.aggressive || false,
    'dry-run': userArgs['dry-run'] || false,
    'in-place': userArgs['in-place'] || false,
    notes: userArgs.notes || false,
    'bg-color': userArgs['bg-color'] || null,
    padding: userArgs.padding || null,
    'ios-padding': userArgs['ios-padding'] || null,
    project: userArgs.project || null,
    'monochrome-master': userArgs['monochrome-master'] || null,
  };

  // Validate numeric arguments
  if (args.height) {
    const height = parseInt(args.height, 10);
    if (isNaN(height) || height <= 0) {
      logger.error(`Error: The height argument ('-h' or '--height') must be a positive integer.`);
      process.exit(1);
    }
    args.height = height;
  }

  if (args.width) {
    const width = parseInt(args.width, 10);
    if (isNaN(width) || width <= 0) {
      logger.error(`Error: The width argument ('-w' or '--width') must be a positive integer.`);
      process.exit(1);
    }
    args.width = width;
  }

  if (args.quality) {
    const quality = parseInt(args.quality, 10);
    if (isNaN(quality) || quality < 1 || quality > 100) {
      logger.error(`Error: The quality argument ('-q' or '--quality') must be between 1 and 100.`);
      process.exit(1);
    }
    args.quality = quality;
  }

  // Validate rename strategy
  if (args.rename) {
    const validStrategies = ['enumerate', 'lowercase', 'replace-spaces'];
    const strategies = args.rename.split(',').map(s => s.trim());

    for (const strategy of strategies) {
      if (!validStrategies.includes(strategy) &&
        !strategy.startsWith('prefix:') &&
        !strategy.startsWith('suffix:')) {
        logger.error(`Error: Invalid rename strategy '${strategy}'. Valid strategies are: ${validStrategies.join(', ')}, prefix:<text>, suffix:<text>`);
        process.exit(1);
      }

      // Validate prefix and suffix have content
      if (strategy.startsWith('prefix:') && strategy.length <= 7) {
        logger.error(`Error: prefix: strategy requires text after the colon (e.g., prefix:thumb_)`);
        process.exit(1);
      }
      if (strategy.startsWith('suffix:') && strategy.length <= 7) {
        logger.error(`Error: suffix: strategy requires text after the colon (e.g., suffix:_optimized)`);
        process.exit(1);
      }
    }
  }

  // Parse preset and subpreset
  if (args.preset && typeof args.preset === 'string' && args.preset.includes(':')) {
    const parts = args.preset.split(':');
    args.presetName = parts[0];
    args.subPreset = parts[1];
  } else if (args.preset && typeof args.preset === 'string') {
    args.presetName = args.preset;
    args.subPreset = null;
  } else if (args.preset && typeof args.preset !== 'string') {
    // If preset is not a string (e.g., boolean, array), it's invalid
    logger.error(`Error: Invalid preset value. Expected a string but got: ${typeof args.preset}`);
    logger.error(`Tip: Use '-p <preset>' or '--preset <preset>' to specify a preset.`);
    process.exit(1);
  } else {
    args.presetName = null;
    args.subPreset = null;
  }

  // Normalize array arguments that might be passed multiple times
  if (Array.isArray(args.fit)) {
    args.fit = args.fit[args.fit.length - 1];
  }
  if (Array.isArray(args.position)) {
    args.position = args.position[args.position.length - 1];
  }
  if (Array.isArray(args.crop)) {
    args.crop = args.crop[args.crop.length - 1];
  }

  // Store original parsed args for precedence checking
  args._userArgs = userArgs;

  return args;
}

/**
 * Apply configuration precedence
 * CLI > Preset > Config > Default
 */
function applyConfigPrecedence(args, config, presets) {
  const userArgs = args._userArgs;
  const preset = args.presetName && presets[args.presetName];

  // Helper function to get value with precedence
  const getValue = (key, defaultValue) => {
    if (userArgs[key] !== undefined && userArgs[key] !== null) return userArgs[key];
    if (preset && preset[key] !== undefined) return preset[key];
    if (config[key] !== undefined) return config[key];
    return defaultValue;
  };

  // Apply precedence for each option
  args.crop = getValue('crop', null);
  args.name = getValue('name', null);
  args.trim = getValue('trim', false);
  args.width = getValue('width', null);
  args.fit = getValue('fit', 'contain');
  args.height = getValue('height', null);
  args.output = getValue('output', null);
  args.rename = getValue('rename', null);
  args.format = getValue('format', null);
  args.quality = getValue('quality', 85);
  args.position = getValue('position', 'center');
  args.background = getValue('background', null);
  args['replace-originals'] = getValue('replace-originals', false);

  // Handle preset source
  if (preset && preset.source) {
    args.presetSource = preset.source;
  } else if (config.source) {
    args.presetSource = config.source;
  }

  return args;
}

module.exports = {
  parseArguments,
  applyConfigPrecedence
};
