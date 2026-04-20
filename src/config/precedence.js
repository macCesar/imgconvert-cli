'use strict';

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

module.exports = { applyConfigPrecedence };
