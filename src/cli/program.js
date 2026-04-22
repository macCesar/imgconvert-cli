'use strict';

const { Command, Option, InvalidArgumentError } = require('commander');
const chalk = require('chalk');
const { version } = require('../../package.json');

function parseIntArg(val) {
  const n = parseInt(val, 10);
  if (isNaN(n) || n <= 0) throw new InvalidArgumentError('Must be a positive integer.');
  return n;
}

const program = new Command();
program.enablePositionalOptions();

program
  .name('imgconvert')
  .version(version, '-v, --version')
  .argument('[source]', 'Image file or directory to process')
  // Format & Quality
  .option('-f, --format <format>',     'Output format: jpeg|png|webp|avif|tiff|gif|all')
  .option('-q, --quality <n>',         'Quality 1-100 (default: 85)', parseIntArg)
  .option('-b, --background <color>',  'Background color (hex, rgb, or named)')
  // Dimensions & Fitting
  .option('--width <n>',               'Output width in pixels', parseIntArg)
  .option('--height <n>',              'Output height in pixels', parseIntArg)
  .option('--fit <strategy>',          'Resize strategy: cover|contain|fill|inside|outside')
  .option('--position <pos>',          'Crop anchor: center|top|bottom|left|right|top-left|...')
  .option('--crop <coords>',           'Manual crop: left,top,width,height')
  .option('--canvas',                  'Extend canvas instead of resizing (adds padding)')
  .option('--trim',                    'Auto-remove transparent borders')
  // Batch & Naming
  .option('--rename <strategy>',       'Batch rename: enumerate|lowercase|replace-spaces|prefix:X|suffix:X')
  .option('-n, --name <name>',         'Custom output filename, without extension (single file only)')
  // Output
  .option('-o, --output <dir>',        'Output directory')
  .option('--replace',                 'Replace original files (no copy)')
  .addOption(new Option('--replace-originals').hideHelp())
  // Presets
  .option('-p, --preset <name>',       'Apply preset: web|print|thumbnail (or custom from config)')
  // Global
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
  .argument('[master]', 'SVG or PNG master (min 1024x1024); optional if using --cleanup-legacy alone')
  .description('Generate mobile app icons and branding assets from a master SVG/PNG')
  .option('--adaptive',                    'Android adaptive icon triplet × 5 densities')
  .option('--marketplace',                 'iTunesConnect (1024²) + Play Store artwork (512²)')
  .option('--notification',                'Notification icons × 5 densities (white on transparent)')
  .option('--splash',                      'Android 12+ splash_icon × 5 densities')
  .option('--bg-color <hex>',              'Background color (default: #FFFFFF)')
  .option('--padding <n>',                 'Android safe-zone % (range 12-20, default: 15)', parseIntArg)
  .option('--ios-padding <n>',             'iOS padding 0-40 (default: 4)', parseIntArg)
  .option('--monochrome-master <path>',    'Dedicated master for monochrome icon + notification icons')
  .option('--project <path>',              'Project root (default: cwd)')
  .option('-o, --output <dir>',            'Staging directory (default: .ti-branding/)')
  .option('--in-place',                    'Write directly into project (OVERWRITES existing icons)')
  .option('--notes',                       'Print full tiapp.xml snippets + tuning guide')
  .option('--dry-run',                     'Preview without writing any files')
  .option('--cleanup-legacy',              'Remove legacy branding artifacts (reads tiapp.xml)')
  .option('--aggressive',                  'With --cleanup-legacy: also remove ldpi folders')
  .option('--sdk <target>',                'Target SDK: android|kotlin|react-native|flutter (required)')
  .option('-d, --debug',                   'Debug mode')
  .addHelpText('before', '\n  Generate a mobile branding set (Android res/ + marketplace artwork) from a single SVG or PNG master.\n  --sdk is required. No sub-flags = kitchen-sink (adaptive + marketplace + notification + splash).\n')
  .addHelpText('after', `
SDK targets (required):
  android       Android project — app/src/main/res/mipmap-*/
  kotlin        Alias for android
  react-native  React Native — android/app/src/main/res/ (iOS xcassets: coming soon)
  flutter       Flutter — android/app/src/main/res/ (iOS xcassets: coming soon)

Android dark mode:
  Handled automatically via ic_launcher_monochrome.png (part of --adaptive).
  Android 13+ tints the monochrome layer from wallpaper + theme.

Examples:
  imgconvert brand logo.svg --sdk android
  imgconvert brand logo.svg --sdk kotlin --bg-color "#0B1326"
  imgconvert brand logo.svg --sdk react-native --adaptive --notification
  imgconvert brand logo.svg --sdk flutter --adaptive --bg-color "#0B1326"
  imgconvert brand logo.svg --sdk android --in-place
  imgconvert brand --cleanup-legacy --dry-run
  imgconvert brand logo.svg --sdk android --dry-run
`)
  .action(require('./commands/brand'));

// ─── alloy subcommand ─────────────────────────────────────────────────────────
program
  .command('alloy')
  .argument('<source>', 'Image file or directory')
  .description('Generate legacy Titanium Alloy multi-scale assets (1x/2x/3x + mdpi→xxxhdpi)')
  .option('-o, --output <dir>',  'Output directory')
  .option('-p, --preset <name>', 'Alloy preset key from config file')
  .option('-d, --debug',         'Debug mode')
  .addHelpText('after', `
Examples:
  imgconvert alloy icon.png
  imgconvert alloy icon.png -p my-alloy-config
`)
  .action(require('./commands/alloy'));

// ─── config subcommand ────────────────────────────────────────────────────────
const configCmd = program
  .command('config')
  .description('Manage .imgconverter.config.json');

configCmd
  .command('init')
  .description('Create .imgconverter.config.json with defaults and example presets')
  .option('--force', 'Overwrite existing config without prompting')
  .action(require('./commands/config').init);

configCmd
  .command('show')
  .description('Display the current resolved configuration as JSON')
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
  process.exit(1);
});

// ─── Custom grouped help builder ─────────────────────────────────────────────
function buildMainHelp() {
  const g = chalk.green;
  const y = chalk.yellow;
  const b = chalk.bold;

  return [
    '',
    `  ${b('imgconvert')} v${version} — Image compression, conversion, and resizing`,
    '',
    `${b('USAGE')}`,
    `  ${g('imgconvert')} [source] [options]`,
    `  ${g('imgconvert brand')} <master.svg> [options]`,
    `  ${g('imgconvert alloy')} <source> [options]`,
    `  ${g('imgconvert config')} init|show`,
    `  ${g('imgconvert completions')} [shell]`,
    `  ${g('imgconvert help')} [topic]`,
    '',
    `${b('FORMAT & QUALITY')}`,
    `  ${g('-f, --format <format>')}     Output format: ${y('jpeg|png|webp|avif|tiff|gif|all')}`,
    `  ${g('-q, --quality <n>')}         Quality 1-100 ${y('(default: 85)')}`,
    `  ${g('-b, --background <color>')}  Background color (hex, rgb, or named)`,
    '',
    `${b('DIMENSIONS & FITTING')}`,
    `  ${g('--width <n>')}               Output width in pixels`,
    `  ${g('--height <n>')}              Output height in pixels`,
    `  ${g('--fit <strategy>')}          Resize strategy: ${y('cover|contain|fill|inside|outside')}`,
    `  ${g('--position <pos>')}          Crop anchor: ${y('center|top|bottom|left|right|top-left|...')}`,
    `  ${g('--crop <coords>')}           Manual crop: ${y('left,top,width,height')}`,
    `  ${g('--canvas')}                  Extend canvas instead of resizing (adds padding)`,
    `  ${g('--trim')}                    Auto-remove transparent borders`,
    '',
    `${b('BATCH & NAMING')}`,
    `  ${g('--rename <strategy>')}       ${y('enumerate|lowercase|replace-spaces|prefix:X|suffix:X')}`,
    `  ${g('-n, --name <name>')}         Custom output filename (single file, no extension)`,
    '',
    `${b('OUTPUT')}`,
    `  ${g('-o, --output <dir>')}        Output directory`,
    `  ${g('--replace')}                 Replace original files (no copy)`,
    '',
    `${b('PRESETS')}`,
    `  ${g('-p, --preset <name>')}       Apply preset: ${y('web|print|thumbnail')} (or custom from config)`,
    '',
    `${b('GLOBAL')}`,
    `  ${g('-d, --debug')}               Debug mode`,
    `  ${g('-v, --version')}             Show version`,
    `  ${g('-h, --help')}                Show this help`,
    '',
    `${b('SHELL INTEGRATION')}`,
    `  ${g('imgconvert completions')}              Interactive install (auto-detects shell)`,
    `  ${g('imgconvert completions')} ${y('bash|zsh|fish')}  Install for a specific shell`,
    `  ${g('imgconvert completions uninstall')}    Remove installed completions`,
    '',
    `${b('EXAMPLES')}`,
    `  ${g('imgconvert')} ./photos -f webp -q 85`,
    `  ${g('imgconvert')} banner.png --width 1200 --height 400 --fit cover`,
    `  ${g('imgconvert')} ./photos --rename enumerate,lowercase`,
    `  ${g('imgconvert brand')} logo.svg --bg-color "#0B1326"`,
    `  ${g('imgconvert alloy')} icon.png`,
    `  ${g('imgconvert config')} init`,
    '',
    `  Run ${g('imgconvert <command> --help')} for subcommand details.`,
    `  Run ${g('imgconvert help <topic>')} for topic details: ${y('crop|resize|rename|presets|brand|alloy')}`,
    '',
  ].join('\n');
}

module.exports = program;
