'use strict';

const { Command, Option, InvalidArgumentError } = require('commander');
const chalk = require('chalk').default;
const { version } = require('../../package.json');

function parseIntArg(val) {
  const n = Number(val);
  if (!/^[0-9]+$/.test(val) || !Number.isSafeInteger(n) || n <= 0) throw new InvalidArgumentError('Must be a positive integer.');
  return n;
}

const program = new Command();
program.enablePositionalOptions();

program
  .name('imgconvert')
  .version(version, '-v, --version')
  .argument('[source]', 'Image file or directory to process')
  // Format & Quality
  .optionsGroup('Format and quality:')
  .option('-f, --format <format>',     'Output format: jpg|jpeg|png|webp|avif|tiff|gif|all')
  .option('-q, --quality <n>',         'Quality 1-100 (default: 85)', parseIntArg)
  .option('-b, --background <color>',  'Background color (hex, rgb, or named)')
  // Dimensions & Fitting
  .optionsGroup('Dimensions and fit:')
  .option('-w, --width <n>',               'Output width in pixels', parseIntArg)
  .option('--height <n>',              'Output height in pixels', parseIntArg)
  .option('--fit <strategy>',          'Resize strategy: cover|contain|fill|inside|outside')
  .option('--position <pos>',          'Anchor for --fit cover/contain or --canvas')
  .option('--crop <coords>',           'Manual crop coordinates: left,top,width,height')
  .option('--canvas',                  'Resize canvas without scaling (pad if larger, crop if smaller)')
  .option('--no-canvas', 'Disable configured canvas')
  .option('--no-trim', 'Disable configured trim')
  .option('--trim',                    'Auto-trim edge-color/transparent borders')
  // Batch & Naming
  .optionsGroup('Batch and naming:')
  .option('--rename <strategy>',       'Batch rename: enumerate|lowercase|replace-spaces|prefix:X|suffix:X')
  .option('-n, --name <name>',         'Custom output filename, without extension (single file only)')
  // Output
  .optionsGroup('Output:')
  .option('-o, --output <dir>',        'Output directory')
  .option('--in-place', 'Update the input or create a sibling when name/format changes')
  .option('--no-in-place', 'Disable configured in-place')
  .option('--overwrite', 'Allow replacing existing destinations')
  .option('--no-overwrite', 'Disable configured overwrite')
  .option('--concurrency <n>', 'Maximum active inputs (default: min(4, available CPUs))', parseIntArg)
  .option('--replace', 'Alias for --in-place')
  .addOption(new Option('--replace-originals').hideHelp())
  // Presets
  .optionsGroup('Presets:')
  .option('-p, --preset <name>',       'Apply preset: web|print|thumbnail (or custom from config)')
  // Global
  .optionsGroup('General options:')
  .option('-d, --debug',               'Debug mode')
  .action(require('./commands/general'));

// Custom grouped help for the root command only.
// configureHelp is inherited by subcommands, so guard with cmd.parent === null.
// For subcommands, instantiate a plain Help to get Commander's default formatting.
program.configureHelp({
  formatHelp: (cmd, helper) => {
    if (cmd.parent === null) return buildMainHelp();
    // Delegate to Commander's built-in Help for subcommands
    const { Help } = require('commander');
    return new Help().formatHelp(cmd, new Help());
  }
});

// ─── brand subcommand ────────────────────────────────────────────────────────
program
  .command('brand')
  .argument('[master]', 'SVG/PNG/JPEG/WebP master; optional for --cleanup-legacy alone')
  .description('Generate Android branding assets and marketplace artwork')
  .option('--adaptive',                    'Android adaptive icon triplet × 5 densities')
  .option('--marketplace',                 'iTunesConnect (1024²) + Play Store artwork (512²)')
  .option('--notification',                'Notification icons × 5 densities (white on transparent)')
  .option('--splash',                      'Android 12+ splash_icon × 5 densities')
  .option('--bg-color <hex>',              'Background color (default: #FFFFFF)')
  .option('--padding <n>', 'Android padding per side, integer 0-40 (default: 15)')
  .option('--artwork-padding <n>', 'Marketplace padding per side, integer 0-40 (default: 4)')
  .option('--ios-padding <n>', 'Alias for --artwork-padding')
  .option('--overwrite', 'Allow replacing existing destinations')
  .option('--no-overwrite', 'Disable overwrite')
  .option('--monochrome-master <path>',    'Dedicated master for monochrome icon + notification icons')
  .option('--project <path>',              'Project root (default: cwd)')
  .option('-o, --output <dir>',            'Staging directory (default: .ti-branding/)')
  .option('--in-place',                    'Write directly into project; existing files require --overwrite')
  .option('--notes',                       'Print integration notes for generated categories')
  .option('--dry-run',                     'Preview without writing any files')
  .option('--cleanup-legacy',              'Delete legacy Titanium artifacts in project (reads tiapp.xml)')
  .option('--aggressive',                  'With --cleanup-legacy: also remove ldpi folders')
  .option('--sdk <target>',                'Target SDK: android (required except for cleanup)')
  .option('-d, --debug',                   'Debug mode')
  .addHelpText('before', '\n  Generate a mobile branding set (Android res/ + marketplace artwork) from a single SVG or PNG master.\n  --sdk android is required except for cleanup. Without generation selectors, all categories are generated unless cleaning up.\n')
  .addHelpText('after', `
SDK target:
  android       Android project: app/src/main/res/
  Only android is currently implemented.

Android dark mode:
  Handled automatically via ic_launcher_monochrome.png (part of --adaptive).
  Android 13+ tints the monochrome layer from wallpaper + theme.

Examples:
  imgconvert brand logo.svg --sdk android
  imgconvert brand logo.svg --sdk android --bg-color "#0B1326"
  imgconvert brand logo.svg --sdk android --adaptive --notification
  imgconvert brand logo.svg --sdk android --adaptive --bg-color "#0B1326"
  imgconvert brand logo.svg --sdk android --in-place
  imgconvert brand --cleanup-legacy --dry-run
  imgconvert brand logo.svg --sdk android --dry-run
`)
  .action(require('./commands/brand'));

// ─── alloy subcommand ─────────────────────────────────────────────────────────
program
  .command('alloy')
  .argument('[source]', 'Image file or directory; fallback for configured sources')
  .description('Generate legacy Titanium Alloy multi-scale assets (1x/2x/3x + mdpi→xxxhdpi)')
  .option('-o, --output <dir>',  'Output base directory')
  .option('-p, --preset <name>', 'Alloy platform definition to use (default: alloy)')
  .option('--group <name>', 'Select one Alloy group')
  .option('-q, --quality <n>', 'Quality 1-100', parseIntArg)
  .option('-f, --format <format>', 'Output format')
  .option('--overwrite', 'Allow replacing existing destinations')
  .option('--no-overwrite', 'Disable configured overwrite')
  .option('--concurrency <n>', 'Maximum active inputs', parseIntArg)
  .option('-d, --debug',         'Debug mode')
  .addHelpText('after', `
Examples:
  imgconvert alloy icon.png
  imgconvert alloy ./icons
  Configure platform sources/output in presets.alloy; use --group to select one group.
  Source dimensions are treated as 4x on both platforms.
`)
  .action(require('./commands/alloy'));

// ─── config subcommand ────────────────────────────────────────────────────────
const configCmd = program
  .command('config')
  .description('Manage .imgconverter.config.json');

configCmd
  .command('init')
  .description('Create .imgconverter.config.json with defaults and example presets')
  .option('--force', 'Overwrite existing config (otherwise it is kept)')
  .action(require('./commands/config').init);

configCmd
  .command('show')
  .description('Display defaults merged with config as JSON (no command-specific resolution)')
  .action(require('./commands/config').show);

configCmd.action(() => configCmd.help());

// ─── completions subcommand ──────────────────────────────────────────────────
const completionsCmd = program
  .command('completions')
  .argument('[shell]', 'Shell to install for: bash|zsh|fish (auto-detect if omitted)')
  .description('Install shell completion (bash|zsh|fish)')
  .addHelpText('after', `
Examples:
  imgconvert completions              Interactive install (auto-detects shell)
  imgconvert completions zsh          Install for zsh
  imgconvert completions bash         Install for bash
  imgconvert completions fish         Install for fish
  imgconvert completions uninstall    Remove installed completions
  imgconvert completions print zsh    Print completion script to stdout (for scripts/CI)
`)
  .action(async (shell) => {
    const handler = require('./commands/completions');
    if (shell) handler.install(shell);
    else await handler.interactive();
  });

completionsCmd
  .command('print <shell>')
  .description('Print completion script to stdout (for scripts/CI)')
  .action((shell) => {
    require('./commands/completions').printScript(shell);
  });

completionsCmd
  .command('uninstall')
  .description('Remove installed completions from all shells')
  .action(() => {
    require('./commands/completions').uninstall();
  });

// ─── help topic subcommand ────────────────────────────────────────────────────
program
  .command('help [topic]')
  .description('Detailed help on a specific topic')
  .addHelpText('after', '\n  Topics: crop, resize, rename, presets, brand, alloy\n')
  .action(require('./commands/help-cmd'));

// ─── Unknown command recovery ────────────────────────────────────────────────
program.on('command:*', (operands) => {
  const { suggestSimilar } = require('./similarity');
  const known = program.commands.map(c => c.name());
  const suggestion = suggestSimilar(operands[0], known);
  process.stderr.write(
    chalk.red(`\nUnknown command: ${chalk.bold(operands[0])}\n`) +
    (suggestion ? chalk.yellow(`Did you mean: ${chalk.bold(suggestion)}?\n`) : '') +
    `\nRun ${chalk.green('imgconvert --help')} to see available commands.\n\n`
  );
  throw new Error(`Unknown command: ${operands[0]}`);
});

// Commander owns help and completion metadata.
function buildMainHelp() {
  const { Help } = require('commander');
  return new Help().formatHelp(program, new Help()) + '\nRun imgconvert completions to install shell completion.\n';
}
const choices = {
  format: require('../config/defaults').SUPPORTED_FORMATS.concat('all'),
  fit: ['cover','contain','fill','inside','outside'],
  position: ['center','top','bottom','left','right','top-left','top-right','bottom-left','bottom-right','north','south','east','west','northeast','northwest','southeast','southwest'],
  sdk: ['android']
};
function annotate(command) {
  for (const option of command.options) if (choices[option.attributeName()]) option.argChoices = choices[option.attributeName()];
  for (const child of command.commands) annotate(child);
}
annotate(program);
program.command('_complete <kind> [preset]', { hidden: true }).action((kind,preset) => {
  const { loadConfig, getMergedPresets } = require('../config/loader');
  const presets = getMergedPresets(loadConfig());
  const values = kind === 'presets' ? Object.keys(presets) : Object.entries(presets[preset || 'alloy'] || {}).filter(([,value]) => value && typeof value === 'object' && (value.android || value.iphone)).map(([name])=>name);
  console.log(values.join('\n'));
});
module.exports = program;
