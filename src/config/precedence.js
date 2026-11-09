'use strict';
const { defaultConfig, SUPPORTED_FORMATS } = require('./defaults');
const { parseHexToRgba, normalizePositionName } = require('./values');
const defaults = defaultConfig;
const aliases = ['inPlace', 'in-place', 'replace', 'replaceOriginals', 'replace-originals'];
function normalizeLayer(layer = {}) {
  if (!layer || typeof layer !== 'object' || Array.isArray(layer)) throw new Error('Configuration layers and presets must be objects');
  const result = Object.fromEntries(Object.entries(layer).filter(([, v]) => v != null));
  const present = aliases.filter(k => result[k] != null);
  if (present.some(k => result[k] !== result[present[0]])) throw new Error('Contradictory in-place aliases');
  if (present.length) result.inPlace = result[present[0]];
  for (const k of aliases.slice(1)) delete result[k];
  return result;
}
function validateOptions(args) {
  for (const key of ['source','output','name','rename','background','fit','position','format']) {
    if (args[key] != null && typeof args[key] !== 'string') throw new Error(`${key} must be a string`);
  }
  for (const key of ['width', 'height', 'quality', 'concurrency', 'padding', 'iosPadding', 'artworkPadding']) {
    if (args[key] == null) continue;
    const min = ['padding', 'iosPadding', 'artworkPadding'].includes(key) ? 0 : 1;
    const max = key === 'quality' ? 100 : min === 0 ? 40 : Number.MAX_SAFE_INTEGER;
    if (!/^[0-9]+$/.test(String(args[key])) || !Number.isSafeInteger(Number(args[key])) || Number(args[key]) < min || Number(args[key]) > max) throw new Error(`${key} must be an integer between ${min} and ${max}`);
    args[key] = Number(args[key]);
  }
  for (const key of ['trim', 'canvas', 'inPlace', 'overwrite']) if (args[key] != null && typeof args[key] !== 'boolean') throw new Error(`${key} must be boolean`);
  if (args.format && ![...SUPPORTED_FORMATS, 'all'].includes(args.format)) throw new Error(`Unsupported format: ${args.format}`);
  if (args.fit && !['contain','cover','fill','inside','outside'].includes(args.fit)) throw new Error(`Invalid fit strategy: ${args.fit}`);
  if (args.background && !parseHexToRgba(args.background)) throw new Error(`Invalid background color: ${args.background}`);
  if (args.position) {
    const normalized = normalizePositionName(args.position);
    const positions = { centre:'center', north:'top', south:'bottom', west:'left', east:'right', 'north west':'top left', 'north east':'top right', 'south west':'bottom left', 'south east':'bottom right', northwest:'top left', northeast:'top right', southwest:'bottom left', southeast:'bottom right', 'left top':'top left', 'right top':'top right', 'left bottom':'bottom left', 'right bottom':'bottom right' };
    args.position = positions[normalized] || normalized;
    if (!['center','top','bottom','left','right','top left','top right','bottom left','bottom right'].includes(args.position)) throw new Error(`Invalid position: ${args.position}`);
  }
  if (args.crop != null) {
    const values = String(args.crop).split(',');
    if (values.length !== 4 || values.some(v => !/^[0-9]+$/.test(v.trim()) || !Number.isSafeInteger(Number(v))) || Number(values[2]) <= 0 || Number(values[3]) <= 0) throw new Error('Invalid crop coordinates. Use integer left,top,width,height');
    args.crop = values.map(Number).join(',');
  }
  if (args.output && args.inPlace) throw new Error('--output cannot be combined with --in-place/--replace');
  return args;
}
function applyConfigPrecedence(args, config = {}, presets = {}) {
  const name = args.presetName;
  if (name && !Object.hasOwn(presets, name)) throw new Error(`Unknown preset: ${name}`);
  if (name && (!presets[name] || typeof presets[name] !== 'object' || Array.isArray(presets[name]))) throw new Error(`Invalid preset definition: ${name}`);
  const layers = [normalizeLayer(defaults), normalizeLayer(config._raw || config), normalizeLayer(name ? presets[name] : {}), normalizeLayer(args._userArgs || {})];
  const origins = {};
  const effective = {};
  layers.forEach((layer, i) => { for (const [key, value] of Object.entries(layer)) { effective[key] = value; origins[key] = ['default','config','preset','CLI'][i]; } });
  delete effective.presets;
  return validateOptions({ ...args, ...effective, presetSource: effective.source, _origins: origins });
}
function resolveAlloyOptions(args, config, presets) {
  const effective = applyConfigPrecedence(args, config, presets);
  const preset = presets[args.presetName || 'alloy'];
  const legacy = Boolean(preset.android || preset.iphone);
  const groups = legacy ? [['',preset]] : Object.entries(preset).filter(([,g]) => g && typeof g === 'object' && (g.android || g.iphone));
  const selected = args.group ? groups.filter(([name]) => name === args.group) : groups;
  if (!selected.length) throw new Error(`Alloy group not found: ${args.group || '(no platform definitions)'}`);
  effective.platforms = [];
  for (const [groupName, group] of selected) {
    for (const platform of ['android','iphone']) {
      const settings = group[platform];
      if (settings == null) continue;
      const combined = { ...normalizeLayer(preset), ...normalizeLayer(group), ...normalizeLayer(settings) };
      const resolved = applyConfigPrecedence({ presetName:'selected', _userArgs:args._userArgs },config,{selected:combined});
      effective.platforms.push({ groupName, platform, settings, options:resolved,
        source:settings.source || group.source || preset.source || args._[0] || config.source });
    }
  }
  return effective;
}
module.exports = { applyConfigPrecedence, resolveAlloyOptions, validateOptions, normalizeLayer };
